#!/usr/bin/env bash
# check-doc-drift.sh — compares src/ structure against .ai/INSTRUCTIONS.md module table.
# Self-contained: no dependency on the axis CLI after bootstrap.
#
# Usage:
#   bash scripts/check-doc-drift.sh          # full check
#   bash scripts/check-doc-drift.sh --quick  # module-only check (fast, used by hooks)
#
# Exit codes:
#   0 — all checks pass (warnings printed but do not fail)
#   1 — structural drift detected (missing module in docs or ghost entry)
set -euo pipefail

MODE="${1:-}"
SRC_ROOT="${AXIS_SRC_ROOT:-src}"
INSTRUCTIONS=".ai/INSTRUCTIONS.md"
EXIT_CODE=0

# ── Helpers ─────────────────────────────────────────────────────────────────

log_pass()  { echo "  ✓  $*"; }
log_warn()  { echo "  ⚠  $*"; }
log_fail()  { echo "  ✗  $*"; EXIT_CODE=1; }

# ── Guard: project structure ─────────────────────────────────────────────────

if [[ ! -f "$INSTRUCTIONS" ]]; then
  echo "[drift] $INSTRUCTIONS not found — nothing to check"
  exit 0
fi

if [[ ! -d "$SRC_ROOT" ]]; then
  echo "[drift] $SRC_ROOT/ not found — adjust AXIS_SRC_ROOT env var if your source root differs"
  exit 0
fi

echo "[drift] checking documentation drift..."
echo ""

# ── CHK-001 / CHK-002 — Module inventory ─────────────────────────────────────

echo "── Module Inventory ────────────────────────────────────"

# Collect top-level directories under src/ (one level deep, ignoring _ prefixed)
SRC_MODULES="$(find "$SRC_ROOT" -mindepth 1 -maxdepth 1 -type d ! -name '_*' ! -name '.*' | sed "s|^${SRC_ROOT}/||" | sort)"

# Extract module names from INSTRUCTIONS.md table (backtick-quoted identifiers in table rows)
DOC_MODULES="$(grep -oP '\`[a-z][a-z0-9/_-]+\`' "$INSTRUCTIONS" | tr -d '\`' | sort -u)"

# Check each src module appears in docs
while IFS= read -r mod; do
  [[ -z "$mod" ]] && continue
  if echo "$DOC_MODULES" | grep -qF "$mod"; then
    log_pass "src/$mod — documented"
  else
    log_fail "src/$mod — NOT found in $INSTRUCTIONS (add a table row)"
  fi
done <<< "$SRC_MODULES"

# Check each doc module exists in src
while IFS= read -r mod; do
  [[ -z "$mod" ]] && continue
  if [[ -d "${SRC_ROOT}/${mod}" ]] || [[ -f "${SRC_ROOT}/${mod}.ts" ]] || [[ -f "${SRC_ROOT}/${mod}.js" ]] || [[ -f "${SRC_ROOT}/${mod}.py" ]]; then
    : # exists
  else
    log_warn "INSTRUCTIONS references '$mod' but no matching path in $SRC_ROOT/ (ghost entry?)"
  fi
done <<< "$DOC_MODULES"

# Early exit for --quick mode
if [[ "$MODE" == "--quick" ]]; then
  echo ""
  if [[ $EXIT_CODE -eq 0 ]]; then
    echo "[drift] quick check passed"
  else
    echo "[drift] quick check found drift — run without --quick for full report"
  fi
  exit $EXIT_CODE
fi

# ── CHK-010 — Skill coverage ─────────────────────────────────────────────────

echo ""
echo "── Skill Coverage ──────────────────────────────────────"

while IFS= read -r mod; do
  [[ -z "$mod" ]] && continue
  if [[ -f ".ai/skills/${mod}/SKILL.md" ]]; then
    log_pass "$mod — has skill"
  else
    log_warn "$mod — no .ai/skills/${mod}/SKILL.md (advisory — infrastructure modules may not need one)"
  fi
done <<< "$SRC_MODULES"

# ── CHK-020 — Specialist freshness ──────────────────────────────────────────

echo ""
echo "── Specialist Freshness ────────────────────────────────"

STALE_DAYS=30
NOW_EPOCH=$(date +%s)

for agent_file in .claude/agents/*-keeper.md .claude/agents/*-guardian.md .claude/agents/*-architect.md 2>/dev/null; do
  [[ -f "$agent_file" ]] || continue
  agent_name="$(basename "$agent_file" .md)"
  extracted_at="$(grep -oP '\{\{EXTRACTED_AT\}\}|\d{4}-\d{2}-\d{2}' "$agent_file" | grep -vF '{{' | head -1 || true)"
  if [[ -z "$extracted_at" ]]; then
    log_warn "$agent_name — EXTRACTED_AT not set (specialist not yet populated)"
    continue
  fi
  agent_epoch=$(date -d "$extracted_at" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$extracted_at" +%s 2>/dev/null || echo 0)
  age_days=$(( (NOW_EPOCH - agent_epoch) / 86400 ))
  if [[ $age_days -gt $STALE_DAYS ]]; then
    log_warn "$agent_name — last extracted ${age_days}d ago (>${STALE_DAYS}d threshold)"
  else
    log_pass "$agent_name — extracted ${age_days}d ago"
  fi
done

# ── CHK-030 — Rule applyTo paths ─────────────────────────────────────────────

echo ""
echo "── Rule applyTo Globs ──────────────────────────────────"

for rule_file in .ai/rules/*.md; do
  [[ -f "$rule_file" ]] || continue
  apply_to="$(grep -oP '^applyTo:\s*"\K[^"]+' "$rule_file" || true)"
  [[ -z "$apply_to" ]] && continue
  # Expand glob; if nothing matches, warn
  if compgen -G "$apply_to" > /dev/null 2>&1; then
    log_pass "$(basename "$rule_file") — applyTo '$apply_to' resolves"
  else
    log_warn "$(basename "$rule_file") — applyTo '$apply_to' matches nothing (dead glob)"
  fi
done

# ── Summary ──────────────────────────────────────────────────────────────────

echo ""
if [[ $EXIT_CODE -eq 0 ]]; then
  echo "[drift] all checks passed"
else
  echo "[drift] drift detected — load documentation-guardian skill to repair"
fi
exit $EXIT_CODE
