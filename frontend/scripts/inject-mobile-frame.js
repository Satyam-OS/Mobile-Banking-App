#!/usr/bin/env node
/**
 * inject-mobile-frame.js
 *
 * Runs after "expo export --platform web" (via the "postbuild" npm hook).
 * Finds the generated dist/index.html and injects a phone frame CSS block
 * so the app looks like a mobile device when viewed on a desktop browser.
 *
 * On real mobile phones (viewport ≤ 480px) the CSS media query means
 * NOTHING changes — the app renders full-screen exactly as before.
 */

const fs   = require('fs');
const path = require('path');

// Expo exports to dist/ by default
const distIndexPath = path.join(__dirname, '..', 'dist', 'index.html');

if (!fs.existsSync(distIndexPath)) {
  console.error('[mobile-frame] dist/index.html not found — skipping injection.');
  console.error('[mobile-frame] Make sure "expo export --platform web" ran first.');
  process.exit(0); // exit 0 so build doesn't fail
}

const phoneFrameCSS = `
  <style id="nexus-mobile-frame">
    /* ── Base reset ────────────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; }

    html, body {
      width: 100%;
      height: 100%;
    }

    #root {
      width: 100%;
      height: 100%;
    }

    /* ══════════════════════════════════════════════════════════════════
       PHONE FRAME — only on screens wider than 480px (desktop/tablet).
       Real phones get 100% normal full-screen experience.
       ══════════════════════════════════════════════════════════════════ */
    @media (min-width: 481px) {

      body {
        background: linear-gradient(145deg, #0a0f1e 0%, #1a2744 40%, #0d1829 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        overflow: hidden;
        margin: 0;
      }

      /* Subtle brand watermark behind the phone */
      body::before {
        content: "NEXUSBANK";
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: clamp(60px, 10vw, 130px);
        font-weight: 900;
        letter-spacing: 16px;
        color: rgba(255, 255, 255, 0.025);
        white-space: nowrap;
        pointer-events: none;
        user-select: none;
        z-index: 0;
      }

      /* ── Phone outer shell ─────────────────────────────────────────── */
      #root {
        position: relative;
        /* iPhone 14 Pro dimensions */
        width: 393px;
        height: 852px;
        max-height: 92vh;
        /* Maintain aspect ratio when height is constrained */
        aspect-ratio: 393 / 852;
        border-radius: 52px;
        background: #000;
        flex-shrink: 0;
        z-index: 1;
        overflow: hidden;
        /* Multi-layer shadow for depth */
        box-shadow:
          0 0 0 1px #0d0d0d,
          0 0 0 3px #1c1c1e,
          0 0 0 5px #0a0a0a,
          0 30px 60px rgba(0, 0, 0, 0.9),
          0 15px 30px rgba(0, 0, 0, 0.7),
          0  5px 10px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(255, 255, 255, 0.05);
      }

      /* Glass gloss overlay on screen */
      #root::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 52px;
        background: linear-gradient(
          160deg,
          rgba(255,255,255,0.04) 0%,
          transparent 40%
        );
        pointer-events: none;
        z-index: 9997;
      }

      /* Dynamic Island (pill-shaped notch at top) */
      #root::after {
        content: "";
        position: absolute;
        top: 13px;
        left: 50%;
        transform: translateX(-50%);
        width: 126px;
        height: 37px;
        background: #000;
        border-radius: 20px;
        z-index: 9999;
        pointer-events: none;
        box-shadow:
          0 0 0 1px rgba(255,255,255,0.06),
          inset 0 1px 2px rgba(0,0,0,0.8);
      }
    }

    /* ── Scale down on laptop screens (height < 920px) ──────────────── */
    @media (min-width: 481px) and (max-height: 920px) {
      #root {
        height: 90vh;
        width: calc(90vh * (393 / 852));
        border-radius: 46px;
      }
      #root::after {
        width: 110px;
        height: 32px;
        top: 11px;
      }
    }

    /* ── Very small laptop (height < 700px) ─────────────────────────── */
    @media (min-width: 481px) and (max-height: 700px) {
      #root {
        height: 86vh;
        width: calc(86vh * (393 / 852));
        border-radius: 38px;
      }
    }
  </style>
`;

let html = fs.readFileSync(distIndexPath, 'utf8');

// Inject our CSS just before </head>
// This ensures it loads before React hydrates, preventing any flash
if (html.includes('id="nexus-mobile-frame"')) {
  console.log('[mobile-frame] Already injected — skipping.');
} else if (html.includes('</head>')) {
  html = html.replace('</head>', phoneFrameCSS + '\n  </head>');
  fs.writeFileSync(distIndexPath, html, 'utf8');
  console.log('[mobile-frame] ✓ Phone frame CSS injected into dist/index.html');
} else {
  // Fallback: append before </body>
  html = html.replace('</body>', phoneFrameCSS + '\n  </body>');
  fs.writeFileSync(distIndexPath, html, 'utf8');
  console.log('[mobile-frame] ✓ Phone frame CSS injected (fallback) into dist/index.html');
}
