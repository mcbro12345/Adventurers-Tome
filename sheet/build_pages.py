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

loader = ('''
<div id="pg-load" style="position:fixed;inset:0;display:grid;place-items:center;background:#f6f1e6;color:#1f2a44;font:600 15px system-ui,sans-serif;z-index:9999">Loading…</div>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
<script>
''' + open(os.path.join(D, 'pages_loader.js')).read() + '''
</script>
''').replace('__CFG__', json.dumps(cfg)).replace('__VER__', VER)
h = html.index('</head>'); html = html[:h] + '<style>' + open(os.path.join(D, 'pages.css')).read() + '</style>\n' + html[h:]
k = html.rindex('</body>')
html = html[:k] + loader + html[k:]
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'index.html'), 'w').write(html)
open(os.path.join(OUT, 'version.json'), 'w').write(json.dumps({'v': VER}))
open(os.path.join(OUT, '.nojekyll'), 'w').write('')
print('pages built', VER, len(html))
