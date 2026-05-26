# STATE — AXIS Framework Playbook

## Continuity Structure
- **Hot:** Active Decisions, In Progress, Blockers (auto-loaded at session start, ≤80 lines)
- **Warm:** Deferred Ideas, Lessons Learned, TODOs (loaded on demand)
- **Cold:** historical archives in `.ai/docs/archive/STATE-YYYY-MM.md` (never loaded by default)

## Active Decisions

- **2026-05-26 — Core architecture renamed:** the three pillars are now **Spec + Harness + Continuity** (previously "Memory"). Reason: avoids vector-store/embedding expectations; aligns name with reality. See `FRAMEWORK.md` and PR #sprint1-F2.1.
- **2026-05-26 — AXIS is one-shot:** the CLI scaffolds, the agent (Opus 4.7+) does discovery and content authoring, then AXIS exits. No daemon, no scheduled syncing. Re-applying a new AXIS version is a future `axis-rebootstrap` skill (Sprint 4 / F4C). See `README.md` "How AXIS Actually Works".
- **2026-05-26 — Defensive `--preset`:** the non-interactive path is now greenfield-only; collisions abort with explicit options (`--backup` / `--force` / `--dry-run`). See PR #sprint1-F1.
- **2026-05-26 — SPDD subcommands consolidated:** 5 print-only subcommands collapsed into `axis spdd guide [step]`; legacy names work as aliases. See PR #sprint1-F2.3.
- **Sub-agent two-tier pattern (planned):** Phase 1 dispatches 5 generic Discoverers in parallel; Phase 4.5 transforms them into 3-4 project-bound Specialists with embedded knowledge. To be implemented in Sprint 2-3 (F8). See memory `axis_subagent_pattern.md`.
- **Skill routing matrix:** `INSTRUCTIONS.md` defines when to load or avoid each skill. Always-on rules: engineering-discipline, context-economy, knowledge-verification, session-start.
- **Quality gates enforced by harness:** `validate-axis.sh` checks file sizes + live⇄CLI sync + symlink integrity. `axis dedupe` + `axis spdd verify` run during PR review.
- **Release-driven CLI publishing:** npm publishing only via GitHub Releases (`cli-vX.Y.Z`).
- **Recursiveness is mandatory:** the repository itself must obey every framework rule.

## In Progress

- **Sprint 2 — F3 + F4A + F8A/B** (meta-skill strengthening, `axis hooks install`, `axis doctor` expanded, 5 Discoverer subagents + Phase 1 parallel orchestration)

## Blockers

_(none)_

## Deferred Ideas

- Advanced telemetry consumer (Sprint 4 / F5.3)
- Bilingual README synchronization check
- Monorepo/polyglot `.ai/packages/<name>/` (F7.1)
- Multi-IDE hooks abstraction (F7.2)

## Lessons Learned

- **Squash-merge sibling PRs in dependency order.** Rename-first reduces conflicts later (READMEs auto-merged because the layer name change had already landed).
- **Working-tree leakage between branches is common.** `git checkout -- .` to discard before switching saves debugging time.
- **Templates intentionally diverge from live spec.** `sync-cli-templates.sh` mirrors only `.ai/skills/`, `.ai/rules/`, `.ai/hooks/` — top-level templates (`STATE.md`, `INSTRUCTIONS.md`) are parametrized stubs for new projects.
- **Test-evaluation files inside the project being evaluated belong outside the repo.** `/projetos/IA/memorias/cortex/AXIS_EVALUATION.md` is consulted as source but never committed here.

## TODOs

- Run a fresh `axis init --preset python` smoke test on temp dir after Sprint 4 to confirm end-to-end
- Document `axis-rebootstrap` skill in `FRAMEWORK.md` once Sprint 4 lands
- Tag `cli-v2.0.0` after final validation; ensure release notes mention the breaking rename
