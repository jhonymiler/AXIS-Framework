# STATE — AXIS Framework Playbook

> Curated memory of the AXIS framework itself. This repo is **self-applicable**: the framework follows the pattern it teaches. Read at session start. Update at session end. Curate (do not just append).

## Active Decisions

- **Harness-first positioning** — settings.json/hooks precede prompt optimization. Differentiator vs Spec Kit / Kiro / Tessl.
- **Three-layer model** — Spec / Harness / Memory. Memory layer (ACE-inspired) is the addition vs literature.
- **REASONS Canvas** is the SPDD artifact (R/E/A/S₁/O/N/S₂ — aligned with [Fowler 2025](https://martinfowler.com/articles/structured-prompt-driven)) bound by `story-decompose → alignment → abstraction-first → iterative-review`. Defined in `.ai/skills/axis-bootstrap/references/CANVAS-REASONS.md`.
- **`axis` CLI** (Node + Clack + picocolors) lives in `cli/`. It scaffolds artifacts and orchestrates the SPDD workflow; the actual filling of Canvas sections is done by the AI tool (Claude/Cursor/etc.). Commands: `init`, `audit`, `doctor`, `link`, `state`, `spdd <step>`.
- **Recursiveness is a contract** — if `.ai/` here breaks any rule the framework teaches, it is a bug.

## In Progress

- (none — bootstrap of recursive infrastructure complete)

## Blockers

- (none)

## Deferred Ideas

- Add `.ai/rules/` examples in this repo (knowledge-verification.md, doc-maintenance.md) once a real consumer demands them
- Optional Phase 6 in PLANNER.md for post-bootstrap iterative review hook
- Failure-attribution telemetry hook (PostToolUse) — currently described, not implemented

## Lessons Learned

- Skills imported from external sources (story-decompose, alignment, abstraction-first, iterative-review) referenced REASONS Canvas without the Canvas existing in the repo — **rule:** never import a skill that depends on an undefined artifact; either define the artifact or rewrite the skill to be self-contained.
- PATTERNS.md numbering drifted (5/6/10 duplicated) when sections were appended without checking the existing index — **rule:** PATTERNS additions must reuse the index table as a checklist.
- The repo proclaiming Harness-first while having no `settings.json` or hooks broke its own recursiveness contract for months — **rule:** any framework claim must be auditable inside this repo.

## TODOs

- [ ] Validate symlinks resolve in fresh clone (`ls -la` smoke test)
- [ ] Add CI check for SKILL.md ≤ 60 lines and INSTRUCTIONS ≤ 180 lines
- [ ] Document Canvas REASONS letters in FRAMEWORK.md once template is stable
