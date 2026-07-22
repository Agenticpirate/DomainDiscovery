#!/usr/bin/env python3
"""Optional Firecrawl fallback for TLD-List pages that fail direct scrape.

Requires:
  export FIRECRAWL_API_KEY=fc-...

Usage:
  python3 scripts/firecrawl_tld_fallback.py --tlds com,net,ai
  python3 scripts/firecrawl_tld_fallback.py --from-failed

This does not replace the primary TLD-List server-action scraper — it is a
backup path for agentic weekly verification when rate-limited or blocked.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = ROOT / "src/data/tld-price-comparison.json"
API = "https://api.firecrawl.dev/v1/scrape"


def scrape(url: str, api_key: str) -> dict:
    body = json.dumps(
        {
            "url": url,
            "formats": ["markdown", "html"],
            "onlyMainContent": True,
        }
    ).encode()
    req = urllib.request.Request(
        API,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tlds", default="", help="Comma-separated slugs, e.g. com,net,ai")
    parser.add_argument("--from-failed", action="store_true", help="Use failedExtensions from dataset")
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()

    api_key = os.environ.get("FIRECRAWL_API_KEY")
    if not api_key:
        print("FIRECRAWL_API_KEY not set. Add it to .env.local or the environment.")
        print("Primary scrapers (TLD-List server action + Unstoppable API) do not need Firecrawl.")
        sys.exit(1)

    slugs: list[str] = []
    if args.tlds:
        slugs.extend([s.strip().lstrip(".") for s in args.tlds.split(",") if s.strip()])
    if args.from_failed and DATASET_PATH.exists():
        data = json.loads(DATASET_PATH.read_text())
        slugs.extend(data.get("failedExtensions") or [])

    slugs = list(dict.fromkeys(slugs))[: args.limit]
    if not slugs:
        print("No TLDs to fetch.")
        sys.exit(0)

    print(f"Firecrawl fallback for {len(slugs)} TLDs…")
    ok = 0
    for slug in slugs:
        url = f"https://tld-list.com/tld/{slug}"
        try:
            result = scrape(url, api_key)
            success = bool(result.get("success"))
            print(f"  .{slug}: {'OK' if success else 'FAIL'} keys={list(result.keys())[:6]}")
            if success:
                ok += 1
                # Persist raw for later parse/merge if needed
                out = ROOT / "data" / "firecrawl-raw" / f"{slug}.json"
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_text(json.dumps(result)[:500000])
        except urllib.error.HTTPError as e:
            print(f"  .{slug}: HTTP {e.code}")
        except Exception as e:
            print(f"  .{slug}: {e}")

    print(f"Done: {ok}/{len(slugs)} succeeded (raw saved under data/firecrawl-raw/)")
    print("Note: primary weekly loop uses TLD-List + Unstoppable APIs; Firecrawl is optional backup.")


if __name__ == "__main__":
    main()
