import React from 'react'
import ReactDOM from 'react-dom/client'
import GeometriyaLanding from './GeometriyaLanding.jsx'
import PrivacyPolicy from './PrivacyPolicy.jsx'

// Simple path check — no react-router needed for a single extra page.
// window.location.pathname is read once at load, which is fine here since
// this is a static marketing site with no in-app client-side navigation
// between routes (the only link to /privacy is a full page load from the
// footer, and "← Back to site" on the privacy page is also a full reload).
const isPrivacyPage = window.location.pathname.replace(/\/$/, '') === '/privacy';

// ── Canonical URL ───────────────────────────────────────────────────────────
// Set here rather than in index.html because one HTML file serves both routes:
// a fixed canonical would declare /privacy a duplicate of /, which is exactly
// the thing canonical exists to prevent. Always the www form, matching og:url,
// so an apex visit does not split ranking signals across two hostnames.
//
// This is JS-set, which Google honours after rendering but other crawlers may
// not see at all. That is a symptom of the real gap rather than a fix for it:
// this site is client-rendered, so every crawler's first look at any page is an
// empty <div id="root">. Prerendering the two routes to static HTML is the
// actual answer and is a build change, not a tag.
try {
  const path = isPrivacyPage ? '/privacy' : '/';
  const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
  link.rel = 'canonical';
  link.href = 'https://www.geometricalanalysis.com' + path;
  if (!link.parentNode) document.head.appendChild(link);
} catch { /* never let an SEO tag stop the page rendering */ }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isPrivacyPage ? <PrivacyPolicy /> : <GeometriyaLanding />}
  </React.StrictMode>,
)
