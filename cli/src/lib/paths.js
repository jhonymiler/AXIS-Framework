import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CLI_ROOT = path.resolve(__dirname, '..', '..');
export const TEMPLATES = path.join(CLI_ROOT, 'templates');

/** AXIS framework repo (where this CLI lives — for fallback templates). */
export const FRAMEWORK_ROOT = path.resolve(CLI_ROOT, '..');

/** Look up the target project from CWD upward (where .ai/ exists or will be created). */
export function findTarget(start = process.cwd()) {
  let dir = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(dir, '.ai'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start); // not found, default to cwd
    dir = parent;
  }
}

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

export function exists(p) {
  return fs.existsSync(p);
}

export function read(p) {
  return fs.readFileSync(p, 'utf8');
}

export function write(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content);
}

export function countLines(p) {
  if (!exists(p)) return 0;
  return read(p).split('\n').length;
}
