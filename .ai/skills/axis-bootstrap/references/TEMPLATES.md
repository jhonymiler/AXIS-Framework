# Templates

All copy-paste templates used by the bootstrap. Each has a linkable anchor (e.g., `#skillmd-index`) referenced from other phases.

---

## INSTRUCTIONS.md

```markdown
# <Project Name>

## Purpose

<1-2 sentences describing what the project does, for whom, and why.>

## Stack / Tools

- **Language:** <e.g., TypeScript 5.4>
- **Framework:** <e.g., NestJS 10>
- **Database:** <e.g., PostgreSQL 16 + TypeORM>
- **Infra:** <e.g., Docker, AWS ECS>
- **Test:** <e.g., Jest, Supertest>

## How to Run

```bash
<exact command to start local environment>
<exact command to run tests>
<exact command to build>
```

## Architecture

| Component  | Responsibility   | Technology    | Location       |
| ---------- | ---------------- | ------------- | -------------- |
| <e.g. API> | <e.g. HTTP REST> | <e.g. NestJS> | <e.g. src/api> |

Details: [docs/architecture.md](docs/architecture.md)

## Design Principles

- **<Principle 1>:** <short rationale>
- **<Principle 2>:** <short rationale>

## Conventions

Summary here; details in [.ai/rules/](rules/):

- Naming: <rule>
- Error handling: <rule>
- Tests: <rule>

## Available Skills

| Skill                                  | When to use   |
| -------------------------------------- | ------------- |
| [<skill-1>](skills/<skill-1>/SKILL.md) | <when to use> |
| [<skill-2>](skills/<skill-2>/SKILL.md) | <when to use> |

## Links

- [Architecture](docs/architecture.md)
- [Database Schema](docs/database-schema.md)
- [State](docs/STATE.md)
- [Conventions](CONVENTIONS.md)
```

**Target size:** 100-180 lines after real content is filled in.

---

## SKILL.md (index)

```markdown
---
name: skill-name
description: <2-4 lines>. Use when implementing X, debugging Y,
  or understanding Z of the domain. Mention specific domain terms that act
  as triggers: term1, term2, term3.
---

# Skill Title

<Purpose in 1-2 sentences.>

## When to Use

- <Specific scenario 1>
- <Specific scenario 2>
- <Specific scenario 3>

## Quick Summary

| Item | Value | Notes |
| ---- | ----- | ----- |
| ...  | ...   | ...   |

## References

- [GUIDE.md](references/GUIDE.md) — step-by-step operational guide
- [REFERENCE.md](references/REFERENCE.md) — tables and reference data
- [PROMPT-TEMPLATE.md](references/PROMPT-TEMPLATE.md) — output contract (if generates artifacts)
- [TROUBLESHOOTING.md](references/TROUBLESHOOTING.md) — common errors (optional)

## Final Validation

Before finishing work using this skill:

- [ ] <domain-specific gate 1>
- [ ] <domain-specific gate 2>
```

**Target size:** 40-60 lines.

---

## Code Rule

```markdown
---
applyTo: "**/*.{ext}"
paths:
  - "src/**"
---

# <Rule Name>

## <Section 1>

- <Concise guideline with context (why do it this way)>
- <Concise guideline with context>

## <Section 2>

- <Concise guideline>
```

---

## STATE.md

```markdown
# Project State

## Active Decisions
<!-- [YYYY-MM-DD] Decision X made because Y -->

## In Progress
<!-- Feature Z: 70% complete, missing integration with API X -->

## Blockers
<!-- API X returning 429 in staging — awaiting vendor response -->

## Deferred Ideas
<!-- Migrate to gRPC — evaluate when volume exceeds 10k req/min -->

## Lessons Learned
<!-- Bulk insert with TypeORM: use createQueryBuilder instead of save() for >100 records -->

## Pending TODOs
- [ ]

---

## Handoff Protocol

At the end of any session with relevant changes, update this file with:
- What was done
- What remains
- Any context that would otherwise be lost

At the start of a session, read this file **before** anything else.
```

---

## CONVENTIONS.md

```markdown
# Conventions

## Single Source of Truth

All content lives in `.ai/`. IDE-specific folders contain symlinks only.

## Symlink Map

```text
CLAUDE.md     → .ai/INSTRUCTIONS.md
AGENTS.md     → .ai/INSTRUCTIONS.md
.claude/      → ../.ai/{rules,skills,INSTRUCTIONS.md}
.cursor/      → ../.ai/{rules,skills}
.agents/      → ../.ai/{rules,skills}
.github/      → ../.ai/{rules,skills,INSTRUCTIONS.md}
```

To add a new IDE: edit `setup-ide-links.sh` (3-4 lines) and run it.

## Templates

- **New skill:** copy `<skill>/SKILL.md` from any existing skill as a base
- **New rule:** copy the format from `code-style.md`

## Agent Rules

- Never duplicate content between IDEs
- Always create files inside `.ai/`
- Keep `SKILL.md` ≤ 60 lines
- Keep `INSTRUCTIONS.md` between 100-180 lines
- Update `STATE.md` at the end of sessions with changes

## Knowledge Verification Chain

Before asserting:
1. Codebase
2. Project docs
3. MCP/Context7 (official docs)
4. Web search
5. Mark as uncertain — never fabricate

## Maintenance

| Event                       | Action                         |
| --------------------------- | ------------------------------ |
| Code changes a skill's flow | Update the corresponding skill |
| Session paused              | Update STATE.md                |
| New integration             | Evaluate new skill             |
```

---

## settings.json

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Bash(git *)",
      "Bash(<build-tool> *)",
      "Edit(/src/**)",
      "Edit(/test/**)",
      "Edit(/.ai/**)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)"
    ],
    "ask": [
      "Bash(git push *)",
      "Edit(/.env*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/format-file.sh \"$CLAUDE_TOOL_INPUT_FILE_PATH\""
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/validate-bash.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/run-tests-if-changed.sh"
          }
        ]
      }
    ]
  }
}
```

Replace `<build-tool>` with:

| Stack       | Command                                           |
| ----------- | ------------------------------------------------- |
| Node.js     | `Bash(npm *)`, `Bash(npx *)`                      |
| Python      | `Bash(pip *)`, `Bash(pytest *)`, `Bash(poetry *)` |
| Go          | `Bash(go *)`                                      |
| Java/Maven  | `Bash(mvn *)`                                     |
| Java/Gradle | `Bash(gradle *)`, `Bash(./gradlew *)`             |
| Ruby        | `Bash(bundle *)`, `Bash(rake *)`                  |
| PHP         | `Bash(composer *)`                                |
| Rust        | `Bash(cargo *)`                                   |
| .NET        | `Bash(dotnet *)`                                  |

---

## format-file.sh

```bash
#!/bin/bash
# scripts/format-file.sh
# Formats the file passed as argument. Stack-aware via case.
# Never fails — missing formatter does not block the agent.

FILE="$1"
[ -z "$FILE" ] && exit 0

case "$FILE" in
  *.ts|*.js|*.json|*.css)  npx prettier --write "$FILE" 2>/dev/null ;;
  *.py)                     black "$FILE" 2>/dev/null ;;
  *.go)                     gofmt -w "$FILE" 2>/dev/null ;;
  *.java)                   google-java-format --replace "$FILE" 2>/dev/null ;;
  *.rb)                     rubocop --auto-correct "$FILE" 2>/dev/null ;;
  *.php)                    php-cs-fixer fix "$FILE" 2>/dev/null ;;
  *.rs)                     rustfmt "$FILE" 2>/dev/null ;;
esac
exit 0
```

---

## validate-bash.sh

```bash
#!/bin/bash
# scripts/validate-bash.sh
# Blocks destructive patterns. Universal — install in any project.

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null)

# Patterns never allowed without explicit confirmation
if echo "$CMD" | grep -qE '(rm -rf /|DROP TABLE|TRUNCATE |DELETE FROM [^W])'; then
  echo '{"action": "deny", "reason": "Potentially destructive command. Run manually if intentional."}'
  exit 0
fi

echo '{"action": "allow"}'
```

---

## run-tests-if-changed.sh

```bash
#!/bin/bash
# scripts/run-tests-if-changed.sh
# Detects changed code extensions and runs the corresponding tests.

CHANGED=$(git diff --name-only HEAD 2>/dev/null)
[ -z "$CHANGED" ] && exit 0

if echo "$CHANGED" | grep -qE '\.(ts|js)$';      then npm test -- --passWithNoTests 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.py$';            then pytest --tb=short -q 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.go$';            then go test ./... 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.java$';          then mvn test -q 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.rb$';            then bundle exec rspec --format progress 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.(cs|csproj)$';   then dotnet test --nologo 2>&1 | tail -10; fi
exit 0
```

---

## setup-ide-links.sh

```bash
#!/bin/bash
# Idempotent — can run as many times as needed without error.
set -e

# Root
ln -sf .ai/INSTRUCTIONS.md CLAUDE.md
ln -sf .ai/INSTRUCTIONS.md AGENTS.md

# Claude Code
mkdir -p .claude
ln -sf ../.ai/INSTRUCTIONS.md .claude/CLAUDE.md
ln -sf ../.ai/rules .claude/rules
ln -sf ../.ai/skills .claude/skills

# Cursor
mkdir -p .cursor
ln -sf ../.ai/rules .cursor/rules
ln -sf ../.ai/skills .cursor/skills

# Windsurf / Generic Agents
mkdir -p .agents
ln -sf ../.ai/rules .agents/rules
ln -sf ../.ai/skills .agents/skills

# GitHub Copilot
mkdir -p .github
ln -sf ../.ai/INSTRUCTIONS.md .github/copilot-instructions.md
ln -sf ../.ai/rules .github/instructions
ln -sf ../.ai/skills .github/skills

echo "Symlinks created/updated successfully."
```

**Comment/remove** the sections for IDEs not used by the team, to reduce noise in `git status`.

---

## architecture.md (stub)

```markdown
# System Architecture

## Overview

<ASCII or Mermaid diagram showing components and connections.>

## Components

| Component | Responsibility | Technology | Location |
| --------- | -------------- | ---------- | -------- |
| ...       | ...            | ...        | ...      |

## Key Architectural Decisions

- **Why <technology>:** <rationale>
- **Why <pattern>:** <rationale>

## Constraints and Trade-offs

- **<Constraint>:** <consequence and mitigation>
```

---

## database-schema.md (stub)

```markdown
# Database Schema

## Table: <name>

| Column | Type | Nullable | Description  |
| ------ | ---- | -------- | ------------ |
| id     | UUID | N        | Generated PK |
| ...    | ...  | ...      | ...          |

**Indexes:** `idx_xxx` (col1, col2) — used in <query>
**Constraints:** `uq_xxx` (col) — ensures <invariant>

**Business rules:**
- <rule 1>
- <rule 2>
```
