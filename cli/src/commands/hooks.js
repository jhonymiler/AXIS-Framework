import { intro, outro, confirm, log, note, isCancel, cancel } from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs';

// Filename → hook mapping (matches PHASE-3-HARNESS.md Step 1.5).
// Patterns intentionally narrow — only canonical safety/format/test hook names match.
// Project-specific validators (e.g., validate-axis.sh) stay as orphans, requiring
// manual wiring after the agent decides where they fit.
const HOOK_RULES = [
  { regex: /^post-spec-edit.*\.sh$/, hook: 'PostToolUse', matcher: 'Edit(.ai/**)' },
  { regex: /^format-.*\.sh$|^lint-.*\.sh$/, hook: 'PostToolUse', matcher: 'Edit|Write' },
  { regex: /^validate-bash\.sh$|^guard-.*\.sh$/, hook: 'PreToolUse', matcher: 'Bash' },
  { regex: /^run-tests.*\.sh$|^test-on-stop.*\.sh$/, hook: 'Stop', matcher: null },
  { regex: /^session-start.*\.sh$/, hook: 'SessionStart', matcher: null },
  { regex: /^stop-.*\.sh$/, hook: 'Stop', matcher: null },
];

function classify(filename) {
  for (const rule of HOOK_RULES) {
    if (rule.regex.test(filename)) return { hook: rule.hook, matcher: rule.matcher };
  }
  return null;
}

function isHookWired(settings, hookName, command) {
  const arr = settings.hooks?.[hookName];
  if (!Array.isArray(arr)) return false;
  for (const block of arr) {
    if (Array.isArray(block.hooks)) {
      for (const h of block.hooks) {
        if (h.command && h.command.includes(command)) return true;
      }
    }
  }
  return false;
}

function wireHook(settings, hookName, matcher, command) {
  if (!settings.hooks) settings.hooks = {};
  if (!Array.isArray(settings.hooks[hookName])) settings.hooks[hookName] = [];
  const block = matcher
    ? { matcher, hooks: [{ type: 'command', command }] }
    : { hooks: [{ type: 'command', command }] };
  settings.hooks[hookName].push(block);
}

export async function hooks(argv) {
  const sub = argv[0];

  if (!sub || sub === 'help' || sub === '--help') {
    console.log(pc.bold('axis hooks install') + pc.dim(' — wire detected scripts/*.sh into .claude/settings.json'));
    console.log('');
    console.log(pc.bold('Usage:'));
    console.log('  ' + pc.cyan('axis hooks install') + pc.dim('  [--dry-run]'));
    console.log('');
    console.log(pc.bold('Detected mapping (filename → hook):'));
    console.log('  format-*.sh, lint-*.sh         → PostToolUse (Edit|Write)');
    console.log('  validate-*.sh, guard-*.sh      → PreToolUse (Bash)');
    console.log('  run-tests-*.sh, test-on-stop*.sh → Stop');
    console.log('  session-*.sh                   → SessionStart');
    console.log('  post-spec-edit*.sh             → PostToolUse Edit(.ai/**)');
    console.log('  stop-*.sh                      → Stop');
    return;
  }

  if (sub !== 'install') {
    log.error(`Unknown subcommand: ${pc.red(sub)}. Try ${pc.cyan('axis hooks install')}.`);
    process.exit(1);
  }

  const flags = argv.slice(1).reduce((acc, a) => (a.startsWith('--') ? { ...acc, [a.slice(2)]: true } : acc), {});
  const target = path.resolve(process.cwd());
  const scriptsDir = path.join(target, 'scripts');
  const settingsPath = path.join(target, '.claude', 'settings.json');

  intro(pc.bgCyan(pc.black(' axis hooks install ')));

  if (!fs.existsSync(scriptsDir)) {
    log.warn(`No ${pc.cyan('scripts/')} directory found in ${pc.dim(target)} — nothing to wire.`);
    outro(pc.dim('done'));
    return;
  }

  const files = fs.readdirSync(scriptsDir).filter((f) => f.endsWith('.sh'));
  if (files.length === 0) {
    log.info(`${pc.cyan('scripts/')} is empty — nothing to wire.`);
    outro(pc.dim('done'));
    return;
  }

  // Load existing settings (or create scaffold)
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      log.error(`Could not parse ${pc.cyan('.claude/settings.json')}: ${e.message}`);
      process.exit(1);
    }
  } else {
    log.info(`${pc.cyan('.claude/settings.json')} not found — will create it.`);
  }

  // Build the plan
  const plan = [];
  for (const f of files) {
    const classification = classify(f);
    const command = `bash scripts/${f}`;
    if (!classification) {
      plan.push({ file: f, action: 'skip', reason: 'no filename pattern matched' });
      continue;
    }
    if (isHookWired(settings, classification.hook, command)) {
      plan.push({ file: f, action: 'already-wired', hook: classification.hook });
      continue;
    }
    plan.push({ file: f, action: 'wire', hook: classification.hook, matcher: classification.matcher, command });
  }

  const lines = plan.map((p) => {
    if (p.action === 'wire') {
      return pc.green('  + ') + pc.bold(p.file) + pc.dim(` → ${p.hook}${p.matcher ? ` (${p.matcher})` : ''}`);
    }
    if (p.action === 'already-wired') {
      return pc.dim('  · ') + p.file + pc.dim(` → ${p.hook} (already wired)`);
    }
    return pc.yellow('  ! ') + p.file + pc.dim(` — ${p.reason}`);
  });
  note(lines.join('\n'), pc.bold(`Plan (${plan.length} scripts)`));

  const wireCount = plan.filter((p) => p.action === 'wire').length;
  if (wireCount === 0) {
    log.success(pc.green('Nothing to do — all scripts already wired (or unrecognized).'));
    outro(pc.dim('done'));
    return;
  }

  if (flags['dry-run']) {
    log.info(pc.dim(`--dry-run: ${wireCount} hook(s) would be added; not writing.`));
    outro(pc.dim('done'));
    return;
  }

  const ok = await confirm({ message: `Wire ${wireCount} new hook(s) into .claude/settings.json?`, initialValue: true });
  if (isCancel(ok) || !ok) {
    cancel('aborted');
    return;
  }

  // Backup
  if (fs.existsSync(settingsPath)) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];
    const bak = `${settingsPath}.axis-bak-${ts}`;
    fs.copyFileSync(settingsPath, bak);
    log.info(pc.dim(`Backed up settings → ${path.relative(target, bak)}`));
  } else {
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  }

  // Apply
  for (const p of plan) {
    if (p.action === 'wire') wireHook(settings, p.hook, p.matcher, p.command);
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  log.success(`${pc.green('✓')} Wired ${wireCount} hook(s) into ${pc.cyan('.claude/settings.json')}`);
  outro(pc.green('done'));
}
