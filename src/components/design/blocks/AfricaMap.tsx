import { memo, useCallback, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { cx } from '@/lib/classes';
import { AFRICA_VIEWBOX, COUNTRY_PATHS, HUB_PATHS, HUB_PINS, NORTH_AFRICA_PATH, REGION_LABEL_ANCHORS } from './africaMap.paths';

// The grants map (grants.dc.html `.ix_map svg`), markup verbatim: North Africa (context only), the
// 47 selectable Sub-Saharan countries (click; the country <select> next to the map is their
// keyboard equivalent — "both do the same thing") and the three featured hubs (focusable buttons
// with pins and labels). Every Sub-Saharan country is a hub, incl. Sudan and Somaliland.
// Hovering a country (or focusing a hub) shows a custom tooltip with its name and capital.
// All text (names, labels, accessible names) arrives as props from the CMS / UiStrings.
export interface AfricaMapTipStrings {
  /** "Capital: {capital}" */
  capital: string;
  /** badge on the three featured hubs */
  featured: string;
  /** badge on the selected country */
  selected: string;
  /** call to action on an unselected country */
  hint: string;
}

export interface AfricaMapProps {
  /** accessible name of the whole map */
  label: string;
  /** selected map key (`c404`… or a hub key), if any */
  selected: string | null;
  onSelect: (mapKey: string) => void;
  /** country / hub names by map key (the <title> of each shape and the pin labels) */
  names: Record<string, string>;
  /** accessible names of the hub buttons by hub key, e.g. "Kenya hub — capital Nairobi" */
  hubLabels: Record<string, string>;
  regionLabels: { north: string; subSaharan: string };
  /** capitals by map key (tooltip) */
  capitals?: Record<string, string>;
  /** tooltip microcopy; the tooltip is off without it */
  tip?: AfricaMapTipStrings;
}

const TIP_OFFSET = 16;
const fill = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);

interface ShapesProps {
  selected: string | null;
  onSelect: (mapKey: string) => void;
  names: Record<string, string>;
  hubLabels: Record<string, string>;
  regionLabels: { north: string; subSaharan: string };
  withTitles: boolean;
  onFocusHub: (event: FocusEvent<SVGPathElement>) => void;
}

// The SVG itself, memoised so the tooltip (state of the parent) never repaints the 50 shapes.
const MapShapes = memo(function MapShapes({ selected, onSelect, names, hubLabels, regionLabels, withTitles, onFocusHub }: ShapesProps) {
  const onHubKey = (event: KeyboardEvent<SVGPathElement>, key: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(key);
    }
  };
  return (
    <>
      <path className="ix_north" d={NORTH_AFRICA_PATH} />
      {COUNTRY_PATHS.map(([key, d]) => (
        <path
          key={key}
          d={d}
          className={cx('ix_country', selected === key && 'ix_on')}
          data-k={key}
          onClick={() => onSelect(key)}
        >
          {withTitles && <title>{names[key]}</title>}
        </path>
      ))}
      {HUB_PATHS.map(([key, d]) => (
        <path
          key={key}
          d={d}
          className={cx('ix_hub', selected === key && 'ix_on')}
          data-k={key}
          tabIndex={0}
          role="button"
          aria-label={hubLabels[key]}
          aria-pressed={selected === key}
          onClick={() => onSelect(key)}
          onKeyDown={(event) => onHubKey(event, key)}
          onFocus={onFocusHub}
        />
      ))}
      {HUB_PATHS.map(([key]) => {
        const pin = HUB_PINS[key];
        if (!pin) return null;
        const on = selected === key;
        return [
          on && <circle key={`${key}-ring`} className="ixd_pin_ring" cx={pin.cx} cy={pin.cy} r={pin.r * 2} />,
          <circle key={`${key}-pin`} className={cx('ix_pin', on && 'ixd_pin_on')} cx={pin.cx} cy={pin.cy} r={pin.r} />,
          <text key={`${key}-label`} className="ix_pin_lbl" x={pin.labelX} y={pin.labelY}>
            {names[key]}
          </text>,
        ];
      })}
      <text className="ix_region_lbl" x={REGION_LABEL_ANCHORS.north.x} y={REGION_LABEL_ANCHORS.north.y}>
        {regionLabels.north}
      </text>
      <text className="ix_region_lbl" x={REGION_LABEL_ANCHORS.subSaharan.x} y={REGION_LABEL_ANCHORS.subSaharan.y}>
        {regionLabels.subSaharan}
      </text>
    </>
  );
});

export function AfricaMap({ label, selected, onSelect, names, hubLabels, regionLabels, capitals, tip }: AfricaMapProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [tipKey, setTipKey] = useState<string | null>(null);

  // Position is written straight to the tooltip node: following the pointer never re-renders.
  const place = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const node = tipRef.current;
    if (!canvas || !node) return;
    const box = canvas.getBoundingClientRect();
    const x = clientX - box.left;
    const y = clientY - box.top;
    // flip to the left / below near the edges so the tooltip stays inside the map card
    const flipX = x + TIP_OFFSET + node.offsetWidth > box.width;
    const flipY = y - TIP_OFFSET - node.offsetHeight < 0;
    node.style.left = `${flipX ? x - TIP_OFFSET - node.offsetWidth : x + TIP_OFFSET}px`;
    node.style.top = `${flipY ? y + TIP_OFFSET : y - TIP_OFFSET - node.offsetHeight}px`;
  }, []);

  const onFocusHub = useCallback(
    (event: FocusEvent<SVGPathElement>) => {
      const key = event.currentTarget.dataset.k;
      const pin = key ? HUB_PINS[key] : undefined;
      const svg = event.currentTarget.ownerSVGElement;
      if (!key || !pin || !svg) return;
      setTipKey(key);
      // anchor the tooltip on the hub's pin (viewBox → screen)
      const box = svg.getBoundingClientRect();
      const [, , vw, vh] = AFRICA_VIEWBOX.split(' ').map(Number);
      requestAnimationFrame(() => place(box.left + (pin.cx / vw) * box.width, box.top + (pin.cy / vh) * box.height));
    },
    [place],
  );

  // One handler for the whole map: the shape under the pointer (pins and labels let it through)
  // picks the tooltip; North Africa and the gaps between countries clear it.
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const shape = event.target instanceof Element ? event.target.closest('[data-k]') : null;
    const key = shape?.getAttribute('data-k') ?? null;
    if (key !== tipKey) setTipKey(key);
    if (key) place(event.clientX, event.clientY);
  };

  const tipName = tipKey ? names[tipKey] : undefined;
  const tipCapital = tipKey ? capitals?.[tipKey] : undefined;
  const tipOn = Boolean(tip && tipName);
  const isHub = tipKey ? tipKey in HUB_PINS : false;
  const isSelected = tipKey !== null && tipKey === selected;

  return (
    <div
      ref={canvasRef}
      className="ixd_map_canvas"
      onPointerMove={onMove}
      onPointerLeave={() => setTipKey(null)}
      onBlur={() => setTipKey(null)}
    >
      <svg viewBox={AFRICA_VIEWBOX} role="group" aria-label={label}>
        <MapShapes
          selected={selected}
          onSelect={onSelect}
          names={names}
          hubLabels={hubLabels}
          regionLabels={regionLabels}
          withTitles={!tip}
          onFocusHub={onFocusHub}
        />
      </svg>
      {tip && (
        <div ref={tipRef} className={cx('ixd_map_tip', tipOn && 'ixd_map_tip_on')} role="tooltip" aria-hidden={!tipOn}>
          {(isHub || isSelected) && (
            <span className="ixd_map_tip_badge">{isSelected ? tip.selected : tip.featured}</span>
          )}
          <strong className="ixd_map_tip_name">{tipName}</strong>
          {tipCapital && <span className="ixd_map_tip_meta">{fill(tip.capital, { capital: tipCapital })}</span>}
          {!isSelected && <span className="ixd_map_tip_hint">{tip.hint}</span>}
        </div>
      )}
    </div>
  );
}
