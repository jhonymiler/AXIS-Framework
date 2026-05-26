---
name: axis-delta
type: process
description: Specifies *incremental changes* to an existing system (brownfield) via
  delta specs in the ADDED / MODIFIED / REMOVED format. Use when a change touches
  ≥2 modules of code that already exists, or when it alters a public contract,
  or when re-specifying the entire feature from scratch would be wasteful.
  Skill-driven — agent executes the pipeline using Read/Write/Bash/git; no
  `axis <command>` runtime dependency on the bootstrapped project.
  Trigger terms: brownfield, delta spec, ADDED MODIFIED REMOVED, change proposal,
  incremental change, contract change, archive delta.
---

# axis-delta — Brownfield Change Specification

Produces a focused change proposal for an existing system instead of a full
re-specification. Inspired by OpenSpec's delta workflow (ADDED / MODIFIED /
REMOVED) but executed entirely by the agent without a CLI command surface.

## When to use

- Existing feature must change behaviour or contract
- ≥2 modules affected, or a public API/schema changes
- A REASONSTC Canvas already exists for the original feature
- Do **not** use for greenfield work — use `axis-specify` + Canvas instead

## Pipeline (agent executes)

1. **Locate the current spec** — read the Canvas under `.ai/specs/<feature>/` or
   the most recent archived delta for the same feature
2. **Create the delta folder** — `mkdir -p .ai/deltas/$(date +%F)-<slug>/`
3. **Write `proposal.md`** — what + why in ≤10 lines (no implementation detail)
4. **Write `delta-spec.md`** using `references/DELTA-TEMPLATE.md` — the three
   sections ADDED / MODIFIED / REMOVED with concrete evidence per item
5. **Write `impact.md`** — affected modules, risks, rollback strategy
6. **Gate:** present the three sections to the user, wait for confirmation
7. **After confirmation, write `tasks.md`** with `[P]` markers for parallelisable
   items
8. **Final gate:** "Is the delta complete? Anything to modify before implementation?"

## Archive (after merge)

When the delta has been merged into `main` and the code lives:
- Follow `references/ARCHIVE-PROCEDURE.md` to `git mv` the folder into
  `.ai/deltas/archive/` and fold ADDED/MODIFIED/REMOVED back into the
  authoritative Canvas

## Validation gates

- [ ] `delta-spec.md` has all three sections present (sections may be empty,
      but the header must exist with a `_(none)_` placeholder)
- [ ] Every MODIFIED item names the prior behaviour AND the new behaviour AND
      the reason
- [ ] Every REMOVED item includes an `impact:` line
- [ ] `tasks.md` items map 1-to-1 to delta-spec entries (traceability)
- [ ] **Zero `axis <subcommand>` references in the produced artifacts** —
      this skill is self-contained
