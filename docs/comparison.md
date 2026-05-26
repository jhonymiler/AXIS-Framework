# Honest Comparison — AXIS vs Spec Kit / OpenSpec / BMAD

> This document is a self-aware audit. Every "AXIS does X" claim is
> verifiable in this repo; every "Y does Z" claim was extracted by reading
> Y's own docs. Compiled 2026-05-26 against:
> - GitHub Spec Kit `spec-driven.md` (412 lines)
> - OpenSpec `docs/concepts.md` (765 lines)
> - BMAD-METHOD `docs/explanation/project-context.md` + `party-mode.md`

## At-a-glance

| Capability                                | AXIS | Spec Kit | OpenSpec | BMAD |
| ----------------------------------------- | :--: | :------: | :------: | :--: |
| Single-page spec artifact                 |  ✅  |    ❌     |    ❌    |  ❌  |
| Multi-file rich spec artifacts            |  ⚠️*  |    ✅     |    ✅    |  ✅  |
| Brownfield delta workflow                 |  ✅  |    ❌     |    ✅    |  ⚠️  |
| Constitutional rules per stack            |  ✅  |    ✅     |    ❌    |  ⚠️  |
| Platform harness (settings + hooks)       |  ✅  |    ❌     |    ❌    |  ❌  |
| Adversarial sub-agents (debate)           |  ✅  |    ❌     |    ❌    |  ✅  |
| Multi-IDE via single-source symlinks      |  ✅  |    ⚠️     |    ⚠️    |  ⚠️  |
| Curated continuity playbook (STATE)       |  ✅  |    ⚠️     |    ⚠️    |  ⚠️  |
| Failure attribution (plan/exec/response)  |  ✅  |    ❌     |    ❌    |  ❌  |
| Custom workflow schema                    |  ⚠️  |    ❌     |    ✅    |  ⚠️  |
| Public site / video tutorials             |  ❌  |    ✅     |    ⚠️    |  ✅  |
| GitHub stars (rough community signal)     |  —   |   106k    |   51k    |  48k |

✅ first-class · ⚠️ partial · ❌ absent
*AXIS Canvas REASONSTC has 9 dimensions per page; rich artifacts live as
references but the single-page discipline is the default.

## Where AXIS leads

**Harness as platform.** AXIS configures `.claude/settings.json` with
permissions (`allow` / `deny` / `ask`) and `PreToolUse` / `PostToolUse`
hooks before it even thinks about prompts. The model cannot bypass an
`ask` permission or a hook — the runtime enforces them. Spec Kit, OpenSpec,
and BMAD live entirely in prompts and conventions; their rules are
honour-system.

**Multi-IDE single source of truth.** A `setup-ide-links.sh` script
symlinks `.ai/INSTRUCTIONS.md` into `CLAUDE.md`, `AGENTS.md`, `.cursor/`,
and any future IDE folder. There is **one** file the team maintains; every
IDE reads the same bytes. Competitors duplicate per IDE or expect users to
copy by hand.

**Curated continuity.** `STATE.md` has explicit tiers (hot / warm / cold)
with size budgets (hot ≤ 80 lines). The agent reads only the hot tier at
session start. Decisions, lessons, and TODOs are curated, not accumulated.
This solves the "STATE-as-diary" failure mode that plagues append-only
memory systems.

**Failure attribution.** When something goes wrong, AXIS asks: was it a
*planning* failure (Canvas was wrong), an *execution* failure (code
deviated from Canvas), or a *response* failure (Canvas + code right, but
the post-hoc explanation misled)? Each has a different fix path. Other
frameworks lack this taxonomy and conflate all three into "the AI got
confused".

## Where AXIS reached parity (2026-05-26)

| Feature   | Closed gap vs                          | Now in AXIS                                       |
| --------- | -------------------------------------- | ------------------------------------------------- |
| F9        | OpenSpec delta specs                   | `axis-delta` skill: ADDED/MODIFIED/REMOVED + archive |
| F10       | Spec Kit's 9 articles                  | 4 constitutional files (node/python/go/generic), each with 5 grep-verifiable gates + PreToolUse hook |
| F11       | Spec Kit data-model.md + contracts/    | Canvas grew to REASONSTC (9 dims): T = G/W/T tests, C = typed interfaces with pre/post |
| F12       | Spec Kit `/speckit.specify`            | `axis-specify` skill (folder + canvas + branch)   |
| F13       | BMAD party-mode                        | Phase 1.8 with 3 challengers (security/simplicity/scope), parallel + structured critique |
| F14       | OpenSpec schema flexibility            | `axis.config.json` read by the agent              |

All as **skills**, not CLI commands — the "AXIS is one-shot" architectural
promise stays intact: after bootstrap, projects have **zero runtime
dependency** on the `axis` binary.

## Where AXIS still trails

**F15 — public site and tutorials.** Spec Kit and BMAD have polished
landing pages, video walkthroughs, and contributor pipelines. AXIS has
this `docs/` folder plus the README. Community discovery is weaker. The
gap is being closed with the docs you are reading now; a GitHub Pages
site is the next step.

**Stars / mindshare.** The competitors have 48k–106k stars. AXIS is far
younger. This is a time and outreach gap, not a technical one.

## What we deliberately did *not* copy

**A CLI for every action.** Spec Kit exposes commands like
`/speckit.specify` and `/speckit.plan`. AXIS rejected this pattern after
analysis: every CLI command in the bootstrapped project becomes a
permanent runtime dependency on the `axis` package. Instead, AXIS skills
are self-contained — the agent runs the pipeline via Read/Write/Bash/git,
reading the installed `SKILL.md`. Bootstrap installs the skill once; the
project keeps no version coupling.

**A daemon or background sync.** Some frameworks run background processes
to sync state. AXIS's `SessionStart` hook reads STATE.md once per session
and exits; there is no resident process. Lower complexity, lower failure
surface.

**Mandatory multi-page spec per feature.** Spec Kit's data-model.md +
plan.md + research.md per feature creates many files for small changes.
AXIS keeps the **single-page Canvas** as the default; rich content lives
in references that the agent consults on demand. The "single page or
re-decompose the feature" rule (Spec Kit issue #75) is enforced.

## When *not* to choose AXIS

- **You need a one-click hosted experience with a vendor SLA** —
  open-source self-hosted toolkits (AXIS included) are not that.
- **Your team has zero appetite for spec discipline** — AXIS's value
  comes from the discipline; without buy-in, you get extra files for no
  payoff. (Same critique applies to Spec Kit and OpenSpec.)
- **You only ever do single-file edits** — AXIS is overkill. Use git
  and conventional commits.

## Recommended pairings

- **AXIS + Claude Code** — first-class fit (hooks, settings, agents,
  symlinks all designed for this combination).
- **AXIS + Cursor** — supported (rules symlinks). Sub-agents and hooks
  are Claude-Code-specific today.
- **AXIS + other agents** — works through the `AGENTS.md` symlink; you
  lose the harness layer until that IDE supports settings/hooks.

## How to verify these claims

Every claim about AXIS in this document is backed by a file in this repo
(linked from `INSTRUCTIONS.md` or `FRAMEWORK.md`). Claims about competitors
were extracted from their public docs; re-read those docs and challenge
specific lines if you disagree. PRs that correct an unfair comparison are
welcome.
