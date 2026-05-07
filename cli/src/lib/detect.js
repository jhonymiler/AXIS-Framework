import fs from 'node:fs';
import path from 'node:path';

const IGNORED = new Set(['.git', '.DS_Store', 'node_modules', '.idea', '.vscode', 'dist', 'build', '.next']);

const PROJECT_MARKERS = {
  software: [
    'package.json',
    'pyproject.toml',
    'setup.py',
    'requirements.txt',
    'Cargo.toml',
    'go.mod',
    'pom.xml',
    'build.gradle',
    'build.gradle.kts',
    'composer.json',
    'Gemfile',
    'mix.exs',
    'pubspec.yaml',
    'Package.swift',
    'CMakeLists.txt',
    'Makefile',
    'Dockerfile',
  ],
  // Non-software heuristics
  content: ['_config.yml', 'mkdocs.yml', 'hugo.toml', 'astro.config.mjs', 'next.config.js'],
};

/**
 * @param {string} target absolute path
 * @returns {{ state: 'empty'|'existing-software'|'existing-other'|'already-bootstrapped',
 *            stackHints: string[], topFiles: string[] }}
 */
export function detectProject(target) {
  if (fs.existsSync(path.join(target, '.ai', 'INSTRUCTIONS.md'))) {
    return { state: 'already-bootstrapped', stackHints: [], topFiles: [] };
  }

  let entries;
  try {
    entries = fs.readdirSync(target).filter((e) => !IGNORED.has(e));
  } catch {
    return { state: 'empty', stackHints: [], topFiles: [] };
  }

  if (entries.length === 0) {
    return { state: 'empty', stackHints: [], topFiles: [] };
  }

  const stackHints = [];
  for (const marker of PROJECT_MARKERS.software) {
    if (fs.existsSync(path.join(target, marker))) {
      stackHints.push(marker);
    }
  }

  const topFiles = entries.slice(0, 12);

  if (stackHints.length > 0) {
    return { state: 'existing-software', stackHints, topFiles };
  }

  // Has files but no software markers — might be content/research/business
  if (entries.length > 0) {
    return { state: 'existing-other', stackHints: [], topFiles };
  }

  return { state: 'empty', stackHints: [], topFiles: [] };
}
