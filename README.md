<p align="center">
  <img src="favicon.svg" width="80" alt="Portfolio Logo" />
</p>

<h1 align="center">Vaibhav Tulsian — Developer Portfolio</h1>

<p align="center">
  A modern, single-page developer portfolio that dynamically pulls projects from the GitHub API. Built with vanilla HTML, CSS, and JavaScript — no build tools required.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=black" alt="GSAP" />
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| **Dynamic GitHub Integration** | Fetches all public repos via the GitHub REST API — no manual project list to maintain |
| **Hash-based SPA Router** | Client-side navigation (`#/`, `#/work`, `#/studio`, `#/contact`) with animated page transitions |
| **Three.js Particle Background** | Interactive 3D particle field with connection lines that follows the cursor |
| **GSAP Page Transitions** | Cinematic camera zoom + content slide animations between route changes |
| **Procedural Thumbnails** | Every project card gets a unique SVG thumbnail generated from a color palette and seed algorithm |
| **README Rendering** | Each project detail page fetches and renders the repo's README directly from the GitHub API |
| **Infinite Scroll** | Project list uses an `IntersectionObserver` sentinel to lazy-load batches of 12 |
| **Custom Cursor** | Smooth lerp-based cursor with contextual hover labels (desktop only) |
| **Scroll Progress Bar** | Top-of-viewport progress indicator |
| **Loading Screen** | Animated loading bar that waits for the GitHub fetch to complete, with skip option |
| **Mobile Responsive** | Hamburger menu, fluid typography (`clamp()`), and touch device detection |
| **Accessibility** | Skip-nav link, ARIA labels, `role` attributes, `aria-expanded` toggles |
| **SEO** | Open Graph, Twitter Card meta tags, JSON-LD structured data |

---

## 📁 Project Structure

```
Portfolio/
├── index.html        # Entry point — navigation, loading screen, footer, CDN scripts
├── styles.css        # Complete design system (~3,400 lines) with CSS custom properties
├── data.js           # Configuration, color palettes, procedural SVG generators, team data
├── app.js            # SPA router, GitHub fetch, Three.js scene, page renderers, animations
├── profile.jpg       # Profile photo displayed on the About page
├── favicon.svg       # `</>` monospace logo favicon
└── README.md         # This file
```

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Any static file server (or just open `index.html` directly)

### Run Locally

**Option 1 — Direct open:**
```bash
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

**Option 2 — Local server (recommended for proper CORS with GitHub API):**
```bash
# Python
python3 -m http.server 8000

# Node.js
npx -y serve .

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`.

---

## ⚙️ Configuration

All personal data is centralized in [`data.js`](data.js). Edit the `window.CONFIG` object:

```js
window.CONFIG = {
  GITHUB_USERNAME: 'vaibhavtulsian',      // ← Your GitHub username (repos are auto-fetched)

  NAME: 'Vaibhav Tulsian',
  ROLE: 'Software Developer & Open Source Contributor',
  BIO: 'I build software and contribute to open source...',
  LONG_BIO: 'Hi, Vaibhav this side...',
  EMAIL: 'vaibhavtulsian@gmail.com',
  LOCATION: 'India',

  SOCIALS: {
    github:   'https://github.com/vaibhavtulsian',
    linkedin: 'https://linkedin.com/in/vaibhavtulsian',
    twitter:  'https://twitter.com/vaibhavtulsian'
  }
};
```

### What you can customize

| Item | Location | Notes |
|---|---|---|
| Personal info, bio, email | `data.js` → `window.CONFIG` | Used across all pages |
| Social links | `data.js` → `CONFIG.SOCIALS` | Used on the Contact page |
| Profile photo | Replace `profile.jpg` | Referenced in `window.TEAM` |
| Language filter categories | `data.js` → `CATEGORIES` | Add/remove language tabs |
| Thumbnail color palettes | `data.js` → `PROJECT_PALETTES` | 12 palette sets for procedural SVGs |
| Budget/service tiers | `data.js` → `BUDGET_TIERS` | Freelance pricing tiers |
| Brand colors & design tokens | `styles.css` → `:root` | Full design system variables |
| Contact card links | `app.js` → `renderContact()` | Hardcoded social card URLs |

---

## 🏗️ Architecture

### SPA Router

The app uses a **hash-based router** (`window.location.hash`). Routes are defined in [`app.js`](app.js):

| Route | Renderer | Page |
|---|---|---|
| `#/` | `renderHome()` | Hero section with animated title |
| `#/work` | `renderWork()` | All GitHub repos with infinite scroll |
| `#/work/:slug` | `renderProjectDetail(slug)` | Individual repo with README fetch |
| `#/studio` | `renderAbout()` | Profile card and bio |
| `#/contact` | `renderContact()` | Social links & email |
| `*` | `render404()` | Animated 404 page |

### Data Flow

```
1. Page Load
   └─▶ initLoading()
       ├─▶ fetchGitHubRepos()          → GET /users/:username/repos
       │   └─▶ Maps API response to window.PROJECTS[]
       │       └─▶ generateProjectThumbnail() per repo
       └─▶ completeLoading()
           └─▶ initApp()
               ├─▶ initCursor()
               ├─▶ initMobileMenu()
               ├─▶ initLinkHandler()       → Intercepts [data-link] clicks
               └─▶ handleRoute()           → First render

2. Navigation
   └─▶ Click [data-link]
       └─▶ navigate(route)              → Sets window.location.hash
           └─▶ hashchange event
               └─▶ handleRoute()
                   └─▶ transitionTo(renderFn)
                       ├─▶ Fade-out + GSAP camera zoom
                       ├─▶ renderFn()       → Injects HTML into #app
                       └─▶ Fade-in + camera reset
```

### Three.js Background

The particle scene (`initThreeScene()`) renders 1,500 color-randomized points with additive blending and 60 connection line segments. It reacts to mouse position via lerp-smoothed camera offsets. The scene persists globally across routes with a cinematic zoom transition on page changes.

### Design System

The CSS uses a token-based architecture defined in `:root`:

- **Colors** — Brand purple (`#7B2FBE`), teal accent, coral accent, gold accent
- **Typography** — Space Grotesk (display), Inter (body), JetBrains Mono (code)
- **Spacing** — 10-step scale from `0.25rem` to `8rem`
- **Fluid type** — All font sizes use `clamp()` for responsive scaling
- **Easing** — Named cubic-bezier curves (`--ease-out`, `--ease-spring`)
- **Z-index** — 7-layer scale from `--z-base` (1) to `--z-loading` (600)

---

## 🌐 Deployment

This is a fully static site — deploy anywhere that serves HTML files.

### GitHub Pages

1. Go to your repo **Settings → Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose `main` branch, `/ (root)` folder
4. Click **Save** — your site will be live at `https://<username>.github.io/Portfolio/`

### Other Platforms

| Platform | Command / Action |
|---|---|
| **Netlify** | Drag-and-drop the project folder, or connect the GitHub repo |
| **Vercel** | `npx vercel` from the project root |
| **Cloudflare Pages** | Connect repo → build command: *(none)* → output dir: `/` |

---

## 📦 Dependencies

All dependencies are loaded via CDN — **zero `npm install` required**.

| Library | Version | Purpose |
|---|---|---|
| [Three.js](https://threejs.org/) | r128 | 3D particle background |
| [GSAP](https://greensock.com/gsap/) | 3.12.5 | Page transition animations |
| [GSAP ScrollTrigger](https://greensock.com/scrolltrigger/) | 3.12.5 | Scroll-based animation triggers |
| [Google Fonts](https://fonts.google.com/) | — | Space Grotesk, Inter, JetBrains Mono |

---

## 🔑 API Notes

- The app uses the **unauthenticated** GitHub REST API, which has a rate limit of **60 requests/hour** per IP.
- Forked repos and repos named `portfolio` or matching your username are automatically excluded from the project list.
- Each project detail page makes an additional API call to fetch the README (`application/vnd.github.v3.html`).

> **Tip:** If you're hitting rate limits during development, consider adding a [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) as a `Bearer` header in the fetch calls to increase the limit to 5,000 requests/hour.

---

## 📄 License

© 2026 Vaibhav Tulsian. All rights reserved.
