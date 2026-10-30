// ---------- Homebrew item builder (the DM's Desk) ----------
// The same window as the character sheet's homebrew builder (Add an item → Homebrew): a few big choices, and an
// "Advanced" switch that opens tidy sections for everything else the sheet can automate. It makes an item in the sheet's
// own inventory format, so a player who gets it has it working straight away. Works on a copy: nothing changes until Save.
// Use: hbdOpen(item | null, { title?, saveLabel?, onSave(item) }). Needs the desk's pop-up window: inside the desk's own
// scope it finds openModal / closeModal by itself; from outside, call pgHbd.init({ openModal, closeModal, toast }) once.
const HBD_ENV = {
  openModal: typeof openModal === 'function' ? openModal : null,
  closeModal: typeof closeModal === 'function' ? closeModal : null,
  toast: typeof toast === 'function' ? toast : null,
};
let HBD = null; // { d (the copy), isNew, adv, sec: {open sections}, opts }
const hbdEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hbdN = v => { const n = parseFloat(String(v == null ? '' : v).replace(/−/g, '-')); return isNaN(n) ? 0 : n; };
const hbdUid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-5);
const hbdCSV = v => String(v || '').split(/\s*[,;\n]\s*/).map(x => x.trim()).filter(Boolean);
const hbdGet = (o, p) => p.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o);
const hbdSet = (o, p, v) => { const ks = p.split('.'); let x = o; ks.slice(0, -1).forEach(k => { if (x[k] == null || typeof x[k] !== 'object') x[k] = {}; x = x[k]; }); x[ks[ks.length - 1]] = v; };
const hbdV = p => hbdGet(HBD.d, p);
const HBD_DMG = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'];
const HBD_CONDS = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'];
const HBD_AB = [['str', 'Strength'], ['dex', 'Dexterity'], ['con', 'Constitution'], ['int', 'Intelligence'], ['wis', 'Wisdom'], ['cha', 'Charisma']];
const HBD_DICE = ['4', '6', '8', '10', '12', '20'];
const HBD_RIDERS = [['meleehit', 'I hit with a melee weapon attack'], ['hit', 'I hit with any attack'], ['cast', 'I cast a spell'], ['spelldmg', 'I deal damage with a spell']];
const hbdTypes = () => HBD_DMG.map(t => [t, t[0].toUpperCase() + t.slice(1)]);
const hbdUseCols = none => [['action', 'Action'], ['bonus', 'Bonus action'], ['reaction', 'Reaction'], ['move', 'Movement'], ['', none || 'Nothing']];
const hbdAbOpts = [['', '—']].concat(HBD_AB);
const hbdDurs = [['', 'Until ended'], ['1', '1 round'], ['10', '1 minute'], ['100', '10 minutes'], ['600', '1 hour'], ['4800', '8 hours']];
const hbdSum = pairs => pairs.filter(([p]) => { const v = hbdV(p); return v != null && v !== '' && v !== false; }).map(([p, t]) => t || String(hbdV(p))).join(' · ');
const hbdSpellNames = () => { const D = (typeof window !== 'undefined' && window.DESK_DATA) || {}; return (D.spells || []).map(s => s.n || s.name).filter(Boolean); };

// ----- Fields -----
const dIn = (p, o = {}) => `<input class="dk-f ${o.cls || ''}" data-hbd="${p}"${o.num ? ' type="number" inputmode="decimal"' : ''} value="${hbdEsc(hbdV(p) ?? '')}" placeholder="${hbdEsc(o.ph || '')}" aria-label="${hbdEsc(o.label || o.ph || p)}"${o.list ? ` list="${o.list}"` : ''}>`;
const dTa = (p, o = {}) => `<textarea class="dk-f" data-hbd="${p}" rows="${o.rows || 3}" placeholder="${hbdEsc(o.ph || '')}" aria-label="${hbdEsc(o.label || o.ph || p)}">${hbdEsc(hbdV(p) || '')}</textarea>`;
const dSel = (p, opts, o = {}) => `<select class="dk-f" data-hbd="${p}" aria-label="${hbdEsc(o.label || p)}">${opts.map(([v, t]) => `<option value="${hbdEsc(v)}"${String(hbdV(p) ?? '') === String(v) ? ' selected' : ''}>${hbdEsc(t)}</option>`).join('')}</select>`;
const dChk = (p, label, hint) => `<label class="hbb-chk"${hint ? ` title="${hbdEsc(hint)}"` : ''}><input type="checkbox" data-hbd="${p}"${hbdV(p) ? ' checked' : ''}><span><b>${label}</b></span></label>`;
const dSeg = (p, opts, o = {}) => `<div class="hbb-seg${o.big ? ' big' : ''}${o.wrap ? ' pills' : ''}" role="radiogroup">${opts.map(([v, t, ic, sub]) => { const on = String(hbdV(p) ?? '') === String(v); return `<button type="button" role="radio" aria-checked="${on}" class="${on ? 'on' : ''}" data-hbdseg="${p}" data-v="${hbdEsc(v)}"${sub ? ` title="${hbdEsc(sub)}"` : ''}>${ic ? `<span class="ic" aria-hidden="true">${ic}</span>` : ''}<span class="t">${t}</span></button>`; }).join('')}</div>`;
const dChips = (p, list) => { const have = hbdCSV(hbdV(p) || '').map(x => x.toLowerCase()); return `<div class="hbb-chips">${list.map(t => `<button type="button" class="hbb-chip${have.includes(t.toLowerCase()) ? ' on' : ''}" aria-pressed="${have.includes(t.toLowerCase())}" data-hbdchip="${p}" data-v="${hbdEsc(t)}">${hbdEsc(t)}</button>`).join('')}</div>`; };
const dF = (label, inner, hint, cls = '') => `<div class="hbb-f ${cls}"><span class="lbl">${label}</span>${inner}${hint ? `<small class="hint">${hint}</small>` : ''}</div>`;
const dRow = (...a) => `<div class="hbb-row">${a.join('')}</div>`;
const dSec = (id, icon, title, sum, body) => { const open = !!HBD.sec[id]; return `<section class="hbb-sec${open ? ' open' : ''}"><button type="button" class="hbb-sh" data-hbdsec="${id}" aria-expanded="${open}"><span class="ic" aria-hidden="true">${icon}</span><span class="t"><b>${title}</b><small>${hbdEsc(sum || '')}</small></span><span class="caret" aria-hidden="true">${open ? '▴' : '▾'}</span></button>${open ? `<div class="hbb-sb">${body}</div>` : ''}</section>`; };
const hbdDice = (np, dp) => `<div class="hbb-dice">${dIn(np, { num: 1, cls: 'hbb-dn', ph: '1', label: 'How many dice' })}${dSeg(dp, HBD_DICE.map(x => [x, 'd' + x]))}</div>`;

// ----- Opening -----
function hbdOpen(item, opts) {
  opts = opts || {}; const isNew = !item;
  const d = JSON.parse(JSON.stringify(item || { id: hbdUid(), name: '', qty: 1, weight: 0, equipped: false, notes: '' })); d.hb = d.hb || {};
  const w = d.weapon || {}, m = /(\d+)d(\d+)/.exec(w.dice || '') || [], rg = String(w.range || '').split('/');
  d._type = d.hbType || (d.weapon ? 'weapon' : d.hb.consume ? 'consumable' : 'magic');
  d._kind = w.kind || 'melee'; d._dn = m[1] || (isNew ? '1' : ''); d._dd = m[2] || '6'; d._dt = w.type || ''; d._rn = rg[0] || ''; d._rl = rg[1] || '';
  d._ab = d.atkAb || ((w.props || []).includes('finesse') ? 'fin' : w.kind === 'ranged' ? 'dex' : 'str'); d._mag = d.mods && hbdN(d.mods.atk) ? String(hbdN(d.mods.atk)) : '';
  d._eqOnly = !d.noEquip; d._uses = d.charges && hbdN(d.charges.max) ? String(d.charges.max) : ''; d._reset = (d.charges && d.charges.reset) || 'long';
  d._props = (w.props || []).filter(p => !/^ammunition|^loading$/.test(p)).join(', '); d._loading = (w.props || []).includes('loading'); d._cat = w.cat || 'martial';
  if (isNew) d.hb.col = 'action';
  if (!isNew && d.weapon && !d.hb.col) d.hb.col = 'action';
  HBD = { d, isNew, adv: hbdAdvOn(d), sec: {}, opts, painted: false };
  const om = HBD_ENV.openModal; if (!om) { console.warn('hbdOpen: no pop-up window — call pgHbd.init({ openModal, closeModal })'); HBD = null; return; }
  om(`<h2>${hbdEsc(opts.title || (isNew ? 'New homebrew item' : 'Edit ' + (d.name || 'item')))}</h2><div id="hbd"></div>`, { wide: true, cls: 'hbd-win', onClose: () => { HBD = null; } });
  hbdPaint();
}
// Advanced starts open when the item already uses some of it.
function hbdAdvOn(d) {
  const h = d.hb || {}, basic = ['col', 'consume', 'text', 'textAuto'];
  return Object.keys(h).some(k => !basic.includes(k) && h[k] !== '' && h[k] != null && h[k] !== false) || (d.spells || []).length > 0 || !!hbdN(d._mag) || !!d.attune || !!String(d._props || '').trim();
}
function hbdPaint() {
  const box = document.getElementById('hbd'); if (!box || !HBD) return;
  const card = box.closest('.dk-mcard'), sc = card ? card.scrollTop : 0, o = HBD.opts;
  const adv = HBD.adv ? `<div class="hbb-adv">${hbdItemAdv()}<p class="dk-hint hbb-fhint">Numbers can be formulas: <code>prof</code>, <code>wis</code>, <code>level</code>, <code>1d6+prof</code>. Separate several entries with commas.</p></div>` : '';
  box.innerHTML = `<div class="hbb-head"><span class="hbb-grow"></span><label class="hbb-switch" title="Show every option the sheet can automate"><input type="checkbox" data-hbdadv${HBD.adv ? ' checked' : ''}><span class="tr" aria-hidden="true"><i></i></span><span>Advanced</span></label></div>
    <div class="hbb-body">${hbdItemBasic()}${adv}</div>
    <datalist id="hbd-spl">${hbdSpellNames().map(n => `<option value="${hbdEsc(n)}"></option>`).join('')}</datalist>
    <div class="dk-acts hbb-acts"><button class="dk-btn" data-act="close">Cancel</button><button class="dk-btn gold" data-hbdsave>${hbdEsc(o.saveLabel || (HBD.isNew ? 'Create item' : 'Save'))}</button></div>`;
  if (card) card.scrollTop = sc;
  const f = HBD.isNew && !HBD.painted && box.querySelector('[data-hbd="name"]'); if (f) setTimeout(() => f.focus(), 30);
  HBD.painted = true;
}

// ----- Simple view -----
function hbdItemBasic() {
  const d = HBD.d, t = d._type;
  let h = dF('Name', dIn('name', { ph: t === 'weapon' ? 'e.g. Stormcaller Pistol' : t === 'consumable' ? 'e.g. Potion of Frost Breath' : 'e.g. Amulet of the Tides', cls: 'hbb-name', label: 'Item name' }));
  h += dF('What is it?', dSeg('_type', [['weapon', 'Weapon', '⚔', 'You attack with it'], ['magic', 'Magic item', '✦', 'Gear, uses or a power'], ['consumable', 'Consumable', '🧪', 'Using it uses one up']], { big: true }));
  h += dF(t === 'weapon' ? 'Attacking with it takes' : 'Using it takes', dSeg('hb.col', hbdUseCols(t === 'weapon' ? 'Nothing' : 'Nothing (passive)'), { wrap: true }));
  if (t === 'weapon') {
    h += `<div class="hbb-card"><div class="hbb-ct">⚔ Weapon</div>`;
    h += dRow(dF('Kind', dSeg('_kind', [['melee', 'Melee'], ['ranged', 'Ranged']])), d._kind === 'ranged' ? dF('Range (ft)', `<div class="hbb-range">${dIn('_rn', { num: 1, ph: '80', label: 'Normal range' })}<span>/</span>${dIn('_rl', { num: 1, ph: '320', label: 'Long range' })}</div>`) : '');
    h += dF('Roll to hit with', dSeg('_ab', [['str', 'Strength'], ['dex', 'Dexterity'], ['fin', 'Best of the two'], ['spell', 'Spellcasting']], { wrap: true }));
    h += dRow(dF('Damage dice', hbdDice('_dn', '_dd')), dF('Damage type', dSel('_dt', [['', 'Choose…']].concat(hbdTypes()), { label: 'Damage type' })));
    h += dChk('_eqOnly', 'Must be equipped to attack with it', 'Its attack shows on the Combat tab only while it’s equipped');
    h += `</div>`;
  } else {
    h += `<div class="hbb-card"><div class="hbb-ct">${t === 'consumable' ? '🧪 Consumable' : '✦ Magic item'}</div>`;
    h += dRow(t === 'consumable' ? dF('How many', dIn('qty', { num: 1, ph: '1', label: 'Quantity' })) : '', dF('Uses', dIn('_uses', { num: 1, ph: t === 'consumable' ? '—' : 'Unlimited', label: 'Uses' })), hbdN(d._uses) ? dF('Recharges', dSeg('_reset', [['long', 'Long rest'], ['short', 'Short rest'], ['none', 'Never']])) : '');
    h += `</div>`;
  }
  h += dF(t === 'weapon' ? 'Notes' : 'What it does', dTa('notes', { rows: 2, ph: t === 'weapon' ? 'Anything special about it' : 'Describe it — the player sees this when they use it' }));
  return h;
}

// ----- Advanced -----
function hbdItemAdv() {
  const d = HBD.d, t = d._type, P = 'hb.';
  let h = '';
  if (t === 'weapon') h += dSec('wpn', '⚔', 'Weapon details', hbdSum([['_mag', d._mag ? '+' + d._mag + ' magic' : ''], ['_props', d._props], ['_loading', 'loading']]),
    dF('Magic bonus (to hit and damage)', dSeg('_mag', [['', 'None'], ['1', '+1'], ['2', '+2'], ['3', '+3']])) + dF('Properties', dChips('_props', ['Finesse', 'Light', 'Heavy', 'Two-handed', 'Thrown', 'Reach', 'Versatile', 'Special'])) + dRow(dF('Category', dSeg('_cat', [['simple', 'Simple'], ['martial', 'Martial']])), d._kind === 'ranged' ? dChk('_loading', 'Loading', 'Only one shot per action, bonus action or reaction') : ''));
  h += dSec('prot', '🛡', 'Protection', hbdSum([[P + 'resist', 'Resist ' + (hbdV(P + 'resist') || '')], [P + 'immune', 'Immune ' + (hbdV(P + 'immune') || '')], [P + 'vuln', 'Vulnerable ' + (hbdV(P + 'vuln') || '')], [P + 'condImmune'], [P + 'ac', 'AC +' + hbdV(P + 'ac')], [P + 'saveAll', 'Saves +' + hbdV(P + 'saveAll')]]) || 'Resistances, immunities, AC',
    dF('Resistant to', dChips(P + 'resist', HBD_DMG)) + dF('Immune to', dChips(P + 'immune', HBD_DMG)) + dF('Vulnerable to', dChips(P + 'vuln', HBD_DMG)) + dF('Can’t be', dChips(P + 'condImmune', HBD_CONDS)) + dRow(dF('AC bonus', dIn(P + 'ac', { ph: '1' })), dF('Bonus to all saves', dIn(P + 'saveAll', { ph: '1' }))));
  h += dSec('move', '🪽', 'Movement & senses', hbdSum([[P + 'speed', '+' + hbdV(P + 'speed') + ' ft'], [P + 'fly', 'Fly'], [P + 'swim', 'Swim'], [P + 'climb', 'Climb'], [P + 'sense']]) || 'Speed, flying, darkvision',
    dRow(dF('Extra speed (ft)', dIn(P + 'speed', { ph: '10' })), dF('Fly (ft)', dIn(P + 'fly', { ph: '30 or walk' })), dF('Swim (ft)', dIn(P + 'swim', { ph: 'walk' })), dF('Climb (ft)', dIn(P + 'climb', { ph: 'walk' }))) + dF('Senses', dIn(P + 'sense', { ph: 'Darkvision 60 ft' })));
  h += dSec('bon', '✚', 'Bonuses', hbdSum([[P + 'skillBonus'], [P + 'init', 'Initiative +' + hbdV(P + 'init')], [P + 'initAdv', 'Adv. on initiative'], [P + 'maxHp', 'Max HP +' + hbdV(P + 'maxHp')], [P + 'adv', 'Advantage notes']]) || 'Skills, initiative, max HP',
    dF('Skill bonuses', dIn(P + 'skillBonus', { ph: 'Stealth +2, Perception +1' })) + dRow(dF('Initiative bonus', dIn(P + 'init', { ph: '2 or wis' })), dF('Max HP bonus', dIn(P + 'maxHp', { ph: 'level' }))) + dChk(P + 'initAdv', 'Advantage on initiative') + dF('Advantage on (a reminder)', dIn(P + 'adv', { ph: 'Saves against being frightened; …' })));
  h += dSec('use', '⚡', 'When you use it', hbdSum([[P + 'roll', 'Rolls ' + hbdV(P + 'roll')], [P + 'heal', 'Heals ' + hbdV(P + 'heal')], [P + 'temp', 'Temp HP'], [P + 'saveAb', 'Save'], [P + 'dash', 'Dash'], [P + 'refuel', 'Recovers a slot']]) || 'Rolls, healing, saves',
    dRow(dF('Roll', dIn(P + 'roll', { ph: '2d6+wis' })), dF('What the roll is', dIn(P + 'rollNote', { ph: 'fire damage' }))) + dRow(dChk(P + 'healRoll', 'The roll heals them'), dChk(P + 'selfDmg', 'The roll hurts them')) +
    dRow(dF('Targets make a save', dSel(P + 'saveAb', hbdAbOpts, { label: 'Save ability' })), dF('Save DC', dIn(P + 'dc', { ph: '15, or spell' }))) +
    dRow(dF('Heals its user', dIn(P + 'heal', { ph: '2d4+2' })), dF('Temp HP', dIn(P + 'temp', { ph: '1d10' }))) +
    dRow(dF('Recovers a spell slot up to', dIn(P + 'refuel', { num: 1, ph: 'level' }))) + dChk(P + 'dash', 'Lets them Dash', 'Adds their speed to this turn’s movement'));
  h += dSec('eff', '✨', 'Starts an effect', hbdV(P + 'effName') ? hbdV(P + 'effName') : 'A buff that lasts a while', hbdEffFields(P));
  h += dSec('sp', '📜', 'Spells it lets you cast', (d.spells || []).join(', ') || 'None', hbdSpellList() + dRow(dChk('spellOnce', 'Leveled spells once per long rest'), dChk('spellAtWill', 'At will (no slot)')) + dF('Cast with', dSel(P + 'spellAb', [['', 'Their spellcasting'], ...HBD_AB], { label: 'Cast with' })));
  if (t !== 'weapon') h += dSec('atk', '🗡', 'Gives you an attack', hbdV(P + 'atkName') || 'A special attack', hbdAtkFields(P));
  h += dSec('curse', '☠', 'Drawbacks', hbdSum([[P + 'othersDis', 'Cursed'], [P + 'hurtSave', 'Save when hurt']]) || 'Curses and side effects',
    dChk(P + 'othersDis', 'Cursed: disadvantage on attacks with other weapons') + dRow(dF('When they take damage, they make a save', dSel(P + 'hurtSave', hbdAbOpts, { label: 'Save when hurt' })), dF('DC', dIn(P + 'hurtDC', { ph: '15' }))) + dF('If they fail', dIn(P + 'hurtText', { ph: 'What happens' })));
  h += dSec('misc', '⚙', 'Carrying, attunement & reminders', hbdSum([['attune', 'Attunement'], ['carried', 'Works while carried'], [P + 'triggerOn', 'Reminder']]) || 'Weight, cost, attunement',
    dRow(dF('Weight (lb)', dIn('weight', { num: 1 })), dF('Cost', dIn('cost', { ph: '50 gp' }))) + dRow(dChk('attune', 'Requires attunement'), dChk('carried', 'Works while carried', 'No need to equip it')) + dRow(dF('Remind them', dSel(P + 'triggerOn', [['', '—'], ['longRest', 'After a long rest'], ['shortRest', 'After a short rest'], ['initiative', 'When they roll initiative'], ['zero', 'When they drop to 0 HP']], { label: 'Remind them' })), dF('Only works while (effect)', dIn(P + 'onlyEffect', { ph: 'effect name' }))));
  h += dSec('rider', '✚', 'Adds to another ability', hbdV('hb.on') ? hbdRiderText(HBD.d.hb) : 'Like “my melee hits also deal 1d6 fire”', hbdRiderFields());
  return h;
}
const hbdEffFields = P => dRow(dF('Effect name', dIn(P + 'effName', { ph: 'Frost Aura' })), dF('Lasts', dSel(P + 'effRounds', hbdDurs, { label: 'Lasts' }))) +
  dRow(dF('Fly speed', dIn(P + 'effFly', { ph: '30' })), dF('AC bonus', dIn(P + 'effAc', { ph: '2' })), dF('Extra speed', dIn(P + 'effSpeed', { ph: '10' }))) +
  dF('Advantage on (skills)', dIn(P + 'effSkillAdv', { ph: 'Perception, Stealth' })) + dF('Note shown on the effect', dIn(P + 'effNote', { ph: 'What it does' })) + dChk(P + 'effConc', 'Needs concentration');
const hbdAtkFields = P => dRow(dF('Attack name', dIn(P + 'atkName', { ph: 'Frost Lance' })), dF('Damage', dIn(P + 'atkDice', { ph: '1d8+prof' })), dF('Type', dSel(P + 'atkType', [['', '—']].concat(hbdTypes()), { label: 'Attack damage type' }))) +
  dF('Roll to hit with', dSeg(P + 'atkAb', [['spell', 'Spellcasting'], ['str', 'STR'], ['dex', 'DEX'], ['fin', 'Best of STR/DEX'], ['con', 'CON'], ['int', 'INT'], ['wis', 'WIS'], ['cha', 'CHA']], { wrap: true })) +
  dRow(dF('Kind', dSeg(P + 'atkKind', [['melee', 'Melee'], ['ranged', 'Ranged']])), dF('Range (ft)', dIn(P + 'atkRange', { ph: '60' }))) + dChk(P + 'atkAddMod', 'Add the ability modifier to damage') + dF('Note', dIn(P + 'atkNote', { ph: 'only while…' }));
function hbdSpellList() {
  const sp = HBD.d.spells || [];
  return `<div class="hbb-spl">${sp.map((n, j) => `<span class="hbd-pchip">${hbdEsc(n)}<button type="button" data-hbdspdel="${j}" aria-label="Remove ${hbdEsc(n)}">✕</button></span>`).join('') || '<span class="dk-hint">None yet</span>'}</div><input class="dk-f" list="hbd-spl" data-hbdspadd placeholder="+ Add a spell…" aria-label="Add a spell">`;
}
// "Adds to another ability": only the general triggers here (the player's own features and spells aren't known on the desk).
function hbdRiderText(h) { const t = String((h && h.on) || ''); const g = HBD_RIDERS.find(x => x[0] === t); return g ? 'When ' + g[1].replace(/^I /, 'they ') : t.startsWith('name:') ? 'Adds to ' + t.slice(5) : ''; }
function hbdRiderTrigs() {
  const out = [['', 'Nothing — it doesn’t add to anything']].concat(HBD_RIDERS.map(([k, t]) => [k, 'Whenever ' + t.replace(/^I /, 'they ')]));
  const cur = hbdV('hb.on'); if (cur && !out.some(o => o[0] === cur)) out.push([cur, String(cur).replace(/^name:/, '')]);
  return out;
}
function hbdRiderFields() {
  const on = hbdV('hb.on'), P = 'hb.';
  let h = dF('When', dSel(P + 'on', hbdRiderTrigs(), { label: 'What it adds to' }), on ? '' : 'For things like “their melee hits also deal 1d6 fire”');
  if (on) {
    h += dRow(dF('Extra damage', dIn(P + 'onDmg', { ph: '1d8' }), 'Doubled on a critical hit'), dF('Damage type', dSel(P + 'onType', [['', '—']].concat(hbdTypes()), { label: 'Damage type' })));
    h += dRow(dF('Target makes a save', dSel(P + 'onSave', hbdAbOpts, { label: 'Save ability' })), hbdV(P + 'onSave') ? dF('Save DC', dIn(P + 'onDC', { ph: '8+prof+cha, spell or 15' })) : '');
    h += dRow(dF(hbdV(P + 'onSave') ? 'On a failed save' : 'Target condition', dSel(P + 'onCond', [['', '—']].concat(HBD_CONDS.map(c => [c, c])), { label: 'Condition' })), hbdV(P + 'onCond') ? dF('For how long', dIn(P + 'onCondDur', { ph: 'until the end of its next turn' })) : '');
    h += dRow(dF('Heals its user', dIn(P + 'onHeal', { ph: '1d6+cha' })), dF('Temp HP for its user', dIn(P + 'onTemp', { ph: 'prof' })));
    h += dF('Message', dIn(P + 'onMsg', { ph: 'A reminder of what else happens' }));
    h += dRow(dF('Each time it costs', dSel(P + 'onCost', [['', 'A charge (if it has charges)'], ['charge', 'A charge'], ['none', 'Nothing']], { label: 'Cost' })), dF('When it happens', dSeg(P + 'onAsk', [['', 'Ask each time'], ['false', 'Always']])));
    h += `<p class="dk-hint">On the player’s sheet it shows on that ability in Combat (“+ ${hbdEsc(HBD.d.name || 'this')}”), with a button to add it.</p>`;
  }
  return `<div>${h}</div>`;
}

// ----- Saving: the same item the sheet's builder makes -----
function hbdBuild() {
  const d = HBD.d, t = d._type; d.name = String(d.name || '').trim() || (t === 'weapon' ? 'Homebrew weapon' : 'Homebrew item');
  d.hbType = t; const h = d.hb;
  if (t === 'weapon') {
    const props = hbdCSV(d._props).map(x => x.toLowerCase()); if (d._kind === 'ranged' && d._loading) props.push('loading');
    const rng = d._kind === 'ranged' ? [d._rn, d._rl].filter(x => hbdN(x)).join('/') : props.includes('thrown') ? ((d.weapon || {}).range || '20/60') : '';
    d.weapon = Object.assign({}, d.weapon, { cat: d._cat || 'martial', kind: d._kind, dice: Math.max(1, hbdN(d._dn) || 1) + 'd' + (d._dd || '6'), type: d._dt || '', props, range: rng });
    if (!d.weapon.base) d.weapon.base = d.name;
    d.noEquip = !d._eqOnly; h.consume = false;
    d.atkAb = d._ab || 'str'; const mag = hbdN(d._mag);
    d.mods = Object.assign({}, d.mods || {}); if (mag) { d.mods.atk = mag; d.mods.dmg = mag; } else { delete d.mods.atk; delete d.mods.dmg; } if (!Object.keys(d.mods).length) delete d.mods;
  } else { delete d.weapon; delete d.noEquip; delete d.atkAb; h.consume = t === 'consumable'; }
  if (t !== 'weapon' && hbdN(d._uses) > 0) d.charges = { max: hbdN(d._uses), used: Math.min(hbdN((d.charges || {}).used), hbdN(d._uses)), reset: d._reset || 'long' }; else if (t !== 'weapon') delete d.charges;
  if (t === 'consumable') d.qty = Math.max(0, hbdN(d.qty) || (HBD.isNew ? 1 : 0));
  // A usable item needs something to show when used: its description (kept in step with it unless a reminder was written).
  if (t !== 'weapon' && (h.col || d.charges || h.consume) && (!String(h.text || '').trim() || h.textAuto)) { h.text = String(d.notes || '').trim().slice(0, 400) || 'You use ' + d.name + '.'; h.textAuto = 1; }
  if (t === 'weapon' && h.textAuto) { delete h.text; delete h.textAuto; }
  Object.keys(d).filter(k => k[0] === '_').forEach(k => delete d[k]);
  Object.keys(h).forEach(k => { if (h[k] === '' || h[k] == null || h[k] === false) delete h[k]; }); if (!Object.keys(h).length) delete d.hb;
  if (!(d.spells || []).length) delete d.spells;
  d.id = d.id || hbdUid();
  return d;
}
function hbdSave() {
  if (!HBD) return; const o = HBD.opts, it = hbdBuild(); HBD = null;
  if (HBD_ENV.closeModal) HBD_ENV.closeModal(true);
  if (o.onSave) o.onSave(it);
}

// ----- Wiring (caught before the desk's own handlers, so nothing here counts as a desk edit) -----
document.addEventListener('input', e => { const t = e.target; if (!HBD || !t.closest || !t.closest('#hbd')) return; e.stopPropagation();
  if (t.dataset.hbd != null && t.type !== 'checkbox' && t.tagName !== 'SELECT') hbdSet(HBD.d, t.dataset.hbd, t.value); }, true);
document.addEventListener('change', e => { const t = e.target; if (!HBD || !t.closest || !t.closest('#hbd')) return; e.stopPropagation();
  if (t.matches('[data-hbdadv]')) { HBD.adv = t.checked; return hbdPaint(); }
  if (t.matches('[data-hbdspadd]')) { const v = t.value.trim(), names = hbdSpellNames(), n = v && (names.find(x => x.toLowerCase() === v.toLowerCase()) || (names.length ? '' : v)); if (!n) { if (v && HBD_ENV.toast) HBD_ENV.toast({ title: 'Pick a spell from the list.', cls: 'bad' }); return; } HBD.d.spells = (HBD.d.spells || []).filter(x => x !== n).concat([n]); return hbdPaint(); }
  if (t.dataset.hbd == null) return;
  hbdSet(HBD.d, t.dataset.hbd, t.type === 'checkbox' ? t.checked : t.value);
  if (t.tagName === 'SELECT' || t.type === 'checkbox' || /^_uses$/.test(t.dataset.hbd)) hbdPaint(); }, true);
document.addEventListener('click', e => { if (!HBD) return; const b = e.target.closest && e.target.closest('#hbd [data-hbdseg], #hbd [data-hbdchip], #hbd [data-hbdsec], #hbd [data-hbdspdel], #hbd [data-hbdsave]'); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  if (b.dataset.hbdseg) { hbdSet(HBD.d, b.dataset.hbdseg, b.dataset.v); return hbdPaint(); }
  if (b.dataset.hbdchip) { const p = b.dataset.hbdchip, v = b.dataset.v, have = hbdCSV(hbdV(p) || ''), on = have.some(x => x.toLowerCase() === v.toLowerCase()); hbdSet(HBD.d, p, (on ? have.filter(x => x.toLowerCase() !== v.toLowerCase()) : have.concat([v.toLowerCase()])).join(', ')); return hbdPaint(); }
  if (b.dataset.hbdsec) { HBD.sec[b.dataset.hbdsec] = !HBD.sec[b.dataset.hbdsec]; return hbdPaint(); }
  if (b.dataset.hbdspdel != null) { (HBD.d.spells || []).splice(hbdN(b.dataset.hbdspdel), 1); return hbdPaint(); }
  if (b.hasAttribute('data-hbdsave')) hbdSave();
}, true);
// Enter in a one-line field doesn't set off any of the desk's own shortcuts.
document.addEventListener('keydown', e => { if (!HBD || e.key !== 'Enter' || !e.target.closest || !e.target.closest('#hbd')) return; const t = e.target;
  if (t.tagName === 'INPUT' && t.type !== 'checkbox') { e.preventDefault(); e.stopPropagation(); if (t.matches('[data-hbdspadd]')) t.dispatchEvent(new Event('change', { bubbles: true })); } }, true);
const pgHbd = { init: env => { Object.assign(HBD_ENV, env || {}); }, open: hbdOpen, build: hbdBuild };
if (typeof window !== 'undefined') window.pgHbd = pgHbd;
