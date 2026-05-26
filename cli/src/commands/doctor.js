import { outro, log, note } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs';
import { findTarget, exists, countLines, read } from '../lib/paths.js';
import { ok, fail, warn } from '../lib/ui.js';

export async function doctor(argv) {
  const target = path.resolve(argv[0] || findTarget());
  log.info(`Target: ${pc.cyan(target)}`);

  const checks = [];

  // .ai/ exists
  checks.push(check('.ai/ directory exists', exists(path.join(target, '.ai'))));

  // INSTRUCTIONS.md size
  const instr = path.join(target, '.ai', 'INSTRUCTIONS.md');
  if (exists(instr)) {
    const lines = countLines(instr);
    const inRange = lines >= 100 && lines <= 180;
    checks.push(
      check(
        `INSTRUCTIONS.md size (${lines} lines, target 100-180)`,
        inRange,
        lines < 100 ? 'too short — likely superficial' : lines > 180 ? 'too long — loses focus' : null
      )
    );
  } else {
    checks.push(check('INSTRUCTIONS.md exists', false));
  }

  // SKILL.md sizes
  const skillsDir = path.join(target, '.ai', 'skills');
  if (exists(skillsDir)) {
    const skills = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
    if (skills.length === 0) {
      checks.push(check('skills/ has at least one skill', false, 'add skills with axis spdd ...'));
    }
    for (const s of skills) {
      const p = path.join(skillsDir, s.name, 'SKILL.md');
      if (!exists(p)) {
        checks.push(check(`${s.name}/SKILL.md exists`, false));
        continue;
      }
      const lines = countLines(p);
      const okSize = lines <= 60;
      checks.push(check(`${s.name}/SKILL.md ≤ 60 lines (${lines})`, okSize, okSize ? null : 'move details to references/'));

      // description quality: pass if multi-line OR ≥ 150 chars (substantial single line)
      const head = read(p).split('---')[1] || '';
      const descLine = (head.match(/description:\s*([\s\S]*?)(?:\n[a-z_]+:|$)/) || [])[1] || '';
      const trimmed = descLine.trim();
      const descLineCount = trimmed.split('\n').length;
      const descLen = trimmed.length;
      const goodDesc = descLineCount >= 2 || descLen >= 150;
      checks.push(
        check(
          `${s.name} description quality (${descLineCount}L/${descLen}c)`,
          goodDesc,
          goodDesc ? null : 'too short — agent may ignore the skill (target: ≥2 lines or ≥150 chars)'
        )
      );
    }
  } else {
    checks.push(check('.ai/skills/ exists', false));
  }

  // STATE.md
  const stateP = path.join(target, '.ai', 'docs', 'STATE.md');
  if (exists(stateP)) {
    const lines = countLines(stateP);
    checks.push(check(`STATE.md ≤ 80 lines (${lines})`, lines <= 80, lines > 80 ? 'curate — remove resolved entries' : null));
  } else {
    checks.push(check('STATE.md exists', false, 'continuity layer missing'));
  }

  // CONVENTIONS.md
  checks.push(check('CONVENTIONS.md exists', exists(path.join(target, '.ai', 'CONVENTIONS.md'))));

  // Symlinks
  const symlinks = [
    ['AGENTS.md', '.ai/INSTRUCTIONS.md'],
    ['CLAUDE.md', '.ai/INSTRUCTIONS.md'],
  ];
  for (const [link] of symlinks) {
    const p = path.join(target, link);
    let resolves = false;
    try {
      const stat = fs.lstatSync(p);
      if (stat.isSymbolicLink()) {
        const realP = fs.realpathSync(p);
        resolves = exists(realP);
      }
    } catch {
      resolves = false;
    }
    checks.push(check(`${link} symlink resolves`, resolves));
  }

  // Settings
  const settings = path.join(target, '.claude', 'settings.json');
  if (exists(settings)) {
    try {
      const json = JSON.parse(read(settings));
      const hasAllow = Array.isArray(json?.permissions?.allow) && json.permissions.allow.length > 0;
      const hasDeny = Array.isArray(json?.permissions?.deny) && json.permissions.deny.length > 0;
      checks.push(check('.claude/settings.json has allow + deny', hasAllow && hasDeny));
    } catch (e) {
      checks.push(check('.claude/settings.json valid JSON', false, e.message));
    }
  } else {
    checks.push(check('.claude/settings.json exists', false, 'harness layer incomplete'));
  }

  // Print
  console.log();
  for (const c of checks) {
    if (c.pass) ok(c.label);
    else if (c.warn) warn(`${c.label} — ${c.detail || ''}`);
    else fail(`${c.label}${c.detail ? ' — ' + c.detail : ''}`);
  }

  const passed = checks.filter((c) => c.pass).length;
  const failed = checks.filter((c) => !c.pass).length;
  console.log();
  if (failed === 0) {
    outro(pc.green(`✓ All ${passed} checks passed. Recursiveness contract upheld.`));
  } else {
    outro(pc.yellow(`${passed} passed, ${pc.red(failed)} failed. Run \`axis init\` or fix above.`));
    process.exitCode = 1;
  }
}

function check(label, pass, detail = null) {
  return { label, pass, detail };
}
