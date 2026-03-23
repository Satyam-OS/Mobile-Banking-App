#!/usr/bin/env node
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
  console.error('[mobile-frame] index.html not found'); process.exit(0);
}
console.log('[mobile-frame] Found:', distIndexPath);

const INJECTION = `
<style id="nexus-mobile-frame">
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #0a0f1e; }
  #root { width: 100% !important; height: 100% !important; }

  @media (min-width: 481px) {
    html, body {
      background: linear-gradient(145deg,#0a0f1e 0%,#162338 50%,#0a0f1e 100%);
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; min-width: 100vw;
    }
    body::before {
      content: "NEXUSBANK";
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      font-size: clamp(50px,9vw,120px); font-weight: 900;
      letter-spacing: 14px; color: rgba(255,255,255,0.022);
      white-space: nowrap; pointer-events: none; user-select: none;
      font-family: -apple-system, sans-serif; z-index: 0;
    }
    .phone-frame {
      position: relative; flex-shrink: 0; z-index: 1;
      width: 393px; height: 852px;
      max-height: 94vh;
      border-radius: 50px; background: #000; overflow: hidden;
      box-shadow: 0 0 0 1px #111, 0 0 0 3px #1c1c1e, 0 0 0 5px #0a0a0a,
        0 40px 80px rgba(0,0,0,0.85), 0 20px 40px rgba(0,0,0,0.6),
        inset 0 0 0 1px rgba(255,255,255,0.08);
    }
    /* gloss */
    .phone-frame::before {
      content:""; position:absolute; inset:0; border-radius:50px;
      background:linear-gradient(155deg,rgba(255,255,255,0.05) 0%,transparent 40%);
      pointer-events:none; z-index:10001;
    }
    /* dynamic island */
    .phone-frame::after {
      content:""; position:absolute; top:12px; left:50%; transform:translateX(-50%);
      width:120px; height:34px; background:#000; border-radius:20px;
      z-index:10002; pointer-events:none;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.07);
    }
    /* 
      THE REAL FIX:
      React Native Web reads window.innerWidth at startup. On desktop this is ~1500px.
      We can't reliably override that with JS timing tricks.
      Instead: set the scaler to exactly 393px and use CSS zoom to scale 
      the content DOWN to fit. zoom is the only property that doesn't break
      React Native Web's touch/click coordinate system.
    */
    .phone-scaler {
      position: absolute; top: 0; left: 0;
      width: 393px !important;
      height: 852px !important;
      transform-origin: top left;
      overflow: hidden;
    }
    .phone-scaler #root {
      position: absolute !important;
      top: 0 !important; left: 0 !important;
      width: 393px !important;
      height: 852px !important;
      overflow: hidden !important;
    }
  }

  @media (min-width:481px) and (max-height:920px) {
    .phone-frame { height:91vh; width:calc(91vh*(393/852)); border-radius:44px; }
  }
  @media (min-width:481px) and (max-height:720px) {
    .phone-frame { height:87vh; width:calc(87vh*(393/852)); border-radius:38px; }
  }

  @media (max-width:480px) {
    .phone-frame, .phone-scaler { all: unset !important; display: block !important; width: 100% !important; height: 100% !important; }
    .phone-frame::before, .phone-frame::after { display: none !important; }
    body { display: block !important; }
  }
</style>
<script id="nexus-frame-script">
(function() {
  var PHONE_W = 393;
  var PHONE_H = 852;
  var isDesktop = window.innerWidth > 480;

  if (!isDesktop) return; // mobile — do nothing at all

  // ── 1. Override Dimensions before any RNW code runs ──────────────────
  // Multiple override strategies to catch whichever one RNW reads first
  function overrideDimension(obj, prop, val) {
    try {
      Object.defineProperty(obj, prop, { get: function(){ return val; }, configurable: true });
    } catch(e) {}
  }

  overrideDimension(window, 'innerWidth',  PHONE_W);
  overrideDimension(window, 'innerHeight', PHONE_H);
  overrideDimension(window.screen, 'width',  PHONE_W);
  overrideDimension(window.screen, 'height', PHONE_H);
  overrideDimension(window.screen, 'availWidth',  PHONE_W);
  overrideDimension(window.screen, 'availHeight', PHONE_H);

  // Override matchMedia so IS_WIDE checks return false (mobile layout)
  var _origMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = function(query) {
    // Intercept width queries that would trigger wide/desktop layouts
    // Return a fake result saying the screen is narrow
    var result = _origMatchMedia(query);
    // For queries about min-width > phone width, return false
    if (query.indexOf('min-width') !== -1) {
      var match = query.match(/min-width[^0-9]*([0-9]+)/);
      if (match && parseInt(match[1]) > PHONE_W) {
        return { matches: false, media: query,
          addListener: function(){}, removeListener: function(){},
          addEventListener: function(){}, removeEventListener: function(){} };
      }
    }
    return result;
  };

  // ── 2. Wrap #root in phone-frame > phone-scaler ───────────────────────
  function wrapRoot() {
    var root = document.getElementById('root');
    if (!root || root.closest('.phone-frame')) return;

    var scaler = document.createElement('div');
    scaler.className = 'phone-scaler';
    var frame = document.createElement('div');
    frame.className = 'phone-frame';

    root.parentNode.insertBefore(frame, root);
    frame.appendChild(scaler);
    scaler.appendChild(root);

    // ── 3. Apply CSS scale so content fits phone width exactly ──────────
    // React Native Web may still render at actual window width.
    // We scale the scaler down so it fits inside 393px.
    function applyScale() {
      var frameW = frame.offsetWidth;   // actual phone frame pixels
      var frameH = frame.offsetHeight;
      if (!frameW) return;

      // Scale the scaler to fit inside the frame
      var scaleX = frameW / PHONE_W;
      var scaleY = frameH / PHONE_H;
      var scale  = Math.min(scaleX, scaleY);

      scaler.style.transform = 'scale(' + scale + ')';
      scaler.style.transformOrigin = 'top left';

      // Adjust scaler size so it occupies exactly the frame
      scaler.style.width  = PHONE_W + 'px';
      scaler.style.height = PHONE_H + 'px';
    }

    // Run after paint
    requestAnimationFrame(function() {
      requestAnimationFrame(applyScale);
    });

    // Re-apply on resize (window resize changes frame size)
    window.addEventListener('resize', applyScale);
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

// Remove any previous injection
html = html.replace(/<style id="nexus-mobile-frame">[\s\S]*?<\/script>/g, '');

if (html.includes('</head>')) {
  html = html.replace('</head>', INJECTION + '\n</head>');
  fs.writeFileSync(distIndexPath, html, 'utf8');
  console.log('[mobile-frame] ✓ v6 injected into', distIndexPath);
} else {
  console.error('[mobile-frame] No </head> found');
}
