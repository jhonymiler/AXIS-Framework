---
applyTo: ".ai/**,cli/templates/**,scripts/validate-axis.sh,scripts/sync-cli-templates.sh"
---

# Spec & template changes — review focus

These instructions apply when the PR touches the framework's spec layer or its CLI-distributable mirror.

## Recursiveness contract

This repo follows the AXIS framework it teaches. Size gates from `scripts/validate-axis.sh` are non-negotiable:

- `.ai/INSTRUCTIONS.md`: 100-180 lines.
- Each `.ai/skills/*/SKILL.md`: ≤ 60 lines.

Reject the PR if `bash scripts/validate-axis.sh` would fail. Always require the PR description to include validator output when spec is touched.

## Live ⇄ CLI template sync (CLI-distributable skills only)

`.ai/skills/axis-bootstrap/` is the live spec. `cli/templates/bootstrap-skill/` is its distributable copy. They MUST be byte-identical.

Each **CLI-distributable** satellite skill at `.ai/skills/<name>/SKILL.md` must equal `cli/templates/skills/<name>.md`. The canonical list is the for-loop in `scripts/sync-cli-templates.sh`.

**Repo-only skills** (those NOT in the sync for-loop — e.g., `copilot-review`) are exempt from this mirror. They are specific to AXIS-Framework's own infrastructure and would be noise in bootstrapped projects.

Reject a CLI-distributable skill PR that edits only one side. Fix: `bash scripts/sync-cli-templates.sh`.

## New skill checklist

Skills fall in two scopes; registration rules differ.

**CLI-distributable** (propagated by `axis init` — currently: `axis-bootstrap`, `abstraction-first`, `alignment`, `iterative-review`, `story-decompose`):

- `SKILL.md` ≤ 60 lines with proper frontmatter (`name:`, `description:` 2-4 lines, third-person, with trigger terms).
- Optionally `references/` subfolder.
- Registered in `scripts/sync-cli-templates.sh` (for-loop) AND `scripts/validate-axis.sh` (drift check).
- Listed in the skill table in `.ai/INSTRUCTIONS.md`.
- Mirrored in `cli/templates/skills/<name>.md` (or `cli/templates/bootstrap-skill/` for the bootstrap skill).

**Repo-only** (specific to AXIS infrastructure, useless in bootstrapped projects — e.g., `copilot-review`):

- `SKILL.md` ≤ 60 lines; `description:` must include "repo-only" or "not propagated" so the scope is unambiguous.
- Listed in the skill table in `.ai/INSTRUCTIONS.md` with an AXIS-specific label.
- **NOT** in `scripts/sync-cli-templates.sh` or `scripts/validate-axis.sh` sync loops.

Reject a PR that:

- Adds a CLI-distributable skill missing any required item.
- Adds a repo-only skill that creeps into the sync scripts (it would silently start being copied to user projects).
- Adds a skill whose scope (CLI-distributable vs repo-only) is unclear from its description.

## STATE.md curation

STATE.md should grow slowly. Each new Active Decision needs a date and a reason — not a list of files touched. Lessons must capture non-obvious insights, not changelog entries. Resolved blockers must be removed, not "kept for history".

Reject STATE entries that read as `git log` output.

## Templates and patterns

- New artifact formats (REASONS Canvas variants, settings.json shapes, rule frontmatter) must be added to `references/TEMPLATES.md` first, then referenced from the phase that uses them.
- Discovery questions added to `references/PHASE-1-DISCOVERY.md` must have downstream propagation: PHASE-2-SPEC (which artifact captures the answer), TEMPLATES (template for the artifact), PHASE-5-VALIDATION (how to verify).

## What to reject in spec PRs

- Adding non-doc runtime code (servers, UIs, schedulers, workers).
- Inventing new artifact formats without updating `references/TEMPLATES.md`.
- Removing the symlink approach in favor of file duplication across IDEs.
- Skipping phase gates in `axis-bootstrap` PLANNER.
- Introducing a new skill whose scenario overlaps with an existing one (see `references/PHASE-2-SPEC.md` granularity rules — expand existing when same usage scenario).
