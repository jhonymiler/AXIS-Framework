import { confirm, intro, outro, isCancel, cancel, log, note } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import { findTarget, exists } from '../lib/paths.js';
import { rmDir } from '../lib/copy.js';
import { detectLocale, t } from '../lib/i18n.js';

export async function cleanup(argv) {
  const target = path.resolve(argv[0] || findTarget());
  const locale = detectLocale();
  const T = (k) => t(locale, k);

  intro(pc.bgRed(pc.white(' axis cleanup ')));

  const skill = path.join(target, '.ai', 'skills', 'axis-bootstrap');
  if (!exists(skill)) {
    log.info(T('cleanupNotFound'));
    return outro(pc.dim(T('done')));
  }

  note(
    [
      pc.dim(T('target') + ': ' + target),
      '',
      pc.bold(pc.red('Will remove:')),
      `  ${pc.red('-')} .ai/skills/axis-bootstrap/`,
      '',
      pc.bold(pc.green('Will keep:')),
      `  ${pc.green('+')} .ai/INSTRUCTIONS.md, CONVENTIONS.md`,
      `  ${pc.green('+')} .ai/skills/* (your generated skills)`,
      `  ${pc.green('+')} .ai/rules/, .ai/docs/, STATE.md`,
      `  ${pc.green('+')} .claude/settings.json, symlinks`,
    ].join('\n'),
    'Cleanup plan'
  );

  const ok = await confirm({ message: T('cleanupConfirm'), initialValue: true });
  if (isCancel(ok) || !ok) return cancel(T('cleanupAborted'));

  rmDir(skill);
  outro(pc.green('✓ ' + T('cleanupRemoved')));
}
