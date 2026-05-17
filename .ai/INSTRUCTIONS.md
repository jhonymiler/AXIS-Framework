# Spec-Harness Framework — Instructions

> You are inside a self-applicable framework for bootstrapping projects with complete AI infrastructure. This file is your entry point.

## Purpose

This repository contains an **executable spec** that bootstraps any project (technical or non-technical) with three validated layers:

- **Spec Layer** — INSTRUCTIONS, skills, rules, docs
- **Harness Layer** — settings.json, hooks, sub-agents, symlinks
- **Memory Layer** — STATE.md, CONVENTIONS.md

Full conceptual model in [FRAMEWORK.md](FRAMEWORK.md).

## Stack / Tools

- **Language:** Bash (scripts/), Node.js ≥ 18 (cli/)
- **CLI deps:** `@clack/prompts`, `picocolors` (see [cli/package.json](cli/package.json))
- **CI:** GitHub Actions ([.github/workflows/validate.yml](.github/workflows/validate.yml))
- **Versioning:** SemVer for the CLI (`cli/package.json`); dated tags for spec revisions

## How to Run

```bash
# Local validation (runs the 4 quality gates)
bash scripts/validate-axis.sh

# Sync live skill → CLI distributable templates (after editing .ai/skills/)
bash scripts/sync-cli-templates.sh

# Recreate root and IDE symlinks
bash setup-ide-links.sh

# Develop / use the CLI
cd cli && npm install && node src/index.js --help
```

## How to Operate

### Scenario 1 — User asks to bootstrap a project

1. Load the skill [`axis-bootstrap`](.ai/skills/axis-bootstrap/SKILL.md)
2. Follow `PLANNER.md` in strict order
3. **Do not skip phases.** Each phase has an explicit gate that must be confirmed by the user before the next begins
4. Use templates from `references/TEMPLATES.md` when generating artifacts — do not invent formats

### Scenario 2 — User asks to audit an existing project

1. Load the `axis-bootstrap` skill
2. Skip Phase 1 (discovery) if a readable `INSTRUCTIONS.md` already exists
3. Apply only `PHASE-5-VALIDATION.md` to identify gaps
4. Report what is missing per layer (Spec / Harness / Memory)

### Scenario 3 — User asks to understand the framework

1. Point to [FRAMEWORK.md](FRAMEWORK.md) (conceptual model)
2. Point to [README.md](README.md) (quick start)
3. Do not execute the bootstrap until the user explicitly asks

## Architecture

| Layer / Component | Responsibility | Location |
| ----------------- | -------------- | -------- |
| Spec — live skills | Source of truth for bootstrap orchestration, templates, patterns | [.ai/skills/](.ai/skills/) |
| Spec — instructions | Project entry point for AI agents | [.ai/INSTRUCTIONS.md](.ai/INSTRUCTIONS.md) |
| Spec — rules | Cross-cutting rules auto-loaded by IDEs (workflow, KVC, doc maintenance) | [.ai/rules/](.ai/rules/) |
| Memory | Curated playbook (ACE), session-spanning context | [.ai/docs/STATE.md](.ai/docs/STATE.md) |
| Harness — permissions | Versioned tool allow/deny/ask lists | [.claude/settings.json](.claude/settings.json) |
| Harness — symlinks | Multi-IDE single-source-of-truth | [setup-ide-links.sh](setup-ide-links.sh) |
| Harness — validators | Quality gates (sizes, sync, symlinks) | [scripts/validate-axis.sh](scripts/validate-axis.sh) |
| CLI distributable | Scaffold artifacts in target projects (`axis init`, `audit`, `spdd`, ...) | [cli/](cli/) |
| CLI templates | Parametrized files copied into new projects + mirrored skill templates | [cli/templates/](cli/templates/) |

Details: [FRAMEWORK.md](FRAMEWORK.md).

## Inviolable Principles

1. **Single Source of Truth** — never duplicate content across IDEs. Use symlinks.
2. **Progressive Disclosure** — load only what is needed for the current phase.
3. **Gates between phases** — no artifact from a phase is generated before the gate of the previous phase has been approved.
4. **No fabrication** — if information is missing, ask. Inventing breaks the contract with the user.
5. **Recursiveness** — this repository itself follows the pattern it teaches. If you modify the framework, maintain the recursiveness.
6. **Fix spec first, then code** — when reality diverges from the spec, update the skill/Canvas/STATE before touching the code. Exception: refactoring (clean code first, sync spec after). See [PATTERNS.md → Bidirectional Spec-Code Sync](.ai/skills/axis-bootstrap/references/PATTERNS.md).

## Conventions

Summary (full standards in [.ai/rules/](.ai/rules/)):

- **Commits & PRs:** Conventional Commits, squash merge, CI green required — see [rules/workflow.md](.ai/rules/workflow.md).
- **Verification before claims:** follow the Knowledge Verification Chain — see [rules/knowledge-verification.md](.ai/rules/knowledge-verification.md).
- **Doc maintenance:** the agent is a documentation guardian — see [rules/documentation-maintenance.md](.ai/rules/documentation-maintenance.md).
- **File sizes:** `INSTRUCTIONS.md` 100-180 lines, `SKILL.md` ≤ 60 lines — enforced by `scripts/validate-axis.sh`.

## Workflow & Tools

Summary (full standards in [.ai/rules/workflow.md](.ai/rules/workflow.md)):

- **Task tracker:** GitHub Issues — label `recursiveness` for self-applicability bugs.
- **Branches:** `feat/`, `fix/`, `docs/`, `chore/`, `refactor/` + slug. Direct push to `main` only for trivial doc/typo fixes.
- **Commits:** Conventional Commits. Subject ≤ 72 chars, imperative mood.
- **PRs:** squash merge into `main`, CI must be green, description must include validation evidence for spec changes.
- **Versioning:** SemVer for the CLI; dated tags for spec revisions.
- **Agent must run** `scripts/sync-cli-templates.sh` after editing `.ai/skills/`, then `scripts/validate-axis.sh` before commit.

## Available Skills

| Skill                                                        | When to use                                                                                               |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| [`axis-bootstrap`](.ai/skills/axis-bootstrap/SKILL.md)       | Bootstrap new project, migrate from monolithic CLAUDE.md, or audit existing project for AI infrastructure |
| [`story-decompose`](.ai/skills/story-decompose/SKILL.md)     | Decompose large requirements into INVEST stories with Given/When/Then ACs                                 |
| [`abstraction-first`](.ai/skills/abstraction-first/SKILL.md) | Design objects, responsibilities, and layer boundaries before generating code                             |
| [`alignment`](.ai/skills/alignment/SKILL.md)                 | Lock intent, scope boundaries, and DoD before implementation starts                                       |
| [`iterative-review`](.ai/skills/iterative-review/SKILL.md)   | Review AI-generated code and iterate via logic-correction or refactoring track                            |
| [`project-review`](.ai/skills/project-review/SKILL.md)       | PR review with dual awareness: purpose fidelity + security, architecture, best practices  |

## Links

- [FRAMEWORK.md](FRAMEWORK.md) — conceptual model (Spec / Harness / Memory layers)
- [README.md](README.md) — user-facing quick start (English)
- [README.pt.md](README.pt.md) — user-facing quick start (Portuguese)
- [.ai/CONVENTIONS.md](.ai/CONVENTIONS.md) — maintenance conventions and symlink map
- [.ai/docs/STATE.md](.ai/docs/STATE.md) — curated playbook (read at session start)
- [cli/README.md](cli/README.md) — CLI commands reference

## Stack-agnosticism

This repository's framework applies to any language, tool, or domain. Stack-specific branches (Node, Python, Go, etc., or non-technical domains) are handled within the `axis-bootstrap` skill in [references/UNIVERSAL-MAP.md](.ai/skills/axis-bootstrap/references/UNIVERSAL-MAP.md) and [references/TEMPLATES.md](.ai/skills/axis-bootstrap/references/TEMPLATES.md).
