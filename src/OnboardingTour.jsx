// ── WEBSITE COPY of the app's first-run tour (trading-app/src/OnboardingTour.jsx,
// taken 5-Sep-2026). The landing page's "Take the tour" buttons open it, so a
// visitor sees the same thirteen stops, illustrations, captures and voice
// narration a new account gets. Kept as close to the app's file as possible so
// the two can be diffed; the deliberate differences are marked WEBSITE below:
//   • no Capacitor / native text-to-speech — the browser's speechSynthesis only;
//   • the app's --geo-* colour tokens are defined here, on the modal's own root;
//   • narration defaults to English (no saved Geo-Tutor language to inherit);
//   • no "Don't show this again" — nothing on this site is shown on login;
//   • "Watch Detailed Video" opens the YouTube walkthrough in a new tab.
import { useCallback, useEffect, useRef, useState } from 'react';
import shotWelcome from './assets/onboarding/welcome.mp4';
import shotChart from './assets/onboarding/chart-data.mp4';
import shotAngle45 from './assets/onboarding/angle45.mp4';
import shotAuto from './assets/onboarding/auto-angle.mp4';
import shotGannBox from './assets/onboarding/gannbox.mp4';
import shotWatchlist from './assets/onboarding/watchlist.mp4';

// ── First-run onboarding tour — split stepper (persistent left rail, jump
// to any stop) with per-concept chart illustrations + voice narration.
// Shown once after the first successful login (GeometriyaApp mounts only
// behind the auth gate, so "mounted without the seen-flag" already means
// "first login on this device"). Replayable any time from the logo menu's
// "🚀 Take the Tour" entry.
//
// Redrawn 5-Sep-2026 to match the app as it now is: Geo-Tutor (the 4-Sep
// rebuild of Voice Assistance — it places studies and points at the chart
// while it reads) gets its own stop with an animated illustration; the old
// "Voice Assistance & Help" stop becomes "Help, Videos & Your Account";
// "Algo Scan" is "Search" (the word "algo" is gone from every client-facing
// string — see the 3-Sep rename); Paper Trading describes immediate fills,
// wallets per market (₹ / $ / R) and the Closed-positions ledger, and no
// longer promises a strategy trading the practice book (retired 2-Sep);
// a new "Trade ▾" stop maps Paper · Search · Live and says plainly that Live
// is not available to client accounts.
//
// slide.screenshot holds a real in-app capture — recorded live off a signed-in
// dev session with Claude in Chrome (see gif_creator) rather than drawn. Six
// of the thirteen stops have one; slide.visual is the drawn fallback for the
// rest (voice.mp4 still sits in assets/onboarding but shows the retired 🗣
// button, so it is no longer imported). The Masterstroke stop carries
// `featured: true` — it wears gold in the rail so a first-time user sees the
// headline stop before they reach it; `badge: 'NEW'` marks stops added in
// this redraw so returning users can see what changed at a glance.
//
// Narration follows the same two-backend split as Geo-Tutor: the Web Speech
// API in browsers, the platform TTS engine in the packaged app (Android's
// WebView exposes no window.speechSynthesis at all). It honours the user's
// saved Geo-Tutor language and per-language voice picks — one voice across
// the whole app, not a second thing to configure.
//
// Chrome's autoplay policy blocks speechSynthesis before the first user
// gesture, so nothing speaks on open: slide 1 waits behind a "▶ Start tour"
// button, and that click is the gesture that unlocks audio for the rest.
//
// Deliberately dark regardless of the user's light/dark chart toggle — same
// precedent as the auth gate (GATE_CSS further down this file's sibling),
// which stays on-brand dark independent of --geo-theme-light. Colors below
// are the exact dark-theme --geo-* values, hardcoded rather than read from
// CSS vars for that reason.

// Safe localStorage helpers — same pattern as Geometriya.jsx (never crash
// when storage is unavailable).
const lsGet = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};

// WEBSITE: no seen-flag — nothing here is shown on login (the app keeps
// ONBOARDING_SEEN_KEY; this copy never writes it).

const IS_NARROW = typeof window !== 'undefined' &&
  window.matchMedia('(max-width: 860px)').matches;

// ── Theme ──────────────────────────────────────────────────────────────────
// The modal chrome styles itself with the app's own var(--geo-*) tokens and
// carries .geo-theme-light on its own root, because it renders as a SIBLING
// of the themed app wrapper in Geometriya.jsx — the class there cascades to
// the chart and panels, but never reaches a modal mounted next to it.
//
// The SVG illustrations can't use those tokens: var() is CSS, and SVG
// presentation attributes (fill=, stroke=) only accept literal colors. They
// read this table instead — values mirror :root / .geo-theme-light, and the
// candle colors mirror candleColorFor() so the drawings match a real chart.
const PALETTE = {
  dark: {
    panel: '#070b12', panel2: '#0d1117', border: '#1e2a3a', border2: '#334155',
    text: '#e2e8f0', textMuted: '#94a3b8', up: '#00c41c', down: '#E24B4A',
    angle: '#F2B33D', gann: '#7EB3F5', teal: '#35C9C9',
  },
  light: {
    panel: '#f7f8fa', panel2: '#ffffff', border: '#d8dde3', border2: '#c3c9d1',
    text: '#1a202c', textMuted: '#64748b', up: '#0F8A3D', down: '#C0392B',
    // The dark theme's amber and sky blue turn to pastel on a near-white
    // ground, so the drawing colours darken instead of carrying over.
    angle: '#B87513', gann: '#2E6FD0', teal: '#1B7676',
  },
};
// Brand blue for FILLED elements (primary button, completed step badge). Kept
// literal rather than tokenised: --geo-accent-blue-* flips light/dark, and
// white-on-token fails contrast in one theme or the other. This one works in both.
const ACCENT = '#3E7BFA';
const MONO = "'Cascadia Code', 'SF Mono', ui-monospace, Consolas, monospace";

// One shared candlestick series so every illustration sits on the same
// gently-rising "chart" — an uptrend left to right, which is also what the
// 45° angle slide needs to read correctly.
const CANDLES = [
  { up: true, bt: 170, bb: 190, wt: 160, wb: 198 },
  { up: false, bt: 150, bb: 172, wt: 140, wb: 180 },
  { up: false, bt: 160, bb: 185, wt: 150, wb: 195 },
  { up: true, bt: 140, bb: 162, wt: 128, wb: 172 },
  { up: true, bt: 110, bb: 135, wt: 98, wb: 145 },
  { up: false, bt: 120, bb: 145, wt: 108, wb: 155 },
  { up: true, bt: 95, bb: 118, wt: 82, wb: 128 },
  { up: true, bt: 70, bb: 95, wt: 58, wb: 105 },
  { up: false, bt: 85, bb: 108, wt: 72, wb: 118 },
  { up: true, bt: 60, bb: 85, wt: 48, wb: 95 },
  { up: true, bt: 40, bb: 65, wt: 28, wb: 75 },
  { up: false, bt: 55, bb: 78, wt: 42, wb: 88 },
];
const CANDLE_X = (i) => 34 + i * 30;

// ── Illustration building blocks ──────────────────────────────────────────
function ChartFrame({ children, pal, chrome = true, dim = false }) {
  return (
    <>
      <rect x="1" y="1" width="398" height="238" rx="14" fill={pal.panel} stroke={pal.border} />
      {chrome && (
        <>
          <rect x="14" y="12" width="130" height="16" rx="5" fill={pal.border2} opacity="0.5" />
          <circle cx="24" cy="20" r="3" fill={pal.textMuted} opacity="0.6" />
          <rect x="284" y="12" width="46" height="16" rx="5" fill={ACCENT} opacity="0.85" />
          <rect x="334" y="12" width="46" height="16" rx="5" fill={pal.border2} opacity="0.4" />
        </>
      )}
      <g opacity={dim ? 0.22 : 1}>
        {[60, 100, 140, 180, 210].map((y) => (
          <line key={y} x1="14" y1={y} x2="386" y2={y} stroke={pal.border} strokeWidth="1" opacity="0.4" />
        ))}
        {CANDLES.map((c, i) => {
          const x = CANDLE_X(i);
          const col = c.up ? pal.up : pal.down;
          return (
            <g key={i}>
              <line x1={x} y1={c.wt} x2={x} y2={c.wb} stroke={col} strokeWidth="1.4" />
              <rect x={x - 4} y={c.bt} width="8" height={Math.max(2, c.bb - c.bt)} fill={col} />
            </g>
          );
        })}
      </g>
      {children}
    </>
  );
}

function Chip({ x, y, w = 70, h = 16, fill, stroke, children, fontSize = 9 }) {
  // Callers pass JSX attribute strings (x="330"); "330" + 26 is "33026", which
  // put every chip label a long way off the right edge of the drawing. The
  // boxes drew, the words did not — unnoticed while the recorded stops sat
  // in front of the drawn fallbacks. Coerce before arithmetic.
  const X = +x, Y = +y, W = +w, H = +h;
  return (
    <g>
      <rect x={X} y={Y} width={W} height={H} rx="5" fill={fill} stroke={stroke} strokeWidth={stroke ? 1 : 0} />
      <text x={X + W / 2} y={Y + H / 2 + 3} textAnchor="middle" fontSize={fontSize} fontFamily={MONO} fill={stroke ? stroke : '#fff'}>
        {children}
      </text>
    </g>
  );
}

// Hero series for the welcome slide — a rally that climbs at roughly the same
// screen slope as the 45° line beneath it, so price visibly *rides* the angle
// instead of running away from it. Coordinates live in the 400×200 viewBox.
const HERO = [
  { x: 32, y: 140, up: true }, { x: 43, y: 132, up: false }, { x: 54, y: 118, up: true },
  { x: 65, y: 112, up: true }, { x: 76, y: 96, up: false }, { x: 87, y: 90, up: true },
  { x: 98, y: 76, up: true }, { x: 109, y: 68, up: false }, { x: 120, y: 54, up: true },
  { x: 131, y: 48, up: true }, { x: 142, y: 34, up: false }, { x: 153, y: 26, up: true },
];

const VISUALS = {
  // The opening image has to earn the whole tour, so it shows the two signature
  // tools at once — the 45° angle carrying a rally, and a Gann square projecting
  // it forward — each in the accent colour its own slide uses later.
  welcome: (pal) => (
    <>
      <rect x="0.5" y="0.5" width="399" height="199" rx="12" fill={pal.panel} stroke={pal.border} />
      {[40, 70, 100, 130, 160].map((y) => (
        <line key={y} x1="12" y1={y} x2="388" y2={y} stroke={pal.border} strokeWidth="1" opacity="0.45" />
      ))}

      {HERO.map((c, i) => {
        const col = c.up ? pal.up : pal.down;
        return (
          <g key={i}>
            <line x1={c.x} y1={c.y - 10} x2={c.x} y2={c.y + 10} stroke={col} strokeWidth="1.3" />
            <rect x={c.x - 3} y={c.y - 5} width="6" height="10" fill={col} />
          </g>
        );
      })}

      {/* 45° angle — draws itself in, then the square fades up behind it */}
      <line className="geo-tour-draw" x1="26" y1="158" x2="168" y2="16"
        stroke={pal.angle} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="26" cy="158" r="4" fill={pal.angle} />
      <path d="M 46 158 A 20 20 0 0 0 40.1 143.9" fill="none" stroke={pal.angle} strokeWidth="1.1" opacity="0.75" />
      <text x="52" y="152" fontSize="11" fontFamily={MONO} fill={pal.angle}>45°</text>
      <text x="14" y="176" fontSize="7.5" fontFamily={MONO} fill={pal.textMuted}>SWING LOW</text>

      <g className="geo-tour-fade">
        <rect x="200" y="30" width="130" height="130" fill="none" stroke={pal.gann} strokeWidth="1.5" />
        {[1, 2, 3].map((i) => (
          <g key={i} opacity="0.35">
            <line x1={200 + 32.5 * i} y1="30" x2={200 + 32.5 * i} y2="160" stroke={pal.gann} strokeWidth="0.7" />
            <line x1="200" y1={30 + 32.5 * i} x2="330" y2={30 + 32.5 * i} stroke={pal.gann} strokeWidth="0.7" />
          </g>
        ))}
        <line x1="200" y1="160" x2="330" y2="30" stroke={pal.gann} strokeWidth="2" />
        <path d="M 330 160 A 130 130 0 0 0 200 30" fill="none" stroke={pal.gann} strokeWidth="1.1" opacity="0.55" />
        <text x="200" y="22" fontSize="7.5" fontFamily={MONO} fill={pal.gann}>GANN SQUARE</text>
        {/* Sits in the lower-right triangle, clear of the diagonal it names */}
        <text x="262" y="128" fontSize="8.5" fontFamily={MONO} fill={pal.gann}>1×1</text>
      </g>
    </>
  ),
  chart: (pal) => (
    <ChartFrame pal={pal}>
      <line x1={CANDLE_X(6)} y1="82" x2={CANDLE_X(6)} y2="14" stroke="#5DCAA5" strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />
      <line x1="14" y1="128" x2={CANDLE_X(6)} y2="128" stroke="#5DCAA5" strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />
      <circle cx={CANDLE_X(6)} cy="128" r="8" fill="none" stroke="#5DCAA5" strokeWidth="1.6" />
      <circle cx={CANDLE_X(6)} cy="128" r="2.4" fill="#5DCAA5" />
      <text x={CANDLE_X(6) + 12} y="132" fontSize="9" fontFamily={MONO} fill="#5DCAA5">snap</text>
      <Chip x="330" y="196" w="52" h="18" fill="none" stroke="#5DCAA5" fontSize="8">scroll</Chip>
    </ChartFrame>
  ),
  angle45: (pal) => (
    <ChartFrame pal={pal}>
      <line x1="40" y1="205" x2="300" y2="58" stroke="#F2B33D" strokeWidth="2.2" opacity="0.95" />
      <circle cx="40" cy="205" r="4.5" fill="#F2B33D" />
      <path d="M 62 205 A 22 22 0 0 0 46 187" fill="none" stroke="#F2B33D" strokeWidth="1.2" opacity="0.7" />
      <text x="66" y="200" fontSize="11" fontFamily={MONO} fill="#F2B33D">45°</text>
      <circle cx="250" cy="88" r="10" fill="#F2B33D" opacity="0.18" />
      <circle cx="250" cy="88" r="3.4" fill="#F2B33D" />
      <text x="200" y="112" fontSize="9" fontFamily={MONO} fill="#F2B33D">touch → reacts</text>
    </ChartFrame>
  ),
  auto: (pal) => (
    <ChartFrame pal={pal}>
      <circle cx="40" cy="205" r="4.5" fill="#B78BFA" />
      <Chip x="20" y="180" w="42" h="14" fill="#B78BFA" fontSize="8">AUTO</Chip>
      {[[300, 150], [300, 100], [300, 50]].map(([x, y], i) => (
        <line key={i} x1="40" y1="205" x2={x} y2={y} stroke="#B78BFA" strokeWidth="1.4" opacity={0.85 - i * 0.22} />
      ))}
      <rect x="266" y="14" width="118" height="76" rx="8" fill={pal.panel2} stroke={pal.border} />
      <text x="276" y="27" fontSize="8" fontFamily={MONO} fill={pal.textMuted}>AUTO SCAN</text>
      {[['RELIANCE', '0.8%', pal.up], ['TCS', '1.2%', pal.up], ['INFY', '2.1%', pal.down]].map(([sym, pct, col], i) => (
        <g key={sym}>
          <circle cx="278" cy={44 + i * 16} r="2.2" fill={col} />
          <text x="286" y={47 + i * 16} fontSize="8" fontFamily={MONO} fill={pal.text}>{sym}</text>
          <text x="372" y={47 + i * 16} fontSize="8" fontFamily={MONO} fill={col} textAnchor="end">{pct}</text>
        </g>
      ))}
    </ChartFrame>
  ),
  gannbox: (pal) => (
    <ChartFrame pal={pal} chrome={false} dim>
      <rect x="90" y="34" width="170" height="170" rx="4" fill="none" stroke="#7EB3F5" strokeWidth="1.6" />
      {[1, 2, 3].map((i) => (
        <line key={'v' + i} x1={90 + (170 / 4) * i} y1="34" x2={90 + (170 / 4) * i} y2="204" stroke="#7EB3F5" strokeWidth="0.75" opacity="0.4" />
      ))}
      {[1, 2, 3].map((i) => (
        <line key={'h' + i} x1="90" y1={34 + (170 / 4) * i} x2="260" y2={34 + (170 / 4) * i} stroke="#7EB3F5" strokeWidth="0.75" opacity="0.4" />
      ))}
      <line x1="90" y1="204" x2="260" y2="34" stroke="#7EB3F5" strokeWidth="2.2" />
      <path d="M 90 204 A 60 60 0 0 0 150 144" fill="none" stroke="#7EB3F5" strokeWidth="1" opacity="0.5" />
      <path d="M 90 204 A 120 120 0 0 0 210 84" fill="none" stroke="#7EB3F5" strokeWidth="1" opacity="0.3" />
      <Chip x="112" y="216" w="56" h="18" fill={ACCENT}>Gann ▲</Chip>
      <Chip x="178" y="216" w="56" h="18" fill="none" stroke="#7EB3F5">Gann ▼</Chip>
    </ChartFrame>
  ),
  // Watchlist on the left as before; on the right the Search panel as it is
  // now — the server's view, with its coverage line ("covering Nifty 500 ·
  // 500 scrips · swept 12:40") and a strategy chip + status per row, in the
  // exact colours GEO2_ALGOS gives each strategy. No "scan" button: opening
  // Search reads the sweep, it does not run one.
  search: (pal) => (
    <>
      <rect x="1" y="1" width="398" height="238" rx="14" fill={pal.panel} stroke={pal.border} />
      <rect x="14" y="14" width="150" height="212" rx="8" fill={pal.panel2} stroke={pal.border} />
      <text x="26" y="32" fontSize="9" fontFamily={MONO} fill={pal.textMuted}>WATCHLIST</text>
      {/* The list chips: All | a custom list | ＋ */}
      <Chip x="24" y="40" w="26" h="12" fill={ACCENT} fontSize="7">All</Chip>
      <Chip x="54" y="40" w="40" h="12" fill="none" stroke={pal.border2} fontSize="7">Mine</Chip>
      <Chip x="98" y="40" w="16" h="12" fill="none" stroke={pal.border2} fontSize="8">＋</Chip>
      {[['NIFTY', '+0.6%', pal.up], ['BANKNIFTY', '-0.3%', pal.down], ['HDFCBANK', '+1.1%', pal.up], ['TATASTEEL', '+2.4%', pal.up], ['AAPL', '+0.9%', pal.up], ['NPN', '-1.2%', pal.down]].map(([sym, pct, col], i) => (
        <g key={sym}>
          <polyline points={`24,${74 + i * 24} 30,${68 + i * 24} 36,${72 + i * 24} 42,${64 + i * 24}`} fill="none" stroke={col} strokeWidth="1.2" opacity="0.85" />
          <text x="50" y={74 + i * 24} fontSize="8.5" fontFamily={MONO} fill={pal.text}>{sym}</text>
          <text x="154" y={74 + i * 24} fontSize="8.5" fontFamily={MONO} fill={col} textAnchor="end">{pct}</text>
        </g>
      ))}
      <rect x="178" y="14" width="208" height="212" rx="8" fill={pal.panel2} stroke={pal.border} />
      <text x="190" y="32" fontSize="9" fontFamily={MONO} fill={pal.textMuted}>🔍 SEARCH</text>
      <text x="190" y="46" fontSize="6.8" fontFamily={MONO} fill="#5DCAA5">covering Nifty 500 · 500 scrips · 🖥 server view · swept 12:40</text>
      <line x1="184" y1="52" x2="380" y2="52" stroke={pal.border} strokeWidth="1" />
      <text x="190" y="63" fontSize="6.5" fontFamily={MONO} fill={pal.textMuted}>SCRIP</text>
      <text x="282" y="63" fontSize="6.5" fontFamily={MONO} fill={pal.textMuted}>STRATEGY</text>
      <text x="380" y="63" fontSize="6.5" fontFamily={MONO} fill={pal.textMuted} textAnchor="end">STATUS</text>
      {[['EICHERMOT', 'D45', '#7B5BD6', '🟢 LIVE', '#5DCAA5'],
        ['SBIN', 'D45A', '#EF9F27', '🟡 ARMED', '#EF9F27'],
        ['LT', 'D45MSS', '#2EC4B6', 'GATE OPEN', '#00838F'],
        ['ADANIENT', 'D45', '#7B5BD6', '🟢 LIVE', '#5DCAA5'],
        ['BAJAJ-AUTO', 'D45A', '#EF9F27', 'WATCH', pal.textMuted],
        ['TCS', 'D45MSS', '#2EC4B6', '🟡 ARMED', '#EF9F27']].map(([sym, st, sc, status, col], i) => (
        <g key={sym}>
          {i === 0 && <rect x="182" y={70 + i * 24} width="200" height="20" rx="3" fill={ACCENT} opacity="0.12" />}
          <text x="190" y={84 + i * 24} fontSize="8.5" fontFamily={MONO} fill={pal.text}>{sym}</text>
          <Chip x="282" y={74 + i * 24} w={st.length > 4 ? 40 : 30} h="12" fill="none" stroke={sc} fontSize="6.5">{st}</Chip>
          <text x="380" y={84 + i * 24} fontSize="7.5" fontFamily={MONO} fill={col} textAnchor="end">{status}</text>
        </g>
      ))}
      <text x="190" y="222" fontSize="6.5" fontFamily={MONO} fill={pal.textMuted}>tap a row → that chart, 15m, signals drawn</text>
    </>
  ),
  // The four row controls, blown up. What this slide teaches is the control
  // strip itself rather than any one tool's geometry, so the illustration is
  // an Overlays row at reading size with its four parts numbered — a chart
  // behind it would only pull the eye off the thing being named.
  rowControls: (pal) => (
    <>
      <rect x="1" y="1" width="398" height="238" rx="14" fill={pal.panel} stroke={pal.border} />
      <text x="18" y="20" fontSize="8" fontFamily={MONO} fill={pal.textMuted}>OVERLAYS — EVERY TOOL ROW LOOKS LIKE THIS</text>

      {/* The row itself, at reading size */}
      <rect x="16" y="28" width="368" height="34" rx="6" fill={pal.panel2} stroke={pal.border2} />
      <rect x="16" y="28" width="2.5" height="34" fill={pal.teal} />
      <text x="34" y="50" fontSize="12" fontFamily={MONO} fill={pal.teal}>▽</text>
      <text x="52" y="50" fontSize="11" fontFamily={MONO} fill={pal.text}>Equilateral △</text>
      <text x="290" y="50" fontSize="13" textAnchor="middle" fill={pal.textMuted}>◀</text>
      <text x="326" y="50" fontSize="13" textAnchor="middle" fill={pal.angle}>⚡</text>
      <text x="362" y="50" fontSize="13" textAnchor="middle" fill={pal.textMuted}>🔍</text>

      {/* Badges sit on the row, and again beside the line that explains it —
          no connector lines needed, and none to cross each other. */}
      {[[158, '1'], [270, '2'], [306, '3'], [342, '4']].map(([x, n]) => (
        <g key={n}>
          <circle cx={x} cy="45" r="7.5" fill={pal.teal} opacity="0.16" stroke={pal.teal} strokeWidth="0.9" />
          <text x={x} y="48.5" fontSize="8.5" fontFamily={MONO} textAnchor="middle" fill={pal.teal}>{n}</text>
        </g>
      ))}

      <line x1="16" y1="74" x2="384" y2="74" stroke={pal.border} strokeWidth="1" />

      {[
        ['Click the name', ' — then click the chart to place it yourself'],
        ['◀  Back apply', ' — the previous, older setup, drawn faint'],
        ['⚡  Auto apply', ' — the latest one, found and placed for you'],
        ['🔍  Scanner', ' — the same reading across a whole stock list'],
      ].map(([term, rest], i) => (
        <g key={term}>
          <circle cx="28" cy={92 + i * 30} r="8" fill={pal.teal} opacity="0.16" stroke={pal.teal} strokeWidth="0.9" />
          <text x="28" y={95.5 + i * 30} fontSize="9" fontFamily={MONO} textAnchor="middle" fill={pal.teal}>{i + 1}</text>
          <text x="48" y={95.5 + i * 30} fontSize="9" fontFamily={MONO} fill={pal.textMuted}>
            <tspan fill={pal.text}>{term}</tspan>{rest}
          </text>
        </g>
      ))}

      {/* Once it is ON the chart. Ruled off because these are not a fifth
          and sixth way to apply a tool — they are what you do with one
          afterwards, and neither has a button hinting it exists. */}
      <line x1="16" y1="222" x2="384" y2="222" stroke={pal.border} strokeWidth="1" />
      <text x="16" y="236" fontSize="8.5" fontFamily={MONO} fill={pal.textMuted}>
        <tspan fill={pal.text}>Left-click</tspan> a faint one to darken it ·{' '}
        <tspan fill={pal.text}>Right-click</tspan> any to delete
      </text>
    </>
  ),
  // The order-flow trio on one chart: a swept-and-reclaimed low, an order
  // block, and the CHoCH that flipped structure. Three annotations, three
  // colours — each matching the accent its real overlay uses in the app.
  smartMoney: (pal) => (
    <ChartFrame pal={pal}>
      {/* Equal lows → the shelf where stops rest, raided at candle 6 */}
      <line x1="26" y1="197" x2="196" y2="197" stroke={pal.teal} strokeWidth="1.1" strokeDasharray="4,3" opacity="0.8" />
      <line x1={CANDLE_X(5)} y1="155" x2={CANDLE_X(5)} y2="207" stroke={pal.down} strokeWidth="1.4" />
      <path d={`M ${CANDLE_X(5)} 214 l -4 -6 l 8 0 z`} fill={pal.up} />
      <text x={CANDLE_X(5) + 8} y="212" fontSize="8.5" fontFamily={MONO} fill={pal.up}>SSL swept ✓</text>
      <text x="26" y="192" fontSize="7.5" fontFamily={MONO} fill={pal.teal}>EQUAL LOWS = STOPS</text>
      {/* Order block — the last down-candle before the leg that broke out */}
      <rect x={CANDLE_X(5) - 8} y="118" width="150" height="28" fill="#E8834D" opacity="0.16" />
      <line x1={CANDLE_X(5) - 8} y1="132" x2={CANDLE_X(5) + 142} y2="132" stroke="#E8834D" strokeWidth="0.9" strokeDasharray="3,3" opacity="0.8" />
      <text x={CANDLE_X(5) - 4} y="115" fontSize="8" fontFamily={MONO} fill="#E8834D">ORDER BLOCK ★</text>
      {/* CHoCH — the close through the last swing high, structure flips */}
      <line x1={CANDLE_X(6)} y1="58" x2={CANDLE_X(11)} y2="58" stroke="#B78BFA" strokeWidth="1.1" strokeDasharray="5,3" opacity="0.85" />
      <text x={CANDLE_X(9)} y="50" fontSize="9" fontFamily={MONO} fill="#B78BFA">CHoCH ↑</text>
      <path d={`M ${CANDLE_X(10)} 58 l 0 -14`} stroke="#B78BFA" strokeWidth="1.4" markerEnd="none" />
      <path d={`M ${CANDLE_X(10)} 40 l -4 7 l 8 0 z`} fill="#B78BFA" />
    </ChartFrame>
  ),
  // Masterstroke, ANIMATED — the one stop that plays like a build. The fan
  // draws in, then the vote pills tally up one by one on the right (the
  // REAL EICHERMOT breakdown from a live Nifty-50 scan, not invention),
  // they sum into the gold score pill, and finally the ranked panel rows
  // land. The tour re-mounts each slide (key={idx} on the pane), so the
  // build replays every time the stop is opened. Classes .ms-fan / .ms-in
  // / .ms-score are keyframed in the tour's own <style> block below.
  masterstroke: (pal) => (
    <>
      <rect x="1" y="1" width="398" height="238" rx="14" fill={pal.panel} stroke="#E8B93C" strokeWidth="1.2" />
      {/* ── Chart: rally riding the fan, zones behind it ── */}
      <rect x="10" y="16" width="290" height="10" fill={pal.down} opacity="0.10" />
      <line x1="10" y1="26" x2="300" y2="26" stroke={pal.down} strokeWidth="0.6" opacity="0.4" strokeDasharray="3,3" />
      <text x="14" y="14" fontSize="6.5" fontFamily={MONO} fill={pal.down} opacity="0.9">OB+FVG</text>
      <rect x="16" y="148" width="284" height="10" fill={pal.up} opacity="0.10" />
      <line x1="16" y1="148" x2="300" y2="148" stroke={pal.up} strokeWidth="0.6" opacity="0.45" strokeDasharray="3,3" />
      {/* A rally the way a real Geometriya chart draws one — uneven bodies,
          real wicks, two pullbacks — not evenly spaced toy candles. */}
      {[[130, 142, 126, 146, 1], [122, 131, 118, 136, 1], [124, 133, 120, 139, 0], [112, 125, 108, 130, 1],
        [102, 113, 97, 118, 1], [105, 114, 101, 121, 0], [111, 118, 106, 124, 0], [100, 112, 95, 116, 1],
        [88, 101, 83, 105, 1], [80, 89, 74, 94, 1], [83, 91, 78, 98, 0], [72, 84, 66, 88, 1],
        [62, 73, 56, 78, 1], [66, 74, 61, 82, 0], [72, 79, 67, 86, 0], [60, 73, 54, 78, 1],
        [50, 61, 44, 66, 1], [42, 51, 37, 56, 1], [46, 53, 41, 60, 0], [36, 47, 30, 52, 1],
        [28, 37, 22, 42, 1], [32, 40, 26, 46, 0]].map(([bt, bb, wt, wb, up], i) => {
        const x = 22 + i * 12;
        const col = up ? pal.up : pal.down;
        return (
          <g key={i}>
            <line x1={x} y1={wt} x2={x} y2={wb} stroke={col} strokeWidth="1" />
            <rect x={x - 2.5} y={bt} width="5" height={Math.max(2, bb - bt)} fill={col} />
          </g>
        );
      })}
      {/* The fan — draws itself in first, anchored on the swing low */}
      <circle cx="22" cy="146" r="3.5" fill="#E8B93C" />
      <line className="ms-fan" x1="22" y1="146" x2="238" y2="10" stroke={pal.angle} strokeWidth="1.8" />
      <line className="ms-fan" x1="22" y1="146" x2="298" y2="60" stroke={pal.angle} strokeWidth="1.2" opacity="0.6" strokeDasharray="6,4" />
      <Chip x="10" y="152" w="34" h="13" fill="#E8B93C" fontSize="7.5">43 ▤</Chip>
      <line x1="196" y1="42" x2="262" y2="42" stroke="#B78BFA" strokeWidth="0.8" strokeDasharray="4,3" opacity="0.8" />
      <text x="200" y="38" fontSize="7" fontFamily={MONO} fill="#B78BFA">CHoCH ⚡</text>
      {/* ── The tally — each method's vote lands in turn, then the sum ── */}
      <text x="312" y="20" fontSize="7" fontFamily={MONO} fill={pal.textMuted}>EVERY TOOL VOTES:</text>
      {[['+26', '45° angle', pal.angle], ['+14', 'anchor 56', '#B78BFA'], ['+8', 'smart-money', '#9B8CFF'],
        ['+11', 'time cycle', '#7EB3F5'], ['+6', 'AVWAP', '#D072D0'], ['+10', 'weekly ▲', '#5DCAA5'], ['+6', 'RS +9.1', '#5DCAA5']].map(([pts, lbl, col], i) => (
        <g key={lbl} className="ms-in" style={{ animationDelay: `${1.2 + i * 0.35}s` }}>
          <rect x="310" y={26 + i * 16} width="80" height="13" rx="3" fill={pal.panel2} stroke={col} strokeWidth="0.8" />
          <text x="316" y={35.5 + i * 16} fontSize="7.5" fontFamily={MONO} fill={col} fontWeight="700">{pts}</text>
          <text x="336" y={35.5 + i * 16} fontSize="6.8" fontFamily={MONO} fill={pal.textMuted}>{lbl}</text>
        </g>
      ))}
      <g className="ms-score">
        <line x1="310" y1="142" x2="390" y2="142" stroke="#E8B93C" strokeWidth="0.9" />
        <rect x="310" y="146" width="80" height="18" rx="4" fill="#E8B93C" />
        <text x="350" y="158.5" fontSize="10" fontFamily={MONO} textAnchor="middle" fill="#1a1206" fontWeight="700">✦ 81 ▲ BULL</text>
      </g>
      {/* ── The panel — the ranked list those votes produce ── */}
      <rect x="8" y="172" width="384" height="60" rx="7" fill={pal.panel2} stroke="#E8B93C" strokeWidth="0.9" />
      <text x="16" y="185" fontSize="8" fontFamily={MONO} fill="#E8B93C">✦ Masterstroke</text>
      <Chip x="100" y="175" w="70" h="12" fill="none" stroke={pal.border2} fontSize="6.5">Scope: Nifty 50</Chip>
      <Chip x="340" y="175" w="44" h="12" fill="#E8B93C" fontSize="7">▶ Scan</Chip>
      <text x="240" y="184" fontSize="6.5" fontFamily={MONO} fill={pal.textMuted}>tap a row → every vote</text>
      <line x1="12" y1="190" x2="388" y2="190" stroke={pal.border} strokeWidth="0.8" />
      {[['🔥 ▲ EICHERMOT', '81', '7 tools', '45° 0.43%', 'anchor fair 56', '8,010', 0],
        ['🔥 ▲ BAJAJ-AUTO', '71', '7 tools', '45° −0.31%', 'anchor fair 43', '11,700', 1]].map(([sym, sc, tools, ang, anc, cl, i]) => (
        <g key={sym} className="ms-in" style={{ animationDelay: `${4.6 + i * 0.3}s` }}>
          {i === 0 && <rect x="10" y="193" width="380" height="17" rx="3" fill="#E8B93C10" />}
          <text x="16" y={205 + i * 16} fontSize="7.5" fontFamily={MONO} fill={pal.up}>{sym}</text>
          <text x="130" y={205 + i * 16} fontSize="8.5" fontFamily={MONO} fill="#5DCAA5" textAnchor="end" fontWeight="700">{sc}</text>
          <text x="172" y={205 + i * 16} fontSize="6.8" fontFamily={MONO} fill="#E8B93C" textAnchor="end">{tools}</text>
          <text x="234" y={205 + i * 16} fontSize="6.8" fontFamily={MONO} fill={pal.angle} textAnchor="end">{ang}</text>
          <text x="316" y={205 + i * 16} fontSize="6.8" fontFamily={MONO} fill="#EF9F27" textAnchor="end">{anc}</text>
          <text x="386" y={205 + i * 16} fontSize="7" fontFamily={MONO} fill={pal.text} textAnchor="end">{cl}</text>
        </g>
      ))}
    </>
  ),
  // Paper Trade as the panel shows it since 5-Sep: the three stat tiles with
  // their explanatory sub-lines (the Total P&L tile says where its number
  // comes from), the order row with the market selector (₹ / $ / R — a
  // wallet per market), and the Closed-positions ledger underneath — one
  // row per round-trip with charges on both sides. There is no "algo book"
  // any more: every trade in this book is one the user placed.
  paper: (pal) => (
    <>
      <rect x="1" y="1" width="398" height="238" rx="14" fill={pal.panel} stroke="#6FA0FF55" />
      <text x="18" y="22" fontSize="9" fontFamily={MONO} fill="#6FA0FF">📄 PAPER TRADE</text>
      <Chip x="150" y="12" w="120" h="14" fill="none" stroke={pal.textMuted} fontSize="7">practice money — not real</Chip>
      <Chip x="300" y="12" w="82" h="14" fill="none" stroke={pal.border2} fontSize="6.5">attempt #1 · ↺ Reset</Chip>
      {/* The tiles — headline, then the line that says what the number is */}
      {/* Unequal widths: the P&L tile's sub-line is the longest thing on
          the slide (it itemises booked vs open), so it gets the room. */}
      {[['💰 Cash', '₹8,42,180', '$1,910 · R3,400 + rupees', pal.text, 14, 100],
        ['📊 Portfolio value', '₹10,31,540', '3 holdings', pal.text, 120, 110],
        ['📈 Total P&L', '+₹31,540', '▲ 3.15% · booked +₹12,400 · open +₹19,140', pal.up, 236, 150]].map(([lbl, val, sub, col, x, w], i) => (
        <g key={lbl}>
          <rect x={x} y="32" width={w} height="44" rx="6" fill={pal.panel2} stroke={i === 2 ? pal.up + '55' : pal.border} />
          <text x={x + 8} y="44" fontSize="6.8" fontFamily={MONO} fill={pal.textMuted}>{lbl}</text>
          <text x={x + 8} y="59" fontSize="12" fontFamily={MONO} fill={col} fontWeight="700">{val}</text>
          <text x={x + 8} y="70" fontSize="5.5" fontFamily={MONO} fill={pal.textMuted}>{sub}</text>
        </g>
      ))}
      {/* Order row — market first, because it decides the money */}
      <rect x="14" y="86" width="372" height="24" rx="5" fill={pal.panel2} stroke={pal.border} />
      <Chip x="22" y="91" w="30" h="14" fill={pal.up} fontSize="7.5">BUY</Chip>
      <Chip x="58" y="91" w="46" h="14" fill="none" stroke={pal.border2} fontSize="7">NSE · ₹ ▾</Chip>
      <text x="112" y="101" fontSize="8.5" fontFamily={MONO} fill={pal.text}>RELIANCE</text>
      <text x="178" y="101" fontSize="8.5" fontFamily={MONO} fill={pal.textMuted}>25</text>
      <text x="196" y="101" fontSize="8.5" fontFamily={MONO} fill={pal.textMuted}>@ 1,412.50</text>
      <Chip x="262" y="91" w="66" h="14" fill="#6FA0FF" fontSize="7.5">Place order</Chip>
      <text x="334" y="101" fontSize="6.2" fontFamily={MONO} fill={pal.textMuted}>fills at once</text>
      {/* Closed positions — the ledger */}
      <text x="18" y="126" fontSize="7.5" fontFamily={MONO} fill={pal.textMuted}>✅ CLOSED POSITIONS <tspan fontSize="6.3">— every round-trip, charges on both sides · click a row for its fills</tspan></text>
      <line x1="14" y1="132" x2="386" y2="132" stroke={pal.border} strokeWidth="1" />
      {[['Scrip', 22, false], ['Mkt', 96, false], ['Qty', 128, true], ['Bought at', 186, true], ['Sold at', 240, true], ['Charges', 290, true], ['Net', 338, true], ['Held', 380, true]].map(([h, x, r]) => (
        <text key={h} x={x} y="143" fontSize="6.3" fontFamily={MONO} fill={pal.textMuted} textAnchor={r ? 'end' : 'start'}>{h}</text>
      ))}
      {[['TATASTEEL', 'NSE', '50', '₹142.10', '₹151.80', '₹29', '+₹456', '6d', pal.up],
        ['AAPL', 'US', '4', '$228.40', '$236.10', '$2.1', '+$28.7', '9d', pal.up],
        ['INFY', 'NSE', '10', '₹1,512', '₹1,488', '₹30', '−₹270', '3d', pal.down],
        ['NPN', 'JSE', '2', 'R3,910', 'R4,040', 'R7.9', '+R252', '12d', pal.up]].map(([sym, mkt, q, b, s, c, n, h, col], i) => (
        <g key={sym}>
          {i % 2 === 0 && <rect x="14" y={149 + i * 17} width="372" height="16" rx="2" fill={pal.border} opacity="0.18" />}
          <text x="22" y={161 + i * 17} fontSize="7.5" fontFamily={MONO} fill={pal.text}>{sym}</text>
          <text x="96" y={161 + i * 17} fontSize="6.8" fontFamily={MONO} fill={pal.textMuted}>{mkt}</text>
          <text x="128" y={161 + i * 17} fontSize="7.5" fontFamily={MONO} fill={pal.textMuted} textAnchor="end">{q}</text>
          <text x="186" y={161 + i * 17} fontSize="7.5" fontFamily={MONO} fill={pal.textMuted} textAnchor="end">{b}</text>
          <text x="240" y={161 + i * 17} fontSize="7.5" fontFamily={MONO} fill={pal.textMuted} textAnchor="end">{s}</text>
          <text x="290" y={161 + i * 17} fontSize="7.5" fontFamily={MONO} fill={pal.textMuted} textAnchor="end">{c}</text>
          <text x="338" y={161 + i * 17} fontSize="7.5" fontFamily={MONO} fill={col} fontWeight="700" textAnchor="end">{n}</text>
          <text x="380" y={161 + i * 17} fontSize="7.5" fontFamily={MONO} fill={pal.textMuted} textAnchor="end">{h}</text>
        </g>
      ))}
      <text x="18" y="231" fontSize="6.5" fontFamily={MONO} fill={pal.textMuted}>a wallet per market · real prices, realistic charges · every trade here is one you placed</text>
    </>
  ),
  // Geo-Tutor, ANIMATED — the second stop that plays like a build, because
  // the thing it teaches IS motion: the tutor points while it speaks. Three
  // sentences in the read-out panel light up in turn (the karaoke tint), and
  // with each one the chart's pointer moves — a pulsing ring on the swing
  // low the first sentence names, on the candle sitting on the line for the
  // second, and a dashed flash across the Gann level for the third, each with
  // its price on the axis. Ink, not colour, exactly as renderVoiceMarks draws
  // it (white on dark, near-black on light), so the pointer never reads as
  // another study. .gt-s0/1/2 and .gt-ring are keyframed in the tour's own
  // <style> block; the pane re-mounts per slide so it replays on every visit.
  tutor: (pal) => {
    const INK = pal.text;
    const ON_INK = pal.panel;
    // Sentence i speaks during window i of a 7.5 s cycle; the pointer for
    // that sentence shares its class, so eye and ear move together.
    const S = [
      { txt: '45° line rises from the 12 Aug swing low at 1,238.40.', cls: 'gt-s0' },
      { txt: 'Price rides it: the last three closes sit on the line.', cls: 'gt-s1' },
      { txt: 'Above: the Gann 1×1 at 1,312.00 — expect a pause there.', cls: 'gt-s2' },
    ];
    const ring = (cx, cy, cls) => (
      <g className={cls}>
        <circle cx={cx} cy={cy} r="9" fill="none" stroke={ON_INK} strokeWidth="3.4" opacity="0.7" />
        <circle className="gt-ring" cx={cx} cy={cy} r="9" fill="none" stroke={INK} strokeWidth="1.6" />
        <circle cx={cx} cy={cy} r="2.2" fill={INK} />
      </g>
    );
    const flash = (y, price, cls) => (
      <g className={cls}>
        <line x1="14" y1={y} x2="344" y2={y} stroke={ON_INK} strokeWidth="3" opacity="0.6" />
        <line x1="14" y1={y} x2="344" y2={y} stroke={INK} strokeWidth="1.1" strokeDasharray="5,3" />
        <rect x="346" y={y - 6.5} width="42" height="13" rx="3" fill={INK} />
        <text x="367" y={y + 3} fontSize="7" fontFamily={MONO} fontWeight="700" fill={ON_INK} textAnchor="middle">{price}</text>
      </g>
    );
    return (
      <ChartFrame pal={pal}>
        {/* The studies the tutor placed: a 45° angle off the confirmed swing
            low, and the Gann box's 1×1 level above price. */}
        <line x1="14" y1="48" x2="386" y2="48" stroke={pal.gann} strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />
        <text x="18" y="44" fontSize="7" fontFamily={MONO} fill={pal.gann}>GANN 1×1</text>
        {/* Glow under the angle while a sentence about it is being spoken —
            renderDrawings does the same: the described study brightens. */}
        {/* strokeOpacity, not opacity: the .gt-s* keyframes animate the CSS
            opacity property, which would override an opacity attribute and
            turn this 28% halo into a solid 7px bar for its whole window. */}
        <line className="gt-s0" x1="110" y1="190" x2="386" y2="40" stroke={pal.angle} strokeWidth="7" strokeOpacity="0.28" strokeLinecap="round" />
        <line className="gt-s1" x1="110" y1="190" x2="386" y2="40" stroke={pal.angle} strokeWidth="7" strokeOpacity="0.28" strokeLinecap="round" />
        <line x1="110" y1="190" x2="386" y2="40" stroke={pal.angle} strokeWidth="2" strokeLinecap="round" />
        <circle cx="110" cy="190" r="3.6" fill={pal.angle} />
        <text x="122" y="200" fontSize="8" fontFamily={MONO} fill={pal.angle}>45°</text>
        <Chip x="120" y="14" w="34" h="12" fill={pal.angle} fontSize="7">★ tutor</Chip>
        {/* The pointer, sentence by sentence */}
        {flash(190, '1,238.40', 'gt-s0')}
        {ring(110, 190, 'gt-s0')}
        {ring(CANDLE_X(9), 85, 'gt-s1')}
        {flash(48, '1,312.00', 'gt-s2')}

        {/* The floating tutor button, just above the time axis */}
        <circle cx="100" cy="214" r="11" fill={pal.panel2} stroke={INK} strokeWidth="1" />
        <TutorGlyph x="93" y="207" size="14" color={INK} />

        {/* The read-out panel — frosted, draggable by its header */}
        <rect x="150" y="120" width="236" height="112" rx="8" fill={pal.panel2} stroke={INK} strokeWidth="0.9" opacity="0.93" />
        <text x="157" y="132" fontSize="7" fontFamily={MONO} fill={pal.textMuted}>⠿</text>
        <TutorGlyph x="166" y="125" size="9" color={pal.text} />
        <text x="178" y="132.5" fontSize="7.2" fontFamily={MONO} fontWeight="700" fill={pal.text}>Geo-Tutor — 45° Angle</text>
        <text x="298" y="132.5" fontSize="6.2" fontFamily={MONO} fill={pal.textMuted}>speaking…</text>
        <text x="360" y="133" fontSize="7.5" fontFamily={MONO} fill={pal.textMuted}>⚙</text>
        <text x="375" y="133" fontSize="8" fontFamily={MONO} fill={pal.textMuted}>✕</text>
        <line x1="150" y1="138" x2="386" y2="138" stroke={pal.border} strokeWidth="0.8" />
        {/* Set-up bar */}
        <Chip x="157" y="142" w="78" h="11" fill="none" stroke={pal.text} fontSize="6">★ Apply studies</Chip>
        <Chip x="239" y="142" w="30" h="11" fill="none" stroke={pal.border2} fontSize="6">Keep 3</Chip>
        <Chip x="273" y="142" w="26" h="11" fill="none" stroke={pal.border2} fontSize="6">Clear</Chip>
        <text x="380" y="150" fontSize="5.8" fontFamily={MONO} fill={pal.textMuted} textAnchor="end">Favourites (tutor’s pick) ▾</text>
        <line x1="150" y1="157" x2="386" y2="157" stroke={pal.border} strokeWidth="0.8" />
        {/* Karaoke read-out: base text always there, the spoken line tinted */}
        {S.map((s, i) => (
          <g key={s.cls}>
            <rect className={s.cls} x="154" y={163 + i * 15} width="228" height="12.5" rx="3" fill={pal.angle} fillOpacity="0.14" />
            <text x="158" y={172 + i * 15} fontSize="6.5" fontFamily={MONO} fill={pal.textMuted}>{s.txt}</text>
            <text className={s.cls} x="158" y={172 + i * 15} fontSize="6.5" fontFamily={MONO} fill={pal.angle} fontWeight="700">{s.txt}</text>
          </g>
        ))}
        <line x1="150" y1="212" x2="386" y2="212" stroke={pal.border} strokeWidth="0.8" />
        <text x="158" y="224" fontSize="5.9" fontFamily={MONO} fill={pal.textMuted}>EN · हिं   🔊 Sound On · 📄 Text On   drag the header to move · ⏹ on the button stops it</text>
      </ChartFrame>
    );
  },
  // The Trade ▾ menu — three doors, and the honest word on the third one.
  // Drawn as the toolbar shows it: a button whose dot carries state (grey =
  // nothing running), dropping a menu of Paper / Search / Live with the same
  // hint lines the real menu shows a client account.
  trade: (pal) => (
    <ChartFrame pal={pal} chrome={false} dim>
      <rect x="14" y="10" width="372" height="22" rx="6" fill={pal.panel2} stroke={pal.border} />
      <Chip x="22" y="15" w="44" h="12" fill="none" stroke={pal.border2} fontSize="6.5">Overlays</Chip>
      <Chip x="70" y="15" w="44" h="12" fill="none" stroke={pal.border2} fontSize="6.5">✦ Master</Chip>
      <Chip x="118" y="15" w="36" h="12" fill="none" stroke={pal.border2} fontSize="6.5">Live</Chip>
      <rect x="300" y="14" width="78" height="14" rx="4" fill="#E24B4A22" stroke="#E24B4A" strokeWidth="0.9" />
      <circle cx="310" cy="21" r="2.6" fill={pal.textMuted} />
      <text x="342" y="24.5" fontSize="7.5" fontFamily={MONO} fontWeight="700" fill={pal.text} textAnchor="middle">Trade ▾</text>
      {/* The dropdown */}
      <rect x="206" y="38" width="180" height="94" rx="6" fill={pal.panel2} stroke={pal.border2} />
      {[['Paper', 'Practise by hand with ₹10,00,000', '#7EB3F5', true],
        ['Search', 'Where every strategy stands, scrip by scrip', '#7EB3F5', false],
        ['Live', 'Not permitted by exchange', '#E24B4A', false]].map(([lbl, hint, col, on], i) => (
        <g key={lbl}>
          {on && <rect x="210" y={43 + i * 30} width="172" height="26" rx="4" fill={col} opacity="0.14" />}
          <text x="218" y={55 + i * 30} fontSize="8.5" fontFamily={MONO} fontWeight="700" fill={col}>{lbl}</text>
          <text x="218" y={64.5 + i * 30} fontSize="6" fontFamily={MONO} fill={pal.textMuted}>{hint}</text>
        </g>
      ))}
      {/* What each door is, in one line apiece */}
      {[['Paper', 'your practice book · ₹ $ R wallets · every trade yours', pal.gann],
        ['Search', "the server's view of every strategy, swept every 5 min", pal.gann],
        ['Live', 'real orders · switched off for client accounts', '#E24B4A']].map(([k, v, col], i) => (
        <g key={k}>
          <circle cx="26" cy={152 + i * 22} r="7.5" fill={col} opacity="0.16" stroke={col} strokeWidth="0.9" />
          <text x="26" y={155.5 + i * 22} fontSize="8" fontFamily={MONO} textAnchor="middle" fill={col}>{i + 1}</text>
          <text x="42" y={155.5 + i * 22} fontSize="7.5" fontFamily={MONO} fill={pal.textMuted}><tspan fill={pal.text} fontWeight="700">{k}</tspan> — {v}</text>
        </g>
      ))}
      <line x1="14" y1="216" x2="386" y2="216" stroke={pal.border} strokeWidth="1" />
      <circle cx="24" cy="228" r="2.6" fill={pal.textMuted} />
      <text x="32" y="231" fontSize="7" fontFamily={MONO} fill={pal.textMuted}>grey dot = nothing running ·</text>
      <circle cx="172" cy="228" r="2.6" fill="#3fe0b0" />
      <text x="180" y="231" fontSize="7" fontFamily={MONO} fill={pal.textMuted}>lit = your paper book is open · colour carries state, never identity</text>
    </ChartFrame>
  ),
  // Help and the account menu: the logo menu as it reads today (Refer & Earn
  // moved in here 5-Sep, Geo-Tutor's switch sits at its foot), the round ?
  // button at the bottom-right of the chart, and a Video Guides card.
  help: (pal) => (
    <ChartFrame pal={pal} chrome={false} dim>
      <rect x="14" y="12" width="158" height="200" rx="8" fill={pal.panel2} stroke={pal.border2} />
      <text x="24" y="27" fontSize="8" fontFamily={MONO} fontWeight="700" fill={pal.text}>☰  Geometriya</text>
      <line x1="14" y1="33" x2="172" y2="33" stroke={pal.border} strokeWidth="0.8" />
      {[['🔌 Data Connection', pal.textMuted], ['📌 Install App', '#5DCAA5'], ['🎁 Refer & Earn', pal.gann],
        ['🎥 Video Guides', pal.textMuted], ['🚀 Take the Tour', pal.text], ['?  Help', pal.textMuted],
        ['⬇ Backup', pal.textMuted], ['⬆ Restore', pal.textMuted], ['🎓 Geo-Tutor: On   ▾', pal.textMuted]].map(([lbl, col], i) => (
        <g key={lbl}>
          {i === 4 && <rect x="18" y={38 + i * 19} width="150" height="16" rx="4" fill={ACCENT} opacity="0.18" />}
          <text x="26" y={50 + i * 19} fontSize="7.8" fontFamily={MONO} fill={col} fontWeight={i === 4 ? '700' : '400'}>{lbl}</text>
        </g>
      ))}
      {/* Video Guides card */}
      <rect x="196" y="40" width="190" height="96" rx="8" fill={pal.panel2} stroke={pal.border} />
      <text x="206" y="55" fontSize="7.5" fontFamily={MONO} fill={pal.textMuted}>🎥 VIDEO GUIDES</text>
      <rect x="206" y="62" width="170" height="52" rx="5" fill={pal.panel} stroke={pal.border} />
      <circle cx="291" cy="88" r="12" fill={ACCENT} opacity="0.9" />
      <path d="M 287 82 L 297 88 L 287 94 Z" fill="#fff" />
      <text x="206" y="128" fontSize="7" fontFamily={MONO} fill={pal.text}>The 45° Angle — full walkthrough · 6:40</text>
      {/* The ? button and what it does */}
      <circle cx="366" cy="204" r="13" fill={pal.panel2} stroke={pal.textMuted} strokeWidth="1.3" />
      <text x="366" y="209" fontSize="13" fontFamily={MONO} textAnchor="middle" fill={pal.textMuted}>?</text>
      <text x="346" y="202" fontSize="6.5" fontFamily={MONO} fill={pal.textMuted} textAnchor="end">Help from anywhere →</text>
      <text x="346" y="212" fontSize="6.5" fontFamily={MONO} fill={pal.textMuted} textAnchor="end">search any tool · look up BOS, FVG, CHoCH</text>
      <text x="196" y="158" fontSize="7" fontFamily={MONO} fill={pal.textMuted}>Your drawings live on THIS device only —</text>
      <text x="196" y="170" fontSize="7" fontFamily={MONO} fill={pal.textMuted}>⬇ Backup before you change phones.</text>
    </ChartFrame>
  ),
};

// Geo-Tutor's mark — a teacher at a chart board — copied from GeoTutorIcon in
// Geometriya.jsx (48-unit viewBox) so the tour draws the same glyph the app
// puts on its button. Not imported: pulling Geometriya.jsx in here would be a
// circular import for one icon.
function TutorGlyph({ x, y, size, color }) {
  const k = size / 48;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} fill="none">
      <rect x="21" y="6" width="23" height="17" rx="2" stroke={color} strokeWidth="2.6" />
      <path d="M25 18l4.5-5 3.5 3 6.5-6.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="9.4" r="4.4" fill={color} />
      <path d="M11 15c-3.5 0-6 2.3-6 5.6v9.2h12v-9.2c0-3.3-2.5-5.6-6-5.6z" fill={color} />
      <rect x="6.2" y="31.2" width="4.1" height="10.8" rx="1.7" fill={color} />
      <rect x="11.7" y="31.2" width="4.1" height="10.8" rx="1.7" fill={color} />
      <path d="M13.4 17.6 18.4 14.6 19.8 17 14.8 20z" fill={color} />
    </g>
  );
}

// The hero is drawn wider than the rest so its height lands near the real
// screenshots' (1568×773) — otherwise the pane jumps when you leave slide 1.
const VIEWBOX = { welcome: '0 0 400 200' };

function TourVisual({ kind, pal }) {
  const draw = VISUALS[kind] || VISUALS.welcome;
  return (
    <svg viewBox={VIEWBOX[kind] || '0 0 400 240'} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {draw(pal)}
    </svg>
  );
}

// ── Slide deck — edit here to add/reorder slides or deepen the copy. Each
//    slide pairs a concrete "what/why" lead with two concrete "how" tips —
//    real button names and menu paths, not abstract feature names — so a
//    first-time user can act on it immediately, not just recognize it later.
const SLIDES = [
  {
    icon: '🚀', accent: '#5A83FF', visual: 'welcome', screenshot: shotWelcome,
    title: 'Welcome to Geometriya',
    // Leads with what it DOES. The old copy opened on Mitotic Scaling, RSI
    // and MACD — three terms a first-timer hasn't met, used to define the
    // product by contrast with tools they've never used. Mitotic Scaling now
    // waits for stop 2, where there is room to actually explain it.
    lead: '"Geometriya" is the Russian word for geometry. This software applies that geometry to price charts: rather than adding indicators on top, it draws the shape the market is already making — the angles it climbs at, the levels it turns from, and the dates those turns tend to land on. And you are not left alone with it: Geo-Tutor, your chart tutor, can set a chart up for you and read it aloud.',
    // Deliberately only two bullets: the next stops each demo a tool, so
    // listing them here just says the same thing twice. Slide 1's job is what
    // Geometriya *is* — and where the method is written down in full.
    tips: [
      'The next twelve stops cover each part in turn — about six minutes. Two to remember: 🎓 Geo-Tutor, which reads any chart to you, and the ✦ gold Masterstroke stop near the end.',
      '📖 The full method: our book Geometrical Analysis, on Amazon.',
    ],
    narration: {
      en: "Welcome to Geometriya. The name is the Russian word for geometry, and that is exactly what this software does: it applies geometry to price charts. Rather than adding indicators on top of the price, it draws the shape the market is already making — the angles it climbs at, the levels it turns from, and the dates those turns tend to land on. Every tool here reads the same chart in its own independent way, and the real power is where those readings agree — a scan called Masterstroke counts that agreement for you, and it has its own stop near the end of this tour. You are not left alone with any of it, either: Geo-Tutor, your chart tutor, can set a chart up for you and read it aloud, pointing at each thing it names — it has a stop of its own. And nothing here needs real money to try: you get ten lakh rupees of practice money to test everything with. The next twelve stops take about six minutes. If you want the method in full, it is set out in our book, Geometrical Analysis, available on Amazon. Press Next to begin.",
      hi: 'जियोमेट्रिया में आपका स्वागत है। यह नाम रूसी भाषा में ज्योमेट्री यानी रेखागणित का शब्द है, और यही यह सॉफ्टवेयर करता है: प्राइस चार्ट पर ज्योमेट्री लगाता है। price के ऊपर indicators जोड़ने के बजाय, यह वही आकार खींचता है जो बाज़ार पहले से बना रहा है — किन कोणों पर चढ़ता है, किन स्तरों से पलटता है, और वे पलटाव किन तारीखों के आसपास आते हैं। यहाँ का हर टूल एक ही चार्ट को अपने स्वतंत्र तरीके से पढ़ता है, और असली ताक़त वहाँ है जहाँ ये पढ़ाइयाँ आपस में सहमत हों — मास्टरस्ट्रोक नाम का स्कैन यही सहमति आपके लिए गिनता है, और इस टूर के आख़िर के पास उसका अपना पड़ाव है। और आप इसमें अकेले भी नहीं हैं: जियो-ट्यूटर, आपका चार्ट ट्यूटर, चार्ट को आपके लिए तैयार कर सकता है और उसे बोलकर पढ़ सकता है, हर उस चीज़ की ओर इशारा करते हुए जिसका वह नाम लेता है — उसका अपना पड़ाव है। और इसे आज़माने के लिए असली पैसे की ज़रूरत भी नहीं: दस लाख रुपये की practice money आपको मिलती है। आगे के बारह पड़ाव लगभग छह मिनट लेंगे। अगर आप पूरी विधि जानना चाहें, तो वह हमारी किताब ज्योमेट्रिकल एनालिसिस में दी गई है, जो अमेज़न पर उपलब्ध है। शुरू करने के लिए नेक्स्ट दबाइए।',
    },
  },
  {
    icon: '📈', accent: '#5DCAA5', visual: 'chart', screenshot: shotChart,
    title: 'The Chart — Your Workspace',
    // The swing-low definition lives HERE, on the first tool stop, because
    // stops 3, 4, 5 and 9 all measure from one and none of them defined it.
    // One sentence early saves four later.
    lead: 'Every tool starts on the chart. The small box beside the search bar picks the market — NSE, US or JSE, with FX and crypto too — then search any stock or index and switch timeframes: one candle per day, per week, or per month, and intraday once your broker is connected. One word worth knowing before the tools: a swing low is simply a bottom the market made — a bar lower than the bars either side, where a fall stopped and a rise began. A swing high is the same the other way up. Nearly everything Geometriya draws is measured from one of these.',
    tips: [
      'Type a symbol in the search bar to load it; the box next to it switches market (NSE · US · JSE). Scroll to zoom, drag to pan.',
      'The magnet snaps your click to the exact high or low of a candle, so your angles start from the real turning point and not a pixel nearby.',
    ],
    narration: {
      en: "Every tool in Geometriya starts on the chart. The small box beside the search bar picks the market — N S E, U S or J S E, with F X and crypto as well. Search any stock or index, and switch timeframes — one candle per day, per week, or per month, and intraday once your broker is connected. Scroll to zoom and drag to pan. There is one word worth knowing before we go on to the tools. A swing low is simply a bottom the market made: a bar lower than the bars on either side of it, where a fall stopped and a rise began. A swing high is the same thing the other way up. Nearly everything Geometriya draws is measured from one of these, so when you hear swing low, picture that bottom. The magnet helps here — it snaps your click to the exact high or low of a candle, so your angles start from the real turning point rather than a pixel near it.",
      hi: 'जियोमेट्रिया का हर टूल चार्ट से शुरू होता है। सर्च बार के बगल का छोटा बॉक्स बाज़ार चुनता है — एनएसई, यूएस या जेएसई, और साथ में एफएक्स और क्रिप्टो भी। कोई भी स्टॉक या इंडेक्स खोजिए, और टाइमफ्रेम बदलिए — एक कैंडल एक दिन की, एक हफ़्ते की, या एक महीने की, और ब्रोकर जुड़ने पर इंट्राडे भी। ज़ूम के लिए स्क्रॉल और पैन के लिए ड्रैग कीजिए। टूल्स पर जाने से पहले एक शब्द जान लेना ज़रूरी है। स्विंग लो का मतलब है बाज़ार ने जो तली बनाई: वह बार जो अपने दोनों तरफ़ के बारों से नीचा हो, जहाँ गिरावट रुकी और चढ़ाई शुरू हुई। स्विंग हाई इसका उल्टा है। जियोमेट्रिया जो कुछ भी खींचता है, लगभग सब इन्हीं से नापा जाता है — तो जब स्विंग लो सुनें, वही तली सोचिए। मैग्नेट यहाँ मदद करता है: यह आपके क्लिक को कैंडल की सटीक हाई या लो पर स्नैप कर देता है, ताकि एंगल असली मोड़ से शुरू हो, उसके पास के किसी pixel से नहीं।',
    },
  },
  {
    icon: '📐', accent: '#F2B33D', visual: 'angle45', screenshot: shotAngle45,
    // Opens Video Guides straight at this tool's walkthrough (see helpTopics).
    videoId: 'qipZuq9JA14',
    title: 'The 45° Angle',
    lead: 'Draw one diagonal line up from a swing low, at a fixed 45° slope — one unit of price for one unit of time. W. D. Gann, the trader this method comes from, held that price respects that slope: watch and you will see it bounce off the line, pause on it, or break through it, and each of those tells you something different about how strong the move is.',
    tips: [
      'Click ↑45 in the toolbar, then click a swing low on the chart to place it (↓45 plants the descending one from a high).',
      'Dream-45 and the 45° Scanner find stocks reacting to their own angle right now.',
    ],
    narration: {
      en: "This is the heart of Geometriya: the forty five degree angle. Click the up forty five button in the toolbar, then click a swing low on the chart — that bottom we talked about a moment ago. It draws one diagonal line rising at a fixed slope, one unit of price for one unit of time. W. D. Gann, the trader this method comes from, held that price respects that slope. Watch it and you will see price bounce off the line, pause on it, or break through it — and each of those tells you something different about how strong the move is. Dream forty five and the angle scanner find stocks reacting to their own angle right now.",
      hi: 'यह जियोमेट्रिया का दिल है: पैंतालीस डिग्री का एंगल। टूलबार में पैंतालीस डिग्री टूल पर क्लिक कीजिए, फिर चार्ट पर किसी स्विंग लो पर क्लिक कीजिए। यह एक तय ढलान पर एक डायगनल लाइन खींचता है, और प्राइस अक्सर उसी लाइन को छूते ही प्रतिक्रिया देता है — बाउंस, पॉज़ या ब्रेक। ड्रीम फोर्टी फाइव और स्कैनर ऐसे स्टॉक्स ढूंढते हैं जो अभी अपने एंगल पर प्रतिक्रिया दे रहे हैं।',
    },
  },
  {
    icon: '⚡', accent: '#B78BFA', visual: 'auto', screenshot: shotAuto,
    videoId: '4W63k2r8roI',
    title: 'Auto ∠ — Angles Without Clicking',
    lead: 'Auto ∠ finds the latest swing low itself and draws the angles for you — a fan of them, at different steepnesses: the 45° line, one twice as steep, and one half as steep, so you can see which pitch this particular stock is respecting. Auto Scan repeats the same search across your whole watchlist or an index.',
    tips: [
      'Turn on Auto ∠ from the toolbar — it redraws itself as new candles form.',
      'Auto Scan ranks results by how close each stock sits to its own angle.',
    ],
    narration: {
      en: "Auto Angle takes the clicking out of it: turn it on from the toolbar, and it finds the latest swing low by itself, then draws the angles automatically, redrawing as new candles form. It draws a fan of them at different steepnesses — the forty five degree line, one twice as steep, and one half as steep — so you can see which pitch this particular stock is respecting. Auto Scan runs that same detection across your whole watchlist or an entire index, and ranks every stock by how close it sits to its own angle.",
      hi: 'ऑटो एंगल क्लिक करने की ज़रूरत खत्म कर देता है: टूलबार से इसे ऑन कीजिए, और यह खुद ताज़ा स्विंग लो ढूंढकर पूरा एंगल फैन बना देता है, नए कैंडल बनने पर खुद अपडेट होता रहता है। ऑटो स्कैन यही खोज पूरी वॉचलिस्ट या पूरे इंडेक्स पर चलाता है, और हर स्टॉक को उसके एंगल से नज़दीकी के हिसाब से रैंक करता है।',
    },
  },
  {
    icon: '🔲', accent: '#7EB3F5', visual: 'gannbox', screenshot: shotGannBox,
    videoId: 'AdXNna-YI7s',
    title: 'Gann Box & Geometry Tools',
    lead: 'The Gann Box takes one completed move — a low to a high — and divides it into a square grid. The lines inside then mark the levels that move is likely to pause or turn at on the way back, and the vertical divisions mark the dates it is likely to do so. In short: the horizontal lines answer "at what price", the vertical ones answer "around when".',
    tips: [
      'Click Gann ▲ or Gann ▼ from a pivot on the chart to place the box.',
      'Right-click either Gann button to adjust subdivisions, fan angles and colours.',
    ],
    narration: {
      en: "The Gann Box takes one completed move — a low up to a high — and divides it into a square grid. Click Gann up or Gann down from a turning point on the chart to place it. The horizontal lines inside answer at what price the move is likely to pause or turn on its way back, and the vertical divisions answer roughly when. Read price against the one by one diagonal and the arcs the same way. Right click either Gann button to adjust subdivisions, fan angles and colours. Geometriya has more overlays built on the same idea, like Mirror Fold, Zero Bounce and Square of Range.",
      hi: 'गैन बॉक्स किसी प्राइस मूव को एक स्क्वेयर ग्रिड में बांटता है। चार्ट पर किसी पिवट से गैन अप या गैन डाउन पर क्लिक करके इसे लगाइए, और अंदर की वन बाय वन डायगनल, आर्क्स और टाइम डिविज़न के सामने प्राइस पढ़िए — ये दिखाते हैं कि प्राइस और टाइम कहाँ मिल सकते हैं। सेटिंग्स के लिए किसी भी गैन बटन पर राइट क्लिक कीजिए। जियोमेट्रिया में मिरर फोल्ड, ज़ीरो बाउंस और स्क्वेयर ऑफ रेंज जैसे और भी ओवरले हैं, इसी सोच पर बने हुए।',
    },
  },
  {
    // Drawn, no capture yet. Sits right after the geometry stops: geometry
    // says WHERE the levels are; this stop says WHO is in control — the
    // other half of the reading, and the language Masterstroke speaks later.
    icon: '🧠', accent: '#9B8CFF', visual: 'smartMoney',
    title: 'The Smart-Money Reading',
    // Story first, jargon second. The old lead opened with six unexplained
    // terms in four sentences; a novice had nothing to hang them on. The
    // stop-hunt story is the one explanation that makes all three tools
    // obvious at once, so the terms now arrive as names for things the
    // reader has already pictured.
    lead: 'Here is the idea in one picture. Everyone who buys puts a stop-loss somewhere below — and the big players know exactly where those sit. Price is often pushed down just far enough to trigger them, the big money buys from the panic selling, and then it turns back up. Geometriya marks each part of that: where the stops were taken (Liquidity Sweeps), whether the trend genuinely changed hands afterwards (Market Structure), and the candles the big buying came from (Order Blocks). Geometry tells you where the levels are; this tells you who is in control at them.',
    tips: [
      'Turn each on from the Overlays panel — Liquidity Sweeps, Market Structure and Order Blocks sit together as one family.',
      'Tap any marker on the chart and it explains itself in plain language — every label opens a full breakdown.',
      'Short forms like BOS, CHoCH and FVG are all defined under the round ? button at the bottom-right of the chart.',
    ],
    narration: {
      en: "Here is the idea in one picture. Everyone who buys a stock puts a stop loss somewhere below it — and the big players know exactly where those stops are sitting. Price often gets pushed down just far enough to trigger them, the big money buys from all that panic selling, and then price turns back up. Geometriya marks each part of that story. Liquidity Sweeps show where the stops were taken and price closed straight back up. Market Structure tells you whether the trend genuinely changed hands afterwards, and shades the range into its cheap and expensive halves. Order Blocks mark the candles that big buying came from. Turn each on from the Overlays panel, and tap any marker on the chart — every label explains itself in plain language, and every short form is defined under the question mark button at the bottom right. Geometry tells you where the levels are. This tells you who is in control at them.",
      hi: 'पूरी बात एक तस्वीर में समझिए। जो भी शेयर खरीदता है, वह नीचे कहीं स्टॉप-लॉस लगाता है — और बड़े खिलाड़ी जानते हैं कि वे स्टॉप ठीक कहाँ पड़े हैं। अक्सर price को उतना ही नीचे धकेला जाता है कि वे स्टॉप ट्रिगर हो जाएँ, बड़ा पैसा उसी घबराहट की बिकवाली से खरीद लेता है, और फिर price वापस ऊपर मुड़ जाता है। जियोमेट्रिया इस कहानी का हर हिस्सा चिह्नित करता है। लिक्विडिटी स्वीप्स दिखाते हैं कि स्टॉप कहाँ छीने गए और price तुरंत वापस ऊपर बंद हुआ। मार्केट स्ट्रक्चर बताता है कि उसके बाद ट्रेंड सचमुच बदला या नहीं, और रेंज को सस्ते और महंगे आधे हिस्सों में रंग देता है। ऑर्डर ब्लॉक्स उन कैंडल्स को दिखाते हैं जहाँ से वह बड़ी खरीदारी आई। इन्हें ओवरले पैनल से ऑन कीजिए, और चार्ट पर किसी भी मार्कर को टैप कीजिए — हर लेबल खुद को आसान भाषा में समझाता है, और हर संक्षिप्त रूप नीचे दाईं ओर के प्रश्नचिह्न बटन में समझाया गया है। ज्योमेट्री बताती है कि लेवल कहाँ हैं। यह बताता है कि वहाँ नियंत्रण किसका है।',
    },
  },
  {
    // No screenshot yet — this stop is drawn (see TourVisual). It sits here
    // deliberately: the three stops before it each introduced a tool, and
    // this is the one that says every tool is operated the same way.
    icon: '🎛️', accent: '#35C9C9', visual: 'rowControls',
    title: 'Four Ways to Apply Any Tool',
    lead: 'Open Overlays and every tool sits on a row with the same four controls. Learn one row and you have learnt all of them — the geometry changes from tool to tool, the buttons never do.',
    tips: [
      'Once it is on the chart: left-click a faint ◀ placement to darken it a step (four clicks reach full strength), and right-click any placement to delete it.',
      'Hover any row and a (?) appears — it explains that tool, these buttons, and those two clicks.',
    ],
    narration: {
      en: "Every tool in the Overlays panel carries the same four controls, so learning one row teaches you all of them. Clicking the tool's name arms it for manual placement — you then click the chart where you want it. The lightning button applies it automatically to the most recent swing, so you never have to hunt for the pivot yourself. The back arrow steps one setup further into the past each time you press it, and those older ones are drawn faint, so you can see how the same tool behaved before. And the magnifier opens that tool's own scanner, which runs the same reading across a whole watchlist or index and tells you which stocks are sitting at their own levels right now. Two more things once a setup is on the chart, and neither has a button to tell you it is there. Those faint older placements are dim on purpose, so the live one reads first — but left-click one and it darkens a step, four clicks bringing it all the way to full strength, and it stays that way. And a right-click on any placement deletes it.",
      hi: 'ओवरले पैनल का हर टूल एक ही तरह के चार बटन के साथ आता है, इसलिए एक row समझ लेने पर सारी rows समझ आ जाती हैं। टूल के नाम पर क्लिक करने से मैनुअल प्लेसमेंट चालू होता है — फिर आप चार्ट पर जहाँ चाहें वहाँ क्लिक कीजिए। लाइटनिंग बटन उसे अपने आप सबसे ताज़ा स्विंग पर लगा देता है, तो पिवट खुद ढूंढने की ज़रूरत नहीं रहती। बैक ऐरो हर क्लिक पर एक और पुराना सेटअप पीछे ले जाता है, और वे पुराने वाले हल्के रंग में बनते हैं, ताकि आप देख सकें कि वही टूल पहले कैसा चला था। और मैग्नीफायर उस टूल का अपना स्कैनर खोलता है, जो यही पढ़ाई पूरी वॉचलिस्ट या इंडेक्स पर चलाकर बताता है कि अभी कौन से स्टॉक अपने ही लेवल पर बैठे हैं। चार्ट पर सेटअप लग जाने के बाद दो बातें और, और इनके लिए कोई बटन नहीं है। वे पुराने हल्के प्लेसमेंट जान-बूझकर धुंधले रखे जाते हैं ताकि ताज़ा वाला पहले दिखे — लेकिन उन पर लेफ्ट-क्लिक कीजिए और वे एक कदम गहरे हो जाते हैं; चार क्लिक में पूरे गहरे, और वैसे ही बने रहते हैं। और किसी भी प्लेसमेंट पर राइट-क्लिक करने से वह डिलीट हो जाता है।',
    },
  },
  {
    // NEW 5-Sep. Sits right after "Four Ways" on purpose: that stop taught
    // how a tool is applied by hand; this is the one that applies them FOR
    // you and then explains the result — Anand's "most important wish" for
    // the product, and the answer to a beginner's "what do I even draw?".
    // Drawn and animated (see VISUALS.tutor); no capture yet.
    icon: '🎓', accent: '#FF8A65', visual: 'tutor', badge: 'NEW',
    title: 'Geo-Tutor — Your Chart Tutor',
    lead: 'Open any chart and press the 🎓 button floating just above the time axis. Geo-Tutor sets the chart up for you — it finds the swing the method trades from and places the important studies on it — then reads the chart aloud, study by study: what the structure is doing, the levels that matter, and what each drawing is saying. And it points as it speaks: the study being described glows while the others dim, and a ring pulses on the exact point or price each sentence names.',
    tips: [
      '★ Apply studies automatically places the tutor\'s pick — or the tools you have starred under Favourites ▾ — from the confirmed swing. Keep them with one tap, or Clear to leave the chart exactly as you found it.',
      'Speaks English or Hindi in a voice you choose; on a device without speech it writes the same read-out instead. Sound, Text and language live under Geo-Tutor ▾ in the logo menu and behind the ⚙ in the panel.',
      'Drag the panel by its header to move it off the candles; press ⏹ on the button to stop mid-sentence.',
    ],
    narration: {
      en: "Now a stop I would like you to remember: Geo-Tutor, your chart tutor. Open any chart and press the tutor button floating just above the time axis. Geo-Tutor sets the chart up for you: it finds the swing the method trades from, places the important studies on it, and then reads the chart aloud, study by study — what the structure is doing, the levels that matter, and what each drawing is saying. And it points as it speaks: the study being described glows while the others dim, and a ring pulses on the exact point or price each sentence names, so your eye is always where the words are. Press Apply studies automatically and it places the tutor's pick, or the tools you have starred under Favourites — your stars are its brief. Keep what it drew with one tap, or clear it, and the chart is exactly as you left it. It speaks English or Hindi in a voice you choose, and where a device has no speech it writes the same read-out instead. If you are new to geometry, let it read a few charts to you before you draw anything yourself. That is what it is for.",
      hi: 'अब वह पड़ाव जो मैं चाहूँगा कि आप याद रखें: जियो-ट्यूटर, आपका चार्ट ट्यूटर। कोई भी चार्ट खोलिए और टाइम एक्सिस के ठीक ऊपर तैरते ट्यूटर बटन को दबाइए। जियो-ट्यूटर चार्ट को आपके लिए तैयार करता है: यह वह स्विंग ढूंढता है जिससे यह विधि ट्रेड करती है, उस पर ज़रूरी studies लगाता है, और फिर चार्ट को study दर study बोलकर पढ़ता है — स्ट्रक्चर क्या कर रहा है, कौन से लेवल मायने रखते हैं, और हर drawing क्या कह रही है। और बोलते-बोलते यह इशारा भी करता है: जिस study की बात हो रही है वह चमकती है और बाकी धुंधली हो जाती हैं, और हर वाक्य जिस point या price का नाम लेता है, उस पर एक घेरा धड़कता है — ताकि आपकी नज़र हमेशा वहीं रहे जहाँ शब्द हैं। Apply studies automatically दबाइए और यह ट्यूटर की पसंद लगा देता है, या वे tools जिन्हें आपने Favourites में स्टार किया है — आपके स्टार ही इसकी हिदायत हैं। जो इसने बनाया उसे एक टैप में रखिए, या Clear कीजिए, और चार्ट वैसा ही है जैसा आपने छोड़ा था। यह अंग्रेज़ी या हिंदी में, आपकी चुनी आवाज़ में बोलता है, और जहाँ device में speech न हो, वहाँ वही पढ़ाई लिखकर देता है। अगर आप geometry में नए हैं, तो खुद कुछ बनाने से पहले इसे कुछ चार्ट पढ़कर सुनाने दीजिए। यह इसी के लिए है।',
    },
  },
  {
    // "Algo Scan" until 3-Sep. Search is the server's view now: nothing is
    // scanned in the browser, the panel shows what the operator's sweep
    // covers and says so in its header. The recording still shows the
    // watchlist half accurately, so it stays; the drawn fallback shows the
    // new right-hand half.
    icon: '📋', accent: '#5DCAA5', visual: 'search', screenshot: shotWatchlist,
    title: 'Watchlists & Search',
    lead: 'Keep the stocks you track together in a watchlist — indices, sectors, or your own lists, on any of the three markets. Search is where every strategy stands, scrip by scrip: Geometriya\'s server sweeps the whole list every five minutes of market hours and shows which stocks have a setup forming, which are armed, and which went live today. You never have to scan anything yourself.',
    tips: [
      'Switch lists from the chips above the sidebar — All, your custom lists, and ＋ to create one; ★ on a row adds it to the open list.',
      'Open Search from Trade ▾ in the toolbar. Its header tells you exactly what it covers — "covering Nifty 500 · 500 scrips" — and when it was last swept.',
      'Three strategies to read: Dream 45, Dream45 Aggressive and Dream45 MSS. Tap a row and that chart opens on 15 minutes with the strategy\'s signals drawn.',
    ],
    narration: {
      en: "Watchlists keep the stocks you track in one place. Switch lists from the chips above the sidebar — indices, sectors, or your own custom lists — and the plus button creates a new one. When you want to know where the strategies stand, open Search from the Trade menu in the toolbar. Search is where every strategy stands, scrip by scrip: Geometriya's server sweeps the whole list every five minutes of market hours and shows which stocks have a setup forming, which are armed, and which went live today — you never scan anything yourself. The header tells you exactly what it covers, and when it was last swept. Three strategies to read: Dream forty five, Dream forty five Aggressive, and Dream forty five M S S. Tap a row, and that chart opens on fifteen minutes with the strategy's own signals drawn.",
      hi: 'वॉचलिस्ट आपके ट्रैक किए हुए स्टॉक्स को एक जगह रखती है। साइडबार के ऊपर के चिप्स से लिस्ट बदलिए — इंडेक्स, सेक्टर, या आपकी अपनी कस्टम लिस्ट — और प्लस बटन से नई लिस्ट बनाइए। जब जानना हो कि strategies कहाँ खड़ी हैं, तो टूलबार के Trade मेनू से Search खोलिए। Search वह जगह है जहाँ हर strategy की स्थिति scrip दर scrip दिखती है: जियोमेट्रिया का सर्वर बाज़ार के हर पाँच मिनट में पूरी लिस्ट खंगालता है और बताता है किन स्टॉक्स में setup बन रहा है, कौन armed हैं, और कौन आज live हुए — आपको खुद कुछ भी scan नहीं करना पड़ता। हेडर साफ़ बताता है कि यह क्या-क्या cover करता है, और आख़िरी बार कब खंगाला गया। पढ़ने के लिए तीन strategies हैं: ड्रीम फोर्टी फाइव, ड्रीम फोर्टी फाइव अग्रेसिव, और ड्रीम फोर्टी फाइव एम एस एस। किसी row पर टैप कीजिए, और वह चार्ट पंद्रह मिनट पर खुल जाता है, strategy के अपने signals के साथ।',
    },
  },
  {
    // THE stop. Everything before it taught one tool at a time; this is the
    // button that runs them all and is the answer to the question every new
    // client actually arrives with — "which stocks should I look at?".
    // `featured` gives it the gold treatment in the rail. Drawn, no capture
    // yet — the vote-stacking illustration IS the explanation.
    icon: '✦', accent: '#E8B93C', visual: 'masterstroke', featured: true,
    title: 'Masterstroke — Start Here',
    lead: 'This is the button to remember. Every method you just met gives its own independent reading of a chart — the 45° angle, the anchor\'s quality, the smart-money stack, Gann arcs, time checkpoints, candle reversals, plus RSI divergence, the anchor\'s own VWAP, the Elliott count, the weekly trend and strength against the index. Masterstroke runs all of them on every stock in your list and counts the votes: readings that agree add points, readings that disagree subtract them. What comes back is one ranked list where the top rows are genuine agreement between independent methods — not one indicator\'s opinion.',
    tips: [
      'Click ✦ Master in the toolbar, pick a watchlist or an index, and press ▶ Scan. No setup, no drawings needed — everything is computed from the chart itself.',
      'Tap any row to see every vote with its points, including the ones pulling the other way — and "Open with contributing overlays" draws exactly the tools that fired, so you can check the reading on the chart yourself.',
      'Every daily chart also carries its own ✦ meter — a small gold strip showing that scrip\'s score the moment you open it. Tap it for the breakdown; right-click ✦ Master to switch the meter on or off.',
    ],
    narration: {
      en: "This stop is the one to remember: Masterstroke. Every method you have just met gives its own independent reading of a chart — the forty five degree angle, the anchor's quality, the smart money stack, Gann arcs, time checkpoints, candle reversals, R S I divergence, the anchor's own V WAP, the Elliott count, the weekly trend, and strength against the index. Masterstroke runs all of them on every stock in your list, and counts the votes. Readings that agree add points. Readings that disagree subtract them. What comes back is one ranked list, where the top rows are genuine agreement between independent methods — not one indicator's opinion. Click the Master button in the toolbar, pick a watchlist or an index, and press Scan. Then tap any row: you see every vote with its points, including the ones pulling the other way, and one more tap opens the chart with exactly the tools that fired already drawn — so you can check the reading yourself instead of taking it on faith. And you don't even need to run a scan to use it: every daily chart carries its own Masterstroke meter, a small gold strip showing that stock's score the moment you open it. Tap the strip for the full breakdown, and right click the Master button to switch the meter on or off.",
      hi: 'यह पड़ाव याद रखने वाला है: मास्टरस्ट्रोक। अभी तक जो भी तरीका आपने देखा, हर एक चार्ट की अपनी स्वतंत्र पढ़ाई देता है — पैंतालीस डिग्री एंगल, एंकर की क्वालिटी, स्मार्ट-मनी स्टैक, गैन आर्क्स, टाइम चेकपॉइंट, कैंडल रिवर्सल, आर एस आई डाइवर्जेंस, एंकर का अपना वीवैप, वीकली ट्रेंड, और इंडेक्स के मुकाबले ताक़त। मास्टरस्ट्रोक ये सब आपकी लिस्ट के हर स्टॉक पर चलाता है, और वोट गिनता है। जो पढ़ाइयाँ सहमत हों, वे अंक जोड़ती हैं। जो असहमत हों, वे घटाती हैं। नतीजा एक रैंक की हुई लिस्ट है, जिसकी ऊपर की पंक्तियाँ स्वतंत्र तरीकों की असली सहमति हैं — किसी एक इंडिकेटर की राय नहीं। टूलबार में मास्टर बटन पर क्लिक कीजिए, वॉचलिस्ट या इंडेक्स चुनिए, और स्कैन दबाइए। फिर किसी भी पंक्ति को टैप कीजिए: हर वोट उसके अंकों के साथ दिखता है, दूसरी तरफ खींचने वाले भी — और एक और टैप चार्ट को उन्हीं टूल्स के साथ खोल देता है जो चले थे, ताकि आप पढ़ाई को खुद जाँच सकें, भरोसे पर न लें। और इसे इस्तेमाल करने के लिए स्कैन चलाना भी ज़रूरी नहीं: हर daily chart पर उसका अपना मास्टरस्ट्रोक मीटर है — एक छोटी सुनहरी पट्टी जो chart खोलते ही उस स्टॉक का स्कोर दिखाती है। पूरे breakdown के लिए पट्टी पर टैप कीजिए, और मीटर को on/off करने के लिए मास्टर बटन पर right-click कीजिए।',
    },
  },
  {
    // Follows Masterstroke deliberately: that stop ends on "here are the
    // best candidates", and the honest next thought for a beginner is
    // "…but how do I know any of this works?". This is the answer, and it
    // is the least frightening stop in the tour — no real money involved.
    // Rewritten 5-Sep: fills are immediate (2-Sep), no strategy trades the
    // practice book any more (the client paper engine was retired the same
    // day), and the book now keeps a wallet per market with a Closed-
    // positions ledger and a Total P&L tile that itemises itself.
    icon: '📄', accent: '#6FA0FF', visual: 'paper',
    title: 'Paper Trade — Practice First',
    lead: 'You do not have to believe any of this on faith, and you do not have to risk a rupee to find out. Every account comes with ₹10,00,000 of practice money on real prices — and a dollar wallet and a rand wallet of the same purchasing power, so you can practise on US and Johannesburg stocks too. Every trade in the book is one you placed yourself; Geometriya runs no strategy on your practice book.',
    tips: [
      'Open it from Trade ▾ → Paper. Pick the market — NSE · ₹, US · $, JSE · R — type a symbol and quantity, and place the order. It fills at once, at the price you typed or the last close, with realistic charges deducted.',
      'The Total P&L tile says where its number comes from — booked on closed trades, open on holdings, currency movement — and ✅ Closed positions lists every round-trip: bought at, sold at, charges on both sides, net, and how long you held.',
      'Reset to ₹10,00,000 any time; resets are counted and shown as attempt numbers, so the track record stays honest.',
    ],
    narration: {
      en: "You do not have to take any of this on faith, and you do not need to risk a rupee to find out whether it works. Every account comes with ten lakh rupees of practice money on real prices — and now a dollar wallet and a rand wallet of the same purchasing power, so you can practise on American and Johannesburg stocks as well. Open Paper from the Trade menu in the toolbar. Pick the market, type a symbol and a quantity, and place the order. It fills at once, at the price you typed or the last close, with realistic charges taken off — so the result means something instead of flattering you. Every trade in this book is one you placed yourself; Geometriya runs no strategy on your practice book. The Total P and L tile tells you where its number comes from — booked on closed trades, open on holdings, and currency movement — and Closed positions lists every round trip: bought at, sold at, charges on both sides, net, and how long you held. You can reset to ten lakh any time, but resets are counted and shown as attempt numbers, so the track record stays honest. When the practice results convince you, only then think about real money.",
      hi: 'इसमें से कुछ भी भरोसे पर मानने की ज़रूरत नहीं, और यह जानने के लिए एक रुपया भी जोखिम में डालने की ज़रूरत नहीं कि यह काम करता है या नहीं। हर account के साथ दस लाख रुपये की practice money मिलती है, असली दामों पर — और अब उतनी ही खरीद-क्षमता का एक डॉलर wallet और एक रैंड wallet भी, ताकि आप अमेरिकी और जोहान्सबर्ग के स्टॉक्स पर भी अभ्यास कर सकें। टूलबार के Trade मेनू से Paper खोलिए। बाज़ार चुनिए, symbol और quantity लिखिए, और order लगाइए। वह तुरंत fill होता है — आपके लिखे price पर या आख़िरी close पर — और उसमें वास्तविक charges भी कटते हैं, ताकि नतीजा आपको खुश करने के बजाय कुछ सिखाए। इस book का हर trade वही है जो आपने खुद लगाया; जियोमेट्रिया आपकी practice book पर कोई strategy नहीं चलाता। Total P&L की टाइल बताती है कि उसका आँकड़ा कहाँ से आया — बंद trades पर booked, holdings पर open, और currency की चाल — और Closed positions हर round-trip दिखाता है: कितने में लिया, कितने में बेचा, दोनों तरफ़ के charges, net, और कितने दिन रखा। आप कभी भी दस लाख पर reset कर सकते हैं, पर resets गिने जाते हैं और attempt number के रूप में दिखते हैं, ताकि track record ईमानदार रहे। जब practice के नतीजे यकीन दिला दें, तभी असली पैसे के बारे में सोचिए।',
    },
  },
  {
    // NEW 5-Sep. The three doors of the Trade menu in one place, with the
    // plain word on Live: it is not available to client accounts (SEBI —
    // see the 1-Sep paper/live split). Better said here, once, than
    // discovered as a refusal dialog on the first click.
    icon: '🎯', accent: '#3fe0b0', visual: 'trade', badge: 'NEW',
    title: 'Trade ▾ — Paper · Search · Live',
    lead: 'The Trade ▾ button in the toolbar is the map of everything that touches a book. Paper is your practice book. Search is where every strategy stands. Live is the one door that spends real money — it places delivery orders in a connected broker account, and it is switched off for client accounts: exchange rules do not permit Geometriya to place orders for you. The dot on the button stays grey until something is actually running, so one glance tells you whether anything is live.',
    tips: [
      'Colour carries state, never identity: a lit dot means your paper book is open or something is armed; grey means nothing is running.',
      'Read Search, practise in Paper, and place your real orders with your own broker — where your money already is.',
      'Search needs a live feed to show intraday state; without one it still reads the server\'s last sweep.',
    ],
    narration: {
      en: "The Trade button in the toolbar is the map of everything that touches a book. Paper is your practice book. Search is where every strategy stands. And Live is the one door that spends real money: it places delivery orders in a connected broker account — and it is switched off for client accounts, because exchange rules do not permit Geometriya to place orders for you. The dot on the button stays grey until something is actually running, so one glance tells you whether anything is live. Read Search, practise in Paper, and place your real orders with your own broker, where your money already is.",
      hi: 'टूलबार का Trade बटन उन सब चीज़ों का नक्शा है जो किसी book को छूती हैं। Paper आपकी practice book है। Search वह जगह है जहाँ हर strategy की स्थिति दिखती है। और Live वह इकलौता दरवाज़ा है जो असली पैसा लगाता है: यह जुड़े हुए broker account में delivery orders लगाता है — और client accounts के लिए यह बंद है, क्योंकि exchange के नियम जियोमेट्रिया को आपके लिए orders लगाने की अनुमति नहीं देते। जब तक कुछ सचमुच चल न रहा हो, बटन का बिंदु ग्रे रहता है — तो एक नज़र में पता चल जाता है कि कुछ live है या नहीं। Search पढ़िए, Paper में अभ्यास कीजिए, और असली orders अपने broker के पास लगाइए, जहाँ आपका पैसा पहले से है।',
    },
  },
  {
    // Was "Voice Assistance & Help" — the voice half grew into the Geo-Tutor
    // stop, so this one is now purely the map of where help and account
    // things live. Drawn (VISUALS.help); the old voice.mp4 showed the
    // retired 🗣 button and is no longer used.
    icon: '🧭', accent: '#7EB3F5', visual: 'help',
    title: 'Help, Videos & Your Account',
    lead: 'Stuck on anything? The round ? button at the bottom-right of the chart opens Help from anywhere — search any tool, or look up a short form like BOS or FVG. Everything about your account lives under the logo at the top-left: Video Guides, this tour, Refer & Earn, Install App, Backup and Restore of your drawings, and the Geo-Tutor switch with its language and voice options.',
    tips: [
      '🎥 Video Guides are full walkthroughs of the main tools; the stops in this tour that have one show a "Watch Detailed Video" button.',
      '🎁 Refer & Earn gives you a code to share — friends who join with it earn you account credit.',
      '⬇ Backup saves every drawing and setting to a file and ⬆ Restore brings them back. Your drawings live on this device only, so back them up before changing phones.',
    ],
    narration: {
      en: "Last stop. If you are ever stuck, look for the round question-mark button at the bottom right of the chart: it opens Help from anywhere, where you can search any tool or look up what a short form like B O S or F V G means. Everything about your account lives under the logo at the top left: Video Guides, with full walkthroughs of the main tools; this tour; Refer and Earn; Install App; Backup and Restore of your drawings; and the Geo-Tutor switch with its language and voice options. One thing worth doing today: your drawings live on this device only, so take a backup before you change phones. That is the whole tour. Happy trading!",
      hi: 'आख़िरी पड़ाव। कभी अटक जाएँ तो चार्ट के नीचे दाईं ओर गोल प्रश्नचिह्न वाला बटन देखिए: वह कहीं से भी हेल्प खोल देता है, जहाँ आप कोई भी टूल खोज सकते हैं या बी ओ एस, एफ वी जी जैसे संक्षिप्त रूपों का मतलब देख सकते हैं। आपके account से जुड़ी हर चीज़ ऊपर बाईं ओर लोगो के नीचे है: मुख्य टूल्स के पूरे walkthrough वाली वीडियो गाइड्स, यह टूर, Refer & Earn, Install App, आपकी drawings का Backup और Restore, और जियो-ट्यूटर का स्विच उसकी भाषा और आवाज़ के विकल्पों के साथ। एक काम आज ही करने लायक: आपकी drawings सिर्फ़ इसी device पर रहती हैं, इसलिए फ़ोन बदलने से पहले backup ले लीजिए। बस, यही पूरा टूर था। हैप्पी ट्रेडिंग!',
    },
  },
];

// Best-effort MALE voice fallback when the user hasn't picked one — same
// heuristic as the Help voiceover (browsers expose no voice gender).
// WEBSITE: getVoices() is populated asynchronously, and on Android it is
// routinely EMPTY for the first second or two. Speaking then set no voice at
// all, so the engine fell back to its own default — female on most phones,
// which is what Anand heard on 5-Sep-2026. Wait for the list (event, poll and
// a ceiling, because some engines never fire voiceschanged) before choosing.
const waitForVoices = (budgetMs = 4000) => new Promise(resolve => {
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) { resolve(now); return; }
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    clearInterval(poll); clearTimeout(ceiling);
    synth.removeEventListener?.('voiceschanged', finish);
    resolve(synth.getVoices());
  };
  const poll = setInterval(() => { if (synth.getVoices().length) finish(); }, 200);
  const ceiling = setTimeout(finish, budgetMs);
  synth.addEventListener?.('voiceschanged', finish);
});

// Android reports language tags with an underscore ("en_IN"), the desktop
// with a hyphen ("en-IN") — normalise before comparing or the Indian voice
// is never found. Gender tokens need word boundaries too: "Denmark" was
// matching /mark/ and scoring a Danish voice as male.
const voiceLang = v => String(v.lang || '').replace('_', '-');
const isEnglishVoice = v => /^en(-|$)/i.test(voiceLang(v));
const isIndianEnglish = v => /^en-IN$/i.test(voiceLang(v));
const pickFallbackVoice = (voices, lang) => {
  // Android's Google TTS names voices "en-in-x-end#male_1-local" and
  // "en-us-x-tpf#female_1-local", so the plain male/female tokens below
  // match there too — the female guard is what stops "female_1" scoring as
  // a male match. Windows and Apple names are covered by the given names.
  // \b fails against Android's "male_1" (underscore is a word char), so the
  // token is allowed to run into a digit or underscore explicitly.
  const maleRe = /(\bmale[_#\d]?|#male|\b(ravi|prabhat|madhur|hemant|rishi|david|mark|james|daniel|george|christopher|guy|ryan|arthur|brian|thomas)\b)/i;
  const femaleRe = /(\bfemale|\b(heera|neerja|swara|kalpana|zira|susan|samantha|veena|aria|jenny|hazel|sonia|natasha)\b)/i;
  const notFemale = v => !femaleRe.test(v.name);
  const isHindi = v => /^hi(-|$)/i.test(voiceLang(v));
  if (lang === 'hi') {
    return voices.find(v => isHindi(v) && maleRe.test(v.name) && notFemale(v))
        || voices.find(v => isHindi(v) && notFemale(v))
        || voices.find(isHindi);
  }
  return voices.find(v => isIndianEnglish(v) && maleRe.test(v.name) && notFemale(v))
      || voices.find(v => isEnglishVoice(v) && maleRe.test(v.name) && notFemale(v))
      || voices.find(v => isIndianEnglish(v) && notFemale(v))
      || voices.find(isIndianEnglish)
      || voices.find(isEnglishVoice);
};

// `theme` is the app's chartTheme ('light' | 'dark'). It drives both the
// .geo-theme-light class on this modal's root and the SVG palette lookup.
export default function OnboardingTour({ isOpen, onClose, theme = 'dark', onWatchVideo }) {
  const pal = PALETTE[theme === 'light' ? 'light' : 'dark'];
  const [idx, setIdx] = useState(0);
  // No narration until the user's first click (Chrome autoplay policy) —
  // "▶ Start tour" is that click.
  const [started, setStarted] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  // Unchecked by default — dismissing the tour once shouldn't silently
  // retire it. Someone who closes this to go look at the chart still gets
  // it back next login; ticking the box is a deliberate "I'm done with it".
  // Narration language — seeded from the Voice Assistance pick so the tour
  // speaks the language the user already chose.
  // Hindi by default, matching DEFAULT_LANG in Geometriya.jsx — the tour
  // shares the app's own language key, so a narration language chosen here
  // is the one Voice Assistance uses later, and vice versa. Only a default:
  // an existing saved choice wins.
  const [lang, setLang] = useState(() => lsGet('geo_voiceAssistLang', 'en')); // WEBSITE: 'en' default
  // Slides whose recording failed to load, by index. A dropped request used
  // to leave a broken-image icon sitting where the demo should be; every
  // slide still carries its drawn `visual`, so fall back to that instead —
  // the stop keeps teaching, just without the live capture.
  const [shotFailed, setShotFailed] = useState({});

  const nativeTts = false; // WEBSITE: browsers only, no native engine
  const webTts = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const ttsOk = nativeTts || webTts;

  // Voice lists load async on both backends; empty until then is fine —
  // speak() just falls back to the engine's own language default.
  const [webVoices, setWebVoices] = useState([]);
  useEffect(() => {
    if (!isOpen) return;
    if (!webTts) return;
    const synth = window.speechSynthesis;
    const load = () => setWebVoices(synth.getVoices());
    load();
    synth.addEventListener?.('voiceschanged', load);
    return () => synth.removeEventListener?.('voiceschanged', load);
  }, [isOpen, nativeTts, webTts]);

  // cancelled flag per utterance run — the native loop awaits chunk by
  // chunk and needs a way to bail when the slide changes underneath it.
  const runRef = useRef({ cancelled: true });
  const stopSpeech = useCallback(() => {
    runRef.current.cancelled = true;
    if (webTts) { try { window.speechSynthesis.cancel(); } catch {} }
  }, [nativeTts, webTts]);

  const speak = useCallback(async (text) => {
    if (!ttsOk || !text) return;
    stopSpeech();
    const run = { cancelled: false };
    runRef.current = run;
    const wantName = (lsGet('geo_voiceAssistVoices', null) || {})[lang] || '';
    const bcp = lang === 'hi' ? 'hi-IN' : 'en-IN';
    // WEBSITE: never speak before the voice list exists (see waitForVoices).
    const voices = webVoices.length ? webVoices : await waitForVoices();
    if (run.cancelled) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = bcp; // engine picks the language even without an explicit voice
    u.rate = 0.95;
    const v = (wantName && voices.find(x => x.name === wantName)) || pickFallbackVoice(voices, lang);
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }, [ttsOk, stopSpeech, lang, nativeTts, webVoices]);

  // Narrate on every slide change once started. speak lives in a ref so a
  // late voiceschanged event doesn't restart the current slide mid-sentence.
  const speakRef = useRef(speak);
  useEffect(() => { speakRef.current = speak; }, [speak]);
  useEffect(() => {
    if (!isOpen || !started || !voiceOn) return;
    const s = SLIDES[idx];
    speakRef.current(s.narration[lang] || s.narration.en);
  }, [isOpen, started, voiceOn, idx, lang]);

  const close = useCallback(() => {
    stopSpeech();
    // Reset so a replay from the menu starts fresh.
    setIdx(0); setStarted(false);
    onClose();
  }, [stopSpeech, onClose]);

  const goto = useCallback((n) => {
    setStarted(true); // any navigation is a user gesture — audio is unlocked
    setIdx(Math.max(0, Math.min(SLIDES.length - 1, n)));
  }, []);

  // Escape closes, arrows navigate.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = e => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') goto(idx + 1);
      else if (e.key === 'ArrowLeft') goto(idx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, idx, close, goto]);

  // Stop talking the moment the tour is closed by any path (incl. unmount).
  useEffect(() => { if (!isOpen) stopSpeech(); }, [isOpen, stopSpeech]);
  useEffect(() => () => stopSpeech(), [stopSpeech]);

  if (!isOpen) return null;
  const slide = SLIDES[idx];
  const last = idx === SLIDES.length - 1;

  // Dark theme: the card (--geo-bg-toolbar, #0d1117) on a 60% black scrim
  // over a #070b12 page was three near-blacks stacked — the modal did not
  // read as a modal (Anand, 5-Sep). Light never had the problem: white on a
  // dimmed grey page separates by itself. So dark gets its own surfaces: a
  // card a step lighter than the page, a rail a step darker than the card,
  // a blue rim glow, and a darker, blurred scrim behind it all.
  const dark = theme !== 'light';
  const scrim = dark ? 'rgba(2, 6, 14, 0.78)' : 'rgba(0,0,0,0.6)';
  const cardBg = dark ? '#111a2b' : 'var(--geo-bg-toolbar)';
  const railBg = dark ? '#0b1220' : 'var(--geo-bg-panel)';
  const cardBorder = dark ? '1px solid rgba(126,179,245,0.38)' : '1px solid var(--geo-border)';
  const cardShadow = dark
    ? '0 0 0 1px rgba(62,123,250,0.22), 0 0 70px rgba(62,123,250,0.16), 0 34px 90px rgba(0,0,0,0.85)'
    : '0 30px 80px rgba(0,0,0,0.55)';

  const navBtn = (primary) => ({
    padding: '10px 22px', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer',
    border: primary ? 'none' : '1px solid var(--geo-border)',
    background: primary ? ACCENT : 'transparent',
    color: primary ? '#fff' : 'var(--geo-text-muted)',
  });

  return (
    <div onClick={close} className={`geo-tour-root${theme === 'light' ? ' geo-theme-light' : ''}`} style={{
      position: 'fixed', inset: 0, zIndex: 2200,
      background: scrim, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', Arial, sans-serif", padding: IS_NARROW ? 12 : 24,
    }}>
      {/* The hero's 45° line draws itself, then the Gann square fades up
          behind it — the one moment of motion in the tour, and only on the
          opening slide. Keyframes need a stylesheet; inline styles can't. */}
      <style>{`
        /* WEBSITE: the app defines these on :root; here the modal carries
           its own copy (dark values from the app's stylesheet). */
        .geo-tour-root { --geo-border:#1e2a3a; --geo-text-faint:#475569; --geo-text-muted:#94a3b8; --geo-text-primary:#e2e8f0; --geo-accent-blue-text:#7EB3F5; --geo-scan-blue-bg:#0d1a3a; --geo-bg-panel:#070b12; --geo-bg-toolbar:#0d1117; }
        .geo-tour-root.geo-theme-light { --geo-border:#d8dde3; --geo-text-faint:#94a0ae; --geo-text-muted:#64748b; --geo-text-primary:#1a202c; --geo-accent-blue-text:#1d4ed8; --geo-scan-blue-bg:#e8eefb; --geo-bg-panel:#f7f8fa; --geo-bg-toolbar:#ffffff; }
        .geo-tour-root .geo-scroll { scrollbar-width: thin; scrollbar-color: #334155 transparent; }
        @keyframes geoTourDraw { from { stroke-dashoffset: 210; } to { stroke-dashoffset: 0; } }
        @keyframes geoTourFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .geo-tour-draw { stroke-dasharray: 210; animation: geoTourDraw 1s ease-out both; }
        .geo-tour-fade { animation: geoTourFade .7s ease-out .55s both; }
        /* Masterstroke stop's build: fan draws, vote pills tally in turn,
           the score pill lands with a small pop, then the panel rows. The
           pane re-mounts per slide (key={idx}), so it replays each visit. */
        @keyframes msDraw { from { stroke-dashoffset: 300; } to { stroke-dashoffset: 0; } }
        @keyframes msPop { 0% { opacity: 0; transform: scale(.7); } 65% { opacity: 1; transform: scale(1.06); } 100% { opacity: 1; transform: scale(1); } }
        .ms-fan { stroke-dasharray: 300; animation: msDraw 1s ease-out .2s both; }
        .ms-in { animation: geoTourFade .4s ease-out both; }
        .ms-score { animation: msPop .5s ease-out 3.9s both; transform-box: fill-box; transform-origin: center; }
        /* Geo-Tutor stop: three sentences take turns over a 7.5 s cycle, and
           the chart pointer for each sentence shares its class, so the ring
           and the tinted line always move together. The ring itself
           breathes, the way voicePulse ticks in the app. */
        @keyframes gtSeg0 { 0%, 32% { opacity: 1; } 34%, 100% { opacity: 0; } }
        @keyframes gtSeg1 { 0%, 33% { opacity: 0; } 35%, 65% { opacity: 1; } 67%, 100% { opacity: 0; } }
        @keyframes gtSeg2 { 0%, 66% { opacity: 0; } 68%, 100% { opacity: 1; } }
        @keyframes gtPulse { 0%, 100% { transform: scale(.82); opacity: .55; } 50% { transform: scale(1.22); opacity: 1; } }
        .gt-s0 { animation: gtSeg0 7.5s linear infinite; }
        .gt-s1 { animation: gtSeg1 7.5s linear infinite; }
        .gt-s2 { animation: gtSeg2 7.5s linear infinite; }
        .gt-ring { animation: gtPulse 1.1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes geoTourBar { from { transform: scaleX(0); } to { transform: none; } }
        .geo-tour-bar { transform-origin: left; animation: geoTourBar .45s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .geo-tour-draw, .geo-tour-fade, .ms-fan, .ms-in, .ms-score, .geo-tour-bar { animation: none; stroke-dashoffset: 0; opacity: 1; }
          /* Static frame: first sentence and its pointer, nothing moving. */
          .gt-s0 { animation: none; opacity: 1; }
          .gt-s1, .gt-s2 { animation: none; opacity: 0; }
          .gt-ring { animation: none; }
        }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: 1120, maxWidth: '100%', // WEBSITE (measured on Anand's phone, 5-Sep-2026): on Android Chrome a vh
        // unit is the LARGEST viewport — the one with the address bar hidden —
        // so 92vh was 690px while the visible area with the bar showing was
        // 692px minus the overlay's padding. The footer, and with it Skip and
        // Start tour, sat below the screen. On a phone the card now stretches
        // to the overlay, which as a fixed element tracks the visible viewport.
        height: IS_NARROW ? 'auto' : 760, maxHeight: IS_NARROW ? 'none' : '92vh', alignSelf: IS_NARROW ? 'stretch' : 'auto',
        background: cardBg, border: cardBorder, borderRadius: 16,
        boxShadow: cardShadow, color: 'var(--geo-text-primary)',
        display: 'flex', flexDirection: IS_NARROW ? 'column' : 'row', overflow: 'hidden',
      }}>
        {/* Rail — every stop, always reachable. Desktop: full vertical list
            with titles. Narrow: a horizontal strip of number badges only,
            so the split-stepper idea survives without crowding a phone. */}
        {/* WEBSITE fix (5-Sep-2026), narrow rail: minWidth:0. A flex item's
            default min-width is auto — its MIN-CONTENT width — so the
            thirteen 30px pills (431px) set a floor the modal's
            maxWidth:100% could not beat, and the whole card grew past a
            375px phone, carrying ✕, 🔊 and the footer buttons off-screen to
            the right. With the floor removed, overflowX:auto does its job. */}
        {IS_NARROW ? (
          <div className="geo-scroll" style={{ display: 'flex', gap: 8, padding: '12px 14px', overflowX: 'auto', borderBottom: '1px solid var(--geo-border)', flexShrink: 0, minWidth: 0 }}>
            {SLIDES.map((s, i) => {
              const done = i < idx, activeR = i === idx;
              // The featured (Masterstroke) badge keeps its gold ✦ even when
              // not active — it should read as the landmark of the strip.
              const gold = s.featured && !done;
              return (
                <button key={i} title={s.title} onClick={() => goto(i)} style={{
                  flexShrink: 0, width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
                  fontFamily: MONO, fontSize: 11, fontVariantNumeric: 'tabular-nums',
                  border: `1px solid ${gold ? '#E8B93C' : activeR ? ACCENT : 'var(--geo-border)'}`,
                  background: done ? ACCENT : gold ? '#E8B93C22' : 'transparent',
                  color: done ? '#fff' : gold ? '#E8B93C' : activeR ? ACCENT : 'var(--geo-text-faint)',
                }}>{done ? '✓' : s.featured ? '✦' : i + 1}</button>
              );
            })}
          </div>
        ) : (
          <div className="geo-scroll" style={{ width: 244, flexShrink: 0, background: railBg, borderRight: '1px solid var(--geo-border)', padding: '18px 10px', overflowY: 'auto' }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--geo-text-faint)', padding: '4px 12px 14px' }}>
              Getting Started
            </div>
            {SLIDES.map((s, i) => {
              const done = i < idx, activeR = i === idx;
              // The featured (Masterstroke) row wears gold whatever its state
              // — a first-time user scanning the rail should see one stop
              // visibly marked as the headline before they reach it.
              const gold = s.featured;
              return (
                <div key={i} onClick={() => goto(i)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 12.5, marginBottom: 2,
                  color: gold ? '#E8B93C' : activeR ? 'var(--geo-accent-blue-text)' : 'var(--geo-text-muted)',
                  background: activeR ? (gold ? '#E8B93C1c' : 'var(--geo-scan-blue-bg)') : 'transparent',
                  border: gold ? '1px solid #E8B93C44' : '1px solid transparent',
                  fontWeight: activeR || gold ? 600 : 400,
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontFamily: MONO, fontVariantNumeric: 'tabular-nums',
                    border: `1px solid ${gold ? '#E8B93C' : done || activeR ? ACCENT : 'var(--geo-border)'}`,
                    background: done ? (gold ? '#E8B93C' : ACCENT) : 'transparent',
                    color: done ? (gold ? '#1a1206' : '#fff') : gold ? '#E8B93C' : activeR ? ACCENT : 'var(--geo-text-faint)',
                  }}>{done ? '✓' : gold ? '✦' : String(i + 1).padStart(2, '0')}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>{s.title}</span>
                  {/* Stops added in a redraw wear a small tag until visited,
                      so someone replaying the tour can go straight to what
                      is new instead of sitting through what they know. */}
                  {s.badge && !done && (
                    <span style={{
                      flexShrink: 0, fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.08em', fontWeight: 700,
                      padding: '1px 5px', borderRadius: 4, lineHeight: 1.4,
                      background: `${s.accent}26`, color: s.accent, border: `1px solid ${s.accent}66`,
                    }}>{s.badge}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Detail pane */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 /* WEBSITE: on a phone this column is on the modal's main axis; min-height:auto would keep it at content height and push the footer out */ }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid var(--geo-border)', flexShrink: 0 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--geo-text-faint)', flex: 1 }}>
              Stop {String(idx + 1).padStart(2, '0')} of {String(SLIDES.length).padStart(2, '0')}
            </span>
            {ttsOk && (
              <>
                {['en', 'hi'].map(l => (
                  <button key={l} onClick={() => setLang(l)}
                    title={l === 'en' ? 'Narrate in English' : 'हिंदी में सुनें'}
                    style={{
                      padding: '3px 9px', fontSize: 11, borderRadius: 5, cursor: 'pointer',
                      border: `1px solid ${lang === l ? ACCENT : 'var(--geo-border)'}`,
                      background: lang === l ? 'var(--geo-scan-blue-bg)' : 'transparent',
                      color: lang === l ? 'var(--geo-accent-blue-text)' : 'var(--geo-text-muted)',
                    }}>{l === 'en' ? 'EN' : 'हिं'}</button>
                ))}
                <button
                  onClick={() => {
                    setVoiceOn(v => {
                      if (v) stopSpeech();
                      else if (started) { const s = SLIDES[idx]; speakRef.current(s.narration[lang] || s.narration.en); }
                      return !v;
                    });
                  }}
                  title={voiceOn ? 'Mute narration' : 'Unmute narration'}
                  style={{ background: 'transparent', border: 'none', fontSize: 15, cursor: 'pointer', padding: '0 2px' }}>
                  {voiceOn ? '🔊' : '🔇'}
                </button>
              </>
            )}
            <button onClick={close} title="Close"
              style={{ background: 'transparent', border: 'none', color: 'var(--geo-text-faint)', fontSize: 16, cursor: 'pointer', lineHeight: 1 }}>✕</button>
          </div>
          {/* Progress — a hairline that fills as you go, in the current
              stop's accent. The rail already says where you are; this says
              how much is left, which is what decides whether someone keeps
              going on a phone where the rail is a row of dots. */}
          <div style={{ height: 2, background: 'var(--geo-border)', flexShrink: 0 }}>
            <div key={idx} className="geo-tour-bar" style={{ height: '100%', width: `${((idx + 1) / SLIDES.length) * 100}%`, background: slide.accent, transition: 'width .35s ease' }} />
          </div>

          <div className="geo-scroll" key={idx} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: IS_NARROW ? '18px 20px 4px' : '18px 28px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0, fontSize: 21,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${slide.accent}1f`, border: `1px solid ${slide.accent}55`,
              }}>{slide.icon}</div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>{slide.title}</h2>
            </div>

            {/* The chart IS the slide, so it takes as much room as the window
                allows. Width drives height on a ~2:1 capture, so the vh term
                is doubled: 74vh wide ≈ 37vh tall. That keeps it big on a full
                screen without pushing text past the fold on a short laptop
                window, where the card is already clamped to 92vh. */}
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--geo-border)', marginBottom: 11, maxWidth: 'min(820px, 74vh)' }}>
              {/* <video>, not <img>: these captures were 4.4 MB of GIF, more
                  than the entire application bundle, for footage most people
                  watch once. The same frames as H.264 are 816 KB — 82% less to
                  download, and every byte of it shipped inside the APK too.

                  autoPlay+muted+loop+playsInline is the combination browsers
                  actually allow to start on its own: an unmuted autoplay is
                  blocked everywhere, and without playsInline iOS takes the
                  video fullscreen instead of leaving it in the card.

                  aria-label and the drawn fallback carry the meaning for
                  anyone who cannot see or play it — a <video> has no alt.
                  onError keeps the existing behaviour exactly: if the file
                  will not load or decode, the slide falls back to TourVisual
                  rather than showing a black rectangle. */}
              {slide.screenshot && !shotFailed[idx]
                ? <video src={slide.screenshot} aria-label={slide.title}
                    autoPlay muted loop playsInline preload="metadata"
                    style={{ width: '100%', display: 'block' }}
                    onError={() => setShotFailed(f => ({ ...f, [idx]: true }))} />
                : <TourVisual kind={slide.visual} pal={pal} />}
            </div>

            <p style={{ margin: '0 0 13px', fontSize: 13.5, lineHeight: 1.7, color: 'var(--geo-text-muted)', maxWidth: '70ch' }}>{slide.lead}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 8 }}>
              {slide.tips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, fontSize: 12.5, lineHeight: 1.6, color: 'var(--geo-text-muted)' }}>
                  <span style={{ color: slide.accent, flexShrink: 0 }}>▸</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>

            {/* Tools that already have a full walkthrough recorded hand off to
                it here — the tour stays a two-minute overview, and anyone who
                wants the long version is one click from it. Closes the tour so
                the video isn't opening behind this modal. */}
            {slide.videoId && onWatchVideo && (
              <button onClick={() => { stopSpeech(); onWatchVideo(slide.videoId); }}
                style={{
                  marginTop: 12, marginBottom: 4, padding: '8px 16px', fontSize: 12.5, fontWeight: 600,
                  borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
                  border: `1px solid ${slide.accent}66`, background: `${slide.accent}1a`, color: slide.accent,
                }}>
                🎥 Watch Detailed Video
              </button>
            )}
          </div>

          {/* Footer — don't-show-again + navigation */}
          <div style={{
            padding: IS_NARROW ? '12px 16px' : '14px 20px',
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flexShrink: 0,
            borderTop: '1px solid var(--geo-border)',
          }}>
            {/* WEBSITE: the app's "Don't show this again" box is not needed
                here. The line below is dropped on a phone so Skip / Next keep
                a row to themselves instead of being pushed to a second one. */}
            {!IS_NARROW && (
              <span style={{ flex: 1, minWidth: 150, fontSize: 11.5, color: 'var(--geo-text-faint)' }}>
                The same tour every new Geometriya account sees on first login.
              </span>
            )}
            {IS_NARROW && <span style={{ flex: 1 }} />}
            {!started ? (
              <>
                <button onClick={close} style={navBtn(false)}>Skip</button>
                <button onClick={() => setStarted(true)} style={navBtn(true)}>
                  {ttsOk ? '▶ Start tour' : 'Start tour'}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => goto(idx - 1)} disabled={idx === 0}
                  style={{ ...navBtn(false), opacity: idx === 0 ? 0.4 : 1, cursor: idx === 0 ? 'default' : 'pointer' }}>
                  ← Back
                </button>
                <button onClick={() => (last ? close() : goto(idx + 1))} style={navBtn(true)}>
                  {last ? 'Finish ✓' : 'Next →'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
