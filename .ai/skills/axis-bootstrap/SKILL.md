---
name: axis-bootstrap
description: Bootstrap any project — software or non-technical — with a complete Spec + Harness + Memory structure for AI-augmented work. Harness-first: permissions, hooks, and symlinks are configured before prompt optimization. Use when starting a new project from scratch, when adopting AI-augmented workflows in an existing project, when migrating from a monolithic CLAUDE.md to a structured framework, or when auditing a project for missing AI infrastructure. Also handles quick-start path (5 minutes). Trigger terms: bootstrap, initialize project, AI setup, .ai structure, CLAUDE.md, AGENTS.md, multi-IDE, skills, harness, spec-driven, progressive disclosure, axis, axis-bootstrap, failure attribution, ACE, memory playbook.
---

# AXIS Bootstrap

Executable spec for bootstrapping projects with complete AI infrastructure. Orchestrates the creation of three layers (Spec, Harness, Memory) in sequential phases with explicit gates. **Harness is the priority — not the prompt.**

## When to Use

- Starting a new project (technical or non-technical) and wanting a solid foundation for collaborating with AI
- Adopting AI agents in an existing project that doesn't yet have a structured `.ai/`
- Migrating from a monolithic `CLAUDE.md` to a structure with Progressive Disclosure
- Auditing a project to identify gaps in Spec/Harness/Memory
- Standardizing multiple team projects under the same foundation
- Quick start: 5-minute path (see `references/QUICKSTART.md`)

## Summary Flow

| Phase | Focus | Exit Gate |
| ----- | ----- | --------- |
| **1 — Discovery** | Interview to understand the project | Summary confirmed by user |
| **2 — Spec Layer** | Generate INSTRUCTIONS, skills, rules, docs | `.ai/` structure populated and validated |
| **3 — Harness Layer** | Configure settings, hooks, failure attribution, symlinks | Permissions and automation in effect |
| **4 — Memory Layer** | Create STATE (playbook), CONVENTIONS | Curated memory ready for first session |
| **5 — Validation** | Quality gates, k-trial smoke test, handoff | Bootstrap delivered |

Detailed orchestration in [PLANNER.md](PLANNER.md). Final output contract in [PROMPT-TEMPLATE.md](PROMPT-TEMPLATE.md).

## Execution Principles

1. **Harness before prompts** — settings.json and hooks take precedence
2. **Do not skip phases** — each depends on validation of the previous one
3. **Do not fabricate** — if information is missing, ask (Knowledge Verification Chain)
4. **Confirm before generating** — show the phase plan, wait for approval
5. **Use templates** — do not invent formats; they live in `references/TEMPLATES.md`

## References

- [PLANNER.md](PLANNER.md) — phase orchestration and gate rules
- [PROMPT-TEMPLATE.md](PROMPT-TEMPLATE.md) — expected final structure of the bootstrapped project
- [references/QUICKSTART.md](references/QUICKSTART.md) — 5-minute path
- [references/PHASE-1-DISCOVERY.md](references/PHASE-1-DISCOVERY.md) — interview and decision tree
- [references/PHASE-2-SPEC.md](references/PHASE-2-SPEC.md) — Spec Layer generation
- [references/PHASE-3-HARNESS.md](references/PHASE-3-HARNESS.md) — Harness Layer configuration + failure attribution
- [references/PHASE-4-MEMORY.md](references/PHASE-4-MEMORY.md) — Memory Layer initialization + ACE principles
- [references/PHASE-5-VALIDATION.md](references/PHASE-5-VALIDATION.md) — quality gates and handoff
- [references/TEMPLATES.md](references/TEMPLATES.md) — all copy-paste templates
- [references/PATTERNS.md](references/PATTERNS.md) — technical patterns (PD, KVC, ACE, k-trial)
- [references/UNIVERSAL-MAP.md](references/UNIVERSAL-MAP.md) — technical ↔ non-technical mapping

## Final Validation (summary)

Before declaring bootstrap complete:

- [ ] `.ai/` structure created and populated
- [ ] `INSTRUCTIONS.md` between 100-180 lines
- [ ] Each skill has description >2 lines and SKILL.md ≤ 60 lines
- [ ] `settings.json` in git with explicit allow/deny/ask
- [ ] Hooks execute smoke test (if applicable)
- [ ] Symlinks resolve (`ls -la` confirmed)
- [ ] `STATE.md` populated with initial playbook (not empty)
- [ ] `CONVENTIONS.md` with symlink map
- [ ] Handoff delivered to user with next steps

Full checklist in [references/PHASE-5-VALIDATION.md](references/PHASE-5-VALIDATION.md).
