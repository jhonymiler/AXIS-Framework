import { log } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { findTarget, exists } from '../lib/paths.js';

export async function state(argv) {
  const target = path.resolve(argv[0] || findTarget());
  const p = path.join(target, '.ai', 'docs', 'STATE.md');

  if (!exists(p)) {
    log.error(`Not found: ${pc.red(p)}\nRun \`axis init\` first.`);
    process.exit(1);
  }

  const editor = process.env.EDITOR || process.env.VISUAL || 'vi';
  log.info(`Opening ${pc.cyan(p)} in ${pc.bold(editor)}`);

  const child = spawn(editor, [p], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code || 0));
}
