import pc from 'picocolors';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Minimum paragraph length (chars) to consider for duplication.
// Below this, false-positive rate explodes (boilerplate sentences, headings).
const MIN_CHARS = 120;

function listMarkdown(root) {
  const out = [];
  const walk = (d) => {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      if (e.name.startsWith('.git') || e.name === 'node_modules' || e.name === 'archive') continue;
      const p = path.join(d, e.name);
      // Skip symlinks — by SST contract they point to canonical, would double-count.
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name.endsWith('.md')) out.push(p);
    }
  };
  walk(root);
  return out;
}

function paragraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter((s) => {
      if (s.length < MIN_CHARS) return false;
      // Skip table rows and headings — they legitimately repeat (column headers, common section names).
      if (s.startsWith('|') || s.startsWith('#') || s.startsWith('---')) return false;
      // Skip frontmatter blocks.
      if (s.includes('applyTo:') && s.length < 200) return false;
      return true;
    });
}

function normalize(p) {
  return p.replace(/\s+/g, ' ').toLowerCase();
}

export async function dedupeCmd(argv = []) {
  const root = path.join(process.cwd(), '.ai');
  if (!fs.existsSync(root)) {
    console.error(pc.red('No .ai/ directory found in cwd.'));
    process.exit(1);
  }

  const files = listMarkdown(root);
  const map = new Map();

  for (const f of files) {
    const rel = path.relative(process.cwd(), f);
    for (const p of paragraphs(fs.readFileSync(f, 'utf8'))) {
      const h = crypto.createHash('sha1').update(normalize(p)).digest('hex').slice(0, 12);
      if (!map.has(h)) map.set(h, { sample: p.slice(0, 100).replace(/\n/g, ' '), len: p.length, files: new Set() });
      map.get(h).files.add(rel);
    }
  }

  const dups = [...map.values()]
    .filter((e) => e.files.size > 1)
    .sort((a, b) => b.files.size - a.files.size || b.len - a.len);

  console.log(pc.bold(`AXIS dedupe — scanned ${files.length} markdown file(s) under .ai/`));
  console.log(pc.dim(`(threshold: paragraphs ≥ ${MIN_CHARS} chars, symlinks skipped)`));
  console.log();

  if (dups.length === 0) {
    console.log(pc.green('✓ No paragraph-level duplication detected.'));
    return;
  }

  console.log(pc.yellow(`Found ${dups.length} duplicated paragraph(s):`));
  for (const d of dups) {
    console.log();
    console.log(pc.cyan(`  [${d.files.size}×, ${d.len} chars] `) + pc.dim(`"${d.sample}…"`));
    for (const f of [...d.files].sort()) console.log(`    - ${f}`);
  }
  console.log();
  console.log(pc.dim('Fix: extract to a single canonical doc and link from the others.'));

  if (argv.includes('--strict')) process.exit(2);
}
