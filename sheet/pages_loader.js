// Site loader. Addresses on adventurers-tome.web.app:
//   /                       your characters          /shared        characters shared with you
//   /login                  sign in                  /new           a brand-new character
//   /<player>/<character>   a character, e.g. /chad-brooker/hiro (old names keep working after a rename)
//   /c/<id>                 a character by its id    /admin[/users|characters|admins|new]   the admin section
// The github.io backup copy keeps the older ?c=<id> / ?g=<group> / ?new=1 addresses, and those still work here too.
// Everyone signs in once per device (Google, or a link emailed to them). Each character belongs to one email;
// the database only lets that player — and the DM — open or change it.
const ADMIN_EMAIL = 'matthewcbro@gmail.com';
// Every character lives in one library; the hub shows each person their own and the ones shared with them.
const DEFAULT_G = 'WLdUj_I3XrA_9VIP';
// Clean addresses everywhere except the github.io backup (which can't serve made-up paths).
const PRETTY = !/github\.io$/.test(location.hostname) && !window.PG_LEGACY;
const LEG = location.pathname.replace(/[^/]*$/, '');
// Addresses that belong to the site itself, never to a character.
// Opened from a home-screen icon: the address is left exactly as saved — changing it can step outside what the phone
// counts as "the app" and bring the browser's toolbar back.
const STANDALONE = (() => { try { return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches; } catch (e) { return false; } })();
const RESERVED = new Set(['shared', 'login', 'new', 'admin', 'c', 'a', 'icons', 'icon', 'index', 'index-html', 'version-json', 'users', 'help', 'settings']);
const slugify = s => String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const enc = encodeURIComponent;
const URLS = {
  hub: G => PRETTY ? '/' : LEG + '?g=' + G,
  shared: G => PRETTY ? '/shared' : LEG + '?g=' + G + '&view=shared',
  admin: (G, tab) => PRETTY ? '/admin' + (tab ? '/' + tab : '') : LEG + '?g=' + G + '&admin=1' + (tab ? '&tab=' + tab : ''),
  char: c => PRETTY ? (c.path ? '/' + c.path : '/c/' + c.id) : LEG + '?c=' + c.id,
  byId: id => PRETTY ? '/c/' + id : LEG + '?c=' + id,
  newChar: (G, o, p) => PRETTY ? '/new' + (o || p ? '?' + [o ? 'o=' + enc(o) : '', p ? 'p=' + enc(p) : ''].filter(Boolean).join('&') : '') : LEG + '?new=1&g=' + G + (o ? '&o=' + enc(o) : '') + (p ? '&p=' + enc(p) : ''),
};
// Search keys for an account or character: every prefix of each word (and of the whole name / email), so the admin
// pages can find "ryan", "o'neal" or "roneal1994@…" with one indexed lookup however many accounts there are.
function searchKeys(...parts) { const out = new Set(); parts.forEach(p => { p = String(p || '').toLowerCase().trim(); if (!p) return;
  new Set([p, ...p.split(/[\s@._'’-]+/)]).forEach(t => { t = t.slice(0, 24); for (let i = 1; i <= t.length; i++) out.add(t.slice(0, i)); }); }); return [...out].slice(0, 400); }
// A person's little picture: their chosen character portrait (or their first character's), else initials on a colour
// picked from their email so the same person always looks the same.
const escH = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const hueOf = t => [...String(t || '?')].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 360, 7);
const initials = (name, em) => String(name || em || '?').split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
// A person's picture: their initials on a colour (theirs, or one picked from their email), a character portrait, or an
// uploaded image — which, if it has a transparent background, is shown as-is with no circle or border.
const PG_SWATCH = ['#b4473a', '#d0743c', '#c9962b', '#7f9a35', '#2f8f62', '#24879a', '#3a6fb4', '#5a55b8', '#8a4cb0', '#b04c86', '#6b7280', '#2b3245'];
const okColor = c => /^#[0-9a-f]{6}$/i.test(c || '') ? c : '';
const inkOn = hex => { const n = parseInt(hex.slice(1), 16); return (.299 * (n >> 16 & 255) + .587 * (n >> 8 & 255) + .114 * (n & 255)) > 170 ? '#1b1406' : '#fff'; };
const avaOf = u => ({ pic: (u && u.pic) || '', color: okColor(u && u.picColor), clear: !!(u && u.pic && u.picClear) });
const avaStyle = (o, key) => { const c = okColor(o && o.color); return c ? `background:${c};color:${inkOn(c)}` : `--h:${hueOf(key)}`; };
function avaHTML(name, em, pic, cls = '', title = '', o = {}) { const clear = !!(pic && o.clear);
  return `<span class="pg-ava ${cls}${pic ? ' has-pic' : ''}${clear ? ' clear' : ''}" style="${pic ? '' : avaStyle(o, em || name)}"${title ? ` title="${escH(title)}"` : ''}>${pic ? `<img src="${escH(pic)}" alt="">` : escH(initials(name, em))}</span>`; }
const firstThumb = list => { const cs = list.filter(c => c.thumb).sort((a, b) => (a.createdAt || a.updatedAt || 9e15) - (b.createdAt || b.updatedAt || 9e15)); return (cs[0] && cs[0].thumb) || ''; };
// ================= The logo (sign-in page and character list) =================
// A gold d20 crest beside "Adventurer's" in spaced small caps over a large serif "Tome". Hovering the die rolls it:
// it tumbles, the face flickers, and it lands on a random number. It also rolls once by itself when the page loads.
const PG_DIE = { n: 20, rolled: false, rolling: false, over: true };
function logoHTML() { return `<h1 class="hub-logo" aria-label="Adventurer’s Tome"><svg class="hl-d20${PG_DIE.rolled && PG_DIE.n === 20 ? ' crit' : PG_DIE.rolled && PG_DIE.n === 1 ? ' fumble' : ''}" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="hlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1d58a"/><stop offset=".55" stop-color="#c9962b"/><stop offset="1" stop-color="#8a6420"/></linearGradient></defs><polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="rgba(201,150,43,.14)" stroke="url(#hlg)" stroke-width="4" stroke-linejoin="round"/><g fill="none" stroke="url(#hlg)" stroke-width="2.6" stroke-linejoin="round"><polygon points="50,24 73,63 27,63"/><path d="M50 4 L50 24 M91 27 L73 63 M91 73 L73 63 M50 96 L73 63 M50 96 L27 63 M9 73 L27 63 M9 27 L27 63 M9 27 L50 24 M91 27 L50 24"/></g><text x="50" y="55" text-anchor="middle" font-family="Georgia,serif" font-weight="800" font-size="15" class="hl-20">${PG_DIE.rolled ? PG_DIE.n : ''}</text></svg><span class="hl-txt"><span class="hl-a">Adventurer’s</span><span class="hl-t">Tome</span></span></h1>`; }
function rollDie(root) {
  const d = root.querySelector('.hl-d20'); if (!d || PG_DIE.rolling) return;
  PG_DIE.rolling = true; d.classList.remove('crit', 'fumble'); d.classList.add('hl-rolling');
  // One animation drives everything: the face flickers by the spin's own clock (fast, then slower and slower),
  // and the number lands only when the spin has actually finished — even if the page was busy when it started.
  const face = () => root.querySelector('.hl-20'), DUR = 1150;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anim = d.animate(still ? [{ transform: 'none' }, { transform: 'none' }] : [
    { offset: 0, transform: 'rotate(0deg) scale(1)', easing: 'cubic-bezier(.3,0,.6,1)' },
    { offset: .18, transform: 'rotate(150deg) scale(1.1) translateY(-4px)', easing: 'linear' },
    { offset: .5, transform: 'rotate(520deg) scale(1.06) translateY(-2px)', easing: 'cubic-bezier(.15,.6,.35,1)' },
    { offset: .84, transform: 'rotate(732deg) scale(.98)', easing: 'cubic-bezier(.4,0,.4,1)' },
    { offset: 1, transform: 'rotate(720deg) scale(1)' }], { duration: DUR, easing: 'linear' });
  let next = 0, done = false;
  const tick = () => { if (done) return; const el = Number(anim.currentTime) || 0;
    if (el >= next && el < DUR - 120) { const f = face(); if (f) f.textContent = 1 + Math.floor(Math.random() * 20); next = el + 45 + 230 * Math.pow(el / DUR, 2); }
    requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const land = () => { if (done) return; done = true;
    PG_DIE.n = 1 + Math.floor(Math.random() * 20); PG_DIE.rolled = true; const f = face(); if (f) f.textContent = PG_DIE.n;
    const dd = root.querySelector('.hl-d20') || d; dd.classList.remove('hl-rolling'); dd.classList.toggle('crit', PG_DIE.n === 20); dd.classList.toggle('fumble', PG_DIE.n === 1); PG_DIE.rolling = false; };
  anim.finished.then(land, land);
}
// Touchscreens (no mouse to hover with): hover effects are switched off so nothing lights up by itself; taps get their own feedback.
const TOUCH = (() => { try { return matchMedia('(hover: none)').matches; } catch (e) { return false; } })();
function noHover() {
  const split = sel => { const out = []; let d = 0, cur = ''; for (const ch of sel) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && !d) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out; };
  const walk = (list, owner) => { for (let i = list.length - 1; i >= 0; i--) { const r = list[i];
    if (r.selectorText != null) { if (!r.selectorText.includes(':hover')) continue; const keep = split(r.selectorText).filter(x => !x.includes(':hover')); if (keep.length) r.selectorText = keep.join(','); else owner.deleteRule(i); }
    else if (r.cssRules) walk(r.cssRules, r); } };
  for (const sh of document.styleSheets) { let rs; try { rs = sh.cssRules; } catch (e) { continue; } try { walk(rs, sh); } catch (e) {} } }
function wireDie(root) {
  // It rolls once by itself when the page appears; after that, moving onto it rolls it again.
  if (!PG_DIE.auto) { PG_DIE.auto = true; setTimeout(() => rollDie(root), 350); }
  // Only a real move onto the die rolls it — not the list redrawing underneath a resting pointer, or a page load.
  addEventListener('pointermove', () => { if (PG_DIE.over === true) PG_DIE.over = !!document.querySelector('.hl-d20:hover'); }, { once: true });
  root.addEventListener('mouseout', e => { const d = e.target.closest && e.target.closest('.hl-d20'); if (d && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.hl-d20'))) PG_DIE.over = false; });
  // a tap (or click) on the die rolls it too
  root.addEventListener('click', e => { if (e.target.closest && e.target.closest('.hl-d20')) rollDie(root); });
  root.addEventListener('mouseover', e => { if (TOUCH) return; const d = e.target.closest && e.target.closest('.hl-d20'); if (!d || PG_DIE.rolling || PG_DIE.over || (e.relatedTarget && d.contains(e.relatedTarget))) return;
    PG_DIE.over = true; rollDie(root); });
}
(async () => {
  const CFG = __CFG__, VER = '__VER__', ASSETS = __ASSETS__;
  const Q = new URLSearchParams(location.search), clean = v => (v || '').replace(/[^A-Za-z0-9_-]/g, '');
  // The "?v=…" an automatic update reload adds (so the browser fetches the new version) isn't kept in the address bar.
  if (Q.has('v')) { const u = new URL(location.href); u.searchParams.delete('v'); history.replaceState(history.state, '', u.pathname + u.search + u.hash); }
  let C = clean(Q.get('c')), G = clean(Q.get('g'));
  // Phone view on a computer: the sheet runs inside a phone-sized frame, so it looks exactly as it does on a phone.
  const FRAMED = window.top !== window && Q.has('pgframe'), PHONE_KEY = 'pg-phoneview';
  if (FRAMED) { window.PG_IN_PHONE = true; window.PG_FORCE_MOBILE = true; document.documentElement.classList.add('pg-inphone'); }
  window.pgPhoneView = on => { try { localStorage.removeItem(PHONE_KEY); on ? sessionStorage.setItem(PHONE_KEY, '1') : sessionStorage.removeItem(PHONE_KEY); } catch (e) {}
    if (FRAMED) { try { window.top.location.reload(); } catch (e) {} } else location.reload(); };
  const P = (Q.get('p') || '').slice(0, 60), O = (Q.get('o') || '').trim().toLowerCase().slice(0, 120);
  const LAST_G = 'dnd-hub-group';
  let NEWQ = !!Q.get('new'), ADMINQ = !!Q.get('admin'), TABQ = clean(Q.get('tab')), VIEWQ = Q.get('view') === 'shared' ? 'shared' : 'mine', LOGIN = false, SLUG = '', BAD = false;
  if (PRETTY) {
    const parts = location.pathname.split('/').filter(Boolean).map(x => { try { return decodeURIComponent(x); } catch (e) { return x; } });
    if (parts.length === 1 && parts[0] === 'index.html') parts.length = 0;
    if (!parts.length) {}
    else if (parts.length === 1 && parts[0] === 'shared') VIEWQ = 'shared';
    else if (parts.length === 1 && parts[0] === 'login') LOGIN = true;
    else if (parts.length === 1 && parts[0] === 'new') NEWQ = true;
    else if (parts[0] === 'admin' && parts.length <= 2) { ADMINQ = true; TABQ = clean(parts[1] || ''); }
    else if (parts[0] === 'c' && parts.length === 2) C = clean(parts[1]);
    else if (parts.length === 2) SLUG = slugify(parts[0]) + '/' + slugify(parts[1]); // older /player/character addresses
    else if (parts.length === 1 && slugify(parts[0])) SLUG = slugify(parts[0]);
    else BAD = true;
    if (!C && !SLUG) G = G || DEFAULT_G;
  }
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
  // On the new address, Google sign-in runs through the site itself, so Google's account picker says
  // "continue to adventurers-tome.web.app" (and Safari doesn't block it as a third-party sign-in).
  if (location.hostname === 'adventurers-tome.web.app') CFG.authDomain = location.hostname;
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
  if (!PRETTY && !C && !G && !NEWQ) { location.replace(location.pathname + '?g=' + (clean(lsGet(LAST_G)) || DEFAULT_G)); return; }
  if (!G && NEWQ) G = DEFAULT_G;
  // old-style addresses arriving here (bookmarks, the github.io handover) switch to the clean ones
  if (PRETTY && !STANDALONE && ['c', 'g', 'new', 'admin', 'view', 'tab'].some(k => Q.has(k))) {
    const keep = new URLSearchParams(); ['o', 'p'].forEach(k => { if (Q.get(k)) keep.set(k, Q.get(k)); });
    const to = C ? '/c/' + C : NEWQ ? '/new' + (keep.toString() ? '?' + keep : '') : ADMINQ ? '/admin' + (TABQ ? '/' + TABQ : '') : VIEWQ === 'shared' ? '/shared' : '/';
    history.replaceState(null, '', to); }
  if (BAD) { say(`There’s nothing at this address.<br><br><a href="/">Go to your characters</a>`); return; }
  const user = await new Promise(res => { const u = auth.onAuthStateChanged(x => { u(); res(x); }); });
  if (!user) { if (PRETTY && !LOGIN) { const here = location.pathname + location.search; history.replaceState(null, '', '/login' + (here !== '/' ? '?next=' + enc(here) : '')); } signIn(auth, say); return; }
  if (LOGIN) { const nx = Q.get('next') || '/'; location.replace(/^\/(?!\/)/.test(nx) ? nx : '/'); return; }
  const EMAIL = (user.email || '').toLowerCase(), IS_OWNER = EMAIL === ADMIN_EMAIL;
  let IS_ADMIN = IS_OWNER, ADMINS = [];
  try { const a = await fs.collection('config').doc('admins').get(); ADMINS = ((a.exists && a.data().emails) || []).map(x => String(x).toLowerCase()); if (ADMINS.includes(EMAIL)) IS_ADMIN = true; } catch (e) {}
  const doSignOut = () => auth.signOut().then(() => location.replace(PRETTY ? '/login' : location.href));
  // Signing out always asks first.
  const signOut = () => {
    if (document.querySelector('.pg-out')) return;
    const m = document.createElement('div'); m.className = 'pg-out';
    m.innerHTML = '<div class="pg-out-card" role="dialog" aria-modal="true" aria-labelledby="pg-out-h"><h2 id="pg-out-h">Sign out?</h2><p>You’ll need to sign in again to open your characters on this device.</p><div class="pg-out-row"><button class="pg-out-no">Cancel</button><button class="pg-out-yes">Sign out</button></div></div>';
    const close = () => { m.remove(); document.removeEventListener('keydown', key); };
    const key = e => { if (e.key === 'Escape') close(); };
    m.onclick = e => { if (e.target === m) close(); };
    m.querySelector('.pg-out-no').onclick = close;
    m.querySelector('.pg-out-yes').onclick = e => { e.target.disabled = true; e.target.textContent = 'Signing out…'; doSignOut(); };
    document.addEventListener('keydown', key); document.body.appendChild(m); m.querySelector('.pg-out-no').focus();
  };
  window.pgSignOut = signOut;
  // /<player>/<character>: find it among what this person may open (an admin: anyone's). "Doesn't exist" and
  // "isn't yours" look the same, so guessing addresses can't even confirm a character exists.
  if (SLUG) { const lib = fs.collection('groups/' + DEFAULT_G + '/chars'); let hits = [];
    // /character-name: the address book says which character it is (opening it still needs access to that character)
    if (!SLUG.includes('/')) { try { const r = await fs.collection('slugs').doc(SLUG).get(); if (r.exists && r.data().c) { const h = await lib.doc(r.data().c).get(); if (h.exists) hits = [h]; } } catch (e) {} }
    else try { if (IS_ADMIN) hits = (await lib.where('paths', 'array-contains', SLUG).get()).docs;
      else { const [a, b] = await Promise.all([lib.where('paths', 'array-contains', SLUG).where('owner', '==', EMAIL).get(), lib.where('viewers', 'array-contains', EMAIL).get()]);
        hits = a.docs.concat(b.docs.filter(d => (d.data().paths || []).includes(SLUG))); } } catch (e) { console.warn('find', e); }
    hits.sort((x, y) => ((y.data().path === SLUG) - (x.data().path === SLUG)) || ((y.data().updatedAt || 0) - (x.data().updatedAt || 0)));
    if (!hits.length) { say(`There’s no character at this address that you can open.<br><br><a href="/">Go to your characters</a><br><br><small style="font-weight:400">Signed in as ${EMAIL} · <a href="#" onclick="pgSignOut();return false">Sign out</a></small>`); return; }
    C = hits[0].id; G = DEFAULT_G; }
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
    let checking = false; const check = async () => { if (NEWV || checking) return; checking = true; try { const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' }); const v = (await r.json()).v; if (!v || v === VER || Q.get('v') === v) return; NEWV = v;
      if (!C && !NEWQ && !busy()) return go();
      if (document.getElementById('pg-upd')) return;
      const b = document.createElement('button'); b.id = 'pg-upd'; b.textContent = 'Updated — tap to reload'; b.onclick = () => { b.textContent = 'Saving…'; go(); }; document.body.appendChild(b);
      ['pointerdown', 'keydown', 'scroll'].forEach(ev => addEventListener(ev, idle, { passive: true })); idle(); } catch (e) {} finally { checking = false; } };
    setInterval(check, 30 * 1000); document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); else if (NEWV) go(); }); setTimeout(check, 3000); };
  if (G && !C && !NEWQ) { lsSet(LAST_G, G); if (ADMINQ && !IS_ADMIN && PRETTY) history.replaceState(null, '', '/');
    if (load) load.remove(); document.documentElement.classList.remove('pg-loading'); hub(fs, auth, G, { EMAIL, IS_ADMIN, IS_OWNER, ADMINS, user, signOut, ME, page: ADMINQ && IS_ADMIN ? 'admin' : 'hub', view: VIEWQ, tab: TABQ }); verCheck();
    // quietly warm the cache so opening a sheet from here is quick
    setTimeout(() => [ASSETS.data, ASSETS.app].forEach(u => { const l = document.createElement('link'); l.rel = 'prefetch'; l.href = u; document.head.appendChild(l); }), 2500); return; }

  // Phone view chosen on a wide screen: show the sheet in a phone frame instead of stretching the phone layout.
  // (asked for just now — it's used once, so reloading or coming back later shows the layout for this device again)
  let phoneOn = false; try { phoneOn = sessionStorage.getItem(PHONE_KEY) === '1'; sessionStorage.removeItem(PHONE_KEY); localStorage.removeItem(PHONE_KEY); } catch (e) {}
  if (C && !NEWQ && !FRAMED && phoneOn && innerWidth >= 640) {
    if (load) load.remove(); document.documentElement.classList.remove('pg-loading'); document.documentElement.classList.add('pg-phonehost');
    const u = new URL(location.href); u.searchParams.set('pgframe', '1'); u.searchParams.delete('v');
    document.body.innerHTML = `<div class="pgph"><div class="pgph-bar"><span class="pgph-t"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/></svg>Phone view</span>
      <button class="pgph-back" id="pgph-back"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="13" rx="1.6"/><path d="M8 21h8M12 17v4"/></svg>Back to desktop view</button></div>
      <div class="pgph-dev"><iframe class="pgph-f" src="${escH(u.pathname + u.search)}" title="Character sheet (phone view)"></iframe><div class="pgph-sb" hidden><div class="pgph-th"></div></div></div></div>`;
    document.getElementById('pgph-back').onclick = () => window.pgPhoneView(false);
    // a real phone's size (390 × 844); scaled down to fit if the window is shorter than that
    const dev = document.querySelector('.pgph-dev'), fit = () => { const k = Math.min(1, (innerHeight - 84) / 868); dev.style.transform = k < 1 ? `scale(${k})` : ''; }; addEventListener('resize', fit); fit();
    // the scrollbar beside the phone: mirrors the sheet's scrolling, can be dragged, and the mouse wheel anywhere scrolls the sheet
    const fr = document.querySelector('.pgph-f'), sb = document.querySelector('.pgph-sb'), th = sb.firstElementChild;
    const W = () => { try { return fr.contentWindow; } catch (e) { return null; } };
    const geo = () => { const w = W(); if (!w || !w.document || !w.document.documentElement) return null; const de2 = w.document.documentElement; return { w, max: Math.max(0, de2.scrollHeight - w.innerHeight), vis: w.innerHeight, all: de2.scrollHeight }; };
    const paintSb = () => { const g = geo(); if (!g || g.max < 2) { sb.hidden = true; return; } sb.hidden = false; const H = sb.clientHeight, h = Math.max(28, H * g.vis / g.all); th.style.height = h + 'px'; th.style.top = ((H - h) * (g.w.scrollY / g.max)) + 'px'; };
    let hooked = null; const hook = () => { const w = W(); if (!w || hooked === w) return; hooked = w; w.addEventListener('scroll', paintSb, { passive: true }); w.addEventListener('resize', paintSb); };
    fr.addEventListener('load', () => { hook(); paintSb(); }); setInterval(() => { hook(); paintSb(); }, 700);
    th.addEventListener('pointerdown', e => { e.preventDefault(); const g = geo(); if (!g) return; th.classList.add('drag'); th.setPointerCapture(e.pointerId);
      const y0 = e.clientY, s0 = g.w.scrollY, k = g.max / Math.max(1, sb.getBoundingClientRect().height - th.getBoundingClientRect().height);
      const mv = ev => g.w.scrollTo(0, s0 + (ev.clientY - y0) * k), up = () => { th.classList.remove('drag'); th.removeEventListener('pointermove', mv); th.removeEventListener('pointerup', up); th.removeEventListener('pointercancel', up); };
      th.addEventListener('pointermove', mv); th.addEventListener('pointerup', up); th.addEventListener('pointercancel', up); });
    sb.addEventListener('pointerdown', e => { if (e.target !== sb) return; const g = geo(); if (!g) return; const r = sb.getBoundingClientRect(); g.w.scrollBy({ top: (e.clientY < th.getBoundingClientRect().top ? -1 : 1) * g.vis * .9, behavior: 'smooth' }); });
    addEventListener('wheel', e => { const g = geo(); if (g) g.w.scrollBy(0, e.deltaY); }, { passive: true });
    verCheck(); return; }

  const rid = () => { const a = new Uint8Array(18); crypto.getRandomValues(a); return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const NEW = !C;
  if (NEW) C = rid();
  window.SHEET_PAGES = true; window.SHEET_CHAR = C;
  document.documentElement.classList.add('pg-sheetpage');
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
  let OWNER_NAME = ''; (OWNER === EMAIL || IS_ADMIN ? userDoc(OWNER) : Promise.resolve(null)).then(u => { OWNER_NAME = (u && u.name) || ''; if (OWNER_NAME) setTimeout(() => { try { syncPlayer(); } catch (e) {} }, 0); });
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
    // its clean address: /<character>, unique across the site; older ones keep working
    const pth = role() === 'owner' ? await pathFor(s) : '';
    if (pth) sum.path = pth;
    const key = JSON.stringify(sum); if (!changed && key === LASTSUM) return; // nothing on the card changed: skip the write
    try { await hubCol.doc(C).set(Object.assign({}, sum, when, pth ? { paths: firebase.firestore.FieldValue.arrayUnion(pth) } : {}), { merge: true }); LASTSUM = key; if (pth) showPath(pth); } catch (e) { console.warn('hub', e); } };
  // Its clean address is just the character's name: /zeebo. Names are claimed site-wide in an address book (slugs/{name} → which
  // character), first come first served, so a second Zeebo becomes /zeebo-2. Earlier addresses keep pointing at it.
  let PATHKEY = '', PATHVAL = '';
  const pathFor = async s => { const base = slugify(s.name) || 'character';
    if (base === PATHKEY) return PATHVAL;
    const book = fs.collection('slugs');
    for (let n = RESERVED.has(base) ? 2 : 1; n < 60; n++) { const cand = n === 1 ? base : base + '-' + n;
      let doc; try { doc = await book.doc(cand).get(); } catch (e) { return ''; }
      if (doc.exists) { if (doc.data().c === C) { PATHKEY = base; PATHVAL = cand; return cand; } continue; }
      try { await book.doc(cand).set({ c: C }); PATHKEY = base; PATHVAL = cand; return cand; } catch (e) { return ''; } }
    return ''; };
  const showPath = pth => { if (PRETTY && !STANDALONE && pth && location.pathname !== '/' + pth) history.replaceState(null, '', '/' + pth + location.search.replace(/([?&])v=[^&]*&?/, '$1').replace(/[?&]$/, '')); };
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
  if (!NEW && hubCol && PRETTY) hubCol.doc(C).get().then(d => { const pth = d.exists && d.data().path; if (pth) showPath(pth); }, () => {});
  // New character: once it's created (and saved to the cloud), its link goes in the address bar.
  if (NEW) { const t = setInterval(() => { let made = false; try { const st = window.sheetState && window.sheetState(); made = !!(st && st.created); } catch (e) {} if (!made) return; clearInterval(t);
    history.replaceState(null, '', URLS.byId(C)); syncPlayer();
    setTimeout(() => window.sheetToast(`<div><b>Your character is saved</b><div class="det">${G ? 'It\'s on your party page. ' : ''}Open it on any device you're signed in on — it stays in sync. ${IS_ADMIN && OWNER !== EMAIL ? 'It belongs to ' + OWNER + '.' : 'Only you and the people you share it with can open it.'}</div></div>`, '', 12000), 600);
    hubChanged = true; hubSoon();
  }, 500); }
  // Back to the hub (desktop and phone).
  if (G) { const a = document.createElement('a'); a.href = URLS.hub(G); a.className = 'pg-hublink'; a.title = 'All characters'; if (FRAMED) a.target = '_top'; a.textContent = '⌂ Adventurer’s Tome'; document.body.appendChild(a);
    // On a computer it sits above the toolbar, level with the top of the header, and the toolbar drops so its bottom
    // lines up with the bottom of the level box.
    const de = document.documentElement, align = () => {
      const lv = document.querySelector('.ident-top .lvlbox'), tb = document.querySelector('.ident-top .toolbar');
      if (de.classList.contains('mobile') || !lv || !tb) { de.classList.remove('pg-al'); a.style.left = a.style.top = ''; return; }
      const lr = lv.getBoundingClientRect(), tbh = tb.offsetHeight;
      de.style.setProperty('--pg-tbm', Math.max(a.offsetHeight + 8, Math.round(lr.height - tbh)) + 'px');
      const tr = tb.getBoundingClientRect(), pos = Math.round(tr.left + scrollX) + ',' + Math.round(lr.top + scrollY);
      a.style.left = Math.round(tr.left + scrollX) + 'px'; a.style.top = Math.round(lr.top + scrollY) + 'px';
      // shown once two measurements in a row agree (the header has finished laying out)
      if (pos === align.last) de.classList.add('pg-al'); else { align.last = pos; setTimeout(align, 60); } };
    addEventListener('resize', align); setInterval(align, 600); setTimeout(align, 50);
  }
  // Who's looking at this sheet right now — shown once it's shared: small portraits beside the back button, you too.
  // Each open copy checks in once a minute (only while its tab is showing) and drops off when closed or idle.
  if (!NEW) (() => {
    const pcol = col.doc(C).collection('presence'), mine = pcol.doc(EMAIL); let seen = {}, box = null;
    const beat = async () => { if (document.hidden) return; const a = avaOf(ME); try { await mine.set({ name: NAME, pic: a.pic, color: a.color, clear: a.clear, at: Date.now() }); } catch (e) {} };
    const leave = () => { mine.delete().catch(() => {}); };
    const show = () => { const now = Date.now(), here = Object.entries(seen).filter(([, d]) => now - (d.at || 0) < 150000).sort(([a], [b]) => (b === EMAIL) - (a === EMAIL));
      if (!box) { box = document.createElement('div'); box.className = 'pg-pres'; document.body.appendChild(box); }
      const shared = VIEWERS.length > 0 || OWNER !== EMAIL;
      box.hidden = !shared || !here.length;
      box.innerHTML = here.map(([em, d]) => avaHTML(d.name, em, d.pic, em === EMAIL ? 'me' : '', (em === EMAIL ? 'You' : d.name || em) + ' — viewing now', { color: d.color, clear: d.clear })).join('');
      const a = document.querySelector('.pg-hublink'); if (a) { box.style.left = (a.offsetLeft + a.offsetWidth + 8) + 'px'; box.style.top = (a.offsetTop + a.offsetHeight / 2) + 'px'; } };
    beat(); setInterval(beat, 60000); setInterval(show, 1500);
    document.addEventListener('visibilitychange', () => { if (document.hidden) leave(); else beat(); });
    addEventListener('pagehide', leave);
    pcol.onSnapshot(qs => { seen = {}; qs.docs.forEach(d => { seen[d.id] = d.data(); }); show(); }, () => {});
  })();
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
  const base = location.pathname, HUB = URLS.hub(G), ADMIN_URL = URLS.admin(G);
  const ADMIN = page === 'admin';
  document.title = ADMIN ? 'Admin — Adventurer’s Tome' : 'Adventurer’s Tome';
  document.body.innerHTML = '<div id="hub"></div><div id="hub-modal" class="hub-modal"></div><div id="hub-toast" class="hub-toast"></div>';
  document.body.className = 'hubbody' + (ADMIN ? ' adminbody' : '');
  const root = document.getElementById('hub'), modal = document.getElementById('hub-modal');
  if (TOUCH && !document.documentElement.classList.contains('pg-touch')) { document.documentElement.classList.add('pg-touch'); noHover(); }
  // the phone's status bar takes the colour of the top of the page
  [['(prefers-color-scheme: dark)', '#1f2a40'], ['(prefers-color-scheme: light)', '#fbf6ea']].forEach(([m, c]) => { let t = document.querySelector(`meta[name="theme-color"][media="${m}"]`); if (!t) { t = document.createElement('meta'); t.name = 'theme-color'; t.media = m; document.head.appendChild(t); } t.content = c; });
  let chars = [], open = {}, view = ctx.view === 'shared' ? 'shared' : 'mine';
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
  // Icons for the ⋯ menus (same line style as the old row buttons).
  const mi = d => `<svg class="mi" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const MI = { pin: mi('<path d="M9 3h6l-1 6 4 4H6l4-4z"/><path d="M12 13v8"/>'), unpin: mi('<path d="M9 3h6l-1 6 4 4H6l4-4z"/><path d="M12 13v8"/><path d="M3 3l18 18"/>'), share: shareIcon.replace(/width="\d+"/, 'width="16"').replace(/height="\d+"/, 'height="16"').replace('<svg', '<svg class="mi"'),
    move: mi('<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 11h6M19 8l3 3-3 3"/>'), leave: mi('<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 17l-5-5 5-5M5 12h11"/>'),
    del: mi('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>') };

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
    (IS_ADMIN ? needNames(V) : Promise.resolve()).then(paint);
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
  // Relinquish access: takes you off this character's share list — nothing else about the character changes.
  function leaveChar(c, after) {
    modal.innerHTML = `<div class="hub-card"><h2>Relinquish access to ${esc(c.name || 'this character')}?</h2><p class="hub-hint">It's no longer shared with you, so it leaves your Shared characters. ${esc(c.player || 'Its owner')} can share it with you again.</p>
      <div class="row"><button class="btn ghost" id="lv-x">Cancel</button><button class="btn red" id="lv-ok">Relinquish access</button></div></div>`;
    modal.classList.add('on'); modal.querySelector('#lv-x').onclick = close;
    modal.querySelector('#lv-ok').onclick = async e => { e.target.disabled = true;
      const acc = { viewers: (c.viewers || []).filter(x => x !== EMAIL), editors: (c.editors || []).filter(x => x !== EMAIL) };
      try { const s0 = await sheets.doc(c.id).get(); const n = Number(s0.exists && s0.data().n) || 1;
        for (let k = 1; k < n; k++) await sheets.doc(c.id + '_p' + k).update(acc).catch(() => {});
        await charsCol.doc(c.id).set(acc, { merge: true }); await sheets.doc(c.id).update(acc);
        Object.assign(c, acc); if (!IS_ADMIN) chars = chars.filter(x => x.id !== c.id); toast('You no longer have access to ' + (c.name || 'that character') + '.'); close(); if (after) after(); }
      catch (x) { e.target.disabled = false; toast(x && x.code === 'permission-denied' ? 'Couldn’t do that yet — the new database rules need publishing.' : 'Couldn’t do that: ' + ((x && x.message) || x)); } };
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
        for (const pth of new Set([c.path, ...(c.paths || [])])) if (pth && !pth.includes('/')) await fs.collection('slugs').doc(pth).delete().catch(() => {});
        for (let k = 1; k < n; k++) await sheets.doc(c.id + '_p' + k).delete().catch(() => {});
        if (s0.exists) await sheets.doc(c.id).delete(); await charsCol.doc(c.id).delete();
        ['dnd-pages-cache:', 'dnd-sheet-ui:'].forEach(k => { try { localStorage.removeItem(k + c.id); } catch (e) {} });
        chars = chars.filter(x => x.id !== c.id); close(); toast((c.name || 'The character') + ' was deleted.'); if (after) after(); }
      catch (x) { ok.textContent = 'Delete forever'; ok.disabled = false; toast(x && x.code === 'permission-denied' ? 'Only the owner (or an admin) can delete it — if you are, the new database rules still need publishing.' : 'Couldn\'t delete it: ' + ((x && x.message) || x)); } };
  }
  document.addEventListener('click', e => { if (e.target === modal) close(); });

  if (ADMIN) return adminSection();

  // ================= Hub: my characters and the ones shared with me =================
  function createChar() { location.href = URLS.newChar(G, '', myName()); }
  // Your picture: your initials (on a colour you can pick), one of your characters, or an image you upload.
  const myAva = () => { const a = avaOf(ME), ch = ME && ME.picChar && chars.find(c => c.id === ME.picChar && isMine(c)); if (ch && ch.thumb) a.pic = ch.thumb; return a; };
  // An uploaded image is shrunk to a small square here before saving. A transparent background is kept (as PNG) and the
  // whole image fits inside; otherwise it's cropped to fill the circle.
  const prepPic = file => new Promise((res, rej) => { const url = URL.createObjectURL(file), im = new Image();
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('That file isn’t an image this browser can open.')); };
    im.onload = () => { URL.revokeObjectURL(url); const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height; if (!w || !h) return rej(new Error('That image looks empty.'));
      const t = document.createElement('canvas'); t.width = t.height = 64; const tc = t.getContext('2d'); tc.drawImage(im, 0, 0, 64, 64); const px = tc.getImageData(0, 0, 64, 64).data;
      let clear = false; for (let i = 3; i < px.length; i += 4) if (px[i] < 235) { clear = true; break; }
      const draw = S => { const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), k = clear ? Math.min(S / w, S / h) : Math.max(S / w, S / h);
        x.imageSmoothingQuality = 'high'; x.drawImage(im, (S - w * k) / 2, (S - h * k) / 2, w * k, h * k); return clear ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', .86); };
      let img = draw(192); if (img.length > 260000) img = draw(128); res({ img, clear }); };
    im.src = url; });
  function pickPic() {
    const mine = chars.filter(isMine).sort((a, b) => (a.createdAt || a.updatedAt || 0) - (b.createdAt || b.updatedAt || 0));
    const st = { mode: ME && ME.picChar ? 'char' : ME && ME.pic ? 'upload' : 'initials', color: okColor(ME && ME.picColor), char: (ME && ME.picChar) || '', img: ME && !ME.picChar ? (ME.pic || '') : '', clear: !!(ME && ME.picClear) };
    const auto = `hsl(${hueOf(EMAIL)}, 42%, 42%)`;
    const ico = { initials: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19l4.5-12h1L14 19M5.8 15h6.4"/><path d="M15 12.5c.8-1 2-1.5 3-1.2 1.5.4 2 1.8 2 3.2V19M20 15.5c-2 0-4.5.2-4.5 2s2.2 1.8 4.5-.3"/></svg>',
      char: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
      upload: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>' };
    modal.innerHTML = `<div class="hub-card wide pp"><h2>Your picture</h2>
      <div class="pp-head"><span class="pp-prev"></span><div class="pp-who"><b>${esc(myName())}</b><small>Shows beside your name, and to others when you’re viewing a shared sheet together.</small></div></div>
      <div class="pp-tabs" role="tablist">${[['initials', 'Initials'], ['char', 'Character'], ['upload', 'Upload']].map(([m, t]) => `<button role="tab" data-m="${m}">${ico[m]}${t}</button>`).join('')}</div>
      <div class="pp-pane" data-p="initials"><p class="pp-lbl">Background colour</p><div class="pp-sw">
        <button class="pp-c" data-c="" style="background:${auto}" title="Automatic"><span>A</span></button>${PG_SWATCH.map(c => `<button class="pp-c" data-c="${c}" style="background:${c}" title="${c}"></button>`).join('')}
        <label class="pp-c pp-cust" title="Pick any colour"><input type="color" value="${st.color || '#c9962b'}"><span>+</span></label></div></div>
      <div class="pp-pane" data-p="char">${mine.length ? `<div class="pp-grid">${mine.map(c => `<button class="pp-opt" data-pp="${esc(c.id)}"${c.thumb ? '' : ' disabled title="This character has no portrait yet"'}><span class="pp-img">${avaHTML(c.name, c.id, c.thumb)}</span><b>${esc(c.name || 'Unnamed')}</b><small>${esc(c.thumb ? (c.cls || '') : 'No portrait yet')}</small></button>`).join('')}</div>` : '<p class="hub-hint pp-empty">You don’t have any characters yet — make one and its portrait can be your picture.</p>'}</div>
      <div class="pp-pane" data-p="upload"><label class="pp-drop"><input type="file" accept="image/*" hidden><span class="pp-dz-i">${ico.upload}</span><b>Choose an image</b><small>or drag one here</small></label>
        <p class="pp-note">Tip: a PNG with a transparent background shows just the image — no circle or border around it.</p><p class="pp-err" hidden></p></div>
      <div class="row pp-foot"><button class="btn ghost" id="pp-x">Cancel</button><button class="btn" id="pp-ok">Save</button></div></div>`;
    modal.classList.add('on');
    const $ = q => modal.querySelector(q), $$ = q => modal.querySelectorAll(q);
    const pick = () => st.mode === 'char' ? ((mine.find(c => c.id === st.char) || {}).thumb || '') : st.mode === 'upload' ? st.img : '';
    const paint = () => { const pic = pick();
      $('.pp-prev').innerHTML = avaHTML(myName(), EMAIL, pic, '', '', { color: st.color, clear: st.mode === 'upload' && st.clear });
      $$('.pp-tabs [data-m]').forEach(b => { const on = b.dataset.m === st.mode; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
      $$('.pp-pane').forEach(p => p.hidden = p.dataset.p !== st.mode);
      $$('.pp-c[data-c]').forEach(b => b.classList.toggle('on', b.dataset.c === st.color));
      const cu = $('.pp-cust'); cu.classList.toggle('on', !!st.color && !PG_SWATCH.includes(st.color)); if (cu.classList.contains('on')) cu.style.background = st.color; else cu.style.background = '';
      $$('[data-pp]').forEach(b => b.classList.toggle('on', st.mode === 'char' && b.dataset.pp === st.char));
      const dz = $('.pp-drop'); dz.classList.toggle('has', !!st.img); dz.querySelector('b').textContent = st.img ? 'Choose a different image' : 'Choose an image';
      $('#pp-ok').disabled = (st.mode === 'char' && !pick()) || (st.mode === 'upload' && !st.img); };
    $$('.pp-tabs [data-m]').forEach(b => b.onclick = () => { st.mode = b.dataset.m; if (st.mode === 'char' && !st.char) { const f = mine.find(c => c.thumb); if (f) st.char = f.id; } paint(); });
    $$('.pp-c[data-c]').forEach(b => b.onclick = () => { st.color = b.dataset.c; paint(); });
    const ci = $('.pp-cust input'); ci.oninput = () => { st.color = okColor(ci.value); paint(); };
    $$('[data-pp]').forEach(b => b.onclick = () => { st.char = b.dataset.pp; paint(); });
    const err = $('.pp-err'), take = async f => { err.hidden = true; if (!f) return; if (!/^image\//.test(f.type || 'image/')) { err.textContent = 'That isn’t an image file.'; err.hidden = false; return; }
      if (f.size > 15e6) { err.textContent = 'That image is too big (over 15 MB).'; err.hidden = false; return; }
      try { const r = await prepPic(f); st.img = r.img; st.clear = r.clear; paint(); } catch (x) { err.textContent = x.message || String(x); err.hidden = false; } };
    const fi = $('.pp-drop input'); fi.onchange = () => { take(fi.files[0]); fi.value = ''; };
    const dz = $('.pp-drop'); ['dragenter', 'dragover'].forEach(t => dz.addEventListener(t, e => { e.preventDefault(); dz.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(t => dz.addEventListener(t, () => dz.classList.remove('over'))); dz.addEventListener('drop', e => { e.preventDefault(); take(e.dataTransfer.files[0]); });
    $('#pp-x').onclick = close;
    $('#pp-ok').onclick = async () => { const ok = $('#pp-ok'); ok.disabled = true; ok.textContent = 'Saving…';
      const upd = st.mode === 'char' ? { picChar: st.char, pic: pick(), picClear: false, picColor: st.color } : st.mode === 'upload' ? { picChar: '', pic: st.img, picClear: !!st.clear, picColor: st.color } : { picChar: '', pic: '', picClear: false, picColor: st.color };
      try { await usersCol.doc(EMAIL).update(upd); Object.assign(ME || {}, upd); close(); draw(); toast('Your picture is saved.'); }
      catch (x) { ok.disabled = false; ok.textContent = 'Save'; toast(x && x.code === 'permission-denied' ? 'Couldn’t save it yet — the new database rules need publishing.' : 'Couldn’t save it: ' + ((x && x.message) || x)); } };
    paint();
  }
  function card(c) {
    const acc = (c.editors || []).includes(EMAIL) ? '<span class="hc-acc edit">Can edit</span>' : '<span class="hc-acc">View only</span>';
    return `<div class="hc${c.pin && isMine(c) ? ' pinned' : ''}"><a class="hc-main" href="${esc(URLS.char(c))}">${pic(c)}
      <span class="hc-txt"><b>${esc(c.name || 'Unnamed character')}</b><span>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}</span>
      <small>${c.updatedAt ? 'Updated ' + ago(c.updatedAt) + (c.by ? ' by ' + esc(c.by) : '') : ''}</small>${acc}</span></a>
      ${(() => { const inList = (c.viewers || []).includes(EMAIL) && !isMine(c), it = [];
        if (IS_ADMIN) it.push(['share', 'Share…'], ['move', 'Give to another player']);
        if (inList) it.push(['leave', 'Relinquish access']);
        if (canDelete(c)) it.push(['del', 'Delete character…', 'hc-del']);
        return it.length ? `<div class="hc-menu"><button class="hc-dots" aria-label="More">⋯</button><div class="hc-list">${it.map(([a, t, k]) => `<button data-a="${a}" data-id="${esc(c.id)}"${k ? ` class="${k}"` : ''}>${MI[a]}${t}</button>`).join('')}</div></div>` : ''; })()}</div>`;
  }
  const shareNote = c => { const n = (c.viewers || []).length; return n ? `Shared with ${n} · ` : ''; };
  // Pinned first; then each player's own order (drag to change), then most recently updated.
  const ord = (a, b) => (!!b.pin - !!a.pin) || ((a.order != null ? a.order : 1e9) - (b.order != null ? b.order : 1e9)) || ((b.updatedAt || 0) - (a.updatedAt || 0));
  function row(c) {
    return `<div class="hr${c.pin ? ' pinned' : ''}" data-id="${esc(c.id)}" data-pin="${c.pin ? 1 : 0}"><span class="hr-grip" title="Drag to reorder" aria-label="Drag to reorder">⠿</span>
      <a class="hr-main" href="${esc(URLS.char(c))}">${pic(c)}
      <span class="hc-txt"><b>${esc(c.name || 'Unnamed character')}</b><span>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}</span>
      <small>${shareNote(c)}${c.updatedAt ? 'Updated ' + ago(c.updatedAt) + (c.by ? ' by ' + esc(c.by) : '') : ''}</small></span></a>
      <div class="hc-menu hr-menu"><button class="hc-dots" aria-label="More options for ${esc(c.name || 'this character')}">⋯</button><div class="hc-list">
        <button data-a="pin" data-id="${esc(c.id)}">${c.pin ? MI.unpin + 'Unpin' : MI.pin + 'Pin'}</button><button data-a="share" data-id="${esc(c.id)}">${MI.share}Share…</button>${canDelete(c) ? `<button data-a="del" data-id="${esc(c.id)}" class="hc-del">${MI.del}Delete character…</button>` : ''}</div></div></div>`;
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
    const sc = RD.list.closest('.hub-scroll'), sr = sc ? sc.getBoundingClientRect() : { top: 0, bottom: innerHeight }, edge = 60, by = y => sc ? sc.scrollBy(0, y) : scrollBy(0, y);
    if (e.clientY < sr.top + edge) by(-10); else if (e.clientY > sr.bottom - edge) by(10); }, { passive: false });
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
    const keepLogo = root.querySelector('.hub-logo');
    root.innerHTML = `<header class="hub-top">${logoHTML()}
      <div class="hub-side"><div class="hub-prof"><button class="hp-pic" id="me-pic" title="Choose your picture" aria-label="Choose your picture">${(a => avaHTML(myName(), EMAIL, a.pic, '', '', a))(myAva())}<span class="hp-edit" aria-hidden="true">✎</span></button>
        <div class="hp-txt"><b>${esc(myName())}</b><small>${esc(EMAIL)}</small><div class="hp-row"><button class="linkbtn" id="me-out">Sign out</button>${IS_ADMIN ? '<button class="btn hub-admin" id="hub-admin">⚙ Admin</button>' : ''}</div></div></div></div></header>
      <div class="hub-views"><button class="${SH ? '' : 'on'}" data-view="mine">My characters <span>${mine.length}</span></button><button class="${SH ? 'on' : ''}" data-view="shared">Shared characters <span>${shared.length}</span></button><button class="hub-new" id="hub-new"><span class="hn-plus" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span><span class="hn-txt"><b>Create character</b></span></button></div>
      <div class="hub-scroll">${body}</div>`;
    if (keepLogo) { const n = root.querySelector('.hub-logo'); if (n) n.replaceWith(keepLogo); }
    const nb = root.querySelector('#hub-new'); if (nb) nb.onclick = createChar;
    root.querySelector('#me-out').onclick = signOut;
    const ab = root.querySelector('#hub-admin'); if (ab) ab.onclick = () => { location.href = ADMIN_URL; };
    root.querySelector('#me-pic').onclick = pickPic;
    root.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { view = b.dataset.view; history.replaceState(null, '', view === 'shared' ? URLS.shared(G) : URLS.hub(G)); draw(); });
    root.querySelectorAll('details.hub-folder').forEach(d => d.addEventListener('toggle', () => { open[d.dataset.k] = d.open; ls.set(OPEN, JSON.stringify(open)); }));
    root.querySelectorAll('.hc-dots').forEach(b => b.onclick = e => { e.stopPropagation(); const w = b.parentElement, on = !w.classList.contains('on'); root.querySelectorAll('.hc-menu.on').forEach(x => x.classList.remove('on')); w.classList.toggle('on', on); });
    root.querySelectorAll('.hc-list [data-a]').forEach(b => b.onclick = () => { const c = chars.find(x => x.id === b.dataset.id); b.closest('.hc-menu').classList.remove('on'); if (!c) return;
      if (b.dataset.a === 'share') shareChar(c); if (b.dataset.a === 'move') moveChar(c, draw); if (b.dataset.a === 'leave') leaveChar(c, draw); if (b.dataset.a === 'pin') togglePin(c.id); if (b.dataset.a === 'del') deleteChar(c, draw); });
  }
  wireDie(root);
  document.addEventListener('click', () => root.querySelectorAll('.hc-menu.on').forEach(x => x.classList.remove('on')));
  draw();
  // Everyone — admins too — sees their own characters plus the ones shared with them. Admins find the rest in Admin.
  const lists = {}, merge = () => { const m = new Map(); Object.values(lists).forEach(l => l.forEach(c => m.set(c.id, c))); chars = [...m.values()]; if (!RD) draw();
    if (IS_ADMIN) needNames(chars.filter(c => !isMine(c)).map(c => c.owner)).then(() => { if (!RD) draw(); });
    if (ME && ME.picChar) { const ch = chars.find(c => c.id === ME.picChar); if (ch && (ch.thumb || '') !== (ME.pic || '')) { ME.pic = ch.thumb || ''; usersCol.doc(EMAIL).update({ pic: ME.pic }).catch(() => {}); } } };
  const failed = e => { root.innerHTML = `<p class="hub-empty">Couldn't load the character list (${esc(e.code || e.message || e)}).<br><br>Signed in as ${esc(EMAIL)} · <button class="linkbtn" onclick="pgSignOut()">Sign out</button></p>`; console.error(e); };
  const watch = (k, q) => q.onSnapshot(qs => { lists[k] = qs.docs.map(d => Object.assign({ id: d.id }, d.data())); merge(); }, failed);
  watch('mine', charsCol.where('owner', '==', EMAIL)); watch('shared', charsCol.where('viewers', 'array-contains', EMAIL));
  setInterval(() => { if (!RD) draw(); }, 60000);

  // ================= Admin section (its own page: ?g=…&admin=1) =================
  function adminSection() {
    const UREF = usersCol.doc(EMAIL); let CHECKED = Number(ME && ME.checkedAt) || 0;
    const T0 = ctx.tab === 'characters' ? 'chars' : ctx.tab; let TAB = ['users', 'chars', 'admins', 'new'].includes(T0) ? T0 : 'users';
    const CH = {}, US = {}; // characters and accounts on screen
    let NEWN = null;
    const setTab = t => { TAB = t; history.replaceState(null, '', URLS.admin(G, t === 'chars' ? 'characters' : t)); frame(); };
    const ic = {
      users: '<path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1"/><circle cx="9" cy="7" r="3.5"/><path d="M22 19v-1a4 4 0 0 0-3-3.9M16 3.5a3.5 3.5 0 0 1 0 7"/>',
      chars: '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/><path d="M8 8h6"/>',
      admins: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
      new: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>' };
    const svg = (k, n = 18) => `<svg viewBox="0 0 24 24" width="${n}" height="${n}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic[k]}</svg>`;
    const PAGES = { users: ['Users', 'Everyone who has signed in. Search by name or email, rename someone, or look at their characters.'],
      chars: ['Characters', 'Every character on the site, newest activity first. Share any of them with yourself, or open, share, move or delete them.'],
      admins: ['Admins', 'Admins can open and edit every character, manage users and see new accounts.'],
      new: ['New', 'Accounts and characters that appeared since you last marked this as read.'] };
    // avatar: initials on a colour picked from the name, so the same person always looks the same
    const hue = t => [...String(t || '?')].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 360, 7);
    const ava = (name, em) => { const ini = String(name || em || '?').split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
      const a = (em && PICS[em]) || {}; return `<span class="adm-ava${a.pic ? ' has-pic' : ''}${a.clear ? ' clear' : ''}" data-em="${esc(em || '')}" style="${a.pic ? '' : avaStyle(a, em || name)}">${a.pic ? `<img src="${esc(a.pic)}" alt="">` : esc(ini)}</span>`; };
    // Each person's picture as they set it (initials and colour, a character, or an upload) — looked up once per visit.
    const PICS = {}, PICQ = {};
    const picFor = em => PICQ[em] || (PICQ[em] = userDoc(em).then(u => PICS[em] = avaOf(u), () => PICS[em] = {}));
    const fillPics = () => root.querySelectorAll('.adm-ava[data-em]:not([data-f])').forEach(el => { const em = el.dataset.em; el.dataset.f = 1; if (!em) return; picFor(em).then(a => { if (!el.isConnected || !a) return;
      if (a.pic) { el.classList.add('has-pic'); el.classList.toggle('clear', !!a.clear); el.removeAttribute('style'); el.innerHTML = `<img src="${esc(a.pic)}" alt="">`; } else if (a.color) { el.style.background = a.color; el.style.color = inkOn(a.color); } }); });
    // on a phone each table row becomes a small card; every value carries its column's name so it still reads clearly
    const labelCells = () => root.querySelectorAll('table.adm-t:not([data-l])').forEach(t => { t.dataset.l = 1; const hs = [...t.querySelectorAll('thead th')].map(th => th.textContent.trim());
      t.querySelectorAll('tbody > tr').forEach(tr => [...tr.children].forEach((td, i) => { if (hs[i] && !td.dataset.l) td.dataset.l = hs[i]; })); });
    new MutationObserver(() => { fillPics(); labelCells(); }).observe(root, { childList: true, subtree: true });
    const roleOf = em => em === ADMIN_EMAIL ? ['Owner', 'r-own'] : ADMINS.includes(em) ? ['Admin', 'r-adm'] : ['Member', 'r-mem'];
    const when = t => t ? `<span title="${esc(new Date(t).toLocaleString())}">${esc(day(t))}</span>` : '<span class="adm-dim">—</span>';
    const kebab = items => `<div class="adm-mwrap"><button class="adm-kebab" aria-label="More actions">⋯</button><div class="adm-mlist">${items.map(([k, t, id, cls]) => `<button data-mi="${k}" data-id="${esc(id)}"${cls ? ` class="${cls}"` : ''}>${t}</button>`).join('')}</div></div>`;

    function frame() {
      const nav = (k, label) => `<button class="adm-ni${TAB === k ? ' on' : ''}" data-tab="${k}">${svg(k)}<span>${label}</span>${k === 'new' && NEWN ? `<b class="adm-badge">${NEWN}</b>` : ''}</button>`;
      const [title, desc] = PAGES[TAB];
      const keepLogo = root.querySelector('.hub-logo');
      root.innerHTML = `<div class="adm"><aside class="adm-side">
          <div class="adm-brand">${logoHTML()}</div>
          <nav class="adm-nav"><div class="adm-sec">Manage</div>${nav('users', 'Users')}${nav('chars', 'Characters')}${nav('admins', 'Admins')}<div class="adm-sec">Activity</div>${nav('new', 'New')}</nav>
          <div class="adm-foot"><a class="adm-back" href="${esc(HUB)}">← Back to my characters</a>
            <div class="adm-me">${ava(myName(), EMAIL)}<span><b>${esc(myName())}</b><small>${esc(EMAIL)}</small></span><button class="linkbtn" id="me-out">Sign out</button></div></div></aside>
        <main class="adm-main"><header class="adm-head"><div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div><div class="adm-hact" id="adm-hact"></div></header>
          <section id="ad-body" class="adm-body"><p class="adm-dim">Loading…</p></section></main></div>`;
      if (keepLogo) { const n = root.querySelector('.hub-logo'); if (n) n.replaceWith(keepLogo); }
      root.querySelector('#me-out').onclick = signOut;
      root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => setTab(b.dataset.tab));
      ({ new: tabNew, users: tabUsers, chars: tabChars, admins: tabAdmins })[TAB]();
    }
    const B = () => root.querySelector('#ad-body'), HA = () => root.querySelector('#adm-hact');
    document.addEventListener('click', e => { const k = e.target.closest && e.target.closest('.adm-kebab'); root.querySelectorAll('.adm-mwrap.on').forEach(w => { if (!k || w !== k.parentElement) w.classList.remove('on'); }); if (k) k.parentElement.classList.toggle('on'); });

    // ----- characters as table rows -----
    const myAccess = c => isMine(c) ? 'own' : (c.editors || []).includes(EMAIL) ? 'edit' : (c.viewers || []).includes(EMAIL) ? 'view' : '';
    const ctable = (list, showOwner = true, empty = 'No characters yet.') => list.length ? `<div class="adm-tw"><table class="adm-t"><thead><tr><th>Character</th>${showOwner ? '<th>Owner</th>' : ''}<th>Shared with you</th><th>Updated</th><th>Created</th><th></th></tr></thead><tbody>${list.map(c => crow(c, showOwner)).join('')}</tbody></table></div>` : `<p class="adm-empty">${empty}</p>`;
    function crow(c, showOwner) { CH[c.id] = c; const a = myAccess(c);
      return `<tr><td><a class="adm-char" href="${esc(URLS.char(c))}">${pic(c)}<span><b>${esc(c.name || 'Unnamed character')}</b><small>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}</small></span></a></td>
        ${showOwner ? `<td><span class="adm-who">${ava(nameOf(c.owner || ''), c.owner)}<span>${esc(nameOf(c.owner || '') || '—')}</span></span></td>` : ''}
        <td>${a === 'own' ? '<span class="adm-tag r-own">Yours</span>' : `<select class="adm-sel" data-me="${esc(c.id)}" aria-label="Shared with you"><option value="">Not shared</option><option value="view"${a === 'view' ? ' selected' : ''}>Can view</option><option value="edit"${a === 'edit' ? ' selected' : ''}>Can edit</option></select>`}</td>
        <td>${when(c.updatedAt)}</td><td>${when(c.createdAt)}</td>
        <td class="adm-act">${kebab([['open', 'Open', c.id], ['share', 'Share…', c.id], ['give', 'Give to another player…', c.id], ['rm', 'Remove from lists', c.id], ['del', 'Delete character…', c.id, 'danger']])}</td></tr>`; }
    function wire(el, redo) {
      el.querySelectorAll('[data-me]').forEach(sl => sl.onchange = async () => { const c = CH[sl.dataset.me]; if (!c) return; const v = sl.value;
        const V = (c.viewers || []).filter(x => x !== EMAIL), E = (c.editors || []).filter(x => x !== EMAIL);
        try { await setAccess(c, v ? [...V, EMAIL] : V, v === 'edit' ? [...E, EMAIL] : E); toast(v ? (c.name || 'It') + ' is shared with you (' + (v === 'edit' ? 'can edit' : 'view only') + ').' : 'Stopped sharing ' + (c.name || 'it') + ' with you.'); }
        catch (x) { toast('Couldn\'t change it: ' + (x.message || x)); sl.value = myAccess(c) === 'own' ? '' : myAccess(c); } });
      el.querySelectorAll('[data-mi]').forEach(b => b.onclick = () => { const c = CH[b.dataset.id]; b.closest('.adm-mwrap').classList.remove('on'); if (!c) return;
        ({ open: () => { location.href = URLS.char(c); }, share: () => shareChar(c, Object.assign(() => {}, { refresh: redo })), give: () => moveChar(c, redo), rm: () => removeChar(c, redo), del: () => deleteChar(c, redo) })[b.dataset.mi](); });
    }
    const docs = r => r.docs.map(d => Object.assign({ id: d.id }, d.data()));
    const failMsg = x => `<p class="adm-empty">Couldn't load this (${esc((x && (x.code || x.message)) || x)}).</p>`;
    const toolbar = (id, ph, val, count) => `<div class="adm-tool"><label class="adm-search">${svg('search', 16)}<input id="${id}" placeholder="${esc(ph)}" value="${esc(val)}" autocomplete="off"></label><span class="adm-count" id="${id}-n">${count || ''}</span></div>`;

    // --- New ---
    async function tabNew() {
      const el = B();
      try {
        const [ur, cr] = await Promise.all([usersCol.where('createdAt', '>', CHECKED).orderBy('createdAt', 'desc').limit(50).get(), charsCol.where('createdAt', '>', CHECKED).orderBy('createdAt', 'desc').limit(100).get()]);
        const us = docs(ur); us.forEach(u => remember(u.id, u));
        const fresh = new Set(us.map(u => u.id)), byUser = {};
        await Promise.all(us.map(async u => { byUser[u.id] = docs(await charsCol.where('owner', '==', u.id).limit(50).get()); }));
        const others = docs(cr).filter(c => !fresh.has(c.owner)); await needNames(others.map(c => c.owner));
        const n = us.length + others.length; if (NEWN !== n) { NEWN = n; const t = root.querySelector('[data-tab="new"]'); if (t) { const bd = t.querySelector('.adm-badge'); if (n && !bd) t.insertAdjacentHTML('beforeend', `<b class="adm-badge">${n}</b>`); else if (bd) n ? (bd.textContent = n) : bd.remove(); } }
        HA().innerHTML = n ? '<button class="adm-btn primary" id="ad-seen">Mark as read</button>' : '';
        const nchars = us.reduce((a, u) => a + byUser[u.id].length, 0) + others.length;
        el.innerHTML = `<div class="adm-stats"><div class="adm-stat"><small>New accounts</small><b>${us.length}${us.length === 50 ? '+' : ''}</b></div><div class="adm-stat"><small>New characters</small><b>${nchars}</b></div></div>
          <h2 class="adm-h2">New accounts</h2>
          ${us.length ? `<div class="adm-tw"><table class="adm-t"><thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Characters</th></tr></thead><tbody>${us.map(u => `<tr><td><span class="adm-who">${ava(u.name, u.id)}<b>${esc(u.name || u.id)}</b></span></td><td class="adm-mail">${esc(u.id)}</td><td>${esc(ago(u.createdAt))}</td><td>${byUser[u.id].length}</td></tr>
            ${byUser[u.id].length ? `<tr class="adm-subrow"><td colspan="4">${ctable(byUser[u.id], false)}</td></tr>` : ''}`).join('')}</tbody></table></div>` : '<p class="adm-empty">No new accounts.</p>'}
          <h2 class="adm-h2">New characters from existing players</h2>${ctable(others, true, 'None.')}`;
        wire(el, tabNew);
        const sb = HA().querySelector('#ad-seen'); if (sb) sb.onclick = async () => { const t = Date.now(); try { await UREF.update({ checkedAt: t }); CHECKED = t; NEWN = 0; toast('Marked as read.'); frame(); } catch (x) { toast('Couldn\'t save that: ' + (x.message || x)); } };
      } catch (x) { el.innerHTML = failMsg(x); }
    }

    // --- Users ---
    let UQ = '', ULAST = null, UROWS = [];
    async function tabUsers(more) {
      const el = B();
      if (!more) { HA().innerHTML = ''; el.innerHTML = toolbar('ad-uq', 'Search by name or email', UQ) + '<div id="ad-ul"><p class="adm-dim">Loading…</p></div>';
        const q = el.querySelector('#ad-uq'); let t = null; q.oninput = () => { clearTimeout(t); t = setTimeout(() => { UQ = q.value; ULAST = null; UROWS = []; tabUsersList(); }, 250); }; if (!UQ) q.focus(); }
      tabUsersList(more);
    }
    async function tabUsersList(more) {
      const l = B().querySelector('#ad-ul'); if (!l) return;
      try { const r = await findUsers(UQ, more ? ULAST : null); ULAST = r.docs[r.docs.length - 1] || ULAST; UROWS = (more ? UROWS : []).concat(docs(r)); UROWS.forEach(u => { US[u.id] = u; });
        const rows = UQ ? UROWS.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')) : UROWS;
        const cnt = B().querySelector('#ad-uq-n'); if (cnt) cnt.textContent = rows.length ? rows.length + (r.docs.length === 25 ? '+' : '') + ' user' + (rows.length === 1 ? '' : 's') : '';
        l.innerHTML = rows.length ? `<div class="adm-tw"><table class="adm-t"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Last active</th><th></th><th></th></tr></thead><tbody>${rows.map(u => { const [rl, rc] = roleOf(u.id);
          return `<tr data-u="${esc(u.id)}"><td><span class="adm-who">${ava(u.name, u.id)}<b>${esc(u.name || '—')}</b></span></td><td class="adm-mail">${esc(u.id)}</td><td><span class="adm-tag ${rc}">${rl}</span></td><td>${when(u.createdAt)}</td><td>${u.seenAt ? esc(ago(u.seenAt)) : '<span class="adm-dim">—</span>'}</td>
            <td><button class="adm-btn sm" data-uc="${esc(u.id)}">Characters ▸</button></td><td class="adm-act">${kebab([['rename', 'Rename…', u.id], ['newfor', 'New character for them', u.id], ['chars', 'Show characters', u.id]])}</td></tr>
            <tr class="adm-subrow" data-sub="${esc(u.id)}" hidden><td colspan="7"></td></tr>`; }).join('')}</tbody></table></div>`
          + (r.docs.length === 25 ? '<button class="adm-btn adm-more" id="ad-umore">Load more</button>' : '') : `<p class="adm-empty">${UQ ? 'Nobody matches “' + esc(UQ) + '”.' : 'No accounts yet.'}</p>`;
        const mb = l.querySelector('#ad-umore'); if (mb) mb.onclick = () => tabUsers(true);
        const toggle = async em => { const sub = l.querySelector(`[data-sub="${CSS.escape(em)}"]`), btn = l.querySelector(`[data-uc="${CSS.escape(em)}"]`); if (!sub) return;
          if (!sub.hidden) { sub.hidden = true; btn.textContent = 'Characters ▸'; return; } sub.hidden = false; btn.textContent = 'Characters ▾'; const cell = sub.firstElementChild;
          const fill = async () => { cell.innerHTML = '<p class="adm-dim">Loading…</p>'; try { const cs = docs(await charsCol.where('owner', '==', em).limit(100).get()).sort((x, y) => (y.updatedAt || 0) - (x.updatedAt || 0));
            cell.innerHTML = ctable(cs, false) + `<a class="adm-btn sm" href="${esc(URLS.newChar(G, em, nameOf(em)))}">＋ New character for ${esc(nameOf(em))}</a>`; wire(cell, fill); } catch (x) { cell.innerHTML = failMsg(x); } };
          fill(); };
        l.querySelectorAll('[data-uc]').forEach(b => b.onclick = () => toggle(b.dataset.uc));
        l.querySelectorAll('[data-mi]').forEach(b => b.onclick = () => { const em = b.dataset.id; b.closest('.adm-mwrap').classList.remove('on');
          if (b.dataset.mi === 'chars') toggle(em); else if (b.dataset.mi === 'newfor') location.href = URLS.newChar(G, em, nameOf(em)); else if (b.dataset.mi === 'rename') renameUser(em); });
      } catch (x) { l.innerHTML = failMsg(x); }
    }
    function renameUser(em) {
      const u = US[em] || {}; modal.innerHTML = `<div class="hub-card"><h2>Rename ${esc(u.name || em)}</h2><p class="hub-hint">This is the name shown for them everywhere.</p>
        <input id="rn-q" class="ad-search" maxlength="60" value="${esc(u.name || '')}"><div class="row"><button class="btn ghost" id="rn-x">Cancel</button><button class="btn gold" id="rn-ok">Save</button></div></div>`;
      modal.classList.add('on'); const q = modal.querySelector('#rn-q'); q.focus(); q.select(); modal.querySelector('#rn-x').onclick = close;
      const go = async () => { const n = q.value.trim().slice(0, 60); if (!n) return; close();
        try { await usersCol.doc(em).update({ name: n, nameLower: n.toLowerCase(), keys: searchKeys(n, em.split('@')[0], em) }); remember(em, Object.assign({}, u, { name: n })); US[em] = Object.assign({}, u, { name: n });
          toast('Renamed to ' + n + '.'); UROWS = UROWS.map(x => x.id === em ? Object.assign({}, x, { name: n }) : x); tabUsersList(); } catch (x) { toast('Couldn\'t rename: ' + (x.message || x)); } };
      modal.querySelector('#rn-ok').onclick = go; q.onkeydown = e => { if (e.key === 'Enter') go(); };
    }

    // --- Characters ---
    let CQ = '', CLAST = null, CROWS = [];
    async function tabChars(more) {
      const el = B();
      if (!more) { HA().innerHTML = ''; el.innerHTML = toolbar('ad-cq', 'Search characters by name', CQ) + '<div id="ad-cl"><p class="adm-dim">Loading…</p></div>';
        const q = el.querySelector('#ad-cq'); let t = null; q.oninput = () => { clearTimeout(t); t = setTimeout(() => { CQ = q.value; CLAST = null; CROWS = []; tabCharsList(); }, 250); }; }
      tabCharsList(more);
    }
    async function tabCharsList(more) {
      const l = B().querySelector('#ad-cl'); if (!l) return; const q = CQ.trim().toLowerCase().slice(0, 24);
      try { let qq = q ? charsCol.where('keys', 'array-contains', q).limit(25) : charsCol.orderBy('updatedAt', 'desc').limit(25); if (more && CLAST) qq = qq.startAfter(CLAST);
        const r = await qq.get(); CLAST = r.docs[r.docs.length - 1] || CLAST; CROWS = (more ? CROWS : []).concat(docs(r)); await needNames(CROWS.map(c => c.owner));
        const cnt = B().querySelector('#ad-cq-n'); if (cnt) cnt.textContent = CROWS.length ? CROWS.length + (r.docs.length === 25 ? '+' : '') + ' character' + (CROWS.length === 1 ? '' : 's') : '';
        l.innerHTML = ctable(CROWS, true, q ? 'No characters match “' + esc(CQ) + '”.' : 'No characters yet.') + (r.docs.length === 25 ? '<button class="adm-btn adm-more" id="ad-cmore">Load more</button>' : '');
        wire(l, () => tabChars()); const mb = l.querySelector('#ad-cmore'); if (mb) mb.onclick = () => tabChars(true);
      } catch (x) { l.innerHTML = failMsg(x); }
    }

    // --- Admins ---
    async function tabAdmins() {
      const el = B(); await needNames([ADMIN_EMAIL, ...ADMINS]); const cfg = fs.collection('config').doc('admins');
      HA().innerHTML = IS_OWNER ? '<button class="adm-btn primary" id="ad-add">Add admin</button>' : '';
      const list = [ADMIN_EMAIL, ...ADMINS.filter(em => em !== ADMIN_EMAIL)];
      el.innerHTML = `${IS_OWNER ? '' : `<p class="adm-note">Only ${esc(ADMIN_EMAIL)} can change who is an admin.</p>`}<div class="adm-tw"><table class="adm-t"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead><tbody>
        ${list.map(em => { const [rl, rc] = roleOf(em); return `<tr><td><span class="adm-who">${ava(NAMES[em], em)}<b>${esc(NAMES[em] || '—')}</b></span></td><td class="adm-mail">${esc(em)}</td><td><span class="adm-tag ${rc}">${rl}</span></td><td class="adm-act">${IS_OWNER && em !== ADMIN_EMAIL ? kebab([['unadmin', 'Remove admin', em, 'danger']]) : ''}</td></tr>`; }).join('')}</tbody></table></div>`;
      const ab = HA().querySelector('#ad-add'); if (ab) ab.onclick = () => pickUser('Add an admin', 'They’ll be able to open and change every character.', async em => { if (!em || em === ADMIN_EMAIL) return;
        try { await cfg.set({ emails: FV.arrayUnion(em) }, { merge: true }); ADMINS = [...new Set(ADMINS.concat(em))]; toast(nameOf(em) + ' is now an admin.'); tabAdmins(); } catch (x) { toast('Couldn\'t add the admin: ' + (x.message || x)); } });
      el.querySelectorAll('[data-mi="unadmin"]').forEach(b => b.onclick = async () => { const em = b.dataset.id; try { await cfg.set({ emails: FV.arrayRemove(em) }, { merge: true }); ADMINS = ADMINS.filter(x => x !== em); toast(em + ' is no longer an admin.'); tabAdmins(); } catch (x) { toast('Couldn\'t remove the admin: ' + (x.message || x)); } });
    }
    frame(); wireDie(root);
    root.addEventListener('click', e => { if (e.target.closest && e.target.closest('.hl-txt')) location.href = HUB; });
    // the count on "New" shows even while you're on another section
    if (TAB !== 'new') Promise.all([usersCol.where('createdAt', '>', CHECKED).limit(51).get(), charsCol.where('createdAt', '>', CHECKED).limit(101).get()]).then(([u, c]) => { const fresh = new Set(u.docs.map(d => d.id)); NEWN = u.size + c.docs.filter(d => !fresh.has(d.data().owner)).length; const t = root.querySelector('[data-tab="new"]'); if (t && NEWN && !t.querySelector('.adm-badge')) t.insertAdjacentHTML('beforeend', `<b class="adm-badge">${NEWN}</b>`); }, () => {});
  }

}
