# REASONS Canvas — SPDD Artifact Template

> Single-page spec produced collaboratively (PO + dev + AI) before code generation. Aligned with [Martin Fowler — Structured Prompt-Driven Development](https://martinfowler.com/articles/structured-prompt-driven). Filled by the AXIS SPDD pipeline (`story-decompose` → `alignment` → `abstraction-first` → generate → `iterative-review`).

## Why a Canvas (not a long doc)

Long specs create the illusion of work (Spec Kit issue #75). The Canvas enforces a single page per feature — if it doesn't fit, the feature is too big and must be re-decomposed via `story-decompose`.

## The seven dimensions (R-E-A-S-O-N-S)

| Letter  | Dimension          | Layer      | Filled by                | Purpose                                                  |
| ------- | ------------------ | ---------- | ------------------------ | -------------------------------------------------------- |
| **R**   | Requirements       | Abstract   | `story-decompose`        | INVEST story + Given/When/Then ACs + DoD                 |
| **E**   | Entities           | Abstract   | `abstraction-first`      | Domain nouns, relationships, single responsibility       |
| **A**   | Approach (Strategy)| Abstract   | `abstraction-first`      | High-level strategy to satisfy R                         |
| **S₁**  | System structure   | Abstract   | `abstraction-first`      | Components, layer boundaries, file tree                  |
| **O**   | Operations         | Specific   | `alignment` + dev        | Concrete, testable steps / endpoints / methods           |
| **N**   | Norms              | Governance | `alignment`              | Engineering standards (naming, logging, defensive coding) |
| **S₂**  | Safeguards         | Governance | `alignment`              | Non-negotiable invariants (correctness, perf, security)  |

> **Layered reading:**
> - **Abstract (R, E, A, S₁)** = intent + design. *What* and *with what shape*.
> - **Specific (O)** = execution. *How*, step-by-step.
> - **Governance (N, S₂)** = boundaries. *What must always hold*.

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

## O — Operations
- [ ] `PricingService.calculate(input)`: input → output, references AC #1, #3
- [ ] `StandardStrategy.apply(usage)`: …
- [ ] HTTP endpoint `POST /pricing/quote`: returns 200 with body schema X

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
1. story-decompose    → fills R (one Canvas per INVEST story)
2. alignment          → fills O (scope lock) + N + S₂
3. abstraction-first  → fills E + A + S₁
4. (code generation)  → uses O as direct prompt; checks N + S₂ on every step
5. iterative-review   → updates Canvas (Track A) or syncs Canvas to code (Track B)
```

## Validation gates

- [ ] All seven dimensions present (no `TBD`)
- [ ] R has ≥2 ACs with concrete numeric values
- [ ] E entities each have a single, stated responsibility
- [ ] A names a concrete strategy (not "we'll figure it out")
- [ ] S₁ file tree is **closed** — no wildcards
- [ ] O references AC numbers from R (traceability)
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
