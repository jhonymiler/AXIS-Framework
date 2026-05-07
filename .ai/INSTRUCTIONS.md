# Spec-Harness Framework — Instructions

> You are inside a self-applicable framework for bootstrapping projects with complete AI infrastructure. This file is your entry point.

## Purpose

This repository contains an **executable spec** that bootstraps any project (technical or non-technical) with three validated layers:

- **Spec Layer** — INSTRUCTIONS, skills, rules, docs
- **Harness Layer** — settings.json, hooks, sub-agents, symlinks
- **Memory Layer** — STATE.md, CONVENTIONS.md

Full conceptual model in [FRAMEWORK.md](FRAMEWORK.md).

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

## Inviolable Principles

1. **Single Source of Truth** — never duplicate content across IDEs. Use symlinks.
2. **Progressive Disclosure** — load only what is needed for the current phase.
3. **Gates between phases** — no artifact from a phase is generated before the gate of the previous phase has been approved.
4. **No fabrication** — if information is missing, ask. Inventing breaks the contract with the user.
5. **Recursiveness** — this repository itself follows the pattern it teaches. If you modify the framework, maintain the recursiveness.
6. **Fix spec first, then code** — when reality diverges from the spec, update the skill/Canvas/STATE before touching the code. Exception: refactoring (clean code first, sync spec after). See [PATTERNS.md → Bidirectional Spec-Code Sync](./skills/axis-bootstrap/references/PATTERNS.md).

## Available Skills

| Skill                                                        | When to use                                                                                               |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| [`axis-bootstrap`](.ai/skills/axis-bootstrap/SKILL.md)       | Bootstrap new project, migrate from monolithic CLAUDE.md, or audit existing project for AI infrastructure |
| [`story-decompose`](.ai/skills/story-decompose/SKILL.md)     | Decompose large requirements into INVEST stories with Given/When/Then ACs                                 |
| [`abstraction-first`](.ai/skills/abstraction-first/SKILL.md) | Design objects, responsibilities, and layer boundaries before generating code                             |
| [`alignment`](.ai/skills/alignment/SKILL.md)                 | Lock intent, scope boundaries, and DoD before implementation starts                                       |
| [`iterative-review`](.ai/skills/iterative-review/SKILL.md)   | Review AI-generated code and iterate via logic-correction or refactoring track                            |

## Maintenance Conventions

How to maintain this repository, symlink map, and evolution protocol: [CONVENTIONS.md](.ai/CONVENTIONS.md).

## Stack

This repository is stack-agnostic — the framework applies to any language, tool, or domain. Stack-specific branches (Node, Python, Go, etc., or non-technical domains) are handled within the `axis-bootstrap` skill in `references/UNIVERSAL-MAP.md` and `references/TEMPLATES.md`.
