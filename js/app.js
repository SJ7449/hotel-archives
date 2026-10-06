/* Core: data loading, hash router, home page. Facts live in /data, never here. */
const App = {
  data: {}, routes: {}, timers: [],
  register(key, fn) { this.routes[key] = fn; },
  esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
  /* Images: missing files fall back to a placeholder automatically. Convention: assets/entities/<id>.png, assets/badges/<id>.png */
  PH: "data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='#3b2515'/><rect x='30' y='18' width='40' height='64' rx='3' fill='none' stroke='#c9a24b' stroke-width='3'/><circle cx='61' cy='52' r='3' fill='#c9a24b'/><text x='50' y='94' font-size='9' text-anchor='middle' fill='#c9a24b' font-family='monospace'>NO IMAGE</text></svg>"),
  img(src, cls = '') { return `<img class="${cls}" src="${this.esc(src)}" alt="" loading="lazy" onerror="this.onerror=null;this.src=App.PH">`; },
  entityImage(e) { return this.img(e.image || `assets/entities/${e.id}.png`, 'entity-img'); },
  /* Badges are shown as circles; any image is auto-cropped to a centered circle by CSS. Secret badges get a dotted ring. */
  badgeIcon(b) { return `<span class="badge-ring${b.secret ? ' secret' : ''}">${this.img(b.image || `assets/badges/${b.id}.png`, 'badge-img')}</span>`; },
  field(v) { const s = Array.isArray(v) ? v.join(', ') : v; return s && String(s).trim() ? this.esc(s) : '<span class="missing">[NOT YET DOCUMENTED]</span>'; },
  pick(a) { return a.length ? a[Math.floor(Math.random() * a.length)] : null; },

  async get(path) {
    if (window.__ARCHIVE_DATA__) return window.__ARCHIVE_DATA__[path] ?? null; // bundled preview only
    try { const r = await fetch(path); if (!r.ok) throw 0; return await r.json(); }
    catch (e) { console.warn('Missing data file:', path); return null; }
  },
  async load() {
    const d = this.data, g = p => this.get(p);
    d.site = await g('data/site.json') || {};
    const idx = await g('data/entities/index.json') || { files: [] };
    d.entities = (await Promise.all(idx.files.map(f => g('data/entities/' + f)))).filter(Boolean);
    d.badges = (await g('data/badges.json'))?.badges || [];
    const mj = await g('data/modifiers.json') || {};
    d.modifiers = mj.modifiers || []; d.knobCombine = mj.knobCombine || 'additive';
    d.shops = await g('data/shops.json') || {};
    d.legacy = (await g('data/legacy-shops.json'))?.shops || [];
    d.presets = (await g('data/presets.json'))?.presets || [];
  },

  /* Placeholder page used until a section is built in a later stage */
  stub(route, title, stage, count, blurb) {
    this.register(route, () => `<section class="page"><h1>${title}</h1>
      <div class="paper"><p class="stamp">Under construction — Stage ${stage}</p>
      <p>${this.esc(blurb)}</p><p class="mono">Records loaded from /data: ${count()}</p></div></section>`);
  },

  countdowns() {
    const els = document.querySelectorAll('[data-countdown]'); if (!els.length) return;
    const t = Date.parse(this.data.shops?.meta?.nextRefresh || '');
    const tick = () => els.forEach(el => {
      if (isNaN(t)) { el.textContent = 'Refresh time not set'; return; }
      const s = Math.floor((t - Date.now()) / 1000);
      if (s <= 0) { el.textContent = 'Refresh due'; return; }
      const p = n => String(n).padStart(2, '0');
      el.textContent = `${p(Math.floor(s / 3600))}:${p(Math.floor(s % 3600 / 60))}:${p(s % 60)}`;
    });
    tick(); this.timers.push(setInterval(tick, 1000));
  },

  render() {
    this.timers.forEach(clearInterval); this.timers = []; this.after = null;
    const [key = '', ...rest] = location.hash.replace(/^#\/?/, '').split('/');
    const fn = this.routes[key] || this.routes['404'];
    document.getElementById('app').innerHTML = fn(rest);
    if (this.after) this.after();
    this.countdowns(); Nav.update(key); window.scrollTo(0, 0);
  },

  async boot() {
    await this.load();
    document.getElementById('disclaimer').textContent = this.data.site.disclaimer || '';
    Nav.build();
    window.addEventListener('hashchange', () => this.render());
    document.addEventListener('click', e => { if (e.target.closest('[data-reroll]')) this.render(); });
    this.render();
  }
};

/* ---------- Home ---------- */
App.register('', () => {
  const d = App.data, e = App.esc, site = d.site;
  const ent = App.pick(d.entities), ch = App.pick(d.presets);
  const feat = (d.shops.featured || [])[0], daily = d.shops.daily || [];
  const cards = Nav.items.map(n => `<a class="card" href="#/${n.key}">
      <span class="card-icon" aria-hidden="true">${n.icon}</span><h2>${n.label.toUpperCase()}</h2>
      <p>${e(site.blurbs?.[n.key] || '')}</p></a>`).join('');
  return `<section class="hero"><div class="hero-inner">
      <p class="eyebrow">Room 000 · Archive Terminal</p>
      <h1>${e(site.title || 'THE HOTEL ARCHIVES')}</h1>
      <p class="tagline">${e(site.tagline || '')}</p></div></section>
    <section class="cards" aria-label="Sections">${cards}</section>
    <section class="panels" aria-label="Today">
      <article class="panel"><h3>Current Shop</h3>
        <p class="big mono" data-countdown></p><p class="small">until next refresh</p>
        <p>${daily.length} daily item(s) listed</p><a href="#/shop">Open shop →</a></article>
      <article class="panel"><h3>Featured Item</h3>
        ${feat ? `<p class="big">${e(feat.name)}</p><p>${e(feat.price ?? '')}</p>` : '<p class="muted">No featured item set.</p>'}</article>
      <article class="panel"><h3>Random Entity</h3>
        ${ent ? `<p class="big">${e(ent.name)}</p><p class="muted">${e(ent.description || '')}</p>` : '<p class="muted">No entities yet.</p>'}
        <button data-reroll>Reroll</button></article>
      <article class="panel"><h3>Random Challenge</h3>
        ${ch ? `<p class="big">${e(ch.name)}</p><p class="muted">${e(ch.description || '')}</p>` : '<p class="muted">No presets yet.</p>'}
        <button data-reroll>Reroll</button></article>
    </section>`;
});
App.register('404', () => `<section class="page"><h1>Door not found</h1><p><a href="#/">Return to the lobby</a></p></section>`);

document.addEventListener('DOMContentLoaded', () => App.boot());
