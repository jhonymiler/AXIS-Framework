# AXIS Framework

> **Harness-first. Spec-driven. Memory-persistent.**

An executable framework that bootstraps any project — technical or not — with the infrastructure needed to collaborate **reliably and scalably** with AI agents.

> **This is not an article to read. It is a spec to execute.** The framework uses the very pattern it teaches: it delivers itself as a skill that the AI loads and runs in phases with explicit gates.

---

## The Core Model

```text
AI-Augmented Project = Spec Layer + Harness Layer + Memory Layer
```

| Layer       | Answers                        | Artifacts                                  | Why it matters                      |
| ----------- | ------------------------------ | ------------------------------------------ | ------------------------------------ |
| **Spec**    | WHAT the project is and needs  | INSTRUCTIONS.md, skills, rules, docs       | Minimal context, no noise            |
| **Harness** | HOW the agent behaves          | settings.json, hooks, sub-agents, symlinks | **Real reliability — not the model** |
| **Memory**  | WHAT persists between sessions | STATE.md, CONVENTIONS.md                   | Antifragility over time              |

> **Key insight:** LangChain moved an agent from outside the top 30 to top 5 in Terminal Bench 2.0 by changing only the harness — **same model**. The highest-leverage layer is not the prompt — it's the harness.

Full details in [FRAMEWORK.md](FRAMEWORK.md).

---

## Quick Start — 5 Minutes

### Option A — Bootstrap a new project (fast path)

In any agent (Claude Code, Cursor, Windsurf, Copilot):

```text
Use the axis-bootstrap skill to initialize this project.
```

The agent guides you through 5 phases with explicit gates. You confirm before each phase advances.

### Option B — Manual install

```bash
# 1. Copy the .ai/ structure into your project
cp -r /path/to/AXIS/.ai/ your-project/.ai/

# 2. Run symlink setup
cd your-project && bash setup-ide-links.sh
```

### What the bootstrap delivers

In ~30 minutes of interaction:

- Contextual `INSTRUCTIONS.md` (100-180 lines, not monolithic)
- Domain skills with Progressive Disclosure
- Versioned `settings.json` with auditable permissions
- Hooks for formatting, destructive blocking, and automatic tests
- Multi-IDE symlinks (Claude Code, Cursor, Windsurf, Copilot, etc.)
- `STATE.md` for continuity between sessions

---

## Why AXIS and Not Another Framework

| Framework               | Angle                       | Limitation                                                            |
| ----------------------- | --------------------------- | --------------------------------------------------------------------- |
| **Spec Kit (GitHub)**   | Spec-first                  | No harness, no persistent memory; context lost between sessions       |
| **BMAD-METHOD**         | Agile multi-agent           | Software-focused; heavy for smaller projects                          |
| **LangChain/LangGraph** | Agent runtime               | Runtime, not project infra; framework lock-in                         |
| **CrewAI**              | Role-based orchestration    | No cross-IDE context management                                       |
| **AXIS**                | **Harness + Spec + Memory** | Stack-agnostic, multi-IDE, 3 integrated layers                        |

AXIS solves what others ignore: **context divergence across IDEs, session fragility, and the absence of versioned permissions**.

---

## When to Use AXIS

- Starting a new project (technical or non-technical)
- Adopting an AI workflow in an existing project
- Migrating from a monolithic `CLAUDE.md` to a modular structure
- Auditing a project for AI infrastructure gaps
- Standardizing multiple team projects

## When NOT to Use

- A throwaway script you'll finish in 1 hour
- A solo weekend project with no continuity expected
- When the overhead of the structure exceeds the gain

See [FRAMEWORK.md](FRAMEWORK.md#trade-offs) for the full trade-off analysis.

---

## Repository Structure

```text
AXIS/
├── README.md                                    ← Portuguese readme
├── README.en.md                                 ← you are here
├── FRAMEWORK.md                                 ← conceptual model (humans)
└── .ai/                                         ← the executable framework (single source)
    ├── INSTRUCTIONS.md                          ← AI entry point
    ├── CONVENTIONS.md                           ← how the framework maintains itself
    └── skills/
        └── axis-bootstrap/                      ← the executable spec
            ├── SKILL.md                         ← skill index
            ├── PLANNER.md                       ← phases + gates
            ├── PROMPT-TEMPLATE.md               ← output contract
            └── references/                      ← on-demand details
                ├── QUICKSTART.md                ← 5-minute path
                ├── PHASE-1-DISCOVERY.md
                ├── PHASE-2-SPEC.md
                ├── PHASE-3-HARNESS.md           ← includes failure attribution
                ├── PHASE-4-MEMORY.md            ← includes ACE principles
                ├── PHASE-5-VALIDATION.md
                ├── TEMPLATES.md
                ├── PATTERNS.md                  ← PD, KVC, ACE, k-trial
                └── UNIVERSAL-MAP.md
```

The framework is **self-hosting** — its own structure follows the pattern it teaches.

---

## Operational Principles

1. **Harness-first** — reliability comes from the environment, not the model
2. **Single Source of Truth** — content lives in `.ai/`; symlinks handle multi-IDE distribution
3. **Progressive Disclosure** — load only what is needed (~1,500 tokens base)
4. **Gates between phases** — no artifact generated without user confirmation
5. **Memory as playbook** — STATE.md is not a log; it is curated context that self-improves (ACE principle)
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
