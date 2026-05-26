# Constitutional Rules — Python

> Always-on. Five non-negotiable gates that any Write/Edit on this codebase must
> satisfy. The `constitutional-check.sh` hook prints these reminders before every
> file mutation. Articles are stack-specific and grep-verifiable.

## Article I — Test-First Imperative (NON-NEGOTIABLE)

Before writing implementation code:
1. Write a failing test (`pytest` / `unittest`) that defines expected behaviour
2. Confirm with the user that the test represents intent
3. Run `pytest -k <new_test>` and confirm it is **RED**
4. Only then implement

**Gate:** the PR diff contains at least one new test file with ≥1 failing
assertion **before** the production-code commit lands.

## Article II — Type Hints On Public Surface

Every public function/method (no leading underscore) on a module has type hints
on parameters and return value. Internal helpers are exempt.

**Gate:** `mypy --strict src/` (or `pyright src/`) returns 0 errors. Adding `Any`
requires a `# type: ignore[no-any-return]  # reason: <…>` comment.

## Article III — Dependency Boundary

I/O (HTTP, DB, filesystem, subprocess) lives only in `src/<pkg>/infrastructure/`.
Services in `src/<pkg>/application/` and entities in `src/<pkg>/domain/` import
abstract ports, never concrete clients (`requests`, `httpx`, `psycopg`, `boto3`).

**Gate:** `grep -rEn "^import (requests|httpx|psycopg|boto3)|^from (requests|httpx|psycopg|boto3)" src/*/application src/*/domain`
returns 0 results.

## Article IV — No Bare `except`

`except:` and `except Exception:` are forbidden outside top-level entry points
(CLI, request handlers). Catch the specific exception you can recover from.

**Gate:** `grep -rEn "except\s*:|except\s+Exception\s*:" src/ | grep -vE "^src/(cli|api/handlers)/"`
returns 0 results.

## Article V — Errors Are Domain Exceptions

Raise subclasses of `DomainError` (defined in `src/<pkg>/domain/errors.py`).
Never `raise Exception(...)` in application/domain layers. Never return `None`
to signal failure — use a result type or raise.

**Gate:** `grep -rn "raise Exception(\|return None  # error" src/*/application src/*/domain`
returns 0 results.

---

**On violation:** the hook prints the article + the failing gate. The agent
must either fix the violation or open a PR comment explicitly accepting the
breach with reasoning.
