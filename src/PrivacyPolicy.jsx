// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRIYA — PRIVACY POLICY
// Rendered at /privacy. Matches the marketing site's visual language (same
// color palette, fonts, and section rhythm as GeometriyaLanding.jsx) so it
// doesn't feel like a bolted-on legal page.
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg: '#0E0E0E',
  bgPanel: '#141414',
  line: '#2a2a2a',
  ink: '#E8E6E1',
  inkDim: '#8a8a86',
  inkFaint: '#4a4a48',
  gold: '#3B82F6',
};

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: [
      ['Account information', 'Full name, phone number, email address, and One-Time Password (OTP) verification data (not stored after verification).'],
      ['Payment information', 'Subscription plan and payment status, processed via Razorpay. We do not store your card, UPI, or bank details directly — these are handled entirely by Razorpay\u2019s secure payment infrastructure.'],
      ['Broker connection information (optional)', 'If you choose to connect a broker account (Dhan or Fyers) for intraday data, we store the access tokens needed to fetch market data on your behalf. We do not have the ability to place trades, withdraw funds, or modify your broker account settings through this connection — access is limited to read-only market data.'],
      ['Usage data', 'Watchlists, chart layouts, drawn angles/overlays, and saved preferences you create within the app. Basic device and app version information, for troubleshooting and support.'],
    ],
    note: 'We do NOT access your contacts, camera, microphone, location, or files stored on your device. We do not sell your personal information to third parties.',
  },
  {
    title: '2. How We Use Your Information',
    list: [
      'To create and manage your Geometriya account',
      'To verify your identity via OTP during signup and login',
      'To process subscription payments via Razorpay',
      'To fetch market data from connected broker accounts (if you opt in)',
      'To save and sync your charts, watchlists, and preferences across sessions',
      'To provide customer support',
      'To send service-related communications (OTP codes, subscription confirmations, product updates)',
    ],
    note: 'We do not use your data for advertising or share it with advertisers.',
  },
  {
    title: '3. Data Storage and Security',
    body: [[null, 'Your data is stored on secure cloud infrastructure (Supabase, hosted in the Mumbai region) and our backend servers. We use industry-standard measures, including encrypted connections (HTTPS) and access-restricted databases, to protect your information. Broker access tokens are stored server-side only and are never exposed to the client app or third parties.']],
  },
  {
    title: '4. Third-Party Services',
    list: [
      'Razorpay — payment processing',
      'Resend — transactional email delivery (OTP codes)',
      'Dhan / Fyers — broker data integration (only if you connect your account)',
      'Supabase — database and authentication infrastructure',
      'Vercel / Render — application hosting',
    ],
  },
  {
    title: '5. Data Retention',
    body: [[null, 'We retain your account data for as long as your account remains active. If you request account deletion, we will remove your personal data from our systems within a reasonable timeframe, except where retention is required by law (e.g., payment records for tax/compliance purposes).']],
  },
  {
    title: '6. Your Rights',
    list: [
      'Request a copy of the personal data we hold about you',
      'Request correction of inaccurate data',
      'Request deletion of your account and associated data',
      'Disconnect a linked broker account at any time from within the app',
    ],
    note: 'To exercise these rights, contact us using the details below.',
  },
  {
    title: '7. Children\u2019s Privacy',
    body: [[null, 'Geometriya is not directed at children under 18. We do not knowingly collect data from minors.']],
  },
  {
    title: '8. Changes to This Policy',
    body: [[null, 'We may update this Privacy Policy from time to time. Material changes will be communicated via the app or email. Continued use of the Service after changes constitutes acceptance of the updated policy.']],
  },
];

export default function PrivacyPolicy() {
  return (
    <div style={{ background: C.bg, color: C.ink, minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
      `}</style>

      {/* Simple header, links back to the main site */}
      <header style={{ borderBottom: `1px solid ${C.line}`, background: C.bgPanel }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: C.ink, textDecoration: 'none' }}>
            Geometriya
          </a>
          <a href="/" style={{ fontSize: 13, color: C.inkDim, textDecoration: 'none' }}>← Back to site</a>
        </div>
      </header>

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '56px 24px 96px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 700, marginBottom: 8 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: C.inkFaint, marginBottom: 40 }}>
          Last updated: July 15, 2026
        </p>

        <p style={{ fontSize: 15, lineHeight: 1.75, color: C.inkDim, marginBottom: 40 }}>
          This Privacy Policy explains how Geometriya (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;the app&rdquo;) collects, uses, and protects your information when you use the Geometriya website and mobile application (together, &ldquo;the Service&rdquo;), operated by Geometrical Analysis.
        </p>

        {SECTIONS.map((s, i) => (
          <section key={i} style={{ marginBottom: 40, paddingTop: 32, borderTop: `1px solid ${C.line}` }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, marginBottom: 16, color: C.ink }}>
              {s.title}
            </h2>

            {s.body && s.body.map(([label, text], j) => (
              <p key={j} style={{ fontSize: 14.5, lineHeight: 1.75, color: C.inkDim, marginBottom: 12 }}>
                {label && <strong style={{ color: C.ink, fontWeight: 600 }}>{label}: </strong>}
                {text}
              </p>
            ))}

            {s.list && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {s.list.map((item, j) => (
                  <li key={j} style={{ display: 'flex', gap: 9, fontSize: 14.5, color: C.inkDim, lineHeight: 1.6 }}>
                    <span style={{ color: C.gold, flexShrink: 0 }}>—</span>{item}
                  </li>
                ))}
              </ul>
            )}

            {s.note && (
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: C.inkFaint, marginTop: 16, fontStyle: 'italic' }}>
                {s.note}
              </p>
            )}
          </section>
        ))}

        <section style={{ paddingTop: 32, borderTop: `1px solid ${C.line}` }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, marginBottom: 16, color: C.ink }}>
            9. Contact Us
          </h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, color: C.inkDim }}>
            If you have questions about this Privacy Policy or your data, contact us at:
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.9, color: C.inkDim, marginTop: 12 }}>
            <strong style={{ color: C.ink }}>Email:</strong> geometriya.analysis@gmail.com<br />
            <strong style={{ color: C.ink }}>Website:</strong> https://www.geometricalanalysis.com
          </p>
        </section>
      </main>

      <footer style={{ borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: C.inkFaint }}>GEOMETRIYA</span>
          <span style={{ fontSize: 12, color: C.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>Geometric market analysis · India</span>
        </div>
      </footer>
    </div>
  );
}
