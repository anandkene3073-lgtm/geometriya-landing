import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRIYA — MARKETING SITE
// "The world's only charting platform built entirely on geometric analysis."
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg: '#0E0E0E',
  bgPanel: '#141414',
  bgPanel2: '#1a1a1a',
  line: '#2a2a2a',
  ink: '#E8E6E1',
  inkDim: '#8a8a86',
  inkFaint: '#4a4a48',
  gold: '#EF9F27',
  green: '#1D9E75',
  red: '#E24B4A',
  purple: '#7F77DD',
  blue: '#378ADD',
  pink: '#D4537E',
  paper: '#F4F1EA',
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
`;

// ── Compass-drawn Fibonacci spiral + candlesticks, self-animating on mount
function HeroDrawing() {
  const pathRef = useRef(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 300);
    return () => clearTimeout(t);
  }, []);

  const candles = [
    { x: 40, o: 210, c: 190, h: 220, l: 180, up: true },
    { x: 66, o: 190, c: 205, h: 212, l: 185, up: false },
    { x: 92, o: 205, c: 160, h: 210, l: 155, up: true },
    { x: 118, o: 160, c: 175, h: 180, l: 150, up: false },
    { x: 144, o: 175, c: 120, h: 180, l: 115, up: true },
    { x: 170, o: 120, c: 140, h: 148, l: 112, up: false },
    { x: 196, o: 140, c: 95, h: 145, l: 90, up: true },
    { x: 222, o: 95, c: 108, h: 118, l: 88, up: false },
    { x: 248, o: 108, c: 60, h: 112, l: 55, up: true },
    { x: 274, o: 60, c: 78, h: 90, l: 52, up: false },
  ];

  return (
    <svg viewBox="0 0 480 420" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <pattern id="blueprintGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={C.line} strokeWidth="0.5" opacity="0.4" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="480" height="420" fill="url(#blueprintGrid)" />

      {/* candlesticks */}
      {candles.map((k, i) => (
        <g key={i} style={{ opacity: drawn ? 1 : 0, transition: `opacity 0.4s ease ${0.05 * i}s` }}>
          <line x1={k.x + 8} y1={420 - k.h} x2={k.x + 8} y2={420 - k.l} stroke={k.up ? C.green : C.red} strokeWidth="1.5" />
          <rect x={k.x} y={420 - Math.max(k.o, k.c)} width="16" height={Math.max(Math.abs(k.o - k.c), 2)}
            fill={k.up ? C.green : C.red} opacity="0.9" />
        </g>
      ))}

      {/* Gann fan lines radiating from swing low */}
      {[0.25, 0.5, 1, 2, 4].map((slope, i) => {
        const x0 = 40, y0 = 400;
        const x1 = 460;
        const y1 = Math.max(20, y0 - (x1 - x0) * slope * 0.9);
        return (
          <line key={i} x1={x0} y1={y0} x2={x1} y2={y1}
            stroke={C.gold} strokeWidth={slope === 1 ? 1.4 : 0.7}
            opacity={drawn ? (slope === 1 ? 0.85 : 0.35) : 0}
            style={{ transition: `opacity 0.8s ease ${0.6 + i * 0.15}s` }}
            strokeDasharray={slope === 1 ? 'none' : '3 3'} />
        );
      })}

      {/* Fibonacci spiral, hand-drawn compass style */}
      <path
        ref={pathRef}
        d="M 248 210 
           A 20 20 0 0 1 268 190
           A 40 40 0 0 1 308 230
           A 60 60 0 0 1 248 290
           A 100 100 0 0 1 148 190
           A 160 160 0 0 1 308 30"
        fill="none"
        stroke={C.purple}
        strokeWidth="1.6"
        strokeLinecap="round"
        pathLength="1"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: drawn ? 0 : 1,
          transition: 'stroke-dashoffset 1.8s cubic-bezier(0.65,0,0.35,1) 1.4s',
        }}
      />

      {/* compass point marker */}
      <circle cx="248" cy="210" r="3" fill={C.gold} opacity={drawn ? 1 : 0} style={{ transition: 'opacity 0.4s ease 1.3s' }} />
    </svg>
  );
}

function ToolIcon({ shape, color }) {
  const s = { width: 22, height: 22, flexShrink: 0 };
  switch (shape) {
    case 'compass':
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 3 L20 20 L4 20 Z" fill="none" stroke={color} strokeWidth="1.4" /><circle cx="12" cy="3" r="1.6" fill={color} /></svg>;
    case 'square':
      return <svg viewBox="0 0 24 24" style={s}><rect x="4" y="4" width="16" height="16" fill="none" stroke={color} strokeWidth="1.4" /><line x1="4" y1="4" x2="20" y2="20" stroke={color} strokeWidth="1" opacity="0.5" /></svg>;
    case 'circle':
      return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth="1.4" /><path d="M12 4 L12 20 M4 12 L20 12" stroke={color} strokeWidth="0.7" opacity="0.5" /></svg>;
    case 'spiral':
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 12 C12 9 15 9 15 12 C15 15.5 9.5 15.5 9.5 11 C9.5 6.5 17 6.5 17 12 C17 18 6 18 6 11" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" /></svg>;
    case 'clock':
      return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth="1.4" /><path d="M12 8 L12 12 L15 14" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" /></svg>;
    case 'zone':
      return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="9" width="18" height="6" fill={color} opacity="0.25" /><rect x="3" y="9" width="18" height="6" fill="none" stroke={color} strokeWidth="1.2" /></svg>;
    case 'ruler':
      return <svg viewBox="0 0 24 24" style={s}><line x1="4" y1="20" x2="20" y2="4" stroke={color} strokeWidth="1.6" strokeLinecap="round" /><line x1="7" y1="17" x2="9" y2="15" stroke={color} strokeWidth="1" /><line x1="10" y1="14" x2="12" y2="12" stroke={color} strokeWidth="1" /><line x1="13" y1="11" x2="15" y2="9" stroke={color} strokeWidth="1" /></svg>;
    default:
      return null;
  }
}

const TOOL_GROUPS = [
  { name: 'Fibonacci', icon: 'spiral', color: C.gold, desc: 'Retracement, extension, and FLATS arcs derived from ratio geometry, not lagging indicators.' },
  { name: 'Gann', icon: 'compass', color: C.gold, desc: 'Squares, fans, and the Secret Angle — geometric time/price relationships mapped directly onto the chart.' },
  { name: 'Geometric', icon: 'square', color: C.purple, desc: 'Equilateral triangles, squares, and 3-point circles constructed from real swing points.' },
  { name: 'Vortex', icon: 'circle', color: C.pink, desc: 'Single, tri- and penta-vortex constructions for cyclical structure most platforms don\u2019t offer at all.' },
  { name: 'Time', icon: 'clock', color: C.green, desc: 'Time series projection and price\u2194time conversion — geometry applied to the x-axis, not just price.' },
  { name: 'Zones & Measure', icon: 'zone', color: C.blue, desc: 'Demand/supply zones and precise count/target measurement tools for execution.' },
];

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mykqbgdn';

function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ fontSize: 15, color: C.green, fontFamily: "'Inter', sans-serif", padding: '13px 0' }}>
        ✓ You&rsquo;re on the list &mdash; we&rsquo;ll be in touch when access opens.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.ink, padding: '13px 16px', borderRadius: 3, fontSize: 14, minWidth: 260, fontFamily: "'Inter', sans-serif" }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        style={{ background: C.gold, color: '#161200', fontWeight: 600, fontSize: 14, padding: '13px 22px', borderRadius: 3, border: 'none', cursor: status === 'loading' ? 'default' : 'pointer', opacity: status === 'loading' ? 0.7 : 1 }}
      >
        {status === 'loading' ? 'Sending…' : 'Notify Me'}
      </button>
      {status === 'error' && (
        <div style={{ width: '100%', color: C.red, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
          Something went wrong &mdash; please try again.
        </div>
      )}
    </form>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(14,14,14,0.85)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${C.line}` }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 3 L20 19 L4 19 Z" fill="none" stroke={C.gold} strokeWidth="1.6" /><circle cx="12" cy="3" r="1.8" fill={C.gold} /></svg>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, color: C.ink, letterSpacing: '0.3px' }}>GEOMETRIYA</span>
        </div>
        <div className="geo-nav-links" style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
          {['Method', 'Tools', 'Provenance', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: C.inkDim, textDecoration: 'none', fontSize: 13.5, fontFamily: "'Inter', sans-serif" }}>{l}</a>
          ))}
          <a href="#access" style={{ background: C.gold, color: '#161200', fontWeight: 600, fontSize: 13, fontFamily: "'Inter', sans-serif", padding: '9px 18px', borderRadius: 3, textDecoration: 'none' }}>Request Access</a>
        </div>
      </div>
    </div>
  );
}

export default function GeometriyaLanding() {
  return (
    <div style={{ background: C.bg, color: C.ink, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{FONTS}{`
        html { scroll-behavior: smooth; }
        .geo-badge { display:inline-flex; align-items:center; gap:6px; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.5px; text-transform:uppercase; color:${C.inkFaint}; border:1px solid ${C.line}; padding:5px 10px; border-radius:20px; }
        .geo-card { background:${C.bgPanel}; border:1px solid ${C.line}; transition: border-color 0.25s ease, transform 0.25s ease; }
        .geo-card:hover { border-color: var(--hc); transform: translateY(-2px); }
        @media (max-width: 860px) { .geo-nav-links { gap: 16px !important; } .geo-nav-links a:not(:last-child) { display:none; } .geo-hero-grid { grid-template-columns: 1fr !important; } .geo-tools-grid { grid-template-columns: 1fr 1fr !important; } .geo-pricing-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 520px) { .geo-tools-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <Nav />

      {/* HERO */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 24px 40px' }}>
        <div className="geo-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <div className="geo-badge">Not an indicator platform</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(34px, 4.4vw, 54px)', fontWeight: 700, lineHeight: 1.08, margin: '22px 0 20px', letterSpacing: '-0.5px' }}>
              Markets move in <span style={{ color: C.gold }}>geometry.</span><br />We just draw it.
            </h1>
            <p style={{ fontSize: 16.5, lineHeight: 1.65, color: C.inkDim, maxWidth: 480, marginBottom: 30 }}>
              Almost every charting platform gives you the same indicators. Geometriya is built end‑to‑end on geometric analysis &mdash; Gann angles, Fibonacci construction, Vortex cycles, and our own Mitotic Scaling &mdash; the discipline the rest of the industry treats as a footnote.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a href="#access" style={{ background: C.gold, color: '#161200', fontWeight: 600, fontSize: 14.5, padding: '13px 26px', borderRadius: 3, textDecoration: 'none' }}>Request Early Access</a>
              <a href="#tools" style={{ border: `1px solid ${C.line}`, color: C.ink, fontWeight: 500, fontSize: 14.5, padding: '13px 26px', borderRadius: 3, textDecoration: 'none' }}>See the tools →</a>
            </div>
          </div>
          <div style={{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.line}`, background: C.bgPanel }}>
            <HeroDrawing />
          </div>
        </div>
      </section>

      {/* WHY GEOMETRY */}
      <section id="method" style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, background: C.bgPanel }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          <div className="geo-badge" style={{ marginBottom: 18 }}>The method</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 600, marginBottom: 18 }}>
            Price and time aren&rsquo;t random. They&rsquo;re proportioned.
          </h2>
          <p style={{ color: C.inkDim, fontSize: 15.5, lineHeight: 1.75 }}>
            W.D. Gann and R.N. Elliott built entire trading careers on geometric structure, not lagging averages. That tradition never got mainstream software &mdash; most platforms bolt on one Fibonacci tool and call it done. Geometriya was built the other way around: geometry first, everything else in service of it. Squares, circles, spirals, and angles are first-class citizens on the chart, not an afterthought in a menu.
          </p>
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ marginBottom: 40, maxWidth: 620 }}>
          <div className="geo-badge" style={{ marginBottom: 16 }}>Instrument set</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 600, marginBottom: 10 }}>Every overlay is a construction, not a formula preset.</h2>
          <p style={{ color: C.inkDim, fontSize: 15 }}>The same toolset live inside the Geometriya workspace today.</p>
        </div>
        <div className="geo-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {TOOL_GROUPS.map(t => (
            <div key={t.name} className="geo-card" style={{ '--hc': t.color, padding: '24px 22px', borderRadius: 6 }}>
              <div style={{ marginBottom: 14 }}><ToolIcon shape={t.icon} color={t.color} /></div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15.5, marginBottom: 8, color: t.color }}>{t.name}</div>
              <div style={{ fontSize: 13.5, color: C.inkDim, lineHeight: 1.6 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MITOTIC SCALING CALLOUT */}
      <section style={{ borderTop: `1px solid ${C.line}`, background: `linear-gradient(180deg, ${C.bgPanel2} 0%, ${C.bg} 100%)` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }} className="geo-hero-grid">
          <div>
            <div className="geo-badge" style={{ marginBottom: 16 }}>Proprietary</div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(22px, 2.8vw, 30px)', fontWeight: 600, marginBottom: 16 }}>Mitotic Scaling</h2>
            <p style={{ color: C.inkDim, fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>
              Charts don&rsquo;t scale in round numbers &mdash; markets compress and expand geometrically. Mitotic Scaling steps the chart through a doubling/halving series so angle and proportion stay meaningful at every zoom level, from 1/64 to 512.
            </p>
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C.inkFaint, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[0.015625, 0.03125, 0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512].map(v => (
              <span key={v} style={{ border: `1px solid ${C.line}`, padding: '6px 10px', borderRadius: 3, color: v === 1 ? C.gold : C.inkFaint, borderColor: v === 1 ? C.gold : C.line }}>{v}</span>
            ))}
          </div>
        </div>
      </section>

      {/* PROVENANCE */}
      <section id="provenance" style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 24px', borderTop: `1px solid ${C.line}` }}>
        <div className="geo-badge" style={{ marginBottom: 16 }}>Not invented last week</div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 600, marginBottom: 40, maxWidth: 640 }}>Built on research, not a weekend hackathon.</h2>
        <div className="geo-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="geo-card" style={{ '--hc': C.gold, padding: '28px 26px', borderRadius: 6 }}>
            <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: C.gold, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>The book</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Geometrical Analysis</div>
            <div style={{ fontSize: 13.5, color: C.inkDim, marginBottom: 14, lineHeight: 1.6 }}>By Anand Kene, published on Amazon. The framework behind Geometriya&rsquo;s tools started as years of documented geometric market research &mdash; the software is that research made interactive.</div>
            <span style={{ fontSize: 12.5, color: C.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>Available on Amazon</span>
          </div>
          <div className="geo-card" style={{ '--hc': C.blue, padding: '28px 26px', borderRadius: 6 }}>
            <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: C.blue, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>The algo</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Live on TradingView</div>
            <div style={{ fontSize: 13.5, color: C.inkDim, marginBottom: 14, lineHeight: 1.6 }}>The same geometric logic runs as a Pine Script algo on TradingView for traders who want it inside a chart they already use daily.</div>
            <span style={{ fontSize: 12.5, color: C.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>Pine Script</span>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 24px', borderTop: `1px solid ${C.line}` }}>
        <div style={{ marginBottom: 40, maxWidth: 620 }}>
          <div className="geo-badge" style={{ marginBottom: 16 }}>Founding access</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 600, marginBottom: 10 }}>
            Lock in early pricing before the public launch.
          </h2>
          <p style={{ color: C.inkDim, fontSize: 15 }}>
            We&rsquo;re in private testing &mdash; founding members keep this pricing for as long as they stay subscribed, even after we raise it publicly.
          </p>
        </div>

        <div className="geo-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'stretch' }}>

          {/* READER */}
          <div className="geo-card" style={{ '--hc': C.inkFaint, padding: '30px 26px', borderRadius: 6, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: C.inkFaint, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reader</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30 }}>Free</span>
            </div>
            <div style={{ fontSize: 13, color: C.inkFaint, marginBottom: 22 }}>Start with the method itself</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
              {[
                'Geometrical Analysis — the book (Amazon)',
                'Full framework: Gann, Fibonacci, Vortex, Mitotic Scaling',
                'Documented chart examples & case studies',
                'No workspace access',
              ].map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 9, fontSize: 13.5, color: i === 3 ? C.inkFaint : C.inkDim, lineHeight: 1.5 }}>
                  <span style={{ color: i === 3 ? C.inkFaint : C.green, flexShrink: 0 }}>{i === 3 ? '—' : '✓'}</span>{f}
                </li>
              ))}
            </ul>
            <a href="#access" style={{ border: `1px solid ${C.line}`, color: C.ink, fontWeight: 500, fontSize: 14, padding: '12px 20px', borderRadius: 3, textDecoration: 'none', textAlign: 'center' }}>Get the book</a>
          </div>

          {/* TRADER — highlighted */}
          <div className="geo-card" style={{ '--hc': C.gold, padding: '30px 26px', borderRadius: 6, display: 'flex', flexDirection: 'column', borderColor: C.gold, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -12, left: 26, background: C.gold, color: '#161200', fontSize: 11, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", padding: '4px 10px', borderRadius: 3, letterSpacing: '0.5px' }}>MOST POPULAR</div>
            <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: C.gold, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trader</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30 }}>₹2,499</span>
              <span style={{ fontSize: 13.5, color: C.inkFaint }}>/ month</span>
            </div>
            <div style={{ fontSize: 13, color: C.inkFaint, marginBottom: 22 }}>Founding price, locked for life of subscription</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
              {[
                'Full Geometriya charting workspace',
                'Gann, Fibonacci, Vortex & Geometric overlay tools',
                'Mitotic Scaling on every timeframe',
                'Dream 45 scanner across your watchlist',
                'Unlimited saved charts & drawings',
              ].map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 9, fontSize: 13.5, color: C.inkDim, lineHeight: 1.5 }}>
                  <span style={{ color: C.gold, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <a href="#access" style={{ background: C.gold, color: '#161200', fontWeight: 600, fontSize: 14, padding: '12px 20px', borderRadius: 3, textDecoration: 'none', textAlign: 'center' }}>Request early access</a>
          </div>

          {/* TRADER + ALGO */}
          <div className="geo-card" style={{ '--hc': C.blue, padding: '30px 26px', borderRadius: 6, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: C.blue, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trader + Algo</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30 }}>₹3,999</span>
              <span style={{ fontSize: 13.5, color: C.inkFaint }}>/ month</span>
            </div>
            <div style={{ fontSize: 13, color: C.inkFaint, marginBottom: 22 }}>For traders who live inside TradingView</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
              {[
                'Everything in Trader',
                'Geometriya Pine Script algo, invite-only on TradingView',
                'Same geometric logic, running as automated signals',
                'Priority access to new overlay releases',
              ].map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 9, fontSize: 13.5, color: C.inkDim, lineHeight: 1.5 }}>
                  <span style={{ color: C.blue, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <a href="#access" style={{ border: `1px solid ${C.line}`, color: C.ink, fontWeight: 500, fontSize: 14, padding: '12px 20px', borderRadius: 3, textDecoration: 'none', textAlign: 'center' }}>Request early access</a>
          </div>
        </div>

        <p style={{ marginTop: 24, fontSize: 12.5, color: C.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>
          Pricing shown for founding members during private testing. Public pricing will be announced at launch.
        </p>
      </section>

      {/* ACCESS / CTA */}
      <section id="access" style={{ borderTop: `1px solid ${C.line}`, background: C.bgPanel }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '72px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(24px, 3vw, 30px)', fontWeight: 600, marginBottom: 14 }}>Currently in private testing</h2>
          <p style={{ color: C.inkDim, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
            We&rsquo;re refining the full workspace before opening it up. Leave your email and we&rsquo;ll reach out when access opens.
          </p>
          <WaitlistForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: C.inkFaint }}>GEOMETRIYA</span>
          <span style={{ fontSize: 12, color: C.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>Geometric market analysis · India</span>
        </div>
      </footer>
    </div>
  );
}
