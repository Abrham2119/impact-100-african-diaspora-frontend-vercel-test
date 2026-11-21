import { PATHS } from '@/app/routes/paths';
import { link, page, section } from '../build';
import { banner } from './banner';

// GET content/pages/charter — design-reference/pages/charter.dc.html. The sections come from
// C:charter_versions (`?v=` selects the version).
const P = PATHS.public;

export const charterEn = page('charter', P.charter, { title: 'Impact100 — Charter' }, [
  banner('Chapter charter', [['About', P.about], 'Charter']),
  section('charter', 'charter', {
    settings: { source: { collection: 'charter_versions' } },
    fields: {
      title: 'Chapter Charter',
      intro:
        "This charter covers the Chapter's purpose, how contribution-based membership works, and how we advise on and approve decisions. It is shared for member discussion and adoption.",
      actions: [link('sign the charter', PATHS.portal.sign), link('propose an amendment', PATHS.portal.decisions, 'ghost')],
      note: 'Members sign in the member portal. Amendments are proposed from the Chapter decisions tab and circulate to all members before any vote.',
    },
  }),
]);
