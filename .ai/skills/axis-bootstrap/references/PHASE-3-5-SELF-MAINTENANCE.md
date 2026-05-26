# Phase 3.5 — Bootstrap Self-Maintenance Kit

> Installs the documentation-guardian infrastructure so the bootstrapped project can detect and repair doc drift **without ever calling `axis` again**.

---

## Purpose

After Phase 3 (Harness), the project has hooks and permissions. Phase 3.5 uses that infrastructure to install a self-sustaining documentation layer:

- A **skill** (`documentation-guardian`) the agent loads when drift is suspected
- Three **always-on rules** that trigger on code changes and session end
- Two **hooks** wired into `settings.json` that run automatically
- Two **scripts** the agent calls for full drift analysis

All artifacts are project-local. Zero runtime dependency on the `axis` CLI.

---

## Input

- Phase 2 Spec Layer confirmed (`.ai/skills/`, `.ai/rules/`, `.ai/INSTRUCTIONS.md`)
- Phase 3 Harness confirmed (`settings.json`, hook scripts)
- The 5 discoverer sub-agents have run in Phase 1 (their output is in `.ai/.discovery/`)

---

## Artifacts to Install

| #         | Artifact                       | Source (from bootstrap)                               | Destination in project               |
| --------- | ------------------------------ | ----------------------------------------------------- | ------------------------------------ |
| **3.5.1** | Skill `documentation-guardian` | `cli/templates/skills/documentation-guardian/`        | `.ai/skills/documentation-guardian/` |
| **3.5.2** | Rule `documentation-sync.md`   | `cli/templates/rules/documentation-sync.md`           | `.ai/rules/documentation-sync.md`    |
| **3.5.3** | Rule `skill-emergence.md`      | `cli/templates/rules/skill-emergence.md`              | `.ai/rules/skill-emergence.md`       |
| **3.5.4** | Rule `state-curation.md`       | `cli/templates/rules/state-curation.md`               | `.ai/rules/state-curation.md`        |
| **3.5.5** | Hook `post-spec-edit.sh`       | `cli/templates/hooks/post-spec-edit.sh`               | `scripts/post-spec-edit.sh`          |
| **3.5.6** | Hook `post-code-change.sh`     | `cli/templates/hooks/post-code-change.sh`             | `scripts/post-code-change.sh`        |
| **3.5.7** | Script `check-doc-drift.sh`    | `cli/templates/scripts-self-maint/check-doc-drift.sh` | `scripts/check-doc-drift.sh`         |
| **3.5.8** | Script `audit-docs.sh`         | `cli/templates/scripts-self-maint/audit-docs.sh`      | `scripts/audit-docs.sh`              |

---

## Generation Steps

### Step 1 — Copy artifacts

```bash
# skill
mkdir -p .ai/skills/documentation-guardian/references
cp <axis>/cli/templates/skills/documentation-guardian/SKILL.md .ai/skills/documentation-guardian/
cp <axis>/cli/templates/skills/documentation-guardian/references/CHECKS.md .ai/skills/documentation-guardian/references/

# rules
cp <axis>/cli/templates/rules/documentation-sync.md .ai/rules/
cp <axis>/cli/templates/rules/skill-emergence.md .ai/rules/
cp <axis>/cli/templates/rules/state-curation.md .ai/rules/

# hooks + scripts
cp <axis>/cli/templates/hooks/post-spec-edit.sh scripts/
cp <axis>/cli/templates/hooks/post-code-change.sh scripts/
cp <axis>/cli/templates/scripts-self-maint/check-doc-drift.sh scripts/
cp <axis>/cli/templates/scripts-self-maint/audit-docs.sh scripts/
chmod +x scripts/post-spec-edit.sh scripts/post-code-change.sh \
         scripts/check-doc-drift.sh scripts/audit-docs.sh
```

> In practice, `axis init` does this automatically. Manual copy is the fallback for re-bootstrap.

### Step 2 — Wire hooks into settings.json

Add two matchers to `.claude/settings.json` → `hooks` section:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "if [[ \"$CLAUDE_TOOL_INPUT_FILE_PATH\" == .ai/* ]]; then bash scripts/post-spec-edit.sh; fi"
          },
          {
            "type": "command",
            "command": "if [[ \"$CLAUDE_TOOL_INPUT_FILE_PATH\" == ${AXIS_SRC_ROOT:-src}/* ]]; then bash scripts/post-code-change.sh; fi"
          }
        ]
      }
    ]
  }
}
```

> `axis hooks install` automates this via the hook filename → matcher map.

### Step 3 — Verify wiring

Run `bash scripts/audit-docs.sh` to confirm the 3 cold-start trials pass.

---

## Exit Gate

Present:
- List of 8 artifacts installed with ✓ next to each
- Output of `bash scripts/audit-docs.sh` (all 3 trials must pass)
- The two hook matchers added to `settings.json`

Ask: *"Self-maintenance kit installed. Does the audit output look correct? Any SRC_ROOT adjustment needed (default: `src/`)?"*

**Do not advance to Phase 4 until the audit passes and the user confirms.**

---

## What "Self-Maintaining" Means

After this phase, the project can:
- Detect structural drift automatically on every code or spec edit (via hooks)
- Surface missing skill coverage when a new module is added (via `skill-emergence` rule)
- Curate STATE.md at session end (via `state-curation` rule)
- Run a full drift audit with `bash scripts/audit-docs.sh` at any time
- Reload and update specialist agents when their embedded knowledge becomes stale

**None of this requires `axis` to be installed in the project's environment.**
