#!/bin/bash
# Mirror the canonical LM engine from the main resources repo into this Rise
# Pages repo. Run after any _engine change in ~/Desktop/resources, then commit.
# One canonical engine; this repo never edits _engine directly.
set -euo pipefail
SRC="$HOME/Desktop/resources/_engine/"
DST="$(cd "$(dirname "$0")" && pwd)/_engine/"
rsync -a --delete --exclude "*.test.mjs" --exclude "*.test.html" --exclude "demo/" "$SRC" "$DST"
echo "engine synced from resources repo:"
cd "$(dirname "$0")" && git status --porcelain _engine | head -20
