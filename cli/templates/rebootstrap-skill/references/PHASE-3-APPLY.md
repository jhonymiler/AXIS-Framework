# Phase 3 — Apply

## Purpose

Overwrite framework-owned files with the new CLI version's templates. Domain files are never touched in this phase.

## Apply Logic

For each file classified `FRAMEWORK-CHANGED` or `NEW` in Phase 2:

```bash
# Framework file — overwrite
cp "$(axis --templates-dir)/<template-path>" "<project-path>"

# Stamp new version
NEW_VER=$(node -e "const p=require('./cli/package.json'); console.log(p.version)" 2>/dev/null || axis --version)
echo "$NEW_VER" > .ai/.axis-version
```

## settings.json Update (opt-in)

`.claude/settings.json` is NOT in the framework-owned list by default.
Ask user: *"The new CLI version has an updated settings.json with additional hook matchers. Update yours? [y/N]"*

If yes → show diff of new vs current settings.json → user confirms → apply.

## Scripts directory

`scripts/*.sh` from the self-maintenance kit are always updated (no domain content):
- `scripts/post-spec-edit.sh`
- `scripts/post-code-change.sh`
- `scripts/check-doc-drift.sh`
- `scripts/audit-docs.sh`
- `scripts/_lib.sh`
- `scripts/session-start.sh`
- `scripts/stop.sh`

## Gate

> "Applied N framework files. Domain files untouched: M. `.ai/.axis-version` = `<new_ver>`. Proceed to Phase 4?"
