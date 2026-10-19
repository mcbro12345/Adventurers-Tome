
// ---------- Dice ----------
// Three ways to roll (Settings → Dice):
//   sheet  — the sheet rolls everything itself.
//   manual — you roll at the table / in Roll20. The sheet still tracks everything; rolls that only show a number are skipped
//            (you get the dice to roll), and a roll the sheet needs for its automation (healing, temp HP, death saves…) asks you for your total.
//   roll20 — every roll is sent to your Roll20 game's chat through the companion browser extension, and the result comes back into the sheet.
// The last two work by replaying the action: when a roll is needed, the action is undone, the number is fetched, and the action runs again with it.
const diceMode = () => ST('diceMode') || 'sheet';
let ROLLQ = null, ROLL_LBL = '';
const SKIPPED = [];
function NeedRoll(req) { this.req = req; }
function rollLocal(expr, opts, forced) {
  const clean = String(expr).replace(/\s+/g, '').replace(/−/g, '-');
  const re = /([+-]?)(\d*)d(\d+)(kh1|kl1)?|([+-]?)(\d+)/gi;
  let m, total = 0, parts = [], d20 = null, k = 0, ti = 0; const terms = [];
  while ((m = re.exec(clean))) {
    if (m[3]) {
      const sign = m[1] === '-' ? -1 : 1, n = N(m[2]) || 1, sides = N(m[3]);
      const f = forced && forced[k++]; const adeptHere = opts && opts.min2 && sides !== 20 && (!opts.min2Terms || opts.min2Terms[ti]); ti++;
      const rs = f && f.length === Math.min(n, 200) ? f.map(Number) : []; if (!rs.length) for (let i = 0; i < Math.min(n, 200); i++) rs.push(1 + Math.floor(Math.random() * sides));
      let hookNotes = null;
      if (!(f && f.length)) { const h = diceHook(rs, sides); if (Array.isArray(h)) { h.forEach((v, i) => { rs[i] = v; }); hookNotes = rs.map(v => v + ' max'); } else if (h) { h.out.forEach((v, i) => { rs[i] = v; }); hookNotes = h.notes; } }
      const shown = hookNotes || rs.map(x => adeptHere && x === 1 ? '1→2' : String(x));
      if (adeptHere) for (let i = 0; i < rs.length; i++) if (rs[i] === 1) rs[i] = 2;
      let val = rs.reduce((a, b) => a + b, 0);
      if (m[4]) { val = m[4] === 'kh1' ? Math.max(...rs) : Math.min(...rs); if (sides === 20) d20 = val; }
      else if (sides === 20 && n === 1) d20 = rs[0];
      total += sign * val;
      parts.push((sign < 0 ? '− ' : '') + n + 'd' + sides + (m[4] || '') + ' [' + shown.join(', ') + ']'); terms.push({ dice: true, sign, n, sides, keep: m[4] || '', shown, val });
    } else if (m[6]) { const sign = m[5] === '-' ? -1 : 1; total += sign * N(m[6]); parts.push((sign < 0 ? '− ' : '+ ') + m[6]); terms.push({ flat: true, v: sign * N(m[6]) }); }
  }
  return { total, detail: parts.join(' '), d20, terms };
}
const prettyExpr = e => String(e).replace(/\s+/g, '').replace(/2d20kh1/g, '2d20 (keep highest)').replace(/2d20kl1/g, '2d20 (keep lowest)').replace(/\+-/g, '−').replace(/-/g, '−').replace(/\+/g, ' + ').replace(/−/g, ' − ').replace(/^ \+ /, '');
// opts.min2: treat 1s on damage dice as 2s (Elemental Adept). opts.need: the sheet uses the result (healing, temp HP, death saves…).
function rollExpr(expr, opts) {
  opts = opts || {};
  // A fixed number (Armor of Agathys' 5 temp HP) isn't a roll: never ask for it or send it to Roll20.
  if (!/\d*d\d+/i.test(String(expr))) return rollLocal(expr, opts);
  const mode = diceMode();
  if (mode === 'sheet' || opts.local) return rollLocal(expr, opts);
  if (mode === 'manual' && !opts.need) { SKIPPED.push({ expr: String(expr), label: opts.label || '', min2: opts.min2, mixed: !!(opts.min2Terms && opts.min2Terms.includes(false)) }); return { total: 0, detail: '', d20: null, skipped: true }; }
  if (ROLLQ) {
    if (ROLLQ.length) {
      const res = ROLLQ.shift();
      if (res.adept) return { total: N(res.total), detail: `Roll20: ${prettyExpr(expr)} = ${N(res.total)} (1s counted as 2s)`, d20: null };
      if (res.dice) {
        const r = rollLocal(expr, opts, res.dice); r.detail = 'Roll20: ' + r.detail;
        // Elemental Adept: Roll20 can't count 1s as 2s, so the sheet fixes the total and posts the corrected number under the roll.
        if (opts.min2 && res.src === 'roll20' && r.total !== N(res.total) && !res.posted) { res.posted = true; r20Post([`**Elemental Adept (${typeof opts.min2 === 'string' ? opts.min2 + ', ' : ''}1s count as 2s):** [[${r.total}]]`]).catch(() => {}); }
        return r;
      }
      if (res.src === 'sheetroll') return { total: N(res.total), detail: 'Rolled by the sheet: ' + res.detail, d20: res.d20 != null ? N(res.d20) : null };
      if (res.src === 'sheet') return { total: N(res.total), detail: 'Sheet (Roll20 didn\'t answer): ' + res.detail, d20: res.d20 != null ? N(res.d20) : null };
      return { total: N(res.total), detail: `${prettyExpr(expr)} = ${N(res.total)} (${res.src === 'roll20' ? 'Roll20' : 'your roll'})`, d20: res.d20 != null ? N(res.d20) : null };
    }
    throw new NeedRoll({ expr: String(expr), opts, label: opts.label || ROLL_LBL || pendingLabel || 'Roll' });
  }
  return rollLocal(expr, opts);
}
// Wrap anything a click can start. In the sheet mode it just runs.
function rollGate(fn, given) {
  if (diceMode() === 'sheet' || ROLLQ) return fn();
  const snap = JSON.stringify(S), h = HIST.length, rd = REDO.length, last = LAST, pl = pendingLabel;
  ROLLQ = (given || []).slice(); SKIPPED.length = 0;
  try { const v = fn(); ROLLQ = null; return v; }
  catch (e) {
    ROLLQ = null; ROLL_LBL = '';
    if (!(e instanceof NeedRoll)) throw e;
    S = JSON.parse(snap); HIST.length = h; REDO.length = Math.min(REDO.length, rd); LAST = last; pendingLabel = pl;
    e.req.first = !(given && given.length);
    getRoll(e.req).then(r => { if (r) rollGate(fn, (given || []).concat([r])); else { render(); toast('Roll cancelled — nothing changed.'); } });
  }
}
// Fetch one roll: from Roll20 when connected, otherwise ask the player.
async function getRoll(req) {
  // Rolling from a phone through the sheet open on your computer, which posts it to Roll20 like any other roll.
  if (diceMode() === 'remote' && window.PG_RELAY) {
    const recent = R20.failAt && Date.now() - R20.failAt < 20000;
    const r = recent ? { error: R20.failWhy } : await window.PG_RELAY.send({ expr: req.expr, label: req.label, first: req.first, min2: req.opts && req.opts.min2 || null, min2Terms: req.opts && req.opts.min2Terms || null }).catch(e => ({ error: String(e && e.message || e) }));
    if (r && !r.error) { R20.failAt = 0; return Object.assign({ src: 'roll20' }, r); }
    if (!recent) { R20.failAt = Date.now(); R20.failWhy = r && r.error || 'no answer'; toast(`<b>Your computer didn't answer</b> — the sheet rolled instead.<div class="det">Keep this character open on your computer with “Roll20 rolls for me” on and your Roll20 game open.</div>`, 'fumble', 8000); }
    const loc = rollLocal(req.expr, req.opts || {});
    return { src: 'sheet', total: loc.total, d20: loc.d20, detail: loc.detail };
  }
  if (diceMode() === 'roll20') {
    // If Roll20 just failed, don't wait again for every roll of the same action: roll here straight away.
    const recent = R20.failAt && Date.now() - R20.failAt < 20000;
    const r = recent ? { error: R20.failWhy || 'no answer' } : await r20Roll(req.expr, req.label, req.first, req.opts && req.opts.min2, req.opts && req.opts.min2Terms).catch(err => ({ error: String(err && err.message || err) }));
    if (r && !r.error) { R20.failAt = 0; return Object.assign({ src: 'roll20' }, r); }
    // Fallback: the sheet rolls it, so play never stalls.
    if (!recent) { R20.failAt = Date.now(); R20.failWhy = r && r.error || 'not connected'; toast(`<b>Roll20 didn't answer</b> — the sheet rolled instead.<div class="det">${esc(R20.failWhy)}. Check that your Roll20 game tab is open.</div>`, 'fumble', 7000); }
    const loc = rollLocal(req.expr, req.opts || {});
    return { src: 'sheet', total: loc.total, d20: loc.d20, detail: loc.detail };
  }
  return askRoll(req);
}
function askRoll(req, why) {
  return new Promise(res => {
    let box = $('#rollask'); if (!box) { box = document.createElement('div'); box.id = 'rollask'; document.body.appendChild(box); }
    const d20 = /d20/.test(req.expr);
    box.innerHTML = `<div class="ra-card" role="dialog" aria-label="Enter your roll"><div class="ra-t">${esc(req.label)}</div>
      <p class="hint">${esc(why || 'The sheet needs this number. Roll it and type your total:')}</p>
      ${req.expr ? `<div class="ra-expr">🎲 ${esc(prettyExpr(req.expr))}</div>` : ''}
      <div class="ra-row"><input class="f" id="raTotal" type="number" inputmode="numeric" placeholder="${req.expr ? 'Total' : 'Amount'}" aria-label="${req.expr ? 'Your total' : 'Amount'}">
      ${d20 ? '<label class="checkline"><input type="checkbox" id="raN20"> Natural 20</label><label class="checkline"><input type="checkbox" id="raN1"> Natural 1</label>' : ''}</div>
      <div class="actions"><button class="btn" id="raCancel">Cancel</button>${req.expr ? '<button class="btn" id="raSheet" title="Let the sheet roll this one for you">🎲 Roll it for me</button>' : ''}<button class="btn gold" id="raOk">${req.expr ? 'Use this roll' : 'OK'}</button></div></div>`;
    box.classList.add('on'); const inp = $('#raTotal'); setTimeout(() => inp.focus(), 30);
    const done = v => { box.classList.remove('on'); box.innerHTML = ''; res(v); };
    $('#raCancel').onclick = () => done(null);
    if ($('#raSheet')) $('#raSheet').onclick = () => { const r = rollLocal(req.expr, req.opts || {}); done({ total: r.total, d20: r.d20, detail: r.detail, src: 'sheetroll' }); };
    const ok = () => { if (inp.value === '') { inp.focus(); return; } const n20 = $('#raN20') && $('#raN20').checked, n1 = $('#raN1') && $('#raN1').checked; done({ total: N(inp.value), d20: n20 ? 20 : n1 ? 1 : d20 ? Math.max(2, Math.min(19, N(inp.value))) : null, src: 'manual' }); };
    $('#raOk').onclick = ok; inp.onkeydown = e => { if (e.key === 'Enter') ok(); if (e.key === 'Escape') done(null); };
  });
}
// A number the sheet needs later (a "Heal me" button after a skipped roll): ask for it.
function askAmount(label, cb) { askRoll({ label, expr: '' }, 'Type the amount:').then(r => { if (r) cb(N(r.total)); }); }
const useAmt = (r, label, cb) => (r && r.skipped ? askAmount(label, cb) : cb(r.total));
// Roll20 bridge: the sheet talks to the companion extension with window messages.
const R20 = { ok: false, ver: '', caps: [], wait: {}, n: 0, list: [] };
function r20Send(msg, ms) {
  return new Promise((res, rej) => {
    const id = 'r' + (++R20.n) + Date.now().toString(36);
    const t = setTimeout(() => { delete R20.wait[id]; rej(new Error('no answer from the Roll20 extension')); }, ms || 8000);
    R20.wait[id] = d => { clearTimeout(t); delete R20.wait[id]; d.error ? rej(new Error(d.error)) : res(d); };
    window.postMessage(Object.assign({ __dnd20: msg.type, dir: 'toExt', id }, msg), '*');
  });
}
window.addEventListener('message', e => {
  const d = e.data; if (!d || !d.__dnd20 || d.dir !== 'toSheet') return;
  if (d.__dnd20 === 'hi') { if (R20.counting) R20.hiN = (R20.hiN || 0) + 1; R20.ok = true; R20.ver = d.version || ''; R20.caps = Array.isArray(d.caps) ? d.caps : []; if (!R20.warned && R20.ver && R20.ver !== 'mock' && R20.ver.split('.').map(Number).reduce((t, v, i) => t + v * [10000, 100, 1][i], 0) < 10400) { R20.warned = true; setTimeout(() => toast('A newer Roll20 extension is out (auras can follow your tokens on the map). See Settings → Dice.', '', 9000, { label: 'Settings', fn: () => openSettings() }), 1500); } if ($('#r20status')) renderR20Box(); return; }
  if (d.id && R20.wait[d.id]) R20.wait[d.id](d);
});
function r20Hello() { R20.counting = true; R20.hiN = 0; window.postMessage({ __dnd20: 'hello', dir: 'toExt' }, '*');
  // two answers: the extension is installed twice, and every roll would post twice in Roll20
  setTimeout(() => { R20.counting = false; const two = R20.hiN > 1; if (two !== !!R20.dupes) { R20.dupes = two; if ($('#r20status')) renderR20Box(); } }, 1500); }
setTimeout(r20Hello, 400);
// On a computer with Roll20 rolls on, this sheet also rolls for its phone: requests from the phone come in through the
// character's own storage and go to Roll20 exactly like a roll made here.
setTimeout(() => { if (!window.PG_RELAY) return;
  window.PG_RELAY.host(() => diceMode() === 'roll20' && R20.ok && !isMobile(), d => r20Roll(d.expr, d.label, d.first, d.min2, d.min2Terms)); }, 1500);
// Chat lines for a roll, in the same style as the sheet's Roll20 macros:
//   /em **attacks with Cutlass of Vengeance:**   ****   **Attack Roll (to hit):** [[1d20+6]]
// The emote heads the first roll of an action; follow-up rolls (damage after an attack) just add their line.
function r20Lines(label, expr, first) {
  const tg = /\s\[([^\]]+)\]$/.exec(String(label || '')), pre = tg ? tg[1] + ' · ' : '';
  const L = String(label || 'Roll').replace(/\s\[[^\]]+\]$/, '').replace(/\s+—.*$/, '').trim(), e = String(expr).replace(/\s+/g, ''), cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  const skills = (S.skills || []).map(s => s.name.toLowerCase());
  let em = '', line = '', m;
  // Named rolls that end in "attack" come first, so Sneak Attack isn't read as an attack with a weapon called "Sneak".
  if (/^sneak attack/i.test(L)) { em = 'strikes a vital spot'; line = `**Sneak Attack (${e}):** [[${e}]]`; }
  else if (/^nat 1 roll$/i.test(L)) { em = 'rolls a natural 1'; line = `**Nat 1 Roll:** [[${e}]]`; }
  else if (/^divine smite/i.test(L)) { em = 'smites with divine radiance'; line = `**Radiant Damage (${e}):** [[${e}]]`; }
  else if ((m = /^(.*) spell attack$/i.exec(L))) { const own = CL[Object.keys(CL).find(k => CL[k].name === m[1])]; em = own ? 'makes a spell attack' : `casts ${m[1]}`; line = `**Spell Attack (to hit):** [[${e}]]`; }
  else if ((m = /^(.*) spell damage(?: \((.*)\))?$/i.exec(L))) { em = `casts ${m[1]}`; line = `**Damage (${e}${m[2] ? ' ' + m[2] : ''}):** [[${e}]]`; }
  else if ((m = /^(.*) healing$/i.exec(L)) && !/:/.test(L)) { em = `casts ${m[1]}`; line = `**Healing (${e}):** [[${e}]]`; }
  else if ((m = /^(.*) attack$/i.exec(L))) { em = `attacks with ${m[1]}`; line = `**Attack Roll (to hit):** [[${e}]]`; }
  else if ((m = /^(.*) damage(?: \((.*)\))?$/i.exec(L)) && !/:/.test(L)) { em = `attacks with ${m[1]}`; line = `**Damage (${e}${m[2] ? ' ' + m[2].toLowerCase() : ''}):** [[${e}]]`; }
  else if ((m = /^(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) check$/i.exec(L))) { em = `makes ${an(m[1])} check`; line = `**${m[1]} Check:** [[${e}]]`; }
  else if ((m = /^(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma|Concentration|CON) save$/i.exec(L))) { em = `makes ${an(m[1])} saving throw`; line = `**${m[1]} Save:** [[${e}]]`; }
  else if (/^initiative$/i.test(L)) { em = 'rolls initiative'; line = `**Initiative:** [[${e} &{tracker}]]`; }
  else if (/^death save$/i.test(L)) { em = 'makes a death saving throw'; line = `**Death Save:** [[${e}]]`; }
  else if (/^hit die/i.test(L)) { em = 'spends a Hit Die'; line = `**Hit Die (${e}):** [[${e}]]`; }
  else if (skills.includes(L.toLowerCase())) { em = `makes ${an(L)} check`; line = `**${L} Check:** [[${e}]]`; }
  else if ((m = /^(.*?): (.*)$/.exec(L))) { em = `uses ${m[1]}`; line = `**${cap(m[2])} (${e}):** [[${e}]]`; }
  else { em = `rolls ${L}`; line = `**${L} (${e}):** [[${e}]]`; }
  if (pre) line = line.replace(/^\*\*/, '**' + pre);
  return (first ? [`/em **${em}:**`, '****'] : []).concat([line]);
}
// Sent as a 'roll' (its line holds a fixed [[number]]), so every extension version posts it and confirms it landed.
async function r20Post(lines) { if (!R20.ok) return; return r20Send({ type: 'roll', lines, expr: '0', label: 'note', who: S.name || '', campaign: ST('r20campaign') || '' }, 25000); }
const r20Ver = () => (R20.ver === 'mock' ? 99999 : String(R20.ver || '0').split('.').map(Number).reduce((t, v, i) => t + (v || 0) * [10000, 100, 1][i], 0));
// Elemental Adept in Roll20: every damage die becomes {1dX,0d0+2}kh1 (keep the higher of the die and 2 — Roll20 needs every
// item in a kh group to be a roll, hence 0d0+2), so Roll20's own total already counts 1s as 2s.
const r20Adept = (expr, mask) => { let i = 0; return String(expr).replace(/\s+/g, '').replace(/(\d*)d(\d+)(?!\d|k)/gi, (m, n, s) => (mask && !mask[i++] ? m : N(s) === 20 ? m : Array.from({ length: Math.max(1, N(n) || 1) }, () => `{1d${s},0d0+2}kh1`).join('+'))); };
async function r20Roll(expr, label, first, min2, mask) {
  if (!R20.ok) { r20Hello(); await new Promise(r => setTimeout(r, 400)); if (!R20.ok) throw new Error('the Roll20 extension isn’t installed or this page isn’t connected'); }
  const e = String(expr).replace(/\s+/g, ''), adept = !!min2 && r20Ver() >= 10300 && /d(?!20)\d+/.test(e);
  let lines = r20Lines(label, expr, first !== false);
  if (adept) { const e2 = r20Adept(e, mask), tag = typeof min2 === 'string' ? min2 : ''; lines = lines.map(l => l.split('[[' + e).join('[[' + e2).replace(/\):\*\*/, mask && mask.includes(false) ? `; ${typeof min2 === 'string' ? min2 : ''} 1s count as 2s):**` : '; 1s count as 2s):**')); }
  const send = ls => r20Send({ type: 'roll', lines: ls, expr: String(expr).replace(/\s+/g, ''), label: label || 'Roll', who: S.name || '', campaign: ST('r20campaign') || '' }, 12000);
  if (!adept) return send(lines);
  // If Roll20 won't take the 1s-as-2s form, roll it plainly; the sheet then fixes the total and posts the corrected number.
  try { const r = await send(lines); r.adept = true; delete r.dice; return r; }
  catch (e) { return send(r20Lines(label, expr, false)); }
}
function roll(label, expr, cls, rows) {
  const r = rollExpr(expr, { label });
  toast(`<b class="total">${r.total}</b><div><div>${esc(label)}</div><div class="det dd">${esc(r.detail)}</div>${mathHTML([termMath(r, rows || ROLL_ROWS, 'Roll')])}</div>`, cls || (r.d20 === 20 ? 'crit' : r.d20 === 1 ? 'fumble' : ''));
  return r;
}
function d20Expr(bonus, kind, ab) {
  const rm = rollMode(kind, ab);
  const base = rm.mode === 'adv' ? '2d20kh1' : rm.mode === 'dis' ? '2d20kl1' : '1d20';
  const bless = (kind === 'attack' || kind === 'save') && blessed() ? '+1d4' : '';
  const ex = ['attack', 'save', 'check'].includes(kind) ? exD20() : 0;
  // "Advantage on your next attack roll" (Steady Aim and the like) is used up by this attack.
  if (kind === 'attack') { const used = (S.effects || []).filter(e => e.buff && e.buff.atkAdvNext && !e.ally); if (used.length) S.effects = S.effects.filter(e => !used.includes(e)); }
  // Tides of Chaos (and the like): advantage on the next attack, check or save, used up by this roll.
  if (['attack', 'check', 'save'].includes(kind)) { const used = (S.effects || []).filter(e => e.buff && e.buff.d20AdvNext && !e.ally); if (used.length) S.effects = S.effects.filter(e => !used.includes(e)); }
  // Bane: −1d4 on attacks and saves. Guidance / Resistance: +1d4 on the next check / save, then they're gone.
  let extra = ''; const bs = selfBuffs();
  const dieNames = bless ? ['Bless'] : [];
  if ((kind === 'attack' || kind === 'save') && bs.some(b => b.bane)) { extra += '-1d4'; dieNames.push('Bane'); }
  const once = k => { const e = (S.effects || []).find(x => x.buff && x.buff[k] && !x.ally); if (e) { extra += '+' + e.buff[k]; dieNames.push(String(e.name).replace(/\s*\(.*\)$/, '')); S.effects = S.effects.filter(x => x !== e); } };
  if (kind === 'check' && ROLL_CTX !== 'init') once('checkDieNext'); if (kind === 'save') once('saveDieNext');
  return { expr: base + sgn(bonus - ex) + bless + extra, rm, bless, ex, dieNames, bonus };
}
// House rule (Settings → Rules): a natural 1 on an attack roll also rolls a d4, always the last roll.
function nat1Roll() { return ST('nat1Roll') ? rollExpr('1d4', { label: 'Nat 1 Roll' }) : null; }
function d20(label, bonus, kind, ab, rows) {
  const dx = d20Expr(bonus, kind, ab), { expr, rm, bless, ex } = dx;
  const r = rollExpr(expr, { label });
  const fl = typeof fxD20Floor === 'function' ? fxD20Floor(kind, ab) : null;
  let floorUp = 0; if (fl && r.d20 != null && r.d20 < fl) { floorUp = fl - r.d20; r.total += floorUp; r.detail += ` (d20 ${r.d20} counts as ${fl})`; r.d20 = fl; }
  const math = mathHTML([d20Math(r, dx, rows || ROLL_ROWS, 'Roll', floorUp ? [`d20 counts as ${fl}`, floorUp] : null)]);
  const note = [rm.mode !== 'normal' ? (rm.mode === 'adv' ? 'Advantage: ' : 'Disadvantage: ') + rm.why.join(', ') : '', bless ? 'Bless +1d4' : '', ex ? `Exhaustion −${ex}` : '', rm.auto ? 'Automatic failure (condition)' : ''].filter(Boolean).join(' · ');
  const n1 = kind === 'attack' && r.d20 === 1 ? nat1Roll() : null;
  toast(`<b class="total">${r.total}</b><div><div>${esc(label)}</div><div class="det dd">${esc(r.detail)}</div>${note ? `<div class="det">${esc(note)}</div>` : ''}${n1 ? `<div class="rc-n1"><b>Nat 1 Roll:</b> ${n1.total}</div>` : ''}${math}</div>`, r.d20 === 20 ? 'crit' : r.d20 === 1 ? 'fumble' : '');
  return r;
}
const doubleDice = e => String(e || '').replace(/(\d*)d(\d+)/gi, (m, n, sd) => (2 * (N(n) || 1)) + 'd' + sd);
const critDice = e => { e = String(e || ''); if (ST('critRule') !== 'max') return doubleDice(e); let mx = 0; e.replace(/(\d*)d(\d+)/gi, (m, n, sd) => { mx += (N(n) || 1) * N(sd); return m; }); return mx ? e + '+' + mx : e; };
const diceTimes = (e, k) => String(e || '').replace(/(\d*)d(\d+)/gi, (m, n, sd) => ((N(n) || 1) * k) + 'd' + sd);

// ---------- Toasts & modal ----------
function toast(html, cls = '', ms = 4500, action) {
  // Rolling in Roll20 yourself: a result card becomes "roll these dice" (the sheet still did everything else).
  if (SKIPPED.length && /^\s*<(b class="total"|div class="rc-multi")/.test(html)) {
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const name = (tmp.querySelector('.rc-name') || tmp.querySelector('div > div') || tmp).textContent.trim();
    const keep = [...tmp.querySelectorAll('.det, .rc-msg')].map(x => x.textContent.trim()).filter(x => x && !/\[|^Hit:|^Spell attack|^\d+d\d+/.test(x));
    const rolls = SKIPPED.splice(0).map(r => `<div class="m20">🎲 <b>${esc(prettyExpr(r.expr))}</b>${/d20/.test(r.expr) ? ' <span class="hint">d20</span>' : ''}${r.min2 ? ` <span class="hint">— Elemental Adept: count each 1 as a 2${r.mixed ? ` (${typeof r.min2 === 'string' ? r.min2 : 'matching'} dice only)` : ''}</span>` : ''}</div>`).join('');
    html = `<div><div class="rc-name">${esc(name)}</div><div class="hint">Roll these yourself:</div>${rolls}${keep.map(x => `<div class="det">${esc(x)}</div>`).join('')}</div>`; cls = 'manual';
  }
  SKIPPED.length = 0;
  const t = document.createElement('div');
  t.className = 'toast ' + cls; t.innerHTML = /^\s*<(b class="total"|div)/.test(html) ? html : '<div>' + html + '</div>';
  { const acts = [].concat(action || []).filter(Boolean); if (acts.length) { const box = document.createElement('div'); box.className = 't-acts'; acts.forEach(ac => { const b = document.createElement('button'); b.textContent = ac.label; b.onclick = () => { rollGate(ac.fn); t.remove(); }; box.appendChild(b); }); t.appendChild(box); } }
  t.addEventListener('click', ev => { if (ev.target.tagName !== 'BUTTON') t.remove(); });
  // Dice results get their own big card in the middle of the screen; everything else stays in the corner.
  const isRoll = /^\s*<(b class="total"|div class="rc-multi")/.test(html);
  let box = $('#toasts');
  if (isRoll || cls === 'manual') logRoll(t.innerHTML, cls); else logEvent(t.innerHTML, cls);
  if (isRoll && cls !== 'manual') postSheetRoll(t);
  if (isRoll) { box = $('#rolls'); if (!box) { box = document.createElement('div'); box.id = 'rolls'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); } t.classList.add('rollcard'); ms = Math.max(ms, 6500); }
  if (isRoll) box.prepend(t); else box.appendChild(t);
  const cap = isRoll ? (document.documentElement.classList.contains('mobile') ? 1 : 2) : document.documentElement.classList.contains('mobile') ? 2 : 5;
  if (isRoll) {
    // Each die is behind the 🎲 button: the card stays simple, but you can check for 1s, 20s and rerolls.
    if (t.querySelector('.det, .rc-math')) { const db = document.createElement('button'); db.className = 'rc-dice'; db.title = 'Show the math'; db.textContent = '🎲'; db.onclick = ev => { ev.stopPropagation(); const on = t.classList.toggle('showdet'); clearTimeout(t._tm); if (!on) t._tm = setTimeout(() => t.remove(), 4000); }; t.appendChild(db); }
    { const btns = [...t.children].filter(c => c.tagName === 'BUTTON'); if (btns.length > 1) { const w = document.createElement('div'); w.className = 'rc-btns'; btns.forEach(b => { b.style.marginLeft = ''; w.appendChild(b); }); t.appendChild(w); } }
    while (box.children.length > cap) box.lastChild.remove(); t._tm = setTimeout(() => t.remove(), ms); return;
  }
  while (box.children.length > cap) box.firstChild.remove();
  setTimeout(() => t.remove(), ms);
}
let onModalCancel = null;
function openModal(html, onCancel, wide) {
  onModalCancel = onCancel || null; $('#modal-body').classList.remove('xwide'); $('#modal-body').classList.toggle('wide', !!wide); $('#modal-body').innerHTML = html; $('#modal').classList.add('open');
  const f = $('#modal-body [autofocus]'); if (f) f.focus();
}
function closeModal(confirmed) {
  if (!$('#modal').classList.contains('open')) return;
  $('#modal').classList.remove('open');
  const cb = onModalCancel; onModalCancel = null;
  if (!confirmed && cb) cb();
}
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); $$('.menu.open').forEach(m => m.classList.remove('open')); } });

// ---------- Field helpers ----------
const inp = (path, o = {}) => {
  const v = getP(path);
  return `<input class="f ${o.cls || ''}" data-k="${path}"${o.num ? ' data-num type="number" inputmode="numeric"' : ''}${o.type ? ` type="${o.type}"` : ''} value="${esc(v)}" placeholder="${esc(o.ph || '')}" aria-label="${esc(o.label || o.ph || path)}"${o.title ? ` title="${esc(o.title)}"` : ''}${o.fit ? ` data-fit="${o.fit === true ? 6 : o.fit}" size="${Math.max(o.fit === true ? 6 : N(o.fit), String(v ?? '').length + 1, String(o.ph || '').length + 1)}"` : ''}>`;
};
const ta = (path, o = {}) => `<textarea class="f ${o.cls || ''}" data-k="${path}" rows="${o.rows || 2}" placeholder="${esc(o.ph || '')}" aria-label="${esc(o.label || o.ph || path)}">${esc(getP(path))}</textarea>`;
const chk = (path, label) => `<input type="checkbox" data-k="${path}"${getP(path) ? ' checked' : ''} aria-label="${esc(label || path)}">`;
const sel = (path, opts, o = {}) => `<select class="f ${o.cls || ''}" data-k="${path}" aria-label="${esc(o.label || path)}">${opts.map(([v, t]) => `<option value="${esc(v)}"${String(getP(path)) === String(v) ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
const fld = (label, inner, cls = '') => `<label class="fld ${cls}"><span class="lbl">${label}</span>${inner}</label>`;
const calc = (key, cls = '') => `<span class="calc ${cls}" data-calc="${key}"></span>`;
const rollBtn = (key, label, cls = '') => `<button class="roll ${cls}" data-calc="${key}" data-roll="${key}" title="Roll ${esc(label)}" aria-label="Roll ${esc(label)}"></button>`;
const del = (list, i) => `<button class="icon-btn" data-act="del" data-list="${list}" data-i="${i}" title="Remove" aria-label="Remove">✕</button>`;
const mv = (list, i) => `<button class="icon-btn mv" data-act="up" data-list="${list}" data-i="${i}" title="Move up" aria-label="Move up">↑</button>`;
const ABOPTS = AB.map(a => [a, AB3[a]]);
// A small picture (people, companions, items): tap to view it big, change or remove it.
const picThumb = (path, label) => { const v = getP(path); return v ? `<button class="picth" data-act="picview" data-path="${esc(path)}" title="Picture of ${esc(label)}"><img src="${esc(safeImg(v))}" alt="${esc(label)}"></button>` : `<button class="picadd" data-act="pic" data-path="${esc(path)}" title="Add a picture" aria-label="Add a picture of ${esc(label)}">${ICON.image || '🖼'}</button>`; };
const isMobile = () => document.documentElement.classList.contains('mobile');
const who = () => S.name || 'Your character';

// ---------- Settings ----------
const SETDEF = { combatSpellSort: 'level', protectorScales: false, advancement: 'milestone', abilityStyle: 'mod', showName: true, showRace: true, showBackground: true, showPlayer: true, showAlignment: false, showFaith: false, showRoll20: true, encumbrance: 'off', exhaustionRule: '2014', exhaustionDC: false, concPrompt: true, durationAlerts: true, autoSpend: true, critRule: 'double', density: 'comfortable', fontScale: 100, hpLevelUp: 'avg', confirmDelete: false, showCastHints: true, inspiration: false, inspMany: false, electrum: false };
let GEN = 0, RENDERING = '';
const PID = id => `data-pid="${id}" data-gen="${GEN}" data-home="${RENDERING}"`;
const ST = k => (S.settings && S.settings[k] !== undefined ? S.settings[k] : SETDEF[k]);
const XPT = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
const xpNext = () => XPT[Math.min(19, totalLevel())];
const xpReady = () => ST('advancement') === 'xp' && totalLevel() < 20 && N(S.xp) >= xpNext();
// Exhaustion: 2014 table, or the 2024-style rule (−2 per level to d20 tests, −5 ft speed per level).
const exModern = () => ST('exhaustionRule') === '2024';
const exD20 = () => (exModern() ? 2 * Math.min(5, N(S.exhaustion)) : 0);

// ---------- Renderers ----------
const R20_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARcAAAB4CAIAAABXZCG4AABYmUlEQVR42u1dd3hUxdp/Z07Zmt5JQiCUEFroIAjSq4gNEbGgqAhYsd6r3qteu1exolIUlQ4qilTpvYYklFACIQlJSG/bz5mZ749J1iXZ3WxCULxf5tlHw+45c+bMvL95+zuIMQbNrbk1t6to4p/xEMqAMcAIEAIGQBkAAEaAmue/uf0vNHRteRFlgDyjxfuvza25/U0avob4oZz/gLo/zzR9s7I3FwBovsk8/Xf78tOg0Gp2RBg0C5XNrVmiq40fLrABqMcKbXOO2H/OoKZyoXWANCCaXKiwzUuBeSm2IXG62T3lMa1BwM18qbk1o8gdfo4W2L5Ota84QyvNCCQQdCBiAAAE4KdhVQ7H9kxlR440upXu8e7yqNYgoOoecDOSmnpbo9SL3I4xRsjjnDPGKKUe9QGEMMbNMyw2PX7SimxfptiXnaYVZgARCTIAAKF/iG2EAQASJCDMseGcsumiPKa19vHu8ujWgBEwqDZFNLemktqvgtARQoIgNM/hNUaRK35OFFu/SrEvTadlZgQiiDJQxigDjBhUg4gBMAQMABgDBIBlRplt3Vn7povy2Na6Wd3lka2qTXnXAZYYY7V2cYSQl537emuMMYTQZ599sWvXDknS1OIqGGOHwz5x4sRJk+6ilNYCG7/3+PET7777nqqqCGNwmQqEECFKSGj4fz94z2Aw8IubUdQo/DDgkhg5VWJdeNz23UlaUolAQqIMlHGe40KAdf6oVocAYRlUZv/1tLLhonxrW92MJGlIS0AIGAMGfzKWWE3jok5d4uBCDqpp1/8ab9+x4+efVnv6tXV8/KRJd9UV+Tgw8vLyli5d7OnegKCQt958w2AwNMm0O//rBKrzv9dooV2eiBDy6Vlu9wuxkfhx8p9zZda5KfbFJ0mxCYEIooY58YOg2mCAEaM1d1HGGDCMQEBAoRonjAEGwBqqUuuqk7ZfMjS3tNE90UMeFAMI/jS+5Aoe/k1ZWVl5eYXNZiOESJKo0+kCAwP9/f2dQg7f3a9z3cBoNAqCIMk6Qojr94IgKA6rXq/3cq8kSXqDv8PhwBi7kjjGSFXsQYGBV0nlTvbI57Bub7UuaBIt0dMTvT+L44dfXwtLYuPxk1FuXZhmW3RCvVyBQESSzLjcVuNOZYQBUavZDVDkrwEAZJAZRoQ6gOJqhIm4GioADCOEZapQ6+pTtt/Oa+9or5vRTR4Qfa1lPMYYpUwQMEKooqLyyJEjO3ftSklNy87KKiworDKZVFXVaDR+RmNEZETLli27d+s2cOCNPXv28PPz47N/PfMlSikhBBNSC0UAQAjxYjzgM0MIIYTUEm4ZQ8Rdhw2lZie9UkpLS8vMZrOiKgLGkiQZDIagoCDnBc497mqe6GoOsVqsZeVldrsdAGRZExgY4GSqbp+FEKKUFhcX+/v7a7XaRvEiF+GKXKywzEuzfn+S5JYjEJBGC6yGMxLCgFarP5IGtwwU4wPEHhFSz0jNyDgAkDqFBKy+RTmYpyQXktOl5FIVNVlr5DyMBMwAgYQAaZhCLUuO29ZkaG5vp5/VXe4bdY1kPK4SCALKzc394Yclq1avTk1NI6rdue0Cwgghm81WUV566VLW0SOHfv5ptShpu3VLuvPOO6bcMzkmJsbZT7Oq7aMoxecqOzt73779e/fuO5eRUVBQWFFRbrfbBUHUaDSBAQHhEeHt2rXt17dvv379WrWKQwg1DkuuTzx79tzWbdsOHDh48eLFwsIis9kMADqdLjw8LC4u7oZ+fYcOHZKYmMifxcHDOU95efmhQ4cVRREEITGxQ1xcnJMj+YAiJxNAQHKqzF+nWH84SbIrEBZAp2EKZXYFgO9nSAg1CC2MUpcwqU+U1ClUSAgSYvyu6EoWNCNbaUa2AgBWalPPliqnS5XDl5XkApJdSfPNjCjVyMcCaDXUoVp+OG77NUN7a1v9Ez3knpGAathbU+z9nPTtdvu8efPnzPk4M/M8AGBBFiWtc81chSDOc7hqdOTwwSOHD879Yu6sWbNmzZphMBiageTjhAPAwYOH5s2fv3nz75cu5QJTvdzyCRKjW0QNGzZs2rSHBg0ayHmC7/PsvHjfvv1z5375+5YthQWXoY6n/+wZ2LMbliz+PjQsYtiwoTNnzBg0aKCTgzHGTp06hRAKDAywWm0nT54MDw/X6XQcSD6gCAEgRPJMlm+PW749oZwvQYAAEKUErCrWaoRYfyE+QOoRLneLEBODxU6hSP7DNsqsKogY1Yhv1XF0CJhNRcFaqV8LqV8LmNqZq1hqeomSVqwkX1bPlJJcE62wMmAIMKmwmb5Ls/56XndXgmFmN6lreBOu6PnzF556+pl1v/0KAKJczVc9yTlOUCGEREkLANnZWS+++Py6devmzPmoR4/uzUDy0gghgiAUFBS89dY73y5aZKqqcBJZaFhEWFiov7+/TqdnjFktlipTVUlJaWHBZWBqbm7O998vWrlq1T33TP7Xq6/ExcX5OM/8stLS0jfffHv+ggXOJwYFh0VHtwgPjwgODgKA8vLywoLC3Ly8kuKC4qKCFcuX/bZ23UMPPfjqqy+HhYVRSlVVFQQhMDAgLe14u3bt9Hq9xWrV6XQ+SHQMAAEttpo+TzYtSFNzSwAQAglHGMVYo9g5TO4VKXUMETuECFEGF9goanq5erpUSS5Qz5aRC6XaSR2Nz/UGAGYjSCMARrY150xv7Rei/YQ2gVKPSLFziBDnL7YLEtsFaW9pCwC00q6eLlVPlzqSC5RjBWpWJckzqWVVlV8fNH9/Und3gt8L/aQOwXyEVwOhffv3Pzh12tmz6RwSlNCGGsFFSYMQ2rVrx9hx4774/PM77ri9GUieJlwQhL17982cOSstLQVAAIDIyOhRo0aOHj0qsWNibExMYGAgnzpCSEVFRW5u7tmz57Zu275hw8aLmRk2q/WbhQt279799VdfDRkyuN555qBNSUl5dPpjhw8dBABAYv8bbpg0aeKAAf3btm0bEBDgvLiqqirj/Pl9+/avXLlq9+7dZnPlZ599snffvq+/+rJXr56iKBJCzGbz0KFD8vLyTKYqvU73h3GCeWkqZYyZlp3K1n2Y2/rrwtEry/6507w83ZFWyAi94sKsCtv27Kr/Hiq7f11Rv8X5IZ/lwfu58G4uvHMJ3jR9nswYc6QWFt+42LosnTFm35mdr/kwF97KhXfz4L1848eF3RaV3vVL5et7revOq+dKqU117V/JLLf8dr7i3QNFE9fkd16Yrfmg/LU9zhE2onF1+eChQzGxcQAgyXosyFfzkWQdANLrjUuXLWeMqTXq+F/beNTClHvvBwBJ1rkbM7zy6r8YY6qqup2iLVu2arQGhCVB1LjeK0oaAIht2aq0tNT5oHonfPPm38PCI7i2afQLfPKpp9PT0315kaysrNdefyM0LBIAA6CQkLANGzc5u/XyxL379rVqFc/ZXXybdgsXfmMym70/y2q1fvfd9wkJiRxdMTFxu3fvYYxVVlbu2rV7x46dW7duzc/Pd31rzyiijBHKCCXlNsepYlJpv2KIl832A3mmr1LKpm8qumnZ5Zgvc4UPLsG7l+DtS/BuLvogV/pvru6jXPxe0dDl1KIwSsvuXZcD/y5MWkRKrYyx8ie3XoJ3c3Uf5Ur/zcXOe9/Jhffzwz4v6re49L7fqv57yLY9W82quGJcClHOlqqXTXx4jNLGQSg7O6dDYie35HUVQMJGv4CN9S3w/zcU8a4OHDgYEdmCw6Bzl6Tt23c4B6mqKrcW1mqEEP4Tv/JYSkq/fv05CKOiYlJSUjzNM/8yLS0ttmUrDoYxY2++cCGzetN3eZxzDM7HOXE7fvwEDr+Y2LijR5P5ZSaTqe5ciW4M2dWmKcTVdxygwQEaWmFX0oqUE0WOowVqeol6voLmVFKrCkCq1W4RgyxV27h5PwoFSTDO7oV0om1TpuWnM1jj70i9bP4qxe8f/QxP9rD+eEbNNyFRAAFAlLi9mzGmFlvVIhM7kI1+EJAk4BZGMT5QbB8k94iQuoULrQLEdkFu7IfOYftgrlFV9dnnnj+dfrKuF8V7pELdaAZX+UGUNaaqilmPP7F1y2bfZff/eYscQqigoPCRR6YXXM4DgAE3Dlq6ZHHLlrGEEG569hRk5Jx8Tu7dkpLWrPlp8j33bt+2NT//0jOzn/tt7RquR7kuE/9ncXHxI48+lpN9EQDdNenuBfO/9vPzI4S4fZyrh5ejpWXLlsuWLXnk0ceWLV18KSfr4Uce3bRxfWhoKLeGe/UXuZAgMysk36SeK3McK1BSi9RzZeq5MmpyQLUhW0AiBg0GJHANinFvEfvDmsVsDt0tHTSjWjObavrvYWqxI52GYWz6PFk3sYPYNlD/ePeKf+wALACFP+5FADICJCH+HWVqdqWaVQbbLwBgpJHE1v5i+2Cpc6jcI0LsECK0MOIgre/aEbeTLlmybNXKFWKdoBjXacUYE0JcTN78B1GSJE/xnZQQSdadzzj78iv/+v67b/8/B8XUmvB33nn3+PEUQEJiYuKSJT+0bBmrqqoo+upo4ZuRqqoRERHfLJw/bNiIzMzM7du2Ll264uGHH+JmtFpPfO31/xw8sA8ABg8ZOn/eVxxCvsQE8tBBQojBYJj39ZfFRcW//77xWPKR115744svPnPrG7ziNdScKvVMqSOtUDlepJ4rVzPKaImVqYQBRSAgCYNGrM5I4rDhRnA3Lw2gUhSs93+pLxKxZWm6bXsWyDJTKciCmldh+uRI4GfDjY8kWVafcSRfRhrpCjbo2i0GkAXANVilzHG61H66CP16FrCAAzRifKDYNlDqHCYnhUkdQsQ2gV7YEZ/fkpKS995/n88YY9TdPGJKKVGtoqRNSOgSHd3C39/farXm5eefzzhvqioHEERJcotASqkgapYvXzZ58qRxY8f+P2dH/PUPHT68aNF3GAtGo/+Xc7+Ia9mSEOI7hP4gVlEkhLRq1er111978MGHCCFfffX15MmTXAP5+BO3bNm6YMEChHB0TOyXcz/39/f3EUKugR2EEKPR+MXcz4YNG3kp5+KChQtvuWX8qFEj63YlVgtyGJFcU+EtPyophQDAgCDAIApIQCBJCFVTMAADeqUR3P0QELUrAQ/2lHtH0SJL5YeHKWFIguqQH0kyLzmlm9JR06+F3zO9ix9YB8C8MhOXhyIArYiwyC3mxOQgR/NtR3PRCgwY4TB92OLx2uFxnjIsuJlozZpfT544LoiyWxgghIlqFyX57ikPTH3g/p49ewYGVltyrFZrWtrxVatWL1j4TUV5iShp6/bAGBMEQXHYv/zy69GjRv2/l+gQAMybt6CiohQAHpj6wE03DSKENjpOHGNMKZ048c558xfs3rUjNS11y9ZtE24Zz1eWY8lms739zrt2mwUh/Oorr3To0KGhEHIFUru2bV95+R+PPTbDYbe+++57gwffJMtyLYkOO8HAECOFZiogZpBAr2F6iUmIIqCMUcIoZRTApw9GxK6KbYL9Hu8BAFXzU21pl0Ercn2CMWAiVsoslR8eBkL1t7fXDG9FbAoVkK/98/EwRhEwATFdzWhlgZTZmWclp5q+FWXJ0qUA7v3fCGOi2lu0iF6xfNkP3y8aNmxoYGCAU4nU6XR9+/b573/f/33zht69+6qKDbnrhFKKkLhz567k5GPcRdgIKahG62VeNLG/gyyHsrKy161fjxAKj2gxa+ZjjLGrkXO5A1Sj0Uy88w5AWFXsW7duc6o0XNxav37Dzp07AWDAjQPvv//eqxEHOGgfeOD+mwYPAYDdu3f/9tu6umuKnRuGEGEQO4RUrxtljNaIbDyXoUEfyvxmdBdbBaiZ5VUL0kAQKAIKQBFwWIJGMv+WYdmQiXRiwPO9kZ+GEcpwQx4BNR9WM1RCUYRe6hjq3a6Qkpp66NBhhMS6xI0QYlQNCAj87rtFt99+GzfaOGMQnSELhJDevXuvWrWyS9duRLHXXSHGmCBJpqryjZs2wZVxyt5pjlLKTUfOJ9aElSPGmNOI9TcS5wBg8+bNl/PzGGNjx45OSEiAq44r5YC56aZBfn4BAJCamqooCg+W5UT//Q+LKVEEUZ7x2HStVns1WRtO0D4+6zFBkAhRvv32O1UltV6hhhdRhgQs9Y4kjFBcQ+6N+AiI2BSpZ6TfQ10AoOKzZEdmKWiF6mwiVCMEiojalPIPDtEqh25YK/3EBGJXqYAa/1wMRKVSpxAh3MDf3hOKtm/fYTZViJLkwTygvvjSi8OHD1NVlWuZrgvgNCipqhoX13LOnI/0BiMlpO4i8X8fPHCQUsIlDe/4cbFWYYyxqqqlpWX5+fm5eXkFBYVVVVUIIf4TJ5S/BZY4qe3ctRsYFUV5zJgx4BI3fZUoio2NjY5uAQA5OTkmk8nJiE6ePLVjxy6EoHPnLjePG3f1oOX4HDVyZNekJIRg9549aWmptdiR+IdCD6DpEYlk6WoCAgAYiDhwdm8cpLUdyqv8/gSTJUrr0BBhoJete3NMS0/5T+8W+Exv88YLpMSGRNTISiYYGKOabhFIIwBh1fnn7qYjOTnZ02Spij2xY5fHpj9aKz/CrcRMKR02dMjNN9+8csUySaxtLmeUAsDJU+mVlVWBgYHe+Y8gCFwEP378xL79+48eTc66mFVUXGwymSglsiwHBARERkYmtG/fr1/fPn16x8bGQlPEOP8JBu6Kioq01DQACA0Lv6FfX2i6BAetVhsRHnE6/aTVaiuvqAgKCuJb1a9r11aUlwDA+PHj/AP8r966wwFj9PMbN3bMseQjlRWlmzb93qNHD9edUXTlSdqeETjCoBaYkSwAbTg5C4iaHMZxbY13JDBCyz88rJZYsFFmxJ3xAAEDKP8i2XBbe7lzmN/ULiVv78eyXDu3z0cNljKmleSekd4X1WKxnDp12q2UhRACYBMmjA8KCqp36p1b0fibb161cqUbGwMAgFBWWlpUVBQYGOhWqKiJJReqKqt++nnNsuXL9+7dZ6oqr/Nu1UNdCwCAWsa1Hj1q5P333ztgwAA+jOszKYO/cmFRUXZODgC0ahUXFRXVtIxOkiQ+jaqi8q3N4XBs3boNgOkN/mPGjG5alfLmm2+e8/GnZlPFlq1bX3zxeacxA1wqaSEAEFsHiu2CKKGNk6koYShIG/R8HyQLlg0XTOsykF5ilLlXbBgDnWg7UVj+9TEACJzVU+ocSmyNlesIwyFaTfdwAG/VwcrLywsKCupW4UMIEUKwIPfr18/HqefT161bkp9/AFFVN3SMkKKqZWVl7l20lHLeuHTpssFDh0+dev+mjetNJpMoaSVZJ8k6UdKKklYQZf6HJOskWSuIcnZW5rx5Xw0bNvKeKfceO5bCeeZ1a37Iz8tXVRVj3Lp1a27abirAE0J4apAgCFqthvecmXnx2LEUAGjXrm33bt2aqrgKH3Pnzp0TExMB4MSJU+fPn3fdi7Hrdo4w0vSKpA1V9PlHQMSqGO9or78xlpqU0o8PE2t9kADGZLFsXoo9vURsYQya1YMxxjA0+OkCogqROoRI1VkYHpWi0rIyh8PuFmeUEIPB0Ca+tY9bO78mLCxUp9UCUM8CG3NvcMc4Kzv7vvsemDJlSvLRQxwnXFDk2W/O+BRncAohlDEmShpJ1imqsmzpkuEjRs6Z8wlX4a5PTam4uNhsqqCUGo2GJlGKnM1msxUUFgKAXqfjuZIAkHzsWEVFOQD0v6GfM22hSVBEKTUY9D17dgeA4uLCw4ePuENRjRSi7RbBNAIFoNjnDzcqKATH+gU/3QcwqlyZbtqZzYwSt0d7RhEwLXZcqiz99DAwCJjSWTsoVrUo1djz/ekYqYRoukcgjcioN9eTzWpTVeIhMYlJkuh0DTXAJO1ZQ8QYazQat4Lc/v0HRo0as2TJD6Ioc78Ttwf6YvgihCCEJVlXWlI6e/bTU6c+VFFRwa0O15unKCYm5t57H5g4cdLgm25qKkbEZyk3Ny8/Px8AYmJjuNeV2+sYVQHhHj16NC1oef89e/RASKBESU1Lc30dsZZdSdMlDIfpSJndd0WfIUAYqIOEPpKk7RiqFphLPjvCeEIRqn90yCBVrj4TcG9n/YCYkGf6WI7kM16GwUchBQNQivSStkcEACBWjxjglVIRQtj3aUUIFRYW2WxWD0Ik1Wg0oaGhruyRQ2jz5t8fmDr1cn5edRRfw+UxbtYTRAkjacmSH4qKi79b9E1kZOT1EyqBMQKAPn16//DDoloMvEkIes/ePaaqSgDo2qWLVBNHknHuPAD4+wd26JAATVr5hHeVlNRVo9XZrKb0U+nctMPJ4MoZp0xuEyi1CqCEUOyrfsIERGyq3CUs+JHuAFA6P8V6vBD0IqPsD6+Opw8DJmGlzFb88SHmIH6j441j4v9gR759CGUoSKPrEQmUwZ9VrZirTydOnqyqqhREsa6iBUAjIsKDggKdhncnF7rv/gf+gNBVjYESxiRZt3nThgcfethkMiF83elITavic6pVVfWnH9cwRgRRHjKkmsuZTKas7CwACAoKbNeu3bVAUVxcHN8Wz5+/YLFYa3ld+Z8IMMI6SdMrSlVpQ71GITN6SBEG+5nS0m9TQdsQmZAxMEqVG89XrstAIg59pg8K0RHfB4ARUYicECLF+gNG1fWK/wR5BSGE0KZNmxkldbd/PumJiYnOEC8OoaysrAcfmlZYkO8FQk6v1B8NY48chjFCiCTrNm5YN/vZ59n1F+vQtCZEPo2//PLrzp07uFNo2LBh/ClVVabc3DwACAsLCwoKuhbvYjQaY2KiuYJdXFx0JYoYAwDldEnVgjRgoO8VBSLyNWRBQMSi6G+MCbq7IwAUfXnUnl3JNAJjjCFgGDGErgg1gFrxEIghYAIQhRZ9ephU2g19o4OndCI2hQnIpwFgoCrVdo/Aesmy5pxtzyXnG127xu1OR44eXbt2LcKi22g6AOjbpzfHjzMd4/kXXjpz+pQXCHEhQVVsisP6x0exqYrNiwuLUipKmvnzvl606LtaJa/+lxr3rRUUFPzr36+pisIYPPrIw/7+/qqqAkBRUXUpkpiYGG4Eb/Km1+tbtGgBAFar9fLlQudC10SjCsj6e1bxkxt0g2L0vaNwkI5YFCTUpxrxQiJaIeLpPoKfxrQ3p3TZSTCIFAAExFQKhAJGSKqpZ+/K9wCYQgEo4vW7DVLVgdzS79PCHu8d9njvsnUZjtyq+t1WCIAxphH0PaOAseKZmw23tdfeGAOU5yM3UvzwtJ076wCKolhaWvrUU8+UlRbXjUlFCBFVCQgMGT16NNREkWCMv/vu+9WrVoqShlKPEFIVGxbkPn1vGDhwYEL7dlqttqSkJDn52M5du7OzLgBgUZLdghYhjBD6179fHzJkcOvWrf/3Ysn5G9lstpmznjh18jgADBw4+P7773Ua4goKCxRF4bzIWbinCTkqH0BYaCi3EJaWllyJIn6dXqQIbIcvGyYnijF+jvRiLIneNnVW7WYNvjPRf0Q8c5CCjw8pZTYhUMOsKiNUDNNjg8QsqlJkBoSwpqY3jKhVBQAxVIdErJZYmU3FRomJuHB+SsBtCZpWAaHTknL+vRMjgWFvFgqGAFQmBGr0vaPUixVKkQUMV7UJiaLopTK1c1VSUlKfe+75fXt3C6KbsG6MMVHJsGFDO3fu5KzhVFxc/MEHHzLGPJwZhRACVbHdeOOg5557dvToUbWMe7m5uYsWfffxJ58VF112G0tOKRVEOfdS1kdzPvns04+vZydS47xDgiBYLJYZM2b99OMqhMWQkOAPP/zAaDRSSrneWV5WzlEUGBAAHoqYXr1Vw9/fHwAcDntFZeUfZPOHBUkvUkZtxy4bp3TU94qsOl6ABJERr8YxQoVwfdQzfZGIy9acKf89EwXIqkXRxgeGP97L2DdaMMrErFhTCwrmHrUcL8RaEQCoRTH0igqf3kPXKRQJ2JFvKll8vOzns0grWM+UFM1PiX5tUNiDScVrzphTCwS9RL2wI4QYIdq4AG18kHnNOVW1gUa4mmkqKyvT6/XclFx7IVW1sqrq3Lmza35Zu3LlqpLiArfUjBCihEiyZtbMGTzPj6/l8hUr09NPeLoFAIhqn/X4k++8/ZafnxGuOOgBYYyio6NffvmfY8aMefChaWmpxzwlZSAsLlmyZMZjj3bs2LFW7trftHG5QBCEvLz8GTNm/PrrLxhLGo08d+7c3r17cf7AxeMqk4n/4R/gDz4HATe0BfDOqWoxW2qhCAAAZIECtp0qAQBjn+jLi9K49gIMefKGULM9/JHuhu6RpMJ++YsjlFAETJMY0uaHW3UdQv6QJruG+w2Jy5j6q/lQHjDwH9k6ft44Kby6bJCuS7j/sFZymz35Hx1EerHwu7SgOzrou4RHzuqVMWMDrRbb3FMDwogoRNclHGFkSy1QQWESBgAGrEFnITHGEBZMJtNdd02WNRpGad27FYdSVFxcUFAATAXAbumYsx3FYX300VlDaorUIISsVuv3Pyz2Ii2oiu3xx5/89NOPq6Mo6pgTuPu1R4/uq1etmDDhtvT0k3UHwBgTRamstHjJkmVvvfWf/4EK9M4J3LFz55NPPM2zZbVa7VdffznxzjtqSa0Wi4VRAgBajfbaoUhTUxXVarO6RRFmkmQ7V0orHfrukThYp9pV5ClvFGPqIJr4oMjpPQGgeMXJygOXsE6iKm3x8gBdhxBgTC2zWc+WaFoGyFFGOca/xYv9z078UYoyxn00gkPIlllOTQ5dYigScfQ/B5iOXa7YdlEtNOd/eij+63Eht3UoXJVe/nsmNkpeguuYKBh6RAKANbWQgQBi42PgVVU9cSK1Hi+IIGKs9VSwjkOoV+++b7zxumtB51279qQkH8NYciv+qYpt4KDB77zzFgLEFWi3w+Ox5O3atfv888/G3zLBZrMhVNuQwCXGNb/8+sILzwcE+P992ZGz/rDFYpkz5+P3P/hvZUU513nmzv3iTnflyoiqcj+HKImuPrqmbbIk8X3ddSn/yNJDGoFpBUex2XayUNchVIo2EpV68RoRlURN76FtHejIN+V/dRRETBWi7RASMLgVMFBKrOce/PXkyKVn7v7Jll0JjBn7RYsR+oBRbbTxQcCgcl/OqXHLTgxffHl+MjBAkhB6XxcmIKwXS387V7krC2vF6Kf6IH+ZEube6o2BUor8JL++0czksJ0tYSBcjUTHCzV6+QiiBJ4P1eIF4Nu1T1i4YF5oaIgrBW/cuFFRbEKdHGmEECGq3uD39ttvGo1G4s5oXkttI4QMHTpk2rRplChuz7NAWDx79sy+/fsAgP4NVSPuUObceNu27aNGjXnllZerqqoAWJ8+/TasX3dnfRX/BCxA01TOdbePCgIHDLpSualZUY3ItIJqUSzJBYJG0HcNJ5QytxE3IlJtqrFXVMR9XQAgf36y6Uwp00uqQqVYf4QRo6x828WyXTlMFqqOFzryqgAhLAo4RO93QzRPPs+fd8ySWaE6aO7nRxyXTcDA2LuFEGlUGThMSu7nR6hVDRzUMuSW9opNYe5jghAhVI7113UItR4vcpRamOBEEWr0FuileRESEEJEJaFh4cuWLu3atSs3hXPTnN1uP3DwoFsZA2PMqDp69OgbBwzwxIXqPogx9tj0R4KCw4iq1C1RJIqiqtj37tlXbQH6u+GHc92srOxnnnn2lgm37tmzCwBhhB+d/thvv/3as2cPjjHvfohr5+xQFYVPK3OLIpAxkzBRiCWtEAD8erWgrDra7YoPAsYYE1H0jF5igNZ8vPDy98eRTiSUgVasTCk4ec/PJ+5cnf3RAUIpoTTy8d7GHlFAmVJqVSyKtm0wIFDLrFUnCkEvMq1gL7aY04sAgRyml1oYiUqRn1S6NbN47VlAKHpWLynCQBTKcG2PE2BQHcTQM1LQCOaUy0q5nWkEpBH+KgpAGFdWVH7+xdyiomLRJZohLy8vI+M8gBs3DqUUYeG2W2/1XY7nkTWJiYk33TSIMeI20xYAjh8/0bhiA3+hCMfxU1FZ+cEHH940eMjHH39kNpkBoHPnritWLPv6qy95sV9PLyXLMqdnVVWuHS9y1KBIcpEsruBFVEBUxpazxUCYX7dIIUhDSO0YAiYgxaoEDW0VNr49MHbp66O2AhPImEPLUWop35tduuVCVVqhISkiYf7NrV+/CcsYMCpcdcpRbJHC9ACgVtiIVeFuU0qoUmwBACRgMUTHGGMYUYBLcw8rZVZj5/DIB7qqdpViRBBc8QFgAvLrHgkAlhNFhDEiItCKfyEpqIQs+nbhtIcf4e4/LjpfyMysrKpCWHDHvpSgoJB+/fpCA8JVqnOKbhzQ3wv2Ms6fN5vNfwudiDN5bmpbsWLl0KHDX3jhuayLFwHAYDTMnv3cps0b7rjj9nqzEg0GAxIEAHCNzWnyZq3uHGlrinTXQpFABUQlbMssd+SbDJ3CxHCDqlKKkKsqolIGRjn2iT5YK5btzi785QwyiKQmdpvJAtMIOFjb6t8Du/xyV9gdiQgjQKjgx/SsOQeYRnCWfaxma/wuyrjzhwm4ujCDXqw4VpD/fRoAxDzcQ9cxRHGorkoawaBSigI0fj2igDHL6WIqYYYRaP7K3RchJMu6tb+uefPNt50em/y8fIfNWjekgMfatW3bJioqsiEoqr6yY8eOgqghdfLVuYGhuLio0sWhcZ2rQAih3Xv2Tphw+92TpyQfPcxfcsyYcZs2bfjwww9aREV5T0bk3/v5+YmCAADlFRVwzQ7hq6ioAAAsSDzXww2KmIiYgJQquzn1smiU9YmhRKUMX8GIVKsScXuHoP6xxKpmfXJIqbIzETuDeqhKsV5K+HR0qxcHSEE6ALBmV5x9aevppzepFoUxUE0OABD8NcDzLwCYiIUgHQAAYUqljeLqspEg49xvU6yZZZpIY8y0HpQx5soSESKESVFGQ0KoI6/KllPBREQFhDTi1ZhnageweWzY03FrhFIsiJ9/MTclJYXnpZWVlQG4sZVV1w+IidW57Gq+t5iYGJ1Ox9wH/2OH3eEpQfB6E+HOnj336KPTx44Zt27dr8AoAPTs1Xvx4h9++eXnAf37OzlVvR0GhwTLkgQA5eXl1wJFfAwcohqNJjAg0PkUFxudLFARUxErNrXq2GVg4JcUQSj9QzVCoDqIHOPXakZvhFHRurMluy4io0wYIwgIBoqBUBr3Yv/wCQnAgNrUS9+mJN+yPGvuYaISKmHVrthyq4CBFKTTtgkihFJgyE82tA8BANXksBWYmYAIAsIYaAVzZnnONykAEHVXp4C+0Q7rHwW3GAbVQYyJYaJRNp8sspfbqSQQASHtVXldawewefzwwDb36YCCIJmqylesWMW/sTscXhY1IMDfGWDfoNH6+fmJoujegIAQodWpoNdn4yzI4XB89vkXQ4cNnz9/Hq9AEh0d88677235ffOUeybzfAfvBTBcW2REhCTLAHD58mXnoUNNqfciRAgpLCgEAJ1OGxoa4sZfhDQiFTABoIDMZ0oAQUD3KByoJbQ62wcJSLWS+PuSjB1ClTJr1ryjBBggYKz6IDxqU/26hEdN7gKMqRbl7L+25y49gSVBjDQwygCQo8RccSw/dHg8loWoKV2Kd2fZym3xD3XTxgUAg8oThZbLJpAFxos8Msb0Yt7Kk5F3dvRPimg1o3fpscvUmXqEgAng1zUcGJhPFStmh+CnQQihRulFfIL0ev3jjz8bHBSsqqp3bnY5//KGDRvPnz8riBoP5wrDrt27LWaL3qD3bii76pX+m7mD+PsKgnDkyNGXX3ll86aNPOTRaDTef/99zzzzdNu2bZww8zEUkMMsODg4MDCgvKw491Ku3W5vHIf33sxmc25eLgDo9frIyD/kcPEKiU5CBBhoBXNGKTE5AnpESREGa04F1ogAQOyqMSGk5X1dAeDS0uOlyfmiXiI1uaUIg+ogfl0jRKPMKABhkbclRk3sBBiAMMCIOsjxJzfk/3om7rFeop8mYnx7bLhNKbVGjGmHEACCy2vSHWaH5P9HtRMkY2uh+cJnB5O+ujl8ZNuwkW3yfjsjGmVGGVCK/OSAni0AgelUERUQIMAiNN5Gx6hOp3vxheeDg4N9ufzixax777t/755dbmMIGEMXLlwoKimOM7TUaDUe0MIAoLKyitbUYGgQO6qqqlRV1b0pijFBEK8FGV29FMeB8dVXX7/6r38XFxUAEoGpw0eM/Nerrw4ceKOrpNfQzv38/GJiYi5mni8pLS0oKGjVqlUT22ARKi+v4MkX4eHhrskXf1R1xJJAJUyAURlb8qssF8rkQK0xMUwhjCAuZUGrh3tqo/ws2RVZ36YwERNwNd8hCkwK1yOMkIBEf03wjS2D+sUE9YkJuiE2qG9MyMA4KdxQnnr57Pt7gQEScPiINtGTOov+GkAo76f03J9PY4NEKLsi/c4oXd54rmhbJpZwm8f7iCF6VWUUI5UwOdwY0DmcKaTyVBGVMQFGBISvwkbHGDObzYRQVVW9O45UVW3VKu4//3ldqzMQd/XoALDZbCkqLAKA4KAgQII7lgUAkJWV1TibUnb2JavVgtzv1lSr1VyjHJurhJDZbJ4xY9aMGY+VlJQAQFho6JyPP1n329qBA2/kc+u7CFfLh6bT6Vq3bg0ApaUl6emnoUkzxnk7c/YMV7oS2rfXaDTu6i5gBFqBAFARKRalMq0AGAR2jySUMREpVjWkf2zLuzoBQOaCo1WZZUgrUOZadpgxAdlLbeaL5aZzpabzpaZzJdWfsyWmjNKKE4WKyQF6KfObY6nPbqw4UaiU29RKuyW74vznB4//Y4uqUIpr1xlmGKl2cmHeEdXsCO7ZIubOjopdBVFQHdSYGCoH68xnS60FJipiCoyJmPOiRks5zrqK3hsvM9ItKSkyMopRxW0BIEKI2WIGgOjoaK1WTwh1Z0wTMs6fz8291CDRjl954sQJojrEOiUjeUmwiIgIHn0MAKLXfd17vi2uL+vRx1FzeBQUFNx99z1ffTVXlDSMqkOHDt+8ecPTTz0py3KDRDi3/XPiBkA2q5mjqMkF0dSUVMVhA4BOnTs52eaVEh1GoBMJMBCQ4lArTxZGIwjoHCH4yUSlSCu0fayXaJDLjuXnrDoJepEAu6LcAGPIKOf8fCpvw1n3mgBjqkUFjcAALv6QmrfurCE+CEuC5VKFNbcKSwKSEaOsTgkDBgapcE927i+n4+7pGv9Qj0sbztmLLRSBf8dwAKhIvWyrsAlakSgUBMSFzz+hcSzxGk6e5p2fbxkfHx8Q4G+zmgDk2nYIUSovL92zZ29CQoLvhYh5oZKdu3Z5URLatWvnPK1Z43mQAMA9m562f61G47a2Kz9+W1EUs9nEj0atd8xFxcX3TLl329YtoqRRFeXpp2e/+ebrBoPR05lCDWVHANCjR3dBlIlaHSzShBlWXOQ+cuQoANNo9N2Skq749Yo/NaKKgCCgIqrKKGWEBXQKkyONNpM9cnS7yCGtGaEZXx+1FFtAFChzE9agKtReYbdXufuYHBQ470LIKDssakny5aKDlywFFqSXmIjdh0rUCI0Z847aiyx+8UGtH+jmcBAcoAnuEQkAlaeLFbtKBEQQowKq1ov+LJXbO+XzpY2ICE9M7ADA3Bm7ARhduWo1Fwt9ARIX0JOTk/fs3uO22jhvSV278vhaAPD38/eCk5xLl5yFONyZEANE0UOaGRJMJlNubq73HHX+k8lkeujBadu2bhFFjSgIn3zy8Zw5HxoMRn5+RFNYpauri3Cl//DhI8XFxU1lpqs5Vqwk+VgKAES1aNG7dy9XlOI6vAgIAJOFygtl9mKzPspPE2kErZjwWG8sCYV7svM2ncMGmTBGEar7YRgxSWAirvMRmIhrLgPKgIkIGyRskEGuAaS7DilClAHSSWWnii4sTgWANvclGRNCKIag7lEAUHGmmMq4etgaXJ05e500hLhv4YYbbnBLx5RSLMjbtm5dt269L6WwnPQ65+NPq6rK61YbRwipqqLRGvgp87xFREa4lRj541JTU8vLyz0Ui4Xg4BCj0Vi34B4P2DNVVaakpHonVk6C/37tjd9++1WUNFhAn3322ZNPPsEdQUIT1cnAGDHGIiMjeR3jS5dy9uzZy1jTqEa8k/37D1zMzASA3r17hoeHu1qDXHkRBq1AECMIqIitpVbThTIA6PRkv/6fjwvpFkmsyunPDzqsKquvVqO7E1MYhdrF6AhjhDEKrP4qPwBIK5z/IbUqo1QTpOv9zvBebw7ThujtxZbKzDIqCQRARQAaEQnXEYqcoLl53FitzqiqbjQojLGqKi++9M/c3FxerdsLOfLQuMWLl6xYvkwQ3WSe82MvunTp4rpZtmkTjwXJbZSDIGoyMy+s/W0dZ1x1wRAQ4N+qVZxbRsr7WLlqNS8r6XbkXKRc88svn332qSBqKCHvv//Bww8/xAfTtI5R/qzRo0chJKiKfe1v6xCCJqyN+suvvyqKDRAeOXJkLdOFi9cVAdKKKiCOIrtVqThdDAAthrRuNSERALJ/PVNw4BI2ygSAYvSnfhCAVjTlV5377hgARNzQMn5iZwCoyii1ltuYhHlYHWhEhK87/wmltE+f3gMGDGBUrbuovPDI6fQTj06fUVpayoHkGj/uPO4XAERR3Lz599mzn6PVFSDcI/fOO2/X6XROs3KXzp39/QOoOyrnbOSdt985d+6cJEm8ugAvzsoD9nQ6HS+r65aRCqJmx45tc+Z8whUbPk5n0T9nwfvXXvuP4nAQ1T5t2rSnnny8cYY4X1QXABg9elRsyziE0ObNv2dmZl69pY6bEHJycn7f/DtCKDo6dnhN1aE6ehFfD63IyZEIoBJakVECAFSljDLF7Dj11SGb2W63Knar4y/4mB0qpRnLj5enFzHGiJ0AQOX5EluVnUqYYCAIQCtcV7zIaQQTRXHaQ1MBYU+HWIqSdv26tRNuvT01NY3HF3H6dp6exJXvb775dvLkyUVFBRhLbvMsiGqPjom7557JrptoXFxc1y5dAIh7JAjy6dOnxt9y688/r+E1VnmME0LVQuAN/foBIE95+wiEl1955bnnXrh48SIfp1PP4fT33Xc/pKYcBUCJHbu8+eZ/XAfW1OIzopRGR0ffPG4sY+xSzsXFi5de/YP4Eixbtjwn5yJjbNzYMa1axdUKSrrSoqURVWAIAyBEJFxyupjYVYFbvRiE9IrWtvDDovCXpa0wwLKABIwQwiICgPLMMrtKkCgzwlQAqhFqzly5jjgSV9xvuWV8/xsG7Nu3W5R0dSUxDqQ9u3eOHDl62rSHJk68Iz4+PiAggIOwqKjoyJGj8xcs/PWXXwCQl0OdGaOPTX8kNibGyYgIoZIkDRs2ZNeu7R4qmFNB1J45fer2OyZ2796tc+fO/v7+IcHBzz//LD9Pe9jQIaFhEcXFRYIg1k2tRRgTlXz44QdLli7r3atnbGwsQujOO+8YPPgmQRCqqqq+XfQdQoAQeuH5Z8PDw/6EfI0Hpt7/w+LFpqqKb75d9OCDD8S4zEbjpMRLl3K/+no+Qshg9H/ooQfB0xnjvFAB1okEI1FEqkUljPq1C0YIMcoQQpJR7vfBKMbgLwy2r/V0RpmxVRA2SHaTQzTIFAHWiki47iQ6zlUMBsOrr7586623qR7McRxIhYUF77zz1qeffd6xY2JMTIwsS5WVpoxz585lZABTsSB7KmyPsaAq1qRuPWbOnOG6xvz/t9464aM5H1dWVmLs1mxNeQTGseQjx5KPAIB/QPATT8ziFXZatW41YsTwZUsXYyzXVX44kERBezk/b+3aS/zLlnEtBw++CQD2799/4sQJxqBb9+4TJ955rQ9c4haa3r17TbrrrgUL5l3MzHj77Xfnzv280ZY6PuC333k388I5ALjrrol9+/ap+xZXSnQidjiI1eTQtwq84cMxvV4bimWhWtNgfyzJX2rxqsYPEjDCqP29SUO+vT20X4zdqjjsKhXQdSjROVd39OhRjz/+OFEdniiJUiqIkihpzWbz4UMHfv5p9YrlyzasX3vu3GmMsSh5LMqBEKJU1WoN7733bnBw8BXmI4wZY127dp1wyy1uFTNXM5QoaWWNXhDEgIAAp1QGANMffVinN1KiIg+HFPKRS7JOqzMKguAsA7ZlyzZVsQHAhAm3uJ4Efo2NOujFF5+PahGDEF64cOGKFSu9m208NVVVBUFYs+aXb75ZiBCOiIx+4YXn3S7BFRKdLsqobWFse3vHztN6+bUMAICyU4XEpob2aMEoQ4Dydl9Mn3dE8pMpoX+i1MSwgBWTI2ZU24Qp3RilSMAVGSW2Emt47+joIa3DerU4vTj15KJkXQs/LF6npQw5//nXv15JTU3bsmWTJOsJUT3ZsgVBQEh0Epzz/BVPPSMERFVee/vtUSNH1JVeOO3Onv302t/WlZeXCYJHLxO3atRYF/4A4aBBg+6+++5vv1ngadhOEyIXQXn/NpstJTUVAAyGgJsGDfpzSh/zDatt27b/evWVmTNnKYoy+9nnWsfH9+ndi6PCRxirqiqKYnLysSeffMphd/C1S2jf3q1wKP7hLAJoP6lLy5Ht/FsGAIC1yHzy68MZq04Sm9Jt9oBO03sDgKCT8g9fshVbRJ3EyJ+kHSGMqEoYZbFj2gMwJODc7Zn7X9psK7HEjmjT5fF+wZ3Cu87o0+a2jkhA1ZwTXaco8vf3/+ab+bfedkfy0cNe6gz7TnAYY2BMVexPPT37hednuy36wwkrKSnprTffmDlzBgiC7+5IZ2HX11/71549e8+dTfepSD8DACgvrzh79iwARESGd+yYyJ94LY6HqUXWXOh95JGHjxw5unDh/Ly8vLvvnrxk8Q833NCP70dejOxOi44oiocPH5l8z705OTkA9N77Hpj+6MOeaipd8XjZT+PfMoA6yIW1pzfeuypl7kGbya6o9NA7O5M/2ssIi+gdPfyHOwM7hTMRiUFawV++1h8xUANaQQ7VD/z85vb3dAWEMn87s+PpdZWXqwiCjF9Ob7p/dercg/YKmyHSqA8zwHXc+OrGxsauWL6sb98bFIcVY+z7WS9uFk8QCFFV1f7U07M/eP/dmsryyNOjH3ts+lNPPaMqdoAG6CcchLGxsd9+uzAqKlpxWHkFWa8gYgBQWFhQUVEJAO3atQ0PD+fWP3wNmjvmjARB+O9/3x8xcjQwknnhwu133PnDD4v5SQLcu1U3yNh5RjVCaPmKlbfddvv5jHMAdMSIUZ98/JEgiJ6m9wqJjhEGGM6vO7P5kTWyn0YM1BKVAQIQ8JGP99mq7H1fuimyT8yQueN3PLO+9HSxZLi2HAlhpFpV2U/u/87I+JsTACB9edr+f2+niop1kkoZCtBYquy7XvrdVm7r849BjDIsXNfFqWvkjTa//PLzrFlP/PjjKgAsyRrvBYY87b6qw2ow+r/++mvPzn4GvNbUdX7/3w/e02g177/3PgCVZJ2XouR1hz2g/w3Lli19+OFHMjLOYkHmIbnu72UAAIWFRQ6HHQAkSebhodei6q8oCq1atZJlue6uERgYuGTJDw8+OG3db79ezs9/YOpDv/22btbjMwf07+/JTkgpPXDw4BdfzF2xcjVRHAB01Kgx3323KDg42IuhT6w91wjCuka2urlDzu4s1UpEjcAYAwSgk1MWJFtKbYP+Myykc8SwryfseG7j5UO5Es/2uUYQsqmGCMNN74+Kvak1MDj29aHDH+5lDLAsqpQhjKhCiYNE9I9tMTAOIQT1IQgBODcw1+VHCLFGBRS73Q6dUpB77o8xpTQiImLp0sVz5974zrvvFhbkAwiSLHunaVTTeE4uAPQfcOM7b789aNBAfot3AuU3ipL03rvvdEtKev2N/5w5fQoAEJZ4pBzzOhV82DfdNGjz5o0vv/zqqtWrFYeVV993lQ/5bPCRWK1WVSWipNmyZWuv3n2vBW8nqhIcErpt6+8JCbU1Fj7gsNDQpUsWv/Lqq1/O/VJVHStXLv9t3fp+/foOGjSwb58+ca3i9DodANjs9uys7EOHD+/cufPAgYNVleUAIAjSo9Nnvv32m4EBAd5t5WJd+S6wTfCYBbee+enU0XmHS84Ui1oRi5gxhgzSyZ9O2q2OIW+NCIwPHv75zduf35S966JslBltYr0RC8hhUQJaBQ797+io3jFUpQc/3nfki4NYwkjAFAHDoJgdhnBDtylJXad21wXrgdXvyyOUmsxmRhxuD20wm80Neg3GwGKxUEoddoub3kxU9Xq8iizLTz/95KhRIz/55NNVq38sLSkEAABBlKTqF+GFSGpeihBC1Ook8I6duj42/dEHH5xqNBp8d4Y4yX3y5LsHD75p0Xffr1q1+tSpdLvN7MtUcLps3br10qWL77//vvnzF+zZu6+wIO8KpVwBAHA4HABgMpn4zKjKNcxdLy0t83KMDaXU39/v008+HjRw4DvvvJucfNRirty29fdtW38XRI1GozEajYDAbDLb7Xa+N/GWlNTjH/94cdKku8AludDjxHpIeEYAYCowpX6XnLY0zVpqlQzVS6uYHTE3tBz5weiA2ABrqXXXq1vO/JIu+2kYY03ljMUCcpgcYZ0jhn0wOqxTuGpTd721I21xqqCpNrsrVhWLqP2YhF6P9Q7rGF5t+/Ya+8MnIj09ffazz9tstrq8iBA1wD9g4cL5oaGh9Qoe/AJ+hEHmxUxZvsINysUJjUbz3rtvJyUleVoD19JQp06d+uWXX9et25Cenl5aWuSBOcuxMdF9+/aZcOstY0aP5jm5jfMnOu8ymUzJyceOHUtJP51+6VJuVVUVr0fZpk38Z59+4ufnV3cqXJ949uzZI0eTjx8/fuH8hZLSUpvVhgUsisLTTz11yy3jt23b/p8332ryeLkreZEaEBj42acfx8bGelo1J6MuLy//8aefly1bnpycXFZa7LbPwKCQbklJkyfffeedd3CfAfgQaYE8ybWMVdNl/rG8A18cvLAjkzEmaUVAyF5lj+oWNeaD0aHtQx1V9p1vbD+58riol+Dqz4NEgDBymBzRfWJGfDA6qHWQrcK29bVtp34+KellhBFxEOIgkV0i+jzWJ2FcAscPoAZElDDwjHYEqOHWPc8CmE+2QleTkaIq6SfTj584kZGRkZuXX15eTgjRarWhoSFxLePaJ7TrlpQUExNT98bGaRR1vYeuMUc+4vCKLxnlZ0LXOzlN7B7ybZ75wCilx44dO5p87MzpM9k5OZWVlYwxPz+/lrGx7RPa9+rZs3v3brx4UwOYfD2ZIQwQRpSw9LXpB74+fPlUoaQVBY3oqLKHtA0e/+HYqK6RxEF2v7cr+ZujokYEfvrSVehC9ip7/JD4ke+PNkYazUXm9f/YdO738xp/DSXUYVb8I4097+/e/Z4kXZDOFxb0d2nO4u6+UH8TRnM6NbHGdcitC9yudf1PcrV3uI5doS4Tc1bJ85Vu690tnJRqKjQd+SHl6LJUc7FF46dRrapflN/N74yMvzGOqvTAFwf2f3YACwgJuBH2BoQAEFLMjg63dBj++nBdsK4su3ztS5uy9+fIfhqH2SFIuOOYhBum9w7vEHY1+PH+vo2gJO/FuxtH005DguuXHGbX1PfvfJernAdXf/Gf40Jo3CS7gt+5IzSCw/vmfXMR8PKOX979xcEz2y/w+/RBuvH/Gd5hZFsAODT/8M4P9zAGgtgwICEEDJBqVbpO7Dz830Nlg1x4pvjnFzbmHS8QNaJqU2O6Rd34WO/EUe0aIcI1t+ZWL/ivkpxQw4pmMOBHQpxYf2bPgiOXjhdghLT+mtH/uKnnxM4AkLrq+O9v7lAsiiALPgKJG46Ig/R9uNdNsweIGjH7WN7PL20uyihhAIEt/Prd263X3V11AVpXMDe35nb9tAYnpjtFKXOpdd/3yQeXp1VcNmkM8pgXBg54oAcApG84u+7l322VdlEr1guk6iO4CRv4xA2DnugHAOf2Zv34j83FmWW6QG2XUe0Gz+gT3iYEACihPuLHXamdppcQ6u22STJbvPTs+3s1lQbl1sfqdPY3uXTd5K9wHaGoFpbyThVuX3A4dcM5xaaMfX7gkGm9RI14YU/Wmhc3VRaYJJ3oJbgBYURUijEa8eKgvg90B4Djm8+teGlTVYkl4ca4IQ/3ThwSz+VJ+H/DfpzE2rjKht7NANyK0CBLgDPwzPtd3GPj44Cddef+Z05BR1eTelEt4DGWtunclnmHzx++9Ng3t3cZ3hYhlH0076cXN5ZcKJMNPAC8dsMCUu1E1ktjXx3S/Y5OwKC80PTezd8LAhr+aJ++Ezvr/DSMAaOUQcPCRmpphw0NJfbRYOWhmOMfnTQUAzXVPK64y+Fw1HIpUkplWeY1rH3suRaxun2QpyE5783Pz09NTT137lxRUZHVasUY6/X6mJiYhISEpKQkPz8/8MH4XstKRgjh/lnvyyGKYq0An/8dFP3BlBACBJZK24ntmfHdo0JbBlJCsYALzhavnL0hL71Qc2W4HQPAAlJsqi5Ae9tbIzuNbMs5m8OipG7JaNklMqJ1EACoiipK4qxZs3bs2MFPYvSFXAghiYmJq1atghpH2/jx48vKynyMYhZFUVGUqVOnPv/8826zMvmXL7/88po1ayRJ4qWqajV+AOu4cePef/99H30OzmdVVlbu2bNn586dx48fz8vLM5vNiqI4Ry6Kot1u/+c//zlu3LixY8d6Kn9Vq2m1Wn9//9atW/ft23fIkCHt2rXzheKdQ/rxxx+//fbbvXv38rKgdVtMTMyIESOmTZs2YMAA8OxmcRqUz507t3Tp0p07dxYUFHiPFxFF0eFwTJ48+f3337+uDzVjTdEooW6/Kcku/3LS8udaf/BKl09e7vgx/7zS+ZMX23749sB55/ZmMcaIu3spZbwkzfDhwxv6RmFhYXxtGGPnzp1rxJzMmjWLMcbJ94qBUUopdTgc8fHx9XYSGxtrs9mcEprHqas56zIjI2P27NktW7ast+fXX3/9xIkTjVturVY7YcKE33//3VkUxe2o+OSnpaUNHjzYdZMSr2y10nWmTZvGi3LV7Za/o8Ph+Mc//mE0Ghs05vvvv985pOuzNY1gijBiDCj5Q3biprzg2IB7Pr05YUi82eSgAiIIqIAsFiWoVdA9n97ctn9LSpjr+SWUMM6XnEuj0WgwxpIk+RIhzwPv7Xa78+geXtrP94B8WZb54zztOAihM2fOZGdne+mTV/DIy8s7efKkdx3ama/y9ttv9+jR46OPPsrOzubE6rZ/Pjyn2On7ewmCwPu02Wy//PLLiBEjJk2alJ+fz7m3Wy60fv36gQMHckGAo4UXKHdtHC08GwdjvHDhwsGDB2dlZdWqrecs7Dh+/Ph33nnHZDJ5ekG373v9n6vZZOodQoCFKyQEDiT/cMOUOeO63dLBbHYQjMwWpUWXiPu/GB/XLYoRhq8sk4CdaXZXaqINaiaTiVdSB4CCggLXLd/H5onuOWXs3buXC3KebucqEyFkz5494DkvjSOhqqpqwoQJL7/8cmVlJc/b4cTqNgHG2X9D34gQwvt07ikrV67s37//kSNHeIKD6zsKgrB79+7bbrutoqJCFEUnWryIM/x8AEmSUlJSxowZw+ffWU+Lj3bSpEmbNm2SZZnXvvPygm6Xg13H56VfWyMJB5LOX3P3u6P6T+lmqrK36Rc79YvxUe1DKWVNXmnEWcPaiaLCwkJounrNfI/YuXNnvbZXvuT8Si+hqBaLZezYsWvXruW14NzWVfRkh2j0FHHylSTp4sWLo0aNOn36tJN18G7Ly8vvu+8+h8PBFTzfO1cURZKk9PT0WbNmOfvkatLChQvXr18vSZLD4bie8XA9oqhG2GOyVpr476FPLZ300GfjQ6IDGGUYX6s4X86CnJalJoSoIAhWq/XAgQNQX+YzJ5SDBw+aTCa3NgBOW1OnTt2zZ48kSa4mBF9QdPWvoyiKKIqlpaX33HMPP3XPGaH35ptvZmVl+WjRcdvtihUrNmzYwEGIMbZare+9956n+qnNKPKZshlgASfc0NIYpLum8QccRZcvX3ZKdE2IIgA4deoUL1/onZS5wpObm5uWllZXGuGKx1dffbVq1SoOoYbaxJvEC8kLdBw7dmzevHkYY17cIysr66uvvnKrL/k+UQihN954w2kG3LZt24ULF+qdtGYU1UvdAAy4sepP8EM7UcR5UZOIEJwC9uzZ46OzhV+ze/fuWtyD7/eXL1/+5z//2ThibUJa5IQ+Z84ci8XCJc/FixebzWYfbeieTOQAcODAgYMHD/JJ2Lp1698l7vv6RhEAIMAY/TmhHBxFjLGioqKm5XJc1fGdd9VVjfg+MmfOnLKyMl/OifBEpk2IoszMzN27d3MBbPXq1Vd/YAkHz+rVq/k/T5069eeU0fp/gKI/pfGl4kYFu93uaiy6eqXIZDIdOnTIR27Arzly5AhHi9PQJAhCSUnJN99847uEwzdyTyVvvFNzvWyTB2ps374dANLT00+ePMkVJO/deh8Gv33btm0c8KWlpY3YsxqXpNCMoiZrXB0ym83FxcVNgiJOFmlpabm5uT5Sf/UBckVFx44dc/bAqWrdunXFxcW+MCKhpnac0+FLKeXGAB+5Vr2Mi3MJrr8dPnxYURS3h+e50je38nmP9AGA06dPZ2VlQQNjSZ2v7Oq9bUbRX8CLSkpKFEWprKysqqpqwm65kuO7E5Bv2Lt27XL2wL/59ddffdllOb0yxkJDQ+Pi4uLj49u1axcfHx8REeHdAM2f0r59+59++mnmzJm+PCsvLw8Ajh49Cj4Y8UeMGJGUlORFxeU7iM1m4+DU6/UNklcZY5IkybKs1WpFUfTkBL9+mvj3BQxCSK/Xm83muuReXl5uNpsrKipsNltdXuT2xobiwXfs8bu4UIcxNplMBw4ccNbj9aKDMcYmTpw4bdq0Dh06GAwGqebkvMDAwF0eDnV1vT0kJOS2227jztMlS5Z4qlXN+zSbzZRSHjDl6QV5D6NGjdq4cWNubm6/fv1yc3M9cVT+/alTp2699dYWLVr4wpE4C3r44YenTJni7+/Pdyu+ibjN9G7mRU3QBEHgh3jWXZ7KykqTycTjgNxK8FFRUQ1iRBjjsrKyI0eONAhFnLyOHTtWUFDgpLb09PS8vDzvGjyH3EcffbRy5cqRI0dGRUX5+flpNBqdTucsJO/L061WK6X01ltvrfdiSZLMZvPFixe9vCD//uGHH2aMRUdHT5gwod4zIDIyMgCge/fuvqwmY6xfv37z588fPHhwUlJSly5dunTpklRTsOV6VpD+xihCCEVERNRdaU6gxcXF3EBXd/YFQQgPD2+oUpSSklJYWNggqxonsvLyci4pcVZw+vRp78THt/yZM2c+88wzJpOJxxBwCUeSJC7e+EJSCCGNRsMY48DznvMXFBRks9m8GGO4NijLcufOnfk1vXr1qhdyXEEdMmQIf6l6h80X1GQyucYuNfr0oWYU+UTckZGRdTd1PuMlJSXctFB35bRabVhYmO/bWy3BrGHzizHU2Ls5/LjU5KUUMCEkMDDwxRdf5GW0NBpNrcBN33cZHsqZmppa78jbtGnjcDgqKiq8S4lhYWERERF8q4qLi6vXXFlcXMwL7fOkCS9j4OaK3bt3X7x4kQd9OyPHr39H098bRREREXXFZWcQUN3ABf6TTqdrEIoapxTVNUvwKme5ubn1Pmvw4MEtW7aklPJbGtdUVbVarYcOHfryyy+9RN/wSejVq5fNZuPXeHnH4OBgo9HILwgNDfUilzrVLYfDIYris88+693hzn8tLS299dZb09PTJUnyHgLbjKKmEecYY2FhYVqt1u0FOTk5HEV1V8LPzy8oKAh8rq+AMS4sLExOToaGxw04TeQ5OTkcEt6N73xIN9xww9VoAhwMqampiYmJ/fv3z8vL82Iv5oLWyJEjuTjnvV4+N3LwbwwGA598L+O0Wq3c2j5+/Pg777yTxxx5mSuMcWpqav/+/b/99ltnOkYziq5tCwoK4rnKdRcyNzfXEy/iG2qDYHD06NHy8nIvcTHebb5ms5m7azlh1fu4tm3bXr0+7XA4srKyvGsjTp2+Q4cOXsQ5V2HYuQVwVa3eMfCAVELIF1980b59ex6t5+X1BUEoLy9/6KGHJk+e7KNXrRlFjedFHEX+/v5uZYmLFy8644A8ocj3Wj/1KkXeDW7gEjrk3Q3K+2loNqiXR3sRupx+pFdeecVHNuvKSSRJ8sJY+EM5ijhLCQ8PX716dUREBD903Qsj5UlQy5cvHzRo0IULF65/IP29eZHRaAwJCamFByeKPEl0ERERvlfDcA0q9QKVDh06eMKkM4yV46fe81Gg6eJNvWci8TjuZ599duzYsRwVvvA35yCdBkPvA+DvIkmS3W7v0qXL2rVrIyMjvXMk7kzjqUrjxo0rKiq6+tC+ZhR5EzDq2gn4dGdmZtYN6OaXRUZG+ujC4yqvM8HBE3GLojh16lRPnhxnSsWFCxd8JFbvUl9TsSlCyIMPPvjee+9x37Qvc1KLkdbLzF0j7jQajc1m692796ZNmxITE+utRsJz/k6fPj1t2rRmFF1DiU6j0XAPQ10UmUwmThx1W1RUlO+V0wDg8OHDVVVVbpUi/tzAwMCbb77Zk92PR6Da7fb9+/c7VQvv4p93e8DVN54lPnXq1G+++YYHzgGAL/yZRx7xd+RZ6N4XSJIk16nmQOrateuWLVt69erlC5BEUVy7du2aNWuuJuWpGUX1YKmhUQgcRT6KTPUmfvMvW7dunZiYyCtUub2Mk9SOHTsAoK4IWrelpqb+Ca56bk5wxn3zaDfvlmubzcb1HACw2+2e9iln0+l0ruBECGm1WrvdHhkZuX79+j59+vDTGeoVBz7++GO4jsMX/j+iKDIy0kcU8T3bi1LE17Vr166MsaSkJE8r7VSNACA2NrZe7rd169a6R5U1YeNP2bhxY3Z2tjM8zxfLNQ9N5BdUVFTwWEQvg9Tr9VzQde1To9EoihIWFrZs2bJ6z1zjqt2hQ4cuXrx47Sbk/zWKGGMcRT5OLr8sPDzcxwQhhFBWVhYviOX2Ft7h0KFDBUEYNmyYp8v4l+fPn7906VLHjh29DJibei9cuLB06VKMceNqfXCibNmypSe+56whsWnTJufw/Pz8uNvAy9QVFRXx2o6MsUuXLnmJzXFGxPLYn1oF3GRZtlgs8fHxU6ZM8Z477Byqd9W0GUWNb4QQHhHny+RyDVWSpODgYF8kbGcFEpvN5inlhvfz0UcfjRgx4o033vAyEs7Wdu7c2aVLF+8D5qT50ksvnThxQqPRcDOxL4W+alFw27Zt6427+emnn6Am+DUgICAwMNATL3I6vs6ePcuFOp435V0ec0oKqE7jAiTHuS+v4z3evBlFTYAi38s5GI3G4OBgXwpEuSpF3js/evToli1bnH5VL6SwadOmNm3aeBdj+G5dVFQ0dOjQ+fPn81RZZ+M163w5y0wURW7C9iLU7d69Oycnh7MLrVbLpU1PA+OAWbp0Kff2LFu2zMt2wDvhRWRVVTVf2aqqqrKysr799tvPP/8cfMuBb8Lk/yZv4t8dRcHBwQaDwZdkIU58ISEhsiz76GEkhOzdu7deXud0bnrnMJxqRVHs06fPhg0bvBidOMaKiooeffTRV199tV27dn5+flzYs9vtkyZN4vHU3pvVah02bJhWq+WaTC3gcUnJbDavX79++vTpPDanXbt227Zt84QizoIWLVpkNBqzsrKOHz/uJUKHP45bXA4ePHjvvfe6lo8khJSUlDiNE75wGIvF0oyia4UiHhRnNpt93KG5PdpHFJ05c+bMmTP1LrOPCeRcy8rIyLjzzjvXr1/vy/UY47phtQkJCf3796/3iTabrU2bNn369Nm1a5cXxP7000/Tp0/nfKZHjx7eX5b7Qz/55BPnruRpqrkVu1OnThwAOTk5nqRcH4U0g8Fw3dLh31ui49szP7PeR/Hadz0KAPbv38/Te5qq/gljbMuWLRMmTDAYDPWWleMky8NheONZEnq93nfcjhs3zjv49+zZk5WVxe3RPXv29JQSW2t/qbc2AwC0bt2a8yK+HfAcB2dz5sP7OIHR0dHNKLpWKAIATxmvbhvPXvax+aIUNQhIXDUKDg7miaK+OH85llybj5TH2cuoUaN4loEnS53FYtmwYQMAKIrSuXPnhISEem0GvMp2vSLu4MGDnUY/34uhe1rlDh06wPXqMvrbW7qhJkHSx/nlkPOlW6vVum/fPmg66yrv9vDhwxaL5aWXXuIneTWCLHzkjVzi6tixI0/YrtdSx7NiJ0yYAFdd2ZyD5I477rj6SeOqV1hYWLdu3aDpSq43o6h289HxyinPF17EYXP69Onz5883YYoLx0xeXt6RI0e6dOny2GOPNa4oh4/nqPKRS5LEhTov7uC9e/devHhRlmXG2D333KPRaK6miDEHeefOnQcPHtzQ4sluewOA0aNHh4aGOsMmmlF0rVBU7/bsO+PiV+7bt6/eQC+3p+7USxP79+9njL3++utdu3b1nrjmRevwXagbPXq0J+tCLaHObrd37tx54sSJV1Nzh/PA2bNna7Xaq9yAeFcYY34uW3ME0DVpzhht38Vrbl3wJT2Bh73V22fdVi8+d+3ahRAKCAhYsWJFVFRUQ4Hku7WDa/BJSUmdOnXyXjKFC3XcuP/aa69xx3QjxCd+3tHgwYOnTJnSiA2ibm+EkEceeaRv377ekyn+2ib+z6DIO/nyXc1gMPgSDMqTF7ycsMJ7CwwMnDNnjtFodG7zvJTh7Nmz+Rl+bg9cAYAjR46Ul5cbjcYOHTqsW7fujjvuyMzMdJqtmpAXcUuARqMZO3bs8ePH3aa7OYW6zMzM1q1b2+32Nm3afPnll5MmTeK2Nd/5CT//IjIycsGCBaIoXo1hk5/PpyhKr1693nvvPWfgeTOKGj+hdat7un4ZEhLC188LeTlTGAICAurtVqvVnj9/nhcTditIcNpKTEycOnVq3WctWrRo+/btXsodFhYWHjt2bMiQIRaLpXv37jt37nzhhReWL1/u3ICd8WZup4KzCC8VT11/4hePHTuWH9Vc6xb+FFEUrVbrhg0bZs6cyR27d911V15e3jPPPMPH453HOoekKApPaG3Tpg3PDnJuCr4X3ea7iaqqiqL07t37p59+4vVSrudKQNe7ROd6tm7d03b5NSEhIdwlV+8ptoGBgc4Mcy/dyrK8e/duvnJu++G3d+vWjVJqNpvtNY1XGO3Zs6frYYy1muvZE7Is2+32qKiopUuXrlmzZuDAgVBjR3Z7pjL/0lk51dO5y87vocaz2atXr7Zt2zoPzKuFUv7Hjz/+yIlYkiSbzfb000//+OOPbdu25adN8q6chyK7/u20xQ8fPnz79u0DBgyw2+21khHrPSXa2Xjakk6ne+KJJzZu3NiiRYurrIXUzIvAuVS1RB2+0/P9yc/PLzIykp9a52nL5D9FR0dz96KTCGrtjvwbQggP1al1hrarZoIQ6tu3L8ZYo9E415g7Fvv168f/8HIvPweJ14sjhNhstgkTJowePfrAgQPbt28/dOjQhQsXioqKbDYbT9J2vZcP0ktAHe+Tj4rv63q9fvz48Z9++qkgCNxu5gohPrd79+49d+5cu3btePVGm812++23Dxw4cOHChd9//316eronaVOn0/Xp02fmzJm33XYbZ2W1Ev68j9a1BQcHJyQkDB48+LbbbuvevTsv2+B7ev9fJi5dz4m4hJDc3NzKykpPtNKiRQt/f39CSE5OjsViqTcCyN/fPzo6GiFUUlJSWFjoSeIKCgqy2+0Wi8WLGIMxjo2NNRqNtSQNSqnFYsnKyvJ+r1arbdWqlVPWp5TyQyl5hg+ltLKysrS01OFw1DIWY4zDwsL0en12drb3St8Gg6Fly5ZOXlFRUZGfn+/kcrU4A7+rffv2wcHBzvqyDocDISTLcnl5+cmTJ0+cOHH+/Pn8/PyKigqMcXBwcMuWLdu1a9e1a9f27dvzPFZexrUWF6qqqrp06ZIvKl9AQEBkZCQPdORovP4PGL/eUcS5jafcac5enMbQepVgpyDE//DkCHL+6j1nm9uO6zIcTqC1Du52q7fUTc7hh3Xz6ATOptxqblAT+uT7I/iVdbnBFWfCu+OchBBFUTDGrgyhlq7Ij4RBCEmS5FZ74cPwMaeLh9t7EQSaUdQYIHmJvXcSsY9xMTwmzXu3To28XqOfp1MWa6lt3kfiRRv0sn1whDToEc5X9hJC6pZwneqKq7rlOglcTfJe99THkJ+/1+FffxsUNbfr0N7TOJv7/3BrRlFza25X23DzFDS35taMoubW3P7i9n/5BN/muY9qdgAAAABJRU5ErkJggg==';
const ICON = {
  image: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  clock: '<svg class="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8M8 9h2"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  bug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7.5V6a3 3 0 0 1 6 0v1.5"/><rect x="7" y="7.5" width="10" height="12.5" rx="5"/><path d="M12 11v9M3.5 13H7M17 13h3.5M4.5 8l2.6 1.8M19.5 8l-2.6 1.8M4.5 19.5l2.8-2M19.5 19.5l-2.8-2"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/></svg>',
  fsIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  fsOut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
  undo: '<svg class="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
  redo: '<svg class="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/></svg>',
  lvup: '<svg class="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5M5 11l7-7 7 7"/></svg>',
  hpDmg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M12.5 7.5 10.5 11l3 2-2 3.5"/></svg>',
  hpHeal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M12 9.5v6M9 12.5h6"/></svg>',
  hpTemp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="M12 9v6M9 12h6"/></svg>',
  desk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16v4"/></svg>',
  hourglass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
};
// Toolbar buttons are generated straight into the user's saved order, so there is no default order to flash back to.
function toolbarHTML() {
  const items = {
    undo: `<button class="tbtn" data-zi="undo" data-act="undo" id="undoBtn" title="Undo (Ctrl+Z)">${ICON.undo}<span class="tl"> Undo</span></button>`,
    redo: `<button class="tbtn" data-zi="redo" data-act="redo" id="redoBtn" title="Redo (Ctrl+Y)">${ICON.redo}<span class="tl"> Redo</span></button>`,
    history: `<button class="tbtn" data-zi="history" data-act="history" title="See every change and roll back by time">${ICON.clock}<span class="tl">History</span></button>`,
    edit: `<button class="tbtn${UI.editLayout ? ' on' : ''}" data-zi="edit" data-act="editlayout" title="Rearrange, hide and move panels and tabs">${UI.editLayout ? '✓<span class="tl"> Done' + (isMobile() ? '' : ' editing') + '</span>' : '✥<span class="tl"> ' + (isMobile() ? 'Layout' : 'Edit layout') + '</span>'}</button>`,
    settings: `<button class="tbtn" data-zi="settings" data-act="settings" title="Settings">${ICON.gear}<span class="tl">Settings</span></button>`,
    save: `<div class="savegrp" data-zi="save"><span class="save-state${/synced|view only/i.test(UI.saveState || '') ? ' live' : ''}" id="saveState" title="${esc(UI.saveState || 'Auto-saves')}">${syncHTML(UI.saveState || 'Auto-saves')}</span></div>`,
    rolllog: `<button class="devbtn logbtn" data-zi="rolllog" data-act="rolllog" title="Log — every roll, plus everything else that popped up" aria-label="Log">${ICON.log}</button>`,
    // (on a phone it sits next to Log; on a computer, after the layout switch)
    ...(isMobile() && window.SHEET_PAGES ? { bug: `<button class="devbtn bugbtn" data-zi="bug" data-act="bugreport" title="Report a bug" aria-label="Report a bug">${ICON.bug}</button>` } : {}),
    device: `<button class="devbtn" data-zi="device" data-act="layout" title="${isMobile() ? 'Switch to desktop layout' : 'Switch to phone layout'}" aria-label="${isMobile() ? 'Desktop layout' : 'Phone layout'}">${isMobile() ? ICON.desk : ICON.phone}</button>`,
    ...(!isMobile() && window.SHEET_PAGES ? { bug: `<button class="devbtn bugbtn" data-zi="bug" data-act="bugreport" title="Report a bug" aria-label="Report a bug">${ICON.bug}</button>` } : {}),
    fullscreen: false ? `<button class="devbtn fsbtn" data-zi="fullscreen" data-act="fullscreen" title="${fsOn() ? 'Exit full screen' : 'Full screen'}" aria-label="${fsOn() ? 'Exit full screen' : 'Full screen'}">${fsOn() ? ICON.fsOut : ICON.fsIn}</button>` : '',
  };
  document.documentElement.classList.toggle('hasbug', !!items.bug); // (on a phone the corner buttons make room for it)
  if (isMobile()) { delete items.edit; if (UI.editLayout) { UI.editLayout = false; document.body.classList.remove('editing'); const eb = $('#editbar'); if (eb) eb.remove(); } }  // no layout editing on phones
  return zoneOrder('toolbar', Object.keys(items)).map(k => items[k]).join('');
}
// Saved order for a zone, with any ids the user hasn't placed yet kept in their default spot.
function zoneOrder(zone, ids) {
  const saved = ((S.layout || {}).zones || {})[zone] || [], out = saved.filter(id => ids.includes(id));
  ids.forEach((id, i) => { if (out.includes(id)) return; const prev = ids.slice(0, i).reverse().find(x => out.includes(x)); out.splice(prev ? out.indexOf(prev) + 1 : 0, 0, id); });
  return out;
}
function renderHeader() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const pic = S.portrait || PLACEHOLDER, xp = ST('advancement') === 'xp';
  const idf = [ST('showPlayer') ? (window.SHEET_PAGES ? `<div class="fld"><span class="lbl">Player</span><span class="identtxt" title="Comes from the player list on your party page">${esc(S.player || '—')}</span></div>` : fld('Player', inp('player', { fit: 8, ph: 'Player' }))) : '', ST('showRace') ? `<div class="fld"><span class="lbl">Race</span><span class="identtxt" title="Change your race in Settings">${esc(S.raceName || '—')}</span></div>` : '', ST('showBackground') ? `<div class="fld"><span class="lbl">Background</span><span class="identtxt" title="Change your background in Settings">${esc(S.backgroundName || '—')}</span></div>` : '',
    ST('showAlignment') ? fld('Alignment', sel('alignment', [['', '—']].concat(DND.alignments.map(a => [a, a])))) : '', ST('showFaith') ? fld('Faith', inp('faith', { ph: '—', fit: 8 })) : ''].join('');
  $('#sec-header').innerHTML = `
  <div class="banner-row"><div class="portrait-wrap"><img id="portraitImg" src="${esc(pic)}" alt="Portrait">
    <label class="portrait-edit" tabindex="0" data-act="portrait">Change portrait</label></div>${inspHTML()}</div>
  <div class="ident">
    <div class="ident-top">
      <img class="mini-portrait" src="${esc(pic)}" alt="" data-act="portrait">
      <div class="namebox">${ST('showName') ? inp('name', { cls: 'name', label: 'Character name', ph: 'Character name', fit: 10 }) : ''}
        <div class="subtitle" data-calc="subtitle"></div></div>
      <div class="lvlbox${xpReady() ? ' ready' : ''}" id="lvlbox">
        <div class="lvlnum"><span class="lbl">Level</span><b data-calc="lvl"></b></div>
        <div class="lvlright">${(() => { const n = owedChoices().length; return n ? `<button class="btn gold lvbtn owed" data-act="pending" title="Choices from leveling up that still need picking">⚠ ${n} Unfinished choice${n === 1 ? '' : 's'}</button>` : `<button class="btn gold lvbtn" data-act="levelup" ${totalLevel() >= 20 ? 'disabled' : ''}>${ICON.lvup} Level Up</button>`; })()}
          ${xp ? `<div class="xprow"><span class="lbl">XP</span>${inp('xp', { num: 1, cls: 'xpin', label: 'Experience points' })}<span class="xpof" data-calc="xpnext"></span>
            <input class="f xpadd" id="xpAdd" type="number" inputmode="numeric" placeholder="+ award" aria-label="Award XP"><button class="btn sm" data-act="addxp">Add</button></div><div class="xpbar" data-calc-html="xpbar"></div>` : '<span class="hint mile">Milestone leveling</span>'}</div>
      </div>
      <div class="toolbar" data-ordered data-zone="toolbar">${toolbarHTML()}</div>${inspHTML(true)}
    </div>
    <div class="ident-grid">${idf}</div>
  </div>`;
}

function renderVitals() {
  const f = S.form;
  $('#sec-vitals').dataset.zone = 'vitals'; $('#sec-vitals').dataset.axis = 'x';
  // One-time move of the d20 rolls tile to just left of Conditions in a layout that was saved before.
  const vz = ((S.layout || {}).zones || {}).vitals; if (Array.isArray(vz) && !S.layout.advMoved) { const a = vz.indexOf('advdis'), c = vz.indexOf('conds'); if (a > -1 && c > -1 && a !== c - 1) { vz.splice(a, 1); vz.splice(vz.indexOf('conds'), 0, 'advdis'); } S.layout.advMoved = true; }
  const strip = `<button class="mstrip" data-act="gocore" aria-label="Hit points and armor class — open Core"><span class="ms-hp">♥ <b data-calc="mhp"></b></span><span>AC <b data-calc="acv"></b></span><span>Init <b data-calc="init"></b></span><span>Speed <b data-calc="speed"></b></span><span class="ms-go">Core ›</span></button>`;
  $('#sec-vitals').innerHTML = `${strip}
  <div class="tile hp" data-zi="hp">
    <span class="lbl">${f ? esc(f.source || 'Form') + ': ' + esc(f.name) : '<span class="ciw">Hit Points' + ciBtn('hp', 'max HP') + '</span>'}</span>
    <div class="hp-wrap">
      <div class="hp-ring"><div class="ring-svg" data-calc-html="hpring"></div>
        <div class="hp-center">${f ? inp('form.hp', { num: 1, cls: 'cur', label: 'Form HP' }) + `<div class="hp-max">of ${N(f.maxhp)}</div>` : `<div class="curline">` + inp('hp.cur', { num: 1, cls: 'cur', label: 'Current HP' }) + `<span class="tmpbadge" data-calc="tmpb" title="Temporary hit points"></span></div><div class="hp-max">of <span class="maxv" data-calc="hpmaxv"></span></div>`}</div></div>
      <div class="hp-side">
        ${f ? `<div class="formnote">Your HP: <b data-calc="truehp"></b> <button class="btn sm" data-act="endform">Revert</button></div>` : ''}
        <div class="hp-actions"><input class="f" id="hpAmt" type="number" enterkeyhint="done" placeholder="Amount" aria-label="HP amount — press Enter to take damage, Shift+Enter to heal">
          <button class="btn red hpi" data-act="dmg" title="Take damage" aria-label="Take damage">${ICON.hpDmg}</button><button class="btn hpi heal" data-act="heal" title="Heal" aria-label="Heal">${ICON.hpHeal}</button><button class="btn hpi tmpbtn" data-act="tmphp" title="Gain temporary HP (they don't stack — the higher stays). 0 clears them." aria-label="Gain temporary HP">${ICON.hpTemp}</button></div>
        <div class="rest-actions"><button class="btn rest short" data-act="short" title="1 hour: spend Hit Dice, refresh short-rest features and Pact slots"><span class="ri">${ICON.hourglass}</span>Short Rest</button><button class="btn rest long" data-act="long" title="8 hours: full HP, all slots, features and Hit Dice"><span class="ri">${ICON.moon}</span>Long Rest</button></div>
      </div>
    </div>
    ${f ? '' : '<button class="tmanage hpman" data-act="hpmanage">Manage</button>'}
  </div>
  <div class="tile ac" data-zi="ac"><span class="lbl"><span class="ciw top">Armor Class${ciBtn('ac', 'your AC')}</span></span><button class="tmanage" data-act="acmanage">Manage</button><span class="big acv" data-calc="acv"></span><div class="ac-fx" data-calc-html="aceffects"></div></div>
  <div class="tile" data-zi="init"><span class="lbl"><span class="ciw top">Initiative${ciBtn('init', 'initiative')}</span></span>${rollBtn('init', 'Initiative', 'big')}</div>
  <div class="tile" data-zi="speed" data-calc-title="speedtip"><span class="lbl"><span class="ciw top">Speed${ciBtn('speed', 'speed')}</span></span><span class="big" data-calc="speed"></span><span class="sub" data-calc="speedx"></span></div>
  <div class="tile" data-zi="prof"><span class="lbl"><span class="ciw top">Proficiency${ciBtn('prof', 'proficiency')}</span></span><span class="big" data-calc="prof"></span></div>
  <div class="tile" data-zi="passive"><span class="lbl"><span class="ciw top">Passive<br>Perception${ciBtn('passive', 'passive Perception')}</span></span><span class="big" data-calc="passive"></span><span class="sub senses" data-calc="senses"></span>${ravenHas() ? ravenChk(true) : ''}</div>
  <div class="tile" data-zi="hd"><span class="lbl"><span class="ciw top">Hit Dice${ciBtn('hd', 'hit dice')}</span></span><span class="big" data-calc="hd"></span><span class="sub" data-calc="hdpools"></span></div>
  <div class="tile deathtile" data-zi="death"><span class="lbl">Death Saves</span><div class="death" data-calc-html="death"></div></div>
  <div class="tile condtile" data-zi="conds"><div class="tilehead"><span class="lbl">Conditions</span><button class="addc" data-act="conditions">+ Add</button><span class="advbtns" role="group" aria-label="All d20 rolls"><button class="advb adv${S.rollAdv === 'adv' ? ' on' : ''}" data-act="rolladv" data-v="adv" aria-pressed="${S.rollAdv === 'adv'}" title="Advantage on every attack, check and save"><span class="al">Advantage</span><span class="as">Adv</span></button><button class="advb dis${S.rollAdv === 'dis' ? ' on' : ''}" data-act="rolladv" data-v="dis" aria-pressed="${S.rollAdv === 'dis'}" title="Disadvantage on every attack, check and save"><span class="al">Disadvantage</span><span class="as">Dis</span></button></span></div><div class="condchips" data-calc-html="conds"></div></div>
  <div class="tile fxtile" data-zi="effects"><div class="tilehead"><span class="lbl">Active spells &amp; effects</span><button class="addc" data-act="addeffects" title="Spells and effects someone else put on you">+ Add</button><span class="hint" data-calc="concnote"></span></div><div class="fxchips" data-calc-html="fxchips"></div></div>
`;
}

const TABS0 = [['core', 'Core'], ['combat', 'Combat'], ['spells', 'Spells'], ['features', 'Features'], ['inventory', 'Inventory'], ['infusions', 'Infusions'], ['companions', 'Creatures'], ['party', 'Party'], ['story', 'Story'], ['notes', 'Notes']];
function tabOrder() {
  const all = TABS0.concat(ctabs().map(t => [t.key, t.name])), L = (S.layout && S.layout.tabs) || [], keys = all.map(t => t[0]);
  // The Party tab only exists while the character is in a party (not even as a hidden tab in Edit layout), and it's always last.
  const o = L.filter(k => keys.includes(k)).concat(keys.filter(k => !L.includes(k))).map(k => all.find(t => t[0] === k)).filter(t => t[0] !== 'party');
  return ptyOn() ? o.concat([all.find(t => t[0] === 'party')]) : o;
}
// Tabs and panels a character has no use for hide themselves (no spellcasting → no Spells tab or slot panels; no Infuse Item → no Infusions tab).
// Edit layout can still show them: that choice is kept in layout.shownTabs / layout.shown.
const noSpells = () => !casters().length && !(S.spells || []).length && !pact();
const tabAutoHidden = k => (k === 'infusions' && clsLv('artificer') < 2) || (k === 'spells' && noSpells());
// No slots at all (no casting class, pact or stored spells): the Spell Slots panels step aside and Active Spells takes the room.
const noSlots = () => !casters().length && !pact() && ![0, 1, 2, 3, 4, 5, 6, 7, 8].some(k => slotMax(k) > 0) && !(S.spells || []).some(s => s.usesOnly);
const panelAutoHidden = id => (['slots', 'activefx'].includes(id) && noSpells()) || (id === 'slots' && noSlots());
const tabHidden = k => ((S.layout && S.layout.hiddenTabs) || []).includes(k) || (tabAutoHidden(k) && !((S.layout && S.layout.shownTabs) || []).includes(k));
const panelHidden = id => ((S.layout && S.layout.hidden) || []).includes(id) || (panelAutoHidden(id) && !((S.layout && S.layout.shown) || []).includes(id));
// Icons for the phone's bottom tab bar.
const _ti = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const TAB_ICON = {
  core: _ti('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
  combat: _ti('<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6M16 16l4 4M19 21l2-2"/>'),
  spells: _ti('<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>'),
  features: _ti('<path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z"/>'),
  inventory: _ti('<path d="M6 8h12l1 13H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
  infusions: _ti('<path d="M9 3h6M10 3v5L4.5 18A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.8-3L14 8V3"/><path d="M7.5 14h9"/>'),
  companions: _ti('<circle cx="5.5" cy="10" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M12 12c-3 0-5 3-5 5.5 0 2 1.5 3 3 2.5l2-.6 2 .6c1.5.5 3-.5 3-2.5 0-2.5-2-5.5-5-5.5z"/>'),
  party: _ti('<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2.5 20c.6-3.3 2.8-5.5 5.5-5.5s4.9 2.2 5.5 5.5M10.5 20c.6-3.3 2.8-5.5 5.5-5.5s4.9 2.2 5.5 5.5"/>'),
  story: _ti('<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>'),
  notes: _ti('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>')
};
function renderTabs() {
  const ed = !!UI.editLayout, tabs = tabOrder();
  if ((tabHidden(UI.tab) && !ed) || !tabs.some(t => t[0] === UI.tab)) UI.tab = (tabs.find(t => !tabHidden(t[0])) || tabs[0])[0];
  document.documentElement.dataset.tab = UI.tab;
  $('#tabs').innerHTML = tabs.map(([k, t], j) => {
    const hid = tabHidden(k); if (hid && !ed) return '';
    const label = (S.layout && S.layout.tabNames && S.layout.tabNames[k]) || t;
    return `<div class="tabwrap${hid ? ' hid' : ''}" data-tabkey="${k}">${ed ? '<span class="tgrip" data-handle="tab" title="Drag to reorder">⠿</span>' : ''}<button class="tab${UI.tab === k ? ' on' : ''}" role="tab" aria-selected="${UI.tab === k}" data-act="tab" data-tab="${k}"><span class="ticon" aria-hidden="true">${TAB_ICON[k] || (isCustomTab(k) ? `<span class="cticon">${esc((ctabs().find(t => t.key === k) || {}).icon || '★')}</span>` : TAB_ICON.notes)}</span><span class="tlabel">${esc(label)}</span>${k === 'companions' && (S.companions.length || S.form) ? ` <span class="tabcount">${S.companions.length + (S.form ? 1 : 0)}</span>` : ''}</button>${ed ? `<div class="menu tabmenu"><button class="pmenu" data-act="menu" title="Tab options">⋯</button><div class="menu-list"><button data-act="tabrename" data-k="${k}">Rename tab</button><button data-act="tabhide" data-k="${k}">${hid ? 'Show tab' : 'Hide tab'}</button><button data-act="tabmove" data-k="${k}" data-d="-1" ${j ? '' : 'disabled'}>Move left</button><button data-act="tabmove" data-k="${k}" data-d="1" ${j < tabs.length - 1 ? '' : 'disabled'}>Move right</button>${isCustomTab(k) ? `<button data-act="ctabdel" data-k="${k}">Delete tab</button>` : ''}</div></div>` : ''}</div>`;
  }).join('') + '<span class="tab-ind" aria-hidden="true"></span>';
  tabOrder().forEach(([k]) => { const pg = $('#page-' + k); if (pg) pg.classList.toggle('on', UI.tab === k); });
  if (UI.tab !== 'party' && $('#page-party')) $('#page-party').classList.remove('on');
  slideTabInd();
}
// The highlight under the selected tab slides from the previous tab to the new one.
let _tabIndPrev = null;
function slideTabInd() {
  const bar = $('#tabs'), ind = bar && bar.querySelector('.tab-ind'), on = bar && bar.querySelector('.tab.on');
  if (!ind || !on || !bar.offsetWidth) return;
  const br = bar.getBoundingClientRect(), r = on.getBoundingClientRect();
  const to = { x: r.left - br.left + bar.scrollLeft, y: r.top - br.top, w: r.width, h: r.height };
  const set = p => { ind.style.transform = `translate(${p.x}px, ${p.y}px)`; ind.style.width = p.w + 'px'; ind.style.height = p.h + 'px'; };
  // Only slide when you actually switch tabs. Page loads, re-renders and resizes snap it straight into place.
  const anim = _tabIndPrev && _tabIndKey && _tabIndKey !== UI.tab && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  ind.style.transition = 'none';
  if (anim) { set(_tabIndPrev); void ind.offsetWidth; ind.style.transition = ''; set(to); }
  else { set(to); void ind.offsetWidth; }
  _tabIndPrev = to; _tabIndKey = UI.tab;
}
let _tabIndKey = null;
addEventListener('resize', () => slideTabInd());
// Fonts or layout settling after load can shift the tabs; re-snap without animating.
addEventListener('load', () => slideTabInd());
// Switching tabs: the new page fades in (and on a phone slides in from the side of the tab it came from).
// Switching tabs: the new page simply fades in. On a phone the strip of vitals above Core/Combat changes shape on the
// way to or from those tabs, so it fades along with the page instead of snapping.
function tabPageAnim(prev, nt) {
  const pg = $('#page-' + nt); if (!pg || !pg.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fade = el => { el.getAnimations && el.getAnimations().forEach(a => a.cancel()); el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: isMobile() ? 240 : 200, easing: 'ease-out' }); };
  $$('.page').forEach(p => p.getAnimations && p.getAnimations().forEach(a => a.cancel())); fade(pg);
  const full = k => k === 'core' || k === 'combat', v = $('#sec-vitals');
  if (v && isMobile() && full(prev) !== full(nt)) fade(v);
}
// Phones: a tap on the tab bar must never also land on the page that appears under it. iPhones sometimes deliver a
// stray second click (or a press) to whatever is now at that spot, so for a moment after a tab switch, presses and
// clicks outside the bar are ignored. The bar also gets its own layer so taps on it can't reach the page beneath.
{
  let at = 0;
  const mark = e => { if (isMobile() && e.target.closest && e.target.closest('#tabs')) at = Date.now(); };
  const eat = e => { if (Date.now() - at < 350 && !(e.target.closest && e.target.closest('#tabs'))) { e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); } };
  addEventListener('pointerup', mark, true); addEventListener('click', mark, true);
  ['click', 'mousedown', 'touchend', 'pointerdown'].forEach(t => addEventListener(t, eat, { capture: true, passive: false }));
}
// Phones: press the tab bar and slide along it — the highlight follows your finger and lets go on the tab you stop at.
{
  const bar = $('#tabs'); let drag = null, eat = false;
  const tabAt = x => [...bar.querySelectorAll('.tab')].find(t => { const r = t.getBoundingClientRect(); return x >= r.left && x <= r.right; });
  const place = (ind, x, w, y, h) => { ind.style.transform = `translate(${x}px, ${y}px)`; ind.style.width = w + 'px'; ind.style.height = h + 'px'; };
  bar.addEventListener('pointerdown', e => {
    if (!isMobile() || UI.editLayout || !e.isPrimary || !e.target.closest('.tab')) return;
    drag = { id: e.pointerId, x0: e.clientX, on: false, hov: null };
  });
  bar.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const ind = bar.querySelector('.tab-ind'), cur = bar.querySelector('.tab.on'); if (!ind || !cur) return;
    if (!drag.on) { if (Math.abs(e.clientX - drag.x0) < 8) return; drag.on = true; bar.classList.add('tdrag'); try { bar.setPointerCapture(e.pointerId); } catch (x) {} }
    const br = bar.getBoundingClientRect(), r = cur.getBoundingClientRect(), w = r.width, x = Math.max(4, Math.min(e.clientX - br.left - w / 2, br.width - w - 4));
    ind.style.transition = 'none'; place(ind, x, w, r.top - br.top, r.height); drag.pos = { x, y: r.top - br.top, w, h: r.height };
    const t = tabAt(e.clientX); if (t !== drag.hov) { if (drag.hov) drag.hov.classList.remove('thov'); if (t) { t.classList.add('thov'); try { navigator.vibrate && navigator.vibrate(4); } catch (x) {} } drag.hov = t; }
  });
  const end = e => {
    if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null; bar.classList.remove('tdrag');
    if (!d.on) return; eat = true; setTimeout(() => { eat = false; }, 400);
    if (d.hov) d.hov.classList.remove('thov');
    const t = e.type === 'pointercancel' ? null : tabAt(e.clientX), ind = bar.querySelector('.tab-ind');
    _tabIndPrev = d.pos || _tabIndPrev;
    if (t && t.dataset.tab !== UI.tab) { eat = false; t.click(); eat = true; }
    else if (ind) { _tabIndKey = '~drag'; slideTabInd(); }
  };
  bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
  bar.addEventListener('click', e => { if (eat) { e.preventDefault(); e.stopPropagation(); } }, true);
}

const atkBtn = (i, short) => `<button class="btn gold sm atkbtn" data-act="attack" data-i="${i}" title="Roll to hit and damage; a natural 20 doubles the damage dice">⚔${short ? '' : ' Attack'}</button>`;
const AB_ATK = [['str', 'STR'], ['dex', 'DEX'], ['fin', 'Finesse (best)'], ['monk', 'Monk (best)'], ['spell', 'Spellcasting'], ['int', 'INT'], ['wis', 'WIS'], ['cha', 'CHA'], ['', '—']];
function formAttacksHTML() {
  if (!S.form) return '';
  return `<div class="formatk"><div class="sect">${esc(S.form.name)} attacks</div>${(S.form.attacks || []).map((a, j) => `<div class="fa-row"><b>${esc(a[0])}</b><button class="roll" data-act="crroll" data-who="form" data-j="${j}" data-what="hit">${a[1] === '' ? 'save' : fmt(N(a[1]))}</button><button class="roll" data-act="crroll" data-who="form" data-j="${j}" data-what="dmg">${esc(a[2] || '—')}</button><span class="muted">${esc(a[3] || '')}</span></div>`).join('')}</div>`;
}
// Attacks from inventory weapons only show while that weapon is equipped.
const atkShown = a => { if (!a.item) return true; const it = S.inventory.find(x => x.id === a.item); return !it || !!it.equipped; };
const ammoItem = a => a && a.ammo ? S.inventory.find(it => it.id === a.ammo) : null;
// Compact attack rows: name, hit, damage and the attack button; tap the name to edit everything else.
function attacksHTML() {
  const stowed = S.attacks.filter(a => !atkShown(a)).length;
  return formAttacksHTML() + `<div class="atk-list">${S.attacks.map((a, i) => {
    if (!atkShown(a)) return '';
    const open = UI.open['atk:' + i], am = ammoItem(a), wit = a.item && S.inventory.find(x => x.id === a.item), hasTip = String(a.notes || '').trim() || (wit && (String(wit.notes || '').trim() || wit.hb));
    return `<div class="atk-row${open ? ' open' : ''}">
      <span class="atk-namewrap"><button class="atk-name" data-act="toggle" data-key="atk:${i}" aria-expanded="${!!open}" title="Edit">${esc(a.name)} <span class="caret">${open ? '▴' : '▾'}</span></button>${hasTip ? `<button class="notetip" data-tip="${i}" data-tipkind="atk" aria-label="Notes for ${esc(a.name)}">ⓘ</button>` : ''}${wit && wit.attune ? `<span class="tag${wit.attuned ? ' oath' : ''}" title="${wit.attuned ? 'Attuned' : 'Needs attunement'}">${wit.attuned ? '◆' : '◇'}</span>` : ''}</span>${String(a.notes || '').trim() && !open ? `<div class="atk-notes mnote">${esc(a.notes)}</div>` : ''}${wit && wit.hb && !open && hbSummary(wit.hb, wit).length ? `<div class="atk-notes mnote hbn">⚙ ${esc(hbSummary(wit.hb, wit).join(' · '))}</div>` : ''}
      <span class="atk-hit">${rollBtn('atk:' + i, a.name + ' attack')}</span>
      <span class="atk-dmg">${rollBtn('dmg:' + i, a.name + ' damage')}</span>
      <span class="atk-type muted">${esc(a.type || '')}${am ? `<b class="ammo" title="${esc(am.name)}" data-calc="ammo:${i}"></b>` : ''}</span>
      ${atkBtn(i, isMobile())}
      ${open ? `<div class="atk-edit">${fld('Name', inp(`attacks.${i}.name`, { fit: 10 }))}${fld('Ability', sel(`attacks.${i}.ab`, AB_ATK))}
        ${fld('Damage dice', inp(`attacks.${i}.dice`, { fit: 5 }))}${fld('Magic +', inp(`attacks.${i}.magic`, { num: 1, cls: 'sm' }))}
        ${fld('Damage type', inp(`attacks.${i}.type`, { fit: 8 }))}${fld('Kind', sel(`attacks.${i}.kind`, [['melee', 'Melee'], ['ranged', 'Ranged']]))}
        ${fld('Uses ammo', sel(`attacks.${i}.ammo`, [['', '— none —']].concat(S.inventory.map(it => [it.id, it.name]))))}
        ${a.item ? `<label class="checkline" title="Comes from your weapon proficiencies (Core → Proficiencies). Tick to force proficiency for this weapon only.">${chk(`attacks.${i}.profForce`, 'Always proficient')} Force proficient <span class="hint">(${attackProf(a) ? 'proficient' : 'not proficient'})</span></label>` : `<label class="checkline">${chk(`attacks.${i}.prof`, 'Proficient')} Proficient</label>`}
        <div class="span2">${fld('Notes', inp(`attacks.${i}.notes`, { ph: 'range, properties…' }))}</div>
        <div class="span2" style="text-align:right"><button class="btn red sm" data-act="del" data-list="attacks" data-i="${i}">Remove attack</button></div></div>` : ''}
    </div>`;
  }).join('') || '<p class="hint">No attacks yet. Weapons you add in Inventory appear here automatically.</p>'}</div>${stowed ? `<p class="hint" style="margin:4px 0 0">${stowed} weapon${stowed > 1 ? 's' : ''} in your pack — equip ${stowed > 1 ? 'them' : 'it'} in Inventory to attack.</p>` : ''}`;
}
// Proficiencies as real toggles and lists: armor and weapon proficiency change your rolls, tools can be rolled.
const toolBonus = t => mod(t.ab || toolAb(t.name)) + PB() * (t.exp ? 2 : 1);
// Read-only summary on the sheet; "Manage" opens the full editor.
const ARMOR_L = { light: 'Light armor', medium: 'Medium armor', heavy: 'Heavy armor', shield: 'Shields' };
// Situational edges (advantage notes, Evasion-style riders…) as a tidy list: name on top, what it does underneath.
function perksHTML(list) {
  if (!list || !list.length) return '';
  const groups = [];
  list.forEach(x => { const m = String(x.t).match(/^([^:(]{2,40}):\s*(.+)$/); let name = '', desc = x.t, src = x.src.slice();
    if (m) { name = m[1]; desc = m[2]; src = src.filter(s => s.toLowerCase() !== name.toLowerCase()); } else if (src.length === 1) { name = src[0]; src = []; }
    if (!m && !/advantage/i.test(desc) && /^(saves?\b|death saves|concentration saves|(STR|DEX|CON|INT|WIS|CHA)\b|checks?\b|ability checks|initiative|attack rolls)/i.test(desc)) desc = 'Advantage on ' + (/^[A-Z][a-z]/.test(desc) ? desc.charAt(0).toLowerCase() + desc.slice(1) : desc);
    if (/^Advantage on saves vs spells$/i.test(desc) && S.race && S.race.key === 'yuanti_volo') desc += ' and other magical effects';
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    let g = name && groups.find(g => g.name === name); if (!g) groups.push(g = { name, src: [], d: [] });
    src.forEach(z => { if (!g.src.includes(z)) g.src.push(z); }); g.d.push(desc); });
  const items = groups.map(g => `<div class="perk">${g.name ? `<b class="perk-n">${esc(g.name)}</b>` : ''}${g.src.length ? `<span class="perk-src">${esc(g.src.join(', '))}</span>` : ''}${g.d.map(d => `<span class="perk-d">${esc(d)}</span>`).join('')}</div>`).join('');
  return `<div class="pvrow pvperks"><span class="pvl">Perks</span><div class="pvv perklist">${items}</div></div>`;
}
function profsHTML() {
  const P = S.profs, bad = armorNonProf();
  const badge = (t, cls = '') => `<span class="pbadge${cls}">${esc(t)}</span>`;
  const armor = ['light', 'medium', 'heavy', 'shield'].filter(c => (P.armor || []).includes(c)).map(c => badge(ARMOR_L[c])).join('');
  const weap = [].concat((P.weapons || []).includes('simple') ? [badge('Simple weapons')] : [], (P.weapons || []).includes('martial') ? [badge('Martial weapons')] : [], (P.weaponNames || []).map(n => badge(n, ' alt'))).join('');
  const tools = (S.tools || []).map((t, i) => `<div class="pvtool"><span class="tname">${esc(t.name)}${t.exp ? ' <span class="pstar" title="Expertise">★</span>' : ''}</span><span class="ab3">${AB3[t.ab || toolAb(t.name)]}</span><button class="roll" data-roll="tool:${i}" data-calc="toolb:${i}" title="Roll ${esc(t.name)}">${fmt(toolBonus(t))}</button></div>`).join('');
  const langs = (S.langs || []).map(l => badge(l)).join('');
  const none = '<span class="hint">None</span>';
  return `<div class="pview">
    <div class="pvrow"><span class="pvl">Armor</span><div class="pvv">${armor || none}</div></div>
    <div class="pvrow"><span class="pvl">Weapons</span><div class="pvv">${weap || none}</div></div>
    <div class="pvrow"><span class="pvl">Tools</span><div class="pvv pvtools">${tools || none}</div></div>
    <div class="pvrow"><span class="pvl">Languages</span><div class="pvv">${langs || none}</div></div>
    ${(() => { const d = defensesDetail(), rows = [['Resistant', d.resist], ['Immune', d.immune]].filter(x => x[1].length); return rows.map(([l, v]) => `<div class="pvrow"><span class="pvl">${l}</span><div class="pvv">${v.map(x => `<span class="pbadge defb${l === 'Advantage' ? ' alt' : ''}" title="${esc(x.t + (x.src.length ? ' — from ' + x.src.join(', ') : ''))}">${esc(x.t)}${x.src.length ? `<small class="dsrc">${esc(x.src.join(', '))}</small>` : ''}</span>`).join('')}</div></div>`).join(''); })()}
    ${perksHTML(defensesDetail().adv)}
    ${bad.length ? `<p class="warn sm">Wearing ${esc(bad.join(', '))} without proficiency: disadvantage on STR/DEX checks, saves and attacks, and no spellcasting.</p>` : ''}</div>`;
}
// The detailed editor shown in the Manage window.
function profsManageInner() {
  const P = S.profs, bad = armorNonProf();
  const tog = (act, v, on, label, sub) => `<button class="ptog big${on ? ' on' : ''}" data-act="${act}" data-v="${v}" aria-pressed="${on}"><span class="pt-check">${on ? '✓' : ''}</span><span><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span></button>`;
  const addSel = (id, label, opts) => `<select class="f addsel" id="${id}" aria-label="${esc(label)}"><option value="">+ ${esc(label)}…</option>${opts.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select>`;
  const other = (k, ph) => `<span class="pother"><input class="f" id="pother-${k}" placeholder="${ph}" aria-label="${ph}"><button class="btn sm" data-act="profother" data-k="${k}">Add</button></span>`;
  const weapNames = (P.weaponNames || []).map((n, i) => `<span class="pchip">${esc(n)}<button data-act="pwdel" data-i="${i}" aria-label="Remove ${esc(n)}">✕</button></span>`).join('');
  const tools = (S.tools || []).map((t, i) => `<div class="toolrow"><span class="tname">${esc(t.name)}</span>
      <select class="f tab" data-k="tools.${i}.ab" aria-label="Ability for ${esc(t.name)}">${AB.map(a => `<option value="${a}"${(t.ab || toolAb(t.name)) === a ? ' selected' : ''}>${AB3[a]}</option>`).join('')}</select>
      <button class="ptog sm${t.exp ? ' on' : ''}" data-act="toolexp" data-i="${i}" title="Expertise doubles your proficiency bonus">${t.exp ? '★ Expertise' : '☆ Proficient'}</button>
      <button class="roll" data-roll="tool:${i}" data-calc="toolb:${i}" title="Roll ${esc(t.name)}">${fmt(toolBonus(t))}</button>
      <button class="icon-btn" data-act="tooldel" data-i="${i}" aria-label="Remove ${esc(t.name)}">✕</button></div>`).join('');
  const langs = (S.langs || []).map((l, i) => `<span class="pchip">${esc(l)}<button data-act="langdel" data-i="${i}" aria-label="Remove ${esc(l)}">✕</button></span>`).join('');
  return `<div class="pm-head"><h3>Proficiencies &amp; Languages</h3><button class="btn gold" data-act="close">Done</button></div>
    <div class="pm-grid">
    <section class="pmsec"><h4>Armor</h4><p class="hint">Armor you aren't trained with gives disadvantage on STR/DEX checks, saves and attacks, and stops you casting spells.</p>
      <div class="ptgrid">${['light', 'medium', 'heavy'].map(c => tog('parmor', c, (P.armor || []).includes(c), ARMOR_L[c], { light: 'Padded, leather, studded', medium: 'Hide, chain shirt, scale, breastplate, half plate', heavy: 'Ring, chain mail, splint, plate' }[c])).join('')}${tog('parmor', 'shield', (P.armor || []).includes('shield'), 'Shields', '+2 AC')}</div>
      ${bad.length ? `<p class="warn sm">Currently wearing ${esc(bad.join(', '))} without proficiency.</p>` : ''}</section>
    <section class="pmsec"><h4>Weapons</h4><p class="hint">Attacks with these weapons add your proficiency bonus (${fmt(PB())}).</p>
      <div class="ptgrid two">${tog('pweap', 'simple', (P.weapons || []).includes('simple'), 'Simple weapons', 'Clubs, daggers, spears, light crossbows…')}${tog('pweap', 'martial', (P.weapons || []).includes('martial'), 'Martial weapons', 'Swords, axes, longbows…')}</div>
      <div class="ptogs" style="margin-top:8px">${weapNames}${addSel('addWeapon', 'Add a specific weapon', DND.weapons.map(w => w[0]).filter(n => !(P.weaponNames || []).includes(n)))}${other('weapon', 'Other weapon…')}</div></section>
    <section class="pmsec"><h4>Tools</h4><p class="hint">Choose the ability each tool rolls with. Expertise doubles your proficiency bonus.</p>
      <div class="tools">${tools || '<span class="hint">No tool proficiencies.</span>'}</div>
      <div class="ptogs" style="margin-top:8px">${addSel('addTool', 'Add a tool', ALL_TOOLS().filter(n => !(S.tools || []).some(t => t.name === n)))}${other('tool', 'Other tool…')}</div></section>
    <section class="pmsec"><h4>Languages</h4>
      <div class="ptogs">${langs || '<span class="hint">None</span>'}</div>
      <div class="ptogs" style="margin-top:8px">${addSel('addLang', 'Add a language', ALL_LANGS().filter(n => !(S.langs || []).includes(n)))}${other('lang', 'Other language…')}</div></section>
    </div>`;
}
function openProfs() {
  const html = `<div id="profmodal">${profsManageInner()}</div>`;
  if ($('#profmodal') && $('#modal').classList.contains('open')) $('#profmodal').innerHTML = profsManageInner(); else { openModal(html, () => render('core'), true); $('#modal-body').classList.add('xwide'); }
}
function renderCore() {
  const swap = ST('abilityStyle') === 'score';
  const abil = AB.map(a => `
    <div class="ab${swap ? ' swap' : ''}" data-zi="${a}"><span class="lbl"><span class="ciw top">${ABN[a]}${ciBtn('abil:' + a, ABN[a])}</span></span>
      <button class="modbtn" data-calc="mod:${a}" data-roll="mod:${a}" aria-label="Roll ${ABN[a]} check"></button>
      <span class="f score scoreview" title="${ABN[a]} score — change it with Manage">${esc(S.abilities[a] === '' ? '—' : S.abilities[a])}</span><span class="effscore" data-calc="eff:${a}"></span>
      <div class="saverow"><span class="saveprof${S.saves[a] ? ' on' : ''}" title="${S.saves[a] ? 'Proficient in ' + ABN[a] + ' saves' : 'Not proficient'}" aria-label="${S.saves[a] ? 'Proficient' : 'Not proficient'}"></span> Save ${rollBtn('save:' + a, ABN[a] + ' save')}${ciBtn('save:' + a, ABN[a] + ' save')}</div>
    </div>`).join('');
  const skills = S.skills.map((s, i) => `
    <div class="sk"><span class="profbtn locked p${N(s.prof)}" title="${['Not proficient', 'Proficient', 'Expertise'][N(s.prof)]} — change it with Manage" aria-label="${esc(s.name)}: ${['not proficient', 'proficient', 'expertise'][N(s.prof)]}"></span>
      <span class="sk-hit" title="Roll ${esc(s.name)}">${rollBtn('skill:' + i, s.name)}<span class="skn"><span class="ciw">${esc(s.name)}${ciBtn('skill:' + i, s.name)}</span></span></span><span class="sktmp" data-calc="sktmp:${i}" title="Temporary change from Conditions"></span><span class="ab3">${s.ab}</span>
      ${s.note ? `<span class="sknote">${esc(s.note)}</span>` : ''}</div>`).join('');
  $('#page-core').innerHTML = `
  <div class="core">
    <div class="panel" ${PID('abilities')}><h2><span class="grow">Abilities &amp; Saves</span><button class="btn sm" data-act="manageabil">Manage</button></h2><div class="abilities" data-zone="abil">${abil}</div>
      <p class="hint" style="margin:10px 0 0">Tap any bonus to roll it. Conditions like poisoned or exhaustion apply to your rolls automatically.${auraBonus() ? ' Saves include your Aura of Protection.' : ''}</p></div>
    <div class="panel" ${PID('skills')}><h2><span class="grow">Skills</span><button class="btn sm" data-act="manageskills">Manage</button></h2><div class="skills">${skills}</div>
      <div class="passive"><span><span class="ciw">Passive Perception${ciBtn('passive', 'passive Perception')}</span></span><span data-calc="passive"></span></div></div>
    <div class="stack col3">
      <div class="panel" ${PID('profs')}><h2><span class="grow">Proficiencies &amp; Languages</span><button class="btn sm" data-act="manageprofs">Manage</button></h2>${profsHTML()}</div>
    </div>
  </div>`;
}

// ---------- Roll log ----------
// Every roll card is also written here with its full breakdown (kept per character in this browser, newest first).
let ROLLLOG = [];
const rollLogKey = () => 'dnd-rolllog:' + (S && S.id || 'blank');
function loadRollLog() { try { ROLLLOG = JSON.parse(localStorage.getItem(rollLogKey()) || '[]'); } catch (e) { ROLLLOG = []; } }
function saveRollLog() { try { localStorage.setItem(rollLogKey(), JSON.stringify(ROLLLOG.slice(0, 300))); } catch (e) {} }
function logRoll(html, cls) { if (!ROLLLOG.length) loadRollLog(); ROLLLOG.unshift({ t: Date.now(), html, cls: cls || '' }); ROLLLOG = ROLLLOG.slice(0, 300); saveRollLog(); if ($('#rolllogmodal') && $('#modal').classList.contains('open')) openRollLog(); }
// Everything else that pops up (spell cast notes, turn changes, warnings…) goes in the second tab.
let EVLOG = [], EVLOADED = false;
const evLogKey = () => 'dnd-evlog:' + (S && S.id || 'blank');
function loadEvLog() { EVLOADED = true; try { EVLOG = JSON.parse(localStorage.getItem(evLogKey()) || '[]'); } catch (e) { EVLOG = []; } }
function saveEvLog() { try { localStorage.setItem(evLogKey(), JSON.stringify(EVLOG.slice(0, 300))); } catch (e) {} }
function logEvent(html, cls) { if (!EVLOADED) loadEvLog(); const clean = String(html).replace(/<button[^>]*>.*?<\/button>/g, ''); if (!clean.replace(/<[^>]*>/g, '').trim()) return; EVLOG.unshift({ t: Date.now(), html: clean, cls: cls || '' }); EVLOG = EVLOG.slice(0, 300); saveEvLog(); if ($('#rolllogmodal') && $('#modal').classList.contains('open')) openRollLog(); }
function openRollLog() {
  if (!ROLLLOG.length) loadRollLog(); if (!EVLOADED) loadEvLog();
  const tab = UI.logTab === 'events' ? 'events' : 'rolls', LIST = tab === 'events' ? EVLOG : ROLLLOG;
  const day = t => new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric' }), tm = t => new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  let last = '';
  const rows = LIST.map(r => { const d = day(r.t), h = d !== last ? `<div class="rl-day">${d}</div>` : ''; last = d; return h + `<div class="rl-row ${esc(r.cls)}"><span class="rl-time">${tm(r.t)}</span><div class="rl-card">${r.html.replace(/<button[^>]*>.*?<\/button>/g, '')}</div></div>`; }).join('');
  const tb = (k, l, n) => `<button class="rl-tab${tab === k ? ' on' : ''}" data-act="logtab" data-v="${k}" aria-pressed="${tab === k}">${l} <span>${n}</span></button>`;
  const html = `<div id="rolllogmodal"><div class="rl-head"><h3>Log</h3><div class="rl-tabs">${tb('rolls', 'Rolls', ROLLLOG.length)}${tb('events', 'Everything else', EVLOG.length)}</div>${LIST.length ? '<button class="btn sm ghost" data-act="clearlog">Clear</button>' : ''}</div>
    <div class="rl-list">${rows || (tab === 'events' ? '<p class="hint">Nothing yet. Messages that pop up — spells cast, turns, rests, warnings — are kept here.</p>' : '<p class="hint">No rolls yet. Every roll you make shows up here with its full breakdown.</p>')}</div>
    <div class="actions"><button class="btn" data-act="close">Close</button></div></div>`;
  if ($('#rolllogmodal') && $('#modal').classList.contains('open')) $('#modal-body').innerHTML = html; else openModal(html, null, true);
}

// ---------- Mobile full screen ----------
function fsAvail() { const d = document; return !!(d.fullscreenEnabled || d.webkitFullscreenEnabled) && !!(d.documentElement.requestFullscreen || d.documentElement.webkitRequestFullscreen); }
function fsOn() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
function fsEnter() { const el = document.documentElement; try { const r = (el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : el.webkitRequestFullscreen()); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
function fsExit() { try { const r = document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen(); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
let FS_USER_OFF = false;
['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, () => { $$('.fsbtn').forEach(b => { b.innerHTML = fsOn() ? ICON.fsOut : ICON.fsIn; b.title = b.ariaLabel = fsOn() ? 'Exit full screen' : 'Full screen'; }); }));


// ---------- "Show the math" on roll cards ----------
// Each roll card's 🎲 opens a breakdown: every die and what it rolled, every bonus and where it comes from, and the total.
let ROLL_ROWS = null; // the bonus's parts for the roll being made, set by whoever starts it
const sgnv = v => (v < 0 ? '−' : '+') + Math.abs(v);
// Fill in anything the parts don't explain, so the rows always add up to the bonus used.
function fitRows(rows, want) { rows = (rows || []).filter(r => N(r[1])); const got = rows.reduce((t, r) => t + N(r[1]), 0); if (got !== want) rows.push([rows.length ? 'Other' : 'Modifier', want - got]); return rows.filter(r => N(r[1])); }
const dieLbl = t => `${t.n}d${t.sides}${t.keep === 'kh1' ? ', keep highest' : t.keep === 'kl1' ? ', keep lowest' : ''}`;
const dieSub = t => (t.shown && (t.shown.length > 1 || t.keep) ? '[' + t.shown.join(', ') + ']' : '');
// A d20 roll: the d20, the bonus split into its parts, any extra dice (Bless, Bane, Guidance…), exhaustion.
function d20Math(r, dx, rows, title, floorRow) {
  if (!r.terms || !r.terms.length) return { title, rows: [['Rolled', r.detail || String(r.total)]], total: r.total };
  const out = [], dice = r.terms.filter(t => t.dice), flat = r.terms.filter(t => t.flat).reduce((a, t) => a + t.v, 0), d0 = dice[0];
  if (d0) out.push([d0.sides === 20 ? (d0.keep === 'kh1' ? 'd20 with advantage' : d0.keep === 'kl1' ? 'd20 with disadvantage' : 'd20') : dieLbl(d0), String(d0.val), dieSub(d0)]);
  if (floorRow) out.push([floorRow[0], sgnv(floorRow[1])]);
  fitRows(rows, flat + N(dx && dx.ex)).forEach(([l, v]) => out.push([l, sgnv(N(v))]));
  if (dx && dx.ex) out.push([exModern() ? 'Exhaustion' : 'Exhaustion', sgnv(-dx.ex)]);
  dice.slice(1).forEach((t, i) => out.push([((dx && dx.dieNames || [])[i] || 'Extra die') + ` (${t.n}d${t.sides})`, sgnv(t.sign * t.val), dieSub(t)]));
  return { title, rows: out, total: r.total };
}
// Any other roll (damage, healing…): each die term, then the flat bonus split into its parts.
function termMath(r, rows, title, names) {
  if (!r.terms || !r.terms.length) return { title, rows: [['Rolled', r.detail || String(r.total)]], total: r.total };
  const out = [], flat = r.terms.filter(t => t.flat).reduce((a, t) => a + t.v, 0);
  r.terms.filter(t => t.dice).forEach((t, i) => out.push([((names || [])[i] ? names[i] + ' ' : '') + `(${t.n}d${t.sides})`, (t.sign < 0 ? '−' : '') + t.val, t.shown && t.shown.length > 1 ? '[' + t.shown.join(', ') + ']' : '']));
  if (flat || (rows && rows.length)) fitRows(rows, flat).forEach(([l, v]) => out.push([l, sgnv(N(v))]));
  return { title, rows: out, total: r.total };
}
function mathHTML(secs) {
  secs = secs.filter(x => x && x.rows && x.rows.length); if (!secs.length) return '';
  return `<div class="rc-math">${secs.map(x => `${secs.length > 1 || x.title !== 'Roll' ? `<div class="rm-h">${esc(x.title)}</div>` : ''}${x.rows.map(([l, v, sub]) => `<div class="rm-r"><span>${esc(l)}${sub ? ` <i>${esc(sub)}</i>` : ''}</span><b>${esc(String(v))}</b></div>`).join('')}<div class="rm-r rm-t"><span>Total</span><b>${esc(String(x.total))}</b></div>`).join('')}</div>`;
}
// The parts of each kind of bonus.
const abRow = a => [`${String(a).toUpperCase()} modifier`, mod(a)];
function calcRowsOf(k) { const c = typeof calcTip === 'function' ? calcTip(k) : null; return c && c.rows ? c.rows.map(([l, v]) => [l, typeof v === 'string' ? N(v.replace('−', '-')) : N(v)]).filter(r => !isNaN(r[1])) : null; }
function atkHitRows(a) {
  if (a.fixedHit != null && a.fixedHit !== '') return [['Attack bonus (set)', N(a.fixedHit)]];
  const ab = attackAb(a), fit = a.item && S.inventory.find(x => x.id === a.item);
  return [ab ? abRow(ab) : null, attackProf(a) ? ['Proficiency', PB()] : null, ['Magic bonus', N(a.magic)], ['Forged', forgeBonus(fit)], ['Infusion', infWeapon(fit, a, 'atk')], ['Spells and effects', a.effect ? 0 : buffSum('atk')], ['Item effects', itemBuffs(a).reduce((t, b) => t + N(b.atk), 0)], ['Spell attack items', a.ab === 'spell' ? itemSum('spellAtk') + itemSum('spell') : 0], a.kind === 'ranged' && fightingStyle('Archery') ? ['Archery', 2] : null].filter(Boolean);
}
function atkDmgRows(a) {
  if (a.fixedHit != null && a.fixedHit !== '') return [];
  const ab = attackAb(a), fit = a.item && S.inventory.find(x => x.id === a.item);
  return [ab && !a.noModDmg ? abRow(ab) : null, ['Magic bonus', N(a.magic)], ['Forged', forgeBonus(fit)], ['Infusion', infWeapon(fit, a, 'dmg')], ['Spells and effects', a.effect ? 0 : buffSum('dmg') + (a.kind === 'melee' && ab === 'str' ? buffSum('meleeDmg') : 0)], ['Item effects', itemBuffs(a).reduce((t, b) => t + N(b.dmg), 0)], ['Features', a.kind === 'melee' ? fxSum('meleeDmg') : 0], a.kind === 'melee' && fightingStyle('Dueling') && a.oneHanded ? ['Dueling', 2] : null].filter(Boolean);
}

// ---------- Rolling on the sheet, shown in Roll20 too (Settings → Dice) ----------
// The sheet rolls as usual; the result (not a new roll) is posted to your Roll20 game's chat through the extension.
function postSheetRoll(t) {
  if (diceMode() !== 'sheet' || !ST('sheetToR20') || !R20.ok) return;
  const q = s => t.querySelector(s), txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const total = txt(q('b.total')), name = txt(q('.rc-name')) || txt(q('b.total + div > div')) || 'Roll', lbl = txt(q('.rc-lbl'));
  const dmg = q('.rc-dmg') && !q('.rc-dmg.void') ? txt(q('.rc-dmg > b')) : '', dtype = q('.rc-dmg') ? txt(q('.rc-dmg > span')).replace(/^\d+\s*/, '') : '';
  const multi = q('.rc-multi');
  const clean = s => String(s).replace(/[[\]{}|]/g, '').slice(0, 160);
  const cap = x => x.charAt(0).toUpperCase() + x.slice(1);
  const lines = [`/em **${clean(multi ? txt(q('.rc-name')) : name)}** (rolled on the sheet)`];
  if (multi) t.querySelectorAll('.rc-row').forEach(r => { const n = (r.textContent.match(/-?\d+/g) || []); if (n.length) lines.push(`**${clean(txt(r).replace(/-?\d+.*$/, '') || 'Roll')}:** [[${n[0]}]]${n[1] ? ` · damage [[${n[1]}]]` : ''}`); });
  else if (total !== '') lines.push(`**${clean(lbl ? cap(lbl) : 'Result')}:** [[${N(total)}]]${dmg ? ` · **Damage:** [[${N(dmg)}]] ${clean(dtype)}` : ''}`);
  if (lines.length > 1) r20Post(lines).catch(() => {});
}
