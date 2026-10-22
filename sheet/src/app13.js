// ---------- Party (on the website) ----------
// When this character is in a party (see pages_loader.js), the Party tab shows everyone in it — their HP, AC and what's
// on them — and what you can do for them: heal them, hand items and coins over, cast a spell on them or use an ability
// on them. What you send arrives on their sheet (window.sheetIncoming) and is applied there, like a change they made.
// Spells and abilities say what they do to others in data/allyfx.js.
const PTYX = () => window.PG_PARTY || null;
const ptyOn = () => !!(PTYX() && PTYX().on());
const ptyAct = () => ptyOn() && PTYX().canAct();
const ptyMembers = () => ptyOn() ? PTYX().members() : [];
const ptyMember = id => ptyMembers().find(m => m.id === id) || null;
const ptyNm = id => (ptyMember(id) || {}).name || 'a party member';
const ptyNames = ids => { const n = ids.map(ptyNm); return n.length <= 2 ? n.join(' and ') : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1]; };
const ALLYFX = n => (DND.allyFx || {})[n] || null;
const ALLYHIT = n => (DND.allyHit || {})[n] || null;
const ALLYFEAT = n => (DND.allyFeat || {})[n] || null;

// What the others see of this character (its card on the party page and in their Party tab).
window.partyCard = () => {
  if (!S.created) return null;
  return { name: S.name || '', race: S.raceName || '', cls: classLabel(), level: lvl(), hp: N(S.hp.cur), maxhp: maxHp(), temp: N(S.hp.temp), ac: acTotal(),
    form: S.form ? { name: S.form.name, hp: N(S.form.hp), maxhp: N(S.form.maxhp) } : null, speed: speedFt(), pp: passive(),
    conds: (S.conditions || []).filter(c => c !== 'Concentrating' && c !== 'Dodging'), exh: N(S.exhaustion), conc: S.concentration || '',
    dead: N(S.death.f) >= 3, stable: N(S.hp.cur) <= 0 && N(S.death.s) >= 3,
    fx: fxActive().filter(e => !e.ally && e.self !== false).map(e => e.name).slice(0, 14),
    // this character's homebrew items: everyone in the party can add them from Add an item → Homebrew
    hb: (S.customItems || []).slice(0, 60).map(c => { const x = JSON.parse(JSON.stringify(c)); delete x.img; return x; }) };
};
let PTY_RT = null;
// The party tab is kept current even while another tab is showing (it appears once the party has loaded); while you're
// typing in it, it waits so the box you're in isn't redrawn under you.
window.onPartyChange = () => { clearTimeout(PTY_RT); PTY_RT = setTimeout(function go() { if (!S.created) return; const a = document.activeElement;
  if (a && a.closest && a.closest('#page-party') && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) { PTY_RT = setTimeout(go, 600); return; }
  // Who's in it changed (or the party just loaded): Inventory's give menus and Combat's "On…" buttons follow.
  const key = ptyOn() + ':' + ptyMembers().map(m => m.id + '/' + (m.name || '')).join(',');
  if (key !== PTY_MK) { PTY_MK = key; render(); } else render('party'); }, 120); };
let PTY_MK = '';

// ----- the log of what's been sent and received -----
function ptyLog(dir, who, text) { S.ptyLog = [{ at: Date.now(), dir, who: String(who || '').slice(0, 80), text: String(text || '').slice(0, 300) }].concat(S.ptyLog || []).slice(0, 60); }
const ptyAgo = t => { const s = (Date.now() - t) / 1000; return s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + 'm ago' : s < 86400 ? Math.floor(s / 3600) + 'h ago' : new Date(t).toLocaleDateString(); };
// Send one thing to some party members; the log and a toast say what went where.
// Each send is part of your undo history: Undo takes it back on their sheet, Redo sends it again.
async function ptySend(ids, kind, data, text, quiet, grp) {
  ids = [...new Set(ids || [])].filter(Boolean); if (!ids.length || !ptyAct()) return 0;
  await null; // after the change that sent it has been saved (a spell's slot, the item leaving your pack…)
  const recs = ids.map(to => ({ to, ref: PTYX().newRef(), kind, data, text }));
  if (grp && grp.entry) { grp.entry.pty = grp.entry.pty.concat(recs); persistHist(); } else { const e = ptyHistAdd(recs, text); if (grp) grp.entry = e; }
  let ok = 0; for (const r of recs) { try { await PTYX().send(r.to, kind, data, r.ref); ok++; } catch (e) { r.failed = true; console.warn('party send', e); } }
  if (ok) { ptyLog('out', ptyNames(ids), text); save(); if (UI.tab === 'party') render('party'); if (!quiet) toast(`${esc(text)} → <b>${esc(ptyNames(ids))}</b>${ptyFreeKind(kind) || (PTYX().info() || {}).mgr ? '' : `<div class="det">${ids.length > 1 ? 'They’re' : 'They’re'} asked to accept it on their sheet.</div>`}`, '', 6000); }
  else toast('Couldn’t reach the party right now — check your connection.', 'fumble', 7000);
  return ok;
}

function ptyHistAdd(recs, text) {
  let e = HIST[HIST.length - 1];
  if (e && Date.now() - e.t < 250 && !e.pty) e.pty = recs; // one Undo step with the change you just made
  else { e = { t: Date.now(), label: text, keys: {}, pty: recs }; HIST.push(e); while (HIST.length > HMAX) HIST.shift(); REDO = []; }
  persistHist(); histButtons(); return e;
}
function ptyHist(recs) {
  if (!ptyAct()) return; const back = !recs[0].undone;
  recs.forEach(r => { r.undone = back; if (back) PTYX().recall(r.to, r.ref).catch(() => {}); else PTYX().send(r.to, r.kind, r.data, r.ref).catch(() => {}); });
  ptyLog('out', ptyNames([...new Set(recs.map(r => r.to))]), (back ? 'Took back: ' : 'Sent again: ') + (recs[0].text || recs[0].kind));
}
// ----- the Party tab -----
// Each party member is shown like a creature card: the HP ring with Damage / Heal / Temp HP beside it, then AC and speed.
function ptyCardHTML(m) {
  const down = m.dead ? 'dead' : N(m.maxhp) && N(m.hp) <= 0 ? 'down' : '', act = ptyAct(), f = m.form;
  const cur = f ? N(f.hp) : N(m.hp), max = f ? N(f.maxhp) : N(m.maxhp), id = esc(m.id);
  const on = [].concat([f ? 'As ' + f.name : '', m.dead ? 'Dead' : down ? (m.stable ? 'Stable at 0 HP' : 'Making death saves') : ''].filter(Boolean), m.conds || [], N(m.exh) ? ['Exhaustion ' + N(m.exh)] : [], m.conc ? ['Concentrating: ' + m.conc] : [], m.fx || []);
  const more = [['coins', 'Give coins'], ['help', 'Help (advantage on their next roll)'], down && !m.dead && !m.stable ? ['stab', 'Stabilize (Medicine, DC 10)'] : null, ['note', 'Send a message']].filter(Boolean);
  const hp = max ? `<div class="chp chp2"><div class="chp-ring"><div class="ring-svg">${hpRingSVG(cur, max, m.temp, f ? ' form' : '')}</div>
      <div class="chp-center"><div class="curline"><b class="ptym-cur">${cur}</b>${N(m.temp) ? `<span class="tmpbadge">+${N(m.temp)}</span>` : ''}</div><div class="hp-max">of ${max}</div></div></div>
      ${act ? `<div class="chp-side"><select class="f ptyqt" id="ptyqt-${esc(id)}" aria-label="Damage type for ${esc(m.name)}" title="Damage type: their resistances and immunities apply"><option value="">Any</option>${DND.damageTypes.map(t => `<option value="${t.toLowerCase()}">${t}</option>`).join('')}</select><input class="f" id="ptyq-${esc(id)}" inputmode="numeric" placeholder="Amount" aria-label="Amount for ${esc(m.name)}">
        <div class="chp-btns"><button class="btn hpi dmg" data-pa="qdmg" data-id="${esc(id)}" title="Damage ${esc(m.name)}" aria-label="Damage">${ICON.hpDmg}</button><button class="btn hpi heal" data-pa="qheal" data-id="${esc(id)}" title="Heal ${esc(m.name)}" aria-label="Heal">${ICON.hpHeal}</button><button class="btn hpi tmp" data-pa="qtemp" data-id="${esc(id)}" title="Give ${esc(m.name)} temporary HP" aria-label="Temporary HP">${ICON.hpTemp}</button></div></div>` : ''}</div>` : '';
  return `<div class="panel comp2 ptym${down ? ' ' + down : ''}" data-mid="${esc(id)}"><div class="comp-h2">${m.thumb ? `<span class="picth"${/^#[0-9a-f]{6}$/i.test(m.acc || '') ? ` style="border-color:${m.acc}"` : ''}><img src="${esc(m.thumb)}" alt=""></span>` : `<span class="picadd">${esc(String(m.name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join(''))}</span>`}
      <div class="grow"><b class="cname${String(m.name || '').length > 26 ? ' n3' : String(m.name || '').length > 17 ? ' n2' : ''}" title="${esc(m.name || '')}">${esc(m.name || 'A character')}</b>${m.player ? `<div class="ptym-pl">${esc(m.player)}</div>` : ''}</div>
</div>
    <div class="cstat2">${hp}<div class="csts"><span class="cst"><small>AC</small><b>${esc(m.ac || '—')}</b></span>${m.speed ? `<span class="cst"><small>Speed</small><b>${N(m.speed)}</b></span>` : ''}${m.level ? `<span class="cst"><small>Level</small><b>${N(m.level)}</b></span>` : ''}</div></div>
    ${on.length ? `<div class="ctags">${on.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
    ${act ? `<div class="ptym-act"><button class="btn sm gold" data-pa="cast" data-id="${esc(id)}" title="Cast a spell on them">Cast a spell</button><button class="btn sm" data-pa="ability" data-id="${esc(id)}" title="Use an ability on them">Ability</button><button class="btn sm" data-pa="give" data-id="${esc(id)}" title="Give them an item">Give item</button><div class="menu up"><button class="icon-btn" data-act="menu" aria-haspopup="true" aria-label="More for ${esc(m.name || 'them')}">⋯</button><div class="menu-list">${more.map(([k, t]) => `<button data-pa="${k}" data-id="${esc(id)}">${esc(t)}</button>`).join('')}</div></div></div>` : ''}
  </div>`;
}
function renderParty() {
  const pg = $('#page-party'); if (!pg) return;
  // Not part of the panel layout (Edit layout never moves or hides it): the tab only exists while you're in a party.
  if (!ptyOn()) { pg.innerHTML = ''; return; }
  const P = PTYX().info(), ms = ptyMembers(), act = ptyAct(), abil = act ? ptyAbilities() : [], auras = abil.filter(a => a.def.kind === 'aura');
  const n = ms.length + 1, dm = P.mgr ? 'You' : (P.dmName || 'the DM');
  const head = `<div class="panel ptyhead"><div class="ptyh"><span class="ptyh-ic${P.pic ? ' pic' : ''}" aria-hidden="true">${P.pic ? `<img src="${esc(P.pic)}" alt="">` : TAB_ICON.party}</span><div class="ptyh-t"><b>${esc(P.name)}</b><span>DM ${esc(dm)} · ${n} character${n === 1 ? '' : 's'}${act ? '' : ' · you’re viewing this sheet'}</span></div>
      <div class="ptyh-btns">${act && ms.length > 1 ? '<button class="btn sm" data-pa="cast" data-id="" title="Pick the spell, then everyone it reaches">Cast a spell on allies…</button><button class="btn sm" data-pa="ability" data-id="" title="Pick the ability, then everyone it reaches">Use an ability on allies…</button>' : ''}<a class="btn sm" href="${esc(P.url)}" target="_top">Party page</a></div></div>
      ${act && ms.length ? `<p class="hint ptyh-hint">${P.mgr ? 'As the DM, what you send lands on their sheet straight away (or the next time it’s opened).' : 'Healing, items, spells and abilities you send pop up on their sheet for them to accept.'}</p>` : ''}</div>`;
  const cards = P.loading ? `<div class="panel"><p class="hint" style="margin:0">Loading the party…</p></div>` : ms.length ? `<div class="ptym-grid">${ms.map(ptyCardHTML).join('')}</div>` : `<div class="panel"><p class="hint" style="margin:0">Nobody else has joined yet. Your DM can share the party’s invite link from the party page.</p></div>`;
  const aurasP = auras.length ? `<div class="panel ptyauras"><h2>Your auras</h2>${r20AuraOn() ? `<p class="hint r20aura-st">${esc(R20A.status || 'Watching your Roll20 tokens…')}</p>` : ''}<p class="hint">Tick who’s close enough to get it. They keep it until you untick them, or you drop to 0 HP.</p>${auras.map(a => { const on = (S.ptyAuras || {})[a.name] || [];
      return `<div class="ptya"><b>${esc(a.name)}</b><span class="hint">${esc(ptyFormula(a.def.label || '') || a.def.text || '')}</span><div class="ptya-who">${ms.map(m => `<label class="checkline"><input type="checkbox" data-aura="${esc(a.name)}" data-id="${esc(m.id)}"${on.includes(m.id) ? ' checked' : ''}> ${esc(m.name)}</label>`).join('')}</div></div>`; }).join('')}</div>` : '';
  const logP = `<div class="panel ptylogp"><h2>Party log</h2>${(S.ptyLog || []).length ? `<div class="ptylog">${S.ptyLog.slice(0, 30).map(l => `<div class="ptyl ${esc(l.dir)}"><span class="ptyl-d" aria-label="${l.dir === 'in' ? 'Received' : 'Sent'}">${l.dir === 'in' ? '↓' : '↑'}</span><span class="ptyl-t">${esc(l.text)}<small>${l.dir === 'in' ? 'from ' : 'to '}${esc(l.who)} · ${esc(ptyAgo(l.at))}</small></span></div>`).join('')}</div>` : '<p class="hint" style="margin:0">What you send and receive shows up here.</p>'}</div>`;
  const ch = PTYX().chat, chatP = ch && ch.on() ? `<div class="panel ptychat"><h2>Party chat</h2><p class="hint ptychat-h">Just the players: your DM can’t see this, and messages disappear after 12 hours.</p><div class="ptychat-l" id="ptychat-l">${ptyChatList()}</div>
    <form class="ptychat-f" id="ptychat-f"><input class="f" id="ptychat-in" maxlength="1000" placeholder="Message the party…" autocomplete="off" aria-label="Message the party"><button class="btn gold">Send</button></form></div>` : '';
  pg.innerHTML = `<div class="ptytab">${head}${cards}${chatP}<div class="ptyfoot${aurasP ? '' : ' one'}">${aurasP}${logP}</div></div>`;
  const cf = $('#ptychat-f'); if (cf) cf.onsubmit = e => { e.preventDefault(); const i = $('#ptychat-in'), t = i.value.trim(); if (!t) return; i.value = ''; PTYX().chat.send(t).catch(x => { i.value = t; toast('Couldn’t send: ' + esc(x.message || x), 'fumble'); }); };
  const cl = $('#ptychat-l'); if (cl) cl.scrollTop = cl.scrollHeight;
}
document.addEventListener('change', e => { const t = e.target; if (!t.dataset || t.dataset.aura == null) return; ptyAura(t.dataset.aura, t.dataset.id, t.checked); });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-pa]'); if (!b || e.target.closest('#wizard')) return; e.preventDefault();
  const m = b.closest('.menu'); if (m) m.classList.remove('open');
  rollGate(() => ptyClick(b.dataset.pa, b.dataset.id, b)); });
function ptyClick(k, id, b) {
  if (!ptyAct()) return;
  const ids = id ? [id] : [];
  switch (k) {
    case 'heal': case 'temp': case 'dmg': return ptyAmount(k, ids);
    case 'qdmg': case 'qheal': case 'qtemp': return ptyQuick(k.slice(1), id);
    case 'give': return ptyGive(id);
    case 'coins': return ptyCoins(id === '*' ? ptyMembers().map(x => x.id) : ids);
    case 'cast': return ptyCastMenu(ids);
    case 'ability': return ptyAbilityMenu(ids);
    case 'help': return ptyUseAbility(ptyAbilities().find(a => a.name === 'Help'), ids);
    case 'stab': return ptyUseAbility(ptyAbilities().find(a => a.name === 'Stabilize'), ids);
    case 'note': return ptyNote(ids);
    case 'pk': return ptyPickDone(b);
    case 'amt': return ptyAmountGo(b.dataset.k);
    case 'giveit': return ptyGiveGo(N(b.dataset.i), b.dataset.mode);
    case 'askok': return ptyAnswer(b.dataset.ref, true);
    case 'askno': return ptyAnswer(b.dataset.ref, false);
    case 'giveto': return ptyGiveTo(N(b.dataset.i), id);
    case 'featon': { const f = S.features[N(b.dataset.i)]; if (!f) return; return ptyUseAbility({ name: f.dname || f.name, def: ptyFeatDef(f), f, fi: N(b.dataset.i), col: f.col }, null); }
    case 'givetogo': return ptyGiveGo(N(b.dataset.i), 'give', true);
    case 'coinsgo': return ptyCoinsGo();
    case 'castit': return ptyCastGo(N(b.dataset.i));
    case 'abil': return ptyAbilityGo(N(b.dataset.j));
    case 'notego': return ptyNoteGo();
    case 'choose': return ptyChooseGo(b);
  }
}
// Pick who: one or more party members (and maybe you).
let PTY_PICK = null;
function ptyPickTargets(title, max, done, opts = {}) {
  const ms = ptyMembers(); if (!ms.length) { toast('Nobody else is in your party yet.'); return; }
  if (ms.length === 1 && !opts.self && max) return done([ms[0].id]);
  PTY_PICK = { done, max: max || 99 };
  openModal(`<h3>${esc(title)}</h3>${opts.hint ? `<p class="hint" style="margin:0 0 8px">${esc(opts.hint)}</p>` : ''}
    <div class="ptypk">${ms.map(m => `<label class="ptychk"><input type="checkbox" data-pk="${esc(m.id)}"${(opts.pre || []).includes(m.id) ? ' checked' : ''}><span><b>${esc(m.name)}</b><small>${N(m.maxhp) ? N(m.hp) + '/' + N(m.maxhp) + ' HP' : ''}${(m.conds || []).length ? ' · ' + esc(m.conds.join(', ')) : ''}</small></span></label>`).join('')}</div>
    <p class="hint">${max && max < 99 ? `Up to ${max}.` : ''}</p>
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-pa="pk">OK</button></div>`);
}
function ptyPickDone() { const p = PTY_PICK; if (!p) return; const ids = $$('#modal-body [data-pk]:checked').map(x => x.dataset.pk);
  if (!ids.length) { toast('Pick someone.'); return; } if (ids.length > p.max) { toast(`Only ${p.max} can be chosen.`, 'fumble'); return; }
  PTY_PICK = null; closeModal(true); p.done(ids); }

// The amount box on a member's card (a number or a roll like 2d4+2), like a creature card's.
function ptyQuick(kind, id) { const inp = $('#ptyq-' + CSS.escape(id)); const v = inp ? inp.value : ''; if (!String(v).trim()) { if (inp) inp.focus(); toast('Type an amount in the box first.'); return; }
  const r = ptyRollAmt(v, (kind === 'heal' ? 'Healing for ' : kind === 'temp' ? 'Temporary HP for ' : 'Damage to ') + ptyNm(id)); if (!r) { toast('Type a number or a roll like 2d6+3.'); return; } if (r.skipped || !(r.total > 0)) return;
  if (inp) inp.value = ''; const w = S.name || 'an ally', ts = $('#ptyqt-' + CSS.escape(id)), dt = kind === 'dmg' && ts ? ts.value : ''; if (ts) ts.value = '';
  if (kind === 'heal') ptySend([id], 'heal', { amt: r.total, why: w }, `Healed ${r.total} HP`);
  else if (kind === 'temp') ptySend([id], 'temp', { amt: r.total, why: w }, `${r.total} temporary HP`);
  else ptySend([id], 'hit', Object.assign({ dmg: r.total, why: w }, dt ? { type: dt } : {}), `${r.total}${dt ? ' ' + dt : ''} damage`); }
// Heal / temp HP / damage by an amount (or a roll).
let PTY_AMT = null;
function ptyAmount(kind, ids) {
  if (!ids.length) return ptyPickTargets(kind === 'heal' ? 'Heal who?' : kind === 'temp' ? 'Temporary HP for who?' : 'Damage who?', 99, x => ptyAmount(kind, x));
  PTY_AMT = { kind, ids };
  const T = { heal: 'Heal', temp: 'Temporary HP for', dmg: 'Damage' }[kind];
  openModal(`<h3>${T} ${esc(ptyNames(ids))}</h3>
    <div class="row">${fld('Amount, or a roll like 2d4+2', `<input class="f" id="ptyAmt" autofocus placeholder="${kind === 'dmg' ? 'e.g. 7' : 'e.g. 1d8+3'}">`)}${kind === 'dmg' ? fld('Type', `<select class="f" id="ptyType"><option value="">—</option>${(DND.damageTypes || []).map(t => `<option>${esc(String(t).toLowerCase())}</option>`).join('')}</select>`) : ''}</div>
    ${fld('From what (they see this)', `<input class="f" id="ptyWhy" placeholder="${kind === 'heal' ? 'e.g. a potion, first aid' : kind === 'dmg' ? 'e.g. my fireball' : 'e.g. inspiring words'}">`)}
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-pa="amt" data-k="${kind}">${kind === 'heal' ? 'Heal' : kind === 'temp' ? 'Give temp HP' : 'Deal damage'}</button></div>`);
}
function ptyRollAmt(v, label) { v = String(v || '').trim(); if (!v) return null; if (/^\d+$/.test(v)) return { total: N(v), detail: v }; if (!/^[\dd+\-\s*()kh]+$/i.test(v)) return null; return rollExpr(v, { need: true, label }); }
function ptyAmountGo() {
  const a = PTY_AMT; if (!a) return; const why = ($('#ptyWhy').value || '').trim().slice(0, 80), r = ptyRollAmt($('#ptyAmt').value, (a.kind === 'heal' ? 'Healing' : a.kind === 'temp' ? 'Temporary HP' : 'Damage') + (why ? ' (' + why + ')' : ''));
  if (!r || r.skipped || !(r.total > 0)) { if (!r) toast('Type a number or a roll like 2d6+3.'); return; }
  const type = a.kind === 'dmg' ? $('#ptyType').value : ''; PTY_AMT = null; closeModal(true);
  const w = why || S.name || 'an ally';
  if (a.kind === 'heal') ptySend(a.ids, 'heal', { amt: r.total, why: w }, `Healed ${r.total} HP${why ? ' (' + why + ')' : ''}`);
  else if (a.kind === 'temp') ptySend(a.ids, 'temp', { amt: r.total, why: w }, `${r.total} temporary HP${why ? ' (' + why + ')' : ''}`);
  else ptySend(a.ids, 'hit', { dmg: r.total, type, why: w }, `${r.total}${type ? ' ' + type : ''} damage${why ? ' (' + why + ')' : ''}`);
}
// Hand over an item from your inventory (or feed them a potion).
let PTY_GIVE = null, PTY_GQ = '';
function ptyGive(id) {
  if (!id) return ptyPickTargets('Give an item to…', 1, x => ptyGive(x[0]));
  if (PTY_GIVE !== id) PTY_GQ = ''; PTY_GIVE = id;
  const list = S.inventory.map((it, i) => [it, i]).sort((x, y) => (x[0].equipped ? 1 : 0) - (y[0].equipped ? 1 : 0) || String(x[0].name).localeCompare(y[0].name));
  openModal(`<h3>Give ${esc(ptyNm(id))} an item</h3><p class="hint" style="margin:0 0 8px">It leaves your inventory and goes into theirs (equipped items are unequipped; attunement ends).</p>
    ${list.length > 5 ? `<input class="f ptyg-s" type="search" placeholder="Search your inventory…" aria-label="Search your inventory" value="${esc(PTY_GQ)}">` : ''}
    <div class="ptygive">${list.map(([it, i]) => `<div class="ptyg-row" data-gn="${esc(String(it.name || '').toLowerCase())}"><span class="ptyg-n"><b>${esc(it.name)}</b><small>${[N(it.qty) > 1 ? '×' + N(it.qty) : '', it.equipped ? 'equipped' : '', it.attuned ? 'attuned' : '', it.magic ? esc(it.magic.rarity || 'magic') : ''].filter(Boolean).join(' · ')}</small></span>
      ${N(it.qty) > 1 ? `<input class="f sm ptyg-q" type="number" min="1" max="${N(it.qty)}" value="1" data-gq="${i}" aria-label="How many">` : ''}${it.heal ? `<button class="btn sm" data-pa="giveit" data-i="${i}" data-mode="feed" title="Use your action to give them a drink">Feed it</button>` : ''}<button class="btn sm gold" data-pa="giveit" data-i="${i}" data-mode="give">Give</button></div>`).join('') || '<p class="hint">Your inventory is empty.</p>'}</div>
    <p class="hint ptyg-none" hidden>Nothing matches.</p>
    <div class="actions"><button class="btn" data-act="close">Done</button></div>`, null, true);
  const sb = $('#modal-body .ptyg-s'); if (!sb) { PTY_GQ = ''; return; }
  const flt = () => { PTY_GQ = sb.value; const q = sb.value.trim().toLowerCase(); let n = 0;
    $$('#modal-body .ptyg-row').forEach(r => { const h = !!q && !r.dataset.gn.includes(q); r.hidden = h; if (!h) n++; });
    $('#modal-body .ptyg-none').hidden = n > 0; };
  sb.oninput = flt; flt(); if (!matchMedia('(pointer:coarse)').matches) { sb.focus(); sb.setSelectionRange(sb.value.length, sb.value.length); }
}
function ptyGiveGo(i, mode, one) {
  const to = PTY_GIVE, it = S.inventory[i]; if (!to || !it) return;
  if (mode === 'feed') { const r = rollExpr(it.heal, { need: true, label: it.name + ': healing for ' + ptyNm(to) }); if (r.skipped) return;
    it.qty = Math.max(0, N(it.qty) - 1); if (!it.qty) { S.inventory.splice(i, 1); S.attacks = S.attacks.filter(a => a.item !== it.id); }
    pendingLabel = `Feed ${it.name} to ${ptyNm(to)}`; save(); render(); closeModal(true);
    ptySend([to], 'heal', { amt: r.total, why: it.name + ' (from ' + (S.name || 'an ally') + ')' }, `${it.name}: healed ${r.total} HP`); return; }
  const qi = $(`#modal-body [data-gq="${i}"]`), q = Math.max(1, Math.min(N(it.qty) || 1, qi ? N(qi.value) || 1 : N(it.qty) || 1));
  const c = JSON.parse(JSON.stringify(it)); ['equipped', 'attuned', 'bag', 'offhand', 'hbKnown', 'forge'].forEach(k => delete c[k]); c.qty = q;
  if (q >= (N(it.qty) || 1)) { S.inventory.splice(i, 1); S.attacks = S.attacks.filter(a => a.item !== it.id); if ((it.spells || []).length || it.hb) rebuildAuto(); }
  else it.qty = N(it.qty) - q;
  pendingLabel = `Give ${q > 1 ? q + ' × ' : ''}${it.name} to ${ptyNm(to)}`; save(); render();
  ptySend([to], 'item', { item: c }, `Gave ${q > 1 ? q + ' × ' : ''}${it.name}`);
  if (one) closeModal(true); else if (S.inventory.length) ptyGive(to); else closeModal(true);
}
// From an item's ⇄ menu in Inventory: give it to one party member (asks how many when it's a stack).
function ptyGiveTo(i, to) {
  const it = S.inventory[i]; if (!it || !to) return; PTY_GIVE = to;
  if (N(it.qty) <= 1) return ptyGiveGo(i, 'give', true);
  openModal(`<h3>Give ${esc(it.name)} to ${esc(ptyNm(to))}</h3><p class="hint" style="margin:0 0 8px">You have ${N(it.qty)}. It leaves your inventory and goes into theirs.</p>
    ${fld('How many', `<input class="f" type="number" min="1" max="${N(it.qty)}" value="${N(it.qty)}" data-gq="${i}" inputmode="numeric">`)}
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-pa="givetogo" data-i="${i}">Give</button></div>`);
}
// Coins: split between several, or to one.
let PTY_COIN = null;
const PTY_COINS = [['pp', 'Platinum'], ['gp', 'Gold'], ['ep', 'Electrum'], ['sp', 'Silver'], ['cp', 'Copper']];
function ptyCoins(ids) {
  if (!ids.length) return ptyPickTargets('Give coins to…', 99, x => ptyCoins(x));
  PTY_COIN = ids;
  openModal(`<h3>Coins for ${esc(ptyNames(ids))}</h3><p class="hint" style="margin:0 0 8px">${ids.length > 1 ? 'Each of them gets this many.' : 'From your purse to theirs.'}</p>
    <div class="ptycoins">${PTY_COINS.filter(([c]) => c !== 'ep' || ST('electrum') || N(S.currency.ep)).map(([c, t]) => `<label class="fld"><span class="lbl">${t} <small>(you have ${N(S.currency[c])})</small></span><input class="f" type="number" min="0" inputmode="numeric" data-coin="${c}" placeholder="0"></label>`).join('')}</div>
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-pa="coinsgo">Give</button></div>`);
}
function ptyCoinsGo() {
  const ids = PTY_COIN; if (!ids) return; const c = {}; $$('#modal-body [data-coin]').forEach(x => { const v = Math.max(0, Math.floor(N(x.value))); if (v) c[x.dataset.coin] = v; });
  if (!Object.keys(c).length) { toast('Type how many coins.'); return; }
  const short = Object.keys(c).find(k => c[k] * ids.length > N(S.currency[k])); if (short) { toast(`You don’t have that many ${short.toUpperCase()}.`, 'fumble'); return; }
  Object.keys(c).forEach(k => { S.currency[k] = N(S.currency[k]) - c[k] * ids.length; });
  PTY_COIN = null; closeModal(true); pendingLabel = 'Give coins to ' + ptyNames(ids); save(); render();
  ptySend(ids, 'coins', c, 'Gave ' + Object.keys(c).map(k => c[k] + ' ' + k).join(', '));
}
let PTY_NOTE = null;
function ptyNote(ids) { if (!ids.length) return ptyPickTargets('Message who?', 99, x => ptyNote(x)); PTY_NOTE = ids;
  openModal(`<h3>Message ${esc(ptyNames(ids))}</h3>${fld('Message', '<textarea class="f" id="ptyMsg" rows="3" maxlength="500" autofocus></textarea>')}<div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-pa="notego">Send</button></div>`); }
function ptyNoteGo() { const t = ($('#ptyMsg').value || '').trim(); if (!t) return; const ids = PTY_NOTE; PTY_NOTE = null; closeModal(true); ptySend(ids, 'note', { text: t }, 'Message: ' + t.slice(0, 80)); }

// ----- spells on party members -----
// From the Party tab: pick a spell, then the cast window opens with them already ticked.
let PTY_PRESET = null, PTY_CASTMENU = null;
function ptyCastMenu(ids) {
  const list = S.spells.map((sp, i) => [sp, i]).filter(([sp]) => (ALLYFX(sp.name) || ALLYHIT(sp.name) || (spellMath(sp) || {}).dice) && spReady(sp) && !(ALLYFX(sp.name) || {}).selfOnly)
    .sort((x, y) => (ALLYFX(y[0].name) ? 1 : 0) - (ALLYFX(x[0].name) ? 1 : 0) || N(x[0].level) - N(y[0].level) || String(x[0].name).localeCompare(y[0].name));
  PTY_CASTMENU = ids;
  const row = ([sp, i]) => { const d = ALLYFX(sp.name); return `<button class="castopt" data-pa="castit" data-i="${i}"><b>${esc(spLabel(sp))}</b><span>${N(sp.level) ? ORD[N(sp.level) - 1] + ' level' : 'Cantrip'}${d ? '' : ' · harmful'}${sp.summary ? ' · ' + esc(String(sp.summary).slice(0, 70)) : ''}</span></button>`; };
  openModal(`<h3>Cast a spell on ${ids.length ? esc(ptyNames(ids)) : 'party members'}</h3><p class="hint" style="margin:0 0 8px">Your spells that can target someone else. The cast window comes next (slot, upcasting and who it’s on).</p>
    <div class="castopts ptycast">${list.map(row).join('') || '<p class="hint">None of your prepared spells can be cast on someone else.</p>'}</div><div class="actions"><button class="btn" data-act="close">Cancel</button></div>`, null, true);
}
function ptyCastGo(i) { const ids = PTY_CASTMENU || []; closeModal(true); const sp = S.spells[i]; if (!sp) return;
  if (!ALLYFX(sp.name)) { PTY_HITPRE = { ids, at: Date.now() }; return castSpell(i); }
  PTY_PRESET = { ids, self: false, at: Date.now() }; castSpell(i); }
// In the cast window: who it's on (you and/or party members).
function ptyCastPicker(sp, base) {
  const d = ALLYFX(sp.name); if (!d || !ptyAct() || d.selfOnly) return null;
  const ms = ptyMembers(); if (!ms.length) return null;
  const pre = PTY_PRESET && Date.now() - PTY_PRESET.at < 120000 ? PTY_PRESET : null, selfOK = d.self !== false;
  const n = d.n === 'any' ? 0 : (N(d.n) || 1), up = N(d.up);
  const pick = d.pick ? fld(sp.name + ': choose', `<select class="f" id="ptyPick">${d.pick.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join('')}</select>`) : '';
  const forms = d.form ? fld('Their new form', `<select class="f" id="ptyForm"><option value="">— (track it in their Active Spells)</option>${DND.creatures.filter(c => d.form === 'any' || c.tags.includes('beast')).sort((x, y) => y.cr - x.cr || x.name.localeCompare(y.name)).map(c => `<option value="${esc(c.name)}">${esc(c.name)} (CR ${DND.crLabel(c.cr)}, AC ${c.ac}, HP ${c.hp})</option>`).join('')}</select>`) : '';
  return { self: selfOK, html: `<div class="ptypick"><div class="lbl">Who is it on?</div><div class="ptypk">${selfOK ? `<label class="ptychk"><input type="checkbox" id="castSelf"${pre ? (pre.self ? ' checked' : '') : ' checked'}><span><b>You</b></span></label>` : ''}${ms.map(m => `<label class="ptychk"><input type="checkbox" data-ptgt="${esc(m.id)}"${pre && pre.ids.includes(m.id) ? ' checked' : ''}><span><b>${esc(m.name)}</b><small>${N(m.maxhp) ? N(m.hp) + '/' + N(m.maxhp) + ' HP' : ''}${(m.conds || []).length ? ' · ' + esc(m.conds.join(', ')) : ''}</small></span></label>`).join('')}</div>
    <p class="hint">${n ? `Up to ${n} creature${n === 1 ? '' : 's'}${up ? ` (+${up} for each slot level above ${base ? ORD[base - 1] : 'its level'})` : ''}.` : 'Everyone in range.'}${d.note ? ' ' + esc(d.note) : ''}</p>${pick}${forms}</div>` };
}
const ptyPicked = () => $('#modal-body .ptypick') ? $$('#modal-body [data-ptgt]:checked').map(x => x.dataset.ptgt) : null;
// The value of a formula from your sheet: {cha}, {prof}, M (spellcasting modifier), L (slot level), dice are rolled.
function ptyFormula(t, extra) { return String(t || '').replace(/\{([^}]+)\}/g, (m, x) => { const v = evalMax(x, extra); return v == null ? m : String(v); }); }
function ptyEval(expr, ci, L, label, extra) {
  let e = String(expr || ''); if (!e) return null;
  e = e.replace(/\bM\b/g, String(Math.max(0, N(ci && ci.mod)))).replace(/\bL\b/g, String(N(L)));
  e = fxRollExpr(ptyFormula(e, extra));
  if (/d\d/.test(e)) { const r = rollExpr(e, { need: true, label }); return r.skipped ? null : r.total; }
  try { const v = Function('"use strict";return (' + e.replace(/[^\d+\-*/(). ]/g, '') + ')')(); return isFinite(v) ? Math.max(0, Math.floor(v)) : null; } catch (x) { return null; }
}
// After a cast: send it to the party members it was cast on.
let PTY_HITPRE = null, PTY_HIT_ACT = null;
const ptyHitAct = () => { const a = PTY_HIT_ACT; PTY_HIT_ACT = null; return a; };
function ptyAfterCast(sp, a, L, x, c) {
  PTY_HIT_ACT = null; if (!ptyAct()) { PTY_PRESET = null; return null; }
  const d = ALLYFX(sp.name), base = N(sp.level), lines = [];
  if (!d) { // a harmful spell: offer to land it on party members caught in it
    const sm = c.sm || {}, hit = ALLYHIT(sp.name), card = c.card || (c.beamRows && c.beamRows[0]) || null;
    if (!hit && !card && !sm.save) return null;
    const pay = { spell: sp.name, why: (S.name || 'An ally') + '’s ' + sp.name, dmg: card ? N(card.dmg) : 0, type: (card && card.type) || sm.type || '', hit: card && card.hit != null ? N(card.hit) : null, crit: !!(card && card.crit),
      save: hit && hit.noSave ? '' : sm.save ? String(sm.save).toUpperCase().slice(0, 3) : '', dc: c.ci ? N(c.ci.dc) : 0, half: !!sm.half, rounds: hit && hit.rounds != null ? hit.rounds : parseDur(sp.duration) || 0, note: hit && hit.note || '' };
    if (hit && hit.cond) pay.cond = [].concat(hit.cond); if (hit && (hit.buff || hit.mk)) { pay.buff = hit.mk ? hit.mk(x.pick || hit.pick[0][0]) : hit.buff; pay.fxName = sp.name + (hit.label ? ' (' + hit.label(x.pick || hit.pick[0][0]) + ')' : ''); }
    if (hit && hit.pick && !hit.mk) pay.cond = [x.pick || hit.pick[0][0]];
    if (hit && !pay.save && !hit.noSave && c.ci) { const sv = (String((DND.spellIndex[sp.name.toLowerCase()] || {}).summary || sp.summary || '').match(/\b(STR|DEX|CON|INT|WIS|CHA) save/) || [])[1]; if (sv) pay.save = sv; }
    if (pay.cond || pay.buff) pay.src = { c: PTYX().self, n: sp.name };
    const go = ids => { ptySend(ids, 'hit', pay, `${sp.name}: ${pay.hit != null ? 'attack ' + pay.hit : pay.save ? 'DC ' + pay.dc + ' ' + pay.save + ' save' : 'hit'}${pay.dmg ? ', ' + pay.dmg + (pay.type ? ' ' + pay.type : '') : ''}`);
      if ((pay.cond || pay.buff) && sp.conc) S.ptyCasts = (S.ptyCasts || []).filter(z => z.n !== sp.name).concat([{ n: sp.name, to: ids, at: Date.now() }]); };
    const pre = PTY_HITPRE && Date.now() - PTY_HITPRE.at < 120000 ? PTY_HITPRE.ids : null; PTY_HITPRE = null;
    if (pre && pre.length) { setTimeout(() => go(pre), 50); lines.push(`Sent to ${esc(ptyNames(pre))}`); }
    else PTY_HIT_ACT = { label: 'Hit a party member…', fn: () => ptyPickTargets(sp.name + ' — which party members does it hit?', 99, go, { hint: 'They make the save (or check the attack against their AC) on their own sheet.' }) };
    return { lines };
  }
  let ids = x.tgts || (PTY_PRESET && Date.now() - PTY_PRESET.at < 120000 ? PTY_PRESET.ids : []) || []; PTY_PRESET = null;
  const selfOn = d.self !== false && x.self !== false && (x.tgts != null || !ids.length);
  const cap = d.n === 'any' ? 999 : (N(d.n) || 1) + N(d.up) * Math.max(0, L - base);
  if (ids.length + (selfOn ? 1 : 0) > cap) { const keep = Math.max(0, cap - (selfOn ? 1 : 0)); lines.push(`${sp.name} can target ${cap} — sent to the first ${keep}`); ids = ids.slice(0, keep); }
  if (!selfOn && c.eff) { c.eff.ally = true; delete c.eff.item; if (c.eff.maxHp) { S.hp.cur = Math.max(0, N(S.hp.cur) - N(c.eff.maxHp)); delete c.eff.maxHp; } }
  if (!ids.length) return { lines, noSelfHeal: !!d.heal && !selfOn };
  const me = PTYX().self, who = S.name || 'An ally', ci = c.ci || {};
  let rounds = d.rounds != null ? d.rounds : c.rounds != null ? c.rounds : parseDur(sp.duration); if (rounds === 0) rounds = sp.conc ? 10 : 0;
  // the effect each of them gets
  let buff = d.buff ? Object.assign({}, d.buff) : null, label = '';
  if (d.pick) { const v = x.pick || d.pick[0][0]; buff = Object.assign({}, buff || {}, d.mk ? d.mk(v) : {}); label = d.label ? d.label(v) : v; }
  const ub = d.upBuff || a.upBuff; if (ub && buff) Object.keys(ub).forEach(k => { if (L >= N(k)) buff = Object.assign({}, buff, ub[k]); });
  if (d.tempEach && buff) buff.tempN = ptyEval(d.tempEach, ci, L, sp.name);
  ['aura', 'init', 'save'].forEach(k => { if (buff && typeof buff[k] === 'string') buff[k] = N(ptyFormula(buff[k])); });
  let maxHpV = null; if (d.maxHp) maxHpV = c.maxHp != null ? c.maxHp : d.maxHp.roll ? ptyEval(d.maxHp.roll, ci, L, sp.name + ': extra hit points') : N(d.maxHp.base) + N(d.maxHp.up) * Math.max(0, L - base);
  const fxName = sp.name + (label ? ' (' + label + ')' : '');
  const fx = rounds && (buff || maxHpV != null || d.bond || d.wpn) ? { name: fxName, rounds, buff: buff || {}, from: who, src: { c: me, n: sp.name }, maxHp: maxHpV || undefined, bond: d.bond ? me : undefined, wpn: d.wpn || undefined } : null;
  const msgs = [], text = [];
  if (d.heal) { const amt = d.heal === 'max' || c.healAll ? 'max' : d.heal === 'x2' ? 2 * N(c.mainTotal) : c.heal ? N(c.heal.total) : null; if (amt) { msgs.push(['heal', { amt, why: who + '’s ' + sp.name }]); text.push(amt === 'max' ? 'healed to full' : `healed ${amt}`); } }
  if (d.temp) { const t = ptyEval(d.temp, ci, L, sp.name + ': temporary HP'); if (t) { msgs.push(['temp', { amt: t, why: who + '’s ' + sp.name }]); text.push(t + ' temp HP'); } }
  if (d.revive) { msgs.push(['revive', { hp: d.revive, why: who + '’s ' + sp.name }]); text.push(d.revive === 'max' ? 'back with full HP' : 'back with 1 HP'); }
  if (d.stab) { msgs.push(['stabilize', { why: who + '’s ' + sp.name }]); text.push('stabilized'); }
  if (d.rest) { msgs.push(['rest', { kind: d.rest, why: who + '’s ' + sp.name }]); text.push('a short rest'); }
  if (d.cure && d.cure.all) { msgs.push(['cure', { conds: d.cure.all, why: who + '’s ' + sp.name }]); }
  if (d.endFx === 'curse' && sp.name === 'Remove Curse') msgs.push(['cure', { curse: true, why: who + '’s ' + sp.name }]);
  if (d.form) { const fm = $('#ptyForm') ? $('#ptyForm').value : x.form || ''; if (fm) { msgs.push(['form', { cr: fm, name: sp.name, rounds: rounds || null, src: { c: me, n: sp.name }, why: who + '’s ' + sp.name }]); text.push('turned into a ' + fm); } }
  if (fx) { msgs.push(['effect', { fx }]); text.push(fxName + (rounds ? ' for ' + fmtRounds(rounds) : '')); }
  if (!msgs.length && d.note) msgs.push(['note', { text: `${who} cast ${sp.name} on you. ${d.note}` }]);
  (async () => { const grp = {}; for (const [k, v] of msgs) await ptySend(ids, k, v, `${sp.name}${text.length ? ': ' + text.join(', ') : ''}`, true, grp); toast(`<b>${esc(spLabel(sp))}</b> → ${esc(ptyNames(ids))}${text.length ? `<div class="det">${esc(text.join(' · '))}</div>` : ''}`, '', 6000); })();
  // the ones you choose for each of them (Lesser Restoration: which condition…)
  if ((d.cure && d.cure.pick) || d.exh || d.endFx) setTimeout(() => ptyChooseFor(sp.name, d, ids.slice()), 400);
  if (fx || (d.form && msgs.some(m => m[0] === 'form'))) { if (c.eff && (S.effects || []).includes(c.eff)) S.ptyCasts = (S.ptyCasts || []).filter(z => z.n !== sp.name).concat([{ n: sp.name, to: ids, at: Date.now() }]); }
  lines.push(`On ${esc(ptyNames(ids))}${selfOn ? ' and you' : ''}${!selfOn && c.eff && c.eff.buff ? ' — your own stats are unchanged' : ''}`);
  return { lines, noSelfHeal: !!d.heal && !selfOn };
}
// Restoration and dispelling: what to end on each of them, from what their sheet shows.
let PTY_CHOOSE = null;
function ptyChooseFor(spell, d, ids) {
  const id = ids.shift(); if (!id) return; const m = ptyMember(id) || {};
  const opts = [];
  if (d.exh && N(m.exh)) opts.push(['exh', 'One level of exhaustion (' + N(m.exh) + ' now)']);
  ((d.cure && d.cure.pick) || []).forEach(cn => { if ((m.conds || []).includes(cn)) opts.push(['c:' + cn, cn]); });
  if (d.endFx) (m.fx || []).forEach(f => opts.push(['f:' + f, f]));
  if (d.endFx === 'curse') opts.push(['curse', 'Every curse on them']);
  if (!opts.length) { toast(`${esc(spell)}: nothing on ${esc(m.name || 'them')} that it ends${(d.cure && d.cure.pick) ? ' (' + esc(d.cure.pick.join(', ').toLowerCase()) + ')' : ''}.`, '', 6000); return ptyChooseFor(spell, d, ids); }
  PTY_CHOOSE = { spell, d, ids, id };
  openModal(`<h3>${esc(spell)} on ${esc(m.name || 'them')}</h3><p class="hint" style="margin:0 0 8px">What does it end?</p><div class="castopts">${opts.map(([k, t]) => `<button class="castopt" data-pa="choose" data-k="${esc(k)}"><b>${esc(t)}</b></button>`).join('')}</div><div class="actions"><button class="btn" data-act="close">Skip</button></div>`, () => { const p = PTY_CHOOSE; PTY_CHOOSE = null; if (p) setTimeout(() => ptyChooseFor(p.spell, p.d, p.ids), 200); });
}
function ptyChooseGo(b) { const p = PTY_CHOOSE; if (!p) return; PTY_CHOOSE = null; closeModal(true); const k = b.dataset.k, why = (S.name || 'An ally') + '’s ' + p.spell;
  const data = k === 'exh' ? { exh: -1, why } : k === 'curse' ? { curse: true, why } : k.startsWith('c:') ? { conds: [k.slice(2)], why } : { fx: [k.slice(2)], why };
  ptySend([p.id], 'cure', data, `${p.spell}: ended ${k === 'exh' ? 'a level of exhaustion' : k === 'curse' ? 'their curses' : k.slice(2)}`);
  setTimeout(() => ptyChooseFor(p.spell, p.d, p.ids), 300); }
// When a spell you cast on others ends for you (its time runs out, you lose concentration or end it), it ends on them too.
function ptyWatchCasts() {
  if (ptyAct()) PTYX().card(); // others see your HP and conditions change straight away
  if (!(S.ptyCasts || []).length || !ptyAct()) return;
  const live = new Set(fxActive().map(e => e.name)), done = S.ptyCasts.filter(z => !live.has(z.n));
  if (!done.length) return;
  S.ptyCasts = S.ptyCasts.filter(z => live.has(z.n));
  done.forEach(z => z.to.forEach(id => PTYX().send(id, 'end', { n: z.n, why: (S.name || 'The caster') + '’s ' + z.n }).catch(() => {})));
}
// Auras: on for whoever is close enough, until turned off.
function ptyAura(name, id, on, reason) {
  const ab = ptyAbilities().find(a => a.name === name); if (!ab) return;
  S.ptyAuras = Object.assign({}, S.ptyAuras); const cur = new Set(S.ptyAuras[name] || []);
  const me = PTYX().self, fxn = `${name} (${S.name || 'ally'})`;
  if (on) { cur.add(id); const b = JSON.parse(JSON.stringify(ab.def.buff || {})); Object.keys(b).forEach(k => { if (typeof b[k] === 'string' && /\{/.test(b[k])) b[k] = /note/.test(k) ? ptyFormula(b[k]) : N(ptyFormula(b[k])); });
    PTYX().send(id, 'effect', Object.assign({ fx: { name: fxn, rounds: null, buff: b, from: S.name || 'an ally', src: { c: me, n: name, aura: true } }, label: ptyFormula(ab.def.label || ab.def.text || '') }, reason ? { reason } : {})).catch(() => {}); ptyLog('out', ptyNm(id), name + ' on' + (reason ? ' (in range on the map)' : '')); }
  else { cur.delete(id); PTYX().send(id, 'end', Object.assign({ n: name, why: name + ' ended' }, reason ? { reason } : {})).catch(() => {}); ptyLog('out', ptyNm(id), name + ' off' + (reason ? ' (out of range on the map)' : '')); }
  S.ptyAuras[name] = [...cur]; pendingLabel = name + (on ? ' on ' : ' off for ') + ptyNm(id); save();
}
// Auras end for everyone when you drop to 0 HP.
function ptyAurasOff(why) { const A = S.ptyAuras || {}; Object.keys(A).forEach(n => (A[n] || []).forEach(id => PTYX() && PTYX().send(id, 'end', { n, why }).catch(() => {}))); S.ptyAuras = {}; }

// ----- abilities on party members -----
function ptyAbilities() {
  const out = [], seen = new Set();
  const add = (name, def, f, fi) => { if (!def || seen.has(name)) return; seen.add(name); out.push({ name, def, f, fi }); };
  S.features.forEach((f, fi) => { const nm = f.dname || f.name; add(nm, ALLYFEAT(nm) || ALLYFEAT(String(nm).replace(/^Channel Divinity: /, '')), f, fi);
    (fxOf(f).acts || []).forEach(a => add(a.name, ALLYFEAT(a.name), f, fi)); });
  (S.feats || []).forEach(ft => { const nm = typeof ft === 'string' ? ft : ft && ft.name; if (nm) add(nm, ALLYFEAT(nm), null, -1); });
  add('Help', ALLYFEAT('Help'), null, -1); add('Stabilize', ALLYFEAT('Stabilize'), null, -1);
  return out;
}
function ptyAbLeft(ab) {
  const d = ab.def; if (d.pool || d.cost === 'use') return ab.fi >= 0 ? fxLeft(ab.fi) : 0;
  if (d.cost && d.cost.from) { const i = fxSource(d.cost.from); return i >= 0 ? Math.floor(fxLeft(i) / Math.max(1, N(d.cost.n) || 1)) : 0; }
  return 99;
}
let PTY_ABMENU = null;
function ptyAbilityMenu(ids) {
  const list = ptyAbilities().filter(a => a.def.kind !== 'aura'); PTY_ABMENU = { ids, list };
  openModal(`<h3>Use an ability on ${ids.length ? esc(ptyNames(ids)) : 'party members'}</h3><p class="hint" style="margin:0 0 8px">Auras are switched on for each person in the Party tab. Spells are under Cast on.</p>
    <div class="castopts">${list.map((a, j) => { const left = ptyAbLeft(a); return `<button class="castopt" data-pa="abil" data-j="${j}"${left ? '' : ' disabled'}><b>${esc(a.name)}</b><span>${left < 99 ? (a.def.pool ? left + ' left in the pool' : left + ' left') + ' · ' : ''}${esc(ptyFormula(a.def.text || '') || '')}</span></button>`; }).join('')}</div>
    <div class="actions"><button class="btn" data-act="close">Cancel</button></div>`, null, true);
}
function ptyAbilityGo(j) { const m = PTY_ABMENU; if (!m) return; const ab = m.list[j]; closeModal(true); PTY_ABMENU = null; ptyUseAbility(ab, m.ids); }
// Spend it (a use, pool points or another feature's uses) and send what it does.
function ptyUseAbility(ab, ids, spent) {
  if (!ab) return; const inc = ab.col && S.inCombat && ['action', 'bonus', 'reaction'].includes(ab.col) && !spent;
  if (inc && incapCond()) { toast(`You're <b>${incapCond().toLowerCase()}</b> — you can't take actions.`, 'fumble'); return; }
  if (inc && S.turn.used[ab.col]) { toast(`Your ${ab.col === 'bonus' ? 'bonus action' : ab.col} is already used this turn.`, 'fumble'); return; }
  const d = ab.def, nmax = d.n === 'any' ? 99 : d.n ? N(ptyFormula(String(d.n))) || 1 : 1;
  if (!ids || !ids.length) return ptyPickTargets(ab.name + ' — on who?', nmax, x => ptyUseAbility(ab, x, spent));
  if (ids.length > nmax) { toast(`${esc(ab.name)} reaches ${nmax} creature${nmax === 1 ? '' : 's'}.`, 'fumble'); return; }
  if (d.pool && !spent) return ptyPoolAsk(ab, ids);
  const spend = () => { if (spent) return ''; if (d.cost === 'use') { if (ab.fi < 0 || fxLeft(ab.fi) < 1) return `No uses of ${ab.name} left.`; S.features[ab.fi].used = N(S.features[ab.fi].used) + 1; return ''; }
    if (d.cost && d.cost.from && N(d.cost.n) !== 0) return fxSpend(d.cost, ab.f && ab.f.cls); return ''; };
  const who = S.name || 'An ally', why = `${who}’s ${ab.name}`;
  if (d.kind === 'stab') { const sk = S.skills.find(s => s.name === 'Medicine'); const r = d20(`Medicine to stabilize ${ptyNames(ids)} (DC 10)`, sk ? skillVal(sk) : mod('wis'), 'check', 'wis'); if (!r || r.skipped) return;
    if (r.total >= 10) ptySend(ids, 'stabilize', { why: who }, 'Stabilized (Medicine ' + r.total + ')'); else toast(`Medicine ${r.total} — not enough to stabilize (DC 10).`, 'fumble', 6000); return; }
  const err = spend(); if (err) { toast(esc(err), 'fumble'); return; }
  if (inc) S.turn.used[ab.col] = true; // a pool (Lay on Hands…) spends the action once you've said how much
  pendingLabel = 'Use ' + ab.name + ' on ' + ptyNames(ids);
  const extra = ids.length === 1 && ptyMember(ids[0]) ? { tlevel: N(ptyMember(ids[0]).level) } : { tlevel: 1 };
  if (d.kind === 'heal' || d.kind === 'temp') {
    if (d.split) { save(); render(); return ptySplitAsk(ab, ids, N(ptyFormula(d.amount))); }
    const v = ptyEval(d.roll || d.amount, castInfo(), 0, ab.name + (d.kind === 'heal' ? ': healing' : ': temporary HP'), extra); if (!v) { save(); render(); return; }
    save(); render(); ptySend(ids, d.kind, { amt: v, why }, `${ab.name}: ${v}${d.kind === 'heal' ? ' HP' : ' temp HP'}`); return; }
  if (d.kind === 'insp') { const die = d.die ? fxRollExpr(d.die) : '', flat = d.flat ? N(ptyFormula(d.flat)) : 0;
    const fx = { name: `${ab.name} (${die || '+' + flat})`, rounds: d.rounds || 10, buff: { note: ptyFormula(d.text || '') + (flat ? ` (+${flat})` : '') }, from: who, src: { c: PTYX().self, n: ab.name } };
    if (die) fx.repeat = { dice: die, type: ab.name };
    save(); render(); ptySend(ids, 'effect', { fx }, `${ab.name}${die ? ' (' + die + ')' : ''}`); return; }
  if (d.kind === 'fx') { let b = JSON.parse(JSON.stringify(d.buff || {})); const fx = { name: ab.name, rounds: d.rounds || 10, buff: b, from: who, src: { c: PTYX().self, n: ab.name } };
    if (d.die) { const r = rollExpr(fxRollExpr(d.die), { need: true, label: ab.name }); if (r.skipped) return; b.note = (b.note || '') + ` (${r.total})`; }
    if (d.repeat) fx.repeat = d.repeat;
    save(); render(); ptySend(ids, 'effect', { fx }, ab.name); return; }
  if (d.kind === 'cure') { save(); render(); return ptyChooseFor(ab.name, { endFx: d.endFx || 'spell' }, ids.slice()); }
  save(); render();
}
// Lay on Hands, Healing Light…: how much of the pool to spend.
let PTY_POOL = null;
function ptyPoolAsk(ab, ids) {
  const left = ptyAbLeft(ab), d = ab.def; PTY_POOL = { ab, ids };
  openModal(`<h3>${esc(ab.name)} → ${esc(ptyNames(ids))}</h3><p class="hint" style="margin:0 0 8px">${left} ${d.die ? 'dice' : 'points'} left. ${esc(d.text || '')}</p>
    ${fld(d.die ? `How many ${d.die}` : 'Points to spend', `<input class="f" id="ptyPool" type="number" min="1" max="${left}" inputmode="numeric" autofocus>`)}
    <div class="actions"><button class="btn" data-act="close">Cancel</button>${d.cure ? `<button class="btn" id="ptyPoolCure"${left >= N(d.cureCost) ? '' : ' disabled'}>Cure poison or disease (${N(d.cureCost)})</button>` : ''}<button class="btn gold" id="ptyPoolGo">Heal</button></div>`);
  const go = cure => { const p = PTY_POOL; if (!p) return; const f = S.features[p.ab.fi]; let n = cure ? N(d.cureCost) : Math.floor(N($('#ptyPool').value));
    if (!n || n < 1) { toast('Type how many.'); return; } if (n * p.ids.length > fxLeft(p.ab.fi)) { toast('Not enough left in the pool.', 'fumble'); return; }
    let amt = n; if (d.die && !cure) { const r = rollExpr(n + d.die, { need: true, label: p.ab.name }); if (r.skipped) return; amt = r.total; }
    f.used = N(f.used) + n * p.ids.length; if (p.ab.col && S.inCombat && ['action', 'bonus', 'reaction'].includes(p.ab.col)) S.turn.used[p.ab.col] = true; PTY_POOL = null; closeModal(true); pendingLabel = `${p.ab.name} on ${ptyNames(p.ids)}`; save(); render();
    const why = `${S.name || 'An ally'}’s ${p.ab.name}`;
    if (cure) ptySend(p.ids, 'cure', { conds: d.cure, why, note: 'A disease or poison is cured' }, `${p.ab.name}: cured poison/disease`);
    else ptySend(p.ids, 'heal', { amt, why }, `${p.ab.name}: ${amt} HP`); };
  $('#ptyPoolGo').onclick = () => go(false); if ($('#ptyPoolCure')) $('#ptyPoolCure').onclick = () => go(true);
}
// Preserve Life: share a total between several.
function ptySplitAsk(ab, ids, total) {
  openModal(`<h3>${esc(ab.name)}</h3><p class="hint" style="margin:0 0 8px">Share ${total} HP between them (each up to half their max HP).</p>
    ${ids.map(id => { const m = ptyMember(id) || {}; return fld(esc(m.name || 'them') + (N(m.maxhp) ? ` <small>(${N(m.hp)}/${N(m.maxhp)}, up to ${Math.max(0, Math.floor(N(m.maxhp) / 2) - N(m.hp))})</small>` : ''), `<input class="f" type="number" min="0" data-split="${esc(id)}" inputmode="numeric">`); }).join('')}
    <div class="actions"><button class="btn gold" id="ptySplitGo">Heal</button></div>`);
  $('#ptySplitGo').onclick = () => { const v = $$('#modal-body [data-split]').map(x => [x.dataset.split, Math.max(0, Math.floor(N(x.value)))]).filter(([, n]) => n);
    const sum = v.reduce((t, [, n]) => t + n, 0); if (sum > total) { toast(`That’s ${sum} — you have ${total}.`, 'fumble'); return; }
    closeModal(true); v.forEach(([id, n]) => ptySend([id], 'heal', { amt: n, why: `${S.name || 'An ally'}’s ${ab.name}` }, `${ab.name}: ${n} HP`)); };
}
// In the Combat tab, an ability that works on others gets a small "On…" button beside Use: pick who, and it's spent and sent.
const ptyFeatDef = f => { const nm = f.dname || f.name; return ALLYFEAT(nm) || ALLYFEAT(String(nm).replace(/^Channel Divinity: /, '')); };
function ptyFeatBtn(f, fi) {
  if (!ptyAct() || !ptyMembers().length) return ''; const d = ptyFeatDef(f); if (!d || d.kind === 'aura') return '';
  return `<button class="btn sm ptyon" data-pa="featon" data-i="${fi}" title="Use ${esc(f.dname || f.name)} on a party member" aria-label="Use ${esc(f.dname || f.name)} on a party member">${TAB_ICON.party}<span>On…</span></button>`;
}
// After using a feature the usual way (Use & roll): offer it to a party member.
function ptyFeatAct(name, r, f) {
  if (!ptyAct() || !ptyMembers().length) return null;
  const d = ALLYFEAT(name) || ALLYFEAT(String(name).replace(/^Channel Divinity: /, ''));
  if (d && d.kind === 'aura') return null;
  if (d && (d.kind === 'heal' || d.kind === 'temp') && r && !r.skipped) return { label: d.kind === 'heal' ? 'Heal a party member…' : 'Temp HP to a party member…', fn: () => ptyPickTargets(name, d.n === 'any' ? 99 : N(ptyFormula(String(d.n || 1))) || 1, ids => ptySend(ids, d.kind, { amt: r.total, why: `${S.name || 'An ally'}’s ${name}` }, `${name}: ${r.total}${d.kind === 'heal' ? ' HP' : ' temp HP'}`)) };
  if (d && !d.pool) { const ab = { name, def: d, f, fi: S.features.indexOf(f) }; return { label: 'Use it on a party member…', fn: () => ptyUseAbility(ab, null, true) }; }
  if (!d && r && !r.skipped && /heal|regain|hit points/i.test((f && (f.desc || '')) + ' ' + name)) return { label: 'Heal a party member…', fn: () => ptyPickTargets(name, 99, ids => ptySend(ids, 'heal', { amt: r.total, why: `${S.name || 'An ally'}’s ${name}` }, `${name}: ${r.total} HP`)) };
  return null;
}

// ----- what arrives from the party -----
const PTY_IN = [];
window.sheetIncoming = m => { PTY_IN.push(m); ptyInFlush(); };
// Held back only while you're typing, or making or levelling up the character (a window being open is fine).
function ptyBusy() { const a = document.activeElement; return $('#wizard').classList.contains('open') || (typeof LV !== 'undefined' && !!LV) || !!(a && (a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || (a.tagName === 'INPUT' && !/^(checkbox|radio|button|submit|range|color|file)$/i.test(a.type || '')))); }
// Anything another player sends that changes this character waits for you to accept it (no griefing). The DM's
// changes, your own characters', messages, and a spell ending that someone had cast on you go straight through.
const ptyFreeKind = k => ['note', 'end', 'reply'].includes(k);
function ptyTrusted(m) { const P = PTYX(), I = P && P.info(); if (ptyFreeKind(m.kind) && !(m.data && m.data.reason)) return true; if (!m.by) return false;
  if (m.data && m.data.ask) return false; // sent from the party page: always asked, even from the DM
  // only the DM, or this character's own player (their own characters) — not whoever happens to have the sheet open
  return !!I && (m.by === I.dm || (I.mgrs || []).includes(m.by) || m.by === (P.owner && P.owner())); }
function ptyInFlush() { const I = PTYX() && PTYX().info(); if (!S.created || ptyBusy() || !I || I.loading) { clearTimeout(ptyInFlush._t); ptyInFlush._t = setTimeout(ptyInFlush, 800); return; }
  let changed = false, asked = false; while (PTY_IN.length) { const m = PTY_IN.shift(); try {
    // taken back before you answered: it just goes away
    if (m.kind === 'undo' && (S.ptyAsk || []).some(a => a.ref === m.data.ref)) { const a = S.ptyAsk.find(x => x.ref === m.data.ref); S.ptyAsk = S.ptyAsk.filter(x => x !== a); changed = true; toast(`<div><b>${esc(m.fromName || 'Someone')}</b> took back what they sent<div class="det">${esc(ptyDesc(a.m))}</div></div>`, '', 6000); asked = true; continue; }
    if (!ptyTrusted(m)) { if (!(S.ptyAsk || []).some(a => a.ref === m.ref)) { S.ptyAsk = (S.ptyAsk || []).concat([{ ref: m.ref || uid(), at: Date.now(), m }]).slice(-40); changed = asked = true; } continue; }
    const b = PTYX().snap(S); if (ptyApply(m)) { changed = true; ptyGot(m, b); } } catch (e) { console.warn('party message', e); } }
  if (changed) { save(); render(); } if (asked || (S.ptyAsk || []).length) ptyAskShow(); }
// What a message would do, in a few words (for the accept window).
function ptyDesc(m) { const d = m.data || {}, why = d.why && d.why !== m.fromName ? ' (' + d.why + ')' : '';
  switch (m.kind) {
    case 'heal': return (d.amt === 'max' ? 'Heal you to full HP' : `Heal you ${N(d.amt)} HP`) + why;
    case 'temp': return `Give you ${N(d.amt)} temporary HP` + why;
    case 'damage': return `Deal you ${N(d.amt)}${d.type ? ' ' + d.type : ''} damage` + why;
    case 'hit': if (d.saveOnly) return `Ask you to make a ${String(d.save).toUpperCase()} saving throw (DC ${N(d.dc)})${d.why && d.why !== m.fromName && d.why !== 'The DM' ? ' — ' + d.why : ''}`;
    { const bits = [d.dmg ? N(d.dmg) + (d.type ? ' ' + d.type : '') + ' damage' : '', [].concat(d.cond || []).join(', '), d.save ? `${d.save} save, DC ${N(d.dc)}` : d.hit != null ? 'attack roll ' + N(d.hit) : ''].filter(Boolean); if (!d.spell) return `Deal you ${d.dmg ? N(d.dmg) + (d.type ? ' ' + d.type : '') + ' damage' : 'damage'}${bits.filter(x => !/damage$/.test(x)).length ? ' (' + bits.filter(x => !/damage$/.test(x)).join(', ') + ')' : ''}${why}`; return `Hit you with ${d.spell}${bits.length ? ' (' + bits.join(', ') + ')' : ''}`; }
    case 'effect': { const fx = d.fx || {}; if (fx.src && fx.src.aura) return `Give you ${fx.src.n}${d.label ? ' (' + d.label + ')' : ''}`; const t = typeof fxTip === 'function' ? fxTip(fx) : ''; return `Give you ${fx.name || 'an effect'}${t || fx.rounds ? ' (' + [t, fx.rounds ? 'for ' + fmtRounds(fx.rounds) : ''].filter(Boolean).join(', ') + ')' : ''}`; }
    case 'cure': return 'End ' + [].concat(d.conds || [], d.fx || [], d.exh ? [(N(d.exh) > 0 ? 'add' : 'remove') + ' a level of exhaustion'] : [], d.curse ? ['curses'] : []).join(', ') + why;
    case 'cond': { const cs = [].concat(d.conds || (d.cond ? [d.cond] : [])), ex = N(d.exh); return [cs.length ? `give you the ${cs.length > 1 ? cs.slice(0, -1).join(', ') + ' and ' + cs[cs.length - 1] + ' conditions' : cs[0] + ' condition'}${N(d.rounds) ? ' for ' + N(d.rounds) + ' rounds' : ''}` : '', ex ? (ex > 0 ? 'add' : 'remove') + ' a level of exhaustion' : ''].filter(Boolean).join(' and ').replace(/^./, x => x.toUpperCase()) + why; }
    case 'revive': return 'Bring you back' + why; case 'stabilize': return 'Stabilize you' + why;
    case 'rest': return `Ask you to take a ${d.kind === 'long' ? 'long' : 'short'} rest`;
    case 'form': return `Turn you into a ${d.cr}${d.name ? ' (' + d.name + ')' : ''}`;
    case 'item': return `Give you ${N((d.item || {}).qty) > 1 ? N(d.item.qty) + ' × ' : ''}${(d.item || {}).name || 'an item'}`;
    case 'loot': return `Give you ${N(d.qty) > 1 ? N(d.qty) + ' × ' : ''}${d.name || 'an item'}`;
    case 'coins': return 'Give you ' + ['pp', 'gp', 'ep', 'sp', 'cp'].filter(k => N(d[k])).map(k => N(d[k]) + ' ' + k).join(', ');
    case 'inspire': return 'Give you Inspiration';
    case 'end': return `End ${d.n || 'an effect'} on you`;
    case 'undo': { const g = (S.ptyGot || []).find(x => x.ref === d.ref); return 'Take back: ' + (g ? g.text : 'something they sent'); }
  }
  return m.kind; }
// One question at a time, in its own window on top of everything (whatever else you have open stays as it was):
// who, and what they're doing to you. Yes or No.
function ptyAskShow() {
  const A = S.ptyAsk || []; let ov = $('#ptyask-ov');
  if (!A.length || !S.created) { if (ov) ov.remove(); setTimeout(() => ptyMsgShow(), 50); return; }
  if (!ov) { ov = document.createElement('div'); ov.id = 'ptyask-ov'; ov.className = 'ptyask-bg'; document.body.appendChild(ov); }
  const a = A[0], d = ptyDesc(a.m), what = d.charAt(0).toLowerCase() + d.slice(1);
  ov.innerHTML = `<div class="ptyask-m" role="alertdialog" aria-modal="true" aria-labelledby="ptyask-q">
    ${A.length > 1 ? `<div class="ptyask-n">1 of ${A.length}</div>` : ''}
    <p class="ptyask-q" id="ptyask-q"><b>${esc(a.m.fromName || 'Someone')}</b> wants to ${esc(what)}.</p>${a.m.data && a.m.data.reason ? `<p class="ptyask-why">${esc(a.m.data.reason)}</p>` : ''}
    <div class="ptyask-b"><button class="btn" data-pa="askno" data-ref="${esc(a.ref)}">No</button><button class="btn gold" data-pa="askok" data-ref="${esc(a.ref)}">${a.m.kind === 'hit' && a.m.data && a.m.data.save && !a.m.data.dmg && !(a.m.data.cond || []).length ? 'Roll the save' : a.m.kind === 'hit' && a.m.data && a.m.data.save ? 'Yes, roll the save' : 'Yes'}</button></div></div>`;
  const y = ov.querySelector('[data-pa=askok]'); if (y && !matchMedia('(pointer:coarse)').matches) setTimeout(() => y.focus(), 30);
}
function ptyAnswer(ref, ok) {
  const all = S.ptyAsk || [], pick = all.filter(a => a.ref === ref); if (!pick.length) return ptyAskShow();
  S.ptyAsk = all.filter(a => !pick.includes(a));
  pick.forEach(a => { const m = a.m, text = ptyDesc(m);
    if (ok) { try { m.agreed = true; const b = PTYX().snap(S); if (ptyApply(m)) ptyGot(m, b); } catch (e) { if (e instanceof NeedRoll) throw e; console.warn('party message', e); } } // (a roll it needs is fetched, then this runs again)
    else ptyLog('in', m.fromName || '', 'Said no: ' + text);
    if (m.from && PTYX()) PTYX().send(m.from, 'reply', { ok, text, n: S.name || '' }).catch(() => {}); });
  if (!pendingLabel) pendingLabel = ok ? 'Accepted a party change' : 'Turned down a party change';
  save(); render(); ptyAskShow();
}
// anything still waiting when the sheet opens
setTimeout(() => { if ((S.ptyAsk || []).length && S.created) ptyAskShow(); }, 3500);
function ptyGot(m, before, text) { if (!m.ref || m.kind === 'undo') return; const rev = PTYX().diff(before, S); if (!Object.keys(rev).length) return;
  S.ptyGot = (S.ptyGot || []).filter(x => x.ref !== m.ref).concat([{ ref: m.ref, rev, text: text || (S.ptyLog && S.ptyLog[0] && S.ptyLog[0].text) || m.kind }]).slice(-80); }
const PTY_CANCEL = new Set();
// While this sheet was closed: what the party did to it, and items that still need their stats or attacks.
function ptyCatchUp() {
  if (!S.created || !ptyAct()) return; let ch = false;
  (S.inventory || []).forEach((it, i) => { if (!it.ptyNew) return; ch = true; delete it.ptyNew;
    if (it.ptyLoot) { const full = ptyLootItem(it.ptyLoot, it.notes); full.id = it.id; full.qty = it.qty; S.inventory[i] = it = full; }
    if (it.weapon && !S.attacks.some(a => a.item === it.id)) S.attacks.push(attackFromItem(it)); });
  if (ch) rebuildAuto();
  const news = S.ptyNews || []; if (news.length) { S.ptyNews = []; ch = true;
    toast(`<div><b>While you were away</b>${news.slice(-8).map(n => `<div class="det">${esc(n.text)}${n.who ? ' — ' + esc(n.who) : ''}</div>`).join('')}${news.length > 8 ? `<div class="det">…and ${news.length - 8} more (Party tab → Party log)</div>` : ''}</div>`, 'alert', 20000); }
  if (ch) { pendingLabel = 'Party updates'; save(); render(); }
}
setTimeout(ptyCatchUp, 2500); setInterval(ptyCatchUp, 20000);
// Damage after resistances and immunities this sheet knows about.
function ptyResist(n, type) { type = String(type || '').toLowerCase(); if (!type) return [n, '']; const D = defensesDetail(), has = arr => arr.some(x => x.k.includes(type) || /^all damage/.test(x.k));
  if (has(D.immune)) return [0, 'immune']; if (has(D.resist)) return [Math.floor(n / 2), 'resistant']; return [n, '']; }
function ptyApply(m) {
  const d = cleanData(m.data || {}), who = m.fromName || 'Someone', why = d.why || who;
  const note = t => { ptyLog('in', who, t); };
  switch (m.kind) {
    case 'heal': { const before = N(S.hp.cur), amt = d.amt === 'max' ? Math.max(0, maxHp() - before) : N(d.amt); if (!amt && d.amt !== 'max') return false;
      healSelf(amt, `${why}: +${amt} HP`); note(`Healed ${amt} HP (${why})`); toast(`<b class="total">+${amt}</b><div><div>${esc(why)}</div><div class="det">Healed ${amt} HP — now ${N(S.hp.cur)}/${maxHp()}</div></div>`, 'crit', 7000); return true; }
    case 'temp': { const v = N(d.amt), cur = N(S.hp.temp); if (v > cur) S.hp.temp = v; pendingLabel = `${why}: ${v} temp HP`; note(`${v} temporary HP (${why})${v <= cur ? ' — kept your ' + cur : ''}`);
      toast(`<div><b>${esc(why)}</b><div class="det">${v > cur ? v + ' temporary HP' : `${v} temporary HP — you kept your higher ${cur}`}</div></div>`, '', 6000); return true; }
    case 'damage': { const [n, r] = ptyResist(N(d.amt), d.type); takeDamage(n); note(`Took ${n}${d.type ? ' ' + d.type : ''} damage${r ? ' (' + r + ')' : ''} — ${why}`); toast(`<div><b>${esc(why)}</b><div class="det">You take ${n}${d.type ? ' ' + esc(d.type) : ''} damage${r ? ' (' + r + ')' : ''}.</div></div>`, 'fumble', 7000); return true; }
    case 'hit': return ptyHitPrompt(m), false;
    case 'effect': { const fx = Object.assign({}, d.fx || {}); if (!fx.name) return false; fx.from = fx.from || who; delete fx.conc;
      if (fx.wpn) { const at = S.attacks.find(a => a.item && S.inventory.some(it => it.id === a.item && it.equipped && it.weapon)) || S.attacks.find(a => a.item); if (at) fx.item = at.item; delete fx.wpn; }
      const old = (S.effects || []).find(e => e.name === fx.name); if (old && old.maxHp) S.hp.cur = Math.max(0, N(S.hp.cur) - N(old.maxHp));
      S.effects = (S.effects || []).filter(e => e.name !== fx.name).concat([fx]); if (fx.maxHp) S.hp.cur = N(S.hp.cur) + N(fx.maxHp);
      if (fx.buff && fx.buff.tempN && N(fx.buff.tempN) > N(S.hp.temp)) S.hp.temp = N(fx.buff.tempN);
      pendingLabel = `${fx.name} from ${who}`; const tip = fxTip(fx); note(`${fx.name}${fx.rounds ? ' for ' + fmtRounds(fx.rounds) : ''}`);
      toast(`<div><b>${esc(fx.name)}</b> from ${esc(who)}<div class="det">${esc(tip || (fx.buff && fx.buff.note) || '')}${fx.rounds ? ' · ' + esc(fmtRounds(fx.rounds)) : ''}${fx.maxHp ? ' · +' + N(fx.maxHp) + ' max HP' : ''}${fx.item ? ' · ' + esc((S.attacks.find(a => a.item === fx.item) || {}).name || 'your weapon') : ''}</div></div>`, '', 8000); return true; }
    case 'end': { const gone = (S.effects || []).filter(e => e.src && e.src.c === m.from && e.src.n === d.n); if (!gone.length) return false;
      gone.forEach(e => { if (e.maxHp) S.hp.cur = Math.min(N(S.hp.cur), maxHp() - N(e.maxHp)); });
      S.effects = S.effects.filter(e => !gone.includes(e)); if (S.form && gone.some(e => e.name === S.form.effect)) S.form = null;
      (d.conds || []).forEach(c => { S.conditions = S.conditions.filter(x => x !== c); });
      gone.forEach(e => (e.conds || []).forEach(c => { S.conditions = S.conditions.filter(x => x !== c); }));
      pendingLabel = `${d.n} ended`; note(`${d.n} ended`); toast(`⏳ <b>${esc(gone.map(e => e.name).join(', '))}</b> ended${d.why ? ' (' + esc(d.why) + ')' : ''}.`, 'alert', 6000); return true; }
    case 'cure': { const done = [];
      (d.conds || []).forEach(c => { if (S.conditions.includes(c)) { S.conditions = S.conditions.filter(x => x !== c); if (S.condTurns) delete S.condTurns[c]; done.push(c); } });
      if (d.exh) { const b = N(S.exhaustion); S.exhaustion = Math.max(0, Math.min(6, b + N(d.exh))); if (b !== S.exhaustion) done.push(`exhaustion ${b} → ${S.exhaustion}`); }
      if (d.curse) { const c0 = (S.effects || []).filter(e => (e.buff && e.buff.curse) || /curse|hex/i.test(e.name)); S.effects = S.effects.filter(e => !c0.includes(e)); c0.forEach(e => done.push(e.name)); }
      (d.fx || []).forEach(n => { const e = (S.effects || []).find(x => x.name === n); if (e) { if (e.maxHp) S.hp.cur = Math.min(N(S.hp.cur), maxHp() - N(e.maxHp)); S.effects = S.effects.filter(x => x !== e); done.push(n); } });
      if (d.note) done.push(d.note);
      // a harmful spell whose conditions are all gone is over for you
      S.effects = (S.effects || []).filter(e => !(e.conds && e.conds.length && !e.conds.some(c => S.conditions.includes(c))));
      if (!done.length) return false; pendingLabel = `${why}: ${done.join(', ')}`; note(`Ended ${done.join(', ')} (${why})`); toast(`<div><b>${esc(why)}</b><div class="det">Ended: ${esc(done.join(', '))}</div></div>`, 'crit', 7000); return true; }
    case 'cond': { const cs = [].concat(d.conds || (d.cond ? [d.cond] : [])); if (!cs.length && !N(d.exh)) return false;
      cs.forEach(c => { if (!S.conditions.includes(c)) S.conditions.push(c); if (N(d.rounds)) { S.condTurns = S.condTurns || {}; S.condTurns[c] = N(d.rounds); } });
      const done = cs.slice(); if (N(d.exh)) { const b = N(S.exhaustion); S.exhaustion = Math.max(0, Math.min(6, b + N(d.exh))); if (b !== S.exhaustion) done.push('exhaustion ' + b + ' → ' + S.exhaustion); }
      pendingLabel = `${done.join(', ')} (${why})`; note(`${done.join(', ')}${N(d.rounds) ? ' for ' + N(d.rounds) + ' rounds' : ''} — ${why}`); toast(`<div><b>${esc(done.join(', '))}</b><div class="det">${esc(why)}${N(d.rounds) ? ' · ' + N(d.rounds) + ' rounds' : ''}</div></div>`, 'fumble', 8000); return true; }
    case 'revive': { const hp = d.hp === 'max' ? maxHp() : Math.max(1, N(d.hp)); S.hp.cur = Math.max(N(S.hp.cur), hp); S.death = { s: 0, f: 0 }; S.conditions = S.conditions.filter(c => c !== 'Unconscious');
      pendingLabel = `${why}: back on your feet`; note(`Brought back with ${S.hp.cur} HP (${why})`); toast(`<div><b>${esc(why)}</b><div class="det">You’re back — ${S.hp.cur} HP.</div></div>`, 'crit', 9000); return true; }
    case 'stabilize': { if (N(S.hp.cur) > 0) return false; S.death = { s: 3, f: Math.min(2, N(S.death.f)) }; pendingLabel = 'Stabilized'; note(`Stabilized (${why})`); toast(`<div><b>Stabilized</b><div class="det">${esc(why)} — no more death saves; you wake with 1 HP after 1d4 hours.</div></div>`, 'crit', 8000); return true; }
    case 'rest': { note(`${why}: ${d.kind === 'long' ? 'a long' : 'a short'} rest`); toast(`<div><b>${esc(why)}</b><div class="det">${d.kind === 'long' ? 'Time for a long rest.' : 'Time for a short rest.'}</div></div>`, 'alert', 30000, { label: d.kind === 'long' ? 'Take a long rest' : 'Take a short rest', fn: () => d.kind === 'long' ? longRest() : shortRest() }); return true; }
    case 'form': { const cr = DND.creatures.find(c => c.name === d.cr); if (!cr) return false; const name = d.name || 'Polymorph';
      S.effects = (S.effects || []).filter(e => e.name !== name).concat([{ name, rounds: d.rounds || null, from: who, src: d.src, buff: {} }]); setForm(cr, who, name, true);
      pendingLabel = `${name}: ${cr.name}`; note(`Turned into a ${cr.name} (${why})`); toast(`<div><b>You become a ${esc(cr.name)}</b><div class="det">${esc(why)} · AC ${cr.ac}, ${cr.hp} HP</div></div>`, 'alert', 9000); return true; }
    case 'item': { const it = Object.assign({}, d.item || {}); if (!it.name) return false; it.id = uid(); it.equipped = false; ptyAddItem(it); note(`Received ${N(it.qty) > 1 ? N(it.qty) + ' × ' : ''}${it.name}`);
      toast(`<div><b>${esc(who)}</b> gave you <b>${N(it.qty) > 1 ? N(it.qty) + ' × ' : ''}${esc(it.name)}</b><div class="det">It’s in your pack.</div></div>`, 'crit', 8000); return true; }
    case 'loot': { const it = ptyLootItem(d.name, d.notes); it.qty = Math.max(1, N(d.qty) || 1); ptyAddItem(it); note(`Received ${it.qty > 1 ? it.qty + ' × ' : ''}${it.name} from ${who}`);
      toast(`<div><b>${esc(who)}</b> gave you <b>${it.qty > 1 ? it.qty + ' × ' : ''}${esc(it.name)}</b><div class="det">It’s in your pack.</div></div>`, 'crit', 8000); return true; }
    case 'coins': { const got = []; ['cp', 'sp', 'ep', 'gp', 'pp'].forEach(k => { const v = Math.max(0, N(d[k])); if (v) { S.currency[k] = N(S.currency[k]) + v; got.push(v + ' ' + k); } }); if (!got.length) return false;
      pendingLabel = 'Coins from ' + who; note('Received ' + got.join(', ')); toast(`<div><b>${esc(who)}</b> gave you <b>${esc(got.join(', '))}</b></div>`, 'crit', 7000); return true; }
    case 'inspire': { S.insp = Math.min(inspMax(), Math.max(0, N(S.insp)) + 1); pendingLabel = 'Inspiration from ' + who; note('Inspiration'); toast(`<div><b>Inspiration!</b><div class="det">From ${esc(who)}${ST('inspiration') ? '' : ' (turn on Inspiration in Settings → Rules to see it on the sheet)'}</div></div>`, 'crit', 8000); return true; }
    case 'reply': { if (!d.ok && m.from && S.ptyAuras) Object.keys(S.ptyAuras).forEach(n => { if (String(d.text || '').includes(n)) { S.ptyAuras[n] = (S.ptyAuras[n] || []).filter(x => x !== m.from); R20A.no[n + '|' + m.from] = true; } });
      note(`${d.ok ? 'They said yes' : 'They said no'}: ${d.text || ''}`); toast(`<div><b>${esc(d.n || who)}</b> ${d.ok ? 'said yes' : 'said no'}<div class="det">${esc(d.text || '')}</div></div>`, d.ok ? '' : 'alert', 6000); return true; }
    case 'note': { note(String(d.text || '')); ptyMsgShow(who, String(d.text || '')); return true; }
    case 'undo': { const g = (S.ptyGot || []).find(x => x.ref === d.ref); if (!g) { PTY_CANCEL.add(d.ref); return false; }
      PTYX().revert(S, g.rev); S.ptyGot = S.ptyGot.filter(x => x !== g); S.hp.cur = Math.min(N(S.hp.cur), maxHp()); pendingLabel = `${who} took back: ${g.text}`; note(`Took back: ${g.text}`);
      toast(`<div><b>${esc(who)}</b> took back what they sent<div class="det">${esc(g.text)}</div></div>`, 'alert', 7000); return true; }
  }
  return false;
}
function ptyAddItem(it) {
  const same = !it.weapon && !it.armor && !it.magic && !it.charges && !it.hb && S.inventory.find(x => !x.equipped && !x.bag && x.name === it.name && !x.weapon && !x.armor && !x.magic && !x.charges && !x.hb);
  if (same) same.qty = N(same.qty) + (N(it.qty) || 1); else addInventoryItem(it, true);
  if ((it.spells || []).length || it.hb) rebuildAuto();
  pendingLabel = 'Received ' + it.name;
}
// An item the DM names from the lists comes with its stats; anything else is a custom item.
function ptyLootItem(name, notes) {
  const n = String(name || '').trim(), lc = n.toLowerCase(), by = l => (l || []).find(x => String(x[0]).toLowerCase() === lc);
  let it = null; const w = by(DND.weapons), a = by(DND.armor), g = by(DND.gear), m = by(DND.magic);
  if (w) it = makeWeaponItem(w); else if (a) it = makeArmorItem(a); else if (m) it = makeMagicItem(m); else if (g) it = makeGearItem(g);
  else it = { id: uid(), name: n || 'Item', qty: 1, weight: 0, equipped: false, notes: '' };
  if (notes) it.notes = (it.notes ? it.notes + ' · ' : '') + notes;
  return it;
}
// A harmful spell or the DM's damage: the save or attack is settled here, on the sheet that's hit.
function ptyHitPrompt(m) {
  const d = m.data || {}, who = m.fromName || 'Someone', why = d.why || who, ab = String(d.save || '').toLowerCase().slice(0, 3);
  const land = (full, saved, tot) => { if (m.ref && PTY_CANCEL.has(m.ref)) { toast(`${esc(who)} took that back.`); return; } const before = PTYX().snap(S); let n = full ? N(d.dmg) : 0; if (saved && d.half) n = Math.floor(N(d.dmg) / 2); else if (saved) n = 0;
    const [dmg, r] = ptyResist(n, d.type), done = [];
    if (dmg > 0) { takeDamage(dmg); done.push(`${dmg}${d.type ? ' ' + d.type : ''} damage${r ? ' (' + r + ')' : ''}`); }
    if (!saved && full) { [].concat(d.cond || []).forEach(c => { if (!S.conditions.includes(c)) S.conditions.push(c); if (N(d.rounds)) { S.condTurns = S.condTurns || {}; S.condTurns[c] = Math.min(N(d.rounds), 10); } done.push(c); });
      if (d.buff) { const nm = d.fxName || d.spell || 'Curse'; S.effects = (S.effects || []).filter(e => e.name !== nm).concat([{ name: nm, rounds: N(d.rounds) || 10, buff: d.buff, from: 'enemy', src: d.src }]); done.push(nm); }
      if (d.src && (d.cond || []).length) { const e = { name: d.spell, rounds: N(d.rounds) || 10, buff: {}, from: who, src: d.src, conds: [].concat(d.cond) }; S.effects = (S.effects || []).filter(x => x.name !== e.name).concat([e]); } }
    pendingLabel = why + (done.length ? ': ' + done.join(', ') : '');
    if (!d.saveOnly) ptyLog('in', who, `${why}: ${done.length ? done.join(', ') : saved ? 'saved, no effect' : 'missed'}`); ptyGot(m, before, `${why}: ${done.join(', ')}`); save(); render();
    if (d.saveOnly) { const ok = !!saved; ptyLog('in', who, `${String(d.save).toUpperCase()} save DC ${N(d.dc)}: ${ok ? 'made it' : 'failed'}${tot != null ? ' (' + tot + ')' : ''}`);
      return toast(`${tot != null ? `<b class="total">${tot}</b>` : ''}<div><b>${ok ? 'You made it!' : 'You failed the save.'}</b><div class="det">${String(d.save).toUpperCase()} save, DC ${N(d.dc)}${why && why !== 'The DM' ? ' — ' + esc(why) : ''}</div></div>`, ok ? 'crit' : 'fumble', 9000); }
    toast(`<div><b>${esc(why)}</b><div class="det">${done.length ? esc(done.join(' · ')) : saved ? 'You saved — no effect.' : 'No effect.'}</div></div>`, done.length ? 'fumble' : 'crit', 7000); };
  const desc = `${N(d.dmg) ? `${N(d.dmg)}${d.type ? ' ' + esc(d.type) : ''} damage` : ''}${(d.cond || []).length ? (N(d.dmg) ? ' and ' : '') + esc([].concat(d.cond).join(', ')) : ''}${d.buff ? (N(d.dmg) || (d.cond || []).length ? ' and ' : '') + esc(d.fxName || d.spell || 'a curse') : ''}${d.note ? ' — ' + esc(d.note) : ''}`;
  let acts, head;
  // already said yes in the window: an attack lands or misses by your AC, a save is rolled straight away
  if (m.agreed && d.hit != null) { const ac = acTotal(); return land(!!(d.crit || N(d.hit) >= ac), false); }
  if (m.agreed && ab && AB.includes(ab)) { const r = d20(`${why}: DC ${N(d.dc)} ${ab.toUpperCase()} save`, saveVal(ab), 'save', ab); if (r && !r.skipped) return land(true, r.total >= N(d.dc), r.total); }
  if (d.hit != null) { const ac = acTotal(), hits = d.crit || N(d.hit) >= ac; head = `${d.crit ? 'Critical hit' : 'Attack ' + N(d.hit)} vs your AC ${ac}${hits ? ' — it hits' : ' — it misses'}`;
    acts = [{ label: hits ? 'Take it' : 'It hits anyway', fn: () => land(true, false) }, { label: hits ? 'It missed' : 'OK', fn: () => land(false, false) }]; }
  else if (ab && AB.includes(ab)) { head = `DC ${N(d.dc)} ${ab.toUpperCase()} save${d.half ? ' (half on a success)' : ''}`;
    acts = [{ label: `Roll ${ab.toUpperCase()} save`, fn: () => { const r = d20(`${why}: DC ${N(d.dc)} ${ab.toUpperCase()} save`, saveVal(ab), 'save', ab); if (!r || r.skipped) { setTimeout(() => ptyHitPrompt(m), 50); return; } land(true, r.total >= N(d.dc), r.total); } },
      { label: 'I failed', fn: () => land(true, false) }, { label: 'I saved', fn: () => land(true, true) }]; }
  else { if (m.agreed) return land(true, false); // you already said yes to it
    head = 'No save'; acts = [{ label: 'Take it', fn: () => land(true, false) }, { label: 'Ignore', fn: () => land(false, false) }]; }
  toast(`<div><b>${esc(why)}</b><div class="det">${esc(head)}</div>${desc ? `<div class="det">${desc}</div>` : ''}</div>`, 'alert', 120000, acts);
}
// Warding Bond: the damage you take is also taken by the caster.
function ptyBondDamage(amt) { if (!ptyAct()) return; (S.effects || []).filter(e => e.bond && (e.rounds == null || N(e.rounds) > 0)).forEach(e => PTYX().send(e.bond, 'damage', { amt, why: `Warding Bond with ${S.name || 'an ally'}` }).catch(() => {})); }
// Death Ward: the first drop to 0 HP is 1 HP instead.
function ptyDeathWard() { const e = (S.effects || []).find(x => x.buff && x.buff.deathWard); if (!e) return false; S.effects = S.effects.filter(x => x !== e); setTimeout(() => toast(`<b>Death Ward</b> — you drop to 1 HP instead of 0. It’s used up.`, 'crit', 8000), 80); return true; }


// ----- Auras that follow Roll20 tokens (Settings → Dice, needs the companion extension) -----
// Every few seconds the map is read: your token and your party's, matched by name to the characters. Anyone who comes
// within one of your auras is offered it (with how far apart you are); anyone who leaves it is asked to drop it.
const R20A = { busy: false, want: {}, seen: {}, sent: {}, no: {}, status: '' };
const r20AuraOK = () => !!(R20.ok && (R20.caps || []).includes('tokens'));
const r20AuraOn = () => !!(ST('r20auras') && r20AuraOK() && ptyAct() && !isMobile());
// How far an aura reaches, in feet.
function ptyAuraReach(name) {
  const pal = clsLv('paladin'), big = pal >= 18;
  if (/Alacrity/.test(name)) return big ? 10 : 5;
  if (/Aura of (Protection|Courage|Devotion|Warding|Hate|the Sentinel|the Guardian|Conquest)/i.test(name)) return big ? 30 : 10;
  const d = ALLYFEAT(name) || {}; return N(d.reach) || 10;
}
// Feet between two tokens, edge to edge, the way the map measures (adjacent = 5 ft).
function r20Dist(a, b, map) {
  const g = map.grid || 70, gap = (d, sa, sb) => Math.max(0, Math.abs(d) - (sa + sb) / 2 + g) / g;
  const sx = Math.round(gap(a.x - b.x, a.w, b.w) * 100) / 100, sy = Math.round(gap(a.y - b.y, a.h, b.h) * 100) / 100;
  const X = Math.round(sx), Y = Math.round(sy);
  const sq = map.diag === 'pythagorean' ? Math.round(Math.hypot(sx, sy)) : map.diag === 'threefive' ? Math.max(X, Y) + Math.floor(Math.min(X, Y) / 2) : map.diag === 'manhattan' ? X + Y : Math.max(X, Y);
  return sq * (map.scale || 5);
}
const r20Tok = (map, nm) => { const k = String(nm || '').trim().toLowerCase(); if (!k) return null; return map.tokens.find(t => String(t.cname).trim().toLowerCase() === k) || map.tokens.find(t => String(t.name).trim().toLowerCase() === k) || null; };
async function r20AuraTick() {
  if (R20A.busy || !r20AuraOn() || !S.created || N(S.hp.cur) <= 0) return;
  const auras = ptyAbilities().filter(a => a.def.kind === 'aura'); if (!auras.length) return;
  R20A.busy = true; let map;
  try { map = await r20Send({ type: 'tokens', campaign: ST('r20campaign') || '' }, 6000); } catch (e) { R20A.status = 'Roll20: ' + e.message; R20A.busy = false; if (UI.tab === 'party') render('party'); return; }
  R20A.busy = false;
  const me = r20Tok(map, S.name), was = R20A.status;
  if (!me) { R20A.status = `No token named “${S.name}” on the Roll20 page “${map.page}” — auras aren’t changed until there is one.`; if (was !== R20A.status && UI.tab === 'party') render('party'); return; }
  const ms = ptyMembers(), found = ms.filter(m => r20Tok(map, m.name));
  R20A.status = `Following the tokens on “${map.page}”: ${found.length ? found.map(m => m.name).join(', ') : 'no party members’ tokens found yet'}.`;
  auras.forEach(a => { const reach = ptyAuraReach(a.name), on = new Set((S.ptyAuras || {})[a.name] || []);
    ms.forEach(m => { const t = r20Tok(map, m.name); if (!t) return; // not on the map: leave it as it is
      const ft = r20Dist(me, t, map), inR = ft <= reach, k = a.name + '|' + m.id;
      // wait until it's been that way for two looks in a row (not while a token is being dragged across)
      if (R20A.seen[k] !== inR) { R20A.seen[k] = inR; return; }
      if (!inR) delete R20A.no[k];
      if (inR === on.has(m.id) || R20A.no[k]) return;
      if (R20A.sent[k] && Date.now() - R20A.sent[k] < 15000) return; R20A.sent[k] = Date.now();
      const why = inR ? `On the Roll20 map, ${m.name} is ${ft} ft from ${S.name || 'you'} — ${a.name} reaches ${reach} ft.` : `On the Roll20 map, ${m.name} is now ${ft} ft from ${S.name || 'you'} — out of ${a.name}’s ${reach} ft.`;
      ptyAura(a.name, m.id, inR, why); save(); }); });
  if (was !== R20A.status && UI.tab === 'party') render('party');
}
setInterval(r20AuraTick, 3000);


// ----- messages from the DM or another player: their own window, bigger than a question, like a note handed over -----
const PTY_MSGQ = [];
function ptyMsgShow(who, text) { if (who != null) PTY_MSGQ.push({ who, text, at: Date.now() });
  if (!PTY_MSGQ.length || $('#ptymsg-ov') || $('#ptyask-ov')) return; // after any question that's waiting
  const m = PTY_MSGQ[0], ov = document.createElement('div'); ov.id = 'ptymsg-ov'; ov.className = 'ptyask-bg ptymsg-bg';
  ov.innerHTML = `<div class="ptymsg-m" role="alertdialog" aria-modal="true" aria-labelledby="ptymsg-h"><div class="ptymsg-top"><span class="ptymsg-ic" aria-hidden="true">✉</span><div><small>Message from</small><b id="ptymsg-h">${esc(m.who)}</b></div>${PTY_MSGQ.length > 1 ? `<span class="ptymsg-n">1 of ${PTY_MSGQ.length}</span>` : ''}</div>
    <div class="ptymsg-t">${esc(m.text).replace(/\n/g, '<br>')}</div><div class="ptymsg-b"><button class="btn gold" id="ptymsg-ok">${PTY_MSGQ.length > 1 ? 'Next' : 'OK'}</button></div></div>`;
  document.body.appendChild(ov); const ok = ov.querySelector('#ptymsg-ok'); ok.onclick = () => { PTY_MSGQ.shift(); ov.remove(); ptyMsgShow(); };
  if (!matchMedia('(pointer:coarse)').matches) setTimeout(() => ok.focus(), 30); }


// ----- party chat (players only; the DM can't see it) -----
function ptyChatList() { const ch = PTYX() && PTYX().chat; const L = ch ? ch.list().slice(-80) : [];
  if (!L.length) return '<p class="hint" style="margin:0">No messages yet.</p>';
  return L.map(m => `<div class="ptyc${ch.mine(m) ? ' me' : ''}"><span class="ptyc-n">${esc(ch.mine(m) ? 'You' : m.n || 'Someone')}<small>${new Date(m.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small></span><span class="ptyc-t">${esc(m.t)}</span></div>`).join(''); }
window.onPartyChatList = () => { const l = $('#ptychat-l'); if (!l) { if (UI.tab === 'party') render('party'); return; } const end = l.scrollHeight - l.scrollTop - l.clientHeight < 40; l.innerHTML = ptyChatList(); if (end) l.scrollTop = l.scrollHeight; };
// New party chat messages: a note in the corner (unless the chat is on screen) and a count on the Party tab until it's opened.
let PTY_UNREAD = 0;
function ptyUnreadMark() { const t = document.querySelector('.tab[data-tab="party"]'); if (!t) return; if (UI.tab === 'party' && !document.hidden) PTY_UNREAD = 0; t.classList.toggle('unread', PTY_UNREAD > 0); if (PTY_UNREAD > 0) t.dataset.unread = PTY_UNREAD > 9 ? '9+' : PTY_UNREAD; else delete t.dataset.unread; }
setInterval(ptyUnreadMark, 1500); document.addEventListener('visibilitychange', ptyUnreadMark);
window.onPartyChat = m => { const here = UI.tab === 'party' && !document.hidden && $('#ptychat-l'); if (here) return; PTY_UNREAD++; ptyUnreadMark();
  toast(`<div><b>${esc(m.n || 'Someone')}</b> <span class="det" style="display:inline">· party chat</span><div class="det">${esc(String(m.t || '').slice(0, 200))}</div></div>`, '', 7000, { label: 'Reply', fn: () => { UI.tab = 'party'; saveUI && saveUI(); render(); setTimeout(() => { const i = $('#ptychat-in'); if (i) i.focus(); }, 80); } }); };


// ----- Dice roller: a little window like Roll20's — tap dice to build a roll, add a modifier, roll -----
// Rolls go through the sheet's dice (so with "Roll20 rolls for me" they're rolled in your game) and land in the Log.
const DR_DICE = [4, 6, 8, 10, 12, 20, 100];
let DR = null;
function drExpr() { const parts = DR_DICE.filter(d => DR.pool[d]).map(d => d === 20 && DR.adv !== 'n' && DR.pool[d] === 1 ? `2d20${DR.adv === 'a' ? 'kh1' : 'kl1'}` : `${DR.pool[d]}d${d}`);
  const m = N(DR.mod); return parts.length ? parts.join('+') + (m ? (m > 0 ? '+' : '') + m : '') : ''; }
function diceRoller() {
  let w = $('#drwin'); if (w) { w.remove(); return; }
  DR = DR || (() => { let o = null; try { o = JSON.parse(localStorage.getItem('dnd-dr') || 'null'); } catch (e) {} return { pool: {}, mod: 0, adv: 'n', x: o && o.x, y: o && o.y, last: (o && o.last) || [] }; })();
  w = document.createElement('div'); w.id = 'drwin'; w.className = 'drwin'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Dice roller');
  document.body.appendChild(w); drPaint();
  const W = innerWidth, H = innerHeight, r = w.getBoundingClientRect();
  const x = DR.x != null ? Math.min(Math.max(6, DR.x), W - r.width - 6) : W - r.width - 24, y = DR.y != null ? Math.min(Math.max(6, DR.y), H - 60) : Math.max(70, H - r.height - 90);
  w.style.left = x + 'px'; w.style.top = y + 'px';
  // drag by the title bar
  // on a phone it's a sheet along the bottom: swipe its top bar down to close it
  w.addEventListener('pointerdown', e => { const hd = e.target.closest('.dr-head'); if (!hd || e.target.closest('button')) return; e.preventDefault();
    if (isMobile()) { const y0 = e.clientY; hd.setPointerCapture(e.pointerId); const mv = ev => { w.style.transform = `translateY(${Math.max(0, ev.clientY - y0)}px)`; };
      const up = ev => { hd.removeEventListener('pointermove', mv); hd.removeEventListener('pointerup', up); if (ev.clientY - y0 > 70) w.remove(); else w.style.transform = ''; };
      hd.addEventListener('pointermove', mv); hd.addEventListener('pointerup', up); return; }
    const b = w.getBoundingClientRect(), dx = e.clientX - b.left, dy = e.clientY - b.top; hd.setPointerCapture(e.pointerId); w.classList.add('drag');
    const mv = ev => { const nx = Math.min(Math.max(0, ev.clientX - dx), innerWidth - b.width), ny = Math.min(Math.max(0, ev.clientY - dy), innerHeight - 40); w.style.left = nx + 'px'; w.style.top = ny + 'px'; };
    const up = () => { w.classList.remove('drag'); hd.removeEventListener('pointermove', mv); hd.removeEventListener('pointerup', up); const bb = w.getBoundingClientRect(); DR.x = bb.left; DR.y = bb.top; drKeep(); };
    hd.addEventListener('pointermove', mv); hd.addEventListener('pointerup', up); });
  w.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const k = b.dataset.dr;
    if (k === 'x') return w.remove();
    if (k === 'die') { const d = N(b.dataset.d); DR.pool[d] = Math.min(99, N(DR.pool[d]) + 1); }
    if (k === 'mod') DR.mod = N(DR.mod) + N(b.dataset.v);
    if (k === 'adv') DR.adv = b.dataset.v;
    if (k === 'clear') { DR.pool = {}; DR.mod = 0; DR.adv = 'n'; }
    if (k === 'again') { const L = DR.last[N(b.dataset.i)]; if (L) return drRoll(L); }
    if (k === 'roll') { const ex = ($('#dr-f') || {}).value || drExpr(); return drRoll(ex); }
    drPaint(); });
  // right-click (or long-press) a die to take one away
  // press and hold a die (phones) to take one away
  let holdT = null, held = false; w.addEventListener('pointerdown', e => { const b = e.target.closest('[data-dr=die]'); if (!b || e.pointerType === 'mouse') return; held = false; clearTimeout(holdT);
    holdT = setTimeout(() => { held = true; const d = N(b.dataset.d); DR.pool[d] = Math.max(0, N(DR.pool[d]) - 1); if (!DR.pool[d]) delete DR.pool[d]; if (navigator.vibrate) navigator.vibrate(15); drPaint(); }, 450); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => w.addEventListener(t, () => clearTimeout(holdT)));
  w.addEventListener('click', e => { if (held && e.target.closest('[data-dr=die]')) { held = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  w.addEventListener('contextmenu', e => { const b = e.target.closest('[data-dr=die]'); if (!b) return; e.preventDefault(); const d = N(b.dataset.d); DR.pool[d] = Math.max(0, N(DR.pool[d]) - 1); if (!DR.pool[d]) delete DR.pool[d]; drPaint(); });
  w.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'dr-f') { e.preventDefault(); drRoll(e.target.value); } if (e.key === 'Escape') w.remove(); });
}
const DR_SHAPE = { 4: 'M12 3l9 16H3z', 6: 'M5 5h14v14H5z', 8: 'M12 2l9 10-9 10-9-10z', 10: 'M12 2l9 7-3 12H6L3 9z', 12: 'M12 2l9 6.5-3.4 10.5H6.4L3 8.5z', 20: 'M12 2l8.7 5v10L12 22l-8.7-5V7z', 100: 'M12 2l9 7-3 12H6L3 9z' };
function drPaint() { const w = $('#drwin'); if (!w) return; const ex = drExpr();
  w.innerHTML = `<div class="dr-head"><b>Dice Roller</b><button class="dr-x" data-dr="x" aria-label="Close">✕</button></div>
    <div class="dr-dice">${DR_DICE.map(d => `<button class="dr-die${DR.pool[d] ? ' on' : ''}" data-dr="die" data-d="${d}" title="Add a d${d} (right-click to take one away)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${DR_SHAPE[d]}"/></svg><span>d${d}</span>${DR.pool[d] ? `<em>${DR.pool[d]}</em>` : ''}</button>`).join('')}</div>
    <div class="dr-row"><div class="dr-mod"><button data-dr="mod" data-v="-1" aria-label="Modifier −1">−</button><b>${N(DR.mod) >= 0 ? '+' : ''}${N(DR.mod)}</b><button data-dr="mod" data-v="1" aria-label="Modifier +1">+</button></div>
      <div class="dr-adv">${[['d', 'Dis'], ['n', 'Normal'], ['a', 'Adv']].map(([v, t]) => `<button class="${DR.adv === v ? 'on' : ''}" data-dr="adv" data-v="${v}"${DR.pool[20] === 1 ? '' : ' disabled title="Advantage works on a single d20"'}>${t}</button>`).join('')}</div></div>
    <input class="dr-f" id="dr-f" value="${esc(ex)}" placeholder="e.g. 2d6+3" aria-label="Roll formula" spellcheck="false">
    <div class="dr-act"><button class="dr-clear" data-dr="clear">Clear</button><button class="dr-roll" data-dr="roll">Roll</button></div>
    ${DR.last.length ? `<div class="dr-last">${DR.last.map((l, i) => `<button data-dr="again" data-i="${i}" title="Roll ${esc(l)} again">${esc(l)}</button>`).join('')}</div>` : ''}`; }
function drKeep() { try { localStorage.setItem('dnd-dr', JSON.stringify({ x: DR.x, y: DR.y, last: DR.last })); } catch (e) {} }
function drRoll(ex) { ex = String(ex || '').replace(/\s+/g, '').toLowerCase(); if (!/^[\dd+\-khl]+$/.test(ex) || !/\d*d\d+/.test(ex)) { toast('Type a roll like 2d6+3.', 'fumble'); return; }
  DR.last = [ex].concat(DR.last.filter(x => x !== ex)).slice(0, 5); drKeep();
  rollGate(() => { const r = rollExpr(ex, { label: 'Dice roller: ' + ex }); toast(`<b class="total">${r.total}</b><div><div>Rolled ${esc(ex)}</div><div class="det dd">${esc(r.detail || '')}</div></div>`, r.d20 === 20 ? 'crit' : r.d20 === 1 ? 'fumble' : '', 8000); });
  drPaint(); }
