
// ---------- Spell helpers ----------
const SPI = n => DND.spellIndex[String(n || '').toLowerCase()];
const AUTO = n => DND.spellAuto[n] || {};
const DMGTYPES = DND.damageTypes.map(t => t.toLowerCase());
function casterFor(key) { return casters().find(c => c.key === key); }
const isPrepCaster = key => { const c = casterFor(key); return !!(c && c.prepared); };
function spReady(sp) { if (sp.always || N(sp.level) === 0) return true; if (!casterFor(sp.cls)) return true; return isPrepCaster(sp.cls) ? !!sp.prepared : true; }
const countPrep = key => S.spells.filter(s => s.cls === key && !s.always && N(s.level) > 0 && s.prepared).length;
const countKnown = key => S.spells.filter(s => s.cls === key && !s.always && N(s.level) > 0).length;
const countCantrips = key => S.spells.filter(s => s.cls === key && !s.always && N(s.level) === 0).length;
function spellLimit(c) { return c.prepared ? preparedMax(c) : c.known ? N(c.known[Math.min(19, c.level - 1)]) : null; }
function cantripLimit(c) { return c.cantrips ? N(c.cantrips[Math.min(19, c.level - 1)]) : null; }
const clsName = k => (CL[k] ? CL[k].name : { race: 'Racial', feat: 'Feat', item: 'Item', other: 'Other' }[k] || 'Other');
const cantripTier = () => (lvl() >= 17 ? 4 : lvl() >= 11 ? 3 : lvl() >= 5 ? 2 : 1);
function castCol(t) { t = String(t || '').toLowerCase(); if (/bonus/.test(t)) return 'bonus'; if (/reaction/.test(t)) return 'reaction'; if (/^\s*1?\s*action/.test(t)) return 'action'; return null; }
function termTypesFor(o) {
  const terms = String(o.dice || '').match(/\d*d\d+/g) || [], types = String(o.type || '').split(/\s*\+\s*/).filter(Boolean);
  const bond = /Enhanced Bond/.test(o.note || '');
  return terms.map((t, i) => (bond && i === terms.length - 1 ? 'fire' : types[i] || types[0] || ''));
}
function addDice(a, b) { if (!a) return b; if (!b) return a; return a + '+' + b; }
// Work out what a spell does at a given slot level: damage dice, save, attack, healing.
function spellMath(sp, L) {
  const a = spAuto(sp), sum = String(sp.summary || ''), base = N(sp.level);
  L = L || base;
  const o = { dice: '', type: '', save: '', attack: false, half: false, heal: '', temp: '', note: a.note || '' };
  const special = a.buff || a.rider || a.summon || a.familiar || a.steed || a.conjure || a.form || a.heal || a.temp || a.maxHp || a.weaponSpell || a.spiritual || a.beams || a.darts || a.weapon;
  if (a.dmg) { o.dice = a.dmg; o.type = a.type || ''; }
  else if (!special || a.temp) {
    const re = /(\d+d\d+(?:\s*\+\s*\d+d\d+)*(?:\s*\+\s*\d+)?)\s+([a-z]+)(?:\s+or\s+([a-z]+))?/ig; let m;
    while ((m = re.exec(sum))) { if (DMGTYPES.includes(m[2].toLowerCase())) { o.dice = m[1].replace(/\s+/g, ''); o.type = m[2] + (m[3] ? ' or ' + m[3] : ''); break; } }
  }
  if (a.type && !o.type) o.type = a.type;
  const sv = sum.match(/\b(STR|DEX|CON|INT|WIS|CHA)\b save/i); if (sv) o.save = sv[1].toUpperCase();
  o.attack = !!a.attack || /spell attack/i.test(sum) || !!a.beams;
  o.half = /half/i.test(sum);
  if (o.dice && a.up && L > base) { const m = String(a.up).match(/(\d+)d(\d+)/); if (m) o.dice = addDice(o.dice, (N(m[1]) * (L - base)) + 'd' + m[2]); }
  if (base === 0 && DND.cantripScale.includes(sp.name) && o.dice) o.dice = diceTimes(o.dice, cantripTier());
  if (a.heal) {
    const ci = spellCI(sp), M = ci.mod != null ? ci.mod : 0;
    let h = String(a.heal).replace('+M', M ? sgn(M) : '');
    if (a.healUp && L > base) { const m = String(a.healUp).match(/^(\d+)d(\d+)$/); h = m ? addDice(h, N(m[1]) * (L - base) + 'd' + m[2]) : String(N(h) + N(a.healUp) * (L - base)); }
    if (L > 0 && hasSub('cleric', 'life') && h !== 'all') h = addDice(h, String(2 + L));
    o.heal = h;
  }
  // Circle of Wildfire: while the spirit is summoned, fire damage and healing spells get +1d8.
  if (hasFeature('Enhanced Bond') && S.companions.some(c => c.tmpl === 'Wildfire Spirit')) { if (o.dice && /fire/i.test(o.type)) { o.dice = addDice(o.dice, '1d8'); o.note = (o.note ? o.note + ' · ' : '') + 'Enhanced Bond +1d8'; } if (o.heal && o.heal !== 'all') { o.heal = addDice(o.heal, '1d8'); o.note = (o.note ? o.note + ' · ' : '') + 'Enhanced Bond +1d8'; } }
  // Arcane Firearm (Artillerist): +1d8 to one damage roll of a spell cast through the firearm. Rays/darts get it on one roll (at cast time).
  if (hasFeature('Arcane Firearm') && o.dice && !a.beams && !a.rays && !a.darts) { o.dice = addDice(o.dice, '1d8'); o.note = (o.note ? o.note + ' · ' : '') + 'Arcane Firearm +1d8'; }
  // Potent Spellcasting: cleric cantrips add WIS to damage.
  if (base === 0 && o.dice && sp.cls === 'cleric' && hasFeature('Potent Spellcasting')) { const w = mod('wis'); if (w) o.dice += sgn(w); }
  // Damage type of each dice term, in order (Flame Strike: fire + radiant) — Elemental Adept only touches its own type.
  o.termTypes = termTypesFor(o);
  if (a.temp) o.temp = a.tempUp && L > base ? String(a.temp).replace(/^(\d+)$/, (x) => String(N(x) + N(a.tempUp) * (L - base))).replace(/\+(\d+)$/, (x, n) => '+' + (N(n) + N(a.tempUp) * (L - base))) : a.temp;
  return o;
}

// ---------- Spells page ----------
function slotPips(i) {
  const max = slotMax(i), used = Math.min(N(S.slotsUsed[i]), max), left = max - used;
  let h = ''; for (let j = 0; j < max; j++) h += `<button class="pip${j < left ? '' : ' spent'}" data-pip="slot" data-i="${i}" data-j="${j}" aria-label="${ORD[i]} slot ${j + 1}"></button>`;
  return h || '<span class="hint">none</span>';
}
function pactPips() {
  const p = pact(); if (!p) return '';
  const left = pactLeft(); let h = '';
  for (let j = 0; j < p.count; j++) h += `<button class="pip pact${j < left ? '' : ' spent'}" data-pip="pact" data-j="${j}" aria-label="Pact slot ${j + 1}"></button>`;
  return h;
}
const spellTags = (s, noAlways) => (s.always && !noAlways ? '<span class="tag oath" title="Always prepared; doesn\'t count against your limit">Always</span>' : '') + (s.conc ? '<span class="tag">Conc</span>' : '') + (s.ritual ? '<span class="tag">Ritual</span>' : '') + (s.atWill ? '<span class="tag" title="Cast without a slot">At will</span>' : '') + (s.uses ? `<span class="tag" title="Free casts">${Math.max(0, evalMax(s.uses.max) - N(s.uses.used))}/${evalMax(s.uses.max)} free</span>` : '');
function prepCell(s, i) {
  if (s.always) return '<span class="always" title="Always prepared; doesn\'t count against your limit">Always</span>';
  if (N(s.level) === 0) return '<span class="always known cant" title="Cantrips are always ready">—</span>';
  if (!isPrepCaster(s.cls)) return '<span class="always known" title="Known spell: always ready">Known</span>';
  return `<label class="prepbox" title="Prepared">${chk(`spells.${i}.prepared`, 'Prepared')}</label>`;
}
// Real spell slots (from a class, pact magic or custom slots) — not just spells stored in an item
const realSlots = () => casters().length > 0 || !!pact() || [0, 1, 2, 3, 4, 5, 6, 7, 8].some(k => slotMax(k) > 0);
function slotsPanelInner() {
  return `${(() => { const cl = typeof casters === 'function' ? casters() : []; return cl.length ? `<div class="cs-scstats">${cl.map(c => `<div class="cs-scrow">${cl.length > 1 ? `<span class="cs-scn">${esc(c.name)}</span>` : ''}<span class="cs-sc"><small><span class="ciw top">Save DC${ciBtn('dc:' + c.key, 'your spell save DC')}</span></small><b data-calc="dc:${c.key}"></b></span><span class="cs-sc"><small><span class="ciw top">Spell attack${ciBtn('satk:' + c.key, 'your spell attack')}</span></small>${rollBtn('spellatk:' + c.key, c.name + ' spell attack')}</span></div>`).join('')}</div>` : ''; })()}<div data-calc-html="slotsall"></div><p class="hint" style="margin:6px 0 0">${realSlots() ? 'Spent automatically when you cast or smite. Tap a diamond to adjust.' : 'Each stored spell is used up when you cast it.'}</p>${typeof ringItems === 'function' && ringItems().length ? `<div class="rs-btns">${ringItems().map(([it, ii]) => `<button class="btn sm gold" data-act="ringstore" data-i="${ii}">Store a spell${ringItems().length > 1 ? ' in ' + esc(it.name) : ''} <small>${ringUsed(it)}/${ringCap(it)}</small></button>`).join('')}</div>` : ''}`;
}
// The Active Spells panel — the same one on Combat and (compact) on Spells.
function activeFxInner(small) {
  const H = small ? 'h3 class="sc-slottitle"' : 'h2', h = small ? 'h3' : 'h2';
  return `<${H}><span class="grow">Active Spells</span>${wildOn() ? '<button class="btn sm surgebtn" data-act="wildsurge" title="Roll on the Wild Magic Surge table (restores Tides of Chaos)">✦ Wild Magic Surge</button>' : ''}<span class="timebtns"><span class="hint">Time passes:</span><button class="btn sm" data-act="passtime" data-r="10">+1 min</button><button class="btn sm" data-act="passtime" data-r="100">+10 min</button><button class="btn sm" data-act="passtime" data-r="600">+1 hr</button></span></${h}>
      <div class="fxchips${small ? '' : ' big'}" data-calc-html="fxchips"></div>
      <p class="hint" style="margin:6px 0 0">Durations count down each Next Turn. Spells that deal damage each turn get a roll button. Taking damage while concentrating prompts a CON save.</p>`;
}
function renderSpells() {
  const m = isMobile(), cs = casters(), p = pact();
  const tiles = cs.map(c => {
    const lim = spellLimit(c), cl = cantripLimit(c);
    const kind = c.type === 'pact' ? 'Pact Magic' : c.type === 'full' ? 'Full caster' : c.type === 'half' || c.type === 'artificer' ? 'Half caster' : 'Third caster';
    const mine = S.spells.filter(x => x.cls === c.key && !x.stored && spReady(x)), byL = {};
    mine.forEach(x => byL[N(x.level)] = (byL[N(x.level)] || 0) + 1);
    const lv = Object.keys(byL).map(Number).sort((a, b) => a - b);
    return `<div class="sc-slotpanel sc-clspanel"><h3 class="sc-slottitle">${esc(c.name)} <span class="sc-sub">${ABN[c.ab]} · ${kind}</span></h3>
      <div class="cs-scstats"><div class="cs-scrow">
        ${lim != null ? `<span class="cs-sc prep-tile" data-prepfor="${c.key}"><small>${c.prepared ? 'Prepared' : 'Known'}</small><b class="big" data-calc="prepct:${c.key}"></b></span>` : ''}
        ${cl ? `<span class="cs-sc prep-tile" data-cantfor="${c.key}"><small>Cantrips</small><b class="big" data-calc="cantct:${c.key}"></b></span>` : ''}</div></div>
      ${lv.length ? `<div class="sc-bylv"><span class="sc-bylv-h">Ready to cast</span>${lv.map(L => `<span class="sc-lvchip"><b>${byL[L]}</b> ${L ? ORD[L - 1] : 'cantrip' + (byL[L] > 1 ? 's' : '')}</span>`).join('')}</div>` : ''}
      <div class="sc-clsbtns">${c.prepared ? `<button class="btn gold" data-act="prepare" data-cls="${c.key}">Prepare spells</button>` : ''}${!c.prepared || c.book ? `<button class="btn ghost" data-act="addspells" data-cls="${c.key}">+ ${esc(c.name)} ${c.book ? 'spellbook' : 'spells'}</button>` : ''}</div>
    </div>`;
  }).join('');
  const slotCards = [];
  for (let i = 0; i < 9; i++) {
    if (slotMax(i) === 0 && !(S.slotsOverride[i] !== '' && S.slotsOverride[i] != null)) continue;
    slotCards.push(`<div class="slot"><div class="top"><span class="lbl">${ORD[i]} level</span><span class="ct" data-calc="slotct:${i}"></span></div><div class="pips" data-calc-html="slotpips:${i}" style="margin-top:6px"></div></div>`);
  }
  S.spells.forEach((sp, si) => { if (!sp.stored) return; const it = spItem(sp), lv = Math.max(N(sp.level), N(sp.uses && sp.uses.level));
    slotCards.push(`<div class="slot storeslot" title="${sp.cls === 'artificer' ? 'Spell-Storing Item' : 'Stored spell'}: ${esc(sp.name)}${it ? ' in ' + esc(it.name) : ''} (${ORD[lv - 1] || ''} level). Doesn't refill on a rest — store again to refill."><div class="top"><span class="lbl">Stored</span><span class="ct" data-calc="storect:${si}"></span></div><div class="storenm">${esc(sp.name)}${lv > N(sp.level) ? ' <small>(' + ORD[lv - 1] + ')</small>' : ''}</div><div class="pips" data-calc-html="storepips:${si}" style="margin-top:6px"></div></div>`); });
  if (p) slotCards.push(`<div class="slot pactslot"><div class="top"><span class="lbl">Pact · ${ORD[p.level - 1]}</span><span class="ct" data-calc="pactct"></span></div><div class="pips" data-calc-html="pactpips" style="margin-top:6px"></div></div>`);
  const cust = spCustom(); if (cust) spCatsEnsure();
  const order = cust ? spCustomOrder() : S.spells.map((s, i) => i).sort((a, b) => N(S.spells[a].level) - N(S.spells[b].level) || String(S.spells[a].name).localeCompare(S.spells[b].name));
  const f = S.spellFilter || 'all';
  const shown = order.filter(i => { const s = S.spells[i]; if (f === 'ready' && !spReady(s)) return false; if (/^\d$/.test(f) && String(N(s.level)) !== f) return false; if (f.startsWith('c:') && s.cls !== f.slice(2)) return false; return true; });
  const meta = s => [s.time, s.range, s.duration].filter(Boolean).map(esc).join(' · ');
  const detail = (s, i) => `<div class="detail-grid">
      ${fld('Name', inp(`spells.${i}.name`))}${fld('Your name for it', inp(`spells.${i}.flavor`, { ph: 'e.g. Smog Beam' }))}${fld('Level', inp(`spells.${i}.level`, { num: 1 }))}${fld('Casting time', inp(`spells.${i}.time`))}${fld('Range', inp(`spells.${i}.range`))}
      ${fld('Duration', inp(`spells.${i}.duration`))}${fld('Components', inp(`spells.${i}.comps`))}${fld('School', inp(`spells.${i}.school`))}
      ${fld('Class', sel(`spells.${i}.cls`, clsRows().map(r => [r.key, clsName(r.key)]).concat([['race', 'Racial'], ['feat', 'Feat'], ['item', 'Item'], ['other', 'Other']])))}
      <label class="checkline">${chk(`spells.${i}.conc`)} Concentration</label><label class="checkline">${chk(`spells.${i}.ritual`)} Ritual</label><label class="checkline">${chk(`spells.${i}.always`)} Always prepared</label>
      ${fld('Needs item', sel(`spells.${i}.item`, [['', '— none —']].concat(S.inventory.map(it => [it.id, it.name]))), '')}
      ${s.auto ? '' : `${fld('Upcast dice', inp(`spells.${i}.hb.up`, { ph: 'e.g. 2d4 per level' }))}${fld('Crits on', inp(`spells.${i}.hb.crit`, { ph: '20', num: 1 }))}<label class="checkline">${chk(`spells.${i}.hb.missHalf`)} Half damage on a miss</label>${fld('Backlash after 1st cast', inp(`spells.${i}.hb.backlash`, { ph: 'e.g. 1d10+slot' }))}${fld('Backlash type', inp(`spells.${i}.hb.backlashType`, { ph: 'fire' }))}`}
      ${s.src ? `<span class="hint">Source: ${esc(DND.sources[s.src] || s.src)}</span>` : ''}
      ${m ? `<div style="text-align:right"><button class="btn red" data-act="del" data-list="spells" data-i="${i}">Remove spell</button></div>` : ''}</div>
      ${fullOfSpell(s) ? `<div class="fullbox">${fullHTML(fullOfSpell(s))}${isSRDKey('sp:' + s.name) && !String(s.full || '').trim() ? '<div class="hint srdnote">Text: SRD 5.1, CC-BY-4.0</div>' : ''}</div>` : ''}
      ${fld('Short summary (shown on the Combat tab)', ta(`spells.${i}.summary`, { rows: 2, label: 'Short summary', ph: 'What the spell does' }))}
      ${fld('Your own wording (replaces the full description when filled in)', ta(`spells.${i}.full`, { rows: 4, label: 'Your own wording', ph: 'Optional — paste or type your preferred description' }))}
      ${ta(`spells.${i}.note`, { rows: 1, label: 'Your notes', ph: 'Your notes' })}`;
  // Spells sit in the same collapsible groups as the Combat tab (Level, Purpose or your own categories), and the
  // groups can be dragged into any order.
  const castBtn = i => `<button class="btn gold${m ? '' : ' sm'}" data-act="cast" data-i="${i}" title="Cast and apply its effects">Cast</button>`;
  const rowM = i => { const s = S.spells[i], open = UI.open['spell:' + i];
    return `<div class="sp-card${spReady(s) ? '' : ' unprep'}" data-si="${i}"><div class="sp-top">${cust ? spOrdCtl(i) : ''}
        <button class="sp-name" data-act="toggle" data-key="spell:${i}" aria-expanded="${!!open}">${spDisp(s)}<span class="caret">${open ? '▴' : '▾'}</span></button><button class="notetip" data-tip="${i}" data-tipkind="sp" aria-label="What ${esc(s.name)} does">ⓘ</button><span class="grow"></span>${castBtn(i)}</div>
        <div class="sp-meta">${prepCell(s, i)}${spellTags(s, true)} <span class="tag cls">${esc(spItem(s) ? '◆ ' + spItem(s).name : clsName(s.cls))}</span> ${meta(s)}</div><div class="sp-sum">${esc(s.summary || '')}</div>
        ${open ? `<div class="sp-detail">${detail(s, i)}</div>` : ''}</div>`; };
  const rowT = i => { const s = S.spells[i], open = UI.open['spell:' + i];
    return `<tr class="${spReady(s) ? '' : 'unprep'}" data-si="${i}"><td class="spc-p" style="text-align:center">${prepCell(s, i)}</td>
        <td class="spname">${cust ? spOrdCtl(i) : ''}<b class="spn">${spDisp(s)}</b><button class="notetip" data-tip="${i}" data-tipkind="sp" aria-label="What ${esc(s.name)} does">ⓘ</button> ${spellTags(s, true)}${spItem(s) ? ` <span class="tag cls" title="From an item">◆ ${esc(spItem(s).name)}</span>` : cs.length > 1 || !CL[s.cls] ? ` <span class="tag cls">${esc(clsName(s.cls))}</span>` : ''}<small class="spmeta">${esc([s.time, s.range, s.duration].filter(Boolean).join(' · '))}</small></td>
        <td class="nowrap spc-t">${esc(s.time || '')}</td><td class="nowrap spc-r">${esc(s.range || '')}</td><td class="nowrap spc-d">${esc(s.duration || '')}</td>
        <td class="sumcell">${esc(s.summary || '')}</td>
        <td class="nowrap spc-c">${castBtn(i)}</td><td class="spc-o"><button class="btn ghost sm" data-act="toggle" data-key="spell:${i}" aria-expanded="${!!open}" title="Details / edit">${open ? '▴' : '▾'}</button></td><td class="spc-x">${del('spells', i)}</td></tr>${open ? `<tr class="detail"><td></td><td colspan="8">${detail(s, i)}</td></tr>` : ''}`; };
  const mode = spMode(), gl = spGroupsFor(mode, shown, f === 'all'), movable = gl.filter(g => g.k !== 'c:none');
  const list = gl.map(g => { const open = cgOpen('sptab', g.k), mi = movable.indexOf(g);
    const body = !g.items.length ? '<p class="hint spg-empty">Empty — drag spells here or use a spell’s ⇄</p>' : m ? `<div class="spg-cards">${g.items.map(rowM).join('')}</div>` : `<table class="grid spells spg-t"><tbody>${g.items.map(rowT).join('')}</tbody></table>`;
    return `<div class="cspg spg g-${g.cls}${open ? '' : ' shut'}" data-gk="${esc(g.k)}" style="--g:${esc(g.color)}">${spgHead('sptab', g, mode, g.items.length, open, mi === 0, mi === movable.length - 1)}${open ? `<div class="cspg-b">${body}</div>` : ''}</div>`; }).join('');
  const lvls = [...new Set(S.spells.map(s => N(s.level)))].sort((a, b) => a - b);
  const filt = [['all', 'All'], ['ready', 'Ready to cast']].concat(cs.length > 1 ? cs.map(c => ['c:' + c.key, c.name]) : []).concat(lvls.map(l => [String(l), l === 0 ? 'Cantrips' : ORD[l - 1]]));
  $('#page-spells').innerHTML = `
  ${noSlots() ? `<div class="panel cs-fx" ${PID('spellcasting')}>${activeFxInner(false)}</div>` : `<div class="cstrip">
    <div class="panel cs-slots" ${PID('spslots')}><h2><span class="grow">${realSlots() ? 'Spell Slots' : 'Stored spells'}</span>${realSlots() ? `<button class="btn ghost sm" data-act="toggle" data-key="slotcfg">${UI.open.slotcfg ? 'Done' : 'Customize'}</button>` : ''}</h2>${slotsPanelInner()}
      ${UI.open.slotcfg && realSlots() ? `<div style="margin-top:10px"><p class="hint">Slots follow the multiclass spellcaster table (caster level ${casterLevel()}). Type a number to override a level; blank = automatic.</p>
      <div class="slots">${ORD.map((o, i) => fld(o + ' max', inp('slotsOverride.' + i, { num: 1, ph: String(FULL[Math.min(20, casterLevel())][i] || 0) }))).join('')}</div></div>` : ''}${p ? '<p class="hint" style="margin:6px 0 0">Pact slots return on a short rest.</p>' : ''}</div>
    <div class="panel cs-fx" ${PID('spfx')}>${activeFxInner(false)}</div>
  </div>
  ${cs.length ? `<div class="panel" ${PID('spellcasting')}><h2>Spellcasting</h2><div class="sc-cards">${tiles}</div></div>` : ''}`}
  ${mmPanelHTML('mmspells')}
  <div class="panel" ${PID('spelllist')}><h2><span class="grow">Spells</span><button class="btn gold" data-act="addspells" data-cls="">+ Add spells</button><button class="btn" data-act="add" data-list="spells">+ Custom spell</button></h2>
    <div class="spsortbar"><span class="lbl">Group spells by</span><div class="segmini">${[['level', 'Level'], ['purpose', 'Purpose'], ['custom', 'My categories']].map(([k, t]) => `<button class="${ST('combatSpellSort') === k ? 'on' : ''}" data-act="spsort" data-k="${k}">${t}</button>`).join('')}</div>${cust ? '<button class="btn sm" data-act="spcatadd">+ Category</button><span class="hint">Drag spells to reorder them or move them between categories. ' + (m ? '' : 'Drag a category by its ⠿ to rearrange. ') + 'The Combat tab uses the same groups and order.</span>' : '<span class="hint">' + (m ? '' : 'Drag a group by its ⠿ to rearrange. ') + 'The Combat tab uses the same groups and order.</span>'}</div>
    <div class="filters">${filt.map(([k, t]) => `<button class="chip${f === k ? ' on' : ''}" data-act="filter" data-f="${k}">${esc(t)}</button>`).join('')}</div>
    ${!S.spells.length ? '<p class="hint">No spells yet. Use <b>Add spells</b> to pick from every spell in the allowed books.</p>' : m ? `<div class="sp-list spg-list">${list || '<p class="hint">No spells match this filter.</p>'}</div>` : `<div class="scrollx"><div class="spg-wrap"><table class="grid spells spg-th">
      <thead><tr><th class="spc-p">Prep</th><th class="spname">Name</th><th class="spc-t">Cast</th><th class="spc-r">Range</th><th class="spc-d">Duration</th><th class="sumcell">Effect</th><th class="spc-c"></th><th class="spc-o"></th><th class="spc-x"></th></tr></thead></table>
      <div class="spg-list">${list || '<p class="hint">No spells match this filter.</p>'}</div></div></div>`}
    <p class="hint" style="margin:8px 0 0">Cast spends the slot, starts concentration and duration timers, rolls damage or healing, applies buffs like AC or speed, and creates summons or transformations.</p>
  </div>`;
}

// ---------- Features page ----------
function featPips(i) {
  const f = S.features[i]; if (!f) return '';
  const max = featMax(f);
  if (max == null) return '';
  const left = Math.max(0, max - N(f.used));
  if (f.pool || max > 12) return `<span class="pool"><input class="f" data-pool="${i}" type="number" inputmode="numeric" value="${left}" aria-label="${esc(f.name)} remaining"> / ${max}</span>`;
  let h = ''; for (let j = 0; j < max; j++) h += `<button class="pip${j < left ? '' : ' spent'}" data-pip="feat" data-i="${i}" data-j="${j}" aria-label="${esc(f.name)} use ${j + 1}"></button>`;
  return h;
}
function scaleVal(tbl, L) { let v = ''; Object.keys(tbl).map(Number).sort((a, b) => a - b).forEach(k => { if (L >= k) v = tbl[k]; }); return v; }
const isInfPick = f => String(f.key || '').startsWith('pick:infusion:') && typeof INF === 'object' && !!INF[f.name];
function featGroup(f) { return f.cls ? f.cls : f.source === 'Race' || f.kind === 'race' ? 'race' : f.kind === 'feat' ? 'feat' : f.kind === 'bg' ? 'bg' : f.auto ? 'other' : 'custom'; }
// Features: read-only cards by default; tap ✎ to edit one. Grouped by where they come from.
// Class numbers that grow with level, matched to the feature they belong to (Sneak Attack → 4d6).
function classScaling(key) {
  const row = clsRows().find(r => r.key === key); if (!row || !CL[key]) return [];
  const c = CL[key], s = subOf(row), L = N(row.level);
  return (c.scaling || []).concat((s && s.scaling) || []).map(([n, t]) => [n, formulaDC(scaleVal(t, L))]).filter(x => x[1]);
}
const scaleWords = n => String(n).toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
function scalingMatches(fname, sname) { const f = String(fname).toLowerCase(), s = String(sname).toLowerCase(); return s.startsWith(f) || f.startsWith(s) || scaleWords(s).some(w => scaleWords(f).includes(w)); }
// Spells a feature gives: a class option's choices (e.g. Book of Shadows cantrips) or spells you attached yourself.
function featSpellsHTML(f, i, ed) {
  let h = '';
  const m = /^pick:(\w+):(.+)$/.exec(String(f.key || '')), op = m && DND.options[m[1]], e = op && op.list.find(x => x[0] === m[2]), fx = (e && e[3]) || {};
  if (fx.grant) {
    const have = (S.grantSpells || {})[m[2]] || [], need = fx.grant.reduce((t, g) => t + g.n, 0);
    h += `<div class="fc-spells"><span class="lbl">${esc(fx.grant.map(g => g.label).join(' · '))}</span>${have.map(n => `<span class="pbadge">${esc(n)}</span>`).join('')}
      <button class="btn sm${have.length < need ? ' gold' : ''}" data-act="grantpick" data-o="${esc(m[2])}" data-t="${m[1]}">${have.length < need ? `Choose (${have.length}/${need})` : 'Change'}</button></div>`;
  }
  if (fx.spells) h += `<div class="fc-spells"><span class="lbl">Spells</span>${fx.spells.map(n => `<span class="pbadge">${esc(n)}</span>`).join('')}${fx.spellNote ? `<span class="hint">${esc(fx.spellNote)}</span>` : ''}</div>`;
  const own = f.spells || [];
  if (own.length || ed) {
    h += `<div class="fc-spells"><span class="lbl">Spells from this feature</span>${own.map((n, j) => `<span class="pchip">${esc(n)}${ed ? `<button data-act="fspdel" data-i="${i}" data-j="${j}" aria-label="Remove ${esc(n)}">✕</button>` : ''}</span>`).join('') || (ed ? '<span class="hint">None yet</span>' : '')}
      ${ed ? `<input class="f fspadd" list="allspells" data-fsp="${i}" placeholder="+ Add a spell…" aria-label="Add a spell to this feature"><label class="checkline">${chk(`features.${i}.spellOnce`)} Once per long rest</label><label class="checkline">${chk(`features.${i}.spellAtWill`)} At will (no slot)</label>` : ''}</div>`;
  }
  return h;
}
// ---------- Homebrew automation form (custom features and items) ----------
// The HP ring (main HP panel and creature cards): gold arc for HP, blue arc after it for temp HP.
function hpRingSVG(cur, max, tmp, cls) {
  max = Math.max(1, N(max)); cur = Math.max(0, Math.min(N(cur), max)); tmp = Math.max(0, N(tmp));
  const r = 52, C = 2 * Math.PI * r, tot = Math.max(max, cur + tmp);
  const x = C * cur / tot, y = C * tmp / tot, low = cur / max <= 0.35 ? ' low' : '';
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="rt" cx="60" cy="60" r="${r}"/>
    <circle class="rf${low}${cls || ''}" cx="60" cy="60" r="${r}" stroke-dasharray="${x} ${C}" />
    ${tmp ? `<circle class="rtmp" cx="60" cy="60" r="${r}" stroke-dasharray="${y} ${C}" stroke-dashoffset="${-x}"/>` : ''}</svg>`;
}
function hbSummary(hb, it) {
  const fx = hbFx(hb) || {}, p = fx.passive || {}, u = fx.use || {}, b = [];
  if (p.resist) b.push('Resist ' + p.resist.join(', ')); if (p.immune) b.push('Immune ' + p.immune.join(', ')); if (p.condImmune) b.push("Can't be " + p.condImmune.join(', ').toLowerCase());
  if (p.advNote) b.push('Advantage notes'); if (p.sense) b.push(p.sense); ['fly', 'swim', 'climb'].forEach(k => { if (p[k]) b.push(k + ' ' + (p[k] === 'walk' ? '= walk' : p[k] + ' ft')); });
  if (p.ac) b.push('AC ' + sgn(N(p.ac))); if (p.saveAll) b.push('Saves +' + p.saveAll); if (p.init) b.push('Init +' + p.init); if (p.speed) b.push('Speed +' + p.speed);
  if (fx.roll) b.push('Rolls ' + fx.roll); if (fx.save) b.push(fx.save + ' save'); if (fx.cost) b.push('Costs ' + fxCostText(fx.cost)); if (u.effect) b.push('Starts ' + u.effect.name); if (u.temp) b.push('Temp HP'); if (u.heal) b.push('Heals'); if (fx.dash) b.push('Dash'); if (u.companion) b.push('Summons ' + u.companion);
  if (fx.attacks) b.push('Attack: ' + fx.attacks[0][0]);
  if (fx.refuel) b.push('Recovers a slot (≤ ' + ORD[fx.refuel - 1] + ')');
  if (hb && hb.othersDis) b.push('Curse: other weapons at disadvantage'); if (hb && hb.hurtSave) b.push(`DC ${hb.hurtDC || 10} ${String(hb.hurtSave).toUpperCase()} save when hurt`);
  if (it && (it.spells || []).length) b.push('Spells: ' + it.spells.join(', ')); if (it && it.charges && N(it.charges.max)) b.push(N(it.charges.max) + ' charges');
  return b;
}
function hbChips(it) {
  const out = [];
  if ((it.spells || []).length) out.push(`<span class="hbchip" title="${hbItemOn(it) ? 'Ready in your Spells tab' : 'Works once you ' + (it.attune && !it.attuned ? 'attune to it' : 'equip it')}">✦ ${esc(it.spells.join(', '))}${it.spellOnce ? ' · 1/long rest' : ''}${hbItemOn(it) ? '' : ' (inactive)'}</span>`);
  const p = (hbFx(it.hb) || {}).passive; if (p && p.resist) out.push(`<span class="hbchip${hbItemOn(it) ? '' : ' off'}">Resist ${esc(p.resist.join(', '))}</span>`);
  return out.join('');
}
function hbBox(path, hb, kind, key, it, ii) {
  const open = UI.open['hb:' + key], sum = hbSummary(hb, it);
  const head = `<button class="hbhead${open ? ' on' : ''}" data-act="hbopen" data-key="${key}" aria-expanded="${!!open}"><span>⚙ Homebrew automation</span><span class="hint">${sum.length ? esc(sum.join(' · ')) : 'None — add resistances, speeds, rolls, spells…'}</span><span class="caret">${open ? '▴' : '▾'}</span></button>`;
  if (!open) return `<div class="hbbox">${head}</div>`;
  const P = path + '.hb.', I = (k, o) => inp(P + k, Object.assign({}, o, o && o.ph ? { ph: 'e.g. ' + o.ph } : {})), abilOpts = [['', '—']].concat(AB.map(a => [a, ABN[a]]));
  const res = S.features.filter(f => featMax(f) != null).map(f => [f.dname || f.name, f.dname || f.name]);
  const comps = typeof COMP_RULES === 'object' ? Object.keys(COMP_RULES) : [];
  const durs = [['', 'Until ended'], ['1', '1 round'], ['10', '1 minute'], ['100', '10 minutes'], ['600', '1 hour'], ['4800', '8 hours']];
  const always = `<div class="hbsec"><div class="hbt">${kind === 'item' ? 'While you use it' : 'Always on'}</div>
    <div class="hbgrid">${fld('Resistances', I('resist', { ph: 'cold, fire' }))}${fld('Immunities', I('immune', { ph: 'poison' }))}${fld("Can't be (conditions)", I('condImmune', { ph: 'charmed, frightened' }))}
    ${fld('Advantage on', I('adv', { ph: 'Saves vs dragon breath; …' }))}${fld('Senses', I('sense', { ph: 'Darkvision 60 ft' }))}${fld('Speed bonus', I('speed', { ph: '10' }))}
    ${fld('Fly', I('fly', { ph: '30 or walk' }))}${fld('Swim', I('swim', { ph: '' }))}${fld('Climb', I('climb', { ph: '' }))}
    ${fld('AC bonus', I('ac', { ph: '1' }))}${fld('Saves bonus', I('saveAll', { ph: '1' }))}${fld('Initiative bonus', I('init', { ph: 'wis' }))}${fld('Max HP bonus', I('maxHp', { ph: 'level' }))}
    ${kind === 'feat' ? fld('Only while effect', I('whileEffect', { ph: 'effect name' })) : `<label class="checkline">${chk(path + '.carried')} Works while carried (no need to equip)</label><label class="checkline">${chk(P + 'othersDis')} Curse: disadvantage on attacks with other weapons</label>${fld('When you take damage: save', sel(P + 'hurtSave', abilOpts))}${fld('…DC', I('hurtDC', { ph: '15' }))}${fld('…if you fail', I('hurtText', { ph: 'what happens' }))}`}<label class="checkline">${chk(P + 'initAdv')} Advantage on initiative</label></div></div>`;
  const use = `<div class="hbsec"><div class="hbt">When used</div>
    <div class="hbgrid">${kind === 'item' ? fld('Used as', sel(P + 'col', [['', 'Free / no action'], ['action', 'Action'], ['bonus', 'Bonus action'], ['reaction', 'Reaction']])) + fld('Charges', inp(path + '.charges.max', { num: 1, ph: '—' })) + fld('Recharge', sel(path + '.charges.reset', [['long', 'Long rest'], ['short', 'Short rest'], ['none', 'Never']])) : ''}
    ${fld('Spends', sel(P + 'costFrom', [['', '— nothing —']].concat(res)))}${fld('How many', I('costN', { num: 1, ph: '1' }))}
    ${fld('Roll', I('roll', { ph: '2d10+wis' }))}${fld('Roll note', I('rollNote', { ph: 'fire damage' }))}<label class="checkline">${chk(P + 'healRoll')} Roll heals ("Heal me")</label><label class="checkline">${chk(P + 'selfDmg')} Roll damages me</label>
    ${fld('Target saves', sel(P + 'saveAb', abilOpts))}${fld('Save DC', I('dc', { ph: 'spell or 15' }))}
    ${kind === 'item' ? fld('Recovers a spell slot up to level', I('refuel', { num: 1, ph: '3' })) : ''}${fld('Temp HP', I('temp', { ph: 'cha+level' }))}${fld('Heal yourself', I('heal', { ph: '1d8+wis' }))}<label class="checkline">${chk(P + 'dash')} Dash (adds your speed)</label>${kind === 'item' ? `<label class="checkline">${chk(P + 'consume')} Using it uses one up</label>` : ''}
    ${fld('Starts effect', I('effName', { ph: 'effect name' }))}${fld('Lasts', sel(P + 'effRounds', durs))}${fld('Effect: fly', I('effFly', { ph: '30' }))}${fld('Effect: AC', I('effAc', { ph: '2' }))}${fld('Effect: speed', I('effSpeed', { ph: '10' }))}${fld('Effect note', I('effNote', { ph: 'shown on the effect' }))}<label class="checkline">${chk(P + 'effConc')} Concentration</label>
    ${comps.length ? fld('Summons', sel(P + 'summon', [['', '—']].concat(comps.map(c => [c, c])))) : ''}${fld('Only while effect', I('onlyEffect', { ph: 'effect name' }))}${fld('Text shown', I('text', { ph: 'reminder when used' }))}${fld('Remind me', sel(P + 'triggerOn', [['', '—'], ['longRest', 'After a long rest'], ['shortRest', 'After a short rest'], ['initiative', 'When I roll initiative'], ['zero', 'When I drop to 0 HP']]))}</div></div>`;
  const atk = `<div class="hbsec"><div class="hbt">Adds an attack</div><div class="hbgrid">${fld('Attack name', I('atkName', { ph: 'Flame Seed' }))}${fld('Damage', I('atkDice', { ph: '1d6+prof' }))}${fld('Type', I('atkType', { ph: 'fire' }))}
    ${fld('To hit with', sel(P + 'atkAb', [['spell', 'Spell attack'], ['str', 'STR'], ['dex', 'DEX'], ['fin', 'STR or DEX'], ['con', 'CON'], ['int', 'INT'], ['wis', 'WIS'], ['cha', 'CHA']]))}${fld('Kind', sel(P + 'atkKind', [['melee', 'Melee'], ['ranged', 'Ranged']]))}${fld('Range (ft)', I('atkRange', { ph: '60' }))}${fld('Attack note', I('atkNote', { ph: 'only while…' }))}<label class="checkline">${chk(P + 'atkAddMod')} Add ability modifier to damage</label></div></div>`;
  const spells = kind === 'item' ? `<div class="hbsec"><div class="hbt">Spells it lets you cast</div><div class="fc-spells">${(it.spells || []).map((n, j) => `<span class="pchip">${esc(n)}${itemStores(it) && N((SPI(n) || {}).level) > 0 ? ` <select class="isplv" data-isplv="${ii}" data-n="${esc(n)}" aria-label="Level ${esc(n)} is stored at">${[1, 2, 3, 4, 5].filter(L => L >= N((SPI(n) || {}).level)).map(L => `<option value="${L}"${Math.max(N((it.spellLevels || {})[n]), N((SPI(n) || {}).level)) === L ? ' selected' : ''}>${ORD[L - 1]}</option>`).join('')}</select>` : ''}<button data-act="ispdel" data-i="${ii}" data-j="${j}" aria-label="Remove ${esc(n)}">✕</button></span>`).join('') || '<span class="hint">None yet</span>'}
    <input class="f fspadd" list="allspells" data-isp="${ii}" placeholder="+ Add a spell…" aria-label="Add a spell this item casts"><label class="checkline"><input type="checkbox" data-istore="${ii}"${itemStores(it) ? ' checked' : ''}> Stored in it — each is gone once cast (like a Ring of Spell Storing)</label><label class="checkline">${chk(path + '.spellOnce')} Leveled spells once per long rest</label><label class="checkline">${chk(path + '.spellAtWill')} At will (no slot)</label>${fld('Cast with', sel(P + 'spellAb', [['', 'Your spellcasting'], ...AB.map(a => [a, ABN[a]])]))}</div></div>` : '';
  return `<div class="hbbox open">${head}<div class="hbbody">${always}${spells}${use}${atk}<p class="hint">Numbers accept formulas: <code>prof</code>, <code>wis</code>, <code>level</code>, <code>druid</code>, <code>1d6+prof</code>. Separate several entries with commas.</p></div></div>`;
}
function spellDatalist() { if (!$('#allspells')) { const dl = document.createElement('datalist'); dl.id = 'allspells'; dl.innerHTML = DND.spells.map(x => `<option value="${esc(x.name)}">`).join(''); document.body.appendChild(dl); } }
function renderFeatures() {
  spellDatalist();
  const groups = [...new Set(S.features.map(featGroup))];
  const ri = (k) => clsRows().findIndex(r => r.key === k);
  const gname = g => CL[g] ? CL[g].name : { race: S.raceName || 'Race', feat: 'Feats', bg: S.backgroundName ? S.backgroundName + ' background' : 'Background', other: 'Other', custom: 'Custom' }[g] || g;
  const ff = UI.featFilter && groups.includes(UI.featFilter) ? UI.featFilter : 'all';
  const q = (UI.featQ || '').toLowerCase();
  const card = (f, i) => {
    const max = featMax(f), ed = UI.open['fedit:' + i], left = max != null ? Math.max(0, max - N(f.used)) : null;
    const sc = f.cls ? classScaling(f.cls).filter(([n]) => scalingMatches(f.name, n)) : [];
    const fx = fxOf(f), dcl = fxDCLine(fx, f);
    const tags = [f.source, f.col ? (f.col === 'bonus' ? 'Bonus action' : f.col[0].toUpperCase() + f.col.slice(1)) : '', max != null ? `${max}× per ${resetOf(f) === 'short' ? 'short rest' : resetOf(f) === 'long' ? 'long rest' : 'never'}` : '', dcl, fx.cost ? 'Costs ' + fxCostText(fx.cost) : '', fx.onlyRaging ? 'While raging' : ''].filter(Boolean);
    const canUse = !fxIsResource(f) && (fx.cost || fx.use || fx.target || fx.roll);
    return `<div class="fcard${f.auto ? '' : ' custom'}${ed ? ' editing' : ''}">
      <div class="fc-head"><b class="fc-name">${esc(f.name)}</b>${sc.map(([n, v]) => `<span class="fscale" title="${esc(n)}">${esc(v)}</span>`).join('')}<span class="grow"></span>
        ${max != null && !f.pool && !fxIsResource(f) ? `<button class="btn sm gold" data-act="usefeat" data-i="${i}" ${left || fx.slotRestore ? '' : 'disabled'}>${f.roll || fx.roll ? 'Use & roll' : 'Use'}</button>` : f.roll ? `<button class="btn sm gold" data-act="usefeat" data-i="${i}">Roll</button>` : canUse ? `<button class="btn sm gold" data-act="usefeat" data-i="${i}">${fx.useLabel || (fx.roll ? 'Use & roll' : 'Use')}</button>` : ''}
        <button class="icon-btn fc-edit${ed ? ' on' : ''}" data-act="toggle" data-key="fedit:${i}" title="${ed ? 'Done editing' : 'Edit this feature'}" aria-label="Edit">${ed ? '✓' : '✎'}</button></div>
      <div class="fc-tags">${tags.map(t => `<span class="ftag">${esc(t)}</span>`).join('')}${sc.length > 1 || (sc[0] && sc[0][0].toLowerCase() !== f.name.toLowerCase()) ? sc.map(([n, v]) => `<span class="ftag">${esc(n)}: ${esc(v)}</span>`).join('') : ''}</div>
      ${f.key === 'warlock:uaravenqueen:Sentinel Raven' ? ravenChk() : ''}
      ${max != null ? `<div class="fc-uses"><span class="pips" data-calc-html="featpips:${i}"></span>${f.pool ? '' : `<span class="hint">${left} of ${max} left</span>`}</div>` : ''}
      ${ed ? `<div class="fc-form">${fld('Name', inp(`features.${i}.name`, { label: 'Feature name' }))}
          <div class="row">${fld('Uses', inp(`features.${i}.max`, { ph: 'unlimited', label: 'Max uses formula', title: 'A number or formula: 1+cha, prof, 5*level, paladin' }))}${fld('Refills on', sel(`features.${i}.reset`, [['short', 'Short rest'], ['long', 'Long rest'], ['none', 'Never']]))}
          ${fld('Used as', sel(`features.${i}.col`, [['', '—'], ['action', 'Action'], ['bonus', 'Bonus action'], ['reaction', 'Reaction']]))}<label class="checkline">${chk(`features.${i}.pool`)} Points pool</label></div>
          ${fld('Short summary (shown on the Combat tab)', ta(`features.${i}.desc`, { rows: 3, label: 'Description' }))}
          ${fld('Your own wording (replaces the full description when filled in)', ta(`features.${i}.full`, { rows: 5, label: 'Your own wording', ph: fullDefaultFeat(f) ? 'Optional — leave blank to use the built-in description' : 'Optional — the full description' }))}
          ${hbBox(`features.${i}`, f.hb, 'feat', 'f' + i)}
          <div class="row"><span class="hint">Uses accept formulas like <code>1+cha</code>, <code>prof</code> or <code>5*level</code>.</span><span class="grow"></span>${f.kind === 'feat' ? `<button class="btn sm red" data-act="delfeatn" data-n="${esc(String(f.key).slice(5))}">Remove feat</button>` : ''}${f.auto ? `<button class="btn sm ghost" data-act="featreset" data-i="${i}">Restore original</button>` : `<button class="btn sm red" data-act="del" data-list="features" data-i="${i}">Delete</button>`}</div></div>`
        : (fullOfFeat(f).length > 280 ? `<div class="fc-desc fc-full${UI.open['ffull:' + i] ? ' open' : ''}" data-act="toggle" data-key="ffull:${i}" title="Click to ${UI.open['ffull:' + i] ? 'collapse' : 'read all'}">${fullHTML(fullOfFeat(f))}</div>` : `<div class="fc-desc">${fullHTML(fullOfFeat(f))}</div>`)}${fx.acts && !ed ? `<div class="fxacts">${fxActsHTML(f, i)}</div>` : ''}
      ${featSpellsHTML(f, i, ed)}
    </div>`;
  };
  const head = g => {
    let extra = '';
    if (CL[g]) {
      const k = ri(g), r = clsRows()[k], c = CL[g], s = subOf(r), editing = UI.open['subedit:' + k];
      const used = S.features.filter(f => f.cls === g).map(f => f.name);
      const loose = classScaling(g).filter(([n]) => !used.some(fn => scalingMatches(fn, n)));
      extra = `<span class="lvlpill">Level ${N(r.level)}</span>` + (N(r.level) >= c.sub.level || r.sub
        ? `<span class="subname">${s ? esc(s.name) : `<button class="linkbtn warn" data-act="opensettings" data-tab="class">Choose your ${esc(c.sub.label)} in Settings</button>`}</span>`
        : `<span class="hint">${esc(c.sub.label)} at level ${c.sub.level}</span>`)
        + (r.extraSubs || []).map(xk => c.subclasses[xk] ? `<span class="subname">+ ${esc(c.subclasses[xk].name)}${N((r.extraSubLv || {})[xk]) ? ` <small class="hint">(${N(r.extraSubLv[xk])} lv)</small>` : ''}</span>` : '').join('')
        + loose.map(([n, v]) => `<span class="ftag">${esc(n)}: <b>${esc(v)}</b></span>`).join('');
    }
    if (g === 'feat') extra = `<button class="btn sm" data-act="addfeat">+ Add feat</button>`;
    return extra;
  };
  // Known infusions live on the Infusions tab (they only do something once an item is infused).
  const shown = S.features.map((f, i) => [f, i]).filter(([f]) => !isInfPick(f) && (ff === 'all' || featGroup(f) === ff) && (!q || (f.name + ' ' + f.desc).toLowerCase().includes(q)))
    .sort(([a], [b]) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base', numeric: true })); // A–Z within each group
  const order = clsRows().map(r => r.key).concat(groups.filter(g => !CL[g]));
  if (!groups.includes('feat') && ff === 'all' && !q) groups.push('feat');
  const sections = [...new Set(order.concat(groups))].filter(g => groups.includes(g) && (shown.some(([f]) => featGroup(f) === g) || (g === 'feat' && ff === 'all' && !q))).map(g => `<section class="fgroup"><h3 class="subh fghead"><span class="sh-dot"></span><span class="fgname">${esc(gname(g))}</span>${head(g)}</h3>
    <div class="fgrid">${shown.filter(([f]) => featGroup(f) === g).map(([f, i]) => card(f, i)).join('') || (g === 'feat' ? '<p class="hint">No feats yet. Feats from level-ups are added automatically.</p>' : '')}</div></section>`).join('');
  $('#page-features').innerHTML = `
  <div class="panel" ${PID('featlist')}><h2><span class="grow">Features &amp; Traits</span><span class="hint lvhint" style="text-transform:none;letter-spacing:0">Total level ${totalLevel()} · proficiency ${fmt(PB())}</span><button class="btn sm" data-act="add" data-list="features">+ Custom feature</button></h2>
    <div class="filters" style="margin-top:0"><input class="f featq" id="featQ" placeholder="Search features…" value="${esc(UI.featQ || '')}" aria-label="Search features"><button class="chip${ff === 'all' ? ' on' : ''}" data-act="featfilter" data-f="all">All</button>${groups.filter(g => g !== 'feat' || S.features.some(f => featGroup(f) === 'feat')).map(g => `<button class="chip${ff === g ? ' on' : ''}" data-act="featfilter" data-f="${g}">${esc(gname(g))}</button>`).join('')}</div>
    ${sections || '<p class="hint">No features match.</p>'}
    <p class="hint">Features from your class, race, background and feats are added and updated automatically as you level. Tap ✎ on a card to change it.</p></div>`;
}
// ---------- Inventory ----------
const attuneMax = () => { const a = clsLv('artificer'); return a >= 18 ? 6 : a >= 14 ? 5 : a >= 10 ? 4 : 3; };
const attunedCount = () => S.inventory.filter(it => it.attune && it.attuned).length;
// Extra containers (bags of holding, saddlebags…). Items carry `bag` (a container id, '' = Pack); equipped items ignore it.
const bagOf = it => (!it.equipped && it.bag && (S.bags || []).find(b => b.id === it.bag)) || null;
// Containers can sit inside other containers (b.in = the outer container's id; '' = on its own).
const bagById = id => (S.bags || []).find(b => b.id === id) || null;
const bagParent = b => (b && b.in && b.in !== b.id && bagById(b.in)) || null;
function bagAncestors(b) { const out = []; let p = bagParent(b); while (p && !out.includes(p) && out.length < 20) { out.push(p); p = bagParent(p); } return out; }
const inPack = b => !!b && b.in === 'pack';
const packBags = () => (S.bags || []).filter(inPack);
const bagTop = () => (S.bags || []).filter(b => !inPack(b) && (!bagParent(b) || bagAncestors(b).includes(b)));
const bagKids = b => (S.bags || []).filter(x => x !== b && bagParent(x) === b);
function bagDescendants(b) { const out = []; const walk = x => bagKids(x).forEach(k => { if (!out.includes(k) && k !== b) { out.push(k); walk(k); } }); walk(b); return out; }
const bagPath = b => bagAncestors(b).reverse().concat([b]).map(x => x.name || 'Container').join(' ▸ ');
// Containers in tree order (outer first, then what's inside it)
function bagTree() { const out = []; const walk = (b, d) => { out.push([b, d]); bagKids(b).forEach(k => walk(k, d + 1)); }; packBags().forEach(b => walk(b, 1)); bagTop().forEach(b => walk(b, 0)); (S.bags || []).forEach(b => { if (!out.some(([x]) => x === b)) out.push([b, 0]); }); return out; }
// Everything inside a container, nested containers included (their own weight too unless something weightless holds them)
const bagWeight = id => { const b = bagById(id); const own = S.inventory.filter(it => !it.equipped && it.bag === id).reduce((t, it) => t + N(it.qty) * N(it.weight), 0); return own + (b ? bagKids(b).reduce((t, k) => t + N(k.weight) + (k.weightless ? 0 : bagWeight(k.id)), 0) : 0); };
const bagFree = b => !!b && (b.weightless || bagAncestors(b).some(a => a.weightless));
const weight = () => S.inventory.reduce((t, it) => { const b = bagOf(it); return t + (bagFree(b) ? 0 : N(it.qty) * N(it.weight)); }, 0) + (S.bags || []).reduce((t, b) => t + (bagAncestors(b).some(a => a.weightless) ? 0 : N(b.weight)), 0);
const BAG_PRESETS = [['Bag of Holding', 500, true, 15, 'Contents weigh nothing; holds up to 500 lb / 64 cu ft.'], ['Handy Haversack', 120, true, 5, 'Two side pouches (20 lb each) and a central pouch (80 lb); contents weigh nothing.'], ['Portable Hole', 0, true, 0, 'Extradimensional hole, 10 ft deep; contents weigh nothing.'], ['Backpack', 30, false, 5, 'Holds 30 lb / 1 cu ft.'], ['Sack', 30, false, 0.5, 'Holds 30 lb.'], ['Saddlebags', 0, false, 8, 'On your mount — untick "counts toward your weight" below if the mount carries it.'], ['Chest', 300, false, 25, 'Holds 300 lb / 12 cu ft.']];
function renderInventory() {
  spellDatalist();
  const m = isMobile();
  const COIN = [['cp', 'Copper'], ['sp', 'Silver'], ['ep', 'Electrum'], ['gp', 'Gold'], ['pp', 'Platinum']];
  const purse = COIN.filter(([c]) => c !== 'ep' || ST('electrum')).map(([c, t]) => `
    <div class="cn ${c}" title="${t}"><i class="cdot"></i><span class="cl">${c.toUpperCase()}</span>
      <button data-act="coin" data-c="${c}" data-d="-1" aria-label="Subtract 1 ${t}">−</button>${inp('currency.' + c, { num: 1, cls: 'cin', label: t + ' pieces' })}<button data-act="coin" data-c="${c}" data-d="1" aria-label="Add 1 ${t}">+</button></div>`).join('');
  const eq = S.inventory.map((it, i) => [it, i]).filter(([it]) => it.equipped);
  const pack = S.inventory.map((it, i) => [it, i]).filter(([it]) => !it.equipped && !bagOf(it));
  const bags = S.bags || [];
  const row = ([it, i]) => {
    const open = UI.open['item:' + it.id];
    const ch = it.charges && N(it.charges.max) > 0 ? `<span class="charges" title="Charges"><button data-act="charge" data-i="${i}" data-d="-1" aria-label="Use a charge">−</button><b>${Math.max(0, N(it.charges.max) - N(it.charges.used))}/${N(it.charges.max)}</b><button data-act="charge" data-i="${i}" data-d="1" aria-label="Restore a charge">+</button></span>` : '';
    const badges = [it.magic ? `<span class="tag rar r-${esc(String(it.magic.rarity || '').replace(/\s+/g, ''))}">${esc(it.magic.rarity || 'magic')}</span>` : '', it.attune ? `<button class="tag att${it.attuned ? ' on' : ''}" data-act="attune" data-i="${i}" title="${it.attuned ? 'Attuned (tap to end)' : 'Requires attunement — tap to attune'}">${it.attuned ? '◆ Attuned' : '◇ Attune'}</button>` : ''].join('');
    const dests = [['', 'Pack']].concat(bagTree().map(([b, d]) => [b.id, (d ? '\u2003'.repeat(d) + '↳ ' : '') + (b.name || 'Container')])).filter(([v]) => it.equipped || v !== (bagOf(it) ? it.bag : ''));
    // Only one place to go: the button moves the item straight there (Unequip → Pack when you have no other containers).
    const mv = dests.length === 1 && (it.equipped || bags.length) ? (it.equipped ? `<button class="mvbtn" data-act="moveto" data-i="${i}" data-to="${esc(dests[0][0])}" title="Unequip and put it in your ${esc(dests[0][1])}">Unequip</button>` : `<button class="mvto" data-act="moveto" data-i="${i}" data-to="${esc(dests[0][0])}" title="Move to ${esc(dests[0][1])}" aria-label="Move ${esc(it.name)} to ${esc(dests[0][1])}">⇄</button>`)
      : dests.length && (it.equipped || bags.length) ? `<div class="menu mvmenu"><button class="mvto" data-act="menu" aria-haspopup="true" title="Move to another container" aria-label="Move ${esc(it.name)}">⇄</button><div class="menu-list"><div class="mlabel">Move to</div>${dests.map(([v, t]) => `<button data-act="moveto" data-i="${i}" data-to="${esc(v)}">${esc(t)}</button>`).join('')}</div></div>` : '';
    return `<div class="irow irow2${it.magic ? ' magic' : ''}" data-ii="${i}" data-q="${esc((it.name + ' ' + (it.notes || '') + ' ' + ((it.magic || {}).rarity || '')).toLowerCase())}">
      <div class="iname-row" title="${esc(it.name)}"><span class="idrag" data-drag="${i}" title="Drag to reorder, or into another container" aria-hidden="true">⠿</span>${ta(`inventory.${i}.name`, { rows: 1, cls: 'iname', label: 'Item name' })}${String(it.notes || '').trim() || it.img ? `<button class="notetip" data-tip="${i}" aria-label="Notes for ${esc(it.name)}" title="">ⓘ</button>` : ''}</div>
      <div class="ictl">${invArrows(i)}<div class="qty"><button data-act="qty" data-i="${i}" data-d="-1" aria-label="One fewer">−</button>${inp(`inventory.${i}.qty`, { num: 1, cls: 'qtyin', label: 'Quantity' })}<button data-act="qty" data-i="${i}" data-d="1" aria-label="One more">+</button></div>
        ${it.equipped ? '' : `<button class="mvbtn eq" data-act="equip" data-i="${i}" title="Equip">Equip</button>`}${mv}
        <span class="grow"></span>
        <button class="icon-btn ibtn${open ? ' on' : ''}" data-act="toggle" data-key="item:${it.id}" title="${open ? 'Close editing' : 'Edit details and notes'}" aria-label="Edit ${esc(it.name)}">${open ? '▴' : '✎'}</button>
        ${del('inventory', i)}</div>
      <div class="imeta">${resPickItem(it) && !it.resPick ? `<label class="respick unset"><span>Which ring is it?</span><select class="f" data-restype="${i}" aria-label="Damage type this item resists"><option value="">Choose its damage type…</option>${RES_TYPES.map(t => `<option value="${t}">${t[0].toUpperCase() + t.slice(1)}</option>`).join('')}</select></label>` : ''}${String(it.notes || '').trim() && !open ? `<div class="inote-m mnote">${esc(it.notes)}</div>` : ''}${badges}${ch}${isDeckItem(it) ? `<button class="btn sm gold" data-act="deck" data-i="${i}">Draw a card</button>` : ''}${it.equipped && it.weapon && it.weapon.kind === 'melee' && !(it.weapon.props || []).includes('two-handed') && ((it.weapon.props || []).includes('light') || dualWielder()) ? `<label class="offchk" title="Dual wield: after attacking with a light melee weapon, attack with this one as a bonus action (Combat tab → Bonus Action)"><input type="checkbox" data-offhand="${i}"${it.offhand ? ' checked' : ''}> Off-hand (dual wield)</label>` : ''}${itemStores(it) && !it.infusion ? `<button class="btn sm gold" data-act="ringstore" data-i="${i}" title="${esc((it.spells || []).length ? 'Holds: ' + it.spells.join(', ') : 'Empty')}">Store a spell <small>${ringUsed(it)}/${ringCap(it)}</small></button>` : ''}${it.heal ? `<button class="btn sm" data-act="drink" data-i="${i}">Drink (${esc(it.heal)})</button>` : ''}${it.hb && hbUsable(hbFx(it.hb)) ? `<button class="btn sm gold" data-act="useitem" data-i="${i}" ${hbItemReady(it) ? '' : 'disabled'} title="${hbItemOn(it) ? '' : it.attune && !it.attuned ? 'Attune first' : 'Equip it first'}">Use</button>` : ''}${hbChips(it)}
</div>
      ${open ? `<div class="idetail"><div class="idet-top">${picThumb(`inventory.${i}.img`, it.name)}${fld('Notes', ta(`inventory.${i}.notes`, { rows: 2, cls: 'inotefull', label: 'Notes', ph: 'Add a note…' }))}</div>${it.summary ? `<p>${esc(it.summary)}</p>` : ''}${it.armor ? `<p class="hint">${esc(it.armor.type)} armor · AC ${it.armor.base}${it.armor.type === 'shield' ? '' : it.armor.dexCap === 0 ? '' : it.armor.dexCap ? ' + DEX (max ' + it.armor.dexCap + ')' : ' + DEX'}${it.armor.strReq ? ' · STR ' + it.armor.strReq : ''}${it.armor.stealthDis ? ' · Stealth disadvantage' : ''}</p>` : ''}${it.weapon ? `<p class="hint">${esc(it.weapon.cat)} ${esc(it.weapon.kind)} · ${esc(it.weapon.dice)} ${esc(it.weapon.type)}${it.weapon.props && it.weapon.props.length ? ' · ' + esc(it.weapon.props.join(', ')) : ''}${it.weapon.range ? ' · ' + esc(it.weapon.range) + ' ft' : ''}</p>` : ''}
        <div class="row">${fld('Weight (lb)', inp(`inventory.${i}.weight`, { num: 1 }))}${fld('Cost', inp(`inventory.${i}.cost`))}<label class="checkline">${chk(`inventory.${i}.attune`, 'Requires attunement')} Requires attunement</label></div>
        ${hbBox(`inventory.${i}`, it.hb, 'item', 'i' + it.id, it, i)}</div>` : ''}
    </div>`;
  };
  $('#page-inventory').innerHTML = `
  <div class="panel inv-panel" ${PID('inventory')}>
    <h2><span class="grow">Inventory</span><button class="btn gold" data-act="catalog">+ Add item</button><button class="btn" data-act="add" data-list="inventory">+ Custom item</button><button class="btn" data-act="addbag" title="Add a bag of holding, backpack or other container">+ Container</button></h2>
    <div class="purse">${purse}<span class="worth pworth" data-calc="worth" title="Total value of your coins in gold"></span></div>
    <div class="invsearch"><input class="f invq" type="search" data-scope="all" placeholder="Search your inventory…" aria-label="Search inventory" value="${esc(UI.invQ || '')}"></div>
    <div class="invstats"><span>Attuned <b data-calc="attune"></b></span>${ST('encumbrance') === 'off' ? '' : '<span>Carrying <b data-calc="weight"></b> / <span data-calc="carry"></span> lb</span><span class="hint" data-calc="encnote"></span>'}</div>
    <div class="inv2 placed" data-ordered data-zone="invcols" data-axis="x" style="--bagrows:${bagTop().length + 1}">${invPlaced(zoneOrder('invcols', ['pack', 'equipped'].concat(bagTop().map(b => 'bag:' + b.id))).filter(k => !k.startsWith('bag:') || bagTop().some(b => 'bag:' + b.id === k))).map(([k, st]) => invCol(k, { eq, pack, row }).replace('<section ', `<section style="${st}" `)).join('')}
    </div>
  </div>`;
  invFilter();
}

// Placement: extra containers always stack in the same column as the Pack (wherever the Pack has been moved);
// Equipped takes the other column and spans its full height.
function invPlaced(order) {
  const pc = order.indexOf('pack') < order.indexOf('equipped') ? 1 : 2, ec = 3 - pc; let r = 2;
  return order.map(k => [k, k === 'pack' ? `grid-column:${pc};grid-row:1` : k === 'equipped' ? `grid-column:${ec};grid-row:1 / -1` : `grid-column:${pc};grid-row:${r++}`]);
}
// One inventory column (Pack, Equipped or an extra container). Every column collapses from its header.
function invCol(k, { eq, pack, row }) {
  const shut = !!UI.open['invshut:' + k], caret = `<span class="caret">${shut ? '▸' : '▾'}</span>`;
  const head = (dot, title, n, extra = '') => `<h3 class="subh"><button class="colhead" data-act="toggle" data-key="invshut:${k}" aria-expanded="${!shut}" title="${shut ? 'Expand' : 'Collapse'}">${caret}<span class="sh-dot${dot}"></span><span class="colname">${title}</span><span class="count">${n}</span></button>${extra}${n > 1 ? invSortMenu(k) : ''}</h3>`;
  if (k === 'equipped') return `<section class="inv-col eqcol${shut ? ' shut' : ''}" data-zi="equipped">${head('', 'Equipped', eq.length)}
        ${shut ? '' : `<div class="ilist">${eq.map(row).join('') || '<p class="hint">Nothing equipped. Equipped armor and shields set your AC; equipped magic items apply their bonuses.</p>'}</div>`}</section>`;
  if (k === 'pack') return `<section class="inv-col${shut ? ' shut' : ''}" data-zi="pack">${head(' pack', 'Pack', pack.length + packBags().length, pack.length + packBags().length > 1 ? invQBtn('pack') : '')}
        ${shut ? '' : (pack.length + packBags().length > 1 && invQOpen('pack') ? invQBox('pack', 'Pack') : '') + `<div class="ilist">${pack.map(row).join('') || (packBags().length ? '' : '<p class="hint">Pack is empty.</p>')}</div>${packBags().length ? `<div class="subbags">${packBags().map(c => bagSection(c, row, 1)).join('')}</div>` : ''}`}</section>`;
  const b = (S.bags || []).find(x => 'bag:' + x.id === k); if (!b || !bagTop().includes(b)) return '';
  return bagSection(b, row, 0);
}
// A container's section; containers inside it open below its items as their own drop-downs.
function bagSection(b, row, depth) {
  const k = 'bag:' + b.id, j = S.bags.indexOf(b), shut = !!UI.open['invshut:' + k];
  const items = S.inventory.map((it, i) => [it, i]).filter(([it]) => bagOf(it) === b), kids = bagKids(b), w = Math.round(bagWeight(b.id) * 10) / 10, ed = UI.open['bagedit:' + b.id];
  const full = N(b.cap) && w > N(b.cap), free = bagFree(b) && !b.weightless;
  const extra = (ST('encumbrance') === 'off' ? '' : `<span class="bagw${full ? ' over' : ''}" title="${b.weightless ? 'Contents don’t count toward what you carry' : free ? 'Inside a weightless container' : 'Contents count toward what you carry'}">${w}${N(b.cap) ? ' / ' + N(b.cap) : ''} lb${b.weightless ? ' · weightless' : ''}</span>`) + `<button class="icon-btn" data-act="toggle" data-key="bagedit:${b.id}" title="Container settings" aria-label="Container settings">${ICON.gear}</button>`;
  const caret = `<span class="caret">${shut ? '▸' : '▾'}</span>`, n = items.length + kids.length;
  const dests = [['pack', 'Pack']].filter(() => !inPack(b)).concat([['', 'Its own column']].filter(() => !!bagParent(b) || inPack(b))).concat(bagTree().filter(([x]) => x !== b && x !== bagParent(b) && !bagDescendants(b).includes(x)).map(([x, d]) => [x.id, (d ? '\u2003'.repeat(d) + '↳ ' : '') + (x.name || 'Container')]));
  const mvb = dests.length ? `<div class="menu mvmenu"><button class="icon-btn mvto bagmv" data-act="menu" aria-haspopup="true" title="Move this container (and everything in it)" aria-label="Move ${esc(b.name || 'container')}">⇄</button><div class="menu-list"><div class="mlabel">Move ${esc(b.name || 'container')} into</div>${dests.map(([v, t]) => `<button data-act="bagmove" data-id="${esc(b.id)}" data-to="${esc(v)}">${esc(t)}</button>`).join('')}</div></div>` : '';
  const head = `<h3 class="subh"><span class="bdrag" data-bdrag="${esc(b.id)}" title="Drag into another container (or out on its own)" aria-hidden="true">⠿</span><button class="colhead" data-act="toggle" data-key="invshut:${k}" aria-expanded="${!shut}" title="${shut ? 'Expand' : 'Collapse'}">${caret}<span class="sh-dot bag"></span><span class="colname">${esc(b.name || 'Container')}</span><span class="count">${n}</span></button>${items.length + kids.length > 1 ? invQBtn(k) : ''}${extra}${mvb}${items.length > 1 ? invSortMenu(k) : ''}</h3>`;
  const inside = [['', 'Nothing — its own column'], ['pack', 'Pack']].concat(bagTree().filter(([x]) => x !== b && !bagDescendants(b).includes(x)).map(([x, d]) => [x.id, (d ? '\u2003'.repeat(d) + '↳ ' : '') + (x.name || 'Container')]));
  const edit = ed ? `<div class="bagedit">${fld('Name', inp(`bags.${j}.name`, { fit: 10 }))}${fld('Holds (lb)', inp(`bags.${j}.cap`, { num: 1, cls: 'sm', ph: '∞' }))}${fld('Bag weighs (lb)', inp(`bags.${j}.weight`, { num: 1, cls: 'sm' }))}
        <div class="span2">${fld('Inside', sel(`bags.${j}.in`, inside, { label: 'Which container this one is inside' }))}</div>
        <label class="checkline span2 nowrap">${chk(`bags.${j}.weightless`, 'Contents weigh nothing')} Contents weigh nothing</label>
        <div class="span2">${fld('Notes', inp(`bags.${j}.notes`, { ph: 'Where it is, what it does…' }))}</div>
        <div class="span2" style="text-align:right"><button class="btn red sm" data-act="delbag" data-i="${j}">Remove container</button></div></div>` : b.notes ? `<p class="hint bagnote">${esc(b.notes)}</p>` : '';
  const body = shut ? '' : (items.length + kids.length > 1 && invQOpen(k) ? invQBox(k, b.name || 'container') : '') + `<div class="ilist">${items.map(row).join('') || (kids.length ? '' : '<p class="hint">Empty. Use the <b>⇄</b> button on any item to move it in here.</p>')}</div>${kids.length ? `<div class="subbags">${kids.map(c => bagSection(c, row, depth + 1)).join('')}</div>` : ''}`;
  return depth ? `<section class="subbag${shut ? ' shut' : ''}" data-zi="${k}">${head}${edit}${body}</section>`
    : `<section class="inv-col bagcol${shut ? ' shut' : ''}" data-zi="${k}">${head}${edit}${body}</section>`;
}
// A container's own search box opens from the 🔍 button in its header (and stays open while it holds a search).
const invQOpen = k => !!UI.open['invsrch:' + k] || !!String((UI.invQs || {})[k] || '').trim();
const invQBtn = k => `<button class="icon-btn invqbtn${invQOpen(k) ? ' on' : ''}" data-act="invsrch" data-k="${esc(k)}" title="${invQOpen(k) ? 'Close search' : 'Search this container'}" aria-label="Search this container" aria-pressed="${invQOpen(k)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg></button>`;
const invQBox = (k, name) => `<div class="invqbox"><input class="f invq sm" type="search" data-scope="${esc(k)}" placeholder="Search ${esc(name)}…" aria-label="Search ${esc(name)}" value="${esc((UI.invQs || {})[k] || '')}"></div>`;
// Live search: the inventory-wide box and each container's own box both filter (a row must match every box that covers it).
function invFilter() {
  const page = $('#page-inventory'); if (!page) return;
  const g = String(UI.invQ || '').trim().toLowerCase(), qs = UI.invQs || {};
  const ok = (txt, q) => !q || q.split(/\s+/).every(w => txt.includes(w));
  page.querySelectorAll('.irow[data-q]').forEach(r => { let vis = ok(r.dataset.q, g); let sec = r.closest('section[data-zi]');
    while (vis && sec) { vis = ok(r.dataset.q, String(qs[sec.dataset.zi] || '').trim().toLowerCase()); sec = sec.parentElement && sec.parentElement.closest('section[data-zi]'); }
    r.classList.toggle('qhide', !vis); });
  const any = g || Object.values(qs).some(v => String(v || '').trim());
  // Nested containers with nothing matching fold away while searching
  [...page.querySelectorAll('section.subbag')].reverse().forEach(sec => { const has = sec.querySelector('.irow:not(.qhide)'); sec.classList.toggle('qhide', !!any && !has); });
  page.querySelectorAll('section[data-zi] > .ilist').forEach(l => { let m = l.querySelector(':scope > .qnone'); const rows = l.querySelectorAll(':scope > .irow'), vis = [...rows].some(r => !r.classList.contains('qhide'));
    if (any && rows.length && !vis) { if (!m) { m = document.createElement('p'); m.className = 'hint qnone'; m.textContent = 'No matches.'; l.appendChild(m); } } else if (m) m.remove(); });
}
document.addEventListener('input', e => { const t = e.target; if (!t.classList || !t.classList.contains('invq')) return; const k = t.dataset.scope;
  if (k === 'all') UI.invQ = t.value; else UI.invQs = Object.assign({}, UI.invQs, { [k]: t.value }); invFilter(); });
function openAddBag() {
  openModal(`<h3>Add a container</h3><p class="hint">For extra bags, a bag of holding, a mount's saddlebags… Each one gets its own column in Inventory.</p>
    <div class="bagpresets">${BAG_PRESETS.map(([n, cap, wl, w, d], x) => `<button class="bagpreset" data-act="addbagp" data-i="${x}"><b>${esc(n)}</b><small>${esc(d)}</small></button>`).join('')}
    <button class="bagpreset" data-act="addbagp" data-i="-1"><b>Custom container</b><small>Name it and set its capacity yourself.</small></button></div>
    <div class="actions"><button class="btn" data-act="close">Cancel</button></div>`, null, true);
}
function addBag(x) {
  const p = BAG_PRESETS[x] || ['New container', 0, false, 0, ''];
  const b = { id: uid(), name: p[0], cap: p[1] || '', weightless: p[2], weight: p[3], notes: '' };
  S.bags = (S.bags || []).concat([b]); if (x < 0) UI.open['bagedit:' + b.id] = true;
  closeModal(true); pendingLabel = 'Add container: ' + b.name; save(); render();
}
// Put a whole container (with everything in it) inside another one, or back out on its own.
function bagMoveTo(id, to) {
  const b = bagById(id); if (!b) return; const pk = to === 'pack', dest = to && !pk ? bagById(to) : null;
  if (dest && (dest === b || bagDescendants(b).includes(dest))) { toast(`${esc(b.name)} can't go inside itself.`, 'fumble'); return; }
  if ((b.in || '') === (to || '')) return;
  b.in = pk ? 'pack' : dest ? dest.id : ''; if (dest) UI.open['invshut:bag:' + dest.id] = false; if (pk) UI.open['invshut:pack'] = false;
  const where = pk ? 'your Pack' : dest ? (dest.name || 'container') : '';
  pendingLabel = `Move ${b.name || 'container'} ${where ? 'into ' + where : 'to its own column'}`; save(); render();
  toast(`<b>${esc(b.name || 'Container')}</b> ${where ? 'is now inside <b>' + esc(where) + '</b>' : 'has its own column again'}.`, '', 4000, { label: 'Undo', fn: () => undo(1) });
}
function delBag(j) {
  const b = S.bags[j]; if (!b) return;
  const n = S.inventory.filter(it => it.bag === b.id).length, outer = bagParent(b), to = outer ? outer.id : '';
  S.inventory.forEach(it => { if (it.bag === b.id) it.bag = to; });
  bagKids(b).forEach(k => { k.in = outer ? outer.id : inPack(b) ? 'pack' : ''; });
  S.bags.splice(j, 1); pendingLabel = 'Remove container: ' + b.name; save(); render();
  toast(`Removed ${esc(b.name)}${n ? ` — ${n} item${n > 1 ? 's' : ''} moved to ${outer ? esc(outer.name) : 'your Pack'}` : ''}.`, '', 5000, { label: 'Undo', fn: () => undo(1) });
}

// ---------- Companions & forms ----------
function crAttackRow(who, a, j) {
  return `<div class="fa-row"><b>${esc(a[0])}</b><button class="roll" data-act="crroll" data-who="${who}" data-j="${j}" data-what="hit">${a[1] === '' || a[1] == null ? 'save' : fmt(N(a[1]))}</button><button class="roll" data-act="crroll" data-who="${who}" data-j="${j}" data-what="dmg">${esc(a[2] || '—')}</button><span class="muted">${esc(a[3] || '')}</span></div>`;
}
function renderCompanions() {
  const f = S.form;
  const formPanel = f ? `<div class="panel comp form"><h2><span class="grow">${esc(f.source || 'Form')}: ${esc(f.name)}</span><button class="btn red" data-act="endform">Revert</button></h2>
      <div class="cstats"><span><span class="lbl">HP</span>${inp('form.hp', { num: 1, cls: 'sm', label: 'Form HP' })} / ${N(f.maxhp)}</span><span><span class="lbl">AC</span><b>${N(f.ac)}</b></span><span><span class="lbl">Speed</span>${esc(f.speed)}</span>
        <span class="abil6">${AB.map((a, k) => `<i>${AB3[a]} <b>${N((f.abil || [])[k])}</b></i>`).join('')}</span></div>
      ${(f.attacks || []).map((a, j) => crAttackRow('form', a, j)).join('')}
      <p class="hint">${esc(f.notes || '')}</p>
      <p class="hint">While transformed, damage comes off this form's HP first; anything left over carries to your own HP (${N(S.hp.cur)}). Your STR, DEX and CON use the form's scores${f.allStats ? ' (all scores replaced)' : ''}.</p></div>` : '';
  const ws = S.features.findIndex(x => x.name === 'Wild Shape');
  const cards = S.companions.map((c, i) => compCard(c, i, false)).join('');
  const summonRows = typeof combatCompanionRows === 'function' ? combatCompanionRows() : [];
  $('#page-companions').innerHTML = `
  <div class="blockp" ${PID('companions')}><div class="filters" style="margin-top:0">
    ${ws >= 0 ? `<button class="btn gold" data-act="wildshape" title="Uses your Wild Shape feature">Wild Shape</button>` : ''}
    <div class="menu"><button class="btn" data-act="menu" aria-haspopup="true">+ Add ▾</button><div class="menu-list">
      <button data-act="addcreature">Creature from the list<small>Beasts, mounts, familiars, elementals, undead</small></button>
      ${Object.keys(DND.companions).some(classCompanionOK) ? '<button data-act="addclasscomp">Class companion<small>Scales with your level</small></button>' : ''}
      <button data-act="add" data-list="companions">Custom companion<small>Type in any stat block</small></button>
      <button data-act="transform">I've been transformed…<small>Polymorphed, potion, curse or DM effect: take a creature's stats</small></button></div></div>
    <span class="hint">Summoning spells, Wild Shape and polymorph add themselves here and clean up when they end.</span></div>
  ${formPanel}
  ${summonRows.length ? `<div class="panel comp-summon"><h2>Class companions</h2>${summonRows.join('')}</div>` : ''}
  <div class="comps">${cards || (f ? '' : '<div class="panel"><p class="hint" style="margin:0">No companions. Cast a summoning spell, Find Familiar or Find Steed, use Wild Shape, or add a creature.</p></div>')}</div></div>`;
}
// Class companions: who may have them, which class level drives their stats, and how they arrive.
const COMP_RULES = {
  'Steel Defender': { cls: 'artificer', req: () => hasSub('artificer', 'battlesmith') && clsLv('artificer') >= 3, perm: true, always: true, ab: 'int', command: 'On its turn (right after yours) it takes the action you command: Force-Empowered Rend, Repair, or any other action (Dash, Disengage, Help, Hide, Search…). Without a command it only takes the Dodge action.' },
  'Homunculus Servant': { cls: 'artificer', req: () => clsLv('artificer') >= 2 && (S.inventory || []).some(it => it.infusion && it.infusion.name === 'Homunculus Servant'), perm: true, always: true, ab: 'int' },
  'Primal Companion (Land)': { cls: 'ranger', req: () => hasSub('ranger', 'beastmaster') && clsLv('ranger') >= 3, perm: true, group: 'primal', ab: 'wis' },
  'Primal Companion (Sea)': { cls: 'ranger', req: () => hasSub('ranger', 'beastmaster') && clsLv('ranger') >= 3, group: 'primal', ab: 'wis' },
  'Primal Companion (Sky)': { cls: 'ranger', req: () => hasSub('ranger', 'beastmaster') && clsLv('ranger') >= 3, group: 'primal', ab: 'wis' },
  'Drake Companion': { cls: 'ranger', req: () => hasSub('ranger', 'drakewarden') && clsLv('ranger') >= 3, feature: 'Drake Companion', ab: 'wis' },
  'Eldritch Cannon': { cls: 'artificer', req: () => hasSub('artificer', 'artillerist') && clsLv('artificer') >= 3, feature: 'Eldritch Cannon', rounds: 600, ab: 'int' },
  'Wildfire Spirit': { cls: 'druid', req: () => hasSub('druid', 'wildfire') && clsLv('druid') >= 2, feature: 'Summon Wildfire Spirit', rounds: 600, ab: 'wis' },
  'Dancing Item': { cls: 'bard', req: () => hasSub('bard', 'creation') && clsLv('bard') >= 6, feature: 'Animating Performance', rounds: 600, ab: 'cha' }
};
// Combat → Action: summon each class companion you're entitled to (spending the feature's use when it has one).
function combatCompanionRows() {
  const seen = new Set();
  // Companions that are simply always with you (Steel Defender, Homunculus) have nothing to summon.
  return Object.keys(COMP_RULES).filter(classCompanionOK).filter(n => !COMP_RULES[n].always).filter(n => { const g = COMP_RULES[n].group; if (!g) return true; if (seen.has(g)) return false; seen.add(g); return true; }).map(n => {
    const r = COMP_RULES[n], grp = r.group ? Object.keys(COMP_RULES).filter(k => COMP_RULES[k].group === r.group && classCompanionOK(k)) : [n];
    const out = S.companions.find(c => grp.includes(c.tmpl)), nm = ((S.compMods || {})[n] || {}).name || (r.group ? n.replace(/\s*\(.*\)$/, '') : n);
    const fi = r.feature ? S.features.findIndex(f => f.name === r.feature) : -1, f = S.features[fi], max = f ? featMax(f) : null, left = max != null ? Math.max(0, max - N(f.used)) : null;
    const st = out ? `Summoned · ${N(out.hp)}/${N(out.maxhp)} HP` : 'Not summoned', uses = left != null ? ` · ${left}/${max} free use${max === 1 ? '' : 's'} left${f && fxOf(f).slotRestore ? ', then a spell slot' : ''}` : '';
    const btn = fi >= 0 ? `<button class="btn sm gold" data-act="usefeat" data-i="${fi}" data-col="action" ${left === 0 && !fxOf(f).slotRestore ? 'disabled title="No uses left"' : ''}>${out ? 'Re-summon' : 'Summon'}${left === 0 && fxOf(f).slotRestore ? ' (slot)' : ''}</button>`
      : grp.length > 1 ? grp.map(k => `<button class="btn sm${out && out.tmpl === k ? '' : ' gold'}" data-act="compsummon" data-n="${esc(k)}">${esc(k.match(/\((.*)\)/) ? k.match(/\((.*)\)/)[1] : k)}</button>`).join('')
      : `<button class="btn sm gold" data-act="compsummon" data-n="${esc(n)}">${out ? 'Re-summon' : 'Summon'}</button>`;
    return `<div class="opt"><div class="opt-head"><span class="opt-name">${esc(nm)}</span><span class="grow"></span>${btn}</div><div class="compsum-st">${st}${uses}${r.feature ? ' · uses ' + esc(r.feature) : ''}</div></div>`;
  });
}
function classCompanionOK(n) { const r = COMP_RULES[n]; return !!(r && r.req()); }
// S.compMods[template]: your table's version of a class companion (e.g. a renamed Eldritch Cannon with house-ruled HP).
// Your saved action list wins, but built-in actions keep scaling: a saved row that matches a built-in by name
// and still has the old numbers is refreshed to the current ones.
function mergeActs(builtIn, saved, known) {
  const out = [];
  saved.forEach(e => { if (Array.isArray(e)) { out.push(e); return; } if (e.a) { out.push(e.a); return; }
    const x = builtIn.find(z => actName(z) === e.b); if (!x) return; const y = x.slice(); Object.entries(e.e || {}).forEach(([k, v]) => { y[k] = v; }); out.push(y); });
  builtIn.forEach(x => { if (!(known || []).includes(actName(x))) out.push(x); }); // new at a later level
  return out;
}
function compStatsBase(n) { return compStats(n, true); }
function compStats(n, noMods) {
  const r = COMP_RULES[n], ci = castInfo(r.cls), c = DND.companions[n](clsLv(r.cls), PB(), ci.mod != null ? ci.mod : mod(r.ab), ci.atk), m = (S.compMods || {})[n];
  if (n === 'Eldritch Cannon') { const lv = clsLv(r.cls), k = ci.mod != null ? ci.mod : mod('int'), d = lv >= 9 && ST('protectorScales') ? 2 : 1;
    c.attacks = (c.attacks || []).concat([['Protector (temp HP)', '', d + 'd8+' + Math.max(1, k), 'temp HP to the cannon and each creature you choose within 10 ft']]);
    c.notes = String(c.notes || '').replace(/·?\s*Protector: [^·]*/, '').trim(); }
  if (m && !noMods) { if (N(m.hp)) c.hp = N(m.hp); if (N(m.ac)) c.ac = N(m.ac); if (m.speed) c.speed = m.speed; if (m.notes) c.notes = m.notes + (c.notes ? ' · ' + c.notes : ''); if (Array.isArray(m.actions)) c.attacks = mergeActs(c.attacks, m.actions, m.known); else if (Array.isArray(m.attacks)) c.attacks = c.attacks.concat(m.attacks); }
  return c;
}
function makeClassComp(n, extra) { const c = compStats(n); return Object.assign({ id: uid(), name: ((S.compMods || {})[n] || {}).name || n, tmpl: n, kind: 'class', ac: c.ac, hp: c.hp, maxhp: c.hp, speed: c.speed, attacks: c.attacks, notes: c.notes }, extra || {}); }
// Keep class companions in step with your level, scores and subclass; add permanent ones automatically.
function syncClassCompanions() {
  let changed = false;
  S.companions = S.companions.filter(c => { if (c.tmpl && COMP_RULES[c.tmpl] && !COMP_RULES[c.tmpl].req()) { changed = true; return false; } return true; });
  S.companions.forEach(c => {
    if (!c.tmpl || !COMP_RULES[c.tmpl]) return;
    const n = compStats(c.tmpl), lost = Math.max(0, N(c.maxhp) - N(c.hp));
    const upd = { ac: n.ac, maxhp: n.hp, hp: Math.max(0, n.hp - lost), speed: n.speed, attacks: n.attacks, notes: n.notes };
    if (JSON.stringify(upd) !== JSON.stringify({ ac: c.ac, maxhp: c.maxhp, hp: c.hp, speed: c.speed, attacks: c.attacks, notes: c.notes })) { Object.assign(c, upd); changed = true; }
  });
  Object.entries(COMP_RULES).forEach(([n, r]) => {
    if (!r.perm || !r.req() || (!r.always && (S.compOff || {})[n])) return;
    if (S.companions.some(c => c.tmpl === n || (r.group && COMP_RULES[c.tmpl] && COMP_RULES[c.tmpl].group === r.group))) return;
    S.companions.push(makeClassComp(n)); changed = true;
  });
  return changed;
}

// ---------- Story & notes ----------
function renderStory() {
  const quotes = (S.quotes || []).map((q, i) => `<div class="qrow">${ta(`quotes.${i}.text`, { rows: 1, label: 'Quote', ph: 'Something your character says…' })}${del('quotes', i)}</div>`).join('');
  const rumors = (S.rumors || []).map((r, i) => `<div class="rumor"><div class="rumor-head">${sel(`rumors.${i}.kind`, [['True', 'True'], ['False', 'False'], ['Exaggerated', 'Exaggerated'], ['Unknown', 'Unknown']], { cls: 'kind-' + (r.kind || 'Unknown'), label: 'Truth' })}${ta(`rumors.${i}.title`, { rows: 1, cls: 'title', ph: 'Rumor', label: 'Rumor title' })}${del('rumors', i)}</div>${ta(`rumors.${i}.text`, { rows: 2, ph: 'What people say', label: 'What people say' })}${fld('The truth', ta(`rumors.${i}.truth`, { rows: 1, ph: '—' }))}</div>`).join('');
  const people = (S.people || []).map((p, i) => `<div class="person"><div class="person-head">${picThumb(`people.${i}.img`, p.name || 'this person')}${inp(`people.${i}.name`, { cls: 'title', ph: 'Name', label: 'Name' })}${inp(`people.${i}.rel`, { ph: 'Relationship', label: 'Relationship', fit: 10 })}${sel(`people.${i}.att`, [['', '—'], ['ally', 'Ally'], ['friend', 'Friend'], ['family', 'Family'], ['neutral', 'Neutral'], ['rival', 'Rival'], ['enemy', 'Enemy']], { label: 'Attitude', cls: 'att-' + (p.att || '') })}${del('people', i)}</div>${ta(`people.${i}.notes`, { rows: 1, ph: 'Notes', label: 'Notes' })}</div>`).join('');
  $('#page-story').innerHTML = `
  <div class="story">
    <div class="stack">
      <div class="panel" ${PID('personality')}><h2>Personality</h2><div class="traits">
        ${fld('Personality Traits', ta('traits.personality', { rows: 3 }))}${fld('Ideals', ta('traits.ideals', { rows: 2 }))}
        ${fld('Bonds', ta('traits.bonds', { rows: 2 }))}${fld('Flaws', ta('traits.flaws', { rows: 2 }))}</div></div>
      <div class="panel" ${PID('appearance')}><h2>Appearance</h2><div class="appear">${['age', 'height', 'weight', 'eyes', 'skin', 'hair'].map(k => fld(k[0].toUpperCase() + k.slice(1), inp('appearance.' + k))).join('')}</div></div>
      <div class="panel" ${PID('backstory')}><h2>Backstory</h2>${ta('backstory', { rows: 10 })}</div>
      <div class="panel" ${PID('rumors')}><h2><span class="grow">Rumors</span><button class="btn sm" data-act="add" data-list="rumors">+ Rumor</button></h2>${rumors || '<p class="hint">Stories people tell about you — and whether they\'re true.</p>'}</div>
    </div>
    <div class="stack">
      <div class="panel" ${PID('people')}><h2><span class="grow">People</span><button class="btn sm" data-act="add" data-list="people">+ Person</button></h2>${people || '<p class="hint">Family, allies, rivals and NPCs you\'ve met.</p>'}
        ${fld('Organizations &amp; other allies', ta('allies', { rows: 2 }))}</div>
      <div class="panel" ${PID('quotes')}><h2><span class="grow">Quotes &amp; catchphrases</span>${(S.quotes || []).length ? '<button class="btn sm gold" data-act="sayquote">Say one</button>' : ''}<button class="btn sm" data-act="add" data-list="quotes">+ Quote</button></h2>${quotes || '<p class="hint">Lines your character says. “Say one” picks one at random — handy at the table.</p>'}</div>
      <div class="panel" ${PID('lore')}><h2>Lore &amp; Secrets</h2>${ta('lore', { rows: 8 })}</div>
    </div>
  </div>`;
}
function renderNotes() {
  const notes = S.notes.map((n, i) => `
    <div class="snote"><div class="note-head">${inp(`notes.${i}.date`, { type: 'date', label: 'Date' })}${inp(`notes.${i}.title`, { cls: 'title', ph: 'Session title', label: 'Title' })}${del('notes', i)}</div>
      ${ta(`notes.${i}.text`, { rows: 4, ph: 'What happened, NPCs met, loot, leads…', label: 'Notes' })}</div>`).join('');
  const goals = (S.goals || []).map((g, i) => `<div class="goal${g.done ? ' done' : ''}"><label class="checkline">${chk(`goals.${i}.done`, 'Done')}</label>${ta(`goals.${i}.text`, { rows: 1, label: 'To-do', ph: 'Something to do…' })}${del('goals', i)}</div>`).join('');
  const nOpen = (S.goals || []).filter(g => !g.done).length;
  $('#page-notes').innerHTML = `
  <div class="notesgrid">
  <div class="panel" ${PID('goals')}><h2><span class="grow">Goals &amp; To-Do</span><span class="hint" style="text-transform:none;letter-spacing:0">${nOpen} open</span><button class="btn sm" data-act="add" data-list="goals">+ To-do</button></h2>
    ${fld('Long-term goal', ta('goal', { rows: 2, ph: 'What drives your character?' }))}
    <div class="goals">${goals || '<p class="hint">Quests, errands and leads to follow up.</p>'}</div>
    ${(S.goals || []).some(g => g.done) ? '<button class="btn sm ghost" data-act="cleargoals">Clear finished</button>' : ''}</div>
  <div class="blockp" ${PID('sessions')}><div class="filters" style="margin-top:0"><button class="btn gold" data-act="add" data-list="notes">+ New session note</button>
    <span class="hint">Newest first. Level-ups are logged here automatically.</span></div>
  ${notes || '<div class="panel"><p class="hint" style="margin:0">No notes yet. Add one each session to track loot, NPCs and leads.</p></div>'}</div></div>`;
}

// ---------- Combat page ----------
const COLS = [['action', 'Action'], ['bonus', 'Bonus Action'], ['reaction', 'Reaction'], ['move', 'Movement & Free']];
// Bonus-action attacks: a feature's own (the second Psychic Blade), and the off-hand weapon when you're holding two.
function bonusAtkHTML() {
  const own = S.attacks.map((a, i) => [a, i]).filter(([a]) => a.bonus && atkShown(a)), off = S.attacks.map((a, i) => [a, i]).filter(([a]) => !a.bonus && offhandSet(a));
  if (!own.length && !off.length) return '';
  const used = !!(S.turn.used || {}).bonus, dmgTxt = (a, drop) => { const m = atkDmgMod(a) - drop, d = atkDice(a); return esc((d || '0') + (m ? sgn(m) : '')) + (a.type ? ' ' + esc(a.type) : ''); };
  const row = ([a, i], kind) => { const drop = kind === 'off' ? offDrop(a) : 0, ready = kind === 'off' ? !!S.turn.lightAtk : !a.after || (S.turn.atkWith || []).includes(a.after);
    const wait = S.inCombat && !used && !ready ? `<span class="bwait" title="${kind === 'off' ? `Attack with ${dualWielder() ? 'a one-handed melee weapon' : 'a light melee weapon'} first (Attack action)` : `Attack with your ${esc(a.after)} first (Attack action)`}">after ${kind === 'off' ? 'a light weapon attack' : esc(a.after) + ' attack'}</span>` : '';
    return `<tr class="${S.inCombat && (used || !ready) ? 'dim' : ''}"><td>${esc(a.name.replace(/\s*\(bonus action\)$/i, ''))}${kind === 'off' ? ' <span class="itag">off-hand</span>' : ''}${wait}</td><td class="nowrap">${fmt(atkHit(a))}</td><td class="nowrap bdmg">${dmgTxt(a, drop)}</td><td><button class="btn gold sm atkbtn" data-act="bonusatk" data-i="${i}" data-kind="${kind}" title="Roll to hit and damage (uses your bonus action)">⚔</button></td></tr>`; };
  const tips = off.length ? (twfStyle() ? 'Off-hand: your Two-Weapon Fighting style adds your ability modifier.' : 'Off-hand damage doesn’t add your ability modifier.') : '';
  return `<div class="block bonusatk"><div class="sect">Bonus attack${used && S.inCombat ? ' <span class="hint">· bonus action used</span>' : ''}</div><table class="mini">${own.map(r => row(r, 'bonus')).join('')}${off.map(r => row(r, 'off')).join('')}</table>${tips ? `<div class="hint">${tips}</div>` : ''}</div>`;
}
// Combat tab: spells grouped by what they do in a fight (damage first, utility last and folded away),
// each group sorted by level. Spells you can't cast right now (no slot left) are dimmed.
const SPG = [
  ['dmg', 'Damage', '⚔'], ['ctl', 'Control', '⛓'], ['heal', 'Healing', '✚'], ['buff', 'Buffs & defense', '🛡'], ['util', 'Utility', '✦']];
function spellGroup(sp) {
  const sm = spellMath(sp), a = spAuto(sp), t = String(sp.time || '').toLowerCase(), sum = String(sp.summary || '').toLowerCase();
  if (sm.dice || a.beams || a.darts || a.rays || a.weapon || a.weaponSpell || a.spiritual || a.repeat || /\d+d\d+/.test(a.rider || '')) return 'dmg';
  if (sm.heal || sm.temp || a.heal || a.repeatHeal) return 'heal';
  if (sm.save || sm.attack) return 'ctl';
  if (a.buff || a.rider || a.summon || a.conjure || a.form || /\+\d+ ac|resistance|advantage|invisible|teleport|fly|speed/.test(sum) || /reaction/.test(t)) return 'buff';
  return 'util';
}
function spellCastable(sp) {
  if (sp.usesOnly) return N(evalMax(sp.uses && sp.uses.max)) - N(sp.uses && sp.uses.used) > 0;
  const L = N(sp.level); if (!L || sp.atWill) return true;
  if (sp.uses && N(sp.uses.max) && N(sp.uses.used) < (evalMax(sp.uses.max) || 0)) return true;
  for (let l = L; l <= 9; l++) if (slotMax(l - 1) > 0 && slotsLeft(l - 1) > 0) return true;
  const pc = pact(); return !!(pc && pc.level >= L && pactLeft() > 0);
}
const cgOpen = (col, k) => { const v = !!UI.open['cg:' + col + ':' + k]; return k === 'util' ? v : !v; };
const cGroupHead = (col, k, name, icon, n, open) => `<button class="cspg-h" data-act="toggle" data-key="cg:${col}:${k}" aria-expanded="${open}" title="${open ? 'Collapse' : 'Expand'}"><span class="cspg-i">${icon}</span><b>${name}</b><span class="cspg-n">${n}</span><span class="caret">${open ? '▴' : '▾'}</span></button>`;
// A group with nothing in it starts collapsed (tap to open it anyway).
const cGroup = (col, k, name, icon, n, inner) => { const empty = !N(n) || !String(inner || '').replace(/<[^>]*>/g, '').trim(), open = empty ? !!UI.open['cg:' + col + ':' + k] && k !== 'util' || (k === 'util' && !!UI.open['cg:' + col + ':' + k]) : cgOpen(col, k); return `<div class="cspg g-${k}${open ? '' : ' shut'}">${cGroupHead(col, k, name, icon, n, open)}${open ? `<div class="cspg-b">${inner}</div>` : ''}</div>`; };
function combatSpellsHTML(col, spells) {
  const groups = {}; spells.forEach(x => (groups[spellGroup(x[0])] = groups[spellGroup(x[0])] || []).push(x));
  const lvTag = L => L ? ORD[L - 1] : 'Cantrip';
  const row = ([sp, i]) => {
    const sm = sp.usesOnly && N(sp.uses && sp.uses.level) > N(sp.level) ? spellMath(sp, N(sp.uses.level)) : spellMath(sp), ci = spellCI(sp), L = N(sp.level), ok = spellCastable(sp);
    const hit = sm.attack ? `<span class="csp-k hit">${fmt(ci.atk)} hit</span>` : sm.save ? `<span class="csp-k save">DC ${ci.dc} ${esc(sm.save)}</span>` : '';
    const a = spAuto(sp), mult = a.darts ? (3 + Math.max(0, L - 1)) + '× ' : a.rays ? N(a.rays) + '× ' : a.beams ? cantripTier() + '× ' : '';
    const ag = sp.name === 'Eldritch Blast' && hasFeature('Agonizing Blast') ? mod('cha') : 0, tier = cantripTier();
    const eff = a.darts ? `<span class="csp-k dmg">${mult}1d4+1 force</span>` : a.beams ? `<span class="csp-k dmg">${mult}1d10${ag ? sgn(ag) : ''} force</span>` : a.weapon ? `<span class="csp-k dmg">weapon${tier > 1 ? ' +' + (tier - 1) + 'd8 ' + (a.boom ? 'thunder' : 'fire') : ''}</span>` : a.rider && !sm.dice ? `<span class="csp-k dmg">on hit +${esc(String(a.rider).replace(/\s*\(.*$/, ''))}</span>` : sm.dice ? `<span class="csp-k dmg">${mult}${esc(sm.dice)} ${esc(String(sm.type || '').toLowerCase())}</span>` : sm.heal ? `<span class="csp-k heal">heal ${esc(sm.heal)}</span>` : sm.temp ? `<span class="csp-k heal">${esc(sm.temp)} temp HP</span>` : '';
    return `<div class="csp${ok ? '' : ' nocast'}"><span class="csp-lv${L ? '' : ' c0'}" title="${lvTag(L)}">${L || '∞'}</span>
      <div class="csp-main"><div class="csp-name"><span class="csp-nm">${sp.flavor && sp.flavor.trim() ? `${esc(sp.flavor.trim())}<button class="notetip" data-tip="${i}" data-tipkind="sp" aria-label="What ${esc(sp.name)} does">ⓘ</button> <span class="sp-real">${esc(sp.name)}</span>` : (() => { const w = String(sp.name).trim().split(/\s+/), l = w.pop(); return (w.length ? esc(w.join(' ')) + ' ' : '') + `<span class="nowrap">${esc(l)}<button class="notetip" data-tip="${i}" data-tipkind="sp" aria-label="What ${esc(sp.name)} does">ⓘ</button></span>`; })()}</span>${sp.conc ? '<span class="csp-tag">conc</span>' : ''}${sp.uses && N(sp.uses.max) ? `<span class="csp-tag free">${Math.max(0, (evalMax(sp.uses.max) || 0) - N(sp.uses.used))}${sp.usesOnly ? '/' + (evalMax(sp.uses.max) || 0) + ' stored' + (N(sp.uses.level) > N(sp.level) ? ' · ' + ORD[N(sp.uses.level) - 1] + ' lvl' : '') : ' free'}</span>` : ''}</div>
        <div class="csp-sub">${hit}${eff}${sp.range ? `<span class="csp-r">${esc(sp.range)}</span>` : ''}</div></div>
      <button class="btn gold sm" data-act="cast" data-i="${i}" data-col="${col}" ${ok ? '' : 'title="No spell slots left for this level"'}>Cast</button></div>`;
  };
  if (spCustom()) { spCatsEnsure(); return spCatsAll().map(c => { const list = spells.filter(x => spCatOf(x[0]) === c.id).sort((x, y) => spOrd(x[0], x[1]) - spOrd(y[0], y[1]));
      if (!list.length) return ''; const k = 'c:' + (c.id || 'none'), open = cgOpen(col, k);
      return `<div class="cspg g-cat${open ? '' : ' shut'}" style="--g:${esc(c.color || 'var(--gold)')}">${cGroupHead(col, k, esc(c.name), esc(c.icon || '◆'), list.length, open)}${open ? `<div class="cspg-b">${list.map(row).join('')}</div>` : ''}</div>`; }).join(''); }
  if (ST('combatSpellSort') === 'level') {
    const GC = { dmg: '#d9603b', ctl: '#9b6bd6', heal: '#3c9d6b', buff: '#3f8fd2', util: 'var(--soft)' }, ord = SPG.map(g => g[0]), byL = {};
    spells.forEach(x => (byL[N(x[0].level)] = byL[N(x[0].level)] || []).push(x));
    const lo = spGroupsOrdered('level').map(g => g.k);
    return Object.keys(byL).map(Number).sort((a, b) => lo.indexOf('lv' + a) - lo.indexOf('lv' + b)).map(L => {
      const k = 'lv' + L, list = byL[L].slice().sort((x, y) => ord.indexOf(spellGroup(x[0])) - ord.indexOf(spellGroup(y[0])) || String(x[0].name).localeCompare(y[0].name)), open = cgOpen(col, k);
      return `<div class="cspg g-lvl${open ? '' : ' shut'}">${cGroupHead(col, k, L ? ORD[L - 1] + ' level' : 'Cantrips', L || '∞', list.length, open)}${open ? `<div class="cspg-b">${list.map(x => row(x).replace('<div class="csp', `<div style="--g:${GC[spellGroup(x[0])]}" title="${esc((SPG.find(g => g[0] === spellGroup(x[0])) || [])[1] || '')}" class="csp`)).join('')}</div>` : ''}</div>`;
    }).join('');
  }
  return spGroupsOrdered('purpose').filter(g => groups[g.k]).map(({ k, name, icon }) => {
    const list = groups[k].slice().sort((x, y) => N(x[0].level) - N(y[0].level) || String(x[0].name).localeCompare(y[0].name));
    const open = cgOpen(col, k);
    return `<div class="cspg g-${k}${open ? '' : ' shut'}">${cGroupHead(col, k, name, icon, list.length, open)}${open ? `<div class="cspg-b">${list.map(row).join('')}</div>` : ''}</div>`;
  }).join('');
}
function spellsFor(col) {
  return S.spells.map((sp, i) => [sp, i]).filter(([sp]) => spReady(sp) && castCol(sp.time) === col)
    .sort((x, y) => N(x[0].level) - N(y[0].level) || String(x[0].name).localeCompare(y[0].name));
}
function smiteHTML() {
  let h = '';
  const p = pact();
  for (let i = 0; i < 9; i++) {
    const m = slotMax(i); if (!m) continue;
    const left = slotsLeft(i), dice = Math.min(5, i + 2) + (UI.smiteUndead ? 1 : 0);
    h += `<button class="smite-btn" data-act="smite" data-l="${i}" ${left ? '' : 'disabled'} title="Spend a ${ORD[i]}-level slot (${left} left)"><b>${Math.min(6, dice)}d8</b><span>${ORD[i]} slot</span></button>`;
  }
  if (p) { const dice = Math.min(5, p.level + 1) + (UI.smiteUndead ? 1 : 0); h += `<button class="smite-btn" data-act="smite" data-l="pact" ${pactLeft() ? '' : 'disabled'}><b>${Math.min(6, dice)}d8</b><span>Pact slot</span></button>`; }
  return h || '<span class="hint">No slots</span>';
}
const sneakDice = () => { const r = clsLv('rogue'); return r ? Math.ceil(r / 2) + 'd6' : ''; };
// Out of combat: no turn tracker or action economy — just what you reach for between fights.
function oocHTML(comps) {
  const spells = S.spells.map((sp, i) => [sp, i]).filter(([sp]) => spReady(sp));
  const feats = S.features.map((f, i) => [f, i]).filter(([f]) => !fxHidden(f) && !isStunStrike(f) && (fxIsResource(f) ? featMax(f) != null || fxVisActs(f).length : (featMax(f) != null || f.col || fxOf(f).use || fxOf(f).roll || fxOf(f).target))).sort((a, b) => fxIsResource(b[0]) - fxIsResource(a[0]));
  const featRow = ([f, i]) => { const max = featMax(f), fx = fxOf(f), left = max != null ? Math.max(0, max - N(f.used)) : null;
    return `<div class="opt"><div class="opt-head"><span class="opt-name">${esc(f.name)}</span><button class="notetip" data-tip="${i}" data-tipkind="feat" aria-label="What ${esc(f.name)} does">ⓘ</button>${max != null ? `<span class="pips" data-calc-html="featpips:${i}"></span>` : ''}<span class="grow"></span>${fxIsResource(f) ? '' : `${f.col ? `<span class="itag">${f.col === 'bonus' ? 'Bonus' : f.col[0].toUpperCase() + f.col.slice(1)}</span>` : ''}<button class="btn sm" data-act="usefeat" data-i="${i}" ${left === 0 && !fx.slotRestore ? 'disabled' : ''}>${fx.useLabel || (f.roll || fx.roll ? 'Use & roll' : 'Use')}</button>`}</div>${fxIsResource(f) && fxInfoLine(f) ? `<div class="opt-info">${esc(fxInfoLine(f))}</div>` : ''}${fxVisActs(f).length ? `<div class="fxacts">${fxActsHTML(f, i, null)}</div>` : ''}</div>`; };
  const skills = (S.skills || []).map((sk, i) => `<div class="ooc-sk" title="Roll ${esc(sk.name)}">${rollBtn('skill:' + i, sk.name)}<span>${esc(sk.name)}</span></div>`).join('');
  return `<div class="oocbar panel" ${PID('turnbar')}><div class="grow"><b class="ooc-t">Out of initiative</b><div class="hint">Exploring, talking, resting. Roll initiative to bring back rounds, turns and your action economy.</div></div>
      <button class="btn ghost sm ooc-enter" data-act="entercombat" title="Switch to initiative mode without rolling (the DM already rolled, or you rolled elsewhere)">Initiative mode</button><button class="btn gold big" data-act="startcombat">⚔ Roll Initiative</button></div>
    <div class="cstrip">
      <div class="panel cs-slots" ${PID('slots')}><h2>${realSlots() ? 'Spell Slots' : 'Stored spells'}</h2>${slotsPanelInner()}</div>
      <div class="panel cs-fx" ${PID('activefx')}>${activeFxInner(false)}</div>
    </div>
    ${mmPanelHTML()}
    <div class="blockp ooc-grid" ${PID('oocmain')}>
      <div class="ooc-col">
        ${comps}
        <div class="panel"><h2>Attacks</h2>
          <table class="mini ooc-atk">${S.attacks.map((at, i) => { if (!atkShown(at)) return ''; const wi = at.item && S.inventory.find(x => x.id === at.item), tip = String(at.notes || '').trim() || (wi && (String(wi.notes || '').trim() || wi.hb)); return `<tr><td>${esc(at.name)}${tip ? `<button class="notetip" data-tip="${i}" data-tipkind="atk" aria-label="Notes for ${esc(at.name)}">ⓘ</button>` : ''}</td><td>${rollBtn('atk:' + i, at.name + ' attack')}</td><td>${rollBtn('dmg:' + i, at.name + ' damage')}</td><td>${atkBtn(i, true)}</td></tr>`; }).join('') || '<tr><td class="hint">No attacks — add weapons in Inventory.</td></tr>'}</table>
          ${clsLv('rogue') ? `<div class="row sarow" style="margin-top:6px"><button class="btn sm gold" data-act="sneak">Sneak Attack ${sneakDice()}</button><span class="sadotw" data-calc-html="sneakdot"></span></div>` : ''}${stunRowHTML()}</div>
        ${spells.length ? `<div class="panel"><h2>Spells</h2>${combatSpellsHTML('ooc', spells)}</div>` : ''}
      </div>
      <div class="ooc-col">
        ${(() => { const r = combatCompanionRows(); return r.length ? `<div class="panel"><h2>Companions</h2>${r.join('')}</div>` : ''; })()}
        ${feats.length ? `<div class="panel"><h2>Features</h2>${feats.map(featRow).join('')}</div>` : ''}
        <div class="panel"><h2>Quick checks</h2><div class="ooc-sks">${skills}</div></div>
      </div>
    </div>`;
}
function renderCombat() {
  const m = isMobile();
  const featView = (col, f, fi) => {
    const max = featMax(f), key = `fopt:${fi}`, open = !m || UI.open[key], fx = fxOf(f), own = f.col === col, info = own ? fxInfoLine(f) : '';
    const useBtn = !own || fxIsResource(f) || (max != null && f.pool && !fx.cost) ? '' : `<button class="btn sm${max != null || fx.cost || fx.roll ? '' : ' ghost'}" data-act="usefeat" data-i="${fi}" data-col="${col}">${f.roll || fx.roll ? 'Use & roll' : max != null || fx.cost || fx.use ? 'Use' : 'Take'}</button>`;
    return `<div class="opt"><div class="opt-head">${m ? `<button class="opt-name opt-tog" data-act="toggle" data-key="${key}" aria-expanded="${!!open}">${esc(f.name)} <span class="caret">${open ? '▴' : '▾'}</span></button>` : `<span class="opt-name">${esc(f.name)}</span>`}
      <button class="notetip" data-tip="${fi}" data-tipkind="feat" aria-label="What ${esc(f.name)} does">ⓘ</button>${max != null ? `<span class="pips" data-calc-html="featpips:${fi}"></span>` : ''}${useBtn}</div>
      ${info ? `<div class="opt-info">${esc(info)}</div>` : ''}${fx.acts ? `<div class="fxacts">${fxActsHTML(f, fi, col)}</div>` : ''}
      ${open && f.desc && own ? `<div class="opt-text">${esc(formulaDC(f.desc))}</div>` : ''}</div>`;
  };
  const optEdit = (col, o, j) => `<div class="opt edit"><div class="opt-head">${inp(`combat.${col}.${j}.name`, { cls: 'title', label: 'Name' })}${j ? mv('combat.' + col, j) : ''}${del('combat.' + col, j)}</div>
      ${ta(`combat.${col}.${j}.text`, { rows: 2, label: 'Description' })}</div>`;
  const spellView = (col, [sp, i]) => { const sm = spellMath(sp); return `<div class="opt"><div class="opt-head"><span class="opt-name">${spDisp(sp)}</span><button class="notetip" data-tip="${i}" data-tipkind="sp" aria-label="What ${esc(sp.name)} does">ⓘ</button>
      <span class="tag${sp.always ? ' oath' : ''}">${N(sp.level) ? ORD[N(sp.level) - 1] : 'Cantrip'}</span>${sp.conc ? '<span class="tag">Conc</span>' : ''}
      <button class="btn gold sm" data-act="cast" data-i="${i}" data-col="${col}">Cast</button></div>
      <div class="opt-text">${[sp.range, sm.attack ? 'spell attack' : '', sm.save ? sm.save + ' save' : '', sm.dice ? sm.dice + ' ' + sm.type : sm.heal ? 'heal ' + sm.heal : ''].filter(Boolean).map(esc).join(' · ')}</div></div>`; };
  const col = ([key, title]) => {
    const editing = UI.open['econedit:' + key];
    const list = S.combat[key] || [];
    let body = '';
    if (key === 'action') {
      body += hasteBlockHTML();
      body += `<div class="block"><div class="sect">Attack action <span class="atkpips" data-calc-html="atkpips" title="Attacks left this turn"></span><span class="grow"></span></div>
        <table class="mini">${S.attacks.map((at, i) => { if (!atkShown(at) || at.bonus) return ''; const wi = at.item && S.inventory.find(x => x.id === at.item), tip = String(at.notes || '').trim() || (wi && (String(wi.notes || '').trim() || wi.hb)); const nmw = String(at.name).trim().split(/\s+/), lastW = nmw.pop(); return `<tr><td>${nmw.length ? esc(nmw.join(' ')) + ' ' : ''}<span class="nowrap">${esc(lastW)}${tip ? `<button class="notetip" data-tip="${i}" data-tipkind="atk" aria-label="Notes for ${esc(at.name)}">ⓘ</button>` : ''}</span></td><td>${rollBtn('atk:' + i, at.name + ' attack')}</td><td>${rollBtn('dmg:' + i, at.name + ' damage')}</td><td>${atkBtn(i, true)}</td></tr>`; }).join('') || '<tr><td class="hint">No attacks — add weapons in Inventory.</td></tr>'}</table>
        <div class="hint" data-calc="ridersnote"></div>
        ${clsLv('rogue') ? `<div class="row sarow" style="margin-top:6px"><button class="btn sm gold" data-act="sneak">Sneak Attack ${sneakDice()}</button><span class="sadotw" data-calc-html="sneakdot"></span></div>` : ''}
        ${stunRowHTML()}
        ${hasFeature('Divine Smite') ? `<div class="smite"><div class="sect" style="width:100%">Divine Smite <span class="grow"></span>
          <button class="toggle${UI.smiteUndead ? ' on' : ''}" data-act="smiteundead" aria-pressed="${!!UI.smiteUndead}" title="Undead and fiends take +1d8">Undead / Fiend +1d8</button></div>
          <div class="smite-row" data-calc-html="smite"></div></div>` : ''}</div>`;
    }
    if (key === 'bonus') body += bonusAtkHTML();
    if (key === 'move') {
      body += `<div class="block movebox">
        <div class="mv-top"><div class="mv-left"><b data-calc="moveleft"></b><span>ft left</span></div><div class="mv-sub" data-calc-html="movesub"></div></div>
        <div class="mbar" data-calc-html="movebar"></div>
        <div class="mv-btns"><span class="mv-l">Moved</span>${[5, 10, 15, 30].map(d => `<button class="btn sm mvft" data-act="move" data-d="${d}" aria-label="Moved ${d} feet">+${d}</button>`).join('')}<span class="grow"></span><button class="btn sm ghost mvback" data-act="move" data-d="-5" title="Take back 5 ft" aria-label="Take back 5 feet">↺</button></div>
        <div class="hint mv-note" data-calc-html="movenote"></div>
        ${hasFeline() ? `<div class="feline"><button class="btn sm${S.turn.feline ? ' gold' : ''}" data-act="feline" ${S.turn.feline || S.felineSpent ? 'disabled' : ''}>${S.turn.feline ? '✓ Speed doubled this turn' : 'Feline Agility: double speed'}</button><span class="hint">${S.turn.feline ? '' : S.felineSpent ? 'Recharges after a turn where you move 0 ft.' : 'Doubles your speed until the end of the turn.'}</span></div>` : ''}</div>`;
    }
    if (key === 'reaction' && S.turn.readied) { const r = S.turn.readied, gone = !!(S.turn.used || {}).reaction;
      body += `<div class="block readied${gone ? ' gone' : ''}"><div class="sect">Readied action</div><div class="opt-head"><span class="opt-name">${esc(r.name)}</span>
        <button class="btn sm gold" data-act="readyfire" ${gone ? 'disabled' : ''}>${gone ? 'Reaction used' : r.k.startsWith('atk:') ? 'Attack now' : r.spell ? 'Release spell' : 'Do it now'}</button>
        <button class="btn sm ghost" data-act="readydrop">Drop</button></div>
        <div class="opt-text">${r.trigger ? 'Trigger: ' + esc(r.trigger) : 'No trigger written down'}${r.spell ? ' · holding it takes concentration' : ''}</div>
        <div class="hint">${gone ? 'You used your reaction on something else, so this is lost.' : 'Using your reaction on anything else loses it. Lasts until your next turn.'}</div></div>`; }
    const spells = spellsFor(key);
    const feats = S.features.map((f, i) => [f, i]).filter(([f]) => !fxHidden(f) && !isStunStrike(f) && (f.col === key || fxVisActs(f, key).length));
    // Monks: Martial Arts lets you make one unarmed strike as a bonus action after taking the Attack action.
    if (key === 'bonus' && clsLv('monk')) { const k = S.attacks.findIndex(a => /^unarmed strike$/i.test(String(a.name).trim()));
      if (k >= 0) body += `<div class="block"><div class="sect">Martial Arts strike<span class="grow"></span></div><table class="mini"><tr><td>Unarmed Strike</td><td>${rollBtn('atk:' + k, 'Unarmed Strike attack')}</td><td>${rollBtn('dmg:' + k, 'Unarmed Strike damage')}</td><td><button class="btn gold sm atkbtn" data-act="mabonus" title="One unarmed strike as your bonus action (after taking the Attack action)">⚔</button></td></tr></table><div class="hint">After you take the Attack action. Flurry of Blows (1 ki, under Ki) makes two strikes instead.</div>${stunRowHTML()}</div>`; }
    {
      if (spells.length) body += combatSpellsHTML(key, spells);
      if (feats.length) body += cGroup(key, 'feat', 'Features', '★', feats.length, feats.map(([f, i]) => featView(key, f, i)).join(''));
      if (key === 'action') { const comps = combatCompanionRows(); if (comps.length) body += cGroup(key, 'comp', 'Companions', '🐾', comps.length, comps.join('')); }
      if (key === 'bonus' && S.companions.length) body = `<div class="incol-comps">${S.companions.map((c, i) => compCard(c, i, false, true)).join('')}</div>` + body;
      { const ir = infCombatRows(key); if (ir.length) body += cGroup(key, 'inf', 'Infusions', '⚗', ir.length, ir.join('')); }
      const items = hbItemActs(key);
      if (items.length) body += cGroup(key, 'item', 'Items', '⚙', items.length, items.map(([it, i]) => { const ch = it.charges && N(it.charges.max) > 0 ? it.charges : null, fx = hbFx(it.hb), info = [dcVal(fx.dc) ? `DC ${dcVal(fx.dc)}${fx.save ? ' ' + fx.save : ''}` : '', fx.roll ? 'roll ' + fxRollExpr(fx.roll) : '', fx.dash ? 'Dash' : ''].filter(Boolean).join(' · ');
        return `<div class="opt"><div class="opt-head"><span class="opt-name">${esc(it.name)}</span>${String(it.notes || '').trim() || it.summary || it.hb ? `<button class="notetip" data-tip="${i}" aria-label="What ${esc(it.name)} does">ⓘ</button>` : ''}${ch ? `<span class="tag">${Math.max(0, N(ch.max) - N(ch.used))}/${N(ch.max)}</span>` : ''}<button class="btn sm" data-act="useitem" data-i="${i}" data-col="${key}" ${ch && N(ch.used) >= N(ch.max) ? 'disabled' : ''}>${fx.roll ? 'Use & roll' : 'Use'}</button></div>${info ? `<div class="opt-info">${esc(info)}</div>` : ''}${it.hb.text ? `<div class="opt-text">${esc(fxText(it.hb.text))}</div>` : ''}</div>`; }).join(''));
      // Standard options (Dash, Dodge…) live in their own group; ✎ there edits, adds, reorders or removes them.
      const stdChips = `<div class="chips">${list.map(o => `<button class="chip" data-act="markopt" data-col="${key}" data-name="${esc(o.name)}" data-text="${esc(o.text)}" title="${esc(o.text)}">${esc(o.name)}</button>`).join('')}</div>`;
      const stdEdit = `<div class="std-edit">${list.map((o, j) => optEdit(key, o, j)).join('')}<div class="row std-edit-btns"><button class="btn sm" data-act="add" data-list="combat.${key}">+ Add option</button><span class="grow"></span><button class="btn sm gold" data-act="toggle" data-key="econedit:${key}">Done</button></div></div>`;
      body += cGroup(key, 'std', key === 'move' ? 'Free & movement' : 'Standard', '◆', list.length, (editing ? stdEdit : (list.length ? stdChips : '<p class="hint" style="margin:6px 0">No standard options.</p>') + `<div class="std-editlink"><button class="btn sm ghost" data-act="toggle" data-key="econedit:${key}" title="Add, rename, reorder or remove these options">✎ Edit options</button></div>`));
    }
    return `<div class="econ col-${key}" data-col="${key}" data-zi="${key}">
      <div class="econ-head"><span class="badge b-${key}"></span><h3>${title}</h3>
        ${key !== 'move' ? `<button class="pill" data-act="econ" data-col="${key}" title="Mark used / ready">Ready</button>` : ''}</div>
      <div class="econ-body">${body}</div>
</div>`;
  };
  const cur = UI.econTab || 'action';
  const segI = Math.max(0, COLS.findIndex(([k]) => k === cur)), segFrom = UI._segPrev == null ? segI : UI._segPrev; UI._segPrev = segI;
  const seg = m ? `<div class="seg" role="tablist"><span class="seg-ind" style="--i:${segFrom}" data-to="${segI}"></span>${COLS.map(([k, t]) => `<button class="seg-btn${cur === k ? ' on' : ''}" data-act="econtab" data-col="${k}" role="tab" aria-selected="${cur === k}"><span class="badge b-${k}"></span><span>${t.replace(' & Free', '').replace('Bonus Action', 'Bonus')}</span><i class="dot" data-segcol="${k}"></i></button>`).join('')}</div>` : '';
  // Creatures use the same card as the Creatures tab wherever they show up.
  const formRow = S.form ? `<div class="panel cmini"><h2><span class="grow">${esc(S.form.name)}</span><button class="btn sm ghost" data-act="tab" data-tab="companions">Open</button></h2><div class="cm-row"><span class="hint">HP ${N(S.form.hp)}/${N(S.form.maxhp)} · AC ${N(S.form.ac)}</span>${(S.form.attacks || []).map((a, j) => `<button class="btn sm" data-act="crroll" data-who="form" data-j="${j}" data-what="both">${esc(a[0])}</button>`).join('')}</div></div>` : '';
  const cards = S.companions.map((c, i) => compCard(c, i, false)).join('');
  const comps = cards || formRow ? `<div class="blockp comps ccomps" ${PID('cmini')}>${formRow}${cards}</div>` : '';
  if (!S.inCombat) { $('#page-combat').innerHTML = oocHTML(formRow + cards); return; }
  $('#page-combat').innerHTML = `
  <div class="turnbar panel" ${PID('turnbar')}>
    <div class="round"><span class="lbl">Round</span><button class="btn sm" data-act="round" data-d="-1" aria-label="Previous round">−</button><b data-calc="round"></b><button class="btn sm" data-act="round" data-d="1" aria-label="Next round">+</button></div>
    <button class="btn gold" data-act="newturn">${m ? 'Next Turn' : 'Start Next Turn'}</button>
    <button class="btn" data-act="resetturn" title="Mark this turn's action, bonus action, reaction and movement ready again without changing the round">Reset Turn</button>
    <button class="btn red" data-act="endcombat">End Initiative</button>
    <span class="hint">One Action, one Bonus Action, movement and one Reaction per round. Using something here marks it spent; Next Turn resets them and counts down spell durations.</span>
  </div>
  <div class="cstrip">
    <div class="panel cs-slots" ${PID('slots')}><h2>${realSlots() ? 'Spell Slots' : 'Stored spells'}</h2>${slotsPanelInner()}</div>
    <div class="panel cs-fx" ${PID('activefx')}>${activeFxInner(false)}</div>
  </div>
  ${mmPanelHTML()}
  ${formRow}
  <div class="blockp" ${PID('economy')}>${seg}
  ${incapCond() ? `<div class="incap-banner"><b>${esc(incapCond())}</b> — you can't take actions, bonus actions or reactions${speedFt() === 0 ? ', and your speed is 0' : ''}.${N((S.condTurns || {})[incapCond()]) > 0 ? ` Ends in ${S.condTurns[incapCond()]} round${S.condTurns[incapCond()] > 1 ? 's' : ''}.` : ''}</div>` : ''}
  <div class="economy${incapCond() ? ' incap' : ''}" data-zone="econ" data-axis="x">${(m ? COLS.filter(([k]) => k === cur) : COLS).map(col).join('')}</div></div>`;
  econGroupsApply();
}

const SECTIONS = { header: renderHeader, vitals: renderVitals, core: renderCore, spells: renderSpells, features: renderFeatures, inventory: renderInventory, infusions: renderInfusions, companions: renderCompanions, story: renderStory, combat: renderCombat, notes: renderNotes };
const SECTION_EL = { header: '#sec-header', vitals: '#sec-vitals', core: '#page-core', spells: '#page-spells', features: '#page-features', inventory: '#page-inventory', infusions: '#page-infusions', companions: '#page-companions', story: '#page-story', combat: '#page-combat', notes: '#page-notes' };
function render(...names) {
  if (!S.created) return;
  GEN++;
  if (syncClassCompanions() | syncAmmo()) writeLocal();
  (names.length ? names : Object.keys(SECTIONS)).forEach(n => { RENDERING = n; SECTIONS[n](); });
  applyPanelLayout();
  renderTabs();
  $$('textarea.f').forEach(grow);
  fitItemRows(); fitToolbar(); fitAtkRows(); requestAnimationFrame(alignHpSide);
  // Slide the selected-tab highlight from where it was to the new choice.
  $$('.seg-ind[data-to]').forEach(e => { void e.offsetWidth; e.style.setProperty('--i', e.dataset.to); e.removeAttribute('data-to'); });
  if ($('#profmodal') && $('#modal').classList.contains('open')) $('#profmodal').innerHTML = profsManageInner();
  refresh();
}
function renderOthers() {
  const a = document.activeElement;
  GEN++;
  Object.keys(SECTIONS).filter(n => !$(SECTION_EL[n]).contains(a)).forEach(n => { RENDERING = n; SECTIONS[n](); });
  applyPanelLayout();
  renderTabs();
  $$('textarea.f').forEach(grow);
  refresh(); fitAtkRows();
}
function grow(t) { if (!t.offsetParent) return; t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; }

// ---------- Derived values ----------
function calcText(key) {
  const [k, a] = key.split(':');
  switch (k) {
    case 'mod': return fmt(mod(a));
    case 'eff': { const raw = S.abilities[a] === '' ? 10 : N(S.abilities[a]), v = score(a); return v !== raw ? '→ ' + v : ''; }
    case 'save': return fmt(saveVal(a));
    case 'skill': return fmt(skillVal(S.skills[a]));
    case 'prof': return fmt(PB());
    case 'init': return fmt(initVal());
    case 'passive': return String(passive());
    case 'mhp': return S.form ? N(S.form.hp) + '/' + N(S.form.maxhp) : N(S.hp.cur) + '/' + maxHp() + (N(S.hp.temp) ? ' +' + N(S.hp.temp) : '');
    case 'acv': return String(acTotal());
    case 'hpmaxv': return String(maxHp());
    case 'sktmp': { const sk = S.skills[a]; const v = sk ? tmv('skill:' + sk.name) : 0; return v ? fmt(v) : ''; }
    case 'tmpb': return N(S.hp.temp) > 0 ? '+' + N(S.hp.temp) : '';
    case 'senses': return sensesText();
    case 'toolb': return S.tools[a] ? fmt(toolBonus(S.tools[a])) : '';
    case 'hd': return hdLeftTotal() + '/' + totalLevel();
    case 'hdpools': { const p = hdPools(), ks = Object.keys(p); return ks.length > 1 ? ks.map(d => `${hdLeftOf(d)}d${d}`).join(' · ') : ks.length ? 'd' + ks[0] : ''; }
    case 'dc': return String(castInfo(a).dc);
    case 'spellatk': return fmt(castInfo(a).atk);
    case 'prepct': { const c = casterFor(a); if (!c) return ''; const lim = spellLimit(c); return (c.prepared ? countPrep(a) : countKnown(a)) + (lim != null ? ' / ' + lim : ''); }
    case 'cantct': { const c = casterFor(a); if (!c) return ''; return countCantrips(a) + ' / ' + cantripLimit(c); }
    case 'slotct': return slotsLeft(N(a)) + ' / ' + slotMax(N(a));
    case 'storect': { const sp = S.spells[N(a)]; if (!sp || !sp.uses) return ''; const mx = evalMax(sp.uses.max) || 0; return Math.max(0, mx - N(sp.uses.used)) + ' / ' + mx; }
    case 'pactct': { const p = pact(); return p ? pactLeft() + ' / ' + p.count : ''; }
    case 'atk': return S.attacks[a] ? fmt(atkHit(S.attacks[a])) : '';
    case 'dmg': return S.attacks[a] ? atkDmgText(S.attacks[a]) : '';
    case 'round': return String(N(S.turn.round) || 1);
    case 'worth': { const c = S.currency, gp = N(c.cp) / 100 + N(c.sp) / 10 + N(c.ep) / 2 + N(c.gp) + N(c.pp) * 10; return `≈ ${(Math.round(gp * 100) / 100).toLocaleString('en-US')} gp`; }
    case 'weight': return String(Math.round(weight() * 10) / 10);
    case 'carry': return String(carryCap());
    case 'encnote': { const s = score('str') * carryMult(), e = encLevel(); return ST('encumbrance') === 'variant' ? `Encumbered over ${Math.floor(5 * s)} lb (−10 ft), heavily over ${Math.floor(10 * s)} lb (−20 ft, disadvantage)${e ? ' · ' + ['', 'encumbered', 'heavily encumbered', 'over capacity'][e] : ''}` : e === 3 ? 'Over capacity: speed 5 ft' : ''; }
    case 'attune': return attunedCount() + ' / ' + attuneMax();
    case 'moveleft': return String(Math.max(0, moveBudget() - Math.max(0, N(S.turn.moved))));
    case 'move': { const sp = turnSpeed(), dn = N(S.turn.dash), bud = moveBudget(), mv = Math.max(0, N(S.turn.moved)); return `${Math.max(0, bud - mv)} ft left · moved ${mv} of ${bud} ft${dn ? ` (speed ${sp} + Dash ${sp * dn})` : ''}`; }
    case 'speed': return speedInfo().walk + 'ft';
    case 'speedx': { const t = speedInfo().text; const i = t.indexOf('·'); return i >= 0 ? t.slice(i + 1).trim() : ''; }
    case 'speedtip': return (speedInfo().parts || []).join(' · ');
    case 'truehp': return `${N(S.hp.cur)}/${maxHp()}`;
    case 'ridersnote': { const r = S.riders || []; const x = extraDice(); return (r.length ? 'Next hit adds: ' + r.map(z => z.name + ' ' + z.dice).join(', ') + '. ' : '') + (x.length ? 'Every hit adds: ' + x.join(', ') + '.' : ''); }
    case 'concnote': return S.concentration ? 'Concentrating on ' + S.concentration : '';
    case 'ammo': { const am = ammoItem(S.attacks[a]); return am ? N(am.qty) + ' ammo' : ''; }
    case 'lvl': return String(totalLevel());
    case 'xpnext': return totalLevel() >= 20 ? 'max' : '/ ' + xpNext().toLocaleString();
    case 'subtitle': return [S.raceName, classLabel(), S.backgroundName].filter(Boolean).join(' · ');
  }
  return '';
}
function calcHTML(key) {
  const [k, a] = key.split(':');
  switch (k) {
    case 'sneakdot': { if (!S.inCombat) return '<span class="hint">once per turn</span>'; const u = !!(S.turn && S.turn.sneak); return `<span class="pips"><button class="pip${u ? ' spent' : ''}" data-act="sneaktog" aria-pressed="${u}" aria-label="Sneak Attack this turn" title="${u ? 'Used this turn — tap to mark it ready again' : 'Ready — once per turn'}"></button></span><span class="hint">${u ? 'Used this turn' : 'Ready this turn'}</span>`; }
    case 'hpring': {
      const f = S.form;
      const max = f ? Math.max(1, N(f.maxhp)) : Math.max(1, maxHp()), cur = Math.max(0, Math.min(f ? N(f.hp) : N(S.hp.cur), max)), tmp = Math.max(0, N(S.hp.temp));
      return hpRingSVG(cur, max, tmp, f ? ' form' : '');
    }
    case 'death': {
      const row = (t, n, cls) => { let h = ''; for (let j = 0; j < 3; j++) h += `<button class="pip dot ${cls}${j < n ? '' : ' spent'}" data-pip="death${t}" data-j="${j}" aria-label="Death save ${t === 's' ? 'success' : 'failure'} ${j + 1}"></button>`; return h; };
      return `<span class="dsrow" title="Successes"><span class="dl ok">✓</span><span class="pips">${row('s', N(S.death.s), 'ok')}</span></span><span class="dsrow" title="Failures"><span class="dl bad">✕</span><span class="pips">${row('f', N(S.death.f), 'fail')}</span></span><button class="btn sm" data-act="deathsave" title="Roll a death saving throw">Roll</button>`;
    }
    case 'slotpips': return slotPips(N(a));
    case 'pactpips': return pactPips();
    case 'infpips': { const it = S.inventory[N(a)]; if (!it || !it.charges) return ''; const mx = N(it.charges.max), left = Math.max(0, mx - N(it.charges.used)); let h = ''; for (let j = 0; j < mx; j++) h += `<button class="pip inf${j < left ? '' : ' spent'}" data-pip="infch" data-i="${a}" data-j="${j}" aria-label="Charge ${j + 1}"></button>`; return h; }
    case 'storepips': { const si = N(a), sp = S.spells[si]; if (!sp || !sp.uses) return ''; const mx = evalMax(sp.uses.max) || 0, left = Math.max(0, mx - N(sp.uses.used)); let h = ''; for (let j = 0; j < mx; j++) h += `<button class="pip store${j < left ? '' : ' spent'}" data-pip="store" data-i="${si}" data-j="${j}" aria-label="Stored ${esc(sp.name)} use ${j + 1}"></button>`; return h; }
    case 'featpips': return featPips(N(a));
    case 'smite': return smiteHTML();
    case 'atkpips': { const n = attacksPerAction(), left = canAttack() ? n - N(S.turn.attacks) : 0; let h = ''; for (let j = 0; j < n; j++) h += `<i class="ap${j < left ? ' on' : ''}"></i>`; return h; }
    case 'fxchips': {
      const fx = S.effects || [];
      if (!fx.length) return '<span class="hint">No spells or effects running.</span>';
      return fx.map((e, j) => `<span class="fxc${e.conc ? ' conc' : ''}${e.rounds != null && e.rounds <= 1 ? ' ending' : ''}" title="${esc(fxTip(e))}">${e.conc ? '<i class="cdot"></i>' : ''}<b>${esc(e.name)}</b>${e.ally ? ' (ally)' : ''}${e.from ? '<small class="fxfrom" title="Cast on you by someone else">↘</small>' : ''}${e.buff && N(e.buff.ac) && !e.ally ? ` +${N(e.buff.ac)} AC` : ''}<span class="left">${fmtRounds(e.rounds)}</span>${e.repeat ? `<button class="rep" data-act="repeatfx" data-j="${j}" title="Roll ${esc(e.repeat.dice)} ${esc(e.repeat.type || '')}">🎲 ${esc(e.repeat.dice)}</button>` : ''}<button data-act="endeffect" data-n="${esc(e.name)}" aria-label="End ${esc(e.name)}">✕</button></span>`).join('');
    }
    case 'slotsall': {
      let h = '';
      for (let i = 0; i < 9; i++) { const m = slotMax(i); if (!m) continue; h += `<div class="slotline"><span class="sl">${ORD[i]}</span><span class="pips">${slotPips(i)}</span><span class="ct">${slotsLeft(i)}/${m}</span></div>`; }
      const p = pact(); if (p) h += `<div class="slotline"><span class="sl">Pact ${ORD[p.level - 1]}</span><span class="pips">${pactPips()}</span><span class="ct">${pactLeft()}/${p.count}</span></div>`;
      S.spells.forEach((sp, si) => { if (!sp.stored || !sp.uses) return; const mx = evalMax(sp.uses.max) || 0, it = spItem(sp), lv = Math.max(N(sp.level), N(sp.uses.level));
        h += `<div class="slotline storeline" title="${sp.cls === 'artificer' ? 'Spell-Storing Item' : 'Stored spell'}${it ? ' (' + esc(it.name) + ')' : ''}: ${esc(sp.name)}${lv > N(sp.level) ? ' at ' + ORD[lv - 1] + ' level' : ''}. Doesn't refill on a rest — store again to refill."><span class="sl">Stored<small>${esc(sp.name)}</small></span><span class="pips">${calcHTML('storepips:' + si)}</span><span class="ct">${Math.max(0, mx - N(sp.uses.used))}/${mx}</span></div>`; });
      return h || '<span class="hint">No spell slots</span>';
    }
    case 'acsub': { const i = acInfo(); return `<span title="${esc(i.parts.join(' · '))}">${esc(S.form ? S.form.name : i.parts[0] || '')}</span>${S.acOverride !== '' && S.acOverride != null && !S.form ? ' <button class="linkbtn" data-act="acauto" title="Go back to calculating AC from your armor">Auto</button>' : ''}`; }
    case 'aceffects': return S.form ? '' : fxActive().filter(e => e.buff && N(e.buff.ac) && !e.ally && e.self !== false).map(e => `<span class="fx">+${N(e.buff.ac)} ${esc(e.name)}<button data-act="endeffect" data-n="${esc(e.name)}" aria-label="End ${esc(e.name)}" title="End ${esc(e.name)}">✕</button></span>`).join('');
    case 'xpbar': { const L = totalLevel(), lo = XPT[Math.max(0, L - 1)], hi = XPT[Math.min(19, L)]; const pct = L >= 20 ? 100 : Math.max(0, Math.min(100, (N(S.xp) - lo) / Math.max(1, hi - lo) * 100)); return `<i style="width:${pct}%"></i>`; }
    case 'movesub': { const sp = turnSpeed(), dn = N(S.turn.dash), mv = Math.max(0, N(S.turn.moved)); return `of <b>${moveBudget()} ft</b>${dn ? ` <span class="mv-dash">speed ${sp} + Dash ${sp * dn}</span>` : ''}<br><span>moved ${mv} ft</span>`; }
    case 'movenote': { const t = speedInfo().text, i = t.indexOf('·'), other = i >= 0 ? t.slice(i + 1).trim() : ''; const parts = []; if (S.turn.speed0) parts.push(`<b>Speed 0</b> this turn (${esc(S.turn.speed0)})`); if (other) parts.push('Also: ' + esc(other.replace(/\b(\d+)\b(?! ?ft)/g, '$1 ft'))); if (S.turn.disengaged) parts.push('<b>Disengaged</b> — moving won’t provoke opportunity attacks'); parts.push(N(S.turn.dash) ? `Dashed — you get your speed again (${turnSpeed()} ft).` : `Dash (an action) gives you ${turnSpeed()} ft more.`); return parts.join(' · '); }
    case 'movebar': return `<i style="width:${Math.max(0, 100 - Math.max(0, N(S.turn.moved)) / Math.max(1, moveBudget()) * 100)}%"></i>`;
    case 'conds': {
      const ex = N(S.exhaustion);
      return (S.rollAdv ? `<span class="cchip ${S.rollAdv === 'adv' ? 'advc' : 'disc'}">${S.rollAdv === 'adv' ? 'Advantage' : 'Disadvantage'} <small class="cturns">all d20 rolls</small><button data-act="rolladv" data-v="${S.rollAdv}" aria-label="Turn off">✕</button></span>` : '') + S.conditions.map((c, k) => `<span class="cchip">${esc(c)}<button class="notetip" data-tip="${k}" data-tipkind="cond" aria-label="What ${esc(c)} does">ⓘ</button>${(S.condTurns || {})[c] ? ` <small class="cturns">${durShort(N(S.condTurns[c]))}</small>` : ''}<button data-act="dropcond" data-c="${esc(c)}" aria-label="Remove ${esc(c)}">✕</button></span>`).join('') +
        Object.keys(S.tmpMods || {}).map(k => `<span class="cchip abt${tmv(k) > 0 ? ' pos' : ''}">${tmName(k)} ${fmt(tmv(k))}${tmr(k) > 0 ? ` <small class="hint">${tmr(k)} rd</small>` : ''}<button data-act="tmpmodclear" data-k="${k}" aria-label="End ${tmName(k)} change">✕</button></span>`).join('') +
        Object.keys(S.abTemp || {}).map(a => { const r = N(S.abTempR); return `<span class="cchip abt">${a.toUpperCase()} ${baseScore(a)}→${score(a)}<button class="notetip" data-tip="ab:${a}" data-tipkind="cond" aria-label="About this ${ABN[a]} change">ⓘ</button>${r ? ` <small class="cturns">${durShort(r)}</small>` : ''}<button data-act="abtempclear" data-a="${a}" aria-label="End ${ABN[a]} change">✕</button></span>`; }).join('') +
        (ex ? `<span class="cchip exh">Exhaustion ${ex}<button class="notetip" data-tip="exh" data-tipkind="cond" aria-label="What exhaustion does">ⓘ</button><button data-act="exh" data-d="-1" aria-label="Less exhaustion">−</button><button data-act="exh" data-d="1" aria-label="More exhaustion">+</button></span>` : '') +
        (S.conditions.length || ex || S.rollAdv || Object.keys(S.abTemp || {}).length || Object.keys(S.tmpMods || {}).length ? '' : '<span class="hint">None</span>');
    }
  }
  return '';
}
function fxTip(e) {
  const b = e.buff || {}, t = [];
  if (e.conc) t.push('Concentration'); if (e.ally) t.push('on an ally');
  if (b.ac) t.push(`+${b.ac} AC`); if (b.acBase) t.push(`AC ${b.acBase} + DEX`); if (b.acMin) t.push(`AC at least ${b.acMin}`); if (b.speed) t.push(`+${b.speed} ft speed`); if (b.speedMult) t.push('speed doubled'); if (b.fly) t.push(`fly ${b.fly} ft`);
  if (b.atk) t.push(`+${b.atk} to hit`); if (b.dmg) t.push(`+${b.dmg} damage`); if (b.dmgDice) t.push(`+${b.dmgDice} on weapon hits`); if (b.bless) t.push('+1d4 attacks & saves'); if (b.meleeDmg) t.push(`+${b.meleeDmg} melee damage`);
  if (b.aura) t.push(`+${b.aura} to saves (Aura of Protection)`); if (b.save) t.push(`+${b.save} to saves`); if (b.bane) t.push('−1d4 attacks & saves'); if ((b.resist || []).length) t.push('Resistance: ' + [].concat(b.resist).join(', '));
  if (e.from) t.push('cast on you');
  if (e.maxHp) t.push(`+${e.maxHp} max HP`); if (b.note) t.push(b.note);
  return t.join(' · ');
}
function refresh() {
  if (!S.created) return;
  $$('[data-calc]').forEach(el => { const t = calcText(el.dataset.calc); if (el.textContent !== t) el.textContent = t; });
  fitCoins();
  $$('[data-calc-title]').forEach(el => el.title = calcText(el.dataset.calcTitle));
  $$('[data-calc-html]').forEach(el => {
    const ae = document.activeElement;
    if (ae && ae.tagName === 'INPUT' && el.contains(ae)) { const p = el.querySelector('[data-pool]'); if (p) p.max = featMax(S.features[p.dataset.pool]); return; }
    const h = calcHTML(el.dataset.calcHtml); if (el._h !== h) { el.innerHTML = h; el._h = h; }
  });
  // With Extra Attack, the Action stays open until every attack is made (a grapple or shove counts as one).
  $$('.econ[data-col]').forEach(el => { const col = el.dataset.col, done = N(S.turn.attacks), per = typeof attacksPerAction === 'function' ? attacksPerAction() : 1;
    const part = col === 'action' && (S.turn.used || {}).action && done > 0 && done < per, u = !!(S.turn.used || {})[col] && !part;
    el.classList.toggle('used', u); el.classList.toggle('partial', part); const pl = el.querySelector('.pill');
    if (pl) { pl.textContent = part ? `${done}/${per} attacks` : u ? 'Used' : 'Ready'; pl.classList.toggle('partial', part); pl.setAttribute('aria-pressed', u); pl.title = part ? `${per - done} attack${per - done > 1 ? 's' : ''} left in this Attack action` : 'Mark used / ready'; } });
  document.body.classList.toggle('down', !S.form && N(S.hp.cur) <= 0);
  { const su = !!(S.inCombat && S.turn && S.turn.sneak); $$('[data-act=sneak]').forEach(b => { b.classList.toggle('used', su); b.title = su ? 'Sneak Attack already used this turn (tap the diamond to reset it)' : ''; }); }
  const ca = canAttack();
  $$('.ammo[data-calc]').forEach(el => el.classList.toggle('out', /^0 /.test(el.textContent)));
  $$('#page-combat [data-act=attack]').forEach(b => { b.disabled = !ca; b.title = ca ? 'Roll to hit and damage; a crit doubles the damage dice' : 'No attacks left this turn (Next Turn / Reset Turn on the Combat tab)'; });
  $$('[data-prepfor]').forEach(el => { const c = casterFor(el.dataset.prepfor); if (!c) return; const lim = spellLimit(c), n = c.prepared ? countPrep(c.key) : countKnown(c.key); el.classList.toggle('over', lim != null && n > lim); });
  $$('[data-cantfor]').forEach(el => { const c = casterFor(el.dataset.cantfor); if (!c) return; el.classList.toggle('over', countCantrips(c.key) > cantripLimit(c)); });
  const aci = $('#acTotal'); if (aci && aci !== document.activeElement && String(aci.value) !== String(acTotal())) aci.value = acTotal();
  const hmi = $('#hpMaxIn'); if (hmi && hmi !== document.activeElement && String(hmi.value) !== String(maxHp())) hmi.value = maxHp();
  $$('.tile.ac').forEach(el => el.classList.toggle('boosted', !S.form && fxActive().some(e => e.buff && (N(e.buff.ac) || e.buff.acMin || e.buff.acBase) && !e.ally)));
  $$('[data-segcol]').forEach(el => el.classList.toggle('used', !!S.turn.used[el.dataset.segcol]));
  document.title = (S.name || 'Character') + ' — Character Sheet';
  $$('input[data-fit]').forEach(fitInput);
  const lb = $('#lvlbox'); if (lb) lb.classList.toggle('ready', xpReady());
  histButtons();
}
function syncInputs() {
  $$('[data-k]').forEach(el => {
    if (el === document.activeElement || el.closest('#wizard')) return;
    const v = getP(el.dataset.k);
    if (el.type === 'checkbox') el.checked = !!v;
    else if (String(el.value) !== String(v ?? '')) el.value = v ?? '';
  });
}
function update() { syncInputs(); refresh(); save(); }

// ---------- History ----------
const fmtTime = t => new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
function ago(t) { const s = Math.round((Date.now() - t) / 1000); if (s < 60) return s + 's ago'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; return Math.round(s / 86400) + ' d ago'; }
const countSince = ms => { const cut = Date.now() - ms; let n = 0; for (let i = HIST.length - 1; i >= 0 && HIST[i].t >= cut; i--) n++; return n; };
function openHistory() {
  const list = HIST.slice().reverse().map((e, j) => `<li><span class="tm" title="${esc(new Date(e.t).toLocaleString())}">${fmtTime(e.t)}</span><span>${esc(e.label)} <span class="hint">· ${ago(e.t)}</span></span>
      <button class="btn sm" data-act="rewind" data-n="${j + 1}" title="Undo this change and everything after it">Rewind here</button></li>`).join('');
  const redoList = REDO.length ? `<p class="hint" style="margin:10px 0 0">${REDO.length} undone change${REDO.length === 1 ? '' : 's'} can be redone. <button class="btn sm" data-act="redoall">Redo all</button></p>` : '';
  openModal(`<h3>Change History</h3>
    <p class="hint" style="margin:0">Every change is recorded here, newest first (up to ${HMAX}). Typing in one box counts as one change. Undo / Redo also work with Ctrl+Z and Ctrl+Y.</p>
    <div class="rb"><b>Roll back the last</b><input class="f" id="rbN" type="number" min="1" value="5" style="width:70px" aria-label="Amount of time">
      <select class="f" id="rbU" style="width:110px" aria-label="Unit"><option value="60000">minutes</option><option value="3600000">hours</option><option value="86400000">days</option></select>
      <button class="btn gold" data-act="rbtime">Roll back</button></div>
    <div class="rb"><span class="hint">Quick:</span>${[['1 min', 60000], ['5 min', 300000], ['15 min', 900000], ['1 hour', 3600000], ['Today', Date.now() - new Date().setHours(0, 0, 0, 0)]].map(([t, ms]) => `<button class="chip" data-act="rbquick" data-ms="${ms}">${t} <span class="hint">(${countSince(ms)})</span></button>`).join('')}</div>
    <p class="hint" id="rbCount" style="margin:0">This will undo ${countSince(300000)} change(s).</p>
    ${HIST.length ? `<ol class="hist">${list}</ol>` : '<p class="hint">No changes recorded yet.</p>'}
    ${redoList}
    <div class="actions"><button class="btn" data-act="close">Close</button></div>`);
}
function rollback(n, what) {
  if (!n) { toast('Nothing to roll back in that time.'); return; }
  const c = undo(n); closeModal(true);
  toast(`Rolled back ${c} change${c === 1 ? '' : 's'}${what ? ' from ' + esc(what) : ''}.`, '', 9000, { label: 'Redo', fn: () => redo(c) });
}
function fieldLabel(t) {
  const k = t.dataset.k || '', name = t.getAttribute('aria-label') || k;
  const m = k.match(/^([a-z]+(?:\.[a-z]+)?)\.(\d+)\./i);
  if (m) { const L = getP(m[1]); const it = L && L[m[2]]; const nm = it && (it.name || it.title); if (nm && !/^(spell name|item name|weapon|feature name|name)$/i.test(name)) return `Edit: ${nm} · ${name}`; }
  return 'Edit: ' + name;
}

// ---------- Field events ----------
function onField(e) {
  const t = e.target;
  if (t.closest && t.closest('#wizard')) return wizField(e);
  if (t.dataset.ch !== undefined) return chField(t);
  if (t.dataset.ssrc !== undefined) return setBook(t.dataset.ssrc, t.checked);
  if (t.dataset.ls !== undefined || t.dataset.lsf !== undefined) return lsInput(t);
  if (t.dataset.fsp !== undefined) { if (e.type !== 'change' && e.inputType !== 'insertReplacementText' && e.inputType !== undefined) return; const sp = SPI(t.value); if (!sp) return; const f = S.features[N(t.dataset.fsp)]; f.spells = [...new Set((f.spells || []).concat(sp.name))]; pendingLabel = `${f.name}: add ${sp.name}`; save(); rebuildAuto(); render(); return; }
  if (t.dataset.istore !== undefined) { if (e.type !== 'change') return; const it = S.inventory[N(t.dataset.istore)]; it.spellStored = t.checked; pendingLabel = `${it.name}: ${t.checked ? 'stored spells' : 'spells not stored'}`; rebuildAuto(); save(); render(); return; }
  if (t.dataset.isplv !== undefined) { if (e.type !== 'change') return; const it = S.inventory[N(t.dataset.isplv)]; it.spellLevels = Object.assign({}, it.spellLevels, { [t.dataset.n]: N(t.value) }); pendingLabel = `${it.name}: ${t.dataset.n} at ${ORD[N(t.value) - 1]} level`; rebuildAuto(); save(); render(); return; }
  if (t.dataset.isp !== undefined) { if (e.type !== 'change' && e.inputType !== 'insertReplacementText' && e.inputType !== undefined) return; const sp = SPI(t.value); if (!sp) return; const it = S.inventory[N(t.dataset.isp)]; it.spells = [...new Set((it.spells || []).concat(sp.name))]; pendingLabel = `${it.name}: add ${sp.name}`; rebuildAuto(); save(); render(); return; }
  if (t.dataset.move !== undefined) { const it = S.inventory[N(t.dataset.move)]; it.bag = t.value; const b = (S.bags || []).find(x => x.id === t.value); pendingLabel = 'Move ' + it.name + ' to ' + (b ? b.name : 'Pack'); save(); render(); return; }
  if (t.dataset.infchoice !== undefined) { const it = S.inventory[N(t.dataset.infchoice)]; if (it && it.infusion) { it.infusion.choice = t.value; pendingLabel = 'Resistant Armor: ' + t.value; save(); render(); } return; }
  if (t.id === 'spcls') { PICK.cls = t.value; PICK.lvl = 'all'; renderPicker(); return; }
  if (t.id === 'spq') { filterCatalogQ('#spq'); return; }
  if (t.id === 'crq') { filterCatalogQ('#crq'); return; }
  if (t.dataset.pool !== undefined) {
    const f = S.features[t.dataset.pool], m = featMax(f) || 0;
    f.used = Math.max(0, m - Math.max(0, Math.min(m, N(t.value))));
    pendingLabel = 'Edit: ' + f.name + ' remaining'; save(); refresh(); return;
  }
  if (t.id === 'mq') { filterMacros(); return; }
  if (t.id === 'catq' || t.dataset.catf !== undefined) { filterCatalog(); return; }
  if (t.dataset.acin !== undefined) {
    if (t.value === '') return;
    S.acOverride = 0; const t0 = acTotal(); S.acOverride = N(t.value) - t0;
    pendingLabel = 'Edit: Armor class'; save(); refresh(); return;
  }
  if (t.dataset.hpmax !== undefined) { if (t.value === '') return; const extra = maxHp() - baseMaxHp(); S.hp.adj = N(t.value) - extra - hpMaxCalc(); pendingLabel = 'Edit: Max HP'; save(); refresh(); return; }
  if (['addWeapon', 'addTool', 'addLang'].includes(t.id)) { const v = t.value; t.value = ''; if (!v) return; const kind = { addWeapon: 'weapon', addTool: 'tool', addLang: 'lang' }[t.id]; if (v === '__other') { openModal(`<h3>Add ${kind === 'lang' ? 'a language' : kind === 'tool' ? 'a tool' : 'a weapon'}</h3>${fld('Name', '<input class="f" id="otherIn" autofocus>')}<div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="otherok" data-k="${kind}">Add</button></div>`); return; } addProf(kind, v); return; }
  if (t.id === 'featQ') { UI.featQ = t.value; clearTimeout(window._fq); window._fq = setTimeout(() => { render('features'); const e = $('#featQ'); if (e) { e.focus(); e.setSelectionRange(e.value.length, e.value.length); } }, 250); return; }
  if (t.dataset.set !== undefined) return setSetting(t);
  if (t.dataset.themekey !== undefined) return setThemeColor(t.dataset.themekey, t.value, true);
  if (t.dataset.fit !== undefined) fitInput(t);
  if (t.dataset.compvar !== undefined) { const c = S.companions[N(t.dataset.compvar)], n = makeClassComp(t.value, { id: c.id }); Object.assign(c, n); pendingLabel = 'Companion form: ' + t.value; save(); render(); return; }
  if (t.dataset.xsubfor !== undefined) { if (!t.value) return; const r = S.classes[N(t.dataset.xsubfor)]; r.extraSubs = [...new Set((r.extraSubs || []).concat(t.value))]; UI.open['xsub:' + t.dataset.xsubfor] = false; pendingLabel = 'Add subclass: ' + CL[r.key].subclasses[t.value].name; rebuildAuto(); save(); render(); if (settingsOpen()) reopenSettings(); return; }
  if (t.dataset.subfor !== undefined) { const r = S.classes[N(t.dataset.subfor)]; r.sub = t.value; pendingLabel = 'Set subclass: ' + (subOf(r) ? subOf(r).name : 'none'); rebuildAuto(); save(); render(); if (settingsOpen()) reopenSettings(); return; }
  if (t.id === 'rbN' || t.id === 'rbU') { const n = countSince(N($('#rbN').value) * N($('#rbU').value)); $('#rbCount').textContent = `This will undo ${n} change(s).`; return; }
  if (!t.dataset.k) return;
  let v;
  if (t.type === 'checkbox') v = t.checked;
  else if (t.dataset.num !== undefined) v = t.value === '' ? '' : Number(t.value);
  else v = t.value;
  const k0 = t.dataset.k, old = getP(k0);
  setP(t.dataset.k, v);
  if (/^inventory\.\d+\.name$/.test(k0)) { const it = S.inventory[k0.split('.')[1]]; S.attacks.forEach(a => { if (a.item === it.id && a.name === old) a.name = v; }); }
  if (t.tagName === 'TEXTAREA') grow(t);
  pendingLabel = (t.type === 'checkbox' || t.tagName === 'SELECT') ? fieldLabel(t).replace('Edit: ', 'Set: ') : fieldLabel(t);
  const k = t.dataset.k;
  if (/^spells\.\d+\.prepared$/.test(k) && v) { const sp = S.spells[k.split('.')[1]], c = casterFor(sp.cls); if (c) { const mx = spellLimit(c); if (mx != null && countPrep(c.key) > mx) toast(`That's ${countPrep(c.key)} ${esc(c.name)} spells prepared; you can prepare ${mx}. Always-prepared spells don't count.`, 'fumble', 6000); } }
  if (k === 'form.hp' && N(v) <= 0 && S.form) { save(); endForm(0, 'reached 0 HP'); return; }
  if (/^bags\.\d+\.in$/.test(k)) { const b = getP(k.replace(/\.in$/, '')); pendingLabel = 'Move container: ' + ((b && b.name) || 'container'); save(); render(); return; }
  if (/^inventory\.\d+\.attune$/.test(k) && !v) S.inventory[k.split('.')[1]].attuned = false;
  if (/^inventory\.\d+\.charges\.max$/.test(k)) { const it = S.inventory[k.split('.')[1]]; if (!it.charges.reset) it.charges.reset = 'long'; it.charges.used = Math.min(N(it.charges.used), N(v)); }
  if (/\.hb\.|^inventory\.\d+\.(carried|spellOnce|spellAtWill|attune)$|^features\.\d+\.(spellOnce|spellAtWill)$|^spells\.\d+\.item$/.test(k)) { save(); clearTimeout(window._hbT); window._hbT = setTimeout(() => { rebuildAuto(); save(); const a = document.activeElement; if (a && (a.type === 'checkbox' || a.tagName === 'SELECT')) render(); else renderOthers(); refresh(); }, t.type === 'checkbox' || t.tagName === 'SELECT' ? 0 : 450); }
  save();
  if (/^(abilities|slotsOverride|name|raceName)/.test(k) || /^spells\.\d+\.(prepared|always|level|conc|ritual|cls|time|name)$/.test(k) || /^features\.\d+\.(max|pool|reset)$/.test(k) || /^inventory\.\d+\.(attune|name)$/.test(k) || /^attacks\.\d+\.(name|ammo|kind)$/.test(k) || /^(goals\.\d+\.done|rumors\.\d+\.kind|people\.\d+\.att|xp)$/.test(k) || /^companions/.test(k)) {
    if (e.type === 'change' || t.type !== 'checkbox') scheduleOthers(k);
  }
  refresh();
}
let othersTimer = null;
function scheduleOthers(k) {
  clearTimeout(othersTimer);
  othersTimer = setTimeout(() => {
    const a = document.activeElement;
    if (a && (a.type === 'checkbox' || a.tagName === 'SELECT')) { a.blur(); render(); }
    else renderOthers();
  }, /^abilities|^features\.\d+\.max/.test(k) ? 350 : 0);
}
document.addEventListener('input', e => { if (e.target.type !== 'checkbox' && e.target.tagName !== 'SELECT') onField(e); });
document.addEventListener('change', e => { if (e.target.type === 'checkbox' || e.target.tagName === 'SELECT') onField(e); });
document.addEventListener('focusout', e => { if (e.target.dataset && (e.target.dataset.k || e.target.dataset.acin !== undefined || e.target.dataset.hpmax !== undefined) && !(e.target.closest && e.target.closest('#wizard'))) refresh(); });

// Subclass controls, shown in Settings (Features only displays the result).
function subclassSettingsHTML() {
  return clsRows().map((r, k) => { const c = CL[r.key]; if (!c || !c.sub) return '';
    const can = N(r.level) >= c.sub.level || r.sub;
    const sel = can ? `<select class="f subpick" data-subfor="${k}" aria-label="${esc(c.sub.label)}">${[['', '— choose —']].concat(bookSort(Object.entries(c.subclasses), ([, v]) => v.src, ([, v]) => v.name).map(([kk, v]) => [kk, v.name + (v.src && v.src !== 'PHB' ? ` (${v.src})` : '')])).map(([kk, t]) => `<option value="${kk}"${r.sub === kk ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>` : `<span class="hint">at level ${c.sub.level}</span>`;
    const extras = (r.extraSubs || []).map(xk => c.subclasses[xk] ? `<div class="xsubrow"><span>+ ${esc(c.subclasses[xk].name)}</span><span class="xsublv"><button class="btn sm" data-act="xsublv" data-i="${k}" data-k="${xk}" data-d="-1" aria-label="One level fewer">−</button><b>${N((r.extraSubLv || {})[xk]) ? `${N(r.extraSubLv[xk])} lv` : 'all'}</b><button class="btn sm" data-act="xsublv" data-i="${k}" data-k="${xk}" data-d="1" aria-label="One level more">+</button></span><button class="icon-btn" data-act="delxsub" data-i="${k}" data-k="${xk}" aria-label="Remove">✕</button></div>` : '').join('');
    const add = r.sub && (r.extraSubs || []).length ? `<select class="f subpick" data-xsubfor="${k}" aria-label="Another subclass"><option value="">+ Second ${esc(c.sub.label.toLowerCase())} (homebrew)</option>${bookSort(Object.entries(c.subclasses), ([, v]) => v.src, ([, v]) => v.name).filter(([kk]) => kk !== r.sub && !(r.extraSubs || []).includes(kk)).map(([kk, v]) => `<option value="${kk}">${esc(v.name)}</option>`).join('')}</select>` : '';
    return `<div class="setrow subrow"><span><b>${esc(c.sub.label)}</b><small>${esc(c.name)} ${N(r.level)}</small></span>${sel}</div>${extras || add ? `<div class="subextra">${extras}${add}</div>` : ''}`; }).join('');
}

// Hit Points panel: the ring stays where it is and the Amount box lines up with the big HP number.
function alignHpSide() {
  const wrap = $('.tile.hp .hp-wrap'), ring = $('.tile.hp .hp-ring'), side = $('.tile.hp .hp-side'), cur = $('.tile.hp .hp-center .cur'), amt = $('#hpAmt');
  if (!wrap || !ring || !side || !cur || !amt || !side.offsetParent) return;
  // Measure where the ring sits in the normal layout, pin it there, then slide only the controls down.
  wrap.style.alignItems = ''; ring.style.marginTop = ''; side.style.marginTop = '';
  const r0 = ring.getBoundingClientRect().top - wrap.getBoundingClientRect().top;
  wrap.style.alignItems = 'flex-start'; ring.style.marginTop = r0 + 'px'; side.style.marginTop = '0px';
  const c = cur.getBoundingClientRect(), a = amt.getBoundingClientRect(), d = (c.top + c.height / 2) - (a.top + a.height / 2);
  side.style.marginTop = Math.max(0, d) + 'px';
}
addEventListener('resize', () => alignHpSide());

// Big coin piles shrink their number to fit the chip instead of getting cut off.
function fitCoins() { $$('.cn .cin').forEach(el => { const n = String(el.value || '').length, z = n >= 8 ? .72 : n >= 7 ? .8 : n >= 6 ? .9 : n >= 5 ? 1 : 0; el.style.fontSize = z ? z + 'rem' : ''; }); }
document.addEventListener('input', e => { if (e.target.classList && e.target.classList.contains('cin')) fitCoins(); });
