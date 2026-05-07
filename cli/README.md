# @axis-bootstrap/cli

> CLI for the [AXIS framework](../FRAMEWORK.md) — bootstrap AI-augmented projects with Spec + Harness + Memory.

## Install

```bash
# one-shot, no install
npx @axis-bootstrap/cli init

# or install globally
npm i -g @axis-bootstrap/cli
axis init
```

> Binary command stays short: `axis`. Package name is scoped: `@axis-bootstrap/cli`.

## How it works

`axis init` **auto-detects** your context and asks in **PT or EN** based on `$LANG`:

| Detected | Default mode | What happens |
| -------- | ------------ | ------------ |
| Empty directory | **Quick scaffold** | Interactive prompts → fills templates with your answers (no AI needed) |
| Existing project (has `package.json`, etc.) | **AI-driven** | Installs the `axis-bootstrap` skill bundle. You then ask your AI tool (Claude Code / Cursor / Copilot) to "execute axis-bootstrap" — the agent reads your code, runs 5 phases with gates, and generates customized `.ai/` skills/rules/docs |
| Already has `.ai/` | Asks before overwriting | — |

You can override: pick **Quick**, **AI-driven**, or **Audit-only** at the prompt.

## After AI-driven init

The agent finishes Phase 5 → you run:

```bash
axis cleanup
```

This removes `.ai/skills/axis-bootstrap/` (it has done its job). Your project keeps:

- `.ai/INSTRUCTIONS.md` (custom for your project)
- `.ai/skills/<your-domains>/` (generated based on your code)
- `.ai/rules/`, `.ai/docs/`, `.ai/docs/STATE.md`
- `.claude/settings.json`, symlinks

→ **Fully self-sufficient.** No dependency on `@axis-bootstrap/cli` after this. You can `npm uninstall -g @axis-bootstrap/cli` if you want.

(Optional: keep it around for `axis doctor` / `axis spdd canvas` per-feature workflow.)

## Commands

| Command | Locale | What it does |
| ------- | ------ | ------------ |
| `axis init` | PT/EN | Interactive bootstrap (auto-detects new vs existing) |
| `axis audit` | EN | Reports what AXIS layers are missing |
| `axis doctor` | EN | Validates limits (INSTRUCTIONS 100-180, SKILL ≤60), symlinks, settings |
| `axis link` | EN | Runs `setup-ide-links.sh` (idempotent) |
| `axis state` | EN | Opens `.ai/docs/STATE.md` in `$EDITOR` |
| `axis spdd <step>` | EN | Per-feature SPDD pipeline step |
| `axis cleanup` | PT/EN | Removes axis-bootstrap meta-skill after AI-driven init |

## SPDD pipeline (per feature)

Each step prints the trigger phrase to paste into your AI tool:

```bash
axis spdd canvas pricing-quote   # scaffold .ai/docs/canvases/pricing-quote.md
axis spdd story                  # → AI fills R section
axis spdd align                  # → AI fills O + N + S₂
axis spdd design                 # → AI fills E + A + S₁
# … generate code in your AI tool …
axis spdd review                 # AI verifies diff against Canvas
```

## Removing AXIS entirely

```bash
rm -rf .ai .claude .cursor .agents AGENTS.md CLAUDE.md setup-ide-links.sh
```

That's it. No leftover config, no `node_modules` pollution, no entries in `package.json`.

## Tech

- Node 18+, ESM
- `@clack/prompts` (TUI), `picocolors` (ANSI)
- Zero other deps. Single file per command under `src/commands/`.

## License

MIT
