// ---------- Feature automation ----------
// Every feature (class, subclass, race, feat, class option) gets an "fx" record: explicit entries from
// DND.featFx (data/featfx.js) merged with what can be read from its description — when it's used
// (action / bonus action / reaction), what it spends (ki, Channel Divinity, sorcery points, superiority
// dice…), the save DC it imposes, and passive effects on AC, speed, saves, initiative and defenses.
const ABRE = { STR: 'str', DEX: 'dex', CON: 'con', INT: 'int', WIS: 'wis', CHA: 'cha' };
const NUMW = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
function fxKeyParts(f) { return String(f.key || '').split(':'); }
function fxExplicit(f) {
  const base = fxExplicit0(f), hb = hbFx(f.hb);
  if (!hb) return base;
  const o = Object.assign({}, base || {}, hb);
  if (base && base.passive && hb.passive) o.passive = [].concat(base.passive, hb.passive);
  return o;
}
function fxExplicit0(f) {
  const T = DND.featFx || {}, p = fxKeyParts(f), name = f.dname || f.name;
  if (p[0] === 'pick') { const op = DND.options[p[1]], e = op && op.list.find(x => x[0] === p.slice(2).join(':')); return (e && e[3]) || null; }
  if (p[0] === 'feat') return T['feat:' + p.slice(1).join(':')] || T[name] || null;
  return T[f.key] || (p.length >= 3 && T[p[0] + ':' + p[1] + ':' + name]) || (p.length >= 3 && T[p[1] + ':' + name]) || T[p[0] + ':' + name] || T[name] || null;
}
// Which DC a class's features use when the description just says "WIS save".
function defaultDC(f) {
  const p = fxKeyParts(f), cls = f.cls || p[0], sub = p.length >= 3 ? p[1] : '';
  if (cls === 'race' || f.kind === 'race') return 'con';
  if (cls === 'monk') return 'wis';
  if (cls === 'barbarian') return 'con';
  if (cls === 'fighter') return { runeknight: 'con', psiwarrior: 'int', arcanearcher: 'int', eldritchknight: 'spell' }[sub] || 'str|dex';
  if (cls === 'rogue') return { arcanetrickster: 'spell', soulknife: 'dex' }[sub] || 'dex';
  if (CL[cls] && (CL[cls].caster || casterFor(cls))) return 'spell';
  return 'spell';
}
function fxAuto(f) {
  const d = String(f.desc || ''), n = String(f.dname || f.name || ''), o = {};
  if (!f.col) {
    if (/^(bonus action|as a bonus action)\b/i.test(d) || /^spend[^.:]*bonus action/i.test(d)) o.col = 'bonus';
    else if (/^reaction\b/i.test(d)) o.col = 'reaction';
    else if (/^action\b/i.test(d)) o.col = 'action';
    else if (/\b(use your reaction|as a reaction)\b/i.test(d)) o.col = 'reaction';
    else if (/\bas a bonus action\b/i.test(d)) o.col = 'bonus';
  }
  if (/^Channel Divinity: /.test(n) || (n === 'Turn Undead' && (f.cls === 'cleric'))) o.cost = { from: 'Channel Divinity', n: 1 };
  else { let m;
    if ((m = /\bspend (\d+|one|two|three|four|five)(?:\+|–\d+)? ki\b/i.exec(d)) || (m = /\b(\d+) ki\b/i.exec(d))) o.cost = { from: 'Ki', n: N(m[1]) || NUMW[m[1].toLowerCase()] || 1 };
    else if ((m = /\bspend (\d+|one|two|three)(?:\+|–\d+)? sorcery points?\b/i.exec(d))) o.cost = { from: 'Font of Magic', n: N(m[1]) || NUMW[m[1].toLowerCase()] || 1 };
    else if (/\bspend (?:a use of |one use of |a |one )?wild shape\b/i.test(d)) o.cost = { from: 'Wild Shape', n: 1 };
    else if (/\bspend (?:a |one |your )?bardic inspiration\b/i.test(d)) { o.cost = { from: 'Bardic Inspiration', n: 1 }; o.roll = '1bi'; }
  }
  const sv = /\b(STR|DEX|CON|INT|WIS|CHA)(?: or (STR|DEX|CON|INT|WIS|CHA))? sav(?:e|ing throw)\b/.exec(d);
  if (sv) { o.save = sv[2] ? sv[1] + ' or ' + sv[2] : sv[1]; o.dc = defaultDC(f); }
  return o;
}
function fxOf(f) {
  if (!f) return {};
  const ex = fxExplicit(f) || {};
  const au = fxAuto(f); if (ex.acts && !('col' in ex)) delete au.col;
  const fx = Object.assign({}, au, ex);
  Object.keys(fx).forEach(k => { if (fx[k] === null) delete fx[k]; });
  if (ex.dc === false) delete fx.dc;
  // House rule: the Protector cannon's temp HP grows with Explosive Cannon like the other two (2d8 at 9th).
  if (f.key === 'artificer:artillerist:Eldritch Cannon' && ST('protectorScales') && Array.isArray(fx.acts)) fx.acts = fx.acts.map(a => a.name === 'Protector' ? Object.assign({}, a, { roll: '{tier(artificer,3,1,9,2)}d8+max(1,int)' }) : a);
  if (S.race && S.race.key === 'dragonborn') dbFx(f, fx);
  return fx;
}
// Dragonborn: show only the breath weapon of this dragonborn's book, with the ancestry's damage type, shape and save filled in.
const DB_ANC = { Black: 'acid', Blue: 'lightning', Brass: 'fire', Bronze: 'lightning', Copper: 'acid', Gold: 'fire', Green: 'poison', Red: 'fire', Silver: 'cold', White: 'cold', Amethyst: 'force', Crystal: 'radiant', Emerald: 'psychic', Sapphire: 'thunder', Topaz: 'necrotic' };
function dbAncestry() { const c = (S.race && S.race.choices) || {}; const v = c['Draconic Ancestry'] || c['Chromatic Ancestry'] || c['Metallic Ancestry'] || c['Gem Ancestry']; return v && DB_ANC[v] ? { color: v, type: DB_ANC[v] } : null; }
function dbFx(f, fx) {
  const anc = dbAncestry(), sub = S.race.sub || '';
  if (f.key === 'race:Breath Weapon' && Array.isArray(fx.acts)) {
    const phb = !sub || sub === 'standard';
    fx.acts = fx.acts.filter(a => /PHB/.test(a.name) === phb).map(a => {
      const b = Object.assign({}, a, { name: 'Breath Weapon' });
      if (!anc) return b;
      if (phb) { const cone = ['Gold', 'Green', 'Red', 'Silver', 'White'].includes(anc.color); b.save = ['Green', 'Silver', 'White'].includes(anc.color) ? 'CON' : 'DEX'; b.rollNote = `${anc.type} damage, half on a save (${cone ? '15 ft cone' : '5×30 ft line'})`; }
      else b.rollNote = `${anc.type} damage, half on a save (replaces one attack; ${sub === 'chromatic' ? '15 ft cone or 5×30 ft line' : '15 ft cone'})`;
      return b;
    });
  }
  if (anc && (f.key === 'race:Damage Resistance' || f.key === 'race:Draconic Resistance') && fx.passive) fx.passive = Object.assign({}, fx.passive, { resist: [anc.type] });
}
// Save DCs: 'spell' (that class's spell DC), 'wis', 'str|dex' (the better one), or a number.
function dcVal(spec, cls) {
  if (spec == null || spec === '') return null;
  if (typeof spec === 'number') return spec;
  if (spec === 'spell') return castInfo(cls).dc;
  const abs = String(spec).split('|').filter(a => AB.includes(a));
  if (!abs.length) return null;
  return 8 + PB() + Math.max(...abs.map(a => mod(a)));
}
// "DC 8 + prof + STR or DEX" → "DC 15" (descriptions and class tables).
function formulaDC(txt) {
  return String(txt || '')
    .replace(/(?:DC )?8 \+ (?:prof(?:iciency)?(?: bonus)?|proficiency) \+ (STR|DEX|CON|INT|WIS|CHA)(?: (?:or|\/) (STR|DEX|CON|INT|WIS|CHA))?(?: mod(?:ifier)?)?/g, (m, a, b) => 'DC ' + (8 + PB() + Math.max(mod(ABRE[a]), b ? mod(ABRE[b]) : -99)))
    .replace(/(?:DC )?8 \+ (STR|DEX|CON|INT|WIS|CHA)(?: mod(?:ifier)?)? \+ prof(?:iciency)?(?: bonus)?/g, (m, a) => 'DC ' + (8 + PB() + mod(ABRE[a])));
}
// Dice tokens in feature rolls: 1sup (superiority die), 1ma (martial arts die), 1bi (bardic inspiration), 1psi (psionic energy die).
function scalingDie(name, def) { for (const r of clsRows()) { const v = classScaling(r.key).find(([n]) => n.toLowerCase() === name.toLowerCase()); if (v) return String(v[1]).replace(/^1/, ''); } return def; }
function fxRollExpr(expr) {
  let e = String(expr || '');
  e = e.replace(/\{([^}]+)\}/g, (m, x) => { const v = evalMax(x); return v == null ? '0' : String(v); });
  const bi = () => { const b = clsLv('bard'); return b >= 15 ? 'd12' : b >= 10 ? 'd10' : b >= 5 ? 'd8' : 'd6'; };
  e = e.replace(/(\d*)(sup|ma|bi|psi)\b/g, (m, k, t) => (k || '1') + (t === 'sup' ? scalingDie('Superiority Die', 'd6') : t === 'ma' ? (martialDie() || 'd4') : t === 'bi' ? bi() : scalingDie('Psionic Energy Die', 'd6')));
  return evalRoll(e);
}
// Passive effects from every feature you have (some only while raging, concentrating or under an effect).
let _fxpKey = '', _fxp = [];
function fxPassives() {
  const key = JSON.stringify(S.inventory.filter(it => it.resPick).map(it => [hbItemOn(it), it.resPick])) + '|' + JSON.stringify(S.inventory.filter(it => it.infusion).map(it => [hbItemOn(it), it.attuned, it.infusion.name, it.infusion.choice])) + '|' + JSON.stringify(S.features.map(f => f.hb || 0)) + '|' + JSON.stringify(S.inventory.filter(it => it.hb).map(it => [hbItemOn(it), it.hb])) + '|' + S.features.length + '|' + S.conditions.join() + '|' + (S.effects || []).map(e => e.name).join() + '|' + S.concentration + '|' + totalLevel() + '|' + JSON.stringify(S.picks || {}) + '|' + S.features.map(f => f.name).join();
  const mdKey = JSON.stringify(S.manualDef || null); if (key + mdKey === _fxpKey) return _fxp;
  const out = [], raging = S.conditions.includes('Raging');
  S.features.forEach(f => {
    const fx = fxOf(f), own = f.cls ? clsLv(f.cls) : lvl();
    const push = (p, tag) => [].concat(p || []).forEach(x => {
      if (!x || (x.min && own < x.min)) return;
      if (x.when === 'conc' && !S.concentration) return;
      if (x.effect && !fxActive().some(e => e.name === x.effect)) return;
      out.push(Object.assign({ src: f.name }, x, tag ? { raging: true } : {}));
    });
    push(fx.passive); if (raging) push(fx.raging, true);
    if (f.kind === 'race' && !(f.hb && f.hb.resist)) { const m = /\bresistance to ([a-z ,]+?) damage/i.exec(f.desc || ''); if (m && !/while|when you|choose/i.test(f.desc) && !/\byour\b/i.test(m[1])) out.push({ src: f.name, resist: m[1].split(/,\s*|\s+and\s+|\s+or\s+/).map(s => s.trim()).filter(Boolean) }); }
  });
  // Items that resist a damage type of your choice (Ring of Resistance…), while worn and attuned
  S.inventory.forEach(it => { if (it.resPick && resPickItem(it) && hbItemOn(it)) out.push({ src: it.name, item: it.id, resist: [it.resPick] }); });
  // Homebrew item effects (resistances, speeds, AC…) while the item is in use
  infPassives().forEach(p => out.push(p));
  S.inventory.forEach(it => { if (!hbItemOn(it)) return; const fx = hbFx(it.hb); if (fx && fx.passive) [].concat(fx.passive).forEach(x => { if (x.effect && !fxActive().some(e => e.name === x.effect)) return; out.push(Object.assign({ src: it.name, item: it.id }, x)); }); });
  { const md = S.manualDef || {}, cn = DEF_COND.map(c => c.toLowerCase()), im = md.immune || [];
    if ((md.resist || []).length || im.length) out.push({ src: 'Added by you', resist: (md.resist || []).map(t => t.toLowerCase()), immune: im.filter(t => !cn.includes(t.toLowerCase())).map(t => t.toLowerCase()), condImmune: im.filter(t => cn.includes(t.toLowerCase())) }); }
  _fxpKey = key + mdKey; _fxp = out; return out;
}
const fxSkillBonus = name => fxPassives().filter(p => p.skillBonus && p.skillBonus[name]).map(p => [p.src, N(p.skillBonus[name])]);
const fxSum = (k, filter) => fxPassives().filter(p => p[k] != null && (!filter || filter(p))).reduce((t, p) => t + (typeof p[k] === 'number' ? p[k] : p[k] === 'attuned' ? attunedCount() : N(evalMax(p[k]))), 0);
const fxList = k => [...new Set(fxPassives().flatMap(p => [].concat(p[k] || [])))];
const fxSaveProf = ab => fxPassives().some(p => p.saveProf === 'all' || [].concat(p.saveProf || []).includes(ab));
// Resistances, immunities and advantages with where each one comes from (merged when several sources give the same thing).
function defensesDetail() {
  const out = { resist: [], immune: [], adv: [] };
  const cap = t => { t = String(t).trim(); if (/^diseased$/i.test(t)) t = 'disease'; return t.charAt(0).toUpperCase() + t.slice(1); };
  const add = (arr, t, src) => { if (!t) return; const tt = cap(t), k = tt.toLowerCase(); let e = arr.find(x => x.k === k); if (!e) arr.push(e = { k, t: tt, src: [] }); if (src && !e.src.includes(src) && !k.startsWith(String(src).toLowerCase())) e.src.push(src); };
  fxActive().forEach(e => { const b = e.buff; if (!b || e.ally || e.self === false) return; [].concat(b.resist || []).forEach(t => add(out.resist, t, e.name)); [].concat(b.immune || []).forEach(t => add(out.immune, t, e.name)); [].concat(b.condImmune || []).forEach(t => add(out.immune, t, e.name)); });
  fxPassives().forEach(p => {
    [].concat(p.resist || []).forEach(t => add(out.resist, t, p.src));
    [].concat(p.immune || []).forEach(t => add(out.immune, t, p.src));
    [].concat(p.condImmune || []).forEach(t => add(out.immune, /^(diseased|disease)$/i.test(t) ? 'disease' : String(t).toLowerCase() === t ? t : t, p.src));
    [].concat(p.advNote || []).forEach(t => add(out.adv, t, p.src));
  });
  return out;
}
function defensesText() {
  const r = fxList('resist'), im = fxList('immune'), ci = fxList('condImmune'), adv = fxList('advNote');
  return { resist: r, immune: im, condImmune: ci, adv };
}
// ---------- Using features ----------
function fxSource(from, cls) {
  const lc = String(from).toLowerCase();
  let i = S.features.findIndex(f => String(f.dname || f.name).toLowerCase() === lc && (!cls || !f.cls || f.cls === cls));
  if (i < 0) i = S.features.findIndex(f => String(f.dname || f.name).toLowerCase() === lc);
  return i;
}
function fxLeft(i) { const f = S.features[i]; if (!f) return 0; let m = featMax(f); if (m == null && /^font of magic$/i.test(String(f.dname || f.name || ''))) m = clsLv('sorcerer'); return m == null ? 99 : Math.max(0, m - N(f.used)); }
function fxCostText(c) { return c ? `${c.n || 1} ${c.from === 'Font of Magic' ? 'sorcery point' + ((c.n || 1) > 1 ? 's' : '') : c.from === 'Combat Superiority' ? 'superiority ' + ((c.n || 1) > 1 ? 'dice' : 'die') : c.from}` : ''; }
// Spend a resource; returns an error message or ''.
function fxSpend(c, cls) {
  if (!c) return '';
  const i = fxSource(c.from, cls); if (i < 0) return `You don't have ${c.from}.`;
  const f = S.features[i], n = c.n || 1, left = fxLeft(i);
  if (left < n) return `Not enough ${c.from} left (${left}).`;
  f.used = N(f.used) + n; return '';
}
function fxApplyUse(u, name, lines) {
  if (!u) return;
  if (u.effect) { const e = JSON.parse(JSON.stringify(u.effect)); e.name = e.name || name; if (e.buff) Object.keys(e.buff).forEach(k => { if (typeof e.buff[k] === 'string' && /^[a-z0-9+*()/ ,-]+$/i.test(e.buff[k]) && !/note|dmgDice/.test(k)) { const v = evalMax(e.buff[k]); if (v != null) e.buff[k] = v; } });
    S.effects = (S.effects || []).filter(x => x.name !== e.name).concat([e]); lines.push(`${e.name} is active${e.rounds ? ' for ' + fmtRounds(e.rounds) : ''}`); }
  if (u.cond && !S.conditions.includes(u.cond)) { S.conditions.push(u.cond); if (u.condRounds) { S.condTurns = S.condTurns || {}; S.condTurns[u.cond] = u.condRounds; } lines.push(`${u.cond}${u.condRounds ? ' for ' + u.condRounds + ' round' + (u.condRounds > 1 ? 's' : '') : ''}`); }
  if (u.temp) { const r = rollExpr(fxRollExpr(u.temp), { need: true, label: name + ': temporary HP' }); if (r.total > N(S.hp.temp)) { S.hp.temp = r.total; lines.push(`${r.total} temporary HP`); } else lines.push(`${r.total} temporary HP (you kept your higher ${S.hp.temp})`); }
  if (u.heal) { const r = rollExpr(fxRollExpr(u.heal), { need: true, label: name + ': healing' }); const b = N(S.hp.cur); S.hp.cur = Math.min(maxHp(), b + r.total); lines.push(`Healed ${S.hp.cur - b} HP`); }
  if (u.healFull) { const b = N(S.hp.cur); S.hp.cur = maxHp(); lines.push(`Healed ${S.hp.cur - b} HP`); }
  if (u.setHp != null) { const v = Math.max(N(S.hp.cur), N(evalMax(String(u.setHp)))); S.hp.cur = Math.min(maxHp(), v); lines.push(`HP set to ${S.hp.cur}`); }
  if (u.regain) [].concat(u.regain).forEach(rg => { const k = fxSource(rg.from); if (k < 0) return; const ff = S.features[k], n = rg.n === 'all' ? N(ff.used) : N(evalMax(String(rg.n || 1))); const was = N(ff.used); ff.used = Math.max(0, was - n); if (was !== ff.used) lines.push(`Regained ${was - ff.used} ${rg.from}`); });
  if (u.removeCond) [].concat(u.removeCond).forEach(c => { if (S.conditions.includes(c)) { S.conditions = S.conditions.filter(x => x !== c); if (S.condTurns) delete S.condTurns[c]; lines.push(`${c} ended`); } });
  if (u.exhaustion) { const b = N(S.exhaustion); S.exhaustion = Math.max(0, Math.min(6, b + N(u.exhaustion))); if (b !== S.exhaustion) lines.push(`Exhaustion ${b} → ${S.exhaustion}`); }
  if (u.companion && typeof addClassCompanion === 'function' && COMP_RULES[u.companion]) { addClassCompanion(u.companion, true); lines.push(`${u.companion} appears (see Creatures)`); }
  if (u.recoverSlots) setTimeout(() => openRecoverSlots(u.recoverSlots), 60);
  if (u.endEffect) { S.effects = (S.effects || []).filter(e => e.name !== u.endEffect); }
  if (u.healHalf) { const b = N(S.hp.cur); S.hp.cur = Math.min(maxHp(), b + Math.floor(maxHp() / 2)); lines.push(`Healed ${S.hp.cur - b} HP`); }
  if (u.dismiss) { const n0 = S.companions.length; S.companions = S.companions.filter(c => c.tmpl !== u.dismiss && c.name !== u.dismiss); S.effects = (S.effects || []).filter(e => !String(e.name).startsWith(u.dismiss)); if (S.companions.length < n0) lines.push(`${u.dismiss} is gone`); }
  // Back above 0 HP: no longer unconscious, death saves reset.
  if (N(S.hp.cur) > 0 && S.conditions.includes('Unconscious') && (u.heal || u.healHalf || u.healFull || u.setHp != null)) { S.conditions = S.conditions.filter(c => c !== 'Unconscious'); S.death = { s: 0, f: 0 }; lines.push('You\u2019re back on your feet (death saves reset)'); }
  if (u.halveDamage) { lines.push('Enter the attack’s damage — you take half'); setTimeout(() => askHalfDamage(name), 80); }
  if (u.speed0) { S.turn.speed0 = typeof u.speed0 === 'string' ? u.speed0 : name; lines.push('Your speed is 0 until the end of this turn'); }
  if (u.resetTurn) { S.turn.used.action = false; S.turn.attacks = 0; }
}
const fxText = t => formulaDC(t).replace(/\{([^}]+)\}/g, (m, x) => { const v = evalMax(x); return v == null ? m : String(v); });
function fxDCLine(fx, f) { const dc = dcVal(fx.dc, f.cls); return dc ? `DC ${dc}${fx.save ? ' ' + fx.save + ' save' : ''}` : ''; }
// Use a sub-option of a feature (e.g. Ki → Flurry of Blows) or a feature that spends another's resource.
function useAct(fi, j, col) {
  const f = S.features[fi]; if (!f) return;
  const fx = fxOf(f), a = j == null ? fx : (fx.acts || [])[N(j)]; if (!a) return;
  if (a.surge) return wildSurgeNow();
  if (a.surgeCheck) return wildCheckNow();
  col = col || a.col;
  if (['action', 'bonus', 'reaction'].includes(col) && incapCond()) { toast(`You're <b>${incapCond().toLowerCase()}</b> — you can't take actions or reactions.`, 'fumble'); return; }
  if (a.onlyRaging && !S.conditions.includes('Raging')) { toast(`${esc(a.name || f.name)} only works while raging.`, 'fumble'); return; }
  if (a.onlyWhen && !fxWhenOK(a.onlyWhen)) { toast(`${esc(a.name || f.name)} only works ${esc(fxWhenText(a.onlyWhen))}.`, 'fumble'); return; }
  const cost = a.cost === true ? { from: f.dname || f.name, n: 1 } : a.cost;
  const ar = atkReplaceOK(a.name || f.name, col); if (ar === false) return;
  if (ar === null && S.inCombat && ['action', 'bonus', 'reaction'].includes(col) && (S.turn.used || {})[col]) { toast(`Your ${col === 'bonus' ? 'bonus action' : col} is already used this turn.`, 'fumble'); return; }
  const err = fxSpend(cost, f.cls); if (err) { toast(esc(err), 'fumble'); return; }
  const atkNote = atkReplaceSpend(a.name || f.name, col);
  if (!atkNote && col && col !== 'free' && col !== 'move') S.turn.used[col] = true;
  const lines = [], nm = a.name || f.name; if (atkNote) lines.push(atkNote);
  if (/disengage/i.test(nm) && S.inCombat) S.turn.disengaged = true;
  if (a.dash) { addDash(); lines.push(`+${turnSpeed()} ft of movement this turn`); }
  fxApplyUse(a.use, nm, lines);
  // Attack-roll options (e.g. the Force Ballista): roll to hit first; a 20 doubles the damage dice.
  let hit = null; if (a.atk) { const bonus = a.atk === 'spell' ? castInfo(f.cls).atk : N(a.atk); const d = d20Expr(bonus, 'attack'); hit = rollExpr(d.expr, { label: (a.name || f.name) + ' attack' }); hit.crit = hit.d20 >= 20; hit.nat1 = hit.d20 === 1; hit.bonus = bonus; }
  const r = a.roll ? rollExpr(hit && hit.crit ? critDice(fxRollExpr(a.roll)) : fxRollExpr(a.roll), { label: (a.name || f.name) + ': ' + (a.rollNote || 'roll').replace(/\s*\(.*$/, '') }) : null;
  const dc = fxDCLine(a.dc ? a : fx, f);
  pendingLabel = 'Use ' + nm; update(); render();
  const heal = r && a.healRoll ? { label: 'Heal me', fn: () => useAmt(r, nm + ': healing', n => healSelf(n, `${nm}: +${n} HP`)) } : null;
  if (hit) { toast(`<b class="total">${hit.total}</b><div class="rc-body"><div class="rc-name">${esc(nm)}</div><div class="rc-lbl">${hit.crit ? 'CRITICAL HIT' : hit.nat1 ? 'Natural 1 — miss' : 'to hit'}</div><div class="det">Hit: ${esc(hit.detail)}${r ? ' · Dmg: ' + esc(r.detail) : ''}</div>${a.rollNote ? `<div class="det">${esc(a.rollNote)}</div>` : ''}${lines.map(l => `<div class="det">${esc(l)}</div>`).join('')}</div>${r ? `<div class="rc-dmg${hit.nat1 ? ' void' : ''}"><b>${r.total}</b><span>${esc((String(a.rollNote || 'damage').split(/[ (]/)[0]) || 'damage')}</span></div>` : ''}`, hit.crit ? 'crit' : hit.nat1 ? 'fumble' : '', 9000, [{ label: 'Undo', fn: () => undo(1) }]); return; }
  toast(`${r ? `<b class="total">${r.total}</b>` : ''}<div><div><b>${esc(nm)}</b>${cost ? ' · ' + esc(fxCostText(cost)) : ''}</div>${r ? `<div class="det">${esc(r.detail)}${a.rollNote ? ' ' + esc(a.rollNote) : ''}</div>` : ''}${dc ? `<div class="det">${esc(dc)}</div>` : ''}${a.text ? `<div class="det">${esc(fxText(a.text))}</div>` : ''}${lines.map(l => `<div class="det">${esc(l)}</div>`).join('')}</div>`, '', 9000, [heal, typeof ptyFeatAct === 'function' ? ptyFeatAct(nm, r, f) : null, { label: 'Undo', fn: () => undo(1) }].filter(Boolean));
}
// Blessing of the Forge: pick the armor or weapon to bless.
function openForge(fi) {
  const items = S.inventory.map((it, i) => [it, i]).filter(([it]) => (it.armor && it.armor.type !== 'shield') || it.weapon);
  openModal(`<h3>Blessing of the Forge</h3><p class="hint">Touch one nonmagical suit of armor or simple or martial weapon. Until the end of your next long rest it's magical: armor +1 AC, or a weapon +1 to attack and damage rolls.</p>
    <div class="crlist">${items.map(([it, i]) => `<button class="crrow sel" data-act="forgego" data-fi="${fi}" data-i="${i}"><div><b>${esc(it.name)}</b> <span class="hint">${it.armor ? 'Armor' : 'Weapon'}${it.forge ? ' · blessed now' : ''}${it.equipped ? ' · equipped' : ''}</span></div></button>`).join('') || '<p class="hint">No armor or weapons in your inventory.</p>'}</div>
    <div class="actions"><button class="btn" data-act="close">Cancel</button></div>`);
}
function forgeGo(fi, i) {
  const f = S.features[fi], it = S.inventory[i]; if (!f || !it) return;
  if (fxLeft(fi) < 1) { toast('Blessing of the Forge is already used — it returns after a long rest.', 'fumble'); return; }
  f.used = N(f.used) + 1; S.inventory.forEach(x => delete x.forge); it.forge = true;
  pendingLabel = 'Blessing of the Forge: ' + it.name; closeModal(true); update(); render();
  toast(`<b>Blessing of the Forge</b> — ${esc(it.name)} is +1 ${it.armor ? 'AC' : 'to attack and damage'} until your next long rest.`, '', 7000, { label: 'Undo', fn: () => undo(1) });
}
const forgeBonus = it => (it && it.forge ? 1 : 0);
// ---------- Spell-Storing Item (artificer 11) ----------
// Store a 1st- or 2nd-level artificer spell with a casting time of 1 action in a simple/martial weapon or an
// item you can use as a spellcasting focus. Anyone holding it can take an action to cast it (your spellcasting
// ability, your DC/attack); uses = twice your INT modifier (minimum 2). It stays until used up or replaced —
// long rests don't refill it; storing again (after a long rest) does.
const STORE_FOCUS = /\b(thieves'? tools|tinker'?s? tools|smith'?s? tools|woodcarver'?s? tools|alchemist'?s? supplies|brewer'?s? supplies|calligrapher'?s? supplies|carpenter'?s? tools|cartographer'?s? tools|cobbler'?s? tools|cook'?s? utensils|glassblower'?s? tools|jeweler'?s? tools|leatherworker'?s? tools|mason'?s? tools|painter'?s? supplies|potter'?s? tools|weaver'?s? tools|focus|wand|rod|staff|orb|crystal|holy symbol|totem|amulet|emblem|reliquary)\b/i;
const storeUses = () => Math.max(2, 2 * mod('int'));
function storeQualifies(it) { return !!(it && (it.weapon || STORE_FOCUS.test(it.name || '') || it.infusion || /infus|arcane firearm|spellcasting focus/i.test(it.notes || '') || S.spells.some(x => x.stored && x.item === it.id))); }
function storeSpellsList() {
  // The artificer list, plus your artificer subclass spells (they count as artificer spells for you).
  const extra = new Set(S.spells.filter(x => x.cls === 'artificer' && !x.stored).map(x => x.name.toLowerCase()));
  const r = (S.classes || []).find(c => c.key === 'artificer'), sub = r && CL.artificer && CL.artificer.subclasses[r.sub];
  if (sub && sub.spells) Object.values(sub.spells).flat().forEach(n => extra.add(String(n).toLowerCase()));
  return DND.spells.filter(s => (/A/.test(s.classes || '') || extra.has(s.name.toLowerCase())) && (s.level === 1 || s.level === 2) && s.time === '1 action');
}
const spellUpcasts = n => /At Higher Levels/.test((DND.full || {})['sp:' + n] || '');
function storedSpellIdx() { return S.spells.findIndex(s => s.stored && s.cls === 'artificer'); }
function openSpellStore(fi) {
  if (clsLv('artificer') < 11) { toast('Spell-Storing Item needs artificer level 11.', 'fumble'); return; }
  const cur = S.spells[storedSpellIdx()], items = S.inventory.filter(storeQualifies), list = items.length ? items : S.inventory;
  const spells = storeSpellsList();
  openModal(`<h3>Spell-Storing Item</h3>
    <p class="hint" style="margin:0 0 10px">After a long rest, touch one simple or martial weapon or an item you can use as a spellcasting focus (thieves' or artisan's tools, or an infused item, work for an artificer) and store a <b>1st- or 2nd-level artificer spell that takes 1 action</b>. You don't need it prepared. Anyone holding the item can take an action to cast it with your spellcasting modifier; if it needs concentration, they concentrate.</p>
    ${cur ? `<p class="hint" style="margin:0 0 10px">Stored now: <b>${esc(cur.name)}</b> in ${esc((spItem(cur) || {}).name || 'an item')} — ${Math.max(0, N(cur.uses && cur.uses.max) - N(cur.uses && cur.uses.used))} of ${N(cur.uses && cur.uses.max)} uses left. Storing again replaces it.</p>` : ''}
    ${fld('Item', `<select class="f" id="ssItem">${list.map(it => `<option value="${esc(it.id)}"${cur && cur.item === it.id ? ' selected' : ''}>${esc(it.name)}${it.equipped ? ' (equipped)' : ''}</option>`).join('')}</select>`)}
    ${items.length ? '' : '<p class="hint">None of your items look like a weapon or focus — pick the one your DM allows.</p>'}
    ${(() => { const curV = cur ? cur.name + '@' + Math.max(N(cur.level), N(cur.uses && cur.uses.level)) : '';
      const opt = (s, L) => { const v = s.name + '@' + L; return `<option value="${esc(v)}"${curV === v ? ' selected' : ''}>${esc(s.name)}${L > s.level ? ' (at 2nd level)' : ''}</option>`; };
      const two = spells.filter(s => s.level === 2).map(s => [s, 2]).concat(spells.filter(s => s.level === 1 && spellUpcasts(s.name)).map(s => [s, 2])).sort((a, b) => a[0].name.localeCompare(b[0].name));
      return fld('Spell', `<select class="f" id="ssSpell"><optgroup label="1st level">${spells.filter(s => s.level === 1).map(s => opt(s, 1)).join('')}</optgroup><optgroup label="2nd level">${two.map(([s, L]) => opt(s, L)).join('')}</optgroup></select>`); })()}
    <p class="hint" style="margin-top:-4px">1st-level spells that get stronger with a higher slot also appear under 2nd level, stored at 2nd.</p>
    <p class="hint">Uses: <b>${storeUses()}</b> (twice your Intelligence modifier, minimum 2). They don't come back on a rest — store it again to refill.</p>
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="spellstorego" data-fi="${fi}">Store it</button></div>`);
}
function spellStoreGo(fi) {
  const itId = ($('#ssItem') || {}).value, [nm, lv] = String(($('#ssSpell') || {}).value || '').split('@'), it = S.inventory.find(x => x.id === itId); if (!it || !nm) return;
  const old = storedSpellIdx(); if (old >= 0) S.spells.splice(old, 1);
  const sp = Object.assign(spellEntry(nm, 'artificer'), { always: true, prepared: true, stored: true, usesOnly: true, ab: 'int', item: it.id, time: '1 action',
    uses: Object.assign({ max: String(storeUses()), used: 0, reset: 'never' }, N(lv) > N((SPI(nm) || {}).level) ? { level: N(lv) } : {}), note: `Stored in ${it.name} (Spell-Storing Item). Anyone holding it can take an action to cast it with your spell DC and attack bonus.` });
  S.spells.push(sp);
  const f = S.features[fi]; if (f) f.desc = `Store a 1st or 2nd level spell in an item; others can cast it 2 × INT mod times.\n\nCurrently stored: ${nm} (in the ${it.name}) — ${storeUses()} uses.`;
  pendingLabel = 'Spell-Storing Item: ' + nm; closeModal(true); update(); render();
  toast(`<b>${esc(nm)}</b>${sp.uses.level ? ' (at 2nd level)' : ''} stored in ${esc(it.name)} — ${storeUses()} uses. It's in your Action column.`, '', 7000, { label: 'Undo', fn: () => undo(1) });
}
// Feature buttons shown on feature cards and in combat columns.
function fxVisActs(f, col) { const fx = fxOf(f), own = f.cls ? clsLv(f.cls) : lvl(); return (fx.acts || []).map((a, j) => [a, j]).filter(([a]) => (!col || a.col === col) && !(a.min && own < a.min) && !(a.onlyRaging && !S.conditions.includes('Raging')) && fxWhenOK(a.onlyWhen)); }
function fxActsHTML(f, i, col) {
  return fxVisActs(f, col).map(([a, j]) => {
    const cost = a.cost === true ? { from: f.dname || f.name, n: 1 } : a.cost;
    return `<button class="btn sm fxact" data-act="useact" data-i="${i}" data-j="${j}" data-col="${a.col || ''}" title="${esc(fxText(a.text || ''))}">${esc(a.name)}${cost ? ` <small>${esc(fxCostText(cost))}</small>` : ''}</button>`;
  }).join('');
}
// The short line under a feature in combat: DC, cost and roll.
function fxInfoLine(f) {
  const fx = fxOf(f), bits = [];
  const dc = fxDCLine(fx, f); if (dc) bits.push(dc);
  if (fx.cost) bits.push('costs ' + fxCostText(fx.cost));
  if (fx.roll) bits.push('roll ' + fxRollExpr(fx.roll));
  if (fx.onlyRaging) bits.push('while raging');
  if (fx.onlyWhen) bits.push(fxWhenText(fx.onlyWhen));
  return bits.join(' · ');
}
// Features whose own "Use" is really a pool for other options (Ki, Channel Divinity, superiority dice).
const fxIsResource = f => !!fxOf(f).resource;
const fxHidden = f => { if (String(f.key || '').startsWith('pick:infusion:') && typeof INF === 'object' && INF[f.name]) return true; // infusions act through their infused item (Infusions tab / combat rows)
  const fx = fxOf(f); return (fx.onlyRaging && !S.conditions.includes('Raging')) || (fx.onlyWhen && !fxWhenOK(fx.onlyWhen)); };

// Elemental Adept: the damage type picked for the feat, if this spell deals it.
function adeptFor(type) { const el = ((S.featChoices || {})['Elemental Adept'] || {}).element || []; const t = String(type || '').toLowerCase(); return [].concat(el).find(e => t.includes(e)) || ''; }

// ---------- When a feature can be used ----------
// onlyWhen: { cond: 'Raging' | effect: 'Bladesong' | companion: 'Wildfire Spirit' | armor: 'none' | 'notHeavy' | shield: false | hpBelowHalf: true | zeroHp: true }
function fxWhenOK(w) {
  if (!w) return true;
  const arm = equippedArmor(), sh = equippedShield();
  if (w.cond && !S.conditions.includes(w.cond)) return false;
  if (w.effect && !fxActive().some(e => e.name === w.effect || e.name.startsWith(w.effect))) return false;
  if (w.companion && !S.companions.some(c => c.tmpl === w.companion || c.name === w.companion)) return false;
  if (w.armor === 'none' && arm) return false;
  if (w.armor === 'notHeavy' && arm && arm.armor.type === 'heavy') return false;
  if (w.shield === false && sh) return false;
  if (w.hpBelowHalf && N(S.hp.cur) > maxHp() / 2) return false;
  if (w.zeroHp && N(S.hp.cur) > 0) return false;
  if (w.notMoved && N(S.turn && S.turn.moved) > 0) return false;
  return true;
}
function fxWhenText(w) { if (!w) return ''; return [w.cond ? 'while ' + w.cond.toLowerCase() : '', w.effect ? 'while ' + w.effect + ' is active' : '', w.companion ? 'while your ' + w.companion + ' is summoned' : '', w.armor === 'none' ? 'without armor' : '', w.armor === 'notHeavy' ? 'not in heavy armor' : '', w.hpBelowHalf ? 'at half HP or less' : '', w.zeroHp ? 'at 0 HP' : '', w.notMoved ? 'if you haven’t moved this turn' : ''].filter(Boolean).join(', '); }
// ---------- Triggers ----------
// trigger: 'zero' (you drop to 0 HP) | 'longRest' | 'shortRest' | 'initiative' — offers the feature with a button.
// onInit: { regain: n, ifEmpty: true } — applied automatically when you roll initiative (Relentless, Perfect Self…).
function fxTrigger(kind) {
  const offers = [];
  S.features.forEach((f, i) => {
    const fx = fxOf(f);
    if (kind === 'initiative' && fx.onInit) { const max = featMax(f); if (max != null && (!fx.onInit.ifEmpty || N(f.used) >= max)) { const was = N(f.used); f.used = Math.max(0, was - N(fx.onInit.regain || 1)); if (was !== f.used) setTimeout(() => toast(`<b>${esc(f.name)}</b>: regained ${was - f.used} use${was - f.used > 1 ? 's' : ''} as you roll initiative.`, '', 6000), 400); } }
    if ([].concat(fx.trigger || []).includes(kind)) { if (fx.onlyWhen && !fxWhenOK(fx.onlyWhen)) return; const max = featMax(f); if (max != null && N(f.used) >= max && !f.pool) return; offers.push([f, i, fx]); }
  });
  if (!offers.length) return;
  setTimeout(() => offers.forEach(([f, i, fx]) => toast(`<div><b>${esc(f.name)}</b><div class="det">${esc(fxText(fx.triggerText || f.desc || ''))}</div></div>`, kind === 'zero' ? 'alert' : '', 15000, [{ label: fx.triggerLabel || 'Use it', fn: () => useFeature(i) }])), kind === 'zero' ? 200 : 500);
}
// Recover spell slots (Natural Recovery, Arcane Recovery): pick slots totaling up to a number, none above maxLevel.
let RECOVER = null;
function openRecoverSlots(o) { RECOVER = { total: N(evalMax(String(o.total))) || 1, max: o.maxLevel || 5, pick: [] }; renderRecover(); }
function renderRecover() {
  const t = RECOVER; if (!t) return; const used = t.pick.reduce((a, l) => a + l, 0);
  const rows = []; for (let L = 1; L <= Math.min(t.max, 9); L++) { const spent = Math.min(N(S.slotsUsed[L - 1]), slotMax(L - 1)) - t.pick.filter(x => x === L).length; if (slotMax(L - 1)) rows.push(`<div class="row"><b style="width:70px">${ORD[L - 1]}</b><span class="hint" style="width:110px">${spent} spent</span><button class="btn sm" data-act="recadd" data-l="${L}" ${spent > 0 && used + L <= t.total ? '' : 'disabled'}>+ Recover one</button></div>`); }
  openModal(`<h3>Recover spell slots</h3><p class="hint">Choose expended slots totaling up to <b>${t.total}</b> levels (none above ${ORD[t.max - 1]}). Picked: ${t.pick.map(l => ORD[l - 1]).join(', ') || 'none'} (${used}/${t.total}).</p>${rows.join('') || '<p class="hint">No expended slots.</p>'}
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="recok">Recover</button></div>`);
}
function recoverOk() { const t = RECOVER; if (!t) return; t.pick.forEach(L => { S.slotsUsed[L - 1] = Math.max(0, N(S.slotsUsed[L - 1]) - 1); }); RECOVER = null; pendingLabel = 'Recover spell slots'; closeModal(true); save(); render(); toast(`Recovered ${t.pick.length} slot${t.pick.length === 1 ? '' : 's'}.`); }
// d20 floors: Reliable Talent (proficient checks), Silver Tongue (Persuasion/Deception), Indomitable Might (STR checks use your score).
function fxD20Floor(kind, ab) {
  if (kind !== 'check') return null; let fl = null;
  const sk = String(ROLL_CTX || '').startsWith('skill:') ? ROLL_CTX.slice(6) : '', skObj = sk && S.skills.find(s => s.name === sk), prof = skObj && N(skObj.prof) >= 1;
  fxPassives().forEach(p => { const m = p.minD20; if (!m) return;
    if ((m.prof && prof) || (m.skills && m.skills.includes(sk)) || (m.ab && m.ab === ab)) fl = Math.max(fl || 0, N(m.value) || 10); });
  return fl;
}

// Magic items that give resistance to one damage type the wearer picks.
const RES_TYPES = ['acid', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'poison', 'psychic', 'radiant', 'thunder'];
const resPickItem = it => !!it && /^(ring|armor) of resistance\b/i.test(String((it.magic && it.magic.name) || it.name || ''));
// ---------- Homebrew automation (custom features, items, spells) ----------
// Players fill a short form (f.hb / it.hb); hbFx turns it into the same fx record the built-in features use.
const hbCSV = v => String(v || '').split(/\s*[,;\n]\s*/).map(x => x.trim()).filter(Boolean);
const hbNum = v => (/^\s*walk\s*$/i.test(String(v)) ? 'walk' : /^-?\d+$/.test(String(v).trim()) ? Number(v) : String(v).trim());
// An item's effects work while it's equipped (or merely carried, if ticked) and attuned when it needs attunement.
const hbItemOn = it => !!it && (it.equipped || !!it.carried) && (!it.attune || !!it.attuned);
// The table's own homebrew items: these get their effect set up as soon as they show up in an inventory
// (only when the item has no homebrew settings of its own, so a player's edits always win).
function hbKnownList() { return [
  [/\bspider legs?\b/i, { hb: { consume: true, effName: 'Spider Legs', effSkillAdv: 'Perception', effNote: 'Advantage on Perception checks until your next long rest', text: 'Advantage on Perception checks until your next long rest.' }, carried: true }]
]; }
function hbKnownItem(it) {
  if (!it || it.hb || it.hbKnown) return; const k = hbKnownList().find(([re]) => re.test(it.name || '')); if (!k) return;
  it.hb = JSON.parse(JSON.stringify(k[1].hb)); if (k[1].carried) it.carried = true; it.hbKnown = 1;
}
function hbFx(hb) {
  if (!hb || typeof hb !== 'object') return null;
  const o = {}, p = {}, has = k => hb[k] != null && String(hb[k]).trim() !== '' && hb[k] !== false;
  if (has('resist')) p.resist = hbCSV(hb.resist);
  if (has('immune')) p.immune = hbCSV(hb.immune);
  if (has('condImmune')) p.condImmune = hbCSV(hb.condImmune).map(c => c[0].toUpperCase() + c.slice(1).toLowerCase());
  if (has('adv')) p.advNote = String(hb.adv).split(/\s*[;\n]\s*/).filter(Boolean);
  if (has('sense')) p.sense = String(hb.sense).trim();
  ['fly', 'swim', 'climb'].forEach(k => { if (has(k)) p[k] = hbNum(hb[k]); });
  if (has('speed')) p.speed = hbNum(hb.speed);
  if (has('ac')) p.ac = hbNum(hb.ac);
  if (has('saveAll')) p.saveAll = hbNum(hb.saveAll);
  if (has('init')) p.init = hbNum(hb.init);
  if (has('maxHp')) p.maxHp = hbNum(hb.maxHp);
  if (hb.initAdv) p.initAdv = true;
  if (has('skillAdv')) p.skillAdv = hbCSV(hb.skillAdv);
  // "Nature +1, Stealth 2": flat bonuses to particular skills
  if (has('skillBonus')) { const sb = {}; String(hb.skillBonus).split(/\s*[,;]\s*/).forEach(x => { const m = /^(.+?)\s*([+-]?\s*\d+)$/.exec(x.trim()); if (!m) return; const k = DND.skills.find(z => z[0].toLowerCase() === m[1].trim().toLowerCase()); if (k) sb[k[0]] = (sb[k[0]] || 0) + N(m[2].replace(/\s/g, '')); }); if (Object.keys(sb).length) p.skillBonus = sb; }
  if (Object.keys(p).length) { if (has('whileEffect')) p.effect = String(hb.whileEffect).trim(); o.passive = p; }
  if (has('roll')) o.roll = String(hb.roll).trim();
  if (has('rollNote')) o.rollNote = String(hb.rollNote);
  if (hb.healRoll) o.healRoll = true;
  if (hb.selfDmg) o.selfDmg = true;
  if (has('saveAb')) { o.save = String(hb.saveAb).toUpperCase(); o.dc = !has('dc') || hb.dc === 'spell' ? 'spell' : /^\d+$/.test(String(hb.dc)) ? Number(hb.dc) : String(hb.dc); }
  if (has('costFrom')) o.cost = { from: String(hb.costFrom), n: Number(hb.costN) || 1 };
  const u = {};
  if (has('temp')) u.temp = String(hb.temp);
  if (has('heal')) u.heal = String(hb.heal);
  if (has('effName')) {
    const b = {};
    if (has('effFly')) b.fly = hbNum(hb.effFly);
    if (has('effSpeed')) b.speed = hbNum(hb.effSpeed);
    if (has('effAc')) b.ac = hbNum(hb.effAc);
    if (has('effNote')) b.note = String(hb.effNote);
    if (has('effSkillAdv')) b.skillAdv = hbCSV(hb.effSkillAdv).map(x => { const k = DND.skills.find(z => z[0].toLowerCase() === x.toLowerCase()); return k ? k[0] : x; });
    u.effect = { name: String(hb.effName).trim(), rounds: has('effRounds') && N(hb.effRounds) ? N(hb.effRounds) : null, conc: !!hb.effConc, buff: b };
  }
  if (has('summon')) u.companion = String(hb.summon);
  if (has('cond')) u.cond = String(hb.cond);
  if (Object.keys(u).length) o.use = u;
  if (hb.dash) o.dash = true;
  if (has('onlyEffect')) o.onlyWhen = { effect: String(hb.onlyEffect).trim() };
  if (has('text')) o.text = String(hb.text);
  if (has('refuel') && N(hb.refuel) > 0) o.refuel = Math.min(9, N(hb.refuel));
  if (has('atkName') && has('atkDice')) o.attacks = [[String(hb.atkName).trim(), String(hb.atkDice).trim(), String(hb.atkType || '').trim(), hb.atkAb || 'spell', { kind: hb.atkKind || 'melee', notes: [hb.atkRange ? hb.atkRange + ' ft' : '', has('atkNote') ? String(hb.atkNote) : '', has('onlyEffect') ? 'while ' + hb.onlyEffect + ' is active' : ''].filter(Boolean).join(' · '), noModDmg: !hb.atkAddMod, hbDice: true }]];
  if (has('triggerOn')) o.trigger = hb.triggerOn;
  return Object.keys(o).length ? o : null;
}
const hbUsable = fx => !!(fx && (fx.roll || fx.use || fx.dash || fx.text || fx.dc || fx.cost || fx.refuel));
const hbItemReady = it => hbItemOn(it) && !(it.charges && N(it.charges.max) > 0 && N(it.charges.used) >= N(it.charges.max)) && !(it.hb && it.hb.consume && N(it.qty) <= 0);
// Use an item: spends a charge if it has them, then applies its homebrew effect.
// ---------- Thrown items ----------
// Flasks and vials you throw as an action (an improvised ranged attack: no proficiency unless you're a Tavern Brawler),
// and magic items you hurl for an area effect with a saving throw.
const THROWN = [
  [/^acid\b/i, { dice: '2d6', type: 'acid', range: '20 ft', note: 'Throw up to 20 ft or splash a creature within 5 ft; the vial shatters.' }],
  [/^alchemist['’]?s fire/i, { dice: '1d4', type: 'fire', range: '20 ft', note: 'On a hit the target keeps burning: 1d4 fire at the start of each of its turns until a creature uses an action to put it out (DC 10 DEX check).' }],
  [/^holy water/i, { dice: '2d6', type: 'radiant', range: '20 ft', note: 'Only hurts fiends and undead.' }],
  [/^oil\b/i, { dice: '', type: '', range: '20 ft', note: 'On a hit the target is doused: if it takes fire damage within 1 minute, +5 fire. Or pour it on the ground (5 ft square) and light it: it burns for 2 rounds, 5 fire to anything that enters or ends its turn there.' }],
  [/^bead of force/i, { save: 'DEX', dc: 15, dice: '5d4', type: 'force', range: '60 ft', note: '10 ft radius. A creature that fails is also trapped in a sphere of force for 1 minute.' }],
  [/^necklace of fireballs/i, { save: 'DEX', dc: 15, dice: '8d6', type: 'fire', range: '60 ft', bead: true, note: 'Detach a bead: 20 ft radius fireball, half damage on a success. Throwing several beads at once adds 1d6 per extra bead.' }]
];
const throwOf = it => { if (!it || it.weapon) return null; const nm = String((it.magic && it.magic.name) || it.name || ''); const t = THROWN.find(([re]) => re.test(nm) || re.test(String(it.name || ''))); return t ? t[1] : null; };
function throwItem(i) {
  const it = S.inventory[i], t = throwOf(it); if (!t) return;
  if (incapCond()) { toast(`You're <b>${incapCond().toLowerCase()}</b> — you can't take actions.`, 'fumble'); return; }
  if (S.inCombat && S.turn.used.action) { toast('Your action is already used this turn.', 'fumble'); return; }
  if (t.bead && it.charges && N(it.charges.used) >= N(it.charges.max)) { toast(`${esc(it.name)} has no beads left.`, 'fumble'); return; }
  pendingLabel = 'Throw ' + it.name;
  if (S.inCombat) S.turn.used.action = true;
  const nm = it.name.replace(/\s*\((flask|vial)\)\s*$/i, '');
  // What it costs: one flask from the stack, or one bead from the necklace.
  let left = '';
  if (t.bead) { if (it.charges) { it.charges.used = N(it.charges.used) + 1; left = `${N(it.charges.max) - it.charges.used} beads left`; } else left = 'Take a bead off the necklace'; }
  else { it.qty = Math.max(0, N(it.qty || 1) - 1); left = it.qty ? `${it.qty} left` : 'That was your last one'; if (!it.qty) S.inventory.splice(i, 1); }
  if (t.save) {
    const r = rollExpr(t.dice, { label: nm + ' damage' });
    update(); render();
    toast(`<b class="total">${r.total}</b><div class="rc-body"><div class="rc-name">${esc(nm)}</div><div class="rc-lbl">${esc(t.type)} damage</div><div class="det"><b>DC ${t.dc} ${t.save} save</b> · ${esc(t.range)}</div><div class="det">${esc(t.note)}</div><div class="det dd">${esc(r.detail)}</div><div class="det">${esc(left)}</div></div>`, '', 9000, { label: 'Undo', fn: () => undo(1) });
    return;
  }
  const brawler = (S.feats || []).some(f => /tavern brawler/i.test(f));
  const a = { name: nm, ab: 'dex', prof: brawler, magic: 0, dice: t.dice || '0', type: t.type, kind: 'ranged', effect: true, noModDmg: true, notes: '' };
  if (!t.dice) { update(); render(); d20(nm + ' (thrown)', atkHit(a), 'attack', 'dex', atkHitRows(a)); toast(`<div><b>${esc(nm)}</b><div class="det">${esc(t.note)}</div><div class="det">${esc(left)}</div></div>`, '', 9000); return; }
  attackRoll(a, true, { label: nm + ' (thrown)', notes: [esc(t.range) + ' · improvised' + (brawler ? ' (Tavern Brawler: proficient)' : ', no proficiency'), esc(t.note), esc(left)] });
  render();
}
function useItem(i, col) {
  const it = S.inventory[i]; if (!it) return;
  const fx = hbFx(it.hb) || {};
  if (it.attune && !it.attuned) { toast(`Attune to <b>${esc(it.name)}</b> first.`, 'fumble'); return; }
  col = col || (it.hb && it.hb.col) || '';
  if (['action', 'bonus', 'reaction'].includes(col) && incapCond()) { toast(`You're <b>${incapCond().toLowerCase()}</b> — you can't take actions or reactions.`, 'fumble'); return; }
  if (fx.onlyWhen && !fxWhenOK(fx.onlyWhen)) { toast(`${esc(it.name)} only works ${esc(fxWhenText(fx.onlyWhen))}.`, 'fumble'); return; }
  const ch = it.charges && N(it.charges.max) > 0 ? it.charges : null;
  if (ch && N(ch.used) >= N(ch.max)) { toast(`<b>${esc(it.name)}</b> has no charges left — it recharges ${ch.reset === 'short' ? 'on a short or long rest' : ch.reset === 'none' ? 'only when you restore it' : 'on a long rest'}.`, 'fumble'); return; }
  if (it.hb && it.hb.consume && N(it.qty) <= 0) { toast(`You're out of <b>${esc(it.name)}</b>.`, 'fumble'); return; }
  if (fx.cost) { const err = fxSpend(fx.cost); if (err) { toast(esc(err), 'fumble'); return; } }
  let refuelK = -1;
  if (fx.refuel) { const lv = Array.from({ length: fx.refuel }, (_, k) => k).filter(k => slotMax(k) > 0 && slotsLeft(k) < slotMax(k)); if (!lv.length) { toast(`You have no spent spell slots of ${ORD[fx.refuel - 1]} level or lower.`, 'fumble'); return; } refuelK = Math.max(...lv); }
  if (ch) ch.used = N(ch.used) + 1;
  if (col) S.turn.used[col] = true;
  const lines = [];
  if (refuelK >= 0) { S.slotsUsed[refuelK] = Math.max(0, N(S.slotsUsed[refuelK]) - 1); lines.push(`Recovered a ${ORD[refuelK]}-level spell slot`); }
  if (it.hb && it.hb.consume) { it.qty = Math.max(0, N(it.qty) - 1); lines.push(`${it.qty} left`); }
  if (fx.cost) lines.push('Spent ' + fxCostText(fx.cost));
  if (fx.dash) { addDash(); lines.push(`+${turnSpeed()} ft of movement this turn (Dash)`); }
  fxApplyUse(fx.use, it.name, lines);
  const dc = dcVal(fx.dc); if (dc) lines.push(`DC ${dc}${fx.save ? ' ' + fx.save + ' save' : ''}`);
  if (fx.text) lines.push(fxText(fx.text));
  const r = fx.roll ? rollExpr(fxRollExpr(fx.roll), { label: it.name + ': ' + (fx.rollNote || 'roll').replace(/\s*\(.*$/, '') }) : null;
  pendingLabel = 'Use ' + it.name; update(); render();
  const heal = r && fx.healRoll ? { label: 'Heal me', fn: () => useAmt(r, it.name + ': healing', n => healSelf(n, `${it.name}: +${n} HP`)) } : r && fx.selfDmg ? { label: r.skipped ? 'Take the damage' : `Take ${r.total} damage`, fn: () => useAmt(r, it.name + ': damage', n => { takeDamage(n); save(); render(); }) } : null;
  const left = ch ? `${Math.max(0, N(ch.max) - N(ch.used))}/${N(ch.max)} charges left` : '';
  toast(`${r ? `<b class="total">${r.total}</b>` : ''}<div><div><b>${esc(it.name)}</b>${left ? ' · ' + left : ''}</div>${r ? `<div class="det">${esc(r.detail)}${fx.rollNote ? ' ' + esc(fx.rollNote) : ''}</div>` : ''}${lines.map(l => `<div class="det">${esc(l)}</div>`).join('')}</div>`, '', 8000, [heal, { label: 'Undo', fn: () => undo(1) }].filter(Boolean));
}
// Items with something to do in a fight show up in the Combat columns.
const hbItemActs = col => S.inventory.map((it, i) => [it, i]).filter(([it]) => it.hb && hbUsable(hbFx(it.hb)) && (it.hb.col || '') === col && hbItemOn(it));
// Custom spells: extra rules a player can give a homebrew spell (crit range, half damage on a miss, upcast dice, backlash).
const spAuto = sp => Object.assign({}, AUTO(sp.name), sp && sp.hb ? Object.fromEntries(Object.entries({ dmg: sp.hb.dmg, type: sp.hb.type, attack: sp.hb.hit === 'attack' || null, heal: sp.hb.heal ? sp.hb.heal + (sp.hb.healMod ? '+M' : '') : null, healUp: sp.hb.healUp, up: sp.hb.up, crit: N(sp.hb.crit) || null, missHalf: !!sp.hb.missHalf, backlash: sp.hb.backlash, backlashType: sp.hb.backlashType }).filter(([, v]) => v != null && v !== '' && v !== false)) : {});
const spItem = sp => sp && sp.item ? S.inventory.find(it => it.id === sp.item) : null;

// Uncanny Dodge and the like: ask how much damage the attack did, then take half.
function askHalfDamage(name) {
  askRoll({ label: name, expr: '' }, 'How much damage did the attack deal? You take half (rounded down).').then(r => {
    if (!r) return;
    const full = Math.max(0, N(r.total)), half = Math.floor(full / 2);
    pendingLabel = `${name}: took ${half} of ${full} damage`; takeDamage(half); save(); render();
    toast(`<b>${esc(name)}</b> — you take <b>${half}</b> instead of ${full} damage.`, '', 7000, { label: 'Undo', fn: () => undo(1) });
  });
}

// ---------- Ring of Spell Storing ----------
// Anyone can cast a spell of 1st–5th level into the ring (up to 5 levels' worth in total). Whoever wears it can then cast
// each stored spell once, at the level it was stored at and with the original caster's save DC and attack bonus; once
// cast, it's gone and its levels are free again.
const ringLvOf = (it, n) => Math.max(N((it.spellLevels || {})[n]), N((SPI(n) || {}).level) || 1);
const ringUsed = it => (it.spells || []).reduce((t, n) => t + ringLvOf(it, n), 0);
const ringCap = it => N(it.storeCap) || 5;
// The window works like Add spells: search, level chips, and a Store button on each spell.
let RS = null;
function openRingStore(ii) {
  RS = { ii, who: RS && RS.ii === ii ? RS.who : (casters().length ? 'me' : 'other'), lvl: RS && RS.ii === ii ? RS.lvl : 'all', dc: RS && RS.ii === ii ? RS.dc : '', atk: RS && RS.ii === ii ? RS.atk : '' };
  if (!$('#modal').classList.contains('open')) openModal('', null, true);
  renderRingStore();
}
function renderRingStore() {
  const it = S.inventory[RS.ii]; if (!it) return closeModal(true);
  if ($('#rsDC')) RS.dc = $('#rsDC').value; if ($('#rsAtk')) RS.atk = $('#rsAtk').value;
  const canMe = casters().length > 0; if (!canMe) RS.who = 'other';
  const used = ringUsed(it), cap = ringCap(it), left = Math.max(0, cap - used), q = $('#rsq') ? $('#rsq').value : '';
  const mineN = new Set(S.spells.filter(sp => !sp.stored && CL[sp.cls] && casterFor(sp.cls)).map(sp => sp.name.toLowerCase()));
  const list = DND.spells.filter(sp => sp.level >= 1 && sp.level <= 5 && (RS.who === 'other' || mineN.has(sp.name.toLowerCase())));
  const lvls = [...new Set(list.map(sp => sp.level))].sort((a, b) => a - b);
  if (RS.lvl !== 'all' && !lvls.includes(N(RS.lvl))) RS.lvl = 'all';
  const held = new Set((it.spells || []).map(n => n.toLowerCase()));
  const slotTxt = L => slotMax(L - 1) ? `${slotsLeft(L - 1)} slot${slotsLeft(L - 1) === 1 ? '' : 's'} left` : pact() && pact().level === L ? 'pact slot' : 'no slots';
  const rowFor = sp => {
    const on = held.has(sp.name.toLowerCase()), fits = sp.level <= left, ups = DND.full ? spellUpcasts(sp.name) : true;
    const Ls = Array.from({ length: Math.max(0, Math.min(5, left) - sp.level + 1) }, (_, k) => sp.level + k).filter(L => L === sp.level || ups);
    const ctl = on ? `<button class="btn sm" data-act="ringdel" data-i="${RS.ii}" data-n="${esc((it.spells || []).find(n => n.toLowerCase() === sp.name.toLowerCase()))}" title="Take it out of the ring (it's lost)">Stored ✓ · take out</button>`
      : !fits ? `<span class="always" title="Not enough room in the ring">Needs ${sp.level} level${sp.level > 1 ? 's' : ''}</span>`
      : `<span class="rs-go">${Ls.length > 1 || RS.who === 'me' ? `<select class="f sm" data-rslv="${esc(sp.name)}" aria-label="Level to store ${esc(sp.name)} at">${Ls.map(L => `<option value="${L}">${ORD[L - 1]}${RS.who === 'me' ? ' · ' + slotTxt(L) : ''}</option>`).join('')}</select>` : ''}<button class="btn sm gold" data-act="ringstorego" data-n="${esc(sp.name)}">Store</button></span>`;
    return `<div class="crrow" data-q="${esc((sp.name + ' ' + sp.school + ' ' + sp.summary).toLowerCase())}"><div><b>${esc(sp.name)}</b> <span class="hint">${ORD[sp.level - 1]} · ${esc(sp.school)} · ${esc(sp.time)} · ${esc(sp.range)}${sp.conc ? ' · conc' : ''}${sp.ritual ? ' · ritual' : ''} · ${esc(sp.src)}</span><div class="hint">${esc(sp.summary)}</div></div>${ctl}</div>`; };
  const stored = (it.spells || []).map(n => `${esc(n)} (${ORD[ringLvOf(it, n) - 1]})`).join(', ');
  $('#modal-body').innerHTML = `<div id="ringstore"><h3>Store spells in ${esc(it.name)}</h3>
    <div class="row">${canMe ? fld('Cast into it by', `<select class="f" id="rsWho"><option value="me"${RS.who === 'me' ? ' selected' : ''}>Me (uses my spell slots)</option><option value="other"${RS.who === 'other' ? ' selected' : ''}>Someone else</option></select>`) : ''}
      ${RS.who === 'other' ? `${fld('Their save DC', `<input class="f" id="rsDC" type="number" inputmode="numeric" placeholder="optional" value="${esc(RS.dc)}">`)}${fld('Their attack bonus', `<input class="f" id="rsAtk" type="number" inputmode="numeric" placeholder="optional" value="${esc(RS.atk)}">`)}` : ''}
      <span class="hint"><span class="rs-meter"><i style="width:${Math.round(100 * Math.min(cap, used) / cap)}%"></i></span> ${used} of ${cap} levels used${stored ? ' · holds ' + stored : ' · empty'}. Whoever wears it casts each stored spell once, at the stored level${RS.who === 'other' ? ', with the caster\'s DC and attack bonus (yours if left blank)' : ', with your DC and attack bonus'}.</span></div>
    <div class="row" style="margin:6px 0"><input class="f" id="rsq" placeholder="Search spells…" value="${esc(q)}" aria-label="Search spells" style="flex:1 1 200px">
      <div class="chips">${lvls.map(l => [String(l), ORD[l - 1] + ' level']).concat([['all', 'All']]).map(([k, t]) => `<button class="chip${RS.lvl === k ? ' on' : ''}" data-act="rsfilt" data-l="${k}">${t}</button>`).join('')}</div></div>
    ${!left ? '<p class="hint"><b>It\'s full.</b> Cast a stored spell, or take one out, to make room.</p>' : ''}
    <div class="crlist">${list.filter(sp => RS.lvl === 'all' || String(sp.level) === RS.lvl).sort((a, b) => (held.has(b.name.toLowerCase()) - held.has(a.name.toLowerCase())) || a.level - b.level || a.name.localeCompare(b.name)).map(rowFor).join('') || `<p class="hint">${RS.who === 'me' ? 'You don\'t have any 1st–5th level spells.' : 'No spells.'}</p>`}</div>
    <div class="actions"><button class="btn" data-act="close">Done</button></div></div>`;
  $('#modal-body').classList.add('wide');
  const qi = $('#rsq'); qi.oninput = () => filterCatalogQ('#rsq'); filterCatalogQ('#rsq');
  const w = $('#rsWho'); if (w) w.onchange = () => { RS.who = w.value; renderRingStore(); };
}
function ringStoreGo(name) {
  const it = S.inventory[RS && RS.ii]; if (!it) return;
  const d = SPI(name); if (!d) return; const sel = document.querySelector(`[data-rslv="${CSS.escape(name)}"]`), L = sel ? N(sel.value) : N(d.level), left = ringCap(it) - ringUsed(it);
  if (L < N(d.level) || L > 5) return; if (L > left) { toast(`Not enough room: ${left} level${left === 1 ? '' : 's'} left.`, 'fumble'); return; }
  if ((it.spells || []).some(n => n.toLowerCase() === d.name.toLowerCase())) return;
  let cast = {};
  if (RS.who === 'me') {
    const own = S.spells.find(s => s.name.toLowerCase() === d.name.toLowerCase() && !s.stored && CL[s.cls]);
    if (slotMax(L - 1) > 0 && slotsLeft(L - 1) > 0) S.slotsUsed[L - 1] = N(S.slotsUsed[L - 1]) + 1;
    else if (pact() && pact().level === L && pactLeft() > 0) S.pactUsed = N(S.pactUsed) + 1;
    else { toast(`No ${ORD[L - 1]}-level spell slots left.`, 'fumble'); return; }
    const ci = spellCI(own || { cls: (casters()[0] || {}).key }); cast = { dc: ci.dc, atk: ci.atk };
  } else {
    const dc = $('#rsDC') ? $('#rsDC').value : RS.dc, atk = $('#rsAtk') ? $('#rsAtk').value : RS.atk;
    if (dc !== '' && dc != null) cast.dc = N(dc); if (atk !== '' && atk != null) cast.atk = N(atk);
  }
  it.spells = (it.spells || []).concat([d.name]); it.spellLevels = Object.assign({}, it.spellLevels, { [d.name]: L });
  it.spellCast = Object.assign({}, it.spellCast, { [d.name]: cast });
  pendingLabel = `${it.name}: store ${d.name}`; rebuildAuto(); save(); render(); renderRingStore();
  toast(`<b>${esc(d.name)}</b> (${ORD[L - 1]} level) stored in ${esc(it.name)}.`, '', 4500, { label: 'Undo', fn: () => undo(1) });
}
function ringRemove(ii, n) {
  const it = S.inventory[ii]; if (!it) return;
  it.spells = (it.spells || []).filter(x => x !== n); if (it.spellLevels) delete it.spellLevels[n]; if (it.spellCast) delete it.spellCast[n];
  pendingLabel = `${it.name}: take out ${n}`; rebuildAuto(); save(); render(); if (RS && $('#ringstore')) renderRingStore(); else openRingStore(ii);
}
// A stored spell has been cast from the ring: it's gone, and its levels are free again.
function ringSpent(sp) {
  const it = spItem(sp); if (!it || !itemStores(it) || sp.cls === 'artificer') return;
  if (N(evalMax(sp.uses && sp.uses.max) || 1) - N(sp.uses && sp.uses.used) > 0) return;
  const n = (it.spells || []).find(x => x.toLowerCase() === String(sp.name).toLowerCase()); if (!n) return;
  it.spells = it.spells.filter(x => x !== n); if (it.spellLevels) delete it.spellLevels[n]; if (it.spellCast) delete it.spellCast[n];
  setTimeout(() => { rebuildAuto(); save(); render(); }, 0);
}
const ringItems = () => S.inventory.map((it, ii) => [it, ii]).filter(([it]) => itemStores(it) && !it.infusion);

// Inventory: set a weapon up to be dual wielded (it shows as an off-hand bonus attack on the Combat tab).
document.addEventListener('change', e => { const t = e.target; if (!t || !t.matches || !t.matches('[data-offhand]')) return; const it = S.inventory[N(t.dataset.offhand)]; if (!it) return;
  it.offhand = t.checked; pendingLabel = `${it.name}: ${t.checked ? 'dual wield (off-hand)' : 'not dual wielded'}`; save(); render(); });

// ---------- Add-ons ("riders"): a homebrew feature or item that adds something to another ability ----------
// f.hb / it.hb: on ('meleehit' | 'hit' | 'cast' | 'spelldmg' | 'name:<ability>'), onDmg + onType (extra dice, doubled on a crit),
// onHeal / onTemp (for you), onSave + onDC + onCond + onCondDur (on the target), onMsg, onCost ('use' | 'charge' | 'none'),
// onAsk (true: you're asked each time; false: it always happens).
const RIDER_GEN = [['meleehit', 'I hit with a melee weapon attack'], ['hit', 'I hit with any attack'], ['cast', 'I cast a spell'], ['spelldmg', 'I deal damage with a spell']];
const riderKeyName = s => String(s || '').toLowerCase().replace(/\s*\(.*\)\s*$/, '').replace(/[^a-z0-9]+/g, ' ').trim();
function riderSources() {
  const out = [];
  (S.features || []).forEach((f, i) => { const h = f && f.hb; if (!h || !h.on) return; const max = featMax(f), cost = h.onCost || (max != null ? 'use' : 'none');
    out.push({ kind: 'feat', i, obj: f, name: f.name || 'Homebrew', hb: h, cost, max: cost === 'use' ? max : null,
      left: () => cost === 'use' && max != null ? Math.max(0, max - N(f.used)) : null, spend: () => { if (cost === 'use' && max != null) f.used = N(f.used) + 1; }, refund: () => { if (cost === 'use' && max != null) f.used = Math.max(0, N(f.used) - 1); } }); });
  (S.inventory || []).forEach((it, i) => { const h = it && it.hb; if (!h || !h.on || !hbItemOn(it)) return; const ch = it.charges && N(it.charges.max) > 0 ? it.charges : null, cost = h.onCost || (ch ? 'charge' : 'none');
    out.push({ kind: 'item', i, obj: it, name: it.name || 'Item', hb: h, cost, max: cost === 'charge' && ch ? N(ch.max) : null,
      left: () => cost === 'charge' && ch ? Math.max(0, N(ch.max) - N(ch.used)) : null, spend: () => { if (cost === 'charge' && ch) ch.used = N(ch.used) + 1; }, refund: () => { if (cost === 'charge' && ch) ch.used = Math.max(0, N(ch.used) - 1); } }); });
  return out;
}
// What sets it off, in words ("adds to Divine Smite", "when you hit with a melee weapon")
function riderTrigText(h) { const t = String((h && h.on) || ''); const g = RIDER_GEN.find(x => x[0] === t); return g ? 'When ' + g[1].replace(/^I /, 'you ') : t.startsWith('name:') ? 'Adds to ' + t.slice(5) : ''; }
function riderWhat(h) {
  const dc = riderDC(h), bits = [];
  if (h.onDmg) bits.push('+' + String(h.onDmg).trim() + (h.onType ? ' ' + String(h.onType).toLowerCase() : '') + ' damage');
  if (h.onHeal) bits.push('heals you ' + h.onHeal); if (h.onTemp) bits.push(h.onTemp + ' temp HP');
  if (h.onSave) bits.push(`${dc ? 'DC ' + dc + ' ' : ''}${String(h.onSave).toUpperCase()} save${h.onCond ? ' or ' + h.onCond : ''}`);
  else if (h.onCond) bits.push(h.onCond);
  if (h.onMsg) bits.push(String(h.onMsg));
  return bits.join(' · ');
}
function riderDC(h) { const d = String((h && h.onDC) || '').trim().toLowerCase(); if (!d) return h && h.onSave ? null : null; if (/^\d+$/.test(d)) return N(d); if (d === 'spell') { const c = (S.spells || []).find(s => s.cls) ; return c ? castInfo(c.cls).dc : null; } if (/^(str|dex|con|int|wis|cha)(\|(str|dex|con|int|wis|cha))*$/.test(d)) return dcVal(d); return evalMax(d); }
// Does this add-on fire for this event? ev: { kind: 'atk'|'spell'|'feat', names: [...], melee, weapon, hit, dmg }
function riderMatches(src, ev) {
  const t = String(src.hb.on || ''); if (!t) return false;
  if (src.kind === 'feat' && ev.self === src.obj) return false;
  if (t === 'meleehit') return ev.kind === 'atk' && !!ev.melee && !!ev.weapon;
  if (t === 'hit') return ev.kind === 'atk' || (ev.kind === 'spell' && !!ev.hit);
  if (t === 'cast') return ev.kind === 'spell';
  if (t === 'spelldmg') return ev.kind === 'spell' && !!ev.dmg;
  if (t.startsWith('name:')) { const k = riderKeyName(t.slice(5)); return (ev.names || []).some(n => riderKeyName(n) === k); }
  return false;
}
const ridersFor = ev => riderSources().filter(s => riderMatches(s, ev));
// Spend it and do it. Returns { total, type, dice, lines } — the caller shows it (or adds it to its own card).
function riderDo(src, ev) {
  const h = src.hb, left = src.left();
  if (left != null && left <= 0) return { none: true };
  src.spend();
  const lines = [], nm = src.name; let r = null, dice = '';
  if (h.onDmg) { dice = fxRollExpr(String(h.onDmg)); if (ev.crit && /\d*d\d+/.test(dice)) dice = critDice(dice); r = rollExpr(dice, { label: nm + (ev.crit ? ' (crit)' : '') }); }
  const u = {}; if (h.onHeal) u.heal = String(h.onHeal); if (h.onTemp) u.temp = String(h.onTemp); fxApplyUse(u, nm, lines);
  if (h.onSave || h.onCond) { const dc = riderDC(h); lines.push(`Target: ${h.onSave ? `${dc ? 'DC ' + dc + ' ' : ''}${String(h.onSave).toUpperCase()} save` : ''}${h.onSave && h.onCond ? ' or ' : ''}${h.onCond ? h.onCond + (h.onCondDur ? ' ' + String(h.onCondDur) : '') : ''}`); }
  if (h.onMsg) lines.push(fxText(String(h.onMsg)));
  const l2 = src.left(); if (l2 != null) lines.push(`${l2} of ${src.max} left`);
  pendingLabel = (src.kind === 'item' ? 'Use ' : 'Use ') + nm;
  return { total: r ? r.total : 0, r, dice, type: String(h.onType || '').toLowerCase(), lines };
}
// Shows what an add-on did on its own card (used by the "+ add-on" buttons and by abilities that roll separately).
function riderCard(src, ev, res, base) {
  const h = src.hb, lbl = [res.dice ? res.dice + (res.type ? ' ' + res.type : '') : '', riderTrigText(h).toLowerCase(), ev.crit && res.dice ? 'crit: dice doubled' : ''].filter(Boolean).join(' · ');
  toast(`${res.r ? `<b class="total">${res.total}</b>` : ''}<div class="rc-body"><div class="rc-name">${esc(src.name)}</div><div class="rc-lbl">${esc(lbl)}</div>${base != null && res.r ? `<div class="det">With the hit: <b>${base + res.total}</b> total damage</div>` : ''}${res.r ? `<div class="det dd">${esc(res.r.detail)}</div>` : ''}${res.lines.map(l => `<div class="det">${esc(l)}</div>`).join('')}</div>`, ev.crit ? 'crit' : '', 9000, [{ label: 'Undo', fn: () => undo(1) }]);
}
function riderUse(src, ev, base) {
  if (typeof base === 'function') base = base();
  const res = riderDo(src, ev); if (res.none) { toast(`No uses of ${esc(src.name)} left.`, 'fumble'); return; }
  update(); save(); render(); riderCard(src, ev, res, base);
}
// For an ability that just happened: "always" add-ons happen now (their results returned for the caller's card),
// "ask me" ones become buttons on that card.
function riderHook(ev, base) {
  const always = [], acts = [];
  ridersFor(ev).forEach(src => { const left = src.left(); if (left != null && left <= 0) return;
    if (src.hb.onAsk === false || src.hb.onAsk === 'false') { const res = riderDo(src, ev); if (!res.none) always.push(Object.assign({ src }, res)); }
    else acts.push({ label: `+ ${src.name}${src.hb.onDmg ? ' ' + String(src.hb.onDmg).trim() + (src.hb.onType ? ' ' + String(src.hb.onType).toLowerCase() : '') : ''}${left != null ? ` (${left} left)` : ''}`, fn: () => riderUse(src, ev, base) }); });
  return { always, acts };
}
// Little chips on the abilities an add-on attaches to ("+ Radiant Wrath 2/2").
function riderChips(ev) {
  const rs = ridersFor(ev); if (!rs.length) return '';
  return `<span class="rider-chips">${rs.map(s => { const l = s.left(); return `<span class="rider-chip${l === 0 ? ' out' : ''}" title="${esc(riderWhat(s.hb))}">+ ${esc(s.name)}${l != null ? ` <b>${l}/${s.max}</b>` : ''}</span>`; }).join('')}</span>`;
}

// Chips only for add-ons attached to these abilities by name (generic ones are listed once, not on every row).
function riderChipsNamed(names) { const ks = [].concat(names).map(riderKeyName); const rs = riderSources().filter(x => String(x.hb.on || '').startsWith('name:') && ks.includes(riderKeyName(String(x.hb.on).slice(5))));
  return rs.length ? `<span class="rider-chips">${rs.map(x => { const l = x.left(); return `<span class="rider-chip${l === 0 ? ' out' : ''}" title="${esc(riderWhat(x.hb))}">+ ${esc(x.name)}${l != null ? ` <b>${l}/${x.max}</b>` : ''}</span>`; }).join('')}</span>` : ''; }
function riderChipsGen(keys, label) { const rs = riderSources().filter(x => keys.includes(String(x.hb.on || ''))); if (!rs.length) return '';
  return `<div class="rider-chips blk"><span class="hint">${esc(label)}</span>${rs.map(x => { const l = x.left(); return `<span class="rider-chip${l === 0 ? ' out' : ''}" title="${esc(riderWhat(x.hb))}">+ ${esc(x.name)}${l != null ? ` <b>${l}/${x.max}</b>` : ''}</span>`; }).join('')}</div>`; }
// The Add-ons list on the Combat tab: every add-on with its uses and a Use button (for when you'd rather spend it by hand),
// plus your own homebrew features with limited uses that don't take an action (so they're never out of sight).
function addonRows(ridersOnly) {
  const rows = riderSources().map(src => { const l = src.left(), tip = src.kind === 'feat' ? `<button class="notetip" data-tip="${src.i}" data-tipkind="feat" aria-label="What ${esc(src.name)} does">ⓘ</button>` : `<button class="notetip" data-tip="${src.i}" aria-label="What ${esc(src.name)} does">ⓘ</button>`;
    return `<div class="opt"><div class="opt-head"><span class="opt-name">${esc(src.name)}</span>${tip}${l != null ? `<span class="tag">${l}/${src.max}</span>` : ''}<button class="btn sm" data-act="useaddon" data-k="${src.kind}" data-i="${src.i}" ${l === 0 ? 'disabled' : ''}>Use</button></div>
      <div class="opt-info rider">${esc(riderTrigText(src.hb))}${riderWhat(src.hb) ? ': ' + esc(riderWhat(src.hb)) : ''}${src.hb.onAsk === false || src.hb.onAsk === 'false' ? ' · happens by itself' : ' · you\u2019re asked each time'}</div></div>`; });
  if (!ridersOnly) (S.features || []).forEach((f, i) => { if (!f || (f.hb && f.hb.on) || f.col || f.source !== 'Custom' || featMax(f) == null || f.pool) return; const max = featMax(f), l = Math.max(0, max - N(f.used));
    rows.push(`<div class="opt"><div class="opt-head"><span class="opt-name">${esc(f.name)}</span><button class="notetip" data-tip="${i}" data-tipkind="feat" aria-label="What ${esc(f.name)} does">ⓘ</button><span class="pips" data-calc-html="featpips:${i}"></span><button class="btn sm" data-act="usefeat" data-i="${i}" data-col="" ${l ? '' : 'disabled'}>Use</button></div>${f.desc ? `<div class="opt-text">${esc(formulaDC(f.desc))}</div>` : ''}</div>`); });
  return rows;
}
