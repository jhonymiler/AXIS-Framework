# Phase 1 — Discovery

**Goal:** understand the project deeply enough to generate a correct spec in Phase 2 without needing to go back.

**Typical duration:** 5-15 minutes of interview.

**Output of this phase:** a mental *Project Profile* (or text draft) covering type, tools, domains, constraints, quality target, and IDEs.

---

## Principle: Read Before Asking

Before the first question, the agent:

1. Lists the target project files (up to 2 levels deep)
2. Reads `README.md`, `package.json`/`pyproject.toml`/equivalent, and any pre-existing AI file (`CLAUDE.md`, `AGENTS.md`)
3. Identifies the stack if possible
4. **Only then asks** — and never asks what is already in the files

This reduces friction and demonstrates attention to context.

---

## Block 1 — Universal Questions (always ask)

```text
1. In one sentence: what does this project do and for whom?
2. Is it a software project, or another type (content, research, business, legal, educational)?
3. How many people will work on it and for how long?
4. Which agents/IDEs will be used? (Claude Code, Cursor, Windsurf, Copilot, others)
5. Are there critical constraints? (compliance, deadline, budget, security)
```

Confirm the answers in a summary before advancing to Block 2.

---

## Block 2 — Branching by Type

Use the answer to question 2 to choose the sub-block below. May apply more than one if the project is hybrid (e.g., research + content).

### If SOFTWARE

```text
6a. What is the main stack? (language, framework, runtime)
7a. How does the project run? (exact command — npm run dev, python main.py, go run, etc.)
8a. Is there a database, queue, cache, or external services?
9a. Is there an adopted architecture pattern? (DI, hexagonal, monolith, microservices, MVC, etc.)
10a. Are there tests? What framework? Coverage of what?
11a. Is there CI/CD? Where? (GitHub Actions, GitLab CI, etc.)
12a. Which 3-5 areas/modules of the code have specific rules that deserve to become a skill?
```

### If CONTENT (articles, marketing, technical docs)

```text
6b. What is the format and distribution channel? (blog, LinkedIn, newsletter, book, video script)
7b. Tone of voice and target audience?
8b. Is there an established SEO, branding, or style guideline?
9b. What is the workflow? (briefing → draft → review → publish)
10b. Which skills would help? (e.g., "tone of voice", "article structure", "SEO checklist", "fact-checking")
```

### If RESEARCH / ACADEMIC

```text
6c. What is the discipline and central research question?
7c. What methodology? (qualitative, quantitative, experimental, review)
8c. What artifacts will be produced? (paper, dataset, analysis code, slides)
9c. What conventions/norms? (APA, MLA, Chicago; citation format)
10c. Which skills? (e.g., "methodology", "data collection", "statistical analysis", "academic writing")
```

### If BUSINESS / MANAGEMENT

```text
6d. What is the goal? (strategic planning, OKRs, reports, market analysis)
7d. What are the expected artifacts? (deck, report, spreadsheet, BSC)
8d. Who are the stakeholders and what is their technical level?
9d. Are there adopted frameworks? (OKR, BSC, lean canvas, SWOT)
10d. Which skills? (e.g., "executive report structure", "SWOT analysis", "tone for board")
```

### If LEGAL / COMPLIANCE

```text
6e. What jurisdiction and area? (labor, tax, GDPR/LGPD, contractual)
7e. What artifacts? (contracts, legal opinions, DPIA, policies)
8e. Are there official templates to follow?
9e. What critical risks to avoid?
10e. Which skills? (e.g., "contract drafting", "clause analysis", "compliance checklist")
```

### If EDUCATIONAL

```text
6f. What is the target audience and level?
7f. What artifacts? (course, lesson plan, instructional material, assessment)
8f. Is there a pedagogical methodology? (PBL, Bloom, flipped classroom)
9f. Which skills? (e.g., "instructional design", "assessment design", "language for level X")
```

### If OTHER

Apply principles from [UNIVERSAL-MAP.md](UNIVERSAL-MAP.md) and adapt. Ultimately, every activity has:

- Knowledge domains (→ skills)
- Quality standards (→ rules)
- Final artifacts (→ templates)
- Continuity between sessions (→ memory)

---

## Block 3 — Quality Calibration

```text
13. Is this a proof-of-concept, MVP, or production?
14. What level of validation is acceptable? (vibe-check, human review, automated gates, all)
15. Is there a history of problems the framework should prevent? (e.g., "we lose context whenever the dev changes", "AI responses diverge between IDEs")
```
