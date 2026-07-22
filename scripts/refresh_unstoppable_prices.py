#!/usr/bin/env python3
"""Fetch Unstoppable Domains list prices from their public API and merge
into src/data/tld-price-comparison.json.

Source (no API key):
  GET https://api.unstoppabledomains.com/api/pricing/dns/tlds

Uses STANDARD listPrice (usdCents) — not promo/subTotal-only figures.
"""
from __future__ import annotations

import json
import statistics
import time
from pathlib import Path
from typing import Any

import cloudscraper

ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = ROOT / "src/data/tld-price-comparison.json"
UD_CACHE_PATH = ROOT / "data" / "unstoppable-dns-prices.json"
UD_API = "https://api.unstoppabledomains.com/api/pricing/dns/tlds"
REGISTRAR = "Unstoppable Domains"

TOP_ORDER = [
    "Spaceship",
    "GoDaddy",
    "Namecheap",
    "Porkbun",
    "Dynadot",
    "NameSilo",
    "Sav",
    "Cloudflare",
    "Hostinger",
    "Unstoppable Domains",
]


def cents_cell(cents: int | float | None) -> dict[str, Any]:
    if cents is None:
        return {"value": None, "display": None, "hasPromo": False}
    value = round(float(cents) / 100.0, 2)
    return {"value": value, "display": f"${value:.2f}", "hasPromo": False}


def price_field(block: dict[str, Any] | None) -> dict[str, Any]:
    if not block:
        return cents_cell(None)
    # Prefer listPrice (regular). Fall back to subTotal only if list missing.
    list_price = (block.get("listPrice") or {}).get("usdCents")
    if list_price is not None:
        return cents_cell(list_price)
    sub = (block.get("subTotal") or {}).get("usdCents")
    return cents_cell(sub)


def make_offer(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "registrar": REGISTRAR,
        "url": "https://unstoppabledomains.com/search",
        "registration": price_field(row.get("registration")),
        "renewal": price_field(row.get("renewal")),
        "transfer": price_field(row.get("transfer")),
        "whoisPrivacy": cents_cell(0),  # typically bundled / N/A for UD DNS
        "taxAndFees": "None",
        "features": ["DNS", "Web3 wallet"],
        "rating": None,
        "reviewCount": None,
        "payments": ["Credit Card", "Crypto"],
        "score": None,
        "source": "unstoppable-api",
    }


def summarize_prices(offers: list[dict[str, Any]], key: str) -> dict[str, Any]:
    valid = [o for o in offers if o.get(key, {}).get("value") is not None]
    if not valid:
        return {"registrar": None, "price": None, "value": None}
    best = min(valid, key=lambda o: o[key]["value"])
    return {
        "registrar": best["registrar"],
        "price": best[key]["display"],
        "value": best[key]["value"],
    }


def summarize_best_value(offers: list[dict[str, Any]]) -> dict[str, Any]:
    valid = [o for o in offers if o.get("score") is not None]
    if not valid:
        return {"registrar": None, "score": None, "registration": None}
    best = max(valid, key=lambda o: o["score"])
    return {
        "registrar": best["registrar"],
        "score": best["score"],
        "registration": best.get("registration", {}).get("display"),
    }


def safe_mean(values: list[float]) -> float | None:
    return round(sum(values) / len(values), 2) if values else None


def safe_median(values: list[float]) -> float | None:
    return round(float(statistics.median(values)), 2) if values else None


def recompute_entry_stats(entry: dict[str, Any]) -> None:
    offers = entry.get("registrars") or []
    reg = [o["registration"]["value"] for o in offers if o.get("registration", {}).get("value") is not None]
    ren = [o["renewal"]["value"] for o in offers if o.get("renewal", {}).get("value") is not None]
    xfr = [o["transfer"]["value"] for o in offers if o.get("transfer", {}).get("value") is not None]
    entry["pricingSummary"] = {
        "Wholesale Prices": {"registration": None, "renewal": None, "transfer": None},
        "Average Registrar Prices": {
            "registration": safe_mean(reg),
            "renewal": safe_mean(ren),
            "transfer": safe_mean(xfr),
        },
        "Median Registrar Prices": {
            "registration": safe_median(reg),
            "renewal": safe_median(ren),
            "transfer": safe_median(xfr),
        },
    }
    entry["cheapestRegistration"] = summarize_prices(offers, "registration")
    entry["cheapestRenewal"] = summarize_prices(offers, "renewal")
    entry["cheapestTransfer"] = summarize_prices(offers, "transfer")
    entry["bestValue"] = summarize_best_value(offers)


def order_offers(offers: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_name = {o["registrar"]: o for o in offers}
    return [by_name[name] for name in TOP_ORDER if name in by_name]


def fetch_ud_prices() -> list[dict[str, Any]]:
    scraper = cloudscraper.create_scraper(
        browser={"browser": "chrome", "platform": "darwin", "mobile": False}
    )
    response = scraper.get(
        UD_API,
        timeout=45,
        headers={
            "Accept": "application/json",
            "User-Agent": "DomainDiscovery/1.0 (+price-compare)",
        },
    )
    response.raise_for_status()
    payload = response.json()
    prices = payload.get("prices") or []
    if not prices:
        raise RuntimeError("Unstoppable pricing API returned no prices")
    return prices


def main() -> None:
    print(f"Fetching {UD_API} …")
    rows = fetch_ud_prices()
    print(f"  {len(rows)} TLDs from Unstoppable Domains")

    UD_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    UD_CACHE_PATH.write_text(
        json.dumps(
            {
                "fetchedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "source": UD_API,
                "count": len(rows),
                "prices": rows,
            },
            ensure_ascii=True,
            separators=(",", ":"),
        )
    )
    print(f"  cached → {UD_CACHE_PATH}")

    if not DATASET_PATH.exists():
        raise SystemExit(f"Missing dataset {DATASET_PATH}")

    data = json.loads(DATASET_PATH.read_text())
    by_tld = {e["tld"].lower(): e for e in data.get("extensions") or []}

    ud_by_name = {str(r.get("name", "")).lower(): r for r in rows}
    updated = 0
    created = 0

    for name, row in ud_by_name.items():
        tld = f".{name}"
        offer = make_offer(row)
        entry = by_tld.get(tld)

        if entry is None:
            entry = {
                "tld": tld,
                "sourceUrl": f"https://unstoppabledomains.com/search?searchTerm=example.{name}",
                "registrarCount": 1,
                "pricingSummary": {},
                "cheapestRegistration": {},
                "cheapestRenewal": {},
                "cheapestTransfer": {},
                "bestValue": {},
                "registrars": [offer],
            }
            recompute_entry_stats(entry)
            by_tld[tld] = entry
            created += 1
            continue

        offers = [o for o in (entry.get("registrars") or []) if o.get("registrar") != REGISTRAR]
        offers.append(offer)
        entry["registrars"] = order_offers(offers)
        recompute_entry_stats(entry)
        # keep existing registrarCount as full market count when known
        if not entry.get("registrarCount"):
            entry["registrarCount"] = len(entry["registrars"])
        updated += 1

    # Preserve a stable-ish order: existing order first, then new UD-only TLDs alpha
    existing_order = [e["tld"].lower() for e in data.get("extensions") or []]
    extensions: list[dict[str, Any]] = []
    seen: set[str] = set()
    for tld in existing_order:
        if tld in by_tld:
            extensions.append(by_tld[tld])
            seen.add(tld)
    for tld in sorted(by_tld.keys()):
        if tld not in seen:
            extensions.append(by_tld[tld])

    data["extensions"] = extensions
    data["extensionCount"] = len(extensions)
    data["generatedAt"] = time.strftime("%Y-%m-%d")
    data["unstoppableMergedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    data["unstoppableSource"] = UD_API
    data["unstoppableTldCount"] = len(rows)

    DATASET_PATH.write_text(json.dumps(data, ensure_ascii=True, separators=(",", ":")))
    print(f"Updated {DATASET_PATH}")
    print(f"  Unstoppable offers merged into existing TLDs: {updated}")
    print(f"  New TLD entries created from UD-only list: {created}")
    print(f"  Total extensions now: {len(extensions)}")


if __name__ == "__main__":
    main()
