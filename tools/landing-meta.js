// Link previews (Discord, iMessage, X, Facebook...) only read the page's built-in tags, so the tour video and picture
// they show are written into the published files here, from what an admin last set in Admin → Announce → Landing video.
// Run before every publish (and every few minutes on a schedule, which publishes again only when the setting changed).
// Writes docs/landing-meta.json; with CHECK=1 it also says whether the live site already shows the same thing.
const fs = require('fs'), crypto = require('crypto');
const PROJECT = process.env.PROJECT || 'dnd-character-sheets-b30c7', ORIGIN = process.env.ORIGIN || 'https://adventurers-tome.web.app';
const D = process.env.DOCS || 'docs', BUILT_IN = 'wR1JulNVoDE';
const out = (k, v) => { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); console.log(k, v); };
(async () => {
  let video = '', poster = '';
  try { const r = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/config/landing`);
    if (r.ok) { const f = (await r.json()).fields || {}; video = (f.video && f.video.stringValue) || ''; poster = (f.poster && f.poster.stringValue) || ''; }
    else if (r.status !== 404) { console.log('Couldn’t read the landing video setting:', r.status); out('changed', 'false'); return; } }
  catch (e) { console.log('Couldn’t read the landing video setting:', e.message); out('changed', 'false'); return; }
  if (!/^[\w-]{11}$/.test(video)) video = '';
  const vid = video || BUILT_IN;
  // the thumbnail: the uploaded one, else the built-in picture
  let img = null; const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(poster);
  if (m) { const buf = Buffer.from(m[2], 'base64'), ext = m[1] === 'jpeg' ? 'jpg' : m[1], h = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 10);
    fs.writeFileSync(`${D}/og-landing.${ext}`, buf); img = { url: `${ORIGIN}/og-landing.${ext}?v=${h}`, type: 'image/' + m[1] }; }
  const key = crypto.createHash('sha1').update(vid + '|' + (img ? img.url : '')).digest('hex').slice(0, 10);
  for (const f of ['index.html', 'join.html', 'oembed.json']) { const p = `${D}/${f}`; if (!fs.existsSync(p)) continue; let s = fs.readFileSync(p, 'utf8');
    s = s.split(`youtube.com/embed/${BUILT_IN}`).join(`youtube.com/embed/${vid}`);
    if (img) { s = s.replace(/(https:\/\/[^"\\]*\/og-tour\.png\?v=\d+)("\s*>\s*<meta property="og:image:type" content=")image\/png/g, (a, u, mid) => img.url + mid + img.type);
      s = s.replace(/https:\/\/[^"\\]*\/og-tour\.png\?v=\d+/g, img.url); }
    s = s.replace(/oembed\.json\?v=[\w-]+/g, 'oembed.json?v=' + key); // (so sites that remember the old preview fetch the new one)
    fs.writeFileSync(p, s); }
  fs.writeFileSync(`${D}/landing-meta.json`, JSON.stringify({ key, video: vid }));
  if (process.env.CHECK) { let live = ''; try { const r = await fetch(`${ORIGIN}/landing-meta.json`, { cache: 'no-store' }); if (r.ok) live = (await r.json()).key || ''; } catch (e) {}
    out('changed', live === key ? 'false' : 'true'); } else out('changed', 'true');
})();
