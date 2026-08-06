// Regenerates public/og-card.png, the link-preview image for shared URLs.
//
//   npm install --no-save sharp && node scripts/make-og-card.cjs
//
// sharp is deliberately NOT a dependency — this runs by hand when the card
// needs changing, and the built PNG is committed. Adding a native image
// library to the install for something run twice a year is not worth it.
//
// If the text renders blank, fontconfig cannot see a usable font; the family
// stacks below fall back to what Windows and most CI images already have.
const sharp = require('sharp');

// ── Geometriya social share card, 1200x630 ──
// 1200x630 is the 1.91:1 Open Graph standard, which is what WhatsApp and
// Telegram render for a large link preview.
//
// The layout is CENTRED, not left-aligned. Smaller previews in some clients
// centre-crop toward a square, and a left-aligned version of this card lost
// the first third of every line ("etriya", "c Scaling") when that happened.
// Everything that has to stay legible therefore sits inside the central
// 630px band — the widest square that can be taken out of the middle.
const W = 1200, H = 630, CX = W / 2;
const c = { bg:'#060a14', ink:'#e8edf8', dim:'#8fa3c4', faint:'#5c7699',
            blue:'#4f7fff', blueLt:'#7FB1FF', green:'#2fbf71' };

// Decorative geometry: the product draws angles on charts, so the card shows
// that rather than saying it. Anchored to the corners and kept low-contrast
// so it reads as texture and never competes with the words — and so a crop
// through it loses nothing that mattered.
const rays = [];
for (let i = 0; i < 7; i++) {
  const a = (i * 11 + 8) * Math.PI / 180;
  rays.push(`<line x1="0" y1="${H}" x2="${Math.cos(a)*1500}" y2="${H - Math.sin(a)*1500}" stroke="${c.blue}" stroke-width="1.2" opacity="${0.26 - i*0.028}"/>`);
  rays.push(`<line x1="${W}" y1="${H}" x2="${W - Math.cos(a)*1500}" y2="${H - Math.sin(a)*1500}" stroke="${c.blue}" stroke-width="1.2" opacity="${0.16 - i*0.02}"/>`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="gL" cx="12%" cy="0%" r="70%"><stop offset="0%" stop-color="#3E7BFA" stop-opacity="0.20"/><stop offset="100%" stop-color="#3E7BFA" stop-opacity="0"/></radialGradient>
    <radialGradient id="gR" cx="90%" cy="100%" r="65%"><stop offset="0%" stop-color="#2F5FE0" stop-opacity="0.16"/><stop offset="100%" stop-color="#2F5FE0" stop-opacity="0"/></radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#gL)"/>
  <rect width="${W}" height="${H}" fill="url(#gR)"/>
  ${rays.join('')}

  <!-- Brand mark, inlined from public/logo.svg: identical paths, no raster
       edges, and it stays crisp at whatever size this is rendered to. -->
  <g transform="translate(${CX - 158},72) scale(0.60)">
    <polygon points="50,17 85,81 15,81" fill="#5A83FF" opacity="0.16"/>
    <polyline points="15,81 50,19 85,81" stroke="#5A83FF" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <polyline points="33,81 50,50 67,81" stroke="#5A83FF" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  </g>
  <text x="${CX + 34}" y="${125}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-weight="bold" fill="${c.ink}">Geometriya</text>

  <text x="${CX}" y="278" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="66" font-weight="bold" fill="${c.ink}">Mitotic Scaling</text>
  <text x="${CX}" y="342" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="${c.dim}">Geometry drawn directly on your charts</text>
  <text x="${CX}" y="410" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="${c.faint}">Gann angles · Fibonacci · Vortex · NSE, US, FX</text>

  <rect x="${CX - 278}" y="462" width="280" height="58" rx="29" fill="${c.blue}" fill-opacity="0.13" stroke="${c.blue}" stroke-opacity="0.55" stroke-width="1.5"/>
  <text x="${CX - 138}" y="499" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="bold" fill="${c.blueLt}">Free 30-day trial</text>
  <rect x="${CX + 14}" y="462" width="264" height="58" rx="29" fill="${c.green}" fill-opacity="0.10" stroke="${c.green}" stroke-opacity="0.45" stroke-width="1.5"/>
  <text x="${CX + 146}" y="499" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="bold" fill="${c.green}">Free forever after</text>

  <text x="${CX}" y="576" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="21" fill="${c.faint}" letter-spacing="1">geometricalanalysis.com</text>
</svg>`;

sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(require('path').join(__dirname,'..','public','og-card.png'))
  .then(i => console.log(`written: ${i.width}x${i.height}, ${(i.size/1024).toFixed(0)} KB`))
  .catch(e => console.log('FAILED:', e.message));
