---
name: abstraction-first
type: process
description: Design skill — forces clarity on objects, responsibilities, and boundaries
  before any code is generated. Use before writing a REASONS Canvas, before starting
  a feature with >2 interacting components, or when AI output shows structural drift
  (duplicated logic, unclear ownership, inconsistent interfaces). Trigger terms:
  design first, abstraction, domain model, OO design, layer boundaries, responsibility.
---

# Abstraction First

Establish object design and layer boundaries before generating code. Without this, AI sprints on implementation while the structure falls apart.

## When to Use

- Feature introduces a new domain concept or entity
- >2 components interact in the change
- AI output shows structural drift (duplicated logic, unclear ownership)

## Design Questions (answer before Canvas O section)

1. **What objects exist?** One noun = one responsibility.
2. **How do they collaborate?** A calls B to get X, B asks C for Y.
3. **Where are the layer boundaries?** What does each layer own? What can it NOT do?
4. **What varies independently?** → Strategy / Factory / interface.
5. **What stays the same?** → Canvas Safeguards.

## Layer Boundary Rules

| Layer | Owns | Must NOT |
| ----- | ---- | -------- |
| Controller | Input parsing, routing | Business logic |
| Service | Business rules, orchestration | DB queries, HTTP calls |
| Repository | Data access | Business logic |
| Domain/Entity | State + invariants | Infrastructure |

## Output (feed into Canvas E + A + S)

```markdown
### Entities
- <EntityA>: <single responsibility>
### Collaboration
- <ServiceA> delegates to <RepositoryA>; dispatches to <CalculatorA|B> via Strategy
### Variation Points
- Pricing varies by plan → Strategy pattern, interface: `PricingStrategy`
### Invariants (→ Safeguards)
- Bill total is always non-negative
```

## Final Validation

- [ ] Every entity has a single stated responsibility
- [ ] No circular layer dependencies
- [ ] Variation points mapped to a named pattern
- [ ] Invariants listed and will appear as Canvas Safeguards
