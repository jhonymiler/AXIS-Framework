#!/usr/bin/env bash
# setup-ide-links.sh — Idempotent multi-IDE symlink installer for AXIS.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d .ai ]; then
  echo "error: .ai/ not found — run from project root" >&2
  exit 1
fi

ln -sf .ai/INSTRUCTIONS.md AGENTS.md
ln -sf .ai/INSTRUCTIONS.md CLAUDE.md

mkdir -p .claude
ln -sf ../.ai/INSTRUCTIONS.md .claude/CLAUDE.md
ln -sf ../.ai/skills          .claude/skills
[ -d .ai/rules ] && ln -sf ../.ai/rules .claude/rules || true

mkdir -p .cursor
ln -sf ../.ai/skills .cursor/skills
[ -d .ai/rules ] && ln -sf ../.ai/rules .cursor/rules || true

mkdir -p .agents
ln -sf ../.ai/INSTRUCTIONS.md .agents/AGENTS.md
ln -sf ../.ai/skills          .agents/skills
[ -d .ai/rules ] && ln -sf ../.ai/rules .agents/rules || true

mkdir -p .github
ln -sf ../.ai/INSTRUCTIONS.md .github/copilot-instructions.md
ln -sf ../.ai/skills          .github/skills
[ -d .ai/rules ] && ln -sf ../.ai/rules .github/instructions || true

echo "✓ symlinks installed"
