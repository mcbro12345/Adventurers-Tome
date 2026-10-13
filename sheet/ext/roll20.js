// Runs inside your Roll20 game. Types the roll into chat, waits for Roll20's result and reads the dice back.
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const campaign = () => (document.title || '').replace(/\s*\|\s*Roll20.*$/i, '').trim() || 'Roll20 game';
  const speakingAs = () => { const s = $('#speakingas'); return s && s.selectedOptions[0] ? s.selectedOptions[0].textContent.trim() : ''; };
  const chatBox = () => $('#textchat-input textarea') || $('textarea[title*="chat" i]') || $('#textchat textarea');
  const sendBtn = () => $('#textchat-input button') || $('#textchat-input .btn');
  const log = () => $('#textchat .content') || $('#textchat') || document.body;
  const messages = () => $$('.message', log());
  // Speak as the character when Roll20 has one with that name.
  function speakAs(who) {
    const s = $('#speakingas'); if (!s || !who) return;
    const o = Array.from(s.options).find((x) => x.textContent.trim().toLowerCase() === String(who).trim().toLowerCase());
    if (o && s.value !== o.value) { s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })); }
  }
  // "Rolling 2d20kh1+7 = (<span class=basicdiceroll>14</span>+<span class='basicdiceroll dropped'>3</span>)+7" → [[14, 3]]
  function parseDice(tip) {
    const groups = []; const re = /\(([^()]*)\)/g; let m;
    while ((m = re.exec(tip))) { const nums = (m[1].replace(/<[^>]*>/g, ' ').match(/\d+/g) || []).map(Number); if (nums.length) groups.push(nums); }
    return groups;
  }
  function readResult(msgEl) {
    const r = msgEl.querySelector('.inlinerollresult'); if (!r) return null;
    const total = parseInt((r.textContent || '').replace(/[^\d-]/g, ''), 10);
    const tip = r.getAttribute('original-title') || r.getAttribute('data-original-title') || r.getAttribute('title') || '';
    const dice = parseDice(tip.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'));
    return isNaN(total) ? null : { total, dice: dice.length ? dice : undefined };
  }
  let chain = Promise.resolve();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function post(text) {
    const box = chatBox(); if (!box) return false;
    box.value = text; box.dispatchEvent(new Event('input', { bubbles: true }));
    const btn = sendBtn();
    if (btn) btn.click(); else box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    return true;
  }
  // Lines come from the sheet in the same style as its macros: an /em heading, a "****" spacer, then "**Label:** [[dice]]".
  // Only dice notation is allowed inside [[ ]]; everything else is plain chat text.
  const cleanLine = (t) => String(t).replace(/\[\[([^\]]*)\]\]/g, (m, x) => { const tr = /&\{tracker\}/.test(x); const d = x.replace(/&\{tracker\}/g, '').replace(/[^\ddkhl+\-\s{},]/gi, '').trim(); return '[[' + d + (tr ? ' &{tracker}' : '') + ']]'; });
  function roll(req) {
    const job = chain.then(() => new Promise(async (resolve) => {
      if (!chatBox()) return resolve({ error: "Couldn't find Roll20's chat box. Is the chat panel open?" });
      speakAs(req.who);
      const before = messages().length;
      let lines = Array.isArray(req.lines) && req.lines.length ? req.lines.map(cleanLine) : null;
      let key;
      if (lines) {
        const last = lines[lines.length - 1];
        key = last.replace(/\[\[.*$/, '').replace(/\*/g, '').replace(/:\s*$/, '').trim();
        for (let k = 0; k < lines.length; k++) { post(lines[k]); if (k < lines.length - 1) await wait(160); }
      } else {
        const name = String(req.label || 'Roll').replace(/[{}\[\]]/g, '');
        const expr = String(req.expr || '').replace(/[^\dd+\-khl ]/gi, '');
        key = name.slice(0, 40);
        post(`&{template:default} {{name=${name}}} {{Roll=[[${expr}]]}}`);
      }
      const started = Date.now();
      const tick = setInterval(() => {
        const list = messages();
        for (let i = list.length - 1; i >= Math.max(0, before - 1) && i >= 0; i--) {
          const el = list[i]; if (el.__dnd20seen) continue;
          if (i >= before && (/\berror\b/.test(el.className) || /SyntaxError|error with your formula|could not parse/i.test(el.textContent)) && !el.__dnd20err) { el.__dnd20err = true; clearInterval(tick); return resolve({ error: 'Roll20 rejected the roll: ' + el.textContent.trim().slice(0, 140) }); }
          if (key && !el.textContent.includes(key)) continue;
          const r = readResult(el); if (!r) continue;
          el.__dnd20seen = true; clearInterval(tick); return resolve(r);
        }
        if (Date.now() - started > 20000) { clearInterval(tick); resolve({ error: 'Roll20 posted nothing back within 20 seconds.' }); }
      }, 150);
    }));
    chain = job.catch(() => {});
    return job;
  }
  chrome.runtime.onMessage.addListener((msg, sender, send) => {
    if (msg.type === 'info') { send({ campaign: campaign(), player: speakingAs() }); return; }
    if (msg.type === 'roll') { roll(msg).then(send); return true; }
    if (msg.type === 'post') { chain = chain.then(async () => { speakAs(msg.who); const ls = (msg.lines || []).map(cleanLine); for (let k = 0; k < ls.length; k++) { post(ls[k]); await wait(160); } }).then(() => send({ ok: true }), (e) => send({ error: String(e) })); return true; }
  });
})();
