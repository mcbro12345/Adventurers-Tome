# Builds the GitHub Pages site from the normal blank sheet (run build.py first).
# The page holds no character: ?c=<id> loads that character from Firestore and keeps it synced.
import json, os, time, sys
D = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, 'pages')
cfg = json.load(open(os.path.join(D, 'pages_config.json')))
html = open(os.path.join(D, 'DnD_Character_Sheet.html')).read()
VER = time.strftime('%Y%m%d%H%M%S')

# Swap the app script for an inert copy; the loader below runs it once the character has been fetched.
i = html.rindex('<script>\n')
j = html.index('</script>', i)
app = html[i + len('<script>\n'):j]
html = html[:i] + '<script type="text/plain" id="app-src">\n' + app + '</script>' + html[j + len('</script>'):]

loader = r'''
<div id="pg-load" style="position:fixed;inset:0;display:grid;place-items:center;background:#f6f1e6;color:#1f2a44;font:600 15px system-ui,sans-serif;z-index:9999">Loading your sheet…</div>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
<script>
(async () => {
  const CFG = __CFG__, VER = '__VER__';
  let C = (new URLSearchParams(location.search).get('c') || '').replace(/[^A-Za-z0-9_-]/g, '');
  // No ?c=: a brand-new character. It gets its own private id now; the link appears once the character is created.
  const NEW = !C;
  if (NEW) { const a = new Uint8Array(18); crypto.getRandomValues(a); C = btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  window.SHEET_PAGES = true; window.SHEET_CHAR = C;
  const load = document.getElementById('pg-load'), data = document.getElementById('sheet-data');
  const CACHE = 'dnd-pages-cache:' + C;
  let fs = null;
  try { firebase.initializeApp(CFG); fs = firebase.firestore(); } catch (e) { console.error(e); }
  const run = () => { if (load) load.remove(); const s = document.createElement('script'); s.textContent = document.getElementById('app-src').textContent; document.body.appendChild(s); };
  if (!fs) { if (NEW) delete window.SHEET_CHAR; run(); return; }
  // Fetch the character (split across part documents when large).
  const col = fs.collection('sheets');
  let txt = null, missing = false;
  if (!NEW) try {
    const sn = await col.doc(C).get();
    if (!sn.exists || !sn.data().data) missing = true;
    else {
      const d = sn.data(); let str = d.data || ''; const n = Number(d.n) || 1;
      for (let k = 1; k < n; k++) { const p = await col.doc(C + '_p' + k).get(); const pd = p.exists ? p.data() : null; if (!pd || Number(pd.savedAt) !== Number(d.savedAt)) { str = null; break; } str += pd.data || ''; }
      if (str) { JSON.parse(str); txt = str; try { localStorage.setItem(CACHE, str); } catch (e) {} }
    }
  } catch (e) { console.warn('Offline or blocked — using this browser\'s copy', e); }
  if (!txt && !NEW) { try { txt = localStorage.getItem(CACHE); } catch (e) {} }
  if (!txt && !NEW) {
    if (load) load.innerHTML = missing ? '<div style="max-width:420px;text-align:center;padding:20px">This sheet link doesn\'t point to a character.<br><br><small style="font-weight:400">Check the link you were sent, or ask your DM for it again.</small></div>' : '<div style="max-width:420px;text-align:center;padding:20px">Couldn\'t reach the sheet\'s storage.<br><br><small style="font-weight:400">Check your connection and reload.</small></div>';
    return;
  }
  if (txt) data.textContent = txt;
  // The sheet's sync code talks to "db" like it does on claude.ai; here that's this character's Firestore documents.
  const docFor = p => { const m = /^sheets\/(main|part(\d+))$/.exec(p); return m ? col.doc(m[2] ? C + '_p' + m[2] : C) : null; };
  const none = { get: async () => ({ exists: false, data: () => null }), set: async () => { throw { code: 'unsupported' }; }, delete: async () => {}, onSnapshot: () => () => {} };
  const db = { doc: p => { const r = docFor(p); return r ? { get: () => r.get(), set: v => r.set(v), delete: () => r.delete(), onSnapshot: (cb, err) => r.onSnapshot(cb, err) } : none; } };
  const user = { id: async () => null, isOwner: async () => true, can: async () => true };
  window.claude = { use: async n => n === 'db' ? db : n === 'user' ? user : null };
  run();
  // New character: once it's created (and saved to the cloud), its private link goes in the address bar.
  if (NEW) { const t = setInterval(() => { let made = false; try { const st = window.sheetState && window.sheetState(); made = !!(st && st.created); } catch (e) {} if (!made) return; clearInterval(t);
    history.replaceState(null, '', location.pathname + '?c=' + C);
    const link = location.href, copy = () => { try { navigator.clipboard.writeText(link); window.sheetToast('Link copied.'); } catch (e) {} };
    setTimeout(() => window.sheetToast(`<div><b>This character has its own link now</b><div class="det">It's in the address bar — bookmark it or copy it. Open it on any device to get this character, synced live. Keep it private: anyone with the link can edit the character.</div></div>`, '', 20000, { label: 'Copy link', fn: copy }), 600);
  }, 500); }
  // A newer version of the sheet was pushed: offer a reload (the character is saved first).
  const check = async () => { try { const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' }); const v = (await r.json()).v; if (v && v !== VER && !document.getElementById('pg-upd')) { const b = document.createElement('button'); b.id = 'pg-upd'; b.textContent = 'Sheet updated — tap to reload'; b.style.cssText = 'position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:9998;background:#c9962b;color:#1b1406;border:0;border-radius:999px;padding:10px 18px;font:700 14px system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3);cursor:pointer'; b.onclick = () => { b.textContent = 'Saving…'; setTimeout(() => location.reload(), 1200); }; document.body.appendChild(b); } } catch (e) {} };
  setInterval(check, 5 * 60 * 1000); document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
})();
</script>
'''.replace('__CFG__', json.dumps(cfg)).replace('__VER__', VER)
k = html.rindex('</body>')
html = html[:k] + loader + html[k:]
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'index.html'), 'w').write(html)
open(os.path.join(OUT, 'version.json'), 'w').write(json.dumps({'v': VER}))
open(os.path.join(OUT, '.nojekyll'), 'w').write('')
print('pages built', VER, len(html))
