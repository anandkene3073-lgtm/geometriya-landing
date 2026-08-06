// Regenerates public/og-card.png, the link-preview image for shared URLs.
//
//   npm install --no-save sharp && node scripts/make-og-card.cjs
//
// sharp is deliberately NOT a dependency — this runs by hand when the card
// changes and the built PNG is committed. Adding a native image library to
// every install for something touched twice a year is not worth it.
//
// ── Why this card is only a logo and a name ──
// WhatsApp uses the large 1.91:1 card layout only when the URL is essentially
// the whole message. The referral message puts ~290 characters of pitch in
// front of the link, so WhatsApp falls back to a ~130px square thumbnail.
// Earlier versions carried a headline, a tagline and two offer pills; at that
// size all of it was mush. Anything smaller than about a third of the frame
// cannot be read, so the card now carries the only two things worth
// recognising at a glance — the mark and the name. The selling is done by the
// og:description and the message text, which are legible at any size.
const sharp = require('sharp');
const path = require('path');

const W = 1200, H = 630, CX = W / 2;
const c = { bg: '#060a14', ink: '#e8edf8', blue: '#4f7fff' };

// Background geometry: the product draws angles on charts, so the card shows
// that rather than saying it. Anchored to the corners, low-contrast, and
// carrying no information — a crop through it loses nothing.
const rays = [];
for (let i = 0; i < 7; i++) {
  const a = (i * 11 + 8) * Math.PI / 180;
  rays.push(`<line x1="0" y1="${H}" x2="${Math.cos(a) * 1500}" y2="${H - Math.sin(a) * 1500}" stroke="${c.blue}" stroke-width="1.2" opacity="${0.26 - i * 0.028}"/>`);
  rays.push(`<line x1="${W}" y1="${H}" x2="${W - Math.cos(a) * 1500}" y2="${H - Math.sin(a) * 1500}" stroke="${c.blue}" stroke-width="1.2" opacity="${0.16 - i * 0.02}"/>`);
}

// Centred, not left-aligned: small previews centre-crop toward a square, and
// a left-aligned version loses its first third when that happens. Both
// elements sit inside the central 630px band — the widest square croppable
// from the middle.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="gL" cx="12%" cy="0%" r="70%"><stop offset="0%" stop-color="#3E7BFA" stop-opacity="0.20"/><stop offset="100%" stop-color="#3E7BFA" stop-opacity="0"/></radialGradient>
    <radialGradient id="gR" cx="90%" cy="100%" r="65%"><stop offset="0%" stop-color="#2F5FE0" stop-opacity="0.16"/><stop offset="100%" stop-color="#2F5FE0" stop-opacity="0"/></radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#gL)"/>
  <rect width="${W}" height="${H}" fill="url(#gR)"/>
  ${rays.join('')}

  <!-- The real mark, inlined from public/logo.svg: identical geometry, no
       raster edges, and it cannot drift from the brand. -->
  <g transform="translate(${CX - 88},168) scale(1.76)">
    <polygon points="50,17 85,81 15,81" fill="#5A83FF" opacity="0.16"/>
    <polyline points="15,81 50,19 85,81" stroke="#5A83FF" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <polyline points="33,81 50,50 67,81" stroke="#5A83FF" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  </g>

  <text x="${CX}" y="470" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="96" font-weight="bold" fill="${c.ink}" letter-spacing="1">Geometriya</text>
</svg>`;

sharp(Buffer.from(svg)).png({ compressionLevel: 9 })
  .toFile(path.join(__dirname, '..', 'public', 'og-card.png'))
  .then(i => console.log(`written: ${i.width}x${i.height}, ${(i.size / 1024).toFixed(0)} KB`))
  .catch(e => console.log('FAILED:', e.message));
