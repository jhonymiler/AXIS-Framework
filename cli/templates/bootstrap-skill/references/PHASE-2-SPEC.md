# Phase 2 — Spec Layer Generation

**Goal:** generate the project's single source of knowledge (`.ai/`).

**Input:** Project Profile validated in Phase 1.

**Output:** `.ai/` structure populated with `INSTRUCTIONS.md`, skill skeletons, initial rules, and doc stubs.

---

## Generation Order (do not reverse)

```text
1. Create folder structure
2. Generate INSTRUCTIONS.md
3. Generate skill skeletons (one per identified domain)
4. Generate initial rules
5. Generate doc stubs
6. Present to user and validate
```

---

## Step 1 — Folder Structure

```bash
mkdir -p .ai/{skills,rules,docs,docs/stories}
```

For non-technical projects, still create the structure — `rules/` can be used for "protocols", `docs/` for domain references. Homogeneity simplifies maintenance.

---

## Step 2 — INSTRUCTIONS.md

Use the template from [TEMPLATES.md → INSTRUCTIONS.md](TEMPLATES.md#instructionsmd).

**Section order (consultation frequency, not logical importance):**

1. **Purpose** (1-2 sentences — what it does, for whom, why)
2. **Stack or Tools** (with relevant versions)
3. **How to Run / How to Start** (exact commands or first steps)
4. **Architecture** (table: component → responsibility → technology → location)
5. **Design Principles** (3-7 bullets with short rationale)
6. **Conventions** (summary — details in rules)
7. **Workflow & Tools** (task tracker, branch model, commit/PR standards — details in `rules/workflow.md`). Skip only if Phase 1 Block 4 was fully skipped.
8. **Available Skills** (table: skill → when to use)
9. **Links** (to detailed docs)

**Target size:** 100-180 lines. Below 100 is superficial; above 200 loses focus.

**Critical insight — describe decisions, not just facts:**

```markdown
# Bad
- ORM: TypeORM

# Good
- ORM: TypeORM with Repository pattern — never access `Repository<T>` directly in services,
  encapsulate in `*Repository` classes to make mocking in tests easier
```

The second form saves a question to the dev and prevents out-of-pattern code.

**For non-technical projects**, replace:

- "Stack" → "Tools and platforms"
- "How to run" → "How to start / workflow"
- "Architecture" → "Project components"
- "Code conventions" → "Quality standards"

---

## Step 3 — Skill Skeletons

For each domain identified in Phase 1, create:

```text
.ai/skills/<name>/
└── SKILL.md         (40-60 lines, without references/ yet)
```

Use template [SKILL.md in TEMPLATES.md](TEMPLATES.md#skillmd-index).

**The frontmatter `description` is the most critical element** — determines whether the skill will be loaded. Checklist:

- [ ] 2-4 lines (1 line is vague, 5+ is excessive)
- [ ] In third person ("Use when implementing...")
- [ ] Mentions domain terms that act as triggers
- [ ] Lists 3-5 usage scenarios
- [ ] A new dev would understand when to use the skill just by reading the description

```yaml
# Weak
description: Reference for the payments API integration.

# Strong
description: Complete reference for the Payments API integration.
  Use when implementing API calls (endpoints, auth, payload format),
  debugging API responses (error codes, rate limits),
  or understanding the retry strategy and idempotency rules.
```

**Do not populate references/ yet.** This phase delivers the index. References are filled in subsequent sessions as knowledge accumulates.

### Granularity — when to create new skill vs expand existing

**Create new when:**
- Domain has >5 specific concepts
- Has its own workflow
- Usage scenario is distinct

**Expand existing when:**
- Information is complementary
- SKILL.md still <60 lines after addition
- Same usage scenario

**Use `docs/` instead of skill when:**
- It is pure reference documentation (schema, contracts)
- Does not involve workflow
- Will be referenced by multiple skills

---

## Step 4 — Initial Rules

For software projects, create 3-7 rules in `.ai/rules/`. Use template [Rule in TEMPLATES.md](TEMPLATES.md#code-rule).

**Recommended default structure:**

```text
.ai/rules/
├── code-style.md            (naming, formatting, imports)
├── architecture-patterns.md (DI, modules, framework patterns)
├── database.md              (ORM, migrations, queries)
├── testing.md               (test structure, mocks)
├── cli.md                   (commands and scripts)
└── workflow.md              (PM tool, branch model, commit & PR standards — populated from Phase 1 Block 4)
```

**`workflow.md`** is created whenever Phase 1 Block 4 produced answers (PM tool, commit convention, branch model, PR rules, task/release standards). Even non-software projects that use git benefit from it — keep only the sections that apply. Template in [TEMPLATES.md → workflow.md](TEMPLATES.md#workflowmd-rule).

**Frontmatter for scope:**

```yaml
---
applyTo: "**/*.{ext}"
paths:
  - "src/**"
---
```

**How to write an effective rule:**

```markdown
# Bad — too generic
- Use meaningful variable names
- Keep functions small

# Good — specific and actionable
- Use constants or enums for all fixed domain values (e.g., `Status`, `Origin`)
  — never use string literals like `'pending'` scattered in the code
- Batch operations: prefer native ORM/DB bulk inserts/updates — never loops
  (impact of N+1 queries on large tables is exponential)
```

**Three elements of an effective rule:** what to do, how to do it, and why (when not obvious).

**For non-technical projects**, replace rules with **protocols** (same structure, without `applyTo`):

```text
.ai/rules/  (or .ai/protocols/)
├── tone-of-voice.md
├── article-structure.md
├── review-checklist.md
└── citation-standards.md
```

---

## Step 5 — Doc Stubs

Create files with headers and empty sections, ready for future population.

### For software

```text
.ai/docs/
├── architecture.md          (system overview + decisions)
├── database-schema.md       (tables + business rules + indexes)
├── api-contracts.md         (internal and external contracts)
├── data-flows.md            (optional — for non-obvious flows)
└── monitoring.md            (optional — observability)
```

`architecture.md` should include a **Key Architectural Decisions** section with format:

```markdown
- **Why <decision>:** <short rationale>
```

`database-schema.md` should include **business rules** alongside the schema (not elsewhere):

```markdown
**Business rules:**
- `deleted_at IS NULL` in all queries (soft delete)
- `retry_count` incremented on each failed attempt, max 3
```

### For specialized domains (non-software)

```text
.ai/docs/
├── glossary.md              (domain terms with specific meaning)
├── workflows.md             (work flows)
└── references.md            (external links, official sources)
```

---

## Step 6 — Validation and Gate

Present to user:

```markdown
## Spec Layer Generated

### Structure
.ai/INSTRUCTIONS.md (N lines)
.ai/skills/<skill1>/SKILL.md (N lines)
.ai/skills/<skill2>/SKILL.md (N lines)
...
.ai/rules/<rule1>.md
.ai/docs/architecture.md (stub)
...

### Total
- N skills initialized
- N rules created
- N doc stubs

### Question
Any critical domain I missed? Any file that doesn't make sense for this project?
Any name to adjust?
```

**Wait for confirmation before Phase 3.**

---

## Quality Principles

- **Density > length** — every line must carry useful information
- **Decisions > facts** — explain the "why", not just the "what"
