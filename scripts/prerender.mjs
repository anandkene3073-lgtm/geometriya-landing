// Prerender the two routes to static HTML, after `vite build`.
//
// WHY: this is a client-rendered SPA, so every crawler's first look at every
// page was `<div id="root"></div>` and nothing else. Sitemaps and structured
// data help a crawler that already has content; they do not create any. For a
// marketing site whose whole job is acquisition, that is the finding.
//
// NON-FATAL BY DESIGN. If anything here throws, it logs and exits 0, leaving
// the ordinary SPA build in place. An SEO enhancement must never be the reason
// a deploy fails — the worst case is the site is exactly as findable as it was
// yesterday, which is a bad day, not an outage.
//
// The prerendered markup is REPLACED on load rather than hydrated: main.jsx
// still calls createRoot().render(), which discards this HTML and mounts
// fresh. hydrateRoot would be faster, but a hydration mismatch turns a
// cosmetic problem into a blank page, and the goal here is what the crawler
// receives, not time-to-interactive. Not worth the risk for the gain.
//
// Vercel serves a real file before applying the SPA rewrite, so dist/privacy/
// index.html is what /privacy resolves to — the same reason
// .well-known/assetlinks.json works on the app domain.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

// path → where the HTML lands in dist. Keep in step with entry-server.jsx.
const ROUTES = {
  '/': 'index.html',
  '/privacy': join('privacy', 'index.html'),
};

const fail = (why, err) => {
  console.warn(`\n[prerender] SKIPPED — ${why}`);
  if (err) console.warn(`[prerender] ${err.stack || err.message || err}`);
  console.warn('[prerender] The SPA build is intact and deployable; only the static HTML is missing.\n');
  process.exit(0);
};

const ssrEntry = join(root, 'dist-ssr', 'entry-server.js');
if (!existsSync(ssrEntry)) fail(`no SSR bundle at ${ssrEntry} — did the "build:ssr" step run?`);

let render;
try {
  ({ render } = await import(`file://${ssrEntry}`));
} catch (err) {
  fail('the SSR bundle could not be imported', err);
}

let template;
try {
  template = readFileSync(join(dist, 'index.html'), 'utf8');
} catch (err) {
  fail('dist/index.html is missing — run vite build first', err);
}

// The marker vite leaves for us. If the template ever stops matching this,
// say so loudly rather than silently writing pages with no content injected.
const MOUNT = '<div id="root"></div>';
if (!template.includes(MOUNT)) fail(`dist/index.html no longer contains ${MOUNT}`);

let wrote = 0;
for (const [pathname, out] of Object.entries(ROUTES)) {
  let html;
  try {
    html = render(pathname);
  } catch (err) {
    // One bad route should not cost the others.
    console.warn(`[prerender] ${pathname} failed to render, leaving it as an SPA shell: ${err.message}`);
    continue;
  }
  if (!html || html.length < 500) {
    console.warn(`[prerender] ${pathname} rendered only ${html?.length || 0} chars — suspiciously empty, skipping`);
    continue;
  }
  const page = template.replace(MOUNT, `<div id="root">${html}</div>`);
  const target = join(dist, out);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, page);
  console.log(`[prerender] ${pathname.padEnd(10)} → dist/${out.replace(/\\/g, '/')}  (${(page.length / 1024).toFixed(0)} KB)`);
  wrote++;
}

if (!wrote) fail('nothing was written');
console.log(`[prerender] ${wrote} route(s) now serve real HTML to crawlers.`);
