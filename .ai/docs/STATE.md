# STATE — AXIS Framework Playbook

> Curated memory of the AXIS framework itself. This repo is **self-applicable**: the framework follows the pattern it teaches. Read at session start. Update at session end. Curate (do not just append).

## Active Decisions

- **[2026-05-17] Discovery Block 4 (Collaboration & Governance)** added — PM tool, commits, branches, PRs, releases. Generates `.ai/rules/workflow.md` in target projects. Propagates through PHASE-2-SPEC, TEMPLATES, PROMPT-TEMPLATE, PHASE-5-VALIDATION, QUICKSTART (live + CLI templates).
- **[2026-05-17] Harness automation in this repo** — `scripts/sync-cli-templates.sh` enforces live ⇄ CLI parity; `scripts/validate-axis.sh` enforces 4 gates (sizes, sync, symlinks); `.github/workflows/validate.yml` runs them on PR/push. Removes dependency on manual discipline.
- **Harness-first positioning** — settings.json/hooks precede prompt optimization. Differentiator vs Spec Kit / Kiro / Tessl.
- **Three-layer model** — Spec / Harness / Memory. Memory layer (ACE-inspired) is the addition vs literature.
- **REASONS Canvas** is the SPDD artifact (R/E/A/S₁/O/N/S₂ — aligned with [Fowler 2025](https://martinfowler.com/articles/structured-prompt-driven)) bound by `story-decompose → alignment → abstraction-first → iterative-review`. Defined in `.ai/skills/axis-bootstrap/references/CANVAS-REASONS.md`.
- **`axis` CLI** (Node + Clack + picocolors) lives in `cli/`. It scaffolds artifacts and orchestrates the SPDD workflow; the actual filling of Canvas sections is done by the AI tool (Claude/Cursor/etc.). Commands: `init`, `audit`, `doctor`, `link`, `state`, `spdd <step>`.
- **Recursiveness is a contract** — if `.ai/` here breaks any rule the framework teaches, it is a bug.

## In Progress

- (none — recursive infrastructure complete, automated gates in place)

## Blockers

- (none)

## Deferred Ideas

- Failure-attribution telemetry **consumer** — JSONL hook is documented in PHASE-3-HARNESS; needs a CLI command (`axis log analyze`) before instrumenting it in this repo
- Skill consolidation review — 4 satellite SPDD skills (story-decompose, alignment, abstraction-first, iterative-review) may merge into a single `spdd` skill with phases. Defer until first external user feedback
- Bilingual README sync — automate or document drift policy between `README.md` and `README.pt.md`
- Optional Phase 6 in PLANNER.md for post-bootstrap iterative review hook

## Lessons Learned

- **Recursiveness violations compound silently** — INSTRUCTIONS.md sat at 62 lines (target 100-180) for months; `.ai/rules/` was empty despite the framework recommending 3-7. Both invisible until an audit. **Rule:** every gate the framework prescribes must be enforced *in this repo* by `scripts/validate-axis.sh` and CI — otherwise it's aspirational, not normative.
- **Discovery-question additions need downstream propagation** — adding a Phase-1 question without updating Phase-2 (artifact), TEMPLATES (template), and Phase-5 (validation) creates dead questions. **Rule:** Block 4 added 6 questions and 5 downstream edits in the same change; replicate this pattern.
- **Live skill ⇄ CLI template sync is a permanent risk** — they were byte-identical by discipline only. **Rule:** `scripts/sync-cli-templates.sh` + CI diff check is the durable fix; never rely on remembering both edits.
- Skills imported from external sources (story-decompose, alignment, abstraction-first, iterative-review) referenced REASONS Canvas without the Canvas existing in the repo — **rule:** never import a skill that depends on an undefined artifact; either define the artifact or rewrite the skill to be self-contained.
- PATTERNS.md numbering drifted (5/6/10 duplicated) when sections were appended without checking the existing index — **rule:** PATTERNS additions must reuse the index table as a checklist.
- The repo proclaiming Harness-first while having no `settings.json` or hooks broke its own recursiveness contract for months — **rule:** any framework claim must be auditable inside this repo.

## TODOs

- [ ] Document Canvas REASONS letters in FRAMEWORK.md once template is stable
- [ ] Decide on skill consolidation (4 SPDD skills → 1) after first external user feedback
- [ ] Add `axis log analyze` command before wiring failure-attribution hooks in this repo
