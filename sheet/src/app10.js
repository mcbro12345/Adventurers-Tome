// ================= Wild Magic & Metamagic (sorcerer) =================
const R1M = 10, R1H = 600, R1D = 14400;

// ---------- Dice hooks used while a spell is cast ----------
// MAXDMG: every damage die rolls its maximum (surge "maximize the next damaging spell").
// EMPOWER: reroll up to this many damage dice that came up below average (Empowered Spell).
let MAXDMG = false, EMPOWER = 0, DICE_TOUCHED = false;
function diceHook(rs, sides) {
  if (sides === 20) return null;
  if (MAXDMG) { DICE_TOUCHED = true; return rs.map(() => sides); }
  if (EMPOWER > 0) {
    const avg = (sides + 1) / 2, out = rs.slice(), notes = rs.map(String);
    rs.map((v, k) => [v, k]).filter(([v]) => v < avg).sort((a, b) => a[0] - b[0]).forEach(([v, k]) => {
      if (EMPOWER <= 0) return; EMPOWER--; DICE_TOUCHED = true; const nv = 1 + Math.floor(Math.random() * sides); out[k] = nv; notes[k] = v + '↻' + nv;
    });
    return { out, notes };
  }
  return null;
}

// ---------- Wild Magic Surge ----------
const wildOn = () => hasFeature('Wild Magic Surge');
const surgeK = n => Math.min(50, Math.max(1, Math.ceil(N(n) / 2)));
function surgeTableText(n) { const e = (S.surgeTable || []).find(x => n >= N(x.lo) && n <= N(x.hi)); return e ? e.text : ''; }
// Automation follows the standard 50-row table; a custom table with other rows only shows its text.
const surgeStd = () => { const t = S.surgeTable || []; return !t.length || (t.length === 50 && t.every((x, i) => N(x.lo) === 2 * i + 1 && N(x.hi) === 2 * i + 2)); };
const selfDC = () => castInfo('sorcerer').dc;
function mySave(ab, label) { const { expr } = d20Expr(saveVal(ab), 'save', ab); return rollExpr(expr, { need: true, label }); }

// A plan: what was rolled, what will change on the sheet, and the functions that change it (run when you press OK).
function plan() { return { rolls: [], changes: [], fns: [], input: null }; }
function pEffect(p, name, rounds, note, buff) {
  const e = { name, buff: Object.assign({ note }, buff || {}), surge: true }; if (rounds) e.rounds = rounds;
  p.changes.push(`Adds <b>${esc(name)}</b> to Active Spells${rounds ? ' for ' + fmtRounds(rounds) : ' (remove it when it ends)'}`);
  p.fns.push(() => { S.effects = (S.effects || []).filter(x => x.name !== name).concat([JSON.parse(JSON.stringify(e))]); });
}
function pCond(p, c, rounds) {
  p.changes.push(`Condition: <b>${c}</b>${rounds ? ' for ' + fmtRounds(rounds) : ''}`);
  p.fns.push(() => { if (!S.conditions.includes(c)) S.conditions.push(c); if (rounds) { S.condTurns = S.condTurns || {}; S.condTurns[c] = rounds; } });
}
function pHeal(p, n, why) { p.changes.push(`Heals you <b>${n}</b> HP${why ? ' (' + why + ')' : ''}`); p.fns.push(() => healSelf(n, 'Wild Magic Surge: +' + n + ' HP')); }
function pDamage(p, n, type, why) { p.changes.push(`You take <b>${n}</b> ${type} damage${why ? ' (' + why + ')' : ''}`); p.fns.push(() => takeDamage(n)); }
function pSaveVs(p, ab, spell) {
  const dc = selfDC(), r = mySave(ab, `${spell}: your ${ab.toUpperCase()} save`), ok = r.total >= dc;
  p.rolls.push(`Your ${ab.toUpperCase()} save vs your own DC ${dc}: <b>${r.total}</b> (${esc(r.detail)}) — ${ok ? 'success' : 'failed'}`);
  return ok;
}
function pRoll(p, expr, label) { const r = rollExpr(expr, { need: true, label }); p.rolls.push(`${esc(label)}: <b>${r.total}</b> (${esc(r.detail)})`); return r.total; }

// My own one-line summary of each row of the standard table, and what the sheet does about it.
const SURGE = [
  ['Roll on this table at the start of each of your turns for 1 minute (ignore this result on those rolls).', (p, ctx) => ctx.chained ? p.rolls.push('Ignored — you are already surging every turn.') : pEffect(p, 'Surge every turn', R1M, 'Next Turn rolls a Wild Magic Surge for you', { surgeEach: true })],
  ['For 1 minute you can see invisible creatures in your line of sight.', p => pEffect(p, 'See the invisible', R1M, 'You see invisible creatures in line of sight')],
  ['A modron controlled by the DM appears within 5 ft and vanishes after 1 minute.', p => pEffect(p, 'Modron nearby', R1M, 'A DM-controlled modron is next to you')],
  ['You cast Fireball as a 3rd-level spell centered on yourself.', p => { const d = pRoll(p, '8d6', 'Fireball damage'); const ok = pSaveVs(p, 'dex', 'Fireball'); p.rolls.push(`Everyone else within 20 ft: DC ${selfDC()} DEX save, ${d} fire (half on a success)`); pDamage(p, ok ? Math.floor(d / 2) : d, 'fire', ok ? 'half, you saved' : 'you failed the save'); }],
  ['You cast Magic Missile as a 5th-level spell (seven darts).', p => { const d = pRoll(p, '7d4+7', 'Magic Missile, 7 darts'); p.rolls.push(`Point the darts at creatures you can see — ${d} force in total; they always hit`); }],
  ['Roll a d10: your height changes by that many inches — odd you shrink, even you grow.', p => { const n = pRoll(p, '1d10', 'Height change (inches)'), dn = n % 2 ? -n : n; const h = String(S.appearance.height || ''), m = /(\d+)\s*'\s*(\d+)?/.exec(h);
    if (m) { const tot = Math.max(1, N(m[1]) * 12 + N(m[2]) + dn), nh = `${Math.floor(tot / 12)}' ${tot % 12}"`; p.changes.push(`Height: ${esc(h)} → <b>${nh}</b>`); p.fns.push(() => { S.appearance.height = nh; }); }
    else { p.changes.push(`Notes: “Wild Magic: ${dn > 0 ? 'grew' : 'shrank'} ${n} inches”`); p.fns.push(() => S.notes.unshift({ date: new Date().toISOString().slice(0, 10), title: 'Wild Magic Surge', text: `${dn > 0 ? 'Grew' : 'Shrank'} ${n} inches.` })); } }],
  ['You cast Confusion centered on yourself.', p => { p.rolls.push(`Creatures in a 10-ft sphere around you: DC ${selfDC()} WIS save or be confused`); if (!pSaveVs(p, 'wis', 'Confusion')) pEffect(p, 'Confused', R1M, 'Confusion: roll a d10 at the start of each turn for what you do; WIS save at the end of each turn ends it'); }],
  ['For 1 minute you regain 5 hit points at the start of each of your turns.', p => pEffect(p, 'Regenerating', R1M, 'Next Turn heals you 5 HP', { healEach: 5 })],
  ['You grow a long beard of feathers that stays until you sneeze, when the feathers burst out of your face.', p => pEffect(p, 'Feather beard', 0, 'Until you sneeze')],
  ['You cast Grease centered on yourself.', p => { p.rolls.push(`10-ft square of grease under you: creatures there make a DC ${selfDC()} DEX save or fall prone`); if (!pSaveVs(p, 'dex', 'Grease')) pCond(p, 'Prone'); }],
  ['Creatures have disadvantage on saves against the next spell you cast in the next minute that calls for a save.', p => pEffect(p, 'Chaotic spell', R1M, 'Targets of your next save spell have disadvantage on the save')],
  ['Your skin turns a vivid blue until a Remove Curse spell ends it.', p => pEffect(p, 'Blue skin', 0, 'Until Remove Curse')],
  ['A third eye appears on your forehead for 1 minute: advantage on Perception checks that rely on sight.', p => pEffect(p, 'Third eye', R1M, 'Advantage on sight-based Perception checks', { percAdv: true })],
  ['For 1 minute, every spell you cast with a casting time of 1 action takes a bonus action instead.', p => pEffect(p, 'Quick casting', R1M, '1-action spells take a bonus action', { quickAll: true })],
  ['You teleport up to 60 ft to an unoccupied space you can see.', p => p.rolls.push('Move your token — nothing on your sheet changes.')],
  ['You are sent to the Astral Plane until the end of your next turn, then return to where you were.', p => pEffect(p, 'On the Astral Plane', 2, 'You return at the end of your next turn')],
  ['The next damaging spell you cast within 1 minute deals maximum damage.', p => pEffect(p, 'Maximized magic', R1M, 'Your next damaging spell deals maximum damage', { maxNext: true })],
  ['Roll a d10: your age changes by that many years — odd younger (minimum 1), even older.', p => { const n = pRoll(p, '1d10', 'Age change (years)'), dn = n % 2 ? -n : n, a = N(S.appearance.age);
    if (a) { const na = String(Math.max(1, a + dn)); p.changes.push(`Age: ${a} → <b>${na}</b>`); p.fns.push(() => { S.appearance.age = na; }); } else { p.changes.push(`Notes: “Wild Magic: ${dn > 0 ? 'aged' : 'got younger by'} ${n} years”`); p.fns.push(() => S.notes.unshift({ date: new Date().toISOString().slice(0, 10), title: 'Wild Magic Surge', text: `${dn > 0 ? 'Aged' : 'Got younger by'} ${n} years.` })); } }],
  ['1d6 flumphs controlled by the DM appear within 60 ft, frightened of you, and vanish after 1 minute.', p => { const n = pRoll(p, '1d6', 'Flumphs'); pEffect(p, n + ' flumph' + (n > 1 ? 's' : ''), R1M, 'DM-controlled, frightened of you'); }],
  ['You regain 2d10 hit points.', p => pHeal(p, pRoll(p, '2d10', 'Healing'))],
  ['You turn into a potted plant until the start of your next turn: incapacitated and vulnerable to all damage. At 0 HP the pot breaks and you change back.', p => { pCond(p, 'Incapacitated', 1); pEffect(p, 'Potted plant', 1, 'Vulnerable to all damage (damage you take is doubled)', { vulnAll: true }); }],
  ['For 1 minute you can teleport up to 20 ft as a bonus action on each of your turns.', p => pEffect(p, 'Blink step', R1M, 'Bonus action: teleport up to 20 ft')],
  ['You cast Levitate on yourself.', p => pEffect(p, 'Levitate', 100, 'You float up to 20 ft off the ground (concentration, up to 10 minutes)')],
  ['A unicorn controlled by the DM appears within 5 ft and leaves after 1 minute.', p => pEffect(p, 'Unicorn nearby', R1M, 'A DM-controlled unicorn is next to you')],
  ['For 1 minute you can’t speak; pink bubbles float out of your mouth when you try.', p => pEffect(p, 'Bubbles, no speech', R1M, 'You can’t speak — no spells with verbal components')],
  ['A spectral shield hovers near you for 1 minute: +2 AC and immunity to Magic Missile.', p => pEffect(p, 'Spectral shield', R1M, 'Immune to Magic Missile', { ac: 2 })],
  ['You can’t become drunk for the next 5d6 days.', p => { const n = pRoll(p, '5d6', 'Days'); pEffect(p, 'Can’t get drunk', n * R1D, `Immune to being intoxicated for ${n} days`); }],
  ['Your hair falls out; it grows back within 24 hours.', p => pEffect(p, 'Bald', R1D, 'Hair grows back within a day')],
  ['For 1 minute, any flammable object you touch that nobody is wearing or carrying bursts into flame.', p => pEffect(p, 'Burning touch', R1M, 'Unattended flammable objects you touch ignite')],
  ['You regain your lowest-level expended spell slot.', p => { let k = -1; for (let i = 0; i < 9; i++) if (N(S.slotsUsed[i]) > 0 && slotMax(i) > 0) { k = i; break; }
    if (k < 0) p.changes.push('No expended spell slots — nothing to regain'); else { p.changes.push(`Regain a <b>${ORD[k]}-level</b> spell slot`); p.fns.push(() => { S.slotsUsed[k] = Math.max(0, N(S.slotsUsed[k]) - 1); }); } }],
  ['For 1 minute you must shout whenever you speak.', p => pEffect(p, 'Shouting', R1M, 'You shout when you speak')],
  ['You cast Fog Cloud centered on yourself.', p => pEffect(p, 'Fog Cloud', R1H, '20-ft radius of heavy fog around where you stood (concentration, up to 1 hour)')],
  ['Up to three creatures you choose within 30 ft take 4d10 lightning damage.', p => { const d = pRoll(p, '4d10', 'Lightning damage'); p.rolls.push(`Choose up to three creatures within 30 ft — each takes ${d} lightning`); }],
  ['You are frightened of the nearest creature until the end of your next turn.', p => pCond(p, 'Frightened', 2)],
  ['Every creature within 30 ft of you turns invisible for 1 minute; it ends for a creature that attacks or casts a spell.', p => pCond(p, 'Invisible', R1M)],
  ['You have resistance to all damage for 1 minute.', p => pEffect(p, 'Resist everything', R1M, 'Damage you take is halved', { resistAll: true })],
  ['A random creature within 60 ft is poisoned for 1d4 hours.', p => { const n = pRoll(p, '1d4', 'Hours poisoned'); p.rolls.push(`The DM picks the creature — poisoned for ${n} hour${n > 1 ? 's' : ''}`); }],
  ['You glow with bright light in a 30-ft radius for 1 minute; a creature ending its turn within 5 ft is blinded until the end of its next turn.', p => pEffect(p, 'Blinding glow', R1M, 'Bright light 30 ft; creatures ending a turn within 5 ft are blinded')],
  ['You cast Polymorph on yourself; if you fail the save you turn into a sheep for the spell’s duration.', p => { if (!pSaveVs(p, 'wis', 'Polymorph')) pEffect(p, 'Sheep (Polymorph)', R1H, 'You are a sheep — up to 1 hour, or until you drop to 0 HP in sheep form'); else p.rolls.push('You stay yourself.'); }],
  ['Illusory butterflies and flower petals flutter within 10 ft of you for 1 minute.', p => pEffect(p, 'Butterflies', R1M, 'Harmless illusion')],
  ['You can take one extra action right now.', p => { p.changes.push('Your <b>action</b> is ready again this turn'); p.fns.push(() => { S.turn.used.action = false; S.turn.attacks = 0; }); }],
  ['Each creature within 30 ft of you takes 1d10 necrotic damage; you regain hit points equal to the total necrotic damage dealt.', (p, ctx) => { const d = pRoll(p, '1d10', 'Necrotic damage'); p.input = { label: 'Creatures hit', val: 1, per: d }; p.changes.push(`Heals you <b>${d}</b> HP for each creature hit (set the number below)`); p.fns.push(c => healSelf(d * Math.max(0, N(c.count)), 'Wild Magic Surge: drained ' + d * Math.max(0, N(c.count)) + ' HP')); }],
  ['You cast Mirror Image.', p => pEffect(p, 'Mirror Image', R1M, 'Three illusory duplicates (each hit on you may hit one instead)')],
  ['You cast Fly on a random creature within 60 ft.', p => p.rolls.push('The DM picks the creature — it can fly (60 ft) for up to 10 minutes.')],
  ['You turn invisible for 1 minute and nobody can hear you; it ends if you attack or cast a spell.', p => pCond(p, 'Invisible', R1M)],
  ['If you die within the next minute, you come back to life as if by the Reincarnate spell.', p => pEffect(p, 'Second life', R1M, 'If you die, you return as if by Reincarnate')],
  ['Your size increases by one category for 1 minute.', p => pEffect(p, 'Bigger', R1M, 'One size larger')],
  ['You and every creature within 30 ft of you are vulnerable to piercing damage for 1 minute.', p => pEffect(p, 'Pierce-vulnerable', R1M, 'Double piercing damage you take')],
  ['Faint, otherworldly music surrounds you for 1 minute.', p => pEffect(p, 'Ethereal music', R1M, 'Harmless')],
  ['You regain all expended sorcery points.', p => { const fi = fxSource('Font of Magic'); if (fi < 0 || !N(S.features[fi].used)) p.changes.push('Sorcery points are already full'); else { p.changes.push(`Sorcery points back to <b>${featMax(S.features[fi])}</b>`); p.fns.push(() => { S.features[fi].used = 0; }); } }]
];
function surgeOption(n, ctx) {
  const k = surgeK(n), row = SURGE[k - 1], p = plan(), custom = surgeTableText(n);
  if (surgeStd()) row[1](p, ctx || {}); else p.rolls.push('Your table isn’t the standard one, so the sheet doesn’t automate it.');
  return { n, k, text: custom || row[0], p };
}
// Roll the d100 (twice with Controlled Chaos) and work out each result. Tides of Chaos comes back with any surge.
function rollSurge(ctx) {
  const rolls = [rollExpr('1d100', { need: true, label: 'Wild Magic Surge (d100)' })];
  if (hasFeature('Controlled Chaos')) rolls.push(rollExpr('1d100', { need: true, label: 'Controlled Chaos: second roll' }));
  const ti = fxSource('Tides of Chaos'), extra = [];
  if (ti >= 0 && N(S.features[ti].used) > 0) { S.features[ti].used = 0; extra.push('Tides of Chaos is restored'); }
  return { opts: rolls.map(r => surgeOption(r.total, ctx)), extra, pick: 0 };
}
let SURGE_PEND = null;
function openSurge(res, why) {
  SURGE_PEND = res; const many = res.opts.length > 1;
  const card = (o, k) => `<div class="surgecard${many && k === res.pick ? ' on' : ''}"${many ? ` data-act="surgepick" data-k="${k}" role="button"` : ''}>
      <div class="surgehead"><b class="surgen">${o.n}</b><div class="surgetxt">${esc(o.text)}</div></div>
      ${o.p.rolls.length ? `<div class="surgerolls">${o.p.rolls.map(r => `<div>${r}</div>`).join('')}</div>` : ''}
      <div class="lbl">On your sheet</div>
      ${o.p.changes.length || res.extra.length ? `<ul class="surgechg">${o.p.changes.concat(res.extra).map(c => `<li>${c}</li>`).join('')}</ul>` : '<p class="hint" style="margin:2px 0 0">Nothing changes on your sheet — this one is up to you and the DM.</p>'}
      ${o.p.input ? `<label class="surgein">${esc(o.p.input.label)} <input class="f" type="number" min="0" id="surgeCount" value="${o.p.input.val}"></label>` : ''}
    </div>`;
  openModal(`<h3 class="surgetitle">✦ Wild Magic Surge</h3>${why ? `<p class="hint" style="margin:0 0 8px">${esc(why)}</p>` : ''}${many ? '<p class="hint" style="margin:0 0 8px">Controlled Chaos: pick the result you want.</p>' : ''}
    ${res.opts.map(card).join('')}
    <div class="actions"><button class="btn gold" data-act="surgeok">OK</button></div>`, () => surgeApply(true));
}
function surgeApply(cancelled) {
  const res = SURGE_PEND; if (!res) return; SURGE_PEND = null;
  const o = res.opts[res.pick] || res.opts[0], c = { count: $('#surgeCount') ? $('#surgeCount').value : 1 };
  o.p.fns.forEach(f => f(c));
  if (!cancelled) closeModal(true);
  pendingLabel = 'Wild Magic Surge (' + o.n + ')'; save(); render();
}
function surgePick(k) { if (!SURGE_PEND) return; SURGE_PEND.pick = N(k); $$('.surgecard').forEach((el, i) => el.classList.toggle('on', i === N(k))); }
function surgeNoneToast(c) { toast(`<b class="total">${c.total}</b><div><div><b>Wild Magic</b> · surge check</div><div class="sfx">No surge — only a 1 sets one off</div></div>`, '', 3500); }
// After a 1st+ level spell: if Tides of Chaos is spent the spell sets off a surge; otherwise roll a d20 and surge on a 1.
function wildAfterCast(sp) {
  if (!wildOn() || N(sp.level) < 1) return null;
  const ti = fxSource('Tides of Chaos');
  if (ti >= 0 && fxLeft(ti) === 0) { const res = rollSurge(); return () => openSurge(res, `Tides of Chaos was spent, so casting ${sp.name} set off a surge.`); }
  const c = rollExpr('1d20', { need: true, label: 'Wild Magic surge check (d20)' });
  if (c.total === 1) { const res = rollSurge(); return () => openSurge(res, `The surge check after ${sp.name} rolled a 1.`); }
  return () => surgeNoneToast(c);
}
function wildSurgeNow() { const res = rollSurge(); save(); render(); openSurge(res, ''); }
function wildCheckNow() {
  const c = rollExpr('1d20', { need: true, label: 'Wild Magic surge check (d20)' });
  if (c.total !== 1) { surgeNoneToast(c); return; }
  const res = rollSurge(); save(); render(); openSurge(res, 'The surge check rolled a 1.');
}
// Start of your turn (Next Turn): surge-every-turn and regeneration effects.
function wildTurnStart() {
  const fx = fxActive().filter(e => e.buff && !e.ally);
  const heal = fx.reduce((t, e) => t + N(e.buff.healEach), 0);
  if (heal) { healSelf(heal, 'Regenerating: +' + heal + ' HP'); setTimeout(() => toast(`<b>Regenerating</b>: +${heal} HP.`), 120); }
  if (fx.some(e => e.buff.surgeEach)) { const res = rollSurge({ chained: true }); save(); render(); setTimeout(() => openSurge(res, 'Start of your turn — you surge every turn for this minute.'), 200); }
  else if (heal) { save(); render(); }
}
// Damage you take: resistance or vulnerability to everything from a surge.
function surgeDamageAdj(amt) {
  const fx = fxActive().filter(e => e.buff && !e.ally);
  if (fx.some(e => e.buff.resistAll) && !fx.some(e => e.buff.vulnAll)) return Math.floor(amt / 2);
  if (fx.some(e => e.buff.vulnAll) && !fx.some(e => e.buff.resistAll)) return amt * 2;
  return amt;
}

// ---------- Metamagic ----------
const MM = {
  'Careful Spell': { cost: 1, d: 'Up to {cha} creatures you pick automatically succeed on the spell’s saving throw.' },
  'Distant Spell': { cost: 1, d: 'Double the spell’s range; a touch spell reaches 30 ft.' },
  'Empowered Spell': { cost: 1, combo: true, d: 'Reroll up to {cha} low damage dice — the sheet rerolls the worst ones for you. Stacks with another option.' },
  'Extended Spell': { cost: 1, d: 'Double the spell’s duration (up to 24 hours).' },
  'Heightened Spell': { cost: 3, d: 'One target has disadvantage on its first saving throw against the spell.' },
  'Quickened Spell': { cost: 2, d: 'A spell with a casting time of 1 action takes a bonus action instead.' },
  'Seeking Spell': { cost: 2, now: true, combo: true, d: 'Missed with a spell attack? Reroll the d20 and use the new roll.' },
  'Subtle Spell': { cost: 1, d: 'Cast without verbal or somatic components.' },
  'Transmuted Spell': { cost: 1, d: 'Change acid, cold, fire, lightning, poison or thunder damage to another of those types.' },
  'Twinned Spell': { cost: 'level', d: 'A spell that targets only one creature also targets a second one. Costs the spell’s level (1 for a cantrip).' }
};
const mmKnown = () => (S.picks && S.picks.metamagic || []).filter(n => MM[n]);
// Sorcery points: Font of Magic, or the two from the Metamagic Adept feat. A pool whose maximum can't be worked out
// counts your sorcerer level (2 for the feat) instead of "unlimited".
const spFi = () => { let i = fxSource('Font of Magic'); if (i < 0) i = S.features.findIndex(f => /metamagic adept|sorcery points/i.test(String(f.dname || f.name || '') + ' ' + String(f.key || ''))); return i; };
const spMax = () => { const i = spFi(); if (i < 0) return 0; const f = S.features[i], m = featMax(f); return m != null && m < 99 ? m : /metamagic adept/i.test(String(f.key || f.name)) ? 2 : clsLv('sorcerer'); };
const spLeft = () => { const i = spFi(); return i < 0 ? 0 : Math.max(0, spMax() - N(S.features[i].used)); };
const mmText = n => MM[n].d.replace('{cha}', Math.max(1, mod('cha')));
const mmCostTxt = n => MM[n].cost === 'level' ? 'spell level' : MM[n].cost + ' SP';
const mmArmed = () => (S.mmArmed || []).filter(n => mmKnown().includes(n));
function mmToggle(n) {
  if (!MM[n]) return;
  let a = mmArmed();
  if (a.includes(n)) a = a.filter(x => x !== n);
  else { const c = MM[n].cost === 'level' ? 1 : MM[n].cost; if (spLeft() < c) { toast(`Not enough sorcery points for ${esc(n)} (${spLeft()} left).`, 'fumble'); return; }
    a = MM[n].combo ? a.concat(n) : a.filter(x => MM[x].combo).concat(n); }
  S.mmArmed = a; pendingLabel = a.includes(n) ? n + ' ready' : n + ' off'; save(); render();
}
const quickOn = () => mmArmed().includes('Quickened Spell') || fxActive().some(e => e.buff && e.buff.quickAll && !e.ally);
// Called by castSpell: a 1-action spell becomes a bonus action under Quickened Spell (or the surge that does the same).
function mmCol(sp, col) { return quickOn() && castCol(sp.time) === 'action' ? 'bonus' : col; }
// Called by executeCast: spend the points for the armed options and note what each does.
function mmApply(sp, L, lines) {
  const out = { extend: false }; const armed = mmArmed().filter(n => !MM[n].now); if (!armed.length) return out;
  const fi = spFi(); const used = [];
  armed.forEach(n => {
    if (n === 'Quickened Spell' && castCol(sp.time) !== 'action') { lines.push(`Quickened Spell skipped — ${esc(sp.name)} doesn’t take 1 action`); return; }
    const c = MM[n].cost === 'level' ? Math.max(1, N(L)) : MM[n].cost;
    if (fi < 0 || spLeft() < c) { lines.push(`${n} skipped — not enough sorcery points`); return; }
    S.features[fi].used = N(S.features[fi].used) + c; used.push(n);
    if (n === 'Extended Spell') out.extend = true;
    if (n === 'Empowered Spell') EMPOWER = Math.max(1, mod('cha'));
    const rng = String(sp.range || ''), m = /(\d+)\s*(feet|ft)/i.exec(rng);
    const note = { 'Quickened Spell': 'cast as a bonus action', 'Subtle Spell': 'no verbal or somatic components', 'Distant Spell': /touch/i.test(rng) ? 'range 30 ft (was touch)' : m ? `range ${2 * N(m[1])} ft` : 'range doubled',
      'Extended Spell': 'duration doubled', 'Heightened Spell': 'one target has disadvantage on its first save', 'Careful Spell': `up to ${Math.max(1, mod('cha'))} creatures automatically succeed on the save`,
      'Twinned Spell': 'targets a second creature', 'Transmuted Spell': 'damage type changed (tell the DM which)', 'Empowered Spell': `up to ${Math.max(1, mod('cha'))} low damage dice rerolled` }[n];
    lines.push(`<b>${n}</b> (${c} SP): ${note}`);
  });
  S.mmArmed = mmArmed().filter(n => MM[n].now || !used.includes(n) && !armed.includes(n));
  return out;
}
// Seeking Spell: reroll a missed spell attack's d20 right away.
function mmSeek() {
  const fi = spFi(); if (fi < 0 || spLeft() < 2) { toast('Not enough sorcery points for Seeking Spell (2).', 'fumble'); return; }
  S.features[fi].used = N(S.features[fi].used) + 2; pendingLabel = 'Seeking Spell';
  d20('Seeking Spell: spell attack reroll', castInfo('sorcerer').atk, 'attack'); update(); render();
}
// Font of Magic: turn points into slots and slots into points, straight from the panel.
const FOM_COST = [2, 3, 5, 6, 7], FOM_MIN = [2, 3, 5, 7, 9];
function fomCreate(k) {
  const fi = spFi(); if (fi < 0) return;
  if (clsLv('sorcerer') < FOM_MIN[k]) return;
  if (spLeft() < FOM_COST[k]) { toast(`Not enough sorcery points (${FOM_COST[k]} needed).`, 'fumble'); return; }
  if (!(N(S.slotsUsed[k]) > 0)) { toast(`All your ${ORD[k]}-level slots are already full.`, 'fumble'); return; }
  S.features[fi].used = N(S.features[fi].used) + FOM_COST[k]; S.slotsUsed[k] = N(S.slotsUsed[k]) - 1;
  if (S.inCombat) S.turn.used.bonus = true;
  pendingLabel = `${FOM_COST[k]} SP → ${ORD[k]}-level slot`; save(); render();
  toast(`<b>Font of Magic</b>: ${FOM_COST[k]} sorcery points → a ${ORD[k]}-level slot.`, '', 4000, { label: 'Undo', fn: () => undo(1) });
}
function fomConvert(k) {
  const fi = spFi(); if (fi < 0) return;
  if (slotsLeft(k) < 1) { toast(`No ${ORD[k]}-level slots left to convert.`, 'fumble'); return; }
  const f = S.features[fi], gain = Math.min(k + 1, N(f.used));
  if (!gain) { toast('Your sorcery points are already full.', 'fumble'); return; }
  S.slotsUsed[k] = N(S.slotsUsed[k]) + 1; f.used = N(f.used) - gain;
  if (S.inCombat) S.turn.used.bonus = true;
  pendingLabel = `${ORD[k]}-level slot → ${gain} SP`; save(); render();
  toast(`<b>Font of Magic</b>: a ${ORD[k]}-level slot → ${gain} sorcery point${gain > 1 ? 's' : ''}.`, '', 4000, { label: 'Undo', fn: () => undo(1) });
}
function spAdj(d) { const fi = spFi(); if (fi < 0) return; const f = S.features[fi], mx = spMax(); f.used = Math.max(0, Math.min(mx, N(f.used) - d)); pendingLabel = 'Sorcery points'; save(); render(); }

function mmPanelHTML(pid) {
  const fi = spFi(); if (fi < 0) return '';
  const f = S.features[fi], mx = spMax(), left = spLeft(), lv = clsLv('sorcerer'), armed = mmArmed();
  const pips = Array.from({ length: mx }, (_, k) => `<span class="sppip${k < left ? ' on' : ''}"></span>`).join('');
  const opts = mmKnown().map(n => { const on = armed.includes(n), c = MM[n].cost === 'level' ? 1 : MM[n].cost, cant = !on && left < c;
    return `<div class="mmopt${on ? ' on' : ''}"><div class="mmhead"><b>${esc(n.replace(' Spell', ''))}</b><span class="mmcost">${mmCostTxt(n)}</span></div><div class="mmdesc">${esc(mmText(n))}</div>
      ${MM[n].now ? `<button class="btn sm" data-act="mmseek" ${left < 2 ? 'disabled' : ''}>Reroll attack</button>` : `<button class="btn sm${on ? ' gold' : ''}" data-act="mmarm" data-k="${esc(n)}" ${cant ? 'disabled' : ''} aria-pressed="${on}">${on ? '✓ On next spell' : 'Use on next spell'}</button>`}</div>`; }).join('');
  const create = FOM_COST.map((c, k) => lv >= FOM_MIN[k] && slotMax(k) > 0 ? `<button class="btn sm" data-act="fomcreate" data-k="${k}" ${left < c || !(N(S.slotsUsed[k]) > 0) ? 'disabled' : ''} title="${N(S.slotsUsed[k]) > 0 ? '' : 'No spent ' + ORD[k] + '-level slot to fill'}">${c} SP → ${ORD[k]}</button>` : '').join('');
  const conv = Array.from({ length: 9 }, (_, k) => slotMax(k) > 0 ? `<button class="btn sm" data-act="fomconv" data-k="${k}" ${slotsLeft(k) < 1 || !N(f.used) ? 'disabled' : ''}>${ORD[k]} → ${k + 1} SP</button>` : '').join('');
  return `<div class="panel mmpanel" ${PID(pid || 'metamagic')}><h2><span class="grow">Metamagic</span><span class="spctr"><span class="hint">Sorcery points</span><button class="btn sm ghost" data-act="spadj" data-d="-1" aria-label="Spend a point">−</button><b>${left}</b><span class="hint">/ ${mx}</span><button class="btn sm ghost" data-act="spadj" data-d="1" aria-label="Regain a point">+</button></span></h2>
    <div class="sppips">${pips}</div>
    ${opts ? `<div class="mmgrid">${opts}</div>` : '<p class="hint">No Metamagic options yet — you learn two at 3rd level.</p>'}
    ${armed.filter(n => !MM[n].now).length ? `<p class="hint mmarmed">Ready for your next spell: <b>${armed.filter(n => !MM[n].now).map(esc).join(', ')}</b> — points are spent when you cast.</p>` : ''}
    <div class="fomrow"><span class="lbl">Font of Magic</span><span class="fomgrp"><span class="hint">Make a slot</span>${create || '<span class="hint">—</span>'}</span><span class="fomgrp"><span class="hint">Slot to points</span>${conv || '<span class="hint">—</span>'}</span></div>
  </div>`;
}

// ================= Inventory: sort a container, drag items to reorder or move them =================
const invKeyOf = it => it.equipped ? 'equipped' : bagOf(it) ? 'bag:' + it.bag : 'pack';
const RAR = { artifact: 6, legendary: 5, 'very rare': 4, rare: 3, uncommon: 2, common: 1 };
const costGp = c => { const m = /([\d,.]+)\s*(cp|sp|ep|gp|pp)?/i.exec(String(c || '')); if (!m) return 0; const v = Number(m[1].replace(/,/g, '')) || 0; return v * ({ cp: .01, sp: .1, ep: .5, gp: 1, pp: 10 }[String(m[2] || 'gp').toLowerCase()]); };
const itType = it => it.weapon ? 0 : it.armor ? 1 : it.magic ? 2 : 3;
const INV_SORTS = [['name', 'Name (A–Z)'], ['type', 'Type (weapons, armor, magic, gear)'], ['rarity', 'Rarity'], ['weight', 'Weight (heaviest first)'], ['value', 'Value (priciest first)'], ['qty', 'Quantity']];
function invSortMenu(k) {
  return `<div class="menu sortmenu"><button class="icon-btn" data-act="menu" aria-haspopup="true" title="Sort this container" aria-label="Sort">⇅</button><div class="menu-list"><div class="mlabel">Sort by</div>${INV_SORTS.map(([by, t]) => `<button data-act="invsort" data-k="${esc(k)}" data-by="${by}">${t}</button>`).join('')}</div></div>`;
}
function invSort(k, by) {
  const idx = S.inventory.map((it, i) => [it, i]).filter(([it]) => invKeyOf(it) === k).map(([, i]) => i); if (idx.length < 2) return;
  const nm = (a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });
  const cmp = { name: nm, type: (a, b) => itType(a) - itType(b) || nm(a, b), rarity: (a, b) => (RAR[String((b.magic || {}).rarity || '').toLowerCase()] || 0) - (RAR[String((a.magic || {}).rarity || '').toLowerCase()] || 0) || nm(a, b),
    weight: (a, b) => N(b.weight) * Math.max(1, N(b.qty)) - N(a.weight) * Math.max(1, N(a.qty)) || nm(a, b), value: (a, b) => costGp(b.cost) - costGp(a.cost) || nm(a, b), qty: (a, b) => N(b.qty) - N(a.qty) || nm(a, b) }[by] || nm;
  const sorted = idx.map(i => S.inventory[i]).sort(cmp);
  idx.forEach((i, n) => { S.inventory[i] = sorted[n]; });
  $$('.menu.open').forEach(m => m.classList.remove('open'));
  pendingLabel = 'Sort ' + (k === 'pack' ? 'Pack' : k === 'equipped' ? 'Equipped' : ((S.bags || []).find(b => 'bag:' + b.id === k) || {}).name || 'container') + ' by ' + by; save(); render();
}
// Put item i in container `to`, just before item `before` (or at the end of that container).
function invMove(i, to, before) {
  const it = S.inventory[i]; if (!it) return; const from = invKeyOf(it), bt = before != null ? S.inventory[before] : null;
  if (bt === it) { render(); return; }
  S.inventory.splice(i, 1);
  let at = bt ? S.inventory.indexOf(bt) : -1;
  if (at < 0) { let last = -1; S.inventory.forEach((x, n) => { if (invKeyOf(x) === to) last = n; }); at = last < 0 ? S.inventory.length : last + 1; }
  S.inventory.splice(at, 0, it);
  if (to === from) { pendingLabel = 'Reorder: ' + it.name; save(); render(); return; }
  if (to === 'equipped') { equipItem(S.inventory.indexOf(it)); return; }
  it.equipped = false; it.bag = to === 'pack' ? '' : to.slice(4);
  if ((it.spells || []).length || it.hb) rebuildAuto();
  pendingLabel = 'Move ' + it.name + ' to ' + (to === 'pack' ? 'Pack' : ((S.bags || []).find(b => b.id === it.bag) || {}).name || 'container'); save(); render();
}
// ↑ / ↓: move an item one place within its container (the only way to reorder on mobile; desktop can also drag).
function invPeers(i) { const it = S.inventory[i]; if (!it) return []; const k = invKeyOf(it); return S.inventory.map((x, n) => [x, n]).filter(([x]) => invKeyOf(x) === k).map(([, n]) => n); }
function invArrows(i) {
  const pe = invPeers(i), at = pe.indexOf(i); if (pe.length < 2) return '';
  return `<span class="iord"><button data-act="invstep" data-i="${i}" data-d="-1" ${at ? '' : 'disabled'} title="Move up" aria-label="Move up">▲</button><button data-act="invstep" data-i="${i}" data-d="1" ${at < pe.length - 1 ? '' : 'disabled'} title="Move down" aria-label="Move down">▼</button></span>`;
}
function invStep(i, d) {
  const pe = invPeers(i), at = pe.indexOf(i), to = at + d; if (at < 0 || to < 0 || to >= pe.length) return;
  const a = pe[at], b = pe[to], t = S.inventory[a]; S.inventory[a] = S.inventory[b]; S.inventory[b] = t;
  pendingLabel = 'Reorder: ' + t.name; save(); render();
  const r = $(`#page-inventory .irow[data-ii="${b}"] [data-act=invstep][data-d="${d}"]`); if (r && !r.disabled) r.focus();
}
let IDRAG = null;
document.addEventListener('pointerdown', e => {
  const h = e.target.closest && e.target.closest('.idrag'); if (!h || e.button > 0 || isMobile()) return;
  const row = h.closest('.irow'); if (!row) return; e.preventDefault();
  const r = row.getBoundingClientRect(), ghost = row.cloneNode(true);
  ghost.classList.add('idrag-ghost'); Object.assign(ghost.style, { width: r.width + 'px', left: r.left + 'px', top: r.top + 'px' }); document.body.appendChild(ghost);
  const ph = document.createElement('div'); ph.className = 'idrag-ph'; ph.style.height = r.height + 'px'; row.after(ph); row.classList.add('idrag-src');
  IDRAG = { i: N(h.dataset.drag), row, ghost, ph, dx: e.clientX - r.left, dy: e.clientY - r.top, to: row.closest('[data-zi]').dataset.zi, y: e.clientY };
  document.body.classList.add('idragging');
});
function idragPlace(x, y) {
  const d = IDRAG; d.ghost.style.left = (x - d.dx) + 'px'; d.ghost.style.top = (y - d.dy) + 'px'; d.y = y;
  const el = document.elementFromPoint(x, y), sec = el && el.closest('#page-inventory [data-zi]'); if (!sec) return;
  $$('#page-inventory [data-zi].idrop').forEach(s => s.classList.remove('idrop')); sec.classList.add('idrop');
  d.to = sec.dataset.zi; const list = sec.querySelector('.ilist');
  if (!list) { d.ph.style.display = 'none'; return; }
  d.ph.style.display = '';
  const rows = [...list.children].filter(c => c.classList.contains('irow') && c !== d.row);
  const nx = rows.find(c => { const b = c.getBoundingClientRect(); return y < b.top + b.height / 2; });
  if (nx) { if (d.ph.nextElementSibling !== nx) list.insertBefore(d.ph, nx); } else if (d.ph.parentNode !== list || d.ph.nextElementSibling) list.appendChild(d.ph);
}
document.addEventListener('pointermove', e => { if (!IDRAG) return; e.preventDefault(); idragPlace(e.clientX, e.clientY);
  const edge = 60; if (e.clientY < edge) scrollBy(0, -12); else if (e.clientY > innerHeight - edge) scrollBy(0, 12); }, { passive: false });
function idragEnd(cancel) {
  const d = IDRAG; if (!d) return; IDRAG = null; document.body.classList.remove('idragging');
  $$('#page-inventory [data-zi].idrop').forEach(s => s.classList.remove('idrop'));
  let before = null; if (d.ph.style.display !== 'none') { let n = d.ph.nextElementSibling; while (n && !(n.classList.contains('irow') && n !== d.row)) n = n.nextElementSibling; if (n && n.dataset.ii != null) before = N(n.dataset.ii); }
  d.ghost.remove(); d.ph.remove(); d.row.classList.remove('idrag-src');
  if (!cancel) invMove(d.i, d.to, before);
}
document.addEventListener('pointerup', () => idragEnd(false));
document.addEventListener('pointercancel', () => idragEnd(true));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && IDRAG) idragEnd(true); });

// ================= Inspiration (optional, Settings → Rules) =================
// One at most by the rules; the "More than one" house rule removes the cap.
const inspMax = () => ST('inspMany') ? Infinity : 1;
function inspHTML(mini) {
  if (!ST('inspiration')) return '';
  const n = Math.max(0, N(S.insp)), mx = inspMax();
  // One at a time: the badge itself is the switch — tap the star to fill it, tap again to spend it.
  const use = n ? `<button class="insp-use${mini ? ' mini' : ''}" data-act="inspuse" title="Reroll your last attack, check or save, or have advantage on the next one">Use</button>` : '';
  if (mx === 1) return `<button class="insp one${mini ? ' mini' : ''}${n ? ' on' : ''}" data-act="insp" data-d="${n ? -1 : 1}" aria-pressed="${!!n}" title="${n ? 'Inspired — tap to spend it' : 'Tap when you gain Inspiration'}">
    <span class="insp-c"><b class="insp-n">${n ? '★' : '☆'}</b><span class="insp-l">Inspiration</span></span></button>`.replace(/^/, use ? `<div class="insp-grp${mini ? ' mini' : ''}">` : '') + (use ? use + '</div>' : '');
  return `<div class="insp${mini ? ' mini' : ''}${n ? ' on' : ''}" title="Inspiration${mx === 1 ? ' (one at a time)' : ''}">
    <button class="insp-b" data-act="insp" data-d="-1" ${n ? '' : 'disabled'} aria-label="Spend Inspiration">−</button>
    <span class="insp-c"><b class="insp-n">${mx === 1 ? (n ? '★' : '☆') : n}</b><span class="insp-l">Inspiration</span></span>
    <button class="insp-b" data-act="insp" data-d="1" ${n >= mx ? 'disabled' : ''} aria-label="Gain Inspiration">+</button></div>`.replace(/^/, use ? `<div class="insp-grp${mini ? ' mini' : ''}">` : '') + (use ? use + '</div>' : '');
}
// Use Inspiration: reroll the last attack / check / save, or keep it as advantage on the next one (shown with your
// active effects until that roll uses it up).
let LAST_D20 = null;
function inspUse() {
  if (!(N(S.insp) > 0)) return;
  const L = LAST_D20 && Date.now() - LAST_D20.t < 10 * 60000 ? LAST_D20 : null;
  openModal(`<h3>Use Inspiration</h3><p class="hint" style="margin:0 0 10px">It’s used up either way.</p><div class="castopts insp-opts">
    <button class="castopt" data-act="inspgo" data-k="reroll" ${L ? '' : 'disabled'}><b>Reroll the last roll</b><span>${L ? esc(L.label) + (L.total != null ? ' — was ' + L.total : '') : 'No recent attack, check or save'}</span></button>
    <button class="castopt" data-act="inspgo" data-k="next"><b>Advantage on my next roll</b><span>Your next attack, ability check or saving throw</span></button></div>
    <div class="actions"><button class="btn" data-act="close">Cancel</button></div>`);
}
function inspGo(k) {
  closeModal(true); if (!(N(S.insp) > 0)) return;
  S.insp = Math.max(0, N(S.insp) - 1);
  if (k === 'next') { S.effects = (S.effects || []).filter(x => x.name !== 'Inspiration').concat([{ name: 'Inspiration', rounds: null, conc: false, buff: { d20AdvNext: 'Inspiration', note: 'Advantage on your next attack roll, ability check or saving throw' } }]);
    pendingLabel = 'Inspiration: advantage on the next roll'; save(); render(); toast('<b>Inspiration</b> — your next attack, check or save has advantage.', '', 5000, { label: 'Undo', fn: () => undo(1) }); return; }
  const L = LAST_D20; pendingLabel = 'Inspiration: reroll'; save(); render('header');
  if (L.attack != null) attackRoll(L.attack, true, { label: L.label.replace(/ \(Inspiration reroll\)$/, '') + ' (Inspiration reroll)' });
  else d20(L.label.replace(/ \(Inspiration reroll\)$/, '') + ' (Inspiration reroll)', L.bonus, L.kind, L.ab, L.rows);
}
function inspAdj(d) {
  const was = Math.max(0, N(S.insp)), n = Math.max(0, Math.min(inspMax(), was + d)); if (n === was) return;
  S.insp = n; pendingLabel = d > 0 ? 'Gain Inspiration' : 'Spend Inspiration'; save(); render('header');
  if (d < 0) toast(`Inspiration spent${inspMax() === 1 ? '' : ` — ${n} left`}. Use it for advantage on one attack, check or save.`, '', 4000, { label: 'Undo', fn: () => undo(1) });
}

// ================= Spells: my own categories (Group spells by → My categories) =================
// S.spellCats = [{ id, name, icon, color, auto? }]; each spell keeps sp.cat (category id, '' = uncategorized) and
// sp.cord (its place inside the category). The Combat tab shows the same groups, in the same order.
const SPCAT_COLORS = ['#d9603b', '#9b6bd6', '#3c9d6b', '#3f8fd2', '#c9962b', '#2f9a8a', '#c0507a', '#7d8597'];
const SPCAT_ICONS = ['⚔', '⛓', '✚', '🛡', '✦', '🔥', '❄', '⚡', '☠', '👁', '✨', '🌀', '◆', '★', '🗡', '🏹'];
const spCustom = () => ST('combatSpellSort') === 'custom';
function spCatsEnsure() {
  if (Array.isArray(S.spellCats)) return;
  const col = { dmg: '#d9603b', ctl: '#9b6bd6', heal: '#3c9d6b', buff: '#3f8fd2', util: '#7d8597' };
  S.spellCats = SPG.map(([k, name, icon]) => ({ id: k, name, icon, color: col[k], auto: k }));
}
function spCatOf(sp) {
  const cats = S.spellCats || [];
  if (sp.cat != null) return cats.some(c => c.id === sp.cat) ? sp.cat : '';
  const g = spellGroup(sp), c = cats.find(x => x.auto === g); return c ? c.id : '';
}
const spOrd = (sp, i) => sp.cord != null ? N(sp.cord) : 100000 + N(sp.level) * 1000 + i;
function spCatsAll() {
  const cats = (S.spellCats || []).slice();
  if (S.spells.some(sp => spCatOf(sp) === '')) cats.push({ id: '', name: 'Uncategorized', icon: '…', color: '#7d8597' });
  return cats;
}
const spCatIdx = id => { const a = spCatsAll(); const k = a.findIndex(c => c.id === id); return k < 0 ? a.length : k; };
function spCustomOrder() {
  return S.spells.map((s, i) => i).sort((a, b) => spCatIdx(spCatOf(S.spells[a])) - spCatIdx(spCatOf(S.spells[b])) || spOrd(S.spells[a], a) - spOrd(S.spells[b], b) || a - b);
}
// Category ids strictly between two others (so empty categories still get a header to drop spells into).
function spCatsBetween(prev, next) {
  const all = spCatsAll().map(c => c.id), a = prev == null ? -1 : all.indexOf(prev), b = next === undefined ? all.length : all.indexOf(next);
  return all.slice(a + 1, b < 0 ? all.length : b);
}
const spCatObj = id => spCatsAll().find(c => c.id === id) || { id, name: 'Uncategorized', icon: '…', color: '#7d8597' };
function spCatTools(id) {
  if (id === '') return '';
  const cats = S.spellCats || [], k = cats.findIndex(c => c.id === id);
  return `<span class="cath-tools"><button class="icon-btn" data-act="spcatmove" data-k="${esc(id)}" data-d="-1" ${k > 0 ? '' : 'disabled'} title="Move category up" aria-label="Move category up">▲</button><button class="icon-btn" data-act="spcatmove" data-k="${esc(id)}" data-d="1" ${k < cats.length - 1 ? '' : 'disabled'} title="Move category down" aria-label="Move category down">▼</button><button class="icon-btn" data-act="spcatren" data-k="${esc(id)}" title="Rename / icon / color" aria-label="Edit category">✎</button><button class="icon-btn" data-act="spcatdel" data-k="${esc(id)}" title="Delete category (its spells become Uncategorized)" aria-label="Delete category">✕</button></span>`;
}
function spCatHeadInner(id, n) {
  const c = spCatObj(id);
  return `<div class="cath" style="--g:${esc(c.color || 'var(--gold)')}"><span class="cath-i">${esc(c.icon || '◆')}</span><b class="cath-n">${esc(c.name)}</b><span class="cath-c">${n}</span>${n ? '' : '<span class="hint cath-e">Empty — drag spells here or use a spell’s ⇄</span>'}<span class="grow"></span>${spCatTools(id)}</div>`;
}
const spCatHeadT = (id, n) => `<tr class="lvlhead cathead" data-cat="${esc(id)}"><td colspan="9">${spCatHeadInner(id, n)}</td></tr>`;
const spCatHeadM = (id, n) => `<div class="lvl-label cathead" data-cat="${esc(id)}">${spCatHeadInner(id, n)}</div>`;
function spPeers(cat) { return S.spells.map((s, i) => [s, i]).filter(([s]) => spCatOf(s) === cat).sort((x, y) => spOrd(x[0], x[1]) - spOrd(y[0], y[1]) || x[1] - y[1]).map(([, i]) => i); }
function spOrdCtl(i) {
  const sp = S.spells[i], cat = spCatOf(sp), pe = spPeers(cat), at = pe.indexOf(i);
  const dests = spCatsAll().filter(c => c.id !== cat && !(c.id === '' && !(S.spellCats || []).length));
  return `<span class="sord"><span class="sdrag" data-sdrag="${i}" title="Drag to reorder or into another category" aria-hidden="true">⠿</span><span class="iord"><button data-act="spstep" data-i="${i}" data-d="-1" ${at > 0 ? '' : 'disabled'} title="Move up" aria-label="Move up">▲</button><button data-act="spstep" data-i="${i}" data-d="1" ${at < pe.length - 1 ? '' : 'disabled'} title="Move down" aria-label="Move down">▼</button></span>${dests.length ? `<div class="menu mvmenu spmv"><button class="mvto" data-act="menu" aria-haspopup="true" title="Move to another category" aria-label="Move ${esc(sp.name)} to another category">⇄</button><div class="menu-list"><div class="mlabel">Move to</div>${dests.map(c => `<button data-act="spto" data-i="${i}" data-k="${esc(c.id)}">${esc(c.icon || '◆')} ${esc(c.name)}</button>`).join('')}${(S.spellCats || []).length && cat !== '' ? `<button data-act="spto" data-i="${i}" data-k="">… Uncategorized</button>` : ''}</div></div>` : ''}</span>`;
}
function spRenumber(cat, list) { list.forEach((j, n) => { S.spells[j].cat = cat; S.spells[j].cord = n; }); }
function spStep(i, d) {
  const cat = spCatOf(S.spells[i]), pe = spPeers(cat), at = pe.indexOf(i), to = at + d; if (at < 0 || to < 0 || to >= pe.length) return;
  pe.splice(at, 1); pe.splice(to, 0, i); spRenumber(cat, pe);
  pendingLabel = 'Reorder: ' + S.spells[i].name; save(); render();
}
function spMoveTo(i, cat, before) {
  const sp = S.spells[i]; if (!sp) return; const from = spCatOf(sp);
  const pe = spPeers(cat).filter(j => j !== i); let at = before != null ? pe.indexOf(before) : -1; if (at < 0) at = pe.length;
  pe.splice(at, 0, i); spRenumber(cat, pe); if (from !== cat) spRenumber(from, spPeers(from).filter(j => j !== i));
  sp.cat = cat; pendingLabel = from === cat ? 'Reorder: ' + sp.name : 'Move ' + sp.name + ' to ' + spCatObj(cat).name; save(); render();
}
function spCatModal(id) {
  const c = id ? (S.spellCats || []).find(x => x.id === id) : { name: '', icon: '◆', color: SPCAT_COLORS[(S.spellCats || []).length % SPCAT_COLORS.length] };
  if (!c) return; SPCAT_PICK = { icon: c.icon || '◆', color: c.color || SPCAT_COLORS[0] };
  openModal(`<h3>${id ? 'Edit category' : 'New spell category'}</h3>${fld('Name', `<input class="f" id="spcatName" value="${esc(c.name)}" placeholder="e.g. Big damage, Escape plans" autofocus>`)}
    <div class="lbl" style="margin-top:8px">Icon</div><div class="spcat-icons">${SPCAT_ICONS.map(x => `<button class="spcat-ic${x === SPCAT_PICK.icon ? ' on' : ''}" data-spic="${esc(x)}">${x}</button>`).join('')}</div>
    <div class="lbl" style="margin-top:8px">Color</div><div class="spcat-cols">${SPCAT_COLORS.map(x => `<button class="spcat-col${x === SPCAT_PICK.color ? ' on' : ''}" data-spcol="${x}" style="background:${x}" aria-label="Color ${x}"></button>`).join('')}</div>
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="spcatrenok" data-k="${esc(id || '')}">${id ? 'Save' : 'Add category'}</button></div>`);
}
let SPCAT_PICK = null;
document.addEventListener('click', e => {
  const ic = e.target.closest && e.target.closest('[data-spic]'), co = e.target.closest && e.target.closest('[data-spcol]'); if (!ic && !co) return;
  if (ic) { SPCAT_PICK.icon = ic.dataset.spic; $$('.spcat-ic').forEach(b => b.classList.toggle('on', b === ic)); }
  if (co) { SPCAT_PICK.color = co.dataset.spcol; $$('.spcat-col').forEach(b => b.classList.toggle('on', b === co)); }
});
function spCatAdd() { spCatsEnsure(); spCatModal(''); }
function spCatRename(id) { spCatModal(id); }
function spCatRenameOK(id) {
  const name = ($('#spcatName') && $('#spcatName').value.trim()) || 'New category';
  if (id) { const c = S.spellCats.find(x => x.id === id); if (c) Object.assign(c, { name, icon: SPCAT_PICK.icon, color: SPCAT_PICK.color }); pendingLabel = 'Edit category: ' + name; }
  else { S.spellCats = (S.spellCats || []).concat([{ id: uid(), name, icon: SPCAT_PICK.icon, color: SPCAT_PICK.color }]); pendingLabel = 'New category: ' + name; }
  closeModal(true); save(); render();
}
function spCatMove(id, d) { const a = S.spellCats || [], k = a.findIndex(c => c.id === id), t = k + d; if (k < 0 || t < 0 || t >= a.length) return; const x = a[k]; a[k] = a[t]; a[t] = x; pendingLabel = 'Move category: ' + x.name; save(); render(); }
function spCatDel(id) {
  const c = (S.spellCats || []).find(x => x.id === id); if (!c) return;
  S.spells.forEach(sp => { if (spCatOf(sp) === id) sp.cat = ''; });
  S.spellCats = S.spellCats.filter(x => x.id !== id); pendingLabel = 'Delete category: ' + c.name; save(); render();
  toast(`Category <b>${esc(c.name)}</b> deleted — its spells are now Uncategorized.`, '', 6000, { label: 'Undo', fn: () => undo(1) });
}
// Drag a spell (desktop only): drop it between other spells, or on a category header to put it at the top.
let SDRAG = null;
document.addEventListener('pointerdown', e => {
  const h = e.target.closest && e.target.closest('.sdrag'); if (!h || e.button > 0 || isMobile()) return;
  const row = h.closest('[data-si]'); if (!row) return; e.preventDefault();
  const r = row.getBoundingClientRect(), ghost = document.createElement('div');
  ghost.className = 'sdrag-ghost'; ghost.textContent = (S.spells[N(h.dataset.sdrag)] || {}).name || ''; Object.assign(ghost.style, { left: r.left + 'px', top: r.top + 'px' }); document.body.appendChild(ghost);
  const isTr = row.tagName === 'TR', ph = document.createElement(isTr ? 'tr' : 'div'); ph.className = 'sdrag-ph'; if (isTr) ph.innerHTML = '<td colspan="9"></td>'; ph.style.height = Math.min(r.height, 44) + 'px';
  row.after(ph); row.classList.add('sdrag-src');
  SDRAG = { i: N(h.dataset.sdrag), row, ghost, ph, dx: e.clientX - r.left, dy: e.clientY - r.top, cat: spCatOf(S.spells[N(h.dataset.sdrag)]), before: null };
  document.body.classList.add('idragging');
});
document.addEventListener('pointermove', e => {
  const d = SDRAG; if (!d) return; e.preventDefault();
  d.ghost.style.left = (e.clientX - d.dx) + 'px'; d.ghost.style.top = (e.clientY - d.dy) + 'px';
  const el = document.elementFromPoint(e.clientX, e.clientY); if (!el) return;
  const head = el.closest('#page-spells [data-cat]'), row = el.closest('#page-spells [data-si]');
  if (head) { d.cat = head.dataset.cat; d.before = null; head.after(d.ph); const p = spPeers(d.cat).filter(j => j !== d.i); d.before = p.length ? p[0] : null; }
  else if (row && row !== d.row) { const b = row.getBoundingClientRect(), above = e.clientY < b.top + b.height / 2; d.cat = spCatOf(S.spells[N(row.dataset.si)]);
    if (above) { row.before(d.ph); d.before = N(row.dataset.si); } else { let n = row.nextElementSibling; while (n && (n.classList.contains('detail') || n === d.ph || n === d.row)) n = n.nextElementSibling; row.after(d.ph); d.before = n && n.dataset && n.dataset.si != null && spCatOf(S.spells[N(n.dataset.si)]) === d.cat ? N(n.dataset.si) : null; } }
  const edge = 60; if (e.clientY < edge) scrollBy(0, -12); else if (e.clientY > innerHeight - edge) scrollBy(0, 12);
}, { passive: false });
function sdragEnd(cancel) {
  const d = SDRAG; if (!d) return; SDRAG = null; document.body.classList.remove('idragging');
  d.ghost.remove(); d.ph.remove(); d.row.classList.remove('sdrag-src');
  if (!cancel) spMoveTo(d.i, d.cat, d.before);
}
document.addEventListener('pointerup', () => sdragEnd(false));
document.addEventListener('pointercancel', () => sdragEnd(true));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && SDRAG) sdragEnd(true); });

// ---------- The Right Tool for the Job (artificer 3) ----------
// With thieves' tools or artisan's tools in hand, spend an hour (can be during a rest) to magically make one set of
// artisan's tools. They're nonmagical, and the previous set vanishes when you use the feature again.
const RTJ_ART = () => (DND.toolGroups && DND.toolGroups.artisan) || [];
const rtjItem = () => S.inventory.find(it => it.rtj);
function rtjHasTools() { const arts = RTJ_ART().map(x => x.toLowerCase()); return S.inventory.some(it => !it.rtj && (/thieves'? tools/i.test(it.name) || arts.some(a => it.name.toLowerCase().includes(a.toLowerCase())) || /all-purpose tool/i.test(it.name))); }
function openRTJ() {
  const cur = rtjItem(), ok = rtjHasTools();
  openModal(`<div id="rtjm"><h3>The Right Tool for the Job</h3>
    <p class="hint">Spend 1 hour of uninterrupted work (it can be part of a short or long rest) with thieves' tools or artisan's tools in hand, and magically make one set of artisan's tools in a space within 5 ft. They're nonmagical${cur ? `, and your current set — <b>${esc(cur.name.replace(/\s*\(Right Tool.*\)$/, ''))}</b> — vanishes when you make a new one` : ''}.</p>
    ${ok ? '' : `<p class="warn sm">You don't seem to be carrying thieves' tools or artisan's tools — you need a set in hand to use this.</p>`}
    <div class="rtjgrid">${RTJ_ART().map(n => `<button class="rtjopt${cur && cur.rtjTool === n ? ' on' : ''}" data-act="rtjmake" data-n="${esc(n)}">${esc(n)}</button>`).join('')}</div>
    <div class="actions"><button class="btn" data-act="close">Cancel</button></div></div>`, null, true);
}
function rtjMake(n) {
  if (!RTJ_ART().includes(n)) return;
  const old = rtjItem(), oi = old ? S.inventory.indexOf(old) : -1;
  const g = DND.gear.find(x => x[0] === n);
  const it = g ? makeGearItem(g) : { id: uid(), name: n, qty: 1, weight: 0, cost: '', equipped: false, notes: '' };
  Object.assign(it, { name: n + ' (Right Tool for the Job)', rtj: true, rtjTool: n, cost: '', notes: 'Made with The Right Tool for the Job. Nonmagical; vanishes when you use the feature again.' });
  if (old) { it.bag = old.bag || ''; S.inventory.splice(oi, 1, it); } else addInventoryItem(it, true);
  closeModal(true); pendingLabel = 'The Right Tool for the Job: ' + n; save(); render();
  toast(`<b>${esc(n)}</b> made with The Right Tool for the Job${old ? ` — your ${esc(old.rtjTool || 'old set')} vanished` : ''}. It's in your inventory.`, '', 6000, { label: 'Undo', fn: () => undo(1) });
}

// ---------- Dragging whole containers (desktop): drop on another container to put it inside, anywhere else to take it out ----------
let BDRAG = null;
document.addEventListener('pointerdown', e => {
  const h = e.target.closest && e.target.closest('.bdrag'); if (!h || e.button > 0 || isMobile()) return;
  const sec = h.closest('section[data-zi]'); if (!sec) return; e.preventDefault();
  // The ghost is a copy of the container's own header row, so you can see exactly what you're carrying.
  const hd = sec.querySelector(':scope > .subh') || sec, r = hd.getBoundingClientRect(), ghost = document.createElement('div');
  ghost.className = 'bdrag-ghost ' + (sec.classList.contains('subbag') ? 'subbag' : 'inv-col bagcol'); ghost.appendChild(hd.cloneNode(true));
  $$('.menu-list, .bagedit', ghost).forEach(x => x.remove());
  Object.assign(ghost.style, { width: r.width + 'px', left: r.left + 'px', top: r.top + 'px' }); document.body.appendChild(ghost);
  sec.classList.add('bdrag-src'); BDRAG = { id: h.dataset.bdrag, sec, ghost, to: null, dx: e.clientX - r.left, dy: e.clientY - r.top }; document.body.classList.add('idragging');
});
document.addEventListener('pointermove', e => { const d = BDRAG; if (!d) return; e.preventDefault(); d.ghost.style.left = (e.clientX - d.dx) + 'px'; d.ghost.style.top = (e.clientY - d.dy) + 'px';
  $$('#page-inventory .idrop').forEach(s => s.classList.remove('idrop'));
  const el = document.elementFromPoint(e.clientX, e.clientY), sec = el && el.closest('#page-inventory section[data-zi]'); const b = bagById(d.id);
  let to = null; if (sec) { const k = sec.dataset.zi; if (k.startsWith('bag:')) { const t = bagById(k.slice(4)); if (t && t !== b && !bagDescendants(b).includes(t)) { to = t.id; sec.classList.add('idrop'); } else if (t === b) to = undefined; } else if (k === 'pack') { to = 'pack'; sec.classList.add('idrop'); } else to = ''; } else if (el && el.closest('#page-inventory')) to = '';
  d.to = to; const edge = 60; if (e.clientY < edge) scrollBy(0, -12); else if (e.clientY > innerHeight - edge) scrollBy(0, 12); }, { passive: false });
function bdragEnd(cancel) { const d = BDRAG; if (!d) return; BDRAG = null; document.body.classList.remove('idragging'); d.ghost.remove(); d.sec.classList.remove('bdrag-src'); $$('#page-inventory .idrop').forEach(s => s.classList.remove('idrop'));
  if (!cancel && d.to != null) bagMoveTo(d.id, d.to); }
document.addEventListener('pointerup', () => bdragEnd(false));
document.addEventListener('pointercancel', () => bdragEnd(true));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && BDRAG) bdragEnd(true); });

// ================= Spell groups (Level / Purpose / My categories), shared by the Spells and Combat tabs =================
// Groups can be rearranged by dragging their header grip (desktop) or with ▲ ▼. My categories keep their order in
// S.spellCats; Level and Purpose keep theirs in S.spGroupOrder[mode].
const SPG_COL = { dmg: '#d9603b', ctl: '#9b6bd6', heal: '#3c9d6b', buff: '#3f8fd2', util: 'var(--soft)' };
const spMode = () => { const m = ST('combatSpellSort'); return m === 'custom' || m === 'purpose' ? m : 'level'; };
function spGroupDefs(mode) {
  if (mode === 'custom') { spCatsEnsure(); return spCatsAll().map(c => ({ k: 'c:' + (c.id || 'none'), cat: c.id, name: c.name, icon: c.icon || '◆', color: c.color || 'var(--gold)', cls: 'cat' })); }
  if (mode === 'purpose') return SPG.map(([k, name, icon]) => ({ k, name, icon, color: SPG_COL[k], cls: k }));
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(L => ({ k: 'lv' + L, L, name: L ? ORD[L - 1] + ' level' : 'Cantrips', icon: L || '∞', color: 'var(--gold)', cls: 'lvl' }));
}
const spGroupOf = (mode, sp) => mode === 'custom' ? 'c:' + (spCatOf(sp) || 'none') : mode === 'purpose' ? spellGroup(sp) : 'lv' + N(sp.level);
function spGroupsOrdered(mode) {
  const defs = spGroupDefs(mode); if (mode === 'custom') return defs;
  const o = (S.spGroupOrder || {})[mode] || [], rank = (g, d) => { const k = o.indexOf(g.k); return k < 0 ? 1000 + d : k; };
  return defs.map((g, d) => [g, rank(g, d)]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
}
// The groups to show for a list of spell indexes (kept in the order given inside each group).
function spGroupsFor(mode, idxs, withEmpty) {
  return spGroupsOrdered(mode).map(g => Object.assign({}, g, { items: idxs.filter(i => spGroupOf(mode, S.spells[i]) === g.k) }))
    .filter(g => g.items.length || (withEmpty && mode === 'custom' && g.cat !== ''));
}
function spGroupMove(mode, k, before) {
  if (mode === 'custom') {
    const a = S.spellCats || [], id = k.slice(2), from = a.findIndex(c => c.id === id); if (from < 0) return;
    const [c] = a.splice(from, 1); let at = before ? a.findIndex(x => 'c:' + x.id === before) : -1; if (at < 0) at = a.length; a.splice(at, 0, c);
    pendingLabel = 'Move category: ' + c.name;
  } else {
    const full = spGroupsOrdered(mode).map(g => g.k).filter(x => x !== k); let at = before ? full.indexOf(before) : -1; if (at < 0) at = full.length; full.splice(at, 0, k);
    S.spGroupOrder = Object.assign({}, S.spGroupOrder, { [mode]: full });
    pendingLabel = 'Move group: ' + ((spGroupDefs(mode).find(g => g.k === k) || {}).name || k);
  }
  save(); render();
}
function spGroupStep(k, d) {
  const mode = spMode(), vis = spGroupsFor(mode, S.spells.map((s, i) => i), true).map(g => g.k).filter(x => x !== 'c:none'), at = vis.indexOf(k);
  if (at < 0 || at + d < 0 || at + d >= vis.length) return;
  spGroupMove(mode, k, d < 0 ? vis[at - 1] : vis[at + 2]);
}
// A group's header on the Spells tab: grip, the collapse button, and ▲ ▼ (plus edit / delete for your own categories).
function spgHead(col, g, mode, n, open, first, last) {
  const mv = !(mode === 'custom' && g.cat === '');
  const tools = `<span class="cath-tools">${mode === 'custom' && g.cat ? `<button class="icon-btn" data-act="spcatren" data-k="${esc(g.cat)}" title="Rename / icon / color" aria-label="Edit category">✎</button><button class="icon-btn" data-act="spcatdel" data-k="${esc(g.cat)}" title="Delete category (its spells become Uncategorized)" aria-label="Delete category">✕</button>` : ''}</span>`;
  return `<div class="cspg-hrow"${mode === 'custom' ? ` data-cat="${esc(g.cat)}"` : ''}>${mv ? `<span class="gdrag" data-gdrag="${esc(g.k)}" title="Drag to rearrange" aria-hidden="true">⠿</span>` : ''}${cGroupHead(col, g.k, esc(g.name), esc(String(g.icon)), n, open)}${tools}</div>`;
}
// Dragging a whole group (desktop): a copy of its header follows the pointer; drop it between other groups.
let GDRAG = null;
document.addEventListener('pointerdown', e => {
  const h = e.target.closest && e.target.closest('.gdrag'); if (!h || e.button > 0 || isMobile()) return;
  const grp = h.closest('.spg'); if (!grp) return; e.preventDefault();
  const hd = grp.querySelector(':scope > .cspg-hrow'), r = hd.getBoundingClientRect(), ghost = document.createElement('div');
  ghost.className = 'bdrag-ghost cspg spg-ghost'; ghost.style.setProperty('--g', getComputedStyle(grp).getPropertyValue('--g')); ghost.appendChild(hd.cloneNode(true));
  Object.assign(ghost.style, { width: r.width + 'px', left: r.left + 'px', top: r.top + 'px' }); document.body.appendChild(ghost);
  const line = document.createElement('div'); line.className = 'spg-drop'; grp.before(line);
  grp.classList.add('bdrag-src'); GDRAG = { k: h.dataset.gdrag, grp, ghost, line, dx: e.clientX - r.left, dy: e.clientY - r.top, before: null, moved: false };
  document.body.classList.add('idragging');
});
document.addEventListener('pointermove', e => {
  const d = GDRAG; if (!d) return; e.preventDefault(); d.moved = true;
  d.ghost.style.left = (e.clientX - d.dx) + 'px'; d.ghost.style.top = (e.clientY - d.dy) + 'px';
  const groups = [...d.grp.parentElement.querySelectorAll(':scope > .spg')].filter(g => g.dataset.gk !== 'c:none');
  let tgt = null; for (const g of groups) { const b = g.getBoundingClientRect(); if (e.clientY < b.top + Math.min(b.height, 60) / 2) { tgt = g; break; } }
  if (tgt) tgt.before(d.line); else { const lastG = groups[groups.length - 1]; if (lastG) lastG.after(d.line); }
  d.before = tgt ? tgt.dataset.gk : null;
  const edge = 60; if (e.clientY < edge) scrollBy(0, -12); else if (e.clientY > innerHeight - edge) scrollBy(0, 12);
}, { passive: false });
function gdragEnd(cancel) {
  const d = GDRAG; if (!d) return; GDRAG = null; document.body.classList.remove('idragging'); d.ghost.remove(); d.line.remove(); d.grp.classList.remove('bdrag-src');
  if (cancel || !d.moved || d.before === d.k) return;
  // Dropping right after itself changes nothing.
  const sib = [...d.grp.parentElement.querySelectorAll(':scope > .spg')], at = sib.indexOf(d.grp); if (sib[at + 1] && sib[at + 1].dataset.gk === d.before) return;
  if (!d.before && at === sib.filter(g => g.dataset.gk !== 'c:none').length - 1) return;
  spGroupMove(spMode(), d.k, d.before);
}
document.addEventListener('pointerup', () => gdragEnd(false));
document.addEventListener('pointercancel', () => gdragEnd(true));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && GDRAG) gdragEnd(true); });

// ================= Combat: rearranging the groups inside Action / Bonus Action / Reaction / Movement =================
// Each column keeps its own order in S.cgOrder[col] (by group key). Other blocks (like the Attack action) stay put.
const cgKeyOf = g => { const h = g.querySelector(':scope > .cspg-h, :scope > .cspg-hrow > .cspg-h'); return h ? String(h.dataset.key || '').replace(/^cg:[^:]+:/, '') : ''; };
function econGroupsApply() {
  const ord = S.cgOrder || {}, mob = isMobile();
  $$('#page-combat .econ[data-col]').forEach(colEl => {
    const col = colEl.dataset.col, body = colEl.querySelector('.econ-body'); if (!body) return;
    const groups = [...body.children].filter(c => c.classList.contains('cspg') && cgKeyOf(c)); if (!groups.length) return;
    const saved = ord[col] || [], rank = (g, d) => { const k = saved.indexOf(cgKeyOf(g)); return k < 0 ? 1000 + d : k; };
    const sorted = groups.map((g, d) => [g, rank(g, d)]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
    const slots = groups.map(g => { const ph = document.createComment('g'); g.replaceWith(ph); return ph; });
    slots.forEach((ph, k) => ph.replaceWith(sorted[k]));
    sorted.forEach((g, k) => { g.classList.add('cgmov'); g.dataset.cgk = cgKeyOf(g); g.dataset.cgcol = col;
      if (!mob && groups.length > 1) g.insertAdjacentHTML('afterbegin', `<span class="gdrag cgdrag" title="Drag to rearrange" aria-hidden="true">⠿</span>`);
      // (On phones groups aren't rearranged — keep the headers clean.)
    });
  });
}
function cgSetOrder(col, keys, moved) { S.cgOrder = Object.assign({}, S.cgOrder, { [col]: keys }); pendingLabel = 'Rearrange ' + (col === 'bonus' ? 'bonus action' : col) + (moved ? ': ' + moved : ''); save(); render('combat'); refresh(); }
function cgStep(col, k, d) {
  const keys = [...$$(`#page-combat .econ[data-col="${col}"] .econ-body > .cgmov`)].map(g => g.dataset.cgk), at = keys.indexOf(k), to = at + d;
  if (at < 0 || to < 0 || to >= keys.length) return; keys.splice(at, 1); keys.splice(to, 0, k); cgSetOrder(col, keys, k);
}
let CGDRAG = null;
document.addEventListener('pointerdown', e => {
  const h = e.target.closest && e.target.closest('.cgdrag'); if (!h || e.button > 0 || isMobile()) return;
  const grp = h.closest('.cgmov'); if (!grp) return; e.preventDefault(); e.stopPropagation();
  const hd = grp.querySelector(':scope > .cspg-h') || grp, r = hd.getBoundingClientRect(), ghost = document.createElement('div');
  ghost.className = 'bdrag-ghost cspg spg-ghost ' + [...grp.classList].filter(c => /^g-/.test(c)).join(' '); const st = grp.getAttribute('style'); if (st) ghost.setAttribute('style', st); ghost.appendChild(hd.cloneNode(true));
  Object.assign(ghost.style, { position: 'fixed', width: r.width + 'px', left: r.left + 'px', top: r.top + 'px' }); document.body.appendChild(ghost);
  const line = document.createElement('div'); line.className = 'spg-drop'; grp.before(line);
  grp.classList.add('bdrag-src'); CGDRAG = { grp, col: grp.dataset.cgcol, ghost, line, dx: e.clientX - r.left, dy: e.clientY - r.top, before: grp, moved: false };
  document.body.classList.add('idragging');
}, true);
document.addEventListener('pointermove', e => {
  const d = CGDRAG; if (!d) return; e.preventDefault(); d.moved = true;
  d.ghost.style.left = (e.clientX - d.dx) + 'px'; d.ghost.style.top = (e.clientY - d.dy) + 'px';
  const groups = [...d.grp.parentElement.querySelectorAll(':scope > .cgmov')];
  let tgt = null; for (const g of groups) { const b = g.getBoundingClientRect(); if (e.clientY < b.top + Math.min(b.height, 50) / 2) { tgt = g; break; } }
  if (tgt) tgt.before(d.line); else groups[groups.length - 1].after(d.line); d.before = tgt;
  const edge = 60; if (e.clientY < edge) scrollBy(0, -12); else if (e.clientY > innerHeight - edge) scrollBy(0, 12);
}, { passive: false });
function cgdragEnd(cancel) {
  const d = CGDRAG; if (!d) return; CGDRAG = null; document.body.classList.remove('idragging'); d.ghost.remove(); d.line.remove(); d.grp.classList.remove('bdrag-src');
  if (cancel || !d.moved) return;
  const keys = [...d.grp.parentElement.querySelectorAll(':scope > .cgmov')].map(g => g.dataset.cgk).filter(k => k !== d.grp.dataset.cgk);
  let at = d.before && d.before !== d.grp ? keys.indexOf(d.before.dataset.cgk) : -1; if (d.before === d.grp) return; if (at < 0) at = keys.length;
  const was = [...d.grp.parentElement.querySelectorAll(':scope > .cgmov')].map(g => g.dataset.cgk);
  keys.splice(at, 0, d.grp.dataset.cgk); if (keys.join() === was.join()) return;
  cgSetOrder(d.col, keys, (d.grp.querySelector('.cspg-h b') || {}).textContent || '');
}
document.addEventListener('pointerup', () => cgdragEnd(false));
document.addEventListener('pointercancel', () => cgdragEnd(true));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && CGDRAG) cgdragEnd(true); });

// ================= Monk bonus-action strikes =================
// Martial Arts: one unarmed strike as a bonus action after the Attack action. Flurry of Blows: 1 ki for two.
const unarmedIdx = () => S.attacks.findIndex(a => /^unarmed strike$/i.test(String(a.name).trim()));
function monkStrikes(n, label) {
  const k = unarmedIdx(); if (k < 0) { toast('There is no Unarmed Strike attack on the sheet.', 'fumble'); return; }
  // Rolled right away (not on a timer) so Roll20 / manual dice modes can ask for each roll in turn.
  for (let x = 0; x < n; x++) attackRoll(k, true, { label: label + (n > 1 ? ' (strike ' + (x + 1) + ')' : '') });
}
function martialArtsBonus(go) {
  if (S.inCombat) {
    if ((S.turn.used || {}).bonus) { toast('Your bonus action is already used this turn.', 'fumble'); return; }
    if (!go && !N(S.turn.attacks)) { toast('<b>Martial Arts</b> — the bonus unarmed strike comes after you take the Attack action this turn.', 'fumble', 7000, { label: 'Strike anyway', fn: () => martialArtsBonus(true) }); return; }
    S.turn.used.bonus = true; pendingLabel = 'Martial Arts bonus strike'; update();
  }
  monkStrikes(1, 'Martial Arts strike');
}
const flurryAct = (i, j) => { const f = S.features[i], a = f && j != null && (fxOf(f).acts || [])[N(j)]; return !!(a && /^flurry of blows$/i.test(String(a.name).trim())); };
function flurryOfBlows(i, j, col, go) {
  if (S.inCombat) {
    if ((S.turn.used || {}).bonus) { toast('Your bonus action is already used this turn.', 'fumble'); return; }
    if (!go && !N(S.turn.attacks)) { toast('<b>Flurry of Blows</b> — comes right after you take the Attack action this turn.', 'fumble', 7000, { label: 'Use it anyway', fn: () => flurryOfBlows(i, j, col, true) }); return; }
  }
  const before = JSON.stringify(S.features.map(f => f.used));
  useAct(i, j, col || 'bonus');
  if (JSON.stringify(S.features.map(f => f.used)) === before) return; // not enough ki — useAct already said so
  monkStrikes(2, 'Flurry of Blows');
}

// ================= Things that replace one attack of the Attack action =================
// With Extra Attack (or any multi-attack Attack action) these use up one attack, not the whole action.
const ATK_REPLACE = /^(grapple|shove|disarm|breath weapon|metallic breath weapon|enervating breath|repulsion breath|breath of the dragon|breathe again\b.*)$/i;
const atkReplaceable = nm => ATK_REPLACE.test(String(nm || '').trim());
// null: not one of these (or not in initiative) · false: blocked (and says why) · true: fine to use.
function atkReplaceOK(nm, col) {
  if (!S.inCombat || col !== 'action' || !atkReplaceable(nm)) return null;
  const per = attacksPerAction(), done = N(S.turn.attacks);
  if ((S.turn.used || {}).action && (done === 0 || done >= per)) { toast(done ? `No attacks left this turn (${per}).` : 'Your action is already used this turn.', 'fumble'); return false; }
  return true;
}
// Spends one attack; returns a short line for the toast (or '' when it doesn't apply).
function atkReplaceSpend(nm, col) {
  if (atkReplaceOK(nm, col) !== true) return '';
  const per = attacksPerAction(); S.turn.attacks = N(S.turn.attacks) + 1; S.turn.used.action = true;
  return per > 1 ? `Uses attack ${S.turn.attacks} of ${per} of your Attack action` : '';
}

// ================= Stunning Strike (monk 5) =================
// Not an action: when you hit with a melee weapon attack (unarmed strikes count), you can spend 1 ki. The target makes a
// CON save against your ki DC (8 + proficiency + WIS) or is stunned until the end of your next turn. Any number of
// times a turn, as long as you have ki — once per hit.
const isStunStrike = f => !!f && /^stunning strike$/i.test(String(f.name || '').trim()) && (!f.cls || f.cls === 'monk');
const stunStrikeFeat = () => clsLv('monk') >= 5 ? S.features.find(isStunStrike) : null;
const stunKi = () => S.features.find(f => /^ki( points)?$/i.test(String(f.name).trim()));
const stunKiLeft = () => { const k = stunKi(); return k ? Math.max(0, (featMax(k) || 0) - N(k.used)) : 0; };
const stunDC = () => { const f = stunStrikeFeat(); return (f && dcVal('wis', 'monk')) || (8 + profB() + mod('wis')); };
function profB() { return Math.ceil(lvl() / 4) + 1; }
function stunRowHTML() {
  if (!stunStrikeFeat()) return '';
  return `<div class="row stunrow"><button class="btn sm" data-act="stunstrike" title="Use right after a melee hit — not an action">Stunning Strike <small>1 ki</small></button><span class="hint">After a melee hit (unarmed counts): DC ${stunDC()} CON save or stunned until the end of your next turn. Once per hit.</span></div>`;
}
// Hand of Harm (Way of Mercy): like a smite for unarmed strikes. Tick it and your next unarmed hit spends 1 ki and adds
// a Martial Arts die + WIS necrotic, once per turn (free during Flurry of Blows from 11th level: untick "costs ki").
const maDie = () => '1' + (martialDie() || 'd4');
const harmFeat = () => S.features.find(f => /^hand of harm$/i.test(String(f.name).trim()));
function harmRowHTML() {
  if (!harmFeat()) return ''; const on = !!S.harmArm, used = S.inCombat && S.turn.harm;
  return `<label class="smite-chk harm${on ? ' on' : ''}"><input type="checkbox" data-harmarm${on ? ' checked' : ''}${used ? ' disabled' : ''}><span><b>Hand of Harm</b><small>${used ? 'Already used this turn' : `Next unarmed hit · +${maDie()} + WIS necrotic${hasFeature("Physician's Touch") ? ', target poisoned' : ''}`}</small></span><em class="sm-cost${stunKiLeft() < 1 ? ' none' : ''}" title="${stunKiLeft()} ki left">1 ki · ${stunKiLeft()} left</em></label>`;
}
document.addEventListener('change', e => { const t = e.target;
  if (t.matches && t.matches('[data-smitearm]')) { S.smiteArm = { on: t.checked, l: smiteSel() }; pendingLabel = t.checked ? 'Divine Smite ready' : 'Divine Smite off'; save(); refresh(); }
  if (t.matches && t.matches('[data-harmarm]')) { S.harmArm = t.checked; pendingLabel = t.checked ? 'Hand of Harm ready' : 'Hand of Harm off'; save(); refresh(); } });
function stunningStrike() {
  const f = stunStrikeFeat(); if (!f) return;
  const err = fxSpend({ from: (stunKi() || {}).name || 'Ki', n: 1 }, 'monk'); if (err) { toast(esc(err), 'fumble'); return; }
  pendingLabel = 'Stunning Strike'; update(); render();
  toast(`<div><b>Stunning Strike</b> · 1 ki <span class="hint">(${stunKiLeft()} left)</span><div class="det">The creature you just hit makes a <b>DC ${stunDC()} Constitution save</b>. On a fail it is <b>Stunned</b> until the end of your next turn: it can't move or take actions or reactions, automatically fails STR and DEX saves, and attacks against it have advantage.</div><div class="det">Doesn't use your action — you can try again on each hit while you have ki.</div></div>`, '', 12000, { label: 'Undo', fn: () => undo(1) });
}

// ================= Haste =================
// While hasted you get one extra action each turn — only Attack (one weapon attack), Dash, Disengage, Hide or Use an
// Object. When Haste ends you're lethargic: you can't move or take actions until after your next turn.
function hasteBlockHTML() {
  if (!S.inCombat || !hasted()) return '';
  const used = !!S.turn.haste;
  const rows = S.attacks.map((a, i) => [a, i]).filter(([a]) => atkShown(a) && (!a.effect || a.weaponLike))
    .map(([a, i]) => `<tr><td>${esc(a.name)}</td><td>${rollBtn('atk:' + i, a.name + ' attack')}</td><td>${rollBtn('dmg:' + i, a.name + ' damage')}</td><td><button class="btn gold sm atkbtn" data-act="hasteact" data-k="atk" data-i="${i}" ${used ? 'disabled' : ''} title="One weapon attack with your Haste action">⚔</button></td></tr>`).join('');
  return `<div class="block hasteblk${used ? ' used' : ''}"><div class="sect">Haste action <span class="tag">${used ? 'used this turn' : '1 extra'}</span><span class="grow"></span></div>
    <div class="hint" style="margin-bottom:4px">One extra action each turn: a single weapon attack, Dash, Disengage, Hide or Use an Object.</div>
    ${rows ? `<table class="mini">${rows}</table>` : ''}
    <div class="chips">${[['dash', 'Dash'], ['disengage', 'Disengage'], ['hide', 'Hide'], ['object', 'Use an Object']].map(([k, t]) => `<button class="chip" data-act="hasteact" data-k="${k}" ${used ? 'disabled' : ''}>${t}</button>`).join('')}</div></div>`;
}
function hasteAct(k, i) {
  if (!hasted()) return;
  if (incapCond()) { toast(`You're <b>${incapCond().toLowerCase()}</b> — you can't take actions.`, 'fumble'); return; }
  if (S.turn.haste) { toast('You already used your Haste action this turn.', 'fumble'); return; }
  S.turn.haste = true; pendingLabel = 'Haste action';
  if (k === 'atk') { const a = S.attacks[N(i)]; update(); render('combat'); attackRoll(N(i), true, { label: (a ? a.name : 'Attack') + ' (Haste action)' }); return; }
  if (k === 'dash') { addDash(); update(); render('combat'); toast(`<b>Dash</b> (Haste action) — +${turnSpeed()} ft of movement this turn.`, '', 5000, { label: 'Undo', fn: () => undo(1) }); return; }
  if (k === 'disengage') { S.turn.disengaged = true; update(); render('combat'); toast('<b>Disengage</b> (Haste action) — moving won’t provoke opportunity attacks this turn.', '', 5000, { label: 'Undo', fn: () => undo(1) }); return; }
  if (k === 'hide') { update(); render('combat'); const s = S.skills.findIndex(x => x.name === 'Stealth'); if (s >= 0) doRoll('skill:' + s); return; }
  update(); render('combat'); toast('<b>Use an Object</b> (Haste action) — drink a potion, pull a lever, draw a second item…', '', 5000, { label: 'Undo', fn: () => undo(1) });
}
function hasteWatch() {
  const h = hasted();
  if (S._hasted && !h && S.inCombat && !N(S.lethargy)) { S.lethargy = 1; setTimeout(() => toast('<b>Haste ended.</b> A wave of lethargy follows — on your next turn you can’t move or take actions.', 'fumble', 9000), 150); }
  S._hasted = h;
}
