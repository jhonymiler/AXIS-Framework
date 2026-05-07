import { outro, note, log } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import { findTarget, exists } from '../lib/paths.js';

export async function audit(argv) {
  const target = path.resolve(argv[0] || findTarget());
  log.info(`Target: ${pc.cyan(target)}`);

  const layers = {
    Spec: [
      ['.ai/INSTRUCTIONS.md', 'Entry point for AI'],
      ['.ai/skills/', 'Domain skills'],
      ['.ai/rules/', 'Behavior rules (optional)'],
      ['.ai/docs/', 'Reference docs (architecture, schema, glossary)'],
    ],
    Harness: [
      ['.claude/settings.json', 'Versioned permissions/hooks'],
      ['setup-ide-links.sh', 'Idempotent symlink installer'],
      ['AGENTS.md', 'Symlink to INSTRUCTIONS'],
      ['CLAUDE.md', 'Symlink to INSTRUCTIONS'],
    ],
    Memory: [
      ['.ai/CONVENTIONS.md', 'Maintenance protocol'],
      ['.ai/docs/STATE.md', 'Curated playbook'],
      ['.ai/docs/canvases/', 'REASONS Canvases (per feature)'],
    ],
  };

  for (const [layer, items] of Object.entries(layers)) {
    const lines = items.map(([file, purpose]) => {
      const p = path.join(target, file);
      const ok = exists(p);
      return `${ok ? pc.green('✓') : pc.red('✗')} ${pc.bold(file.padEnd(28))} ${pc.dim(purpose)}`;
    });
    note(lines.join('\n'), `${layer} Layer`);
  }

  const missing = Object.values(layers)
    .flat()
    .filter(([file]) => !exists(path.join(target, file)));

  if (missing.length === 0) {
    outro(pc.green('✓ All AXIS layers present.'));
  } else {
    outro(
      pc.yellow(
        `${missing.length} item(s) missing. Run ${pc.cyan('axis init')} to scaffold, or fix individually.`
      )
    );
    process.exitCode = 1;
  }
}
