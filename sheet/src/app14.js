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
const bChk = (p, label, hint) => `<label class="hbb-chk"${hint ? ` title="${esc(hint)}"` : ''}><input type="checkbox" data-hbb="${p}"${hbbV(p) ? ' checked' : ''}><span><b>${label}</b></span></label>`;
const bSeg = (p, opts, o = {}) => `<div class="hbb-seg${o.big ? ' big' : ''}${o.wrap ? ' pills' : ''}" role="radiogroup">${opts.map(([v, t, ic, sub]) => `<button type="button" role="radio" aria-checked="${String(hbbV(p) ?? '') === String(v)}" class="${String(hbbV(p) ?? '') === String(v) ? 'on' : ''}" data-hbbseg="${p}" data-v="${esc(v)}"${sub ? ` title="${esc(sub)}"` : ''}>${ic ? `<span class="ic">${ic}</span>` : ''}<span class="t">${t}</span></button>`).join('')}</div>`;
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
function openHomebrew(kind, idx, preset, read) {
  const isNew = !(idx >= 0), list = kind === 'item' ? S.inventory : kind === 'feat' ? S.features : S.spells;
  const src = preset || (isNew ? (kind === 'item' ? BLANK.inventory() : kind === 'feat' ? BLANK.features() : BLANK.spells()) : list[idx]);
  if (!src) return;
  const d = JSON.parse(JSON.stringify(src)); d.hb = d.hb || {};
  if (isNew && !preset) d.name = '';
  if (kind === 'item') {
    const w = d.weapon || {}, a = S.attacks.find(x => x.item === d.id) || {}, m = /(\d+)d(\d+)/.exec(w.dice || '') || [], rg = String(w.range || '').split('/');
    d._type = d.hbType || (d.weapon ? 'weapon' : d.hb.consume ? 'consumable' : 'magic');
    d._kind = w.kind || 'melee'; d._dn = m[1] || (isNew ? '1' : ''); d._dd = m[2] || '6'; d._dt = w.type || ''; d._rn = rg[0] || ''; d._rl = rg[1] || '';
    d._ab = a.ab || ((w.props || []).includes('finesse') ? 'fin' : w.kind === 'ranged' ? 'dex' : 'str'); d._mag = a.magic ? String(a.magic) : ''; d._ammo = a.ammo || '';
    d._eqOnly = !d.noEquip; d._uses = d.charges && N(d.charges.max) ? String(d.charges.max) : ''; d._reset = (d.charges && d.charges.reset) || 'long';
    d._props = (w.props || []).filter(p => !/^ammunition|^loading$/.test(p)).join(', '); d._loading = (w.props || []).includes('loading'); d._cat = w.cat || 'martial';
    d._keep = !isNew && (S.customItems || []).some(x => x.name.toLowerCase() === String(d.name || '').toLowerCase());
  }
  if (kind === 'item' && isNew && !preset) d.hb.col = 'action';
  if (kind === 'item' && preset && d.mods && N(d.mods.atk)) d._mag = String(N(d.mods.atk));
  if (kind === 'item' && preset && d.weapon && !d.hb.col) d.hb.col = 'action';
  if (kind === 'feat') { d._limited = String(d.max ?? '').trim() !== '' ? '1' : ''; d.col = d.col || ''; }
  if (kind === 'spell') {
    const h = d.hb, m = /(\d+)d(\d+)/.exec(h.dmg || '') || [], u = /(\d+)d(\d+)/.exec(h.up || '') || [];
    d._what = h.what || (h.heal ? 'heal' : h.dmg ? 'dmg' : 'other'); d._dn = m[1] || '1'; d._dd = m[2] || '8'; d._un = u[1] || ''; d._ud = u[2] || d._dd;
    const c = String(d.comps || ''); d._v = /\bV\b/.test(c); d._s = /\bS\b/.test(c); d._m = /\bM\b/.test(c); d._mat = (/\bM\s*\(([^)]*)\)/.exec(c) || [])[1] || '';
    d._time = ['1 action', '1 bonus action', '1 reaction', '1 minute', '10 minutes', '1 hour', '8 hours'].includes(d.time) ? d.time : (d.time ? 'other' : '1 action'); d._timeX = d._time === 'other' ? d.time : '';
    d.level = String(N(d.level)); d._sum0 = d.summary || '';
  }
  HBB = { kind, idx: isNew ? -1 : idx, d, isNew, adv: !!(HBB_ADV_ON(kind, d)), sec: {}, read: read || null };
  spellDatalist();
  openModal('<div id="hbb"></div>', () => { HBB = null; }, true);
  hbbPaint();
}
// Advanced starts open when the thing already uses some of it.
function HBB_ADV_ON(kind, d) {
  const h = d.hb || {}, basic = { item: ['col', 'consume', 'text', 'textAuto'], feat: ['col', 'on', 'onDmg', 'onType', 'onSave', 'onDC', 'onCond', 'onCondDur', 'onHeal', 'onTemp', 'onMsg', 'onCost', 'onAsk'], spell: ['what', 'dmg', 'type', 'hit', 'save', 'half', 'up', 'heal', 'healMod', 'healUp'] }[kind];
  return Object.keys(h).some(k => !basic.includes(k) && h[k] !== '' && h[k] != null && h[k] !== false) || (kind === 'item' && (d.spells || []).length) || (kind === 'feat' && ((d.spells || []).length || d.pool || String(d.full || '').trim()));
}
function hbbPaint() {
  const box = $('#hbb'); if (!box || !HBB) return;
  const sc = $('#modal-body').scrollTop;
  const K = HBB.kind, title = { item: 'item', feat: 'feature', spell: 'spell' }[K];
  const basic = K === 'item' ? hbbItemBasic() : K === 'feat' ? hbbFeatBasic() : hbbSpellBasic();
  const adv = HBB.adv ? `<div class="hbb-adv">${K === 'item' ? hbbItemAdv() : K === 'feat' ? hbbFeatAdv() : hbbSpellAdv()}<p class="hint hbb-fhint">Numbers can be formulas: <code>prof</code>, <code>wis</code>, <code>level</code>, <code>1d6+prof</code>. Separate several entries with commas.</p></div>` : '';
  box.innerHTML = `<div class="hbb-head"><h3>${HBB.isNew ? 'New homebrew ' + title : 'Edit ' + esc(HBB.d.name || title)}</h3><label class="hbb-switch" title="Show every option the sheet can automate"><input type="checkbox" data-hbbadv${HBB.adv ? ' checked' : ''}><span class="tr"><i></i></span><span>Advanced</span></label></div>
    ${HBB.read ? `<div class="hbb-read"><b>Read from the pasted text</b><ul>${HBB.read.done.map(l => `<li>✓ ${esc(l)}</li>`).join('')}${HBB.read.left.map(l => `<li class="warn">! ${esc(l)}</li>`).join('')}</ul><small class="hint">Check it below, then add it. Anything else it does stays in “What it does”.</small></div>` : ''}
    <div class="hbb-body">${basic}${adv}</div>
    <div class="actions hbb-acts">${K === 'item' ? `<label class="hbb-chk sm" title="So you (and your party) can add it again from Add an item → Homebrew"><input type="checkbox" data-hbb="_keep"${HBB.d._keep ? ' checked' : ''}><span><b>Also save to my homebrew items</b></span></label>` : ''}<span class="grow"></span><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-hbbsave>${HBB.isNew ? 'Create ' + title : 'Save'}</button></div>`;
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
    h += bRow(bF('Kind', bSeg('_kind', [['melee', 'Melee'], ['ranged', 'Ranged']])), d._kind === 'ranged' ? bF('Range (ft)', `<div class="hbb-range">${bIn('_rn', { num: 1, ph: '80', label: 'Normal range' })}<span>/</span>${bIn('_rl', { num: 1, ph: '320', label: 'Long range' })}</div>`) : '');
    h += bF('Roll to hit with', bSeg('_ab', [['str', 'Strength'], ['dex', 'Dexterity'], ['fin', 'Best of the two'], ['spell', 'Spellcasting']], { wrap: true }));
    h += bRow(bF('Damage dice', hbbDice('_dn', '_dd')), bF('Damage type', bSel('_dt', [['', 'Choose…']].concat(hbbTypes()), { label: 'Damage type' })));
    if (d._kind === 'ranged') h += bF('Ammunition', bSel('_ammo', [['', 'None — it doesn’t use ammo']].concat(inv.map(x => [x.id, `${x.name} (${N(x.qty)})`])), { label: 'Ammunition' }), inv.length ? '' : 'Add the ammo to your inventory first, then pick it here.');
    h += bChk('_eqOnly', 'Must be equipped to attack with it', 'Its attack shows on the Combat tab only while it’s equipped');
    h += `</div>`;
  }
  if (t !== 'weapon') {
    h += `<div class="hbb-card"><div class="hbb-ct">${t === 'consumable' ? '🧪 Consumable' : '✦ Magic item'}</div>`;
    h += bRow(t === 'consumable' ? bF('How many', bIn('qty', { num: 1, ph: '1', label: 'Quantity' })) : '', bF('Uses', bIn('_uses', { num: 1, ph: t === 'consumable' ? '—' : 'Unlimited', label: 'Uses' }), ), N(d._uses) ? bF('Recharges', bSeg('_reset', [['long', 'Long rest'], ['short', 'Short rest'], ['none', 'Never']])) : '');
    h += `</div>`;
  }
  h += bF(t === 'weapon' ? 'Notes' : 'What it does', bTa('notes', { rows: 2, ph: t === 'weapon' ? 'Anything special about it' : 'Describe it — this is shown when you use it' }));
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
  h += bSec('rider', '✚', 'Adds to another ability', hbbV('hb.on') ? riderTrigText(HBB.d.hb) : 'Like “my melee hits also deal 1d6 fire”', hbbRiderFields('item').replace(/^<div class="hbb-card hbb-rider"><div class="hbb-ct">[^<]*<\/div>/, '<div>'));
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
  h += bF('Using it takes', bSeg('col', hbbUseCols('Nothing — it’s passive, or adds to something else'), { wrap: true }), !d.col && !hbbV('hb.on') ? 'It won’t get its own button in Combat. Pick an action type to use it from Combat, or make it add to another ability below (like Divine Smite).' : '');
  if (d.col && !HBB.adv) h += `<div class="hbb-card"><div class="hbb-ct">⚡ When you use it</div>` + bRow(bF('Roll', bIn('hb.roll', { ph: '2d6+wis' }), 'Dice or a formula'), bF('What the roll is', bIn('hb.rollNote', { ph: 'radiant damage' }))) + bRow(bF('Targets make a save', bSel('hb.saveAb', hbbAbOpts, { label: 'Save ability' })), hbbV('hb.saveAb') ? bF('Save DC', bIn('hb.dc', { ph: 'spell, or 8+prof+wis' })) : '') + `<p class="hint">More (healing, temp HP, effects, costs) under <b>Advanced</b>.</p></div>`;
  h += `<div class="hbb-card"><div class="hbb-ct">↻ Uses</div>` + bF('How often can you use it?', bSeg('_limited', [['', 'As often as I like'], ['1', 'A limited number of times']]));
  if (d._limited) h += bRow(bF('Times', bIn('max', { ph: '1, prof, 1+cha…', label: 'How many times' }), 'A number, or a formula like <code>prof</code> or <code>1+wis</code>'), bF('Comes back on', bSeg('reset', [['short', 'Short rest'], ['long', 'Long rest'], ['none', 'Never']], { wrap: true })));
  h += `</div>`;
  h += hbbRiderFields('feat');
  h += bF('What it does', bTa('desc', { rows: 2, ph: 'Describe it — shown on its card and on the Combat tab' }));
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
  // A spell's casting time is one thing: it takes a turn's action, bonus action or reaction, or it takes longer
  // (casting a 1-minute spell uses your action every turn until it's done). How long it lasts is Duration.
  h += bF('Casting time', `<div class="hbb-ct2"><span class="hint">In one turn</span>${bSeg('_time', [['1 action', 'Action'], ['1 bonus action', 'Bonus action'], ['1 reaction', 'Reaction']], { wrap: true })}</div><div class="hbb-ct2"><span class="hint">Takes longer</span>${bSeg('_time', [['1 minute', '1 minute'], ['10 minutes', '10 minutes'], ['1 hour', '1 hour'], ['8 hours', '8 hours'], ['other', 'Other…']], { wrap: true })}</div>` + (d._time === 'other' ? bIn('_timeX', { ph: '12 hours', label: 'Casting time' }) : ''));
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
  h += bF('What it does', bTa('summary', { rows: 2, ph: 'Describe the spell — shown on its card and on the Combat tab' }));
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
  if (!String(d.summary || '').trim() || (d.sumAuto && d.summary === d._sum0)) { d.summary = h.dmg ? `${h.hit === 'attack' ? 'Spell attack' : h.hit === 'save' ? h.save + ' save' + (h.half ? ' (half on a success)' : '') : 'Hits automatically'}, ${h.dmg}${h.type ? ' ' + h.type : ''}${h.up ? '; +' + h.up + ' per slot level above ' + ORD[d.level - 1] : ''}` : h.heal ? `Heals ${h.heal}${h.healMod ? ' + your spellcasting modifier' : ''}${h.healUp ? '; +' + h.healUp + ' per slot level above ' + ORD[d.level - 1] : ''}` : ''; d.sumAuto = !!d.summary; } else d.sumAuto = false;
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

// "Adds to another ability": what sets it off, then what it adds. Shared by features and items.
function hbbRiderTrigs() {
  const seen = new Set(), out = [['', 'Nothing — it doesn’t add to anything']].concat(RIDER_GEN.map(([k, t]) => [k, 'Whenever ' + t]));
  const add = (n, kind) => { n = String(n || '').trim(); const k = riderKeyName(n); if (!n || seen.has(k)) return; seen.add(k); out.push(['name:' + n, n + ' (' + kind + ')']); };
  if (hasFeature('Divine Smite') || S.spells.some(sp => /^divine smite$/i.test(sp.name))) add('Divine Smite', 'when you smite');
  S.features.forEach((f, i) => { if (i !== HBB.idx && !(f.hb && f.hb.on)) add(f.dname || f.name, 'feature'); });
  S.spells.forEach(sp => add(sp.name, 'spell'));
  S.attacks.forEach(a => add(a.name, 'attack'));
  const cur = hbbV('hb.on'); if (cur && !out.some(o => o[0] === cur)) out.push([cur, String(cur).replace(/^name:/, '')]);
  return out;
}
function hbbRiderFields(kind) {
  const on = hbbV('hb.on'), P = 'hb.';
  let h = `<div class="hbb-card hbb-rider"><div class="hbb-ct">✚ Adds to another ability</div>` + bF('When', bSel(P + 'on', hbbRiderTrigs(), { label: 'What it adds to' }), on ? '' : 'For things like “when I smite, also…” or “my melee hits also…”');
  if (on) {
    h += bRow(bF('Extra damage', bIn(P + 'onDmg', { ph: '1d8' }), 'Doubled on a critical hit'), bF('Damage type', bSel(P + 'onType', [['', '—']].concat(hbbTypes()), { label: 'Damage type' })));
    h += bRow(bF('Target makes a save', bSel(P + 'onSave', hbbAbOpts, { label: 'Save ability' })), hbbV(P + 'onSave') ? bF('Save DC', bIn(P + 'onDC', { ph: '8+prof+cha, spell or 15' })) : '');
    h += bRow(bF(hbbV(P + 'onSave') ? 'On a failed save' : 'Target condition', bSel(P + 'onCond', [['', '—']].concat(HBB_CONDS.map(c => [c, c])), { label: 'Condition' })), hbbV(P + 'onCond') ? bF('For how long', bIn(P + 'onCondDur', { ph: 'until the end of its next turn' })) : '');
    h += bRow(bF('Heals you', bIn(P + 'onHeal', { ph: '1d6+cha' })), bF('Temp HP for you', bIn(P + 'onTemp', { ph: 'prof' })));
    h += bF('Message', bIn(P + 'onMsg', { ph: 'A reminder of what else happens' }));
    h += bRow(bF('Each time it costs', bSel(P + 'onCost', kind === 'item' ? [['', 'A charge (if it has charges)'], ['charge', 'A charge'], ['none', 'Nothing']] : [['', 'One of its uses (if it has uses)'], ['use', 'One of its uses'], ['none', 'Nothing']], { label: 'Cost' })),
      bF('When it happens', bSeg(P + 'onAsk', [['', 'Ask me each time'], ['false', 'Always']])));
    h += `<p class="hint">It shows on that ability in Combat (“+ ${esc(HBB.d.name || 'this')}”). When the ability is used you get a button to add it${kind === 'feat' && String(HBB.d.max ?? '').trim() === '' ? ' — give it a number of uses above if it’s limited' : ''}.</p>`;
  }
  return h + `</div>`;
}

// Paste an item's text from a book / PDF / D&D Beyond → the builder, filled in, to check and add.
function openItemPaste() {
  openModal(`<h3>Paste an item</h3><p class="hint">Paste a magic item — its name, the type line (“Weapon (longsword), rare (requires attunement)”), then its text. Bonuses, charges, spells, extra damage, resistances and speeds become automation you can check before adding it.</p>
    <textarea class="f" id="ipaste" rows="10" aria-label="Item text" placeholder="Ring of Protection&#10;Ring, rare (requires attunement)&#10;You gain a +1 bonus to AC and saving throws while wearing this ring."></textarea>
    <div class="actions"><span class="grow"></span><button class="btn" data-act="close">Cancel</button><button class="btn gold" id="ipasteGo">Read item</button></div>`, null, true);
  setTimeout(() => { const t = $('#ipaste'); if (t) t.focus(); }, 30);
  $('#ipasteGo').onclick = () => { const v = $('#ipaste').value; if (!v.trim()) return; const ctx = { weapons: DND.weapons, armor: DND.armor, spells: DND.spells.map(x => x.name) }, r = ItemParse.parse(v, ctx);
    if (!r) { toast('That didn’t look like an item — the first line should be its name.', 'fumble'); return; }
    const it = ItemParse.toItem(r.spec, ctx); it.id = uid(); closeModal(true); openHomebrew('item', -1, it, { done: r.done, left: r.left }); };
}

// ==== ITEMPARSE START — shared with the DM's Desk (desk/build.sh copies this block into desk.js; edit it only here) ====
// Magic item text (book, PDF, D&D Beyond, 2014 or 2024 wording) → a spec → a character-sheet item with it.hb automation.
// ctx: { weapons: DND.weapons rows, armor: DND.armor rows, spells: [spell names] }. No globals used, so both apps can share it.
const ItemParse = (() => {
  const n = x => Number(x) || 0, low = s => String(s || '').toLowerCase();
  const DT = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'];
  const CONDS = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'];
  const RAR = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'];
  const WORDN = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, twenty: 20, fifty: 50 };
  const LIG = { 'ﬀ': 'ff', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬃ': 'ffi', 'ﬄ': 'ffl' };
  function norm(raw) {
    let t = String(raw || '').replace(/\r\n?/g, '\n').replace(/[ﬀﬁﬂﬃﬄ]/g, m => LIG[m]).replace(/[­​-‍﻿]/g, '').replace(/[  -  ]/g, ' ')
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[−‒–]/g, '-').replace(/\t/g, ' ');
    const L = t.split('\n').map(l => l.replace(/^\s*(?:>\s*)+/, '').replace(/^#{1,6}\s+/, '').replace(/\*\*\*|\*\*|__/g, '').replace(/(^|[\s(])[*_]([^*_]+?)[*_](?=[\s.,;:)]|$)/g, '$1$2').replace(/\s+/g, ' ').trim());
    for (let i = L.length - 2; i >= 0; i--) if (/[a-z]-$/.test(L[i]) && /^[a-z]/.test(L[i + 1] || '')) { L[i] = L[i].slice(0, -1) + L[i + 1]; L.splice(i + 1, 1); }
    return L;
  }
  const TYPE_RE = /^(weapon|armor|armour|shield|wondrous item|ring|potion|scroll|staff|wand|rod|ammunition)\b\s*(?:\(([^)]*)\))?\s*,?\s*(.*)$/i;
  const num = s => /^\d+$/.test(s) ? n(s) : WORDN[low(s)] || 0;
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
  function parse(raw, ctx) {
    ctx = ctx || {}; const W = ctx.weapons || [], A = ctx.armor || [], SP = (ctx.spells || []).slice().sort((a, b) => b.length - a.length);
    const L = norm(raw).filter(Boolean); if (!L.length) return null;
    const s = { name: L[0].replace(/[.:]$/, ''), type: 'wondrous', rarity: 'uncommon', attune: false, attuneBy: '', summary: '', notes: '' }, done = [], left = [];
    let i = 1; const tm = L[1] && TYPE_RE.exec(L[1]);
    if (tm) {
      i = 2; let ty = low(tm[1]).replace('armour', 'armor').replace('wondrous item', 'wondrous'); const base = low(tm[2] || ''), rest = low(tm[3] || '');
      const rm = RAR.slice().reverse().find(r => rest.includes(r)) || (/varies/.test(rest) ? 'rare' : ''); if (rm) s.rarity = rm;
      const at = /requires attunement(?: by ([^)]+))?/i.exec(L[1]); if (at) { s.attune = true; s.attuneBy = (at[1] || '').replace(/\)$/, '').trim(); }
      if (ty === 'weapon' || ty === 'ammunition') {
        const exact = W.find(w => low(w[0]) === base || low(w[0]) === base.replace(/s$/, '')) || W.find(w => base && base.split(/,|\bor\b/).some(b => low(w[0]) === b.trim()));
        const pick = exact || (/sword/.test(base) ? W.find(w => w[0] === 'Longsword') : /axe/.test(base) ? W.find(w => w[0] === 'Battleaxe') : /bow/.test(base) ? W.find(w => w[0] === 'Longbow') : /ranged/.test(base) ? W.find(w => w[0] === 'Shortbow') : W.find(w => w[0] === 'Longsword'));
        if (pick) { s.weapon = { base: pick[0], magic: 0 }; if (!exact) left.push(`Base weapon “${tm[2] || 'any'}” — set to ${pick[0]}; change it if you like.`); }
        s.type = 'weapon';
      } else if (ty === 'armor' || ty === 'shield') {
        const exact = ty === 'shield' ? A.find(a => a[0] === 'Shield') : A.find(a => low(a[0]) === base || low(a[0]).replace(/ armor$/, '') === base || low(a[0]) === base + ' armor');
        const pick = exact || A.find(a => /medium or heavy|heavy/.test(base) ? a[0] === 'Chain Mail' : /light/.test(base) ? a[0] === 'Studded Leather' : /medium/.test(base) ? a[0] === 'Breastplate' : a[0] === 'Chain Mail');
        if (pick) { s.armor = { base: pick[0], magic: 0 }; if (!exact) left.push(`Base armor “${tm[2] || 'any'}” — set to ${pick[0]}; change it if you like.`); }
        s.type = 'armor';
      } else s.type = ty;
      done.push(`${cap1(s.rarity)} ${s.type === 'wondrous' ? 'wondrous item' : s.type}${s.attune ? ', attunement' + (s.attuneBy ? ' by ' + s.attuneBy : '') : ''}`);
    }
    const body = L.slice(i).join(' '), sents = body.split(/(?<=[.!?])\s+(?=[A-Z])/), lb = body.toLowerCase();
    s.notes = L.slice(i).join('\n');
    let m;
    if ((m = /\+(\d) bonus to attack (?:rolls )?and damage rolls/i.exec(body)) && s.weapon) { s.weapon.magic = n(m[1]); done.push(`+${m[1]} to attack and damage`); }
    const acm = /\+(\d) bonus to (?:your )?(?:AC|Armor Class)( and (?:to )?saving throws)?/i.exec(body);
    if (acm) { if (s.armor && !acm[2]) s.armor.magic = n(acm[1]); else { s.bonuses = s.bonuses || {}; s.bonuses.ac = n(acm[1]); } if (acm[2]) { s.bonuses = s.bonuses || {}; s.bonuses.saves = n(acm[1]); } done.push(`+${acm[1]} AC${acm[2] ? ' and saves' : ''}`); }
    if (!acm || !acm[2]) { const sm = /\+(\d) bonus to (?:all )?saving throws/i.exec(body); if (sm) { s.bonuses = s.bonuses || {}; s.bonuses.saves = n(sm[1]); done.push(`+${sm[1]} to saves`); } }
    if ((m = /\+(\d) bonus to spell attack rolls/i.exec(body))) { s.bonuses = s.bonuses || {}; s.bonuses.spell = n(m[1]); done.push(`+${m[1]} spell attack${/saving throw DCs?|save DC/i.test(body) ? ' and DC' : ''}`); }
    if ((m = /has (\d+|[a-z]+) charges/i.exec(body)) && num(m[1])) {
      const reset = /at dawn|each dawn|daily/i.test(body) ? 'long' : /short or long rest|short rest/i.test(body) ? 'short' : /long rest/i.test(body) ? 'long' : 'none';
      s.charges = { max: num(m[1]), reset }; const rg = /regains? (all expended charges|\d+d\d+(?:\s*\+\s*\d+)?|\d+) (?:expended )?charges?/i.exec(body);
      done.push(`${num(m[1])} charges${reset === 'none' ? '' : ', back ' + (reset === 'short' ? 'after a short rest' : 'at dawn')}${rg && !/all/i.test(rg[1]) ? ` (regains ${rg[1].replace(/\s+/g, '')} — the sheet refills all of them)` : ''}`);
    }
    // spells it casts (in sentences about casting), with their charge costs kept as a note
    const spells = [], costs = [];
    sents.filter(x => /\bcast\b|\bcasting\b/i.test(x)).forEach(x => { let rest = x;
      for (const nm of SP) { const re = new RegExp('\\b' + nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b(\\s*\\(([^)]*)\\))?', 'i'); const k = re.exec(rest); if (!k) continue;
        if (/^(light|shield|fly|wish|command|sleep|bless|guidance|resistance|identify|message)$/i.test(nm) && !new RegExp('\\b' + nm + '\\b(?:\\s*spell|\\s*\\(|,|\\s+or\\b|\\s+and\\b|\\.)', 'i').test(rest.slice(k.index))) continue;
        if (!spells.includes(nm)) spells.push(nm); if (k[2] && /charge/i.test(k[2])) costs.push(`${nm}: ${k[2]}`); rest = rest.slice(0, k.index) + ' ' + rest.slice(k.index + k[0].length); } });
    spells.sort((a, b) => lb.indexOf(low(a)) - lb.indexOf(low(b))); costs.sort((a, b) => lb.indexOf(low(a.split(':')[0])) - lb.indexOf(low(b.split(':')[0])));
    if (spells.length) { s.spells = spells.slice(0, 8); if (/can't (?:be used|do so) (?:this way )?again until the next dawn|once per (?:day|long rest)|1\/day/i.test(body) && !s.charges) s.spellOnce = true; done.push('Casts ' + s.spells.join(', ') + (costs.length ? ' (' + costs.join('; ') + ')' : '')); }
    if (costs.length) s.notes += '\nCharge costs: ' + costs.join('; ') + '.';
    // extra damage on a hit → an add-on to this weapon's attacks
    if ((m = /(?:deals?|takes?) an extra (\d+d\d+(?:\s*\+\s*\d+)?)\s+([a-z]+) damage/i.exec(body)) && DT.includes(low(m[2]))) {
      const sent = sents.find(x => x.includes(m[0])) || '', ask = /\b(while|if|when you hit (?:a|an) |against|whenever)\b/i.test(sent.slice(0, sent.indexOf(m[0]) + 1));
      s.onHit = { dice: m[1].replace(/\s+/g, ''), type: low(m[2]), ask }; done.push(`On a hit: +${s.onHit.dice} ${s.onHit.type}${ask ? ' (a button — you choose when it applies)' : ''}`);
    }
    const P = {};
    const typesIn = t => DT.filter(d => new RegExp('\\b' + d + '\\b').test(low(t)));
    for (const k of body.matchAll(/resistance to ([a-z ,]+?) damage/gi)) { const ts = typesIn(k[1]); if (ts.length && !/all damage/i.test(k[0])) P.resist = (P.resist || []).concat(ts); }
    for (const k of body.matchAll(/immun(?:e|ity) to ([a-z ,]+?) damage/gi)) { const ts = typesIn(k[1]); if (ts.length) P.immune = (P.immune || []).concat(ts); }
    for (const k of body.matchAll(/(?:can't be|immune to being|immunity to being|immune to the) (charmed|frightened|poisoned|paralyzed|stunned|blinded|deafened|petrified|restrained|grappled)/gi)) P.condImmune = (P.condImmune || []).concat(cap1(low(k[1])));
    if ((m = /flying speed (?:of (\d+) feet|equal to your walking speed)/i.exec(body))) P.fly = m[1] ? n(m[1]) : 'walk';
    if ((m = /swimming speed (?:of (\d+) feet|equal to your walking speed)/i.exec(body))) P.swim = m[1] ? n(m[1]) : 'walk';
    if ((m = /climbing speed (?:of (\d+) feet|equal to your walking speed)/i.exec(body))) P.climb = m[1] ? n(m[1]) : 'walk';
    if ((m = /(?:walking )?speed increases by (\d+) feet/i.exec(body))) P.speed = n(m[1]);
    if ((m = /darkvision (?:out )?to a range of (\d+) feet|darkvision (?:with a range of )?(\d+) feet/i.exec(body))) P.sense = 'Darkvision ' + (m[1] || m[2]) + ' ft';
    const adv = sents.filter(x => /\byou have advantage on\b|\bgives? you advantage\b/i.test(x)).map(x => x.replace(/^.*?advantage on /i, '').replace(/[.,;]?\s*as the .*$|\.$/i, '').trim()).filter(Boolean);
    if (adv.length) P.adv = adv.join('; ').slice(0, 200);
    if (Object.keys(P).length) { Object.keys(P).forEach(k => { if (Array.isArray(P[k])) P[k] = Array.from(new Set(P[k])); }); s.passive = P;
      done.push([P.resist && 'Resist ' + P.resist.join(', '), P.immune && 'Immune ' + P.immune.join(', '), P.condImmune && "Can't be " + P.condImmune.join(', ').toLowerCase(), P.fly && 'Fly ' + P.fly, P.swim && 'Swim ' + P.swim, P.climb && 'Climb ' + P.climb, P.speed && 'Speed +' + P.speed, P.sense, P.adv && 'Advantage: ' + P.adv].filter(Boolean).join(' · ')); }
    // potions and scrolls are used up; healing potions heal
    if (s.type === 'potion' || s.type === 'scroll') { s.consumable = true; s.qty = 1; }
    if ((m = /regains? (\d+d\d+(?:\s*\+\s*\d+)?|\d+) hit points/i.exec(body)) && (s.consumable || /\bdrink\b/i.test(body))) { s.use = Object.assign(s.use || {}, { heal: m[1].replace(/\s+/g, ''), col: /bonus action/i.test(body) && !/action to (?:drink|administer)/i.test(body) ? 'bonus' : 'action' }); done.push('Heals ' + s.use.heal + ' when used'); }
    else if (s.consumable) s.use = Object.assign(s.use || {}, { col: 'action' });
    if (/\bcurse[ds]?\b/i.test(body)) { left.push('It’s cursed — the curse is in the description.'); if (/disadvantage on attack rolls (?:made )?with weapons other than/i.test(body)) s.curse = { othersDis: true }; }
    if (/while (?:you're |you are )?(?:wearing|carrying|holding)|while it is on your person|while you carry/i.test(body) && !s.weapon && !s.armor && /carrying|on your person|carry/i.test(body)) s.carried = true;
    s.summary = (sents[0] || '').slice(0, 200);
    return { spec: s, done, left };
  }
  // spec → the sheet's item object (what S.inventory / S.customItems hold)
  function toItem(s, ctx) {
    ctx = ctx || {}; const W = ctx.weapons || [], A = ctx.armor || [], it = { name: s.name, qty: s.qty || 1, weight: s.weight || 0, cost: s.cost || '', equipped: false, notes: s.notes || '' }, hb = {}, mods = {};
    if (s.summary) it.summary = s.summary;
    it.magic = { rarity: s.rarity, type: s.type === 'armor' && s.armor && s.armor.base === 'Shield' ? 'shield' : s.type, src: 'Homebrew', name: s.name };
    if (s.attune) { it.attune = true; it.attuneBy = s.attuneBy || ''; it.attuned = false; }
    if (s.weapon) { const w = W.find(x => x[0] === s.weapon.base); if (w) { it.weapon = { cat: w[1], kind: w[2], dice: w[4], type: w[5], props: (w[7] || []).slice(), range: w[8] || '', base: w[0] }; if (!s.weight) it.weight = w[6]; if (s.weapon.magic) { mods.atk = s.weapon.magic; mods.dmg = s.weapon.magic; } } }
    if (s.armor) { const a = A.find(x => x[0] === s.armor.base); if (a) { it.armor = { type: a[1], base: a[3], dexCap: a[4], strReq: a[5], stealthDis: a[6] }; if (!s.weight) it.weight = a[7]; if (s.armor.magic) mods.ac = s.armor.magic; } }
    if (s.bonuses) { if (s.bonuses.ac) mods.ac = n(mods.ac) + s.bonuses.ac; if (s.bonuses.saves) mods.save = s.bonuses.saves; if (s.bonuses.spell) mods.spell = s.bonuses.spell; }
    if (Object.keys(mods).length) it.mods = mods;
    it.hbType = it.weapon ? 'weapon' : s.consumable ? 'consumable' : 'magic';
    if (s.charges) it.charges = { max: s.charges.max, used: 0, reset: s.charges.reset };
    if (s.spells && s.spells.length) { it.spells = s.spells.slice(); if (s.spellOnce) it.spellOnce = true; if (s.spellAtWill) it.spellAtWill = true; if (s.spellAb) hb.spellAb = s.spellAb; }
    if (s.consumable) { hb.consume = true; if (s.type === 'potion' || s.type === 'scroll') it.consumable = true; }
    const u = s.use || {}; if (u.col) hb.col = u.col; if (u.roll) hb.roll = u.roll; if (u.rollNote) hb.rollNote = u.rollNote; if (u.healRoll) hb.healRoll = true; if (u.selfDmg) hb.selfDmg = true;
    if (u.heal) { hb.heal = u.heal; if (s.type === 'potion') it.heal = u.heal; } if (u.temp) hb.temp = u.temp; if (u.saveAb) { hb.saveAb = u.saveAb; hb.dc = String(u.dc || 'spell'); } if (u.dash) hb.dash = true; if (u.text) hb.text = u.text;
    const p = s.passive || {}; ['resist', 'immune', 'condImmune'].forEach(k => { if (p[k] && p[k].length) hb[k] = p[k].join(', '); });
    ['speed', 'fly', 'swim', 'climb', 'sense', 'skillBonus', 'adv'].forEach(k => { if (p[k]) hb[k] = String(p[k]); }); if (p.init) hb.init = String(p.init); if (p.initAdv) hb.initAdv = true; if (p.maxHp) hb.maxHp = String(p.maxHp);
    const e = s.effect; if (e) { hb.effName = e.name; if (e.rounds) hb.effRounds = e.rounds; if (e.fly) hb.effFly = String(e.fly); if (e.ac) hb.effAc = String(e.ac); if (e.speed) hb.effSpeed = String(e.speed); if (e.skillAdv && e.skillAdv.length) hb.effSkillAdv = e.skillAdv.join(', '); if (e.note) hb.effNote = e.note; if (e.conc) hb.effConc = true; if (!hb.col) hb.col = 'action'; }
    const a = s.attack; if (a) { hb.atkName = a.name; hb.atkDice = a.dice; if (a.type) hb.atkType = a.type; hb.atkAb = a.ab; hb.atkKind = a.kind; if (a.range) hb.atkRange = String(a.range); if (a.addMod) hb.atkAddMod = true; if (a.note) hb.atkNote = a.note; }
    const c = s.curse; if (c) { if (c.othersDis) hb.othersDis = true; if (c.hurtSave) { hb.hurtSave = c.hurtSave; hb.hurtDC = String(c.hurtDC || 10); if (c.hurtText) hb.hurtText = c.hurtText; } }
    // extra damage on a hit rides on this weapon's own attack (the sheet's add-ons)
    const oh = s.onHit; if (oh && oh.dice) { hb.on = 'name:' + s.name; hb.onDmg = oh.dice; if (oh.type) hb.onType = oh.type; hb.onAsk = oh.ask ? '' : 'false'; hb.onCost = 'none'; }
    if (s.carried) it.carried = true;
    if (it.weapon) it.noEquip = false;
    if (!it.weapon && (hb.col || it.charges || hb.consume) && !hb.text) { hb.text = String(s.summary || s.notes || '').slice(0, 400) || 'You use ' + s.name + '.'; hb.textAuto = 1; }
    if (Object.keys(hb).length) it.hb = hb;
    return it;
  }
  return { parse, toItem, norm, DT, CONDS };
})();
// ==== ITEMPARSE END ====
