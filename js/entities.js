/* Entities: grid + journal-style detail page (#/entities/<id>). All text comes from data/entities/*.json */
(function () {
  const e = App.esc, F = v => App.field(v);
  const cards = q => App.data.entities.filter(x => `${x.name} ${x.description} ${x.floor} ${[].concat(x.locations || []).join(' ')}`.toLowerCase().includes(q))
    .map(x => `<a class="card ecard" href="#/entities/${e(x.id)}">${App.entityImage(x)}<h2>${e(x.name)}</h2><p>${F(x.description)}</p></a>`).join('') || '<p class="muted">No matching entities.</p>';
  App.register('entities', ([id]) => {
    if (id) {
      const x = App.data.entities.find(q => q.id === id);
      if (!x) return '<section class="page"><h1>Entry not found</h1><a href="#/entities">← All entities</a></section>';
      return `<section class="page"><a href="#/entities">← All entities</a><article class="journal">
        <div class="j-head">${App.entityImage(x)}<div><p class="eyebrow">Entity file · ${e(x.id)}</p><h1>${e(x.name)}</h1>
        <p class="mono">Floor: ${F(x.floor)}<br>Locations: ${F(x.locations)}</p></div></div>
        <h3>Summary</h3><p>${F(x.description)}</p>
        <h3>Journal entry</h3><blockquote>${F(x.journalDescription)}</blockquote>
        <h3>Behavior</h3><p>${F(x.behavior)}</p>
        <h3>Warning signs</h3><p>${F(x.warningSigns)}</p>
        <h3>How to survive</h3><p>${F(x.howToSurvive)}</p></article></section>`;
    }
    App.after = () => { const i = document.getElementById('q'), r = document.getElementById('results');
      i.oninput = () => r.innerHTML = cards(i.value.toLowerCase().trim()); };
    return `<section class="page"><h1>Entities</h1>
      <input id="q" class="field" type="search" placeholder="Search entities…" aria-label="Search entities">
      <div id="results" class="cards">${cards('')}</div></section>`;
  });
})();
