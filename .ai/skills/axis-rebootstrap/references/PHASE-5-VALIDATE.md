# Phase 5 — Validate

## Purpose

Confirm the re-bootstrapped project is healthy and the domain content is exactly what the user accepted in Phase 4.

## Steps

### Step 1 — Doctor check

```bash
axis doctor .
```

Expected output: 0 failures. Warnings are acceptable if pre-existing.

### Step 2 — Domain diff

Show a diff between the Phase 1 backup and current state, **limited to domain-owned files only**:

```bash
diff -r .ai/.archive/<ISO>/INSTRUCTIONS.md .ai/INSTRUCTIONS.md
diff -r .ai/.archive/<ISO>/docs/STATE.md .ai/docs/STATE.md
diff -r .ai/.archive/<ISO>/CONVENTIONS.md .ai/CONVENTIONS.md
```

This diff should match exactly what the user accepted in Phase 4 consolidation. If it doesn't, flag the discrepancy.

### Step 3 — New artifacts

List files that exist now but did NOT exist at backup time:
```bash
diff <(ls .ai/.archive/<ISO>/ | sort) <(ls .ai/ | sort)
```

### Step 4 — Update STATE.md

Append to `Active Decisions` in `.ai/docs/STATE.md`:
```markdown
Re-bootstrapped to AXIS CLI v<new_ver> on <YYYY-MM-DD>.
Backup preserved at .ai/.archive/<ISO>/.
```

## Gate

> "0 doctor failures. Domain diff matches accepted changes. Re-bootstrap complete."

If doctor fails: do NOT mark complete. Debug and fix before closing.
