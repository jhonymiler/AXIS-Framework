---
name: axis-rebootstrap
version: 1.0.0
type: process
description: Re-apply a new version of the AXIS framework to a project that already has a structured .ai/ directory. Sibling to axis-bootstrap — activate only when user wants to upgrade framework artifacts while preserving domain content (rules, skills, STATE, CONVENTIONS). Trigger terms: rebootstrap, upgrade AXIS, update framework, .axis-version, migrate AXIS, apply new version.
---

# AXIS Re-bootstrap

Upgrades AXIS framework artifacts in a project that already has a `.ai/` structure.
Preserves all domain content: custom skills, rules, STATE.md, CONVENTIONS.md.

## When to Use

- User has an existing bootstrapped project and wants to apply a newer AXIS CLI version
- Project has `.ai/INSTRUCTIONS.md` AND `.ai/.axis-version` (indicators of a prior bootstrap)
- User explicitly says "upgrade AXIS", "apply new templates", or "rebootstrap"
- **Do NOT use** for first-time bootstraps — use `axis-bootstrap` instead

## Phase Summary

| Phase | Action | Gate |
|-------|--------|------|
| **1 — Backup** | Copy `.ai/` → `.ai/.archive/<ISO>/` | Archive readable; `.ai-version` stamped |
| **2 — Diff** | Compare `.ai/.axis-version` vs CLI version; list changed templates | User reviews diff summary |
| **3 — Apply** | Overwrite framework files; skip domain files | File list confirmed by user |
| **4 — Consolidate** | Agent reads backup; re-integrates domain content (custom skills, rules, STATE) | User reviews merged result |
| **5 — Validate** | `axis doctor .` + human-readable diff of domain-only changes | 0 doctor failures; diff accepted |

## Execution Principles

1. **Backup first, always** — Phase 1 must complete before any write
2. **Preserve domain** — never overwrite files flagged as domain-owned (see Phase 3 reference)
3. **Show before applying** — present the diff in Phase 2 before touching anything
4. **Re-integrate, don't reset** — Phase 4 is not a re-bootstrap, it's a targeted merge
5. **Validation is non-optional** — Phase 5 gate must pass before handoff

## References

- [PLANNER.md](PLANNER.md) — phase-by-phase orchestration
- [references/PHASE-1-BACKUP.md](references/PHASE-1-BACKUP.md) — archive procedure
- [references/PHASE-2-DIFF.md](references/PHASE-2-DIFF.md) — version comparison
- [references/PHASE-3-APPLY.md](references/PHASE-3-APPLY.md) — framework file update rules
- [references/PHASE-4-CONSOLIDATE.md](references/PHASE-4-CONSOLIDATE.md) — domain content re-integration
- [references/PHASE-5-VALIDATE.md](references/PHASE-5-VALIDATE.md) — doctor + diff gate
