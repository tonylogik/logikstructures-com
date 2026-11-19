/* LOGIK STRUCTURES — site script */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  const $ = (s, r) => (r || document).querySelector(s);
  const P = window.PROJECTS || [];
  const no = (i) => 'P-' + String(i + 1).padStart(2, '0');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const url = (p) => 'project-detail.html?id=' + encodeURIComponent(p.id);

  /* Mobile menu */
  const btn = $('.menu-btn'), nav = $('.nav');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? 'Close' : 'Menu';
    });
  }

  /* Live counts */
  document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = P.length; });

  /* Hero markup toggle */
  const fig = $('.fig'), figBtn = fig && $('button', fig);
  if (figBtn) {
    figBtn.addEventListener('click', () => {
      const plain = fig.classList.toggle('plain');
      figBtn.textContent = plain ? 'Show markup' : 'Hide markup';
      figBtn.setAttribute('aria-pressed', !plain);
    });
  }

  /* Home: selected work */
  const work = $('#work');
  if (work) {
    const picks = ['belfast-residence', 'animo-westside-middle-school', 'west-knoll', 'the-museum-of-neon-art', '212-eucalyptus'];
    work.innerHTML = picks.map((id) => {
      const i = P.findIndex((p) => p.id === id), p = P[i];
      if (!p) return '';
      return `<a class="card rv" href="${url(p)}">
        <div class="ph" data-no="${no(i)}"><img src="${esc(p.thumbnail)}" alt="${esc(p.name)}" loading="lazy"></div>
        <div class="meta"><h3>${esc(p.name)}</h3><span class="tag">${esc(p.categoryLabel)} · ${esc(p.location.replace(', CA', ''))}</span></div>
      </a>`;
    }).join('');
  }

  /* Projects: drawing index with live preview */
  const index = $('#index');
  if (index) {
    index.innerHTML = P.map((p, i) => `<a href="${url(p)}" data-cat="${esc(p.category)}" data-i="${i}">
      <img src="${esc(p.thumbnail)}" alt="" loading="lazy">
      <span class="n">${no(i)}</span>
      <span class="t">${esc(p.name)}<small>${esc(p.location)}${p.architect ? ' — ' + esc(p.architect) : ''}</small></span>
      <span class="tag">${esc(p.categoryLabel)}</span><i aria-hidden="true">→</i></a>`).join('');

    const pv = $('#preview'), rows = Array.from(index.children);
    const show = (a) => {
      if (!pv || !a) return;
      const p = P[+a.dataset.i];
      rows.forEach((r) => r.classList.toggle('on', r === a));
      $('img', pv).src = p.thumbnail;
      $('img', pv).alt = p.name;
      $('.cap', pv).innerHTML = `<span class="tag">${no(+a.dataset.i)} — ${esc(p.name)}</span><span class="tag">${esc(p.categoryLabel)}</span>`;
    };
    rows.forEach((a) => { a.addEventListener('mouseenter', () => show(a)); a.addEventListener('focus', () => show(a)); });

    const filters = $('#filters'), count = $('#shown');
    const cats = [['all', 'All']].concat(P.reduce((m, p) => (m.some((c) => c[0] === p.category) ? m : m.concat([[p.category, p.categoryLabel]])), []));
    filters.innerHTML = cats.map(([k, l]) => `<button type="button" data-f="${k}" aria-pressed="false">${esc(l)}<sup>${k === 'all' ? P.length : P.filter((p) => p.category === k).length}</sup></button>`).join('');
    const apply = (f) => {
      if (!cats.some((c) => c[0] === f)) f = 'all';
      filters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.f === f));
      rows.forEach((a) => { a.hidden = f !== 'all' && a.dataset.cat !== f; });
      const vis = rows.filter((a) => !a.hidden);
      if (count) count.textContent = vis.length;
      show(vis[0]);
      history.replaceState(null, '', f === 'all' ? location.pathname : '?filter=' + f);
    };
    filters.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) apply(b.dataset.f); });
    apply(new URLSearchParams(location.search).get('filter') || 'all');
  }

  /* Project detail */
  const root = $('#project');
  if (root) {
    const id = new URLSearchParams(location.search).get('id');
    const i = P.findIndex((p) => p.id === id), p = P[i];
    if (!p) {
      root.innerHTML = '<div class="page-head"><div class="wrap"><span class="tag red">Sheet not found</span><h1>That project isn\'t in the set.</h1><div class="btns"><a class="btn" href="projects.html">Back to the index <i>→</i></a></div></div></div>';
    } else {
      const prev = P[(i - 1 + P.length) % P.length], next = P[(i + 1) % P.length];
      document.title = p.name + ' — Logik Structures, Inc.';
      const sn = $('.sheet-no'); if (sn) sn.textContent = 'S-3' + String(i + 1).padStart(2, '0');
      const md = $('meta[name="description"]'); if (md) md.content = p.description.slice(0, 155);
      const spec = [['Project no.', no(i)], ['Type', p.categoryLabel], ['Location', p.location], ['Architect', p.architect], ['Year', p.year], ['Engineer', 'Logik Structures, Inc.']]
        .filter((r) => r[1]).map((r) => `<div><dt>${r[0]}</dt><dd>${esc(r[1])}</dd></div>`).join('');
      root.innerHTML = `<div class="wrap" style="padding-top:clamp(28px,5vw,56px)">
        <a class="tag" href="projects.html?filter=${esc(p.category)}" style="text-decoration:none">← Index / ${esc(p.categoryLabel)}</a>
        <h1 style="font-size:clamp(2.2rem,6vw,5rem);margin-top:14px">${esc(p.name)}</h1>
        <div class="proj-hero"><img src="${esc(p.images[0] || p.thumbnail)}" alt="${esc(p.name)}, ${esc(p.location)}"></div>
        <div class="proj-body">
          <dl class="spec">${spec}</dl>
          <div class="desc"><div class="dim"><b>Structural notes</b></div><p>${esc(p.description)}</p>
            <div class="more-img">${p.images.slice(1).map((s) => `<img src="${esc(s)}" alt="${esc(p.name)}" loading="lazy">`).join('')}</div>
            <div class="btns"><a class="btn" href="contact.html">Discuss a similar project <i>→</i></a></div>
          </div>
        </div>
        <nav class="pn" aria-label="More projects">
          <a href="${url(prev)}"><span class="tag">← Previous sheet</span><b>${esc(prev.name)}</b></a>
          <a href="${url(next)}"><span class="tag">Next sheet →</span><b>${esc(next.name)}</b></a>
        </nav></div>`;
    }
  }

  /* RFI form → opens the visitor's mail app with the request filled in */
  const form = $('#rfi');
  if (form) {
    const d = new Date();
    const stamp = $('#rfi-no');
    if (stamp) stamp.textContent = 'RFI-' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form), g = (k) => (f.get(k) || '').toString().trim();
      const body = [g('message'), '', '—'].concat(['Name: ' + g('name'), 'Email: ' + g('email'), g('phone') && 'Phone: ' + g('phone'), g('address') && 'Site: ' + g('address'), 'Scope: ' + g('scope'), 'I am: ' + g('role')].filter(Boolean)).join('\n');
      location.href = 'mailto:info@logikstructures.com?subject=' + encodeURIComponent('Project inquiry — ' + (g('scope') || 'Structural engineering') + (g('address') ? ' — ' + g('address') : '')) + '&body=' + encodeURIComponent(body);
      const note = $('#rfi-note'); if (note) note.textContent = 'Your mail app should now be open with the request filled in — press send there. If nothing opened, write to info@logikstructures.com.';
    });
  }

  /* Reveal on scroll */
  const rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rv.forEach((el) => io.observe(el));
  } else rv.forEach((el) => el.classList.add('in'));
})();
