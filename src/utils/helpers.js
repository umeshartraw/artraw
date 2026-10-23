export function prefersReducedMotion() {
  // User override takes precedence: 'off' = always static, 'full' = always animate
  // (set from the footer Motion FX toggle). Otherwise honour the OS setting.
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem('artraw-motion');
      if (stored === 'off') return true;
      if (stored === 'full') return false;
    } catch { /* storage blocked — fall through to media query */ }
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Current effective motion preference: 'auto' (OS decides), 'full' (forced on),
 * or 'off' (forced off). Used by the footer Motion FX toggle UI.
 */
export function getMotionPreference() {
  if (typeof window === 'undefined') return 'auto';
  try {
    const stored = window.localStorage.getItem('artraw-motion');
    if (stored === 'full' || stored === 'off') return stored;
  } catch { /* blocked */ }
  return 'auto';
}

/** Persist a motion preference ('auto' clears the override). */
export function setMotionPreference(pref) {
  if (typeof window === 'undefined') return;
  try {
    if (pref === 'full' || pref === 'off') window.localStorage.setItem('artraw-motion', pref);
    else window.localStorage.removeItem('artraw-motion');
  } catch { /* blocked */ }
}

/**
 * Detect test/headless environments (JSDOM & friends) where cinematic
 * animations should be skipped so DOM state applies synchronously.
 * Mirrors the detection used in utils/scroll.js.
 */
export function isHeadlessEnv() {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  const ua = window.navigator?.userAgent || '';
  return ua.includes('jsdom') || ua.includes('Node');
}

function observeElements(selector, callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { ...defaultOptions, ...options });

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
  return observer;
}

export function observeElementsOnce(selector, callback, options = {}) {
  return observeElements(selector, callback, options);
}

/**
 * Resolve a root-relative asset path against the build base URL, so the site
 * works identically when served from GitHub Pages (/artraw/) or a root
 * domain or the GitHub Pages root (umeshartraw.github.io/artraw/). Usage: `asset('/assets/images/foo.png')`.
 */
export function asset(path) {
  if (!path) return path;
  if (!path.startsWith('/')) return path;
  const base = import.meta.env?.BASE_URL ?? '/';
  return base.replace(/\/$/, '') + path;
}
