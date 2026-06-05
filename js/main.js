/* ============================================================
   LOGIK STRUCTURES — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── NAV: Scroll solid + mobile toggle ─────────────────── */
  const nav = document.getElementById('site-nav');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');

  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── ACTIVE NAV LINK ────────────────────────────────────── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── SCROLL REVEAL (IntersectionObserver) ───────────────── */
  const revealTargets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger');
  if (revealTargets.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('visible'));
  }

  /* ── COUNTER ANIMATION ──────────────────────────────────── */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;

    const isInt = Number.isInteger(target);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = isInt ? Math.floor(current) + suffix : current.toFixed(1) + suffix;
    }, step);
  }

  const counters = document.querySelectorAll('[data-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterIO.observe(c));
  }

  /* ── PROJECTS: Filter (projects.html) ──────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.project-grid-card').forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('project-hidden', !show);
        });
      });
    });

    /* Pre-filter from URL param (e.g. projects.html?filter=commercial) */
    const urlFilter = new URLSearchParams(window.location.search).get('filter');
    if (urlFilter) {
      const target = document.querySelector(`.filter-btn[data-filter="${urlFilter}"]`);
      if (target) target.click();
    }
  }

  /* ── PROJECT GRID: Render from data (projects.html) ────── */
  const projectGrid = document.getElementById('project-grid');
  if (projectGrid && window.PROJECTS) {
    window.PROJECTS.forEach(p => {
      const card = document.createElement('a');
      card.className = 'project-grid-card';
      card.href = `project-detail.html?id=${p.id}`;
      card.dataset.category = p.category;
      card.innerHTML = `
        <div class="project-grid-card-img">
          <img src="${p.thumbnail}" alt="${p.name}" loading="lazy" width="400" height="300">
        </div>
        <div class="project-grid-card-body">
          <span class="project-cat-tag">${p.categoryLabel}</span>
          <h3>${p.name}</h3>
          <p class="project-meta">${p.location || ''}${p.year ? ' &nbsp;·&nbsp; ' + p.year : ''}</p>
        </div>
      `;
      projectGrid.appendChild(card);
    });
  }

  /* ── PROJECT DETAIL: Render from data (project-detail.html) */
  const detailRoot = document.getElementById('project-detail-root');
  if (detailRoot && window.PROJECTS) {
    const id = new URLSearchParams(window.location.search).get('id');
    const project = window.PROJECTS.find(p => p.id === id);

    if (project) {
      document.title = `${project.name} — Logik Structures`;

      const heroImg = document.getElementById('project-hero-img');
      if (heroImg) {
        heroImg.src = project.thumbnail;
        heroImg.alt = project.name;
      }

      const catTag = document.getElementById('project-cat-tag');
      if (catTag) catTag.textContent = project.categoryLabel;

      const nameEl = document.getElementById('project-name');
      if (nameEl) nameEl.textContent = project.name;

      const metaItems = [
        { key: 'location', label: 'Location' },
        { key: 'year', label: 'Year' },
        { key: 'architect', label: 'Architect' },
      ];
      const metaRow = document.getElementById('project-meta-row');
      if (metaRow) {
        metaItems.forEach(({ key, label }) => {
          if (project[key]) {
            const div = document.createElement('div');
            div.className = 'project-meta-item';
            div.innerHTML = `<strong>${label}</strong>${project[key]}`;
            metaRow.appendChild(div);
          }
        });
      }

      const descEl = document.getElementById('project-description');
      if (descEl) descEl.textContent = project.description;

      const gallery = document.getElementById('project-gallery');
      if (gallery && project.images && project.images.length) {
        project.images.forEach((src, i) => {
          const a = document.createElement('a');
          a.href = src;
          a.dataset.lightbox = 'gallery';
          a.dataset.index = i;
          const img = document.createElement('img');
          img.src = src;
          img.alt = `${project.name} — image ${i + 1}`;
          img.loading = 'lazy';
          img.width = 800;
          img.height = 600;
          a.appendChild(img);
          gallery.appendChild(a);
        });
        initLightbox();
      }
    } else {
      detailRoot.innerHTML = '<div class="container" style="padding:4rem 0;"><p>Project not found. <a href="projects.html" style="color:var(--accent)">View all projects →</a></p></div>';
    }
  }

  /* ── HOME: Featured projects grid ──────────────────────── */
  const featuredGrid = document.getElementById('featured-projects-grid');
  if (featuredGrid && window.PROJECTS) {
    const featured = window.PROJECTS.slice(0, 6);
    featured.forEach(p => {
      const card = document.createElement('a');
      card.className = 'project-card';
      card.href = `project-detail.html?id=${p.id}`;
      card.innerHTML = `
        <img src="${p.thumbnail}" alt="${p.name}" loading="lazy" width="400" height="300">
        <div class="project-card-always">
          <span class="project-cat-tag">${p.categoryLabel}</span>
        </div>
        <div class="project-card-overlay">
          <h3>${p.name}</h3>
          <span class="project-view-link">View Project <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
        </div>
      `;
      featuredGrid.appendChild(card);
    });
  }

  /* ── LIGHTBOX ───────────────────────────────────────────── */
  function initLightbox() {
    const overlay = document.getElementById('lightbox');
    if (!overlay) return;
    const img = overlay.querySelector('.lightbox-img');
    const close = overlay.querySelector('.lightbox-close');
    const prev = overlay.querySelector('.lightbox-prev');
    const next = overlay.querySelector('.lightbox-next');
    let images = [];
    let current = 0;

    function open(idx) {
      images = Array.from(document.querySelectorAll('[data-lightbox="gallery"]'));
      current = idx;
      img.src = images[current].href;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function goTo(idx) {
      current = (idx + images.length) % images.length;
      img.src = images[current].href;
    }

    document.querySelectorAll('[data-lightbox="gallery"]').forEach((a, i) => {
      a.addEventListener('click', e => { e.preventDefault(); open(i); });
    });

    close.addEventListener('click', () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    });
    prev.addEventListener('click', () => goTo(current - 1));
    next.addEventListener('click', () => goTo(current + 1));
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', e => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'Escape') {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── CONTACT FORM: Basic feedback ──────────────────────── */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          form.innerHTML = '<div style="text-align:center;padding:3rem 1rem;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="margin:0 auto 1rem;display:block"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><h3 style="margin-bottom:.5rem">Message sent.</h3><p>We\'ll be in touch within 24 hours.</p></div>';
        } else {
          btn.textContent = 'Try Again';
          btn.disabled = false;
        }
      } catch {
        btn.textContent = 'Try Again';
        btn.disabled = false;
      }
    });
  }

})();
