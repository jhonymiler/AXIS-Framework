# Universal Map — Technical ↔ Non-Technical

The framework was originally designed for software projects, but its three layers (Spec, Harness, Memory) are **domain-agnostic**. This document maps technical concepts to universal equivalents, enabling application to any type of project.

---

## Translation Principle

| Layer       | Universality   | What changes                                                       |
| ----------- | -------------- | ------------------------------------------------------------------ |
| **Spec**    | 100% universal | Only vocabulary (rules → protocols)                                |
| **Harness** | ~70% universal | Lint/test hooks do not apply; permissions and blocks do            |
| **Memory**  | 100% universal | Identical — STATE, CONVENTIONS work the same                       |

The layer that varies most is the **Harness**, and even there the core (behavior versioning, destructive blocking, sub-agents) remains intact.

---

## Concept-to-Concept Mapping

| Technical Concept         | Universal Equivalent                                    |
| ------------------------- | ------------------------------------------------------- |
| Technology stack          | Tools and platforms                                     |
| Programming language      | Output format (markdown, spreadsheet, deck)             |
| Framework                 | Methodology (PBL, BSC, OKR, ABNT)                       |
| Database                  | Data repository (spreadsheet, CMS, source library)      |
| External API              | Official source / stakeholder / vendor                  |
| Code rules                | Quality protocols                                       |
| Code style                | Tone of voice / formatting                              |
| Test suite                | Validation criteria                                     |
| CI/CD                     | Review / approval pipeline                              |
| Lint hook                 | Automated checklist                                     |
| Blocking hook             | Pre-publication validation                              |
| Branches/commits          | Versions / revisions                                    |
| PR review                 | Peer review                                             |
| Bug                       | Inconsistency / factual error                           |
| Refactoring               | Reorganization / clarification                          |
| Deploy                    | Publication / delivery                                  |
| Production                | Final environment / client                              |

---

## Application by Project Type

### Academic Research

```text
.ai/
├── INSTRUCTIONS.md          (research question, methodology, deadline)
├── skills/
│   ├── methodology/         (which method, why)
│   ├── data-collection/     (sources, how to access, how to process)
│   ├── analysis/            (techniques, formulas, software)
│   ├── academic-writing/    (structure, citations, tone)
│   └── review/              (validation checklist)
├── rules/  (renamed protocols/)
│   ├── citations-apa.md
│   ├── paper-structure.md
│   └── reproducibility.md
└── docs/
    ├── glossary.md          (domain technical terms)
    ├── sources.md           (annotated bibliography)
    ├── STATE.md             (methodological decisions, collected data, gaps)
```

**Applicable hooks:**
- ✅ Destructive blocking (universal)
- ✅ Citation validation before export
- ❌ Code linting (does not apply)

---

### Content / Marketing / Technical Docs

```text
.ai/
├── INSTRUCTIONS.md          (audience, channels, calendar)
├── skills/
│   ├── tone-of-voice/       (examples, words to avoid)
│   ├── article-structure/   (intro, body, closing; lengths)
│   ├── seo/                 (keywords, meta, structure)
│   ├── fact-checking/       (reliable sources, process)
│   └── editorial/           (review, approvals)
├── rules/
│   ├── style-guide.md       (capitalization, formatting, lists)
│   └── compliance.md        (GDPR, regulated claims, disclaimers)
└── docs/
    ├── glossary.md
    ├── personas.md
    ├── STATE.md             (editorial calendar, drafts, under review)
```

**Applicable hooks:**
- ✅ Destructive blocking
- ✅ Spell check / markdown lint
- ✅ Broken link validation
- ❌ Test runner (does not apply)

---

### Business / Management

```text
.ai/
├── INSTRUCTIONS.md          (objective, stakeholders, adopted frameworks)
├── skills/
│   ├── executive-report/    (structure, audience, level)
│   ├── swot-analysis/       (template, guiding questions)
│   ├── okrs/                (definition, tracking, review)
│   ├── presentation-deck/   (visual principles, narrative)
│   └── financial-analysis/  (P&L, indicators, projections)
├── rules/
│   ├── tone-for-board.md
│   └── confidentiality.md
└── docs/
    ├── glossary.md          (business terms)
    ├── stakeholders.md      (map, expectations)
    ├── STATE.md             (deals in progress, quarterly OKRs)
```

---

### Legal / Compliance

```text
.ai/
├── INSTRUCTIONS.md          (jurisdiction, areas, critical risks)
├── skills/
│   ├── contract-drafting/   (clauses, standards)
│   ├── clause-analysis/     (risks, ambiguities)
│   ├── gdpr-compliance/     (DPIA, legal basis, rights)
│   └── legal-opinions/      (structure, legal reasoning)
├── rules/
│   ├── legal-language.md
│   ├── case-law-citation.md
│   └── confidentiality.md   (critical rule for LLMs)
└── docs/
    ├── glossary.md
    ├── case-law.md          (relevant precedents)
    ├── STATE.md             (active cases, deadlines)
```

**Especially relevant hooks:**
- ✅ Block accidental disclosure of confidential information
- ✅ Legal citation validation before export

---

### Educational

```text
.ai/
├── INSTRUCTIONS.md          (audience, level, methodology, curriculum if K-12)
├── skills/
│   ├── instructional-design/ (Bloom, ADDIE, models)
│   ├── lesson-plan/          (structure, objectives, activities)
│   ├── assessment/           (questions, rubrics, validation)
│   └── language-level/       (adapt for age/knowledge)
├── rules/
│   ├── inclusion-accessibility.md
│   └── pedagogical-standard.md
└── docs/
    ├── student-personas.md
    └── STATE.md
```

---

## When NOT to Use the Framework

Regardless of type:

- **Disposable work** (1 day, no continuity) — overhead > gain
- **Solo + 1 tool + 1 session** — a monolithic `CLAUDE.md` is sufficient
- **No expectation of evolution** — memory and specs lose their purpose
- **Purely creative domain without standards** (e.g., free art) — constraints get in the way

**Use when:**
- 3+ people (humans or agents) share the work
- More than one IDE/tool is involved
- Domain has rules, norms, or standards that must be respected
- Continuity between sessions matters (weeks or months)
- There is real cost to inconsistency (compliance, brand, quality)

---

## Common Adaptations

### Folder substitutions

| Traditional                    | Universal alternative                              |
| ------------------------------ | -------------------------------------------------- |
| `.ai/rules/`                   | `.ai/protocols/`                                   |
| `.ai/docs/architecture.md`     | `.ai/docs/components.md`                           |
| `.ai/docs/database-schema.md`  | `.ai/docs/data-model.md` or `.ai/docs/sources.md`  |
| `setup-ide-links.sh`           | keep the name — still relevant                     |

### Hooks that always apply

- **Destructive command blocking** — universal
- **Versioning `settings.json`** in git — universal

### Domain-dependent hooks

- Lint/format → exists for markdown, spreadsheets (validators), CSS, JSON, YAML — adapt to the output format
- Test runner → exists as "output validator" for any artifact (link checker, schema validator, fact-checker)

---

## Final Principle

The **Spec** layer describes **what the domain is**.
The **Harness** layer ensures **consistent behavior** regardless of domain.
The **Memory** layer preserves **continuity** regardless of domain.

The three concepts do not depend on programming — they depend on any human activity with **structured knowledge**, **repeatable standards**, and **continuity over time**. The framework is universal because these three properties are universal.
