#!/usr/bin/env bash
# AXIS stop hook — fires when the agent finishes a turn.
# Reminds to curate STATE.md if Active Decisions / Blockers / In Progress changed.
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
axis_log_event "hook:fired" "name=stop"

# Cheap check: did this session edit .ai/ or scripts/ but not STATE.md?
if git diff --name-only HEAD 2>/dev/null | grep -qE '^\.ai/(skills|rules)/|^scripts/' && \
   ! git diff --name-only HEAD 2>/dev/null | grep -q '^\.ai/docs/STATE\.md$'; then
  echo "[axis] spec/scripts changed but STATE.md untouched"
  echo "[axis] consider adding a dated Active Decision (see .ai/rules/documentation-maintenance.md)"
fi
