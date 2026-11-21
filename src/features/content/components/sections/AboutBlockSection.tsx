import { SectionHeading } from '@/components/design';
import type { SectionData } from '../../schemas/defineSection';
import type { aboutBlock } from '../../schemas/sectionTypes';
import { CmsButton } from '../CmsButton';
import { CmsImage } from '../CmsImage';

// about_block — "About the Chapter" (index / about_us .dc.html), markup verbatim.
export function AboutBlockSection({ section }: { section: SectionData<typeof aboutBlock> }) {
  const { fields, media, items } = section;
  return (
    <section className="about_us mt_100">
      <div className="container">
        <div className="row">
          <div className="col-lg-5">
            <div className="about_us_img">
              <CmsImage media={media.image} />
            </div>
          </div>
          <div className="col-lg-7">
            <div className="wsus_about_us_text">
              <SectionHeading kicker={fields.kicker} title={fields.title} />
              <p className="about_description">{fields.body}</p>
              {items.length > 0 && (
                <ul>
                  {items.map((item) => (
                    <li key={item.id}>
                      <div className="icon">
                        <CmsImage media={item.media.icon} />
                      </div>
                      <h4>{item.fields.label}</h4>
                      <h3 className="counter ix_partner_name">{item.fields.name}</h3>
                    </li>
                  ))}
                </ul>
              )}
              {fields.founder_name !== undefined && (
                <div>
                  <div className="about_founder">
                    {media.founder_image && (
                      <div className="img">
                        <CmsImage media={media.founder_image} />
                      </div>
                    )}
                    <h3>{fields.founder_name}</h3>
                    {fields.founder_role !== undefined && <p>{fields.founder_role}</p>}
                    {fields.founder_cta && <CmsButton link={fields.founder_cta} />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
