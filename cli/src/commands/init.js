import { text, multiselect, select, confirm, spinner, note, log, isCancel, cancel } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { TEMPLATES, exists, read, write, ensureDir } from '../lib/paths.js';
import { detectLocale, t } from '../lib/i18n.js';
import { detectProject } from '../lib/detect.js';
import { copyDir } from '../lib/copy.js';

const IDES = [
  { value: 'claude', label: 'Claude Code', hint: '.claude/' },
  { value: 'cursor', label: 'Cursor', hint: '.cursor/' },
  { value: 'agents', label: 'Generic agents (Windsurf, etc.)', hint: '.agents/' },
  { value: 'github', label: 'GitHub Copilot', hint: '.github/' },
];

const SPDD_SKILLS = [
  { value: 'story-decompose', label: 'story-decompose', hint: 'fills R' },
  { value: 'alignment', label: 'alignment', hint: 'fills O + N + S₂' },
  { value: 'abstraction-first', label: 'abstraction-first', hint: 'fills E + A + S₁' },
  { value: 'iterative-review', label: 'iterative-review', hint: 'Track A/B' },
];

export async function init(argv) {
  const target = path.resolve(argv[0] || process.cwd());

  // 1. Pick language (auto-detect, ask once)
  const detected = detectLocale();
  let locale = detected;
  const langChoice = await select({
    message: t(detected, 'pickLang'),
    options: [
      { value: 'en', label: t(detected, 'langEN') },
      { value: 'pt', label: t(detected, 'langPT') },
    ],
    initialValue: detected,
  });
  if (isCancel(langChoice)) return cancel(t(detected, 'aborted'));
  locale = langChoice;
  const T = (k) => t(locale, k);

  // 2. Detect project state
  const detection = detectProject(target);
  log.info(`${T('target')}: ${pc.cyan(target)}`);

  if (detection.state === 'already-bootstrapped') {
    log.warn(T('detectedAlreadyBootstrapped'));
    const cont = await confirm({ message: T('overwrite'), initialValue: false });
    if (isCancel(cont) || !cont) return cancel(T('abortedAlready'));
  }

  if (detection.state === 'existing-software' || detection.state === 'existing-other') {
    const lines = [pc.bold(T('detectedExisting'))];
    if (detection.stackHints.length) {
      lines.push('', pc.dim(`Markers: ${detection.stackHints.join(', ')}`));
    }
    if (detection.topFiles.length) {
      lines.push(pc.dim(`Top files: ${detection.topFiles.slice(0, 8).join(', ')}`));
    }
    note(lines.join('\n'), T('bootstrapPlan'));
  } else {
    note(T('detectedEmpty'), T('bootstrapPlan'));
  }

  // 3. Pick mode (default: AI for existing projects, quick for empty)
  const defaultMode = detection.state === 'empty' ? 'quick' : 'ai';
  const mode = await select({
    message: T('pickMode'),
    options: [
      { value: 'ai', label: T('modeAI') },
      { value: 'quick', label: T('modeQuick') },
      { value: 'audit', label: T('modeAudit') },
    ],
    initialValue: defaultMode,
  });
  if (isCancel(mode)) return cancel(T('aborted'));

  if (mode === 'audit') {
    const { audit } = await import('./audit.js');
    return audit([target]);
  }

  if (mode === 'ai') {
    return aiBootstrap(target, locale);
  }

  return quickBootstrap(target, locale);
}

/**
 * AI-driven path: copy axis-bootstrap skill bundle, print trigger phrase.
 * The agent does the real discovery + generation.
 */
async function aiBootstrap(target, locale) {
  const T = (k) => t(locale, k);

  const s = spinner();
  s.start(T('aiInstalling'));

  // Create minimal scaffolding so the agent has a place to put .ai/
  ensureDir(path.join(target, '.ai', 'skills'));
  ensureDir(path.join(target, '.ai', 'docs'));

  // Copy bootstrap skill bundle
  copyDir(path.join(TEMPLATES, 'bootstrap-skill'), path.join(target, '.ai', 'skills', 'axis-bootstrap'));

  // Drop minimal CLAUDE.md / AGENTS.md pointing the agent to the skill
  const stub = stubInstructions(locale);
  if (!exists(path.join(target, '.ai', 'INSTRUCTIONS.md'))) {
    write(path.join(target, '.ai', 'INSTRUCTIONS.md'), stub);
  }
  // Root entry points (actual files for now — symlinks come after Phase 3 of the bootstrap)
  if (!exists(path.join(target, 'CLAUDE.md'))) {
    write(path.join(target, 'CLAUDE.md'), stub);
  }
  if (!exists(path.join(target, 'AGENTS.md'))) {
    write(path.join(target, 'AGENTS.md'), stub);
  }

  s.stop(pc.green('✓ ' + T('aiInstalling').replace('…', ' ' + T('done'))));

  note(
    [
      pc.bold(T('aiOpenAgent')),
      '',
      pc.bold(T('aiTrigger')),
      '',
      pc.cyan('  ' + T('aiTriggerText')),
      '',
      pc.bold(T('aiCleanup')),
    ].join('\n'),
    T('aiNextSteps')
  );
}

function stubInstructions(locale) {
  if (locale === 'pt') {
    return `# Instruções para o Agente — Bootstrap pendente

> Este projeto está usando o **AXIS Framework**. O scaffold mínimo já existe; o trabalho real (gerar skills, rules, docs customizados) cabe a você, agente de IA.

## Sua tarefa agora

1. Carregue a skill em [.ai/skills/axis-bootstrap/SKILL.md](.ai/skills/axis-bootstrap/SKILL.md)
2. Siga o [PLANNER.md](.ai/skills/axis-bootstrap/PLANNER.md) na ordem
3. **Antes de qualquer pergunta:** leia README, package.json (ou equivalente), e estrutura de arquivos do projeto
4. Pause e peça confirmação entre cada Phase

## Após terminar a Phase 5

Avise o usuário para rodar \`axis cleanup\` — isso remove a skill axis-bootstrap (já cumpriu seu papel) e deixa o projeto autossuficiente.

## Regras invioláveis

- Nunca invente: se faltar informação, pergunte
- Nunca pule fases: cada uma tem gate explícito
- Nunca duplique conteúdo entre arquivos: use links e symlinks
`;
  }
  return `# Agent Instructions — Bootstrap pending

> This project is using the **AXIS Framework**. Minimal scaffolding is in place; the real work (generating customized skills, rules, docs) is your job, AI agent.

## Your task now

1. Load the skill at [.ai/skills/axis-bootstrap/SKILL.md](.ai/skills/axis-bootstrap/SKILL.md)
2. Follow [PLANNER.md](.ai/skills/axis-bootstrap/PLANNER.md) in order
3. **Before any question:** read the README, package.json (or equivalent), and the project file tree
4. Pause for explicit confirmation between phases

## After Phase 5 completes

Tell the user to run \`axis cleanup\` — it removes the axis-bootstrap skill (it has done its job) and leaves the project self-sufficient.

## Inviolable rules

- Never fabricate: if information is missing, ask
- Never skip phases: each has an explicit gate
- Never duplicate content across files: use links and symlinks
`;
}

/**
 * Quick path: interactive scaffold without AI.
 * Good for new projects where the user already knows the stack.
 */
async function quickBootstrap(target, locale) {
  const T = (k) => t(locale, k);

  const name = await text({
    message: T('askName'),
    placeholder: path.basename(target),
    defaultValue: path.basename(target),
  });
  if (isCancel(name)) return cancel(T('aborted'));

  const purpose = await text({
    message: T('askPurpose'),
    placeholder: T('askPurposeHint'),
    validate: (v) => (v && v.length > 5 ? undefined : T('askPurposeShort')),
  });
  if (isCancel(purpose)) return cancel(T('aborted'));

  const stack = await text({
    message: T('askStack'),
    placeholder: T('askStackHint'),
    defaultValue: '',
  });
  if (isCancel(stack)) return cancel(T('aborted'));

  const ides = await multiselect({
    message: T('askIDEs'),
    options: IDES,
    initialValues: ['claude', 'agents'],
    required: true,
  });
  if (isCancel(ides)) return cancel(T('aborted'));

  const spddSkills = await multiselect({
    message: T('askSpdd') + ' ' + pc.dim('— ' + T('askSpddHint')),
    options: SPDD_SKILLS,
    initialValues: SPDD_SKILLS.map((s) => s.value),
    required: false,
  });
  if (isCancel(spddSkills)) return cancel(T('aborted'));

  const s = spinner();
  s.start(T('quickScaffolding'));

  ensureDir(path.join(target, '.ai', 'skills'));
  ensureDir(path.join(target, '.ai', 'rules'));
  ensureDir(path.join(target, '.ai', 'docs', 'canvases', 'done'));

  const replace = (content) =>
    content
      .replace(/{{PROJECT_NAME}}/g, name)
      .replace(/{{PROJECT_PURPOSE}}/g, purpose)
      .replace(/{{STACK}}/g, stack || (locale === 'pt' ? '(não-software)' : '(non-software)'));

  write(path.join(target, '.ai', 'INSTRUCTIONS.md'), replace(read(path.join(TEMPLATES, 'INSTRUCTIONS.md'))));
  write(path.join(target, '.ai', 'CONVENTIONS.md'), replace(read(path.join(TEMPLATES, 'CONVENTIONS.md'))));
  write(path.join(target, '.ai', 'docs', 'STATE.md'), replace(read(path.join(TEMPLATES, 'STATE.md'))));
  s.message(T('quickSpecReady'));

  // SPDD skills
  for (const skill of spddSkills) {
    const skillDir = path.join(target, '.ai', 'skills', skill);
    ensureDir(skillDir);
    const src = path.join(TEMPLATES, 'skills', `${skill}.md`);
    if (exists(src)) {
      fs.copyFileSync(src, path.join(skillDir, 'SKILL.md'));
    }
  }

  // Harness
  if (ides.includes('claude')) {
    ensureDir(path.join(target, '.claude'));
    write(path.join(target, '.claude', 'settings.json'), read(path.join(TEMPLATES, 'settings.json')));
  }
  s.message(T('quickHarnessReady'));

  // setup-ide-links.sh
  write(path.join(target, 'setup-ide-links.sh'), read(path.join(TEMPLATES, 'setup-ide-links.sh')));
  fs.chmodSync(path.join(target, 'setup-ide-links.sh'), 0o755);
  s.message(T('quickInstallerReady'));

  try {
    execSync('bash setup-ide-links.sh', { cwd: target, stdio: 'pipe' });
    s.stop(T('quickSymlinksInstalled'));
  } catch {
    s.stop(T('quickDoneScaffolding'));
    log.warn(T('quickRunLink'));
  }

  const created = [
    '.ai/INSTRUCTIONS.md',
    '.ai/CONVENTIONS.md',
    '.ai/docs/STATE.md',
    `.ai/skills/ (${spddSkills.length} SPDD)`,
    'setup-ide-links.sh',
    ...(ides.includes('claude') ? ['.claude/settings.json'] : []),
    'AGENTS.md → .ai/INSTRUCTIONS.md',
    'CLAUDE.md → .ai/INSTRUCTIONS.md',
  ];
  note(created.map((c) => pc.green('+ ') + c).join('\n'), T('quickCreated'));

  note(
    [
      `${pc.bold('1.')} ${T('quickNext1')}`,
      `${pc.bold('2.')} ${T('quickNext2')}`,
      `${pc.bold('3.')} ${T('quickNext3')}`,
      `${pc.bold('4.')} ${T('quickNext4')}`,
    ].join('\n'),
    locale === 'pt' ? 'Próximos passos' : 'Next steps'
  );
}
