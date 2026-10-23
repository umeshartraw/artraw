/**
 * ARTRAW — Studio Footer
 *
 * Real-time IST digital clock, live system status, structured navigation,
 * and high-end editorial branding.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { revealOnEnter } from '../utils/scroll.js';
import { getMotionPreference, setMotionPreference, prefersReducedMotion } from '../utils/helpers.js';

gsap.registerPlugin(ScrollTrigger);

const MOTION_LABELS = { auto: 'Auto', full: 'Max', off: 'Off' };

function motionToggleLabel() {
  return `Motion FX: ${MOTION_LABELS[getMotionPreference()] || 'Auto'}`;
}

export function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.setAttribute('role', 'contentinfo');
  const year = new Date().getFullYear();

  footer.innerHTML = `
    <div class="container">
      <!-- Live Status & Local Time Strip -->
      <div class="footer-top-strip reveal">
        <div class="footer-status-pill">
          <span class="status-indicator-dot"></span>
          <span>SYSTEM STATUS: OPERATIONAL</span>
        </div>
        <div class="footer-time-pill" id="footer-ist-clock">
          <span class="clock-icon">🕒</span>
          <span id="footer-ist-time">India (IST): --:--:--</span>
        </div>
      </div>

      <div class="footer-inner">
        <div class="footer-brand reveal">
          <a href="/" class="footer-logo" data-route="home" aria-label="ARTRAW home">
            <span class="brand-monogram">
              <svg class="footer-brand-avatar" width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius: 50%; border: 1px solid var(--color-accent-red);">
                <rect width="32" height="32" rx="7" fill="#070709"/>
                <path d="M8 23 L16 7 L24 23" fill="none" stroke="#ff2d4a" stroke-width="2"/>
                <path d="M11 18 H21" stroke="#3ee0ff" stroke-width="2"/>
              </svg>
            </span>
            <span class="brand-name">ARTRAW</span>
          </a>
          <p class="footer-tagline">
            ARTRAW — AI Architecture, Creative Engineering & Digital Solutions.
          </p>
          <p class="footer-subtext">
            Autonomous agent workflows, native Android engineering, and uncompromising visual systems.
          </p>
        </div>

        <nav class="footer-nav" aria-label="Navigation">
          <h3 class="footer-column-title">Architecture</h3>
          <ul class="footer-links">
            <li><a href="#about" class="footer-link">The Studio</a></li>
            <li><a href="/services" class="footer-link" data-route="true">Services & Specs</a></li>
            <li><a href="#flagship" class="footer-link">Featured Motion</a></li>
            <li><a href="/work" class="footer-link" data-route="true">Selected Work</a></li>
          </ul>
        </nav>

        <nav class="footer-nav" aria-label="Direct Contact">
          <h3 class="footer-column-title">Direct Contact</h3>
          <ul class="footer-links">
            <li><a href="mailto:rawateditzz@gmail.com" class="footer-link">rawateditzz@gmail.com</a></li>
            <li><a href="tel:9315878751" class="footer-link">+91 9315878751</a></li>
            <li><a href="https://wa.me/919315878751" target="_blank" rel="noopener noreferrer" class="footer-link">WhatsApp: 9315878751</a></li>
            <li><a href="https://github.com/umeshartraw" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub Profile</a></li>
          </ul>
        </nav>
      </div>

      <div class="footer-bottom">
        <p class="footer-copyright">&copy; ${year} ARTRAW. All rights reserved.</p>
        <ul class="footer-legal">
          <li><a href="/privacy" class="footer-link" data-route="true">Privacy Policy</a></li>
          <li><a href="/terms" class="footer-link" data-route="true">Terms of Service</a></li>
          <li><button type="button" id="motion-fx-toggle" class="footer-link motion-fx-toggle" title="Animations: Auto = follows your device · Max = always full motion · Off = reduced">${motionToggleLabel()}</button></li>
        </ul>
      </div>
    </div>
  `;

  return footer;
}

export function initFooter(footer) {
  if (!footer || typeof window === 'undefined') return { destroy() {} };

  const revealEls = Array.from(footer.querySelectorAll('.reveal'));
  const clockEl = footer.querySelector('#footer-ist-time');

  let clockInterval = null;

  function updateClock() {
    try {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      const timeStr = now.toLocaleTimeString('en-US', options);
      if (clockEl) {
        clockEl.textContent = `Remote · India (IST): ${timeStr} · UTC+5:30`;
      }
    } catch {
      if (clockEl) clockEl.textContent = `Remote · India (IST / UTC+5:30)`;
    }
  }

  updateClock();
  clockInterval = setInterval(updateClock, 1000);

  ScrollTrigger.getAll().forEach((t) => {
    if (t.trigger && footer.contains(t.trigger)) t.kill();
  });

  // ---- Motion FX preference toggle (Auto → Max → Off → Auto) ----
  const fxToggle = footer.querySelector('#motion-fx-toggle');
  const onFxToggleClick = () => {
    const current = getMotionPreference();
    const next = current === 'auto' ? 'full' : current === 'full' ? 'off' : 'auto';
    setMotionPreference(next);
    try {
      if (next !== 'auto') document.documentElement.dataset.motion = next;
      else delete document.documentElement.dataset.motion;
    } catch { /* nothing */ }
    fxToggle.textContent = `Motion FX: ${MOTION_LABELS[next]}`;
    // Reload so every controller re-reads the preference from a clean slate.
    window.location.reload();
  };
  if (fxToggle) fxToggle.addEventListener('click', onFxToggleClick);

  const prefersReduced = prefersReducedMotion();
  let killReveal = () => {};

  if (!prefersReduced) {
    killReveal = revealOnEnter(revealEls, { once: true, start: 'top 88%', stagger: 0.05 });
  } else {
    revealEls.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  return {
    destroy() {
      if (clockInterval) clearInterval(clockInterval);
      if (fxToggle) fxToggle.removeEventListener('click', onFxToggleClick);
      killReveal();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger && footer.contains(t.trigger)) t.kill();
      });
      gsap.set(revealEls, { clearProps: 'opacity,y,transform' });
    },
  };
}
