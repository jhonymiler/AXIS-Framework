#!/usr/bin/env bash
# setup-ide-links.sh — Idempotent multi-IDE symlink installer for AXIS.
#
# Uses `ln -sfn` for directory targets so re-running this script repoints
# existing symlinks-to-directories instead of nesting a new link inside
# the old target.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d .ai ]; then
  echo "error: .ai/ not found — run from project root" >&2
  exit 1
fi

ln -sf  .ai/INSTRUCTIONS.md AGENTS.md
ln -sf  .ai/INSTRUCTIONS.md CLAUDE.md

mkdir -p .claude
ln -sf  ../.ai/INSTRUCTIONS.md .claude/CLAUDE.md
ln -sfn ../.ai/skills          .claude/skills
[ -d .ai/rules ] && ln -sfn ../.ai/rules .claude/rules || true

mkdir -p .cursor
ln -sfn ../.ai/skills .cursor/skills
[ -d .ai/rules ] && ln -sfn ../.ai/rules .cursor/rules || true

mkdir -p .agents
ln -sf  ../.ai/INSTRUCTIONS.md .agents/AGENTS.md
ln -sfn ../.ai/skills          .agents/skills
[ -d .ai/rules ] && ln -sfn ../.ai/rules .agents/rules || true

mkdir -p .github
ln -sf  ../.ai/INSTRUCTIONS.md .github/copilot-instructions.md
ln -sfn ../.ai/skills          .github/skills
# .github/instructions is Copilot Code Review's path-targeted instructions
# directory. It needs *.instructions.md files with `applyTo:` frontmatter —
# different format from .ai/rules/. If your project uses Copilot Code Review,
# axis-bootstrap Phase 3 creates .ai/instructions/ with starter files; this
# symlink then exposes them. Otherwise the line is a no-op.
[ -d .ai/instructions ] && ln -sfn ../.ai/instructions .github/instructions || true

echo "✓ symlinks installed"
