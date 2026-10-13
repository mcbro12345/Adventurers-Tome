// GitHub Pages loader. Modes (from the address):
//   ?c=<id>                 a character, loaded from Firestore and kept in sync
//   ?g=<group>              the party hub
//   ?new=1[&g=..&p=..&o=..] a brand-new character (gets its own ?c= link once created)
//   (nothing)               this device's hub if it has one, otherwise a new character
// Everyone signs in once per device (Google, or a link emailed to them). Each character belongs to one email;
// the database only lets that player — and the DM — open or change it.
const ADMIN_EMAIL = 'matthewcbro@gmail.com';
(async () => {
  const CFG = __CFG__, VER = '__VER__';
  const Q = new URLSearchParams(location.search), clean = v => (v || '').replace(/[^A-Za-z0-9_-]/g, '');
  let C = clean(Q.get('c')), G = clean(Q.get('g'));
  const P = (Q.get('p') || '').slice(0, 60), O = (Q.get('o') || '').trim().toLowerCase().slice(0, 120);
  const LAST_G = 'dnd-hub-group';
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const load = document.getElementById('pg-load'), data = document.getElementById('sheet-data');
  const say = html => { if (load) load.innerHTML = `<div class="pg-msg">${html}</div>`; };
  let fs = null, auth = null;
  try { firebase.initializeApp(CFG); fs = firebase.firestore(); auth = firebase.auth(); } catch (e) { console.error(e); }
  if (!fs || !auth) { say('Couldn\'t start the sheet. Check your connection and reload.'); return; }

  // Finishing an emailed sign-in link.
  if (auth.isSignInWithEmailLink(location.href)) {
    let em = lsGet('dnd-signin-email');
    if (!em) em = prompt('To finish signing in, type the email address the link was sent to:');
    try { await auth.signInWithEmailLink((em || '').trim(), location.href); location.replace(lsGet('dnd-signin-back') || location.pathname); }
    catch (e) { say(`That sign-in link didn't work (${(e && e.message) || 'expired or already used'}).<br><br><a href="${location.pathname}">Try again</a>`); }
    return;
  }
  if (!C && !G && !Q.get('new') && lsGet(LAST_G)) { location.replace(location.pathname + '?g=' + lsGet(LAST_G)); return; }
  const user = await new Promise(res => { const u = auth.onAuthStateChanged(x => { u(); res(x); }); });
  if (!user) { signIn(auth, say); return; }
  const EMAIL = (user.email || '').toLowerCase(), IS_ADMIN = EMAIL === ADMIN_EMAIL;
  const signOut = () => auth.signOut().then(() => location.reload());
  window.pgSignOut = signOut;
  // The player's name comes from the party's player list (the DM keeps it); otherwise their Google name.
  let NAME = user.displayName || EMAIL.split('@')[0];
  const nameFrom = g => { try { const p = (g && g.players) || {}; if (p[EMAIL]) NAME = p[EMAIL]; } catch (e) {} };

  // A newer version of the site was pushed: offer a reload (anything open is saved first).
  const verCheck = () => { const check = async () => { try { const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' }); const v = (await r.json()).v; if (v && v !== VER && !document.getElementById('pg-upd')) { const b = document.createElement('button'); b.id = 'pg-upd'; b.textContent = 'Updated — tap to reload'; b.onclick = () => { b.textContent = 'Saving…'; setTimeout(() => location.reload(), 1200); }; document.body.appendChild(b); } } catch (e) {} };
    setInterval(check, 2 * 60 * 1000); document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); }); setTimeout(check, 5000); };
  if (G && !C && !Q.get('new')) { lsSet(LAST_G, G); if (load) load.remove(); hub(fs, auth, G, { EMAIL, IS_ADMIN, user, signOut }); verCheck(); return; }

  const rid = () => { const a = new Uint8Array(18); crypto.getRandomValues(a); return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const NEW = !C;
  if (NEW) C = rid();
  window.SHEET_PAGES = true; window.SHEET_CHAR = C;
  const run = () => { if (load) load.remove(); const s = document.createElement('script'); s.textContent = document.getElementById('app-src').textContent; document.body.appendChild(s); };
  const col = fs.collection('sheets'), CACHE = 'dnd-pages-cache:' + C;
  let txt = null, missing = false, denied = false, OWNER = NEW ? ((IS_ADMIN && O) || EMAIL) : '';
  if (!NEW) try {
    const sn = await col.doc(C).get();
    if (!sn.exists || !sn.data().data) missing = true;
    else {
      const d = sn.data(); let str = d.data || ''; const n = Number(d.n) || 1;
      if (d.g && !G) G = clean(d.g); OWNER = (d.owner || '').toLowerCase();
      for (let k = 1; k < n; k++) { const p = await col.doc(C + '_p' + k).get(); const pd = p.exists ? p.data() : null; if (!pd || Number(pd.savedAt) !== Number(d.savedAt)) { str = null; break; } str += pd.data || ''; }
      if (str) { JSON.parse(str); txt = str; lsSet(CACHE, str); }
    }
  } catch (e) { if (e && e.code === 'permission-denied') denied = true; else console.warn('Offline — using this browser\'s copy', e); }
  const who = `<small style="font-weight:400">Signed in as ${EMAIL} · <a href="#" onclick="pgSignOut();return false">Sign out</a></small>`;
  if (denied) { say(`This character belongs to another player, so it can't be opened with your account.<br><br>${who}`); return; }
  if (!txt && !NEW) txt = lsGet(CACHE);
  if (!txt && !NEW) { say((missing ? 'This sheet link doesn\'t point to a character.<br><br><small style="font-weight:400">Check the link, or open it from your party page.</small>' : 'Couldn\'t reach the sheet\'s storage.<br><br><small style="font-weight:400">Check your connection and reload.</small>') + '<br><br>' + who); return; }
  if (txt) data.textContent = txt;
  if (G) lsSet(LAST_G, G);
  const hubCol = G ? fs.collection('groups/' + G + '/chars') : null;
  if (G) { try { const g = await fs.collection('groups').doc(G).get(); nameFrom(g.exists && g.data()); } catch (e) {} }
  // Older copies didn't record an owner: take it from the party list.
  if (!OWNER && hubCol) { try { const h = await hubCol.doc(C).get(); OWNER = ((h.exists && h.data().owner) || '').toLowerCase(); } catch (e) {} }
  if (!OWNER) OWNER = EMAIL;

  // Keep this character's card in the party hub up to date (name, class, level, portrait, who edited it last).
  let thumbKey = '', thumbVal = '', hubT = null;
  const thumb = src => new Promise(res => { if (!src) return res(''); const k = src.length + ':' + src.slice(-64); if (k === thumbKey) return res(thumbVal);
    const im = new Image(); im.onload = () => { try { const c = document.createElement('canvas'), n = 112, s = Math.min(im.width, im.height); c.width = c.height = n; c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2 * 0.6, s, s, 0, 0, n, n); thumbKey = k; thumbVal = c.toDataURL('image/jpeg', 0.8); res(thumbVal); } catch (e) { res(''); } }; im.onerror = () => res(''); im.src = src; });
  const hubUpdate = async () => { if (!hubCol || !window.sheetSummary) return; const st = window.sheetState && window.sheetState(); if (!st || !st.created) return;
    const s = window.sheetSummary();
    try { await hubCol.doc(C).set({ owner: OWNER, name: s.name, player: s.player, race: s.race, cls: s.cls, level: s.level, hp: s.hp, thumb: await thumb(s.portrait), updatedAt: Date.now(), by: NAME }, { merge: true }); } catch (e) { console.warn('hub', e); } };
  const hubSoon = () => { clearTimeout(hubT); hubT = setTimeout(hubUpdate, 4000); };

  // The sheet's sync code talks to "db" like it does on claude.ai; here that's this character's Firestore documents.
  const docFor = p => { const m = /^sheets\/(main|part(\d+))$/.exec(p); return m ? [col.doc(m[2] ? C + '_p' + m[2] : C), !m[2]] : null; };
  const none = { get: async () => ({ exists: false, data: () => null }), set: async () => { throw { code: 'unsupported' }; }, delete: async () => {}, onSnapshot: () => () => {} };
  const db = { doc: p => { const x = docFor(p); if (!x) return none; const [r, main] = x;
    return { get: () => r.get(), set: v => { v = Object.assign({}, v, { owner: OWNER }, main && G ? { g: G } : {}); const w = r.set(v); if (main) w.then(hubSoon, () => {}); return w; }, delete: () => r.delete(),
      onSnapshot: (cb, err) => r.onSnapshot(s => { const d = s.exists && s.data(); if (d && d.owner) OWNER = String(d.owner).toLowerCase(); cb(s); }, err) }; } };
  const cuser = { id: async () => null, isOwner: async () => true, can: async () => true };
  window.claude = { use: async n => n === 'db' ? db : n === 'user' ? cuser : null };
  run();
  if (NEW && P) { try { const st = window.sheetState(); if (st && !st.player) st.player = P; } catch (e) {} }
  // Moved to another player's folder from the hub: the sheet's Player field follows.
  if (!NEW && hubCol) setTimeout(async () => { try { const h = await hubCol.doc(C).get(); const hd = h.exists ? h.data() : null; const st = window.sheetState && window.sheetState();
    if (hd && hd.playerSet && st && st.created && (hd.player || '') !== (st.player || '') && Number(hd.playerSet) > Number(st.savedAt || 0) - 1) window.sheetSet('player', hd.player || ''); } catch (e) {} hubUpdate(); }, 2500);
  // New character: once it's created (and saved to the cloud), its link goes in the address bar.
  if (NEW) { const t = setInterval(() => { let made = false; try { const st = window.sheetState && window.sheetState(); made = !!(st && st.created); } catch (e) {} if (!made) return; clearInterval(t);
    history.replaceState(null, '', location.pathname + '?c=' + C);
    setTimeout(() => window.sheetToast(`<div><b>Your character is saved</b><div class="det">${G ? 'It\'s on your party page. ' : ''}Open it on any device you're signed in on — it stays in sync. Only you${IS_ADMIN && OWNER !== EMAIL ? ' (' + OWNER + ')' : ''} and your DM can open it.</div></div>`, '', 12000), 600);
    hubSoon();
  }, 500); }
  // Back to the hub (desktop and phone).
  if (G) { const a = document.createElement('a'); a.href = location.pathname + '?g=' + G; a.className = 'pg-hublink'; a.title = 'All characters'; a.textContent = '⌂ Party'; document.body.appendChild(a); }
  verCheck();
})();

// ================= Sign in (once per device) =================
function signIn(auth, say) {
  say(`<div class="pg-signin"><div class="hub-kicker">D&amp;D Character Sheets</div><h2>Sign in</h2>
    <p>Sign in once on this device to open your characters. Only you and your DM can see or change them.</p>
    <button class="btn gold big" id="si-g"><svg viewBox="0 0 48 48" width="18" height="18" style="vertical-align:-3px;margin-right:8px"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>Sign in with Google</button>
    <div class="pg-or">or</div>
    <form id="si-f" class="who-f"><input id="si-e" type="email" placeholder="Your email address" autocomplete="email" required><button class="btn">Email me a link</button></form>
    <p class="hub-hint" id="si-msg">No Google account? Use the email your DM has for you — you'll get a one-time sign-in link.</p></div>`);
  const msg = t => { const m = document.getElementById('si-msg'); if (m) m.innerHTML = t; };
  document.getElementById('si-g').onclick = async () => { const pr = new firebase.auth.GoogleAuthProvider(); pr.setCustomParameters({ prompt: 'select_account' });
    try { await auth.signInWithPopup(pr); location.reload(); } catch (e) { if (e && /popup/.test(e.code || '')) { auth.signInWithRedirect(pr); return; } msg('Couldn\'t sign in: ' + ((e && e.message) || e)); } };
  document.getElementById('si-f').onsubmit = async e => { e.preventDefault(); const em = document.getElementById('si-e').value.trim().toLowerCase(); if (!em) return;
    try { await auth.sendSignInLinkToEmail(em, { url: location.origin + location.pathname, handleCodeInApp: true }); try { localStorage.setItem('dnd-signin-email', em); localStorage.setItem('dnd-signin-back', location.href); } catch (x) {}
      msg(`<b>Check your email</b> (${em}) for a sign-in link and open it on this device. If it isn't there in a minute, look in Spam.`); } catch (x) { msg('Couldn\'t send the link: ' + ((x && x.message) || x)); } };
}

// ================= The party hub =================
function hub(fs, auth, G, ctx) {
  const { EMAIL, IS_ADMIN, user, signOut } = ctx;
  const OPEN = 'dnd-hub-open:' + G, VIEW = 'dnd-hub-view';
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const ago = t => { if (!t) return ''; const s = (Date.now() - t) / 1000; return s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + 'm ago' : s < 86400 ? Math.floor(s / 3600) + 'h ago' : Math.floor(s / 86400) + 'd ago'; };
  const base = location.pathname;
  document.title = 'Party — D&D Character Sheets';
  document.body.innerHTML = '<div id="hub"></div><div id="hub-modal" class="hub-modal"></div><div id="hub-toast" class="hub-toast"></div>';
  document.body.className = 'hubbody';
  const root = document.getElementById('hub'), modal = document.getElementById('hub-modal');
  let chars = [], group = { name: '', players: {} }, open = {}, view = IS_ADMIN ? (ls.get(VIEW) || 'all') : 'mine';
  try { open = JSON.parse(ls.get(OPEN) || '{}'); } catch (e) {}
  const toast = t => { const el = document.getElementById('hub-toast'); el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2600); };
  const pmap = () => (group && group.players) || {};
  const myName = () => pmap()[EMAIL] || user.displayName || EMAIL.split('@')[0];
  const nameOf = em => pmap()[em] || em;
  const isMine = c => (c.owner || '') === EMAIL;
  const admin = () => IS_ADMIN && view === 'all';
  const charsCol = fs.collection('groups/' + G + '/chars'), gDoc = fs.collection('groups').doc(G), sheets = fs.collection('sheets');
  const FV = firebase.firestore.FieldValue, FP = firebase.firestore.FieldPath;
  const close = () => modal.classList.remove('on');
  const playerOptions = sel => Object.entries(pmap()).sort((a, b) => a[1].localeCompare(b[1])).map(([em, n]) => `<option value="${esc(em)}"${em === sel ? ' selected' : ''}>${esc(n)} — ${esc(em)}</option>`).join('');

  function createChar() {
    if (!IS_ADMIN) { location.href = base + '?new=1&g=' + G + '&p=' + encodeURIComponent(myName()); return; }
    modal.innerHTML = `<div class="hub-card"><h2>New character</h2><p class="hub-hint">Whose character is it? Only that player (and you) will be able to open it.</p>
      <form id="new-f" class="who-f"><select id="new-o">${playerOptions(EMAIL)}</select><button class="btn gold">Create</button></form><button class="btn ghost" id="new-x">Cancel</button></div>`;
    modal.classList.add('on');
    modal.querySelector('#new-f').onsubmit = e => { e.preventDefault(); const o = modal.querySelector('#new-o').value; location.href = base + '?new=1&g=' + G + '&o=' + encodeURIComponent(o) + '&p=' + encodeURIComponent(nameOf(o)); };
    modal.querySelector('#new-x').onclick = close;
  }
  function moveChar(c) {
    modal.innerHTML = `<div class="hub-card"><h2>Move ${esc(c.name || 'character')}</h2><p class="hub-hint">Give it to another player. They'll be able to open it; the current player won't anymore.</p>
      <form id="mv-f" class="who-f"><select id="mv-o">${playerOptions(c.owner)}</select><button class="btn gold">Move</button></form><button class="btn ghost" id="mv-x">Cancel</button></div>`;
    modal.classList.add('on');
    modal.querySelector('#mv-f').onsubmit = async e => { e.preventDefault(); const o = modal.querySelector('#mv-o').value; close();
      try { const s = await sheets.doc(c.id).get(); const n = Number(s.exists && s.data().n) || 1; await sheets.doc(c.id).update({ owner: o }); for (let k = 1; k < n; k++) await sheets.doc(c.id + '_p' + k).update({ owner: o }).catch(() => {});
        await charsCol.doc(c.id).set({ owner: o, player: nameOf(o), playerSet: Date.now() }, { merge: true }); toast('Moved to ' + nameOf(o) + '.'); } catch (x) { toast('Couldn\'t move it: ' + (x.message || x)); } };
    modal.querySelector('#mv-x').onclick = close;
  }
  function removeChar(c) {
    modal.innerHTML = `<div class="hub-card"><h2>Remove ${esc(c.name || 'this character')} from the list?</h2><p class="hub-hint">The character itself isn't deleted — opening its link puts it back here.</p>
      <div class="row"><button class="btn ghost" id="rm-x">Cancel</button><button class="btn red" id="rm-ok">Remove from list</button></div></div>`;
    modal.classList.add('on');
    modal.querySelector('#rm-ok').onclick = async () => { close(); await charsCol.doc(c.id).delete(); toast('Removed from the list.'); };
    modal.querySelector('#rm-x').onclick = close;
  }
  function playersPanel() {
    const rows = Object.entries(pmap()).sort((a, b) => a[1].localeCompare(b[1]));
    modal.innerHTML = `<div class="hub-card wide"><h2>Players</h2><p class="hub-hint">Each player signs in with this email (Google, or an emailed link). Their characters are locked to it.</p>
      <div class="pl-list">${rows.map(([em, n]) => `<div class="pl-row"><b>${esc(n)}</b><span>${esc(em)}</span><button class="linkbtn" data-rm="${esc(em)}">remove</button></div>`).join('') || '<p class="hub-hint">No players yet.</p>'}</div>
      <form id="pl-f" class="who-f pl-f"><input id="pl-n" placeholder="Name" maxlength="40" required><input id="pl-e" type="email" placeholder="Email" required><button class="btn gold">Add</button></form>
      <button class="btn ghost" id="pl-x">Done</button></div>`;
    modal.classList.add('on');
    modal.querySelector('#pl-f').onsubmit = async e => { e.preventDefault(); const n = modal.querySelector('#pl-n').value.trim(), em = modal.querySelector('#pl-e').value.trim().toLowerCase(); if (!n || !em) return;
      await gDoc.set({ players: { [em]: n } }, { merge: true }); toast('Added ' + n + '.'); playersPanel(); };
    modal.querySelectorAll('[data-rm]').forEach(b => b.onclick = async () => { await gDoc.update(new FP('players', b.dataset.rm), FV.delete()); playersPanel(); });
    modal.querySelector('#pl-x').onclick = close;
  }
  function card(c) {
    return `<div class="hc${c.pin ? ' pinned' : ''}"><a class="hc-main" href="${esc(base + '?c=' + c.id)}">${c.thumb ? `<img class="hc-pic" src="${esc(c.thumb)}" alt="">` : `<span class="hc-pic hc-nopic">${esc((c.name || '?')[0])}</span>`}
      <span class="hc-txt"><b>${esc(c.name || 'Unnamed character')}</b><span>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}</span>
      <small>${c.hp ? 'HP ' + esc(c.hp) + ' · ' : ''}${c.updatedAt ? 'Updated ' + ago(c.updatedAt) + (c.by ? ' by ' + esc(c.by) : '') : ''}</small></span></a>
      <div class="hc-menu"><button class="hc-dots" aria-label="More">⋯</button><div class="hc-list">
        <button data-a="move" data-id="${esc(c.id)}">Give to another player</button><button data-a="rm" data-id="${esc(c.id)}">Remove from list</button></div></div></div>`;
  }
  // Pinned first; then each player's own order (drag to change), then most recently updated.
  const ord = (a, b) => (!!b.pin - !!a.pin) || ((a.order != null ? a.order : 1e9) - (b.order != null ? b.order : 1e9)) || ((b.updatedAt || 0) - (a.updatedAt || 0));
  function row(c) {
    return `<div class="hr${c.pin ? ' pinned' : ''}" data-id="${esc(c.id)}" data-pin="${c.pin ? 1 : 0}"><span class="hr-grip" title="Drag to reorder" aria-label="Drag to reorder">⠿</span>
      <a class="hr-main" href="${esc(base + '?c=' + c.id)}">${c.thumb ? `<img class="hc-pic" src="${esc(c.thumb)}" alt="">` : `<span class="hc-pic hc-nopic">${esc((c.name || '?')[0])}</span>`}
      <span class="hc-txt"><b>${esc(c.name || 'Unnamed character')}</b><span>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}</span>
      <small>${c.hp ? 'HP ' + esc(c.hp) + ' · ' : ''}${c.updatedAt ? 'Updated ' + ago(c.updatedAt) + (c.by ? ' by ' + esc(c.by) : '') : ''}</small></span></a>
      <button class="hr-pin${c.pin ? ' on' : ''}" data-pin-id="${esc(c.id)}" title="${c.pin ? 'Unpin' : 'Pin to the top'}" aria-pressed="${!!c.pin}"><svg viewBox="0 0 24 24" width="18" height="18" fill="${c.pin ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 3h6l-1 6 4 4H6l4-4z"/><path d="M12 13v8"/></svg></button></div>`;
  }
  async function saveOrder(ids) { await Promise.all(ids.map((id, i) => { const c = chars.find(x => x.id === id); if (c && c.order === i) return null; if (c) c.order = i; return charsCol.doc(id).set({ order: i }, { merge: true }); })); }
  async function togglePin(id) { const c = chars.find(x => x.id === id); if (!c) return; const mine = chars.filter(isMine);
    const pin = !c.pin, same = mine.filter(x => !!x.pin === pin && x.id !== id).map(x => x.order != null ? x.order : 0);
    const order = pin ? (same.length ? Math.max(...same) + 1 : 0) : (same.length ? Math.min(...same) - 1 : 0);
    c.pin = pin; c.order = order; draw(); await charsCol.doc(id).set({ pin, order }, { merge: true }); toast(pin ? 'Pinned to the top.' : 'Unpinned.'); }
  // Drag a row by its grip (mouse or touch): it lifts and follows the pointer, a gap shows where it lands, the rest slide.
  // Pinned rows only move among pinned rows, the rest among the rest.
  let RD = null;
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
    const A = admin(), list = A ? chars : chars.filter(isMine), groups = {};
    list.forEach(c => { const k = (c.player || '').trim() || nameOf(c.owner || '') || 'No player yet'; (groups[k] = groups[k] || []).push(c); });
    const mineKey = k => groups[k].some(isMine);
    const keys = Object.keys(groups).sort((a, b) => (mineKey(b) - mineKey(a)) || a.localeCompare(b));
    root.innerHTML = `<header class="hub-top"><div><div class="hub-kicker">D&amp;D Character Sheets</div><h1>${A ? esc(group.name || 'The Party') : esc(myName()) + '’s characters'}</h1></div>
      <div class="hub-me">Signed in as <b>${esc(myName())}</b> <span class="hub-em">${esc(EMAIL)}</span> · <button class="linkbtn" id="me-out">Sign out</button></div></header>
      ${IS_ADMIN ? `<div class="hub-views"><button class="${view === 'mine' ? 'on' : ''}" data-view="mine">My characters</button><button class="${view === 'all' ? 'on' : ''}" data-view="all">Everyone</button>${A ? '<button class="linkbtn" id="hub-pl">Players…</button>' : ''}</div>` : ''}
      <div class="hub-bar"><button class="btn gold big" id="hub-new">＋ Create character</button><span class="hub-hint">${A ? `${list.length} character${list.length === 1 ? '' : 's'} · ${keys.length} player${keys.length === 1 ? '' : 's'}` : 'Your characters'}</span></div>
      ${keys.length ? keys.map(k => { const mine = mineKey(k), isOpen = !A || (open[k] != null ? open[k] : true); return `<details class="hub-folder${mine ? ' mine' : ''}${A ? '' : ' solo'}" data-k="${esc(k)}" ${isOpen ? 'open' : ''}><summary><span class="hf-caret">▸</span><span class="hf-name">${esc(k)}</span>${mine ? '<span class="hf-you">You</span>' : ''}<span class="hf-n">${groups[k].length}</span></summary>
        <div class="${A ? 'hf-body' : 'hl'}">${groups[k].sort(ord).map(A ? card : row).join('')}</div></details>`; }).join('') : `<p class="hub-empty">${A ? 'No characters yet — create the first one.' : 'You don’t have any characters yet — create one, or ask your DM to give you yours.'}</p>`}
      <footer class="hub-foot">Bookmark this page. You're signed in on this device; ${IS_ADMIN ? 'each character only opens for its player and you' : 'your characters only open for you and your DM'}.</footer>`;
    root.querySelector('#hub-new').onclick = createChar;
    root.querySelector('#me-out').onclick = signOut;
    root.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { view = b.dataset.view; ls.set(VIEW, view); draw(); });
    const pl = root.querySelector('#hub-pl'); if (pl) pl.onclick = playersPanel;
    root.querySelectorAll('[data-pin-id]').forEach(b => b.onclick = e => { e.preventDefault(); togglePin(b.dataset.pinId); });
    root.querySelectorAll('details.hub-folder').forEach(d => d.addEventListener('toggle', () => { open[d.dataset.k] = d.open; ls.set(OPEN, JSON.stringify(open)); }));
    root.querySelectorAll('.hc-dots').forEach(b => b.onclick = e => { e.stopPropagation(); const w = b.parentElement, on = !w.classList.contains('on'); root.querySelectorAll('.hc-menu.on').forEach(x => x.classList.remove('on')); w.classList.toggle('on', on); });
    root.querySelectorAll('.hc-list [data-a]').forEach(b => b.onclick = () => { const c = chars.find(x => x.id === b.dataset.id); b.closest('.hc-menu').classList.remove('on'); if (!c) return;
      if (b.dataset.a === 'move') moveChar(c); if (b.dataset.a === 'rm') removeChar(c); });
    const h1 = root.querySelector('h1'); if (A) { h1.title = 'Click to rename'; h1.onclick = async () => { const n = prompt('Party name', group.name || 'The Party'); if (n != null && n.trim()) await gDoc.set({ name: n.trim().slice(0, 60) }, { merge: true }); }; }
  }
  document.addEventListener('click', () => root.querySelectorAll('.hc-menu.on').forEach(x => x.classList.remove('on')));
  draw();
  gDoc.onSnapshot(s => { group = (s.exists && s.data()) || {}; if (!RD) draw(); }, () => {});
  (IS_ADMIN ? charsCol : charsCol.where('owner', '==', EMAIL)).onSnapshot(qs => { chars = qs.docs.map(d => Object.assign({ id: d.id }, d.data())); if (!RD) draw(); },
    e => { root.innerHTML = `<p class="hub-empty">Couldn't load the party list (${esc(e.code || e.message || e)}).<br><br>Signed in as ${esc(EMAIL)} · <button class="linkbtn" onclick="pgSignOut()">Sign out</button></p>`; console.error(e); });
  setInterval(() => { if (!RD) draw(); }, 60000);
}
