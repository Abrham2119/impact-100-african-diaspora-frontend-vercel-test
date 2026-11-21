import { PlayButton, SectionHeading } from '@/components/design';
import {
  BREAKPOINTS,
  COLOURS,
  FONTS,
  GRID_NOTE,
  MOTION,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPE_SCALE,
} from './boardData';

// Reproduction of design-reference/snapshots/Main.html (design tokens board).
// Swatch colours, specimen fonts/sizes, radii, shadows and bar widths are the
// documented values themselves, so they are applied inline per item.
export function MainBoard() {
  return (
    <div className="db_board">
      <div className="container db_main">
        <div className="db_intro">
          <SectionHeading className="db_left" kicker="Foundation" title="Design tokens" />
          <p>
            Every value below comes from the template&apos;s own <code>style.css</code>, <code>spacing.css</code> and{' '}
            <code>responsive.css</code>. All pages load these same stylesheets, so they share one set of colours, type, spacing
            and motion.
          </p>
        </div>

        <section className="db_section">
          <h3 className="db_h3">Colour</h3>
          <div className="db_swatches">
            {COLOURS.map((swatch) => (
              <div className="db_swatch" key={swatch.name}>
                <div className="db_swatch_color" style={{ background: swatch.hex }} />
                <div className="db_swatch_text">
                  <strong className="db_swatch_name">{swatch.name}</strong>
                  <code className="db_small">{swatch.token}</code>
                  <code className="db_small">{swatch.hex}</code>
                  <span className="db_small">{swatch.usage}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="db_section">
          <h3 className="db_h3">Typography</h3>
          <div className="db_fonts">
            {FONTS.map((font) => (
              <div className="db_font_card" key={font.token}>
                <span>{font.token}</span>
                <span style={font.style}>{font.sample}</span>
                <span>{font.note}</span>
              </div>
            ))}
          </div>
          <div className="db_scale">
            {TYPE_SCALE.map((row) => (
              <div className="db_scale_row" key={row.label}>
                <code>{row.label}</code>
                <span style={row.style}>{row.sample}</span>
              </div>
            ))}
          </div>
          <div className="db_showcase">
            <div>
              <span>.section_heading (h5 + h2)</span>
              <SectionHeading className="db_left" kicker="Help the people" title="Find The Popular Cause" />
            </div>
            <div>
              <span>.title (hover underline)</span>
              <a className="title" href="#title">
                Please help the children with food
              </a>
            </div>
          </div>
        </section>

        <section className="db_section">
          <h3 className="db_h3">Spacing</h3>
          <p className="db_spacing_intro">
            Utility classes from <code>spacing.css</code> in 5px steps: <code>mt_0 … mt_250</code>, <code>mb_</code>,{' '}
            <code>pt_</code>, <code>pb_</code>. Sections sit <code>mt_100</code> apart; section padding uses{' '}
            <code>pt_100 pb_100</code>; heading-to-content gap is <code>mt_30</code>.
          </p>
          <div className="db_spacing">
            {SPACING.map((step) => (
              <div className="db_spacing_row" key={step.cls}>
                <code>{step.cls}</code>
                <div className="db_spacing_bar" style={{ width: step.px }} />
                <span>{step.px}px</span>
              </div>
            ))}
          </div>
        </section>

        <section className="db_two">
          <div>
            <h3 className="db_h3">Radius</h3>
            <div className="db_radius">
              {RADIUS.map((step) => (
                <div key={step.value}>
                  <div className="db_radius_tile" style={{ borderRadius: step.value }} />
                  <code>{step.value}</code>
                  <span>{step.use}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="db_h3">Shadow</h3>
            <div className="db_shadows">
              {SHADOWS.map((sample) => {
                const [value, use] = sample.label.split('<br>');
                return (
                  <div className="db_shadow" key={sample.shadow} style={{ boxShadow: sample.shadow }}>
                    {value}
                    {use !== undefined && (
                      <>
                        <br />
                        {use}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="db_two">
          <div>
            <h3 className="db_h3">Breakpoints</h3>
            <div className="db_rows">
              {BREAKPOINTS.map((row) => (
                <div key={row.name}>
                  <strong>{row.name}</strong>
                  <code>{row.value}</code>
                </div>
              ))}
            </div>
            <p className="db_note">
              {GRID_NOTE.split(/(\.container|\.row|\.col-\*|responsive\.css)/).map((part, index) =>
                index % 2 === 1 ? <code key={index}>{part}</code> : part,
              )}
            </p>
          </div>
          <div>
            <h3 className="db_h3">Motion</h3>
            <div className="db_rows">
              {MOTION.map((row) => (
                <div key={row.name}>
                  <strong>{row.name}</strong>
                  <code className="db_rows_value">{row.value}</code>
                </div>
              ))}
            </div>
            <div className="db_play">
              <PlayButton label="Play video" href="#play" />
              <span>.play_btn: play_animi pulse, live</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
