# Phase 6 — Iterative Review: Worked Example

> Concrete walkthrough of the full Phase 1.5 → 6 cycle for a single feature in a bootstrapped project. Use this as the mental model for every post-bootstrap feature.

---

## Scenario

**Project:** `taskflow-api` — a REST API for team task management, already bootstrapped with AXIS.
**Feature request:** *"Users need to receive a deadline reminder 24 h before a task is due."*

---

## Step 1 — Phase 1.5 (SPDD gate)

Decision tree applied:

| Criterion              | Value | Reason                                                               |
| ---------------------- | ----- | -------------------------------------------------------------------- |
| Greenfield feature?    | ✅ Yes | No notification logic exists yet                                     |
| >1 file / module?      | ✅ Yes | New `NotificationService`, updated `TaskScheduler`, new DB migration |
| User asked for Canvas? | ✅ Yes | Explicitly requested a REASONS Canvas                                |

**Two-of-three met → SPDD pipeline runs.**

---

## Step 2 — REASONS Canvas (Phase 1.5 output)

```markdown
# REASONS Canvas — Task Deadline Notification

## R — Requirements (stories)
- As a task assignee, I want to receive an email 24 h before the deadline
  so I can reprioritize.
- AC1: Notification sent exactly once per task, at T-24h.
  GIVEN a task with a due_date within 24 h
  WHEN the scheduler runs its hourly sweep
  THEN one email is dispatched and `notified_at` is stamped on the task row
- AC2: No notification if task is already completed or cancelled.
- AC3: If email delivery fails, retry up to 3× with exponential back-off.
- DoD: unit tests green; scheduler integration test passes in CI; no new p0 errors in staging.

## E — Entities
| Name                  | Responsibility                                              |
| --------------------- | ----------------------------------------------------------- |
| `Task`                | Source of truth — holds `due_date`, `status`, `notified_at` |
| `NotificationJob`     | Value object — encapsulates what to send and to whom        |
| `NotificationService` | Sends email via SMTP; records delivery receipt              |
| `DeadlineScheduler`   | Cron job — queries due tasks, creates jobs, dispatches them |

## A — Approach
1. `DeadlineScheduler` runs on `0 * * * *` (hourly). Queries tasks where
   `due_date BETWEEN now() AND now() + INTERVAL 24h AND notified_at IS NULL AND status NOT IN ('done','cancelled')`.
2. For each task, instantiates `NotificationJob` and calls `NotificationService.send(job)`.
3. On success: `UPDATE tasks SET notified_at = now() WHERE id = ?`.
4. On failure after 3 retries: logs error with `task_id`; does NOT stamp `notified_at` (allows retry on next sweep).

## S₁ — System structure
- New file: `src/notifications/NotificationService.ts`
- New file: `src/notifications/NotificationJob.ts`
- Modified: `src/scheduler/DeadlineScheduler.ts` (add sweep method)
- New migration: `migrations/0012_add_notified_at_to_tasks.sql`
- New tests: `tests/unit/notifications/`, `tests/integration/scheduler/`

## C — Contracts
```typescript
// DeadlineScheduler → NotificationService
interface NotificationJob {
  taskId: string;
  recipientEmail: string;       // non-empty, RFC-5322
  slackChannel?: string;        // optional; only set when AC4 applies
  dueAt: ISODateString;
}
interface SendResult {
  delivered: boolean;
  attempts: number;             // 1..3
  error?: { code: string; message: string };
}
// Pre-condition:  job.recipientEmail valid; dueAt > now()
// Post-condition: delivered=true ⇒ NotificationService stamped notified_at upstream
//                 delivered=false ⇒ attempts === 3 AND error is set
// Invariant:      same job (taskId, dueAt) processed at most once per sweep
```

## O — Out of scope
- Push notifications (mobile) — deferred to v2
- Customizable notification timing — hardcoded to 24 h for now
- Notification history UI — not in this story

## N — Norms
- SMTP credentials via env vars only (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`)
- `notified_at` field is immutable once set (never update back to NULL in application code)
- All new code covered by unit tests (no untested dispatch paths)

## S₂ — Safeguards
- Guard: `NotificationService` is interface-based; test suite uses an in-memory stub (no real SMTP in CI)
- Guard: scheduler query must be idempotent — verified by `notified_at IS NULL` filter
- Risk: clock skew between app servers → mitigated by using DB `now()` not application clock

## T — Test Scenarios
| #   | Given                                                | When                       | Then                                                                  | Type       |
| --- | ---------------------------------------------------- | -------------------------- | --------------------------------------------------------------------- | ---------- |
| 1   | task due in 18h, `notified_at=NULL`, status=`open`   | scheduler sweep runs       | 1 email dispatched; `notified_at = now()`; AC1 satisfied              | happy path |
| 2   | task due in 18h, status=`done`                       | scheduler sweep runs       | zero emails dispatched; `notified_at` remains NULL (AC2)              | failure    |
| 3   | SMTP rejects with 5xx three times                    | `NotificationService.send` | `SendResult.delivered=false`, `attempts=3`; `notified_at` stays NULL  | failure    |
| 4   | task due in exactly 24h00m (boundary)                | scheduler sweep runs       | included in sweep; one email; `notified_at` stamped                   | edge case  |
| 5   | two scheduler instances run concurrently on same row | parallel sweep             | exactly one email (DB `UPDATE … WHERE notified_at IS NULL` serializes)| edge case  |
```

**Gate:** User reviews and confirms: *"Looks right. Add AC4: send a Slack message to the channel as well."*

Canvas updated: `NotificationJob` gains `slack_channel?: string`; `NotificationService` gains `notifySlack(job)`. S₂ adds: Slack token in env var `SLACK_BOT_TOKEN`.

---

## Step 3 — Code Generated (end of Phase 2 cycle)

Agent produces:
- `src/notifications/NotificationService.ts` (89 lines)
- `src/notifications/NotificationJob.ts` (24 lines)
- `src/scheduler/DeadlineScheduler.ts` +38 lines diff
- `migrations/0012_add_notified_at_to_tasks.sql`
- Unit + integration test files

---

## Step 4 — Phase 6: Drift Detected (Track A)

During `iterative-review`, the reviewer spots that the generated code uses `TaskReminderWorker` instead of `DeadlineScheduler` (Canvas §S₁). This is a **logic correction** because renaming affects all callers.

**Track A protocol:**

1. **Update Canvas first** — §S₁ row changed to `TaskReminderWorker` (rename is intentional — team prefers this name).
2. **Update affected Operations** — rename the class across all files.
3. **Run tests** — `npm test` → green.

If instead the naming drift was unintentional (team wanted `DeadlineScheduler`), the code is renamed back (no Canvas change). The exit criteria is the same: Canvas and code agree.

---

## Step 5 — Exit Gate (Phase 6)

| Check                                  | Result                                                                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Canvas S₁ matches generated files?     | ✅ `TaskReminderWorker` in both                                                                                                   |
| All ACs verified with concrete values? | ✅ AC1: stamp logged in integration test; AC2: tested with `status='done'`; AC3: retry loop unit-tested; AC4: Slack stub asserted |
| Diff confined to feature scope?        | ✅ Only `src/notifications/`, `src/scheduler/`, `migrations/`, `tests/`                                                           |
| No secrets in code?                    | ✅ SMTP + Slack via env vars only                                                                                                 |

---

## Step 6 — STATE.md Update

After the feature lands, the agent appends to `.ai/docs/STATE.md`:

```markdown
## Active Decisions
- **2026-05-26 — Notification worker naming:** class is `TaskReminderWorker`
  (not `DeadlineScheduler`). Reason: team convention — workers use imperative "do X" naming.
  Applies to all future background workers in this project.

## Lessons Learned
- `notified_at IS NULL` idempotency guard is the canonical way to prevent
  duplicate notifications. Apply same pattern to future one-shot async jobs.
```

---

## Cycle Summary

```
Phase 1.5 → Canvas (7 dimensions) ─┐
                                    ├─→ Code ─→ Phase 6 (drift check) ─→ STATE update
                                    └─ Gate confirmed by user
```

**Bootstrap (Phases 1-5) runs once. SPDD + Phase 6 runs every feature.**

Total wall-clock time for this example feature: Canvas ~20 min, code gen ~15 min, review ~10 min.
