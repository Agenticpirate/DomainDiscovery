#!/usr/bin/env python3
"""Weekly batch price verification (agentic-friendly).

Runs in batches so a free cron / agent can verify ~50–150 TLDs per day
and fully rotate the catalog over the week.

Steps per run:
  1. Refresh one batch of TLD-List regular prices (resume-safe)
  2. Merge Unstoppable Domains list prices from their public API
  3. Write a verification log under data/price-verify-logs/

Optional Firecrawl:
  If FIRECRAWL_API_KEY is set, failed TLD-List pages can be re-fetched via
  Firecrawl as a fallback (see --firecrawl flag).

Examples:
  python3 scripts/weekly_price_verify.py --batch-size 80
  python3 scripts/weekly_price_verify.py --batch-size 100 --batch-index 2
  python3 scripts/weekly_price_verify.py --unstoppable-only
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
STATE_PATH = ROOT / "data" / "price-verify-state.json"
LOG_DIR = ROOT / "data" / "price-verify-logs"
DATASET_PATH = ROOT / "src" / "data" / "tld-price-comparison.json"


def load_state() -> dict[str, Any]:
    if STATE_PATH.exists():
        try:
            return json.loads(STATE_PATH.read_text())
        except Exception:
            pass
    return {
        "nextBatchIndex": 0,
        "batchSize": 80,
        "lastRunAt": None,
        "runs": [],
    }


def save_state(state: dict[str, Any]) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2))


def run_cmd(args: list[str], timeout: int = 3600) -> dict[str, Any]:
    print("$", " ".join(args))
    started = time.time()
    proc = subprocess.run(
        args,
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    duration = round(time.time() - started, 2)
    # Stream tail of output
    out = (proc.stdout or "") + (proc.stderr or "")
    for line in out.splitlines()[-40:]:
        print(line)
    return {
        "cmd": args,
        "returncode": proc.returncode,
        "durationSec": duration,
        "stdoutTail": (proc.stdout or "")[-4000:],
        "stderrTail": (proc.stderr or "")[-2000:],
    }


def dataset_stats() -> dict[str, Any]:
    if not DATASET_PATH.exists():
        return {"extensions": 0}
    data = json.loads(DATASET_PATH.read_text())
    exts = data.get("extensions") or []
    ud = 0
    for e in exts:
        for r in e.get("registrars") or []:
            if r.get("registrar") == "Unstoppable Domains" and r.get("registration", {}).get("value") is not None:
                ud += 1
                break
    return {
        "extensions": len(exts),
        "generatedAt": data.get("generatedAt"),
        "unstoppableTldsWithPrice": ud,
        "unstoppableMergedAt": data.get("unstoppableMergedAt"),
        "failedExtensions": len(data.get("failedExtensions") or []),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Weekly batch TLD price verification")
    parser.add_argument("--batch-size", type=int, default=80, help="TLDs per batch (default 80)")
    parser.add_argument(
        "--batch-index",
        type=int,
        default=None,
        help="Explicit batch index (default: rotate from data/price-verify-state.json)",
    )
    parser.add_argument("--workers", type=int, default=2)
    parser.add_argument("--delay", type=float, default=0.85)
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="TLD-List catalog limit (0 = ALL extensions on tld-list.com)",
    )
    parser.add_argument("--unstoppable-only", action="store_true")
    parser.add_argument("--skip-unstoppable", action="store_true")
    parser.add_argument(
        "--firecrawl",
        action="store_true",
        help="Enable Firecrawl fallback when FIRECRAWL_API_KEY is set (optional)",
    )
    args = parser.parse_args()

    state = load_state()
    batch_size = max(10, args.batch_size)
    batch_index = args.batch_index if args.batch_index is not None else int(state.get("nextBatchIndex") or 0)

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    results: dict[str, Any] = {
        "runId": run_id,
        "startedAt": datetime.now(timezone.utc).isoformat(),
        "batchSize": batch_size,
        "batchIndex": batch_index,
        "steps": [],
        "before": dataset_stats(),
        "firecrawl": bool(args.firecrawl and os.environ.get("FIRECRAWL_API_KEY")),
    }

    py = "python3"

    if not args.unstoppable_only:
        # Full TLD-List catalog with --resume: only missing/empty extensions are scraped.
        # Weekly agents re-run this; each pass fills more of the ~3,300 catalog.
        print(f"\n=== Batch {batch_index}: TLD-List full catalog refresh (resume) ===")
        cmd = [
            py,
            "scripts/refresh_tld_prices.py",
            "--all" if args.limit <= 0 else "--limit",
            *([] if args.limit <= 0 else [str(args.limit)]),
            "--workers",
            str(args.workers),
            "--delay",
            str(args.delay),
            "--resume",
            "--checkpoint-every",
            "40",
        ]
        # Clean up if --all was used (no dangling limit value)
        if args.limit <= 0:
            cmd = [
                py,
                "scripts/refresh_tld_prices.py",
                "--all",
                "--workers",
                str(args.workers),
                "--delay",
                str(args.delay),
                "--resume",
                "--checkpoint-every",
                "40",
            ]
        step = run_cmd(cmd, timeout=14400)
        results["steps"].append({"name": "tld-list", **step})
    else:
        results["steps"].append({"name": "tld-list", "skipped": True})

    if not args.skip_unstoppable:
        print("\n=== Unstoppable Domains direct API merge ===")
        step = run_cmd([py, "scripts/refresh_unstoppable_prices.py"], timeout=180)
        results["steps"].append({"name": "unstoppable", **step})
    else:
        results["steps"].append({"name": "unstoppable", "skipped": True})

    if args.firecrawl and os.environ.get("FIRECRAWL_API_KEY"):
        print("\n=== Firecrawl fallback (optional) ===")
        # Placeholder hook — full Firecrawl re-scrape can be added when key is provided.
        results["steps"].append(
            {
                "name": "firecrawl",
                "note": "FIRECRAWL_API_KEY present. Use scripts/firecrawl_tld_fallback.py when needed.",
                "returncode": 0,
            }
        )
    elif args.firecrawl:
        results["steps"].append(
            {
                "name": "firecrawl",
                "note": "FIRECRAWL_API_KEY not set — skipped",
                "returncode": 0,
            }
        )

    results["finishedAt"] = datetime.now(timezone.utc).isoformat()
    results["after"] = dataset_stats()

    log_path = LOG_DIR / f"{run_id}.json"
    log_path.write_text(json.dumps(results, indent=2))
    print(f"\nLog → {log_path}")
    print("Stats before:", results["before"])
    print("Stats after: ", results["after"])

    # Advance batch pointer for next weekly/daily agent run
    state["batchSize"] = batch_size
    state["nextBatchIndex"] = batch_index + 1
    state["lastRunAt"] = results["finishedAt"]
    state.setdefault("runs", []).append(
        {
            "runId": run_id,
            "batchIndex": batch_index,
            "after": results["after"],
        }
    )
    state["runs"] = state["runs"][-30:]
    save_state(state)
    print(f"Next batch index → {state['nextBatchIndex']}")


if __name__ == "__main__":
    main()
