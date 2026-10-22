// Adventurer's Tome — party invite links.
// https://<this worker>/<code> shows a rich preview (the party's own invite panel) when the link is pasted in Discord,
// iMessage, Slack and the like, and sends people straight on to the site's join page. The picture is drawn by the DM's
// browser when the link is made and kept in Firestore (invcard/<code>, readable by anyone, written only by the DM).
const SITE = 'https://adventurers-tome.web.app';
const DOC = code => `https://firestore.googleapis.com/v1/projects/dnd-character-sheets-b30c7/databases/(default)/documents/invcard/${encodeURIComponent(code)}`;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
async function card(code, ctx) {
  const cache = caches.default, key = new Request('https://cache.invite/' + code);
  let r = await cache.match(key);
  if (!r) { r = await fetch(DOC(code)); if (!r.ok) return null; r = new Response(r.body, r); r.headers.set('Cache-Control', 'max-age=60'); ctx.waitUntil(cache.put(key, r.clone())); }
  const j = await r.json().catch(() => null), f = (j && j.fields) || {}; const v = k => f[k] ? (f[k].stringValue ?? f[k].integerValue ?? '') : '';
  return { name: v('name'), dm: v('dmName'), n: Number(v('n')) || 0, img: v('img'), k: Number(v('k')) || 1, at: v('at') };
}
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url), path = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    if (!path) return Response.redirect(SITE + '/', 302);
    const m = /^([A-Za-z0-9-]{3,80})(\.(?:jpg|png))?$/.exec(path); if (!m) return Response.redirect(SITE + '/', 302);
    const code = m[1], join = SITE + '/join/' + encodeURIComponent(code);
    const c = await card(code, ctx);
    if (m[2]) { // the picture
      if (!c || !/^data:image\/(jpeg|png);base64,/.test(c.img)) return Response.redirect(SITE + '/og-invite.png', 302);
      let all = c.img; // a big picture is split over invcard/<code>/part/1, 2…
      for (let i = 1; i < Math.min(c.k, 6); i++) { const r = await fetch(DOC(code) + '/part/' + i); if (!r.ok) return Response.redirect(SITE + '/og-invite.png', 302); const j = await r.json().catch(() => null); all += (j && j.fields && j.fields.img && j.fields.img.stringValue) || ''; }
      const type = all.slice(5, all.indexOf(';')), bin = Uint8Array.from(atob(all.slice(all.indexOf(',') + 1)), ch => ch.charCodeAt(0));
      return new Response(bin, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=300' } });
    }
    const title = c && c.name ? `You’re invited to join ${c.name}` : 'You’re invited to join a party';
    // One fact per line (Discord keeps the line breaks), then what to do.
    const facts = c ? [c.dm ? 'Dungeon Master: ' + c.dm : '', c.n ? 'Adventurers so far: ' + c.n : ''].filter(Boolean) : [];
    const desc = (facts.length ? facts.join('\n') + '\n\n' : '') + 'Pick a character or make a new one to join the game.';
    const img = c && c.img ? `${url.origin}/${encodeURIComponent(code)}.${/^data:image\/png/.test(c.img) ? 'png' : 'jpg'}?v=${encodeURIComponent(String(c.at || ''))}` : SITE + '/og-invite.png';
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Adventurer’s Tome"><meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(url.origin + '/' + code)}"><meta property="og:image" content="${esc(img)}">
<meta property="og:image:width" content="2400"><meta property="og:image:height" content="1260"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#c9962b">
<meta http-equiv="refresh" content="0;url=${esc(join)}"><script>location.replace(${JSON.stringify(join)})</script></head>
<body style="background:#0f1420;color:#e9e3d3;font-family:system-ui,sans-serif;text-align:center;padding:40px">Opening your invitation… <a style="color:#e7c46e" href="${esc(join)}">Continue</a></body></html>`;
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=60' } });
  }
};
