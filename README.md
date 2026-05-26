# AXIS Framework

> CLI + AI-agent skills that scaffold the `.ai/` infrastructure a project needs to work reliably with AI tools.

AXIS is a **one-shot bootstrap**. The CLI creates the skeleton; an AI agent (Claude Code, Cursor, Copilot, etc.) fills it with project-specific content; after that, the project maintains itself without AXIS.

Three layers installed:

| Layer          | What it is                     | Main files                       |
| -------------- | ------------------------------ | -------------------------------- |
| **Spec**       | What the project is and needs  | `INSTRUCTIONS.md`, skills, rules |
| **Harness**    | How the agent behaves          | `settings.json`, hooks, symlinks |
| **Continuity** | What persists between sessions | `STATE.md`, `CONVENTIONS.md`     |

---

## How it works

```text
axis init        ← ~10 seconds
                   creates .ai/ skeleton, settings.json, hooks, symlinks
       ↓
AI agent runs axis-bootstrap skill   ← 20-40 minutes
                   reads your project, runs 5 phases with gates,
                   fills in contextual skills/rules/INSTRUCTIONS
       ↓
axis cleanup     ← removes bootstrap meta-skill
                   project is self-sufficient from here
```

Without an AI agent following the meta-skill, `axis init` produces only template placeholders. The agent does the real work.

---

## Quick Start

```bash
# one-shot, no install
npx @axis-bootstrap/cli init

# or install globally
npm i -g @axis-bootstrap/cli
axis init
```

`axis init` auto-detects your context and asks in PT or EN based on `$LANG`:

| Detected                                | Mode                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------- |
| Empty directory                         | Quick scaffold — fills templates interactively (no AI agent needed)         |
| Existing project (`package.json`, etc.) | AI-driven — installs `axis-bootstrap` skill; you ask your AI tool to run it |
| Already has `.ai/`                      | Asks before overwriting                                                     |

After AI-driven init completes:

```bash
axis cleanup     # removes the bootstrap skill; project keeps everything else
```

---

## Commands

Three commands cover the bootstrap lifecycle:

```bash
axis init        # bootstrap (once) — scaffold + installs the axis-bootstrap skill
axis cleanup     # remove bootstrap skill after the AI agent finishes (once)
axis doctor      # validate sizes, symlinks, cross-links, token counts
```

For per-feature development (after bootstrap), AXIS ships an optional SPDD pipeline:

```bash
axis spdd canvas <slug>              # scaffold a REASONS Canvas
axis spdd story|align|design|review  # fill each section with your AI agent
```

Everything else is situational:

| Command                                                | When to use                                            |
| ------------------------------------------------------ | ------------------------------------------------------ |
| `axis init --preset <node\|python\|go\|docs\|minimal>` | Non-interactive scaffold                               |
| `axis init --rebootstrap`                              | Upgrade an existing `.ai/` to a new AXIS version       |
| `axis doctor --strict`                                 | CI mode — also runs duplicate check, fails on warnings |
| `axis audit`                                           | Diagnose which AXIS layers are missing                 |
| `axis link`                                            | Recreate IDE symlinks if they break                    |
| `axis hooks install`                                   | Wire `scripts/*.sh` into `.claude/settings.json`       |
| `axis state hot / archive`                             | STATE.md management (mostly used by hooks)             |
| `axis dedupe`                                          | Scan `.ai/**/*.md` for duplicated paragraphs           |
| `axis log`                                             | Telemetry (opt-in, gitignored)                         |

Full reference: [cli/README.md](cli/README.md)

---

## SPDD — what it is and how to use it

SPDD (Structured Prompt-Driven Development, [Martin Fowler](https://martinfowler.com/articles/structured-prompt-driven)) is a pipeline for working on individual features with AI. The problem it solves: when you describe a feature and ask an AI to generate code, you end up in a "regenerate until it works" loop with no shared contract between you and the AI. SPDD fixes this by filling a one-page **Canvas REASONS** *before* code generation, so both you and the AI are aligned on what must be built.

```bash
# start a new feature
axis spdd canvas payment-webhook     # creates .ai/canvases/payment-webhook.md

# fill the canvas collaboratively with your AI agent (each step opens the canvas)
axis spdd story    # AI fills R — INVEST story + Given/When/Then ACs + Definition of Done
axis spdd align    # AI fills O, N, S₂ — operations, norms, safeguards
axis spdd design   # AI fills E, A, S₁ — entities, approach, system structure

# generate code in your AI agent as usual

axis spdd review   # AI checks the diff against the canvas — did the code honor the contract?
```

The canvas has 7 dimensions (REASONS):

|        | Dimension        | What it captures                                        |
| ------ | ---------------- | ------------------------------------------------------- |
| **R**  | Requirements     | INVEST story + Given/When/Then ACs + Definition of Done |
| **E**  | Entities         | Domain objects, relationships, single responsibility    |
| **A**  | Approach         | High-level strategy to satisfy R                        |
| **S₁** | System structure | Components, layer boundaries, file tree                 |
| **O**  | Operations       | Concrete steps / endpoints / methods                    |
| **N**  | Norms            | Engineering standards (naming, logging, security)       |
| **S₂** | Safeguards       | Non-negotiable invariants (correctness, perf, security) |

If the canvas doesn’t fit one page, the feature is too large — go back to `axis spdd story` and decompose it first.

---

## What the bootstrap installs

- `INSTRUCTIONS.md` — project-specific AI entry point (100-180 lines)
- `settings.json` — versioned tool permissions + hooks wired to `.ai/hooks/`
- Skills — `documentation-guardian` (self-maintenance) + 4 SPDD skills (opt-in)
- Rules — `session-start.md` by default; 6 more available opt-in
- Hooks — `session-start.sh`, `post-spec-edit.sh`, `stop.sh`, `post-code-change.sh`
- Discoverer sub-agents — 5 read-only agents run in parallel during Phase 1 (architecture, business rules, flows, stack, conventions)
- Specialist agents — 4 project-bound agents generated from discoverer output (arch guardian, business-rules keeper, flow architect, conventions keeper)
- Multi-IDE symlinks — `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md` all resolve to `.ai/INSTRUCTIONS.md`
- `STATE.md` — curated session continuity (not a log)

---

## Upgrading an existing project

If AXIS releases structural changes and you want to apply them to a project already bootstrapped:

```bash
cd your-project
axis init --rebootstrap
```

This installs the `axis-rebootstrap` skill. Your AI agent runs it: it backs up `.ai/`, applies the new structure, and re-integrates your domain content (skills, rules, STATE). The agent shows you a diff before overwriting anything.

---

## When to use AXIS

- Working on a project with multiple sessions where you need continuity
- Adopting AI workflows in an existing codebase
- Migrating from a monolithic `CLAUDE.md` to a modular structure
- Standardizing AI infrastructure across multiple team projects

## When NOT to use AXIS

- A throwaway script you'll finish in one session
- A project with no expected continuity
- When the structure overhead exceeds the benefit (solo project, < 1 week duration)

---

## Repository structure

```text
axis/
├── README.md, README.pt.md
├── FRAMEWORK.md                  ← conceptual model
├── setup-ide-links.sh
├── cli/                          ← @axis-bootstrap/cli  (Node.js ≥18)
│   ├── package.json              ← bin: axis, version: 2.0.0
│   ├── src/commands/             ← init, doctor, audit, spdd, hooks, …
│   └── templates/                ← files installed by `axis init`
│       ├── bootstrap-skill/      ← axis-bootstrap skill bundle
│       │   └── agents/{discoverers,specialists}/
│       ├── rebootstrap-skill/    ← axis-rebootstrap skill bundle
│       ├── skills/               ← 4 SPDD skills + documentation-guardian
│       ├── rules/                ← 7 rules (session-start is default)
│       └── hooks/
├── scripts/
│   ├── validate-axis.sh          ← 4 quality gates
│   └── sync-cli-templates.sh     ← propagate .ai/skills/ → cli/templates/
└── .ai/                          ← this repo's own framework (source of truth)
    ├── INSTRUCTIONS.md
    ├── rules/, hooks/
    └── skills/
        ├── axis-bootstrap/       ← bootstrap meta-skill (phases + references)
        ├── axis-rebootstrap/     ← upgrade meta-skill
        ├── abstraction-first/, alignment/
        ├── iterative-review/, story-decompose/
        ├── copilot-review/       ← AXIS-repo specific
        └── documentation-guardian/  (in cli/templates only — not used by AXIS itself)
```

The repo is **self-hosting** — its own `.ai/` follows the same pattern it installs in other projects.

---

## Working on AXIS itself

```bash
bash scripts/validate-axis.sh         # 4 quality gates (sizes, sync, symlinks)
bash scripts/sync-cli-templates.sh    # sync .ai/skills/ → cli/templates/ after editing
node cli/src/index.js doctor .        # recursiveness check
node cli/src/index.js init /tmp/smoke # smoke test
```

Conventions, branch strategy, commit format: [.ai/INSTRUCTIONS.md](.ai/INSTRUCTIONS.md)

1. **Harness-first** — reliability comes from the environment, not the model
2. **Single Source of Truth** — content lives in `.ai/`; symlinks handle multi-IDE distribution
3. **Progressive Disclosure** — load only what is needed (~1,500 tokens base)
4. **Gates between phases** — no artifact generated without user confirmation
5. **Continuity as playbook** — STATE.md is not a log; it is curated context that self-improves (ACE principle)
6. **Stack-agnostic** — works for software, content, research, legal, any domain

---

## Multi-IDE Symlinks

AXIS uses **Single Source of Truth**: all content lives in `.ai/`. IDE-specific folders contain only symlinks — divergence is **physically impossible**.

```text
CLAUDE.md                        → .ai/INSTRUCTIONS.md
AGENTS.md                        → .ai/INSTRUCTIONS.md
.claude/skills                   → .ai/skills
.cursor/skills                   → .ai/skills
.agents/skills                   → .ai/skills
.github/skills                   → .ai/skills
.github/copilot-instructions.md  → .ai/INSTRUCTIONS.md
```

To configure in a new project: `bash setup-ide-links.sh`
