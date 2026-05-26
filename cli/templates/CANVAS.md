# Canvas — {{SLUG}}

> One-page REASONS spec. If it doesn't fit, run `axis spdd story` to re-decompose.

## R — Requirements
**Story:** As a <role>, I want <capability>, so that <value>.
**ACs (Given/When/Then):**
- Given …, When …, Then … (concrete numeric expected value)
- Given …, When …, Then …
**Definition of Done:**
- [ ] All ACs verified with automated tests
- [ ] …

## E — Entities
- **<EntityA>** — single responsibility: …; relates to <EntityB> via …
- **<EntityB>** — …

## A — Approach (strategy)
<1-3 sentences on the strategy chosen to satisfy R.>

## S₁ — System structure
**Layers:** Controller → Service → Repository → Domain
**Components:**
- `<Service>` (new/modified) — …
- `<Strategy>` interface — …
**File tree (closed scope):**
```text
src/
└── …
tests/
└── …
```

## O — Operations
- [ ] `<function or endpoint>(input) → output` — references AC #1
- [ ] …

## N — Norms
- Naming: …
- Logging: structured JSON with `correlationId` on every Service entry/exit
- Errors: throw `DomainError` for business rule violations
- Tests: AAA, no shared mutable fixtures

## S₂ — Safeguards (invariants — **each one becomes a failing test first**)

> Format: `- [ ] test: <invariant>` — keyword(s) after `test:` must be grep-able in your test suite. Run `axis spdd verify {{SLUG}}` to check coverage. The box stays unchecked until at least one test asserts the invariant.

- [ ] test: <Invariant 1 — e.g., "rejects negative quantity">
- [ ] test: <Invariant 2 — e.g., "no PII in logs">
- [ ] test: DROP/TRUNCATE never executed without explicit confirmation
