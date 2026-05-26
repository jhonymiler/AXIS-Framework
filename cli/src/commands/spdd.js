import { intro, outro, text, log, note, confirm } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { findTarget, exists, read, write, TEMPLATES, ensureDir } from '../lib/paths.js';

const STEPS = {
  story: {
    skill: 'story-decompose',
    fills: 'R (Requirements)',
    desc: 'Break a large requirement into INVEST stories with G/W/T ACs.',
  },
  align: {
    skill: 'alignment',
    fills: 'O scope + N (Norms) + S₂ (Safeguards)',
    desc: 'Lock intent, scope, engineering norms, and non-negotiable invariants.',
  },
  design: {
    skill: 'abstraction-first',
    fills: 'E (Entities) + A (Approach) + S₁ (System structure)',
    desc: 'Design objects, layer boundaries, and variation points before code.',
  },
  review: {
    skill: 'iterative-review',
    fills: 'Canvas ⇄ code drift',
    desc: 'Two-track review: logic correction (spec → code) or refactor sync (code → spec).',
  },
  sync: {
    skill: 'iterative-review',
    fills: 'Canvas ⇄ code (Track B)',
    desc: 'Sync Canvas back to code after a refactor (no behavior change).',
  },
};

export async function spdd(argv) {
  const sub = argv[0];
  const rest = argv.slice(1);

  if (!sub || sub === 'help' || sub === '--help') {
    printSpddHelp();
    return;
  }

  if (sub === 'canvas') {
    await scaffoldCanvas(rest);
    return;
  }

  if (sub === 'verify') {
    await verifyCanvas(rest);
    return;
  }

  if (!STEPS[sub]) {
    log.error(`Unknown SPDD step: ${pc.red(sub)}`);
    printSpddHelp();
    process.exit(1);
  }

  await invokeSkill(sub, rest);
}

function printSpddHelp() {
  console.log();
  console.log(pc.bold('SPDD pipeline') + pc.dim(' — produces a REASONS Canvas, then code'));
  console.log();
  console.log(`  ${pc.cyan('axis spdd story')}     ${pc.dim('→ R')}        Decompose into INVEST stories`);
  console.log(`  ${pc.cyan('axis spdd align')}     ${pc.dim('→ O+N+S₂')}   Lock scope, norms, safeguards`);
  console.log(`  ${pc.cyan('axis spdd design')}    ${pc.dim('→ E+A+S₁')}   Entities, approach, structure`);
  console.log(`  ${pc.cyan('axis spdd canvas')}    ${pc.dim('<slug>')}     Scaffold a new Canvas file`);
  console.log(`  ${pc.cyan('axis spdd verify')}    ${pc.dim('<slug>')}     Check that S₂ safeguards have matching tests`);
  console.log(`  ${pc.cyan('axis spdd review')}    ${pc.dim('Track A/B')}  Iterative review after code gen`);
  console.log(`  ${pc.cyan('axis spdd sync')}      ${pc.dim('Track B')}    Sync Canvas after refactor`);
  console.log();
  console.log(pc.dim('Each step prints the trigger phrase to paste into your AI tool (Claude Code, Cursor, etc.).'));
  console.log();
}

async function scaffoldCanvas(rest) {
  intro(pc.bgBlue(pc.white(' axis spdd canvas ')));
  const target = findTarget();
  let slug = rest[0];
  if (!slug) {
    slug = await text({
      message: 'Canvas slug (kebab-case)?',
      placeholder: 'pricing-quote',
      validate: (v) => (/^[a-z0-9-]+$/.test(v) ? undefined : 'kebab-case only: a-z, 0-9, -'),
    });
  }

  const dest = path.join(target, '.ai', 'docs', 'canvases', `${slug}.md`);
  if (exists(dest)) {
    const overwrite = await confirm({ message: `${slug}.md exists. Overwrite?`, initialValue: false });
    if (!overwrite || typeof overwrite === 'symbol') {
      outro(pc.yellow('Aborted.'));
      return;
    }
  }

  ensureDir(path.dirname(dest));
  const tpl = read(path.join(TEMPLATES, 'CANVAS.md')).replace(/{{SLUG}}/g, slug);
  write(dest, tpl);

  note(
    [
      `${pc.green('✓')} Scaffolded ${pc.cyan(path.relative(target, dest))}`,
      '',
      `${pc.bold('Next steps (in order):')}`,
      `  1. ${pc.cyan('axis spdd story')}   — fill R`,
      `  2. ${pc.cyan('axis spdd align')}   — fill O + N + S₂`,
      `  3. ${pc.cyan('axis spdd design')}  — fill E + A + S₁`,
      `  4. Generate code (your AI tool, using O as prompt)`,
      `  5. ${pc.cyan('axis spdd review')}  — verify diff against Canvas`,
    ].join('\n'),
    'Canvas created'
  );
  outro(pc.green('done'));
}

async function invokeSkill(step, rest) {
  const meta = STEPS[step];
  intro(pc.bgBlue(pc.white(` axis spdd ${step} `)));

  const target = findTarget();
  const skillPath = path.join(target, '.ai', 'skills', meta.skill, 'SKILL.md');
  const hasSkill = exists(skillPath);

  note(
    [
      `${pc.bold('Skill:')}     ${pc.cyan(meta.skill)} ${hasSkill ? pc.green('(installed)') : pc.yellow('(not installed in this project)')}`,
      `${pc.bold('Fills:')}     ${meta.fills}`,
      `${pc.bold('Purpose:')}   ${pc.dim(meta.desc)}`,
    ].join('\n'),
    `SPDD step: ${step}`
  );

  if (!hasSkill) {
    log.warn(`Skill ${meta.skill} not present in .ai/skills/. Add it from the AXIS framework repo or copy SKILL.md.`);
  }

  const trigger = `Load the ${meta.skill} skill and apply it. Update the active Canvas at .ai/docs/canvases/<slug>.md.`;

  note(pc.cyan(trigger), 'Paste this into your AI tool');
  outro(pc.green('done'));
}

/**
 * Parse S₂ safeguards from a Canvas and check that each one has at least one
 * matching test in the project tree. The Canvas template enforces the format
 * `- [ ] test: <invariant text>` so this is a pure text contract — no test
 * runner integration needed.
 *
 * Heuristic: extract the keywords (first 4 non-stopword tokens of the invariant),
 * grep recursively under common test directories, report ✓ or ✗ per safeguard.
 */
async function verifyCanvas(rest) {
  const slug = rest[0];
  if (!slug) {
    log.error('Usage: axis spdd verify <slug>');
    process.exit(1);
  }
  const target = findTarget();
  const canvasPath = path.join(target, '.ai', 'docs', 'canvases', `${slug}.md`);
  if (!exists(canvasPath)) {
    log.error(`Canvas not found: ${pc.red(canvasPath)}`);
    process.exit(1);
  }

  const fs = await import('node:fs');
  const { execSync } = await import('node:child_process');
  const content = fs.readFileSync(canvasPath, 'utf8');

  // Extract S₂ block (until next ## header) and parse `- [ ] test: …` lines.
  const s2 = content.split(/^## S₂.*$/m)[1]?.split(/^## /m)[0] || '';
  const items = [...s2.matchAll(/^- \[([ x])\] test:\s*(.+)$/gm)].map((m) => ({
    checked: m[1] === 'x',
    text: m[2].trim(),
  }));

  if (items.length === 0) {
    log.warn(`No "- [ ] test: …" safeguards found in S₂ of ${slug}.md`);
    return;
  }

  intro(pc.bgBlue(pc.white(` axis spdd verify · ${slug} `)));

  // Common test directories — grep falls back gracefully if none exist.
  const testRoots = ['tests', 'test', 'spec', '__tests__', 'cypress', 'e2e'];
  const presentRoots = testRoots.filter((r) => exists(path.join(target, r)));
  if (presentRoots.length === 0) {
    log.warn(`No test directories found (looked for: ${testRoots.join(', ')}). Cannot verify coverage.`);
    outro(pc.yellow('skipped'));
    return;
  }

  const STOPWORDS = new Set(['the', 'a', 'an', 'is', 'no', 'not', 'on', 'in', 'of', 'and', 'or', 'to', 'for', 'with', 'be']);
  const results = [];
  for (const item of items) {
    const keywords = item.text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
      .slice(0, 3);

    if (keywords.length === 0) {
      results.push({ item, status: 'skip', hits: 0 });
      continue;
    }

    // Require ALL keywords to appear in the same file (cheap proxy for "asserts this invariant").
    let hits = 0;
    try {
      const grepArgs = ['-rl', '-i', '-e', keywords[0], ...presentRoots];
      const first = execSync(`grep ${grepArgs.map((a) => JSON.stringify(a)).join(' ')}`, { cwd: target, stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .split('\n')
        .filter(Boolean);
      // Filter by remaining keywords
      const matches = first.filter((f) => {
        const txt = fs.readFileSync(path.join(target, f), 'utf8').toLowerCase();
        return keywords.slice(1).every((k) => txt.includes(k));
      });
      hits = matches.length;
    } catch {
      hits = 0;
    }
    results.push({ item, status: hits > 0 ? 'ok' : 'missing', hits, keywords });
  }

  const ok = results.filter((r) => r.status === 'ok').length;
  const missing = results.filter((r) => r.status === 'missing').length;

  for (const r of results) {
    const icon = r.status === 'ok' ? pc.green('✓') : r.status === 'missing' ? pc.red('✗') : pc.dim('·');
    const tail = r.status === 'ok'
      ? pc.dim(`(${r.hits} test file${r.hits === 1 ? '' : 's'})`)
      : r.status === 'missing'
      ? pc.dim(`(keywords: ${r.keywords.join(', ')})`)
      : pc.dim('(no keywords extractable)');
    console.log(`  ${icon} ${r.item.text} ${tail}`);
  }

  console.log();
  console.log(`${pc.bold('Coverage:')} ${pc.green(ok)}/${results.length} safeguards have at least one matching test, ${pc.red(missing)} missing.`);

  if (missing > 0) {
    outro(pc.red(`✗ ${missing} safeguard(s) without tests — write failing tests first, then implement.`));
    process.exit(2);
  }
  outro(pc.green('✓ all safeguards covered'));
}
