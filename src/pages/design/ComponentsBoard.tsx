import { ButtonAnchor, CampaignCard, Footer, PlayButton, PublicHeader, SectionHeading } from '@/components/design';
import { usePublicChrome } from '@/features/content/hooks/useContent';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import donateCard1 from '@/assets/images/donate_card_img_1.webp';
import donateCard2 from '@/assets/images/donate_card_img_2.webp';
import donateCard3 from '@/assets/images/donate_card_img_3.webp';

// Reproduction of design-reference/snapshots/Components.html (reusable components board).
// §1 "Top bar + main menu" and §5 "Footer" are the real shared PublicHeader / Footer fed by
// the site chrome content. Known board-only differences: the board's footer uses template
// sample copy (newsletter "Subscribe" button, "Privacy Policy · Terms & Conditions") where the
// product footer has the approved copy.

const CAMPAIGNS = [
  { image: donateCard1, percent: 65, title: 'Please help the children of Africa with food helpless.' },
  { image: donateCard2, percent: 80, title: 'Empowerment Avenue: Paving the Way to Change.' },
  { image: donateCard3, percent: 60, title: 'Dreams Made Real: Fueling Ambitions Changin.' },
];

export function ComponentsBoard() {
  const { locale, locales, setLocale } = useLocale();
  const t = useT('common');
  const { data: chrome } = usePublicChrome(locale);
  const languages = locales.map((l) => ({ value: l.code, label: l.nativeName }));
  return (
    <div className="db_board">
      <div className="container db_cmp_head">
        <SectionHeading className="db_left" kicker="Foundation" title="Reusable components" />
        <p>
          Built from the template&apos;s own markup and classes. Hover states, dropdowns and transitions come from its CSS. Themed
          with the Impact100 African Diaspora USA logo palette.
        </p>
      </div>

      <div className="container">
        <h3 className="db_cmp_h3 db_cmp_h3_first">1 · Top bar + main menu</h3>
      </div>
      <div className="cmp_stage">
        <PublicHeader
          topbar={chrome.topbar}
          nav={chrome.nav}
          languages={languages}
          language={locale}
          onLanguageChange={setLocale}
          toggleLabel={t('nav.toggle')}
        />
      </div>

      <div className="container db_cmp_body">
        <div>
          <h3 className="db_cmp_h3">2 · Buttons</h3>
          <div className="db_buttons">
            <div>
              <ButtonAnchor href="#donate">donate now</ButtonAnchor>
              <code>.common_btn: hover fills with --colorBlack, arrow turns 45°→90°</code>
            </div>
            <div className="db_indent">
              <PlayButton label="Play video" href="#play" />
              <code>.play_btn</code>
            </div>
          </div>
        </div>

        <div>
          <h3 className="db_cmp_h3">3 · Section heading</h3>
          <div className="row">
            <div className="col-xl-6 m-auto">
              <SectionHeading kicker="Help the people" title="Find The Popular Cause And Donate Them" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="db_cmp_h3 db_cmp_h3_tight">4 · Campaign card + progress bar</h3>
          <div className="row">
            {CAMPAIGNS.map((campaign) => (
              <div className="col-xl-4 col-md-6" key={campaign.title}>
                <CampaignCard
                  href="/design/components"
                  image={{ src: campaign.image, alt: 'dination' }}
                  tag="education"
                  progressLabel="Donate"
                  percent={campaign.percent}
                  raisedLabel="Raised $4890.00"
                  goalLabel="Goals $6000.00"
                  title={campaign.title}
                  cta={{ label: 'donate now', to: '/design/components' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <h3 className="db_cmp_h3 db_cmp_h3_footer">5 · Footer</h3>
      </div>
      <Footer content={chrome.footer} onSubscribe={() => undefined} className="mt_30 cmp_footer" />
    </div>
  );
}
