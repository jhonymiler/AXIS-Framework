#!/usr/bin/env node
import { intro, outro, log } from '@clack/prompts';
import pc from 'picocolors';
import { init } from './commands/init.js';
import { doctor } from './commands/doctor.js';
import { link } from './commands/link.js';
import { audit } from './commands/audit.js';
import { state } from './commands/state.js';
import { spdd } from './commands/spdd.js';
import { cleanup } from './commands/cleanup.js';

const VERSION = '0.1.0';

const BANNER = `
${pc.cyan('  █████╗ ██╗  ██╗██╗███████╗')}
${pc.cyan(' ██╔══██╗╚██╗██╔╝██║██╔════╝')}
${pc.cyan(' ███████║ ╚███╔╝ ██║███████╗')}
${pc.cyan(' ██╔══██║ ██╔██╗ ██║╚════██║')}
${pc.cyan(' ██║  ██║██╔╝ ██╗██║███████║')}
${pc.cyan(' ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝')}
${pc.dim('  Harness · Spec · Memory · v' + VERSION)}
`;

const HELP = `
${pc.bold('axis')} ${pc.dim('— Harness-first AI project framework')}

${pc.bold('Usage:')}
  ${pc.cyan('axis')} ${pc.yellow('<command>')} ${pc.dim('[options]')}

${pc.bold('Commands:')}
  ${pc.yellow('init')}              Bootstrap (auto-detects new vs existing project, asks PT/EN)
  ${pc.yellow('audit')}             Audit existing project for AXIS gaps
  ${pc.yellow('doctor')}            Validate limits, symlinks, and recursiveness contract
  ${pc.yellow('link')}              Run setup-ide-links.sh (idempotent symlink installer)
  ${pc.yellow('state')}             Open .ai/docs/STATE.md in $EDITOR
  ${pc.yellow('spdd')} <step>       Run SPDD pipeline step (story | align | design | canvas | review | sync)
  ${pc.yellow('cleanup')}           Remove the axis-bootstrap meta-skill after AI-driven init completes
  ${pc.yellow('help')}              Show this help
  ${pc.yellow('version')}           Print version

${pc.bold('SPDD pipeline:')}
  ${pc.cyan('axis spdd story')}     Decompose requirement → INVEST stories ${pc.dim('(fills R)')}
  ${pc.cyan('axis spdd align')}     Lock O scope, Norms, Safeguards         ${pc.dim('(fills O + N + S₂)')}
  ${pc.cyan('axis spdd design')}    Entities, Approach, System structure    ${pc.dim('(fills E + A + S₁)')}
  ${pc.cyan('axis spdd canvas')}    Scaffold a new REASONS Canvas
  ${pc.cyan('axis spdd review')}    Iterative review (Track A or B)
  ${pc.cyan('axis spdd sync')}      Sync Canvas ⇄ code after refactor

${pc.bold('Examples:')}
  ${pc.dim('$')} axis init
  ${pc.dim('$')} axis doctor
  ${pc.dim('$')} axis spdd canvas pricing-quote
  ${pc.dim('$')} axis audit ./my-project

${pc.dim('Docs:')} ${pc.underline('https://github.com/axis-framework')}
`;

const args = process.argv.slice(2);
const cmd = args[0];

async function main() {
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    console.log(BANNER);
    console.log(HELP);
    return;
  }
  if (cmd === 'version' || cmd === '--version' || cmd === '-v') {
    console.log(VERSION);
    return;
  }

  console.log(BANNER);

  const rest = args.slice(1);
  switch (cmd) {
    case 'init':
      intro(pc.bgCyan(pc.black(' axis init ')));
      await init(rest);
      outro(pc.green('done'));
      break;
    case 'audit':
      intro(pc.bgYellow(pc.black(' axis audit ')));
      await audit(rest);
      break;
    case 'doctor':
      intro(pc.bgGreen(pc.black(' axis doctor ')));
      await doctor(rest);
      break;
    case 'link':
      intro(pc.bgMagenta(pc.black(' axis link ')));
      await link(rest);
      break;
    case 'state':
      await state(rest);
      break;
    case 'spdd':
      await spdd(rest);
      break;
    case 'cleanup':
      await cleanup(rest);
      break;
    default:
      log.error(`Unknown command: ${pc.red(cmd)}`);
      console.log(HELP);
      process.exit(1);
  }
}

main().catch((err) => {
  log.error(pc.red(err.message));
  if (process.env.AXIS_DEBUG) console.error(err.stack);
  process.exit(1);
});
