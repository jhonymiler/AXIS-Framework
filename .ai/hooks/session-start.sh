#!/usr/bin/env bash
# AXIS session-start hook — operationalizes .ai/rules/session-start.md
# Prints the curated playbook header so the agent sees state before first action.
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
axis_log_event "hook:fired" "name=session-start"

STATE_FILE=".ai/docs/STATE.md"
if [[ ! -f "$STATE_FILE" ]]; then
  echo "[axis] no STATE.md found — propose creating one before substantive work"
  exit 0
fi

echo "─── AXIS session start — hot tier ───"
if command -v axis >/dev/null 2>&1; then
  axis state hot 2>/dev/null || awk '
    /^## (Active Decisions|In Progress|Blockers)/ { p=1; print; next }
    /^## / { p=0 }
    p { print }
  ' "$STATE_FILE"
else
  # Fallback when axis CLI is not installed globally — print Active Decisions, In Progress, Blockers up to next ## header.
  awk '
    /^## (Active Decisions|In Progress|Blockers)/ { p=1; print; next }
    /^## / { p=0 }
    p { print }
  ' "$STATE_FILE"
fi
echo "─── end ───"
echo "[axis] acknowledge state in one line before the first modifying tool call (see .ai/rules/session-start.md)"
