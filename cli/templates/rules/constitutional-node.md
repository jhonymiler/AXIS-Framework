# Constitutional Rules — Node.js + TypeScript

> Always-on. Five non-negotiable gates that any Write/Edit on this codebase must
> satisfy. The `constitutional-check.sh` hook prints these reminders before every
> file mutation. Articles are stack-specific and grep-verifiable.

## Article I — Test-First Imperative (NON-NEGOTIABLE)

Before writing implementation code:
1. Write a failing test that defines the expected behaviour
2. Confirm with the user that the test represents intent
3. Run the suite and confirm the test is **RED**
4. Only then implement

**Gate:** `npm test -- --listTests <new-spec>` shows the file; running it produces
≥1 failing assertion before any production-code line is added in the same PR.

## Article II — No `any` Without Approval

TypeScript `any` requires an in-code comment justifying the escape hatch:
```ts
// any: <concrete reason> — approved by <who> on <YYYY-MM-DD>
```
**Gate:** `grep -rn ": any\b\| as any\b" src/ | grep -v "// any:"` returns 0 lines.

## Article III — Dependency Boundary

HTTP/DB/file-I/O lives only in `src/infrastructure/`. Application services depend
on repository interfaces, never on `axios`, `fetch`, `pg`, `fs`, etc. directly.

**Gate:** `grep -rEn "axios|node-fetch|^import .* from 'fs'" src/application src/domain`
returns 0 results.

## Article IV — Single Public Export

Each file under `src/` exports exactly one primary public class/function.
Helpers stay non-exported in the same file or move to `src/internal/`.

**Gate:** files with `>1` `export class|export function|export default` outside
`src/internal/` and `index.ts` re-export barrels require a comment block
`// multi-export: <reason>`.

## Article V — Errors Are Domain Objects

Throw subclasses of `DomainError` (defined in `src/domain/errors.ts`). Never
`throw new Error('...')` in `src/application` or `src/domain`. Never `return null`
to signal failure — use `Result<T, E>` or throw.

**Gate:** `grep -rn "throw new Error\|return null;" src/application src/domain`
returns 0 results.

---

**On violation:** the hook prints the article + the failing gate. The agent
must either fix the violation or open a PR comment explicitly accepting the
breach with reasoning.
