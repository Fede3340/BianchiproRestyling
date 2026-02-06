import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src', 'netlify/functions'];
const MARKERS = ['<<<<<<<', '=======', '>>>>>>>'];
const SOURCE_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.md', '.toml']);

const hits = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const st = statSync(fullPath);
    if (st.isDirectory()) {
      walk(fullPath);
      continue;
    }

    const ext = fullPath.slice(fullPath.lastIndexOf('.'));
    if (!SOURCE_EXT.has(ext)) continue;

    const body = readFileSync(fullPath, 'utf8');
    const lines = body.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (MARKERS.some((m) => line.startsWith(m))) {
        hits.push(`${fullPath}:${idx + 1}: ${line}`);
      }
    });
  }
}

for (const root of ROOTS) {
  walk(root);
}

if (hits.length > 0) {
  console.error('\n❌ Merge conflict markers trovati nei file sorgente:\n');
  hits.forEach((h) => console.error(` - ${h}`));
  console.error('\nRisolvi i conflitti prima della build/deploy.');
  process.exit(1);
}

console.log('✅ Nessun marker di merge conflict trovato.');
