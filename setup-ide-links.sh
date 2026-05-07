#!/usr/bin/env bash
# setup-ide-links.sh — Idempotent multi-IDE symlink installer for AXIS.
#
# Creates the symlink fan-out from .ai/ (single source of truth) into
# IDE-specific directories. Safe to re-run: ln -sf overwrites existing links
# of the same name without touching real files.
#
# Run from project root:
#   bash setup-ide-links.sh

set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d .ai ]; then
  echo "error: .ai/ not found — run from AXIS root" >&2
  exit 1
fi

echo "→ root entry points"
ln -sf .ai/INSTRUCTIONS.md AGENTS.md
ln -sf .ai/INSTRUCTIONS.md CLAUDE.md

echo "→ Claude Code (.claude/)"
mkdir -p .claude
ln -sf ../.ai/INSTRUCTIONS.md .claude/CLAUDE.md
ln -sf ../.ai/skills          .claude/skills
[ -d .ai/rules ] && ln -sf ../.ai/rules .claude/rules || true

echo "→ Cursor (.cursor/)"
mkdir -p .cursor
ln -sf ../.ai/skills          .cursor/skills
[ -d .ai/rules ] && ln -sf ../.ai/rules .cursor/rules || true

echo "→ Generic agents (.agents/)"
mkdir -p .agents
ln -sf ../.ai/INSTRUCTIONS.md .agents/AGENTS.md
ln -sf ../.ai/skills          .agents/skills
[ -d .ai/rules ] && ln -sf ../.ai/rules .agents/rules || true

echo "→ GitHub Copilot (.github/)"
mkdir -p .github
ln -sf ../.ai/INSTRUCTIONS.md .github/copilot-instructions.md
ln -sf ../.ai/skills          .github/skills
[ -d .ai/rules ] && ln -sf ../.ai/rules .github/instructions || true

echo
echo "✓ symlinks installed. Verify:"
echo "  ls -la AGENTS.md CLAUDE.md .claude .cursor .agents .github"
