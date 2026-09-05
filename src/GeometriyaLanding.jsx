import { useState, useEffect, useRef, useCallback } from "react";
import OnboardingTour from "./OnboardingTour.jsx";

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
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
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
  rowLine: 'rgba(148,170,220,.08)',
  panel: '#0a1020',
  inkGhost: '#3d4a68',
  gold: '#e6a419',          // chart markers (same gold the hero monitor uses)
  masterstroke: '#E8B93C',  // the app's own Masterstroke score colour
};
const MONO = "'IBM Plex Mono', monospace";

// Video Guides on YouTube — the tour's "Watch Detailed Video" buttons open
// these in a new tab here, where the app would open its own Video Guides
// panel.
const youtubeUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

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

const RD_METHODS = [
  { num: '01', kind: 'mitotic', title: 'Mitotic Scaling', body: 'Our proprietary price-per-bar scale. Lock it once and every 45° angle stays a true 45° through any pan, zoom, or timeframe on that stock.' },
  { num: '02', kind: 'gann', title: 'Dream 45° (1×1)', body: 'From confirmed swings, geometry unfolds — Auto Angles make sure to give, pinpointing exact reversals.' },
  { num: '03', kind: 'squares', title: 'Automatic Gann Squares', body: 'Extend seamlessly up to 8×8 and beyond — just click to apply across historical price action.' },
  { num: '04', kind: 'scan', title: 'Scanners', body: 'Two dozen scanners over the whole toolkit — Dream 45°, triangles, Squaring of Range and Gann arcs, plus order blocks, liquidity sweeps and market structure.' },
];

function TickerStrip() {
  const items = ['GANN 1×1 · 45.00°', 'PENTA-VORTEX ARC', 'VORTEX CYCLE T+34', 'MITOTIC SCALE ×2.06', 'SQ9 · 144 · 360'];
  return (
    <div style={{ borderTop: `1px solid ${RD.border}`, borderBottom: `1px solid ${RD.border}`, background: '#070c18' }}>
      <div className="geo-wrap" style={{ paddingTop: 18, paddingBottom: 18, display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', fontFamily: MONO, fontSize: 13, letterSpacing: '.14em', color: RD.inkFaint }}>
        {items.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}

// ── Numbered-section shell (design 3a): the page reads top to bottom as
// 01 Learn → 02 Scan → 03 Practise → 04 Method → 05 Pricing. Every one shares
// this frame — hairline on top, eyebrow + heading in a fixed 260px column on
// the left, the section's own content on the right — so the sections differ
// only in what they show, never in how they are framed. One column <860px.
function NumberedSection({ id, eyebrow, title, body, action, note, noTop, children }) {
  return (
    <section id={id} style={{ borderTop: noTop ? 'none' : `1px solid ${RD.border}` }}>
      <div className="geo-wrap geo-sec geo-sec-grid">
        <div>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '.2em', color: RD.cyan, marginBottom: 18 }}>{eyebrow}</div>
          <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.1, margin: (body || action || note) ? '0 0 16px' : 0 }}>{title}</h2>
          {body && <p style={{ fontSize: 15, lineHeight: 1.6, color: RD.inkDim, margin: (action || note) ? '0 0 16px' : 0 }}>{body}</p>}
          {action && <div style={{ marginBottom: note ? 16 : 0 }}>{action}</div>}
          {note && <p style={{ fontSize: 12.5, lineHeight: 1.5, color: RD.inkFaint, margin: 0 }}>{note}</p>}
        </div>
        <div style={{ minWidth: 0 }}>{children}</div>
      </div>
    </section>
  );
}

// ── Geo Tutor demo (01 — LEARN). A working miniature of the app's Voice
// Assistance: press Play and the tutor SPEAKS each sentence (Web Speech,
// same 0.95 rate, male narrator as in the app), the transcript highlights
// the sentence being spoken, and the chart shows what it names — a ring on
// the price or time level it names, plus a flash on the arc or line, the
// way the app's own refs glow the element on the chart. Nothing starts
// until the visitor presses Play.
//
// The chart is a real capture of the app: CHOLAFIN, daily, with the Gann Up
// box (Gann ▲ — the "ABSS Up" drawing) auto-placed on the 6-Mar-2026 swing
// low at 1,299 (public/tutor-cholafin-gann.jpg, cropped to the chart).
//
// The sentences are the app's own Gann Box narration — voiceGannBox in
// trading-app/src/Geometriya.jsx — in its order and wording: (1) anchor and
// blue arc, (2) where price stands on the arc ladder, (3) the major targets
// still ahead, priced at today's bar, (4) the next important time line.
// The NUMBERS are read off this capture's price axis, so they are within a
// few rupees of what the app speaks; replace them with the app's transcript
// for this box whenever it is to hand. Nothing here is a call — every line
// describes what is drawn.
//
// Geometry, in the crop's own pixels (1388×930): the box runs from the
// anchor at (245, 907) to (1090, 60), so one Gann unit is 3.38px and the
// arcs are the app's GANN_ARC_DEFS radii × 3.38 — checked against the
// capture, they sit exactly on the drawn arcs.
const TUTOR_W = 1388, TUTOR_H = 930;
const TUTOR_BOX = { x1: 245, y1: 60, x2: 1090, y2: 907 };
const TUTOR_K = 3.38;
const TUTOR_ARC = { blue: [50], '1st': [70.711, 75], '2nd': [100, 111.803], '3rd': [150, 158.114], '4th': [200, 206.155], '5th': [250, 254.951] };
const TUTOR_LINES = [
  {
    say: 'Gann up box anchored at the swing low of 1,299 on 6 March 2026, blue arc set to the swing high at 1,605.',
    text: <>Gann up box anchored at the swing low of <b>1,299</b> on 6 March 2026, blue arc set to the swing high at <b>1,605</b>.</>,
    arcs: ['blue'],
    steps: [
      { ring: { x: 17.65, y: 97.53, label: 'LOW · 1,299' } },
      { from: 'blue arc set', ring: { x: 18.8, y: 79.46, label: 'HIGH · 1,605' } },
    ],
  },
  {
    say: 'Price is right at the 2nd arc, a decision level: a close above it opens the 3rd arc, while a bar rejecting here is the counter-trend signal.',
    text: <>Price is right at the <b>2nd arc</b> — a decision level: a close above it opens the 3rd arc, while a bar rejecting here is the counter-trend signal.</>,
    arcs: ['2nd', '3rd'],
    steps: [
      { ring: { x: 34.22, y: 65.81, label: '2ND ARC · 1,839' } },
      { from: 'opens the 3rd arc', ring: { x: 34.22, y: 48.95, label: '3RD ARC' } },
      { from: 'while a bar rejecting', ring: { x: 34.22, y: 65.81, label: '2ND ARC · 1,839' } },
    ],
  },
  {
    say: "Major targets ahead: the 3rd red arc near 2,118, the 5th red arc near 2,772, and the main square's top boundary at 2,830.",
    text: <>Major targets ahead: the <b>3rd red arc</b> near 2,118, the 5th red arc near 2,772, and the main square&rsquo;s top boundary at 2,830.</>,
    arcs: ['3rd', '5th'], hline: TUTOR_BOX.y1,
    // Each level is priced where the arc crosses TODAY's bar (x = 34.22%),
    // exactly as the app prices them, so the rings sit on that vertical.
    steps: [
      { ring: { x: 34.22, y: 48.95, label: '3RD ARC · 2,118' } },
      { from: 'the 5th red arc', ring: { x: 34.22, y: 10.1, label: '5TH ARC · 2,772', below: true } },
      { from: "the main square", ring: { x: 62, y: 6.45, label: 'TOP · 2,830', below: true } },
    ],
  },
  {
    say: 'Next important time line, the 2nd square boundary, is about 59 trading days away, around 27 November 2026; the rules watch these verticals for time-based turns.',
    text: <>Next important time line — the <b>2nd square boundary</b> — is about 59 trading days away, around 27 November 2026; the rules watch these verticals for time-based turns.</>,
    vline: TUTOR_BOX.x1 + 100 * TUTOR_K,
    steps: [
      { ring: { x: 42.0, y: 93.2, label: '2ND BOUNDARY' } },
    ],
  },
].map(l => ({ ...l, steps: l.steps.map(st => ({ ...st, at: st.from ? l.say.indexOf(st.from) : 0 })) }));
// Silent fallback pace, for browsers without speech synthesis — and, when
// the engine gives no word-boundary events, the pace the steps assume.
const TUTOR_STEP_MS = 4500;
const TUTOR_CHARS_PER_SEC = 13;
// Narrator: David (the app's default, Anand's pick) → any English male
// voice → Indian English → any English voice. Voices load asynchronously
// in Chrome, so the first sentence waits for them — speaking before the
// list is ready is what hands the engine its default (female) voice.
// Android's Google TTS names voices "en-in-x-end#male_1-local", so the plain
// male token matches there too; the female guard below is what keeps
// "female_1" from counting as a male match.
const TUTOR_MALE_RE = /(male|ravi|prabhat|madhur|hemant|rishi|david|mark|james|daniel|george|christopher|guy|ryan|arthur|brian|thomas)/i;
const TUTOR_FEMALE_RE = /female/i;
const isEn = v => /^en[-_]/i.test(v.lang);
function pickTutorVoice(voices) {
  const male = v => TUTOR_MALE_RE.test(v.name) && !TUTOR_FEMALE_RE.test(v.name);
  return voices.find(v => /david/i.test(v.name) && isEn(v))
      || voices.find(v => v.lang === 'en-IN' && male(v))
      || voices.find(v => isEn(v) && male(v))
      || voices.find(v => v.lang === 'en-IN')
      || voices.find(isEn)
      || null;
}
// Android populates getVoices() asynchronously and is routinely empty for a
// second or two; resolving early left the utterance with no voice, so the
// engine used its own default — female on most phones (Anand, 5-Sep-2026).
// Event, poll and a ceiling, because some engines never fire voiceschanged.
function tutorVoices(synth) {
  return new Promise(resolve => {
    const now = synth.getVoices();
    if (now.length) { resolve(now); return; }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(poll); clearTimeout(ceiling);
      synth.removeEventListener('voiceschanged', finish);
      resolve(synth.getVoices());
    };
    const poll = setInterval(() => { if (synth.getVoices().length) finish(); }, 200);
    const ceiling = setTimeout(finish, 4000);
    synth.addEventListener('voiceschanged', finish);
  });
}
// The crop's own shape — the marker wrapper must keep it exactly, or the
// percentages above stop landing on the chart features they name.
const TUTOR_CHART_RATIO = TUTOR_H / TUTOR_W;
const TUTOR_CHART_MIN_W = Math.ceil(360 / TUTOR_CHART_RATIO); // fills a 360px-tall box

function GeoTutorDemo({ playing, onToggle, onEnd }) {
  const [pos, setPos] = useState({ i: 0, step: 0 });
  const i = pos.i;
  const goTo = k => setPos({ i: k, step: 0 });
  // One sentence per effect run: speak it (or wait, without speech), then
  // advance; after the last one, stop — the app reads a drawing once, it
  // does not loop. Changing the line mid-speech (a click on the transcript)
  // cancels the current utterance and starts the new one. While a sentence
  // is spoken, the engine's word-boundary events move the ring to the level
  // being named; engines that send none fall back to a timed walk.
  useEffect(() => {
    if (!playing) return;
    let stale = false;
    const line = TUTOR_LINES[i];
    const last = i === TUTOR_LINES.length - 1;
    const advance = () => { if (stale) return; if (last) onEnd(); else goTo(i + 1); };
    const setStep = k => { if (!stale) setPos(p => (p.i === i && p.step !== k ? { i, step: k } : p)); };
    const timers = [];
    const clearTimers = () => { while (timers.length) clearTimeout(timers.pop()); };
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    if (synth && typeof SpeechSynthesisUtterance !== 'undefined') {
      synth.cancel();
      tutorVoices(synth).then(voices => {
        if (stale) return;
        const u = new SpeechSynthesisUtterance(line.say);
        u.lang = 'en-IN';
        u.rate = 0.95;
        u.pitch = 1.0;
        const voice = pickTutorVoice(voices || []);
        if (voice) u.voice = voice;
        let boundaries = false;
        u.onboundary = e => {
          if (stale || (e.name && e.name !== 'word')) return;
          if (!boundaries) { boundaries = true; clearTimers(); }
          let k = 0;
          line.steps.forEach((st, idx) => { if (st.at <= e.charIndex) k = idx; });
          setStep(k);
        };
        line.steps.forEach((st, idx) => {
          if (idx === 0) return;
          timers.push(setTimeout(() => { if (!boundaries) setStep(idx); }, (st.at / TUTOR_CHARS_PER_SEC) * 1000));
        });
        u.onend = advance;
        u.onerror = advance;
        synth.speak(u);
      });
      return () => { stale = true; clearTimers(); synth.cancel(); };
    }
    line.steps.forEach((st, idx) => {
      if (idx > 0) timers.push(setTimeout(() => setStep(idx), (idx / line.steps.length) * TUTOR_STEP_MS));
    });
    timers.push(setTimeout(advance, TUTOR_STEP_MS));
    return () => { stale = true; clearTimers(); };
  }, [playing, i, onEnd]);
  const cur = TUTOR_LINES[i];
  const ring = cur.steps[Math.min(pos.step, cur.steps.length - 1)].ring;
  const markerMove = 'left .6s ease, top .6s ease';
  const flashArcs = (cur.arcs || []).flatMap(b => TUTOR_ARC[b].map(u => u * TUTOR_K));
  return (
    <div className="geo-tutor-demo" style={{ background: '#050505', borderRadius: 8, overflow: 'hidden', border: `1px solid ${RD.border}`, boxShadow: '0 30px 60px rgba(0,0,0,.4)' }}>
      {/* Chart column. The capture keeps its own shape inside a wrapper that
          is centred in the column (so it sits level with the transcript
          beside it); the SVG flash layer, the ring and the label all live in
          that wrapper, in the capture's own coordinates. */}
      <div className="geo-tutor-chart" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="geo-tutor-frame" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: `max(100%, var(--tutor-min-w, ${TUTOR_CHART_MIN_W}px))`, aspectRatio: `${TUTOR_W} / ${TUTOR_H}` }}>
          <img src="/tutor-cholafin-gann.jpg" alt="CHOLAFIN daily chart with a Gann Up box, its fans and arcs, and the Geo Tutor highlighting the element it is describing" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
          {/* Flash layer — the arcs and lines the current sentence names,
              pulsing in the marker gold, clipped to the box like the app's. */}
          <svg viewBox={`0 0 ${TUTOR_W} ${TUTOR_H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} aria-hidden="true">
            <defs>
              <clipPath id="geo-tutor-box"><rect x={TUTOR_BOX.x1} y={TUTOR_BOX.y1} width={TUTOR_BOX.x2 - TUTOR_BOX.x1} height={TUTOR_BOX.y2 - TUTOR_BOX.y1} /></clipPath>
            </defs>
            <g className="geo-tutor-flash" clipPath="url(#geo-tutor-box)" key={i}>
              {flashArcs.map(r => <circle key={r} cx={TUTOR_BOX.x1} cy={TUTOR_BOX.y2} r={r} />)}
              {cur.hline != null && <line x1={TUTOR_BOX.x1} y1={cur.hline} x2={TUTOR_BOX.x2} y2={cur.hline} />}
              {cur.vline != null && <line x1={cur.vline} y1={TUTOR_BOX.y1} x2={cur.vline} y2={TUTOR_BOX.y2} />}
            </g>
          </svg>
          {ring && (
            <>
              <div style={{ position: 'absolute', left: `${ring.x}%`, top: `${ring.y}%`, width: 30, height: 30, border: `2px solid ${RD.gold}`, borderRadius: '50%', transform: 'translate(-50%,-50%)', boxShadow: '0 0 16px 3px rgba(230,164,25,.6)', transition: markerMove }} />
              <div style={{ position: 'absolute', left: `${ring.x}%`, top: `${ring.y}%`, transform: ring.below ? 'translate(-50%,90%)' : 'translate(-50%,-190%)', fontFamily: MONO, fontSize: 11, letterSpacing: 1, color: RD.gold, whiteSpace: 'nowrap', textShadow: '0 0 10px rgba(230,164,25,.5)', transition: markerMove }}>{ring.label}</div>
            </>
          )}
          {/* The app's own scrip label, sitting just above the box's left
              corner (over the chart's top-left corner on a phone, where
              there is no room above). The Mitotic lock badge is the real
              one in the capture. */}
          <div className="geo-tutor-tag" style={{ position: 'absolute', left: `${(TUTOR_BOX.x1 / TUTOR_W) * 100}%`, fontFamily: MONO, fontSize: 11, letterSpacing: '.08em', color: RD.ink, background: 'rgba(6,10,20,.75)', border: `1px solid ${RD.border}`, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
            CHOLAFIN <span style={{ color: RD.inkFaint }}>· D ·</span> Gann <span style={{ color: RD.green }}>▲</span>
          </div>
        </div>
      </div>
      {/* Transcript */}
      <div className="geo-tutor-transcript" style={{ background: RD.panel, borderLeft: `1px solid ${RD.border}`, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, lineHeight: 1.55 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.18em', color: RD.cyan }}>◉ GEO TUTOR</span>
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: RD.inkFaint }}>{i + 1} / {TUTOR_LINES.length}</span>
        </div>
        <div style={{ height: 3, background: RD.border, borderRadius: 2 }}>
          <div style={{ width: `${((i + 1) / TUTOR_LINES.length) * 100}%`, height: '100%', background: RD.cyan, borderRadius: 2, transition: 'width .4s ease' }} />
        </div>
        {TUTOR_LINES.map((l, k) => (
          <div key={k} className={`geo-tutor-line${k === i ? ' active' : ''}`} onClick={() => goTo(k)}>{l.text}</div>
        ))}
        <button type="button" onClick={onToggle} style={{ marginTop: 'auto', textAlign: 'center', padding: 9, borderRadius: 6, border: 'none', background: RD.cyan, color: '#03050b', fontWeight: 600, fontFamily: MONO, fontSize: 11.5, cursor: 'pointer' }}>
          {playing ? '❚❚ Stop narration' : '▶ Play narration'}
        </button>
      </div>
    </div>
  );
}

// ── Masterstroke ranked list (02 — SCAN). Static demo rows: the point is the
// shape of the output — one scrip, the readings that agreed, a bias, a score
// — not today's numbers, and the table says so in its last row.
const MS_DEMO_ROWS = [
  { scrip: 'RELIANCE',  methods: 'Dream 45 · Sq. of Range · Arc · Weekly trend · RS · Structure · Cycle', bull: true,  score: 81 },
  { scrip: 'HDFCBANK',  methods: 'Dream 45 · Triangle · Weekly trend · Structure · Cycle',                bull: true,  score: 64 },
  { scrip: 'TATASTEEL', methods: 'Sq. of Range · Arc · Liquidity sweep · RS',                             bull: false, score: 57 },
  { scrip: 'INFY',      methods: 'Dream 45 · Gann Square · Structure',                                    bull: true,  score: 52 },
];

function MasterstrokeTable() {
  return (
    <div>
      {/* The feature's name, in the app's own Masterstroke gold, sitting on
          the table so the eye lands on it before the rows. */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14, fontFamily: MONO }}>
        <span style={{ fontSize: 13, letterSpacing: '.22em', fontWeight: 700, color: RD.masterstroke, textShadow: '0 0 14px rgba(232,185,60,.35)' }}>✦ MASTERSTROKE</span>
        <span style={{ fontSize: 11.5, letterSpacing: '.08em', color: RD.inkFaint }}>one scan · every method · ranked</span>
      </div>
    <div style={{ background: RD.panel, border: `1px solid ${RD.border}`, borderRadius: 8, fontFamily: MONO, fontSize: 13, overflow: 'hidden' }}>
      <div className="geo-ms-row geo-ms-head" style={{ padding: '14px 26px', color: RD.inkFaint, fontSize: 11, letterSpacing: '.14em', borderBottom: `1px solid ${RD.border}` }}>
        <span>SCRIP</span><span className="geo-ms-methods">METHODS AGREEING</span><span>BIAS</span><span style={{ textAlign: 'right' }}>✦ SCORE</span>
      </div>
      {MS_DEMO_ROWS.map((r) => (
        <div key={r.scrip} className="geo-ms-row" style={{ padding: '16px 26px', borderBottom: `1px solid ${RD.rowLine}`, alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: RD.ink }}>{r.scrip}</span>
          <span className="geo-ms-methods" style={{ color: RD.inkDim, lineHeight: 1.5 }}>{r.methods}</span>
          <span style={{ color: r.bull ? RD.green : RD.red, fontWeight: 600 }}>{r.bull ? '▲ BULL' : '▼ BEAR'}</span>
          <span style={{ textAlign: 'right', color: RD.masterstroke, fontWeight: 700, fontSize: 15 }}>{r.score}</span>
        </div>
      ))}
      <div style={{ padding: '10px 26px', fontSize: 11, letterSpacing: '.06em', color: RD.inkGhost }}>Illustrative rows — not today's scan.</div>
    </div>
    </div>
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

// ── Backend API base URL ──
// From the build environment, falling back to production. Less critical here
// than in the app — a website redeploy re-points this instantly, whereas the
// same value compiled into an APK is stuck for good — but kept in step with
// it so the two never disagree about where the API lives.
// The fallback moves to api.geometricalanalysis.com once that host is serving;
// Render answers on both, so nothing has to change in lockstep.
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://geometriya-backend-render.onrender.com';

// ── Cloudflare Turnstile site key (signup bot gate). SITE keys are public by
//    design — they ship in the page for anyone to read — so hardcoding is
//    fine here; only the SECRET (backend, Render env) is sensitive. The same
//    widget serves the app at app.geometricalanalysis.com; this domain is on
//    its allowlist. Empty string disables the widget AND the token check, so
//    the form keeps working if the widget is ever retired. ──
const TURNSTILE_SITE_KEY = '0x4AAAAAAETkCVKutSSRlTd7';

// Prices are region-dependent (₹ in India, $ elsewhere). The backend decides
// which to SHOW from the browser's IANA timezone; the currency a user is
// actually charged is re-derived server-side from their phone at checkout, so
// nothing here is worth spoofing.
const planInfoUrl = () => {
  let tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { /* older browsers */ }
  return `${API_BASE_URL}/api/payment/plan-info?tz=${encodeURIComponent(tz)}`;
};

const PLAN_DEFAULTS = { currency: 'INR', symbol: '₹', monthly: null, yearly: null };

const fmtPrice = (p, amount) =>
  amount == null ? '…' : `${p.symbol || '₹'}${amount.toLocaleString(p.currency === 'USD' ? 'en-US' : 'en-IN')}`;
// Where the trading app itself lives. Change this if you deploy it to a
// different subdomain or path.
const APP_URL = 'https://app.geometricalanalysis.com';

// ── Refer & Earn: catching the code from a shared link ──
// Referral links now point here rather than straight at the app, because the
// app opens on a login form — a stranger arriving from a friend's WhatsApp
// message saw a password box for a product nobody had described to them.
// The landing page has to do the explaining, so it also has to carry the code.
//
// Stored rather than read from the URL at submit time: the code arrives on
// the first page view, and signing up happens a scroll and a form later, by
// which point the parameter may be gone. This mirrors what the app already
// does with ?ref=, deliberately using the same key name.
//
// Plain strings, not JSON — the app's lsGet/lsSet pair JSON-encodes, but these
// are separate origins (www vs app) with separate storage, so the formats
// never meet.
const REFERRAL_CODE_KEY = 'geo_referral_code';

function captureReferralCode() {
  try {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) localStorage.setItem(REFERRAL_CODE_KEY, ref.trim().toUpperCase());
  } catch { /* private mode — referral credit is not worth failing a page load */ }
}
function readReferralCode() {
  try { return localStorage.getItem(REFERRAL_CODE_KEY) || null; } catch { return null; }
}
function clearReferralCode() {
  try { localStorage.removeItem(REFERRAL_CODE_KEY); } catch { /* nothing to do */ }
}

// ── Country dialling codes — KEEP IN SYNC with DIAL_CODES in the trading
// app's Geometriya.jsx (same list, same lengths). The phone number decides an
// account's billing currency, and until 13-Aug-2026 this form silently
// truncated any input to 10 digits and refused to submit otherwise — so a
// South African typing "+27 833880588" watched the field eat his "+" and cut
// his number short, with the button dead either way (found by exactly that
// client, the same day the app's own form got its selector). `len` is the
// national number's digit count where fixed; null = varies, accept 6–15.
const DIAL_CODES = [
  { code: '91',  len: 10,   label: 'India (+91)' },
  { code: '1',   len: 10,   label: 'United States / Canada (+1)' },
  { code: '44',  len: null, label: 'United Kingdom (+44)' },
  { code: '971', len: null, label: 'United Arab Emirates (+971)' },
  { code: '61',  len: 9,    label: 'Australia (+61)' },
  { code: '973', len: 8,    label: 'Bahrain (+973)' },
  { code: '880', len: null, label: 'Bangladesh (+880)' },
  { code: '32',  len: null, label: 'Belgium (+32)' },
  { code: '55',  len: null, label: 'Brazil (+55)' },
  { code: '45',  len: 8,    label: 'Denmark (+45)' },
  { code: '33',  len: 9,    label: 'France (+33)' },
  { code: '49',  len: null, label: 'Germany (+49)' },
  { code: '852', len: 8,    label: 'Hong Kong (+852)' },
  { code: '62',  len: null, label: 'Indonesia (+62)' },
  { code: '353', len: null, label: 'Ireland (+353)' },
  { code: '39',  len: null, label: 'Italy (+39)' },
  { code: '81',  len: null, label: 'Japan (+81)' },
  { code: '254', len: 9,    label: 'Kenya (+254)' },
  { code: '965', len: 8,    label: 'Kuwait (+965)' },
  { code: '60',  len: null, label: 'Malaysia (+60)' },
  { code: '230', len: 8,    label: 'Mauritius (+230)' },
  { code: '52',  len: 10,   label: 'Mexico (+52)' },
  { code: '977', len: 10,   label: 'Nepal (+977)' },
  { code: '31',  len: 9,    label: 'Netherlands (+31)' },
  { code: '64',  len: null, label: 'New Zealand (+64)' },
  { code: '234', len: 10,   label: 'Nigeria (+234)' },
  { code: '47',  len: 8,    label: 'Norway (+47)' },
  { code: '968', len: 8,    label: 'Oman (+968)' },
  { code: '92',  len: 10,   label: 'Pakistan (+92)' },
  { code: '63',  len: 10,   label: 'Philippines (+63)' },
  { code: '48',  len: 9,    label: 'Poland (+48)' },
  { code: '351', len: 9,    label: 'Portugal (+351)' },
  { code: '974', len: 8,    label: 'Qatar (+974)' },
  { code: '966', len: 9,    label: 'Saudi Arabia (+966)' },
  { code: '65',  len: 8,    label: 'Singapore (+65)' },
  { code: '27',  len: 9,    label: 'South Africa (+27)' },
  { code: '34',  len: 9,    label: 'Spain (+34)' },
  { code: '94',  len: 9,    label: 'Sri Lanka (+94)' },
  { code: '46',  len: null, label: 'Sweden (+46)' },
  { code: '41',  len: 9,    label: 'Switzerland (+41)' },
  { code: '66',  len: null, label: 'Thailand (+66)' },
  { code: '90',  len: 10,   label: 'Turkey (+90)' },
  { code: '84',  len: null, label: 'Vietnam (+84)' },
];
const dialEntryFor = (code) => DIAL_CODES.find(c => c.code === code) || DIAL_CODES[0];
// Is this national number complete for its country? Fixed-length countries
// demand exactly that; the rest get the E.164-ish 6–15 range.
const nationalNumberOk = (code, local) => {
  const len = dialEntryFor(code).len;
  return len ? local.length === len : local.length >= 6 && local.length <= 15;
};

// ── Google sign-in (design 4a, 5-Sep-2026). The same Google Identity
// Services button the app's sign-in screen uses, and the same backend route
// (POST /api/auth/google): Google replaces email + password + OTP, never the
// phone — every session, ledger row and billing decision is keyed on the
// phone, so the number is asked first on both paths. The client ID is public
// by design (it ships in the page); only the secret on Render matters. The
// The app's own "Geometriya web" OAuth client, shared so one Google account
// resolves to one Geometriya account whichever surface signs in. SITE ids are
// public by design (they ship in the page); only the secret, on Render, is
// sensitive — so this is hardcoded rather than left to a Vercel setting a
// redeploy could forget. Its AUTHORISED ORIGINS were extended on 5-Sep-2026
// to www + apex geometricalanalysis.com and http://localhost:5174; Google
// refuses the sign-in popup from any origin not on that list. The env var
// still wins, so the key can be rotated or the button disabled (set it empty)
// without a code change — with no id the card offers email + password only,
// and the steps on the left say so.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  ?? '463903235383-vtidkg2nok29vfnf9mfrhvj0j0cn9llj.apps.googleusercontent.com';

// Signup card tokens (design 4a).
const SU = {
  field: '#0c1526', border: 'rgba(148,170,220,.14)', ink: '#e8edf8', dim: '#94a3c0', faint: '#5a6a8f',
  placeholder: '#5c7699', blue: '#4f7fff', red: '#e2554f', green: '#2fbf71', ghost: '#3d4a68',
};

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.8-.4-4H24v8.1h12.9c-.3 2.2-1.7 5.4-4.9 7.6l7.5 5.8c4.5-4.1 7-10.2 7-17.5z" />
      <path fill="#FBBC05" d="M10.4 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2 1.4-4.8 2.4-8.4 2.4-6.3 0-11.7-4.1-13.6-9.9l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function SignupForm({ selectedPlan, clearSelectedPlan }) {
  const [step, setStep] = useState('details'); // details | otp | success | already_registered
  // ── Turnstile (bot gate, mirrors the app's signup form). Rendered
  //    imperatively into a div because Cloudflare's api.js owns that DOM —
  //    React must not reconcile inside it. Tokens are single-use: a failed
  //    signup resets the widget so the retry carries a fresh one. ──
  const captchaRef = useRef(null);
  const captchaWidgetId = useRef(null);
  const [captchaToken, setCaptchaToken] = useState('');
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || step !== 'details') return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !captchaRef.current || captchaRef.current.childNodes.length) return;
      captchaWidgetId.current = window.turnstile.render(captchaRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => setCaptchaToken(token),
        'expired-callback': () => setCaptchaToken(''),
        'error-callback': () => setCaptchaToken(''),
        theme: 'dark',
        size: 'flexible',
      });
    };
    if (window.turnstile) {
      render();
    } else {
      const already = document.querySelector('script[data-turnstile]');
      if (already) {
        already.addEventListener('load', render, { once: true });
      } else {
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true;
        s.dataset.turnstile = '1';
        s.addEventListener('load', render, { once: true });
        document.head.appendChild(s);
      }
    }
    return () => { cancelled = true; captchaWidgetId.current = null; setCaptchaToken(''); };
  }, [step]);
  const [name, setName] = useState('');
  // `phone` stays the FULL international number — every call below (signup,
  // the 409→login fallback, verify-otp, create-order, google) already sends it.
  // The two controls compose it; India default matches the old behaviour.
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('91');
  const [phoneLocal, setPhoneLocal] = useState('');
  const applyPhoneParts = (dial, local) => {
    const digits = String(local).replace(/\D/g, '').slice(0, 15);
    setDialCode(dial);
    setPhoneLocal(digits);
    setPhone(digits ? dial + digits : '');
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState(''); // re-type
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('');
  const [planPrices, setPlanPrices] = useState(PLAN_DEFAULTS);

  useEffect(() => {
    fetch(planInfoUrl()).then(r => r.json()).then(setPlanPrices).catch(() => {});
  }, []);

  const PLAN_LABELS = {
    monthly: () => `Monthly — ${fmtPrice(planPrices, planPrices.monthly)}`,
    yearly: () => `Yearly — ${fmtPrice(planPrices, planPrices.yearly)}`,
  };

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  // The verified account is handed to the app on its own subdomain —
  // localStorage can't be shared across origins, so the token travels as a
  // URL param and the app picks it up on load. Same hand-off for every path
  // (OTP, Google, and after a paid checkout).
  const handOffToApp = (data) => {
    setStep('success');
    setStatus('idle');
    // Consumed — the account now carries referred_by_code, and leaving it in
    // storage would attach the same referrer to any later signup from this
    // browser (a shared laptop, a family phone).
    clearReferralCode();
    const dest = `${APP_URL}/?phone=${encodeURIComponent(data.phone)}&token=${encodeURIComponent(data.token)}`;
    setTimeout(() => { window.location.href = dest; }, 1200);
  };

  // Skip-trial path: straight to Razorpay checkout for the chosen plan, then
  // into the app. Shared by the OTP and Google paths.
  const startCheckout = async (data) => {
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
          handOffToApp(data);
        } catch (err) {
          setErrorMsg(err.message);
          setStatus('error');
        }
      },
      modal: { ondismiss: () => setStatus('idle') },
    });
    rzp.open();
    setStatus('idle');
  };

  // ── Google. The button is Google's own (its script renders it into
  //    googleBtnRef, like Turnstile), shown only once the mobile number is
  //    complete — the backend needs the phone with the credential. The
  //    callback reads phone / name through refs so it never sees a stale
  //    closure from the render that drew the button. ──
  const googleBtnRef = useRef(null);
  const latest = useRef({ phone: '', name: '' });
  latest.current = { phone, name };
  const phoneOk = nationalNumberOk(dialCode, phoneLocal);
  const submitGoogle = async (credential) => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential,
          phone: latest.current.phone,
          // Google supplies the name; a typed one wins, because people's
          // Google names are not always their names.
          name: latest.current.name.trim() || undefined,
          referralCode: readReferralCode() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        if (selectedPlan) { await startCheckout(data); return; }
        handOffToApp(data);
        return;
      }
      throw new Error(data.error || 'Google sign-in failed — please try again.');
    } catch (err) {
      setErrorMsg(err.message || 'Google sign-in failed — please try again.');
      setStatus('error');
    }
  };
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || step !== 'details' || !phoneOk) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !googleBtnRef.current || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (r) => { if (r?.credential) submitGoogle(r.credential); },
        ux_mode: 'popup',
      });
      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleBtnRef.current,
        { theme: 'outline', size: 'large', width: 400, text: 'continue_with', shape: 'rectangular', logo_alignment: 'center' });
    };
    if (window.google?.accounts?.id) { render(); return () => { cancelled = true; }; }
    let s = document.querySelector('script[data-gsi]');
    if (!s) {
      s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true; s.defer = true; s.dataset.gsi = '1';
      document.head.appendChild(s);
    }
    s.addEventListener('load', render);
    return () => { cancelled = true; s.removeEventListener('load', render); };
    // submitGoogle is a plain const above; the effect only runs after render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, phoneOk]);

  // ── Card styling (design 4a). Fields are flat channels on the card; the
  //    focus ring comes from the .geo-field class in the page stylesheet.
  const inputStyle = {
    background: SU.field,
    border: `1px solid ${SU.border}`,
    color: SU.ink,
    padding: '13px 14px',
    borderRadius: 8,
    fontSize: 14,
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
  };
  const labelStyle = { fontFamily: MONO, fontSize: 11, letterSpacing: '.14em', color: SU.dim, marginBottom: 10 };
  const buttonStyle = (disabled) => ({
    width: '100%',
    background: disabled ? '#16233b' : SU.blue,
    boxShadow: disabled ? 'none' : '0 8px 20px rgba(47,95,224,.34)',
    color: disabled ? '#4c5f7d' : '#FFFFFF',
    fontWeight: 600,
    fontSize: 15,
    padding: 14,
    borderRadius: 8,
    border: 'none',
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    marginTop: 4,
  });
  // Some backend errors end in an instruction — "sign in with that email and
  // your password, or use Forgot password" — for a screen that only exists
  // inside the app. Saying that on a page with no such link is a dead end
  // (Anand hit exactly this signing in with Google on a number already
  // registered under another email), so those errors carry a way through.
  const needsAppSignIn = /already has an account|forgot password|sign in with that email/i.test(errorMsg);
  const errorLine = status === 'error' && errorMsg && (
    <div style={{ textAlign: 'center', color: SU.red, fontSize: 13, lineHeight: 1.55, fontFamily: "'Inter', sans-serif", marginTop: 12 }}>
      {errorMsg}
      {needsAppSignIn && (
        <div style={{ marginTop: 8 }}>
          <a href={APP_URL} style={{ color: SU.blue, textDecoration: 'underline', fontWeight: 600 }}>
            Open Geometriya to sign in
          </a>
          <span style={{ color: SU.faint }}> — &ldquo;Forgot or need to set a password?&rdquo; is on that screen.</span>
        </div>
      )}
    </div>
  );
  const footnote = (text) => (
    <div style={{ textAlign: 'center', fontFamily: "'Inter', sans-serif", fontSize: 12.5, lineHeight: 1.55, color: SU.faint, marginTop: 16 }}>{text}</div>
  );

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
    // Indian mobiles only start 6-9 (TRAI numbering plan) — the backend
    // rejects anything else, but its "Invalid phone number" doesn't say
    // which digit is the problem.
    if (dialCode === '91' && !/^[6-9]/.test(phoneLocal)) {
      setErrorMsg('An Indian mobile number starts with 6, 7, 8 or 9 — please check the first digit.');
      setStatus('error');
      return;
    }
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setErrorMsg('Please wait for the verification box to finish, then try again.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Referral code from a shared link. Read from storage rather than the
        // URL because the code arrives on first landing and signup usually
        // happens several scrolls and one form later — by then the parameter
        // may be long gone. Without this the referrer earned nothing, which
        // is most of why 61 codes had produced no credited signups.
        body: JSON.stringify({ name, phone, email, password, referralCode: readReferralCode() || undefined, captchaToken: captchaToken || undefined }),
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
      // Turnstile tokens are single-use — whatever the server said, this one
      // is spent. Reset so the retry carries a fresh token.
      if (TURNSTILE_SITE_KEY && window.turnstile && captchaWidgetId.current !== null) {
        window.turnstile.reset(captchaWidgetId.current);
        setCaptchaToken('');
      }
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
      if (selectedPlan) { await startCheckout(data); return; }
      handOffToApp(data);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid code — please try again.');
      setStatus('error');
    }
  };

  if (step === 'already_registered') {
    return (
      <div style={{ fontSize: 15, lineHeight: 1.7, color: SU.dim, fontFamily: "'Inter', sans-serif", padding: '13px 0' }}>
        This number is already registered.{' '}
        <a href={APP_URL} style={{ color: SU.blue, textDecoration: 'underline' }}>
          Go to Geometriya and sign in with your email or phone and password
        </a>
        {' '}instead — no need to sign up again.
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div style={{ fontSize: 15, lineHeight: 1.7, color: SU.green, fontFamily: "'Inter', sans-serif", padding: '13px 0' }}>
        {selectedPlan
          ? `✓ Payment confirmed — your ${selectedPlan === 'yearly' ? 'yearly' : 'monthly'} plan is active. Taking you to Geometriya now…`
          : '✓ Verified — your 30-day trial is active. Taking you to Geometriya now…'}
      </div>
    );
  }

  // PLAN_LABELS no longer has a 'halfyearly' entry — guard so a stale link or
  // restored session carrying the retired plan renders nothing rather than
  // throwing on an undefined call.
  const planBanner = selectedPlan && PLAN_LABELS[selectedPlan] && (
    <div style={{ marginBottom: 18, fontSize: 13, color: SU.ink, background: SU.field, border: `1px solid rgba(79,127,255,.5)`, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontFamily: "'Inter', sans-serif" }}>
      <span>Buying: <strong>{PLAN_LABELS[selectedPlan]()}</strong> — skipping the free trial</span>
      <span onClick={clearSelectedPlan} style={{ color: SU.faint, cursor: 'pointer', textDecoration: 'underline', flexShrink: 0, fontSize: 12 }}>Use free trial instead</span>
    </div>
  );

  if (step === 'otp') {
    // Same card shell; the body is just the code field and Verify.
    return (
      <form onSubmit={handleVerifyOtp}>
        {planBanner}
        <div style={labelStyle}>VERIFICATION CODE <span style={{ color: SU.red }}>*</span></div>
        <input
          className="geo-field"
          type="text"
          inputMode="numeric"
          required
          placeholder="Enter the code we sent you"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={{ ...inputStyle, letterSpacing: 2, marginBottom: 12 }}
        />
        <button type="submit" disabled={status === 'loading'} style={buttonStyle(status === 'loading')}>
          {status === 'loading' ? 'Verifying…' : 'Verify'}
        </button>
        {errorLine}
        {footnote(<>
          Sent to your email — check your inbox and spam folder. Didn&rsquo;t get it?{' '}
          <span
            onClick={() => { setStep('details'); setOtp(''); setStatus('idle'); setErrorMsg(''); }}
            style={{ color: SU.blue, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Try again
          </span>
        </>)}
      </form>
    );
  }

  const canSubmit = !(status === 'loading' || !phoneOk || !name || !email || !password || !password2);
  return (
    <form onSubmit={handleSendOtp}>
      {planBanner}

      {/* 1 · Mobile number — required on both paths (see GOOGLE_CLIENT_ID). */}
      <div style={labelStyle}>MOBILE NUMBER <span style={{ color: SU.red }}>*</span></div>
      <div className="geo-su-phone" style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 12, marginBottom: dialCode !== '91' ? 10 : 22 }}>
        {/* The closed control is drawn by hand — dial code first, country
            name trimmed with an ellipsis — because a native <select> shows
            its option text as-is, and "United States / Canada (+1)" in a
            150px box clipped to "United States /" with the +1 lost. The
            real <select> sits on top, invisible, so the dropdown, keyboard
            and screen readers all still get the full list. */}
        <div className="geo-select-wrap" style={{ position: 'relative' }}>
          <div className="geo-field" aria-hidden="true" style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8, paddingRight: 30 }}>
            <span style={{ fontWeight: 600, flexShrink: 0 }}>+{dialCode}</span>
            <span style={{ color: SU.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{dialEntryFor(dialCode).label.replace(/\s*\(\+\d+\)$/, '')}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}><path d="M1 1l4 4 4-4" fill="none" stroke={SU.placeholder} strokeWidth="1.5" /></svg>
          </div>
          <select
            value={dialCode}
            onChange={(e) => applyPhoneParts(e.target.value, phoneLocal)}
            aria-label="Country code"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', fontSize: 14 }}
          >
            {DIAL_CODES.map(c => <option key={c.label} value={c.code}>{c.label}</option>)}
          </select>
        </div>
        <input
          className="geo-field"
          type="tel"
          required
          placeholder={dialEntryFor(dialCode).len ? `${dialEntryFor(dialCode).len}-digit mobile number` : 'Mobile number'}
          value={phoneLocal}
          onChange={(e) => applyPhoneParts(dialCode, e.target.value)}
          style={inputStyle}
        />
      </div>
      {dialCode !== '91' && (
        <div style={{ fontSize: 12, color: SU.faint, fontFamily: "'Inter', sans-serif", marginBottom: 18 }}>
          Enter your number without the +{dialCode}. International accounts are billed in $.
        </div>
      )}

      {/* 2 · Google — live once the number is complete; a quiet stand-in
             until then, so the card keeps its shape. */}
      {GOOGLE_CLIENT_ID && (
        phoneOk
          ? <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }} />
          : (
            <div title="Enter your mobile number first" aria-disabled="true"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#fff', color: '#1f1f1f', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15, padding: '13px 16px', borderRadius: 8, opacity: .45, cursor: 'not-allowed' }}>
              <GoogleLogo /> Continue with Google
            </div>
          )
      )}

      {/* 3 · Or email + password */}
      {GOOGLE_CLIENT_ID && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0 20px', fontFamily: MONO, fontSize: 11, letterSpacing: '.14em', color: SU.faint, whiteSpace: 'nowrap' }}>
          <span style={{ flex: 1, height: 1, background: SU.border }} />OR SET UP WITH EMAIL &amp; PASSWORD<span style={{ flex: 1, height: 1, background: SU.border }} />
        </div>
      )}
      <div style={{ display: 'grid', gap: 12 }}>
        <div className="geo-su-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input className="geo-field" type="text" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          <input className="geo-field" type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </div>
        <div className="geo-su-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <input className="geo-field" type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, paddingRight: 58 }} />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Inter', sans-serif", fontSize: 11, color: SU.ghost, pointerEvents: 'none' }}>min 6</span>
          </div>
          <input className="geo-field" type="password" required placeholder="Re-type password" value={password2} onChange={(e) => setPassword2(e.target.value)} style={inputStyle} />
        </div>
        {/* Turnstile bot gate — Cloudflare renders into this div (see the
            step effect above). Absent entirely while the site key is empty.
            Its widget is Cloudflare's own; this row gives it the field's
            frame and the CLOUDFLARE tag the design shows beside it. */}
        {TURNSTILE_SITE_KEY && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: SU.field, border: `1px solid ${SU.border}`, borderRadius: 8, padding: '6px 10px 6px 6px', minHeight: 44 }}>
            <div ref={captchaRef} style={{ flex: 1, minWidth: 0 }} />
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', color: SU.faint, flexShrink: 0 }}>CLOUDFLARE</span>
          </div>
        )}
        {/* Disabled until the NATIONAL number is complete for the chosen
            country — the old phone.length !== 10 gate is what left a +27
            client with a dead button no matter what he typed. */}
        <button type="submit" disabled={!canSubmit} style={buttonStyle(!canSubmit)}>
          {status === 'loading' ? 'Sending…' : 'Sign Up — start free trial'}
        </button>
      </div>
      {errorLine}
      {footnote(<>
        We&rsquo;ll email you a verification code to confirm your account.<br />
        Already registered? <a href={APP_URL} style={{ color: SU.blue, textDecoration: 'underline' }}>Log in</a>
      </>)}
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
    // 8–15, not "exactly 10": international numbers vary, and the backend
    // resolves national forms (with or without a trunk zero) by unique
    // suffix, same as sign-in. Indian users still just type their 10 digits.
    if (digits.length < 8 || digits.length > 15) { setError('Enter a valid mobile number (add your country code if outside India)'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/subscription-check/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send code');
      // The OTP is stored under the account's CANONICAL phone — verify must
      // echo that back, not whatever form the user happened to type.
      if (data.phone) setPhone(data.phone);
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
            <div style={{ fontSize: 12, color: RD.inkDim, marginBottom: 10 }}>Enter your registered mobile number (with country code if outside India) — we'll email you a one-time code.</div>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Mobile number, e.g. 98765 43210 or +27 83 388 0588" style={inputStyle} />
            <button disabled={loading} onClick={sendOtp} style={btnStyle}>{loading ? 'Sending…' : 'Send code'}</button>
          </>
        )}

        {step === 'otp' && (
          <>
            <div style={{ fontSize: 12, color: RD.inkDim, marginBottom: 10 }}>Enter the code sent to your email (check spam too). {devOtpHint}</div>
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

// ── Mobile-only "get the app" strip. The charts live on their own origin
// (app.geometricalanalysis.com) and that's where the PWA manifest + service
// worker are, so this bar can't trigger an install itself — installing from
// here would only ever put THIS marketing page on someone's home screen.
// It hands off to the app instead, with ?install=1 so the app surfaces its
// install prompt straight away rather than waiting behind the login form.
// Dismissal sticks for a week so it asks once, not on every visit.
const INSTALL_DISMISS_KEY = 'geo_siteInstallDismissedAt';
const INSTALL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

// iPhone and iPad have no App Store listing and Safari never fires
// beforeinstallprompt, so on iOS the only install route is Share → Add to
// Home Screen. Sending an iOS visitor to the app with ?install=1 just moves
// the confusion behind a login form — a South African client spent days
// searching the App Store, found nothing, and concluded his paid account was
// broken. So iOS gets the answer HERE, inline, before anyone taps anything.
// Detects iPad-on-iPadOS too, which reports itself as a Mac and is only
// distinguishable by having a touchscreen.
const isIosDevice = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua)
    || (/Macintosh/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document);
};

function InstallAppStrip() {
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  useEffect(() => {
    // Already opened as an installed app? Then there's nothing to advertise.
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    if (standalone) return;
    setIsIos(isIosDevice());
    let dismissedAt = 0;
    try { dismissedAt = Number(localStorage.getItem(INSTALL_DISMISS_KEY)) || 0; } catch { /* private mode */ }
    if (Date.now() - dismissedAt < INSTALL_COOLDOWN_MS) return;
    setShow(true);
  }, []);
  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now())); } catch { /* private mode */ }
  };
  if (!show) return null;
  return (
    <div style={{ borderBottom: `1px solid ${C.line}` }}>
      <div className="geo-install-strip" style={{ borderBottom: 'none' }}>
        <img src="/logo.svg" alt="" width="30" height="30" style={{ flexShrink: 0, borderRadius: 7 }} />
        {/* Truncates rather than wrapping — on a 320px screen the subtitle would
            otherwise push the strip to three lines and eat the viewport. */}
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: RD.ink, overflow: 'hidden', textOverflow: 'ellipsis' }}>Get the Geometriya app</div>
          <div style={{ fontSize: 11.5, color: RD.inkDim, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isIos ? 'Add it from Safari — not in the App Store' : 'Charts on your home screen — free'}
          </div>
        </div>
        {isIos ? (
          <button onClick={() => setShowIosSteps(v => !v)}
            style={{ flexShrink: 0, background: RD.blue, color: '#fff', fontWeight: 600, fontSize: 13, padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
            {showIosSteps ? 'Hide' : 'How to'}
          </button>
        ) : (
          <a href={`${APP_URL}/?install=1`}
            style={{ flexShrink: 0, background: RD.blue, color: '#fff', fontWeight: 600, fontSize: 13, padding: '8px 16px', borderRadius: 6, textDecoration: 'none' }}>
            Install
          </a>
        )}
        <button onClick={dismiss} aria-label="Dismiss"
          style={{ flexShrink: 0, background: 'transparent', border: 'none', color: RD.inkDim, fontSize: 18, lineHeight: 1, padding: '0 2px', cursor: 'pointer' }}>×</button>
      </div>
      {isIos && showIosSteps && (
        <div style={{ padding: '2px 14px 12px', fontSize: 12.5, lineHeight: 1.75, color: RD.inkDim, background: 'rgba(79,127,255,.09)' }}>
          <div style={{ marginBottom: 4 }}>There&rsquo;s no App Store listing yet — install it straight from Safari:</div>
          <div>1. Make sure you&rsquo;re in <b style={{ color: RD.ink }}>Safari</b> (Chrome on iPhone can&rsquo;t do this)</div>
          <div>2. Tap the <b style={{ color: RD.ink }}>Share</b> button <span style={{ fontFamily: 'monospace' }}>□↑</span></div>
          <div>3. Scroll down and tap <b style={{ color: RD.ink }}>Add to Home Screen</b></div>
          <div style={{ marginTop: 6 }}>It opens full-screen, exactly like an app.</div>
        </div>
      )}
    </div>
  );
}

function Nav() {
  const [showSubCheck, setShowSubCheck] = useState(false);
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(6,10,20,0.85)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${C.line}` }}>
      {/* Inside the sticky wrapper, above the nav row, so the two travel
          together instead of fighting over `top: 0`. */}
      <InstallAppStrip />
      <div className="geo-wrap" style={{ paddingTop: 16, paddingBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <a href="#" aria-label="Geometriya — top of page" style={{ display: 'block', flexShrink: 0 }}>
          <img src="/assets/geometriya-lockup-dark.svg" alt="Geometriya" style={{ height: 26, display: 'block' }} />
        </a>
        <div className="geo-nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {/* Two anchors only (Anand, 5-Sep-2026): Scan / Practise / Method
              are one scroll away and just crowded the bar. Geo Tutor keeps
              the NEW pill because it is the one thing nobody has seen yet. */}
          {[['Geo Tutor', 'learn', true], ['Pricing', 'pricing']].map(([label, id, isNew]) => (
            <a key={id} href={`#${id}`} className="geo-nav-link" style={{ color: RD.inkDim, textDecoration: 'none', fontSize: 15 }}>
              {label}{isNew && <span className="geo-new-pill">NEW</span>}
            </a>
          ))}
          <a href="#" onClick={e => { e.preventDefault(); setShowSubCheck(true); }} style={{ color: RD.inkDim, textDecoration: 'none', fontSize: 15 }}>My Plan</a>
          {/* "Get the app" and "Login" both opened app.geometricalanalysis.com
              (the former with ?install=1), so they are one link now. The
              install prompt is the app's own business once you are in, and
              the mobile strip above still offers it here. Stays visible on
              phones (see the geo-nav-login rule) — an existing client on
              mobile should not have to hunt for the way in. */}
          <a href={APP_URL} className="geo-nav-login" style={{ color: RD.ink, textDecoration: 'none', fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap' }}>Start app</a>
          <a href="#access" style={{ background: RD.blue, boxShadow: '0 0 24px rgba(79,127,255,.35)', color: '#FFFFFF', fontWeight: 600, fontSize: 14, padding: '10px 22px', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap' }}>Try It Free</a>
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
  const [selectedPlan, setSelectedPlan] = useState(null); // null | 'monthly' | 'yearly' — set when someone clicks "Buy now, skip trial"
  const [billingCycle, setBillingCycle] = useState('monthly'); // Full Access price-preview toggle only — doesn't skip the trial
  const [planPrices, setPlanPrices] = useState(PLAN_DEFAULTS);
  useEffect(() => {
    fetch(planInfoUrl()).then(r => r.json()).then(setPlanPrices).catch(() => {});
  }, []);
  // Grab ?ref= on arrival, before any in-page navigation can drop it.
  useEffect(() => { captureReferralCode(); }, []);
  // Geo Tutor demo: stays still until the visitor asks for it (Anand,
  // 5-Sep-2026 — it used to start cycling on load, which reads as the page
  // talking at you). The Play button and the Learn section's walkthrough
  // button are the only two things that start it; the state lives here so
  // both can reach it.
  const [tutorPlaying, setTutorPlaying] = useState(false);
  // Stable identity on purpose: the demo keeps it in an effect dependency
  // list, and a fresh arrow on every render would restart the speech.
  const stopTutor = useCallback(() => setTutorPlaying(false), []);
  // "Take the tour" — the app's own first-login tour (OnboardingTour.jsx),
  // opened right here on the site. Anand, 5-Sep-2026: this replaces the
  // "60-second walkthrough" video the design had pencilled in.
  const [showTour, setShowTour] = useState(false);
  const openTour = useCallback((e) => { e.preventDefault(); setTutorPlaying(false); setShowTour(true); }, []);
  const tourBtn = (style) => <a href="#" onClick={openTour} style={style}>🚀 Take the tour</a>;
  const secondaryBtn = { display: 'inline-block', border: '1px solid rgba(148,170,220,.3)', color: RD.ink, fontWeight: 500, fontSize: 15, padding: '12px 26px', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap' };
  return (
    <div style={{ background: PAGE_BG, color: RD.ink, minHeight: '100vh', fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{FONTS}{HERO_MONITOR_CSS}{RD_PANEL_CSS}{`
        html { scroll-behavior: smooth; }
        /* The nav is sticky (~71px tall on desktop, taller on a phone while
           the install strip shows), so an anchor jump must stop short of it
           or the section's eyebrow and any floating badge land underneath. */
        section[id] { scroll-margin-top: 80px; }
        /* The signup section carries 80px of its own top padding and a card
           taller than most windows, so "Try It Free" should land with the
           CARD just under the nav — not the section's padded edge, which
           left the Sign Up button below the fold (Anand, 5-Sep). */
        section#access { scroll-margin-top: 0; }
        .geo-badge { display:inline-flex; align-items:center; gap:6px; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.5px; text-transform:uppercase; color:${C.inkFaint}; border:1px solid ${C.line}; padding:5px 10px; border-radius:20px; }
        .geo-card { background:${C.bgPanel}; border:1px solid ${C.line}; transition: border-color 0.25s ease, transform 0.25s ease; }
        .geo-card:hover { border-color: var(--hc); transform: translateY(-2px); }
        /* Design 3a layout: one 1280px column with 48px sides on desktop,
           24px on phones. Vertical padding is set per block, never here. */
        .geo-wrap { max-width:1280px; margin:0 auto; padding-left:48px; padding-right:48px; box-sizing:border-box; }
        .geo-sec { padding-top:72px; padding-bottom:72px; }
        .geo-sec-grid { display:grid; grid-template-columns:260px 1fr; gap:64px; }
        /* The hero owns the whole first screen (viewport minus the 72px nav)
           and centres its content in it, so on a tall window it does not
           hang at the top with the ticker strip peeking in underneath. On a
           short window it simply grows to fit, never clips. */
        .geo-hero { min-height: calc(100vh - 72px); display:flex; align-items:center; padding-top:28px; padding-bottom:28px; }
        .geo-hero > .geo-hero-grid { width:100%; }
        /* On a short desktop window (a laptop with the bookmarks bar showing,
           or browser zoom above 100%) the hero would otherwise push its last
           row under the fold. Trim the padding, the headline and the monitor
           until the whole block fits the first screen again. */
        @media (min-width: 861px) and (max-height: 780px) {
          .geo-hero { padding-top:14px; padding-bottom:14px; }
          .geo-hero h1 { font-size: clamp(30px, 3.5vw, 44px) !important; }
          .geo-hero .monitor-wrap { max-width: 420px; }
        }
        .geo-nav-link { display:inline-flex; align-items:center; gap:8px; }
        .geo-new-pill { font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.1em; color:${RD.cyan}; border:1px solid rgba(53,208,224,.4); border-radius:999px; padding:2px 7px; line-height:1.3; }
        .geo-tutor-demo { display:grid; grid-template-columns:1fr 300px; }
        /* The chart column stretches to the transcript's height and centres
           the capture in it, so the chart sits level between the side panels
           rather than pinned to the top with black underneath. */
        .geo-tutor-chart { min-height:360px; }
        .geo-tutor-tag { bottom: calc(100% + 10px); }
        /* The flash: the app's refs pulse the element while the sentence is
           spoken; re-keyed per sentence so each one starts bright. */
        .geo-tutor-flash circle, .geo-tutor-flash line { fill:none; stroke:${RD.gold}; stroke-width:5; stroke-linecap:round; filter:drop-shadow(0 0 6px rgba(230,164,25,.9)); animation: gt-flash .55s ease-in-out infinite alternate; }
        @keyframes gt-flash { from { opacity:.2; } to { opacity:1; } }
        .geo-tutor-line { color:${RD.inkFaint}; cursor:pointer; }
        .geo-tutor-line b { font-weight:inherit; color:inherit; }
        .geo-tutor-line.active { padding:10px; margin:0 -10px; border-radius:6px; background:rgba(53,208,224,.08); border:1px solid rgba(53,208,224,.3); font-weight:500; color:${RD.ink}; }
        .geo-tutor-line.active b { color:${RD.gold}; }
        .geo-ms-row { display:grid; grid-template-columns:130px 1fr 90px 90px; gap:0 14px; }
        .geo-two-col { display:grid; grid-template-columns:1fr 1fr; gap:40px; }
        .geo-method-grid { display:grid; grid-template-columns:1fr 1fr; border-top:1px solid ${RD.border}; }
        .geo-method-cell { padding:26px 28px 26px 0; border-bottom:1px solid ${RD.border}; }
        .geo-method-cell:nth-child(2n) { padding:26px 0 26px 28px; }
        .geo-method-cell:nth-child(2n+1) { border-right:1px solid ${RD.border}; }
        .geo-method-cell:nth-last-child(-n+2) { border-bottom:none; }
        .geo-pricing-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:stretch; }
        /* Signup card (design 4a): flat fields, blue focus ring, own chevron. */
        .geo-field::placeholder { color:#5c7699; }
        .geo-field:focus { border-color: rgba(79,127,255,.5) !important; box-shadow: 0 0 0 3px rgba(79,127,255,.12); }
        .geo-select-wrap:focus-within > .geo-field { border-color: rgba(79,127,255,.5) !important; box-shadow: 0 0 0 3px rgba(79,127,255,.12); }
        .geo-select-wrap option { background:#0c1526; color:#e8edf8; }
        /* Desktop already has the app one click away in the nav — the strip is
           only worth the vertical space on a phone. */
        .geo-install-strip { display: none; }
        @media (max-width: 860px) {
          .geo-wrap { padding-left:24px; padding-right:24px; }
          .geo-sec { padding-top:56px; padding-bottom:56px; }
          section[id] { scroll-margin-top: 128px; }
          .geo-sec-grid { grid-template-columns:1fr; gap:32px; }
          .geo-hero { min-height:0; padding-top:40px; padding-bottom:56px; }
          .geo-nav-links { gap: 16px !important; }
          /* Everything but Login and Try It Free folds away on a phone. */
          .geo-nav-links a:not(:last-child):not(.geo-nav-login) { display:none !important; }
          .geo-hero-grid { grid-template-columns: 1fr !important; }
          .geo-tutor-demo { grid-template-columns:1fr; }
          /* Phones show the whole capture at its own shape — a forced 538px
             minimum width would push the swing-low ring off the left edge. */
          .geo-tutor-chart { --tutor-min-w: 0px; min-height:0; height:auto; aspect-ratio: 1388 / 930; }
          .geo-tutor-tag { bottom:auto; top:8px; left:8px !important; }
          .geo-tutor-transcript { border-left:none !important; border-top:1px solid ${RD.border}; }
          .geo-two-col { grid-template-columns:1fr; gap:24px; }
          .geo-method-grid { grid-template-columns:1fr; }
          .geo-method-cell, .geo-method-cell:nth-child(2n) { padding:22px 0; border-right:none; border-bottom:1px solid ${RD.border}; }
          .geo-method-cell:last-child { border-bottom:none; }
          .geo-pricing-grid { grid-template-columns: 1fr; }
          .geo-access-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .geo-install-strip { display: flex; align-items: center; gap: 10px; padding: 9px 14px; border-bottom: 1px solid ${C.line}; background: rgba(79,127,255,.09); }
        }
        @media (max-width: 520px) {
          .geo-su-two { grid-template-columns: 1fr !important; }
          .geo-su-phone { grid-template-columns: 1fr !important; }
          /* Methods wrap under the scrip; the header simply drops that column. */
          .geo-ms-row { grid-template-columns:1fr auto auto; gap:6px 14px; }
          .geo-ms-row .geo-ms-methods { grid-column:1 / -1; }
          .geo-ms-head .geo-ms-methods { display:none; }
        }
      `}</style>

      <Nav />
      <OnboardingTour isOpen={showTour} onClose={() => setShowTour(false)}
        onWatchVideo={(id) => { setShowTour(false); window.open(youtubeUrl(id), '_blank', 'noopener,noreferrer'); }} />

      {/* HERO */}
      <section className="geo-wrap geo-hero">
        <div className="geo-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', fontFamily: MONO, fontSize: 11.5, letterSpacing: '.2em', color: '#7ea2ff', border: '1px solid rgba(126,162,255,.35)', borderRadius: 999, padding: '6px 16px' }}>POWERED BY MITOTIC SCALING</div>
            <h1 style={{ fontSize: 'clamp(34px, 4.6vw, 52px)', fontWeight: 700, lineHeight: 1.08, margin: '14px 0 14px', letterSpacing: '-.02em' }}>
              Markets move in <RdBrand>geometry,</RdBrand><br />we just draw it.
            </h1>
            {/* Plain English FIRST. The old subhead opened on a feature list
                (triangles, Gann boxes, Squaring of Range) that only means
                something to someone who already knows the method — a new
                visitor couldn't tell what the product actually does. The
                poetic line still closes it; it just no longer has to carry
                the explaining. */}
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: RD.inkDim, maxWidth: 500, marginTop: 0, marginBottom: 18 }}>
              <RdBrand>Geometriya</RdBrand> is a market-analysis platform that reads the relationship
              between <span style={{ color: RD.ink }}>price, time and geometry</span> &mdash; to show you the levels that
              matter, which way a move is pointing, and where it may turn.<br />
              <span style={{ display: 'inline-block', marginTop: 10 }}>
                Every chart hides a geometry. <RdBrand>Geometriya</RdBrand> finds it.
              </span>
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
              <a href="#access" style={{ background: RD.blue, boxShadow: '0 6px 20px rgba(79,127,255,.35)', color: '#FFFFFF', fontWeight: 600, fontSize: 15, padding: '12px 26px', borderRadius: 6, textDecoration: 'none' }}>Try It Free</a>
              {tourBtn(secondaryBtn)}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(47,191,113,.12)', border: '1px solid rgba(47,191,113,.4)', borderRadius: 8, padding: '10px 16px', marginBottom: 12, maxWidth: 480 }}>
              <span style={{ color: RD.green, fontSize: 17, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 13.5, lineHeight: 1.5, color: RD.ink, fontWeight: 600 }}>
                Free forever after your trial — 20 hand-picked stocks + NIFTY&nbsp;50 &amp; BANKNIFTY, no expiry, no catch.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 14.5, color: RD.inkDim, fontFamily: "'IBM Plex Mono', monospace", flexWrap: 'wrap' }}>
              <span>✓ 30-day free trial</span>
              <span>✓ Just your mobile number to start</span>
            </div>
          </div>
          <HeroMonitor />
        </div>
      </section>

      <TickerStrip />

      {/* 01 — LEARN · Geo Tutor. The headline new feature, so it comes first:
          the app's Voice Assistance narrates every study on the user's own
          chart and rings the element each sentence names. The copy says
          what it does — explains what is drawn — and the note says what it
          is not: a buy or sell call. */}
      <NumberedSection
        id="learn"
        noTop
        eyebrow="01 — LEARN · NEW"
        title="Geo Tutor narrates the chart as it's drawn."
        body="Every study in the toolkit, explained live on your own stock. Each sentence rings the exact swing, angle or level it names. Plus a Help Centre with video walkthroughs and 26 tool guides."
        note="Explains what is drawn and why. Not a buy or sell call."
      >
        <GeoTutorDemo playing={tutorPlaying} onToggle={() => setTutorPlaying(v => !v)} onEnd={stopTutor} />
      </NumberedSection>

      {/* 02 — SCAN · Masterstroke. Same caveat the app prints under every
          breakdown, kept word for word: a score is agreement, not a call. */}
      <NumberedSection
        id="scan"
        eyebrow="02 — SCAN"
        title="Two dozen scanners. One ranked list."
        body="Masterstroke runs every reading across your whole list and counts the votes. Readings that agree add points; readings that disagree subtract them."
        note="A high score is not a recommendation — it means several independent readings of the same chart agree today."
      >
        <MasterstrokeTable />
      </NumberedSection>

      {/* 03 — PRACTISE · Paper Trade. Rewritten 3-Sep-2026 when the client
          paper algo was retired: every line here is one the app can be held
          to today — the three fill sources and the recorded source are
          paper-fill.js, the end-of-day mark is paperLastClose, charges are
          paperCharges, reset counting is the attempt counter. Practice money
          only; nothing here places a real order. */}
      <NumberedSection
        id="practise"
        eyebrow="03 — PRACTISE"
        title="Paper trade the method. Before you risk a rupee."
      >
        <div className="geo-two-col" style={{ fontSize: 15, lineHeight: 1.65, color: RD.inkDim }}>
          <div>
            <p style={{ margin: '0 0 16px' }}>
              Start with a <strong style={{ color: RD.ink }}>₹10,00,000 practice book</strong> and place your own trades at real NSE prices.
              No broker. No deposit. Nothing to install. Positions are valued at each day&rsquo;s close, so what you come
              back to is a scorecard you can study &mdash; not a ticker to sit in front of.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(111,160,255,.07)', border: '1px solid rgba(111,160,255,.3)', fontFamily: MONO, fontSize: 13, flexWrap: 'wrap' }}>
              <span style={{ color: RD.green, fontWeight: 700 }}>📓 PRACTICE BOOK</span>
              <span style={{ color: RD.ink, fontWeight: 700 }}>₹10,00,000</span>
              <span style={{ color: RD.inkFaint }}>not real</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14.5 }}>
            {['You name the price: your broker’s live price, a typed price, or the last close — every fill records which.',
              'Realistic charges on both sides.',
              'Start again whenever you like — resets are counted openly, never quietly erased.',
              'Connect Dhan or Angel One for a live chart — free, one tap.'].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: '#6FA0FF', flexShrink: 0 }}>✓</span><span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </NumberedSection>

      {/* 04 — METHOD. The same four disciplines as before, now a hairline
          2×2 instead of four cards. */}
      <NumberedSection
        id="method"
        eyebrow="04 — METHOD"
        title={<>Four disciplines. One <RdBrand>geometry</RdBrand> engine.</>}
        body="Precision without filters. Geometry without compromise."
      >
        <div className="geo-method-grid">
          {RD_METHODS.map(m => (
            <div key={m.num} className="geo-method-cell">
              <div style={{ fontFamily: MONO, fontSize: 11, color: RD.inkFaint, marginBottom: 10 }}>{m.num}</div>
              <div style={{ fontSize: 19, fontWeight: 600, marginBottom: 8 }}>{m.title}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.6, color: RD.inkDim }}>{m.body}</div>
            </div>
          ))}
        </div>
      </NumberedSection>

      {/* 05 — PRICING. Prices come from the backend at runtime (planPrices)
          and are never written into this file. */}
      <NumberedSection
        id="pricing"
        eyebrow="05 — PRICING"
        title="Simple pricing. Start free, forever."
        body="No hidden charges. No surprise renewals. Every plan starts with a 30-day free trial — just your mobile number."
        note="Ready already? Buy directly, or upgrade any time mid-trial from 👤 My Account in the app."
      >
        {(() => {
          const CYCLES = {
            monthly: { short: 'Monthly', period: '/ month', key: 'monthly', months: 1 },
            yearly:  { short: 'Yearly',  period: '/ year',  key: 'yearly',  months: 12 },
          };
          const cyc = CYCLES[billingCycle] || CYCLES.monthly;
          const price = planPrices[cyc.key];
          const perMonth = price ? Math.round(price / cyc.months) : null;
          const save = (billingCycle !== 'monthly' && planPrices.monthly && price)
            ? Math.round((1 - price / (planPrices.monthly * cyc.months)) * 100)
            : null;

          return (
            <div className="geo-pricing-grid">

              {/* STARTER — free forever */}
              <div style={{ position: 'relative', border: '1px solid rgba(47,191,113,.5)', borderRadius: 6, background: RD.panel, padding: '34px 28px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: RD.green, color: '#06170f', fontFamily: MONO, fontSize: 11.5, letterSpacing: '.1em', fontWeight: 700, padding: '5px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}>FREE FOREVER — NO CARD, EVER</div>
                <div style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: '.18em', color: RD.inkDim, marginBottom: 14 }}>STARTER</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 18 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-.02em' }}>Free</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: RD.inkFaint }}>forever</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14.5, color: '#c6d2ea', marginBottom: 26 }}>
                  {['20 hand-picked large-cap stocks + NIFTY 50 & BANKNIFTY',
                    'Full charting workspace, Geo Tutor, Mitotic Scaling'].map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10 }}>
                      <span style={{ color: RD.green, flexShrink: 0 }}>✓</span><span>{t}</span>
                    </div>
                  ))}
                </div>
                <a href="#access" onClick={() => setSelectedPlan(null)} style={{
                  marginTop: 'auto', textAlign: 'center', padding: '13px 0', borderRadius: 6, fontWeight: 600, fontSize: 15.5, textDecoration: 'none',
                  background: 'transparent', color: RD.blue, border: '1px solid rgba(79,127,255,.35)',
                }}>Start Free</a>
              </div>

              {/* FULL ACCESS — unlimited scrips, billing-cycle preview */}
              <div style={{ border: '1px solid rgba(79,127,255,.6)', borderRadius: 6, background: 'linear-gradient(170deg,#0d1630,#0a1020)', padding: '34px 28px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: '.18em', color: RD.blue }}>FULL ACCESS</div>
                  <div style={{ display: 'flex', gap: 3, background: '#0c1526', border: `1px solid ${RD.border}`, borderRadius: 6, padding: 3 }}>
                    {Object.entries(CYCLES).map(([key, c]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setBillingCycle(key)}
                        style={{
                          padding: '5px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                          background: billingCycle === key ? RD.blue : 'transparent',
                          color: billingCycle === key ? '#fff' : RD.inkDim,
                          fontFamily: MONO, fontSize: 11, letterSpacing: '.04em', fontWeight: 600,
                        }}
                      >{c.short}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-.02em' }}>{fmtPrice(planPrices, price)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: RD.inkFaint }}>{cyc.period}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, minHeight: 22, marginBottom: 14 }}>
                  {perMonth != null && billingCycle !== 'monthly' && (
                    <span style={{ fontSize: 13.5, color: '#8291ac' }}>≈{fmtPrice(planPrices, perMonth)}/month</span>
                  )}
                  {save > 0 && (
                    <span style={{ background: 'rgba(47,191,113,.14)', color: '#4fd48a', fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: '.05em', padding: '3px 9px', borderRadius: 999 }}>Save {save}%</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14.5, color: RD.ink, marginBottom: 26 }}>
                  {[
                    planPrices.currency === 'USD'
                      ? 'Unlimited scrips — NSE, US, FX & JSE'
                      : 'Unlimited NSE scrips',
                    'Dream 45 scanner and Masterstroke across your watchlist',
                  ].map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10 }}>
                      <span style={{ color: RD.green, flexShrink: 0 }}>✓</span><span>{t}</span>
                    </div>
                  ))}

                  {/* Say plainly what the data is before anyone pays. Indian
                      users can wire up live intraday through their own broker
                      account; outside India that connection doesn't exist yet,
                      so those charts are end-of-day — which is exactly why the
                      international price sits where it does. */}
                  {planPrices.currency === 'USD' && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                      <span style={{ color: RD.inkFaint, flexShrink: 0 }}>ⓘ</span>
                      <span style={{ color: RD.inkFaint, fontSize: 13 }}>
                        Charts outside India use <b style={{ color: RD.inkDim, fontWeight: 600 }}>end-of-day data</b>. Live intraday through your own broker account is available for NSE today — US, FX and JSE broker connections are on the way.
                      </span>
                    </div>
                  )}
                </div>
                <a href="#access" onClick={() => setSelectedPlan(null)} style={{
                  marginTop: 'auto', textAlign: 'center', padding: '13px 0', borderRadius: 6, fontWeight: 600, fontSize: 15.5, textDecoration: 'none',
                  background: RD.blue, color: '#fff', border: 'none',
                }}>Try It Free</a>
                {/* Direct purchase — no trial required, and equally for someone
                    already mid-trial who's ready to pay. Lands on the app with
                    ?buy=<cycle>: after sign-in (or a fresh mobile-number signup)
                    the checkout opens by itself for the cycle picked above. */}
                <a href={`${APP_URL}/?buy=${cyc.key}`} style={{
                  textAlign: 'center', padding: '11px 0', marginTop: 10, borderRadius: 6, fontWeight: 600, fontSize: 14, textDecoration: 'none',
                  background: 'transparent', color: RD.ink, border: `1px solid ${RD.border}`,
                }}>Buy now — no trial needed</a>
              </div>
            </div>
          );
        })()}
      </NumberedSection>

      {/* FAQ */}
      <section id="faq" style={{ maxWidth: 820, margin: '0 auto', padding: '24px 24px 96px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, letterSpacing: '.22em', color: RD.cyan, marginBottom: 18 }}>FAQ</div>
        </div>
        <div className="rd-panel" style={{ border: `1px solid ${RD.border}`, borderRadius: 6, background: RD.panel, padding: '28px 30px' }}>
          <RdCorners />
          <div style={{ fontSize: 16.5, fontWeight: 600, color: RD.ink, marginBottom: 12 }}>
            What happens when my 30-day free trial ends?
          </div>
          <div style={{ fontSize: 14.5, lineHeight: 1.7, color: RD.inkDim }}>
            You&rsquo;re automatically moved to our Starter plan — no action needed, nothing lost. You keep full access to all geometry tools and Mitotic Scaling on 20 hand-picked large-cap stocks (plus NIFTY&nbsp;50 &amp; BANKNIFTY), for as long as you like. Upgrade to Full Access anytime for unlimited scrips.
          </div>

          {/* Answered here because the alternative is someone searching the App
              Store, finding nothing, and assuming the product is broken —
              which is exactly what happened to a paying client. */}
          <div style={{ borderTop: `1px solid ${RD.border}`, marginTop: 26, paddingTop: 26 }}>
            <div style={{ fontSize: 16.5, fontWeight: 600, color: RD.ink, marginBottom: 12 }}>
              Is there an iPhone or Android app?
            </div>
            <div style={{ fontSize: 14.5, lineHeight: 1.7, color: RD.inkDim }}>
              Yes — Geometriya installs to your home screen and runs full-screen like any other app, on both.
              <div style={{ marginTop: 12 }}>
                <b style={{ color: RD.ink }}>Android:</b> open <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13.5 }}>app.geometricalanalysis.com</span> in Chrome and tap <b style={{ color: RD.ink }}>⋮</b> → <b style={{ color: RD.ink }}>Install app</b>.
              </div>
              <div style={{ marginTop: 8 }}>
                <b style={{ color: RD.ink }}>iPhone / iPad:</b> there&rsquo;s no App&nbsp;Store listing yet, so install it from <b style={{ color: RD.ink }}>Safari</b> instead — tap <b style={{ color: RD.ink }}>Share</b> <span style={{ fontFamily: 'monospace' }}>□↑</span> → <b style={{ color: RD.ink }}>Add to Home Screen</b>. It must be Safari; Chrome on iPhone can&rsquo;t add home-screen apps.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <div style={{ borderTop: `1px solid ${RD.border}`, background: 'radial-gradient(700px 320px at 50% 0%, rgba(79,127,255,.14), transparent 70%)' }}>
        <div className="geo-wrap" style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 16px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(28px, 3.6vw, 42px)', fontWeight: 700, letterSpacing: '-.015em', lineHeight: 1.15 }}>
            Stop reading lagging lines.<br />Start drawing the structure.
          </h2>
          <p style={{ margin: '0 auto 30px', maxWidth: 440, fontSize: 16, color: RD.inkDim, lineHeight: 1.6 }}>
            30 days free, then free forever on 20 stocks. Full <RdBrand>geometry</RdBrand> engine, no card needed.
          </p>
          <a href="#access" onClick={() => setSelectedPlan(null)} style={{ display: 'inline-block', background: RD.blue, color: '#fff', fontWeight: 600, fontSize: 16, padding: '15px 36px', borderRadius: 6, boxShadow: '0 10px 32px rgba(79,127,255,.4)', textDecoration: 'none' }}>Try It Free</a>
        </div>
      </div>

      {/* 06 — START · signup (design 4a). Text on the left, the card on the
          right; the card body is SignupForm, which swaps itself for the OTP
          step, the success line or the already-registered line inside the
          same shell. "Start in under a minute" is literal: verify-otp
          approves and starts the trial in one call — measured across 75
          real accounts the median was 37 seconds. */}
      <section id="access" style={{ background: '#0a1424', borderTop: `1px solid ${RD.border}`, borderBottom: `1px solid ${RD.border}` }}>
        <div className="geo-wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div className="geo-access-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 520px', gap: 72, alignItems: 'center', maxWidth: 1180, margin: '0 auto' }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '.2em', color: RD.cyan, marginBottom: 18 }}>06 — START</div>
              <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.08, margin: '0 0 18px' }}>Start in under a minute.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: RD.inkDim, margin: '0 0 32px', maxWidth: 420 }}>
                Your 30-day trial starts the moment you verify. No approval, no card.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                {[GOOGLE_CLIENT_ID ? 'Mobile number, then Google or a password' : 'Mobile number, name, email and a password', 'Enter the code we email you', 'You\u2019re in the charts'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ flex: 'none', width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(79,127,255,.5)', color: '#7ea2ff', fontFamily: MONO, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                    <div style={{ fontSize: 15.5, fontWeight: 600 }}>{t}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 22, marginTop: 36, fontSize: 13.5, color: RD.inkDim, fontFamily: MONO, flexWrap: 'wrap' }}>
                {['✓ 30-day free trial', '✓ Free forever after', '✓ No card, ever'].map(t => <span key={t} style={{ whiteSpace: 'nowrap' }}>{t}</span>)}
              </div>
            </div>
            <div style={{ background: '#060a14', border: '1px solid rgba(148,170,220,.14)', borderRadius: 12, padding: 32, boxShadow: '0 30px 60px rgba(0,0,0,.45)', minWidth: 0 }}>
              <SignupForm selectedPlan={selectedPlan} clearSelectedPlan={() => setSelectedPlan(null)} />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${RD.border}` }}>
        <div className="geo-wrap" style={{ paddingTop: 32, paddingBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <a href="#" aria-label="Geometriya — top of page" style={{ display: 'block' }}>
            <img src="/assets/geometriya-lockup-dark.svg" alt="Geometriya" style={{ height: 20, display: 'block' }} />
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap', fontSize: 14 }}>
            {[['Geo Tutor', '#learn'], ['Scan', '#scan'], ['Practise', '#practise'], ['Method', '#method'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
              <a key={href} href={href} style={{ color: RD.inkFaint, textDecoration: 'none' }}>{label}</a>
            ))}
            <a href="mailto:geometriya.analysis@gmail.com?subject=Geometriya%20Support" style={{ color: RD.inkFaint, textDecoration: 'none' }}>Email</a>
            <a href="https://wa.me/919730224399" target="_blank" rel="noopener noreferrer" style={{ color: RD.inkFaint, textDecoration: 'none' }}>WhatsApp</a>
            <a href="/privacy" style={{ color: RD.inkFaint, textDecoration: 'none' }}>Privacy Policy</a>
            <a href="https://www.geometricalanalysis.com/geo-ctrl-9f21.html" style={{ color: RD.inkFaint, textDecoration: 'none' }}>Admin</a>
            <DonateButton />
          </div>
          {/* The disclaimer every public surface carries, in the footer where
              it is on every screen size. */}
          <div style={{ fontFamily: MONO, fontSize: 12, color: RD.inkGhost, textAlign: 'right', maxWidth: 340, lineHeight: 1.5, marginLeft: 'auto' }}>
            Analysis and simulation tool, not investment advice — trading involves risk. © 2026 Geometriya.
          </div>
        </div>
      </footer>
    </div>
  );
}
