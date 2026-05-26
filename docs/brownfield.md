# Brownfield Workflow — Using `axis-delta` for Existing Systems

> Specifying *changes* to a system that already exists is fundamentally
> different from specifying a new one. AXIS handles this with a dedicated
> skill (`axis-delta`) that produces focused proposals in the
> ADDED / MODIFIED / REMOVED format, instead of forcing a full re-spec.

## When `axis-delta` activates

The agent loads `axis-delta` (rather than `axis-specify`) when:

- The user describes a change to existing behaviour, *and*
- The change touches **≥2 modules** of code already in the repo, *or*
- The change alters a **public contract** (HTTP route shape, exported
  function signature, DB schema)

For single-file bugfixes, neither skill is loaded — the agent works
directly. For greenfield (no prior implementation), `axis-specify` loads.

## The brownfield pipeline

```
User: "I need rate limiting on POST /auth/login"
  │
  ▼
Agent loads axis-delta (detects brownfield: existing route + public contract)
  │
  ▼
.ai/deltas/2026-05-26-auth-rate-limit/
  ├── proposal.md       (what + why — 10 lines max)
  ├── delta-spec.md     (ADDED / MODIFIED / REMOVED — 3 sections, all present)
  ├── impact.md         (affected modules, risks, rollback)
  └── tasks.md          (implementation items, [P] for parallel-safe)
```

The pipeline has two explicit gates:

1. After `delta-spec.md`: agent presents ADDED / MODIFIED / REMOVED to
   the user. *"Confirm before tasks?"* — wait.
2. After `tasks.md`: agent asks *"Anything to modify before implementation?"*

## The delta-spec format

Every delta has **three mandatory sections** (empty ones use a `_(none)_`
placeholder, so a missing section means it was forgotten, not skipped):

### ADDED

New behaviours that did not exist before. Each item is a stand-alone
capability with concrete user-visible evidence:

```markdown
- **Rate-limit on POST /auth/login** — 5 requests per IP per minute
  - Evidence: `curl -X POST .../auth/login` x6 returns `429` on the 6th
  - Maps to AC: R.AC4 (new — appended to the Canvas during archive)
```

### MODIFIED

Behaviours that exist but change. Each item names **Before**, **After**, and
**Reason** explicitly — "refactor" is not a reason:

```markdown
- **Auth response envelope**
  - **Before:** `{ token, user }`
  - **After:**  `{ token, user, rate_limit: { remaining, reset_at } }`
  - **Reason:** clients need to display countdown without parsing 429s
  - **Migration:** clients ignoring unknown fields are unaffected
```

### REMOVED

Behaviours that no longer exist. Every removal carries an `impact:` line:

```markdown
- **Legacy `/login` redirect (without `/auth` prefix)**
  - **Impact:** clients still using the old URL get 404. Last hit > 6 months ago.
  - **Replacement:** none — communicated via release notes
```

## After merge — archive the delta

When the delta's PR merges into `main` and the code is live, the agent
follows `references/ARCHIVE-PROCEDURE.md`:

1. **Fold the delta into the authoritative Canvas:**
   - ADDED → append items to Canvas R / extend E, S₁, C, O, T as needed
   - MODIFIED → replace the prior text with the "After" value
   - REMOVED → delete the lines (and leave nothing dangling)
2. **Move the folder to the archive:**
   ```bash
   git mv .ai/deltas/<date>-<slug>/ .ai/deltas/archive/<date>-<slug>/
   ```
3. **Record in STATE.md** *only if* the delta changed a public contract or
   set a new convention. STATE is not a diary.
4. **Single commit** ties Canvas amendment + archive move together.

## Why not just regenerate the Canvas?

For a small change, re-deriving the whole Canvas:

- Loses the "why" — `git blame` on a Canvas line shows the delta commit,
  whereas a regenerated Canvas shows only the most recent author
- Forces re-confirmation of every AC by the user — friction proportional
  to spec size, not change size
- Drops review context — the next reviewer reads the regenerated Canvas
  with no signal that anything is new

Delta specs preserve all of the above.

## Anti-patterns

- **Mixing ADDED and MODIFIED in one bullet.** A new field on an existing
  endpoint is MODIFIED (the endpoint shape changed). A brand-new endpoint
  with no peer is ADDED. Be honest — reviewers will catch the conflation.
- **Bypassing the gate.** Writing `tasks.md` before the user confirms the
  delta-spec means scope can drift before it is locked. The skill explicitly
  pauses; do not skip.
- **Archiving without folding.** If the delta merges but the Canvas is not
  amended, the Canvas now lies. Always archive in the same commit as the
  Canvas amendment.

## Cross-references

- The skill itself: [`.ai/skills/axis-delta/SKILL.md`](../.ai/skills/axis-delta/SKILL.md)
- Template format: [`references/DELTA-TEMPLATE.md`](../.ai/skills/axis-delta/references/DELTA-TEMPLATE.md)
- Archive procedure: [`references/ARCHIVE-PROCEDURE.md`](../.ai/skills/axis-delta/references/ARCHIVE-PROCEDURE.md)
- Greenfield counterpart: [`axis-specify`](../.ai/skills/axis-specify/SKILL.md)
