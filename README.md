# ARTRAW — Official Website & Digital Hub

> **ARTRAW** | Creative • Digital • Technology  
> The core web presence and digital interface of the ARTRAW Autonomous Agent Ecosystem.

---

## 🌟 Overview

**ARTRAW** is the digital hub representing high-performance creative engineering and technical operations:
- **Autonomous AI & Agent Workflows:** Next-generation mobile and edge AI systems.
- **Creative & Digital Engineering:** High-speed, responsive frontend solutions and automation pipelines.
- **Full-Stack Ecosystem Integration:** Connected with Termux, Android AI OS, and cloud-first microservices.

---

## ✨ Cinematic Motion System (GSAP)

- **Cold Boot Preloader** (`components/Preloader.js`) — once-per-session cinematic intro: 00→100 counter, letter-masked wordmark ascent, ScrambleText boot log, and a 4-slab sweep reveal. Skipped on `prefers-reduced-motion` and test environments; `?noboot` disables it.
- **Route Transition FX** (`utils/transition.js`) — staggered slab sweeps with accent slivers and route-name ScrambleText cover label on every SPA navigation. Content swaps strictly under cover; scroll resets and `ScrollTrigger.refresh()` run on arrival.
- **SplitText Hero Boot** (`components/Hero.js`) — masked per-character rise for the display title and per-word rise for the editorial serif, plus ScrambleText HUD telemetry (`01 // CORE SYSTEM`, locale line). Waits for preloader reveal + `document.fonts.ready`.
- **Label Scrambles** (`utils/kinetic-text.js`) — any element with `data-scramble` scrambles into its final text on first viewport entry (section labels across Services / Skills / Work / Creative / Contact).
- **Horizontal Cinema Reel** (`components/Showcase.js`) — pinned desktop section that scrubs a film-strip of real project panels sideways, with inner poster parallax via `containerAnimation`, ghost index drift, and a progress bar. Mobile degrades to a stacked layout with plain reveals.

---

## 🚀 Tech Stack

- **Core Framework:** [Vite](https://vitejs.dev/) + Vanilla Modern ES Modules
- **Styles:** Modular responsive CSS with adaptive theming
- **Linting & Code Quality:** ESLint 9
- **Deployment:** GitHub Pages / Cloudflare Pages / Vercel

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 20 LTS)
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Development Server
```bash
npm run dev
```

### 4. Production Build
```bash
npm run build
```

The production output is bundled into `dist/`.

### 5. Automated Tests & Audits
```bash
node --experimental-loader ./css-stub-loader.mjs audit-test.mjs
node --experimental-loader ./css-stub-loader.mjs flow2-test.mjs
```

---

## 📦 Deployment

To deploy to GitHub Pages:
```bash
npm run deploy
```

> **Note:** The canonical URL currently points to GitHub Pages:
> `https://umeshartraw.github.io/artraw/`
> (`artraw.dev` is **not registered** — check again before assuming it exists).
>
> If you later buy `artraw.dev`, switch back in 3 places: 1) `SITE_URL` in
> `src/main.js`, 2) the canonical/og/JSON-LD tags in `src/index.html`, 3) the URLs
> in `public/robots.txt` + `public/sitemap.xml`. Then add a `CNAME` file containing
> `artraw.dev` to `public/`, point DNS A records at GitHub Pages IPs
> (185.199.108-111.153), redeploy, and set the custom domain in repo Pages settings.
> Asset URLs resolve through `asset()` against the build base, so both hosts work.

---

## 📄 License
All rights reserved © ARTRAW / Umesh Kumar.
