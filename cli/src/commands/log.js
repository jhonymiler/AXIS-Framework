// axis log — append/analyze telemetry events in .ai/telemetry.jsonl
//
// Usage:
//   axis log <event> [--meta k=v ...]
//   axis log analyze [--last N] [--since ISO]
//
// Telemetry is local-only (.gitignored). Schema per line:
//   { "ts": "ISO8601", "event": "string", "branch": "string|null", "meta": {...} }
//
// Common events:
//   skill:loaded         meta: name=<skill>
//   rule:cited           meta: name=<rule>
//   hook:fired           meta: name=<hook>
//   spec:edit            meta: file=<path>
//   confidence:uncertain meta: topic=<short>
//
// `analyze` reports counts grouped by event + meta.name and per-file edit churn.

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import pc from 'picocolors';

const LOG_PATH = path.join(process.cwd(), '.ai', 'telemetry.jsonl');

function currentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
  } catch { return null; }
}

function parseMeta(args) {
  const meta = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--meta' && args[i + 1]) {
      const [k, ...rest] = args[i + 1].split('=');
      if (k && rest.length) meta[k] = rest.join('=');
      i++;
    }
  }
  return meta;
}

function append(event, meta) {
  if (!fs.existsSync(path.dirname(LOG_PATH))) {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  }
  const line = JSON.stringify({ ts: new Date().toISOString(), event, branch: currentBranch(), meta });
  fs.appendFileSync(LOG_PATH, line + '\n');
}

function loadEvents({ last = null, since = null } = {}) {
  if (!fs.existsSync(LOG_PATH)) return [];
  let lines = fs.readFileSync(LOG_PATH, 'utf8').split('\n').filter(Boolean);
  if (since) lines = lines.filter(l => {
    try { return JSON.parse(l).ts >= since; } catch { return false; }
  });
  if (last) lines = lines.slice(-last);
  return lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function analyze(args) {
  const last = args.includes('--last') ? Number(args[args.indexOf('--last') + 1]) : null;
  const since = args.includes('--since') ? args[args.indexOf('--since') + 1] : null;
  const events = loadEvents({ last, since });
  if (events.length === 0) {
    console.log(pc.dim('No telemetry yet. Emit events with: axis log <event> [--meta k=v]'));
    return;
  }
  const byEvent = {};
  const byEventName = {};   // event:meta.name → count
  const byFile = {};         // spec:edit file path → count
  for (const e of events) {
    byEvent[e.event] = (byEvent[e.event] || 0) + 1;
    const named = e.meta?.name;
    if (named) {
      const key = `${e.event}:${named}`;
      byEventName[key] = (byEventName[key] || 0) + 1;
    }
    if (e.event === 'spec:edit' && e.meta?.file) {
      byFile[e.meta.file] = (byFile[e.meta.file] || 0) + 1;
    }
  }
  const span = events.length > 1
    ? `${events[0].ts} → ${events[events.length - 1].ts}`
    : events[0].ts;
  console.log(pc.bold(`\nAXIS telemetry — ${events.length} events`));
  console.log(pc.dim(span));
  console.log(pc.bold('\nBy event:'));
  for (const [k, v] of Object.entries(byEvent).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(24)} ${v}`);
  }
  if (Object.keys(byEventName).length) {
    console.log(pc.bold('\nBy event:name (top 10):'));
    for (const [k, v] of Object.entries(byEventName).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
      console.log(`  ${k.padEnd(40)} ${v}`);
    }
  }
  if (Object.keys(byFile).length) {
    console.log(pc.bold('\nSpec-edit churn (top 10):'));
    for (const [k, v] of Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
      console.log(`  ${k.padEnd(48)} ${v}`);
    }
  }
  console.log();
}

export async function logCmd(args) {
  if (!args.length) {
    console.log(pc.red('Usage: axis log <event> [--meta k=v]  |  axis log analyze [--last N] [--since ISO]'));
    process.exit(1);
  }
  if (args[0] === 'analyze') return analyze(args.slice(1));
  const event = args[0];
  const meta = parseMeta(args.slice(1));
  append(event, meta);
  console.log(pc.green(`✓ logged ${event}`) + (Object.keys(meta).length ? ` ${pc.dim(JSON.stringify(meta))}` : ''));
}
