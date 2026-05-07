import { spinner, outro, log } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { findTarget, exists, read, write } from '../lib/paths.js';
import { TEMPLATES } from '../lib/paths.js';
import fs from 'node:fs';

export async function link(argv) {
  const target = path.resolve(argv[0] || findTarget());
  const script = path.join(target, 'setup-ide-links.sh');

  if (!exists(script)) {
    log.warn('setup-ide-links.sh not found — installing from template.');
    write(script, read(path.join(TEMPLATES, 'setup-ide-links.sh')));
    fs.chmodSync(script, 0o755);
  }

  const s = spinner();
  s.start('Running setup-ide-links.sh');
  try {
    const out = execSync('bash setup-ide-links.sh', { cwd: target }).toString();
    s.stop('Symlinks installed');
    if (out.trim()) console.log(pc.dim(out.trim()));
    outro(pc.green('✓ done'));
  } catch (e) {
    s.stop('Failed');
    log.error(e.message);
    process.exit(1);
  }
}
