# Phase 2 — Diff

## Purpose

Compute the set of changes between the installed CLI version's templates and the files currently in the project. Classify each file so the user can make an informed decision.

## Classification Rules

| Class               | Condition                                                   | Action in Phase 3          |
| ------------------- | ----------------------------------------------------------- | -------------------------- |
| `IDENTICAL`         | template == project file                                    | Skip                       |
| `FRAMEWORK-CHANGED` | template ≠ project file AND file is in framework-owned list | Safe to overwrite          |
| `DOMAIN-MODIFIED`   | template ≠ project file AND file is in domain list          | Phase 4 re-integration     |
| `NEW`               | template exists, project file does not                      | Copy without user conflict |
| `CUSTOM-ONLY`       | project file exists, no template counterpart                | Never touch                |

## Framework-owned file list (for diff comparison)

```
.ai/rules/engineering-discipline.md
.ai/rules/context-economy.md
.ai/rules/knowledge-verification.md
.ai/rules/session-start.md
.ai/skills/axis-bootstrap/   (entire tree)
.ai/skills/axis-rebootstrap/ (entire tree)
.ai/skills/documentation-guardian/ (if present)
scripts/post-spec-edit.sh
scripts/post-code-change.sh
scripts/check-doc-drift.sh
scripts/audit-docs.sh
```

## Domain-owned file list (never auto-overwrite)

```
.ai/INSTRUCTIONS.md
.ai/CONVENTIONS.md
.ai/docs/STATE.md
.ai/skills/<anything not in framework list>
.ai/rules/<anything not in framework list>
```

## Output Template

```
━━━ AXIS Re-bootstrap Diff ━━━
Old version: <old>   New version: <new>

FRAMEWORK-CHANGED (<N> files — will be overwritten):
  .ai/rules/engineering-discipline.md
  ...

DOMAIN-MODIFIED (<M> files — Phase 4 will re-integrate):
  .ai/INSTRUCTIONS.md
  ...

NEW (<K> files — will be added):
  .ai/skills/documentation-guardian/SKILL.md
  ...

IDENTICAL (<J> files — skipped):
  (count only)

CUSTOM-ONLY (<L> files — never touched):
  .ai/skills/my-custom-skill/SKILL.md
  ...
```

## Gate

User reviews the diff output and responds "proceed" (or "cancel"). No files are written in this phase.
