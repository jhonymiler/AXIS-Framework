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
for skill in abstraction-first alignment iterative-review story-decompose project-review; do
  cp .ai/skills/$skill/SKILL.md cli/templates/skills/$skill.md
done

echo "Synced .ai/skills/ → cli/templates/"
