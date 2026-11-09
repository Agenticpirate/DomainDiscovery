#!/usr/bin/env python3
"""Refresh registrar pricing from tld-list.com into src/data/tld-price-comparison.json.

Pulls the CURRENT listed registration / renewal / transfer prices (promos included) for the
tracked registrars via the Next.js server action `getTldRegistrars`. When a promo applies,
`value` is the promo price and `regularValue` is the regular price, with the promo code,
end date and terms (new customers only, per-customer limit, minimum years) alongside.

Politeness: tld-list.com asks for `Crawl-delay: 5` in robots.txt, so requests are spaced at
least --delay seconds apart across all workers (default 5). Use --output to write to a
staging file so a half-finished run never replaces the live dataset.

By default discovers 1,100 popular+alphabetical TLD slugs from
https://tld-list.com/tlds-from-a-z and refreshes all of them.
"""
from __future__ import annotations

import argparse
import json
import re
import statistics
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

import cloudscraper

ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = ROOT / "src/data/tld-price-comparison.json"

# Primary comparison set (logos + matrix columns in the UI).
TOP_REGISTRARS = [
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

# Extra registrars often present on specialty / ccTLD pages when the top 10 are absent.
SECONDARY_REGISTRARS = [
    "Gandi.net",
    "101domain",
    "EuroDNS",
    "INWX",
    "OVHcloud",
    "Hover",
    "Name.com",
    "Marcaria International",
    "Regery",
    "Netim",
    "Blacknight",
    "Hexonet",
    "OnlyDomains",
    "MrDomain",
    "Directnic",
]

# Preferred display order when selecting offers (primary first, then secondary).
PREFERRED_REGISTRARS = TOP_REGISTRARS + SECONDARY_REGISTRARS

REGISTRAR_ID_MAP = {
    "spaceship": "Spaceship",
    "godaddy": "GoDaddy",
    "namecheap": "Namecheap",
    "porkbun": "Porkbun",
    "dynadot": "Dynadot",
    "namesilo": "NameSilo",
    "sav": "Sav",
    "cloudflare": "Cloudflare",
    "hostinger": "Hostinger",
    "unstoppable": "Unstoppable Domains",
    "unstoppabledomains": "Unstoppable Domains",
    "unstoppable-domains": "Unstoppable Domains",
    "gandi": "Gandi.net",
    "101domain": "101domain",
    "eurodns": "EuroDNS",
    "inwx": "INWX",
    "ovh": "OVHcloud",
    "ovhcloud": "OVHcloud",
    "hover": "Hover",
    "name.com": "Name.com",
    "namecom": "Name.com",
    "marcaria": "Marcaria International",
    "regery": "Regery",
    "netim": "Netim",
    "blacknight": "Blacknight",
    "hexonet": "Hexonet",
    "onlydomains": "OnlyDomains",
    "mrdomain": "MrDomain",
    "directnic": "Directnic",
}

PAYMENT_LABELS = {
    "cc": "Credit Card",
    "paypal": "Paypal",
    "bitcoin": "Bitcoin",
    "googlewallet": "Google Pay",
    "applepay": "Apple Pay",
    "alipay": "Alipay",
    "skrill": "Skrill",
    "banktransfer": "Bank Transfer",
    "check": "Check",
    "moneyorder": "Money Order",
    "dwolla": "Dwolla",
}

FEATURE_LABELS = {
    "dns": "DNS",
    "whois-privacy": "WHOIS Privacy",
    "email-forward": "Email Forwarding",
    "email-account": "Email Account",
    "ssl-cert": "SSL Certificate",
}

# High-signal TLDs floated to the top of the dataset.
PRIORITY_SLUGS = [
    "com", "net", "org", "io", "ai", "co", "xyz", "in", "app", "dev", "shop", "store",
    "online", "site", "info", "biz", "us", "me", "tv", "cc", "ws", "mobi", "pro", "asia",
    "top", "vip", "club", "website", "space", "tech", "fun", "press", "news", "live",
    "today", "world", "life", "one", "icu", "digital", "software", "cloud", "network",
    "systems", "email", "domains", "link", "click", "support", "tools", "page", "blog",
    "video", "chat", "wiki", "stream", "cam", "uk", "co.uk", "de", "ca", "au", "eu",
    "nl", "fr", "it", "es", "ch", "at", "be", "se", "no", "fi", "dk", "pl", "pt", "ie",
    "cz", "ro", "jp", "kr", "cn", "hk", "sg", "id", "my", "ph", "tw", "nz", "mx", "cl",
    "pe", "so", "to", "gg", "ly", "fm", "am", "vc", "la", "sh", "pw", "ng", "za", "br",
    "co.za", "com.au", "com.br", "co.in", "co.jp", "co.kr", "co.nz", "agency", "solutions",
    "services", "company", "business", "center", "group", "media", "studio", "design",
    "art", "photography", "photo", "pics", "gallery", "graphics", "marketing", "consulting",
    "finance", "capital", "fund", "money", "cash", "credit", "loan", "insure", "insurance",
    "health", "care", "clinic", "doctor", "dental", "fitness", "bio", "science", "edu",
    "education", "school", "academy", "university", "college", "training", "study", "law",
    "lawyer", "legal", "attorney", "accountants", "realestate", "realty", "homes", "house",
    "properties", "property", "rent", "rentals", "land", "construction", "technology",
    "computer", "code", "codes", "data", "games", "games", "play", "bet", "casino", "win",
    "music", "band", "audio", "tube", "movie", "film", "show", "radio", "shopping", "sale",
    "deals", "market", "marketplace", "boutique", "fashion", "clothing", "shoes", "watch",
    "jewelry", "beauty", "hair", "food", "restaurant", "cafe", "coffee", "kitchen", "pizza",
    "wine", "beer", "bar", "delivery", "travel", "tours", "vacation", "holiday", "hotel",
    "car", "cars", "auto", "taxi", "boats", "sports", "soccer", "football", "golf", "fit",
    "gym", "green", "eco", "energy", "solar", "earth", "organic", "garden", "farm", "pet",
    "dog", "cat", "city", "town", "place", "global", "international", "family", "kids",
    "baby", "love", "dating", "wedding", "lifestyle", "living", "style", "news", "report",
    "guide", "tips", "help", "community", "social", "security", "protection", "safe",
    "trust", "secure", "hosting", "host", "server", "mail", "mobile", "phone", "work",
    "jobs", "careers", "team", "management", "partners",
]

_throttle_lock = threading.Lock()
_last_request_at = 0.0
MIN_INTERVAL = 5.0


def throttle() -> None:
    """Block until MIN_INTERVAL seconds have passed since the previous request (all threads)."""
    global _last_request_at
    with _throttle_lock:
        wait = _last_request_at + MIN_INTERVAL - time.monotonic()
        if wait > 0:
            time.sleep(wait)
        _last_request_at = time.monotonic()


ACTION_ID_FALLBACK = "40debe317f2d55915bb9bf58c0c8d4e6186381d245"
ACTION_ID_RE = re.compile(
    r'createServerReference\)\("([0-9a-f]{40,})"[^)]*?,"getTldRegistrars"\)'
)
ACTION_ID_LOOSE_RE = re.compile(
    r'"([0-9a-f]{40,})"[^"]{0,160}getTldRegistrars'
)


def make_scraper() -> cloudscraper.CloudScraper:
    return cloudscraper.create_scraper(
        browser={"browser": "chrome", "platform": "darwin", "mobile": False}
    )


def discover_action_id(scraper: cloudscraper.CloudScraper) -> str:
    try:
        throttle()
        html = scraper.get("https://tld-list.com/tld/com", timeout=45).text
        chunk_paths = list(dict.fromkeys(re.findall(r"/_next/static/chunks/[^\"'\\]+\.js", html)))
        for path in chunk_paths:
            try:
                throttle()
                js = scraper.get(f"https://tld-list.com{path}", timeout=30).text
            except Exception:  # noqa: BLE001
                continue
            if "getTldRegistrars" not in js:
                continue
            match = ACTION_ID_RE.search(js)
            if match:
                return match.group(1)
            loose = re.search(r'"([0-9a-f]{40,})"[^"]{0,120}getTldRegistrars', js)
            if loose:
                return loose.group(1)
    except Exception as exc:  # noqa: BLE001
        print(f"  (action id discovery failed: {exc}; using fallback)")
    return ACTION_ID_FALLBACK


def discover_tld_slugs(scraper: cloudscraper.CloudScraper, limit: int | None = None) -> list[str]:
    """Discover every TLD slug listed on tld-list.com (A–Z index).

    When limit is None or <= 0, returns the full catalog (~3,000+).
    Priority popular TLDs are ordered first, then apex, then multi-level.
    """
    throttle()
    resp = scraper.get("https://tld-list.com/tlds-from-a-z", timeout=90)
    if resp.status_code != 200:
        raise RuntimeError(
            f"A-Z index returned HTTP {resp.status_code} (bot challenge?). "
            "Not working around it; retry later or use --slugs-from-dataset."
        )
    html = resp.text
    found = re.findall(r'href="/tld/([a-z0-9.-]+)"', html)
    available = list(dict.fromkeys(found))
    available_set = set(available)

    ordered: list[str] = []
    seen: set[str] = set()
    for slug in PRIORITY_SLUGS:
        if slug in available_set and slug not in seen:
            ordered.append(slug)
            seen.add(slug)

    apex = [s for s in available if s.count(".") == 0]
    multi = [s for s in available if s.count(".") > 0]
    for slug in apex + multi:
        if slug not in seen:
            ordered.append(slug)
            seen.add(slug)

    if limit is None or limit <= 0:
        return ordered
    return ordered[:limit]


def cents_to_price(cents: int | float | None) -> dict[str, Any]:
    if cents is None:
        return {"value": None, "display": None, "hasPromo": False}
    value = round(float(cents) / 100.0, 2)
    return {"value": value, "display": f"${value:.2f}", "hasPromo": False}


def regular_price_cell(
    price: dict[str, Any] | None,
    priceorig: dict[str, Any] | None,
    key: str,
) -> dict[str, Any]:
    """Prefer non-promo (regular) list price when TLD-List provides both."""
    price = price or {}
    priceorig = priceorig or {}
    orig = priceorig.get(key)
    current = price.get(key)

    if orig is not None:
        cell = cents_to_price(orig)
        cell["hasPromo"] = current is not None and current != orig
        return cell

    if current is not None:
        return cents_to_price(current)

    return {"value": None, "display": None, "hasPromo": False}


PRICE_TYPE_BY_KEY = {"_register": "register", "_renewal": "renewal", "_transfer": "transfer"}


def current_price_cell(raw: dict[str, Any], key: str) -> dict[str, Any]:
    """Current listed price. If a promo applies, value is the promo price and the regular price,
    promo code, end date and terms are kept next to it."""
    price = raw.get("price") or {}
    priceorig = raw.get("priceorig") or {}
    current = price.get(key)
    orig = priceorig.get(key)
    if current is None and orig is None:
        return {"value": None, "display": None, "hasPromo": False}
    cell = cents_to_price(current if current is not None else orig)
    if current is None or orig is None or current == orig:
        return cell
    cell["hasPromo"] = True
    cell["regularValue"] = round(float(orig) / 100.0, 2)
    cell["regularDisplay"] = f"${cell['regularValue']:.2f}"
    ptype = PRICE_TYPE_BY_KEY.get(key)
    applied_ids = set((raw.get("promoApplied") or {}).get(ptype) or []) if ptype else set()
    for promo in raw.get("promo") or []:
        if promo.get("_id") in applied_ids:
            if promo.get("code"):
                cell["promoCode"] = str(promo["code"])
            if promo.get("end"):
                cell["promoEnds"] = str(promo["end"])[:10]
            break
    terms = raw.get("terms") or {}
    limit = terms.get("limit-per-customer") or {}
    if ptype in (limit.get("pricetype") or []) and limit.get("amount") is not None:
        cell["limitPerCustomer"] = str(limit["amount"])
    new_only = terms.get("new-customer-only") or {}
    if ptype in (new_only.get("pricetype") or []):
        cell["newCustomerOnly"] = True
    multi = terms.get("multi-year-purchase-required") or {}
    if ptype in (multi.get("pricetype") or []) and multi.get("amount") is not None:
        cell["minYears"] = multi["amount"]
    return cell


def map_payments(methods: list[str] | None) -> list[str]:
    return [PAYMENT_LABELS.get(m, m.replace("_", " ").title()) for m in (methods or [])]


def map_features(features: list[str] | None) -> list[str]:
    return [FEATURE_LABELS.get(f, f.replace("-", " ").title()) for f in (features or [])]


def normalize_features(raw: dict[str, Any]) -> list[str]:
    features = raw.get("features")
    if features:
        return map_features(list(features))
    free = raw.get("freeFeatures") or []
    names: list[str] = []
    for item in free:
        if isinstance(item, dict) and item.get("name"):
            names.append(str(item["name"]))
        elif isinstance(item, str):
            names.append(item)
    return map_features(names)


def parse_action_response(text: str) -> list[dict[str, Any]]:
    result: dict[str, Any] | None = None
    for line in text.splitlines():
        if re.match(r"^\d+:", line):
            payload = line.split(":", 1)[1]
            try:
                parsed = json.loads(payload)
            except json.JSONDecodeError:
                continue
            if isinstance(parsed, dict) and ("success" in parsed or isinstance(parsed.get("data"), list)):
                result = parsed
                break

    if result is None:
        match = re.search(r'\{"success":true,"data":\[', text)
        if not match:
            raise RuntimeError("Could not parse getTldRegistrars response")
        start = match.start()
        depth = 0
        end = start
        for i, ch in enumerate(text[start:], start=start):
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        result = json.loads(text[start:end])

    if not result.get("success"):
        raise RuntimeError(f"getTldRegistrars failed: {result}")
    data = result.get("data")
    if not isinstance(data, list):
        raise RuntimeError("getTldRegistrars returned no data list")
    return data


def fetch_registrars(
    scraper: cloudscraper.CloudScraper,
    action_id: str,
    tld_slug: str,
    limit: int = 120,
    max_retries: int = 5,
) -> list[dict[str, Any]]:
    page_url = f"https://tld-list.com/tld/{tld_slug}"
    last_error: Exception | None = None

    for attempt in range(max_retries):
        try:
            # The server action works without loading the page first, which halves the request
            # count. Only retries load the page (to refresh cookies).
            if attempt > 0:
                throttle()
                page = scraper.get(page_url, timeout=45)
                if page.status_code == 429:
                    time.sleep(10.0 * attempt)
                    continue
                if page.status_code >= 400:
                    raise RuntimeError(f"TLD page HTTP {page.status_code}")
            payload = [
                {
                    "tldName": tld_slug,
                    "limit": limit,
                    "startAt": 0,
                    "sortBy": "name",
                    "sortDesc": False,
                }
            ]
            headers = {
                "Next-Action": action_id,
                "Content-Type": "text/plain;charset=UTF-8",
                "Accept": "text/x-component",
                "Origin": "https://tld-list.com",
                "Referer": page_url,
            }
            throttle()
            response = scraper.post(
                page_url,
                data=json.dumps(payload, separators=(",", ":")),
                headers=headers,
                timeout=60,
            )
            if response.status_code == 429:
                time.sleep(10.0 * (attempt + 1))
                continue
            if response.status_code >= 400:
                raise RuntimeError(f"Server action HTTP {response.status_code}")
            return parse_action_response(response.text)
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            msg = str(exc)
            if "429" in msg or "timeout" in msg.lower():
                time.sleep(2.0 * (attempt + 1))
                continue
            raise

    raise RuntimeError(f"Retries exhausted: {last_error}")


def build_offer(raw: dict[str, Any], display_name: str) -> dict[str, Any]:
    price = raw.get("price") or {}
    priceorig = raw.get("priceorig") or {}
    score = raw.get("valueScore")
    if score is not None:
        try:
            score = round(float(score), 2)
        except (TypeError, ValueError):
            score = None

    return {
        "registrar": display_name,
        "url": None,
        "registration": current_price_cell(raw, "_register"),
        "renewal": current_price_cell(raw, "_renewal"),
        "transfer": current_price_cell(raw, "_transfer"),
        "whoisPrivacy": current_price_cell(raw, "_whoisprivacy"),
        "taxAndFees": "None",
        "features": normalize_features(raw),
        "rating": None,
        "reviewCount": None,
        "payments": map_payments(raw.get("paymentMethods")),
        "score": score,
    }


def map_display_name(row: dict[str, Any]) -> str | None:
    rid = str(row.get("_id") or "").lower()
    name = str(row.get("name") or "")
    display = REGISTRAR_ID_MAP.get(rid)
    if display is not None:
        return display
    for mapped_id, mapped_name in REGISTRAR_ID_MAP.items():
        if mapped_id in rid or mapped_name.lower() == name.lower():
            return mapped_name
    # Keep unmapped rows under their public name so niche TLDs still get prices.
    cleaned = name.strip()
    return cleaned or None


def select_top_offers(raw_rows: list[dict[str, Any]], max_fallback: int = 8) -> list[dict[str, Any]]:
    """Prefer tracked primary/secondary registrars; fall back to cheapest others."""
    preferred: dict[str, dict[str, Any]] = {}
    others: list[dict[str, Any]] = []

    for row in raw_rows:
        display = map_display_name(row)
        if not display:
            continue
        offer = build_offer(row, display)
        if display in PREFERRED_REGISTRARS:
            preferred[display] = offer
        else:
            others.append(offer)

    ordered = [preferred[name] for name in PREFERRED_REGISTRARS if name in preferred]
    if ordered:
        return ordered

    # No preferred registrars listed this TLD — keep cheapest by registration.
    priced = [o for o in others if o["registration"]["value"] is not None]
    priced.sort(key=lambda o: o["registration"]["value"])
    if priced:
        return priced[:max_fallback]
    return others[:max_fallback]


def summarize_prices(offers: list[dict[str, Any]], key: str) -> dict[str, Any]:
    valid = [offer for offer in offers if offer[key]["value"] is not None]
    if not valid:
        return {"registrar": None, "price": None, "value": None}
    best = min(valid, key=lambda offer: offer[key]["value"])
    return {
        "registrar": best["registrar"],
        "price": best[key]["display"],
        "value": best[key]["value"],
    }


def summarize_best_value(offers: list[dict[str, Any]]) -> dict[str, Any]:
    valid = [offer for offer in offers if offer["score"] is not None]
    if not valid:
        return {"registrar": None, "score": None, "registration": None}
    best = max(valid, key=lambda offer: offer["score"])
    return {
        "registrar": best["registrar"],
        "score": best["score"],
        "registration": best["registration"]["display"],
    }


def safe_mean(values: list[float]) -> float | None:
    return round(sum(values) / len(values), 2) if values else None


def safe_median(values: list[float]) -> float | None:
    return round(float(statistics.median(values)), 2) if values else None


def build_entry(tld: str, source_url: str, offers: list[dict[str, Any]], full_row_count: int) -> dict[str, Any]:
    reg_values = [o["registration"]["value"] for o in offers if o["registration"]["value"] is not None]
    renew_values = [o["renewal"]["value"] for o in offers if o["renewal"]["value"] is not None]
    transfer_values = [o["transfer"]["value"] for o in offers if o["transfer"]["value"] is not None]

    return {
        "tld": tld if tld.startswith(".") else f".{tld}",
        "sourceUrl": source_url,
        "registrarCount": full_row_count,
        "pricingSummary": {
            "Wholesale Prices": {"registration": None, "renewal": None, "transfer": None},
            "Average Registrar Prices": {
                "registration": safe_mean(reg_values),
                "renewal": safe_mean(renew_values),
                "transfer": safe_mean(transfer_values),
            },
            "Median Registrar Prices": {
                "registration": safe_median(reg_values),
                "renewal": safe_median(renew_values),
                "transfer": safe_median(transfer_values),
            },
        },
        "cheapestRegistration": summarize_prices(offers, "registration"),
        "cheapestRenewal": summarize_prices(offers, "renewal"),
        "cheapestTransfer": summarize_prices(offers, "transfer"),
        "bestValue": summarize_best_value(offers),
        "registrars": offers,
    }


def scrape_one(
    action_id: str,
    slug: str,
    scraper: cloudscraper.CloudScraper | None = None,
) -> tuple[str, dict[str, Any] | None, str | None]:
    """Returns (slug, entry_or_none, error_or_none)."""
    client = scraper or make_scraper()
    try:
        rows = fetch_registrars(client, action_id, slug)
        offers = select_top_offers(rows)
        if not offers:
            return slug, None, "No tracked registrars returned"
        entry = build_entry(
            f".{slug}" if not slug.startswith(".") else slug,
            f"https://tld-list.com/tld/{slug}",
            offers,
            len(rows),
        )
        return slug, entry, None
    except Exception as exc:  # noqa: BLE001
        return slug, None, str(exc)


def write_dataset(
    slugs: list[str],
    results: dict[str, dict[str, Any]],
    failed: list[str],
    existing_by_tld: dict[str, dict[str, Any]],
    keep_extra: bool,
    output_path: Path = DATASET_PATH,
) -> int:
    extensions: list[dict[str, Any]] = []
    seen_tlds: set[str] = set()
    for slug in slugs:
        entry = results.get(slug)
        if entry:
            extensions.append(entry)
            seen_tlds.add(entry["tld"].lower())

    if keep_extra:
        for tld, entry in existing_by_tld.items():
            if tld not in seen_tlds and entry.get("registrars"):
                extensions.append(entry)
                seen_tlds.add(tld)

    output: dict[str, Any] = {
        "generatedAt": time.strftime("%Y-%m-%d"),
        "sourceName": "TLD-List",
        "sourceUrl": "https://tld-list.com/",
        "extensionCount": len(extensions),
        "extensions": extensions,
        "failedExtensions": failed,
        "scrapedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "sourceCatalogSize": len(slugs),
    }
    # Preserve Unstoppable merge metadata if present on the previous file.
    if DATASET_PATH.exists():
        try:
            prev_meta = json.loads(DATASET_PATH.read_text())
            for key in ("unstoppableMergedAt", "unstoppableSource", "unstoppableTldCount"):
                if prev_meta.get(key) is not None:
                    output[key] = prev_meta[key]
        except Exception:  # noqa: BLE001
            pass
    output["pricesIncludePromos"] = True
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, ensure_ascii=True, separators=(",", ":")))
    return len(extensions)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Refresh TLD prices from tld-list.com for ALL (or a subset of) extensions"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Max TLDs from catalog (0 = ALL extensions on tld-list.com, default 0)",
    )
    parser.add_argument("--all", action="store_true", help="Scrape every TLD on tld-list.com (same as --limit 0)")
    parser.add_argument("--workers", type=int, default=2, help="Parallel workers (default 2)")
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Keep existing successful entries; only scrape missing / empty ones",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=5.0,
        help="Minimum seconds between any two requests (tld-list.com robots.txt: Crawl-delay 5)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DATASET_PATH,
        help="Where to write the dataset. Use a staging file, then copy it over after checking it.",
    )
    parser.add_argument(
        "--abort-after-blocks",
        type=int,
        default=5,
        help="Stop the run after this many 403/429 failures in a row instead of retrying harder",
    )
    parser.add_argument(
        "--checkpoint-every",
        type=int,
        default=40,
        help="Write dataset to disk every N completed scrapes (default 40)",
    )
    parser.add_argument(
        "--skip-brand-like",
        action="store_true",
        help="Skip common brand/closed TLD patterns that never list public registrars",
    )
    parser.add_argument("--action-id", default=None, help="Skip action-id discovery and use this server action id")
    parser.add_argument(
        "--slugs-from-dataset",
        action="store_true",
        help="Use the extensions already in the live dataset instead of fetching the A-Z index",
    )
    args = parser.parse_args()
    global MIN_INTERVAL
    MIN_INTERVAL = max(0.0, args.delay)

    limit: int | None = None if (args.all or args.limit <= 0) else args.limit

    scraper = make_scraper()
    print("Discovering getTldRegistrars action id…")
    action_id = args.action_id or discover_action_id(scraper)
    print(f"  action id: {action_id}")

    print(f"Discovering TLD slugs from tld-list.com A–Z ({'ALL' if limit is None else f'limit={limit}'})…")
    if args.slugs_from_dataset:
        prev_file = json.loads(DATASET_PATH.read_text())
        dataset_slugs = [e["tld"].lstrip(".").lower() for e in prev_file.get("extensions") or []]
        ordered_known = [x for x in PRIORITY_SLUGS if x in set(dataset_slugs)]
        slugs = list(dict.fromkeys(ordered_known + dataset_slugs))
        if limit:
            slugs = slugs[:limit]
    else:
        slugs = discover_tld_slugs(scraper, limit)
    print(f"  {len(slugs)} extensions in source catalog")

    existing_by_tld: dict[str, dict[str, Any]] = {}
    if DATASET_PATH.exists():
        try:
            prev = json.loads(DATASET_PATH.read_text())
            for entry in prev.get("extensions") or []:
                existing_by_tld[entry["tld"].lower()] = entry
        except Exception:  # noqa: BLE001
            pass

    results: dict[str, dict[str, Any]] = {}
    failed: list[str] = []

    # Resume source: the staging file when --output is not the live dataset, else the live dataset.
    resume_by_tld = existing_by_tld
    if args.output != DATASET_PATH:
        resume_by_tld = {}
        if args.output.exists():
            try:
                for entry in json.loads(args.output.read_text()).get("extensions") or []:
                    resume_by_tld[entry["tld"].lower()] = entry
            except Exception:  # noqa: BLE001
                pass
    # Seed with already-scraped data when resuming
    for slug in slugs:
        tld = f".{slug}"
        prev = resume_by_tld.get(tld)
        if (
            args.resume
            and prev
            and prev.get("registrars")
            and any(r.get("registration", {}).get("value") is not None for r in prev["registrars"])
        ):
            results[slug] = prev

    pending = [slug for slug in slugs if slug not in results]

    if args.skip_brand_like:
        # Brand / closed TLDs almost never return public registrar tables.
        # Keep multi-level and short public-looking slugs; drop long pure-brand strings
        # only when they already failed as "Registrars not found" previously.
        permanent_empty = set()
        if DATASET_PATH.exists():
            try:
                prev = json.loads(DATASET_PATH.read_text())
                # Heuristic: previous failed list that we know are often brand
                for f in prev.get("failedExtensions") or []:
                    s = str(f).lstrip(".").lower()
                    # Keep short ccTLDs and multi-level for retry with secondary registrars
                    if s.count(".") == 0 and len(s) >= 5 and s not in PRIORITY_SLUGS:
                        permanent_empty.add(s)
            except Exception:  # noqa: BLE001
                pass
        before = len(pending)
        pending = [s for s in pending if s not in permanent_empty]
        print(f"  skip-brand-like: dropped {before - len(pending)} likely-empty brand TLDs")

    print(
        f"Already have prices: {len(results)} · "
        f"to scrape: {len(pending)} · workers={args.workers} delay={args.delay}s"
    )

    if not pending:
        n = write_dataset(slugs, results, failed, existing_by_tld, keep_extra=args.resume, output_path=args.output)
        print(f"Nothing to scrape. Dataset has {n} extensions.")
        return

    # One client per worker thread (thread-local)
    import threading

    thread_local = threading.local()

    def get_client() -> cloudscraper.CloudScraper:
        client = getattr(thread_local, "client", None)
        if client is None:
            client = make_scraper()
            thread_local.client = client
        return client

    def scrape_with_delay(slug: str) -> tuple[str, dict[str, Any] | None, str | None]:
        result = scrape_one(action_id, slug, get_client())
        return result

    workers = max(1, args.workers)
    done = 0
    blocked_in_a_row = 0
    aborted = False
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(scrape_with_delay, slug): slug for slug in pending}
        for future in as_completed(futures):
            slug = futures[future]
            done += 1
            try:
                s, entry, err = future.result()
            except Exception as exc:  # noqa: BLE001
                s, entry, err = slug, None, str(exc)

            if err and ("HTTP 403" in err or "HTTP 429" in err or "Retries exhausted" in err):
                blocked_in_a_row += 1
            else:
                blocked_in_a_row = 0
            if entry is None:
                failed.append(s)
                prev = existing_by_tld.get(f".{s}")
                if prev and prev.get("registrars"):
                    results[s] = prev
                    print(f"[{done:04d}/{len(pending)}] .{s}: FAILED keep-prev ({err})", flush=True)
                else:
                    print(f"[{done:04d}/{len(pending)}] .{s}: FAILED ({err})", flush=True)
            else:
                results[s] = entry
                n = len(entry.get("registrars") or [])
                print(
                    f"[{done:04d}/{len(pending)}] .{s}: "
                    f"{n} top registrars / {entry['registrarCount']} listed",
                    flush=True,
                )

            if args.abort_after_blocks > 0 and blocked_in_a_row >= args.abort_after_blocks:
                print(
                    f"Stopping: {blocked_in_a_row} blocked/rate-limited requests in a row. "
                    "Not retrying harder; wait and re-run with --resume.",
                    flush=True,
                )
                aborted = True
                for pending_future in futures:
                    pending_future.cancel()
                break
            if args.checkpoint_every > 0 and done % args.checkpoint_every == 0:
                saved = write_dataset(slugs, results, failed, existing_by_tld, keep_extra=args.resume, output_path=args.output)
                print(
                    f"  ↳ checkpoint: {saved} extensions saved ({done}/{len(pending)} this run)",
                    flush=True,
                )

    saved = write_dataset(slugs, results, failed, existing_by_tld, keep_extra=args.resume, output_path=args.output)
    print(f"Updated {args.output}" + (" (run stopped early)" if aborted else ""))
    print(f"Saved {saved} extensions · failed this run {len(failed)} · catalog {len(slugs)}")
    if failed[:30]:
        print(f"Failed sample: {failed[:30]}")


if __name__ == "__main__":
    main()
