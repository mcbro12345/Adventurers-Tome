// Runs inside the Roll20 page itself (not the extension's sandbox) so it can see the map: the page the player is on,
// its grid and scale, and where each token is. It only answers the extension's own question and changes nothing.
(function () {
  if (window.__tomeTokens) return; window.__tomeTokens = true;
  const num = (v, d) => { const n = Number(v); return isFinite(n) && n > 0 ? n : d; };
  function read() {
    const C = window.Campaign; if (!C) return { error: 'Roll20 hasn’t finished loading.' };
    let pg = null;
    try { pg = typeof C.activePage === 'function' ? C.activePage() : null; } catch (e) {}
    if (!pg && C.pages) { try { pg = C.pages.get(C.get('playerpageid')); } catch (e) {} }
    if (!pg) return { error: 'No map page is open in Roll20.' };
    const grid = 70 * num(pg.get('snapping_increment'), 1);
    const list = (pg.thegraphics && pg.thegraphics.models) || [];
    const tokens = [];
    list.forEach((g) => {
      try {
        if (g.get('layer') !== 'objects') return;
        let cname = ''; const rep = g.get('represents');
        if (rep && C.characters) { const ch = C.characters.get(rep); if (ch) cname = ch.get('name') || ''; }
        const name = g.get('name') || '';
        if (!name && !cname) return;
        tokens.push({ name, cname, x: Number(g.get('left')) || 0, y: Number(g.get('top')) || 0, w: num(g.get('width'), 70), h: num(g.get('height'), 70) });
      } catch (e) {}
    });
    return { page: pg.get('name') || '', grid, scale: num(pg.get('scale_number'), 5), units: pg.get('scale_units') || 'ft', diag: pg.get('diagonaltype') || 'foure', tokens };
  }
  window.addEventListener('message', (e) => {
    const d = e.data; if (e.source !== window || !d || d.__tomeTok !== 'ask') return;
    let res; try { res = read(); } catch (err) { res = { error: 'Couldn’t read the map: ' + (err && err.message || err) }; }
    window.postMessage({ __tomeTok: 'ans', id: d.id, res }, '*');
  });
})();
