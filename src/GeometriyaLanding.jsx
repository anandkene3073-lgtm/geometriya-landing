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
  gold: '#3B82F6',
  green: '#1D9E75',
  red: '#E24B4A',
  purple: '#7F77DD',
  blue: '#22B8CF',
  pink: '#D4537E',
  paper: '#F4F1EA',
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
`;

// ── Price bars with geometric overlays (triangle, square, pentagon, Gann box), self-animating on mount
function HeroDrawing() {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 300);
    return () => clearTimeout(t);
  }, []);

  const bars = [
    { x: 30, o: 210, c: 190, h: 220, l: 180, up: true },
    { x: 56, o: 190, c: 205, h: 212, l: 185, up: false },
    { x: 82, o: 205, c: 160, h: 210, l: 155, up: true },
    { x: 108, o: 160, c: 175, h: 180, l: 150, up: false },
    { x: 134, o: 175, c: 120, h: 180, l: 115, up: true },
    { x: 160, o: 120, c: 140, h: 148, l: 112, up: false },
    { x: 186, o: 140, c: 95, h: 145, l: 90, up: true },
    { x: 212, o: 95, c: 108, h: 118, l: 88, up: false },
    { x: 238, o: 108, c: 60, h: 112, l: 55, up: true },
    { x: 264, o: 60, c: 78, h: 90, l: 52, up: false },
  ];

  const gannBox = { x: 330, y: 40, w: 130, h: 130 };
  const gannV = [gannBox.x + gannBox.w / 4, gannBox.x + gannBox.w / 2, gannBox.x + (gannBox.w * 3) / 4];
  const gannH = [gannBox.y + gannBox.h / 4, gannBox.y + gannBox.h / 2, gannBox.y + (gannBox.h * 3) / 4];

  return (
    <svg viewBox="0 0 480 420" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <pattern id="blueprintGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={C.line} strokeWidth="0.5" opacity="0.4" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="480" height="420" fill="url(#blueprintGrid)" />

      {/* Pentagon — faint background, penta-vortex motif */}
      <polygon
        points="280,50 403.6,139.8 356.4,285.2 203.6,285.2 156.4,139.8"
        fill="none" stroke={C.pink} strokeWidth="1.2"
        opacity={drawn ? 0.22 : 0}
        style={{ transition: 'opacity 1s ease 0.2s' }}
      />

      {/* Triangle — ascending structure across the chart */}
      <path
        d="M 38 400 L 246 40 L 460 360 Z"
        fill={C.gold} fillOpacity={drawn ? 0.05 : 0}
        stroke={C.gold} strokeWidth="1.4" strokeDasharray="6 4"
        opacity={drawn ? 1 : 0}
        style={{ transition: 'opacity 0.9s ease 1.6s' }}
      />

      {/* Square — measured-move box with diagonals */}
      <g opacity={drawn ? 1 : 0} style={{ transition: 'opacity 0.8s ease 1.1s' }}>
        <rect x="82" y="240" width="140" height="140" fill="none" stroke={C.purple} strokeWidth="1.3" strokeDasharray="4 3" />
        <line x1="82" y1="240" x2="222" y2="380" stroke={C.purple} strokeWidth="0.8" opacity="0.5" />
        <line x1="222" y1="240" x2="82" y2="380" stroke={C.purple} strokeWidth="0.8" opacity="0.5" />
      </g>

      {/* Gann box — subdivided grid, top right */}
      <g opacity={drawn ? 1 : 0} style={{ transition: 'opacity 0.8s ease 1.9s' }}>
        <rect x={gannBox.x} y={gannBox.y} width={gannBox.w} height={gannBox.h} fill="none" stroke={C.blue} strokeWidth="1.3" />
        {gannV.map((gx, i) => (
          <line key={`v${i}`} x1={gx} y1={gannBox.y} x2={gx} y2={gannBox.y + gannBox.h} stroke={C.blue} strokeWidth="0.6" opacity="0.5" />
        ))}
        {gannH.map((gy, i) => (
          <line key={`h${i}`} x1={gannBox.x} y1={gy} x2={gannBox.x + gannBox.w} y2={gy} stroke={C.blue} strokeWidth="0.6" opacity="0.5" />
        ))}
        <line x1={gannBox.x} y1={gannBox.y} x2={gannBox.x + gannBox.w} y2={gannBox.y + gannBox.h} stroke={C.blue} strokeWidth="0.7" opacity="0.6" />
        <line x1={gannBox.x + gannBox.w} y1={gannBox.y} x2={gannBox.x} y2={gannBox.y + gannBox.h} stroke={C.blue} strokeWidth="0.7" opacity="0.6" />
      </g>

      {/* Price bars (OHLC) */}
      {bars.map((k, i) => {
        const yHigh = 420 - k.h, yLow = 420 - k.l, yOpen = 420 - k.o, yClose = 420 - k.c;
        const cx = k.x + 8;
        const color = k.up ? C.green : C.red;
        return (
          <g key={i} style={{ opacity: drawn ? 1 : 0, transition: `opacity 0.4s ease ${0.05 * i}s` }}>
            <line x1={cx} y1={yHigh} x2={cx} y2={yLow} stroke={color} strokeWidth="1.5" />
            <line x1={cx - 6} y1={yOpen} x2={cx} y2={yOpen} stroke={color} strokeWidth="1.5" />
            <line x1={cx} y1={yClose} x2={cx + 6} y2={yClose} stroke={color} strokeWidth="1.5" />
          </g>
        );
      })}

      {/* Apex marker */}
      <circle cx="246" cy="40" r="3.2" fill={C.gold} opacity={drawn ? 1 : 0} style={{ transition: 'opacity 0.4s ease 2.3s' }} />
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

// ── Backend API base URL ──
// Live backend, deployed on Render.
const API_BASE_URL = 'https://geometriya-backend-render.onrender.com';

function SignupForm() {
  const [step, setStep] = useState('details'); // details | otp | success | already_registered
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('');

  const inputStyle = {
    background: C.bg,
    border: `1px solid ${C.line}`,
    color: C.ink,
    padding: '13px 16px',
    borderRadius: 3,
    fontSize: 14,
    minWidth: 220,
    fontFamily: "'Inter', sans-serif",
  };

  const buttonStyle = (disabled) => ({
    background: C.gold,
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: 14,
    padding: '13px 22px',
    borderRadius: 3,
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.7 : 1,
  });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email: email || undefined }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setStep('already_registered');
        setStatus('idle');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setStep('otp');
      setStatus('idle');
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong — please try again.');
      setStatus('error');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code — please try again.');
      setStep('success');
      setStatus('idle');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid code — please try again.');
      setStatus('error');
    }
  };

  if (step === 'already_registered') {
    return (
      <div style={{ fontSize: 15, color: C.inkDim, fontFamily: "'Inter', sans-serif", padding: '13px 0' }}>
        This number is already registered. If you believe this is a mistake, reach out to us directly.
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div style={{ fontSize: 15, color: C.green, fontFamily: "'Inter', sans-serif", padding: '13px 0' }}>
        ✓ You&rsquo;re verified &mdash; your account is awaiting approval. We&rsquo;ll notify you the moment your 30-day trial is activated.
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          inputMode="numeric"
          required
          placeholder="Enter the code we sent you"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={{ ...inputStyle, minWidth: 220, letterSpacing: 2 }}
        />
        <button type="submit" disabled={status === 'loading'} style={buttonStyle(status === 'loading')}>
          {status === 'loading' ? 'Verifying…' : 'Verify'}
        </button>
        {status === 'error' && (
          <div style={{ width: '100%', color: C.red, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
            {errorMsg}
          </div>
        )}
        <div style={{ width: '100%', color: C.inkFaint, fontSize: 12, fontFamily: "'Inter', sans-serif" }}>
          Sent to {phone}. Didn&rsquo;t get it?{' '}
          <span
            onClick={() => { setStep('details'); setOtp(''); setStatus('idle'); setErrorMsg(''); }}
            style={{ color: C.gold, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Try again
          </span>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
      <input
        type="text"
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />
      <input
        type="tel"
        required
        placeholder="10-digit mobile number"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
        style={inputStyle}
      />
      <input
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ ...inputStyle, minWidth: 220 }}
      />
      <button
        type="submit"
        disabled={status === 'loading' || phone.length !== 10}
        style={buttonStyle(status === 'loading' || phone.length !== 10)}
      >
        {status === 'loading' ? 'Sending…' : 'Get Early Access'}
      </button>
      {status === 'error' && (
        <div style={{ width: '100%', color: C.red, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
          {errorMsg}
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
          <img src="/logo.png" alt="Geometriya" width="24" height="24" style={{ display: 'block' }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, color: C.ink, letterSpacing: '0.3px' }}>GEOMETRIYA</span>
        </div>
        <div className="geo-nav-links" style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
          {['Method', 'Tools', 'Provenance', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: C.inkDim, textDecoration: 'none', fontSize: 13.5, fontFamily: "'Inter', sans-serif" }}>{l}</a>
          ))}
          <a href="#access" style={{ background: C.gold, color: '#FFFFFF', fontWeight: 600, fontSize: 13, fontFamily: "'Inter', sans-serif", padding: '9px 18px', borderRadius: 3, textDecoration: 'none' }}>Request Access</a>
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
              <a href="#access" style={{ background: C.gold, color: '#FFFFFF', fontWeight: 600, fontSize: 14.5, padding: '13px 26px', borderRadius: 3, textDecoration: 'none' }}>Request Early Access</a>
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
            <div style={{ position: 'absolute', top: -12, left: 26, background: C.gold, color: '#FFFFFF', fontSize: 11, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", padding: '4px 10px', borderRadius: 3, letterSpacing: '0.5px' }}>MOST POPULAR</div>
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
            <a href="#access" style={{ background: C.gold, color: '#FFFFFF', fontWeight: 600, fontSize: 14, padding: '12px 20px', borderRadius: 3, textDecoration: 'none', textAlign: 'center' }}>Request early access</a>
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
            We&rsquo;re refining the full workspace before opening it up. Sign up with your mobile number and we&rsquo;ll verify you instantly &mdash; your 30-day trial starts as soon as we approve your access.
          </p>
          <SignupForm />
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
