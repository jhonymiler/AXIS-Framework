import { log } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { findTarget, exists } from '../lib/paths.js';

const HOT_SECTIONS = ['Active Decisions', 'In Progress', 'Blockers'];

function statePath(argv) {
  const target = path.resolve(argv[0] || findTarget());
  return path.join(target, '.ai', 'docs', 'STATE.md');
}

function extractSections(content, names) {
  const lines = content.split('\n');
  const out = [];
  const wanted = new Set(names);
  let capture = false;
  for (const line of lines) {
    const h = line.match(/^## (.+)$/);
    if (h) {
      capture = wanted.has(h[1].trim());
      if (capture) out.push(line);
      continue;
    }
    if (capture) out.push(line);
  }
  return out.join('\n').trim();
}

function archivePath(target) {
  const d = new Date();
  const stamp = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  return path.join(target, '.ai', 'docs', 'archive', `STATE-${stamp}.md`);
}

export async function state(argv) {
  const sub = argv[0];

  if (sub === 'hot') {
    const p = statePath(argv.slice(1));
    if (!exists(p)) {
      log.error(`Not found: ${pc.red(p)}`);
      process.exit(1);
    }
    const hot = extractSections(fs.readFileSync(p, 'utf8'), HOT_SECTIONS);
    process.stdout.write(hot ? hot + '\n' : '(empty hot tier)\n');
    return;
  }

  if (sub === 'archive') {
    const needle = argv[1];
    if (!needle) {
      log.error('Usage: axis state archive <substring of decision line>');
      process.exit(1);
    }
    const target = path.resolve(findTarget());
    const p = path.join(target, '.ai', 'docs', 'STATE.md');
    if (!exists(p)) {
      log.error(`Not found: ${pc.red(p)}`);
      process.exit(1);
    }
    const content = fs.readFileSync(p, 'utf8');
    const lines = content.split('\n');
    let inDecisions = false;
    const moved = [];
    const kept = [];
    for (const line of lines) {
      const h = line.match(/^## (.+)$/);
      if (h) {
        inDecisions = h[1].trim() === 'Active Decisions';
        kept.push(line);
        continue;
      }
      if (inDecisions && line.startsWith('- ') && line.includes(needle)) {
        moved.push(line);
        continue;
      }
      kept.push(line);
    }
    if (moved.length === 0) {
      log.warn(`No Active Decision line matched: ${pc.yellow(needle)}`);
      process.exit(1);
    }
    const archive = archivePath(target);
    fs.mkdirSync(path.dirname(archive), { recursive: true });
    const header = exists(archive) ? '' : `# STATE archive\n\n> Cold-tier decisions moved out of the hot playbook. Append-only.\n\n`;
    fs.appendFileSync(archive, header + moved.join('\n') + '\n');
    fs.writeFileSync(p, kept.join('\n'));
    log.success(`Archived ${moved.length} decision line(s) → ${pc.cyan(path.relative(target, archive))}`);
    return;
  }

  // Default: open in editor
  const p = statePath(argv);
  if (!exists(p)) {
    log.error(`Not found: ${pc.red(p)}\nRun \`axis init\` first.`);
    process.exit(1);
  }

  const editor = process.env.EDITOR || process.env.VISUAL || 'vi';
  log.info(`Opening ${pc.cyan(p)} in ${pc.bold(editor)}`);

  const child = spawn(editor, [p], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code || 0));
}
