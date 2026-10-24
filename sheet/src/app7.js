// ---------- Sources ----------
// Which books a character draws from. Picked on the first step of creation and changeable later in Settings → Books.
// Every list the sheet offers (races, classes, subclasses, backgrounds, feats, spells, class options, magic items)
// is pruned to those books; anything the character already uses stays available until the player removes it.
// Function declarations only: migrate() calls defaultSources() while the script is still starting up.
function coreSources() { return ['PHB', 'SRD']; }
// Books that stay off until someone turns them on (playtest material, and settings most tables don't use).
function offSources() { return ['UA', 'AAG']; }
function defaultSources() { return Object.keys(DND.sources).filter(k => !offSources().includes(k)); }
function srcCodes(s) { return (String(s || '').match(/[A-Za-z]+/g) || []).filter(c => DND.sources[c]); }
// An entry is allowed when any book it appears in is on (e.g. "SCAG/EEPC"). Untagged entries follow their parent.
function srcOK(src, set, parentOK) { const c = srcCodes(src); return c.length ? c.some(x => set.has(x)) : parentOK !== false; }
function nameSrc(name) { const m = /\(([^)]*)\)\s*$/.exec(String(name || '')); return m ? m[1] : ''; }
function optSrc(e) { return (e[3] && e[3].src) || nameSrc(e[2]) || 'PHB'; }
let SRC_ALL = null;
function snapshotSources() {
  if (SRC_ALL) return SRC_ALL;
  const ent = o => Object.entries(o || {});
  return SRC_ALL = {
    races: ent(DND.races).map(([k, r]) => [k, r, ent(r.subraces)]),
    classes: ent(DND.classes).map(([k, c]) => [k, c, ent(c.subclasses)]),
    bgs: ent(DND.backgrounds), feats: DND.feats.slice(), magic: DND.magic.slice(), spells: DND.spells.slice(),
    options: ent(DND.options).map(([k, o]) => [k, o.list.slice()]),
    raceGroups: DND.raceGroups.map(([g, ks]) => [g, ks.slice()]), classOrder: DND.classOrder.slice()
  };
}
function refill(obj, entries) { Object.keys(obj).forEach(k => delete obj[k]); entries.forEach(([k, v]) => { obj[k] = v; }); }
function resetArr(a, items) { a.splice(0, a.length, ...items); }
// What the character already uses: kept on offer even if its book is turned off, until the player removes it.
function inUse() {
  const u = { race: new Set(), sub: new Set(), cls: new Set(), subcls: new Set(), bg: new Set(), names: new Set() };
  if (typeof W !== 'undefined' && W) return u;   // the creation wizard offers only what's ticked
  if (typeof S === 'undefined' || !S || !S.created) return u;
  if (S.race && S.race.key) { u.race.add(S.race.key); if (S.race.sub) u.sub.add(S.race.key + ':' + S.race.sub); }
  (S.classes || []).forEach(c => { if (c.key) u.cls.add(c.key); if (c.sub) u.subcls.add(c.key + ':' + c.sub); });
  if (S.background) u.bg.add(S.background);
  const nm = x => x && u.names.add(String(x).toLowerCase());
  (S.feats || []).forEach(f => nm(f.name || f)); (S.features || []).forEach(f => { nm(f.name); nm(f.dname); const k = String(f.key || ''); if (k.startsWith('feat:') || k.startsWith('pick:')) nm(k.split(':').pop()); });
  (S.spells || []).forEach(s => nm(s.name)); (S.inventory || []).forEach(i => nm(i.name));
  Object.values(S.picks || {}).forEach(l => (l || []).forEach(nm));
  return u;
}
function applySources(list) {
  const A = snapshotSources(), on = new Set((list && list.length ? list : defaultSources()).concat(coreSources())), U = inUse(), has = n => U.names.has(String(n || '').toLowerCase());
  refill(DND.races, A.races.filter(([k, r]) => U.race.has(k) || srcOK(r.src, on)).map(([k, r, subs]) => {
    if (r.subraces) refill(r.subraces, subs.filter(([sk, s]) => U.sub.has(k + ':' + sk) || srcOK(s.src || nameSrc(s.name), on)));
    return [k, r];
  }));
  refill(DND.classes, A.classes.filter(([k, c]) => U.cls.has(k) || srcOK(c.src, on)).map(([k, c, subs]) => { refill(c.subclasses, subs.filter(([sk, s]) => U.subcls.has(k + ':' + sk) || srcOK(s.src || nameSrc(s.name), on))); return [k, c]; }));
  refill(DND.backgrounds, A.bgs.filter(([k, b]) => k === 'custom' || U.bg.has(k) || srcOK(b.src, on)));
  resetArr(DND.feats, A.feats.filter(f => has(f[0]) || srcOK(f[1], on)));
  resetArr(DND.magic, A.magic.filter(m => has(m[0]) || srcOK(m[1], on)));
  resetArr(DND.spells, A.spells.filter(s => has(s.name) || srcOK(s.src, on)));   // DND.spellIndex stays complete so granted spells still resolve
  A.options.forEach(([k, l]) => resetArr(DND.options[k].list, l.filter(e => has(e[0]) || srcOK(optSrc(e), on))));
  resetArr(DND.raceGroups, A.raceGroups.map(([g, ks]) => [g, ks.filter(k => DND.races[k])]).filter(([, ks]) => ks.length));
  resetArr(DND.classOrder, A.classOrder.filter(k => DND.classes[k]));
}
// Content counts per book, for the picker.
function sourceCounts() {
  const A = snapshotSources(), n = {}, add = s => srcCodes(s).forEach(c => { n[c] = (n[c] || 0) + 1; });
  A.races.forEach(([, r, subs]) => { add(r.src); subs.forEach(([, s]) => add(s.src || nameSrc(s.name))); });
  A.classes.forEach(([, c, subs]) => { add(c.src); subs.forEach(([, s]) => add(s.src)); });
  A.bgs.forEach(([, b]) => add(b.src)); A.feats.forEach(f => add(f[1])); A.magic.forEach(m => add(m[1])); A.spells.forEach(s => add(s.src));
  A.options.forEach(([, l]) => l.forEach(e => add(nameSrc(e[2]) || (e[3] && e[3].src))));
  return n;
}
function sourcesHTML(sel, o = {}) {
  const attr = o.attr || 'wsrc';
  const n = sourceCounts(), core = coreSources(), on = new Set(sel);
  const keys = Object.keys(DND.sources).filter(k => n[k] || k === 'UA').sort((a, b) => (core.includes(b) - core.includes(a)) || (a === 'UA') - (b === 'UA') || DND.sources[a].localeCompare(DND.sources[b]));
  return `<div class="srcpick">${keys.map(k => {
    const uaLock = o.lockUA && k === 'UA', locked = core.includes(k) || uaLock, ck = core.includes(k) || on.has(k);
    return `<label class="srcopt${ck ? ' on' : ''}${locked ? ' locked' : ''}${k === 'UA' ? ' ua' : ''}"><input type="checkbox" data-${attr}="${k}"${ck ? ' checked' : ''}${locked ? ' disabled' : ''}>
      <span><b>${esc(DND.sources[k])}</b><small>${uaLock ? (ck ? 'On — chosen at creation, locked' : 'Off — chosen at creation, locked') : k === 'UA' ? 'Playtest material — unofficial, may be unbalanced' : core.includes(k) ? 'Core rules — always on' : (n[k] || 0) + ' options'}</small></span></label>`;
  }).join('')}</div>`;
}
// Changing books on the first step clears any picks that are no longer available.
function wizSetSource(code, on) {
  const L = new Set(W.sources); if (on) L.add(code); else L.delete(code); W.sources = [...L];
  applySources(W.sources);
  let cleared = false;
  if (W.race && !DND.races[W.race]) { W.race = ''; W.sub = ''; W.ans = {}; cleared = true; }
  else if (W.sub && !(DND.races[W.race].subraces || {})[W.sub]) { W.sub = ''; cleared = true; }
  W.classes.forEach(r => { if (r.key && !CL[r.key]) { r.key = ''; r.sub = ''; cleared = true; } else if (r.sub && r.key && !CL[r.key].subclasses[r.sub]) { r.sub = ''; cleared = true; } });
  if (W.bg && !DND.backgrounds[W.bg]) { W.bg = ''; cleared = true; }
  if (W.spells) { const ok = new Set(DND.spells.map(s => s.name)); Object.keys(W.spells).forEach(k => { const before = W.spells[k].length; W.spells[k] = W.spells[k].filter(x => ok.has(x)); if (W.spells[k].length !== before) cleared = true; }); }
  if (cleared) toast('Some earlier picks came from a book you turned off, so they were cleared.', '', 5000);
  renderWizard();
}
