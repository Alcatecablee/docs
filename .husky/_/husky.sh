#!/usr/bin/env sh
. "$(dirname -- "$0")/husky.local.sh" 2>/dev/null || true
command -v sh >/dev/null 2>&1 || {
  echo >&2 "sh is required to run husky hooks"; exit 1; }

