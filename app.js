/* ============================================================
   DEV PORTFOLIO — Main Application
   SPA Router, GitHub API Fetch, Three.js Hero, GSAP Animations
   ============================================================ */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────
  const state = {
    currentRoute: '',
    scrollY: 0,
    mouseX: 0,
    mouseY: 0,
    cursorX: 0,
    cursorY: 0,
    isMobile: false,
    isTouch: false,
    heroSceneActive: false,
    loadingComplete: false,
    reposFetched: false
  };

  // ── DOM References ─────────────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const app = $('#app');
  const nav = $('#main-nav');
  const scrollProgress = $('#scroll-progress');
  const customCursor = $('#custom-cursor');
  const cursorLabel = $('#cursor-label');
  const loadingScreen = $('#loading-screen');
  const loadingBar = $('#loading-bar');
  const loadingSkip = $('#loading-skip');
  const pageTransition = $('#page-transition');
  const hamburger = $('#nav-hamburger');
  const mobileMenu = $('#mobile-menu');

  // ── Utility Functions ──────────────────────────────────────
  function detectDevice() {
    state.isMobile = window.innerWidth < 768;
    state.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  // ── GitHub API Fetch ───────────────────────────────────────
  async function fetchGitHubRepos() {
    if (state.reposFetched) return;
    try {
      const username = window.CONFIG.GITHUB_USERNAME;
      if (!username || username === 'octocat') {
        console.warn('Using placeholder username. Update window.CONFIG.GITHUB_USERNAME in data.js');
      }

      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
      if (!res.ok) throw new Error('Failed to fetch repos');
      const data = await res.json();

      window.PROJECTS = data.filter(repo => !repo.fork && repo.name.toLowerCase() !== 'portfolio' && repo.name.toLowerCase() !== 'vaibhavtulsian').map((repo, i) => {
        const lang = repo.language ? repo.language.toLowerCase() : 'other';
        const catId = window.CATEGORIES.find(c => c.id === lang) ? lang : 'all';
        const palette = window.PROJECT_PALETTES[i % window.PROJECT_PALETTES.length];

        return {
          id: repo.id,
          title: repo.name,
          slug: repo.name,
          owner: repo.owner.login,
          description: repo.description || '',
          categories: [catId],
          tags: repo.topics || [],
          language: repo.language || 'Unknown',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          url: repo.html_url,
          homepage: repo.homepage,
          year: new Date(repo.created_at).getFullYear(),
          thumbnail: window.generateProjectThumbnail(palette, repo.id),
          featured: repo.stargazers_count > 0 || i < 4 // feature top ones
        };
      });
      state.reposFetched = true;
    } catch (err) {
      console.error(err);
      window.PROJECTS = []; // fallback
    }
  }

  // ── Loading Screen ─────────────────────────────────────────
  async function initLoading() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 90) progress = 90; // Wait for fetch
      loadingBar.style.width = progress + '%';
    }, 200);

    await fetchGitHubRepos(); // Wait for repos to load

    clearInterval(interval);
    loadingBar.style.width = '100%';
    setTimeout(completeLoading, 400);

    setTimeout(() => {
      loadingSkip.classList.add('visible');
    }, 1000);

    loadingSkip.addEventListener('click', () => {
      document.body.classList.remove('loading');
      setTimeout(() => { loadingScreen.style.display = 'none'; }, 600);
    });

    // Initialize Global Three.js Background
    const globalCanvas = $('#global-canvas');
    if (globalCanvas) {
      initThreeScene(globalCanvas);
    }
  }

  function completeLoading() {
    loadingScreen.classList.add('hidden');
    document.body.classList.remove('loading');
    state.loadingComplete = true;
    initApp();
  }

  // ── Custom Cursor ──────────────────────────────────────────
  function initCursor() {
    if (state.isTouch) return;

    document.addEventListener('mousemove', (e) => {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
      if (!customCursor.classList.contains('visible')) {
        customCursor.classList.add('visible');
      }
    });

    document.addEventListener('mouseleave', () => {
      customCursor.classList.remove('visible');
    });

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-cursor], a, button, .project-tile, .type-tile, .budget-tier, .filter-tab, .gallery-item');
      if (target) {
        customCursor.classList.add('hovering');
        const label = target.getAttribute('data-cursor') || '';
        if (label) {
          cursorLabel.textContent = label;
        } else if (target.classList.contains('project-tile')) {
          cursorLabel.textContent = 'View';
        } else {
          cursorLabel.textContent = '';
        }
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-cursor], a, button, .project-tile, .type-tile, .budget-tier, .filter-tab, .gallery-item');
      if (target) {
        customCursor.classList.remove('hovering');
        cursorLabel.textContent = '';
      }
    });

    animateCursor();
  }

  function animateCursor() {
    state.cursorX = lerp(state.cursorX, state.mouseX, 0.15);
    state.cursorY = lerp(state.cursorY, state.mouseY, 0.15);
    customCursor.style.transform = `translate(${state.cursorX - 10}px, ${state.cursorY - 10}px)`;
    requestAnimationFrame(animateCursor);
  }

  // ── Scroll Progress ────────────────────────────────────────
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';

    if (scrollTop > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    const scrollIndicator = $('.scroll-indicator');
    if (scrollIndicator && scrollTop > 100) scrollIndicator.classList.add('hidden');
  }

  // ── Scroll Reveal ───────────────────────────────────────────
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    $$('.reveal, .reveal-stagger').forEach(el => observer.observe(el));
  }

  // ── Mobile Menu ────────────────────────────────────────────
  function initMobileMenu() {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);
      document.body.classList.toggle('no-scroll', isOpen);
    });

    $$('[data-mobile-link]').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // ── Navigation Active State ────────────────────────────────
  function updateActiveNav(route) {
    $$('.nav-link').forEach(link => {
      const navKey = link.getAttribute('data-nav');
      if (navKey && route.startsWith('/' + navKey)) link.classList.add('active');
      else link.classList.remove('active');
    });
    $$('.mobile-link').forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      if ((href === '/' && route === '/') || (href !== '/' && route.startsWith(href))) link.classList.add('active');
      else link.classList.remove('active');
    });
  }

  // ── Three.js Hero Scene ────────────────────────────────────
  let threeScene, threeCamera, threeRenderer, particles, animationId;

  function initThreeScene(container) {
    if (state.isTouch || state.isMobile) return;
    if (typeof THREE === 'undefined') return;

    try {
      threeScene = new THREE.Scene();
      threeCamera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
      threeCamera.position.z = 5;

      threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
      threeRenderer.setSize(container.offsetWidth, container.offsetHeight);
      threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      container.appendChild(threeRenderer.domElement);

      const geometry = new THREE.BufferGeometry();
      const count = 1500;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);

      const color1 = new THREE.Color(0x7B2FBE);
      const color2 = new THREE.Color(0x2DD4BF);
      const color3 = new THREE.Color(0xFFFFFF);

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        sizes[i] = Math.random() * 3 + 0.5;

        const colorChoice = Math.random();
        const c = colorChoice < 0.4 ? color1 : colorChoice < 0.7 ? color2 : color3;
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      particles = new THREE.Points(geometry, material);
      threeScene.add(particles);

      // Connection lines
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = [];
      for (let i = 0; i < 60; i++) {
        const i1 = Math.floor(Math.random() * count);
        const i2 = Math.floor(Math.random() * count);
        linePositions.push(
          positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2],
          positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2]
        );
      }
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x2DD4BF, transparent: true, opacity: 0.08 });
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      threeScene.add(lines);

      state.heroSceneActive = true;
      animateThree();

    } catch (e) {
      console.warn('WebGL init failed:', e);
    }
  }

  function animateThree() {
    if (!state.heroSceneActive) return;
    animationId = requestAnimationFrame(animateThree);

    const time = Date.now() * 0.0005;

    if (particles) {
      particles.rotation.y = time * 0.1;
      particles.rotation.x = Math.sin(time * 0.3) * 0.05;

      const targetX = (state.mouseX / window.innerWidth - 0.5) * 0.3;
      const targetY = (state.mouseY / window.innerHeight - 0.5) * 0.3;
      threeCamera.position.x = lerp(threeCamera.position.x, targetX, 0.05);
      threeCamera.position.y = lerp(threeCamera.position.y, -targetY, 0.05);
    }

    threeRenderer.render(threeScene, threeCamera);
  }

  function destroyThreeScene() {
    state.heroSceneActive = false;
    if (animationId) cancelAnimationFrame(animationId);
    if (threeRenderer) {
      threeRenderer.dispose();
      const canvas = threeRenderer.domElement;
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
    threeScene = null;
    threeCamera = null;
    threeRenderer = null;
    particles = null;
  }

  // ── Kinetic Typography ─────────────────────────────────────
  function animateHeroText() {
    const title = $('.hero-title');
    if (title) {
      title.style.opacity = '0';
      title.style.transform = 'translateY(20px)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          title.style.transition = 'opacity 0.8s var(--ease-out), transform 0.8s var(--ease-spring)';
          title.style.opacity = '1';
          title.style.transform = 'translateY(0)';
        });
      });
    }

    const subtitle = $('.hero-subtitle');
    const actions = $('.hero-actions');
    const tagline = $('.hero-tagline');

    if (tagline) setTimeout(() => { tagline.style.opacity = '1'; tagline.style.transition = 'opacity 0.6s'; }, 200);
    if (subtitle) setTimeout(() => { subtitle.style.opacity = '1'; subtitle.style.transition = 'opacity 0.8s'; }, 400);
    if (actions) setTimeout(() => { actions.style.opacity = '1'; actions.style.transition = 'opacity 0.8s'; }, 600);
  }

  // ── Page Transition ────────────────────────────────────────
  function transitionTo(renderFn) {
    const pageTransition = document.getElementById('page-transition');

    // 1. Content slides up and fades out
    app.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    app.style.opacity = '0';
    app.style.transform = 'translateY(-30px)';

    // Note: No black overlay used so the stars remain visible during transition
    // if (pageTransition) pageTransition.classList.add('active');

    // 2. Smooth zoom-in to the stars
    if (typeof gsap !== 'undefined' && typeof threeCamera !== 'undefined' && threeCamera) {
      gsap.to(threeCamera.position, {
        z: 1.5, // Zoom in closer
        duration: 0.6,
        ease: "power2.inOut"
      });
      gsap.to(threeCamera.rotation, {
        z: 0.1, // Slight cinematic tilt
        duration: 0.6,
        ease: "power2.inOut"
      });
    }

    setTimeout(() => {
      // 3. Render the new page content
      renderFn();
      window.scrollTo(0, 0);

      // Reset content to slightly below for sliding up effect on enter
      app.style.transform = 'translateY(30px)';
      void app.offsetWidth;

      // 4. Fade content back in and slide up to resting position
      app.style.opacity = '1';
      app.style.transform = 'translateY(0)';

      // 5. Smoothly zoom stars back out to original form
      if (typeof gsap !== 'undefined' && typeof threeCamera !== 'undefined' && threeCamera) {
        gsap.to(threeCamera.position, {
          z: 5,
          duration: 0.8,
          ease: "power2.out"
        });
        gsap.to(threeCamera.rotation, {
          z: 0,
          duration: 0.8,
          ease: "power2.out"
        });
      }

      setTimeout(() => {
        initScrollReveal();
        app.style.transition = ''; // Cleanup
      }, 100);
    }, 550);
  }

  // ── Router ─────────────────────────────────────────────────
  function getRoute() {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
  }

  function navigate(route) {
    window.location.hash = route;
  }

  function handleRoute() {
    const route = getRoute();
    if (route === state.currentRoute) return;

    const prevRoute = state.currentRoute;
    state.currentRoute = route;
    updateActiveNav(route);

    if (prevRoute !== route) {
      // Background animation now persists globally
    }

    const render = () => {
      const isProjectDetail = route.startsWith('/work/');
      if (isProjectDetail) nav.classList.add('nav-dark');
      else nav.classList.remove('nav-dark');

      if (route === '/') renderHome();
      else if (route === '/work') renderWork();
      else if (isProjectDetail) renderProjectDetail(route.replace('/work/', ''));
      else if (route === '/studio') renderAbout();
      else if (route === '/contact') renderContact();
      else render404();

      const footer = $('#site-footer');
      footer.style.display = route === '/404' ? 'none' : 'block';
    };

    if (prevRoute && prevRoute !== route) {
      transitionTo(render);
    } else {
      render();
      initScrollReveal();
    }
  }

  function initLinkHandler() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          navigate(href.slice(1));
        }
      }
    });
  }

  // ── HOME ───────────────────────────────────────────────────
  function renderHome() {
    app.innerHTML = `
      <section class="hero" id="hero-section">
        <div class="container hero-content">
          <p class="hero-tagline">${window.CONFIG.ROLE}</p>
          <h1 class="hero-title text-gradient">Hi, I'm Vaibhav</h1>
          <p class="hero-subtitle">${window.CONFIG.BIO}</p>
          <div class="hero-actions">
            <a href="#/work" class="btn btn-primary btn-lg" data-link data-cursor="Explore">
              View Projects <span class="arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div class="scroll-indicator" aria-hidden="true">
          <span class="scroll-indicator-text">Scroll</span>
          <span class="scroll-indicator-line"></span>
        </div>
      </section>
    `;

    setTimeout(() => {
      animateHeroText();
    }, 100);
  }

  // ── PROJECTS ───────────────────────────────────────────────
  function renderWork() {
    document.title = 'Projects — Dev Portfolio';

    app.innerHTML = `
      <section style="position: relative; overflow: visible; padding-top: calc(var(--nav-height) + var(--space-3xl)); padding-bottom: var(--space-2xl);">
        <div class="section-header reveal container" style="position: relative; z-index: 2; text-align: center;">
          <span class="label" style="justify-content: center;">Projects</span>
          <h1>My Projects</h1>
          <p class="text-meta" style="margin-top:var(--space-sm); margin-left: auto; margin-right: auto; max-width: 600px;">A collection of my open-source work and side projects.</p>
        </div>
      </section>

      <section class="container" style="padding-top: var(--space-xl); position: relative; z-index: 2;">

        <div class="repo-list-container" id="project-grid" role="list"></div>
        <div id="load-more-sentinel" style="height:1px;"></div>
      </section>
    `;

    let displayedCount = 0;
    const batchSize = 12;

    function getFilteredProjects() {
      let filtered = [...window.PROJECTS];
      filtered.sort((a, b) => b.year - a.year || b.id - a.id);
      return filtered;
    }

    function renderProjectGrid(reset = false) {
      const grid = $('#project-grid');
      if (!grid) return;

      if (reset) {
        grid.innerHTML = '';
        displayedCount = 0;
      }

      const filtered = getFilteredProjects();
      const batch = filtered.slice(displayedCount, displayedCount + batchSize);

      if (batch.length === 0 && displayedCount === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:var(--space-4xl) 0;">
            <p style="font-size:var(--text-xl);color:var(--text-secondary);">No projects found</p>
          </div>`;
        return;
      }

      batch.forEach((p, i) => {
        const tile = document.createElement('a');
        tile.href = `#/work/${p.slug}`;
        tile.className = `repo-list-item`;
        tile.setAttribute('data-link', '');
        tile.setAttribute('data-cursor', 'View');
        tile.setAttribute('role', 'listitem');

        tile.innerHTML = `
          <div class="repo-list-bg" style="background-image:url('${p.thumbnail}')"></div>
          <div class="list-item-content">
            <div class="list-item-main">
              <h3 class="list-item-title">${p.title}</h3>
              ${p.description ? `<p class="list-item-desc">${p.description.slice(0, 100)}${p.description.length > 100 ? '...' : ''}</p>` : ''}
            </div>
            <div class="list-item-meta">
              <span class="badge">${p.language}</span>
              <span class="text-meta">⭐ ${p.stars} &nbsp; 🍴 ${p.forks}</span>
            </div>
          </div>
        `;

        tile.style.opacity = '0';
        tile.style.transform = 'translateY(15px)';
        setTimeout(() => {
          tile.style.transition = 'opacity 0.4s var(--ease-out), transform 0.4s var(--ease-out)';
          tile.style.opacity = '1';
          tile.style.transform = 'translateY(0)';
        }, i * 40 + 50);

        grid.appendChild(tile);
      });

      displayedCount += batch.length;
    }

    renderProjectGrid();



    // Removed search and sort event listeners

    const sentinel = $('#load-more-sentinel');
    if (sentinel) {
      const loadMoreObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && displayedCount < getFilteredProjects().length) renderProjectGrid();
      }, { rootMargin: '200px' });
      loadMoreObserver.observe(sentinel);
    }
  }

  // ── REPO DETAIL ────────────────────────────────────────────
  function renderProjectDetail(slug) {
    const project = window.PROJECTS.find(p => p.slug === slug);
    if (!project) { render404(); return; }

    document.title = `${project.title} — Dev Portfolio`;

    app.innerHTML = `
      <section class="project-hero">
        <div class="project-hero-media">
          <img src="${project.thumbnail}" alt="${project.title}">
        </div>
        <div class="project-hero-gradient"></div>
        <div class="project-hero-content">
          <span class="badge" style="margin-bottom:var(--space-md);">${project.language}</span>
          <h1 style="font-size:var(--text-4xl);">${project.title}</h1>
          <div class="project-meta-row">
            <div class="project-meta-item">
              <span class="project-meta-label">Stars</span>
              <span class="project-meta-value">⭐ ${project.stars}</span>
            </div>
            <div class="project-meta-item">
              <span class="project-meta-label">Forks</span>
              <span class="project-meta-value">🍴 ${project.forks}</span>
            </div>
            <div class="project-meta-item">
              <span class="project-meta-label">Year</span>
              <span class="project-meta-value">${project.year}</span>
            </div>
          </div>
        </div>
      </section>

      <article class="project-body">
        <section class="project-overview reveal">
          <div class="section-header">
            <span class="label">About</span>
          </div>
          <div id="readme-container" class="readme-content markdown-body" style="color:var(--text-secondary);line-height:1.8;">
            <p>Loading README...</p>
          </div>
        </section>

        ${project.tags.length > 0 ? `
        <section class="reveal" style="margin-bottom:var(--space-4xl);">
          <div class="section-header">
            <span class="label">Topics</span>
            <h3>Tags</h3>
          </div>
          <div class="software-tags">
            ${project.tags.map(t => `<span class="software-tag">#${t}</span>`).join('')}
          </div>
        </section>
        ` : ''}

        <section class="cta-section" style="padding:var(--space-4xl) 0;">
          <div class="cta-glow" aria-hidden="true"></div>
          <div class="cta-content reveal">
            <h2>View on GitHub</h2>
            <p>Check out the source code, open issues, or contribute to this repository.</p>
            <div style="display:flex;gap:var(--space-md);justify-content:center;">
              <a href="${project.url}" target="_blank" class="btn btn-primary btn-lg" data-cursor="GitHub">
                Open Repository <span class="arrow" aria-hidden="true">→</span>
              </a>
              ${project.homepage ? `
              <a href="${project.homepage}" target="_blank" class="btn btn-secondary btn-lg" data-cursor="View">
                Live Demo
              </a>` : ''}
            </div>
          </div>
        </section>
      </article>
    `;

    fetch(`https://api.github.com/repos/${project.owner || window.CONFIG.GITHUB_USERNAME}/${project.slug}/readme`, {
      headers: { 'Accept': 'application/vnd.github.v3.html' }
    })
      .then(res => {
        if (!res.ok) throw new Error('README not found');
        return res.text();
      })
      .then(html => {
        const container = $('#readme-container');
        if (container) container.innerHTML = html;
      })
      .catch(() => {
        const container = $('#readme-container');
        if (container) container.innerHTML = `<p>${project.description}</p><p><br><em>(No README file found for this repository)</em></p>`;
      });
  }

  // ── ABOUT ME ───────────────────────────────────────────────
  function renderAbout() {
    document.title = 'Profile — Dev Portfolio';

    app.innerHTML = `
      <section style="position: relative; overflow: visible; padding-top: calc(var(--nav-height) + var(--space-3xl)); padding-bottom: var(--space-2xl);">
        <div class="studio-hero container" style="display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; z-index: 2;">
          <div class="reveal">
            <span class="label" style="display:inline-flex;align-items:center;gap:var(--space-sm);font-family:var(--font-mono);font-size:var(--text-xs);color:var(--brand-primary);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:var(--space-lg);justify-content:center;">
              <span style="display:block;width:24px;height:1px;background:var(--brand-primary);"></span>
              Behind The Code
              <span style="display:block;width:24px;height:1px;background:var(--brand-primary);"></span>
            </span>
          </div>
          <h1 class="studio-philosophy text-gradient reveal" style="text-align: center; margin-left: auto; margin-right: auto; position: relative; z-index: 2;">Code is my craft, and open source is my community.</h1>
          <p style="color:var(--text-secondary);margin-top:var(--space-2xl);max-width:700px;margin-left:auto;margin-right:auto;font-size:var(--text-lg);line-height:1.8;text-align:center;position: relative; z-index: 2;" class="reveal">
            ${window.CONFIG.BIO}
          </p>
        </div>
      </section>

      <section class="section container" style="text-align: center; position: relative; z-index: 2;">
        <div class="section-header reveal" style="display: flex; flex-direction: column; align-items: center;">
          <span class="label">Profile</span>
          <h2>The Developer</h2>
        </div>
        <div class="team-grid reveal-stagger" style="display: flex; justify-content: center;">
          ${window.TEAM.map(member => `
            <div class="team-card" style="max-width: 400px; width: 100%; text-align: left;">
              <div class="team-card-image">
                <img src="${member.avatar}" alt="${member.name}" loading="lazy">
              </div>
              <div class="team-card-body" style="text-align: center;">
                <h3 class="team-card-name">${member.name}</h3>
                <p class="team-card-role">${member.role}</p>
                <p class="team-card-bio" style="margin-left: auto; margin-right: auto;">${member.bio}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  // ── CONTACT ─────────────────────────────────────────────────
  function renderContact() {
    document.title = 'Contact — Dev Portfolio';

    app.innerHTML = `
      <section style="position: relative; overflow: visible; padding-top: calc(var(--nav-height) + var(--space-3xl)); padding-bottom: var(--space-2xl);">
        <div class="container" style="position: relative; z-index: 2; text-align: center;">
          <div class="section-header reveal">
            <span class="label" style="justify-content: center;">Get In Touch</span>
            <h1>Let's Connect</h1>
            <p class="text-meta" style="margin-top:var(--space-sm); margin-left: auto; margin-right: auto; max-width: 600px;">Have a question, want to collaborate, or just want to say hello? Feel free to reach out through any of the channels below.</p>
          </div>
        </div>
      </section>

      <section class="container" style="padding-top: var(--space-xl); padding-bottom: var(--space-5xl); position: relative; z-index: 2;">

          <div class="contact-email-section reveal" style="text-align:center; margin-bottom: var(--space-3xl);">
            <h2 style="font-size:var(--text-2xl); color:var(--text-secondary); font-weight:400; margin-bottom: var(--space-md);">Reach me at</h2>
            <a href="mailto:vaibhavtulsian@gmail.com" class="contact-email-link" data-cursor="Email">vaibhavtulsian@gmail.com</a>
          </div>

        <div class="contact-grid reveal-stagger">

          <a href="https://github.com/vaibhavtulsian" target="_blank" rel="noopener" class="contact-card" data-cursor="View">
            <div class="contact-card-icon">🐙</div>
            <h3 class="contact-card-title">GitHub</h3>
            <p class="contact-card-value">@vaibhavtulsian</p>
            <span class="contact-card-action">View profile <span class="arrow">→</span></span>
          </a>

          <a href="https://linkedin.com/in/vaibhav-tulsian-144213334" target="_blank" rel="noopener" class="contact-card" data-cursor="View">
            <div class="contact-card-icon">💼</div>
            <h3 class="contact-card-title">LinkedIn</h3>
            <p class="contact-card-value">Vaibhav Tulsian</p>
            <span class="contact-card-action">Connect <span class="arrow">→</span></span>
          </a>

          <a href="https://x.com/tulsianvaibhav?s=11" target="_blank" rel="noopener" class="contact-card" data-cursor="View">
            <div class="contact-card-icon">𝕏</div>
            <h3 class="contact-card-title">Twitter / X</h3>
            <p class="contact-card-value">@tulsianvaibhav</p>
            <span class="contact-card-action">Follow <span class="arrow">→</span></span>
          </a>

          <a href="https://www.instagram.com/vaibhav_tulsian?igsh=bWo0Zm00eGpuNmRp" target="_blank" rel="noopener" class="contact-card" data-cursor="View">
            <div class="contact-card-icon">📸</div>
            <h3 class="contact-card-title">Instagram</h3>
            <p class="contact-card-value">@vaibhav_tulsian</p>
            <span class="contact-card-action">Follow <span class="arrow">→</span></span>
          </a>

        </div>
      </section>
    `;
  }

  function render404() {
    document.title = 'Page Not Found — Dev Portfolio';
    let particles404 = '';
    for (let i = 0; i < 30; i++) {
      const left = Math.random() * 100, delay = Math.random() * 5, duration = 5 + Math.random() * 10, size = 2 + Math.random() * 4;
      const color = i % 3 === 0 ? 'var(--brand-primary)' : i % 3 === 1 ? 'var(--accent-teal)' : 'var(--accent-coral)';
      particles404 += `<div class="particle" style="left:${left}%;animation-delay:${delay}s;animation-duration:${duration}s;width:${size}px;height:${size}px;background:${color};"></div>`;
    }
    app.innerHTML = `
      <section class="page-404">
        <div class="page-404-bg" aria-hidden="true">${particles404}</div>
        <div class="page-404-number" aria-hidden="true">404</div>
        <h2>Page Not Found</h2>
        <div class="page-404-links">
          <a href="#/" class="btn btn-primary" data-link>Back to Home</a>
          <a href="#/work" class="btn btn-secondary" data-link>View Projects</a>
        </div>
      </section>
    `;
    $('#site-footer').style.display = 'none';
  }

  // ── Window Resize ──────────────────────────────────────────
  function handleResize() {
    detectDevice();
    if (threeRenderer && threeCamera) {
      const heroCanvas = $('#hero-canvas');
      if (heroCanvas) {
        threeCamera.aspect = heroCanvas.offsetWidth / heroCanvas.offsetHeight;
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(heroCanvas.offsetWidth, heroCanvas.offsetHeight);
      }
    }
  }

  // ── Init ───────────────────────────────────────────────────
  function initApp() {
    detectDevice();
    initCursor();
    initMobileMenu();
    initLinkHandler();

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', debounce(handleResize, 200));
    window.addEventListener('hashchange', handleRoute);

    handleRoute();
  }

  // ── Bootstrap ──────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoading);
  } else {
    initLoading();
  }

})();
