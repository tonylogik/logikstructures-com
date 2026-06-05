/**
 * Logik Structures — Visual Effects Module
 * Handles: page transitions, 3D card tilt, shimmer text injection
 */
(function () {
  'use strict';

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = 'ontouchstart' in window;

  /* ── PAGE TRANSITION ──────────────────────────────────────── */

  function initPageTransitions() {
    if (REDUCED_MOTION) return;

    // Fade in on page load
    document.body.classList.add('page-loading');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.remove('page-loading');
      });
    });

    // Intercept same-origin link clicks
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;

      var href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#')) return;
      if (href.startsWith('javascript')) return;
      if (href.startsWith('mailto') || href.startsWith('tel')) return;
      if (a.target === '_blank') return;
      if (a.hasAttribute('download')) return;
      // Skip truly external links (URL parse handles file://, protocol-relative, etc.)
      try {
        var url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
      } catch (_) { return; }

      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      document.body.classList.add('is-exiting');
      setTimeout(function () {
        window.location.href = href;
      }, 280);
    });
  }

  /* ── 3D CARD TILT ─────────────────────────────────────────── */

  function initCardTilt() {
    if (IS_TOUCH || REDUCED_MOTION) return;

    var cards = document.querySelectorAll('.project-card, .project-grid-card');

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) / (rect.width / 2);   // -1 to 1
        var dy = (e.clientY - cy) / (rect.height / 2);  // -1 to 1
        var tiltX = dy * -8;   // rotateX (tilt forward/back)
        var tiltY = dx * 8;    // rotateY (tilt left/right)
        card.style.transform = 'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  /* ── SHIMMER TEXT INJECTION ───────────────────────────────── */

  function initShimmerText() {
    if (REDUCED_MOTION) return;

    // Target hero headings and display text — skip nav logo and footer
    var targets = document.querySelectorAll(
      'h1:not(.nav-logo h1):not(.nav-logo-text):not(footer h1), ' +
      '.display, ' +
      '.hero-title'
    );

    targets.forEach(function (el) {
      el.classList.add('shimmer-text');
    });
  }

  /* ── INIT ─────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    initPageTransitions();
    initCardTilt();
    initShimmerText();
  });

}());
