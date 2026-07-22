#!/usr/bin/env python3
"""Attach pricing flags + light metadata to existing tld-about pages.

Reads:
  src/data/tld-price-comparison.json
  src/data/tld-about/*.json

Writes pricing summary onto each about page and rebuilds index.json.
Does not re-scrape IANA or Wikipedia.
"""
from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
ABOUT_DIR = ROOT / "src" / "data" / "tld-about"
INDEX_PATH = ABOUT_DIR / "index.json"
PRICE_PATH = ROOT / "src" / "data" / "tld-price-comparison.json"

# Keyword → category heuristics (additive; does not wipe existing categories)
KEYWORD_CATS: list[tuple[str, list[str]]] = [
    (r"tech|software|app|dev|cloud|code|data|ai|io|systems|network|hosting|server|digital", ["tech"]),
    (r"shop|store|buy|sale|market|boutique|shopping|deal", ["ecommerce"]),
    (r"finance|bank|money|fund|capital|loan|credit|insure|insurance|crypto", ["finance"]),
    (r"health|care|clinic|doctor|dental|bio|med|pharmacy", ["health"]),
    (r"law|legal|lawyer|attorney", ["legal"]),
    (r"edu|education|school|academy|university|college|study|training", ["education"]),
    (r"art|design|photo|music|film|movie|studio|gallery|media|blog|news", ["creative"]),
    (r"travel|hotel|tours|vacation|flight|cruise", ["travel"]),
    (r"food|cafe|coffee|restaurant|pizza|wine|beer|kitchen", ["food"]),
    (r"sport|soccer|football|golf|fit|gym|bike", ["sports"]),
    (r"green|eco|energy|solar|earth|organic|garden|farm", ["green"]),
    (r"game|play|bet|casino|fun|club", ["entertainment"]),
    (r"realestate|realty|homes|house|property|rent|land|construction", ["realestate"]),
    (r"work|job|career|team|management|consulting|agency|services|company|business|group", ["business"]),
]


def load_prices() -> dict[str, dict[str, Any]]:
    if not PRICE_PATH.exists():
        return {}
    data = json.loads(PRICE_PATH.read_text())
    by_tld: dict[str, dict[str, Any]] = {}
    for entry in data.get("extensions") or []:
        tld = str(entry.get("tld") or "").lower()
        if tld:
            by_tld[tld] = entry
    return by_tld


def pricing_block(entry: dict[str, Any] | None) -> dict[str, Any]:
    if not entry or not entry.get("registrars"):
        return {"hasPricing": False}
    cheap = entry.get("cheapestRegistration") or {}
    return {
        "hasPricing": True,
        "registrarCount": entry.get("registrarCount") or len(entry.get("registrars") or []),
        "cheapestRegistration": {
            "registrar": cheap.get("registrar"),
            "price": cheap.get("price"),
            "value": cheap.get("value"),
        },
        "cheapestRenewal": entry.get("cheapestRenewal"),
        "sourceUrl": entry.get("sourceUrl"),
    }


def ensure_categories(data: dict[str, Any]) -> list[str]:
    import re

    existing = list(data.get("categories") or [])
    if existing:
        return existing
    blob = " ".join(
        str(x or "")
        for x in (
            data.get("slug"),
            data.get("tld"),
            data.get("designation"),
            data.get("type"),
            data.get("about"),
            data.get("wikipedia"),
        )
    ).lower()
    cats: list[str] = []
    for pattern, labels in KEYWORD_CATS:
        if re.search(pattern, blob):
            for lab in labels:
                if lab not in cats:
                    cats.append(lab)
    t = str(data.get("type") or "").lower()
    if t == "cctld" and "geo" not in cats:
        cats.append("geo")
    if not cats:
        cats = ["general"]
    return cats


def build_summary(data: dict[str, Any]) -> str:
    if data.get("summary") and len(str(data["summary"])) > 20:
        return str(data["summary"])
    tld = data.get("tld") or f".{data.get('slug')}"
    type_label = data.get("typeLabel") or data.get("type") or "top-level domain"
    sponsor = data.get("sponsor") or "its registry operator"
    return f"{tld} is a {type_label}. Managed by {sponsor}."


def write_index(entries: list[dict[str, Any]]) -> None:
    catalog = []
    cat_set: set[str] = set()
    for e in entries:
        for c in e.get("categories") or []:
            cat_set.add(c)
        catalog.append(
            {
                "tld": e.get("tld"),
                "slug": e.get("slug"),
                "type": e.get("type"),
                "typeLabel": e.get("typeLabel"),
                "sponsor": e.get("sponsor"),
                "title": e.get("title"),
                "categories": e.get("categories") or [],
                "primaryCategory": e.get("primaryCategory"),
                "hasPricing": bool((e.get("pricing") or {}).get("hasPricing")),
                "summary": e.get("summary"),
            }
        )
    INDEX_PATH.write_text(
        json.dumps(
            {
                "generatedAt": time.strftime("%Y-%m-%d"),
                "count": len(catalog),
                "source": "https://www.iana.org/domains/root/db",
                "categories": sorted(cat_set),
                "extensions": catalog,
            },
            ensure_ascii=True,
            indent=2,
        )
    )


def main() -> None:
    prices = load_prices()
    files = sorted(p for p in ABOUT_DIR.glob("*.json") if p.name != "index.json")
    print(f"Enriching {len(files)} about pages with pricing + categories…")
    updated = 0
    priced = 0
    entries: list[dict[str, Any]] = []

    for path in files:
        try:
            data = json.loads(path.read_text())
        except Exception as exc:  # noqa: BLE001
            print(f"  skip {path.name}: {exc}")
            continue

        tld = str(data.get("tld") or f".{path.stem}").lower()
        block = pricing_block(prices.get(tld))
        if block.get("hasPricing"):
            priced += 1
        data["pricing"] = block
        data["categories"] = ensure_categories(data)
        data["primaryCategory"] = (data["categories"] or ["general"])[0]
        data["summary"] = build_summary(data)
        if not data.get("useCases"):
            # light defaults from categories
            data["useCases"] = [
                f"Projects that fit the .{path.stem} brand or audience",
                "Brand protection and defensive registrations",
            ]
        data["metaEnrichedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        path.write_text(json.dumps(data, ensure_ascii=True, indent=2))
        entries.append(data)
        updated += 1

    write_index(entries)
    print(f"Done. pages={updated} withPricing={priced} index={INDEX_PATH}")


if __name__ == "__main__":
    main()
