/**
 * npm run check:css — guard for the Tailwind ↔ design CSS coexistence (ARCHITECTURE.md §1.3).
 *
 * Tailwind runs with `important: true` for the starter screens only. That is safe
 * as long as Tailwind never emits a class that design markup uses. This script:
 *   1. asserts the config decisions (preflight off, important, blocklist, content
 *      excludes design code);
 *   2. asks Tailwind (with the real config and content) which classes it emits;
 *   3. collects every class used by the design: snapshots + design source code;
 *   4. fails on any overlap that is not on the identical-semantics allowlist.
 * Runs with Node's built-in TypeScript support; no extra dependency.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import config from '../../tailwind.config.ts';

const ROOT = new URL('../../', import.meta.url).pathname;
const SNAPSHOTS = join(ROOT, 'design-reference/snapshots');
const PUBLIC_FEATURE_COMPONENTS = ['content', 'engagement', 'membership', 'governance'].map((slice) => `src/features/${slice}/components`);
const DESIGN_SOURCES = ['src/components/design', 'src/pages/design', ...PUBLIC_FEATURE_COMPONENTS].map((dir) => join(ROOT, dir));

/** Classes Tailwind and Bootstrap define with the same meaning; overlap is harmless. */
const IDENTICAL_SEMANTICS = new Set(['flex-wrap']);

const failures: string[] = [];

// 1 · config decisions ---------------------------------------------------------
if (config.corePlugins && (config.corePlugins as Record<string, boolean>).preflight !== false) failures.push('corePlugins.preflight must be false');
if (config.important !== true) failures.push('important must be true');
for (const cls of ['container', 'collapse']) {
  if (!(config.blocklist ?? []).includes(cls)) failures.push(`blocklist must contain "${cls}"`);
}
const content = Array.isArray(config.content) ? config.content : [];
for (const glob of ['!./src/components/design/**', '!./src/pages/design/**', ...PUBLIC_FEATURE_COMPONENTS.map((dir) => `!./${dir}/**`)]) {
  if (!content.includes(glob)) failures.push(`content must exclude ${glob}`);
}

// 2 · classes Tailwind emits ------------------------------------------------------
// Content globs are relative to the repo root (npm scripts run there).
const result = await postcss([tailwindcss(config)]).process('@tailwind components; @tailwind utilities;', { from: undefined });
const emitted = new Set<string>();
result.root.walkRules((rule) => {
  for (const match of rule.selector.matchAll(/\.((?:\\.|[\w-])+)/g)) emitted.add(match[1].replace(/\\(.)/g, '$1'));
});

// 3 · classes the design uses ------------------------------------------------------
const designClasses = new Set<string>();
const addTokens = (text: string) => {
  for (const token of text.split(/\s+/)) if (/^[a-z_][\w-]*$/i.test(token)) designClasses.add(token);
};
const walk = (dir: string, visit: (file: string) => void) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, visit);
    else visit(path);
  }
};

if (existsSync(SNAPSHOTS)) {
  walk(SNAPSHOTS, (file) => {
    if (!file.endsWith('.html')) return;
    for (const m of readFileSync(file, 'utf8').matchAll(/class="([^"]*)"/g)) addTokens(m[1]);
  });
} else {
  console.warn(`! ${SNAPSHOTS} not found — unzip design-reference.zip (snapshot classes not checked)`);
}
for (const dir of DESIGN_SOURCES) {
  if (!existsSync(dir)) continue;
  walk(dir, (file) => {
    if (!/\.(tsx?|css)$/.test(file)) return;
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/className=(?:"([^"]*)"|\{[^}]*?['"`]([^'"`]*)['"`])/g)) addTokens(m[1] ?? m[2] ?? '');
    // cx('a', cond && 'b', …): class literals are direct arguments or follow `&&` (not `=== 'x'` operands)
    for (const m of text.matchAll(/cx\(([^)]*)\)/g)) for (const s of m[1].matchAll(/(?:^|,|&&)\s*'([^']*)'/g)) addTokens(s[1]);
  });
}

// 4 · overlap -----------------------------------------------------------------------
const overlap = [...emitted].filter((cls) => designClasses.has(cls) && !IDENTICAL_SEMANTICS.has(cls)).sort();
if (overlap.length > 0) failures.push(`Tailwind emits classes used by the design: ${overlap.join(', ')}`);

console.log(`Tailwind classes emitted: ${emitted.size} · design classes: ${designClasses.size} · overlap: ${overlap.length}`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  process.exit(1);
}
console.log('✓ Tailwind and the design CSS cannot collide');
