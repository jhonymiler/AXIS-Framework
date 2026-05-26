# Phase 4 — Consolidate

## Purpose

Re-integrate domain content that may be incompatible with the new framework format. This phase fires only when triggered — it does not blindly overwrite anything.

## Trigger Checks

Run all three checks. If any triggers, enter the consolidation loop for that file.

### Check A — INSTRUCTIONS.md

Compare structural sections between:
- New template: `cli/templates/INSTRUCTIONS.md`
- Backup: `.ai/.archive/<ISO>/INSTRUCTIONS.md`

**Trigger condition:** New template has sections that don't exist in backup.

**Action:** Show the new sections. Ask: "Adopt these sections into your INSTRUCTIONS.md? [y/N per section]"

### Check B — STATE.md

Compare sections between new template and backup.

**Trigger condition:** New template adds sections (e.g., new tier names, new required headings).

**Action:** Same as Check A — show, ask, apply per-section.

### Check C — Custom rules overlap

For each custom rule in `.ai/rules/` (not in the framework-owned list):
Check if its `applyTo` pattern now conflicts with a new baseline rule.

**Trigger condition:** Overlap detected.

**Action:** Show overlap side-by-side. Ask: "Rename, merge, or keep both?"

## If No Triggers Fire

```
✓ No consolidation needed — domain content is compatible with the new framework version.
```

Proceed directly to Phase 5.

## Gate

> "All triggered consolidations resolved. Domain content intact. Proceed to Phase 5?"
