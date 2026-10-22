import { Buffer } from 'node:buffer';
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
// The picture, put back together from its pieces and decoded once, then kept in Cloudflare's cache (a new version of the
// picture has a new "at", so a new cache entry).
async function picture(code, c, ctx) {
  if (!c || !/^data:image\/(jpeg|png);base64,/.test(c.img)) return null;
  const cache = caches.default, key = new Request('https://cache.invite/pic/' + code + '/' + c.at);
  const hit = await cache.match(key); if (hit) return { body: await hit.arrayBuffer(), type: hit.headers.get('Content-Type') };
  const parts = await Promise.all(Array.from({ length: Math.max(0, Math.min(c.k, 8) - 1) }, (_, i) => fetch(DOC(code) + '/part/' + (i + 1)).then(r => r.ok ? r.json() : null).catch(() => null)));
  let all = c.img; for (const j of parts) { const v = j && j.fields && j.fields.img && j.fields.img.stringValue; if (!v) return null; all += v; }
  const type = all.slice(5, all.indexOf(';')), body = Buffer.from(all.slice(all.indexOf(',') + 1), 'base64');
  ctx.waitUntil(cache.put(key, new Response(body, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400' } })));
  return { body, type };
}
// D&D Beyond import: the sheet's "Import from D&D Beyond" reads a PUBLIC character's data (and its portrait) through
// here, because D&D Beyond only lets its own pages read them from a browser. Only those two things, only GET, only for
// the site's own pages; nothing is stored.
const DDB_ORIGINS = /^https:\/\/(adventurers-tome\.web\.app|adventurers-tome\.firebaseapp\.com|dnd-character-sheets-b30c7\.(web\.app|firebaseapp\.com)|mcbro12345\.github\.io)$/;
async function ddb(req, path, url) {
  const origin = req.headers.get('Origin') || '', allow = DDB_ORIGINS.test(origin) ? origin : 'https://adventurers-tome.web.app';
  const cors = { 'Access-Control-Allow-Origin': allow, 'Vary': 'Origin', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'X-Content-Type-Options': 'nosniff' };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'GET') return new Response('', { status: 405, headers: cors });
  if (path === 'ddb/avatar') {
    const u = url.searchParams.get('u') || '';
    if (!/^https:\/\/(www\.)?dndbeyond\.com\/avatars\/[\w\/.-]+\.(jpe?g|png|gif|webp)(\?[\w=&%.-]*)?$/i.test(u)) return new Response('', { status: 400, headers: cors });
    const r = await fetch(u, { cf: { cacheTtl: 86400 } }); const type = r.headers.get('Content-Type') || '';
    if (!r.ok || !/^image\//.test(type)) return new Response('', { status: 404, headers: cors });
    return new Response(r.body, { headers: Object.assign({ 'Content-Type': type, 'Cache-Control': 'public, max-age=86400' }, cors) });
  }
  const m = /^ddb\/(\d{3,12})$/.exec(path); if (!m) return new Response('', { status: 404, headers: cors });
  const r = await fetch('https://character-service.dndbeyond.com/character/v5/character/' + m[1], { headers: { Accept: 'application/json' } });
  const body = await r.text();
  return new Response(body, { status: r.status, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, cors) });
}
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url), path = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    if (!path) return Response.redirect(SITE + '/', 302);
    if (path === 'ddb' || path.startsWith('ddb/')) return ddb(req, path, url);
    const m = /^([A-Za-z0-9-]{3,80})(\.(?:jpg|png))?$/.exec(path); if (!m) return Response.redirect(SITE + '/', 302);
    const code = m[1], join = SITE + '/join/' + encodeURIComponent(code);
    const c = await card(code, ctx);
    if (m[2]) { // the picture
      const bytes = await picture(code, c, ctx);
      if (!bytes) return Response.redirect(SITE + '/og-invite.png', 302);
      return new Response(bytes.body, { headers: { 'Content-Type': bytes.type, 'Cache-Control': 'public, max-age=86400' } });
    }
    if (c && c.img) ctx.waitUntil(picture(code, c, ctx).catch(() => {})); // get the picture ready before the preview asks for it
    const title = c && c.name ? `You’re invited to join ${c.name}` : 'You’re invited to join a party';
    // One line, punctuated so it still reads right where line breaks are dropped (Slack, iMessage).
    const facts = c ? [c.dm ? 'Dungeon Master: ' + c.dm : '', c.n ? c.n + (c.n === 1 ? ' adventurer' : ' adventurers') + ' so far' : ''].filter(Boolean) : [];
    const desc = (facts.length ? facts.join(' · ') + '. ' : '') + 'Pick a character or make a new one to join the game.';
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
