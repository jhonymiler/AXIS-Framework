# Phase 1 — Backup

## Purpose

Create a complete, timestamped archive of the current `.ai/` directory before any framework file is overwritten. This is the safety net for the entire re-bootstrap operation.

## Steps

```bash
ISO_TS=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p .ai/.archive/"$ISO_TS"
cp -r .ai/INSTRUCTIONS.md .ai/CONVENTIONS.md .ai/docs/ .ai/skills/ .ai/rules/ \
      .ai/.archive/"$ISO_TS"/
# Record old version
OLD_VER=$(cat .ai/.axis-version 2>/dev/null || echo "unknown")
echo "$OLD_VER" > .ai/.archive/"$ISO_TS"/.axis-version-at-backup
```

## Spot-check (3 files)

After copy, confirm:
1. `.ai/.archive/<ISO>/INSTRUCTIONS.md` exists and has content
2. `.ai/.archive/<ISO>/docs/STATE.md` exists
3. `.ai/.archive/<ISO>/skills/` directory has at least 1 skill

## What is NOT archived

- `scripts/` (hooks/scripts — framework-owned, safe to overwrite without backup)
- `.claude/settings.json` (user is asked separately in Phase 3 whether to update)
- Any non-`.ai/` project code

## Gate

> "Archive at `.ai/.archive/<ISO>/` confirmed. Old version: `<ver>`. Proceed to Phase 2?"
