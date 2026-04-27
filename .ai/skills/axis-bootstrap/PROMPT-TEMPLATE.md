# Prompt Template — Output Contract

This is the **contract** of what a successful bootstrap delivers. Use as reference when generating and as the basis for validation in Phase 5.

---

## Expected Final Structure

```text
target-project/
├── .ai/                                           ← SINGLE SOURCE
│   ├── INSTRUCTIONS.md                            (100-180 lines)
│   ├── CONVENTIONS.md                             (map + rules)
│   ├── skills/
│   │   ├── <skill-1>/SKILL.md                     (40-60 lines)
│   │   ├── <skill-2>/SKILL.md
│   │   └── ...                                    (3-7 skills)
│   ├── rules/                                     (3-7 rules — if applicable)
│   │   ├── code-style.md
│   │   ├── architecture-patterns.md
│   │   └── ...
│   └── docs/
│       ├── architecture.md                        (if software)
│       ├── database-schema.md                     (if software)
│       ├── glossary.md                            (if specialized domain)
        └── STATE.md
│
├── CLAUDE.md           → .ai/INSTRUCTIONS.md
├── AGENTS.md           → .ai/INSTRUCTIONS.md
│
├── .claude/                                       (if Claude Code declared)
│   ├── CLAUDE.md       → ../.ai/INSTRUCTIONS.md
│   ├── rules           → ../.ai/rules
│   ├── skills          → ../.ai/skills
│   └── settings.json                              (versioned)
│
├── .cursor/, .agents/, .github/                   (per declared IDEs)
│
├── scripts/                                       (if software)
│   ├── format-file.sh
│   ├── validate-bash.sh
│   └── run-tests-if-changed.sh
│
└── setup-ide-links.sh                             (idempotent)
```

---

## Minimum Content per File

### `.ai/INSTRUCTIONS.md`

Order (consultation frequency, not logical importance):

1. What the project does (1-2 sentences)
2. Stack or tools (with versions)
3. How to run / how to start
4. Architecture in table (components + responsibility)
5. Design principles (3-7 bullets with rationale)
6. Code conventions (summary — details in rules)
7. Available skills (table with when to use)
8. Links to docs and references

**Size:** 100-180 lines. Below 100 is superficial; above 200 loses focus.

### `.ai/skills/<skill>/SKILL.md`

```markdown
---
name: <skill-name>
description: <2-4 lines mentioning domain terms that act as triggers>
---

# Skill Title

<Purpose in 1-2 sentences.>

## When to Use
- <Scenario 1>
- <Scenario 2>
- <Scenario 3>

## Quick Summary
<Dense table or bullets>

## References
- [GUIDE.md](references/GUIDE.md) — <purpose>
- [REFERENCE.md](references/REFERENCE.md) — <purpose>
```

**Size:** 40-60 lines. Description: 2-4 lines, written in third person, with trigger terms.

### `.ai/CONVENTIONS.md`

- Symlink map
- Rules for the agent (where to create files, what never to do)
- Knowledge Verification Chain
- How to add new IDE (3-4 lines of `ln -s`)
- Templates pointer (link to TEMPLATES.md or local copy)

---

## Handoff to User

```markdown
## Bootstrap Complete

### What was created
- N files in .ai/
- N skills initialized: <list>
- N rules: <list>
- N stubs in docs/
- Memory layer with STATE, CONVENTIONS
- N symlinks distributing to <IDEs>
- N hooks in settings.json

### Metrics
- INSTRUCTIONS.md: N lines (target 100-180) ✓
- SKILL.md average: N lines (target 40-60) ✓
- Symlinks: all resolve ✓
- Smoke tests: pass ✓

### Suggested next steps (3-5)
1. Detail the first priority skill — populate references/GUIDE.md in <skill>
2. Validate settings.json with the team
3. Configure CI to verify symlink resolution
4. Test invocation by another IDE (multi-tool smoke test)
```
