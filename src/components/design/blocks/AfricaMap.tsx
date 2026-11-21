import type { KeyboardEvent } from 'react';
import { cx } from '@/lib/classes';
import { AFRICA_VIEWBOX, COUNTRY_PATHS, HUB_PATHS, HUB_PINS, NORTH_AFRICA_PATH, REGION_LABEL_ANCHORS } from './africaMap.paths';

// The grants map (grants.dc.html `.ix_map svg`), markup verbatim: North Africa (context only), the
// 47 selectable Sub-Saharan countries (click; the country <select> next to the map is their
// keyboard equivalent — "both do the same thing") and the three featured hubs (focusable buttons
// with pins and labels). Every Sub-Saharan country is a hub, incl. Sudan and Somaliland.
// All text (names, labels, accessible names) arrives as props from the CMS / UiStrings.
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
}

export function AfricaMap({ label, selected, onSelect, names, hubLabels, regionLabels }: AfricaMapProps) {
  const onHubKey = (event: KeyboardEvent<SVGPathElement>, key: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(key);
    }
  };
  return (
    <svg viewBox={AFRICA_VIEWBOX} role="group" aria-label={label}>
      <path className="ix_north" d={NORTH_AFRICA_PATH} />
      {COUNTRY_PATHS.map(([key, d]) => (
        <path key={key} d={d} className={cx('ix_country', selected === key && 'ix_on')} data-k={key} onClick={() => onSelect(key)}>
          <title>{names[key]}</title>
        </path>
      ))}
      {HUB_PATHS.map(([key, d]) => (
        <path
          key={key}
          d={d}
          className={cx('ix_hub', selected === key && 'ix_on')}
          tabIndex={0}
          role="button"
          aria-label={hubLabels[key]}
          aria-pressed={selected === key}
          onClick={() => onSelect(key)}
          onKeyDown={(event) => onHubKey(event, key)}
        />
      ))}
      {HUB_PATHS.map(([key]) => {
        const pin = HUB_PINS[key];
        if (!pin) return null;
        return [
          <circle key={`${key}-pin`} className="ix_pin" cx={pin.cx} cy={pin.cy} r={pin.r} />,
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
    </svg>
  );
}
