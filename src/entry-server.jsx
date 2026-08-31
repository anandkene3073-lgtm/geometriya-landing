// Server entry, used ONLY at build time by scripts/prerender.mjs.
//
// It exists so a crawler's first look at this site is the actual copy rather
// than an empty <div id="root">. Google renders JavaScript on a later pass;
// most other crawlers, and the answer engines people increasingly ask before
// they ever reach a search page, do not.
//
// Deliberately mirrors main.jsx's route decision instead of importing it:
// main.jsx reads window.location at module scope, which does not exist here.
// The two are trivially small and must agree — if a third route is ever added,
// it goes in both, and scripts/prerender.mjs will need its path too.
import { renderToString } from 'react-dom/server';
import GeometriyaLanding from './GeometriyaLanding.jsx';
import PrivacyPolicy from './PrivacyPolicy.jsx';

export function render(pathname) {
  const isPrivacy = pathname.replace(/\/$/, '') === '/privacy';
  return renderToString(isPrivacy ? <PrivacyPolicy /> : <GeometriyaLanding />);
}
