# Project Review — Checklist

Instantiate this file per PR or feature review. Fill in the project-specific section at the top, then use the universal technical checklist as-is.

---

## Part 1 — Purpose Section (instantiate per project)

> Copy the two fields below from the project's `INSTRUCTIONS.md` and `STATE.md` before starting the review.

**Project central purpose:**
> _Paste 1-2 sentences from INSTRUCTIONS.md describing what the project solves and for whom._

**Active architectural decisions to watch:**
> _List the active decisions from STATE.md that are most likely to be violated by a typical change (e.g., "Harness before prompts", "Single Source of Truth via symlinks")._

---

## Part 2 — Purpose Checklist

- [ ] Change solves a problem explicitly stated in the project's central purpose
- [ ] Change respects all design principles listed in INSTRUCTIONS.md
- [ ] Change does not contradict any active decision in STATE.md
- [ ] Diff is confined to files/components listed in the Canvas Structure (or no Canvas and <3 components touched)
- [ ] Change implements or visibly advances at least one defined Acceptance Criterion

---

## Part 3 — Technical Checklist

### Architecture

- [ ] Changes to business logic touch only the domain/service layer — no logic leaking into controllers, routes, or UI components
- [ ] No new layer dependency that reverses the defined dependency direction (e.g., domain importing from infrastructure)
- [ ] No direct cross-module coupling that bypasses declared interfaces or contracts
- [ ] New components follow the naming and location conventions established in INSTRUCTIONS.md

### Security

- [ ] External input is never interpolated directly into queries, shell commands, or file paths — parameterized calls only
- [ ] Authentication and authorization checks are applied before any data access or mutation
- [ ] Sensitive data (tokens, passwords, PII) is never logged, returned in responses, or stored in plain text
- [ ] Dependencies added in this change have no known high/critical CVEs (verified against advisory DB)
- [ ] Error messages do not expose internal paths, stack traces, or implementation details to external callers

### Best Practices

- [ ] No magic numbers — every non-obvious literal has a named constant with a comment explaining its origin
- [ ] No duplicated logic — extracted into a shared function or module if the same block appears more than once
- [ ] Error paths are handled explicitly — no silent failures or empty catch blocks
- [ ] Function and variable names are intention-revealing — a reader unfamiliar with the codebase understands the purpose
- [ ] No TODO or FIXME comments introduced without a linked issue

### Test Coverage

- [ ] Every Canvas Safeguard (S₂) has at least one test covering the failure scenario
- [ ] Every Acceptance Criterion (R section) has at least one test covering the happy path
- [ ] Boundary conditions (null, empty, max value) are tested for each numeric or string input
- [ ] No existing test was deleted or weakened without an explicit explanation in the PR description

### Observability

- [ ] Every external call (HTTP, DB, queue, filesystem) logs the operation name and response status
- [ ] Errors that reach the service boundary are logged with enough context to reproduce the issue (no bare exception rethrows)
- [ ] New flows that can fail silently have a metric, alert, or structured log entry to surface the failure

---

## Part 4 — Canvas Safeguards (instantiate per feature)

> Copy the Safeguards (S₂ section) from the feature's REASONS Canvas. Each becomes a mandatory acceptance criterion for this review.

| # | Safeguard | Verified by test? | Status |
|---|-----------|-------------------|--------|
| 1 | _paste safeguard_ | test name or N/A | ✅ / ❌ |
| 2 | | | |

If no Canvas exists for this feature, mark this section N/A and record it as a **warning** in the report.

---

## Part 5 — Review Sign-off

| Reviewer | Date | Verdict | Notes |
|----------|------|---------|-------|
| | | APPROVED / BLOCKED / CONDITIONS | |

**Blockers resolved before merge:**
- [ ] All blocker-severity findings addressed or explicitly accepted by author + reviewer
- [ ] PURPOSE CHECK passed (Part 2 fully checked)
- [ ] No Canvas Safeguard left uncovered
