import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRIYA — MARKETING SITE
// "The world's only charting platform built entirely on geometric analysis."
// ─────────────────────────────────────────────────────────────────────────────

// Palette matches the trading app's login/signup gate (navy background,
// blue accent gradient) so the marketing site and the app feel like one
// product instead of two different visual styles.
const C = {
  bg: '#060a14',
  bgPanel: '#0a1424',
  bgPanel2: '#101c33',
  line: '#1e2f4d',
  ink: '#e7edf7',
  inkDim: '#8fa3c4',
  inkFaint: '#5c7699',
  gold: '#3E7BFA',
  goldDeep: '#2F5FE0',
  goldLight: '#7FB1FF',
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

// ── CSS for the animated hero "monitor" mockup (HeroMonitor component below).
// Pure keyframe animation: cross-fades between two real product screenshots
// (Gann 45° angle, then Mitotic triangle) with synced marker call-outs.
const HERO_MONITOR_CSS = `
  .monitor-wrap { width:100%; max-width:480px; margin:0 auto; position:relative; filter: drop-shadow(0 35px 70px rgba(0,0,0,.55)); }
  .monitor-wrap::before {
    content:''; position:absolute; inset:-40px; z-index:-1; border-radius:28px;
    background: radial-gradient(closest-side, rgba(90,131,255,.22), transparent 75%);
    pointer-events:none;
  }
  .monitor {
    background:linear-gradient(155deg,#3a4152,#20242f 45%,#14161d);
    border-radius:20px; padding:14px 14px 34px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,.08) inset,
      0 1px 0 rgba(255,255,255,.12) inset,
      0 -1px 0 rgba(0,0,0,.4) inset,
      0 0 0 1px rgba(0,0,0,.5);
    position:relative;
  }
  .monitor-cam { position:absolute; top:6px; left:50%; transform:translateX(-50%); width:6px; height:6px; border-radius:50%; background:#0a0c10; box-shadow:0 0 0 1.5px rgba(255,255,255,.06), inset 0 0 2px rgba(90,131,255,.6); }
  .monitor-chin-dot { position:absolute; bottom:12px; left:50%; transform:translateX(-50%); width:7px; height:7px; border-radius:50%; background:rgba(90,131,255,.5); box-shadow:0 0 8px 1px rgba(90,131,255,.6); }
  .browser-bar { display:flex; align-items:center; gap:10px; padding:10px 12px; background:linear-gradient(180deg,#181f30,#121728); border-radius:9px 9px 0 0; }
  .tl-dot { width:10px; height:10px; border-radius:50%; }
  .tl-red { background:#ff5f57; }
  .tl-yellow { background:#febc2e; }
  .tl-green { background:#28c840; }
  .addr-pill { flex:1; margin-left:6px; display:flex; align-items:center; justify-content:center; gap:6px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.06); border-radius:999px; padding:5px 14px; font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:11px; letter-spacing:.3px; color:#6b7aa0; }
  .addr-pill svg { opacity:.7; flex:none; }
  .screen-outer {
    position:relative; border-radius:0 0 9px 9px; overflow:hidden; background:#050505;
    box-shadow: 0 0 0 1px rgba(90,131,255,.12) inset;
  }
  .glare { position:absolute; inset:0; z-index:8; pointer-events:none; background:linear-gradient(115deg, transparent 40%, rgba(255,255,255,.05) 48%, rgba(255,255,255,.10) 50%, rgba(255,255,255,.05) 52%, transparent 60%); background-size:250% 250%; animation: gm-glare 26s linear infinite; }
  @keyframes gm-glare { 0% { background-position: 130% -30%; } 45% { background-position: -30% 130%; } 100% { background-position: -30% 130%; } }
  .vignette { position:absolute; inset:0; z-index:7; pointer-events:none; box-shadow: inset 0 0 50px rgba(0,0,0,.5), inset 0 0 2px rgba(255,255,255,.08); }

  .frame { position:relative; width:100%; padding-top:80.472%; background:#050505; overflow:hidden; }
  .frame .chart-img { position:absolute; inset:0; width:100%; height:100%; display:block; object-fit:cover; filter: brightness(1.1) contrast(1.08) saturate(1.12); }

  .mitotic-badge {
    position:absolute; top:10px; right:10px; z-index:5;
    display:flex; align-items:center; gap:6px;
    background:#0c2620; border:1px solid rgba(47,191,113,.4);
    border-radius:999px; padding:4px 12px 4px 6px;
    animation: gm-badge-pulse 26s ease-in-out infinite;
  }
  .mitotic-lock { width:16px; height:16px; border-radius:50%; background:#e6a419; display:flex; align-items:center; justify-content:center; }
  .mitotic-text { font-family:'IBM Plex Mono',ui-monospace,monospace; font-weight:600; font-size:12px; color:#4fe0a0; letter-spacing:.2px; }
  @keyframes gm-badge-pulse {
    0%, 39%   { box-shadow:none; border-color:rgba(47,191,113,.4); }
    41%       { box-shadow:0 0 0 4px rgba(230,164,25,.28), 0 0 18px 4px rgba(230,164,25,.5); border-color:#e6a419; }
    43%       { box-shadow:none; border-color:rgba(47,191,113,.4); }
    45%       { box-shadow:0 0 0 4px rgba(230,164,25,.28), 0 0 18px 4px rgba(230,164,25,.5); border-color:#e6a419; }
    47%, 83%  { box-shadow:none; border-color:rgba(47,191,113,.4); }
    85%       { box-shadow:0 0 0 4px rgba(230,164,25,.28), 0 0 18px 4px rgba(230,164,25,.5); border-color:#e6a419; }
    87%       { box-shadow:none; border-color:rgba(47,191,113,.4); }
    89%       { box-shadow:0 0 0 4px rgba(230,164,25,.28), 0 0 18px 4px rgba(230,164,25,.5); border-color:#e6a419; }
    91%, 100% { box-shadow:none; border-color:rgba(47,191,113,.4); }
  }

  .scanline { position:absolute; top:0; bottom:0; left:0; width:2px; z-index:3; background:#e6a419; box-shadow:0 0 14px 3px rgba(230,164,25,.75); animation:gm-scan-p1 26s linear infinite; }
  .scanline2 { position:absolute; top:0; bottom:0; left:0; width:2px; z-index:3; background:#e6a419; box-shadow:0 0 14px 3px rgba(230,164,25,.75); animation:gm-scan-p2 26s linear infinite; }

  .marker { position:absolute; z-index:4; }
  .m-ring { width:20px; height:20px; border-radius:50%; border:2px solid #e6a419; transform:translate(-50%,-50%) scale(.5); opacity:0; }
  .m-dot { width:6px; height:6px; border-radius:50%; background:#e6a419; transform:translate(-50%,-50%); opacity:0; box-shadow:0 0 10px 3px rgba(230,164,25,.9); }
  .m-label { font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:10.5px; letter-spacing:1px; color:#e6a419; white-space:nowrap; opacity:0; }
  .lbl-below { transform:translate(-50%,140%); }
  .lbl-above { transform:translate(-50%,-160%); }
  .lbl-below-far { transform:translate(-50%,220%); }
  .lbl-below-tight { transform:translate(-50%,75%); }

  .m-echo { width:26px; height:26px; border-radius:50%; border:1.5px solid #e6a419; transform:translate(-50%,-50%) scale(.6); opacity:0; z-index:3; }

  .edge-glow {
    position:absolute; z-index:2; transform-origin:0 0;
    left:40.57%; top:46.89%; width:36.08%;
    transform:rotate(42.83deg);
    height:3px; border-radius:2px;
    background:linear-gradient(90deg, rgba(230,164,25,0), #e6a419, rgba(230,164,25,0));
    opacity:0; filter:drop-shadow(0 0 6px rgba(230,164,25,.8));
    animation: gm-edge-glow 26s linear infinite;
  }
  .level-glow {
    position:absolute; z-index:2; height:10px;
    left:32.74%; width:34.05%; top:calc(72.8% - 5px);
    border-top:2px dashed rgba(230,164,25,0);
    animation: gm-level-glow 26s linear infinite;
  }
  .level-label{
    position:absolute; z-index:4; left:49.77%; top:calc(72.8% + 10px);
    transform:translateX(-50%);
    font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:11px; letter-spacing:1.5px; color:#e6a419;
    white-space:nowrap; opacity:0; text-shadow:0 0 10px rgba(230,164,25,.5);
    animation: gm-level-label 26s linear infinite;
  }
  .level-sublabel{
    position:absolute; z-index:4; left:49.77%; top:calc(72.8% + 27px);
    transform:translateX(-50%);
    font-family:'IBM Plex Mono',ui-monospace,monospace; font-size:9.5px; letter-spacing:1.2px; color:#4fe0a0;
    white-space:nowrap; opacity:0;
    animation: gm-level-label 26s linear infinite;
  }

  .chart1 { animation: gm-chart1-fade 26s linear infinite; }
  @keyframes gm-chart1-fade { 0%, 44% { opacity:1; } 52%, 92% { opacity:0; } 100% { opacity:1; } }
  @keyframes gm-scan-p1 {
    0%{left:0%;opacity:0;} 1%{opacity:1;left:0%;}
    15%{left:57.36%;opacity:1;} 20%{left:57.36%;opacity:1;}
    25%{left:75.29%;opacity:1;} 30%{left:75.29%;opacity:1;}
    32%{left:80.81%;opacity:1;} 37%{left:80.81%;opacity:1;}
    39%{left:80.81%;opacity:0;} 50%,100%{left:0%;opacity:0;}
  }
  .m0-ring{left:4.24%;top:82.7%;animation:gm-flash0 26s linear infinite;}
  .m0-dot{left:4.24%;top:82.7%;animation:gm-dot0 26s linear infinite;}
  .m0-label{left:4.24%;top:82.7%;animation:gm-label0 26s linear infinite;}
  @keyframes gm-flash0{0%,2%{opacity:0;transform:translate(-50%,-50%) scale(.5);}3.5%{opacity:1;transform:translate(-50%,-50%) scale(1);}4.5%{opacity:.3;transform:translate(-50%,-50%) scale(2);}5.5%{opacity:1;transform:translate(-50%,-50%) scale(1);}6.5%,50%,100%{opacity:0;transform:translate(-50%,-50%) scale(.5);}}
  @keyframes gm-dot0{0%,2%{opacity:0;}3.5%,5.5%{opacity:1;}6.5%,50%,100%{opacity:0;}}
  @keyframes gm-label0{0%,3.5%{opacity:0;}4.5%,5.5%{opacity:1;}6.5%,50%,100%{opacity:0;}}

  .m1-ring{left:35.51%;top:33.2%;animation:gm-flash1 26s linear infinite;}
  .m1-dot{left:35.51%;top:33.2%;animation:gm-dot1 26s linear infinite;}
  .m1-label{left:35.51%;top:33.2%;animation:gm-label1 26s linear infinite;}
  @keyframes gm-flash1{0%,8%{opacity:0;transform:translate(-50%,-50%) scale(.5);}10.3%{opacity:1;transform:translate(-50%,-50%) scale(1);}11.3%{opacity:.3;transform:translate(-50%,-50%) scale(2);}12.3%{opacity:1;transform:translate(-50%,-50%) scale(1);}13.3%,50%,100%{opacity:0;transform:translate(-50%,-50%) scale(.5);}}
  @keyframes gm-dot1{0%,8%{opacity:0;}10.3%,12.3%{opacity:1;}13.3%,50%,100%{opacity:0;}}
  @keyframes gm-label1{0%,10.3%{opacity:0;}11.3%,12.3%{opacity:1;}13.3%,50%,100%{opacity:0;}}

  .m2-ring{left:57.36%;top:18.8%;animation:gm-flash2 26s linear infinite;}
  .m2-dot{left:57.36%;top:18.8%;animation:gm-dot2 26s linear infinite;}
  .m2-label{left:57.36%;top:18.8%;animation:gm-label2 26s linear infinite;}
  @keyframes gm-flash2{0%,14%{opacity:0;transform:translate(-50%,-50%) scale(.5);}15%{opacity:1;transform:translate(-50%,-50%) scale(1);}16%{opacity:.25;transform:translate(-50%,-50%) scale(2.2);}17%{opacity:1;transform:translate(-50%,-50%) scale(1);}18%{opacity:.25;transform:translate(-50%,-50%) scale(2.2);}18.5%,20%{opacity:1;transform:translate(-50%,-50%) scale(1);}22%,50%,100%{opacity:0;transform:translate(-50%,-50%) scale(.5);}}
  @keyframes gm-dot2{0%,14%{opacity:0;}15%,20%{opacity:1;}22%,50%,100%{opacity:0;}}
  @keyframes gm-label2{0%,15%{opacity:0;}16%,20%{opacity:1;}22%,50%,100%{opacity:0;}}

  .m3-ring{left:75.29%;top:58.3%;animation:gm-flash3 26s linear infinite;}
  .m3-dot{left:75.29%;top:58.3%;animation:gm-dot3 26s linear infinite;}
  .m3-label{left:75.29%;top:58.3%;animation:gm-label3 26s linear infinite;}
  @keyframes gm-flash3{0%,24%{opacity:0;transform:translate(-50%,-50%) scale(.5);}25%{opacity:1;transform:translate(-50%,-50%) scale(1);}26%{opacity:.25;transform:translate(-50%,-50%) scale(2.2);}27%{opacity:1;transform:translate(-50%,-50%) scale(1);}28%{opacity:.25;transform:translate(-50%,-50%) scale(2.2);}28.5%,30%{opacity:1;transform:translate(-50%,-50%) scale(1);}32%,50%,100%{opacity:0;transform:translate(-50%,-50%) scale(.5);}}
  @keyframes gm-dot3{0%,24%{opacity:0;}25%,30%{opacity:1;}32%,50%,100%{opacity:0;}}
  @keyframes gm-label3{0%,25%{opacity:0;}26%,30%{opacity:1;}32%,50%,100%{opacity:0;}}

  .m4-ring{left:80.81%;top:51.9%;animation:gm-flash4 26s linear infinite;}
  .m4-dot{left:80.81%;top:51.9%;animation:gm-dot4 26s linear infinite;}
  .m4-label{left:80.81%;top:51.9%;animation:gm-label4 26s linear infinite;}
  @keyframes gm-flash4{0%,31%{opacity:0;transform:translate(-50%,-50%) scale(.5);}32%{opacity:1;transform:translate(-50%,-50%) scale(1);}33%{opacity:.25;transform:translate(-50%,-50%) scale(2.2);}34%{opacity:1;transform:translate(-50%,-50%) scale(1);}35%{opacity:.25;transform:translate(-50%,-50%) scale(2.2);}35.5%,37%{opacity:1;transform:translate(-50%,-50%) scale(1);}39%,50%,100%{opacity:0;transform:translate(-50%,-50%) scale(.5);}}
  @keyframes gm-dot4{0%,31%{opacity:0;}32%,37%{opacity:1;}39%,50%,100%{opacity:0;}}
  @keyframes gm-label4{0%,32%{opacity:0;}33%,37%{opacity:1;}39%,50%,100%{opacity:0;}}

  .chart2 { animation: gm-chart2-fade 26s linear infinite; }
  @keyframes gm-chart2-fade { 0%, 44%  { opacity:0; } 52%, 92% { opacity:1; } 100% { opacity:0; } }

  @keyframes gm-scan-p2 {
    0%,52%   { left:0%; opacity:0; }
    53%      { left:0%; opacity:1; }
    56%      { left:32.64%; opacity:1; }
    60%      { left:32.64%; opacity:1; }
    64%      { left:40.57%; opacity:1; }
    68%      { left:40.57%; opacity:1; }
    69%      { left:40.57%; opacity:.35; }
    74%      { left:40.57%; opacity:.35; }
    75%      { left:40.57%; opacity:1; }
    78%      { left:67.03%; opacity:1; }
    91%      { left:67.03%; opacity:1; }
    92%      { left:67.03%; opacity:0; }
    100%     { left:0%; opacity:0; }
  }

  .mA-ring{left:32.64%;top:90.74%;animation:gm-flashA 26s linear infinite;}
  .mA-dot{left:32.64%;top:90.74%;animation:gm-dotA 26s linear infinite;}
  .mA-label{left:32.64%;top:90.74%;animation:gm-labelA 26s linear infinite;}
  @keyframes gm-flashA{0%,56%{opacity:0;transform:translate(-50%,-50%) scale(.5);}57.2%{opacity:1;transform:translate(-50%,-50%) scale(1);}58.2%{opacity:.3;transform:translate(-50%,-50%) scale(2.1);}59.2%{opacity:1;transform:translate(-50%,-50%) scale(1);}60%,100%{opacity:0;transform:translate(-50%,-50%) scale(.5);}}
  @keyframes gm-dotA{0%,56%{opacity:0;}57.2%,59.2%{opacity:1;}60%,100%{opacity:0;}}
  @keyframes gm-labelA{0%,57.2%{opacity:0;}58.2%,59.5%{opacity:1;}60%,100%{opacity:0;}}

  .mB-ring{left:40.57%;top:46.89%;animation:gm-flashB 26s linear infinite;}
  .mB-dot{left:40.57%;top:46.89%;animation:gm-dotB 26s linear infinite;}
  .mB-label{left:40.57%;top:46.89%;animation:gm-labelB 26s linear infinite;}
  @keyframes gm-flashB{0%,64%{opacity:0;transform:translate(-50%,-50%) scale(.5);}65.2%{opacity:1;transform:translate(-50%,-50%) scale(1);}66.2%{opacity:.3;transform:translate(-50%,-50%) scale(2.1);}67.2%{opacity:1;transform:translate(-50%,-50%) scale(1);}68%,100%{opacity:0;transform:translate(-50%,-50%) scale(.5);}}
  @keyframes gm-dotB{0%,64%{opacity:0;}65.2%,67.2%{opacity:1;}68%,100%{opacity:0;}}
  @keyframes gm-labelB{0%,65.2%{opacity:0;}66.2%,67.5%{opacity:1;}68%,100%{opacity:0;}}

  @keyframes gm-level-glow{
    0%,69%    { opacity:0; border-color:rgba(230,164,25,0); }
    70.25%    { opacity:1; border-color:rgba(230,164,25,.9); box-shadow:0 0 14px 2px rgba(230,164,25,.5); }
    71.5%     { opacity:.5; border-color:rgba(230,164,25,.4); }
    72.75%    { opacity:1; border-color:rgba(230,164,25,.9); box-shadow:0 0 14px 2px rgba(230,164,25,.5); }
    74%,100%  { opacity:0; border-color:rgba(230,164,25,0); }
  }
  @keyframes gm-level-label{0%,70%{opacity:0;}71%,73%{opacity:1;}74%,100%{opacity:0;}}

  .mA-echo{left:32.64%;top:90.74%;animation:gm-echoA 26s linear infinite;}
  .mB-echo{left:40.57%;top:46.89%;animation:gm-echoB 26s linear infinite;}
  .mC-echo{left:67.03%;top:77.37%;animation:gm-echoC 26s linear infinite;}
  @keyframes gm-echoA{0%,69%{opacity:0;transform:translate(-50%,-50%) scale(.6);}69.55%{opacity:.9;transform:translate(-50%,-50%) scale(1.3);}70.2%{opacity:0;transform:translate(-50%,-50%) scale(1.8);}70.3%,100%{opacity:0;transform:translate(-50%,-50%) scale(.6);}}
  @keyframes gm-echoB{0%,70.67%{opacity:0;transform:translate(-50%,-50%) scale(.6);}71.2%{opacity:.9;transform:translate(-50%,-50%) scale(1.3);}71.9%{opacity:0;transform:translate(-50%,-50%) scale(1.8);}72%,100%{opacity:0;transform:translate(-50%,-50%) scale(.6);}}
  @keyframes gm-echoC{0%,72.33%{opacity:0;transform:translate(-50%,-50%) scale(.6);}72.9%{opacity:.9;transform:translate(-50%,-50%) scale(1.3);}73.6%{opacity:0;transform:translate(-50%,-50%) scale(1.8);}73.7%,100%{opacity:0;transform:translate(-50%,-50%) scale(.6);}}

  @keyframes gm-edge-glow{ 0%,75% { opacity:0; } 75.7% { opacity:1; } 76.6% { opacity:1; } 77%,100% { opacity:0; } }

  .mC-ring{left:67.03%;top:77.37%;animation:gm-flashC 26s linear infinite;}
  .mC-dot{left:67.03%;top:77.37%;animation:gm-dotC 26s linear infinite;}
  .mC-label{left:67.03%;top:77.37%;animation:gm-labelC 26s linear infinite;}
  @keyframes gm-flashC{0%,78%{opacity:0;transform:translate(-50%,-50%) scale(.5);}78.4%{opacity:1;transform:translate(-50%,-50%) scale(1);}78.9%{opacity:.25;transform:translate(-50%,-50%) scale(2.2);}79.3%{opacity:1;transform:translate(-50%,-50%) scale(1);}79.75%{opacity:.25;transform:translate(-50%,-50%) scale(2.2);}80%,80.6%{opacity:1;transform:translate(-50%,-50%) scale(1);}81.5%,100%{opacity:0;transform:translate(-50%,-50%) scale(.5);}}
  @keyframes gm-dotC{0%,78%{opacity:0;}78.4%,80.6%{opacity:1;}81.5%,100%{opacity:0;}}
  @keyframes gm-labelC{0%,78.4%{opacity:0;}78.9%,81%{opacity:1;}81.5%,100%{opacity:0;}}
`;

// Gradient background used behind the whole page and the sticky nav — same
// radial-glow recipe as the app's login card so scrolling from the site
// into the app doesn't feel like a jump cut.
const PAGE_BG = `
  radial-gradient(ellipse 1100px 600px at 15% 0%, rgba(62,123,250,0.14), transparent 60%),
  radial-gradient(ellipse 900px 600px at 90% 100%, rgba(47,95,224,0.10), transparent 60%),
  ${C.bg}
`;
const CTA_GRADIENT = `linear-gradient(90deg, #4A87FA, ${C.goldDeep})`;

// ── Extra palette + CSS for the redesigned sections below (ticker strip,
// 4-card method grid, platform-contrast panel, CTA band). Scoped to these
// new pieces so the rest of the page's existing styling is untouched.
const RD = {
  blue: '#4f7fff',
  cyan: '#35d0e0',
  green: '#2fbf71',
  red: '#e2554f',
  ink: '#e8edf8',
  inkDim: '#94a3c0',
  inkFaint: '#5a6a8f',
  border: 'rgba(148,170,220,.12)',
  panel: '#0a1020',
};

const RD_PANEL_CSS = `
  .rd-panel { position:relative; }
  .rd-corner { position:absolute; width:10px; height:10px; border-color:rgba(79,127,255,.5); }
  .rd-corner.tl { top:-1px; left:-1px; border-top:2px solid; border-left:2px solid; }
  .rd-corner.tr { top:-1px; right:-1px; border-top:2px solid; border-right:2px solid; }
  .rd-corner.bl { bottom:-1px; left:-1px; border-bottom:2px solid; border-left:2px solid; }
  .rd-corner.br { bottom:-1px; right:-1px; border-bottom:2px solid; border-right:2px solid; }
  .rd-panel:hover .rd-corner { border-color: rgba(79,127,255,1); }
`;

function RdCorners() {
  return (
    <>
      <span className="rd-corner tl"></span>
      <span className="rd-corner tr"></span>
      <span className="rd-corner bl"></span>
      <span className="rd-corner br"></span>
    </>
  );
}

// Brand-styled inline word — Space Grotesk, uppercase, solid blue (matches the
// redesign's treatment of "GEOMETRIYA" / "GEOMETRY" inside copy).
function RdBrand({ children }) {
  return <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: RD.blue, textTransform: 'uppercase', letterSpacing: '.03em' }}>{children}</span>;
}

function RdGlyph({ kind }) {
  const s = { stroke: RD.blue, strokeWidth: 1.8, fill: 'none' };
  const inner = {
    gann: [<line key={1} x1={4} y1={32} x2={32} y2={4} {...s} />, <line key={2} x1={4} y1={32} x2={32} y2={14} {...s} opacity={.6} />, <line key={3} x1={4} y1={32} x2={32} y2={24} {...s} opacity={.35} />],
    squares: [<rect key={1} x={4} y={4} width={28} height={28} {...s} />, <rect key={2} x={4} y={14} width={17} height={18} {...s} opacity={.6} />, <rect key={3} x={4} y={21} width={10} height={11} {...s} opacity={.35} />],
    vortex: [<circle key={1} cx={18} cy={18} r={14} {...s} />, <circle key={2} cx={18} cy={18} r={8.5} {...s} opacity={.6} />, <circle key={3} cx={18} cy={18} r={3.5} {...s} opacity={.35} />],
    mitotic: [<circle key={1} cx={12} cy={18} r={8} {...s} />, <circle key={2} cx={24} cy={18} r={8} {...s} />, <circle key={3} cx={18} cy={18} r={14} {...s} opacity={.3} />],
    scan: [<circle key={1} cx={15} cy={15} r={10} {...s} />, <line key={2} x1={22.5} y1={22.5} x2={32} y2={32} {...s} strokeLinecap="round" />, <line key={3} x1={15} y1={7} x2={15} y2={23} {...s} opacity={.4} />, <line key={4} x1={7} y1={15} x2={23} y2={15} {...s} opacity={.4} />],
  }[kind];
  return <svg width={36} height={36} viewBox="0 0 36 36">{inner}</svg>;
}

const RD_METHODS = [
  { num: '01', kind: 'mitotic', title: 'Mitotic Scaling', body: 'Our proprietary price-per-bar scale. Lock it once and every 45° angle stays a true 45° through any pan, zoom, or timeframe on that stock.' },
  { num: '02', kind: 'gann', title: 'Dream 45° (1×1)', body: 'From confirmed swings, geometry unfolds — Auto Angles make sure to give, pinpointing exact reversals.' },
  { num: '03', kind: 'squares', title: 'Automatic Gann Squares', body: 'Extend seamlessly up to 8×8 and beyond — just click to apply across historical price action.' },
  { num: '04', kind: 'scan', title: 'Scanners', body: 'Auto‑scan of all geometric behaviors — Dream 45°, Equilateral Triangles, Squaring of Range, and more.' },
];

function TickerStrip() {
  const items = ['GANN 1×1 · 45.00°', 'PENTA-VORTEX ARC', 'VORTEX CYCLE T+34', 'MITOTIC SCALE ×2.06', 'SQ9 · 144 · 360'];
  return (
    <div style={{ borderTop: `1px solid ${RD.border}`, borderBottom: `1px solid ${RD.border}`, background: '#070c18' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, letterSpacing: '.14em', color: RD.inkFaint }}>
        {items.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}

function ContrastSection() {
  const rows = [
    { text: 'Indicators computed from past averages — always late' },
    { text: 'Same RSI, MACD, and moving averages as everyone else' },
    { text: <><RdBrand>Geometry</RdBrand> buried as a drawing toolbar afterthought</> },
  ];
  const rowsGood = [
    { text: 'Structure projected forward from price and time itself' },
    { text: 'Auto-constructed Gann fans, Mitotic scales, and vortex arcs' },
    { text: <><RdBrand>Geometry</RdBrand> is the platform — every pixel serves it</> },
  ];
  return (
    <section id="tools" style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 24px' }}>
      <div className="rd-panel geo-hero-grid" style={{ border: `1px solid ${RD.border}`, borderRadius: 6, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <RdCorners />
        <div style={{ padding: '44px 40px', background: '#070c18', borderRight: `1px solid ${RD.border}` }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, letterSpacing: '.22em', color: RD.inkFaint, marginBottom: 20 }}>EVERY OTHER PLATFORM</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 15.5, color: RD.inkDim }}>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}><span style={{ color: RD.red }}>✕</span><span>{r.text}</span></div>
            ))}
          </div>
        </div>
        <div style={{ padding: '44px 40px', background: 'linear-gradient(160deg, rgba(79,127,255,.09), rgba(53,208,224,.05))' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '.22em', color: RD.blue, marginBottom: 20 }}>GEOMETRIYA</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 15.5, color: RD.ink }}>
            {rowsGood.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}><span style={{ color: RD.green }}>✓</span><span>{r.text}</span></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Animated hero mockup: a "browser window" that cross-fades between two real
// product screenshots (a Gann 45° angle setup, then a Mitotic triangle) with
// synced marker call-outs, a scanning highlight line, and a badge glow — pure
// CSS keyframe animation, no JS ticking required.
function HeroMonitor() {
  return (
    <div className="monitor-wrap">
      <div className="monitor">
        <div className="monitor-cam"></div>
        <div className="browser-bar">
          <span className="tl-dot tl-red"></span>
          <span className="tl-dot tl-yellow"></span>
          <span className="tl-dot tl-green"></span>
          <div className="addr-pill">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="4" y="11" width="16" height="10" rx="2" fill="#6b7aa0"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#6b7aa0" strokeWidth="2.4" fill="none"></path></svg>
            app.geometricalanalysis.com
          </div>
        </div>

        <div className="screen-outer">
          <div className="frame">
            <img className="chart-img chart1" src="/hero-chart-gann.jpg" alt="Gann angle chart" />
            <img className="chart-img chart2" src="/hero-chart-mitotic.jpg" alt="Mitotic triangle chart" />

            <div className="mitotic-badge">
              <div className="mitotic-lock">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="11" width="16" height="10" rx="2" fill="#1a1a1a"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#1a1a1a" strokeWidth="2.4" fill="none"></path>
                </svg>
              </div>
              <span className="mitotic-text">Mitotic</span>
            </div>

            <div className="scanline"></div>
            <div className="scanline2"></div>

            {/* phase 1 markers */}
            <div className="marker m-ring m0-ring"></div>
            <div className="marker m-dot m0-dot"></div>
            <div className="marker m-label lbl-below m0-label">LOW</div>

            <div className="marker m-ring m1-ring"></div>
            <div className="marker m-dot m1-dot"></div>
            <div className="marker m-label lbl-above m1-label">HIGH</div>

            <div className="marker m-ring m2-ring"></div>
            <div className="marker m-dot m2-dot"></div>
            <div className="marker m-label lbl-above m2-label">SWING HIGH</div>

            <div className="marker m-ring m3-ring"></div>
            <div className="marker m-dot m3-dot"></div>
            <div className="marker m-label lbl-below m3-label">SQUARE EDGE</div>

            <div className="marker m-ring m4-ring"></div>
            <div className="marker m-dot m4-dot"></div>
            <div className="marker m-label lbl-below-far m4-label">CYCLE COMPLETE</div>

            {/* phase 2 markers: mitotic triangle A / B / C */}
            <div className="edge-glow"></div>
            <div className="level-glow"></div>
            <div className="level-label">∛ ABC</div>
            <div className="level-sublabel">STRONG SUPPORT</div>

            <div className="marker m-ring mA-ring"></div>
            <div className="marker m-dot mA-dot"></div>
            <div className="marker m-label lbl-below-tight mA-label">LOW · A</div>

            <div className="marker m-ring mB-ring"></div>
            <div className="marker m-dot mB-dot"></div>
            <div className="marker m-label lbl-above mB-label">HIGH · B</div>

            <div className="marker m-ring mC-ring"></div>
            <div className="marker m-dot mC-dot"></div>
            <div className="marker m-label lbl-below mC-label">C</div>

            <div className="marker m-echo mA-echo"></div>
            <div className="marker m-echo mB-echo"></div>
            <div className="marker m-echo mC-echo"></div>

            <div className="glare"></div>
            <div className="vignette"></div>
          </div>
        </div>
        <div className="monitor-chin-dot"></div>
      </div>
    </div>
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
// Where the trading app itself lives. Change this if you deploy it to a
// different subdomain or path.
const APP_URL = 'https://app.geometricalanalysis.com';

function SignupForm({ selectedPlan, clearSelectedPlan }) {
  const [step, setStep] = useState('details'); // details | otp | success | already_registered
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState(''); // re-type
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('');
  const [planPrices, setPlanPrices] = useState({ monthlyINR: null, halfyearlyINR: null, yearlyINR: null });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/payment/plan-info`).then(r => r.json()).then(setPlanPrices).catch(() => {});
  }, []);

  const PLAN_LABELS = {
    monthly: () => `Monthly — ₹${planPrices.monthlyINR?.toLocaleString('en-IN') ?? '…'}`,
    halfyearly: () => `6 Months — ₹${planPrices.halfyearlyINR?.toLocaleString('en-IN') ?? '…'}`,
    yearly: () => `Yearly — ₹${planPrices.yearlyINR?.toLocaleString('en-IN') ?? '…'}`,
  };

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const inputStyle = {
    background: '#0c1526',
    border: `1px solid ${C.line}`,
    color: C.ink,
    padding: '13px 16px',
    borderRadius: 8,
    fontSize: 14,
    minWidth: 220,
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
  };

  const buttonStyle = (disabled) => ({
    background: disabled ? '#16233b' : CTA_GRADIENT,
    boxShadow: disabled ? 'none' : '0 6px 18px rgba(47,95,224,0.32)',
    color: disabled ? '#4c5f7d' : '#FFFFFF',
    fontWeight: 600,
    fontSize: 14,
    padding: '13px 22px',
    borderRadius: 8,
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
  });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name || !phone || !email || !password) {
      setErrorMsg('Name, phone, email and password are all required.');
      setStatus('error');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setStatus('error');
      return;
    }
    if (password !== password2) {
      setErrorMsg('Passwords do not match.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password }),
      });
      const data = await res.json();
      if (res.status === 409) {
        if (selectedPlan) {
          // They're buying a plan, not asking for a fresh trial — an existing
          // account is fine here, just send them a login code instead of
          // dead-ending on "already registered".
          const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
          });
          const loginData = await loginRes.json();
          if (!loginRes.ok) throw new Error(loginData.error || 'Could not send OTP.');
          setStep('otp');
          setStatus('idle');
          return;
        }
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

      if (selectedPlan) {
        // Skip-trial path: go straight to Razorpay checkout for the chosen plan.
        const scriptOk = await loadRazorpayScript();
        if (!scriptOk) throw new Error('Could not load payment gateway. Check your connection and try again.');

        const orderRes = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: data.phone, planType: selectedPlan }),
        });
        const order = await orderRes.json();
        if (!orderRes.ok) throw new Error(order.error || 'Could not start payment.');

        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Geometriya',
          description: `${selectedPlan} plan`,
          order_id: order.orderId,
          prefill: { name: order.name, contact: data.phone },
          theme: { color: '#B98A3D' },
          handler: async (response) => {
            try {
              const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phone: data.phone,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed.');
              setStep('success');
              setStatus('idle');
              const dest = `${APP_URL}/?phone=${encodeURIComponent(data.phone)}&token=${encodeURIComponent(data.token)}`;
              setTimeout(() => { window.location.href = dest; }, 1200);
            } catch (err) {
              setErrorMsg(err.message);
              setStatus('error');
            }
          },
          modal: { ondismiss: () => setStatus('idle') },
        });
        rzp.open();
        setStatus('idle');
        return;
      }

      // Plain trial path — hand the verified session off to the trading app.
      // Since it lives on a different subdomain, localStorage can't be shared
      // directly — so the token travels as a URL param, and the app picks it up on load.
      setStep('success');
      setStatus('idle');
      const dest = `${APP_URL}/?phone=${encodeURIComponent(data.phone)}&token=${encodeURIComponent(data.token)}`;
      setTimeout(() => { window.location.href = dest; }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid code — please try again.');
      setStatus('error');
    }
  };

  if (step === 'already_registered') {
    return (
      <div style={{ fontSize: 15, color: C.inkDim, fontFamily: "'Inter', sans-serif", padding: '13px 0' }}>
        This number is already registered.{' '}
        <a href={APP_URL} style={{ color: C.gold, textDecoration: 'underline' }}>
          Go to Geometriya and sign in with your email or phone and password
        </a>
        {' '}instead — no need to sign up again.
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div style={{ fontSize: 15, color: C.green, fontFamily: "'Inter', sans-serif", padding: '13px 0' }}>
        {selectedPlan
          ? `✓ Payment confirmed — your ${selectedPlan === 'yearly' ? 'yearly' : selectedPlan === 'halfyearly' ? '6-month' : 'monthly'} plan is active. Taking you to Geometriya now…`
          : '✓ Verified — your 30-day trial is active. Taking you to Geometriya now…'}
      </div>
    );
  }

  const planBanner = selectedPlan && (
    <div style={{ width: '100%', marginBottom: 4, fontSize: 13, color: C.ink, background: C.bgPanel, border: `1px solid ${C.gold}`, borderRadius: 4, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span>Buying: <strong>{PLAN_LABELS[selectedPlan]()}</strong> — skipping the free trial</span>
      <span onClick={clearSelectedPlan} style={{ color: C.inkFaint, cursor: 'pointer', textDecoration: 'underline', flexShrink: 0, fontSize: 12 }}>Use free trial instead</span>
    </div>
  );

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {planBanner}
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
          Sent to your phone and email. Didn&rsquo;t get it?{' '}
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
      {planBanner}
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
        required
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ ...inputStyle, minWidth: 220 }}
      />
      <input
        type="password"
        required
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ ...inputStyle, minWidth: 220 }}
      />
      <input
        type="password"
        required
        placeholder="Re-type password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        style={{ ...inputStyle, minWidth: 220 }}
      />
      <button
        type="submit"
        disabled={status === 'loading' || phone.length !== 10 || !name || !email || !password || !password2}
        style={buttonStyle(status === 'loading' || phone.length !== 10 || !name || !email || !password || !password2)}
      >
        {status === 'loading' ? 'Sending…' : 'Get Early Access'}
      </button>
      <div style={{ width: '100%', textAlign: 'center', fontSize: 12, color: C.inkFaint, fontFamily: "'Inter', sans-serif" }}>
        We&rsquo;ll send a verification code to your phone and email to confirm your account.
      </div>
      {status === 'error' && (
        <div style={{ width: '100%', color: C.red, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
          {errorMsg}
        </div>
      )}
    </form>
  );
}

function SubscriptionCheckModal({ open, onClose }) {
  const [step, setStep] = useState('phone'); // phone | otp | result
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);
  const [devOtpHint, setDevOtpHint] = useState('');

  if (!open) return null;

  const reset = () => { setStep('phone'); setPhone(''); setOtp(''); setError(''); setStatus(null); setDevOtpHint(''); onClose(); };

  const sendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) { setError('Enter a valid 10-digit mobile number'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/subscription-check/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send code');
      setDevOtpHint(data.devMode ? '(dev mode — check server console for the code)' : '');
      setStep('otp');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) { setError('Enter the code'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/subscription-check/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ''), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setStatus(data);
      setStep('result');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', boxSizing: 'border-box', fontSize: 13, padding: '9px 10px', borderRadius: 6, border: `1px solid ${RD.border}`, background: 'transparent', color: RD.ink, outline: 'none' };
  const btnStyle = { width: '100%', marginTop: 10, fontSize: 13, fontWeight: 600, padding: '9px 0', borderRadius: 6, border: 'none', background: RD.blue, color: '#fff', cursor: loading ? 'default' : 'pointer' };

  return (
    <div onClick={reset} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 340, maxWidth: '90vw', background: RD.panel, border: `1px solid ${RD.border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: RD.blue, marginBottom: 14 }}>Check my subscription</div>

        {step === 'phone' && (
          <>
            <div style={{ fontSize: 12, color: RD.inkDim, marginBottom: 10 }}>Enter your registered mobile number — we'll text/email you a one-time code.</div>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile number" style={inputStyle} />
            <button disabled={loading} onClick={sendOtp} style={btnStyle}>{loading ? 'Sending…' : 'Send code'}</button>
          </>
        )}

        {step === 'otp' && (
          <>
            <div style={{ fontSize: 12, color: RD.inkDim, marginBottom: 10 }}>Enter the code sent to your phone/email. {devOtpHint}</div>
            <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" style={inputStyle} />
            <button disabled={loading} onClick={verifyOtp} style={btnStyle}>{loading ? 'Verifying…' : 'Verify'}</button>
          </>
        )}

        {step === 'result' && status && (
          <div style={{ fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: RD.inkDim }}>Plan</span>
              <b style={{ color: RD.blue, textTransform: 'capitalize' }}>
                {status.hasActiveSub ? (status.plan || 'active') : status.trialExpired ? 'Trial expired' : 'Free trial'}
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: RD.inkDim }}>{status.hasActiveSub ? 'Renews / expires' : 'Trial ends'}</span>
              <b>
                {(() => {
                  const d = status.hasActiveSub ? status.subscription_end_date : status.trial_end_date;
                  return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
                })()}
              </b>
            </div>
          </div>
        )}

        {error && <div style={{ fontSize: 11.5, color: RD.red, marginTop: 10 }}>{error}</div>}
        <button onClick={reset} style={{ width: '100%', marginTop: 12, fontSize: 12, padding: '6px 0', borderRadius: 6, border: `1px solid ${RD.border}`, background: 'transparent', color: RD.inkDim, cursor: 'pointer' }}>Close</button>
      </div>
    </div>
  );
}

function Nav() {
  const [showSubCheck, setShowSubCheck] = useState(false);
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(6,10,20,0.85)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${C.line}` }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.svg" alt="Geometriya" width="26" height="26" style={{ display: 'block' }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: '.14em', color: RD.blue }}>GEOMETRIYA</span>
        </div>
        <div className="geo-nav-links" style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
          {['Method', 'Tools', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: RD.inkDim, textDecoration: 'none', fontSize: 15 }}>{l}</a>
          ))}
          <a href="#" onClick={e => { e.preventDefault(); setShowSubCheck(true); }} style={{ color: RD.inkDim, textDecoration: 'none', fontSize: 15 }}>My Plan</a>
          <a href={APP_URL} style={{ color: RD.ink, textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>Login</a>
          <a href="#access" style={{ background: RD.blue, boxShadow: '0 0 24px rgba(79,127,255,.35)', color: '#FFFFFF', fontWeight: 600, fontSize: 14, padding: '10px 22px', borderRadius: 6, textDecoration: 'none' }}>Start Free Trial</a>
        </div>
      </div>
      <SubscriptionCheckModal open={showSubCheck} onClose={() => setShowSubCheck(false)} />
    </div>
  );
}

function DonateButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [custom, setCustom] = useState('');
  const [error, setError] = useState('');
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const donate = async (amountINR) => {
    if (!amountINR || amountINR < 1) { setError('Enter an amount'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/donate/create-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountINR }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start payment');
      window.open(data.url, '_blank', 'noopener,noreferrer');
      setOpen(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <a href="#" onClick={(e) => { e.preventDefault(); setOpen(v => !v); }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: RD.blue, textDecoration: 'none', fontSize: 13, fontWeight: 600, border: `1px solid rgba(79,127,255,.4)`, borderRadius: 999, padding: '6px 16px' }}>
        Support the Project 🙏
      </a>
      {open && (
        <div style={{ position: 'absolute', bottom: '120%', right: 0, zIndex: 30, width: 250, background: RD.panel, border: `1px solid ${RD.border}`, borderRadius: 8, padding: 14, boxShadow: '0 8px 28px rgba(0,0,0,.5)' }}>
          <div style={{ fontSize: 12, color: RD.inkDim, marginBottom: 10 }}>Choose an amount</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {[1001, 2001, 3001].map(amt => (
              <button key={amt} disabled={loading} onClick={() => donate(amt)}
                style={{ flex: 1, fontSize: 12, fontWeight: 600, padding: '7px 0', borderRadius: 5, border: `1px solid ${RD.border}`, background: 'transparent', color: RD.ink, cursor: loading ? 'default' : 'pointer' }}>
                ₹{amt}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="number" min="1" placeholder="Custom ₹" value={custom} onChange={e => setCustom(e.target.value)}
              style={{ flex: 1, minWidth: 0, fontSize: 12.5, padding: '7px 8px', borderRadius: 5, border: `1px solid ${RD.border}`, background: 'transparent', color: RD.ink, outline: 'none' }} />
            <button disabled={loading} onClick={() => donate(parseInt(custom, 10))}
              style={{ fontSize: 12.5, fontWeight: 600, padding: '7px 12px', borderRadius: 5, border: 'none', background: RD.blue, color: '#fff', cursor: loading ? 'default' : 'pointer' }}>
              {loading ? '…' : 'Go'}
            </button>
          </div>
          {error && <div style={{ fontSize: 11, color: RD.red, marginTop: 8 }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

export default function GeometriyaLanding() {
  const [selectedPlan, setSelectedPlan] = useState(null); // null | 'monthly' | 'halfyearly' | 'yearly' — set when someone clicks "Buy now, skip trial"
  return (
    <div style={{ background: PAGE_BG, color: RD.ink, minHeight: '100vh', fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{FONTS}{HERO_MONITOR_CSS}{RD_PANEL_CSS}{`
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
            <div style={{ display: 'inline-block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, letterSpacing: '.2em', color: '#7ea2ff', border: '1px solid rgba(126,162,255,.35)', borderRadius: 999, padding: '6px 16px' }}>NOT AN INDICATOR PLATFORM</div>
            <h1 style={{ fontSize: 'clamp(34px, 4.4vw, 48px)', fontWeight: 700, lineHeight: 1.08, margin: '18px 0 18px', letterSpacing: '-.02em' }}>
              Markets move in <RdBrand>geometry,</RdBrand><br />we just draw it.
            </h1>
            <p style={{ fontSize: 15.5, lineHeight: 1.55, color: RD.inkDim, maxWidth: 480, marginBottom: 24 }}>
              Triangles, Gann boxes, auto angles, Squaring of Range &mdash; mapped by <RdBrand>Mitotic Scaling</RdBrand>, live on every chart.<br />
              Every chart hides a geometry, <RdBrand>Geometriya</RdBrand> finds it.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
              <a href="#access" style={{ background: RD.blue, boxShadow: '0 6px 20px rgba(79,127,255,.35)', color: '#FFFFFF', fontWeight: 600, fontSize: 15, padding: '12px 26px', borderRadius: 6, textDecoration: 'none' }}>Start Free Trial</a>
              <a href="#tools" style={{ border: '1px solid rgba(148,170,220,.3)', color: RD.ink, fontWeight: 500, fontSize: 15, padding: '12px 26px', borderRadius: 6, textDecoration: 'none' }}>See the tools →</a>
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 14.5, color: RD.inkDim, fontFamily: "'IBM Plex Mono', monospace", flexWrap: 'wrap' }}>
              <span>✓ 30-day free trial</span>
              <span>✓ No credit card required</span>
            </div>
          </div>
          <HeroMonitor />
        </div>
      </section>

      <TickerStrip />

      {/* METHOD */}
      <section id="method" style={{ maxWidth: 1180, margin: '0 auto', padding: '96px 24px 40px' }}>
        <div style={{ maxWidth: 640, marginBottom: 48 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, letterSpacing: '.22em', color: RD.cyan, marginBottom: 16 }}>THE METHOD</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-.015em', lineHeight: 1.1, marginBottom: 18 }}>
            Four disciplines.<br />One <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: RD.blue, textTransform: 'uppercase', letterSpacing: '.03em' }}>geometry</span> engine.
          </h2>
          <p style={{ color: RD.inkDim, fontSize: 17, lineHeight: 1.65 }}>
            Precision without filters. Geometry without compromise.
          </p>
        </div>
        <div className="geo-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {RD_METHODS.map(m => (
            <div key={m.num} className="rd-panel" style={{ border: `1px solid ${RD.border}`, borderRadius: 6, background: RD.panel, padding: '32px 26px 34px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <RdCorners />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <RdGlyph kind={m.kind} />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: RD.inkFaint }}>{m.num}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>{m.title}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.6, color: RD.inkDim }}>{m.body}</div>
            </div>
          ))}
        </div>
      </section>

      <ContrastSection />

      {/* PRICING */}
      <section id="pricing" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px 110px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, letterSpacing: '.22em', color: RD.cyan, marginBottom: 18 }}>PRICING</div>
          <h2 style={{ margin: 0, fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 700, letterSpacing: '-.015em' }}>
            Pay for <RdBrand>geometry</RdBrand>, not bloat.
          </h2>
        </div>

        <div className="geo-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, alignItems: 'stretch' }}>

          {[
            {
              plan: 'monthly', label: 'MONTHLY', labelColor: RD.inkDim, price: '₹1,199', period: '/ month',
              sub: 'Billed monthly, cancel any time', save: null, featured: false,
              features: [
                'Full Geometriya charting workspace',
                'Gann, Fibonacci, Vortex & geometric overlay tools',
                'Mitotic Scaling on every timeframe',
                'Dream 45 scanner across your watchlist',
                { text: 'Research (book + video course)', off: true },
              ],
            },
            {
              plan: 'halfyearly', label: '6 MONTHS', labelColor: RD.blue, price: '₹6,299', period: '/ 6 months',
              sub: '≈₹1,050/month', save: 'Save 12%', featured: true,
              features: [
                'Full Geometriya charting workspace',
                'Gann, Fibonacci, Vortex & geometric overlay tools',
                'Mitotic Scaling on every timeframe',
                'Dream 45 scanner across your watchlist',
                { text: 'Research (book + video course)', off: true },
              ],
            },
            {
              plan: 'yearly', label: 'YEARLY', labelColor: RD.cyan, price: '₹9,999', period: '/ year',
              sub: '≈₹833/month', save: 'Save 30%', featured: false,
              features: [
                'Everything in the other plans',
                'Full Geometriya charting workspace, all year',
                { text: 'Research: the full book', bold: true },
                { text: 'Research: 15-part video course', bold: true },
              ],
            },
          ].map(p => (
            <div key={p.plan} className="rd-panel" style={{
              border: `1px solid ${p.featured ? 'rgba(79,127,255,.6)' : 'rgba(148,170,220,.14)'}`,
              borderRadius: 6,
              background: p.featured ? 'linear-gradient(170deg,#0d1630,#0a1020)' : RD.panel,
              padding: '32px 28px', display: 'flex', flexDirection: 'column', position: 'relative',
            }}>
              <RdCorners />
              {p.featured && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: RD.blue, color: '#fff', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, letterSpacing: '.14em', padding: '5px 14px', borderRadius: 999 }}>MOST POPULAR</div>
              )}
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, letterSpacing: '.18em', color: p.labelColor, marginBottom: 16 }}>{p.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-.02em' }}>{p.price}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: RD.inkFaint }}>{p.period}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, minHeight: 24, marginBottom: 24 }}>
                <span style={{ fontSize: 13.5, color: '#8291ac' }}>{p.sub}</span>
                {p.save && <span style={{ background: 'rgba(47,191,113,.14)', color: '#4fd48a', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, letterSpacing: '.05em', padding: '3px 9px', borderRadius: 999 }}>{p.save}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14.5, marginBottom: 26, flex: 1 }}>
                {p.features.map((f, i) => {
                  const obj = typeof f === 'object';
                  const off = obj && f.off;
                  const bold = obj && f.bold;
                  const text = obj ? f.text : f;
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10 }}>
                      <span style={{ color: off ? RD.inkFaint : RD.green, flexShrink: 0 }}>{off ? '—' : '✓'}</span>
                      <span style={{ color: off ? RD.inkFaint : (p.featured || bold ? RD.ink : '#c6d2ea'), fontWeight: bold ? 600 : 400 }}>{text}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ borderTop: `1px solid ${RD.border}`, marginTop: 'auto', marginBottom: 20 }}></div>
              <a href="#access" onClick={() => setSelectedPlan(p.plan)} style={{
                textAlign: 'center', padding: '13px 0', borderRadius: 6, fontWeight: 600, fontSize: 15.5, textDecoration: 'none',
                background: p.featured ? RD.blue : 'transparent',
                color: p.featured ? '#fff' : RD.blue,
                border: p.featured ? 'none' : `1px solid rgba(79,127,255,.35)`,
              }}>Buy now</a>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 28, textAlign: 'center', fontSize: 12.5, color: RD.inkFaint, fontFamily: "'IBM Plex Mono', monospace" }}>
          Every plan starts with a 30-day free trial — no card required.
        </p>
      </section>

      {/* CTA BAND */}
      <div style={{ borderTop: `1px solid ${RD.border}`, background: 'radial-gradient(700px 320px at 50% 0%, rgba(79,127,255,.14), transparent 70%)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 16px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(28px, 3.6vw, 42px)', fontWeight: 700, letterSpacing: '-.015em', lineHeight: 1.15 }}>
            Stop reading lagging lines.<br />Start drawing the structure.
          </h2>
          <p style={{ margin: '0 auto 30px', maxWidth: 440, fontSize: 16, color: RD.inkDim, lineHeight: 1.6 }}>
            30 days free. Full <RdBrand>geometry</RdBrand> engine. No credit card.
          </p>
          <a href="#access" onClick={() => setSelectedPlan(null)} style={{ display: 'inline-block', background: RD.blue, color: '#fff', fontWeight: 600, fontSize: 16, padding: '15px 36px', borderRadius: 6, boxShadow: '0 10px 32px rgba(79,127,255,.4)', textDecoration: 'none' }}>Start Free Trial</a>
        </div>
      </div>

      {/* ACCESS / CTA */}
      <section id="access" style={{ borderTop: `1px solid ${C.line}`, background: C.bgPanel }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '72px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(24px, 3vw, 30px)', fontWeight: 600, marginBottom: 14 }}>Currently in private testing</h2>
          <p style={{ color: C.inkDim, fontSize: 15, lineHeight: 1.7, marginBottom: 10 }}>
            We&rsquo;re refining the full workspace before opening it up. Sign up with your mobile number and we&rsquo;ll verify you instantly &mdash; your 30-day trial starts as soon as we approve your access.
          </p>
          <p style={{ color: C.gold, fontSize: 13.5, fontWeight: 600, marginBottom: 28 }}>
            30-day free trial &middot; No credit card required
          </p>
          <SignupForm selectedPlan={selectedPlan} clearSelectedPlan={() => setSelectedPlan(null)} />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${RD.border}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.svg" alt="Geometriya" width="20" height="20" style={{ display: 'block' }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '.14em', color: RD.blue }}>GEOMETRIYA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', fontSize: 14 }}>
            <a href="#method" style={{ color: RD.inkFaint, textDecoration: 'none' }}>Method</a>
            <a href="#tools" style={{ color: RD.inkFaint, textDecoration: 'none' }}>Tools</a>
            <a href="#pricing" style={{ color: RD.inkFaint, textDecoration: 'none' }}>Pricing</a>
            <a href="mailto:geometriya.analysis@gmail.com?subject=Geometriya%20Support" style={{ color: RD.inkFaint, textDecoration: 'none' }}>Email</a>
            <a href="https://wa.me/919730224399" target="_blank" rel="noopener noreferrer" style={{ color: RD.inkFaint, textDecoration: 'none' }}>WhatsApp</a>
            <a href="/privacy" style={{ color: RD.inkFaint, textDecoration: 'none' }}>Privacy Policy</a>
            <a href="https://www.geometricalanalysis.com/geo-ctrl-9f21.html" style={{ color: RD.inkFaint, textDecoration: 'none' }}>Admin</a>
            <DonateButton />
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#3d4a68' }}>© 2026 <RdBrand>Geometriya</RdBrand>. Markets are risk.</div>
        </div>
      </footer>
    </div>
  );
}
