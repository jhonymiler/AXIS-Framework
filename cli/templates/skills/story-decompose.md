---
name: story-decompose
type: process
description: Decomposes large requirements into independent, deliverable user stories
  following the INVEST principle (1-5 days of work each). Use when a feature is too
  large to spec in one pass, when requirements come as a blob of business text, or
  when a PO/BA needs to align with a dev before implementation. Trigger terms:
  user story, INVEST, story split, requirement decomposition, acceptance criteria.
---

# Story Decompose

Breaks a large requirement into INVEST stories with concrete Given/When/Then ACs, ready for domain analysis or REASONS Canvas.

## When to Use

- Feature covers >2 user types, plans, or behavior variants
- Estimated at >5 days of work
- ACs are missing, vague, or written as technical tasks

## INVEST Checklist (per story)

| Letter | Test |
| ------ | ---- |
| **I** ndependent | Deliverable without another story done first? |
| **N** egotiable | Details adjustable without losing core value? |
| **V** aluable | Visible business value on its own? |
| **E** stimable | Fits a rough effort estimate? |
| **S** mall | 1-5 days of work? |
| **T** estable | Has verifiable ACs? |

## Story Template

```markdown
## Story <ID> — <Short title>
**Background:** <Why this story matters — 1 sentence>
**Scope in:** <What is included>
**Scope out:** <Explicit exclusions>
**Acceptance Criteria:**
- Given <context>, When <action>, Then <expected with concrete values>
```

## Process

1. Read full requirement; identify vertical slices (by user type, plan, or behavior)
2. Draft one story per slice
3. Apply INVEST checklist; split any story that fails S or T
4. Present with IDs; confirm with user before advancing to Domain Analysis

## Final Validation

- [ ] Every story passes INVEST (S and T non-negotiable)
- [ ] No cross-story dependencies
- [ ] Each story has ≥2 ACs with concrete numeric values
- [ ] Stories cover 100% of original scope
