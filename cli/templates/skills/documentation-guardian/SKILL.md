---
name: documentation-guardian
description: Detects and repairs drift between code structure and .ai/ documentation. Load when code files were added/removed, when a module was renamed, when INSTRUCTIONS.md feels stale, or when a new skill hasn't been created for a domain that clearly warrants one. Trigger terms: doc drift, stale docs, sync docs, documentation out of date, skill missing, INSTRUCTIONS outdated.
---

# Documentation Guardian

Detects and repairs drift between code structure and the `.ai/` documentation layer. Zero dependency on `axis` CLI — operates by reading the codebase and `.ai/` files, then instructing edits.

## When to Load

- A module was added, removed, or renamed since the last bootstrap
- INSTRUCTIONS.md mentions a module/skill/endpoint that no longer exists
- Code has been added for a new domain but no skill file covers it
- A specialist agent's embedded table (`{{KNOWLEDGE_TABLE}}`) feels stale
- Rule says `applyTo: src/**` but the `src/` path moved

## Drift Detection Protocol

### Step 1 — Module inventory

Run the check script (if present) or perform manually:

```bash
bash scripts/check-doc-drift.sh  # if installed
```

If not installed, execute:
```bash
find src/ -type d -maxdepth 2 | sort        # module list
grep -n '|' .ai/INSTRUCTIONS.md | head -40  # table of modules in docs
```

Compare: every directory in `src/` must appear in the INSTRUCTIONS module table, and vice versa.

### Step 2 — Skill coverage

For each module in `src/` that has domain logic (not just infrastructure):
- Is there a `.ai/skills/<domain>/SKILL.md`?
- If no: flag it — candidate for `skill-emergence.md` rule to surface.

### Step 3 — Specialist staleness

For each specialist agent in `.claude/agents/`:
- Open it and read `{{EXTRACTED_AT}}` date.
- Check if any files in the specialist's domain were modified after that date (`git log --since="<date>" -- src/<domain>/`).
- If yes: flag the specialist as stale → trigger re-extraction via the matching discoverer.

### Step 4 — Rule `applyTo` paths

For each rule in `.ai/rules/`:
- Read its `applyTo` frontmatter glob.
- Verify the glob resolves to at least one existing file (`find <glob> -maxdepth 0 2>/dev/null`).
- Dead `applyTo` globs are advisory warnings, not failures.

## Repair Actions (after detection)

| Drift type | Repair action |
| ---------- | ------------- |
| Module in `src/`, missing from INSTRUCTIONS table | Add row to INSTRUCTIONS module table |
| Module in INSTRUCTIONS table, removed from `src/` | Remove the row; check if a skill references it |
| Skill references a file path that no longer exists | Update the path or remove the reference |
| Specialist stale | Re-run the matching discoverer → paste new `{{KNOWLEDGE_TABLE}}` → update `{{EXTRACTED_AT}}` |
| Rule `applyTo` glob resolves to nothing | Update glob or remove the rule if no longer needed |
| Domain without skill coverage | Propose creation; use `abstraction-first` if the domain has >2 responsibilities |

## When to Escalate to Discoverers

Re-run a discoverer (not just update a table row) when:
- The domain was substantially rewritten, not just a file added
- The specialist flagged >3 stale rows in a single session
- A new developer on the team says the embedded knowledge "doesn't match what I see"

Reference discoverers: [agents/discoverers/](../agents/discoverers/)

## References

- [references/CHECKS.md](references/CHECKS.md) — machine-readable checklist for `check-doc-drift.sh`
