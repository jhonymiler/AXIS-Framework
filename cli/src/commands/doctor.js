import { outro, log, note } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs';
import { findTarget, exists, countLines, read } from '../lib/paths.js';
import { ok, fail, warn } from '../lib/ui.js';
import { scanDupes } from './dedupe.js';

// ── Helpers for expanded doctor checks (F4A.2) ──────────────────────────────

function walkMd(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkMd(full, acc);
    else if (entry.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

const LINK_RE = /\[([^\]]+)\]\(([^)#]+?)(#[^)]*)?\)/g;

// Strip fenced code blocks (``` ... ```) so links inside example snippets are not validated.
// Inline `code` spans are kept — links inside backticks would be unusual and worth flagging.
function stripFencedCode(text) {
  return text.replace(/```[\s\S]*?```/g, (block) => '\n'.repeat((block.match(/\n/g) || []).length));
}

function validateCrossLinks(target) {
  // .ai/ files are accessed via symlinks from the repo root (CLAUDE.md, AGENTS.md, etc.),
  // so a link like `[FRAMEWORK.md](FRAMEWORK.md)` is valid from the root context even though
  // it doesn't resolve relative to the file's actual location in .ai/. Try both contexts.
  const files = walkMd(path.join(target, '.ai'));
  const broken = [];
  for (const f of files) {
    const raw = fs.readFileSync(f, 'utf8');
    const content = stripFencedCode(raw);
    let m;
    while ((m = LINK_RE.exec(content)) !== null) {
      const linkTarget = m[2];
      if (linkTarget.startsWith('http') || linkTarget.startsWith('mailto:') || linkTarget.startsWith('#')) continue;
      const fromFileDir = path.resolve(path.dirname(f), linkTarget);
      const fromRepoRoot = path.resolve(target, linkTarget);
      if (!fs.existsSync(fromFileDir) && !fs.existsSync(fromRepoRoot)) {
        broken.push({ source: f, target: linkTarget });
      }
    }
  }
  return broken;
}

function approxTokens(filepath) {
  // chars/4 is the standard quick proxy used by Anthropic docs for English markdown
  if (!fs.existsSync(filepath)) return 0;
  return Math.ceil(fs.statSync(filepath).size / 4);
}

function descriptionUniqueness(target) {
  const skillsDir = path.join(target, '.ai', 'skills');
  if (!fs.existsSync(skillsDir)) return { collisions: [], total: 0 };
  const skills = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  const seen = new Map();
  const collisions = [];
  for (const s of skills) {
    const p = path.join(skillsDir, s.name, 'SKILL.md');
    if (!fs.existsSync(p)) continue;
    const head = fs.readFileSync(p, 'utf8').split('---')[1] || '';
    const descLine = (head.match(/description:\s*([\s\S]*?)(?:\n[a-z_]+:|$)/) || [])[1] || '';
    const trimmed = descLine.trim().replace(/\s+/g, ' ').slice(0, 120);
    if (!trimmed) continue;
    if (seen.has(trimmed)) collisions.push([seen.get(trimmed), s.name]);
    else seen.set(trimmed, s.name);
  }
  return { collisions, total: seen.size };
}

function scriptHookCoherence(target) {
  const scriptsDir = path.join(target, 'scripts');
  if (!fs.existsSync(scriptsDir)) return { orphans: [], scanned: 0 };
  const scripts = fs.readdirSync(scriptsDir).filter((f) => f.endsWith('.sh'));
  const settingsPath = path.join(target, '.claude', 'settings.json');
  let settingsText = '';
  if (fs.existsSync(settingsPath)) settingsText = fs.readFileSync(settingsPath, 'utf8');
  const orphans = scripts.filter((s) => !settingsText.includes(s));
  return { orphans, scanned: scripts.length };
}

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

  // ── Expanded checks (F4A.2) ─────────────────────────────────────────────

  // Cross-link validator: every [text](*.md) in .ai/**/*.md resolves
  const broken = validateCrossLinks(target);
  if (broken.length === 0) {
    checks.push(check('cross-links in .ai/**/*.md all resolve', true));
  } else {
    checks.push(check(`cross-links in .ai/**/*.md (${broken.length} broken)`, false,
      broken.slice(0, 5).map((b) => `${path.relative(target, b.source)} → ${b.target}`).join('; ') +
      (broken.length > 5 ? ` (+${broken.length - 5} more)` : '')));
  }

  // Token approximations (chars/4 proxy). Targets are paired with the line-count gates
  // in validate-axis.sh: 100-180 lines INSTRUCTIONS, ≤60 lines SKILL.md = realistic upper
  // token budgets of ~2000 and ~1000 respectively for dense markdown.
  if (exists(instr)) {
    const t = approxTokens(instr);
    checks.push(check(`INSTRUCTIONS.md ~${t} tokens (target ≤ 2500)`, t <= 2500,
      t > 2500 ? 'over budget — agent context cost grows fast' : null));
  }
  if (exists(skillsDir)) {
    for (const s of fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
      const p = path.join(skillsDir, s.name, 'SKILL.md');
      if (!exists(p)) continue;
      const t = approxTokens(p);
      checks.push(check(`${s.name}/SKILL.md ~${t} tokens (target ≤ 1200)`, t <= 1200,
        t > 1200 ? 'over budget — move detail to references/' : null));
    }
  }

  // Skill description uniqueness (descriptions are the routing signal)
  const uniq = descriptionUniqueness(target);
  if (uniq.collisions.length === 0) {
    checks.push(check(`skill description uniqueness (${uniq.total} skills)`, true));
  } else {
    checks.push(check('skill description uniqueness', false,
      uniq.collisions.map(([a, b]) => `${a} ≈ ${b}`).join('; ') + ' — agent may pick the wrong one'));
  }

  // Script ↔ settings.json coherence (orphan scripts are flagged as WARN, not FAIL —
  // legitimate manual scripts may be intentionally unwired, but the agent should know)
  const coh = scriptHookCoherence(target);
  if (coh.scanned === 0) {
    // no scripts/ dir — skip silently
  } else if (coh.orphans.length === 0) {
    checks.push(check(`scripts/ ↔ settings.json coherence (${coh.scanned} scripts, all referenced)`, true));
  } else {
    checks.push({
      label: `scripts/ orphans (${coh.orphans.length}, not auto-run by harness)`,
      pass: false,
      warn: true,
      detail: coh.orphans.join(', ') + ' — manual scripts are fine; run `axis hooks install` if any should auto-run',
    });
  }

  // ── --strict: also run dedupe scan ─────────────────────────────────────
  const strict = argv.includes('--strict');
  if (strict) {
    const aiDir = path.join(target, '.ai');
    if (exists(aiDir)) {
      const { files: scanned, dups } = scanDupes(aiDir);
      if (dups.length === 0) {
        checks.push(check(`dedupe: no paragraph duplication in ${scanned} files`, true));
      } else {
        const detail = dups.slice(0, 3).map((d) => `"${d.sample.slice(0, 60)}…" [${d.files.size}×]`).join('; ') +
          (dups.length > 3 ? ` (+${dups.length - 3} more — run \`axis dedupe\`)` : ' — run `axis dedupe`');
        checks.push(check(`dedupe: ${dups.length} duplicated paragraph(s) in ${scanned} files`, false, detail));
      }
    }
  }

  // Print
  console.log();
  for (const c of checks) {
    if (c.pass) ok(c.label);
    else if (c.warn) warn(`${c.label} — ${c.detail || ''}`);
    else fail(`${c.label}${c.detail ? ' — ' + c.detail : ''}`);
  }

  const passed = checks.filter((c) => c.pass).length;
  const warns = checks.filter((c) => !c.pass && c.warn).length;
  const failed = checks.filter((c) => !c.pass && !c.warn).length;
  console.log();
  if (failed === 0 && warns === 0) {
    outro(pc.green(`✓ All ${passed} checks passed. Recursiveness contract upheld.`));
  } else if (failed === 0) {
    outro(pc.green(`✓ ${passed} passed`) + pc.yellow(`, ${warns} warning${warns === 1 ? '' : 's'} (advisory).`));
  } else {
    outro(pc.yellow(`${passed} passed, ${warns} warn, ${pc.red(failed)} failed. Fix the failures above.`));
    process.exitCode = 1;
  }
}

function check(label, pass, detail = null) {
  return { label, pass, detail };
}
