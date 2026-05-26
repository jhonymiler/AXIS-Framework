# Bootstrap Planner — Phase Orchestration

This document describes the **execution state** of the bootstrap. The agent consults it as a state machine: each phase has an input, an output, and a gate before advancing.

---

## Orchestration Principles

1. **Sequential and blocking** — do not start Phase N+1 without confirming Phase N's gate with the user
2. **Each phase is atomic** — if something in Phase 2 indicates Phase 1 was wrong, **go back** to Phase 1, do not fix inline
3. **Stateful** — keep a record of what was decided in each phase (write to `.ai/docs/STATE.md` in the target project once Phase 4 creates the file; until then, keep in session memory)
4. **Never silence the user** — present summaries before each gate; wait for explicit approval

---

## Initial State

When the skill is invoked, the agent checks:

- Does `.ai/INSTRUCTIONS.md` exist in the target project? → **Mode:** audit (skip to Phase 5)
- Does a readable `CLAUDE.md` or `AGENTS.md` exist? → **Mode:** migration (reduced Phase 1 — extract context from existing file)
- Empty folder or just code? → **Mode:** full bootstrap (all 5 phases)

Ask the user which mode applies if detection is ambiguous.

---

## Phase 1 — Discovery

**Loads:** [references/PHASE-1-DISCOVERY.md](references/PHASE-1-DISCOVERY.md)

**Input:** target project + user intent

**Step 0 (mandatory before any question):** install the 5 discoverer sub-agents from `agents/discoverers/` into `.claude/agents/` and **dispatch all five in parallel** to extract business rules, flows, architecture, stack, and conventions from the codebase. Consolidate their reports into a Project Profile draft. The Ambiguities list from the reports seeds the interview that follows. See PHASE-1-DISCOVERY § Step 0.

**Expected output:**

- Project type identified (software / content / research / business / legal / educational / other)
- Main stack or tools — usually answered by `stack-profiler`
- 3-7 candidate domains to become skills — clusters drawn from `business-rules-extractor` + `flow-extractor`
- Architecture diagram — from `architecture-mapper`
- Detected conventions to seed `.ai/rules/` — from `conventions-detector`
- Critical constraints (compliance, deadline, team, preferred IDE) — human-only, asked in interview
- Output quality criteria (proof-of-concept vs production) — human-only

**Exit gate:**

> Present structured summary in ~10 bullets. Ask literal confirmation: *"Is this correct and complete? Anything to add before proceeding?"*

**Do not advance until receiving "yes" or applied corrections.**

---

## Phase 1.5 — SPDD Pipeline *(optional, gated by decision tree)*

**Decision tree** — apply SPDD if **two or more** of the following are true:

1. **Greenfield feature?** The work has no existing implementation to anchor against — Canvas is the only way to lock intent before coding.
2. **>1 file or >1 module touched?** Multi-file changes benefit from a single-page artifact that holds the cross-cutting design.
3. **User explicitly asked for a Canvas?** "Make me a REASONS Canvas / SPDD / story breakdown" is an explicit request — always honor.

Skip SPDD if the work is a single-file fix, a typo, a config tweak, or a tightly scoped refactor with passing tests as the gate.

**Why two-of-three (not all three):** strict "all three" excludes useful cases (e.g., greenfield single-file utility that the user wants documented). Strict "any one" inflates every typo into a Canvas exercise.

**Pipeline (each step has its own exit gate):**

| # | Skill | Produces (REASONS Canvas section) | Why this order |
| - | ----- | --------------------------------- | -------------- |
| 1 | [`story-decompose`](../../story-decompose/SKILL.md) | **R** — INVEST stories with G/W/T ACs + DoD | Cannot align on what is undefined |
| 2 | [`alignment`](../../alignment/SKILL.md) | **O** scope lock + **N** Norms + **S₂** Safeguards | Cannot design without governance bounds |
| 3 | [`abstraction-first`](../../abstraction-first/SKILL.md) | **E** Entities + **A** Approach + **S₁** System structure | Cannot generate code without object design |

The artifact produced is the **REASONS Canvas** ([references/CANVAS-REASONS.md](references/CANVAS-REASONS.md)) — single page per feature. If it doesn't fit, return to step 1 and split smaller.

**Exit gate:**

> Present the filled Canvas (all 7 dimensions: R/E/A/S₁/O/N/S₂). Ask: *"Does this capture the feature? Any AC, entity, norm, or invariant I missed?"* Advance to Phase 2 only after confirmation.

**Note on `iterative-review`:** runs **after** code is generated (post-Phase 5). See Phase 6.

---

## Phase 2 — Spec Layer

**Loads:** [references/PHASE-2-SPEC.md](references/PHASE-2-SPEC.md) + [references/TEMPLATES.md](references/TEMPLATES.md)

**Input:** Phase 1 output

**Generation in this order:**

1. `mkdir -p .ai/{skills,rules,docs}` in target project
2. `INSTRUCTIONS.md` (100-180 lines) using template adapted to type
3. Skill skeletons (one SKILL.md per identified domain, without references/ yet)
4. 3-7 initial rules with appropriate `applyTo` (omit if non-technical — use protocols)
5. Doc stubs: `architecture.md`, `database-schema.md` (if software), `glossary.md` (if specialized domain)

**Exit gate:**

> List all files created with 1-line purpose each. Show line counts. Ask confirmation: *"This is the minimal Spec Layer. Any critical domain I missed? Any file that doesn't make sense for this project?"*

---

## Phase 3 — Harness Layer

**Loads:** [references/PHASE-3-HARNESS.md](references/PHASE-3-HARNESS.md) + [references/TEMPLATES.md](references/TEMPLATES.md)

**Input:** Phase 2 confirmed + project type

**Critical decisions:**

- **Lint/format hooks:** only if software with available formatter
- **Destructive blocking hook:** **always** (universal, low cost, high value)
- **Stop hook for tests:** only if software with test runner
- **Sub-agents:** always enable `Explore`; others per scope
- **Symlinks by IDE:** only for IDEs the user declared using

**Generation:**

1. `.claude/settings.json` (or equivalent) versioned, with appropriate permission profile
2. `scripts/` with hooks (`format-file.sh`, `validate-bash.sh`, `run-tests-if-changed.sh` — only applicable ones)
3. Symlinks via `setup-ide-links.sh` adapted to declared IDEs
4. (Optional) `.gitignore` adjusted

**Exit gate:**

> Show `settings.json`, list of installed hooks, and symlink tree. Smoke test: *"I'll run `ls -la` to confirm the symlinks. May I?"* After confirmation, execute and show output.

---

## Phase 4 — Continuity Layer

**Loads:** [references/PHASE-4-CONTINUITY.md](references/PHASE-4-CONTINUITY.md)

**Input:** Phases 2 and 3 confirmed

**Generation:**

1. `.ai/docs/STATE.md` with sections: Active Decisions, In Progress, Blockers, Deferred Ideas, Lessons Learned, TODOs
2. `.ai/CONVENTIONS.md` with symlink map and maintenance rules

**Exit gate:**

> Show generated content. Ask: *"Are there decisions already made, current blockers, or important context to record now before the first real session?"* Update `STATE.md` with what the user provides.

---

## Phase 5 — Validation

**Loads:** [references/PHASE-5-VALIDATION.md](references/PHASE-5-VALIDATION.md)

**Input:** Phases 1-4 complete

**Execution:**

1. Run quality gates checklist (12-15 items)
2. Calculate metrics (lines in INSTRUCTIONS, average SKILL.md size, rules count)
3. Automated smoke tests (symlinks resolve, hooks execute)
4. Generate handoff: list of files created + suggested next steps

**Final gate:**

> Present completed bootstrap report. List 3-5 actions suggested for the user to do next (e.g., "Create the first detailed skill for domain X", "Configure CI to validate symlinks").

---

## Phase 6 — Iterative Review *(post-bootstrap, per feature)*

**When to apply:** triggered after code is generated from a REASONS Canvas, OR when a code review reveals drift between code and Canvas.

**Loads:** [`iterative-review`](../../iterative-review/SKILL.md)

**Two tracks:**

- **Track A — Logic correction** (behavior wrong): update Canvas first → regenerate affected Operations → verify
- **Track B — Refactoring** (no behavior change): refactor code → sync Canvas back → verify tests

**Exit gate:**

> Diff confined to Canvas Structure section? All ACs verified with concrete values? STATE.md updated with new patterns/decisions?

**This phase is recurring** — every feature post-bootstrap re-enters Phase 1.5 → 6 cycle. Bootstrap (Phases 1-5) runs once; SPDD pipeline runs per feature.

---

## Recovery

If a phase fails (user rejects output, contradictory information arises):

- **In Phase 1-2:** review questions, adjust summary, regenerate
- **In Phase 3:** if stack changed, regenerate `settings.json` and hooks; symlinks are reversible (`rm` + recreate)
- **In Phase 4-5:** rarely requires going back; usually a targeted correction in `STATE.md` or `CONVENTIONS.md`

**Never destroy the user's work.** Before overwriting an existing file, make a backup (`.bak`) or ask for confirmation.

---

## Frequent Decision Map

| Phase question                           | Default answer                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| Unknown type in Phase 1                  | Treat as "other" and use UNIVERSAL-MAP to infer                             |
| Stack not in TEMPLATES.md                | Use Node.js template as base and adapt — log as follow-up                   |
| User doesn't know which skills to create | Suggest 3 based on described domain + 1 universal quality skill (lint/test) |
| User doesn't use any specific IDE        | Create only root symlinks (CLAUDE.md, AGENTS.md) and `.agents/`             |
| Non-technical project                    | Partially skip Phase 3 (hooks); keep destructive blocking + permissions     |

---

## Expected Final State

At the end, the target project has:

```text
target-project/
├── .ai/
│   ├── INSTRUCTIONS.md
│   ├── CONVENTIONS.md
│   ├── skills/                 (3-7 skills with minimal SKILL.md)
│   ├── rules/                  (3-7 rules — if applicable)
│   └── docs/
│       ├── architecture.md     (if software)
        └── STATE.md
├── .claude/                    (symlinks)
├── .cursor/, .agents/, .github/ (per declared IDEs)
├── CLAUDE.md, AGENTS.md        (symlinks)
├── .claude/settings.json       (versioned)
└── scripts/                    (hooks — if software)
```

Expected complete structure in [PROMPT-TEMPLATE.md](PROMPT-TEMPLATE.md).
