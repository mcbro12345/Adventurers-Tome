
// ---------- Click handling ----------
document.addEventListener('click', e => rollGate(() => mainClick(e)));
const TABSCROLL = {}; let tabFadeT = 0;
function mainClick(e) {
  if (e.target.closest('#wizard')) return wizClick(e);
  const menu = e.target.closest('.menu');
  $$('.menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
  const am = e.target.closest('[data-asimode]'); if (am) return asiModeClick(am);
  const rollEl = e.target.closest('[data-roll]');
  if (rollEl) return doRoll(rollEl.dataset.roll);
  const pip = e.target.closest('[data-pip]');
  if (pip) return doPip(pip);
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act, i = N(b.dataset.i);
  pendingLabel = actLabel(act, b, i);
  const closeMenus = () => $$('.menu.open').forEach(m => m.classList.remove('open'));
  switch (act) {
    case 'undo': { const lb = HIST.length && HIST[HIST.length - 1].label; if (undo(1)) toast('Undid: ' + esc(lb)); break; }
    case 'redo': { const lb = REDO.length && REDO[REDO.length - 1].label; if (redo(1)) toast('Redid: ' + esc(lb)); break; }
    case 'history': openHistory(); break;
    case 'rewind': rollback(N(b.dataset.n)); break;
    case 'rbtime': { const ms = N($('#rbN').value) * N($('#rbU').value); rollback(countSince(ms), `the last ${N($('#rbN').value)} ${$('#rbU').selectedOptions[0].text}`); break; }
    case 'rbquick': rollback(countSince(N(b.dataset.ms)), b.firstChild.textContent.trim()); break;
    case 'redoall': { const c = redo(REDO.length); closeModal(true); toast(`Redid ${c} change(s).`); break; }
    case 'layout': if (onPhone()) break; if (window.pgPhoneView && (window.PG_IN_PHONE || (!isMobile() && window.innerWidth >= 640))) { window.pgPhoneView(!window.PG_IN_PHONE); break; }
      LAYOUT_NOW = isMobile() ? 'desktop' : 'mobile'; applyLayout(); render(); window.scrollTo(0, 0); break;
    case 'attack': attackRoll(i, !b.closest('#page-combat') || !S.inCombat); break;
    case 'equip': equipItem(i); break;
    case 'resetturn': S.turn.haste = false; S.turn.used = {}; S.turn.commanded = {}; S.turn.disengaged = false; S.turn.moved = 0; S.turn.dash = 0; S.turn.attacks = 0; S.turn.speed0 = ''; S.turn.sneak = false; S.turn.readied = null; update(); render('combat'); toast(`Turn reset — round ${N(S.turn.round) || 1} actions are ready again.`); break;
    case 'fullscreen': if (fsOn()) { FS_USER_OFF = true; fsExit(); } else { FS_USER_OFF = false; fsEnter(); } break;
    case 'tab': { const prev = UI.tab, nt = b.dataset.tab, mini = !!b.closest('.cmini'), mob = isMobile() && !mini;
      const go = () => { tabFadeT = 0; renderTabs(); if (prev !== nt && !mini) tabPageAnim(prev, nt); requestAnimationFrame(alignHpSide);
        if (mob) { const pg = $('#page-' + nt), keep = pg ? Math.min(TABSCROLL[prev] || 0, Math.max(0, pg.getBoundingClientRect().top + scrollY - 12)) : 0; window.scrollTo(0, prev === nt ? 0 : (TABSCROLL[nt] != null ? TABSCROLL[nt] : keep)); }
        $$('#page-' + UI.tab + ' textarea.f').forEach(grow); fitItemRows(); if (mini) window.scrollTo(0, 0); };
      if (tabFadeT) { clearTimeout(tabFadeT.t); tabFadeT.go(); }
      TABSCROLL[prev] = scrollY; UI.tab = nt; saveUI();
      // phones: the tab highlight moves straight away, the old page fades out, then the new one fades in at its own scroll spot
      if (mob && prev !== nt && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        $$('#tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === nt)); slideTabInd();
        const old = $('#page-' + prev), full = k => k === 'core' || k === 'combat', v = $('#sec-vitals');
        [old, full(prev) !== full(nt) ? v : null].forEach(el => { if (el && el.animate) { el.getAnimations().forEach(a => a.cancel()); el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 130, easing: 'ease-in', fill: 'forwards' }); } });
        tabFadeT = { go: () => { [old, v].forEach(el => el && el.getAnimations && el.getAnimations().forEach(a => a.cancel())); go(); }, t: 0 }; tabFadeT.t = setTimeout(tabFadeT.go, 130);
      } else go();
      break; }
    case 'theme': {
      const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', t);
      try { localStorage.setItem('dnd-sheet-theme', t); } catch (x) {}
      if (S.created) { (S.settings || (S.settings = {})).colorMode = t; pendingLabel = 'Setting: ' + (t === 'dark' ? 'dark mode' : 'light mode'); save(); }
      applyTheme(); render('header'); break;
    }
    case 'menu': b.closest('.menu').classList.toggle('open'); break;
    case 'portrait': $('#portraitFile').click(); break;
    case 'pic': PICPATH = b.dataset.path; closeModal(true); $('#picFile').click(); return;
    case 'picview': { const v = getP(b.dataset.path); openModal(`<div class="picview"><img src="${v}" alt=""></div><div class="actions"><button class="btn red" data-act="picdel" data-path="${esc(b.dataset.path)}">Remove</button><button class="btn" data-act="pic" data-path="${esc(b.dataset.path)}">Change</button><button class="btn gold" data-act="close">Close</button></div>`); return; }
    case 'picdel': setP(b.dataset.path, ''); pendingLabel = 'Remove picture'; closeModal(true); save(); render(); return;
    case 'dmg': case 'heal': case 'tmphp': hpAction(act); break;
    case 'skillprof': S.skills[i].prof = (N(S.skills[i].prof) + 1) % 3; b.className = 'profbtn p' + S.skills[i].prof; pendingLabel = S.skills[i].name + ': ' + ['not proficient', 'proficient', 'expertise'][S.skills[i].prof]; update(); { const r = b.closest('.skman-row'); if (r) { r.querySelector('.skman-lv').textContent = ['—', 'Proficient', 'Expertise'][S.skills[i].prof]; r.querySelector('.skman-v').textContent = fmt(skillVal(S.skills[i])); } } break;
    case 'manageskills': openSkillManage(); return;
    case 'abilok': closeModal(true); render(); return;
    case 'manageabil': openAbilManage(); return;
    case 'skillok': closeModal(true); render(); return;
    case 'add': addItem(b.dataset.list); break;
    case 'del': delItem(b.dataset.list, i); break;
    case 'up': { const L = getP(b.dataset.list); if (i > 0) { [L[i - 1], L[i]] = [L[i], L[i - 1]]; save(); render(); } break; }
    case 'toggle': {
      UI.open[b.dataset.key] = !UI.open[b.dataset.key]; saveUI(); pendingLabel = null;
      // Feature cards share rows: opening one card's text opens the others in the same row too (and closing closes them).
      if (/^ffull:/.test(b.dataset.key)) { const card = b.closest('.fcard'), v = UI.open[b.dataset.key];
        if (card && card.parentElement) { const top = card.getBoundingClientRect().top; [...card.parentElement.querySelectorAll(':scope > .fcard')].forEach(c => { if (Math.abs(c.getBoundingClientRect().top - top) < 4) c.querySelectorAll('.fc-full[data-key]').forEach(e => { UI.open[e.dataset.key] = v; }); }); saveUI(); } }
      const kk = b.dataset.key, pg = /^cg:sptab:/.test(kk) ? 'spells' : /^(econedit|fopt:|cg:)/.test(kk) ? 'combat' : /^atk:/.test(kk) ? 'core' : /^(item:|invshut:|bagedit:)/.test(kk) ? 'inventory' : /^(fedit:|ffull:|subedit:|xsub:|featsedit)/.test(kk) ? 'features' : 'spells';
      render(pg); return;
    }
    case 'filter': S.spellFilter = b.dataset.f; save(); render('spells'); $$('#page-spells textarea.f').forEach(grow); refresh(); break;
    case 'featfilter': UI.featFilter = b.dataset.f; saveUI(); render('features'); $$('#page-features textarea.f').forEach(grow); refresh(); pendingLabel = null; return;
    case 'cast': castSpell(i, b.dataset.col); break;
    case 'castgo': castGo(b); break;
    case 'readypay': readyPay(b.dataset.k, N(b.dataset.l)); break;
    case 'econ': S.turn.used[b.dataset.col] = !S.turn.used[b.dataset.col]; if (b.dataset.col === 'action' && !S.turn.used.action) S.turn.attacks = 0; update(); break;
    case 'econtab': UI.econTab = b.dataset.col; saveUI(); render('combat'); refresh(); pendingLabel = null; return;
    case 'qty': { const it = S.inventory[i]; it.qty = Math.max(0, N(it.qty) + N(b.dataset.d)); update(); break; }
    case 'endeffect': endEffect(b.dataset.n); if ($('#condmodal.extfxm')) openExtFx(); break;
    case 'addeffects': UI.extPick = ''; openExtFx(); break;
    case 'extfx': addExtFx(b.dataset.k); break;
    case 'extfxgo': addExtFx(b.dataset.k, b.dataset.v); break;
    case 'repeatfx': repeatEffect(N(b.dataset.j)); break;
    case 'stunstrike': stunningStrike(); break;
    case 'hasteact': hasteAct(b.dataset.k, b.dataset.i); break;
    case 'usefeat': if (isStunStrike(S.features[i])) { stunningStrike(); break; } if (/^martial arts$/i.test(String((S.features[i] || {}).name || '').trim()) && clsLv('monk')) { martialArtsBonus(false); break; } useFeature(i, b.dataset.col); break;
    case 'mabonus': martialArtsBonus(false); break;
    case 'slotrestgo': { const R = SLOTREST; if (!R) return; const k = b.dataset.k === 'pact' ? 'pact' : N(b.dataset.k); closeModal(true); useFeature(R.i, R.col, { slot: k }); return; }
    case 'inflearn': openInfLearn(); return;
    case 'infpick': openInfPick(b.dataset.n, b.dataset.r); return;
    case 'infpickall': if (INFPICK) openInfPick(INFPICK.name, INFPICK.rep, true); return;
    case 'infgo': infGo(N(b.dataset.i)); return;
    case 'infend': infEnd(i); return;
    case 'infendbag': { const bg = (S.bags || [])[i]; if (bg) { delete bg.infusion; pendingLabel = 'End infusion: ' + bg.name; save(); render(); toast(`The infusion on <b>${esc(bg.name)}</b> ended — everything inside appears around it.`, '', 7000, { label: 'Undo', fn: () => undo(1) }); } return; }
    case 'infuse-use': infUse(i, b.dataset.col); return;
    case 'infequip': { const it = S.inventory[i]; if (it) { it.equipped = true; pendingLabel = 'Equip ' + it.name; save(); render(); } return; }
    case 'infrepadd': infAddRep(($('#infRepOther') || {}).value); return;
    case 'infadd': infAdd(b.dataset.n); return;
    case 'infaddrep': infAddRep(b.dataset.r); return;
    case 'infrem': infRemove(b.dataset.n, b.dataset.r); return;
    case 'compedit': openCompEdit(i); return;
    case 'cesave': ceSave(); return;
    case 'cereset': { const c = S.companions[CEDIT && CEDIT.i]; if (c && c.tmpl) { const m = Object.assign({}, (S.compMods || {})[c.tmpl]); ['ac', 'hp', 'speed', 'actions', 'known', 'attacks'].forEach(k => delete m[k]); S.compMods = Object.assign({}, S.compMods, { [c.tmpl]: m }); pendingLabel = 'Reset ' + c.name; closeModal(true); save(); render(); } return; }
    case 'ceadd': { const box = $('#ceRows'); if (box && CEDIT) box.insertAdjacentHTML('beforeend', CEDIT.row({ a: ['', 0, '1d6', '', 'attack'] }, $$('#ceRows .ce-row').length)); return; }
    case 'cedel': { const el = b.closest('.ce-row'); if (el) el.remove(); return; }
    case 'compsummon': { if (incapCond()) { toast(`You're <b>${incapCond().toLowerCase()}</b> — you can't take actions.`, 'fumble'); return; } addClassCompanion(b.dataset.n, true); S.turn.used.action = true; save(); render(); return; }
    case 'wildsurge': wildSurgeNow(); break;
    case 'invsort': invSort(b.dataset.k, b.dataset.by); return;
    case 'spsort': S.settings = Object.assign({}, S.settings, { combatSpellSort: b.dataset.k }); if (b.dataset.k === 'custom') spCatsEnsure(); pendingLabel = 'Group spells by ' + b.dataset.k; save(); render(); return;
    case 'spcatadd': spCatAdd(); return;
    case 'spcatren': spCatRename(b.dataset.k); return;
    case 'spcatrenok': spCatRenameOK(b.dataset.k); return;
    case 'spcatmove': spCatMove(b.dataset.k, N(b.dataset.d)); return;
    case 'spgstep': spGroupStep(b.dataset.k, N(b.dataset.d)); return;
    case 'cgstep': cgStep(b.dataset.col, b.dataset.k, N(b.dataset.d)); return;
    case 'spcatdel': spCatDel(b.dataset.k); return;
    case 'spstep': spStep(i, N(b.dataset.d)); return;
    case 'spto': spMoveTo(i, b.dataset.k, null); $$('.menu.open').forEach(m => m.classList.remove('open')); return;
    case 'insp': inspAdj(N(b.dataset.d)); return;
    case 'invstep': invStep(i, N(b.dataset.d)); return;
    case 'surgeok': surgeApply(); return;
    case 'surgepick': surgePick(b.dataset.k); return;
    case 'mmarm': mmToggle(b.dataset.k); return;
    case 'mmseek': mmSeek(); return;
    case 'fomcreate': fomCreate(N(b.dataset.k)); return;
    case 'fomconv': fomConvert(N(b.dataset.k)); return;
    case 'spadj': spAdj(N(b.dataset.d)); return;
    case 'useact': if (flurryAct(i, b.dataset.j)) { flurryOfBlows(i, b.dataset.j, b.dataset.col, false); break; } useAct(i, b.dataset.j === undefined ? null : b.dataset.j, b.dataset.col); break;
    case 'forgego': forgeGo(N(b.dataset.fi), i); break;
    case 'spellstorego': spellStoreGo(N(b.dataset.fi)); break;
    case 'wsspirit': { closeModal(true); const k = S.features.findIndex(f => f.name === 'Summon Wildfire Spirit'); if (k >= 0) useFeature(k, 'action'); return; }
    case 'pending': openPending(); pendingLabel = null; return;
    case 'recadd': RECOVER.pick.push(N(b.dataset.l)); renderRecover(); pendingLabel = null; return;
    case 'recok': recoverOk(); pendingLabel = null; return;
    case 'prepare': openPrepare(b.dataset.cls); pendingLabel = null; return;
    case 'prepsp': prepToggle(b.dataset.n); pendingLabel = null; return;
    case 'preplv': PREP.lvl = b.dataset.l === 'all' ? 'all' : N(b.dataset.l); renderPrepare(); pendingLabel = null; return;
    case 'pendok': pendApply(b.dataset.id); pendingLabel = null; return;
    case 'pendpick': pendPick(b.dataset.id, b.dataset.j); pendingLabel = null; return;
    case 'penddone': pendDismiss(b.dataset.id); pendingLabel = null; return;
    case 'pendall': owedChoices().forEach(o => { S.dismissed = Object.assign({}, S.dismissed, { [o.id]: true }); }); pendingLabel = 'Marked all choices as done'; save(); render(); renderPending(); return;
    case 'updatesheet': closeModal(true); $('#updateFile').value = ''; $('#updateFile').click(); pendingLabel = null; return;
    case 'useobjplain': closeModal(true); S.turn.used.action = true; pendingLabel = 'Use an Object'; update(); toast('<b>Use an Object</b> — action spent.', '', 4000); break;
    case 'markopt': if (b.dataset.col === 'action' && /^ready$/i.test(b.dataset.name)) openReady(); else markOpt(b); break;
    case 'readypick': $$('#modal-body .castopt').forEach(x => x.classList.toggle('on', x === b)); READY_PICK = b.dataset.k; break;
    case 'readygo': readyGo(); break;
    case 'oacast': closeModal(true); castSpell(i, 'reaction'); render('combat'); break;
    case 'oago': { closeModal(true); S.turn.used.reaction = true; const a = S.attacks[i]; attackRoll(i, true, { label: 'Opportunity Attack · ' + a.name, offTurn: true, notes: hasFeature('Sentinel') ? ['Sentinel: on a hit, its speed drops to 0 this turn'] : [] }); render('combat'); break; }
    case 'searchgo': { closeModal(true); S.turn.used[b.dataset.col || 'action'] = true; pendingLabel = 'Search'; update(); doRoll('skill:' + b.dataset.k); break; }
    case 'readyfire': readyFire(); break;
    case 'readydrop': { const r = S.turn.readied; S.turn.readied = null; pendingLabel = 'Drop readied action'; update(); render('combat'); if (r) readyLost(r, 'You let it go'); break; }
    case 'smite': smite(b.dataset.l); break;
    case 'sneaktog': S.turn.sneak = !S.turn.sneak; pendingLabel = S.turn.sneak ? 'Sneak Attack used' : 'Sneak Attack ready'; update(); return;
    case 'sneak': { const d = sneakDice(); const c = Date.now() < critUntil; if (S.inCombat && S.turn.sneak) toast('Sneak Attack was already used this turn (once per turn) — rolling anyway.', '', 4000); if (S.inCombat) S.turn.sneak = true; pendingLabel = 'Sneak Attack'; save(); refresh(); roll(`Sneak Attack${c ? ' · CRIT, dice doubled' : ''}`, c ? doubleDice(d) : d); return; }
    case 'smiteundead': UI.smiteUndead = !UI.smiteUndead; saveUI(); b.classList.toggle('on', UI.smiteUndead); b.setAttribute('aria-pressed', UI.smiteUndead); refresh(); pendingLabel = null; return;
    case 'move': if (S.turn.speed0 && N(b.dataset.d) > 0) { toast(`Your speed is 0 this turn (${esc(S.turn.speed0)}).`, 'fumble'); break; } { let d = N(b.dataset.d); const mv = Math.max(0, N(S.turn.moved)), bud = moveBudget(); if (d > 0 && mv + d > bud) { if (mv >= bud) { toast(`No movement left this turn (${bud} ft${N(S.turn.dash) ? ' including Dash' : ''}).`, 'fumble'); break; } d = bud - mv; toast(`Only ${d} ft left — moved that much.`, '', 2500); } S.turn.moved = Math.max(0, mv + d); update(); } break;
    case 'round': S.turn.round = Math.max(1, (N(S.turn.round) || 1) + N(b.dataset.d)); update(); break;
    case 'newturn': nextTurn(); break;
    case 'passtime': { const r = N(b.dataset.r); pendingLabel = 'Time passes: ' + fmtRounds(r); const res = passRounds(r); update(); render(); toast(`${fmtRounds(r)} pass.`); announce(res); break; }
    case 'dropconc': breakConc('dropped'); break;
    case 'macros': openMacros(); break;
    case 'macrochanged': UI.macroChanged = !UI.macroChanged; saveUI(); b.classList.toggle('on', UI.macroChanged); b.setAttribute('aria-pressed', UI.macroChanged); filterMacros(); pendingLabel = null; return;
    case 'macroseenall': MACROS.forEach(m => S.macroSeen[m.key] = m.norm); writeLocal(); openMacros(true); toast('All macros marked as up to date.'); pendingLabel = null; return;
    case 'copymacro': copyMacro(b); pendingLabel = null; return;
    case 'macroadv': UI.macroAdv = b.dataset.v; saveUI(); openMacros(true); pendingLabel = null; return;
    case 'copyurl': { const u = b.dataset.url; // browsers don't let a web page open their settings pages, so copy it for pasting
      (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => toast(`Copied <b>${esc(u)}</b> — paste it into your browser's address bar.`), () => toast(`Type <b>${esc(u)}</b> into your browser's address bar.`)); return; }
    case 'entercombat': { S.inCombat = true; S.turn = { round: 1, used: {}, moved: 0, attacks: 0 }; pendingLabel = 'Initiative mode'; save(); render(); window.scrollTo(0, Math.min(scrollY, ($('#tabs') || document.body).offsetTop)); toast('Initiative mode — rounds, turns and your action economy are on.'); return; }
    case 'startcombat': { S.inCombat = true; S.turn = { round: 1, used: {}, moved: 0, attacks: 0 }; pendingLabel = 'Roll initiative'; save(); render(); window.scrollTo(0, Math.min(scrollY, ($('#tabs') || document.body).offsetTop)); doRoll('init'); return; }
    case 'endcombat': { S.lethargy = 0; const spent = Object.entries(S.turn.ammo || {}).map(([id, n]) => [S.inventory.find(x => x.id === id), Math.floor(N(n) / 2)]).filter(([it, n]) => it && n > 0);
      if (spent.length) setTimeout(() => toast(`You can recover half your spent ammunition: ${spent.map(([it, n]) => n + ' ' + esc(it.name)).join(', ')}.`, '', 15000, { label: 'Recover', fn: () => { spent.forEach(([it, n]) => { it.qty = N(it.qty) + n; }); pendingLabel = 'Recover ammunition'; save(); render(); toast('Ammunition recovered.'); } }), 300); }
      S.turn = { round: 1, used: {}, moved: 0, attacks: 0 }; S.death = { s: 0, f: 0 }; S.conditions = S.conditions.filter(c => c !== 'Dodging'); S.inCombat = false; pendingLabel = 'End initiative'; save(); render(); toast('Out of initiative — back to exploring.'); break;
    case 'coin': { const c = b.dataset.c; S.currency[c] = Math.max(0, N(S.currency[c]) + N(b.dataset.d)); update(); break; }
    case 'short': shortRest(); break;
    case 'long': longRest(); break;
    case 'levelup': openLevelUp(); break;
    case 'export': exportJSON(); closeMenus(); break;
    case 'import': $('#importFile').click(); closeMenus(); break;
    case 'savehtml': saveHTML(); closeMenus(); break;
    case 'themecolor': closeMenus(); openSettings(); break;
    case 'themeset': setAccent(b.dataset.v); break;
    case 'themeportrait': matchPortrait(true); break;
    case 'newchar': closeMenus(); confirmNewChar(); break;
    case 'newcharok': newCharacter(); break;
    case 'close': closeModal(); break;
    case 'spendhd': spendHD(b.dataset.d); break;
    case 'confirm-short': finishShort(); break;
    case 'confirm-long': finishLong(); break;
    case 'deathsave': deathSave(); break;
    case 'acauto': S.acOverride = ''; pendingLabel = 'AC back to automatic'; update(); break;
    case 'conditions': openConditions(); break;
    case 'tmpmod': { const k = b.dataset.k; S.tmpMods = Object.assign({}, S.tmpMods); const cur = S.tmpMods[k] || { v: 0, r: -2 }, v = cur.v + N(b.dataset.d); if (v) S.tmpMods[k] = { v, r: cur.r }; else delete S.tmpMods[k]; clampHp(); pendingLabel = `Temporary ${tmName(k)} ${v > 0 ? '+' : ''}${v}`; save(); render(); if (mOpen('#condmodal')) openConditions(); if (mOpen('#hpmanage')) openHpManage(); if (mOpen('#acmanage')) openAcManage(); return; }
    case 'tmpmodr': { const m = (S.tmpMods || {})[b.dataset.k]; if (!m) break; m.r = Math.max(-2, N(m.r) + N(b.dataset.d)); pendingLabel = `${tmName(b.dataset.k)} change: ${durText(m.r)}`; save(); render(); if (mOpen('#condmodal')) openConditions(); if (mOpen('#hpmanage')) openHpManage(); if (mOpen('#acmanage')) openAcManage(); return; }
    case 'tmpmodclear': { if (S.tmpMods) delete S.tmpMods[b.dataset.k]; clampHp(); pendingLabel = `${tmName(b.dataset.k)} back to normal`; save(); render(); if (mOpen('#condmodal')) openConditions(); if (mOpen('#hpmanage')) openHpManage(); if (mOpen('#acmanage')) openAcManage(); return; }
    case 'hpmanage': openHpManage(); pendingLabel = null; return;
    case 'acmanage': openAcManage(); pendingLabel = null; return;
    case 'hpadj': { S.hp.adj = N(S.hp.adj) + N(b.dataset.d); clampHp(); pendingLabel = 'Max HP adjustment ' + fmt(N(S.hp.adj)); save(); render(); openHpManage(); return; }
    case 'acauto': S.acOverride = ''; pendingLabel = 'AC: automatic'; save(); render(); openAcManage(); return;
    case 'togglecond': toggleCondition(b.dataset.c); if ($('#condmodal') && $('#modal').classList.contains('open')) openConditions(); break;
    case 'exhset': S.exhaustion = N(b.dataset.v); pendingLabel = 'Exhaustion ' + S.exhaustion; update(); render('vitals'); openConditions(); if (S.exhaustion >= 6) toast('Exhaustion 6: death.', 'fumble', 8000); break;
    case 'dropcond': toggleCondition(b.dataset.c); break;
    case 'exh': S.exhaustion = Math.max(0, Math.min(6, N(S.exhaustion) + N(b.dataset.d))); pendingLabel = 'Exhaustion ' + S.exhaustion; update(); render('vitals'); { const x = $('#exhN'); if (x) x.textContent = S.exhaustion; } if (S.exhaustion >= 6) toast('Exhaustion 6: death.', 'fumble', 8000); break;
    case 'crroll': creatureRoll(b.dataset.who, N(b.dataset.j), b.dataset.what); pendingLabel = null; return;
    case 'endform': endForm(0, 'reverted'); break;
    case 'wildshape': openWildShape(); break;
    case 'transform': openTransform(); break;
    case 'pickform': pickForm(b); break;
    case 'addcreature': openCreaturePicker(); break;
    case 'addcr': addCreature(N(b.dataset.n)); break;
    case 'addclasscomp': openClassCompanions(); break;
    case 'addcc': addClassCompanion(b.dataset.n); break;
    case 'dismiss': { const c = S.companions[i]; S.companions.splice(i, 1); if (c.tmpl && COMP_RULES[c.tmpl] && COMP_RULES[c.tmpl].perm) S.compOff = Object.assign({}, S.compOff, { [c.tmpl]: true }); pendingLabel = 'Dismiss ' + c.name; if (c.effect && !S.companions.some(x => x.effect === c.effect) && AUTO(c.effect).summon) { S.effects = S.effects.filter(x => x.name !== c.effect); if (S.concentration === c.effect) S.concentration = ''; } save(); render(); toast(`${esc(c.name)} dismissed.`, '', 5000, { label: 'Undo', fn: () => undo(1) }); break; }
    case 'comphp': compHp(i, N(b.dataset.d)); break;
    case 'bagmove': $$('.menu.open').forEach(m => m.classList.remove('open')); bagMoveTo(b.dataset.id, b.dataset.to); pendingLabel = null; return;
    case 'invsrch': { const k = b.dataset.k, open = invQOpen(k); UI.open['invsrch:' + k] = !open; if (open) UI.invQs = Object.assign({}, UI.invQs, { [k]: '' }); pendingLabel = null; render('inventory');
      if (!open) { const e = document.querySelector(`#page-inventory .invq[data-scope="${CSS.escape(k)}"]`); if (e) e.focus(); } return; }
    case 'rtjmake': rtjMake(b.dataset.n); break;
    case 'compcmd': { const c = S.companions[i]; if (!c) return; if (incapCond()) { toast(`You're <b>${incapCond().toLowerCase()}</b> — ${esc(c.name)} acts on its own and can take any action.`, '', 6000); pendingLabel = null; return; }
      if ((S.turn.used || {}).bonus) { toast('You already used your bonus action this turn.', 'fumble'); pendingLabel = null; return; }
      S.turn.used.bonus = true; S.turn.commanded = Object.assign({}, S.turn.commanded, { [c.id]: true }); pendingLabel = 'Command ' + c.name; update(); render('combat'); refresh();
      toast(`<b>${esc(c.name)}</b> is commanded — on its turn it takes the action you choose (attack with its Rend, Repair, Dash, Help…).`, '', 6000, { label: 'Undo', fn: () => undo(1) }); break; }
    case 'catalog': openCatalog(); break;
    case 'cattab': UI.catTab = b.dataset.t; saveUI(); openCatalog(true); pendingLabel = null; return;
    case 'catadd': catalogAdd(b.dataset.t, N(b.dataset.n)); break;
    case 'catbaseok': catalogAddBase(N(b.dataset.n)); break;
    case 'charge': { const it = S.inventory[i]; it.charges.used = Math.max(0, Math.min(N(it.charges.max), N(it.charges.used) - N(b.dataset.d))); pendingLabel = (N(b.dataset.d) < 0 ? 'Use charge: ' : 'Restore charge: ') + it.name; update(); render(); refresh(); break; }
    case 'attune': attune(i); break;
    case 'drink': drink(i); break;
    case 'useitem': useItem(i, b.dataset.col); break;
    case 'ispdel': { const it = S.inventory[i]; const n = it.spells.splice(N(b.dataset.j), 1)[0]; pendingLabel = `${it.name}: remove ${n}`; rebuildAuto(); save(); render(); break; }
    case 'hbopen': UI.open['hb:' + b.dataset.key] = !UI.open['hb:' + b.dataset.key]; render(); break;
    case 'addspells': openSpellPicker(b.dataset.cls); pendingLabel = null; return;
    case 'spfilt': PICK.lvl = b.dataset.l; renderPicker(); pendingLabel = null; return;
    case 'pickspell': pickSpell(b); break;
    case 'addfeat': openFeatModal(); pendingLabel = null; return;
    case 'featok': featModalOK(); break;
    case 'delfeatn': { const k = S.feats.indexOf(b.dataset.n); if (k < 0) break; S.feats.splice(k, 1); pendingLabel = 'Remove feat ' + b.dataset.n; rebuildAuto(); save(); render(); toast(`Removed ${esc(b.dataset.n)}. Ability increases it gave stay — adjust scores if needed.`, '', 7000, { label: 'Undo', fn: () => undo(1) }); break; }
    case 'delfeat': { const n = S.feats[i]; S.feats.splice(i, 1); pendingLabel = 'Remove feat ' + n; rebuildAuto(); save(); render(); toast(`Removed ${esc(n)}. Ability increases it gave stay — adjust scores if needed.`, '', 7000, { label: 'Undo', fn: () => undo(1) }); break; }
    case 'lvl-confirm': finishLevelUp(); break;
    case 'lvroll': lvRoll(); pendingLabel = null; return;
    case 'addxp': { const v = N($('#xpAdd') && $('#xpAdd').value); if (!v) { toast('Type an amount of XP first.'); break; } S.xp = N(S.xp) + v; pendingLabel = `+${v} XP`; save(); render('header'); toast(`+${v} XP — ${N(S.xp)} total.${xpReady() ? ' <b>You can level up!</b>' : ''}`, xpReady() ? 'crit' : ''); break; }
    case 'sayquote': { const q = (S.quotes || []).filter(x => x.text); if (q.length) { const t = q[Math.floor(Math.random() * q.length)].text; toast(`<div><b>${esc(who())}:</b> ${esc(t)}</div>`, '', 9000, { label: 'Copy', fn: () => copyText(t) }); } pendingLabel = null; return; }
    case 'cleargoals': S.goals = S.goals.filter(g => !g.done); pendingLabel = 'Clear finished to-dos'; save(); render('notes'); break;
    case 'editlayout': case 'edone': editToggle(); return;
    case 'ecancel': editCancel(); return;
    case 'msize': modSize(b.dataset.p, N(b.dataset.w), N(b.dataset.h)); return;
    case 'mto': modTo(b.dataset.p, b.dataset.pg); return;
    case 'mremove': modRemove(b.dataset.p); return;
    case 'maddopen': modAddOpen(); return;
    case 'madd': modAdd(b.dataset.p); return;
    case 'ctabadd': ctabAdd(); return;
    case 'ctabaddok': ctabAddOK(); return;
    case 'ctabdel': ctabDelete(b.dataset.k); return;
    case 'greset': if (isGridLayout()) gridReset(b.dataset.pg); else pageReset(b.dataset.pg); return;
    case 'gresetall': gridResetAll(); return;
    case 'settings': openSettings(); pendingLabel = null; return;
    case 'setpreset': setThemeColor(b.dataset.k, b.dataset.v); return;
    case 'tabmove': tabMove(b.dataset.k, N(b.dataset.d)); return;
    case 'tabhide': tabHide(b.dataset.k); return;
    case 'tabrename': tabRename(b.dataset.k); return;
    case 'tabrenameok': tabRenameOK(b.dataset.k); return;
    case 'pmove': panelMove(b.dataset.p, N(b.dataset.d)); return;
    case 'pto': panelTo(b.dataset.p, b.dataset.pg); return;
    case 'zhide': zoneHide(b.dataset.k); return;
    case 'phide': panelToggle(b.dataset.p, 'hidden'); return;
    case 'pwide': panelToggle(b.dataset.p, 'wide'); return;
    case 'pcols': pageCols(b.dataset.pg, N(b.dataset.n)); return;
    case 'preset': pageReset(b.dataset.pg); return;
    case 'presetall': S.layout = {}; pendingLabel = 'Reset layout'; save(); render(); return;
    case 'parmor': case 'pweap': { const key = act === 'parmor' ? 'armor' : 'weapons', v = b.dataset.v, L = S.profs[key] = S.profs[key] || []; const k = L.indexOf(v); if (k >= 0) L.splice(k, 1); else L.push(v); pendingLabel = (k >= 0 ? 'Remove ' : 'Add ') + v + ' proficiency'; save(); render(); break; }
    case 'pwdel': { const n = S.profs.weaponNames.splice(i, 1)[0]; pendingLabel = 'Remove proficiency: ' + n; save(); render(); break; }
    case 'toolexp': S.tools[i].exp = !S.tools[i].exp; pendingLabel = (S.tools[i].exp ? 'Expertise: ' : 'Proficient: ') + S.tools[i].name; save(); render(); break;
    case 'tooldel': { const n = S.tools.splice(i, 1)[0]; pendingLabel = 'Remove tool: ' + n.name; save(); render(); toast(`Removed ${esc(n.name)}.`, '', 5000, { label: 'Undo', fn: () => undo(1) }); break; }
    case 'langdel': { const n = S.langs.splice(i, 1)[0]; pendingLabel = 'Remove language: ' + n; save(); render(); toast(`Removed ${esc(n)}.`, '', 5000, { label: 'Undo', fn: () => undo(1) }); break; }
    case 'manageprofs': openProfs(); break;
    case 'booksedit': UI.open.booksedit = !UI.open.booksedit; saveUI(); reopenSettings(); break;
    case 'addbag': openAddBag(); break;
    case 'deck': openDeck(i); break;
    case 'decktype': S.deck.variant = b.dataset.v; DECK.last = null; save(); renderDeck(); break;
    case 'deckdeclare': { const n = Math.max(1, Math.min(22, N($('#deckn').value))); S.deck.left = n; pendingLabel = `Declare ${n} card${n > 1 ? 's' : ''}`; save(); deckDraw(); break; }
    case 'deckdraw': deckDraw(); break;
    case 'deckstop': S.deck.left = 0; save(); renderDeck(); break;
    case 'deckchoice': { const [t, fx] = DECK.choice[N(b.dataset.k)]; DECK.choice = null; DECK.result = applyCardFx(DECK.last, fx); pendingLabel = DECK.last + ': ' + t; save(); render(); renderDeck(); break; }
    case 'xsublv': { const r = S.classes[i], k = b.dataset.k, cur = N((r.extraSubLv || {})[k]) || Math.max(1, N(r.level) - ((N(CL[r.key].sub && CL[r.key].sub.level) || 1) - 1)), nv = Math.max(1, Math.min(N(r.level), cur + N(b.dataset.d))); r.extraSubLv = Object.assign({}, r.extraSubLv, { [k]: nv }); pendingLabel = `${CL[r.key].subclasses[k].name}: ${nv} level${nv === 1 ? '' : 's'}`; rebuildAuto(); save(); render(); if (settingsOpen()) reopenSettings(); break; }
    case 'delxsub': { const r = S.classes[i]; r.extraSubs = (r.extraSubs || []).filter(x => x !== b.dataset.k); pendingLabel = 'Remove extra subclass'; rebuildAuto(); save(); render(); if (settingsOpen()) reopenSettings(); break; }
    case 'feline': { if (incapCond() || speedFt() === 0) { toast('You can\'t move right now.', 'fumble'); break; } S.turn.feline = true; S.felineSpent = true; pendingLabel = 'Feline Agility'; update(); render('combat'); toast(`<b>Feline Agility</b> — your speed is doubled this turn (${turnSpeed()} ft).`); break; }
    case 'abopen': UI.open.abtemp = true; closeModal(true); openConditions(); return;
    case 'abtile': UI.open.abtemp = !UI.open.abtemp; pendingLabel = null; openConditions(); return;
    case 'abtemp': { const a = b.dataset.a, d = N(((S.abTemp || {})[a] || {}).d) + N(b.dataset.d); S.abTemp = Object.assign({}, S.abTemp); if (d) S.abTemp[a] = { d }; else delete S.abTemp[a]; if (!abTempOn()) S.abTempR = 0; pendingLabel = `Temporary ${ABN[a]}: ${score(a)}`; save(); render(); openConditions(); return; }
    case 'abtempr': S.abTempR = Math.max(-2, N(S.abTempR) + N(b.dataset.d)); pendingLabel = 'Ability change: ' + durText(S.abTempR); save(); render(); openConditions(); return;
    case 'abtempclear': { if (b.dataset.a) { if (S.abTemp) delete S.abTemp[b.dataset.a]; } else S.abTemp = {}; if (!abTempOn()) S.abTempR = 0; pendingLabel = 'Ability scores back to normal'; save(); render(); if ($('#condmodal') && $('#modal').classList.contains('open')) openConditions(); return; }
    case 'condturn': { const c = b.dataset.c, v = Math.max(-2, N((S.condTurns || {})[c]) + N(b.dataset.d)); S.condTurns = S.condTurns || {}; if (v) S.condTurns[c] = v; else delete S.condTurns[c]; pendingLabel = `${c}: ${durText(v)}`; save(); render('vitals', 'combat'); openConditions(); return; }
    case 'condturns': { const c = b.dataset.c, v = N(b.dataset.v); S.condTurns = S.condTurns || {}; if (v) S.condTurns[c] = v; else delete S.condTurns[c]; pendingLabel = `${c}: ${v ? v + ' rounds' : 'until removed'}`; save(); render('vitals', 'combat'); openConditions(); break; }
    case 'lsok': lsSave(); break;
    case 'lslv': LS.lv = N(b.dataset.v); renderLevelSpells(); break;
    case 'lsev': LS.evMode = b.dataset.v; LS.evOut = ''; LS.evIn = ''; renderLevelSpells(); break;
    case 'fspdel': { const f = S.features[i]; const n = f.spells.splice(N(b.dataset.j), 1)[0]; pendingLabel = `${f.name}: remove ${n}`; save(); rebuildAuto(); render(); break; }
    case 'grantpick': openGrantPicker(b.dataset.t, b.dataset.o); break;
    case 'grantok': { const t = GRANT; if (!t) break; S.grantSpells = S.grantSpells || {}; S.grantSpells[t.o] = t.fx.grant.flatMap((g, j) => ansList(t.CH, 'g.' + j)); closeModal(true); pendingLabel = t.o + ': spells'; save(); rebuildAuto(); render(); break; }
    case 'gocore': UI.tab = 'core'; saveUI(); renderTabs(); window.scrollTo(0, 0); break;
    case 'tablift': try { localStorage.setItem('dnd-tablift', String(Math.max(0, Math.min(160, tabLift() + N(b.dataset.d))))); } catch (e) {} applyTabLift(); { const v = b.parentNode.querySelector('b'); if (v) v.textContent = tabLift(); } break;
    case 'settab': switchSetTab(b.dataset.k); break;
    case 'opensettings': openSettings(b.dataset.tab === 'class' ? 'char' : b.dataset.tab); pendingLabel = null; return;
    case 'rolllog': openRollLog(); break;
    case 'clearlog': if (UI.logTab === 'events') { EVLOG = []; saveEvLog(); } else { ROLLLOG = []; saveRollLog(); } openRollLog(); break;
    case 'logtab': UI.logTab = b.dataset.v; saveUI(); openRollLog(); pendingLabel = null; return;
    case 'rolladv': { const v = b.dataset.v; S.rollAdv = S.rollAdv === v ? '' : v; pendingLabel = S.rollAdv ? (S.rollAdv === 'adv' ? 'Advantage on all rolls' : 'Disadvantage on all rolls') : 'Normal rolls'; save(); render('vitals'); refresh(); toast(S.rollAdv ? `<b>${S.rollAdv === 'adv' ? 'Advantage' : 'Disadvantage'}</b> on every attack, check and save until you switch it off.` : 'Back to normal rolls.', '', 3000); break; }
    case 'moveto': { const it = S.inventory[i], to = b.dataset.to; const bg = (S.bags || []).find(x => x.id === to); it.bag = to; it.equipped = false; $$('.menu.open').forEach(m => m.classList.remove('open')); pendingLabel = 'Move ' + it.name + ' to ' + (bg ? bg.name : 'Pack'); if ((it.spells || []).length || it.hb) rebuildAuto(); save(); render(); break; }
    case 'addbagp': addBag(N(b.dataset.i)); break;
    case 'delbag': delBag(i); break;
    case 'profother': { const inp = $('#pother-' + b.dataset.k), v = inp && inp.value.trim(); if (v) addProf(b.dataset.k, v); else if (inp) inp.focus(); break; }
    case 'otherok': { const v = $('#otherIn').value.trim(); const kind = b.dataset.k; closeModal(true); if (v) addProf(kind, v); return; }
    case 'featreset': { const f = S.features[i]; if (!f) break; f.name = f.dname || f.name; f.max = f.dmax || ''; f.reset = f.dreset || 'long'; const src = findFeatureDesc(f); if (src != null) f.desc = src; pendingLabel = 'Restore ' + f.name; save(); render(); break; }
    case 'changerace': openRaceChange(); return;
    case 'changebg': openBgChange(); return;
    case 'rcok': RC.kind === 'race' ? raceChangeOK() : bgChangeOK(); return;
    case 'r20ext': downloadR20Ext(); return;
    case 'r20zip': downloadR20Ext(); return;
    case 'r20open': window.open('https://app.roll20.net/campaigns/search', '_blank', 'noopener'); return;
    case 'r20check': r20Hello(); setTimeout(renderR20Box, 600); return;
    case 'r20setup': openR20Setup(); return;
    case 'r20check2': r20Hello(); setTimeout(() => { if (R20.ok) { toast('Extension connected — pick your game in Settings → Dice.'); openSettings('dice'); } else toast('Not connected yet. Reload this sheet after loading the extension, then check again.', 'fumble', 7000); }, 700); return;
    case 'r20refresh': R20._asked = true; r20Refresh(); return;
    case 'r20test': { const r = d20('Test roll', 0, 'check', 'dex'); return; }
    case 'lvcls': LV.cls = b.dataset.k; LV.sub = ''; renderLevelUp(); pendingLabel = null; return;
  }
}
const ACTL = { skillprof: 'Skill proficiency', add: 'Add entry', del: 'Remove entry', up: 'Reorder list', econ: 'Toggle action used', move: 'Movement', round: 'Change round', newturn: 'Next turn', endcombat: 'End combat', resetturn: 'Reset turn', spendhd: 'Spend Hit Die', 'confirm-short': 'Short rest', 'confirm-long': 'Long rest', equip: 'Equip / unequip', filter: 'Spell filter', acauto: 'AC automatic', deathsave: 'Death save', endform: 'Revert form' };
function actLabel(act, b, i) {
  if (act === 'cast' && S.spells[i]) return 'Cast ' + S.spells[i].name;
  if (act === 'usefeat') { const f = S.features[i]; return 'Use ' + (f ? f.name : 'feature'); }
  if (act === 'markopt') return 'Take ' + b.dataset.name;
  if (act === 'coin') return `${N(b.dataset.d) > 0 ? '+' : '−'}1 ${b.dataset.c.toUpperCase()}`;
  if (act === 'skillprof') return 'Proficiency: ' + S.skills[i].name;
  if (act === 'del') { const it = getP(b.dataset.list)[i]; return 'Remove ' + ((it && (it.name || it.title)) || 'entry'); }
  if (act === 'add') return 'Add to ' + b.dataset.list.split('.').pop();
  if (act === 'equip' && S.inventory[i]) return (S.inventory[i].equipped ? 'Unequip ' : 'Equip ') + S.inventory[i].name;
  return ACTL[act] || null;
}
document.addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toLowerCase(), typing = (tag === 'input' && !['checkbox', 'button'].includes(e.target.type)) || tag === 'textarea' || tag === 'select';
  if ((e.ctrlKey || e.metaKey) && !typing && S.created && !$('#wizard').classList.contains('open')) {
    const k = e.key.toLowerCase();
    if (k === 'z' && !e.shiftKey) { e.preventDefault(); const lb = HIST.length && HIST[HIST.length - 1].label; if (undo(1)) toast('Undid: ' + esc(lb)); return; }
    if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); const lb = REDO.length && REDO[REDO.length - 1].label; if (redo(1)) toast('Redid: ' + esc(lb)); return; }
  }
  if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('portrait-edit')) $('#portraitFile').click();
  if (e.key === 'Enter' && e.target.id === 'hpAmt') hpAction(e.shiftKey ? 'heal' : 'dmg');
});

// ---------- Rolling ----------
let critUntil = 0;
function doRoll(key) {
  const [k, a] = key.split(':');
  if (k === 'tool') { const t = S.tools[a]; return d20(t.name + (t.exp ? ' (expertise)' : ''), toolBonus(t), 'check', t.ab || toolAb(t.name)); }
  if (k === 'mod') return d20(ABN[a] + ' check', mod(a), 'check', a);
  if (k === 'save') return d20(ABN[a] + ' save', saveVal(a), 'save', a);
  if (k === 'skill') { const s = S.skills[a]; ROLL_CTX = 'skill:' + s.name; try { return d20(s.name + (s.note ? ' — ' + s.note : ''), skillVal(s), 'check', s.ab); } finally { ROLL_CTX = ''; } }
  if (k === 'init') { ROLL_CTX = 'init'; try { fxTrigger('initiative'); save(); return d20('Initiative', initVal(), 'check', 'dex'); } finally { ROLL_CTX = ''; } }
  if (k === 'spellatk') return d20(clsName(a) + ' spell attack', castInfo(a).atk, 'attack');
  if (k === 'atk') { const at = S.attacks[a], note = spendAmmo(at); if (note === null) return; if (note) { pendingLabel = 'Fire ' + at.name; update(); } ATK_ITEM = { id: at.item || '', weapon: !at.effect || !!at.weaponLike }; try { return d20(at.name + ' attack' + (note ? ' · ' + note : ''), atkHit(at), 'attack'); } finally { ATK_ITEM = null; } }
  if (k === 'dmg') { const at = S.attacks[a]; const m = atkDmgMod(at); return roll(at.name + ' damage' + (at.type ? ' (' + at.type + ')' : ''), (atkDice(at) || '0') + (m ? sgn(m) : '')); }
}
// One shot of ammunition per attack roll. Returns a note, or null when you're out (the roll is cancelled).
function spendAmmo(a) {
  autoAmmo(a);
  const am = ammoItem(a), wit = a.item && S.inventory.find(x => x.id === a.item);
  if (!am) return wit && wit.weapon && (wit.weapon.props || []).includes('ammunition') ? 'No matching ammunition in your inventory' : '';
  if (N(am.qty) <= 0) { toast(`Out of ammunition (${esc(am.name)}). Add more in Inventory.`, 'fumble', 6000); return null; }
  am.qty = N(am.qty) - 1;
  if (!isFirearm(wit)) { S.turn.ammo = S.turn.ammo || {}; S.turn.ammo[am.id] = N(S.turn.ammo[am.id]) + 1; }
  return `${esc(am.name)}: ${am.qty} left${am.qty <= 5 ? ' — running low!' : ''}`;
}
// From the Combat tab an attack uses up your attacks for the turn; from anywhere else it's just a roll.
function attackRoll(i, free, opt) {
  opt = opt || {};
  const a = S.attacks[i]; if (!a) return;
  if (incapCond()) { toast(`You're <b>${incapCond().toLowerCase()}</b> — you can't take actions or reactions.`, 'fumble'); return; }
  if (!free && !canAttack()) { toast('No attacks left this turn.'); return; }
  pendingLabel = 'Attack with ' + a.name;
  const ammoNote = spendAmmo(a); if (ammoNote === null) return;
  if (!free) { S.turn.attacks = N(S.turn.attacks) + 1; S.turn.used.action = true; }
  const hit = atkHit(a), m = atkDmgMod(a);
  ATK_ITEM = { id: a.item || '', weapon: !a.effect || !!a.weaponLike };
  let dd20; try { dd20 = d20Expr(hit, 'attack'); } finally { ATK_ITEM = null; }
  const { expr, rm, bless, ex } = dd20;
  const nm = opt.label || a.name;
  const h = rollExpr(expr, { label: nm + ' attack' });
  const crit = h.d20 >= critRange(), nat1 = h.d20 === 1;
  let dice = atkDice(a) || '0';
  const isWeapon = !a.effect || a.weaponLike;
  const extras = isWeapon ? extraDice(a) : [];
  if (a.kind === 'melee' && clsLv('paladin') >= 11 && isWeapon) extras.push('1d8 radiant');
  let brutal = 0;
  if (crit && a.kind === 'melee') { const bl = clsLv('barbarian'); brutal = bl >= 17 ? 3 : bl >= 13 ? 2 : bl >= 9 ? 1 : 0; const r = raceInfo(); if (r && r.traits.some(t => /Savage Attacks/i.test(t[0]))) brutal++; }
  const riders = isWeapon && !nat1 && a.kind === 'melee' || isWeapon && !nat1 && a.kind === 'ranged' ? (S.riders || []).splice(0) : [];
  const dexp = (crit ? critDice(dice) : dice) + (brutal && /\d*d\d+/.test(dice) ? '+' + diceTimes(dice.match(/\d*d\d+/)[0].replace(/^\d*/, '1'), brutal) : '') + (m ? sgn(m) : '');
  const d = rollExpr(dexp, { label: nm + ' damage' });
  const xr = extras.map(x => { const dd = (x.match(/\d*d\d+/) || [''])[0]; const r = rollExpr(crit ? doubleDice(dd) : dd, { label: nm + ' damage (' + String(x).replace(/^\S+\s*/, '') + ')' }); return { label: x, r }; });
  const rr = riders.map(x => { const dd = String(x.dice).match(/\d*d\d+(?:\+\d*d\d+)*/); const r = dd ? rollExpr(crit ? doubleDice(dd[0]) : dd[0]) : { total: 0, detail: '' }; return { label: x.name + ' ' + x.dice, r }; });
  // Sneak Attack rolls itself when the attack has advantage with a finesse or ranged weapon (once per turn).
  const sa = sneakAuto(a, rm, nat1, isWeapon, opt.offTurn), sr = sa ? rollExpr(crit ? critDice(sa) : sa, { label: 'Sneak Attack (' + sa + ')' }) : null;
  if (sr && !opt.offTurn && S.inCombat) { S.turn.sneak = true; setTimeout(refresh, 0); }
  const total = d.total + xr.reduce((t, x) => t + x.r.total, 0) + rr.reduce((t, x) => t + x.r.total, 0) + (sr ? sr.total : 0);
  // Damage by type (Booming Blade's thunder, Improved Divine Smite's radiant… aren't the weapon's type): resistances care.
  const mainT = a.type ? String(a.type).toLowerCase() : 'damage', byType = {}, addT = (t, v) => { if (!v) return; t = String(t || '').trim().toLowerCase() || mainT; byType[t] = (byType[t] || 0) + v; };
  addT(mainT, d.total + (sr ? sr.total : 0)); xr.forEach(x => addT(String(x.label).replace(/^[\d+d\s-]+/, ''), x.r.total)); rr.forEach((x, k) => addT(String(riders[k].dice).replace(/^[\d+d\s-]+/, ''), x.r.total));
  const types = Object.entries(byType);
  const n1 = nat1 ? nat1Roll() : null;
  if (crit) critUntil = Date.now() + 60000;
  update();
  const head = crit ? 'CRITICAL HIT! Damage dice doubled' : nat1 ? 'Natural 1: automatic miss' : 'to hit';
  const note = [rm.mode !== 'normal' ? (rm.mode === 'adv' ? 'Advantage: ' : 'Disadvantage: ') + rm.why.join(', ') : '', bless ? 'Bless +1d4' : '', ex ? `Exhaustion −${ex}` : ''].filter(Boolean).join(' · ');
  const keepR = riders.filter(x => !x.once);
  const acts = keepR.length ? [{ label: 'Missed — keep riders', fn: () => { S.riders = (S.riders || []).concat(keepR); pendingLabel = 'Keep riders'; update(); toast('Riders saved for your next hit.'); } }] : [];
  if (!nat1 && a.kind === 'melee' && stunStrikeFeat() && stunKiLeft() > 0) acts.push({ label: 'Stunning Strike (1 ki)', fn: () => stunningStrike() });
  if (sr && !opt.offTurn) acts.push({ label: 'Missed — Sneak Attack not used', fn: () => { S.turn.sneak = false; pendingLabel = 'Sneak Attack not used'; update(); refresh(); toast('Sneak Attack is ready again this turn.'); } });
  // The card shows just the two numbers: to hit and damage. The full breakdown goes to the roll log.
  toast(`<b class="total">${h.total}</b><div class="rc-body"><div class="rc-name">${esc(nm)}</div><div class="rc-lbl">${crit ? 'CRITICAL HIT' : nat1 ? 'Natural 1 — miss' : 'to hit'}</div>
    ${(opt.notes || []).map(x => `<div class="det">${x}</div>`).join('')}${n1 ? `<div class="rc-n1"><b>Nat 1 Roll:</b> ${n1.total}</div>` : ''}<div class="det">Hit: ${esc(h.detail)} · Dmg: ${esc(d.detail)}${sr ? ` · <b>Sneak Attack</b>: ${esc(sr.detail)}` : ''}${xr.map(x => ` · ${esc(x.label)}: ${x.r.total}`).join('')}${rr.map(x => ` · <b>${esc(x.label)}</b>: ${x.r.total}`).join('')}</div>
    ${note ? `<div class="det">${esc(note)}</div>` : ''}<div class="det">${[ammoNote, free ? '' : `Attack ${N(S.turn.attacks)} of ${attacksPerAction()} this turn`].filter(Boolean).join(' · ')}${crit && hasFeature('Divine Smite') ? ' · a smite now also doubles' : ''}</div></div>
    <div class="rc-dmg${nat1 ? ' void' : ''}"><b>${total}</b><span>${types.length > 1 ? `<span class="rc-types">${types.map(([t, v]) => `<i><b>${v}</b> ${esc(t)}</i>`).join('')}</span>` : esc(mainT)}${sr ? `<small>incl. ${sr.total} sneak</small>` : ''}</span></div>`, crit ? 'crit' : nat1 ? 'fumble' : '', crit ? 12000 : 9000, acts);
}
// Sneak Attack dice for this attack, or '' when it doesn't apply automatically.
function sneakAuto(a, rm, nat1, isWeapon, offTurn) {
  if (!clsLv('rogue') || !isWeapon || nat1 || (S.inCombat && S.turn.sneak && !offTurn) || !rm || rm.mode !== 'adv') return '';
  const it = a.item && S.inventory.find(x => x.id === a.item), w = it && it.weapon;
  const ok = w ? (w.props || []).includes('finesse') || w.kind === 'ranged' : a.ab === 'fin' || a.kind === 'ranged';
  return ok ? sneakDice() : '';
}
function creatureRoll(who, j, what) {
  const src = who === 'form' ? S.form : S.companions[N(who.slice(1))];
  if (!src) return; const a = (src.attacks || [])[j]; if (!a) return;
  const nm = src.name + ' · ' + actName(a), kind = actKind(a);
  // Actions with limited uses per day (a[8]), e.g. the Steel Defender's Repair 3/day
  if (N(a[8]) > 0 && who !== 'form') { const u = N((src.used || {})[a[0]]); if (u >= N(a[8])) { toast(`${esc(src.name)} has no ${esc(actName(a))} uses left — they come back after a long rest.`, 'fumble'); return; } src.used = Object.assign({}, src.used, { [a[0]]: u + 1 }); save(); render(); }
  if (what === 'eff' || (what === 'both' && kind !== 'attack')) {
    const r = rollExpr(String(a[2] || '0'), { label: nm }), comp = who === 'form' ? null : src;
    if (kind === 'temp' || kind === 'heal') {
      const acts = a[7] === 'construct' ? [] : [{ label: kind === 'temp' ? `Give me ${r.total} temp HP` : `Heal me ${r.total}`, fn: () => { if (kind === 'temp') S.hp.temp = Math.max(N(S.hp.temp), r.total); else S.hp.cur = Math.min(maxHp(), N(S.hp.cur) + r.total); pendingLabel = nm; save(); render(); } }];
      if (comp && comp.maxhp) acts.push({ label: kind === 'temp' ? `${comp.name}: ${r.total} temp` : `Heal ${comp.name}`, fn: () => { if (kind === 'temp') comp.temp = Math.max(N(comp.temp), r.total); else comp.hp = Math.min(N(comp.maxhp), N(comp.hp) + r.total); pendingLabel = nm; save(); render(); } });
      toast(`<b class="total">${r.total}</b><div class="rc-body"><div class="rc-name">${esc(nm)}</div><div class="rc-lbl">${kind === 'temp' ? 'temporary HP' : 'healing'}</div><div class="det">${esc(r.detail)}${a[3] ? ' · ' + esc(a[3]) : ''}</div></div>`, '', 12000, acts);
      return;
    }
    const dc = kind === 'save' ? actDC(src, a) : '', sv = actSave(a);
    toast(`<b class="total">${r.total}</b><div class="rc-body"><div class="rc-name">${esc(nm)}</div><div class="rc-lbl">${kind === 'save' ? `damage · DC ${dc}${sv ? ' ' + sv : ''} save` : 'roll'}</div><div class="det">${esc(r.detail)}${actNote(a) ? ' · ' + esc(actNote(a)) : ''}</div></div>`, '', 10000);
    return;
  }
  if (what === 'hit' && a[1] !== '' && a[1] != null) return d20(nm + ' attack', N(a[1]), who === 'form' ? 'attack' : 'none');
  if (what === 'dmg' || a[1] === '' || a[1] == null) return roll(nm + ' damage' + (a[3] ? ' (' + a[3] + ')' : ''), String(a[2] || '0'));
  const h = rollExpr((who === 'form' ? d20Expr(N(a[1]), 'attack').expr : '1d20' + sgn(N(a[1]))), { label: nm + ' attack' });
  const crit = h.d20 === 20, nat1 = h.d20 === 1;
  const d = rollExpr(crit ? doubleDice(a[2]) : String(a[2] || '0'), { label: nm + ' damage' + (a[3] ? ' (' + a[3] + ')' : '') });
  toast(`<b class="total">${h.total}</b><div class="rc-body"><div class="rc-name">${esc(nm)}</div><div class="rc-lbl">${crit ? 'CRITICAL HIT' : nat1 ? 'Natural 1 — miss' : 'to hit'}</div><div class="det">Hit: ${esc(h.detail)} · Dmg: ${esc(d.detail)}</div></div><div class="rc-dmg${nat1 ? ' void' : ''}"><b>${d.total}</b><span>${esc(a[3] || 'damage')}</span></div>`, crit ? 'crit' : nat1 ? 'fumble' : '', 8000);
}
function doPip(p) {
  const kind = p.dataset.pip, i = N(p.dataset.i), j = N(p.dataset.j);
  pendingLabel = kind === 'slot' ? `${ORD[i]}-level spell slot` : kind === 'pact' ? 'Pact slot' : kind === 'store' ? 'Stored spell uses' : kind === 'feat' ? `${S.features[i].name} uses` : 'Death save';
  const nextLeft = left => (j < left ? j : j + 1);
  if (kind === 'slot') { const max = slotMax(i); S.slotsUsed[i] = max - nextLeft(slotsLeft(i)); }
  else if (kind === 'infch') { const it = S.inventory[i]; if (it && it.charges) { const mx = N(it.charges.max); it.charges.used = mx - nextLeft(Math.max(0, mx - N(it.charges.used))); } }
  else if (kind === 'store') { const sp = S.spells[i]; if (sp && sp.uses) { const mx = evalMax(sp.uses.max) || 0; sp.uses.used = mx - nextLeft(Math.max(0, mx - N(sp.uses.used))); } }
  else if (kind === 'pact') { const p2 = pact(); S.pactUsed = p2.count - nextLeft(pactLeft()); }
  else if (kind === 'feat') { const f = S.features[i], max = featMax(f) || 0, left = Math.max(0, max - N(f.used)); f.used = max - nextLeft(left); }
  else if (kind === 'deaths' || kind === 'deathf') {
    const key = kind === 'deaths' ? 's' : 'f', n = N(S.death[key]);
    S.death[key] = j < n ? j : j + 1;
    if (S.death.s >= 3) toast(`Three successes — ${esc(who())} is stable.`, '', 4000);
    if (S.death.f >= 3) toast(`Three failures. ${esc(who())} has died…`, 'fumble', 6000);
  }
  update();
}
function deathSave() {
  // Anything that adds to all saving throws (Bless, a Ring of Protection, an ally's Aura of Protection…) adds here too.
  const db = saveAllBonus(), bl = blessed() ? '+1d4' : '';
  const r = rollExpr('1d20' + (db ? sgn(db) : '') + bl, { need: true, label: 'Death save' }); let msg;
  if (r.d20 === 20) { S.hp.cur = 1; S.death = { s: 0, f: 0 }; S.conditions = S.conditions.filter(c => c !== 'Unconscious'); msg = 'Natural 20! You regain 1 HP and wake up.'; }
  else if (r.d20 === 1) { S.death.f = Math.min(3, N(S.death.f) + 2); msg = 'Natural 1 — two failures.'; }
  else if (r.total >= 10) { S.death.s = Math.min(3, N(S.death.s) + 1); msg = 'Success.'; }
  else { S.death.f = Math.min(3, N(S.death.f) + 1); msg = 'Failure.'; }
  if (S.death.s >= 3) msg += ' Three successes — stable.'; if (S.death.f >= 3) msg += ' Three failures — dead.';
  pendingLabel = 'Death save'; update();
  toast(`<b class="total">${r.total}</b><div><div>Death save</div><div class="rc-msg">${esc(msg)}</div></div>`, r.d20 === 20 ? 'crit' : r.total < 10 ? 'fumble' : '', 7000);
}

// ---------- HP, concentration, time ----------
function hpAction(kind) {
  const raw = $('#hpAmt').value, amt = Math.abs(N(raw));
  if (kind === 'tmphp' && raw !== '' && !amt) { $('#hpAmt').value = ''; if (N(S.hp.temp)) { S.hp.temp = 0; pendingLabel = 'Temp HP cleared'; update(); render('vitals'); toast('Temporary HP cleared.'); } return; }
  if (raw === '' || !amt) { $('#hpAmt').focus(); toast('Type an amount in the box first.'); return; }
  $('#hpAmt').value = '';
  if (kind === 'tmphp') { const cur = N(S.hp.temp); if (amt <= cur) { toast(`You keep your <b>${cur}</b> temporary HP — they don't stack, the higher one stays.`, '', 6000); return; } S.hp.temp = amt; pendingLabel = `Temp HP ${amt}`; update(); render('vitals'); toast(`<b>${amt}</b> temporary HP${cur ? ` (replaces ${cur})` : ''}.`); return; }
  if (kind === 'dmg') takeDamage(amt); else healSelf(amt);
}
function takeDamage(amt) {
  { const raw = amt, adj = surgeDamageAdj(amt); if (adj !== raw) { setTimeout(() => toast(adj < raw ? `Resistance to all damage: ${raw} → <b>${adj}</b>.` : `Vulnerable to all damage: ${raw} → <b>${adj}</b>.`, '', 5000), 60); amt = adj; } }
  const hp = S.hp; pendingLabel = `Took ${amt} damage`;
  if (amt > 0) setTimeout(() => S.inventory.forEach(it => { const h = it.hb || {}; if (!h.hurtSave || !hbItemOn(it)) return; const ab = h.hurtSave, dc = N(h.hurtDC) || 10;
    toast(`<div><b>${esc(it.name)}</b><div class="det">DC ${dc} ${ab.toUpperCase()} save${h.hurtText ? ' — on a failure: ' + esc(h.hurtText) : ''}</div></div>`, 'alert', 20000, [{ label: 'Roll save', fn: () => { const r = d20(`${it.name}: DC ${dc} ${ab.toUpperCase()} save`, saveVal(ab), 'save', ab); if (r && !r.skipped) toast(r.total >= dc ? `Saved against ${esc(it.name)}.` : `<b>Failed</b> — ${esc(h.hurtText || it.name)}`, r.total >= dc ? '' : 'fumble', 9000); } }]);
  }), 250);
  let d = amt; const t = N(hp.temp);
  if (t) { const a = Math.min(t, d); hp.temp = t - a; d -= a; }
  const conc = S.concentration, dc = Math.max(10, Math.floor(amt / 2));
  if (S.form && d > 0) {
    const fh = N(S.form.hp);
    if (d < fh) { S.form.hp = fh - d; update(); if (conc && ST('concPrompt')) setTimeout(() => concCheck(dc), 50); return; }
    d -= fh; const nm = S.form.name; endForm(0, 'dropped to 0 HP', true);
    toast(`${esc(nm)} drops to 0 HP — you revert${d ? ` and take the remaining ${d}` : ''}.`, 'alert', 8000);
  }
  const before = N(hp.cur);
  if (before <= 0 && d > 0) { S.death.f = Math.min(3, N(S.death.f) + 1); update(); toast('Damage while at 0 HP — one death save failure (two on a crit).', 'fumble', 7000); return; }
  hp.cur = Math.max(0, before - d);
  if (hp.cur === 0 && before > 0) {
    if (!S.conditions.includes('Unconscious')) S.conditions.push('Unconscious');
    toast(`${esc(who())} drops to 0 HP — roll death saves.`, 'fumble', 7000);
    fxTrigger('zero');
    if (conc) { update(); breakConc('dropped to 0 HP'); return; }
  } else if (conc && d >= 0 && ST('concPrompt')) setTimeout(() => concCheck(dc), 50);
  update();
}
function healSelf(amt, label) {
  pendingLabel = label || `Healed ${amt}`;
  if (S.form) { S.form.hp = Math.min(N(S.form.maxhp), N(S.form.hp) + amt); update(); return; }
  const before = N(S.hp.cur);
  S.hp.cur = Math.min(maxHp(), before + amt);
  if (before <= 0 && S.hp.cur > 0) { S.death = { s: 0, f: 0 }; S.conditions = S.conditions.filter(c => c !== 'Unconscious'); }
  update();
}
function passRounds(n) {
  const ended = [], warn = [];
  (S.effects || []).forEach(e => {
    if (e.rounds == null) return;
    e.rounds = Math.max(0, N(e.rounds) - n);
    if (e.rounds === 0) ended.push(e); else if (e.rounds === 1 && n === 1) warn.push(e);
  });
  if (ended.length) {
    S.effects = S.effects.filter(e => !ended.includes(e));
    if (ended.some(e => e.conc && e.name === S.concentration)) S.concentration = '';
    cleanupLinked();
  }
  return { ended, warn };
}
function announce(res) {
  if (!ST('durationAlerts')) return;
  res.ended.forEach(e => toast(`⏳ <b>${esc(e.name)}</b> has ended.`, 'alert', 9000));
  res.warn.forEach(e => toast(`⏳ <b>${esc(e.name)}</b> ends after this round.`, 'alert', 7000));
}
function cleanupLinked() {
  const names = new Set((S.effects || []).map(e => e.name));
  S.companions = S.companions.filter(c => !c.effect || names.has(c.effect));
  S.attacks = S.attacks.filter(a => !a.effect || names.has(a.effect));
  if (S.form && S.form.effect && !names.has(S.form.effect)) S.form = null;
  if (S.conditions.includes('Raging') && !names.has('Rage')) S.conditions = S.conditions.filter(c => c !== 'Raging');
}
function breakConc(reason) {
  const nm = S.concentration; if (!nm) return;
  S.concentration = ''; S.effects = (S.effects || []).filter(e => !e.conc);
  pendingLabel = 'Concentration broken: ' + nm; cleanupLinked(); save(); render();
  toast(`💥 Concentration broken — <b>${esc(nm)}</b> ends${reason ? ` (${esc(reason)})` : ''}.`, 'fumble', 9000, { label: 'Undo', fn: () => undo(1) });
}
function concCheck(dc) {
  const nm = S.concentration; if (!nm) return;
  const bonus = saveVal('con') + (hasFeat('War Caster') ? 0 : 0);
  toast(`<div><b>Concentration check</b> for ${esc(nm)}<div class="det">DC ${dc} CON save · ${fmt(bonus)}${hasFeat('War Caster') ? ' · War Caster: advantage' : ''}</div></div>`, 'alert', 30000, [
    { label: 'Roll', fn: () => { if (S.concentration !== nm) { toast('No longer concentrating on that spell.'); return; } const ex = (hasFeat('War Caster') ? '2d20kh1' : d20Expr(bonus, 'save', 'con').expr.replace(/[+-]\d+.*$/, '')) + sgn(bonus - exD20()) + (blessed() ? '+1d4' : ''); const r = rollExpr(ex, { need: true, label: 'Concentration save' }); const ok = r.total >= dc; toast(`<b class="total">${r.total}</b><div><div>Concentration ${ok ? 'holds' : 'fails'} (DC ${dc})</div><div class="det">${esc(r.detail)}</div></div>`, ok ? 'crit' : 'fumble', 6000); if (!ok) breakConc('failed DC ' + dc); } },
    { label: 'Failed', fn: () => { if (S.concentration === nm) breakConc('failed DC ' + dc); } }]);
}
function endEffect(n) {
  S.effects = (S.effects || []).filter(x => x.name !== n);
  if (S.concentration === n) S.concentration = '';
  pendingLabel = 'End ' + n; cleanupLinked(); save(); render();
  toast(`${esc(n)} ended.`, '', 4000, { label: 'Undo', fn: () => undo(1) });
}
function repeatEffect(j) {
  const e = S.effects[j]; if (!e || !e.repeat) return;
  const r = rollExpr(e.repeat.dice);
  toast(`<b class="total">${r.total}</b><div><div>${esc(e.name)} — ${e.repeat.heal ? 'healing' : esc(e.repeat.type || 'damage')}</div><div class="det">${esc(r.detail)}${e.repeat.save ? ' · ' + esc(e.repeat.save) : ''}</div></div>`, '', 7000);
}
function nextTurn() {
  if (S.felineSpent && !S.turn.feline && N(S.turn.moved) <= 0) S.felineSpent = false;  // Feline Agility recharges after a turn without moving
  const held = S.turn.readied; S.turn.readied = null;
  if (held) setTimeout(() => readyLost(held, 'Your readied action ran out (it lasts until your next turn)'), 80);
  S.turn.round = (N(S.turn.round) || 1) + 1; S.turn.used = {}; S.turn.commanded = {}; S.turn.disengaged = false; S.turn.moved = 0; S.turn.dash = 0; S.turn.attacks = 0; S.turn.feline = false; S.turn.speed0 = ''; S.turn.sneak = false;
  S.turn.haste = false;
  // Haste's lethargy: the turn after it wears off you can't move or take actions.
  if (N(S.lethargy) === 1) { S.lethargy = 2; S.turn.speed0 = 'Haste lethargy'; setTimeout(() => toast('<b>Lethargic</b> — Haste wore off, so this turn you can’t move or take actions. You’re back to normal next turn.', 'fumble', 9000), 120); } else if (N(S.lethargy) === 2) S.lethargy = 0;
  S.conditions = S.conditions.filter(c => c !== 'Dodging');
  const ended = [];
  Object.keys(S.tmpMods || {}).forEach(k => { const m = S.tmpMods[k]; if (N(m.r) > 0) { m.r = N(m.r) - 1; if (m.r <= 0) { delete S.tmpMods[k]; ended.push(tmName(k) + ' change'); clampHp(); } } });
  if (abTempOn() && N(S.abTempR) > 0) { S.abTempR = N(S.abTempR) - 1; if (S.abTempR <= 0) { S.abTemp = {}; S.abTempR = 0; ended.push('Ability score changes'); } }
  Object.keys(S.condTurns || {}).forEach(c => { if (!S.conditions.includes(c)) { delete S.condTurns[c]; return; } if (N(S.condTurns[c]) <= 0) return; S.condTurns[c] = N(S.condTurns[c]) - 1; if (S.condTurns[c] <= 0) { delete S.condTurns[c]; if (S.condNotes) delete S.condNotes[c]; S.conditions = S.conditions.filter(x => x !== c); ended.push(c); } });
  if (ended.length) setTimeout(() => toast(`<b>${esc(ended.join(', '))}</b> wore off.`, '', 6000), 50);
  const res = passRounds(1);
  pendingLabel = 'Next turn'; update(); render();
  toast(`Round ${S.turn.round} — action, bonus action, reaction and movement ready.`);
  announce(res);
  const tmpEach = fxActive().find(e => e.buff && e.buff.tempEach && !e.ally);
  if (tmpEach) { const v = Math.max(0, castInfo().mod || 0); if (v > N(S.hp.temp)) { S.hp.temp = v; save(); refresh(); toast(`${esc(tmpEach.name)}: ${v} temporary HP.`); } }
  wildTurnStart();
}
// ---------- Ready action ----------
// Ready: pick what you'll do and the trigger; it waits in the Reaction column until you fire it with your reaction.
let READY_PICK = '';
function readyChoices() {
  const out = [];
  S.attacks.forEach((a, i) => { if (atkShown(a)) out.push({ k: 'atk:' + i, name: 'Attack: ' + a.name, sub: atkHit(a) >= 0 ? '+' + atkHit(a) + ' to hit' : atkHit(a) + ' to hit' }); });
  spellsFor('action').forEach(([sp, i]) => out.push({ k: 'sp:' + i, name: sp.name, sub: (N(sp.level) ? ORD[N(sp.level) - 1] + ' level' : 'Cantrip') + ' · held with concentration' }));
  (S.combat.action || []).forEach(o => { if (!/^(ready|attack)$/i.test(o.name)) out.push({ k: 'std:' + o.name, name: o.name, sub: o.text || '' }); });
  return out;
}
function openReady() {
  if (incapCond()) { toast(`You're <b>${incapCond().toLowerCase()}</b> — you can't take actions or reactions.`, 'fumble'); return; }
  if ((S.turn.used || {}).action) { toast('Your action is already used this turn.', 'fumble'); return; }
  READY_PICK = '';
  const ch = readyChoices();
  openModal(`<h3>Ready an action</h3>
    <p class="hint" style="margin:0 0 8px">Uses your action now. When the trigger happens before your next turn, use your reaction to do it. Readying a spell means casting it now and holding it with concentration.</p>
    ${fld('Trigger', '<input class="f" id="readyTrig" placeholder="e.g. when the goblin comes through the door" autofocus>')}
    <div class="lbl" style="margin-top:8px">What you'll do</div>
    <div class="castopts">${ch.map(c => `<button class="castopt" data-act="readypick" data-k="${esc(c.k)}"><b>${esc(c.name)}</b><span>${esc(c.sub)}</span></button>`).join('')}
      <button class="castopt ghost" data-act="readypick" data-k="other"><b>Something else…</b><span>type it below</span></button></div>
    ${fld('Something else', '<input class="f" id="readyOther" placeholder="e.g. pull the lever">')}
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="readygo">Ready it</button></div>`);
}
function readyGo() {
  const other = ($('#readyOther') && $('#readyOther').value.trim()) || '', trig = ($('#readyTrig') && $('#readyTrig').value.trim()) || '';
  const k = READY_PICK || (other ? 'other' : '');
  if (!k) { toast('Pick what you want to ready.'); return; }
  if (k === 'other' && !other) { toast('Type what you want to ready.'); return; }
  const c = readyChoices().find(x => x.k === k);
  const r = { k, name: k === 'other' ? other : c.name.replace(/^Attack: /, 'Attack with '), trigger: trig };
  if (k.startsWith('sp:')) { const sp = S.spells[N(k.slice(3))]; r.spell = sp && sp.name; r.level = sp ? N(sp.level) : 0; r.i = N(k.slice(3)); }
  // A readied spell is cast now and held, so its slot is spent now, whether or not it ever goes off.
  if (r.spell && r.level > 0) {
    const sp = S.spells[r.i], base = r.level, opts = [];
    if (sp && sp.usesOnly) { const mx = evalMax(sp.uses && sp.uses.max) || 0, left = Math.max(0, mx - N(sp.uses && sp.uses.used)); opts.push({ k: 'store', L: Math.max(base, N(sp.uses && sp.uses.level) || base), label: 'Stored use', left }); }
    else {
      if (sp && sp.uses) { const mx = evalMax(sp.uses.max) || 0, left = Math.max(0, mx - N(sp.uses.used)); if (mx) opts.push({ k: 'free', L: Math.max(base, N(sp.uses.level) || base), label: `Free use (${left}/${mx})`, left }); }
      for (let L = base; L <= 9; L++) if (slotMax(L - 1) > 0) opts.push({ k: 'slot', L, label: `${ORD[L - 1]} slot`, left: slotsLeft(L - 1) });
      const p = pact(); if (p && p.level >= base) opts.push({ k: 'pact', L: p.level, label: `Pact slot (${ORD[p.level - 1]})`, left: pactLeft() });
    }
    const usable = opts.filter(o => o.left > 0);
    if (!usable.length) { toast(`No slot left to ready <b>${esc(r.spell)}</b>.`, 'fumble'); return; }
    READY_HOLD = r;
    if (usable.length === 1) return readyPay(usable[0].k, usable[0].L);
    return openModal(`<h3>Ready ${esc(r.spell)}</h3><p class="hint" style="margin:0 0 8px">Readying a spell casts it now and holds it with concentration — the slot is spent now, even if the trigger never comes.</p>
      <div class="castopts">${opts.map(o => `<button class="castopt" data-act="readypay" data-k="${o.k}" data-l="${o.L}" ${o.left > 0 ? '' : 'disabled'}><b>${esc(o.label)}</b><span>${o.k === 'slot' ? o.left + ' left' : o.k === 'store' ? o.left + ' left' : ''}</span></button>`).join('')}
      <button class="castopt ghost" data-act="readypay" data-k="none" data-l="${base}"><b>No slot</b><span>scroll, item or DM ruling</span></button></div>
      <div class="actions"><button class="btn" data-act="close">Cancel</button></div>`);
  }
  readyCommit(r);
}
let READY_HOLD = null, READY_PAID = null;
function readyPay(k, L) {
  const r = READY_HOLD; READY_HOLD = null; if (!r) return;
  const sp = S.spells[r.i];
  if (k === 'slot') S.slotsUsed[L - 1] = N(S.slotsUsed[L - 1]) + 1;
  else if (k === 'pact') S.pactUsed = N(S.pactUsed) + 1;
  else if ((k === 'free' || k === 'store') && sp && sp.uses) sp.uses.used = N(sp.uses.used) + 1;
  r.paid = { k, L };
  readyCommit(r);
}
function readyCommit(r) {
  closeModal(true);
  S.turn.used.action = true; S.turn.readied = r;
  const paid = r.paid && r.paid.k !== 'none' ? (r.paid.k === 'slot' ? `${ORD[r.paid.L - 1]} slot` : r.paid.k === 'pact' ? 'pact slot' : r.paid.k === 'store' ? 'stored use' : 'free use') : '';
  pendingLabel = 'Ready: ' + r.name + (paid ? ` (${paid})` : ''); update(); render('combat');
  toast(`<div><b>Readied:</b> ${esc(r.name)}${trig0(r)}${paid ? `<div class="det">${esc(paid.charAt(0).toUpperCase() + paid.slice(1))} spent now — concentrate to hold it.</div>` : ''}<div class="det">It's waiting in your Reaction column.</div></div>`, '', 7000);
}
const trig0 = r => r.trigger ? `<div class="det">Trigger: ${esc(r.trigger)}</div>` : '';
function readyFire() {
  const r = S.turn.readied; if (!r) return;
  if (incapCond()) { toast(`You're <b>${incapCond().toLowerCase()}</b> — you can't take reactions.`, 'fumble'); return; }
  if ((S.turn.used || {}).reaction) { toast('Your reaction is already used — the readied action is lost.', 'fumble'); return; }
  S.turn.readied = null;
  if (r.k.startsWith('atk:')) { S.turn.used.reaction = true; pendingLabel = 'Readied attack'; attackRoll(N(r.k.slice(4)), true, { offTurn: true }); render('combat'); return; }
  if (r.k.startsWith('sp:')) { const i = N(r.k.slice(3)); if (S.spells[i] && S.spells[i].name === r.spell) { if (r.paid) READY_PAID = { i, L: r.paid.L }; render('combat'); castSpell(i, 'reaction'); return; } }
  S.turn.used.reaction = true;
  if (/^std:dash$/i.test(r.k)) addDash();
  pendingLabel = 'Readied: ' + r.name; update(); render('combat');
  toast(`<div><b>${esc(r.name)}</b> — reaction spent.${r.trigger ? `<div class="det">Trigger: ${esc(r.trigger)}</div>` : ''}</div>`, '', 6000);
}
// A readied spell that never goes off still used its slot.
function readyLost(r, why) {
  if (r.spell && r.paid) { toast(`<div><b>${esc(r.spell)}</b> was never released.<div class="det">${esc(why)}. Its slot was spent when you readied it.</div></div>`, 'fumble', 8000); return; }
  if (r.spell && r.level > 0) {
    const L = r.level, slot = [...Array(10 - L).keys()].map(d => L - 1 + d).find(l => slotMax(l) > 0 && slotsLeft(l) > 0), p = pact();
    const acts = [];
    if (slot != null) acts.push({ label: `Spend ${ORD[slot]} slot`, fn: () => { S.slotsUsed[slot] = N(S.slotsUsed[slot]) + 1; pendingLabel = 'Readied spell wasted'; update(); } });
    if (p && p.level >= L && pactLeft() > 0) acts.push({ label: 'Spend pact slot', fn: () => { S.pactUsed = N(S.pactUsed) + 1; pendingLabel = 'Readied spell wasted'; update(); } });
    toast(`<div><b>${esc(r.spell)}</b> was never released.<div class="det">${esc(why)}. A readied spell's slot is still spent.</div></div>`, 'fumble', 12000, acts);
  } else toast(`<div>Readied action dropped: <b>${esc(r.name)}</b>.<div class="det">${esc(why)}.</div></div>`, '', 5000);
}
// Dash: adds your speed to this turn's movement (shown as speed + Dash, not as negative movement).
function addDash() { S.turn.dash = N(S.turn.dash) + 1; if (N(S.turn.moved) < 0) S.turn.moved = 0; }
function moveBudget() { return turnSpeed() * (1 + N(S.turn.dash)); }
function markOpt(b) {
  const col = b.dataset.col, nm = b.dataset.name;
  if (col !== 'move') { if (incapCond()) { toast(`You're <b>${incapCond().toLowerCase()}</b> — you can't take actions or reactions.`, 'fumble'); return; } }
  if (col === 'move' && speedFt() === 0) { toast(`Your speed is 0 right now.`, 'fumble'); return; }
  if (col !== 'move' && /^search$/i.test(nm)) { openSearch(col); return; }
  if (col === 'reaction' && /^opportunity attack$/i.test(nm)) { openOA(); return; }
  // Grapple / Shove replace one attack of the Attack action (2014 rules), so they use up an attack, not the whole action.
  if (col === 'action' && /^(grapple|shove)$/i.test(nm)) { const per = attacksPerAction(), done = N(S.turn.attacks);
    if (S.turn.used.action && (done === 0 || done >= per)) { toast(done ? `No attacks left this turn (${per}).` : 'Your action is already used this turn.', 'fumble'); return; }
    S.turn.attacks = done + 1; S.turn.used.action = true; pendingLabel = nm; update();
    const k = S.skills.findIndex(x => x.name === 'Athletics'); if (k >= 0) doRoll('skill:' + k);
    toast(`<div><b>${esc(nm)}</b> — uses attack ${S.turn.attacks} of ${per}.<div class="det">${/grapple/i.test(nm) ? 'The target contests with Athletics or Acrobatics. If you win it is Grappled (speed 0) until it escapes. It must be no more than one size larger than you.' : 'The target contests with Athletics or Acrobatics. If you win, knock it Prone or push it 5 ft away. It must be no more than one size larger than you.'}</div></div>`, '', 8000); return; }
  if (col !== 'move' && S.inCombat && S.turn.used[col]) { toast(`Your ${col === 'bonus' ? 'bonus action' : col} is already used this turn.`, 'fumble'); return; }
  if (col === 'action' && /^use an object$/i.test(nm)) { const items = S.inventory.map((it, i) => [it, i]).filter(([it]) => it.heal || (it.hb && hbUsable(hbFx(it.hb)) && hbItemReady(it)));
    if (items.length) { openModal(`<h3>Use an Object</h3><p class="hint" style="margin:0 0 8px">Uses your action. Pick the item — or just mark the action used for anything else (a lever, a door, a second item).</p><div class="castopts">${items.map(([it, i]) => `<button class="castopt" data-act="${it.heal ? 'drink' : 'useitem'}" data-i="${i}" data-col="action"><b>${esc(it.name)}</b><span>${it.heal ? 'Drink — heals ' + esc(it.heal) : esc((hbSummary(it.hb, it) || []).slice(0, 3).join(' · ') || 'Use it')}</span></button>`).join('')}</div><div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn" data-act="useobjplain">Something else</button></div>`); return; } }
  if (col === 'move' && /^stand up$/i.test(nm)) { if (!S.conditions.includes('Prone')) { toast("You're not prone.", 'fumble'); return; }
    const half = Math.ceil(speedFt() / 2), mv = Math.max(0, N(S.turn.moved)); if (S.inCombat && mv + half > moveBudget()) { toast(`Standing up costs ${half} ft and you only have ${Math.max(0, moveBudget() - mv)} ft left.`, 'fumble'); return; }
    S.conditions = S.conditions.filter(c => c !== 'Prone'); if (S.inCombat) S.turn.moved = mv + half; pendingLabel = 'Stand up'; update(); render(); toast(`<b>Stand up</b> — no longer prone${S.inCombat ? `. Used ${half} ft of movement` : ''}.`, '', 4000, { label: 'Undo', fn: () => undo(1) }); return; }
  if (col === 'move' && /^drop prone$/i.test(nm)) { if (S.conditions.includes('Prone')) { toast("You're already prone.", 'fumble'); return; }
    S.conditions = S.conditions.concat(['Prone']); pendingLabel = 'Drop prone'; update(); render(); toast('<b>Prone</b> — attacks against you within 5 ft have advantage, ranged ones disadvantage; your attacks have disadvantage. Standing up costs half your speed.', '', 6000, { label: 'Undo', fn: () => undo(1) }); return; }
  if (col === 'move' && /^jump$/i.test(nm)) { const st = score('str'), m = mod('str');
    toast(`<div><b>Jump</b><div class="det">Long jump: <b>${st} ft</b> with a 10 ft run-up, ${Math.floor(st / 2)} ft standing. High jump: <b>${Math.max(0, 3 + m)} ft</b> with a run-up, ${Math.floor(Math.max(0, 3 + m) / 2)} ft standing. Every foot you jump costs a foot of movement.</div></div>`, '', 8000); return; }
  if (col === 'move' && /^climb \/ swim$/i.test(nm)) { const t = speedInfo().text, has = k => new RegExp('\\b' + k + '\\s+\\d', 'i').test(t);
    toast(`<div><b>Climb / swim</b><div class="det">Climbing: ${has('climb') ? 'you have a climbing speed — no extra cost' : 'each foot costs 2 ft of movement'}. Swimming: ${has('swim') ? 'you have a swimming speed — no extra cost' : 'each foot costs 2 ft of movement'}.</div></div>`, '', 7000); return; }
  if (col !== 'move') S.turn.used[col] = true;
  if (/^disengage$/i.test(nm)) S.turn.disengaged = true;
  if (/^hide$/i.test(nm)) { const k = S.skills.findIndex(s => s.name === 'Stealth'); update(); if (k >= 0) { doRoll('skill:' + k); return; } }
  if (/^dodge$/i.test(nm) && !S.conditions.includes('Dodging')) S.conditions.push('Dodging');
  if (/^dash$/i.test(nm)) addDash();
  update();
  toast(`<div><b>${esc(nm)}</b>${col !== 'move' ? ` — ${col === 'bonus' ? 'bonus action' : col} spent.` : ''}${b.dataset.text ? `<div class="det">${esc(b.dataset.text)}</div>` : ''}</div>`, '', 6000);
}
// Search: a Perception (spot it) or Investigation (work it out) check.
// Opportunity Attack: pick a melee weapon, spend your reaction, roll it. It happens on someone else's turn,
// so Sneak Attack is still available (it's once per turn, not once per round).
// Area spells can't be War Caster opportunity attacks (they must target only the creature that provoked).
const WC_AREA = ['Sickening Radiance', 'Fireball', 'Hunger of Hadar', 'Shatter', 'Thunderwave', 'Stinking Cloud', 'Cloudkill', 'Spirit Guardians', 'Moonbeam', 'Web', 'Entangle', 'Spike Growth', 'Erupting Earth', 'Synaptic Static', 'Cone of Cold', 'Lightning Bolt', 'Burning Hands', 'Ice Storm', 'Flame Strike', 'Sleet Storm', 'Insect Plague', 'Wall of Fire', 'Storm Sphere', 'Sunbeam', 'Create Bonfire', 'Word of Radiance', 'Thunderclap', 'Sword Burst', 'Faerie Fire', 'Hypnotic Pattern', 'Fear', 'Slow', 'Pyrotechnics', 'Earth Tremor', 'Aganazzar\'s Scorcher', 'Dust Devil', 'Cause Fear', 'Color Spray', 'Arms of Hadar', 'Destructive Wave', 'Circle of Death', 'Chain Lightning', 'Meteor Swarm'];
function openOA() {
  if ((S.turn.used || {}).reaction) { toast('Your reaction is already used.', 'fumble'); return; }
  const ws = S.attacks.map((a, i) => [a, i]).filter(([a]) => atkShown(a) && a.kind !== 'ranged');
  // War Caster: instead of a weapon, cast a spell that takes 1 action and targets only that creature.
  const wc = hasFeature('War Caster') ? spellsFor('action').filter(([sp]) => { const sm = spellMath(sp), t = (String(sp.range || '') + ' ' + String(sp.summary || '')).toLowerCase(); return (sm.attack || sm.save) && !WC_AREA.includes(sp.name) && !/cone|cube|line|sphere|radius|cylinder|self \(|each creature|creatures within|all creatures|\barea\b|cloud\b/.test(t); }) : [];
  if (!ws.length && !wc.length) { toast('No melee attacks — equip a melee weapon in Inventory.', 'fumble'); return; }
  openModal(`<h3>Opportunity Attack</h3><p class="hint" style="margin:0 0 8px">A creature you can see is leaving your reach. Uses your reaction — pick what to hit it with.${hasFeature('Sentinel') ? ' <b>Sentinel:</b> on a hit its speed becomes 0 for the rest of the turn.' : ''}</p>
    <div class="castopts">${ws.map(([a, i]) => `<button class="castopt" data-act="oago" data-i="${i}"><b>${esc(a.name)}</b><span>${fmt(atkHit(a))} to hit · ${esc(atkDmgText(a))}${a.type ? ' ' + esc(a.type) : ''}</span></button>`).join('')}</div>
    ${wc.length ? `<div class="lbl" style="margin-top:10px">War Caster — cast a spell at it instead</div><p class="hint" style="margin:0 0 4px">A spell with a casting time of 1 action that targets only that creature.</p><div class="castopts">${wc.map(([sp, i]) => { const sm = spellMath(sp), ci = spellCI(sp); return `<button class="castopt" data-act="oacast" data-i="${i}"><b>${esc(sp.name)}</b><span>${N(sp.level) ? ORD[N(sp.level) - 1] + ' level' : 'Cantrip'} · ${sm.attack ? fmt(ci.atk) + ' to hit' : 'DC ' + ci.dc + ' ' + esc(sm.save)}${sm.dice ? ' · ' + esc(sm.dice) + ' ' + esc(sm.type) : ''}</span></button>`; }).join('')}</div>` : ''}
    <div class="actions"><button class="btn" data-act="close">Cancel</button></div>`);
}
function openSearch(col) {
  const opt = n => { const k = S.skills.findIndex(s => s.name === n); return k < 0 ? '' : `<button class="castopt" data-act="searchgo" data-k="${k}" data-col="${col}"><b>${n} ${fmt(skillVal(S.skills[k]))}</b><span>${n === 'Perception' ? 'WIS — spot, hear or notice something' : 'INT — look for clues and work out what they mean'}</span></button>`; };
  openModal(`<h3>Search</h3><p class="hint" style="margin:0 0 8px">Uses your ${col === 'bonus' ? 'bonus action' : 'action'}. Which check?</p><div class="castopts">${opt('Perception')}${opt('Investigation')}</div><div class="actions"><button class="btn" data-act="close">Cancel</button></div>`);
}
function toggleCondition(c) {
  const on = S.conditions.includes(c);
  S.conditions = on ? S.conditions.filter(x => x !== c) : S.conditions.concat([c]);
  if (on && S.condTurns) delete S.condTurns[c];
  if (on && S.condNotes) delete S.condNotes[c];
  pendingLabel = (on ? 'Remove ' : 'Add ') + c;
  if (!on && ['Incapacitated', 'Paralyzed', 'Petrified', 'Stunned', 'Unconscious'].includes(c) && S.concentration) { save(); breakConc(c.toLowerCase()); return; }
  update(); render('vitals', 'combat');
}
const COND_ICON = { Blinded: '◌', Charmed: '♥', Deafened: '◎', Frightened: '!', Grappled: '✊', Incapacitated: '✕', Invisible: '◇', Paralyzed: '❚❚', Petrified: '▣', Poisoned: '☠', Prone: '↧', Restrained: '⛓', Stunned: '✶', Unconscious: 'z', Raging: '⚡', Hasted: '»', Blessed: '✦', 'Hexed / Cursed': '☾', Dodging: '↔', Concentrating: '◉' };
const STANDARD_CONDS = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'];
// Effects other creatures put on you, plus states only some classes can enter.
function effectConds() { return ['Blessed', 'Hasted', 'Hexed / Cursed', 'Dodging'].concat(clsLv('barbarian') ? ['Raging'] : []); }
const condDesc = n => (DND.conditions.find(x => x[0] === n) || [, ''])[1];
function exhText(L) {
  if (!L) return 'No exhaustion.';
  if (exModern()) return L >= 6 ? 'Death.' : `−${2 * L} to every d20 test (attacks, checks, saves) and −${5 * L} ft speed. Advantage and disadvantage still work normally.`;
  return L >= 6 ? 'Death.' : DND.exhaustion.slice(1, L + 1).join(' · ');
}
// Base ability scores and save proficiencies are changed here, not on the sheet itself, so they can't be bumped by accident.
// Temporary changes (curses, potions, spells) go in Conditions instead.
// Skill proficiency and expertise are changed here; on the sheet only the misc bonus box stays editable.
function openSkillManage() {
  openModal(`<div class="sethead"><h3>Skills</h3><button class="btn sm gold" data-act="skillok">Done</button></div><p class="hint" style="margin:0 0 10px">Tap the circle to cycle: not proficient → proficient → expertise. Misc is a permanent bonus; for something temporary use Conditions → Skill.</p>
    <div class="skman">${S.skills.map((s, i) => `<div class="skman-row"><button class="profbtn p${N(s.prof)}" data-act="skillprof" data-i="${i}" aria-label="${esc(s.name)} proficiency"></button><span>${esc(s.name)} <small class="ab3">${esc(s.ab)}</small></span><span class="skman-lv">${['—', 'Proficient', 'Expertise'][N(s.prof)]}</span><label class="skman-misc" title="Permanent bonus (an item, a feat, a DM ruling)">Misc ${inp('skills.' + i + '.misc', { num: 1, cls: 'sm', label: s.name + ' misc bonus', ph: '0' })}</label><b class="skman-v">${fmt(skillVal(s))}</b></div>`).join('')}</div>`, () => render());
}
function openAbilManage() {
  openModal(`<div class="sethead"><h3>Abilities &amp; saves</h3><button class="btn sm gold" data-act="abilok">Done</button></div><p class="hint" style="margin:0 0 10px">Your permanent scores and saving-throw proficiencies. For something temporary — a curse, a potion, a spell — use <button class="linkbtn" data-act="abopen">Conditions → Ability scores</button> instead.</p>
    <div class="abman">${AB.map(a => `<div class="abman-row"><b>${ABN[a]}</b>${inp('abilities.' + a, { num: 1, cls: 'score', label: ABN[a] + ' score' })}<span class="hint" data-calc="eff:${a}"></span><label class="checkline abman-sv">${chk('saves.' + a, ABN[a] + ' save proficiency')} <span>Proficient in saves</span></label></div>`).join('')}</div>`, () => render());
  refresh();
}
// "Ability scores" tile in Conditions: click it to open a small editor for temporary changes.
const abTempOn = () => Object.keys(S.abTemp || {}).length > 0;
function abTile() {
  const ch = AB.filter(a => N(((S.abTemp || {})[a] || {}).d)).map(a => `${a.toUpperCase()} ${fmt(N(S.abTemp[a].d))}`).join(', ');
  return `<div class="ctwrap${abTempOn() ? ' on' : ''}"><button class="ctile${abTempOn() ? ' on' : ''}" data-act="abtile" aria-expanded="${!!UI.open.abtemp}"><span class="cicon">±</span><span class="ctext"><b>Ability scores</b><small>${ch ? esc(ch) : 'Temporarily raise or lower a score'}</small></span>${abTempOn() ? '<span class="ccheck">✓</span>' : ''}</button></div>`;
}
function abEditor() {
  const r = N(S.abTempR);
  return `<div class="abed">${AB.map(a => { const d = N(((S.abTemp || {})[a] || {}).d), v = score(a); return `<div class="abed-c${d ? ' on' : ''}"><span>${a.toUpperCase()}</span><b>${v}</b><div><button data-act="abtemp" data-a="${a}" data-d="-1" aria-label="${ABN[a]} −1">−</button><button data-act="abtemp" data-a="${a}" data-d="1" aria-label="${ABN[a]} +1">+</button></div></div>`; }).join('')}</div>
    ${abTempOn() ? `<div class="cdur abed-dur"><span>Lasts</span><button data-act="abtempr" data-d="-1" aria-label="Shorter" ${r <= -2 ? 'disabled' : ''}>−</button><b class="cdur-v">${durText(r)}</b><button data-act="abtempr" data-d="1" aria-label="One round more">+</button><button class="linkbtn" data-act="abtempclear" style="margin-left:auto">Reset all</button></div>` : ''}`;
}
function openConditions() {
  const on = n => S.conditions.includes(n), ex = N(S.exhaustion);
  const chip = n => `<button class="cchip2${on(n) ? ' on' : ''}" data-act="togglecond" data-c="${esc(n)}" aria-pressed="${on(n)}" title="${esc(condDesc(n))}"><span class="ci">${COND_ICON[n] || '•'}</span>${esc(n)}</button>`;
  const condDur = n => { const cur = N((S.condTurns || {})[n]); return `<span class="mstep dur sm"><button data-act="condturn" data-c="${esc(n)}" data-d="-1" aria-label="Shorter" ${cur <= -2 ? 'disabled' : ''}>−</button><b>${durText(cur)}</b><button data-act="condturn" data-c="${esc(n)}" data-d="1" aria-label="One round more">+</button></span>`; };
  const arow = (icon, name, desc, ctl, off) => `<div class="arow"><span class="ci">${icon}</span><div class="arow-t"><b>${name}</b>${desc ? `<small>${desc}</small>` : ''}</div>${ctl || ''}${off ? `<button class="icon-btn arow-x" ${off} aria-label="Remove">✕</button>` : ''}</div>`;
  const act = [];
  S.conditions.forEach(n => act.push(arow(COND_ICON[n] || '•', esc(n), esc(condDesc(n)) + (n === 'Hexed / Cursed' ? `<input class="f cnote2" data-condnote="${esc(n)}" value="${esc((S.condNotes || {})[n] || '')}" placeholder="What is it? e.g. Hex: disadvantage on STR checks">` : ''), ['Concentrating', 'Raging'].includes(n) ? '' : condDur(n), `data-act="togglecond" data-c="${esc(n)}"`)));
  if (ex) act.push(arow('⧗', 'Exhaustion ' + ex, esc(exhText(ex)), '', 'data-act="exhset" data-v="0"'));
  Object.keys(S.tmpMods || {}).forEach(k => act.push(arow(k === 'ac' ? '⛨' : /^skill:/.test(k) ? '✦' : '♥', `${tmName(k)} ${fmt(tmv(k))}`, k === 'ac' ? `AC is ${acTotal()} now` : /^skill:/.test(k) ? (() => { const sk = S.skills.find(x => x.name === tmName(k)); return sk ? `${esc(sk.name)} is ${fmt(skillVal(sk))} now` : ''; })() : `Max HP is ${maxHp()} now`, durStep(k), `data-act="tmpmodclear" data-k="${k}"`)));
  if (abTempOn()) act.push(arow('±', 'Ability scores', esc(AB.filter(a => N(((S.abTemp || {})[a] || {}).d)).map(a => `${a.toUpperCase()} ${baseScore(a)}→${score(a)}`).join(', ')), `<span class="mstep dur sm"><button data-act="abtempr" data-d="-1" aria-label="Shorter" ${N(S.abTempR) <= -2 ? 'disabled' : ''}>−</button><b>${durText(N(S.abTempR))}</b><button data-act="abtempr" data-d="1" aria-label="Longer">+</button></span>`, 'data-act="abtempclear"'));
  const abc = AB.map(a => { const d = N(((S.abTemp || {})[a] || {}).d); return `<div class="abmini${d ? ' on' : ''}"><span>${a.toUpperCase()}</span><b>${score(a)}</b><div><button data-act="abtemp" data-a="${a}" data-d="-1" aria-label="${ABN[a]} −1">−</button><button data-act="abtemp" data-a="${a}" data-d="1" aria-label="${ABN[a]} +1">+</button></div></div>`; }).join('');
  const html = `<div id="condmodal"><div class="sethead"><h3>Conditions</h3><span class="cm-count${act.length ? ' on' : ''}">${act.length ? act.length + ' active' : 'None active'}</span><span class="grow"></span><button class="btn sm gold" data-act="close">Done</button></div>
    ${act.length ? `<div class="alist">${act.join('')}</div>` : ''}
    <div class="cm2-lbl">Conditions</div><div class="cchips2">${STANDARD_CONDS.map(chip).join('')}</div>
    <div class="cm2-lbl">Effects on you</div><div class="cchips2">${effectConds().map(chip).join('')}</div>
    <div class="cm2-lbl">Adjust</div>
    <div class="adjrow"><span class="adj-l">Exhaustion</span><div class="exhpills sm">${[0, 1, 2, 3, 4, 5, 6].map(l => `<button class="exhp${l === ex ? ' on' : ''}${l === 6 ? ' dead' : ''}" data-act="exhset" data-v="${l}" aria-label="Exhaustion ${l}">${l}</button>`).join('')}</div></div>
    <div class="adjrow"><span class="adj-l">Max HP</span>${stepper('tmpmod', 'hpmax', tmv('hpmax') ? fmt(tmv('hpmax')) : '±0', 'Max HP')}<span class="adj-v">${maxHp()}</span></div>
    <div class="adjrow"><span class="adj-l">AC</span>${stepper('tmpmod', 'ac', tmv('ac') ? fmt(tmv('ac')) : '±0', 'AC')}<span class="adj-v">${acTotal()}</span></div>
    <div class="adjrow"><span class="adj-l">Skill</span><select class="f sm skpick" id="condSkill" aria-label="Skill">${S.skills.map(sk => `<option${(UI.condSkill || S.skills[0].name) === sk.name ? ' selected' : ''}>${esc(sk.name)}</option>`).join('')}</select>${(() => { const k = 'skill:' + (UI.condSkill || (S.skills[0] || {}).name); return stepper('tmpmod', esc(k), tmv(k) ? fmt(tmv(k)) : '±0', 'Skill'); })()}</div>
    <div class="adjrow abrow"><span class="adj-l">Scores</span><div class="abminis">${abc}</div></div>
  </div>`;
  if ($('#condmodal') && $('#modal').classList.contains('open')) $('#modal-body').innerHTML = html; else openModal(html);
}
// ---------- Features in use ----------
function evalRoll(expr) { return String(expr).replace(/[a-z]+/gi, w => { const v = evalMax(w); return v == null ? w : String(v); }); }
// Features you can also fuel with a spell slot once their free use is spent (Eldritch Cannon, Steel Defender…).
function openSlotRestore(i, col) {
  const f = S.features[i], fx = fxOf(f), min = N(fx.slotRestore === true ? 1 : fx.slotRestore) || 1, p = pact();
  const opts = []; for (let k = min - 1; k < 9; k++) if (slotMax(k) > 0) opts.push({ k, label: ORD[k] + '-level slot', left: slotsLeft(k) });
  if (p && p.level >= min) opts.push({ k: 'pact', label: 'Pact slot (' + ORD[p.level - 1] + ')', left: pactLeft() });
  if (!opts.some(o => o.left > 0)) { toast(`No uses of ${esc(f.name)} left, and no spell slots to spend.`, 'fumble'); return; }
  SLOTREST = { i, col };
  openModal(`<h3>${esc(f.name)}</h3><p class="hint" style="margin:0 0 8px">Your free use is spent. Expend a spell slot of ${ORD[min - 1]} level or higher to use it again.</p>
    <div class="castopts">${opts.map(o => `<button class="castopt" data-act="slotrestgo" data-k="${o.k}" ${o.left > 0 ? '' : 'disabled'}><b>${esc(o.label)}</b><span>${o.left} left</span></button>`).join('')}</div>
    <div class="actions"><button class="btn" data-act="close">Cancel</button></div>`);
}
let SLOTREST = null;
function useFeature(i, col, opt) {
  const f = S.features[i]; if (!f) return;
  if (['action', 'bonus', 'reaction'].includes(col || f.col)) { if (incapCond()) { toast(`You're <b>${incapCond().toLowerCase()}</b> — you can't take actions or reactions.`, 'fumble'); return; } }
  if (f.name === 'Wild Shape') return openWildShape(col);
  if (atkReplaceOK(f.name, col || f.col) === false) return;
  if (f.key === 'artificer:The Right Tool for the Job') return openRTJ();
  const fx = fxOf(f);
  if (fx.target === 'forge') return openForge(i);
  if (fx.target === 'spellstore') return openSpellStore(i);
  if (fx.target === 'infusetab') { UI.tab = 'infusions'; saveUI(); render(); window.scrollTo(0, 0); return; }
  if (fx.onlyRaging && !S.conditions.includes('Raging')) { toast(`${esc(f.name)} only works while raging.`, 'fumble'); return; }
  if (fx.onlyWhen && !fxWhenOK(fx.onlyWhen)) { toast(`${esc(f.name)} only works ${esc(fxWhenText(fx.onlyWhen))}.`, 'fumble'); return; }
  const max = featMax(f);
  if (max != null && !f.pool) {
    if (N(f.used) >= max) { if (fx.slotRestore && (opt || {}).slot == null) return openSlotRestore(i, col); if ((opt || {}).slot == null) { toast(`No uses of ${esc(f.name)} left.`, 'fumble'); return; } }
    if ((opt || {}).slot != null) { const k = opt.slot; if (k === 'pact') S.pactUsed = N(S.pactUsed) + 1; else S.slotsUsed[k] = N(S.slotsUsed[k]) + 1; f.used = Math.max(0, N(f.used) - 1); }
    f.used = N(f.used) + 1;
  }
  if (fx.cost) { const err = fxSpend(fx.cost, f.cls); if (err) { if (max != null && !f.pool) f.used = Math.max(0, N(f.used) - 1); toast(esc(err), 'fumble'); return; } }
  const atkNote = atkReplaceSpend(f.name, col || f.col);
  if (!atkNote && col && col !== 'move') S.turn.used[col] = true;
  const lines = []; if (atkNote) lines.push(atkNote);
  if (fx.cost) lines.push('Spent ' + fxCostText(fx.cost));
  if (fx.dash) { addDash(); lines.push(`+${turnSpeed()} ft of movement this turn`); }
  fxApplyUse(fx.use, f.name, lines);
  { const dl = fxDCLine(fx, f); if (dl) lines.push(dl); } if (fx.text) lines.push(fxText(fx.text));
  if (f.name === 'Rage') {
    const t = (CL.barbarian.scaling || []).find(x => x[0] === 'Rage Damage'), dmg = N(String(scaleVal(t ? t[1] : {}, clsLv('barbarian'))).replace('+', '')) || 2;
    if (S.concentration) { lines.push(`${S.concentration} ended (no concentration while raging)`); S.concentration = ''; }
    S.effects = S.effects.filter(e => e.name !== 'Rage' && !e.conc).concat([{ name: 'Rage', rounds: 10, buff: { meleeDmg: dmg, note: 'Advantage on STR checks and saves; resistance to bludgeoning, piercing and slashing' } }]);
    if (!S.conditions.includes('Raging')) S.conditions.push('Raging');
    lines.push(`+${dmg} melee damage with STR weapons; advantage on STR checks and saves; resistance to physical damage`);
  }
  const compFor = Object.keys(COMP_RULES).find(n => COMP_RULES[n].feature === f.name && classCompanionOK(n));
  if (compFor) {
    // (Summon Wildfire Spirit spends its Wild Shape use through the feature's cost)
    addClassCompanion(compFor, true); lines.push(compFor + ' joins you (see Companions)');
  }
  if (f.name === 'Action Surge') { S.turn.used.action = false; S.turn.attacks = 0; lines.push('You have another action this turn'); }
  if (f.name === 'Patient Defense' && !S.conditions.includes('Dodging')) S.conditions.push('Dodging');
  let r = null, healAct = null;
  if (f.roll || fx.roll) {
    r = rollExpr(f.roll ? evalRoll(f.roll) : fxRollExpr(fx.roll), { label: f.name + ': ' + (fx.rollNote || 'roll').replace(/\s*\(.*$/, '') });
    if (fx.selfDmg) healAct = { label: r.skipped ? 'Take the damage' : `Take ${r.total} damage`, fn: () => useAmt(r, f.name + ': damage', n => { takeDamage(n); save(); render(); }) };
    else if (fx.healRoll || /regain|heal/i.test(f.desc || '')) healAct = { label: 'Heal me', fn: () => useAmt(r, f.name + ': healing', n => healSelf(n, `${f.name}: +${n} HP`)) };
  }
  const sc = []; clsRows().forEach(row => { const c = CL[row.key], s = subOf(row); (c.scaling || []).concat((s && s.scaling) || []).forEach(([n, t]) => { if (new RegExp('\\b' + n.split(' ')[0].replace(/[^a-z]/gi, '') + '\\b', 'i').test(f.name) && n !== 'Rage Damage') sc.push(n + ': ' + scaleVal(t, N(row.level))); }); });
  pendingLabel = 'Use ' + f.name; update(); render();
  const left = max != null && !f.pool ? `${Math.max(0, max - N(f.used))}/${max} left` : '';
  toast(`${r ? `<b class="total">${r.total}</b>` : ''}<div><div><b>${esc(f.name)}</b>${left ? ' · ' + left : ''}</div>${r ? `<div class="det">${esc(r.detail)}${fx.rollNote ? ' ' + esc(fx.rollNote) : ''}</div>` : ''}${sc.length ? `<div class="det">${esc(sc.join(' · '))}</div>` : ''}${lines.map(l => `<div class="det">${esc(l)}</div>`).join('')}</div>`, '', 8000, [healAct, { label: 'Undo', fn: () => undo(1) }].filter(Boolean));
}
function smite(l) {
  let L;
  if (l === 'pact') { if (!pactLeft()) return; S.pactUsed = N(S.pactUsed) + 1; L = pact().level - 1; }
  else { L = N(l); if (!slotsLeft(L)) return; S.slotsUsed[L] = N(S.slotsUsed[L]) + 1; }
  let d = Math.min(6, Math.min(5, L + 2) + (UI.smiteUndead ? 1 : 0));
  const isCrit = Date.now() < critUntil; if (isCrit) { d *= 2; critUntil = 0; }
  pendingLabel = `Divine Smite (${ORD[L]} slot)`;
  update(); roll(`Divine Smite (${ORD[L]} slot) radiant${isCrit ? ' · CRIT, dice doubled' : ''}`, d + 'd8');
}

// ---------- Casting ----------
let CASTING = null;
function castSpell(i, col, force) {
  const sp = S.spells[i]; if (!sp) return;
  col = mmCol(sp, col);
  const itm = spItem(sp); if (itm && !hbItemOn(itm) && !force) { toast(`${esc(sp.name)} needs <b>${esc(itm.name)}</b>${itm.attune && !itm.attuned ? ' (attuned)' : ''} ${itm.carried ? 'on you' : 'equipped'}.`, 'fumble', 7000, { label: 'Cast anyway', fn: () => castSpell(i, col, true) }); return; }
  if (incapCond()) { toast(`You're <b>${incapCond().toLowerCase()}</b> — you can't take actions or reactions.`, 'fumble'); return; }
  const bad = armorNonProf();
  if (bad.length && !force) { toast(`You can't cast spells while wearing armor you aren't proficient with (${esc(bad.join(', '))}).`, 'fumble', 9000, { label: 'Cast anyway', fn: () => castSpell(i, col, true) }); return; }
  const base = N(sp.level), a = AUTO(sp.name);
  if (READY_PAID && READY_PAID.i === i) { const L = READY_PAID.L; READY_PAID = null; const ex = castExtrasHTML(sp, L); if (!ex) return executeCast(i, 'none', L, col, {});
    CASTING = { i, col }; return openModal(`<h3>Release ${esc(spLabel(sp))}</h3><p class="hint" style="margin:0 0 8px">Readied — the slot was already spent.</p>${ex}<div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="castgo" data-k="none" data-l="${L}">Release</button></div>`); }
  const opts = [];
  if (sp.atWill && base > 0) { const extras0 = castExtrasHTML(sp, base); if (!extras0) return executeCast(i, 'atwill', base, col, {}); opts.push({ k: 'atwill', L: base, label: 'At will', left: 1 }); }
  if (sp.usesOnly) {
    const mx = evalMax(sp.uses && sp.uses.max) || 0, left = Math.max(0, mx - N(sp.uses && sp.uses.used));
    if (!left) { const fi = S.features.findIndex(f => fxOf(f).target === 'spellstore'); toast(`<b>${esc(sp.name)}</b>: no stored uses left. Store a spell again after a long rest.`, 'fumble', 8000, fi >= 0 ? { label: 'Store a spell', fn: () => openSpellStore(fi) } : null); return; }
    const SL = Math.max(base, N(sp.uses && sp.uses.level) || base), ex = castExtrasHTML(sp, SL); if (!ex) return executeCast(i, 'free', SL, col, {});
    CASTING = { i, col };
    return openModal(`<h3>Cast ${esc(spLabel(sp))}</h3><p class="hint" style="margin:0 0 8px">From your Spell-Storing Item · ${left} of ${mx} uses left</p>${ex}<div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="castgo" data-k="free" data-l="${SL}">Cast</button></div>`);
  }
  if (sp.uses) { const mx = evalMax(sp.uses.max) || 0, left = Math.max(0, mx - N(sp.uses.used)); if (mx) opts.push({ k: 'free', L: Math.max(base, N(sp.uses.level) || base), label: `Free use (${left}/${mx})`, left }); }
  if (base > 0) {
    for (let L = base; L <= 9; L++) if (slotMax(L - 1) > 0) opts.push({ k: 'slot', L, label: `${ORD[L - 1]} slot`, left: slotsLeft(L - 1) });
    const p = pact(); if (p && p.level >= base) opts.push({ k: 'pact', L: p.level, label: `Pact slot (${ORD[p.level - 1]})`, left: pactLeft() });
    if (sp.ritual) opts.push({ k: 'ritual', L: base, label: 'Ritual (+10 min, no slot)', left: 1 });
  }
  const extras = castExtrasHTML(sp, base);
  const usable = opts.filter(o => o.left > 0);
  if (base === 0 && !extras) return executeCast(i, 'cantrip', 0, col, {});
  if (base > 0 && usable.length === 1 && !extras && !opts.some(o => o.k === 'slot' && o.L > usable[0].L && o.left)) { const o = usable[0]; return executeCast(i, o.k, o.L, col, {}); }
  CASTING = { i, col };
  openModal(`<h3>Cast ${esc(spLabel(sp))}</h3>
    <p class="hint" style="margin:0 0 8px">${esc(sp.summary || '')}${sp.duration ? ' · ' + esc(sp.duration) : ''}</p>
    ${extras}
    ${base > 0 ? `<div class="lbl" style="margin-top:8px">Cast using</div><div class="castopts">${opts.map(o => `<button class="castopt" data-act="castgo" data-k="${o.k}" data-l="${o.L}" ${o.left > 0 ? '' : 'disabled'}><b>${esc(o.label)}</b><span>${o.k === 'slot' ? o.left + ' left' : o.k === 'pact' ? o.left + ' left' : ''}${o.L > base && o.k !== 'free' ? ' · upcast' : ''}</span></button>`).join('')}
      <button class="castopt ghost" data-act="castgo" data-k="none" data-l="${base}"><b>No slot</b><span>scroll, item or DM ruling</span></button></div>`
      : `<div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="castgo" data-k="cantrip" data-l="0">Cast</button></div>`}`);
}
function castExtrasHTML(sp, base) {
  const a = AUTO(sp.name); let h = '';
  if (a.ask) h += `<label class="checkline big"><input type="checkbox" id="castSelf" checked> ${esc(a.ask)}</label>`;
  if (a.summon) { const d = DND.summons[a.summon]; h += fld('Spirit type', `<select class="f" id="castKind">${d.kinds.map(k => `<option>${esc(k)}</option>`).join('')}</select>`); }
  const crSel = (list, id, label, keep) => fld(label, `<select class="f" id="${id}">${(keep ? list : list.slice().sort((x, y) => y.cr - x.cr || x.name.localeCompare(y.name))).map(c => `<option value="${esc(c.name)}">${esc(c.name)} (CR ${DND.crLabel(c.cr)}, AC ${c.ac}, HP ${c.hp})</option>`).join('')}</select>`);
  if (a.familiar) h += crSel(DND.creatures.filter(c => c.tags.includes('familiar') || (hasFeature('Pact of the Chain') && c.tags.includes('chain'))), 'castCr', 'Familiar form', true);
  if (a.steed) h += crSel(a.steed.map(n => DND.creatures.find(c => c.name === n)).filter(Boolean), 'castCr', 'Steed', true);
  if (a.conjure) {
    const list = DND.creatures.filter(c => (a.conjure.names ? a.conjure.names.includes(c.name) : c.tags.includes(a.conjure.tag)) && c.cr <= a.conjure.cr);
    h += list.length ? crSel(list, 'castCr', 'Creature') : '<p class="hint">No matching creatures in the list — a custom companion will be created; edit its stats.</p>';
    if (!a.conjure.names) h += `<p class="hint">Number appears by CR (and doubles or triples when upcast). Your DM may choose the creatures.</p>`;
  }
  if (a.pickWeapon) {
    const ws = spWeapons(a.pickWeapon);
    if (!ws.length) h += `<p class="hint">${a.pickWeapon === 'shillelagh' ? 'You need a club or quarterstaff in your inventory.' : a.pickWeapon === 'melee' ? 'You need a melee weapon in your inventory.' : 'You need a weapon in your inventory.'}</p>`;
    else if (ws.length > 1 || !ws[0][2]) h += fld('Weapon', `<select class="f" id="castWpn">${ws.map(([at, i, on]) => `<option value="${i}">${esc(at.name)} — ${esc(atkDmgText(at))}${on ? '' : ' (not equipped)'}</option>`).join('')}</select>`);
  }
  if (a.form) h += crSel(DND.creatures.filter(c => a.form === 'shapechange' ? c.cr <= lvl() : c.tags.includes('beast') && c.cr <= lvl()), 'castCr', 'New form (for you)');
  return h;
}
function castGo(b) {
  // When a roll comes from Roll20 (or you type it), the cast is replayed with the result — by then the cast window is
  // closed, so the choices made in it are remembered on the button.
  if (!b.__cast) {
    if (!CASTING) return;
    b.__cast = { i: CASTING.i, col: CASTING.col, x: { self: $('#castSelf') ? $('#castSelf').checked : true, kind: $('#castKind') && $('#castKind').value, cr: $('#castCr') && $('#castCr').value, wpn: $('#castWpn') ? $('#castWpn').value : '' } };
  }
  const { i, col, x } = b.__cast; CASTING = null; closeModal(true);
  executeCast(i, b.dataset.k, N(b.dataset.l), col, x);
}
// Weapons a spell can be cast on: [attack, index, equipped], equipped ones first.
function spWeapons(kind) {
  return S.attacks.map((at, i) => { const it = at.item && S.inventory.find(x => x.id === at.item); return [at, i, it]; })
    .filter(([at, i, it]) => { if (!it || !it.weapon) return false; const base = String(it.weapon.base || it.name); if (kind === 'shillelagh') return /\b(club|quarterstaff)\b/i.test(base) && !/greatclub/i.test(base); if (kind === 'melee') return it.weapon.kind !== 'ranged'; return true; })
    .map(([at, i, it]) => [at, i, !!it.equipped]).sort((x, y) => (y[2] ? 1 : 0) - (x[2] ? 1 : 0));
}
function conjureCount(cr, L, base) { const n = cr <= 0.25 ? 8 : cr <= 0.5 ? 4 : cr <= 1 ? 2 : 1; const mult = L >= 9 ? 4 : L >= 7 ? 3 : L >= 5 && base === 3 ? 2 : L >= 6 && base === 4 ? 2 : 1; return n * mult; }
function executeCast(i, how, L, col, x) {
  const sp = S.spells[i], a = spAuto(sp), base = N(sp.level);
  if (!L) L = base;
  pendingLabel = `Cast ${sp.name}` + (how === 'slot' ? ` (${ORD[L - 1]} slot)` : how === 'pact' ? ' (pact slot)' : how === 'free' ? ' (free use)' : how === 'atwill' ? ' (at will)' : how === 'ritual' ? ' (ritual)' : '');
  if (how === 'slot') S.slotsUsed[L - 1] = N(S.slotsUsed[L - 1]) + 1;
  if (how === 'pact') S.pactUsed = N(S.pactUsed) + 1;
  if (how === 'free') sp.uses.used = N(sp.uses.used) + 1;
  const tcol = col || null; if (tcol && ST('autoSpend')) S.turn.used[tcol] = true;
  const ci = spellCI(sp), lines = [], out = [];
  const self = x.self !== false;
  if (sp.conc) {
    if (S.concentration && S.concentration !== sp.name) { lines.push(`${esc(S.concentration)} ended (one concentration spell at a time)`); S.effects = S.effects.filter(e => !e.conc); }
    S.concentration = sp.name;
  }
  MAXDMG = false; EMPOWER = 0; DICE_TOUCHED = false;
  const mmr = mmApply(sp, L, lines);
  let rounds = a.rounds != null ? a.rounds : parseDur(sp.duration);
  if (mmr.extend && rounds) rounds = Math.min(rounds * 2, R1D);
  const eff = { name: sp.name, conc: !!sp.conc, rounds: rounds === 0 ? null : rounds, slot: L };
  let needEffect = rounds !== 0 || !!sp.conc;
  const sm = spellMath(sp, L);
  if (sm && sm.dice && !sm.heal && fxActive().some(e => e.buff && e.buff.maxNext && !e.ally)) { MAXDMG = true; lines.push('Maximized magic: every damage die rolls its maximum'); }
  // Spells cast on a weapon: the one picked in the cast window (or the only one you have).
  const wsList = a.pickWeapon ? spWeapons(a.pickWeapon) : [], wi = !a.pickWeapon ? null : x.wpn !== undefined && x.wpn !== '' && x.wpn != null ? N(x.wpn) : wsList.length ? wsList[0][1] : null;
  const wat = wi != null ? S.attacks[wi] : null;
  if (a.pickWeapon && !wat) lines.push('No suitable weapon found — add one in Inventory');
  if (wat && (a.buff || a.wpn)) { eff.item = wat.item; needEffect = true; }
  if (a.wpn && wat) { eff.wpn = Object.assign({}, a.wpn, { cls: sp.cls }); lines.push(`${esc(wat.name)} now attacks with ${ABN[castInfo(sp.cls).ab] || 'your spellcasting ability'}${a.wpn.die ? ', 1' + a.wpn.die + ' damage' : ''}${a.wpn.magical ? ', magical' : ''}`); }
  let doAtk = null;
  // Buffs
  if (a.buff) {
    let bf = { ...a.buff }; if (a.upBuff) Object.keys(a.upBuff).forEach(k => { if (L >= N(k)) bf = { ...bf, ...a.upBuff[k] }; });
    eff.buff = bf; if (a.ask && !self) eff.ally = true;
    if (!eff.ally) { const t = fxTip({ buff: bf }); if (t) lines.push(t + (wat ? ' — ' + esc(wat.name) + ' only' : '')); } else lines.push('On an ally — your own stats are unchanged');
    needEffect = true;
  }
  if (a.maxHp && self) {
    const v = a.maxHp.roll ? rollExpr(a.maxHp.roll, { need: true, label: sp.name + ': extra hit points' }).total : N(a.maxHp.base) + N(a.maxHp.up) * Math.max(0, L - base);
    eff.maxHp = v; S.hp.cur = N(S.hp.cur) + v; needEffect = true; lines.push(`+${v} max HP and current HP`);
  }
  if (sm.temp) { const r = rollExpr(sm.temp, { need: true, label: sp.name + ': temporary HP' }); if (r.total > N(S.hp.temp)) S.hp.temp = r.total; lines.push(`${r.total} temporary HP${r.total <= N(S.hp.temp) && S.hp.temp !== r.total ? ' (kept your higher temp HP)' : ''}`); }
  // Riders, weapon cantrips
  if (a.rider) { let d = a.rider; if (a.riderUp && L > base) { const m = a.riderUp.match(/(\d+)d(\d+)/); const m0 = d.match(/^(\d+)d(\d+)(.*)$/); if (m && m0 && m0[2] === m[2]) d = (N(m0[1]) + N(m[1]) * (L - base)) + 'd' + m0[2] + m0[3]; } S.riders = (S.riders || []).filter(r => r.name !== sp.name).concat([{ name: sp.name, dice: d }]); lines.push(`Your next weapon hit adds ${d}`); }
  if (a.weapon) {
    const t = cantripTier(), typ = a.boom ? 'thunder' : 'fire';
    if (t > 1) S.riders = (S.riders || []).filter(r => r.name !== sp.name).concat([{ name: sp.name, dice: (t - 1) + 'd8 ' + typ, once: !!wat }]);
    if (a.boom) lines.push(`If the target willingly moves before your next turn: <b>${t}d8 thunder</b>`);
    if (a.leap) { const lm = castInfo(sp.cls).mod || 0, ld = (t > 1 ? (t - 1) + 'd8' : '') + (lm ? (t > 1 ? sgn(lm) : String(lm)) : ''); if (wat && ld) { const lr = /d/.test(ld) ? rollExpr(ld, { label: sp.name + ': fire leaps (second creature)' }) : { total: lm, detail: String(lm) }; lines.push(`On a hit, fire leaps to a second creature within 5 ft: <b>${lr.total} fire</b>${/d/.test(ld) ? ' (' + esc(ld) + ')' : ''}`); } else if (ld) lines.push(`On a hit, ${ld} fire leaps to a second creature within 5 ft`); }
    if (wat) doAtk = wi; else lines.push('Make a melee weapon attack with it now');
  }
  if (a.repeat || a.repeatHeal) {
    let d = a.repeat || a.repeatHeal; const up = a.up || a.healUp;
    if (up && L > base) { const m = String(up).match(/(\d+)d(\d+)/), m0 = String(d).match(/^(\d+)d(\d+)$/); if (m && m0 && m[2] === m0[2]) d = (N(m0[1]) + N(m[1]) * (L - base)) + 'd' + m0[2]; }
    eff.repeat = { dice: d, type: a.repeatHeal ? 'healing' : sm.type || a.type || 'damage', heal: !!a.repeatHeal, save: sm.save ? `DC ${ci.dc} ${sm.save}${sm.half ? ' (half)' : ''}` : '' }; needEffect = true;
  }
  // Summons, conjurations, transformations
  if (a.summon) {
    const def = DND.summons[a.summon], kind = x.kind || def.kinds[0], c = def.make(L, kind, ci.atk);
    S.companions.push({ id: uid(), name: `${a.summon.replace('Summon ', '')} spirit (${kind})`, kind: 'summon', ac: c.ac, hp: c.hp, maxhp: c.hp, speed: c.speed, multi: c.multi, attacks: c.attacks, notes: (c.notes || '') + ` · Acts on your initiative, after you.`, effect: sp.name });
    needEffect = true; lines.push(`${a.summon.replace('Summon ', '')} spirit appears: AC ${c.ac}, HP ${c.hp}, ${c.multi} attack${c.multi === 1 ? '' : 's'} at ${fmt(ci.atk)}`);
  }
  const crOf = n => DND.creatures.find(c => c.name === n);
  const mkComp = (cr, kind, extra) => ({ id: uid(), name: cr.name, kind, ac: cr.ac, hp: cr.hp, maxhp: cr.hp, speed: cr.speed, attacks: (cr.attacks || []).map(z => z.slice()), notes: cr.notes || '', abil: cr.abil, cr: cr.cr, ...extra });
  if (a.familiar) { const cr = crOf(x.cr) || DND.creatures.find(c => c.tags.includes('familiar')); S.companions = S.companions.filter(c => c.kind !== 'familiar'); S.companions.push(mkComp(cr, 'familiar', { notes: (cr.notes || '') + ' · Celestial, fey or fiend spirit; telepathic link within 100 ft; can deliver your touch spells.' })); lines.push(`${cr.name} familiar appears`); }
  if (a.steed) { const cr = crOf(x.cr) || crOf(a.steed[0]); S.companions = S.companions.filter(c => c.kind !== 'steed'); S.companions.push(mkComp(cr, 'steed', { notes: (cr.notes || '') + ' · INT 6; telepathic bond; self-only spells can include it.' + (a.note ? ' ' + a.note : '') })); lines.push(`${cr.name} steed appears`); }
  if (a.conjure) {
    const cr = crOf(x.cr);
    const count = a.conjure.names ? (sp.name === 'Animate Dead' ? 1 + 2 * Math.max(0, L - 3) : sp.name === 'Giant Insect' ? (x.cr === 'Giant Wasp' ? 5 : x.cr === 'Constrictor Snake' ? 3 : 10) : 1) : cr ? conjureCount(cr.cr, L, base) : 1;
    const c = cr ? mkComp(cr, 'conjured', { effect: sp.name }) : { id: uid(), name: 'Conjured creature', kind: 'conjured', ac: 12, hp: 10, maxhp: 10, speed: 'walk 30', attacks: [], notes: '', effect: sp.name };
    if (count > 1) { c.count = count; c.hps = Array(count).fill(c.maxhp); c.name = cr ? cr.name + 's' : c.name; }
    S.companions.push(c); needEffect = true; lines.push(`${count} × ${cr ? cr.name : 'creature'} appear${count === 1 ? 's' : ''}`);
  }
  if (a.form && self && x.cr) { const cr = crOf(x.cr); if (cr) { setForm(cr, sp.name, sp.name, a.form !== 'shapechange'); needEffect = true; lines.push(`You become a ${cr.name}: AC ${cr.ac}, ${cr.hp} HP`); } }
  else if (a.form) lines.push('Cast on someone else — track it in Active Spells');
  if (a.spiritual) { const d = (1 + Math.floor(Math.max(0, L - 2) / 2)) + 'd8' + sgn(ci.mod || 0); S.companions.push({ id: uid(), name: 'Spiritual Weapon', kind: 'spell', ac: '', hp: 0, maxhp: 0, speed: 'fly 20 (bonus action)', attacks: [['Strike', ci.atk, d, 'force']], notes: 'Bonus action: move 20 ft and attack again.', effect: sp.name }); needEffect = true; lines.push(`Spiritual weapon attack ${fmt(ci.atk)}, ${d} force`); }
  if (a.weaponSpell) { const [nm, dice, type, mode] = a.weaponSpell; let d = dice; if (a.upWeapon) Object.keys(a.upWeapon).forEach(k => { if (L >= N(k)) d = a.upWeapon[k]; }); S.attacks = S.attacks.filter(z => z.effect !== sp.name); S.attacks.push({ name: nm, ab: mode === 'spell' ? 'spell' : 'fin', cls: sp.cls, prof: true, magic: 0, dice: d, type, notes: 'From ' + sp.name, kind: 'melee', effect: sp.name, noModDmg: mode === 'spell', weaponLike: mode !== 'spell', oneHanded: true }); needEffect = true; lines.push(`${nm} added to your attacks (${d} ${type})`); }
  if (needEffect) S.effects = (S.effects || []).filter(z => z.name !== sp.name).concat([eff]);
  if (wat && (a.wpn || a.buff) && !eff.ally) lines.push(`${esc(wat.name)} is now ${fmt(atkHit(wat))} to hit, ${esc(atkDmgText(wat))}${extraDice(wat).length && a.buff && a.buff.dmgDice ? ' + ' + esc(a.buff.dmgDice) : ''} ${esc(wat.type || '')}`);
  // Rolls
  let mainTotal = null, cls = ''; const beamRows = []; let card = null;
  const dmgMod = (sp.name === 'Eldritch Blast' && hasFeature('Agonizing Blast')) ? mod('cha') : 0;
  const hexD = fxActive().filter(e => e.name === 'Hex' && e.buff && !e.ally).map(() => '1d6');
  if (a.beams || a.darts || a.rays) {
    const n = a.beams ? cantripTier() : a.darts ? 3 + Math.max(0, L - 1) : N(a.rays) + Math.max(0, L - 2);
    let tot = 0; const parts = [];
    for (let k = 0; k < n; k++) {
      if (a.darts) { const af = k === 0 && hasFeature('Arcane Firearm'); const r = rollExpr('1d4+1' + (af ? '+1d8' : ''), { label: sp.name + ' spell damage (force)' + (af ? ' + Arcane Firearm' : '') }); tot += r.total; parts.push(r.total); continue; }
      const tag = n > 1 ? ` [${a.beams ? 'Beam' : 'Ray'} ${k + 1}]` : ''; const { expr } = d20Expr(ci.atk, 'attack'); const h = rollExpr(expr, { label: sp.name + ' spell attack' + tag }); const crit = h.d20 === 20;
      const bond = !a.beams && !a.darts && k === 0 && hasFeature('Enhanced Bond') && S.companions.some(c => c.tmpl === 'Wildfire Spirit'); const fa = k === 0 && hasFeature('Arcane Firearm'); /* Arcane Firearm: +1d8 on one ray/beam */ const dd = (a.beams ? '1d10' : '2d6') + (bond ? '+1d8' : '') + (fa ? '+1d8' : ''); /* Enhanced Bond: +1d8 on one ray */ const r = rollExpr((crit ? doubleDice(dd) : dd) + (dmgMod ? sgn(dmgMod) : '') + (hexD.length ? '+' + (crit ? '2d6' : '1d6') : ''), { label: sp.name + ' spell damage (' + (a.beams ? 'force' : 'fire') + ')' + tag, min2: !a.beams && adeptFor((a.type || 'fire')) });
      parts.push(`${a.beams ? 'Beam' : 'Ray'} ${k + 1}: hit ${h.total}${crit ? ' CRIT' : h.d20 === 1 ? ' (nat 1)' : ''} → ${r.total}`);
      beamRows.push({ hit: h.total, dmg: r.total, crit, nat1: h.d20 === 1 });
    }
    if (a.darts) { out.push(`${n} darts, 1d4+1 force each${hasFeature('Arcane Firearm') ? ' (first +1d8 Arcane Firearm)' : ''}: ${parts.join(', ')} = <b>${tot}</b> (they always hit)`); mainTotal = tot; }
    else out.push(...parts.map(esc));
  } else if (sm.dice) {
    let crit = false, hitTxt = '';
    let hitTot = null, nat1 = false;
    if (sm.attack) { const { expr } = d20Expr(ci.atk, 'attack'); const h = rollExpr(expr, { label: sp.name + ' spell attack' }); crit = h.d20 >= (N(a.crit) || 20); nat1 = h.d20 === 1; hitTot = h.total; hitTxt = `Spell attack <b>${h.total}</b> (${esc(h.detail)})${crit ? ' — CRITICAL, dice doubled' : h.d20 === 1 ? ' — natural 1, miss' : ''}`; cls = crit ? 'crit' : h.d20 === 1 ? 'fumble' : ''; }
    const mask = (sm.termTypes || []).map(t => !!adeptFor(t)), ea = mask.some(Boolean) ? adeptFor((sm.termTypes || []).find(t => adeptFor(t)) || sm.type) : '', r = rollExpr(crit ? critDice(sm.dice) : sm.dice, { min2: ea || false, min2Terms: mask, label: sp.name + ' spell damage' + (sm.type ? ' (' + sm.type + ')' : '') });
    mainTotal = r.total; if (ea) lines.push(`Elemental Adept (${ea}): 1s count as 2s; ignores ${ea} resistance`);
    if (hitTxt) out.push(hitTxt);
    if (sm.save) out.push(`DC <b>${ci.dc}</b> ${sm.save} save${sm.half ? ' (half on success)' : ''}`);
    out.push(`${esc(sm.dice)} ${esc(sm.type)}: ${esc(r.detail)}`);
    if (a.missHalf && sm.attack) out.push(`On a miss: <b>${Math.floor(r.total / 2)}</b> (half damage)`);
    card = hitTot != null ? { hit: hitTot, dmg: r.total, type: sm.type, crit, nat1 } : { dmg: r.total, type: sm.type, save: sm.save, half: sm.half };
  } else if (sm.save) out.push(`DC <b>${ci.dc}</b> ${sm.save} save`);
  let healAct = null;
  if (sm.heal) {
    if (sm.heal === 'all') out.push('Restores all hit points');
    else {
      const supreme = hasSub('cleric', 'life') && clsLv('cleric') >= 17;
      const hx = supreme ? sm.heal.replace(/(\d*)d(\d+)/g, (m0, n, s2) => String((N(n) || 1) * N(s2))) : sm.heal;
      const r = rollExpr(hx, { label: sp.name + ' healing' }); mainTotal = r.total;
      out.push(`Heals <b>${r.total}</b>${a.each ? ' each' : ''} (${esc(hx)}: ${esc(r.detail)})`);
      healAct = { label: 'Heal me', fn: () => useAmt(r, sp.name + ': healing you got', n => healSelf(n, `${sp.name}: +${n} HP`)) };
    }
  }
  if (sm.note) lines.push(sm.note);
  if (rounds && needEffect) lines.push('Lasts ' + fmtRounds(rounds));
  // Homebrew backlash: casting it again before a short rest hurts you
  let backAct = null;
  if (how !== 'ritual') sp.casts = N(sp.casts) + 1;
  if (a.backlash && N(sp.casts) > 1) {
    const bt = String(a.backlashType || '').toLowerCase(), r = rollExpr(fxRollExpr(String(a.backlash).replace(/\bslot\b/gi, String(L))), { need: true, label: sp.name + ': backlash damage' });
    const res = bt && fxList('resist').some(x => String(x).toLowerCase().includes(bt)), dmg = res ? Math.floor(r.total / 2) : r.total;
    lines.push(`Backlash (cast again before a short rest): ${r.total}${bt ? ' ' + esc(bt) : ''} damage to you${res ? ` — resistant, you take ${dmg}` : ''} (${esc(r.detail)})`);
    backAct = { label: `Take ${dmg} damage`, fn: () => { takeDamage(dmg); save(); render(); } };
  }
  [].concat(beamRows.filter(r => r.nat1), card && card.nat1 ? [card] : []).forEach(() => { const r = nat1Roll(); if (r) out.unshift(`<span class="rc-n1"><b>Nat 1 Roll:</b> ${r.total}</span>`); });
  if (MAXDMG && DICE_TOUCHED) S.effects = S.effects.filter(e => !(e.buff && e.buff.maxNext));
  MAXDMG = false; EMPOWER = 0;
  const surgeShow = wildAfterCast(sp);
  save(); render();
  if (surgeShow) setTimeout(surgeShow, 350);
  const acts = [healAct, backAct, { label: 'Undo', fn: () => undo(1) }].filter(Boolean);
  // Rolls go on the big card like weapon attacks: to hit and damage (one row per beam/ray); the details go to the roll log.
  const how2 = how === 'slot' ? `${ORD[L - 1]}-level slot` : how === 'pact' ? 'pact slot' : how === 'free' ? 'free use' : how === 'atwill' ? 'at will' : how === 'ritual' ? 'ritual' : '';
  const dets = out.map(o => `<div class="det">${o}</div>`).join('') + lines.map(l => `<div class="det">${l}</div>`).join('');
  const typ = esc(String((sm && sm.type) || (a.beams ? 'force' : 'damage')).toLowerCase());
  if (beamRows.length) {
    toast(`<div class="rc-multi"><div class="rc-name">${esc(spLabel(sp))}${how2 ? ` <span class="rc-lbl">${how2}</span>` : ''}</div>${beamRows.map((r, k) => `<div class="rc-row${r.crit ? ' crit' : r.nat1 ? ' fumble' : ''}"><span class="rc-lbl">${a.beams ? 'Beam' : 'Ray'} ${k + 1}</span><b class="rc-hit">${r.hit}</b><span class="rc-lbl">${r.crit ? 'CRIT' : r.nat1 ? 'miss' : 'to hit'}</span><b class="rc-d${r.nat1 ? ' void' : ''}">${r.dmg}</b><span class="rc-lbl">${typ}</span></div>`).join('')}${dets}</div>`, beamRows.some(r => r.crit) ? 'crit' : '', 12000, acts);
    return;
  }
  if (card) {
    toast(card.hit != null
      ? `<b class="total">${card.hit}</b><div class="rc-body"><div class="rc-name">${esc(spLabel(sp))}</div><div class="rc-lbl">${card.crit ? 'CRITICAL HIT' : card.nat1 ? 'Natural 1 — miss' : 'spell attack'}${how2 ? ' · ' + how2 : ''}</div>${dets}</div><div class="rc-dmg${card.nat1 ? ' void' : ''}"><b>${card.dmg}</b><span>${esc(String(card.type || 'damage').toLowerCase())}</span></div>`
      : `<b class="total">${card.dmg}</b><div class="rc-body"><div class="rc-name">${esc(spLabel(sp))}</div><div class="rc-lbl">${esc(String(card.type || 'damage').toLowerCase())}${card.save ? ` · DC ${ci.dc} ${esc(card.save)} save${card.half ? ', half on success' : ''}` : ''}${how2 ? ' · ' + how2 : ''}</div>${dets}</div>`, cls, 12000, acts);
    return;
  }
  if (doAtk != null) { attackRoll(doAtk, true, { label: sp.name + ' · ' + S.attacks[doAtk].name, notes: lines }); return; }
  if (mainTotal != null) { toast(`<b class="total">${mainTotal}</b><div class="rc-body"><div class="rc-name">${esc(spLabel(sp))}</div><div class="rc-lbl">${sm.heal ? 'healing' : 'total'}${how2 ? ' · ' + how2 : ''}</div>${dets}</div>`, cls, 12000, acts); return; }
  toast(`${mainTotal != null ? `<b class="total">${mainTotal}</b>` : ''}<div><div>Cast <b>${esc(spLabel(sp))}</b>${how === 'slot' ? ` · ${ORD[L - 1]}-level slot` : how === 'pact' ? ' · pact slot' : how === 'free' ? ' · free use' : how === 'ritual' ? ' · ritual' : ''}${sp.conc ? ' · concentrating' : ''}</div>${out.map(o => `<div class="det">${o}</div>`).join('')}${lines.map(l => `<div class="det">${l}</div>`).join('')}</div>`, cls, 12000, acts);
}

// ---------- Forms ----------
function setForm(cr, source, effect, allStats) {
  S.form = { name: cr.name, source, ac: cr.ac, hp: cr.hp, maxhp: cr.hp, speed: cr.speed, abil: cr.abil.slice(), attacks: (cr.attacks || []).map(z => z.slice()), notes: cr.notes || '', effect, allStats: !!allStats };
}
function endForm(overflow, why, silent) {
  const f = S.form; if (!f) return;
  S.form = null;
  if (f.effect) { S.effects = S.effects.filter(e => e.name !== f.effect); if (S.concentration === f.effect) S.concentration = ''; }
  pendingLabel = 'Revert from ' + f.name; cleanupLinked(); save(); render();
  if (!silent) toast(`You revert from ${esc(f.name)}${why ? ' (' + esc(why) + ')' : ''}.`, '', 6000, { label: 'Undo', fn: () => undo(1) });
}
function wildShapeLimits() {
  const d = clsLv('druid'), moon = hasSub('druid', 'moon');
  let cr = d >= 8 ? 1 : d >= 4 ? 0.5 : 0.25; if (moon) cr = Math.max(1, Math.floor(d / 3));
  return { cr, fly: d >= 8, swim: d >= 4, elemental: moon && d >= 10 };
}
let FORMCTX = null;
function openWildShape(col) {
  const fi = S.features.findIndex(f => f.name === 'Wild Shape'); if (fi < 0) return;
  const f = S.features[fi], max = featMax(f) || 0, left = max - N(f.used), lim = wildShapeLimits();
  const list = DND.creatures.filter(c => (c.tags.includes('beast') && c.cr <= lim.cr && (lim.fly || !c.tags.includes('fly')) && (lim.swim || !c.tags.includes('swim'))) || (lim.elemental && c.tags.includes('elemental') && /^(Air|Earth|Fire|Water) Elemental$/.test(c.name)));
  FORMCTX = { kind: 'wild', fi, col: col || (hasSub('druid', 'moon') ? 'bonus' : 'action') };
  openModal(`<h3>Wild Shape</h3><p class="hint" style="margin:0 0 8px">${left}/${max} uses left · beasts up to CR ${DND.crLabel(lim.cr)}${lim.fly ? '' : ', no flying'}${lim.swim ? '' : ', no swimming'}${lim.elemental ? ' · elementals cost 2 uses' : ''}. Lasts ${Math.max(1, Math.floor(clsLv('druid') / 2))} hours.</p>
    <input class="f" id="crq" placeholder="Search beasts…" aria-label="Search">
    ${hasSub('druid', 'wildfire') ? `<div class="row" style="margin:0 0 8px"><button class="btn gold" data-act="wsspirit">Summon Wildfire Spirit instead</button><span class="hint">Uses one Wild Shape</span></div>` : ''}
    <div class="crlist">${list.sort((x, y) => y.cr - x.cr || x.name.localeCompare(y.name)).map(c => crRow(c, 'pickform')).join('')}</div>
    <div class="actions"><button class="btn" data-act="close">Cancel</button></div>`, null, true);
}
function openTransform() {
  FORMCTX = { kind: 'any' };
  openModal(`<h3>Transform</h3><p class="hint" style="margin:0 0 8px">For polymorph, shapechange, potions and other transformations not cast from your spell list. Your HP is kept separately; damage overflows when the form drops to 0.</p>
    <input class="f" id="crq" placeholder="Search creatures…" aria-label="Search">
    <div class="crlist">${DND.creatures.slice().sort((x, y) => x.name.localeCompare(y.name)).map(c => crRow(c, 'pickform')).join('')}</div>
    <div class="actions"><button class="btn" data-act="close">Cancel</button></div>`, null, true);
}
const crRow = (c, act) => `<div class="crrow" data-q="${esc((c.name + ' ' + c.tags.join(' ')).toLowerCase())}"><div><b>${esc(c.name)}</b> <span class="hint">CR ${DND.crLabel(c.cr)} · ${esc(c.size)} · AC ${c.ac} · HP ${c.hp} · ${esc(c.speed)}</span><div class="hint">${esc((c.attacks || []).map(z => `${z[0]} ${z[1] === '' ? '' : fmt(N(z[1]))} ${z[2]} ${z[3]}`).join('; '))}${c.notes ? ' · ' + esc(c.notes) : ''}</div></div><button class="btn sm gold" data-act="${act}" data-n="${DND.creatures.indexOf(c)}">Choose</button></div>`;
function pickForm(b) {
  const cr = DND.creatures[N(b.dataset.n)]; if (!cr || !FORMCTX) return;
  if (FORMCTX.kind === 'wild') {
    const f = S.features[FORMCTX.fi], cost = cr.tags.includes('elemental') ? 2 : 1, max = featMax(f) || 0;
    if (N(f.used) + cost > max) { toast('Not enough Wild Shape uses left.', 'fumble'); return; }
    f.used = N(f.used) + cost; S.turn.used[FORMCTX.col] = true;
    S.effects = S.effects.filter(e => e.name !== 'Wild Shape').concat([{ name: 'Wild Shape', rounds: Math.max(1, Math.floor(clsLv('druid') / 2)) * 600 }]);
    setForm(cr, 'Wild Shape', 'Wild Shape', false);
    pendingLabel = 'Wild Shape: ' + cr.name;
  } else { setForm(cr, 'Transformed', null, true); pendingLabel = 'Transform: ' + cr.name; }
  FORMCTX = null; closeModal(true); save(); render();
  toast(`You become a <b>${esc(cr.name)}</b> — AC ${cr.ac}, ${cr.hp} HP. Your own HP is kept for when you revert.`, '', 8000, { label: 'Undo', fn: () => undo(1) });
}
// ---------- Companions ----------
function openCreaturePicker() {
  openModal(`<h3>Add a creature</h3><p class="hint" style="margin:0 0 8px">Beasts, familiars, mounts, elementals and undead. Edit any numbers after adding.</p>
    <input class="f" id="crq" placeholder="Search…" aria-label="Search">
    <div class="crlist">${DND.creatures.slice().sort((x, y) => x.name.localeCompare(y.name)).map(c => crRow(c, 'addcr')).join('')}</div>
    <div class="actions"><button class="btn" data-act="close">Done</button></div>`, null, true);
}
function addCreature(n) {
  const c = DND.creatures[n]; if (!c) return;
  S.companions.push({ id: uid(), name: c.name, kind: c.tags.includes('beast') ? 'beast' : c.tags[0], ac: c.ac, hp: c.hp, maxhp: c.hp, speed: c.speed, attacks: c.attacks.map(z => z.slice()), notes: c.notes, abil: c.abil, cr: c.cr });
  pendingLabel = 'Add ' + c.name; save(); render(); toast(`${esc(c.name)} added to Companions.`);
}
function openClassCompanions() {
  const list = Object.keys(COMP_RULES).filter(classCompanionOK);
  if (!list.length) { toast('None of your classes has a companion feature.'); return; }
  openModal(`<h3>Class companion</h3><p class="hint" style="margin:0 0 8px">Only companions your class and subclass grant are listed. Their stats update automatically when you level up or your scores change.</p>
    <div class="crlist">${list.map(n => { const c = compStats(n), r = COMP_RULES[n]; return `<div class="crrow"><div><b>${esc(n)}</b> <span class="hint">AC ${c.ac} · HP ${c.hp} · ${esc(c.speed)}${r.feature ? ' · uses ' + esc(r.feature) : ''}</span><div class="hint">${esc(c.attacks.map(z => `${z[0]} ${z[1] === '' ? '' : fmt(N(z[1]))} ${z[2]}`).join('; '))} · ${esc(c.notes)}</div></div><button class="btn sm gold" data-act="addcc" data-n="${esc(n)}">Add</button></div>`; }).join('')}</div>
    <div class="actions"><button class="btn" data-act="close">Done</button></div>`, null, true);
}
function addClassCompanion(n, viaFeature) {
  if (!classCompanionOK(n)) { toast('Your class doesn\'t grant that companion.', 'fumble'); return; }
  const r = COMP_RULES[n];
  S.companions = S.companions.filter(x => x.tmpl !== n && !(r.group && COMP_RULES[x.tmpl] && COMP_RULES[x.tmpl].group === r.group));
  if (S.compOff) delete S.compOff[n];
  const extra = {};
  if (r.rounds) { const en = n + ' (summoned)'; S.effects = (S.effects || []).filter(e => e.name !== en).concat([{ name: en, rounds: r.rounds }]); extra.effect = en; }
  S.companions.push(makeClassComp(n, extra));
  pendingLabel = 'Add ' + n; if (!viaFeature) closeModal(true); save(); render(); if (!viaFeature) toast(`${esc(n)} added.`);
}
function compHp(i, d) {
  const c = S.companions[i], el = $('#chp' + i), amt = Math.abs(N(el && el.value));
  if (!amt) { if (el) el.focus(); toast('Type an amount first.'); return; }
  if (d === 0) { c.temp = Math.max(N(c.temp), amt); pendingLabel = `${c.name} gains ${amt} temp HP`; if (el) el.value = ''; save(); render(); refresh(); return; }
  if (d < 0 && N(c.temp)) { const t = Math.min(N(c.temp), amt); c.temp = N(c.temp) - t; c.hp = Math.max(0, N(c.hp) - (amt - t)); } else c.hp = Math.max(0, Math.min(N(c.maxhp), N(c.hp) + d * amt));
  pendingLabel = `${c.name} ${d < 0 ? 'takes ' + amt + ' damage' : 'heals ' + amt}`; if (el) el.value = '';
  save(); render(); refresh();
  if (c.hp === 0) toast(`${esc(c.name)} drops to 0 HP.`, 'fumble', 7000, [{ label: 'Dismiss it', fn: () => { const k = S.companions.indexOf(c); if (k >= 0) { S.companions.splice(k, 1); pendingLabel = 'Dismiss ' + c.name; save(); render(); } } }]);
}

// ---------- Inventory actions ----------
function profWeapon(w) {
  const P = S.profs || {}, wn = n => String(n || '').toLowerCase().replace(/^(\w+),\s*(\w+)$/, '$2 $1').replace(/s$/, '').trim();
  const names = [w[0], w.name, w.base].filter(Boolean).map(wn);
  return (P.weapons || []).includes(w[1] || w.cat) || (P.weaponNames || []).some(n => names.includes(wn(n)));
}
function attackFromItem(it) {
  const w = it.weapon, props = w.props || [], ranged = w.kind === 'ranged';
  const monkOK = clsLv('monk') && ((w.cat === 'simple' && !ranged && !props.includes('heavy') && !props.includes('two-handed')) || /shortsword/i.test(it.name));
  const ab = monkOK ? 'monk' : props.includes('finesse') ? 'fin' : ranged ? 'dex' : 'str';
  const vers = props.find(p => /versatile/.test(p));
  return { name: it.name, ab, prof: profWeapon([w.base || it.name, w.cat]), magic: N((it.mods || {}).atk), dice: w.dice, type: w.type, notes: props.filter(p => !/versatile/.test(p)).concat(vers ? [vers.replace('versatile ', 'two hands ')] : []).join(', ') + (w.range ? ` · ${w.range} ft` : ''), kind: ranged ? 'ranged' : 'melee', oneHanded: !props.includes('two-handed') && !ranged, monk: monkOK, item: it.id };
}
function makeWeaponItem(w) { const [name, cat, kind, cost, dice, type, weight, props, range] = w; return { id: uid(), name, qty: 1, weight, cost, equipped: false, notes: '', weapon: { cat, kind, dice, type, props: props || [], range: range || '', base: name } }; }
function makeArmorItem(a) { const [name, type, cost, base, dexCap, strReq, stealthDis, weight] = a; return { id: uid(), name, qty: 1, weight, cost, equipped: false, notes: '', armor: { type, base, dexCap, strReq, stealthDis } }; }
function makeGearItem(g) { const [name, cat, cost, weight, notes] = g; const it = { id: uid(), name, qty: 1, weight, cost, equipped: false, notes: '', summary: notes || '' }; const m = String(notes || '').match(/(\d+d\d+)\s*\+?\s*(\d+)?\s*HP/i); return it; }
function makeMagicItem(m, baseItem) {
  const [name, src, type, rarity, attune, summary, mods] = m; const md = mods || {};
  let it = baseItem ? Object.assign(baseItem, { name: baseItem.name + ' ' + name.replace(/^(Weapon|Armor|Shield|Ammunition)\s*/, '').trim() }) : { id: uid(), name, qty: 1, weight: 0, cost: '', equipped: false, notes: '' };
  if (/^(Weapon|Armor|Shield|Ammunition) \+\d$/.test(name) && baseItem) it.name = baseItem.name.replace(/ \+\d$/, '') + ' ' + name.match(/\+\d/)[0];
  it.magic = { rarity, type, src, name }; it.summary = summary; it.attune = !!attune; it.attuneBy = typeof attune === 'string' ? attune : ''; it.attuned = false;
  it.mods = Object.assign({}, it.mods || {}, md); delete it.mods.base; delete it.mods.charges; delete it.mods.heal;
  if (md.charges) it.charges = { max: md.charges, used: 0 };
  if (md.heal) it.heal = md.heal;
  if (type === 'potion' || type === 'scroll') it.consumable = true;
  return it;
}
const AMMO_RE = /arrow|bolt|bullet|needle|ammunition|rounds?\b|shot/i;
function addInventoryItem(it, silent) {
  S.inventory.push(it);
  if (it.weapon) { const at = attackFromItem(it); if ((it.weapon.props || []).includes('ammunition')) { const am = S.inventory.find(x => x !== it && !x.weapon && AMMO_RE.test(x.name)); if (am) at.ammo = am.id; } S.attacks.push(at); }
  else if (AMMO_RE.test(it.name)) S.attacks.forEach(a => { const w = S.inventory.find(x => x.id === a.item); if (w && w.weapon && (w.weapon.props || []).includes('ammunition') && !a.ammo) a.ammo = it.id; });
  if (!silent) { pendingLabel = 'Add ' + it.name; save(); render(); toast(`${esc(it.name)} added to your pack.`, '', 5000, { label: 'Undo', fn: () => undo(1) }); }
}
let CATBASE = null;
function openCatalog(keep) {
  // Opens on All every time; picking a tab only lasts while the window is open.
  if (!keep) UI.catTab = 'all';
  const tab = UI.catTab || 'all', q = keep && $('#catq') ? $('#catq').value : '';
  const cost = c => c ? `<span class="hint">${esc(c)}</span>` : '';
  const kind = t => tab === 'all' ? ` <span class="tag catkind">${t}</span>` : '';
  const W = () => DND.weapons.map((w, n) => [w[0], `<div class="crrow" data-q="${esc((w[0] + ' ' + w[1] + ' ' + w[2] + ' ' + w[5] + ' weapon').toLowerCase())}"><div><b>${esc(w[0])}</b>${kind('Weapon')} ${cost(w[3])}<div class="hint">${esc(w[1])} ${esc(w[2])} · ${esc(w[4])} ${esc(w[5])}${w[7] && w[7].length ? ' · ' + esc(w[7].join(', ')) : ''}${w[8] ? ' · ' + esc(w[8]) + ' ft' : ''}${profWeapon(w) ? '' : ' · <b>not proficient</b>'}</div></div><button class="btn sm gold" data-act="catadd" data-t="w" data-n="${n}">Add</button></div>`]);
  const A = () => DND.armor.map((a, n) => [a[0], `<div class="crrow" data-q="${esc((a[0] + ' ' + a[1] + ' armor').toLowerCase())}"><div><b>${esc(a[0])}</b>${kind(a[1] === 'shield' ? 'Shield' : 'Armor')} ${cost(a[2])}<div class="hint">${esc(a[1])} · AC ${a[1] === 'shield' ? '+2' : a[3] + (a[4] === 0 ? '' : a[4] ? ' + DEX (max ' + a[4] + ')' : ' + DEX')}${a[5] ? ' · STR ' + a[5] : ''}${a[6] ? ' · stealth disadvantage' : ''}</div></div><button class="btn sm gold" data-act="catadd" data-t="a" data-n="${n}">Add</button></div>`]);
  const G = () => DND.gear.map((g, n) => [g[0], `<div class="crrow" data-q="${esc((g[0] + ' ' + g[1] + ' gear').toLowerCase())}"><div><b>${esc(g[0])}</b>${kind('Gear')} ${cost(g[2])}<div class="hint">${esc(g[1])}${g[4] ? ' · ' + esc(g[4]) : ''}</div></div><button class="btn sm gold" data-act="catadd" data-t="g" data-n="${n}">Add</button></div>`]);
  const M = () => DND.magic.map((m, n) => [m[0], `<div class="crrow" data-q="${esc((m[0] + ' ' + m[2] + ' ' + m[3] + ' ' + m[1] + ' magic').toLowerCase())}"><div><b>${esc(m[0])}</b>${kind('Magic')} <span class="tag rar r-${esc(String(m[3]).replace(/\s+/g, ''))}">${esc(m[3])}</span>${m[4] ? ' <span class="tag">attune</span>' : ''} <span class="hint">${esc(m[1])}</span><div class="hint">${esc(m[5])}</div></div><button class="btn sm gold" data-act="catadd" data-t="m" data-n="${n}">Add</button></div>`]);
  const list = tab === 'weapons' ? W() : tab === 'armor' ? A() : tab === 'gear' ? G() : tab === 'magic' ? M()
    : W().concat(A(), G(), M()).sort((x, y) => String(x[0]).localeCompare(String(y[0]), undefined, { sensitivity: 'base' }));
  const rows = list.map(x => x[1]).join('');
  const html = `<h3>Add an item</h3>
    <div class="segmini" style="margin-bottom:8px">${[['all', 'All'], ['weapons', 'Weapons'], ['armor', 'Armor'], ['gear', 'Gear & tools'], ['magic', 'Magic items']].map(([k, t]) => `<button class="${tab === k ? 'on' : ''}" data-act="cattab" data-t="${k}">${t}</button>`).join('')}</div>
    <input class="f" id="catq" placeholder="Search…" value="${esc(q)}" aria-label="Search items" autofocus>
    <div class="crlist">${rows}</div>
    <div class="actions"><button class="btn" data-act="close">Done</button></div>`;
  if (keep && $('#modal').classList.contains('open')) $('#modal-body').innerHTML = html; else openModal(html, null, true);
  filterCatalog();
}
function filterCatalog() {
  const q = ($('#catq') && $('#catq').value || $('#crq') && $('#crq').value || '').trim().toLowerCase();
  $$('#modal-body .crrow').forEach(r => r.style.display = !q || (r.dataset.q || '').includes(q) ? '' : 'none');
}
function catalogAdd(t, n) {
  if (t === 'w') return addInventoryItem(makeWeaponItem(DND.weapons[n]));
  if (t === 'a') return addInventoryItem(makeArmorItem(DND.armor[n]));
  if (t === 'g') return addInventoryItem(makeGearItem(DND.gear[n]));
  if (t === 'm') {
    const m = DND.magic[n], base = (m[6] || {}).base, rt = (m[6] || {}).resType;
    if (base === 'weapon' || base === 'armor' || base === 'shield' || rt) {
      CATBASE = n;
      const list = !base ? [] : base === 'weapon' ? DND.weapons.map((w, k) => [k, w[0]]) : DND.armor.map((a, k) => [k, a[0], a[1]]).filter(x => base === 'shield' ? x[2] === 'shield' : x[2] !== 'shield');
      // Ring / Armor of Resistance: which damage type it resists is part of which ring it is (like picking the weapon for a +1 weapon).
      const types = rt ? fld('Resistance to', `<div class="restypes">${RES_TYPES.map((t, k) => `<label class="restype"><input type="radio" name="catres" value="${t}"${k ? '' : ' checked'}><span>${t[0].toUpperCase() + t.slice(1)}</span></label>`).join('')}</div>`) : '';
      $('#modal-body').innerHTML = `<h3>${esc(m[0])}</h3><p class="hint">${esc(m[5])}</p>${base ? fld('Which ' + base + '?', `<select class="f" id="catbase">${list.map(x => `<option value="${x[0]}">${esc(x[1])}</option>`).join('')}</select>`) : ''}${types}
        <div class="actions"><button class="btn" data-act="cattab" data-t="${esc(UI.catTab || 'all')}">Back</button><button class="btn gold" data-act="catbaseok" data-n="${n}">Add</button></div>`;
      return;
    }
    return addInventoryItem(makeMagicItem(m));
  }
}
function catalogAddBase(n) {
  const m = DND.magic[n], base = m[6].base, k = base ? N($('#catbase').value) : 0;
  const bi = !base ? null : base === 'weapon' ? makeWeaponItem(DND.weapons[k]) : makeArmorItem(DND.armor[k]);
  const it = makeMagicItem(m, bi);
  if (m[6].resType) { const r = $('input[name="catres"]:checked'), t = r ? r.value : RES_TYPES[0]; setResType(it, t); }
  addInventoryItem(it); openCatalog(true);
}
// "Ring of Resistance (Fire)": the type is in its name and gives the resistance while worn and attuned.
function setResType(it, t) { it.resPick = t; it.name = String(it.name || '').replace(/\s*\((acid|cold|fire|force|lightning|necrotic|poison|psychic|radiant|thunder)\)\s*$/i, '') + ' (' + t[0].toUpperCase() + t.slice(1) + ')'; }
function equipItem(i) {
  const it = S.inventory[i]; it.equipped = !it.equipped;
  const msgs = [];
  if (it.equipped && it.armor) S.inventory.forEach(o => { if (o !== it && o.equipped && o.armor && (o.armor.type === 'shield') === (it.armor.type === 'shield')) { o.equipped = false; msgs.push(o.name + ' stowed'); } });
  if (it.equipped && it.armor && it.armor.type !== 'shield' && !(S.profs.armor || []).includes(it.armor.type)) msgs.push('not proficient: disadvantage on STR/DEX rolls, no spellcasting');
  if (it.equipped && it.attune && !it.attuned) msgs.push('needs attunement to work');
  if ((it.spells || []).length || it.hb) { rebuildAuto(); if (hbItemOn(it) && (it.spells || []).length) msgs.push('can cast ' + it.spells.join(', ')); }
  save(); render();
  toast(`${esc(it.name)} ${it.equipped ? 'equipped' : 'moved to pack'}.${msgs.length ? `<div class="det">${esc(msgs.join(' · '))}</div>` : ''}${it.armor && it.equipped ? `<div class="det">AC now ${acTotal()}</div>` : ''}`, '', 5000, { label: 'Undo', fn: () => undo(1) });
}
function attune(i) {
  const it = S.inventory[i];
  if (!it.attuned && attunedCount() >= attuneMax()) { toast(`You can attune to ${attuneMax()} items at once. End another attunement first.`, 'fumble', 6000); return; }
  it.attuned = !it.attuned; pendingLabel = (it.attuned ? 'Attune to ' : 'End attunement: ') + it.name;
  if ((it.spells || []).length || it.hb) rebuildAuto();
  const sp = hbItemOn(it) && (it.spells || []).length ? `<div class="det">You can cast ${esc(it.spells.join(', '))} (Spells tab).</div>` : it.attuned && !hbItemOn(it) ? '<div class="det">Equip it to use it.</div>' : '';
  save(); render(); toast(`${esc(it.name)}: ${it.attuned ? 'attuned' : 'attunement ended'}.${sp}`);
}
function drink(i) {
  const it = S.inventory[i]; const r = rollExpr(it.heal, { need: true, label: it.name + ': healing' });
  it.qty = Math.max(0, N(it.qty) - 1);
  if (!it.qty) S.inventory.splice(i, 1);
  healSelf(r.total, `Drink ${it.name}: +${r.total} HP`); render();
  toast(`<b class="total">${r.total}</b><div><div>${esc(it.name)} — HP restored</div><div class="det">${esc(r.detail)}</div></div>`, 'crit', 6000, { label: 'Undo', fn: () => undo(1) });
}

// ---------- Lists ----------
const BLANK = {
  attacks: () => ({ name: 'New attack', ab: 'str', prof: true, magic: 0, dice: '1d6', type: '', notes: '', kind: 'melee' }),
  spells: () => ({ name: 'New spell', level: 1, cls: (clsRows()[0] || {}).key || 'other', prepared: true, always: false, time: '1 action', range: '', comps: '', duration: 'Instantaneous', conc: false, ritual: false, school: '', summary: '', note: '' }),
  features: () => ({ name: 'New feature', source: 'Custom', desc: '', max: '', used: 0, reset: 'long', pool: false }),
  inventory: () => ({ id: uid(), name: 'New item', qty: 1, weight: 0, equipped: false, notes: '' }),
  notes: () => ({ date: new Date().toISOString().slice(0, 10), title: '', text: '' }),
  combat: () => ({ name: 'New option', text: '' }),
  quotes: () => ({ text: '' }),
  rumors: () => ({ kind: 'Unknown', title: '', text: '', truth: '' }),
  people: () => ({ name: '', rel: '', att: '', notes: '' }),
  goals: () => ({ text: '', done: false }),
  companions: () => ({ id: uid(), name: 'Companion', kind: 'custom', ac: 12, hp: 10, maxhp: 10, speed: 'walk 30', attacks: [['Attack', 3, '1d6+1', 'piercing']], notes: '' })
};
function addItem(list) {
  const L = getP(list), mk = BLANK[list] || BLANK[list.split('.')[0]];
  const item = mk();
  if (list === 'notes') L.unshift(item); else L.push(item);
  if (list === 'spells') { S.spellFilter = 'all'; UI.open['spell:' + (L.length - 1)] = true; }
  if (list === 'inventory') UI.open['item:' + item.id] = true;
  if (list === 'features') { UI.open['fedit:' + (L.length - 1)] = true; UI.featFilter = 'all'; }
  save(); render();
  const idx = list === 'notes' ? 0 : L.length - 1;
  const el = $(`[data-k^="${list}.${idx}."]:not([type=checkbox]):not(select)${list === 'notes' ? ':not([type=date])' : ''}`);
  if (el) { el.focus(); if (el.select) el.select(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
}
function delItem(list, i) {
  const L = getP(list), [item] = L.splice(i, 1);
  if (list === 'inventory' && item.id) S.attacks = S.attacks.filter(a => a.item !== item.id);
  save(); render();
  toast(`Removed “${esc(item.name || item.title || 'entry')}”`, '', 7000, { label: 'Undo', fn: () => undo(1) });
}

// ---------- Roll20 macros ----------
let MACROS = [], MACRO_MODE = 'normal';
const an = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
function d20x(b) { const k = MACRO_MODE === 'adv' ? '2d20kh1' : MACRO_MODE === 'dis' ? '2d20kl1' : '1d20'; return k + sgn(b); }
function buildMacros() {
  const L = [];
  const M = (group, name, emote, lines, sub) => L.push({ group, name, sub: sub || '', text: `/em **${emote}:**\n****\n` + lines.join('\n') });
  S.attacks.filter(atkShown).forEach(a => {
    const m = atkDmgMod(a), dice = atkDice(a), dmg = (dice || '0') + (m ? sgn(m) : '');
    const ex = extraDice().map(x => (x.match(/\d*d\d+/) || [''])[0]).filter(Boolean);
    M('Attacks', a.name, `attacks with ${a.name}`, [`**Attack Roll (to hit):** [[${d20x(atkHit(a))}]]`, `**Damage (${dmg}):** [[${dmg}]]`, `**Critical Damage (${doubleDice(dice)}${m ? sgn(m) : ''}):** [[${doubleDice(dice) || '0'}${m ? sgn(m) : ''}]]`], `${sgn(atkHit(a))} to hit · ${dmg}${a.type ? ' ' + String(a.type).toLowerCase() : ''}`);
  });
  if (clsLv('rogue')) M('Attacks', 'Sneak Attack', 'strikes a vital spot', [`**Sneak Attack (${sneakDice()}):** [[${sneakDice()}]]`], sneakDice());
  if (hasFeature('Divine Smite')) for (let i = 0; i < 9; i++) { if (!slotMax(i)) continue; const d = Math.min(5, i + 2); M('Attacks', `Divine Smite (${ORD[i]} slot)`, 'smites with divine radiance', [`**Radiant Damage (${d}d8):** [[${d}d8]]`, `**vs Undead / Fiend (${Math.min(6, d + 1)}d8):** [[${Math.min(6, d + 1)}d8]]`], `${d}d8 radiant`); }
  S.spells.filter(spReady).sort((x, y) => N(x.level) - N(y.level) || String(x.name).localeCompare(y.name)).forEach(sp => {
    const sm = spellMath(sp), ci = spellCI(sp), lines = [];
    if (sm.attack) lines.push(`**Spell Attack (to hit):** [[${d20x(ci.atk)}]]`);
    if (sm.save) lines.push(`**Save:** DC ${ci.dc} ${sm.save}${sm.half ? ' (half on success)' : ''}`);
    if (sm.dice) lines.push(`**Damage (${sm.dice} ${sm.type}):** [[${sm.dice}]]`);
    if (sm.dice && adeptFor(sm.type)) lines.push(`*Elemental Adept (${adeptFor(sm.type)}): count each 1 on the damage dice as a 2; ignores ${adeptFor(sm.type)} resistance*`);
    if (sm.heal && sm.heal !== 'all') lines.push(`**Healing (${sm.heal}):** [[${sm.heal}]]`);
    if (!sm.dice && !sm.heal) lines.push(`**Effect:** ${sp.summary || '—'}`);
    lines.push(`**Duration:** ${sp.duration || '—'}`);
    M('Spells', sp.name, `casts ${sp.name}`, lines, `${N(sp.level) ? ORD[N(sp.level) - 1] + ' level' : 'Cantrip'}${sm.dice ? ' · ' + sm.dice : sm.heal ? ' · heal ' + sm.heal : ''}`);
  });
  casters().forEach(c => { const ci = castInfo(c.key); M('Spells', `${c.name} Spell Attack`, 'makes a spell attack', [`**Attack Roll (to hit):** [[${d20x(ci.atk)}]]`, `**Save DC:** ${ci.dc}`], sgn(ci.atk) + ' · DC ' + ci.dc); });
  if (S.spells.some(s => s.conc)) M('Spells', 'Concentration Save', 'holds concentration', [`**Concentration (CON save):** [[${d20x(saveVal('con'))}]]`], sgn(saveVal('con')));
  S.features.filter(f => f.roll).forEach(f => { const e = evalRoll(f.roll); M('Features', f.name, `uses ${f.name}`, [`**${f.name} (${e}):** [[${e}]]`], e); });
  S.companions.forEach(c => (c.attacks || []).forEach(a => { const ls = []; if (a[1] !== '' && a[1] != null) ls.push(`**Attack Roll (to hit):** [[1d20${sgn(N(a[1]))}]]`); ls.push(`**Damage (${a[2]}):** [[${a[2]}]]`); M('Companions', `${c.name}: ${a[0]}`, `${c.name} uses ${a[0]}`, ls, `${a[1] === '' ? '' : sgn(N(a[1])) + ' · '}${a[2]}`); }));
  M('Other', 'Initiative', 'rolls initiative', [`**Initiative:** [[${d20x(initVal())} &{tracker}]]`], sgn(initVal()) + ' · adds to turn tracker');
  Object.keys(hdPools()).forEach(d => { const hd = '1d' + d + sgn(mod('con')); M('Other', `Hit Die (d${d})`, 'spends a Hit Die', [`**Hit Die (${hd}):** [[${hd}]]`], hd); });
  M('Other', 'Death Save', 'makes a death saving throw', [`**Death Save:** [[1d20]]`], 'd20');
  AB.forEach(a => M('Ability Checks', ABN[a], `makes ${an(ABN[a])} check`, [`**${ABN[a]} Check:** [[${d20x(mod(a))}]]`], sgn(mod(a))));
  AB.forEach(a => M('Saving Throws', ABN[a] + ' Save', `makes ${an(ABN[a])} saving throw`, [`**${ABN[a]} Save:** [[${d20x(saveVal(a))}]]`], sgn(saveVal(a))));
  S.skills.forEach(k => M('Skills', k.name, `makes ${an(k.name)} check`, [`**${k.name} Check:** [[${d20x(skillVal(k))}]]`], sgn(skillVal(k)) + (k.note ? ' · ' + k.note : '')));
  return L;
}
function openMacros(keep) {
  const q = keep && $('#mq') ? $('#mq').value : '';
  MACRO_MODE = 'normal'; const base = buildMacros();
  MACRO_MODE = UI.macroAdv || 'normal'; MACROS = buildMacros(); MACRO_MODE = 'normal';
  if (!S.macroSeen) { S.macroSeen = {}; base.forEach(m => S.macroSeen[m.group + '|' + m.name] = m.text); writeLocal(); }
  MACROS.forEach((m, n) => { m.key = m.group + '|' + m.name; m.norm = base[n].text; m.changed = S.macroSeen[m.key] !== m.norm; m.isNew = !(m.key in S.macroSeen); });
  const nChanged = MACROS.filter(m => m.changed).length;
  const groups = [...new Set(MACROS.map(m => m.group))];
  const body = groups.map(g => `<div class="mgroup" data-g="${esc(g)}"><div class="mg-h">${esc(g)}</div>${MACROS.map((m, n) => m.group !== g ? '' : `
    <div class="mrow${m.changed ? ' changed' : ''}" data-q="${esc((m.name + ' ' + g).toLowerCase())}" data-ch="${m.changed ? 1 : 0}"><div class="mr-main"><b>${esc(m.name)}</b>${m.changed ? `<span class="chg">${m.isNew ? 'New' : 'Changed'}</span>` : ''}<span class="hint">${esc(m.sub)}</span>
      <details><summary>Preview</summary><pre>${esc(m.text)}</pre></details></div>
      <button class="btn sm gold copybtn" data-act="copymacro" data-n="${n}">Copy</button></div>`).join('')}</div>`).join('');
  const adv = UI.macroAdv || 'normal';
  const html = `<h3>Roll20 Macros</h3>
    <p class="hint" style="margin:0 0 8px">Paste into Roll20 chat or save as a macro. Numbers use your current stats, so copy again after leveling up.</p>
    <div class="mtools"><button class="chgbtn${UI.macroChanged ? ' on' : ''}" data-act="macrochanged" aria-pressed="${!!UI.macroChanged}" title="Show only macros whose numbers changed since you last copied them">Changed <b>${nChanged}</b></button>
      <input class="f" id="mq" placeholder="Search…" value="${esc(q)}" aria-label="Search macros">
      <div class="segmini">${[['normal', 'Normal'], ['adv', 'Advantage'], ['dis', 'Disadvantage']].map(([v, t]) => `<button class="${adv === v ? 'on' : ''}" data-act="macroadv" data-v="${v}">${t}</button>`).join('')}</div></div>
    <div class="mlist">${body}<p class="hint mempty" style="padding:14px;margin:0;display:none">${nChanged ? 'No changed macros match your search.' : 'Nothing has changed since you last copied. After a level up, macros with new numbers show here.'}</p></div>
    <div class="actions">${nChanged ? `<button class="btn ghost" data-act="macroseenall" title="Mark every macro as up to date in Roll20">Mark all as updated</button>` : ''}<button class="btn" data-act="close">Close</button></div>`;
  if (keep && $('#modal').classList.contains('open')) $('#modal-body').innerHTML = html; else openModal(html, null, true);
  filterMacros();
}
function filterMacros() {
  const q = ($('#mq') && $('#mq').value || '').trim().toLowerCase();
  $$('.mrow').forEach(r => r.style.display = (!q || r.dataset.q.includes(q)) && (!UI.macroChanged || r.dataset.ch === '1') ? '' : 'none');
  $$('.mgroup').forEach(g => g.style.display = $$('.mrow', g).some(r => r.style.display !== 'none') ? '' : 'none');
  const em = $('.mempty'); if (em) em.style.display = $$('.mrow').some(r => r.style.display !== 'none') ? 'none' : '';
}
function copyMacro(b) {
  const mc = MACROS[N(b.dataset.n)]; S.macroSeen[mc.key] = mc.norm; writeLocal();
  const row = b.closest('.mrow');
  if (row && row.dataset.ch === '1') { row.dataset.ch = '0'; row.classList.remove('changed'); const c = row.querySelector('.chg'); if (c) c.remove(); const cb = $('.chgbtn b'); if (cb) cb.textContent = Math.max(0, N(cb.textContent) - 1); }
  copyText(mc.text).then(ok => { b.textContent = ok ? 'Copied ✓' : 'Copy failed'; b.classList.toggle('done', ok); setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('done'); }, 1600); });
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) {
    const x = document.createElement('textarea'); x.value = t; x.style.position = 'fixed'; x.style.opacity = '0'; document.body.appendChild(x); x.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (z) {} x.remove(); return ok;
  }
}

// ---------- Rests ----------
function shortRest() {
  const snap = JSON.stringify({ hp: S.hp, hdUsed: S.hdUsed });
  const pools = hdPools();
  openModal(`<h3>Short Rest</h3>
    <p>Spend Hit Dice to heal. Each die heals its roll ${fmt(mod('con', true))} (CON).</p>
    <div class="hdrow">${Object.keys(pools).map(d => `<button class="btn gold" data-act="spendhd" data-d="${d}" id="hdBtn${d}" ${hdLeftOf(d) ? '' : 'disabled'}>Spend a d${d} <span class="hdleft" id="hdLeft${d}">· ${hdLeftOf(d)} left</span></button>`).join('')}</div>
    <p>HP <b id="hdHP">${N(S.hp.cur)}/${maxHp()}</b></p><p class="hint" id="hdLog"></p>
    <div id="srList">${srListHTML()}</div>
    <p class="hint">Cancel undoes any Hit Dice spent here.</p>
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="confirm-short">Finish Short Rest</button></div>`,
    () => { pendingLabel = 'Cancel short rest'; const o = JSON.parse(snap); S.hp = o.hp; S.hdUsed = o.hdUsed; update(); toast('Short rest cancelled — changes reverted.'); });
}
function spendHD(d) {
  if (!hdLeftOf(d)) return;
  const r = rollExpr('1d' + d, { need: true, label: 'Hit die (d' + d + ')' }); let heal = Math.max(0, r.total + mod('con', true));
  if (hasFeat('Durable')) heal = Math.max(heal, 2 * mod('con', true));
  S.hdUsed[d] = N(S.hdUsed[d]) + 1;
  S.hp.cur = Math.min(maxHp(), N(S.hp.cur) + heal);
  $('#hdLeft' + d).textContent = `· ${hdLeftOf(d)} left`; $('#hdHP').textContent = N(S.hp.cur) + '/' + maxHp();
  $('#hdLog').textContent += `d${d}: rolled ${r.total} ${fmt(mod('con', true))} = +${heal} HP. `;
  if (!hdLeftOf(d)) $('#hdBtn' + d).disabled = true;
  pendingLabel = 'Spend Hit Die'; update(); const sl = $('#srList'); if (sl) sl.innerHTML = srListHTML();
}
function finishShort() {
  endByRest([-1]);
  S.features.forEach(f => { if (resetOf(f) === 'short') f.used = 0; });
  S.spells.forEach(s => { if (s.uses && s.uses.reset === 'short') s.uses.used = 0; s.casts = 0; });
  S.inventory.forEach(it => { if (it.charges && it.charges.reset === 'short') it.charges.used = 0; });
  S.pactUsed = 0;
  const res = passRounds(600);
  pendingLabel = 'Short rest'; closeModal(true); save(); render(); toast('Short rest complete.'); setTimeout(() => announce(res), 300); fxTrigger('shortRest');
}
function longRest() {
  const L = longRestChanges();
  openModal(`<h3>Long Rest</h3>
    ${L.length ? `<p class="hint" style="margin:0 0 8px">Taking a long rest will change:</p><ul class="lrlist">${L.map(x => `<li>${x}</li>`).join('')}</ul>` : '<p>You\'re already fully rested — nothing will change.</p>'}
    <div class="actions"><button class="btn" data-act="close">Cancel</button><button class="btn gold" data-act="confirm-long" autofocus>Take Long Rest</button></div>`);
}
// Exactly what finishShort() is about to change (Hit Dice you spend in the window show up in the HP line as you go).
function shortRestChanges() {
  const out = [], b = v => `<b>${v}</b>`, arrow = (a, z) => `${b(a)} → ${b(z)}`;
  const uses = [];
  S.features.forEach(f => { const m = featMax(f); if (resetOf(f) === 'short' && N(f.used) && m != null) uses.push(`${esc(f.dname || f.name)} ${arrow(Math.max(0, m - N(f.used)), m)}`); });
  S.spells.forEach(sp => { if (sp.uses && sp.uses.reset === 'short' && N(sp.uses.used)) uses.push(`${esc(sp.name)} ${N(sp.uses.max) ? arrow(Math.max(0, N(sp.uses.max) - N(sp.uses.used)), N(sp.uses.max)) : 'uses back'}`); });
  S.inventory.forEach(it => { if (it.charges && it.charges.reset === 'short' && N(it.charges.used)) { const m = N(it.charges.max); uses.push(`${esc(it.name)} ${arrow(Math.max(0, m - N(it.charges.used)), m)} charges`); } });
  const pc = pact(); if (pc && N(S.pactUsed)) out.push(`Pact Magic slots ${arrow(Math.max(0, pc.count - N(S.pactUsed)), pc.count)}`);
  if (uses.length) out.push(`Uses back: ${uses.join(', ')}`);
  const ending = [];
  Object.keys(S.condTurns || {}).forEach(c => { if (N(S.condTurns[c]) === -1 && S.conditions.includes(c)) ending.push(c); });
  Object.keys(S.tmpMods || {}).forEach(k => { if (N(S.tmpMods[k].r) === -1) ending.push(`${tmName(k)} ${fmt(tmv(k))}`); });
  if (abTempOn() && N(S.abTempR) === -1) ending.push('ability score changes');
  (S.effects || []).forEach(e => { if (e.rounds != null && N(e.rounds) <= 600 && e.name) ending.push(e.name + (e.conc && e.name === S.concentration ? ' (concentration)' : '')); });
  if (ending.length) out.push(`Ends: ${[...new Set(ending)].map(esc).join(', ')} <small>(an hour passes)</small>`);
  return out;
}
function srListHTML() {
  const L = shortRestChanges(), spent = Object.keys(hdPools()).some(d => hdLeftOf(d) < (hdPools()[d] || 0));
  return L.length ? `<p class="hint" style="margin:10px 0 6px">Finishing the rest will also change:</p><ul class="lrlist">${L.map(x => `<li>${x}</li>`).join('')}</ul>` : `<p class="hint" style="margin:10px 0 6px">Nothing else changes when you finish${spent ? '' : ' — no short-rest uses are spent'}.</p>`;
}
// Exactly what finishLong() is about to change, worked out from the sheet as it is right now.
function longRestChanges() {
  const out = [], b = v => `<b>${v}</b>`, arrow = (a, z) => `${b(a)} → ${b(z)}`;
  const mx = maxHp(), cur = N(S.hp.cur);
  if (cur < mx) out.push(`Hit points ${arrow(cur, mx)} <small>(+${mx - cur})</small>`);
  if (N(S.hp.temp)) out.push(`${b(N(S.hp.temp))} temporary HP cleared`);
  const slots = []; for (let l = 0; l < 9; l++) { const m = slotMax(l), u = Math.min(N(S.slotsUsed[l]), m); if (m && u) slots.push(`${ORD[l]} ${arrow(m - u, m)}`); }
  if (slots.length) out.push(`Spell slots: ${slots.join(', ')}`);
  const pc = pact(); if (pc && N(S.pactUsed)) out.push(`Pact Magic slots ${arrow(Math.max(0, pc.count - N(S.pactUsed)), pc.count)}`);
  const hd = hdPools(), hdl = Object.keys(hd).filter(d => N(S.hdUsed[d])).map(d => `d${d} ${arrow(hdLeftOf(d), hd[d])}`);
  if (hdl.length) out.push(`Hit Dice: ${hdl.join(', ')}`);
  const uses = [];
  S.features.forEach(f => { const m = featMax(f); if ((resetOf(f) === 'short' || f.reset === 'long') && N(f.used) && m != null) uses.push(`${esc(f.dname || f.name)} ${arrow(Math.max(0, m - N(f.used)), m)}`); });
  S.spells.forEach(sp => { if (sp.uses && !sp.usesOnly && N(sp.uses.used)) uses.push(`${esc(sp.name)} ${N(sp.uses.max) ? arrow(Math.max(0, N(sp.uses.max) - N(sp.uses.used)), N(sp.uses.max)) : 'uses back'}`); });
  S.inventory.forEach(it => { if (it.charges && it.charges.reset !== 'none' && N(it.charges.used)) { const m = N(it.charges.max); uses.push(`${esc(it.name)} ${arrow(Math.max(0, m - N(it.charges.used)), m)} charges`); } });
  (S.companions || []).forEach(c => { if (c.used && Object.values(c.used).some(v => N(v))) uses.push(`${esc(c.name)}'s abilities`); });
  if (uses.length) out.push(`Uses back: ${uses.join(', ')}`);
  if (N(S.exhaustion)) out.push(`Exhaustion ${arrow(N(S.exhaustion), N(S.exhaustion) - 1)}`);
  const ending = [];
  Object.keys(S.condTurns || {}).forEach(c => { if ([-1, -2].includes(N(S.condTurns[c])) && S.conditions.includes(c)) ending.push(c); });
  S.conditions.forEach(c => { if (['Unconscious', 'Raging', 'Dodging'].includes(c) && !ending.includes(c)) ending.push(c); });
  Object.keys(S.tmpMods || {}).forEach(k => { if ([-1, -2].includes(N(S.tmpMods[k].r))) ending.push(`${tmName(k)} ${fmt(tmv(k))}`); });
  if (abTempOn() && [-1, -2].includes(N(S.abTempR))) ending.push('ability score changes');
  if (ending.length) out.push(`Ends: ${ending.map(esc).join(', ')}`);
  const active = (S.effects || []).map(e => e.name).filter(Boolean);
  if (S.concentration && !active.includes(S.concentration)) active.unshift(S.concentration);
  if (S.form) active.push(S.form.name || 'your transformation');
  if (active.length) out.push(`Ends: ${[...new Set(active)].map(esc).join(', ')}${S.concentration ? ' (concentration drops)' : ''}`);
  if (N((S.death || {}).s) || N((S.death || {}).f)) out.push('Death saves reset');
  return out;
}
// Conditions and ability changes set to last "until a short rest" / "until a long rest" end here.
function endByRest(kinds) {
  const gone = [];
  Object.keys(S.condTurns || {}).forEach(c => { if (kinds.includes(N(S.condTurns[c]))) { delete S.condTurns[c]; if (S.condNotes) delete S.condNotes[c]; S.conditions = S.conditions.filter(x => x !== c); gone.push(c); } });
  Object.keys(S.tmpMods || {}).forEach(k => { if (kinds.includes(N(S.tmpMods[k].r))) { delete S.tmpMods[k]; gone.push(tmName(k) + ' change'); } });
  if (abTempOn() && kinds.includes(N(S.abTempR))) { S.abTemp = {}; S.abTempR = 0; gone.push('ability score changes'); }
  if (gone.length) setTimeout(() => toast(`<b>${esc(gone.join(', '))}</b> ended with the rest.`, '', 6000), 400);
}
function finishLong() {
  endByRest([-1, -2]);
  (S.companions || []).forEach(c => { if (c.used) c.used = {}; });
  S.effects = []; S.concentration = ''; S.form = null; S.riders = []; $$('.toast.alert').forEach(t => t.remove());
  cleanupLinked();
  S.exhaustion = Math.max(0, N(S.exhaustion) - 1);
  S.hp.cur = maxHp(); S.hp.temp = 0;
  S.slotsUsed = Array(9).fill(0); S.pactUsed = 0;
  S.features.forEach(f => { if (resetOf(f) === 'short' || f.reset === 'long') f.used = 0; });
  S.spells.forEach(s => { if (s.uses && !s.usesOnly) s.uses.used = 0; s.casts = 0; });
  S.inventory.forEach(it => { if (it.charges && it.charges.reset !== 'none') it.charges.used = 0; });
  S.hdUsed = {}; S.compOff = {};
  S.death = { s: 0, f: 0 }; S.conditions = S.conditions.filter(c => !['Unconscious', 'Raging', 'Dodging'].includes(c));
  S.turn = { round: 1, used: {}, moved: 0, attacks: 0 };
  pendingLabel = 'Long rest'; closeModal(true); save(); render();
  fxTrigger('longRest');
  const pc = casters().find(c => c.prepared);
  toast('Long rest complete — fully restored.', '', 7000, pc ? { label: 'Change prepared spells', fn: () => openPrepare(pc.key) } : null);
}

// ---------- Files, theme, portrait ----------
async function download(name, text, type) {
  // Published on claude.ai: save through the page's download prompt; as a local file: a normal download.
  try {
    const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
    if (dl) { await dl.save({ filename: name, data: text }); return; }
  } catch (e) {
    if (e && e.code === 'declined') return;
    if (e && e.code === 'rate_limited') { toast('A save prompt is already open.'); return; }
  }
  const blob = new Blob([text], { type });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
const fileBase = () => (S.name || 'character').replace(/[^\w-]+/g, '_') + '_' + new Date().toISOString().slice(0, 10);
function exportJSON() { download(fileBase() + '.json', JSON.stringify(S, null, 1), 'application/json'); toast('Exported data.'); }
function saveHTML() {
  S.savedAt = Date.now();
  const json = JSON.stringify(S).replace(/</g, '\\u003c');
  const open = '<script id="sheet-data" type="application/json">';
  const a = PRISTINE.indexOf(open), b = PRISTINE.indexOf('</' + 'script>', a);
  const out = (PRISTINE.slice(0, a + open.length) + json + PRISTINE.slice(b)).replace(/<html([^>]*?) class="mobile"/, '<html$1');
  download(fileBase() + '_sheet.html', out, 'text/html');
  writeLocal();
  toast('Downloaded a copy of this character. Open it on any device — it remembers everything.');
}
$('#importFile').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || !d.abilities) throw new Error('not a sheet');
      const wasNew = !S.created;
      const prev = S; S = migrate(d); S.id = prev.id || S.id || uid(); S.layout = prev.layout || S.layout; S.created = true; S.dataRev = EMBED.dataRev || ''; pendingLabel = 'Import data';
      if (wasNew) { closeWizard(); LAST = snapAll(); }
      save(); applyTheme(); render();
      toast('Imported ' + esc(S.name) + '.', '', 7000, wasNew ? null : { label: 'Undo', fn: () => undo(1) });
    } catch (x) { toast('That file isn’t a character export.', 'fumble'); }
  };
  r.readAsText(f); e.target.value = '';
});
let PICPATH = '';
$('#picFile') && $('#picFile').addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (!f || !PICPATH) return; const path = PICPATH; loadPortrait(f, url => { setP(path, url); pendingLabel = 'Add picture'; save(); render(); }, 320); e.target.value = ''; });
function loadPortrait(file, cb, size) {
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    const s = size || 560, c = document.createElement('canvas'); c.width = c.height = s;
    const k = Math.max(s / img.width, s / img.height), w = img.width * k, h = img.height * k;
    c.getContext('2d').drawImage(img, (s - w) / 2, (s - h) / 2, w, h);
    URL.revokeObjectURL(url); cb(c.toDataURL('image/jpeg', 0.85));
  };
  img.src = url;
}
$('#portraitFile').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return; e.target.value = '';
  loadPortrait(f, data => {
    if (!S.created) { W.portrait = data; renderWizard(); return; }
    S.portrait = data; pendingLabel = 'Change portrait'; matchPortrait(false); save(); render('header');
    toast('Portrait updated and theme colors matched to it.', '', 6000, [{ label: 'Keep old colors', fn: () => undo(1) }]);
  });
});
// Theme: accent and banner colors, from a picker or sampled from the portrait.
function hexToRgb(h) { const m = String(h || '').match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null; }
const rgbHex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => a.map((v, k) => v + (b[k] - v) * t);
// Accent text must stay readable whatever colour was picked: push it lighter in dark mode, darker in light mode.
const lumOf = c => (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
function readableInk(a, dark) { let c = dark ? mix(a, [255, 255, 255], 0.25) : mix(a, [0, 0, 0], 0.4); for (let k = 0; k < 12; k++) { const l = lumOf(c); if (dark ? l >= 0.62 : l <= 0.36) break; c = mix(c, dark ? [255, 255, 255] : [0, 0, 0], 0.18); } return c; }
// Light/dark is kept with the character too (not only in this browser's storage), so a fresh copy of the sheet opens in the right mode.
function applyMode() {
  const set = S.settings || (S.settings = {}); let ls = null; try { ls = localStorage.getItem('dnd-sheet-theme'); } catch (e) {}
  if (set.colorMode !== 'dark' && set.colorMode !== 'light') { if (!PER_SHEET && (ls === 'dark' || ls === 'light')) set.colorMode = ls; else { if (PER_SHEET) { let pg = null; try { pg = localStorage.getItem('pg-theme'); } catch (e) {} document.documentElement.setAttribute('data-theme', pg === 'dark' || pg === 'light' ? pg : window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } return; } }
  if (document.documentElement.getAttribute('data-theme') !== set.colorMode) document.documentElement.setAttribute('data-theme', set.colorMode);
  if (ls !== set.colorMode) try { localStorage.setItem('dnd-sheet-theme', set.colorMode); } catch (e) {}
}
function applyTheme() {
  applyMode();
  const st = document.documentElement.style, th = S.theme || {}, dark = document.documentElement.getAttribute('data-theme') === 'dark';
  ['--gold', '--gold-ink', '--gold-soft', '--navy', '--navy2'].forEach(v => st.removeProperty(v));
  const a = hexToRgb(th.accent);
  st.removeProperty('--on-gold');
  if (a) { const lum = (0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2]) / 255; st.setProperty('--on-gold', lum < 0.55 ? '#FFFFFF' : '#1D2536'); st.setProperty('--gold', rgbHex(a)); st.setProperty('--gold-ink', rgbHex(readableInk(a, dark))); st.setProperty('--gold-soft', rgbHex(dark ? mix(a, [20, 24, 32], 0.75) : mix(a, [255, 255, 255], 0.78))); }
  const g = hexToRgb(th.bg);
  ['--bg', '--bg2'].forEach(v => st.removeProperty(v));
  if (g) { st.setProperty('--bg', rgbHex(dark ? mix(g, [8, 10, 16], 0.82) : g)); st.setProperty('--bg2', rgbHex(dark ? mix(g, [14, 18, 26], 0.75) : mix(g, [0, 0, 0], 0.06))); }
  const root = document.documentElement; root.classList.add('compact'); root.style.fontSize = N(ST('fontScale')) && N(ST('fontScale')) !== 100 ? N(ST('fontScale')) + '%' : '';
  const n = hexToRgb(th.banner);
  if (n) { st.setProperty('--navy', rgbHex(dark ? mix(n, [0, 0, 0], 0.45) : n)); st.setProperty('--navy2', rgbHex(mix(n, [0, 0, 0], dark ? 0.65 : 0.3))); }
}
function matchPortrait(announceIt) {
  if (!S.portrait) { toast('Add a portrait first.'); return; }
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = c.height = 48; const g = c.getContext('2d'); g.drawImage(img, 0, 0, 48, 48);
    const d = g.getImageData(0, 0, 48, 48).data; let best = null, bestS = -1, dark = [0, 0, 0], dn = 0;
    const buckets = {};
    for (let k = 0; k < d.length; k += 4) {
      const r = d[k], gg = d[k + 1], b = d[k + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), sat = mx ? (mx - mn) / mx : 0, lum = (mx + mn) / 2;
      if (lum < 90) { dark = [dark[0] + r, dark[1] + gg, dark[2] + b]; dn++; }
      if (sat < 0.35 || mx < 90) continue;
      const key = [r >> 5, gg >> 5, b >> 5].join(','); const bk = buckets[key] = buckets[key] || { n: 0, c: [0, 0, 0] }; bk.n++; bk.c = [bk.c[0] + r, bk.c[1] + gg, bk.c[2] + b];
    }
    Object.values(buckets).forEach(bk => { const col = bk.c.map(v => v / bk.n), mx = Math.max(...col), mn = Math.min(...col), sc = bk.n * ((mx - mn) / mx); if (sc > bestS) { bestS = sc; best = col; } });
    S.theme = Object.assign({}, S.theme, { accent: best ? rgbHex(best) : '', banner: dn > 20 ? rgbHex(mix(dark.map(v => v / dn), [20, 26, 40], 0.35)) : '' });
    pendingLabel = 'Theme from portrait'; applyTheme(); save(); render('header');
    if (announceIt) { closeModal(true); toast('Theme colors matched to your portrait.'); }
  };
  img.src = S.portrait;
}
function openThemeModal() {
  const th = S.theme || {};
  const presets = ['#E0A526', '#C2462E', '#2F8F5B', '#3A7BD5', '#8A4FD1', '#D04F8E', '#1E9AA0', '#8B6B3D'];
  openModal(`<h3>Theme color</h3><p class="hint" style="margin:0 0 8px">Pick an accent, or match the colors in your portrait.</p>
    <div class="swatches">${presets.map(p => `<button class="sw" style="background:${p}" data-act="themeset" data-v="${p}" aria-label="${p}"></button>`).join('')}</div>
    <div class="row" style="margin-top:10px"><label class="checkline">Custom <input type="color" id="themePick" value="${esc(th.accent || '#E0A526')}"></label>
      <button class="btn" data-act="themeportrait" ${S.portrait ? '' : 'disabled'}>Match portrait</button><button class="btn ghost" data-act="themeset" data-v="">Default</button></div>
    <div class="actions"><button class="btn" data-act="close">Done</button></div>`);
  $('#themePick').addEventListener('input', e => setAccent(e.target.value, true));
}
function setAccent(v, live) { S.theme = Object.assign({}, S.theme, { accent: v }); if (!v) S.theme.banner = ''; pendingLabel = 'Edit: Theme color'; applyTheme(); save(); if (!live) { render('header'); } }
function confirmNewChar() {
  openModal(`<h3>Start a new character?</h3><p>This clears the sheet in this browser and opens character creation. Download or export this character first if you want to keep it.</p>
    <div class="actions"><button class="btn" data-act="savehtml">Download first</button><button class="btn" data-act="close">Cancel</button><button class="btn red" data-act="newcharok">Start over</button></div>`);
}
function newCharacter() {
  try { localStorage.removeItem(keyFor(S.id)); localStorage.removeItem(hkey()); if (BLANK_FILE) localStorage.removeItem(PATH_KEY); } catch (e) {}
  S = Object.assign(blankState(), { dataRev: EMBED.dataRev || '', layout: S.layout || {} }); S = migrate(S); HIST = []; REDO = []; LAST = snapAll();
  closeModal(true); applyTheme(); openWizard();
}

// ---------- Update to a newer version of the sheet ----------
// Reads a newer blank sheet file, bakes this character into it and switches this tab over to it.
$('#updateFile').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const text = String(r.result || ''), open = '<script id="sheet-data" type="application/json">';
    const a = text.indexOf(open), b = a < 0 ? -1 : text.indexOf('</' + 'script>', a);
    if (a < 0 || b < 0 || !/data-act=|id="sec-header"/.test(text)) { toast("That file isn't a character sheet.", 'fumble', 7000); return; }
    let theirs = {}; try { theirs = JSON.parse(text.slice(a + open.length, b) || '{}'); } catch (x) {}
    if (theirs.created) { toast(`That file already holds a character (${esc(theirs.name || 'unnamed')}). Pick the blank sheet you were sent.`, 'fumble', 9000); return; }
    const ver = (/const APP_VERSION = '([^']+)'/.exec(text) || [])[1] || 'unknown';
    S.updatedFrom = APP_VERSION; S.updatedTo = ver; S.dataRev = theirs.dataRev || ''; S.savedAt = Date.now();
    writeLocal();
    const json = JSON.stringify(S).replace(/</g, '\\u003c');
    const out = text.slice(0, a + open.length) + json + text.slice(b);
    try { delete window.DND; } catch (x) { window.DND = undefined; }
    document.open(); document.write(out); document.close();
  };
  r.readAsText(f);
});
// First run after an update: say what happened and offer the new choices.
function afterUpdate() {
  if (!S.updatedFrom) return;
  const from = S.updatedFrom; delete S.updatedFrom; delete S.updatedTo; rebuildAuto(); save();
  const n = owedChoices().length;
  openModal(`<h3>Sheet updated</h3><p>${esc(S.name || 'Your character')} moved from version ${esc(from)} to ${esc(APP_VERSION)}. Everything you had is kept.</p>
    ${n ? `<p><b>${n} choice${n > 1 ? 's' : ''}</b> ${n > 1 ? 'are' : 'is'} waiting — things your levels give you that weren't picked yet (sometimes because older versions didn't ask).</p>` : '<p>Nothing new to choose.</p>'}
    <p class="hint">Download the updated sheet to keep it as a file: Save → Download this character.</p>
    <div class="actions"><button class="btn" data-act="savehtml">Download now</button>${n ? '<button class="btn gold" data-act="pending">Review choices</button>' : '<button class="btn gold" data-act="close">Done</button>'}</div>`);
}

function clampHp() { if (S.hp && N(S.hp.cur) > maxHp()) S.hp.cur = maxHp(); }
const stepper = (act, k, val, aria) => `<span class="mstep"><button data-act="${act}" data-k="${k}" data-d="-1" aria-label="${aria} −1">−</button><b>${val}</b><button data-act="${act}" data-k="${k}" data-d="1" aria-label="${aria} +1">+</button></span>`;
const durStep = k => { const r = tmr(k); return `<span class="mstep dur"><button data-act="tmpmodr" data-k="${k}" data-d="-1" aria-label="Shorter" ${r <= -2 ? 'disabled' : ''}>−</button><b>${durText(r)}</b><button data-act="tmpmodr" data-k="${k}" data-d="1" aria-label="Longer">+</button></span>`; };
function openHpManage() {
  const calc = hpMaxCalc(), adj = N(S.hp.adj), fxv = fxActive().reduce((t, e) => t + (e.self !== false && !e.ally ? N(e.maxHp) : 0), 0), tv = tmv('hpmax'), halved = N(S.exhaustion) >= 4 && !exModern();
  const line = (l, v, cls = '') => `<div class="mline${cls}"><span>${l}</span><b>${v}</b></div>`;
  const html = `<div id="hpmanage"><div class="sethead"><h3>Max HP</h3><button class="btn sm gold" data-act="close">Done</button></div>
    <div class="mbig"><b>${maxHp()}</b><span>maximum hit points</span></div>
    <div class="mlines">${line('Hit Dice, CON and level', calc)}${adj ? line('Your adjustment', fmt(adj)) : ''}${fxv ? line('Spells and features', fmt(fxv)) : ''}${tv ? line('Temporary change', fmt(tv), ' warnline') : ''}${halved ? line('Exhaustion 4+', '½', ' warnline') : ''}</div>
    <div class="msec"><div class="msec-h"><b>Permanent adjustment</b><small>Toughness from an old ruling, a blessing, a mistake in the math — kept on level up.</small></div>${stepper('hpadj', 'adj', fmt(adj), 'Adjustment')}</div>
    <p class="hint" style="margin:8px 0 0">For a temporary change to max HP (life drain, a curse, Aid from someone else) use <b>Conditions</b>.</p>
  </div>`;
  if ($('#hpmanage') && $('#modal').classList.contains('open')) $('#modal-body').innerHTML = html; else openModal(html);
}
function openAcManage() {
  const ai = acInfo(), man = S.acOverride !== '' && S.acOverride != null, tv = tmv('ac');
  const html = `<div id="acmanage"><div class="sethead"><h3>Armor Class</h3><button class="btn sm gold" data-act="close">Done</button></div>
    <div class="mbig"><b>${ai.total}</b><span>armor class</span></div>
    <div class="mlines">${ai.parts.map(p => `<div class="mline"><span>${esc(p)}</span></div>`).join('')}</div>
    <div class="msec"><div class="msec-h"><b>Set it yourself</b><small>${man ? 'Set manually — armor and DEX are ignored.' : 'Automatic from your armor, shield and DEX.'}</small></div><span class="mset"><input class="f" type="number" inputmode="numeric" data-acin placeholder="${ai.total}" value="${man ? ai.total : ''}" aria-label="Armor class">${man ? '<button class="btn sm" data-act="acauto">Auto</button>' : ''}</span></div>
    <p class="hint" style="margin:8px 0 0">For a temporary change to AC (Shield of Faith from an ally, a curse, cover) use <b>Conditions</b>.</p>
  </div>`;
  if ($('#acmanage') && $('#modal').classList.contains('open')) $('#modal-body').innerHTML = html; else openModal(html);
}

const mOpen = sel => !!$(sel) && $('#modal').classList.contains('open') && $('#modal-body').contains($(sel));

// ---------- Spells & effects someone else puts on you ----------
// Like Conditions: pick what a party member (or an enemy) cast on you and the sheet applies it — AC, saves, speed, damage,
// advantage — and counts it down with everything else. [key, name, group, rounds (null = until removed), buff, extras]
const DMG5 = ['acid', 'cold', 'fire', 'lightning', 'thunder'], ABS6 = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const EXT_FX = [
  ['bless', 'Bless', 'Rolls', 10, { bless: true }],
  ['guidance', 'Guidance', 'Rolls', 10, { checkDieNext: '1d4', note: '+1d4 on your next ability check' }],
  ['resistance', 'Resistance', 'Rolls', 10, { saveDieNext: '1d4', note: '+1d4 on your next saving throw' }],
  ['enhance', 'Enhance Ability', 'Rolls', 600, {}, { pick: ABS6.map(a => [a, ABN[a]]), make: a => ({ checkAdv: [a], note: `Advantage on ${ABN[a]} checks` }), label: a => ABN[a] }],
  ['heroism', 'Heroism', 'Rolls', 10, { condImmune: ['Frightened'], note: 'Immune to frightened; temporary HP at the start of each of your turns' }],
  ['pwt', 'Pass without Trace', 'Rolls', 600, { note: '+10 to Dexterity (Stealth) checks; can’t be tracked by nonmagical means' }],
  ['shieldfaith', 'Shield of Faith', 'Protection', 100, { ac: 2 }],
  ['haste', 'Haste', 'Protection', 10, { ac: 2, speedMult: 2, saveAdv: ['dex'], note: 'One extra action each turn (one weapon attack, Dash, Disengage, Hide or Use an Object); when it ends you can’t move or act for a turn' }],
  ['barkskin', 'Barkskin', 'Protection', 600, { acMin: 16 }],
  ['magearmor', 'Mage Armor', 'Protection', 4800, { acBase: 13, unarmoredOnly: true }],
  ['wardingbond', 'Warding Bond', 'Protection', 600, { ac: 1, save: 1, resist: ['all damage'], note: 'The caster takes the same damage you do' }],
  ['stoneskin', 'Stoneskin', 'Protection', 600, { resist: ['nonmagical bludgeoning, piercing and slashing'] }],
  ['protenergy', 'Protection from Energy', 'Protection', 600, {}, { pick: DMG5.map(t => [t, t[0].toUpperCase() + t.slice(1)]), make: t => ({ resist: [t] }), label: t => t[0].toUpperCase() + t.slice(1) }],
  ['pfeg', 'Protection from Evil and Good', 'Protection', 100, { note: 'Aberrations, celestials, elementals, fey, fiends and undead have disadvantage to hit you and can’t charm, frighten or possess you' }],
  ['sanctuary', 'Sanctuary', 'Protection', 10, { note: 'Anyone targeting you must make a WIS save first; ends if you attack or cast on an enemy' }],
  ['blur', 'Blur', 'Protection', 10, { note: 'Attacks against you have disadvantage' }],
  ['invis', 'Invisibility', 'Protection', 600, { note: 'Invisible until you attack or cast a spell' }],
  ['ginvis', 'Greater Invisibility', 'Protection', 10, { atkAdv: 'invisible', note: 'Attacks against you have disadvantage' }],
  ['deathward', 'Death Ward', 'Protection', 4800, { note: 'The first time you’d drop to 0 HP you drop to 1 instead (once)' }],
  ['freedom', 'Freedom of Movement', 'Protection', 600, { note: 'Difficult terrain and magic can’t slow, paralyze or restrain you' }],
  ['beacon', 'Beacon of Hope', 'Protection', 10, { saveAdv: ['wis'], note: 'Advantage on WIS saves and death saves; healing you is maximised' }],
  ['holyaura', 'Holy Aura', 'Protection', 10, { saveAdv: ABS6, note: 'Attacks against you have disadvantage' }],
  ['foresight', 'Foresight', 'Protection', 4800, { atkAdv: 'Foresight', saveAdv: ABS6, checkAdv: ABS6, note: 'Attacks against you have disadvantage' }],
  ['longstrider', 'Longstrider', 'Movement', 600, { speed: 10 }],
  ['fly', 'Fly', 'Movement', 100, { fly: 60 }],
  ['spiderclimb', 'Spider Climb', 'Movement', 600, { note: 'Climb speed equal to your walking speed, even upside down' }],
  ['waterbreath', 'Water Breathing', 'Movement', 14400, { note: 'You can breathe underwater' }],
  ['jump', 'Jump', 'Movement', 10, { note: 'Your jump distance is tripled' }],
  ['magicweapon', 'Magic Weapon', 'Weapons', 600, {}, { pick: [['1', '+1'], ['2', '+2 (4th-level slot)'], ['3', '+3 (6th-level slot)']], make: v => ({ atk: N(v), dmg: N(v), note: 'One weapon only' }), label: v => '+' + v }],
  ['elemweapon', 'Elemental Weapon', 'Weapons', 600, {}, { pick: DMG5.map(t => [t, t[0].toUpperCase() + t.slice(1)]), make: t => ({ atk: 1, dmgDice: '1d4 ' + t, note: 'One weapon only' }), label: t => t[0].toUpperCase() + t.slice(1) }],
  ['holyweapon', 'Holy Weapon', 'Weapons', 600, { dmgDice: '2d8 radiant', note: 'One weapon only' }],
  ['crusader', 'Crusader’s Mantle', 'Weapons', 10, { dmgDice: '1d4 radiant' }],
  ['enlarge', 'Enlarge', 'Weapons', 10, { dmgDice: '1d4', checkAdv: ['str'], saveAdv: ['str'], note: 'One size larger' }],
  ['reduce', 'Reduce', 'Weapons', 10, { checkDis: ['str'], saveDis: ['str'], note: 'One size smaller; your weapon attacks deal 1d4 less damage' }],
  ['aid', 'Aid', 'Hit points', 4800, {}, { pick: [['2', '2nd level (+5)'], ['3', '3rd (+10)'], ['4', '4th (+15)'], ['5', '5th (+20)']], hp: v => 5 * (N(v) - 1), make: () => ({}), label: v => '+' + 5 * (N(v) - 1) }],
  ['aurapro', 'Aura of Protection', 'From an ally', null, {}, { pick: [1, 2, 3, 4, 5].map(n => [String(n), '+' + n]), make: v => ({ aura: N(v) }), label: v => '+' + v, why: 'A paladin within 10 ft (30 ft at 18th level) adds their CHA modifier to your saves' }],
  ['auracourage', 'Aura of Courage', 'From an ally', null, { condImmune: ['Frightened'], note: 'You can’t be frightened while within the paladin’s aura' }],
  ['bardic', 'Bardic Inspiration', 'From an ally', 100, {}, { pick: ['d6', 'd8', 'd10', 'd12'].map(d => [d, d]), make: d => ({ note: `Add 1${d} to one attack, check or save (tap the die to roll it)` }), repeat: d => ({ dice: '1' + d, type: 'Bardic Inspiration' }), label: d => d }],
  ['emboldening', 'Emboldening Bond', 'From an ally', 600, { note: 'Once per turn, add 1d4 to an attack, check or save' }, { repeat: () => ({ dice: '1d4', type: 'Emboldening Bond' }) }],
  ['bane', 'Bane', 'From an enemy', 10, { bane: true }],
  ['slow', 'Slow', 'From an enemy', 10, { ac: -2, speedHalf: true, note: '−2 to DEX saves; no reactions; an action or a bonus action, not both' }],
  ['faerie', 'Faerie Fire', 'From an enemy', 10, { note: 'Attacks against you have advantage; you can’t be invisible' }],
  ['hex', 'Hex', 'From an enemy', 600, {}, { pick: ABS6.map(a => [a, ABN[a]]), make: a => ({ checkDis: [a], note: `Disadvantage on ${ABN[a]} checks` }), label: a => ABN[a] }],
  ['curse', 'Bestow Curse', 'From an enemy', 10, {}, { pick: ABS6.map(a => [a, ABN[a]]), make: a => ({ checkDis: [a], saveDis: [a], note: `Disadvantage on ${ABN[a]} checks and saves` }), label: a => ABN[a] }],
  ['rayenf', 'Ray of Enfeeblement', 'From an enemy', 10, { note: 'Your STR-based weapon attacks deal half damage' }],
  ['heatmetal', 'Heat Metal', 'From an enemy', 10, { note: 'Fire damage each turn while holding or wearing the metal; disadvantage on attacks and checks if you keep holding it' }]
];
// The picker shows just the common ones, alphabetically, as buffs and debuffs.
const EXT_SHOW = ['aid', 'aurapro', 'bardic', 'barkskin', 'bless', 'enhance', 'fly', 'ginvis', 'guidance', 'haste', 'heroism', 'longstrider', 'magearmor', 'magicweapon', 'protenergy', 'shieldfaith', 'wardingbond', 'bane', 'curse', 'faerie', 'hex', 'slow'];
const EXT_GROUPS = [['Buffs', d => d[2] !== 'From an enemy'], ['Debuffs', d => d[2] === 'From an enemy']];
const extOn = k => (S.effects || []).find(e => e.xkey === k);
function addExtFx(k, v) {
  const d = EXT_FX.find(x => x[0] === k); if (!d) return; const [, name, group, rounds, buff, x = {}] = d;
  const on = extOn(k); if (on) { S.effects = S.effects.filter(e => e !== on); if (on.maxHp) S.hp.cur = Math.min(N(S.hp.cur), maxHp()); pendingLabel = 'End ' + on.name; save(); render(); openExtFx(); return; }
  if (x.pick && v == null) { UI.extPick = UI.extPick === k ? '' : k; openExtFx(); return; }
  const nm = name + (x.label && v != null ? ' (' + x.label(v) + ')' : ''), b = Object.assign({}, buff, x.make ? x.make(v) : {});
  const e = { name: nm, xkey: k, rounds, buff: b, from: group === 'From an enemy' ? 'enemy' : 'ally' };
  if (x.hp) { e.maxHp = x.hp(v); S.hp.cur = N(S.hp.cur) + e.maxHp; }
  if (x.repeat) e.repeat = x.repeat(v);
  S.effects = (S.effects || []).filter(f => f.name !== nm).concat([e]); UI.extPick = '';
  pendingLabel = nm + ' on you'; save(); render(); openExtFx();
}
function openExtFx() {
  const n = (S.effects || []).filter(e => e.xkey).length, list = EXT_FX.filter(d => EXT_SHOW.includes(d[0])).sort((a, b) => a[1].localeCompare(b[1]));
  const chip = d => { const [k, name, , , , x = {}] = d, on = !!extOn(k);
    return `<button class="cchip2${on ? ' on' : ''}${UI.extPick === k ? ' picking' : ''}" data-act="extfx" data-k="${k}" aria-pressed="${on}" title="${esc(on ? 'Tap to end it' : x.why || fxTip({ buff: Object.assign({}, d[4]) }) || name)}">${esc(on ? extOn(k).name : name)}${x.pick && !on ? '<span class="cc-more">▾</span>' : ''}</button>`; };
  const pickRow = ds => { const d = ds.find(x => x[0] === UI.extPick); if (!d) return '';
    return `<div class="xpick"><span class="xpick-l">${esc(d[1])}:</span>${d[5].pick.map(([v, t]) => `<button class="btn sm" data-act="extfxgo" data-k="${d[0]}" data-v="${esc(v)}">${esc(t)}</button>`).join('')}</div>`; };
  const html = `<div id="condmodal" class="extfxm"><div class="sethead"><h3>Effects on you</h3>${n ? `<span class="cm-count on">${n} on</span>` : ''}<span class="grow"></span><button class="btn sm gold" data-act="close">Done</button></div>
    <p class="hint" style="margin:0 0 4px">Tap a spell someone cast on you. Tap it again to end it.</p>
    ${EXT_GROUPS.map(([g, f]) => { const ds = list.filter(f); return `<div class="cm2-lbl">${g}</div><div class="cchips2">${ds.map(chip).join('')}</div>${pickRow(ds)}`; }).join('')}
  </div>`;
  if ($('#condmodal.extfxm') && $('#modal').classList.contains('open')) $('#modal-body').innerHTML = html; else openModal(html);
}
