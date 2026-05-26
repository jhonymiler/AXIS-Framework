import { intro, outro, text, log, note, confirm } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
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

const STEP_ORDER = ['story', 'align', 'design', 'review', 'sync'];

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

  if (sub === 'guide') {
    printGuide(rest[0]);
    return;
  }

  // Backwards-compatible aliases: `axis spdd story` still works, delegates to guide
  if (STEPS[sub]) {
    printGuide(sub, { alias: true });
    return;
  }

  log.error(`Unknown SPDD command: ${pc.red(sub)}`);
  printSpddHelp();
  process.exit(1);
}

function printSpddHelp() {
  console.log();
  console.log(pc.bold('SPDD pipeline') + pc.dim(' — produces a REASONS Canvas, then code'));
  console.log();
  console.log(pc.bold('  Executable commands'));
  console.log(`    ${pc.cyan('axis spdd canvas')}    ${pc.dim('<slug>')}        Scaffold a new Canvas file`);
  console.log(`    ${pc.cyan('axis spdd verify')}    ${pc.dim('<slug>')}        Check that S₂ safeguards have matching tests`);
  console.log();
  console.log(pc.bold('  Guidance for the agent') + pc.dim(' — prints trigger phrases to paste into your AI tool'));
  console.log(`    ${pc.cyan('axis spdd guide')}                    Show all 5 steps`);
  console.log(`    ${pc.cyan('axis spdd guide')}    ${pc.dim('<step>')}         Show one: ${STEP_ORDER.map((s) => pc.cyan(s)).join(' | ')}`);
  console.log();
  console.log(pc.dim('  Legacy aliases still work: `axis spdd story`, `axis spdd align`, etc. → delegate to `guide`.'));
  console.log();
}

/**
 * Print SPDD guidance — either all 5 steps in pipeline order, or one specific step.
 * Replaces the previous 5 separate subcommands (story, align, design, review, sync)
 * which each printed a single trigger phrase. Consolidation per Sprint 1 / F2.3.
 */
function printGuide(step, opts = {}) {
  const target = findTarget();

  if (step && !STEPS[step]) {
    log.error(`Unknown step: ${pc.red(step)}. Available: ${STEP_ORDER.join(', ')}`);
    process.exit(1);
  }

  if (opts.alias) {
    log.warn(pc.dim(`(legacy alias: \`axis spdd ${step}\` → \`axis spdd guide ${step}\`)`));
  }

  const stepsToShow = step ? [step] : STEP_ORDER;
  intro(pc.bgBlue(pc.white(step ? ` axis spdd guide · ${step} ` : ' axis spdd guide ')));

  if (!step) {
    note(
      [
        pc.bold('Pipeline order:') + ' story → align → design → (generate code) → review → sync',
        '',
        pc.dim('Each step below prints a trigger phrase you paste into your AI tool.'),
        pc.dim('Your agent loads the named skill and updates the active Canvas.'),
      ].join('\n'),
      'SPDD overview'
    );
  }

  for (const s of stepsToShow) {
    const meta = STEPS[s];
    const skillPath = path.join(target, '.ai', 'skills', meta.skill, 'SKILL.md');
    const hasSkill = exists(skillPath);
    const trigger = `Load the ${meta.skill} skill and apply it. Update the active Canvas at .ai/docs/canvases/<slug>.md.`;

    note(
      [
        `${pc.bold('Step:')}      ${pc.cyan(s)}`,
        `${pc.bold('Skill:')}     ${pc.cyan(meta.skill)} ${hasSkill ? pc.green('(installed)') : pc.yellow('(not installed)')}`,
        `${pc.bold('Fills:')}     ${meta.fills}`,
        `${pc.bold('Purpose:')}   ${pc.dim(meta.desc)}`,
        '',
        pc.bold('Trigger to paste:'),
        pc.cyan('  ' + trigger),
      ].join('\n'),
      `${stepsToShow.length > 1 ? STEP_ORDER.indexOf(s) + 1 + '. ' : ''}${s}`
    );
  }

  outro(pc.green('done'));
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
      `  1. ${pc.cyan('axis spdd guide story')}   — fill R`,
      `  2. ${pc.cyan('axis spdd guide align')}   — fill O + N + S₂`,
      `  3. ${pc.cyan('axis spdd guide design')}  — fill E + A + S₁`,
      `  4. Generate code (your AI tool, using O as prompt)`,
      `  5. ${pc.cyan('axis spdd guide review')}  — verify diff against Canvas`,
      '',
      pc.dim('Tip: `axis spdd guide` (no step) shows all 5 at once.'),
    ].join('\n'),
    'Canvas created'
  );
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
