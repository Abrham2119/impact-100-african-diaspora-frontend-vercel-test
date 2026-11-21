import { useId, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/design';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { cx } from '@/lib/classes';
import { formatMoney } from '@/lib/format';
import type { SectionData } from '../../schemas/defineSection';
import type { videoDonate } from '../../schemas/sectionTypes';
import { CmsImage, backgroundStyle } from '../CmsImage';

// video_donate — `.video_and_donate` (index.dc.html): amount chips + amount input, the donate
// call, and the video teaser. Picking a chip fills the input (design `amounts[].pick`); "custom"
// clears it for typing. The design's `<button class="common_btn">` has no action: here it opens
// the donate page with the chosen amount (`?amount=`). It stays a <button>, as in the design.
const CUSTOM = 'custom';

export function VideoDonateSection({ section }: { section: SectionData<typeof videoDonate> }) {
  const { fields, media, settings } = section;
  const { locale, toPath } = useLocale();
  const t = useT('site');
  const navigate = useNavigate();
  const inputId = useId();
  const [selected, setSelected] = useState<number | typeof CUSTOM>(settings.default_amount);
  const [amount, setAmount] = useState('');

  const pick = (choice: number | typeof CUSTOM) => {
    setSelected(choice);
    setAmount(choice === CUSTOM ? '' : String(choice));
  };
  const onChipKey = (event: KeyboardEvent<HTMLLIElement>, choice: number | typeof CUSTOM) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pick(choice);
    }
  };
  const chosen = amount.trim() || (selected === CUSTOM ? '' : String(selected));
  const donateHref = chosen ? `${fields.cta.href}?amount=${encodeURIComponent(chosen)}` : fields.cta.href;
  const donate = () => (fields.cta.external ? window.location.assign(donateHref) : navigate(toPath(donateHref)));
  const chips: Array<{ value: number | typeof CUSTOM; label: string }> = [
    ...settings.amounts.map((value) => ({ value, label: formatMoney(value * 100, locale) })),
    { value: CUSTOM, label: fields.custom_label },
  ];

  return (
    <section className="video_and_donate mt_250 bg_donation_video" style={backgroundStyle(media.background)}>
      <div className="video_and_donate_overlay pb_100">
        <div className="container">
          <div className="video_donate_text_top">
            <div className="row">
              <div className="col-lg-6">
                <div className="video_donate_text">
                  <h2>{fields.title}</h2>
                  <p>{fields.body}</p>
                  <h5>{fields.amount_title}</h5>
                  <div className="video_donation_box">
                    <div className="input_box">
                      <label htmlFor={inputId} className="ixd_sr_label">
                        {t('donate.amountLabel')}
                      </label>
                      <input
                        id={inputId}
                        placeholder={String(settings.default_amount)}
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                      />
                      <span>$</span>
                    </div>
                    <ul>
                      {chips.map((chip) => (
                        <li
                          key={chip.label}
                          className={cx(chip.value === selected && 'active')}
                          role="button"
                          tabIndex={0}
                          aria-pressed={chip.value === selected}
                          onClick={() => pick(chip.value)}
                          onKeyDown={(event) => onChipKey(event, chip.value)}
                        >
                          {chip.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button onClick={donate}>{fields.cta.label}</Button>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="video_donate_img">
                  <CmsImage media={media.image} />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-8 col-xxl-6 m-auto">
              <div className="video_donate_bottom">
                <a
                  className="venobox play_btn vbox-item"
                  href={media.video.externalUrl ?? media.video.url}
                  target="_blank"
                  rel="noopener"
                  aria-label={t('video.play')}
                >
                  <i aria-hidden="true" className="far fa-play" />
                </a>
                <h4>{fields.video_kicker}</h4>
                <h2>{fields.video_title}</h2>
                <p>{fields.video_body}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
