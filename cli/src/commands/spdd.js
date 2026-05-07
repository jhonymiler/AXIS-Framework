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
