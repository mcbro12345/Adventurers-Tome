import re
# Builds the GitHub Pages site from the normal blank sheet (run build.py first).
# The page holds no character: ?c=<id> loads that character from Firestore and keeps it synced.
import json, os, time, sys
D = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, 'pages')
cfg = json.load(open(os.path.join(D, 'pages_config.json')))
html = open(os.path.join(D, 'DnD_Character_Sheet.html')).read()
VER = time.strftime('%Y%m%d%H%M%S')
os.makedirs(OUT, exist_ok=True)

# Big pieces go into versioned files under a/ that browsers keep for a year (the name changes whenever the content
# does), so a repeat visit downloads only the small page. The loader fetches the game data and the app only when a
# sheet is opened — the party page never needs them.
import hashlib, glob
A = os.path.join(OUT, 'a'); os.makedirs(A, exist_ok=True)
def asset(kind, ext, text):
    h = hashlib.sha256(text.encode()).hexdigest()[:12]; name = f'{kind}.{h}.{ext}'
    open(os.path.join(A, name), 'w').write(text)
    # keep the last few versions so a page still open from an older update can finish loading
    old = sorted(glob.glob(os.path.join(A, f'{kind}.*.{ext}')), key=os.path.getmtime)
    for f in old[:-6]: os.remove(f)
    return 'a/' + name
i = html.rindex('<script>\n'); j = html.index('</script>', i)
APP = asset('app', 'js', html[i + len('<script>\n'):j]); html = html[:i] + html[j + len('</script>'):]
i = html.index('<style>'); j = html.index('</style>', i)
CSS = asset('sheet', 'css', html[i + len('<style>'):j]); html = html[:i] + '<link rel="stylesheet" href="' + CSS + '">' + html[j + len('</style>'):]
i = html.index('<script>\n// Rules content'); j = html.index('</script>', i)
DATA = asset('data', 'js', html[i + len('<script>\n'):j]); html = html[:i] + html[j + len('</script>'):]

loader = ('''
<script>document.documentElement.classList.add('pg-loading')</script>
<div id="pg-load"><div class="pg-spin" role="status" aria-label="Loading"><svg viewBox="0 0 100 100" width="64" height="64" aria-hidden="true"><g fill="none" stroke="#c9962b" stroke-width="3.2" stroke-linejoin="round"><polygon points="50,6 89,28 89,72 50,94 11,72 11,28" fill="rgba(201,150,43,.10)"/><polygon points="50,24 72,62 28,62"/><path d="M50 6 L50 24 M89 28 L72 62 M89 72 L72 62 M50 94 L72 62 M50 94 L28 62 M11 72 L28 62 M11 28 L28 62 M11 28 L50 24 M89 28 L50 24"/></g><text x="50" y="54" text-anchor="middle" font-family="Georgia,serif" font-weight="800" font-size="15" fill="#f3e7c6">20</text></svg><b>Adventurer’s Tome</b><small>Rolling for initiative…</small></div></div>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script>
''' + open(os.path.join(D, 'pages_loader.js')).read() + '''
</script>
''').replace('__CFG__', json.dumps(cfg)).replace('__VER__', VER).replace('__ASSETS__', json.dumps({'data': DATA, 'app': APP}))
html = re.sub(r'<title>[^<]*</title>', '<title>Adventurer’s Tome</title>', html, count=1)
# Files are referenced relative to the site root, so /chad-brooker/hiro still finds a/…, icons and version.json.
# (The github.io copy lives in a sub-folder, so its root is that folder.)
h = html.index('<head>') + len('<head>')
html = html[:h] + '<script>document.write(\'<base href="\' + (/github\\.io$/.test(location.hostname) ? location.pathname.replace(/[^/]*$/, "") : "/") + \'">\')</script>' + html[h:]
h = html.index('</head>'); html = html[:h] + '<link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" type="image/png" sizes="192x192" href="icon-192.png"><link rel="icon" type="image/png" sizes="32x32" href="icon-32.png"><meta name="apple-mobile-web-app-title" content="Adventurer’s Tome">\n' + html[h:]
h = html.index('</head>'); html = html[:h] + '<style>' + open(os.path.join(D, 'pages.css')).read() + '</style>\n' + html[h:]
k = html.rindex('</body>')
html = html[:k] + loader + html[k:]
open(os.path.join(OUT, 'index.html'), 'w').write(html)
open(os.path.join(OUT, 'version.json'), 'w').write(json.dumps({'v': VER}))
open(os.path.join(OUT, '.nojekyll'), 'w').write('')
import shutil
for n in (32, 180, 192, 512): shutil.copy(os.path.join(D, 'icons', f'icon-{n}.png'), os.path.join(OUT, f'icon-{n}.png'))
print('pages built', VER, len(html))
