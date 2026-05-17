---
name: project-review
description: Project-aware review skill — validates that a change serves the project
  purpose before evaluating technical quality. Use before merging a PR, after AI generates
  a feature, or when a change needs sign-off on security, architecture, and best practices.
  Trigger terms: PR review, code review, merge, security, architecture, best practices,
  checklist, purpose drift, safeguards.
---

# Project Review

Review with dual awareness: purpose fidelity first, then technical quality. A change
can be technically clean and still be wrong if it drifts from the project's stated purpose.

## When to Use

- Before merging a PR or requesting human review
- After AI generates a feature from a Canvas
- When evaluating security, architecture, or best-practice compliance

## Review Priority Order

1. **Project purpose** — does the change serve what the project resolves?
2. **Architecture** — respects defined layers and registered architectural decisions?
3. **Security** — inputs sanitized, auth enforced, sensitive data protected?
4. **Best practices** — naming, duplication, magic numbers, error handling?
5. **Coverage** — Canvas Safeguards backed by at least one test?

## Two Modes

**Purpose Mode** — load context before evaluating the diff:
1. Read `INSTRUCTIONS.md` → extract purpose and design principles
2. Read `STATE.md` → check active decisions and blockers
3. Read the feature Canvas → use Safeguards as mandatory acceptance criteria

**Quality Mode** — apply after purpose is confirmed:
- Run the Technical Checklist from `references/CHECKLIST.md`
- Report each finding with: dimension · finding · severity · expected action

## Integration

- Complements `iterative-review` (not a replacement): `iterative-review` runs during
  code generation; `project-review` runs before merge.
- Add to PR description: "project-review checklist confirmed before requesting human review".

## Final Validation

- [ ] Purpose check passed — change aligns with INSTRUCTIONS.md + STATE.md
- [ ] No Canvas Safeguard violated
- [ ] No blocker-level finding in security or architecture
- [ ] Report delivered with severity labels (blocker / warning / suggestion)

## References

- [GUIDE.md](references/GUIDE.md) — operational protocol and output format
- [CHECKLIST.md](references/CHECKLIST.md) — instantiable checklist per PR/feature
