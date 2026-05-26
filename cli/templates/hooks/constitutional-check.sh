#!/usr/bin/env bash
# constitutional-check.sh — prints inviolable rules before Write/Edit.
#
# Wired as a PreToolUse hook (matcher: Write|Edit) in .claude/settings.json.
# Non-blocking: always exits 0. The agent reads the printed gates and decides
# whether to comply or to ask the user for an explicit waiver.
#
# Source of truth: .ai/rules/constitutional.md (chosen at `axis init` time
# based on the project preset / stack).

set -euo pipefail

RULES_FILE=".ai/rules/constitutional.md"

if [ ! -f "$RULES_FILE" ]; then
  exit 0
fi

# Extract only Article headings and Gate lines — keep noise low so the model
# doesn't drown the surrounding context.
echo "─── Constitutional check ───"
grep -E "^## Article|^\*\*Gate:\*\*" "$RULES_FILE" | sed 's/^/  /'
echo "─── (see $RULES_FILE for full text) ───"

exit 0
