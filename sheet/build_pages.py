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
DTXT = html[i + len('<script>\n'):j]; html = html[:i] + html[j + len('</script>'):]
# The full rules wording (what a spell or feature says when you tap it) is most of the game data, but a sheet can open
# without it — tooltips show the short summary until it arrives. So it's its own file, fetched right after the sheet appears.
FT = open(os.path.join(D, 'data', 'fulltext.js')).read()
assert DTXT.count(FT) == 1, 'fulltext not found in the data'
DATA = asset('data', 'js', DTXT.replace(FT, '') + '\nDND.full = DND.full || {}; DND.fullSRD = DND.fullSRD || [];')
FULL = asset('full', 'js', FT)

loader = ('''
<script>document.documentElement.classList.add('pg-loading');try{var n=+sessionStorage.getItem('pg-nav');if(n&&Date.now()-n<8000){document.documentElement.classList.add('pg-instant');window.PG_NAV_T=n}sessionStorage.removeItem('pg-nav')}catch(e){}</script>
<div id="pg-load"><div class="pg-spin" role="status" aria-label="Loading"><svg class="pg-ld20" viewBox="0 0 100 100" width="72" height="72" aria-hidden="true"><defs><linearGradient id="pglg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1d58a"/><stop offset=".55" stop-color="#c9962b"/><stop offset="1" stop-color="#8a6420"/></linearGradient></defs><polygon points="50,4 91,27 91,73 50,96 9,73 9,27" fill="rgba(201,150,43,.14)" stroke="url(#pglg)" stroke-width="4" stroke-linejoin="round"/><g fill="none" stroke="url(#pglg)" stroke-width="2.6" stroke-linejoin="round"><polygon points="50,24 73,63 27,63"/><path d="M50 4 L50 24 M91 27 L73 63 M91 73 L73 63 M50 96 L73 63 M50 96 L27 63 M9 73 L27 63 M9 27 L27 63 M9 27 L50 24 M91 27 L50 24"/></g><text x="50" y="55" text-anchor="middle" font-family="Georgia,serif" font-weight="800" font-size="15" fill="#f6e7bd"></text></svg><b>Adventurer’s Tome</b><small>Rolling for initiative…</small></div></div>
<script>/* the loading die rolls over and over, like the logo's: a tumble with the face flickering, then it lands on a number for a moment.
   pgDieRoll(screen, ms) starts it ms into a roll, so a page that was opened from another page carries on the very same roll. */
(function(){var K=[{offset:0,transform:'rotate(0deg) scale(1)',easing:'cubic-bezier(.3,0,.6,1)'},{offset:.18,transform:'rotate(150deg) scale(1.1) translateY(-4px)',easing:'linear'},{offset:.5,transform:'rotate(520deg) scale(1.06) translateY(-2px)',easing:'cubic-bezier(.15,.6,.35,1)'},{offset:.84,transform:'rotate(732deg) scale(.98)',easing:'cubic-bezier(.4,0,.4,1)'},{offset:1,transform:'rotate(720deg) scale(1)'}],R=function(){return 1+Math.floor(Math.random()*20)},D=1150,P=900;
window.pgDieRoll=function(scr,at){var d=scr&&scr.querySelector('.pg-ld20');if(!d||!d.animate)return;var f=d.querySelector('text');
function roll(start){if(!scr.isConnected)return;d.classList.remove('crit','fumble');var a=d.animate(K,{duration:D});if(start)a.currentTime=start;var nx=0,t=function(){var e=Number(a.currentTime)||0;if(a.playState==='finished')return;if(e>=nx&&e<1030){f.textContent=R();nx=e+45+230*Math.pow(e/D,2)}requestAnimationFrame(t)};requestAnimationFrame(t);
a.finished.then(function(){var n=R();f.textContent=n;d.classList.toggle('crit',n===20);d.classList.toggle('fumble',n===1);setTimeout(function(){roll(0)},P)})}
at=at||0;if(at<D)roll(at);else setTimeout(function(){roll(0)},Math.max(0,D+P-at))};
var s=document.getElementById('pg-load');if(!s)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches){var tx=s.querySelector('text');if(tx)tx.textContent='20';return}
if(window.PG_NAV_T)pgDieRoll(s,0);else setTimeout(function(){pgDieRoll(s,0)},150)})();</script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script>
''' + open(os.path.join(D, 'pages_loader.js')).read() + '''
</script>
''').replace('__CFG__', json.dumps(cfg)).replace('__VER__', VER).replace('__ASSETS__', json.dumps({'data': DATA, 'app': APP, 'full': FULL}))
html = re.sub(r'<title>[^<]*</title>', '<title>Adventurer’s Tome</title>', html, count=1)
# Files are referenced relative to the site root, so /chad-brooker/hiro still finds a/…, icons and version.json.
# (The github.io copy lives in a sub-folder, so its root is that folder.)
h = html.index('<head>') + len('<head>')
html = html[:h] + '<script>document.write(\'<base href="\' + (/github\\.io$/.test(location.hostname) ? location.pathname.replace(/[^/]*$/, "") : "/") + \'">\')</script>' + html[h:]
html = html.replace('<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">')
h = html.index('</head>'); html = html[:h] + '<link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" type="image/png" sizes="192x192" href="icon-192.png"><link rel="icon" type="image/png" sizes="32x32" href="icon-32.png"><meta name="apple-mobile-web-app-title" content="Adventurer’s Tome"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="description" content="D&amp;D 5e character sheets that do the math, track your resources and roll your dice. Build a character step by step, level up with a guided wizard, and share sheets with your party. An optional companion browser extension sends your rolls straight into your Roll20 game."><meta property="og:type" content="website"><meta property="og:site_name" content="adventurers-tome.web.app"><meta property="og:title" content="Adventurer’s Tome"><meta property="og:description" content="D&amp;D 5e character sheets that do the math, track your resources and roll your dice. Build a character step by step, level up with a guided wizard, and share sheets with your party. An optional companion browser extension sends your rolls straight into your Roll20 game."><meta property="og:url" content="https://adventurers-tome.web.app/"><meta property="og:image" content="https://adventurers-tome.web.app/og-roll.gif?v=2"><meta property="og:image:type" content="image/gif"><meta property="og:image:width" content="800"><meta property="og:image:height" content="420"><meta property="og:image:alt" content="Adventurer’s Tome — a gold d20 rolling a natural 20"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Adventurer’s Tome"><meta name="twitter:description" content="D&amp;D 5e character sheets that do the math, track your resources and roll your dice. Build a character step by step, level up with a guided wizard, and share sheets with your party. An optional companion browser extension sends your rolls straight into your Roll20 game."><meta name="twitter:image" content="https://adventurers-tome.web.app/og-roll.gif?v=2"><meta name="theme-color" content="#c9962b"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="mobile-web-app-capable" content="yes">\n' + html[h:]
h = html.index('</head>'); html = html[:h] + '<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#0f1420">' + html[h:]
# Light / dark: by default the site follows the device. Someone can pick one in the lobby (saved on this device), so every
# "(prefers-color-scheme: X)" block is rewritten to apply when the device says X and nothing was picked, or when X was picked.
def theme_css(css):
    def split_top(sel):
        out, d, cur = [], 0, ''
        for ch in sel:
            if ch in '([': d += 1
            if ch in ')]': d -= 1
            if ch == ',' and d == 0: out.append(cur); cur = ''
            else: cur += ch
        out.append(cur); return out
    def pre(sel, cond):
        sel = sel.strip()
        if not sel: return sel
        if sel.startswith('html') and (len(sel) == 4 or not (sel[4].isalnum() or sel[4] in '-_')): return 'html:where(' + cond + ')' + sel[4:]
        if sel.startswith(':root'): return 'html:where(' + cond + ')' + sel[5:]
        return ':where(html' + cond + ') ' + sel
    def block_end(t, i):  # t[i] == '{'
        d = 0
        for j in range(i, len(t)):
            if t[j] == '{': d += 1
            elif t[j] == '}':
                d -= 1
                if d == 0: return j
        return len(t) - 1
    def prefix_rules(body, cond):
        out, i = '', 0
        while i < len(body):
            j = body.find('{', i)
            if j < 0: out += body[i:]; break
            k = block_end(body, j); head = body[i:j]; inner = body[j + 1:k]
            if head.strip().startswith('@'): out += head + '{' + prefix_rules(inner, cond) + '}'
            else:
                lead = head[:len(head) - len(head.lstrip())]
                out += lead + ', '.join(pre(x, cond) for x in split_top(head.strip())) + ' {' + inner + '}'
            i = k + 1
        return out
    out, i = '', 0
    rx = re.compile(r'@media([^{]*?)\(prefers-color-scheme:\s*(dark|light)\)([^{]*)\{')
    while True:
        m = rx.search(css, i)
        if not m: out += css[i:]; break
        out += css[i:m.start()]; j = m.end() - 1; k = block_end(css, j); body = css[j + 1:k]; mode = m.group(2)
        rest = (m.group(1) + m.group(3)).strip()
        rest = re.sub(r'^and\s+|\s+and$', '', rest).strip()
        auto = '@media ' + (rest + ' and ' if rest else '') + '(prefers-color-scheme: ' + mode + ') {' + prefix_rules(body, ':not([data-pgtheme])') + '}'
        forced = prefix_rules(body, '[data-pgtheme="' + mode + '"]')
        out += auto + '\n' + ('@media ' + rest + ' {' + forced + '}' if rest else forced)
        i = k + 1
    return out
PGCSS = theme_css(open(os.path.join(D, 'pages.css')).read().replace(':where(body.hubbody, #pg-load)', ':where(body.hubbody, #pg-load, .wzh)').replace(':where(body.hubbody)', ':where(body.hubbody, .wzh)'))
h = html.index('</head>'); html = html[:h] + '<script>try{var t=localStorage.getItem("pg-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-pgtheme",t)}catch(e){}</script><style>' + PGCSS + '</style>\n' + html[h:]
k = html.rindex('</body>')
html = html[:k] + loader + html[k:]
open(os.path.join(OUT, 'index.html'), 'w').write(html)
open(os.path.join(OUT, 'version.json'), 'w').write(json.dumps({'v': VER}))
open(os.path.join(OUT, '.nojekyll'), 'w').write('')
import shutil
for n in (32, 180, 192, 512): shutil.copy(os.path.join(D, 'icons', f'icon-{n}.png'), os.path.join(OUT, f'icon-{n}.png'))
# Lets phones install the site as an app (Add to Home Screen): name, icons, and opening full screen.
open(os.path.join(OUT, 'manifest.webmanifest'), 'w').write(json.dumps({'name': 'Adventurer’s Tome', 'short_name': 'Adventurer’s Tome', 'id': './', 'start_url': './', 'scope': './',
  'display': 'standalone', 'background_color': '#0f1420', 'theme_color': '#0f1420', 'description': 'D&D 5e character sheets that do the math, track your resources and roll your dice.',
  'icons': [{'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png'}],
  'related_applications': [{'platform': 'webapp', 'url': 'https://adventurers-tome.web.app/manifest.webmanifest'}]}, ensure_ascii=False, indent=1))
shutil.copy(os.path.join(D, 'icons', 'og-roll.gif'), os.path.join(OUT, 'og-roll.gif'))  # the picture shown when a link is pasted in Discord, Slack and the like
print('pages built', VER, len(html))
