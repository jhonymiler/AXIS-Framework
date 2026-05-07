# Phase 4 — Memory Layer Initialization

**Goal:** ensure the project has continuity between sessions — decisions, state, and conventions persist even when the dev changes, the IDE changes, or time passes.

**Input:** Spec Layer (Phase 2) and Harness Layer (Phase 3) confirmed.

**Output:** two active memory artifacts in the project.

---

## Foundation: ACE Principle (Agentic Context Engineering)

> Reference paper: **ACE — Agentic Context Engineering** (arxiv 2510.04618), which demonstrated +10.6% in agent benchmarks and +8.6% in finance with an approach that treats contexts as **evolutionary playbooks**.

**What changes compared to a history log:**

| Traditional approach           | ACE approach (AXIS)                           |
| ------------------------------ | --------------------------------------------- |
| Append-only: accumulates everything | Active curation: removes obsolete, elevates useful |
| Grows indefinitely → noise     | Controlled size → focus                       |
| History context                | Strategy context                              |
| Session starts from zero       | Session starts informed                       |

**Practical implication:** `STATE.md` is not a diary — it is a playbook. Each session the agent not only writes: it *refines*. Removes what was resolved. Elevates what proved useful. The result is that context *improves over time* instead of degrading.

---

## Why the Memory Layer Exists

Without it, long-running projects regress with each session:

- "Why did we decide X?" — lost
- "What was in progress?" — redone from scratch
- "What lesson did we learn from that bug?" — repeated
- Spec Kit issue #75: "great specs but every new chat starts from zero"

The Memory Layer is what makes the system **antifragile over time**.

---

## The Two Artifacts

| Artifact         | Type                   | Update                                     |
| ---------------- | ---------------------- | ------------------------------------------ |
| `STATE.md`       | Live playbook (curated) | Each session — curate, not just append     |
| `CONVENTIONS.md` | Meta (structure)        | When the `.ai/` structure changes          |

---

## Step 1 — `STATE.md`

Create `.ai/docs/STATE.md` with **six mandatory sections**, even if they start empty:

```markdown
# Project State

## Active Decisions
<!-- [YYYY-MM-DD] Decision X made because Y -->

## In Progress
<!-- Feature Z: 70% complete, missing integration with API -->

## Blockers
<!-- API X returning 429 in staging — waiting for vendor response -->

## Deferred Ideas
<!-- Migrate to gRPC — evaluate when volume exceeds 10k req/min -->

## Lessons Learned
<!-- Bulk insert: use createQueryBuilder, not save() for >100 records -->

## Pending TODOs
- [ ]

---

## Handoff Protocol

At the end of any session with relevant changes, the agent updates this file with:
- What was done
- What is left
- Any context that would be lost

At the start of a session, the agent reads this file **before** anything else.
```

**Ask the user before finalizing:**

> "Are there decisions already made, current blockers, past lessons, or deferred ideas that should go into `STATE.md` before the first real session?"

If there are, populate the sections with what the user provides. If not, leave with stub comments showing the expected format.

### Session Handoff Protocol

Document inside `STATE.md` (at the bottom, as instruction for the agent) — as shown in the template above.

---

## Step 2 — `CONVENTIONS.md`

Create `.ai/CONVENTIONS.md`. Use template from [TEMPLATES.md → CONVENTIONS.md](TEMPLATES.md#conventionsmd). Minimum content:

1. **Single Source of Truth principle** + symlink map
2. **Templates** for creating new skills and rules (reference to TEMPLATES.md or local copy)
3. **Rules for the agent:**
   - Where to create files
   - What never to do (duplicate between IDEs, create outside `.ai/`)
4. **Knowledge Verification Chain** (codebase → docs → MCP/Context7 → web → mark as uncertain)
5. **How to add support for new IDE** (3 `ln -s` commands)
6. **Maintenance protocol** — triggers for updating docs

---

## Step 3 — Validation and Gate

Present to user:

```markdown
## Memory Layer Initialized

### Files created
- .ai/docs/STATE.md (with 6 structured sections)
- .ai/CONVENTIONS.md

### STATE.md populated with
- N active decisions
- N items in progress
- N blockers
- N deferred ideas
- N lessons
- N TODOs

### Next step
Final validation in Phase 5.
```

**Wait for confirmation before Phase 5.**

---

## Maintenance Loop (document for future use)

This section is recorded in `CONVENTIONS.md` for future reference:

**Triggers for documentation updates:**

| Event                                        | Expected agent action                          |
| -------------------------------------------- | ---------------------------------------------- |
| Code changes a skill's workflow              | Propose skill update before ending session     |
| Architectural decision in the session        | Propose update to `architecture.md`            |
| Business rule emerges                        | Ask whether to document in skill/docs          |
| Bug reveals undocumented behavior            | Propose documenting                            |
| New integration/dependency                   | Evaluate new skill or expansion                |
| Session paused with work in progress         | Update `STATE.md`                              |

**Principle:** the agent does not update automatically without confirmation, but does not let it pass without alerting either. Becomes **documentation guardian**.

---

## Anti-patterns

- Leaving `STATE.md` with only stub comments without asking the user (misses the chance to capture fresh context)
- Skipping `CONVENTIONS.md` as it seems "obvious" — it is what keeps the structure alive
- **Appending without curating**: STATE.md with 500+ lines is a failure signal — context grows, focus shrinks

---

## ACE Curation Protocol

At the end of **every** session with changes, execute in sequence:

```markdown
## STATE.md Curation

1. Move to "Active Decisions" what was decided in this session
2. Remove from "In Progress" what was completed
3. Remove from "Blockers" what was resolved
4. Add to "Lessons Learned" any non-obvious insight
5. Move to "Deferred" ideas that won't be executed now
```

**STATE.md target size:** ≤ 80 lines. If exceeded, it signals that resolved items were not removed.

**At session start:**
1. Read STATE.md *before* anything else
2. Check if "In Progress" reflects the current reality
3. Update the date in the STATE.md header
