import type { RichBlock, RichInline, RichText } from '@/domain/entities/content.types';

// Fills `{token}` placeholders in the text nodes of a rich-text AST (e.g. the join intro:
// "You are joining the {campaign} ({start} – {end})", "voting starts above {threshold}"). Values
// come from the API (campaign, charter settings) so editors write the sentence once, per language.
const fill = (text: string, values: Record<string, string>) => text.replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);

function inline(node: RichInline, values: Record<string, string>): RichInline {
  if (node.type === 'text') return { ...node, text: fill(node.text, values) };
  if (node.type === 'link') return { ...node, children: node.children.map((child) => inline(child, values)) };
  return node;
}

function block(node: RichBlock, values: Record<string, string>): RichBlock {
  const all = (nodes: RichInline[]) => nodes.map((child) => inline(child, values));
  switch (node.type) {
    case 'list':
      return { ...node, items: node.items.map(all) };
    case 'table':
      return { ...node, head: node.head.map(all), rows: node.rows.map((row) => row.map(all)) };
    default:
      return { ...node, children: all(node.children) };
  }
}

export const fillRich = (value: RichText, values: Record<string, string>): RichText => value.map((node) => block(node, values));
