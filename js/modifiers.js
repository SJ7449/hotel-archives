/* Modifiers: filter, hover/select for details, running Knob total. Data: data/modifiers.json.
   App.modLabels / App.knobTotal are reused by the Run Customizer in Stage 4. */
(function () {
  const e = App.esc, F = v => App.field(v);
  let sel = new Set(), flt = 'all', q = '';
  App.modLabels = m => {
    const L = [], p = m.knobPercent;
    if (typeof p === 'number' && p !== 0) L.push({ t: `${p > 0 ? '+' : '-'}${Math.abs(p)}% Knobs`, c: p > 0 ? 'pos' : 'neg' });
    if (m.noProgression) L.push({ t: 'No progression', c: 'warn' });
    if (m.noRifts) L.push({ t: 'No Rift', c: 'warn' });
    if (m.noKnobs) L.push({ t: 'No Knobs', c: 'warn' });
    return L;
  };
  /* Optional "section": modifiers sharing a section are mutually exclusive (only one can be picked).
     Missing, empty, or "null" = no restriction. Reused by the Run Customizer. */
  App.modSection = m => { const s = String(m.section ?? '').trim(); return !s || s.toLowerCase() === 'null' ? null : s; };
  App.toggleMod = (set, id) => {
    if (set.has(id)) return set.delete(id);
    const m = App.data.modifiers.find(x => x.id === id), s = m && App.modSection(m);
    if (s) App.data.modifiers.forEach(x => { if (x.id !== id && App.modSection(x) === s) set.delete(x.id); });
    set.add(id);
  };
  App.knobTotal = ids => {
    const mods = ids.map(id => App.data.modifiers.find(m => m.id === id)).filter(Boolean);
    const known = mods.filter(m => typeof m.knobPercent === 'number'), mode = App.data.knobCombine;
    const t = mode === 'multiplicative' ? (known.reduce((a, m) => a * (1 + m.knobPercent / 100), 1) - 1) * 100 : known.reduce((a, m) => a + m.knobPercent, 0);
    return { total: Math.round(t * 100) / 100, unknown: mods.length - known.length, mode, noKnobs: mods.some(m => m.noKnobs) };
  };
  const tags = m => App.modLabels(m).map(l => `<span class="tag ${l.c}">${e(l.t)}</span>`).join('');
  const ok = m => ({ all: 1, pos: m.knobPercent > 0, neg: m.knobPercent < 0, prog: m.noProgression, rift: m.noRifts, knob: m.noKnobs }[flt]) &&
    `${m.name} ${m.description} ${m.changes}`.toLowerCase().includes(q);
  const detail = m => !m ? '<p class="muted">Hover or select a modifier to see its details.</p>' : `<h3>${e(m.name)}</h3><div>${tags(m)}</div>
    ${App.modSection(m) ? `<p class="mono">Section: ${e(App.modSection(m))} (only one allowed)</p>` : ''}<h4>Description</h4><p>${F(m.description)}</p><h4>What it changes</h4><p>${F(m.changes)}</p><p class="mono">Knob modifier: ${typeof m.knobPercent === 'number' ? m.knobPercent + '%' : 'unknown'}</p>`;
  const list = () => App.data.modifiers.filter(ok).map(m => `<button class="mod${sel.has(m.id) ? ' on' : ''}" data-id="${e(m.id)}" aria-pressed="${sel.has(m.id)}"${App.modSection(m) ? ` title="Section: ${e(App.modSection(m))} (one per section)"` : ''}>
    <strong>${e(m.name)}</strong><span>${tags(m)}</span></button>`).join('') || '<p class="muted">No matching modifiers.</p>';
  const bar = () => { const k = App.knobTotal([...sel]);
    return `<div class="mod-bar"><span>${sel.size} selected</span><strong>Total Knob modifier: ${k.noKnobs ? 'No Knobs' : (k.total > 0 ? '+' : '') + k.total + '%'}</strong>
    <span class="small">${k.mode} stacking${k.unknown ? ` · ${k.unknown} with unknown %` : ''}</span></div>`; };
  App.register('modifiers', () => {
    App.after = () => {
      const L = document.getElementById('list'), D = document.getElementById('detail'), B = document.getElementById('bar');
      const find = id => App.data.modifiers.find(m => m.id === id);
      const draw = () => { L.innerHTML = list(); B.innerHTML = bar(); };
      document.getElementById('q').oninput = ev => { q = ev.target.value.toLowerCase().trim(); draw(); };
      document.getElementById('flt').onclick = ev => { const b = ev.target.closest('[data-f]'); if (!b) return; flt = b.dataset.f;
        document.querySelectorAll('#flt button').forEach(x => x.classList.toggle('on', x === b)); draw(); };
      const show = ev => { const b = ev.target.closest('.mod'); if (b) D.innerHTML = detail(find(b.dataset.id)); };
      L.onmouseover = L.onfocusin = show;
      L.onclick = ev => { const b = ev.target.closest('.mod'); if (!b) return; App.toggleMod(sel, b.dataset.id); draw(); show(ev); };
      document.getElementById('clear').onclick = () => { sel.clear(); draw(); };
      draw();
    };
    const f = [['all', 'All'], ['pos', '+ Knobs'], ['neg', '- Knobs'], ['prog', 'No progression'], ['rift', 'No Rift'], ['knob', 'No Knobs']];
    return `<section class="page"><h1>Modifiers</h1><div class="filters">
      <input id="q" class="field" type="search" placeholder="Search modifiers…" aria-label="Search modifiers" value="${e(q)}">
      <button id="clear">Clear selection</button></div>
      <div id="flt" class="chips">${f.map(([k, t]) => `<button data-f="${k}" class="${k === flt ? 'on' : ''}">${t}</button>`).join('')}</div>
      <div class="mod-layout"><div id="list" class="mod-list"></div><aside id="detail" class="paper detail">${detail(null)}</aside></div>
      <div id="bar"></div></section>`;
  });
})();
