(function () {
'use strict';
const PRISTINE = '<!doctype html>\n' + document.documentElement.outerHTML;
// Lists grouped by book keep the books in their usual order; within each book, A–Z.
var abc = (a, b) => String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base', numeric: true });
function bookSort(list, srcOf, nameOf) { const ord = new Map(); list.forEach(x => { const k = String(srcOf(x) || ''); if (!ord.has(k)) ord.set(k, ord.size); });
  return list.slice().sort((a, b) => (ord.get(String(srcOf(a) || '')) - ord.get(String(srcOf(b) || ''))) || abc(nameOf(a), nameOf(b))); }
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// A spell can carry the player's own name for it ("Smog Beam" for Fire Bolt): shown first, with the real spell name beside it.
const spLabel = sp => String((sp && (sp.flavor || '').trim()) || (sp && sp.name) || '');
const spDisp = sp => sp && (sp.flavor || '').trim() ? `${esc(sp.flavor.trim())} <span class="sp-real">${esc(sp.name)}</span>` : esc(sp && sp.name);
const N = x => Number(x) || 0;
const fmt = n => (n >= 0 ? '+' : '−') + Math.abs(n);
const sgn = n => (n >= 0 ? '+' : '') + n;
const AB = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const ABN = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
const AB3 = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
const FULL = { 0: [], 1: [2], 2: [3], 3: [4, 2], 4: [4, 3], 5: [4, 3, 2], 6: [4, 3, 3], 7: [4, 3, 3, 1], 8: [4, 3, 3, 2], 9: [4, 3, 3, 3, 1], 10: [4, 3, 3, 3, 2], 11: [4, 3, 3, 3, 2, 1], 12: [4, 3, 3, 3, 2, 1], 13: [4, 3, 3, 3, 2, 1, 1], 14: [4, 3, 3, 3, 2, 1, 1], 15: [4, 3, 3, 3, 2, 1, 1, 1], 16: [4, 3, 3, 3, 2, 1, 1, 1], 17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1], 19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1] };
const CL = DND.classes;
const uid = () => Math.random().toString(36).slice(2, 10);
const normName = s => String(s || '').toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(Boolean).sort().join(' ');
const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#3a4560"/><circle cx="60" cy="46" r="22" fill="#8a94ab"/><path d="M20 112c6-26 22-38 40-38s34 12 40 38z" fill="#8a94ab"/></svg>');

function blankState() {
  return {
    id: '', dataRev: '', created: false, sources: null, savedAt: 0, portrait: '', theme: { accent: '' },
    name: '', player: '', alignment: '', xp: '', faith: '',
    race: { key: '', sub: '', choices: {} }, raceName: '', background: '', backgroundName: '',
    classes: [], abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    saves: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
    skills: DND.skills.map(([name, ab]) => ({ name, ab, prof: 0, misc: 0, note: '' })),
    hp: { cur: 0, base: 0, adj: 0, temp: 0 }, hdUsed: {}, death: { s: 0, f: 0 },
    effects: [], concentration: '', conditions: [], exhaustion: 0, acOverride: '', speedOverride: '',
    attacks: [], profArmor: '', profWeapons: '', profTools: '', languages: '', profs: { armor: [], weapons: [], weaponNames: [] }, tools: [], langs: [],
    spells: [], slotsUsed: Array(9).fill(0), pactUsed: 0, slotsOverride: Array(9).fill(''),
    features: [], feats: [], currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }, inventory: [],
    traits: { personality: '', ideals: '', bonds: '', flaws: '' }, appearance: { age: '', height: '', weight: '', eyes: '', skin: '', hair: '' },
    backstory: '', allies: '', lore: '', notes: [],
    combat: { action: [], bonus: [], reaction: [], move: [] }, turn: { round: 1, used: {}, moved: 0, attacks: 0 },
    companions: [], form: null, riders: [], macroSeen: null, spellFilter: 'all', picks: {}, featChoices: {}, sources: null, settings: {}, layout: {}, quotes: [], rumors: [], people: [], goals: [], goal: '', compOff: {}, bags: [], rollAdv: '', condTurns: {}
  };
}

// ---------- State & storage ----------
// Version of the sheet's code. "Update" in Settings moves a character into a newer blank sheet.
const APP_VERSION = '2026.10.01';
const EMBED = JSON.parse($('#sheet-data').textContent || '{}');
const BLANK_FILE = !EMBED.created;
// On the GitHub Pages site every character shares one page, told apart by its ?c= link.
const PATH_KEY = 'dnd-sheet-path:' + location.pathname + (window.SHEET_CHAR ? '?c=' + window.SHEET_CHAR : '');
let S, FROM_LOCAL = false;
const LAYOUT_KEY = 'dnd-sheet-layout', PER_SHEET = !!window.SHEET_PAGES, UI_KEY = PER_SHEET ? 'dnd-sheet-ui:' + window.SHEET_CHAR : 'dnd-sheet-ui';
function keyFor(id) { return 'dnd-sheet:' + id; }
// A player's own preferences (Settings, theme, books, layout) always survive a newer copy of the sheet being published.
const PREF_KEYS = ['settings', 'theme', 'sources', 'layout', 'spellFilter'];
function keepPrefs(into, from) { if (!into || !from || (into.id && from.id && into.id !== from.id)) return into; PREF_KEYS.forEach(k => { if (from[k] !== undefined) into[k] = JSON.parse(JSON.stringify(from[k])); }); return into; }
(function load() {
  let local = null;
  try {
    const id = EMBED.created ? EMBED.id : localStorage.getItem(PATH_KEY);
    if (id) local = JSON.parse(localStorage.getItem(keyFor(id)) || 'null');
  } catch (e) {}
  HADLOCAL = !!(local && local.created && EMBED.created && local.id === EMBED.id);
  if (local && local.dataRev === (EMBED.dataRev || '') && (BLANK_FILE || N(local.savedAt) >= N(EMBED.savedAt))) { S = local; FROM_LOCAL = true; }
  else S = EMBED.created ? keepPrefs(JSON.parse(JSON.stringify(EMBED)), local) : Object.assign(blankState(), { dataRev: EMBED.dataRev || '' });
  S = migrate(S);
  FIXED = applyFixes(S);
  // Your layout is a preference of this browser, not of one file: it follows you to every sheet and every new version.
  // (On the website every character has its own layout, saved with the character.)
  if (!PER_SHEET) try {
    let g = JSON.parse(localStorage.getItem(LAYOUT_KEY) || 'null');
    // First run of this version: adopt the layout from the most recently saved sheet in this browser.
    if (!g) { let best = null; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k.startsWith('dnd-sheet:')) continue; try { const o = JSON.parse(localStorage.getItem(k)); if (o && o.layout && Object.keys(o.layout).length && (!best || N(o.savedAt) > N(best.savedAt))) best = o; } catch (x) {} } if (best) g = best.layout; }
    if (g && typeof g === 'object') S.layout = g;
  } catch (e) {}
})();
let UI = { tab: 'core', open: {} };
try { UI = Object.assign(UI, JSON.parse(localStorage.getItem(UI_KEY) || '{}')); } catch (e) {}
UI.open = UI.open || {};
// One-off corrections shipped with a sheet update (EMBED.fixes). Each runs once per character, whichever copy is
// loaded (this browser's, the cloud's or the file's), so a fix isn't lost to a newer saved copy.
var HADLOCAL; // set by load(): this browser already had its own copy of this character
var FIXED; // no initializer: load() runs (and may set it) before this line is reached
function applyFixes(s) {
  const done = new Set(s.fixesDone || []); let changed = false;
  (EMBED.fixes || []).forEach(f => {
    if (done.has(f.id) || (f.who && s.id !== f.who)) return;
    if (f.type === 'spellstore' && !(s.spells || []).some(x => x.stored)) { const it = (s.inventory || []).find(x => x.name === f.item), d = DND.spellIndex[String(f.spell).toLowerCase()];
      if (it && d) { const n = Math.max(2, 2 * Math.floor((N((s.abilities || {}).int) - 10) / 2));
        s.spells.push({ name: d.name, level: d.level, school: d.school, time: '1 action', range: d.range, comps: d.comps, duration: d.duration, conc: d.conc, ritual: d.ritual, summary: d.summary, src: d.src, cls: 'artificer', prepared: true, always: true, stored: true, usesOnly: true, ab: 'int', item: it.id, uses: { max: String(n), used: 0, reset: 'never' }, note: `Stored in ${it.name} (Spell-Storing Item). Anyone holding it can take an action to cast it with your spell DC and attack bonus.` }); } }
    if (f.type === 'infuse') { s.infReplicas = f.reps || s.infReplicas || []; (f.items || []).forEach(([nm, inf, r, strip]) => { const it = (s.inventory || []).find(x => x.name === nm); if (!it || it.infusion) return; it.infusion = { name: inf, rep: r || '', at: Date.now(), prev: null }; if (strip && it.mods) strip.forEach(k => delete it.mods[k]); }); (f.bags || []).forEach(([nm, inf, r]) => { const b = (s.bags || []).find(x => x.name === nm); if (b && !b.infusion) b.infusion = { name: inf, rep: r || '', at: 1 }; }); }
    if (f.type === 'setting') s.settings = Object.assign({}, s.settings, { [f.k]: f.v });
    if (f.type === 'dismiss') { s.dismissed = Object.assign({}, s.dismissed); (f.ids || []).forEach(x => s.dismissed[x] = true); }
    if (f.type === 'xsublv') { const r = (s.classes || []).find(c => c.key === f.cls); if (r && (r.extraSubs || []).includes(f.sub)) { r.extraSubLv = Object.assign({}, r.extraSubLv, { [f.sub]: f.n }); changed = true; } }
    done.add(f.id); changed = true;
  });
  if (changed) s.fixesDone = [...done];
  return changed;
}
function migrate(s) {
  const b = blankState();
  for (const k in b) if (s[k] === undefined) s[k] = b[k];
  if (!Array.isArray(s.sources)) s.sources = defaultSources();
  if (Array.isArray(s.inventory) && typeof hbKnownItem === 'function') try { s.inventory.forEach(hbKnownItem); } catch (e) {}
  // Rings / Armor of Resistance that had their type picked in a dropdown become the named item ("Ring of Resistance (Fire)").
  (s.inventory || []).forEach(it => { if (it && it.resPick && /\b(ring|armor) of resistance\b/i.test(it.name || '') && !/\((acid|cold|fire|force|lightning|necrotic|poison|psychic|radiant|thunder)\)\s*$/i.test(it.name || '')) it.name = it.name + ' (' + it.resPick[0].toUpperCase() + it.resPick.slice(1) + ')'; });
  s.slotsUsed = (s.slotsUsed || []).concat(Array(9).fill(0)).slice(0, 9);
  s.slotsOverride = (s.slotsOverride || []).concat(Array(9).fill('')).slice(0, 9);
  if (s.hp && s.hp.base === undefined) { s.hp.base = 0; s.hp.adj = N(s.hp.max); delete s.hp.max; }
  s.picks = s.picks || {}; s.featChoices = s.featChoices || {};
  // Old sheets kept tools and languages as free text; turn them into real lists.
  const split = t => String(t || '').split(/,|;|\band\b|\n/).map(x => x.trim()).filter(x => x && !/^(none|—|-)$/i.test(x));
  if (!Array.isArray(s.tools) || (!s.tools.length && s.profTools)) s.tools = split(s.profTools).map(name => ({ name, exp: false }));
  if (!Array.isArray(s.langs) || (!s.langs.length && s.languages)) s.langs = split(s.languages);
  s.profs = Object.assign({ armor: [], weapons: [], weaponNames: [] }, s.profs || {});
  s.turn = Object.assign({ round: 1, used: {}, moved: 0, attacks: 0 }, s.turn || {}); s.turn.used = s.turn.used || {};
  if (!Array.isArray(s.conditions)) s.conditions = [];
  ['action', 'bonus', 'reaction', 'move'].forEach(k => { if (!s.combat[k]) s.combat[k] = []; });
  return s;
}
function getP(path) { return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), S); }
function setP(path, val) { const ks = path.split('.'); let o = S; for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null || typeof o[ks[i]] !== 'object') o[ks[i]] = {}; o = o[ks[i]]; } o[ks[ks.length - 1]] = val; }

// ---------- Undo history ----------
const HMAX = 300;
const hkey = () => keyFor(S.id || 'blank') + ':history';
const TRACK = k => !['savedAt', 'spellFilter', 'macroSeen'].includes(k);
let HIST = [], REDO = [], LAST = null, pendingLabel = null;
function snapAll() { const o = {}; for (const k in S) if (TRACK(k)) o[k] = JSON.stringify(S[k]); return o; }
function commit() {
  const label = pendingLabel || 'Change', merge = label.startsWith('Edit: ');
  pendingLabel = null;
  const cur = snapAll(), changed = {};
  new Set([...Object.keys(cur), ...Object.keys(LAST || {})]).forEach(k => { if (cur[k] !== (LAST || {})[k]) changed[k] = (LAST || {})[k] === undefined ? null : LAST[k]; });
  LAST = cur;
  if (!Object.keys(changed).length || !S.created) return;
  const now = Date.now(), top = HIST[HIST.length - 1];
  if (merge && top && top.label === label && now - top.t < 4000) { for (const k in changed) if (!(k in top.keys)) top.keys[k] = changed[k]; top.t = now; }
  else HIST.push({ t: now, label, keys: changed });
  while (HIST.length > HMAX) HIST.shift();
  REDO = []; persistHist(); histButtons();
  try { if (window.onSheetChange) window.onSheetChange(label); } catch (e) {}
}
function applyEntry(e) {
  const inv = { t: e.t, label: e.label, keys: {} };
  for (const k in e.keys) { inv.keys[k] = k in S ? JSON.stringify(S[k]) : null; if (e.keys[k] === null) delete S[k]; else S[k] = JSON.parse(e.keys[k]); }
  return inv;
}
function afterHist() { S = migrate(S); LAST = snapAll(); writeLocal(); persistHist(); render(); }
function undo(n = 1) { let c = 0, lb = ''; while (c < n && HIST.length) { lb = HIST[HIST.length - 1].label; REDO.push(applyEntry(HIST.pop())); c++; } if (c) { afterHist(); try { if (window.onSheetChange) window.onSheetChange('Undo: ' + String(lb).replace(/^Edit: /, '')); } catch (e) {} } return c; }
function redo(n = 1) { let c = 0, lb = ''; while (c < n && REDO.length) { lb = REDO[REDO.length - 1].label; HIST.push(applyEntry(REDO.pop())); c++; } if (c) { afterHist(); try { if (window.onSheetChange) window.onSheetChange('Redo: ' + String(lb).replace(/^Edit: /, '')); } catch (e) {} } return c; }
let histTimer = null;
function persistHist() {
  clearTimeout(histTimer);
  histTimer = setTimeout(() => {
    let h = HIST.slice();
    while (true) { try { localStorage.setItem(hkey(), JSON.stringify(h)); return; } catch (e) { if (h.length <= 1) { try { localStorage.removeItem(hkey()); } catch (x) {} return; } h = h.slice(Math.ceil(h.length / 2)); } }
  }, 600);
}
function histButtons() {
  const u = $('#undoBtn'), r = $('#redoBtn');
  if (u) { u.disabled = !HIST.length; u.title = HIST.length ? `Undo: ${HIST[HIST.length - 1].label} (Ctrl+Z)` : 'Nothing to undo'; }
  if (r) { r.disabled = !REDO.length; r.title = REDO.length ? `Redo: ${REDO[REDO.length - 1].label} (Ctrl+Y)` : 'Nothing to redo'; }
}
function loadHist(fromLocal) {
  LAST = snapAll();
  if (!fromLocal) return;
  try { const h = JSON.parse(localStorage.getItem(hkey()) || '[]'); if (Array.isArray(h)) HIST = h; } catch (e) {}
}
let saveTimer = null;
function save() {
  S.savedAt = Date.now();
  if (S.effects && S.effects.length) S.effects = S.effects.filter(e => !e.conc || e.name === S.concentration);
  if (S.created) cleanupLinked();
  if (typeof hasteWatch === 'function') hasteWatch();
  commit(); writeLocal();
}
function writeLocal() {
  if (!S.created) return;
  S.savedAt = Date.now();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    let ok = true;
    try { localStorage.setItem(keyFor(S.id), JSON.stringify(S)); if (BLANK_FILE) localStorage.setItem(PATH_KEY, S.id); } catch (e) { ok = false; }
    if (!PER_SHEET) try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(S.layout || {})); } catch (e) {}
    if (!/synced|view only|retrying|reconnect|full|not live/i.test(UI.saveState || '') || !ok) { UI.saveState = ok ? 'Saved ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Not saved — export'; const el = $('#saveState'); if (el) { el.textContent = shortSync(UI.saveState); el.title = UI.saveState; } }
    cloudPush();
  }, 250);
}
const IOS_SAFARI = /iP(hone|od|ad)/.test(navigator.userAgent) && /Version\/[\d.]+.*Safari\//.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
// Where the phone's bottom tab bar sits is a setting of this device (same for every character); 32 by default.
// The phone's bottom tab bar: on the home-screen app it sits a little above the home bar; in the browser it sits right on
// the browser's own bar (you can still move it in Settings → Theme).
const tabStandalone = () => { try { return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches || document.documentElement.classList.contains('pg-standalone'); } catch (e) { return false; } };
function tabLift() { let v = null; try { v = localStorage.getItem('dnd-tablift'); } catch (e) {} return v != null && v !== '' ? N(v) : tabStandalone() ? 24 : 0; }
function applyTabLift() { document.documentElement.style.setProperty('--tablift', tabLift() + 'px'); }
function saveUI() { try { localStorage.setItem(UI_KEY, JSON.stringify(UI)); } catch (e) {} }
// An actual phone always uses the phone layout (the desktop layout can't be switched on there).
const onPhone = () => { try { return !window.PG_IN_PHONE && matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600; } catch (e) { return false; } };
// The layout always follows the device; the switch only lasts until the page is left or reloaded (it's never saved).
let LAYOUT_NOW = '';
function applyLayout() { applyTabLift(); const ph = onPhone(), m = window.PG_FORCE_MOBILE || ph || (LAYOUT_NOW ? LAYOUT_NOW === 'mobile' : window.innerWidth < 640); document.documentElement.classList.toggle('mobile', m); document.documentElement.classList.toggle('realphone', ph); }

// ---------- Class / level math ----------
const clsRows = () => S.classes || [];
// Ranger (Tasha's) counts as a ranger for archetype features, companions and formulas.
const keyIs = (rk, key) => rk === key || (key === 'ranger' && rk === 'rangertce');
const clsLv = key => clsRows().filter(r => keyIs(r.key, key)).reduce((t, r) => t + N(r.level), 0);
const totalLevel = () => Math.max(0, clsRows().reduce((t, r) => t + N(r.level), 0));
const lvl = () => Math.min(20, Math.max(1, totalLevel()));
const PB = () => Math.ceil(lvl() / 4) + 1;
const subOf = r => (r && r.sub && CL[r.key] && CL[r.key].subclasses[r.sub]) || null;
const hasSub = (key, sub) => clsRows().some(r => keyIs(r.key, key) && r.sub === sub);
const classLabel = () => clsRows().map(r => { const c = CL[r.key], s = subOf(r); return `${c ? c.name : r.key} ${r.level}` + (s ? ` (${s.name})` : ''); }).join(' / ');
const hasFeature = n => S.features.some(f => String(f.name).toLowerCase() === String(n).toLowerCase());
const featByName = n => S.features.findIndex(f => String(f.name).trim().toLowerCase() === String(n || '').trim().toLowerCase());
const hasFeat = n => (S.feats || []).some(f => f.toLowerCase() === n.toLowerCase());

// ---------- Abilities with item overrides ----------
function activeItems() { return S.inventory.filter(it => it.equipped && (!it.attune || it.attuned)); }
function itemMods() { return activeItems().map(it => it.mods || {}); }
function score(ab, noForm) {
  let v = S.abilities[ab] === '' ? 10 : N(S.abilities[ab]);
  if (!noForm && S.form && S.form.abil && (['str', 'dex', 'con'].includes(ab) || S.form.allStats)) v = N(S.form.abil[AB.indexOf(ab)]);
  if (!noForm || noForm !== 'raw') fxPassives().forEach(p => { if (p.abil && p.abil[ab]) v = Math.min(p.abilMax || 24, v + p.abil[ab]); });
  itemMods().forEach(m => { if (m.abil && m.abil[ab] && m.abil[ab] > v) v = m.abil[ab]; });
  // Temporary changes from the Conditions window (a curse, Ray of Enfeeblement, a potion…): set to a number and/or add.
  const t = (S.abTemp || {})[ab];
  if (t) { if (t.set !== '' && t.set != null) v = N(t.set); v = Math.max(1, Math.min(30, v + N(t.d))); }
  return v;
}
// How long a condition lasts: N rounds, or 0 = until removed, −1 = until a short rest, −2 = until a long rest.
const durText = v => (v > 0 ? v + ' round' + (v > 1 ? 's' : '') : v === -1 ? 'until a short rest' : v === -2 ? 'until a long rest' : 'until removed');
const durShort = v => (v > 0 ? (v <= 10 ? v + ' rd' + (v > 1 ? 's' : '') + ' / ' + roundTime(v, true) : fmtRounds(v)) : v === -1 ? 'short rest' : v === -2 ? 'long rest' : '');
// The score as it would be without temporary changes.
function baseScore(ab) { const t = S.abTemp; S.abTemp = null; try { return score(ab); } finally { S.abTemp = t; } }
const mod = (ab, noForm) => Math.floor((score(ab, noForm) - 10) / 2);
const auraBonus = () => (clsLv('paladin') >= 6 && !S.conditions.includes('Unconscious') ? Math.max(1, mod('cha')) : 0);
const itemSum = k => itemMods().reduce((t, m) => t + N(m[k]), 0) + infSum(k);
// A paladin's Aura of Protection: your own, or an ally's you're standing in (set on the Core tab). They don't stack.
const auraAll = () => Math.max(auraBonus(), N(S.allyAura), ...selfBuffs().map(b => N(b.aura)));
// Bonuses that apply to every saving throw — death saves included.
const saveAllBonus = () => itemSum('save') + auraAll() + N((S.deckMods || {}).save) + fxSum('saveAll') + buffSum('save');
const saveVal = ab => mod(ab) + (S.saves[ab] || fxSaveProf(ab) ? PB() : 0) + itemSum('save') + auraAll() + N((S.deckMods || {}).save) + fxSum('saveAll') + buffSum('save');
const jack = () => clsLv('bard') >= 2;
const remarkable = () => hasSub('fighter', 'champion') && clsLv('fighter') >= 7;
// Sentinel Raven (Raven Queen warlock): while the raven sits on your shoulder you get darkvision 30 ft and your CHA modifier on Perception.
const ravenHas = () => S.features.some(f => f.key === 'warlock:uaravenqueen:Sentinel Raven');
const ravenOn = () => ravenHas() && S.ravenPerched !== false;
function skillVal(sk) {
  let p = N(sk.prof); const fe = fxList('skillExp'), fp = fxList('skillProf');
  if (fe.includes(sk.name)) p = Math.max(p, 2); else if (fp.includes(sk.name)) p = Math.max(p, 1);
  let v = mod(sk.ab) + Math.floor(p * PB()) + N(sk.misc) + itemSum('check') + tmv('skill:' + sk.name);
  if (!p && jack()) v += Math.floor(PB() / 2);
  else if (!p && remarkable() && ['str', 'dex', 'con'].includes(sk.ab)) v += Math.ceil(PB() / 2);
  if (sk.name === 'Perception' && ravenOn()) v += mod('cha');
  return v;
}
const perception = () => { const p = S.skills.find(s => s.name === 'Perception'); return p ? skillVal(p) : mod('wis'); };
const passive = () => 10 + perception() + (hasFeat('Observant') ? 5 : 0) + (activeItems().some(it => (it.mods || {}).percAdv) ? 5 : 0);
function initVal() {
  let v = mod('dex') + itemSum('check');
  if (hasFeat('Alert')) v += 5;
  if (S.features.some(f => f.initProf)) v += PB();
  if (jack()) v += Math.floor(PB() / 2);
  if (hasSub('rogue', 'swashbuckler')) v += mod('cha');
  if (hasSub('wizard', 'warmagic')) v += mod('int');
  if (hasSub('ranger', 'gloomstalker')) v += mod('wis');
  v += fxSum('init');
  return v;
}

// ---------- Spellcasting ----------
function casters() {
  const out = [];
  clsRows().forEach(r => {
    const c = CL[r.key]; if (!c) return;
    let cd = c.caster, s = subOf(r);
    if (!cd && s && s.caster && N(r.level) >= c.sub.level) cd = s.caster;
    if (!cd) return;
    if (cd.from && N(r.level) < cd.from) return;
    out.push({ key: r.key, name: c.name, level: N(r.level), ...cd });
  });
  return out;
}
function casterLevel() {
  const cs = casters().filter(c => c.type !== 'pact');
  if (!cs.length) return 0;
  if (cs.length === 1) { const c = cs[0]; return c.type === 'full' ? c.level : c.type === 'half' ? (c.level >= 2 ? Math.ceil(c.level / 2) : 0) : c.type === 'artificer' ? Math.ceil(c.level / 2) : c.level >= 3 ? Math.ceil(c.level / 3) : 0; }
  return cs.reduce((t, c) => t + (c.type === 'full' ? c.level : c.type === 'half' ? Math.floor(c.level / 2) : c.type === 'artificer' ? Math.ceil(c.level / 2) : Math.floor(c.level / 3)), 0);
}
function slotMax(i) {
  const o = S.slotsOverride[i];
  if (o !== '' && o != null) return Math.max(0, N(o));
  return FULL[Math.min(20, casterLevel())][i] || 0;
}
const slotsLeft = i => slotMax(i) - Math.min(N(S.slotsUsed[i]), slotMax(i));
function pact() { const w = clsLv('warlock'); if (!w) return null; const c = CL.warlock.caster; return { count: c.pactSlots[w - 1], level: c.pactLevel[w - 1] }; }
const pactLeft = () => { const p = pact(); return p ? Math.max(0, p.count - N(S.pactUsed)) : 0; };
function castInfo(clsKey) {
  const cs = casters(); const c = cs.find(x => x.key === clsKey) || cs[0];
  if (!c) { const m = mod('cha'), b = itemSum('spell'); return { ab: 'cha', mod: m, dc: 8 + PB() + m + b, atk: PB() + m + b + itemSum('spellAtk'), name: '' }; }
  const m = mod(c.ab), bonus = itemSum('spell'), atkB = itemSum('spellAtk');
  const exDC = exModern() && ST('exhaustionDC') ? Math.min(5, N(S.exhaustion)) : 0;
  return { ...c, mod: m, dc: 8 + PB() + m + bonus - exDC, atk: PB() + m + bonus + atkB };
}
function preparedMax(c) { if (!c.prepared) return null; return Math.max(1, evalMax(c.prepared)); }
const spellsOf = key => S.spells.filter(s => s.cls === key);
function maxSpellLevelFor(c) {
  if (c.type === 'pact') { const p = pact(); return p ? p.level : 0; }
  const L = c.type === 'full' ? c.level : c.type === 'half' ? (c.level >= 2 ? Math.ceil(c.level / 2) : 0) : c.type === 'artificer' ? Math.ceil(c.level / 2) : (c.level >= 3 ? Math.ceil(c.level / 3) : 0);
  return (FULL[L] || []).length;
}

// ---------- Formulas ----------
function evalMax(expr, extra) {
  const e = String(expr ?? '').trim().toLowerCase();
  if (!e) return null;
  if (!/^[\d+\-*/().\s a-z,<>=?:]*$/.test(e)) return null;
  const vars = { level: lvl(), lvl: lvl(), prof: PB(), pb: PB(), pactslot: (typeof pact === 'function' && pact() ? pact().level : 0), ...(extra || {}) };
  AB.forEach(a => vars[a] = mod(a));
  Object.keys(CL).forEach(k => { if (!(k in vars)) vars[k] = clsLv(k); });
  const fns = ['tier', 'max', 'min', 'floor', 'ceil'];
  const src = e.replace(/[a-z]+/g, w => (fns.includes(w) ? w : w in vars ? '(' + vars[w] + ')' : 'NaN'));
  const tier = (x, ...p) => { let v = 0; for (let i = 0; i < p.length; i += 2) if (x >= p[i]) v = p[i + 1]; return v; };
  try { const v = Function('tier', 'max', 'min', 'floor', 'ceil', '"use strict";return (' + src + ')')(tier, Math.max, Math.min, Math.floor, Math.ceil); return isFinite(v) ? Math.max(0, Math.floor(v)) : null; } catch (x) { return null; }
}
const featMax = f => evalMax(f.max);
const resetOf = f => (f.shortAt && clsLv(f.cls || '') >= f.shortAt) ? 'short' : f.reset;

// ---------- Effects ----------
const fxActive = () => (S.effects || []).filter(e => !e.conc || e.name === S.concentration);
const selfBuffs = () => fxActive().filter(e => e.self !== false && !e.ally && e.buff && !e.item).map(e => e.buff);
// Spells cast on one weapon (Magic Weapon, Shillelagh…) only change that weapon's attack.
const itemBuffs = a => a && a.item ? fxActive().filter(e => e.item === a.item && e.buff && !e.ally).map(e => e.buff) : [];
const wpnBind = a => a && a.item ? fxActive().find(e => e.item === a.item && e.wpn && !e.ally) : null;
const buffSum = k => selfBuffs().reduce((t, b) => t + N(b[k]), 0);
const blessed = () => selfBuffs().some(b => b.bless) || (S.conditions || []).includes('Blessed');
const hasted = () => selfBuffs().some(b => b.speedMult) || (S.conditions || []).includes('Hasted');
function parseDur(d) {
  d = String(d || '').toLowerCase();
  if (/instant/.test(d)) return 0;
  const m = d.match(/(\d+)\s*(round|minute|min|hour|day)/);
  if (!m) return /until|special|permanent/.test(d) ? null : 0;
  const n = N(m[1]), u = m[2];
  return u === 'round' ? n : u.startsWith('min') ? n * 10 : u === 'hour' ? n * 600 : n * 14400;
}
// Real time for a number of rounds (6 seconds each): 1 → 6 sec, 5 → 30 sec, 10 → 1 minute.
function roundTime(r, short) { const s = N(r) * 6; if (s < 60) return s + ' sec'; const m = s / 60; return (Number.isInteger(m) ? m : m.toFixed(1)) + (short ? ' min' : m === 1 ? ' minute' : ' minutes'); }
function fmtRounds(r) {
  if (r == null) return '∞';
  if (r <= 10) return r + (r === 1 ? ' round' : ' rounds') + ' / ' + roundTime(r);
  if (r < 600) return Math.ceil(r / 10) + ' min';
  const h = r / 600; return (h >= 10 ? Math.round(h) : Math.round(h * 10) / 10) + ' h';
}

// ---------- Armor class ----------
const equippedArmor = () => S.inventory.find(it => it.equipped && it.armor && it.armor.type !== 'shield');
const equippedShield = () => S.inventory.find(it => it.equipped && it.armor && it.armor.type === 'shield');
function acInfo() {
  if (S.form) return { total: N(S.form.ac), parts: [S.form.name + ' AC ' + S.form.ac] };
  const parts = [];
  const arm = equippedArmor(), sh = equippedShield(), dex = mod('dex');
  let base;
  if (S.acOverride !== '' && S.acOverride != null) { base = N(S.acOverride); parts.push('Set manually: ' + base); }
  else if (arm) {
    const a = arm.armor; let cap = a.dexCap; if (a.type === 'medium' && hasFeat('Medium Armor Master')) cap = 3;
    const d = cap === 0 ? 0 : cap == null ? dex : Math.min(dex, cap);
    base = N(a.base) + d + N((arm.mods || {}).ac) * (arm.attune && !arm.attuned ? 0 : 1);
    parts.push(`${arm.name} ${a.base}` + (d ? ` + DEX ${d}` : '') + (N((arm.mods || {}).ac) ? ` + ${arm.mods.ac} magic` : ''));
    if (S.features.some(f => /^Defense$/i.test(f.name) || /Fighting Style: Defense/i.test(f.name)) && !fxPassives().some(p => p.acArmor && /Defense/.test(p.src))) { base += 1; parts.push('Defense style +1'); }
  } else {
    const opts = [['Unarmored 10 + DEX', 10 + dex]];
    const add = (label, f) => opts.push([label, f]);
    clsRows().forEach(r => { const c = CL[r.key], s = subOf(r); if (c && c.unarmored && !(c.unarmoredNoShield && sh)) add(c.name + ' Unarmored Defense', evalMax(c.unarmored)); if (s && s.unarmored) add(s.name, evalMax(s.unarmored)); });
    const race = DND.races[S.race.key]; if (race && race.naturalArmor) add('Natural armor', evalMax(race.naturalArmor));
    if (hasFeat('Dragon Hide')) add('Dragon Hide', 13 + dex);
    selfBuffs().forEach(b => { if (b.acBase) add('Mage Armor', N(b.acBase) + dex); });
    itemMods().forEach(m => { if (m.unarmoredBase) add('Item (unarmored)', N(m.unarmoredBase) + dex); });
    opts.sort((x, y) => y[1] - x[1]); base = opts[0][1]; parts.push(opts[0][0] + ' = ' + base);
  }
  let total = base;
  if (sh && S.acOverride === '') { const v = 2 + N((sh.mods || {}).ac); total += v; parts.push(`Shield +${v}`); }
  activeItems().forEach(it => { const m = it.mods || {}; if (it.armor) return; if (m.ac && !(m.unarmoredOnly && (arm || sh))) { total += N(m.ac); parts.push(`${it.name} +${m.ac}`); } });
  const race = DND.races[S.race.key]; if (race && race.acBonus) { total += race.acBonus; parts.push(`${race.name} +${race.acBonus}`); }
  if (dualWielder() && handsOf(oneHandMelee) >= 2) { total += 1; parts.push('Dual Wielder +1'); }
  if (arm && arm.forge && S.acOverride === '') { total += 1; parts.push('Blessing of the Forge +1'); }
  fxPassives().forEach(p => {
    const add = (v, why) => { const n = typeof v === 'number' ? v : N(evalMax(v)); if (n) { total += n; parts.push(`${p.src}${why ? ' (' + why + ')' : ''} ${n > 0 ? '+' : ''}${n}`); } };
    if (p.ac != null) add(p.ac); if (p.acArmor != null && arm) add(p.acArmor, 'in armor'); if (p.acHeavy != null && arm && arm.armor.type === 'heavy') add(p.acHeavy, 'heavy armor');
    if (p.acNoArmor != null && !arm) add(p.acNoArmor, 'no armor');
  });
  if ((S.conditions || []).includes('Hasted') && !selfBuffs().some(b => b.speedMult)) { total += 2; parts.push('Hasted +2'); }
  fxActive().forEach(e => { if (e.self === false || e.ally || !e.buff) return; if (e.buff.ac) { total += N(e.buff.ac); parts.push(`${e.name} +${e.buff.ac}`); } });
  if (tmv('ac')) { total += tmv('ac'); parts.push(`Temporary ${tmv('ac') > 0 ? '+' : ''}${tmv('ac')}`); }
  selfBuffs().forEach(b => { if (b.acMin && total < b.acMin) { total = b.acMin; parts.push('Barkskin minimum ' + b.acMin); } });
  return { total, parts, base };
}
const acTotal = () => acInfo().total;

// ---------- Speed ----------
function raceInfo() {
  if (S.race.key === 'custom') { const c = S.race.custom || {}; return { name: c.name || 'Custom race', size: c.size || 'Medium', speed: N(c.speed) || 30, darkvision: N(c.darkvision) || 0, fly: N(c.fly) || 0, swim: N(c.swim) || 0, traits: c.traits || [], languages: [] }; }
  const r = DND.races[S.race.key]; if (!r) return null; const s = (r.subraces || {})[S.race.sub] || {}; return { ...r, ...s, name: s.name || r.name, traits: (s.replaceTraits ? [] : r.traits || []).concat(s.traits || []) }; }
// Senses: darkvision from your race (a subrace's value replaces the base race's), plus invocations that see in the dark.
function darkvisionFt() { const r = raceInfo(); return Math.max(r ? N(r.darkvision) : 0, ravenOn() ? 30 : 0); }
function sensesText() { const dv = darkvisionFt(), ds = (S.picks && (S.picks.invocation || []).includes("Devil's Sight")); return [dv ? `Darkvision ${dv} ft` : '', ds ? "Devil's Sight 120 ft" : ''].concat(fxList('sense')).filter(Boolean).join(' · '); }
function speedInfo() {
  if (S.form) return { walk: parseInt((S.form.speed.match(/walk (\d+)/) || [0, 0])[1]) || 0, text: S.form.speed };
  const r = raceInfo();
  let walk = r ? N(r.speed) || 30 : 30; const parts = [`Base ${walk}`];
  if (hasFeat('Mobile')) { walk += 10; parts.push('Mobile +10'); }
  if (hasFeat('Squat Nimbleness')) { walk += 5; parts.push('Squat Nimbleness +5'); }
  if (N((S.deckMods || {}).speed)) { walk += N(S.deckMods.speed); parts.push(`Deck of Many Things +${N(S.deckMods.speed)}`); }
  const arm = equippedArmor(), sh = equippedShield();
  if (clsLv('barbarian') >= 5 && !(arm && arm.armor.type === 'heavy')) { walk += 10; parts.push('Fast Movement +10'); }
  const mk = clsLv('monk'); if (mk >= 2 && !arm && !sh) { const b = mk >= 18 ? 30 : mk >= 14 ? 25 : mk >= 10 ? 20 : mk >= 6 ? 15 : 10; walk += b; parts.push(`Unarmored Movement +${b}`); }
  if (arm && arm.armor.strReq && score('str') < arm.armor.strReq && !(r && /dwarf/i.test(r.name))) { walk -= 10; parts.push(`${arm.name} STR requirement −10`); }
  fxPassives().forEach(p => { const heavy = arm && arm.armor.type === 'heavy'; let n = 0; if (p.speed) n += N(p.speed); if (p.speedNoHeavy && !heavy) n += N(p.speedNoHeavy); if (p.speedNoArmor && !arm && !sh) n += N(p.speedNoArmor); if (n) { walk += n; parts.push(`${p.src} +${n}`); } });
  const bs = buffSum('speed'); if (bs) { walk += bs; parts.push(`Spells +${bs}`); }
  if (selfBuffs().some(b => b.speedHalf)) { walk = Math.floor(walk / 2); parts.push('Slowed ×½'); }
  if (hasted()) { walk *= 2; parts.push('Haste ×2'); }
  const enc = encLevel(); if (enc === 3) { walk = Math.min(walk, 5); parts.push('Over carrying capacity: 5 ft'); } else if (enc) { walk -= enc === 2 ? 20 : 10; parts.push(enc === 2 ? 'Heavily encumbered −20' : 'Encumbered −10'); }
  if (exModern() && N(S.exhaustion)) { walk = Math.max(0, walk - 5 * N(S.exhaustion)); parts.push(`Exhaustion −${5 * N(S.exhaustion)}`); }
  else if (N(S.exhaustion) >= 2) { walk = Math.floor(walk / 2); parts.push('Exhaustion halved'); }
  const zero = (!exModern() && N(S.exhaustion) >= 5) || S.conditions.some(c => { const d = DND.conditions.find(x => x[0] === c); return d && d[2] && d[2].speed0; });
  if (zero) { walk = 0; parts.push('Speed 0 (condition)'); }
  const extra = [];
  if (r) { if (r.fly) extra.push('fly ' + r.fly); if (r.swim) extra.push('swim ' + r.swim); if (r.climb) extra.push('climb ' + r.climb); }
  selfBuffs().forEach(b => { if (b.fly) extra.push('fly ' + (b.fly === 'walk' ? walk : b.fly)); });
  fxPassives().forEach(p => ['fly', 'swim', 'climb'].forEach(k => { if (p[k] && !extra.some(x => x.startsWith(k + ' '))) extra.push(k + ' ' + (p[k] === 'walk' ? walk : p[k])); }));
  if (S.speedOverride !== '' && S.speedOverride != null) return { walk: N(S.speedOverride), text: S.speedOverride + 'ft', parts: ['Set manually'] };
  if (S.turn && S.turn.speed0) return { walk: 0, text: '0ft this turn (' + S.turn.speed0 + ')', parts: parts.concat([S.turn.speed0 + ': speed 0 until the end of your turn']) };
  return { walk, text: walk + 'ft' + (extra.length ? ' · ' + extra.join(', ') : ''), parts };
}
const speedFt = () => { const w = speedInfo().walk; return w == null ? 30 : N(w); };
// Movement available this turn (Feline Agility doubles it).
const hasFeline = () => { const r = raceInfo(); return !!(r && (r.traits || []).some(t => /feline agility/i.test(t[0]))); };
const turnSpeed = () => speedFt() * (S.turn && S.turn.feline ? 2 : 1);
// Conditions that stop you taking actions, bonus actions and reactions (most severe first).
const INCAP = ['Unconscious', 'Petrified', 'Paralyzed', 'Stunned', 'Incapacitated'];
function incapCond() { return INCAP.find(c => (S.conditions || []).includes(c)) || (S.inCombat && N(S.lethargy) === 2 ? 'Lethargic (Haste wore off)' : ''); }

// ---------- Hit points & hit dice ----------
function hdPools() { const p = {}; clsRows().forEach(r => { const c = CL[r.key]; if (!c) return; p[c.hd] = (p[c.hd] || 0) + N(r.level); }); return p; }
const hdLeftOf = d => Math.max(0, (hdPools()[d] || 0) - N(S.hdUsed[d]));
const hdLeftTotal = () => Object.keys(hdPools()).reduce((t, d) => t + hdLeftOf(d), 0);
function hpMaxCalc() { return Math.max(1, N(S.hp.base) + lvl() * mod('con', true) + hpPerLevelBonus()); }
function baseMaxHp() { return Math.max(1, hpMaxCalc() + N(S.hp.adj)); }
// Temporary changes from the Conditions window: max HP (life drain, Aid from someone else…) and AC (a curse, a spell, cover…).
const tmv = k => N(((S.tmpMods || {})[k] || {}).v), tmr = k => N(((S.tmpMods || {})[k] || {}).r);
const TMP_NAMES = { hpmax: 'Max HP', ac: 'AC' };
const tmName = k => TMP_NAMES[k] || String(k).replace(/^skill:/, '');
function maxHp() { let m = baseMaxHp() + tmv('hpmax') + fxActive().reduce((t, e) => t + (e.self !== false && !e.ally ? N(e.maxHp) : 0), 0); if (N(S.exhaustion) >= 4 && !exModern()) m = Math.floor(m / 2); return m; }
// Carrying capacity: 15 × STR, doubled for Large creatures and Powerful Build (and Bear aspect), halved for Tiny.
function carryMult() { const r = raceInfo() || {}; let m = /large/i.test(r.size || '') ? 2 : /tiny/i.test(r.size || '') ? 0.5 : 1; if ((r.traits || []).some(t => /powerful build|hippo build|little giant/i.test(t[0]))) m *= 2; fxPassives().forEach(p => { if (p.carry) m *= p.carry; }); return m; }
const carryCap = () => Math.floor(15 * score('str') * carryMult());
// 0 fine · 1 encumbered · 2 heavily encumbered (variant rule) · 3 over capacity
function encLevel() {
  const mode = ST('encumbrance'); if (mode === 'off' || !mode) return 0;
  const w = weight(), s = score('str') * carryMult();
  if (w > 15 * s) return 3;
  if (mode === 'variant') return w > 10 * s ? 2 : w > 5 * s ? 1 : 0;
  return 0;
}
function hpPerLevelBonus() {
  let b = 0; const r = raceInfo(); if (r && r.hpPerLevel) b += r.hpPerLevel * lvl();
  if (hasFeat('Tough')) b += 2 * lvl();
  if (hasSub('sorcerer', 'draconic')) b += clsLv('sorcerer');
  fxPassives().forEach(p => { if (p.maxHp != null) b += typeof p.maxHp === 'number' ? p.maxHp : N(evalMax(p.maxHp)); });
  return b;
}

// ---------- Attacks ----------
// ---------- Two-weapon fighting (dual wielding) ----------
// After you take the Attack action and attack with a light melee weapon in one hand, you can use your bonus action to
// attack with a different light melee weapon in the other hand. That attack doesn't add your ability modifier to the
// damage unless the modifier is negative (the Two-Weapon Fighting style adds it). Dual Wielder lets the weapons be any
// one-handed melee weapons and gives +1 AC while you hold one in each hand.
const twfStyle = () => fightingStyle('Two-Weapon Fighting');
const dualWielder = () => hasFeat('Dual Wielder');
const oneHandMelee = it => !!(it && it.equipped && it.weapon && it.weapon.kind === 'melee' && !(it.weapon.props || []).includes('two-handed'));
const twfWeapon = it => oneHandMelee(it) && ((it.weapon.props || []).includes('light') || dualWielder());
const handsOf = test => S.inventory.filter(test).reduce((n, it) => n + Math.max(1, Math.min(2, N(it.qty) || 1)), 0);
const dualWielding = () => handsOf(twfWeapon) >= 2;
// Only weapons you've set up for it (Inventory → "Off-hand (dual wield)") show as off-hand attacks.
function offhandOK(a) { const it = a && a.item && S.inventory.find(x => x.id === a.item); return !!(it && twfWeapon(it)); }
function offhandSet(a) { const it = a && a.item && S.inventory.find(x => x.id === a.item); return !!(it && it.offhand && twfWeapon(it)); }
const offDrop = a => { if (twfStyle()) return 0; const ab = attackAb(a), m = ab && !a.noModDmg ? mod(ab) : 0; return m > 0 ? m : 0; };
function attackAb(a) {
  const wb = wpnBind(a); if (wb && wb.wpn.ab === 'spell') return castInfo(wb.wpn.cls).ab;
  if (a.ab === 'spell') return castInfo(a.cls).ab;
  let ab = a.ab === 'fin' || a.ab === 'monk' ? (mod('str') >= mod('dex') ? 'str' : 'dex') : a.ab || '';
  // Battle Smith's Battle Ready: INT instead of STR or DEX with magic weapons (infused ones included).
  if ((ab === 'str' || ab === 'dex') && battleReady(a) && mod('int') > mod(ab)) ab = 'int';
  return ab;
}
function battleReady(a) {
  if (!hasSub('artificer', 'battlesmith') || clsLv('artificer') < 3 || !a.item) return false;
  const it = S.inventory.find(x => x.id === a.item);
  return !!(it && it.weapon && (it.magic || (it.infusion && it.infusion.name) || N(a.magic) > 0));
}
// Weapons from inventory use your real weapon proficiencies; other attacks use their own checkbox.
function attackProf(a) {
  if (a.item) { const it = S.inventory.find(x => x.id === a.item); if (it && it.weapon) return !!a.profForce || profWeapon([it.weapon.base || it.name, it.weapon.cat]); }
  return !!a.prof;
}
// Armor you aren't proficient with: disadvantage on STR/DEX rolls and no spellcasting.
function armorNonProf() {
  const P = (S.profs || {}).armor || [], arm = equippedArmor(), sh = equippedShield();
  const bad = []; if (arm && !P.includes(arm.armor.type)) bad.push(arm.name); if (sh && !P.includes('shield')) bad.push(sh.name);
  return bad;
}
const fightingStyle = n => S.features.some(f => f.name === n || f.name === 'Fighting Style: ' + n);
function atkHit(a) {
  if (a.fixedHit != null && a.fixedHit !== '') return N(a.fixedHit);
  const ab = attackAb(a);
  const fit = a.item && S.inventory.find(x => x.id === a.item);
  let v = (ab ? mod(ab) : 0) + (attackProf(a) ? PB() : 0) + N(a.magic) + forgeBonus(fit) + infWeapon(fit, a, 'atk') + (a.effect ? 0 : buffSum('atk')) + itemBuffs(a).reduce((t, b) => t + N(b.atk), 0) + (a.ab === 'spell' ? itemSum('spellAtk') + itemSum('spell') : 0);
  if (a.kind === 'ranged' && fightingStyle('Archery')) v += 2;
  return v;
}
function atkDmgMod(a) {
  if (a.fixedHit != null && a.fixedHit !== '') return 0;
  const ab = attackAb(a);
  const fit = a.item && S.inventory.find(x => x.id === a.item);
  let v = (ab && !a.noModDmg ? mod(ab) : 0) + N(a.magic) + forgeBonus(fit) + infWeapon(fit, a, 'dmg') + (a.effect ? 0 : buffSum('dmg')) + itemBuffs(a).reduce((t, b) => t + N(b.dmg), 0) + (a.kind === 'melee' && ab === 'str' ? buffSum('meleeDmg') : 0) + (a.kind === 'melee' ? fxSum('meleeDmg') : 0);
  if (a.kind === 'melee' && fightingStyle('Dueling') && a.oneHanded) v += 2;
  return v;
}
function martialDie() { const m = clsLv('monk'); return m >= 17 ? 'd10' : m >= 11 ? 'd8' : m >= 5 ? 'd6' : m >= 1 ? 'd4' : ''; }
function atkDice(a) {
  let d = a.dice || '';
  const wb = wpnBind(a); if (wb && wb.wpn.die) d = /d\d+/.test(d) ? d.replace(/d\d+/, wb.wpn.die) : '1' + wb.wpn.die;
  if (a.monk && martialDie()) { const md = martialDie(), cur = (d.match(/d(\d+)/) || [0, 0])[1]; if (!d || N(md.slice(1)) > N(cur) || d === '1') d = '1' + md; }
  return d;
}
const extraDice = a => selfBuffs().concat(itemBuffs(a)).filter(b => b.dmgDice).map(b => b.dmgDice).concat(fxList('everyHit'));
function atkDmgText(a) { const m = atkDmgMod(a); return atkDice(a) + (m ? ' ' + (m > 0 ? '+ ' : '− ') + Math.abs(m) : ''); }
function attacksPerAction() {
  let n = 1;
  clsRows().forEach(r => { const c = CL[r.key], s = subOf(r); [c && c.extraAttack, s && s.extraAttack].forEach(t => { if (t) Object.keys(t).forEach(k => { if (N(r.level) >= N(k)) n = Math.max(n, t[k]); }); }); });
  if (hasFeature('Thirsting Blade')) n = Math.max(n, 2);
  return n;
}
const canAttack = () => { const n = N(S.turn.attacks); return n < attacksPerAction() && !(S.turn.used.action && n === 0); };
const critRange = () => { let c = 20; S.features.forEach(f => { if (f.crit && f.crit < c) c = f.crit; }); return c; };

// ---------- Conditions → roll modes ----------
let ROLL_CTX = '';
let ATK_ITEM = null;  // the weapon being attacked with (for cursed-weapon rules)
function rollMode(kind, ab) {
  const adv = [], dis = [], cond = S.conditions, ex = N(S.exhaustion);
  if (kind === 'attack') {
    if (cond.includes('Poisoned')) dis.push('poisoned'); if (cond.includes('Frightened')) dis.push('frightened'); if (cond.includes('Prone')) dis.push('prone');
    if (cond.includes('Restrained')) dis.push('restrained'); if (cond.includes('Blinded')) dis.push('blinded'); if (ex >= 3 && !exModern()) dis.push('exhaustion');
    if (cond.includes('Invisible')) adv.push('invisible');
    selfBuffs().forEach(b => { if (b.atkAdv) adv.push(typeof b.atkAdv === 'string' ? b.atkAdv : 'advantage'); if (b.atkAdvNext) adv.push(typeof b.atkAdvNext === 'string' ? b.atkAdvNext : 'advantage'); });
    if (armorNonProf().length) dis.push('armor not proficient');
    if (ATK_ITEM && ATK_ITEM.weapon) S.inventory.forEach(it => { if (it.hb && it.hb.othersDis && hbItemOn(it) && it.id !== ATK_ITEM.id) dis.push(it.name + ' (curse: other weapons)'); });
  }
  if ((kind === 'check' || kind === 'save') && ['str', 'dex'].includes(ab) && armorNonProf().length) dis.push('armor not proficient');
  if (kind === 'check' && ROLL_CTX === 'init') { fxPassives().forEach(p => { if (p.initAdv) adv.push(p.src); }); activeItems().forEach(it => { if ((it.mods || {}).initAdv) adv.push(it.name); }); }
  if (kind === 'check' && String(ROLL_CTX).startsWith('skill:')) fxPassives().forEach(p => { if ([].concat(p.skillAdv || []).includes(ROLL_CTX.slice(6))) adv.push(p.src); });
  if (kind === 'check' && String(ROLL_CTX).startsWith('skill:')) fxActive().forEach(e => { if (e.buff && !e.ally && [].concat(e.buff.skillAdv || []).includes(ROLL_CTX.slice(6))) adv.push(e.name); });
  if (kind === 'check' && ROLL_CTX !== 'init') fxPassives().forEach(p => { if ([].concat(p.checkAdv || []).includes(ab)) adv.push(p.src); });
  if (kind === 'save') fxPassives().forEach(p => { if ([].concat(p.saveAdv || []).includes(ab)) adv.push(p.src); });
  if (kind === 'check' && ROLL_CTX === 'skill:Perception') activeItems().forEach(it => { if ((it.mods || {}).percAdv) adv.push(it.name); });
  // Armor that's noisy (padded, scale mail, half plate, all heavy armor…) gives disadvantage on Stealth — mithral doesn't.
  if (kind === 'check' && ROLL_CTX === 'skill:Stealth') S.inventory.forEach(it => { if (!it.equipped || !it.armor || it.armor.type === 'shield' || /mithral/i.test(it.name + ' ' + ((it.magic || {}).name || ''))) return;
    const base = DND.armor.find(x => x[0] === it.name || (it.armor.base === x[3] && it.armor.type === x[1] && new RegExp(x[0].replace(/ armor$/i, ''), 'i').test(it.name)));
    if (it.armor.stealthDis || (it.armor.stealthDis == null && base && base[6]) || (it.armor.stealthDis == null && !base && it.armor.type === 'heavy')) dis.push(it.name + ' (noisy armor)'); });
  if (kind === 'check') { if (cond.includes('Poisoned')) dis.push('poisoned'); if (cond.includes('Frightened')) dis.push('frightened'); if (ex >= 1 && !exModern()) dis.push('exhaustion'); if (encLevel() >= 2 && ['str', 'dex', 'con'].includes(ab)) dis.push('heavily encumbered'); if (cond.includes('Raging') && ab === 'str') adv.push('rage'); }
  if (kind === 'save') {
    if (ex >= 3 && !exModern()) dis.push('exhaustion'); if (cond.includes('Restrained') && ab === 'dex') dis.push('restrained'); if (encLevel() >= 2 && ['str', 'dex', 'con'].includes(ab)) dis.push('heavily encumbered');
    if ((cond.includes('Dodging') || hasted()) && ab === 'dex') adv.push(cond.includes('Dodging') ? 'dodging' : 'haste');
    if (cond.includes('Raging') && ab === 'str') adv.push('rage');
  }
  // The sheet-wide Advantage / Disadvantage switch (Core → "d20 rolls" tile) applies to every attack, check and save.
  if (kind === 'check' && ROLL_CTX === 'skill:Perception') selfBuffs().forEach(b => { if (b.percAdv) adv.push('third eye'); });
  if (['attack', 'check', 'save'].includes(kind)) selfBuffs().forEach(b => { if (b.d20AdvNext) adv.push(typeof b.d20AdvNext === 'string' ? b.d20AdvNext : 'advantage'); });
  // Spells others cast on you (Haste: DEX saves, Enhance Ability: one ability's checks, Hex: one ability's checks at disadvantage…)
  fxActive().forEach(e => { const b = e.buff; if (!b || e.ally || e.self === false) return;
    if (kind === 'save' && [].concat(b.saveAdv || []).includes(ab)) adv.push(e.name); if (kind === 'check' && ROLL_CTX !== 'init' && [].concat(b.checkAdv || []).includes(ab)) adv.push(e.name);
    if (kind === 'check' && [].concat(b.checkDis || []).includes(ab)) dis.push(e.name); if (kind === 'save' && [].concat(b.saveDis || []).includes(ab)) dis.push(e.name); if (kind === 'attack' && b.atkDis) dis.push(e.name); });
  if (S.rollAdv === 'adv') adv.push('advantage (switch on)'); else if (S.rollAdv === 'dis') dis.push('disadvantage (switch on)');
  const auto = kind === 'save' && ['str', 'dex'].includes(ab) && cond.some(c => ['Paralyzed', 'Petrified', 'Stunned', 'Unconscious'].includes(c)) ? 'auto-fail' : '';
  return { mode: adv.length && dis.length ? 'normal' : adv.length ? 'adv' : dis.length ? 'dis' : 'normal', why: (adv.length && dis.length ? ['advantage and disadvantage cancel'] : adv.length ? adv : dis), auto };
}
