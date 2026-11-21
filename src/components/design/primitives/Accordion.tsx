import { useState, type ReactNode } from 'react';
import { cx } from '@/lib/classes';

// FAQ accordion (template + Bootstrap classes), one item open at a time; clicking
// the open item closes it (design: `faq: s.faq === i ? -1 : i`).
//   <div class="faq_text"><div class="accordion"><div class="accordion-item"><h2 class="accordion-header">
//     <button aria-expanded="true" class="accordion-button" type="button">Q</button></h2>
//     <div class="accordion-collapse collapse show"><div class="accordion-body"><p>A</p></div></div></div>…
export interface AccordionItem {
  id: string;
  question: ReactNode;
  /** plain text is wrapped in <p> as in the design; pass rich content as nodes */
  answer: ReactNode;
}

export interface AccordionProps {
  /** unique prefix for element ids (aria-controls / aria-labelledby) */
  idPrefix: string;
  items: AccordionItem[];
  /** initially open item; the design opens the first one. `null` → all closed */
  defaultOpenId?: string | null;
  className?: string;
}

export function Accordion({ idPrefix, items, defaultOpenId, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId === undefined ? (items[0]?.id ?? null) : defaultOpenId);

  return (
    <div className={cx('faq_text', className)}>
      <div className="accordion" id={idPrefix}>
        {items.map((item) => {
          const open = item.id === openId;
          const buttonId = `${idPrefix}-${item.id}-button`;
          const panelId = `${idPrefix}-${item.id}-panel`;
          return (
            <div className="accordion-item" key={item.id}>
              <h2 className="accordion-header">
                <button
                  id={buttonId}
                  type="button"
                  className={cx('accordion-button', !open && 'collapsed')}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  {item.question}
                </button>
              </h2>
              <div id={panelId} className={cx('accordion-collapse', 'collapse', open && 'show')} role="region" aria-labelledby={buttonId}>
                <div className="accordion-body">{typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
