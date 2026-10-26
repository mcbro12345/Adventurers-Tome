
// ---------- Fields that grow to fit their text ----------
function fitInput(el) {
  const min = N(el.dataset.fit) || 6, len = Math.max(String(el.value || '').length, String(el.placeholder || '').length * 0.8);
  const sz = Math.max(min, Math.ceil(len) + 1);
  if (el.size !== sz) el.size = sz;
  if (el.classList.contains('name')) fitNameFont(el);
}
// The character name shrinks to fit its box (never cut off); full name on hover.
let _fitCv;
// (the size found for a name is remembered until the window or fonts change, so redrawing the sheet doesn't measure it again)
let FIT_GEN = 0; const FIT_C = new Map();
addEventListener('resize', () => { FIT_GEN++; FIT_C.clear(); });
try { document.fonts.addEventListener('loadingdone', () => { FIT_GEN++; FIT_C.clear(); document.querySelectorAll('input.name[data-fit]').forEach(fitNameFont); }); } catch (e) {}
function fitNameFont(el) {
  const fk = (el.value || el.placeholder || '') + '|' + el.className + '|' + (UI && UI.editLayout ? 1 : 0) + '|' + (el.parentElement ? el.parentElement.clientWidth : 0) + '|' + document.documentElement.style.fontSize; // (and the room it has, and the text size setting) if (FIT_C.has(fk)) { const v = FIT_C.get(fk); if (el.style.fontSize !== v) el.style.fontSize = v; el.title = el.value || ''; return; }
  fitNameFont0(el); if (el.clientWidth > 0) FIT_C.set(fk, el.style.fontSize);
}
function fitNameFont0(el) {
  el.style.fontSize = ''; const w = (el.clientWidth - 14) * 0.93; if (w <= 0) return;
  const cs = getComputedStyle(el), base = parseFloat(cs.fontSize), ctx = (_fitCv = _fitCv || document.createElement('canvas')).getContext('2d');
  ctx.font = `${cs.fontWeight} ${base}px ${cs.fontFamily}`;
  const tw = ctx.measureText(el.value || el.placeholder || '').width;
  if (tw > w) { let fs = Math.max(10, Math.floor(base * w / tw)); el.style.fontSize = fs + 'px'; while (el.scrollWidth > el.clientWidth && fs > 10) el.style.fontSize = --fs + 'px'; }
  el.title = el.value || '';
}

// ---------- Settings ----------
let SETTAB = 'char';
function openSettings(tab) {
  SETTAB = tab || 'char';
  const th = S.theme || {};
  const opt = (k, opts) => `<select class="f" data-set="${k}">${opts.map(([v, t]) => `<option value="${v}"${String(ST(k)) === String(v) ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
  const tog = (k, t, sub) => `<label class="setrow"><input type="checkbox" data-set="${k}"${ST(k) ? ' checked' : ''}><span><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</span></label>`;
  const row = (t, ctl, sub) => `<div class="setrow"><span><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</span>${ctl}</div>`;
  const col = (k, label, def) => `<label class="colpick"><input type="color" data-themekey="${k}" value="${esc(th[k] || def)}"><span>${label}</span>${th[k] ? `<button class="linkbtn" data-act="setpreset" data-k="${k}" data-v="">reset</button>` : ''}</label>`;
  const presets = [['#E0A526', '#26304A'], ['#C2462E', '#2A1E1E'], ['#2F8F5B', '#1C2C26'], ['#3A7BD5', '#1B2540'], ['#8A4FD1', '#241B38'], ['#D04F8E', '#2E1A28'], ['#1E9AA0', '#16292D'], ['#B08A4E', '#2B2620']];
  const TABS = [['char', 'Character &amp; sheet'], ['rules', 'Rules'], ['dice', 'Dice'], ['theme', 'Theme'], ['data', 'Backup &amp; files']].filter(([k]) => !(window.SHEET_PAGES && k === 'data'));  // on the website the cloud is the backup
  if (window.SHEET_PAGES && SETTAB === 'data') SETTAB = 'char';
  const pane = (k, h) => `<section class="stpane${SETTAB === k ? ' on' : ''}" data-pane="${k}" role="tabpanel">${h}</section>`;
  openModal(`<div class="sethead"><h3>Settings</h3><button class="btn sm" data-act="close">Done</button></div>
    <div class="stabs" role="tablist">${TABS.map(([k, t]) => `<button class="stab${SETTAB === k ? ' on' : ''}" data-act="settab" data-k="${k}" role="tab" aria-selected="${SETTAB === k}">${t}</button>`).join('')}<span class="stab-ink"></span></div>
    <div class="setx">
    ${pane('char', `
      ${row('Race', `<button class="btn sm" data-act="changerace">Change…</button>`, esc(S.raceName || '—'))}
      ${row('Background', `<button class="btn sm" data-act="changebg">Change…</button>`, esc(S.backgroundName || '—'))}
      ${subclassSettingsHTML()}
      ${row('Leveling', opt('advancement', [['milestone', 'Milestone'], ['xp', 'XP']]), '')}
      ${row('Ability blocks', opt('abilityStyle', [['mod', 'Modifier big'], ['score', 'Score big']]))}
      ${row('Spell sorting', opt('combatSpellSort', [['level', 'Grouped by level'], ['purpose', 'Grouped by purpose'], ['custom', 'My own categories (set up on the Spells tab)']]))}
      <div class="setrow chkrow"><span><b>Show in header</b></span><span class="chkset">${[['showName', 'Name'], ['showPlayer', 'Player'], ['showRace', 'Race'], ['showBackground', 'Background'], ['showAlignment', 'Alignment'], ['showFaith', 'Faith']].map(([k, t]) => `<label class="checkline"><input type="checkbox" data-set="${k}"${ST(k) ? ' checked' : ''}> ${t}</label>`).join('')}</span></div>
      ${booksHTML()}
`)}
    ${pane('dice', `
      <div class="dicemodes">${[['sheet', 'The sheet rolls', 'Every roll happens here, fully automated.'], ['manual', 'I use my own rolls', 'Shows the dice to roll; asks for your total only when automation needs it (healing, temp HP, death saves…). Everything else is still tracked.'], ['roll20', 'Roll20 rolls for me', 'Rolls post to your Roll20 game’s chat and the results come back here (needs the companion extension).']].filter(([v]) => v !== 'roll20' || window.SHEET_PAGES).concat(window.SHEET_PAGES && (isMobile() || diceMode() === 'remote') ? [['remote', 'Roll in Roll20 from my phone', 'Roll here and it posts in Roll20 through this character open on your computer (with “Roll20 rolls for me” on there). Play from anywhere in the house.']] : []).map(([v, t, d]) => `<label class="dmode${diceMode() === v ? ' on' : ''}"><input type="radio" name="dicemode" data-set="diceMode" value="${v}"${diceMode() === v ? ' checked' : ''}><span><b>${t}</b>${diceMode() === v ? `<small>${d}</small>` : ''}${v === 'sheet' && diceMode() === v && !isMobile() && window.SHEET_PAGES ? `<span class="dsub"><input type="checkbox" data-set="sheetToR20"${ST('sheetToR20') ? ' checked' : ''} aria-label="Also show my rolls in Roll20"><span>Also show my rolls in Roll20<small>Each result is posted to your Roll20 game’s chat too (needs the extension and your game open).</small></span></span>` : ''}</span></label>`).join('')}</div>
      ${window.SHEET_PAGES && (diceMode() === 'roll20' || (diceMode() === 'sheet' && ST('sheetToR20') && !isMobile())) ? '<div id="r20status" class="r20box"></div>' : ''}
      ${diceMode() === 'remote' ? '<div id="relaystatus" class="r20box"><span class="rs-ic">…</span><div class="rs-t"><span>Checking for your computer…</span></div></div>' : ''}
      <button class="r20macros" data-act="macros" title="Copy Roll20 macros for everything rollable" aria-label="Roll20 macros"><img src="${R20_LOGO}" alt=""></button>
      <p class="hint" style="margin:4px 0 0">Copy macros for every attack, save, skill and spell.</p>
      ${!window.SHEET_PAGES ? '' : (() => { const ok = r20AuraOK(), why = !R20.ok ? 'Needs the Roll20 companion extension (and your game open in Roll20).' : !ok ? 'Download the extension again (button above) to get this — your copy is older.' : 'Your auras (like Aura of Protection) go on and off by themselves as party members’ tokens move in and out of range. Each person is still asked first, with how far apart you are. Tokens are matched to characters by name.';
        return `<label class="setrow r20aura${ok ? '' : ' dis'}"${ok ? '' : ` title="${esc(why)}"`}><input type="checkbox" data-set="r20auras"${ok && ST('r20auras') ? ' checked' : ''}${ok ? '' : ' disabled'}><span><b>Auras follow Roll20 tokens</b><small>${esc(why)}</small></span></label>`; })()}
    `)}
    ${pane('rules', `
      ${row('Exhaustion', opt('exhaustionRule', [['2014', '2014 table'], ['2024', '2024 rule']]), exModern() ? '−2 to d20s and −5 ft per level' : 'Effects stack by level')}
      ${exModern() ? tog('exhaustionDC', 'Exhaustion also lowers spell save DC', 'House rule: −1 per level') : ''}
      ${row('Critical hits', opt('critRule', [['double', 'Roll dice twice'], ['max', 'Max dice + roll']]))}
      ${row('Encumbrance', opt('encumbrance', [['off', 'Off'], ['standard', 'Standard (carrying capacity)'], ['variant', 'Variant (encumbered / heavily)']]), ST('encumbrance') === 'variant' ? '−10 ft over 5×STR lb, −20 ft over 10×STR' : ST('encumbrance') === 'standard' ? 'Carry up to 15 × STR lb' : 'Weights are ignored')}
      ${hasSub('artificer', 'artillerist') ? tog('protectorScales', 'Protector cannon scales with Explosive Cannon', 'House rule — 2d8 + INT temp HP from 9th level, like the other two') : ''}
      ${tog('electrum', 'Use electrum pieces (EP)', 'Shows electrum in the coin purse — most tables skip it')}
      ${tog('nat1Roll', 'Nat 1 Roll: a natural 1 on an attack also rolls a d4', 'House rule — the d4 is always the last roll')}
      ${tog('inspiration', 'Track Inspiration', 'A − / + counter under your portrait')}
      <label class="setrow subset${ST('inspiration') ? '' : ' dis'}" title="${ST('inspiration') ? '' : 'Turn on Track Inspiration first'}"><input type="checkbox" data-set="inspMany"${ST('inspMany') ? ' checked' : ''}${ST('inspiration') ? '' : ' disabled'}><span><b>More than one Inspiration</b><small>House rule — no limit on how many you can hold${ST('inspiration') ? '' : ' (turn on Track Inspiration to use it)'}</small></span></label>
      ${tog('concPrompt', 'Concentration save prompt when hurt')}
      ${tog('durationAlerts', 'Warn when spells are ending')}
      ${tog('autoSpend', 'Using things in Combat marks the action spent')}
    
      <p class="hint" style="margin:8px 0 0">Rules text marked SRD is from the System Reference Document 5.1 by Wizards of the Coast LLC (CC-BY-4.0). Other descriptions are written for this sheet. Any spell or feature can use your own wording instead (edit it on the Spells or Features tab).</p>
`)}
    ${pane('theme', `${isMobile() ? row('Bottom tab bar position', `<span class="liftctl"><button class="btn sm" data-act="tablift" data-d="-8" aria-label="Lower">−</button><b>${tabLift()}</b><button class="btn sm" data-act="tablift" data-d="8" aria-label="Raise">+</button></span>`, 'This device only. Raise it if the browser\'s own toolbar covers the tabs (Safari does this).') : ''}

      <div class="swatches">${presets.map(([a, b]) => `<button class="sw" style="background:linear-gradient(135deg, ${b} 50%, ${a} 50%)" data-act="setpreset" data-k="pair" data-v="${a}|${b}" aria-label="Preset"></button>`).join('')}</div>
      <div class="colrow">${col('accent', 'Accent', '#E0A526')}${col('banner', 'Header', '#26304A')}${col('bg', 'Page background', '#E6E4DC')}</div>
      <div class="row" style="margin-top:6px"><button class="btn sm" data-act="themeportrait" ${S.portrait ? '' : 'disabled'}>Match colors to portrait</button><button class="btn sm ghost" data-act="setpreset" data-k="all" data-v="">Default colors</button></div>
      ${row('Light / dark', `<button class="btn sm" data-act="theme">Switch</button>`)}
      ${row('Text size', opt('fontScale', [[90, 'Small'], [100, 'Normal'], [110, 'Large'], [120, 'Extra large']]))}
    `)}
    ${pane('data', `${row('Download this character', `<button class="btn sm" data-act="savehtml">Download (.html)</button>`, 'A copy of this sheet with everything baked in — share or keep it')}
      ${row('Export data', `<button class="btn sm" data-act="export">Export (.json)</button>`, 'Backup or move to another device')}
      ${row('Import data', `<button class="btn sm" data-act="import">Import (.json)</button>`, 'Load a previous export')}
      ${row('Update this sheet', `<button class="btn sm" data-act="updatesheet">Update…</button>`, `Version ${APP_VERSION} · move into a newer sheet file`)}
      ${row('Start over', `<button class="btn sm red" data-act="newchar">New character…</button>`, 'Clears this sheet — download it first to keep it')}`)}
    </div>`, null, true);
  setTabInk(false); mwDress(); fitSettingsHeight(!REOPEN);   // the title bar goes on first, so the height counts it
  if ($('#r20status')) { renderR20Box(); r20Hello(); }
}
function setSetting(t) {
  const k = t.dataset.set; let v = t.type === 'checkbox' ? t.checked : t.value;
  if (k === 'fontScale') v = N(v);
  S.settings = Object.assign({}, S.settings, { [k]: v });
  pendingLabel = 'Setting: ' + k; save(); applyTheme(); render();
  if (k === 'inspiration') { const m = document.querySelector('#modal-body [data-set="inspMany"]'); if (m) { m.disabled = !v; const l = m.closest('.setrow'); l.classList.toggle('dis', !v); l.title = v ? '' : 'Turn on Track Inspiration first'; const sm = l.querySelector('small'); if (sm) sm.textContent = 'House rule — no limit on how many you can hold' + (v ? '' : ' (turn on Track Inspiration to use it)'); } }
  if (k === 'sheetToR20') { reopenSettings(); if (v) setTimeout(() => { r20Hello(); setTimeout(renderR20Box, 500); }, 50); }
  if (k === 'diceMode') { setTimeout(relayStatus, 50); reopenSettings(); toast(v === 'manual' ? 'You use your own rolls — the sheet tracks everything and asks for totals only when it needs them.' : v === 'roll20' ? 'Rolls go to Roll20 once the extension is connected.' : v === 'remote' ? 'Rolls from this phone go to Roll20 through your computer.' : 'The sheet rolls the dice again.'); }
}
function setThemeColor(k, v, live) {
  const th = Object.assign({}, S.theme);
  if (k === 'pair') { const [a, b] = v.split('|'); th.accent = a; th.banner = b; }
  else if (k === 'all') { th.accent = ''; th.banner = ''; th.bg = ''; }
  else th[k] = v;
  S.theme = th; pendingLabel = 'Edit: Theme colors'; save(); applyTheme();
  if (!live) { render('header'); if ($('#modal').classList.contains('open') && $('.setx')) reopenSettings(); }
}

// ---------- Edit layout ----------
// Everything outlined in edit mode can be dragged by its ⠿ handle (mouse or touch):
// panels (also onto another tab), tabs, the stat tiles, toolbar buttons, the Equipped/Pack columns,
// the action columns and the ability blocks. The ⋯ menu on a panel has the same moves as buttons.
const PNAMES = { oocmain: 'Out of initiative: spells, features & checks', abilities: 'Abilities & Saves', skills: 'Skills', attacks: 'Attacks', profs: 'Proficiencies', turnbar: 'Turn tracker', slots: 'Spell slots', activefx: 'Active spells', cmini: 'Creatures (combat)', economy: 'Actions', spellcasting: 'Spellcasting', spelllist: 'Spell list', classes: 'Classes & Levels', featlist: 'Features', inventory: 'Inventory', companions: 'Creatures', personality: 'Personality', appearance: 'Appearance', backstory: 'Backstory', rumors: 'Rumors', people: 'People', quotes: 'Quotes', lore: 'Lore', goals: 'Goals & To-Do', sessions: 'Session notes' };
const PAGE_COLS = { core: 3, combat: 2, spells: 1, features: 1, inventory: 1, companions: 1, story: 2, notes: 2 };
const ZNAMES = { vitals: 'stat tiles', toolbar: 'toolbar buttons', invcols: 'inventory columns', econ: 'action columns', abil: 'ability blocks' };
const LY = () => { const L = S.layout = S.layout || {}; L.pages = L.pages || {}; L.cols = L.cols || {}; L.hidden = L.hidden || []; L.wide = L.wide || []; L.zones = L.zones || {}; L.zhidden = L.zhidden || []; return L; };
const pageOf = el => { const p = el && el.closest('.page'); return p ? p.id.replace('page-', '') : ''; };
const tabLabel = k => (((S.layout || {}).tabNames || {})[k]) || (TABS0.concat(ctabs().map(t => [t.key, t.name])).find(t => t[0] === k) || [0, k])[1];
function pidsIn(pg) { return $$('#page-' + pg + ' [data-pid]').map(e => e.dataset.pid); }
function ensurePage(pg) { const L = LY(); if (!L.pages[pg]) L.pages[pg] = pidsIn(pg); return L.pages[pg]; }
// Re-placing modules moves them in the page, which drops keyboard focus. Put the cursor back where it was,
// so typing in a field (like a new item's name) isn't cut off after one letter.
function applyPanelLayout() {
  const a = document.activeElement, typing = a && a !== document.body && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable);
  let s0 = null, s1 = null, dir; if (typing) { try { s0 = a.selectionStart; s1 = a.selectionEnd; dir = a.selectionDirection; } catch (e) {} }
  const sx = scrollX, sy = scrollY;
  _applyPanelLayout();
  if (typing && a.isConnected && document.activeElement !== a) { a.focus({ preventScroll: true }); if (s0 != null) { try { a.setSelectionRange(s0, s1, dir); } catch (e) {} } if (scrollX !== sx || scrollY !== sy) scrollTo(sx, sy); }
}
function _applyPanelLayout() {
  ensureCustomPages();
  const L = S.layout || {}, pages = L.grid ? {} : (L.pages || {}), ae = document.activeElement, ed = !!UI.editLayout;
  // Panels added in later versions go next to their neighbours in a saved layout.
  [['spells', 'mmspells', 'spellcasting'], ['combat', 'metamagic', 'activefx']].forEach(([pg, id, after]) => { const a = pages[pg]; if (a && !a.includes(id) && $(`#page-${pg} [data-pid="${id}"]`)) { const k = a.indexOf(after); a.splice(k < 0 ? a.length : k + 1, 0, id); } });
  // The Spells tab's Spell Slots and Active Spells panels (same look as Combat) go at the top, before the class cards.
  { const a = pages.spells; if (a) [['spslots', null], ['spfx', 'spslots']].forEach(([id, after]) => { if (a.includes(id) || !$(`#page-spells [data-pid="${id}"]`)) return; const k = after ? a.indexOf(after) + 1 : Math.max(0, a.indexOf('spellcasting')); a.splice(k < 0 ? 0 : k, 0, id); }); }
  const by = {};
  $$('.page [data-pid]').forEach(el => (by[el.dataset.pid] = by[el.dataset.pid] || []).push(el));
  Object.keys(by).forEach(id => { const els = by[id]; if (els.length < 2) return; const keep = els.find(e => e.contains(ae)) || els.reduce((a, b) => (N(b.dataset.gen) > N(a.dataset.gen) ? b : a)); els.forEach(e => { if (e !== keep) e.remove(); }); by[id] = [keep]; });
  if (L.grid) gridApply(by);
  const listed = new Set(Object.values(pages).flat());
  Object.keys(pages).forEach(pg => {
    const page = $('#page-' + pg); if (!page) return;
    const flow = document.createElement('div'); flow.className = 'flow';
    flow.style.setProperty('--cols', (L.cols || {})[pg] || PAGE_COLS[pg] || 2);
    pages[pg].forEach(id => { const el = by[id] && by[id][0]; if (el) flow.appendChild(el); });
    $$('[data-pid]', page).forEach(el => { if (!flow.contains(el) && !listed.has(el.dataset.pid)) flow.appendChild(el); });
    [...page.children].forEach(c => { if (!c.contains(flow)) c.remove(); });
    page.appendChild(flow);
  });
  $$('.page .stack, .page .cstrip').forEach(w => { if (!w.children.length) w.remove(); });
  // Small reorderable groups
  $$('[data-zone]').forEach(z => {
    const order = z.dataset.ordered !== undefined ? null : (L.zones || {})[z.dataset.zone]; if (order) order.forEach(id => { const c = [...z.children].find(x => x.dataset && x.dataset.zi === id); if (c) z.appendChild(c); });
    [...z.children].forEach(c => {
      if (!c.dataset || !c.dataset.zi) return;
      const key = z.dataset.zone + ':' + c.dataset.zi, hid = (L.zhidden || []).includes(key);
      c.classList.toggle('zhid', hid);
      $$(':scope > .zh, :scope > .zx', c).forEach(x => x.remove());
      // The top of the sheet (header buttons, HP/AC tiles) and the ability boxes stay put; tabs and the combat/inventory columns can move.
      if (ed && !NOEDIT_ZONES.includes(z.dataset.zone)) c.insertAdjacentHTML('afterbegin', `<span class="zh" data-handle="zone" title="Drag to move">${GRIP_SVG}</span><button class="zx" data-act="zhide" data-k="${esc(key)}" title="${hid ? 'Show' : 'Hide'}">${hid ? '+' : '–'}</button>`);
    });
  });
  // Old-style hidden panels (classic layouts) stay hidden; the grid layout handles its own.
  $$('[data-pid]').forEach(el => { const id = el.dataset.pid; el.classList.toggle('phid', panelHidden(id)); el.classList.toggle('pwide', !L.grid && (L.wide || []).includes(id)); });
  // A two-column strip with one side hidden (no spell slots, say) lets the other side take the full width.
  $$('.cstrip').forEach(c => c.classList.toggle('one', [...c.children].filter(k => !k.classList.contains('phid') && getComputedStyle(k).display !== 'none').length < 2));
  editDecorate();
}
const NOEDIT_ZONES = ['vitals', 'toolbar', 'abil'];
const GRIP_SVG = '<svg viewBox="0 0 10 14" width="9" height="12" aria-hidden="true"><g fill="currentColor"><circle cx="3" cy="2.5" r="1.3"/><circle cx="7" cy="2.5" r="1.3"/><circle cx="3" cy="7" r="1.3"/><circle cx="7" cy="7" r="1.3"/><circle cx="3" cy="11.5" r="1.3"/><circle cx="7" cy="11.5" r="1.3"/></g></svg>';
function layoutChanged(label) { pendingLabel = label; save(); render(); }
function panelMove(id, d) {
  const el = $(`.page [data-pid="${id}"]`), pg = pageOf(el); if (!pg) return;
  const L = ensurePage(pg), i = L.indexOf(id), j = i + d; if (i < 0 || j < 0 || j >= L.length) return;
  [L[i], L[j]] = [L[j], L[i]]; layoutChanged('Move panel');
}
function panelTo(id, pg, refId, after) {
  const el = $(`.page [data-pid="${id}"]`), from = pageOf(el); if (!from) return;
  ensurePage(from); ensurePage(pg);
  const P = LY().pages; P[from] = P[from].filter(x => x !== id); P[pg] = P[pg].filter(x => x !== id);
  let k = refId ? P[pg].indexOf(refId) : -1; if (k >= 0 && after) k++;
  if (k >= 0) P[pg].splice(k, 0, id); else P[pg].push(id);
  layoutChanged(from === pg ? 'Move panel' : `Move ${PNAMES[id] || id} to ${tabLabel(pg)}`);
  if (from !== pg) toast(`${esc(PNAMES[id] || id)} moved to ${esc(tabLabel(pg))}.`, '', 4000, [{ label: 'Go there', fn: () => { UI.tab = pg; saveUI(); render(); } }, { label: 'Undo', fn: () => undo(1) }]);
}
function panelToggle(id, key) { const L = LY();
  if (key === 'hidden' && panelAutoHidden(id)) { L.shown = L.shown || []; const hid = panelHidden(id); if (hid) { L.hidden = L.hidden.filter(x => x !== id); if (!L.shown.includes(id)) L.shown.push(id); } else { L.shown = L.shown.filter(x => x !== id); } layoutChanged('Hide/show ' + (PNAMES[id] || id)); return; }
  const a = L[key]; const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.push(id); layoutChanged((key === 'hidden' ? 'Hide/show ' : 'Width: ') + (PNAMES[id] || id)); }
function pageCols(pg, n) { ensurePage(pg); LY().cols[pg] = n; layoutChanged(`Columns on ${tabLabel(pg)}: ${n}`); }
function pageReset(pg) {
  const L = LY(); const mine = $$('.page [data-pid]').filter(e => e.dataset.home === pg).map(e => e.dataset.pid);
  delete L.pages[pg]; delete L.cols[pg];
  Object.keys(L.pages).forEach(p => { L.pages[p] = L.pages[p].filter(x => !mine.includes(x)); });
  L.hidden = L.hidden.filter(x => !mine.includes(x)); L.wide = L.wide.filter(x => !mine.includes(x));
  const zonesHere = $$('#page-' + pg + ' [data-zone]').map(z => z.dataset.zone);
  zonesHere.forEach(z => delete L.zones[z]); L.zhidden = L.zhidden.filter(k => !zonesHere.includes(k.split(':')[0]));
  layoutChanged('Reset tab layout');
}
function zoneMove(zone, id, ref, after) {
  const z = $(`[data-zone="${zone}"]`); if (!z) return;
  const order = [...z.children].map(c => c.dataset && c.dataset.zi).filter(Boolean).filter(x => x !== id);
  let k = order.indexOf(ref); if (k < 0) k = order.length; else if (after) k++;
  order.splice(k, 0, id); LY().zones[zone] = order; layoutChanged('Rearrange ' + (ZNAMES[zone] || zone));
}
function zoneHide(key) { const L = LY(), i = L.zhidden.indexOf(key); if (i >= 0) L.zhidden.splice(i, 1); else L.zhidden.push(key); layoutChanged('Hide/show item'); }
function tabMove(k, d) {
  const L = LY(), order = tabOrder().map(t => t[0]), i = order.indexOf(k), j = i + d; if (j < 0 || j >= order.length) return;
  [order[i], order[j]] = [order[j], order[i]]; L.tabs = order; layoutChanged('Reorder tabs');
}
function tabHide(k) { const L = LY(); L.hiddenTabs = L.hiddenTabs || []; L.shownTabs = L.shownTabs || [];
  if (tabAutoHidden(k)) { if (tabHidden(k)) { L.hiddenTabs = L.hiddenTabs.filter(x => x !== k); if (!L.shownTabs.includes(k)) L.shownTabs.push(k); } else L.shownTabs = L.shownTabs.filter(x => x !== k); }
  else { const i = L.hiddenTabs.indexOf(k); if (i >= 0) L.hiddenTabs.splice(i, 1); else L.hiddenTabs.push(k); }
  layoutChanged('Hide/show tab'); }
function tabRename(k) {
  openModal(`<h3>Rename tab</h3>${fld('Name', `<input class="f" id="tabName" value="${esc(tabLabel(k))}" autofocus>`)}<div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="tabrenameok" data-k="${k}">Save</button></div>`);
}
function tabRenameOK(k) { const L = LY(); L.tabNames = Object.assign({}, L.tabNames, { [k]: $('#tabName').value.trim() || undefined }); closeModal(true); layoutChanged('Rename tab'); }
// Pointer-based dragging works the same with a mouse, pen or finger.
let PD = null;
document.addEventListener('pointerdown', e => {
  if (!UI.editLayout || e.button > 0) return;
  const h = e.target.closest('[data-handle]'); if (!h) return;
  const kind = h.dataset.handle, item = kind === 'panel' ? h.closest('[data-pid]') : kind === 'zone' ? h.closest('[data-zi]') : h.closest('.tabwrap');
  if (!item) return;
  e.preventDefault();
  PD = { kind, item, x0: e.clientX, y0: e.clientY, on: false, zone: kind === 'zone' ? item.parentElement : null, label: kind === 'panel' ? PNAMES[item.dataset.pid] || item.dataset.pid : kind === 'tab' ? tabLabel(item.dataset.tabkey) : (ZNAMES[item.parentElement.dataset.zone] || 'item') };
});
function dropClear() { $$('.drop-before, .drop-after, .dropon').forEach(x => x.classList.remove('drop-before', 'drop-after', 'dropon')); }
document.addEventListener('pointermove', e => {
  if (!PD) return;
  const x = e.clientX, y = e.clientY;
  if (!PD.on) {
    if (Math.hypot(x - PD.x0, y - PD.y0) < 6) return;
    PD.on = true; PD.item.classList.add('dragging'); document.body.classList.add('dragging-any');
    PD.ghost = document.createElement('div'); PD.ghost.className = 'dghost'; PD.ghost.textContent = '⠿ ' + PD.label; document.body.appendChild(PD.ghost);
  }
  PD.ghost.style.transform = `translate(${x + 14}px, ${y + 10}px)`;
  PD.ghost.style.display = 'none'; const el = document.elementFromPoint(x, y); PD.ghost.style.display = '';
  const overTabs = el && el.closest('#tabs, #editbar');
  if (!overTabs) { if (y < 40) window.scrollBy(0, -14); else if (y > innerHeight - 120) window.scrollBy(0, 14); }
  dropClear(); PD.target = null; if (!el) return;
  const side = (r, axis) => (axis === 'y' ? y > r.top + r.height / 2 : (y > r.bottom ? true : y < r.top ? false : x > r.left + r.width / 2));
  if (PD.kind === 'panel') {
    const tab = el.closest('.tabwrap');
    if (tab) { tab.classList.add('dropon'); PD.target = { t: 'tab', pg: tab.dataset.tabkey }; return; }
    const p = el.closest('.page [data-pid]');
    if (p && p !== PD.item && !PD.item.contains(p)) { const after = side(p.getBoundingClientRect(), 'y'); p.classList.add(after ? 'drop-after' : 'drop-before'); PD.target = { t: 'panel', id: p.dataset.pid, after, pg: pageOf(p) }; return; }
    const pg = el.closest('.page.on'); if (pg) { pg.classList.add('dropon'); PD.target = { t: 'page', pg: pg.id.replace('page-', '') }; }
  } else if (PD.kind === 'zone') {
    const c = el.closest('[data-zi]');
    if (c && c !== PD.item && c.parentElement === PD.zone) { const after = side(c.getBoundingClientRect(), PD.zone.dataset.axis || 'x'); c.classList.add(after ? 'drop-after' : 'drop-before'); PD.target = { t: 'zone', id: c.dataset.zi, after }; }
  } else {
    const t = el.closest('.tabwrap');
    if (t && t !== PD.item) { const after = side(t.getBoundingClientRect(), 'x'); t.classList.add(after ? 'drop-after' : 'drop-before'); PD.target = { t: 'tab', key: t.dataset.tabkey, after }; }
  }
});
document.addEventListener('pointerup', () => {
  if (!PD) return;
  const d = PD; PD = null; dropClear(); document.body.classList.remove('dragging-any');
  if (d.ghost) d.ghost.remove(); d.item.classList.remove('dragging');
  if (!d.on || !d.target) return;
  const T = d.target;
  if (d.kind === 'panel') { const id = d.item.dataset.pid; if (T.t === 'tab' || T.t === 'page') panelTo(id, T.pg); else panelTo(id, T.pg, T.id, T.after); }
  else if (d.kind === 'zone') zoneMove(d.zone.dataset.zone, d.item.dataset.zi, T.id, T.after);
  else { const k = d.item.dataset.tabkey, order = tabOrder().map(t => t[0]).filter(x => x !== k); let i = order.indexOf(T.key); if (T.after) i++; order.splice(i, 0, k); LY().tabs = order; layoutChanged('Reorder tabs'); }
});
document.addEventListener('pointercancel', () => { if (PD) { if (PD.ghost) PD.ghost.remove(); PD.item.classList.remove('dragging'); PD = null; dropClear(); document.body.classList.remove('dragging-any'); } });
function addProf(kind, v) {
  if (kind === 'weapon') { S.profs.weaponNames = [...new Set((S.profs.weaponNames || []).concat([v]))]; }
  else if (kind === 'tool') addText('profTools', [v]);
  else addText('languages', [v]);
  pendingLabel = 'Add ' + (kind === 'lang' ? 'language' : kind) + ': ' + v; save(); render();
}

// Original description of an automatic feature (for "Restore original").
function findFeatureDesc(f) {
  const k = String(f.key || ''), parts = k.split(':');
  if (CL[parts[0]]) { const c = CL[parts[0]]; if (parts.length === 2) { const x = c.features.find(z => z[1] === parts[1]); return x ? x[2] : null; } const s = c.subclasses[parts[1]]; const x = s && s.features.find(z => z[1] === parts[2]); return x ? x[2] : null; }
  if (parts[0] === 'race') { const r = raceInfo(); const x = r && r.traits.find(t => t[0] === parts[1]); return x ? x[1] : null; }
  if (parts[0] === 'feat') { const x = DND.feats.find(z => z[0] === parts[1]); return x ? x[3] : null; }
  if (parts[0] === 'bg') { const b = DND.backgrounds[S.background]; return b ? b.feature[1] : null; }
  if (parts[0] === 'pick') { const op = DND.options[parts[1]]; const x = op && op.list.find(z => z[0] === parts.slice(2).join(':')); return x ? x[1] : null; }
  return null;
}

// ---------- Automatic ammunition ----------
// Weapons with the ammunition property find matching ammo in your inventory on their own
// (bows → arrows, crossbows → bolts, slings → bullets, blowguns → needles, firearms → bullets/rounds).
const AMMO_FOR = [[/long ?bow|short ?bow|\bbow\b/i, /arrow/i], [/crossbow/i, /bolt|quarrel/i], [/sling/i, /bullet|stone|pellet/i], [/blowgun/i, /needle|dart/i], [/pistol|musket|rifle|gun|flintlock|revolver|blunderbuss/i, /bullet|round|cartridge|shot|powder|ammunition/i]];
const isFirearm = it => /pistol|musket|rifle|gun|flintlock|revolver|blunderbuss/i.test((it && ((it.weapon && it.weapon.base) || it.name)) || '');
function autoAmmo(a) {
  if (!a || !a.item) return false;
  const it = S.inventory.find(x => x.id === a.item); if (!it || !it.weapon || !(it.weapon.props || []).includes('ammunition')) return false;
  const cur = a.ammo && S.inventory.find(x => x.id === a.ammo);
  if (cur && N(cur.qty) > 0) return false;
  const nm = (it.weapon.base || '') + ' ' + it.name, rule = AMMO_FOR.find(([w]) => w.test(nm));
  const cands = S.inventory.filter(x => !x.weapon && x !== it && N(x.qty) > 0 && (rule ? rule[1].test(x.name) : /ammunition|arrow|bolt|bullet/i.test(x.name)));
  const pick = cands.find(x => !/freeze|silver|\+\d|magic|special/i.test(x.name)) || cands[0] || (!cur && S.inventory.find(x => !x.weapon && x !== it && (rule ? rule[1].test(x.name) : /ammunition/i.test(x.name))));
  if (pick && pick.id !== a.ammo) { a.ammo = pick.id; return true; }
  return false;
}
function syncAmmo() { let ch = false; S.attacks.forEach(a => { if (autoAmmo(a)) ch = true; }); return ch; }

// ---------- Change race / background (from Settings) ----------
// Uses the same pickers as character creation. What the old choice granted (fixed bonuses, skills,
// languages, proficiencies) is removed when that box is ticked; choices you made for it can't be traced, so check those.
let RC = null;
const titleCase = s => String(s || '').replace(/\b\w/g, c => c.toUpperCase());
function openRaceChange() {
  RC = { kind: 'race', removeOld: true, custom: Object.assign({ name: '', size: 'Medium', speed: 30, darkvision: 0, traits: '' }, S.race.key === 'custom' ? { ...S.race.custom, traits: (S.race.custom.traits || []).map(t => t[0] + ': ' + t[1]).join('\n') } : {}) };
  W = { race: S.race.key, sub: S.race.sub, tasha: false, ans: {} }; ['rcrace', 'rcsub'].forEach(k => { delete WZ3M[k + ':q']; delete WZ3M[k + ':s']; });
  openModal('<div id="rcmodal"></div>', () => { RC = null; W = null; }, true); renderRaceChange();
}
// (the cards are drawn by the site's own styles; the downloadable sheet keeps the plain lists)
const rcCards = () => !!window.wzHeader || document.documentElement.classList.contains('pg-sheetpage');
function renderRaceChange() {
  const x = W.race === 'custom' ? null : wzRace(), c = RC.custom;
  const body = W.race === 'custom' ? `<div class="wz-grid">${fld('Race name', `<input class="f" data-rc="name" value="${esc(c.name)}" placeholder="e.g. Sea Elf (homebrew)">`)}${fld('Size', `<select class="f" data-rc="size">${['Tiny', 'Small', 'Medium', 'Large'].map(z => `<option${c.size === z ? ' selected' : ''}>${z}</option>`).join('')}</select>`)}
      ${fld('Speed (ft)', `<input class="f" type="number" data-rc="speed" value="${esc(c.speed)}">`)}${fld('Darkvision (ft)', `<input class="f" type="number" data-rc="darkvision" value="${esc(c.darkvision)}">`)}</div>
      ${fld('Traits — one per line, "Name: what it does"', `<textarea class="f" rows="5" data-rc="traits" placeholder="Keen Senses: proficiency in Perception">${esc(c.traits)}</textarea>`)}
      <p class="hint">Adjust ability scores, skills and languages on the Core tab to match your custom race.</p>`
    : x ? `<div class="wz-info"><p><b>${esc(x.name)}</b> · speed ${x.s.speed || x.r.speed || 30} ft${(x.s.darkvision || x.r.darkvision) ? ' · darkvision ' + (x.s.darkvision || x.r.darkvision) + ' ft' : ''}</p>
        <ul>${((x.s.replaceTraits ? [] : x.r.traits || []).concat(x.s.traits || [])).map(t => `<li><b>${esc(t[0])}</b> — ${esc(t[1])}</li>`).join('')}</ul>
        ${wzRaceAsiUI()}${wzRaceChoices().map((ch, k) => choiceUI(W.ans, 'race.' + k, ch)).join('')}</div>` : '';
  // (the same race and variant cards as character creation; the lists underneath are what they set)
  $('#rcmodal').innerHTML = `<h3>Change race</h3>
    ${rcCards() ? wz3Cards('race') + (x && x.r.subraces ? `<p class="wz3-sublbl">${esc(x.r.name)} variant</p>${wz3Cards('sub')}` : '') : ''}
    <div class="wz-grid${rcCards() ? ' wz3-hid' : ''}">${fld('Race', `<select class="f" data-rc="race"><option value="">— choose —</option>${DND.raceGroups.map(([g, ks]) => `<optgroup label="${esc(g)}">${ks.filter(k => DND.races[k]).sort((a, b) => abc(DND.races[a].name, DND.races[b].name)).map(k => `<option value="${k}"${W.race === k ? ' selected' : ''}>${esc(DND.races[k].name)}${DND.races[k].src !== 'PHB' ? ' (' + DND.races[k].src + ')' : ''}</option>`).join('')}</optgroup>`).join('')}<option value="custom"${W.race === 'custom' ? ' selected' : ''}>✎ Custom race…</option></select>`)}
      ${x && x.r.subraces ? fld('Subrace', `<select class="f" data-rc="sub"><option value="">— choose —</option>${Object.entries(x.r.subraces).sort(([, a], [, b]) => abc(a.name, b.name)).map(([k, s]) => `<option value="${k}"${W.sub === k ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select>`) : ''}</div>
    ${body}
    <label class="checkline" style="margin-top:8px"><input type="checkbox" data-rc="removeOld"${RC.removeOld ? ' checked' : ''}> Remove what ${esc(S.raceName || 'my old race')} gave me (fixed ability bonuses, skills, languages, weapon and armor training)</label>
    <p class="hint">Traits, speed, senses, racial spells and natural weapons update automatically. Ability bonuses you placed yourself (like +2/+1) can't be traced — check your scores afterwards.</p>
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="rcok">Change race</button></div>`;
  $$('#rcmodal > .wz3-pick').forEach((bx, i) => wz3Keep(bx, i ? 'rcsub' : 'rcrace'));
  { const rl = $('#rcmodal > .wz3-pick .wz3-cards'); if (rl) rl.classList.add('has'); } // (the race list scrolls in its own box)
  // (opening it: the race list starts at the character's current race)
  { const l = $('#rcmodal > .wz3-pick .wz3-cards'), on = l && l.querySelector('.wz3-card.sel'); if (on && !WZ3M['rcrace:s']) l.scrollTop = Math.max(0, on.offsetTop - l.offsetTop - 40); }
  if (typeof wz3ChoiceLists === 'function') wz3ChoiceLists('#rcmodal');
}
// a race or variant card picks it in the list underneath (which redraws the window, keeping the cards where they were)
document.addEventListener('click', e => { const c = e.target.closest && e.target.closest('#rcmodal [data-pick="race"], #rcmodal [data-pick="sub"]'); if (!c || !RC) return;
  const sel = $(`#rcmodal [data-rc="${c.dataset.pick}"]`); if (!sel) return; const box = c.closest('.wz3-pick');
  const go = () => { sel.value = c.dataset.v; sel.dispatchEvent(new Event('change', { bubbles: true })); }; if (box && typeof wz3Commit === 'function') wz3Commit(box, go); else go(); });
function openBgChange() {
  RC = { kind: 'bg', removeOld: true, custom: Object.assign({ name: '', feature: '', desc: '' }, S.background === 'custom' ? { name: S.backgroundName, ...(S.bgCustom || {}) } : {}) };
  W = { bg: S.background, ans: {} }; delete WZ3M['rcbg:q']; delete WZ3M['rcbg:s'];
  openModal('<div id="rcmodal"></div>', () => { RC = null; W = null; }, true); renderBgChange();
}
function renderBgChange() {
  const b = DND.backgrounds[W.bg], c = RC.custom, cust = W.bg === 'custom';
  $('#rcmodal').innerHTML = `<h3>Change background</h3>
    ${wz3List('bg')}<div class="wz-grid wz3-hid">${fld('Background', `<select class="f" data-rc="bg"><option value="">— choose —</option>${bookSort(Object.entries(DND.backgrounds), ([, v]) => v.src, ([, v]) => v.name).filter(([k]) => k !== 'custom').map(([k, v]) => `<option value="${k}"${W.bg === k ? ' selected' : ''}>${esc(v.name)}${v.src !== 'PHB' ? ' (' + v.src + ')' : ''}</option>`).join('')}<option value="custom"${cust ? ' selected' : ''}>✎ Custom background…</option></select>`)}</div>
    ${cust ? `<div class="wz-grid">${fld('Background name', `<input class="f" data-rc="name" value="${esc(c.name)}" placeholder="e.g. Smuggler">`)}${fld('Feature name', `<input class="f" data-rc="feature" value="${esc(c.feature)}" placeholder="e.g. Hidden Routes">`)}</div>
      ${fld('What the feature does', `<textarea class="f" rows="3" data-rc="desc">${esc(c.desc)}</textarea>`)}` : ''}
    ${b ? `<div class="wz-info">${b.skills && b.skills.length ? `<p><b>Skills:</b> ${esc(b.skills.join(', '))}${b.tools && b.tools.length ? ` · <b>Tools:</b> ${esc(b.tools.join(', '))}` : ''}</p>` : ''}${!cust ? `<p><b>Feature:</b> ${esc(b.feature[0])} — ${esc(b.feature[1])}</p>` : ''}
      ${b.skillChoice ? choiceUI(W.ans, 'bg.skill', { type: 'skill', n: b.skillChoice.n, from: b.skillChoice.from }) : ''}
      ${b.toolChoice ? choiceUI(W.ans, 'bg.tool', { type: 'tool', n: b.toolChoice.n, from: b.toolChoice.from, orLang: b.toolChoice.orLang, label: b.toolChoice.orLang ? 'Tool or language' : 'Tool' }) : ''}
      ${b.langs ? choiceUI(W.ans, 'bg.lang', { type: 'language', n: b.langs }) : ''}</div>` : ''}
    <label class="checkline" style="margin-top:8px"><input type="checkbox" data-rc="removeOld"${RC.removeOld ? ' checked' : ''}> Remove the skills and tools ${esc(S.backgroundName || 'my old background')} gave me</label>
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="rcok">Change background</button></div>`;
  // (the same searchable list as character creation; its choices of skills, tools and languages are lists too)
  const bx = $('#rcmodal > .wz3-pick'); if (bx) wz3Keep(bx, 'rcbg');
  // (opening it: the list starts at the character's current background)
  { const l = bx && bx.querySelector('.wz3-list'), on = l && l.querySelector('.crrow.on'); if (on && !WZ3M['rcbg:s']) l.scrollTop = Math.max(0, on.offsetTop - l.offsetTop - 40); }
  if (typeof wz3ChoiceLists === 'function') wz3ChoiceLists('#rcmodal');
}
document.addEventListener('change', e => { const r = e.target.closest && e.target.closest('#rcmodal input[data-pick="bg"]'); if (!r || !RC) return; const sel = $('#rcmodal [data-rc="bg"]'); if (!sel) return;
  const box = r.closest('.wz3-pick'); const go = () => { sel.value = r.dataset.v; sel.dispatchEvent(new Event('change', { bubbles: true })); }; if (box && typeof wz3Commit === 'function') wz3Commit(box, go); else go(); });
document.addEventListener('input', e => { const t = e.target; if (!t.dataset || t.dataset.rc === undefined || !RC) return; rcField(t, e.type); }, true);
document.addEventListener('change', e => { const t = e.target; if (!t.dataset || t.dataset.rc === undefined || !RC) return; rcField(t, e.type); }, true);
function rcField(t, type) {
  const k = t.dataset.rc, v = t.type === 'checkbox' ? t.checked : t.value;
  if (k === 'removeOld') { RC.removeOld = v; return; }
  if (['race', 'sub', 'bg'].includes(k)) { if (type !== 'change') return; W[k] = v; if (k === 'race') { W.sub = ''; W.ans = {}; } if (k === 'bg') W.ans = {}; RC.kind === 'race' ? renderRaceChange() : renderBgChange(); return; }
  RC.custom[k] = v;
}
function raceFixed(key, sub) {
  if (key === 'custom' || !DND.races[key]) return { asi: {}, langs: [], skills: [], weapons: [], armor: [], tools: [] };
  const r = DND.races[key], s = (r.subraces || {})[sub] || {};
  let asi = s.asiReplace ? s.asi : r.asi; if (!s.asiReplace && s.asi && typeof s.asi === 'object' && typeof asi === 'object') { asi = { ...asi }; Object.entries(s.asi).forEach(([a, n]) => asi[a] = (asi[a] || 0) + n); }
  return { asi: typeof asi === 'object' ? asi || {} : {}, langs: (r.languages || []).concat(s.languages || []), skills: (r.skills || []).concat(s.skills || []), weapons: (r.weapons || []).concat(s.weapons || []), armor: (r.armorCats || []).concat(s.armorCats || []), tools: (r.tools || []).concat(s.tools || []) };
}
function raceChangeOK() {
  if (!W.race) { toast('Choose a race.'); return; }
  const x = W.race === 'custom' ? null : wzRace();
  if (x && x.r.subraces && !W.sub) { toast('Choose a subrace.'); return; }
  const old = raceFixed(S.race.key, S.race.sub), oldName = S.raceName;
  if (RC.removeOld) {
    Object.entries(old.asi).forEach(([a, n]) => { S.abilities[a] = N(S.abilities[a]) - n; });
    S.langs = S.langs.filter(l => !old.langs.includes(l) || l === 'Common');
    old.skills.forEach(n => { const s = S.skills.find(z => z.name === n); if (s && N(s.prof) === 1) s.prof = 0; });
    S.profs.weaponNames = (S.profs.weaponNames || []).filter(n => !old.weapons.includes(n));
    S.profs.armor = (S.profs.armor || []).filter(a => !old.armor.includes(a) || (CL[(clsRows()[0] || {}).key] || {}).armorCats && CL[clsRows()[0].key].armorCats.includes(a));
    S.tools = S.tools.filter(t => !old.tools.includes(t.name));
  }
  if (W.race === 'custom') {
    const c = RC.custom;
    S.race = { key: 'custom', sub: '', choices: {}, custom: { name: c.name.trim() || 'Custom race', size: c.size, speed: N(c.speed) || 30, darkvision: N(c.darkvision), traits: String(c.traits || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => { const m = l.split(/:\s*/); return [m[0], m.slice(1).join(': ')]; }) } };
    S.raceName = S.race.custom.name;
  } else {
    const bonus = wzRacialBonus();
    S.race = { key: W.race, sub: W.sub, choices: {} }; S.raceName = x.name.toLowerCase().includes(x.r.name.toLowerCase()) ? x.name : x.name.replace(/\s*\([A-Z][A-Za-z]{1,5}\)$/, '') + ' ' + x.r.name;
    AB.forEach(a => { if (bonus[a]) S.abilities[a] = Math.min(30, N(S.abilities[a]) + bonus[a]); });
    const nw = raceFixed(W.race, W.sub);
    addText('languages', nw.langs); nw.skills.forEach(n => setSkill(n, 1)); addText('profTools', nw.tools);
    S.profs.weaponNames = [...new Set((S.profs.weaponNames || []).concat(nw.weapons))]; S.profs.armor = [...new Set((S.profs.armor || []).concat(nw.armor))];
    wzRaceChoices().forEach((c, k) => {
      const v = ansList(W.ans, 'race.' + k); if (!v.length || c.type === 'asi') return;
      if (c.type === 'feat') { v.forEach((n, j) => applyFeat(n, W.ans, `race.${k}.f${j}`)); return; }
      if (c.type === 'option') { S.race.choices[c.label] = v[0]; return; }
      applyChoice(c, v);
    });
  }
  pendingLabel = `Change race: ${oldName} → ${S.raceName}`; RC = null; W = null;
  // (the window starts fading before the sheet redraws, so the redraw doesn't hold the fade up)
  rebuildAuto(); closeModal(true); save(); requestAnimationFrame(() => setTimeout(render, 0));
  toast(`You're now ${esc(S.raceName)}. Check your ability scores, skills and languages.`, '', 9000, { label: 'Undo', fn: () => undo(1) });
}
function bgChangeOK() {
  if (!W.bg) { toast('Choose a background.'); return; }
  const ob = DND.backgrounds[S.background], oldName = S.backgroundName;
  if (RC.removeOld && ob) {
    (ob.skills || []).forEach(n => { const s = S.skills.find(z => z.name === n); if (s && N(s.prof) === 1) s.prof = 0; });
    S.tools = S.tools.filter(t => !(ob.tools || []).includes(t.name));
  }
  const b = DND.backgrounds[W.bg];
  S.background = W.bg;
  if (W.bg === 'custom') { const c = RC.custom; S.backgroundName = c.name.trim() || 'Custom background'; S.bgCustom = { feature: c.feature.trim() || 'Background feature', desc: c.desc }; }
  else { S.backgroundName = b.name; S.bgCustom = null; }
  (b.skills || []).forEach(n => setSkill(n, 1)); addText('profTools', b.tools || []);
  applyChoice({ type: 'skill' }, ansList(W.ans, 'bg.skill')); applyChoice({ type: 'tool' }, ansList(W.ans, 'bg.tool')); applyChoice({ type: 'language' }, ansList(W.ans, 'bg.lang'));
  if (b.feat && W.bg !== 'custom') applyFeat(b.feat, W.ans, 'bg.feat');
  pendingLabel = `Change background: ${oldName} → ${S.backgroundName}`; RC = null; W = null;
  // (the window starts fading before the sheet redraws, so the redraw doesn't hold the fade up)
  rebuildAuto(); closeModal(true); save(); requestAnimationFrame(() => setTimeout(render, 0));
  toast(`Background changed to ${esc(S.backgroundName)}.`, '', 7000, { label: 'Undo', fn: () => undo(1) });
}

// ---------- Pop-up menus always sit on top ----------
// Every open ⋯ / Save menu is lifted out of its container's stacking and clipping: it is positioned against the
// viewport (fixed) at the highest layer, flipped above its button when there's no room below, and kept on screen.
function placeMenus() {
  $$('.menu.open > .menu-list').forEach(list => {
    const btn = list.parentElement.querySelector(':scope > button') || list.parentElement, r = btn.getBoundingClientRect();
    list.classList.add('floating');
    const w = list.offsetWidth, h = list.offsetHeight, vw = innerWidth, vh = innerHeight, m = 8;
    let left = r.right - w; if (left < m) left = Math.min(r.left, vw - w - m); left = Math.max(m, Math.min(left, vw - w - m));
    let top = r.bottom + 6; if (top + h > vh - m && r.top - 6 - h >= m) top = r.top - 6 - h; top = Math.max(m, Math.min(top, vh - h - m));
    list.style.left = left + 'px'; list.style.top = top + 'px'; list.style.maxHeight = (vh - 2 * m) + 'px';
  });
  $$('.menu:not(.open) > .menu-list.floating').forEach(l => { l.classList.remove('floating'); l.style.left = l.style.top = l.style.maxHeight = ''; });
}
document.addEventListener('click', () => requestAnimationFrame(placeMenus));
addEventListener('scroll', () => { if ($('.menu.open')) placeMenus(); }, true);
addEventListener('resize', () => { if ($('.menu.open')) placeMenus(); fitAtkRows(); });

// Turning a book on or off from Settings.
function setBook(code, on) {
  const L = new Set(S.sources || defaultSources()); if (on) L.add(code); else L.delete(code);
  S.sources = [...L]; applySources(S.sources);
  pendingLabel = (on ? 'Book on: ' : 'Book off: ') + (DND.sources[code] || code); save(); render();
  reopenSettings();
}
// Books: a compact list at the bottom of Settings → Character & sheet; "Manage" shows the toggles.
function booksHTML() {
  const on = new Set((S.sources || defaultSources()).concat(coreSources())), ed = !!UI.open.booksedit;
  const keys = Object.keys(DND.sources).filter(k => k !== 'SRD').sort((a, b) => (b === 'PHB') - (a === 'PHB') || (a === 'UA') - (b === 'UA') || DND.sources[a].localeCompare(DND.sources[b]));
  return `<div class="books"><div class="bk-head"><span class="lbl">Books</span><span class="hint">${keys.filter(k => on.has(k)).length} of ${keys.length} on</span><button class="btn sm" data-act="booksedit">${ed ? 'Done' : 'Manage'}</button></div>
    ${ed ? `<div class="bk-list">${keys.map(k => { const core = coreSources().includes(k); return `<label class="bk-row${on.has(k) ? ' on' : ''}${core ? ' core' : ''}${k === 'UA' ? ' ua' : ''}"><input type="checkbox" data-ssrc="${k}"${on.has(k) ? ' checked' : ''}${core ? ' disabled' : ''}><span>${esc(DND.sources[k])}</span>${core ? '<small>always on</small>' : k === 'UA' ? '<small>playtest</small>' : ''}</label>`; }).join('')}</div>
      <p class="hint bk-note">Anything this character already has from a book you turn off stays until you remove it.</p>`
    : `<div class="bk-chips">${keys.filter(k => on.has(k)).map(k => `<span class="bk-chip${k === 'UA' ? ' ua' : ''}" title="${esc(DND.sources[k])}">${esc(k)}</span>`).join('')}</div>`}</div>`;
}

// redrawn in place: same spot on screen (if it was dragged) and same scroll
function reopenSettings() { const sx = $('.setx'), sc = sx ? sx.scrollTop : 0, mb = $('#modal-body'); if (mb) { mb.dataset.keepPos = '1'; REOPEN = true; } try { openSettings(SETTAB); } finally { REOPEN = false; } const nx = $('.setx'); if (nx) nx.scrollTop = sc; setTimeout(() => { if (mb) delete mb.dataset.keepPos; }, 0); }
let REOPEN = false;
function fitSettingsHeight(fresh) {
  const m = $('#modal-body'), sx = $('.setx'); if (!m || !sx) return;
  // redrawn in place (a theme picked, a setting toggled): the window never shrinks under the pointer; a fresh open sizes from scratch
  if (fresh) m._sethMin = 0;
  m.style.removeProperty('--seth');
  const panes = $$('.setx .stpane'); let tallest = 0;
  const pw = sx.clientWidth - (parseFloat(getComputedStyle(sx).paddingLeft) || 0) - (parseFloat(getComputedStyle(sx).paddingRight) || 0); // measured at the width it really shows at, so wrapped lines count
  panes.forEach(p => { const was = p.style.cssText; p.style.cssText = `display:block;position:absolute;visibility:hidden;left:0;top:0;width:${pw}px;box-sizing:border-box`; tallest = Math.max(tallest, p.getBoundingClientRect().height, p.scrollHeight); p.style.cssText = was; });
  const chrome = m.getBoundingClientRect().height - sx.getBoundingClientRect().height;  // header, tabs and padding
  const cap = isMobile() ? 0.88 * innerHeight : innerHeight - 32;
  let h = Math.ceil(Math.min(cap, Math.max(chrome + tallest + 4, m._sethMin || 0))); if (!fresh && m._sethMin && Math.abs(h - m._sethMin) <= 3) h = m._sethMin;   // a pixel or two of re-measuring isn't worth a nudge
  m.style.setProperty('--seth', h + 'px'); m._sethMin = h;
  // a row appearing or going (e.g. the 2024 exhaustion rule adds one) re-fits the window
  if (typeof ResizeObserver === 'function') { if (!m._setRO) m._setRO = new ResizeObserver(() => { clearTimeout(m._setRT); m._setRT = setTimeout(() => { if (settingsOpen()) fitSettingsHeight(); }, 80); }); m._setRO.disconnect(); $$('.setx .stpane').forEach(p => m._setRO.observe(p)); }
  // whatever the measuring missed (padding, margins) shows up as scroll on the open tab: add it on
  requestAnimationFrame(() => { const x = $('.setx'); if (!x || !m.isConnected) return; const more = x.scrollHeight - x.clientHeight; if (more > 3 || (more > 0 && fresh)) { const h2 = Math.ceil(Math.min(cap, m.getBoundingClientRect().height + more + 2)); m.style.setProperty('--seth', h2 + 'px'); m._sethMin = Math.max(m._sethMin || 0, h2); } });
}
addEventListener('resize', () => { if (typeof settingsOpen === 'function' && settingsOpen()) fitSettingsHeight(true); });
function settingsOpen() { return $('#modal').classList.contains('open') && !!$('.setx'); }
function setTabInk(anim) { const on = $('.stabs .stab.on'), ink = $('.stabs .stab-ink'); if (!on || !ink) return; ink.style.transition = anim ? '' : 'none'; ink.style.width = on.offsetWidth + 'px'; ink.style.transform = `translateX(${on.offsetLeft}px)`; if (anim) { const bar = on.parentElement; if (bar && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: on.offsetLeft - (bar.clientWidth - on.offsetWidth) / 2, behavior: 'smooth' }); } const mb = $('#modal-body'); if (mb && mb.scrollLeft) mb.scrollLeft = 0; }
function switchSetTab(k) {
  if (k === SETTAB) return; const order = ['char', 'rules', 'dice', 'theme', 'data'], dir = order.indexOf(k) > order.indexOf(SETTAB) ? 'r' : 'l';
  SETTAB = k;
  $$('.stabs .stab').forEach(b => { const on = b.dataset.k === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  $$('.setx .stpane').forEach(p => { const on = p.dataset.pane === k; p.classList.remove('in-l', 'in-r'); p.classList.toggle('on', on); if (on) { void p.offsetWidth; p.classList.add('in-' + dir); } });
  setTabInk(true); const sx = $('.setx'); if (sx) sx.scrollTop = 0;
}

// Item names are textareas so long names wrap instead of being cut off; Enter just finishes editing.
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches && e.target.matches('textarea.iname')) { e.preventDefault(); e.target.blur(); } });

// Item names are never cut off: if a name won't fit beside its buttons, the row stacks (name on top, buttons under it).
let _fitCtx = null;
// Attack list: the name column is as wide as the longest name (CSS subgrid), so names never wrap and the numbers
// line up. If that leaves no room for the damage type, the list stacks: name on its own line, numbers under it.
const ATK_RO = typeof ResizeObserver === 'function' ? new ResizeObserver(() => fitAtkRows()) : null;
function fitAtkRows() {
  if (document.documentElement.classList.contains('mobile')) return;
  $$('.atk-list').forEach(L => {
    if (ATK_RO && !L._ro) { L._ro = true; ATK_RO.observe(L); }
    if (!L.clientWidth || !L.querySelector('.atk-row')) return;
    const was = L.classList.contains('stack'); L.classList.remove('stack');
    const cols = getComputedStyle(L).gridTemplateColumns.split(' ').map(parseFloat), typeW = cols.length >= 4 ? cols[3] : 999;
    const stack = L.scrollWidth > L.clientWidth + 1 || typeW < 64;
    L.classList.toggle('stack', stack);
    if (was !== stack && ATK_RO) { /* class change resizes nothing: no loop */ }
  });
  $$('.econ table.mini').forEach(T => { const B = T.parentElement; if (!B || !B.clientWidth) return; if (ATK_RO && !B._ro) { B._ro = true; ATK_RO.observe(B); }
    T.classList.remove('wrapnm'); if (T.offsetWidth > B.clientWidth + 1) T.classList.add('wrapnm'); });
}
function fitItemRows() {
  _fitCtx = _fitCtx || document.createElement('canvas').getContext('2d');
  $$('#page-inventory .irow2').forEach(r => {
    const n = r.querySelector('.iname'), ctl = r.querySelector('.ictl'); if (!n || !ctl || !r.clientWidth) return;
    const cs = getComputedStyle(n); _fitCtx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const need = _fitCtx.measureText(n.value || n.placeholder || '').width + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + 4;
    const tip = r.querySelector('.notetip'), tw = tip ? tip.offsetWidth + 4 : 0;
    const stack = isMobile() || need > r.clientWidth - ctl.offsetWidth - tw - 14;
    if (r.classList.contains('stack') !== stack) r.classList.toggle('stack', stack);
    // The name box hugs its text so the notes icon sits right after the name.
    n.style.width = stack ? '' : Math.ceil(need) + 'px';
    if (typeof grow === 'function') grow(n);
  });
}
addEventListener('resize', () => requestAnimationFrame(fitItemRows));
document.addEventListener('input', e => { if (e.target.classList && e.target.classList.contains('iname')) fitItemRows(); });

// ---------- Item note tooltips ----------
// Hover (or tap) the little notes icon beside an item name to read its notes in a big tooltip. Notes are edited in the item's details (ⓘ).
// Spells and features in Combat: what they do, with this character's numbers.
// ---------- Full descriptions ----------
// Lookup order: the character's own wording (.full) → DND.full by key → the short summary.
function fullKeyOfFeat(f) {
  const F = DND.full || {}, k = f && f.key; if (!k) return '';
  if (F[k]) return k;
  if (/^race:/.test(k)) {
    const n = k.slice(5), r = S.race || {}, rk = r.key || '', sk = r.sub || '';
    for (const c of [`race:${rk}.${sk}:${n}`, `race:${rk}:${n}`]) if (F[c]) return c;
    const any = Object.keys(F).find(x => x.startsWith('race:') && x.endsWith(':' + n)); if (any) return any;
  }
  const m = k.match(/^([a-z]+):(?:[a-z0-9]+:)?(.+)$/); if (m && F[m[1] + ':' + m[2]]) return m[1] + ':' + m[2];
  return '';
}
const DARKVISION_TXT = 'Within your darkvision range you can see in dim light as if it were bright light, and in darkness as if it were dim light. In darkness you see only shades of gray, not color.';
function fullOfFeat(f) { if (!f) return ''; if (String(f.full || '').trim()) return f.full; if (f.key === 'race:Darkvision') return (f.desc ? f.desc + '\n' : '') + DARKVISION_TXT; const k = fullKeyOfFeat(f); return k ? DND.full[k] : (f.desc || ''); }
function fullDefaultFeat(f) { const k = fullKeyOfFeat(f); return k ? DND.full[k] : ''; }
function fullOfSpell(sp) { if (!sp) return ''; if (String(sp.full || '').trim()) return sp.full; return (DND.full || {})['sp:' + sp.name] || sp.summary || ''; }
function fullDefaultSpell(sp) { return (DND.full || {})['sp:' + (sp && sp.name)] || ''; }
function fullOfItem(it) { if (!it) return ''; const F = DND.full || {}, nm = (it.magic && it.magic.name) || it.name; return F['item:' + nm] || F['item:' + String(nm).replace(/\s*\(.*\)$/, '')] || ''; }
function isSRDKey(k) { return (DND.fullSRD || []).includes(k); }
// Paragraphs; lines starting with "• " or "- " become list items.
function fullHTML(t) {
  const out = []; let ul = [];
  const flush = () => { if (ul.length) { out.push(`<ul class="fulllist">${ul.join('')}</ul>`); ul = []; } };
  String(t || '').split(/\n+/).forEach(p => { p = p.trim(); if (!p) return; const m = p.match(/^(?:•|-|\*)\s+(.*)$/); if (m) ul.push(`<li>${esc(formulaDC(m[1]))}</li>`); else { flush(); const h = p.match(/^(At Higher Levels\.)\s*(.*)$/); out.push(h ? `<p><b class="fullh">${h[1]}</b> ${esc(formulaDC(h[2]))}</p>` : `<p>${esc(formulaDC(p))}</p>`); } });
  flush(); return `<div class="fulltxt">${out.join('')}</div>`;
}
// Phones: long item notes are clamped; tap them to read everything.
document.addEventListener('click', e => { const n = e.target.closest && e.target.closest('html.mobile .inote-m'); if (n) n.classList.toggle('open'); });
// Every ⓘ uses the same drawn icon so it sits exactly on the text's middle (a text glyph sits differently in every font).
const INFO_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="5" r="1" fill="currentColor"/><path d="M8 7.3v4.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
function svgInfoIcons(root) { (root || document).querySelectorAll('.notetip:not(.svgi)').forEach(b => { if (b.textContent.trim() === 'ⓘ' || b.querySelector('svg')) { if (!b.querySelector('svg')) b.innerHTML = INFO_SVG; b.classList.add('svgi'); } }); }
new MutationObserver(ms => { if (ms.some(m => m.addedNodes.length)) svgInfoIcons(); }).observe(document.documentElement, { childList: true, subtree: true });
// ⓘ "how is this worked out" breakdowns, shown in the normal tooltip.
const ciBtn = (k, what) => `<button class="notetip ci" data-tip="calc:${k}" data-tipkind="cond" aria-label="How ${esc(what || 'this')} is worked out"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="5" r="1" fill="currentColor"/><path d="M8 7.3v4.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>`;
function calcTip(k) {
  const sg = v => (v >= 0 ? '+' : '−') + Math.abs(v), rows = [], add = (l, v) => { if (v === 0 || v === '' || v == null) return; rows.push([l, typeof v === 'number' ? sg(v) : v]); };
  const out = (name, total, note) => ({ name, rows: rows.slice(), html: `<div class="calcrows">${rows.map(([l, v]) => `<div class="calcrow"><span>${esc(l)}</span><b>${esc(String(v))}</b></div>`).join('')}<div class="calcrow tot"><span>Total</span><b>${esc(String(total))}</b></div></div>${note ? `<div class="hint">${note}</div>` : ''}` });
  const ab3 = a => a.toUpperCase();
  if (k === 'ac') { const i = acInfo(); i.parts.forEach(p => rows.push([p, ''])); return out('Armor Class', i.total, S.acOverride !== '' && S.acOverride != null && !S.form ? 'Set manually — use Manage to go back to automatic.' : ''); }
  if (k === 'init') {
    add('DEX modifier', mod('dex')); add('Items', itemSum('check')); if (hasFeat('Alert')) add('Alert', 5); if (S.features.some(f => f.initProf)) add('Proficiency', PB()); if (jack()) add('Jack of All Trades', Math.floor(PB() / 2));
    if (hasSub('rogue', 'swashbuckler')) add('Rakish Audacity (CHA)', mod('cha')); if (hasSub('wizard', 'warmagic')) add('Tactical Wit (INT)', mod('int')); if (hasSub('ranger', 'gloomstalker')) add('Dread Ambusher (WIS)', mod('wis')); add('Features', fxSum('init'));
    return out('Initiative', sg(initVal()));
  }
  if (k === 'speed') { const i = speedInfo(); (i.parts || []).forEach(p => rows.push([p, ''])); return out('Speed', i.text); }
  if (k === 'prof') { rows.push([`Character level ${lvl()}`, '']); rows.push(['2 + (level − 1) ÷ 4, rounded down', '']); return out('Proficiency bonus', sg(PB())); }
  if (k === 'passive') { rows.push(['Base', '10']); add('Perception bonus', perception()); if (hasFeat('Observant')) add('Observant', 5); if (activeItems().some(it => (it.mods || {}).percAdv)) add('Advantage (item)', 5); return out('Passive Perception', passive()); }
  if (k === 'hd') { const P = hdPools(); Object.keys(P).forEach(d => rows.push([`d${d} — ${clsRows().filter(r => CL[r.key] && CL[r.key].hd == d).map(r => CL[r.key].name + ' ' + r.level).join(', ')}`, `${hdLeftOf(d)}/${P[d]}`])); return out('Hit Dice', `${hdLeftTotal()}/${lvl()}`, 'One die per level. A long rest gives back half your total (at least one).'); }
  if (k === 'hp') {
    rows.push(['Hit Dice (1st level max + the rest)', String(N(S.hp.base))]); add(`CON ${sg(mod('con', true))} × ${lvl()} levels`, lvl() * mod('con', true));
    const r = raceInfo(); if (r && r.hpPerLevel) add(r.name, r.hpPerLevel * lvl()); if (hasFeat('Tough')) add('Tough', 2 * lvl()); if (hasSub('sorcerer', 'draconic')) add('Draconic Resilience', clsLv('sorcerer'));
    fxPassives().forEach(p => { if (p.maxHp != null) add(p.src || 'Feature', typeof p.maxHp === 'number' ? p.maxHp : N(evalMax(p.maxHp))); });
    add('Your adjustment', N(S.hp.adj)); add('Temporary change', tmv('hpmax')); fxActive().forEach(e => { if (e.self !== false && !e.ally && N(e.maxHp)) add(e.name, N(e.maxHp)); });
    if (N(S.exhaustion) >= 4 && !exModern()) rows.push(['Exhaustion 4+', '½']);
    return out('Max HP', maxHp());
  }
  if (/^save:/.test(k)) { const a = k.slice(5), pr = S.saves[a] || fxSaveProf(a);
    add(`${ab3(a)} modifier`, mod(a)); if (pr) add('Proficiency', PB()); add('Items', itemSum('save')); add(auraBonus() >= N(S.allyAura) ? 'Aura of Protection' : 'Ally’s Aura of Protection', auraAll()); add('Deck of Many Things', N((S.deckMods || {}).save)); add('Features', fxSum('saveAll')); add('Spells', buffSum('save'));
    if (!rows.length) rows.push([`${ab3(a)} modifier`, sg(0)]); return out(`${ABN[a]} save`, sg(saveVal(a))); }
  if (/^abil:/.test(k)) { const a = k.slice(5), b = S.abilities[a] === '' ? 10 : N(S.abilities[a]);
    rows.push(['Your score', String(b)]); fxPassives().forEach(p => { if (p.abil && p.abil[a]) add(p.src || 'Feature', p.abil[a]); }); itemMods().forEach(m => { if (m.abil && m.abil[a] > b) rows.push([m.src || 'Item sets it to', String(m.abil[a])]); });
    const t = (S.abTemp || {})[a]; if (t && N(t.d)) add('Temporary change', N(t.d)); if (S.form && S.form.abil && (['str', 'dex', 'con'].includes(a) || S.form.allStats)) rows.push([S.form.name + ' form', String(S.form.abil[AB.indexOf(a)])]);
    const sv = calcTip('save:' + a); return { name: ABN[a], html: out(ABN[a], `${score(a)} (${sg(mod(a))})`, 'Modifier = (score − 10) ÷ 2, rounded down.').html + `<div class="calcsub">Saving throw</div>` + sv.html }; }
  if (/^skill:/.test(k)) { const sk = S.skills[N(k.slice(6))]; if (!sk) return null; let p = N(sk.prof); const fe = fxList('skillExp'), fp = fxList('skillProf'); if (fe.includes(sk.name)) p = Math.max(p, 2); else if (fp.includes(sk.name)) p = Math.max(p, 1);
    add(`${ab3(sk.ab)} modifier`, mod(sk.ab)); add(p === 2 ? 'Expertise (2 × proficiency)' : 'Proficiency', Math.floor(p * PB())); if (!p && jack()) add('Jack of All Trades', Math.floor(PB() / 2)); else if (!p && remarkable() && ['str', 'dex', 'con'].includes(sk.ab)) add('Remarkable Athlete', Math.ceil(PB() / 2));
    add('Misc', N(sk.misc)); add('Items', itemSum('check')); add('Temporary change', tmv('skill:' + sk.name)); if (sk.name === 'Perception' && ravenOn()) add('Sentinel Raven on your shoulder (CHA)', mod('cha')); fxSkillBonus(sk.name).forEach(([src, n]) => add(src, n)); if (!rows.length) rows.push([`${ab3(sk.ab)} modifier`, sg(0)]); return out(sk.name, sg(skillVal(sk))); }
  if (/^dc:|^satk:/.test(k)) { const ck = k.split(':')[1], c = castInfo(ck), dc = k.startsWith('dc:'), exDC = exModern() && ST('exhaustionDC') ? Math.min(5, N(S.exhaustion)) : 0;
    if (dc) rows.push(['Base', '8']); add('Proficiency', PB()); add(`${ab3(c.ab || 'cha')} modifier`, c.mod); add('Items', itemSum('spell')); if (!dc) add('Spell attack items', itemSum('spellAtk')); if (dc && exDC) add('Exhaustion', -exDC);
    return out(dc ? 'Spell save DC' : 'Spell attack', dc ? c.dc : sg(c.atk)); }
  return null;
}
function spFeatTip(btn) {
  if (/^calc:/.test(btn.dataset.tip || '')) return calcTip(btn.dataset.tip.slice(5));
  if (btn.dataset.tipkind === 'cond') {
    if (/^ab:/.test(btn.dataset.tip)) { const a = btn.dataset.tip.slice(3), t = (S.abTemp || {})[a] || {}, b0 = baseScore(a), v = score(a); return { name: `Temporary ${ABN[a]}`, html: `<div class="tipdesc">${ABN[a]} ${b0} → ${v} (modifier ${fmt(Math.floor((b0 - 10) / 2))} → ${fmt(Math.floor((v - 10) / 2))}).</div><div class="hint">${[t.set !== '' && t.set != null ? 'Set to ' + t.set : '', N(t.d) ? fmt(N(t.d)) : ''].filter(Boolean).join(', then ')}${' · ' + (N(S.abTempR) > 0 ? N(S.abTempR) + ' round' + (N(S.abTempR) > 1 ? 's' : '') + ' left' : durText(N(S.abTempR)))}</div>` }; }
    if (btn.dataset.tip === 'exh') { const ex = N(S.exhaustion); return { name: 'Exhaustion ' + ex, html: `<div class="tipdesc">${esc(exhText(ex))}</div>` }; }
    const c = S.conditions[N(btn.dataset.tip)]; if (!c) return null; const t = N((S.condTurns || {})[c]), note = (S.condNotes || {})[c];
    return { name: c, html: (note ? `<div class="tiphb">${esc(note)}</div>` : '') + `<div class="tipdesc">${esc(condDesc(c) || '')}</div>` + `<div class="hint">${t > 0 ? t + ' round' + (t > 1 ? 's' : '') + ' left' : durText(t).replace(/^u/, 'U')}</div>` };
  }
  const k = btn.dataset.tipkind, i = N(btn.dataset.tip), line = (l, v) => v ? `<div class="tipline"><span>${l}</span> ${v}</div>` : '';
  if (k === 'sp') {
    const sp = S.spells[i]; if (!sp) return null; const sm = spellMath(sp), ci = spellCI(sp), L = N(sp.level);
    const head = `${L ? ORD[L - 1] + '-level' : 'Cantrip'}${sp.school ? ' ' + esc(String(sp.school).toLowerCase()) : ''}${sp.ritual ? ' (ritual)' : ''}`;
    const math = [sm.attack ? `${fmt(ci.atk)} to hit` : '', sm.save ? `DC ${ci.dc} ${esc(sm.save)} save${sm.half ? ' (half on success)' : ''}` : '', sm.dice ? `${esc(sm.dice)} ${esc(sm.type)}` : '', sm.heal ? `heals ${esc(sm.heal)}` : '', sm.temp ? `${esc(sm.temp)} temp HP` : ''].filter(Boolean).join(' · ');
    return { name: sp.name, html: `<div class="hint">${head}</div>` + line('Casting time', esc(sp.time || '')) + line('Range', esc(sp.range || '')) + line('Components', esc(sp.comps || '')) + line('Duration', esc((sp.conc ? 'Concentration, ' : '') + (sp.duration || ''))) + (fullOfSpell(sp) ? `<div class="tipdesc">${fullHTML(fullOfSpell(sp))}</div>` : '') + (math ? `<div class="tiphb">${math}</div>` : '') + (sm.note ? `<div class="hint">${esc(sm.note)}</div>` : '') + (sp.note ? `<div class="hint">${esc(sp.note)}</div>` : '') + `<div class="hint">${esc([CL[sp.cls] ? CL[sp.cls].name : '', sp.src || ''].filter(Boolean).join(' · '))}</div>` };
  }
  const f = S.features[i]; if (!f) return null; const max = featMax(f), info = typeof fxInfoLine === 'function' ? fxInfoLine(f) : '';
  return { name: f.name, html: (f.source ? `<div class="hint">${esc(f.source)}</div>` : '') + (fullOfFeat(f) ? `<div class="tipdesc">${fullHTML(fullOfFeat(f))}</div>` : '') + (info ? `<div class="tiphb">${esc(info)}</div>` : '') + (max != null ? `<div class="hint">${Math.max(0, max - N(f.used))} of ${max} uses left${f.reset ? ' · resets on a ' + esc(f.reset) + ' rest' : ''}</div>` : '') };
}
function showTip(btn) {
  if (btn.dataset.tipkind === 'full') { const fk = btn.dataset.full, tx = (DND.full || {})[fk] || ((DND.magic.find(m => 'item:' + m[0] === fk) || [])[5]) || (fk.startsWith('item:') ? 'A magic item from the replicable list — see the Dungeon Master\'s Guide for its full description.' : ''); if (!tx) return hideTip(); let t = $('#tipbox'); if (!t) { t = document.createElement('div'); t.id = 'tipbox'; t.setAttribute('role', 'tooltip'); document.body.appendChild(t); } t.innerHTML = `<b>${esc(String(btn.dataset.full).replace(/^\w+:/, ''))}</b><div class="tipdesc">${fullHTML(tx)}</div>`; try { const fn = String(btn.dataset.full).replace(/^\w+:/, '').replace(/^.*:/, ''), sp = /^sp:/.test(fk) && DND.spellIndex ? DND.spellIndex[fn.toLowerCase()] : null; tipVfx(t, vfxForKey(fk) || (sp ? vfxPick(sp.name, (sp.summary || '') + ' ' + tx, { school: sp.school }) : vfxPick(fn, tx, {}))); } catch (e) {} t.classList.add('on'); return placeTip(t, btn); }
  if (btn.dataset.tipkind === 'sp' || btn.dataset.tipkind === 'feat' || btn.dataset.tipkind === 'cond') {
    const d = spFeatTip(btn); if (!d) return hideTip();
    let t = $('#tipbox'); if (!t) { t = document.createElement('div'); t.id = 'tipbox'; t.setAttribute('role', 'tooltip'); document.body.appendChild(t); }
    t.innerHTML = `<b>${esc(d.name)}</b>${d.html}`; t.classList.add('on');
    try { const ix = N(btn.dataset.tip); if (btn.dataset.tipkind === 'sp' && S.spells[ix]) tipVfx(t, vfxForSpell(S.spells[ix])); else if (btn.dataset.tipkind === 'feat' && S.features[ix] && !/^calc:/.test(btn.dataset.tip || '')) tipVfx(t, vfxForFeat(S.features[ix])); } catch (e) {}
    return placeTip(t, btn);
  }
  const atk = btn.dataset.tipkind === 'atk', it = (atk ? S.attacks : S.inventory)[N(btn.dataset.tip)]; if (!it) return hideTip();
  const wit = atk && it.item ? S.inventory.find(x => x.id === it.item) : atk ? null : it;
  const hb = wit && wit.hb ? hbSummary(wit.hb, wit) : [];
  // Attacks: what a hit does, with every damage type spelled out (weapon, magic extras, riders waiting for the next hit).
  let dmgLine = '';
  if (atk) { try { const ty = it.type ? String(it.type).toLowerCase() : '', isW = !it.effect || it.weaponLike, ex = isW ? extraDice(it).slice() : [];
    if (it.kind === 'melee' && clsLv('paladin') >= 11 && isW) ex.push('1d8 radiant (Improved Divine Smite)');
    const rid = isW ? (S.riders || []).map(r => r.dice + ' (' + r.name + ', next hit)') : [];
    const parts = [`${esc(atkDmgText(it))}${ty ? ' ' + esc(ty) : ''}`].concat(ex.map(x => '+ ' + esc(x)), rid.map(x => '+ ' + esc(x)));
    dmgLine = `<div class="tipline"><span>To hit</span> ${fmt(atkHit(it))}</div><div class="tipline"><span>Damage</span> ${parts.join(' ')}</div>`; } catch (e) {} }
  const bits = [dmgLine, atk && String(it.notes || '').trim() ? `<div class="tipprops">${esc(it.notes)}</div>` : '', wit && String(wit.notes || '').trim() ? `<div>${esc(wit.notes)}</div>` : '', wit && fullOfItem(wit) && !String(wit.notes || '').includes(fullOfItem(wit).slice(0, 60)) ? `<div class="tipdesc">${fullHTML(fullOfItem(wit))}</div>` : wit && wit.summary && wit.summary !== wit.notes ? `<div class="hint">${esc(wit.summary)}</div>` : '', hb.length ? `<div class="tiphb">⚙ ${esc(hb.join(' · '))}</div>` : ''].filter(Boolean);
  if (!bits.length) return hideTip();
  let t = $('#tipbox'); if (!t) { t = document.createElement('div'); t.id = 'tipbox'; t.setAttribute('role', 'tooltip'); document.body.appendChild(t); }
  t.innerHTML = `${wit && wit.img ? `<img class="tipimg" src="${esc(safeImg(wit.img))}" alt="">` : ''}<b>${esc(it.name)}</b>${wit && wit.attune ? `<span class="hint"> · ${wit.attuned ? 'attuned' : 'not attuned'}</span>` : ''}${bits.join('')}`; t.classList.add('on');
  try { if (atk) tipVfx(t, vfxForAttack(it, wit)); else if (wit && (wit.weapon || wit.magic || (wit.spells || []).length || wit.hb || wit.consumable || /potion|elixir|scroll|oil|philter/i.test(wit.name))) tipVfx(t, vfxForItem(wit)); } catch (e) {}
  placeTip(t, btn);
}
function placeTip(t, btn) {
  clearTimeout(t._ct); t.classList.remove('closing');
  if (isMobile() && !t.querySelector(':scope > .tipx')) t.insertAdjacentHTML('afterbegin', '<button class="tipx" type="button" aria-label="Close">✕</button>');
  t.style.maxHeight = ''; if (t._for !== btn) t.scrollTop = 0;
  t.style.left = '0px'; t.style.top = '0px'; // measure at full width (not squeezed against the edge where the last tooltip sat)
  const r = btn.getBoundingClientRect(), w = t.offsetWidth, m = 8, below = innerHeight - r.bottom - 8 - m, above = r.top - 8 - m;
  let h = t.offsetHeight, left = Math.max(m, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - m)), top = r.bottom + 8;
  if (h > below) { if (above > below) { if (h > above) { t.style.maxHeight = above + 'px'; h = above; } top = r.top - 8 - h; } else t.style.maxHeight = Math.max(120, below) + 'px'; }
  t.style.left = left + 'px'; t.style.top = Math.max(m, top) + 'px'; if (t._for !== btn) t._at = Date.now(); t._for = btn;
}
function hideTip() { const t = $('#tipbox'); if (t) { clearTimeout(t._ct); t.classList.remove('closing'); if (t._for) t._for.classList.remove('tippin'); t.classList.remove('on'); t._for = null; t._pinned = false; } $$('.notetip.tippin').forEach(x => x.classList.remove('tippin')); }
// Hovering an ⓘ shows its box; the mouse can cross the small gap into the box (and scroll it) without it closing.
// Clicking an ⓘ pins its box open (the ⓘ changes color) until you click somewhere else.
function inTipPath(t, x, y) {
  const b = t._for; if (!b || !b.isConnected) return false;
  const r = b.getBoundingClientRect(), q = t.getBoundingClientRect();
  const L = Math.min(r.left, q.left), R = Math.max(r.right, q.right), T = Math.min(r.top, q.top), B = Math.max(r.bottom, q.bottom);
  // the strip between the ⓘ and the box, as wide as the box
  const gapTop = Math.min(r.bottom, q.bottom), gapBot = Math.max(r.top, q.top);
  return (x >= q.left && x <= q.right && y >= Math.min(gapTop, gapBot) - 2 && y <= Math.max(gapTop, gapBot) + 2) || (x >= L && x <= R && y >= T && y <= B && (x >= q.left && x <= q.right || x >= r.left && x <= r.right));
}
document.addEventListener('mouseover', e => {
  if (isMobile()) return; // phones: tooltips open and close by tapping only
  const b = e.target.closest && e.target.closest('.notetip'), t = $('#tipbox.on');
  if (b) { if (!(t && t._pinned && t._for !== b)) showTip(b); return; }
  if (!t || t._pinned || e.target.closest('#tipbox')) return;
  if (!inTipPath(t, e.clientX, e.clientY)) hideTip();
});
document.addEventListener('mousemove', e => { const t = $('#tipbox.on'); if (!t || t._pinned || (e.target.closest && (e.target.closest('#tipbox') || e.target.closest('.notetip')))) return; if (!inTipPath(t, e.clientX, e.clientY)) hideTip(); }, { passive: true });
// The mouse wheel over an ⓘ scrolls its box instead of the page.
document.addEventListener('wheel', e => { const b = e.target.closest && e.target.closest('.notetip'), t = $('#tipbox.on'); if (!b || !t || t._for !== b) return; if (t.scrollHeight <= t.clientHeight) return; e.preventDefault(); t.scrollTop += e.deltaY; }, { passive: false });
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('.tipx')) { e.preventDefault(); e.stopPropagation(); const t = $('#tipbox.on'); if (t && !t.classList.contains('closing') && !matchMedia('(prefers-reduced-motion: reduce)').matches) { t.classList.add('closing'); clearTimeout(t._ct); t._ct = setTimeout(hideTip, 190); } else hideTip(); return; } const b = e.target.closest && e.target.closest('.notetip'); if (b) { e.preventDefault(); const t = $('#tipbox.on'); if (isMobile()) { if (t && t._for === b) hideTip(); else showTip(b); return; } if (t && t._for === b && t._pinned) hideTip(); else { if (t && t._for) t._for.classList.remove('tippin'); showTip(b); const n = $('#tipbox.on'); if (n) { n._pinned = true; b.classList.add('tippin'); } } } else if (!e.target.closest('#tipbox')) hideTip(); }, true);
addEventListener('scroll', e => { const t = e.target; if (t && t.nodeType === 1 && t.closest('#tipbox')) return; hideTip(); }, true);
// Combat: long feature/item descriptions show two lines; click to read the rest.
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('#page-combat .cspg .opt-text'); if (t) t.classList.toggle('full'); });
// The Hexed / Cursed note in the Conditions window.
document.addEventListener('change', e => { const c = e.target.dataset && e.target.dataset.condnote; if (c == null) return; S.condNotes = Object.assign({}, S.condNotes, { [c]: e.target.value.trim() }); if (!S.condNotes[c]) delete S.condNotes[c]; pendingLabel = c + ': note'; save(); render('vitals'); });
// Text inputs that act on change (not every keystroke): the "add a spell to this feature" box.
document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.fsp !== undefined) onField(e); });

// ---------- Deck of Many Things ----------
// The deck item gets a "Draw" button. You choose the deck, declare how many cards, then draw one at a time;
// each card's effect is applied to the sheet (with Undo) and logged on the Features tab and in your notes.
const isDeckItem = it => /deck of many (more )?things/i.test(String(it && it.name || ''));
let DECK = null;
function deckPool(variant) {
  const gone = new Set((S.deck && S.deck.gone) || []);
  const base = variant === 'more' ? DND.moreCards : DND.deckCards;
  return Object.keys(base).filter(n => !gone.has(n) && (variant !== 'dmg13' || base[n].in13));
}
function openDeck(i) {
  S.deck = S.deck || { variant: '', gone: [], left: 0, drawn: [] };
  DECK = { i, last: null, choice: null };
  renderDeck();
}
function renderDeck() {
  const d = S.deck, v = d.variant, names = { dmg13: 'Deck of Many Things (13 cards)', dmg22: 'Deck of Many Things (22 cards)', more: 'Deck of Many More Things' };
  const cards = v === 'more' ? DND.moreCards : DND.deckCards;
  let h = `<div id="deckm"><h3>${esc(names[v] || 'Deck of Many Things')}</h3>`;
  if (!v) h += `<p class="hint">Which deck is it? Most are the 13-card version; a quarter have all 22. The Deck of Many More Things comes from The Book of Many Things.</p>
    <div class="bagpresets">${Object.entries(names).map(([k, t]) => `<button class="bagpreset" data-act="decktype" data-v="${k}"><b>${esc(t)}</b><small>${k === 'more' ? '66 cards' : k === 'dmg22' ? 'Includes Balance, Donjon, Ruin, Euryale, Rogue, Skull, Idiot, Fool and Jester' : 'The usual deck'}</small></button>`).join('')}</div>`;
  else if (DECK.last) {
    const c = cards[DECK.last] || {};
    h += `<div class="deckcard"><div class="dc-name">${esc(DECK.last)}</div><p>${esc(c.text || '')}</p>${DECK.result ? `<p class="dc-res">${DECK.result}</p>` : ''}</div>`;
    if (DECK.choice) h += `<div class="chips" style="margin:8px 0">${DECK.choice.map(([t], k) => `<button class="btn gold" data-act="deckchoice" data-k="${k}">${esc(t)}</button>`).join('')}</div>`;
    else h += d.left > 0 ? `<p class="hint">${d.left} more card${d.left > 1 ? 's' : ''} to draw (within an hour of the last one).</p><div class="actions"><button class="btn" data-act="deckstop"${DECK.mayStop ? '' : ' hidden'}>Stop drawing</button><button class="btn gold" data-act="deckdraw">Draw the next card</button></div>`
      : `<p class="hint">You've drawn every card you declared.</p><div class="actions"><button class="btn gold" data-act="close">Done</button></div>`;
  } else if (d.left > 0) h += `<p>${d.left} card${d.left > 1 ? 's' : ''} declared.</p><div class="actions"><button class="btn" data-act="close">Later</button><button class="btn gold" data-act="deckdraw">Draw a card</button></div>`;
  else h += `<p class="hint">Before drawing, declare how many cards you will draw. Each card must be drawn within an hour of the previous one.</p>
    <div class="row">${fld('Cards to draw', `<input class="f" id="deckn" type="number" min="1" max="22" value="1" style="width:90px">`)}<button class="btn gold" data-act="deckdeclare">Declare and draw</button><button class="linkbtn" data-act="decktype" data-v="">Change deck</button></div>
    ${d.drawn.length ? `<p class="hint">Drawn so far: ${esc(d.drawn.map(x => x.card).join(', '))}</p>` : ''}`;
  h += '</div>';
  if ($('#deckm') && $('#modal').classList.contains('open')) $('#modal-body').innerHTML = h; else openModal(h, null, true);
}
function deckDraw() {
  const d = S.deck, pool = deckPool(d.variant); if (!pool.length) { toast('The deck is empty.'); return; }
  const n = pool[Math.floor(Math.random() * pool.length)], cards = d.variant === 'more' ? DND.moreCards : DND.deckCards, c = cards[n];
  d.left = Math.max(0, N(d.left) - 1); d.drawn.push({ t: Date.now(), card: n });
  if (c.gone) d.gone = [...new Set((d.gone || []).concat(n))];
  DECK.last = n; DECK.result = ''; DECK.mayStop = !!(c.fx && c.fx.mayStop);
  if (c.fx && c.fx.choice) { DECK.choice = c.fx.choice; pendingLabel = 'Draw: ' + n; save(); renderDeck(); return; }
  DECK.choice = null; DECK.result = applyCardFx(n, c.fx || {});
  pendingLabel = 'Draw: ' + n; save(); render(); renderDeck();
  toast(`<div><b>${esc(n)}</b> — ${esc(c.text)}</div>`, '', 8000, { label: 'Undo', fn: () => undo(1) });
}
function applyCardFx(card, fx) {
  const out = [], roll = e => rollExpr(e, { need: true, label: card + ': ' + e }).total;
  if (fx.xp) { S.xp = Math.max(0, N(S.xp) + fx.xp); out.push(`${fx.xp > 0 ? '+' : ''}${fx.xp.toLocaleString()} XP`); }
  if (fx.ability) { const [a, n, mx] = fx.ability; S.abilities[a] = Math.min(mx, N(S.abilities[a]) + n); out.push(`${ABN[a]} → ${S.abilities[a]}`); }
  if (fx.all) { AB.forEach(a => { S.abilities[a] = Math.min(fx.max || 20, N(S.abilities[a]) + fx.all); }); out.push('Every ability score +1'); }
  if (fx.abilityDown) { const [a, e] = fx.abilityDown, r = roll(e); S.abilities[a] = Math.max(1, N(S.abilities[a]) - r); out.push(`${ABN[a]} −${r} (now ${S.abilities[a]})`); }
  if (fx.abilityChoice) { DECK.choice = AB.map(a => [`${ABN[a]} +${fx.abilityChoice}`, { ability: [a, fx.abilityChoice, fx.max || 20] }]); }
  if (fx.extra) { S.deck.left = Math.max(0, N(S.deck.left) + fx.extra); out.push(fx.extra > 0 ? `Draw ${fx.extra} more card${fx.extra > 1 ? 's' : ''}` : `${-fx.extra} fewer cards to draw`); }
  if (fx.stop) { S.deck.left = 0; out.push('No more cards can be drawn'); }
  if (fx.item) { S.inventory.push(Object.assign(BLANK.inventory(), { name: fx.item.name, qty: fx.item.qty || 1, notes: fx.item.notes || `From the ${card} card.` })); out.push('Added to your Pack: ' + fx.item.name); }
  if (fx.itemsRoll) fx.itemsRoll.forEach(([nm, e]) => { const q = roll(e); S.inventory.push(Object.assign(BLANK.inventory(), { name: nm, qty: q, notes: `From the ${card} card.` })); out.push(`${q} × ${nm}`); });
  if (fx.removeMagic) { const gone = S.inventory.filter(it => it.magic || it.attune); S.inventory = S.inventory.filter(it => !(it.magic || it.attune)); out.push(gone.length ? 'Disintegrated: ' + gone.map(it => it.name).join(', ') : 'You carried no magic items'); }
  if (fx.ruin) { const was = Object.values(S.currency).reduce((t, v) => t + N(v), 0); Object.keys(S.currency).forEach(k => { S.currency[k] = 0; }); out.push(was ? 'All your coins are gone' : 'You had no coins'); }
  if (fx.expertise) { setSkill(fx.expertise, 2); out.push(fx.expertise + ': expertise'); }
  if (fx.cond && !S.conditions.includes(fx.cond)) { S.conditions.push(fx.cond); out.push('Condition: ' + fx.cond); }
  if (fx.exh) { const r = roll(fx.exh); S.exhaustion = Math.min(6, N(S.exhaustion) + r); out.push(`+${r} exhaustion (now ${S.exhaustion})`); }
  if (fx.hp0) { S.hp.cur = 0; S.hp.temp = 0; out.push('You drop to 0 HP — start death saves'); }
  if (fx.maxhp) { S.hp.adj = N(S.hp.adj) + fx.maxhp; S.hp.cur = N(S.hp.cur) + fx.maxhp; out.push(`+${fx.maxhp} max and current HP`); }
  if (fx.longRest) { finishLong(); out.push('Long rest benefits gained'); }
  if (fx.saveMod) { S.deckMods = Object.assign({}, S.deckMods, { save: N((S.deckMods || {}).save) + fx.saveMod }); out.push(`${fx.saveMod} to all saving throws`); }
  if (fx.speed) { S.deckMods = Object.assign({}, S.deckMods, { speed: N((S.deckMods || {}).speed) + fx.speed }); out.push(`+${fx.speed} ft walking speed`); }
  if (fx.alignment) { const a = String(S.alignment || ''); const flip = a.replace(/Lawful|Chaotic|Good|Evil/g, m => ({ Lawful: 'Chaotic', Chaotic: 'Lawful', Good: 'Evil', Evil: 'Good' })[m]); if (flip !== a) { S.alignment = flip; out.push('Alignment is now ' + flip); } else out.push(a ? 'True neutral — no change' : 'Set your alignment, then flip it'); }
  if (fx.pit) { const ft = roll('3d6') * 10, dice = Math.min(20, Math.floor(ft / 10)), r = roll(dice + 'd6'); takeDamage ? takeDamage(r) : (S.hp.cur = Math.max(0, N(S.hp.cur) - r)); if (!S.conditions.includes('Prone')) S.conditions.push('Prone'); out.push(`Fell ${ft} ft: ${r} bludgeoning damage, prone`); }
  if (fx.roll) out.push(`Rolled ${fx.roll}: ${roll(fx.roll)}`);
  if (fx.companion) { const c = fx.companion; S.companions.push({ id: uid(), name: c.name, kind: 'custom', ac: c.ac, hp: c.hp, maxhp: c.hp, speed: c.speed, attacks: c.attacks, notes: c.notes || '' }); out.push(c.name + ' joins you (Creatures tab)'); }
  if (fx.person) { S.people = (S.people || []).concat([Object.assign(BLANK.people(), fx.person, { notes: `From the ${card} card.` })]); out.push('Added to People: ' + fx.person.name); }
  if (fx.feature) { const f = fx.feature; let max = f.max || ''; if (f.maxRoll) { max = String(roll(f.maxRoll)); out.push(`${f.name}: ${max} use${max === '1' ? '' : 's'}`); } S.features.push({ name: f.name, desc: f.desc, source: 'Deck of Many Things', auto: false, used: 0, max, reset: f.reset || 'long', col: '', spells: f.spells || [], kind: 'custom' }); rebuildAuto(); }
  S.notes.unshift({ date: new Date().toISOString().slice(0, 10), title: `Drew ${card} from the deck`, text: out.join('\n') });
  return esc(out.join(' · '));
}
window.addEventListener('resize', () => $$('input.f.name').forEach(fitNameFont));
// The line under the name (race · class · background) never runs past two lines on a computer: a long one gets smaller
// type instead, so the top bar is the same height for every character. (Remembered per text and width.)
let SUB_K = '';
function fitSubtitle() { const el = $('.namebox .subtitle'); if (!el) return;
  if (isMobile()) { if (el.style.fontSize) el.style.fontSize = ''; SUB_K = ''; return; }
  const k = el.textContent + '|' + (el.parentElement ? el.parentElement.clientWidth : 0) + '|' + document.documentElement.style.fontSize; if (k === SUB_K && el._fit) return; SUB_K = k; el._fit = 1;
  el.style.fontSize = ''; if (!el.textContent || !el.offsetParent) return; const base = parseFloat(getComputedStyle(el).fontSize) || 15;
  const lines = () => { const cs = getComputedStyle(el), lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2; return Math.round(el.clientHeight / lh); };
  el.classList.remove('sub2'); el.removeAttribute('title');
  let px = base; while (lines() > 2 && px > base * 0.72) { px -= 0.5; el.style.fontSize = px + 'px'; }
  // (still more than two lines at the smallest size: it stops after two, and the whole of it shows on hover)
  if (lines() > 2) { el.classList.add('sub2'); el.title = el.textContent; } }
window.addEventListener('resize', () => { SUB_K = ''; fitSubtitle(); });

// Desktop header stays one row: when the toolbar would wrap, its buttons drop their words and keep their icons.
// Toolbar labels fold away one button at a time (least-used first) only when the row would wrap, and come back as soon as there's room.
// (Undo and Redo lose their labels together, so the pair always matches)
const TB_FOLD = ['edit', 'history', ['redo', 'undo'], 'settings', 'save'];
// Sheet tabs on a computer: each takes the room its name needs; when they don't all fit they tighten up, then drop their
// icons, before any name gets cut short
function fitTabs() { const t = $('#tabs'); if (!t) return; t.classList.remove('tabs-tight', 'tabs-noicon'); if (isMobile()) return;
  const cut = () => [...t.querySelectorAll('.tlabel')].some(l => l.offsetParent && l.scrollWidth > l.clientWidth + 1);
  if (!cut()) return; t.classList.add('tabs-tight'); if (!cut()) return; t.classList.add('tabs-noicon'); }
// The Inspiration pill in the top bar's corner keeps clear of the Tome button and the faces beside it: when they'd meet,
// it drops its label (just − number +), and the row's room is set to whatever the pill actually takes.
function inspDockFit() {
  const d = $('.toolbar > .insp-dock'), row = $('.toolbar > .pg-hubrow'); if (!d) return;
  d.classList.remove('tight'); if (!row) return;
  const kids = [...row.children].filter(k => k.offsetParent), used = () => kids.reduce((a, k) => Math.max(a, k.getBoundingClientRect().right), row.getBoundingClientRect().left);
  const room = () => d.getBoundingClientRect().left - 10;
  if (used() > room()) d.classList.add('tight');
  row.style.setProperty('--insp-w', Math.ceil(d.getBoundingClientRect().width + 10) + 'px');
}
function fitToolbar() {
  fitTabs();
  const tb = $('.toolbar'); if (!tb) return;
  // (the site's Tome button row goes back into a freshly drawn toolbar first, so it's measured as it will look)
  if (typeof window.pgHubRow === 'function') try { window.pgHubRow(); } catch (e) {}
  if (typeof window.__pwFit === 'function') try { window.__pwFit(); } catch (e) {} // (and the portrait beside it at its size)
  inspDockFit();
  tb.classList.remove('tb-compact', 'tb-wrap'); $$('.toolbar .nolbl').forEach(k => k.classList.remove('nolbl'));
  if (isMobile()) return;
  const kids = [...tb.children].filter(k => k.offsetParent !== null && !k.classList.contains('pg-hubrow')); if (kids.length < 2) return; // (the site's own row above the buttons doesn't count)
  const tight = () => { const b0 = kids[0].getBoundingClientRect().bottom; return kids.some(k => k.getBoundingClientRect().top >= b0 - 2) || tb.scrollWidth > tb.clientWidth + 2; };
  for (const key of TB_FOLD) { if (!tight()) return; [].concat(key).forEach(k => { const el = tb.querySelector(`[data-zi="${k}"]`); if (el) el.classList.add('nolbl'); }); }
  if (!tight()) return;
  // Still too tight with icons only: the window is too narrow for the computer layout, so it switches to the phone layout
  // (unless the computer layout was picked by hand, or this is the phone preview)
  if (!LAYOUT_NOW && !window.PG_IN_PHONE && !onPhone()) { MOBILE_AT = Math.max(MOBILE_AT || 0, window.innerWidth + 1); applyLayout(); if (isMobile()) { queueMicrotask(() => render()); return; } }
  tb.classList.add('tb-compact');
  if (tight()) tb.classList.add('tb-wrap');  // very narrow windows: icons may take two rows inside the toolbar's own box
}
let _tbRaf = 0; const fitToolbarSoon = () => { cancelAnimationFrame(_tbRaf); _tbRaf = requestAnimationFrame(fitToolbar); };
if (window.ResizeObserver) { const ro = new ResizeObserver(fitToolbarSoon); const watch = () => { const w = $('.banner .wrap') || $('.banner'); if (w) ro.observe(w); else setTimeout(watch, 300); }; watch(); }
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitToolbarSoon);
window.addEventListener('resize', fitToolbarSoon);

// ---------- Roll20 connection (Settings → Dice) ----------
function renderR20Box() {
  const box = $('#r20status'); if (!box) return;
  const camp = ST('r20campaign') || '';
  if (!R20.ok) {
    const b = browserInfo();
    box.innerHTML = `<p><b>Not connected.</b> This needs a small browser extension.</p>
      <div class="row">${b.ok ? `<button class="btn sm gold" data-act="r20setup">Set up for ${esc(b.name)}…</button>` : ''}<button class="btn sm" data-act="r20check">Check again</button></div>${b.ok ? '' : `<p class="hint">${b.why}</p>`}`;
    return;
  }
  const old = R20.ver && R20.ver !== 'mock' && R20.ver.split('.').map(Number).reduce((t, v, i) => t + v * [10000, 100, 1][i], 0) < 10400;
  const bi = browserInfo(), ext = bi.url || ({ 'Microsoft Edge': 'edge://extensions', Opera: 'opera://extensions', Brave: 'brave://extensions', Vivaldi: 'vivaldi://extensions' })[bi.name] || 'chrome://extensions';
  const dupes = R20.dupes ? `<p class="warn sm"><b>The extension is installed twice</b>, so every roll would post twice in Roll20. Open <button class="urlbtn" data-act="copyurl" data-url="${ext}" title="Copy, then paste it into the address bar"><code>${ext}</code><span aria-hidden="true">⧉</span></button> and remove the copy you loaded by hand (the one that isn’t from ${bi.storeName || 'the store'}), then refresh this sheet and Roll20.</p>` : '';
  box.innerHTML = `<p class="ok"><b>Extension connected</b>${R20.ver ? ' (v' + esc(R20.ver) + ')' : ''}.</p>${dupes}${old && bi.store ? `<p class="warn sm">A newer extension is out (auras can follow your tokens on the map), and it’s now on ${bi.storeName}, where it updates itself: <a class="btn sm gold" href="${bi.storeUrl}" target="_blank" rel="noopener">Get it</a> — then remove this old copy in <button class="urlbtn" data-act="copyurl" data-url="${ext}" title="Copy, then paste it into the address bar"><code>${ext}</code><span aria-hidden="true">⧉</span></button> and refresh this sheet and Roll20.</p>` : ''}${old && !bi.store ? `<p class="warn sm">A newer extension is out (auras can follow your tokens on the map). <button class="btn sm" data-act="r20ext">Download</button>, unzip it, and ${r20Ver() < 10302 ? 'in your extensions page <b>remove the old one</b> and <b>Load unpacked</b> the new folder, then refresh Roll20. This is the last time you need to remove it — from now on, loading a newer version replaces the old one by itself.' : 'and <b>Load unpacked</b> the new folder in your extensions page — it replaces the old one. Then refresh Roll20.'}</p>` : ''}
    <div class="row">${fld('Your Roll20 game', `<select class="f" id="r20camp"><option value="">${R20.list.length ? '— pick your game —' : 'Open your game in Roll20, then Refresh'}</option>${R20.list.map(g => `<option value="${esc(g.campaign)}"${g.campaign === camp ? ' selected' : ''}>${esc(g.campaign)}${g.player ? ' — signed in as ' + esc(g.player) : ''}</option>`).join('')}${camp && !R20.list.some(g => g.campaign === camp) ? `<option value="${esc(camp)}" selected>${esc(camp)} (not open right now)</option>` : ''}</select>`)}
      <button class="btn sm" data-act="r20refresh">Refresh</button><button class="btn sm" data-act="r20test">Test roll</button></div>
    <p class="hint">Rolls are posted as ${esc(S.name || 'your character')} when that name is one of your Roll20 characters; otherwise as you. Keep the Roll20 tab open (it can be in the background).</p>`;
  if (!R20.list.length && !R20._asked) { R20._asked = true; r20Refresh(); }
}
async function r20Refresh() { try { const d = await r20Send({ type: 'campaigns' }, 6000); R20.list = d.list || []; } catch (e) { R20.list = []; toast(esc(e.message), 'fumble'); } renderR20Box(); }
document.addEventListener('change', e => { if (e.target.id === 'r20camp') { S.settings = Object.assign({}, S.settings, { r20campaign: e.target.value }); pendingLabel = 'Roll20 game: ' + (e.target.value || 'none'); save(); toast(e.target.value ? `Rolls go to <b>${esc(e.target.value)}</b>.` : 'No game picked.'); } });

// A tiny .zip writer (stored, no compression) for the extension download.
function makeZip(files) {
  const enc = new TextEncoder(), crcT = [];
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
  const crc = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = crcT[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const parts = [], central = []; let off = 0;
  const u16 = v => [v & 255, (v >>> 8) & 255], u32 = v => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
  Object.entries(files).forEach(([name, text]) => {
    const nb = enc.encode(name), db = typeof text === 'string' ? enc.encode(text) : text, c = crc(db);
    const head = [...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0), ...u32(c), ...u32(db.length), ...u32(db.length), ...u16(nb.length), ...u16(0)];
    parts.push(new Uint8Array(head), nb, db);
    central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0), ...u32(c), ...u32(db.length), ...u32(db.length), ...u16(nb.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), nb);
    off += head.length + nb.length + db.length;
  });
  const csize = central.reduce((t, b) => t + b.length, 0);
  const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(Object.keys(files).length), ...u16(Object.keys(files).length), ...u32(csize), ...u32(off), ...u16(0)]);
  const all = parts.concat(central, [end]), out = new Uint8Array(all.reduce((t, b) => t + b.length, 0)); let p = 0; all.forEach(b => { out.set(b, p); p += b.length; });
  return out;
}
function downloadR20Ext() {
  const files = {}; Object.entries(DND.r20ext || {}).forEach(([n, t]) => { files[n] = /^b64:/.test(t) ? Uint8Array.from(atob(t.slice(4)), c => c.charCodeAt(0)) : t; });  // files at the top of the zip, so the unzipped folder is the one to load
  // One manifest can't satisfy both Chrome and Firefox without warnings, so trim it for the browser that's downloading it.
  try {
    const m = JSON.parse(files['manifest.json']), ff = /Firefox\//.test(navigator.userAgent);
    if (ff) { delete m.key; if (m.background) delete m.background.service_worker; }
    else { delete m.browser_specific_settings; if (m.background) delete m.background.scripts; }
    files['manifest.json'] = JSON.stringify(m, null, 2);
  } catch (e) {}
  download('adventurers-tome-roll20-extension.zip', makeZip(files), 'application/zip');
}

// The extension on the Chrome Web Store (Chrome, Edge, Brave, Opera and Vivaldi install it from there).
const R20_STORE = 'https://chromewebstore.google.com/detail/mgpepimfnfhagocgdbmmngiennbijgcd';
const R20_AMO = 'https://addons.mozilla.org/en-US/firefox/addon/adventurers-tome-roll20/';
// Which browser this is, and how to load the Roll20 extension in it.
function browserInfo() {
  const ua = navigator.userAgent || '', brands = ((navigator.userAgentData && navigator.userAgentData.brands) || []).map(b => b.brand).join(' ');
  const dl = `<button class="btn sm gold" data-act="r20ext">Download extension</button>`, open = '<button class="btn sm" data-act="r20open">Open Roll20</button>';
  const unzip = `Download the extension and unzip it (Windows: right-click the .zip → <b>Extract All</b>; Mac: double-click it): ${dl}`;
  const pick = 'pick the <b>dnd-sheet-roll20-extension</b> folder — the one with <code>manifest.json</code> directly inside it';
  const finish = [`Sign in to Roll20 and open your game: ${open}`, 'Reload this sheet, come back here and pick your game.'];
  const store = `<a class="btn sm gold" href="${R20_STORE}" target="_blank" rel="noopener">Open the Chrome Web Store</a>`;
  const chromish = (name, url, devmode, first) => ({ name, url, ok: true, store: true, storeName: 'the Chrome Web Store', storeUrl: R20_STORE, steps: [`${first ? first + ' ' : ''}Add the extension from the Chrome Web Store: click <b>${/Edge/.test(name) ? 'Get' : 'Add to Chrome'}</b> there. It updates itself from then on.<div class="r20go">${store}</div><span class="hint r20note">Loaded it by hand before (Developer mode)? Remove that copy in <button class="urlbtn" data-act="copyurl" data-url="${url}" title="Copy — browsers only let you open this page by pasting it into the address bar"><code>${url}</code><span aria-hidden="true">⧉</span></button> so rolls don’t post twice.</span>`].concat(finish),
    manual: [unzip, `Open <button class="urlbtn" data-act="copyurl" data-url="${url}" title="Copy — browsers only let you open this page by pasting it into the address bar"><code>${url}</code><span aria-hidden="true">⧉</span></button> — click it to copy, then paste it into the address bar.`, devmode, `Click <b>Load unpacked</b> and ${pick}. <span class="hint">Updating later works the same way — loading a newer version replaces the old one, no need to remove it first.</span>`] });
  if (/iPhone|iPad|Android/i.test(ua) || document.documentElement.classList.contains('mobile') && /Mobi/i.test(ua)) return { name: 'a phone or tablet', ok: false, why: 'Phone and tablet browsers can’t load this extension. Use “I use my own rolls” here, or open the sheet on a computer with Chrome, Edge, Brave, Opera or Firefox.' };
  if (/Firefox\//.test(ua)) return { name: 'Firefox', url: 'about:addons', ok: true, store: true, storeName: 'Firefox Add-ons', storeUrl: R20_AMO, steps: [`Add the extension from Firefox Add-ons: click <b>Add to Firefox</b> there, then <b>Add</b>. It updates itself from then on, and stays after Firefox restarts.<div class="r20go"><a class="btn sm gold" href="${R20_AMO}" target="_blank" rel="noopener">Open Firefox Add-ons</a></div><span class="hint r20note">Loaded it before as a temporary add-on? You don’t need to anymore — this one replaces it.</span>`].concat(finish),
    manual: [unzip, 'Open <button class="urlbtn" data-act="copyurl" data-url="about:debugging#/runtime/this-firefox" title="Copy"><code>about:debugging#/runtime/this-firefox</code><span aria-hidden="true">⧉</span></button> — click it to copy, then paste it into the address bar.', 'Click <b>Load Temporary Add-on…</b> and choose the <code>manifest.json</code> file inside the unzipped folder (a newer version loaded this way replaces the old one).', 'Firefox removes temporary add-ons when it closes, so repeat this after restarting Firefox.'] };
  if (/Edg\//.test(ua) || /Edge/.test(brands)) return chromish('Microsoft Edge', 'edge://extensions', 'Turn on <b>Developer mode</b> (left side of the page).', 'If Edge asks, click <b>Allow extensions from other stores</b>.');
  if (/OPR\//.test(ua) || /Opera/.test(brands)) return chromish('Opera', 'opera://extensions', 'Turn on <b>Developer mode</b> (top right).', 'Opera first needs its <a href="https://addons.opera.com/extensions/details/install-chrome-extensions/" target="_blank" rel="noopener">Install Chrome Extensions</a> add-on.');
  if (navigator.brave || /Brave/.test(brands)) return chromish('Brave', 'brave://extensions', 'Turn on <b>Developer mode</b> (top right).');
  if (/Vivaldi/.test(ua)) return chromish('Vivaldi', 'vivaldi://extensions', 'Turn on <b>Developer mode</b> (top right).');
  if (/Safari\//.test(ua) && !/Chrome\/|Chromium\//.test(ua)) return { name: 'Safari', ok: false, why: 'Safari can’t load this extension. Open the sheet in Chrome, Edge, Brave, Opera or Firefox to use Roll20 rolls, or use “I use my own rolls” here.' };
  if (/Chrome\//.test(ua)) return chromish('Google Chrome', 'chrome://extensions', 'Turn on <b>Developer mode</b> (top right).');
  return chromish('your browser', 'chrome://extensions', 'Turn on <b>Developer mode</b>.');
}

// Step-by-step setup for this browser, in its own window so Settings stays on one screen.
function openR20Setup() {
  const b = browserInfo();
  openModal(`<h3>Connect Roll20 — ${esc(b.name)}</h3>
    <p class="hint">Roll20 doesn't let other websites post to its chat, so rolls go through a small browser extension (the same idea as Beyond20). It only talks to Roll20 and to this sheet.</p>
    ${b.ok ? `<ol class="r20steps">${b.steps.map(x => `<li>${x}</li>`).join('')}</ol>` : `<p>${b.why}</p>`}
    ${b.manual ? `<details class="r20manual"><summary>Can’t use ${b.storeName}? Load it yourself instead</summary><ol class="r20steps">${b.manual.map(x => `<li>${x}</li>`).join('')}</ol></details>` : ''}
    <div class="actions"><button class="btn" data-act="settings">Back to Settings</button><button class="btn gold" data-act="r20check2">I've done it — check</button></div>`);
}


// Skills: tapping the name rolls it too (the whole bonus + name area is one target).
document.addEventListener('click', e => { const hit = e.target.closest && e.target.closest('.sk-hit, .ooc-sk, .pvtool, .saverow'); if (!hit || e.target.closest('.roll, .notetip')) return; const r = hit.querySelector('.roll'); if (r) r.click(); });
document.addEventListener('change', e => { if (e.target && e.target.id === 'condSkill') { UI.condSkill = e.target.value; if (mOpen('#condmodal')) openConditions(); } });

// Phone → computer → Roll20: shows whether the computer is there to roll (it checks in every half minute while ready).
function relayStatus() { const box = $('#relaystatus'); if (!box || !window.PG_RELAY) return;
  window.PG_RELAY.hostSeen().then(at => { if (!box.isConnected) return; const ok = at && Date.now() - at < 75000;
    box.innerHTML = ok ? `<span class="rs-ic ok">✓</span><div class="rs-t"><b>Your computer is ready</b><span>Rolls from here post in Roll20 through it.</span></div>` : `<span class="rs-ic warn">!</span><div class="rs-t"><b>Your computer isn’t connected</b><span>Open this character on your computer, choose “Roll20 rolls for me” in Settings → Dice there, and keep your Roll20 game open. Until then the sheet rolls here.</span></div>`; }, () => {}); }
new MutationObserver(() => { const b = $('#relaystatus'); if (b && !b.dataset.seen) { b.dataset.seen = 1; relayStatus(); } }).observe(document.body, { childList: true, subtree: true });
setInterval(() => { if ($('#relaystatus')) relayStatus(); }, 15000);

// Sentinel Raven: is the raven on your shoulder? (darkvision 30 ft and CHA on Perception while it is)
function ravenChk(small) { return `<label class="ravenchk${small ? ' sm' : ''}" title="While your raven is perched on your shoulder: darkvision 30 ft and +${Math.max(0, mod('cha'))} (CHA) to Perception"><input type="checkbox" data-raven${ravenOn() ? ' checked' : ''}><span>${small ? 'Raven perched' : 'Raven is on my shoulder'}</span></label>`; }
document.addEventListener('change', e => { if (!e.target || !e.target.matches || !e.target.matches('[data-raven]')) return; S.ravenPerched = e.target.checked; pendingLabel = e.target.checked ? 'Raven on your shoulder' : 'Raven off your shoulder'; save(); render(); });

// The "also show in Roll20" box sits inside the sheet-rolls card: tapping its words ticks it (not the card's radio).
document.addEventListener('click', e => { const d = e.target.closest && e.target.closest('.dsub'); if (!d || e.target.tagName === 'INPUT') return; e.preventDefault(); d.querySelector('input').click(); });
