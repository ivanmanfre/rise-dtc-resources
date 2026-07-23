#!/bin/bash
# Mirror the canonical LM engine from the main resources repo into this Rise
# Pages repo. Run after any _engine change in ~/Desktop/resources, then commit.
# One canonical engine; this repo never edits _engine directly.
set -euo pipefail
SRC="$HOME/Desktop/resources/_engine/"
# rsync copies the WORKING TREE, not git HEAD. Uncommitted WIP in the canonical repo
# must never reach this client repo (R2 near-miss 2026-07-23). Override: SYNC_DIRTY=1.
if [ "${SYNC_DIRTY:-0}" != "1" ] && [ -n "$(git -C "$HOME/Desktop/resources" status --porcelain _engine)" ]; then
  echo "ABORT: uncommitted changes in canonical _engine (commit them or SYNC_DIRTY=1):" >&2
  git -C "$HOME/Desktop/resources" status --porcelain _engine >&2
  exit 1
fi
DST="$(cd "$(dirname "$0")" && pwd)/_engine/"
# ai-kit.css stays rise-local: 150297c restyled shared lmk-* selectors to the RISE brand
# (102 del/222 add across modified hunks). Upstreaming = full restyle conversion, flagged R3.
# ai-kit.js WAS reconciled upstream in R2 (2026-07-23) and syncs normally.
rsync -a --delete --exclude "*.test.mjs" --exclude "*.test.html" --exclude "demo/" --exclude "ai-kit.css" "$SRC" "$DST"
echo "engine synced from resources repo:"
cd "$(dirname "$0")" && git status --porcelain _engine | head -20
