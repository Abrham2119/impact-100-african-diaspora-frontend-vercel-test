import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { RichBlock, RichInline, RichText as RichTextAst } from '@/domain/entities/content.types';
import { useLocale } from '@/i18n/useLocale';

// Renders the portable rich-text AST (ARCHITECTURE.md §7.3 point 5) into the design's markup —
// never via innerHTML: paragraph → <p>, strong → <b> (as the design writes it), list →
// <ul class="ix_list">, table → the design's `ix_table_wrap mt_20 > ix_table_wrap > table.ix_table`,
// note → <p class="ix_note">. In-app links go through the router and get the locale prefix.

function Inline({ node }: { node: RichInline }): ReactNode {
  const { toPath } = useLocale();
  if (node.type === 'break') return <br />;
  if (node.type === 'link') {
    const children = node.children.map((child, i) => <Inline key={i} node={child} />);
    return node.href.startsWith('/') ? (
      <Link className="ix_link" to={toPath(node.href)}>
        {children}
      </Link>
    ) : (
      <a className="ix_link" href={node.href} target="_blank" rel="noopener">
        {children}
      </a>
    );
  }
  let content: ReactNode = node.text;
  if (node.marks?.includes('em')) content = <em>{content}</em>;
  if (node.marks?.includes('strong')) content = <b>{content}</b>;
  return content;
}

const inlines = (nodes: RichInline[]) => nodes.map((node, i) => <Inline key={i} node={node} />);

function Block({ block, plainLists }: { block: RichBlock; plainLists: boolean }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{inlines(block.children)}</p>;
    case 'heading':
      return block.level === 3 ? <h3>{inlines(block.children)}</h3> : <h4>{inlines(block.children)}</h4>;
    case 'list': {
      const items = block.items.map((item, i) => <li key={i}>{inlines(item)}</li>);
      const listClass = plainLists ? undefined : 'ix_list';
      return block.ordered ? <ol className={listClass}>{items}</ol> : <ul className={listClass}>{items}</ul>;
    }
    case 'table':
      return (
        <div className="ix_table_wrap mt_20">
          <div className="ix_table_wrap">
            <table className="ix_table">
              <thead>
                <tr>
                  {block.head.map((cell, i) => (
                    <th key={i} scope="col">
                      {inlines(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c}>{inlines(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case 'note':
      return <p className="ix_note">{inlines(block.children)}</p>;
  }
}

/** `plainLists`: lists without `ix_list` (the template's article bodies: campaign, event, news details). */
export function RichText({ value, plainLists = false }: { value: RichTextAst; plainLists?: boolean }) {
  return (
    <>
      {value.map((block, i) => (
        <Fragment key={i}>
          <Block block={block} plainLists={plainLists} />
        </Fragment>
      ))}
    </>
  );
}
