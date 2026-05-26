# axis.config.json — Schema and Semantics

> Single file at the **bootstrapped project root** that captures team-level
> workflow choices. Read by the **agent** (Phase gates consult it before
> deciding to skip / require / abort). **Not** read by the `axis` CLI —
> there is no `axis doctor` validation step, per the "AXIS is one-shot"
> Active Decision (2026-05-26).
>
> Removing the file = use defaults (everything required, all challengers on).

## Top-level keys

| Key             | Type   | Required | Purpose                                                 |
| --------------- | ------ | -------- | ------------------------------------------------------- |
| `version`       | int    | yes      | Schema version (currently `1`). Increment on breaking changes. |
| `_doc`          | string | no       | Free-text reminder for humans. Ignored by the agent.    |
| `phases`        | object | no       | Per-phase activation policy. Missing keys → `required`. |
| `challengers`   | object | no       | Toggles for the 3 Phase-1.8 challengers.                |
| `canvas`        | object | no       | Canvas dimension + test-scenario thresholds.            |
| `constitutional`| object | no       | Behaviour of the PreToolUse constitutional hook.        |

## `phases.<name>` values

| Value                       | Meaning                                                                   |
| --------------------------- | ------------------------------------------------------------------------- |
| `required`                  | Phase always runs when its trigger fires (default for SPDD + adversarial).|
| `optional`                  | Phase runs only when the user explicitly asks ("yes, include …").         |
| `skip`                      | Phase never runs. Agent does not even ask.                                |
| `required-for-brownfield`   | Runs when the change is detected as brownfield (axis-delta path).         |
| `required-for-greenfield`   | Runs when the change is detected as greenfield (axis-specify path).       |
| `manual`                    | Never auto-runs. Triggered only by user verb ("rebootstrap now").         |

**Phases recognised:** `spdd`, `adversarial`, `delta`, `specify`, `rebootstrap`.
Unknown phase keys are ignored with a warning at the next session start
(SessionStart hook surfaces the warning; no CLI command needed).

## `challengers.<name>`

Boolean toggles for `security`, `simplicity`, `scope`. Default `true`.
A team running its own external security review may set `security: false`
and document the reason in `STATE.md → Active Decisions`.

## `canvas`

- `dimensions`: subset of `R, E, A, S1, C, O, T, N, S2` that this team uses.
  Default: all 9 (REASONSTC). Removing a letter signals the team has chosen
  a leaner Canvas — the agent stops asking for that dimension.
- `require_all`: when `true`, every listed dimension must be non-empty before
  Phase 1.5 exits. When `false`, dimensions may carry `_(none)_` placeholders.
- `min_test_scenarios.{happy_path, failure, edge_case}`: integers. Used by
  the Phase 1.5 validator inside the `T` dimension gate.

## `constitutional`

- `enforce_pre_tool_use` (bool, default `true`): when `false`, the agent
  ignores the constitutional reminders even if the hook fires.
- `block_on_violation` (bool, default `false`): when `true`, the agent stops
  on detected violations rather than continuing with a warning. Teams that
  want hard enforcement flip this; the hook script itself stays non-blocking.

## How the agent uses this file

1. **Session start** — read `axis.config.json` once and cache the decoded
   object for the session.
2. **Before each gated phase** — consult the policy; act accordingly. The
   agent surfaces the choice it made (`"Phase 1.8 skipped per axis.config.json
   → phases.adversarial = skip"`) so the user can correct if needed.
3. **On schema-version mismatch** — when `version` is unknown, the agent
   warns and falls back to defaults rather than guessing.

## What the file is *not*

- Not a permissions file (use `.claude/settings.json`).
- Not a secrets file (use env vars).
- Not a CI knob (CI runs `validate-axis.sh` directly).
- Not enforced by any binary — discipline lives in the agent reading it
  and in the team reviewing it in PRs.
