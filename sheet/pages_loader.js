// Site loader. Addresses on adventurers-tome.web.app:
//   /                       your characters          /shared        characters shared with you
//   /login                  sign in                  /new           a brand-new character
//   /<player>/<character>   a character, e.g. /chad-brooker/hiro (old names keep working after a rename)
//   /c/<id>                 a character by its id    /admin[/users|characters|admins|new]   the admin section
// The github.io backup copy keeps the older ?c=<id> / ?g=<group> / ?new=1 addresses, and those still work here too.
// Everyone signs in once per device (Google, or a link emailed to them). Each character belongs to one email;
// the database only lets that player — and the DM — open or change it.
// Every way of leaving a page fades it out first, so the next page's loading screen fades in instead of popping.
const PG_CALM = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
// Leaving a page: the loading screen (dice and all) fades in over it right away, and the next page starts with that same
// screen already showing, so there's no blank gap before the dice appear.
function pgGo(url, replace) { const go = () => { if (url == null) location.reload(); else if (replace) location.replace(url); else location.href = url; };
  if (PG_CALM) return go(); try { sessionStorage.setItem('pg-nav', String(Date.now())); } catch (e) {}
  // Already on a loading screen (e.g. finishing a sign-in link): keep it up and go straight on, so it doesn't fade out
  // and back in. The sign-in card counts as a page: the loading screen fades in over it, like leaving any page.
  const cur = document.getElementById('pg-load'), onCard = cur && cur.querySelector('.pg-signin, .pg-msg');
  if (cur && !onCard && !cur.classList.contains('pg-leave')) { go(); return; }
  if (cur && cur.classList.contains('pg-leave')) return; // already on the way out
  if (window.PG_LOAD_HTML && (!cur || onCard)) { const t = document.createElement('div'); t.innerHTML = window.PG_LOAD_HTML; const el = t.firstElementChild; el.classList.add('pg-leave'); el.style.zIndex = '10000'; document.body.appendChild(el);
    // the die stays still at rest while this page is left, and starts rolling on the next page (no jump between the two)
    setTimeout(go, 260); return; }
  document.documentElement.classList.add('pg-leaving'); setTimeout(go, 280); }
addEventListener('pageshow', e => { if (e.persisted) document.querySelectorAll('#pg-load.pg-leave').forEach(x => x.remove()); });
window.pgGo = pgGo;
// ================= Light / dark =================
// Follows the device until someone picks one with the sun/moon button in the lobby; the pick is kept on this device.
const pgDark = () => { const t = document.documentElement.getAttribute('data-pgtheme'); if (t) return t === 'dark'; try { return matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; } };
const PG_SUN = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
const PG_MOON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const themeLabel = () => pgDark() ? 'Switch to light mode' : 'Switch to dark mode';
function themeBtnHTML() { return `<button class="hub-theme" id="hub-theme" title="${themeLabel()}" aria-label="${themeLabel()}">${pgDark() ? PG_SUN : PG_MOON}</button>`; }
function wireThemeBtn(root) { const b = root.querySelector('#hub-theme'); if (!b) return;
  b.onclick = () => { const next = pgDark() ? 'light' : 'dark', de = document.documentElement;
    // The whole page cross-fades from one look to the other (where the browser can), so nothing changes colour unevenly.
    const flip = () => { de.setAttribute('data-pgtheme', next); try { localStorage.setItem('pg-theme', next); } catch (e) {}
      b.innerHTML = pgDark() ? PG_SUN : PG_MOON; b.title = themeLabel(); b.setAttribute('aria-label', themeLabel()); };
    const spin = () => { if (b.animate && !PG_CALM && b.firstElementChild) b.firstElementChild.animate([{ transform: 'rotate(-90deg) scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.2,.9,.3,1)' }); };
    // With the cross-fade, the old icon turns away and the new one turns in at the same time (see #hub-theme svg in the CSS).
    if (!PG_CALM && document.startViewTransition) document.startViewTransition(flip); else { flip(); spin(); } }; }
// Small pop-up windows (contact, add to home screen, confirmations) fade out when closed instead of vanishing.
// iPhones only show the pressed look (:active) on pages that listen for touches.
document.addEventListener('touchstart', () => {}, { passive: true });
function pgOutFade(m) { m.remove = () => { if (m._closing) return; m._closing = true;
  if (PG_CALM || !m.isConnected) return Element.prototype.remove.call(m); m.classList.add('closing'); setTimeout(() => Element.prototype.remove.call(m), 170); }; }
// Tabs tell each other about signing in, so finishing an emailed link in a new tab signs in the tab you started from.
const PG_BC = (() => { try { return new BroadcastChannel('pg-auth'); } catch (e) { return null; } })();
function pgAuthHandoff() { return new Promise(res => { if (!PG_BC) return res(false); let done = false;
  const fin = v => { if (done) return; done = true; PG_BC.removeEventListener('message', on); res(v); };
  const on = e => { if (e.data && e.data.t === 'ack') fin(true); };
  PG_BC.addEventListener('message', on); PG_BC.postMessage({ t: 'signed-in' }); setTimeout(() => fin(false), 800); }); }
// ================= Add to home screen =================
// Android browsers offer their own install prompt, which is caught here so a button can open it later. iPhones have no
// such prompt, so there the button shows the steps instead. Nothing shows once the site is running as an installed app.
let PG_INSTALL = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); PG_INSTALL = e; document.querySelectorAll('.pg-a2hs').forEach(x => x.hidden = false); });
addEventListener('appinstalled', () => { PG_INSTALL = null; try { localStorage.setItem('pg-installed', '1'); } catch (e) {} document.querySelectorAll('.pg-a2hs').forEach(x => x.remove()); });
const pgStandalone = () => { try { return matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true; } catch (e) { return false; } };
const pgIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const pgMobile = () => pgIOS() || /Android|Mobile/i.test(navigator.userAgent);
function a2hsHTML() { if (pgStandalone() || !pgMobile()) return '';
  return `<p class="pg-a2hs"><a href="#a2hs"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M12 8v6M9 11h6"/></svg>Add to home screen</a></p>`; }
function wireA2HS(root) { const el = root && root.querySelector('.pg-a2hs'); if (!el) return;
  // Already installed (Android can tell from the browser): don't offer it again.
  try { if (navigator.getInstalledRelatedApps) navigator.getInstalledRelatedApps().then(l => { if (l && l.length) el.remove(); }).catch(() => {}); } catch (e) {}
  el.querySelector('a').onclick = async e => { e.preventDefault();
    if (PG_INSTALL) { const p = PG_INSTALL; PG_INSTALL = null; try { p.prompt(); const r = await p.userChoice; if (r && r.outcome === 'accepted') el.remove(); } catch (x) {} return; }
    a2hsSteps(); }; }
function a2hsSteps() {
  const share = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
  const dots = '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" style="vertical-align:-3px"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';
  const steps = pgIOS() ? [`Tap the <b>Share</b> button ${share} in your browser's toolbar.`, 'Scroll down and tap <b>Add to Home Screen</b>.', 'Tap <b>Add</b>.']
    : [`Open your browser's menu ${dots}.`, 'Tap <b>Add to Home screen</b> or <b>Install app</b>.', 'Tap <b>Add</b> or <b>Install</b>.'];
  const m = document.createElement('div'); m.className = 'pg-out'; pgOutFade(m);
  m.innerHTML = `<div class="pg-out-card pg-a2hs-card" role="dialog" aria-modal="true" aria-labelledby="pg-a2-h"><h2 id="pg-a2-h">Add to home screen</h2><p>Open Adventurer’s Tome like an app, full screen, from your home screen.</p><ol>${steps.map(s => `<li>${s}</li>`).join('')}</ol><div class="pg-out-row"><button class="pg-out-no">Got it</button></div></div>`;
  const close = () => { m.remove(); document.removeEventListener('keydown', key); }, key = e => { if (e.key === 'Escape') close(); };
  m.onclick = e => { if (e.target === m) close(); }; m.querySelector('.pg-out-no').onclick = close; document.addEventListener('keydown', key); document.body.appendChild(m); }
  // On a computer the sheet's own scrollbar is swapped for a slim one in the sheet's accent colour: drag it, click the
// track to jump a page, or just scroll as usual. It hides when there's nothing to scroll.
function sheetScrollbar() {
  document.documentElement.classList.add('pg-sbon');
  const sb = document.createElement('div'); sb.className = 'pg-sb'; sb.hidden = true; sb.innerHTML = '<div class="pg-sb-th"></div>'; document.body.appendChild(sb); const th = sb.firstElementChild;
  const de = document.documentElement;
  // What scrolls: the page, or the character wizard while it's open (it scrolls on its own, over the page).
  const S = () => { const w = document.querySelector('#wizard.open'); if (w) return { y: w.scrollTop, vis: w.clientHeight, all: w.scrollHeight, to: y => { w.scrollTop = y; }, by: o => w.scrollBy(o) };
    return { y: scrollY, vis: innerHeight, all: de.scrollHeight, to: y => scrollTo(0, y), by: o => scrollBy(o) }; };
  const paint = () => { const g = S(), max = g.all - g.vis; if (max < 2 || document.querySelector('#modal.open')) { sb.hidden = true; return; } sb.hidden = false;
    const H = sb.clientHeight, h = Math.max(36, H * g.vis / g.all); th.style.height = h + 'px'; th.style.transform = `translateY(${(H - h) * (g.y / max)}px)`; };
  document.addEventListener('scroll', paint, { passive: true, capture: true }); addEventListener('resize', paint); new ResizeObserver(paint).observe(document.body);
  new MutationObserver(paint).observe(document.body, { attributes: true, childList: true, subtree: true, attributeFilter: ['class'] }); setTimeout(paint, 100);
  th.addEventListener('pointerdown', e => { e.preventDefault(); th.classList.add('drag'); th.setPointerCapture(e.pointerId);
    const g = S(), y0 = e.clientY, s0 = g.y, k = (g.all - g.vis) / Math.max(1, sb.clientHeight - th.offsetHeight);
    const mv = ev => g.to(s0 + (ev.clientY - y0) * k), up = () => { th.classList.remove('drag'); th.removeEventListener('pointermove', mv); th.removeEventListener('pointerup', up); th.removeEventListener('pointercancel', up); };
    th.addEventListener('pointermove', mv); th.addEventListener('pointerup', up); th.addEventListener('pointercancel', up); });
  sb.addEventListener('pointerdown', e => { if (e.target !== sb) return; const g = S(); g.by({ top: (e.clientY < th.getBoundingClientRect().top ? -1 : 1) * g.vis * .85, behavior: 'smooth' }); });
}
{
  // Windows and menus fade out instead of vanishing: when one loses its "open" class it keeps showing (as .closing,
  // not clickable) just long enough to fade, and opening it again cancels that.
  const W = [['.hub-modal', 'on'], ['.hc-menu', 'on'], ['.adm-mwrap', 'on']];
  const match = el => W.find(([sel]) => el.matches && el.matches(sel));
  new MutationObserver(ms => ms.forEach(m => { const el = m.target, w = match(el); if (!w) return; const cls = w[1], was = (' ' + (m.oldValue || '') + ' ').includes(' ' + cls + ' '), now = el.classList.contains(cls);
    if (now) { if (!was && el.classList.contains('closing')) { clearTimeout(el._fc); el.classList.remove('closing'); } return; }
    if (was && !now && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { el.classList.add('closing'); clearTimeout(el._fc); el._fc = setTimeout(() => el.classList.remove('closing'), 190); } }))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['class'], attributeOldValue: true, subtree: true });
}
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
try { if (STANDALONE) document.documentElement.classList.add('pg-standalone'); } catch (e) {}
const RESERVED = new Set(['shared', 'login', 'new', 'create', 'character', 'admin', 'c', 'a', 'icons', 'icon', 'index', 'index-html', 'version-json', 'users', 'help', 'settings']);
const slugify = s => String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const enc = encodeURIComponent;
// A character's address: /character/zeebo (older /player/character addresses stay as they were).
const pathURL = pth => pth.includes('/') ? '/' + pth : '/character/' + pth;
const URLS = {
  hub: G => PRETTY ? '/' : LEG + '?g=' + G,
  shared: G => PRETTY ? '/shared' : LEG + '?g=' + G + '&view=shared',
  admin: (G, tab) => PRETTY ? '/admin' + (tab ? '/' + tab : '') : LEG + '?g=' + G + '&admin=1' + (tab ? '&tab=' + tab : ''),
  char: c => PRETTY ? (c.path ? pathURL(c.path) : '/c/' + c.id) : LEG + '?c=' + c.id,
  byId: id => PRETTY ? '/c/' + id : LEG + '?c=' + id,
  newChar: (G, o, p) => { try { if (o) sessionStorage.setItem('pg-newfor', JSON.stringify({ o, p: p || '' })); else sessionStorage.removeItem('pg-newfor'); } catch (e) {} return PRETTY ? '/create' : LEG + '?new=1&g=' + G; },
};
// Search keys for an account or character: every prefix of each word (and of the whole name / email), so the admin
// pages can find "ryan", "o'neal" or "roneal1994@…" with one indexed lookup however many accounts there are.
function searchKeys(...parts) { const out = new Set(); parts.forEach(p => { p = String(p || '').toLowerCase().trim(); if (!p) return;
  new Set([p, ...p.split(/[\s@._'’-]+/)]).forEach(t => { t = t.slice(0, 24); for (let i = 1; i <= t.length; i++) out.add(t.slice(0, i)); }); }); return [...out].slice(0, 400); }
// A person's little picture: their chosen character portrait (or their first character's), else initials on a colour
// picked from their email so the same person always looks the same.
const escH = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const hueOf = t => [...String(t || '?')].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 360, 7);
// first and last initials: "Matthew Breaux" → MB, "Shade of Twilight of the Dark Forest" → SF
const initials = (name, em) => { const w = String(name || em || '?').split(/[\s@._-]+/).filter(x => /[\p{L}\p{N}]/u.test(x)); return w.length ? (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase() : '?'; };
// A person's picture: their initials on a colour (theirs, or one picked from their email), a character portrait, or an
// uploaded image — which, if it has a transparent background, is shown as-is with no circle or border.
// Where people can reach us. A plain mailto link does nothing on a computer with no email app set up, so this opens a
// small box with the address, a copy button, and links to Gmail and the device's email app.
const CONTACT_EMAIL = 'adventurerstome@googlegroups.com', CONTACT = '#contact';
function pgContact() {
  if (document.querySelector('.pg-out')) return;
  const su = encodeURIComponent('Adventurer’s Tome'), m = document.createElement('div'); m.className = 'pg-out'; pgOutFade(m);
  m.innerHTML = `<div class="pg-out-card" role="dialog" aria-modal="true" aria-labelledby="pg-ct-h"><h2 id="pg-ct-h">Contact us</h2><p>Questions, ideas or something not working? Email us at</p>
    <div class="pg-ct-mail"><span>${CONTACT_EMAIL}</span><button class="pg-ct-copy">Copy</button></div>
    <div class="pg-out-row pg-ct-row"><a class="pg-ct-btn" target="_blank" rel="noopener" href="https://mail.google.com/mail/u/0/?view=cm&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${su}">Open in Gmail</a><a class="pg-ct-btn" href="mailto:${CONTACT_EMAIL}?subject=${su}">Email app</a><button class="pg-out-no">Close</button></div></div>`;
  const close = () => { m.remove(); document.removeEventListener('keydown', key); }, key = e => { if (e.key === 'Escape') close(); };
  m.onclick = e => { if (e.target === m) close(); }; m.querySelector('.pg-out-no').onclick = close;
  // On a computer, Gmail opens in its own small window sized to the message, rather than a full tab with empty sides.
  m.querySelector('.pg-ct-btn[target]').onclick = e => { if (!matchMedia('(pointer: fine)').matches || innerWidth < 700) return;
    const w = 760, h = 680, x = Math.max(0, (screenX || 0) + (outerWidth - w) / 2), y = Math.max(0, (screenY || 0) + (outerHeight - h) / 2);
    if (window.open(e.currentTarget.href, 'pg-gmail', `popup,width=${w},height=${h},left=${Math.round(x)},top=${Math.round(y)}`)) { e.preventDefault(); close(); } };
  m.querySelector('.pg-ct-copy').onclick = async e => { const b = e.target; try { await navigator.clipboard.writeText(CONTACT_EMAIL); b.textContent = 'Copied'; } catch (x) { const r = document.createRange(); r.selectNodeContents(m.querySelector('.pg-ct-mail span')); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); b.textContent = 'Selected'; } setTimeout(() => { b.textContent = 'Copy'; }, 1600); };
  document.addEventListener('keydown', key); document.body.appendChild(m); }
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href="#contact"], [data-contact]'); if (a) { e.preventDefault(); pgContact(); } });
const PG_SWATCH = ['#b4473a', '#d0743c', '#c9962b', '#7f9a35', '#2f8f62', '#24879a', '#3a6fb4', '#5a55b8', '#8a4cb0', '#b04c86', '#6b7280', '#2b3245'];
const okColor = c => /^#[0-9a-f]{6}$/i.test(c || '') ? c : '';
const inkOn = hex => { const n = parseInt(hex.slice(1), 16); return (.299 * (n >> 16 & 255) + .587 * (n >> 8 & 255) + .114 * (n & 255)) > 170 ? '#1b1406' : '#fff'; };
// What someone's picture is: their Google account photo unless they've chosen something else (initials, a character, an upload).
const picModeOf = u => (u && u.picMode) || (u && u.picChar ? 'char' : u && u.pic ? 'upload' : u && okColor(u.picColor) ? 'initials' : 'google');
const avaOf = u => { const color = okColor(u && u.picColor), m = picModeOf(u);
  if (m === 'google') return { pic: (u && u.gpic) || '', color, clear: false };
  if (m === 'initials') return { pic: '', color, clear: false };
  return { pic: (u && u.pic) || '', color, clear: m === 'upload' && !!(u && u.pic && u.picClear) }; };
const avaStyle = (o, key) => { const c = okColor(o && o.color); return c ? `background:${c};color:${inkOn(c)}` : `--h:${hueOf(key)}`; };
function avaHTML(name, em, pic, cls = '', title = '', o = {}) { const clear = !!(pic && o.clear); title = title || name || '';
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
  const CFG = __CFG__, VER = '__VER__', ASSETS = __ASSETS__; window.PG_ASSETS = ASSETS;
  const Q = new URLSearchParams(location.search), clean = v => (v || '').replace(/[^A-Za-z0-9_-]/g, '');
  // The "?v=…" an automatic update reload adds (so the browser fetches the new version) isn't kept in the address bar.
  if (Q.has('v')) { const u = new URL(location.href); u.searchParams.delete('v'); history.replaceState(history.state, '', u.pathname + u.search + u.hash); }
  let C = clean(Q.get('c')), G = clean(Q.get('g'));
  // Phone view on a computer: the sheet runs inside a phone-sized frame, so it looks exactly as it does on a phone.
  const FRAMED = window.top !== window && Q.has('pgframe'), PHONE_KEY = 'pg-phoneview';
  if (FRAMED) { window.PG_IN_PHONE = true; window.PG_FORCE_MOBILE = true; document.documentElement.classList.add('pg-inphone'); }
  window.pgPhoneView = on => { try { localStorage.removeItem(PHONE_KEY); on ? sessionStorage.setItem(PHONE_KEY, '1') : sessionStorage.removeItem(PHONE_KEY); } catch (e) {}
    if (FRAMED) { try { window.top.pgGo ? window.top.pgGo(null) : window.top.location.reload(); } catch (e) {} } else pgGo(null); };
  // Making a character for someone else (admins): who it's for travels with the page, not in its address.
  const NEWFOR = (() => { try { return JSON.parse(sessionStorage.getItem('pg-newfor') || 'null') || {}; } catch (e) { return {}; } })();
  const P = String(Q.get('p') || NEWFOR.p || '').slice(0, 60), O = String(Q.get('o') || NEWFOR.o || '').trim().toLowerCase().slice(0, 120);
  const LAST_G = 'dnd-hub-group';
  let NEWQ = !!Q.get('new'), ADMINQ = !!Q.get('admin'), TABQ = clean(Q.get('tab')), VIEWQ = Q.get('view') === 'shared' ? 'shared' : 'mine', LOGIN = false, SLUG = '', BAD = false, VIEWTOK = String(Q.get('pv') || '').replace(/[^\w-]/g, '').slice(0, 40);
  if (PRETTY) {
    const parts = location.pathname.split('/').filter(Boolean).map(x => { try { return decodeURIComponent(x); } catch (e) { return x; } });
    if (parts.length === 1 && parts[0] === 'index.html') parts.length = 0;
    if (!parts.length) {}
    else if (parts.length === 1 && parts[0] === 'shared') VIEWQ = 'shared';
    else if (parts.length === 1 && parts[0] === 'login') LOGIN = true;
    else if (parts.length === 1 && (parts[0] === 'create' || parts[0] === 'new')) NEWQ = true;
    else if (parts[0] === 'admin' && parts.length <= 2) { ADMINQ = true; TABQ = clean(parts[1] || ''); }
    else if (parts[0] === 'c' && parts.length === 2) C = clean(parts[1]);
    else if (parts[0] === 'view' && parts.length === 2) VIEWTOK = String(parts[1]).replace(/[^\w-]/g, '').slice(0, 40); // view-only link, no sign-in
    else if (parts[0] === 'character' && parts.length === 2 && slugify(parts[1])) SLUG = slugify(parts[1]); // /character/zeebo
    else if (parts.length === 2) SLUG = slugify(parts[0]) + '/' + slugify(parts[1]); // older /player/character addresses
    else if (parts.length === 1 && slugify(parts[0])) SLUG = slugify(parts[0]);
    else BAD = true;
    if (!C && !SLUG) G = G || DEFAULT_G;
  }
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  // The loading screen fades away over the page instead of vanishing, and links between pages fade out first.
  // The page underneath stays hidden until the loading screen has fully faded in; then the screen fades away over it.
  function fadeLoad(el) { const de = document.documentElement; if (!el || !el.isConnected) { de.classList.remove('pg-loading'); return; }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { de.classList.remove('pg-loading'); return el.remove(); }
    const anims = el.getAnimations ? el.getAnimations().filter(a => a.playState === 'running') : [];
    Promise.race([Promise.all(anims.map(a => a.finished.catch(() => {}))), new Promise(r => setTimeout(r, 700))]).then(() => {
      const cur = getComputedStyle(el).opacity; el.style.animation = 'none'; el.style.opacity = cur; el.style.pointerEvents = 'none'; el.style.zIndex = '9999'; el.style.transition = 'opacity .6s ease'; void el.offsetWidth;
      de.classList.remove('pg-loading'); setTimeout(() => de.classList.remove('pg-instant'), 700);
      requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 650); })); }); }
  document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    let u; try { u = new URL(a.href, location.href); } catch (x) { return; } if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; e.preventDefault(); pgGo(u.href); });
  addEventListener('pageshow', () => document.documentElement.classList.remove('pg-leaving'));
  const load = document.getElementById('pg-load'), data = document.getElementById('sheet-data');
  if (load) window.PG_LOAD_HTML = load.outerHTML;
  const say = html => { if (!load) return; load.innerHTML = `<div class="pg-msg">${html}</div>`; const m = load.firstElementChild; if (m && m.animate && !PG_CALM) m.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'ease-out' }); load.style.opacity = ''; load.style.transition = ''; };
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
    try { await auth.signInWithEmailLink((em || '').trim(), location.href);
      // The link opened a new tab. If the tab that asked for it is still open, it takes over (it reloads, signed in)
      // and this tab says so and closes itself where the browser allows; otherwise carry on here as before.
      if (await pgAuthHandoff()) { say(`<div class="pg-signin pg-done">${logoHTML()}<h2>You're signed in</h2><p>Your Adventurer’s Tome tab is ready. You can close this one.</p></div>`); wireDie(document.getElementById('pg-load')); setTimeout(() => { try { window.close(); } catch (x) {} }, 900); return; }
      pgGo(lsGet('dnd-signin-back') || location.pathname, true); }
    catch (e) { say(`That sign-in link didn't work (${(e && e.message) || 'expired or already used'}).<br><br><a href="${location.pathname}">Try again</a>`); }
    return;
  }
  // A view-only link: the sheet's public copy, for anyone, signed in or not. Nothing typed here is saved.
  if (VIEWTOK) { const t = VIEWTOK, pc = fs.collection('pub'); let txt = null;
    try { const d = await pc.doc(t).get(); if (d.exists) { const x = d.data(); let str = x.data || ''; const n = Number(x.n) || 1;
      for (let k = 1; k < n; k++) { const q = await pc.doc(t + '_p' + k).get(); if (!q.exists || Number(q.data().savedAt) !== Number(x.savedAt)) { str = null; break; } str += q.data().data || ''; }
      if (str) { JSON.parse(str); txt = str; } } } catch (e) { console.warn('view link', e); }
    if (!txt) { say(`This view-only link isn’t working — it may have been turned off.<br><br><a href="${PRETTY ? '/' : location.pathname}">Go to Adventurer’s Tome</a>`); return; }
    data.textContent = txt; window.SHEET_PAGES = true; window.SHEET_CHAR = 'pub_' + t; window.PG_PUBLIC = true;
    document.documentElement.classList.add('pg-sheetpage', 'pg-public');
    const ref = p => { const m = /^sheets\/(main|part(\d+))$/.exec(p); return m ? pc.doc(m[2] ? t + '_p' + m[2] : t) : null; };
    const none = { get: async () => ({ exists: false, data: () => null }), set: async () => { throw { code: 'unsupported' }; }, delete: async () => {}, onSnapshot: () => () => {} };
    const db = { doc: p => { const r = ref(p); if (!r) return none; return { get: () => r.get(), set: () => Promise.reject({ code: 'permission-denied' }), delete: async () => {}, onSnapshot: (cb, err) => r.onSnapshot(cb, err) }; } };
    window.claude = { use: async n => n === 'db' ? db : n === 'user' ? { id: async () => null, isOwner: async () => false, can: async () => false } : null };
    let src; try { src = await Promise.all([ASSETS.data, ASSETS.app].map(u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.text(); }))); } catch (e) { say('Couldn\'t load the sheet. Check your connection and reload.'); return; }
    if (!load) document.documentElement.classList.remove('pg-loading');
    src.forEach(x => { const sc = document.createElement('script'); sc.textContent = x; document.body.appendChild(sc); });
    if (!TOUCH && !FRAMED) sheetScrollbar();
    if (load) { if (!load.isConnected) document.body.appendChild(load); const go = () => fadeLoad(load); if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 600 }); else setTimeout(go, 150); }
    if (ASSETS.full) fetch(ASSETS.full).then(r => r.ok ? r.text() : '').then(x => { if (!x) return; const sc = document.createElement('script'); sc.textContent = x; document.body.appendChild(sc); try { if (typeof render === 'function') render(); } catch (e) {} }, () => {});
    const tag = document.createElement('div'); tag.className = 'pg-shared view pg-pubtag'; tag.innerHTML = `View only (changes are not saved) · <a href="${PRETTY ? '/' : location.pathname}">Adventurer’s Tome</a>`; document.body.appendChild(tag);
    try { const st = JSON.parse(txt); if (st && st.name) document.title = st.name + ' — Adventurer’s Tome'; } catch (e) {}
    return; }
  if (!PRETTY && !C && !G && !NEWQ) { location.replace(location.pathname + '?g=' + (clean(lsGet(LAST_G)) || DEFAULT_G)); return; }
  if (!G && NEWQ) G = DEFAULT_G;
  // old-style addresses arriving here (bookmarks, the github.io handover) switch to the clean ones
  if (PRETTY && !STANDALONE && ['c', 'g', 'new', 'admin', 'view', 'tab'].some(k => Q.has(k))) {
    if (NEWQ && Q.get('o')) try { sessionStorage.setItem('pg-newfor', JSON.stringify({ o: Q.get('o'), p: Q.get('p') || '' })); } catch (e) {}
    const to = C ? '/c/' + C : NEWQ ? '/create' : ADMINQ ? '/admin' + (TABQ ? '/' + TABQ : '') : VIEWQ === 'shared' ? '/shared' : '/';
    history.replaceState(null, '', to); }
  if (BAD) { say(`There’s nothing at this address.<br><br><a href="/">Go to your characters</a>`); return; }
  const user = await new Promise(res => { const u = auth.onAuthStateChanged(x => { u(); res(x); }); });
  if (!user) { if (PRETTY && !LOGIN) { const here = location.pathname + location.search; history.replaceState(null, '', '/login' + (here !== '/' ? '?next=' + enc(here) : '')); } signIn(auth, say); return; }
  if (LOGIN) { const nx = Q.get('next') || '/'; pgGo(/^\/(?!\/)/.test(nx) ? nx : '/', true); return; } // keeps the loading screen up (no fade out and back in)
  const EMAIL = (user.email || '').toLowerCase(), IS_OWNER = EMAIL === ADMIN_EMAIL;
  let IS_ADMIN = IS_OWNER, ADMINS = [];
  try { const a = await fs.collection('config').doc('admins').get(); ADMINS = ((a.exists && a.data().emails) || []).map(x => String(x).toLowerCase()); if (ADMINS.includes(EMAIL)) IS_ADMIN = true; } catch (e) {}
  const doSignOut = () => Promise.resolve(window.pgLog && pgLog('signout')).then(() => auth.signOut()).then(() => pgGo(PRETTY ? '/login' : location.href, true));
  // Signing out always asks first.
  const signOut = () => {
    if (document.querySelector('.pg-out')) return;
    const m = document.createElement('div'); m.className = 'pg-out'; pgOutFade(m);
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
  let ME = null, NEWACCT = false, ACCT_OK = false, ACCT_ERR = '';
  try { const us = await UREF.get(); ME = us.exists ? us.data() : null;
    if (!ME) { NEWACCT = true; const nm = (user.displayName || EMAIL.split('@')[0]).slice(0, 60); ME = { email: EMAIL, name: nm, nameLower: nm.toLowerCase(), keys: searchKeys(nm, EMAIL.split('@')[0], EMAIL), createdAt: Date.now(), seenAt: Date.now() }; if (user.photoURL) ME.gpic = user.photoURL; await UREF.set(ME); }
    // "Last seen" doubles as "on the site right now": refreshed every couple of minutes while a page is showing.
    else if (!ME.seenAt || Date.now() - ME.seenAt > 60000) UREF.update({ seenAt: Date.now() }).catch(() => {});
    { let lastBeat = Date.now(); const beat = () => { if (document.hidden || Date.now() - lastBeat < 100000) return; lastBeat = Date.now(); UREF.update({ seenAt: lastBeat }).catch(() => {}); };
      setInterval(beat, 120000); document.addEventListener('visibilitychange', beat); }
    ACCT_OK = true;
    // keep their Google account photo on file (it's their picture until they choose another)
    if (ME && user.photoURL && ME.gpic !== user.photoURL) { ME.gpic = user.photoURL; UREF.update({ gpic: user.photoURL }).catch(() => {}); } } catch (e) { ACCT_ERR = (e && e.code) || ''; console.warn('account record', e); }
  let NAME = (ME && ME.name) || user.displayName || EMAIL.split('@')[0];
  // Activity log (admins can read it): who did what, when.
  window.pgLog = (act, f = {}) => { try { const e = { at: Date.now(), by: EMAIL, byName: NAME, act };
    ['target', 'tName', 'detail'].forEach(k => { if (f[k] != null && f[k] !== '') e[k] = String(f[k]).slice(0, 1500); }); return fs.collection('audit').add(e).catch(() => {}); } catch (e) { return Promise.resolve(); } };
  // A fresh sign-in (not just a remembered session) and a brand-new account are logged once.
  try { const ls0 = Date.parse(user.metadata.lastSignInTime || '') || 0, mark = 'pg-signin-logged'; if (Date.now() - ls0 < 180000 && lsGet(mark) !== String(ls0)) { lsSet(mark, String(ls0)); pgLog(NEWACCT ? 'account' : 'signin'); } } catch (e) {}
  // An admin can sign someone out of every device, or block them. Checked now and whenever their account record changes.
  let AUTHAT = 0; try { AUTHAT = Date.parse((await user.getIdTokenResult()).authTime) || 0; } catch (e) {}
  const kicked = d => d && (d.banned === true ? 'This account has been blocked. If you think this is a mistake, contact adventurerstome@googlegroups.com.' : (Number(d.revokedAt) || 0) > AUTHAT ? 'You’ve been signed out.' : '');
  const kick = msg => { lsSet('pg-kicked', msg); auth.signOut().then(() => pgGo(PRETTY ? '/login' : location.href, true)); };
  // (when the database refuses even their own account record, an admin has signed them out or blocked them)
  const LOCKED = 'You’ve been signed out.';
  { const k0 = kicked(ME) || (ACCT_ERR === 'permission-denied' ? LOCKED : ''); if (k0) { kick(k0); return; } }
  UREF.onSnapshot(d => { const k = kicked(d.exists ? d.data() : null); if (k) kick(k); }, e => { if (e && e.code === 'permission-denied') kick(LOCKED); });
  const UCACHE = {}, userDoc = em => UCACHE[em] || (UCACHE[em] = fs.collection('users').doc(em).get().then(x => x.exists ? x.data() : null, () => null));

  // A newer version of the site was pushed: load it. The party page reloads right away; a sheet reloads as soon as
  // nobody is in the middle of using it (or on a tap), after its last change has saved. The new address carries
  // the version so the browser can't hand back its old cached copy.
  // Updates arrive silently: a newer version is picked up the next time the tab is in the background (or on the next
  // page you open) — never while you're looking at it, never mid character creation, level-up, or any open window.
  const verCheck = () => { let NEWV = null, hideT = null;
    const blocked = () => { const a = document.activeElement; return NEWQ || !!(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) || !!document.querySelector('#wizard.open, #modal.open, .modal-bg.open, .hub-modal.on, .pg-out')
      || (typeof LV !== 'undefined' && !!LV) || (typeof PEND !== 'undefined' && !!PEND) || (typeof W !== 'undefined' && W && W.step != null && document.querySelector('#wizard.open')); };
    const go = () => { if (!NEWV || !document.hidden || blocked()) return; try { sessionStorage.setItem('pg-y', JSON.stringify({ y: scrollY, at: Date.now(), p: location.pathname })); } catch (e) {} location.reload(); };
    let checking = false; const check = async () => { if (NEWV || checking) return; checking = true; try { const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' }); const v = (await r.json()).v; if (v && v !== VER) { NEWV = v; go(); } } catch (e) {} finally { checking = false; } };
    setInterval(check, 60 * 1000); setTimeout(check, 5000);
    // once the tab has been in the background for a few seconds (not just a quick glance at another tab)
    document.addEventListener('visibilitychange', () => { clearTimeout(hideT); if (document.hidden) hideT = setTimeout(go, 4000); else check(); });
    setInterval(() => { if (NEWV && document.hidden) go(); }, 30000); };
  // …and you land back where you were: the same scroll position
  const restoreY = () => { try { const d = JSON.parse(sessionStorage.getItem('pg-y') || 'null'); sessionStorage.removeItem('pg-y'); if (d && d.p === location.pathname && Date.now() - d.at < 10 * 60000 && d.y > 0) setTimeout(() => scrollTo(0, d.y), 350); } catch (e) {} };
  if (G && !C && !NEWQ) { lsSet(LAST_G, G); if (ADMINQ && !IS_ADMIN && PRETTY) history.replaceState(null, '', '/');
    if (load) fadeLoad(load); else document.documentElement.classList.remove('pg-loading'); hub(fs, auth, G, { EMAIL, IS_ADMIN, IS_OWNER, ADMINS, user, signOut, ME, page: ADMINQ && IS_ADMIN ? 'admin' : 'hub', view: VIEWQ, tab: TABQ }); verCheck(); restoreY();
    // quietly warm the cache so opening a sheet from here is quick
    // (not on a very slow or data-saving connection, and only once the page has settled, so it never slows the list down)
    const cn = navigator.connection || {}, slowNet = cn.saveData || /(^|-)2g$/.test(cn.effectiveType || '');
    if (!slowNet) setTimeout(() => (window.requestIdleCallback || (f => setTimeout(f, 1)))(() => [ASSETS.data, ASSETS.app, ASSETS.full].filter(Boolean).forEach(u => { const l = document.createElement('link'); l.rel = 'prefetch'; l.href = u; document.head.appendChild(l); })), 4000); return; }

  // Phone view chosen on a wide screen: show the sheet in a phone frame instead of stretching the phone layout.
  // (asked for just now — it's used once, so reloading or coming back later shows the layout for this device again)
  let phoneOn = false; try { phoneOn = sessionStorage.getItem(PHONE_KEY) === '1'; sessionStorage.removeItem(PHONE_KEY); localStorage.removeItem(PHONE_KEY); } catch (e) {}
  if (C && !NEWQ && !FRAMED && phoneOn && innerWidth >= 640) {
    document.documentElement.classList.add('pg-phonehost');
    const u = new URL(location.href); u.searchParams.set('pgframe', '1'); u.searchParams.delete('v');
    [...document.body.childNodes].forEach(n => { if (n !== load) n.remove(); });
    document.body.insertAdjacentHTML('afterbegin', `<div class="pgph"><div class="pgph-bar"><span class="pgph-t"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/></svg>Phone view</span>
      <button class="pgph-back" id="pgph-back"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="13" rx="1.6"/><path d="M8 21h8M12 17v4"/></svg>Back to desktop view</button></div>
      <div class="pgph-dev"><iframe class="pgph-f" src="${escH(u.pathname + u.search)}" title="Character sheet (phone view)"></iframe><div class="pgph-sb" hidden><div class="pgph-th"></div></div></div></div>`);
    document.getElementById('pgph-back').onclick = () => window.pgPhoneView(false);
    // the loading screen stays until the sheet inside the phone is ready, then fades away over the finished view
    { const f = document.querySelector('.pgph-f'), t0 = Date.now(), ready = () => { try { const d = f.contentDocument; return !!d && d.readyState !== 'loading' && !d.getElementById('pg-load') && !!d.querySelector('.banner, #hub'); } catch (e) { return true; } };
      const wait = () => { if (ready() || Date.now() - t0 > 12000) { if (load) fadeLoad(load); else document.documentElement.classList.remove('pg-loading'); } else setTimeout(wait, 100); }; wait(); }
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
  // Making a new character: the wizard gets the lobby's header on top (logo, a way back, who's signed in).
  if (NEW) { const HUBU = URLS.hub(G), nm = (ME && ME.name) || user.displayName || EMAIL.split('@')[0], av = avaOf(ME);
    window.wzHeader = () => `<div class="wzh"><header class="hub-top">${logoHTML()}
      <div class="hub-side"><div class="hub-prof"><span class="hp-pic wzh-pic">${avaHTML(nm, EMAIL, av.pic, '', '', av)}</span><div class="hp-txt"><b>${escH(nm)}</b><small>${escH(EMAIL)}</small><div class="hp-row"><button class="linkbtn" data-wzh="out">Sign out</button><a class="hub-ctlink" href="${CONTACT}">Contact us</a></div></div></div></div></header><a class="adm-back wzh-back" href="${escH(HUBU)}">← Adventurer’s Tome</a></div>`;
    document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.wzh [data-wzh="out"], .wzh .wzh-back'); if (!t) return; e.preventDefault(); if (t.dataset.wzh === 'out') signOut(); else pgGo(HUBU); });
    new MutationObserver(() => { const l = document.querySelector('#wizard .wzh'); if (l && !l._w) { l._w = 1; wireDie(l); } }).observe(document.documentElement, { childList: true, subtree: true }); }
  window.SHEET_PAGES = true; window.SHEET_CHAR = C;
  document.documentElement.classList.add('pg-sheetpage');
  // The game data and the app arrive as separate long-cached files; start fetching them now, run them in order later.
  const fetched = Promise.all([ASSETS.data, ASSETS.app].map(u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.text(); })));
  // started once the essentials have arrived, so it doesn't compete with them on a slow connection
  const fullTxt = fetched.then(() => ASSETS.full ? fetch(ASSETS.full).then(r => r.ok ? r.text() : '', () => '') : '', () => '');
  const run = async () => { let src; try { src = await fetched; } catch (e) { say('Couldn\'t load the sheet. Check your connection and reload.'); return; }
    if (!load) document.documentElement.classList.remove('pg-loading');
    src.forEach(t => { const s = document.createElement('script'); s.textContent = t; document.body.appendChild(s); });
    if (!TOUCH && !FRAMED) sheetScrollbar();
    // wait for the sheet's first burst of work to finish so the fade runs smoothly instead of stuttering
    if (load) { if (!load.isConnected) document.body.appendChild(load); const go = () => fadeLoad(load); if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 600 }); else setTimeout(go, 150); }
    restoreY();
    // then the full rules wording, which only tooltips and the Spells/Features text need: once it's in, redraw so they use it
    fullTxt.then(t => { if (!t) return; const s = document.createElement('script'); s.textContent = t; document.body.appendChild(s); try { if (typeof render === 'function') render(); } catch (e) {} }); };
  const col = fs.collection('sheets'), CACHE = 'dnd-pages-cache:' + C;
  let PUB = '', txt = null, missing = false, denied = false, OWNER = NEW ? ((IS_ADMIN && O) || EMAIL) : '', VIEWERS = [], EDITORS = [];
  if (!NEW) try {
    const sn = await col.doc(C).get();
    if (!sn.exists || !sn.data().data) missing = true;
    else {
      const d = sn.data(); let str = d.data || ''; const n = Number(d.n) || 1;
      if (d.g && !G) G = clean(d.g); OWNER = (d.owner || '').toLowerCase(); VIEWERS = d.viewers || []; EDITORS = d.editors || []; PUB = d.pub || '';
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
    try { await hubCol.doc(C).set(Object.assign({}, sum, when, pth ? { paths: firebase.firestore.FieldValue.arrayUnion(pth) } : {}), { merge: true }); const firstSave = !LASTSUM && NEW; LASTSUM = key; if (firstSave) pgLog('create', { target: C, tName: s.name }); if (pth) showPath(pth); } catch (e) { console.warn('hub', e); } };
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
  const showPath = pth => { if (PRETTY && !STANDALONE && pth && location.pathname !== pathURL(pth)) history.replaceState(null, '', pathURL(pth) + location.search.replace(/([?&])v=[^&]*&?/, '$1').replace(/[?&]$/, '')); };
  const hubSoon = () => { try { const d = digest(window.sheetState()); if (LASTD !== null && d !== LASTD) hubChanged = true; LASTD = d; } catch (e) {}
    clearTimeout(hubT); hubT = setTimeout(() => { const c = hubChanged; hubChanged = false; hubUpdate(c); }, 1200); };

  // The sheet's sync code talks to "db" like it does on claude.ai; here that's this character's Firestore documents.
  const docFor = p => { const m = /^sheets\/(main|part(\d+))$/.exec(p); return m ? [col.doc(m[2] ? C + '_p' + m[2] : C), !m[2]] : null; };
  const none = { get: async () => ({ exists: false, data: () => null }), set: async () => { throw { code: 'unsupported' }; }, delete: async () => {}, onSnapshot: () => () => {} };
  // With a view-only link on, every save is mirrored to the public copy (pub/<link>, same layout as the sheet's own documents).
  const pubMirror = (p, v, main) => { if (!PUB) return; const k = (/part(\d+)/.exec(p) || [])[1]; fs.collection('pub').doc(main ? PUB : PUB + '_p' + k).set(Object.assign({ c: C, savedAt: Number(v.savedAt) || Date.now(), data: v.data || '' }, main ? { n: Number(v.n) || 1, v: 2, tab: String(v.tab || 'x') } : {})).catch(() => {}); };
  const db = { doc: p => { const x = docFor(p); if (!x) return none; const [r, main] = x;
    return { get: () => r.get(), set: v => { if (role() === 'view') return Promise.reject({ code: 'permission-denied' }); v = Object.assign({}, v, { owner: OWNER, viewers: VIEWERS, editors: EDITORS }, main && G ? { g: G } : {}, main && PUB ? { pub: PUB } : {}); if (main) WROTE = Number(v.savedAt); const w = r.set(v); if (main) w.then(hubSoon, () => {}); w.then(() => pubMirror(p, v, main), () => {}); return w; }, delete: () => r.delete(),
      onSnapshot: (cb, err) => r.onSnapshot(s => { const d = s.exists && s.data(); if (d && d.owner) OWNER = String(d.owner).toLowerCase(); if (d) { VIEWERS = d.viewers || []; EDITORS = d.editors || []; if (main) PUB = d.pub || ''; } cb(s);
        // Someone else's change arriving here isn't this person's edit: take it as the new starting point.
        if (main && d && Number(d.savedAt) !== WROTE) setTimeout(() => { try { if (LASTD !== null) LASTD = digest(window.sheetState()); } catch (e) {} }, 800); }, err) }; } };
  // Rolling from a phone through this character open on a computer (Settings → Dice): requests and answers pass through
  // sheets/<id>/relay. The computer that's ready (Roll20 rolls on, extension connected) checks in as relay/host.
  const relay = col.doc(C).collection('relay');
  window.PG_RELAY = {
    send: req => new Promise(res => { const ref = relay.doc(); let done = false, un = null;
      const fin = v => { if (done) return; done = true; clearTimeout(t); if (un) un(); ref.delete().catch(() => {}); res(v); };
      const t = setTimeout(() => fin({ error: 'no answer from your computer' }), 12000);
      ref.set({ status: 'new', at: Date.now(), expr: String(req.expr || ''), label: String(req.label || ''), first: !!req.first, min2: req.min2 || null, min2Terms: Array.isArray(req.min2Terms) ? req.min2Terms : null, by: EMAIL })
        .then(() => { un = ref.onSnapshot(s => { const d = s.exists && s.data(); if (d && d.status === 'done') { let r = null; try { r = JSON.parse(d.res); } catch (e) {} fin(r || { error: 'no result' }); } }, () => {}); }, e => fin({ error: (e && (e.code || e.message)) || 'couldn’t send' })); }),
    host: (ready, roll) => { const me = Math.random().toString(36).slice(2);
      const beat = () => { if (ready()) relay.doc('host').set({ at: Date.now(), by: EMAIL, tab: me }).catch(() => {}); }; setInterval(beat, 25000); setTimeout(beat, 2000);
      relay.where('status', '==', 'new').onSnapshot(qs => qs.docChanges().forEach(async ch => { if (ch.type !== 'added' || !ready()) return; const d = ch.doc.data(); if (!d || Date.now() - (d.at || 0) > 15000) return;
        // only one computer answers: claim it first
        try { const mine = await fs.runTransaction(async tx => { const cur = await tx.get(ch.doc.ref); if (!cur.exists || cur.data().status !== 'new') return false; tx.update(ch.doc.ref, { status: 'busy', tab: me }); return true; }); if (!mine) return; } catch (e) { return; }
        let r; try { r = await roll(d); } catch (e) { r = { error: String(e && e.message || e) }; }
        ch.doc.ref.update({ status: 'done', res: JSON.stringify(r || { error: 'no result' }) }).catch(() => {}); }), () => {}); },
    hostSeen: () => relay.doc('host').get().then(s => (s.exists && s.data().at) || 0) };
  const cuser = { id: async () => null, isOwner: async () => true, can: async () => role() !== 'view' };
  window.claude = { use: async n => n === 'db' ? db : n === 'user' ? cuser : null };
  run();
  // The Player field isn't typed in on the site: it's the owner's name from the player list.
  const playerName = () => OWNER_NAME || P || (OWNER === EMAIL ? (ME && ME.name) || user.displayName || '' : '');
  const syncPlayer = () => { try { const st = window.sheetState && window.sheetState(), want = playerName(); if (st && st.created && want && st.player !== want && role() !== 'view') window.sheetSet('player', want); } catch (e) {} };
  if (NEW && playerName()) { try { const st = window.sheetState(); if (st && !st.player) st.player = playerName(); } catch (e) {} }
  try { const st0 = window.sheetState(); if (st0 && st0.created) LASTD = digest(st0); } catch (e) {}
  if (!NEW && hubCol) setTimeout(() => { syncPlayer(); hubUpdate(false); }, 2500);
  // Activity log for this sheet: that it was opened, and (gathered up, at most about once a minute) what was changed.
  if (!NEW) setTimeout(() => { let nm = ''; try { nm = window.sheetSummary().name; } catch (e) {} pgLog('open', { target: C, tName: nm, detail: role() === 'view' ? 'view only' : '' }); }, 3000);
  { let EDITS = [], editT = null; const flush = () => { clearTimeout(editT); editT = null; if (!EDITS.length) return; const L = [...new Set(EDITS)]; EDITS = [];
      let nm = ''; try { nm = window.sheetSummary().name; } catch (e) {} pgLog('edit', { target: C, tName: nm, detail: L.slice(0, 20).join(' · ') + (L.length > 20 ? ' · …' : '') }); };
    window.onSheetChange = label => { if (role() === 'view') return; EDITS.push(String(label || 'Change').replace(/^Edit: /, '')); if (!editT) editT = setTimeout(flush, 60000); };
    document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); }); addEventListener('pagehide', flush); }
  if (!NEW && hubCol && PRETTY) hubCol.doc(C).get().then(d => { const pth = d.exists && d.data().path; if (pth) showPath(pth); }, () => {});
  // New character: once it's created (and saved to the cloud), its link goes in the address bar.
  if (NEW) { const t = setInterval(() => { let made = false; try { const st = window.sheetState && window.sheetState(); made = !!(st && st.created); } catch (e) {} if (!made) return; clearInterval(t); try { sessionStorage.removeItem('pg-newfor'); } catch (e) {} setTimeout(() => startPres(), 2500); // a new character's viewers bubble starts once it exists
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
      a.style.left = Math.round(tr.left + scrollX) + 'px'; a.style.top = Math.round(lr.top + scrollY) + 'px'; placePres();
      // shown once two measurements in a row agree (the header has finished laying out)
      if (pos === align.last) de.classList.add('pg-al'); else { align.last = pos; requestAnimationFrame(align); } };
    let alignQ = 0; const alignSoon = () => { if (!alignQ) alignQ = requestAnimationFrame(() => { alignQ = 0; align(); }); };
    new MutationObserver(alignSoon).observe(document.body, { childList: true, subtree: true });
    addEventListener('resize', alignSoon); setInterval(align, 1500); alignSoon();
  }
  // The viewers bubble always sits just right of the Adventurer's Tome button (moved along with it).
  // Who's viewing: stays invisible while the page is still laying itself out, then fades in once it has stopped moving.
  let presKey = '', presT = 0;
  // The "View only" / "Shared with you" tag sits in the same row: after the viewers bubble, or after the back button.
  const placeShared = () => { const t = document.querySelector('.pg-shared'), a = document.querySelector('.pg-hublink'); if (!t || !a || !a.offsetParent || !a.offsetWidth) return;
    const box = document.querySelector('.pg-pres'), withBox = box && !box.hidden && box.classList.contains('ready') && box.offsetWidth;
    const left = withBox ? box.offsetLeft + box.offsetWidth + 8 : a.offsetLeft + a.offsetWidth + 8;
    // Not enough room in one line (phones): it wraps onto two short lines in the space that's left.
    const room = document.documentElement.clientWidth - 8 - left; t.classList.remove('wrap'); t.style.maxWidth = '';
    if (t.offsetWidth > room) { t.classList.add('wrap'); t.style.maxWidth = Math.max(96, room) + 'px'; }
    t.style.left = left + 'px'; t.style.top = (a.offsetTop + a.offsetHeight / 2) + 'px'; t.classList.add('placed'); };
  const placePres = () => { placeShared(); const box = document.querySelector('.pg-pres'), a = document.querySelector('.pg-hublink'); if (!box || !a || !a.offsetParent || !a.offsetWidth) return; // hidden behind a window: leave it where it was
    const l = (a.offsetLeft + a.offsetWidth + 8) + 'px', t = (a.offsetTop + a.offsetHeight / 2) + 'px'; box.style.left = l; box.style.top = t;
    if (box.classList.contains('ready')) return; const k = l + t + (a.offsetParent ? 1 : 0); if (k !== presKey) { presKey = k; clearTimeout(presT); presT = setTimeout(() => { if (box.isConnected && a.offsetParent) { box.classList.add('ready'); placeShared(); } else presKey = ''; }, 600); } placeShared(); };
  new ResizeObserver(() => placePres()).observe(document.documentElement);
  // Who's looking at this sheet right now — shown once it's shared: small portraits beside the back button, you too.
  // Each open copy checks in once a minute (only while its tab is showing) and drops off when closed or idle.
  let PRES_ON = false; const startPres = () => { if (PRES_ON) return; PRES_ON = true;
    const pcol = col.doc(C).collection('presence'), mine = pcol.doc(EMAIL); let seen = {}, box = null;
    // Keeps checking in while the tab is in the background too (browsers slow timers there to about once a minute,
    // which is still inside the window below) — someone with the sheet in another tab is still looking at it.
    const beat = async () => { const a = avaOf(ME); try { await mine.set({ name: NAME, pic: a.pic, color: a.color, clear: a.clear, at: Date.now() }); } catch (e) {} };
    const leave = () => { mine.delete().catch(() => {}); };
    // The character's owner comes first whenever they're here, then you, then everyone else.
    const show = () => { const now = Date.now(), rank = em => em === OWNER ? 0 : em === EMAIL ? 1 : 2, here = Object.entries(seen).filter(([, d]) => now - (d.at || 0) < 200000).sort(([a], [b]) => rank(a) - rank(b));
      if (!box) { box = document.createElement('div'); box.className = 'pg-pres'; document.body.appendChild(box); }
      box.hidden = !here.length; // you always see yourself, on your own sheet too
      box.innerHTML = here.map(([em, d]) => avaHTML(d.name, em, d.pic, em === EMAIL ? 'me' : '', em === EMAIL ? (d.name || NAME) + ' (you)' : (d.name || em), { color: d.color, clear: d.clear })).join('');
      placePres(); };
    beat(); setInterval(beat, 60000); setInterval(show, 1500);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) beat(); });
    addEventListener('pagehide', leave);
    pcol.onSnapshot(qs => { seen = {}; qs.docs.forEach(d => { seen[d.id] = d.data(); }); show(); }, () => {});
  };
  if (!NEW) startPres();
  // Adding this page to a phone's home screen: the icon is the character's portrait (the party page uses the dice icon).
  const homeIcon = () => { try { const st = window.sheetState && window.sheetState(); if (!st || !st.created) return; document.title = (st.name || 'Character') + ' — Adventurer’s Tome';
    const set = (sel, mk) => { let e = document.head.querySelector(sel); if (!e) { e = mk(); document.head.appendChild(e); } return e; };
    set('meta[name="apple-mobile-web-app-title"]', () => Object.assign(document.createElement('meta'), { name: 'apple-mobile-web-app-title' })).content = st.name || 'Character';
    if (!st.portrait || st.portrait === homeIcon.p) return; homeIcon.p = st.portrait; const im = new Image(); im.onload = () => { try { const c = document.createElement('canvas'), n = 180, s = Math.min(im.width, im.height); c.width = c.height = n;
      const x = c.getContext('2d'); x.fillStyle = '#1f2a44'; x.fillRect(0, 0, n, n); x.drawImage(im, (im.width - s) / 2, (im.height - s) / 2 * 0.6, s, s, 0, 0, n, n);
      const url = c.toDataURL('image/png'); document.head.querySelectorAll('link[rel="apple-touch-icon"], link[rel="icon"]').forEach(l => l.remove());
      [['apple-touch-icon', ''], ['icon', 'image/png']].forEach(([rel, type]) => { const l = document.createElement('link'); l.rel = rel; if (type) l.type = type; l.href = url; document.head.appendChild(l); }); } catch (e) {} }; im.src = st.portrait; } catch (e) {} };
  setTimeout(homeIcon, 1500); setInterval(homeIcon, 60000);
  if (role() !== 'owner') { const t = document.createElement('div'); t.className = 'pg-shared' + (role() === 'view' ? ' view' : ''); t.textContent = role() === 'view' ? 'View only (changes are not saved)' : 'Shared with you · can edit'; document.body.appendChild(t); setTimeout(placeShared, 50); setInterval(placeShared, 1500); }
  verCheck();
})();

// ================= Sign in (once per device) =================
function signIn(auth, say) {
  if (PG_BC) PG_BC.addEventListener('message', e => { if (e.data && e.data.t === 'signed-in' && document.querySelector('.pg-signin')) { PG_BC.postMessage({ t: 'ack' }); try { window.focus(); } catch (x) {} pgGo(null); } });
  const kickedMsg = (() => { try { const m = localStorage.getItem('pg-kicked'); localStorage.removeItem('pg-kicked'); return m || ''; } catch (e) { return ''; } })();
  say(`<div class="pg-signin">${logoHTML()}<p class="pg-about">D&amp;D 5e character sheets that do the math, track your resources and roll your dice. Build a character step by step, level up with a guided wizard, and share sheets with your party. An optional companion browser extension sends your rolls straight into your Roll20 game.</p><div class="pg-sdiv"></div><h2>Sign in</h2>
    <button class="btn gold big" id="si-g"><svg viewBox="0 0 48 48" width="18" height="18" style="vertical-align:-3px;margin-right:8px"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>Sign in with Google</button>
    <div class="pg-or">or</div>
    <form id="si-f" class="who-f"><input id="si-e" type="email" placeholder="Your email address" autocomplete="email" required><button class="btn">Email me a link</button></form>
    <p class="hub-hint" id="si-msg">No Google account? We'll email you a sign-in link.</p>${kickedMsg ? `<p class="pg-kicked">${kickedMsg}</p>` : ''}
    <p class="pg-contact">Trouble signing in? <a href="${CONTACT}">Contact us</a></p></div>${a2hsHTML()}`);
  wireA2HS(document.getElementById('pg-load'));
  wireDie(document.getElementById('pg-load'));
  // Errors and the "check your email" note show in the box just above the bottom divider (where "You've been signed
  // out" appears), replacing it; the hint line under the email field stays as it is.
  const msg = (t, ok) => { const card = document.querySelector('.pg-signin'); if (!card) return; let m = card.querySelector('.pg-kicked');
    if (!m) { m = document.createElement('p'); m.className = 'pg-kicked'; card.insertBefore(m, card.querySelector('.pg-contact')); }
    m.classList.toggle('ok', !!ok); m.innerHTML = t; if (m.animate && !PG_CALM) m.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' }); };
  document.getElementById('si-g').onclick = async () => { const pr = new firebase.auth.GoogleAuthProvider(); pr.setCustomParameters({ prompt: 'select_account' });
    try { await auth.signInWithPopup(pr); pgGo(null); } catch (e) { if (e && /popup/.test(e.code || '')) { auth.signInWithRedirect(pr); return; } msg('Couldn\'t sign in: ' + ((e && e.message) || e)); } };
  document.getElementById('si-f').onsubmit = async e => { e.preventDefault(); const em = document.getElementById('si-e').value.trim().toLowerCase(); if (!em) return;
    try { await auth.sendSignInLinkToEmail(em, { url: location.origin + location.pathname, handleCodeInApp: true }); try { localStorage.setItem('dnd-signin-email', em); localStorage.setItem('dnd-signin-back', location.href); } catch (x) {}
      msg(`<b>Check your email</b> (${em}) for a sign-in link and open it on this device. If it isn't there in a minute, look in Spam.`, true); } catch (x) { msg('Couldn\'t send the link: ' + ((x && x.message) || x)); } };
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
  { const keep = document.getElementById('pg-load'); [...document.body.childNodes].forEach(n => { if (n !== keep) n.remove(); }); // the loading screen stays put (and keeps fading) while the page is swapped in under it
    document.body.insertAdjacentHTML('afterbegin', '<div id="hub"></div><div id="hub-modal" class="hub-modal"></div><div id="hub-toast" class="hub-toast"></div>'); }
  document.body.className = 'hubbody' + (ADMIN ? ' adminbody' : '');
  const root = document.getElementById('hub'), modal = document.getElementById('hub-modal');
  if (TOUCH && !document.documentElement.classList.contains('pg-touch')) { document.documentElement.classList.add('pg-touch'); noHover(); }
  // no pinch-zooming the characters page (it should feel like an app, not a web page)
  if (TOUCH && !window.PG_NOZOOM) { window.PG_NOZOOM = true; ['gesturestart', 'gesturechange'].forEach(t => document.addEventListener(t, e => { if (!document.body.classList.contains('adminbody') && !e.target.closest('.hub-modal')) e.preventDefault(); }, { passive: false })); }
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
  // Your name (shown on your characters as the player, and to the people you share with): the pencil beside it.
  function renameMe() {
    modal.innerHTML = `<div class="hub-card"><h2>Your name</h2><p class="hub-hint">Shown on your characters as the player, and to people you share them with.</p>
      <form id="rn-f" class="who-f"><input id="rn-n" maxlength="40" autocomplete="name" value="${esc(myName())}" required></form>
      <div class="row"><button class="btn ghost" id="rn-x">Cancel</button><button class="btn gold" id="rn-ok">Save</button></div></div>`;
    modal.classList.add('on'); const inp = modal.querySelector('#rn-n'); setTimeout(() => { inp.focus(); inp.select(); }, 30);
    const save = async () => { const nm = inp.value.replace(/\s+/g, ' ').trim().slice(0, 40); if (!nm) { toast('Type a name.'); return; } if (nm === myName()) { close(); return; }
      try { await usersCol.doc(EMAIL).update({ name: nm, nameLower: nm.toLowerCase(), keys: searchKeys(nm, EMAIL.split('@')[0], EMAIL) }); }
      catch (x) { toast(x && x.code === 'permission-denied' ? 'Changing your name isn’t switched on yet.' : 'Couldn’t save your name: ' + (x.message || x)); return; }
      NAMES[EMAIL] = nm; if (ME) ME.name = nm; pgLog('rename_user', { target: EMAIL, tName: nm, detail: 'changed their own name' });
      chars.filter(isMine).forEach(c => { c.player = nm; charsCol.doc(c.id).set({ player: nm }, { merge: true }).catch(() => {}); });
      close(); toast('Name changed to ' + nm + '.'); draw(); };
    modal.querySelector('#rn-f').onsubmit = e => { e.preventDefault(); save(); }; modal.querySelector('#rn-ok').onclick = save; modal.querySelector('#rn-x').onclick = close; }
  const close = () => modal.classList.remove('on');
  const pic = c => c.thumb ? `<img class="hc-pic" src="${esc(c.thumb)}" alt="">` : `<span class="hc-pic hc-nopic">${esc(initials(c.name || '?'))}</span>`;
  // The wordmark: a gold d20 crest beside "Adventurer's" in spaced small caps over a large serif "Tome".
  const shareIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';
  // Icons for the ⋯ menus (same line style as the old row buttons).
  const mi = d => `<svg class="mi" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const MI = { pin: mi('<path d="M9 3h6l-1 6 4 4H6l4-4z"/><path d="M12 13v8"/>'), unpin: mi('<path d="M9 3h6l-1 6 4 4H6l4-4z"/><path d="M12 13v8"/><path d="M3 3l18 18"/>'), share: shareIcon.replace(/width="\d+"/, 'width="16"').replace(/height="\d+"/, 'height="16"').replace('<svg', '<svg class="mi"'),
    move: mi('<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 11h6M19 8l3 3-3 3"/>'), leave: mi('<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 17l-5-5 5-5M5 12h11"/>'),
    del: mi('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'), copy: mi('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>'),
    exp: mi('<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 19h14"/>'), tok: mi('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="10" r="2.6"/><path d="M7.5 17.5c1-2.2 2.6-3.2 4.5-3.2s3.5 1 4.5 3.2"/>') };

  // ----- actions on one character (used by the hub's menus and the admin section) -----
  // A character's saved sheet, put back together (big sheets are split across a few documents).
  async function sheetText(id) { const m = await sheets.doc(id).get(); if (!m.exists) throw new Error('That character couldn’t be found.'); const d = m.data(); let str = d.data || ''; const n = Number(d.n) || 1;
    for (let k = 1; k < n; k++) { const p = await sheets.doc(id + '_p' + k).get(); str += (p.exists && p.data().data) || ''; } return { str, main: d }; }
  const newId = () => { const a = new Uint8Array(18); crypto.getRandomValues(a); return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const chunks = (str, size = 900000) => { const out = []; for (let i = 0; i < str.length; i += size) out.push(str.slice(i, i + size)); return out.length ? out : ['']; };
  const clip = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
  // Make a copy: a new character of your own with everything the original has (yours or one shared with you).
  async function copyChar(c) { toast('Copying ' + (c.name || 'the character') + '…');
    try { const { str, main } = await sheetText(c.id), st = JSON.parse(str), now = Date.now(), id = newId();
      const nm = ((st.name || c.name || 'Character') + ' (copy)').slice(0, 60); st.name = nm; st.id = newId(); st.player = myName(); st.savedAt = now;
      const parts = chunks(JSON.stringify(st)), acc = { owner: EMAIL, viewers: [], editors: [] };
      for (let k = 1; k < parts.length; k++) await sheets.doc(id + '_p' + k).set(Object.assign({ savedAt: now, data: parts[k] }, acc));
      await sheets.doc(id).set(Object.assign({ v: 2, savedAt: now, tab: main.tab || 'x', n: parts.length, data: parts[0], g: G }, acc));
      const sum = clip({ owner: EMAIL, name: nm, player: myName(), race: c.race, cls: c.cls, level: c.level, thumb: c.thumb || '', keys: searchKeys(nm), viewers: [], editors: [], createdAt: now, updatedAt: now, by: myName() });
      await charsCol.doc(id).set(sum); pgLog('create', { target: id, tName: nm, detail: 'copy of ' + (c.name || 'a character') });
      if (view !== 'mine') switchView('mine'); toast('Made a copy: ' + nm + '.'); }
    catch (x) { toast('Couldn’t copy it: ' + (x.message || x)); } }
  // Export: the character as one stand-alone .html file that opens in any browser, no account needed.
  async function exportChar(c) { toast('Preparing ' + (c.name || 'the character') + '…');
    try { const [{ str }, tpl] = await Promise.all([sheetText(c.id), fetch(window.PG_ASSETS.blank).then(r => { if (!r.ok) throw new Error('couldn’t load the sheet file'); return r.text(); })]);
      const open = '<script id="sheet-data" type="application/json">', a = tpl.indexOf(open), b = tpl.indexOf('</' + 'script>', a); if (a < 0 || b < 0) throw new Error('bad sheet file');
      const out = tpl.slice(0, a + open.length) + str.replace(/</g, '\\u003c') + tpl.slice(b);
      const fname = (c.name || 'character').replace(/[^\w-]+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '_sheet.html';
      const el = document.createElement('a'); el.href = URL.createObjectURL(new Blob([out], { type: 'text/html' })); el.download = fname; document.body.appendChild(el); el.click(); setTimeout(() => { URL.revokeObjectURL(el.href); el.remove(); }, 1500);
      toast('Downloaded ' + fname + '.'); }
    catch (x) { toast('Couldn’t export it: ' + (x.message || x)); } }
  // Download token: a round picture of the character for a virtual tabletop, ringed in the sheet's accent colour.
  async function tokenChar(c) { toast('Making ' + (c.name || 'the') + ' token…');
    try { const { str } = await sheetText(c.id), st = JSON.parse(str), acc = /^#[0-9a-f]{6}$/i.test((st.theme || {}).accent || '') ? st.theme.accent : '#c9962b';
      const src = st.portrait || c.thumb || '', N0 = 512, cv = document.createElement('canvas'); cv.width = cv.height = N0; const x = cv.getContext('2d'), R = N0 / 2, ring = 30;
      const img = src ? await new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = rej; im.src = src; }) : null;
      x.save(); x.beginPath(); x.arc(R, R, R - ring + 2, 0, Math.PI * 2); x.clip();
      if (img) { const sz = Math.min(img.width, img.height), sx = (img.width - sz) / 2, sy = (img.height - sz) / 2 * 0.6; x.drawImage(img, sx, sy, sz, sz, ring - 2, ring - 2, N0 - 2 * (ring - 2), N0 - 2 * (ring - 2)); }
      else { x.fillStyle = '#1f2a44'; x.fillRect(0, 0, N0, N0); x.fillStyle = '#f3e7c6'; x.font = '800 190px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(st.name || c.name || '?').split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase(), R, R + 8); }
      const sh = x.createRadialGradient(R, R, R - ring - 40, R, R, R - ring + 2); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.35)'); x.fillStyle = sh; x.fillRect(0, 0, N0, N0); x.restore();
      // the ring: accent colour with a little light on top and shade underneath, and a thin dark edge so it reads on any map
      const g = x.createLinearGradient(0, 0, 0, N0), lt = (h, k) => { const n = parseInt(h.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v + (k > 0 ? (255 - v) * k : v * k)))); return `rgb(${f(n >> 16 & 255)},${f(n >> 8 & 255)},${f(n & 255)})`; };
      g.addColorStop(0, lt(acc, .35)); g.addColorStop(.5, acc); g.addColorStop(1, lt(acc, -.35));
      x.beginPath(); x.arc(R, R, R - ring / 2 - 2, 0, Math.PI * 2); x.lineWidth = ring; x.strokeStyle = g; x.stroke();
      x.beginPath(); x.arc(R, R, R - 2, 0, Math.PI * 2); x.lineWidth = 4; x.strokeStyle = 'rgba(10,12,20,.85)'; x.stroke();
      x.beginPath(); x.arc(R, R, R - ring - 1, 0, Math.PI * 2); x.lineWidth = 3; x.strokeStyle = 'rgba(10,12,20,.6)'; x.stroke();
      const blob = await new Promise(res => cv.toBlob(res, 'image/png')), fname = (st.name || c.name || 'character').replace(/[^\w-]+/g, '_') + '_token.png';
      const el = document.createElement('a'); el.href = URL.createObjectURL(blob); el.download = fname; document.body.appendChild(el); el.click(); setTimeout(() => { URL.revokeObjectURL(el.href); el.remove(); }, 1500); toast('Downloaded ' + fname + '.'); }
    catch (e) { toast('Couldn’t make the token: ' + (e.message || e)); } }
  // View-only link: a copy of the sheet anyone can open without signing in, kept up to date as it's edited.
  const pubCol = fs.collection('pub'), pubURL = t => location.origin + (PRETTY ? '/view/' + t : location.pathname + '?pv=' + t);
  async function pubOn(c) { const { str, main } = await sheetText(c.id); const t = main.pub || newId().slice(0, 22), parts = chunks(str), now = Number(main.savedAt) || Date.now();
    for (let k = 1; k < parts.length; k++) await pubCol.doc(t + '_p' + k).set({ c: c.id, savedAt: now, data: parts[k] });
    await pubCol.doc(t).set({ c: c.id, savedAt: now, n: parts.length, data: parts[0], v: 2, tab: String(main.tab || 'x') });
    if (main.pub !== t) await sheets.doc(c.id).update({ pub: t }); charsCol.doc(c.id).set({ pub: true }, { merge: true }).catch(() => {}); return t; }
  async function pubOff(c, t) { const m = await pubCol.doc(t).get().catch(() => null), n = Number(m && m.exists && m.data().n) || 1;
    await sheets.doc(c.id).update({ pub: firebase.firestore.FieldValue.delete() }); charsCol.doc(c.id).set({ pub: false }, { merge: true }).catch(() => {}); for (let k = 1; k < n; k++) await pubCol.doc(t + '_p' + k).delete().catch(() => {}); await pubCol.doc(t).delete().catch(() => {}); }
  // Who else can open a character: everyone in "viewers" can look; those also in "editors" can change it.
  async function setAccess(c, V, E) {
    const acc = { viewers: V, editors: E.filter(x => V.includes(x)) };
    const s0 = await sheets.doc(c.id).get(); const n = Number(s0.exists && s0.data().n) || 1;
    await sheets.doc(c.id).update(acc); for (let k = 1; k < n; k++) await sheets.doc(c.id + '_p' + k).update(acc).catch(() => {});
    await charsCol.doc(c.id).set(acc, { merge: true });
    const V0 = c.viewers || [], E0 = c.editors || [], nm = c.name || '';
    acc.viewers.filter(x => !V0.includes(x)).forEach(x => pgLog('share', { target: c.id, tName: nm, detail: x + (acc.editors.includes(x) ? ' (can edit)' : ' (view only)') }));
    V0.filter(x => !acc.viewers.includes(x)).forEach(x => pgLog('unshare', { target: c.id, tName: nm, detail: x }));
    acc.viewers.filter(x => V0.includes(x) && E0.includes(x) !== acc.editors.includes(x)).forEach(x => pgLog('access', { target: c.id, tName: nm, detail: x + (acc.editors.includes(x) ? ' can now edit' : ' is now view only') }));
    Object.assign(c, acc);
  }
  async function giveTo(c, o) {
    try { await userDoc(o); const s = await sheets.doc(c.id).get(); const n = Number(s.exists && s.data().n) || 1; await sheets.doc(c.id).update({ owner: o }); for (let k = 1; k < n; k++) await sheets.doc(c.id + '_p' + k).update({ owner: o }).catch(() => {});
      await charsCol.doc(c.id).set({ owner: o, player: nameOf(o), playerSet: Date.now() }, { merge: true }); c.owner = o; c.player = nameOf(o); toast('Moved to ' + nameOf(o) + '.'); pgLog('give', { target: c.id, tName: c.name, detail: 'to ' + o }); return true; } catch (x) { toast('Couldn\'t move it: ' + (x.message || x)); return false; } }
  function shareChar(c, back) {
    let V = [...(c.viewers || [])], E = [...(c.editors || [])], PUB = '', pubBusy = false;
    // The view-only link section updates in place (the rest of the window isn't redrawn, so nothing flashes).
    const paintPub = anim => { const box = modal.querySelector('.sh-pub'); if (!box) return;
      box.innerHTML = `<label class="sh-pub-t"><input type="checkbox" id="sh-pub"${PUB ? ' checked' : ''}${pubBusy ? ' disabled' : ''}><span><b>View-only link</b><small>${pubBusy ? (PUB ? 'Turning the link off…' : 'Making the link…') : 'Anyone with the link can look at this character without signing in. It stays up to date as it changes.'}</small></span></label>
        ${PUB && !pubBusy ? `<div class="sh-pub-row"><input readonly id="sh-pub-u" value="${esc(pubURL(PUB))}"><button class="btn" id="sh-pub-c">Copy link</button></div>` : ''}`;
      const row = box.querySelector('.sh-pub-row'); if (anim && row && row.animate && !PG_CALM) row.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
      box.querySelector('#sh-pub').onchange = async e => { const on = e.target.checked; pubBusy = true; paintPub(false);
        try { if (on) { PUB = await pubOn(c); pgLog('share', { target: c.id, tName: c.name || '', detail: 'view-only link turned on' }); toast('View-only link is on.'); }
          else { await pubOff(c, PUB); PUB = ''; pgLog('unshare', { target: c.id, tName: c.name || '', detail: 'view-only link turned off' }); toast('View-only link turned off — the old link no longer works.'); } }
        catch (x) { toast(x && x.code === 'permission-denied' ? 'View-only links aren’t switched on yet.' : 'Couldn’t change the link: ' + (x.message || x)); }
        pubBusy = false; paintPub(on && !!PUB); };
      const cp = box.querySelector('#sh-pub-c'); if (cp) cp.onclick = async () => { const u = box.querySelector('#sh-pub-u'); try { await navigator.clipboard.writeText(u.value); cp.textContent = 'Copied'; } catch (x) { u.select(); cp.textContent = 'Selected'; } setTimeout(() => { cp.textContent = 'Copy link'; }, 1600); }; };
    const paint = () => {
      const html = `<h2>Share ${esc(c.name || 'this character')}</h2><p class="hub-hint">They'll find it under “Shared characters” after signing in with that email.</p>
        <div class="pl-list">${V.map(em => `<div class="pl-row"><span class="sh-who">${NAMES[em] ? `<b>${esc(NAMES[em])}</b> ` : ''}<span>${esc(em)}</span></span><select data-acc="${esc(em)}"><option value="view">Can view</option><option value="edit"${E.includes(em) ? ' selected' : ''}>Can edit</option></select><button class="linkbtn" data-rm="${esc(em)}">remove</button></div>`).join('') || '<p class="hub-hint">Not shared with anyone yet.</p>'}</div>
        <form id="sh-f" class="who-f pl-f sh-f"><input id="sh-e" type="email" placeholder="Their email address" autocomplete="off" required><select id="sh-a"><option value="view">Can view</option><option value="edit">Can edit</option></select><button class="btn gold">Share</button></form>
        <div class="sh-pub"></div>
        <button class="btn ghost" id="sh-x">Done</button>`;
      // already open: swap what's inside the window rather than the window itself, so it doesn't pop in again
      const card0 = modal.classList.contains('on') && modal.querySelector('.hub-card.sh-card'); if (card0) card0.innerHTML = html; else modal.innerHTML = `<div class="hub-card wide sh-card">${html}</div>`;
      modal.classList.add('on');
      paintPub(false);
      const save = async (nv, ne, msg) => { try { await setAccess(c, nv, ne); V = c.viewers; E = c.editors; if (msg) toast(msg); paint(); if (back && back.refresh) back.refresh(); } catch (x) { toast('Couldn\'t change sharing: ' + (x.message || x)); } };
      peoplePicker(modal.querySelector('#sh-e'));
      modal.querySelector('#sh-f').onsubmit = e => { e.preventDefault(); const em = modal.querySelector('#sh-e').value.trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast('Type an email address.'); return; } if (em === c.owner) { toast('That’s the owner.'); return; }
        const ed = modal.querySelector('#sh-a').value === 'edit'; save([...V.filter(x => x !== em), em], ed ? [...E.filter(x => x !== em), em] : E.filter(x => x !== em), 'Shared with ' + nameOf(em) + '.'); };
      modal.querySelectorAll('[data-acc]').forEach(sel => sel.onchange = () => { const em = sel.dataset.acc; save(V, sel.value === 'edit' ? [...E.filter(x => x !== em), em] : E.filter(x => x !== em)); });
      modal.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { const em = b.dataset.rm; save(V.filter(x => x !== em), E.filter(x => x !== em), 'Stopped sharing with ' + nameOf(em) + '.'); });
      modal.querySelector('#sh-x').onclick = () => { close(); if (back) back(); };
    };
    Promise.all([IS_ADMIN ? needNames(V) : null, sheets.doc(c.id).get().then(d => { PUB = (d.exists && d.data().pub) || ''; }, () => {})]).then(paint);
  }
  // Admins typing an email (sharing, giving a character away…): suggestions by name or email as they type; picking one fills it in.
  function peoplePicker(inp, onPick) { if (!IS_ADMIN || !inp) return; let box = null, items = [], k = -1, t = null;
    const shut = () => { if (box) { box.remove(); box = null; } items = []; k = -1; };
    const place = () => { if (!box) return; const r = inp.getBoundingClientRect(); box.style.left = r.left + 'px'; box.style.top = (r.bottom + 4) + 'px'; box.style.width = Math.max(240, r.width) + 'px'; };
    const paint = () => { if (!items.length) return shut(); if (!box) { box = document.createElement('div'); box.className = 'pp-sug'; document.body.appendChild(box); }
      box.innerHTML = items.map((u, j) => `<button type="button" data-j="${j}"${j === k ? ' class="on"' : ''}>${esc(u.name || u.id)}<small>${esc(u.id)}</small></button>`).join(''); place();
      box.querySelectorAll('[data-j]').forEach(b => b.onmousedown = e => { e.preventDefault(); pick(items[N(b.dataset.j)]); }); };
    const pick = u => { inp.value = u.id; shut(); if (onPick) onPick(u.id); };
    inp.setAttribute('autocomplete', 'off'); inp.type = 'text'; inp.placeholder = 'Their name or email';
    inp.addEventListener('input', () => { clearTimeout(t); const q = inp.value.trim(); if (q.length < 1) return shut(); t = setTimeout(async () => { try { const r = await findUsers(q); items = r.docs.map(d => Object.assign({ id: d.id }, d.data())).slice(0, 8); k = -1; if (document.activeElement === inp) paint(); } catch (e) { shut(); } }, 160); });
    inp.addEventListener('keydown', e => { if (!box) return; if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); k = (k + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; paint(); } else if (e.key === 'Enter' && k >= 0) { e.preventDefault(); pick(items[k]); } else if (e.key === 'Escape') shut(); });
    inp.addEventListener('blur', () => setTimeout(shut, 120)); addEventListener('scroll', place, { passive: true, capture: true }); }
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
    modal.querySelector('#rm-ok').onclick = async () => { await charsCol.doc(c.id).delete(); chars = chars.filter(x => x.id !== c.id); toast('Removed from the list.'); pgLog('remove', { target: c.id, tName: c.name }); close(); if (after) after(); };
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
        Object.assign(c, acc); if (!IS_ADMIN) chars = chars.filter(x => x.id !== c.id); toast('You no longer have access to ' + (c.name || 'that character') + '.'); pgLog('leave', { target: c.id, tName: c.name }); close(); if (after) after(); }
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
        if (s0.exists) await sheets.doc(c.id).delete(); await charsCol.doc(c.id).delete(); pgLog('delete', { target: c.id, tName: c.name, detail: c.owner && c.owner !== EMAIL ? 'owned by ' + c.owner : '' });
        ['dnd-pages-cache:', 'dnd-sheet-ui:'].forEach(k => { try { localStorage.removeItem(k + c.id); } catch (e) {} });
        chars = chars.filter(x => x.id !== c.id); close(); toast((c.name || 'The character') + ' was deleted.'); if (after) after(); }
      catch (x) { ok.textContent = 'Delete forever'; ok.disabled = false; toast(x && x.code === 'permission-denied' ? 'Only the owner (or an admin) can delete it — if you are, the new database rules still need publishing.' : 'Couldn\'t delete it: ' + ((x && x.message) || x)); } };
  }
  document.addEventListener('click', e => { if (e.target === modal) close(); });

  // ================= Hub: my characters and the ones shared with me =================
  function createChar() { pgGo(URLS.newChar(G)); }
  // Your picture: your initials (on a colour you can pick), one of your characters, or an image you upload.
  const myAva = () => { const a = avaOf(ME), ch = picModeOf(ME) === 'char' && ME.picChar && chars.find(c => c.id === ME.picChar && isMine(c)); if (ch && ch.thumb) a.pic = ch.thumb; return a; };
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
  // Choose a picture — your own, or (for an admin) someone else's: who = { em, name, rec, list, after }.
  function pickPic(who) { const SELF = !who, EM = SELF ? EMAIL : who.em, R = SELF ? ME : (who.rec || {}), NM = SELF ? myName() : (who.name || who.em);
    const mine = (who ? who.list : chars.filter(isMine)).sort((a, b) => (a.createdAt || a.updatedAt || 0) - (b.createdAt || b.updatedAt || 0));
    const GP = (R && R.gpic) || '', st = { mode: picModeOf(R), color: okColor(R && R.picColor), char: (R && R.picChar) || '', img: R && !R.picChar ? (R.pic || '') : '', clear: !!(R && R.picClear) }; if (st.mode === 'google' && !GP) st.mode = 'initials';
    const auto = `hsl(${hueOf(EM)}, 42%, 42%)`;
    const ico = { google: '<svg viewBox="0 0 48 48" width="16" height="16"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.1 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.2-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>',
      initials: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19l4.5-12h1L14 19M5.8 15h6.4"/><path d="M15 12.5c.8-1 2-1.5 3-1.2 1.5.4 2 1.8 2 3.2V19M20 15.5c-2 0-4.5.2-4.5 2s2.2 1.8 4.5-.3"/></svg>',
      char: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
      upload: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>' };
    modal.innerHTML = `<div class="hub-card wide pp"><h2>${SELF ? 'Your picture' : 'Picture for ' + esc(NM)}</h2>
      <div class="pp-head"><span class="pp-prev"></span><div class="pp-who"><b>${esc(NM)}</b><small>${SELF ? 'Shows beside your name, and to others when you’re viewing a shared sheet together.' : 'Shows beside their name everywhere on the site.'}</small></div></div>
      <div class="pp-tabs${GP ? ' four' : ''}" role="tablist">${(GP ? [['google', 'Google']] : []).concat([['initials', 'Initials'], ['char', 'Character'], ['upload', 'Upload']]).map(([m, t]) => `<button role="tab" data-m="${m}">${ico[m]}${t}</button>`).join('')}</div>
      ${GP ? `<div class="pp-pane" data-p="google"><p class="pp-note pp-gnote">Your Google account picture. If you change it on Google, it updates here the next time you sign in.</p></div>` : ''}
      <div class="pp-pane" data-p="initials"><p class="pp-lbl">Background colour</p><div class="pp-sw">
        <button class="pp-c" data-c="" style="background:${auto}" title="Automatic"><span>A</span></button>${PG_SWATCH.map(c => `<button class="pp-c" data-c="${c}" style="background:${c}" title="${c}"></button>`).join('')}
        <label class="pp-c pp-cust" title="Pick any colour"><input type="color" value="${st.color || '#c9962b'}"><span>+</span></label></div></div>
      <div class="pp-pane" data-p="char">${mine.length ? `<div class="pp-grid">${mine.map(c => `<button class="pp-opt" data-pp="${esc(c.id)}"${c.thumb ? '' : ' disabled title="This character has no portrait yet"'}><span class="pp-img">${avaHTML(c.name, c.id, c.thumb)}</span><b>${esc(c.name || 'Unnamed')}</b><small>${esc(c.thumb ? (c.cls || '') : 'No portrait yet')}</small></button>`).join('')}</div>` : '<p class="hub-hint pp-empty">You don’t have any characters yet — make one and its portrait can be your picture.</p>'}</div>
      <div class="pp-pane" data-p="upload"><label class="pp-drop"><input type="file" accept="image/*" hidden><span class="pp-dz-i">${ico.upload}</span><b>Choose an image</b><small>or drag one here</small></label>
        <p class="pp-note">Tip: a PNG with a transparent background shows just the image — no circle or border around it.</p><p class="pp-err" hidden></p></div>
      <div class="row pp-foot"><button class="btn ghost" id="pp-x">Cancel</button><button class="btn" id="pp-ok">Save</button></div></div>`;
    modal.classList.add('on');
    const $ = q => modal.querySelector(q), $$ = q => modal.querySelectorAll(q);
    const pick = () => st.mode === 'google' ? GP : st.mode === 'char' ? ((mine.find(c => c.id === st.char) || {}).thumb || '') : st.mode === 'upload' ? st.img : '';
    const paint = () => { const pic = pick();
      $('.pp-prev').innerHTML = avaHTML(NM, EM, pic, '', '', { color: st.color, clear: st.mode === 'upload' && st.clear });
      $$('.pp-tabs [data-m]').forEach(b => { const on = b.dataset.m === st.mode; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
      // the highlight slides to the chosen tab and that tab's page fades in from the side it came from
      { const bar = $('.pp-tabs'), on = $('.pp-tabs [data-m].on'); let ind = bar.querySelector('.pp-ind'); const first = !ind; if (!ind) { ind = document.createElement('span'); ind.className = 'pp-ind'; ind.setAttribute('aria-hidden', 'true'); bar.prepend(ind); }
        if (on) { ind.style.transition = first ? 'none' : ''; ind.style.transform = `translate(${on.offsetLeft}px, ${on.offsetTop}px)`; ind.style.width = on.offsetWidth + 'px'; ind.style.height = on.offsetHeight + 'px'; if (first) requestAnimationFrame(() => { ind.style.transition = ''; }); } }
      { const order = [...$$('.pp-tabs [data-m]')].map(b => b.dataset.m), was = paint.last; $$('.pp-pane').forEach(p => { const show = p.dataset.p === st.mode; p.hidden = !show;
        if (show && was && was !== st.mode && p.animate && !PG_CALM) p.animate([{ opacity: 0, transform: `translateX(${order.indexOf(st.mode) > order.indexOf(was) ? 16 : -16}px)` }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.22,.9,.24,1)' }); });
        paint.last = st.mode; }
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
      const upd = st.mode === 'char' ? { picMode: 'char', picChar: st.char, pic: pick(), picClear: false, picColor: st.color } : st.mode === 'upload' ? { picMode: 'upload', picChar: '', pic: st.img, picClear: !!st.clear, picColor: st.color } : { picMode: st.mode === 'google' ? 'google' : 'initials', picChar: '', pic: '', picClear: false, picColor: st.color };
      try { await usersCol.doc(EM).update(upd); Object.assign(R || {}, upd); close(); if (SELF) { draw(); toast('Your picture is saved.'); pgLog('picture', { detail: upd.picMode }); } else { pgLog('user_picture', { target: EM, tName: NM, detail: upd.picMode }); toast('Picture changed for ' + NM + '.'); if (who.after) who.after(); } }
      catch (x) { ok.disabled = false; ok.textContent = 'Save'; toast(x && x.code === 'permission-denied' ? 'Couldn’t save it yet — the new database rules need publishing.' : 'Couldn’t save it: ' + ((x && x.message) || x)); } };
    paint();
  }
  // (the admin pages share the picture tools above, so they branch off only here)
  if (ADMIN) return adminSection();
  function card(c) {
    const acc = (c.editors || []).includes(EMAIL) ? '<span class="hc-acc edit">Can edit</span>' : '<span class="hc-acc">View only</span>';
    return `<div class="hc${c.pin && isMine(c) ? ' pinned' : ''}"><a class="hc-main" href="${esc(URLS.char(c))}">${pic(c)}
      <span class="hc-txt"><b>${esc(c.name || 'Unnamed character')}</b><span>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}</span>
      <small>${c.updatedAt ? 'Updated ' + ago(c.updatedAt) + (c.by ? ' by ' + esc(c.by) : '') : ''}</small>${acc}</span></a>
      ${(() => { const inList = (c.viewers || []).includes(EMAIL) && !isMine(c), it = [];
        if (IS_ADMIN) it.push(['share', 'Share…'], ['move', 'Give to another player']);
        it.push(['copy', 'Make a copy'], ['exp', 'Export'], ['tok', 'Download token']);
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
        <button data-a="pin" data-id="${esc(c.id)}">${c.pin ? MI.unpin + 'Unpin' : MI.pin + 'Pin'}</button><button data-a="share" data-id="${esc(c.id)}">${MI.share}Share…</button><button data-a="copy" data-id="${esc(c.id)}">${MI.copy}Make a copy</button><button data-a="exp" data-id="${esc(c.id)}">${MI.exp}Export</button><button data-a="tok" data-id="${esc(c.id)}">${MI.tok}Download token</button>${canDelete(c) ? `<button data-a="del" data-id="${esc(c.id)}" class="hc-del">${MI.del}Delete character…</button>` : ''}</div></div></div>`;
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
    // The lists sit in a sliding track, which shifts where "fixed" is measured from: correct for that offset.
    const nb = r.getBoundingClientRect(), ox = nb.left - b.left, oy = nb.top - b.top; if (ox || oy) { r.style.left = (b.left - ox) + 'px'; r.style.top = (b.top - oy) + 'px'; }
    RD = { r, ph, pin: r.dataset.pin, list: ph.parentElement, dy: e.clientY - b.top, oy }; r.classList.add('drag'); document.body.classList.add('hdragging'); });
  document.addEventListener('pointermove', e => { if (!RD) return; e.preventDefault(); RD.r.style.top = (e.clientY - RD.dy - RD.oy) + 'px';
    const rows = [...RD.list.querySelectorAll(':scope > .hr')].filter(x => x !== RD.r), peers = rows.filter(x => x.dataset.pin === RD.pin);
    if (!peers.length) return;
    const tgt = peers.find(x => { const bb = x.getBoundingClientRect(); return e.clientY < bb.top + bb.height / 2; });
    const want = tgt ? tgt : peers[peers.length - 1];
    if (tgt ? RD.ph.nextElementSibling !== tgt : RD.ph.previousElementSibling !== want) slide(rows, () => tgt ? tgt.before(RD.ph) : want.after(RD.ph));
    const sc = RD.list.closest('.hub-scroll'), sr = sc ? sc.getBoundingClientRect() : { top: 0, bottom: innerHeight }, edge = 60, by = y => sc ? sc.scrollBy(0, y) : scrollBy(0, y);
    if (e.clientY < sr.top + edge) by(-10); else if (e.clientY > sr.bottom - edge) by(10); }, { passive: false });
  const endDrag = () => { if (!RD) return; const d = RD; RD = null; const pb = d.ph.getBoundingClientRect();
    d.r.style.transition = 'top .16s ease, box-shadow .16s'; d.r.style.top = (pb.top - d.oy) + 'px'; d.r.classList.remove('drag');
    setTimeout(() => { d.ph.replaceWith(d.r); d.r.removeAttribute('style'); document.body.classList.remove('hdragging');
      const all = [...d.list.querySelectorAll(':scope > .hr')]; saveOrder(all.filter(x => x.dataset.pin === '1').map(x => x.dataset.id)).then(() => saveOrder(all.filter(x => x.dataset.pin !== '1').map(x => x.dataset.id))); }, 170); };
  document.addEventListener('pointerup', endDrag); document.addEventListener('pointercancel', endDrag);

  // My characters ⇄ Shared characters. Both lists sit side by side in a track: on a phone the track slides (and follows
  // your finger when you swipe), on a computer the other list fades in. The switch only shows once something has
  // been shared with you.
  let VIEW_IND = null, SH_LOADED = false;
  const slideMode = () => TOUCH || innerWidth <= 640;
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function placeInd(anim, frac) {
    const bar = root.querySelector('.hub-seg'), ind = bar && bar.querySelector('.hv-ind'), btns = bar ? [...bar.querySelectorAll('[data-view]')] : []; if (!ind || btns.length < 2) return;
    const br = bar.getBoundingClientRect(), r0 = btns[0].getBoundingClientRect(), r1 = btns[1].getBoundingClientRect();
    const f = frac != null ? frac : view === 'shared' ? 1 : 0, x = (r0.left - br.left) + ((r1.left - br.left) - (r0.left - br.left)) * f, w = r0.width + (r1.width - r0.width) * f;
    ind.style.transition = anim && !calm() ? '' : 'none'; ind.style.transform = `translateX(${x}px)`; ind.style.width = w + 'px';
    btns.forEach((b, k) => b.classList.toggle('on', Math.round(f) === k));
  }
  function placeTrack(anim, dx) {
    const tr = root.querySelector('.hub-track'); if (!tr) return; const idx = view === 'shared' ? 1 : 0;
    tr.classList.toggle('slide', slideMode()); tr.classList.toggle('fade', !slideMode());
    const panes = tr.querySelectorAll('.hub-pane'); panes.forEach((p, k) => p.classList.toggle('on', k === idx));
    if (!slideMode()) { tr.style.transform = ''; return; }
    tr.style.transition = anim && !calm() ? 'transform .34s cubic-bezier(.22,.9,.24,1)' : 'none';
    tr.style.transform = `translate3d(calc(${-idx * 100}% + ${dx || 0}px), 0, 0)`;
    if (dx == null) { clearTimeout(tr._t); const off = () => { let y = null; panes.forEach((p, k) => { if (k === idx && p._y != null) { y = p._y; p._y = null; } p.style.transform = ''; p.classList.toggle('hp-off', k !== idx); unclamp(p); }); if (y != null) scrollTo(0, y); };
      tr._off = off; if (anim && !calm()) tr._t = setTimeout(() => { tr._t = 0; tr._off = null; off(); }, 360); else { tr._off = null; off(); } }
  }
  // A new swipe or tap can arrive before the last slide has landed. Finish the old landing first, so its clean-up never
  // hides the list now coming in.
  function settle() { const tr = root.querySelector('.hub-track'); if (!tr || !tr._off) return; clearTimeout(tr._t); const f = tr._off; tr._t = 0; tr._off = null; f(); }
  // While the lists slide, the one leaving is trimmed to what's on screen, so the page's height settles at the start of
  // the slide (hidden in the motion) instead of jumping once it lands.
  const clampPane = p => { if (!p) return; p.style.maxHeight = Math.max(0, innerHeight - p.getBoundingClientRect().top) + 'px'; p.style.overflow = 'hidden'; };
  const unclamp = p => { if (p) { p.style.maxHeight = ''; p.style.overflow = ''; } };
  // Each list remembers where you'd scrolled to. While sliding, the incoming list is shifted so it already shows that
  // spot; when it lands the shift is swapped for the real scroll in the same frame, so nothing jumps or flashes.
  const VSCROLL = { mine: 0, shared: 0 };
  const padBot = () => parseFloat(getComputedStyle(root).paddingBottom) || 0;
  function prepIn(p) { if (!p || p._y != null) return; p.classList.remove('hp-off'); unclamp(p);
    const top = p.getBoundingClientRect().top + scrollY, max = Math.max(0, top + p.offsetHeight + padBot() - innerHeight);
    p._y = Math.min(VSCROLL[p.dataset.pane] || 0, max); p.style.transform = scrollY - p._y ? `translateY(${scrollY - p._y}px)` : ''; }
  addEventListener('scroll', () => { root.querySelectorAll('.hub-pane').forEach(p => { if (p._y != null) p.style.transform = scrollY - p._y ? `translateY(${scrollY - p._y}px)` : ''; }); }, { passive: true });
  function switchView(v) { if (v === view) return; settle(); const out0 = root.querySelector('.hub-pane.on'); VSCROLL[view] = scrollY; view = v; history.replaceState(null, '', view === 'shared' ? URLS.shared(G) : URLS.hub(G));
    const tr = root.querySelector('.hub-track'); if (!tr) return draw();
    const inP = tr.querySelector(`.hub-pane[data-pane="${v}"]`);
    if (!slideMode()) { tr.querySelectorAll('.hub-pane').forEach(p => { p.classList.remove('hp-off'); p.style.transform = ''; p._y = null; }); placeInd(true); placeTrack(false); scrollTo(0, VSCROLL[v] || 0); dispatchEvent(new Event('hub-view'));
      if (inP && !calm()) { inP.classList.remove('fadein'); void inP.offsetWidth; inP.classList.add('fadein'); } return; }
    prepIn(inP); clampPane(out0);
    placeInd(true); placeTrack(true); dispatchEvent(new Event('hub-view'));
  }
  addEventListener('resize', () => { placeInd(false); placeTrack(false); });
  // Phones: swipe sideways anywhere below the top to flip between the two lists.
  if (TOUCH) { let sw = null;
    document.addEventListener('touchstart', e => { const tr = root.querySelector('.hub-track'); if (!tr || !e.target.closest || e.target.closest('.hub-head, .hub-modal, .hub-toast, .pg-ct') || document.body.classList.contains('adminbody') || RD || e.touches.length > 1 || e.target.closest('.hr-grip, .hc-list, input, textarea')) return;
      sw = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now(), lock: null, dx: 0, tr, w: tr.getBoundingClientRect().width || innerWidth }; }, { passive: true });
    document.addEventListener('touchmove', e => { if (!sw) return; let dx = e.touches[0].clientX - sw.x; const dy = e.touches[0].clientY - sw.y;
      if (!sw.lock) { if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; sw.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; if (sw.lock === 'x') { const mid = sw.tr._off != null, m0 = mid ? new DOMMatrix(getComputedStyle(sw.tr).transform).m41 : 0; settle();
          if (mid) { const off = m0 - (view === 'shared' ? -sw.w : 0); sw.x -= off; placeTrack(false, dx + off); }
          const other = sw.tr.querySelector(`.hub-pane[data-pane="${view === 'mine' ? 'shared' : 'mine'}"]`); VSCROLL[view] = scrollY; prepIn(other); dx = e.touches[0].clientX - sw.x; } }
      if (sw.lock !== 'x') return; e.preventDefault();
      const can = (dx < 0 && view === 'mine') || (dx > 0 && view === 'shared'); sw.dx = can ? Math.max(-sw.w, Math.min(sw.w, dx)) : dx / (3 + Math.abs(dx) / 60);
      sw.last = { dx, t: Date.now() };
      if (!sw.raf) sw.raf = requestAnimationFrame(() => { if (!sw) return; sw.raf = 0; placeTrack(false, sw.dx); const base = view === 'shared' ? 1 : 0; placeInd(false, Math.max(0, Math.min(1, base - sw.dx / sw.w))); }); }, { passive: false });
    const end = () => { if (!sw) return; const s = sw; sw = null; if (s.raf) cancelAnimationFrame(s.raf); if (s.lock !== 'x') return;
      const v = Math.abs(s.dx) / Math.max(1, Date.now() - s.t), go = ((s.dx < 0 && view === 'mine') || (s.dx > 0 && view === 'shared')) && (Math.abs(s.dx) > s.w * .3 || v > .45);
      if (go) switchView(view === 'mine' ? 'shared' : 'mine'); else { placeInd(true); placeTrack(true); const tr = root.querySelector('.hub-track'); const other = tr && tr.querySelector('.hub-pane:not(.on)'); if (other) other._y = null; } };
    document.addEventListener('touchend', end); document.addEventListener('touchcancel', end); }
  function draw() {
    const SH = view === 'shared', mine = chars.filter(isMine), shared = chars.filter(c => !isMine(c)), groups = {};
    shared.forEach(c => { const k = NAMES[c.owner] || (c.player || '').trim() || c.owner || 'No player yet'; (groups[k] = groups[k] || []).push(c); });
    const keys = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    const byName = (a, b) => (a.name || '').localeCompare(b.name || '');
    const sharedHTML = keys.length ? keys.map(k => { const isOpen = open[k] != null ? open[k] : true; return `<details class="hub-folder" data-k="${esc(k)}" ${isOpen ? 'open' : ''}><summary><span class="hf-caret">▸</span><span class="hf-name">${esc(k)}</span><span class="hf-n">${groups[k].length}</span></summary>
        <div class="hf-body">${groups[k].sort(byName).map(card).join('')}</div></details>`; }).join('')
        : `<p class="hub-empty">Nothing has been shared with you yet. When another player shares a character with ${esc(EMAIL)}, it shows up here.</p>`;
    const mineHTML = mine.length ? `<div class="hl">${mine.sort(ord).map(row).join('')}</div>` : `<p class="hub-empty">You don’t have any characters yet — create one, or ask whoever has yours to give it to you.</p>`;
    const TABS = true;
    const idx = view === 'shared' ? 1 : 0;
    const body = TABS ? `<div class="hub-track"><div class="hub-pane${idx ? ' hp-off' : ' on'}" data-pane="mine">${mineHTML}</div><div class="hub-pane${idx ? ' on' : ' hp-off'}" data-pane="shared">${sharedHTML}</div></div>` : mineHTML;
    const seg = TABS ? `<div class="hub-seg" role="tablist"><span class="hv-ind" aria-hidden="true"></span><button role="tab" class="${idx ? '' : 'on'}" data-view="mine">My characters <span>${mine.length}</span></button><button role="tab" class="${idx ? 'on' : ''}" data-view="shared">Shared with me <span>${shared.length}</span></button></div>` : '';
    const keepLogo = root.querySelector('.hub-logo');
    root.innerHTML = `<div class="hub-head"><header class="hub-top">${logoHTML()}
      <div class="hub-side"><div class="hub-prof"><button class="hp-pic" id="me-pic" title="Choose your picture" aria-label="Choose your picture">${(a => avaHTML(myName(), EMAIL, a.pic, '', '', a))(myAva())}<span class="hp-edit" aria-hidden="true">✎</span></button>
        <div class="hp-txt"><span class="hp-name"><b>${esc(myName())}</b><button class="hp-rename" id="me-rename" title="Change your name" aria-label="Change your name"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg></button></span><small>${esc(EMAIL)}</small><div class="hp-row"><button class="linkbtn" id="me-out">Sign out</button>${themeBtnHTML()}${IS_ADMIN ? '<button class="hub-admin hub-chip" id="hub-admin"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg><span>Admin</span></button>' : '<a class="hub-ctlink" href="#contact">Contact us</a>'}</div></div></div></div></header>
      <div class="hub-views${TABS ? '' : ' no-seg'}">${seg}${a2hsHTML()}<button class="hub-new" id="hub-new"><span class="hn-plus" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span><span class="hn-txt"><b>Create character</b></span></button></div>
      </div><div class="hub-list">${body}</div>`;
    if (keepLogo) { const n = root.querySelector('.hub-logo'); if (n) n.replaceWith(keepLogo); }
    const nb = root.querySelector('#hub-new'); if (nb) nb.onclick = createChar; wireA2HS(root);
    root.querySelector('#me-out').onclick = signOut;
    wireThemeBtn(root);
    { const rn = root.querySelector('#me-rename'); if (rn) rn.onclick = renameMe; }
    const ab = root.querySelector('#hub-admin'); if (ab) ab.onclick = () => { pgGo(ADMIN_URL); };
    root.querySelector('#me-pic').onclick = () => pickPic();
    root.querySelectorAll('[data-view]').forEach(b => b.onclick = () => switchView(b.dataset.view));
    placeInd(false); placeTrack(false);
    root.querySelectorAll('details.hub-folder').forEach(d => d.addEventListener('toggle', () => { open[d.dataset.k] = d.open; ls.set(OPEN, JSON.stringify(open)); }));
    root.querySelectorAll('.hc-dots').forEach(b => b.onclick = e => { e.stopPropagation(); const w = b.parentElement, on = !w.classList.contains('on'); root.querySelectorAll('.hc-menu.on').forEach(x => x.classList.remove('on')); w.classList.toggle('on', on); });
    root.querySelectorAll('.hc-list [data-a]').forEach(b => b.onclick = () => { const c = chars.find(x => x.id === b.dataset.id); b.closest('.hc-menu').classList.remove('on'); if (!c) return;
      if (b.dataset.a === 'share') shareChar(c); if (b.dataset.a === 'move') moveChar(c, draw); if (b.dataset.a === 'leave') leaveChar(c, draw); if (b.dataset.a === 'pin') togglePin(c.id); if (b.dataset.a === 'del') deleteChar(c, draw); if (b.dataset.a === 'copy') copyChar(c); if (b.dataset.a === 'exp') exportChar(c); if (b.dataset.a === 'tok') tokenChar(c); });
  }
  wireDie(root);
  document.addEventListener('click', () => root.querySelectorAll('.hc-menu.on').forEach(x => x.classList.remove('on')));
  // On a computer the page's own scrollbar is hidden; a slim gold one (like phone view's) sits just right of the list instead.
  if (!TOUCH && page !== 'admin') (() => {
    const sb = document.createElement('div'); sb.className = 'hub-sb'; sb.hidden = true; sb.innerHTML = '<div class="pgph-th"></div>'; document.body.appendChild(sb); const th = sb.firstElementChild;
    const paint = () => { if (document.body.classList.contains('adminbody')) { sb.hidden = true; return; }
      const de = document.documentElement, max = de.scrollHeight - innerHeight, head = document.querySelector('.hub-head'), col = document.querySelector('.hub-head > .hub-views');
      if (max < 2 || !head || !col) { sb.hidden = true; return; } sb.hidden = false;
      const top = head.getBoundingClientRect().bottom + 14, bot = 16, H = Math.max(40, innerHeight - top - bot);
      sb.style.top = top + 'px'; sb.style.height = H + 'px'; sb.style.left = Math.min(innerWidth - 14, col.getBoundingClientRect().right + 14) + 'px';
      const h = Math.max(28, H * innerHeight / de.scrollHeight); th.style.height = h + 'px'; th.style.top = ((H - h) * (scrollY / max)) + 'px'; };
    addEventListener('scroll', paint, { passive: true }); addEventListener('resize', paint); new MutationObserver(() => requestAnimationFrame(paint)).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'open'] }); setTimeout(paint, 50);
    addEventListener('hub-view', () => { paint(); setTimeout(paint, 380); });
    th.addEventListener('pointerdown', e => { e.preventDefault(); th.classList.add('drag'); th.setPointerCapture(e.pointerId);
      const y0 = e.clientY, s0 = scrollY, k = (document.documentElement.scrollHeight - innerHeight) / Math.max(1, sb.clientHeight - th.offsetHeight);
      const mv = ev => scrollTo(0, s0 + (ev.clientY - y0) * k), up = () => { th.classList.remove('drag'); th.removeEventListener('pointermove', mv); th.removeEventListener('pointerup', up); th.removeEventListener('pointercancel', up); };
      th.addEventListener('pointermove', mv); th.addEventListener('pointerup', up); th.addEventListener('pointercancel', up); });
    sb.addEventListener('pointerdown', e => { if (e.target !== sb) return; scrollBy({ top: (e.clientY < th.getBoundingClientRect().top ? -1 : 1) * innerHeight * .8, behavior: 'smooth' }); });
  })();
  draw();
  // Everyone — admins too — sees their own characters plus the ones shared with them. Admins find the rest in Admin.
  const lists = {}, merge = () => { const m = new Map(); Object.values(lists).forEach(l => l.forEach(c => m.set(c.id, c))); chars = [...m.values()]; if (!RD) draw();
    if (IS_ADMIN) needNames(chars.filter(c => !isMine(c)).map(c => c.owner)).then(() => { if (!RD) draw(); });
    if (ME && ME.picChar) { const ch = chars.find(c => c.id === ME.picChar); if (ch && (ch.thumb || '') !== (ME.pic || '')) { ME.pic = ch.thumb || ''; usersCol.doc(EMAIL).update({ pic: ME.pic }).catch(() => {}); } } };
  const failed = e => { root.innerHTML = `<p class="hub-empty">Couldn't load the character list (${esc(e.code || e.message || e)}).<br><br>Signed in as ${esc(EMAIL)} · <button class="linkbtn" onclick="pgSignOut()">Sign out</button></p>`; console.error(e); };
  const watch = (k, q) => q.onSnapshot(qs => { lists[k] = qs.docs.map(d => Object.assign({ id: d.id }, d.data())); if (k === 'shared') SH_LOADED = true; merge(); }, failed);
  watch('mine', charsCol.where('owner', '==', EMAIL)); watch('shared', charsCol.where('viewers', 'array-contains', EMAIL));
  setInterval(() => { if (!RD) draw(); }, 60000);

  // ================= Admin section (its own page: ?g=…&admin=1) =================
  function adminSection() {
    if (!window.PG_NF) { window.PG_NF = 1; document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-newfor]'); if (b) pgGo(URLS.newChar(G, b.dataset.newfor, nameOf(b.dataset.newfor))); }); }
    const UREF = usersCol.doc(EMAIL); let CHECKED = Number(ME && ME.checkedAt) || 0;
    const UF0 = { role: '', act: '', joined: '' };
    const T0 = ctx.tab === 'characters' ? 'chars' : ctx.tab; let TAB = ['users', 'chars', 'new', 'audit'].includes(T0) ? T0 : 'users'; if (T0 === 'admins') UF0.role = 'admin';
    const CH = {}, US = {}; // characters and accounts on screen
    let NEWN = null;
    const setTab = t => { TAB = t; history.replaceState(null, '', URLS.admin(G, t === 'chars' ? 'characters' : t)); frame(); };
    const ic = {
      audit: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
      users: '<path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1"/><circle cx="9" cy="7" r="3.5"/><path d="M22 19v-1a4 4 0 0 0-3-3.9M16 3.5a3.5 3.5 0 0 1 0 7"/>',
      chars: '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/><path d="M8 8h6"/>',
      admins: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
      new: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>' };
    const svg = (k, n = 18) => `<svg viewBox="0 0 24 24" width="${n}" height="${n}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic[k]}</svg>`;
    const PAGES = { users: ['Users', 'Everyone who has signed in, most recently active first. Search or filter by role, activity or when they joined; rename someone, make them an admin, or look at their characters.'],
      chars: ['Characters', 'Every character on the site, newest activity first. Search or filter by player, sharing or last update; share any of them with yourself, or open, share, move or delete them.'],
      admins: ['Admins', 'Admins can open and edit every character, manage users and see new accounts.'],
      new: ['New', 'Accounts and characters that appeared since you last marked this as read.'],
      audit: ['Audit log', 'Everything people have done on the site: sign-ins, characters opened, created, edited, shared and deleted, and admin actions. Search, or filter by date, person or activity; tap an event for its details. Events are kept for 7 days.'] };
    // avatar: initials on a colour picked from the name, so the same person always looks the same
    const hue = t => [...String(t || '?')].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 360, 7);
    const ava = (name, em) => { const ini = String(name || em || '?').split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
      const a = (em && PICS[em]) || {}; return `<span class="adm-ava${a.pic ? ' has-pic' : ''}${a.clear ? ' clear' : ''}" title="${esc(name || em || '')}" data-em="${esc(em || '')}" style="${a.pic ? '' : avaStyle(a, em || name)}">${a.pic ? `<img src="${esc(a.pic)}" alt="">` : esc(ini)}</span>`; };
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

    const PANES = {}; let PREV_TAB = '';
    // Phones: the tabs sit at the bottom of the screen like the sheet's tab bar (same height setting), with a highlight
    // that slides between tabs and can be dragged along the bar.
    const PHONE = matchMedia('(max-width: 860px)');
    let NAV_PREV = null, NAV_KEY = null;
    try { const v = localStorage.getItem('dnd-tablift'); document.documentElement.style.setProperty('--tablift', (v != null && v !== '' ? Number(v) || 0 : 24) + 'px'); } catch (e) { document.documentElement.style.setProperty('--tablift', '24px'); }
    function navPost() {
      const nv = root.querySelector('.adm-nav'), side = root.querySelector('.adm-side'); if (!nv || !side) return;
      if (PHONE.matches) { if (nv.parentElement !== root) root.appendChild(nv); }
      else if (nv.parentElement !== side) side.insertBefore(nv, side.querySelector('.adm-foot'));
      let ind = nv.querySelector('.adm-ind'); if (!ind) { ind = document.createElement('span'); ind.className = 'adm-ind'; ind.setAttribute('aria-hidden', 'true'); nv.prepend(ind); }
      const on = nv.querySelector('.adm-ni.on'); if (!on) { ind.style.display = 'none'; return; } ind.style.display = '';
      const nr = nv.getBoundingClientRect(), r = on.getBoundingClientRect(), to = { x: r.left - nr.left, y: r.top - nr.top, w: r.width, h: r.height };
      const set = p => { ind.style.transform = `translate(${p.x}px, ${p.y}px)`; ind.style.width = p.w + 'px'; ind.style.height = p.h + 'px'; };
      const anim = NAV_PREV && NAV_KEY && NAV_KEY !== TAB && !matchMedia('(prefers-reduced-motion: reduce)').matches;
      ind.style.transition = 'none';
      if (anim) { set(NAV_PREV); void ind.offsetWidth; ind.style.transition = ''; set(to); } else set(to);
      NAV_PREV = to; NAV_KEY = TAB;
    }
    PHONE.addEventListener && PHONE.addEventListener('change', () => { NAV_PREV = null; NAV_KEY = null; navPost(); });
    addEventListener('resize', () => { NAV_KEY = TAB; NAV_PREV = null; navPost(); });
    {
      let drag = null, eat = false;
      const navEl = () => root.querySelector('.adm-nav');
      const tabAt = x => [...(navEl() || document).querySelectorAll('.adm-ni')].find(t => { const r = t.getBoundingClientRect(); return x >= r.left && x <= r.right; });
      root.addEventListener('pointerdown', e => { if (!PHONE.matches || !e.isPrimary || !e.target.closest('.adm-nav .adm-ni')) return; drag = { id: e.pointerId, x0: e.clientX, on: false, hov: null }; });
      root.addEventListener('pointermove', e => {
        if (!drag || e.pointerId !== drag.id) return; const nv = navEl(), ind = nv && nv.querySelector('.adm-ind'), cur = nv && nv.querySelector('.adm-ni.on'); if (!ind || !cur) return;
        if (!drag.on) { if (Math.abs(e.clientX - drag.x0) < 8) return; drag.on = true; nv.classList.add('ndrag'); try { nv.setPointerCapture(e.pointerId); } catch (x) {} }
        const nr = nv.getBoundingClientRect(), r = cur.getBoundingClientRect(), w = r.width, x = Math.max(4, Math.min(e.clientX - nr.left - w / 2, nr.width - w - 4));
        ind.style.transition = 'none'; ind.style.transform = `translate(${x}px, ${r.top - nr.top}px)`; drag.pos = { x, y: r.top - nr.top, w, h: r.height };
        const t = tabAt(e.clientX); if (t !== drag.hov) { if (drag.hov) drag.hov.classList.remove('nhov'); if (t) { t.classList.add('nhov'); try { navigator.vibrate && navigator.vibrate(4); } catch (x) {} } drag.hov = t; }
      });
      const end = e => {
        if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null; const nv = navEl(); if (nv) nv.classList.remove('ndrag'); if (!d.on) return;
        if (d.hov) d.hov.classList.remove('nhov'); eat = true; setTimeout(() => { eat = false; }, 400);
        const t = e.type === 'pointercancel' ? null : tabAt(e.clientX); NAV_PREV = d.pos || NAV_PREV;
        if (t && t.dataset.tab !== TAB) setTab(t.dataset.tab); else { NAV_KEY = '~drag'; navPost(); }
      };
      root.addEventListener('pointerup', end); root.addEventListener('pointercancel', end);
      root.addEventListener('click', e => { if (eat && e.target.closest('.adm-nav')) { e.preventDefault(); e.stopPropagation(); } }, true);
    }
    // a tap on the bottom tabs never also lands on the page that appears under the finger (iPhone stray clicks)
    { let at = 0; const inNav = e => e.target.closest && e.target.closest('.adm-nav');
      addEventListener('pointerup', e => { if (PHONE.matches && inNav(e)) at = Date.now(); }, true);
      ['click', 'mousedown', 'touchend', 'pointerdown'].forEach(t => addEventListener(t, e => { if (Date.now() - at < 350 && !inNav(e)) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); } }, { capture: true, passive: false })); }
    if (!TOUCH && !document.querySelector('.pg-sb')) sheetScrollbar();
    function frame() { frame0(); navPost(); }
    function frame0() {
      const nav = (k, label) => `<button class="adm-ni${TAB === k ? ' on' : ''}" data-tab="${k}">${svg(k)}<span>${label}</span>${k === 'new' && NEWN ? `<b class="adm-badge">${NEWN}</b>` : ''}</button>`;
      const [title, desc] = PAGES[TAB];
      const navHTML = `<div class="adm-sec">Manage</div>${nav('users', 'Users')}${nav('chars', 'Characters')}<div class="adm-sec">Activity</div>${nav('audit', 'Audit log')}${nav('new', 'New')}`;
      // Switching tabs only swaps the page on the right: the sidebar (and where its tab strip is scrolled to on a phone) stays put.
      const nv0 = root.querySelector('.adm-nav');
      if (nv0) { const x = nv0.scrollLeft; nv0.innerHTML = navHTML; nv0.scrollLeft = x;
        root.querySelector('.adm-head h1').textContent = title; root.querySelector('.adm-head p').textContent = desc;
        // Each tab's page is kept once it has loaded, so going back to it is instant (its own actions refresh it as needed).
        const curB = root.querySelector('#ad-body'), curH = root.querySelector('#adm-hact'), again = PREV_TAB === TAB;
        if (PREV_TAB && !again) PANES[PREV_TAB] = { b: curB, h: curH, y: scrollY };
        const kept = !again && PANES[TAB];
        if (kept) { curB.replaceWith(kept.b); curH.replaceWith(kept.h); PREV_TAB = TAB; nv0.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => setTab(b.dataset.tab)); scrollTo(0, 0);
          // …and quietly brings it up to date behind the scenes
          ({ new: () => tabNew(), users: () => paintUsers(), chars: () => paintChars(), audit: () => paintAudit() })[TAB](); return; }
        const nb = document.createElement('section'); nb.id = 'ad-body'; nb.className = 'adm-body'; nb.innerHTML = '<p class="adm-dim">Loading…</p>';
        const nh = document.createElement('div'); nh.id = 'adm-hact'; nh.className = 'adm-hact';
        if (again) { curB.replaceWith(nb); curH.replaceWith(nh); } else { curB.replaceWith(nb); curH.replaceWith(nh); } delete PANES[TAB]; PREV_TAB = TAB;
        nv0.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => setTab(b.dataset.tab));
        const on = nv0.querySelector('.adm-ni.on'); if (on && on.scrollIntoView) { const r = on.getBoundingClientRect(), nr = nv0.getBoundingClientRect(); if (r.left < nr.left || r.right > nr.right) nv0.scrollBy({ left: r.left < nr.left ? r.left - nr.left - 12 : r.right - nr.right + 12, behavior: 'smooth' }); }
        ({ new: tabNew, users: tabUsers, chars: tabChars, audit: tabAudit })[TAB](); return; }
      const keepLogo = root.querySelector('.hub-logo');
      root.innerHTML = `<div class="adm"><aside class="adm-side">
          <div class="adm-brand">${logoHTML()}</div>
          <div class="adm-backrow"><a class="adm-back" href="${esc(HUB)}">← Adventurer’s Tome</a></div>
          <nav class="adm-nav">${navHTML}</nav>
          <div class="adm-foot adm-me">${(a => avaHTML(myName(), EMAIL, a.pic, '', '', a))(avaOf(ME))}<div class="adm-me-t"><b>${esc(myName())}</b><small>${esc(EMAIL)}</small><button class="linkbtn" id="adm-out">Sign out</button></div></div></aside>
        <main class="adm-main"><header class="adm-head"><div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div><div class="adm-hact" id="adm-hact"></div></header>
          <section id="ad-body" class="adm-body"><p class="adm-dim">Loading…</p></section></main></div>`;
      if (keepLogo) { const n = root.querySelector('.hub-logo'); if (n) n.replaceWith(keepLogo); }
      PREV_TAB = TAB;
      root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => setTab(b.dataset.tab));
      { const o = root.querySelector('#adm-out'); if (o) o.onclick = signOut; }
      ({ new: tabNew, users: tabUsers, chars: tabChars, audit: tabAudit })[TAB]();
    }
    const B = () => root.querySelector('#ad-body'), HA = () => root.querySelector('#adm-hact');
    // ⋯ menus float above everything (moved to the top of the page while open), so a table never grows a scrollbar for them.
    let MENU = null;
    const closeAdmMenus = () => { const m = MENU; if (!m) return; MENU = null; m.w.classList.remove('on'); const l = m.l; l.classList.add('closing'); l.classList.remove('on');
      setTimeout(() => { l.classList.remove('closing', 'portal'); l.style.left = l.style.top = ''; if (m.w.isConnected) m.w.appendChild(l); else l.remove(); if (MENU_PENDING) { const f = MENU_PENDING; MENU_PENDING = null; f(); } }, PG_CALM ? 0 : 130); };
    let MENU_PENDING = null; const whenMenusClosed = f => { if (MENU) MENU_PENDING = f; else f(); };
    document.addEventListener('click', e => { const k = e.target.closest && e.target.closest('.adm-kebab');
      if (MENU && (!k || k.parentElement !== MENU.w) && !(e.target.closest && e.target.closest('.adm-mlist.portal') && !e.target.closest('[data-mi]'))) closeAdmMenus();
      if (!k || (MENU && MENU.w === k.parentElement)) { if (k) closeAdmMenus(); return; }
      const w = k.parentElement, l = w.querySelector('.adm-mlist'); if (!l) return;
      document.body.appendChild(l); l.classList.add('portal', 'on'); w.classList.add('on'); MENU = { w, l };
      const r = k.getBoundingClientRect(), mw = l.offsetWidth, mh = l.offsetHeight;
      l.style.left = Math.max(8, Math.min(r.right - mw, innerWidth - mw - 8)) + 'px';
      l.style.top = (r.bottom + 4 + mh > innerHeight - 8 && r.top - 4 - mh > 8 ? r.top - 4 - mh : Math.min(r.bottom + 4, innerHeight - mh - 8)) + 'px'; });
    addEventListener('scroll', () => { if (MENU) closeAdmMenus(); }, { passive: true, capture: true }); addEventListener('resize', () => { if (MENU) closeAdmMenus(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && MENU) closeAdmMenus(); });

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
      el.querySelectorAll('[data-mi]').forEach(b => b.onclick = () => { const c = CH[b.dataset.id]; closeAdmMenus(); if (!c) return;
        ({ open: () => { pgGo(URLS.char(c)); }, share: () => shareChar(c, Object.assign(() => {}, { refresh: redo })), give: () => moveChar(c, redo), rm: () => removeChar(c, redo), del: () => deleteChar(c, redo) })[b.dataset.mi](); });
    }
    const docs = r => r.docs.map(d => Object.assign({ id: d.id }, d.data()));
    const failMsg = x => `<p class="adm-empty">Couldn't load this (${esc((x && (x.code || x.message)) || x)}).</p>`;
    const toolbar = (id, ph, val, count) => `<div class="adm-tool"><label class="adm-search">${svg('search', 16)}<input id="${id}" placeholder="${esc(ph)}" value="${esc(val)}" autocomplete="off"></label><span class="adm-count" id="${id}-n">${count || ''}</span></div>`;

    // --- New --- (redrawn by itself when accounts or characters change while it's open)
    let NEWT = null; const newSoon = () => { clearTimeout(NEWT); NEWT = setTimeout(() => { if (TAB === 'new' && !MENU) tabNew(); }, 1500); };
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

    // --- Users: everyone, live (a new sign-up or someone coming online shows up without a refresh) ---
    let UQ = '', UROWS = [], ULIVE = null, UOPEN = new Set(); const UF = UF0, UCH = {};
    const ONLINE = 4 * 60000, isOn = u => u.seenAt && Date.now() - u.seenAt < ONLINE;
    const fsel = (id, label, opts, val) => `<label class="adm-fsel${val ? ' on' : ''}"><span>${label}</span><select id="${id}">${opts.map(([v, t]) => `<option value="${v}"${v === val ? ' selected' : ''}>${t}</option>`).join('')}</select></label>`;
    async function tabUsers() {
      const el = B(); HA().innerHTML = '';
      el.innerHTML = `<div class="adm-filters">${toolbar('ad-uq', 'Search by name or email', UQ)}<div class="adm-fsels">
          ${fsel('uf-role', 'Role', [['', 'Anyone'], ['owner', 'Owner'], ['admin', 'Admins'], ['member', 'Members'], ['blocked', 'Blocked']], UF.role)}
          ${fsel('uf-act', 'Active', [['', 'Any time'], ['on', 'Online now'], ['1', 'Today'], ['7', 'This week'], ['30', 'This month'], ['old', 'Not in 30+ days']], UF.act)}
          ${fsel('uf-join', 'Joined', [['', 'Any time'], ['7', 'Past week'], ['30', 'Past month']], UF.joined)}</div></div><div id="ad-ul"><p class="adm-dim">Loading…</p></div>`;
      const q = el.querySelector('#ad-uq'); let t = null; q.oninput = () => { clearTimeout(t); t = setTimeout(() => { UQ = q.value; paintUsers(); }, 150); }; if (!UQ && !TOUCH) q.focus();
      [['uf-role', 'role'], ['uf-act', 'act'], ['uf-join', 'joined']].forEach(([id, k]) => { const sl = el.querySelector('#' + id); sl.onchange = () => { UF[k] = sl.value; sl.parentElement.classList.toggle('on', !!sl.value); paintUsers(); }; });
      if (!ULIVE) ULIVE = usersCol.limit(1000).onSnapshot(qs => { UROWS = docs(qs); UROWS.forEach(u => { US[u.id] = u; remember(u.id, u); }); if (APEOPLE) APEOPLE = UROWS.slice().sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
        if (TAB === 'users') paintUsers(); if (TAB === 'new' && qs.docChanges().some(ch => ch.type !== 'modified')) newSoon(); }, x => { const l = B().querySelector('#ad-ul'); if (l) l.innerHTML = failMsg(x); });
      else paintUsers();
    }
    setInterval(() => { if (TAB === 'users' && !document.hidden) paintUsers(); }, 30000); // "Online now" comes and goes with time too
    const roleKey = u => u.banned ? 'blocked' : u.id === ADMIN_EMAIL ? 'owner' : ADMINS.includes(u.id) ? 'admin' : 'member';
    function paintUsers() {
      const l = B() && B().querySelector('#ad-ul'); if (!l) return; if (MENU || document.querySelector('.hub-modal.on')) return whenMenusClosed(paintUsers);
      const q = UQ.trim().toLowerCase(), now = Date.now(), dayN = n => now - n * 864e5;
      const rows = UROWS.filter(u => (!q || (String(u.name || '') + ' ' + u.id).toLowerCase().includes(q))
          && (!UF.role || roleKey(u) === UF.role || (UF.role === 'admin' && roleKey(u) === 'owner'))
          && (!UF.act || (UF.act === 'on' ? isOn(u) : UF.act === 'old' ? !(u.seenAt > dayN(30)) : u.seenAt > dayN(Number(UF.act))))
          && (!UF.joined || u.createdAt > dayN(Number(UF.joined))))
        .sort((a, b) => (isOn(b) - isOn(a)) || ((b.seenAt || 0) - (a.seenAt || 0)) || String(a.name || a.id).localeCompare(String(b.name || b.id)));
      const cnt = B().querySelector('#ad-uq-n'); if (cnt) cnt.textContent = rows.length + ' of ' + UROWS.length + ' user' + (UROWS.length === 1 ? '' : 's') + (UROWS.filter(isOn).length ? ' · ' + UROWS.filter(isOn).length + ' online' : '');
      const seen = u => isOn(u) ? '<span class="adm-online" title="Has Adventurer’s Tome open right now"><i></i>Online now</span>' : u.seenAt ? esc(ago(u.seenAt)) : '<span class="adm-dim">—</span>';
      l.innerHTML = rows.length ? `<div class="adm-tw"><table class="adm-t"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Last active</th><th></th><th></th></tr></thead><tbody>${rows.map(u => { const [rl, rc] = u.banned ? ['Blocked', 'r-blk'] : roleOf(u.id), open = UOPEN.has(u.id);
          return `<tr data-u="${esc(u.id)}"><td><span class="adm-who">${ava(u.name, u.id)}<b>${esc(u.name || '—')}</b></span></td><td class="adm-mail">${esc(u.id)}</td><td><span class="adm-tag ${rc}">${rl}</span></td><td>${when(u.createdAt)}</td><td>${seen(u)}</td>
            <td><button class="adm-btn sm" data-uc="${esc(u.id)}">Characters ${open ? '▾' : '▸'}</button></td><td class="adm-act">${kebab([['rename', 'Rename…', u.id], ['pic', 'Change picture…', u.id], ['newfor', 'New character for them', u.id]].concat(IS_OWNER && u.id !== ADMIN_EMAIL ? [ADMINS.includes(u.id) ? ['unadmin', 'Remove admin', u.id] : ['mkadmin', 'Make admin', u.id]] : [], u.id === ADMIN_EMAIL || u.id === EMAIL ? [] : [['signout', 'Sign out everywhere', u.id]].concat(u.banned ? [['unblock', 'Unblock', u.id]] : [], [['delacct', 'Delete account…', u.id, 'danger']])))}</td></tr>
            <tr class="adm-subrow" data-sub="${esc(u.id)}"${open ? '' : ' hidden'}><td colspan="7"></td></tr>`; }).join('')}</tbody></table></div>`
        : `<p class="adm-empty">${UROWS.length ? 'Nobody matches these filters.' : 'No accounts yet.'}</p>`;
      const fill = async (em, cell, fresh) => { const show = cs => { cell.innerHTML = ctable(cs, false) + `<button class="adm-btn sm" data-newfor="${esc(em)}">＋ New character for ${esc(nameOf(em))}</button>`; wire(cell, () => fill(em, cell, true)); };
        if (UCH[em] && !fresh) return show(UCH[em]); cell.innerHTML = '<p class="adm-dim">Loading…</p>';
        try { UCH[em] = docs(await charsCol.where('owner', '==', em).limit(100).get()).sort((x, y) => (y.updatedAt || 0) - (x.updatedAt || 0)); if (cell.isConnected) show(UCH[em]); } catch (x) { cell.innerHTML = failMsg(x); } };
      l.querySelectorAll('tr.adm-subrow:not([hidden])').forEach(sub => fill(sub.dataset.sub, sub.firstElementChild));
      l.querySelectorAll('[data-uc]').forEach(b => b.onclick = () => { const em = b.dataset.uc, sub = l.querySelector(`[data-sub="${CSS.escape(em)}"]`); if (!sub) return;
        if (UOPEN.has(em)) { UOPEN.delete(em); sub.hidden = true; b.textContent = 'Characters ▸'; return; } UOPEN.add(em); sub.hidden = false; b.textContent = 'Characters ▾'; fill(em, sub.firstElementChild, true); });
      l.querySelectorAll('[data-mi]').forEach(b => b.onclick = async () => { const em = b.dataset.id; closeAdmMenus();
        if (b.dataset.mi === 'mkadmin' || b.dataset.mi === 'unadmin') { const add = b.dataset.mi === 'mkadmin', cfg = fs.collection('config').doc('admins');
          if (add && !await ask('Make ' + esc(nameOf(em)) + ' an admin?', 'They’ll be able to open and change every character, manage users and see the audit log.', 'Make admin')) return;
          cfg.set({ emails: add ? FV.arrayUnion(em) : FV.arrayRemove(em) }, { merge: true }).then(() => { ADMINS = add ? [...new Set(ADMINS.concat(em))] : ADMINS.filter(x => x !== em); toast(nameOf(em) + (add ? ' is now an admin.' : ' is no longer an admin.')); pgLog(add ? 'admin_add' : 'admin_remove', { target: em, tName: nameOf(em) }); paintUsers(); }, x => toast('Couldn’t change that: ' + (x.message || x))); return; }
        if (b.dataset.mi === 'newfor') pgGo(URLS.newChar(G, em, nameOf(em))); else if (b.dataset.mi === 'rename') renameUser(em); else userAction(b.dataset.mi, em); });
    }
    const tabUsersList = () => paintUsers();
    // --- Managing someone's account: picture, sign out everywhere, block, delete ---
    const ask = (title, text, okLabel, danger, confirmText) => new Promise(res => {
      modal.innerHTML = `<div class="hub-card"><h2>${title}</h2><p class="hub-hint">${text}</p>${confirmText ? `<label class="del-l">Type <b>${esc(confirmText)}</b> to confirm<input id="ak-q" class="ad-search" autocomplete="off" spellcheck="false"></label>` : ''}
        <div class="row"><button class="btn ghost" id="ak-x">Cancel</button><button class="btn ${danger ? 'red' : 'gold'}" id="ak-ok"${confirmText ? ' disabled' : ''}>${okLabel}</button></div></div>`;
      modal.classList.add('on'); const ok = modal.querySelector('#ak-ok'), q = modal.querySelector('#ak-q');
      if (q) { q.oninput = () => { ok.disabled = q.value.trim().toLowerCase() !== confirmText.toLowerCase(); }; q.focus(); }
      modal.querySelector('#ak-x').onclick = () => { close(); res(null); }; ok.onclick = () => { const extra = {}; modal.querySelectorAll('input[type=checkbox]').forEach(c => { extra[c.id] = c.checked; }); close(); res(extra); }; });
    const wipeChar = async c => { const s0 = await sheets.doc(c.id).get().catch(() => null); const n = Number(s0 && s0.exists && s0.data().n) || 1;
      for (const pth of new Set([c.path, ...(c.paths || [])])) if (pth && !pth.includes('/')) await fs.collection('slugs').doc(pth).delete().catch(() => {});
      for (let k = 1; k < n; k++) await sheets.doc(c.id + '_p' + k).delete().catch(() => {});
      if (s0 && s0.exists) await sheets.doc(c.id).delete().catch(() => {}); await charsCol.doc(c.id).delete().catch(() => {}); };
    async function userAction(act, em) {
      const u = US[em] || { id: em }, nm = u.name || em, ref = usersCol.doc(em), done = () => { delete PICS[em]; delete PICQ[em]; tabUsersList(); };
      try {
        if (act === 'pic') { const list = docs(await charsCol.where('owner', '==', em).limit(100).get()).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); pickPic({ em, name: nm, rec: u, list, after: done }); return; }
        if (act === 'signout') { if (!await ask('Sign ' + esc(nm) + ' out everywhere?', 'They’re signed out on every device right away and have to sign in again. Nothing else changes.', 'Sign out everywhere')) return;
          await ref.update({ revokedAt: Date.now() }); u.revokedAt = Date.now(); pgLog('user_signout', { target: em, tName: nm }); toast(nm + ' was signed out everywhere.'); return; }
        if (act === 'unblock') { await ref.update({ banned: false }); u.banned = false; pgLog('user_unblock', { target: em, tName: nm }); toast(nm + ' is unblocked.'); done(); return; }
        if (act === 'delacct') {
          const theirs = docs(await charsCol.where('owner', '==', em).limit(200).get());
          const r = await ask('Delete ' + esc(nm) + '’s account?', `This removes their account record and signs them out everywhere. They could sign in again later and start fresh.
            <label class="ak-c"><input type="checkbox" id="wipe" ${theirs.length ? 'checked' : 'disabled'}> Also delete their ${theirs.length} character${theirs.length === 1 ? '' : 's'}${theirs.length ? ' (can’t be undone)' : ''}</label>`, 'Delete account', true, em);
          if (!r) return; toast('Deleting…');
          if (r.wipe) for (const c of theirs) await wipeChar(c);
          if (r.block) await ref.set({ email: em, name: nm, nameLower: nm.toLowerCase(), keys: searchKeys(nm, em.split('@')[0], em), banned: true, revokedAt: Date.now(), createdAt: u.createdAt || Date.now() });
          else { await ref.update({ revokedAt: Date.now() }).catch(() => {}); await ref.delete(); }
          pgLog('user_delete', { target: em, tName: nm, detail: [r.wipe ? 'deleted ' + theirs.length + ' character' + (theirs.length === 1 ? '' : 's') : 'kept their characters', r.block ? 'blocked' : ''].filter(Boolean).join(', ') });
          UROWS = r.block ? UROWS : UROWS.filter(x => x.id !== em); toast(nm + '’s account was deleted.'); done(); }
      } catch (x) { toast('Couldn’t do that: ' + ((x && (x.code === 'permission-denied' ? 'the new database rules need publishing' : x.message)) || x)); }
    }

    // --- Audit log ---
    const ACTS = { signin: 'Signed in', account: 'Created their account', signout: 'Signed out', open: 'Opened', create: 'Created', edit: 'Edited', delete: 'Deleted', give: 'Gave away', remove: 'Removed from the lists',
      share: 'Shared', unshare: 'Stopped sharing', access: 'Changed access to', leave: 'Gave up access to', picture: 'Changed their picture',
      rename_user: 'Renamed', admin_add: 'Made an admin:', admin_remove: 'Removed admin:', user_picture: 'Changed the picture of', user_signout: 'Signed out everywhere:', user_block: 'Blocked', user_unblock: 'Unblocked', user_delete: 'Deleted the account of' };
    const AGROUPS = [['Signing in', ['signin', 'account', 'signout']], ['Characters', ['open', 'create', 'edit', 'delete', 'give', 'remove']], ['Sharing', ['share', 'unshare', 'access', 'leave']], ['Pictures', ['picture', 'user_picture']], ['Admin', ['rename_user', 'admin_add', 'admin_remove', 'user_signout', 'user_block', 'user_unblock', 'user_delete']]];
    const CHAR_ACTS = new Set(['open', 'create', 'edit', 'delete', 'give', 'remove', 'share', 'unshare', 'access', 'leave']);
    let AF = { who: [], act: [], q: '', from: '', to: '', range: '' }, AROWS, AOPEN = {} = [], ALAST = null, AFULL = false, APEOPLE = null;
    const auditCol = fs.collection('audit');
    // The log only keeps the past week: opening the admin page clears out anything older (the rules allow admins to
    // delete only events more than 7 days old). Runs once per visit, in the background.
    if (!window.PG_AUPRUNE) { window.PG_AUPRUNE = 1; (async () => { try { for (let i = 0; i < 20; i++) {
      const snap = await auditCol.where('at', '<', Date.now() - 7 * 864e5 - 6e4).limit(400).get(); if (snap.empty) break;
      const bt = fs.batch(); snap.docs.forEach(d => bt.delete(d.ref)); await bt.commit(); if (snap.size < 400) break; } } catch (e) {} })(); }
    // Modelled on the Atlassian admin audit log: one search box, a row of filter pills, then a dense table of
    // Date · Actor · Activity where each row opens to show the full details.
    const AU_RANGES = [['', 'Any time'], ['1', 'Past 24 hours'], ['3', 'Past 3 days'], ['7', 'Past 7 days'], ['custom', 'Custom range…']];
    const auRange = () => AF.range === 'custom' ? [dayMs(AF.from), dayMs(AF.to, true)] : AF.range ? [Date.now() - Number(AF.range) * 864e5, 0] : [0, 0];
    // Filter pills open a dropdown with its own search box and a checklist, as in Atlassian's admin.
    const auOn = () => !!(AF.range || AF.who.length || AF.act.length || AF.q);
    const chev = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    const pName = em => (APEOPLE.find(u => u.id === em) || {}).name || NAMES[em] || em;
    const actLabel = k => ACTS[k].replace(/:$/, '');
    let ALIVE = null;
    async function tabAudit() {
      const el = B(); HA().innerHTML = '';
      if (!APEOPLE) { try { APEOPLE = docs(await usersCol.limit(500).get()).sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id)); APEOPLE.forEach(u => remember(u.id, u)); } catch (e) { APEOPLE = []; } }
      el.innerHTML = `<div class="au-bar">
          <label class="au-search">${svg('search', 16)}<input id="au-q" type="search" placeholder="Search activity, people or characters" value="${esc(AF.q)}" autocomplete="off"></label>
          <div class="au-pills" id="au-pills"></div></div><div id="au-l"><p class="adm-dim">Loading…</p></div>`;
      paintPills();
      let t = null; const q = el.querySelector('#au-q');
      q.oninput = () => { clearTimeout(t); t = setTimeout(() => { AF.q = q.value; paintAudit(); paintPills(); }, 200); };
      // The log is live: new events slide in as they happen (it only keeps the past week, so all of it is here).
      if (!ALIVE) ALIVE = auditCol.orderBy('at', 'desc').limit(1500).onSnapshot(qs => { AROWS = docs(qs); AFULL = false; if (TAB === 'audit') paintAudit(); }, x => { const l = B().querySelector('#au-l'); if (l) l.innerHTML = failMsg(x); });
      else paintAudit();
    }
    function paintPills() {
      const box = B().querySelector('#au-pills'); if (!box) return;
      const lab = { range: AF.range === 'custom' ? (AF.from || AF.to ? [AF.from || '…', AF.to || '…'].join(' – ') : 'Custom') : (AU_RANGES.find(r => r[0] === AF.range) || AU_RANGES[0])[1],
        who: !AF.who.length ? 'Everyone' : AF.who.length === 1 ? pName(AF.who[0]) : AF.who.length + ' people',
        act: !AF.act.length ? 'All' : AF.act.length === 1 ? actLabel(AF.act[0]) : AF.act.length + ' activities' };
      const on = { range: !!AF.range, who: !!AF.who.length, act: !!AF.act.length };
      box.innerHTML = [['range', 'Date'], ['who', 'Actor'], ['act', 'Activity']].map(([k, l]) => `<div class="au-pw"><button class="au-pill${on[k] ? ' on' : ''}" data-pop="${k}" aria-haspopup="true"><span class="au-pl">${l}:</span> <b>${esc(lab[k])}</b>${chev}</button></div>`).join('')
        + (auOn() ? '<button class="au-clr" id="au-clr">Clear filters</button>' : '');
      box.querySelectorAll('[data-pop]').forEach(b => b.onclick = e => { e.stopPropagation(); const open = b.parentElement.querySelector('.au-pop'); closePops(); if (!open) openPop(b.dataset.pop, b.parentElement); });
      const c = box.querySelector('#au-clr'); if (c) c.onclick = () => { const refetch = AF.who.length || AF.range; AF = { who: [], act: [], q: '', from: '', to: '', range: '' }; const q = B().querySelector('#au-q'); if (q) q.value = '';
        paintPills(); paintAudit(); };
    }
    let POP_DIRTY = false;
    function closePops() { const was = root.querySelector('.au-pop'); root.querySelectorAll('.au-pop').forEach(p => p.remove()); root.querySelectorAll('.au-pill.open').forEach(p => p.classList.remove('open'));
      if (was && POP_DIRTY) { POP_DIRTY = false; paintAudit(); } }
    document.addEventListener('click', e => { if (!e.target.closest || !e.target.closest('.au-pw')) closePops(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePops(); });
    function openPop(k, wrap) {
      const pop = document.createElement('div'); pop.className = 'au-pop'; pop.setAttribute('role', 'dialog'); wrap.appendChild(pop); wrap.querySelector('.au-pill').classList.add('open');
      const check = (on) => `<span class="au-cb${on ? ' on' : ''}" aria-hidden="true">${on ? '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : ''}</span>`;
      const radio = on => `<span class="au-rb${on ? ' on' : ''}" aria-hidden="true"></span>`;
      const refresh = () => { paintPills(); const nw = B().querySelector(`.au-pill[data-pop="${k}"]`); if (nw) { nw.classList.add('open'); nw.parentElement.appendChild(pop); } };
      if (k === 'range') {
        const draw = () => { pop.innerHTML = `<div class="au-ph">Date range</div><div class="au-opts">${AU_RANGES.map(([v, t]) => `<button class="au-opt" data-v="${v}">${radio(AF.range === v)}<span>${esc(t)}</span></button>`).join('')}</div>
          ${AF.range === 'custom' ? `<div class="au-pdates"><label><span>From</span><input type="date" id="au-from" value="${esc(AF.from)}"></label><label><span>To</span><input type="date" id="au-to" value="${esc(AF.to)}"></label></div>` : ''}`;
          pop.querySelectorAll('.au-opt').forEach(b => b.onclick = e => { e.stopPropagation(); AF.range = b.dataset.v; POP_DIRTY = true; refresh(); draw(); if (AF.range !== 'custom') closePops(); });
          ['from', 'to'].forEach(f => { const inp = pop.querySelector('#au-' + f); if (inp) inp.onchange = () => { AF[f] = inp.value; POP_DIRTY = true; refresh(); }; }); };
        draw(); return;
      }
      const isWho = k === 'who', sel = AF[k];
      const items = isWho ? APEOPLE.map(u => ({ v: u.id, t: u.name || u.id, sub: u.name ? u.id : '', em: u.id })) : AGROUPS.flatMap(([g, ks]) => ks.map(a => ({ v: a, t: actLabel(a), g })));
      pop.innerHTML = `<div class="au-psearch">${svg('search', 15)}<input placeholder="${isWho ? 'Search people' : 'Search activities'}" autocomplete="off"></div><div class="au-opts"></div>
        <div class="au-pfoot"><span class="adm-dim"></span><button class="au-plink" data-x>Clear</button></div>`;
      const list = pop.querySelector('.au-opts'), inp = pop.querySelector('input'), foot = pop.querySelector('.au-pfoot .adm-dim');
      const draw = () => { const f = inp.value.trim().toLowerCase(), hit = items.filter(o => !f || (o.t + ' ' + (o.sub || '') + ' ' + (o.g || '')).toLowerCase().includes(f)); let g0 = null;
        list.innerHTML = hit.length ? hit.map(o => { const head = !isWho && o.g !== g0 ? (g0 = o.g, `<div class="au-pg"><span>${esc(o.g)}</span><button class="au-plink" data-g="${esc(o.g)}">${AGROUPS.find(x => x[0] === o.g)[1].every(a => sel.includes(a)) ? 'None' : 'All'}</button></div>`) : '';
          return head + `<button class="au-opt" data-v="${esc(o.v)}">${check(sel.includes(o.v))}${isWho ? ava(o.t, o.em) : ''}<span class="au-ot"><span>${esc(o.t)}</span>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span></button>`; }).join('') : `<p class="au-none">No ${isWho ? 'people' : 'activities'} match “${esc(inp.value)}”.</p>`;
        foot.textContent = sel.length ? sel.length + ' selected' : (isWho ? 'Everyone' : 'All activities');
        list.querySelectorAll('.au-opt').forEach(b => b.onclick = e => { e.stopPropagation(); const v = b.dataset.v, i = sel.indexOf(v); if (i >= 0) sel.splice(i, 1); else sel.push(v); after(); });
        list.querySelectorAll('[data-g]').forEach(b => b.onclick = e => { e.stopPropagation(); const ks = AGROUPS.find(x => x[0] === b.dataset.g)[1], all = ks.every(a => sel.includes(a)); ks.forEach(a => { const i = sel.indexOf(a); if (all && i >= 0) sel.splice(i, 1); if (!all && i < 0) sel.push(a); }); after(); }); };
      const after = () => { if (isWho) POP_DIRTY = true; else paintAudit(); refresh(); draw(); };
      pop.querySelector('[data-x]').onclick = e => { e.stopPropagation(); sel.splice(0); after(); };
      inp.oninput = draw; pop.addEventListener('click', e => e.stopPropagation()); draw();
      if (!matchMedia('(pointer: coarse)').matches) inp.focus();
    }
    const dayMs = (d, end) => { if (!d) return 0; const t = new Date(d + 'T00:00:00').getTime(); return end ? t + 864e5 - 1 : t; };
    const tabAuditList = () => paintAudit();
    function auFiltered() {
      const [from, to] = auRange(), qq = AF.q.trim().toLowerCase();
      return AROWS.filter(e => (!AF.act.length || AF.act.includes(e.act)) && (!AF.who.length || AF.who.includes(e.by)) && (!from || e.at >= from) && (!to || e.at <= to)
        && (!qq || [e.byName, e.by, e.tName, e.target, e.detail, ACTS[e.act]].some(x => String(x || '').toLowerCase().includes(qq))));
    }
    function paintAudit() {
      const l = B() && B().querySelector('#au-l'); if (!l || !AROWS) return;
      const rows = auFiltered();
      const what = e => { const lab = esc(ACTS[e.act] || e.act); if (!e.target) return lab;
        if (CHAR_ACTS.has(e.act)) return e.act === 'delete' || e.act === 'remove' ? `${lab} <b>${esc(e.tName || 'a character')}</b>` : `${lab} <a href="${esc(URLS.byId(e.target))}">${esc(e.tName || 'a character')}</a>`;
        return `${lab} <b>${esc(e.tName || e.target)}</b>`; };
      const dt = t => { const d = new Date(t); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' }) + ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); };
      const ago = t => { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' hr ago' : Math.round(m / 1440) + ' d ago'; };
      const grpOf = a => (AGROUPS.find(([, ks]) => ks.includes(a)) || ['Other'])[0];
      const det = e => `<dl class="au-dl"><dt>Date</dt><dd>${esc(new Date(e.at).toLocaleString())}</dd><dt>Actor</dt><dd>${esc(e.byName || '—')} <span class="adm-dim">${esc(e.by)}</span></dd>
          <dt>Activity</dt><dd>${esc(ACTS[e.act] || e.act)} <span class="au-cat">${esc(grpOf(e.act))}</span></dd>${e.target ? `<dt>${CHAR_ACTS.has(e.act) ? 'Character' : 'Target'}</dt><dd>${CHAR_ACTS.has(e.act) && e.act !== 'delete' && e.act !== 'remove' ? `<a href="${esc(URLS.byId(e.target))}">${esc(e.tName || e.target)}</a>` : esc(e.tName || e.target)}</dd>` : ''}
          ${e.detail ? `<dt>Details</dt><dd class="au-dd">${esc(e.detail)}</dd>` : ''}<dt>Event ID</dt><dd class="adm-dim au-id">${esc(e.id)}</dd></dl>`;
      const cnt = `<div class="au-n"><span>${rows.length} event${rows.length === 1 ? '' : 's'}${AROWS.length !== rows.length ? ' of ' + AROWS.length + ' loaded' : ''}${AF.who.length && AROWS.length === 500 ? ' · their latest 500' : ''}</span></div>`;
      l.innerHTML = cnt + (rows.length ? `<div class="au-tw"><table class="au-t"><thead><tr><th class="au-c-d">Date</th><th class="au-c-a">Actor</th><th>Activity</th><th class="au-c-x"></th></tr></thead><tbody>${rows.map(e => `<tr class="au-r${AOPEN[e.id] ? ' open' : ''}" data-id="${esc(e.id)}" tabindex="0" aria-expanded="${!!AOPEN[e.id]}">
          <td class="au-c-d"><span title="${esc(new Date(e.at).toLocaleString())}">${esc(dt(e.at))}</span></td>
          <td class="au-c-a"><span class="adm-who">${ava(e.byName || NAMES[e.by], e.by)}<span>${esc(e.byName || e.by)}</span></span></td>
          <td class="au-c-w"><div class="au-what">${what(e)}</div>${e.detail ? `<div class="au-sub">${esc(e.detail)}</div>` : ''}<div class="au-meta">${ava(e.byName || NAMES[e.by], e.by)}<span>${esc(e.byName || e.by)}</span><span class="au-dot">·</span><span title="${esc(new Date(e.at).toLocaleString())}">${esc(ago(e.at))}</span></div></td>
          <td class="au-c-x"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></td></tr>
          ${AOPEN[e.id] ? `<tr class="au-x"><td colspan="4">${det(e)}</td></tr>` : ''}`).join('')}</tbody></table></div>` : '<p class="adm-empty">No activity matches these filters.</p>')
        + (AFULL ? '<button class="adm-btn adm-more" id="au-more">Load older</button>' : '');
      const mb = l.querySelector('#au-more'); if (mb) mb.onclick = () => tabAuditList(true);
      l.querySelectorAll('tr.au-r').forEach(tr => { const tog = e => { if (e.target.closest('a')) return; AOPEN[tr.dataset.id] = !AOPEN[tr.dataset.id]; paintAudit(); };
        tr.onclick = tog; tr.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(e); } }; });
    }

    function renameUser(em) {
      const u = US[em] || {}; modal.innerHTML = `<div class="hub-card"><h2>Rename ${esc(u.name || em)}</h2><p class="hub-hint">This is the name shown for them everywhere.</p>
        <input id="rn-q" class="ad-search" maxlength="60" value="${esc(u.name || '')}"><div class="row"><button class="btn ghost" id="rn-x">Cancel</button><button class="btn gold" id="rn-ok">Save</button></div></div>`;
      modal.classList.add('on'); const q = modal.querySelector('#rn-q'); q.focus(); q.select(); modal.querySelector('#rn-x').onclick = close;
      const go = async () => { const n = q.value.trim().slice(0, 60); if (!n) return; close();
        try { await usersCol.doc(em).update({ name: n, nameLower: n.toLowerCase(), keys: searchKeys(n, em.split('@')[0], em) }); remember(em, Object.assign({}, u, { name: n })); US[em] = Object.assign({}, u, { name: n });
          toast('Renamed to ' + n + '.'); pgLog('rename_user', { target: em, tName: n, detail: 'was ' + (u.name || em) }); UROWS = UROWS.map(x => x.id === em ? Object.assign({}, x, { name: n }) : x); tabUsersList(); } catch (x) { toast('Couldn\'t rename: ' + (x.message || x)); } };
      modal.querySelector('#rn-ok').onclick = go; q.onkeydown = e => { if (e.key === 'Enter') go(); };
    }

    // --- Characters ---
    // --- Characters: every character, live, with filters ---
    let CQ = '', CROWS = [], CLIVE = null; const CF = { owner: '', share: '', upd: '' };
    async function tabChars() {
      const el = B(); HA().innerHTML = '';
      el.innerHTML = `<div class="adm-filters">${toolbar('ad-cq', 'Search by character, race, class or player', CQ)}<div class="adm-fsels" id="cf-sels"></div></div><div id="ad-cl"><p class="adm-dim">Loading…</p></div>`;
      const q = el.querySelector('#ad-cq'); let t = null; q.oninput = () => { clearTimeout(t); t = setTimeout(() => { CQ = q.value; paintChars(); }, 150); };
      if (!CLIVE) CLIVE = charsCol.limit(2000).onSnapshot(async qs => { CROWS = docs(qs); await needNames(CROWS.map(c => c.owner)); if (TAB === 'chars') paintChars(); if (TAB === 'new' && qs.docChanges().some(ch => ch.type !== 'modified')) newSoon(); },
        x => { const l = B().querySelector('#ad-cl'); if (l) l.innerHTML = failMsg(x); });
      else paintChars();
    }
    function paintCharSels() { const box = B() && B().querySelector('#cf-sels'); if (!box) return;
      const owners = [...new Set(CROWS.map(c => c.owner).filter(Boolean))].sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
      box.innerHTML = fsel('cf-owner', 'Player', [['', 'Anyone']].concat(owners.map(o => [esc(o), esc(nameOf(o))])), CF.owner)
        + fsel('cf-share', 'Sharing', [['', 'Any'], ['shared', 'Shared'], ['private', 'Not shared'], ['me', 'Shared with me'], ['link', 'Has a view-only link']], CF.share)
        + fsel('cf-upd', 'Updated', [['', 'Any time'], ['1', 'Today'], ['7', 'This week'], ['30', 'This month'], ['old', 'Not in 30+ days']], CF.upd);
      [['cf-owner', 'owner'], ['cf-share', 'share'], ['cf-upd', 'upd']].forEach(([id, k]) => { const sl = box.querySelector('#' + id); sl.onchange = () => { CF[k] = sl.value; paintChars(); }; }); }
    function paintChars() {
      const l = B() && B().querySelector('#ad-cl'); if (!l) return; if (MENU || document.querySelector('.hub-modal.on')) return whenMenusClosed(paintChars);
      paintCharSels();
      const q = CQ.trim().toLowerCase(), now = Date.now(), dayN = n => now - n * 864e5;
      const rows = CROWS.filter(c => (!q || [c.name, c.race, c.cls, c.player, nameOf(c.owner || ''), c.owner].some(x => String(x || '').toLowerCase().includes(q)))
          && (!CF.owner || c.owner === CF.owner)
          && (!CF.share || (CF.share === 'shared' ? (c.viewers || []).length : CF.share === 'private' ? !(c.viewers || []).length : CF.share === 'me' ? (c.viewers || []).includes(EMAIL) : !!c.pub))
          && (!CF.upd || (CF.upd === 'old' ? !(c.updatedAt > dayN(30)) : c.updatedAt > dayN(Number(CF.upd)))))
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      const cnt = B().querySelector('#ad-cq-n'); if (cnt) cnt.textContent = rows.length + ' of ' + CROWS.length + ' character' + (CROWS.length === 1 ? '' : 's');
      l.innerHTML = ctable(rows, true, CROWS.length ? 'No characters match these filters.' : 'No characters yet.');
      wire(l, () => paintChars());
    }
    const tabCharsList = () => paintChars();
    // keep New fresh: listen for accounts and characters even when that tab is opened first
    const ensureLive = () => { if (!ULIVE) ULIVE = usersCol.limit(1000).onSnapshot(qs => { UROWS = docs(qs); UROWS.forEach(u => { US[u.id] = u; remember(u.id, u); }); if (TAB === 'users') paintUsers(); if (TAB === 'new' && qs.docChanges().some(ch => ch.type !== 'modified')) newSoon(); }, () => {});
      if (!CLIVE) CLIVE = charsCol.limit(2000).onSnapshot(async qs => { CROWS = docs(qs); await needNames(CROWS.map(c => c.owner)); if (TAB === 'chars') paintChars(); if (TAB === 'new' && qs.docChanges().some(ch => ch.type !== 'modified')) newSoon(); }, () => {}); };
    setTimeout(ensureLive, 1500);
    frame(); wireDie(root);
    root.addEventListener('click', e => { if (e.target.closest && e.target.closest('.hl-txt')) pgGo(HUB); });
    // the count on "New" shows even while you're on another section
    if (TAB !== 'new') Promise.all([usersCol.where('createdAt', '>', CHECKED).limit(51).get(), charsCol.where('createdAt', '>', CHECKED).limit(101).get()]).then(([u, c]) => { const fresh = new Set(u.docs.map(d => d.id)); NEWN = u.size + c.docs.filter(d => !fresh.has(d.data().owner)).length; const t = root.querySelector('[data-tab="new"]'); if (t && NEWN && !t.querySelector('.adm-badge')) t.insertAdjacentHTML('beforeend', `<b class="adm-badge">${NEWN}</b>`); }, () => {});
  }

}
