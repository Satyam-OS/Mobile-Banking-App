#!/usr/bin/env node
/**
 * inject-mobile-frame.js v5
 *
 * Fixes the content overflow issue by:
 * 1. Wrapping #root in .phone-frame (so CSS controls the container)
 * 2. Setting viewport to 393px width so the app thinks it IS a 393px phone
 * 3. Using transform: scale() approach so nothing breaks
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

const INJECTION = `
  <style id="nexus-mobile-frame">
    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    #root {
      width: 100% !important;
      height: 100% !important;
    }

    /* ── DESKTOP: phone frame ─────────────────────────────────── */
    @media (min-width: 481px) {

      html, body {
        background: linear-gradient(145deg, #0a0f1e 0%, #162338 50%, #0a0f1e 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        min-width: 100vw;
      }

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
        z-index: 0;
      }

      /* Phone shell */
      .phone-frame {
        position: relative;
        width: 393px;
        height: 852px;
        max-height: 94vh;
        aspect-ratio: 393 / 852;
        flex-shrink: 0;
        border-radius: 50px;
        background: #000;
        overflow: hidden;
        z-index: 1;
        box-shadow:
          0 0 0 1px #111,
          0 0 0 3px #1c1c1e,
          0 0 0 5px #0a0a0a,
          0 40px 80px rgba(0,0,0,0.85),
          0 20px 40px rgba(0,0,0,0.6),
          inset 0 0 0 1px rgba(255,255,255,0.08);
      }

      /* Gloss */
      .phone-frame::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 50px;
        background: linear-gradient(155deg, rgba(255,255,255,0.05) 0%, transparent 40%);
        pointer-events: none;
        z-index: 10001;
      }

      /* Dynamic Island */
      .phone-frame::after {
        content: "";
        position: absolute;
        top: 12px; left: 50%;
        transform: translateX(-50%);
        width: 120px; height: 34px;
        background: #000;
        border-radius: 20px;
        z-index: 10002;
        pointer-events: none;
        box-shadow: 0 0 0 1px rgba(255,255,255,0.07);
      }

      /* 
        THE KEY FIX: The inner scaler div.
        React Native Web renders at the browser's actual pixel width.
        We tell the browser the frame is 393px wide, but React Native Web
        uses window.innerWidth to calculate layouts. 
        
        Solution: use a scaler div that is always 393px wide, 
        and clip it inside the phone frame. This forces RNW to 
        measure 393px as the available width.
      */
      .phone-frame .phone-scaler {
        position: absolute;
        inset: 0;
        width: 393px !important;
        height: 100%;
        overflow: hidden;
      }

      .phone-frame #root {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 393px !important;
        height: 100% !important;
        overflow: hidden !important;
      }
    }

    /* Scale for smaller screens */
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

    /* ── MOBILE: no frame ─────────────────────────────────────── */
    @media (max-width: 480px) {
      .phone-frame, .phone-scaler {
        width: 100% !important;
        height: 100% !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        background: transparent !important;
        overflow: visible !important;
        position: static !important;
        display: block !important;
      }
      .phone-frame::before,
      .phone-frame::after { display: none !important; }
      html, body {
        display: block !important;
        background: transparent !important;
        overflow: auto !important;
      }
    }
  </style>

  <script id="nexus-frame-script">
    /**
     * 1. Wraps #root in .phone-frame > .phone-scaler before React mounts
     * 2. Overrides window.innerWidth so React Native Web measures 393px
     *    and renders a proper mobile layout (not a wide desktop layout)
     */
    (function() {
      var PHONE_WIDTH  = 393;
      var IS_DESKTOP   = window.screen.width > 480;

      if (IS_DESKTOP) {
        // ── Override window dimensions so RNW lays out as a phone ──────
        // React Native Web reads window.innerWidth for Dimensions.get('window')
        try {
          Object.defineProperty(window, 'innerWidth', {
            get: function() { return PHONE_WIDTH; },
            configurable: true
          });
          // Also override screen.width for good measure
          Object.defineProperty(window.screen, 'width', {
            get: function() { return PHONE_WIDTH; },
            configurable: true
          });
        } catch(e) {}
      }

      // ── Wrap #root in phone-frame > phone-scaler ────────────────────
      function wrapRoot() {
        var root = document.getElementById('root');
        if (!root) return;
        if (root.closest('.phone-frame')) return; // already wrapped

        var scaler = document.createElement('div');
        scaler.className = 'phone-scaler';

        var frame = document.createElement('div');
        frame.className = 'phone-frame';

        root.parentNode.insertBefore(frame, root);
        frame.appendChild(scaler);
        scaler.appendChild(root);
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
  console.log('[mobile-frame] Already injected — removing old injection first.');
  // Remove old injection between the style tag and the next </head>
  html = html.replace(/<style id="nexus-mobile-frame">[\s\S]*?<\/script>\s*/g, '');
}

// Replace the existing viewport meta to ensure width=393 on desktop won't confuse mobile
// Keep the original viewport (device-width) — we handle width via JS instead
if (html.includes('</head>')) {
  html = html.replace('</head>', INJECTION + '\n</head>');
  fs.writeFileSync(distIndexPath, html, 'utf8');
  console.log('[mobile-frame] ✓ Phone frame v5 injected into', distIndexPath);
} else {
  console.error('[mobile-frame] No </head> found in:', distIndexPath);
}
