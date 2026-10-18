// Runs only on the Adventurer’s Tome site (see manifest.json) and stays silent unless the character sheet says hello.
// It only relays the sheet's own messages ({__dnd20: ...}) to the extension and the answers back.
(function () {
  if (window.__dnd20bridge) return; window.__dnd20bridge = true;
  const VERSION = chrome.runtime.getManifest().version;
  // Two copies installed (the Chrome Web Store one and one loaded by hand) would post every roll twice: the copies agree
  // through the page itself which one answers — the store copy if there is one, otherwise whichever arrived first.
  const ME = chrome.runtime.id + '|' + (chrome.runtime.getManifest().update_url ? 'store' : 'local'), de = document.documentElement;
  const cur = de.getAttribute('data-dnd20');
  if (!cur || (cur.endsWith('|local') && ME.endsWith('|store'))) de.setAttribute('data-dnd20', ME);
  const mine = () => de.getAttribute('data-dnd20') === ME;
  const CAPS = ['tokens']; // what this copy can do beyond rolling: read where tokens are on the map
  const reply = (msg) => window.postMessage(Object.assign({ dir: 'toSheet' }, msg), '*');
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object' || !d.__dnd20 || d.dir !== 'toExt' || e.source !== window || !mine()) return;
    if (d.__dnd20 === 'hello') { reply({ __dnd20: 'hi', version: VERSION, caps: CAPS }); return; }
    const req = { type: d.__dnd20, expr: d.expr, label: d.label, lines: Array.isArray(d.lines) ? d.lines.slice(0, 6).map(String) : undefined, who: d.who, campaign: d.campaign };
    try {
      chrome.runtime.sendMessage(req, (res) => {
        const err = chrome.runtime.lastError;
        reply(Object.assign({ __dnd20: d.__dnd20, id: d.id }, err ? { error: err.message } : (res || { error: 'no answer' })));
      });
    } catch (err) { reply({ __dnd20: d.__dnd20, id: d.id, error: 'The extension was reloaded — refresh this page.' }); }
  });
  if (mine()) reply({ __dnd20: 'hi', version: VERSION, caps: CAPS });
})();
