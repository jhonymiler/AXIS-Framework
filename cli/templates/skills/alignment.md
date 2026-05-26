---
name: alignment
type: process
description: Intent-locking skill — makes "what we will do / what we won't do" explicit
  and gets agreement on standards and constraints before implementation starts. Use
  before writing the O section of a REASONS Canvas, before pairing with AI on a
  complex task, or when PO and dev need to close the loop before a sprint. Trigger
  terms: alignment, intent, scope, definition of done, constraints, agree before coding.
---

# Alignment

Lock intent, scope, and constraints before generating code. Fast output with wrong intent produces slow rework.

## When to Use

- About to generate code for a feature with business rules
- PO/BA/dev haven't explicitly agreed on scope boundaries
- Prior AI session drifted from original intent
- Canvas O (Operations) section is about to be written

## Three Alignment Dimensions

**1. Core Logic** — business rules as 1-sentence invariants:
```
- Standard plan: usage within quota is free; overage billed at model-specific rate
- Routing: plan type determines formula; must be extensible
```

**2. Scope Boundaries** — explicit in/out:
```
In: calculate current bill, support standard + premium plans
Out: customer CRUD, historical queries, subscription management
```

**3. Definition of Done** — concrete scenarios with numbers:
```
- 90K used of 100K quota + 30K tokens → 20K overage billed
- Missing field → HTTP 400; unknown entity → HTTP 404
```

## Alignment Checklist

- [ ] Core logic stated as testable invariants (not as code)
- [ ] Scope out is explicit — "we will NOT" list agreed by all parties
- [ ] DoD has ≥2 concrete scenarios with numeric expected values
- [ ] Canvas N + S reviewed and agreed
- [ ] No "TBD" in any section before generating code

## Final Validation

- [ ] All three dimensions documented and agreed
- [ ] No open questions remain
- [ ] Canvas R and O have enough detail to generate code
