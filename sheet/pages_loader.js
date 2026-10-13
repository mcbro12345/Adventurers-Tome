// GitHub Pages loader. Modes (from the address):
//   ?c=<id>            a character, loaded from Firestore and kept in sync
//   ?g=<group>         the party hub: every character in the group, in folders by player
//   ?new=1[&g=..&p=..] a brand-new character (gets its own ?c= link once created)
//   (nothing)          this device's hub if it has one, otherwise a new character
(async () => {
  const CFG = __CFG__, VER = '__VER__';
  const Q = new URLSearchParams(location.search), clean = v => (v || '').replace(/[^A-Za-z0-9_-]/g, '');
  let C = clean(Q.get('c')), G = clean(Q.get('g'));
  const P = (Q.get('p') || '').slice(0, 60);
  const LAST_G = 'dnd-hub-group', ME = 'dnd-hub-me';
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  if (!C && !G && !Q.get('new') && lsGet(LAST_G)) { location.replace(location.pathname + '?g=' + lsGet(LAST_G)); return; }
  const load = document.getElementById('pg-load'), data = document.getElementById('sheet-data');
  let fs = null;
  try { firebase.initializeApp(CFG); fs = firebase.firestore(); } catch (e) { console.error(e); }
  const me = () => { try { return JSON.parse(lsGet(ME) || 'null'); } catch (e) { return null; } };
  const rid = () => { const a = new Uint8Array(18); crypto.getRandomValues(a); return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  if (G && !C && !Q.get('new') && fs) { lsSet(LAST_G, G); if (load) load.remove(); return hub(fs, G); }

  const NEW = !C;
  if (NEW) C = rid();
  window.SHEET_PAGES = true; window.SHEET_CHAR = C;
  const run = () => { if (load) load.remove(); const s = document.createElement('script'); s.textContent = document.getElementById('app-src').textContent; document.body.appendChild(s); };
  if (!fs) { if (NEW) delete window.SHEET_CHAR; run(); return; }
  const col = fs.collection('sheets'), CACHE = 'dnd-pages-cache:' + C;
  let txt = null, missing = false;
  if (!NEW) try {
    const sn = await col.doc(C).get();
    if (!sn.exists || !sn.data().data) missing = true;
    else {
      const d = sn.data(); let str = d.data || ''; const n = Number(d.n) || 1;
      if (d.g && !G) G = clean(d.g);
      for (let k = 1; k < n; k++) { const p = await col.doc(C + '_p' + k).get(); const pd = p.exists ? p.data() : null; if (!pd || Number(pd.savedAt) !== Number(d.savedAt)) { str = null; break; } str += pd.data || ''; }
      if (str) { JSON.parse(str); txt = str; lsSet(CACHE, str); }
    }
  } catch (e) { console.warn('Offline or blocked — using this browser\'s copy', e); }
  if (!txt && !NEW) txt = lsGet(CACHE);
  if (!txt && !NEW) {
    if (load) load.innerHTML = missing ? '<div style="max-width:420px;text-align:center;padding:20px">This sheet link doesn\'t point to a character.<br><br><small style="font-weight:400">Check the link you were sent, or ask your DM for it again.</small></div>' : '<div style="max-width:420px;text-align:center;padding:20px">Couldn\'t reach the sheet\'s storage.<br><br><small style="font-weight:400">Check your connection and reload.</small></div>';
    return;
  }
  if (txt) data.textContent = txt;
  if (G) lsSet(LAST_G, G);

  // Keep this character's card in the party hub up to date (name, class, level, portrait, who edited it last).
  let thumbKey = '', thumbVal = '', hubT = null;
  const thumb = src => new Promise(res => { if (!src) return res(''); const k = src.length + ':' + src.slice(-64); if (k === thumbKey) return res(thumbVal);
    const im = new Image(); im.onload = () => { try { const c = document.createElement('canvas'), n = 112, s = Math.min(im.width, im.height); c.width = c.height = n; c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2 * 0.6, s, s, 0, 0, n, n); thumbKey = k; thumbVal = c.toDataURL('image/jpeg', 0.8); res(thumbVal); } catch (e) { res(''); } }; im.onerror = () => res(''); im.src = src; });
  const hubUpdate = async () => { if (!G || !window.sheetSummary) return; const st = window.sheetState && window.sheetState(); if (!st || !st.created) return;
    const s = window.sheetSummary(), m = me();
    try { await fs.collection('groups/' + G + '/chars').doc(C).set({ name: s.name, player: s.player, race: s.race, cls: s.cls, level: s.level, hp: s.hp, thumb: await thumb(s.portrait), updatedAt: Date.now(), by: (m && m.name) || '' }, { merge: true }); } catch (e) { console.warn('hub', e); } };
  const hubSoon = () => { clearTimeout(hubT); hubT = setTimeout(hubUpdate, 4000); };

  // The sheet's sync code talks to "db" like it does on claude.ai; here that's this character's Firestore documents.
  const docFor = p => { const m = /^sheets\/(main|part(\d+))$/.exec(p); return m ? [col.doc(m[2] ? C + '_p' + m[2] : C), !m[2]] : null; };
  const none = { get: async () => ({ exists: false, data: () => null }), set: async () => { throw { code: 'unsupported' }; }, delete: async () => {}, onSnapshot: () => () => {} };
  const db = { doc: p => { const x = docFor(p); if (!x) return none; const [r, main] = x;
    return { get: () => r.get(), set: v => { if (main && G) v = Object.assign({}, v, { g: G }); const w = r.set(v); if (main) w.then(hubSoon, () => {}); return w; }, delete: () => r.delete(), onSnapshot: (cb, err) => r.onSnapshot(cb, err) }; } };
  const user = { id: async () => null, isOwner: async () => true, can: async () => true };
  window.claude = { use: async n => n === 'db' ? db : n === 'user' ? user : null };
  run();
  if (NEW && P) { try { const st = window.sheetState(); if (st && !st.player) st.player = P; } catch (e) {} }
  // Moved to another player's folder from the hub: the sheet's Player field follows.
  if (!NEW && G) setTimeout(async () => { try { const h = await fs.collection('groups/' + G + '/chars').doc(C).get(); const hd = h.exists ? h.data() : null; const st = window.sheetState && window.sheetState();
    if (hd && hd.playerSet && st && st.created && (hd.player || '') !== (st.player || '') && Number(hd.playerSet) > Number(st.savedAt || 0) - 1) window.sheetSet('player', hd.player || ''); } catch (e) {} hubUpdate(); }, 2500);
  // New character: once it's created (and saved to the cloud), its private link goes in the address bar.
  if (NEW) { const t = setInterval(() => { let made = false; try { const st = window.sheetState && window.sheetState(); made = !!(st && st.created); } catch (e) {} if (!made) return; clearInterval(t);
    history.replaceState(null, '', location.pathname + '?c=' + C);
    const link = location.href, copy = () => { try { navigator.clipboard.writeText(link); window.sheetToast('Link copied.'); } catch (e) {} };
    setTimeout(() => window.sheetToast(`<div><b>This character has its own link now</b><div class="det">${G ? 'It\'s in your party hub too. ' : ''}It's in the address bar — bookmark it or copy it. Open it on any device to get this character, synced live. Keep it private: anyone with the link can edit the character.</div></div>`, '', 20000, { label: 'Copy link', fn: copy }), 600);
    hubSoon();
  }, 500); }
  // Back to the hub (desktop and phone).
  if (G) { const a = document.createElement('a'); a.href = location.pathname + '?g=' + G; a.className = 'pg-hublink'; a.title = 'All characters'; a.textContent = '⌂ Party'; document.body.appendChild(a); }
  // A newer version of the sheet was pushed: offer a reload (the character is saved first).
  const check = async () => { try { const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' }); const v = (await r.json()).v; if (v && v !== VER && !document.getElementById('pg-upd')) { const b = document.createElement('button'); b.id = 'pg-upd'; b.textContent = 'Sheet updated — tap to reload'; b.onclick = () => { b.textContent = 'Saving…'; setTimeout(() => location.reload(), 1200); }; document.body.appendChild(b); } } catch (e) {} };
  setInterval(check, 5 * 60 * 1000); document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
})();

// ================= The party hub =================
function hub(fs, G) {
  const ME = 'dnd-hub-me', OPEN = 'dnd-hub-open:' + G;
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const me = () => { try { return JSON.parse(ls.get(ME) || 'null'); } catch (e) { return null; } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const ago = t => { if (!t) return ''; const s = (Date.now() - t) / 1000; return s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + 'm ago' : s < 86400 ? Math.floor(s / 3600) + 'h ago' : Math.floor(s / 86400) + 'd ago'; };
  const base = location.pathname;
  document.title = 'Party — D&D Character Sheets';
  document.body.innerHTML = '<div id="hub"></div><div id="hub-modal" class="hub-modal"></div><div id="hub-toast" class="hub-toast"></div>';
  document.body.className = 'hubbody';
  const root = document.getElementById('hub'), modal = document.getElementById('hub-modal');
  let chars = [], group = { name: '' }, open = {};
  try { open = JSON.parse(ls.get(OPEN) || '{}'); } catch (e) {}
  const toast = t => { const el = document.getElementById('hub-toast'); el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2600); };
  const players = () => [...new Set(chars.map(c => (c.player || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const norm = v => String(v || '').trim().toLowerCase();
  const isMine = name => { const m = me(); return !!(m && name && norm(m.name) === norm(name)); };
  // "Everyone" is the DM's view: every character, in folders by player. Any other name sees only its own characters.
  const ADMIN = ['everyone'], isAdmin = () => { const m = me(); return !!(m && ADMIN.includes(norm(m.name))); };
  const charsCol = fs.collection('groups/' + G + '/chars'), gDoc = fs.collection('groups').doc(G);

  function askWho(force) {
    const m = me(); if (m && !force) return;
    const ps = players();
    modal.innerHTML = `<div class="hub-card"><h2>Who's using this device?</h2><p class="hub-hint">Pick yourself once — this device will remember. It's used to put your characters first and to show who changed what.</p>
      <div class="who-list">${ps.filter(p => norm(p) !== 'everyone').map(p => `<button class="who" data-who="${esc(p)}">${esc(p)}</button>`).join('')}<button class="who who-all" data-who="Everyone">Everyone</button></div>
      <form id="who-f" class="who-f"><input id="who-in" placeholder="${ps.length ? 'Someone else? Type your name' : 'Your name'}" maxlength="40" autocomplete="name"><button class="btn gold">That's me</button></form>
      ${m ? '<button class="btn ghost" id="who-x">Cancel</button>' : ''}</div>`;
    modal.classList.add('on');
    const pick = name => { name = (name || '').trim(); if (!name) return; ls.set(ME, JSON.stringify({ name })); modal.classList.remove('on'); draw(); toast('Hi, ' + name + '!'); };
    modal.querySelectorAll('[data-who]').forEach(b => b.onclick = () => pick(b.dataset.who));
    modal.querySelector('#who-f').onsubmit = e => { e.preventDefault(); pick(modal.querySelector('#who-in').value); };
    const x = modal.querySelector('#who-x'); if (x) x.onclick = () => modal.classList.remove('on');
  }
  function createChar() {
    const m = me(), ps = players();
    if (!isAdmin()) { if (!m) return askWho(true); location.href = base + '?new=1&g=' + G + '&p=' + encodeURIComponent(m.name); return; }
    modal.innerHTML = `<div class="hub-card"><h2>New character</h2><p class="hub-hint">Whose character is it? It opens the character builder; when you finish, it gets its own link and shows up here.</p>
      <form id="new-f" class="who-f"><input id="new-p" list="new-pl" value="${esc(m ? m.name : '')}" placeholder="Player name" maxlength="40"><datalist id="new-pl">${ps.map(p => `<option value="${esc(p)}">`).join('')}</datalist><button class="btn gold">Create character</button></form>
      <button class="btn ghost" id="new-x">Cancel</button></div>`;
    modal.classList.add('on');
    modal.querySelector('#new-f').onsubmit = e => { e.preventDefault(); const p = modal.querySelector('#new-p').value.trim(); location.href = base + '?new=1&g=' + G + (p ? '&p=' + encodeURIComponent(p) : ''); };
    modal.querySelector('#new-x').onclick = () => modal.classList.remove('on');
  }
  function moveChar(c) {
    const ps = players();
    modal.innerHTML = `<div class="hub-card"><h2>Move ${esc(c.name || 'character')}</h2><p class="hub-hint">Put it in another player's folder. (This also changes the Player field on the sheet the next time it's opened.)</p>
      <form id="mv-f" class="who-f"><input id="mv-p" list="mv-pl" value="${esc(c.player || '')}" placeholder="Player name" maxlength="40"><datalist id="mv-pl">${ps.map(p => `<option value="${esc(p)}">`).join('')}</datalist><button class="btn gold">Move</button></form>
      <button class="btn ghost" id="mv-x">Cancel</button></div>`;
    modal.classList.add('on');
    modal.querySelector('#mv-f').onsubmit = async e => { e.preventDefault(); const p = modal.querySelector('#mv-p').value.trim(); modal.classList.remove('on'); await charsCol.doc(c.id).set({ player: p, playerSet: Date.now() }, { merge: true }); toast('Moved.'); };
    modal.querySelector('#mv-x').onclick = () => modal.classList.remove('on');
  }
  function removeChar(c) {
    modal.innerHTML = `<div class="hub-card"><h2>Remove ${esc(c.name || 'this character')} from the list?</h2><p class="hub-hint">The character itself isn't deleted — its link keeps working, and opening it puts it back here.</p>
      <div class="row"><button class="btn ghost" id="rm-x">Cancel</button><button class="btn red" id="rm-ok">Remove from list</button></div></div>`;
    modal.classList.add('on');
    modal.querySelector('#rm-ok').onclick = async () => { modal.classList.remove('on'); await charsCol.doc(c.id).delete(); toast('Removed from the list.'); };
    modal.querySelector('#rm-x').onclick = () => modal.classList.remove('on');
  }
  function card(c) {
    const link = base + '?c=' + c.id;
    return `<div class="hc${c.pin ? ' pinned' : ''}"><a class="hc-main" href="${esc(link)}">${c.thumb ? `<img class="hc-pic" src="${esc(c.thumb)}" alt="">` : `<span class="hc-pic hc-nopic">${esc((c.name || '?')[0])}</span>`}
      <span class="hc-txt"><b>${esc(c.name || 'Unnamed character')}</b><span>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}</span>
      <small>${c.hp ? 'HP ' + esc(c.hp) + ' · ' : ''}${c.updatedAt ? 'Updated ' + ago(c.updatedAt) + (c.by ? ' by ' + esc(c.by) : '') : ''}</small></span></a>
      <div class="hc-menu"><button class="hc-dots" aria-label="More">⋯</button><div class="hc-list">
        <button data-a="copy" data-id="${esc(c.id)}">Copy link</button>${isAdmin() ? `<button data-a="move" data-id="${esc(c.id)}">Move to another player</button><button data-a="rm" data-id="${esc(c.id)}">Remove from list</button>` : ''}</div></div></div>`;
  }
  // Pinned first; then each player's own order (drag to change), then most recently updated.
  const ord = (a, b) => (!!b.pin - !!a.pin) || ((a.order != null ? a.order : 1e9) - (b.order != null ? b.order : 1e9)) || ((b.updatedAt || 0) - (a.updatedAt || 0));
  function row(c) {
    return `<div class="hr${c.pin ? ' pinned' : ''}" data-id="${esc(c.id)}" data-pin="${c.pin ? 1 : 0}"><span class="hr-grip" title="Drag to reorder" aria-label="Drag to reorder">⠿</span>
      <a class="hr-main" href="${esc(base + '?c=' + c.id)}">${c.thumb ? `<img class="hc-pic" src="${esc(c.thumb)}" alt="">` : `<span class="hc-pic hc-nopic">${esc((c.name || '?')[0])}</span>`}
      <span class="hc-txt"><b>${esc(c.name || 'Unnamed character')}</b><span>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}</span>
      <small>${c.hp ? 'HP ' + esc(c.hp) + ' · ' : ''}${c.updatedAt ? 'Updated ' + ago(c.updatedAt) + (c.by ? ' by ' + esc(c.by) : '') : ''}</small></span></a>
      <button class="hr-pin${c.pin ? ' on' : ''}" data-pin-id="${esc(c.id)}" title="${c.pin ? 'Unpin' : 'Pin to the top'}" aria-pressed="${!!c.pin}"><svg viewBox="0 0 24 24" width="18" height="18" fill="${c.pin ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 3h6l-1 6 4 4H6l4-4z"/><path d="M12 13v8"/></svg></button>
      <div class="hc-menu"><button class="hc-dots" aria-label="More">⋯</button><div class="hc-list"><button data-a="copy" data-id="${esc(c.id)}">Copy link</button></div></div></div>`;
  }
  async function saveOrder(ids) { await Promise.all(ids.map((id, i) => { const c = chars.find(x => x.id === id); if (c && c.order === i) return null; if (c) c.order = i; return charsCol.doc(id).set({ order: i }, { merge: true }); })); }
  async function togglePin(id) { const c = chars.find(x => x.id === id); if (!c) return; const mine = chars.filter(x => isMine(x.player) || isAdmin());
    const pin = !c.pin, same = mine.filter(x => !!x.pin === pin && x.id !== id).map(x => x.order != null ? x.order : 0);
    const order = pin ? (same.length ? Math.max(...same) + 1 : 0) : (same.length ? Math.min(...same) - 1 : 0);
    c.pin = pin; c.order = order; draw(); await charsCol.doc(id).set({ pin, order }, { merge: true }); toast(pin ? 'Pinned to the top.' : 'Unpinned.'); }
  // Drag a row by its grip (mouse or touch). Pinned rows only move among pinned rows, the rest among the rest.
  let RD = null;
  // The row lifts and follows the pointer; a gap shows where it will land, and the other rows slide out of the way.
  const slide = (rows, mutate) => { const before = new Map(rows.map(x => [x, x.getBoundingClientRect().top])); mutate();
    rows.forEach(x => { const d = before.get(x) - x.getBoundingClientRect().top; if (!d) return; x.style.transition = 'none'; x.style.transform = `translateY(${d}px)`; requestAnimationFrame(() => { x.style.transition = 'transform .18s ease'; x.style.transform = ''; }); }); };
  document.addEventListener('pointerdown', e => { const g = e.target.closest && e.target.closest('.hr-grip'); if (!g || e.button > 0) return; const r = g.closest('.hr'); e.preventDefault();
    const b = r.getBoundingClientRect(), ph = document.createElement('div'); ph.className = 'hr-ph'; ph.style.height = b.height + 'px'; r.after(ph);
    Object.assign(r.style, { position: 'fixed', left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', margin: 0, zIndex: 40, transition: 'none' });
    RD = { r, ph, pin: r.dataset.pin, list: ph.parentElement, dy: e.clientY - b.top }; r.classList.add('drag'); document.body.classList.add('hdragging'); });
  document.addEventListener('pointermove', e => { if (!RD) return; e.preventDefault(); RD.r.style.top = (e.clientY - RD.dy) + 'px';
    const rows = [...RD.list.querySelectorAll(':scope > .hr')].filter(x => x !== RD.r), peers = rows.filter(x => x.dataset.pin === RD.pin);
    if (!peers.length) return;
    const tgt = peers.find(x => { const bb = x.getBoundingClientRect(); return e.clientY < bb.top + bb.height / 2; });
    const want = tgt ? tgt : peers[peers.length - 1];
    if (tgt ? RD.ph.nextElementSibling !== tgt : RD.ph.previousElementSibling !== want) slide(rows, () => tgt ? tgt.before(RD.ph) : want.after(RD.ph));
    const edge = 60; if (e.clientY < edge) scrollBy(0, -10); else if (e.clientY > innerHeight - edge) scrollBy(0, 10); }, { passive: false });
  const endDrag = () => { if (!RD) return; const d = RD; RD = null; const pb = d.ph.getBoundingClientRect();
    d.r.style.transition = 'top .16s ease, box-shadow .16s'; d.r.style.top = pb.top + 'px'; d.r.classList.remove('drag');
    setTimeout(() => { d.ph.replaceWith(d.r); d.r.removeAttribute('style'); document.body.classList.remove('hdragging');
      const all = [...d.list.querySelectorAll(':scope > .hr')]; saveOrder(all.filter(x => x.dataset.pin === '1').map(x => x.dataset.id)).then(() => saveOrder(all.filter(x => x.dataset.pin !== '1').map(x => x.dataset.id))); }, 170); };
  document.addEventListener('pointerup', endDrag); document.addEventListener('pointercancel', endDrag);
  function draw() {
    const m = me(), groups = {}, admin = isAdmin();
    (admin ? chars : chars.filter(c => isMine(c.player))).forEach(c => { const k = (c.player || '').trim() || 'No player yet'; (groups[k] = groups[k] || []).push(c); });
    const keys = Object.keys(groups).sort((a, b) => (isMine(b) - isMine(a)) || (a === 'No player yet') - (b === 'No player yet') || a.localeCompare(b));
    root.innerHTML = `<header class="hub-top"><div><div class="hub-kicker">D&amp;D Character Sheets</div><h1>${admin ? esc(group.name || 'The Party') : (m ? esc(m.name) + '’s characters' : esc(group.name || 'The Party'))}</h1></div>
      <div class="hub-me">${m ? `Signed in as <b>${esc(m.name)}</b> <button class="linkbtn" id="me-chg">change</button>` : '<button class="linkbtn" id="me-chg">Who are you?</button>'}</div></header>
      <div class="hub-bar"><button class="btn gold big" id="hub-new">＋ Create character</button><span class="hub-hint">${admin ? `${chars.length} character${chars.length === 1 ? '' : 's'} · ${keys.length} player${keys.length === 1 ? '' : 's'}` : 'Your characters'}</span></div>
      ${keys.length ? keys.map(k => { const mine = isMine(k), isOpen = !admin || (open[k] != null ? open[k] : true); return `<details class="hub-folder${mine ? ' mine' : ''}${admin ? '' : ' solo'}" data-k="${esc(k)}" ${isOpen ? 'open' : ''}><summary${admin ? '' : ' hidden'}><span class="hf-caret">▸</span><span class="hf-name">${esc(k)}</span>${mine ? '<span class="hf-you">You</span>' : ''}<span class="hf-n">${groups[k].length}</span></summary>
        <div class="${admin ? 'hf-body' : 'hl'}">${groups[k].sort(ord).map(admin ? card : row).join('')}</div></details>`; }).join('') : `<p class="hub-empty">${m ? (admin ? 'No characters yet — create the first one.' : 'You don’t have any characters here yet — create one, or if you already have one, ask your DM to put it under <b>' + esc(m.name) + '</b>.') : 'Pick who you are to see your characters.'}</p>`}
      <footer class="hub-foot">${admin ? 'Bookmark this page — it\'s your party\'s hub. Anyone with this link can open the characters in it, so only share it with your group.' : 'Bookmark this page to get back to your characters on this device.'}</footer>`;
    root.querySelector('#hub-new').onclick = createChar;
    root.querySelectorAll('[data-pin-id]').forEach(b => b.onclick = e => { e.preventDefault(); togglePin(b.dataset.pinId); });
    root.querySelector('#me-chg').onclick = () => askWho(true);
    root.querySelectorAll('details.hub-folder').forEach(d => d.addEventListener('toggle', () => { open[d.dataset.k] = d.open; ls.set(OPEN, JSON.stringify(open)); }));
    root.querySelectorAll('.hc-dots').forEach(b => b.onclick = e => { e.stopPropagation(); const w = b.parentElement, on = !w.classList.contains('on'); root.querySelectorAll('.hc-menu.on').forEach(x => x.classList.remove('on')); w.classList.toggle('on', on); });
    root.querySelectorAll('.hc-list [data-a]').forEach(b => b.onclick = () => { const c = chars.find(x => x.id === b.dataset.id); b.closest('.hc-menu').classList.remove('on'); if (!c) return;
      if (b.dataset.a === 'copy') { navigator.clipboard.writeText(location.origin + base + '?c=' + c.id).then(() => toast('Link copied.'), () => prompt('Copy this link:', location.origin + base + '?c=' + c.id)); }
      if (b.dataset.a === 'move') moveChar(c); if (b.dataset.a === 'rm') removeChar(c); });
    const h1 = root.querySelector('h1'); if (admin) h1.title = 'Click to rename'; if (admin) h1.onclick = async () => { const n = prompt('Party name', group.name || 'The Party'); if (n != null && n.trim()) { await gDoc.set({ name: n.trim().slice(0, 60) }, { merge: true }); } };
  }
  document.addEventListener('click', () => root.querySelectorAll('.hc-menu.on').forEach(x => x.classList.remove('on')));
  draw();
  gDoc.onSnapshot(s => { group = (s.exists && s.data()) || {}; draw(); }, () => {});
  charsCol.onSnapshot(qs => { chars = qs.docs.map(d => Object.assign({ id: d.id }, d.data())); if (!RD) draw(); if (!me()) askWho(); },
    e => { root.innerHTML = '<p class="hub-empty">Couldn\'t load the party list. Check your connection, or ask your DM for the party link again.</p>'; console.error(e); });
  setInterval(() => { if (!RD) draw(); }, 60000);
}
