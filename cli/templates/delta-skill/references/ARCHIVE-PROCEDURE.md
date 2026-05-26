# Archive Procedure

> Loaded by `axis-delta` after the delta's PR has been merged into the default
> branch and the code is live. Folds the delta back into the authoritative
> Canvas so the Canvas always reflects current reality.
>
> Skill-driven — every step is a `git`, `mv`, or `Edit` call by the agent. No
> `axis <command>` exists for this; the procedure lives in the skill bundle.

## Pre-conditions

1. Delta folder exists at `.ai/deltas/<YYYY-MM-DD>-<slug>/`
2. The delta's PR is merged on `main` (or the project's default branch)
3. The Canvas being amended exists at `.ai/specs/<feature>/canvas.md` (or the
   user names where it lives)

If any pre-condition fails, abort and report — do not invent a path.

## Procedure

### 1. Fold the delta into the Canvas

For each section of `delta-spec.md`:

| Section  | Canvas edit                                                                   |
| -------- | ----------------------------------------------------------------------------- |
| ADDED    | Append new ACs to R; add Entities to E if new; extend S₁/C/O/T as needed     |
| MODIFIED | Replace the prior text in the affected Canvas section with the "After" value  |
| REMOVED  | Delete the lines from the Canvas section; never leave dangling references     |

The agent edits the Canvas file directly with `Edit`. Each change cites the
delta section in the commit message (`folds delta:<slug> §ADDED into Canvas R`).

### 2. Move the delta folder to the archive

```bash
mkdir -p .ai/deltas/archive
git mv .ai/deltas/<YYYY-MM-DD>-<slug>/ .ai/deltas/archive/<YYYY-MM-DD>-<slug>/
```

The folder is kept (not deleted) so the change history remains greppable.

### 3. Record the outcome in STATE.md

Append one line to the **Active Decisions** section *only if the delta changed
a public contract or established a new convention*:

```markdown
- **YYYY-MM-DD — <one-line decision>:** <reason>. See `.ai/deltas/archive/<...>`.
```

For purely additive deltas with no decision-shaping, skip this step — STATE
must not become a diary.

### 4. Final gate

Commit the Canvas amendment + the `git mv` in a single commit:

```
chore(spec): archive delta <slug>; fold into Canvas <feature>
```

Then ask the user: *"Archive complete. Canvas is in sync with main. Any
follow-up delta or shall we close this thread?"*

## Validation

- [ ] `.ai/deltas/<YYYY-MM-DD>-<slug>/` no longer exists at the top level
- [ ] `.ai/deltas/archive/<YYYY-MM-DD>-<slug>/` contains the original files
- [ ] Canvas reflects all ADDED / MODIFIED / REMOVED items
- [ ] No file outside the delta folder, the Canvas, and (optionally) STATE.md
      was touched by the archive operation
