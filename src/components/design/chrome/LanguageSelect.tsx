import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '@/lib/classes';

// The top-bar language select (`nice-select select_js`), markup verbatim from the snapshots:
//   <div class="nice-select select_js (open)" tabindex="0" role="button" aria-haspopup="listbox" aria-expanded>
//     <span class="current">English</span>
//     <ul class="list" role="listbox"><li class="option selected" role="option">English</li>…</ul></div>
// It is the site's only language switcher (ARCHITECTURE.md §8.2). Behaviour of the design script:
// click toggles, picking an option closes. Added for accessibility: Enter/Space/Escape, arrow keys
// (highlight = the template's own `.option.focus`), aria-selected, closing on an outside click.

export interface LanguageOption {
  value: string;
  label: string;
}

export interface LanguageSelectProps {
  options: LanguageOption[];
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelect({ options, value, onChange }: LanguageSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const toggle = () => {
    setHighlight(options.findIndex((o) => o.value === value));
    setOpen((was) => !was);
  };

  const pick = (option: LanguageOption) => {
    setOpen(false);
    if (option.value !== value) onChange(option.value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const target = options[highlight];
      if (open && target) pick(target);
      else toggle();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        toggle();
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setHighlight((index) => (index + step + options.length) % options.length);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cx('nice-select select_js', open && 'open')}
      tabIndex={0}
      role="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={toggle}
      onKeyDown={onKeyDown}
    >
      <span className="current">{current?.label}</span>
      <ul className="list" role="listbox">
        {options.map((option, index) => (
          <li
            key={option.value}
            className={cx('option', option.value === value && 'selected', index === highlight && open && 'focus')}
            role="option"
            aria-selected={option.value === value}
            onClick={(event) => {
              event.stopPropagation();
              pick(option);
            }}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
