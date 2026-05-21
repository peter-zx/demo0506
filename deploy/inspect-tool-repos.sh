#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/tool-repo-inspection}"
mkdir -p "$ROOT_DIR"

clone_or_update() {
  local repo="$1"
  local dir="$2"

  if [ -d "$dir/.git" ]; then
    git -C "$dir" pull --ff-only
  else
    git clone "$repo" "$dir"
  fi
}

clone_or_update "https://codeup.aliyun.com/65395bc29fb5e4b27ec5da1d/jizhang_codexAa001.git" "$ROOT_DIR/accounting"
clone_or_update "https://codeup.aliyun.com/65395bc29fb5e4b27ec5da1d/data_VaultNote_codex002.git" "$ROOT_DIR/vault-note"
clone_or_update "https://codeup.aliyun.com/65395bc29fb5e4b27ec5da1d/excel_fapiao.git" "$ROOT_DIR/excel-fapiao"
clone_or_update "https://codeup.aliyun.com/65395bc29fb5e4b27ec5da1d/workdata_codex0002.git" "$ROOT_DIR/workdata"

find "$ROOT_DIR" -maxdepth 3 -type f \( \
  -name package.json -o \
  -name requirements.txt -o \
  -name pyproject.toml -o \
  -name vite.config.* -o \
  -name next.config.* -o \
  -name README.md -o \
  -name Dockerfile \
\) -print

