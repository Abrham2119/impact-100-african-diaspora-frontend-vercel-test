/**
 * npm run check:copy — no hard-coded public copy (CONTENT_AND_I18N.md, CLAUDE.md "Content & languages").
 *
 * Every visible string of the public site comes from the CMS (page sections, collections) or from
 * UiStrings. This script parses the components that render public content and fails on:
 *   • JSX text containing a letter (e.g. <h2>Our model</h2>);
 *   • a literal alt / title / placeholder / aria-label / label attribute containing a letter.
 * Expressions ({fields.title}, {t('readMore')}) are fine. Glyph-only text ($, ×, •, ·) passes.
 * Runs with Node's built-in TypeScript support and the TypeScript compiler API (no new dependency).
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

const ROOT = new URL('../../', import.meta.url).pathname;
const SCANNED = [
  'src/components/design/blocks',
  'src/components/design/chrome',
  'src/features/content/components',
  'src/features/engagement/components',
  'src/features/membership/components',
  'src/features/governance/components',
  'src/features/auth/components',
  'src/features/portal/components',
  'src/components/design/portal',
  'src/pages/public',
];
const COPY_ATTRIBUTES = new Set(['alt', 'title', 'placeholder', 'aria-label', 'label']);
const HAS_LETTER = /\p{L}/u;

const files: string[] = [];
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith('.tsx')) files.push(path);
  }
};
for (const dir of SCANNED) if (existsSync(join(ROOT, dir))) walk(join(ROOT, dir));

const failures: string[] = [];
for (const file of files) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const report = (node: ts.Node, what: string) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    failures.push(`${relative(ROOT, file)}:${line + 1}  ${what}`);
  };
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      const text = node.getText(source).trim();
      if (text && HAS_LETTER.test(text)) report(node, `JSX text "${text.slice(0, 60)}"`);
    } else if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const name = node.name.getText(source);
      if (COPY_ATTRIBUTES.has(name) && HAS_LETTER.test(node.initializer.text)) report(node, `${name}="${node.initializer.text}"`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

console.log(`Scanned ${files.length} files in ${SCANNED.join(', ')}`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  console.error(`${failures.length} hard-coded string(s): move them to the CMS section fields or UiStrings.`);
  process.exit(1);
}
console.log('✓ No hard-coded public copy');
