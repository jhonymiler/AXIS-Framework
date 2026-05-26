# Delta Spec Template

> Format for `.ai/deltas/<YYYY-MM-DD>-<slug>/delta-spec.md`. Loaded by the
> `axis-delta` skill at pipeline step 4. The three sections are mandatory; any
> empty section keeps its header with a `_(none)_` placeholder so future readers
> can tell "considered and skipped" from "forgotten".

---

# Delta Spec — <feature-slug>

> Companion: `proposal.md` (why), `impact.md` (risks), `tasks.md` (work).
> Original spec: [link to .ai/specs/<feature>/canvas.md or archived delta]

## ADDED

> New behaviours that did not exist before. Each item is a stand-alone capability,
> not an implementation detail. Format: capability — evidence — AC link.

- **<New capability>** — observable as `<concrete user-visible behaviour>`
  - Evidence: `<command / API call / UI flow>` produces `<result>`
  - Maps to AC: <Canvas R section, AC# in the active or extended Canvas>

- _(repeat per added capability — or write `_(none)_` if nothing added)_

## MODIFIED

> Behaviours that exist today but change. Each item must name the prior behaviour,
> the new behaviour, AND the reason. "Refactor" is not a reason.

- **<Capability X>**
  - **Before:** `<current behaviour with concrete numbers / shape>`
  - **After:**  `<new behaviour with concrete numbers / shape>`
  - **Reason:** `<why — links to ticket / decision in STATE.md>`
  - **Migration:** `<what callers must do, or "transparent">`

- _(repeat per modified capability — or write `_(none)_`)_

## REMOVED

> Behaviours that no longer exist after this change. Every removal carries an
> `impact:` line naming the downstream blast radius.

- **<Capability Y removed>**
  - **Impact:** `<which callers / clients / docs break; deprecation window if any>`
  - **Replacement:** `<what to use instead — or "none, contact <owner>">`

- _(repeat per removed capability — or write `_(none)_`)_

---

## How this aligns with the Canvas

After this delta is implemented and the PR merges, the agent runs the
**archive procedure** (`ARCHIVE-PROCEDURE.md`) which folds each section back
into the authoritative Canvas:

| Delta section | Canvas operation                                                |
| ------------- | --------------------------------------------------------------- |
| ADDED         | Append items to R (ACs) + adjust E / S₁ / C / O / T as needed   |
| MODIFIED      | Replace the affected lines in the corresponding Canvas section  |
| REMOVED       | Delete the lines from the Canvas; record loss in STATE Lessons  |
