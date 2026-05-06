# Patterns — Technical Patterns of the Framework

Reusable patterns that the bootstrap applies and that should be followed in any post-bootstrap project evolution.

---

## 1. Progressive Disclosure (3 Layers)

The spec loads in three distinct moments to minimize tokens:

| Layer             | When it loads    | Content                                 | Cost           |
| ----------------- | ---------------- | --------------------------------------- | -------------- |
| **1 — Discovery** | Always (startup) | `name` + `description` from frontmatter | ~3 lines/skill |
| **2 — Index**     | When relevant    | Full `SKILL.md`                         | ~40-60 lines   |
| **3 — On-demand** | When needed      | `references/*.md`                       | on demand      |

The agent knows a skill exists (layer 1), decides if it needs it (layer 2), only pulls deep details when implementing (layer 3).

---

## 2. Token Budget

Progressive Disclosure only works with explicit limits. Define:

| Category                                    | Budget               | Rule                            |
| ------------------------------------------- | -------------------- | ------------------------------- |
| **Fixed base** (INSTRUCTIONS + frontmatter) | ~1,500-2,000 tokens  | Always loaded                   |
| **Active skills** (full SKILL.md)           | ~3,000-5,000 tokens  | Only relevant ones for the task |
| **References on-demand**                    | ~5,000-10,000 tokens | Only when necessary             |
| **Target total**                            | <15,000 tokens       | Reserve maximum for reasoning   |

**Loading rules:**

- Never load multiple `SKILL.md` simultaneously if not for the same task
- Never load multiple architecture docs at the same time
- When reaching the limit, unload the oldest content
- Warn when the docs context exceeds the budget (signal of oversized skills)

---

## 3. Knowledge Verification Chain

**Before asserting anything**, the agent follows this order **mandatorily**:

```text
Step 1: Codebase  → verify existing code, conventions and patterns
Step 2: Project docs → README, .ai/docs/, inline comments, skills
Step 3: Official docs (MCP/Context7) → resolve lib ID, consult current API
Step 4: Web search → official docs, reliable sources, community standards
Step 5: Mark as uncertain → "I'm not sure about X — please verify"
```

**Inviolable rules:**

- Never skip to Step 5 if 1-4 are available
- Step 5 is **always** signaled as uncertain — never presented as fact
- **Never assume or fabricate.** If not found, say "I found no documentation"
- Inventing APIs, patterns or behaviors causes cascading failures: wrong design → wrong tasks → wrong implementation
- Uncertainty is always preferable to fabrication

This chain must be referenced in `CONVENTIONS.md` and can be an independent rule in `.ai/rules/knowledge-verification.md`.

---

## 4. Auto-Sizing by Complexity

Not every task needs the same level of planning. Before starting, the agent evaluates:

| Complexity  | Indicators                    | Documentation                 | What to skip                     |
| ----------- | ----------------------------- | ----------------------------- | -------------------------------- |
| **Small**   | ≤3 files, scope in 1 sentence | Describe → Implement → Verify | Spec, design, task breakdown     |
| **Medium**  | Clear feature, <10 steps      | Brief spec + inline design    | Formal design                    |
| **Large**   | Multi-component, >10 steps    | Full spec + design + tasks    | Nothing                          |
| **Complex** | Ambiguity, new domain         | Spec + discussion + research  | Nothing + interactive validation |

**Rules:**

- **Specify** and **Execute** are always mandatory — always know WHAT and DO IT
- **Design** is skipped if the change is direct (no new architectural decisions)
- **Task breakdown** is skipped if there are ≤3 obvious steps
- **Safety valve:** even when tasks are skipped, the agent lists steps inline. If the listing reveals >5 steps or complex dependencies, **STOP** and create a formal task breakdown

Avoids two extremes: over-engineering on simple tasks (burns tokens with ceremony) and under-planning on complex ones (generates rework).

---

## 5. Skill Granularity

**When to create a new skill:**

- Domain has >5 specific concepts
- Has its own workflow
- Information not derivable from the code without external context
- Agent makes recurring errors without the skill

**When to expand an existing one:**

- Information is complementary
- `SKILL.md` is still <60 lines after addition
- Use scenario is the same

**When to use `docs/` instead of a skill:**

- It is pure reference documentation (schema, contracts)
- Does not involve a workflow
- Will be referenced by multiple skills

---

## 6. Description Quality

The `description` in the frontmatter is the **only information** the agent reads in 100% of sessions. It determines whether the skill is used or ignored.

**Checklist:**

- [ ] Contains exact domain terms that appear in developer questions
- [ ] Lists scenarios with action verbs ("implementing", "debugging", "understanding")
- [ ] Has 2-4 lines (1 is vague, 5+ is excessive)
- [ ] A new developer understands when to use it just by reading the description

**Example:**

```yaml
# Weak
description: Reference for the payments API integration.

# Strong
description: Complete reference for the Payments API integration.
  Use when implementing API calls (endpoints, auth, payload format),
  debugging API responses (error codes, rate limits),
  or understanding the retry strategy and idempotency rules.
```

---

## 7. Flows vs State

| Type            | Where                               | Example                   |
| --------------- | ----------------------------------- | ------------------------- |
| Workflow        | `skills/<name>/SKILL.md`            | "How to collect API data" |
| Algorithm/logic | `skills/<name>/references/GUIDE.md` | "Deduplication logic"     |
| Schema/contract | `docs/database-schema.md`           | "Transactions table"      |
| Current state   | `docs/STATE.md`                     | "Feature X in progress"   |

**Rule:** skills document **flows**; docs document **state**.

---

## 8. Composability Between Skills

Skills often need each other. Protocol:

1. **Check availability** — before using another skill's functionality, check if it exists
2. **Delegate if available** — use the complementary skill, do not reimplement
3. **Graceful fallback** — if not available, use the standard approach
4. **Recommend once** — suggest installation at most once per session

**How to document in SKILL.md:**

```markdown
## Integrations

- **Diagrams:** If `mermaid-studio` available, delegate diagram creation.
  Fallback: inline Mermaid code blocks.
- **Exploration:** If `codenavi` available, delegate navigation.
  Fallback: built-in search tools.
```

Creates a modular ecosystem without rigid dependencies.

---

## 9. Maintenance Loop

Unmaintained documentation becomes misinformation — worse than absent, because the agent acts with confidence on wrong info.

**Fundamental rule:** every relevant behavioral change in the code must be reflected in the skills/docs **in the same session**.

**Triggers:**

| Event                                | Expected action                              |
| ------------------------------------ | -------------------------------------------- |
| Code changes a skill's flow          | Propose skill update before closing session  |
| Business rule emerges                | Ask if it should be documented in skill/docs |
| Bug reveals undocumented behavior    | Propose documenting it                       |
| New integration                      | Evaluate new skill or expansion              |
| Session paused with work in progress | Update `STATE.md`                            |

**Closing protocol:**

At the end of a session with changes, the agent:

1. Lists behavioral changes in the code
2. Identifies affected skills/docs
3. Asks: *"The following documentation needs updating: [list]. Update now?"*

Creates habit without being intrusive — does not update automatically, but does not let it pass without warning.

**The agent as documentation guardian:** with `CONVENTIONS.md` in context, actively identifies when code contradicts docs and reports — even when not asked.

---

## 10. Anthropic Three-Agent Pattern

For long tasks, separate into sub-agents:

- **Planner** decomposes spec into tasks (does not execute)
- **Generator** implements tasks (does not decide)
- **Evaluator** validates output against spec (does not consult implementation history)

Application in the framework:

- `PLANNER.md` orchestrates phases (does not create artifacts)
- Each `PHASE-N.md` generates artifacts (does not decide the next phase)
- `PHASE-5-VALIDATION.md` validates (does not correct without confirmation)

This separation avoids the classic problem where the agent starts "adjusting" decisions while implementing, losing the original path.

---

## 11. Usage Scenarios (examples)

### Scenario 1 — Implement an integration

```text
Dev: "Implement data sending to API X"

Startup: Agent reads INSTRUCTIONS.md, identifies via frontmatter
         that skills api-integration and field-mapping are relevant.

Trigger: Reads the 2 SKILL.md (~80 lines total). Knows endpoints,
         normalization flow, retry pattern.

On-demand: Needs full payload → reads API-REFERENCE.md.
           Needs the mapping table → reads MAPPING-TABLE.md.

Total: ~400 lines, vs ~2,000+ if everything was in a monolithic file.
```

### Scenario 2 — New feature

```text
Dev: "Add support for processing marketplace data"

1. Agent reads collection skill → understands existing pattern
2. Reads architecture-patterns.md → knows how to create strategies
3. Reads code-style.md → follows naming conventions
4. Reads detailed guide → understands pagination, dedup, enrichment

Result: implements following patterns without asking.
```

### Scenario 3 — Multi-IDE

New dev uses Windsurf while team uses Cursor. Without additional configuration, Windsurf reads `AGENTS.md` (symlink to `.ai/INSTRUCTIONS.md`) and skills in `.agents/skills/` (symlink to `.ai/skills/`). Receives exactly the same context.

---

## 5. ACE — Memory as Evolving Playbook

> Based on: **Agentic Context Engineering** (arxiv 2510.04618). +10.6% in agent benchmarks, +8.6% in finance.

The ACE approach treats `STATE.md` as a **self-curating playbook** — not as a history log. Three operations per session:

| Operation      | What it does                              | Frequency                  |
| -------------- | ----------------------------------------- | -------------------------- |
| **Generation** | Adds new learning, decision, blocker      | Every session with changes |
| **Reflection** | Identifies what is resolved or obsolete   | Every session              |
| **Curation**   | Removes the obsolete, elevates the useful | Every session              |

**Curation rules:**

- STATE.md ≤ 80 lines → if larger, something was not removed
- An entry in "Lessons Learned" only enters if it is *non-obvious* — insights a new dev would not know
- "Deferred" is the organized trash can — idea that does not die, but does not block

**Why it works:** prevents the problem documented in Spec Kit issue #75 — specs that grow indefinitely generate noise, not context. Curated context > voluminous context.

---

## 6. K-Trial Reliability

> Based on: **ReliabilityBench** (arxiv 2601.06112). pass@1 overestimates reliability by 20-40%.

Instead of measuring only "did the agent pass this task?", AXIS recommends measuring consistency:

| Metric           | What it measures               | How to apply                              |
| ---------------- | ------------------------------ | ----------------------------------------- |
| **pass@1**       | Passed on the first attempt    | Baseline — do not use alone               |
| **pass@k**       | Passed in k independent runs   | Smoke test the same flow 3x               |
| **ε-robustness** | Passed with variation in input | Test with slight reformulation of request |

**Minimum protocol for smoke test in Phase 5:**

```bash
# Run the same bootstrap command 3x on a test project
# If the result is identical in all 3 runs: reliable
# If it varies: document the variation point in STATE.md as blocker
```

**Warning signal:** if the generated structure varies between sessions, the harness is under-configured — probably missing explicit template or acceptance criteria in the skill.

---

## 7. Testable Spec (Anti-Verbosity)

> Based on: GitHub Spec Kit issue #75 ("creates illusion of work") and ReliabilityBench findings.

Long specs are not better specs. AXIS enforces:

| Artifact          | Limit         | Consequence of exceeding                |
| ----------------- | ------------- | --------------------------------------- |
| `INSTRUCTIONS.md` | 100-180 lines | Context loaded always — direct noise    |
| `SKILL.md`        | ≤ 60 lines    | Indexed always — each line costs tokens |
| `STATE.md`        | ≤ 80 lines    | Read at session start — must be focused |

**Testability criterion for a spec:** a spec item is testable if you can answer "how would I know the agent followed this?". If you can't answer, the item is too vague.

Examples:

| Vague (noise)           | Testable (signal)                                                  |
| ----------------------- | ------------------------------------------------------------------ |
| "Follow best practices" | "Use `createQueryBuilder` for bulk insert >100 records"            |
| "Be careful with data"  | "Never execute `DROP` or `TRUNCATE` without explicit confirmation" |

---

## 10. Bidirectional Spec-Code Sync

When code and spec diverge, the direction of the fix depends on the **type of change**:

| Change type                                               | Direction   | Rule                                                                                                           |
| --------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| **Requirements changed** (new AC, business rule modified) | spec → code | Update the Canvas/skill/STATE first. Then regenerate or modify code guided by the updated spec.                |
| **Refactoring** (structure/style, no behavior change)     | code → spec | Refactor code first. Then sync the spec back to reflect the new structure.                                     |
| **Bug fix** (behavior was wrong)                          | spec → code | Clarify the correct behavior in the spec. Then fix the code. Never patch code without closing the intent loop. |

**The golden rule:** when reality diverges from the spec, fix the spec first — then the code. The only exception is refactoring: clean the code, then sync.

**Why it matters:** if you patch code without updating the spec, the next session starts with wrong context. The agent "rediscovers" the bug. The spec is the upstream source of truth — code is its output.

**In AXIS terms:**

- `STATE.md` is updated before implementation when requirements change
- Skills are updated in the same session as the code that makes them stale
- The Maintenance Loop (Pattern #9) triggers at session end — this pattern triggers at change time

**Practical signals that divergence happened:**

- Agent proposes something the spec explicitly contradicts → spec is stale
- Code review reveals a pattern not in any rule → rule is missing
- Bug surfaces that a Safeguard should have caught → Safeguard was absent or vague
