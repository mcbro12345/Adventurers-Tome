// ---------- Homebrew builder ----------
// One friendly window for making (or changing) your own items, features and spells. The basics are a few big choices;
// "Advanced" opens tidy sections for everything else the sheet can automate. Works on a copy: nothing changes until Save.
let HBB = null; // { kind: 'item'|'feat'|'spell', idx, d (the copy), isNew, adv, sec: {open sections} }
const hbbGet = (o, p) => p.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o);
const hbbSet = (o, p, v) => { const ks = p.split('.'); let x = o; ks.slice(0, -1).forEach(k => { if (x[k] == null || typeof x[k] !== 'object') x[k] = {}; x = x[k]; }); x[ks[ks.length - 1]] = v; };
const hbbV = p => hbbGet(HBB.d, p);
const bIn = (p, o = {}) => `<input class="f ${o.cls || ''}" data-hbb="${p}"${o.num ? ' type="number" inputmode="decimal"' : ''} value="${esc(hbbV(p) ?? '')}" placeholder="${esc(o.ph || '')}" aria-label="${esc(o.label || o.ph || p)}"${o.list ? ` list="${o.list}"` : ''}${o.af ? ' autofocus' : ''}>`;
const bTa = (p, o = {}) => `<textarea class="f" data-hbb="${p}" rows="${o.rows || 3}" placeholder="${esc(o.ph || '')}" aria-label="${esc(o.label || o.ph || p)}">${esc(hbbV(p) || '')}</textarea>`;
const bSel = (p, opts, o = {}) => `<select class="f" data-hbb="${p}" aria-label="${esc(o.label || p)}">${opts.map(([v, t]) => `<option value="${esc(v)}"${String(hbbV(p) ?? '') === String(v) ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
const bChk = (p, label, hint) => `<label class="hbb-chk"><input type="checkbox" data-hbb="${p}"${hbbV(p) ? ' checked' : ''}><span><b>${label}</b>${hint ? `<small>${hint}</small>` : ''}</span></label>`;
const bSeg = (p, opts, o = {}) => `<div class="hbb-seg${o.big ? ' big' : ''}${o.wrap ? ' pills' : ''}" role="radiogroup">${opts.map(([v, t, ic, sub]) => `<button type="button" role="radio" aria-checked="${String(hbbV(p) ?? '') === String(v)}" class="${String(hbbV(p) ?? '') === String(v) ? 'on' : ''}" data-hbbseg="${p}" data-v="${esc(v)}">${ic ? `<span class="ic">${ic}</span>` : ''}<span class="t">${t}</span>${sub ? `<small>${sub}</small>` : ''}</button>`).join('')}</div>`;
const bChips = (p, list) => { const have = hbCSV(hbbV(p) || '').map(x => x.toLowerCase()); return `<div class="hbb-chips">${list.map(t => `<button type="button" class="hbb-chip${have.includes(t.toLowerCase()) ? ' on' : ''}" data-hbbchip="${p}" data-v="${esc(t)}">${esc(t)}</button>`).join('')}</div>`; };
const bF = (label, inner, hint, cls = '') => `<div class="hbb-f ${cls}"><span class="lbl">${label}</span>${inner}${hint ? `<small class="hint">${hint}</small>` : ''}</div>`;
const bRow = (...a) => `<div class="hbb-row">${a.join('')}</div>`;
const bSec = (id, icon, title, sum, body) => { const open = !!HBB.sec[id]; return `<section class="hbb-sec${open ? ' open' : ''}"><button type="button" class="hbb-sh" data-hbbsec="${id}" aria-expanded="${open}"><span class="ic" aria-hidden="true">${icon}</span><span class="t"><b>${title}</b><small>${esc(sum || '')}</small></span><span class="caret">${open ? '▴' : '▾'}</span></button>${open ? `<div class="hbb-sb">${body}</div>` : ''}</section>`; };
const HBB_CONDS = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'];
const HBB_DICE = ['4', '6', '8', '10', '12', '20'];
const hbbDice = (np, dp) => `<div class="hbb-dice">${bIn(np, { num: 1, cls: 'hbb-dn', ph: '1', label: 'How many dice' })}${bSeg(dp, HBB_DICE.map(x => [x, 'd' + x]))}</div>`;
const hbbTypes = () => DMGTYPES.map(t => [t, t[0].toUpperCase() + t.slice(1)]);
const hbbUseCols = (none) => [['action', 'Action'], ['bonus', 'Bonus action'], ['reaction', 'Reaction'], ['move', 'Movement'], ['', none || 'Nothing']];
const hbbAbOpts = [['', '—']].concat(AB.map(a => [a, ABN[a]]));
const hbbDurs = [['', 'Until ended'], ['1', '1 round'], ['10', '1 minute'], ['100', '10 minutes'], ['600', '1 hour'], ['4800', '8 hours']];
const hbbCount = (...ps) => ps.filter(p => { const v = hbbV(p); return v != null && v !== '' && v !== false && !(Array.isArray(v) && !v.length); }).length;
const hbbSum = (pairs) => pairs.filter(([p]) => { const v = hbbV(p); return v != null && v !== '' && v !== false; }).map(([p, t]) => t || String(hbbV(p))).join(' · ');

// ----- Opening -----
function openHomebrew(kind, idx) {
  const isNew = !(idx >= 0), list = kind === 'item' ? S.inventory : kind === 'feat' ? S.features : S.spells;
  const src = isNew ? (kind === 'item' ? BLANK.inventory() : kind === 'feat' ? BLANK.features() : BLANK.spells()) : list[idx];
  if (!src) return;
  const d = JSON.parse(JSON.stringify(src)); d.hb = d.hb || {};
  if (isNew) d.name = '';
  if (kind === 'item') {
    const w = d.weapon || {}, a = S.attacks.find(x => x.item === d.id) || {}, m = /(\d+)d(\d+)/.exec(w.dice || '') || [], rg = String(w.range || '').split('/');
    d._type = d.hbType || (d.weapon ? 'weapon' : d.hb.consume ? 'consumable' : 'magic');
    d._kind = w.kind || 'melee'; d._dn = m[1] || (isNew ? '1' : ''); d._dd = m[2] || '6'; d._dt = w.type || ''; d._rn = rg[0] || ''; d._rl = rg[1] || '';
    d._ab = a.ab || ((w.props || []).includes('finesse') ? 'fin' : w.kind === 'ranged' ? 'dex' : 'str'); d._mag = a.magic ? String(a.magic) : ''; d._ammo = a.ammo || '';
    d._eqOnly = !d.noEquip; d._uses = d.charges && N(d.charges.max) ? String(d.charges.max) : ''; d._reset = (d.charges && d.charges.reset) || 'long';
    d._props = (w.props || []).filter(p => !/^ammunition|^loading$/.test(p)).join(', '); d._loading = (w.props || []).includes('loading'); d._cat = w.cat || 'martial';
    d._keep = !isNew && (S.customItems || []).some(x => x.name.toLowerCase() === String(d.name || '').toLowerCase());
  }
  if (kind === 'item' && isNew) d.hb.col = 'action';
  if (kind === 'feat') { d._limited = String(d.max ?? '').trim() !== '' ? '1' : ''; d.col = d.col || ''; }
  if (kind === 'spell') {
    const h = d.hb, m = /(\d+)d(\d+)/.exec(h.dmg || '') || [], u = /(\d+)d(\d+)/.exec(h.up || '') || [];
    d._what = h.what || (h.heal ? 'heal' : h.dmg ? 'dmg' : 'other'); d._dn = m[1] || '1'; d._dd = m[2] || '8'; d._un = u[1] || ''; d._ud = u[2] || d._dd;
    const c = String(d.comps || ''); d._v = /\bV\b/.test(c); d._s = /\bS\b/.test(c); d._m = /\bM\b/.test(c); d._mat = (/\bM\s*\(([^)]*)\)/.exec(c) || [])[1] || '';
    d._time = ['1 action', '1 bonus action', '1 reaction', '1 minute', '10 minutes', '1 hour'].includes(d.time) ? d.time : (d.time ? 'other' : '1 action'); d._timeX = d._time === 'other' ? d.time : '';
    d.level = String(N(d.level));
  }
  HBB = { kind, idx: isNew ? -1 : idx, d, isNew, adv: !!(HBB_ADV_ON(kind, d)), sec: {} };
  spellDatalist();
  openModal('<div id="hbb"></div>', () => { HBB = null; }, true);
  hbbPaint();
}
// Advanced starts open when the thing already uses some of it.
function HBB_ADV_ON(kind, d) {
  const h = d.hb || {}, basic = { item: ['col', 'consume', 'text', 'textAuto'], feat: ['col'], spell: ['what', 'dmg', 'type', 'hit', 'save', 'half', 'up', 'heal', 'healMod', 'healUp'] }[kind];
  return Object.keys(h).some(k => !basic.includes(k) && h[k] !== '' && h[k] != null && h[k] !== false) || (kind === 'item' && (d.spells || []).length) || (kind === 'feat' && ((d.spells || []).length || d.pool || String(d.full || '').trim()));
}
function hbbPaint() {
  const box = $('#hbb'); if (!box || !HBB) return;
  const sc = $('#modal-body').scrollTop;
  const K = HBB.kind, title = { item: 'item', feat: 'feature', spell: 'spell' }[K];
  const basic = K === 'item' ? hbbItemBasic() : K === 'feat' ? hbbFeatBasic() : hbbSpellBasic();
  const adv = HBB.adv ? `<div class="hbb-adv">${K === 'item' ? hbbItemAdv() : K === 'feat' ? hbbFeatAdv() : hbbSpellAdv()}<p class="hint hbb-fhint">Numbers can be formulas: <code>prof</code>, <code>wis</code>, <code>level</code>, <code>1d6+prof</code>. Separate several entries with commas.</p></div>` : '';
  box.innerHTML = `<div class="hbb-head"><h3>${HBB.isNew ? 'New homebrew ' + title : 'Edit ' + esc(HBB.d.name || title)}</h3><label class="hbb-switch" title="Show every option the sheet can automate"><input type="checkbox" data-hbbadv${HBB.adv ? ' checked' : ''}><span class="tr"><i></i></span><span>Advanced</span></label></div>
    <div class="hbb-body">${basic}${adv}</div>
    <div class="actions hbb-acts">${K === 'item' ? `<label class="hbb-chk sm"><input type="checkbox" data-hbb="_keep"${HBB.d._keep ? ' checked' : ''}><span><b>Save to my homebrew items</b><small>So you (and your party) can add it again from Add an item → Homebrew</small></span></label>` : ''}<span class="grow"></span><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-hbbsave>${HBB.isNew ? 'Create ' + title : 'Save'}</button></div>`;
  $('#modal-body').scrollTop = sc;
  const f = HBB.isNew && !HBB.painted && box.querySelector('[data-hbb="name"]'); if (f) setTimeout(() => f.focus(), 30);
  HBB.painted = true;
}

// ----- Items -----
function hbbItemBasic() {
  const d = HBB.d, t = d._type, inv = S.inventory.filter(x => x.id !== d.id && !x.weapon);
  let h = bF('Name', bIn('name', { ph: t === 'weapon' ? 'e.g. Stormcaller Pistol' : t === 'consumable' ? 'e.g. Potion of Frost Breath' : 'e.g. Amulet of the Tides', cls: 'hbb-name', label: 'Item name' }));
  h += bF('What is it?', bSeg('_type', [['weapon', 'Weapon', '⚔', 'You attack with it'], ['magic', 'Magic item', '✦', 'Gear, uses or a power'], ['consumable', 'Consumable', '🧪', 'Using it uses one up']], { big: true }));
  h += bF(t === 'weapon' ? 'Attacking with it takes' : 'Using it takes', bSeg('hb.col', hbbUseCols(t === 'weapon' ? 'Nothing' : 'Nothing (passive)'), { wrap: true }));
  if (t === 'weapon') {
    h += `<div class="hbb-card"><div class="hbb-ct">⚔ Weapon</div>`;
    h += bRow(bF('Kind', bSeg('_kind', [['melee', 'Melee'], ['ranged', 'Ranged']])), d._kind === 'ranged' ? bF('Range (ft)', `<div class="hbb-range">${bIn('_rn', { num: 1, ph: '80', label: 'Normal range' })}<span>/</span>${bIn('_rl', { num: 1, ph: '320', label: 'Long range' })}</div>`, 'Normal / long (long is at disadvantage)') : '');
    h += bF('Roll to hit with', bSeg('_ab', [['str', 'Strength'], ['dex', 'Dexterity'], ['fin', 'Best of the two'], ['spell', 'Spellcasting']], { wrap: true }));
    h += bRow(bF('Damage dice', hbbDice('_dn', '_dd')), bF('Damage type', bSel('_dt', [['', 'Choose…']].concat(hbbTypes()), { label: 'Damage type' })));
    if (d._kind === 'ranged') h += bF('Ammunition', bSel('_ammo', [['', 'None — it doesn’t use ammo']].concat(inv.map(x => [x.id, `${x.name} (${N(x.qty)})`])), { label: 'Ammunition' }), inv.length ? 'One is used up with each attack, and you get half back after a fight.' : 'Add the ammo to your inventory first, then pick it here.');
    h += bChk('_eqOnly', 'Must be equipped to attack with it', 'Its attack shows on the Combat tab only while it’s equipped');
    h += `</div>`;
  }
  if (t !== 'weapon') {
    h += `<div class="hbb-card"><div class="hbb-ct">${t === 'consumable' ? '🧪 Consumable' : '✦ Magic item'}</div>`;
    h += bRow(t === 'consumable' ? bF('How many', bIn('qty', { num: 1, ph: '1', label: 'Quantity' })) : '', bF('Uses', bIn('_uses', { num: 1, ph: t === 'consumable' ? '—' : 'Unlimited', label: 'Uses' }), t === 'consumable' ? 'Optional: charges before one is used up' : 'Leave blank if it has no limit'), N(d._uses) ? bF('Recharges', bSeg('_reset', [['long', 'Long rest'], ['short', 'Short rest'], ['none', 'Never']])) : '');
    h += `</div>`;
  }
  h += bF(t === 'weapon' ? 'Notes' : 'What it does', bTa('notes', { rows: 3, ph: t === 'weapon' ? 'Anything special about it' : 'Describe it — this is shown when you use it' }));
  return h;
}
function hbbItemAdv() {
  const d = HBB.d, t = d._type, P = 'hb.', comps = typeof COMP_RULES === 'object' ? Object.keys(COMP_RULES) : [];
  const res = S.features.filter(f => featMax(f) != null).map(f => [f.dname || f.name, f.dname || f.name]);
  let h = '';
  if (t === 'weapon') h += bSec('wpn', '⚔', 'Weapon details', hbbSum([['_mag', d._mag ? '+' + d._mag + ' magic' : ''], ['_props', d._props], ['_loading', 'loading']]),
    bF('Magic bonus (to hit and damage)', bSeg('_mag', [['', 'None'], ['1', '+1'], ['2', '+2'], ['3', '+3']])) + bF('Properties', bChips('_props', ['Finesse', 'Light', 'Heavy', 'Two-handed', 'Thrown', 'Reach', 'Versatile', 'Special'])) + bRow(bF('Category', bSeg('_cat', [['simple', 'Simple'], ['martial', 'Martial']])), d._kind === 'ranged' ? bChk('_loading', 'Loading', 'Only one shot per action, bonus action or reaction') : ''));
  h += bSec('prot', '🛡', 'Protection', hbbSum([[P + 'resist', 'Resist ' + (hbbV(P + 'resist') || '')], [P + 'immune', 'Immune ' + (hbbV(P + 'immune') || '')], [P + 'condImmune'], [P + 'ac', 'AC +' + hbbV(P + 'ac')], [P + 'saveAll', 'Saves +' + hbbV(P + 'saveAll')]]) || 'Resistances, immunities, AC',
    bF('Resistant to', bChips(P + 'resist', DND.damageTypes)) + bF('Immune to', bChips(P + 'immune', DND.damageTypes)) + bF('Can’t be', bChips(P + 'condImmune', HBB_CONDS)) + bRow(bF('AC bonus', bIn(P + 'ac', { ph: '1' })), bF('Bonus to all saves', bIn(P + 'saveAll', { ph: '1' }))));
  h += bSec('move', '🪽', 'Movement & senses', hbbSum([[P + 'speed', '+' + hbbV(P + 'speed') + ' ft'], [P + 'fly', 'Fly'], [P + 'swim', 'Swim'], [P + 'climb', 'Climb'], [P + 'sense']]) || 'Speed, flying, darkvision',
    bRow(bF('Extra speed (ft)', bIn(P + 'speed', { ph: '10' })), bF('Fly (ft)', bIn(P + 'fly', { ph: '30 or walk' })), bF('Swim (ft)', bIn(P + 'swim', { ph: 'walk' })), bF('Climb (ft)', bIn(P + 'climb', { ph: 'walk' }))) + bF('Senses', bIn(P + 'sense', { ph: 'Darkvision 60 ft' })));
  h += bSec('bon', '✚', 'Bonuses', hbbSum([[P + 'skillBonus'], [P + 'init', 'Initiative +' + hbbV(P + 'init')], [P + 'initAdv', 'Adv. on initiative'], [P + 'maxHp', 'Max HP +' + hbbV(P + 'maxHp')], [P + 'adv', 'Advantage notes']]) || 'Skills, initiative, max HP',
    bF('Skill bonuses', bIn(P + 'skillBonus', { ph: 'Stealth +2, Perception +1' })) + bRow(bF('Initiative bonus', bIn(P + 'init', { ph: '2 or wis' })), bF('Max HP bonus', bIn(P + 'maxHp', { ph: 'level' }))) + bChk(P + 'initAdv', 'Advantage on initiative') + bF('Advantage on (a reminder)', bIn(P + 'adv', { ph: 'Saves against being frightened; …' })));
  h += bSec('use', '⚡', 'When you use it', hbbSum([[P + 'roll', 'Rolls ' + hbbV(P + 'roll')], [P + 'heal', 'Heals ' + hbbV(P + 'heal')], [P + 'temp', 'Temp HP'], [P + 'saveAb', 'Save'], [P + 'dash', 'Dash'], [P + 'refuel', 'Recovers a slot'], [P + 'costFrom', 'Costs']]) || 'Rolls, healing, saves',
    bRow(bF('Roll', bIn(P + 'roll', { ph: '2d6+wis' })), bF('What the roll is', bIn(P + 'rollNote', { ph: 'fire damage' }))) + bRow(bChk(P + 'healRoll', 'The roll heals me'), bChk(P + 'selfDmg', 'The roll hurts me')) +
    bRow(bF('Targets make a save', bSel(P + 'saveAb', hbbAbOpts, { label: 'Save ability' })), bF('Save DC', bIn(P + 'dc', { ph: '15, or spell' }))) +
    bRow(bF('Heal yourself', bIn(P + 'heal', { ph: '2d4+2' })), bF('Temp HP', bIn(P + 'temp', { ph: '1d10' }))) +
    bRow(bF('Spends', bSel(P + 'costFrom', [['', 'Nothing']].concat(res), { label: 'Spends' })), hbbV(P + 'costFrom') ? bF('How many', bIn(P + 'costN', { num: 1, ph: '1' })) : '', bF('Recovers a spell slot up to', bIn(P + 'refuel', { num: 1, ph: 'level' }))) + bChk(P + 'dash', 'Lets you Dash', 'Adds your speed to this turn’s movement'));
  h += bSec('eff', '✨', 'Starts an effect', hbbV(P + 'effName') ? hbbV(P + 'effName') : 'A buff that lasts a while', hbbEffFields(P));
  if (comps.length) h += bSec('sum', '🐾', 'Summons a creature', hbbV(P + 'summon') || 'A companion', bF('Summons', bSel(P + 'summon', [['', '—']].concat(comps.map(c => [c, c])), { label: 'Summons' })));
  h += bSec('sp', '📜', 'Spells it lets you cast', (d.spells || []).join(', ') || 'None', hbbSpellList() + bRow(bChk('spellOnce', 'Leveled spells once per long rest'), bChk('spellAtWill', 'At will (no slot)')) + bF('Cast with', bSel(P + 'spellAb', [['', 'Your spellcasting'], ...AB.map(a => [a, ABN[a]])], { label: 'Cast with' })));
  if (t !== 'weapon') h += bSec('atk', '🗡', 'Gives you an attack', hbbV(P + 'atkName') || 'A special attack', hbbAtkFields(P));
  h += bSec('curse', '☠', 'Drawbacks', hbbSum([[P + 'othersDis', 'Cursed'], [P + 'hurtSave', 'Save when hurt']]) || 'Curses and side effects',
    bChk(P + 'othersDis', 'Cursed: disadvantage on attacks with other weapons') + bRow(bF('When you take damage, make a save', bSel(P + 'hurtSave', hbbAbOpts, { label: 'Save when hurt' })), bF('DC', bIn(P + 'hurtDC', { ph: '15' }))) + bF('If you fail', bIn(P + 'hurtText', { ph: 'What happens' })));
  h += bSec('misc', '⚙', 'Carrying, attunement & reminders', hbbSum([['attune', 'Attunement'], ['carried', 'Works while carried'], [P + 'triggerOn', 'Reminder']]) || 'Weight, cost, attunement',
    bRow(bF('Weight (lb)', bIn('weight', { num: 1 })), bF('Cost', bIn('cost', { ph: '50 gp' }))) + bRow(bChk('attune', 'Requires attunement'), bChk('carried', 'Works while carried', 'No need to equip it')) + bRow(bF('Remind me', bSel(P + 'triggerOn', [['', '—'], ['longRest', 'After a long rest'], ['shortRest', 'After a short rest'], ['initiative', 'When I roll initiative'], ['zero', 'When I drop to 0 HP']], { label: 'Remind me' })), bF('Only works while (effect)', bIn(P + 'onlyEffect', { ph: 'effect name' }))));
  return h;
}
const hbbEffFields = P => bRow(bF('Effect name', bIn(P + 'effName', { ph: 'Frost Aura' })), bF('Lasts', bSel(P + 'effRounds', hbbDurs, { label: 'Lasts' }))) +
  bRow(bF('Fly speed', bIn(P + 'effFly', { ph: '30' })), bF('AC bonus', bIn(P + 'effAc', { ph: '2' })), bF('Extra speed', bIn(P + 'effSpeed', { ph: '10' }))) +
  bF('Advantage on (skills)', bIn(P + 'effSkillAdv', { ph: 'Perception, Stealth' })) + bF('Note shown on the effect', bIn(P + 'effNote', { ph: 'What it does' })) + bChk(P + 'effConc', 'Needs concentration');
const hbbAtkFields = P => bRow(bF('Attack name', bIn(P + 'atkName', { ph: 'Frost Lance' })), bF('Damage', bIn(P + 'atkDice', { ph: '1d8+prof' })), bF('Type', bSel(P + 'atkType', [['', '—']].concat(hbbTypes()), { label: 'Attack damage type' }))) +
  bF('Roll to hit with', bSeg(P + 'atkAb', [['spell', 'Spellcasting'], ['str', 'STR'], ['dex', 'DEX'], ['fin', 'Best of STR/DEX'], ['con', 'CON'], ['int', 'INT'], ['wis', 'WIS'], ['cha', 'CHA']], { wrap: true })) +
  bRow(bF('Kind', bSeg(P + 'atkKind', [['melee', 'Melee'], ['ranged', 'Ranged']])), bF('Range (ft)', bIn(P + 'atkRange', { ph: '60' }))) + bChk(P + 'atkAddMod', 'Add the ability modifier to damage') + bF('Note', bIn(P + 'atkNote', { ph: 'only while…' }));
function hbbSpellList() {
  const sp = HBB.d.spells || [];
  return `<div class="hbb-spl">${sp.map((n, j) => `<span class="pchip">${esc(n)}<button type="button" data-hbbspdel="${j}" aria-label="Remove ${esc(n)}">✕</button></span>`).join('') || '<span class="hint">None yet</span>'}</div><input class="f" list="allspells" data-hbbspadd placeholder="+ Add a spell…" aria-label="Add a spell">`;
}
function hbbSaveItem() {
  const d = HBB.d, t = d._type; d.name = String(d.name || '').trim() || (t === 'weapon' ? 'Homebrew weapon' : 'Homebrew item');
  d.hbType = t; const h = d.hb;
  let ammo = '';
  if (t === 'weapon') {
    const props = hbCSV(d._props).map(x => x.toLowerCase()); if (d._kind === 'ranged' && d._ammo) props.push('ammunition'); if (d._kind === 'ranged' && d._loading) props.push('loading');
    const rng = d._kind === 'ranged' ? [d._rn, d._rl].filter(x => N(x)).join('/') : props.includes('thrown') ? ((d.weapon || {}).range || '20/60') : '';
    d.weapon = Object.assign({}, d.weapon, { cat: d._cat || 'martial', kind: d._kind, dice: Math.max(1, N(d._dn) || 1) + 'd' + (d._dd || '6'), type: d._dt || '', props, range: rng });
    if (!d.weapon.base) d.weapon.base = d.name;
    d.noEquip = !d._eqOnly; h.consume = false; ammo = d._kind === 'ranged' ? d._ammo : '';
  } else { delete d.weapon; delete d.noEquip; h.consume = t === 'consumable'; }
  if (t !== 'weapon' && N(d._uses) > 0) d.charges = { max: N(d._uses), used: Math.min(N((d.charges || {}).used), N(d._uses)), reset: d._reset || 'long' }; else if (t !== 'weapon') delete d.charges;
  if (t === 'consumable') d.qty = Math.max(0, N(d.qty) || (HBB.isNew ? 1 : 0));
  // A usable item needs something to show when used: its description (kept in step with it unless you write your own reminder).
  if (t !== 'weapon' && (h.col || d.charges || h.consume) && (!String(h.text || '').trim() || h.textAuto)) { h.text = String(d.notes || '').trim().slice(0, 400) || 'You use ' + d.name + '.'; h.textAuto = 1; }
  if (t === 'weapon' && h.textAuto) { delete h.text; delete h.textAuto; }
  const keep = d._keep, ab = d._ab, mag = N(d._mag);
  Object.keys(d).filter(k => k[0] === '_').forEach(k => delete d[k]);
  Object.keys(h).forEach(k => { if (h[k] === '' || h[k] == null || h[k] === false) delete h[k]; }); if (!Object.keys(h).length) delete d.hb;
  let i = HBB.idx;
  if (HBB.isNew) { d.id = d.id || uid(); S.inventory.push(d); i = S.inventory.length - 1; } else S.inventory[i] = d;
  // its attack row
  const at = S.attacks.findIndex(a => a.item === d.id);
  if (t === 'weapon') {
    const w = d.weapon, base = attackFromItem(d); Object.assign(base, { ab, magic: mag, prof: true, ammo, notes: [base.notes, d.hb && d.hb.col && d.hb.col !== 'action' ? ({ bonus: 'bonus action', reaction: 'reaction', move: 'uses movement', '': 'no action' })[d.hb.col] : ''].filter(Boolean).join(' · ') });
    if (at >= 0) S.attacks[at] = Object.assign({}, S.attacks[at], base); else S.attacks.push(base);
    void w;
  } else if (at >= 0) S.attacks = S.attacks.filter(a => a.item !== d.id);
  const made = HBB.isNew; pendingLabel = (made ? 'Create homebrew item: ' : 'Edit homebrew item: ') + d.name;
  HBB = null; closeModal(true); rebuildAuto(); save();
  if (keep) saveCustomItem(i); else render();
  if (!keep && made) toast(`<b>${esc(d.name)}</b> added to your inventory${t === 'weapon' && !d.noEquip ? ' — equip it to attack with it' : ''}.`);
}

// ----- Features -----
function hbbFeatBasic() {
  const d = HBB.d;
  let h = bF('Name', bIn('name', { ph: 'e.g. Stormborn Fury', cls: 'hbb-name', label: 'Feature name' }));
  h += bF('Using it takes', bSeg('col', hbbUseCols('Nothing (always on)'), { wrap: true }));
  h += `<div class="hbb-card"><div class="hbb-ct">↻ Uses</div>` + bF('How often can you use it?', bSeg('_limited', [['', 'As often as I like'], ['1', 'A limited number of times']]));
  if (d._limited) h += bRow(bF('Times', bIn('max', { ph: '1, prof, 1+cha…', label: 'How many times' }), 'A number, or a formula like <code>prof</code> or <code>1+wis</code>'), bF('Comes back on', bSeg('reset', [['short', 'Short rest'], ['long', 'Long rest'], ['none', 'Never']])));
  h += `</div>`;
  h += bF('What it does', bTa('desc', { rows: 4, ph: 'Describe it — shown on its card and on the Combat tab' }));
  return h;
}
function hbbFeatAdv() {
  const d = HBB.d, P = 'hb.', comps = typeof COMP_RULES === 'object' ? Object.keys(COMP_RULES) : [];
  const res = S.features.filter(f => f !== S.features[HBB.idx] && featMax(f) != null).map(f => [f.dname || f.name, f.dname || f.name]);
  let h = '';
  h += bSec('use', '⚡', 'When you use it', hbbSum([[P + 'roll', 'Rolls ' + hbbV(P + 'roll')], [P + 'heal', 'Heals'], [P + 'temp', 'Temp HP'], [P + 'saveAb', 'Save'], [P + 'dash', 'Dash'], [P + 'costFrom', 'Costs']]) || 'Rolls, healing, saves, costs',
    bRow(bF('Roll', bIn(P + 'roll', { ph: '2d6+wis' })), bF('What the roll is', bIn(P + 'rollNote', { ph: 'radiant damage' }))) + bRow(bChk(P + 'healRoll', 'The roll heals me'), bChk(P + 'selfDmg', 'The roll hurts me')) +
    bRow(bF('Targets make a save', bSel(P + 'saveAb', hbbAbOpts, { label: 'Save ability' })), bF('Save DC', bIn(P + 'dc', { ph: 'spell, or 8+prof+wis' }))) +
    bRow(bF('Heal yourself', bIn(P + 'heal', { ph: '1d8+level' })), bF('Temp HP', bIn(P + 'temp', { ph: 'cha+level' }))) +
    bRow(bF('Also spends', bSel(P + 'costFrom', [['', 'Nothing']].concat(res), { label: 'Also spends' })), hbbV(P + 'costFrom') ? bF('How many', bIn(P + 'costN', { num: 1, ph: '1' })) : '') + bChk(P + 'dash', 'Lets you Dash') + bF('Message when used', bIn(P + 'text', { ph: 'A reminder of what happens' })));
  h += bSec('eff', '✨', 'Starts an effect', hbbV(P + 'effName') || 'A buff that lasts a while', hbbEffFields(P));
  h += bSec('always', '🛡', 'Always on', hbbSum([[P + 'resist', 'Resist ' + (hbbV(P + 'resist') || '')], [P + 'immune', 'Immune'], [P + 'ac', 'AC'], [P + 'speed', 'Speed'], [P + 'fly', 'Fly'], [P + 'sense'], [P + 'skillBonus'], [P + 'maxHp', 'Max HP']]) || 'Resistances, speeds, bonuses',
    bF('Resistant to', bChips(P + 'resist', DND.damageTypes)) + bF('Immune to', bChips(P + 'immune', DND.damageTypes)) + bF('Can’t be', bChips(P + 'condImmune', HBB_CONDS)) +
    bRow(bF('AC bonus', bIn(P + 'ac', { ph: '1' })), bF('Extra speed', bIn(P + 'speed', { ph: '10' })), bF('Fly', bIn(P + 'fly', { ph: 'walk' })), bF('Swim', bIn(P + 'swim', { ph: 'walk' })), bF('Climb', bIn(P + 'climb', { ph: 'walk' }))) +
    bRow(bF('Senses', bIn(P + 'sense', { ph: 'Darkvision 60 ft' })), bF('Skill bonuses', bIn(P + 'skillBonus', { ph: 'Insight +2' }))) + bRow(bF('Saves bonus', bIn(P + 'saveAll', { ph: '1' })), bF('Initiative bonus', bIn(P + 'init', { ph: 'wis' })), bF('Max HP bonus', bIn(P + 'maxHp', { ph: 'level' }))) +
    bRow(bChk(P + 'initAdv', 'Advantage on initiative'), bF('Only while (effect)', bIn(P + 'whileEffect', { ph: 'Rage' }))) + bF('Advantage on (a reminder)', bIn(P + 'adv', { ph: 'Saves against poison; …' })));
  h += bSec('atk', '🗡', 'Gives you an attack', hbbV(P + 'atkName') || 'A special attack', hbbAtkFields(P));
  if (comps.length) h += bSec('sum', '🐾', 'Summons a creature', hbbV(P + 'summon') || 'A companion', bF('Summons', bSel(P + 'summon', [['', '—']].concat(comps.map(c => [c, c])), { label: 'Summons' })));
  h += bSec('sp', '📜', 'Spells it gives you', (d.spells || []).join(', ') || 'None', hbbSpellList() + bRow(bChk('spellOnce', 'Once per long rest each'), bChk('spellAtWill', 'At will (no slot)')));
  h += bSec('more', '⚙', 'More', hbbSum([['pool', 'Points pool'], [P + 'triggerOn', 'Reminder'], [P + 'onlyEffect', 'Only while ' + hbbV(P + 'onlyEffect')], ['full', 'Own wording']]) || 'Points pool, reminders, full wording',
    bRow(bChk('pool', 'It’s a pool of points', 'Spend any number at a time, like Lay on Hands'), bF('Remind me', bSel(P + 'triggerOn', [['', '—'], ['longRest', 'After a long rest'], ['shortRest', 'After a short rest'], ['initiative', 'When I roll initiative'], ['zero', 'When I drop to 0 HP']], { label: 'Remind me' }))) +
    bF('Only works while (effect)', bIn(P + 'onlyEffect', { ph: 'effect name' })) + bF('Full wording (replaces the description when you read it)', bTa('full', { rows: 4, ph: 'Optional' })));
  return h;
}
function hbbSaveFeat() {
  const d = HBB.d; d.name = String(d.name || '').trim() || 'Homebrew feature';
  if (!d._limited) { d.max = ''; d.pool = false; }
  if (!d.reset) d.reset = 'long';
  const h = d.hb; Object.keys(h).forEach(k => { if (h[k] === '' || h[k] == null || h[k] === false) delete h[k]; }); if (!Object.keys(h).length) delete d.hb;
  Object.keys(d).filter(k => k[0] === '_').forEach(k => delete d[k]);
  if (HBB.isNew) { d.source = d.source || 'Custom'; S.features.push(d); UI.featFilter = 'all'; } else S.features[HBB.idx] = d;
  pendingLabel = (HBB.isNew ? 'Create feature: ' : 'Edit feature: ') + d.name;
  HBB = null; closeModal(true); rebuildAuto(); save(); render();
}

// ----- Spells -----
function hbbSpellBasic() {
  const d = HBB.d, w = d._what, rows = clsRows();
  let h = bF('Name', bIn('name', { ph: 'e.g. Tidal Lash', cls: 'hbb-name', label: 'Spell name' }));
  h += bF('Level', bSeg('level', [['0', 'Cantrip']].concat([1, 2, 3, 4, 5, 6, 7, 8, 9].map(L => [String(L), ORD[L - 1]])), { wrap: true }));
  h += bF('Casting time', bSeg('_time', [['1 action', 'Action'], ['1 bonus action', 'Bonus action'], ['1 reaction', 'Reaction'], ['1 minute', '1 minute'], ['10 minutes', '10 minutes'], ['1 hour', '1 hour'], ['other', 'Other…']], { wrap: true }) + (d._time === 'other' ? bIn('_timeX', { ph: '8 hours', label: 'Casting time' }) : ''));
  h += bRow(bF('Range', bIn('range', { ph: '60 feet, Self, Touch' })), bF('Duration', bIn('duration', { ph: 'Instantaneous, 1 minute…' })));
  h += bRow(bChk('conc', 'Concentration'), bChk('ritual', 'Ritual'));
  h += bF('Components', `<div class="hbb-comps">${bChk('_v', 'V', 'Spoken')}${bChk('_s', 'S', 'Gestures')}${bChk('_m', 'M', 'A material')}</div>` + (d._m ? bIn('_mat', { ph: 'a pinch of sea salt', label: 'Material' }) : ''));
  h += bF('What does it do?', bSeg('_what', [['dmg', 'Damage', '💥'], ['heal', 'Healing', '❤'], ['other', 'Something else', '✦']], { big: true }));
  if (w === 'dmg') {
    h += `<div class="hbb-card"><div class="hbb-ct">💥 Damage</div>` + bRow(bF('Damage dice', hbbDice('_dn', '_dd')), bF('Damage type', bSel('hb.type', [['', 'Choose…']].concat(hbbTypes()), { label: 'Damage type' })));
    h += bF('How it hits', bSeg('hb.hit', [['attack', 'Spell attack roll'], ['save', 'Saving throw'], ['auto', 'It just hits']]));
    if (hbbV('hb.hit') === 'save') h += bRow(bF('Save', bSeg('hb.save', AB.map(a => [a.toUpperCase(), a.toUpperCase()]))), bChk('hb.half', 'Half damage on a success'));
    h += N(d.level) > 0 ? bF('Cast with a higher slot: extra dice per level', hbbDice('_un', '_ud'), 'Leave blank if it doesn’t get stronger') : bChk('hb.scale', 'Gets stronger as you level', 'More dice at levels 5, 11 and 17, like Fire Bolt');
    h += `</div>`;
  }
  if (w === 'heal') {
    h += `<div class="hbb-card"><div class="hbb-ct">❤ Healing</div>` + bRow(bF('Healing dice', hbbDice('_dn', '_dd')), bChk('hb.healMod', 'Add my spellcasting modifier'));
    if (N(d.level) > 0) h += bF('Cast with a higher slot: extra dice per level', hbbDice('_un', '_ud'), 'Leave blank if it doesn’t get stronger');
    h += `</div>`;
  }
  h += bF('Cast as', bSel('cls', rows.map(r => [r.key, clsName(r.key)]).concat([['race', 'Racial'], ['feat', 'Feat'], ['item', 'Item'], ['other', 'Other']]), { label: 'Class' }));
  h += bF('What it does', bTa('summary', { rows: 3, ph: 'Describe the spell — shown on its card and on the Combat tab' }));
  return h;
}
function hbbSpellAdv() {
  const P = 'hb.';
  let h = bSec('roll', '🎲', 'Rolls', hbbSum([[P + 'crit', 'Crits on ' + hbbV(P + 'crit')], [P + 'missHalf', 'Half on a miss'], [P + 'backlash', 'Backlash']]) || 'Crits, misses, backlash',
    bRow(bF('Crits on', bIn(P + 'crit', { num: 1, ph: '20' })), bChk(P + 'missHalf', 'Half damage on a miss'))
    + bRow(bF('Backlash after the first cast', bIn(P + 'backlash', { ph: '1d10+slot' })), bF('Backlash type', bSel(P + 'backlashType', [['', '—']].concat(hbbTypes()), { label: 'Backlash type' }))));
  h += bSec('more', '⚙', 'More', hbbSum([['school'], ['always', 'Always prepared'], ['item', 'Needs an item'], ['full', 'Own wording']]) || 'School, item, full wording',
    bRow(bF('School', bSel('school', [['', '—'], ...['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'].map(x => [x, x])], { label: 'School' })), bChk('always', 'Always prepared')) +
    bF('Needs an item to cast', bSel('item', [['', '— none —']].concat(S.inventory.map(it => [it.id, it.name])), { label: 'Needs item' })) + bF('Full wording', bTa('full', { rows: 4, ph: 'Optional — the complete description' })));
  return h;
}
function hbbSaveSpell() {
  const d = HBB.d, h = d.hb; d.name = String(d.name || '').trim() || 'Homebrew spell';
  d.level = Math.max(0, Math.min(9, N(d.level)));
  d.time = d._time === 'other' ? (String(d._timeX || '').trim() || '1 action') : d._time;
  d.comps = [d._v ? 'V' : '', d._s ? 'S' : '', d._m ? 'M' + (String(d._mat || '').trim() ? ' (' + String(d._mat).trim() + ')' : '') : ''].filter(Boolean).join(', ');
  h.what = d._what;
  const dice = Math.max(1, N(d._dn) || 1) + 'd' + (d._dd || '8'), up = N(d._un) > 0 ? N(d._un) + 'd' + (d._ud || d._dd) : '';
  if (d._what === 'dmg') { h.dmg = dice; h.hit = h.hit || 'attack'; delete h.heal; delete h.healMod; delete h.healUp; if (d.level > 0) h.up = up; else delete h.up; if (h.hit !== 'save') { delete h.save; delete h.half; } else h.save = h.save || 'DEX'; }
  else if (d._what === 'heal') { h.heal = dice; h.healUp = d.level > 0 ? up : ''; ['dmg', 'type', 'hit', 'save', 'half', 'up', 'scale'].forEach(k => delete h[k]); }
  else ['dmg', 'type', 'hit', 'save', 'half', 'up', 'scale', 'heal', 'healMod', 'healUp'].forEach(k => delete h[k]);
  // No description written: a short one from what it does (also what the spell list shows as its effect).
  if (!String(d.summary || '').trim() || d.sumAuto) { d.summary = h.dmg ? `${h.hit === 'attack' ? 'Spell attack' : h.hit === 'save' ? h.save + ' save' + (h.half ? ' (half on a success)' : '') : 'Hits automatically'}, ${h.dmg}${h.type ? ' ' + h.type : ''}${h.up ? '; +' + h.up + ' per slot level above ' + ORD[d.level - 1] : ''}` : h.heal ? `Heals ${h.heal}${h.healMod ? ' + your spellcasting modifier' : ''}${h.healUp ? '; +' + h.healUp + ' per slot level above ' + ORD[d.level - 1] : ''}` : ''; d.sumAuto = !!d.summary; }
  Object.keys(h).forEach(k => { if (h[k] === '' || h[k] == null || h[k] === false) delete h[k]; });
  Object.keys(d).filter(k => k[0] === '_').forEach(k => delete d[k]);
  if (HBB.isNew) { S.spells.push(d); S.spellFilter = 'all'; } else S.spells[HBB.idx] = d;
  pendingLabel = (HBB.isNew ? 'Create spell: ' : 'Edit spell: ') + d.name;
  HBB = null; closeModal(true); rebuildAuto(); save(); render();
}

// ----- Wiring -----
document.addEventListener('input', e => { const t = e.target; if (!HBB || !t.closest || !t.closest('#hbb')) return;
  if (t.dataset.hbb != null && t.type !== 'checkbox' && t.tagName !== 'SELECT') hbbSet(HBB.d, t.dataset.hbb, t.value); });
document.addEventListener('change', e => { const t = e.target; if (!HBB || !t.closest || !t.closest('#hbb')) return;
  if (t.matches('[data-hbbadv]')) { HBB.adv = t.checked; return hbbPaint(); }
  if (t.matches('[data-hbbspadd]')) { const v = t.value.trim(), sp = v && DND.spells.find(x => x.name.toLowerCase() === v.toLowerCase()); if (!sp) { if (v) toast('Pick a spell from the list.'); return; } HBB.d.spells = (HBB.d.spells || []).filter(n => n !== sp.name).concat([sp.name]); return hbbPaint(); }
  if (t.dataset.hbb == null) return;
  hbbSet(HBB.d, t.dataset.hbb, t.type === 'checkbox' ? t.checked : t.value);
  if (t.tagName === 'SELECT' || t.type === 'checkbox' || /^_uses$|^hb\.costFrom$/.test(t.dataset.hbb)) hbbPaint(); });
document.addEventListener('click', e => { if (!HBB) return; const b = e.target.closest && e.target.closest('#hbb [data-hbbseg], #hbb [data-hbbchip], #hbb [data-hbbsec], #hbb [data-hbbspdel], #hbb [data-hbbsave]'); if (!b) return;
  e.preventDefault();
  if (b.dataset.hbbseg) { hbbSet(HBB.d, b.dataset.hbbseg, b.dataset.v); if (b.dataset.hbbseg === '_dd' && !HBB.d._un) HBB.d._ud = b.dataset.v; return hbbPaint(); }
  if (b.dataset.hbbchip) { const p = b.dataset.hbbchip, v = b.dataset.v, have = hbCSV(hbbV(p) || ''), on = have.some(x => x.toLowerCase() === v.toLowerCase()); hbbSet(HBB.d, p, (on ? have.filter(x => x.toLowerCase() !== v.toLowerCase()) : have.concat([v.toLowerCase()])).join(', ')); return hbbPaint(); }
  if (b.dataset.hbbsec) { HBB.sec[b.dataset.hbbsec] = !HBB.sec[b.dataset.hbbsec]; return hbbPaint(); }
  if (b.dataset.hbbspdel != null) { (HBB.d.spells || []).splice(N(b.dataset.hbbspdel), 1); return hbbPaint(); }
  if (b.hasAttribute('data-hbbsave')) { const k = HBB.kind; if (k === 'item') hbbSaveItem(); else if (k === 'feat') hbbSaveFeat(); else hbbSaveSpell(); }
});
// The homebrew line on an item / feature / spell's edit area: what it does, and the button that opens the builder.
function hbbOpenRow(kind, idx, hb, it) {
  const sum = kind === 'spell' ? hbbSpellSum(it) : hbSummary(hb, it);
  return `<div class="hbbrow"><span class="hbbrow-t"><b>✦ Homebrew</b><small>${sum.length ? esc(sum.join(' · ')) : kind === 'item' ? 'Make it a weapon, give it uses, resistances, spells…' : kind === 'feat' ? 'Give it uses, rolls, effects, resistances…' : 'Set its damage or healing, saves, upcasting…'}</small></span><button class="btn sm gold" data-act="hbbopen" data-k="${kind}" data-i="${idx}">Open builder</button></div>`;
}
function hbbSpellSum(sp) { const h = (sp && sp.hb) || {}, o = []; if (h.dmg) o.push(h.dmg + (h.type ? ' ' + h.type : '') + (h.hit === 'save' ? ' · ' + (h.save || 'DEX') + ' save' : h.hit === 'attack' ? ' · spell attack' : '')); if (h.heal) o.push('Heals ' + h.heal + (h.healMod ? ' + mod' : '')); if (h.up || h.healUp) o.push('+' + (h.up || h.healUp) + ' per level'); if (h.crit) o.push('Crits on ' + h.crit); if (h.backlash) o.push('Backlash'); return o; }
