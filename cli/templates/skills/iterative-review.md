---
name: iterative-review
description: Review skill — turns AI code output into a controlled engineering loop
  instead of a one-shot draft. Use after AI generates code, when a code review reveals
  issues beyond style, or when the team is stuck in "regenerate until it works" loops.
  Covers the two-track review strategy: logic corrections (spec → code) vs. refactoring
  (code → spec). Trigger terms: code review, AI output review, fix and iterate,
  rework loop, review strategy, logic correction, refactoring sync.
---

# Iterative Review

Turn AI output into a controlled engineering loop. Without a disciplined review-and-iterate cycle, teams either patch endlessly (solution drifts) or restart repeatedly (cost explodes).

## When to Use

- AI just generated code from a Canvas
- Code review reveals structural or logic issues
- Team is stuck in a "keep regenerating" loop

## Review Priority Order

1. **Architecture** — correct layer structure?
2. **Business logic** — matches Canvas ACs?
3. **Scope** — diff confined to Canvas Structure?
4. **Code quality** — magic numbers, naming, duplication

## Two Tracks for Issues

**Track A — Logic Correction** (behavior changes) → direction: **spec → code**
1. Identify mismatch between code and Canvas
2. Update Canvas (R, O, or S section) with correct intent
3. Regenerate only the affected Operations
4. Verify only the targeted area changed

> Never patch code for a logic issue without updating the spec first.

**Track B — Refactoring** (no behavior change) → direction: **code → spec**
1. Refactor code in small incremental steps
2. Verify tests still pass
3. Sync Canvas Operations/Structure to reflect the new structure

## Iteration Checklist

- [ ] Architecture check — no layer violations
- [ ] All Canvas ACs verified with concrete values
- [ ] Scope check — diff only touches files in Canvas Structure
- [ ] Logic issues: Canvas updated before code patched
- [ ] Refactoring: tests green, Canvas synced after

## Final Validation

- [ ] Canvas is accurate record of current code behavior
- [ ] Tests cover all Canvas Safeguards
- [ ] STATE.md updated with any new patterns or decisions
