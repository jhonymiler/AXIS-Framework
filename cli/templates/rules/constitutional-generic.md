# Constitutional Rules — Generic / Cross-Stack

> Always-on. Four language-agnostic gates that any Write/Edit on this codebase
> must satisfy. Used when the project is non-software (docs, ops, content) or
> when the detected stack does not match a more specific constitutional file.
> The `constitutional-check.sh` hook prints these reminders before every mutation.

## Article I — Spec Before Artifact

Every non-trivial deliverable (≥2 files, or any externally-visible change) has
a Canvas (REASONSTC) or an equivalent written spec **before** the artifact is
produced. "Trivial" means: typo, single-line correction, internal note.

**Gate:** PRs with diffs > 50 lines outside `docs/journal/` must reference a
canvas path in the description.

## Article II — Minimum Viable Change

The diff contains only what the request asked for. No drive-by edits, no
formatting churn in unrelated regions, no speculative refactors.

**Gate:** `git diff --stat` shows changes confined to the files named in the
canvas's S₁ (System structure) section.

## Article III — No Secrets In Repo

API keys, tokens, passwords, internal URLs, and PII never appear in any
committed file. Secrets live in environment variables or a secrets manager
referenced by name.

**Gate:** pre-commit scan via `git diff --cached | grep -iE "(api[_-]?key|secret|token|password|bearer)\s*[:=]"`
returns 0 lines that aren't placeholders (`<...>`, `XXX`, `your-…-here`).

## Article IV — Traceability

Every committed change links to a reason: an Issue/ticket ID, a canvas path,
or a STATE.md decision. "Refactor", "cleanup", and "fix" alone are not reasons.

**Gate:** commit messages match `^(feat|fix|docs|chore|refactor|test)(\(.+\))?: .+`
and the body or subject names the originating Canvas / Issue / decision.

---

**On violation:** the hook prints the article + the failing gate. The agent
must either fix the violation or open a PR comment explicitly accepting the
breach with reasoning.
