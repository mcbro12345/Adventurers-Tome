// ================= Layout editor v2: modules on a 12-column grid =================
// Until someone changes something in Edit layout, every tab renders exactly as it always has. The first change turns
// the whole sheet into a grid layout: each panel ("module") gets a place and a size on a 12-column grid, tabs can hold
// any module, modules can be removed (they go back to the Add-module library) and custom tabs can be added.
// S.layout.grid = { tabKey: [{ id, x, y, w, h }] }   x/w in columns (0-11, 1-12), y/h in grid rows
// S.layout.removed = [ids]   modules taken off the sheet (still listed under Add module)
// S.layout.ctabs = [{ key, name, icon }]   custom tabs
const GCOLS = 12, GGAP = 14;
const MODNAMES = Object.assign({ spslots: 'Spell slots (Spells tab)', spfx: 'Active spells (Spells tab)' }, PNAMES, { metamagic: 'Metamagic', mmspells: 'Metamagic (Spells tab)', infhead: 'Infusions overview', infknown: 'Known infusions', infactive: 'Active infusions' });
const MODMIN = { economy: 6, inventory: 6, spelllist: 6, turnbar: 6, oocmain: 6, featlist: 4, companions: 4 };
const modName = id => MODNAMES[id] || id;
const modMinW = id => MODMIN[id] || 3;
const SIZES = [[3, 'Small', '¼'], [4, 'Medium', '⅓'], [6, 'Half', '½'], [8, 'Large', '⅔'], [9, 'Wide', '¾'], [12, 'Full width', '1']];
const isGridLayout = () => !!(S.layout && S.layout.grid);
const gridTab = k => !!(S.layout && S.layout.grid && S.layout.grid[k]);
// Tabs a module can be sent to: never the Party tab, and not a tab that's hidden (it would vanish with it).
const modTabs = () => tabOrder().filter(([k]) => k !== 'party' && !tabHidden(k));
// Every grid item kept inside the 12 columns, with sane sizes (whatever an old save or a stray drag left).
function gSane(items) { (items || []).forEach(i => { const mn = Math.min(GCOLS, modMinW(i.id)); i.w = Math.max(mn, Math.min(GCOLS, Math.round(N(i.w)) || GCOLS)); i.x = Math.max(0, Math.min(GCOLS - i.w, Math.round(N(i.x)) || 0)); i.y = Math.max(0, Math.round(N(i.y)) || 0); i.h = Math.max(1, Math.min(4, Math.round(N(i.h)) || 1)); }); return items; }
const ctabs = () => ((S.layout && S.layout.ctabs) || []);
const isCustomTab = k => ctabs().some(t => t.key === k);

// ---------- Geometry helpers ----------
const gOverlap = (a, b) => a !== b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
// Push anything that collides with `it` downward, then pull everything up as far as it goes (no holes).
function gResolve(items, it) {
  const moved = new Set([it]);
  const push = a => items.filter(b => b !== a && gOverlap(a, b)).sort((p, q) => p.y - q.y).forEach(b => { b.y = a.y + a.h; push(b); });
  if (it) push(it);
  return gCompact(items, it);
}
function gCompact(items, keep) {
  const sorted = items.slice().sort((a, b) => a.y - b.y || a.x - b.x);
  sorted.forEach(a => { if (a === keep) return; while (a.y > 0) { a.y--; if (items.some(b => gOverlap(a, b))) { a.y++; break; } } });
  if (keep) { // the dragged item stays where it was dropped unless that leaves a hole above it
    while (keep.y > 0) { keep.y--; if (items.some(b => gOverlap(keep, b))) { keep.y++; break; } }
    items.filter(b => gOverlap(keep, b)).forEach(b => { b.y = keep.y + keep.h; });
    if (items.some(a => items.some(b => gOverlap(a, b)))) return gCompact(items, null);
  }
  return items;
}
const gClone = a => a.map(x => Object.assign({}, x));

// ---------- Measuring the current (classic) layout ----------
function topPids(page) { return $$('[data-pid]', page).filter(el => !el.parentElement.closest('[data-pid]')); }
function measurePage(pg) {
  const page = $('#page-' + pg); if (!page) return [];
  const was = page.classList.contains('on'); if (!was) page.classList.add('gmeasure');
  const pr = page.getBoundingClientRect(), colW = (pr.width + GGAP) / GCOLS;
  const els = topPids(page).filter(el => el.offsetParent && !el.classList.contains('phid'));
  const boxes = els.map(el => { const r = el.getBoundingClientRect(); return { id: el.dataset.pid, l: r.left - pr.left, t: r.top - pr.top, w: r.width, b: r.bottom - pr.top }; });
  if (!was) page.classList.remove('gmeasure');
  const tops = []; boxes.slice().sort((a, b) => a.t - b.t).forEach(bx => { if (!tops.some(t => Math.abs(t - bx.t) < 12)) tops.push(bx.t); });
  tops.sort((a, b) => a - b);
  const items = boxes.map(bx => {
    const x = Math.max(0, Math.min(GCOLS - 1, Math.round(bx.l / colW))), w = Math.max(1, Math.min(GCOLS - x, Math.round((bx.w + GGAP) / colW)));
    const y = tops.findIndex(t => Math.abs(t - bx.t) < 12), h = Math.max(1, tops.filter(t => t >= bx.t - 12 && t < bx.b - 20).length);
    return { id: bx.id, x, y: Math.max(0, y), w, h };
  });
  // Hidden-by-default modules that live here keep a spot at the bottom (in case they appear later).
  return gCompact(items, null);
}
// The first real change converts every tab (built-in and custom) into the grid model.
// Only the tabs being changed are converted (each measured as it looks right now); the other tabs keep their own
// arrangement, so a change made in a narrow window doesn't squeeze every other tab into that shape.
function ensureGrid(pgs) {
  const L = LY(), grid = L.grid = L.grid || {}; let did = false;
  (pgs || []).filter(k => k && k !== 'party' && !grid[k] && $('#page-' + k)).forEach(k => {
    const items = measurePage(k), placed = new Set(Object.values(grid).flat().concat(items).map(i => i.id));
    // Modules of this tab that are hidden right now (combat-only panels…) keep a spot at its bottom; ones the old editor hid are removed.
    $$(`#page-${k} [data-pid]`).forEach(el => { const id = el.dataset.pid; if (el.parentElement.closest('[data-pid]') || placed.has(id)) return; placed.add(id);
      if ((L.hidden || []).includes(id)) { L.removed = [...new Set((L.removed || []).concat([id]))]; return; }
      items.push({ id, x: 0, y: items.reduce((m, i) => Math.max(m, i.y + i.h), 0), w: GCOLS, h: 1 }); });
    items.forEach(i => { const el = $(`.page [data-pid="${i.id}"]`); if (el) i.home = el.dataset.home; });
    grid[k] = gSane(items); if (L.pages) delete L.pages[k]; did = true; });
  return did;
}
// the tab a module is on right now (its grid tab, or the page it sits on)
function modPageOf(id) { const [pg] = gFind(id); if (pg) return pg; const el = $(`.page [data-pid="${id}"]`), p = el && el.closest('.page'); return p ? p.id.replace('page-', '') : null; }

// ---------- Rendering the grid ----------
// Placement: every module in L.grid shows on that tab; modules that appear later (a new class feature…) and were never
// placed go to the bottom of their home tab; removed ones stay off the sheet.
function gridApply(by) {
  const L = S.layout, grid = L.grid;
  // (the Party tab is always its own page: anything a saved layout put there goes back home)
  if (grid.party) delete grid.party;
  Object.values(grid).forEach(gSane);
  const removed = new Set(L.removed || []), placed = new Set(Object.values(grid).flat().map(i => i.id));
  Object.values(grid).flat().forEach(i => { if (!i.home && by[i.id]) i.home = by[i.id][0].dataset.home; });
  // The Spells tab's Spell Slots and Active Spells panels (same look as Combat) start at the top of a saved grid, side by side.
  if (grid.spells) { const need = ['spslots', 'spfx'].filter(id => by[id] && !placed.has(id) && !removed.has(id));
    if (need.length) { const sc = grid.spells.find(i => i.id === 'spellcasting'), y0 = sc ? sc.y : 0, ws = Math.round(GCOLS / 3); grid.spells.forEach(i => { if (i.y >= y0) i.y += 1; });
      need.forEach(id => { grid.spells.push(id === 'spslots' ? { id, x: 0, y: y0, w: ws, h: 1 } : { id, x: need.length === 2 ? ws : 0, y: y0, w: need.length === 2 ? GCOLS - ws : GCOLS, h: 1 }); placed.add(id); }); } }
  // Spellcasting (now a small panel) moves once between Spell Slots and Active Spells when they share a row.
  if (grid.spells && !L.scMid) { L.scMid = 1; const g = grid.spells, sl = g.find(i => i.id === 'spslots'), fx = g.find(i => i.id === 'spfx'), sc = g.find(i => i.id === 'spellcasting');
    if (sl && fx && sc && sl.y === fx.y && sc.w >= GCOLS - 1) { const y0 = sl.y, h = Math.max(sl.h, fx.h); g.forEach(i => { if (i !== sc && i.y > sc.y) i.y -= sc.h; });
      Object.assign(sl, { x: 0, w: 4 }); Object.assign(sc, { x: 4, y: y0, w: 3, h }); Object.assign(fx, { x: 7, w: 5 }); } }
  Object.keys(by).forEach(id => { if (placed.has(id) || removed.has(id)) return; const home = by[id][0].dataset.home, pg = grid[home] ? home : null; if (!pg) return;
    grid[pg].push({ id, x: 0, y: grid[pg].reduce((m, i) => Math.max(m, i.y + i.h), 0), w: GCOLS, h: 1 }); placed.add(id); });
  const mob = isMobile(), ed = !!UI.editLayout;
  Object.keys(grid).forEach(pg => {
    const page = $('#page-' + pg); if (!page) return;
    const box = document.createElement('div'); box.className = 'gridl'; box.dataset.pg = pg;
    // Only modules that are actually showing take room; the rest are squeezed out so nothing leaves a hole.
    const shown = grid[pg].filter(i => by[i.id] && !removed.has(i.id) && (ed || !panelHidden(i.id)));
    const live = gCompact(gClone(shown), null);
    live.sort((a, b) => a.y - b.y || a.x - b.x).forEach(i => {
      const el = by[i.id][0]; el.dataset.gx = i.x; el.dataset.gy = i.y; el.dataset.gw = i.w; el.dataset.gh = i.h;
      if (!mob) { el.style.gridColumn = `${i.x + 1} / span ${i.w}`; el.style.gridRow = `${i.y + 1} / span ${i.h}`; } else { el.style.gridColumn = ''; el.style.gridRow = ''; }
      box.appendChild(el);
    });
    [...page.children].forEach(c => c.remove());
    page.appendChild(box);
    if (ed && !mob && !live.length) box.innerHTML = `<div class="gempty"><b>This tab is empty</b><span>Use <b>+ Add module</b> below, or drag a module onto this tab's name.</span></div>`;
  });
  // Modules that ended up nowhere (removed, or homed on a tab that's gone) are taken out of the page.
  Object.keys(by).forEach(id => { const el = by[id][0], p = el.closest('.page'), pk = p && p.id.replace('page-', ''); if (!el.closest('.gridl') && (removed.has(id) || (pk && grid[pk]))) el.remove(); });
  // a custom tab with nothing on it says so (outside Edit layout too)
  Object.keys(grid).forEach(pg => { const page = $('#page-' + pg), box = page && page.querySelector(':scope > .gridl'); if (box && !ed && !box.children.length && isCustomTab(pg)) box.innerHTML = `<div class="gempty"><b>This tab is empty</b><span>Open <b>Edit layout</b> to add modules to it.</span></div>`; });
}

// ---------- Edit mode: module bars, resize handles, editor bar ----------
let LSNAP = null; // the layout when Edit layout was opened (Cancel restores it)
// (kept in this browser per character, so Cancel still works after a reload mid-edit; a sheet with no snapshot isn't
// left in edit mode — edit mode doesn't carry over from another character)
const lsnapKey = () => 'dnd-lsnap:' + (S && S.id || '');
function lsnapKeep() { try { if (LSNAP == null) localStorage.removeItem(lsnapKey()); else localStorage.setItem(lsnapKey(), LSNAP); } catch (e) {} }
function editRestore() {
  if (!UI.editLayout || LSNAP != null) return;
  let v = null; try { v = localStorage.getItem(lsnapKey()); } catch (e) {}
  if (v != null) LSNAP = v; else { UI.editLayout = false; saveUI(); }
}
function editDecorate() {
  const ed = !!UI.editLayout && !isMobile();
  $$('.page [data-pid]').forEach(el => {
    $$(':scope > .modbar, :scope > .mresize', el).forEach(x => x.remove()); el.classList.remove('emod');
    if (!ed || el.parentElement.closest('[data-pid]')) return;
    el.classList.add('emod');
    const id = el.dataset.pid, w = N(el.dataset.gw) || 0, auto = panelAutoHidden(id) && panelHidden(id);
    const bar = document.createElement('div'); bar.className = 'modbar';
    bar.innerHTML = `<span class="mgrip" data-mgrip="${id}" title="Drag to move — drop on a tab name to send it there">⠿ ${esc(modName(id))}</span>${auto ? '<span class="hidtag" title="Not used by this character right now — it shows up when it applies">auto-hidden</span>' : ''}<span class="grow"></span>
      <div class="menu msize"><button class="mbtn" data-act="menu" aria-haspopup="true" title="Size">⤢ ${w ? (SIZES.find(s => s[0] === w) || [0, 0, w + '/12'])[2] : 'Size'}</button><div class="menu-list">
        <div class="mlabel">Width</div>${SIZES.filter(s => s[0] >= modMinW(id)).map(([n, t, g]) => `<button data-act="msize" data-p="${id}" data-w="${n}" class="${w === n ? 'on' : ''}"><span class="szg" style="--n:${n}"></span>${t} <span class="hint">${g}</span></button>`).join('')}
        <div class="mlabel">Height</div>${[[1, 'Normal'], [2, 'Tall (2 rows)'], [3, 'Taller (3 rows)'], [4, 'Tallest (4 rows)']].map(([h, t]) => `<button data-act="msize" data-p="${id}" data-h="${h}" class="${(N(el.dataset.gh) || 1) === h ? 'on' : ''}">${t}</button>`).join('')}
      </div></div>
      <div class="menu"><button class="mbtn" data-act="menu" aria-haspopup="true" title="Move to another tab">⇄</button><div class="menu-list"><div class="mlabel">Move to tab</div>${modTabs().filter(([k]) => k !== pageOf(el)).map(([k]) => `<button data-act="mto" data-p="${id}" data-pg="${k}">${esc(tabLabel(k))}</button>`).join('')}</div></div>
      <button class="mbtn mx" data-act="mremove" data-p="${id}" title="Remove from the sheet (add it back with + Add module)">✕</button>`;
    el.prepend(bar);
    const rz = document.createElement('div'); rz.className = 'mresize'; rz.dataset.mresize = id; rz.title = 'Drag to resize'; el.appendChild(rz);
  });
  let eb = $('#editbar');
  if (ed) {
    if (!eb) { eb = document.createElement('div'); eb.id = 'editbar'; document.body.appendChild(eb); }
    const lib = modLibrary();
    eb.innerHTML = `<div class="eb-text"><b>Editing layout</b><span>Drag a module by its name to move it, or drag its corner to resize. Drop it on a tab name to send it there.</span></div>
      <div class="eb-ctl"><button class="btn sm" data-act="maddopen">+ Add module${lib.length ? ` <span class="ebn">${lib.length}</span>` : ''}</button><button class="btn sm" data-act="ctabadd">+ New tab</button>
        <div class="menu ebmore"><button class="btn sm ghost" data-act="menu" aria-haspopup="true">Reset ▾</button><div class="menu-list"><button data-act="greset" data-pg="${UI.tab}">Reset this tab</button><button data-act="gresetall">Reset everything to default</button></div></div>
        <button class="btn sm ghost" data-act="ecancel">Cancel</button><button class="btn sm gold" data-act="edone">Done</button></div>`;
  } else if (eb) eb.remove();
  document.body.classList.toggle('editing', ed);
}
function editEndDrags() { if (GD) gEnd(true); if (typeof PD !== 'undefined' && PD) { if (PD.ghost) PD.ghost.remove(); PD.item.classList.remove('dragging'); PD = null; dropClear(); document.body.classList.remove('dragging-any'); } }
function editToggle() { editEndDrags();
  if (!UI.editLayout) { LSNAP = JSON.stringify(S.layout || {}); UI.editLayout = true; }
  else { UI.editLayout = false; LSNAP = null; }
  lsnapKeep(); saveUI(); pendingLabel = null; render();
}
function editCancel() { editEndDrags();
  if (LSNAP != null && LSNAP !== JSON.stringify(S.layout || {})) { S.layout = JSON.parse(LSNAP); pendingLabel = 'Cancel layout changes'; save(); }
  UI.editLayout = false; LSNAP = null; lsnapKeep(); saveUI(); render();
}
// The window narrowed into the phone layout (no layout editing there): editing ends, keeping what was done (Undo
// still takes it back).
function editEndForPhone() { if (!UI.editLayout) return; editEndDrags(); UI.editLayout = false; LSNAP = null; lsnapKeep(); saveUI(); }
// Modules taken off the sheet (Add module lists them). The old editor's "hidden" panels count too.
const modRemoved = () => [...new Set(((S.layout && S.layout.removed) || []).concat((S.layout && !S.layout.grid && S.layout.hidden) || []))];
function modLibrary() { return modRemoved().filter(id => !panelAutoHidden(id)); }
function modLibraryAll() {
  const out = [], seen = new Set(), removed = new Set(modRemoved());
  $$('.page [data-pid]').forEach(el => { const id = el.dataset.pid; if (seen.has(id) || el.parentElement.closest('[data-pid]')) return; seen.add(id); out.push({ id, on: removed.has(id) ? '' : pageOf(el), removed: removed.has(id), auto: panelAutoHidden(id) }); });
  removed.forEach(id => { if (!seen.has(id)) out.push({ id, on: '', removed: true, auto: false }); });
  return out.filter(m => !m.auto);
}
let MODLIB = {};
function modAddOpen() {
  const all = modLibraryAll(), off = all.filter(m => m.removed), here = UI.tab, others = all.filter(m => !m.removed && m.on && m.on !== here && !m.auto);
  openModal(`<h3>Add a module to ${esc(tabLabel(here))}</h3><p class="hint" style="margin:0 0 10px">Modules are the panels of the sheet. Only the ones that make sense for this character are listed.</p>
    <div class="lbl">Not on the sheet</div><div class="modlib">${off.length ? off.map(m => `<button class="modcard" data-act="madd" data-p="${m.id}"><b>${esc(modName(m.id))}</b><span>Add to this tab</span></button>`).join('') : '<p class="hint" style="margin:4px 0">Every module is already on a tab. Removing one (its ✕) puts it back here.</p>'}</div>
    ${others.length ? `<div class="lbl" style="margin-top:10px">On other tabs — move here</div><div class="modlib">${others.map(m => `<button class="modcard" data-act="madd" data-p="${m.id}"><b>${esc(modName(m.id))}</b><span>On ${esc(tabLabel(m.on))}</span></button>`).join('')}</div>` : ''}
    <div class="actions"><button class="btn" data-act="close">Close</button></div>`, null, true);
}

// ---------- Layout changes ----------
const gItems = pg => (LY().grid[pg] = LY().grid[pg] || []);
function gFind(id) { const G = LY().grid || {}; for (const pg of Object.keys(G)) { const it = G[pg].find(i => i.id === id); if (it) return [pg, it]; } return [null, null]; }
function gChanged(label) { pendingLabel = label; save(); render(); }
function modAdd(id, pg) {
  pg = pg || UI.tab; if (pg === 'party') return;
  ensureGrid([modPageOf(id), pg]); const L = LY();
  const [from, it] = gFind(id); if (from) L.grid[from] = L.grid[from].filter(i => i !== it);
  L.removed = (L.removed || []).filter(x => x !== id);
  const a = gItems(pg), w = it ? Math.max(it.w, modMinW(id)) : GCOLS;
  a.push({ id, home: it && it.home, x: 0, y: a.reduce((m, i) => Math.max(m, i.y + i.h), 0), w, h: it ? it.h : 1 }); gCompact(a, null);
  closeModal(true); gChanged(`Add ${modName(id)} to ${tabLabel(pg)}`);
  setTimeout(() => { const el = $(`.page [data-pid="${id}"]`); if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.classList.add('mflash'); setTimeout(() => el.classList.remove('mflash'), 1200); } }, 60);
}
function modRemove(id) {
  ensureGrid([modPageOf(id)]); const L = LY(), [pg, it] = gFind(id); if (pg) { L.grid[pg] = L.grid[pg].filter(i => i !== it); gCompact(L.grid[pg], null); }
  L.removed = [...new Set((L.removed || []).concat([id]))];
  gChanged('Remove ' + modName(id));
  toast(`<b>${esc(modName(id))}</b> removed. Add it back any time with <b>+ Add module</b>.`, '', 5000, { label: 'Undo', fn: () => undo(1) });
}
function modSize(id, w, h) {
  ensureGrid([modPageOf(id)]); const [pg, it] = gFind(id); if (!it) return;
  if (w) { it.w = Math.max(modMinW(id), Math.min(GCOLS, w)); if (it.x + it.w > GCOLS) it.x = GCOLS - it.w; }
  if (h) it.h = h;
  gResolve(LY().grid[pg], it); gChanged('Resize ' + modName(id));
}
function modTo(id, pg) { modAdd(id, pg); toast(`${esc(modName(id))} moved to ${esc(tabLabel(pg))}.`, '', 4000, [{ label: 'Go there', fn: () => { UI.tab = pg; saveUI(); render(); } }, { label: 'Undo', fn: () => undo(1) }]); }
function gridReset(pg) {
  const L = LY(); if (!L.grid) return;
  if (isCustomTab(pg)) { (L.grid[pg] || []).forEach(i => { L.removed = (L.removed || []).filter(x => x !== i.id); }); L.grid[pg] = []; return gChanged('Clear ' + tabLabel(pg)); }
  // Draw the sheet once with no layout at all: that shows this tab's own modules (removed ones included) where they
  // belong by default, and every module's home tab. Then the saved layout comes back with this tab replaced.
  const keepL = JSON.stringify(L), removed0 = (L.removed || []).slice(); S.layout = { tabs: L.tabs, tabNames: L.tabNames, hiddenTabs: L.hiddenTabs, shownTabs: L.shownTabs, ctabs: L.ctabs };
  render(); const homes = {}; $$('.page [data-pid]').forEach(e => { if (!e.parentElement.closest('[data-pid]')) homes[e.dataset.pid] = e.dataset.home; });
  const fresh = measurePage(pg), mine = Object.keys(homes).filter(id => homes[id] === pg);
  $$(`#page-${pg} [data-pid]`).forEach(el => { const id = el.dataset.pid; if (el.parentElement.closest('[data-pid]') || fresh.some(i => i.id === id)) return; fresh.push({ id, x: 0, y: fresh.reduce((m, i) => Math.max(m, i.y + i.h), 0), w: GCOLS, h: 1 }); });
  fresh.forEach(i => { i.home = pg; });
  S.layout = JSON.parse(keepL); const L2 = S.layout;
  const strangers = (L2.grid[pg] || []).filter(i => !mine.includes(i.id) && !fresh.some(f => f.id === i.id));
  Object.keys(L2.grid).forEach(k => { if (k !== pg) L2.grid[k] = L2.grid[k].filter(i => !mine.includes(i.id) && !fresh.some(f => f.id === i.id)); });
  L2.removed = removed0.filter(x => !mine.includes(x) && !fresh.some(f => f.id === x));
  L2.grid[pg] = gSane(fresh);
  // whatever else was moved here goes back to its own tab (or, if that tab still has its own layout, simply home)
  strangers.forEach(i => { const home = homes[i.id] || i.home; if (home && home !== pg && L2.grid[home]) { const a = L2.grid[home]; a.push({ id: i.id, home, x: 0, y: a.reduce((m, j) => Math.max(m, j.y + j.h), 0), w: i.w, h: i.h }); } });
  gChanged('Reset ' + tabLabel(pg) + ' layout');
}
function gridResetAll() {
  const keep = { tabNames: undefined };
  S.layout = {}; pendingLabel = 'Reset layout to default'; save(); render();
  toast('Layout reset to the default.', '', 5000, { label: 'Undo', fn: () => undo(1) });
}
// ---------- Custom tabs ----------
const CTAB_ICONS = ['★', '⚑', '♦', '☾', '☀', '⚙', '✎', '❖', '⚔', '✦'];
function ctabAdd() {
  openModal(`<h3>New tab</h3>${fld('Name', '<input class="f" id="ctabName" maxlength="30" placeholder="e.g. Session, Downtime, Quick ref" autofocus>')}
    <div class="lbl" style="margin-top:8px">Icon</div><div class="spcat-icons">${CTAB_ICONS.map((x, k) => `<button class="spcat-ic${k ? '' : ' on'}" data-ctic="${x}">${x}</button>`).join('')}</div>
    <p class="hint">The new tab starts empty — add modules to it from <b>+ Add module</b>, or drag one onto its name.</p>
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="ctabaddok">Add tab</button></div>`);
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ctic]'); if (!b) return; $$('[data-ctic]').forEach(x => x.classList.toggle('on', x === b)); });
function ctabAddOK() {
  ensureGrid([]); const L = LY(), name = ($('#ctabName').value || '').trim().slice(0, 30) || 'New tab', icon = ($('[data-ctic].on') || {}).dataset ? $('[data-ctic].on').dataset.ctic : '★';
  const key = 'c' + uid().slice(0, 6); L.ctabs = ctabs().concat([{ key, name, icon }]); L.grid[key] = [];
  L.tabs = tabOrder().map(t => t[0]).filter(k => k !== key).concat([key]);
  closeModal(true); UI.tab = key; saveUI(); gChanged('New tab: ' + name);
}
function ctabDelete(k) {
  const L = LY(), t = ctabs().find(x => x.key === k); if (!t) return;
  (L.grid[k] || []).forEach(i => { const el = $(`.page [data-pid="${i.id}"]`), home = i.home || (el && el.dataset.home); const a = home && L.grid[home]; if (a) a.push({ id: i.id, home, x: 0, y: a.reduce((m, j) => Math.max(m, j.y + j.h), 0), w: i.w, h: i.h }); });
  delete L.grid[k]; L.ctabs = ctabs().filter(x => x.key !== k); L.tabs = (L.tabs || []).filter(x => x !== k);
  if (UI.tab === k) { UI.tab = tabOrder()[0][0]; saveUI(); }
  gChanged('Delete tab: ' + t.name);
  toast(`Tab <b>${esc(t.name)}</b> deleted — its modules went back to their own tabs.`, '', 6000, { label: 'Undo', fn: () => undo(1) });
}
function ensureCustomPages() {
  const main = $('main.wrap'); if (!main) return;
  ctabs().forEach(t => { if (!$('#page-' + t.key)) { const s = document.createElement('section'); s.className = 'page'; s.id = 'page-' + t.key; main.appendChild(s); } });
  $$('main.wrap > .page').forEach(p => { const k = p.id.replace('page-', ''); if (/^c[a-z0-9]{6}$/i.test(k) && !isCustomTab(k)) p.remove(); });
}

// ---------- Dragging and resizing (pointer: mouse, pen or touch) ----------
let GD = null;
function gridMetrics(box) { const r = box.getBoundingClientRect(); return { r, colW: (r.width + GGAP) / GCOLS }; }
function rowTops(box, skip) {
  const tops = {}; $$(':scope > [data-pid]', box).forEach(el => { if (el === skip) return; const y = N(el.dataset.gy), t = el.getBoundingClientRect().top; if (tops[y] == null || t < tops[y]) tops[y] = t; });
  return Object.keys(tops).map(Number).sort((a, b) => a - b).map(y => [y, tops[y]]);
}
function gPreview(box, items, skipId) {
  items.forEach(i => { const el = $(`:scope > [data-pid="${i.id}"]`, box); if (!el || i.id === skipId) return; el.style.gridColumn = `${i.x + 1} / span ${i.w}`; el.style.gridRow = `${i.y + 1} / span ${i.h}`; });
}
document.addEventListener('pointerdown', e => {
  if (!UI.editLayout || isMobile() || e.button > 0) return;
  const g = e.target.closest && (e.target.closest('[data-mgrip]') || e.target.closest('[data-mresize]')); if (!g) return;
  e.preventDefault(); if (GD) return; // (a second finger mid-drag is ignored)
  const id = g.dataset.mgrip || g.dataset.mresize, kind = g.dataset.mgrip ? 'move' : 'size';
  // Nothing changes until the pointer actually moves: a press without a drag leaves the layout alone.
  GD = { kind, id, start: { x: e.clientX, y: e.clientY }, on: false, pend: true };
});
// The drag begins: the tab becomes a grid if it isn't one yet, and the drag works on the modules actually showing
// (hidden ones, like combat-only panels out of combat, keep their spots below and don't throw the rows off).
function gBegin(d) {
  d.pend = false; const pg0 = modPageOf(d.id);
  if (ensureGrid([pg0])) { pendingLabel = null; render(); }
  const el = $(`.page.on [data-pid="${d.id}"]`), box = el && el.closest('.gridl'); if (!el || !box) return false;
  const pg = box.dataset.pg, all = LY().grid[pg] || [], shownIds = new Set($$(':scope > [data-pid]', box).map(x => x.dataset.pid));
  const items = gCompact(gClone(all.filter(i => shownIds.has(i.id))), null), it = items.find(i => i.id === d.id); if (!it) return false;
  const r = el.getBoundingClientRect();
  Object.assign(d, { el, box, pg, items, it, rest: gClone(all.filter(i => !shownIds.has(i.id))), start: Object.assign(d.start, { w: it.w, h: it.h, l: r.left, t: r.top, rw: r.width, rh: r.height }) });
  return true;
}
document.addEventListener('pointermove', e => {
  const d = GD; if (!d) return;
  if (!d.on) { if (Math.hypot(e.clientX - d.start.x, e.clientY - d.start.y) < 5) return; if (d.pend && !gBegin(d)) { GD = null; return; } d.on = true; document.body.classList.add('gdragging');
    d.ph = document.createElement('div'); d.ph.className = 'gph'; d.box.appendChild(d.ph);
    if (d.kind === 'move') { d.el.classList.add('gmoving'); d.ghost = document.createElement('div'); d.ghost.className = 'dghost'; d.ghost.textContent = '⠿ ' + modName(d.id); document.body.appendChild(d.ghost); } }
  e.preventDefault();
  const { r, colW } = gridMetrics(d.box), items = gClone(d.items), it = items.find(i => i.id === d.id);
  if (d.kind === 'move') {
    d.ghost.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 10}px)`;
    d.ghost.style.display = 'none'; const over = document.elementFromPoint(e.clientX, e.clientY); d.ghost.style.display = '';
    $$('.tabwrap.dropon').forEach(t => t.classList.remove('dropon'));
    const tab = over && over.closest('.tabwrap'); d.tab = null;
    if (tab && tab.dataset.tabkey !== d.pg && modTabs().some(([k]) => k === tab.dataset.tabkey)) { tab.classList.add('dropon'); d.tab = tab.dataset.tabkey; d.ph.style.display = 'none'; return; }
    // (over the tab bar, the edit bar or outside the page there's nowhere to put it: let go there and nothing changes)
    d.away = !!(over && over.closest('.tabs, #editbar, header.banner')) || e.clientX < 0 || e.clientY < 0 || e.clientX > innerWidth || e.clientY > innerHeight;
    d.ph.style.opacity = d.away ? '0' : '';
    d.ph.style.display = '';
    const left = e.clientX - (d.start.x - d.start.l) - r.left; it.x = Math.max(0, Math.min(GCOLS - it.w, Math.round(left / colW)));
    const tops = rowTops(d.box, d.el), py = e.clientY - (d.start.y - d.start.t) + 8; let y = 0;
    tops.forEach(([ry, t]) => { if (py >= t - 4) y = ry; });
    if (tops.length && py > d.box.getBoundingClientRect().bottom - 10) y = Math.max(...items.filter(i => i !== it).map(i => i.y + i.h), 0);
    it.y = y;
    if (!over || !over.closest('.tabs')) { if (e.clientY < 50) scrollBy(0, -14); else if (e.clientY > innerHeight - 130) scrollBy(0, 14); }
  } else {
    const dw = Math.round((e.clientX - d.start.x) / colW); it.w = Math.max(Math.min(GCOLS, modMinW(d.id)), Math.min(GCOLS - it.x, d.start.w + dw)); if (it.x + it.w > GCOLS) it.x = GCOLS - it.w;
    const dh = Math.round((e.clientY - d.start.y) / Math.max(120, d.start.rh / Math.max(1, d.start.h))); it.h = Math.max(1, Math.min(4, d.start.h + dh));
  }
  gResolve(items, it); d.live = items;
  d.ph.style.gridColumn = `${it.x + 1} / span ${it.w}`; d.ph.style.gridRow = `${it.y + 1} / span ${it.h}`;
  gPreview(d.box, items, d.kind === 'move' ? d.id : null);
  if (d.kind === 'size') { d.el.style.gridColumn = `${it.x + 1} / span ${it.w}`; d.el.style.gridRow = `${it.y + 1} / span ${it.h}`; }
}, { passive: false });
function gEnd(cancel) {
  const d = GD; if (!d) return; GD = null; document.body.classList.remove('gdragging');
  $$('.tabwrap.dropon').forEach(t => t.classList.remove('dropon'));
  if (d.ph) d.ph.remove(); if (d.ghost) d.ghost.remove(); if (d.el) d.el.classList.remove('gmoving');
  if (!d.on || cancel || !UI.editLayout || (d.kind === 'move' && d.away && !d.tab)) { if (d.on) render(); return; }
  if (d.tab) return modTo(d.id, d.tab);
  if (d.live) { const live = gSane(d.live), bottom = live.reduce((m, i) => Math.max(m, i.y + i.h), 0), y0 = Math.min(...d.rest.map(i => i.y), Infinity);
    d.rest.forEach(i => { i.y = bottom + (i.y - (isFinite(y0) ? y0 : 0)); });
    LY().grid[d.pg] = live.concat(d.rest); gChanged(d.kind === 'move' ? 'Move ' + modName(d.id) : 'Resize ' + modName(d.id)); }
}
document.addEventListener('pointerup', () => gEnd(false));
document.addEventListener('pointercancel', () => gEnd(true));
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (GD) gEnd(true); else if (typeof PD !== 'undefined' && PD) editEndDrags(); });
