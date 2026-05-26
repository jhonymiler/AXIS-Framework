# AXIS Re-bootstrap — Planner

> Orchestration for the 5-phase re-bootstrap cycle. Each phase has a mandatory gate. Do not advance without explicit user confirmation.

---

## Pre-flight

Before Phase 1, verify both conditions:
1. `.ai/INSTRUCTIONS.md` exists in the target directory
2. `.ai/.axis-version` exists (or user explicitly confirms this is a prior AXIS project)

If conditions fail → stop and suggest running `axis-bootstrap` instead.

---

## Phase 1 — Backup

**Goal:** Preserve the entire `.ai/` tree before any write.

**Steps:**
1. Read current timestamp → `ISO_TS=$(date -u +%Y%m%dT%H%M%SZ)`
2. `cp -r .ai/ .ai/.archive/$ISO_TS/`
3. Record old version: `OLD_VER=$(cat .ai/.axis-version 2>/dev/null || echo "unknown")`
4. Confirm archive is readable (spot-check 3 files)

**Gate:** Archive exists at `.ai/.archive/<ISO>/` and passes spot-check. State old version.

---

## Phase 2 — Diff

**Goal:** Show exactly what the new CLI version would change.

**Steps:**
1. Read `.ai/.axis-version` → current version
2. Read new version from `axis --version` or `cli/package.json`
3. Enumerate AXIS-owned template files (see Phase 3 reference for full list)
4. `diff` each template (new CLI) vs current project file → classify as:
   - `IDENTICAL` — no action needed
   - `FRAMEWORK-CHANGED` — safe to overwrite (user can review)
   - `DOMAIN-MODIFIED` — user has customized; Phase 4 will re-integrate

**Output format:**
```
FRAMEWORK-CHANGED (N files):  [list]
DOMAIN-MODIFIED (M files):    [list]
IDENTICAL (K files):          [count]
```

**Gate:** User reviews summary and confirms "proceed with apply".

---

## Phase 3 — Apply

**Goal:** Update framework-owned files; leave domain files untouched.

**Framework-owned files** (safe to overwrite):
- `.ai/rules/*.md` (all 4 baseline rules)
- `.ai/skills/axis-bootstrap/` (full tree)
- `.ai/skills/axis-rebootstrap/` (full tree — self-update)
- `.ai/skills/documentation-guardian/` (if present)
- `scripts/post-spec-edit.sh`, `scripts/post-code-change.sh`
- `scripts/check-doc-drift.sh`, `scripts/audit-docs.sh`
- `.claude/settings.json` (only if user opts in — `--update-settings` flag)

**Domain-owned files** (never overwrite automatically):
- `.ai/INSTRUCTIONS.md`
- `.ai/CONVENTIONS.md`
- `.ai/docs/STATE.md`
- `.ai/skills/<custom>/` (skills not in AXIS default set)
- `.ai/rules/<custom>.md` (rules not in AXIS default set)

**Steps:**
1. For each `FRAMEWORK-CHANGED` file: copy new template over existing
2. Stamp `.ai/.axis-version` with new CLI version
3. Report: `Applied N framework files. Domain files untouched: M.`

**Gate:** Applied file list confirmed. `.axis-version` updated.

---

## Phase 4 — Consolidate

**Goal:** Re-integrate domain content that may need updating for the new framework format.

**Trigger checks** (run each — if any triggers, proceed with that check):
- Did `INSTRUCTIONS.md` template gain new required sections? → Show diff of template sections; user decides what to adopt
- Did `STATE.md` template gain new required sections? → Same
- Did baseline rules change in ways that affect custom rules? → Highlight overlap

**If no triggers fire:** Skip to Phase 5 with note "No consolidation needed — domain content compatible."

**Steps (when triggered):**
1. Open backup version: `.ai/.archive/<ISO>/<file>` (what user had)
2. Open new template: `cli/templates/<file>` (what the framework expects)
3. Show 3-column diff: `[backup] | [new template] | [current (just overwritten or not)]`
4. For each diff: user chooses `keep-mine`, `take-new`, `merge`
5. Apply user decisions

**Gate:** All triggered consolidations resolved. User confirms domain content is intact.

---

## Phase 5 — Validate

**Goal:** Confirm the re-bootstrapped project is healthy.

**Steps:**
1. Run `axis doctor .` (or equivalent local doctor check)
2. Show diff of domain-only files between backup and current state (what changed in Phase 4)
3. List new artifacts added by re-bootstrap that didn't exist before

**Expected outcome:**
- 0 doctor failures
- Domain diff is exactly what user accepted in Phase 4
- New artifacts are listed and acknowledged

**Gate:** Doctor passes. User reviews and accepts the domain diff. Re-bootstrap complete.

---

## Post-bootstrap Note

Update `.ai/docs/STATE.md` Active Decisions with:
```
Re-bootstrapped to AXIS CLI v<new_ver> on <date>. Backup at .ai/.archive/<ISO>/.
```
