#!/usr/bin/env bash
# AXIS telemetry helper — appends a JSONL event to .ai/telemetry.jsonl.
# Sourced by other hooks. Schema matches `axis log` (cli/src/commands/log.js).
#
# Usage:  axis_log_event <event> [k=v ...]
set -euo pipefail

axis_log_event() {
  local event="$1"; shift || true
  local log_path=".ai/telemetry.jsonl"
  [[ -d .ai ]] || return 0
  local ts branch meta_pairs=""
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo null)"
  for kv in "$@"; do
    local k="${kv%%=*}" v="${kv#*=}"
    # naive JSON-safe: backslashes + quotes
    v="${v//\\/\\\\}"; v="${v//\"/\\\"}"
    meta_pairs+="\"${k}\":\"${v}\","
  done
  meta_pairs="{${meta_pairs%,}}"
  printf '{"ts":"%s","event":"%s","branch":"%s","meta":%s}\n' \
    "$ts" "$event" "$branch" "$meta_pairs" >> "$log_path"
}
