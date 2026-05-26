# AXIS Quickstart — From Zero to Canvas in 10 Minutes

> Tutorial executable from a fresh terminal. Every command is meant to be
> copy-pasted. By the end you will have a bootstrapped project, a filled
> REASONSTC Canvas, and a clear next step.

## Prerequisites

- Node.js ≥ 18 (`node --version`)
- An empty (or near-empty) project directory
- A Claude Code session (or any agent that reads `CLAUDE.md` / `AGENTS.md`)

## Minute 0–2 — Install and bootstrap

```bash
npx @axis-framework/cli init --preset node --name my-project --purpose "task management API"
```

What this creates:

| Path                                | Purpose                                                |
| ----------------------------------- | ------------------------------------------------------ |
| `.ai/INSTRUCTIONS.md`               | Single source of truth for the agent                   |
| `.ai/skills/`                       | SPDD pipeline + `axis-delta` + `axis-specify` + guard  |
| `.ai/rules/{session-start, constitutional}.md` | Always-on rules (constitutional is Node-flavoured) |
| `.ai/docs/STATE.md`                 | Continuity playbook                                    |
| `axis.config.json`                  | Workflow policy (phases, challengers, canvas)          |
| `scripts/*.sh`                      | Hooks: session-start, constitutional-check, post-*     |
| `.claude/settings.json`             | Permissions + PreToolUse + PostToolUse hooks           |
| `setup-ide-links.sh`                | Multi-IDE symlinks (CLAUDE.md, AGENTS.md, Cursor)      |

Run the symlinks (idempotent):

```bash
bash setup-ide-links.sh
```

## Minute 2–4 — First session with the agent

Open the project in Claude Code (or your agent). On its first turn the
agent will:

1. Read `STATE.md` (Active Decisions / In Progress / Blockers — empty for now)
2. Read `INSTRUCTIONS.md` skill table
3. Acknowledge state in one line per the `session-start` rule

You should see something like:

> *State checked: 0 active decisions, 0 in-progress items, 0 blockers.
> First request: <…>*

Tell the agent your first feature request, e.g.:

> "Add a /tasks endpoint that lists open tasks for the current user."

## Minute 4–8 — The agent runs Phase 1.5 (SPDD)

The agent will trigger the SPDD decision tree (two-of-three: greenfield?
multi-file? Canvas requested?). For a `/tasks` endpoint with no prior code,
it almost always activates and loads three skills in sequence:

1. **`story-decompose`** — produces R (Requirements + ACs) in the Canvas
2. **`alignment`** — fills O (Operations scope) + N (Norms) + S₂ (Safeguards)
3. **`abstraction-first`** — fills E (Entities) + A (Approach) + S₁ (System) + C (Contracts)

The agent then writes the Canvas to `.ai/specs/<slug>/canvas.md` and asks
the Phase 1.5 exit-gate question:

> *Does this capture the feature? Any AC, entity, contract, test scenario,
> norm, or invariant I missed?*

Read the Canvas. Confirm or correct. **Do not skip this gate.**

## Minute 8–10 — Phase 1.8 challengers critique the Canvas

The agent dispatches three challengers in parallel:

- `security-challenger` — looks for injection, auth gaps, missing rate limits
- `simplicity-challenger` — flags overengineering, premature interfaces
- `scope-challenger` — catches implicit features and weak DoD

You get a consolidated critique. For each `CRÍTICO`, fix the Canvas or
explicitly accept-and-document. The agent re-asks the Phase 1.5 gate on
the amended Canvas, then advances to Phase 2 (code).

## You are done

The Canvas + critique together are the "intent contract" for the feature.
Code generation is now a routine translation step — the hard work happened
in 10 minutes of structured conversation.

## Next steps

- Per-feature loop: every new feature re-enters Phase 1.5 → 1.8 → code →
  Phase 6 (iterative review). See [docs/brownfield.md](brownfield.md) for
  the brownfield variant (`axis-delta`).
- Tune the workflow: edit `axis.config.json` to skip challengers, change
  required dimensions, etc. Schema in
  [`.ai/skills/axis-bootstrap/references/CONFIG-SCHEMA.md`](../.ai/skills/axis-bootstrap/references/CONFIG-SCHEMA.md).
- Continuity: at end of session, the agent appends new Active Decisions and
  Lessons Learned to `STATE.md`. Next session starts where you left off.

## Troubleshooting

| Symptom                                    | Likely cause                                         |
| ------------------------------------------ | ---------------------------------------------------- |
| Agent did not read STATE.md                | `session-start` rule not loaded — check `.ai/rules/` |
| Constitutional reminder not printed        | `scripts/constitutional-check.sh` not executable     |
| Symlinks broken on Windows                 | Use WSL or enable Developer Mode for symlink support |
| Multiple skills loaded "in case"           | Anti-pattern — only one skill per request (see INSTRUCTIONS.md) |
