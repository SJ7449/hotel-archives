/* Main navigation. Edit Nav.items to rename/reorder. New sections need approval first. */
const Nav = {
  items: [
    { key: 'shop', label: 'Shop', icon: '🛎' },
    { key: 'badges', label: 'Badges', icon: '🏅' },
    { key: 'entities', label: 'Entities', icon: '👁' },
    { key: 'legacy-shop', label: 'Legacy Shop', icon: '📜' },
    { key: 'modifiers', label: 'Modifiers', icon: '⚙' },
    { key: 'customizer', label: 'Run Customizer', icon: '🗝' }
  ],
  build() {
    const nav = document.getElementById('nav'), t = document.getElementById('navtoggle');
    nav.innerHTML = this.items.map(n => `<a href="#/${n.key}" data-key="${n.key}">${n.label}</a>`).join('');
    t.onclick = () => t.setAttribute('aria-expanded', document.body.classList.toggle('nav-open'));
    nav.onclick = () => { document.body.classList.remove('nav-open'); t.setAttribute('aria-expanded', false); };
  },
  update(key) { document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.dataset.key === key)); }
};
