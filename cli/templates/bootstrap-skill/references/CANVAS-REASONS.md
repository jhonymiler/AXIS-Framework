# REASONS Canvas — SPDD Artifact Template

> Single-page spec produced collaboratively (PO + dev + AI) before code generation. Aligned with [Martin Fowler — Structured Prompt-Driven Development](https://martinfowler.com/articles/structured-prompt-driven). Filled by the AXIS SPDD pipeline (`story-decompose` → `alignment` → `abstraction-first` → generate → `iterative-review`).

## Why a Canvas (not a long doc)

Long specs create the illusion of work (Spec Kit issue #75). The Canvas enforces a single page per feature — if it doesn't fit, the feature is too big and must be re-decomposed via `story-decompose`.

## The nine dimensions (R-E-A-S₁-C-O-T-N-S₂ — mnemonic: REASONSTC)

| Letter  | Dimension          | Layer      | Filled by                | Purpose                                                  |
| ------- | ------------------ | ---------- | ------------------------ | -------------------------------------------------------- |
| **R**   | Requirements       | Abstract   | `story-decompose`        | INVEST story + Given/When/Then ACs + DoD                 |
| **E**   | Entities           | Abstract   | `abstraction-first`      | Domain nouns, relationships, single responsibility       |
| **A**   | Approach (Strategy)| Abstract   | `abstraction-first`      | High-level strategy to satisfy R                         |
| **S₁**  | System structure   | Abstract   | `abstraction-first`      | Components, layer boundaries, file tree                  |
| **C**   | Contracts          | Abstract   | `abstraction-first`      | Interfaces between components: I/O types + pre/post/invariant |
| **O**   | Operations         | Specific   | `alignment` + dev        | Concrete, testable steps / endpoints / methods           |
| **T**   | Test Scenarios     | Specific   | `story-decompose`        | G/W/T per AC, minimum 1 happy + 1 failure + 1 edge case  |
| **N**   | Norms              | Governance | `alignment`              | Engineering standards (naming, logging, defensive coding) |
| **S₂**  | Safeguards         | Governance | `alignment`              | Non-negotiable invariants (correctness, perf, security)  |

> **Layered reading:**
> - **Abstract (R, E, A, S₁, C)** = intent + design + interface boundary. *What*, *with what shape*, and *how components talk*.
> - **Specific (O, T)** = execution + verification. *How* and *how to prove it works (including when it fails)*.
> - **Governance (N, S₂)** = boundaries. *What must always hold*.
>
> **Why T when R already has ACs:** R defines *one* G/W/T per AC (the happy path). T forces failure + edge-case scenarios explicitly — the gap most missed by single-AC specs. **Why C when S₁ exists:** S₁ names components; C nails down the *contract surface* between them, eliminating "we'll figure out the types later".

## Canvas template

````markdown
# Canvas — <feature name>

## R — Requirements
**Story:** As a <role>, I want <capability>, so that <value>.
**ACs (Given/When/Then):**
- Given <context>, When <action>, Then <expected with concrete numbers>
- Given …, When …, Then …
**Definition of Done:**
- [ ] All ACs verified with automated tests
- [ ] <other DoD criteria>

## E — Entities
- **<EntityA>** — single responsibility: <…>; relates to <EntityB> via <…>
- **<EntityB>** — …

## A — Approach (strategy)
<1-3 sentences on the strategy. e.g. "Compute pricing via Strategy pattern keyed on plan type, dispatched from PricingService. Use existing repository for persistence — no schema change.">

## S₁ — System structure
**Layers touched:** Controller → Service → Repository → Domain
**Components:**
- `PricingService` (new) — orchestrates strategy lookup and computation
- `PricingStrategy` (interface) — Standard / Premium implementations
**File tree (closed scope):**
```
src/
├── domain/<Entity>.ts            (new)
├── application/<Service>.ts      (modified)
└── infrastructure/<Repo>.ts      (new)
tests/
└── application/<Service>.spec.ts (new)
```

## C — Contracts
```typescript
// PricingService → PricingStrategy
interface PricingInput {
  plan: 'standard' | 'premium';  // required — drives strategy selection
  usage: number;                  // required, ≥ 0 (S₂ invariant)
}

interface PricingOutput {
  total: number;                  // always ≥ 0 (S₂ invariant)
  breakdown: Array<{ label: string; amount: number }>;
}

// Pre-condition:  usage ≥ 0; plan recognised by registry
// Post-condition: total === sum(breakdown.amount); never negative
// Invariant:      same input → same output (pure function, no I/O)
```

> **Minimum:** every component named in S₁ that exposes a public method must have
> one contract block here. Internal helpers do not.
> **Gate:** every contract has at least one pre-condition AND one post-condition;
> invariants only when needed.

## O — Operations
- [ ] `PricingService.calculate(input)`: input → output, references AC #1, #3
- [ ] `StandardStrategy.apply(usage)`: …
- [ ] HTTP endpoint `POST /pricing/quote`: returns 200 with body schema X

## T — Test Scenarios
| #   | Given                            | When                                   | Then                                    | Type       |
| --- | -------------------------------- | -------------------------------------- | --------------------------------------- | ---------- |
| 1   | plan=standard, usage=10          | `PricingService.calculate(input)`      | total=12.50, breakdown has 1 line       | happy path |
| 2   | usage=-1                         | `PricingService.calculate(input)`      | throws `DomainError("usage must be ≥0")`| failure    |
| 3   | plan='unknown'                   | `PricingService.calculate(input)`      | throws `DomainError("plan unsupported")`| failure    |
| 4   | usage=0                          | `PricingService.calculate(input)`      | total=0, breakdown empty                | edge case  |

> **Minimum per story:** 1 happy path + 1 failure + 1 edge case.
> **Gate:** every row's `Then` is a concrete observable assertion (numbers, exact
> error types) — no "should work correctly".

## N — Norms
- Naming: `<Entity>Service`, `<Entity>Repository` — no abbreviations
- Logging: structured JSON with `correlationId` on every Service entry/exit
- Errors: throw `DomainError` for business rule violations, never return null
- Tests: AAA, no shared mutable fixtures

## S₂ — Safeguards (invariants)
- Bill total is always non-negative
- No PII in logs
- Latency p95 < 200ms for `/pricing/quote`
- DROP/TRUNCATE never executed without explicit confirmation
````

## Canvas lifecycle

```text
1. story-decompose    → fills R + T (one Canvas per INVEST story)
2. alignment          → fills O (scope lock) + N + S₂
3. abstraction-first  → fills E + A + S₁ + C
4. (code generation)  → uses O + C as direct prompt; T becomes the failing-test
                        scaffolding; checks N + S₂ on every step
5. iterative-review   → updates Canvas (Track A) or syncs Canvas to code (Track B)
```

## Validation gates

- [ ] All nine dimensions present (no `TBD`)
- [ ] R has ≥2 ACs with concrete numeric values
- [ ] E entities each have a single, stated responsibility
- [ ] A names a concrete strategy (not "we'll figure it out")
- [ ] S₁ file tree is **closed** — no wildcards
- [ ] C has one contract block per public component in S₁, with pre + post conditions
- [ ] O references AC numbers from R (traceability)
- [ ] T has ≥1 happy + ≥1 failure + ≥1 edge case per story, every `Then` is observable
- [ ] N has ≥3 standards (naming + observability + at least one more)
- [ ] S₂ has ≥1 invariant (otherwise no test target)

## Storage

- One Canvas per feature, lives in `.ai/docs/canvases/<feature-slug>.md`
- When complete + merged, move under `.ai/docs/canvases/done/` (kept for traceability)
- The active Canvas is referenced from `STATE.md` → In Progress

## Relation to STATE.md

- Canvas captures **one feature** (closed scope, eventually archived)
- STATE captures **project-level continuity** (active decisions, blockers)
- Deferrals from Canvas → flow into STATE → seed next Canvas
