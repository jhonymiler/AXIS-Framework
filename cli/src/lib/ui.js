import pc from 'picocolors';
import { log } from '@clack/prompts';

export const ok = (msg) => log.success(pc.green('✓ ') + msg);
export const fail = (msg) => log.error(pc.red('✗ ') + msg);
export const warn = (msg) => log.warn(pc.yellow('! ') + msg);
export const info = (msg) => log.info(pc.cyan('· ') + msg);

export function tag(label, color = 'cyan') {
  return pc[color](`[${label}]`);
}

export function box(title, lines) {
  const width = Math.max(title.length, ...lines.map((l) => stripAnsi(l).length)) + 4;
  const top = '╭' + '─'.repeat(width - 2) + '╮';
  const bot = '╰' + '─'.repeat(width - 2) + '╯';
  console.log(pc.dim(top));
  console.log(pc.dim('│ ') + pc.bold(title) + ' '.repeat(width - 4 - title.length) + pc.dim(' │'));
  console.log(pc.dim('│' + ' '.repeat(width - 2) + '│'));
  for (const l of lines) {
    const pad = width - 4 - stripAnsi(l).length;
    console.log(pc.dim('│ ') + l + ' '.repeat(Math.max(0, pad)) + pc.dim(' │'));
  }
  console.log(pc.dim(bot));
}

function stripAnsi(s) {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}
