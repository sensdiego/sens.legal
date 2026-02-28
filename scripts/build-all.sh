#!/bin/bash
set -euo pipefail

# sens.legal — Build all workspaces
# NOTE: Per CLAUDE.md, do NOT run locally. Use CI/Vercel.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Syncing docs ==="
bash "$SCRIPT_DIR/sync-docs.sh"

echo ""
echo "=== Building portal ==="
npm -w portal run build

for site in "$ROOT_DIR"/sites/*/; do
  site_name=$(basename "$site")
  echo ""
  echo "=== Building $site_name ==="
  npm -w "sites/$site_name" run build
done

echo ""
echo "=== All builds complete ==="
