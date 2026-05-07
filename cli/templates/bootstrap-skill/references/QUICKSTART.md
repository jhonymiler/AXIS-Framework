# QUICKSTART — AXIS in 5 Minutes

> For the full bootstrap (5 phases, 30 min), use the `axis-bootstrap` skill. This document is the fast path for those who want something working today and full structure later.

---

## What you'll have at the end

- Contextual `INSTRUCTIONS.md` (not monolithic)
- `settings.json` with destructive command blocking
- Active multi-IDE symlinks
- `STATE.md` with initial playbook
- Base to expand to full bootstrap

**Estimated time:** 5-10 minutes of interaction + 5 minutes of execution.

---

## Step 1 — Project identity (2 min)

Answer mentally or paste the answers to the agent:

1. **What does the project do?** (1 sentence)
2. **Main stack/tools?** (or "non-technical" if content/research)
3. **Which IDE(s) do you use?** (Claude Code / Cursor / Windsurf / Copilot — mark all)
4. **Is there anything the agent should NEVER do?** (e.g., push directly to main, delete production data)

---

## Step 2 — Minimal `INSTRUCTIONS.md` (2 min)

Create `.ai/INSTRUCTIONS.md` with this minimal structure (adapt):

```markdown
# [Project Name]

[1-2 sentences about what the project does]

## Stack
- [main technology]
- [other relevant ones]

## How to run
[start command]

## Critical rules
- Never [restriction 1 from previous step]
- Always confirm before [destructive action]
```

> Limit: 50-80 lines for quick start. Expand to 100-180 in full bootstrap.

---

## Step 3 — Minimal `settings.json` (1 min)

Create `.claude/settings.json` (or equivalent for your IDE):

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Bash(git status)",
      "Bash(git log *)",
      "Bash(git diff *)",
      "Edit(/.ai/**)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Bash(DROP *)",
      "Bash(truncate *)"
    ],
    "ask": [
      "Bash(git push *)",
      "Edit(/.env*)"
    ]
  }
}
```

**Add to git immediately:** `git add .claude/settings.json && git commit -m "chore: add axis harness settings"`

---

## Step 4 — Multi-IDE symlinks (1 min)

Run in terminal:

```bash
# At project root
ln -sf .ai/INSTRUCTIONS.md CLAUDE.md
ln -sf .ai/INSTRUCTIONS.md AGENTS.md
mkdir -p .claude && ln -sf ../.ai/skills .claude/skills
mkdir -p .cursor && ln -sf ../.ai/skills .cursor/skills
mkdir -p .agents && ln -sf ../.ai/skills .agents/skills
mkdir -p .github && ln -sf ../.ai/INSTRUCTIONS.md .github/copilot-instructions.md
mkdir -p .github && ln -sf ../.ai/skills .github/skills
```

Verify: `ls -la CLAUDE.md AGENTS.md .claude/skills`

---

## Step 5 — Initial `STATE.md` (1 min)

Create `.ai/docs/STATE.md`:

```markdown
# Project State

## In Progress
<!-- What is being done now -->

## Blockers
<!-- Nothing at the moment -->

## Active Decisions
<!-- [date] Adopted AXIS Framework -->

## Lessons Learned
<!-- Empty — to fill throughout the project -->

---

## Handoff Protocol

At the end of sessions with relevant changes, update this file.
At the start of a session, read this file before anything else.
**Actively curate** — remove what is resolved.
```

---

## Next Steps

When you have 30 minutes: run the full bootstrap to create domain skills, automation hooks, and CONVENTIONS.md.

```text
Use the axis-bootstrap skill to complete the structure of this project.
```

The agent will detect the existing INSTRUCTIONS.md, skip Phase 1 (discovery already done), and complete the missing layers.
