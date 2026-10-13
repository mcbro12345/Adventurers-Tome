// Finds your open Roll20 games and hands rolls to the right tab.
const GAME_URL = 'https://app.roll20.net/editor*';
async function games() {
  const tabs = await chrome.tabs.query({ url: GAME_URL });
  const out = [];
  for (const t of tabs) {
    try { const info = await chrome.tabs.sendMessage(t.id, { type: 'info' }); if (info) out.push(Object.assign({ tabId: t.id }, info)); }
    catch (e) { out.push({ tabId: t.id, campaign: (t.title || 'Roll20 game').replace(/\s*\|\s*Roll20.*$/i, ''), player: '', stale: true }); }
  }
  return out;
}
chrome.runtime.onMessage.addListener((msg, sender, send) => {
  (async () => {
    if (msg.type === 'campaigns') return send({ list: await games() });
    if (msg.type === 'roll' || msg.type === 'post') {
      const list = await games();
      if (!list.length) return send({ error: 'No Roll20 game is open. Open your game in Roll20 first.' });
      const g = (msg.campaign && list.find((x) => x.campaign === msg.campaign)) || (msg.campaign ? null : list[0]);
      if (!g) return send({ error: `Your game "${msg.campaign}" isn't open in Roll20.` });
      if (g.stale) return send({ error: 'Reload the Roll20 tab once so the extension can reach it.' });
      try { send(await chrome.tabs.sendMessage(g.tabId, msg)); } catch (e) { send({ error: 'Roll20 tab did not answer: ' + e.message }); }
      return;
    }
    send({ error: 'unknown request' });
  })();
  return true;
});
