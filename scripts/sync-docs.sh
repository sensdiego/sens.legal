#!/bin/bash
set -euo pipefail

# sens.legal — Sync docs from source repos via SITE_MANIFEST.json whitelist
# POSIX-compatible (no declare -A, works with bash 3.2 on macOS)

BASE_DIR="$HOME/Dev"
SITE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

get_repo_dir() {
  case "$1" in
    valter) echo "Valter" ;;
    juca)   echo "juca" ;;
    leci)   echo "leci" ;;
    douto)  echo "Douto" ;;
    *)      echo "" ;;
  esac
}

PROJECTS="valter juca leci douto"

for project in $PROJECTS; do
  repo_dir=$(get_repo_dir "$project")
  repo_path="$BASE_DIR/$repo_dir"
  manifest="$repo_path/SITE_MANIFEST.json"
  docs_dir="$repo_path/docs"
  dest_dir="$SITE_DIR/sites/$project/src/content/docs"
  public_dir="$SITE_DIR/sites/$project/public"

  echo "=== Syncing $project (from $repo_dir) ==="

  if [ ! -f "$manifest" ]; then
    echo "ERROR: manifest not found at $manifest"
    exit 1
  fi

  if [ ! -d "$docs_dir" ]; then
    echo "ERROR: docs dir not found at $docs_dir"
    exit 1
  fi

  # Clean destination
  rm -rf "$dest_dir"
  mkdir -p "$dest_dir"

  # Extract whitelist from SITE_MANIFEST.json
  # Handles both formats:
  #   - Valter/Leci: sidebar_structure is array of sections with slug-based items
  #   - Juca: sidebar_structure.en is object with section keys and file-based items
  WHITELIST=$(node -e "
    const fs = require('fs');
    const path = require('path');
    const m = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
    const sidebar = m.sidebar_structure;
    const docsDir = process.argv[2];
    const files = new Set();

    if (Array.isArray(sidebar)) {
      // Valter/Leci format
      sidebar.forEach(s => {
        if (!s.items) return;
        s.items.forEach(i => {
          let slug = (i.slug || '').replace(/\\/\$/, '');
          if (!slug) {
            files.add('index.md');
            return;
          }
          const asIndex = slug + '/index.md';
          const asFile = slug + '.md';
          if (fs.existsSync(path.join(docsDir, asIndex))) {
            files.add(asIndex);
          } else if (fs.existsSync(path.join(docsDir, asFile))) {
            files.add(asFile);
          } else {
            process.stderr.write('WARNING: no file for slug: ' + slug + '\\n');
          }
        });
      });
    } else if (sidebar.en) {
      // Juca format
      Object.values(sidebar.en).forEach(items => {
        items.forEach(i => {
          if (i.file) files.add(i.file);
        });
      });
    }

    files.add('index.md');
    console.log([...files].join('\\n'));
  " "$manifest" "$docs_dir")

  # Copy whitelisted files (EN)
  copied=0
  echo "$WHITELIST" | while IFS= read -r file; do
    [ -z "$file" ] && continue
    src="$docs_dir/$file"
    if [ -f "$src" ]; then
      dir=$(dirname "$dest_dir/$file")
      mkdir -p "$dir"
      cp "$src" "$dest_dir/$file"
    else
      echo "  WARNING: $src not found"
    fi
  done

  # Copy pt-br translations (same whitelist, different source prefix)
  ptbr_src="$docs_dir/pt-br"
  if [ -d "$ptbr_src" ]; then
    ptbr_dest="$dest_dir/pt-br"
    mkdir -p "$ptbr_dest"
    echo "$WHITELIST" | while IFS= read -r file; do
      [ -z "$file" ] && continue
      src="$ptbr_src/$file"
      if [ -f "$src" ]; then
        dir=$(dirname "$ptbr_dest/$file")
        mkdir -p "$dir"
        cp "$src" "$ptbr_dest/$file"
      fi
    done
  fi

  # Copy llms.txt and llms-full.txt to public/
  for llm_file in llms.txt llms-full.txt; do
    src="$docs_dir/public/$llm_file"
    if [ -f "$src" ]; then
      mkdir -p "$public_dir"
      cp "$src" "$public_dir/$llm_file"
    fi
  done

  # Count synced files
  en_count=$(find "$dest_dir" -name '*.md' -not -path '*/pt-br/*' | wc -l | tr -d ' ')
  ptbr_count=$(find "$dest_dir/pt-br" -name '*.md' 2>/dev/null | wc -l | tr -d ' ')
  echo "  EN files: $en_count | PT-BR files: $ptbr_count"
done

echo ""
echo "=== Sync complete ==="
