#!/usr/bin/env node
/**
 * inject-mobile-frame.js v4
 *
 * Injects a phone frame into the built Expo web app.
 * Works by wrapping #root in a .phone-frame div BEFORE React mounts,
 * so React Native Web's own styles are contained inside the phone.
 */

const fs   = require('fs');
const path = require('path');

const possiblePaths = [
  path.join(__dirname, '..', 'dist', 'index.html'),
  path.join(__dirname, '..', 'web-build', 'index.html'),
];

let distIndexPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) { distIndexPath = p; break; }
}

if (!distIndexPath) {
  console.error('[mobile-frame] Could not find index.html. Searched:', possiblePaths.join(', '));
  process.exit(0);
}
console.log('[mobile-frame] Found:', distIndexPath);

// ─── CSS lives on .phone-frame wrapper, not on #root ─────────────────────────
// This means React Native Web can do whatever it wants inside #root —
// it's contained inside the fixed-size phone frame.
const CSS_AND_SCRIPT = `
  <style id="nexus-mobile-frame">
    /* Page */
    html { height: 100%; }
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #0a0f1e;
    }

    /* #root stays as React Native Web sets it */
    #root {
      width: 100% !important;
      height: 100% !important;
    }

    /* ── PHONE FRAME — desktop only (min-width 481px) ─────────────────── */
    @media (min-width: 481px) {

      body {
        background: linear-gradient(145deg, #0a0f1e 0%, #162338 50%, #0a0f1e 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        overflow: hidden;
      }

      /* Faint brand text behind phone */
      body::before {
        content: "NEXUSBANK";
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        font-size: clamp(50px, 9vw, 120px);
        font-weight: 900;
        letter-spacing: 14px;
        color: rgba(255,255,255,0.022);
        white-space: nowrap;
        pointer-events: none;
        user-select: none;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }

      /* The phone shell — THIS is what looks like a phone */
      .phone-frame {
        position: relative;
        /* iPhone 15 Pro dimensions */
        width: 393px;
        height: 852px;
        max-height: 94vh;
        /* Keep aspect ratio when height-constrained */
        aspect-ratio: 393 / 852;
        flex-shrink: 0;
        border-radius: 50px;
        background: #000;
        overflow: hidden;
        /* Realistic phone shadow */
        box-shadow:
          0 0 0 1px #111,
          0 0 0 2px #222,
          0 0 0 4px #0a0a0a,
          0 40px 80px rgba(0,0,0,0.85),
          0 20px 40px rgba(0,0,0,0.6),
          inset 0 0 0 1px rgba(255,255,255,0.08);
      }

      /* Screen reflection gloss */
      .phone-frame::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 50px;
        background: linear-gradient(
          155deg,
          rgba(255,255,255,0.05) 0%,
          rgba(255,255,255,0.01) 30%,
          transparent 60%
        );
        pointer-events: none;
        z-index: 10000;
      }

      /* Dynamic Island */
      .phone-frame::after {
        content: "";
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        width: 120px;
        height: 34px;
        background: #000;
        border-radius: 20px;
        z-index: 10001;
        pointer-events: none;
        box-shadow: 0 0 0 1px rgba(255,255,255,0.07);
      }

      /* #root fills the phone frame exactly */
      .phone-frame #root {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden;
      }
    }

    /* Scale for laptop screens */
    @media (min-width: 481px) and (max-height: 920px) {
      .phone-frame {
        height: 91vh;
        width: calc(91vh * (393 / 852));
        border-radius: 44px;
      }
    }
    @media (min-width: 481px) and (max-height: 720px) {
      .phone-frame {
        height: 87vh;
        width: calc(87vh * (393 / 852));
        border-radius: 38px;
      }
    }

    /* ── MOBILE — remove frame completely ───────────────────────────────── */
    @media (max-width: 480px) {
      .phone-frame {
        width: 100% !important;
        height: 100% !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        background: transparent !important;
        overflow: visible !important;
      }
      .phone-frame::before,
      .phone-frame::after { display: none !important; }
      body { display: block !important; background: transparent !important; }
    }
  </style>

  <script>
    /* Wrap #root in .phone-frame BEFORE React mounts.
       Runs synchronously so there's no flash/reflow. */
    (function() {
      function wrapRoot() {
        var root = document.getElementById('root');
        if (!root || root.parentElement.classList.contains('phone-frame')) return;
        var frame = document.createElement('div');
        frame.className = 'phone-frame';
        root.parentNode.insertBefore(frame, root);
        frame.appendChild(root);
      }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wrapRoot);
      } else {
        wrapRoot();
      }
    })();
  </script>
`;

let html = fs.readFileSync(distIndexPath, 'utf8');

if (html.includes('id="nexus-mobile-frame"')) {
  console.log('[mobile-frame] Already injected — skipping.');
  process.exit(0);
}

if (html.includes('</head>')) {
  html = html.replace('</head>', CSS_AND_SCRIPT + '\n</head>');
  fs.writeFileSync(distIndexPath, html, 'utf8');
  console.log('[mobile-frame] ✓ Injected phone frame into', distIndexPath);
} else {
  console.error('[mobile-frame] No </head> found. File preview:');
  console.error(html.slice(0, 300));
}
