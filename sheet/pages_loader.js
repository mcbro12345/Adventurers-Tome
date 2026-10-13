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
  if (window.PG_EMU) { fs.useEmulator('localhost', 8080); auth.useEmulator('http://localhost:9099', { disableWarnings: true }); if (window.PG_EMU_USER) { await auth.signOut(); await auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(JSON.stringify(window.PG_EMU_USER))); } } // tests only

  // A sign-in link meant for Claude (so it can sync with the claude.ai copies): show it to copy instead of using it here.
  if (Q.get('handoff') && auth.isSignInWithEmailLink(location.href)) { say(`<div class="pg-signin"><h2>Copy this link to Claude</h2><p>Paste it into your chat with Claude — it lets Claude update the sheets for you. It works once and expires in about an hour.</p><textarea readonly style="width:100%;height:110px;font:12px monospace" onclick="this.select()">${location.href.replace(/[<&]/g, '')}</textarea><button class="btn gold" style="margin-top:8px" onclick="navigator.clipboard.writeText(location.href).then(()=>this.textContent='Copied')">Copy</button></div>`); return; }
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
  const EMAIL = (user.email || '').toLowerCase(), IS_OWNER = EMAIL === ADMIN_EMAIL;
  let IS_ADMIN = IS_OWNER, ADMINS = [];
  try { const a = await fs.collection('config').doc('admins').get(); ADMINS = ((a.exists && a.data().emails) || []).map(x => String(x).toLowerCase()); if (ADMINS.includes(EMAIL)) IS_ADMIN = true; } catch (e) {}
  const signOut = () => auth.signOut().then(() => location.reload());
  window.pgSignOut = signOut;
  // The player's name comes from the party's player list (the DM keeps it); otherwise their Google name.
  let NAME = user.displayName || EMAIL.split('@')[0];
  let PLAYERS = {};
  const nameFrom = g => { try { const p = (g && g.players) || {}; PLAYERS = p; if (p[EMAIL]) NAME = p[EMAIL]; } catch (e) {} };

  // A newer version of the site was pushed: load it. The party page reloads right away; a sheet reloads as soon as
  // nobody is in the middle of using it (or on a tap), after its last change has saved. The new address carries
  // the version so the browser can't hand back its old cached copy.
  const verCheck = () => { let NEWV = null, idleT = null;
    const go = () => { const u = new URL(location.href); u.searchParams.set('v', NEWV); setTimeout(() => location.replace(u.toString()), 1200); };
    const busy = () => { const a = document.activeElement; return !!(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) || !!document.querySelector('#modal.open, .hub-modal.on'); };
    const idle = () => { clearTimeout(idleT); idleT = setTimeout(() => { if (NEWV && (document.hidden || !busy())) go(); else idle(); }, 15000); };
    const check = async () => { if (NEWV) return; try { const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' }); const v = (await r.json()).v; if (!v || v === VER || Q.get('v') === v) return; NEWV = v;
      if (!C && !Q.get('new') && !busy()) return go();
      const b = document.createElement('button'); b.id = 'pg-upd'; b.textContent = 'Updated — tap to reload'; b.onclick = () => { b.textContent = 'Saving…'; go(); }; document.body.appendChild(b);
      ['pointerdown', 'keydown', 'scroll'].forEach(ev => addEventListener(ev, idle, { passive: true })); idle(); } catch (e) {} };
    setInterval(check, 30 * 1000); document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); else if (NEWV) go(); }); setTimeout(check, 3000); };
  if (G && !C && !Q.get('new')) { lsSet(LAST_G, G); if (load) load.remove(); hub(fs, auth, G, { EMAIL, IS_ADMIN, IS_OWNER, ADMINS, user, signOut }); verCheck(); return; }

  const rid = () => { const a = new Uint8Array(18); crypto.getRandomValues(a); return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const NEW = !C;
  if (NEW) C = rid();
  window.SHEET_PAGES = true; window.SHEET_CHAR = C;
  const run = () => { if (load) load.remove(); const s = document.createElement('script'); s.textContent = document.getElementById('app-src').textContent; document.body.appendChild(s); };
  const col = fs.collection('sheets'), CACHE = 'dnd-pages-cache:' + C;
  let txt = null, missing = false, denied = false, OWNER = NEW ? ((IS_ADMIN && O) || EMAIL) : '', VIEWERS = [], EDITORS = [];
  if (!NEW) try {
    const sn = await col.doc(C).get();
    if (!sn.exists || !sn.data().data) missing = true;
    else {
      const d = sn.data(); let str = d.data || ''; const n = Number(d.n) || 1;
      if (d.g && !G) G = clean(d.g); OWNER = (d.owner || '').toLowerCase(); VIEWERS = d.viewers || []; EDITORS = d.editors || [];
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
  // What this person may do here: their own (or the DM) edits; someone it's shared with can edit or only look.
  const role = () => (IS_ADMIN || OWNER === EMAIL) ? 'owner' : EDITORS.includes(EMAIL) ? 'edit' : 'view';

  // Keep this character's card in the party hub up to date (name, class, level, portrait, who edited it last).
  let thumbKey = '', thumbVal = '', hubT = null;
  const thumb = src => new Promise(res => { if (!src) return res(''); const k = src.length + ':' + src.slice(-64); if (k === thumbKey) return res(thumbVal);
    const im = new Image(); im.onload = () => { try { const c = document.createElement('canvas'), n = 112, s = Math.min(im.width, im.height); c.width = c.height = n; c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2 * 0.6, s, s, 0, 0, n, n); thumbKey = k; thumbVal = c.toDataURL('image/jpeg', 0.8); res(thumbVal); } catch (e) { res(''); } }; im.onerror = () => res(''); im.src = src; });
  // "Updated … by …" on the party page only moves when the character's information really changed — not when it's
  // opened, viewed, or its layout, theme or settings were adjusted.
  const NOT_INFO = ['savedAt', 'layout', 'settings', 'theme', 'spellFilter', 'sources', 'dataRev', 'fixesDone', 'player'];
  const digest = st => { try { const o = Object.assign({}, st); NOT_INFO.forEach(k => delete o[k]); const s = JSON.stringify(o); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return s.length + ':' + h; } catch (e) { return ''; } };
  let LASTD = null, hubChanged = false, WROTE = 0;
  const hubUpdate = async changed => { if (!hubCol || !window.sheetSummary || role() === 'view') return; const st = window.sheetState && window.sheetState(); if (!st || !st.created) return;
    const s = window.sheetSummary();
    const when = changed ? { updatedAt: Date.now(), by: NAME } : {};
    try { await hubCol.doc(C).set(Object.assign({ owner: OWNER, name: s.name, player: s.player, race: s.race, cls: s.cls, level: s.level, hp: s.hp, thumb: await thumb(s.portrait) }, when), { merge: true }); } catch (e) { console.warn('hub', e); } };
  const hubSoon = () => { try { const d = digest(window.sheetState()); if (LASTD !== null && d !== LASTD) hubChanged = true; LASTD = d; } catch (e) {}
    clearTimeout(hubT); hubT = setTimeout(() => { const c = hubChanged; hubChanged = false; hubUpdate(c); }, 1200); };

  // The sheet's sync code talks to "db" like it does on claude.ai; here that's this character's Firestore documents.
  const docFor = p => { const m = /^sheets\/(main|part(\d+))$/.exec(p); return m ? [col.doc(m[2] ? C + '_p' + m[2] : C), !m[2]] : null; };
  const none = { get: async () => ({ exists: false, data: () => null }), set: async () => { throw { code: 'unsupported' }; }, delete: async () => {}, onSnapshot: () => () => {} };
  const db = { doc: p => { const x = docFor(p); if (!x) return none; const [r, main] = x;
    return { get: () => r.get(), set: v => { if (role() === 'view') return Promise.reject({ code: 'permission-denied' }); v = Object.assign({}, v, { owner: OWNER, viewers: VIEWERS, editors: EDITORS }, main && G ? { g: G } : {}); if (main) WROTE = Number(v.savedAt); const w = r.set(v); if (main) w.then(hubSoon, () => {}); return w; }, delete: () => r.delete(),
      onSnapshot: (cb, err) => r.onSnapshot(s => { const d = s.exists && s.data(); if (d && d.owner) OWNER = String(d.owner).toLowerCase(); if (d) { VIEWERS = d.viewers || []; EDITORS = d.editors || []; } cb(s);
        // Someone else's change arriving here isn't this person's edit: take it as the new starting point.
        if (main && d && Number(d.savedAt) !== WROTE) setTimeout(() => { try { if (LASTD !== null) LASTD = digest(window.sheetState()); } catch (e) {} }, 800); }, err) }; } };
  const cuser = { id: async () => null, isOwner: async () => true, can: async () => role() !== 'view' };
  window.claude = { use: async n => n === 'db' ? db : n === 'user' ? cuser : null };
  run();
  // The Player field isn't typed in on the site: it's the owner's name from the player list.
  const playerName = () => PLAYERS[OWNER] || P || '';
  const syncPlayer = () => { try { const st = window.sheetState && window.sheetState(), want = playerName(); if (st && st.created && want && st.player !== want && role() !== 'view') window.sheetSet('player', want); } catch (e) {} };
  if (NEW && P) { try { const st = window.sheetState(); if (st && !st.player) st.player = P; } catch (e) {} }
  try { const st0 = window.sheetState(); if (st0 && st0.created) LASTD = digest(st0); } catch (e) {}
  if (!NEW && hubCol) setTimeout(() => { syncPlayer(); hubUpdate(false); }, 2500);
  // New character: once it's created (and saved to the cloud), its link goes in the address bar.
  if (NEW) { const t = setInterval(() => { let made = false; try { const st = window.sheetState && window.sheetState(); made = !!(st && st.created); } catch (e) {} if (!made) return; clearInterval(t);
    history.replaceState(null, '', location.pathname + '?c=' + C); syncPlayer();
    setTimeout(() => window.sheetToast(`<div><b>Your character is saved</b><div class="det">${G ? 'It\'s on your party page. ' : ''}Open it on any device you're signed in on — it stays in sync. ${IS_ADMIN && OWNER !== EMAIL ? 'It belongs to ' + OWNER + '.' : 'Only you and the people you share it with can open it.'}</div></div>`, '', 12000), 600);
    hubChanged = true; hubSoon();
  }, 500); }
  // Back to the hub (desktop and phone).
  if (G) { const a = document.createElement('a'); a.href = location.pathname + '?g=' + G; a.className = 'pg-hublink'; a.title = 'All characters'; a.textContent = '⌂ Characters'; document.body.appendChild(a); }
  if (role() !== 'owner') { const t = document.createElement('div'); t.className = 'pg-shared' + (role() === 'view' ? ' view' : ''); t.textContent = role() === 'view' ? 'View only' : 'Shared with you · can edit'; document.body.appendChild(t); }
  verCheck();
})();

// ================= Sign in (once per device) =================
function signIn(auth, say) {
  say(`<div class="pg-signin"><div class="hub-kicker">D&amp;D Character Sheets</div><h2>Sign in</h2>
    <p>Sign in once on this device to open your characters. Only you and the people you share them with can see or change them.</p>
    <button class="btn gold big" id="si-g"><svg viewBox="0 0 48 48" width="18" height="18" style="vertical-align:-3px;margin-right:8px"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>Sign in with Google</button>
    <div class="pg-or">or</div>
    <form id="si-f" class="who-f"><input id="si-e" type="email" placeholder="Your email address" autocomplete="email" required><button class="btn">Email me a link</button></form>
    <p class="hub-hint" id="si-msg">No Google account? Type your email — you'll get a one-time sign-in link.</p></div>`);
  const msg = t => { const m = document.getElementById('si-msg'); if (m) m.innerHTML = t; };
  document.getElementById('si-g').onclick = async () => { const pr = new firebase.auth.GoogleAuthProvider(); pr.setCustomParameters({ prompt: 'select_account' });
    try { await auth.signInWithPopup(pr); location.reload(); } catch (e) { if (e && /popup/.test(e.code || '')) { auth.signInWithRedirect(pr); return; } msg('Couldn\'t sign in: ' + ((e && e.message) || e)); } };
  document.getElementById('si-f').onsubmit = async e => { e.preventDefault(); const em = document.getElementById('si-e').value.trim().toLowerCase(); if (!em) return;
    try { await auth.sendSignInLinkToEmail(em, { url: location.origin + location.pathname, handleCodeInApp: true }); try { localStorage.setItem('dnd-signin-email', em); localStorage.setItem('dnd-signin-back', location.href); } catch (x) {}
      msg(`<b>Check your email</b> (${em}) for a sign-in link and open it on this device. If it isn't there in a minute, look in Spam.`); } catch (x) { msg('Couldn\'t send the link: ' + ((x && x.message) || x)); } };
}

// ================= The party hub =================
function hub(fs, auth, G, ctx) {
  const { EMAIL, IS_ADMIN, IS_OWNER, user, signOut } = ctx; let ADMINS = ctx.ADMINS || [];
  const OPEN = 'dnd-hub-open:' + G, VIEW = 'dnd-hub-view';
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const ago = t => { if (!t) return ''; const s = (Date.now() - t) / 1000; return s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + 'm ago' : s < 86400 ? Math.floor(s / 3600) + 'h ago' : Math.floor(s / 86400) + 'd ago'; };
  const base = location.pathname;
  document.title = 'Party — D&D Character Sheets';
  document.body.innerHTML = '<div id="hub"></div><div id="hub-modal" class="hub-modal"></div><div id="hub-toast" class="hub-toast"></div>';
  document.body.className = 'hubbody';
  const root = document.getElementById('hub'), modal = document.getElementById('hub-modal');
  let chars = [], group = { name: '', players: {} }, open = {}, view = ls.get(VIEW) === 'shared' ? 'shared' : 'mine';
  try { open = JSON.parse(ls.get(OPEN) || '{}'); } catch (e) {}
  const toast = t => { const el = document.getElementById('hub-toast'); el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2600); };
  const pmap = () => (group && group.players) || {};
  const myName = () => pmap()[EMAIL] || user.displayName || EMAIL.split('@')[0];
  const nameOf = em => pmap()[em] || em;
  const isMine = c => (c.owner || '') === EMAIL;
  const admin = () => IS_ADMIN && view === 'all';
  const charsCol = fs.collection('groups/' + G + '/chars'), gDoc = fs.collection('groups').doc(G), sheets = fs.collection('sheets');
  const FV = firebase.firestore.FieldValue, FP = firebase.firestore.FieldPath;
  const close = () => { modal.classList.remove('on'); ADMIN_ON = false; };
  const playerOptions = sel => Object.entries(pmap()).sort((a, b) => a[1].localeCompare(b[1])).map(([em, n]) => `<option value="${esc(em)}"${em === sel ? ' selected' : ''}>${esc(n)} — ${esc(em)}</option>`).join('');

  function createChar() {
    if (!IS_ADMIN) { location.href = base + '?new=1&g=' + G + '&p=' + encodeURIComponent(myName()); return; }
    modal.innerHTML = `<div class="hub-card"><h2>New character</h2><p class="hub-hint">Whose character is it? Only that player (and you) will be able to open it.</p>
      <form id="new-f" class="who-f"><select id="new-o">${playerOptions(EMAIL)}</select><button class="btn gold">Create</button></form><button class="btn ghost" id="new-x">Cancel</button></div>`;
    modal.classList.add('on');
    modal.querySelector('#new-f').onsubmit = e => { e.preventDefault(); const o = modal.querySelector('#new-o').value; location.href = base + '?new=1&g=' + G + '&o=' + encodeURIComponent(o) + '&p=' + encodeURIComponent(nameOf(o)); };
    modal.querySelector('#new-x').onclick = close;
  }
  async function giveTo(c, o) {
    try { const s = await sheets.doc(c.id).get(); const n = Number(s.exists && s.data().n) || 1; await sheets.doc(c.id).update({ owner: o }); for (let k = 1; k < n; k++) await sheets.doc(c.id + '_p' + k).update({ owner: o }).catch(() => {});
      await charsCol.doc(c.id).set({ owner: o, player: nameOf(o), playerSet: Date.now() }, { merge: true }); c.owner = o; c.player = nameOf(o); toast('Moved to ' + nameOf(o) + '.'); } catch (x) { toast('Couldn\'t move it: ' + (x.message || x)); } }
  function moveChar(c) {
    modal.innerHTML = `<div class="hub-card"><h2>Move ${esc(c.name || 'character')}</h2><p class="hub-hint">Give it to another player. They'll be able to open it; the current player won't anymore.</p>
      <form id="mv-f" class="who-f"><select id="mv-o">${playerOptions(c.owner)}</select><button class="btn gold">Move</button></form><button class="btn ghost" id="mv-x">Cancel</button></div>`;
    modal.classList.add('on');
    modal.querySelector('#mv-f').onsubmit = async e => { e.preventDefault(); const o = modal.querySelector('#mv-o').value; close(); await giveTo(c, o); };
    modal.querySelector('#mv-x').onclick = close;
  }
  function removeChar(c, back) {
    modal.innerHTML = `<div class="hub-card"><h2>Remove ${esc(c.name || 'this character')} from the list?</h2><p class="hub-hint">The character itself isn't deleted — opening its link puts it back here.</p>
      <div class="row"><button class="btn ghost" id="rm-x">Cancel</button><button class="btn red" id="rm-ok">Remove from list</button></div></div>`;
    modal.classList.add('on');
    modal.querySelector('#rm-ok').onclick = async () => { await charsCol.doc(c.id).delete(); chars = chars.filter(x => x.id !== c.id); toast('Removed from the list.'); back ? back() : close(); };
    modal.querySelector('#rm-x').onclick = () => back ? back() : close();
  }
  const adminRefresh = () => { if (ADMIN_ON && modal.classList.contains('on') && modal.querySelector('.hub-card.admin') && !modal.contains(document.activeElement && document.activeElement.matches('input, select') ? document.activeElement : null)) adminPanel(); };
  // ===== Admin: every character, the player list, and (for you) who else is an admin =====
  let ATAB = 'chars', ADMIN_ON = false;
  const pic = c => c.thumb ? `<img class="hc-pic" src="${esc(c.thumb)}" alt="">` : `<span class="hc-pic hc-nopic">${esc((c.name || '?')[0])}</span>`;
  function adminPanel(tab) {
    if (tab) ATAB = tab; ADMIN_ON = true;
    const tabs = [['chars', 'Characters'], ['players', 'Players'], ['admins', 'Admins']];
    let body = '';
    if (ATAB === 'chars') {
      const list = chars.slice().sort((a, b) => nameOf(a.owner || '').localeCompare(nameOf(b.owner || '')) || (a.name || '').localeCompare(b.name || ''));
      body = `<p class="hub-hint">Every character in the party. Change the owner to give it to another player.</p><div class="ad-list">${list.map(c => `<div class="ad-row">${pic(c)}
        <div class="ad-main"><b>${esc(c.name || 'Unnamed character')}</b><small>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}${c.updatedAt ? ' · updated ' + ago(c.updatedAt) + (c.by ? ' by ' + esc(c.by) : '') : ''}${(c.viewers || []).length ? ' · shared with ' + c.viewers.length : ''}</small></div>
        <select class="ad-own" data-own="${esc(c.id)}" aria-label="Owner of ${esc(c.name || 'this character')}">${playerOptions(c.owner)}${c.owner && pmap()[c.owner] ? '' : `<option value="${esc(c.owner || '')}" selected>${esc(c.owner || '— no owner —')}</option>`}</select>
        <div class="ad-acts"><a class="btn sm" href="${esc(base + '?c=' + c.id)}">Open</a><button class="btn sm" data-ash="${esc(c.id)}">Share</button><button class="btn sm ghost" data-arm="${esc(c.id)}">Remove</button></div></div>`).join('') || '<p class="hub-hint">No characters yet.</p>'}</div>`;
    } else if (ATAB === 'players') {
      const rows = Object.entries(pmap()).sort((a, b) => a[1].localeCompare(b[1])), count = em => chars.filter(c => c.owner === em).length;
      body = `<p class="hub-hint">Each player signs in with their email (Google, or an emailed link). Their characters are locked to it. Edit a name to rename them.</p>
        <div class="pl-list">${rows.map(([em, n]) => `<div class="pl-row"><input class="ad-name" data-pn="${esc(em)}" value="${esc(n)}" maxlength="40" aria-label="Name for ${esc(em)}"><span>${esc(em)}</span><small class="ad-n">${count(em)} character${count(em) === 1 ? '' : 's'}</small><button class="linkbtn" data-prm="${esc(em)}">remove</button></div>`).join('') || '<p class="hub-hint">No players yet.</p>'}</div>
        <form id="pl-f" class="who-f pl-f"><input id="pl-n" placeholder="Name" maxlength="40" required><input id="pl-e" type="email" placeholder="Email" required><button class="btn gold">Add player</button></form>`;
    } else {
      body = `<p class="hub-hint">Admins can open, edit, share and move every character, manage players and remove characters from the list.${IS_OWNER ? '' : ' Only ' + esc(ADMIN_EMAIL) + ' can change who is an admin.'}</p>
        <div class="pl-list"><div class="pl-row"><b>${esc(nameOf(ADMIN_EMAIL))}</b><span>${esc(ADMIN_EMAIL)}</span><small class="ad-n">always</small></div>
        ${ADMINS.filter(em => em !== ADMIN_EMAIL).map(em => `<div class="pl-row"><b>${esc(pmap()[em] || '')}</b><span>${esc(em)}</span>${IS_OWNER ? `<button class="linkbtn" data-arm-admin="${esc(em)}">remove</button>` : ''}</div>`).join('')}</div>
        ${IS_OWNER ? `<form id="ad-f" class="who-f pl-f"><input id="ad-e" type="email" placeholder="Email" list="ad-dl" required><datalist id="ad-dl">${Object.entries(pmap()).filter(([em]) => em !== ADMIN_EMAIL && !ADMINS.includes(em)).map(([em, n]) => `<option value="${esc(em)}">${esc(n)}</option>`).join('')}</datalist><button class="btn gold">Make admin</button></form>` : ''}`;
    }
    modal.innerHTML = `<div class="hub-card admin"><h2>Admin</h2><div class="hub-views ad-tabs">${tabs.map(([k, t]) => `<button class="${ATAB === k ? 'on' : ''}" data-atab="${k}">${t}${k === 'chars' ? ` <span>${chars.length}</span>` : k === 'players' ? ` <span>${Object.keys(pmap()).length}</span>` : ''}</button>`).join('')}</div>
      <div class="ad-body">${body}</div><button class="btn ghost" id="ad-x">Done</button></div>`;
    modal.classList.add('on');
    const back = () => adminPanel();
    modal.querySelectorAll('[data-atab]').forEach(b => b.onclick = () => adminPanel(b.dataset.atab));
    modal.querySelector('#ad-x').onclick = () => { ADMIN_ON = false; close(); };
    modal.querySelectorAll('[data-own]').forEach(sl => sl.onchange = async () => { const c = chars.find(x => x.id === sl.dataset.own); if (c && sl.value && sl.value !== c.owner) { await giveTo(c, sl.value); adminPanel(); } });
    modal.querySelectorAll('[data-ash]').forEach(b => b.onclick = () => { const c = chars.find(x => x.id === b.dataset.ash); if (c) shareChar(c, back); });
    modal.querySelectorAll('[data-arm]').forEach(b => b.onclick = () => { const c = chars.find(x => x.id === b.dataset.arm); if (c) removeChar(c, back); });
    modal.querySelectorAll('[data-pn]').forEach(inp => inp.onchange = async () => { const n = inp.value.trim(); if (!n) { inp.value = pmap()[inp.dataset.pn] || ''; return; } await gDoc.update(new FP('players', inp.dataset.pn), n); toast('Renamed to ' + n + '.'); });
    modal.querySelectorAll('[data-prm]').forEach(b => b.onclick = async () => { await gDoc.update(new FP('players', b.dataset.prm), FV.delete()); toast('Removed ' + b.dataset.prm + ' from the players.'); });
    const pf = modal.querySelector('#pl-f'); if (pf) pf.onsubmit = async e => { e.preventDefault(); const n = modal.querySelector('#pl-n').value.trim(), em = modal.querySelector('#pl-e').value.trim().toLowerCase(); if (!n || !em) return;
      await gDoc.set({ players: { [em]: n } }, { merge: true }); toast('Added ' + n + '.'); };
    const cfg = fs.collection('config').doc('admins');
    const af = modal.querySelector('#ad-f'); if (af) af.onsubmit = async e => { e.preventDefault(); const em = modal.querySelector('#ad-e').value.trim().toLowerCase(); if (!em || em === ADMIN_EMAIL) return;
      try { await cfg.set({ emails: FV.arrayUnion(em) }, { merge: true }); ADMINS = [...new Set(ADMINS.concat(em))]; toast(nameOf(em) + ' is now an admin.'); adminPanel(); } catch (x) { toast('Couldn\'t add the admin — publish the new database rules first.'); } };
    modal.querySelectorAll('[data-arm-admin]').forEach(b => b.onclick = async () => { const em = b.dataset.armAdmin; try { await cfg.set({ emails: FV.arrayRemove(em) }, { merge: true }); ADMINS = ADMINS.filter(x => x !== em); toast(em + ' is no longer an admin.'); adminPanel(); } catch (x) { toast('Couldn\'t remove the admin: ' + (x.message || x)); } });
  }
  // Who else can open a character: everyone in "viewers" can look; those also in "editors" can change it.
  async function setAccess(c, V, E) {
    const acc = { viewers: V, editors: E.filter(x => V.includes(x)) };
    const s0 = await sheets.doc(c.id).get(); const n = Number(s0.exists && s0.data().n) || 1;
    await sheets.doc(c.id).update(acc); for (let k = 1; k < n; k++) await sheets.doc(c.id + '_p' + k).update(acc).catch(() => {});
    await charsCol.doc(c.id).set(acc, { merge: true }); Object.assign(c, acc);
  }
  function shareChar(c, back) {
    let V = [...(c.viewers || [])], E = [...(c.editors || [])];
    const paint = () => {

      modal.innerHTML = `<div class="hub-card wide"><h2>Share ${esc(c.name || 'this character')}</h2><p class="hub-hint">They'll find it under “Shared characters” after signing in with that email.</p>
        <div class="pl-list">${V.map(em => `<div class="pl-row"><span class="sh-who">${pmap()[em] ? `<b>${esc(pmap()[em])}</b> ` : ''}<span>${esc(em)}</span></span><select data-acc="${esc(em)}"><option value="view">Can view</option><option value="edit"${E.includes(em) ? ' selected' : ''}>Can edit</option></select><button class="linkbtn" data-rm="${esc(em)}">remove</button></div>`).join('') || '<p class="hub-hint">Not shared with anyone yet.</p>'}</div>
        <form id="sh-f" class="who-f pl-f sh-f"><input id="sh-e" type="email" placeholder="Their email address" autocomplete="off" required><select id="sh-a"><option value="view">Can view</option><option value="edit">Can edit</option></select><button class="btn gold">Share</button></form>
        <button class="btn ghost" id="sh-x">Done</button></div>`;
      modal.classList.add('on');
      const ei = modal.querySelector('#sh-e');
      
      const save = async (nv, ne, msg) => { try { await setAccess(c, nv, ne); V = c.viewers; E = c.editors; if (msg) toast(msg); paint(); } catch (x) { toast('Couldn\'t change sharing: ' + (x.message || x)); } };
      modal.querySelector('#sh-f').onsubmit = e => { e.preventDefault(); const em = ei.value.trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast('Type an email address.'); return; } if (em === c.owner) { toast('That’s the owner.'); return; }
        const ed = modal.querySelector('#sh-a').value === 'edit'; save([...V.filter(x => x !== em), em], ed ? [...E.filter(x => x !== em), em] : E.filter(x => x !== em), 'Shared with ' + nameOf(em) + '.'); };
      modal.querySelectorAll('[data-acc]').forEach(sel => sel.onchange = () => { const em = sel.dataset.acc; save(V, sel.value === 'edit' ? [...E.filter(x => x !== em), em] : E.filter(x => x !== em)); });
      modal.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { const em = b.dataset.rm; save(V.filter(x => x !== em), E.filter(x => x !== em), 'Stopped sharing with ' + nameOf(em) + '.'); });
      modal.querySelector('#sh-x').onclick = () => back ? back() : close();
    };
    paint();
  }
  const shareIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';
  const shareNote = c => { const n = (c.viewers || []).length; return n ? `Shared with ${n} · ` : ''; };
  function card(c) {
    const acc = IS_ADMIN ? '' : (c.editors || []).includes(EMAIL) ? '<span class="hc-acc edit">Can edit</span>' : '<span class="hc-acc">View only</span>';
    return `<div class="hc${c.pin && isMine(c) ? ' pinned' : ''}"><a class="hc-main" href="${esc(base + '?c=' + c.id)}">${c.thumb ? `<img class="hc-pic" src="${esc(c.thumb)}" alt="">` : `<span class="hc-pic hc-nopic">${esc((c.name || '?')[0])}</span>`}
      <span class="hc-txt"><b>${esc(c.name || 'Unnamed character')}</b><span>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}</span>
      <small>${c.updatedAt ? 'Updated ' + ago(c.updatedAt) + (c.by ? ' by ' + esc(c.by) : '') : ''}</small>${acc}</span></a>
      ${IS_ADMIN ? `<div class="hc-menu"><button class="hc-dots" aria-label="More">⋯</button><div class="hc-list">
        <button data-a="share" data-id="${esc(c.id)}">Share…</button><button data-a="move" data-id="${esc(c.id)}">Give to another player</button><button data-a="rm" data-id="${esc(c.id)}">Remove from list</button></div></div>` : ''}</div>`;
  }
  // Pinned first; then each player's own order (drag to change), then most recently updated.
  const ord = (a, b) => (!!b.pin - !!a.pin) || ((a.order != null ? a.order : 1e9) - (b.order != null ? b.order : 1e9)) || ((b.updatedAt || 0) - (a.updatedAt || 0));
  function row(c) {
    return `<div class="hr${c.pin ? ' pinned' : ''}" data-id="${esc(c.id)}" data-pin="${c.pin ? 1 : 0}"><span class="hr-grip" title="Drag to reorder" aria-label="Drag to reorder">⠿</span>
      <a class="hr-main" href="${esc(base + '?c=' + c.id)}">${c.thumb ? `<img class="hc-pic" src="${esc(c.thumb)}" alt="">` : `<span class="hc-pic hc-nopic">${esc((c.name || '?')[0])}</span>`}
      <span class="hc-txt"><b>${esc(c.name || 'Unnamed character')}</b><span>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}</span>
      <small>${shareNote(c)}${c.updatedAt ? 'Updated ' + ago(c.updatedAt) + (c.by ? ' by ' + esc(c.by) : '') : ''}</small></span></a>
      <button class="hr-pin hr-share" data-share-id="${esc(c.id)}" title="Share">${shareIcon}</button><button class="hr-pin${c.pin ? ' on' : ''}" data-pin-id="${esc(c.id)}" title="${c.pin ? 'Unpin' : 'Pin to the top'}" aria-pressed="${!!c.pin}"><svg viewBox="0 0 24 24" width="18" height="18" fill="${c.pin ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 3h6l-1 6 4 4H6l4-4z"/><path d="M12 13v8"/></svg></button></div>`;
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
    const SH = view === 'shared', mine = chars.filter(isMine), shared = chars.filter(c => !isMine(c)), groups = {};
    shared.forEach(c => { const k = nameOf(c.owner || '') || (c.player || '').trim() || 'No player yet'; (groups[k] = groups[k] || []).push(c); });
    const keys = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    const byName = (a, b) => (a.name || '').localeCompare(b.name || '');
    const body = SH
      ? (keys.length ? keys.map(k => { const isOpen = open[k] != null ? open[k] : true; return `<details class="hub-folder" data-k="${esc(k)}" ${isOpen ? 'open' : ''}><summary><span class="hf-caret">▸</span><span class="hf-name">${esc(k)}</span><span class="hf-n">${groups[k].length}</span></summary>
        <div class="hf-body">${groups[k].sort(byName).map(card).join('')}</div></details>`; }).join('')
        : `<p class="hub-empty">Nothing has been shared with you yet. When another player shares a character with ${esc(EMAIL)}, it shows up here.</p>`)
      : (mine.length ? `<div class="hl">${mine.sort(ord).map(row).join('')}</div>` : `<p class="hub-empty">You don’t have any characters yet — create one${IS_ADMIN ? '' : ', or ask whoever has yours to give it to you'}.</p>`);
    root.innerHTML = `<header class="hub-top"><h1 class="hub-title">D&amp;D Character Sheets</h1>
      <div class="hub-me">Signed in as <b>${esc(myName())}</b> <span class="hub-em">${esc(EMAIL)}</span> · <button class="linkbtn" id="me-out">Sign out</button></div></header>
      <div class="hub-views"><button class="${SH ? '' : 'on'}" data-view="mine">My characters <span>${mine.length}</span></button><button class="${SH ? 'on' : ''}" data-view="shared">Shared characters <span>${shared.length}</span></button>${IS_ADMIN ? '<button class="btn hub-admin" id="hub-admin">⚙ Admin</button>' : ''}</div>
      ${SH ? '' : '<div class="hub-bar"><button class="btn gold big" id="hub-new">＋ Create character</button></div>'}
      ${body}`;
    const nb = root.querySelector('#hub-new'); if (nb) nb.onclick = createChar;
    root.querySelector('#me-out').onclick = signOut;
    root.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { view = b.dataset.view; ls.set(VIEW, view); draw(); });
    const ad = root.querySelector('#hub-admin'); if (ad) ad.onclick = () => adminPanel('chars');
    root.querySelectorAll('[data-pin-id]').forEach(b => b.onclick = e => { e.preventDefault(); togglePin(b.dataset.pinId); });
    root.querySelectorAll('[data-share-id]').forEach(b => b.onclick = e => { e.preventDefault(); const c = chars.find(x => x.id === b.dataset.shareId); if (c) shareChar(c); });
    root.querySelectorAll('details.hub-folder').forEach(d => d.addEventListener('toggle', () => { open[d.dataset.k] = d.open; ls.set(OPEN, JSON.stringify(open)); }));
    root.querySelectorAll('.hc-dots').forEach(b => b.onclick = e => { e.stopPropagation(); const w = b.parentElement, on = !w.classList.contains('on'); root.querySelectorAll('.hc-menu.on').forEach(x => x.classList.remove('on')); w.classList.toggle('on', on); });
    root.querySelectorAll('.hc-list [data-a]').forEach(b => b.onclick = () => { const c = chars.find(x => x.id === b.dataset.id); b.closest('.hc-menu').classList.remove('on'); if (!c) return;
      if (b.dataset.a === 'share') shareChar(c); if (b.dataset.a === 'move') moveChar(c); if (b.dataset.a === 'rm') removeChar(c); });
  }
  document.addEventListener('click', () => root.querySelectorAll('.hc-menu.on').forEach(x => x.classList.remove('on')));
  draw();
  gDoc.onSnapshot(s => { group = (s.exists && s.data()) || {}; if (!RD) draw(); adminRefresh(); }, () => {});
  // The DM sees every character; everyone else sees their own plus the ones shared with them.
  const lists = {}, merge = () => { const m = new Map(); Object.values(lists).forEach(l => l.forEach(c => m.set(c.id, c))); chars = [...m.values()]; if (!RD) draw(); adminRefresh(); };
  const failed = e => { root.innerHTML = `<p class="hub-empty">Couldn't load the character list (${esc(e.code || e.message || e)}).<br><br>Signed in as ${esc(EMAIL)} · <button class="linkbtn" onclick="pgSignOut()">Sign out</button></p>`; console.error(e); };
  const watch = (k, q) => q.onSnapshot(qs => { lists[k] = qs.docs.map(d => Object.assign({ id: d.id }, d.data())); merge(); }, failed);
  if (IS_ADMIN) watch('all', charsCol); else { watch('mine', charsCol.where('owner', '==', EMAIL)); watch('shared', charsCol.where('viewers', 'array-contains', EMAIL)); }
  setInterval(() => { if (!RD) draw(); }, 60000);
}
