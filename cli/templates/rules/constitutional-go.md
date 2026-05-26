# Constitutional Rules — Go

> Always-on. Five non-negotiable gates that any Write/Edit on this codebase must
> satisfy. The `constitutional-check.sh` hook prints these reminders before every
> file mutation. Articles are stack-specific and grep-verifiable.

## Article I — Test-First Imperative (NON-NEGOTIABLE)

Before writing implementation code:
1. Write a failing `_test.go` defining expected behaviour
2. Confirm with the user that the test represents intent
3. Run `go test ./... -run <NewTest>` and confirm it is **RED**
4. Only then implement

**Gate:** PR diff contains a new `*_test.go` file with ≥1 failing assertion
before the production commit lands.

## Article II — Errors Are Wrapped With Context

Every `return err` from a non-trivial call site uses `fmt.Errorf("<context>: %w", err)`
or `errors.Join`. Bare `return err` is allowed only when the function is a thin
adapter that adds nothing.

**Gate:** `grep -rEn "^\s*return err$" --include="*.go" | grep -v "_test.go" | wc -l`
≤ the count from `main` baseline. New violations get justified inline.

## Article III — Dependency Boundary (Hexagonal)

I/O (HTTP, SQL, files, RPC) lives only in `internal/adapter/`. The `internal/domain/`
and `internal/usecase/` packages must not import `net/http`, `database/sql`,
`os`, `io/ioutil`, or any vendor SDK directly.

**Gate:** `grep -rEn "^import .*(net/http|database/sql|^os$|aws-sdk-go|stripe-go)" internal/domain internal/usecase`
returns 0 results.

## Article IV — No `panic` In Library Code

`panic` is allowed only in `main` packages and in tests (`require.NoError` style).
Library code returns errors, never panics on recoverable conditions.

**Gate:** `grep -rEn "panic\(" --include="*.go" | grep -vE "(_test\.go|/cmd/|/main\.go)"`
returns 0 results.

## Article V — Interfaces At Consumer Side

Interfaces live in the package that **consumes** them, not the package that
implements them (Go idiom). New abstractions require ≥2 consumers before they
are extracted into their own package.

**Gate:** new `interface{...}` declarations in packages other than the consumer
require a `// consumer: <pkg>` comment justifying the location.

---

**On violation:** the hook prints the article + the failing gate. The agent
must either fix the violation or open a PR comment explicitly accepting the
breach with reasoning.
