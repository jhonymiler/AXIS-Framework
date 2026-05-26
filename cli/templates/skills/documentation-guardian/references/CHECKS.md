# Documentation Guardian — Drift Checks

> Machine-readable checklist consumed by `scripts/check-doc-drift.sh`.
> Format: `CHECK_ID | description | command | expected`

## Module Inventory Checks

```
CHK-001 | src/ modules present in INSTRUCTIONS table | diff <(find src/ -type d -maxdepth 2 | sort) <(grep -oP '`[a-z][a-z0-9/-]+`' .ai/INSTRUCTIONS.md | tr -d '`' | sort) | no diff output
CHK-002 | INSTRUCTIONS table has no ghost modules | (same as CHK-001 reversed) | no diff output
```

## Skill Coverage Checks

```
CHK-010 | each domain dir has a matching skill | for d in src/*/; do name=$(basename $d); ls .ai/skills/$name/SKILL.md 2>/dev/null || echo "MISSING: $name"; done | no MISSING lines
```

## Specialist Freshness Checks

```
CHK-020 | each specialist EXTRACTED_AT is within 30 days | (parsed by check-doc-drift.sh) | no expired specialists
```

## Rule Path Checks

```
CHK-030 | all applyTo globs resolve to >=1 file | (parsed by check-doc-drift.sh) | no dead globs
```

## Exit Codes

- `0` — all checks pass (warnings are printed but don't fail)
- `1` — one or more CHK-001/002/010 failures (structural drift)
- `2` — CHK-020/030 warnings only (soft drift — log but don't block)
