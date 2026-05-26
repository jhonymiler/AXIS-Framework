#!/usr/bin/env bash
# sync-cli-templates.sh
# Mirrors the live skill tree (.ai/skills/) into the CLI distributable
# templates (cli/templates/). Top-level templates (INSTRUCTIONS.md,
# STATE.md, CONVENTIONS.md, settings.json, setup-ide-links.sh) are NOT
# synced — they are parametrized templates for new projects, intentionally
# distinct from the live spec.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# 1) axis-bootstrap skill (full tree, including references/)
rsync -a --delete \
  .ai/skills/axis-bootstrap/ \
  cli/templates/bootstrap-skill/

# 2) Satellite skills: flatten SKILL.md → <name>.md
for skill in abstraction-first alignment iterative-review story-decompose; do
  cp .ai/skills/$skill/SKILL.md cli/templates/skills/$skill.md
done

# 3) Universal rules (always-on behavior shipped to every new project).
# AXIS-specific rules (workflow.md, documentation-maintenance.md) are NOT propagated.
mkdir -p cli/templates/rules
for rule in engineering-discipline context-economy knowledge-verification session-start; do
  cp .ai/rules/$rule.md cli/templates/rules/$rule.md
done

# 4) Harness hooks (Claude Code SessionStart / PostToolUse / Stop).
# Generic, Claude-specific (no other IDE consumes these yet).
mkdir -p cli/templates/hooks
for hook in _lib session-start post-spec-edit stop; do
  cp .ai/hooks/$hook.sh cli/templates/hooks/$hook.sh
done

echo "Synced .ai/skills/ + .ai/rules/ + .ai/hooks/ → cli/templates/"
