# Phase 3 — Harness Layer Configuration

**Goal:** install the behavioral infrastructure that makes the agent safe, consistent, and productive regardless of what the model "decides" in the moment.

**Input:** Spec Layer from Phase 2 validated + project type.

**Output:** versioned `settings.json`, configured hooks, declared sub-agents, distributed symlinks.

---

## Why the Harness Exists

The spec defines what the agent knows. **But production reliability depends more on the harness than on the model.** Without it:

- Inconsistent formatting accumulates in dirty diffs
- Destructive commands go through (`rm -rf`, `DROP TABLE`)
- Tests don't run at the end, regressions escape
- Each developer gets different AI behavior per machine

The harness eliminates each of these by construction, not by discipline.

---

## The Five Subsystems

| Subsystem                 | Function                             | Applicability                     |
| ------------------------- | ------------------------------------ | --------------------------------- |
| **Permission Harness**    | Versioned `settings.json`            | Universal                         |
| **Execution Harness**     | Hooks (Pre/Post/Stop)                | Software (with adaptations)       |
| **Orchestration Harness** | Sub-agents                           | Universal                         |
| **Context Harness**       | Token budget, Progressive Disclosure | Universal (already in Phase 2)    |
| **Verification Harness**  | Quality gates in skills              | Universal (already in Phase 2)    |

This phase implements the first three (the other two are already in the Phase 2 design).

---

## Step 1 — `settings.json`

Use the template in [TEMPLATES.md → settings.json](TEMPLATES.md#settingsjson). Adapt to the stack via table:

| Stack       | Replace `<build-tool>` with                       |
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

**Minimum structure:**

```json
{
  "permissions": {
    "allow": ["Read", "Bash(git *)", "<stack>", "Edit(/src/**)", "Edit(/.ai/**)"],
    "deny": ["Bash(rm -rf *)", "Bash(git push --force*)"],
    "ask": ["Bash(git push *)", "Edit(/.env*)"]
  }
}
```

**Universal (non-software):** keep `Read`, `Bash(git *)`, `Edit(/.ai/**)`, and adapt `Edit` to the project layout. Skip stack entries.

**Versioning in git** is mandatory. Without it, behavior varies per machine and bugs are hard to reproduce.

---

## Step 2 — Hooks

Hooks execute shell commands in response to agent events. **Three are indispensable** when applicable:

### Hook A — `PostToolUse` (automatic formatting)

**Applicable to:** software with a formatter.

```json
{
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
    ]
  }
}
```

Script `format-file.sh` in [TEMPLATES.md → format-file.sh](TEMPLATES.md#format-filesh). It is stack-aware via `case` and never fails (`exit 0`) — missing formatter does not block the agent.

**Why indispensable:** without it, diffs get polluted with style changes, increasing code review cost.

### Hook B — `PreToolUse` (destructive blocking)

**Applicable to:** universal. Always install.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "bash scripts/validate-bash.sh" }]
      }
    ]
  }
}
```

Script `validate-bash.sh` in [TEMPLATES.md → validate-bash.sh](TEMPLATES.md#validate-bashsh). Blocks patterns: `rm -rf /`, `DROP TABLE`, `TRUNCATE`, `DELETE FROM` without WHERE.

**Why indispensable:** the agent occasionally infers it needs to "clean up" files. Without protection, a context error is irreversible. Does not block normal work — only the dangerous cases.

### Hook C — `Stop` (tests on finish)

**Applicable to:** software with a test runner.

```json
{
  "hooks": {
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

Script `run-tests-if-changed.sh` in [TEMPLATES.md → run-tests-if-changed.sh](TEMPLATES.md#run-tests-if-changedsh). Detects changed extensions in the diff and runs only the applicable test runner.

**Why indispensable:** closes the feedback loop. The agent not only "does" — it validates what it did. Regressions are caught in the same session.

### For non-technical projects

- **Hook A:** skip (no formatter)
- **Hook B:** **keep** (universal protection)
- **Hook C:** skip or replace with output validation (e.g., spell check, markdown lint)

---

## Step 3 — Sub-agents

Sub-agents enable smart delegation. The main agent **orchestrates**, sub-agents **execute**.

### `Explore` (built-in, always enable)

- Read-only access: `Glob`, `Grep`, `Read`, `WebFetch`, `WebSearch`
- Cannot edit files during research
- More efficient: does not load unused write tools
- For large codebases, use level `"very thorough"`

### When to delegate vs execute

| Task                              | Delegate? | Why                                  |
| --------------------------------- | --------- | ------------------------------------ |
| Research / exploration            | **Yes**   | Bulky output; only the summary matters |
| Task implementation               | **Yes**   | File reads/edits consume context     |
| Independent parallel tasks        | **Yes**   | Only way to parallelize              |
| Sequential tasks without dependencies | **Yes** | Keeps main context clean            |
| Planning and task creation        | **No**    | Requires accumulated context         |
| Validation and final reports      | **No**    | Needs session history                |
| Quick fixes (≤3 files)            | **No**    | Overhead > task                      |

### Sub-agent contract

**Receives:**
- Task definition (what to do, where, completion criteria)
- Relevant rules and conventions
- Spec/design the task references

**Does not receive:**
- Definitions of other tasks
- Accumulated chat history
- `STATE.md` (unless recording a specific decision/blocker)

**Returns:**
- Status: Complete | Blocked | Partial
- Changed files
- Test/validation result
- Issues found

---

## Step 4 — Symlinks by IDE

For each IDE declared in Phase 1, create symlinks. Use the script [setup-ide-links.sh in TEMPLATES.md](TEMPLATES.md#setup-ide-linkssh).

**Principle:** the script is **idempotent** (`ln -sf` replaces without error). Can run as many times as needed.

**Target folder by IDE:**

| IDE            | Where it looks for context                                 |
| -------------- | ---------------------------------------------------------- |
| Claude Code    | `.claude/`, `CLAUDE.md`                                    |
| Cursor         | `.cursor/rules/`, `.cursor/skills/`, `AGENTS.md`           |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/instructions/` |
| Windsurf       | `AGENTS.md`, `.agents/`                                    |

**Skip** symlinks for IDEs the user declared not using — reduces noise in `git status`.

**Smoke test after creating:**

```bash
ls -la CLAUDE.md AGENTS.md .claude/ .cursor/ .agents/ .github/
```

Each symlink should show `→ ../.ai/...` or similar.

### Windows

Symlinks on Windows require administrator permission or Developer Mode enabled. If the team uses Windows:

- Document in `INSTRUCTIONS.md` or `CONVENTIONS.md`
- Recommend `core.symlinks = true` in Git for Windows
- Alternative: use `mklink /D` in elevated terminal

---

## Step 5 — Smoke Test and Gate

```bash
# 1. Verify settings.json
cat .claude/settings.json | jq .   # or cat if no jq

# 2. Verify symlinks resolve
ls -la CLAUDE.md AGENTS.md

# 3. Verify hooks execute (create dummy file and watch lint run)
echo "test" > /tmp/test.ts && bash scripts/format-file.sh /tmp/test.ts
```

Present to user:

```markdown
## Harness Layer Configured

### Permissions
- N entries in allow, N in deny, N in ask

### Hooks installed
- PostToolUse: format-file.sh (Node/Python/Go per stack)
- PreToolUse: validate-bash.sh (destructive protection — universal)
- Stop: run-tests-if-changed.sh

### Symlinks created
[visual tree]

### Smoke test
[output of the 3 commands above]

### Question
Any additional destructive patterns to block? Any missing IDE?
```

**Wait for confirmation before Phase 4.**

---

## Step 6 — Failure Attribution

> **Context:** ReliabilityBench (arxiv 2601.06112) demonstrated that pass@1 overestimates reliability by 20-40%. AgentProp-Bench (arxiv 2604.16706) showed that most benchmarks report only pass/fail, without locating where in the pipeline the failure occurred. AXIS instruments the harness for attribution.

**Configure structured logging in `settings.json`:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"{\\\"event\\\":\\\"pre\\\",\\\"tool\\\":\\\"$CLAUDE_TOOL_NAME\\\",\\\"ts\\\":\\\"$(date -Iseconds)\\\"}\" >> .ai/logs/harness.jsonl 2>/dev/null || true"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"{\\\"event\\\":\\\"post\\\",\\\"tool\\\":\\\"$CLAUDE_TOOL_NAME\\\",\\\"exit\\\":\\\"$CLAUDE_TOOL_EXIT_CODE\\\",\\\"ts\\\":\\\"$(date -Iseconds)\\\"}\" >> .ai/logs/harness.jsonl 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

Add `.ai/logs/` to `.gitignore` (they are runtime logs, not versioned).

**Failure attribution table:**

| Category      | Symptom                                   | Signal in log                           | Action                                                             |
| ------------- | ----------------------------------------- | --------------------------------------- | ------------------------------------------------------------------ |
| **Planning**  | Agent attempts to execute without clear criteria | PreToolUse without corresponding spec task | Review `INSTRUCTIONS.md`; add acceptance criteria to skill |
| **Execution** | Tool call fails repeatedly                | PostToolUse with `exit != 0` in loop    | Review `settings.json`; adjust allow/deny                          |
| **Response**  | Output generated but wrong format         | Phase 5 gate rejects                    | Add output example to skill template                               |

**Add to Phase 5 checklist:**
- [ ] `harness.jsonl` exists and records events after smoke test
- [ ] No tool call loop with exit != 0 detected

---

## Unifying Principle

The gain from hooks: **removes dependency on manual discipline.** The formatter runs because the hook exists, not because the developer remembered. Tests run because `Stop` was configured, not because the agent decided to. Destructive commands are blocked because the rule exists, not because the agent "was careful".

**Production failures are not opaque** — the instrumented harness locates whether the problem is in planning (vague spec), execution (invalid tool call) or response (wrong format). This eliminates trial-and-error debugging.

Spec defines what the agent knows. Harness ensures it acts consistently, safely, and traceably — regardless of the conversation context.
