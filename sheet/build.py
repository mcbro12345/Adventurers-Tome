import json, re, os
D = os.path.dirname(os.path.abspath(__file__))
T = open(os.path.join(D, '..', 'template.html')).read()
head_script = T[T.index('<script>'):T.index('</script>') + 9]
css = T[T.index('<style>') + 7:T.index('</style>')]
css = css.replace("/* Palette pulled from Zeke's mini: ivory tunic, golden cape, brass hilt,\n     slate-blue leather, navy trim, misty teal-grey sky. */", "/* Default palette: ivory, navy and gold. Accent and banner can be themed per character. */")
extra = open(os.path.join(D, 'src', 'extra.css')).read()
import sys; sys.path.insert(0, D); from hoverguard import guard
css = guard(css); extra = guard(extra)
order = ['classes1', 'classes2', 'classes3', 'options', 'races', 'backgrounds_feats', 'gear', 'magic', 'rules', 'spells1', 'ua_classes_a', 'ua_classes_b', 'ua_races', 'ua_misc', 'spells2', 'creatures', 'auto', 'deck', 'featfx', 'fx_barbarian_bard', 'fx_cleric_druid', 'fx_fighter_monk', 'fx_paladin_ranger', 'fx_rogue_sorcerer', 'fx_warlock_wizard_artificer', 'fx_races', 'fx_feats_options', 'fx_ua', 'fx_ua2', 'fulltext']
data = '\n'.join(open(os.path.join(D, 'data', f + '.js')).read() for f in order if os.path.exists(os.path.join(D, 'data', f + '.js')))
# The Roll20 companion extension ships inside the sheet (Settings → Dice → Download extension).
import base64
ext = {n: ('b64:' + base64.b64encode(open(os.path.join(D, 'ext', n), 'rb').read()).decode() if n.endswith('.png') else open(os.path.join(D, 'ext', n)).read()) for n in sorted(os.listdir(os.path.join(D, 'ext')))}
data += '\nDND.r20ext = ' + json.dumps(ext).replace('</', '<\\/') + ';'
app = '\n'.join(open(os.path.join(D, 'src', f'app{i}.js')).read() for i in [1, 8, 2, 3, 4, 6, 7, 9, 10, 11, 5])
for bad in ['</script', '<!--']:
    assert bad not in data and bad not in app, bad
embed = json.dumps({'created': False, 'dataRev': 'blank-1'})
html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>D&amp;D 5e Character Sheet</title>
{head_script}
<style>
{css}
{extra}
</style>
</head>
<body>
<header class="banner"><div class="wrap" id="sec-header"></div></header>
<main class="wrap">
  <section class="vitals" id="sec-vitals"></section>
  <nav class="tabs" id="tabs" role="tablist"></nav>
  <section class="page" id="page-core"></section>
  <section class="page" id="page-combat"></section>
  <section class="page" id="page-spells"></section>
  <section class="page" id="page-features"></section>
  <section class="page" id="page-inventory"></section>
  <section class="page" id="page-infusions"></section>
  <section class="page" id="page-companions"></section>
  <section class="page" id="page-story"></section>
  <section class="page" id="page-notes"></section>
</main>
<div class="wizard" id="wizard"></div>
<div class="modal-bg" id="modal"><div class="modal" role="dialog" aria-modal="true" id="modal-body"></div></div>
<div class="toasts" id="toasts" aria-live="polite"></div>
<input type="file" id="importFile" accept="application/json,.json" hidden>
<input type="file" id="portraitFile" accept="image/*" hidden>
<input type="file" id="picFile" accept="image/*" hidden>
<input type="file" id="updateFile" accept=".html,.htm,text/html" hidden>
<script>
// Rules content: SRD plus short summaries of options from the permitted 5e (2014) books.
// (Wrapped in a block so a newer version of the sheet can be loaded into this same page by Settings → Update.)
{{
{data}
}}
</script>
<script id="sheet-data" type="application/json">{embed}</script>
<script>
{app}
</script>
</body>
</html>
'''
out = os.path.join(D, 'DnD_Character_Sheet.html')
open(out, 'w').write(html)
print(out, len(html))
# Debug copy for tests: exposes internals as window.__t
i = html.rindex('})();')
open(os.path.join(D, 'Dbg.html'), 'w').write(html[:i] + "window.__t={makeZip,browserInfo,downloadR20Ext,r20Lines,get S(){return S},get DECK(){return DECK},get LV(){return LV},get W(){return W},render,applyCardFx,rebuildAuto,spellMath,useFeature,useAct,fxOf,fxPassives,acInfo,speedInfo,saveVal,initVal,maxHp,takeDamage,closeModal,migrate,blankState,fxVisActs,finishShort,finishLong,setSyncState,makeWeaponItem,makeArmorItem,makeGearItem,makeMagicItem,addInventoryItem,equipItem,writeLocal,uid,spellEntry,skillVal,score,mod,castInfo,owedChoices,defensesDetail,measurePage,gridReset,set S(v){S=v}};\n" + html[i:])
