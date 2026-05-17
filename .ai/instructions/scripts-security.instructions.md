---
applyTo: "scripts/**,.github/workflows/**,setup-ide-links.sh"
---

# Shell & GitHub Actions — security focus

These instructions apply when the PR touches shell scripts or workflow definitions.

## Shell hardening

- `set -euo pipefail` at the top of every non-trivial script. Reject scripts that don't have it (or equivalent explicit error handling).
- All variable expansions inside double quotes: `"$VAR"`, not `$VAR`. Unquoted expansion breaks on whitespace and globs.
- No `eval` on dynamic input. Use case/explicit dispatch.
- No `curl ... | bash` from non-pinned URLs. Pin to commit hashes if external.
- File deletion: prefer `find ... -delete` with explicit `-name` patterns over `rm -rf $VAR/*`.
- Idempotency: `setup-ide-links.sh` and similar setup scripts must be safe to re-run. Use `ln -sf`, `mkdir -p`, etc.

## GitHub Actions permissions

- `permissions:` declared explicitly at workflow or job level. Reject `permissions: write-all` or omitted permissions on workflows that mutate anything.
- Default to `contents: read`; escalate only the specific permission needed.
- For npm publish: use `id-token: write` (OIDC trusted publishing). Long-lived `NPM_TOKEN` is acceptable only when OIDC is unavailable for the registry — and must be scoped to a GitHub environment with deployment protection.
- For PR triggers from forks: prefer `pull_request` + restricted permissions over `pull_request_target` (which runs with write access to secrets — easy to abuse).

## Secret handling

- Never `echo "$SECRET"` or pipe secrets through commands that log to stdout/stderr.
- Never debug-dump full `env` or `github` context to logs.
- Environment-scoped secrets (e.g., `environment: PRD`) > repository secrets when the workflow deploys or publishes.
- Reject any workflow that prints `${{ secrets.* }}` or `${{ github.event.* }}` payloads without scrubbing.

## Action pinning

- Use specific action versions: commit SHA (most secure) or major tag (`@v4`). Reject `uses: foo/bar@main` or `@master` — those move silently and have been used for supply-chain attacks.
- For Anthropic/OpenAI/3rd-party actions: prefer commit SHA pinning.

## Publish workflows

- Must use `npm publish --provenance` for npm packages. Reject removal of `--provenance` flag.
- Must validate the package before publish (`npm pack --dry-run` or equivalent).
- Must gate on tag/version match where applicable — never publish a tarball whose internal `package.json` version differs from the release tag.
- Must run the project's own validators (e.g., `bash scripts/validate-axis.sh`) before the publish step.

## What to reject

- Scripts that touch files outside the repo root without explicit user opt-in.
- Workflows that disable provenance, validation gates, or permission scoping for "convenience".
- New scripts without `set -euo pipefail` or equivalent error handling.
- Hardcoded credentials, API endpoints with embedded tokens, or `.npmrc` with `_authToken=...` committed to the repo.
- Workflows with `if: always()` on steps that publish or deploy — a failure earlier in the pipeline should block the deploy, not be bypassed.
