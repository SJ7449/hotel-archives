/* Badges: searchable/filterable circle grid. Data: data/badges.json */
(function () {
  const e = App.esc, F = v => App.field(v);
  const list = (q, loc, sec) => {
    const r = App.data.badges.filter(b => (!loc || b.location === loc) && (!sec || (sec === 'secret') === !!b.secret) &&
      `${b.name} ${b.description} ${b.location}`.toLowerCase().includes(q));
    return `<p class="mono">${r.length} badge(s)</p><div class="badges">` + r.map(b => `<article class="badge">${App.badgeIcon(b)}
      <div><h3>${e(b.name)}${b.secret ? ' <span class="tag">secret</span>' : ''}</h3><p>${F(b.description)}</p>
      <p class="mono">Location: ${F(b.location)}</p>${b.notes ? `<p class="small">${e(b.notes)}</p>` : ''}</div></article>`).join('') + '</div>';
  };
  App.register('badges', () => {
    const locs = [...new Set(App.data.badges.map(b => b.location).filter(Boolean))].sort();
    App.after = () => { const q = document.getElementById('q'), l = document.getElementById('loc'), s = document.getElementById('sec'), r = document.getElementById('results');
      const go = () => r.innerHTML = list(q.value.toLowerCase().trim(), l.value, s.value); q.oninput = l.onchange = s.onchange = go; go(); };
    return `<section class="page"><h1>Badges</h1><div class="filters">
      <input id="q" class="field" type="search" placeholder="Search badges…" aria-label="Search badges">
      <select id="loc" class="field" aria-label="Location"><option value="">All locations</option>${locs.map(l => `<option>${e(l)}</option>`).join('')}</select>
      <select id="sec" class="field" aria-label="Type"><option value="">All badges</option><option value="secret">Secret only</option><option value="normal">Non-secret only</option></select></div>
      <div id="results"></div></section>`;
  });
})();
