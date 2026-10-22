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
// Who's viewing a public link is listed under a fingerprint of each signed-in viewer's email ("u-" + the start of its
// SHA-256), never the email itself: anyone with the link can read that list. (The database rules check the same thing.)
const pgViewId = async em => { const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(em || '').toLowerCase())));
  return 'u-' + [...h].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24); };
// A place on this site to go to, or '' if it isn't one (a ?next= or a saved "come back here" can't send anyone elsewhere).
function pgSafePath(v) { try { const u = new URL(String(v || ''), location.origin); return u.origin === location.origin && /^https?:$/.test(u.protocol) ? u.pathname + u.search + u.hash : ''; } catch (e) { return ''; } }
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
// ----- The invite panel as a picture (1200×630), for the preview card when an invite link is pasted in Discord,
// iMessage and the like. Drawn here when the DM makes or updates a link and kept (public) in invcard/<code>, where the
// small Cloudflare worker that answers invite links reads it. -----
async function pgInviteImage(p) {
  const W = 1200, H = 630, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const n = (p.chars || []).length || Number(p.n) || 0, dm = p.dmName || p.dm || '';
  const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  // night sky
  let bg = g.createRadialGradient(W / 2, H * .3, 40, W / 2, H * .45, W * .75); bg.addColorStop(0, '#26324b'); bg.addColorStop(.55, '#141b2b'); bg.addColorStop(1, '#0a0e17'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  [[.08, .2], [.9, .16], [.94, .72], [.05, .8], [.2, .92], [.78, .9], [.15, .45], [.86, .42]].forEach(([x, y], i) => { g.fillStyle = i % 2 ? 'rgba(255,255,255,.35)' : 'rgba(231,196,110,.5)'; g.beginPath(); g.arc(x * W, y * H, i % 3 ? 1.4 : 2, 0, 7); g.fill(); });
  // the card
  const cx = 150, cy = 22, cw = 900, ch = 586; g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 50; g.shadowOffsetY = 18; rr(cx, cy, cw, ch, 30);
  const cg = g.createLinearGradient(0, cy, 0, cy + ch); cg.addColorStop(0, '#1e2739'); cg.addColorStop(1, '#161d2c'); g.fillStyle = cg; g.fill(); g.restore();
  g.save(); rr(cx, cy, cw, ch, 30); g.clip(); const gl = g.createRadialGradient(W / 2, cy + 40, 10, W / 2, cy + 40, 300); gl.addColorStop(0, 'rgba(231,176,72,.38)'); gl.addColorStop(1, 'rgba(231,176,72,0)'); g.fillStyle = gl; g.fillRect(cx, cy, cw, 340); g.restore();
  rr(cx, cy, cw, ch, 30); g.lineWidth = 2.5; g.strokeStyle = '#c9962b'; g.stroke();
  // the party's seal
  const sx = W / 2, sy = cy + 104, sr = 74; g.save(); g.shadowColor = 'rgba(231,176,72,.55)'; g.shadowBlur = 30; g.beginPath(); g.arc(sx, sy, sr + 6, 0, 7); g.fillStyle = '#c9962b'; g.fill(); g.restore();
  g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fillStyle = '#121826'; g.fill();
  let drew = false; if (p.pic) { try { const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = p.pic; }); g.save(); g.beginPath(); g.arc(sx, sy, sr - 2, 0, 7); g.clip(); const k = Math.max((2 * sr) / im.width, (2 * sr) / im.height); g.drawImage(im, sx - im.width * k / 2, sy - im.height * k / 2, im.width * k, im.height * k); g.restore(); drew = true; } catch (e) {} }
  if (!drew) { g.save(); g.translate(sx - 36, sy - 36); g.scale(3, 3); g.strokeStyle = '#e7c46e'; g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath(); g.arc(9, 8, 3.2, 0, 7); g.stroke(); g.beginPath(); g.arc(16.5, 9, 2.6, 0, 7); g.stroke(); g.beginPath(); g.moveTo(3.5, 19); g.quadraticCurveTo(5, 14, 9, 14); g.quadraticCurveTo(13, 14, 14.5, 19); g.stroke(); g.beginPath(); g.moveTo(14.5, 14.6); g.quadraticCurveTo(19.5, 13, 21, 18.5); g.stroke(); g.restore(); }
  // words
  const fit = (t, font, max) => { g.font = font; let s = t; while (g.measureText(s).width > max && s.length > 3) s = s.slice(0, -2); return s === t ? t : s.trim() + '…'; };
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#e7c46e'; g.font = '800 22px system-ui, -apple-system, "Segoe UI", sans-serif'; const kick = 'YOU’RE INVITED TO JOIN'; let x0 = sx - (g.measureText(kick).width + (kick.length - 1) * 5) / 2; g.textAlign = 'left'; for (const ch2 of kick) { g.fillText(ch2, x0, cy + 236); x0 += g.measureText(ch2).width + 5; } g.textAlign = 'center';
  g.fillStyle = '#fff7e6'; g.fillText(fit(p.name || 'a party', '700 64px Georgia, "Times New Roman", serif', cw - 100), sx, cy + 306);
  const meta = [dm ? 'Dungeon Master ' + dm : '', n ? n + ' adventurer' + (n === 1 ? '' : 's') + ' so far' : ''].filter(Boolean).join('   •   ');
  g.fillStyle = '#c6bfae'; g.fillText(fit(meta, '500 26px system-ui, -apple-system, "Segoe UI", sans-serif', cw - 120), sx, cy + 350);
  // divider
  const dy = cy + 384; const ln = (a, b) => { const lg = g.createLinearGradient(a, 0, b, 0); lg.addColorStop(a < sx ? 0 : 1, 'rgba(201,150,43,0)'); lg.addColorStop(a < sx ? 1 : 0, 'rgba(201,150,43,.7)'); g.strokeStyle = lg; g.lineWidth = 1.5; g.beginPath(); g.moveTo(a, dy); g.lineTo(b, dy); g.stroke(); };
  ln(sx - 220, sx - 24); ln(sx + 24, sx + 220); g.fillStyle = '#c9962b'; g.beginPath(); g.moveTo(sx, dy - 7); g.lineTo(sx + 7, dy); g.lineTo(sx, dy + 7); g.lineTo(sx - 7, dy); g.closePath(); g.fill();
  // what being in a party means
  const perks = ['See each other’s HP, AC and conditions, live', 'Hand over items and cast spells on each other', 'Share homebrew items with the whole party', 'Your DM can open every character sheet in the party'];
  g.textAlign = 'left'; g.font = '500 25px system-ui, -apple-system, "Segoe UI", sans-serif'; const px = sx - (Math.max(...perks.map(t => g.measureText(t).width)) + 26) / 2;
  perks.forEach((t, i) => { const y = cy + 430 + i * 40; g.beginPath(); g.arc(px, y - 8, 13, 0, 7); g.fillStyle = 'rgba(201,150,43,.22)'; g.fill(); g.strokeStyle = '#e7c46e'; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(px - 6, y - 8); g.lineTo(px - 1.5, y - 3.5); g.lineTo(px + 6.5, y - 13); g.stroke(); g.fillStyle = '#ddd6c6'; g.fillText(t, px + 26, y); });
  let url = c.toDataURL('image/jpeg', .86); if (url.length > 700000) url = c.toDataURL('image/jpeg', .7);
  return url;
}
window.pgInviteImage = pgInviteImage;
// Scroll shadows on pick lists: a soft edge at the top / bottom while there's more to scroll to.
// What someone did that brought them online, in plain words ("by opening Hiro's sheet").
function pgOnlineWhy(back) { const p = location.pathname, q = location.search, t = String(document.title || '').replace(/\s*[—-]\s*Adventurer.s Tome\s*$/i, '').trim(), verb = back ? 'by coming back to ' : 'by opening ';
  if (/^\/(c|character)\/|[?&]c=/.test(p + q)) return verb + (t && !/adventurer/i.test(t) ? t + '’s sheet' : 'a character sheet');
  if (/^\/party\/|[?&]party=/.test(p + q)) return verb + (t && t !== 'Party' ? 'the ' + t + ' party page' : 'a party page');
  if (/^\/join\//.test(p)) return 'by opening a party invite link';
  if (/admin/.test(p + q)) return verb + 'the admin page';
  if (/^\/view\/|[?&]pv=/.test(p + q)) return verb + 'a shared view-only sheet';
  return verb + 'the lobby'; }
// Skeleton loaders: grey shapes where things are about to appear (instead of the word "Loading…"). Any empty
// <div class="sk-auto" data-k="rows|cards" data-n="5"> on the page is filled in by itself.
const SKEL = {
  rows: n => `<div class="sk-wrap" aria-busy="true" aria-label="Loading">${Array.from({ length: n }, (_, i) => `<div class="sk-row"><span class="sk sk-c"></span><span class="sk-lines"><span class="sk sk-l1" style="width:${[52, 38, 60, 44, 56, 41][i % 6]}%"></span><span class="sk sk-l2" style="width:${[30, 24, 36, 28, 33, 22][i % 6]}%"></span></span><span class="sk sk-tag"></span></div>`).join('')}</div>`,
  cards: n => `<div class="sk-cards" aria-busy="true" aria-label="Loading">${Array.from({ length: n }, () => `<div class="sk-card"><div class="sk-row"><span class="sk sk-sq"></span><span class="sk-lines"><span class="sk sk-l1" style="width:55%"></span><span class="sk sk-l2" style="width:35%"></span></span></div><div class="sk-hp"><span class="sk sk-ring"></span><span class="sk-lines"><span class="sk sk-bar"></span><span class="sk sk-bar"></span><span class="sk sk-bar short"></span></span></div><div class="sk-btns"><span class="sk sk-btn"></span><span class="sk sk-btn"></span><span class="sk sk-btn"></span></div></div>`).join('')}</div>` };
window.PG_SKEL = SKEL;
function pgSkelFill() { document.querySelectorAll('.sk-auto:empty').forEach(el => { el.innerHTML = (SKEL[el.dataset.k] || SKEL.rows)(Number(el.dataset.n) || 5); }); }
function pgScrollFx() { document.querySelectorAll('.pty-pick').forEach(el => { const t = el.scrollTop > 2, b = el.scrollTop + el.clientHeight < el.scrollHeight - 2; el.classList.toggle('sc-top', t); el.classList.toggle('sc-bot', b); }); }
document.addEventListener('scroll', e => { if (e.target && e.target.classList && e.target.classList.contains('pty-pick')) pgScrollFx(); }, true);
new MutationObserver(() => { pgSkelFill(); cancelAnimationFrame(pgScrollFx.r); pgScrollFx.r = requestAnimationFrame(pgScrollFx); }).observe(document.documentElement, { childList: true, subtree: true });
function wireThemeBtn(root) { const b = root.querySelector('#hub-theme'); if (!b) return;
  // The sun's thin rays look lopsided when the button lands between two screen pixels (it does in some header rows,
  // like an admin's): nudge it onto whole pixels.
  const snap = () => { if (!b.isConnected) return; b.style.translate = ''; const dpr = window.devicePixelRatio || 1, r = b.getBoundingClientRect(), fx = (r.left * dpr) % 1, fy = (r.top * dpr) % 1;
    if (fx || fy) b.style.translate = `${-(fx > .5 ? fx - 1 : fx) / dpr}px ${-(fy > .5 ? fy - 1 : fy) / dpr}px`; };
  requestAnimationFrame(snap); setTimeout(snap, 400); addEventListener('resize', snap);
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
// While the mouse is over a pop-up window, scrolling only moves what's inside it: once a list reaches its end the
// page behind doesn't take over and scroll instead.
const PG_WINS = '.hub-modal.on, #pg-msg, .pg-out, .modal-bg.open';
const pgCanScroll = (el, d, x) => { const cs = getComputedStyle(el), ov = x ? cs.overflowX : cs.overflowY; if (!/auto|scroll|overlay/.test(ov)) return false;
  const pos = x ? el.scrollLeft : el.scrollTop, max = x ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
  return max > 1 && (d < 0 ? pos > 0 : pos < max - 1); };
addEventListener('wheel', e => { const w = e.target.closest && e.target.closest(PG_WINS); if (!w || e.ctrlKey) return;
  const x = Math.abs(e.deltaX) > Math.abs(e.deltaY), d = x ? e.deltaX : e.deltaY; if (!d) return;
  for (let el = e.target; el && el !== document.body; el = el.parentElement) { if (pgCanScroll(el, d, x)) return; if (el === w) break; }
  e.preventDefault(); }, { passive: false, capture: true });
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
// No coloured browser bar anywhere: the page itself shows at the very top (behind the clock on phones) and scrolls under it.
document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.remove()); window.pgTheme = () => {};
// Safari still draws its own bar behind the clock, filled with the page's background colour: on a sheet that's the
// header's colour, so at the top of the page the bar and the header are one.
{ const de = document.documentElement; let last = ''; const tint = () => { const bn = document.querySelector('header.banner'), v = bn ? getComputedStyle(de).getPropertyValue('--navy').trim() : '';
    const c = document.getElementById('pg-load') && !window.PG_TINT_NOW ? '' : v; if (c !== last) { last = c; de.style.backgroundColor = c; } };
  setInterval(tint, 800); addEventListener('load', tint); window.pgTheme = () => { window.PG_TINT_NOW = true; tint(); }; }
// Phones in the browser: a thin divider with a soft shadow along the bottom of Safari's bar, once the page scrolls under it.
{ let ln = null; const edge = () => { const de = document.documentElement, on = de.classList.contains('mobile') && !de.classList.contains('pg-standalone') && !!document.querySelector('header.banner');
    if (on && !ln) { ln = document.createElement('div'); ln.className = 'pg-topedge'; ln.setAttribute('aria-hidden', 'true'); document.body.appendChild(ln); }
    if (ln) ln.classList.toggle('on', on && scrollY > 6); };
  addEventListener('scroll', edge, { passive: true }); setInterval(edge, 1000); }
let PG_RA = null; // the last "refresh their page" request seen; a new one while this page is open reloads it
// The site owner, by their sign-in account id (not their email, so no personal info is in the code).
const OWNER_UID = 'Ns3qDtOrAcNcJkZKHemhBedz9oA2';
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
const RESERVED = new Set(['party', 'join', 'parties', 'shared', 'login', 'new', 'create', 'character', 'admin', 'c', 'a', 'icons', 'icon', 'index', 'index-html', 'version-json', 'users', 'help', 'settings']);
const slugify = s => String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const enc = encodeURIComponent;
// A party's address carries its name: /party/shattered-skies (its id still works too).
const partySlug = n => { const x = slugify(n); return x && x !== 'new' ? x : x ? x + '-party' : ''; };
// What a party card shows, read live from a character's saved sheet. HP, temp HP, conditions and exhaustion come from
// the saved character itself (always current, even from an older copy of the site); the rest (max HP, AC, speed…)
// from the summary the sheet saves with it.
// A character that has never saved its summary (it hasn't been opened since parties came in): work it out from the saved
// character by running the sheet itself in a hidden, sandboxed frame (no storage, nothing saved), once per save.
let PCE = null; const PCE_MEMO = {};
function pcardCompute(str) {
  return new Promise(res => {
    if (!window.PG_ASSETS || !window.PG_ASSETS.blank) return res(null);
    (PCE = PCE || fetch(window.PG_ASSETS.blank).then(r => r.ok ? r.text() : '')).then(tpl => {
      const open = '<script id="sheet-data" type="application/json">', a = tpl.indexOf(open), b = tpl.indexOf('</' + 'script>', a); if (a < 0 || b < 0) return res(null);
      const tok = Math.random().toString(36).slice(2);
      const shim = '<script>(function(){var m={},ls={getItem:function(k){return Object.prototype.hasOwnProperty.call(m,k)?m[k]:null},setItem:function(k,v){m[k]=String(v)},removeItem:function(k){delete m[k]},key:function(i){return Object.keys(m)[i]||null},clear:function(){m={}},get length(){return Object.keys(m).length}};'
        + 'try{Object.defineProperty(window,"localStorage",{value:ls,configurable:true});Object.defineProperty(window,"sessionStorage",{value:ls,configurable:true});}catch(e){}'
        + 'var n=0,t=setInterval(function(){n++;var c=null;try{c=window.partyCard&&window.partyCard();}catch(e){}if(c||n>100){clearInterval(t);if(c)delete c.hb;parent.postMessage({pce:"' + tok + '",c:c},"*");}},150);})();</' + 'script>';
      let out = tpl.slice(0, a + open.length) + str.replace(/</g, '\\u003c') + tpl.slice(b); const h = out.indexOf('<head>'); out = h >= 0 ? out.slice(0, h + 6) + shim + out.slice(h + 6) : shim + out;
      const f = document.createElement('iframe'); f.setAttribute('sandbox', 'allow-scripts'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1;
      Object.assign(f.style, { position: 'fixed', left: '-10000px', top: '0', width: '1200px', height: '800px', border: '0', visibility: 'hidden' });
      let done = false; const fin = c => { if (done) return; done = true; removeEventListener('message', on); f.remove(); res(c || null); };
      const on = e => { if (e.data && e.data.pce === tok) fin(e.data.c); }; addEventListener('message', on); setTimeout(() => fin(null), 20000);
      f.srcdoc = out; document.body.appendChild(f);
    }, () => res(null));
  });
}
const LIVE_LS = id => 'pg-live:' + id;
async function sheetLive(fs, id, d) {
  try { const c = JSON.parse(localStorage.getItem(LIVE_LS(id)) || 'null'); if (c && c.s === Number(d.savedAt) && c.pc) return c.pc; } catch (e) {}
  const pc0 = await sheetLive0(fs, id, d);
  if (pc0) { try { const x = Object.assign({}, pc0); delete x.hb; localStorage.setItem(LIVE_LS(id), JSON.stringify({ s: Number(d.savedAt), pc: x })); } catch (e) {} }
  return pc0;
}
async function sheetLive0(fs, id, d) {
  let pc = {}; try { pc = d.pcard ? JSON.parse(d.pcard) : {}; } catch (e) {}
  let txt = d.data || ''; const n = Number(d.n) || 1;
  for (let k = 1; k < n && txt != null; k++) { try { const p = await fs.collection('sheets').doc(id + '_p' + k).get(); const pd = p.exists ? p.data() : null; txt = pd && Number(pd.savedAt) === Number(d.savedAt) ? txt + (pd.data || '') : null; } catch (e) { txt = null; } }
  if (txt && !Number(pc.maxhp)) { const k = id + ':' + d.savedAt; PCE_MEMO[k] = PCE_MEMO[k] || pcardCompute(txt); const c = await PCE_MEMO[k]; if (c) pc = Object.assign(c, pc); }
  if (txt) { try { const st = JSON.parse(txt); if (st && st.hp) Object.assign(pc, { name: st.name || pc.name || '', hp: Number(st.hp.cur) || 0, temp: Number(st.hp.temp) || 0, conds: (st.conditions || []).filter(c => c !== 'Concentrating' && c !== 'Dodging'), exh: Number(st.exhaustion) || 0, conc: st.concentration || '' }); } catch (e) {} }
  return Object.keys(pc).length ? Object.assign(pc, { at: Number(d.savedAt) || 0 }) : null;
}
// A character's address: /character/zeebo (older /player/character addresses stay as they were).
const pathURL = pth => pth.includes('/') ? '/' + pth : '/character/' + pth;
const URLS = {
  hub: G => PRETTY ? '/' : LEG + '?g=' + G,
  shared: G => PRETTY ? '/shared' : LEG + '?g=' + G + '&view=shared',
  parties: G => PRETTY ? '/parties' : LEG + '?g=' + G + '&view=parties',
  admin: (G, tab) => PRETTY ? '/admin' + (tab ? '/' + tab : '') : LEG + '?g=' + G + '&admin=1' + (tab ? '&tab=' + tab : ''),
  char: c => PRETTY ? (c.path ? pathURL(c.path) : '/c/' + c.id) : LEG + '?c=' + c.id,
  byId: id => PRETTY ? '/c/' + id : LEG + '?c=' + id,
  party: (id, name) => PRETTY ? '/party/' + (id === 'new' ? 'new' : partySlug(name) || id) : LEG + '?party=' + id,
  // invite links go through the invite worker when there is one (it gives the link its party's own preview card)
  join: t => (FBCFG.inviteBase ? String(FBCFG.inviteBase).replace(/\/+$/, '') + '/' + t : PRETTY ? location.origin + '/join/' + t : location.origin + LEG + '?join=' + t),
  newChar: (G, o, p) => { try { if (o) sessionStorage.setItem('pg-newfor', JSON.stringify({ o, p: p || '' })); else sessionStorage.removeItem('pg-newfor'); } catch (e) {} return PRETTY ? '/create' : LEG + '?new=1&g=' + G; },
};
// Search keys for an account or character: every prefix of each word (and of the whole name / email), so the admin
// pages can find "sam", "o'hara" or "sohara1990@…" with one indexed lookup however many accounts there are.
function searchKeys(...parts) { const out = new Set(); parts.forEach(p => { p = String(p || '').toLowerCase().trim(); if (!p) return;
  new Set([p, ...p.split(/[\s@._'’-]+/)]).forEach(t => { t = t.slice(0, 24); for (let i = 1; i <= t.length; i++) out.add(t.slice(0, i)); }); }); return [...out].slice(0, 400); }
// A person's little picture: their chosen character portrait (or their first character's), else initials on a colour
// picked from their email so the same person always looks the same.
const escH = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const hueOf = t => [...String(t || '?')].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 360, 7);
// first and last initials: "Ada Lovelace" → AL, "Shade of Twilight of the Dark Forest" → SF
// A character's picture frame takes the colour the sheet itself uses (its accent).
const accStyle = c => /^#[0-9a-f]{6}$/i.test((c && c.acc) || '') ? ` style="border-color:${c.acc}"` : '';
const initials = (name, em) => { const w = String(name || em || '?').split(/[\s@._-]+/).filter(x => /[\p{L}\p{N}]/u.test(x)); return w.length ? (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase() : '?'; };
// A person's picture: their initials on a colour (theirs, or one picked from their email), a character portrait, or an
// uploaded image — which, if it has a transparent background, is shown as-is with no circle or border.
// Where people can reach us. A plain mailto link does nothing on a computer with no email app set up, so this opens a
// small box with the address, a copy button, and links to Gmail and the device's email app.
const CONTACT_EMAIL = 'adventurerstome@googlegroups.com', CONTACT = '#contact';
const BUG_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 7.5V6a3 3 0 0 1 6 0v1.5"/><rect x="7" y="7.5" width="10" height="12.5" rx="5"/><path d="M12 11v9M3.5 13H7M17 13h3.5M4.5 8l2.6 1.8M19.5 8l-2.6 1.8M4.5 19.5l2.8-2M19.5 19.5l-2.8-2"/></svg>';
// Crop an uploaded picture before it's used, like Discord's: the image sits behind a circle (or rounded square) window,
// drag to move it, zoom with the slider, the mouse wheel or two fingers, then Apply. Resolves { url, clear } — clear
// when the result has see-through parts (kept as PNG) — or null if cancelled. o: { shape: 'circle'|'square', size, title }.
// o.keep: remember the original (on this device) under that key, so the picture can be re-cropped later (pgRecrop).
const pgIDB = () => new Promise((res, rej) => { const r = indexedDB.open('pg-crop', 1); r.onupgradeneeded = () => r.result.createObjectStore('o'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const pgKeepGet = k => pgIDB().then(db => new Promise(res => { const q = db.transaction('o').objectStore('o').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); })).catch(() => null);
const pgKeepPut = (k, v) => pgIDB().then(db => { db.transaction('o', 'readwrite').objectStore('o').put(v, k); }).catch(() => {});
// Re-crop a picture that's already in use: from the original it was cut from (when this device has it), starting
// where it was last cropped; otherwise from the picture itself.
function pgRecrop(keep, cur, o = {}) { return pgKeepGet(keep).then(rec => rec && rec.blob ? pgCrop(rec.blob, Object.assign({}, o, { keep, state: rec })) : pgCrop(cur, Object.assign({}, o, { keep }))); }
window.pgRecrop = pgRecrop;
// A picture that's already set: adjust how it's cropped, or pick a new one.
function picChoice(cur, adjust, replace) {
  const m = document.createElement('div'); m.className = 'pg-out pg-picch'; pgOutFade(m);
  m.innerHTML = `<div class="pg-out-card" role="dialog" aria-modal="true"><h2>Picture</h2><div class="pgpc-prev"><img src="${escH(cur)}" alt=""></div>
    <div class="pgpc-btns"><button class="pg-out-yes" data-k="a">Adjust crop &amp; zoom</button><button class="pg-out-no" data-k="r">Upload a new picture</button></div><div class="pg-out-row"><span class="grow"></span><button class="pg-out-no" data-k="x">Cancel</button></div></div>`;
  const end = () => m.remove();
  m.onclick = e => { const b = e.target.closest('button'); if (e.target === m || (b && b.dataset.k === 'x')) { end(); return; } if (!b) return; end(); if (b.dataset.k === 'a') adjust(); else replace(); };
  document.body.appendChild(m);
}
window.picChoice = picChoice;
function pgCrop(file, o = {}) {
  return new Promise((done, fail) => {
    const isStr = typeof file === 'string', src = isStr ? file : URL.createObjectURL(file), im = new Image(), rv = () => { if (!isStr) URL.revokeObjectURL(src); };
    im.onerror = () => { rv(); fail(new Error('That file isn’t an image this browser can open.')); };
    im.onload = () => {
      const W = im.naturalWidth || im.width, H = im.naturalHeight || im.height; if (!W || !H) { rv(); return fail(new Error('That image looks empty.')); }
      const S = Math.min(340, innerWidth - 72), Cb = Math.round(S * .86), base = Math.max(Cb / W, Cb / H), round = o.shape === 'circle';
      let z = 1, x = 0, y = 0; if (o.state) { z = Math.max(1, Math.min(4, Number(o.state.z) || 1)); x = (Number(o.state.nx) || 0) * Cb; y = (Number(o.state.ny) || 0) * Cb; }
      const m = document.createElement('div'); m.className = 'pg-out pg-cropw'; pgOutFade(m);
      m.innerHTML = `<div class="pg-out-card pg-crop" role="dialog" aria-modal="true" aria-labelledby="pg-crop-h"><h2 id="pg-crop-h">${escH(o.title || 'Edit image')}</h2>
        <div class="pgc-stage" style="width:${S}px;height:${S}px"><img class="pgc-img" src="${src}" alt="" draggable="false"><div class="pgc-win${round ? ' round' : ''}" style="width:${Cb}px;height:${Cb}px"></div></div>
        <div class="pgc-zoom"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>
          <input type="range" min="1" max="4" step="0.01" value="1" aria-label="Zoom"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>
        <div class="pg-out-row"><button class="pgc-reset">Reset</button><span class="grow"></span><button class="pg-out-no">Cancel</button><button class="pg-out-yes">Apply</button></div></div>`;
      const img = m.querySelector('.pgc-img'), stage = m.querySelector('.pgc-stage'), zr = m.querySelector('input[type=range]');
      const clamp = () => { const dw = W * base * z, dh = H * base * z, mx = Math.max(0, (dw - Cb) / 2), my = Math.max(0, (dh - Cb) / 2); x = Math.max(-mx, Math.min(mx, x)); y = Math.max(-my, Math.min(my, y)); };
      const show = () => { clamp(); const dw = W * base * z, dh = H * base * z; img.style.width = dw + 'px'; img.style.height = dh + 'px'; img.style.transform = `translate(${S / 2 - dw / 2 + x}px, ${S / 2 - dh / 2 + y}px)`; zr.value = z; };
      const zoomTo = nz => { nz = Math.max(1, Math.min(4, nz)); x *= nz / z; y *= nz / z; z = nz; show(); };
      zr.oninput = () => zoomTo(Number(zr.value));
      stage.addEventListener('wheel', e => { e.preventDefault(); zoomTo(z * Math.exp(-e.deltaY * .0015)); }, { passive: false });
      const pts = new Map(); let last = null, pinch = 0;
      stage.addEventListener('pointerdown', e => { stage.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); last = [e.clientX, e.clientY]; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
      stage.addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]);
        if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) zoomTo(z * d / pinch); pinch = d; return; }
        x += e.clientX - last[0]; y += e.clientY - last[1]; last = [e.clientX, e.clientY]; show(); });
      const up = e => { pts.delete(e.pointerId); pinch = 0; const r = [...pts.values()][0]; last = r || null; };
      stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
      const key = e => { if (e.key === 'Escape') finish(null); else if (e.key === 'Enter') apply(); };
      const finish = r => { document.removeEventListener('keydown', key); m.remove(); rv(); done(r); };
      const apply = () => { const N = o.size || 512, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
        const k = base * z, sx = W / 2 - (Cb / 2 + x) / k, sy = H / 2 - (Cb / 2 + y) / k, sw = Cb / k; g.drawImage(im, sx, sy, sw, sw, 0, 0, N, N);
        let clear = false; try { const px = g.getImageData(0, 0, N, N).data; for (let i = 3; i < px.length; i += 16) if (px[i] < 235) { clear = true; break; } } catch (e) {}
        let url = clear ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', .86);
        if (url.length > 300000 && N > 192) { const d = document.createElement('canvas'); d.width = d.height = 192; d.getContext('2d').drawImage(c, 0, 0, 192, 192); url = clear ? d.toDataURL('image/png') : d.toDataURL('image/jpeg', .86); }
        if (o.keep) { const st = { z, nx: x / Cb, ny: y / Cb }; (isStr ? fetch(src).then(r => r.blob()) : Promise.resolve(file)).then(blob => pgKeepPut(o.keep, Object.assign({ blob }, st)), () => {}); }
        finish({ url, clear }); };
      m.querySelector('.pgc-reset').onclick = () => { z = 1; x = y = 0; show(); };
      m.querySelector('.pg-out-no').onclick = () => finish(null); m.querySelector('.pg-out-yes').onclick = apply;
      m.onclick = e => { if (e.target === m) finish(null); };
      document.addEventListener('keydown', key); document.body.appendChild(m); show(); setTimeout(() => m.querySelector('.pg-out-yes').focus(), 50);
    };
    im.src = src;
  });
}
window.pgCrop = pgCrop;
// A note in the bottom-right corner, on any page (a bug report sent, or one of yours fixed). Tap it to dismiss.
function pgCorner(html, ms = 7000) { let box = document.getElementById('pg-corner'); if (!box) { box = document.createElement('div'); box.id = 'pg-corner'; document.body.appendChild(box); }
  const t = document.createElement('div'); t.className = 'pg-ctoast'; t.innerHTML = html; t.onclick = () => t.remove(); box.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 250); }, ms); }
function pgContact() {
  if (document.querySelector('.pg-out')) return;
  const su = encodeURIComponent('Adventurer’s Tome'), m = document.createElement('div'); m.className = 'pg-out'; pgOutFade(m);
  m.innerHTML = `<div class="pg-out-card" role="dialog" aria-modal="true" aria-labelledby="pg-ct-h"><h2 id="pg-ct-h">Contact us</h2><p>Questions, ideas or something not working? Email us at</p>
    <div class="pg-ct-mail"><span>${CONTACT_EMAIL}</span><button class="pg-ct-copy">Copy</button></div>
    ${window.pgBugReport ? `<button class="pg-ct-bug">${BUG_SVG}<span>Report a bug</span></button>` : ''}
    <div class="pg-out-row pg-ct-row"><a class="pg-ct-btn" target="_blank" rel="noopener" href="https://mail.google.com/mail/u/0/?view=cm&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${su}">Open in Gmail</a><a class="pg-ct-btn" href="mailto:${CONTACT_EMAIL}?subject=${su}">Email app</a><button class="pg-out-no">Close</button></div></div>`;
  const close = () => { m.remove(); document.removeEventListener('keydown', key); }, key = e => { if (e.key === 'Escape') close(); };
  m.onclick = e => { if (e.target === m) close(); }; m.querySelector('.pg-out-no').onclick = close;
  { const bb = m.querySelector('.pg-ct-bug'); if (bb) bb.onclick = () => { close(); setTimeout(() => window.pgBugReport && window.pgBugReport(), 200); }; }
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
// Someone looking through a view-only link (not signed in)
const anonAvaHTML = me => `<span class="pg-ava anon${me ? ' me' : ''}" title="${me ? 'You (anonymous viewer)' : 'Anonymous viewer'}"><svg viewBox="0 0 24 24" width="62%" height="62%" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8.2" r="4.2"/><path d="M3.8 20.5c.9-4.2 4.2-6.6 8.2-6.6s7.3 2.4 8.2 6.6z"/></svg></span>`;
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
  let NEWQ = !!Q.get('new'), ADMINQ = !!Q.get('admin'), TABQ = clean(Q.get('tab')), VIEWQ = ['shared', 'parties'].includes(Q.get('view')) ? Q.get('view') : 'mine', LOGIN = false, SLUG = '', BAD = false, VIEWTOK = String(Q.get('pv') || '').replace(/[^\w-]/g, '').slice(0, 40);
  // A party's page (/party/<id>) and an invite link (/join/<code>).
  let PARTYQ = clean(Q.get('party')), JOINQ = clean(Q.get('join'));
  if (PRETTY) {
    const parts = location.pathname.split('/').filter(Boolean).map(x => { try { return decodeURIComponent(x); } catch (e) { return x; } });
    if (parts.length === 1 && parts[0] === 'index.html') parts.length = 0;
    if (!parts.length) {}
    else if (parts.length === 1 && (parts[0] === 'shared' || parts[0] === 'parties')) VIEWQ = parts[0];
    else if (parts.length === 1 && parts[0] === 'login') LOGIN = true;
    else if (parts.length === 1 && (parts[0] === 'create' || parts[0] === 'new')) NEWQ = true;
    else if (parts[0] === 'admin' && parts.length <= 2) { ADMINQ = true; TABQ = clean(parts[1] || ''); }
    else if (parts[0] === 'c' && parts.length === 2) C = clean(parts[1]);
    else if (parts[0] === 'party' && parts.length === 2) PARTYQ = clean(parts[1]);
    else if (parts[0] === 'join' && parts.length === 2) JOINQ = clean(parts[1]);
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
    Promise.race([Promise.all(anims.map(a => a.finished.catch(() => {}))), new Promise(r => setTimeout(r, 700))]).then(() => { if (window.pgTheme) window.pgTheme(); return new Promise(r => setTimeout(r, 120)); }).then(() => {
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
  let fs = null, auth = null;
  // On the new address, Google sign-in runs through the site itself, so Google's account picker says
  // "continue to adventurers-tome.web.app" (and Safari doesn't block it as a third-party sign-in).
  if (location.hostname === 'adventurers-tome.web.app') CFG.authDomain = location.hostname;
  // App Check (optional): once a reCAPTCHA v3 site key is in pages_config.json ("appCheckKey"), every request carries
  // proof it came from this site, so Firebase can turn away scripts and bots that call the database directly.
  const { appCheckKey, ...FBCFG } = CFG;
  if (appCheckKey) await new Promise(res => { const sc = document.createElement('script'); sc.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check-compat.js'; sc.onload = sc.onerror = res; document.head.appendChild(sc); });
  try { firebase.initializeApp(FBCFG); if (appCheckKey && firebase.appCheck) firebase.appCheck().activate(new firebase.appCheck.ReCaptchaV3Provider(appCheckKey), true);
    fs = firebase.firestore(); auth = firebase.auth(); } catch (e) { console.error(e); }
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
      pgGo(pgSafePath(lsGet('dnd-signin-back')) || location.pathname, true); }
    catch (e) { say(`That sign-in link didn't work (${escH((e && e.message) || 'expired or already used')}).<br><br><a href="${location.pathname}">Try again</a>`); }
    return;
  }
  // A view-only link: the sheet's public copy, for anyone, signed in or not. Nothing typed here is saved.
  if (VIEWTOK) { const t = VIEWTOK, pc = fs.collection('pub'); let txt = null;
    let pubC = ''; try { const d = await pc.doc(t).get(); if (d.exists) { const x = d.data(); pubC = String(x.c || ''); let str = x.data || ''; const n = Number(x.n) || 1;
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
    const tag = document.createElement('div'); tag.className = 'pg-shared view pg-pubtag'; tag.innerHTML = 'View only<span class="pt-sub"> (changes are not saved)</span>'; document.body.appendChild(tag);
    // Who's viewing: everyone on this link counts as an anonymous viewer, and signed-in people looking at the character show
    // with their picture. (Only works while the link is on — the list closes with it.)
    const pbox = document.createElement('div'); pbox.className = 'pg-pres pg-pubpres'; pbox.id = 'pg-pubpres'; pbox.hidden = true; document.body.appendChild(pbox);
    if (pubC) { const live = fs.collection('pubviews').doc(pubC).collection('live'); let vid = ''; try { vid = sessionStorage.getItem('pg-anon') || ''; } catch (e) {}
      if (!/^anon-[a-z0-9]{6,16}$/.test(vid)) { vid = 'anon-' + Math.random().toString(36).slice(2, 12).replace(/[^a-z0-9]/g, 'x').padEnd(8, 'x'); try { sessionStorage.setItem('pg-anon', vid); } catch (e) {} }
      let seen = {}; const beat = () => { seen[vid] = { anon: true, at: Date.now() }; live.doc(vid).set({ anon: true, at: Date.now() }).catch(() => {}); };
      const show = () => { const now = Date.now(), here = Object.entries(seen).filter(([, d]) => now - (d.at || 0) < 200000);
        const named = here.filter(([, d]) => !d.anon), anons = here.filter(([, d]) => d.anon).sort(([a], [b]) => (a === vid ? -1 : b === vid ? 1 : 0));
        pbox.hidden = !here.length;
        pbox.innerHTML = named.map(([em, d]) => avaHTML(d.name, em, d.pic, '', d.name || 'Viewer', { color: d.color, clear: d.clear })).join('') + anons.map(([id]) => anonAvaHTML(id === vid)).join('');
        if (window.pgPubPlace) window.pgPubPlace(); };
      beat(); show(); setInterval(beat, 60000); setInterval(show, 15000);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) beat(); });
      addEventListener('pagehide', () => { live.doc(vid).delete().catch(() => {}); });
      live.onSnapshot(qs => { const me = seen[vid]; seen = {}; qs.docs.forEach(d => { seen[d.id] = d.data(); }); if (!seen[vid] && me) seen[vid] = me; show(); }, () => {}); }
    // The full logo across the top: tap it to go to Adventurer's Tome (the lobby, or sign in).
    { const lg = document.createElement('a'); lg.className = 'pg-publogo'; lg.href = PRETTY ? '/' : location.pathname; lg.title = 'Go to Adventurer’s Tome'; lg.setAttribute('aria-label', 'Go to Adventurer’s Tome'); lg.innerHTML = logoHTML(); document.body.prepend(lg); wireDie(lg);
      lg.addEventListener('click', e => { if (e.target.closest && e.target.closest('.hl-d20')) e.preventDefault(); });
      lg.addEventListener('mouseenter', () => { if (!TOUCH) rollDie(lg); }); // on a computer, moving onto any part of the logo rolls the die // the die rolls; the words go to Adventurer's Tome
      // Phones: it sits at the top of the sheet's header with the tag right under it. Computers: it takes the Adventurer's
      // Tome button's spot (placed below), with the tag beside it.
      const home = () => { const mob = document.documentElement.classList.contains('mobile'), bn = document.querySelector('header.banner');
        if (mob) { let row = document.querySelector('.pg-pubrow'); if (!row) { row = document.createElement('div'); row.className = 'pg-pubrow'; }
          if (bn && row.parentElement !== bn) bn.prepend(row); if (lg.parentElement !== row) row.prepend(lg);
          let side = row.querySelector('.pg-pubside'); if (!side) { side = document.createElement('div'); side.className = 'pg-pubside'; row.appendChild(side); }
          if (tag.parentElement !== side) side.prepend(tag); const pb = document.getElementById('pg-pubpres'); if (pb && pb.parentElement !== side) side.appendChild(pb);
          lg.classList.remove('pinned'); lg.style.left = lg.style.top = ''; }
        else { if (lg.parentElement !== document.body) document.body.appendChild(lg); if (tag.parentElement !== document.body) document.body.appendChild(tag); const pb = document.getElementById('pg-pubpres'); if (pb && pb.parentElement !== document.body) document.body.appendChild(pb); lg.classList.add('pinned'); } };
      // Phones: the logo grows to fill the room left of the View only tag (and about as tall as the tag plus the viewers).
      const fit = () => { if (!document.documentElement.classList.contains('mobile')) return; const row = lg.parentElement, side = row && row.querySelector('.pg-pubside'), hl = lg.querySelector('.hub-logo'); if (!side || !hl) return;
        const cs = getComputedStyle(row), avail = row.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - side.offsetWidth - 16;
        lg.style.setProperty('--mls', '60px'); const w0 = hl.scrollWidth || 1, h = side.offsetHeight || 60;
        const px = Math.floor(60 * Math.min(avail / w0, Math.max(1, (h + 6) / 60), 1.5)); lg.style.setProperty('--mls', Math.max(40, px) + 'px'); };
      lg.id = 'pg-publogo'; home(); fit(); addEventListener('resize', () => { home(); fit(); }); setInterval(fit, 1500); setTimeout(fit, 300); if (document.fonts) document.fonts.ready.then(fit); setTimeout(home, 500); setTimeout(home, 2000); }
    // On a computer the tag takes the Adventurer's Tome button's spot (above the toolbar, level with the top of the header)
    // and the toolbar drops down exactly as it does for a signed-in player.
    { const de = document.documentElement, align = () => {
        const lv = document.querySelector('.ident-top .lvlbox'), tb = document.querySelector('.ident-top .toolbar');
        const lg = document.getElementById('pg-publogo');
        if (de.classList.contains('mobile') || !lv || !tb || !lg) { de.classList.remove('pg-al'); tag.classList.remove('placed'); tag.style.left = tag.style.top = ''; return; }
        // as big as fits above the toolbar without making the header any taller
        // As big as fits between the top of the page and the toolbar (which stays level with the bottom of the level box),
        // so the header is no taller than usual.
        const lr = lv.getBoundingClientRect(), tbm = Math.round(lr.height - tb.offsetHeight);
        de.style.setProperty('--pg-tbm', Math.max(26 + 8, tbm) + 'px');
        // Measured where the buttons really are (not where they should be), so the gap above the logo (to the top of the
        // page) and below it (to the buttons) come out the same on every screen.
        const btns = [...tb.querySelectorAll('button, a')].map(b => b.getBoundingClientRect()).filter(r => r.width && r.height);
        const tbTop = Math.round((btns.length ? Math.min(...btns.map(r => r.top)) : tb.getBoundingClientRect().top) + scrollY), gap = 7; // the top of the buttons themselves
        const room = Math.min(64, Math.max(26, tbTop - 2 * gap)); if (lg._room !== room) { lg._room = room; lg.style.setProperty('--plh', room + 'px'); }
        tag.classList.add('placed'); const lh = lg.offsetHeight;
        const tr = tb.getBoundingClientRect(), x = Math.round(tr.left + scrollX); let y = Math.round((tbTop - lh) / 2);
        lg.style.left = x + 'px'; lg.style.top = y + 'px';
        // then nudge it by where the die actually draws (browsers size it a little differently), so the die has the same gap above and below
        { const d = lg.querySelector('.hl-d20'); if (d && !d.classList.contains('hl-rolling') && !PG_DIE.rolling) { const r = d.getBoundingClientRect(), dt = r.top + scrollY, db = r.bottom + scrollY, adj = Math.round(((tbTop - db) - dt) / 2);
          if (adj) { y += adj; lg.style.top = y + 'px'; } } }
        const pos = x + ',' + y + ',' + lh + ',' + tbTop;
        // then who's viewing, then the View only tag
        let nx = x + lg.offsetWidth + 12; const pb = document.getElementById('pg-pubpres');
        if (pb && !pb.hidden) { pb.style.left = nx + 'px'; pb.style.top = (y + lh / 2) + 'px'; pb.classList.add('ready'); nx += pb.offsetWidth + 10; }
        tag.style.left = nx + 'px'; tag.style.top = (y + lh / 2) + 'px';
        if (pos === align.last) de.classList.add('pg-al'); else { align.last = pos; requestAnimationFrame(align); } };
      let q = 0; const soon = () => { if (!q) q = requestAnimationFrame(() => { q = 0; align(); }); }; window.pgPubPlace = soon;
      new MutationObserver(soon).observe(document.body, { childList: true, subtree: true }); addEventListener('resize', soon); setInterval(align, 1500); soon(); }
    try { const st = JSON.parse(txt); if (st && st.name) document.title = st.name + ' — Adventurer’s Tome'; } catch (e) {}
    return; }
  if (!PRETTY && !C && !G && !NEWQ && !PARTYQ && !JOINQ) { location.replace(location.pathname + '?g=' + (clean(lsGet(LAST_G)) || DEFAULT_G)); return; }
  if (!G && (NEWQ || PARTYQ || JOINQ)) G = DEFAULT_G;
  // old-style addresses arriving here (bookmarks, the github.io handover) switch to the clean ones
  if (PRETTY && !STANDALONE && ['c', 'g', 'new', 'admin', 'view', 'tab', 'party', 'join'].some(k => Q.has(k))) {
    if (NEWQ && Q.get('o')) try { sessionStorage.setItem('pg-newfor', JSON.stringify({ o: Q.get('o'), p: Q.get('p') || '' })); } catch (e) {}
    const to = C ? '/c/' + C : NEWQ ? '/create' : ADMINQ ? '/admin' + (TABQ ? '/' + TABQ : '') : PARTYQ ? '/party/' + PARTYQ : JOINQ ? '/join/' + JOINQ : VIEWQ !== 'mine' ? '/' + VIEWQ : '/';
    history.replaceState(null, '', to); }
  if (BAD) { say(`There’s nothing at this address.<br><br><a href="/">Go to your characters</a>`); return; }
  const user = await new Promise(res => { const u = auth.onAuthStateChanged(x => { u(); res(x); }); });
  if (!user) { if (PRETTY && !LOGIN) { const here = location.pathname + location.search; history.replaceState(null, '', '/login' + (here !== '/' ? '?next=' + enc(here) : '')); } signIn(auth, say); return; }
  if (LOGIN) { pgGo(pgSafePath(Q.get('next')) || '/', true); return; } // keeps the loading screen up (no fade out and back in)
  const EMAIL = (user.email || '').toLowerCase(), IS_OWNER = user.uid === OWNER_UID;
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
  let ME = null, NEWACCT = false, ACCT_OK = false, ACCT_ERR = '', WASOFF = false;
  try { const us = await UREF.get(); ME = us.exists ? us.data() : null;
    if (!ME) { NEWACCT = true; const nm = (user.displayName || EMAIL.split('@')[0]).slice(0, 60); ME = { email: EMAIL, name: nm, nameLower: nm.toLowerCase(), keys: searchKeys(nm, EMAIL.split('@')[0], EMAIL), createdAt: Date.now(), seenAt: Date.now() }; if (user.photoURL) ME.gpic = user.photoURL; await UREF.set(ME); }
    // "Last seen" doubles as "on the site right now": refreshed every couple of minutes while a page is showing.
    else { WASOFF = !ME.seenAt || Date.now() - ME.seenAt > 4 * 60000; if (!ME.seenAt || Date.now() - ME.seenAt > 60000) UREF.update({ seenAt: Date.now() }).catch(() => {}); }
    { let lastBeat = Date.now(); const beat = () => { if (document.hidden || Date.now() - lastBeat < 100000) return; const away = Date.now() - lastBeat > 4 * 60000; lastBeat = Date.now(); UREF.update({ seenAt: lastBeat }).catch(() => {}); if (away && window.pgLog) setTimeout(() => pgLog('online', { detail: pgOnlineWhy(true) }), 300); };
      setInterval(beat, 120000); document.addEventListener('visibilitychange', beat); }
    if (IS_OWNER && ME && ME.owner !== true) UREF.update({ owner: true }).catch(() => {}); // (lets the admin page show who the owner is)
    ACCT_OK = true;
    // keep their Google account photo on file (it's their picture until they choose another)
    if (ME && user.photoURL && ME.gpic !== user.photoURL) { ME.gpic = user.photoURL; UREF.update({ gpic: user.photoURL }).catch(() => {}); } } catch (e) { ACCT_ERR = (e && e.code) || ''; console.warn('account record', e); }
  let NAME = (ME && ME.name) || user.displayName || EMAIL.split('@')[0];
  // Activity log (admins can read it): who did what, when.
  window.pgLog = (act, f = {}) => { try { const e = { at: Date.now(), by: EMAIL, byName: NAME, act };
    ['target', 'tName', 'detail'].forEach(k => { if (f[k] != null && f[k] !== '') e[k] = String(f[k]).slice(0, 1500); }); return fs.collection('audit').add(e).catch(() => {}); } catch (e) { return Promise.resolve(); } };
  // A fresh sign-in (not just a remembered session) and a brand-new account are logged once.
  let SIGNEDIN = false; try { const ls0 = Date.parse(user.metadata.lastSignInTime || '') || 0, mark = 'pg-signin-logged'; if (Date.now() - ls0 < 180000 && lsGet(mark) !== String(ls0)) { lsSet(mark, String(ls0)); SIGNEDIN = true; pgLog(NEWACCT ? 'account' : 'signin'); } } catch (e) {}
  // Coming online (nothing from them for 4+ minutes): logged with what brought them back, once the page knows its title.
  if (WASOFF && !NEWACCT) setTimeout(() => pgLog('online', { detail: SIGNEDIN ? 'by signing in' : pgOnlineWhy(false) }), 2500);
  // An admin can sign someone out of every device, or block them. Checked now and whenever their account record changes.
  let AUTHAT = 0; try { AUTHAT = Date.parse((await user.getIdTokenResult()).authTime) || 0; } catch (e) {}
  const kicked = d => d && (d.banned === true ? 'This account has been blocked. If you think this is a mistake, contact adventurerstome@googlegroups.com.' : (Number(d.revokedAt) || 0) > AUTHAT ? 'You’ve been signed out.' : '');
  const kick = msg => { lsSet('pg-kicked', msg); auth.signOut().then(() => pgGo(PRETTY ? '/login' : location.href, true)); };
  // (when the database refuses even their own account record, an admin has signed them out or blocked them)
  const LOCKED = 'You’ve been signed out.';
  { const k0 = kicked(ME) || (ACCT_ERR === 'permission-denied' ? LOCKED : ''); if (k0) { kick(k0); return; } }
  UREF.onSnapshot(d => { const k = kicked(d.exists ? d.data() : null); if (k) kick(k); else { const u = d.exists ? d.data() : null, ra = Number(u && u.reloadAt) || 0; if (PG_RA === null) PG_RA = ra; else if (ra && ra !== PG_RA) { PG_RA = ra; location.reload(); return; } pgMsg(u); } }, e => { if (e && e.code === 'permission-denied') kick(LOCKED); });
  // A message from the site's admin: pops up once (on whichever device sees it first), on any page.
  // Web addresses in a message become links (opened in a new tab). Runs on already-escaped text.
  function linkify(h) { return h.replace(/\b(?:https?:\/\/|www\.)[^\s<]+/gi, u => { const tail = (u.match(/[.,;:!?)\]'"]+$/) || [''])[0], url = tail ? u.slice(0, -tail.length) : u;
    return `<a href="${/^www\./i.test(url) ? 'https://' + url : url}" target="_blank" rel="noopener noreferrer">${url}</a>${tail}`; }); }
  // Light formatting in messages and notices: **bold**, *italic*, "# " heading lines and "- " list lines.
  function pgMark(t) { const inl = h => linkify(h.replace(/\*\*(?=\S)([^*]+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*\w])\*(?=\S)([^*]+?)\*(?!\w)/g, '$1<i>$2</i>'));
    let out = '', ul = false;
    escH(String(t || '')).split('\n').forEach(l => { const li = /^\s*[-•]\s+(.*)$/.exec(l), hd = /^\s*#{1,3}\s+(.*)$/.exec(l);
      if (li) { out += (ul ? '' : '<ul>') + '<li>' + inl(li[1]) + '</li>'; ul = true; return; }
      if (ul) { out += '</ul>'; ul = false; }
      out += hd ? '<b class="pgm-hd">' + inl(hd[1]) + '</b>' : inl(l) + '<br>'; });
    return (ul ? out + '</ul>' : out).replace(/(<br>)+$/, ''); }
  // A notice (to everyone) has its own slot beside the personal message, so neither replaces the other; they show one after the other.
  // A notice that's revoked or replaced while it's on screen closes.
  let PGU = null;
  function pgMsg(u) { PGU = u; pgWelcome(u); const cur = document.getElementById('pg-msg');
    if (cur && cur.dataset.k === 'notice' && !(u && u.notice && u.notice.id === cur.dataset.id)) { cur.classList.add('out'); setTimeout(() => cur.remove(), 200); }
    pgPop('msg', 'msgSeen', 'pg-msg-seen'); pgPop('notice', 'noticeSeen', 'pg-notice-seen'); }
  function pgPop(k, sk, lk) { const u = PGU, m = u && u[k]; if (!m || !m.id || !m.text || u[sk] === m.id) return;
    const mk = m.id + (m.rs ? '#' + m.rs : ''); // (a notice an admin re-sent counts as new on this device too)
    const seenHere = () => { try { return localStorage.getItem(lk) === mk; } catch (e) { return false; } }; if (seenHere()) return;
    const open = () => { const v = PGU && PGU[k]; if (!v || v.id !== m.id || PGU[sk] === m.id || seenHere()) return;
      if (document.getElementById('pg-load') || WEL === 'wait') return setTimeout(open, 400);
      const ex = document.getElementById('pg-msg'); if (ex) { if (ex.dataset.id !== m.id) setTimeout(open, 600); return; }
      pgCard(m, k, () => { try { localStorage.setItem(lk, mk); } catch (e) {} UREF.update({ [sk]: m.id }).catch(() => {}); }); };
    open(); }
  // First sign-in: the welcome message (admin page → Notice), then — with Next — the notice that's out right now,
  // which a new account wouldn't otherwise get (notices go to the accounts there when it's sent). Seen once.
  // An admin can reset it for someone (welcomeReset), and they see it again — on any account, however old.
  let WEL = null, WEL_R = 0; // WEL: null: not checked yet · 'wait': loading · true: shown · false: nothing to show
  function pgWelcome(u) { if (!u) return; const rs = Number(u.welcomeReset) || 0; if (WEL === false && rs && rs !== WEL_R && !u.welcomeSeen) WEL = null; if (WEL !== null) return; WEL_R = rs;
    let seen0 = ''; try { seen0 = localStorage.getItem('pg-welcome-seen') || ''; } catch (e) {}
    if (u.welcomeSeen || seen0 === String(rs || 1) || !(rs || Number(u.createdAt) > Date.now() - 30 * 864e5)) { WEL = false; return; }
    WEL = 'wait'; const cfg = fs.collection('config');
    Promise.all([cfg.doc('welcome').get(), cfg.doc('notice').get().catch(() => null)]).then(([a, b]) => { const wm = a.exists && a.data(), n = b && b.exists && b.data();
      if (!wm || !wm.on || !wm.text || (!rs && Number(u.createdAt) < Number(wm.since || 0))) { WEL = false; return; }
      WEL = true; const nx = n && n.id && n.text && (PGU || {}).noticeSeen !== n.id && !((PGU || {}).notice && PGU.notice.id === n.id) ? n : null; // (one that's on their record shows by itself)
      pgFlow(Object.assign({ id: 'welcome' }, wm), nx, () => { try { localStorage.setItem('pg-welcome-seen', String(rs || 1)); } catch (e) {} UREF.update({ welcomeSeen: Date.now() }).catch(() => {}); },
        () => { try { localStorage.setItem('pg-notice-seen', nx.id); } catch (e) {} UREF.update({ noticeSeen: nx.id }).catch(() => {}); });
    }, () => { WEL = false; });
  }
  function pgFlow(wm, nx, afterW, afterN) { const go = () => { if (document.getElementById('pg-load') || document.getElementById('pg-msg')) return setTimeout(go, 400);
      pgCard(wm, 'welcome', () => { if (afterW) afterW(); if (nx) pgCard(nx, 'notice', afterN).dataset.k = 'flow'; }, nx ? 'Next' : 'OK'); };
    go(); }
  // the pop-up itself (the admin page's Preview shows the same one, and OK just closes it)
  function pgCard(m, k, after, label) {
      const w = document.createElement('div'); w.id = 'pg-msg'; w.dataset.k = k; w.dataset.id = m.id; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
      const wd = Math.round(Number(m.w) || 0); if (wd >= 320 && wd <= 1600) w.style.setProperty('--pgm-w', wd + 'px'); /* a notice can say how wide its window is */
      w.innerHTML = `<div class="pgm-card"><div class="pgm-h"><span class="pgm-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H8l-4 4z"/></svg></span><div><b>${k === 'welcome' ? 'Welcome to Adventurer’s Tome' : (k === 'notice' ? 'Notice' : 'Message') + ' from ' + escH(m.anon ? 'Adventurer’s Tome' : (m.fromName || 'Adventurer’s Tome'))}</b><small>${escH(new Date(m.at || Date.now()).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))}</small></div></div>
        <div class="pgm-t">${pgMark(m.text)}</div><div class="pgm-row"><button class="pgm-ok" type="button">${label || 'OK'}</button></div></div>`;
      document.body.appendChild(w); const ok = w.querySelector('.pgm-ok'); const card = w.querySelector('.pgm-card'), body = w.querySelector('.pgm-t'), shade = () => { card.classList.toggle('sc-t', body.scrollTop > 2); card.classList.toggle('sc-b', body.scrollTop + body.clientHeight < body.scrollHeight - 2); }; /* shadows under the header / above OK while there's more to scroll */
      body.addEventListener('scroll', shade, { passive: true }); shade(); setTimeout(() => { ok.focus({ preventScroll: true }); body.scrollTop = 0; shade(); }, 50); /* opens at the top of a long notice, not at its OK button */
      const done = () => { if (after) after(); w.classList.add('out'); setTimeout(() => w.remove(), 200); };
      ok.onclick = done; w.addEventListener('keydown', e => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); done(); } }); return w; }
  window.pgPreviewWelcome = (wm, nx) => { const ex = document.getElementById('pg-msg'); if (ex) ex.remove(); pgFlow(Object.assign({ id: 'preview' }, wm), nx ? Object.assign({ id: 'preview2' }, nx) : null);
    setTimeout(() => { const c = document.getElementById('pg-msg'); if (c) c.dataset.k = 'preview'; }, 0); };
  // Bug reports: a small window (the bug button on a sheet, or Contact us) that lands in the admin page's Bug reports
  // tab. When an admin marks one fixed, its sender gets a note in the corner — on whatever page is open, right away or
  // the next time they open the site.
  const bugsCol = fs.collection('bugs');
  window.pgBugReport = () => { if (document.querySelector('.pg-out')) return; const m = document.createElement('div'); m.className = 'pg-out'; pgOutFade(m);
    m.innerHTML = `<div class="pg-out-card pg-bug-card" role="dialog" aria-modal="true" aria-labelledby="pg-bug-h"><h2 id="pg-bug-h">Report a bug</h2><p>Something not working right? Tell us what happened and we’ll take a look. You’ll get a note when it’s fixed.</p>
      <label class="pg-bug-l">Summary<input class="pg-bug-s" maxlength="120" placeholder="e.g. Spell slots don’t come back on a long rest" autocomplete="off"></label>
      <label class="pg-bug-l">What happened<textarea class="pg-bug-d" rows="6" placeholder="What you did, what you expected, and what happened instead"></textarea></label>
      <div class="pg-out-row"><button class="pg-out-no">Cancel</button><button class="pg-out-yes" disabled>Send</button></div></div>`;
    const close = () => { m.remove(); document.removeEventListener('keydown', key); }, key = e => { if (e.key === 'Escape') close(); };
    const sm = m.querySelector('.pg-bug-s'), ds = m.querySelector('.pg-bug-d'), ok = m.querySelector('.pg-out-yes');
    sm.oninput = () => { ok.disabled = !sm.value.trim(); }; m.onclick = e => { if (e.target === m) close(); }; m.querySelector('.pg-out-no').onclick = close;
    ok.onclick = async () => { ok.disabled = true; ok.textContent = 'Sending…'; let ch = ''; try { ch = (window.sheetState && window.sheetState().name) || ''; } catch (e) {}
      try { await bugsCol.add({ sum: sm.value.trim().slice(0, 120), desc: ds.value.trim().slice(0, 20000), by: EMAIL, byName: String(NAME || '').slice(0, 60), at: Date.now(), where: location.pathname.slice(0, 200), ch: String(ch).slice(0, 80), ua: navigator.userAgent.slice(0, 300), status: 'open' });
        close(); pgCorner('<b>Thanks, your bug report was sent.</b><div class="det">We’ll let you know when it’s fixed.</div>'); }
      catch (x) { ok.disabled = false; ok.textContent = 'Send'; pgCorner('<b>Couldn’t send it.</b><div class="det">' + escH(x && x.code === 'permission-denied' ? 'Try again in a little while.' : (x && x.message) || x) + '</div>'); } };
    document.addEventListener('keydown', key); document.body.appendChild(m); setTimeout(() => sm.focus(), 50); };
  bugsCol.where('by', '==', EMAIL).onSnapshot(qs => qs.docs.forEach(x => { const b = x.data(); if (b.status !== 'fixed' || b.seen) return;
    const k = 'pg-bugfix-' + x.id; let done = ''; try { done = localStorage.getItem(k) || ''; } catch (e) {} if (done === String(b.fixedAt)) return;
    try { localStorage.setItem(k, String(b.fixedAt)); } catch (e) {} x.ref.update({ seen: true }).catch(() => {});
    pgCorner(`<b>Bug fixed: ${escH(b.sum)}</b><div class="det">Thanks for reporting it!</div>`, 12000); }), () => {});
  window.pgPreview = (m, k) => { const ex = document.getElementById('pg-msg'); if (ex) ex.remove(); pgCard(Object.assign({ id: 'preview' }, m), k); document.getElementById('pg-msg').dataset.k = 'preview'; };
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
    // the loading screen stays up until the page has its content (characters, party, admin lists), so nothing pops in
    // after it fades; at most a few seconds on a slow connection
    window.PG_READY = false; window.pgReady = () => { window.PG_READY = true; };
    { const t0 = Date.now(), wait = () => { if (window.PG_READY || Date.now() - t0 > 4500) { requestAnimationFrame(() => { if (load) fadeLoad(load); else document.documentElement.classList.remove('pg-loading'); }); } else setTimeout(wait, 40); }; setTimeout(wait, 0); }
    hub(fs, auth, G, { EMAIL, IS_ADMIN, IS_OWNER, ADMINS, user, signOut, ME, page: ADMINQ && IS_ADMIN ? 'admin' : PARTYQ ? 'party' : JOINQ ? 'join' : 'hub', view: VIEWQ, tab: TABQ, party: PARTYQ, join: JOINQ }); verCheck(); restoreY();
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
  let PUB = '', PARTY = '', PCARD0 = '', txt = null, missing = false, denied = false, OWNER = NEW ? ((IS_ADMIN && O) || EMAIL) : '', VIEWERS = [], EDITORS = [];
  if (!NEW) try {
    const sn = await col.doc(C).get();
    if (!sn.exists || !sn.data().data) missing = true;
    else {
      const d = sn.data(); let str = d.data || ''; const n = Number(d.n) || 1;
      if (d.g && !G) G = clean(d.g); OWNER = (d.owner || '').toLowerCase(); VIEWERS = d.viewers || []; EDITORS = d.editors || []; PUB = d.pub || ''; PARTY = clean(d.party || ''); PCARD0 = d.pcard || '';
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
    const sum = Object.assign({ owner: OWNER, name: s.name, player: s.player, race: s.race, cls: s.cls, level: s.level, thumb: await thumb(s.portrait), acc: s.acc || '', keys: searchKeys(s.name) }, NEW && !LASTSUM ? { createdAt: Date.now() } : {});
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


  // ----- Parties: which party this character is in, everyone's cards, and things sent to it -----
  // The DM opening a player's sheet sees the party too, but only the character's own sheet (its owner, an editor or an
  // admin) keeps its card up to date and picks up what's sent to it.
  const PCOL = fs.collection('parties');
  let PTY = null, PTY_ID = null, PTY_CARDS = {}, unPty = null, unPtyC = null, PTY_SET = 0, PTY_CK = '', ptyT = null, inboxOn = false;
  const PTY_Q = [];
  const ptyChanged = () => { if (window.onPartyChange) { try { window.onPartyChange(); } catch (e) { console.warn(e); } } };
  // The party and everyone's cards are kept in this browser too, so a character in a party opens with its Party tab
  // already there (and filled in) instead of it popping in once the party has loaded.
  const PTY_LS = 'pg-pty:' + C;
  const ptySeed = pid => { try { const c = JSON.parse(lsGet(PTY_LS) || 'null'); if (c && c.p && c.p.id === pid) { PTY = Object.assign({}, c.p, { seeded: true }); PTY_CARDS = c.c || {}; return; } } catch (e) {}
    PTY = { id: pid, name: 'Party', chars: [C], loading: true }; };
  let ptyLsT = null; const ptyKeep = () => { clearTimeout(ptyLsT); ptyLsT = setTimeout(() => { if (!PTY || PTY.loading || PTY.seeded) return;
    const p = { id: PTY.id, name: PTY.name || '', dm: PTY.dm || '', dmName: PTY.dmName || '', chars: PTY.chars || [] }, cs = {};
    Object.keys(PTY_CARDS).forEach(k => { const x = Object.assign({}, PTY_CARDS[k]); delete x.hb; cs[k] = x; });
    let v = JSON.stringify({ p, c: cs }); if (v.length > 300000) v = JSON.stringify({ p, c: {} }); lsSet(PTY_LS, v); }, 1500); };
  const ptySetLocal = pid => { PARTY = pid || ''; PTY_SET = Date.now(); ptyWatch(PARTY); };
  function ptyWatch(pid) {
    pid = pid || ''; if (pid === PTY_ID) return; PTY_ID = pid;
    if (unPty) unPty(); if (unPtyC) unPtyC(); unPty = unPtyC = null; chatStop(); PTY = null; PTY_CARDS = {}; PTY_CK = ''; ptyLiveWatch([]);
    if (pid) ptySeed(pid); ptyChanged();
    if (!pid) return;
    unPty = PCOL.doc(pid).onSnapshot(d => { const pd = d.exists ? d.data() : null;
      if (!pd || !(pd.chars || []).includes(C)) { PTY = null; PTY_CARDS = {}; ptyChanged(); try { localStorage.removeItem(PTY_LS); } catch (e) {}
        // taken out of the party (or it was deleted): this character forgets it
        if (role() === 'owner' && PARTY === pid && Date.now() - PTY_SET > 15000) { PARTY = ''; ptySetSheetParty(fs, C, '').catch(() => {}); ptyWatch(''); }
        return; }
      PTY = Object.assign({ id: pid }, pd); ptyChanged(); ptyKeep(); inboxStart(); ptyCardSoon(); chatStart(pid, pd);
      if (OWNER === EMAIL && pd.dm && pd.dm !== EMAIL && !EDITORS.includes(pd.dm)) col.doc(C).get().then(sd => sd.exists && ptyShareDM(fs, C, pd.dm, sd.data())).then(ok => { if (ok) { if (!VIEWERS.includes(pd.dm)) VIEWERS = VIEWERS.concat([pd.dm]); if (!EDITORS.includes(pd.dm)) EDITORS = EDITORS.concat([pd.dm]); } }, () => {});
      if (!unPtyC) unPtyC = PCOL.doc(pid).collection('cards').onSnapshot(qs => { PTY_CARDS = {}; qs.docs.forEach(x => PTY_CARDS[x.id] = x.data()); ptyChanged(); ptyKeep(); }, () => {});
      ptyLiveWatch((pd.chars || []).filter(id => id !== C));
    }, () => { PTY = null; PTY_CARDS = {}; ptyChanged(); });
  }
  // The other characters' saved sheets, live (their summary changes with every save, open or not).
  const PTY_LIVE = {}, unPL = {};
  function ptyLiveWatch(ids) {
    ids.forEach(id => { if (unPL[id]) return; unPL[id] = col.doc(id).onSnapshot(async sn => { const d = sn.exists ? sn.data() : null, pc = d && await sheetLive(fs, id, d); if (!pc) return;
      const same = JSON.stringify(PTY_LIVE[id]) === JSON.stringify(pc); PTY_LIVE[id] = pc; if (!same) ptyChanged(); }, () => {}); });
    Object.keys(unPL).forEach(id => { if (!ids.includes(id)) { unPL[id](); delete unPL[id]; delete PTY_LIVE[id]; } });
  }
  const ptyCardSoon = () => { clearTimeout(ptyT); ptyT = setTimeout(ptyCard, 700); };
  const ptyCard = async () => { if (!PTY || PTY.seeded || PTY.loading || role() === 'view' || !window.partyCard || !window.sheetSummary) return; let c; try { c = window.partyCard(); } catch (e) { return; } if (!c) return;
    const s = window.sheetSummary(); c = Object.assign(c, { owner: OWNER, player: (typeof playerName === 'function' && playerName()) || s.player || '', thumb: await thumb(s.portrait), acc: s.acc || '', path: PATHVAL || '' });
    const key = JSON.stringify(c); if (key === PTY_CK) return; PTY_CK = key;
    try { await PCOL.doc(PTY.id).collection('cards').doc(C).set(Object.assign({ at: Date.now() }, c)); } catch (e) { PTY_CK = ''; } };
  // Things sent to this character wait in its inbox; the first open copy of the sheet claims each one and applies it.
  const ptyDeliver = () => { if (!window.sheetIncoming) return setTimeout(ptyDeliver, 600); while (PTY_Q.length) { const m = PTY_Q.shift(); try { window.sheetIncoming(m); } catch (e) { console.warn('party message', e); } } };
  function inboxStart() { if (inboxOn || role() === 'view') return; inboxOn = true;
    col.doc(C).collection('inbox').orderBy('at').onSnapshot(qs => qs.docChanges().forEach(async ch => { if (ch.type !== 'added') return;
      let d = null; try { d = await fs.runTransaction(async tx => { const cur = await tx.get(ch.doc.ref); if (!cur.exists) return null; tx.delete(ch.doc.ref); return cur.data(); }); } catch (e) { return; }
      if (!d) return; let data = {}; try { data = JSON.parse(d.data || '{}'); } catch (e) {}
      PTY_Q.push({ kind: d.kind, data, from: d.from || '', fromName: d.fromName || '', by: d.by || '', at: d.at || Date.now(), p: d.p, ref: d.ref || ch.doc.id }); ptyDeliver(); }), () => { inboxOn = false; }); }
  // ----- the players' chat (the DM can't see it; never logged; cleared after 12 hours) -----
  const CHAT_TTL = 12 * 3600e3; let CHAT = [], unChat = null, chatPid = '', chatFirst = true, WH = {}, unW = [];
  // only the character's own player sees its party chat (editors and viewers get an empty panel saying so)
  const chatOK = pd => OWNER === EMAIL && (pd.people || []).includes(EMAIL) && pd.dm !== EMAIL && !(pd.mgrs || []).includes(EMAIL);
  function chatStop() { if (unChat) unChat(); unChat = null; unW.forEach(u => u()); unW = []; WH = {}; chatPid = ''; CHAT = []; }
  function chatStart(pid, pd) { if (!chatOK(pd)) { if (chatPid) { chatStop(); ptyChanged(); } return; } if (chatPid === pid) return; chatStop(); chatPid = pid; chatFirst = true;
    const cc = PCOL.doc(pid).collection('chat'), cut = Date.now() - CHAT_TTL;
    cc.where('at', '<', cut).limit(100).get().then(qs => qs.docs.forEach(d => d.ref.delete().catch(() => {})), () => {});
    unChat = cc.where('at', '>', cut).orderBy('at').limit(200).onSnapshot(qs => { CHAT = qs.docs.map(d => Object.assign({ id: d.id }, d.data()));
      if (!chatFirst) qs.docChanges().forEach(ch => { if (ch.type === 'added' && ch.doc.data().c !== C && OWNER === EMAIL && window.onPartyChat) { try { window.onPartyChat(ch.doc.data()); } catch (e) {} } });
      chatFirst = false; if (window.onPartyChatList) { try { window.onPartyChatList(); } catch (e) {} } }, e => { CHAT = []; console.warn('party chat unavailable', e && e.code); unChat = null; chatPid = ''; ptyChanged(); });
    // whispers to and from this account (only the two people in one can read it)
    const wc = PCOL.doc(pid).collection('whisper'), wFirst = {};
    const wOn = (field, val) => wc.where(field, '==', val).onSnapshot(qs => { const fresh = [], old = Date.now() - CHAT_TTL;
      qs.docChanges().forEach(ch => { const d = Object.assign({ id: ch.doc.id, w: 1 }, ch.doc.data()); if (ch.type === 'removed') { delete WH[d.id]; return; } if (Number(d.at) < old) { if (d.by === EMAIL || d.toEm === EMAIL) ch.doc.ref.delete().catch(() => {}); return; } if (ch.type === 'added' && !WH[d.id]) fresh.push(d); WH[d.id] = d; });
      if (wFirst[field]) fresh.forEach(d => { if (d.to === C && d.c !== C && OWNER === EMAIL && window.onPartyChat) { try { window.onPartyChat(d); } catch (e) {} } }); wFirst[field] = true;
      if (window.onPartyChatList) { try { window.onPartyChatList(); } catch (e) {} } }, () => {});
    unW = [wOn('toEm', EMAIL), wOn('by', EMAIL)]; }
  window.PG_PARTY = {
    // an initiative roll goes to the DM's turn order (picked up even when it isn't open)
    init: v => { if (!PTY || PTY.loading || PTY.seeded || role() === 'view') return Promise.resolve(); let nm = ''; try { nm = window.sheetSummary().name; } catch (e) {} return PCOL.doc(PTY.id).collection('init').doc(C).set({ v: Number(v) || 0, at: Date.now(), n: String(nm).slice(0, 120) }).catch(() => {}); },
    chat: { on: () => !!unChat, canSend: () => OWNER === EMAIL, me: () => { const a = avaOf(ME); return { name: NAME, pic: String(a.pic || ''), color: String(a.color || ''), clear: !!a.clear }; }, list: () => CHAT.concat(Object.values(WH).filter(w => w.to === C || w.c === C)).filter(m => Number(m.at) > Date.now() - CHAT_TTL).sort((a, b) => Number(a.at) - Number(b.at)), mine: m => m.c === C,
      // to: a character id in the party for a whisper (only you and that character's player see it)
      send: (t, to) => { t = String(t || '').trim().slice(0, 1000); if (!t || !unChat) return Promise.reject(new Error('Not in the chat')); if (OWNER !== EMAIL) return Promise.reject(new Error('Only this character’s player can send messages from it.')); let nm = ''; try { nm = window.sheetSummary().name; } catch (e) {}
        // the chat shows people as themselves: their name and account picture go with each message
        const av = avaOf(ME), pp = String(av.pic || ''), base = { at: Date.now(), by: EMAIL, c: C, n: String(nm || 'Someone').slice(0, 120), t, pn: String(NAME || '').slice(0, 60), pp: pp.length <= 60000 ? pp : '', pc: String(av.color || '').slice(0, 20), pk: !!av.clear };
        if (!to) return PCOL.doc(chatPid).collection('chat').add(base);
        const card = PTY_CARDS[to] || {}, live = PTY_LIVE[to] || {}, toEm = card.owner || live.owner || '';
        if (!toEm) return Promise.reject(new Error('Couldn’t find that character’s player.'));
        return PCOL.doc(chatPid).collection('whisper').add(Object.assign(base, { to, toEm, toN: String(card.player || card.name || live.name || 'them').slice(0, 120) })); } },
    on: () => !!PTY, self: C, email: EMAIL, owner: () => OWNER, canAct: () => role() !== 'view',
    info: () => PTY ? { loading: !!PTY.loading, id: PTY.id, name: PTY.name || 'Party', dm: PTY.dm, dmName: PTY.dmName || PTY.dm, mgrs: PTY.mgrs || [], pic: /^(data:image\/|https:\/\/)/.test(String(PTY.pic || '')) ? PTY.pic : '', mgr: PTY.dm === EMAIL || (PTY.mgrs || []).includes(EMAIL), url: URLS.party(PTY.id, PTY.name) } : null,
    members: () => PTY ? (PTY.chars || []).filter(id => id !== C).map(id => { const c = PTY_CARDS[id] || {}, l = PTY_LIVE[id]; return Object.assign({ id, name: 'A character' }, !l ? c : Number(l.at) >= Number(c.at || 0) ? Object.assign({}, c, l) : Object.assign({}, l, c)); }) : [],
    me: () => PTY_CARDS[C] || null,
    send: (to, kind, data, ref) => { if (!PTY) return Promise.reject(new Error('Not in a party')); let nm = ''; try { nm = window.sheetSummary().name; } catch (e) {} return ptySend(fs, EMAIL, PTY.id, to, kind, data, C, nm, ref); },
    recall: (to, ref) => { if (!PTY) return Promise.resolve(''); let nm = ''; try { nm = window.sheetSummary().name; } catch (e) {} return ptyRecall(fs, EMAIL, PTY.id, to, ref, C, nm); },
    newRef: () => fs.collection('x').doc().id, snap: ptySnap, diff: ptyDiff, revert: ptyRevert,
    card: () => ptyCardSoon()
  };
  // A small summary saved with the character (HP, AC, speed, conditions…): a party card fills itself in from it even when
  // the character was added before its sheet had been opened in the party.
  const pcardNow = () => { try { const c = window.partyCard && window.partyCard(); if (!c) return ''; delete c.hb; return JSON.stringify(c); } catch (e) { return ''; } };
  // The sheet's sync code talks to "db" like it does on claude.ai; here that's this character's Firestore documents.
  const docFor = p => { const m = /^sheets\/(main|part(\d+))$/.exec(p); return m ? [col.doc(m[2] ? C + '_p' + m[2] : C), !m[2]] : null; };
  const none = { get: async () => ({ exists: false, data: () => null }), set: async () => { throw { code: 'unsupported' }; }, delete: async () => {}, onSnapshot: () => () => {} };
  // With a view-only link on, every save is mirrored to the public copy (pub/<link>, same layout as the sheet's own documents).
  const pubMirror = (p, v, main) => { if (!PUB) return; const k = (/part(\d+)/.exec(p) || [])[1]; fs.collection('pub').doc(main ? PUB : PUB + '_p' + k).set(Object.assign({ c: C, savedAt: Number(v.savedAt) || Date.now(), data: v.data || '' }, main ? { n: Number(v.n) || 1, v: 2, tab: String(v.tab || 'x') } : {})).catch(() => {}); };
  const db = { doc: p => { const x = docFor(p); if (!x) return none; const [r, main] = x;
    return { get: () => r.get(), set: v => { if (role() === 'view') return Promise.reject({ code: 'permission-denied' }); v = Object.assign({}, v, { owner: OWNER, viewers: VIEWERS, editors: EDITORS }, main && G ? { g: G } : {}, main && PUB ? { pub: PUB } : {}, PARTY ? { party: PARTY } : {}, main ? { pcard: pcardNow() } : {}); if (main) WROTE = Number(v.savedAt); const w = r.set(v); if (main) w.then(() => { hubSoon(); ptyCardSoon(); }, () => {}); w.then(() => pubMirror(p, v, main), () => {}); return w; }, delete: () => r.delete(),
      onSnapshot: (cb, err) => r.onSnapshot(s => { const d = s.exists && s.data(); if (d && d.owner) OWNER = String(d.owner).toLowerCase(); if (d) { VIEWERS = d.viewers || []; EDITORS = d.editors || []; if (main) { PUB = d.pub || ''; if (Date.now() - PTY_SET > 15000 && clean(d.party || '') !== PARTY) { PARTY = clean(d.party || ''); ptyWatch(PARTY); } } } cb(s);
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
        if (d.by !== EMAIL) return; // only your own rolls (your phone → your computer), never someone else's who can edit it
        // only one computer answers: claim it first
        try { const mine = await fs.runTransaction(async tx => { const cur = await tx.get(ch.doc.ref); if (!cur.exists || cur.data().status !== 'new') return false; tx.update(ch.doc.ref, { status: 'busy', tab: me }); return true; }); if (!mine) return; } catch (e) { return; }
        let r; try { r = await roll(d); } catch (e) { r = { error: String(e && e.message || e) }; }
        ch.doc.ref.update({ status: 'done', res: JSON.stringify(r || { error: 'no result' }) }).catch(() => {}); }), () => {}); },
    hostSeen: () => relay.doc('host').get().then(s => (s.exists && s.data().at) || 0) };
  const cuser = { id: async () => null, isOwner: async () => true, can: async () => role() !== 'view' };
  window.claude = { use: async n => n === 'db' ? db : n === 'user' ? cuser : null };
  if (!NEW && PARTY) ptySeed(PARTY);
  run();
  // The Player field isn't typed in on the site: it's the owner's name from the player list.
  const playerName = () => OWNER_NAME || P || (OWNER === EMAIL ? (ME && ME.name) || user.displayName || '' : '');
  const syncPlayer = () => { try { const st = window.sheetState && window.sheetState(), want = playerName(); if (st && st.created && want && st.player !== want && role() !== 'view') window.sheetSet('player', want); } catch (e) {} };
  if (NEW && playerName()) { try { const st = window.sheetState(); if (st && !st.player) st.player = playerName(); } catch (e) {} }
  try { const st0 = window.sheetState(); if (st0 && st0.created) LASTD = digest(st0); } catch (e) {}
  if (!NEW && hubCol) setTimeout(() => { syncPlayer(); hubUpdate(false); }, 2500);
  // Its summary (HP, AC… for party cards) is brought up to date when it's opened, even if nothing gets changed.
  if (!NEW && role() !== 'view') setTimeout(() => { const pc = pcardNow(); if (pc && pc !== PCARD0) col.doc(C).update({ pcard: pc }).then(() => { PCARD0 = pc; }, () => {}); }, 3000);
  if (!NEW) { if (PARTY) ptyWatch(PARTY);
    // a character that a party lists but that doesn't know it yet (it joined while this sheet was being saved elsewhere)
    // Someone else put this character in their party (a DM it's shared with can): its owner says yes before the sheet
    // links up — linking lets that party's DM change it and its players read it.
    else if (role() !== 'view') setTimeout(() => PCOL.where('people', 'array-contains', EMAIL).get().then(qs => { const d = qs.docs.find(x => (x.data().chars || []).includes(C)); if (!d || PARTY) return;
      if (role() !== 'owner') { ptySetLocal(d.id); return; }
      const p = d.data(), m = document.createElement('div'); m.className = 'pg-out'; pgOutFade(m);
      m.innerHTML = `<div class="pg-out-card" role="dialog" aria-modal="true" aria-labelledby="pg-pj-h"><h2 id="pg-pj-h">Join ${escH(p.name || 'this party')}?</h2><p>${escH(p.dmName || 'Its DM')} added ${escH(((window.sheetState && window.sheetState()) || {}).name || 'this character')} to their party. Joining lets the party’s DM make changes to it (healing, items, spells) and lets the other players see it.</p>
        <div class="pg-out-row"><button class="pg-out-no">No thanks</button><button class="pg-out-yes">Join</button></div></div>`;
      const done = () => m.remove();
      m.querySelector('.pg-out-yes').onclick = () => { done(); ptySetLocal(d.id); ptySetSheetParty(fs, C, d.id).catch(() => {}); };
      m.querySelector('.pg-out-no').onclick = () => { done(); ptyLeave(fs, EMAIL, d.id, C, { owner: EMAIL }).catch(() => {}); };
      document.body.appendChild(m); }, () => {}), 4000); }
  // Activity log for this sheet: that it was opened (as soon as its name is known), and what was changed — a burst of
  // changes is one entry, logged 2 seconds after the last of them (and never more than 10 seconds after the first).
  if (!NEW) { const t0 = Date.now(), logOpen = () => { let nm = ''; try { nm = window.sheetSummary().name; } catch (e) {} if (!nm && Date.now() - t0 < 3000) return setTimeout(logOpen, 150);
    pgLog('open', { target: C, tName: nm, detail: role() === 'view' ? 'view only' : '' }); }; setTimeout(logOpen, 150); }
  { let EDITS = [], editT = null, first = 0; const flush = () => { clearTimeout(editT); editT = null; first = 0; if (!EDITS.length) return; const L = [...new Set(EDITS)]; EDITS = [];
      let nm = ''; try { nm = window.sheetSummary().name; } catch (e) {} pgLog('edit', { target: C, tName: nm, detail: L.slice(0, 20).join(' · ') + (L.length > 20 ? ' · …' : '') }); };
    window.onSheetChange = label => { if (role() === 'view') return; EDITS.push(String(label || 'Change').replace(/^Edit: /, '')); if (!first) first = Date.now();
      clearTimeout(editT); editT = setTimeout(flush, Math.max(0, Math.min(2000, first + 10000 - Date.now()))); };
    document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); }); addEventListener('pagehide', flush); }
  if (!NEW && hubCol && PRETTY) hubCol.doc(C).get().then(d => { const pth = d.exists && d.data().path; if (pth) showPath(pth); }, () => {});
  // New character: once it's created (and saved to the cloud), its link goes in the address bar.
  if (NEW) { const t = setInterval(() => { let made = false; try { const st = window.sheetState && window.sheetState(); made = !!(st && st.created); } catch (e) {} if (!made) return; clearInterval(t); try { sessionStorage.removeItem('pg-newfor'); } catch (e) {} setTimeout(() => startPres(), 2500); // a new character's viewers bubble starts once it exists
    history.replaceState(null, '', URLS.byId(C)); syncPlayer();
    // Made from a party's invite link (or its "make a new character" button): it joins that party once it's saved.
    { let J = null; try { J = JSON.parse(sessionStorage.getItem('pg-join') || 'null'); sessionStorage.removeItem('pg-join'); } catch (e) {}
      if (J && J.p && Date.now() - (J.at || 0) < 6 * 3600000 && OWNER === EMAIL) { ptySetLocal(clean(J.p)); let tries = 0;
        const tryJoin = async () => { tries++; const ok = await col.doc(C).get().then(x => x.exists, () => false); if (!ok) { if (tries < 30) setTimeout(tryJoin, 2000); return; }
          let s = {}; try { s = window.sheetSummary(); } catch (e) {}
          try { await ptyJoin(fs, EMAIL, clean(J.p), C, J.t || '', { name: s.name || '', race: s.race || '', cls: s.cls || '', level: s.level || 0, player: playerName() || '' }); PTY_SET = Date.now(); ptyWatch(''); ptyWatch(clean(J.p)); pgLog('party_join', { target: J.p, tName: J.name || '', detail: s.name || '' });
            setTimeout(() => window.sheetToast(`<div><b>Joined ${escH(J.name || 'the party')}</b><div class="det">Your party is in the Party tab: hand items over and cast spells on each other from there.</div></div>`, '', 9000), 2500); }
          catch (e) { PARTY = ''; ptyWatch(''); window.sheetToast(`<div><b>Couldn’t join ${escH(J.name || 'the party')}</b><div class="det">${escH(e && e.code === 'permission-denied' ? 'The invite link may have been turned off — ask your DM for a new one.' : (e && e.message) || String(e))}</div></div>`, 'fumble', 12000); } };
        setTimeout(tryJoin, 1500); } }
    setTimeout(() => window.sheetToast(`<div><b>Your character is saved</b><div class="det">${G ? 'It\'s on your party page. ' : ''}Open it on any device you're signed in on — it stays in sync. ${IS_ADMIN && OWNER !== EMAIL ? 'It belongs to ' + escH(OWNER) + '.' : 'Only you and the people you share it with can open it.'}</div></div>`, '', 12000), 600);
    hubChanged = true; hubSoon();
  }, 500); }
  // Back to the hub (desktop and phone).
  if (G) { const a = document.createElement('a'); a.href = URLS.hub(G); a.className = 'pg-hublink'; a.title = 'All characters'; if (FRAMED) a.target = '_top'; a.innerHTML = '<img class="pg-hl-ic" src="/icon-32.png" alt="" aria-hidden="true">Adventurer’s Tome'; document.body.appendChild(a);
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
    if (box.classList.contains('ready')) return; if (document.documentElement.classList.contains('pg-al') || document.documentElement.classList.contains('mobile')) { box.classList.add('ready'); placeShared(); return; } const k = l + t + (a.offsetParent ? 1 : 0); if (k !== presKey) { presKey = k; clearTimeout(presT); presT = setTimeout(() => { if (box.isConnected && a.offsetParent) { box.classList.add('ready'); placeShared(); } else presKey = ''; }, 600); } placeShared(); };
  new ResizeObserver(() => placePres()).observe(document.documentElement);
  // Who's looking at this sheet right now — shown once it's shared: small portraits beside the back button, you too.
  // Each open copy checks in once a minute (only while its tab is showing) and drops off when closed or idle.
  let PRES_ON = false; const startPres = () => { if (PRES_ON) return; PRES_ON = true;
    const pcol = col.doc(C).collection('presence'), mine = pcol.doc(EMAIL); let seen = {}, box = null;
    // Keeps checking in while the tab is in the background too (browsers slow timers there to about once a minute,
    // which is still inside the window below) — someone with the sheet in another tab is still looking at it.
    // With a view-only link on, you're also listed where the public page can see you, and people on that link show here.
    const pv = PUB ? fs.collection('pubviews').doc(C).collection('live') : null; let anon = {}, PVID = '';
    if (pv) pgViewId(EMAIL).then(v => { PVID = v; beat(); }, () => {});
    // Only someone the sheet belongs to or is shared with shows up as viewing it. An admin who opened it without being
    // given access sees who's here but isn't listed (checked each time, so sharing it with them later puts them in).
    const counted = () => OWNER === EMAIL || VIEWERS.includes(EMAIL) || EDITORS.includes(EMAIL);
    const beat = async () => { if (!counted()) { if (seen[EMAIL]) { delete seen[EMAIL]; leave(); } return; }
      const a = avaOf(ME), at = Date.now(); seen[EMAIL] = { name: NAME, pic: a.pic, color: a.color, clear: a.clear, at }; try { await mine.set({ name: NAME, pic: a.pic, color: a.color, clear: a.clear, at }); } catch (e) {}
      if (pv && PVID) pv.doc(PVID).set({ anon: false, at, name: String(NAME || '').slice(0, 60), pic: a.pic || '', color: a.color || '', clear: !!a.clear }).catch(() => {}); };
    const leave = () => { mine.delete().catch(() => {}); if (pv && PVID) pv.doc(PVID).delete().catch(() => {}); };
    // The character's owner comes first whenever they're here, then you, then everyone else.
    const show = () => { const now = Date.now(), rank = em => em === OWNER ? 0 : em === EMAIL ? 1 : 2, here = Object.entries(seen).filter(([, d]) => now - (d.at || 0) < 200000).sort(([a], [b]) => rank(a) - rank(b));
      if (!box) { box = document.createElement('div'); box.className = 'pg-pres'; document.body.appendChild(box); }
      const anons = Object.values(anon).filter(d => now - (d.at || 0) < 200000);
      box.hidden = !here.length && !anons.length; // you see yourself whenever you count as viewing it, on your own sheet too
      box.innerHTML = here.map(([em, d]) => avaHTML(d.name, em, d.pic, em === EMAIL ? 'me' : '', em === EMAIL ? (d.name || NAME) + ' (you)' : (d.name || em), { color: d.color, clear: d.clear })).join('') + anons.map(() => anonAvaHTML(false)).join('');
      placePres(); };
    // you show straight away, without waiting for the first list from the server
    if (counted()) { const a = avaOf(ME); seen[EMAIL] = { name: NAME, pic: a.pic, color: a.color, clear: a.clear, at: Date.now() }; }
    beat(); show(); setInterval(beat, 60000); setInterval(show, 1500);
    if (pv) pv.where('anon', '==', true).onSnapshot(qs => { anon = {}; qs.docs.forEach(d => { anon[d.id] = d.data(); }); show(); }, () => {});
    document.addEventListener('visibilitychange', () => { if (!document.hidden) beat(); });
    addEventListener('pagehide', leave);
    pcol.onSnapshot(qs => { const me0 = seen[EMAIL]; seen = {}; qs.docs.forEach(d => { seen[d.id] = d.data(); }); if (!counted()) delete seen[EMAIL]; else if (!seen[EMAIL] && me0) seen[EMAIL] = me0; show(); }, () => {});
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
  if (role() !== 'owner') { const t = document.createElement('div'); t.className = 'pg-shared' + (role() === 'view' ? ' view' : ''); if (role() === 'view') t.innerHTML = 'View only<span class="pt-sub"> (changes are not saved)</span>'; else t.textContent = 'Shared with you · can edit'; document.body.appendChild(t); setTimeout(placeShared, 50); setInterval(placeShared, 1500); }
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
    <p class="hub-hint" id="si-msg">No Google account? We'll email you a sign-in link.</p>${kickedMsg ? `<p class="pg-kicked">${escH(kickedMsg)}</p>` : ''}
    <p class="pg-contact">Trouble signing in? <a href="${CONTACT}">Contact us</a></p></div>${a2hsHTML()}`);
  wireA2HS(document.getElementById('pg-load'));
  wireDie(document.getElementById('pg-load'));
  // Errors and the "check your email" note show in the box just above the bottom divider (where "You've been signed
  // out" appears), replacing it; the hint line under the email field stays as it is.
  const msg = (t, ok) => { const card = document.querySelector('.pg-signin'); if (!card) return; let m = card.querySelector('.pg-kicked');
    if (!m) { m = document.createElement('p'); m.className = 'pg-kicked'; card.insertBefore(m, card.querySelector('.pg-contact')); }
    m.classList.toggle('ok', !!ok); m.innerHTML = t; if (m.animate && !PG_CALM) m.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' }); };
  document.getElementById('si-g').onclick = async () => { const pr = new firebase.auth.GoogleAuthProvider(); pr.setCustomParameters({ prompt: 'select_account' });
    try { await auth.signInWithPopup(pr); pgGo(null); } catch (e) { if (e && /popup/.test(e.code || '')) { auth.signInWithRedirect(pr); return; } msg('Couldn\'t sign in: ' + escH((e && e.message) || e)); } };
  document.getElementById('si-f').onsubmit = async e => { e.preventDefault(); const em = document.getElementById('si-e').value.trim().toLowerCase(); if (!em) return;
    try { await auth.sendSignInLinkToEmail(em, { url: location.origin + location.pathname, handleCodeInApp: true }); try { localStorage.setItem('dnd-signin-email', em); localStorage.setItem('dnd-signin-back', location.href); } catch (x) {}
      msg(`<b>Check your email</b> (${escH(em)}) for a sign-in link and open it on this device. If it isn't there in a minute, look in Spam.`, true); } catch (x) { msg('Couldn\'t send the link: ' + escH((x && x.message) || x)); } };
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
  let chars = [], open = {}, view = ['shared', 'parties'].includes(ctx.view) ? ctx.view : 'mine';
  // The lobby's tabs, left to right.
  const VIEWS = ['mine', 'parties', 'shared'], vi = v => Math.max(0, VIEWS.indexOf(v));
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
  const pic = c => c.thumb ? `<img class="hc-pic" src="${esc(c.thumb)}" alt=""${accStyle(c)}>` : `<span class="hc-pic hc-nopic"${accStyle(c)}>${esc(initials(c.name || '?'))}</span>`;
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
      box.querySelectorAll('[data-j]').forEach(b => b.onmousedown = e => { e.preventDefault(); pick(items[Number(b.dataset.j)]); }); };
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
  // Only the owner can delete a character from the lobby (editors can't, admins included); admins can from the admin panel.
  const canDelete = (c, adm) => (c.owner || '') === EMAIL || (adm && IS_ADMIN);
  function deleteChar(c, after, adm) {
    if (!canDelete(c, adm)) return;
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

  // Parties: the strip on the characters page, a party's own page, invite links and the admin list.
  let PM_ = null; const PMx = () => PM_ || (PM_ = partyModule({ fs, EMAIL, IS_ADMIN, modal, toast, esc, close, root, G, chars: () => chars, nameOf, needNames, myName, pic, peoplePicker, myAva: () => myAva(), signOut }));
  // ================= Hub: my characters and the ones shared with me =================
  function createChar() { pgGo(URLS.newChar(G)); }
  // Your picture: your initials (on a colour you can pick), one of your characters, or an image you upload.
  const myAva = () => { const a = avaOf(ME), ch = picModeOf(ME) === 'char' && ME.picChar && chars.find(c => c.id === ME.picChar && isMine(c)); if (ch && ch.thumb) a.pic = ch.thumb; return a; };
  // An uploaded image is shrunk to a small square here before saving. A transparent background is kept (as PNG) and the
  // whole image fits inside; otherwise it's cropped to fill the circle.
  const prepPic = file => pgCrop(file, { shape: 'circle', size: 192, title: 'Edit picture' }).then(r => { if (!r) throw Object.assign(new Error(''), { cancel: true }); return { img: r.url, clear: r.clear }; });
  const prepPic0 = file => new Promise((res, rej) => { const url = URL.createObjectURL(file), im = new Image();
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
      try { const r = await prepPic(f); st.img = r.img; st.clear = r.clear; paint(); } catch (x) { if (x && x.cancel) return; err.textContent = x.message || String(x); err.hidden = false; } };
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
  // The row itself stays in the list (invisible, holding its place) while a copy of it follows the finger on top of the
  // page. The copy lives outside the sliding lists, so scrolling or the lists' own movement can't make it jump.
  document.addEventListener('pointerdown', e => { const g = e.target.closest && e.target.closest('.hr-grip'); if (!g || e.button > 0) return; const r = g.closest('.hr'); e.preventDefault();
    const b = r.getBoundingClientRect(), gh = r.cloneNode(true); gh.classList.add('hr-ghost', 'drag'); gh.removeAttribute('data-id');
    Object.assign(gh.style, { position: 'fixed', left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px', margin: 0, zIndex: 60, pointerEvents: 'none', transition: 'none', willChange: 'top' });
    document.body.appendChild(gh); r.classList.add('hr-hold');
    RD = { r, gh, pin: r.dataset.pin, list: r.parentElement, dy: e.clientY - b.top, y: e.clientY, raf: 0 }; document.body.classList.add('hdragging'); try { g.setPointerCapture(e.pointerId); } catch (x) {} });
  const dragStep = () => { const d = RD; if (!d) return; d.raf = 0; d.gh.style.top = (d.y - d.dy) + 'px';
    const rows = [...d.list.querySelectorAll(':scope > .hr')], peers = rows.filter(x => x !== d.r && x.dataset.pin === d.pin);
    if (peers.length) { const mid = d.y - d.dy + d.gh.offsetHeight / 2, tgt = peers.find(x => { const bb = x.getBoundingClientRect(); return mid < bb.top + bb.height / 2; });
      const last = peers[peers.length - 1];
      if (tgt ? d.r.nextElementSibling !== tgt : last.nextElementSibling !== d.r) slide(rows.filter(x => x !== d.r), () => tgt ? tgt.before(d.r) : last.after(d.r)); }
    const sc = d.list.closest('.hub-scroll'), sr = sc ? sc.getBoundingClientRect() : { top: 0, bottom: innerHeight }, edge = 70, by = y => sc ? sc.scrollBy(0, y) : scrollBy(0, y);
    if (d.y < sr.top + edge) { by(-8); d.raf = requestAnimationFrame(dragStep); } else if (d.y > sr.bottom - edge) { by(8); d.raf = requestAnimationFrame(dragStep); } };
  document.addEventListener('pointermove', e => { if (!RD) return; e.preventDefault(); RD.y = e.clientY; if (!RD.raf) RD.raf = requestAnimationFrame(dragStep); }, { passive: false });
  const endDrag = () => { if (!RD) return; const d = RD; RD = null; if (d.raf) cancelAnimationFrame(d.raf); const pb = d.r.getBoundingClientRect();
    d.gh.style.transition = 'top .16s ease, box-shadow .16s, transform .16s'; d.gh.style.top = pb.top + 'px'; d.gh.classList.remove('drag');
    setTimeout(() => { d.gh.remove(); d.r.classList.remove('hr-hold'); document.body.classList.remove('hdragging');
      const all = [...d.list.querySelectorAll(':scope > .hr')]; if (d.r.dataset.party) return PMx().saveOrder(all.filter(x => x.dataset.party).map(x => x.dataset.id)); saveOrder(all.filter(x => x.dataset.pin === '1').map(x => x.dataset.id)).then(() => saveOrder(all.filter(x => x.dataset.pin !== '1').map(x => x.dataset.id))); }, 170); };
  document.addEventListener('pointerup', endDrag); document.addEventListener('pointercancel', endDrag);

  // My characters ⇄ Shared characters. Both lists sit side by side in a track: on a phone the track slides (and follows
  // your finger when you swipe), on a computer the other list fades in. The switch only shows once something has
  // been shared with you.
  let VIEW_IND = null, SH_LOADED = false;
  const slideMode = () => TOUCH || innerWidth <= 640;
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function placeInd(anim, frac) {
    const bar = root.querySelector('.hub-seg'), ind = bar && bar.querySelector('.hv-ind'), btns = bar ? [...bar.querySelectorAll('[data-view]')] : []; if (!ind || btns.length < 2) return;
    const f = frac != null ? frac : vi(view), k0 = Math.max(0, Math.min(btns.length - 2, Math.floor(f))), t = f - k0;
    const br = bar.getBoundingClientRect(), r0 = btns[k0].getBoundingClientRect(), r1 = btns[k0 + 1].getBoundingClientRect();
    const x = (r0.left - br.left) + (r1.left - r0.left) * t, w = r0.width + (r1.width - r0.width) * t;
    ind.style.transition = anim && !calm() ? '' : 'none'; ind.style.transform = `translateX(${x}px)`; ind.style.width = w + 'px';
    btns.forEach((b, k) => b.classList.toggle('on', Math.round(f) === k));
  }
  function placeTrack(anim, dx) {
    const tr = root.querySelector('.hub-track'); if (!tr) return; const idx = vi(view);
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
  const VSCROLL = { mine: 0, parties: 0, shared: 0 };
  const padBot = () => parseFloat(getComputedStyle(root).paddingBottom) || 0;
  function prepIn(p) { if (!p || p._y != null) return; p.classList.remove('hp-off'); unclamp(p);
    const top = p.getBoundingClientRect().top + scrollY, max = Math.max(0, top + p.offsetHeight + padBot() - innerHeight);
    p._y = Math.min(VSCROLL[p.dataset.pane] || 0, max); p.style.transform = scrollY - p._y ? `translateY(${scrollY - p._y}px)` : ''; }
  addEventListener('scroll', () => { root.querySelectorAll('.hub-pane').forEach(p => { if (p._y != null) p.style.transform = scrollY - p._y ? `translateY(${scrollY - p._y}px)` : ''; }); }, { passive: true });
  // The gold button beside the tabs makes whatever the tab lists: a character, or (on Parties) a party.
  function newBtn() { const nb = root.querySelector('#hub-new'); if (!nb) return; const pty = view === 'parties', t = nb.querySelector('.hn-txt b');
    if (t) t.textContent = pty ? 'New party' : 'Create character'; nb.onclick = () => pty ? PMx().newParty() : createChar(); }
  function switchView(v) { if (v === view) return; settle(); setTimeout(newBtn, 0); const out0 = root.querySelector('.hub-pane.on'); VSCROLL[view] = scrollY; view = v; history.replaceState(null, '', view === 'mine' ? URLS.hub(G) : URLS[view](G));
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
          if (mid) { const off = m0 + vi(view) * sw.w; sw.x -= off; placeTrack(false, dx + off); }
          VSCROLL[view] = scrollY; [VIEWS[vi(view) - 1], VIEWS[vi(view) + 1]].filter(Boolean).forEach(n => prepIn(sw.tr.querySelector(`.hub-pane[data-pane="${n}"]`))); dx = e.touches[0].clientX - sw.x; } }
      if (sw.lock !== 'x') return; e.preventDefault();
      const can = (dx < 0 && vi(view) < VIEWS.length - 1) || (dx > 0 && vi(view) > 0); sw.dx = can ? Math.max(-sw.w, Math.min(sw.w, dx)) : dx / (3 + Math.abs(dx) / 60);
      sw.last = { dx, t: Date.now() };
      if (!sw.raf) sw.raf = requestAnimationFrame(() => { if (!sw) return; sw.raf = 0; placeTrack(false, sw.dx); placeInd(false, Math.max(0, Math.min(VIEWS.length - 1, vi(view) - sw.dx / sw.w))); }); }, { passive: false });
    const end = () => { if (!sw) return; const s = sw; sw = null; if (s.raf) cancelAnimationFrame(s.raf); if (s.lock !== 'x') return;
      const v = Math.abs(s.dx) / Math.max(1, Date.now() - s.t), go = ((s.dx < 0 && vi(view) < VIEWS.length - 1) || (s.dx > 0 && vi(view) > 0)) && (Math.abs(s.dx) > s.w * .3 || v > .45);
      if (go) switchView(VIEWS[vi(view) + (s.dx < 0 ? 1 : -1)]); else { placeInd(true); placeTrack(true); const tr = root.querySelector('.hub-track'); if (tr) tr.querySelectorAll('.hub-pane:not(.on)').forEach(p => { p._y = null; }); } };
    document.addEventListener('touchend', end); document.addEventListener('touchcancel', end); }
  function draw() {
    if (page === 'party' || page === 'join') { if (PM_) PM_.refresh(); return; }
    const SH = view === 'shared', mine = chars.filter(isMine), shared = chars.filter(c => !isMine(c)), groups = {};
    shared.forEach(c => { const k = NAMES[c.owner] || (c.player || '').trim() || c.owner || 'No player yet'; (groups[k] = groups[k] || []).push(c); });
    const keys = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    const byName = (a, b) => (a.name || '').localeCompare(b.name || '');
    const noList = k => { try { return !lists[k]; } catch (e) { return true; } }; // (draw can run before the lists exist)
    const sharedHTML = keys.length ? keys.map(k => { const isOpen = open[k] != null ? open[k] : true; return `<details class="hub-folder" data-k="${esc(k)}" ${isOpen ? 'open' : ''}><summary><span class="hf-caret">▸</span><span class="hf-name">${esc(k)}</span><span class="hf-n">${groups[k].length}</span></summary>
        <div class="hf-body">${groups[k].sort(byName).map(card).join('')}</div></details>`; }).join('')
        : !SH_LOADED && noList('shared') ? SKEL.rows(3) : `<p class="hub-empty">Nothing has been shared with you yet. When another player shares a character with ${esc(EMAIL)}, it shows up here.</p>`;
    const mineHTML = noList('mine') && !mine.length ? SKEL.rows(4) : mine.length ? `<div class="hl">${mine.sort(ord).map(row).join('')}</div>` : `<p class="hub-empty">You don’t have any characters yet — create one, or ask whoever has yours to give it to you.</p>`;
    const TABS = true;
    const idx = vi(view), pane = (k, html) => `<div class="hub-pane${idx === vi(k) ? ' on' : ' hp-off'}" data-pane="${k}">${html}</div>`, tab = (k, t, n) => `<button role="tab" class="${idx === vi(k) ? 'on' : ''}" data-view="${k}">${t} <span>${n}</span></button>`;
    const body = TABS ? `<div class="hub-track">${pane('mine', mineHTML)}${pane('parties', PMx().paneHTML())}${pane('shared', sharedHTML)}</div>` : mineHTML;
    const seg = TABS ? `<div class="hub-seg" role="tablist"><span class="hv-ind" aria-hidden="true"></span>${tab('mine', 'My characters', mine.length)}${tab('parties', 'Parties', PMx().count())}${tab('shared', 'Shared with me', shared.length)}</div>` : '';
    const keepLogo = root.querySelector('.hub-logo');
    root.innerHTML = `<div class="hub-head"><header class="hub-top">${logoHTML()}
      <div class="hub-side"><div class="hub-prof"><button class="hp-pic" id="me-pic" title="Choose your picture" aria-label="Choose your picture">${(a => avaHTML(myName(), EMAIL, a.pic, '', '', a))(myAva())}<span class="hp-edit" aria-hidden="true">✎</span></button>
        <div class="hp-txt"><span class="hp-name"><b>${esc(myName())}</b><button class="hp-rename" id="me-rename" title="Change your name" aria-label="Change your name"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg></button></span><small>${esc(EMAIL)}</small><div class="hp-row"><button class="linkbtn" id="me-out">Sign out</button>${themeBtnHTML()}${IS_ADMIN ? '<button class="hub-admin hub-chip" id="hub-admin"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg><span>Admin</span></button>' : '<a class="hub-ctlink" href="#contact">Contact us</a>'}</div></div></div></div></header>
      <div class="hub-views${TABS ? '' : ' no-seg'}">${seg}${a2hsHTML()}<button class="hub-new" id="hub-new"><span class="hn-plus" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span><span class="hn-txt"><b>Create character</b></span></button></div>
      </div><div class="hub-list">${body}</div>`;
    if (keepLogo) { const n = root.querySelector('.hub-logo'); if (n) n.replaceWith(keepLogo); }
    PMx().wirePane();
    newBtn(); wireA2HS(root);
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
  if (page === 'party') PMx().partyPage(ctx.party); else if (page === 'join') PMx().joinPage(ctx.join); else draw();
  // Everyone — admins too — sees their own characters plus the ones shared with them. Admins find the rest in Admin.
  const LISTS_LS = 'pg-hublists:' + EMAIL;
  const lists = (() => { try { const c = JSON.parse(localStorage.getItem(LISTS_LS) || 'null'); return c && c.mine ? c : {}; } catch (e) { return {}; } })();
  let listsT = null; const keepLists = () => { clearTimeout(listsT); listsT = setTimeout(() => { try { let v = JSON.stringify({ mine: lists.mine || [], shared: lists.shared || [] }); if (v.length > 1500000) return; localStorage.setItem(LISTS_LS, v); } catch (e) {} }, 1000); };
  const readyNow = () => { if (window.pgReady && lists.mine && lists.shared && page !== 'party' && page !== 'join' && !ADMIN) window.pgReady(); };
  const merge = () => { const m = new Map(); Object.values(lists).forEach(l => l.forEach(c => m.set(c.id, c))); chars = [...m.values()]; if (!RD) draw();
    if (IS_ADMIN) needNames(chars.filter(c => !isMine(c)).map(c => c.owner)).then(() => { if (!RD) draw(); });
    if (ME && ME.picChar) { const ch = chars.find(c => c.id === ME.picChar); if (ch && (ch.thumb || '') !== (ME.pic || '')) { ME.pic = ch.thumb || ''; usersCol.doc(EMAIL).update({ pic: ME.pic }).catch(() => {}); } } };
  const failed = e => { root.innerHTML = `<p class="hub-empty">Couldn't load the character list (${esc(e.code || e.message || e)}).<br><br>Signed in as ${esc(EMAIL)} · <button class="linkbtn" onclick="pgSignOut()">Sign out</button></p>`; console.error(e); };
  const watch = (k, q) => q.onSnapshot(qs => { lists[k] = qs.docs.map(d => Object.assign({ id: d.id }, d.data())); if (k === 'shared') SH_LOADED = true; merge(); keepLists(); readyNow(); }, e => { if (window.pgReady) window.pgReady(); failed(e); });
  if (lists.mine) { SH_LOADED = true; merge(); readyNow(); }
  watch('mine', charsCol.where('owner', '==', EMAIL)); watch('shared', charsCol.where('viewers', 'array-contains', EMAIL));
  setInterval(() => { if (!RD) draw(); }, 60000);

  // ================= Admin section (its own page: ?g=…&admin=1) =================
  function adminSection() {
    setTimeout(() => { if (window.pgReady) window.pgReady(); }, 1500); // at the latest
    if (!window.PG_NF) { window.PG_NF = 1; document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-newfor]'); if (b) pgGo(URLS.newChar(G, b.dataset.newfor, nameOf(b.dataset.newfor))); }); }
    const UREF = usersCol.doc(EMAIL); let CHECKED = Number(ME && ME.checkedAt) || 0;
    // Who the owner is (their record says so) and who's left out of notice numbers (config/quiet) — both from the database.
    const cfgCol = fs.collection('config'), OWNERS = new Set(IS_OWNER ? [EMAIL] : []); let QUIET = new Set();
    const ownerEm = em => OWNERS.has(em) || !!((US[em] || {}).owner), seeOwners = list => list.forEach(u => { if (u && u.owner) OWNERS.add(u.id); });
    const quietP = cfgCol.doc('quiet').get().then(d => { QUIET = new Set(((d.exists && d.data().emails) || []).map(x => String(x).toLowerCase())); }, () => {});
    quietP.then(() => { if (TAB === 'users') paintUsers(); });
    const UF0 = { role: '', act: '', joined: '' };
    const T0 = ctx.tab === 'characters' ? 'chars' : ctx.tab; let TAB = ['users', 'chars', 'parties', 'new', 'audit', 'bugs', 'notice', 'welcome'].includes(T0) ? T0 : 'users'; if (T0 === 'admins') UF0.role = 'admin';
    const CH = {}, US = {}; // characters and accounts on screen
    let NEWN = null, BUGN = 0;
    const setTab = t => { TAB = t; history.replaceState(null, '', URLS.admin(G, t === 'chars' ? 'characters' : t)); frame(); };
    const ic = {
      audit: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
      users: '<path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1"/><circle cx="9" cy="7" r="3.5"/><path d="M22 19v-1a4 4 0 0 0-3-3.9M16 3.5a3.5 3.5 0 0 1 0 7"/>',
      chars: '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/><path d="M8 8h6"/>',
      parties: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2.5 20c.6-3.3 2.8-5.5 5.5-5.5s4.9 2.2 5.5 5.5M10.5 20c.6-3.3 2.8-5.5 5.5-5.5s4.9 2.2 5.5 5.5"/>',
      admins: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
      bugs: '<path d="M9 7.5V6a3 3 0 0 1 6 0v1.5"/><rect x="7" y="7.5" width="10" height="12.5" rx="5"/><path d="M12 11v9M3.5 13H7M17 13h3.5M4.5 8l2.6 1.8M19.5 8l-2.6 1.8M4.5 19.5l2.8-2M19.5 19.5l-2.8-2"/>',
      welcome: '<path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>',
      notice: '<path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.8 6a8.5 8.5 0 0 1 0 12"/>',
      new: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>' };
    const svg = (k, n = 18) => `<svg viewBox="0 0 24 24" width="${n}" height="${n}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic[k]}</svg>`;
    const PAGES = { users: ['Users', 'Everyone who has signed in, most recently active first. Search or filter by role, activity or when they joined; rename someone, make them an admin, or look at their characters.'],
      chars: ['Characters', 'Every character on the site, newest activity first. Search or filter by player, sharing or last update; share any of them with yourself, or open, share, move or delete them.'],
      parties: ['Parties', 'Every party on the site, most recently active first. Change who the DM is, choose which ones show in your own list, or open or delete any of them.'],
      admins: ['Admins', 'Admins can open and edit every character, manage users and see new accounts.'],
      new: ['New', 'Accounts and characters that appeared since you last marked this as read.'],
      bugs: ['Bug reports', 'What people have reported with the bug button (on a sheet, or in Contact us), newest first; new ones show up the moment they’re sent. Mark one fixed and its sender gets a note in the corner of whatever page they have open — or the next time they open the site.'],
      welcome: ['Welcome', 'What every new account sees the first time it signs in. If a notice is out, a Next button takes them on to it. Off until you turn it on.'],
      notice: ['Notice', 'A message to everyone: it pops up once for every account, from “Adventurer’s Tome” (nobody sees who sent it), right away if they have the site open, otherwise the next time they do.'],
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
    const roleOf = em => ownerEm(em) ? ['Owner', 'r-own'] : ADMINS.includes(em) ? ['Admin', 'r-adm'] : ['Member', 'r-mem'];
    const when = t => t ? `<span title="${esc(new Date(t).toLocaleString())}">${esc(day(t))}</span>` : '<span class="adm-dim">—</span>';
    const kebab = items => `<div class="adm-mwrap"><button class="adm-kebab" aria-label="More actions">⋯</button><div class="adm-mlist">${items.map(([k, t, id, cls]) => `<button data-mi="${k}" data-id="${esc(id)}"${cls ? ` class="${cls}"` : ''}>${t}</button>`).join('')}</div></div>`;

    const PANES = {}; let PREV_TAB = '';
    // Phones: the tabs sit at the bottom of the screen like the sheet's tab bar (same height setting), with a highlight
    // that slides between tabs and can be dragged along the bar.
    const PHONE = matchMedia('(max-width: 860px)');
    let NAV_PREV = null, NAV_KEY = null;
    try { const v = localStorage.getItem('dnd-tablift'); document.documentElement.style.setProperty('--tablift', (v != null && v !== '' ? Number(v) || 0 : STANDALONE ? 24 : 0) + 'px'); } catch (e) { document.documentElement.style.setProperty('--tablift', STANDALONE ? '24px' : '0px'); }
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
      const nav = (k, label) => `<button class="adm-ni${TAB === k ? ' on' : ''}" data-tab="${k}">${svg(k)}<span>${label}</span>${k === 'new' && NEWN ? `<b class="adm-badge">${NEWN}</b>` : k === 'bugs' && BUGN ? `<b class="adm-badge">${BUGN}</b>` : ''}</button>`;
      const [title, desc] = PAGES[TAB];
      const navHTML = `<div class="adm-sec">Manage</div>${nav('users', 'Users')}${nav('chars', 'Characters')}${nav('parties', 'Parties')}<div class="adm-sec">Activity</div>${nav('audit', 'Audit log')}${nav('new', 'New')}${nav('bugs', 'Bug reports')}<div class="adm-sec">Announce</div>${nav('notice', 'Notice')}${nav('welcome', 'Welcome')}`;
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
          ({ new: () => tabNew(), users: () => paintUsers(), chars: () => paintChars(), parties: () => tabParties(), audit: () => paintAudit(), notice: () => tabNotice(), welcome: () => tabWelcome(), bugs: () => paintBugs() })[TAB](); return; }
        const nb = document.createElement('section'); nb.id = 'ad-body'; nb.className = 'adm-body'; nb.innerHTML = '<div class="sk-auto" data-n="6"></div>';
        const nh = document.createElement('div'); nh.id = 'adm-hact'; nh.className = 'adm-hact';
        if (again) { curB.replaceWith(nb); curH.replaceWith(nh); } else { curB.replaceWith(nb); curH.replaceWith(nh); } delete PANES[TAB]; PREV_TAB = TAB;
        nv0.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => setTab(b.dataset.tab));
        const on = nv0.querySelector('.adm-ni.on'); if (on && on.scrollIntoView) { const r = on.getBoundingClientRect(), nr = nv0.getBoundingClientRect(); if (r.left < nr.left || r.right > nr.right) nv0.scrollBy({ left: r.left < nr.left ? r.left - nr.left - 12 : r.right - nr.right + 12, behavior: 'smooth' }); }
        ({ new: tabNew, users: tabUsers, chars: tabChars, parties: tabParties, audit: tabAudit, notice: tabNotice, welcome: tabWelcome, bugs: tabBugs })[TAB](); return; }
      const keepLogo = root.querySelector('.hub-logo');
      root.innerHTML = `<div class="adm"><aside class="adm-side">
          <div class="adm-brand">${logoHTML()}</div>
          <div class="adm-backrow"><a class="adm-back" href="${esc(HUB)}">← Adventurer’s Tome</a></div>
          <nav class="adm-nav">${navHTML}</nav>
          <div class="adm-foot adm-me">${(a => avaHTML(myName(), EMAIL, a.pic, '', '', a))(avaOf(ME))}<div class="adm-me-t"><b>${esc(myName())}</b><small>${esc(EMAIL)}</small><button class="linkbtn" id="adm-out">Sign out</button></div></div></aside>
        <main class="adm-main"><header class="adm-head"><div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div><div class="adm-hact" id="adm-hact"></div></header>
          <section id="ad-body" class="adm-body"><div class="sk-auto" data-n="6"></div></section></main></div>`;
      if (keepLogo) { const n = root.querySelector('.hub-logo'); if (n) n.replaceWith(keepLogo); }
      PREV_TAB = TAB;
      root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => setTab(b.dataset.tab));
      { const o = root.querySelector('#adm-out'); if (o) o.onclick = signOut; }
      ({ new: tabNew, users: tabUsers, chars: tabChars, parties: tabParties, audit: tabAudit, notice: tabNotice, welcome: tabWelcome, bugs: tabBugs })[TAB]();
    }
    const B = () => root.querySelector('#ad-body'), HA = () => root.querySelector('#adm-hact');
    // ⋯ menus float above everything (moved to the top of the page while open), so a table never grows a scrollbar for them.
    let MENU = null;
    const closeAdmMenus = () => { const m = MENU; if (!m) return; MENU = null; m.w.classList.remove('on'); const l = m.l; l.classList.add('closing'); l.classList.remove('on');
      setTimeout(() => { l.classList.remove('closing', 'portal'); l.style.left = l.style.top = ''; if (m.w.isConnected) m.w.appendChild(l); else l.remove(); if (MENU_PENDING) { const f = MENU_PENDING; MENU_PENDING = null; f(); } }, PG_CALM ? 0 : 130); };
    let MENU_PENDING = null, WIN_WAIT = 0; const whenMenusClosed = f => { if (MENU) MENU_PENDING = f; else if (document.querySelector('.hub-modal.on')) { clearTimeout(WIN_WAIT); WIN_WAIT = setTimeout(() => whenMenusClosed(f), 400); } else f(); }; // a window is open: redraw once it closes
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
        <td class="adm-act">${kebab([['open', 'Open', c.id], ['share', 'Share…', c.id], ['give', 'Give to another player…', c.id], ['del', 'Delete character…', c.id, 'danger']])}</td></tr>`; }
    function wire(el, redo) {
      el.querySelectorAll('[data-me]').forEach(sl => sl.onchange = async () => { const c = CH[sl.dataset.me]; if (!c) return; const v = sl.value;
        const V = (c.viewers || []).filter(x => x !== EMAIL), E = (c.editors || []).filter(x => x !== EMAIL);
        try { await setAccess(c, v ? [...V, EMAIL] : V, v === 'edit' ? [...E, EMAIL] : E); toast(v ? (c.name || 'It') + ' is shared with you (' + (v === 'edit' ? 'can edit' : 'view only') + ').' : 'Stopped sharing ' + (c.name || 'it') + ' with you.'); }
        catch (x) { toast('Couldn\'t change it: ' + (x.message || x)); sl.value = myAccess(c) === 'own' ? '' : myAccess(c); } });
      el.querySelectorAll('[data-mi]').forEach(b => b.onclick = () => { const c = CH[b.dataset.id]; closeAdmMenus(); if (!c) return;
        ({ open: () => { pgGo(URLS.char(c)); }, share: () => shareChar(c, Object.assign(() => {}, { refresh: redo })), give: () => moveChar(c, redo), del: () => deleteChar(c, redo, true) })[b.dataset.mi](); });
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
    // Online people keep their places: whoever comes online joins the bottom of the online group, and only moves again
    // after going offline and coming back.
    const ONR = window.PG_ONRANK || (window.PG_ONRANK = { n: 0, r: {} });
    const onRank = u => { if (!isOn(u)) { delete ONR.r[u.id]; return 0; } if (ONR.r[u.id] == null) ONR.r[u.id] = ++ONR.n; return ONR.r[u.id]; };
    const fsel = (id, label, opts, val) => `<label class="adm-fsel${val ? ' on' : ''}"><span>${label}</span><select id="${id}">${opts.map(([v, t]) => `<option value="${v}"${v === val ? ' selected' : ''}>${t}</option>`).join('')}</select></label>`;
    async function tabUsers() {
      const el = B(); HA().innerHTML = '';
      el.innerHTML = `<div class="adm-filters">${toolbar('ad-uq', 'Search by name or email', UQ)}<div class="adm-fsels">
          ${fsel('uf-role', 'Role', [['', 'Anyone'], ['owner', 'Owner'], ['admin', 'Admins'], ['member', 'Members'], ['blocked', 'Blocked']], UF.role)}
          ${fsel('uf-act', 'Active', [['', 'Any time'], ['on', 'Online now'], ['1', 'Today'], ['7', 'This week'], ['30', 'This month'], ['old', 'Not in 30+ days']], UF.act)}
          ${fsel('uf-join', 'Joined', [['', 'Any time'], ['7', 'Past week'], ['30', 'Past month']], UF.joined)}</div></div><div id="ad-ul"><div class="sk-auto" data-n="6"></div></div>`;
      const q = el.querySelector('#ad-uq'); let t = null; q.oninput = () => { clearTimeout(t); t = setTimeout(() => { UQ = q.value; paintUsers(); }, 150); }; if (!UQ && !TOUCH) q.focus();
      [['uf-role', 'role'], ['uf-act', 'act'], ['uf-join', 'joined']].forEach(([id, k]) => { const sl = el.querySelector('#' + id); sl.onchange = () => { UF[k] = sl.value; sl.parentElement.classList.toggle('on', !!sl.value); paintUsers(); }; });
      if (!ULIVE) ULIVE = usersCol.limit(1000).onSnapshot(qs => { UROWS = docs(qs); UROWS.forEach(u => { US[u.id] = u; remember(u.id, u); }); if (APEOPLE) APEOPLE = UROWS.slice().sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
        if (TAB === 'users') paintUsers(); if (TAB === 'new' && qs.docChanges().some(ch => ch.type !== 'modified')) newSoon(); }, x => { const l = B().querySelector('#ad-ul'); if (l) l.innerHTML = failMsg(x); });
      else paintUsers();
    }
    setInterval(() => { if (TAB === 'users' && !document.hidden) paintUsers(); }, 30000); // "Online now" comes and goes with time too
    const roleKey = u => u.banned ? 'blocked' : ownerEm(u.id) ? 'owner' : ADMINS.includes(u.id) ? 'admin' : 'member';
    function paintUsers() { if (window.pgReady && (typeof UROWS === 'undefined' || UROWS.length || AROWS.length)) setTimeout(window.pgReady, 60);
      const l = B() && B().querySelector('#ad-ul'); if (!l) return; if (MENU || document.querySelector('.hub-modal.on')) return whenMenusClosed(paintUsers);
      const q = UQ.trim().toLowerCase(), now = Date.now(), dayN = n => now - n * 864e5;
      UROWS.forEach(u => { if (!isOn(u)) delete ONR.r[u.id]; });
      UROWS.filter(u => isOn(u) && ONR.r[u.id] == null).sort((a, b) => ONR.n ? (a.seenAt || 0) - (b.seenAt || 0) : String(a.name || a.id).localeCompare(String(b.name || b.id))).forEach(u => { ONR.r[u.id] = ++ONR.n; });
      const rows = UROWS.filter(u => (!q || (String(u.name || '') + ' ' + u.id).toLowerCase().includes(q))
          && (!UF.role || roleKey(u) === UF.role || (UF.role === 'admin' && roleKey(u) === 'owner'))
          && (!UF.act || (UF.act === 'on' ? isOn(u) : UF.act === 'old' ? !(u.seenAt > dayN(30)) : u.seenAt > dayN(Number(UF.act))))
          && (!UF.joined || u.createdAt > dayN(Number(UF.joined))))
        .sort((a, b) => (isOn(b) - isOn(a)) || (isOn(a) ? onRank(a) - onRank(b) : ((b.seenAt || 0) - (a.seenAt || 0))) || String(a.name || a.id).localeCompare(String(b.name || b.id)));
      const cnt = B().querySelector('#ad-uq-n'); if (cnt) cnt.textContent = rows.length + ' of ' + UROWS.length + ' user' + (UROWS.length === 1 ? '' : 's') + (UROWS.filter(isOn).length ? ' · ' + UROWS.filter(isOn).length + ' online' : '');
      const seen = u => isOn(u) ? '<span class="adm-online" title="Has Adventurer’s Tome open right now"><i></i>Online now</span>' : u.seenAt ? esc(ago(u.seenAt)) : '<span class="adm-dim">—</span>';
      l.innerHTML = rows.length ? `<div class="adm-tw"><table class="adm-t"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Last active</th><th></th><th></th></tr></thead><tbody>${rows.map(u => { const [rl, rc] = u.banned ? ['Blocked', 'r-blk'] : roleOf(u.id), open = UOPEN.has(u.id);
          return `<tr data-u="${esc(u.id)}"><td><span class="adm-who">${ava(u.name, u.id)}<b>${esc(u.name || '—')}</b></span></td><td class="adm-mail">${esc(u.id)}</td><td><span class="adm-tag ${rc}">${rl}</span></td><td>${when(u.createdAt)}</td><td>${seen(u)}</td>
            <td><button class="adm-btn sm" data-uc="${esc(u.id)}">Characters ${open ? '▾' : '▸'}</button></td><td class="adm-act">${kebab([['msg', 'Send a message…', u.id], ['welcome', 'Show welcome message again', u.id], ['renotice', 'Show the notice again', u.id], ['quiet', QUIET.has(u.id) ? 'Count in notice numbers' : 'Leave out of notice numbers', u.id], ['reload', 'Refresh their page', u.id], ['rename', 'Rename…', u.id], ['pic', 'Change picture…', u.id], ['newfor', 'New character for them', u.id]].concat(IS_OWNER && !ownerEm(u.id) ? [ADMINS.includes(u.id) ? ['unadmin', 'Remove admin', u.id] : ['mkadmin', 'Make admin', u.id]] : [], ownerEm(u.id) || u.id === EMAIL ? [] : [['signout', 'Sign out everywhere', u.id]].concat(u.banned ? [['unblock', 'Unblock', u.id]] : [], [['delacct', 'Delete account…', u.id, 'danger']])))}</td></tr>
            <tr class="adm-subrow" data-sub="${esc(u.id)}"${open ? '' : ' hidden'}><td colspan="7"></td></tr>`; }).join('')}</tbody></table></div>`
        : `<p class="adm-empty">${UROWS.length ? 'Nobody matches these filters.' : 'No accounts yet.'}</p>`;
      const fill = async (em, cell, fresh) => { const show = cs => { cell.innerHTML = ctable(cs, false) + `<button class="adm-btn sm" data-newfor="${esc(em)}">＋ New character for ${esc(nameOf(em))}</button>`; wire(cell, () => fill(em, cell, true)); };
        if (UCH[em] && !fresh) return show(UCH[em]); cell.innerHTML = '<div class="sk-auto" data-n="6"></div>';
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
        if (act === 'quiet') { const on = !QUIET.has(em); await cfgCol.doc('quiet').set({ emails: on ? FV.arrayUnion(em) : FV.arrayRemove(em) }, { merge: true }); on ? QUIET.add(em) : QUIET.delete(em);
          toast(nm + (on ? ' is left out of' : ' is counted in') + ' notice and welcome numbers.'); done(); return; }
        if (act === 'welcome') { await ref.update({ welcomeSeen: FV.delete(), welcomeReset: Date.now() }); pgLog('welcome_reset', { target: em, tName: nm }); toast(nm + ' will see the welcome message again' + (await cfgCol.doc('welcome').get().then(d => d.exists && d.data().on, () => true) ? '.' : ' once you turn it on (Notice tab).')); return; }
        // the notice that's out pops up for them again (also on a device where they've already closed it)
        if (act === 'renotice') { const n = await cfgCol.doc('notice').get().then(d => d.exists ? d.data() : null, () => null); if (!n || !n.id || !n.text) { toast('There’s no notice out right now.'); return; }
          const m = Object.assign({ id: n.id, text: n.text, at: n.at || Date.now(), anon: true, rs: Date.now() }, n.w ? { w: n.w } : {});
          await ref.update({ notice: m, noticeSeen: FV.delete() }); pgLog('notice_resend', { target: em, tName: nm }); toast(nm + ' will see the notice again' + (US[em] && US[em].seenAt && Date.now() - US[em].seenAt < 4 * 60000 ? ' right away.' : ' the next time they open Adventurer’s Tome.')); return; }
        if (act === 'reload') { await ref.update({ reloadAt: Date.now() }); toast(nm + '’s open pages will refresh now.'); pgLog('user_reload', { target: em, tName: nm }); return; }
        if (act === 'msg') { const last = u.msg && u.msg.text ? `<p class="hub-hint pm-last">Last message (${esc(new Date(u.msg.at || 0).toLocaleString())}) · ${u.msgSeen && u.msgSeen === u.msg.id ? '<b>seen</b>' : 'not seen yet'}:<br>“${esc(String(u.msg.text).slice(0, 200))}${String(u.msg.text).length > 200 ? '…' : ''}”</p>` : '';
          modal.innerHTML = `<div class="hub-card"><h2>Message ${esc(nm)}</h2><p class="hub-hint">It pops up for them on Adventurer’s Tome: right away if they have it open, otherwise the next time they do. They see it once.</p>${last}
            <textarea id="pm-t" class="ad-search pm-t" rows="5" placeholder="Your message"></textarea><label class="pm-anon"><input type="checkbox" id="pm-anon"><span><b>Send anonymously</b><small>It shows as from “Adventurer’s Tome”</small></span></label><div class="row"><button class="btn ghost" id="pm-x">Cancel</button><button class="btn gold" id="pm-ok" disabled>Send</button></div></div>`;
          modal.classList.add('on'); const ta = modal.querySelector('#pm-t'), ok = modal.querySelector('#pm-ok'); ta.focus(); ta.oninput = () => { ok.disabled = !ta.value.trim(); }; modal.querySelector('#pm-x').onclick = close;
          ok.onclick = async () => { const text = ta.value.trim().slice(0, 200000); if (!text) return; ok.disabled = true; ok.textContent = 'Sending…';
            const anon = modal.querySelector('#pm-anon').checked; // anonymous: nothing on their side says who sent it (the audit log still does)
            const m = Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, at: Date.now() }, anon ? { anon: true } : { from: EMAIL, fromName: String((ME && ME.name) || EMAIL) });
            try { await ref.update({ msg: m }); u.msg = m; US[em] = u; close(); toast((anon ? 'Anonymous message' : 'Message') + ' sent to ' + nm + '.'); pgLog('message', { target: em, tName: nm, detail: (anon ? '(anonymous) ' : '') + text }); }
            catch (x) { ok.disabled = false; ok.textContent = 'Send'; toast('Couldn’t send it: ' + ((x && x.message) || x)); } };
          return; }
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
      rename_user: 'Renamed', admin_add: 'Made an admin:', admin_remove: 'Removed admin:', user_picture: 'Changed the picture of', user_signout: 'Signed out everywhere:', user_block: 'Blocked', user_unblock: 'Unblocked', user_delete: 'Deleted the account of', message: 'Sent a message to', notice: 'Sent a notice to', notice_revoke: 'Revoked the notice to', notice_edit: 'Edited the notice to', notice_resend: 'Re-sent the notice to', welcome: 'Saved the welcome message for', welcome_off: 'Turned off the welcome message for', welcome_reset: 'Reset the welcome message for', user_reload: 'Refreshed the pages of', online: 'Came online',
      party_create: 'Created the party', party_delete: 'Deleted the party', party_add: 'Added a character to', party_join: 'Joined the party', party_leave: 'Left the party', party_remove: 'Took a character out of', party_invite: 'Invited someone to', party_send: 'Used party actions in', party_access: 'Changed their access to', party_dm: 'Handed over' };
    const AGROUPS = [['Signing in', ['signin', 'online', 'account', 'signout']], ['Parties', ['party_create', 'party_delete', 'party_add', 'party_join', 'party_leave', 'party_remove', 'party_invite', 'party_send', 'party_access', 'party_dm']], ['Characters', ['open', 'create', 'edit', 'delete', 'give', 'remove']], ['Sharing', ['share', 'unshare', 'access', 'leave']], ['Pictures', ['picture', 'user_picture']], ['Admin', ['rename_user', 'admin_add', 'admin_remove', 'user_signout', 'user_block', 'user_unblock', 'user_delete', 'message', 'notice', 'notice_resend', 'notice_revoke', 'notice_edit', 'welcome', 'welcome_off', 'welcome_reset', 'user_reload']]];
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
      el.innerHTML = `<div class="adm-filters">${toolbar('au-q', 'Search activity, people or characters', AF.q)}<div class="adm-fsels" id="au-sels"></div></div><div id="au-l"><div class="sk-auto" data-n="6"></div></div>`;
      paintAuSels();
      let t = null; const q = el.querySelector('#au-q');
      q.oninput = () => { clearTimeout(t); t = setTimeout(() => { AF.q = q.value; paintAudit(); }, 150); };
      // The log is live: new events slide in as they happen (it only keeps the past week, so all of it is here).
      if (!ALIVE) ALIVE = auditCol.orderBy('at', 'desc').limit(1500).onSnapshot(qs => { AROWS = docs(qs); AFULL = false; if (TAB === 'audit') paintAudit(); }, x => { const l = B().querySelector('#au-l'); if (l) l.innerHTML = failMsg(x); });
      else paintAudit();
    }
    function paintAuSels() { const box = B() && B().querySelector('#au-sels'); if (!box) return;
      const seen = new Set((AROWS || []).map(e => e.by)), people = (APEOPLE || []).filter(u => seen.has(u.id) || AF.who.includes(u.id));
      (AROWS || []).forEach(e => { if (!people.some(u => u.id === e.by)) people.push({ id: e.by, name: e.byName }); });
      people.sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id)));
      const actOpts = [['', 'All']].concat(AGROUPS.flatMap(([g, ks]) => [['g:' + esc(g), esc(g)]].concat(ks.map(a => [a, ' ' + esc(actLabel(a))]))));
      box.innerHTML = fsel('au-range', 'Date', AU_RANGES.filter(r => r[0] !== 'custom').map(([v, t]) => [v, esc(t)]), AF.range === 'custom' ? '' : AF.range)
        + fsel('au-who', 'Actor', [['', 'Anyone']].concat(people.map(u => [esc(u.id), esc(u.name || u.id)])), AF.who[0] || '')
        + fsel('au-act', 'Activity', actOpts, AF.act.length > 1 ? 'g:' + ((AGROUPS.find(([, ks]) => ks.length === AF.act.length && ks.every(a => AF.act.includes(a))) || [''])[0]) : AF.act[0] || '');
      const on = (id, f) => { const sl = box.querySelector('#' + id); sl.onchange = () => { f(sl.value); sl.parentElement.classList.toggle('on', !!sl.value); paintAudit(); }; };
      on('au-range', v => { AF.range = v; }); on('au-who', v => { AF.who = v ? [v] : []; });
      on('au-act', v => { AF.act = !v ? [] : v.startsWith('g:') ? ((AGROUPS.find(([g]) => g === v.slice(2)) || [0, []])[1]).slice() : [v]; }); }
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
    function paintAudit() { if (window.pgReady && (typeof UROWS === 'undefined' || UROWS.length || AROWS.length)) setTimeout(window.pgReady, 60);
      const l = B() && B().querySelector('#au-l'); if (!l || !AROWS) return;
      const rows = auFiltered();
      const what = e => { const lab = esc(ACTS[e.act] || e.act); if (!e.target) return lab;
        if (CHAR_ACTS.has(e.act)) return e.act === 'delete' || e.act === 'remove' ? `${lab} <b>${esc(e.tName || 'a character')}</b>` : `${lab} <a href="${esc(URLS.byId(e.target))}">${esc(e.tName || 'a character')}</a>`;
        return `${lab} <b>${esc(e.tName || e.target)}</b>`; };
      const dt = t => { const d = new Date(t); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' }) + ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); };
      const ago = t => { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' hr ago' : Math.round(m / 1440) + ' d ago'; };
      const grpOf = a => (AGROUPS.find(([, ks]) => ks.includes(a)) || ['Other'])[0];
      // details in plain words: party actions by name, picture kinds spelled out, email addresses shown as people's names
      const KIND = { hit: 'Damage', heal: 'Healing', temp: 'Temporary HP', cond: 'A condition', cure: 'Ended a condition', note: 'A message', give: 'An item', item: 'An item', coins: 'Coins', help: 'Help', stab: 'Stabilize', spell: 'A spell', ability: 'An ability', save: 'A saving throw', dmg: 'Damage' };
      const PICM = { google: 'their Google picture', initials: 'their initials', upload: 'an uploaded picture', char: 'a character’s portrait' };
      const nice = e => { let d = String(e.detail || ''); if (!d) return '';
        if (e.act === 'party_send') d = d.replace(/^(\w+)\s*→\s*/, (m, k) => (KIND[k] || (k[0].toUpperCase() + k.slice(1))) + ' for ');
        if (e.act === 'picture' || e.act === 'user_picture') d = 'Now using ' + (PICM[d] || d);
        if (e.act === 'party_dm') d = d.replace(/^DM is now /, 'New DM: ');
        d = d.replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, em => NAMES[em] || em); return d[0].toUpperCase() + d.slice(1); };
      const det = e => `<dl class="au-dl"><dt>Date</dt><dd>${esc(new Date(e.at).toLocaleString())}</dd><dt>Actor</dt><dd>${esc(e.byName || '—')} <span class="adm-dim">${esc(e.by)}</span></dd>
          <dt>Activity</dt><dd>${esc(ACTS[e.act] || e.act)} <span class="au-cat">${esc(grpOf(e.act))}</span></dd>${e.target ? `<dt>${CHAR_ACTS.has(e.act) ? 'Character' : 'Target'}</dt><dd>${CHAR_ACTS.has(e.act) && e.act !== 'delete' && e.act !== 'remove' ? `<a href="${esc(URLS.byId(e.target))}">${esc(e.tName || e.target)}</a>` : esc(e.tName || e.target)}</dd>` : ''}
          ${e.detail ? `<dt>Details</dt><dd class="au-dd">${esc(nice(e))}</dd>` : ''}<dt>Event ID</dt><dd class="adm-dim au-id">${esc(e.id)}</dd></dl>`;
      const cnt = B().querySelector('#au-q-n'); if (cnt) cnt.textContent = rows.length + ' of ' + AROWS.length + ' event' + (AROWS.length === 1 ? '' : 's');
      if (!B().querySelector('#au-sels select:focus')) paintAuSels();
      l.innerHTML = rows.length ? `<div class="adm-tw"><table class="adm-t au-t2"><thead><tr><th>Date</th><th>Actor</th><th>Activity</th><th>Category</th><th></th></tr></thead><tbody>${rows.map(e => `<tr class="au-r${AOPEN[e.id] ? ' open' : ''}" data-id="${esc(e.id)}" tabindex="0" aria-expanded="${!!AOPEN[e.id]}">
          <td class="au-c-d"><span title="${esc(new Date(e.at).toLocaleString())}">${esc(ago(e.at))}</span><small>${esc(dt(e.at))}</small></td>
          <td><span class="adm-who">${ava(e.byName || NAMES[e.by], e.by)}<b>${esc(e.byName || e.by)}</b></span></td>
          <td class="au-c-w"><div class="au-what">${what(e)}</div>${e.detail ? `<div class="au-sub">${esc(nice(e))}</div>` : ''}</td>
          <td><span class="adm-tag au-cat">${esc(grpOf(e.act))}</span></td>
          <td class="au-c-x"><button class="adm-btn sm" tabindex="-1">Details ${AOPEN[e.id] ? '▾' : '▸'}</button></td></tr>
          ${AOPEN[e.id] ? `<tr class="adm-subrow au-x"><td colspan="5">${det(e)}</td></tr>` : ''}`).join('')}</tbody></table></div>` : `<p class="adm-empty">${AROWS.length ? 'No activity matches these filters.' : 'No activity yet.'}</p>`;
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
      el.innerHTML = `<div class="adm-filters">${toolbar('ad-cq', 'Search by character, race, class or player', CQ)}<div class="adm-fsels" id="cf-sels"></div></div><div id="ad-cl"><div class="sk-auto" data-n="6"></div></div>`;
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
    // --- Parties ---
    const PQ = { v: '' };
    // --- Notice: the same pop-up as "Send a message…", always from “Adventurer’s Tome”, to every account. One is out at a time:
    // a new one replaces it for anyone who hasn't seen it yet, and Revoke takes it back. Every notice is kept in the log.
    const noticesCol = fs.collection('notices'), FV = firebase.firestore.FieldValue;
    const NT_W = [[480, 'Narrow'], [720, 'Normal'], [960, 'Wide'], [1200, 'Extra wide']], ntWSel = (id, cur) => `<select class="adm-sel" id="${id}">${NT_W.map(([v, l]) => `<option value="${v}"${v === (Number(cur) || 720) ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
    const NT_FMT = '<p class="adm-note nt-fmt">**bold** · *italic* · <code># Heading</code> on its own line · <code>- </code> for a list · web addresses become links</p>';
    // the welcome message new accounts start with until one is saved
    const WELCOME0 = 'Hey, glad you\'re here!\n\nThis is where your D&D characters live. Make a character, keep everything on one sheet, and play from your computer or your phone.\n\n# What you can do\n- **Make a character** step by step. It walks you through everything\n- **Roll from your sheet.** Tap any attack, skill or save to roll it\n- **Spells, items and HP** are all tracked for you, rests and level ups too\n- **Share your character** with friends or your DM so they can look at it or help edit it\n- **Join a party** with your group. Heal each other, cast spells on each other and hand over loot\n- **Use Roll20?** Get the Roll20 extension in Settings → Dice and your rolls go straight into your game\n\n# Getting started\nHit **Create character** in the lobby and you\'re off. If your DM sent you a party invite link, open it and pick your character to join.\n\nHave fun!';
    const copyText = async (t, b) => { try { await navigator.clipboard.writeText(t); } catch (e) { const x = document.createElement('textarea'); x.value = t; x.style.position = 'fixed'; x.style.opacity = '0'; document.body.appendChild(x); x.select(); try { document.execCommand('copy'); } catch (e2) {} x.remove(); }
      if (b) { const t0 = b.textContent; b.textContent = 'Copied'; setTimeout(() => { b.textContent = t0; }, 1500); } };
    // You, the owner and anyone set to "Leave out of notice numbers" (Users ⋯ menu; kept in the database, not the code)
    // still get notices and the welcome, but aren't counted in "goes to" / "seen by" or listed.
    const counted = em => { em = String(em || '').toLowerCase(); return em !== EMAIL && !ownerEm(em) && !QUIET.has(em); };
    // "Who's seen it": a window listing who has (and, if given, who hasn't yet) — for notices and the welcome message
    const whoSeen = (all, text, who, not, note) => { who = who && who.filter(counted); not = not && not.filter(counted); const byId = Object.fromEntries(all.map(u => [u.id, u])); all.forEach(u => { if (!PICS[u.id]) PICS[u.id] = avaOf(u); }); // (their pictures)
      const list = ids => ids.map(id => byId[id] || { id }).sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id))).map(u => `<div class="nt-sl-row">${ava(u.name, u.id)}<span><b>${esc(u.name || u.id)}</b><small>${esc(u.id)}</small></span></div>`).join('');
      modal.innerHTML = `<div class="hub-card nt-sl"><h2>Who’s seen it</h2><p class="hub-hint">“${esc(String(text || '').slice(0, 120))}${String(text || '').length > 120 ? '…' : ''}”</p>
        ${who ? `<h4 class="pw-h4">Seen (${who.length})</h4>${who.length ? `<div class="nt-sl-wrap"><div class="nt-sl-list">${list(who)}</div></div>` : '<p class="hub-hint">Nobody yet.</p>'}` : `<p class="hub-hint">${esc(note || '')}</p>`}
        ${not ? `<h4 class="pw-h4">Not seen yet (${not.length})</h4>${not.length ? `<div class="nt-sl-wrap"><div class="nt-sl-list">${list(not)}</div></div>` : '<p class="hub-hint">Everyone’s seen it.</p>'}` : ''}
        <div class="row"><button class="btn gold" id="sl-x">Close</button></div></div>`;
      modal.classList.add('on'); modal.querySelector('#sl-x').onclick = close;
      // shadows at the top / bottom of a list while there's more to scroll that way
      modal.querySelectorAll('.nt-sl-list').forEach(l => { const w = l.parentElement, shade = () => { w.classList.toggle('sc-t', l.scrollTop > 2); w.classList.toggle('sc-b', l.scrollTop + l.clientHeight < l.scrollHeight - 2); }; l.addEventListener('scroll', shade, { passive: true }); shade(); }); };
    async function tabNotice() {
      const el = B(); HA().innerHTML = ''; let all = [], log = [];
      try { [all, log] = await Promise.all([usersCol.limit(2000).get().then(docs), noticesCol.orderBy('at', 'desc').limit(200).get().then(docs), quietP]); } catch (x) { el.innerHTML = failMsg(x); return; } seeOwners(all);
      const live = log.find(n => !n.endedAt) || null;
      const ppl = all.filter(u => counted(u.id)), seenWho = n => ppl.filter(u => u.noticeSeen === n.id).map(u => u.id), seenOf = n => seenWho(n).length,
        // how many it went to, not counting you or the Claude account (older notices counted everyone; they're adjusted)
        sentOf = n => n.counted ? (n.sent || 0) : Math.max(0, (n.sent || 0) - (all.length - ppl.length)), seenPast = n => n.seenBy ? n.seenBy.filter(counted).length : (n.seen || 0), gotOf = n => all.filter(u => u.notice && u.notice.id === n.id);
      const stat = n => n.endedAt ? n.ended === 'revoked' ? 'Revoked' : 'Replaced' : 'Live';
      const row = n => `<tr><td>${when(n.at)}</td><td class="nt-txt">${esc(String(n.text || '').slice(0, 240))}${String(n.text || '').length > 240 ? '…' : ''}</td><td>${esc(n.byName || n.by || '')}</td><td><button class="linkbtn nt-seen" data-ntseen="${esc(n.id)}" title="Who’s seen it">${n.endedAt ? seenPast(n) : seenOf(n)} / ${sentOf(n)}</button></td><td><span class="adm-tag">${stat(n)}</span>${n.endedAt ? `<small class="adm-dim"> ${when(n.endedAt)}</small>` : ''}</td><td class="nt-acts"><button class="adm-btn sm" data-ntpv="${esc(n.id)}">Preview</button><button class="adm-btn sm" data-ntcp="${esc(n.id)}">Copy</button></td></tr>`;
      el.innerHTML = `<div class="adm-stats"><div class="adm-stat"><small>Goes to</small><b>${ppl.length}</b></div>${live ? `<button class="adm-stat nt-seenstat" data-ntseen="${esc(live.id)}" title="Who’s seen it"><small>Current notice seen by</small><b>${seenOf(live)} / ${sentOf(live)}</b></button>` : ''}</div>
        ${live ? `<div id="nt-cur"><p class="adm-note"><b>Current notice</b> (sent ${esc(new Date(live.at).toLocaleString())}${live.editedAt ? ', edited ' + esc(new Date(live.editedAt).toLocaleString()) : ''}):<br>“${esc(String(live.text).slice(0, 400))}${String(live.text).length > 400 ? '…' : ''}”</p><div class="row"><button class="adm-btn" id="nt-ed">Edit</button><button class="adm-btn" id="nt-rv">Revoke it</button></div></div>` : '<p class="adm-note">No notice is out right now.</p>'}
        <h3 class="nt-h">New notice</h3><textarea id="nt-t" class="ad-search pm-t" rows="7" placeholder="Your notice"></textarea>${NT_FMT}
        ${live ? '<p class="adm-note">Sending it replaces the current notice for anyone who hasn’t seen it yet.</p>' : ''}<div class="row"><label class="nt-wl">Window width ${ntWSel('nt-w')}</label><button class="adm-btn" id="nt-pv" disabled>Preview</button><button class="adm-btn primary" id="nt-ok" disabled>Send to everyone</button></div>
        <h3 class="nt-h">Past notices</h3>${log.length ? `<div class="adm-tw"><table class="adm-t"><thead><tr><th>Sent</th><th>Notice</th><th>By</th><th>Seen</th><th>Status</th><th></th></tr></thead><tbody>${log.map(row).join('')}</tbody></table></div>` : '<p class="adm-dim">None yet.</p>'}`;
      // ends the live notice: takes it off everyone who still holds it, and keeps how many saw it
      const end = async (n, how) => { const hold = gotOf(n);
        for (let i = 0; i < hold.length; i += 400) { const bt = fs.batch(); hold.slice(i, i + 400).forEach(u => bt.update(usersCol.doc(u.id), { notice: FV.delete() })); await bt.commit(); }
        await noticesCol.doc(n.id).update({ endedAt: Date.now(), ended: how, seen: seenOf(n), seenBy: seenWho(n) }); if (how === 'revoked') await cfgCol.doc('notice').delete(); };
      const ta = el.querySelector('#nt-t'), ok = el.querySelector('#nt-ok'), pv = el.querySelector('#nt-pv'); ta.oninput = () => { ok.disabled = pv.disabled = !ta.value.trim(); };
      pv.onclick = () => { const text = ta.value.trim().slice(0, 200000); if (text) window.pgPreview({ text, at: Date.now(), anon: true, w: Number(el.querySelector('#nt-w').value) }, 'notice'); };
      el.querySelectorAll('[data-ntpv]').forEach(b => b.onclick = () => { const n = log.find(x => x.id === b.dataset.ntpv); if (n) window.pgPreview({ text: n.text, at: n.at, anon: true, w: n.w }, 'notice'); });
      // Copy: the notice exactly as it was typed (formatting marks and all), ready to paste back in or anywhere else
      el.querySelectorAll('[data-ntcp]').forEach(b => b.onclick = () => { const n = log.find(x => x.id === b.dataset.ntcp); if (n) copyText(String(n.text || ''), b); });
      // Edit the notice that's out: anyone who hasn't seen it yet gets the new version; anyone who has isn't shown it again
      const ed = el.querySelector('#nt-ed');
      if (ed) ed.onclick = () => { const box = el.querySelector('#nt-cur');
        box.innerHTML = `<p class="adm-note"><b>Edit the current notice.</b> People who’ve already seen it won’t see it again; everyone who hasn’t gets this version.</p>
          <textarea id="ne-t" class="ad-search pm-t" rows="9">${esc(live.text || '')}</textarea>${NT_FMT}
          <div class="row"><label class="nt-wl">Window width ${ntWSel('ne-w', live.w)}</label><button class="adm-btn" id="ne-x">Cancel</button><button class="adm-btn" id="ne-pv">Preview</button><button class="adm-btn primary" id="ne-ok">Save changes</button></div>`;
        const et = box.querySelector('#ne-t'), ev = () => ({ text: et.value.trim().slice(0, 200000), w: Number(box.querySelector('#ne-w').value) || 720 }); et.focus();
        box.querySelector('#ne-x').onclick = () => tabNotice();
        box.querySelector('#ne-pv').onclick = () => { const v = ev(); if (v.text) window.pgPreview({ text: v.text, at: live.at, anon: true, w: v.w }, 'notice'); };
        box.querySelector('#ne-ok').onclick = async e => { const v = ev(), b = e.currentTarget; if (!v.text) return toast('The notice can’t be empty.'); b.disabled = true;
          const m = { id: live.id, text: v.text, at: live.at, anon: true, w: v.w }, unseen = gotOf(live).filter(u => u.noticeSeen !== live.id);
          try { await noticesCol.doc(live.id).update({ text: v.text, w: v.w, editedAt: Date.now() }); await cfgCol.doc('notice').set(m);
            for (let i = 0; i < unseen.length; i += 400) { const bt = fs.batch(); unseen.slice(i, i + 400).forEach(u => bt.update(usersCol.doc(u.id), { notice: m })); await bt.commit(); }
            pgLog('notice_edit', { target: 'everyone', tName: 'everyone', detail: v.text }); toast('Notice updated for the ' + unseen.length + ' who haven’t seen it yet.'); }
          catch (x) { b.disabled = false; return toast('Couldn’t save it: ' + ((x && (x.code === 'permission-denied' ? 'the new database rules need publishing' : x.message)) || x)); }
          if (TAB === 'notice') tabNotice(); }; };
      // Who's seen a notice (and, while it's out, who hasn't yet)
      el.querySelectorAll('[data-ntseen]').forEach(b => b.onclick = () => { const n = log.find(x => x.id === b.dataset.ntseen); if (!n) return;
        const who = n.endedAt ? n.seenBy : seenWho(n);
        whoSeen(all, n.text, who, n.endedAt ? null : gotOf(n).map(u => u.id).filter(id => !(who || []).includes(id) && id !== EMAIL), who ? '' : 'This notice ended before the list of who saw it was kept: ' + seenPast(n) + ' people saw it.'); });
      const rv = el.querySelector('#nt-rv');
      if (rv) rv.onclick = async () => { if (!await ask('Revoke this notice?', 'It disappears for everyone who hasn’t seen it yet (and closes if it’s on their screen). It stays in the log.', 'Revoke', true)) return;
        rv.disabled = true; try { await end(live, 'revoked'); pgLog('notice_revoke', { target: 'everyone', tName: 'everyone', detail: live.text }); toast('Notice revoked.'); } catch (x) { toast('Couldn’t revoke it: ' + ((x && (x.code === 'permission-denied' ? 'the new database rules need publishing' : x.message)) || x)); } if (TAB === 'notice') tabNotice(); };
      ok.onclick = async () => { const text = ta.value.trim().slice(0, 200000); if (!text) return;
        if (!await ask('Send this notice to everyone?', `It pops up once for all ${ppl.length} accounts, from “Adventurer’s Tome”.${live ? ' It replaces the current notice for anyone who hasn’t seen it.' : ''}`, 'Send to everyone')) return;
        ok.disabled = true; ok.textContent = 'Sending…';
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6), m = { id, text, at: Date.now(), anon: true, w: Number(el.querySelector('#nt-w').value) || 720 };
        try { await noticesCol.doc(id).set({ text, w: m.w, at: m.at, by: EMAIL, byName: String((ME && ME.name) || EMAIL), sent: ppl.length, counted: true });
          if (live) await noticesCol.doc(live.id).update({ endedAt: Date.now(), ended: 'replaced', seen: seenOf(live), seenBy: seenWho(live) });
          await cfgCol.doc('notice').set(m); /* the one that's out, for accounts made after it was sent (shown after the welcome) */
          for (let i = 0; i < all.length; i += 400) { const bt = fs.batch(); all.slice(i, i + 400).forEach(u => bt.update(usersCol.doc(u.id), u.id === EMAIL ? { notice: m, noticeSeen: id } : { notice: m })); /* (the sender has seen it) */ await bt.commit(); }
          pgLog('notice', { target: 'everyone', tName: 'everyone', detail: text }); toast('Notice sent to ' + ppl.length + ' accounts.'); }
        catch (x) { ok.disabled = false; ok.textContent = 'Send to everyone'; toast('Couldn’t send it: ' + ((x && (x.code === 'permission-denied' ? 'the new database rules need publishing' : x.message)) || x)); return; }
        if (TAB === 'notice') tabNotice(); };
    }
    // --- Bug reports: live, newest first; open ones counted on the tab ---
    const bugsAdm = fs.collection('bugs'); let BROWS = null, BLIVE = null, BF = 'open', BCHECKED = Number(ME && ME.bugsCheckedAt) || 0; // (new = sent since you last marked them read, like the New tab)
    const bugBadge = () => { const t = root.querySelector('[data-tab="bugs"]'); if (!t) return; const bd = t.querySelector('.adm-badge'); if (BUGN && !bd) t.insertAdjacentHTML('beforeend', `<b class="adm-badge">${BUGN}</b>`); else if (bd) BUGN ? (bd.textContent = BUGN) : bd.remove(); };
    const bugsLive = () => { if (!BLIVE) BLIVE = bugsAdm.orderBy('at', 'desc').limit(500).onSnapshot(qs => { BROWS = docs(qs); BUGN = BROWS.filter(b => (b.at || 0) > BCHECKED).length; bugBadge(); if (TAB === 'bugs') paintBugs();
      Promise.all([...new Set(BROWS.map(b => b.by))].filter(em => em && !PICS[em]).map(picFor)).then(n => { if (n.length && TAB === 'bugs') paintBugs(); }); }, x => { const l = B() && B().querySelector('#bg-l'); if (l) l.innerHTML = failMsg(x); }); };
    const browserOf = ua => { ua = String(ua || ''); const b = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : ''; return [b, /iPhone|iPad|Android/.test(ua) ? 'phone' : ''].filter(Boolean).join(' · '); };
    function tabBugs() { const el = B(); HA().innerHTML = '';
      el.innerHTML = `<div class="adm-filters"><div class="adm-fsels"><select class="adm-sel" id="bg-f" aria-label="Show"><option value="open">Open</option><option value="fixed">Fixed</option><option value="all">All</option></select></div></div><div id="bg-l"><div class="sk-auto" data-n="6"></div></div>`;
      const f = el.querySelector('#bg-f'); f.value = BF; f.onchange = () => { BF = f.value; paintBugs(); }; bugsLive(); if (BROWS) paintBugs(); }
    function paintBugs() { const l = B() && B().querySelector('#bg-l'); if (!l || !BROWS) return;
      if (TAB === 'bugs') { HA().innerHTML = BUGN ? '<button class="adm-btn primary" id="bg-seen">Mark as read</button>' : ''; const sb = HA().querySelector('#bg-seen');
        if (sb) sb.onclick = async () => { const t = Date.now(); try { await UREF.update({ bugsCheckedAt: t }); BCHECKED = t; BUGN = 0; bugBadge(); paintBugs(); toast('Marked as read.'); } catch (x) { toast('Couldn\'t save that: ' + (x.message || x)); } }; }
      const rows = BROWS.filter(b => BF === 'all' || (BF === 'fixed' ? b.status === 'fixed' : b.status !== 'fixed'));
      l.innerHTML = rows.length ? `<div class="adm-tw"><table class="adm-t bg-t"><thead><tr><th>Reported</th><th>From</th><th>Bug</th><th>Where</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(b => `<tr>
          <td>${when(b.at)}</td><td><span class="adm-who">${ava(b.byName, b.by)}<span><b>${esc(b.byName || b.by)}</b><small class="adm-mail">${esc(b.by)}</small></span></span></td>
          <td class="bg-txt">${(b.at || 0) > BCHECKED ? '<span class="adm-tag bg-new">New</span> ' : ''}<b>${esc(b.sum)}</b>${b.desc ? `<div class="bg-desc">${esc(b.desc)}</div>` : ''}</td>
          <td class="bg-where">${b.ch ? `<b>${esc(b.ch)}</b><br>` : ''}${/^\/(?![\/\\])/.test(b.where || '/') ? `<a href="${esc(b.where || '/')}" target="_blank" rel="noopener">${esc(b.where || '/')}</a>` : esc(b.where)}${browserOf(b.ua) ? `<br><small class="adm-dim" title="${esc(b.ua)}">${esc(browserOf(b.ua))}</small>` : ''}</td>
          <td>${b.status === 'fixed' ? `<span class="adm-tag r-own">Fixed</span><br><small class="adm-dim">${when(b.fixedAt)}${b.seen ? ' · they’ve seen it' : ''}</small>` : '<span class="adm-tag">Open</span>'}</td>
          <td class="nt-acts">${b.status === 'fixed' ? `<button class="adm-btn sm" data-bg="open" data-id="${esc(b.id)}">Reopen</button>` : `<button class="adm-btn sm primary" data-bg="fixed" data-id="${esc(b.id)}">Mark fixed</button>`}<button class="adm-btn sm" data-bg="del" data-id="${esc(b.id)}">Delete</button></td></tr>`).join('')}</tbody></table></div>`
        : `<p class="adm-empty">${BF === 'fixed' ? 'Nothing marked fixed yet.' : BF === 'open' ? 'No open bug reports.' : 'No bug reports yet.'}</p>`;
      l.querySelectorAll('[data-bg]').forEach(b => b.onclick = async () => { const id = b.dataset.id, x = BROWS.find(y => y.id === id) || {}, act = b.dataset.bg; b.disabled = true;
        try { if (act === 'fixed') { await bugsAdm.doc(id).update({ status: 'fixed', fixedAt: Date.now(), fixedBy: EMAIL, seen: false }); toast('Marked fixed. ' + (x.byName || x.by || 'They') + ' will get a note.'); }
          else if (act === 'open') { await bugsAdm.doc(id).update({ status: 'open', fixedAt: FV.delete(), fixedBy: FV.delete(), seen: FV.delete() }); toast('Reopened.'); }
          else { if (!await ask('Delete this bug report?', esc(x.sum || ''), 'Delete', true)) { b.disabled = false; return; } await bugsAdm.doc(id).delete(); toast('Bug report deleted.'); } }
        catch (y) { b.disabled = false; toast('Couldn’t do that: ' + ((y && (y.code === 'permission-denied' ? 'the new database rules need publishing' : y.message)) || y)); } });
    }
    setTimeout(bugsLive, 1200); // the open count shows on the tab from any admin page
    // --- Welcome: the message every new account sees the first time it signs in (then the current notice, with Next) ---
    async function tabWelcome() {
      const el = B(); HA().innerHTML = ''; let all = [], wel = null, live = null;
      try { [all, wel, live] = await Promise.all([usersCol.limit(2000).get().then(docs), cfgCol.doc('welcome').get().then(d => d.exists ? d.data() : null, () => null), cfgCol.doc('notice').get().then(d => d.exists ? d.data() : null, () => null)]); } catch (x) { el.innerHTML = failMsg(x); return; } await quietP; seeOwners(all);
      el.innerHTML = `<div class="adm-stats"><div class="adm-stat"><small>Status</small><b>${wel && wel.on ? 'On' : 'Off'}</b></div><button class="adm-stat nt-seenstat" id="wl-seen" title="Who’s seen it"><small>Seen by</small><b>${all.filter(u => u.welcomeSeen && counted(u.id)).length}</b></button></div>
        <p class="adm-note">${wel && wel.on ? `New accounts see this the first time they sign in${live ? ', then the current notice (with a Next button)' : ''}.` : 'Nothing is shown yet. Edit the message below, check it with Preview, then <b>Save and turn on</b>.'}</p>
        <textarea id="wl-t" class="ad-search pm-t" rows="12" placeholder="Welcome message">${esc((wel && wel.text) || WELCOME0)}</textarea>${NT_FMT}
        <div class="row"><label class="nt-wl">Window width ${ntWSel('wl-w', wel && wel.w)}</label><button class="adm-btn" id="wl-pv">Preview</button><button class="adm-btn" id="wl-cp">Copy</button>${wel && wel.on ? '<button class="adm-btn" id="wl-off">Turn off</button>' : ''}<button class="adm-btn primary" id="wl-ok">${wel && wel.on ? 'Save changes' : 'Save and turn on'}</button></div>`;
      // the first-time welcome: one shared message (config/welcome) that every new account reads on its first sign-in
      const wt = el.querySelector('#wl-t'), wv = () => ({ text: wt.value.trim().slice(0, 200000), w: Number(el.querySelector('#wl-w').value) || 720 }), fail = x => toast('Couldn’t save it: ' + ((x && (x.code === 'permission-denied' ? 'the new database rules need publishing' : x.message)) || x));
      el.querySelector('#wl-pv').onclick = () => { const v = wv(); if (v.text) window.pgPreviewWelcome(Object.assign({ at: Date.now(), anon: true }, v), live ? { text: live.text, at: live.at, anon: true, w: live.w } : null); };
      el.querySelector('#wl-cp').onclick = e => copyText(wt.value, e.currentTarget);
      // seen: everyone marked seen; not yet: accounts it's waiting for (made since it was turned on, or shown again to them)
      el.querySelector('#wl-seen').onclick = () => whoSeen(all, (wel && wel.text) || wt.value, all.filter(u => u.welcomeSeen).map(u => u.id),
        wel && wel.on ? all.filter(u => !u.welcomeSeen && u.id !== EMAIL && (u.welcomeReset || (Number(u.createdAt) >= Number(wel.since || 0) && Number(u.createdAt) > Date.now() - 30 * 864e5))).map(u => u.id) : null);
      el.querySelector('#wl-ok').onclick = async e => { const v = wv(), b = e.currentTarget; if (!v.text) return toast('Write the welcome message first.'); b.disabled = true;
        try { await cfgCol.doc('welcome').set(Object.assign(v, { on: true, at: Date.now(), by: EMAIL, since: (wel && wel.since) || Date.now() })); pgLog('welcome', { target: 'new accounts', tName: 'new accounts', detail: v.text }); toast(wel && wel.on ? 'Welcome message saved.' : 'Welcome message is on: new accounts will see it.'); }
        catch (x) { b.disabled = false; return fail(x); } if (TAB === 'welcome') tabWelcome(); };
      { const off = el.querySelector('#wl-off'); if (off) off.onclick = async () => { if (!await ask('Turn the welcome message off?', 'New accounts won’t see it. The text stays here for next time.', 'Turn off')) return;
        try { await cfgCol.doc('welcome').update({ on: false }); pgLog('welcome_off', { target: 'new accounts', tName: 'new accounts' }); toast('Welcome message is off.'); } catch (x) { return fail(x); } if (TAB === 'welcome') tabWelcome(); }; }
    }
    const tabParties = () => PMx().adminTab(B, { HA, toolbar, failMsg, ava, when, kebab, PQ, closeMenus: closeAdmMenus, isTab: () => TAB === 'parties', busy: () => !!(MENU || document.querySelector('.hub-modal.on')), later: whenMenusClosed });
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

// ================= Parties =================
// A party is a DM (whoever made it — an admin or the DM can hand it to someone else), the characters in it, and a link
// that brings players in. Players join with their own characters (an existing one, or a new one made from the link),
// see each other's HP and conditions, and hand items over or cast spells on each other from their sheets. The DM (and
// any co-DMs) can open every sheet in the party and send damage, healing, loot and conditions to anyone in it.
const PTY_CONDS = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'];
const PTY_CI = { Blinded: '◌', Charmed: '♥', Deafened: '◎', Frightened: '!', Grappled: '✊', Incapacitated: '✕', Invisible: '◇', Paralyzed: '❚❚', Petrified: '▣', Poisoned: '☠', Prone: '↧', Restrained: '⛓', Stunned: '✶', Unconscious: 'z' };
const PTY_DMG = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'];
const ptyCode = () => { const a = new Uint8Array(12); crypto.getRandomValues(a); return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
// Every document of a character (big ones are split in parts) says which party it's in, so the DM can open all of it.
async function ptySetSheetParty(fs, c, pid) {
  const sh = fs.collection('sheets'), v = pid ? { party: pid } : { party: firebase.firestore.FieldValue.delete() };
  const s0 = await sh.doc(c).get(); if (!s0.exists) return; const n = Number(s0.data().n) || 1;
  await sh.doc(c).update(v); for (let k = 1; k < n; k++) await sh.doc(c + '_p' + k).update(v).catch(() => {});
}
// Take a character out of its party (its owner leaving, or the DM removing it).
async function ptyLeave(fs, EMAIL, pid, c, opts = {}) {
  const ref = fs.collection('parties').doc(pid), FV = firebase.firestore.FieldValue;
  let pd = null; try { const s = await ref.get(); pd = s.exists ? s.data() : null; } catch (e) {}
  if (pd && (pd.chars || []).includes(c)) {
    let owner = opts.owner || '';
    try { const cd = await ref.collection('cards').doc(c).get(); if (cd.exists) { owner = owner || cd.data().owner || ''; await cd.ref.delete(); } } catch (e) {}
    const cards = await ref.collection('cards').get().catch(() => null), others = cards ? cards.docs.filter(d => d.id !== c && d.data().owner === owner).length : 1;
    const keep = !owner || others > 0 || owner === pd.dm || (pd.mgrs || []).includes(owner);
    const upd = { chars: FV.arrayRemove(c), updatedAt: Date.now() };
    if (!keep) upd.people = FV.arrayRemove(owner);
    if (!opts.asMgr) upd.gone = c;
    await ref.update(upd);
  }
  if (!opts.asMgr || opts.admin) await ptySetSheetParty(fs, c, '').catch(() => {});
}
// Bring a character into a party: with the party's link (token), an email invitation, or as its DM. A character is in
// one party at a time, so joining another moves it.
// A character in a party is shared with its DM (can edit), as if its owner had shared it. Done by the owner's own
// browser: when the character joins, and whenever its sheet is opened (a new DM gets it then).
async function ptyShareDM(fs, c, dm, d) {
  if (!dm || !d || d.owner === dm || ((d.editors || []).includes(dm) && (d.viewers || []).includes(dm))) return false;
  const FV = firebase.firestore.FieldValue, acc = { viewers: FV.arrayUnion(dm), editors: FV.arrayUnion(dm) }, sh = fs.collection('sheets'), n = Number(d.n) || 1;
  await sh.doc(c).update(acc); for (let k = 1; k < n; k++) await sh.doc(c + '_p' + k).update(acc).catch(() => {});
  if (d.g) await fs.collection('groups/' + d.g + '/chars').doc(c).set(acc, { merge: true }).catch(() => {});
  return true;
}
async function ptyJoin(fs, EMAIL, pid, c, token, card) {
  const ref = fs.collection('parties').doc(pid), FV = firebase.firestore.FieldValue;
  const s0 = await fs.collection('sheets').doc(c).get(); const old = s0.exists ? s0.data().party || '' : '';
  if (old && old !== pid) await ptyLeave(fs, EMAIL, old, c).catch(() => {});
  // joining with a link that's for a set number of players: count this one, and the last one turns the link off
  let iv = null; if (token) { try { const d = await fs.collection('invites').doc(token).get(); iv = d.exists ? d.data() : null; } catch (e) {} }
  const last = iv && Number(iv.max) > 0 && Number(iv.used || 0) + 1 >= Number(iv.max);
  await ref.update(Object.assign({ chars: FV.arrayUnion(c), people: FV.arrayUnion(EMAIL), invited: FV.arrayRemove(EMAIL), via: token || '', updatedAt: Date.now() }, last ? { inv: '' } : {}));
  if (iv && Number(iv.max) > 0) await fs.collection('invites').doc(token).update({ used: FV.increment(1) }).catch(() => {});
  await ptySetSheetParty(fs, c, pid);
  if (card) await ref.collection('cards').doc(c).set(Object.assign({ owner: EMAIL, at: Date.now() }, card), { merge: true }).catch(() => {});
  try { const pd = await ref.get(), sd = await fs.collection('sheets').doc(c).get(); if (pd.exists && sd.exists && sd.data().owner === EMAIL) await ptyShareDM(fs, c, pd.data().dm, sd.data()); } catch (e) {}
}
// ----- What's sent between party members -----
// Each thing sent has its own id (ref). The character's open sheet picks it up and applies it; when nobody has that sheet
// open, the sender's browser applies it to the saved character itself (anything that needs the player — a saving
// throw, a rest, a new form — waits for them). Every applied thing remembers exactly what it changed (ptyGot), so the
// sender's Undo can take it back later even if the character has changed since.
const ptyClone = o => o == null ? o : JSON.parse(JSON.stringify(o));
function ptySnap(st) { const h = st.hp || {}; return { hp: Number(h.cur) || 0, temp: Number(h.temp) || 0, death: ptyClone(st.death || { s: 0, f: 0 }), conds: (st.conditions || []).slice(), exh: Number(st.exhaustion) || 0, insp: Number(st.insp) || 0,
  cur: ptyClone(st.currency || {}), fx: ptyClone(st.effects || []), items: (st.inventory || []).map(it => [it.id, Number(it.qty) || 1]), form: ptyClone(st.form || null) }; }
function ptyDiff(b, st) { const a = ptySnap(st), r = {};
  if (a.hp !== b.hp) r.hp = a.hp - b.hp; if (a.temp !== b.temp) r.temp = [b.temp, a.temp];
  if (JSON.stringify(a.death) !== JSON.stringify(b.death)) r.death = b.death;
  const add = a.conds.filter(c => !b.conds.includes(c)), rm = b.conds.filter(c => !a.conds.includes(c)); if (add.length) r.addC = add; if (rm.length) r.rmC = rm;
  if (a.exh !== b.exh) r.exh = a.exh - b.exh; if (a.insp !== b.insp) r.insp = a.insp - b.insp;
  const cur = {}; ['cp', 'sp', 'ep', 'gp', 'pp'].forEach(k => { const d = (Number(a.cur[k]) || 0) - (Number(b.cur[k]) || 0); if (d) cur[k] = d; }); if (Object.keys(cur).length) r.cur = cur;
  const bj = new Map(b.fx.map(e => [e.name, JSON.stringify(e)])), aj = new Map(a.fx.map(e => [e.name, JSON.stringify(e)]));
  const addF = a.fx.filter(e => bj.get(e.name) !== aj.get(e.name)).map(e => e.name), rmF = b.fx.filter(e => aj.get(e.name) !== bj.get(e.name)); if (addF.length) r.addF = addF; if (rmF.length) r.rmF = rmF;
  const bi = new Map(b.items), items = []; a.items.forEach(([id, q]) => { const was = bi.get(id); if (was == null) items.push([id, q]); else if (q > was) items.push([id, q - was]); }); if (items.length) r.items = items;
  if (JSON.stringify(a.form) !== JSON.stringify(b.form)) r.form = [b.form];
  return r; }
function ptyRevert(st, r) {
  st.hp = st.hp || {}; if (r.hp) st.hp.cur = Math.max(0, (Number(st.hp.cur) || 0) - r.hp); if (r.temp && Number(st.hp.temp) === r.temp[1]) st.hp.temp = r.temp[0];
  if (r.death) st.death = r.death;
  st.conditions = (st.conditions || []).filter(c => !(r.addC || []).includes(c)).concat((r.rmC || []).filter(c => !(st.conditions || []).includes(c)));
  if (r.exh) st.exhaustion = Math.max(0, (Number(st.exhaustion) || 0) - r.exh); if (r.insp) st.insp = Math.max(0, (Number(st.insp) || 0) - r.insp);
  if (r.cur) { st.currency = st.currency || {}; Object.keys(r.cur).forEach(k => { st.currency[k] = Math.max(0, (Number(st.currency[k]) || 0) - r.cur[k]); }); }
  st.effects = (st.effects || []).filter(e => !(r.addF || []).includes(e.name)).concat((r.rmF || []).filter(e => !(st.effects || []).some(x => x.name === e.name)));
  (r.items || []).forEach(([id, q]) => { const it = (st.inventory || []).find(x => x.id === id); if (!it) return; it.qty = (Number(it.qty) || 1) - q; if (it.qty <= 0) { st.inventory = st.inventory.filter(x => x !== it); st.attacks = (st.attacks || []).filter(a => a.item !== id); } });
  if (r.form) st.form = r.form[0];
}
// Applied to a saved character nobody has open. Returns what to say, or null when it has to wait for the player.
function ptyApplyState(st, m, card) {
  const d = m.data || {}, who = m.fromName || 'Someone', why = d.why || who, maxhp = Number(card && card.maxhp) || 1e9;
  st.hp = st.hp || { cur: 0, base: 0, adj: 0, temp: 0 }; st.conditions = st.conditions || []; st.effects = st.effects || []; st.inventory = st.inventory || []; st.currency = st.currency || {};
  const up = () => { if (Number(st.hp.cur) > 0) { st.conditions = st.conditions.filter(c => c !== 'Unconscious'); st.death = { s: 0, f: 0 }; } };
  const nid = () => Math.random().toString(36).slice(2, 10);
  switch (m.kind) {
    case 'heal': { const b = Number(st.hp.cur) || 0; st.hp.cur = d.amt === 'max' ? maxhp : Math.min(maxhp, b + (Number(d.amt) || 0)); if (b <= 0) up(); return `Healed ${st.hp.cur - b} HP (${why})`; }
    case 'temp': { const v = Number(d.amt) || 0; if (v > (Number(st.hp.temp) || 0)) st.hp.temp = v; return `${v} temporary HP (${why})`; }
    case 'damage': { let n = Number(d.amt) || 0; const t = Number(st.hp.temp) || 0, a = Math.min(t, n); st.hp.temp = t - a; n -= a; const b = Number(st.hp.cur) || 0; st.hp.cur = Math.max(0, b - n);
      if (b > 0 && st.hp.cur === 0 && !st.conditions.includes('Unconscious')) st.conditions.push('Unconscious'); return `Took ${Number(d.amt) || 0} damage (${why})`; }
    case 'effect': { const fx = Object.assign({}, d.fx || {}); if (!fx.name) return ''; fx.from = fx.from || who; delete fx.conc;
      if (fx.wpn) { const at = (st.attacks || []).find(a => a.item && st.inventory.some(it => it.id === a.item && it.equipped && it.weapon)) || (st.attacks || []).find(a => a.item); if (at) fx.item = at.item; delete fx.wpn; }
      const old = st.effects.find(e => e.name === fx.name); if (old && old.maxHp) st.hp.cur = Math.max(0, st.hp.cur - Number(old.maxHp));
      st.effects = st.effects.filter(e => e.name !== fx.name).concat([fx]); if (fx.maxHp) st.hp.cur = (Number(st.hp.cur) || 0) + Number(fx.maxHp);
      if (fx.buff && fx.buff.tempN && Number(fx.buff.tempN) > (Number(st.hp.temp) || 0)) st.hp.temp = Number(fx.buff.tempN); return `${fx.name} from ${who}`; }
    case 'end': { const gone = st.effects.filter(e => e.src && e.src.c === m.from && e.src.n === d.n); if (!gone.length) return '';
      gone.forEach(e => { if (e.maxHp) st.hp.cur = Math.min(st.hp.cur, maxhp - Number(e.maxHp)); (e.conds || []).forEach(c => { st.conditions = st.conditions.filter(x => x !== c); }); });
      st.effects = st.effects.filter(e => !gone.includes(e)); if (st.form && gone.some(e => e.name === st.form.effect)) st.form = null; return `${d.n} ended`; }
    case 'cure': { const done = []; (d.conds || []).forEach(c => { if (st.conditions.includes(c)) { st.conditions = st.conditions.filter(x => x !== c); done.push(c); } });
      if (d.exh) { const b = Number(st.exhaustion) || 0; st.exhaustion = Math.max(0, Math.min(6, b + Number(d.exh))); if (b !== st.exhaustion) done.push('exhaustion ' + b + ' → ' + st.exhaustion); }
      if (d.curse) st.effects = st.effects.filter(e => { const c = (e.buff && e.buff.curse) || /curse|hex/i.test(e.name); if (c) done.push(e.name); return !c; });
      (d.fx || []).forEach(n => { if (st.effects.some(e => e.name === n)) { st.effects = st.effects.filter(e => e.name !== n); done.push(n); } });
      st.effects = st.effects.filter(e => !(e.conds && e.conds.length && !e.conds.some(c => st.conditions.includes(c))));
      return done.length ? `Ended ${done.join(', ')} (${why})` : ''; }
    case 'cond': { if (!d.cond) return ''; if (!st.conditions.includes(d.cond)) st.conditions.push(d.cond); if (Number(d.rounds)) { st.condTurns = st.condTurns || {}; st.condTurns[d.cond] = Number(d.rounds); } return `${d.cond} (${why})`; }
    case 'revive': { st.hp.cur = Math.max(Number(st.hp.cur) || 0, d.hp === 'max' ? maxhp : Math.max(1, Number(d.hp) || 1)); st.death = { s: 0, f: 0 }; st.conditions = st.conditions.filter(c => c !== 'Unconscious'); return `Brought back with ${st.hp.cur} HP (${why})`; }
    case 'stabilize': { if ((Number(st.hp.cur) || 0) > 0) return ''; st.death = { s: 3, f: Math.min(2, Number((st.death || {}).f) || 0) }; return `Stabilized (${why})`; }
    case 'item': case 'loot': { const it = m.kind === 'item' ? Object.assign({}, d.item || {}) : { name: String(d.name || 'Item'), qty: Math.max(1, Number(d.qty) || 1), weight: 0, notes: d.notes || '', ptyLoot: String(d.name || '') };
      if (!it.name) return ''; it.id = nid(); it.equipped = false; it.ptyNew = true; st.inventory.push(it); return `Received ${Number(it.qty) > 1 ? it.qty + ' × ' : ''}${it.name} from ${who}`; }
    case 'coins': { const got = []; ['cp', 'sp', 'ep', 'gp', 'pp'].forEach(k => { const v = Math.max(0, Number(d[k]) || 0); if (v) { st.currency[k] = (Number(st.currency[k]) || 0) + v; got.push(v + ' ' + k); } }); return got.length ? `Received ${got.join(', ')} from ${who}` : ''; }
    case 'inspire': { st.insp = Math.min(st.settings && st.settings.inspMany ? 1e9 : 1, (Number(st.insp) || 0) + 1); return `Inspiration from ${who}`; }
    case 'note': return String(d.text || '');
    case 'undo': { const g = (st.ptyGot || []).find(x => x.ref === d.ref); if (!g) return ''; ptyRevert(st, g.rev); st.ptyGot = st.ptyGot.filter(x => x !== g); return `${who} took back: ${g.text || 'something they sent'}`; }
  }
  return null; // a saving throw, an attack, a rest or a new form: waits for the player
}
// Nobody picked it up: apply it to the saved character (all its documents at once, so nothing is half-written).
async function ptyDeliverClosed(fs, pid, to, ref, EMAIL, kind) {
  const sh = fs.collection('sheets'), ib = sh.doc(to).collection('inbox').doc(ref);
  // only the DM's changes are applied to a closed sheet; anything from another player waits for them to accept it
  if (!['note', 'end'].includes(kind)) { try { const pd = await fs.collection('parties').doc(pid).get(); if (!pd.exists || (pd.data().dm !== EMAIL && !(pd.data().mgrs || []).includes(EMAIL))) return; } catch (e) { return; } }
  let card = null; try { const c = await fs.collection('parties').doc(pid).collection('cards').doc(to).get(); card = c.exists ? c.data() : null; } catch (e) {}
  let after = null, mDelta = 0; const fxMax = st => (st.effects || []).reduce((t, e) => t + (e.ally || e.self === false ? 0 : Number(e.maxHp) || 0), 0);
  try { await fs.runTransaction(async tx => { const m0 = await tx.get(ib); if (!m0.exists) return; const m = m0.data(); let data = {}; try { data = JSON.parse(m.data || '{}'); } catch (e) {}
    const main = await tx.get(sh.doc(to)); if (!main.exists) return; const md = main.data(), n = Number(md.n) || 1, parts = [];
    for (let k = 1; k < n; k++) { const p = await tx.get(sh.doc(to + '_p' + k)); if (!p.exists || Number(p.data().savedAt) !== Number(md.savedAt)) return; parts.push(p.data().data || ''); }
    let st; try { st = JSON.parse((md.data || '') + parts.join('')); } catch (e) { return; }
    const msg = { kind: m.kind, data, from: m.from || '', fromName: m.fromName || '' }, before = ptySnap(st), m0x = fxMax(st), text = ptyApplyState(st, msg, card);
    if (text === null) return; // the player has to do this one
    if (text && m.kind !== 'undo') st.ptyGot = (st.ptyGot || []).concat([{ ref, rev: ptyDiff(before, st), text }]).slice(-80);
    if (text) { st.ptyLog = [{ at: Date.now(), dir: 'in', who: m.fromName || '', text }].concat(st.ptyLog || []).slice(0, 60); st.ptyNews = (st.ptyNews || []).concat([{ who: m.fromName || '', text }]).slice(-30); }
    const at = Date.now(); st.savedAt = at; const str = JSON.stringify(st), out = []; for (let i = 0; i < str.length; i += 180000) out.push(str.slice(i, i + 180000));
    if (out.length > n) return; // it would need a new part: leave it for the player's own sheet
    for (let k = 1; k < n; k++) tx.update(sh.doc(to + '_p' + k), { savedAt: at, data: out[k] || '' });
    tx.update(sh.doc(to), { savedAt: at, data: out[0], tab: 'party', n: Math.max(1, out.length) }); tx.delete(ib);
    after = st; mDelta = fxMax(st) - m0x; }); } catch (e) { console.warn('party delivery', e); return; }
  if (after && card) { const h = after.hp || {}; fs.collection('parties').doc(pid).collection('cards').doc(to).set({ hp: Number(h.cur) || 0, temp: Number(h.temp) || 0, conds: (after.conditions || []).filter(c => c !== 'Concentrating'), exh: Number(after.exhaustion) || 0,
    fx: (after.effects || []).filter(e => !e.ally && e.self !== false).map(e => e.name).slice(0, 14), maxhp: Number(card.maxhp || 0) + mDelta, stable: (Number(h.cur) || 0) <= 0 && Number((after.death || {}).s) >= 3, at: Date.now() }, { merge: true }).catch(() => {}); }
}
// Send something to a character. If its sheet doesn't pick it up within a few seconds, it's applied to the saved copy.
function ptySend(fs, EMAIL, pid, to, kind, data, from, fromName, ref) {
  ref = ref || fs.collection('x').doc().id;
  return fs.collection('sheets').doc(to).collection('inbox').doc(ref).set({ p: pid, ref, from: from || '', fromName: String(fromName || '').slice(0, 80), by: EMAIL, at: Date.now(), kind, data: JSON.stringify(data || {}) })
    .then(() => { if (!(data && data.ask)) setTimeout(() => ptyDeliverClosed(fs, pid, to, ref, EMAIL, kind), 5000); return ref; }); // (ask-first ones wait for the player)
}
// Take back something sent: still waiting → simply removed; already applied → the character undoes exactly what it changed.
async function ptyRecall(fs, EMAIL, pid, to, ref, from, fromName) {
  const ib = fs.collection('sheets').doc(to).collection('inbox').doc(ref);
  try { const x = await ib.get(); if (x.exists) { await ib.delete(); return 'pulled'; } } catch (e) {}
  await ptySend(fs, EMAIL, pid, to, 'undo', { ref }, from, fromName); return 'undone';
}

const PTY_DT = ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'];
function partyModule(H) {
  const { fs, EMAIL, IS_ADMIN, modal, toast, esc, close, root, G } = H;
  const FV = firebase.firestore.FieldValue, PC = fs.collection('parties'), IC = fs.collection('invites');
  // Whoever makes a party is its DM (an admin can hand it to someone else from the admin panel).
  // Who runs a party: its DM and any co-DM. An admin is treated like everyone else here (admins add characters and
  // co-DMs from the admin panel).
  const isMgr = p => !!p && (p.dm === EMAIL || (p.mgrs || []).includes(EMAIL));
  const canRun = p => isMgr(p);
  const myChars = () => H.chars().filter(c => (c.owner || '') === EMAIL);
  const dmLabel = p => p.dm === EMAIL ? 'You' : (p.dmName || H.nameOf(p.dm) || p.dm);
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const MI2 = d => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC_PARTY = MI2('<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2.5 20c.6-3.3 2.8-5.5 5.5-5.5s4.9 2.2 5.5 5.5M10.5 20c.6-3.3 2.8-5.5 5.5-5.5s4.9 2.2 5.5 5.5"/>');
  const IC_CROWN = MI2('<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>');
  let MINE = [], INVS = [], LOADED = false;
  // Your own order of the Parties tab (drag a row by its grip, like characters): kept on your account, and in this
  // browser so it's right straight away.
  const PORD_LS = 'pg-pord:' + EMAIL; let PORD = (() => { try { return JSON.parse(localStorage.getItem(PORD_LS) || '[]'); } catch (e) { return []; } })();
  const saveOrder = ids => { PORD = ids; try { localStorage.setItem(PORD_LS, JSON.stringify(ids)); } catch (e) {} fs.collection('users').doc(EMAIL).update({ partyOrder: ids }).catch(() => {}); };
  const listen = () => {
    fs.collection('users').doc(EMAIL).get().then(d => { const o = d.exists && d.data().partyOrder; if (Array.isArray(o) && JSON.stringify(o) !== JSON.stringify(PORD)) { PORD = o; try { localStorage.setItem(PORD_LS, JSON.stringify(o)); } catch (e) {} paintStrip(); } }, () => {});
    PC.where('people', 'array-contains', EMAIL).onSnapshot(qs => { MINE = qs.docs.map(d => Object.assign({ id: d.id }, d.data())); LOADED = true; paintStrip(); }, e => { console.warn('parties', e); LOADED = true; paintStrip(); });
    PC.where('invited', 'array-contains', EMAIL).onSnapshot(qs => { INVS = qs.docs.map(d => Object.assign({ id: d.id }, d.data())); paintStrip(); }, () => {});
  };

  // ----- the Parties tab in the lobby (rows look like the character rows) -----
  const ago = t => { if (!t) return ''; const x = (Date.now() - t) / 1000; return x < 60 ? 'just now' : x < 3600 ? Math.floor(x / 60) + 'm ago' : x < 86400 ? Math.floor(x / 3600) + 'h ago' : Math.floor(x / 86400) + 'd ago'; };
  const ptyPic = p => p && p.pic ? `<img class="hc-pic pty-pic" src="${esc(p.pic)}" alt="">` : `<span class="hc-pic hc-nopic pty-pic${p && isMgr(p) ? ' dm' : ''}">${p && isMgr(p) ? IC_CROWN : IC_PARTY}</span>`;
  function paneHTML() {
    const inv = INVS.filter(p => !MINE.some(m => m.id === p.id));
    const oi = id => { const i = PORD.indexOf(id); return i < 0 ? -1 : i; };
    const rows = MINE.slice().sort((a, b) => { const x = oi(a.id), y = oi(b.id); return x < 0 && y < 0 ? (b.updatedAt || 0) - (a.updatedAt || 0) : x < 0 ? -1 : y < 0 ? 1 : x - y; }).map(p => { const n = (p.chars || []).length, role = p.dm === EMAIL ? 'You’re the DM' : 'DM ' + dmLabel(p);
      return `<div class="hr" data-id="${esc(p.id)}" data-pin="0" data-party="1"><span class="hr-grip" title="Drag to reorder" aria-label="Drag to reorder">⠿</span><a class="hr-main" href="${esc(URLS.party(p.id, p.name))}">${ptyPic(p)}<span class="hc-txt"><b>${esc(p.name || 'Unnamed party')}</b><span>${esc(role)} · ${plural(n, 'character')}</span><small>${p.updatedAt ? 'Updated ' + ago(p.updatedAt) : ''}</small></span></a></div>`; }).join('');
    // An invitation opens the party's join steps (where you can also turn it down).
    const invs = inv.map(p => `<div class="hr pty-inviterow"><a class="hr-main" href="${esc(URLS.party(p.id, p.name))}">${ptyPic(p)}<span class="hc-txt"><b>${esc(p.name || 'A party')}</b><span>${esc(p.dmName || p.dm)} invited you to join</span><small>Open it to choose a character, or decline</small></span><span class="pty-invtag">Invitation</span></a></div>`).join('');
    return `<div id="hub-parties">${invs || rows ? `<div class="hl">${invs}${rows}</div>` : LOADED ? '<p class="hub-empty">Running a game? Make a party with <b>New party</b>: you’re its DM, and you get a link to send your players. Their characters join it, and you all see each other in one place.</p>' : SKEL.rows(2)}
</div>`;
  }
  const count = () => MINE.length + INVS.filter(p => !MINE.some(m => m.id === p.id)).length;
  function paintStrip() { const el = root.querySelector('#hub-parties'); if (!el) return; if (document.body.classList.contains('hdragging')) { clearTimeout(paintStrip.t); paintStrip.t = setTimeout(paintStrip, 400); return; } el.outerHTML = paneHTML(); wirePane();
    const n = root.querySelector('.hub-seg [data-view="parties"] span'); if (n) n.textContent = count(); }
  function wirePane() { const el = root.querySelector('#hub-parties'); if (!el) return;
  }

  // ----- pages: laid out like the character creation screen -----
  // The lobby's header (logo, who's signed in, a way back), a title with its steps or sections as pills, one card with a
  // gold top edge, and the buttons along the bottom. Making a party and joining one go step by step; a party's own page
  // uses the same pills as sections.
  const headHTML = () => { const a = H.myAva(), nm = H.myName();
    return `<div class="wzh"><header class="hub-top">${logoHTML()}<div class="hub-side"><div class="hub-prof"><span class="hp-pic wzh-pic">${avaHTML(nm, EMAIL, a.pic, '', '', a)}</span><div class="hp-txt"><b>${esc(nm)}</b><small>${esc(EMAIL)}</small><div class="hp-row"><button class="linkbtn" data-pw="out">Sign out</button><a class="hub-ctlink" href="${CONTACT}">Contact us</a></div></div></div></div></header><a class="adm-back wzh-back" href="${esc(URLS.parties(G))}">← Adventurer’s Tome</a></div>`; };
  // steps: [[key, label]]; seq = numbered steps you go through in order (later ones can't be clicked yet).
  function shell({ title, sub, steps, on, body, foot, seq, inBody, bare, noReady }) {
    const idx = Math.max(0, (steps || []).findIndex(s => s[0] === on));
    const pills = steps && steps.length > 1 ? `<div class="pw-steps" role="tablist">${steps.map(([k, t], i) => `<button class="pw-step${k === on ? ' on' : ''}${seq && i < idx ? ' done' : ''}" role="tab" aria-selected="${k === on}" data-pstep="${k}"${seq && i > idx ? ' disabled' : ''}>${seq ? (i + 1) + '. ' : ''}${esc(t)}</button>`).join('')}</div>` : '';
    // inBody: the title sits at the top of the card itself (a party's page)
    if (inBody) { body = `<div class="pw-intitle"><h2>${title}</h2>${sub ? `<p class="pw-sub">${sub}</p>` : ''}</div>${body}`; title = ''; sub = ''; }
    root.innerHTML = `<div class="pw${seq ? ' seq' : ''}${inBody ? ' inbody' : ''}${bare ? ' bare' : ''}">${headHTML()}<div class="pw-head">${title ? `<h2>${title}</h2>` : ''}${sub ? `<p class="pw-sub">${sub}</p>` : ''}${pills}${seq && steps ? `<div class="pw-now">Step ${idx + 1} of ${steps.length}<b>${esc(steps[idx][1])}</b></div>` : ''}</div>
      <div class="pw-body">${body}</div>${foot ? `<div class="pw-foot">${foot}</div>` : ''}</div>`;
    wireDie(root); if (window.pgReady && !noReady && !/Loading the party|Opening the invitation/.test(body)) window.pgReady();
    const out = root.querySelector('[data-pw="out"]'); if (out) out.onclick = () => H.signOut();
    const back = root.querySelector('.wzh-back'); if (back) back.onclick = e => { e.preventDefault(); pgGo(URLS.parties(G)); };
    return root.querySelector('.pw-body');
  }
  const note = (h, text, btns) => `<div class="pw-note"><span class="pty-jic">${IC_PARTY}</span><h3>${h}</h3>${text ? `<p class="hub-hint">${text}</p>` : ''}${btns ? `<div class="row">${btns}</div>` : ''}</div>`;
  const goHub = `<a class="btn gold" href="${esc(URLS.parties(G))}">Go to your parties</a>`;
  const charRow = (c, act, label) => `<button class="pl-row pty-prow" data-${act}="${esc(c.id)}">${H.pic(c)}<span class="pty-ct"><b>${esc(c.name || 'Unnamed character')}</b><small>${esc([c.race, c.cls].filter(Boolean).join(' · ') || 'New character')}</small></span><span class="pty-go">${label}</span></button>`;
  const cardOf = c => ({ name: c.name || '', race: c.race || '', cls: c.cls || '', level: c.level || 0, thumb: c.thumb || '', player: H.myName(), path: c.path || '' });
  // A character made from here (or from an invite link) joins the party as soon as it's saved.
  const makeFor = (p, token) => { try { sessionStorage.setItem('pg-join', JSON.stringify({ p: p.id, t: token || '', name: p.name || '', at: Date.now() })); } catch (e) {} pgGo(URLS.newChar(G)); };

  // ----- making a party: 1. its name and picture, 2. adding characters -----
  function newPage() {
    document.title = 'New party — Adventurer’s Tome';
    const steps = [['name', 'Name'], ['add', 'Add characters']];
    let made = null, pic = '', nm0 = '';
    const step1 = () => {
      shell({ title: 'Create a party', steps, on: 'name', seq: true,
        body: `<h3>Name</h3><p class="hub-hint">You’ll be its DM: you see everyone’s HP, AC and conditions, open their sheets, and send them damage, healing and loot.</p>
          <form id="np-f" class="pw-form"><label class="pw-fld"><span>Party name</span><input id="np-n" maxlength="60" placeholder="e.g. The Lost Mine crew" autocomplete="off" required value="${esc(nm0)}"></label></form>
          <div class="pw-picrow">${partyPicHTML({ pic }, true)}<button class="btn" id="np-pic" type="button">${pic ? 'Change picture' : 'Add a picture'}</button><span class="hub-hint">Optional. It shows on the party and in everyone’s list.</span></div>`,
        foot: `<a class="btn" href="${esc(URLS.parties(G))}" id="np-x">Cancel</a><span class="grow"></span><button class="btn gold" id="np-ok">Create party</button>` });
      const inp = root.querySelector('#np-n'); setTimeout(() => inp.focus(), 30);
      root.querySelector('#np-x').onclick = e => { e.preventDefault(); pgGo(URLS.parties(G)); };
      const choose = async () => { nm0 = inp.value; const v = await pickPic(); if (v) { pic = v; step1(); } };
      root.querySelector('#np-pic').onclick = choose; root.querySelector('#pt-pic').onclick = choose;
      const go = async () => { const nm = inp.value.replace(/\s+/g, ' ').trim().slice(0, 60); if (!nm) { toast('Give the party a name.'); inp.focus(); return; }
        const ok = root.querySelector('#np-ok'); ok.disabled = true; ok.textContent = 'Creating…';
        const ref = PC.doc(), now = Date.now();
        try { await ref.set(Object.assign({ name: nm, dm: EMAIL, dmName: H.myName(), by: EMAIL, createdAt: now, updatedAt: now, chars: [], people: [EMAIL], mgrs: [], invited: [], inv: '', via: '', gone: '' }, pic ? { pic } : {}));
          pgLog('party_create', { target: ref.id, tName: nm }); made = { id: ref.id, name: nm, inv: '', invited: [], chars: [], dm: EMAIL }; history.replaceState(null, '', URLS.party(ref.id, nm)); step2(); }
        catch (x) { ok.disabled = false; ok.textContent = 'Create party'; fail(x, 'create it'); } };
      root.querySelector('#np-f').onsubmit = e => { e.preventDefault(); go(); }; root.querySelector('#np-ok').onclick = go;
    };
    const step2 = () => {
      const el = shell({ title: esc(made.name), steps, on: 'add', seq: true, body: `<h3>Add characters</h3>${addHTML(made)}`,
        foot: `<span class="grow"></span><button class="btn gold" id="np-open">Open the party</button>` });
      wireAdd(el, made);
      root.querySelector('#np-open').onclick = () => pgGo(URLS.party(made.id, made.name));
      root.querySelectorAll('[data-pstep="name"]').forEach(b => b.disabled = true); // already made: rename it on its page
    };
    step1();
  }

  // ----- joining (an invite link, or an email invitation): 1. the invitation, 2. which character -----
  async function joinPage(token) {
    document.title = 'Join a party — Adventurer’s Tome';
    shell({ title: 'Join a party', body: '<p class="hub-hint">Opening the invitation…</p>' });
    let inv = null; try { const d = await IC.doc(token).get(); inv = d.exists ? d.data() : null; } catch (e) {}
    if (!inv) return shell({ title: 'Join a party', body: note('This invite link doesn’t work', 'It may have been replaced or turned off. Ask your DM for a new link.', goHub) });
    let p = null; try { const d = await PC.doc(inv.p).get(); p = d.exists ? Object.assign({ id: d.id }, d.data()) : null; } catch (e) {}
    if (Number(inv.max) > 0 && Number(inv.used) >= Number(inv.max) && !(p && (p.people || []).includes(EMAIL))) return shell({ title: 'Join a party', body: note('This invite link has been used up', `It was for ${Number(inv.max)} player${Number(inv.max) > 1 ? 's' : ''}, and they’ve all joined. Ask your DM for a new link.`, goHub) });
    joinFlow(p || { id: inv.p, name: inv.name, dm: inv.dm, dmName: inv.dmName, chars: [], pic: inv.pic || '', n: Number(inv.n) || 0 }, token, p && (p.people || []).includes(EMAIL) && (p.chars || []).length > 0);
  }
  // The invitation itself: the party's crest, its name and DM, and what being in it means.
  const inviteCard = (p, already) => { const n = (p.chars || []).length || Number(p.n) || 0, dm = p.dmName || p.dm || '';
    const ck = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    return `<div class="pj-card"><div class="pj-glow" aria-hidden="true"></div>
      <div class="pj-seal">${p.pic ? `<img src="${esc(p.pic)}" alt="">` : IC_PARTY}</div>
      <div class="pj-kicker">${already ? 'You’re already in' : 'You’re invited to join'}</div>
      <h2 class="pj-name">${esc(p.name || 'a party')}</h2>
      <div class="pj-meta">${dm ? `<span>Dungeon Master <b>${esc(dm)}</b></span>` : ''}${n ? `<span>${n} adventurer${n === 1 ? '' : 's'} so far</span>` : ''}</div>
      <div class="pj-rule" aria-hidden="true"><span></span>${IC_PARTY}<span></span></div>
      <ul class="pj-perks"><li>${ck}See each other’s HP, AC and conditions, live</li><li>${ck}Hand over items and cast spells on each other from your sheets</li><li>${ck}Share homebrew items with the whole party</li><li>${ck}Your DM can open every character sheet in the party</li></ul>
    </div>`; };
  function joinFlow(p, token, already) {
    const steps = [['inv', 'Invitation'], ['char', 'Choose a character']], nm = esc(p.name || 'a party');
    // the invitation on its own (no card behind it), with its two buttons right under it
    const step1 = () => { shell({ title: 'Join ' + nm, steps, on: 'inv', seq: true, bare: true,
        body: `${inviteCard(p, already)}<div class="pj-btns">${already ? `<a class="btn" href="${esc(URLS.party(p.id, p.name))}">Open the party</a>` : `<button class="btn" id="pj-no">${token ? 'Not now' : 'Decline'}</button>`}<button class="btn gold" id="pj-next">${already ? 'Bring another character' : 'Accept invitation'}</button></div>` });
      const no = root.querySelector('#pj-no'); if (no) no.onclick = async () => { if (!token) { no.disabled = true; try { await PC.doc(p.id).update({ invited: FV.arrayRemove(EMAIL) }); toast('Invitation declined.'); } catch (x) { no.disabled = false; return fail(x, 'decline it'); } } pgGo(URLS.parties(G)); };
      root.querySelector('#pj-next').onclick = step2; };
    const step2 = () => {
      const mine = myChars().filter(c => !(p.chars || []).includes(c.id)).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      const el = shell({ title: 'Join ' + nm, steps, on: 'char', seq: true,
        body: `<h3>Choose a character</h3><p class="hub-hint">Bring a character you already have, or make a new one: it joins the party as soon as it’s made. A character is in one party at a time, so one that’s in another party moves here.</p>
          ${mine.length ? `<div class="pl-list pty-pick">${mine.map(c => charRow(c, 'pc', 'Bring')).join('')}</div>` : '<p class="hub-hint">You don’t have any characters yet.</p>'}`,
        foot: `<button class="btn" id="pj-back">Back</button><span class="grow"></span><button class="btn gold" id="pj-new">+ Make a new character</button>` });
      root.querySelector('#pj-back').onclick = step1; root.querySelector('#pj-new').onclick = () => makeFor(p, token);
      root.querySelectorAll('[data-pstep="inv"]').forEach(b => b.onclick = step1);
      el.querySelectorAll('[data-pc]').forEach(b => b.onclick = async () => { const c = mine.find(x => x.id === b.dataset.pc); if (!c) return; root.querySelectorAll('.pw button').forEach(x => x.disabled = true); b.querySelector('.pty-go').textContent = 'Joining…';
        try { await ptyJoin(fs, EMAIL, p.id, c.id, token, cardOf(c)); pgLog('party_join', { target: p.id, tName: p.name, detail: c.name || '' }); toast((c.name || 'Your character') + ' joined ' + (p.name || 'the party') + '.'); pgGo(URLS.party(p.id, p.name)); }
        catch (x) { root.querySelectorAll('.pw button').forEach(y => y.disabled = false); b.querySelector('.pty-go').textContent = 'Bring'; toast(x && x.code === 'permission-denied' ? 'Couldn’t join — the link may have been turned off. Ask your DM for a new one.' : 'Couldn’t join: ' + ((x && x.message) || x)); } });
    };
    step1();
  }

  // ----- a party's own page: Characters, then (for whoever runs it) Invite players and Who runs it -----
  let CLOADED = false, LEAVING = false, P = null, PLOADED = false, CARDS = {}, PID = '', unP = null, unC = null, SEC = 'chars', JOINING = false;
  // /party/shattered-skies: the name in the address is matched against the parties you're in (or invited to); the
  // party's id works too (older links).
  async function resolveParty(x) {
    try { const d = await PC.doc(x).get(); if (d.exists) return x; } catch (e) {}
    const match = docs => { const m = docs.filter(d => partySlug(d.data().name) === x).sort((a, b) => (b.data().updatedAt || 0) - (a.data().updatedAt || 0)); return m[0] ? m[0].id : ''; };
    for (const q of [PC.where('people', 'array-contains', EMAIL), PC.where('invited', 'array-contains', EMAIL)].concat(IS_ADMIN ? [PC] : [])) { try { const r = match((await q.get()).docs); if (r) return r; } catch (e) {} }
    return '';
  }
  // The party, its cards and each character's live summary are kept in this browser too, so the page opens filled in
  // instead of drawing empty and catching up.
  const PKEY = id => 'pg-party:' + EMAIL + ':' + id, SLUGKEY = 'pg-pslug:' + EMAIL;
  const pcGet = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  let pkT = null; const partyKeep = () => { clearTimeout(pkT); pkT = setTimeout(() => { if (!P || !PID) return; const live = {}; Object.keys(LIVE).forEach(k => { const x = Object.assign({}, LIVE[k]); delete x.hb; live[k] = x; });
    const cards = {}; Object.keys(CARDS).forEach(k => { const x = Object.assign({}, CARDS[k]); delete x.hb; cards[k] = x; });
    let v = JSON.stringify({ P, cards, live }); if (v.length > 400000) v = JSON.stringify({ P, cards: {}, live: {} }); try { localStorage.setItem(PKEY(PID), v); const sl = pcGet(SLUGKEY) || {}; sl[partySlug(P.name)] = PID; localStorage.setItem(SLUGKEY, JSON.stringify(sl)); } catch (e) {} }, 800); };
  async function partyPage(pid) {
    if (pid === 'new') return newPage();
    document.title = 'Party — Adventurer’s Tome';
    const known = (pcGet(SLUGKEY) || {})[pid] || pid, cached = pcGet(PKEY(known));
    if (cached && cached.P) { PID = known; P = cached.P; CARDS = cached.cards || {}; Object.assign(LIVE, cached.live || {}); PLOADED = true; CLOADED = true; paint(); }
    else shell({ title: 'Party', body: '<div class="sk-auto" data-k="cards" data-n="4"></div><span hidden>Loading the party</span>' });
    const id = cached && cached.P ? known : await resolveParty(pid);
    if (!id) return shell({ title: 'Party', body: note('You’re not in this party', 'Only its players and DM can open it. If you were invited, the invitation is on your Parties tab.', goHub) });
    PID = id;
    unP = PC.doc(id).onSnapshot(d => { PLOADED = true; P = d.exists ? Object.assign({ id: d.id }, d.data()) : null;
        if (P) { document.title = (P.name || 'Party') + ' — Adventurer’s Tome'; if (PRETTY && location.pathname !== URLS.party(P.id, P.name)) history.replaceState(null, '', URLS.party(P.id, P.name)); }
        paint(); partyKeep(); },
      () => { PLOADED = true; P = null; try { localStorage.removeItem(PKEY(id)); } catch (e) {} if (LEAVING) return; shell({ title: 'Party', body: note('You’re not in this party', 'Only its players and DM can open it. If you were invited, the invitation is on your Parties tab.', goHub) }); });
    unC = PC.doc(id).collection('cards').onSnapshot(qs => { CARDS = {}; qs.docs.forEach(d => CARDS[d.id] = d.data()); CLOADED = true; paint(); partyKeep(); }, () => { CLOADED = true; paint(); });
  }
  const statusOf = c => c.dead ? ['Dead', 'dead'] : c.stable ? ['Stable at 0 HP', 'down'] : (Number(c.maxhp) && Number(c.hp) <= 0) ? ['Down — death saves', 'down'] : null;
  // The same HP ring as on the sheet: gold for HP (red when low), blue after it for temp HP.
  const ring = (cur, max, tmp) => { max = Math.max(1, Number(max) || 0); cur = Math.max(0, Math.min(Number(cur) || 0, max)); tmp = Math.max(0, Number(tmp) || 0);
    const r = 52, C = 2 * Math.PI * r, tot = Math.max(max, cur + tmp), x = C * cur / tot, y = C * tmp / tot;
    return `<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="rt" cx="60" cy="60" r="${r}"/><circle class="rf${cur / max <= .35 ? ' low' : ''}" cx="60" cy="60" r="${r}" stroke-dasharray="${x} ${C}"/>${tmp ? `<circle class="rtmp" cx="60" cy="60" r="${r}" stroke-dasharray="${y} ${C}" stroke-dashoffset="${-x}"/>` : ''}</svg>`; };
  const hrefOf = (id, c) => /^[\w-]+(\/[\w-]+)?$/.test(String(c.path || '')) ? (c.path.includes('/') ? '/' + c.path : '/character/' + c.path) : URLS.byId(id); // (a card's path is written by its player: only a plain address on this site)
  // A character in the party: picture, name and class, the HP ring, AC / speed / passive Perception, and what's on it.
  const PM_IC = { dmg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M12.5 7.5 10.5 11l3 2-2 3.5"/></svg>',
    heal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M12 9.5v6M9 12.5h6"/></svg>',
    temp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="M12 9v6M9 12h6"/></svg>' };
  // A character's card, laid out like the cards in a sheet's Party tab: who, HP (with quick damage/heal for the DM),
  // AC/speed/level, what's on them, and its actions along the bottom.
  function memberCard(id) {
    // open: yours, one you run the party for, or one that's been shared with you
    const c = cardFor(id), mine = c.owner === EMAIL, run = canRun(P), dmMe = !!actor(), st = statusOf(c), open = mine || run || H.chars().some(x => x.id === id && (x.owner === EMAIL || (x.viewers || []).includes(EMAIL) || (x.editors || []).includes(EMAIL))), max = Number(c.maxhp) || 0, cur = Number(c.hp) || 0;
    const on = [].concat(st ? [st[0]] : [], c.conds || [], Number(c.exh) ? ['Exhaustion ' + Number(c.exh)] : [], c.conc ? ['Concentrating: ' + c.conc] : [], c.fx || []);
    const menu = [dmMe ? ['send', 'Damage, heal or give…'] : null, open ? ['open', 'Open sheet'] : null, run || mine ? ['rm', mine && !run ? 'Leave the party' : 'Remove from the party'] : null].filter(Boolean);
    const dots = (cls) => `<div class="hc-menu ${cls}"><button class="hc-dots" aria-label="More for ${esc(c.name || 'this character')}">⋯</button><div class="hc-list">${menu.map(([a, t]) => `<button data-pm="${a}" data-id="${esc(id)}"${a === 'rm' ? ' class="hc-del"' : ''}>${t}</button>`).join('')}</div></div>`;
    const pic = c.thumb ? `<img class="pm-pic" src="${esc(c.thumb)}" alt=""${accStyle(c)}>` : `<span class="pm-pic pm-nopic"${accStyle(c)}>${esc(initials(c.name || '?'))}</span>`;
    const nl = String(c.name || '').length, who = `<span class="pm-txt"><b class="${nl > 26 ? 'n3' : nl > 17 ? 'n2' : ''}" title="${esc(c.name || '')}">${esc(c.name || 'A character')}</b>${c.player || c.owner ? `<small>${esc(c.player || H.nameOf(c.owner))}${mine ? ' (you)' : ''}</small>` : ''}</span>`;
    // a player looking at the party: no controls — the HP ring with AC / speed / level / passive in a 2 × 2 grid beside it
    const grid = `<div class="pm-csts pm-quad">${[['AC', c.ac || '—'], ['Speed', c.speed || '—'], ['Level', c.level || '—'], ['Passive', c.pp || '—']].map(([k, v]) => `<span><small>${k}</small><b>${esc(String(v))}</b></span>`).join('')}</div>`;
    const hp = max ? `<div class="pm-hp"><span class="pty-ring" title="${cur} of ${max} HP${Number(c.temp) ? ' (+' + c.temp + ' temporary)' : ''}"><span class="ring-svg">${ring(c.hp, max, c.temp)}</span><b>${cur}</b><small>of ${max}</small>${Number(c.temp) ? `<em class="pm-tmp">+${Number(c.temp)}</em>` : ''}</span>
        ${dmMe ? `<div class="pm-hpq"><select class="pm-qt" id="pmqt-${esc(id)}" aria-label="Damage type for ${esc(c.name || 'them')}" title="Damage type: their resistances and immunities apply"><option value="">Any</option>${PTY_DT.map(t => `<option value="${t.toLowerCase()}">${t}</option>`).join('')}</select><input class="pm-q" id="pmq-${esc(id)}" inputmode="numeric" placeholder="Amount" aria-label="Amount for ${esc(c.name || 'them')}">
          <div class="pm-hpb"><button class="pm-hb dmg" data-q="dmg" data-id="${esc(id)}" title="Damage" aria-label="Damage">${PM_IC.dmg}</button><button class="pm-hb heal" data-q="heal" data-id="${esc(id)}" title="Heal" aria-label="Heal">${PM_IC.heal}</button><button class="pm-hb tmp" data-q="temp" data-id="${esc(id)}" title="Temporary HP" aria-label="Temporary HP">${PM_IC.temp}</button></div></div>` : grid}</div>` : '';
    const stats = [!max && c.hp != null ? ['HP', c.hp] : null, ['AC', c.ac || '—'], c.speed ? ['Speed', c.speed] : null, c.level ? ['Level', c.level] : null, c.pp ? ['Passive', c.pp] : null].filter(Boolean);
    return `<div class="pm${st ? ' ' + st[1] : ''}" data-cid="${esc(id)}">
      <div class="pm-top">${open ? `<a class="pm-main" href="${esc(hrefOf(id, c))}">${pic}${who}</a>` : `<span class="pm-main">${pic}${who}</span>`}${!run && open && menu.length ? dots('pm-tr') : ''}</div>
      ${hp}${dmMe || !max ? `<div class="pm-csts">${stats.map(([k, v]) => `<span><small>${k}</small><b>${esc(String(v))}</b></span>`).join('')}</div>` : ''}
      ${on.length ? `<div class="pm-on">${on.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
      ${run ? `<div class="pm-foot">${dmMe ? `<button class="btn gold sm" data-pm="send" data-id="${esc(id)}">Actions…</button>` : ''}${open ? `<a class="btn sm" href="${esc(hrefOf(id, c))}">Open sheet</a>` : ''}<span class="grow"></span>${menu.length ? dots('up') : ''}</div>` : ''}</div>`;
  }
  // Who can do things to characters from this page, and how it's sent: the DM (straight onto the sheet) or an admin;
  // anyone else with a character in the party asks — it pops up on that player's sheet for them to say yes or no.
  // Only whoever runs the party (the DM, a co-DM, an admin) acts from here; players do things from their own sheets.
  // Everything sent from this page asks first, like a change from another player does.
  const actor = () => { if (!P) return null; if (P.dm === EMAIL) return { from: '', name: H.myName() + ' (DM)', why: 'The DM', dm: true };
    if (isMgr(P)) return { from: '', name: H.myName() + ' (co-DM)', why: H.myName(), dm: true }; return null; };
  const sentMsg = (a, msg) => msg + ' — they’ll be asked to accept it.';
  // Quick damage / heal / temp HP on a card.
  async function quickHP(b) {
    const id = b.dataset.id, k = b.dataset.q, inp = root.querySelector('#pmq-' + CSS.escape(id)), n = Math.max(0, Math.floor(Number(inp && inp.value) || 0));
    if (!n) { toast('Type an amount first.'); if (inp) inp.focus(); return; }
    const a = actor(); if (!a) return; const nm = (CARDS[id] || {}).name || 'them';
    const tsel = root.querySelector('#pmqt-' + CSS.escape(id)), dt = k === 'dmg' && tsel ? tsel.value : '';
    const [kind, data, msg] = k === 'dmg' ? ['hit', Object.assign({ dmg: n, why: a.why, ask: true }, dt ? { type: dt } : {}), `${n}${dt ? ' ' + dt : ''} damage to ${nm}`] : k === 'heal' ? ['heal', { amt: n, why: a.why, ask: true }, `Healed ${nm} ${n} HP`] : ['temp', { amt: n, why: a.why, ask: true }, `Gave ${nm} ${n} temp HP`];
    b.disabled = true; try { await ptySend(fs, EMAIL, PID, id, kind, data, a.from, a.name); if (inp) inp.value = ''; if (tsel) tsel.value = ''; toast(sentMsg(a, msg)); pgLog('party_send', { target: PID, tName: P.name, detail: kind + ' → ' + nm }); } catch (x) { fail(x, 'send it'); } finally { b.disabled = false; }
  }
  function paint() {
    if (!PLOADED || JOINING || LEAVING) return;
    // not while the DM is typing an amount on a card (it'd be wiped); it catches up a moment later
    { const ae = document.activeElement; if (ae && ae.classList && (ae.classList.contains('pm-q') && ae.value || ae.classList.contains('pm-qt'))) { clearTimeout(paint.t); paint.t = setTimeout(paint, 900); return; } }
    if (!P) return shell({ title: 'Party', body: note('This party doesn’t exist anymore', 'Its DM may have deleted it.', goHub) });
    if (modal.classList.contains('on') && modal.querySelector('.pty-keep')) return;
    const run = canRun(P), ids = (P.chars || []).slice(), inParty = (P.people || []).includes(EMAIL);
    // Invited by email and not in it yet: the invitation, step by step.
    if (!inParty && !run && (P.invited || []).includes(EMAIL)) { JOINING = true; return joinFlow(P, '', false); }
    if (!inParty && !run) return shell({ title: 'Party', body: note('You’re not in this party', IS_ADMIN ? 'Only its players and DM can open it. As an admin you can add characters or make yourself a co-DM from the admin panel’s Parties tab.' : 'Only its players and DM can open it. If you were invited, the invitation is on your Parties tab.', goHub) });
    repairCards(ids); watchSheets(ids);
    const mineIn = ids.filter(id => (CARDS[id] || {}).owner === EMAIL);
    const sub = `${IC_CROWN} DM <b>${esc(dmLabel(P))}</b> · ${plural(ids.length, 'character')}`;
    const title = `${partyPicHTML(P, run)}<span class="pw-tt">${esc(P.name || 'Unnamed party')}</span>${run ? ` <button class="hp-rename" id="pt-ren" title="Rename the party" aria-label="Rename the party"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg></button>` : ''}`;
    const adminNote = '';
    const invited = run && (P.invited || []).length ? `<h4 class="pw-h4">Invited</h4><div class="pl-list">${P.invited.map(em => `<div class="pl-row pty-invrow"><span class="pty-invwho"><b>${esc(H.nameOf(em))}</b><small>${H.nameOf(em) !== em ? esc(em) + ' · ' : ''}hasn’t answered yet</small></span><button class="linkbtn" data-uninv="${esc(em)}">Cancel</button></div>`).join('')}</div>` : '';
    const body = `${adminNote}
      ${ids.length ? `<div class="pm-grid">${ids.map(memberCard).join('')}</div>` : `<p class="pw-empty">No characters yet.${P.dm === EMAIL ? ' Use <b>Add characters</b> to bring some in.' : ''}</p>`}${invited}`;
    const foot = run ? `${P.dm === EMAIL ? '<button class="btn red" id="pt-del"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg><span class="pw-lg">Delete party…</span><span class="pw-sm">Delete</span></button>' : ''}<span class="grow"></span>${P.dm === EMAIL ? '<button class="btn" id="pt-add"><span class="pw-lg">Add characters</span><span class="pw-sm">Add</span></button>' : ''}${ids.length && actor() ? '<button class="btn" id="pt-turn" title="Initiative tracker"><span class="pw-lg">Turn order</span><span class="pw-sm">Turns</span></button>' : ''}${ids.length && actor() ? '<button class="btn gold" id="pt-all"><span class="pw-lg">Party actions…</span><span class="pw-sm">Actions</span></button>' : ''}`
      : mineIn.length ? `<button class="btn" id="pt-leave">Leave the party</button><span class="grow"></span>` : inParty ? '<button class="btn" id="pt-off">Remove it from my list</button>' : '';
    const el = shell({ title, sub, body, foot, inBody: true, noReady: true });
    wirePage(el); if (window.pgReady && (CLOADED || ids.length === 0)) window.pgReady();
    if (run && P.inv) invCard(P.inv, Object.assign({}, P, { id: PID })); // (keeps the link's preview card up to date)
  }
  // A party's picture (or its icon). The DM taps it to change it.
  const partyPicHTML = (p, edit) => `<${edit ? 'button' : 'span'} class="pw-ppic${p.pic ? '' : ' none'}"${edit ? ` id="pt-pic" title="${p.pic ? 'Change the party’s picture' : 'Add a picture for the party'}" aria-label="Party picture"` : ''}>${p.pic ? `<img src="${esc(p.pic)}" alt="">` : IC_PARTY}${edit ? '<span class="pw-pedit" aria-hidden="true">✎</span>' : ''}</${edit ? 'button' : 'span'}>`;
  // Pick an image and make a small square picture of it (kept with the party, so it shows everywhere straight away).
  const pickPic = keep => new Promise(res => { const f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*';
    f.onchange = () => { const file = f.files && f.files[0]; if (!file) return res(''); pgCrop(file, { shape: 'square', size: 256, title: 'Party picture', keep }).then(r => res(r ? r.url : ''), e => { toast(e.message || 'That file isn’t an image this browser can open.'); res(''); }); };
    f.click(); });
  // Live from each character's saved sheet: every save carries a summary (pcard) — HP, AC, speed, conditions — so the
  // cards change the moment a player's sheet does, open or not. Whichever is newer wins: the sheet, or its party card
  // (which is also updated when something sent to a closed sheet is applied).
  const LIVE = {}, unS = {}; let liveT = null;
  function watchSheets(ids) {
    ids.forEach(id => { if (unS[id]) return; unS[id] = fs.collection('sheets').doc(id).onSnapshot(async sn => { const d = sn.exists ? sn.data() : null, l = d && await sheetLive(fs, id, d); if (!l) return;
      const same = JSON.stringify(LIVE[id]) === JSON.stringify(l); LIVE[id] = l; if (!same) { clearTimeout(liveT); liveT = setTimeout(paint, 150); partyKeep(); } }, () => {}); });
    Object.keys(unS).forEach(id => { if (!ids.includes(id)) { unS[id](); delete unS[id]; delete LIVE[id]; } });
  }
  const cardFor = id => { const c = CARDS[id] || {}, l = LIVE[id]; if (!l) return c; return Number(l.at) >= Number(c.at || 0) ? Object.assign({}, c, l) : Object.assign({}, l, c); };
  // A character's card is written by its own sheet. One that was added before its sheet had been opened is filled in
  // from the summary its sheet saves along with it (HP, AC, speed…), so it never shows up blank.
  const REPAIRED = new Set();
  function repairCards(ids) {
    ids.filter(id => !REPAIRED.has(id) && !Number((CARDS[id] || {}).maxhp)).forEach(async id => { REPAIRED.add(id);
      try { const s = await fs.collection('sheets').doc(id).get(); const d = s.exists ? s.data() : null; if (!d) return;
        let pc = null; try { pc = d.pcard ? JSON.parse(d.pcard) : null; } catch (e) {}
        if (!pc) { let st = null; try { st = Number(d.n || 1) === 1 ? JSON.parse(d.data || '{}') : null; } catch (e) {} if (st && st.hp) pc = { name: st.name || '', hp: Number(st.hp.cur) || 0, temp: Number(st.hp.temp) || 0, conds: (st.conditions || []).filter(c => c !== 'Concentrating') }; }
        if (!pc) return; const upd = Object.assign({ owner: d.owner || '' }, pc, { at: Date.now() });
        CARDS[id] = Object.assign({}, CARDS[id] || {}, upd); paint();
        await PC.doc(PID).collection('cards').doc(id).set(upd, { merge: true }).catch(() => {}); } catch (e) {} });
  }
  // ----- The party's invite link: /join/shattered-skies-k3x9q. Anyone with it can bring a character in. -----
  // The invitation (invites/<code>) carries what the join page shows before you're in: name, DM, picture, how many.
  const invOf = p => ({ p: p.id, name: p.name || '', dm: p.dm || '', dmName: p.dmName || '', at: Date.now(), n: (p.chars || []).length, pic: p.pic || '' });
  // (merged, so how many players a link is for, and how many have used it, stay put when the party's name or picture changes)
  const invPut = async (code, p, extra) => { const o = Object.assign(invOf(p), extra || {}); try { await IC.doc(code).set(o, { merge: true }); } catch (x) { if (!(x && x.code === 'permission-denied')) throw x; delete o.n; delete o.pic; await IC.doc(code).set(o, { merge: true }); } };
  // How many players an invite link is for (0 = anyone), and how many have joined with it.
  const INVUSE = {}; const invUse = code => INVUSE[code] ? Promise.resolve(INVUSE[code]) : IC.doc(code).get().then(d => (INVUSE[code] = d.exists ? { max: Number(d.data().max) || 0, used: Number(d.data().used) || 0 } : { max: 0, used: 0 }), () => ({ max: 0, used: 0 }));
  const invMaxSel = (v) => `<select id="pt-lmax" class="pty-lmax" aria-label="How many players the link is for"><option value="0"${!v ? ' selected' : ''}>any number of players</option>${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}"${v === n ? ' selected' : ''}>${n} player${n > 1 ? 's' : ''}</option>`).join('')}</select>`;
  // the invite panel as a picture, for the link's preview card (redrawn when the party's name, picture or size changes)
  const invCardKey = p => [p.name || '', (p.pic || '').length, (p.chars || []).length, p.dmName || ''].join('|');
  const invCard = async (code, p) => { try { const k = invCardKey(p); let was = null; try { was = localStorage.getItem('pg-invcard:' + code); } catch (e) {} if (was === k) return; const img = await pgInviteImage(p);
    await fs.collection('invcard').doc(code).set({ p: p.id, name: String(p.name || '').slice(0, 200), dmName: String(p.dmName || p.dm || '').slice(0, 200), n: (p.chars || []).length, img, at: Date.now() }); try { localStorage.setItem('pg-invcard:' + code, k); } catch (e) {} } catch (e) { console.warn('invite card', e); } };
  const invSync = p => { if (p && p.inv) { invPut(p.inv, p).catch(() => {}); invCard(p.inv, p); } };
  const invNew = async (p, max) => { const r = Array.from(crypto.getRandomValues(new Uint8Array(5)), b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
    const code = (partySlug(p.name) || 'party').slice(0, 40) + '-' + r, old = p.inv; max = Math.max(0, Math.min(50, Math.floor(Number(max) || 0)));
    await invPut(code, p, { max, used: 0 }); INVUSE[code] = { max, used: 0 }; invCard(code, p); await PC.doc(p.id).update({ inv: code, updatedAt: Date.now() }); if (old) { IC.doc(old).delete().catch(() => {}); fs.collection('invcard').doc(old).delete().catch(() => {}); } p.inv = code; return code; };
  const invLinkHTML = p => `<div class="pty-link${p.inv ? '' : ' off'}">
      <span class="pty-link-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg></span>
      ${p.inv ? `<span class="pty-link-t"><b>Invite link</b><code title="${esc(URLS.join(p.inv))}">${esc(URLS.join(p.inv).replace(/^https?:\/\//, ''))}</code></span>
        <span class="pty-link-b">${navigator.share ? '<button class="btn" id="pt-lshare">Share…</button>' : ''}<button class="btn gold" id="pt-lcopy">Copy link</button></span>`
      : `<span class="pty-link-t"><b>Invite link</b><small>Anyone you send it to can pick a character (or make one) and join.</small></span><span class="pty-link-b"><button class="btn gold" id="pt-lmake">Create link</button></span>`}
    </div><p class="hub-hint pty-link-h">${p.inv ? `<span id="pt-luse">${INVUSE[p.inv] ? invUseTxt(INVUSE[p.inv]) : 'Anyone with the link can join.'}</span> <button class="linkbtn" id="pt-lnew">Make a new link</button> for ${invMaxSel(0)} (this one stops working).` : `The link is for ${invMaxSel(0)}: once that many have joined with it, it stops working.`}</p>`;
  const invUseTxt = u => !u.max ? 'Anyone with the link can join.' : u.used >= u.max ? `Used up: ${u.max} of ${u.max} joined.` : `For ${u.max} player${u.max > 1 ? 's' : ''}: ${u.used ? u.used + ' joined, ' : ''}${u.max - u.used} spot${u.max - u.used > 1 ? 's' : ''} left.`;
  function wireLink(box, p) {
    const redraw = () => { const w = box.querySelector('.pty-linkw'); if (w) { w.innerHTML = invLinkHTML(p); wireLink(box, p); } };
    const mk = box.querySelector('#pt-lmake'); if (mk) mk.onclick = async () => { mk.disabled = true; mk.textContent = 'Creating…'; try { await invNew(p, (box.querySelector('#pt-lmax') || {}).value); redraw(); } catch (x) { mk.disabled = false; mk.textContent = 'Create link'; fail(x, 'make a link'); } };
    if (p.inv) invUse(p.inv).then(u => { const el = box.querySelector('#pt-luse'); if (el) el.textContent = invUseTxt(u); });
    const cp = box.querySelector('#pt-lcopy'); if (cp) cp.onclick = async () => { const u = URLS.join(p.inv); try { await navigator.clipboard.writeText(u); } catch (e) { const r = document.createRange(); r.selectNodeContents(box.querySelector('.pty-link code')); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); }
      cp.textContent = 'Copied!'; cp.classList.add('ok'); setTimeout(() => { cp.textContent = 'Copy link'; cp.classList.remove('ok'); }, 1800); };
    const sh = box.querySelector('#pt-lshare'); if (sh) sh.onclick = () => navigator.share({ title: 'Join ' + (p.name || 'my party'), text: 'Join ' + (p.name || 'my party') + ' on Adventurer’s Tome', url: URLS.join(p.inv) }).catch(() => {});
    const nw = box.querySelector('#pt-lnew'); if (nw) nw.onclick = () => { const mx = (box.querySelector('#pt-lmax') || {}).value; confirmBox('Make a new invite link?', 'The current link stops working. Anyone who already joined stays in the party.', 'Make a new link', async () => { await invNew(p, mx); toast('New link made. The old one no longer works.'); setTimeout(() => box === modal ? addDialog() : redraw(), 0); }); };
  }

  // ----- Add characters: ones you can see (shared with you, or your own), or ask someone by email -----
  function addHTML(p) {
    const ids = p.chars || [], have = c => ids.includes(c.id);
    const list = H.chars().filter(c => !have(c)).sort((a, b) => (a.owner === EMAIL ? 0 : 1) - (b.owner === EMAIL ? 0 : 1) || String(a.name || '').localeCompare(String(b.name || '')));
    const row = c => `<button class="pl-row pty-prow" data-add="${esc(c.id)}" data-q="${esc((String(c.name || '') + ' ' + (c.owner !== EMAIL ? H.nameOf(c.owner) : '')).toLowerCase())}">${H.pic(c)}<span class="pty-ct"><b>${esc(c.name || 'Unnamed character')}</b><small>${esc([[c.race, c.cls].filter(Boolean).join(' · ') || 'New character', c.owner !== EMAIL ? H.nameOf(c.owner) : 'Yours'].filter(Boolean).join(' · '))}</small></span><span class="pty-go">Add</span></button>`;
    return `<p class="hub-hint">Add one of your characters or one that’s been shared with you, or invite players with the link or by email: they choose which character to bring (or make a new one) when they accept.</p>
      <h4 class="pw-h4">Characters</h4>${list.length > 6 ? '<input id="pt-acq" class="ad-search pty-acq" type="search" placeholder="Search characters or players" autocomplete="off">' : ''}${list.length ? `<div class="pl-list pty-pick">${list.map(row).join('')}</div>` : '<p class="hub-hint">No characters to add yet: make one, or ask a player to share theirs with you.</p>'}
      <h4 class="pw-h4">Invite players</h4><div class="pty-linkw">${invLinkHTML(p)}</div>
      <form id="pt-inv-f" class="who-f pl-f sh-f pty-invf"><input id="pt-inv-e" type="email" placeholder="Or invite by email address" autocomplete="off" required><button class="btn gold">Invite</button></form>
      <div class="pty-invl">${(p.invited || []).map(em => `<span class="pty-invd">${esc(em)} <small>invited</small></span>`).join('')}</div>`;
  }
  function wireAdd(box, p) {
    wireLink(box, p);
    const aq = box.querySelector('#pt-acq'); if (aq) aq.oninput = () => { const q = aq.value.trim().toLowerCase(); box.querySelectorAll('.pty-pick [data-add]').forEach(r => { r.hidden = !!q && !r.dataset.q.includes(q); }); };
    H.peoplePicker(box.querySelector('#pt-inv-e'));
    box.querySelector('#pt-inv-f').onsubmit = async e => { e.preventDefault(); const inp = box.querySelector('#pt-inv-e'), em = inp.value.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast('Type an email address.'); return; }
      if ((p.invited || []).includes(em)) { toast(em + ' is already invited.'); return; }
      try { await PC.doc(p.id).update({ invited: FV.arrayUnion(em), updatedAt: Date.now() }); pgLog('party_invite', { target: p.id, tName: p.name, detail: em }); p.invited = (p.invited || []).concat([em]); inp.value = '';
        const l = box.querySelector('.pty-invl'); if (l) l.insertAdjacentHTML('beforeend', `<span class="pty-invd">${esc(em)} <small>invited</small></span>`); toast('Invited ' + em + '. They’ll see it on their characters page.'); } catch (x) { fail(x, 'invite them'); } };
    box.querySelectorAll('[data-add]').forEach(b => b.onclick = async () => { const c = H.chars().find(x => x.id === b.dataset.add); if (!c) return; b.disabled = true; const g = b.querySelector('.pty-go'); g.textContent = 'Adding…';
      try { await addChar(c, p); p.chars = (p.chars || []).concat([c.id]); g.textContent = 'Added'; } catch (x) { b.disabled = false; g.textContent = 'Add'; fail(x, 'add it'); } });
  }
  function addDialog() {
    modal.innerHTML = `<div class="hub-card wide pty-keep pty-addc"><h2>Add characters</h2>${addHTML(P)}<div class="row"><button class="btn gold" id="ac-x">Done</button></div></div>`;
    modal.classList.add('on'); wireAdd(modal, P);
    modal.querySelector('#ac-x').onclick = () => { close(); paint(); };
  }
  // Bring a character in: your own joins straight away; someone else's is added by the DM, and its sheet learns which
  // party it's in the next time its player opens it.
  async function addChar(c, p) {
    if (c.owner === EMAIL) return ptyJoin(fs, EMAIL, p.id, c.id, p.inv || '', cardOf(c));
    let pc = null; try { const s = await fs.collection('sheets').doc(c.id).get(); pc = s.exists && s.data().pcard ? JSON.parse(s.data().pcard) : null; } catch (e) {}
    await PC.doc(p.id).update({ chars: FV.arrayUnion(c.id), people: FV.arrayUnion(c.owner), invited: FV.arrayRemove(c.owner), updatedAt: Date.now() });
    await PC.doc(p.id).collection('cards').doc(c.id).set(Object.assign({ owner: c.owner, name: c.name || '', race: c.race || '', cls: c.cls || '', level: c.level || 0, thumb: c.thumb || '', player: H.nameOf(c.owner || ''), path: c.path || '' }, pc || {}, { at: Date.now() }), { merge: true }).catch(() => {});
    if ((c.editors || []).includes(EMAIL)) await ptySetSheetParty(fs, c.id, p.id).catch(() => {});
    pgLog('party_add', { target: p.id, tName: p.name, detail: c.name || c.id });
  }
  const fail = (x, what) => toast(x && x.code === 'permission-denied' ? 'You can’t do that in this party.' : 'Couldn’t ' + what + ': ' + ((x && x.message) || x));
  // ----- Turn order: the DM's initiative tracker, a small window like Roll20's. Every character in the party is in it;
  // the DM types the numbers, or they fill in by themselves when a player rolls initiative on their sheet (any dice mode
  // where the sheet sees the total). Kept on this device per party; the top row is whose turn it is. -----
  const TKEY = () => 'pg-turn:' + PID;
  let TO = null, unI = null, INIT = {};
  const toLoad = () => { let t = null; try { t = JSON.parse(localStorage.getItem(TKEY()) || 'null'); } catch (e) {} t = t && typeof t === 'object' ? t : {};
    return { rows: Array.isArray(t.rows) ? t.rows : [], round: Number(t.round) || 1, cut: Number(t.cut) || 0, x: t.x, y: t.y, open: !!t.open }; };
  const toSave = () => { if (!TO) return; try { localStorage.setItem(TKEY(), JSON.stringify(TO)); } catch (e) {} };
  // Brings the list in line with the party: new characters added (at the bottom), departed ones dropped; fills rolls.
  function toSync() {
    if (!TO || !P) return false; let ch = false; const ids = P.chars || [];
    TO.rows = TO.rows.filter(r => { const keep = r.custom || ids.includes(r.id); if (!keep) ch = true; return keep; });
    ids.forEach(id => { if (!TO.rows.some(r => r.id === id)) { TO.rows.push({ id, v: '', at: 0 }); ch = true; } });
    TO.rows.forEach(r => { const i = !r.custom && INIT[r.id]; if (i && Number(i.at) > Math.max(Number(r.at) || 0, TO.cut) && typeof i.v === 'number') { r.v = i.v; r.at = Number(i.at); r.fresh = Date.now(); ch = true; } });
    return ch;
  }
  function initWatch() {
    if (unI || !PID || !actor()) return;
    unI = PC.doc(PID).collection('init').onSnapshot(qs => { const was = INIT; INIT = {}; qs.docs.forEach(d => INIT[d.id] = d.data());
      if (!TO) TO = toLoad(); const got = qs.docChanges().filter(x => x.type !== 'removed' && Number(x.doc.data().at) > TO.cut && (!was[x.doc.id] || was[x.doc.id].at !== x.doc.data().at));
      if (toSync()) { toSave(); toPaint(); if (got.length && !document.getElementById('towin')) { const d = got[0].doc.data(); toast(`${d.n || 'A player'} rolled ${Number(d.v)} for initiative. It’s in your Turn order.`); } } }, () => {});
  }
  const toRowHTML = (r, i) => { const c = r.custom ? { name: r.name } : cardFor(r.id), nm = c.name || 'Unnamed';
    const pic = r.custom ? `<span class="to-pic to-np">${esc(initials(nm))}</span>` : c.thumb ? `<img class="to-pic" src="${esc(c.thumb)}" alt="">` : `<span class="to-pic to-np">${esc(initials(nm))}</span>`;
    return `<li class="to-row${i === 0 ? ' cur' : ''}${r.fresh && Date.now() - r.fresh < 4000 ? ' fresh' : ''}" data-i="${i}">${pic}<span class="to-nm" title="${esc(nm)}">${esc(nm)}</span><input class="to-v" data-i="${i}" inputmode="numeric" value="${esc(String(r.v ?? ''))}" aria-label="Initiative for ${esc(nm)}"><button class="to-x" data-x="${i}" title="Take off the list" aria-label="Remove ${esc(nm)}">×</button></li>`; };
  function toPaint() {
    const w = document.getElementById('towin'); if (!w || !TO) return;
    const ae = document.activeElement; if (ae && ae.classList.contains('to-v') && w.contains(ae)) { clearTimeout(toPaint.t); toPaint.t = setTimeout(toPaint, 700); return; }
    w.querySelector('.to-list').innerHTML = TO.rows.length ? TO.rows.map(toRowHTML).join('') : '<li class="to-empty">No one yet.</li>';
    w.querySelector('.to-rnd b').textContent = TO.round;
    w.querySelectorAll('.to-v').forEach(x => { x.onchange = () => { const r = TO.rows[+x.dataset.i]; if (!r) return; const t = x.value.trim(); r.v = t === '' ? '' : (isNaN(Number(t)) ? t : Number(t)); r.at = Date.now(); toSave(); };
      x.onkeydown = e => { if (e.key === 'Enter') { x.blur(); const n = w.querySelector(`.to-v[data-i="${+x.dataset.i + 1}"]`); if (n) n.focus(); } }; });
    w.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { TO.rows.splice(+b.dataset.x, 1); toSave(); toPaint(); });
  }
  function turnOrder(show) {
    if (!actor()) return; if (!TO) TO = toLoad(); toSync();
    let w = document.getElementById('towin'); if (w) { if (!show) { w.remove(); TO.open = false; toSave(); } return; }
    w = document.createElement('div'); w.id = 'towin'; w.className = 'towin'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Turn order');
    w.innerHTML = `<div class="to-hd"><span class="to-tt">Turn Order</span><button class="to-c" title="Close" aria-label="Close">×</button></div>
      <ol class="to-list"></ol>
      <div class="to-ft"><button class="to-b" data-to="sort" title="Sort highest first">Sort</button><button class="to-b" data-to="add" title="Add someone who isn’t in the party (a monster, an NPC)">+ Add</button><button class="to-b" data-to="clear" title="Start a new fight: clears the numbers">Clear</button>
        <span class="grow"></span><span class="to-rnd">Round <b>1</b></span><button class="to-b to-arr" data-to="prev" title="Previous turn" aria-label="Previous turn">‹</button><button class="to-b to-arr to-next" data-to="next" title="Next turn" aria-label="Next turn">›</button></div>`;
    document.body.appendChild(w);
    const vw = innerWidth, vh = innerHeight, W = Math.min(300, vw - 16);
    w.style.left = Math.max(8, Math.min(vw - W - 8, TO.x != null ? TO.x : vw - W - 24)) + 'px'; w.style.top = Math.max(8, Math.min(vh - 120, TO.y != null ? TO.y : 90)) + 'px';
    TO.open = true; toSave(); toPaint();
    // drag by the title bar
    const hd = w.querySelector('.to-hd'); hd.onpointerdown = e => { if (e.target.closest('button')) return; e.preventDefault();
      if (innerWidth <= 640) { const y0 = e.clientY; hd.setPointerCapture(e.pointerId); hd.onpointermove = m => { w.style.transform = `translateY(${Math.max(0, m.clientY - y0)}px)`; };
        hd.onpointerup = m => { hd.onpointermove = hd.onpointerup = null; if (m.clientY - y0 > 70) turnOrder(false); else w.style.transform = ''; }; return; }
      const r = w.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top; hd.setPointerCapture(e.pointerId); w.classList.add('drag');
      hd.onpointermove = m => { const x = Math.max(0, Math.min(innerWidth - r.width, m.clientX - ox)), y = Math.max(0, Math.min(innerHeight - 40, m.clientY - oy)); w.style.left = x + 'px'; w.style.top = y + 'px'; };
      hd.onpointerup = () => { hd.onpointermove = hd.onpointerup = null; w.classList.remove('drag'); TO.x = parseFloat(w.style.left); TO.y = parseFloat(w.style.top); toSave(); }; };
    w.querySelector('.to-c').onclick = () => turnOrder(false);
    w.querySelectorAll('[data-to]').forEach(b => b.onclick = () => { const a = b.dataset.to; document.activeElement && document.activeElement.blur && document.activeElement.blur();
      // the round goes up each time the turn comes back round to whoever was on top after sorting
      const num = r => r.v === '' || isNaN(Number(r.v)) ? -Infinity : Number(r.v);
      if (a === 'sort') { TO.rows.sort((x, y) => num(y) - num(x)); TO.rows.forEach((r, i) => r.first = i === 0); }
      if ((a === 'next' || a === 'prev') && TO.rows.length && !TO.rows.some(r => r.first)) TO.rows[0].first = true;
      if (a === 'next' && TO.rows.length > 1) { TO.rows.push(TO.rows.shift()); if (TO.rows[0].first) TO.round++; }
      if (a === 'prev' && TO.rows.length > 1) { if (TO.rows[0].first) TO.round = Math.max(1, TO.round - 1); TO.rows.unshift(TO.rows.pop()); }
      if (a === 'add') return askText('Add to the turn order', '', 60, v => { TO.rows.push({ custom: true, id: 'x' + Date.now().toString(36), name: v, v: '', at: Date.now() }); toSave(); toPaint(); });
      if (a === 'clear') { TO.rows = TO.rows.filter(r => !r.custom).map(r => ({ id: r.id, v: '', at: 0 })); TO.round = 1; TO.cut = Date.now(); Object.keys(INIT).forEach(id => PC.doc(PID).collection('init').doc(id).delete().catch(() => {})); }
      toSave(); toPaint(); });
  }
  function wirePage(el) {
    const $1 = s => root.querySelector(s), on = (s, f) => { const b = $1(s); if (b) b.onclick = f; };
    on('#pt-ren', () => askText('Rename the party', P.name || '', 60, async v => { await PC.doc(PID).update({ name: v, updatedAt: Date.now() }); invSync(Object.assign({}, P, { id: PID, name: v })); }));
    on('#pt-pic', async () => { const k = 'party:' + PID, cur = P.pic;
      const pic = cur ? await new Promise(res => picChoice(cur, () => pgRecrop(k, cur, { shape: 'square', size: 256, title: 'Party picture' }).then(r => res(r ? r.url : ''), () => res('')), () => pickPic(k).then(res))) : await pickPic(k); if (!pic) return; try { await PC.doc(PID).update({ pic, updatedAt: Date.now() }); invSync(Object.assign({}, P, { id: PID, pic })); toast('Picture updated.'); } catch (x) { fail(x, 'save the picture'); } });
    on('#pt-add', () => addDialog());
    on('#pt-all', () => sendDialog(null));
    on('#pt-turn', () => turnOrder(!document.getElementById('towin')));
    initWatch(); if (actor() && !document.getElementById('towin') && (TO || toLoad()).open) turnOrder(true); else if (TO && document.getElementById('towin') && toSync()) { toSave(); toPaint(); }
    el.querySelectorAll('[data-uninv]').forEach(b => b.onclick = async () => { const em = b.dataset.uninv; try { await PC.doc(PID).update({ invited: FV.arrayRemove(em) }); } catch (x) { fail(x, 'cancel it'); } });
    on('#pt-leave', () => { const mine = (P.chars || []).filter(id => (CARDS[id] || {}).owner === EMAIL), pid = PID, pnm = P.name || ''; confirmBox(`Leave ${esc(pnm || 'the party')}?`, `${mine.length > 1 ? 'Your characters leave' : 'Your character leaves'} the party. The DM can invite you again.`, 'Leave', async () => { LEAVING = true; try { for (const id of mine) await ptyLeave(fs, EMAIL, pid, id, { owner: EMAIL }); } catch (x) { LEAVING = false; throw x; } try { localStorage.removeItem(PKEY(pid)); } catch (e) {} pgLog('party_leave', { target: pid, tName: pnm }); close(); toast('You left ' + (pnm || 'the party') + '.'); pgGo(URLS.parties(G)); }); });
    on('#pt-off', async () => { try { await PC.doc(PID).update({ people: FV.arrayRemove(EMAIL), invited: FV.arrayRemove(EMAIL), updatedAt: Date.now() }); pgGo(URLS.parties(G)); } catch (x) { fail(x, 'do that'); } });
    on('#pt-del', () => deleteParty(P, () => pgGo(URLS.parties(G))));
    el.querySelectorAll('.hc-dots').forEach(b => b.onclick = e => { e.stopPropagation(); const w = b.parentElement, o = !w.classList.contains('on'); el.querySelectorAll('.hc-menu.on').forEach(x => x.classList.remove('on')); w.classList.toggle('on', o); });
    el.querySelectorAll('[data-q]').forEach(b => b.onclick = () => quickHP(b));
    el.querySelectorAll('.pm-q').forEach(x => x.onkeydown = e => { if (e.key === 'Enter') { const b = x.closest('.pm').querySelector('[data-q=dmg]'); if (b) quickHP(b); } });
    el.querySelectorAll('[data-pm]').forEach(b => b.onclick = () => { const id = b.dataset.id, c = CARDS[id] || {}; const m = b.closest('.hc-menu'); if (m) m.classList.remove('on');
      if (b.dataset.pm === 'send') sendDialog(id);
      if (b.dataset.pm === 'open') pgGo(hrefOf(id, c));
      if (b.dataset.pm === 'rm') { const self = c.owner === EMAIL && !canRun(P), pid = PID, pnm = P.name || '', lastMine = self && (P.chars || []).filter(x => (CARDS[x] || {}).owner === EMAIL).length <= 1;
        confirmBox(self ? `Leave ${esc(pnm || 'the party')}?` : `Remove ${esc(c.name || 'this character')}?`, 'It leaves the party: the others no longer see it, and nothing more can be sent to it. The character isn’t deleted.', self ? 'Leave' : 'Remove',
        async () => { if (lastMine) LEAVING = true; try { await ptyLeave(fs, EMAIL, pid, id, { owner: c.owner, asMgr: c.owner !== EMAIL }); } catch (x) { LEAVING = false; throw x; } pgLog('party_remove', { target: pid, tName: pnm, detail: c.name || id }); close(); toast((c.name || 'The character') + ' left the party.'); if (lastMine) { try { localStorage.removeItem(PKEY(pid)); } catch (e) {} pgGo(URLS.parties(G)); } }); } });
  }
  function askText(title, val, max, save) {
    modal.innerHTML = `<div class="hub-card"><h2>${esc(title)}</h2><form id="at-f" class="who-f"><input id="at-n" maxlength="${max}" value="${esc(val)}" required></form><div class="row"><button class="btn ghost" id="at-x">Cancel</button><button class="btn gold" id="at-ok">Save</button></div></div>`;
    modal.classList.add('on'); const inp = modal.querySelector('#at-n'); setTimeout(() => { inp.focus(); inp.select(); }, 30);
    const go = async () => { const v = inp.value.replace(/\s+/g, ' ').trim().slice(0, max); if (!v) return; try { await save(v); close(); } catch (x) { fail(x, 'save it'); } };
    modal.querySelector('#at-f').onsubmit = e => { e.preventDefault(); go(); }; modal.querySelector('#at-ok').onclick = go; modal.querySelector('#at-x').onclick = close;
  }
  function confirmBox(title, text, label, go) {
    modal.innerHTML = `<div class="hub-card"><h2>${title}</h2><p class="hub-hint">${esc(text)}</p><div class="row"><button class="btn ghost" id="cb-x">Cancel</button><button class="btn red" id="cb-ok">${esc(label)}</button></div></div>`;
    modal.classList.add('on'); modal.querySelector('#cb-x').onclick = close;
    modal.querySelector('#cb-ok').onclick = async e => { e.target.disabled = true; try { await go(); close(); } catch (x) { e.target.disabled = false; fail(x, 'do that'); } };
  }
  // Admins: hand a party to a different DM (an account's email; admins get suggestions as they type).
  function changeDM(p) {
    modal.innerHTML = `<div class="hub-card"><h2>Change the DM</h2><p class="hub-hint">${esc(p.name || 'The party')} is run by ${esc(p.dmName || H.nameOf(p.dm) || p.dm)}. The new DM sees every character in it and can send them things.</p>
      <form id="dm-f" class="who-f pl-f sh-f"><input id="dm-e" type="email" placeholder="Their name or email" autocomplete="off" required><button class="btn gold">Make DM</button></form><button class="btn ghost" id="dm-x">Cancel</button></div>`;
    modal.classList.add('on'); H.peoplePicker(modal.querySelector('#dm-e')); modal.querySelector('#dm-x').onclick = close; setTimeout(() => modal.querySelector('#dm-e').focus(), 30);
    modal.querySelector('#dm-f').onsubmit = async e => { e.preventDefault(); const em = modal.querySelector('#dm-e').value.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast('Type an email address.'); return; }
      const nm = H.nameOf(em) === em ? '' : H.nameOf(em);
      try { await PC.doc(p.id).update({ dm: em, dmName: nm, people: FV.arrayUnion(em), mgrs: [], updatedAt: Date.now() });
        invSync(Object.assign({}, p, { dm: em, dmName: nm }));
        pgLog('party_dm', { target: p.id, tName: p.name, detail: 'DM is now ' + em }); close(); toast((nm || em) + ' is now the DM of ' + (p.name || 'the party') + '.'); } catch (x) { fail(x, 'change the DM'); } };
  }
  function deleteParty(p, after) {
    confirmBox(`Delete ${esc(p.name || 'this party')}?`, 'The party is gone for everyone in it. The characters aren’t deleted — they just aren’t in a party anymore.', 'Delete party', async () => {
      const ref = PC.doc(p.id), cs = await ref.collection('cards').get().catch(() => null);
      if (cs) for (const d of cs.docs) await d.ref.delete().catch(() => {});
      if (IS_ADMIN) for (const c of p.chars || []) await ptySetSheetParty(fs, c, '').catch(() => {});
      if (p.inv) await IC.doc(p.inv).delete().catch(() => {});
      await ref.delete(); pgLog('party_delete', { target: p.id, tName: p.name }); toast((p.name || 'The party') + ' was deleted.'); if (after) after(); });
  }

  // ----- the DM sends something to one character, or to everyone -----
  // Loot comes from the same lists as the sheet's Add an item (loaded only when needed).
  let DNDP = null; const loadDND = () => DNDP || (DNDP = window.DND && window.DND.gear ? Promise.resolve() : fetch(window.PG_ASSETS.data).then(r => r.text()).then(t => { const s = document.createElement('script'); s.textContent = t; document.body.appendChild(s); }).catch(() => {}));
  const lootList = () => { const D = window.DND || {}, out = []; (D.weapons || []).forEach(w => out.push([w[0], 'Weapon'])); (D.armor || []).forEach(a => out.push([a[0], 'Armor'])); (D.gear || []).forEach(g => out.push([g[0], 'Gear'])); (D.magic || []).forEach(m => { if (!/^(Weapon|Armor|Shield|Ammunition) \+\d$/.test(m[0])) out.push([m[0], (m[3] || 'magic') + ' magic item']); }); return out; };
  // ----- Party actions: the DM picks who (everyone, or some), what, and the details -----
  const SI = d => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const PA_KINDS = [
    ['dmg', 'Damage', SI('<path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6M16 16l4 4M19 21l2-2"/>')],
    ['heal', 'Heal', SI('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/><path d="M12 9v6M9 12h6"/>')],
    ['temp', 'Temp HP', SI('<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M12 9v6M9 12h6"/>')],
    ['save', 'Saving throw', SI('<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>')],
    ['cond', 'Condition', SI('<circle cx="12" cy="12" r="9"/><path d="M8 15s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01"/>')],
    ['loot', 'Give item', SI('<path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/>')],
    ['coins', 'Give coins', SI('<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>')],
    ['insp', 'Inspiration', SI('<path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z"/>')],
    ['rest', 'Rest', SI('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>')],
    ['msg', 'Message', SI('<path d="M4 5h16v11H8l-4 4z"/>')]];
  function sendDialog(id) {
    const all = (P.chars || []).slice(); let sel = new Set(id ? [id] : all), kind = 'dmg';
    const F = { n: '', type: '', save: 'DEX', dc: '', half: true, sdmg: '', why: '', conds: [], exh: '0', cmode: 'add', rounds: '', item: '', qty: 1, note: '', coins: {}, split: true, rest: 'short', msg: '' };
    const nm = i => (CARDS[i] || {}).name || 'A character';
    const whoTxt = () => { const n = sel.size; return n === all.length && n > 1 ? 'everyone' : n === 1 ? nm([...sel][0]) : n + ' characters'; };
    const goTxt = () => { const n = Number(F.n) || 0, w = whoTxt(); return { dmg: n ? `Deal ${n} damage to ${w}` : `Damage ${w}`, heal: F.n === 'max' ? `Heal ${w} to full` : n ? `Heal ${w} ${n} HP` : `Heal ${w}`, temp: n ? `Give ${w} ${n} temp HP` : `Give ${w} temp HP`, cond: F.conds.length ? `${F.cmode === 'rm' ? 'Remove' : 'Add'} ${F.conds.length > 2 ? F.conds.length + ' conditions' : F.conds.join(' and ')}${F.exh !== '0' ? ' + exhaustion' : ''}` : F.exh !== '0' ? `Change ${w}’s exhaustion` : `${F.cmode === 'rm' ? 'Remove' : 'Add'} conditions`, save: `Ask ${w} for a ${F.save} save${Number(F.dc) ? ' (DC ' + Number(F.dc) + ')' : ''}`, loot: `Give ${w} ${F.item ? (Number(F.qty) > 1 ? F.qty + ' × ' : '') + F.item : 'an item'}`, coins: `Give ${w} coins`, insp: `Give ${w} Inspiration`, rest: `Ask ${w} for a ${F.rest} rest`, msg: `Send to ${w}` }[kind]; };
    const chip = i => { const c = cardFor(i); return `<button class="pa-who${sel.has(i) ? ' on' : ''}" data-who="${esc(i)}" aria-pressed="${sel.has(i)}">${c.thumb ? `<img src="${esc(c.thumb)}" alt="">` : `<span class="pa-ini">${esc(initials(c.name || '?'))}</span>`}<span class="pa-wt"><b>${esc(c.name || 'A character')}</b>${Number(c.maxhp) ? `<small>${Number(c.hp) || 0}/${c.maxhp} HP</small>` : ''}</span></button>`; };
    const seg = (key, opts) => `<div class="pa-seg">${opts.map(([v, t]) => `<button class="${String(F[key]) === String(v) ? 'on' : ''}" data-f="${key}" data-v="${esc(v)}">${esc(t)}</button>`).join('')}</div>`;
    const field = (lbl, html, cls) => `<label class="pa-fld${cls ? ' ' + cls : ''}"><span>${lbl}</span>${html}</label>`;
    const inp = (key, o = {}) => `<input class="pa-in${o.num ? ' num' : ''}" data-in="${key}" value="${esc(F[key] === 'max' ? '' : F[key])}"${o.num ? ' type="number" min="0" inputmode="numeric"' : ''}${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.list ? ` list="${o.list}"` : ''}${o.max ? ` maxlength="${o.max}"` : ''}>`;
    const form = () => {
      if (kind === 'dmg') return `<div class="pa-row">${field('Amount', inp('n', { num: 1, ph: '0' }), 'sm')}${field('Damage type', `<select class="pa-in" data-in="type"><option value="">Any</option>${PTY_DMG.map(t => `<option${F.type === t ? ' selected' : ''}>${t}</option>`).join('')}</select>`)}</div>
        ${field('What hit them <em>(they see this)</em>', inp('why', { ph: 'e.g. Falling rocks', max: 80 }))}<p class="pa-note">${F.save ? 'Each player rolls the save on their sheet; the damage lands once they have.' : 'It’s taken off their HP straight away (after temp HP, resistances and immunities).'}</p>`;
      if (kind === 'heal') return `<div class="pa-row">${field('Amount', inp('n', { num: 1, ph: '0' }), 'sm')}<button class="btn${F.n === 'max' ? ' gold' : ''} pa-full" data-f="n" data-v="max">To full HP</button></div>${field('From what <em>(optional)</em>', inp('why', { ph: 'e.g. A night at the temple', max: 80 }))}`;
      if (kind === 'temp') return `${field('Temporary HP', inp('n', { num: 1, ph: '0' }), 'sm')}${field('From what <em>(optional)</em>', inp('why', { ph: 'e.g. Inspiring speech', max: 80 }))}<p class="pa-note">Temporary HP don’t stack: anyone who already has more keeps theirs.</p>`;
      if (kind === 'save') return `${field('Ability', seg('save', [['STR', 'STR'], ['DEX', 'DEX'], ['CON', 'CON'], ['INT', 'INT'], ['WIS', 'WIS'], ['CHA', 'CHA']]))}
        <div class="pa-row">${field('DC', inp('dc', { num: 1, ph: '15' }), 'sm')}${field('What it’s for <em>(they see this)</em>', inp('why', { ph: 'e.g. Collapsing bridge', max: 80 }))}</div>
        <div class="pa-row">${field('Damage if they fail <em>(optional)</em>', inp('sdmg', { num: 1, ph: '0' }), 'sm')}${Number(F.sdmg) ? field('Damage type', `<select class="pa-in" data-in="type"><option value="">Any</option>${PTY_DMG.map(t => `<option${F.type === t ? ' selected' : ''}>${t}</option>`).join('')}</select>`) : ''}</div>
        ${Number(F.sdmg) ? `<label class="pa-chk"><input type="checkbox" data-in="half"${F.half ? ' checked' : ''}> Half damage on a success</label>` : ''}
        <p class="pa-note">Each player rolls on their sheet and is told straight away whether they made it.</p>`;
      if (kind === 'cond') return `${field('Add or remove', seg('cmode', [['add', 'Add'], ['rm', 'Remove']]))}
        <div class="pa-cchips">${PTY_CONDS.map(c => `<button class="pa-cchip${F.conds.includes(c) ? ' on' : ''}" data-cc="${c}" aria-pressed="${F.conds.includes(c)}"><span class="ci">${PTY_CI[c] || '•'}</span>${c}</button>`).join('')}</div>
        ${field('Exhaustion', seg('exh', [['0', 'No change'], ['1', '+1 level'], ['-1', '−1 level']]))}
        ${F.cmode === 'add' && F.conds.length ? `<div class="pa-row">${field('For how many rounds <em>(optional)</em>', inp('rounds', { num: 1, ph: 'until removed' }), 'sm')}${field('Why <em>(optional)</em>', inp('why', { ph: 'e.g. Spider bite', max: 80 }))}</div>` : ''}`;
      if (kind === 'loot') return `${field('Item', inp('item', { ph: 'Search the item lists, or type your own', list: 'pa-ql', max: 120 }))}<datalist id="pa-ql"></datalist>
        <div class="pa-row">${field('How many', inp('qty', { num: 1 }), 'sm')}${field('Notes <em>(optional)</em>', inp('note', { ph: 'e.g. Engraved with a raven', max: 300 }))}</div><p class="pa-note">Items from the lists arrive with their stats (weapons, armor, magic items); anything else arrives as a custom item. ${sel.size > 1 ? 'Each of them gets this many.' : ''}</p>`;
      if (kind === 'coins') return `<div class="pa-coins">${['pp', 'gp', 'ep', 'sp', 'cp'].map(c => `<label class="pa-fld"><span>${c.toUpperCase()}</span><input class="pa-in num" data-coin="${c}" type="number" min="0" inputmode="numeric" placeholder="0" value="${esc(F.coins[c] || '')}"></label>`).join('')}</div>
        ${sel.size > 1 ? `${field('How', seg('split', [[true, 'Split it between them'], [false, 'Each gets this much']]))}` : ''}`;
      if (kind === 'insp') return `<p class="pa-note big">${sel.size > 1 ? 'Each of them gets' : 'They get'} Inspiration: advantage on one attack roll, saving throw or ability check of their choice.</p>`;
      if (kind === 'rest') return `${field('Which rest', seg('rest', [['short', 'Short rest'], ['long', 'Long rest']]))}<p class="pa-note">It pops up on their sheet with a button to take it, so they still choose hit dice, spells and the rest.</p>`;
      return `${field('Message', `<textarea class="pa-in" data-in="msg" rows="3" maxlength="500" placeholder="It pops up on their sheet">${esc(F.msg)}</textarea>`)}`;
    };
    // The window is drawn once; choosing who, what or an option only redraws the part that changed (no flashing).
    let built = false, lastKind = null;
    const paintD = () => {
      if (!built || !modal.querySelector('.hub-card.pa')) { built = true;
        modal.innerHTML = `<div class="hub-card wide pty-keep pa"><h2>Party actions</h2>
          <div class="pa-body"><div class="pa-h">Who</div><div class="pa-whos"></div><div class="pa-h">What</div><div class="pa-kinds"></div><div class="pa-form"></div></div>
          <div class="row pa-foot"><button class="btn ghost" id="sd-x">Close</button><button class="btn gold" id="sd-go"></button></div></div>`;
        modal.classList.add('on'); const card = modal.querySelector('.pa');
        card.querySelector('#sd-x').onclick = () => { close(); paint(); };
        card.querySelector('#sd-go').onclick = go;
        card.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || !card.contains(b)) return;
          if (b.dataset.who) { const w = b.dataset.who; if (w === '*') sel = sel.size === all.length ? new Set() : new Set(all); else sel.has(w) ? sel.delete(w) : sel.add(w); paintD(); }
          else if (b.dataset.kind) { kind = b.dataset.kind; if (kind !== 'heal' && F.n === 'max') F.n = ''; paintD(); }
          else if (b.dataset.cc) { const c = b.dataset.cc; F.conds = F.conds.includes(c) ? F.conds.filter(x => x !== c) : F.conds.concat([c]); paintD(); }
          else if (b.dataset.f) { const k = b.dataset.f, v = b.dataset.v; F[k] = v === 'true' ? true : v === 'false' ? false : v; paintD(); } });
        card.addEventListener('input', e => { const x = e.target;
          if (x.dataset.in) { F[x.dataset.in] = x.type === 'checkbox' ? x.checked : x.value; goBtn(); }
          else if (x.dataset.coin) F.coins[x.dataset.coin] = x.value; });
        card.addEventListener('change', e => { const x = e.target; if (x.dataset.in) { F[x.dataset.in] = x.type === 'checkbox' ? x.checked : x.value; if (x.type === 'checkbox' || x.tagName === 'SELECT') paintD(); else goBtn(); } });
      }
      const card = modal.querySelector('.pa');
      card.querySelector('.pa-whos').innerHTML = `${all.length > 1 ? `<button class="pa-who all${sel.size === all.length ? ' on' : ''}" data-who="*"><span class="pa-ini">${IC_PARTY}</span><span class="pa-wt"><b>Everyone</b><small>${plural(all.length, 'character')}</small></span></button>` : ''}${all.map(chip).join('')}`;
      card.querySelector('.pa-kinds').innerHTML = PA_KINDS.map(([k, t, ic]) => `<button class="pa-kind${kind === k ? ' on' : ''}" data-kind="${k}">${ic}<span>${t}</span></button>`).join('');
      // the form keeps whatever box you're typing in: it's only redrawn when what it shows changes
      const fh = form(), fb = card.querySelector('.pa-form');
      if (fb.dataset.h !== fh) { const a = document.activeElement, key = a && fb.contains(a) && (a.dataset.in || a.dataset.coin); fb.innerHTML = fh; fb.dataset.h = fh;
        const back = key && fb.querySelector(`[data-in="${key}"], [data-coin="${key}"]`); if (back) back.focus(); }
      if (kind === 'loot') loadDND().then(() => { const dl = card.querySelector('#pa-ql'); if (dl && !dl.options.length) dl.innerHTML = lootList().map(([n, t]) => `<option value="${esc(n)}">${esc(t)}</option>`).join(''); });
      if (kind !== lastKind) { lastKind = kind; const first = fb.querySelector('input:not([type=checkbox]), textarea'); if (first && !TOUCH) first.focus(); }
      goBtn();
    };
    const goBtn = () => { const g = modal.querySelector('#sd-go'); if (g && !g.dataset.busy) { g.textContent = goTxt(); g.disabled = !sel.size; } };
    const go = () => { const ids = all.filter(i => sel.has(i)); if (!ids.length) return toast('Choose who it’s for.');
      const n = Math.max(0, Math.floor(Number(F.n) || 0)), why = String(F.why || '').trim(), by = why || (actor() || {}).why || 'The DM';
      if (kind === 'dmg') { if (!n) return toast('Type how much damage.'); return send(ids, ['hit', { dmg: n, type: F.type, why: by }]); }
      if (kind === 'save') { const dc = Math.floor(Number(F.dc) || 0), dmg = Math.max(0, Math.floor(Number(F.sdmg) || 0)); if (!dc) return toast('Type the DC.'); return send(ids, ['hit', { dmg, type: dmg ? F.type : '', why: by, save: F.save, dc, half: dmg ? !!F.half : false, saveOnly: !dmg }]); }
      if (kind === 'heal') return F.n === 'max' ? send(ids, ['heal', { amt: 'max', why: by }]) : n ? send(ids, ['heal', { amt: n, why: by }]) : toast('Type how much to heal, or choose To full HP.');
      if (kind === 'temp') return n ? send(ids, ['temp', { amt: n, why: by }]) : toast('Type how many temporary HP.');
      if (kind === 'cond') { const ex = Number(F.exh) || 0; if (!F.conds.length && !ex) return toast('Pick a condition (or an exhaustion change).');
        return send(ids, F.cmode === 'rm' || !F.conds.length ? ['cure', { conds: F.cmode === 'rm' ? F.conds.slice() : [], exh: ex, why: by }] : ['cond', { conds: F.conds.slice(), cond: F.conds[0], exh: ex, rounds: Number(F.rounds) || 0, why: by }]); }
      if (kind === 'loot') { const it = String(F.item || '').trim().slice(0, 120); if (!it) return toast('Pick or type an item.'); return send(ids, ['loot', { name: it, qty: Math.max(1, Math.floor(Number(F.qty) || 1)), notes: String(F.note || '').trim() }]); }
      if (kind === 'coins') { const c = {}; Object.keys(F.coins).forEach(k => { const x = Math.max(0, Math.floor(Number(F.coins[k]) || 0)); if (x) c[k] = x; }); if (!Object.keys(c).length) return toast('Type some coins.'); return send(ids, ['coins', c], ids.length > 1 && F.split); }
      if (kind === 'insp') return send(ids, ['inspire', {}]);
      if (kind === 'rest') return send(ids, ['rest', { kind: F.rest }]);
      const m = String(F.msg || '').trim(); if (!m) return toast('Type a message.'); return send(ids, ['note', { text: m }]); };
    const send = async (ids, [k, data], split) => {
      const b = modal.querySelector('#sd-go'); if (b) { b.disabled = true; b.dataset.busy = '1'; b.textContent = 'Sending…'; } let ok = 0;
      for (let j = 0; j < ids.length; j++) { let d = data;
        if (split) { d = {}; Object.keys(data).forEach(c => { const each = Math.floor(data[c] / ids.length), rest = data[c] - each * ids.length, x = each + (j === 0 ? rest : 0); if (x) d[c] = x; }); if (!Object.keys(d).length) continue; }
        const a = actor(); if (!a) break; try { await ptySend(fs, EMAIL, PID, ids[j], k, Object.assign({}, d, { ask: true }), a.from, a.name); ok++; } catch (x) { console.warn(x); } }
      if (b) { delete b.dataset.busy; goBtn(); }
      if (ok) { close(); paint(); toast(sentMsg(actor(), `Sent to ${ok === 1 ? nm(ids[0]) : plural(ok, 'character')}`)); pgLog('party_send', { target: PID, tName: P.name, detail: k + ' → ' + whoTxt() }); } else toast('Couldn’t send it — check your connection.');
    };
    paintD();
  }

  // ----- admin: every party, and whether it's in your own list -----
  let AROWS = [], ALIVE = null;
  // Admins: put any character on the site in a party (it moves out of any party it's in now). Its owner is added to
  // the party, the character is shared with the DM, and its sheet learns which party it's in.
  function adminAddChar(p) {
    const lib = fs.collection('groups/' + G + '/chars');
    modal.innerHTML = `<div class="hub-card wide pty-keep"><h2>Add a character to ${esc(p.name || 'the party')}</h2><p class="hub-hint">Any character on the site. It moves here from any party it’s in now.</p><input id="aa-q" class="ad-search" placeholder="Search by character name" autocomplete="off"><div class="pl-list pty-pick" id="aa-l"></div><div class="row"><button class="btn gold" id="aa-x">Done</button></div></div>`;
    modal.classList.add('on'); const q = modal.querySelector('#aa-q'), l = modal.querySelector('#aa-l'); let t = null;
    const show = async () => { const v = q.value.trim().toLowerCase().slice(0, 24);
      try { const r = await (v ? lib.where('keys', 'array-contains', v).limit(30) : lib.orderBy('updatedAt', 'desc').limit(30)).get();
        const rows = r.docs.map(d => Object.assign({ id: d.id }, d.data())).filter(c => !(p.chars || []).includes(c.id)); await H.needNames(rows.map(c => c.owner));
        l.innerHTML = rows.map(c => `<button class="pl-row pty-prow" data-aa="${esc(c.id)}">${H.pic(c)}<span class="pty-ct"><b>${esc(c.name || 'Unnamed character')}</b><small>${esc([[c.race, c.cls].filter(Boolean).join(' · '), H.nameOf(c.owner || '')].filter(Boolean).join(' · '))}</small></span><span class="pty-go">Add</span></button>`).join('') || '<p class="hub-hint">Nothing matches.</p>';
        l.querySelectorAll('[data-aa]').forEach(b => b.onclick = async () => { const c = rows.find(x => x.id === b.dataset.aa); if (!c) return; b.disabled = true; const g = b.querySelector('.pty-go'); g.textContent = 'Adding…';
          try { const sh = await fs.collection('sheets').doc(c.id).get(), sd = sh.exists ? sh.data() : {}; const old = sd.party || '';
            if (old && old !== p.id) await ptyLeave(fs, EMAIL, old, c.id, { owner: c.owner, asMgr: true }).catch(() => {});
            let pc = null; try { pc = sd.pcard ? JSON.parse(sd.pcard) : null; } catch (e) {}
            await PC.doc(p.id).update({ chars: FV.arrayUnion(c.id), people: FV.arrayUnion(c.owner), invited: FV.arrayRemove(c.owner), updatedAt: Date.now() });
            await PC.doc(p.id).collection('cards').doc(c.id).set(Object.assign({ owner: c.owner, name: c.name || '', race: c.race || '', cls: c.cls || '', level: c.level || 0, thumb: c.thumb || '', player: H.nameOf(c.owner || ''), path: c.path || '' }, pc || {}, { at: Date.now() }), { merge: true }).catch(() => {});
            await ptySetSheetParty(fs, c.id, p.id).catch(() => {});
            await ptyShareDM(fs, c.id, p.dm, Object.assign({ g: G }, sd)).catch(() => {});
            p.chars = (p.chars || []).concat([c.id]); g.textContent = 'Added'; pgLog('party_add', { target: p.id, tName: p.name, detail: c.name || c.id }); }
          catch (x) { b.disabled = false; g.textContent = 'Add'; fail(x, 'add it'); } }); } catch (x) { l.innerHTML = '<p class="hub-hint">Couldn’t search: ' + esc(x.message || x) + '</p>'; } };
    q.oninput = () => { clearTimeout(t); t = setTimeout(show, 200); }; show(); setTimeout(() => q.focus(), 30);
    modal.querySelector('#aa-x').onclick = close;
  }
  function adminTab(B, A) {
    const el = B(); A.HA().innerHTML = '';
    el.innerHTML = `<div class="adm-filters">${A.toolbar('ad-pq', 'Search by party, DM or character', A.PQ.v)}</div><div id="ad-pl"><div class="sk-auto" data-n="6"></div></div>`;
    const q = el.querySelector('#ad-pq'); let t = null; q.oninput = () => { clearTimeout(t); t = setTimeout(() => { A.PQ.v = q.value; adminPaint(B, A); }, 150); };
    if (!ALIVE) ALIVE = PC.limit(1000).onSnapshot(async qs => { AROWS = qs.docs.map(d => Object.assign({ id: d.id }, d.data())); await H.needNames(AROWS.map(p => p.dm)); if (A.isTab()) adminPaint(B, A); }, x => { const l = B().querySelector('#ad-pl'); if (l) l.innerHTML = A.failMsg(x); });
    else adminPaint(B, A);
  }
  const accessOf = p => p.dm === EMAIL ? 'dm' : (p.mgrs || []).includes(EMAIL) ? 'codm' : (p.people || []).includes(EMAIL) ? 'view' : '';
  function adminPaint(B, A) {
    const l = B() && B().querySelector('#ad-pl'); if (!l) return; if (A.busy()) return A.later(() => adminPaint(B, A));
    const qv = String(A.PQ.v || '').trim().toLowerCase();
    const rows = AROWS.filter(p => !qv || [p.name, p.dmName, H.nameOf(p.dm), p.dm].some(x => String(x || '').toLowerCase().includes(qv))).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const cnt = B().querySelector('#ad-pq-n'); if (cnt) cnt.textContent = rows.length + ' of ' + plural(AROWS.length, 'party').replace('partys', 'parties');
    l.innerHTML = rows.length ? `<div class="adm-tw"><table class="adm-t"><thead><tr><th>Party</th><th>DM</th><th>Characters</th><th>My access</th><th>Updated</th><th>Created</th><th></th></tr></thead><tbody>${rows.map(p => { const a = accessOf(p);
      return `<tr><td><a class="adm-char" href="${esc(URLS.party(p.id, p.name))}">${p.pic ? `<img class="hc-pic pty-admic" src="${esc(p.pic)}" alt="">` : `<span class="hc-pic hc-nopic pty-admic">${IC_PARTY}</span>`}<span><b>${esc(p.name || 'Unnamed party')}</b><small>${(p.invited || []).length ? plural(p.invited.length, 'invitation') + ' open' : plural((p.people || []).length, 'person').replace('persons', 'people')}</small></span></a></td>
        <td><button class="adm-who adm-dmbtn" data-pdm="${esc(p.id)}" title="Change the DM">${A.ava(H.nameOf(p.dm || ''), p.dm)}<span>${esc(p.dmName || H.nameOf(p.dm || '') || '—')}</span></button></td><td>${(p.chars || []).length}</td>
        <td>${a === 'dm' ? '<span class="adm-tag r-own">You’re the DM</span>' : `<select class="adm-sel" data-pacc="${esc(p.id)}" aria-label="My access"><option value="">None</option><option value="view"${a === 'view' ? ' selected' : ''}>In my list</option><option value="codm"${a === 'codm' ? ' selected' : ''}>Co-DM</option></select>`}</td>
        <td>${A.when(p.updatedAt)}</td><td>${A.when(p.createdAt)}</td><td class="adm-act">${A.kebab([['open', 'Open', p.id], ['add', 'Add a character…', p.id], ['dm', 'Change DM…', p.id], ['del', 'Delete party…', p.id, 'danger']])}</td></tr>`; }).join('')}</tbody></table></div>` : `<p class="adm-empty">${AROWS.length ? 'No parties match.' : 'No parties yet.'}</p>`;
    l.querySelectorAll('[data-pacc]').forEach(sl => sl.onchange = async () => { const v = sl.value, ref = PC.doc(sl.dataset.pacc), p = AROWS.find(x => x.id === sl.dataset.pacc);
      try { await ref.update(v === 'codm' ? { people: FV.arrayUnion(EMAIL), mgrs: FV.arrayUnion(EMAIL) } : v ? { people: FV.arrayUnion(EMAIL), mgrs: FV.arrayRemove(EMAIL) } : { people: FV.arrayRemove(EMAIL), mgrs: FV.arrayRemove(EMAIL) });
        toast(v === 'codm' ? 'You’re now a co-DM of ' + (p.name || 'the party') + '.' : (p.name || 'The party') + (v ? ' is in your list.' : ' is out of your list.')); pgLog('party_access', { target: p.id, tName: p.name, detail: v === 'codm' ? 'made themselves co-DM' : v ? 'added it to their list' : 'took it off their list' }); }
      catch (x) { fail(x, 'change it'); sl.value = accessOf(p) === 'dm' ? '' : accessOf(p); } });
    l.querySelectorAll('[data-pdm]').forEach(b => b.onclick = () => { const p = AROWS.find(x => x.id === b.dataset.pdm); if (p) changeDM(p); });
    l.querySelectorAll('[data-mi]').forEach(b => b.onclick = () => { const p = AROWS.find(x => x.id === b.dataset.id); A.closeMenus(); if (!p) return; if (b.dataset.mi === 'open') pgGo(URLS.party(p.id, p.name)); if (b.dataset.mi === 'dm') changeDM(p); if (b.dataset.mi === 'add') adminAddChar(p); if (b.dataset.mi === 'del') deleteParty(p, () => adminPaint(B, A)); });
  }

  listen();
  return { saveOrder, paneHTML, count, wirePane, partyPage, joinPage, adminTab, refresh: () => paint(), newParty: () => pgGo(URLS.party('new')) };
}
