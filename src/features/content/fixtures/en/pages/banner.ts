import { PATHS } from '@/app/routes/paths';
import { link, section } from '../build';

// The `breadcrumb_banner` section that opens every public page except home. Title and trail
// are copied verbatim (including the design's casing) from each snapshot's banner.
// Trail entries: a plain string is the current page; `[label, href]` is a link. "Home" first.
export function banner(title: string, trail: Array<string | [string, string]>) {
  return section('breadcrumb_banner', 'banner', {
    fields: {
      title,
      trail: [
        link('Home', PATHS.home),
        ...trail.map((crumb) => (typeof crumb === 'string' ? link(crumb, '') : link(crumb[0], crumb[1]))),
      ],
    },
  });
}
