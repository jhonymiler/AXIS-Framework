# Migrating from a Monolithic CLAUDE.md to AXIS

> Practical guide for projects that already have an AI-instructions file
> (`CLAUDE.md`, `AGENTS.md`, or similar) and want the structure AXIS
> provides without losing the project knowledge already captured.

## Why migrate

The single-file approach scales poorly past ~300 lines:

- The whole file loads on every turn, even when irrelevant
- Project-specific decisions get tangled with cross-cutting rules
- Skill behaviour cannot be invoked on demand — every instruction is always-on
- No machine-checkable structure → silent drift between docs and code

AXIS separates concerns into three layers: **Spec** (skills + rules),
**Harness** (settings + hooks), **Continuity** (curated playbook). The
monolithic file decomposes naturally into these layers.

## The four-phase migration

### Phase 1 — Inventory the existing file

Read your current `CLAUDE.md` / `AGENTS.md` and tag every paragraph:

| Tag         | What it is                                              | Future home in AXIS                   |
| ----------- | ------------------------------------------------------- | ------------------------------------- |
| `RULE`      | Cross-cutting, always-on (e.g. "always use TS strict")  | `.ai/rules/<name>.md`                 |
| `SKILL`     | A workflow with triggers ("when designing, do X")       | `.ai/skills/<name>/SKILL.md`          |
| `DECISION`  | Why something was done (`prefer Y over Z because …`)   | `.ai/docs/STATE.md` Active Decisions  |
| `CONVENTION`| Naming, structure, branch naming                        | `.ai/CONVENTIONS.md`                  |
| `WORKFLOW`  | Permissions / commit policy                             | `.ai/rules/workflow.md` + settings.json |
| `STACK`     | Tooling, languages, frameworks                          | `INSTRUCTIONS.md` Stack section       |
| `DROP`      | Out-of-date / never followed / contradicted by code     | delete                                |

The bulk of the work is in this inventory step. Do not skip it.

### Phase 2 — Bootstrap with the right preset

```bash
# Pick the preset closest to your stack
npx @axis-framework/cli init --preset node --backup
```

`--backup` preserves the existing `CLAUDE.md` as `CLAUDE.md.axis-bak-<timestamp>`
so you can diff against it during migration. **Do not** use `--force` until
you have completed Phase 1.

### Phase 3 — Move content into the new structure

For each tagged paragraph, copy it to its new home:

- **RULE** → create or edit `.ai/rules/<name>.md`. Match the existing always-on
  rules' shape (heading + bullet list + "How It's Working" footer).
- **SKILL** → create `.ai/skills/<name>/SKILL.md` with frontmatter
  (`name`, `description`, `trigger` terms) and a ≤60-line body. Register in
  the `INSTRUCTIONS.md` skill table.
- **DECISION** → append a line under STATE.md `Active Decisions` with the
  date and the reason. Convert past tense to declarative.
- **CONVENTION** → append to `CONVENTIONS.md` under the relevant heading.
- **WORKFLOW** → mostly fits in `.ai/rules/workflow.md`; permission lists go
  to `.claude/settings.json` (allow/deny/ask arrays).
- **STACK** → goes in the `## Stack / Tools` section of `INSTRUCTIONS.md`.

After this phase, run the validator:

```bash
bash scripts/validate-axis.sh
```

It enforces line caps (`INSTRUCTIONS.md` 100–180, each `SKILL.md` ≤ 60) so
you cannot accidentally re-create the monolith.

### Phase 4 — Smoke-test and replace

Replace `CLAUDE.md` with a symlink to `.ai/INSTRUCTIONS.md`
(`setup-ide-links.sh` does this for you). Run a fresh agent session and
ask the agent to summarise the project. Compare with the pre-migration
summary. Differences point to content that did not survive the move —
fix and rerun.

When the summaries match (or the new one is better-organised), delete
the backup file and commit.

## Common gotchas

- **Skills overflow.** If a `SKILL.md` exceeds 60 lines, the validator
  fails. Split it into `SKILL.md` + a reference under `references/`.
- **Decision history.** Resist appending every old decision to STATE —
  it must stay ≤ 80 lines. Old context lives in git log; STATE is the
  curated playbook.
- **Rules and skills overlap.** The test is: *Does it apply to every
  request?* → rule. *Does the agent need to opt in based on the request?*
  → skill.
- **CLAUDE-specific syntax.** If your old file used Claude-only markers
  (e.g. tool-permission hints), move them to `.claude/settings.json`,
  not `INSTRUCTIONS.md`. INSTRUCTIONS is IDE-agnostic.

## After migration

You unlock:

- Multi-IDE single source of truth (`AGENTS.md`, `CLAUDE.md`, `.cursor/`
  all symlink to `.ai/INSTRUCTIONS.md`)
- Progressive disclosure — only the loaded skill is in context, not the
  whole file
- Session-start protocol — agent reads only the STATE hot tier (~20 lines)
- Quality gates that prevent re-monolithisation
- Constitutional reminders before every Write/Edit (per-stack)
- Phase-1.8 challengers that critique your spec before code is written

## Reverting

The migration is non-destructive: all original content remained either in
the new structure, in the backup file, or in git history. To revert, delete
`.ai/` and `.claude/`, restore the backup, and remove the symlinks. No
runtime dependency to uninstall — AXIS scaffolds once and exits.
