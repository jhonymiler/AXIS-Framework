---
name: axis-specify
type: process
description: Scaffolds a new greenfield feature — creates the spec folder, an
  empty REASONSTC Canvas pre-populated with the feature name, a tasks skeleton,
  and (when in a git repo) a feature branch. Inspired by GitHub Spec Kit's
  `/speckit.specify` but implemented as a skill, not a CLI command, so the
  bootstrapped project keeps zero `axis <command>` runtime dependency.
  For brownfield changes, hands off to `axis-delta` after detection.
  Trigger terms: new feature, specify, kick off feature, scaffold spec,
  create canvas, start a new story.
---

# axis-specify — Greenfield Feature Scaffolding

Sets up the workspace for a single new feature so the SPDD pipeline
(`story-decompose` → `alignment` → `abstraction-first` → generate →
`iterative-review`) has a place to land.

## When to use

- User says "new feature: X" or "let's spec out X"
- No prior Canvas exists under `.ai/specs/` for this feature
- The change is greenfield — touches code that does not yet exist

## When NOT to use

- Existing system change → load `axis-delta` instead (brownfield path)
- Single-file bugfix or doc tweak → no spec needed
- The feature already has a folder under `.ai/specs/<slug>/` — append, don't recreate

## Pipeline (agent executes)

1. **Sanitise the name** → slug (lowercase, hyphens, no special chars).
   Reject names that already collide with a folder in `.ai/specs/` — abort
   with a clear message; do not silently merge.
2. **Brownfield check** — if user description names an existing module,
   touches a published contract, or affects ≥2 existing files, hand off to
   `axis-delta` and stop.
3. **(Optional) Create branch** — when inside a git repo, run
   `git checkout -b feat/<slug>` unless the user says otherwise or the
   workflow is trunk-based.
4. **Create the spec folder** — see `references/SPEC-FOLDER-LAYOUT.md` for
   the exact layout the agent produces.
5. **Write `canvas.md`** — copy the REASONSTC template from
   `.ai/skills/axis-bootstrap/references/CANVAS-REASONS.md`, replace the
   placeholder title with the feature name. Leave all nine dimensions empty.
6. **Write `tasks.md`** — skeleton with `## Tasks` heading and a note that
   items should be populated after the Canvas is filled.
7. **Stage** — `git add .ai/specs/<slug>/`
8. **Report next step** — point the user at the Canvas and suggest loading
   `story-decompose` to fill the R dimension first.

## Validation gates

- [ ] `.ai/specs/<slug>/` exists with both `canvas.md` and `tasks.md`
- [ ] Slug is lowercase, hyphen-separated, ≤ 48 chars, no leading hyphen
- [ ] Canvas title contains the feature name (humanised from slug)
- [ ] No file outside the new folder was modified (S₁ scope discipline)
- [ ] **Zero `axis <subcommand>` references in the produced artifacts**
