import './styles/components.css';
import './styles/main.css';

import { createNavigation, initNavigation } from './components/Navigation.js';
import { createHero, initHero } from './components/Hero.js';
import { createFlagshipScene, initFlagshipScene } from './components/FlagshipScene.js';
import { createEditorialSpec, initEditorialSpec } from './components/EditorialSpec.js';
import { createTicker, initTicker } from './components/Ticker.js';
import { createServicesPreview, initServicesPreview } from './components/ServicesPreview.js';
import { createSkills, initSkillsIndex } from './components/Skills.js';
import { createWorkPreview, initPortfolioGallery } from './components/WorkPreview.js';
import { createShowcase, initShowcase } from './components/Showcase.js';
import { createCreativePreview, initCreativePreview } from './components/CreativePreview.js';
import { createProcess, initProcessLine } from './components/Process.js';
import { createContactCTA, initContactCTA } from './components/ContactCTA.js';
import { createFooter, initFooter } from './components/Footer.js';
import { createServicesPage, initServicesPage } from './pages/ServicesPage.js';
import { createWorkPage, initWorkPage } from './pages/WorkPage.js';
import { createContactPage, initContactPage } from './pages/ContactPage.js';
import { createLegalPage } from './pages/LegalPage.js';
import { observeElementsOnce, prefersReducedMotion, getMotionPreference } from './utils/helpers.js';
import { initScroll, scrollTo } from './utils/scroll.js';
import { initMagnetic } from './utils/magnetic.js';
import { initLabelScrambles } from './utils/kinetic-text.js';
import { createRouteTransition, runRouteTransition, canAnimateRoutes } from './utils/transition.js';
import { initScrollFX } from './utils/scrollfx.js';
import {
  createPreloader,
  initPreloader,
  preloaderEligible,
  markSessionBoot,
} from './components/Preloader.js';
import { createAtmosphere, initAtmosphere } from './components/Atmosphere.js';
import { createScrollProgress, initScrollProgress } from './components/ScrollProgress.js';
import { initCursor } from './utils/cursor.js';

const routes = {
  home: () => createHomePage(),
  services: () => createServicesPage(),
  work: () => createWorkPage(),
  contact: () => createContactPage(),
  privacy: () => createLegalPage('privacy'),
  terms: () => createLegalPage('terms')
};

let currentRoute = 'home';
let pageController = null;
let specCtrl = null;
let tickerCtrl = null;
let flagshipCtrl = null;
let servicesCtrl = null;
let skillsCtrl = null;
let portfolioCtrl = null;
let showcaseCtrl = null;
let creativeCtrl = null;
let processCtrl = null;
let contactCtrl = null;
let scrambleKill = null;
let routeFXEl = null;
let navInFlight = null;
let scrollfxCtrl = null;
let atmosphereEl = null;
let atmosphereCtrl = null;

const PRELOADER_DONE_EVENT = 'artraw:preloader:done';

function createHomePage() {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(createHero());
  fragment.appendChild(createEditorialSpec());
  fragment.appendChild(createTicker());
  fragment.appendChild(createFlagshipScene());
  fragment.appendChild(createServicesPreview());
  fragment.appendChild(createSkills());
  fragment.appendChild(createWorkPreview());
  fragment.appendChild(createShowcase());
  fragment.appendChild(createCreativePreview());
  fragment.appendChild(createProcess());
  fragment.appendChild(createContactCTA());
  return fragment;
}

function createApp() {
  const app = document.getElementById('app');
  // Reflect the stored motion choice onto <html> before paint (CSS hooks).
  try {
    const motionPref = getMotionPreference();
    if (motionPref !== 'auto') document.documentElement.dataset.motion = motionPref;
  } catch { /* jsdom / blocked storage */ }
  const atmosphere = createAtmosphere();
  atmosphereEl = atmosphere;
  app.appendChild(atmosphere);
  const scrollProg = createScrollProgress();
  app.appendChild(scrollProg);
  const skip = document.createElement('a');
  skip.href = '#main-content';
  skip.className = 'skip-link';
  skip.textContent = 'Skip to main content';
  app.appendChild(skip);
  const nav = createNavigation();
  app.appendChild(nav);
  const main = document.createElement('main');
  main.id = 'main-content';
  // makes the skip link actually land somewhere focusable
  main.setAttribute('tabindex', '-1');
  app.appendChild(main);
  app.appendChild(createFooter());
  routeFXEl = createRouteTransition();
  app.appendChild(routeFXEl);
  return { nav, main, scrollProg, atmosphere };
}

function destroyRouteControllers() {
  scrollfxCtrl?.destroy?.();
  scrollfxCtrl = null;
  pageController?.destroy?.();
  specCtrl?.destroy?.();
  tickerCtrl?.destroy?.();
  flagshipCtrl?.destroy?.();
  servicesCtrl?.destroy?.();
  skillsCtrl?.destroy?.();
  portfolioCtrl?.destroy?.();
  showcaseCtrl?.destroy?.();
  creativeCtrl?.destroy?.();
  processCtrl?.destroy?.();
  contactCtrl?.destroy?.();
  scrambleKill?.();
  scrambleKill = null;
  pageController = specCtrl = tickerCtrl = flagshipCtrl = null;
  servicesCtrl = skillsCtrl = portfolioCtrl = null;
  showcaseCtrl = creativeCtrl = processCtrl = contactCtrl = null;
}

function pathToRoute(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return 'home';
  const name = clean.slice(1);
  return routes[name] ? name : 'home';
}

function routeToPath(route) {
  return route === 'home' ? '/' : `/${route}`;
}

function navigate(route, replace = false, searchOverride = null) {
  if (!routes[route]) route = 'home';

  // While a route transition is in flight, queue the latest request and
  // replay it once the current sweep settles.
  if (navInFlight) {
    navInFlight.pending = route;
    navInFlight.pendingReplace = replace;
    return;
  }

  const swap = () => {
    const main = document.getElementById('main-content');
    if (!main) return;

    destroyRouteControllers();
    scrollTo(0, { duration: 0, offset: 0 });

    // Push the target URL BEFORE page init so query-driven features
    // (e.g. /contact?service=… prefill) read the right location.
    const targetUrl = routeToPath(route) + (searchOverride ?? window.location.search);
    if (!replace) history.pushState({ route }, '', targetUrl);

    main.innerHTML = '';
    main.removeAttribute('tabindex');
    main.dataset.route = route;
    main.appendChild(routes[route]());
    currentRoute = route;

    if (route === 'home') {
      pageController = initHero(main.querySelector('.hero'));
      specCtrl = initEditorialSpec(main.querySelector('.editorial-spec-section'));
      tickerCtrl = initTicker(main.querySelector('.cyber-ticker-section'));
      flagshipCtrl = initFlagshipScene(main.querySelector('.flagship'));
      servicesCtrl = initServicesPreview(main.querySelector('.services-preview'));
      skillsCtrl = initSkillsIndex(main.querySelector('.skills-index'));
      portfolioCtrl = initPortfolioGallery(main.querySelector('.portfolio-gallery'));
      showcaseCtrl = initShowcase(main.querySelector('.showcase-hscroll'));
      creativeCtrl = initCreativePreview(main.querySelector('.creative-preview'));
      processCtrl = initProcessLine(main.querySelector('.process-line'));
      contactCtrl = initContactCTA(main.querySelector('.contact-cta'));
      // Aura triggers bind to ephemeral home nodes — rebind on each home entry
      // so ambient lighting survives route round-trips instead of dying after
      // the first navigation away.
      atmosphereCtrl?.destroy?.();
      atmosphereCtrl = initAtmosphere(atmosphereEl);
      initReveal(main);
    } else if (route === 'services') {
      pageController = initServicesPage(main.querySelector('.services-page'));
    } else if (route === 'work') {
      pageController = initWorkPage(main.querySelector('.work-page'));
    } else if (route === 'contact') {
      pageController = initContactPage(main.querySelector('.contact-page'));
    } else {
      pageController = null;
      initReveal(main);
    }

    setActiveNav(route);
    syncMeta(route);

    // Pro scroll FX pass — after all route controllers are wired, so triggers
    // see the final layout. Bound to the freshly rendered viewport content.
    scrollfxCtrl?.destroy?.();
    scrollfxCtrl = initScrollFX(main);

    // Announce the new page to assistive tech without stealing focus on first load.
    if (!replace) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }
  };

  // Cinematic route sweep — skipped under the preloader (it already covers
  // the screen), in headless test environments, and for reduced motion.
  if (canAnimateRoutes() && !window.__artrawBootGate) {
    const from = currentRoute;
    navInFlight = { pending: null, pendingReplace: false };
    runRouteTransition(routeFXEl, from, route, swap).then(() => {
      const next = navInFlight?.pending;
      const nextReplace = navInFlight?.pendingReplace || false;
      navInFlight = null;
      if (next && next !== route) navigate(next, nextReplace);
    });
  } else {
    swap();
    navInFlight = null;
  }
}

const SITE_URL = 'https://umeshartraw.github.io/artraw';

const titles = {
  home: 'ARTRAW — Creative • Digital • Technology',
  services: 'Services — ARTRAW',
  work: 'Selected Work — ARTRAW',
  contact: 'Start a Project — ARTRAW',
  privacy: 'Privacy — ARTRAW',
  terms: 'Terms — ARTRAW'
};

const descriptions = {
  home: 'ARTRAW — Creative • Digital • Technology. High-performance Android AI, web systems, automation, and cinematic design.',
  services: 'Browse ARTRAW services — AI and automation, websites, design and branding, photo and video, music visuals, ecommerce, and business documentation assistance.',
  work: 'Selected work by ARTRAW — authentic systems and codebases built in this practice.',
  contact: 'Start a project with ARTRAW. Choose a service, describe what you need, and send a structured brief.',
  privacy: 'How ARTRAW handles enquiry data — replies only, no accounts, no selling of personal data.',
  terms: 'Terms for working with ARTRAW — enquiries are not contracts, and documentation help is assistance only.'
};

function syncMeta(route) {
  const title = titles[route] || titles.home;
  const description = descriptions[route] || descriptions.home;
  const path = routeToPath(route);
  const url = `${SITE_URL}${path}`;

  document.title = title;
  setMeta('name', 'description', description);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:url', url);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

function setMeta(attr, key, content) {
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function setActiveNav(route) {
  document.querySelectorAll('.nav-link, .nav-mobile-link').forEach(link => {
    const nav = link.dataset.nav;
    const active = nav === route;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function initReveal(container = document) {
  const nodes = container.querySelectorAll('.reveal');
  if (prefersReducedMotion()) {
    nodes.forEach(el => el.classList.add('visible'));
    return;
  }
  observeElementsOnce('.reveal', (el) => el.classList.add('visible'), { rootMargin: '0px 0px -40px 0px' });
  // ScrambleText section labels (opt-in via data-scramble)
  scrambleKill = initLabelScrambles(container);
}

function scrollToHash(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  const offset = 12;
  scrollTo(target, { offset, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

function onClick(e) {
  const link = e.target.closest('a');
  if (!link) return;
  if (link.target === '_blank' || link.hasAttribute('download')) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return;

  if (href.startsWith('#')) {
    e.preventDefault();
    if (currentRoute !== 'home') {
      navigate('home', false);
      requestAnimationFrame(() => scrollToHash(href));
    } else {
      scrollToHash(href);
    }
    return;
  }

  const url = new URL(href, window.location.origin);
  if (url.origin !== window.location.origin) return;
  const route = pathToRoute(url.pathname);
  if (!routes[route] && url.pathname !== '/') return;
  e.preventDefault();
  if (route === currentRoute && url.hash) {
    scrollToHash(url.hash);
    return;
  }
  navigate(route, false, url.search);
  if (url.hash) requestAnimationFrame(() => scrollToHash(url.hash));
  if (link.dataset.project) requestAnimationFrame(() => openProject(link.dataset.project));
}

function openProject(id) {
  const trigger = [...document.querySelectorAll('[data-open-project]')]
    .find(el => el.dataset.openProject === id);
  trigger?.click();
}

let scrollCtrl = null;

let footerCtrl = null;

function init() {
  document.documentElement.setAttribute('data-theme', 'dark');

  // GitHub Pages SPA direct-route fallback: 404.html stores the original path
  // in sessionStorage and redirects here. Restore the intended route without
  // adding a duplicate history entry.
  let initialRoute = null;
  const fallbackPath = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('artraw-spa-fallback') : null;
  if (fallbackPath) {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('artraw-spa-fallback');
    let clean = fallbackPath.replace(/\/+$/, '') || '/';
    const base = '/artraw/';
    if (clean.indexOf(base) === 0) {
      clean = clean.slice(base.length) || '/';
    } else if (clean.indexOf('/artraw-website/') === 0) {
      clean = clean.slice('/artraw-website/'.length) || '/';
    }
    // Reflect the intended URL without pushing a new history entry
    window.history.replaceState({ route: 'home' }, '', clean);
    if (clean === '/') {
      initialRoute = 'home';
    } else {
      const name = clean.slice(1);
      initialRoute = routes[name] ? name : 'home';
    }
  }

  const { nav, scrollProg, atmosphere } = createApp();
  atmosphereCtrl = initAtmosphere(atmosphere);
  const navController = initNavigation(nav);
  const scrollProgCtrl = initScrollProgress(scrollProg);
  const cursorCtrl = initCursor();
  const magneticCtrl = initMagnetic();
  scrollCtrl = initScroll();
  footerCtrl = initFooter(document.querySelector('footer'));
  document.addEventListener('click', onClick);
  window.addEventListener('popstate', () => navigate(pathToRoute(window.location.pathname), true));

  // Cinematic cold boot: first visit in a session runs the preloader while
  // the intended route already renders underneath it. The hero waits on the
  // preloader reveal before starting its own boot sequence.
  const runColdBoot = preloaderEligible();
  if (runColdBoot) {
    markSessionBoot();
    window.__artrawBootGate = true;
  }

  if (initialRoute) {
    navigate(initialRoute, true);
  } else {
    navigate(pathToRoute(window.location.pathname), true);
  }

  if (runColdBoot) {
    const preloaderEl = createPreloader();
    document.body.appendChild(preloaderEl);
    initPreloader(preloaderEl, {
      onReveal: () => {
        window.__artrawBootGate = false;
        window.dispatchEvent(new CustomEvent(PRELOADER_DONE_EVENT));
      },
    });
  }

  if (window.location.hash) requestAnimationFrame(() => scrollToHash(window.location.hash));
  window.addEventListener('beforeunload', () => {
    navController?.destroy();
    scrollfxCtrl?.destroy?.();
    atmosphereCtrl?.destroy?.();    pageController?.destroy?.();
    specCtrl?.destroy?.();
    flagshipCtrl?.destroy?.();
    servicesCtrl?.destroy?.();
    skillsCtrl?.destroy?.();
    portfolioCtrl?.destroy?.();
    showcaseCtrl?.destroy?.();
    creativeCtrl?.destroy?.();
    processCtrl?.destroy?.();
    contactCtrl?.destroy?.();
    scrambleKill?.();
    footerCtrl?.destroy?.();
    scrollCtrl?.destroy();
    magneticCtrl?.();
    cursorCtrl?.();
    scrollProgCtrl?.();
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
