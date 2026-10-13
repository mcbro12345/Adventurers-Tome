// GitHub Pages loader. Modes (from the address):
//   ?c=<id>                 a character, loaded from Firestore and kept in sync
//   ?g=<group>              the party hub
//   ?new=1[&g=..&p=..&o=..] a brand-new character (gets its own ?c= link once created)
//   (nothing)               this device's hub if it has one, otherwise a new character
// Everyone signs in once per device (Google, or a link emailed to them). Each character belongs to one email;
// the database only lets that player — and the DM — open or change it.
const ADMIN_EMAIL = 'matthewcbro@gmail.com';
// Every character lives in one library; the hub shows each person their own and the ones shared with them.
const DEFAULT_G = 'WLdUj_I3XrA_9VIP';
// Search keys for an account or character: every prefix of each word (and of the whole name / email), so the admin
// pages can find "ryan", "o'neal" or "roneal1994@…" with one indexed lookup however many accounts there are.
function searchKeys(...parts) { const out = new Set(); parts.forEach(p => { p = String(p || '').toLowerCase().trim(); if (!p) return;
  new Set([p, ...p.split(/[\s@._'’-]+/)]).forEach(t => { t = t.slice(0, 24); for (let i = 1; i <= t.length; i++) out.add(t.slice(0, i)); }); }); return [...out].slice(0, 400); }
// ================= The logo (sign-in page and character list) =================
// A gold d20 crest beside "Adventurer's" in spaced small caps over a large serif "Tome". Hovering the die rolls it:
// it tumbles, the face flickers, and it lands on a random number that stays until the page is reloaded.
const PG_DIE = { n: 20, rolled: false, rolling: false, over: true };
function logoHTML() { return `<h1 class="hub-logo" aria-label="Adventurer’s Tome"><svg class="hl-d20${PG_DIE.rolled && PG_DIE.n === 20 ? ' crit' : PG_DIE.rolled && PG_DIE.n === 1 ? ' fumble' : ''}" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="hlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1d58a"/><stop offset=".55" stop-color="#c9962b"/><stop offset="1" stop-color="#8a6420"/></linearGradient></defs><polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="rgba(201,150,43,.14)" stroke="url(#hlg)" stroke-width="4" stroke-linejoin="round"/><g fill="none" stroke="url(#hlg)" stroke-width="2.6" stroke-linejoin="round"><polygon points="50,24 73,63 27,63"/><path d="M50 4 L50 24 M91 27 L73 63 M91 73 L73 63 M50 96 L73 63 M50 96 L27 63 M9 73 L27 63 M9 27 L27 63 M9 27 L50 24 M91 27 L50 24"/></g><text x="50" y="55" text-anchor="middle" font-family="Georgia,serif" font-weight="800" font-size="15" class="hl-20">${PG_DIE.n}</text></svg><span class="hl-txt"><span class="hl-a">Adventurer’s</span><span class="hl-t">Tome</span></span></h1>`; }
function wireDie(root) {
  // Only a real move onto the die rolls it — not the list redrawing underneath a resting pointer, or a page load.
  addEventListener('pointermove', () => { if (PG_DIE.over === true) PG_DIE.over = !!document.querySelector('.hl-d20:hover'); }, { once: true });
  root.addEventListener('mouseout', e => { const d = e.target.closest && e.target.closest('.hl-d20'); if (d && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.hl-d20'))) PG_DIE.over = false; });
  root.addEventListener('mouseover', e => { const d = e.target.closest && e.target.closest('.hl-d20'); if (!d || PG_DIE.rolling || PG_DIE.over || (e.relatedTarget && d.contains(e.relatedTarget))) return;
    PG_DIE.over = true; PG_DIE.rolling = true; d.classList.remove('roll', 'crit', 'fumble'); void d.getBoundingClientRect(); d.classList.add('roll');
    const face = () => root.querySelector('.hl-20'), end = Date.now() + 850;
    const tick = () => { const f = face(); if (Date.now() < end) { if (f) f.textContent = 1 + Math.floor(Math.random() * 20); setTimeout(tick, 70); return; }
      PG_DIE.n = 1 + Math.floor(Math.random() * 20); PG_DIE.rolled = true; if (f) f.textContent = PG_DIE.n;
      const dd = root.querySelector('.hl-d20'); if (dd) { dd.classList.remove('roll'); dd.classList.toggle('crit', PG_DIE.n === 20); dd.classList.toggle('fumble', PG_DIE.n === 1); } PG_DIE.rolling = false; };
    tick(); });
}
(async () => {
  const CFG = __CFG__, VER = '__VER__', ASSETS = __ASSETS__;
  const Q = new URLSearchParams(location.search), clean = v => (v || '').replace(/[^A-Za-z0-9_-]/g, '');
  let C = clean(Q.get('c')), G = clean(Q.get('g'));
  const P = (Q.get('p') || '').slice(0, 60), O = (Q.get('o') || '').trim().toLowerCase().slice(0, 120);
  const LAST_G = 'dnd-hub-group';
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const load = document.getElementById('pg-load'), data = document.getElementById('sheet-data');
  const say = html => { if (load) load.innerHTML = `<div class="pg-msg">${html}</div>`; };
  // ---- Moving house: the old GitHub Pages address hands each visitor over to adventurers-tome.web.app ----
  // The old page packs this browser's sheet settings (layouts, per-sheet settings, theme, tab bar, hub state, roll logs)
  // and its saved sign-in into the part of the link after "#" (never sent to any server), and the new page unpacks it
  // and wipes it from the address bar. If the new address can't be reached, the old one keeps working as before.
  const MOVE = window.PG_MOVE || { from: /(^|\.)github\.io$/, to: 'https://adventurers-tome.web.app' };
  const AU_KEY = 'firebase:authUser:' + CFG.apiKey + ':[DEFAULT]';
  const idbAuth = () => new Promise(res => { try { const rq = indexedDB.open('firebaseLocalStorageDb'); let made = false;
    rq.onupgradeneeded = () => { made = true; }; rq.onerror = () => res(null);
    rq.onsuccess = () => { const db = rq.result; if (made || !db.objectStoreNames.contains('firebaseLocalStorage')) { db.close(); if (made) indexedDB.deleteDatabase('firebaseLocalStorageDb'); return res(null); }
      try { const g = db.transaction('firebaseLocalStorage', 'readonly').objectStore('firebaseLocalStorage').get(AU_KEY); g.onsuccess = () => { db.close(); res(g.result ? g.result.value : null); }; g.onerror = () => { db.close(); res(null); }; } catch (e) { db.close(); res(null); } }; } catch (e) { res(null); } });
  const toB64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const fromB64 = t => { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
  const pack = async o => { const u = new TextEncoder().encode(JSON.stringify(o)); if (window.CompressionStream) { try { return 'z' + toB64(new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer())); } catch (e) {} } return 'j' + toB64(u); };
  const unpack = async t => { const u = fromB64(t.slice(1)); const b = t[0] === 'z' ? new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()) : u; return JSON.parse(new TextDecoder().decode(b)); };
  if (MOVE.from.test(location.hostname) && !Q.get('handoff') && !Q.get('oobCode') && !Q.get('stay')) {
    // only once the new address is running this version or newer (it can lag a minute behind after an update)
    const up = await Promise.race([fetch(MOVE.to + '/version.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).then(j => String(j.v || '') >= VER, () => false), new Promise(r => setTimeout(() => r(false), 5000))]);
    if (up) {
      say('Moving to Adventurer’s Tome…');
      const ls = {}; let room = 250000; const keys = []; try { for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i)); } catch (e) {}
      const logs = k => /^dnd-(rolllog|evlog):/.test(k);
      keys.filter(k => /^dnd-/.test(k) && !/^dnd-(sheet:|sheet-path:|signin-)/.test(k)).sort((a, b) => logs(a) - logs(b)).forEach(k => { const v = lsGet(k); if (v == null || v.length > 60000 || v.length > room) return; ls[k] = v; room -= v.length; });
      let au = await idbAuth(); if (!au) { try { au = JSON.parse(lsGet(AU_KEY) || 'null'); } catch (e) {} }
      let pay = ''; try { pay = await pack({ ls, au, at: Date.now() }); } catch (e) {}
      location.replace(MOVE.to + '/' + location.search + (pay ? '#move=' + pay : '')); return;
    }
  }
  if (location.hash.startsWith('#move=')) {
    const raw = location.hash.slice(6); history.replaceState(null, '', location.pathname + location.search);
    try { const d = await unpack(raw); if (d && Date.now() - (d.at || 0) < 15 * 60 * 1000) {
      Object.entries(d.ls || {}).forEach(([k, v]) => { if (lsGet(k) == null) lsSet(k, v); });
      if (d.au && d.au.uid && d.au.apiKey === CFG.apiKey && !(await idbAuth()) && lsGet(AU_KEY) == null) lsSet(AU_KEY, JSON.stringify(d.au)); } } catch (e) { console.warn('move', e); }
  }
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
  if (!C && !G && !Q.get('new')) { location.replace(location.pathname + '?g=' + (clean(lsGet(LAST_G)) || DEFAULT_G)); return; }
  if (!G && Q.get('new')) G = DEFAULT_G;
  const user = await new Promise(res => { const u = auth.onAuthStateChanged(x => { u(); res(x); }); });
  if (!user) { signIn(auth, say); return; }
  const EMAIL = (user.email || '').toLowerCase(), IS_OWNER = EMAIL === ADMIN_EMAIL;
  let IS_ADMIN = IS_OWNER, ADMINS = [];
  try { const a = await fs.collection('config').doc('admins').get(); ADMINS = ((a.exists && a.data().emails) || []).map(x => String(x).toLowerCase()); if (ADMINS.includes(EMAIL)) IS_ADMIN = true; } catch (e) {}
  const signOut = () => auth.signOut().then(() => location.reload());
  window.pgSignOut = signOut;
  // Each account has its own record (name, email, when it joined). Made on first sign-in from the Google name; an admin
  // can rename it. "Last seen" is refreshed at most once a day to keep database writes down.
  const UREF = fs.collection('users').doc(EMAIL);
  let ME = null;
  try { const us = await UREF.get(); ME = us.exists ? us.data() : null;
    if (!ME) { const nm = (user.displayName || EMAIL.split('@')[0]).slice(0, 60); ME = { email: EMAIL, name: nm, nameLower: nm.toLowerCase(), keys: searchKeys(nm, EMAIL.split('@')[0], EMAIL), createdAt: Date.now(), seenAt: Date.now() }; await UREF.set(ME); }
    else if (!ME.seenAt || Date.now() - ME.seenAt > 864e5) UREF.update({ seenAt: Date.now() }).catch(() => {}); } catch (e) { console.warn('account record', e); }
  let NAME = (ME && ME.name) || user.displayName || EMAIL.split('@')[0];
  const UCACHE = {}, userDoc = em => UCACHE[em] || (UCACHE[em] = fs.collection('users').doc(em).get().then(x => x.exists ? x.data() : null, () => null));

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
  if (G && !C && !Q.get('new')) { lsSet(LAST_G, G); if (load) load.remove(); document.documentElement.classList.remove('pg-loading'); hub(fs, auth, G, { EMAIL, IS_ADMIN, IS_OWNER, ADMINS, user, signOut, ME, page: Q.get('admin') && IS_ADMIN ? 'admin' : 'hub' }); verCheck();
    // quietly warm the cache so opening a sheet from here is quick
    setTimeout(() => [ASSETS.data, ASSETS.app].forEach(u => { const l = document.createElement('link'); l.rel = 'prefetch'; l.href = u; document.head.appendChild(l); }), 2500); return; }

  const rid = () => { const a = new Uint8Array(18); crypto.getRandomValues(a); return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const NEW = !C;
  if (NEW) C = rid();
  window.SHEET_PAGES = true; window.SHEET_CHAR = C;
  // The game data and the app arrive as separate long-cached files; start fetching them now, run them in order later.
  const fetched = Promise.all([ASSETS.data, ASSETS.app].map(u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.text(); })));
  const run = async () => { let src; try { src = await fetched; } catch (e) { say('Couldn\'t load the sheet. Check your connection and reload.'); return; }
    if (load) load.remove(); document.documentElement.classList.remove('pg-loading');
    src.forEach(t => { const s = document.createElement('script'); s.textContent = t; document.body.appendChild(s); }); };
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
  // Older copies didn't record an owner: take it from the party list.
  if (!OWNER && hubCol) { try { const h = await hubCol.doc(C).get(); OWNER = ((h.exists && h.data().owner) || '').toLowerCase(); } catch (e) {} }
  if (!OWNER) OWNER = EMAIL;
  let OWNER_NAME = ''; userDoc(OWNER).then(u => { OWNER_NAME = (u && u.name) || ''; if (OWNER_NAME) setTimeout(() => { try { syncPlayer(); } catch (e) {} }, 0); });
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
  let LASTD = null, hubChanged = false, WROTE = 0, LASTSUM = '';
  const hubUpdate = async changed => { if (!hubCol || !window.sheetSummary || role() === 'view') return; const st = window.sheetState && window.sheetState(); if (!st || !st.created) return;
    const s = window.sheetSummary();
    const when = changed ? { updatedAt: Date.now(), by: NAME } : {};
    const sum = Object.assign({ owner: OWNER, name: s.name, player: s.player, race: s.race, cls: s.cls, level: s.level, thumb: await thumb(s.portrait), keys: searchKeys(s.name) }, NEW && !LASTSUM ? { createdAt: Date.now() } : {});
    const key = JSON.stringify(sum); if (!changed && key === LASTSUM) return; // nothing on the card changed: skip the write
    try { await hubCol.doc(C).set(Object.assign(sum, when), { merge: true }); LASTSUM = key; } catch (e) { console.warn('hub', e); } };
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
  const playerName = () => OWNER_NAME || P || '';
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
  if (G) { const a = document.createElement('a'); a.href = location.pathname + '?g=' + G; a.className = 'pg-hublink'; a.title = 'All characters'; a.textContent = '⌂ Characters'; document.body.appendChild(a);
    // On a phone it sits just above the bottom tab bar, wherever that bar ends up.
    const place = () => { const t = document.getElementById('tabs'), r = t && t.getBoundingClientRect(); a.style.bottom = document.documentElement.classList.contains('mobile') && r && r.height && r.top > innerHeight / 2 ? (innerHeight - r.top + 8) + 'px' : ''; };
    addEventListener('resize', place); setInterval(place, 1500); setTimeout(place, 300); }
  // Adding this page to a phone's home screen: the icon is the character's portrait (the party page uses the dice icon).
  const homeIcon = () => { try { const st = window.sheetState && window.sheetState(); if (!st || !st.created) return; document.title = (st.name || 'Character') + ' — Adventurer’s Tome';
    const set = (sel, mk) => { let e = document.head.querySelector(sel); if (!e) { e = mk(); document.head.appendChild(e); } return e; };
    set('meta[name="apple-mobile-web-app-title"]', () => Object.assign(document.createElement('meta'), { name: 'apple-mobile-web-app-title' })).content = st.name || 'Character';
    if (!st.portrait || st.portrait === homeIcon.p) return; homeIcon.p = st.portrait; const im = new Image(); im.onload = () => { try { const c = document.createElement('canvas'), n = 180, s = Math.min(im.width, im.height); c.width = c.height = n;
      const x = c.getContext('2d'); x.fillStyle = '#1f2a44'; x.fillRect(0, 0, n, n); x.drawImage(im, (im.width - s) / 2, (im.height - s) / 2 * 0.6, s, s, 0, 0, n, n);
      const url = c.toDataURL('image/png'); document.head.querySelectorAll('link[rel="apple-touch-icon"], link[rel="icon"]').forEach(l => l.remove());
      [['apple-touch-icon', ''], ['icon', 'image/png']].forEach(([rel, type]) => { const l = document.createElement('link'); l.rel = rel; if (type) l.type = type; l.href = url; document.head.appendChild(l); }); } catch (e) {} }; im.src = st.portrait; } catch (e) {} };
  setTimeout(homeIcon, 1500); setInterval(homeIcon, 60000);
  if (role() !== 'owner') { const t = document.createElement('div'); t.className = 'pg-shared' + (role() === 'view' ? ' view' : ''); t.textContent = role() === 'view' ? 'View only' : 'Shared with you · can edit'; document.body.appendChild(t); }
  verCheck();
})();

// ================= Sign in (once per device) =================
function signIn(auth, say) {
  say(`<div class="pg-signin">${logoHTML()}<h2>Sign in</h2>
    <p>Sign in once on this device to open your characters. Only you and the people you share them with can see or change them.</p>
    <button class="btn gold big" id="si-g"><svg viewBox="0 0 48 48" width="18" height="18" style="vertical-align:-3px;margin-right:8px"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>Sign in with Google</button>
    <div class="pg-or">or</div>
    <form id="si-f" class="who-f"><input id="si-e" type="email" placeholder="Your email address" autocomplete="email" required><button class="btn">Email me a link</button></form>
    <p class="hub-hint" id="si-msg">No Google account? Type your email — you'll get a one-time sign-in link.</p></div>`);
  wireDie(document.getElementById('pg-load'));
  const msg = t => { const m = document.getElementById('si-msg'); if (m) m.innerHTML = t; };
  document.getElementById('si-g').onclick = async () => { const pr = new firebase.auth.GoogleAuthProvider(); pr.setCustomParameters({ prompt: 'select_account' });
    try { await auth.signInWithPopup(pr); location.reload(); } catch (e) { if (e && /popup/.test(e.code || '')) { auth.signInWithRedirect(pr); return; } msg('Couldn\'t sign in: ' + ((e && e.message) || e)); } };
  document.getElementById('si-f').onsubmit = async e => { e.preventDefault(); const em = document.getElementById('si-e').value.trim().toLowerCase(); if (!em) return;
    try { await auth.sendSignInLinkToEmail(em, { url: location.origin + location.pathname, handleCodeInApp: true }); try { localStorage.setItem('dnd-signin-email', em); localStorage.setItem('dnd-signin-back', location.href); } catch (x) {}
      msg(`<b>Check your email</b> (${em}) for a sign-in link and open it on this device. If it isn't there in a minute, look in Spam.`); } catch (x) { msg('Couldn\'t send the link: ' + ((x && x.message) || x)); } };
}

// ================= The hub, and the admin section =================
function hub(fs, auth, G, ctx) {
  const { EMAIL, IS_ADMIN, IS_OWNER, user, signOut, ME, page } = ctx; let ADMINS = ctx.ADMINS || [];
  const OPEN = 'dnd-hub-open:' + G;
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const ago = t => { if (!t) return ''; const s = (Date.now() - t) / 1000; return s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + 'm ago' : s < 86400 ? Math.floor(s / 3600) + 'h ago' : Math.floor(s / 86400) + 'd ago'; };
  const day = t => t ? new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const base = location.pathname, HUB = base + '?g=' + G, ADMIN_URL = HUB + '&admin=1';
  const ADMIN = page === 'admin';
  document.title = ADMIN ? 'Admin — Adventurer’s Tome' : 'Adventurer’s Tome';
  document.body.innerHTML = '<div id="hub"></div><div id="hub-modal" class="hub-modal"></div><div id="hub-toast" class="hub-toast"></div>';
  document.body.className = 'hubbody' + (ADMIN ? ' adminbody' : '');
  const root = document.getElementById('hub'), modal = document.getElementById('hub-modal');
  let chars = [], open = {}, view = 'mine';
  try { open = JSON.parse(ls.get(OPEN) || '{}'); } catch (e) {}
  const toast = t => { const el = document.getElementById('hub-toast'); el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2600); };
  const usersCol = fs.collection('users'), charsCol = fs.collection('groups/' + G + '/chars'), sheets = fs.collection('sheets');
  const FV = firebase.firestore.FieldValue;
  // Names come from each account's own record, looked up only when needed and remembered for this visit.
  const UC = {}, NAMES = {};
  const remember = (em, u) => { UC[em] = Promise.resolve(u); if (u && u.name) NAMES[em] = u.name; };
  const userDoc = em => UC[em] || (UC[em] = usersCol.doc(em).get().then(x => { const d = x.exists ? x.data() : null; if (d && d.name) NAMES[em] = d.name; return d; }, () => null));
  const nameOf = em => NAMES[em] || em;
  const needNames = ems => Promise.all([...new Set(ems.filter(Boolean))].map(userDoc));
  if (ME) remember(EMAIL, ME);
  const myName = () => NAMES[EMAIL] || user.displayName || EMAIL.split('@')[0];
  const isMine = c => (c.owner || '') === EMAIL;
  const close = () => modal.classList.remove('on');
  const pic = c => c.thumb ? `<img class="hc-pic" src="${esc(c.thumb)}" alt="">` : `<span class="hc-pic hc-nopic">${esc((c.name || '?')[0])}</span>`;
  // The wordmark: a gold d20 crest beside "Adventurer's" in spaced small caps over a large serif "Tome".
  const shareIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';

  // ----- actions on one character (used by the hub's menus and the admin section) -----
  // Who else can open a character: everyone in "viewers" can look; those also in "editors" can change it.
  async function setAccess(c, V, E) {
    const acc = { viewers: V, editors: E.filter(x => V.includes(x)) };
    const s0 = await sheets.doc(c.id).get(); const n = Number(s0.exists && s0.data().n) || 1;
    await sheets.doc(c.id).update(acc); for (let k = 1; k < n; k++) await sheets.doc(c.id + '_p' + k).update(acc).catch(() => {});
    await charsCol.doc(c.id).set(acc, { merge: true }); Object.assign(c, acc);
  }
  async function giveTo(c, o) {
    try { await userDoc(o); const s = await sheets.doc(c.id).get(); const n = Number(s.exists && s.data().n) || 1; await sheets.doc(c.id).update({ owner: o }); for (let k = 1; k < n; k++) await sheets.doc(c.id + '_p' + k).update({ owner: o }).catch(() => {});
      await charsCol.doc(c.id).set({ owner: o, player: nameOf(o), playerSet: Date.now() }, { merge: true }); c.owner = o; c.player = nameOf(o); toast('Moved to ' + nameOf(o) + '.'); return true; } catch (x) { toast('Couldn\'t move it: ' + (x.message || x)); return false; } }
  function shareChar(c, back) {
    let V = [...(c.viewers || [])], E = [...(c.editors || [])];
    const paint = () => {
      modal.innerHTML = `<div class="hub-card wide"><h2>Share ${esc(c.name || 'this character')}</h2><p class="hub-hint">They'll find it under “Shared characters” after signing in with that email.</p>
        <div class="pl-list">${V.map(em => `<div class="pl-row"><span class="sh-who">${NAMES[em] ? `<b>${esc(NAMES[em])}</b> ` : ''}<span>${esc(em)}</span></span><select data-acc="${esc(em)}"><option value="view">Can view</option><option value="edit"${E.includes(em) ? ' selected' : ''}>Can edit</option></select><button class="linkbtn" data-rm="${esc(em)}">remove</button></div>`).join('') || '<p class="hub-hint">Not shared with anyone yet.</p>'}</div>
        <form id="sh-f" class="who-f pl-f sh-f"><input id="sh-e" type="email" placeholder="Their email address" autocomplete="off" required><select id="sh-a"><option value="view">Can view</option><option value="edit">Can edit</option></select><button class="btn gold">Share</button></form>
        <button class="btn ghost" id="sh-x">Done</button></div>`;
      modal.classList.add('on');
      const save = async (nv, ne, msg) => { try { await setAccess(c, nv, ne); V = c.viewers; E = c.editors; if (msg) toast(msg); paint(); if (back && back.refresh) back.refresh(); } catch (x) { toast('Couldn\'t change sharing: ' + (x.message || x)); } };
      modal.querySelector('#sh-f').onsubmit = e => { e.preventDefault(); const em = modal.querySelector('#sh-e').value.trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast('Type an email address.'); return; } if (em === c.owner) { toast('That’s the owner.'); return; }
        const ed = modal.querySelector('#sh-a').value === 'edit'; save([...V.filter(x => x !== em), em], ed ? [...E.filter(x => x !== em), em] : E.filter(x => x !== em), 'Shared with ' + nameOf(em) + '.'); };
      modal.querySelectorAll('[data-acc]').forEach(sel => sel.onchange = () => { const em = sel.dataset.acc; save(V, sel.value === 'edit' ? [...E.filter(x => x !== em), em] : E.filter(x => x !== em)); });
      modal.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { const em = b.dataset.rm; save(V.filter(x => x !== em), E.filter(x => x !== em), 'Stopped sharing with ' + nameOf(em) + '.'); });
      modal.querySelector('#sh-x').onclick = () => { close(); if (back) back(); };
    };
    needNames(V).then(paint);
  }
  // Admins: find an account by name or email (one indexed lookup however many accounts there are).
  async function findUsers(q, after) { q = String(q || '').trim().toLowerCase().slice(0, 24);
    let qq = q ? usersCol.where('keys', 'array-contains', q).limit(25) : usersCol.orderBy('createdAt', 'desc').limit(25); if (after) qq = qq.startAfter(after);
    const r = await qq.get(); r.docs.forEach(d => remember(d.id, d.data())); return r; }
  function pickUser(title, hint, done) {
    modal.innerHTML = `<div class="hub-card wide"><h2>${esc(title)}</h2><p class="hub-hint">${esc(hint)}</p><input id="pu-q" class="ad-search" placeholder="Search by name or email" autocomplete="off"><div class="pl-list" id="pu-l"></div><button class="btn ghost" id="pu-x">Cancel</button></div>`;
    modal.classList.add('on'); const q = modal.querySelector('#pu-q'), l = modal.querySelector('#pu-l'); let t = null;
    const show = async () => { const v = q.value.trim().toLowerCase(); try { const r = await findUsers(v); const rows = r.docs.map(d => [d.id, d.data().name]);
        if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) && !rows.some(x => x[0] === v)) rows.push([v, '']);
        l.innerHTML = rows.map(([em, n]) => `<button class="pl-row pu-row" data-pu="${esc(em)}"><b>${esc(n || 'No account yet')}</b><span>${esc(em)}</span></button>`).join('') || '<p class="hub-hint">Nobody matches.</p>';
        l.querySelectorAll('[data-pu]').forEach(b => b.onclick = () => { close(); done(b.dataset.pu); }); } catch (x) { l.innerHTML = `<p class="hub-hint">Couldn't search (${esc(x.code || x.message || x)}).</p>`; } };
    q.oninput = () => { clearTimeout(t); t = setTimeout(show, 250); }; modal.querySelector('#pu-x').onclick = close; q.focus(); show();
  }
  function moveChar(c, after) { pickUser('Give ' + (c.name || 'this character') + ' to…', 'They’ll own it; the current owner won’t be able to open it anymore unless it’s shared with them.', async o => { if (o && o !== c.owner && await giveTo(c, o) && after) after(); }); }
  function removeChar(c, after) {
    modal.innerHTML = `<div class="hub-card"><h2>Remove ${esc(c.name || 'this character')} from the list?</h2><p class="hub-hint">The character itself isn't deleted — opening its link puts it back.</p>
      <div class="row"><button class="btn ghost" id="rm-x">Cancel</button><button class="btn red" id="rm-ok">Remove from list</button></div></div>`;
    modal.classList.add('on');
    modal.querySelector('#rm-ok').onclick = async () => { await charsCol.doc(c.id).delete(); chars = chars.filter(x => x.id !== c.id); toast('Removed from the list.'); close(); if (after) after(); };
    modal.querySelector('#rm-x').onclick = close;
  }
  // Deleting is for the owner (or an admin), never for people it's only shared with. It's permanent, so they type the
  // character's name to confirm.
  const canDelete = c => IS_ADMIN || (c.owner || '') === EMAIL;
  function deleteChar(c, after) {
    if (!canDelete(c)) return;
    const want = String(c.name || '').trim() || 'DELETE';
    modal.innerHTML = `<div class="hub-card"><h2>Delete ${esc(c.name || 'this character')}?</h2>
      <p class="hub-hint">This permanently deletes the character${(c.viewers || []).length ? ', including for everyone it’s shared with' : ''}. It can’t be undone.</p>
      <label class="del-l">Type <b>${esc(want)}</b> to confirm<input id="del-q" class="ad-search" autocomplete="off" spellcheck="false"></label>
      <div class="row"><button class="btn ghost" id="del-x">Cancel</button><button class="btn red" id="del-ok" disabled>Delete forever</button></div></div>`;
    modal.classList.add('on'); const q = modal.querySelector('#del-q'), ok = modal.querySelector('#del-ok');
    const match = () => q.value.trim().toLowerCase() === want.toLowerCase();
    q.oninput = () => { ok.disabled = !match(); }; q.onkeydown = e => { if (e.key === 'Enter' && match()) ok.click(); }; q.focus();
    modal.querySelector('#del-x').onclick = close;
    ok.onclick = async () => { if (!match()) return; ok.disabled = true; ok.textContent = 'Deleting…';
      try { const s0 = await sheets.doc(c.id).get(); const n = Number(s0.exists && s0.data().n) || 1;
        for (let k = 1; k < n; k++) await sheets.doc(c.id + '_p' + k).delete().catch(() => {});
        if (s0.exists) await sheets.doc(c.id).delete(); await charsCol.doc(c.id).delete();
        ['dnd-pages-cache:', 'dnd-sheet-ui:'].forEach(k => { try { localStorage.removeItem(k + c.id); } catch (e) {} });
        chars = chars.filter(x => x.id !== c.id); close(); toast((c.name || 'The character') + ' was deleted.'); if (after) after(); }
      catch (x) { ok.textContent = 'Delete forever'; ok.disabled = false; toast(x && x.code === 'permission-denied' ? 'Only the owner (or an admin) can delete it — if you are, the new database rules still need publishing.' : 'Couldn\'t delete it: ' + ((x && x.message) || x)); } };
  }
  document.addEventListener('click', e => { if (e.target === modal) close(); });

  if (ADMIN) return adminSection();

  // ================= Hub: my characters and the ones shared with me =================
  function createChar() { location.href = base + '?new=1&g=' + G + '&p=' + encodeURIComponent(myName()); }
  function card(c) {
    const acc = (c.editors || []).includes(EMAIL) ? '<span class="hc-acc edit">Can edit</span>' : '<span class="hc-acc">View only</span>';
    return `<div class="hc${c.pin && isMine(c) ? ' pinned' : ''}"><a class="hc-main" href="${esc(base + '?c=' + c.id)}">${pic(c)}
      <span class="hc-txt"><b>${esc(c.name || 'Unnamed character')}</b><span>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}</span>
      <small>${c.updatedAt ? 'Updated ' + ago(c.updatedAt) + (c.by ? ' by ' + esc(c.by) : '') : ''}</small>${acc}</span></a>
      ${IS_ADMIN ? `<div class="hc-menu"><button class="hc-dots" aria-label="More">⋯</button><div class="hc-list">
        <button data-a="share" data-id="${esc(c.id)}">Share…</button><button data-a="move" data-id="${esc(c.id)}">Give to another player</button><button data-a="rm" data-id="${esc(c.id)}">Remove from list</button><button data-a="del" data-id="${esc(c.id)}" class="hc-del">Delete character…</button></div></div>` : ''}</div>`;
  }
  const shareNote = c => { const n = (c.viewers || []).length; return n ? `Shared with ${n} · ` : ''; };
  // Pinned first; then each player's own order (drag to change), then most recently updated.
  const ord = (a, b) => (!!b.pin - !!a.pin) || ((a.order != null ? a.order : 1e9) - (b.order != null ? b.order : 1e9)) || ((b.updatedAt || 0) - (a.updatedAt || 0));
  function row(c) {
    return `<div class="hr${c.pin ? ' pinned' : ''}" data-id="${esc(c.id)}" data-pin="${c.pin ? 1 : 0}"><span class="hr-grip" title="Drag to reorder" aria-label="Drag to reorder">⠿</span>
      <a class="hr-main" href="${esc(base + '?c=' + c.id)}">${pic(c)}
      <span class="hc-txt"><b>${esc(c.name || 'Unnamed character')}</b><span>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}</span>
      <small>${shareNote(c)}${c.updatedAt ? 'Updated ' + ago(c.updatedAt) + (c.by ? ' by ' + esc(c.by) : '') : ''}</small></span></a>
      <button class="hr-pin hr-share" data-share-id="${esc(c.id)}" title="Share">${shareIcon}</button><button class="hr-pin hr-del" data-del-id="${esc(c.id)}" title="Delete" aria-label="Delete ${esc(c.name || 'character')}"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button><button class="hr-pin${c.pin ? ' on' : ''}" data-pin-id="${esc(c.id)}" title="${c.pin ? 'Unpin' : 'Pin to the top'}" aria-pressed="${!!c.pin}"><svg viewBox="0 0 24 24" width="18" height="18" fill="${c.pin ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 3h6l-1 6 4 4H6l4-4z"/><path d="M12 13v8"/></svg></button></div>`;
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
    shared.forEach(c => { const k = NAMES[c.owner] || (c.player || '').trim() || c.owner || 'No player yet'; (groups[k] = groups[k] || []).push(c); });
    const keys = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    const byName = (a, b) => (a.name || '').localeCompare(b.name || '');
    const body = SH
      ? (keys.length ? keys.map(k => { const isOpen = open[k] != null ? open[k] : true; return `<details class="hub-folder" data-k="${esc(k)}" ${isOpen ? 'open' : ''}><summary><span class="hf-caret">▸</span><span class="hf-name">${esc(k)}</span><span class="hf-n">${groups[k].length}</span></summary>
        <div class="hf-body">${groups[k].sort(byName).map(card).join('')}</div></details>`; }).join('')
        : `<p class="hub-empty">Nothing has been shared with you yet. When another player shares a character with ${esc(EMAIL)}, it shows up here.</p>`)
      : (mine.length ? `<div class="hl">${mine.sort(ord).map(row).join('')}</div>` : `<p class="hub-empty">You don’t have any characters yet — create one, or ask whoever has yours to give it to you.</p>`);
    root.innerHTML = `<header class="hub-top">${logoHTML()}
      <div class="hub-me">Signed in as <b>${esc(myName())}</b> <span class="hub-em">${esc(EMAIL)}</span> · <button class="linkbtn" id="me-out">Sign out</button></div></header>
      <div class="hub-views"><button class="${SH ? '' : 'on'}" data-view="mine">My characters <span>${mine.length}</span></button><button class="${SH ? 'on' : ''}" data-view="shared">Shared characters <span>${shared.length}</span></button>${IS_ADMIN ? '<button class="btn hub-admin" id="hub-admin">⚙ Admin</button>' : ''}</div>
      ${SH ? '' : '<div class="hub-bar"><button class="btn gold big" id="hub-new">＋ Create character</button></div>'}
      ${body}`;
    const nb = root.querySelector('#hub-new'); if (nb) nb.onclick = createChar;
    root.querySelector('#me-out').onclick = signOut;
    const ab = root.querySelector('#hub-admin'); if (ab) ab.onclick = () => { location.href = ADMIN_URL; };
    root.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { view = b.dataset.view; draw(); });
    root.querySelectorAll('[data-pin-id]').forEach(b => b.onclick = e => { e.preventDefault(); togglePin(b.dataset.pinId); });
    root.querySelectorAll('[data-del-id]').forEach(b => b.onclick = e => { e.preventDefault(); const c = chars.find(x => x.id === b.dataset.delId); if (c) deleteChar(c, draw); });
    root.querySelectorAll('[data-share-id]').forEach(b => b.onclick = e => { e.preventDefault(); const c = chars.find(x => x.id === b.dataset.shareId); if (c) shareChar(c); });
    root.querySelectorAll('details.hub-folder').forEach(d => d.addEventListener('toggle', () => { open[d.dataset.k] = d.open; ls.set(OPEN, JSON.stringify(open)); }));
    root.querySelectorAll('.hc-dots').forEach(b => b.onclick = e => { e.stopPropagation(); const w = b.parentElement, on = !w.classList.contains('on'); root.querySelectorAll('.hc-menu.on').forEach(x => x.classList.remove('on')); w.classList.toggle('on', on); });
    root.querySelectorAll('.hc-list [data-a]').forEach(b => b.onclick = () => { const c = chars.find(x => x.id === b.dataset.id); b.closest('.hc-menu').classList.remove('on'); if (!c) return;
      if (b.dataset.a === 'share') shareChar(c); if (b.dataset.a === 'move') moveChar(c, draw); if (b.dataset.a === 'rm') removeChar(c, draw); if (b.dataset.a === 'del') deleteChar(c, draw); });
  }
  wireDie(root);
  document.addEventListener('click', () => root.querySelectorAll('.hc-menu.on').forEach(x => x.classList.remove('on')));
  draw();
  // Everyone — admins too — sees their own characters plus the ones shared with them. Admins find the rest in Admin.
  const lists = {}, merge = () => { const m = new Map(); Object.values(lists).forEach(l => l.forEach(c => m.set(c.id, c))); chars = [...m.values()]; if (!RD) draw();
    needNames(chars.filter(c => !isMine(c)).map(c => c.owner)).then(() => { if (!RD) draw(); }); };
  const failed = e => { root.innerHTML = `<p class="hub-empty">Couldn't load the character list (${esc(e.code || e.message || e)}).<br><br>Signed in as ${esc(EMAIL)} · <button class="linkbtn" onclick="pgSignOut()">Sign out</button></p>`; console.error(e); };
  const watch = (k, q) => q.onSnapshot(qs => { lists[k] = qs.docs.map(d => Object.assign({ id: d.id }, d.data())); merge(); }, failed);
  watch('mine', charsCol.where('owner', '==', EMAIL)); watch('shared', charsCol.where('viewers', 'array-contains', EMAIL));
  setInterval(() => { if (!RD) draw(); }, 60000);

  // ================= Admin section (its own page: ?g=…&admin=1) =================
  function adminSection() {
    const UREF = usersCol.doc(EMAIL); let CHECKED = Number(ME && ME.checkedAt) || 0;
    let TAB = new URLSearchParams(location.search).get('tab') || 'users';
    const TABS = [['users', 'Users'], ['chars', 'Characters'], ['admins', 'Admins'], ['new', 'New']];
    const CH = {}; // characters on screen, by id
    const setTab = t => { TAB = t; const u = new URL(location.href); u.searchParams.set('tab', t); history.replaceState(null, '', u); frame(); };
    let NEWN = null;
    function frame() {
      root.innerHTML = `<header class="hub-top ad-top"><div><a class="ad-back" href="${esc(HUB)}">← My characters</a><h1 class="hub-title">Admin</h1></div>
        <div class="hub-me">Signed in as <b>${esc(myName())}</b> <span class="hub-em">${esc(EMAIL)}</span> · <button class="linkbtn" id="me-out">Sign out</button></div></header>
        <nav class="hub-views ad-nav">${TABS.map(([k, t]) => `<button class="${TAB === k ? 'on' : ''}" data-tab="${k}">${t}${k === 'new' && NEWN ? ` <span>${NEWN}</span>` : ''}</button>`).join('')}</nav>
        <section id="ad-body" class="ad-page"><p class="hub-hint">Loading…</p></section>`;
      root.querySelector('#me-out').onclick = signOut;
      root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => setTab(b.dataset.tab));
      ({ new: tabNew, users: tabUsers, chars: tabChars, admins: tabAdmins })[TAB]();
    }
    const B = () => root.querySelector('#ad-body');
    // One character as a row: what it is, whose it is, whether it's shared with you, and what you can do with it.
    const myAccess = c => isMine(c) ? 'own' : (c.editors || []).includes(EMAIL) ? 'edit' : (c.viewers || []).includes(EMAIL) ? 'view' : '';
    function crow(c, showOwner = true) { CH[c.id] = c; const a = myAccess(c);
      return `<div class="ad-row" data-cid="${esc(c.id)}">${pic(c)}
        <div class="ad-main"><b>${esc(c.name || 'Unnamed character')}</b><small>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}${showOwner ? ' · <span class="ad-own-n">' + esc(nameOf(c.owner || '')) + '</span>' : ''}${c.createdAt ? ' · made ' + esc(ago(c.createdAt)) : ''}${c.updatedAt ? ' · updated ' + esc(ago(c.updatedAt)) : ''}${(c.viewers || []).length ? ' · shared with ' + c.viewers.length : ''}</small></div>
        ${a === 'own' ? '<span class="ad-mine">Yours</span>' : `<label class="ad-me"><span>Shared with you</span><select data-me="${esc(c.id)}"><option value="">No</option><option value="view"${a === 'view' ? ' selected' : ''}>Can view</option><option value="edit"${a === 'edit' ? ' selected' : ''}>Can edit</option></select></label>`}
        <div class="ad-acts"><a class="btn sm" href="${esc(base + '?c=' + c.id)}">Open</a><button class="btn sm" data-ash="${esc(c.id)}">Share…</button><button class="btn sm" data-agive="${esc(c.id)}">Give to…</button><button class="btn sm ghost" data-arm="${esc(c.id)}" title="Take it off the lists without deleting it">Remove</button><button class="btn sm ghost ad-del" data-adel="${esc(c.id)}">Delete</button></div></div>`; }
    function wire(el, redo) {
      el.querySelectorAll('[data-me]').forEach(sl => sl.onchange = async () => { const c = CH[sl.dataset.me]; if (!c) return; const v = sl.value;
        const V = (c.viewers || []).filter(x => x !== EMAIL), E = (c.editors || []).filter(x => x !== EMAIL);
        try { await setAccess(c, v ? [...V, EMAIL] : V, v === 'edit' ? [...E, EMAIL] : E); toast(v ? (c.name || 'It') + ' is shared with you (' + (v === 'edit' ? 'can edit' : 'view only') + ').' : 'Stopped sharing ' + (c.name || 'it') + ' with you.'); }
        catch (x) { toast('Couldn\'t change it: ' + (x.message || x)); sl.value = myAccess(c) === 'own' ? '' : myAccess(c); } });
      el.querySelectorAll('[data-ash]').forEach(b => b.onclick = () => { const c = CH[b.dataset.ash]; if (c) shareChar(c, Object.assign(() => {}, { refresh: redo })); });
      el.querySelectorAll('[data-agive]').forEach(b => b.onclick = () => { const c = CH[b.dataset.agive]; if (c) moveChar(c, redo); });
      el.querySelectorAll('[data-arm]').forEach(b => b.onclick = () => { const c = CH[b.dataset.arm]; if (c) removeChar(c, redo); });
      el.querySelectorAll('[data-adel]').forEach(b => b.onclick = () => { const c = CH[b.dataset.adel]; if (c) deleteChar(c, redo); });
    }
    const docs = r => r.docs.map(d => Object.assign({ id: d.id }, d.data()));
    const failMsg = x => `<p class="hub-hint">Couldn't load this (${esc((x && (x.code || x.message)) || x)}). If it says permissions, the new database rules haven't been published yet.</p>`;

    // --- New: accounts and characters since you last checked ---
    async function tabNew() {
      const el = B();
      try {
        const [ur, cr] = await Promise.all([usersCol.where('createdAt', '>', CHECKED).orderBy('createdAt', 'desc').limit(50).get(), charsCol.where('createdAt', '>', CHECKED).orderBy('createdAt', 'desc').limit(100).get()]);
        const us = docs(ur); us.forEach(u => remember(u.id, u));
        const fresh = new Set(us.map(u => u.id)), byUser = {};
        await Promise.all(us.map(async u => { byUser[u.id] = docs(await charsCol.where('owner', '==', u.id).limit(50).get()); }));
        const others = docs(cr).filter(c => !fresh.has(c.owner)); await needNames(others.map(c => c.owner));
        const n = us.length + others.length; if (NEWN !== n) { NEWN = n; const t = root.querySelector('[data-tab="new"]'); if (t) t.innerHTML = 'New' + (n ? ` <span>${n}</span>` : ''); }
        el.innerHTML = `${n ? '<div class="ad-bar ad-bar-r"><button class="btn gold" id="ad-seen">Mark as read</button></div>' : ''}
          <h3 class="ad-h">New accounts <span>${us.length}${us.length === 50 ? '+' : ''}</span></h3>
          ${us.length ? us.map(u => `<div class="ad-user"><div class="ad-uhead"><b>${esc(u.name || u.id)}</b><span>${esc(u.id)}</span><small>joined ${esc(ago(u.createdAt))}</small></div>
            <div class="ad-list">${byUser[u.id].length ? byUser[u.id].map(c => crow(c, false)).join('') : '<p class="hub-hint ad-none">No characters yet.</p>'}</div></div>`).join('') : '<p class="hub-hint">No new accounts.</p>'}
          <h3 class="ad-h">New characters from existing players <span>${others.length}</span></h3>
          <div class="ad-list">${others.length ? others.map(c => crow(c)).join('') : '<p class="hub-hint">None.</p>'}</div>`;
        wire(el, tabNew);
        const sb = el.querySelector('#ad-seen'); if (sb) sb.onclick = async () => { const t = Date.now(); try { await UREF.update({ checkedAt: t }); CHECKED = t; NEWN = 0; toast('Marked as read.'); frame(); } catch (x) { toast('Couldn\'t save that: ' + (x.message || x)); } };
      } catch (x) { el.innerHTML = failMsg(x); }
    }

    // --- Users: search by name or email; open someone to see and manage their characters ---
    let UQ = '', ULAST = null, UROWS = [];
    async function tabUsers(more) {
      const el = B();
      if (!more) { el.innerHTML = `<input id="ad-uq" class="ad-search" placeholder="Search players by name or email" value="${esc(UQ)}" autocomplete="off"><div id="ad-ul" class="ad-ulist"><p class="hub-hint">Loading…</p></div>`;
        const q = el.querySelector('#ad-uq'); let t = null; q.oninput = () => { clearTimeout(t); t = setTimeout(() => { UQ = q.value; ULAST = null; UROWS = []; tabUsersList(); }, 250); }; if (!UQ) q.focus(); }
      tabUsersList(more);
    }
    async function tabUsersList(more) {
      const l = B().querySelector('#ad-ul'); if (!l) return;
      try { const r = await findUsers(UQ, more ? ULAST : null); ULAST = r.docs[r.docs.length - 1] || ULAST; UROWS = (more ? UROWS : []).concat(docs(r));
        const rows = UQ ? UROWS.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')) : UROWS;
        l.innerHTML = (rows.map(u => `<div class="ad-user" data-u="${esc(u.id)}"><div class="ad-uhead"><input class="ad-name" data-uname="${esc(u.id)}" value="${esc(u.name || '')}" maxlength="60" aria-label="Name for ${esc(u.id)}"><span>${esc(u.id)}</span><small>joined ${esc(day(u.createdAt))}${u.seenAt ? ' · seen ' + esc(ago(u.seenAt)) : ''}${ADMINS.includes(u.id) || u.id === ADMIN_EMAIL ? ' · admin' : ''}</small><button class="btn sm" data-uc="${esc(u.id)}">Characters ▸</button></div><div class="ad-list ad-uchars"></div></div>`).join('') || `<p class="hub-hint">${UQ ? 'Nobody matches “' + esc(UQ) + '”.' : 'No accounts yet.'}</p>`)
          + (r.docs.length === 25 ? '<button class="btn ad-more" id="ad-umore">Load more</button>' : '');
        const mb = l.querySelector('#ad-umore'); if (mb) mb.onclick = () => tabUsers(true);
        l.querySelectorAll('[data-uname]').forEach(inp => inp.onchange = async () => { const em = inp.dataset.uname, n = inp.value.trim().slice(0, 60); if (!n) return;
          try { await usersCol.doc(em).update({ name: n, nameLower: n.toLowerCase(), keys: searchKeys(n, em.split('@')[0], em) }); remember(em, Object.assign({}, await UC[em], { name: n })); toast('Renamed to ' + n + '.'); } catch (x) { toast('Couldn\'t rename: ' + (x.message || x)); } });
        l.querySelectorAll('[data-uc]').forEach(b => b.onclick = async () => { const box = b.closest('.ad-user').querySelector('.ad-uchars'), em = b.dataset.uc;
          if (box.dataset.on) { box.innerHTML = ''; delete box.dataset.on; b.textContent = 'Characters ▸'; return; } box.dataset.on = 1; b.textContent = 'Characters ▾';
          const fill = async () => { box.innerHTML = '<p class="hub-hint">Loading…</p>'; try { const cs = docs(await charsCol.where('owner', '==', em).limit(100).get());
            box.innerHTML = (cs.length ? cs.sort((x, y) => (y.updatedAt || 0) - (x.updatedAt || 0)).map(c => crow(c, false)).join('') : '<p class="hub-hint ad-none">No characters yet.</p>')
              + `<a class="btn sm ad-newfor" href="${esc(base + '?new=1&g=' + G + '&o=' + encodeURIComponent(em) + '&p=' + encodeURIComponent(nameOf(em)))}">＋ New character for ${esc(nameOf(em))}</a>`; wire(box, fill); } catch (x) { box.innerHTML = failMsg(x); } };
          fill(); });
      } catch (x) { l.innerHTML = failMsg(x); }
    }

    // --- Characters: newest activity first, or search by character name ---
    let CQ = '', CLAST = null, CROWS = [];
    async function tabChars(more) {
      const el = B();
      if (!more) { el.innerHTML = `<input id="ad-cq" class="ad-search" placeholder="Search characters by name" value="${esc(CQ)}" autocomplete="off"><div id="ad-cl" class="ad-list"><p class="hub-hint">Loading…</p></div>`;
        const q = el.querySelector('#ad-cq'); let t = null; q.oninput = () => { clearTimeout(t); t = setTimeout(() => { CQ = q.value; CLAST = null; CROWS = []; tabCharsList(); }, 250); }; }
      tabCharsList(more);
    }
    async function tabCharsList(more) {
      const l = B().querySelector('#ad-cl'); if (!l) return; const q = CQ.trim().toLowerCase().slice(0, 24);
      try { let qq = q ? charsCol.where('keys', 'array-contains', q).limit(25) : charsCol.orderBy('updatedAt', 'desc').limit(25); if (more && CLAST) qq = qq.startAfter(CLAST);
        const r = await qq.get(); CLAST = r.docs[r.docs.length - 1] || CLAST; CROWS = (more ? CROWS : []).concat(docs(r)); await needNames(CROWS.map(c => c.owner));
        l.innerHTML = (CROWS.map(c => crow(c)).join('') || `<p class="hub-hint">${q ? 'No characters match “' + esc(CQ) + '”.' : 'No characters yet.'}</p>`) + (r.docs.length === 25 ? '<button class="btn ad-more" id="ad-cmore">Load more</button>' : '');
        wire(l, () => tabChars()); const mb = l.querySelector('#ad-cmore'); if (mb) mb.onclick = () => tabChars(true);
      } catch (x) { l.innerHTML = failMsg(x); }
    }

    // --- Admins ---
    async function tabAdmins() {
      const el = B(); await needNames([ADMIN_EMAIL, ...ADMINS]); const cfg = fs.collection('config').doc('admins');
      el.innerHTML = `<p class="hub-hint">Admins can open, edit, share and move every character, and see new accounts here.${IS_OWNER ? '' : ' Only ' + esc(ADMIN_EMAIL) + ' can change who is an admin.'}</p>
        <div class="pl-list"><div class="pl-row"><b>${esc(nameOf(ADMIN_EMAIL))}</b><span>${esc(ADMIN_EMAIL)}</span><small class="ad-n">always</small></div>
        ${ADMINS.filter(em => em !== ADMIN_EMAIL).map(em => `<div class="pl-row"><b>${esc(NAMES[em] || '')}</b><span>${esc(em)}</span>${IS_OWNER ? `<button class="linkbtn" data-arm-admin="${esc(em)}">remove</button>` : ''}</div>`).join('')}</div>
        ${IS_OWNER ? '<button class="btn gold" id="ad-add">＋ Make someone an admin</button>' : ''}`;
      const ab = el.querySelector('#ad-add'); if (ab) ab.onclick = () => pickUser('Make an admin', 'They’ll be able to open and change every character.', async em => { if (!em || em === ADMIN_EMAIL) return;
        try { await cfg.set({ emails: FV.arrayUnion(em) }, { merge: true }); ADMINS = [...new Set(ADMINS.concat(em))]; toast(nameOf(em) + ' is now an admin.'); tabAdmins(); } catch (x) { toast('Couldn\'t add the admin: ' + (x.message || x)); } });
      el.querySelectorAll('[data-arm-admin]').forEach(b => b.onclick = async () => { const em = b.dataset.armAdmin; try { await cfg.set({ emails: FV.arrayRemove(em) }, { merge: true }); ADMINS = ADMINS.filter(x => x !== em); toast(em + ' is no longer an admin.'); tabAdmins(); } catch (x) { toast('Couldn\'t remove the admin: ' + (x.message || x)); } });
    }
    frame();
    // the count on "New" shows even while you're on another section
    if (TAB !== 'new') Promise.all([usersCol.where('createdAt', '>', CHECKED).limit(51).get(), charsCol.where('createdAt', '>', CHECKED).limit(101).get()]).then(([u, c]) => { const fresh = new Set(u.docs.map(d => d.id)); NEWN = u.size + c.docs.filter(d => !fresh.has(d.data().owner)).length; const t = root.querySelector('[data-tab="new"]'); if (t && NEWN) t.innerHTML = `New <span>${NEWN}</span>`; }, () => {});
  }
}
