import { PATHS } from '@/app/routes/paths';
import { page, section } from '../build';
import { banner } from './banner';

// GET content/pages/committees — design-reference/pages/committees.dc.html.
const P = PATHS.public;

export const committeesPageEn = page('committees', P.committees, { title: 'Impact100 — Committees' }, [
  banner('Our committees', [['About', P.about], 'Committees']),
  section('committee_grid', 'committees', {
    settings: { source: { collection: 'committees' } },
    fields: {
      kicker: 'Committees',
      title: 'Members are welcome to volunteer',
      lead: 'Tell a committee you would like to help and your note goes straight to that committee’s inbox.',
    },
  }),
]);
