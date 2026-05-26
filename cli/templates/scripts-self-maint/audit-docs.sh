#!/usr/bin/env bash
# audit-docs.sh — k-trial cold start simulation for bootstrapped projects.
# Validates that the AI documentation layer is self-sufficient for onboarding
# a new agent with zero prior context.
#
# Three trials simulated:
#   1. "Can the agent describe the system from INSTRUCTIONS.md alone?"
#   2. "Can the agent find the right skill for a domain query via its description?"
#   3. "Can the agent resume an in-progress task from STATE.md alone?"
#
# Exit codes:
#   0 — all 3 trials pass
#   1 — one or more trials fail (details printed)
set -euo pipefail

INSTRUCTIONS=".ai/INSTRUCTIONS.md"
SKILLS_DIR=".ai/skills"
STATE=".ai/docs/STATE.md"
EXIT_CODE=0

log_pass() { echo "  ✓  $*"; }
log_fail() { echo "  ✗  $*"; EXIT_CODE=1; }
log_warn() { echo "  ⚠  $*"; }
log_info() { echo "  →  $*"; }

echo "[audit] k-trial documentation cold start"
echo ""

# ── Trial 1: INSTRUCTIONS.md self-sufficiency ────────────────────────────────

echo "Trial 1 — INSTRUCTIONS.md describes the system"
echo "────────────────────────────────────────────────"

if [[ ! -f "$INSTRUCTIONS" ]]; then
  log_fail "INSTRUCTIONS.md not found"
else
  line_count=$(wc -l < "$INSTRUCTIONS")
  log_info "Line count: $line_count"

  # Must be in the 100-180 line range
  if (( line_count < 100 )); then
    log_fail "Too short (${line_count} lines < 100 minimum) — agent lacks enough context"
  elif (( line_count > 180 )); then
    log_fail "Too long (${line_count} lines > 180 maximum) — agent context will be dominated by docs"
  else
    log_pass "Line count ${line_count} is within 100-180 range"
  fi

  # Must have a module/component table
  if grep -q '|' "$INSTRUCTIONS"; then
    table_rows=$(grep -c '^|' "$INSTRUCTIONS" || true)
    log_pass "Has table structure (${table_rows} rows)"
  else
    log_fail "No table found — INSTRUCTIONS.md must describe modules in table form"
  fi

  # Must have at least one skill reference
  if grep -qiE 'skill|\.ai/' "$INSTRUCTIONS"; then
    log_pass "References skills or .ai/ structure"
  else
    log_warn "No skill references found — agent may not know how to load domain knowledge"
  fi
fi

echo ""

# ── Trial 2: Skill routing via descriptions ──────────────────────────────────

echo "Trial 2 — skills discoverable by description"
echo "────────────────────────────────────────────────"

if [[ ! -d "$SKILLS_DIR" ]]; then
  log_fail "$SKILLS_DIR not found"
else
  skill_count=0
  missing_desc=0
  duplicate_desc=()
  declare -A desc_map

  for skill_file in "$SKILLS_DIR"/*/SKILL.md; do
    [[ -f "$skill_file" ]] || continue
    skill_name="$(basename "$(dirname "$skill_file")")"
    skill_count=$((skill_count + 1))

    desc="$(grep -oP '^description:\s*\K.+' "$skill_file" || true)"

    if [[ -z "$desc" ]]; then
      log_fail "$skill_name — missing 'description:' in frontmatter"
      missing_desc=$((missing_desc + 1))
    else
      # Check uniqueness (first 40 chars)
      key="${desc:0:40}"
      if [[ -n "${desc_map[$key]+_}" ]]; then
        duplicate_desc+=("$skill_name vs ${desc_map[$key]}")
      fi
      desc_map["$key"]="$skill_name"

      # Check length (description must be >20 chars to be useful for routing)
      if (( ${#desc} < 20 )); then
        log_warn "$skill_name — description too short (${#desc} chars) — routing may fail"
      else
        log_pass "$skill_name — has description (${#desc} chars)"
      fi
    fi
  done

  if (( skill_count == 0 )); then
    log_warn "No skills found in $SKILLS_DIR — expected at least 1"
  fi

  for dup in "${duplicate_desc[@]}"; do
    log_fail "Duplicate description prefix: $dup — routing will be ambiguous"
  done
fi

echo ""

# ── Trial 3: STATE.md task resumption ───────────────────────────────────────

echo "Trial 3 — STATE.md enables task resumption"
echo "────────────────────────────────────────────────"

if [[ ! -f "$STATE" ]]; then
  log_fail "STATE.md not found — agent cannot resume work across sessions"
else
  state_lines=$(wc -l < "$STATE")
  log_info "Line count: $state_lines"

  # Check required sections
  for section in "Active Decisions" "In Progress" "Blockers"; do
    if grep -q "## ${section}" "$STATE"; then
      log_pass "Has section: $section"
    else
      log_fail "Missing section: $section"
    fi
  done

  # Warn if file is too large (>80 lines = diary creep)
  if (( state_lines > 80 )); then
    log_warn "STATE.md is ${state_lines} lines (>80 — curate to keep it scannable)"
  fi

  # Warn if "In Progress" section is empty
  in_progress_content=$(awk '/## In Progress/,/^## /' "$STATE" | grep -vE '^##|^\s*$' | head -5 || true)
  if [[ -z "$in_progress_content" ]]; then
    log_warn "In Progress section appears empty — is everything actually complete?"
  else
    log_pass "In Progress has content"
  fi
fi

# ── Summary ──────────────────────────────────────────────────────────────────

echo ""
echo "────────────────────────────────────────────────"
if [[ $EXIT_CODE -eq 0 ]]; then
  echo "[audit] all 3 trials passed — documentation layer is self-sufficient"
else
  echo "[audit] one or more trials failed — load documentation-guardian skill to repair"
fi
exit $EXIT_CODE
