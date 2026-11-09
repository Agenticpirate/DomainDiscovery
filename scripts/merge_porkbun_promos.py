#!/usr/bin/env python3
"""Merge Porkbun's public pricing API (prices + coupon codes) into the price dataset.

Porkbun publishes https://api.porkbun.com/api/json/v3/pricing/get for exactly this use: one
unauthenticated request returns regular prices and active coupons for every extension.
Only the existing Porkbun offers are updated; no offers are added. Coupons apply as a flat
amount off, so `value` becomes the discounted price and `regularValue` stays the list price.

Usage:
  python3 scripts/merge_porkbun_promos.py --dataset scratch/tld-price-staging.json
"""
from __future__ import annotations

import argparse
import json
import urllib.request
from pathlib import Path
from typing import Any

import refresh_tld_prices as rtp  # same folder; reuses build_entry for the summaries

API_URL = "https://api.porkbun.com/api/json/v3/pricing/get"
COUPON_KEYS = {"registration": "registration", "transfer": "transfer"}


def fetch_pricing() -> dict[str, Any]:
    req = urllib.request.Request(
        API_URL,
        data=b"{}",
        headers={"Content-Type": "application/json", "User-Agent": "DomainDiscovery price check"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        payload = json.load(resp)
    if payload.get("status") != "SUCCESS":
        raise RuntimeError(f"Porkbun pricing API returned {payload.get('status')}")
    return payload["pricing"]


def money(value: float) -> dict[str, Any]:
    value = round(value, 2)
    return {"value": value, "display": f"${value:.2f}", "hasPromo": False}


def apply_cell(cell: dict[str, Any], list_price: float, coupon: dict[str, Any] | None) -> dict[str, Any]:
    new = money(list_price)
    if coupon and coupon.get("type") == "amount" and float(coupon.get("amount", 0)) > 0:
        discounted = max(0.0, list_price - float(coupon["amount"]))
        new = money(discounted)
        new["hasPromo"] = True
        new["regularValue"] = round(list_price, 2)
        new["regularDisplay"] = f"${list_price:.2f}"
        if coupon.get("code"):
            new["promoCode"] = str(coupon["code"])
        if coupon.get("max_per_user") is not None:
            new["limitPerCustomer"] = str(coupon["max_per_user"])
        new["firstYearOnly"] = str(coupon.get("first_year_only", "")).lower() == "yes"
    # Keep a deeper promo that the TLD-List data already carried for this cell.
    if cell.get("hasPromo") and cell.get("value") is not None and cell["value"] < new["value"]:
        return cell
    return new


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=Path, required=True, help="Dataset JSON to update in place")
    args = parser.parse_args()

    pricing = fetch_pricing()
    data = json.loads(args.dataset.read_text())
    updated = promos = 0
    for i, entry in enumerate(data["extensions"]):
        row = pricing.get(entry["tld"].lstrip(".").lower())
        if not row:
            continue
        offers = entry["registrars"]
        offer = next((o for o in offers if o["registrar"] == "Porkbun"), None)
        if offer is None:
            continue
        coupons = row.get("coupons") or {}
        for field, key in (("registration", "registration"), ("renewal", "renewal"), ("transfer", "transfer")):
            raw = row.get(key)
            if raw in (None, ""):
                continue
            coupon = coupons.get(COUPON_KEYS[field]) if field in COUPON_KEYS else None
            offer[field] = apply_cell(offer.get(field) or {}, float(str(raw).replace(',', '')), coupon)
            promos += 1 if offer[field].get("hasPromo") else 0
        data["extensions"][i] = rtp.build_entry(entry["tld"], entry["sourceUrl"], offers, entry["registrarCount"])
        updated += 1

    data["porkbunMergedAt"] = __import__("time").strftime("%Y-%m-%dT%H:%M:%SZ", __import__("time").gmtime())
    args.dataset.write_text(json.dumps(data, ensure_ascii=True, separators=(",", ":")))
    print(f"Porkbun: {updated} extensions updated, {promos} promo prices applied")


if __name__ == "__main__":
    main()
