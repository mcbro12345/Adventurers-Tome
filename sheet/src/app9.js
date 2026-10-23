// ---------- Artificer infusions (their own tab) ----------
// Known infusions live in S.picks.infusion (one entry per infusion). Replicate Magic Item can be learned many
// times; the items it can make are S.infReplicas (each one counts as a known infusion). An infused inventory item
// carries it.infusion = { name, rep?, choice?, at, created?, prev? }. Effects are computed live from that marker.
const INF = {
  'Enhanced Arcane Focus': { item: 'Rod, staff or wand (a focus)', attune: true, ok: it => /\b(rod|staff|wand|focus|orb|crystal|rifle|firearm)\b/i.test(it.name + ' ' + (it.notes || '')) || STORE_FOCUS.test(it.name || ''), eff: L => ({ spellAtk: L >= 10 ? 2 : 1, note: 'ignores half cover with spell attacks' }) },
  'Enhanced Defense': { item: 'Armor or a shield', ok: it => !!it.armor, eff: L => ({ ac: L >= 10 ? 2 : 1 }) },
  'Enhanced Weapon': { item: 'Simple or martial weapon', ok: it => !!it.weapon, eff: L => ({ atk: L >= 10 ? 2 : 1, dmg: L >= 10 ? 2 : 1 }) },
  'Homunculus Servant': { item: 'Gem or crystal worth 100 gp+', ok: it => /gem|crystal|jewel|diamond|ruby|sapphire|emerald|pearl/i.test(it.name), companion: 'Homunculus Servant' },
  'Mind Sharpener': { item: 'Armor or robes', ok: it => !!it.armor && it.armor.type !== 'shield' || /robe/i.test(it.name), charges: [4, '1d4'], act: { col: 'reaction', name: 'Mind Sharpener', text: 'When you fail a Constitution save to keep concentration, spend 1 charge to succeed instead.' } },
  'Repeating Shot': { item: 'Weapon with the ammunition property', attune: true, ok: it => !!it.weapon && (it.weapon.props || []).some(p => /ammunition/i.test(p)), eff: () => ({ atk: 1, dmg: 1, ranged: true, note: 'ignores loading; makes its own ammunition' }) },
  'Returning Weapon': { item: 'Weapon with the thrown property', ok: it => !!it.weapon && (it.weapon.props || []).some(p => /thrown/i.test(p)), eff: () => ({ atk: 1, dmg: 1, ranged: true, note: 'flies back to your hand after a ranged attack' }) },
  'Replicate Magic Item': { item: 'Depends on the item', rep: true },
  'Boots of the Winding Path': { lv: 6, item: 'A pair of boots', attune: true, ok: it => /boot|shoe|slipper/i.test(it.name), act: { col: 'bonus', name: 'Winding Path', text: 'Teleport up to 15 ft to an unoccupied space you can see that you occupied at some point during the current turn.' } },
  'Radiant Weapon': { lv: 6, item: 'Simple or martial weapon', attune: true, ok: it => !!it.weapon, charges: [4, '1d4'], eff: () => ({ atk: 1, dmg: 1, note: 'bright light 30 ft (command word on/off)' }), act: { col: 'reaction', name: 'Radiant flash', text: 'When a creature hits you with an attack, spend 1 charge: the attacker makes a CON save against your spell save DC or is blinded until the end of its next turn.' } },
  'Repulsion Shield': { lv: 6, item: 'A shield', attune: true, ok: it => !!it.armor && it.armor.type === 'shield', charges: [4, '1d4'], eff: () => ({ ac: 1 }), act: { col: 'reaction', name: 'Repulse', text: 'When a creature hits you with a melee attack, spend 1 charge to push it up to 15 ft away from you.' } },
  'Resistant Armor': { lv: 6, item: 'A suit of armor', attune: true, ok: it => !!it.armor && it.armor.type !== 'shield', choose: ['acid', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'poison', 'psychic', 'radiant', 'thunder'], eff: (L, c) => ({ resist: c || '' }) },
  'Spell-Refueling Ring': { lv: 6, item: 'A ring', attune: true, ok: it => /ring/i.test(it.name), charges: [1, 'dawn'], act: { col: 'action', name: 'Refuel a slot', text: 'Recover one expended spell slot of 3rd level or lower. Once per dawn.', refuel: true } },
  'Armor of Magical Strength': { lv: 10, item: 'A suit of armor', attune: true, ok: it => !!it.armor && it.armor.type !== 'shield', charges: [6, '1d6'], act: { col: 'reaction', name: 'Magical Strength', text: 'Spend 1 charge: add your INT modifier to a STR check or save you make (no action), or use your reaction to avoid being knocked prone.' } },
  'Helm of Awareness': { lv: 10, item: 'A helmet', attune: true, ok: it => /helm|hat|cap|crown|circlet|goggles|headband/i.test(it.name), eff: () => ({ initAdv: true, note: "advantage on initiative; can't be surprised unless incapacitated" }) },
  'Arcane Propulsion Armor': { lv: 14, item: 'A suit of armor', attune: true, ok: it => !!it.armor && it.armor.type !== 'shield', eff: () => ({ speed: 5, note: 'force gauntlets: 1d8 force melee weapon attacks (thrown 20/60, return); can\'t be removed against your will; replaces missing limbs' }) }
};
// TCE's Replicable Magic Items by the artificer level that unlocks them ([name, needs attunement]).
const REPLIC = {
  2: [['Alchemy Jug', 0], ['Bag of Holding', 0], ['Cap of Water Breathing', 0], ['Goggles of Night', 0], ['Rope of Climbing', 0], ['Sending Stones', 0], ['Wand of Magic Detection', 0], ['Wand of Secrets', 0]],
  6: [['Boots of Elvenkind', 0], ['Cloak of Elvenkind', 1], ['Cloak of the Manta Ray', 0], ['Eyes of Charming', 1], ['Gloves of Thievery', 0], ['Lantern of Revealing', 0], ['Pipes of Haunting', 0], ['Ring of Water Walking', 0]],
  10: [['Boots of Striding and Springing', 1], ['Boots of the Winterlands', 1], ['Bracers of Archery', 1], ['Brooch of Shielding', 1], ['Cloak of Protection', 1], ['Eyes of the Eagle', 1], ['Gauntlets of Ogre Power', 1], ['Gloves of Missile Snaring', 1], ['Gloves of Swimming and Climbing', 1], ['Hat of Disguise', 1], ['Headband of Intellect', 1], ['Helm of Telepathy', 1], ['Medallion of Thoughts', 1], ['Necklace of Adaptation', 1], ['Periapt of Wound Closure', 1], ['Pipes of the Sewers', 1], ['Quiver of Ehlonna', 0], ['Ring of Jumping', 1], ['Ring of Mind Shielding', 1], ['Slippers of Spider Climbing', 1], ['Ventilating Lungs', 1], ['Winged Boots', 1]],
  14: [['Amulet of Health', 1], ['Arcane Propulsion Arm', 1], ['Belt of Hill Giant Strength', 1], ['Boots of Levitation', 1], ['Boots of Speed', 1], ['Bracers of Defense', 1], ['Cloak of the Bat', 1], ['Dimensional Shackles', 0], ['Gem of Seeing', 1], ['Horn of Blasting', 0], ['Ring of Free Action', 1], ['Ring of Protection', 1], ['Ring of the Ram', 1]]
};
const repLevel = n => +(Object.keys(REPLIC).find(L => REPLIC[L].some(r => r[0] === n)) || 2);
const repAttune = n => { for (const L in REPLIC) { const r = REPLIC[L].find(x => x[0] === n); if (r) return !!r[1]; } const m = DND.magic.find(x => x[0] === n); return !!(m && m[4]); };
const artLv = () => clsLv('artificer');
const ordn = n => (n = N(n)) + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th');
const infKnownMax = L => L >= 18 ? 12 : L >= 14 ? 10 : L >= 10 ? 8 : L >= 6 ? 6 : L >= 2 ? 4 : 0;
const infActiveMax = L => L >= 18 ? 6 : L >= 14 ? 5 : L >= 10 ? 4 : L >= 6 ? 3 : L >= 2 ? 2 : 0;
const infKnown = () => (S.picks.infusion || []).filter(n => n !== 'Replicate Magic Item');
const infReplicas = () => S.infReplicas || [];
const infKnownCount = () => infKnown().length + ((S.picks.infusion || []).includes('Replicate Magic Item') ? Math.max(1, infReplicas().length) : 0);
const infItems = () => S.inventory.map((it, i) => [it, i]).filter(([it]) => it.infusion && it.infusion.name);
// Containers (S.bags) can hold an infusion too — e.g. a hat replicated into a Bag of Holding.
const infBags = () => (S.bags || []).map((b, i) => [b, i]).filter(([b]) => b.infusion && b.infusion.name);
const infAllActive = () => infItems().map(([o, i]) => ({ o, i, bag: false })).concat(infBags().map(([o, i]) => ({ o, i, bag: true }))).sort((a, b) => N(a.o.infusion.at) - N(b.o.infusion.at));
function infEndAny(x) { if (x.bag) delete x.o.infusion; else infEndItem(x.o); }
const infLabel = inf => inf.name === 'Replicate Magic Item' ? 'Replicate: ' + (inf.rep || 'magic item') : inf.name;
const infDef = inf => INF[inf && inf.name] || {};
function infEffect(it) {
  const d = infDef(it.infusion); if (!d.eff) return {};
  return d.eff(artLv(), it.infusion.choice) || {};
}
// Is the infused item doing its thing right now? (worn/held, and attuned when the infusion needs it)
const infOn = it => hbItemOn(it) && (!infDef(it.infusion).attune || !!it.attuned);
// Hooks used by the rules engine.
function infSum(k) { return infItems().reduce((t, [it]) => t + (infOn(it) ? N(infEffect(it)[k]) : 0), 0); }
function infWeapon(fit, a, k) { if (!fit || !fit.infusion || !infOn(fit)) return 0; const e = infEffect(fit); if (e.ranged && a && a.kind !== 'ranged') return 0; return N(e[k]); }
function infPassives() {
  const out = [];
  infItems().forEach(([it]) => { if (!infOn(it)) return; const e = infEffect(it), src = it.name + ' (' + infLabel(it.infusion) + ')';
    const p = { src, item: true };
    if (e.ac) p.ac = e.ac; if (e.resist) p.resist = [e.resist]; if (e.speed) p.speed = e.speed; if (e.initAdv) { p.initAdv = true; p.advNote = ['Initiative (and you can\'t be surprised)']; }
    if (Object.keys(p).length > 2) out.push(p); });
  return out;
}
// Combat: infusions that take an action, bonus action or reaction.
function infActs(col) { return infItems().filter(([it]) => { const d = infDef(it.infusion); return d.act && d.act.col === col && infOn(it); }); }

// ---------- The tab ----------
function renderInfusions() {
  const el = $('#page-infusions'); if (!el) return;
  const L = artLv();
  if (L < 2) { el.innerHTML = `<div class="panel"><h2>Infusions</h2><p class="hint" style="margin:0">Infusions come with the artificer's Infuse Item feature at 2nd level.</p></div>`; return; }
  const kMax = infKnownMax(L), aMax = infActiveMax(L), act = infItems().sort((a, b) => N(a[0].infusion.at) - N(b[0].infusion.at)), bags = infBags(), nAct = act.length + bags.length, kn = infKnownCount();
  const pips = (n, m, cls) => Array.from({ length: m }, (_, j) => `<span class="ipip ${cls}${j < n ? ' on' : ''}"></span>`).join('');
  const att = S.inventory.filter(it => it.attune && it.attuned).length, attMax = typeof attuneMax === 'function' ? attuneMax() : 3;
  const head = `<div class="panel inf-head" ${PID('infhead')}><h2><span class="grow">Infusions</span><button class="btn sm" data-act="inflearn">Learn / swap infusions</button></h2>
    <div class="inf-stats">
      <div class="inf-stat"><small>Infusions known</small><b class="${kn > kMax ? 'over' : ''}">${kn} / ${kMax}</b><div class="ipips">${pips(kn, Math.max(kMax, kn), 'k')}</div></div>
      <div class="inf-stat"><small>Infused items</small><b class="${nAct > aMax ? 'over' : ''}">${nAct} / ${aMax}</b><div class="ipips">${pips(nAct, Math.max(aMax, nAct), 'a')}</div></div>
      <div class="inf-stat"><small>Attuned</small><b>${att} / ${attMax}</b><div class="hint">${L >= 18 ? 'Magic Item Master' : L >= 14 ? 'Magic Item Savant' : L >= 10 ? 'Magic Item Adept' : 'Normal limit'}</div></div>
      <div class="inf-stat"><small>Artificer level</small><b>${L}</b><div class="hint">${L >= 10 ? '+2' : '+1'} on enhancement infusions</div></div>
    </div>
    <details class="inf-rules"><summary>How infusing works</summary><ul>
      <li>When you finish a long rest you can touch nonmagical objects and infuse them with infusions you know. The object becomes a magic item.</li>
      <li>Each infusion can be in only one object at a time (each Replicate item counts on its own). You can have up to ${aMax} infused items at once; infusing another ends the oldest.</li>
      <li>An infusion lasts indefinitely. If you die, it fades after a number of days equal to your INT modifier (minimum 1). It also ends if you swap that infusion out when you level up.</li>
      <li>When you gain an artificer level you can replace one infusion you know with another.</li>
      <li>Infusions that need attunement only work once the wearer attunes (that uses an attunement slot).</li></ul></details></div>`;
  // Active
  const actCards = act.map(([it, i]) => {
    const d = infDef(it.infusion), e = infEffect(it), on = infOn(it), ch = it.charges && it.infusion.charges ? it.charges : null;
    const bits = [e.spellAtk ? `+${e.spellAtk} spell attack rolls` : '', e.atk ? `+${e.atk} attack & damage${e.ranged ? ' (ranged)' : ''}` : '', e.ac ? `+${e.ac} AC` : '', e.resist ? `Resistance to ${e.resist}` : e.resist === '' && d.choose ? 'Pick a damage type' : '', e.speed ? `+${e.speed} ft speed` : '', e.note || ''].filter(Boolean);
    const warn = !it.equipped && !it.carried ? 'Not equipped — effect off' : d.attune && !it.attuned ? 'Needs attunement — effect off' : '';
    return `<div class="inf-card active${on ? '' : ' off'}"><div class="inf-ch"><span class="inf-dot"></span><div class="grow"><b>${esc(it.name)}</b><div class="hint">${esc(infLabel(it.infusion))}</div></div>
        <button class="btn sm ghost" data-act="infend" data-i="${i}" title="End this infusion">End</button></div>
      ${bits.length ? `<div class="inf-eff">${bits.map(b => `<span class="ichip">${esc(b)}</span>`).join('')}</div>` : ''}
      ${d.choose ? `<label class="inf-choose">Resistance <select class="f" data-infchoice="${i}">${['<option value="">— choose —</option>'].concat(d.choose.map(c => `<option${it.infusion.choice === c ? ' selected' : ''}>${c}</option>`)).join('')}</select></label>` : ''}
      ${ch ? `<div class="inf-charges"><span class="hint">Charges</span><span class="pips" data-calc-html="infpips:${i}"></span><span class="hint">${Math.max(0, N(ch.max) - N(ch.used))}/${N(ch.max)}${d.charges[1] === 'dawn' ? ' · back at dawn' : ' · regains ' + d.charges[1] + ' at dawn'}</span></div>` : ''}
      ${d.act ? `<div class="inf-act"><button class="btn sm gold" data-act="infuse-use" data-i="${i}" ${on && (!ch || N(ch.used) < N(ch.max)) ? '' : 'disabled'}>${esc(d.act.name)}</button><span class="hint">${d.act.col === 'bonus' ? 'Bonus action' : d.act.col === 'reaction' ? 'Reaction' : 'Action'} — ${esc(d.act.text)}</span></div>` : ''}
      ${d.companion ? `<div class="hint">The homunculus is on the Creatures tab.</div>` : ''}
      ${warn ? `<div class="inf-warn">${esc(warn)}${d.attune && !it.attuned && (it.equipped || it.carried) ? ` <button class="btn sm" data-act="attune" data-i="${i}">Attune</button>` : !it.equipped ? ` <button class="btn sm" data-act="infequip" data-i="${i}">Equip</button>` : ''}</div>` : ''}
    </div>`;
  }).join('');
  const bagCards = bags.map(([b, i]) => `<div class="inf-card active"><div class="inf-ch"><span class="inf-dot"></span><div class="grow"><b>${esc(b.name)}</b><div class="hint">${esc(infLabel(b.infusion))} · container</div></div><button class="btn sm ghost" data-act="infendbag" data-i="${i}" title="End this infusion">End</button></div><div class="inf-eff"><span class="ichip">Holds ${N(b.cap) || 500} lb${b.weightless ? ', weighs a fixed ' + (N(b.weight) || 15) + ' lb' : ''}</span></div><div class="hint">Its contents are on the Inventory tab. If the infusion ends, everything inside appears around it.</div></div>`).join('');
  const activePanel = `<div class="panel" ${PID('infactive')}><h2><span class="grow">Infused items</span><span class="hint">${nAct} of ${aMax}</span></h2>
    ${nAct ? `<div class="inf-grid">${actCards}${bagCards}</div>` : '<p class="hint" style="margin:0">Nothing infused right now. Pick an infusion below and choose an item.</p>'}</div>`;
  // Known
  const knownList = infKnown().map(n => ({ name: n })).concat((S.picks.infusion || []).includes('Replicate Magic Item') ? (infReplicas().length ? infReplicas().map(r => ({ name: 'Replicate Magic Item', rep: r })) : [{ name: 'Replicate Magic Item', rep: '' }]) : []);
  const knownCards = knownList.map(k => {
    const d = INF[k.name] || {}, on = act.concat(bags).find(([it]) => it.infusion.name === k.name && (k.name !== 'Replicate Magic Item' || it.infusion.rep === k.rep));
    const lv = k.rep ? repLevel(k.rep) : d.lv || 2, needAtt = k.rep ? repAttune(k.rep) : !!d.attune;
    const txt = k.rep ? (DND.full['item:' + k.rep] || (DND.magic.find(m => m[0] === k.rep) || [])[5] || '') : (DND.full['pick:infusion:' + k.name] || '');
    const key = 'inf:' + k.name + ':' + (k.rep || '');
    return `<div class="inf-card${on ? ' is-on' : ''}"><div class="inf-ch"><div class="grow"><b>${esc(k.rep ? k.rep : k.name)}</b><div class="hint">${k.rep ? 'Replicate Magic Item · ' : ''}${esc(k.rep ? 'Magic item' : d.item || '')}</div></div>
        ${on ? `<span class="ichip on">On ${esc(on[0].name)}</span>` : `<button class="btn sm gold" data-act="infpick" data-n="${esc(k.name)}" data-r="${esc(k.rep || '')}" ${k.name === 'Replicate Magic Item' && !k.rep ? 'disabled title="Choose which item first (Learn / swap)"' : ''}>Infuse…</button>`}</div>
      <div class="inf-tags"><span class="itag">${ordn(lv)}-level+</span><span class="itag${needAtt ? ' att' : ''}">${needAtt ? 'Requires attunement' : 'No attunement'}</span>${d.charges ? `<span class="itag">${d.charges[1] === 'dawn' ? 'Once per dawn' : d.charges[0] + ' charges'}</span>` : ''}${d.act ? `<span class="itag">${d.act.col === 'bonus' ? 'Bonus action' : d.act.col === 'reaction' ? 'Reaction' : 'Action'}</span>` : ''}</div>
      ${txt ? `<div class="inf-txt${UI.open[key] ? ' open' : ''}" data-act="toggle" data-key="${esc(key)}">${fullHTML(txt)}</div>` : ''}
    </div>`;
  }).join('');
  const knownPanel = `<div class="panel" ${PID('infknown')}><h2><span class="grow">Known infusions</span><span class="hint">${kn} of ${kMax}</span></h2>
    ${knownList.length ? `<div class="inf-grid">${knownCards}</div>` : '<p class="hint" style="margin:0">You don\'t know any infusions yet — use Learn / swap infusions.</p>'}</div>`;
  el.innerHTML = head + activePanel + knownPanel;
}
// ---------- Learn / swap ----------
// One list of what you know (every replicated item is its own entry), and a catalog to add from.
let INFL = { q: '', rq: '', rep: false };
function openInfLearn() { INFL = { q: '', rq: '', rep: false }; openModal('<div id="infl"></div>', null, true); $('#modal-body').classList.add('xwide'); renderInfLearn(); }
function infSetKnown(names, reps) { S.picks = Object.assign({}, S.picks, { infusion: [...new Set(names)] }); S.infReplicas = [...new Set(reps)]; }
function infAdd(n) { const k = (S.picks.infusion || []).slice(); if (!k.includes(n)) k.push(n); infSetKnown(k, infReplicas()); infLearnSaved('Learn ' + n); }
function infAddRep(r) { r = String(r || '').trim(); if (!r) return; const k = (S.picks.infusion || []).slice(); if (!k.includes('Replicate Magic Item')) k.push('Replicate Magic Item'); infSetKnown(k, infReplicas().concat([r])); infLearnSaved('Learn Replicate: ' + r); }
function infRemove(n, r) {
  let k = (S.picks.infusion || []).slice(), reps = infReplicas().slice();
  if (r) { reps = reps.filter(x => x !== r); infAllActive().forEach(x => { if (x.o.infusion.name === 'Replicate Magic Item' && x.o.infusion.rep === r) infEndAny(x); }); if (!reps.length) k = k.filter(x => x !== 'Replicate Magic Item'); }
  else { k = k.filter(x => x !== n); if (n === 'Replicate Magic Item') reps = []; infAllActive().forEach(x => { if (x.o.infusion.name === n) infEndAny(x); }); }
  infSetKnown(k, reps); infLearnSaved('Forget ' + (r ? 'Replicate: ' + r : n));
}
function infLearnSaved(lbl) { pendingLabel = lbl; save(); rebuildAuto(); render(); renderInfLearn(); }
function renderInfLearn() {
  const box = $('#infl'); if (!box) return;
  const L = artLv(), kMax = infKnownMax(L), kn = infKnownCount(), known = new Set(S.picks.infusion || []), reps = infReplicas();
  const tag = (lv, att) => `<span class="itag">${ordn(lv)}+</span>${att ? '<span class="itag att">attunement</span>' : ''}`;
  const mine = infKnown().map(n => ({ n, lv: (INF[n] || {}).lv || 2, att: !!(INF[n] || {}).attune, label: n, sub: (INF[n] || {}).item || '' }))
    .concat(reps.map(r => ({ n: 'Replicate Magic Item', r, lv: repLevel(r), att: repAttune(r), label: r, sub: 'Replicate Magic Item' })))
    .concat(known.has('Replicate Magic Item') && !reps.length ? [{ n: 'Replicate Magic Item', r: '', lv: 2, att: false, label: 'Replicate Magic Item', sub: 'No item chosen yet' }] : []);
  const q = INFL.q.toLowerCase(), rq = INFL.rq.toLowerCase();
  const avail = Object.keys(INF).filter(n => n !== 'Replicate Magic Item' && !known.has(n) && (!q || n.toLowerCase().includes(q)));
  const repAll = Object.keys(REPLIC).flatMap(Lv => REPLIC[Lv].map(([n, a]) => ({ n, a, Lv: +Lv }))).filter(x => !rq || x.n.toLowerCase().includes(rq));
  box.innerHTML = `<div class="infl-h"><h3 style="margin:0">Your infusions</h3><span class="infl-ct${kn > kMax ? ' over' : ''}"><b>${kn}</b> of ${kMax} known</span></div>
    <p class="hint" style="margin:4px 0 10px">Every item you can replicate counts as one infusion. When you gain an artificer level you can swap one infusion for another; forgetting one ends it on its item.</p>
    <div class="infl-mine">${mine.map(m => `<div class="infl-row mine"><div class="grow"><b>${esc(m.label)}</b> <span class="hint">${esc(m.sub)}</span></div>${tag(m.lv, m.att)}<button class="icon-btn" data-act="infrem" data-n="${esc(m.n)}" data-r="${esc(m.r || '')}" title="Forget" aria-label="Forget ${esc(m.label)}">✕</button></div>`).join('') || '<p class="hint">None yet.</p>'}</div>
    <div class="infl-cols">
      <div><div class="infl-sub"><b>Add an infusion</b><input class="f" data-infq placeholder="Search…" value="${esc(INFL.q)}"></div>
        ${avail.map(n => { const d = INF[n], lock = (d.lv || 2) > L; return `<div class="infl-row${lock ? ' locked' : ''}"><div class="grow"><b>${esc(n)}</b> <span class="hint">${esc(d.item)}</span><div class="hint">${esc(((DND.options.infusion.list.find(x => x[0] === n) || [])[1]) || '')}</div></div>${tag(d.lv || 2, d.attune)}<button class="notetip" type="button" data-tipkind="full" data-full="${esc('pick:infusion:' + n)}" aria-label="What ${esc(n)} does">ⓘ</button><button class="btn sm gold" data-act="infadd" data-n="${esc(n)}" ${lock ? 'disabled title="Needs a higher artificer level"' : ''}>Add</button></div>`; }).join('') || '<p class="hint">You know every infusion that matches.</p>'}</div>
      <div><div class="infl-sub"><b>Replicate a magic item</b><input class="f" data-infrq placeholder="Search items…" value="${esc(INFL.rq)}"></div>
        <p class="hint" style="margin:0 0 6px">Learn Replicate Magic Item again for each item you want to be able to make.</p>
        ${Object.keys(REPLIC).map(Lv => { const list = repAll.filter(x => x.Lv === +Lv); return list.length ? `<div class="infl-lv">${ordn(Lv)} level${+Lv > L ? ' — locked' : ''}</div>` + list.map(x => { const have = reps.includes(x.n), lock = x.Lv > L; return `<div class="infl-row${lock ? ' locked' : ''}"><div class="grow"><b>${esc(x.n)}</b>${x.a ? ' <span class="hint">attunement</span>' : ''}</div><button class="notetip" type="button" data-tipkind="full" data-full="${esc('item:' + x.n)}" aria-label="What ${esc(x.n)} does">ⓘ</button>${have ? '<span class="ichip on">Known</span>' : `<button class="btn sm" data-act="infaddrep" data-r="${esc(x.n)}" ${lock ? 'disabled' : ''}>Add</button>`}</div>`; }).join('') : ''; }).join('')}
        <div class="infl-lv">Something else (DM approved)</div><div class="row"><input class="f" id="infRepOther" placeholder="Common or uncommon magic item"><button class="btn sm" data-act="infrepadd">Add</button></div></div>
    </div>
    <div class="actions"><button class="btn gold" data-act="close">Done</button></div>`;
}
document.addEventListener('input', e => { const t = e.target; if (!t.dataset) return; if (t.dataset.infq !== undefined || t.dataset.infrq !== undefined) { const k = t.dataset.infq !== undefined ? 'q' : 'rq', pos = t.selectionStart; INFL[k] = t.value; renderInfLearn(); const n = $(k === 'q' ? '[data-infq]' : '[data-infrq]'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (er) {} } } });
// ---------- Infuse an item ----------
let INFPICK = null;
function openInfPick(name, rep, all) {
  const d = INF[name] || {}; INFPICK = { name, rep };
  const cands = S.inventory.map((it, i) => [it, i]).filter(([it]) => !it.infusion && !(it.magic && !it.infusion) && (all || rep || !d.ok || d.ok(it)));
  const L = artLv(), aMax = infActiveMax(L), all2 = infAllActive();
  const full = all2.length >= aMax ? all2[0].o : null;
  openModal(`<h3>Infuse: ${esc(rep || name)}</h3>
    <p class="hint" style="margin:0 0 8px">${rep ? `Turn a nonmagical object into a <b>${esc(rep)}</b>${repAttune(rep) ? ' (requires attunement)' : ''}.` : `Target: ${esc(d.item || 'an object')}${d.attune ? ' · requires attunement' : ''}.`} Infusing happens when you finish a long rest.</p>
    ${full ? `<p class="inf-warn" style="margin:0 0 8px">You already have ${aMax} infused items — this ends the oldest: <b>${esc(full.name)}</b> (${esc(infLabel(full.infusion))}).</p>` : ''}
    ${d.choose ? fld('Resistance to', `<select class="f" id="infChoice">${d.choose.map(c => `<option>${c}</option>`).join('')}</select>`) : ''}
    <div class="lbl">Choose an item you carry</div>
    <div class="crlist">${cands.map(([it, i]) => `<button class="crrow sel" data-act="infgo" data-i="${i}"><div><b>${esc(it.name)}</b> <span class="hint">${it.weapon ? 'Weapon' : it.armor ? (it.armor.type === 'shield' ? 'Shield' : 'Armor') : 'Item'}${it.equipped ? ' · equipped' : ''}</span></div></button>`).join('') || '<p class="hint">No matching nonmagical items — create one below, or show every item.</p>'}</div>
    <div class="row" style="margin-top:8px"><input class="f" id="infNewName" placeholder="${esc(rep || (d.item || 'Item').replace(/^(A|An) /i, '').replace(/^pair of /i, ''))}"><button class="btn sm" data-act="infgo" data-i="-1">Create it</button>${!all && !rep && d.ok ? `<button class="btn sm ghost" data-act="infpickall">Show every item</button>` : ''}</div>
    <div class="actions"><button class="btn" data-act="close">Cancel</button></div>`);
}
function infGo(i) {
  const P = INFPICK; if (!P) return; const d = INF[P.name] || {};
  let it = i >= 0 ? S.inventory[i] : null;
  if (!it) { const nm = (($('#infNewName') || {}).value || '').trim() || P.rep || P.name; const m = P.rep && DND.magic.find(x => x[0] === P.rep);
    it = m ? makeMagicItem(m) : { id: uid(), name: nm, qty: 1, weight: 0, cost: '', equipped: false, notes: '' }; if (m && nm !== P.rep) it.name = nm; addInventoryItem(it, true); }
  const aMax = infActiveMax(artLv());
  // The same infusion can only be in one item.
  infAllActive().forEach(x => { if (x.o !== it && x.o.infusion.name === P.name && (P.name !== 'Replicate Magic Item' || x.o.infusion.rep === P.rep)) infEndAny(x); });
  const still = infAllActive(); if (still.length >= aMax) infEndAny(still[0]);
  const prev = { attune: it.attune, attuned: it.attuned, charges: it.charges ? JSON.parse(JSON.stringify(it.charges)) : null, magic: it.magic || null, summary: it.summary || '' };
  it.infusion = { name: P.name, rep: P.rep || '', at: Date.now(), prev, created: i < 0, choice: d.choose ? (($('#infChoice') || {}).value || '') : '' };
  const needAtt = P.rep ? repAttune(P.rep) : !!d.attune; if (needAtt) { it.attune = true; it.attuned = !!prev.attuned && !!prev.attune; }
  if (d.charges) { it.charges = { max: d.charges[0], used: 0, reset: 'long' }; it.infusion.charges = true; }
  if (!it.magic) it.magic = { rarity: P.rep ? ((DND.magic.find(x => x[0] === P.rep) || [])[3] || 'uncommon') : 'uncommon', type: 'infusion', src: 'TCE', name: P.rep || '' };
  if (!it.summary) it.summary = P.rep ? ((DND.magic.find(x => x[0] === P.rep) || [])[5] || '') : ((DND.options.infusion.list.find(x => x[0] === P.name) || [])[1] || '');
  pendingLabel = 'Infuse ' + it.name; closeModal(true); save(); render();
  toast(`<b>${esc(it.name)}</b> is infused with ${esc(P.rep || P.name)}.${needAtt && !it.attuned ? ' Attune to it to turn it on.' : ''}`, '', 7000, { label: 'Undo', fn: () => undo(1) });
}
function infEndItem(it) {
  const inf = it.infusion; if (!inf) return;
  if (inf.created && inf.name === 'Replicate Magic Item') { const k = S.inventory.indexOf(it); if (k >= 0) { S.inventory.splice(k, 1); S.attacks = S.attacks.filter(a => a.item !== it.id); } return; }
  const p = inf.prev;
  if (p) { it.attune = p.attune; it.attuned = p.attuned; if (inf.charges) { if (p.charges) it.charges = p.charges; else delete it.charges; } if (!p.magic && it.magic && it.magic.type === 'infusion') delete it.magic; if (p.summary !== undefined) it.summary = p.summary; }
  delete it.infusion;
}
function infEnd(i) {
  const it = S.inventory[i]; if (!it || !it.infusion) return;
  const nm = it.name, gone = it.infusion.created && it.infusion.name === 'Replicate Magic Item';
  infEndItem(it); pendingLabel = 'End infusion: ' + nm; save(); render();
  toast(`The infusion on <b>${esc(nm)}</b> ended${gone ? ' and the item is gone (anything inside appears around where it was)' : ''}.`, '', 7000, { label: 'Undo', fn: () => undo(1) });
}
function infUse(i, col) {
  const it = S.inventory[i]; if (!it || !it.infusion) return; const d = infDef(it.infusion); if (!d.act) return;
  if (it.charges && it.infusion.charges) { if (N(it.charges.used) >= N(it.charges.max)) { toast('No charges left — they come back at dawn.', 'fumble'); return; } it.charges.used = N(it.charges.used) + 1; }
  if (d.act.refuel) { const lv = [0, 1, 2].filter(k => slotMax(k) > 0 && slotsLeft(k) < slotMax(k)); if (!lv.length) { if (it.charges) it.charges.used = Math.max(0, N(it.charges.used) - 1); toast('You have no spent slots of 3rd level or lower.', 'fumble'); return; }
    const k = Math.max(...lv); S.slotsUsed[k] = Math.max(0, N(S.slotsUsed[k]) - 1); toast(`<b>Spell-Refueling Ring</b>: recovered a ${ORD[k]}-level slot.`, '', 6000, { label: 'Undo', fn: () => undo(1) }); }
  else toast(`<b>${esc(d.act.name)}</b> — ${esc(d.act.text)}`, '', 8000, { label: 'Undo', fn: () => undo(1) });
  const c = col || d.act.col; if (c && c !== 'free' && S.turn && S.turn.used) S.turn.used[c] = true;
  pendingLabel = d.act.name + ' (' + it.name + ')'; save(); render();
}
// Infusion actions for the Combat columns.
function infCombatRows(col) {
  return infActs(col).map(([it, i]) => { const d = infDef(it.infusion), ch = it.charges && it.infusion.charges ? it.charges : null;
    return `<div class="opt"><div class="opt-head"><span class="opt-name">${esc(d.act.name)}</span>${ch ? `<span class="tag">${Math.max(0, N(ch.max) - N(ch.used))}/${N(ch.max)}</span>` : ''}<button class="btn sm" data-act="infuse-use" data-i="${i}" data-col="${col}" ${ch && N(ch.used) >= N(ch.max) ? 'disabled' : ''}>Use</button></div><div class="opt-info">${esc(it.name)} · ${esc(infLabel(it.infusion))}</div><div class="opt-text">${esc(d.act.text)}</div></div>`; });
}

// ---------- Creatures: one card design for the Creatures tab and (compact) the Combat tab ----------
// An action is [name, toHit, dice, notes, kind?, saveAbility?, dc?]. kind: attack | save | temp | heal | roll.
const ABL = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
function actKind(a) { const t = (a[0] || '') + ' ' + (a[3] || ''); return a[4] || (/temp(orary)? ?hp/i.test(t) ? 'temp' : /\bheal/i.test(t) ? 'heal' : (a[1] === '' || a[1] == null) ? (/save/i.test(t) ? 'save' : 'roll') : 'attack'); }
function actSave(a) { const t = (a[0] || '') + ' ' + (a[3] || ''); return a[5] || ((t.match(/\b(STR|DEX|CON|INT|WIS|CHA)\b\s*(?:save|saving)/i) || [])[1] || '').toUpperCase(); }
function actDC(c, a) { if (N(a[6])) return N(a[6]); const m = String(a[3] || '').match(/DC\s*(\d+)/i); if (m) return N(m[1]); const r = c && c.tmpl && COMP_RULES[c.tmpl]; return r ? castInfo(r.cls).dc : ''; }
const actName = a => String(a[0] || '').replace(/\s*\((?:[A-Z]{3} save|temp HP)\)\s*/i, '').trim();
const actNote = a => String(a[3] || '').replace(/\s*\(?DC\s*\d+\s*[A-Z]{3}\s*save[^)]*\)?/i, '').trim();
// "walk 40, fly 60" → "40ft · fly 60ft"
function compSpeedText(sp) {
  const parts = String(sp || '').split(/\s*[,;]\s*/).map(x => x.trim()).filter(Boolean); if (!parts.length) return '—';
  return parts.map(x => { const m = /^(walk|walking)?\s*(\d+)\s*(?:ft\.?|feet)?$/i.exec(x); if (m) return m[2] + 'ft'; const n = /^([a-z]+)\s*(\d+)\s*(?:ft\.?|feet)?(.*)$/i.exec(x); return n ? `${n[1].toLowerCase()} ${n[2]}ft${n[3]}` : x; }).join(' · ');
}
// In initiative: a Command button on companions that only act when you spend a bonus action on them.
function compCmdBtn(c, i) {
  const r = c.tmpl && COMP_RULES[c.tmpl]; if (!r || !r.command || !(N(c.hp) > 0)) return '';
  const done = S.turn && S.turn.commanded && S.turn.commanded[c.id];
  return `<button class="btn sm ${done ? 'ghost' : 'gold'}" data-act="compcmd" data-i="${i}" ${done ? 'disabled' : ''} title="${esc(r.command)}">${done ? '✓ Commanded' : 'Command'}</button>`;
}
function compCard(c, i, mini, inCol) {
  const who = 'c' + i, hpPct = c.maxhp ? Math.max(0, Math.min(100, N(c.hp) / N(c.maxhp) * 100)) : 0;
  const acts = (c.attacks || []).map((a, j) => {
    const k = actKind(a), dc = k === 'save' ? actDC(c, a) : '', sv = actSave(a);
    const info = k === 'attack' ? `<button class="roll" data-act="crroll" data-who="${who}" data-j="${j}" data-what="hit" title="Roll to hit only">${fmt(N(a[1]))}</button> to hit · <button class="roll" data-act="crroll" data-who="${who}" data-j="${j}" data-what="dmg" title="Roll damage only">${esc(a[2] || '—')}</button>` : k === 'save' ? `<b>DC ${dc}${sv ? ' ' + sv : ''}</b> · ${esc(a[2] || '—')}` : esc(a[2] || '—');
    const main = k === 'attack' ? `<button class="btn sm gold" data-act="crroll" data-who="${who}" data-j="${j}" data-what="both">Attack</button>` : `<button class="btn sm gold" data-act="crroll" data-who="${who}" data-j="${j}" data-what="eff">${k === 'temp' ? 'Temp HP' : k === 'heal' ? 'Heal' : k === 'save' ? 'Damage' : 'Roll'}</button>`;
    const lim = N(a[8]), left = lim ? Math.max(0, lim - N((c.used || {})[a[0]])) : 0;
    const mainB = lim && !left ? main.replace('<button ', '<button disabled ') : main;
    const extra = lim ? `<span class="tag" title="Uses left today">${left}/${lim}</span>` : '';
    return `<div class="cact k-${k}"><span class="cact-i" aria-hidden="true">${k === 'attack' ? '⚔' : k === 'save' ? '⛨' : k === 'temp' ? '🛡' : k === 'heal' ? '✚' : '🎲'}</span><div class="cact-m"><b>${esc(actName(a))}</b><div class="cact-s">${info}${actNote(a) && !mini ? ' · <span class="muted">' + esc(actNote(a)) + '</span>' : ''}</div></div><div class="cact-b">${extra}${mainB}</div></div>`;
  }).join('');
  const tags = [c.tmpl ? (COMP_RULES[c.tmpl] && COMP_RULES[c.tmpl].always ? 'Always with you' : 'Class · scales with level') : c.kind || 'Companion', c.count > 1 ? '×' + c.count : '', c.effect || ''].filter(Boolean);
  const hp = c.count > 1 ? `<div class="grpHp">${(c.hps || []).map((h, k) => `<label class="ghp"><span>#${k + 1}</span>${inp(`companions.${i}.hps.${k}`, { num: 1, cls: 'sm', label: c.name + ' ' + (k + 1) + ' HP' })}</label>`).join('')}<span class="hint">of ${N(c.maxhp)} each</span></div>`
    : c.maxhp ? `<div class="chp chp2"><div class="chp-ring"><div class="ring-svg">${hpRingSVG(c.hp, c.maxhp, c.temp)}</div>
        <div class="chp-center"><div class="curline">${inp(`companions.${i}.hp`, { num: 1, cls: 'cur', label: c.name + ' current HP' })}${N(c.temp) ? `<span class="tmpbadge">+${N(c.temp)}</span>` : ''}</div><div class="hp-max">of ${N(c.maxhp)}</div></div></div>
        <div class="chp-side"><select class="f ptyqt" id="chpt${i}" aria-label="Damage type for ${esc(c.name)}" title="Damage type"><option value="">Any</option>${DND.damageTypes.map(t => `<option value="${t.toLowerCase()}">${t}</option>`).join('')}</select><input class="f" id="chp${i}" type="text" autocomplete="off" placeholder="Amount" aria-label="${esc(c.name)} HP: -20 (or 20) for damage, +20 to heal, then Enter">
          <div class="chp-btns"><button class="btn hpi dmg" data-act="comphp" data-i="${i}" data-d="-1" title="Damage ${esc(c.name)}" aria-label="Damage">${ICON.hpDmg}</button><button class="btn hpi heal" data-act="comphp" data-i="${i}" data-d="1" title="Heal ${esc(c.name)}" aria-label="Heal">${ICON.hpHeal}</button><button class="btn hpi tmp" data-act="comphp" data-i="${i}" data-d="0" title="Give ${esc(c.name)} temporary HP (they don't stack — the higher stays)" aria-label="Temporary HP">${ICON.hpTemp}</button></div></div></div>` : '';
  return `<div class="${mini ? 'cm-card' : inCol ? 'comp2 incol' : 'panel comp2'}"><div class="comp-h2">${picThumb(c.tmpl ? `compMods.${c.tmpl}.img` : `companions.${i}.img`, c.name)}<div class="grow"><b class="cname">${esc(c.name)}</b><div class="ctags">${(inCol ? [] : tags).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div></div>
      ${inCol ? compCmdBtn(c, i) : ''}<button class="icon-btn" data-act="compedit" data-i="${i}" title="Edit ${esc(c.name)}" aria-label="Edit">✎</button>${c.tmpl && COMP_RULES[c.tmpl] && COMP_RULES[c.tmpl].always ? '' : `<button class="btn sm ghost" data-act="dismiss" data-i="${i}">Dismiss</button>`}</div>
    <div class="cstat2">${hp}<div class="csts"><span class="cst"><small>AC</small><b>${N(c.ac)}</b></span><span class="cst wide"><small>Speed</small><b>${esc(compSpeedText(c.speed))}</b></span>${c.multi > 1 ? `<span class="cst"><small>Attacks</small><b>${c.multi}</b></span>` : ''}</div></div>
    ${acts ? `<div class="cacts">${acts}</div>` : ''}
    ${!mini && String(c.notes || '').trim() ? (inCol ? `<details class="cnotes-d"><summary>How ${esc(c.name)} works</summary><div class="cnotes">${esc(c.notes)}</div></details>` : `<div class="cnotes">${esc(c.notes)}</div>`) : ''}</div>`;
}
// Edit a creature: for class companions the changes are your table's version (S.compMods) and survive level-ups.
let CEDIT = null;
function openCompEdit(i) {
  const c = S.companions[i]; if (!c) return; const cls = !!(c.tmpl && COMP_RULES[c.tmpl]), m = cls ? ((S.compMods || {})[c.tmpl] || {}) : null;
  const base = cls ? compStatsBase(c.tmpl) : null;
  CEDIT = { i, cls, base, rows: (c.attacks || []).map((a, j) => ({ a: a.slice(), j, b: cls && base.attacks.some(x => actName(x) === actName(a)) ? actName(a) : '' })) };
  const row = (r, k) => `<div class="ce-row" data-k="${k}" data-b="${esc(r.b || '')}"><input class="f" data-ce="0" value="${esc(r.a[0] || '')}" placeholder="Name"><select class="f" data-ce="4">${['attack', 'save', 'temp', 'heal', 'roll'].map(x => `<option${actKind(r.a) === x ? ' selected' : ''}>${x}</option>`).join('')}</select><input class="f sm" data-ce="1" value="${esc(r.a[1] == null ? '' : r.a[1])}" placeholder="+hit"><input class="f sm" data-ce="2" value="${esc(r.a[2] || '')}" placeholder="dice"><select class="f sm" data-ce="5" title="Saving throw"><option value="">—</option>${ABL.map(x => `<option${actSave(r.a) === x ? ' selected' : ''}>${x}</option>`).join('')}</select><input class="f sm" data-ce="6" value="${esc(r.a[6] || '')}" placeholder="DC"><input class="f" data-ce="3" value="${esc(r.a[3] || '')}" placeholder="notes / damage type"><button class="icon-btn" data-act="cedel" data-k="${k}" title="Remove" aria-label="Remove">✕</button></div>`;
  openModal(`<h3>Edit ${esc(c.name)}</h3>${cls ? '<p class="hint" style="margin:0 0 8px">This is a class companion: its numbers grow with your level. What you change here is saved as your table\'s version and kept when it levels up. Leave a field blank to use the normal value.</p>' : ''}
    <div class="row">${fld('Name', `<input class="f" id="ceName" value="${esc(c.name)}">`)}${fld('AC', `<input class="f sm" id="ceAc" value="${esc(cls ? (m.ac || '') : c.ac)}" placeholder="${cls ? base.ac : ''}">`)}${fld(c.count > 1 ? 'Max HP each' : 'Max HP', `<input class="f sm" id="ceHp" value="${esc(cls ? (m.hp || '') : c.maxhp)}" placeholder="${cls ? base.hp : ''}">`)}${fld('Speed', `<input class="f" id="ceSpeed" value="${esc(cls ? (m.speed || '') : c.speed || '')}" placeholder="${cls ? esc(base.speed) : ''}">`)}</div>
    <div class="lbl" style="margin-top:8px">Actions <span class="hint">— kind decides the button: attack rolls to hit and damage, save shows the DC and rolls damage, temp/heal roll and offer to apply it</span></div>
    <div class="ce-row ce-head"><span>Name</span><span>Kind</span><span>To hit</span><span>Dice</span><span>Save</span><span>DC</span><span>Notes</span><span></span></div>
    <div id="ceRows">${CEDIT.rows.map(row).join('')}</div><button class="btn sm" data-act="ceadd">+ Add action</button>
    ${fld('Notes', `<textarea class="f" id="ceNotes" rows="3">${esc(cls ? (m.notes || '') : c.notes || '')}</textarea>`)}
    <div class="actions"><button class="btn" data-act="close">Cancel</button>${cls ? '<button class="btn ghost" data-act="cereset">Reset to normal</button>' : ''}<button class="btn gold" data-act="cesave">Save</button></div>`, null, true);
  $('#modal-body').classList.add('xwide');
  CEDIT.row = row;
}
function ceReadRows(withB) { return $$('#ceRows .ce-row').map(el => { const g = k => (el.querySelector(`[data-ce="${k}"]`) || {}).value || ''; const kind = g(4); const a = [g(0).trim(), kind === 'attack' ? (g(1).trim() === '' ? 0 : N(g(1))) : '', g(2).trim(), g(3).trim(), kind, g(5), g(6).trim()]; return withB ? { a, b: el.dataset.b || '' } : a; }).filter(x => (withB ? x.a : x)[0]); }
const ceNorm = a => [String(a[0] || ''), a[1] === '' || a[1] == null ? '' : N(a[1]), String(a[2] || ''), String(a[3] || ''), actKind(a), actSave(a), String(a[6] || '')];
function ceSave() {
  const E = CEDIT; if (!E) return; const c = S.companions[E.i]; if (!c) return;
  const v = id => (($('#' + id) || {}).value || '').trim(), rows = ceReadRows();
  if (E.cls) {
    const n = c.tmpl, m = Object.assign({}, (S.compMods || {})[n]);
    m.name = v('ceName') || undefined; m.ac = v('ceAc') || undefined; m.hp = v('ceHp') || undefined; m.speed = v('ceSpeed') || undefined; m.notes = v('ceNotes') || undefined;
    const base = E.base.attacks;
    m.actions = ceReadRows(true).map(({ a, b }) => { if (!b) return { a }; const x = base.find(z => actName(z) === b); if (!x) return { a }; const nx = ceNorm(x), na = ceNorm(a), e = {}; na.forEach((v, k) => { if (String(v) !== String(nx[k])) e[k] = k === 1 && v !== '' ? N(v) : v; }); return { b, e }; });
    m.known = base.map(actName); delete m.attacks;
    Object.keys(m).forEach(k => m[k] === undefined && delete m[k]);
    S.compMods = Object.assign({}, S.compMods, { [n]: m }); c.name = m.name || n;
  } else { c.name = v('ceName') || c.name; c.ac = N(v('ceAc')); const mh = N(v('ceHp')); if (mh) { c.hp = Math.min(N(c.hp), mh) || mh; c.maxhp = mh; } c.speed = v('ceSpeed'); c.notes = v('ceNotes'); c.attacks = rows; }
  pendingLabel = 'Edit ' + c.name; closeModal(true); save(); render();
}
