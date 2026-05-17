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

## Live ⇄ CLI template sync

`.ai/skills/axis-bootstrap/` is the live spec. `cli/templates/bootstrap-skill/` is its distributable copy. They MUST be byte-identical.

Similarly, each satellite skill at `.ai/skills/<name>/SKILL.md` must equal `cli/templates/skills/<name>.md`.

Reject if a PR edits only one side. Fix: `bash scripts/sync-cli-templates.sh`. Then commit the mirrored file.

## New skill checklist

A new skill under `.ai/skills/<name>/` must:

- Have `SKILL.md` ≤ 60 lines with frontmatter `name:` and `description:` (2-4 lines, third person, listing trigger terms).
- Optionally have a `references/` subfolder with operational guide / checklist / templates.
- Be registered in `scripts/sync-cli-templates.sh` (added to the for-loop) and `scripts/validate-axis.sh` (added to the drift check).
- Appear in the skill table in `.ai/INSTRUCTIONS.md`.

Reject if any of these are missing.

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
