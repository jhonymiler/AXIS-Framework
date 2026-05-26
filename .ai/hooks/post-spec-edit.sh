#!/usr/bin/env bash
# AXIS post-spec-edit hook — fires after Edit/Write in .ai/skills/** or .ai/rules/**.
# Reminds the agent to run the sync + validate gates before committing.
# Receives the tool input on stdin as JSON (Claude Code hook contract).
set -euo pipefail

source "$(dirname "$0")/_lib.sh"

# Read JSON payload, extract file_path if present.
PAYLOAD="$(cat || true)"
FILE_PATH="$(printf '%s' "$PAYLOAD" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]+"' | head -1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"

case "$FILE_PATH" in
  *.ai/skills/*|*.ai/rules/*)
    axis_log_event "spec:edit" "file=$FILE_PATH"
    echo "[axis] spec edited: $FILE_PATH"
    echo "[axis] before commit: bash scripts/sync-cli-templates.sh && bash scripts/validate-axis.sh"
    ;;
  *.ai/INSTRUCTIONS.md|*/CLAUDE.md|*/AGENTS.md)
    axis_log_event "spec:edit" "file=$FILE_PATH"
    echo "[axis] entry-point edited: $FILE_PATH"
    echo "[axis] before commit: bash scripts/validate-axis.sh (line-count gate)"
    ;;
esac
