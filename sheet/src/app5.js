
// ---------- Spellcasting ability for a specific spell ----------
function spellCI(sp) {
  if (sp && sp.stored && sp.item && sp.cls !== 'artificer') { const it = spItem(sp), c = it && it.spellCast && it.spellCast[sp.name]; if (c && (c.dc != null || c.atk != null)) { const b = spellCI(Object.assign({}, sp, { stored: false })); return Object.assign({}, b, c.dc != null ? { dc: N(c.dc) } : {}, c.atk != null ? { atk: N(c.atk) } : {}); } }
  if (sp && sp.ab && (!CL[sp.cls] || !casterFor(sp.cls))) { const m = mod(sp.ab), b = itemSum('spell'); return { ab: sp.ab, mod: m, dc: 8 + PB() + m + b, atk: PB() + m + b + itemSum('spellAtk'), name: '' }; }
  return castInfo(sp && sp.cls);
}

// ---------- Rebuild automatic features, spells and attacks ----------
const PICK_OWNER = { fightingStyle: ['fighter', 'paladin', 'ranger', 'rangertce'], maneuver: ['fighter'], metamagic: ['sorcerer'], invocation: ['warlock'], pactBoon: ['warlock'], infusion: ['artificer'], arcaneShot: ['fighter'], rune: ['fighter'], favoredEnemy: ['ranger'], favoredTerrain: ['ranger'] };
function rebuildAuto() {
  const old = {}; S.features.forEach(f => { if (f.auto) old[f.key] = f; });
  const out = [];
  const add = (key, name, desc, source, o, extra) => {
    o = o || {}; const prev = old[key];
    { const fx = fxOf({ key, name, dname: name, desc, cls: extra.cls || '', kind: extra.kind || '' }); const d = {};
      if (fx.col && !o.col) d.col = fx.col; if (fx.max != null && o.max == null) { d.max = fx.max; d.reset = fx.reset || 'long'; } if (fx.pool) d.pool = true;
      ['crit', 'initProf', 'shortAt'].forEach(k => { if (fx[k] != null && o[k] == null) d[k] = fx[k]; }); if (fx.roll && !o.roll && !fx.cost && !fx.acts) d.rollFx = true;
      o = Object.assign({}, o, d); }
    const f = { key, dname: name, name: prev && prev.dname && prev.name !== prev.dname ? prev.name : name, desc: prev ? prev.desc : desc, source, auto: true, used: prev ? N(prev.used) : 0, dmax: o.max != null ? String(o.max) : '', dreset: o.reset || 'long', max: o.max != null ? String(o.max) : '', reset: o.reset || 'long', pool: !!o.pool, col: o.col || '', cls: extra.cls || '', kind: extra.kind || '' };
    ['shortAt', 'crit', 'roll', 'initProf'].forEach(k => { if (o[k] != null) f[k] = o[k]; });
    if (prev && prev.spells) { f.spells = prev.spells; f.spellOnce = prev.spellOnce; }
    if (prev && prev.max !== prev.dmax) f.max = prev.max;
    if (prev && prev.reset !== prev.dreset) f.reset = prev.reset;
    out.push(f);
  };
  clsRows().forEach(r => {
    const c = CL[r.key]; if (!c) return; const L = N(r.level);
    c.features.forEach(([lv, nm, d, o]) => { if (lv <= L) add(r.key + ':' + nm, nm, d, `${c.name} ${lv}`, o ? { ...o, cls: o.cls || r.key } : o, { cls: r.key }); });
    const s = subOf(r);
    if (s) s.features.forEach(([lv, nm, d, o]) => { if (lv <= L) add(r.key + ':' + r.sub + ':' + nm, nm, d, `${s.name} ${lv}`, o, { cls: r.key }); });
    (r.extraSubs || []).forEach(k => { const s2 = c.subclasses[k]; if (s2 && k !== r.sub) s2.features.forEach(([lv, nm, d, o]) => { if (lv <= xsubCap(r, k)) add(r.key + ':' + k + ':' + nm, nm, d, `${s2.name} ${lv}`, o, { cls: r.key }); }); });
  });
  const ri = raceInfo();
  if (ri) ri.traits.forEach(([nm, d, o]) => { if (!o || !o.minLevel || lvl() >= o.minLevel) add('race:' + nm, nm, d, ri.name, o, { kind: 'race' }); });
  if (ri && N(ri.darkvision) && !ri.traits.some(t => /darkvision/i.test(t[0]))) add('race:Darkvision', N(ri.darkvision) > 60 ? 'Superior Darkvision' : 'Darkvision', `You can see in dim light within ${N(ri.darkvision)} ft as if it were bright light, and in darkness as if it were dim light (shades of gray only).`, ri.name, {}, { kind: 'race' });
  const bg = DND.backgrounds[S.background];
  if (S.background === 'custom' && S.bgCustom && S.bgCustom.feature) add('bg:' + S.bgCustom.feature, S.bgCustom.feature, S.bgCustom.desc || '', (S.backgroundName || 'Custom') + ' background', null, { kind: 'bg' });
  else if (bg && bg.feature) add('bg:' + bg.feature[0], bg.feature[0], bg.feature[1], bg.name + ' background', null, { kind: 'bg' });
  (S.feats || []).forEach(n => { const ft = DND.feats.find(x => x[0] === n); const e = (ft && ft[4]) || {}; add('feat:' + n, (e.res && e.res.name) || n, ft ? ft[3] : '', 'Feat' + (ft && ft[2] ? ' (' + ft[2] + ')' : ''), e.res ? { ...e.res, col: e.col } : e.col ? { col: e.col } : null, { kind: 'feat' }); });
  Object.entries(S.picks || {}).forEach(([type, names]) => {
    const op = DND.options[type]; if (!op) return;
    const owner = (PICK_OWNER[type] || []).find(k => clsLv(k)) || '';
    (names || []).forEach(n => { const o = op.list.find(x => x[0] === n); add('pick:' + type + ':' + n, type === 'fightingStyle' ? 'Fighting Style: ' + n : n, o ? o[1] : '', op.label, null, { cls: owner, kind: 'pick' }); });
  });
  S.features = out.concat(S.features.filter(f => !f.auto));
  // Always-prepared and racial spells
  const want = [];
  clsRows().forEach(r => { [[subOf(r), N(r.level)]].concat((r.extraSubs || []).map(k => [CL[r.key] && CL[r.key].subclasses[k], xsubCap(r, k)])).forEach(([s, cap]) => { if (s && s.spellMode === 'always' && s.spells) Object.keys(s.spells).forEach(lv => { if (cap >= N(lv)) s.spells[lv].forEach(n => want.push({ n, cls: r.key, src: s.name })); }); }); });
  if (ri && ri.spells) ri.spells.forEach(([lv, n, note]) => { if (lvl() >= lv) want.push({ n, cls: 'race', note, src: ri.name, atWill: /at will/i.test(String(note)), ab: ((String(note).match(/\((STR|DEX|CON|INT|WIS|CHA)\)/) || [])[1] || (S.race.choices && S.race.choices.ab) || 'cha').toLowerCase() }); });
  // Spells that class options give (Pact of the Tome cantrips, Book of Ancient Secrets rituals, at-will invocations)
  Object.entries(S.picks || {}).forEach(([type, names]) => {
    const op = DND.options[type]; if (!op) return; const owner = (PICK_OWNER[type] || []).find(k => clsLv(k)) || 'other';
    (names || []).forEach(nm => { const e = op.list.find(x => x[0] === nm), fx = (e && e[3]) || {};
      (fx.spells || []).forEach(n => want.push({ n, cls: owner, src: nm, note: fx.spellNote || '', once: fx.once }));
      if (fx.grant) ((S.grantSpells || {})[nm] || []).forEach(n => want.push({ n, cls: owner, src: nm, note: fx.grant.some(g => g.ritualOnly) && (SPI(n) || {}).level > 0 ? 'Ritual only' : '' })); });
  });
  // Spells you attached to any feature (custom ones included)
  S.features.forEach(f => (f.spells || []).forEach(n => want.push({ n, cls: f.cls && casterFor(f.cls) ? f.cls : 'other', src: f.name, note: f.spellNote || (f.spellAtWill ? 'at will' : ''), once: !!f.spellOnce && !f.spellAtWill, atWill: !!f.spellAtWill })));
  // Spells features give on their own (Spirit Seeker rituals, Circle Spells, bonus cantrips…)
  S.features.forEach(f => { if (f.kind === 'pick' && !fxOf(f).spellsAt) return; const fx = fxOf(f), cls = f.cls && casterFor(f.cls) ? f.cls : (fx.spellCls || 'other'), own = f.cls ? clsLv(f.cls) : lvl();
    (f.kind === 'pick' ? [] : fx.spells || []).forEach(n => want.push({ n, cls, src: f.dname || f.name, note: fx.spellNote || '', once: !!fx.once }));
    Object.entries(fx.spellsAt || {}).forEach(([lv, arr]) => { if (own >= N(lv)) arr.forEach(n => want.push({ n, cls, src: f.dname || f.name, note: fx.spellNote || '', once: !!fx.once })); }); });
  // Magic Initiate: the two cantrips and the once-per-long-rest 1st-level spell you chose, cast with that class's ability
  if (hasFeat('Magic Initiate')) { const c = MI_CLS.find(x => x[0] === (S.featCls || {})['Magic Initiate']) || MI_CLS[5];
    ((S.grantSpells || {})['Magic Initiate'] || []).forEach(n => want.push({ n, cls: 'feat', src: 'Magic Initiate (' + c[3] + ')', note: N((SPI(n) || {}).level) > 0 ? 'once per long rest' : '', once: N((SPI(n) || {}).level) > 0, ab: c[2], featAb: true })); }
  // Spells an item lets you cast, while you're using it (equipped, or carried if ticked; attuned if it needs it)
  S.inventory.forEach(it => { if (!hbItemOn(it)) return; const st = itemStores(it); (it.spells || []).forEach(n => want.push({ n, cls: 'other', src: it.name, note: st ? 'stored — gone once cast' : it.spellAtWill ? 'at will' : it.spellOnce ? 'once per long rest' : '', once: !st && !!it.spellOnce && !it.spellAtWill, atWill: !st && !!it.spellAtWill, stored: st, lvl: N((it.spellLevels || {})[n]), ab: (it.hb && it.hb.spellAb) || '', itemId: it.id })); });
  const keyOf = (n, cls) => n.toLowerCase() + '|' + cls;
  const wantKeys = new Set(want.map(w => keyOf(w.n, w.cls)));
  S.spells = S.spells.filter(s => !s.auto || wantKeys.has(keyOf(s.name, s.cls)));
  want.forEach(w => {
    const ex0 = S.spells.find(s => keyOf(s.name, s.cls) === keyOf(w.n, w.cls) && s.always && s.auto);
    if (ex0 && w.stored) { storedUse(ex0, w); ex0.item = w.itemId; ex0.ab = w.ab || (casters()[0] || {}).ab || 'cha'; ex0.note = w.src + ': ' + w.note; return; }
    if (ex0 && ex0.usesOnly && w.itemId) { delete ex0.usesOnly; delete ex0.stored; delete ex0.uses; }
    if (ex0 && (w.itemId || w.atWill || ex0.atWill)) { ex0.atWill = !!w.atWill && N(ex0.level) > 0; if (w.once && N(ex0.level) > 0) { if (!ex0.uses) ex0.uses = { max: '1', reset: 'long', used: 0 }; } else if (w.itemId || ex0.atWill) delete ex0.uses; if (w.itemId) { ex0.item = w.itemId; ex0.ab = w.ab || (casters()[0] || {}).ab || 'cha'; } ex0.note = w.src + (w.note ? ': ' + w.note : ''); return; }
    if (S.spells.some(s => keyOf(s.name, s.cls) === keyOf(w.n, w.cls) && s.always)) return;
    const ex = S.spells.find(s => s.name.toLowerCase() === w.n.toLowerCase() && s.cls === w.cls);
    if (ex) { ex.always = true; ex.auto = true; return; }
    const sp = spellEntry(w.n, w.cls); sp.always = true; sp.auto = true; sp.note = w.src + (w.note ? ': ' + w.note : '');
    if (w.once && N(sp.level) > 0) sp.uses = { max: '1', reset: 'long', used: 0 };
    if (w.atWill && N(sp.level) > 0) sp.atWill = true;
    if (w.itemId) { sp.item = w.itemId; sp.ab = w.ab || (casters()[0] || {}).ab || 'cha'; }
    if (w.stored) storedUse(sp, w);
    if (w.featAb) sp.ab = w.ab;
    if (w.cls === 'race') { sp.ab = w.ab; if (/once per long rest|1\/long rest|once per day/i.test(w.note || '') && N(sp.level) > 0) { sp.uses = { max: '1', reset: 'long', used: 0 }; const lv = String(w.note).match(/as (\d)(?:st|nd|rd|th)[- ]level/i); if (lv) sp.uses.level = N(lv[1]); } }
    S.spells.push(sp);
  });
  // A spell you get automatically (a subclass list, a feat, an item) and also added by hand shows once: keep the automatic one.
  // (A spell stored in an item — Spell-Storing Item, Ring of Spell Storing — is its own entry and always stays.)
  { const autoK = new Set(S.spells.filter(s => s.auto).map(s => keyOf(s.name, s.cls))); S.spells = S.spells.filter(s => s.auto || s.stored || s.usesOnly || !autoK.has(keyOf(s.name, s.cls))); }
  // Unarmed strike and natural weapons
  const keep = S.attacks.filter(a => !a.auto);
  const auto = [];
  const monk = clsLv('monk') > 0;
  auto.push({ name: 'Unarmed Strike', ab: monk ? 'monk' : 'str', prof: true, magic: 0, dice: monk ? '' : '1', type: 'bludgeoning', notes: monk ? 'Martial Arts: bonus-action strike after attacking' : '', kind: 'melee', monk, auto: 'unarmed' });
  S.features.forEach(f => (fxOf(f).attacks || []).forEach(([n, d, t, ab, x]) => auto.push(Object.assign({ name: n, ab: ab || 'str', prof: true, magic: 0, dice: d, type: t, notes: f.dname || f.name, kind: 'melee', auto: 'feature' }, x || {}, x && x.hbDice ? { dice: fxRollExpr(d), notes: [f.dname || f.name, x.notes].filter(Boolean).join(' · ') } : {}))));
  if (ri && ri.natural) ri.natural.forEach(([n, d, t]) => auto.push({ name: n, ab: 'str', prof: true, magic: 0, dice: d, type: t, notes: 'Natural weapon', kind: 'melee', monk, auto: 'natural' }));
  S.attacks = auto.map(a => { const prev = S.attacks.find(x => x.auto && x.name === a.name); return prev ? Object.assign(prev, { bonus: a.bonus, after: a.after, monk: a.monk, ab: prev.ab === 'str' && a.ab === 'monk' ? 'monk' : prev.ab, dice: a.monk && prev.dice === '1' ? '' : a.hbDice ? a.dice : prev.dice }, a.hbDice ? { type: a.type, notes: a.notes, noModDmg: a.noModDmg, kind: a.kind, ab: a.ab } : {}) : a; }).reverse().concat(keep.slice().reverse()).reverse();
}
// Spells stored in an item (a Ring of Spell Storing): one use each, cast at the level it was stored at, and gone
// until someone casts a spell into the item again (it doesn't come back on a rest).
const itemStores = it => it.spellStored != null ? !!it.spellStored : /ring of spell storing/i.test(it.name + ' ' + ((it.magic && it.magic.name) || ''));
function storedUse(sp, w) {
  if (!sp.usesOnly || !sp.uses) sp.uses = { max: '1', used: 0, reset: 'never' };
  sp.usesOnly = true; sp.stored = true; sp.uses.reset = 'never'; sp.prepared = true;
  if (w.lvl > N(sp.level)) sp.uses.level = w.lvl; else delete sp.uses.level;
}
function spellEntry(n, cls) {
  const d = SPI(n) || { name: n, level: 1, school: '', time: '1 action', range: '', comps: '', duration: '', conc: false, ritual: false, summary: '', src: '' };
  return { name: d.name, level: d.level, school: d.school, time: d.time, range: d.range, comps: d.comps, duration: d.duration, conc: d.conc, ritual: d.ritual, summary: d.summary, src: d.src, cls, prepared: false, always: false, note: '' };
}

// ---------- Choice widgets (wizard, level up, feats) ----------
const TOOL_AB = [[/thieves|forgery|tinker|jeweler|glass|weaver|leather|cobbler|carpenter|woodcarver|smith|mason|potter/i, 'dex'], [/navigator|herbal|vehicle|cook|brewer|gaming|dice|card|chess|dragonchess|three-dragon/i, 'wis'], [/instrument|lute|flute|drum|horn|lyre|bagpipe|viol|dulcimer|pan flute|shawm|disguise/i, 'cha'], [/alchemist|calligrapher|cartographer|painter|poison/i, 'int']];
const toolAb = n => (TOOL_AB.find(([re]) => re.test(n)) || [0, 'int'])[1];
const ALL_LANGS = () => DND.languages.standard.concat(DND.languages.exotic);
const ALL_TOOLS = () => [...new Set(Object.values(DND.toolGroups).flat().concat(["Thieves' tools", "Disguise kit", "Forgery kit", "Herbalism kit", "Navigator's tools", "Poisoner's kit", "Vehicles (land)", "Vehicles (water)"]))];
function toolsFrom(f) { if (!f || f === 'any') return ALL_TOOLS(); return [].concat(f).flatMap(x => x === 'any' ? ALL_TOOLS() : DND.toolGroups[x] || [x]); }
// Prerequisites written on class options ("5th level, Tome", "Seeker patron (UA)", "Eldritch blast"):
// returns '' when met, otherwise the reason the option can't be taken yet.
function optPrereq(req, ctx) {
  req = String(req || ''); if (!req || !ctx) return '';
  const why = [];
  const lv = /(\d+)(?:st|nd|rd|th) level/i.exec(req); if (lv && ctx.level && ctx.level < N(lv[1])) why.push(`${lv[1]}th level`);
  const pk = /\b(Tome|Chain|Blade|Talisman)\b/.exec(req);
  if (pk) { const pacts = pactsChosen(ctx); if (!pacts.some(x => new RegExp(pk[1], 'i').test(x))) why.push('Pact of the ' + pk[1]); }
  const pat = /^([A-Z][\w' ]+?) patron/i.exec(req);
  if (pat && ctx.cls) { const sub = ctx.sub || ((clsRows().find(r => r.key === ctx.cls) || {}).sub); const sn = sub && CL[ctx.cls] && CL[ctx.cls].subclasses[sub] ? CL[ctx.cls].subclasses[sub].name : ''; if (!new RegExp(pat[1], 'i').test(sn)) why.push(pat[1] + ' patron'); }
  return why.length ? 'needs ' + why.join(' and ') : '';
}
// Pact boon picked so far (this wizard / level-up, or already on the sheet).
function pactsChosen(ctx) {
  const out = [];
  Object.entries((ctx && ctx.CH) || {}).forEach(([k, v]) => { if (/pactBoon$/.test(k)) [].concat(v || []).forEach(x => x && out.push(x)); });
  if (S && S.created && !(typeof W !== 'undefined' && W)) (S.picks && S.picks.pactBoon || []).forEach(x => out.push(x));
  return out;
}
function choiceOptions(def, ctx) {
  const skills = DND.skills.map(s => s[0]);
  switch (def.type) {
    case 'skill': { const k = knownSkills(); return (def.from === 'any' || !def.from ? skills : def.from).map(x => [x, x, k.has(x.toLowerCase()) ? '(you already have it)' : '']); }
    case 'expertise': return (Array.isArray(def.from) ? def.from : skills.concat(["Thieves' tools"])).map(x => [x, x]);
    case 'element': return ['acid', 'cold', 'fire', 'lightning', 'thunder'].map(x => [x, x[0].toUpperCase() + x.slice(1)]);
    case 'language': { const k = knownLangs(); return ALL_LANGS().map(x => [x, x, k.has(x.toLowerCase()) ? '(you already speak it)' : '']); }
    case 'tool': { const t = toolsFrom(def.from), k = def.orLang ? knownLangs() : null; return t.map(x => [x, x]).concat(def.orLang ? ALL_LANGS().map(l => ['Language: ' + l, 'Language: ' + l, k.has(l.toLowerCase()) ? '(you already speak it)' : '']) : []); }
    case 'asi': return AB.filter(a => !(def.exclude || []).includes(a) && (!def.from || def.from.includes(a))).map(a => [a, `${ABN[a]} +${def.amount || 1}`]);
    case 'feat': return bookSort(DND.feats, f => f[1], f => f[0]).map(f => [f[0], f[0] + (f[2] ? ` (${f[2]})` : '') + (f[1] !== 'PHB' ? ` · ${f[1]}` : '')]);
    case 'cantrip': if (Array.isArray(def.list)) return def.list.map(n => [n, n]);
      return DND.spells.filter(s => s.level === 0 && s.classes.includes(def.list)).sort((a, b) => abc(a.name, b.name)).map(s => [s.name, s.name]);
    case 'spellpick': return DND.spells.filter(s => s.level === def.level && (!def.ritual || s.ritual) && (def.list === 'any' || s.classes.includes(def.list))).sort((a, b) => abc(a.name, b.name)).map(s => [s.name, `${s.name} — ${s.summary}`]);
    case 'option': return def.options.map(([n, d]) => [n, `${n} — ${d}`]);
    case 'weapon': return DND.weapons.filter(w => !def.from || w[1] === def.from).map(w => [w[0], w[0]]);
    default: {
      const op = DND.options[def.type]; if (!op) return [];
      let list = op.list;
      if (def.type === 'fightingStyle' && ctx && ctx.cls) list = list.filter(x => new RegExp(CL[ctx.cls].name, 'i').test(x[2] || ''));
      return bookSort(list, x => (srcCodes(x[2])[0] || ''), x => x[0]).map(([n, d, src]) => [n, `${n} — ${d}${src && def.type !== 'fightingStyle' ? ' (' + src + ')' : ''}`, optPrereq(src, ctx)]);
    }
  }
}
const CHOICE_LABEL = { spellpick: 'Spell', skill: 'Skill', expertise: 'Expertise', language: 'Language', tool: 'Tool', asi: 'Ability increase', feat: 'Feat', cantrip: 'Cantrip', option: 'Option', weapon: 'Weapon proficiency' };
function choiceLabel(def) { return def.label || CHOICE_LABEL[def.type] || (DND.options[def.type] && DND.options[def.type].label) || def.type; }
function choiceUI(CH, id, def, ctx) {
  ctx = Object.assign({ CH }, ctx || {});
  const opts = choiceOptions(def, ctx), cur = CH[id] || [], n = def.n || 1;
  let h = `<div class="chq"><span class="lbl">${esc(choiceLabel(def))}${n > 1 ? ` × ${n}` : ''}${def.note ? ` <span class="hint">${esc(def.note)}</span>` : ''}</span><div class="chsel">`;
  // Options you don't qualify for stay visible but can't be picked; a pick that stopped qualifying is flagged.
  const others = k => Object.entries(CH).filter(([kk]) => kk !== id && kk.endsWith('.' + def.type)).flatMap(([, v]) => v || []).concat(cur.filter((x, j) => j !== k), typeof LV !== 'undefined' && LV && S.picks ? S.picks[def.type] || [] : []);
  const bad = [];
  // Languages: anything picked in another language (or tool-or-language) slot of this wizard counts as taken.
  const langNames = new Set(ALL_LANGS());
  const langOthers = k => Object.entries(CH).filter(([kk]) => kk !== id).flatMap(([, v]) => [].concat(v || [])).concat(cur.filter((x, j) => j !== k)).map(x => String(x || '').replace(/^Language: /, '')).filter(x => langNames.has(x));
  const isLang = def.type === 'language' || def.orLang;
  for (let k = 0; k < n; k++) h += `<select class="f" data-ch="${id}" data-k="${k}"><option value="">— choose —</option>${opts.map(([v, t, no]) => { const lv = isLang && String(v).replace(/^Language: /, ''); const dup = DND.options[def.type] ? others(k).includes(v) : def.type === 'skill' ? Object.entries(CH).filter(([kk]) => kk !== id && /skill$/.test(kk)).flatMap(([, x]) => [].concat(x || [])).concat(cur.filter((x, j) => j !== k)).includes(v) : isLang && langNames.has(lv) && langOthers(k).includes(lv); if (cur[k] === v && no) bad.push(`${v} ${no}`); return `<option value="${esc(v)}"${cur[k] === v ? ' selected' : ''}${(no || dup) && cur[k] !== v ? ' disabled' : ''}>${esc(t)}${no ? ' — ' + esc(no) : dup ? ' — already taken' : ''}</option>`; }).join('')}</select>`;
  h += '</div>' + (bad.length ? `<p class="warn sm">${esc(bad.join('; '))}.</p>` : '');
  if (def.type === 'feat') for (let k = 0; k < n; k++) if (cur[k]) h += featSubUI(CH, id + '.f' + k, cur[k]);
  if (DND.options[def.type]) for (let k = 0; k < n; k++) { const e = cur[k] && DND.options[def.type].list.find(x => x[0] === cur[k]); const g = e && e[3] && e[3].grant; if (g) h += `<div class="featsub">${g.map((gd, j) => choiceUI(CH, `${id}.g${k}.${j}`, gd, ctx)).join('')}</div>`; }
  return h + '</div>';
}
function featSubDefs(name) {
  const ft = DND.feats.find(x => x[0] === name); if (!ft) return [];
  const e = ft[4] || {}, defs = [];
  if (e.asi) defs.push({ type: 'asi', n: 1, amount: 1, from: e.asi });
  if (e.skills) defs.push({ type: 'skill', n: e.skills, from: 'any', label: 'Skill (or tool)' });
  if (e.expertise) defs.push({ type: 'expertise', n: e.expertise });
  if (e.langs) defs.push({ type: 'language', n: e.langs });
  if (e.element) defs.push({ type: 'element', n: 1, label: 'Damage type' });
  return defs;
}
function featSubUI(CH, id, name) {
  const ft = DND.feats.find(x => x[0] === name); if (!ft) return '';
  const defs = featSubDefs(name), e = ft[4] || {};
  return `<div class="featsub"><p class="hint" style="margin:4px 0">${esc(ft[3])}${ft[2] ? ` <b>Prerequisite:</b> ${esc(ft[2])}` : ''}${e.spells ? ' — add its spells from the Spells tab after creating.' : ''}</p>${defs.map((d, k) => choiceUI(CH, id + '.' + k, d)).join('')}</div>`;
}
function chField(t) {
  const CH = t.closest('#pendm') && PEND ? PEND.ans : t.closest('#grantm') && GRANT ? GRANT.CH : t.closest('#wizard') || t.closest('#rcmodal') ? W.ans : LV ? LV.ans : FEATM ? FEATM.ans : null; if (!CH) return;
  const id = t.dataset.ch, k = N(t.dataset.k);
  CH[id] = (CH[id] || []).slice(); CH[id][k] = t.value;
  if (t.closest('#grantm')) { renderGrantPicker(); return; }
  if (t.closest('#pendm')) { renderPending(); return; }
  if (t.closest('#rcmodal')) { RC.kind === 'race' ? renderRaceChange() : renderBgChange(); return; }
  if (t.closest('#wizard')) { const sc = $('#wizard .wz-body') ? $('#wizard .wz-body').scrollTop : 0; renderWizard(); if ($('#wizard .wz-body')) $('#wizard .wz-body').scrollTop = sc; } else if (LV) renderLevelUp(); else if (FEATM) renderFeatModal();
}
const ansList = (CH, id) => (CH[id] || []).filter(Boolean);
// Apply a feat to S (ability increases, proficiencies)
function applyFeat(name, CH, id) {
  const ft = DND.feats.find(x => x[0] === name); if (!ft) return;
  if (!S.feats.includes(name)) S.feats.push(name);
  const e = ft[4] || {};
  const bump = (a, n) => { S.abilities[a] = Math.min(20, N(S.abilities[a]) + n); };
  if (e.asiFixed) Object.entries(e.asiFixed).forEach(([a, n]) => bump(a, n));
  // Feats that train one named skill or tool: proficiency, or expertise if you already have it.
  if (e.skillFixed) { const sk = S.skills.find(x => x.name.toLowerCase() === e.skillFixed.toLowerCase()), tl = (S.tools || []).find(x => x.name.toLowerCase() === e.skillFixed.toLowerCase()); setSkill(e.skillFixed, (sk && N(sk.prof) >= 1) || tl ? 2 : 1); }
  const defs = featSubDefs(name), store = {};
  defs.forEach((d, k) => {
    const v = ansList(CH, id + '.' + k); store[d.type] = v;
    if (d.type === 'asi') v.forEach(a => { bump(a, 1); if (e.saveProfFromAsi) S.saves[a] = true; });
    if (d.type === 'skill') v.forEach(n => setSkill(n, 1));
    if (d.type === 'expertise') v.forEach(n => setSkill(n, 2));
    if (d.type === 'language') addText('languages', v);
  });
  if (e.armorCats) S.profs.armor = [...new Set((S.profs.armor || []).concat(e.armorCats))];
  if (e.armorCats) S.profArmor = profArmorText();
  S.featChoices[name] = store;
}
function setSkill(n, p) { const s = S.skills.find(x => x.name.toLowerCase() === String(n).toLowerCase()); if (s) s.prof = Math.max(N(s.prof), p); else { addText('profTools', [n]); if (p >= 2) { const t = S.tools.find(x => x.name.toLowerCase() === String(n).toLowerCase()); if (t) t.exp = true; } } }
function addText(field, arr) {
  if (field === 'languages') { arr.forEach(x => { if (x && !S.langs.some(c => c.toLowerCase() === x.toLowerCase())) S.langs.push(x); }); return; }
  if (field === 'profTools') { arr.forEach(x => { if (x && !S.tools.some(c => c.name.toLowerCase() === x.toLowerCase())) S.tools.push({ name: x, exp: false, ab: toolAb(x) }); }); return; } const cur = String(S[field] || '').split(/,\s*/).filter(Boolean); arr.forEach(x => { if (x && !cur.some(c => c.toLowerCase() === x.toLowerCase())) cur.push(x); }); S[field] = cur.join(', '); }
function profArmorText() { const a = S.profs.armor || []; return ['light', 'medium', 'heavy'].filter(x => a.includes(x)).map(x => x[0].toUpperCase() + x.slice(1) + ' armor').concat(a.includes('shield') ? ['Shields'] : []).join(', ') || 'None'; }
function profWeaponText() { const w = S.profs.weapons || []; return w.map(x => x[0].toUpperCase() + x.slice(1) + ' weapons').concat(S.profs.weaponNames || []).join(', ') || 'None'; }

// ---------- Spell picker ----------
let PICK = { cls: '', lvl: 'all', q: '' };
function listLettersFor(key) { const c = casterFor(key); return c ? c.list : ''; }
function expandedFor(key) { const r = clsRows().find(x => x.key === key); if (!r) return []; return [[subOf(r), N(r.level)]].concat((r.extraSubs || []).map(k => [CL[r.key].subclasses[k], xsubCap(r, k)])).filter(([s]) => s && s.spellMode === 'expanded' && s.spells).flatMap(([s, cap]) => Object.keys(s.spells).filter(lv => cap >= N(lv)).flatMap(lv => s.spells[lv])); }
// An extra subclass you took only some levels in (Shade: 1 level of The Fiend) only grants features and spells up to
// that point — the class level you'd have after that many levels in it. No count recorded = the whole class level.
function xsubCap(r, k) { const c = CL[r.key], n = N((r.extraSubLv || {})[k]); if (!n) return N(r.level); return Math.min(N(r.level), (N(c && c.sub && c.sub.level) || 1) - 1 + n); }
function openSpellPicker(cls) {
  PICK = { cls: cls || (casters()[0] || {}).key || 'other', lvl: '', q: '' };
  if (!$('#modal').classList.contains('open')) openModal('', null, true);
  renderPicker();
}
function renderPicker() {
  const key = PICK.cls, c = casterFor(key), letter = c ? c.list : '';
  const maxL = c ? maxSpellLevelFor(c) : 9;
  const exp = expandedFor(key).map(n => n.toLowerCase());
  let list = DND.spells.filter(s => (!letter || s.classes.includes(letter) || exp.includes(s.name.toLowerCase())) && s.level <= maxL);
  const have = new Set(S.spells.filter(s => s.cls === key).map(s => s.name.toLowerCase()));
  // A spell you already have from somewhere else (race, feat, class option) can't be added twice.
  const elsewhere = new Map(S.spells.filter(s => s.cls !== key).map(s => [s.name.toLowerCase(), s.auto && s.note ? String(s.note).split(':')[0] : clsName(s.cls)]));
  const lvls = [...new Set(list.map(s => s.level))].sort((a, b) => a - b);
  const lim = c ? spellLimit(c) : null, cl = c ? cantripLimit(c) : null;
  if (PICK.lvl === '' || (PICK.lvl !== 'all' && !lvls.includes(N(PICK.lvl)))) PICK.lvl = String(c && cl && countCantrips(key) < cl ? 0 : lvls.find(l => l > 0) != null ? lvls.find(l => l > 0) : lvls[0] || 0);
  const haveAt = l => S.spells.filter(s => s.cls === key && N(s.level) === l).length;
  const q = $('#spq') ? $('#spq').value : PICK.q;
  $('#modal-body').innerHTML = `<h3>Add spells</h3>
    <div class="row">${fld('For', `<select class="f" id="spcls">${clsRows().filter(r => casterFor(r.key)).map(r => [r.key, clsName(r.key)]).concat([['race', 'Racial'], ['feat', 'Feat (e.g. Magic Initiate)'], ['item', 'Item'], ['other', 'Other']]).map(([k, t]) => `<option value="${k}"${k === key ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>`)}
      ${c ? `<span class="hint">${c.prepared ? 'Prepared' : 'Known'} ${c.prepared ? countPrep(key) : countKnown(key)}${lim != null ? '/' + lim : ''}${cl ? ` · cantrips ${countCantrips(key)}/${cl}` : ''} · up to ${maxL ? ORD[maxL - 1] + ' level' : 'cantrips'}${c.book ? ' · wizards add spells to their spellbook, then prepare them' : ''}</span>` : '<span class="hint">All spells from every list.</span>'}</div>
    <div class="row" style="margin:6px 0"><input class="f" id="spq" placeholder="Search spells…" value="${esc(q)}" aria-label="Search spells" style="flex:1 1 200px">
      <div class="chips">${lvls.map(l => [String(l), (l ? ORD[l - 1] + ' level' : 'Cantrips') + (haveAt(l) ? ` (${haveAt(l)})` : '')]).concat([['all', 'All']]).map(([k, t]) => `<button class="chip${PICK.lvl === k ? ' on' : ''}" data-act="spfilt" data-l="${k}">${t}</button>`).join('')}</div></div>
    <div class="crlist">${list.filter(s => PICK.lvl === 'all' || String(s.level) === PICK.lvl).map(s => { const on = have.has(s.name.toLowerCase()); return `<div class="crrow" data-q="${esc((s.name + ' ' + s.school + ' ' + s.summary).toLowerCase())}"><div><b>${esc(s.name)}</b> <span class="hint">${s.level ? ORD[s.level - 1] : 'Cantrip'} · ${esc(s.school)} · ${esc(s.time)} · ${esc(s.range)}${s.conc ? ' · conc' : ''}${s.ritual ? ' · ritual' : ''} · ${esc(s.src)}</span><div class="hint">${esc(s.summary)}</div></div>${!on && elsewhere.has(s.name.toLowerCase()) ? `<span class="always" title="Already on your sheet">Have it (${esc(elsewhere.get(s.name.toLowerCase()))})</span>` : `<button class="btn sm ${on ? '' : 'gold'}" data-act="pickspell" data-n="${esc(s.name)}">${on ? 'Added ✓' : 'Add'}</button>`}</div>`; }).join('') || '<p class="hint">No spells available yet at this level.</p>'}</div>
    <div class="actions"><button class="btn" data-act="close">Done</button></div>`;
  $('#modal-body').classList.add('wide');
  filterCatalogQ('#spq');
}
function filterCatalogQ(sel) { const q = ($(sel) && $(sel).value || '').trim().toLowerCase(); $$('#modal-body .crrow').forEach(r => r.style.display = !q || (r.dataset.q || '').includes(q) ? '' : 'none'); }
function pickSpell(b) {
  const n = b.dataset.n, key = PICK.cls, idx = S.spells.findIndex(s => s.cls === key && s.name.toLowerCase() === n.toLowerCase());
  if (idx >= 0) { if (S.spells[idx].auto) { toast('That one is granted automatically.'); return; } S.spells.splice(idx, 1); pendingLabel = 'Remove spell ' + n; b.textContent = 'Add'; b.classList.add('gold'); }
  else {
    const sp = spellEntry(n, key), c = casterFor(key);
    if (c && c.prepared && N(sp.level) > 0) { const lim = spellLimit(c); sp.prepared = !c.book && (lim == null || countPrep(key) < lim); }
    if (!c && key !== 'other') sp.ab = (casters()[0] || {}).ab || 'cha';
    if (key === 'feat' || key === 'race') { if (N(sp.level) > 0) sp.uses = { max: '1', reset: 'long', used: 0 }; }
    S.spells.push(sp); pendingLabel = 'Add spell ' + n; b.textContent = 'Added ✓'; b.classList.remove('gold');
  }
  save(); render('spells', 'combat');
  const hint = $('#modal-body .row .hint'); if (hint && casterFor(key)) { const c = casterFor(key), lim = spellLimit(c), cl = cantripLimit(c); hint.firstChild && (hint.textContent = `${c.prepared ? 'Prepared' : 'Known'} ${c.prepared ? countPrep(key) : countKnown(key)}${lim != null ? '/' + lim : ''}${cl ? ` · cantrips ${countCantrips(key)}/${cl}` : ''}`); }
}

// ---------- Feat modal (DM-granted or extra feats) ----------
let FEATM = null;
function openFeatModal() {
  FEATM = { ans: {} }; LV = null;
  renderFeatModal();
}
function renderFeatModal() {
  const CH = FEATM.ans;
  openModal(`<h3>Add a feat</h3><p class="hint" style="margin:0 0 8px">For feats from your DM, a background or a race. Feats taken at level up are added there automatically.</p>
    <div id="featm">${choiceUI(CH, 'feat', { type: 'feat', n: 1 })}</div>
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="featok">Add feat</button></div>`, null, true);
}
function featModalOK() {
  const n = ansList(FEATM.ans, 'feat')[0]; if (!n) { toast('Choose a feat first.'); return; }
  applyFeat(n, FEATM.ans, 'feat.f0'); rebuildAuto(); pendingLabel = 'Add feat ' + n; FEATM = null; closeModal(true); save(); render();
  toast(`${esc(n)} added.`, '', 6000, { label: 'Undo', fn: () => undo(1) });
}

// ---------- Level up ----------
let LV = null;
function mcOK(key, scores) {
  const sc = scores || S.abilities, c = CL[key]; if (!c || !c.mc) return true;
  const ok = r => N(sc[r[0]]) >= r[1];
  return c.mc.reqAny ? c.mc.req.some(ok) : c.mc.req.every(ok);
}
function openLevelUp() {
  if (totalLevel() >= 20) { toast('Already level 20.'); return; }
  FEATM = null;
  LV = { cls: (clsRows()[0] || {}).key || '', ans: {}, hp: '', sub: '' };
  openModal('', null, true); renderLevelUp();
}
function lvTarget() {
  const key = LV.cls, row = clsRows().find(r => r.key === key), c = CL[key];
  return { key, c, row, cur: row ? N(row.level) : 0, nl: (row ? N(row.level) : 0) + 1, isNew: !row };
}
function lvChoiceDefs(t) {
  const defs = [], c = t.c, nl = t.nl, subKey = t.row && t.row.sub ? t.row.sub : LV.sub, s = subKey ? c.subclasses[subKey] : null;
  if (c.asi.includes(nl)) defs.push({ id: 'asi', def: { type: 'asiOrFeat' } });
  (c.choices || []).concat((s && s.choices) || []).forEach((ch, k) => { if (ch.level === nl) defs.push({ id: 'ch' + k + '.' + ch.type, def: ch }); });
  if (t.isNew && c.mc && c.mc.skills) defs.push({ id: 'mcskill', def: { type: 'skill', n: c.mc.skills, from: c.skills.from } });
  return defs;
}
function asiOrFeatUI(CH, id) {
  const cur = CH[id] || [], mode = cur[0] || '';
  let h = `<div class="chq asiq"><span class="lbl">Ability Score Improvement — raise your scores, or take a feat instead</span>
    <div class="asimodes">${[['two', '+1 to two scores', 'e.g. DEX +1, CON +1'], ['one', '+2 to one score', 'e.g. STR +2'], ['feat', 'Take a feat', 'a new feature instead of scores']].map(([v, t, s2]) => `<button type="button" class="asimode${mode === v ? ' on' : ''}" data-asimode="${id}" data-v="${v}"><b>${t}</b><span>${s2}</span></button>`).join('')}</div><div class="chsel">`;
  const abSel = k => `<select class="f" data-ch="${id}" data-k="${k}"><option value="">— ability —</option>${AB.map(a => `<option value="${a}"${cur[k] === a ? ' selected' : ''}>${ABN[a]} (${N(S.abilities[a])})</option>`).join('')}</select>`;
  if (mode === 'two') h += abSel(1) + abSel(2); else if (mode === 'one') h += abSel(1);
  h += '</div>';
  if (mode === 'feat') h += choiceUI(CH, id + '.feat', { type: 'feat', n: 1 });
  return h + '</div>';
}
function applyAsiOrFeat(CH, id) {
  const cur = CH[id] || [], mode = cur[0] || '';
  if (!mode) return '';
  if (mode === 'feat') { const n = ansList(CH, id + '.feat')[0]; if (n) applyFeat(n, CH, id + '.feat.f0'); return n ? 'Feat: ' + n : ''; }
  const bump = (a, n) => { if (a) S.abilities[a] = Math.min(20, N(S.abilities[a]) + n); };
  if (mode === 'one') { bump(cur[1], 2); return cur[1] ? `${AB3[cur[1]]} +2` : ''; }
  bump(cur[1], 1); bump(cur[2], 1); return [cur[1], cur[2]].filter(Boolean).map(a => AB3[a] + ' +1').join(', ');
}
function renderLevelUp() {
  if (!LV) return;
  const t = lvTarget(), c = t.c, rows = clsRows();
  const conM = mod('con', true), avg = c ? Math.floor(c.hd / 2) + 1 : 0;
  const twin = k => k === 'ranger' ? 'rangertce' : k === 'rangertce' ? 'ranger' : '';
  const others = DND.classOrder.filter(k => !rows.some(r => r.key === k || r.key === twin(k)));
  let body = '';
  if (c) {
    const subKey = t.row && t.row.sub ? t.row.sub : LV.sub, s = subKey ? c.subclasses[subKey] : null;
    const feats = c.features.filter(f => f[0] === t.nl).concat(s ? s.features.filter(f => f[0] === t.nl) : []);
    const xs = LV.extraSub && c.subclasses[LV.extraSub], xcap = xs ? Math.min(t.nl, (N(c.sub && c.sub.level) || 1) + N(((t.row || {}).extraSubLv || {})[LV.extraSub])) : 0; if (xs) feats.push(...xs.features.filter(f => f[0] <= xcap).map(f => [f[0], f[1] + ` (${xs.name})`, f[2]]));
    const needSub = !(t.row && t.row.sub) && t.nl >= c.sub.level;
    body += `<div class="lvsec"><h4>${esc(c.name)} ${t.nl}${t.isNew ? ' (new class)' : ''} · character level ${totalLevel() + 1}</h4>`;
    if (t.isNew && !mcOK(t.key)) body += `<p class="warn">Multiclassing into ${esc(c.name)} needs ${c.mc.req.map(r => AB3[r[0]] + ' ' + r[1]).join(c.mc.reqAny ? ' or ' : ' and ')}. You can still continue if your DM allows it.</p>`;
    if (t.isNew) { const bad = rows.filter(r => !mcOK(r.key)); if (bad.length) body += `<p class="warn">Your current class${bad.length > 1 ? 'es' : ''} (${bad.map(r => CL[r.key].name).join(', ')}) must also meet multiclass requirements.</p>`; body += `<p class="hint">You gain: ${esc(c.mc.profs || 'no new proficiencies')}.</p>`; }
    if (needSub) body += fld(c.sub.label, `<select class="f" id="lvSub">${[['', '— choose —']].concat(bookSort(Object.entries(c.subclasses), ([, v]) => v.src, ([, v]) => v.name).map(([k, v]) => [k, v.name + (v.src !== 'PHB' ? ' (' + v.src + ')' : '')])).map(([k, n]) => `<option value="${k}"${LV.sub === k ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>`);
    body += feats.length ? `<ul class="newfeats">${feats.map(f => `<li><b>${esc(f[1])}</b> — ${esc(f[2])}</li>`).join('')}</ul>` : '<p class="hint">No new named features at this level.</p>';
    const defs = lvChoiceDefs(t);
    body += defs.map(d => d.def.type === 'asiOrFeat' ? asiOrFeatUI(LV.ans, d.id) : choiceUI(LV.ans, d.id, d.def, { cls: t.key, level: t.nl, sub: (t.row && t.row.sub) || LV.sub })).join('');
    // Spell changes
    const cd = c.caster || (s && s.caster);
    if (cd && (!cd.from || t.nl >= cd.from)) {
      const L0 = t.cur, L1 = t.nl, kn = a => (a ? N(a[Math.max(0, L1 - 1)]) - N(a[Math.max(0, L0 - 1)]) * (L0 ? 1 : 0) : 0);
      const msg = [];
      if (cd.cantrips && kn(cd.cantrips) > 0) msg.push(`learn ${kn(cd.cantrips)} new cantrip${kn(cd.cantrips) > 1 ? 's' : ''}`);
      if (cd.known && kn(cd.known) > 0) msg.push(`learn ${kn(cd.known)} new spell${kn(cd.known) > 1 ? 's' : ''} (and may swap one)`);
      if (cd.prepared) msg.push('prepare more spells (your limit grows automatically)');
      if (cd.book) msg.push('add 2 spells to your spellbook');
      if (msg.length) body += `<p class="hint">Spells: you can ${msg.join(', ')}. You'll pick them on the next screen.</p>`;
    }
    body += `<div class="row">${fld('HP gained', `<input class="f" id="lvHP" type="number" inputmode="numeric" value="${esc(LV.hp || (avg + conM))}" style="width:90px">`)}<button class="btn" data-act="lvroll">Roll 1d${c.hd} ${fmt(conM)}</button><span class="hint" id="lvRollNote">Average ${avg} ${fmt(conM)} CON = ${avg + conM}${hpPerLevelBonus() ? ` · plus ${hpPerLevelBonus() > lvl() ? 'your per-level bonuses' : 'your +1/level bonus'} automatically` : ''}</span></div></div>`;
  }
  $('#modal-body').innerHTML = `<h3>Level Up</h3>
    <div class="lbl">Advance which class?</div>
    <div class="chips">${rows.map(r => `<button class="chip${LV.cls === r.key ? ' on' : ''}" data-act="lvcls" data-k="${r.key}">${esc(CL[r.key].name)} ${r.level} → ${N(r.level) + 1}</button>`).join('')}
      <select class="f" id="lvNew" style="width:auto"><option value="">+ Multiclass into…</option>${others.map(k => `<option value="${k}"${LV.cls === k ? ' selected' : ''}>${esc(CL[k].name)}${mcOK(k) ? '' : ' (requirements not met)'}</option>`).join('')}${rows.filter(r => r.sub).map(r => { const c2 = CL[r.key]; const subs = Object.entries(c2.subclasses).filter(([k]) => k !== r.sub && !(r.extraSubs || []).includes(k)); return subs.length ? `<optgroup label="Another ${esc(c2.sub.label)} (homebrew)">${subs.map(([k, v]) => `<option value="sub:${r.key}:${k}"${LV.extraSub === k && LV.cls === r.key ? ' selected' : ''}>${esc(c2.name)}: ${esc(v.name)}</option>`).join('')}</optgroup>` : ''; }).join('')}</select></div>
    ${body}
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="lvl-confirm">Level up</button></div>`;
  $('#modal-body').classList.add('wide');
  const ns = $('#lvNew'); if (ns) ns.onchange = () => { if (ns.value) { const m = /^sub:(\w+):(\w+)$/.exec(ns.value); if (m) { LV.cls = m[1]; LV.extraSub = m[2]; } else { LV.cls = ns.value; LV.extraSub = ''; } LV.sub = ''; LV.ans = {}; LV.hp = ''; renderLevelUp(); } };
  const sb = $('#lvSub'); if (sb) sb.onchange = () => { LV.sub = sb.value; renderLevelUp(); };
  const hp = $('#lvHP'); if (hp) hp.oninput = () => { LV.hp = hp.value; };
}
function lvRoll() { const t = lvTarget(), r = rollExpr('1d' + t.c.hd, { need: true, label: 'Hit points for this level (d' + t.c.hd + ')' }), cm = mod('con', true); LV.hp = String(Math.max(1, r.total + cm)); $('#lvHP').value = LV.hp; $('#lvRollNote').textContent = `Rolled ${r.total} ${fmt(cm)} CON = ${LV.hp}`; }
function finishLevelUp() {
  const t = lvTarget(); if (!t.c) return;
  const needSub = !(t.row && t.row.sub) && t.nl >= t.c.sub.level;
  if (needSub && !LV.sub) { toast(`Choose your ${esc(t.c.sub.label)} first.`, 'fumble'); return; }
  if (!LV.skipAsk) { const miss = lvChoiceDefs({ ...t, row: t.row || null }).filter(d => d.def.type === 'asiOrFeat' ? !asiDone(LV.ans, d.id) : ansList(LV.ans, d.id).length < (d.def.n || 1));
    if (miss.length) { toast(`Still to choose: ${esc(miss.map(d => d.def.type === 'asiOrFeat' ? 'Ability Score Improvement or feat' : d.def.label || choiceLabel(d.def)).join(', '))}.`, 'fumble', 9000, { label: 'Level up anyway', fn: () => { if (LV) { LV.skipAsk = true; finishLevelUp(); } } }); return; } }
  const gainTotal = Math.max(1, N($('#lvHP').value) || 1), conM = mod('con', true);
  const oldMax = maxHp();
  if (t.isNew) {
    S.classes.push({ key: t.key, level: 1, sub: LV.sub || '' });
    const mc = t.c.mc || {};
    if (mc.armorCats) S.profs.armor = [...new Set((S.profs.armor || []).concat(mc.armorCats))];
    if (mc.weaponCats) S.profs.weapons = [...new Set((S.profs.weapons || []).concat(mc.weaponCats))];
    S.profArmor = profArmorText(); S.profWeapons = profWeaponText();
    if (/thieves' tools/i.test(mc.profs || '')) addText('profTools', ["Thieves' tools"]);
    if (/tinker's tools/i.test(mc.profs || '')) addText('profTools', ["Tinker's tools"]);
  } else { t.row.level = t.nl; if (LV.sub) t.row.sub = LV.sub; }
  if (LV.extraSub && !t.isNew) { t.row.extraSubs = [...new Set((t.row.extraSubs || []).concat(LV.extraSub))]; t.row.extraSubLv = Object.assign({}, t.row.extraSubLv, { [LV.extraSub]: N((t.row.extraSubLv || {})[LV.extraSub]) + 1 }); }
  const sub = subOf(clsRows().find(r => r.key === t.key));
  if (sub && sub.profs && t.nl === t.c.sub.level) { if (sub.profs.armorCats) S.profs.armor = [...new Set((S.profs.armor || []).concat(sub.profs.armorCats))]; if (sub.profs.weaponCats) S.profs.weapons = [...new Set((S.profs.weapons || []).concat(sub.profs.weaponCats))]; S.profArmor = profArmorText(); S.profWeapons = profWeaponText(); }
  const notes = [];
  lvChoiceDefs({ ...t, row: clsRows().find(r => r.key === t.key), isNew: t.isNew }).forEach(d => {
    const cid = d.id === 'asi' ? `asi.${t.key}.${t.nl}` : d.id === 'mcskill' ? `mc.${t.key}.skills` : `ch.${t.key}.${d.id.slice(2).split('.')[0]}.${t.nl}.${d.def.type}`;
    S.answered = S.answered || {};
    if (d.def.type === 'asiOrFeat') { if (asiDone(LV.ans, d.id)) S.answered[cid] = (LV.ans[d.id] || []).slice(); const r = applyAsiOrFeat(LV.ans, d.id); if (r) notes.push(r); return; }
    const v = ansList(LV.ans, d.id); if (!v.length) return;
    if (v.length >= (d.def.n || 1)) S.answered[cid] = v;
    applyChoice(d.def, v, LV.ans, d.id); notes.push(`${choiceLabel(d.def)}: ${v.join(', ')}`);
  });
  S.hp.base = N(S.hp.base) + (gainTotal - conM);
  rebuildAuto();
  const gained = maxHp() - oldMax; S.hp.cur = N(S.hp.cur) + Math.max(0, gained);
  const nl = totalLevel();
  pendingLabel = `Level up: ${t.c.name} ${t.nl}`;
  S.notes.unshift({ date: new Date().toISOString().slice(0, 10), title: `Reached level ${nl} (${t.c.name} ${t.nl})`, text: [`+${gained} max HP (now ${maxHp()}).`].concat(notes).join('\n') });
  const caster = casterFor(t.key);
  LV = null; closeModal(true); save(); render();
  toast(`<div class="lvtoast"><b class="lvnum">${nl}</b><div>${esc(who())} reached level ${nl}!<div class="det">${esc(t.c.name)} ${t.nl} · +${gained} max HP${notes.length ? ' · ' + esc(notes.join(' · ')) : ''}</div></div></div>`, 'crit', 12000,
    [caster ? { label: 'Choose spells', fn: () => openLevelSpells(t.key, t.nl) } : null, { label: 'Roll20', fn: () => { UI.macroChanged = true; saveUI(); openMacros(); } }].filter(Boolean));
  // Second step of levelling up: new cantrips/spells and the swaps the class allows.
  if (caster || t.key === 'warlock') openLevelSpells(t.key, t.nl, t.isNew);
}
// ---------- Level-up: spells ----------
let LS = null;
const ASI_LEVELS = k => (CL[k] && CL[k].asi) || [4, 8, 12, 16, 19];
function lsList(key) {
  const c = casterFor(key); if (!c) return [];
  const exp = expandedFor(key).map(n => n.toLowerCase()), maxL = maxSpellLevelFor(c);
  return DND.spells.filter(sp => (sp.classes.includes(c.list) || exp.includes(sp.name.toLowerCase())) && sp.level <= maxL);
}
function openLevelSpells(key, nl, isNew) {
  const c = casterFor(key);
  const knownNames = new Set(S.spells.map(x => x.name.toLowerCase()));  // includes racial and feat spells, so nothing is picked twice
  const needC = c ? Math.max(0, (cantripLimit(c) || 0) - countCantrips(key)) : 0;
  const needS = c && !c.prepared && !c.book ? Math.max(0, (spellLimit(c) || 0) - countKnown(key)) : c && c.book ? 2 : 0;
  const swap = c && !c.prepared && !c.book && !isNew && ['warlock', 'sorcerer', 'bard', 'ranger', 'rangerrev'].includes(key) || (c && c.known && !c.prepared && !c.book && !isNew);
  const ev = key === 'warlock' && ASI_LEVELS('warlock').includes(nl);
  const versatile = !ev && ['sorcerer', 'bard', 'cleric', 'druid', 'wizard'].includes(key) && ASI_LEVELS(key).includes(nl);
  const invSwap = key === 'warlock' && (S.picks.invocation || []).length && !isNew;
  const prepAfter = !!(c && c.prepared && !c.book);
  if (!needC && !needS && !swap && !ev && !versatile && !invSwap) { if (prepAfter) openPrepare(key, `${CL[key] ? CL[key].name : key} ${nl}: you can prepare ${spellLimit(c)} spells now, up to ${ORD[maxSpellLevelFor(c) - 1] || '1st'} level.`); return; }
  LS = { prepAfter, key, nl, needC, needS, swap, ev, versatile, invSwap, cants: [], spells: [], out: '', in: '', invOut: '', invIn: '', evMode: '', evOut: '', evIn: '', known: knownNames };
  renderLevelSpells();
}
function renderLevelSpells() {
  const t = LS; if (!t) return;
  const c = casterFor(t.key), list = lsList(t.key), name = CL[t.key] ? CL[t.key].name : t.key;
  const avail = l => list.filter(x => x.level === l && !t.known.has(x.name.toLowerCase()) && x.name !== t.in && x.name !== t.evIn);
  const box = (arr, kind, x) => `<label class="crrow sel${arr.includes(x.name) ? ' on' : ''}"><input type="checkbox" data-ls="${kind}" value="${esc(x.name)}"${arr.includes(x.name) ? ' checked' : ''}><div><b>${esc(x.name)}</b> <span class="hint">${x.level ? ORD[x.level - 1] + ' · ' : ''}${esc(x.school)} · ${esc(x.time)}${x.conc ? ' · conc' : ''}${x.ritual ? ' · ritual' : ''}</span><div class="hint">${esc(x.summary)}</div></div></label>`;
  const opts = (arr, cur) => arr.map(([v, l]) => `<option value="${esc(v)}"${cur === v ? ' selected' : ''}>${esc(l)}</option>`).join('');
  const mine = S.spells.filter(x => x.cls === t.key && !x.auto && !x.always);
  let h = `<div id="lsmodal"><h3>${esc(name)} ${t.nl}: spells</h3><p class="hint">Pick what your new level gives you. You can also do this later from the Spells tab.</p>`;
  if (t.needC) h += `<div class="ls-sec"><div class="wz-sph"><b>New cantrip${t.needC > 1 ? 's' : ''}</b><span class="cnt${t.cants.length === t.needC ? ' done' : t.cants.length > t.needC ? ' bad' : ''}">${t.cants.length} / ${t.needC}</span></div><div class="crlist short">${avail(0).map(x => box(t.cants, 'c', x)).join('')}</div></div>`;
  if (t.needS) {
    const lvls = [...new Set(list.filter(x => x.level > 0).map(x => x.level))].sort((a, b) => a - b), cur = t.lv && lvls.includes(t.lv) ? t.lv : lvls[lvls.length - 1];
    h += `<div class="ls-sec"><div class="wz-sph"><b>${c.book ? 'Add to your spellbook' : 'New spell' + (t.needS > 1 ? 's' : '')}</b><span class="cnt${t.spells.length === t.needS ? ' done' : t.spells.length > t.needS ? ' bad' : ''}">${t.spells.length} / ${t.needS}</span></div>
      <div class="segmini lvtabs">${lvls.map(l => `<button class="${l === cur ? 'on' : ''}" data-act="lslv" data-v="${l}">${ORD[l - 1]}${t.spells.filter(n => (SPI(n) || {}).level === l).length ? ` <b>${t.spells.filter(n => (SPI(n) || {}).level === l).length}</b>` : ''}</button>`).join('')}</div>
      <div class="crlist short">${avail(cur).map(x => box(t.spells, 's', x)).join('')}</div></div>`;
  }
  if (t.swap && mine.some(x => N(x.level) > 0)) h += `<div class="ls-sec"><div class="wz-sph"><b>Replace a spell</b><span class="hint">Optional — swap one ${esc(name)} spell you know for another.</span></div>
    <div class="row"><select class="f" data-lsf="out"><option value="">— keep all —</option>${opts(mine.filter(x => N(x.level) > 0).map(x => [x.name, x.name]), t.out)}</select><span>→</span>
    <select class="f" data-lsf="in"${t.out ? '' : ' disabled'}><option value="">— choose —</option>${opts(list.filter(x => x.level > 0 && !t.known.has(x.name.toLowerCase()) && !t.spells.includes(x.name)).map(x => [x.name, `${x.name} (${ORD[x.level - 1]})`]), t.in)}</select></div></div>`;
  if (t.invSwap) {
    const inv = DND.options.invocation.list, ctx = { cls: 'warlock', level: t.nl };
    h += `<div class="ls-sec"><div class="wz-sph"><b>Replace an invocation</b><span class="hint">Optional — swap one invocation for another you qualify for.</span></div>
    <div class="row"><select class="f" data-lsf="invOut"><option value="">— keep all —</option>${opts(S.picks.invocation.map(n => [n, n]), t.invOut)}</select><span>→</span>
    <select class="f" data-lsf="invIn"${t.invOut ? '' : ' disabled'}><option value="">— choose —</option>${inv.filter(e => !S.picks.invocation.includes(e[0]) && !optPrereq(e[2], ctx)).map(e => `<option value="${esc(e[0])}"${t.invIn === e[0] ? ' selected' : ''}>${esc(e[0])} — ${esc(e[1])}</option>`).join('')}</select></div></div>`;
  }
  if (t.ev || t.versatile) {
    const myC = S.spells.filter(x => x.cls === t.key && N(x.level) === 0 && !x.always).map(x => [x.name, x.name]);
    const modes = [['', 'Nothing'], ['cantrip', 'Replace a cantrip']].concat(t.ev ? [['pact', 'Replace your Pact Boon']].concat(t.nl >= 12 ? [['arcanum', 'Replace a Mystic Arcanum spell']] : []) : []);
    h += `<div class="ls-sec"><div class="wz-sph"><b>${t.ev ? 'Eldritch Versatility' : 'Cantrip Versatility'}</b><span class="hint">Optional (Tasha's): at an Ability Score Improvement level you may swap one of these.</span></div>
      <div class="segmini">${modes.map(([v, l]) => `<button class="${t.evMode === v ? 'on' : ''}" data-act="lsev" data-v="${v}">${l}</button>`).join('')}</div>`;
    if (t.evMode === 'cantrip') h += `<div class="row"><select class="f" data-lsf="evOut"><option value="">— cantrip to drop —</option>${opts(myC, t.evOut)}</select><span>→</span><select class="f" data-lsf="evIn"><option value="">— new cantrip —</option>${opts(list.filter(x => x.level === 0 && !t.known.has(x.name.toLowerCase()) && !t.cants.includes(x.name)).map(x => [x.name, x.name]), t.evIn)}</select></div>`;
    if (t.evMode === 'pact') h += `<div class="row"><span>${esc((S.picks.pactBoon || [])[0] || 'No pact boon')}</span><span>→</span><select class="f" data-lsf="evIn"><option value="">— new pact boon —</option>${DND.options.pactBoon.list.filter(e => !(S.picks.pactBoon || []).includes(e[0]) && !optPrereq(e[2], { cls: 'warlock', level: t.nl })).map(e => `<option value="${esc(e[0])}"${t.evIn === e[0] ? ' selected' : ''}>${esc(e[0])}</option>`).join('')}</select></div><p class="hint">Invocations that need your old pact stop working until you replace them.</p>`;
    if (t.evMode === 'arcanum') h += `<p class="hint">Edit the Mystic Arcanum spell in the Spells tab (remove the old one and add the new one of the same level).</p>`;
    h += '</div>';
  }
  h += `<div class="actions"><button class="btn" data-act="close">Later</button><button class="btn gold" data-act="lsok">Save spells</button></div></div>`;
  if ($('#lsmodal') && $('#modal').classList.contains('open')) { const sc = $('#modal-body').scrollTop; $('#modal-body').innerHTML = h; $('#modal-body').scrollTop = sc; } else { openModal(h, null, true); }
}
function lsInput(t) {
  if (!LS) return;
  if (t.dataset.ls) { const arr = t.dataset.ls === 'c' ? LS.cants : LS.spells, lim = t.dataset.ls === 'c' ? LS.needC : LS.needS; const k = arr.indexOf(t.value); if (t.checked && k < 0) { if (arr.length >= lim) { t.checked = false; toast(`You can pick ${lim}.`); return; } arr.push(t.value); } else if (!t.checked && k >= 0) arr.splice(k, 1); }
  if (t.dataset.lsf) { LS[t.dataset.lsf] = t.value; if (t.dataset.lsf === 'out' && !t.value) LS.in = ''; if (t.dataset.lsf === 'invOut' && !t.value) LS.invIn = ''; }
  renderLevelSpells();
}
function lsSave() {
  const t = LS; if (!t) return;
  const added = [];
  t.cants.concat(t.spells).forEach(n => { if (!S.spells.some(x => x.cls === t.key && x.name.toLowerCase() === n.toLowerCase())) { S.spells.push(spellEntry(n, t.key)); added.push(n); } });
  if (t.out && t.in) { const k = S.spells.findIndex(x => x.cls === t.key && x.name === t.out); if (k >= 0) S.spells.splice(k, 1, spellEntry(t.in, t.key)); added.push(`${t.in} (replaced ${t.out})`); }
  if (t.invOut && t.invIn) { S.picks.invocation = S.picks.invocation.map(n => n === t.invOut ? t.invIn : n); if (S.grantSpells) delete S.grantSpells[t.invOut]; added.push(`${t.invIn} (replaced ${t.invOut})`); }
  if (t.evMode === 'cantrip' && t.evOut && t.evIn) { const k = S.spells.findIndex(x => x.cls === t.key && x.name === t.evOut); if (k >= 0) S.spells.splice(k, 1, spellEntry(t.evIn, t.key)); added.push(`${t.evIn} (replaced ${t.evOut})`); }
  if (t.evMode === 'pact' && t.evIn) { const old = (S.picks.pactBoon || [])[0]; S.picks.pactBoon = [t.evIn]; if (old && S.grantSpells) delete S.grantSpells[old]; added.push(`${t.evIn} (replaced ${old || 'none'})`); }
  const pa = t.prepAfter; LS = null; closeModal(true); pendingLabel = 'Level-up spells'; save(); rebuildAuto(); render();
  if (added.length) toast('Added: ' + esc(added.join(', ')), '', 6000);
  if (pa) openPrepare(t.key, `${CL[t.key] ? CL[t.key].name : t.key} ${t.nl}: choose today's prepared spells.`);
}

function applyChoice(def, v, CH, id) {
  switch (def.type) {
    case 'skill': v.forEach(n => setSkill(n, 1)); break;
    case 'expertise': v.forEach(n => setSkill(n, 2)); break;
    case 'language': addText('languages', v); break;
    case 'tool': v.forEach(n => /^Language: /.test(n) ? addText('languages', [n.slice(10)]) : addText('profTools', [n])); break;
    case 'weapon': S.profs.weaponNames = [...new Set((S.profs.weaponNames || []).concat(v))]; S.profWeapons = profWeaponText(); break;
    case 'asi': v.forEach(a => { S.abilities[a] = Math.min(20, N(S.abilities[a]) + (def.amount || 1)); }); break;
    case 'cantrip': v.forEach(n => { const c = def.cls || 'race'; if (!S.spells.some(s => s.name === n && s.cls === c)) { const sp = spellEntry(n, c); if (c === 'race') sp.ab = def.ab || 'int'; sp.always = true; sp.note = def.label || ''; S.spells.push(sp); } }); break;
    case 'option': S.race.choices = Object.assign({}, S.race.choices, { [def.label]: v[0] }); break;
    default: if (DND.options[def.type]) {
      S.picks[def.type] = [...new Set((S.picks[def.type] || []).concat(v))];
      v.forEach((name, k) => { const e = DND.options[def.type].list.find(x => x[0] === name), fx = (e && e[3]) || {};
        (fx.skills || []).forEach(sk => setSkill(sk, 1));
        if (fx.grant && CH) { S.grantSpells = S.grantSpells || {}; S.grantSpells[name] = fx.grant.flatMap((gd, j) => ansList(CH, `${id}.g${k}.${j}`)); } });
    }
  }
}

// ---------- Character creation wizard ----------
let W = null;
const WSTEPS = ['Start', 'Race', 'Class', 'Abilities', 'Background', 'Class options', 'Spells', 'Equipment', 'Review'];
function newW() { return { sources: defaultSources(), step: 0, name: '', player: '', alignment: '', portrait: '', race: '', sub: '', tasha: false, ans: {}, classes: [{ key: '', level: 1, sub: '' }], method: 'pointbuy', base: { str: '', dex: '', con: '', int: '', wis: '', cha: '' }, rolls: [], bg: '', hpMode: 'avg', hpRolls: [], equip: 'kit', gold: '', kitOff: {}, spells: {} }; }
function openWizard() { W = newW(); applySources(W.sources); $('#wizard').classList.add('open'); document.body.classList.add('wizopen'); renderWizard(); }
function closeWizard() { if (S.created) applySources(S.sources); $('#wizard').classList.remove('open'); document.body.classList.remove('wizopen'); W = null; }
const wzRace = () => { const r = DND.races[W.race]; if (!r) return null; const s = (r.subraces || {})[W.sub] || {}; return { r, s, name: s.name || r.name }; };
function wzRaceChoices() {
  const x = wzRace(); if (!x) return [];
  const { r, s } = x; let ch = (s.replaceChoices ? [] : r.choices || []).concat(s.choices || []);
  return ch;
}
function wzRaceAsi() {
  const x = wzRace(); if (!x) return { fixed: {}, mode: '' };
  const { r, s } = x; let a = s.asiReplace ? s.asi : r.asi;
  if (!s.asiReplace && s.asi && typeof s.asi === 'object' && typeof a === 'object') { a = { ...a }; Object.entries(s.asi).forEach(([k, v]) => a[k] = (a[k] || 0) + v); }
  if (typeof a === 'string') return { fixed: {}, mode: a };
  if (W.tasha) { const vals = Object.values(a || {}).sort((p, q) => q - p); return { fixed: {}, mode: 'tasha', vals }; }
  return { fixed: a || {}, mode: '' };
}
function wzRacialBonus() {
  const ra = wzRaceAsi(), out = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  Object.entries(ra.fixed).forEach(([k, v]) => out[k] += v);
  const fl = W.ans['race.asi'] || [];
  if (ra.mode === 'flex' || ra.mode === 'lineage') { if ((fl[0] || '21') === '21') { if (fl[1]) out[fl[1]] += 2; if (fl[2]) out[fl[2]] += 1; } else [fl[1], fl[2], fl[3]].forEach(a => { if (a) out[a] += 1; }); }
  if (ra.mode === 'lineage1' && fl[1]) out[fl[1]] += 2;
  if (ra.mode === 'tasha') (ra.vals || []).forEach((v, k) => { if (fl[k + 1]) out[fl[k + 1]] += v; });
  wzRaceChoices().forEach((c, k) => { if (c.type === 'asi') ansList(W.ans, 'race.' + k).forEach(a => out[a] += c.amount || 1); });
  return out;
}
function wzRaceAsiUI() {
  const ra = wzRaceAsi(), fl = W.ans['race.asi'] || [];
  const abSel = (k, lbl) => `<select class="f" data-ch="race.asi" data-k="${k}"><option value="">${lbl}</option>${AB.map(a => `<option value="${a}"${fl[k] === a ? ' selected' : ''}>${ABN[a]}</option>`).join('')}</select>`;
  if (ra.mode === 'flex' || ra.mode === 'lineage') { const m = fl[0] || '21'; return `<div class="chq"><span class="lbl">Ability score increases</span><div class="chsel"><select class="f" data-ch="race.asi" data-k="0"><option value="21"${m === '21' ? ' selected' : ''}>+2 and +1</option><option value="111"${m === '111' ? ' selected' : ''}>+1 to three</option></select>${m === '21' ? abSel(1, '+2 to…') + abSel(2, '+1 to…') : abSel(1, '+1 to…') + abSel(2, '+1 to…') + abSel(3, '+1 to…')}</div></div>`; }
  if (ra.mode === 'lineage1') return `<div class="chq"><span class="lbl">Ability score increase</span><div class="chsel">${abSel(1, '+2 to…')}</div></div>`;
  if (ra.mode === 'tasha') return `<div class="chq"><span class="lbl">Ability score increases (moved)</span><div class="chsel">${ra.vals.map((v, k) => abSel(k + 1, `+${v} to…`)).join('')}</div></div>`;
  const f = Object.entries(ra.fixed); return f.length ? `<p class="hint">Ability increases: ${f.map(([k, v]) => `${AB3[k]} +${v}`).join(', ')}</p>` : '';
}
const wzBaseScore = a => W.base[a] === '' ? (W.method === 'pointbuy' ? 8 : 10) : N(W.base[a]);
function wzScores() { const rb = wzRacialBonus(), o = {}; AB.forEach(a => o[a] = wzBaseScore(a) + rb[a]); return o; }
// Choices left blank in the wizard (Ability Score Improvements, skills, fighting styles, totems…)
function asiDone(CH, id) { const c = CH[id] || [], m = c[0]; if (!m) return false; if (m === 'feat') { const n = ansList(CH, id + '.feat')[0]; return !!n && featSubDefs(n).every((d, k) => ansList(CH, id + '.feat.f0.' + k).length >= (d.n || 1)); } return m === 'one' ? !!c[1] : !!(c[1] && c[2]); }
function wzUnanswered() {
  const out = [];
  wzRaceChoices().forEach((c, k) => { if (c.type === 'asi') return; if (ansList(W.ans, 'race.' + k).length < (c.n || 1)) out.push({ label: `${choiceLabel(c)} (race)`, step: 1 }); });
  const b = DND.backgrounds[W.bg];
  if (b) { if (b.skillChoice && ansList(W.ans, 'bg.skill').length < b.skillChoice.n) out.push({ label: 'Background skill', step: 4 }); if (b.toolChoice && ansList(W.ans, 'bg.tool').length < b.toolChoice.n) out.push({ label: 'Background tool', step: 4 }); if (b.langs && ansList(W.ans, 'bg.lang').length < b.langs) out.push({ label: 'Background language', step: 4 }); }
  wzClassChoiceDefs().forEach(d => {
    if (d.def.type === 'asiOrFeat') { if (!asiDone(W.ans, d.id)) out.push({ label: `${CL[d.cls].name} level ${d.lvl}: Ability Score Improvement or feat`, step: 5 }); return; }
    if (ansList(W.ans, d.id).length < (d.def.n || 1)) out.push({ label: d.def.label || choiceLabel(d.def), step: 5 });
  });
  // Spells: fewer cantrips or spells than the class gets
  try { wzSpellPlan().forEach(p => { const ch = W.spells[p.key] || [], nC = ch.filter(n => (SPI(n) || {}).level === 0).length, nS = ch.length - nC, target = p.book ? p.book : p.lim;
    if (p.cant && nC < p.cant) out.push({ label: `${p.name} cantrips (${nC} of ${p.cant})`, step: 6 });
    if (target && p.maxL && nS < target) out.push({ label: `${p.name} ${p.book ? 'spellbook spells' : p.cd.prepared ? 'prepared spells' : 'spells known'} (${nS} of ${target})`, step: 6 }); }); } catch (e) {}
  return out;
}
// Scores after ASIs and half-feats picked in the wizard.
function wzFinalScores(sc) {
  const o = { ...sc }, bump = (a, n) => { if (a && o[a] != null) o[a] = Math.min(20, o[a] + n); };
  wzClassChoiceDefs().forEach(d => { if (d.def.type !== 'asiOrFeat') return; const c = W.ans[d.id] || [];
    if (c[0] === 'one') bump(c[1], 2); else if (c[0] === 'two') { bump(c[1], 1); bump(c[2], 1); }
    else if (c[0] === 'feat') { const n = ansList(W.ans, d.id + '.feat')[0], ft = n && DND.feats.find(x => x[0] === n), e = (ft && ft[4]) || {}; if (e.asiFixed) Object.entries(e.asiFixed).forEach(([a, v]) => bump(a, v)); featSubDefs(n || '').forEach((sd, k) => { if (sd.type === 'asi') ansList(W.ans, d.id + '.feat.f0.' + k).forEach(a => bump(a, 1)); }); } });
  return o;
}
// Skills you already have: on the sheet, or (in creation) the fixed ones from your race and background.
function knownSkills() {
  const out = new Set();
  try { if (W && $('#wizard').classList.contains('open')) { const x = wzRace(); if (x) (x.r.skills || []).concat(x.s.skills || []).forEach(n => out.add(String(n).toLowerCase())); const b = DND.backgrounds[W.bg]; if (b) (b.skills || []).forEach(n => out.add(String(n).toLowerCase())); }
    else (S.skills || []).forEach(s => { if (N(s.prof) >= 1) out.add(String(s.name).toLowerCase()); }); } catch (e) {}
  return out;
}
// Languages you already have: on the sheet, or (in creation) from your race and class.
function wzRaceLangs() { const x = wzRace(); if (!x) return []; return [...new Set((x.r.languages || []).concat(x.s.languages || []))]; }
function knownLangs() {
  const out = new Set();
  if (W && $('#wizard').classList.contains('open')) { wzRaceLangs().forEach(l => out.add(l.toLowerCase())); wzClassRows().forEach(r => (CL[r.key].languages || []).forEach(l => out.add(l.toLowerCase()))); }
  else (S.langs || []).forEach(l => out.add(String(l).toLowerCase()));
  return out;
}
// Spells your race (and its cantrip pick) already gives you in creation.
function wzRacialSpells() {
  const x = wzRace(), out = new Set(); if (!x) return out;
  (x.r.spells || []).concat(x.s.spells || []).forEach(z => out.add(String(z[1]).toLowerCase()));
  wzRaceChoices().forEach((c, k) => { if (c.type === 'cantrip') ansList(W.ans, 'race.' + k).forEach(n => out.add(n.toLowerCase())); });
  return out;
}
function wzClassRows() { return W.classes.filter(r => CL[r.key]); }
function wzTotalLevel() { return wzClassRows().reduce((t, r) => t + N(r.level), 0); }
function wzClassChoiceDefs() {
  const out = []; const rows = wzClassRows();
  rows.forEach((r, ri) => {
    const c = CL[r.key], s = r.sub ? c.subclasses[r.sub] : null, L = N(r.level);
    if (ri === 0) out.push({ id: `cls.skills`, def: { type: 'skill', n: c.skills.n, from: c.skills.from, label: `${c.name} skills` }, cls: r.key });
    else if (c.mc && c.mc.skills) out.push({ id: `mc.${r.key}.skills`, def: { type: 'skill', n: c.mc.skills, from: c.skills.from, label: `${c.name} multiclass skill` }, cls: r.key });
    c.asi.filter(l => l <= L).forEach(l => out.push({ id: `asi.${r.key}.${l}`, def: { type: 'asiOrFeat' }, cls: r.key, lvl: l }));
    (c.choices || []).concat((s && s.choices) || []).forEach((ch, k) => { if (ch.level <= L) out.push({ id: `ch.${r.key}.${k}.${ch.level}.${ch.type}`, def: { ...ch, label: `${choiceLabel(ch)} (${c.name} ${ch.level})` }, cls: r.key }); });
  });
  return out;
}
function wzSpellPlan() {
  // Builds a temporary S-like view for the chosen classes to know limits.
  const rows = wzClassRows(), sc = wzScores(), PBw = Math.ceil(Math.max(1, wzTotalLevel()) / 4) + 1, out = [];
  rows.forEach(r => {
    const c = CL[r.key], s = r.sub ? c.subclasses[r.sub] : null, L = N(r.level);
    let cd = c.caster; if (!cd && s && s.caster && L >= c.sub.level) cd = s.caster;
    if (!cd || (cd.from && L < cd.from)) return;
    const m = Math.floor((sc[cd.ab] - 10) / 2);
    const maxL = cd.type === 'pact' ? N(cd.pactLevel[L - 1]) : (FULL[cd.type === 'full' ? L : cd.type === 'third' ? (L >= 3 ? Math.ceil(L / 3) : 0) : Math.ceil(L / 2)] || []).length;
    let lim = null;
    if (cd.prepared) { const e = String(cd.prepared).replace(/[a-z]+/g, w => AB.includes(w) ? '(' + Math.floor((sc[w] - 10) / 2) + ')' : CL[w] ? '(' + L + ')' : w); try { lim = Math.max(1, Math.floor(safeCalc(e, { floor: Math.floor }))); } catch (x) { lim = 1; } }
    else if (cd.known) lim = N(cd.known[L - 1]);
    const book = cd.book ? 6 + 2 * (L - 1) : 0;
    const exp = s && s.spellMode === 'expanded' && s.spells ? Object.keys(s.spells).filter(lv => L >= N(lv)).flatMap(lv => s.spells[lv]).map(n => n.toLowerCase()) : [];
    const always = s && s.spellMode === 'always' && s.spells ? Object.keys(s.spells).filter(lv => L >= N(lv)).flatMap(lv => s.spells[lv]) : [];
    out.push({ key: r.key, name: c.name, cd, maxL, lim, book, cant: cd.cantrips ? N(cd.cantrips[L - 1]) : 0, list: cd.list, exp, always, mod: m, PB: PBw });
  });
  return out;
}
function kitItems() {
  const c = CL[(wzClassRows()[0] || {}).key], b = DND.backgrounds[W.bg];
  return (c ? c.kit.map(k => ['class', k]) : []).concat(b && b.equip ? b.equip.map(k => ['bg', k]) : []);
}
function renderWizard() {
  if (!W) return;
  const st = W.step;
  let body = '';
  if (st === 0) {
    body = `<div class="wz-intro"><p>Build any 5e (2014) character. Every choice can be changed later on the sheet.</p></div>
      <div class="wz-grid">${fld('Character name', `<input class="f" data-wz="name" value="${esc(W.name)}" placeholder="Name" autofocus>`)}${window.SHEET_PAGES ? '' : fld('Player', `<input class="f" data-wz="player" value="${esc(W.player)}" placeholder="Your name">`)}
      ${fld('Alignment', `<select class="f" data-wz="alignment"><option value="">—</option>${DND.alignments.map(a => `<option${W.alignment === a ? ' selected' : ''}>${esc(a)}</option>`).join('')}</select>`)}</div>
      <div class="row" style="margin-top:12px"><img class="wz-portrait" src="${esc(W.portrait || PLACEHOLDER)}" alt=""><button class="btn" data-wact="portrait">${W.portrait ? 'Change portrait' : 'Add a portrait'}</button><span class="hint">Optional. The sheet's colors can match it.</span></div>
      <div class="wz-src"><h4>Books for this character</h4><p class="hint">Only content from the books you tick will be offered. You can change this later in Settings → Books.</p>${sourcesHTML(W.sources)}</div>
      <p class="hint" style="margin-top:16px">Already have a character exported from this sheet? <button class="linkbtn" data-wact="import">Import it</button></p>
      <div class="wz-ddb bottom"><div><b>Made your character on D&amp;D Beyond?</b><span class="hint">Bring it over: classes, scores, spells, equipment and notes.</span></div><button class="btn" data-wact="ddb">Import from D&amp;D Beyond</button></div>`;
  } else if (st === 1) {
    const x = wzRace();
    body = `<div class="wz-grid">${fld('Race', `<select class="f" data-wz="race"><option value="">— choose a race —</option>${DND.raceGroups.map(([g, ks]) => `<optgroup label="${esc(g)}">${ks.filter(k => DND.races[k]).sort((a, b) => abc(DND.races[a].name, DND.races[b].name)).map(k => `<option value="${k}"${W.race === k ? ' selected' : ''}>${esc(DND.races[k].name)}${DND.races[k].src && DND.races[k].src !== 'PHB' ? ' (' + DND.races[k].src + ')' : ''}</option>`).join('')}</optgroup>`).join('')}</select>`)}
      ${wz3Cards('race')}
      ${x && x.r.subraces ? fld('Subrace / variant', `<select class="f" data-wz="sub"><option value="">— choose —</option>${Object.entries(x.r.subraces).sort(([, a], [, b]) => abc(a.name, b.name)).map(([k, s]) => `<option value="${k}"${W.sub === k ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select>`) : ''}</div>`;
    if (x) {
      const r = x.r, s = x.s, tr = (s.replaceTraits ? [] : r.traits || []).concat(s.traits || []);
      const sp = (r.spells || []).concat(s.spells || []);
      body += `<div class="wz-info"><p><b>${esc(x.name)}</b> · ${esc(s.size || r.size || 'Medium')} · speed ${s.speed || r.speed || 30} ft${(s.fly || r.fly) ? ', fly ' + (s.fly || r.fly) : ''}${(s.swim || r.swim) ? ', swim ' + (s.swim || r.swim) : ''}${(s.darkvision || r.darkvision) ? ' · darkvision ' + (s.darkvision || r.darkvision) + ' ft' : ''} · ${esc(DND.sources[s.src || r.src] || '')}</p>
        <p><b>Languages:</b> ${esc(wzRaceLangs().join(', ') || '—')}${wzRaceChoices().some(c => c.type === 'language') ? ' + your choice below' : ''}</p>
        <ul>${tr.map(t => `<li><b>${esc(t[0])}</b> — ${esc(t[1])}</li>`).join('')}${sp.map(z => `<li><b>${esc(z[1])}</b> at level ${z[0]} — ${esc(z[2])}</li>`).join('')}</ul>
        ${typeof (s.asiReplace ? s.asi : r.asi) === 'object' ? `<label class="checkline"><input type="checkbox" data-wz="tasha"${W.tasha ? ' checked' : ''}> Customize origin (Tasha's): move this race's ability increases to any scores</label>` : ''}
        ${wzRaceAsiUI()}
        ${wzRaceChoices().map((c, k) => choiceUI(W.ans, 'race.' + k, c)).join('')}</div>`;
    }
  } else if (st === 2) {
    const tl = wzTotalLevel();
    // Every character starts at level 1; higher levels (and multiclassing) come from Level Up, one level at a time,
    // so every choice a level gives is asked for in order.
    W.classes = [Object.assign(W.classes[0] || {}, { level: 1 })];
    body = `<p class="hint">Pick your class. Everyone starts at level 1 — use <b>Level Up</b> on the sheet to reach your level; it asks for each level's choices (subclass, Ability Score Improvements, spells) as you go, and is where you multiclass.</p>
      ${wz3Cards('class')}
      ${W.classes.map((r, i) => { const c = CL[r.key]; return `<div class="wz-cls"><div class="wz-grid">${fld('Class', `<select class="f" data-wzc="${i}" data-f="key"><option value="">— choose —</option>${DND.classOrder.map(k => `<option value="${k}"${r.key === k ? ' selected' : ''}>${esc(CL[k].name)}${CL[k].src !== 'PHB' ? ' (' + CL[k].src + ')' : ''}</option>`).join('')}</select>`)}
        ${c && c.sub.level <= 1 ? fld(c.sub.label, `<select class="f" data-wzc="${i}" data-f="sub"><option value="">— choose —</option>${bookSort(Object.entries(c.subclasses), ([, v]) => v.src, ([, v]) => v.name).map(([k, s]) => `<option value="${k}"${r.sub === k ? ' selected' : ''}>${esc(s.name)}${s.src !== 'PHB' ? ' (' + s.src + ')' : ''}</option>`).join('')}</select>`) : c ? `<span class="hint">${esc(c.sub.label)} at level ${c.sub.level}</span>` : ''}</div>
        ${c ? `<p class="hint">d${c.hd} Hit Dice · saves ${c.saves.map(a => AB3[a]).join(', ')} · ${esc(c.armor)} · ${esc(c.weapons)}</p>` : ''}
        ${c && r.sub && c.subclasses[r.sub] ? `<p class="hint">${esc(c.subclasses[r.sub].features.filter(f => f[0] <= 1).map(f => f[1]).join(' · '))}</p>` : ''}</div>`; }).join('')}`;
  } else if (st === 3) {
    const rb = wzRacialBonus(), sc = wzScores();
    const methods = [['pointbuy', 'Point buy'], ['array', 'Standard array'], ['roll', 'Roll 4d6'], ['manual', 'Enter scores']];
    let ctl = '';
    if (W.method === 'array' || W.method === 'roll') {
      const pool = W.method === 'array' ? DND.standardArray : W.rolls;
      ctl = W.method === 'roll' ? `<div class="row"><button class="btn gold" data-wact="roll">${W.rolls.length ? 'Reroll' : 'Roll'} 4d6 drop lowest ×6</button>${W.rolls.length ? `<span class="hint">Rolled: <b>${W.rolls.join(', ')}</b></span>` : ''}</div>` : `<p class="hint">Assign 15, 14, 13, 12, 10 and 8.</p>`;
      if (pool.length) ctl += `<div class="abgrid">${AB.map(a => `<label class="fld"><span class="lbl">${ABN[a]}</span><select class="f" data-wzab="${a}"><option value="">—</option>${pool.map((v, k) => [v, k]).filter(([, k]) => !AB.some(o => o !== a && W.base['_' + o] === String(k))).map(([v, k]) => `<option value="${k}"${W.base['_' + a] === String(k) ? ' selected' : ''}>${v}</option>`).join('')}</select><span class="hint">${rb[a] ? `+${rb[a]} race = ` : ''}<b>${W.base[a] === '' ? '—' : sc[a]}</b></span></label>`).join('')}</div>`;
    } else {
      const pb = W.method === 'pointbuy', spent = pb ? AB.reduce((t, a) => t + N(DND.pointBuy[wzBaseScore(a)]), 0) : 0;
      ctl = pb ? `<p class="pbleft">Points left <b class="${spent > 27 ? 'bad' : ''}">${27 - spent}</b> <span class="hint">of 27 · scores 8–15</span></p>` : '<p class="hint">Type your scores before racial bonuses.</p>';
      ctl += pb ? `<div class="abgrid">${AB.map(a => { const v = wzBaseScore(a), nextCost = v < 15 ? N(DND.pointBuy[v + 1]) - N(DND.pointBuy[v]) : 0; return `<div class="fld pbcell"><span class="lbl">${ABN[a]}</span>
          <div class="pbrow"><button type="button" class="pbbtn" data-wact="pb" data-a="${a}" data-d="-1" ${v <= 8 ? 'disabled' : ''} aria-label="Lower ${ABN[a]}">−</button><b class="pbval">${v}</b><button type="button" class="pbbtn" data-wact="pb" data-a="${a}" data-d="1" ${v >= 15 || spent + nextCost > 27 ? 'disabled' : ''} aria-label="Raise ${ABN[a]}">+</button></div>
          <span class="hint">cost ${N(DND.pointBuy[v])}${v < 15 ? ` · next +${nextCost}` : ' · max'}</span><span class="hint">${rb[a] ? `+${rb[a]} race = ` : ''}<b>${sc[a]}</b> (${fmt(Math.floor((sc[a] - 10) / 2))})</span></div>`; }).join('')}</div>`
        : `<div class="abgrid">${AB.map(a => `<label class="fld"><span class="lbl">${ABN[a]}</span><input class="f" type="number" inputmode="numeric" data-wzab="${a}" value="${esc(W.base[a])}" min="1" max="30"><span class="hint">${rb[a] ? `+${rb[a]} race = ` : ''}<b>${sc[a]}</b> (${fmt(Math.floor((sc[a] - 10) / 2))})</span></label>`).join('')}</div>`;
    }
    body = `<div class="segmini" style="margin-bottom:10px">${methods.map(([k, t]) => `<button class="${W.method === k ? 'on' : ''}" data-wact="method" data-v="${k}">${t}</button>`).join('')}</div>${ctl}
      <p class="hint">Ability Score Improvements from your class levels come on the Class options step.</p>`;
  } else if (st === 4) {
    const b = DND.backgrounds[W.bg];
    body = `${wz3Cards('bg')}<div class="wz-grid">${fld('Background', `<select class="f" data-wz="bg"><option value="">— choose —</option>${bookSort(Object.entries(DND.backgrounds), ([, v]) => v.src, ([, v]) => v.name).map(([k, v]) => `<option value="${k}"${W.bg === k ? ' selected' : ''}>${esc(v.name)}${v.src !== 'PHB' ? ' (' + v.src + ')' : ''}</option>`).join('')}</select>`)}</div>`;
    if (b) {
      body += `<div class="wz-info"><p>${b.skills && b.skills.length ? `<b>Skills:</b> ${esc(b.skills.join(', '))} · ` : ''}${b.tools && b.tools.length ? `<b>Tools:</b> ${esc(b.tools.join(', '))} · ` : ''}<b>Feature:</b> ${esc(b.feature[0])} — ${esc(b.feature[1])}</p>
        ${b.skillChoice ? choiceUI(W.ans, 'bg.skill', { type: 'skill', n: b.skillChoice.n, from: b.skillChoice.from }) : ''}
        ${b.toolChoice ? choiceUI(W.ans, 'bg.tool', { type: 'tool', n: b.toolChoice.n, from: b.toolChoice.from, orLang: b.toolChoice.orLang, label: b.toolChoice.orLang ? 'Tool or language' : 'Tool' }) : ''}
        ${b.langs ? choiceUI(W.ans, 'bg.lang', { type: 'language', n: b.langs }) : ''}
        ${b.feat ? `<p><b>Feat:</b> ${esc(b.feat)}</p>` + featSubUI(W.ans, 'bg.feat', b.feat) : ''}
        <p class="hint">Overlapping skill? Pick any other skill instead from the Core tab after creating.</p></div>`;
    }
  } else if (st === 5) {
    const defs = wzClassChoiceDefs();
    body = defs.length ? defs.map(d => d.def.type === 'asiOrFeat' ? `<div class="wz-asi"><span class="hint">${esc(CL[d.cls].name)} level ${d.lvl}</span>${asiOrFeatWz(d.id)}</div>` : choiceUI(W.ans, d.id, d.def, { cls: d.cls, level: N((W.classes.find(r => r.key === d.cls) || {}).level) || 1, sub: (W.classes.find(r => r.key === d.cls) || {}).sub })).join('') : '<p class="hint">Choose a class first.</p>';
  } else if (st === 6) {
    const plan = wzSpellPlan();
    const x = wzRace(); const rsp = x ? (x.r.spells || []).concat(x.s.spells || []) : [];
    body = plan.length ? plan.map(p => {
      const ch = W.spells[p.key] = W.spells[p.key] || [];
      const list = DND.spells.filter(s => (s.classes.includes(p.list) || p.exp.includes(s.name.toLowerCase())) && s.level <= p.maxL);
      const nC = ch.filter(n => (SPI(n) || {}).level === 0).length, nS = ch.length - nC;
      const target = p.book ? p.book : p.lim;
      const rh = wzRacialSpells(), elsewhere = n => rh.has(n.toLowerCase()) || Object.entries(W.spells).some(([k, arr]) => k !== p.key && (arr || []).includes(n));
      const row = s => `<label class="crrow sel${ch.includes(s.name) ? ' on' : ''}${elsewhere(s.name) && !ch.includes(s.name) ? ' dim' : ''}" data-q="${esc((s.name + ' ' + s.summary).toLowerCase())}"><input type="checkbox" data-wzsp="${p.key}" value="${esc(s.name)}"${ch.includes(s.name) ? ' checked' : ''}${elsewhere(s.name) && !ch.includes(s.name) ? ' disabled title="You already get this spell"' : ''}><div><b>${esc(s.name)}</b> <span class="hint">${esc(s.school)} · ${esc(s.time)} · ${esc(s.range)}${s.conc ? ' · conc' : ''}${s.ritual ? ' · ritual' : ''}</span><div class="hint">${esc(s.summary)}</div></div></label>`;
      const cants = list.filter(s => s.level === 0), lvls = [...new Set(list.filter(s => s.level > 0).map(s => s.level))].sort((a, b) => a - b);
      const cur = lvls.includes(N(W['lv' + p.key])) ? N(W['lv' + p.key]) : lvls[0];
      const perL = l => ch.filter(n => (SPI(n) || {}).level === l).length;
      const cantBlock = p.cant ? `<div class="wz-spsec"><div class="wz-sph"><b>Cantrips</b><span class="cnt${nC > p.cant ? ' bad' : nC === p.cant ? ' done' : ''}">${nC} / ${p.cant} chosen</span><span class="hint">At-will spells that never use a slot.</span></div>
        <input class="f" placeholder="Search cantrips…" data-wzq="${p.key}c" value="${esc(W['q' + p.key + 'c'] || '')}">
        <div class="crlist short">${cants.map(row).join('')}</div></div>` : '';
      const spellBlock = lvls.length && target ? `<div class="wz-spsec"><div class="wz-sph"><b>${p.book ? 'Spellbook' : p.cd.prepared ? 'Prepared spells' : 'Spells known'}</b><span class="cnt${nS > target ? ' bad' : nS === target ? ' done' : ''}">${nS} / ${target} chosen</span><span class="hint">${p.book ? 'Wizards copy these into their spellbook and prepare from it each day.' : p.cd.prepared ? 'You can change these after each long rest.' : 'Spread them across any level you can cast.'}</span></div>
        <div class="segmini lvtabs">${lvls.map(l => `<button class="${l === cur ? 'on' : ''}" data-wact="splv" data-k="${p.key}" data-v="${l}">${ORD[l - 1]} level${perL(l) ? ` <b>${perL(l)}</b>` : ''}</button>`).join('')}</div>
        <input class="f" placeholder="Search ${ORD[cur - 1]}-level spells…" data-wzq="${p.key}s" value="${esc(W['q' + p.key + 's'] || '')}">
        <div class="crlist short">${list.filter(s => s.level === cur).map(row).join('')}</div></div>` : '';
      return `<div class="wz-sp"><h4>${esc(p.name)} <span class="hint">${AB3[p.cd.ab]} · spell save DC ${8 + p.PB + p.mod} · up to ${p.maxL ? ORD[p.maxL - 1] : 'cantrips'} level</span></h4>
        ${p.always.length ? `<p class="hint">Always prepared (free): ${esc(p.always.join(', '))}</p>` : ''}${cantBlock}${spellBlock}</div>`;
    }).join('') : '<p class="hint">No spellcasting at your starting level.</p>';
    if (rsp.length) body += `<p class="hint">Racial spells are added automatically: ${esc(rsp.map(z => z[1] + ' (level ' + z[0] + ')').join(', '))}.</p>`;
  } else if (st === 7) {
    const c = CL[(wzClassRows()[0] || {}).key], b = DND.backgrounds[W.bg], kit = kitItems();
    body = `<div class="segmini" style="margin-bottom:10px"><button class="${W.equip === 'kit' ? 'on' : ''}" data-wact="equip" data-v="kit">Starting equipment</button><button class="${W.equip === 'gold' ? 'on' : ''}" data-wact="equip" data-v="gold">Starting gold instead</button></div>`;
    if (W.equip === 'kit') body += `<p class="hint">Untick anything you don't want. Choices like "a martial weapon" are set to a sensible default — swap items in Inventory any time, and add more from the full catalog.</p>
      <div class="kit">${kit.map(([src, k], i) => { const [n, q] = k.split(':'); return `<label class="checkline"><input type="checkbox" data-wzkit="${i}"${W.kitOff[i] ? '' : ' checked'}> ${esc(n)}${q ? ' ×' + q : ''} <span class="hint">${src === 'bg' ? 'background' : 'class'}</span>${packOf(n) ? `<span class="hint packin">— unpacks into ${esc(packOf(n).map(([x, c]) => (c ? c + ' × ' : '') + x.replace(/\s*\(.*\)$/, '').toLowerCase()).join(', '))}</span>` : ''}</label>`; }).join('')}</div>${b ? `<p class="hint">Plus ${b.gold} gp from your background.</p>` : ''}`;
    else body += `<div class="row"><button class="btn gold" data-wact="rollgold">Roll ${esc(c ? c.gold : '')} gp</button>${fld('Gold', `<input class="f" type="number" data-wz="gold" value="${esc(W.gold)}" style="width:110px">`)}</div><p class="hint">Buy gear from the catalog in Inventory after creating.</p>`;
    const extra = wzTotalLevel() - 1;
    if (extra > 0) body += `<h4 style="margin-top:16px">Hit points for levels 2–${wzTotalLevel()}</h4><div class="segmini"><button class="${W.hpMode === 'avg' ? 'on' : ''}" data-wact="hpmode" data-v="avg">Take the average</button><button class="${W.hpMode === 'roll' ? 'on' : ''}" data-wact="hpmode" data-v="roll">Roll</button></div>${W.hpMode === 'roll' ? `<p class="hint">${W.hpRolls.length ? 'Rolled: ' + W.hpRolls.join(', ') : ''} <button class="btn sm" data-wact="rollhp">${W.hpRolls.length ? 'Reroll' : 'Roll'}</button></p>` : ''}`;
  } else if (st === 8) {
    const sc = wzScores(), x = wzRace(), b = DND.backgrounds[W.bg];
    const probs = [];
    if (!x) probs.push('Choose a race'); else if (x.r.subraces && !W.sub) probs.push('Choose a subrace');
    if (!wzClassRows().length) probs.push('Choose a class'); if (wzTotalLevel() > 20) probs.push('Total level is over 20');
    wzClassRows().forEach(r => { const c = CL[r.key]; if (N(r.level) >= c.sub.level && !r.sub) probs.push(`Choose a ${c.sub.label} for ${c.name}`); });
    if (W.method === 'array' || W.method === 'roll') { if (AB.some(a => W.base[a] === '')) probs.push('Assign all ability scores'); }
    const todo = wzUnanswered();
    wzClassChoiceDefs().forEach(d => { const op = DND.options[d.def.type]; if (!op) return; const r = W.classes.find(x => x.key === d.cls) || {}; (W.ans[d.id] || []).forEach(v => { const e = op.list.find(x => x[0] === v); const no = e && optPrereq(e[2], { CH: W.ans, cls: d.cls, level: N(r.level), sub: r.sub }); if (no) probs.push(`${v} ${no}`); }); });
    body = `<div class="wz-review"><p><b>${esc(W.name || 'Unnamed hero')}</b> — ${esc(x ? x.name : '?')} ${esc(wzClassRows().map(r => CL[r.key].name + ' ' + r.level + (r.sub ? ' (' + CL[r.key].subclasses[r.sub].name + ')' : '')).join(' / '))}${b ? ' · ' + esc(b.name) : ''}</p>
      <div class="abrow">${(() => { const fin = wzFinalScores(sc); return AB.map(a => `<span><span class="lbl">${AB3[a]}</span><b>${fin[a]}</b> ${fmt(Math.floor((fin[a] - 10) / 2))}${fin[a] !== sc[a] ? `<small class="hint"> (${sc[a]} +${fin[a] - sc[a]})</small>` : ''}</span>`).join(''); })()}</div>
      ${todo.length ? `<div class="wz-todo"><b>Still to choose:</b><ul>${todo.map(t => `<li>${esc(t.label)} <button class="linkbtn" data-wact="go" data-v="${t.step}">Choose</button></li>`).join('')}</ul><span class="hint">You can create now and finish these later ${todo.every(t => t.step === 6) ? 'from the <b>Spells</b> tab' : todo.some(t => t.step === 6) ? 'from the <b>Spells</b> tab and <b>Settings → Unfinished choices</b>' : 'from <b>Settings → Unfinished choices</b>'}.</span></div>` : ''}
      ${probs.length ? `<p class="warn">${probs.map(esc).join(' · ')}</p>` : todo.length ? '' : '<p>Everything is set. You can change anything later — scores, skills, spells and items are all editable on the sheet.</p>'}
      <p class="hint">Scores include racial bonuses, Ability Score Improvements and half-feats.</p></div>`;
  }
  const sums = wz3Sums(), last = st === WSTEPS.length - 1;
  $('#wizard').innerHTML = `<div class="wz-box wz3">${typeof window.wzHeader === 'function' ? window.wzHeader() : ''}<div class="wz3-wrap"><aside class="wz3-side">${wz3Hero()}
      <div class="wz-head"><h2>Create your character</h2><div class="wz-steps">${WSTEPS.map((t, i) => `<button class="wz-step${i === st ? ' on' : ''}${i < st ? ' done' : ''}" data-wact="go" data-v="${i}" aria-label="Step ${i + 1}: ${t}"><span class="wz-sn">${i < st ? '✓' : i + 1}</span><span class="wz-st">${t}</span>${sums[i] && i !== st ? `<small class="wz3-sum">${esc(sums[i])}</small>` : ''}</button>`).join('')}</div><div class="wz-now">Step ${st + 1} of ${WSTEPS.length}<b>${WSTEPS[st]}</b></div></div></aside>
    <div class="wz3-main"><div class="wz-body"><h3>${WSTEPS[st]}</h3>${body}</div></div></div>
    <div class="wz-foot">${st ? '<button class="btn" data-wact="back">Back</button>' : ''}<span class="wz3-prog" aria-hidden="true"><i style="width:${Math.round((st + 1) / WSTEPS.length * 100)}%"></i></span><small class="wz3-of">Step ${st + 1} of ${WSTEPS.length}</small>${!last ? `<button class="btn gold" data-wact="next">Next<span class="wz3-nx">: ${WSTEPS[st + 1]}</span></button>` : '<button class="btn gold" data-wact="create">Create character</button>'}</div></div>`;
  { const g = $('#wizard .wz3-cards .sel'); if (g && g.parentElement) g.parentElement.scrollTop = Math.max(0, g.offsetTop - g.parentElement.offsetTop - 60); }
  $$('#wizard [data-wzq]').forEach(i => filterWzSpells(i));
  // Moving between steps: the new step slides in from the side you're heading (fades up on opening), and the step
  // marker pops / the progress bar fills. Re-drawing the same step (picking options) doesn't animate.
  const prevSt = W._shown; W._shown = st;
  if (prevSt !== st && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    const dir = prevSt == null ? 0 : st > prevSt ? 1 : -1, bd = $('#wizard .wz-body'), now = $('#wizard .wz-now'), on = $('#wizard .wz-step.on'), mob = document.documentElement.classList.contains('mobile');
    const inK = dir ? [{ opacity: 0, transform: `translateX(${dir * 22}px)` }, { opacity: 1, transform: 'none' }] : [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }];
    if (bd && bd.animate) bd.animate(inK, { duration: 280, easing: 'cubic-bezier(.2,.8,.3,1)' });
    if (now && now.animate && mob) now.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
    if (on && on.animate) on.animate(mob ? (dir >= 0 ? [{ transform: 'scaleX(.15)' }, { transform: 'none' }] : [{ opacity: .4 }, { opacity: 1 }]) : [{ transform: 'scale(.88)' }, { transform: 'none' }], { duration: mob ? 320 : 240, easing: 'cubic-bezier(.3,1.3,.5,1)' });
  }
}
// ----- the creation look: what's picked so far, step summaries, and races / classes / backgrounds as cards -----
// (the cards only pick a value in the step's own list, so everything else works exactly as before)
function wz3Sums() {
  const out = []; try { out[0] = W.name || ''; const x = wzRace(); out[1] = x ? x.name : ''; const c = W.classes && W.classes[0] && CL[W.classes[0].key]; out[2] = c ? c.name : '';
    out[3] = ({ pointbuy: 'Point buy', array: 'Standard array', roll: 'Rolled', manual: 'Entered' })[W.method] || ''; const b = W.bg && DND.backgrounds[W.bg]; out[4] = b ? b.name : ''; } catch (e) {}
  return out;
}
function wz3Hero() {
  let race = '', cls = '', fin = null; try { const x = wzRace(); race = x ? x.name : ''; const c = W.classes && W.classes[0] && CL[W.classes[0].key]; cls = c ? c.name + ' 1' : ''; fin = wzFinalScores(wzScores()); } catch (e) {}
  return `<div class="wz3-hero"><button type="button" class="wz3-port" data-wact="portrait" title="${W.portrait ? 'Change portrait' : 'Add a portrait'}">${W.portrait ? `<img src="${esc(W.portrait)}" alt="">` : '<span>+ Portrait</span>'}</button>
    <div class="wz3-who"><b>${esc(W.name || 'Your character')}</b><span>${esc([race, cls].filter(Boolean).join(' · ') || 'Nothing picked yet')}</span></div>
    ${fin ? `<div class="wz3-ab">${AB.map(a => `<span>${AB3[a]}<b>${fin[a]}</b></span>`).join('')}</div>` : ''}</div>`;
}
function wz3Cards(kind) {
  let items = [], cur = '', label = '';
  if (kind === 'race') { cur = W.race; label = 'races'; DND.raceGroups.forEach(([g, ks]) => ks.filter(k => DND.races[k]).sort((a, b) => abc(DND.races[a].name, DND.races[b].name)).forEach(k => { const r = DND.races[k]; items.push({ k, g, name: r.name, tags: [r.size || 'Medium', (r.speed || 30) + ' ft'].concat(r.src && r.src !== 'PHB' ? [r.src] : []) }); })); }
  if (kind === 'class') { cur = W.classes && W.classes[0] ? W.classes[0].key : ''; label = 'classes'; DND.classOrder.forEach(k => { const c = CL[k]; items.push({ k, g: '', name: c.name, tags: ['d' + c.hd, c.saves.map(a => AB3[a]).join(' · ')].concat(c.src !== 'PHB' ? [c.src] : []) }); }); }
  if (kind === 'bg') { cur = W.bg; label = 'backgrounds'; bookSort(Object.entries(DND.backgrounds), ([, v]) => v.src, ([, v]) => v.name).forEach(([k, v]) => items.push({ k, g: '', name: v.name, tags: v.src && v.src !== 'PHB' ? [v.src] : [] })); }
  if (!items.length) return '';
  let lastG = null;
  const cards = items.map(it => { const head = it.g && it.g !== lastG ? `<p class="wz3-g">${esc(it.g)}</p>` : ''; lastG = it.g;
    return `${head}<button type="button" class="wz3-card${it.k === cur ? ' sel' : ''}" data-pick="${kind}" data-v="${esc(it.k)}" data-q="${esc(it.name.toLowerCase())}"><b>${esc(it.name)}</b>${it.tags.length ? `<span class="wz3-tags">${it.tags.map(t => `<i>${esc(t)}</i>`).join('')}</span>` : ''}</button>`; }).join('');
  return `<div class="wz3-pick"><input class="f wz3-q" data-wz3q placeholder="Search ${label}" autocomplete="off" aria-label="Search ${label}"><div class="wz3-cards${cur ? ' has' : ''}">${cards}</div></div>`;
}
if (!window.__wz3) { window.__wz3 = 1;
  document.addEventListener('click', e => { const c = e.target.closest && e.target.closest('#wizard [data-pick]'); if (!c) return;
    const sel = c.dataset.pick === 'race' ? $('#wizard [data-wz="race"]') : c.dataset.pick === 'bg' ? $('#wizard [data-wz="bg"]') : $('#wizard [data-wzc="0"][data-f="key"]'); if (!sel) return;
    sel.value = c.dataset.v; sel.dispatchEvent(new Event('change', { bubbles: true })); });
  document.addEventListener('input', e => { const q = e.target.closest && e.target.closest('#wizard [data-wz3q]'); if (!q) return; const v = q.value.trim().toLowerCase(), box = q.nextElementSibling;
    box.querySelectorAll('.wz3-card').forEach(c => { c.hidden = !!v && !c.dataset.q.includes(v); });
    box.querySelectorAll('.wz3-g').forEach(g => { let n = g.nextElementSibling, any = false; while (n && !n.classList.contains('wz3-g')) { if (!n.hidden) any = true; n = n.nextElementSibling; } g.hidden = !any; }); });
}

function asiModeClick(b) {
  const inWz = !!b.closest('#wizard'), inP = !!b.closest('#pendm') && PEND, CH = inWz ? W.ans : inP ? PEND.ans : LV ? LV.ans : null; if (!CH) return;
  CH[b.dataset.asimode] = [b.dataset.v];
  if (inP) renderPending(); else if (inWz) { const sc = $('#wizard .wz-body').scrollTop; renderWizard(); $('#wizard .wz-body').scrollTop = sc; } else renderLevelUp();
}
function pbStep(a, d) {
  const cur = wzBaseScore(a), nv = Math.max(8, Math.min(15, cur + d));
  const spent = AB.reduce((t, x) => t + N(DND.pointBuy[x === a ? nv : wzBaseScore(x)]), 0);
  if (spent > 27) { toast('Not enough points left.'); return; }
  W.base[a] = nv; renderWizard();
}
function asiOrFeatWz(id) { return asiOrFeatUI(W.ans, id).replace(/\(\d+\)<\/option>/g, '</option>'); }
function filterWzSpells(inp) { const q = inp.value.trim().toLowerCase(), box = inp.nextElementSibling; $$('.crrow', box).forEach(r => r.style.display = !q || r.dataset.q.includes(q) ? '' : 'none'); }
function wizField(e) {
  const t = e.target, d = t.dataset;
  if (d.wsrc) return wizSetSource(d.wsrc, t.checked);
  if (d.ch !== undefined) return chField(t);
  if (d.wz) { const v = t.type === 'checkbox' ? t.checked : t.value; W[d.wz] = v; if (d.wz === 'race') { W.sub = ''; W.ans = {}; W.tasha = false; } if (['race', 'sub', 'tasha', 'bg', 'alignment'].includes(d.wz)) renderWizard(); return; }
  if (d.wzc !== undefined) { const r = W.classes[N(d.wzc)]; r[d.f] = d.f === 'level' ? N(t.value) : t.value; if (d.f === 'key') r.sub = ''; renderWizard(); return; }
  if (d.wzab) {
    if (W.method === 'array' || W.method === 'roll') { const pool = W.method === 'array' ? DND.standardArray : W.rolls; AB.forEach(a => { if (a !== d.wzab && W.base['_' + a] === t.value && t.value !== '') { W.base['_' + a] = ''; W.base[a] = ''; } }); W.base['_' + d.wzab] = t.value; W.base[d.wzab] = t.value === '' ? '' : pool[N(t.value)]; renderWizard(); }
    else { W.base[d.wzab] = t.value === '' ? '' : (W.method === 'pointbuy' ? Math.max(8, Math.min(15, N(t.value))) : N(t.value)); if (e.type === 'change' || W.method === 'pointbuy') { const pos = t.dataset.wzab; renderWizard(); const el = $(`#wizard [data-wzab="${pos}"]`); if (el && e.type !== 'change') { el.focus(); } } }
    return;
  }
  if (d.wzq) { W['q' + d.wzq] = t.value; filterWzSpells(t); return; }
  if (d.wzsp) { const L = W.spells[d.wzsp] = W.spells[d.wzsp] || []; if (t.checked) L.push(t.value); else L.splice(L.indexOf(t.value), 1); t.closest('.crrow').classList.toggle('on', t.checked); const sc = $('#wizard .wz-body').scrollTop, ls = $$('#wizard .crlist').map(x => x.scrollTop); renderWizard(); $('#wizard .wz-body').scrollTop = sc; $$('#wizard .crlist').forEach((x, k) => x.scrollTop = ls[k] || 0); return; }
  if (d.wzkit !== undefined) { W.kitOff[d.wzkit] = !t.checked; return; }
}
function wizClick(e) {
  const am = e.target.closest('[data-asimode]'); if (am) return asiModeClick(am);
  const b = e.target.closest('[data-wact]'); if (!b) return;
  const a = b.dataset.wact;
  switch (a) {
    case 'next': W.step = Math.min(WSTEPS.length - 1, W.step + 1); break;
    case 'back': W.step = Math.max(0, W.step - 1); break;
    case 'go': W.step = N(b.dataset.v); break;
    case 'portrait': $('#portraitFile').click(); return;
    case 'import': $('#importFile').click(); return;
    case 'ddb': openDdbImport(); return;
    case 'addcls': W.classes.push({ key: '', level: 1, sub: '' }); break;
    case 'delcls': W.classes.splice(N(b.dataset.i), 1); break;
    case 'method': W.method = b.dataset.v; W.base = { str: '', dex: '', con: '', int: '', wis: '', cha: '' }; break;
    case 'roll': W.rolls = Array.from({ length: 6 }, () => { const r = [1, 2, 3, 4].map(() => 1 + Math.floor(Math.random() * 6)).sort((x, y) => y - x); return r[0] + r[1] + r[2]; }); W.base = { str: '', dex: '', con: '', int: '', wis: '', cha: '' }; break;
    case 'equip': W.equip = b.dataset.v; break;
    case 'rollgold': { const c = CL[(wzClassRows()[0] || {}).key]; if (c) W.gold = rollExpr(c.gold.replace(/\*10$/, '')).total * (/\*10$/.test(c.gold) ? 10 : 1); break; }
    case 'hpmode': W.hpMode = b.dataset.v; break;
    case 'rollhp': W.hpRolls = []; wzClassRows().forEach((r, i) => { const c = CL[r.key]; for (let k = i === 0 ? 1 : 0; k < N(r.level); k++) W.hpRolls.push(rollExpr('1d' + c.hd).total); }); break;
    case 'create': return buildCharacter();
    case 'pb': return pbStep(b.dataset.a, N(b.dataset.d));
    case 'splv': W['lv' + b.dataset.k] = N(b.dataset.v); W['q' + b.dataset.k + 's'] = ''; { const sc = $('#wizard .wz-body').scrollTop; renderWizard(); $('#wizard .wz-body').scrollTop = sc; } return;
  }
  renderWizard(); $('#wizard .wz-body').scrollTop = 0;
}
// What each equipment pack holds (PHB / VRGR). Picking a pack gives you these items, not a "pack" item.
const PACKS = {
  "burglar's pack": [['Backpack'], ['Ball bearings (bag of 1,000)'], ['String (10 feet)'], ['Bell'], ['Candle', 5], ['Crowbar'], ['Hammer'], ['Piton', 10], ['Lantern, hooded'], ['Oil (flask)', 2], ['Rations (1 day)', 5], ['Tinderbox'], ['Waterskin'], ['Rope, hempen (50 feet)']],
  "diplomat's pack": [['Chest'], ['Case, map or scroll', 2], ['Fine clothes'], ['Ink (1 ounce bottle)'], ['Ink pen'], ['Lamp'], ['Oil (flask)', 2], ['Paper (one sheet)', 5], ['Perfume (vial)'], ['Sealing wax'], ['Soap']],
  "dungeoneer's pack": [['Backpack'], ['Crowbar'], ['Hammer'], ['Piton', 10], ['Torch', 10], ['Tinderbox'], ['Rations (1 day)', 10], ['Waterskin'], ['Rope, hempen (50 feet)']],
  "entertainer's pack": [['Backpack'], ['Bedroll'], ['Costume clothes', 2], ['Candle', 5], ['Rations (1 day)', 5], ['Waterskin'], ['Disguise kit']],
  "explorer's pack": [['Backpack'], ['Bedroll'], ['Mess kit'], ['Tinderbox'], ['Torch', 10], ['Rations (1 day)', 10], ['Waterskin'], ['Rope, hempen (50 feet)']],
  "priest's pack": [['Backpack'], ['Blanket'], ['Candle', 10], ['Tinderbox'], ['Alms box'], ['Incense', 2], ['Censer'], ['Vestments'], ['Rations (1 day)', 2], ['Waterskin']],
  "scholar's pack": [['Backpack'], ['Book of lore'], ['Ink (1 ounce bottle)'], ['Ink pen'], ['Parchment (one sheet)', 10], ['Little bag of sand'], ['Knife, small']],
  "monster hunter's pack": [['Chest'], ['Crowbar'], ['Hammer'], ['Wooden stake', 3], ['Holy symbol'], ['Holy water (flask)'], ['Manacles'], ['Mirror, steel'], ['Oil (flask)'], ['Tinderbox'], ['Torch', 3]]
};
const packOf = name => PACKS[String(name || '').toLowerCase().trim()] || null;
// Add an item, stacking it onto one you already carry with the same name (plain gear only).
function addStacked(it, bag) {
  const same = !it.weapon && !it.armor && S.inventory.find(x => !x.weapon && !x.armor && !x.magic && !x.equipped && (x.bag || '') === (bag || '') && x.name.toLowerCase() === it.name.toLowerCase());
  if (same) { same.qty = N(same.qty || 1) + N(it.qty || 1); return; }
  if (bag) it.bag = bag; addInventoryItem(it, true);
}
function addPackContents(name, times, bag) { packOf(name).forEach(([n, q]) => { const it = findGear(n); it.qty = (q || 1) * (times || 1); addStacked(it, bag); }); }
// Open a pack already in your inventory: it becomes the things inside it.
function unpackItem(i) {
  const it = S.inventory[i]; if (!it || !packOf(it.name)) return;
  S.inventory.splice(i, 1); addPackContents(it.name, N(it.qty) || 1, it.bag && !it.equipped ? it.bag : '');
  pendingLabel = 'Unpack ' + it.name; save(); render(); toast(`Unpacked ${esc(it.name)}.`, '', 5000, { label: 'Undo', fn: () => undo(1) });
}
function findGear(name) {
  const n = name.toLowerCase();
  const w = DND.weapons.find(x => x[0].toLowerCase() === n); if (w) return makeWeaponItem(w);
  const a = DND.armor.find(x => x[0].toLowerCase() === n); if (a) return makeArmorItem(a);
  const g = DND.gear.find(x => x[0].toLowerCase() === n); if (g) return makeGearItem(g);
  return { id: uid(), name, qty: 1, weight: 0, equipped: false, notes: '' };
}
// The standard actions every character has (and Cunning Action for a rogue).
function defaultCombat() {
  return {
    action: [['Dash', 'Gain extra movement equal to your speed.'], ['Disengage', 'Your movement doesn\'t provoke opportunity attacks this turn.'], ['Dodge', 'Attacks against you have disadvantage; advantage on DEX saves until your next turn.'], ['Help', 'Give an ally advantage on a check or their next attack.'], ['Hide', 'Make a Stealth check to hide.'], ['Ready', 'Choose a trigger and a reaction to take.'], ['Search', 'Make a Perception or Investigation check.'], ['Use an Object', 'Interact with a second object or use an item.'], ['Grapple', 'Athletics vs the target\'s Athletics or Acrobatics; its speed becomes 0.'], ['Shove', 'Athletics contest to push 5 ft or knock prone.']].map(([name, text]) => ({ name, text })),
    bonus: clsLv('rogue') >= 2 ? [{ name: 'Cunning Action', text: 'Dash, Disengage or Hide as a bonus action.' }] : [],
    reaction: [{ name: 'Opportunity Attack', text: 'When a hostile creature you can see leaves your reach, make one melee attack.' }],
    move: [['Stand up', 'Costs half your speed.'], ['Drop prone', 'Free.'], ['Interact', 'Draw a weapon, open a door, pick up an item — one free interaction.'], ['Climb / swim', 'Each foot costs 1 extra foot unless you have the speed.'], ['Jump', 'Long jump = STR score in feet with a 10 ft run.']].map(([name, text]) => ({ name, text }))
  };
}
function buildCharacter() {
  const x = wzRace(), rows = wzClassRows();
  if (!x || !rows.length) { toast('Choose at least a race and a class.', 'fumble'); W.step = !x ? 1 : 2; renderWizard(); return; }
  if (wzTotalLevel() > 20) { toast('Total level can be at most 20.', 'fumble'); W.step = 2; renderWizard(); return; }
  const sc = wzScores();
  S = migrate(Object.assign(blankState(), { dataRev: EMBED.dataRev || '', layout: S.layout || {} }));
  S.sources = W.sources.slice();
  S.id = uid(); S.name = W.name.trim() || 'Unnamed Hero'; S.player = W.player; S.alignment = W.alignment; S.portrait = W.portrait;
  S.race = { key: W.race, sub: W.sub, choices: {} }; S.raceName = x.name.toLowerCase().includes(x.r.name.toLowerCase()) ? x.name : x.name.replace(/\s*\([A-Z][A-Za-z]{1,5}\)$/, '') + ' ' + x.r.name;
  S.classes = rows.map(r => ({ key: r.key, level: N(r.level), sub: N(r.level) >= CL[r.key].sub.level ? r.sub : '' }));
  AB.forEach(a => S.abilities[a] = sc[a]);
  const c0 = CL[rows[0].key];
  c0.saves.forEach(a => S.saves[a] = true);
  // Proficiencies
  const ri = raceInfo();
  S.profs = { armor: (c0.armorCats || []).slice(), weapons: (c0.weaponCats || []).slice(), weaponNames: (c0.weaponNames || []).slice() };
  rows.slice(1).forEach(r => { const mc = CL[r.key].mc || {}; S.profs.armor.push(...(mc.armorCats || [])); S.profs.weapons.push(...(mc.weaponCats || [])); });
  rows.forEach(r => { const s = r.sub && CL[r.key].subclasses[r.sub]; if (s && s.profs && N(r.level) >= CL[r.key].sub.level) { S.profs.armor.push(...(s.profs.armorCats || [])); S.profs.weapons.push(...(s.profs.weaponCats || [])); } });
  if (ri) { if (ri.armorCats) S.profs.armor.push(...ri.armorCats); if (ri.weapons) S.profs.weaponNames.push(...ri.weapons); }
  S.profs.armor = [...new Set(S.profs.armor)]; S.profs.weapons = [...new Set(S.profs.weapons)];
  S.profArmor = profArmorText(); S.profWeapons = profWeaponText();
  S.tools = []; S.langs = [];
  const knownTool = x => ALL_TOOLS().find(t => t.toLowerCase() === x.trim().toLowerCase());
  addText('profTools', String(c0.tools || '').split(',').map(knownTool).filter(Boolean));
  rows.slice(1).forEach(r => addText('profTools', String((CL[r.key].mc || {}).profs || '').split(',').map(knownTool).filter(Boolean)));
  addText('languages', wzRaceLangs().length ? wzRaceLangs() : (ri && ri.languages) || []);
  rows.forEach(r => addText('languages', CL[r.key].languages || []));
  if (ri && ri.skills) ri.skills.forEach(n => setSkill(n, 1));
  if (ri && ri.tools) addText('profTools', ri.tools);
  // Race choices
  wzRaceChoices().forEach((c, k) => {
    const v = ansList(W.ans, 'race.' + k); if (!v.length) return;
    if (c.type === 'asi') return; // already in scores
    if (c.type === 'feat') { v.forEach((n, j) => applyFeat(n, W.ans, `race.${k}.f${j}`)); return; }
    if (c.type === 'option') { S.race.choices[c.label] = v[0]; return; }
    applyChoice(c, v);
  });
  // Background
  const b = DND.backgrounds[W.bg];
  if (b) {
    S.background = W.bg; S.backgroundName = b.name;
    (b.skills || []).forEach(n => setSkill(n, 1));
    addText('profTools', b.tools || []);
    applyChoice({ type: 'skill' }, ansList(W.ans, 'bg.skill'));
    applyChoice({ type: 'tool' }, ansList(W.ans, 'bg.tool'));
    applyChoice({ type: 'language' }, ansList(W.ans, 'bg.lang'));
    if (b.feat) applyFeat(b.feat, W.ans, 'bg.feat');
  }
  // Class options in level order
  const defs = wzClassChoiceDefs();
  S.answered = {};
  defs.forEach(d => {
    if (d.def.type === 'asiOrFeat') { if (asiDone(W.ans, d.id)) S.answered[d.id] = (W.ans[d.id] || []).slice(); applyAsiOrFeat(W.ans, d.id); return; }
    if (ansList(W.ans, d.id).length >= (d.def.n || 1)) S.answered[d.id] = ansList(W.ans, d.id);
    const v = ansList(W.ans, d.id); if (v.length) applyChoice(d.def, v, W.ans, d.id);
  });
  // Spells
  wzSpellPlan().forEach(p => (W.spells[p.key] || []).forEach(n => { const sp = spellEntry(n, p.key); if (p.cd.prepared && N(sp.level) > 0) sp.prepared = true; S.spells.push(sp); }));
  // Hit points
  const conM = mod('con', true);
  let base = c0.hd;
  let k = 0;
  rows.forEach((r, i) => { const c = CL[r.key]; for (let l = i === 0 ? 1 : 0; l < N(r.level); l++) { base += W.hpMode === 'roll' && W.hpRolls[k] != null ? W.hpRolls[k] : Math.floor(c.hd / 2) + 1; k++; } });
  S.hp.base = base;
  // Equipment
  if (W.equip === 'kit') {
    kitItems().forEach(([src, s2], i) => { if (W.kitOff[i]) return; const [n, q] = s2.split(':'); if (packOf(n)) return addPackContents(n, N(q) || 1); const it = findGear(n); it.qty = N(q) || 1; addStacked(it); });
    if (b) S.currency.gp = N(b.gold);
  } else S.currency.gp = N(W.gold) + (b ? 0 : 0);
  const arm = S.inventory.find(it => it.armor && it.armor.type !== 'shield' && (S.profs.armor || []).includes(it.armor.type)); if (arm) arm.equipped = true;
  const sh = S.inventory.find(it => it.armor && it.armor.type === 'shield' && (S.profs.armor || []).includes('shield')); if (sh) sh.equipped = true;
  const wpn = S.inventory.filter(it => it.weapon).slice(0, 2); wpn.forEach(it => it.equipped = true);
  S.combat = defaultCombat();
  rebuildAuto();
  S.hp.cur = maxHp();
  S.created = true; S.notes = [{ date: new Date().toISOString().slice(0, 10), title: 'Character created', text: `${S.name}: ${S.raceName} ${classLabel()}${S.backgroundName ? ', ' + S.backgroundName : ''}.` }];
  closeWizard();
  LAST = snapAll(); HIST = []; REDO = [];
  pendingLabel = 'Create character'; writeLocal(); save();
  if (S.portrait) matchPortrait(false);
  applyTheme(); applyLayout(); render();
  toast(`<div><b>${esc(S.name)}</b> is ready!<div class="det">Everything auto-saves in this browser. Use <b>Save ▾ → Download</b> to keep a copy or share it.</div></div>`, 'crit', 10000);
}


// Choose the spells a class option grants, from its feature card (also fixes characters made before this existed).
let GRANT = null;
function openGrantPicker(type, o) {
  const e = DND.options[type] && DND.options[type].list.find(x => x[0] === o), fx = (e && e[3]) || {}; if (!fx.grant) return;
  const have = (S.grantSpells || {})[o] || [], CH = {}; let k = 0;
  fx.grant.forEach((g, j) => { CH['g.' + j] = have.slice(k, k + g.n); k += g.n; });
  GRANT = { type, o, fx, CH };
  renderGrantPicker();
}
// Magic Initiate: choose a class, then two of its cantrips and one of its 1st-level spells.
const MI_CLS = [['bard', 'B', 'cha', 'Bard'], ['cleric', 'C', 'wis', 'Cleric'], ['druid', 'D', 'wis', 'Druid'], ['sorcerer', 'S', 'cha', 'Sorcerer'], ['warlock', 'K', 'cha', 'Warlock'], ['wizard', 'W', 'int', 'Wizard']];
const miGrant = cls => { const c = MI_CLS.find(x => x[0] === cls) || MI_CLS[5]; return [{ type: 'spellpick', n: 2, level: 0, list: c[1], label: `${c[3]} cantrips` }, { type: 'spellpick', n: 1, level: 1, list: c[1], label: `${c[3]} 1st-level spell — once per long rest without a slot` }]; };
function openMagicInitiate() {
  const cls = (S.featCls || {})['Magic Initiate'] || 'wizard', have = (S.grantSpells || {})['Magic Initiate'] || [];
  const CH = { 'g.0': have.filter(n => N((SPI(n) || {}).level) === 0).slice(0, 2), 'g.1': have.filter(n => N((SPI(n) || {}).level) === 1).slice(0, 1) };
  GRANT = { mi: true, cls, o: 'Magic Initiate', fx: { grant: miGrant(cls) }, CH }; renderGrantPicker();
}
function renderGrantPicker() {
  const t = GRANT; if (!t) return;
  const html = `<div id="grantm"><h3>${esc(t.o)}</h3>${t.mi ? `<p class="hint" style="margin:0 0 8px">Pick a class, then two of its cantrips and one of its 1st-level spells. You cast them with that class's ability (${esc((MI_CLS.find(x => x[0] === t.cls) || [])[2] || '').toUpperCase()}); the 1st-level spell once per long rest without a slot (or with your own slots, if you have them).</p>
    <div class="seg miseg">${MI_CLS.map(([k, , , nm]) => `<button class="${t.cls === k ? 'on' : ''}" data-act="micls" data-v="${k}">${nm}</button>`).join('')}</div>` : ''}${t.fx.grant.map((g, j) => choiceUI(t.CH, 'g.' + j, g)).join('')}
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="grantok">Save</button></div></div>`;
  if ($('#grantm') && $('#modal').classList.contains('open')) $('#modal-body').innerHTML = html; else openModal(html, null, true);
}

// ---------- Unfinished choices ----------
// Choices your character is owed for its class levels that were never made — skipped in creation, left blank
// at a level-up, or added by a newer version of the sheet (e.g. a totem spirit). Pick them here, or mark them done.
function owedChoices() {
  const out = [], ans = S.answered, dis = S.dismissed || {};
  clsRows().forEach((r, ri) => {
    const c = CL[r.key]; if (!c) return; const L = N(r.level), s = subOf(r);
    const all = (c.choices || []).concat((s && s.choices) || []);
    // Class options are counted: enough picks of that kind means they're done.
    const need = {}; all.forEach(ch => { if (ch.level <= L && DND.options[ch.type]) need[ch.type] = (need[ch.type] || 0) + (ch.n || 1); });
    c.asi.filter(l => l <= L).forEach(l => out.push({ id: `asi.${r.key}.${l}`, def: { type: 'asiOrFeat' }, cls: r.key, lvl: l, label: `${c.name} ${l}: Ability Score Improvement or feat` }));
    all.forEach((ch, k) => { if (ch.level > L) return; const id = `ch.${r.key}.${k}.${ch.level}.${ch.type}`;
      if (DND.options[ch.type] && (S.picks[ch.type] || []).length >= need[ch.type]) return;
      out.push({ id, def: ch, cls: r.key, lvl: ch.level, label: `${c.name} ${ch.level}: ${ch.label || choiceLabel(ch)}${(ch.n || 1) > 1 ? ' × ' + ch.n : ''}` }); });
  });
  // Choices inside feats (Elemental Adept's damage type, Resilient's ability…) that were never made.
  (S.feats || []).forEach(n => featSubDefs(n).forEach((d, k) => { const have = ((S.featChoices || {})[n] || {})[d.type]; if (!have || [].concat(have).length < (d.n || 1)) out.push({ id: `feat.${n}.${k}`, def: d, feat: n, label: `${n}: ${d.label || choiceLabel(d)}` }); }));
  // Notes left for the player: things to decide or check that the sheet can't pick for them.
  // A decision either asks for a pick (skill, language, tool…) or offers a few outcomes to choose between.
  (S.decisions || []).forEach(d => out.push({ id: 'dec.' + d.id, dec: true, text: d.text, def: d.def ? Object.assign({}, d.def) : d.options ? { type: 'decide', options: d.options } : { type: 'note' }, label: d.title }));
  return out.filter(o => !(ans && ans[o.id]) && !dis[o.id]);
}
let PEND = null;
function openPending() { PEND = { ans: {} }; if (!$('#modal').classList.contains('open')) openModal('', null, true); renderPending(); }
function renderPending() {
  if (!PEND) return;
  const list = owedChoices();
  const html = `<div id="pendm"><h3>Unfinished choices</h3>
    <p class="hint">${list.length ? 'Choices your levels give you that were never made — skipped, left blank, or new in this version of the sheet. Pick each one, or mark it done if you already took care of it yourself.' : 'Nothing left to choose. Everything your levels give you has been picked.'}</p>
    ${list.map(o => { const r = clsRows().find(x => x.key === o.cls) || {};
      if (o.dec && o.def.type === 'decide') return `<div class="pendq"><div class="pendh"><b>${esc(o.label)}</b></div><p class="pendnote">${esc(o.text)}</p>
        <div class="pendopts">${o.def.options.map((op, j) => `<button class="pendopt" data-act="pendpick" data-id="${esc(o.id)}" data-j="${j}"><b>${esc(op.label)}</b>${op.desc ? `<small>${esc(op.desc)}</small>` : ''}</button>`).join('')}</div></div>`;
      if (o.dec && o.def.type === 'note') return `<div class="pendq"><div class="pendh"><b>${esc(o.label)}</b><span class="grow"></span><button class="btn sm gold" data-act="penddone" data-id="${esc(o.id)}">Got it</button></div><p class="pendnote">${esc(o.text)}</p></div>`;
      if (o.dec) return `<div class="pendq"><div class="pendh"><b>${esc(o.label)}</b><span class="grow"></span><button class="btn sm ghost" data-act="penddone" data-id="${esc(o.id)}" title="You already sorted this out on the sheet yourself">Already done</button><button class="btn sm gold" data-act="pendok" data-id="${esc(o.id)}">Apply</button></div><p class="pendnote">${esc(o.text)}</p>${choiceUI(PEND.ans, o.id, o.def, {})}</div>`;
      return `<div class="pendq"><div class="pendh"><b>${esc(o.label)}</b><span class="grow"></span><button class="btn sm ghost" data-act="penddone" data-id="${esc(o.id)}" title="You already made this choice on the sheet yourself">Already done</button><button class="btn sm gold" data-act="pendok" data-id="${esc(o.id)}">Apply</button></div>
        ${o.def.type === 'asiOrFeat' ? asiOrFeatUI(PEND.ans, o.id) : choiceUI(PEND.ans, o.id, o.def, { cls: o.cls, level: N(r.level), sub: r.sub })}</div>`; }).join('')}
    <div class="actions">${list.length > 1 ? '<button class="btn ghost" data-act="pendall">Mark all as done</button>' : ''}<button class="btn gold" data-act="close">Done</button></div></div>`;
  $('#modal-body').innerHTML = html; $('#modal-body').classList.add('wide');
}
function pendApply(id) {
  const o = owedChoices().find(x => x.id === id); if (!o) return;
  if (o.def.type === 'asiOrFeat') { if (!asiDone(PEND.ans, id)) { toast('Finish this choice first.', 'fumble'); return; } }
  else if (ansList(PEND.ans, id).length < (o.def.n || 1)) { toast('Finish this choice first.', 'fumble'); return; }
  S.answered = S.answered || {};
  let note;
  if (o.def.type === 'asiOrFeat') { note = applyAsiOrFeat(PEND.ans, id); S.answered[id] = (PEND.ans[id] || []).slice(); }
  else { const v = ansList(PEND.ans, id);
    if (o.feat) { const ft = DND.feats.find(x => x[0] === o.feat), e = (ft && ft[4]) || {}; if (o.def.type === 'asi') v.forEach(a => { S.abilities[a] = Math.min(20, N(S.abilities[a]) + 1); if (e.saveProfFromAsi) S.saves[a] = true; }); else if (o.def.type !== 'element') applyChoice(o.def, v, PEND.ans, id);
      S.featChoices = S.featChoices || {}; S.featChoices[o.feat] = Object.assign({}, S.featChoices[o.feat], { [o.def.type]: v }); }
    else applyChoice(o.def, v, PEND.ans, id);
    S.answered[id] = v; note = v.join(', '); }
  rebuildAuto(); pendingLabel = o.label + (note ? ': ' + note : ''); save(); render(); renderPending();
  toast(`<b>${esc(o.label)}</b>${note ? ' — ' + esc(note) : ''}`, '', 5000, { label: 'Undo', fn: () => undo(1) });
}
// Decisions with set outcomes: each option carries small edits to make to the sheet.
function pendPick(id, j) {
  const o = owedChoices().find(x => x.id === id); if (!o || o.def.type !== 'decide') return; const op = o.def.options[N(j)]; if (!op) return;
  (op.ops || []).forEach(x => {
    if (x.equip) { const i = S.inventory.findIndex(it => it.name === x.equip); if (i >= 0 && !S.inventory[i].equipped) equipItem(i); }
    if (x.attune) { const i = S.inventory.findIndex(it => it.name === x.attune); if (i >= 0) { if (!S.inventory[i].equipped) equipItem(i); S.inventory[i].attuned = true; } }
    if (x.armorProf) { S.profs.armor = [...new Set((S.profs.armor || []).concat(x.armorProf))]; S.profArmor = profArmorText(); }
    if (x.addLang) addText('languages', [x.addLang]);
    if (x.removeLang) S.langs = S.langs.filter(l => l.toLowerCase() !== x.removeLang.toLowerCase());
    if (x.addTool) addText('profTools', [x.addTool]);
    if (x.addSkill) setSkill(x.addSkill, 1);
    if (x.removeSpell) S.spells = S.spells.filter(sp => sp.auto || sp.name.toLowerCase() !== x.removeSpell.toLowerCase());
    if (x.dropSkill) { const sk = S.skills.find(k => k.name.toLowerCase() === x.dropSkill.toLowerCase()); if (sk) sk.prof = 0; }
    if (x.addFeature && !S.features.some(f => f.name === x.addFeature.name)) S.features.push(Object.assign({ key: 'custom:' + x.addFeature.name, dname: x.addFeature.name, source: 'Custom', auto: false, used: 0, dmax: '', dreset: 'long', max: '', reset: 'long', pool: false, col: '', cls: '', kind: 'custom', desc: '' }, x.addFeature));
  });
  S.answered = Object.assign({}, S.answered, { [id]: [op.label] });
  rebuildAuto(); pendingLabel = o.label + ': ' + op.label; save(); render(); renderPending();
  toast(`<b>${esc(o.label)}</b> — ${esc(op.label)}`, '', 5000, { label: 'Undo', fn: () => undo(1) });
}
function pendDismiss(id) { S.dismissed = Object.assign({}, S.dismissed, { [id]: true }); pendingLabel = 'Marked a choice as done'; save(); render(); renderPending(); }
// ---------- Preparing spells (clerics, druids, paladins, artificers; wizards from their spellbook) ----------
let PREP = null;
function openPrepare(key, note) { PREP = { key, lvl: '', note: note || '' }; if (!$('#modal').classList.contains('open')) openModal('', null, true); renderPrepare(); }
function prepList(key) {
  const c = casterFor(key); if (!c) return [];
  if (c.book) return S.spells.filter(s => s.cls === key && N(s.level) > 0).map(s => SPI(s.name) || s);
  const maxL = maxSpellLevelFor(c), exp = expandedFor(key).map(n => n.toLowerCase());
  return DND.spells.filter(s => (s.classes.includes(c.list) || exp.includes(s.name.toLowerCase())) && s.level > 0 && s.level <= maxL);
}
function renderPrepare() {
  const t = PREP; if (!t) return; const key = t.key, c = casterFor(key); if (!c) return;
  const list = prepList(key), lim = spellLimit(c), n = countPrep(key);
  const lvls = [...new Set(list.map(s => s.level))].sort((a, b) => a - b);
  const cur = lvls.includes(N(t.lvl)) ? N(t.lvl) : t.lvl === 'all' ? 'all' : lvls[0];
  const mine = nm => S.spells.find(s => s.cls === key && s.name.toLowerCase() === nm.toLowerCase());
  const q = ($('#prq') && $('#prq').value) || '';
  const row = s => { const m = mine(s.name), on = m && (m.prepared || m.always);
    return `<div class="crrow prow${on ? ' on' : ''}" data-q="${esc((s.name + ' ' + s.school + ' ' + s.summary).toLowerCase())}"><div><b>${esc(s.name)}</b> <span class="hint">${ORD[s.level - 1]} · ${esc(s.school)} · ${esc(s.time)}${s.conc ? ' · conc' : ''}${s.ritual ? ' · ritual' : ''}</span><div class="hint">${esc(s.summary)}</div></div>
      ${!m && S.spells.some(x => x.cls !== key && x.name.toLowerCase() === s.name.toLowerCase()) ? '<span class="always" title="You already have this spell from somewhere else">Have it</span>' : m && m.always ? '<span class="always" title="Always prepared; doesn\'t count">Always</span>' : `<button class="btn sm${on ? ' gold' : ''}" data-act="prepsp" data-n="${esc(s.name)}" aria-pressed="${!!on}">${on ? '✓ Prepared' : 'Prepare'}</button>`}</div>`; };
  const html = `<div id="prepm"><h3>Prepare ${esc(c.name)} spells</h3>
    ${t.note ? `<p class="hint" style="margin:0 0 6px">${esc(t.note)}</p>` : ''}
    <div class="prephead"><span class="cnt${lim != null && n > lim ? ' bad' : n === lim ? ' done' : ''}"><b>${n}</b> / ${lim} prepared</span><span class="hint">${c.book ? 'From your spellbook. ' : 'Your whole class list is open to you. '}You can change them after a long rest. Always-prepared spells don't count.</span></div>
    <div class="row" style="margin:6px 0"><input class="f" id="prq" placeholder="Search spells…" value="${esc(q)}" style="flex:1 1 200px"><div class="chips">${lvls.map(l => `<button class="chip${cur === l ? ' on' : ''}" data-act="preplv" data-l="${l}">${ORD[l - 1]}${S.spells.filter(s => s.cls === key && N(s.level) === l && s.prepared && !s.always).length ? ' (' + S.spells.filter(s => s.cls === key && N(s.level) === l && s.prepared && !s.always).length + ')' : ''}</button>`).join('')}<button class="chip${cur === 'all' ? ' on' : ''}" data-act="preplv" data-l="all">All</button></div></div>
    <div class="crlist">${list.filter(s => cur === 'all' || s.level === cur).map(row).join('') || '<p class="hint">No spells here.</p>'}</div>
    <div class="actions"><button class="btn gold" data-act="close">Done</button></div></div>`;
  $('#modal-body').innerHTML = html; $('#modal-body').classList.add('wide');
  const qi = $('#prq'); if (qi) { qi.oninput = () => filterCatalogQ('#prq'); filterCatalogQ('#prq'); }
}
function prepToggle(nm) {
  const key = PREP && PREP.key, c = casterFor(key); if (!c) return;
  const lim = spellLimit(c), idx = S.spells.findIndex(s => s.cls === key && s.name.toLowerCase() === nm.toLowerCase());
  const sp = idx >= 0 ? S.spells[idx] : null;
  if (sp && sp.always) { toast('That spell is always prepared.'); return; }
  if (sp && sp.prepared) { if (c.book) sp.prepared = false; else S.spells.splice(idx, 1); pendingLabel = 'Unprepare ' + nm; }
  else {
    if (lim != null && countPrep(key) >= lim) { toast(`You can prepare ${lim} ${c.name.toLowerCase()} spells — unprepare one first.`, 'fumble'); return; }
    if (sp) sp.prepared = true; else { const e = spellEntry(nm, key); e.prepared = true; S.spells.push(e); }
    pendingLabel = 'Prepare ' + nm;
  }
  save(); render('spells'); refresh(); renderPrepare();
}
// ---------- Live sync ----------
// Everyone who opens this sheet's claude.ai link sees the same character, live: one shared copy in the
// artifact's database (sheets/main), and every change shows up on every open copy within a second or so.
// Each viewer keeps their own tab, scroll, open panels, desktop/mobile layout and dice settings.
// A document holds at most 256 KiB, so big sheets (pictures!) are split: sheets/main carries part 0 and
// the count; sheets/part1, part2… are written first, each stamped with the same savedAt.
// Failures never give up: transient ones retry with backoff until the sheet is synced again.
const TAB = uid();
const PART = 180000;
// Per-viewer: never taken from someone else's copy.
const LOCAL_SETTINGS = ['diceMode', 'r20campaign', 'sheetToR20', 'r20auras'];
function keepLocal(next, cur) {
  if (!next || !cur) return next;
  next.layout = cur.layout;
  next.settings = Object.assign({}, next.settings || {});
  LOCAL_SETTINGS.forEach(k => { if (cur.settings && cur.settings[k] !== undefined) next.settings[k] = cur.settings[k]; else delete next.settings[k]; });
  return next;
}
let GUESTCLAIM = false, GUESTDONE = false;
let CLOUD = null, DBX = null, cloudBusy = false, cloudAgain = false, cloudTimer = null, cloudPending = null, cloudFails = 0, cloudParts = 1, cloudUnsub = null, cloudRO = false;
const clock = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
// The toolbar slot is small: show a short label, keep the full sentence as the hover text.
function shortSync(t) { t = String(t || ''); const tm = (t.match(/(\d{1,2}:\d{2})/) || [])[1];
  return /synced/i.test(t) ? '● Synced ' + (tm || '') : /view only/i.test(t) ? '● View only' : /retrying/i.test(t) ? 'Retrying…' : /reconnect/i.test(t) ? 'Reconnecting…' : /full/i.test(t) ? 'Sync full' : /not live/i.test(t) ? 'Not live' : /^saved/i.test(t) ? 'Saved ' + (tm || '') : t; }
function syncHTML(t) { const sh = shortSync(t), m = isMobile() && sh.match(/^(.*?)\s+(\d{1,2}:\d{2})$/); return m ? esc(m[1]) + '<small class="sstime">' + esc(m[2]) + '</small>' : esc(sh); }
function setSyncState(t) { UI.saveState = t; UI.saveFull = t; const el = $('#saveState'); if (el) { if (typeof fitToolbarSoon === 'function') fitToolbarSoon(); el.innerHTML = syncHTML(t); el.title = t; el.classList.toggle('live', /synced|view only/i.test(t)); } }
// On the website, edits are gathered into one save after 1.5s of quiet (never held longer than 6s), and anything
// waiting is saved at once when the tab is hidden or closed — far fewer database writes, still near-live for others.
let cloudFirst = 0;
function cloudPush() { if (!CLOUD || !S.created || cloudRO) return; clearTimeout(cloudTimer);
  if (!window.SHEET_PAGES) { cloudTimer = setTimeout(cloudWrite, 350); return; }
  const now = Date.now(); if (!cloudFirst) cloudFirst = now;
  cloudTimer = setTimeout(() => { cloudFirst = 0; cloudWrite(); }, Math.max(0, Math.min(1500, cloudFirst + 6000 - now))); }
function cloudFlush() { if (cloudTimer && cloudFirst) { clearTimeout(cloudTimer); cloudTimer = null; cloudFirst = 0; cloudWrite(); } }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') cloudFlush(); });
addEventListener('pagehide', cloudFlush);
const partRef = k => DBX.doc('sheets/part' + k);
async function cloudWrite() {
  if (!CLOUD || !S.created || cloudRO) return;
  if (cloudBusy) { cloudAgain = true; return; }
  cloudBusy = true;
  try {
    const str = JSON.stringify(S), at = N(S.savedAt) || Date.now(), parts = [];
    for (let i = 0; i < str.length; i += PART) parts.push(str.slice(i, i + PART));
    if (!parts.length) parts.push('');
    for (let k = 1; k < parts.length; k++) await partRef(k).set({ savedAt: at, k, data: parts[k] });
    await CLOUD.set({ v: 2, savedAt: at, tab: TAB, n: parts.length, data: parts[0], guestDone: GUESTDONE || GUESTCLAIM });
    for (let k = parts.length; k < cloudParts; k++) { try { await partRef(k).delete(); } catch (e) {} }
    cloudParts = parts.length; cloudFails = 0;
    setSyncState('Live · synced ' + clock());
  } catch (e) {
    const c = e && e.code;
    if (c === 'revoked' || c === 'not_granted' || c === 'capability_disabled' || c === 'capability_removed') { CLOUD = null; setSyncState('Not live here — open the sheet from its claude.ai link'); }
    else if (c === 'invalid_argument' && !cloudFails) { cloudRO = true; setSyncState('Live · view only (you can\'t edit this sheet)'); }
    else if (c === 'quota_exceeded') { setSyncState('Sync storage is full'); cloudFails++; setTimeout(cloudWrite, 60000); }
    else { cloudFails++; setSyncState('Sync retrying…'); cloudAgain = true; }
  }
  cloudBusy = false;
  if (cloudAgain) { cloudAgain = false; setTimeout(cloudWrite, cloudFails ? Math.min(60000, 1500 * Math.pow(2, Math.min(cloudFails, 5))) + Math.random() * 1500 : 50); }
}
// Whole sheet text from a main doc (v1 = one doc; v2 = parts). null while a newer save is still landing.
async function cloudText(d, partOf) {
  if (!d) return null;
  if (d.sheet) return d.sheet;
  const n = N(d.n) || 1; let str = d.data || '';
  for (let k = 1; k < n; k++) { const sn = await (partOf || partRef)(k).get(); const p = sn.exists ? sn.data() : null; if (!p || N(p.savedAt) !== N(d.savedAt)) return null; str += p.data || ''; }
  return str;
}
// Typing in a field or working in a popup: wait, then catch up (a re-render would steal focus or the popup's place).
function busyEditing() { const a = document.activeElement; return $('#modal').classList.contains('open') || $('#wizard').classList.contains('open') || !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && !a.closest('#page-nothing')); }
function adoptRemote(d) {
  let next; try { next = JSON.parse(d.sheet); } catch (e) { return; }
  if (!next || !next.created || !S.created) return;
  if (busyEditing()) { cloudPending = d; return; }
  cloudPending = null;
  const sx = scrollX, sy = scrollY;
  S = keepLocal(migrate(next), S); if (applyFixes(S)) rebuildAuto();
  try { localStorage.setItem(keyFor(S.id), JSON.stringify(S)); } catch (e) {}
  HIST = []; REDO = []; LAST = snapAll(); histButtons();
  applySources(S.sources); applyTheme(); render();
  scrollTo(sx, sy);
  setSyncState('Live · synced ' + clock());
}
setInterval(() => { if (cloudPending && !busyEditing() && N(cloudPending.savedAt) > N(S.savedAt)) adoptRemote(cloudPending); else if (cloudPending && N(cloudPending.savedAt) <= N(S.savedAt)) cloudPending = null; }, 400);
function cloudListen(ref, onFirst) {
  let checked = false;
  if (cloudUnsub) { try { cloudUnsub(); } catch (e) {} }
  cloudUnsub = ref.onSnapshot(async snap => {
    const d = snap.exists ? snap.data() : null;
    if (d) { cloudParts = Math.max(cloudParts, N(d.n) || 1); if (d.guestDone) GUESTDONE = true; }
    if (!checked) { if (snap.metadata.fromCache) return; checked = true; CLOUD = ref; if (await onFirst(d)) return; }
    if (d && (d.sheet || d.v === 2) && d.tab !== TAB && N(d.savedAt) > N(S.savedAt)) {
      const txt = await cloudText(d);
      if (txt && N(d.savedAt) > N(S.savedAt)) adoptRemote({ savedAt: d.savedAt, sheet: txt });
    }
  }, e => {
    const c = e && e.code;
    if (c === 'revoked' || c === 'not_granted' || c === 'capability_disabled' || c === 'capability_removed') { CLOUD = null; setSyncState('Not live here — open the sheet from its claude.ai link'); return; }
    setSyncState('Reconnecting…'); setTimeout(() => cloudListen(ref, async () => false), 3000 + Math.random() * 2000);
  });
}
(async () => {
  try {
    if (!window.claude || !window.claude.use) { setSyncState(window.SHEET_PAGES ? 'Saved in this browser only' : 'Not live here — open the sheet from its claude.ai link'); return; }
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db) { setSyncState('Not live here — sign in on claude.ai'); return; }
    DBX = db;
    try { if (user && user.can && (await user.can('data.write')) === false) { cloudRO = true; setSyncState('Live · view only (you can\'t edit this sheet)'); } } catch (e) {}
    let owner = false; try { owner = !!(user && await user.isOwner()); } catch (e) {}
    cloudListen(db.doc('sheets/main'), async d => {
      // Moving onto the shared copy: bring along this person's own earlier copy (their per-account synced
      // copy, or this browser's) if it's newer than what's loaded.
      let mine = !!HADLOCAL;
      if (user) { try { const id = await user.id(); if (id) { const base = 'data/users/' + id, sn = await db.doc(base + '/sheet').get(), od = sn.exists ? sn.data() : null;
        if (od && N(od.savedAt) > N(S.savedAt)) { const txt = await cloudText(od, k => db.doc(base + '/sheet_' + k)); if (txt) { try { const old = JSON.parse(txt); if (old && old.id === S.id) { S = keepLocal(migrate(old), S); S.savedAt = od.savedAt; applyFixes(S); rebuildAuto(); applySources(S.sources); applyTheme(); render(); mine = true; } } catch (e) {} } } } } catch (e) {} }
      // Guests come first: the first time a guest who already has their own copy (with their settings and
      // changes) opens the live sheet, their copy becomes the shared one — even over a newer owner copy.
      if (!owner && mine && S.created && !cloudRO && !(d && d.guestDone)) { S.savedAt = Date.now(); GUESTCLAIM = true; await cloudWrite(); return true; }
      if (S.created && (!d || N(d.savedAt) < N(S.savedAt))) {
        // A newer copy of the sheet file is replacing the synced one: never lose the player's own settings, theme or layout.
        if (d && !cloudRO) { try { const txt = await cloudText(d); const old = txt && JSON.parse(txt); if (old && old.id === S.id) { keepPrefs(S, old); try { applyTheme(); render(); } catch (e) {} } } catch (e) {} }
        if (!cloudRO) cloudWrite(); }
      else if (d) setSyncState(cloudRO ? 'Live · view only (you can\'t edit this sheet)' : 'Live · synced ' + clock());
    });
  } catch (e) {}
})();
// Catch up whenever the page comes back (phone unlocked, tab refocused) or the network returns.
addEventListener('online', () => { if (CLOUD) cloudWrite(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden && CLOUD && /retrying|full/i.test(UI.saveState || '')) cloudWrite(); });

// ---------- Boot ----------
// For the GitHub Pages loader (new characters get their link once created).
window.sheetState = () => S; window.sheetToast = toast;
window.sheetSet = (k, v) => { S[k] = v; pendingLabel = null; save(); render('header'); };
window.sheetSummary = () => ({ name: S.name || '', player: S.player || '', race: S.raceName || '', cls: S.created ? classLabel() : '', level: S.created ? lvl() : 0, portrait: S.portrait || '', acc: /^#[0-9a-f]{6}$/i.test((S.theme || {}).accent || '') ? S.theme.accent : '', hp: S.created ? N(S.hp && S.hp.cur) + '/' + maxHp() : '' });
if (S.created) applySources(S.sources);
// Spells from a Ring of Spell Storing made before stored spells existed: set them up as stored now.
const staleStore = () => (S.spells || []).some(sp => { const it = sp.item && (S.inventory || []).find(x => x.id === sp.item); return it && itemStores(it) && !sp.usesOnly; });
// The second Psychic Blade became a proper bonus-action attack: sheets made before that pick it up now.
const staleBonusAtk = () => (S.attacks || []).some(a => a.auto === 'feature' && /^Psychic Blade \(bonus/i.test(a.name) && !a.bonus);
if (S.created && (FIXED || staleStore() || staleBonusAtk())) { const at = S.savedAt; rebuildAuto(); writeLocal(); S.savedAt = at; } // one-off fixes don't count as a newer edit (a newer synced copy still wins)
loadHist(FROM_LOCAL);
applyLayout(); applyTheme();
if (S.created) { render(); setTimeout(afterUpdate, 50); }
else openWizard();
window.addEventListener('resize', () => { if (!LAYOUT_NOW) { const was = isMobile(); applyLayout(); if (was !== isMobile() && S.created) render(); } });
// ---------- Import a character from D&D Beyond ----------
// D&D Beyond keeps a public character's data at its character service. Browsers can't read it directly from this site,
// so the site's small helper (the same one that makes party invite previews) fetches it; pasting the data works too.
// What comes over is the player's own character: names, numbers and choices, matched to this sheet's rules data. No
// rules text is copied from D&D Beyond: descriptions come from this sheet's own data.
const DDB_PROXY = 'https://invite.adventurerstome.workers.dev/ddb/';
const DDB_DIRECT = id => 'https://character-service.dndbeyond.com/character/v5/character/' + id;
const ddbNorm = s => String(s || '').toLowerCase().replace(/[’']/g, '').replace(/&/g, 'and').replace(/[^a-z0-9+]+/g, '');
const ddbId = t => { t = String(t || '').trim(); const m = /characters\/(\d{3,12})/.exec(t) || /character\/(\d{3,12})/.exec(t) || /^(\d{3,12})$/.exec(t); return m ? m[1] : ''; };
const DDB_AB = { 1: 'str', 2: 'dex', 3: 'con', 4: 'int', 5: 'wis', 6: 'cha' };
const DDB_ABNAME = { strength: 'str', dexterity: 'dex', constitution: 'con', intelligence: 'int', wisdom: 'wis', charisma: 'cha' };
const DDB_ALIGN = { 1: 'Lawful Good', 2: 'Neutral Good', 3: 'Chaotic Good', 4: 'Lawful Neutral', 5: 'True Neutral', 6: 'Chaotic Neutral', 7: 'Lawful Evil', 8: 'Neutral Evil', 9: 'Chaotic Evil' };
// D&D Beyond's ids for damage resistances (1-12, 47), immunities (17-28, 48) and vulnerabilities (33-44, 49).
const DDB_DADJ = (() => { const t = ['Bludgeoning', 'Piercing', 'Slashing', 'Lightning', 'Thunder', 'Poison', 'Cold', 'Radiant', 'Fire', 'Necrotic', 'Acid', 'Psychic'], o = {};
  t.forEach((n, i) => { o[i + 1] = ['resist', n]; o[i + 17] = ['immune', n]; o[i + 33] = ['vuln', n]; }); o[47] = ['resist', 'Force']; o[48] = ['immune', 'Force']; o[49] = ['vuln', 'Force']; return o; })();
const DDB_COND = { 1: 'Blinded', 2: 'Charmed', 3: 'Deafened', 5: 'Frightened', 6: 'Grappled', 7: 'Incapacitated', 8: 'Invisible', 9: 'Paralyzed', 10: 'Petrified', 11: 'Poisoned', 12: 'Prone', 13: 'Restrained', 14: 'Stunned', 15: 'Unconscious' };
// Accepts the character service's reply ({success, data}), the bare character, or a saved file of either.
function ddbParse(txt) {
  let j = null; try { j = typeof txt === 'string' ? JSON.parse(String(txt).trim().replace(/^﻿/, '')) : txt; } catch (e) { throw new Error('That isn’t D&D Beyond character data. Copy everything on the page (Ctrl+A, then Ctrl+C) and paste it here.'); }
  const d = j && j.data && j.data.classes ? j.data : j && j.character && j.character.classes ? j.character : j;
  if (!d || !Array.isArray(d.classes) || !Array.isArray(d.stats)) { if (j && j.success === false) throw new Error('D&D Beyond wouldn’t share that character. Make sure it’s set to Public (Character Settings → Privacy).'); throw new Error('That isn’t D&D Beyond character data.'); }
  return d;
}
async function ddbFetch(id) {
  let r; try { r = await fetch(DDB_PROXY + id, { credentials: 'omit' }); } catch (e) { throw new Error('Couldn’t reach D&D Beyond from here. Use “paste the data” below instead.'); }
  if (r.status === 403 || r.status === 401) throw new Error('That character is private. On D&D Beyond open it → Character Settings → Privacy → Public, then try again.');
  if (r.status === 404) throw new Error('D&D Beyond has no character with that number. Check the link.');
  if (!r.ok) throw new Error('D&D Beyond didn’t answer (' + r.status + '). Try again, or paste the data below.');
  return ddbParse(await r.text());
}
// All of a character's modifiers in one list, each tagged with where it came from.
const ddbMods = d => Object.entries(d.modifiers || {}).flatMap(([src, list]) => (list || []).map(m => Object.assign({ _src: src }, m)));
// Final ability scores the way D&D Beyond works them out. Item bonuses are left out (the sheet adds its items' own
// effects); `withItems` includes them, for working out what D&D Beyond shows for hit points.
function ddbScores(d, withItems) {
  const o = {}, mods = ddbMods(d);
  Object.entries(DDB_AB).forEach(([id, a]) => {
    const base = (d.stats.find(s => s.id === +id) || {}).value, bonus = (d.bonusStats.find(s => s.id === +id) || {}).value, ov = (d.overrideStats.find(s => s.id === +id) || {}).value;
    if (ov != null) { o[a] = N(ov); return; }
    let v = N(base) + N(bonus), set = 0; const sub = Object.keys(DDB_ABNAME).find(k => DDB_ABNAME[k] === a) + '-score';
    mods.filter(m => m.subType === sub && (withItems || m._src !== 'item')).forEach(m => { if (m.type === 'bonus') v += N(m.value != null ? m.value : m.fixedValue); if (m.type === 'set') set = Math.max(set, N(m.value != null ? m.value : m.fixedValue)); });
    const cap = 20 + mods.filter(m => m.type === 'bonus' && m.subType === Object.keys(DDB_ABNAME).find(k => DDB_ABNAME[k] === a) + '-score-maximum' && (withItems || m._src !== 'item')).reduce((t, m) => t + N(m.value), 0);
    o[a] = Math.max(set, Math.min(Math.max(cap, 20), v));
  });
  return o;
}
const ddbLevel = d => (d.classes || []).reduce((t, c) => t + N(c.level), 0);
// What D&D Beyond shows as maximum hit points.
function ddbMaxHp(d) {
  if (d.overrideHitPoints != null) return N(d.overrideHitPoints);
  const sc = ddbScores(d, true), lv = ddbLevel(d), mods = ddbMods(d);
  const per = mods.filter(m => m.type === 'bonus' && m.subType === 'hit-points-per-level').reduce((t, m) => t + N(m.value), 0);
  const flat = mods.filter(m => m.type === 'bonus' && m.subType === 'hit-points').reduce((t, m) => t + N(m.value), 0);
  return N(d.baseHitPoints) + N(d.bonusHitPoints) + Math.floor((sc.con - 10) / 2) * lv + per * lv + flat;
}
// ----- matching D&D Beyond's names to this sheet's rules data -----
function ddbFindClass(name) { const n = ddbNorm(name); const k = Object.keys(CL).find(k => ddbNorm(CL[k].name) === n && k !== 'rangertce') || Object.keys(CL).find(k => ddbNorm(CL[k].name) === n); return k || ''; }
function ddbFindSub(ck, name) { if (!ck || !name) return ''; const c = CL[ck], n = ddbNorm(String(name).replace(/\((archived|legacy)\)/ig, '')); const e = Object.entries(c.subclasses || {});
  const hit = e.find(([, s]) => ddbNorm(s.name) === n) || e.find(([, s]) => ddbNorm(s.name).replace(/^(circleofthe|circleof|pathofthe|pathof|wayofthe|wayof|collegeof|oathofthe|oathof|schoolof|the)/, '') === n.replace(/^(circleofthe|circleof|pathofthe|pathof|wayofthe|wayof|collegeof|oathofthe|oathof|schoolof|the)/, ''));
  return hit ? hit[0] : ''; }
function ddbFindRace(r) {
  if (!r) return null; const full = ddbNorm(r.fullName), base = ddbNorm(r.baseRaceName || r.baseName), short = ddbNorm(r.subRaceShortName);
  for (const [k, x] of Object.entries(DND.races)) {
    const subs = Object.entries(x.subraces || {});
    if (ddbNorm(x.name) === base || ddbNorm(x.name) === full) {
      const s = subs.find(([, s]) => ddbNorm(s.name) === full) || subs.find(([, s]) => short && (ddbNorm(s.name) === short || ddbNorm(s.name) === short + base)) || subs.find(([, s]) => ddbNorm(s.name + ' ' + x.name) === full);
      if (s || !subs.length || ddbNorm(x.name) === full) return { key: k, sub: s ? s[0] : '' };
    }
  }
  // a lineage or variant listed under another name (e.g. a subrace that's a race of its own here)
  for (const [k, x] of Object.entries(DND.races)) { const s = Object.entries(x.subraces || {}).find(([, s]) => ddbNorm(s.name) === full); if (s) return { key: k, sub: s[0] }; }
  for (const [k, x] of Object.entries(DND.races)) if (ddbNorm(x.name) === base) return { key: k, sub: '' };
  return null;
}
function ddbFindBg(name) { if (!name) return ''; const n = ddbNorm(String(name).split(/\s+[-–]\s+/)[0].replace(/\s*\(.*\)$/, '')); return Object.keys(DND.backgrounds).find(k => ddbNorm(DND.backgrounds[k].name) === n) || Object.keys(DND.backgrounds).find(k => String(DND.backgrounds[k].name).split(/\s*\/\s*|\s*\(/).some(p => ddbNorm(p) === n)) || ''; }
const ddbFindFeat = name => { const n = ddbNorm(name), n2 = ddbNorm(String(name || '').replace(/\s*\(.*\)\s*$/, '')); const f = DND.feats.find(x => ddbNorm(x[0]) === n) || DND.feats.find(x => ddbNorm(x[0]) === n2) || DND.feats.find(x => ddbNorm(x[0]) === n.replace(/2024$|legacy$/, '')); return f ? f[0] : ''; };
// Spells the free rules name without their wizard ("Hideous Laughter" is Tasha's Hideous Laughter here).
const ddbSpell = nm => SPI(nm) || Object.values(DND.spellIndex).find(sp => /['’]s /.test(sp.name) && ddbNorm(sp.name.replace(/^[^ ]+['’]s /, '')) === ddbNorm(nm)) || null;
const ddbSkill = sub => S.skills.find(s => ddbNorm(s.name) === ddbNorm(sub));
const ddbTool = name => ALL_TOOLS().find(t => ddbNorm(t) === ddbNorm(name)) || ALL_TOOLS().find(t => ddbNorm(t).replace(/s$/, '') === ddbNorm(name).replace(/s$/, ''));
const ddbWeapon = name => DND.weapons.find(w => ddbNorm(w[0]) === ddbNorm(name));
const ddbArmor = name => DND.armor.find(a => ddbNorm(a[0]) === ddbNorm(name) || ddbNorm(a[0]) === ddbNorm(name) + 'armor' || ddbNorm(a[0]).replace(/armor$/, '') === ddbNorm(name).replace(/armor$/, ''));
function ddbMagic(name, def) {
  const n = ddbNorm(name), M = DND.magic, by = s => M.find(m => ddbNorm(m[0]) === ddbNorm(s));
  let m = by(name); if (m) return m;
  const plus = /,?\s*\+([123])$/.exec(name) || /^\+([123])\s/.exec(name);
  if (plus) { const isShield = /shield/i.test(name) || /shield/i.test(def.baseArmorName || ''); return by((def.filterType === 'Weapon' ? 'Weapon' : def.filterType === 'Armor' ? (isShield ? 'Shield' : 'Armor') : 'Ammunition') + ' +' + plus[1]); }
  const base = def.type && def.filterType === 'Weapon' ? def.type : def.baseArmorName || '';
  if (base) { m = by(name.replace(new RegExp(',?\\s*' + base.replace(/[^\w ]/g, '.') + '$', 'i'), '')); if (m) return m; }
  if (/^mithral\b/i.test(name)) return by('Mithral Armor'); if (/^adamantine\b/i.test(name)) return by('Adamantine Armor');
  const par = /^(.*?)\s*\(([^)]+)\)$/.exec(name);
  if (par) { m = by(par[1].replace(/^Potion of /i, 'Potion of ' + par[2] + ' ')) || by(par[2] + ' ' + par[1]) || by(par[1]); if (m) return m; }
  return M.find(x => ddbNorm(x[0]).replace(/s$/, '') === n.replace(/s$/, '')) || null;
}
// One inventory entry → one of this sheet's items (unmatched ones come over by name, as plain items).
function ddbItem(x, miss) {
  const def = x.definition || {}, name = String(def.name || 'Item').trim();
  let it = null, matched = true;
  const baseW = def.filterType === 'Weapon' && (ddbWeapon(def.type) || ddbWeapon(name)), baseA = def.filterType === 'Armor' && (ddbArmor(def.baseArmorName) || ddbArmor(name) || (/shield/i.test(name) ? DND.armor.find(a => a[1] === 'shield') : null));
  if (def.magic || /\+[123]/.test(name)) {
    const m = ddbMagic(name, def);
    if (m) { const base = (m[6] || {}).base; it = makeMagicItem(m, base === 'weapon' && baseW ? makeWeaponItem(baseW) : (base === 'armor' || base === 'shield') && baseA ? makeArmorItem(baseA) : undefined); if (it.name !== name && !/\+\d/.test(name)) it.name = name; }
    else { matched = false; it = baseW ? makeWeaponItem(baseW) : baseA ? makeArmorItem(baseA) : { id: uid(), name, qty: 1, weight: N(def.weight), equipped: false, notes: '' }; it.name = name; it.magic = true; if (def.canAttune) it.attune = true; }
  } else if (baseW) it = makeWeaponItem(baseW);
  else if (baseA) it = makeArmorItem(baseA);
  else { const tries = [name, name.replace(/^([^,]+),\s*(.+)$/, '$2 $1'), name.replace(/\s*\(.*\)$/, ''), name.replace(/^(block|stick|bottle|vial|flask|pouch|bag) of /i, '')].map(ddbNorm);
    const g = DND.gear.find(g => tries.includes(ddbNorm(g[0]))), mm = !g && DND.magic.find(m => tries.includes(ddbNorm(m[0])));
    if (mm) it = makeMagicItem(mm); else if (g) it = makeGearItem(g); else { matched = false; it = { id: uid(), name, qty: 1, weight: N(def.weight), cost: def.cost ? def.cost + ' gp' : '', equipped: false, notes: '' }; } }
  if (!matched) miss.push('Item: ' + name);
  it.id = uid(); it.qty = Math.max(1, N(x.quantity) || 1); it.equipped = !!x.equipped;
  if (x.isAttuned) { it.attune = true; it.attuned = true; }
  if (x.limitedUse && it.charges && x.limitedUse.numberUsed != null) it.charges.used = N(x.limitedUse.numberUsed);
  return it;
}
// Build the whole character from D&D Beyond's data. Returns { state, report }; nothing is saved here.
// Every book is searched while matching (a Spelljammer race, say); the character then keeps only the books it uses.
function ddbBuild(d, opt = {}) {
  const prev = S, all = Object.keys(DND.sources);
  applySources(all);
  try { return ddbBuild0(d, opt); }
  finally { const keep = S; S = prev; applySources(typeof W !== 'undefined' && W ? W.sources : prev && prev.created ? prev.sources : undefined); S = keep; }
}
function ddbBuild0(d, opt = {}) {
  const ok = [], miss = [], notes = [];
  const prevS = S;
  S = migrate(Object.assign(blankState(), { dataRev: EMBED.dataRev || '', layout: (prevS && prevS.layout) || {} }));
  S.sources = defaultSources(); const useSrc = s => { if (s && DND.sources[s] && !S.sources.includes(s)) S.sources.push(s); };
  S.id = uid(); S.name = String(d.name || '').trim().slice(0, 80) || 'Unnamed Hero'; S.player = String(opt.player || '').slice(0, 80);
  S.alignment = DDB_ALIGN[d.alignmentId] || ''; S.faith = String(d.faith || '').slice(0, 80); S.xp = d.currentXp ? String(d.currentXp) : '';
  // race
  const rf = ddbFindRace(d.race), rname = (d.race && d.race.fullName) || '';
  if (rf) { S.race = { key: rf.key, sub: rf.sub, choices: {} }; const x = DND.races[rf.key], s = (x.subraces || {})[rf.sub] || {}; useSrc(x.src); const nm = s.name || x.name; S.raceName = nm.toLowerCase().includes(x.name.toLowerCase()) ? nm : nm.replace(/\s*\([A-Z][A-Za-z]{1,5}\)$/, '') + ' ' + x.name; ok.push('Race: ' + S.raceName); }
  else { S.raceName = rname; if (rname) miss.push('Race: ' + rname + ' (kept as its name; its traits aren’t automated)'); }
  // classes, starting class first
  const cls = (d.classes || []).slice().sort((a, b) => (b.isStartingClass ? 1 : 0) - (a.isStartingClass ? 1 : 0));
  S.classes = [];
  cls.forEach(c => { const k = ddbFindClass(c.definition && c.definition.name); if (!k) { miss.push('Class: ' + (c.definition && c.definition.name) + ' ' + c.level); return; }
    const sn = c.subclassDefinition && c.subclassDefinition.name, sk = ddbFindSub(k, sn); if (sn && !sk) miss.push('Subclass: ' + sn + ' (' + CL[k].name + ')');
    if (sk) useSrc(CL[k].subclasses[sk].src);
    S.classes.push({ key: k, level: Math.max(1, Math.min(20, N(c.level))), sub: sk && N(c.level) >= CL[k].sub.level ? sk : '' }); ok.push('Class: ' + CL[k].name + ' ' + c.level + (sk ? ' (' + CL[k].subclasses[sk].name + ')' : ''));
    if (N(c.hitDiceUsed)) S.hdUsed[CL[k].hd] = N(S.hdUsed[CL[k].hd]) + N(c.hitDiceUsed); });
  if (!S.classes.length) { S = prevS; throw new Error('None of this character’s classes are in this sheet’s rules, so it can’t be imported.'); }
  const c0 = CL[S.classes[0].key];
  // background
  const bgd = d.background && (d.background.definition || d.background.customBackground), bgName = bgd && bgd.name, bk = ddbFindBg(bgName);
  if (bk) { const b = DND.backgrounds[bk]; S.background = bk; S.backgroundName = b.name; useSrc(b.src); ok.push('Background: ' + b.name); }
  else if (bgName) { S.backgroundName = String(bgName).slice(0, 80); notes.push('Background “' + bgName + '” isn’t in this sheet’s rules: its name is kept and its proficiencies come over.'); }
  // proficiencies from the modifiers (only what's actually been chosen; open "choose a …" slots are skipped)
  const mods = ddbMods(d);
  S.profs = { armor: [], weapons: [], weaponNames: [] }; S.tools = []; S.langs = [];
  mods.forEach(m => { const st = String(m.subType || ''), fr = m.friendlySubtypeName || st; if (/^choose-/.test(st)) return;
    if (m.type === 'proficiency' || m.type === 'expertise') {
      const sv = /^(\w+)-saving-throws$/.exec(st); if (sv && DDB_ABNAME[sv[1]]) { if (m.type === 'proficiency') S.saves[DDB_ABNAME[sv[1]]] = true; return; }
      const sk = ddbSkill(st); if (sk) { sk.prof = Math.max(N(sk.prof), m.type === 'expertise' ? 2 : 1); return; }
      const ar = { 'light-armor': 'light', 'medium-armor': 'medium', 'heavy-armor': 'heavy', 'shields': 'shield' }[st]; if (ar) { S.profs.armor.push(ar); return; }
      const wc = { 'simple-weapons': 'simple', 'martial-weapons': 'martial' }[st]; if (wc) { S.profs.weapons.push(wc); return; }
      const w = ddbWeapon(fr); if (w) { S.profs.weaponNames.push(w[0]); return; }
      const t = ddbTool(fr); if (t || /tools|kit|supplies|instrument|vehicles|set$|gaming/i.test(fr) || DND.toolGroups && Object.values(DND.toolGroups).flat().some(x => ddbNorm(x) === ddbNorm(fr))) { addText('profTools', [t || fr]); if (m.type === 'expertise') { const tl = S.tools.find(x => ddbNorm(x.name) === ddbNorm(t || fr)); if (tl) tl.exp = true; } return; }
      // musical instruments and the like
      if (m.type === 'proficiency' && fr && !/ability checks|initiative/i.test(fr)) addText('profTools', [fr]);
    } else if (m.type === 'language' && fr && !/^choose/i.test(fr)) addText('languages', [fr]); });
  S.profs.armor = [...new Set(S.profs.armor)]; S.profs.weapons = [...new Set(S.profs.weapons)]; S.profs.weaponNames = [...new Set(S.profs.weaponNames)];
  if (!AB.some(a => S.saves[a])) c0.saves.forEach(a => S.saves[a] = true);
  S.profArmor = profArmorText(); S.profWeapons = profWeaponText();
  // feats
  (d.feats || []).forEach(f => { const nm = f.definition && f.definition.name, k = ddbFindFeat(nm); if (k) { if (!S.feats.includes(k)) S.feats.push(k); const ft = DND.feats.find(x => x[0] === k); if (ft) useSrc(ft[1]); ok.push('Feat: ' + k); } else if (nm && !/^(dark ?vision|ability score improvement|other spells|other)$/i.test(nm)) miss.push('Feat: ' + nm); });
  // class options picked on D&D Beyond (fighting styles, invocations, metamagic, maneuvers…)
  const picked = Object.values(d.options || {}).flat().map(o => o && o.definition && o.definition.name).filter(Boolean);
  picked.forEach(nm => { const n = ddbNorm(nm); for (const [t, o] of Object.entries(DND.options || {})) { const e = (o.list || []).find(x => ddbNorm(x[0]) === n); if (e) { applyChoice({ type: t }, [e[0]]); ok.push((o.label || t) + ': ' + e[0]); return; } } });
  // the sheet works out its own features, spells it grants and attacks
  S.combat = defaultCombat();
  rebuildAuto();
  // ability scores last, so nothing above adds to them a second time
  const sc = ddbScores(d, false); AB.forEach(a => S.abilities[a] = sc[a]);
  // spells: each class's list (prepared as on D&D Beyond), plus race and feat spells the sheet didn't add itself
  const classOf = id => { const c = (d.classes || []).find(c => c.id === id); return c ? ddbFindClass(c.definition && c.definition.name) : ''; };
  if (opt.spells !== false) {
    const add = (nm0, ck, o) => { const hit = ddbSpell(nm0), nm = hit ? hit.name : nm0, n = ddbNorm(nm); let sp = S.spells.find(s => ddbNorm(s.name) === n && (!ck || s.cls === ck || s.auto)); if (!hit) { miss.push('Spell: ' + nm0); }
      if (!sp) { sp = spellEntry(nm, ck || 'race'); if (!ck) { sp.ab = o.ab || 'cha'; sp.always = true; sp.note = o.note || ''; } S.spells.push(sp); }
      if (o.prepared && N(sp.level) > 0) sp.prepared = true; if (o.always) sp.always = true; };
    (d.classSpells || []).forEach(g => { const ck = classOf(g.characterClassId); (g.spells || []).forEach(s => add(s.definition.name, ck, { prepared: s.prepared || s.alwaysPrepared, always: s.alwaysPrepared })); });
    ['race', 'feat', 'class', 'background'].forEach(k => ((d.spells || {})[k] || []).forEach(s => { if (!s || !s.definition) return; const ab = DDB_AB[s.spellCastingAbilityId] || ''; add(s.definition.name, k === 'class' ? '' : '', { ab: ab || (k === 'race' ? 'cha' : 'int'), prepared: true, always: true, note: k === 'race' ? 'Racial' : k === 'feat' ? 'Feat' : '' }); }));
  }
  (d.spellSlots || []).forEach(s => { if (s.level >= 1 && s.level <= 9) S.slotsUsed[s.level - 1] = N(s.used); });
  S.pactUsed = (d.pactMagic || []).reduce((t, s) => t + N(s.used), 0);
  // inventory: containers become containers, the rest go in them or the pack
  if (opt.items !== false) {
    const inv = d.inventory || [], bagFor = {};
    inv.filter(x => x.definition && x.definition.isContainer && x.containerEntityId === d.id).forEach(x => { const nm = x.definition.name, p = BAG_PRESETS.find(b => ddbNorm(b[0]) === ddbNorm(nm)) || [nm, 0, false, N(x.definition.weight)];
      const b = { id: uid(), name: nm, cap: p[1] || '', weightless: !!p[2], weight: N(p[3]), notes: '' }; S.bags = (S.bags || []).concat([b]); bagFor[x.id] = b.id; });
    inv.forEach(x => { if (!x.definition || bagFor[x.id]) return; const it = ddbItem(x, miss); const bag = x.containerEntityId !== d.id ? bagFor[x.containerEntityId] : ''; if (bag && !it.equipped) it.bag = bag; addInventoryItem(it, true); });
    (d.customItems || []).forEach(x => { if (!x || !x.name) return; const it = { id: uid(), name: String(x.name).slice(0, 120), qty: Math.max(1, N(x.quantity) || 1), weight: N(x.weight), cost: x.cost ? x.cost + ' gp' : '', equipped: false, notes: String(x.description || x.notes || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000) }; addInventoryItem(it, true); });
    const cur = d.currencies || {}; ['cp', 'sp', 'ep', 'gp', 'pp'].forEach(k => S.currency[k] = N(cur[k]));
  }
  rebuildAuto();
  // hit points: match what D&D Beyond shows
  const hd0 = c0.hd; let base = hd0; S.classes.forEach((r, i) => { const c = CL[r.key]; for (let l = i === 0 ? 1 : 0; l < r.level; l++) base += Math.floor(c.hd / 2) + 1; });
  S.hp.base = N(d.baseHitPoints) || base; S.hp.adj = 0;
  const want = ddbMaxHp(d), have = maxHp(); if (want > 0 && want !== have) S.hp.adj = want - have;
  S.hp.cur = Math.max(0, maxHp() - N(d.removedHitPoints)); S.hp.temp = N(d.temporaryHitPoints);
  // the rest of the character
  const ds = d.deathSaves || {}; S.death = { s: N(ds.successCount), f: N(ds.failCount) };
  S.conditions = (d.conditions || []).map(c => DDB_COND[c.id]).filter(Boolean); const ex = (d.conditions || []).find(c => c.id === 4); if (ex) S.exhaustion = N(ex.level);
  if (d.inspiration) S.insp = 1;
  // resistances, immunities and vulnerabilities added by hand on D&D Beyond (Manage Defenses)
  { const md = { resist: [], immune: [], vuln: [] }, cap = t => t[0].toUpperCase() + t.slice(1);
    (d.customDefenseAdjustments || []).forEach(a => { const id = N(a && a.adjustmentId);
      if (N(a.type) === 2) { const e = DDB_DADJ[id]; if (e) md[e[0]].push(e[1]); else notes.push('A custom defense from D&D Beyond (#' + id + ') isn’t one this sheet knows; add it in Core → Proficiencies.'); }
      else if (N(a.type) === 1) { const c = ({ 4: 'Exhaustion', 16: 'Disease' })[id] || DDB_COND[id]; if (c) md.immune.push(c); } });
    ['resist', 'immune', 'vuln'].forEach(k => md[k] = [...new Set(md[k])]);
    if (md.resist.length || md.immune.length || md.vuln.length) { S.manualDef = md; ok.push('Defenses: ' + [md.resist.length && 'resist ' + md.resist.join(', '), md.immune.length && 'immune ' + md.immune.join(', '), md.vuln.length && 'vulnerable ' + md.vuln.join(', ')].filter(Boolean).join('; ')); } }
  const t = d.traits || {}, nt = d.notes || {}, txt = v => String(v || '').replace(/\r/g, '').trim().slice(0, 6000);
  S.traits = { personality: txt(t.personalityTraits), ideals: txt(t.ideals), bonds: txt(t.bonds), flaws: txt(t.flaws) };
  S.appearance = { age: txt(d.age), height: txt(d.height), weight: txt(d.weight), eyes: txt(d.eyes), skin: txt(d.skin), hair: txt(d.hair) };
  S.backstory = txt(nt.backstory); S.allies = [txt(nt.allies), txt(nt.organizations)].filter(Boolean).join('\n\n');
  const extra = [nt.personalPossessions && 'Possessions: ' + txt(nt.personalPossessions), nt.otherHoldings && 'Holdings: ' + txt(nt.otherHoldings), nt.otherNotes && txt(nt.otherNotes), t.appearance && 'Appearance: ' + txt(t.appearance)].filter(Boolean).join('\n\n');
  S.notes = [{ date: new Date().toISOString().slice(0, 10), title: 'Imported from D&D Beyond', text: `${S.name}: ${S.raceName} ${classLabel()}${S.backgroundName ? ', ' + S.backgroundName : ''}.` + (extra ? '\n\n' + extra : '') }];
  S.ddb = { id: N(d.id), at: Date.now() };
  // Ability Score Improvements were already spent on D&D Beyond (the scores and feats above include them), so they aren't asked for again
  S.dismissed = Object.assign({}, S.dismissed); S.classes.forEach(r => (CL[r.key].asi || []).filter(l => l <= N(r.level)).forEach(l => { S.dismissed[`asi.${r.key}.${l}`] = true; }));
  // carrying rules as the character used them on D&D Beyond (off there unless turned on)
  const enc = { 1: 'standard', 2: 'off', 3: 'variant' }[N((d.preferences || {}).encumbranceType)];
  if (enc) { S.settings = Object.assign({}, S.settings, { encumbrance: enc }); S.fixesDone = [...new Set((S.fixesDone || []).concat(['enc1', 'bullets1']))]; }
  const state = S; S = prevS;
  return { state, report: { ok, miss: [...new Set(miss)], notes, hp: want, avatar: (d.decorations || {}).avatarUrl || '' } };
}
// The portrait comes over through the same helper (so it can be drawn and kept), shrunk like any other portrait.
async function ddbPortrait(url) {
  if (!/^https:\/\/(www\.)?dndbeyond\.com\/avatars\//.test(String(url || ''))) return '';
  try { const r = await fetch(DDB_PROXY + 'avatar?u=' + encodeURIComponent(url), { credentials: 'omit' }); if (!r.ok) return ''; const b = await r.blob(); if (!/^image\//.test(b.type)) return '';
    const u = URL.createObjectURL(b); const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
    const s = Math.min(1, 400 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
    return c.toDataURL('image/jpeg', .86); } catch (e) { return ''; }
}
// ----- the import window: link or ID → (or paste / file) → review → create -----
let DDB = null;
function openDdbImport() { DDB = { step: 'get', id: '', err: '', busy: false, data: null, built: null, items: true, spells: true, portrait: true }; ddbPaint(); }
function ddbPaint() {
  if (!DDB) return; const D = DDB, b = D.built;
  let h = '';
  if (D.step === 'get') {
    const link = D.id ? DDB_DIRECT(D.id) : '';
    h = `<h3>Import from D&amp;D Beyond</h3>
      <p class="hint">Bring over a character you made on D&amp;D Beyond: race, classes and subclasses, ability scores, hit points, proficiencies, feats, spells, equipment, money and notes. You’ll see what came over before it’s made.</p>
      <label class="fld"><span class="lbl">Character link or number</span><input class="f" id="ddb-id" value="${esc(D.id)}" placeholder="https://www.dndbeyond.com/characters/12345678" autocomplete="off" inputmode="url"></label>
      <p class="hint">The character has to be <b>Public</b> on D&amp;D Beyond: open it there → <b>Character Settings</b> → <b>Privacy</b> → <b>Public</b>.</p>
      ${D.err ? `<p class="ddb-err">${esc(D.err)}</p>` : ''}
      <div class="actions" style="justify-content:flex-start"><button class="btn gold" data-ddb="fetch"${D.busy ? ' disabled' : ''}>${D.busy ? 'Getting it…' : 'Get my character'}</button></div>
      <details class="ddb-alt"${D.err ? ' open' : ''}><summary>Or paste the character data yourself</summary>
        <ol class="ddb-steps"><li>${link ? `Open <a href="${esc(link)}" target="_blank" rel="noopener noreferrer">this page</a>` : 'Type the link or number above, then open the data page it gives'} in a new tab (the character still has to be Public).</li><li>Select everything on it (Ctrl+A / ⌘A) and copy it.</li><li>Paste it below.</li></ol>
        <textarea class="f" id="ddb-paste" rows="5" placeholder='{"id":0,"success":true,"message":"Character successfully received.","data":{…}}'></textarea>
        <div class="row"><button class="btn" data-ddb="paste">Use what I pasted</button><button class="btn" data-ddb="file">Open a saved file…</button><input type="file" id="ddb-file" accept=".json,application/json,text/plain" hidden></div></details>
      <div class="actions"><button class="btn" data-ddb="close">Cancel</button></div>`;
  } else if (D.step === 'review' && b) {
    const st = b.state, r = b.report;
    const scores = AB.map(a => `<span class="ddb-ab"><small>${AB3[a]}</small><b>${st.abilities[a]}</b></span>`).join('');
    h = `<h3>Import ${esc(st.name)}</h3>
      <div class="ddb-who">${D.portraitUrl ? `<img src="${esc(D.portraitUrl)}" alt="">` : ''}<div><b>${esc(st.name)}</b><span>${esc([st.raceName, st.classes.map(c => CL[c.key].name + ' ' + c.level).join(' / ')].filter(Boolean).join(' · '))}</span><span>${esc([st.backgroundName, st.alignment].filter(Boolean).join(' · '))}</span></div></div>
      <div class="ddb-abs">${scores}</div>
      <p class="hint">Hit points <b>${N(st.hp.cur)}</b> of <b>${r.hp}</b>${N(st.hp.temp) ? ` (+${st.hp.temp} temporary)` : ''} · ${st.spells.length} spells · ${st.inventory.length} items${st.feats.length ? ' · feats: ' + esc(st.feats.join(', ')) : ''}</p>
      <div class="ddb-opts"><label class="checkline"><input type="checkbox" data-ddbo="items"${D.items ? ' checked' : ''}> Equipment and money</label><label class="checkline"><input type="checkbox" data-ddbo="spells"${D.spells ? ' checked' : ''}> Spells</label>${D.portraitUrl ? `<label class="checkline"><input type="checkbox" data-ddbo="portrait"${D.portrait ? ' checked' : ''}> Portrait</label>` : ''}</div>
      ${r.miss.length ? `<details class="ddb-miss" open><summary>${r.miss.length} thing${r.miss.length === 1 ? '' : 's'} this sheet doesn’t have built in</summary><p class="hint">These come over by name only (or are left out), so their rules aren’t automated. You can fix them on the sheet afterwards.</p><ul>${r.miss.slice(0, 80).map(m => `<li>${esc(m)}</li>`).join('')}${r.miss.length > 80 ? `<li>…and ${r.miss.length - 80} more</li>` : ''}</ul></details>` : '<p class="ddb-allok">Everything was matched to this sheet’s rules.</p>'}
      ${r.notes.length ? `<ul class="hint">${r.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      <p class="hint">Choices the sheet asks for that D&amp;D Beyond didn’t record show up as <b>Unfinished choices</b> on the sheet. Limited-use features start fresh.</p>
      <div class="actions"><button class="btn" data-ddb="back">Back</button><button class="btn gold" data-ddb="make">Create ${esc(st.name)}</button></div>`;
  }
  openModal(`<div class="ddb">${h}</div>`, () => { DDB = null; }, true);
  const inp = $('#ddb-id'); if (inp) { inp.oninput = () => { D.id = ddbId(inp.value) || ''; D.raw = inp.value; const a = $('.ddb-steps a'); }; inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); ddbAct('fetch'); } }; if (D.step === 'get' && !D.busy) setTimeout(() => inp.focus(), 30); }
  $$('#modal-body [data-ddb]').forEach(x => x.onclick = () => ddbAct(x.dataset.ddb));
  $$('#modal-body [data-ddbo]').forEach(x => x.onchange = () => { D[x.dataset.ddbo] = x.checked; if (x.dataset.ddbo !== 'portrait') ddbRebuild(); });
  const f = $('#ddb-file'); if (f) f.onchange = () => { const file = f.files && f.files[0]; if (!file) return; file.text().then(t => ddbUse(t), () => { D.err = 'Couldn’t read that file.'; ddbPaint(); }); };
}
function ddbRebuild() { const D = DDB; if (!D || !D.data) return; try { D.built = ddbBuild(D.data, { items: D.items, spells: D.spells, player: window.SHEET_PAGES ? '' : (W && W.player) || '' }); } catch (e) { D.err = e.message; D.step = 'get'; } ddbPaint(); }
function ddbUse(txt) { const D = DDB; if (!D) return; try { D.data = ddbParse(txt); } catch (e) { D.err = e.message; ddbPaint(); return; } D.err = ''; D.step = 'review'; D.portraitUrl = ''; ddbRebuild();
  const av = D.built && D.built.report.avatar; if (av) ddbPortrait(av).then(u => { if (u && DDB === D) { D.portraitUrl = u; if (D.step === 'review') ddbPaint(); } }); }
async function ddbAct(a) {
  const D = DDB; if (!D) return;
  if (a === 'close') { closeModal(); DDB = null; return; }
  if (a === 'back') { D.step = 'get'; D.err = ''; return ddbPaint(); }
  if (a === 'file') { const f = $('#ddb-file'); if (f) f.click(); return; }
  if (a === 'paste') { const t = ($('#ddb-paste') || {}).value || ''; if (!t.trim()) { D.err = 'Paste the character data first.'; return ddbPaint(); } return ddbUse(t); }
  if (a === 'fetch') { const v = ($('#ddb-id') || {}).value || ''; D.id = ddbId(v); if (!D.id) { D.err = 'Paste the character’s link from D&D Beyond (it ends in a number), or just the number.'; return ddbPaint(); }
    D.busy = true; D.err = ''; ddbPaint();
    try { const data = await ddbFetch(D.id); if (DDB !== D) return; D.busy = false; return ddbUse(data); } catch (e) { if (DDB !== D) return; D.busy = false; D.err = e.message; return ddbPaint(); } }
  if (a === 'make') ddbCreate();
}
function ddbCreate() {
  const D = DDB; if (!D || !D.built) return;
  S = D.built.state; if (D.portrait && D.portraitUrl) S.portrait = D.portraitUrl;
  closeModal(true); DDB = null; closeWizard();
  S.created = true;
  LAST = snapAll(); HIST = []; REDO = [];
  pendingLabel = 'Import from D&D Beyond'; writeLocal(); save();
  if (S.portrait) matchPortrait(false);
  applyTheme(); applyLayout(); render();
  toast(`<div><b>${esc(S.name)}</b> is here from D&amp;D Beyond!<div class="det">Check the Inventory and Spells tabs, and any <b>Unfinished choices</b>. Everything saves automatically.</div></div>`, 'crit', 12000);
}

})();
// While typing on a phone the keyboard is up: hide the bottom tab bar (like a native app) instead of letting it ride up above the keyboard.
{
  const typing = el => !!el && (el.isContentEditable || el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && !/^(button|checkbox|radio|range|color|file|submit|reset|image)$/i.test(el.type || '')) || el.tagName === 'SELECT');
  let kbT = 0;
  document.addEventListener('focusin', e => { clearTimeout(kbT); if (typing(e.target)) document.documentElement.classList.add('kbopen'); });
  document.addEventListener('focusout', () => { clearTimeout(kbT); kbT = setTimeout(() => { if (!typing(document.activeElement)) document.documentElement.classList.remove('kbopen'); }, 120); });
}
{
  // Windows and menus fade out instead of vanishing: when one loses its "open" class it keeps showing (as .closing,
  // not clickable) just long enough to fade, and opening it again cancels that.
  const W = [['#modal', 'open'], ['#wizard', 'open'], ['.menu', 'open'], ['#tipbox', 'on']];
  const match = el => W.find(([sel]) => el.matches && el.matches(sel));
  new MutationObserver(ms => ms.forEach(m => { const el = m.target, w = match(el); if (!w) return; const cls = w[1], was = (' ' + (m.oldValue || '') + ' ').includes(' ' + cls + ' '), now = el.classList.contains(cls);
    if (now) { if (!was && el.classList.contains('closing')) { clearTimeout(el._fc); el.classList.remove('closing'); } return; }
    if (was && !now && !(' ' + (m.oldValue || '') + ' ').includes(' closing ') && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { el.classList.add('closing'); clearTimeout(el._fc); el._fc = setTimeout(() => el.classList.remove('closing'), document.documentElement.classList.contains('mobile') ? 240 : 190); } }))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['class'], attributeOldValue: true, subtree: true });
}

