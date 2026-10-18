// Runs in every page but stays silent unless the D&D character sheet says hello.
// It only relays the sheet's own messages ({__dnd20: ...}) to the extension and the answers back.
(function () {
  if (window.__dnd20bridge) return; window.__dnd20bridge = true;
  const VERSION = chrome.runtime.getManifest().version;
  const CAPS = ['tokens']; // what this copy can do beyond rolling: read where tokens are on the map
  const reply = (msg) => window.postMessage(Object.assign({ dir: 'toSheet' }, msg), '*');
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object' || !d.__dnd20 || d.dir !== 'toExt' || e.source !== window) return;
    if (d.__dnd20 === 'hello') { reply({ __dnd20: 'hi', version: VERSION, caps: CAPS }); return; }
    const req = { type: d.__dnd20, expr: d.expr, label: d.label, lines: Array.isArray(d.lines) ? d.lines.slice(0, 6).map(String) : undefined, who: d.who, campaign: d.campaign };
    try {
      chrome.runtime.sendMessage(req, (res) => {
        const err = chrome.runtime.lastError;
        reply(Object.assign({ __dnd20: d.__dnd20, id: d.id }, err ? { error: err.message } : (res || { error: 'no answer' })));
      });
    } catch (err) { reply({ __dnd20: d.__dnd20, id: d.id, error: 'The extension was reloaded — refresh this page.' }); }
  });
  reply({ __dnd20: 'hi', version: VERSION, caps: CAPS });
})();
