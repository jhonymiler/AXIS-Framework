---
name: copilot-review
description: GitHub Copilot Code Review protocol for the AXIS-Framework repo itself.
  Use when reviewing PRs against AXIS-Framework via Copilot, when maintaining the
  .github/copilot-instructions.md + .ai/instructions/ configuration, or when an
  agent needs to mirror Copilot's enforcement criteria. Repo-scoped — not
  propagated to projects bootstrapped by AXIS. Trigger terms: copilot, code review,
  PR review, purpose check, axis review, copilot-instructions.
---

# Copilot Review — AXIS-specific

GitHub Copilot Code Review configuration for this repo only. Defines what Copilot reads, what to accept/reject, and how AXIS's own recursiveness contract constrains review.

## Scope

- Applies to PRs against the AXIS-Framework repository on GitHub.
- **Not** propagated to projects bootstrapped by AXIS — those configure their own review per their domain (covered by `axis-bootstrap` Phase 3).
- For non-Copilot agents (Claude, Cursor) reviewing AXIS PRs, the same protocol applies via `.ai/INSTRUCTIONS.md` and the path-targeted files in `.ai/instructions/`.

## Where Copilot reads from

- `.github/copilot-instructions.md` → symlink to `.ai/INSTRUCTIONS.md`. Copilot Code Review reads only the first ~4000 chars; keep the project purpose visible above that line.
- `.github/instructions/` → symlink to `.ai/instructions/`. Files there must end in `.instructions.md` and carry an `applyTo:` frontmatter glob.

## What Copilot must enforce

1. **Purpose fidelity** — AXIS is about `.md` documentation for AI agents. Reject features unrelated to that mission.
2. **Security** — see `.ai/instructions/scripts-security.instructions.md` for shell/Actions/secret rules.
3. **Recursiveness** — see `.ai/instructions/spec-changes.instructions.md`. `bash scripts/validate-axis.sh` must pass.
4. **Sync** — CLI-distributable skills (`axis-bootstrap` + 4 satellites in `scripts/sync-cli-templates.sh`) must stay byte-identical to `cli/templates/`. Repo-only skills (like this one) are exempt — they are not propagated to bootstrapped projects.
5. **Complexity** — prefer the smaller change. Reject premature abstraction.

## How to trigger Copilot review

- **Manual:** in any PR, add `Copilot` as reviewer.
- **Automatic:** repo Settings → Rules → Rulesets → New branch ruleset targeting `main` → enable "Request pull request review from Copilot".

## Maintenance

- Each `*.instructions.md` file in `.ai/instructions/` MUST stay under 4000 chars (Copilot Code Review hard limit). Validate with `wc -c .ai/instructions/*.instructions.md`.
- `.ai/INSTRUCTIONS.md` first 4000 chars must include the project purpose so Copilot sees it on every PR. Do not bury it past the truncation point.
- When the AXIS spec evolves (new gate, new skill, new artifact format), update the relevant `.ai/instructions/*.instructions.md` to reflect it.

## References

- [.ai/instructions/spec-changes.instructions.md](../../instructions/spec-changes.instructions.md) — applies to `.ai/**` and `cli/templates/**`
- [.ai/instructions/scripts-security.instructions.md](../../instructions/scripts-security.instructions.md) — applies to `scripts/**` and `.github/workflows/**`
- [.github/copilot-instructions.md](../../../.github/copilot-instructions.md) — repo-wide protocol Copilot reads (symlink to INSTRUCTIONS.md)
