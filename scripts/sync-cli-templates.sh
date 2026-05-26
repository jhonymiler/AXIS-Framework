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

# 4) Harness hooks (Claude Code SessionStart / PostToolUse / Stop).
# Generic, Claude-specific (no other IDE consumes these yet).
mkdir -p cli/templates/hooks
for hook in _lib session-start post-spec-edit post-code-change stop; do
  if [ -f ".ai/hooks/$hook.sh" ]; then
    cp ".ai/hooks/$hook.sh" "cli/templates/hooks/$hook.sh"
  elif [ -f "cli/templates/hooks/$hook.sh" ]; then
    : # kept as project-agnostic template — no live counterpart in AXIS
  fi
done

# 5) Specialists (agents created from discoverer output in Phase 4.5).
mkdir -p cli/templates/bootstrap-skill/agents/specialists
rsync -a --delete \
  .ai/skills/axis-bootstrap/agents/specialists/ \
  cli/templates/bootstrap-skill/agents/specialists/

# 6) Re-bootstrap skill (sibling to axis-bootstrap — distributable to projects).
rsync -a --delete \
  .ai/skills/axis-rebootstrap/ \
  cli/templates/rebootstrap-skill/

# 7) Delta skill (F9 — brownfield change specification; skill-driven, no CLI).
rsync -a --delete \
  .ai/skills/axis-delta/ \
  cli/templates/delta-skill/

# 8) Specify skill (F12 — greenfield feature scaffolding; skill-driven, no CLI).
rsync -a --delete \
  .ai/skills/axis-specify/ \
  cli/templates/specify-skill/

echo "Synced .ai/skills/ + .ai/rules/ + .ai/hooks/ + specialists + rebootstrap-skill + delta-skill + specify-skill → cli/templates/"
