#!/bin/bash
# Usage: run_workers.sh <lang> [lang ...]   Translates cached sentences for each language sequentially.
cd "$(dirname "$0")"
export MT_THREADS="${MT_THREADS:-3}"
for lang in "$@"; do
  ~/.cache/dd-mt-venv/bin/python mt.py translate "$lang" >> "cache/log-$lang.txt" 2>&1
done
echo "workers finished: $*" >> cache/log-workers.txt
