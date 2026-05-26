# Spec Folder Layout

> Loaded by the `axis-specify` skill at pipeline step 4. Defines the exact
> file/folder shape the agent produces for a new greenfield feature.

## Layout

```
.ai/specs/<slug>/
├── canvas.md     # REASONSTC Canvas — single page, 9 dimensions
└── tasks.md      # Implementation checklist, populated after the Canvas
```

The folder is intentionally flat. If the feature grows enough to warrant
sub-folders (rare — usually means the feature should have been split via
`story-decompose`), add them on demand; do not pre-create empty directories.

## `canvas.md` initial content

Direct copy of the REASONSTC template from
`.ai/skills/axis-bootstrap/references/CANVAS-REASONS.md`, with:
- Title line replaced with the feature name (humanised from the slug —
  `auth-rate-limit` → `Auth Rate Limit`)
- All nine dimension sections present with their placeholders
- A leading line `> Status: draft — fill R first, then iterate`
- A footer line `> Created by axis-specify on <YYYY-MM-DD>`

## `tasks.md` initial content

```markdown
# Tasks — <Feature Name>

> Populate after the REASONSTC Canvas is filled. Items map 1-to-1 with the
> O (Operations) section of the Canvas. Use `[P]` to mark items that can run
> in parallel; otherwise tasks execute in listed order.

## Tasks

_(empty — fill after Canvas R, E, A, S₁, C, O are agreed with the user)_
```

## Slug rules

- Lowercase only
- ASCII letters, digits, and hyphens
- No leading or trailing hyphen, no consecutive hyphens
- Maximum length 48 characters (mirrors git branch-name conventions)
- Examples: `auth-rate-limit`, `pricing-strategy-v2`, `notification-24h`

## When the slug collides

Abort with one of these messages (do not invent a numeric suffix):
- `Folder .ai/specs/<slug>/ already exists. Reuse it or pick a new name.`
- `Branch feat/<slug> already exists locally. Switch to it (\`git checkout feat/<slug>\`) or pick a new name.`

The user resolves the conflict; the skill does not guess intent.
