# Project Review — Operational Guide

This guide tells the agent exactly how to load context, run the review, and format its output. Follow every section in order — skip none.

---

## Phase 1 — Context Loading (Purpose Mode)

Execute before reading any diff. Failure to load = invalid review.

### Step 1 · Read INSTRUCTIONS.md

Extract and hold in memory:
- **Central purpose** (what problem does the project solve, for whom)
- **Design principles** (e.g., "Harness before prompts", "Single Source of Truth")
- **Out-of-scope** statements if present

### Step 2 · Read STATE.md

Extract and hold in memory:
- **Active decisions** — architectural or behavioral choices already locked
- **Blockers** — anything currently forbidden
- **Deferred ideas** — items explicitly postponed (no code for them is expected)

### Step 3 · Read the Feature Canvas (if it exists)

Look for a `REASONS Canvas` file linked to the PR or feature being reviewed.
- Extract **Safeguards** (S₂ section) — treat each as a mandatory acceptance criterion
- Extract **Acceptance Criteria** (R section) — must all be verifiable in the diff
- Extract **Structure** (S₁ section) — diff must be confined to listed files/components

If no Canvas exists, note it and proceed; its absence is a **warning** (not a blocker)
unless the change touches more than 2 components or has business-logic implications.

---

## Phase 2 — Purpose Check

Answer all five questions before moving to technical analysis. A **NO** or **UNCLEAR** stops the review at this phase and must be resolved with the author.

| # | Question | Expected Answer |
|---|----------|-----------------|
| 1 | Does this change solve a problem stated in the project's central purpose? | YES |
| 2 | Does it respect the design principles in INSTRUCTIONS.md? | YES |
| 3 | Does it contradict any active decision recorded in STATE.md? | NO |
| 4 | Is it confined to the scope declared in the Canvas Structure (if a Canvas exists)? | YES |
| 5 | Does it implement — or move closer to — a defined Acceptance Criterion? | YES |

Record each answer in the output report (see Phase 4).

---

## Phase 3 — Technical Review (Quality Mode)

Apply only after Phase 2 passes. Use the full `references/CHECKLIST.md` to evaluate the diff dimension by dimension.

### Severity Levels

| Level | Meaning | Merge allowed? |
|-------|---------|----------------|
| **blocker** | Violates a Safeguard, introduces a known vulnerability, or breaks a registered architectural decision | No |
| **warning** | Deviates from best practices or conventions in a way that increases risk or maintenance cost | With explicit author acknowledgment |
| **suggestion** | Improvement that does not affect correctness or safety | Yes — author's discretion |

### Dimension Order

Evaluate dimensions in this fixed order (stop at first blocker to avoid noise):

1. Architecture
2. Security
3. Best practices
4. Test coverage
5. Observability

---

## Phase 4 — Output Report Format

Deliver one structured report. Use this template exactly — it forces precision and avoids vague prose.

```
## Project Review Report — <feature/PR name>

### Purpose Check

| # | Question | Answer | Notes |
|---|----------|--------|-------|
| 1 | Solves a problem in project purpose? | YES / NO / UNCLEAR | |
| 2 | Respects design principles? | YES / NO / UNCLEAR | |
| 3 | Contradicts an active decision? | NO / YES | decision name if YES |
| 4 | Confined to Canvas Structure? | YES / NO / N/A | |
| 5 | Implements or advances a defined AC? | YES / NO / UNCLEAR | |

**Purpose verdict:** PASS / FAIL / NEEDS DISCUSSION

---

### Technical Findings

<!-- One block per finding. Omit dimensions with no findings. -->

#### [DIMENSION] · [FINDING TITLE]
- **Severity:** blocker / warning / suggestion
- **Location:** file:line or component name
- **Finding:** <one sentence describing what was found>
- **Expected action:** <one sentence describing what must change>

---

### Summary

- Blockers: N
- Warnings: N
- Suggestions: N
- **Merge recommendation:** APPROVED / BLOCKED / APPROVED WITH CONDITIONS
```

---

## Checklist — When to Stop the Review Early

Stop and flag immediately (do not continue to the next dimension) if:

- [ ] Purpose check returns FAIL — escalate to author before proceeding
- [ ] A Canvas Safeguard is directly violated — this is always a blocker
- [ ] Active decision in STATE.md is contradicted — request alignment session
- [ ] A security blocker is found — no further review until it is resolved
