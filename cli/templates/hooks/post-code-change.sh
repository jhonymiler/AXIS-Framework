#!/usr/bin/env bash
# post-code-change hook — fires after Edit/Write in src/** files.
# Self-contained: no dependency on the axis CLI after bootstrap.
# Flags potential drift between code structure and .ai/INSTRUCTIONS.md.
# Receives the tool input on stdin as JSON (Claude Code hook contract).
set -euo pipefail

source "$(dirname "$0")/_lib.sh"

PAYLOAD="$(cat || true)"
FILE_PATH="$(printf '%s' "$PAYLOAD" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]+"' | head -1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"

# Only act on files inside src/ (or equivalent — adjust SRC_ROOT if needed)
SRC_ROOT="${AXIS_SRC_ROOT:-src}"

if [[ "$FILE_PATH" != ${SRC_ROOT}/* ]]; then
  exit 0
fi

axis_log_event "hook:fired" "name=post-code-change" "file=$FILE_PATH"

# Detect structural change (new file or deleted file pattern — renames show as two events)
if [[ ! -f "$FILE_PATH" ]]; then
  # File was deleted — possible ghost reference in docs
  MODULE_DIR="$(dirname "$FILE_PATH")"
  echo "[docs] deleted: $FILE_PATH — check if INSTRUCTIONS.md references this path"
  exit 0
fi

# For new directories (first file in a new module), flag missing skill coverage
DIR_NAME="$(dirname "$FILE_PATH" | sed "s|^${SRC_ROOT}/||" | cut -d'/' -f1)"
if [[ -n "$DIR_NAME" && ! -f ".ai/skills/${DIR_NAME}/SKILL.md" ]]; then
  echo "[docs] new module candidate: '${DIR_NAME}' has no .ai/skills/${DIR_NAME}/SKILL.md"
  echo "[docs] if this is a domain module, consider creating a skill (see skill-emergence rule)"
fi

# Run full drift check if the script is available
if [[ -f scripts/check-doc-drift.sh ]]; then
  bash scripts/check-doc-drift.sh --quick 2>/dev/null || true
fi
