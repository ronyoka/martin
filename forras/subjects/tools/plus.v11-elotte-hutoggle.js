/* Martin Plus: Mai küldetés, szókártyák (Leitner), játékok, spelling / matek-generátor, kiejtés, próbadolgozat, jutalmak, szülői nézet.
   Egyetlen közös modul: a Claude Design oldal (Main.dc.html) és az offline önálló HTML is ezt tölti be.
   Használat: Plus.init(cfg) majd Plus.mount(elem, host). cfg: {subj, lang, langName, data:{...plus_data.json}, xAudio:{lang:url}, xMode:'ctx'|'el', kitty:{idle,happy,sad}}
   host: {D (az oldal adata), speak(lang,key,text,then), stop(), goUnit(uid), openConcept(uid,cid), sfxGood(), sfxBad(), ctx()} */
(function (root) {
  'use strict';
  const Plus = {}; let C = null, H = null, el = null, P = null, X = null, ST = { view: 'home' }, tok = 0, timerIv = null, saveT = null;
  const MG = root.MathGen;
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, '').replace(/\s+/g, ' ').trim();
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; };
  const pickN = (a, n) => shuffle(a).slice(0, n);
  // ---- választható kérdésszám (Robert 2026-11-05): mindenütt 10/20/50/100, alapból 50; minden kör véletlenszerű
  const QN_OPTS = [10, 20, 50, 100];
  function QN() { return (P && P.qn) || 50; }
  function cyc(list, n) { let out = []; if (!list.length) return out; while (out.length < n) out = out.concat(shuffle(list)); return out.slice(0, n); }
  function qnChips() { return '<div class="px-chips"><span class="px-sub" style="font-weight:800">' + esc(hu('qn_label')) + '</span>' + QN_OPTS.map(n => '<button type="button" class="chip' + (QN() === n ? ' on' : '') + '" data-a="qn" data-n="' + n + '">' + n + '</button>').join('') + '</div>'; }
  function lqConv(q, unit) { return { kind: 'choice', part: 'lq', unit: unit, page: q.page, rec: { type: 'lq', id: (q.lesson || '') + ':' + q.q_es.slice(0, 40), label: q.q_es, hu: q.q_hu, unit: unit }, prompt: null, big: q.q_es, small: q.q_hu,
    audio: q.auto ? [{ l: C.lang, k: q.sayEs[0] || 'lq', t: q.sayEs[1] }] : [{ l: C.lang, k: q.sayEs[0] || 'lq', t: q.sayEs[1] }, { l: 'hu', k: q.sayHu[0] || 'lq', t: q.sayHu[1] }], hearOnly: !!q.auto,
    answer: q.answer, options: q.options.map((o, i) => ({ v: i, label: o })), explain: q.explain, quizPage: q.page }; }
  function lqFor(units) { if (typeof LQ === 'undefined' || !H.D.words) return []; let out = []; units.forEach(u => { try { out = out.concat(LQ.build(H.D, C.lang, u).map(q => lqConv(q, u))); } catch (e) { } }); return shuffle(out); }
  // alap-kérdések + leckekvíz-kérdések → n darab, véletlen sorrendben (a hibajavító kérdések elöl)
  function fillTo(base, units, n) { const fix = base.filter(q => q.fix), rest = base.filter(q => !q.fix); let out = rest.slice(); const lq = lqFor(units); let i = 0;
    while (out.length < n - fix.length && i < lq.length) out.push(lq[i++]);
    if (out.length < n - fix.length) { const p = poolFor(units).length >= 4 ? poolFor(units) : pool(); const modes = ['hear', 'tr', 'see']; let k = 0; while (out.length < n - fix.length && p.length && k < n * 3) { const w = p[Math.floor(Math.random() * p.length)]; out.push(vocabQ(w, modes[k % 3], p)); k++; } }
    return fix.concat(shuffle(out).slice(0, Math.max(0, n - fix.length))); }
  const ymd = d => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const parseYmd = s => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const dayDiff = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 864e5);
  const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
  const today = () => (Plus.fakeToday || ymd());
  const ICO = {
    spk: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
    star: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 6.9 7.5.7-5.7 5 1.8 7.4L12 18l-6.6 4 1.8-7.4-5.7-5 7.5-.7z" fill="#F7C948" stroke="#B8860B" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    flame: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 3-7 1 1 1 2 2 3 1-2 1-5 1-8z" fill="#F2891F" stroke="#B85A12" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    home: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/></svg>',
    mic: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></svg>',
    ok: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg>',
    no: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    next: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    link: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/></svg>'
  };
  // ================= szövegek (i18n) =================
  function S(k) { const o = X.i18n[k]; if (!o) { if (root.console) console.warn('hiányzó szöveg:', k); return { hu: k, l: '' }; } return { hu: o.hu, l: o[C.lang] || '' }; }
  function bi(k, cls) { const s = S(k); return '<span class="hu">' + esc(s.hu) + '</span>' + (s.l ? '<span class="lg">' + esc(s.l) + '</span>' : ''); }
  function hu(k) { return S(k).hu; }
  // ================= tárolás (db -> localStorage -> memória) =================
  function defP() { return { v: 1, u: 0, stars: 0, spent: 0, owned: [], worn: {}, streak: { last: '', n: 0, best: 0 }, days: {}, box: {}, miss: {}, tests: [], gen: {}, unit: 'auto', mission: {}, sp: {}, name: 'Martin' }; }
  const Store = {
    key: () => 'plus_' + C.subj, mode: 'memória', db: null,
    readLocal() { try { const s = root.localStorage.getItem(Store.key()); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
    writeLocal() { try { root.localStorage.setItem(Store.key(), JSON.stringify(P)); Store.mode = 'ez az eszköz (localStorage)'; return true; } catch (e) { return false; } },
    async connect() {
      try {
        if (!root.claude || !root.claude.use) return;
        const db = await Promise.race([root.claude.use('db'), new Promise(r => setTimeout(() => r(null), 4000))]);
        if (!db) return; Store.db = db.doc('progress/martin_' + C.subj);
        const snap = await Store.db.get(); const d = snap && snap.exists ? snap.data() : null;
        if (d && d.p) { const remote = JSON.parse(d.p); if (!P.u || (remote.u || 0) > P.u) { P = Object.assign(defP(), remote); Store.writeLocal(); render(); } }
        Store.mode = 'felhő (artifact adatbázis)'; if (P.u) Store.push();
      } catch (e) { Store.db = null; }
    },
    push() { if (!Store.db) return; Store.db.set({ p: JSON.stringify(P), u: P.u }).then(() => { Store.mode = 'felhő (artifact adatbázis)'; }).catch(() => { Store.db = null; }); },
    save() { P.u = Date.now(); clearTimeout(saveT); saveT = setTimeout(() => { Store.writeLocal(); Store.push(); }, 600); }
  };
  // ================= V5: közös (tantárgyakon átívelő) adatok =================
  const SUBJS = ['en', 'mat', 'lengua', 'cs', 'ns', 'ac'];
  function allP() { const o = {}; SUBJS.forEach(sj => { if (sj === C.subj) { o[sj] = P; return; } try { const v = root.localStorage.getItem('plus_' + sj); if (v) o[sj] = JSON.parse(v); } catch (e) { } }); if (!o[C.subj]) o[C.subj] = P; return o; }
  function hubRead() { try { return JSON.parse(root.localStorage.getItem('martin_hub') || '{}') || {}; } catch (e) { return {}; } }
  function totalStars() { let n = 0; Object.values(allP()).forEach(q => { n += (q && q.stars) || 0; }); const hb = hubRead(); Object.values(hb.bonus || {}).forEach(v => { n += v || 0; }); return n; }
  function rewardBal() { const hb = hubRead(); return totalStars() - (hb.redeemed || []).reduce((a, r) => a + (r.cost || 0), 0); }
  function activeDays() { const o = {}; Object.values(allP()).forEach(q => { if (!q) return; Object.keys(q.days || {}).forEach(d => { if ((q.days[d].items || 0) > 0) o[d] = 1; }); Object.keys(q.mission || {}).forEach(d => { o[d] = 1; }); }); return o; }
  function globalStreak() { // egymást követő aktív napok; hetente 1 kihagyott nap (pihenőnap) nem szakítja meg
    const a = activeDays(); let d = today(); if (!a[d]) d = addDays(d, -1); let n = 0, lastFree = null, used = false;
    for (let i = 0; i < 400; i++) { if (a[d]) n++; else if (n > 0 && (lastFree === null || dayDiff(d, lastFree) >= 7) && a[addDays(d, -1)]) { lastFree = d; used = used || dayDiff(d, today()) <= 7; } else break; d = addDays(d, -1); }
    return { n, rest: used };
  }
  function carSvg(col, w) { w = w || 56; return '<svg viewBox="0 0 64 36" width="' + w + '" height="' + Math.round(w * 36 / 64) + '" aria-hidden="true"><path d="M30 8 V2" stroke="#333" stroke-width="2"/><circle cx="30" cy="2" r="2" fill="#E86A7A"/><path d="M5 24 q2 -12 14 -12 h17 q8 0 12 8 l8 2 q4 1 4 6 v3 H5z" fill="' + col + '" stroke="#1E2A38" stroke-width="2" stroke-linejoin="round"/><path d="M22 14 h12 l6 6 H20z" fill="#BFE3F7" stroke="#1E2A38" stroke-width="1.5"/><circle cx="17" cy="29" r="6" fill="#333"/><circle cx="17" cy="29" r="2.5" fill="#ccc"/><circle cx="48" cy="29" r="6" fill="#333"/><circle cx="48" cy="29" r="2.5" fill="#ccc"/></svg>'; }
  function subjTitle() { return (H && H.D && H.D.title) || (document.title || '').replace(/\s*[–-]\s*Martin.*$/, ''); }
  // ---- felkészültség (0–100) a következő eseményre: szókártya-dobozok + legjobb próbaverseny
  function readiness(ev) {
    const units = ev && ev.units && ev.units.length ? ev.units : fallbackUnits(); const p = poolFor(units);
    let w = 0; p.forEach(x => { w += Math.min(boxOf(x.id), 3) / 3; }); const wm = p.length ? w / p.length : 0;
    const ts = P.tests.filter(t => (t.units || [t.unit]).some(u => units.indexOf(u) >= 0)).slice(-6); const tb = ts.length ? Math.max.apply(null, ts.map(t => t.score / (t.total || 1))) : 0;
    const tk = tasksAll().filter(t => units.indexOf(t.unit) >= 0); let tkm = null; if (tk.length) { let ok = 0; tk.forEach(t => { const m = P.miss['tk:' + t.id]; if (P.tkok && P.tkok[t.id] && !(m && (m.ok || 0) < 1)) ok++; }); tkm = ok / tk.length; }
    let pct = ts.length ? 0.5 * wm + 0.5 * tb : 0.8 * wm; if (tkm !== null) pct = 0.8 * pct + 0.2 * tkm;
    return Math.max(0, Math.min(100, Math.round(pct * 100)));
  }
  function readyHtml(ev) {
    const pct = readiness(ev); const k = pct < 40 ? 'ready_low' : pct < 80 ? 'ready_mid' : 'ready_high'; const col = pct < 40 ? '#E86A7A' : pct < 80 ? '#F2A65A' : '#6BBF59';
    if (ev && (!P.readyNext || P.readyNext.id !== ev.id || P.readyNext.pct !== pct)) { P.readyNext = { id: ev.id, date: ev.date, pct, title_hu: ev.title_hu, type: ev.type }; Store.save(); }
    return '<div class="px-ready"><div class="px-ready-top"><b>' + esc(hu('ready_title')) + '</b><span class="px-ready-pct">' + pct + '%</span></div><div class="px-meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="' + esc(hu('ready_title')) + '"><i style="width:' + pct + '%;background:' + col + '"></i><span class="px-meter-car" style="left:calc(' + pct + '% - ' + Math.round(pct * 0.44) + 'px)">' + carSvg('#3B82C4', 44) + '</span></div><small>' + esc(hu(k)) + '</small></div>';
  }
  // ---- valódi jutalmak (a nyitóoldalon a szülő állítja be; itt csak mutatjuk)
  function rewardHtml() {
    const hb = hubRead(); const rw = (hb.rewards || []).filter(r => r && r.name && r.cost > 0); if (!rw.length) return '';
    const bal = rewardBal(); const ready = rw.filter(r => r.cost <= bal); const nx = rw.filter(r => r.cost > bal).sort((a, b) => a.cost - b.cost)[0];
    let h = '<div class="px-card px-reward">';
    if (ready.length) h += '<p class="px-reward-ready">' + ICO.star + ' <b>' + esc(hu('reward_ready')) + '</b> ' + ready.map(r => esc(r.name)).join(', ') + '</p>';
    if (nx) { const pc = Math.round(Math.min(1, bal / nx.cost) * 100); h += '<div class="px-ready-top"><b>' + esc(hu('reward_next')) + ': ' + esc(nx.name) + '</b><span>' + Math.max(0, bal) + ' / ' + nx.cost + ' ' + ICO.star + '</span></div><div class="px-meter"><i style="width:' + pc + '%;background:#F7C948"></i></div><small>' + esc(hu('reward_left')) + ' <b>' + (nx.cost - Math.max(0, bal)) + '</b></small>'; }
    return h + '</div>';
  }
  // ---- matricák (a szókártya 3. dobozától)
  function stickerPool() { return pool().filter(w => w.icon); }
  function hasSticker(id) { return boxOf(id) >= 3 || !!(P.stk && P.stk[id]); }
  function stickerToast(w) { try { const f = document.createElement('div'); f.className = 'px-stk-toast'; f.innerHTML = '<div class="ic">' + w.icon + '</div><b>' + esc(hu('stk_new')) + '</b><span>' + esc(w.es) + '</span>'; (el || document.body).appendChild(f); setTimeout(() => f.remove(), 2600); H.sfxGood && H.sfxGood(); } catch (e) { } }
  // ---- hibák javítása elöl (a Mai küldetés elején)
  function qFromMiss(k, m) {
    const i = k.indexOf(':'); const type = k.slice(0, i), id = k.slice(i + 1);
    try {
      if (type === 'w') { const w = pool().find(x => x.id === id); if (w) { const pp = poolFor([w.unit]); return vocabQ(w, 'tr', pp.length > 3 ? pp : pool()); } }
      if (type === 'q') { const q = H.D.quiz.find(x => 'q' + x.i === id); if (q) return quizQ(q); }
      if (type === 'sp') { const o = weeks().flatMap(w => w.words.map(y => ({ y, u: w.unit }))).find(o2 => o2.y.w === id); if (o && X.xsprite[C.lang]['x:sp:' + o.y.w]) return spellQ(o.y, o.u); }
      if (type === 'pg') { const o = pgItem(id); if (o) return pgQ(o.p, o.t, o.it, true); }
      if (type === 'tk') { const t = tasksAll().find(x => x.id === id); if (t) return taskQ(t); }
      if (type === 'dc') { for (const u of unitsList()) { const x = dictWords(u).find(y => norm(y.w) === id); if (x) return dictQ(x, u); } }
      if (type === 'mq' && root.MQ) { const pr = id.split(':'); return mqMake(pr[0], +pr[1], +pr[2]); }
      if (type === 'g') { const topic = id.split(':')[0]; if (MG && MG.TOPICS.indexOf(topic) >= 0) return genQ(topic, level(topic)); }
    } catch (e) { }
    return null;
  }
  function fixQs(n) {
    const t = today(); const out = [];
    Object.keys(P.miss).map(k => ({ k, m: P.miss[k] })).filter(o => (o.m.ok || 0) < 2 && o.m.last && dayDiff(o.m.last, t) <= 10)
      .sort((a, b) => (b.m.last > a.m.last ? 1 : b.m.last < a.m.last ? -1 : 0) || b.m.n - a.m.n)
      .forEach(o => { if (out.length >= n) return; const q = qFromMiss(o.k, o.m); if (q) { q.fix = true; out.push(q); } });
    return out;
  }
  // ================= haladás =================
  let lastAct = 0;
  function touch() { const n = Date.now(); const d = dayRec(); if (lastAct && n - lastAct < 30000) d.sec += Math.round((n - lastAct) / 1000); else d.sec += 3; lastAct = n; }
  function dayRec() { const t = today(); if (!P.days[t]) P.days[t] = { sec: 0, items: 0, ok: 0, stars: 0 }; return P.days[t]; }
  function markActive() { const t = today(); if (P.streak.last === t) return; P.streak.n = (P.streak.last === addDays(t, -1)) ? P.streak.n + 1 : 1; P.streak.last = t; P.streak.best = Math.max(P.streak.best, P.streak.n); }
  function award(n) { if (!n) return; P.stars += n; dayRec().stars += n; Store.save(); flash('+' + n); }
  function flash(t) { try { const f = document.createElement('div'); f.className = 'px-float'; f.innerHTML = esc(t) + ' ' + ICO.star; (el || document.body).appendChild(f); setTimeout(() => f.remove(), 1400); } catch (e) { } }
  function record(r, ok) { // r: {type,id,label,hu,unit}
    const d = dayRec(); d.items++; if (ok) d.ok++; markActive();
    if (!ok && r) { const k = r.type + ':' + r.id; const m = P.miss[k] || (P.miss[k] = { n: 0, type: r.type, label: r.label, hu: r.hu || '', unit: r.unit || '' }); m.n++; m.last = today(); }
    if (ok && r && P.miss[r.type + ':' + r.id]) { const m = P.miss[r.type + ':' + r.id]; m.ok = (m.ok || 0) + 1; }
    try { goldTrack(r, ok); } catch (e) { }
    Store.save();
  }
  // ================= hang =================
  const xbuf = {}, xel = {}; let xsrc = null, xctx = null, xcur = null, xtimer = null;
  function xEnsure() {
    if (C.xMode === 'ctx') {
      try { xctx = (H.ctx && H.ctx()) || xctx || new (root.AudioContext || root.webkitAudioContext)(); if (xctx.state === 'suspended') xctx.resume(); } catch (e) { }
      Object.keys(C.xAudio).forEach(l => { if (!xbuf[l] && xctx && !xbuf['_p' + l]) { xbuf['_p' + l] = 1; fetch(C.xAudio[l]).then(r => r.arrayBuffer()).then(ab => xctx.decodeAudioData(ab)).then(b => { xbuf[l] = b; }).catch(() => { xbuf['_p' + l] = 0; }); } });
    } else Object.keys(C.xAudio).forEach(l => { if (!xel[l]) { const a = new Audio(C.xAudio[l]); a.preload = 'auto'; xel[l] = a; } });
  }
  function segOf(lang, key) { if (key.indexOf('p:') === 0) return pgSeg(lang, key); if (key.indexOf('x:') === 0 || key.indexOf('n:') === 0) return X.xsprite[lang] && X.xsprite[lang][key]; return H.D.sprite[lang] && H.D.sprite[lang][key]; }
  function xplay(lang, key, text, done) {
    const seg = X.xsprite[lang] && X.xsprite[lang][key];
    if (C.xMode === 'ctx' && xctx && xbuf[lang] && seg) {
      try { const s = xctx.createBufferSource(); s.buffer = xbuf[lang]; s.connect(xctx.destination); s.start(0, seg[0], seg[1] + 0.1); xsrc = s; s.onended = () => { if (xsrc === s) xsrc = null; done(); }; return; } catch (e) { }
    }
    if (C.xMode === 'el' && xel[lang] && seg) {
      const a = xel[lang]; const stopAt = seg[0] + seg[1] + 0.1; xcur = a;
      const go = () => { try { a.currentTime = seg[0]; a.play().catch(() => { }); } catch (e) { } const tick = () => { if (xcur !== a) return; if (a.currentTime >= stopAt || (a.paused && a.currentTime > seg[0] + 0.3)) { a.pause(); xcur = null; done(); } else xtimer = setTimeout(tick, 50); }; xtimer = setTimeout(tick, 50); };
      if (a.readyState >= 1) go(); else { a.addEventListener('loadedmetadata', go, { once: true }); a.load(); } return;
    }
    if (root.speechSynthesis && text) { try { const u = new SpeechSynthesisUtterance(text); u.lang = lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-GB' : 'hu-HU'; u.onend = () => done(); u.onerror = () => done(); root.speechSynthesis.speak(u); return; } catch (e) { } }
    setTimeout(done, 300);
  }
  function stopX() { if (xsrc) { try { xsrc.stop(); } catch (e) { } xsrc = null; } if (xcur) { try { xcur.pause(); } catch (e) { } xcur = null; } clearTimeout(xtimer); }
  function stopAll() { tok++; stopX(); try { H.stop(); } catch (e) { } if (root.speechSynthesis) { try { root.speechSynthesis.cancel(); } catch (e) { } } }
  function playOne(it, done) { const k = it.k; if (k.indexOf('p:') === 0) { pgPlay(it.l, k, it.t, done); return; } if (k.indexOf('x:') === 0 || k.indexOf('n:') === 0) xplay(it.l, k, it.t, done); else H.speak(it.l, k, it.t, done); }
  function say(items, then) { // items: [{l,k,t}]
    stopAll(); xEnsure(); const my = ++tok; let i = 0;
    const next = () => { if (my !== tok) return; if (i >= items.length) { if (then) then(); return; } const it = items[i++]; let fired = false; const seg = segOf(it.l, it.k);
      const fin = () => { if (fired || my !== tok) return; fired = true; setTimeout(next, it.gap == null ? 60 : it.gap); };
      playOne(it, fin); setTimeout(fin, ((seg ? seg[1] : 3) + 2.5) * 1000); };
    next();
  }
  const sx = (k, lang) => ({ l: lang || 'hu', k: 'x:' + k, t: lang && lang !== 'hu' ? S(k).l : S(k).hu });
  function sayK(k, then) { const s = S(k); const it = [sx(k)]; if (s.l) it.push(sx(k, C.lang)); say(it, then); }          // magyarul, majd a tantárgy nyelvén
  function sayHu(k, then) { say([sx(k)], then); }
  function sayCountdown(ev) { const n = ev._days; const it = [];
    if (n === 0) it.push(sx('cd_today')); else if (n === 1) it.push(sx('cd_tomorrow')); else if (n > 0 && n < 100) { it.push(sx('cd_prefix')); it.push({ l: 'hu', k: 'n:' + n, t: String(n) }); it.push(sx('cd_days')); }
    it.push({ l: 'hu', k: 'x:ev:' + (ev.rid || ev.id) + ':h', t: ev.title_hu }); say(it); }
  function sayEvent(ev) { say([{ l: C.lang, k: 'x:ev:' + (ev.rid || ev.id) + ':t', t: ev.title }, { l: 'hu', k: 'x:ev:' + (ev.rid || ev.id) + ':h', t: ev.title_hu }]); }
  function sayTask(t, both) { const mk = l => t.say[l].map(k => ({ l, k, t: '', gap: 30 })); say(both === false ? mk('es') : mk('es').concat(mk('hu'))); }
  // ================= szókincs, események =================
  let _pool = null;
  function iconOf(gi) { return X.icons[gi] || null; }
  function pool() {
    if (_pool) return _pool; const D = H.D; const out = [];
    D.glossary.forEach(g => { const e = g.es.replace(/\s*\([^)]*\)/g, '').trim(); const wc = e.split(/\s+/).length;
      if (e.length > 26 || wc > 3 || /\d/.test(e) || /[?…!]/.test(e) || /^\w+, /.test(e) || /,/.test(e)) return;
      out.push({ id: 'g:' + g.i, i: g.i, es: g.es, hu: g.hu, unit: g.unit, page: g.page, icon: iconOf(g.i) }); });
    return (_pool = out);
  }
  function unitsList() { return H.D.units.map(u => u.id); }
  // utolsó tanult fejezet(ek): schedule.default_units, különben az utolsó 2 olyan fejezet, ahol már van párbeszéd
  function fallbackUnits() { const all = unitsList(); const du = ((X.schedule && X.schedule.default_units) || []).filter(u => all.indexOf(u) >= 0); if (du.length) return du;
    const st = H.D.units.filter(u => u.concepts.some(c => (c.dialogue || []).length)).map(u => u.id); return st.length ? st.slice(-2) : all.slice(0, 2); }
  function extraKind() { return C.subj === 'en' ? 'spelling' : C.subj === 'mat' ? (root.MQ ? null : 'gen') : C.subj === 'lengua' ? 'dictado' : (['cs', 'ns', 'ac'].indexOf(C.subj) >= 0 && tasksAll().length) ? 'tasks' : null; }
  function tasksAll() { return (X.tasks && X.tasks.tasks) || []; }
  function events() {
    const sc = X.schedule, out = (sc.events || []).map(e => Object.assign({}, e)); const t = today();
    (sc.recurring || []).forEach(r => { let d = addDays(r.after || t, 1); let n = 0; const wk = x => { const g = parseYmd(x).getDay(); return g === 0 ? 7 : g; };
      while (n < 10) { if (wk(d) === r.weekday && !out.some(e => e.date === d)) { out.push({ id: r.id + '-' + d, date: d, type: r.type, title: r.title, title_hu: r.title_hu, units: r.units || [], spelling_week: r.spelling_week, link_ids: r.link_ids || [], virtual: true, rid: r.id }); n++; } d = addDays(d, 1); if (d > addDays(t, 120)) break; } });
    out.forEach(e => { e._days = dayDiff(t, e.date); }); out.sort((a, b) => a.date < b.date ? -1 : 1); return out;
  }
  function nextEvent() { return events().find(e => e._days >= 0) || null; }
  function weeks() { return (X.spelling && X.spelling.weeks) || []; }
  function weekFor(ev) { const ws = weeks(); if (!ws.length) return null; if (ev && ev.spelling_week) { const w = ws.find(x => x.id === ev.spelling_week); if (w) return w; }
    if (ev) { const w = ws.find(x => x.test_date === ev.date); if (w) return w; }
    const t = today(); const up = ws.filter(x => x.test_date && x.test_date >= t).sort((a, b) => a.test_date < b.test_date ? -1 : 1); return up[0] || ws.filter(x => x.test_date).slice(-1)[0] || ws[ws.length - 1]; }
  function linksFor(unit, ev) { const L = (X.links && X.links.items) || []; let list;
    if (ev && ev.link_ids && ev.link_ids.length) list = ev.link_ids.map(id => L.find(l => l.id === id)).filter(Boolean); else list = L.filter(l => (l.units || []).indexOf(unit) >= 0);
    return list.map(l => ({ title: l.title, hu: l.title_hu, kind: l.kind, url: l.url ? l.url : l.folder ? 'https://drive.google.com/drive/folders/' + l.folder : 'https://drive.google.com/file/d/' + l.drive + '/view' })); }
  Plus.linksFor = (unit) => { const L = (X.links && X.links.items) || []; return L.filter(l => (l.units || []).indexOf(unit) >= 0 || l.global).map(l => ({ title: l.title, hu: l.title_hu, kind: l.kind, url: l.url ? l.url : l.folder ? 'https://drive.google.com/drive/folders/' + l.folder : 'https://drive.google.com/file/d/' + l.drive + '/view' })); };
  function conceptFor(unit, page) { const u = H.D.units.find(x => x.id === unit); if (!u) return null; const m = /(\d+)/.exec(String(page || '')); const n = m ? +m[1] : null;
    if (n != null) for (const c of u.concepts) { const r = String(c.pages).match(/\d+/g); if (r) { const a = +r[0], b = +r[r.length - 1]; if (n >= a && n <= b) return c; } } return u.concepts[0] || null; }
  function activeUnits() { if (ST.units && ST.units.length) return ST.units; if (P.unit && P.unit !== 'auto' && P.unit !== 'all') return [P.unit]; if (P.unit === 'all') return unitsList(); const ev = nextEvent(); return ev && ev.units && ev.units.length ? ev.units : fallbackUnits(); }
  function dedupIcons(p) { const seen = {}; return shuffle(p).filter(w => { if (!w.icon) return true; if (seen[w.icon]) return false; seen[w.icon] = 1; return true; }); }
  function poolFor(units, needIcon) { let p = pool().filter(w => units.indexOf(w.unit) >= 0); if (needIcon) p = p.filter(w => w.icon); return p; }
  // ================= Leitner =================
  const INTERVAL = [0, 0, 1, 3, 7, 14];
  function boxOf(id) { return (P.box[id] && P.box[id].b) || 0; }
  function dueNow(id) { const b = P.box[id]; return !b || b.due <= today(); }
  function pickCards(units, n) {
    const p = poolFor(units); const due = p.filter(w => dueNow(w.id)); const fresh = shuffle(due.filter(w => !P.box[w.id])), old = due.filter(w => P.box[w.id]).sort((a, b) => boxOf(a.id) - boxOf(b.id) || Math.random() - .5);
    let out = old.slice(0, Math.ceil(n * 0.6)).concat(fresh); out = out.slice(0, n);
    if (out.length < n) out = out.concat(shuffle(p.filter(w => out.indexOf(w) < 0)).slice(0, n - out.length));
    return shuffle(out);
  }
  function gradeCard(id, ok) { const cur = boxOf(id); const b = ok ? Math.min(5, cur + 1) : 1; P.box[id] = { b, due: addDays(today(), INTERVAL[b]) };
    if (ok && b >= 3) { P.stk = P.stk || {}; if (!P.stk[id]) { P.stk[id] = today(); const w = pool().find(x => x.id === id); if (w && w.icon) setTimeout(() => stickerToast(w), 250); } }
    Store.save(); }
  // ================= kérdés-építők =================
  function wordItems(w) { return [{ l: C.lang, k: w.id, t: w.es }, { l: 'hu', k: w.id, t: w.hu }]; }
  function vocabQ(w, mode, ppool) {
    const others = shuffle(ppool.filter(x => x.id !== w.id && x.hu !== w.hu && x.es !== w.es && !(x.icon && x.icon === w.icon))).slice(0, 2);
    const opts = shuffle([w].concat(others)); const rec = { type: 'w', id: w.id, label: w.es, hu: w.hu, unit: w.unit };
    if (mode === 'hear') return { kind: 'choice', part: 'vocab', unit: w.unit, page: w.page, rec, prompt: 'q_hear', audio: [{ l: C.lang, k: w.id, t: w.es }], hearOnly: true, answer: w.id,
      options: opts.map(o => ({ v: o.id, label: o.es, sub: '', say: [{ l: C.lang, k: o.id, t: o.es }] })), explain: w.es + ' = ' + w.hu, reveal: wordItems(w) };
    if (mode === 'tr') return { kind: 'choice', part: 'vocab', unit: w.unit, page: w.page, rec, prompt: 'q_find', big: w.hu, audio: [{ l: 'hu', k: w.id, t: w.hu }], answer: w.id,
      options: opts.map(o => ({ v: o.id, label: o.es, say: [{ l: C.lang, k: o.id, t: o.es }] })), explain: w.es + ' = ' + w.hu, reveal: wordItems(w) };
    return { kind: 'choice', part: 'vocab', unit: w.unit, page: w.page, rec, prompt: 'q_meaning', big: w.es, audio: [{ l: C.lang, k: w.id, t: w.es }], answer: w.id,
      options: opts.map(o => ({ v: o.id, label: o.hu, say: [{ l: 'hu', k: o.id, t: o.hu }] })), explain: w.es + ' = ' + w.hu, reveal: wordItems(w) };
  }
  // ---- válaszlehetőségek felolvasása (Robert 2026-11-07: „a választások szövegét is fel lehessen olvasni”)
  let _osIdx = null;
  function osIndex() { if (_osIdx) return _osIdx; const m = {}; const n = s => String(s || '').toLowerCase().replace(/[✔✘]/g, '').replace(/\s*\([^)]*\)/g, '').trim();
    (H.D.glossary || []).forEach(g => { if (!m[n(g.es)]) m[n(g.es)] = { l: C.lang, k: 'g:' + g.i }; if (!m['hu|' + n(g.hu)]) m['hu|' + n(g.hu)] = { l: 'hu', k: 'g:' + g.i }; });
    const W = H.D.words || {}; Object.keys(W).forEach(w => { if (!m[n(w)]) m[n(w)] = { l: C.lang, k: 'w:' + w }; const h = n(String(W[w]).split(/[,;/]/)[0]); if (h && !m['hu|' + h]) m['hu|' + h] = { l: 'hu', k: 'w:' + w }; });
    return (_osIdx = m); }
  function looksHu(t) { return /[őűŐŰ]|[öüÖÜ]|\b(a|az|egy|és|nem|van|igen|igaz|hamis|melyik|hány|mint|vagy|ezres|százas|tízes|egyes)\b/i.test(t); }
  function optSay(o) { if (o.say && o.say.length) return o.say; const n = s => String(s || '').toLowerCase().replace(/[✔✘]/g, '').replace(/\s*\([^)]*\)/g, '').trim(); const I = osIndex(); const lab = String(o.label || '');
    const one = (t, prefHu) => { const k = n(t); const hit = (prefHu ? I['hu|' + k] || I[k] : I[k] || I['hu|' + k]); if (hit) return { l: hit.l, k: hit.k, t: t }; return { l: (prefHu || looksHu(t)) ? 'hu' : C.lang, k: 'x:?' + k.slice(0, 20), t: t.replace(/[✔✘]/g, '') }; };
    const out = [one(lab, looksHu(lab))]; if (o.sm && o.sm !== lab) out.push(one(o.sm, true)); else if (o.es && o.hu) { out.push(one(o.es, false)); out.push(one(o.hu, true)); } return out.map(x => Object.assign(x, { gap: 150 })); }
  function quizQ(q) { return { kind: 'choice', part: 'quiz', unit: q.unit, page: q.page, rec: { type: 'q', id: 'q' + q.i, label: q.q_es, hu: q.q_hu, unit: q.unit }, prompt: null, big: q.q_es, small: q.q_hu,
    audio: [{ l: C.lang, k: 'q:' + q.i, t: q.q_es }, { l: 'hu', k: 'q:' + q.i, t: q.q_hu }], answer: q.answer, options: q.options.map((o, i) => ({ v: i, label: o })), explain: q.explain, quizPage: q.page }; }
  function spellQ(w, unit) { return { kind: 'type', part: 'spell', unit: unit || 'u2', page: '', rec: { type: 'sp', id: w.w, label: w.w, hu: w.hu, unit: unit || '' }, prompt: 'q_write', big: w.hu, audio: [{ l: C.lang, k: 'x:sp:' + w.w, t: w.w }, { l: 'hu', k: 'x:sph:' + w.w, t: w.hu }], answer: w.w, explain: w.w, w }; }
  function genQ(topic, level) { const t = MG.make(topic, level); const q = { kind: t.kind === 'line' ? 'line' : t.kind === 'num' ? 'num' : 'choice', part: 'math', unit: ['mult', 'add', 'factor', 'car'].indexOf(topic) >= 0 ? 'u2' : 'u1', page: '', task: t, topic,
    rec: { type: 'g:' + topic, id: t.text.es, label: t.text.es, hu: t.text.hu, unit: ['mult', 'add', 'factor', 'car'].indexOf(topic) >= 0 ? 'u2' : 'u1' },
    prompt: null, big: t.text.es, small: t.text.hu, audio: null, answer: t.answer, explain: t.explain, options: t.options ? t.options.map(o => ({ v: o.v, label: o.label, es: o.es, hu: o.hu })) : null }; return q; }
  function topicsForUnits(units) { const t = []; if (units.indexOf('u2') >= 0) t.push('mult', 'add', 'factor', 'car'); if (units.indexOf('u1') >= 0) t.push('place', 'compare', 'line', 'round'); return t.length ? t : MG.TOPICS; }
  function level(topic) { return (P.gen[topic] && P.gen[topic].lvl) || 1; }
  function genAdapt(topic, ok) { const g = P.gen[topic] || (P.gen[topic] = { lvl: 1, run: 0, bad: 0, n: 0, ok: 0 }); g.n++; if (ok) { g.ok++; g.run++; g.bad = 0; if (g.run >= 3 && g.lvl < 5) { g.lvl++; g.run = 0; ST.levelUp = topic; } } else { g.bad++; g.run = 0; if (g.bad >= 2 && g.lvl > 1) { g.lvl--; g.bad = 0; } } }
  function pickTopic(units) { const ts = topicsForUnits(units); if (ST.topic && ST.topic !== 'mix' && ts.indexOf(ST.topic) >= 0) return ST.topic; const w = ts.map(t => { const g = P.gen[t]; return (g && g.n > 3) ? 1 + (1 - g.ok / g.n) * 3 : 2; }); let r = Math.random() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < ts.length; i++) { r -= w[i]; if (r <= 0) return ts[i]; } return ts[0]; }
  // ================= futtató (Run): gyakorlás / küldetés / próbadolgozat =================
  function startRun(cfg) { // cfg: {mode, title, qs|gen, back}
    stopAll(); ST.run = Object.assign({ i: 0, ans: null, num: '', typed: '', score: 0, res: [], tries: 0, ok: null, start: Date.now(), flipped: false }, cfg); ST.view = 'run';
    if (cfg.secs) { ST.run.end = Date.now() + cfg.secs * 1000; startTimer(); }
    render({ top: true }); autoAudio(); duelTick();
  }
  function curQ() { const R = ST.run; if (R.gen && !R.qs[R.i]) R.qs[R.i] = R.gen(); return R.qs[R.i]; }
  function autoAudio() { const q = ST.run && curQ(); if (!q) return; if (q.fix && !ST.run.fixSaid && q.audio) { ST.run.fixSaid = 1; say([sx('i_fix')].concat(q.audio)); return; } if (q.kind === 'flash') { say(q.items.slice(0, 1)); return; } if (q.task) { sayTask(q.task); return; } if (q.audio) say(q.audio); }
  function startTimer() { clearInterval(timerIv); timerIv = setInterval(() => { const R = ST.run; if (!R || !R.end || R.done || ST.view !== 'run') { clearInterval(timerIv); return; } const left = Math.max(0, Math.round((R.end - Date.now()) / 1000)); const t = el && el.querySelector('#px-timer'); if (t) t.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'); if (left <= 0) { clearInterval(timerIv); finishRun(true); } }, 500); }
  function answerRun(resp, extra) {
    const R = ST.run, q = curQ(); if (R.ans !== null && R.mode !== 'test') return; touch(); resp = mqNorm(q, resp); clearTimeout(R.autoT);
    if (q.orig) { const r0 = R.res.find(r => r.skip && r.q === q.orig && !r.resolved); if (r0) r0.resolved = true; }
    let ok;
    if (q.kind === 'type') ok = norm(String(resp)) === norm(q.answer) || (q.alts || []).some(a => norm(a) === norm(String(resp))); else ok = String(resp) === String(q.answer);
    if (q.kind === 'type' && !ok && R.tries < 1 && R.mode !== 'test') { R.tries++; R.ok = 'retry'; sayHu('fb_retry'); try { H.sfxBad(); } catch (e) { } ST.mood = 'sad'; render(); return; }
    const dadTurn = R.duel && R.i % 2 === 1; clearInterval(duelIv);
    R.ans = resp; R.ok = ok; if (!R.duel) R.score += ok ? 1 : 0; R.res.push({ q, ok, resp });
    if (R.duel) { R.duel.score[R.i % 2] += ok ? 1 : 0; if (!dadTurn) R.score += ok ? 1 : 0; }
    if (R.boss) { if (ok) { R.boss.hp = Math.max(0, R.boss.hp - 1); R.boss.hit = 1; } else { R.boss.hearts = Math.max(0, R.boss.hearts - 1); R.boss.hit = 0; } }
    if (!dadTurn) record(q.rec, ok); if (q.topic) genAdapt(q.topic, ok); mqTrack(q, ok); if (ok && q.rec && q.rec.type === 'tk') { P.tkok = P.tkok || {}; P.tkok[q.rec.id] = today(); }
    if (R.mode === 'test') { nextRun(); return; }
    const cst = dadTurn ? 0 : comboHit(R, ok); if (ok && !dadTurn) goodFx(R);
    if (R.fast) { try { ok ? H.sfxGood() : H.sfxBad(); } catch (e) { } if (cst) award(cst); if (!ok && q.mq) toast('✘ ' + (q.big || '').replace('?', mqAnsLabel(q)).slice(0, 60)); R.flashOk = ok; nextRun(); return; }
    ST.mood = ok ? 'happy' : 'sad'; try { ok ? H.sfxGood() : H.sfxBad(); } catch (e) { }
    if (cst) award(cst);
    render(); const fb = ok ? pickPraise() : 'fb_bad'; const i0 = R.i;
    if (ok && R.auto) { R.autoT = setTimeout(() => { if (ST.view === 'run' && ST.run === R && R.i === i0 && !R.done) nextRun(); }, 850); return; }
    setTimeout(() => { if (ST.view === 'run' && ST.run === R && R.i === i0) { const it = [sx(fb)]; if (!ok && q.reveal) it.push.apply(it, q.reveal); if (ok && q.kind === 'type') it.push(q.audio[0]); say(it); } }, ok ? 900 : 1200);
  }
  function pickPraise() { return ['fb_ok1', 'fb_ok2', 'fb_ok3', 'fb_ok4'][Math.floor(Math.random() * 4)]; }
  function nextRun() {
    const R = ST.run; ST.mood = 'idle'; ST.levelUp = null;
    let more = R.gen ? (R.i + 1 < (R.limit || 9999)) : (R.i + 1 < R.qs.length);
    if (R.boss && (R.boss.hp <= 0 || R.boss.hearts <= 0)) more = false;
    if (!more && runRequeue(R)) more = true;
    if (!more) { finishRun(false); return; }
    R.i++; R.ans = null; R.ok = null; R.num = ''; R.typed = ''; R.tries = 0; R.mv = null; R.mf = null; R.ord = null; clearTimeout(R.autoT); R.flipped = false; if (R.boss) R.boss.hit = 0; ST.kanim = ''; render({ top: !R.fast }); if (!R.fast) autoAudio(); else { const q2 = curQ(); if (q2 && q2.hearOnly) autoAudio(); } duelTick();
  }
  function finishRun(timeUp) {
    const R = ST.run; clearInterval(timerIv); stopAll(); R.done = true; R.timeUp = !!timeUp; const total = nAns(R) || 1; const pct = R.score / (R.mode === 'test' ? R.qs.length : total);
    ST.mood = pct >= .6 ? 'happy' : 'idle'; let bonus = 0;
    if (R.mode === 'mission') { bonus = 5; P.mission[today()] = true; markActive(); }
    if (R.mode === 'test') { bonus = Math.round(pct * 10); const parts = {}; R.qs.forEach((q, i) => { const r = R.res[i]; const p = parts[q.part] || (parts[q.part] = { n: 0, ok: 0 }); p.n++; if (r && r.ok) p.ok++; });
      P.tests.push({ ts: Date.now(), unit: R.unit, units: R.units || [R.unit], score: R.score, total: R.qs.length, secs: Math.round((Date.now() - R.start) / 1000), parts }); P.tests = P.tests.slice(-30); markActive();
      R.win = pct >= 0.75; if (R.win) { bonus += 5; const cert = { ts: Date.now(), subj: subjTitle(), units: (R.units || [R.unit]).map(unitTitle), pct: Math.round(pct * 100), score: R.score, total: R.qs.length }; P.certs = (P.certs || []).concat([cert]).slice(-20); R.cert = cert; } }
    if (R.mode === 'lesson') { const n = nAns(R) || 1; const pc = Math.round(R.score / n * 100); P.lq = P.lq || {}; const old = P.lq[R.lesson] || 0; const s0 = starsOf(old), s1 = starsOf(pc); if (pc > old) P.lq[R.lesson] = pc; R.lessonPct = pc; R.newStars = Math.max(0, s1 - s0); bonus += R.newStars * 2; markActive(); if (s1 >= 2) celebrate(s1 === 3); }
    if (R.mode === 'boss') { R.win = R.boss.hp <= 0; markActive(); if (R.win) { bonus += 10; P.bossWin = P.bossWin || {}; P.bossWin[R.unit] = today(); celebrate(true); } }
    if (R.mode === 'blitz') { P.blitz = P.blitz || {}; R.record = R.score > (P.blitz.best || 0); if (R.record) { P.blitz.best = R.score; celebrate(true); } bonus += Math.min(10, Math.round(R.score / 3)); markActive(); }
    if (R.mode === 'duel') { const sc = R.duel.score; R.duelRes = sc[0] > sc[1] ? 'm' : sc[0] < sc[1] ? 'd' : 't'; if (R.duelRes !== 'd') celebrate(R.duelRes === 'm'); bonus += R.duelRes === 'm' ? 5 : 2; markActive(); }
    if (R.mode === 'page' || R.mode === 'pgame') bonus += pgFinish(R);
    if (R.mode === 'mq') bonus += mqFinish(R);
    if (R.mode === 'mission' && pct >= .8) celebrate();
    if (R.mode === 'test' && R.win) celebrate(true);
    if (bonus) award(bonus); R.bonus = bonus; Store.save(); Store.writeLocal();
    try { pct >= .6 ? H.sfxGood() : null; } catch (e) { }
    render({ top: true }); setTimeout(() => { if (ST.view === 'run') sayHu(R.mode === 'test' ? (R.win ? 'fb_race_win' : 'fb_race_lose') : R.mode === 'boss' ? (R.win ? 'boss_win' : 'boss_lose') : R.mode === 'duel' ? ({ m: 'duel_m_win', d: 'duel_d_win', t: 'duel_tie' })[R.duelRes] : R.record ? 'blitz_record' : 'fb_end'); }, 800);
  }
  // ================= MATEK-KVÍZ (Robert 2026-11-07: matek-specifikus, gyors számos válaszok, minden témára, passz mindenhol, játékos animációk) =================
  // adat: root.MQ (tools/mathquiz.js). Hang: x:mq_<kulcs> (mkxaudio mat) + számok n:…  Állapot: P.mq (beállítás), P.mqw[gid] (jó/rossz/passz/sorozat), P.skips (minden tantárgy passzai)
  function mqOn() { return C.subj === 'mat' && !!root.MQ; }
  function mqS() { P.mq = P.mq || { mode: 'practice', units: null, gids: [], lvl: 1, vis: true, sw: false, best: 0 }; P.mqw = P.mqw || {}; P.skips = P.skips || {}; return P.mq; }
  function mqName(gid) { const g = root.MQ && root.MQ.G[gid]; return g ? g.name : [gid, gid]; }
  const ML = (h, s) => ({ hu: h, l: s });
  const MQT = {
    title: ML('Matek-kvíz', 'Quiz de mates'), m_practice: ML('Gyakorló', 'Practicar'), m_villam: ML('Villám 60 mp', 'Relámpago 60 s'), m_exam: ML('Dolgozat-próba', 'Prueba del examen'), m_fix: ML('Hibajavító', 'Corregir errores'),
    d_practice: ML('saját tempó, magyarázattal', 'a tu ritmo'), d_villam: ML('csak számok, 1 perc, rekord', 'solo números, 1 minuto'), d_exam: ML('a következő dolgozat fejezeteiből', 'temas del próximo examen'), d_fix: ML('ami eddig nem ment vagy passzoltad', 'lo que falló o pasaste'),
    units: ML('Fejezetek', 'Unidades'), topics: ML('Témák', 'Temas'), all: ML('Mind', 'Todo'), lvl: ML('Szint', 'Nivel'), vis: ML('Rajz-segítség', 'Dibujo de ayuda'), sw: ML('Stopper', 'Cronómetro'), on: ML('be', 'sí'), off: ML('ki', 'no'),
    start: ML('Indulás!', '¡Empezar!'), skip: ML('Passz', 'Paso'), again: ML('Passzolt kérdés – most visszajött', 'Pregunta pasada – otra vez'), good: ML('jó', 'bien'), bad: ML('rossz', 'mal'), pass: ML('passz', 'paso'),
    skipagain: ML('A passzoltak újra', 'Repetir las pasadas'), bytopic: ML('Témánként', 'Por temas'), nofix: ML('Nincs javítanivaló – szuper! 🎉', '¡No hay errores!'), rec: ML('Rekord', 'Récord'), rtl: ML('jobbról balra írd: előbb az egyesek', 'de derecha a izquierda'),
    tapord: ML('Koppints sorban a számokra!', 'Toca los números en orden'), undo: ML('Vissza', 'Atrás'), ev: ML('dolgozat', 'examen'), secs: ML('mp', 's'), fixn: ML('db', ''),
    lv1: ML('100-ig', 'hasta 100'), lv2: ML('1000-ig', 'hasta 1000'), lv3: ML('9999-ig', 'hasta 9999'), parent: ML('Matek-kvíz témánként', 'Quiz de mates por temas'), skipsP: ML('Leggyakrabban passzolt kérdések (minden tantárgy)', 'Preguntas más pasadas')
  };
  const mt = k => MQT[k].hu, mtl = k => MQT[k].l;
  function mqSay(k) { const ph = root.MQ.PH[k]; if (ph) say([{ l: 'hu', k: 'x:mq_' + k, t: ph[1] }]); }
  function mqEvUnits() { let u = []; try { events().filter(e => e._days >= 0 && e._days <= 10).forEach(e => (e.units || []).forEach(x => { if (u.indexOf(x) < 0) u.push(x); })); } catch (e) { } if (!u.length) { const ev = nextEvent(); u = ev && ev.units ? ev.units.slice() : []; } return u.length ? u.sort() : null; }
  function mqFocus() { const ev = nextEvent(); const isTab = ev && /tabla|tables|szorzótábla|×/i.test((ev.title || '') + ' ' + (ev.title_hu || '')); try { root.MQ.setFocus(isTab ? focusTables() : null); } catch (e) { } }
  function mqMake(gid, L, seed) { if (seed == null) seed = Math.floor(Math.random() * 1e9); let t; try { t = root.MQ.make(gid, L, seed); } catch (e) { return null; } return mqQ(t, seed); }
  function mqQ(t, seed) {
    const ex = t.explain ? [t.explain.es, t.explain.hu].filter(Boolean).join(' · ') : '';
    const numSay = v => (/^\d{1,4}$/.test(String(v)) && MG && MG.numKeys) ? MG.numKeys(+v, 'es').map(k => ({ l: 'es', k, t: String(v), gap: 20 })) : null;
    return { kind: t.kind, part: 'math', unit: t.unit, page: '', mq: t, gid: t.gid, rec: { type: 'mq', id: t.gid + ':' + t.level + ':' + seed, label: t.hear ? '🔊 ' + t.answer : t.text.es, hu: t.text.hu, unit: t.unit },
      prompt: null, big: t.hear ? '🔊 ? ' : t.text.es, small: t.text.hu, audio: t.audio, answer: t.answer, explain: ex, fast: !!t.fast,
      options: t.options ? t.options.map(o => { const ns = numSay(o.v); return Object.assign({ v: o.v, label: o.label, sm: o.sm }, ns ? { say: ns } : {}); }) : null };
  }
  function mqAnsLabel(q) { const t = q.mq; if (!t) return String(q.answer); if (t.kind === 'multi') return t.fields.map(f => f.hu + ': ' + f.ans).join(' · '); if (t.kind === 'order') return String(t.answer).split('|').join(' → '); if (t.kind === 'choice') { const o = (t.options || []).find(x => String(x.v) === String(t.answer)); return o ? o.label + (o.sm ? ' (' + o.sm + ')' : '') : t.answer; } return String(t.answer); }
  function mqNorm(q, resp) { if (!q.mq) return resp; if (q.kind === 'num' || q.kind === 'col') return String(resp).replace(/^0+(?=\d)/, ''); if (q.kind === 'multi') return String(resp).split('|').map(x => x.replace(/^0+(?=\d)/, '')).join('|'); return resp; }
  function mqTrack(q, ok, skip) { if (!q || !q.mq) return; mqS(); const w = P.mqw[q.gid] || (P.mqw[q.gid] = { n: 0, ok: 0, bad: 0, skip: 0, run: 0 }); if (skip) { w.skip++; w.run = 0; w.flag = 1; return; } w.n++; if (ok) { w.ok++; w.run++; if (w.run >= 3) w.flag = 0; } else { w.bad++; w.run = 0; w.flag = 1; } }
  // ---- kérdés-forrás
  function mqUnitsSel() { const s = mqS(); const all = root.MQ.units(); return (s.units && s.units.length ? s.units : (mqEvUnits() || all)).filter(u => all.indexOf(u) >= 0); }
  function mqGidsFor(units, gids) { const all = units.flatMap(u => root.MQ.byUnit(u)); const sel = (gids || []).filter(g => all.indexOf(g) >= 0); return sel.length ? sel : all; }
  const MQFAST = ['table', 'factor', 'div', 'x10', 'double', 'compare', 'parity', 'tf', 'sides', 'missing', 'round', 'place', 'comm', 'fpart'];
  function mqPick(gids) { const w = gids.map(g => { const x = P.mqw[g]; return 1 + (x && x.flag ? 2 : 0) + (x && x.n > 3 ? (1 - x.ok / x.n) * 2 : 0); }); let r = Math.random() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < gids.length; i++) { r -= w[i]; if (r <= 0) return gids[i]; } return gids[0]; }
  function mqGenFn(gids, lvl) { let last = null; return () => { let q = null, n = 0; while (!q && n++ < 8) { let g = mqPick(gids); if (g === last && gids.length > 2) g = mqPick(gids); last = g; q = mqMake(g, lvl); } return q || mqMake('table', 1); }; }
  function mqFixQs(n) { mqS(); const t = today(); const out = []; const seen = {};
    Object.keys(P.miss).filter(k => k.indexOf('mq:') === 0 && (P.miss[k].ok || 0) < 2).sort((a, b) => (P.miss[b].last || '') > (P.miss[a].last || '') ? 1 : -1).forEach(k => { if (out.length >= n) return; const q = qFromMiss(k, P.miss[k]); if (q) { q.fix = true; out.push(q); seen[k] = 1; } });
    Object.keys(P.skips).filter(k => k.indexOf('mq:') === 0 && !seen[k] && !P.skips[k].done).forEach(k => { if (out.length >= n) return; const q = qFromMiss(k, P.skips[k]); if (q) { q.fix = true; out.push(q); } });
    const fl = Object.keys(P.mqw).filter(g => P.mqw[g].flag && root.MQ.G[g]); let i = 0; while (fl.length && out.length < n && i++ < 200) { const q = mqMake(fl[i % fl.length], mqS().lvl); if (q) out.push(q); }
    return out; }
  function startMq(mode) {
    const s = mqS(); mode = mode || s.mode; s.mode = mode; Store.save(); mqFocus(); const lvl = s.lvl || 1; const base = { mode: 'mq', mqmode: mode, mqr: true, auto: true, back: 'mq', sw: !!s.sw, title: mt('title') + ' · ' + mt('m_' + mode) };
    if (mode === 'villam') { let gids = mqGidsFor(mqUnitsSel(), s.gids).filter(g => MQFAST.indexOf(g) >= 0); if (!gids.length) gids = ['table', 'factor', 'double', 'compare']; startRun(Object.assign(base, { gen: mqGenFn(gids, lvl), qs: [], limit: 999, endless: true, fast: true, secs: 60, sw: false })); mqSay('ui_villam'); return; }
    if (mode === 'fix') { const qs = mqFixQs(QN()); if (!qs.length) { toast(mt('nofix')); return; } startRun(Object.assign(base, { qs })); return; }
    if (mode === 'exam') { const units = mqEvUnits() || mqUnitsSel(); const gids = shuffle(units.flatMap(u => root.MQ.byUnit(u))); const qs = []; let i = 0; while (qs.length < QN() && i < QN() * 3) { const q = mqMake(gids[i % gids.length], Math.max(2, lvl)); if (q) qs.push(q); i++; } startRun(Object.assign(base, { qs: shuffle(qs), units })); return; }
    startRun(Object.assign(base, { gen: mqGenFn(mqGidsFor(mqUnitsSel(), s.gids), lvl), qs: [], limit: QN() }));
  }
  let mqSwIv = null;
  function mqSwStart() { clearInterval(mqSwIv); mqSwIv = setInterval(() => { const R = ST.run; if (!R || !R.sw || R.done || ST.view !== 'run') { clearInterval(mqSwIv); return; } const t = el && el.querySelector('#px-sw'); if (t) t.textContent = mqFmt((Date.now() - R.start) / 1000); }, 500); }
  function mqFmt(sec) { sec = Math.round(sec); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
  // ---- beállító nézet
  function vMq() {
    const s = mqS(); const evU = mqEvUnits(); const units = root.MQ.units(); const selU = s.units && s.units.length ? s.units : (evU || []); const gids = mqGidsFor(mqUnitsSel(), []);
    const fixN = mqFixQs(99).length; const chip = (on, a, attrs, lab) => '<button type="button" class="chip' + (on ? ' on' : '') + '" data-a="' + a + '" ' + attrs + '>' + lab + '</button>';
    const modes = ['practice', 'villam', 'exam', 'fix'].map(m => '<button type="button" class="mq-mode' + (s.mode === m ? ' on' : '') + '" data-a="mqmode" data-m="' + m + '"><b>' + esc(mt('m_' + m)) + '</b><small>' + esc(mt('d_' + m)) + (m === 'villam' && s.best ? ' · ' + esc(mt('rec')) + ': ' + s.best : '') + (m === 'fix' ? ' · ' + fixN + ' ' + esc(mt('fixn')) : '') + (m === 'exam' && evU ? ' · ' + evU.map(u => u.replace('u', '')).join(', ') + '. fej.' : '') + '</small></button>').join('');
    let h = topbar(mt('title')) + '<div class="px-row"><button type="button" class="pbtn o" data-a="mqintro">' + ICO.spk + '<span>' + esc(hu('b_listen')) + '</span></button></div><div class="mq-modes">' + modes + '</div>';
    if (s.mode !== 'fix' && s.mode !== 'exam') {
      h += '<h3 class="px-h">' + esc(mt('units')) + ' <small>· ' + esc(mtl('units')) + '</small></h3><div class="px-chips">' + chip(!(s.units && s.units.length), 'mqunit', 'data-u=""', esc(mt('all')) + (evU ? ' (' + esc(mt('ev')) + ')' : '')) + units.map(u => chip(selU.indexOf(u) >= 0 && s.units && s.units.length, 'mqunit', 'data-u="' + u + '"', esc(unitTitle(u)) + (evU && evU.indexOf(u) >= 0 ? ' ★' : ''))).join('') + '</div>';
      h += '<h3 class="px-h">' + esc(mt('topics')) + ' <small>· ' + esc(mtl('topics')) + '</small></h3><div class="px-chips">' + chip(!(s.gids || []).filter(g => gids.indexOf(g) >= 0).length, 'mqgid', 'data-g=""', esc(mt('all'))) + gids.map(g => { const w = P.mqw[g]; return chip((s.gids || []).indexOf(g) >= 0, 'mqgid', 'data-g="' + g + '"', esc(mqName(g)[1]) + '<small> · ' + esc(mqName(g)[0]) + '</small>' + (w && w.flag ? ' <i class="mq-flag">!</i>' : '')); }).join('') + '</div>';
    }
    h += '<div class="px-chips"><span class="px-sub" style="font-weight:800">' + esc(mt('lvl')) + '</span>' + [1, 2, 3].map(l => chip(s.lvl === l, 'mqlvl', 'data-l="' + l + '"', '★'.repeat(l) + ' <small>' + esc(mt('lv' + l)) + '</small>')).join('') + '</div>';
    if (s.mode !== 'villam') h += qnChips();
    h += '<div class="px-chips"><span class="px-sub" style="font-weight:800">' + esc(mt('vis')) + '</span>' + chip(s.vis !== false, 'mqvis', 'data-v="1"', esc(mt('on'))) + chip(s.vis === false, 'mqvis', 'data-v="0"', esc(mt('off'))) + '<span class="px-sub" style="font-weight:800;margin-left:12px">' + esc(mt('sw')) + '</span>' + chip(!!s.sw, 'mqsw', 'data-v="1"', esc(mt('on'))) + chip(!s.sw, 'mqsw', 'data-v="0"', esc(mt('off'))) + '</div>';
    h += '<button type="button" class="pbtn g xl" data-a="mqstart">' + ICO.next + '<span>' + esc(mt('start')) + '</span><small>' + esc(mtl('start')) + '</small></button>';
    return h;
  }
  // ---- rajzok
  function mqVis(v, q) {
    if (!v) return ''; const s = mqS(); const helper = ['groups', 'blocks', 'roundline', 'digits'].indexOf(v.type) >= 0; if (helper && s.vis === false && !(v.type === 'digits' && v.hl != null)) return '';
    const svg = (w, h, inner, lab) => '<svg class="px-vis mq-vis" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(lab || v.type) + '">' + inner + '</svg>';
    const T = (x, y, t, sz, c, w) => '<text x="' + x + '" y="' + y + '" font-size="' + (sz || 22) + '" font-weight="' + (w || 800) + '" text-anchor="middle" fill="' + (c || '#1E2A38') + '">' + esc(t) + '</text>';
    if (v.type === 'digits') { const ds = String(v.n).padStart(4, ' ').split(''); const nm = ['UM', 'C', 'D', 'U']; return '<div class="px-digits">' + ds.map((d, i) => '<div' + (v.hl === i ? ' class="hl"' : '') + '><small>' + nm[i] + '</small><b>' + (d.trim() ? d : '') + '</b></div>').join('') + '</div>'; }
    if (v.type === 'numline') { const mn = +v.min, mx = +v.max, st = +v.step || 1; const n = Math.round((mx - mn) / st); const W = 640, pad = 30, sx = x => pad + (x - mn) / (mx - mn) * (W - 2 * pad); let g = '<line x1="' + pad + '" y1="60" x2="' + (W - pad) + '" y2="60" stroke="#1E2A38" stroke-width="3"/>';
      for (let i = 0; i <= n; i++) { const x = sx(mn + i * st); const lab = i === 0 || i === n || (!v.hide && (n <= 10 || i % 2 === 0)); g += '<line x1="' + x + '" y1="48" x2="' + x + '" y2="72" stroke="#1E2A38" stroke-width="2"/>' + (lab ? T(x, 102, mn + i * st, 20, '#1E2A38', 700) : ''); }
      (v.marks || []).forEach(m => { const x = sx(+m); g += '<path d="M' + x + ' 46 l-10 -18 h20z" fill="#E86A7A" stroke="#8E2A1F" stroke-width="2"/>' + T(x, 20, v.hide ? '?' : m, 24, '#8E2A1F', 900); });
      return svg(W, 112, g, 'számegyenes'); }
    if (v.type === 'frac') { const n = v.n, d = v.d; let g = ''; if (v.shape === 'circle') { const cx = 80, cy = 80, r = 70; if (d === 1) g = '<circle cx="80" cy="80" r="70" fill="#F2891F"/>'; for (let i = 0; i < d; i++) { const a0 = -Math.PI / 2 + i * 2 * Math.PI / d, a1 = a0 + 2 * Math.PI / d; const p = 'M' + cx + ' ' + cy + ' L' + (cx + r * Math.cos(a0)).toFixed(1) + ' ' + (cy + r * Math.sin(a0)).toFixed(1) + ' A' + r + ' ' + r + ' 0 ' + (d === 2 ? 1 : 0) + ' 1 ' + (cx + r * Math.cos(a1)).toFixed(1) + ' ' + (cy + r * Math.sin(a1)).toFixed(1) + 'Z'; g += '<path d="' + p + '" fill="' + (i < n ? '#F2891F' : '#fff') + '" stroke="#B85A12" stroke-width="3"/>'; } return svg(160, 160, g, n + '/' + d); }
      const W = Math.min(60 * d, 480), cw = W / d; for (let i = 0; i < d; i++) g += '<rect x="' + (2 + i * cw) + '" y="2" width="' + cw + '" height="70" fill="' + (i < n ? '#3B82C4' : '#fff') + '" stroke="#1F4E79" stroke-width="3"/>'; return svg(W + 4, 74, g, n + '/' + d); }
    if (v.type === 'frac2') { const d = v.d, W = 360, cw = W / d; let g = ''; [v.a, v.b].forEach((n, r) => { for (let i = 0; i < d; i++) g += '<rect x="' + (50 + i * cw) + '" y="' + (4 + r * 56) + '" width="' + cw + '" height="44" fill="' + (i < n ? (r ? '#6BBF59' : '#F2891F') : '#fff') + '" stroke="#555" stroke-width="2"/>'; g += T(22, 34 + r * 56, n + '/' + d, 20); }); return svg(W + 56, 116, g, v.a + '/' + d + ' ' + v.b + '/' + d); }
    if (v.type === 'clock') { let g = '<circle cx="100" cy="100" r="92" fill="#fff" stroke="#1F4E79" stroke-width="6"/>'; for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6 - Math.PI / 2; g += T(100 + 72 * Math.cos(a), 108 + 72 * Math.sin(a), i, 22, '#1F4E79', 900); }
      for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30; const r0 = i % 5 ? 86 : 82; g += '<line x1="' + (100 + r0 * Math.sin(a)).toFixed(1) + '" y1="' + (100 - r0 * Math.cos(a)).toFixed(1) + '" x2="' + (100 + 90 * Math.sin(a)).toFixed(1) + '" y2="' + (100 - 90 * Math.cos(a)).toFixed(1) + '" stroke="#1F4E79" stroke-width="' + (i % 5 ? 1 : 3) + '"/>'; }
      const am = v.m / 60 * 2 * Math.PI, ah = ((v.h % 12) + v.m / 60) / 12 * 2 * Math.PI; g += '<line x1="100" y1="100" x2="' + (100 + 46 * Math.sin(ah)).toFixed(1) + '" y2="' + (100 - 46 * Math.cos(ah)).toFixed(1) + '" stroke="#D9362B" stroke-width="9" stroke-linecap="round"/><line x1="100" y1="100" x2="' + (100 + 74 * Math.sin(am)).toFixed(1) + '" y2="' + (100 - 74 * Math.cos(am)).toFixed(1) + '" stroke="#1E2A38" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="100" r="7" fill="#1E2A38"/>';
      return svg(200, 200, g, 'óra'); }
    if (v.type === 'coins') { const C2 = c => c >= 100 ? ['#E8C35A', '#B8B8B8'] : c >= 10 ? ['#F2C94C', '#B8860B'] : ['#D9893B', '#8E4A1F']; let x = 0, g = ''; v.list.forEach(c => { const r = c >= 100 ? 34 : c >= 10 ? 30 : 24; const cl = C2(c); g += '<circle cx="' + (x + r + 2) + '" cy="40" r="' + r + '" fill="' + cl[0] + '" stroke="' + cl[1] + '" stroke-width="5"/>' + T(x + r + 2, 47, c >= 100 ? (c / 100) + '€' : c + 'c', c >= 100 ? 20 : 18, '#3A2A10', 900); x += 2 * r + 10; }); return svg(x + 4, 80, g, 'pénz'); }
    if (v.type === 'lineobj') { const y = 50; let g = ''; const arr = (x, dir) => '<path d="M' + x + ' ' + y + ' l' + (-16 * dir) + ' -10 v20z" fill="#1E2A38"/>'; const dot = x => '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#E86A7A" stroke="#8E2A1F" stroke-width="2"/>';
      g += '<line x1="' + (v.t === 'segmento' ? 80 : v.t === 'semirrecta' ? 80 : 20) + '" y1="' + y + '" x2="' + (v.t === 'segmento' ? 320 : 380) + '" y2="' + y + '" stroke="#1E2A38" stroke-width="4"/>';
      if (v.t === 'recta') g += arr(20, -1) + arr(380, 1); if (v.t === 'semirrecta') g += dot(80) + arr(380, 1); if (v.t === 'segmento') g += dot(80) + dot(320); return svg(400, 100, g, v.t); }
    if (v.type === 'angle') { const a = v.deg * Math.PI / 180, L = 150, ox = 60, oy = 160; let g = '<line x1="' + ox + '" y1="' + oy + '" x2="' + (ox + L) + '" y2="' + oy + '" stroke="#1E2A38" stroke-width="5" stroke-linecap="round"/><line x1="' + ox + '" y1="' + oy + '" x2="' + (ox + L * Math.cos(a)).toFixed(1) + '" y2="' + (oy - L * Math.sin(a)).toFixed(1) + '" stroke="#1E2A38" stroke-width="5" stroke-linecap="round"/>';
      g += v.deg === 90 ? '<path d="M' + (ox + 26) + ' ' + oy + ' v-26 h-26" fill="none" stroke="#D9362B" stroke-width="3"/>' : '<path d="M' + (ox + 36) + ' ' + oy + ' A36 36 0 0 0 ' + (ox + 36 * Math.cos(a)).toFixed(1) + ' ' + (oy - 36 * Math.sin(a)).toFixed(1) + '" fill="none" stroke="#D9362B" stroke-width="3"/>'; return svg(240, 180, g, 'szög'); }
    if (v.type === 'grid') { const cs = 56, ox = 40, oy = 10; let g = ''; for (let c = 0; c < 4; c++) { g += T(ox + c * cs + cs / 2, oy + 4 * cs + 26, 'ABCD'[c], 22, '#1F4E79', 900); for (let r = 0; r < 4; r++) g += '<rect x="' + (ox + c * cs) + '" y="' + (oy + r * cs) + '" width="' + cs + '" height="' + cs + '" fill="#fff" stroke="#9AA7B4" stroke-width="2"/>'; }
      for (let r = 0; r < 4; r++) g += T(20, oy + (3 - r) * cs + cs / 2 + 8, r + 1, 22, '#1F4E79', 900); g += '<text x="' + (ox + v.c * cs + cs / 2) + '" y="' + (oy + (4 - v.w) * cs + cs / 2 + 12) + '" font-size="34" text-anchor="middle">' + esc(v.em) + '</text>'; return svg(ox + 4 * cs + 6, oy + 4 * cs + 36, g, 'négyzetháló'); }
    if (v.type === 'poly') { const n = v.n, r = 70; let p = ''; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / n; p += (i ? ' L' : 'M') + (80 + r * Math.cos(a)).toFixed(1) + ' ' + (82 + r * Math.sin(a)).toFixed(1); } return svg(160, 160, '<path d="' + p + 'Z" fill="#FFF1E4" stroke="#B85A12" stroke-width="5" stroke-linejoin="round"/>', 'sokszög'); }
    if (v.type === 'solid') { const S2 = { cubo: '<path d="M30 60 h80 v80 h-80z" fill="#7FB3E0" stroke="#1F4E79" stroke-width="4"/><path d="M30 60 l30 -30 h80 l-30 30z" fill="#BFD9F0" stroke="#1F4E79" stroke-width="4"/><path d="M110 60 l30 -30 v80 l-30 30z" fill="#5B93C7" stroke="#1F4E79" stroke-width="4"/>',
        esfera: '<circle cx="85" cy="85" r="62" fill="#F2891F" stroke="#B85A12" stroke-width="4"/><ellipse cx="85" cy="85" rx="62" ry="18" fill="none" stroke="#B85A12" stroke-width="2" stroke-dasharray="6 5"/><circle cx="62" cy="60" r="12" fill="#FFD2A6"/>',
        cilindro: '<path d="M40 40 v90 a45 14 0 0 0 90 0 v-90" fill="#6BBF59" stroke="#22603C" stroke-width="4"/><ellipse cx="85" cy="40" rx="45" ry="14" fill="#A8DE9B" stroke="#22603C" stroke-width="4"/>',
        cono: '<path d="M85 20 L40 135 a45 14 0 0 0 90 0z" fill="#E86A7A" stroke="#8E2A1F" stroke-width="4" stroke-linejoin="round"/><path d="M40 135 a45 14 0 0 1 90 0" fill="none" stroke="#8E2A1F" stroke-width="2" stroke-dasharray="6 5"/>',
        'pirámide': '<path d="M85 18 L30 130 L110 148z" fill="#F7C948" stroke="#B8860B" stroke-width="4" stroke-linejoin="round"/><path d="M85 18 L110 148 L145 120z" fill="#D9A520" stroke="#B8860B" stroke-width="4" stroke-linejoin="round"/>' };
      return svg(170, 165, S2[v.t] || '', 'test'); }
    if (v.type === 'bars') { const mx = Math.max(...v.vals, 5); const top = Math.ceil(mx / 2) * 2; const H2 = 180, bw = 64, gap = 26, ox = 40; let g = ''; for (let i = 0; i <= top; i += (top > 10 ? 2 : 1)) { const y = 10 + H2 - i / top * H2; g += '<line x1="' + ox + '" y1="' + y + '" x2="' + (ox + v.cats.length * (bw + gap) + 10) + '" y2="' + y + '" stroke="#E2E8EE" stroke-width="2"/>' + T(ox - 16, y + 7, i, 18, '#4A5562', 700); }
      const cols = ['#3B82C4', '#F2891F', '#6BBF59', '#E86A7A']; v.cats.forEach((c, i) => { const hh = v.vals[i] / top * H2, x = ox + 12 + i * (bw + gap); g += '<rect x="' + x + '" y="' + (10 + H2 - hh) + '" width="' + bw + '" height="' + hh + '" rx="6" fill="' + cols[i % 4] + '"/>' + T(x + bw / 2, H2 + 36, c, 16, '#1E2A38', 800); });
      return svg(ox + v.cats.length * (bw + gap) + 20, H2 + 46, g, 'diagram'); }
    return visMore(v);
  }
  // ---- bevitel (multi / order / col) + számbillentyűzet
  function npOnly(answered) { return '<div class="px-numpad">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map(k => '<button type="button" class="np ' + (k === '✓' ? 'go' : '') + '" data-a="np" data-k="' + k + '"' + (answered ? ' disabled' : '') + '>' + k + '</button>').join('') + '</div>'; }
  function colCells(q) { const c = q.mq.col, la = String(c.a).length, lb = String(c.b).length; return Math.max(String(q.answer).length, c.op === '+' ? Math.max(la, lb) + 1 : c.op === '×' ? la + 1 : Math.max(la, lb)); }
  function mqInput(R, q, answered) {
    const t = q.mq;
    if (t.kind === 'multi') { R.mv = R.mv || t.fields.map(() => ''); if (R.mf == null) R.mf = 0;
      return '<div class="mq-fields">' + t.fields.map((f, i) => '<button type="button" class="mq-f' + (i === R.mf && !answered ? ' on' : '') + (answered ? (String(+R.mv[i]) === f.ans ? ' ok' : ' bad') : '') + '" data-a="mqf" data-i="' + i + '"><small>' + esc(f.hu) + ' · ' + esc(f.es) + '</small><b>' + esc(R.mv[i] || '…') + '</b></button>' + (i < t.fields.length - 1 ? '<span class="mq-sep">' + (t.gid === 'clock' ? ':' : t.gid === 'fpic' ? '/' : t.gid === 'rem' ? 'm.' : '·') + '</span>' : '')).join('') + '</div>' + npOnly(answered); }
    if (t.kind === 'order') { R.ord = R.ord || []; const items = t.items;
      return '<div class="mq-slots">' + items.map((_, i) => '<span class="mq-slot' + (R.ord[i] != null ? ' f' : '') + '">' + (R.ord[i] != null ? esc(items[R.ord[i]]) : (i + 1) + '.') + '</span>').join('<i>' + (/desc/.test((t.audio[0] || {}).k || '') ? '>' : '<') + '</i>') + '</div>' +
        '<div class="mq-items">' + items.map((it, i) => '<button type="button" class="mq-it' + (R.ord.indexOf(i) >= 0 ? ' used' : '') + '" data-a="mqo" data-i="' + i + '"' + (answered || R.ord.indexOf(i) >= 0 ? ' disabled' : '') + '>' + esc(it) + '</button>').join('') + '</div>' +
        (answered ? '' : '<div class="px-row center"><span class="px-sub">' + esc(mt('tapord')) + '</span>' + (R.ord.length ? '<button type="button" class="pbtn l sm" data-a="mqou"><span>⌫ ' + esc(mt('undo')) + '</span></button>' : '') + '</div>'); }
    if (t.kind === 'col') { const c = t.col, n = colCells(q); const pad = x => String(x).padStart(n, ' ').split('');
      const typed = (R.num || '').split(''); const res = []; for (let i = 0; i < n; i++) { const fromR = n - 1 - i; res.push(typed[fromR] != null ? typed[fromR] : ''); }
      const next = typed.length < n ? n - 1 - typed.length : -1;
      const row = (arr, cls) => '<div class="mq-crow ' + (cls || '') + '">' + arr.map((d, i) => '<span class="' + (cls === 'res' ? 'cell' + (i === next && !answered ? ' nx' : '') : '') + '">' + esc(d.trim()) + '</span>').join('') + '</div>';
      return '<div class="mq-col"><div class="mq-op">' + esc(c.op) + '</div><div>' + row(pad(c.a)) + row(pad(c.b)) + '<div class="mq-bar"></div>' + row(res, 'res') + '</div></div>' + (answered ? '' : '<div class="px-sub center">← ' + esc(mt('rtl')) + '</div>') + npOnly(answered); }
    return '';
  }
  function mqNp(k) { const R = ST.run, q = curQ(); if (!R || !q || !q.mq) return false; const t = q.mq; if (R.ans !== null && R.mode !== 'test') return true;
    if (t.kind === 'multi') { R.mv = R.mv || t.fields.map(() => ''); R.mf = R.mf || 0;
      if (k === '⌫') { if (R.mv[R.mf]) R.mv[R.mf] = R.mv[R.mf].slice(0, -1); else if (R.mf > 0) R.mf--; }
      else if (k === '✓') { if (R.mv.every(x => x !== '')) { answerRun(R.mv.join('|')); return true; } if (R.mv[R.mf] !== '') R.mf = Math.min(t.fields.length - 1, R.mf + 1); else { const e = R.mv.findIndex(x => x === ''); if (e >= 0) R.mf = e; } }
      else if (R.mv[R.mf].length < 4) { R.mv[R.mf] += k; if (R.mv[R.mf].length >= String(t.fields[R.mf].ans).length && R.mf < t.fields.length - 1 && R.mv[R.mf + 1] === '') R.mf++; }
      render(); return true; }
    if (t.kind === 'col') { const n = colCells(q);
      if (k === '⌫') R.num = (R.num || '').slice(0, -1); else if (k === '✓') { if (R.num) { answerRun(R.num.split('').reverse().join('')); return true; } } else if ((R.num || '').length < n) R.num = (R.num || '') + k;
      render(); return true; }
    return false; }
  function mqKey(e) { try {
    if (!ST || ST.view !== 'run' || !ST.run || ST.run.done) return; const tg = e.target; if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return; if (e.ctrlKey || e.metaKey || e.altKey) return;
    const R = ST.run, q = curQ(); if (!q) return; const answered = R.ans !== null && R.mode !== 'test'; let k = e.key;
    if (k === 'Enter') { e.preventDefault(); if (answered) act('next', {}); else if (q.kind === 'num' || q.kind === 'multi' || q.kind === 'col') act('np', { k: '✓' }); return; }
    if (answered) return;
    if (/^[0-9]$/.test(k)) { if (q.kind === 'num' || q.kind === 'multi' || q.kind === 'col') { e.preventDefault(); act('np', { k }); return; } if (q.kind === 'choice' && +k >= 1 && +k <= q.options.length) { e.preventDefault(); act('pick', { i: String(+k - 1) }); return; } }
    if (k === 'Backspace') { if (q.kind === 'num' || q.kind === 'multi' || q.kind === 'col') { e.preventDefault(); act('np', { k: '⌫' }); } else if (q.kind === 'order') { e.preventDefault(); act('mqou', {}); } return; }
    if (k === 'Tab' && q.kind === 'multi') { e.preventDefault(); R.mf = ((R.mf || 0) + 1) % q.mq.fields.length; render(); }
  } catch (er) { } }
  // ---- passz (minden futtatásban, minden tantárgyban)
  function nAns(R) { return R.res.filter(r => !r.skip).length; }
  function skipRec(q) { if (!q || !q.rec) return; P.skips = P.skips || {}; const k = q.rec.type + ':' + q.rec.id; const m = P.skips[k] || (P.skips[k] = { n: 0, type: q.rec.type, label: q.rec.label, hu: q.rec.hu || '', unit: q.rec.unit || '' }); m.n++; m.last = today(); m.done = 0; mqTrack(q, false, true); Store.save(); }
  function runSkip() { const R = ST.run; if (!R || R.done) return; const q = curQ(); if (!q) return; if (R.ans !== null && R.mode !== 'test') { nextRun(); return; }
    stopAll(); clearTimeout(R.autoT); if (q.orig) { const r0 = R.res.find(r => r.skip && r.q === q.orig && !r.resolved); if (r0) r0.resolved = true; }
    R.res.push({ q, ok: false, skip: true, resp: null }); skipRec(q); if (R.mode === 'test') { nextRun(); return; }
    if (!q.again && !R.endless && !R.fast) (R.later = R.later || []).push(q);
    try { H.sfxBad && 0; } catch (e) { } toast('⏭ ' + mt('skip')); nextRun(); }
  function runRequeue(R) { if (!R.later || !R.later.length || R.endless || R.end || R.boss || R.duel || R.mode === 'test') return false; const L = R.later; R.later = [];
    if (R.gen) R.qs.length = R.i + 1; L.forEach(q => R.qs.push(Object.assign({}, q, { again: true, orig: q, fix: false }))); if (R.gen) R.limit = R.qs.length; toast('↻ ' + mt('again')); try { if (root.MQ) mqSay('ui_again'); } catch (e) { } return true; }
  function skipBtn(R) { return '<div class="px-row center mq-skiprow"><button type="button" class="pbtn l" data-a="skip"><span>⏭ ' + esc(mt('skip')) + '</span><small>' + esc(mtl('skip')) + '</small></button></div>'; }
  function tallyHtml(R) { if (R.mode === 'duel') return ''; const sk = R.res.filter(r => r.skip && !r.resolved).length; const good = R.res.filter(r => r.ok).length, bad = R.res.filter(r => !r.ok && !r.skip).length; if (!sk && !R.mqr) return '';
    let h = '<div class="mq-tally"><div class="g"><b>' + good + '</b><span>' + esc(mt('good')) + '</span></div><div class="b"><b>' + bad + '</b><span>' + esc(mt('bad')) + '</span></div><div class="s"><b>' + sk + '</b><span>' + esc(mt('pass')) + '</span></div></div>';
    if (R.mqr) { const by = {}; R.res.forEach(r => { if (!r.q.gid) return; const b = by[r.q.gid] || (by[r.q.gid] = { n: 0, ok: 0, sk: 0 }); if (r.skip) { if (!r.resolved) b.sk++; } else { b.n++; if (r.ok) b.ok++; } });
      const ks = Object.keys(by); if (ks.length) h += '<div class="px-card"><h3>' + esc(mt('bytopic')) + '</h3>' + ks.map(g => { const b = by[g]; const pc = b.n ? b.ok / b.n : 0; return '<div class="mq-trow"><span>' + esc(mqName(g)[1]) + ' <small>' + esc(mqName(g)[0]) + '</small></span><b style="color:' + (pc >= .8 ? '#22603C' : pc >= .5 ? '#B85A12' : '#8E2A1F') + '">' + b.ok + ' / ' + b.n + (b.sk ? ' · ⏭' + b.sk : '') + '</b></div>'; }).join('') + '</div>';
      if (R.sw || R.mqmode === 'exam') h += '<p class="px-note center">⏱ ' + mqFmt((Date.now() - R.start) / 1000) + '</p>'; }
    if (sk) h += '<div class="px-row center"><button type="button" class="pbtn o" data-a="skipagain"><span>↻ ' + esc(mt('skipagain')) + ' (' + sk + ')</span></button></div>';
    return h; }
  function skipAgain() { const R = ST.run; if (!R) return; const qs = R.res.filter(r => r.skip && !r.resolved).map(r => Object.assign({}, r.q.orig || r.q, { again: true, orig: null, fix: false })); if (!qs.length) return;
    startRun({ mode: R.mqr ? 'mq' : 'practice', mqr: R.mqr, mqmode: 'practice', auto: R.auto, title: R.title, qs, back: R.back || 'home' }); }
  function mqFinish(R) { if (R.mode !== 'mq') return 0; markActive(); if (R.mqmode === 'villam') { const s = mqS(); R.record = R.score > (s.best || 0); if (R.record) { s.best = R.score; celebrate(true); setTimeout(() => mqSay('ui_record'), 900); } return Math.min(10, Math.round(R.score / 3)); }
    const n = nAns(R) || 1; const pc = R.score / n; if (pc >= .9 && n >= 8) celebrate(true); else if (pc >= .7) confetti(60); return Math.min(10, Math.round(R.score / 4) + (pc >= .9 ? 3 : 0)); }
  // ---- jó válasz animációk (minden futtatás)
  function goodFx(R) { try {
    if (matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return; const b = document.createElement('div'); b.className = 'mq-burst'; const em = ['★', '✦', '●', '★', '✚', '★']; const cols = ['#F7C948', '#6BBF59', '#E86A7A', '#5DADE2', '#F2891F', '#7D3C98'];
    for (let i = 0; i < 14; i++) { const s = document.createElement('i'); const a = i / 14 * 2 * Math.PI; s.textContent = em[i % em.length]; s.style.color = cols[i % cols.length]; s.style.setProperty('--dx', Math.round(Math.cos(a) * (90 + Math.random() * 60)) + 'px'); s.style.setProperty('--dy', Math.round(Math.sin(a) * (90 + Math.random() * 60)) + 'px'); b.appendChild(s); }
    const fly = document.createElement('div'); fly.className = 'mq-fly'; fly.textContent = '★'; document.body.appendChild(b); document.body.appendChild(fly); setTimeout(() => { b.remove(); fly.remove(); }, 1300);
    if (R && R.combo > 0 && R.combo % 10 === 0) { const r = document.createElement('div'); r.className = 'mq-rocket'; r.innerHTML = '<svg viewBox="0 0 64 120" width="80" height="150" aria-hidden="true"><path d="M32 4 C48 20 52 44 50 76 H14 C12 44 16 20 32 4z" fill="#fff" stroke="#1F4E79" stroke-width="4"/><circle cx="32" cy="40" r="9" fill="#5DADE2" stroke="#1F4E79" stroke-width="3"/><path d="M14 60 L2 84 L14 80z M50 60 L62 84 L50 80z" fill="#E86A7A" stroke="#8E2A1F" stroke-width="3"/><path d="M20 78 Q32 118 44 78z" fill="#F2891F"/><path d="M26 78 Q32 102 38 78z" fill="#F7C948"/></svg>'; document.body.appendChild(r); setTimeout(() => r.remove(), 2600); confetti(120); fanfare(); ST.kanim = 'k-dance'; toast('🚀 ' + R.combo + '×', 'c5'); try { if (root.MQ && C.subj === 'mat') setTimeout(() => mqSay('ui_rocket'), 600); } catch (e) { } }
  } catch (e) { } }
  function mqParent() { mqS(); const gs = Object.keys(P.mqw).filter(g => root.MQ && root.MQ.G[g]); const sk = Object.values(P.skips || {}).sort((a, b) => b.n - a.n).slice(0, 10); let h = '';
    if (gs.length) h += '<div class="px-card"><h3>' + esc(mt('parent')) + '</h3><table class="px-tab"><tr><th>Téma</th><th>Jó / összes</th><th>Rossz</th><th>Passz</th><th>Állapot</th></tr>' + gs.sort((a, b) => (P.mqw[b].bad + P.mqw[b].skip) - (P.mqw[a].bad + P.mqw[a].skip)).map(g => { const w = P.mqw[g]; return '<tr><td><b>' + esc(mqName(g)[1]) + '</b><br><small>' + esc(mqName(g)[0]) + '</small></td><td>' + w.ok + ' / ' + w.n + '</td><td>' + w.bad + '</td><td>' + w.skip + '</td><td>' + (w.flag ? 'gyakorolni (' + w.run + '/3)' : 'megy ✔') + '</td></tr>'; }).join('') + '</table>' + (P.mq && P.mq.best ? '<p class="px-note">Villám-rekord: <b>' + P.mq.best + '</b> jó válasz / perc</p>' : '') + '</div>';
    if (sk.length) h += '<div class="px-card"><h3>' + esc(mt('skipsP')) + '</h3><table class="px-tab"><tr><th>Kérdés</th><th>Magyarul</th><th>Passz</th></tr>' + sk.map(m => '<tr><td><b>' + esc(m.label) + '</b><br><small>' + esc(missType(m.type)) + '</small></td><td>' + esc(m.hu) + '</td><td><b>' + m.n + '×</b></td></tr>').join('') + '</table><p class="px-note">A passz nem számít rossz válasznak és csillagot sem vesz el; a Matek-kvíz „Hibajavító” módja ezeket hozza elő először.</p></div>';
    return h; }
  function mqAct(a, d) {
    switch (a) {
      case 'mqmode': mqS().mode = d.m; Store.save(); render(); return true;
      case 'mqunit': { const s = mqS(); if (!d.u) s.units = null; else { const cur = s.units && s.units.length ? s.units.slice() : []; const i = cur.indexOf(d.u); if (i >= 0) cur.splice(i, 1); else cur.push(d.u); s.units = cur.length ? cur : null; } s.gids = []; Store.save(); render(); return true; }
      case 'mqgid': { const s = mqS(); if (!d.g) s.gids = []; else { const i = s.gids.indexOf(d.g); if (i >= 0) s.gids.splice(i, 1); else s.gids.push(d.g); } Store.save(); render(); return true; }
      case 'mqlvl': mqS().lvl = +d.l; Store.save(); render(); return true;
      case 'mqvis': mqS().vis = d.v === '1'; Store.save(); render(); return true;
      case 'mqsw': mqS().sw = d.v === '1'; Store.save(); render(); return true;
      case 'mqstart': startMq(); if (ST.run && ST.run.sw) mqSwStart(); return true;
      case 'mqintro': mqSay('ui_intro'); return true;
      case 'mqf': { const R = ST.run; if (!R || (R.ans !== null && R.mode !== 'test')) return true; R.mf = +d.i; render(); return true; }
      case 'mqo': { const R = ST.run, q = curQ(); if (!R || !q || (R.ans !== null && R.mode !== 'test')) return true; R.ord = R.ord || []; const i = +d.i; if (R.ord.indexOf(i) < 0) R.ord.push(i); if (R.ord.length === q.mq.items.length) answerRun(R.ord.map(j => q.mq.items[j]).join('|')); else render(); return true; }
      case 'mqou': { const R = ST.run; if (R && R.ord && R.ord.length && R.ans === null) { R.ord.pop(); render(); } return true; }
      case 'skip': runSkip(); return true;
      case 'skipagain': skipAgain(); return true;
    }
    return false;
  }
  const MQCSS = `
.mq-modes{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:8px 0}
.mq-mode{border:4px solid #C9D3DD;background:#fff;border-radius:18px;padding:12px;text-align:left;font:inherit;cursor:pointer;display:flex;flex-direction:column;gap:2px;color:#1E2A38}
.mq-mode b{font-size:20px;font-weight:900}.mq-mode small{font-size:14px;color:#4A5562}.mq-mode.on{border-color:#F2891F;background:#FFF1E4;box-shadow:0 4px 0 #F2891F}
.mq-flag{display:inline-block;background:#E86A7A;color:#fff;border-radius:10px;padding:0 6px;font-style:normal;font-weight:900}
.mq-vis{max-width:100%;height:auto;display:block;margin:6px auto}
.px-digits .hl{background:#FFE08A;border-color:#F2B705!important;box-shadow:0 0 0 3px #F2B705}
.mq-fields{display:flex;justify-content:center;align-items:center;gap:8px;margin:6px 0;flex-wrap:wrap}
.mq-f{min-width:120px;border:4px solid #C9D3DD;background:#fff;border-radius:16px;padding:6px 10px;font:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;color:#1E2A38}
.mq-f small{font-size:13px;font-weight:800;color:#4A5562}.mq-f b{font-size:34px;font-weight:900;min-height:42px;letter-spacing:2px}.mq-f.on{border-color:#3B82C4;box-shadow:0 0 0 3px #BFD9F0}.mq-f.ok{border-color:#6BBF59;background:#E3F5DC}.mq-f.bad{border-color:#E86A7A;background:#FDE2E0}
.mq-sep{font-size:34px;font-weight:900;color:#4A5562}
.mq-slots{display:flex;justify-content:center;align-items:center;gap:4px;flex-wrap:wrap;margin:6px 0}.mq-slots i{font-style:normal;font-weight:900;font-size:24px;color:#B85A12}
.mq-slot{min-width:74px;min-height:52px;border:3px dashed #E8D5B0;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#9AA7B4;background:#fff}.mq-slot.f{border-style:solid;border-color:#3B82C4;color:#1E2A38;animation:mqpop .25s ease-out}
.mq-items{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin:8px 0}
.mq-it{min-height:64px;border:4px solid #1F4E79;border-radius:18px;background:#fff;font:inherit;font-size:30px;font-weight:900;color:#1F4E79;cursor:pointer}.mq-it.used{opacity:.25}
.mq-col{display:flex;justify-content:center;gap:8px;font-variant-numeric:tabular-nums;margin:6px 0}
.mq-op{font-size:40px;font-weight:900;color:#B85A12;align-self:center;margin-top:-30px}
.mq-crow{display:flex;gap:4px}.mq-crow span{box-sizing:border-box;width:46px;height:52px;display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:900;color:#1E2A38}
.mq-crow.res span{border:3px solid #C9D3DD;border-radius:10px;background:#fff;color:#3B82C4}.mq-crow.res span.nx{border-color:#F2891F;box-shadow:0 0 0 3px #FFD2A6;animation:mqblink 1s ease-in-out infinite}
.mq-bar{height:4px;background:#1E2A38;border-radius:2px;margin:4px 0}
.center{text-align:center}.px-sub.center{display:block;margin:2px 0 6px}
.mq-skiprow{margin-top:6px}
.mq-tally{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:10px 0;text-align:center}.mq-tally div{border-radius:16px;padding:10px}.mq-tally b{display:block;font-size:34px;font-weight:900}.mq-tally span{font-weight:800}
.mq-tally .g{background:#E3F5DC;color:#22603C}.mq-tally .b{background:#FDE2E0;color:#8E2A1F}.mq-tally .s{background:#EEF1F4;color:#4A5562}
.mq-trow{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid #F3E3C3;font-size:17px}.mq-trow small{color:#4A5562}
.px-q.okfx{animation:mqok .5s ease-out}.px-q.badfx{animation:mqshake .4s ease-in-out}
.mq-burst{position:fixed;left:50%;top:42%;width:0;height:0;pointer-events:none;z-index:9998}.mq-burst i{position:absolute;left:-12px;top:-14px;font-style:normal;font-size:26px;font-weight:900;animation:mqburst .9s ease-out forwards}
.mq-fly{position:fixed;left:50%;top:42%;font-size:46px;color:#F7C948;text-shadow:0 2px 0 #B8860B;pointer-events:none;z-index:9999;animation:mqfly 1.1s cubic-bezier(.5,-.3,.7,1) forwards}
.mq-rocket{position:fixed;left:calc(50% - 40px);bottom:-160px;pointer-events:none;z-index:9999;animation:mqrocket 2.4s ease-in forwards}
@keyframes mqburst{0%{transform:translate(0,0) scale(.4);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1.1) rotate(200deg);opacity:0}}
@keyframes mqfly{0%{transform:translate(-50%,-50%) scale(.6);opacity:0}25%{transform:translate(-50%,-80%) scale(1.4);opacity:1}100%{transform:translate(-45vw,-45vh) scale(.5);opacity:0}}
@keyframes mqrocket{0%{transform:translateY(0) rotate(0)}20%{transform:translateY(-20vh) rotate(-4deg)}100%{transform:translateY(-130vh) rotate(6deg)}}
@keyframes mqok{0%{box-shadow:0 0 0 0 rgba(107,191,89,.9)}100%{box-shadow:0 0 0 22px rgba(107,191,89,0)}}
@keyframes mqshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
@keyframes mqpop{0%{transform:scale(.6)}100%{transform:scale(1)}}
@keyframes mqblink{50%{box-shadow:0 0 0 6px #FFD2A6}}
@media (prefers-reduced-motion:reduce){.mq-burst,.mq-fly,.mq-rocket{display:none}.px-q.okfx,.px-q.badfx,.mq-crow.res span.nx{animation:none}}
@media (max-width:520px){.mq-crow span{width:38px;height:46px;font-size:32px}.mq-f{min-width:100px}.mq-it{font-size:24px}}
`;
  function mqCss() { try { if (document.getElementById('mq-css')) return; const s = document.createElement('style'); s.id = 'mq-css'; s.textContent = MQCSS; document.head.appendChild(s); } catch (e) { } }
  Plus.open = v => { stopAll(); ST.view = v; if (el && el.isConnected) render({ top: true }); };
  // ================= /MATEK-KVÍZ =================
  // ================= KÖNYVOLDALAK (Robert 2026-11-06: oldalanként minden szó, magyarázat, feladat – játékosan, képekkel) =================
  // adat: X.pages = {books, imgsize:{img:[w,h]}, imgs:{img:url}, emo:{hex:svg}, sprite:{lang:{kulcs:[kezdet,hossz,darab]}}, audio:{darab:{lang:url}}, pchunk:{oldal:darab},
  //   pages:[{id,book,page,unit,lesson,title,title_hu,summary_hu,img,page_box,words:[{w,hu,pic}],learn:{intro,sentences,remember,dialogue,tf},tasks:[{id,n,text,text_hu,box,context,help,pic,items:[{id,q,q_hu,kind,answer,alts,answer_hu,options,pic,vis}]}]}]}
  // hang-kulcsok: p:t/th cím, p:sum összefoglaló, p:w/wh szó, p:i/ih bevezető, p:s/sh mondat, p:r/rh jegyezd meg, p:d/dh párbeszéd, p:f/fh igaz-hamis, p:y/yh indoklás, p:k/kh utasítás, p:c/ch kép-leírás, p:h/hh tipp, p:q/qh alpont
  function pgData() { return (X.pages && X.pages.pages) || []; }
  function pgBooks() { const b = (X.pages && X.pages.books) || []; return b.filter(x => pgData().some(p => p.book === x.id)); }
  function pgFind(id) { return pgData().find(p => p.id === id); }
  function pgCheckable(it) { return it.kind === 'num' || it.kind === 'type' || it.kind === 'choice'; }
  function pgPct(pid) { return ((P.pg || {})[pid]) || 0; }
  function pgStars(pid) { const p = pgPct(pid); return p ? [0, 1, 2].map(i => i < starsOf(p) ? '★' : '☆').join('') : ''; }
  function pgUnits(book) { return unitsList().filter(u => pgData().some(p => p.book === book && p.unit === u)); }
  function bookName(id) { const b = pgBooks().find(x => x.id === id); return b ? b.title_hu : id; }
  // ---- képek: emoji -> OpenMoji SVG; könyvlap-kivágás (csak ha az oldalkép elérhető)
  function emSplit(t) { const out = []; let cur = ''; for (const ch of Array.from(String(t || ''))) { const o = ch.codePointAt(0); if (cur && (o === 0xFE0F || o === 0x200D || o === 0x20E3 || (o >= 0x1F3FB && o <= 0x1F3FF) || cur.endsWith('‍'))) cur += ch; else { if (cur) out.push(cur); cur = ch; } } if (cur) out.push(cur); return out.filter(g => g.codePointAt(0) > 0x2000); }
  function em(t, sz) { const E = (X.pages && X.pages.emo) || {}; return emSplit(t).map(g => { const hx = Array.from(g).filter(c => c.codePointAt(0) !== 0xFE0F).map(c => c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join('-'); return '<span class="pgem" style="width:' + (sz || 40) + 'px;height:' + (sz || 40) + 'px">' + (E[hx] || '<span class="pgemt" style="font-size:' + Math.round((sz || 40) * .8) + 'px">' + esc(g) + '</span>') + '</span>'; }).join(''); }
  function pgImgUrl(p) { const m = X.pages && X.pages.imgs; return p && p.img && m ? m[p.img] : null; }
  function crop(p, box, cls) { const url = pgImgUrl(p); const sz = X.pages.imgsize && X.pages.imgsize[p.img]; if (!url || !sz || !box) return '';
    const [x0, y0, x1, y1] = box; const bw = x1 - x0, bh = y1 - y0; if (bw <= 0 || bh <= 0) return ''; const ratio = (bh * sz[1]) / (bw * sz[0]) * 100;
    return '<div class="pgcrop ' + (cls || '') + '" style="padding-bottom:' + ratio.toFixed(2) + '%"><img alt="" loading="lazy" src="' + esc(url) + '" style="width:' + (100 / bw).toFixed(3) + '%;left:' + (-x0 / bw * 100).toFixed(3) + '%;top:' + (-y0 / bh * 100).toFixed(3) + '%"></div>'; }
  function visMore(v) {
    if (!v) return ''; if (v.type === 'groups' || v.type === 'digits' || v.type === 'roundline') return visHtml(v, {});
    if (v.type === 'blocks') { const part = (n, f) => Array.from({ length: Math.max(0, Math.min(9, n | 0)) }, () => f).join(''); const W = (n, w) => n ? '<g>' + n + '</g>' : '';
      const um = '<svg viewBox="0 0 46 46" width="40" height="40" aria-hidden="true"><rect x="3" y="9" width="34" height="34" fill="#3B82C4" stroke="#1F4E79" stroke-width="2"/><path d="M3 9 l8 -6 h34 l-8 6z M37 9 l8 -6 v34 l-8 6z" fill="#7FB3E0" stroke="#1F4E79" stroke-width="2"/></svg>';
      const c = '<svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true"><rect x="2" y="2" width="36" height="36" fill="#F2891F" stroke="#B85A12" stroke-width="2"/><path d="M2 14h36M2 26h36M14 2v36M26 2v36" stroke="#B85A12" stroke-width="1"/></svg>';
      const d = '<svg viewBox="0 0 10 40" width="9" height="34" aria-hidden="true"><rect x="1" y="1" width="8" height="38" fill="#6BBF59" stroke="#22603C" stroke-width="1.5"/><path d="M1 9h8M1 17h8M1 24h8M1 32h8" stroke="#22603C"/></svg>';
      const u = '<svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><rect x="1" y="1" width="8" height="8" fill="#F7C948" stroke="#B8860B" stroke-width="1.5"/></svg>';
      const col = (lab, n, f) => '<div class="bk"><div class="bi">' + part(n, f) + '</div><small>' + lab + ' · ' + (n | 0) + '</small></div>';
      return '<div class="px-blocks">' + col('UM', v.um, um) + col('C', v.c, c) + col('D', v.d, d) + col('U', v.u, u) + '</div>'; }
    if (v.type === 'numline') { const mn = +v.min, mx = +v.max, st = +v.step || 1; const n = Math.round((mx - mn) / st); if (!(n > 0 && n <= 40)) return ''; const W = 600, pad = 24, sx = x => pad + (x - mn) / (mx - mn) * (W - 2 * pad); let s = '<line x1="' + pad + '" y1="50" x2="' + (W - pad) + '" y2="50" stroke="#1E2A38" stroke-width="3"/>';
      for (let i = 0; i <= n; i++) { const x = sx(mn + i * st); s += '<line x1="' + x + '" y1="40" x2="' + x + '" y2="60" stroke="#1E2A38" stroke-width="2"/>' + (n <= 8 || i % Math.ceil(n / 6) === 0 ? '<text x="' + x + '" y="92" font-size="24" text-anchor="middle" fill="#1E2A38">' + (mn + i * st) + '</text>' : ''); }
      (v.marks || []).forEach(m => { const x = sx(+m); s += '<circle cx="' + x + '" cy="50" r="11" fill="#E86A7A" stroke="#8E2A1F" stroke-width="2"/><text x="' + x + '" y="26" font-size="24" font-weight="800" text-anchor="middle" fill="#8E2A1F">' + m + '</text>'; });
      return '<svg class="px-vis" viewBox="0 0 ' + W + ' 100" role="img" aria-label="számegyenes">' + s + '</svg>'; }
    return '';
  }
  function spk(a, attrs, lab) { return '<button type="button" class="pbtn o xs" data-a="' + a + '" ' + attrs + ' aria-label="' + esc(lab || hu('b_listen')) + '">' + ICO.spk + '</button>'; }
  // ---- hang
  function pgSay(pid, pre, i, es, hut) { const k = pid + (i == null ? '' : ':' + i); return [{ l: C.lang, k: 'p:' + pre + ':' + k, t: es, gap: 150 }, { l: 'hu', k: 'p:' + pre + 'h:' + k, t: hut }]; }
  // ---- futás-kérdések
  function pgQ(p, t, it, first) {
    const audio = []; if (first) audio.push({ l: C.lang, k: 'p:k:' + t.id, t: t.text, gap: 250 });
    audio.push({ l: C.lang, k: 'p:q:' + it.id, t: it.q }); if (first) audio.push({ l: 'hu', k: 'p:kh:' + t.id, t: t.text_hu, gap: 250 }); audio.push({ l: 'hu', k: 'p:qh:' + it.id, t: it.q_hu });
    const q = { kind: it.kind, part: 'page', unit: p.unit, page: String(p.page), rec: { type: 'pg', id: it.id, label: it.q, hu: it.q_hu, unit: p.unit }, prompt: null,
      ctx: { n: t.n, es: t.text, hu: t.text_hu, crop: crop(p, t.box, 'run'), pic: it.pic || t.pic || '', vis: it.vis || null, help: t.help || null, tid: t.id }, big: it.q, small: it.q_hu !== it.q ? it.q_hu : '', audio, answer: String(it.answer), alts: it.alts || [],
      explain: it.answer_hu ? it.answer_hu : '', accent: C.lang === 'es' };
    if (it.kind === 'choice') { q.options = (it.options || []).map((o, i) => ({ v: i, label: o.t, sm: o.hu && o.hu !== o.t ? o.hu : '', say: [{ l: C.lang, k: 'p:o:' + it.id + ':' + i, t: o.t, gap: 150 }].concat(o.hu && o.hu !== o.t ? [{ l: 'hu', k: 'p:oh:' + it.id + ':' + i, t: o.hu }] : []) })); q.answer = String(it.answer); const o = (it.options || [])[it.answer]; if (o) q.explain = o.t + (o.hu && o.hu !== o.t ? ' – ' + o.hu : '') + (it.answer_hu && it.answer_hu !== o.hu ? ' · ' + it.answer_hu : ''); }
    if (it.kind === 'type') q.explain = (it.answer_hu || '');
    return q;
  }
  function pgQs(p, tid) { const qs = []; p.tasks.forEach(t => { if (tid && t.id !== tid) return; let first = true; t.items.forEach(it => { if (!pgCheckable(it)) return; qs.push(pgQ(p, t, it, first)); first = false; }); }); return qs; }
  function tfQ(p, x, i) { return { kind: 'choice', part: 'page', unit: p.unit, page: String(p.page), rec: { type: 'pgf', id: p.id + ':' + i, label: x.es, hu: x.hu, unit: p.unit }, prompt: 'pg_tf_q', big: x.es, small: x.hu,
    ctx: { pic: '', n: '?', es: hu('pg_tf'), hu: S('pg_tf').l }, audio: pgSay(p.id, 'f', i, x.es, x.hu), answer: x.answer ? '1' : '0', options: [{ v: 1, label: hu('pg_true'), sm: S('pg_true').l, say: [sx('pg_true'), sx('pg_true', C.lang)] }, { v: 0, label: hu('pg_false'), sm: S('pg_false').l, say: [sx('pg_false'), sx('pg_false', C.lang)] }],
    explain: (x.why_es || '') + (x.why_hu ? ' – ' + x.why_hu : ''), reveal: pgSay(p.id, 'y', i, x.why_es || '', x.why_hu || '') }; }
  function pgWordQ(p, w, i, mode, all) { const others = shuffle(all.filter(o => o.w !== w.w)).slice(0, 3); const opts = shuffle([w].concat(others));
    if (mode === 'hear') return { kind: 'choice', part: 'page', unit: p.unit, page: String(p.page), rec: { type: 'pgw', id: p.id + ':' + i, label: w.w, hu: w.hu, unit: p.unit }, prompt: 'q_hear', audio: [{ l: C.lang, k: 'p:w:' + p.id + ':' + i, t: w.w }], hearOnly: true, answer: w.w,
      options: opts.map(o => ({ v: o.w, label: o.w, say: [{ l: C.lang, k: 'p:w:' + p.id + ':' + o._i, t: o.w }] })), explain: w.w + ' – ' + w.hu };
    return { kind: 'choice', part: 'page', unit: p.unit, page: String(p.page), rec: { type: 'pgw', id: p.id + ':' + i, label: w.w, hu: w.hu, unit: p.unit }, prompt: 'q_meaning', big: w.w, audio: [{ l: C.lang, k: 'p:w:' + p.id + ':' + i, t: w.w }], answer: w.w,
      options: opts.map(o => ({ v: o.w, label: o.hu, say: [{ l: 'hu', k: 'p:wh:' + p.id + ':' + o._i, t: o.hu }] })), explain: w.w + ' – ' + w.hu }; }
  function pgGameQs(p, game) { const ws = (p.words || []).map((w, i) => Object.assign({ _i: i }, w)); const lr = p.learn || {}; let qs = [];
    if (game === 'tf' || game === 'mix') qs = qs.concat((lr.tf || []).map((x, i) => tfQ(p, x, i)));
    if ((game === 'words' || game === 'mix') && ws.length >= 2) ws.forEach(w => { qs.push(pgWordQ(p, w, w._i, 'see', ws)); if (game === 'words') qs.push(pgWordQ(p, w, w._i, 'hear', ws)); });
    if (game === 'mix') qs = qs.concat(pgQs(p).slice(0, 8));
    return shuffle(qs); }
  function startPage(pid, tid) { const p = pgFind(pid); if (!p) return; pgPreload(pid); const qs = pgQs(p, tid); if (!qs.length) { toast(hu('pg_none')); return; } ST.pid = pid;
    startRun({ mode: 'page', title: bookName(p.book) + ' · ' + p.page + '. ' + hu('pg_page'), qs, back: 'page', pid, tid: tid || null, instr: 'i_page_run' }); }
  function startPgGame(pid, game) { const p = pgFind(pid); if (!p) return; pgPreload(pid); const qs = pgGameQs(p, game); if (!qs.length) { toast(hu('pg_none')); return; } ST.pid = pid;
    startRun({ mode: 'pgame', title: p.page + '. ' + hu('pg_page') + ' · ' + hu({ tf: 'pg_tf', words: 'pg_wordgame', mix: 'pg_mix' }[game]), qs, back: 'page', pid, game, instr: 'i_page_run' }); }
  // ---- nézetek
  function vPages() {
    const books = pgBooks(); if (!books.length) return topbar(hu('t_pages')) + '<div class="px-card">' + esc(hu('pg_empty')) + '</div>';
    const bk = ST.pgbook && books.some(b => b.id === ST.pgbook) ? ST.pgbook : books[0].id; ST.pgbook = bk;
    const us = pgUnits(bk); const au = activeUnits().filter(u => us.indexOf(u) >= 0); const un = ST.pgunit && us.indexOf(ST.pgunit) >= 0 ? ST.pgunit : (au[0] || us[0]); ST.pgunit = un;
    const ps = pgData().filter(p => p.book === bk && p.unit === un).sort((a, b) => a.page - b.page);
    return topbar(hu('t_pages')) + '<div class="px-row">' + instrBtn('i_pages') + '</div>' +
      '<div class="px-chips">' + books.map(b => '<button type="button" class="chip' + (b.id === bk ? ' on' : '') + '" data-a="pgbook" data-b="' + b.id + '">' + esc(b.title_hu) + '</button>').join('') + '</div>' +
      '<div class="px-chips">' + us.map(u => '<button type="button" class="chip' + (u === un ? ' on' : '') + '" data-a="pgunit" data-u="' + u + '">' + esc(unitTitle(u).length > 24 ? unitTitle(u).slice(0, 22) + '…' : unitTitle(u)) + '</button>').join('') + '</div>' +
      '<div class="px-pgrid">' + ps.map(p => { const pc = pgPct(p.id); const pic = (p.learn && p.learn.sentences || []).map(s => s.pic).filter(Boolean).slice(0, 3).join('') || (p.words || []).map(w => w.pic).filter(Boolean).slice(0, 3).join('');
        return '<button type="button" class="px-pg' + (pc >= 80 ? ' done' : '') + '" data-a="pgopen" data-p="' + p.id + '"><span class="top"><b>' + p.page + '.</b><span class="ics">' + em(pic, 30) + '</span></span><span class="t">' + esc(p.title) + '</span><small>' + esc(p.title_hu) + '</small><span class="m">' + p.tasks.length + ' ' + esc(hu('pg_tasks')) + (pc ? ' · <em>' + pgStars(p.id) + ' ' + pc + '%</em>' : '') + '</span></button>'; }).join('') + '</div>';
  }
  function tabBtn(k, lab, ico) { return '<button type="button" class="ltab' + (ST.pgtab === k ? ' on' : '') + '" data-a="pgtab" data-t="' + k + '">' + em(ico, 30) + '<span>' + esc(lab) + '</span></button>'; }
  function vPage() {
    const p = pgFind(ST.pid); if (!p) return vPages(); const same = pgData().filter(x => x.book === p.book).sort((a, b) => a.page - b.page); const ix = same.indexOf(p);
    const prev = same[ix - 1], next = same[ix + 1]; const lr = p.learn || {}; if (!ST.pgtab) ST.pgtab = lr.sentences ? 'learn' : 'tasks'; const pc = pgPct(p.id);
    const lesson = p.lesson ? '<button type="button" class="pbtn l sm" data-a="openc" data-u="' + p.unit + '" data-c="' + p.lesson + '"><span>' + esc(hu('pg_lesson')) + '</span>' + ICO.next + '</button>' : '';
    let h = topbar(bookName(p.book) + ' · ' + p.page + '. ' + hu('pg_page')) +
      '<div class="px-row"><button type="button" class="pbtn l sm" data-a="go" data-v="pages"><span>← ' + esc(hu('t_pages')) + '</span></button>' + (prev ? '<button type="button" class="pbtn l sm" data-a="pgopen" data-p="' + prev.id + '"><span>← ' + prev.page + '.</span></button>' : '') + (next ? '<button type="button" class="pbtn l sm" data-a="pgopen" data-p="' + next.id + '"><span>' + next.page + '. →</span></button>' : '') + lesson + '</div>' +
      '<div class="px-card px-pghead"><div class="px-row" style="flex-wrap:nowrap">' + kitty(ST.mood, 70) + '<div style="flex:1;min-width:0"><h2 class="px-evt">' + esc(p.title) + ' ' + spk('pgsayt', 'data-p="' + p.id + '"') + '</h2><p class="px-evh">' + esc(p.title_hu) + '</p>' + (pc ? '<p class="px-note" style="margin:2px 0">' + pgStars(p.id) + ' ' + pc + '%</p>' : '') + '</div></div>' +
      (p.summary_hu ? '<p class="px-pgsum">' + esc(p.summary_hu) + ' ' + spk('pgsaysum', 'data-p="' + p.id + '"') + '</p>' : '') +
      (pgImgUrl(p) ? '<button type="button" class="chip' + (ST.pgshow ? ' on' : '') + '" data-a="pgshow">' + esc(hu(ST.pgshow ? 'pg_hide_page' : 'pg_show_page')) + '</button>' + (ST.pgshow ? crop(p, p.page_box || [0, 0, 1, 1], 'full') : '') : '') + '</div>' +
      '<div class="px-ltabs">' + (lr.sentences ? tabBtn('learn', hu('pg_tab_learn'), '💡') : '') + tabBtn('words', hu('pg_words'), '🔤') + tabBtn('tasks', hu('pg_tasks_h'), '✏️') + tabBtn('play', hu('pg_tab_play'), '🎲') + '</div>';
    if (ST.pgtab === 'learn') h += vPgLearn(p); else if (ST.pgtab === 'words') h += vPgWords(p); else if (ST.pgtab === 'play') h += vPgPlay(p); else h += vPgTasks(p);
    return h;
  }
  function vPgLearn(p) { const lr = p.learn || {}; let h = '';
    if (lr.intro) h += '<div class="px-card pgintro">' + em('🐱', 46) + '<div><b>' + esc(lr.intro.es) + '</b><small>' + esc(lr.intro.hu) + '</small></div>' + spk('pgsayi', 'data-p="' + p.id + '"') + '</div>';
    h += '<div class="px-row"><button type="button" class="pbtn g" data-a="pgall2" data-p="' + p.id + '" data-w="s">' + ICO.spk + '<span>' + esc(hu('pg_read_all')) + '</span></button><button type="button" class="pbtn o" data-a="pgall2" data-p="' + p.id + '" data-w="s" data-o="es"><span>' + esc(hu('pg_only_lang')) + '</span></button></div>';
    h += '<ol class="pgsent">' + (lr.sentences || []).map((s, i) => '<li class="' + (ST.pgcur === 's' + i ? 'cur' : '') + '">' + (s.pic ? '<span class="pp">' + em(s.pic, 46) + '</span>' : '<span class="pp n">' + (i + 1) + '</span>') + '<div class="tx"><div class="es"><button type="button" class="wb" data-a="pgsay1" data-p="' + p.id + '" data-k="s" data-i="' + i + '" data-l="es">' + esc(s.es) + '</button></div><div class="hu"><button type="button" class="wb" data-a="pgsay1" data-p="' + p.id + '" data-k="s" data-i="' + i + '" data-l="hu">' + esc(s.hu) + '</button></div>' + (s.vis ? visMore(s.vis) : '') + '</div>' + spk('pgsay2', 'data-p="' + p.id + '" data-k="s" data-i="' + i + '"') + '</li>').join('') + '</ol>';
    if ((lr.remember || []).length) h += '<div class="px-card pgrem"><h3>' + em('📌', 28) + ' ' + esc(hu('pg_remember')) + '</h3>' + lr.remember.map((r, i) => '<div class="rr"><div><b>' + esc(r.es) + '</b><small>' + esc(r.hu) + '</small></div>' + spk('pgsay2', 'data-p="' + p.id + '" data-k="r" data-i="' + i + '"') + '</div>').join('') + '</div>';
    if ((lr.dialogue || []).length) h += '<h3 class="px-h">' + em('💬', 28) + ' ' + esc(hu('pg_dialogue')) + ' <button type="button" class="pbtn o sm" data-a="pgall2" data-p="' + p.id + '" data-w="d">' + ICO.spk + '<span>' + esc(hu('b_listen')) + '</span></button></h3><div class="pgchat">' +
      lr.dialogue.map((d, i) => { const cat = /gat/i.test(d.who); return '<div class="bub ' + (cat ? 'l' : 'r') + (ST.pgcur === 'd' + i ? ' cur' : '') + '"><span class="who">' + (cat ? em('🐱', 26) : em(/mart/i.test(d.who) ? '👦' : '🧒', 26)) + esc(d.who) + '</span><button type="button" class="wb" data-a="pgsay2" data-p="' + p.id + '" data-k="d" data-i="' + i + '"><b>' + esc(d.es) + '</b><small>' + esc(d.hu) + '</small></button></div>'; }).join('') + '</div>';
    h += '<div class="px-row center"><button type="button" class="pbtn b xl" data-a="pgtab" data-t="play">' + em('🎲', 30) + '<span>' + esc(hu('pg_go_play')) + '</span></button></div>';
    return h; }
  function vPgWords(p) { return '<div class="pgwords">' + (p.words || []).map((w, i) => '<button type="button" class="pgw" data-a="pgsayw" data-p="' + p.id + '" data-i="' + i + '">' + (w.pic ? em(w.pic, 54) : '<span class="pgem" style="width:54px;height:54px"><span class="pgemt" style="font-size:30px">🔤</span></span>') + '<b>' + esc(w.w) + '</b><small>' + esc(w.hu) + '</small></button>').join('') + '</div>' +
      '<div class="px-row center"><button type="button" class="pbtn g xl" data-a="pggame" data-p="' + p.id + '" data-g="words">' + em('🎯', 30) + '<span>' + esc(hu('pg_wordgame')) + '</span></button></div>'; }
  function itemHtml(it, show) {
    const ans = it.kind === 'choice' ? ((it.options || [])[it.answer] || {}) : null;
    const a = it.kind === 'choice' ? (ans.t || '') + (ans.hu && ans.hu !== ans.t ? ' – ' + ans.hu : '') : String(it.answer || '');
    const opts = it.kind === 'choice' ? '<div class="px-pgopts">' + (it.options || []).map(o => '<span>' + esc(o.t) + (o.hu && o.hu !== o.t ? ' <small>' + esc(o.hu) + '</small>' : '') + '</span>').join('') + '</div>' : '';
    return '<li class="px-pgi k-' + it.kind + '"><div class="qq">' + (it.pic ? '<span class="ip">' + em(it.pic, 34) + '</span>' : '') + '<div><b>' + esc(it.q) + '</b>' + (it.q_hu && it.q_hu !== it.q ? '<small>' + esc(it.q_hu) + '</small>' : '') + opts + (it.vis ? visMore(it.vis) : '') + '</div>' + spk('pgsayi2', 'data-i="' + esc(it.id) + '"') + '</div>' +
      (show || (ST.pgsol && ST.pgsol[it.id]) ? '<div class="sol"><span>' + esc(hu('pg_solution')) + ':</span> <b>' + esc(a) + '</b>' + (it.answer_hu && it.answer_hu !== a ? '<small>' + esc(it.answer_hu) + '</small>' : '') + '</div>' :
        it.kind === 'open' ? '<button type="button" class="chip" data-a="pgsol" data-i="' + esc(it.id) + '">' + esc(hu('pg_show_sol')) + '</button>' : '') + '</li>';
  }
  function vPgTasks(p) { const show = !!ST.pgall; const nq = pgQs(p).length;
    let h = (nq ? '<button type="button" class="pbtn g xl" data-a="pgstart" data-p="' + p.id + '">' + ICO.next + '<span>' + esc(hu('pg_solve_all')) + '</span><small>' + nq + '</small></button>' : '') +
      '<div class="px-row"><button type="button" class="chip' + (show ? ' on' : '') + '" data-a="pgall">' + esc(hu('pg_parent_sol')) + '</button></div>';
    p.tasks.forEach(t => { const nc = t.items.filter(pgCheckable).length; const helpOn = ST.pghelp && ST.pghelp[t.id];
      h += '<div class="px-card px-pgtask"><div class="px-row" style="flex-wrap:nowrap"><span class="px-pgn">' + esc(t.n) + '</span>' + (t.pic ? '<span class="tp">' + em(t.pic, 34) + '</span>' : '') + '<div class="tt"><b>' + esc(t.text) + '</b><small>' + esc(t.text_hu) + '</small></div>' + spk('pgsayk', 'data-t="' + esc(t.id) + '"') + '</div>' +
        crop(p, t.box, 'task') +
        (t.context ? '<div class="pgctx">' + em('👀', 26) + '<div><b>' + esc(t.context.es) + '</b><small>' + esc(t.context.hu) + '</small></div>' + spk('pgsayc', 'data-t="' + esc(t.id) + '"') + '</div>' : '') +
        (t.help ? (helpOn ? '<div class="pghelp">' + em('💡', 26) + '<div><b>' + esc(t.help.es) + '</b><small>' + esc(t.help.hu) + '</small></div></div>' : '<button type="button" class="chip" data-a="pghelp" data-t="' + esc(t.id) + '">' + em('💡', 20) + ' ' + esc(hu('pg_help')) + '</button>') : '') +
        '<ol class="px-pgis">' + t.items.map(it => itemHtml(it, show)).join('') + '</ol>' +
        (nc ? '<button type="button" class="pbtn g" data-a="pgstart" data-p="' + p.id + '" data-t="' + esc(t.id) + '">' + ICO.next + '<span>' + esc(hu('pg_solve_task')) + '</span><small>' + nc + '</small></button>' : '') + '</div>'; });
    return h; }
  function vPgPlay(p) { const lr = p.learn || {}; const g = (k, ico, lab, sub, n) => n ? '<button type="button" class="px-tile pgtile" data-a="pggame" data-p="' + p.id + '" data-g="' + k + '"><span class="ic">' + em(ico, 50) + '</span><span>' + esc(lab) + '</span><small>' + esc(sub || '') + ' · ' + n + '</small></button>' : '';
    return '<div class="px-tiles">' + g('tf', '✅❌', hu('pg_tf'), S('pg_tf').l, (lr.tf || []).length) + g('words', '🎯', hu('pg_wordgame'), S('pg_wordgame').l, (p.words || []).length * 2) +
      g('mix', '🌈', hu('pg_mix'), S('pg_mix').l, (lr.tf || []).length + (p.words || []).length + Math.min(8, pgQs(p).length)) +
      (pgQs(p).length ? '<button type="button" class="px-tile pgtile" data-a="pgstart" data-p="' + p.id + '"><span class="ic">' + em('✏️', 50) + '</span><span>' + esc(hu('pg_solve_all')) + '</span><small>' + pgQs(p).length + '</small></button>' : '') + '</div>'; }
  function pgItem(iid) { for (const p of pgData()) for (const t of p.tasks) for (const it of t.items) if (it.id === iid) return { p, t, it }; return null; }
  function pgTask(tid) { for (const p of pgData()) for (const t of p.tasks) if (t.id === tid) return { p, t }; return null; }
  function sayLearnAll(p, w, only) { const lr = p.learn || {}; const list = w === 'd' ? (lr.dialogue || []) : (lr.sentences || []); const items = [];
    list.forEach((x, i) => { items.push({ l: C.lang, k: 'p:' + w + ':' + p.id + ':' + i, t: x.es, gap: 250, cur: w + i }); if (!only) items.push({ l: 'hu', k: 'p:' + w + 'h:' + p.id + ':' + i, t: x.hu, gap: 450, cur: w + i }); });
    // a kiemelést lépésenként frissítjük (csak a kártyán)
    let i = 0; const step = () => { if (i >= items.length) { ST.pgcur = null; hl(); return; } const it = items[i++]; ST.pgcur = it.cur; hl(); say([it], step); }; step(); }
  function hl() { try { el.querySelectorAll('.pgsent li, .pgchat .bub').forEach((n, idx) => n.classList.remove('cur')); if (!ST.pgcur) return; const w = ST.pgcur[0], i = +ST.pgcur.slice(1); const list = el.querySelectorAll(w === 'd' ? '.pgchat .bub' : '.pgsent li'); if (list[i]) { list[i].classList.add('cur'); } } catch (e) { } }
  function pgAct(a, d) {
    switch (a) {
      case 'pgbook': ST.pgbook = d.b; ST.pgunit = null; render(); return true;
      case 'pgunit': ST.pgunit = d.u; render(); return true;
      case 'pgopen': { pgPreload(d.p); const keep = ST.pid === d.p; go('page', { pid: d.p, pgsol: keep ? ST.pgsol : {}, pghelp: keep ? ST.pghelp : {}, pgtab: keep ? ST.pgtab : null, pgshow: false }); return true; }
      case 'pgtab': ST.pgtab = d.t; stopAll(); render({ top: false }); return true;
      case 'pgshow': ST.pgshow = !ST.pgshow; render(); return true;
      case 'pgall': ST.pgall = !ST.pgall; render(); return true;
      case 'pgsol': ST.pgsol = ST.pgsol || {}; ST.pgsol[d.i] = 1; render(); return true;
      case 'pghelp': { ST.pghelp = ST.pghelp || {}; ST.pghelp[d.t] = 1; render(); const o = pgTask(d.t); if (o && o.t.help) say([{ l: 'hu', k: 'p:hh:' + o.t.id, t: o.t.help.hu, gap: 200 }, { l: C.lang, k: 'p:h:' + o.t.id, t: o.t.help.es }]); return true; }
      case 'pgstart': startPage(d.p, d.t); return true;
      case 'pggame': startPgGame(d.p, d.g); return true;
      case 'pgsayt': { const p = pgFind(d.p); if (p) say([{ l: C.lang, k: 'p:t:' + p.id, t: p.title }, { l: 'hu', k: 'p:th:' + p.id, t: p.title_hu }]); return true; }
      case 'pgsaysum': { const p = pgFind(d.p); if (p) say([{ l: 'hu', k: 'p:sum:' + p.id, t: p.summary_hu }]); return true; }
      case 'pgsayi': { const p = pgFind(d.p); if (p && p.learn && p.learn.intro) say(pgSay(p.id, 'i', null, p.learn.intro.es, p.learn.intro.hu)); return true; }
      case 'pgsay1': { const p = pgFind(d.p); const x = p && (p.learn || {})[{ s: 'sentences', r: 'remember', d: 'dialogue' }[d.k]][+d.i]; if (!x) return true; const es = { l: C.lang, k: 'p:' + d.k + ':' + p.id + ':' + d.i, t: x.es, gap: 200 }, h2 = { l: 'hu', k: 'p:' + d.k + 'h:' + p.id + ':' + d.i, t: x.hu, gap: 200 }; say(d.l === 'hu' ? [h2, es] : [es, h2]); return true; }
      case 'pgsay2': { const p = pgFind(d.p); const x = p && (p.learn || {})[{ s: 'sentences', r: 'remember', d: 'dialogue' }[d.k]][+d.i]; if (x) say(pgSay(p.id, d.k, d.i, x.es, x.hu)); return true; }
      case 'pgall2': { const p = pgFind(d.p); if (p) sayLearnAll(p, d.w, !!d.o); return true; }
      case 'pgsayw': { const p = pgFind(d.p); const w = p && p.words[+d.i]; if (w) say([{ l: C.lang, k: 'p:w:' + p.id + ':' + d.i, t: w.w }, { l: 'hu', k: 'p:wh:' + p.id + ':' + d.i, t: w.hu }]); return true; }
      case 'pgsayk': { const o = pgTask(d.t); if (o) say([{ l: C.lang, k: 'p:k:' + o.t.id, t: o.t.text }, { l: 'hu', k: 'p:kh:' + o.t.id, t: o.t.text_hu }]); return true; }
      case 'pgsayc': { const o = pgTask(d.t); if (o && o.t.context) say([{ l: C.lang, k: 'p:c:' + o.t.id, t: o.t.context.es }, { l: 'hu', k: 'p:ch:' + o.t.id, t: o.t.context.hu }]); return true; }
      case 'pgsayi2': { const o = pgItem(d.i); if (o) say([{ l: C.lang, k: 'p:q:' + o.it.id, t: o.it.q }, { l: 'hu', k: 'p:qh:' + o.it.id, t: o.it.q_hu }]); return true; }
      case 'pgrunhelp': { const q = curQ(); if (q && q.ctx && q.ctx.help) { ST.run.showHelp = true; render(); say([{ l: 'hu', k: 'p:hh:' + q.ctx.tid, t: q.ctx.help.hu, gap: 200 }, { l: C.lang, k: 'p:h:' + q.ctx.tid, t: q.ctx.help.es }]); } return true; }
    }
    return false;
  }
  function pgFinish(R) { const n = nAns(R) || 1; const pc = Math.round(R.score / n * 100); if (R.mode === 'page' && !R.tid) { P.pg = P.pg || {}; const old = P.pg[R.pid] || 0; const s0 = starsOf(old), s1 = starsOf(pc); if (pc > old) P.pg[R.pid] = pc; R.lessonPct = pc; R.newStars = Math.max(0, s1 - s0); markActive(); if (s1 >= 2) celebrate(s1 === 3); return R.newStars * 2 + 2; } R.lessonPct = pc; markActive(); if (pc >= 80) celebrate(pc >= 95); return pc >= 80 ? 2 : pc >= 50 ? 1 : 0; }
  function ctxHtml(q) { if (!q.ctx) return ''; const c = q.ctx; const R = ST.run;
    return (c.es ? '<div class="px-ctx"><span class="px-pgn">' + esc(c.n) + '</span><div><b>' + esc(c.es) + '</b><small>' + esc(c.hu) + '</small></div></div>' : '') + (c.crop || '') +
      (c.pic || c.vis ? '<div class="px-ctxpic">' + (c.pic ? em(c.pic, 56) : '') + (c.vis ? visMore(c.vis) : '') + '</div>' : '') +
      (c.help ? (R && R.showHelp ? '<div class="pghelp">' + em('💡', 24) + '<div><b>' + esc(c.help.es) + '</b><small>' + esc(c.help.hu) + '</small></div></div>' : '<button type="button" class="chip" data-a="pgrunhelp">' + em('💡', 20) + ' ' + esc(hu('pg_help')) + '</button>') : ''); }
  const PGCSS = '.optw{position:relative;display:flex;min-width:0}.optw>.opt{flex:1;width:100%;padding-right:46px}.optw .osay{position:absolute;top:6px;right:6px;width:40px;height:40px;border-radius:20px;border:2px solid #B85A12;background:#FFF1E4;color:#B85A12;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}.optw .osay svg{width:20px;height:20px}.optw>.opt{word-break:normal;overflow-wrap:break-word;hyphens:auto}@media (max-width:520px){.optw>.opt{font-size:20px;padding:10px 40px 10px 10px}.optw .osay{width:34px;height:34px;top:4px;right:4px}}.px-pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin:10px 0}.px-pg{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;background:#fff;border:2px solid #F2C98F;border-radius:16px;padding:10px;cursor:pointer;font:inherit;color:#3A2A12;min-height:110px}.px-pg .top{display:flex;width:100%;justify-content:space-between;align-items:center}.px-pg b{font-size:22px;color:#B85A12}.px-pg .t{font-weight:800;font-size:14px;line-height:1.2}.px-pg small{color:#6B5A44;font-size:12.5px;line-height:1.2}.px-pg .m{margin-top:auto;font-size:11.5px;color:#22603C}.px-pg .m em{color:#B8860B;font-style:normal;font-weight:800}.px-pg.done{border-color:#6BBF59;background:#F1FAEE}.px-pg:hover{transform:translateY(-2px);box-shadow:0 4px 10px rgba(0,0,0,.08)}' +
    '.pgem{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;flex:0 0 auto}.pgem svg{width:100%;height:100%}.pgemt{line-height:1}' +
    '.px-pghead h2{margin:0}.px-pgsum{margin:8px 0;color:#4A3B26;line-height:1.45}.px-pgtask .tt{display:flex;flex-direction:column;flex:1;min-width:0}.px-pgtask .tt small,.px-ctx small,.pgctx small,.pghelp small{color:#6B5A44;font-size:14px}.px-pgn{display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:32px;padding:0 6px;border-radius:16px;background:#F2891F;color:#fff;font-weight:900;font-size:15px;flex:0 0 auto}' +
    '.px-pgis{list-style:none;margin:8px 0;padding:0;display:flex;flex-direction:column;gap:6px}.px-pgi{background:#FFF9EC;border-radius:12px;padding:8px}.px-pgi .qq{display:flex;gap:8px;align-items:flex-start}.px-pgi .qq>div{display:flex;flex-direction:column;min-width:0;overflow-wrap:anywhere;flex:1}.px-pgi small{color:#6B5A44}.px-pgi .sol{margin-top:4px;color:#8E2A1F;display:flex;flex-direction:column}.px-pgi .sol span{font-size:12px;font-weight:800}.px-pgopts{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px}.px-pgopts span{background:#fff;border:1px solid #E8D5B0;border-radius:8px;padding:1px 6px;font-size:13px}' +
    '.pbtn.xs{min-width:36px;min-height:36px;padding:4px;flex:0 0 auto}.pbtn.xs svg{width:18px;height:18px}.px-ctx{display:flex;gap:8px;align-items:flex-start;background:#FFF1E4;border-radius:12px;padding:8px 10px;margin:6px 0}.px-ctx>div,.pgctx>div,.pghelp>div,.pgintro>div,.pgrem .rr>div{display:flex;flex-direction:column;min-width:0;flex:1}.px-ctxpic{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;margin:6px 0}.px-pg .t,.px-pg small{overflow-wrap:anywhere}' +
    '.pgcrop{position:relative;overflow:hidden;border-radius:12px;border:2px solid #E8D5B0;background:#fff;margin:8px 0;height:0}.pgcrop img{position:absolute;max-width:none;height:auto}.pgcrop.run{max-width:640px;margin:8px auto}.pgcrop.task{max-width:720px}.pgcrop.full{margin-top:10px;max-width:900px}' +
    '.pgctx,.pghelp,.pgintro{display:flex;gap:8px;align-items:flex-start;border-radius:12px;padding:8px 10px;margin:6px 0}.pgctx{background:#EAF4FB}.pghelp{background:#FFF6D6;border:2px dashed #F2C94C}.pgintro{background:#fff;border:3px solid #F7C948}.pgintro b{font-size:18px}' +
    '.px-ltabs{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.px-ltabs .ltab{display:inline-flex;align-items:center;gap:6px;border:2px solid #F2891F;background:#fff;color:#B85A12;border-radius:999px;padding:6px 14px;font:inherit;font-weight:800;cursor:pointer;min-height:44px}.px-ltabs .ltab.on{background:#F2891F;color:#fff}' +
    '.pgsent{list-style:none;margin:8px 0;padding:0;display:flex;flex-direction:column;gap:8px}.pgsent li{display:flex;gap:10px;align-items:flex-start;background:#fff;border-radius:14px;padding:10px;border:2px solid #F3E3C3;transition:background .2s}.pgsent li.cur,.pgchat .bub.cur{background:#FFF1B8;border-color:#F2C94C}.pgsent .pp{flex:0 0 52px;display:flex;justify-content:center}.pgsent .pp.n{width:40px;height:40px;border-radius:20px;background:#6BBF59;color:#fff;font-weight:900;align-items:center;flex:0 0 40px}.pgsent .tx{flex:1;min-width:0}.pgsent .es .wb{font-weight:800;font-size:17px;text-align:left}.pgsent .hu .wb{color:#22603C;font-weight:700;text-align:left}' +
    '.wb{background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer;text-align:left}.wb:hover{text-decoration:underline dotted}' +
    '.pgrem{background:#FFFBEA;border:3px solid #F7C948}.pgrem h3{margin:0 0 6px;display:flex;align-items:center;gap:6px}.pgrem .rr{display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-top:1px dashed #E8D5B0}.pgrem .rr:first-of-type{border-top:0}' +
    '.pgchat{display:flex;flex-direction:column;gap:8px;margin:8px 0}.pgchat .bub{max-width:85%;border-radius:18px;padding:8px 12px;border:2px solid #E8D5B0;background:#fff}.pgchat .bub.l{align-self:flex-start;border-bottom-left-radius:4px}.pgchat .bub.r{align-self:flex-end;background:#EAF7E6;border-bottom-right-radius:4px}.pgchat .who{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:800;color:#6B5A44}.pgchat .wb{display:flex;flex-direction:column}.pgchat small{color:#22603C}' +
    '.pgwords{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin:10px 0}.pgw{display:flex;flex-direction:column;align-items:center;gap:4px;background:#fff;border:2px solid #F3E3C3;border-radius:16px;padding:10px;font:inherit;cursor:pointer;text-align:center}.pgw b{font-size:16px}.pgw small{color:#22603C;font-weight:700}.pgw:hover{transform:scale(1.04)}' +
    '.px-blocks{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin:6px 0}.px-blocks .bk{display:flex;flex-direction:column;align-items:center;gap:2px}.px-blocks .bi{display:flex;flex-wrap:wrap;gap:2px;max-width:150px;align-items:flex-end}.px-blocks small{font-weight:800;color:#1F4E79}' +
    '.pgtile .ic{height:56px}.ip,.tp{flex:0 0 auto}.px-opts .oi .pgem{margin:0 auto}';
  function pgCss() { try { if (document.getElementById('pg-css')) return; const s = document.createElement('style'); s.id = 'pg-css'; s.textContent = PGCSS; document.head.appendChild(s); } catch (e) { } }
  // ---- hang-sprite (darabonként; X.pages.pchunk[oldal] = darab)
  const pgbuf = {}, pgel = {};
  function pgSeg(lang, key) { const sp = X.pages && X.pages.sprite && X.pages.sprite[lang]; return sp ? sp[key] : null; }
  function pgUrl(ch, lang) { const a = X.pages && X.pages.audio && X.pages.audio[ch]; return a ? a[lang] : null; }
  function pgPreload(pidOrChunk) { const ch = (X.pages && X.pages.pchunk && X.pages.pchunk[pidOrChunk]) || pidOrChunk; [C.lang, 'hu'].forEach(l => { const u = pgUrl(ch, l); const id = ch + ':' + l; if (!u) return;
    if (C.xMode === 'ctx') { try { xctx = (H.ctx && H.ctx()) || xctx || new (root.AudioContext || root.webkitAudioContext)(); } catch (e) { } if (xctx && !pgbuf[id] && !pgbuf['_p' + id]) { pgbuf['_p' + id] = 1; fetch(u).then(r => r.arrayBuffer()).then(ab => xctx.decodeAudioData(ab)).then(b => { pgbuf[id] = b; }).catch(() => { pgbuf['_p' + id] = 0; }); } }
    else if (!pgel[id]) { const a = new Audio(u); a.preload = 'auto'; pgel[id] = a; } }); }
  function pgPlay(lang, key, text, done) {
    const seg = pgSeg(lang, key); const id = seg ? seg[2] + ':' + lang : '';
    if (seg && C.xMode === 'ctx' && xctx && pgbuf[id]) { try { if (xctx.state === 'suspended') xctx.resume(); const s = xctx.createBufferSource(); s.buffer = pgbuf[id]; s.connect(xctx.destination); s.start(0, seg[0], seg[1] + 0.1); xsrc = s; s.onended = () => { if (xsrc === s) xsrc = null; done(); }; return; } catch (e) { } }
    if (seg && C.xMode === 'el') { if (!pgel[id]) pgPreload(seg[2]); const a = pgel[id]; if (a) { const stopAt = seg[0] + seg[1] + 0.1; xcur = a;
      const go2 = () => { try { a.currentTime = seg[0]; a.play().catch(() => { }); } catch (e) { } const tick = () => { if (xcur !== a) return; if (a.currentTime >= stopAt || (a.paused && a.currentTime > seg[0] + 0.3)) { a.pause(); xcur = null; done(); } else xtimer = setTimeout(tick, 50); }; xtimer = setTimeout(tick, 50); };
      if (a.readyState >= 1) go2(); else { a.addEventListener('loadedmetadata', go2, { once: true }); a.load(); } return; } }
    if (seg && C.xMode === 'ctx') pgPreload(seg[2]);
    if (root.speechSynthesis && text) { try { const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F000}-\u{1FAFF}☀-➿️]/gu, '')); u.lang = lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-GB' : 'hu-HU'; u.onend = () => done(); u.onerror = () => done(); root.speechSynthesis.speak(u); return; } catch (e) { } }
    setTimeout(done, 300);
  }
  // ================= nézetek =================
  function kitty(mood, size, cls) { mood = mood || 'idle'; let s = C.kitty[mood] || ''; const acc = Object.keys(P.worn).map(slot => X.acc.find(a => a.id === P.worn[slot])).filter(Boolean).map(a => a.svg).join('');
    if (acc) s = s.replace(/<\/svg>\s*$/, acc + '</svg>'); return '<div class="kitty kitty-' + mood + ' ' + (cls || '') + '" style="width:' + size + 'px;height:' + size + 'px">' + s + '</div>'; }
  function topbar(title) {
    return '<div class="px-top"><button type="button" class="pbtn l sm" data-a="home" aria-label="Kezdőlap">' + ICO.home + '<span>' + esc(hu('b_home')) + '</span></button>' +
      '<div class="px-title">' + esc(title || '') + '</div><div class="px-stat">' + ICO.star + '<b>' + P.stars + '</b>' + ICO.flame + '<b>' + globalStreak().n + '</b></div></div>';
  }
  function instrBtn(k) { return '<button type="button" class="pbtn o sm" data-a="instr" data-k="' + k + '">' + ICO.spk + '<span>' + esc(hu('b_help')) + '</span></button>'; }
  function evType(t) { return { spelling: 'ev_spelling', control: 'ev_control', homework: 'ev_homework', test: 'ev_control' }[t] || 'ev_control'; }
  function unitChips(sel) { return '<div class="px-chips">' + [['auto', hu('c_auto')], ['all', hu('c_all')]].concat(H.D.units.map(u => [u.id, u.num + '. ' + (u.es.length > 18 ? u.es.slice(0, 16) + '…' : u.es)])).map(c => '<button type="button" class="chip' + ((P.unit || 'auto') === c[0] ? ' on' : '') + '" data-a="unit" data-u="' + c[0] + '">' + esc(c[1]) + '</button>').join('') + '</div>'; }
  function eventCard(ev) {
    if (!ev) { const fu = fallbackUnits(); const u0 = fu[fu.length - 1]; const links = (u0 ? Plus.linksFor(u0) : []).filter(l => l.kind !== 'folder');
      return '<div class="px-card px-mission"><div class="px-row"><span class="px-chip review">' + esc(hu('review_card')) + '</span></div><h2 class="px-evt">' + esc(hu('no_event')) + '</h2><p class="px-evh">' + esc(hu('review_sub')) + (S('review_sub').l ? '<br><em>' + esc(S('review_sub').l) + '</em>' : '') + '</p>' +
        '<p class="px-evh"><b>' + fu.map(unitTitle).map(esc).join(' · ') + '</b></p>' +
        '<div class="px-row"><button type="button" class="pbtn o" data-a="sayreview">' + ICO.spk + '<span>' + esc(hu('b_listen')) + '</span></button>' + (u0 ? '<button type="button" class="pbtn l" data-a="gounit" data-u="' + u0 + '"><span>' + esc(hu('b_goto')) + '</span>' + ICO.next + '</button>' : '') + '</div>' +
        (links.length ? '<div class="px-links">' + links.map(l => '<a class="px-link" target="_blank" rel="noopener" href="' + esc(l.url) + '">' + ICO.link + '<span>' + esc(l.hu) + '</span></a>').join('') + '</div>' : '') + '</div>'; }
    const d = ev._days; const cd = d === 0 ? hu('cd_today') : d === 1 ? hu('cd_tomorrow') : d + ' ' + hu('cd_days_txt');
    const links = linksFor((ev.units || [])[0], ev); const u0 = (ev.units || [])[0];
    return '<div class="px-card px-mission"><div class="px-row"><span class="px-chip ' + ev.type + '">' + esc(hu(evType(ev.type))) + '</span><span class="px-date">' + esc(ev.date.replace(/-/g, '. ') + '.') + '</span></div>' +
      '<div class="px-cd">' + esc(cd) + '</div><h2 class="px-evt">' + esc(ev.title) + '</h2><p class="px-evh">' + esc(ev.title_hu) + '</p>' +
      '<div class="px-row"><button type="button" class="pbtn o" data-a="sayev" data-id="' + esc(ev.id) + '">' + ICO.spk + '<span>' + esc(hu('b_listen')) + '</span></button>' +
      (u0 ? '<button type="button" class="pbtn l" data-a="gounit" data-u="' + u0 + '"><span>' + esc(hu('b_goto')) + '</span>' + ICO.next + '</button>' : '') + '</div>' +
      (links.length ? '<div class="px-links">' + links.map(l => '<a class="px-link" target="_blank" rel="noopener" href="' + esc(l.url) + '">' + ICO.link + '<span>' + esc(l.hu) + '</span></a>').join('') + '</div>' : '') + '</div>';
  }
  // ---- elkövetkező teendők (2 hét előre, minden esemény)
  const UPC = { hu: 'Elkövetkező teendők – 2 hét', es: 'Próximas tareas y exámenes – 2 semanas', en: 'Upcoming homework and tests – 2 weeks' };
  function upcoming() { return events().filter(e => e._days >= 0 && e._days <= 14); }
  function upcomingHtml(ev) {
    const ups = upcoming(); const sub = C.lang === 'es' ? UPC.es : UPC.en;
    const head = '<style>.px-up .px-cd{font-size:28px}.px-up .px-evt{font-size:21px}.px-h small{display:block;font-size:15px;font-weight:700;color:#6B7785}</style><h3 class="px-h">' + esc(UPC.hu) + '<small>' + esc(sub) + (ups.length ? ' · ' + ups.length + ' db' : '') + '</small></h3>';
    if (!ups.length) return head + eventCard(null);
    return head + ups.map((e, i) => { const h = eventCard(e); return i ? h.replace('px-card px-mission', 'px-card px-mission px-up') : h; }).join('');
  }
  function vHome() {
    const ev = nextEvent(); ST.curEvent = ev; const done = !!P.mission[today()];
    const tiles = mqOn() ? [['mq', 't_mq', 'T10']] : []; if (pgData().length) tiles.push(['pages', 't_pages', 'T5']); tiles.push(['map', 't_map', 'T9'], ['blitz', 't_blitz', 'T10'], ['cards', 't_cards', 'T1'], ['games', 't_games', 'T2'], ['duel', 't_duel', 'T11'], ['space', 't_space', 'T12']);
    if (C.subj === 'mat') tiles.push(['bingo', 't_bingo', 'T13']); tiles.push(['bubble', 't_bubble', 'T14'], ['build', 't_builder', 'T15'], ['room', 't_room', 'T16']);
    if (extraKind()) { const ek = extraKind(); tiles.push([ek, { spelling: 't_spelling', gen: 't_gen', dictado: 't_dictado', tasks: 't_tasks' }[ek], 'T3']); }
    if (Plus.speechOK()) tiles.push(['speak', 't_speak', 'T4']); tiles.push(['testmenu', 't_test', 'T5'], ['album', 't_album', 'T8'], ['shop', 't_shop', 'T6'], ['parent', 't_parent', 'T7']);
    const gs = globalStreak(); const tot = totalStars(); const soon = ev && ev._days >= 0 && ev._days <= 2;
    return '<div class="px-hero">' + kitty(ST.mood, 120, 'hero') + '<div><h1>' + esc(hu('hello')) + '</h1><div class="px-stat big">' + ICO.star + '<b>' + P.stars + '</b>' + ICO.flame + '<b>' + gs.n + '</b><span class="px-sub">' + esc(hu('streak_days')) + (gs.rest ? ' · ' + esc(hu('rest_day')) : '') + '</span></div>' + (tot !== P.stars ? '<div class="px-sub">' + ICO.star + ' <b>' + tot + '</b> ' + esc(hu('stars_total')) + '</div>' : '') + '</div>' +
      '<button type="button" class="pbtn o" data-a="instr" data-k="home_intro">' + ICO.spk + '<span>' + esc(hu('b_listen')) + '</span></button></div>' +
      rewardHtml() + weeklyHtml() + upcomingHtml(ev) + (ev ? readyHtml(ev) : '') +
      (soon ? '<div class="px-card px-final"><div class="px-final-cars">' + carSvg('#3B82C4', 70) + carSvg('#D9362B', 70) + '</div><h2>' + esc(hu('race_final')) + '</h2><p class="px-evh">' + esc(hu('race_sub')) + '</p><button type="button" class="pbtn b xl" data-a="race">' + ICO.next + '<span>' + esc(hu('b_race')) + '</span></button></div>' : '') +
      qnChips() + '<button type="button" class="pbtn g xl" data-a="mission">' + (done ? ICO.ok : ICO.next) + '<span>' + esc(hu(done ? 'b_mission_again' : 'b_mission')) + '</span><small>' + esc(hu(ev ? 'mission_sub' : 'mission_sub_review')) + '</small></button>' +
      '<div class="px-tiles">' + tiles.map(t => '<button type="button" class="px-tile ' + t[2] + '" data-a="' + (['blitz', 'duel', 'space', 'bingo', 'bubble', 'build'].indexOf(t[0]) >= 0 ? t[0] : 'go') + '" data-v="' + t[0] + '"><span class="ic">' + tileIcon(t[0]) + '</span><span>' + esc(hu(t[1])) + '</span><small>' + esc(S(t[1]).l) + '</small></button>').join('') + '</div>';
  }
  function tileIcon(k) { if (k === 'pages' && X.pages && X.pages.emo && X.pages.emo['1F4D6']) return '<span class="pgem" style="width:56px;height:56px">' + X.pages.emo['1F4D6'] + '</span>'; const m = { mq: '<rect x="8" y="8" width="48" height="48" rx="12" fill="#3B82C4" stroke="#1F4E79" stroke-width="3"/><text x="32" y="30" font-size="20" font-weight="900" text-anchor="middle" fill="#fff">7×8</text><text x="32" y="50" font-size="18" font-weight="900" text-anchor="middle" fill="#F7C948">=56</text>', pages: '<path d="M8 14 q12 -6 24 0 v38 q-12 -6 -24 0z" fill="#fff" stroke="#1F4E79" stroke-width="3"/><path d="M32 14 q12 -6 24 0 v38 q-12 -6 -24 0z" fill="#FFF1E4" stroke="#1F4E79" stroke-width="3"/><path d="M14 24 h12 M14 32 h12 M38 24 h12 M38 32 h8" stroke="#F2891F" stroke-width="3"/>', cards: '<rect x="10" y="22" width="40" height="30" rx="5" fill="#fff" stroke="#B85A12" stroke-width="3"/><rect x="22" y="12" width="40" height="30" rx="5" fill="#FFF1E4" stroke="#B85A12" stroke-width="3"/>', games: '<rect x="10" y="22" width="44" height="26" rx="13" fill="#6BBF59" stroke="#22603C" stroke-width="3"/><path d="M22 35 h12 M28 29 v12" stroke="#fff" stroke-width="4"/><circle cx="42" cy="32" r="3" fill="#fff"/><circle cx="48" cy="38" r="3" fill="#fff"/>', dictado: '<path d="M14 48 l6 -22 l24 10 z" fill="#F7C948" stroke="#B8860B" stroke-width="3"/><path d="M20 26 L50 12" stroke="#B85A12" stroke-width="5"/><path d="M40 52 h20" stroke="#B85A12" stroke-width="3"/>', tasks: '<rect x="12" y="10" width="40" height="46" rx="5" fill="#fff" stroke="#22603C" stroke-width="3"/><path d="M20 24 l5 5 9 -10 M20 42 l5 5 9 -10" stroke="#6BBF59" stroke-width="4" fill="none"/><path d="M38 26 h8 M38 44 h8" stroke="#22603C" stroke-width="3"/>', album: '<rect x="8" y="10" width="48" height="44" rx="6" fill="#FFF1E4" stroke="#7D3C98" stroke-width="3"/><circle cx="22" cy="26" r="7" fill="#F7C948"/><rect x="34" y="19" width="14" height="14" rx="3" fill="#6BBF59"/><path d="M16 44 h32" stroke="#7D3C98" stroke-width="3"/>', spelling: '<path d="M14 48 l6 -22 l24 10 z" fill="#F7C948" stroke="#B8860B" stroke-width="3"/><path d="M20 26 L50 12" stroke="#B85A12" stroke-width="5"/>', gen: '<text x="32" y="46" font-size="40" font-weight="900" text-anchor="middle" fill="#B85A12">×</text>', speak: '<rect x="25" y="8" width="14" height="28" rx="7" fill="#E86A7A" stroke="#8E2A1F" stroke-width="3"/><path d="M16 30 a16 16 0 0 0 32 0 M32 46 v10" stroke="#8E2A1F" stroke-width="3" fill="none"/>', testmenu: '<rect x="14" y="8" width="36" height="46" rx="4" fill="#fff" stroke="#1F4E79" stroke-width="3"/><path d="M20 20 h24 M20 30 h24 M20 40 h14" stroke="#1F4E79" stroke-width="3"/>', shop: '<path d="M32 10 l6 14 15 2 -11 10 3 15 -13 -8 -13 8 3 -15 -11 -10 15 -2z" fill="#F7C948" stroke="#B8860B" stroke-width="3"/>', parent: '<circle cx="32" cy="22" r="10" fill="#9AA7B4"/><path d="M12 54 q0 -20 20 -20 q20 0 20 20z" fill="#9AA7B4"/>' }; return '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">' + (m[k] || FUNICO[k] || '') + '</svg>'; }
  // ---- szókártyák
  function vCards() {
    const units = activeUnits(); const p = poolFor(units); const cnt = [0, 0, 0, 0, 0, 0]; p.forEach(w => cnt[boxOf(w.id)]++);
    const due = p.filter(w => dueNow(w.id)).length;
    let h = topbar(hu('t_cards')) + '<div class="px-row">' + instrBtn('i_cards') + '</div>' + qnChips() + unitChips() +
      '<div class="px-boxes">' + [0, 1, 2, 3, 4, 5].map(b => '<div class="px-box b' + b + '"><b>' + cnt[b] + '</b><span>' + (b === 0 ? esc(hu('box_new')) : b + '. ' + esc(hu('box'))) + '</span></div>').join('') + '</div>' +
      '<p class="px-note">' + esc(hu('cards_due')) + ': <b>' + due + '</b> / ' + p.length + '</p>' +
      '<button type="button" class="pbtn g xl" data-a="startcards">' + ICO.next + '<span>' + esc(hu('b_start')) + '</span></button>';
    return h;
  }
  function vCardRun() {
    const R = ST.cards; if (!R) return ''; if (R.i >= R.q.length) return topbar(hu('t_cards')) + '<div class="px-card center"><h2>' + esc(hu('cards_done')) + '</h2><p class="px-big">' + R.ok + ' / ' + R.q.length + '</p><div class="px-row center"><button type="button" class="pbtn g" data-a="startcards">' + esc(hu('b_again')) + '</button><button type="button" class="pbtn l" data-a="home">' + esc(hu('b_home')) + '</button></div></div>';
    const w = R.q[R.i]; const b = boxOf(w.id);
    return topbar(hu('t_cards')) + '<div class="px-prog">' + (R.i + 1) + ' / ' + R.q.length + ' · ' + esc(hu('box')) + ': ' + b + '</div>' +
      '<div class="px-flash' + (R.flip ? ' flip' : '') + '">' + (w.icon ? '<div class="px-ico">' + w.icon + '</div>' : '') + '<div class="px-fw">' + esc(w.es) + '</div>' + (R.flip ? '<div class="px-fh">' + esc(w.hu) + '</div>' : '') +
      '<div class="px-row center"><button type="button" class="pbtn o" data-a="cardsay" data-w="' + w.id + '" data-l="' + C.lang + '">' + ICO.spk + '<span>' + esc(C.lang.toUpperCase()) + '</span></button>' +
      (R.flip ? '<button type="button" class="pbtn o" data-a="cardsay" data-w="' + w.id + '" data-l="hu">' + ICO.spk + '<span>HU</span></button>' : '') + '</div></div>' +
      (!R.flip ? '<button type="button" class="pbtn b xl" data-a="cardflip"><span>' + esc(hu('b_flip')) + '</span></button>' :
        '<div class="px-row center"><button type="button" class="pbtn g xl" data-a="cardgrade" data-ok="1">' + ICO.ok + '<span>' + esc(hu('b_knew')) + '</span></button><button type="button" class="pbtn r xl" data-a="cardgrade" data-ok="0">' + ICO.no + '<span>' + esc(hu('b_notyet')) + '</span></button></div>');
  }
  // ---- játékok menü
  function vGames() { return topbar(hu('t_games')) + '<div class="px-row">' + instrBtn('i_games') + '</div>' + qnChips() + unitChips() +
    '<div class="px-tiles">' + [['memory', 'g_memory', 'T1'], ['listen', 'g_listen', 'T2'], ['drag', 'g_drag', 'T3']].map(t => '<button type="button" class="px-tile ' + t[2] + '" data-a="game" data-g="' + t[0] + '"><span class="ic">' + tileIcon('games') + '</span><span>' + esc(hu(t[1])) + '</span><small>' + esc(S(t[1]).l) + '</small></button>').join('') + '</div>'; }
  // memória
  function startMemory() {
    let p = poolFor(activeUnits(), true); if (p.length < 4) p = pool().filter(w => w.icon); let textOnly = false; if (p.length < 4) { p = poolFor(activeUnits()); if (p.length < 4) p = pool(); textOnly = true; } const ws = (textOnly ? shuffle(p) : dedupIcons(p)).slice(0, Math.min(6, p.length));
    const cards = shuffle(ws.flatMap(w => [{ k: textOnly ? 'h' : 'i', w }, { k: 'w', w }])).map((c, n) => Object.assign(c, { n, open: false, done: false }));
    ST.mem = { cards, first: null, lock: false, moves: 0, pairs: ws.length, found: 0 }; ST.view = 'memory'; render({ top: true }); sayK('i_memory');
  }
  function vMemory() {
    const M = ST.mem; if (!M) return '';
    const win = M.found >= M.pairs;
    return topbar(hu('g_memory')) + '<div class="px-row">' + instrBtn('i_memory') + '<span class="px-prog">' + esc(hu('moves')) + ': ' + M.moves + '</span></div>' +
      '<div class="px-mem">' + M.cards.map(c => '<button type="button" class="mcard' + (c.open || c.done ? ' open' : '') + (c.done ? ' done' : '') + '" data-a="mem" data-n="' + c.n + '" aria-label="' + (c.open || c.done ? esc(c.k === 'h' ? c.w.hu : c.w.es) : '?') + '">' + (c.open || c.done ? (c.k === 'i' ? c.w.icon : c.k === 'h' ? '<span class="px-hutxt">' + esc(c.w.hu.replace(/\s*\([^)]*\)/g, '')) + '</span>' : '<span>' + esc(c.w.es.replace(/\s*\([^)]*\)/g, '')) + '</span>') : '<b>?</b>') + '</button>').join('') + '</div>' +
      (win ? '<div class="px-card center">' + kitty('happy', 110) + '<h2>' + esc(hu('fb_win')) + '</h2><div class="px-row center"><button type="button" class="pbtn g" data-a="game" data-g="memory">' + esc(hu('b_again')) + '</button><button type="button" class="pbtn l" data-a="go" data-v="games">' + esc(hu('b_back')) + '</button></div></div>' : '');
  }
  function memClick(n) {
    const M = ST.mem; if (!M || M.lock) return; const c = M.cards[n]; if (c.open || c.done) return; touch(); c.open = true;
    if (c.k === 'w') say([{ l: C.lang, k: c.w.id, t: c.w.es }]); else if (c.k === 'h') say([{ l: 'hu', k: c.w.id, t: c.w.hu }]);
    if (M.first == null) { M.first = n; render(); return; }
    const a = M.cards[M.first]; M.moves++;
    if (a.w.id === c.w.id && a.k !== c.k) { a.done = c.done = true; a.open = c.open = false; M.first = null; M.found++; record({ type: 'w', id: c.w.id, label: c.w.es, hu: c.w.hu, unit: c.w.unit }, true); award(1); try { H.sfxGood(); } catch (e) { } ST.mood = 'happy'; render(); say(wordItems(c.w)); if (M.found >= M.pairs) { award(3); markActive(); setTimeout(() => sayHu('fb_win'), 2600); } }
    else { M.lock = true; render(); record({ type: 'w', id: c.w.id, label: c.w.es, hu: c.w.hu, unit: c.w.unit }, false); setTimeout(() => { a.open = c.open = false; M.first = null; M.lock = false; if (ST.view === 'memory') render(); }, 1000); }
  }
  // "halld és válaszd" és "húzd a képet a szóhoz"
  function startListen() {
    const units = activeUnits(); let p = poolFor(units); if (p.length < 4) p = pool(); const hasIcon = poolFor(units, true).length >= 6; if (hasIcon) p = poolFor(units, true); const ws = cyc(hasIcon ? dedupIcons(p) : p, QN());
    startRun({ mode: 'practice', title: hu('g_listen'), qs: ws.map(w => vocabQ(w, 'hear', p)), back: 'games', instr: 'i_listen' });
  }
  function startDrag() {
    let p = poolFor(activeUnits(), true); if (p.length < 4) p = pool().filter(w => w.icon); if (p.length < 4) p = poolFor(activeUnits()); if (p.length < 4) p = pool(); const ws = dedupIcons(p).slice(0, Math.min(4, p.length));
    ST.drag = { ws, slots: ws.map(() => null), chips: shuffle(ws.map(w => w.id)), sel: null, wrong: null }; ST.view = 'drag'; render({ top: true }); sayK('i_drag');
  }
  function picOf(w) { return w.icon || '<span class="px-hutxt">' + esc(w.hu.replace(/\s*\([^)]*\)/g, '')) + '</span>'; }
  function vDrag() {
    const Dg = ST.drag; if (!Dg) return ''; const placed = Dg.slots.filter(Boolean).length; const win = placed >= Dg.ws.length;
    return topbar(hu('g_drag')) + '<div class="px-row">' + instrBtn('i_drag') + '</div>' +
      '<div class="px-slots">' + Dg.ws.map((w, i) => '<div class="px-slot' + (Dg.slots[i] ? ' filled' : '') + '" data-slot="' + i + '" data-a="slot" data-i="' + i + '"><div class="px-slotimg">' + (Dg.slots[i] ? picOf(w) : '') + '</div><div class="px-slotw">' + esc(w.es.replace(/\s*\([^)]*\)/g, '')) + '</div></div>').join('') + '</div>' +
      '<div class="px-chipsrow">' + Dg.chips.filter(id => Dg.slots.indexOf(id) < 0).map(id => { const w = Dg.ws.find(x => x.id === id); return '<div class="px-pic' + (Dg.sel === id ? ' sel' : '') + '" data-drag="' + id + '" data-a="pic" data-id="' + id + '" role="button" tabindex="0">' + picOf(w) + '</div>'; }).join('') + '</div>' +
      (win ? '<div class="px-card center">' + kitty('happy', 110) + '<h2>' + esc(hu('fb_win')) + '</h2><div class="px-row center"><button type="button" class="pbtn g" data-a="game" data-g="drag">' + esc(hu('b_again')) + '</button><button type="button" class="pbtn l" data-a="go" data-v="games">' + esc(hu('b_back')) + '</button></div></div>' : '');
  }
  function dragPlace(id, i) {
    const Dg = ST.drag; if (!Dg || Dg.slots[i]) return; const w = Dg.ws[i]; touch();
    if (w.id === id) { Dg.slots[i] = id; Dg.sel = null; record({ type: 'w', id: w.id, label: w.es, hu: w.hu, unit: w.unit }, true); award(1); try { H.sfxGood(); } catch (e) { } ST.mood = 'happy'; render(); say(wordItems(w)); if (Dg.slots.every(Boolean)) { award(3); markActive(); setTimeout(() => sayHu('fb_win'), 2400); } }
    else { const bad = Dg.ws.find(x => x.id === id); record({ type: 'w', id: bad.id, label: bad.es, hu: bad.hu, unit: bad.unit }, false); try { H.sfxBad(); } catch (e) { } ST.mood = 'sad'; Dg.sel = null; Dg.wrong = i; render(); sayHu('fb_bad'); setTimeout(() => { Dg.wrong = null; ST.mood = 'idle'; if (ST.view === 'drag') render(); }, 900); }
  }
  // ---- spelling (en)
  function vSpelling() {
    const ws = weeks(); const sel = ST.week || (weekFor(nextEvent()) || ws[0] || {}).id;
    return topbar(hu('t_spelling')) + '<div class="px-row">' + instrBtn('i_spelling') + '</div>' + qnChips() +
      '<div class="px-chips">' + ws.slice().reverse().map(w => '<button type="button" class="chip' + (w.id === sel ? ' on' : '') + '" data-a="week" data-id="' + esc(w.id) + '">' + esc(w.title_hu) + (w.test_date ? ' · ' + w.test_date.slice(5).replace('-', '.') + '.' : '') + '</button>').join('') + '</div>' +
      (function () { const w = ws.find(x => x.id === sel); return w ? '<div class="px-card"><div class="px-words">' + w.words.map(x => '<button type="button" class="wchip2" data-a="saywk" data-w="' + esc(x.w) + '">' + esc(x.w) + '<small>' + esc(x.hu) + '</small></button>').join('') + '</div></div>' : ''; })() +
      '<button type="button" class="pbtn g xl" data-a="startspell">' + ICO.next + '<span>' + esc(hu('b_start')) + '</span></button>';
  }
  function startSpelling(weekId, mode) {
    const ws = weeks(); const w = ws.find(x => x.id === (weekId || ST.week)) || weekFor(nextEvent()); if (!w) return;
    ST.week = w.id; const list = cyc(w.words, QN()); startRun({ mode: 'practice', title: hu('t_spelling'), qs: list.map(x => spellQ(x, w.unit)), back: 'spelling', instr: 'i_spell_run' });
  }
  // ---- dictado (lengua): a hang kimondja a szót, Martin beírja. SOHA nem betűztetünk.
  function dictWords(unit) {
    const out = [], seen = {}; const huC = h => String(h || '').replace(/\s*\([^)]*\)/g, '').trim();
    const add = (w, h, k, kh, alts) => { const n = norm(w); if (!n || seen[n]) return; seen[n] = 1; out.push({ w, hu: huC(h) || h, k, kh, alts: alts || [] }); };
    ((X.dictado && X.dictado.lists) || []).filter(l => l.unit === unit).forEach(l => l.words.forEach(x => add(x.w, x.hu, 'x:sp:' + x.w, 'x:sph:' + x.w)));
    H.D.glossary.filter(g => g.unit === unit).forEach(g => { const full = g.es.replace(/\s*\([^)]*\)/g, '').trim(); const bare = full.replace(/^(el|la|los|las|un|una)\s+/i, '');
      if (/^[a-záéíóúüñ]{3,14}$/i.test(bare) && !/[\/,]/.test(g.hu)) add(full, g.hu, 'g:' + g.i, 'g:' + g.i, bare !== full ? [bare] : []); });
    return out;
  }
  function dictQ(x, unit) { return { kind: 'type', part: 'dictado', unit: unit || 'u1', page: '', rec: { type: 'dc', id: norm(x.w), label: x.w, hu: x.hu, unit: unit || '' }, prompt: 'q_write_es', big: x.hu, audio: [{ l: C.lang, k: x.k, t: x.w }, { l: 'hu', k: x.kh, t: x.hu }], answer: x.w, alts: x.alts || [], explain: x.w, accent: true, reveal: [{ l: C.lang, k: x.k, t: x.w }] }; }
  function dictUnits() { const all = unitsList(); const has = all.filter(u => dictWords(u).length >= 4); return has.length ? has : all; }
  function vDictado() {
    const us = dictUnits(); const au = activeUnits().filter(u => us.indexOf(u) >= 0); const sel = ST.dunit || (au[0] || us[0]);
    const ws = dictWords(sel);
    return topbar(hu('t_dictado')) + '<div class="px-row">' + instrBtn('i_dictado') + '</div>' + qnChips() +
      '<div class="px-chips">' + us.map(u => '<button type="button" class="chip' + (u === sel ? ' on' : '') + '" data-a="dunit" data-u="' + u + '">' + esc(unitTitle(u).length > 22 ? unitTitle(u).slice(0, 20) + '…' : unitTitle(u)) + '</button>').join('') + '</div>' +
      '<div class="px-card"><div class="px-words">' + ws.slice(0, 40).map(x => '<button type="button" class="wchip2" data-a="saydw" data-u="' + sel + '" data-w="' + esc(norm(x.w)) + '">' + esc(x.w) + '<small>' + esc(x.hu) + '</small></button>').join('') + '</div></div>' +
      '<button type="button" class="pbtn g xl" data-a="startdict">' + ICO.next + '<span>' + esc(hu('b_start')) + '</span><small>' + ws.length + '</small></button>';
  }
  function startDictado(unit) { const u = unit || ST.dunit || dictUnits()[0]; const ws = cyc(dictWords(u), QN()); if (!ws.length) return; ST.dunit = u; startRun({ mode: 'practice', title: hu('t_dictado'), qs: ws.map(x => dictQ(x, u)), back: 'dictado', instr: 'i_dictado_run' }); }
  // ---- tantárgyi feladatok (cs, ns, ac): csoportosítás, párosítás, igaz/hamis
  function taskQ(t) { let opts = t.options.map((o, i) => ({ v: i, label: o.t, sm: o.hu })); if (t.kind === 'match') opts = shuffle(opts);
    return { kind: 'choice', part: 'task', unit: t.unit, page: '', rec: { type: 'tk', id: t.id, label: t.q, hu: t.q_hu, unit: t.unit }, prompt: { sort: 'q_sort', tf: 'q_tf', match: 'q_pick' }[t.kind] || null, big: t.q, small: t.q_hu,
      audio: [{ l: C.lang, k: 'x:tk:' + t.id, t: t.q }, { l: 'hu', k: 'x:tkh:' + t.id, t: t.q_hu }], answer: t.answer, options: opts, explain: t.explain + ' – ' + t.explain_hu,
      reveal: [{ l: C.lang, k: 'x:tke:' + t.id, t: t.explain }, { l: 'hu', k: 'x:tkeh:' + t.id, t: t.explain_hu }] }; }
  function taskUnits() { const us = unitsList().filter(u => tasksAll().some(t => t.unit === u)); return us.length ? us : unitsList(); }
  function vTasks() {
    const us = taskUnits(); const au = activeUnits().filter(u => us.indexOf(u) >= 0); const sel = ST.tunit || (au[0] || us[0]); const ts = tasksAll().filter(t => t.unit === sel);
    return topbar(hu('t_tasks')) + '<div class="px-row">' + instrBtn('i_tasks') + '</div>' + qnChips() +
      '<div class="px-chips">' + us.map(u => '<button type="button" class="chip' + (u === sel ? ' on' : '') + '" data-a="tunit" data-u="' + u + '">' + esc(unitTitle(u).length > 22 ? unitTitle(u).slice(0, 20) + '…' : unitTitle(u)) + '</button>').join('') + '</div>' +
      '<div class="px-card"><p style="margin:0 0 6px;font-weight:800">' + esc(hu('tasks_kinds')) + '</p><div class="px-words">' + ts.slice(0, 12).map(t => '<span class="wchip2" style="cursor:default">' + esc(t.q.length > 46 ? t.q.slice(0, 44) + '…' : t.q) + '<small>' + esc(t.q_hu.length > 46 ? t.q_hu.slice(0, 44) + '…' : t.q_hu) + '</small></span>').join('') + '</div></div>' +
      '<button type="button" class="pbtn g xl" data-a="starttasks">' + ICO.next + '<span>' + esc(hu('b_start')) + '</span><small>' + Math.min(10, ts.length) + '</small></button>';
  }
  function startTasks(unit) { const u = unit || ST.tunit || taskUnits()[0]; const ts = cyc(tasksAll().filter(t => t.unit === u), QN()); if (!ts.length) return; ST.tunit = u; startRun({ mode: 'practice', title: hu('t_tasks'), qs: ts.map(taskQ), back: 'tasks', instr: 'i_tasks_run' }); }
  // ---- matek-generátor
  function vGen() {
    const ts = MG.TOPICS; const sel = ST.topic || 'mix';
    return topbar(hu('t_gen')) + '<div class="px-row">' + instrBtn('i_gen') + '</div>' + qnChips() +
      '<div class="px-chips"><button type="button" class="chip' + (sel === 'mix' ? ' on' : '') + '" data-a="topic" data-t="mix">' + esc(hu('c_mix')) + '</button>' + ts.map(t => '<button type="button" class="chip' + (sel === t ? ' on' : '') + '" data-a="topic" data-t="' + t + '">' + esc(MG.TOPIC_NAME[t][0]) + ' · ' + esc(MG.TOPIC_NAME[t][1]) + ' <i>' + '★'.repeat(level(t)) + '</i></button>').join('') + '</div>' +
      '<button type="button" class="pbtn g xl" data-a="startgen">' + ICO.next + '<span>' + esc(hu('b_start')) + '</span></button>';
  }
  function startGen() { const units = ST.genUnits || unitsList(); startRun({ mode: 'practice', title: hu('t_gen'), gen: () => { const t = ST.topic && ST.topic !== 'mix' ? ST.topic : pickTopic(unitsList()); return genQ(t, level(t)); }, qs: [], limit: QN(), back: 'gen', instr: 'i_gen_run' }); }
  // ---- kiejtés
  Plus.speechOK = () => !!(root.SpeechRecognition || root.webkitSpeechRecognition);
  function vSpeak() {
    const q = ST.sy; if (!q) return '';
    return topbar(hu('t_speak')) + '<div class="px-row">' + instrBtn('i_speak') + '</div>' + unitChips() +
      '<div class="px-flash"><div class="px-fw">' + esc(q.w.es.replace(/\s*\([^)]*\)/g, '')) + '</div><div class="px-fh">' + esc(q.w.hu) + '</div>' + (q.w.icon ? '<div class="px-ico">' + q.w.icon + '</div>' : '') +
      '<div class="px-row center"><button type="button" class="pbtn o" data-a="cardsay" data-w="' + q.w.id + '" data-l="' + C.lang + '">' + ICO.spk + '<span>' + esc(C.lang.toUpperCase()) + '</span></button></div></div>' +
      '<div class="px-row center"><button type="button" class="pbtn ' + (q.listening ? 'r' : 'g') + ' xl" data-a="mic">' + ICO.mic + '<span>' + esc(hu(q.listening ? 'mic_listening' : 'b_speak')) + '</span></button><button type="button" class="pbtn l" data-a="speaknext">' + ICO.next + '<span>' + esc(hu('b_skip')) + '</span></button></div>' +
      (q.msg ? '<div class="px-card center ' + (q.res === 'ok' ? 'good' : '') + '">' + (q.res === 'ok' ? kitty('happy', 100) : '') + '<p class="px-big">' + esc(hu(q.msg)) + '</p>' + (q.heard ? '<p class="px-note">' + esc(hu('heard')) + ': „' + esc(q.heard) + '”</p>' : '') + '</div>' : '');
  }
  function nextSpeak() { const p = poolFor(activeUnits()).filter(w => w.es.split(/\s+/).length <= 2); const w = pickN(p.length ? p : pool(), 1)[0]; ST.sy = { w, listening: false, msg: '', res: '' }; ST.view = 'speak'; render({ top: !ST.sy.first }); say([{ l: C.lang, k: w.id, t: w.es }]); }
  function doMic() {
    const q = ST.sy; if (!q || q.listening) return; const SR = root.SpeechRecognition || root.webkitSpeechRecognition; if (!SR) return; touch();
    stopAll(); let rec; try { rec = new SR(); } catch (e) { q.msg = 'mic_err'; render(); return; }
    rec.lang = C.lang === 'es' ? 'es-ES' : 'en-GB'; rec.interimResults = false; rec.maxAlternatives = 5; rec.continuous = false;
    q.listening = true; q.msg = ''; q.heard = ''; render(); let got = false;
    rec.onresult = ev => { got = true; const alts = []; for (let i = 0; i < ev.results[0].length; i++) alts.push(ev.results[0][i].transcript); q.heard = alts[0] || ''; const target = norm(q.w.es.replace(/\s*\([^)]*\)/g, '').replace(/^(el|la|los|las|un|una|the|a|an|to)\s+/i, ''));
      const ok = alts.some(a => { const n = norm(a); return n === target || n.split(' ').indexOf(target) >= 0 || n.replace(/^(the|a|an|el|la)\s+/, '') === target; });
      q.listening = false; q.res = ok ? 'ok' : 'no'; q.msg = ok ? 'fb_pron_ok' : 'fb_pron_try'; record({ type: 'pr', id: q.w.id, label: q.w.es, hu: q.w.hu, unit: q.w.unit }, ok); if (ok) { award(2); ST.mood = 'happy'; try { H.sfxGood(); } catch (e) { } } render(); sayHu(ok ? 'fb_pron_ok' : 'fb_pron_try'); };
    rec.onerror = e => { q.listening = false; const code = e && e.error; q.msg = code === 'not-allowed' || code === 'service-not-allowed' ? 'mic_denied' : code === 'no-speech' ? 'mic_nospeech' : 'mic_err'; render(); sayHu(q.msg); };
    rec.onend = () => { if (q.listening) { q.listening = false; if (!got) { q.msg = 'mic_nospeech'; render(); } } };
    try { rec.start(); } catch (e) { q.listening = false; q.msg = 'mic_err'; render(); }
  }
  // ---- próbadolgozat
  function vTestMenu() {
    const last = P.tests.slice(-3).reverse();
    const ev = nextEvent(); const cs = (P.certs || []).map((c, i) => ({ c, i })).reverse().slice(0, 8);
    return topbar(hu('t_test')) + '<div class="px-row">' + instrBtn('i_test') + '</div>' + qnChips() + (ev ? '<div class="px-card px-final"><div class="px-final-cars">' + carSvg('#3B82C4', 60) + carSvg('#D9362B', 60) + '</div><p class="px-evh">' + esc(ev.title_hu) + '</p><button type="button" class="pbtn b" data-a="race">' + ICO.next + '<span>' + esc(hu('b_race')) + '</span></button></div>' : '') +
      (cs.length ? '<h3 class="px-h">' + esc(hu('certs')) + '</h3><div class="px-row">' + cs.map(o => '<button type="button" class="pbtn l sm" data-a="cert" data-i="' + o.i + '">' + ICO.star + '<span>' + esc(o.c.units.join(', ')) + ' · ' + o.c.pct + '%</span></button>').join('') + '</div>' : '') + '<div class="px-chips">' + H.D.units.map(u => '<button type="button" class="chip big" data-a="starttest" data-u="' + u.id + '">' + u.num + '. ' + esc(u.es) + '<small>' + esc(u.hu) + '</small></button>').join('') + '</div>' +
      (last.length ? '<h3 class="px-h">' + esc(hu('last_tests')) + '</h3>' + last.map(t => '<div class="px-card slim">' + esc(unitTitle(t.unit)) + ' · <b>' + t.score + ' / ' + t.total + '</b> · ' + new Date(t.ts).toLocaleDateString('hu-HU') + '</div>').join('') : '');
  }
  function unitTitle(id) { const u = H.D.units.find(x => x.id === id); return u ? u.num + '. ' + u.es : id; }
  function buildTest(unit) {
    const D = H.D, p = pool().filter(w => w.unit === unit), qs = [];
    const nv = C.subj === 'en' ? 4 : C.subj === 'mat' || C.subj === 'lengua' ? 3 : 5, nq = C.subj === 'en' ? 4 : C.subj === 'mat' || C.subj === 'lengua' ? 3 : 5; const vocab = pickN(p, Math.min(nv, p.length)); vocab.forEach((w, i) => qs.push(vocabQ(w, ['hear', 'tr', 'see'][i % 3], p.length > 3 ? p : pool())));
    pickN(D.quiz.filter(q => q.unit === unit), nq).forEach(q => qs.push(quizQ(q)));
    if (C.subj === 'en') { const w = weeks().find(x => x.unit === unit); const sw = w ? pickN(w.words, 2) : []; const own = pickN(p.filter(x => /^[a-z]+$/.test(x.es)), 2); (sw.length ? sw : own.map(x => ({ w: x.es, hu: x.hu }))).forEach(x => { if (X.xsprite[C.lang]['x:sp:' + x.w]) qs.push(spellQ(x, unit)); }); }
    else if (C.subj === 'lengua') pickN(dictWords(unit), 3).forEach(x => qs.push(dictQ(x, unit)));
    else if (C.subj === 'mat') { const ts = topicsForUnits([unit]); for (let i = 0; i < 4; i++) { const t = ts[i % ts.length]; qs.push(genQ(t, Math.min(4, Math.max(2, level(t))))); } }
    return qs;
  }
  function startTest(unit) { const qs = fillTo(buildTest(unit), [unit], QN()); if (!qs.length) return; startRun({ mode: 'test', title: hu('t_test') + ' · ' + unitTitle(unit), unit, qs, secs: Math.max(300, qs.length * 45), back: 'testmenu', instr: 'i_test_run' }); }
  // ---- futtató nézet
  function vRun() {
    const R = ST.run; if (!R) return ''; if (R.done) return vRunDone();
    const q = curQ(); const n = R.gen ? (R.limit || R.qs.length) : R.qs.length; const prog = R.endless ? (R.i + 1) + '.' : (R.i + 1) + ' / ' + n;
    let h = topbar(R.title) + '<div class="px-row"><span class="px-prog">' + esc(prog) + '</span>' + comboBadge(R) + (R.end ? '<span class="px-timer" id="px-timer">' + (function () { const left = Math.max(0, Math.round((R.end - Date.now()) / 1000)); return Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'); })() + '</span>' : '') + (R.sw ? '<span class="px-timer" id="px-sw">⏱ ' + mqFmt((Date.now() - R.start) / 1000) + '</span>' : '') +
      (q.audio || q.task || q.items ? '<button type="button" class="pbtn o sm" data-a="qsay">' + ICO.spk + '<span>' + esc(hu('b_again_listen')) + '</span></button>' : '') + (R.instr && R.mode !== 'test' ? instrBtn(R.instr) : '') + '</div>';
    const showFb = R.ans !== null && R.mode !== 'test'; const answered = showFb;
    if (R.boss) h += bossHtml(R); if (R.duel) h += duelHtml(R); if (R.fast && R.flashOk != null) { h += '<div class="fx-flash ' + (R.flashOk ? 'ok' : 'bad') + '">' + (R.flashOk ? '✔' : '✘') + '</div>'; R.flashOk = null; }
    if (R.mode === 'test') { const n2 = R.qs.length || 1; const me = R.score / n2, riv = Math.min(1, R.res.length * 0.75 / n2);
      h += '<div class="px-race" aria-hidden="true"><div class="lane me"><span class="fin"></span><span class="car" style="left:calc(' + (me * 100) + '% - ' + Math.round(me * 56) + 'px)">' + carSvg('#3B82C4') + '</span></div><div class="lane"><span class="fin"></span><span class="car" style="left:calc(' + (riv * 100) + '% - ' + Math.round(riv * 56) + 'px)">' + carSvg('#D9362B') + '</span></div></div>'; }
    h += ctxHtml(q);
    if (q.fix && R.mode !== 'test') h += '<div class="px-fix">' + esc(hu('fix_badge')) + '</div>';
    h += '<div class="px-q' + (showFb ? (R.ok ? ' okfx' : ' badfx') : '') + '">' + (q.again ? '<div class="px-fix">↻ ' + esc(mt('again')) + '</div>' : '') + (R.mode !== 'test' || true ? '<div class="px-kit">' + kitty(showFb ? (R.ok ? 'happy' : 'sad') : (R.ok === 'retry' ? 'sad' : 'idle'), 96, showFb && R.ok ? (ST.kanim || 'k-jump') : '') + '</div>' : '') + '<div class="px-qb">';
    if (q.prompt) h += '<div class="px-prompt">' + bi(q.prompt) + '</div>';
    if (q.big) h += '<div class="px-bigq' + (q.part === 'math' ? ' math' : '') + '">' + esc(q.big) + '</div>'; if (q.small) h += '<div class="px-smallq">' + esc(q.small) + '</div>';
    if (q.task && q.task.vis) h += visHtml(q.task.vis, q.task);
    if (q.mq && q.mq.vis) h += mqVis(q.mq.vis, q);
    h += '</div></div>';
    if (q.kind === 'choice') h += '<div class="px-opts n' + q.options.length + '">' + q.options.map((o, i) => { let cls = 'opt big'; if (answered) { if (String(o.v) === String(q.answer)) cls += ' correct'; else if (String(o.v) === String(R.ans)) cls += ' wrong'; else cls += ' dim'; }
      return '<div class="optw"><button type="button" class="' + cls + '" data-a="pick" data-i="' + i + '">' + (o.icon ? '<span class="oi">' + o.icon + '</span>' : '') + '<span>' + esc(o.label) + '</span>' + (o.es ? '<small>' + esc(o.es) + ' · ' + esc(o.hu) + '</small>' : o.sm ? '<small>' + esc(o.sm) + '</small>' : '') + '</button>' + (o.icon && !o.label ? '' : '<button type="button" class="osay" data-a="osay" data-i="' + i + '" aria-label="' + esc(hu('b_listen')) + ': ' + esc(o.label) + '">' + ICO.spk + '</button>') + '</div>'; }).join('') + '</div>';
    else if (q.kind === 'type') h += '<div class="px-type"><input id="px-input" class="px-input" type="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" value="' + esc(R.typed) + '" ' + (answered ? 'disabled' : '') + ' placeholder="' + esc(hu('type_here')) + '" aria-label="' + esc(hu('type_here')) + '"><button type="button" class="pbtn g" data-a="check"' + (answered ? ' disabled' : '') + '>' + ICO.ok + '<span>' + esc(hu('b_check')) + '</span></button></div>' + (C.lang === 'es' && !answered ? '<div class="px-chars">' + ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü'].map(c => '<button type="button" class="chip" data-a="ch" data-c="' + c + '">' + c + '</button>').join('') + '</div>' : '') + (R.ok === 'retry' ? '<div class="px-fb bad">' + esc(hu('fb_retry')) + '</div>' : '');
    else if (q.kind === 'num') h += numpadHtml(R, answered);
    else if (q.kind === 'line') h += lineHtml(R, q, answered);
    else if (q.mq) h += mqInput(R, q, answered);
    if (!showFb && q.kind !== 'flash' && !R.duel) h += skipBtn(R);
    if (showFb) {
      const lowOk = String(R.ans == null ? '' : R.ans).trim().toLowerCase(); const accent = q.accent && R.ok && q.kind === 'type' && lowOk !== q.answer.toLowerCase() && !(q.alts || []).some(a => a.toLowerCase() === lowOk);
      const hint = (q.mq && !R.ok) ? '<b class="px-answer">' + esc(mqAnsLabel(q)) + '</b>' : ((!R.ok && q.kind === 'type') || accent) ? (accent ? '<span class="px-exp">' + esc(hu('accent_note')) + '</span> ' : '') + '<b class="px-answer">' + esc(q.answer) + '</b>' : '';
      h += '<div class="px-fb ' + (R.ok ? 'good' : 'bad') + '"><b>' + esc(hu(R.ok ? 'fb_ok_title' : 'fb_bad_title')) + '</b> ' + hint + (q.explain && q.kind !== 'type' ? '<span class="px-exp">' + esc(q.explain) + '</span>' : '') + (ST.levelUp ? '<span class="px-lvl">' + esc(hu('level_up')) + ' ★</span>' : '') + '</div>' +
        '<div class="px-row"><button type="button" class="pbtn g xl" data-a="next">' + ICO.next + '<span>' + esc(hu(R.endless || R.i + 1 < n ? 'b_next' : 'b_result')) + '</span></button>' + (R.endless ? '<button type="button" class="pbtn l" data-a="finish"><span>' + esc(hu('b_done')) + '</span></button>' : '') + '</div>';
    }
    if (q.kind === 'flash') h = vFlashRun();
    return h;
  }
  function numpadHtml(R, answered) { return '<div class="px-numshow">' + esc(R.num || '…') + '</div><div class="px-numpad">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map(k => '<button type="button" class="np ' + (k === '✓' ? 'go' : '') + '" data-a="np" data-k="' + k + '"' + (answered ? ' disabled' : '') + '>' + k + '</button>').join('') + '</div>'; }
  function lineHtml(R, q, answered) {
    const t = q.task.p; const pos = R.lineV == null ? t.min : R.lineV; const pct = (pos - t.min) / (t.max - t.min) * 100; const n = (t.max - t.min) / t.step;
    const ticks = []; for (let i = 0; i <= n; i++) ticks.push('<span class="tk' + (i % (n > 20 ? 5 : 1) === 0 ? ' big' : '') + '" style="left:' + (i / n * 100) + '%">' + (n <= 20 || i % 5 === 0 ? '<i>' + (t.min + i * t.step) + '</i>' : '') + '</span>');
    return '<div class="px-line" id="px-line" data-min="' + t.min + '" data-max="' + t.max + '" data-step="' + t.step + '"><div class="ln"></div>' + ticks.join('') + '<div class="flag" id="px-flag" style="left:' + pct + '%"><b>' + pos + '</b><svg width="34" height="40" viewBox="0 0 34 40" aria-hidden="true"><path d="M4 38 V4 L30 12 L4 20" fill="#E86A7A" stroke="#8E2A1F" stroke-width="3" stroke-linejoin="round"/></svg></div></div>' +
      '<div class="px-row center"><button type="button" class="pbtn g xl" data-a="linego"' + (answered ? ' disabled' : '') + '>' + ICO.ok + '<span>' + esc(hu('b_check')) + '</span></button></div>';
  }
  function visHtml(v, task) {
    if (v.type === 'groups') { let s = ''; const r = 7, gap = 18; const cols = Math.min(v.size, 10); const gw = cols * gap + 8, rows = Math.ceil(v.size / cols), gh = rows * gap + 8;
      const colsG = Math.min(v.n, Math.max(1, Math.floor(600 / (gw + 12)))); const W = colsG * (gw + 12), Hh = Math.ceil(v.n / colsG) * (gh + 12);
      for (let g = 0; g < v.n; g++) { const gx = (g % colsG) * (gw + 12), gy = Math.floor(g / colsG) * (gh + 12); s += '<rect x="' + gx + '" y="' + gy + '" width="' + gw + '" height="' + gh + '" rx="10" fill="#FFF1E4" stroke="#F2A65A" stroke-width="2"/>'; for (let i = 0; i < v.size; i++) s += '<circle cx="' + (gx + 4 + (i % cols) * gap + r + 2) + '" cy="' + (gy + 4 + Math.floor(i / cols) * gap + r + 2) + '" r="' + r + '" fill="#E86A7A"/>'; }
      return '<svg class="px-vis" viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="' + v.n + ' x ' + v.size + '">' + s + '</svg>'; }
    if (v.type === 'digits') { const ds = v.n.padStart(4, ' ').split(''); const nm = ['UM', 'C', 'D', 'U']; return '<div class="px-digits">' + ds.map((d, i) => '<div><small>' + nm[i] + '</small><b>' + (d.trim() ? d : '') + '</b></div>').join('') + '</div>'; }
    if (v.type === 'roundline') return '<div class="px-rl"><span>' + v.lo + '</span><i></i><b>' + v.n + '</b><i></i><span>' + v.hi + '</span></div>';
    return '';
  }
  function vFlashRun() { const R = ST.run, q = curQ(); const w = q.w; return topbar(R.title) + '<div class="px-prog">' + (R.i + 1) + ' / ' + R.qs.length + '</div><div class="px-flash' + (R.flipped ? ' flip' : '') + '">' + (w.icon ? '<div class="px-ico">' + w.icon + '</div>' : '') + '<div class="px-fw">' + esc(w.es) + '</div>' + (R.flipped ? '<div class="px-fh">' + esc(w.hu) + '</div>' : '') + '<div class="px-row center"><button type="button" class="pbtn o" data-a="cardsay" data-w="' + w.id + '" data-l="' + C.lang + '">' + ICO.spk + '<span>' + esc(C.lang.toUpperCase()) + '</span></button>' + (R.flipped ? '<button type="button" class="pbtn o" data-a="cardsay" data-w="' + w.id + '" data-l="hu">' + ICO.spk + '<span>HU</span></button>' : '') + '</div></div>' +
    (!R.flipped ? '<button type="button" class="pbtn b xl" data-a="flipm"><span>' + esc(hu('b_flip')) + '</span></button>' : '<div class="px-row center"><button type="button" class="pbtn g xl" data-a="gradem" data-ok="1">' + ICO.ok + '<span>' + esc(hu('b_knew')) + '</span></button><button type="button" class="pbtn r xl" data-a="gradem" data-ok="0">' + ICO.no + '<span>' + esc(hu('b_notyet')) + '</span></button></div>'); }
  function vRunDone() {
    const R = ST.run; const n = R.mode === 'test' ? R.qs.length : nAns(R); const pct = n ? R.score / n : 0;
    let h = topbar(R.title) + '<div class="px-card center">' + (R.mode === 'test' ? '<div class="px-final-cars">' + (R.win ? carSvg('#3B82C4', 90) + carSvg('#D9362B', 60) : carSvg('#D9362B', 90) + carSvg('#3B82C4', 60)) + '</div>' : '') + kitty(pct >= .6 ? 'happy' : 'idle', 130) + (R.mode === 'boss' ? '<div class="fx-mon' + (R.win ? ' hit' : '') + '" style="text-align:center">' + monsterSvg(R.boss.num, 120) + '</div>' : '') + '<h2>' + esc(hu(R.mode === 'test' ? (R.win ? 'race_win' : 'race_lose') : R.mode === 'boss' ? (R.win ? 'boss_win' : 'boss_lose') : R.mode === 'duel' ? ({ m: 'duel_m_win', d: 'duel_d_win', t: 'duel_tie' })[R.duelRes] : R.record ? 'blitz_record' : 'run_done')) + '</h2>' +
      (R.mode === 'duel' ? '<p class="px-big">' + esc(R.duel.names[0]) + ' ' + R.duel.score[0] + ' : ' + R.duel.score[1] + ' ' + esc(R.duel.names[1]) + '</p>' : R.mode === 'blitz' ? '<p class="px-big">' + R.score + ' ✔ · ' + esc(L3('rekord', 'record', 'récord').hu) + ': ' + ((P.blitz || {}).best || 0) + '</p>' : '<p class="px-big">' + R.score + ' / ' + n + '</p>') +
      ((R.mode === 'lesson' || R.mode === 'page' || R.mode === 'pgame') && R.lessonPct != null ? '<p class="px-big" style="color:#F2B705">' + [0, 1, 2].map(i => i < starsOf(R.lessonPct) ? '★' : '☆').join('') + ' <small>' + R.lessonPct + '%</small></p>' : '') + (R.bestCombo >= 3 ? '<p class="px-note">' + esc(L3('Legjobb kombó', 'Best combo', 'Mejor combo').hu) + ': ' + R.bestCombo + '×</p>' : '') + (R.bonus ? '<p class="px-note">+' + R.bonus + ' ' + ICO.star + '</p>' : '') + (R.timeUp ? '<p class="px-note">' + esc(hu('time_up')) + '</p>' : '') + '</div>';
    h += tallyHtml(R);
    if (R.mode === 'test') h += evalHtml(R);
    h += '<div class="px-row center">' + (R.cert ? '<button type="button" class="pbtn b" data-a="cert" data-i="' + ((P.certs || []).length - 1) + '">' + ICO.star + '<span>' + esc(hu('b_cert')) + '</span></button>' : '') + (R.mode === 'page' || R.mode === 'pgame' ? '<button type="button" class="pbtn o" data-a="pgopen" data-p="' + esc(R.pid) + '"><span>' + esc(hu('pg_back')) + '</span></button>' : '') + '<button type="button" class="pbtn g" data-a="rerun">' + esc(hu('b_again')) + '</button><button type="button" class="pbtn l" data-a="home">' + esc(hu('b_home')) + '</button>' +
      (ST.fromHub ? '<a class="pbtn o" href="../">' + esc(hu('b_back_plan')) + '</a>' : '') + '</div>';
    return h;
  }
  function evalHtml(R) {
    const parts = {}; R.qs.forEach((q, i) => { const r = R.res[i]; const p = parts[q.part] || (parts[q.part] = { n: 0, ok: 0 }); p.n++; if (r && r.ok) p.ok++; });
    const good = [], bad = []; Object.keys(parts).forEach(k => { const p = parts[k]; (p.ok / p.n >= .7 ? good : bad).push(k); });
    const wrong = R.qs.map((q, i) => ({ q, r: R.res[i] })).filter(x => !x.r || !x.r.ok);
    const seen = {}; const links = wrong.map(x => { const c = conceptFor(x.q.unit, x.q.page); if (!c || seen[c.id]) return ''; seen[c.id] = 1; return '<button type="button" class="pbtn l" data-a="openc" data-u="' + x.q.unit + '" data-c="' + c.id + '"><span>' + esc(c.es) + '</span>' + ICO.next + '</button>'; }).join('');
    return '<div class="px-card"><h3>' + esc(hu('eval_title')) + '</h3>' +
      (good.length ? '<p class="px-good">' + ICO.ok + ' ' + esc(hu('eval_good')) + ': <b>' + good.map(k => esc(hu('part_' + k))).join(', ') + '</b></p>' : '') +
      (bad.length ? '<p class="px-badp">' + ICO.no + ' ' + esc(hu('eval_bad')) + ': <b>' + bad.map(k => esc(hu('part_' + k))).join(', ') + '</b></p>' : '') +
      (wrong.length ? '<ul class="px-wrong">' + wrong.map(x => '<li><b>' + esc(x.q.rec.label) + '</b> <span>' + esc(x.q.rec.hu || '') + '</span></li>').join('') + '</ul>' : '<p>' + esc(hu('eval_perfect')) + '</p>') +
      (links ? '<p class="px-note">' + esc(hu('eval_practice')) + '</p><div class="px-row">' + links + '</div>' : '') + '</div>';
  }
  // ---- matricaalbum
  function vAlbum() {
    const sp = stickerPool(); const got = sp.filter(w => hasSticker(w.id)).length;
    let h = topbar(hu('t_album')) + '<div class="px-row">' + instrBtn('i_album') + '<span class="px-stat big">' + ICO.star + '<b>' + got + ' / ' + sp.length + '</b> <span class="px-sub">' + esc(hu('stk_count')) + '</span></span></div>';
    unitsList().forEach(u => { const ws = sp.filter(w => w.unit === u); if (!ws.length) return; const g = ws.filter(w => hasSticker(w.id)).length;
      h += '<h3 class="px-h">' + esc(unitTitle(u)) + ' <small>' + g + ' / ' + ws.length + '</small></h3><div class="px-album">' + ws.map(w => hasSticker(w.id) ? '<button type="button" class="stk on' + (isGold(w.id) ? ' gold' : '') + '" data-a="cardsay" data-w="' + w.id + '" data-l="' + C.lang + '" aria-label="' + esc(w.es + ' – ' + w.hu) + '"><span class="ic">' + w.icon + '</span><b>' + esc(w.es) + '</b><small>' + esc(w.hu) + '</small></button>' : '<div class="stk off" aria-label="még nincs meg"><span class="ic">' + w.icon + '</span><b>?</b></div>').join('') + '</div>'; });
    return h;
  }
  // ---- oklevél (nyomtatható)
  function vCert() {
    const c = ST.cert; if (!c) return vHome(); const d = new Date(c.ts);
    return topbar(hu('b_cert')) + '<div class="px-cert"><div class="px-cert-in"><div class="px-final-cars">' + carSvg('#3B82C4', 90) + '</div><h1>' + esc(hu('cert_title')) + '</h1><p class="px-cert-name">' + esc(P.name || 'Martin') + '</p><p>' + esc(hu('cert_won')) + '</p><h2>' + esc(c.subj) + '</h2><p><b>' + c.units.map(esc).join(' · ') + '</b></p><p class="px-big">' + c.score + ' / ' + c.total + ' (' + c.pct + '%)</p><div class="px-cert-kit">' + kitty('happy', 110) + '</div><p>' + d.toLocaleDateString('hu-HU') + '</p></div></div>' +
      '<div class="px-row center noprint"><button type="button" class="pbtn b" data-a="print">' + esc(hu('b_print')) + '</button><button type="button" class="pbtn l" data-a="home">' + esc(hu('b_home')) + '</button></div>';
  }
  function vStart() {
    return '<div class="px-card center px-startcard">' + kitty('happy', 150) + '<h2>' + esc(hu('start_title')) + '</h2><div class="px-final-cars">' + carSvg('#3B82C4', 80) + '</div><button type="button" class="pbtn g xl" data-a="mission">' + ICO.next + '<span>' + esc(hu('b_mission')) + '</span></button><button type="button" class="pbtn l" data-a="home"><span>' + esc(hu('b_home')) + '</span></button></div>';
  }
  function startRace(units) { units = (units && units.length ? units : fallbackUnits()).filter(u => unitsList().indexOf(u) >= 0); if (!units.length) return; let qs = []; units.forEach(u => { qs = qs.concat(buildTest(u)); }); qs = fillTo(shuffle(qs).slice(0, 16), units, QN()); if (!qs.length) return;
    startRun({ mode: 'test', race: true, title: hu('t_race') + ' · ' + units.map(unitTitle).join(', '), unit: units[0], units, qs, secs: Math.max(300, qs.length * 45), back: 'home', instr: 'i_race' }); }
  // ---- jutalmak
  function vShop() {
    const bal = P.stars - P.spent;
    return topbar(hu('t_shop')) + '<div class="px-row">' + instrBtn('i_shop') + '<span class="px-stat big">' + ICO.star + '<b>' + bal + '</b></span></div><div class="px-shopcat">' + kitty(ST.mood, 200) + '</div>' +
      '<div class="px-tiles">' + X.acc.map(a => { const own = P.owned.indexOf(a.id) >= 0; const wearing = P.worn[a.slot] === a.id;
        return '<div class="px-acc' + (wearing ? ' on' : '') + '"><div class="px-accimg"><svg viewBox="0 0 200 200" aria-hidden="true">' + a.svg + '</svg></div><b>' + esc(a.hu) + '</b>' +
          (own ? '<button type="button" class="pbtn ' + (wearing ? 'l' : 'g') + ' sm" data-a="wear" data-id="' + a.id + '">' + esc(hu(wearing ? 'b_takeoff' : 'b_wear')) + '</button>' : '<button type="button" class="pbtn o sm" data-a="buy" data-id="' + a.id + '"' + (bal < a.price ? ' disabled' : '') + '>' + ICO.star + ' ' + a.price + '</button>') + '</div>'; }).join('') + '</div>';
  }
  // ---- szülői nézet
  function vParent() {
    const days = []; for (let i = 13; i >= 0; i--) days.push(addDays(today(), -i)); const mx = Math.max(60, ...days.map(d => (P.days[d] || { sec: 0 }).sec));
    const bars = days.map(d => { const r = P.days[d] || { sec: 0, items: 0, ok: 0 }; const hh = Math.round(r.sec / mx * 100); return '<div class="bar"><div class="b" style="height:' + hh + '%" title="' + Math.ceil(r.sec / 60) + ' perc"></div><small>' + d.slice(8) + '</small><em>' + Math.ceil(r.sec / 60) + '\'</em></div>'; }).join('');
    const miss = Object.values(P.miss).sort((a, b) => b.n - a.n).slice(0, 12);
    const gens = Object.keys(P.gen).map(t => ({ t, g: P.gen[t] }));
    const tot = days.reduce((a, d) => { const r = P.days[d]; return r ? { sec: a.sec + r.sec, items: a.items + r.items, ok: a.ok + r.ok } : a; }, { sec: 0, items: 0, ok: 0 });
    const evs = events().filter(e => e._days >= 0 && e._days <= 21).slice(0, 5);
    const readyCard = '<div class="px-card"><h3>Felkészültség a következő eseményekre</h3>' + (evs.length ? evs.map(e => { const pc = readiness(e); return '<div class="px-ready-top"><b>' + esc(e.date.slice(5).replace('-', '.') + ' · ' + e.title_hu) + '</b><span>' + pc + '%</span></div><div class="px-meter"><i style="width:' + pc + '%;background:' + (pc < 40 ? '#E86A7A' : pc < 80 ? '#F2A65A' : '#6BBF59') + '"></i></div>'; }).join('') : '<p>Nincs közelgő esemény.</p>') +
      '<p class="px-note">A felkészültség a szókártyák dobozaiból (3. doboz = biztos), a tantárgyi feladatokból és a legjobb próbaverseny eredményéből számol. Valódi jutalmakat (pl. 50 csillag = közös társasjáték) a nyitóoldal „Szülőknek” részében adhatsz meg – az összes tantárgy csillagai számítanak bele.</p></div>';
    return topbar('Szülő · Padres · Parent') + weeklyParentHtml() + readyCard + '<div class="px-card"><h3>Gyakorlás az elmúlt 14 napban</h3><div class="px-bars">' + bars + '</div><p class="px-note">Összesen: <b>' + Math.ceil(tot.sec / 60) + ' perc</b> · <b>' + tot.items + '</b> feladat, ebből <b>' + tot.ok + '</b> jó (' + (tot.items ? Math.round(tot.ok / tot.items * 100) : 0) + '%) · napi sorozat: <b>' + P.streak.n + '</b> (rekord: ' + P.streak.best + ') · csillagok: <b>' + P.stars + '</b></p></div>' +
      '<div class="px-card"><h3>Leggyakrabban hibázott szavak / feladatok</h3>' + (miss.length ? '<table class="px-tab"><tr><th>Tétel</th><th>Jelentés / megoldás</th><th>Hiba</th><th>Lecke</th></tr>' + miss.map(m => '<tr><td><b>' + esc(m.label) + '</b><br><small>' + esc(missType(m.type)) + '</small></td><td>' + esc(m.hu) + '</td><td><b>' + m.n + '×</b></td><td>' + esc(m.unit ? unitTitle(m.unit) : '') + '</td></tr>').join('') + '</table>' : '<p>Még nincs hibás tétel.</p>') + '</div>' +
      (gens.length ? '<div class="px-card"><h3>Matek-generátor szintek</h3><table class="px-tab"><tr><th>Téma</th><th>Szint</th><th>Jó / összes</th></tr>' + gens.map(x => '<tr><td>' + esc(MG.TOPIC_NAME[x.t][1]) + '</td><td>' + '★'.repeat(x.g.lvl) + '</td><td>' + x.g.ok + ' / ' + x.g.n + '</td></tr>').join('') + '</table></div>' : '') +
      mqParent() + '<div class="px-card"><h3>Utolsó próbadolgozatok</h3>' + (P.tests.length ? '<table class="px-tab"><tr><th>Dátum</th><th>Fejezet</th><th>Eredmény</th><th>Idő</th><th>Részletek</th></tr>' + P.tests.slice(-6).reverse().map(t => '<tr><td>' + new Date(t.ts).toLocaleDateString('hu-HU') + '</td><td>' + esc(unitTitle(t.unit)) + '</td><td><b>' + t.score + ' / ' + t.total + '</b></td><td>' + Math.floor(t.secs / 60) + ':' + String(t.secs % 60).padStart(2, '0') + '</td><td>' + Object.keys(t.parts || {}).map(k => esc(hu('part_' + k)) + ' ' + t.parts[k].ok + '/' + t.parts[k].n).join(', ') + '</td></tr>').join('') + '</table>' : '<p>Még nem volt próbadolgozat.</p>') + '</div>' +
      '<p class="px-note">Mentés helye: <b>' + esc(Store.mode) + '</b>. Ha Martin több eszközön gyakorol, az adatok nincsenek összefésülve (a legutóbb mentett példány győz).</p>';
  }
  function missType(t) { if (t === 'mq') return 'matek-kvíz'; return { w: 'szó', sp: 'spelling', dc: 'dictado', tk: 'tantárgyi feladat', q: 'kvíz', pr: 'kiejtés' }[t] || (t.indexOf('g:') === 0 ? 'matek: ' + (MG.TOPIC_NAME[t.slice(2)] || ['', ''])[1] : t); }
  // ================= render + események =================
  function html() {
    pgCss(); mqCss();
    switch (ST.view) {
      case 'mq': return vMq();
      case 'pages': return vPages(); case 'page': return vPage();
      case 'home': return vHome(); case 'cards': return vCards(); case 'cardrun': return vCardRun(); case 'games': return vGames(); case 'memory': return vMemory(); case 'drag': return vDrag();
      case 'spelling': return vSpelling(); case 'dictado': return vDictado(); case 'tasks': return vTasks(); case 'gen': return vGen(); case 'speak': return vSpeak(); case 'testmenu': return vTestMenu(); case 'run': return vRun(); case 'shop': return vShop(); case 'parent': return vParent(); case 'album': return vAlbum(); case 'cert': return vCert(); case 'start': return vStart(); case 'map': return vMap(); case 'space': return vSpace(); case 'bingo': return vBingo(); case 'bubble': return vBubble(); case 'build': return vBuild(); case 'room': return vRoom();
    }
    return vHome();
  }
  function render(o) {
    if (!el) return; const y = root.scrollY || (document.documentElement && document.documentElement.scrollTop) || 0; const hh = el.offsetHeight; el.style.minHeight = hh + 'px';
    const typed = el.querySelector('#px-input'); if (typed && ST.run) ST.run.typed = typed.value;
    el.innerHTML = '<div class="px">' + html() + '</div>';
    if (o && o.top) { const r = el.getBoundingClientRect(); root.scrollTo(0, Math.max(0, r.top + y - 8)); } else root.scrollTo(0, y);
    requestAnimationFrame(() => { if (el) el.style.minHeight = ''; });
    const inp = el.querySelector('#px-input'); if (inp && !inp.disabled && o && o.top) { try { inp.focus({ preventScroll: true }); } catch (e) { } }
  }
  function go(v, extra) { stopAll(); clearInterval(timerIv); ST.view = v; ST.mood = 'idle'; Object.assign(ST, extra || {}); render({ top: true }); const ins = { pages: 'i_pages', cards: 'i_cards', games: 'i_games', spelling: 'i_spelling', dictado: 'i_dictado', tasks: 'i_tasks', gen: 'i_gen', speak: 'i_speak', testmenu: 'i_test', shop: 'i_shop', album: 'i_album', map: 'i_map', room: 'i_room', home: null }[v]; if (v === 'speak') nextSpeak(); else if (ins) sayK(ins); }
  function act(a, d, node) {
    touch(); if (pgAct(a, d)) return; if (mqAct(a, d)) return;
    switch (a) {
      case 'home': go('home'); break;
      case 'go': go(d.v); break;
      case 'instr': sayK(d.k); break;
      case 'sayev': { const ev = events().find(e => e.id === d.id) || ST.curEvent; if (ev) { sayCountdown(ev); } break; }
      case 'gounit': stopAll(); H.goUnit(d.u); break;
      case 'openc': stopAll(); H.openConcept(d.u, d.c); break;
      case 'unit': P.unit = d.u; Store.save(); render(); break;
      case 'mission': startMission(); break;
      case 'qn': P.qn = +d.n; Store.save(); render(); break;
      case 'race': { const ev = ST.curEvent || nextEvent(); startRace(ev && ev.units); break; }
      case 'cert': { ST.cert = (P.certs || [])[+d.i]; if (ST.cert) go('cert'); break; }
      case 'print': try { root.print(); } catch (e) { } break;
      case 'startcards': ST.cards = { q: pickCards(activeUnits(), QN()), i: 0, flip: false, ok: 0 }; ST.view = 'cardrun'; render({ top: true }); if (ST.cards.q[0]) say(wordItems(ST.cards.q[0]).slice(0, 1)); break;
      case 'cardflip': { const R = ST.cards; R.flip = true; render(); const w = R.q[R.i]; say([{ l: 'hu', k: w.id, t: w.hu }]); break; }
      case 'cardgrade': { const R = ST.cards; const w = R.q[R.i]; const ok = d.ok === '1'; gradeCard(w.id, ok); record({ type: 'w', id: w.id, label: w.es, hu: w.hu, unit: w.unit }, ok); if (ok) { R.ok++; award(1); } R.i++; R.flip = false; ST.mood = ok ? 'happy' : 'idle'; if (R.i >= R.q.length) { award(2); markActive(); } render({ top: true }); if (R.q[R.i]) say(wordItems(R.q[R.i]).slice(0, 1)); else sayHu('fb_end'); break; }
      case 'cardsay': { const w = pool().find(x => x.id === d.w) || H.D.glossary.map(g => ({ id: 'g:' + g.i, es: g.es, hu: g.hu })).find(x => x.id === d.w); if (w) say([{ l: d.l, k: w.id, t: d.l === 'hu' ? w.hu : w.es }]); break; }
      case 'game': if (d.g === 'memory') startMemory(); else if (d.g === 'listen') startListen(); else startDrag(); break;
      case 'mem': memClick(+d.n); break;
      case 'pic': { const Dg = ST.drag; Dg.sel = Dg.sel === d.id ? null : d.id; render(); break; }
      case 'slot': { const Dg = ST.drag; if (Dg.sel) dragPlace(Dg.sel, +d.i); break; }
      case 'week': ST.week = d.id; render(); break;
      case 'saywk': { const w = weeks().flatMap(x => x.words).find(x => x.w === d.w); say([{ l: C.lang, k: 'x:sp:' + d.w, t: d.w }, { l: 'hu', k: 'x:sph:' + d.w, t: w ? w.hu : '' }]); break; }
      case 'startspell': startSpelling(); break;
      case 'dunit': ST.dunit = d.u; render(); break;
      case 'startdict': startDictado(); break;
      case 'tunit': ST.tunit = d.u; render(); break;
      case 'starttasks': startTasks(); break;
      case 'saydw': { const x = dictWords(d.u).find(y => norm(y.w) === d.w); if (x) say([{ l: C.lang, k: x.k, t: x.w }, { l: 'hu', k: x.kh, t: x.hu }]); break; }
      case 'ch': { const inp = el.querySelector('#px-input'); if (inp && !inp.disabled) { inp.value += d.c; inp.focus({ preventScroll: true }); if (ST.run) ST.run.typed = inp.value; } break; }
      case 'sayreview': sayK('review_sub'); break;
      case 'topic': ST.topic = d.t; render(); break;
      case 'startgen': startGen(); break;
      case 'mic': doMic(); break;
      case 'speaknext': nextSpeak(); break;
      case 'starttest': startTest(d.u); break;
      case 'pick': { const q = curQ(); answerRun(q.options[+d.i].v); break; }
      case 'osay': { const q = curQ(); const o = q && q.options && q.options[+d.i]; if (o) say(optSay(o)); break; }
      case 'check': { const inp = el.querySelector('#px-input'); const v = inp ? inp.value.trim() : ''; if (!v) return; ST.run.typed = v; answerRun(v); break; }
      case 'np': { if (mqNp(d.k)) break; const R = ST.run; const k = d.k; if (R.ans !== null && R.mode !== 'test') return; if (k === '⌫') R.num = R.num.slice(0, -1); else if (k === '✓') { if (R.num) answerRun(R.num); return; } else if (R.num.length < 5) R.num += k; render(); break; }
      case 'linego': { const R = ST.run; answerRun(R.lineV == null ? ST.run.qs[R.i].task.p.min : R.lineV); break; }
      case 'next': nextRun(); break;
      case 'finish': finishRun(false); break;
      case 'qsay': { const q = curQ(); if (q.task) sayTask(q.task); else if (q.items) say(q.items); else if (q.audio) say(q.audio); break; }
      case 'rerun': { const R = ST.run; if (R.mode === 'mq') { startMq(R.mqmode); if (ST.run && ST.run.sw) mqSwStart(); } else if (R.mission) startMission(); else if (R.mode === 'test') startTest(R.unit); else if (R.mode === 'lesson') startLesson(R.unit, R.lesson); else if (R.mode === 'page') startPage(R.pid, R.tid); else if (R.mode === 'pgame') startPgGame(R.pid, R.game); else if (R.mode === 'boss') startBoss(R.unit); else if (R.mode === 'blitz') startBlitz(); else if (R.mode === 'duel') startDuel(); else go(R.back || 'home'); break; }
      case 'lesson': startLesson(d.u, d.c); break;
      case 'locked': toast(L3('Még zárva – előbb az előző állomás!', '', '').hu); try { H.sfxBad(); } catch (e) { } break;
      case 'boss': startBoss(d.u || (activeUnits()[0])); break;
      case 'blitz': startBlitz(); break;
      case 'duel': startDuel(); break;
      case 'space': startSpace(); break;
      case 'spshot': spNext(!!d.ok, node); break;
      case 'spsay': spSay(); break;
      case 'bingo': startBingo(); break;
      case 'bgsay': bgSay(); break;
      case 'bgpick': { const g = ST.bg; const c = g.cells[+d.i]; if (!c || c.hit || g.done) break; if (c === g.called) { c.hit = true; g.ok++; award(1); try { H.sfxGood(); } catch (e) { } if (bgLine(g.cells)) { g.done = true; award(5); markActive(); celebrate(true); render(); sayHu('bingo'); } else { bgCall(); render(); bgSay(); } } else { try { H.sfxBad(); } catch (e) { } node.classList.add('no'); setTimeout(() => node.classList.remove('no'), 450); } break; }
      case 'bubble': startBubble(); break;
      case 'bbsay': bbSay(); break;
      case 'bbpick': bbPick(d.id, node); break;
      case 'build': startBuild(); break;
      case 'bdsay': bdSay(); break;
      case 'bdtile': bdTile(+d.i, node); break;
      case 'bdhint': bdHint(); break;
      case 'roombuy': { const r = ROOM.find(x => x.id === d.id); P.room = P.room || []; if (r && P.stars - P.spent >= r.p && P.room.indexOf(r.id) < 0) { P.spent += r.p; P.room.push(r.id); Store.save(); ST.mood = 'happy'; confetti(60); fanfare(); render(); setTimeout(() => { ST.mood = 'idle'; }, 2500); } break; }
      case 'wkgoal': { const w = weekly(); w.goal = +d.n; setWeekly(w); render(); break; }
      case 'wksave': { const w = weekly(); const i = el.querySelector('#fx-wreward'); w.reward = i ? i.value.trim().slice(0, 80) : ''; setWeekly(w); toast('Mentve ✔'); render(); break; }
      case 'mapall': P.mapAll = !P.mapAll; Store.save(); break;
      case 'flipm': { ST.run.flipped = true; render(); const w = curQ().w; say([{ l: 'hu', k: w.id, t: w.hu }]); break; }
      case 'gradem': { const R = ST.run, q = curQ(); const ok = d.ok === '1'; gradeCard(q.w.id, ok); record({ type: 'w', id: q.w.id, label: q.w.es, hu: q.w.hu, unit: q.w.unit }, ok); R.score += ok ? 1 : 0; R.res.push({ q, ok }); if (ok) award(1); nextRun(); break; }
      case 'buy': { const a2 = X.acc.find(x => x.id === d.id); if (a2 && P.stars - P.spent >= a2.price && P.owned.indexOf(a2.id) < 0) { P.spent += a2.price; P.owned.push(a2.id); P.worn[a2.slot] = a2.id; Store.save(); ST.mood = 'happy'; try { H.sfxGood(); } catch (e) { } render(); sayHu('fb_new_acc'); } break; }
      case 'wear': { const a2 = X.acc.find(x => x.id === d.id); if (P.worn[a2.slot] === a2.id) delete P.worn[a2.slot]; else P.worn[a2.slot] = a2.id; Store.save(); render(); break; }
    }
  }
  // ---- küldetés
  function startMission() {
    const ev = nextEvent() || { units: fallbackUnits(), type: 'test' }; const units = ev.units && ev.units.length ? ev.units : fallbackUnits(); const p = poolFor(units), qs = fixQs(3);
    pickCards(units, 4).forEach(w => qs.push({ kind: 'flash', part: 'vocab', w, items: wordItems(w), unit: w.unit, page: w.page, rec: { type: 'w', id: w.id, label: w.es, hu: w.hu, unit: w.unit } }));
    if (C.subj === 'en') { const wk = weekFor(ev); if (wk && (ev.type === 'spelling' || !ev.type)) pickN(wk.words, 3).forEach(x => qs.push(spellQ(x, wk.unit))); else pickN(p, 3).forEach(w => qs.push(vocabQ(w, 'hear', p))); }
    else if (C.subj === 'lengua') { const dw = units.flatMap(u => dictWords(u).map(x => ({ x, u }))); pickN(dw, 3).forEach(o => qs.push(dictQ(o.x, o.u))); }
    else if (C.subj === 'mat' && root.MQ) { mqFocus(); const gs = shuffle(units.flatMap(u => root.MQ.byUnit(u))); for (let i = 0; i < 5 && gs.length; i++) { const q = mqMake(gs[i % gs.length], mqS().lvl || 1); if (q) qs.push(q); } }
    else if (C.subj === 'mat') { const ts = topicsForUnits(units); for (let i = 0; i < 3; i++) { const t = ts[i % ts.length]; qs.push(genQ(t, level(t))); } }
    else { const tk = tasksAll().filter(t => units.indexOf(t.unit) >= 0); if (tk.length >= 3) pickN(tk, 4).forEach(t => qs.push(taskQ(t))); else pickN(p, 3).forEach((w, i) => qs.push(vocabQ(w, ['hear', 'tr', 'see'][i % 3], p))); }
    const quiz = H.D.quiz.filter(q => units.indexOf(q.unit) >= 0); pickN(quiz, Math.max(3, Math.round(QN() / 5))).forEach(q => qs.push(quizQ(q)));
    startRun({ mode: 'mission', mission: true, title: hu('t_mission'), qs: fillTo(qs, units, QN()), back: 'home' });
  }
  // ---- húzás (számegyenes + kép-szó)
  let drag = null;
  function onPointerDown(e) {
    const ln = e.target.closest && e.target.closest('#px-line'); if (ln && ST.run && ST.run.ans === null) { drag = { type: 'line', node: ln }; ln.setPointerCapture && ln.setPointerCapture(e.pointerId); moveLine(e); e.preventDefault(); return; }
    const pic = e.target.closest && e.target.closest('[data-drag]'); if (pic && ST.view === 'drag') { drag = { type: 'pic', id: pic.dataset.drag, node: pic, sx: e.clientX, sy: e.clientY, moved: false, ghost: null }; pic.setPointerCapture && pic.setPointerCapture(e.pointerId); }
  }
  function moveLine(e) { const ln = drag.node, r = ln.getBoundingClientRect(); const min = +ln.dataset.min, max = +ln.dataset.max, step = +ln.dataset.step; let f = (e.clientX - r.left) / r.width; f = Math.max(0, Math.min(1, f)); let v = min + Math.round(f * (max - min) / step) * step; ST.run.lineV = v; const fl = ln.querySelector('#px-flag'); fl.style.left = ((v - min) / (max - min) * 100) + '%'; fl.querySelector('b').textContent = v; }
  function onPointerMove(e) {
    if (!drag) return; if (drag.type === 'line') { moveLine(e); e.preventDefault(); return; }
    if (drag.type === 'pic') { const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy; if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 8) { drag.moved = true; const g = drag.node.cloneNode(true); g.classList.add('px-ghost'); g.removeAttribute('data-a'); document.body.appendChild(g); drag.ghost = g; }
      if (drag.ghost) { drag.ghost.style.left = (e.clientX - 40) + 'px'; drag.ghost.style.top = (e.clientY - 40) + 'px'; e.preventDefault(); } }
  }
  function onPointerUp(e) {
    if (!drag) return; const d = drag; drag = null;
    if (d.type === 'pic' && d.moved) { if (d.ghost) d.ghost.remove(); const t = document.elementFromPoint(e.clientX, e.clientY); const slot = t && t.closest && t.closest('[data-slot]'); if (slot) { e.preventDefault(); dragPlace(d.id, +slot.dataset.slot); } else render(); ST.suppressClick = true; setTimeout(() => { ST.suppressClick = false; }, 50); }
  }
  // ================= JÁTÉKOS BŐVÍTÉS (Robert, 2026-11-05: „implementáld le mind a 11-et”) =================
  // 1 kalandtérkép · 2 fejezet-szörny · 3 arany kártyák · 4 villámkör · 5 kombó · 6 űrhajó + szorzótábla-bingó · 7 buborékpukkasztó
  // 8 szóépítő · 9 párbaj apával · 10 heti kihívás valódi jutalommal · 11 konfetti, sikerdallam, cica-mozdulatok, cicaszoba
  const L3 = (h, e, s) => (C.lang === 'es' ? { hu: h, l: s } : { hu: h, l: e });
  const bi3 = (h, e, s) => { const o = L3(h, e, s); return '<span class="hu">' + esc(o.hu) + '</span><span class="lg">' + esc(o.l) + '</span>'; };
  // ---- 11: konfetti, dallam, cica-mozdulatok
  function confetti(n) { try { const box = document.createElement('div'); box.className = 'fx-conf'; const cols = ['#F7C948', '#E86A7A', '#6BBF59', '#5DADE2', '#7D3C98', '#F2891F'];
    for (let i = 0; i < (n || 90); i++) { const s = document.createElement('i'); s.style.left = (Math.random() * 100) + '%'; s.style.background = cols[i % cols.length]; s.style.animationDelay = (Math.random() * 0.6) + 's'; s.style.animationDuration = (1.6 + Math.random() * 1.4) + 's'; s.style.transform = 'rotate(' + Math.round(Math.random() * 360) + 'deg)'; box.appendChild(s); }
    document.body.appendChild(box); setTimeout(() => box.remove(), 3600); } catch (e) { } }
  function fanfare() { try { const c = (H.ctx && H.ctx()) || xctx || (xctx = new (root.AudioContext || root.webkitAudioContext)()); if (c.state === 'suspended') c.resume(); const t = c.currentTime + 0.03;
    [[523, 0], [659, .12], [784, .24], [1047, .36], [784, .52], [1047, .62]].forEach(([f, d], i) => { const o = c.createOscillator(), g = c.createGain(); o.type = i % 2 ? 'square' : 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.18, t + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d + (i === 5 ? 0.6 : 0.16)); o.connect(g); g.connect(c.destination); o.start(t + d); o.stop(t + d + 0.7); }); } catch (e) { } }
  function toast(t, cls) { try { const f = document.createElement('div'); f.className = 'fx-toast ' + (cls || ''); f.textContent = t; document.body.appendChild(f); setTimeout(() => f.remove(), 1900); } catch (e) { } }
  const KANIM = ['k-jump', 'k-spin', 'k-wiggle', 'k-flip'];
  function celebrate(big) { confetti(big ? 140 : 70); fanfare(); ST.kanim = 'k-dance'; }
  // ---- 5: kombó (minden kérdéses módban); visszaadja a csillagok számát
  function comboHit(R, ok) { if (!R) return ok ? 1 : 0; R.combo = ok ? (R.combo || 0) + 1 : 0; R.bestCombo = Math.max(R.bestCombo || 0, R.combo);
    if (!ok) return 0; ST.kanim = KANIM[Math.floor(Math.random() * KANIM.length)];
    if (R.combo === 3) toast(hu('combo3'), 'c3'); if (R.combo > 0 && R.combo % 5 === 0) { toast(hu('combo5') + ' ×' + R.combo, 'c5'); confetti(50); ST.kanim = 'k-dance'; }
    return R.combo >= 3 ? 2 : 1; }
  function comboBadge(R) { return R && R.combo >= 2 ? '<span class="fx-combo' + (R.combo >= 5 ? ' hot' : '') + '">' + R.combo + '× ' + esc(L3('kombó', 'combo', 'combo').hu) + (R.combo >= 3 ? ' · 2★' : '') + '</span>' : ''; }
  // ---- 3: arany kártyák (5× egymás után jó egy szóra)
  function goldTrack(r, ok) { if (!r || r.type !== 'w') return; P.wrun = P.wrun || {}; P.gold = P.gold || {};
    if (!ok) { P.wrun[r.id] = 0; return; } P.wrun[r.id] = (P.wrun[r.id] || 0) + 1;
    if (P.wrun[r.id] >= 5 && !P.gold[r.id]) { P.gold[r.id] = today(); setTimeout(() => { toast(hu('gold_new') + ' ' + r.label, 'gold'); confetti(40); }, 400); award(3); } }
  const isGold = id => !!(P.gold && P.gold[id]);
  // ---- közös kérdés-forrás (leckekvíz + szókincs) egy fejezetkészlethez
  function mixQs(units, n) { return fillTo([], units, n); }
  function lessonQs(c, u, n) { if (typeof LQ === 'undefined') return []; const qs = LQ.forLesson(H.D, C.lang, c, u).map(q => lqConv(q, u.id)); return shuffle(qs).slice(0, n); }
  // ---- 1: kalandtérkép
  function lessonBest(id) { return (P.lq && P.lq[id]) || 0; }
  function starsOf(pct) { return pct >= 95 ? 3 : pct >= 80 ? 2 : pct >= 50 ? 1 : 0; }
  function evUnits() { const ev = nextEvent(); return ev && ev.units ? ev.units : []; }
  function lessonOpen(u, k) { if (k === 0 || P.mapAll || evUnits().indexOf(u.id) >= 0) return true; return lessonBest(u.concepts[k - 1].id) >= 80; }
  function vMap() {
    let h = topbar(hu('t_map')) + '<div class="px-row">' + instrBtn('i_map') + '</div>' + qnChips();
    const evu = evUnits();
    H.D.units.forEach(u => { const cs = u.concepts; const tot = cs.reduce((a, c) => a + starsOf(lessonBest(c.id)), 0); const all1 = cs.every(c => starsOf(lessonBest(c.id)) >= 1) || evu.indexOf(u.id) >= 0 || P.mapAll;
      let cur = -1; cs.forEach((c, k) => { if (cur < 0 && lessonOpen(u, k) && starsOf(lessonBest(c.id)) < 2) cur = k; });
      h += '<div class="fx-island' + (evu.indexOf(u.id) >= 0 ? ' ev' : '') + '"><div class="fx-isl-h"><b>' + esc(u.num + '. ' + u.es) + '</b><span>' + esc(u.hu) + '</span><span class="fx-st">' + ICO.star + ' ' + tot + ' / ' + (cs.length * 3) + '</span></div><div class="fx-path">';
      cs.forEach((c, k) => { const op = lessonOpen(u, k); const st = starsOf(lessonBest(c.id));
        h += '<button type="button" class="fx-stn' + (op ? '' : ' lock') + (k === cur ? ' cur' : '') + '" data-a="' + (op ? 'lesson' : 'locked') + '" data-u="' + u.id + '" data-c="' + c.id + '"' + (op ? '' : ' aria-disabled="true"') + '>' +
          '<span class="dot">' + (op ? (k + 1) : '🔒') + '</span>' + (k === cur ? '<span class="fx-cat">' + kitty('idle', 54) + '</span>' : '') + '<span class="nm">' + esc(c.es) + '</span><span class="sts">' + [0, 1, 2].map(i => '<i class="' + (i < st ? 'on' : '') + '">★</i>').join('') + '</span>' + (lessonBest(c.id) ? '<small>' + lessonBest(c.id) + '%</small>' : '') + '</button>'; });
      h += '<button type="button" class="fx-stn boss' + (all1 ? '' : ' lock') + '" data-a="' + (all1 ? 'boss' : 'locked') + '" data-u="' + u.id + '"><span class="dot">' + monsterSvg(u.num, 46) + '</span><span class="nm">' + esc(hu('t_boss')) + '</span>' + ((P.bossWin || {})[u.id] ? '<span class="sts"><i class="on">♛</i></span>' : '') + '</button></div></div>'; });
    return h + '<p class="px-note">' + esc(L3('80% fölött nyílik a következő állomás. A közelgő dolgozat fejezetei mindig nyitva vannak.', '', '').hu) + '</p>';
  }
  function startLesson(uid, cid) { const u = H.D.units.find(x => x.id === uid); const c = u && u.concepts.find(x => x.id === cid); if (!c) return; const qs = lessonQs(c, u, QN()); if (!qs.length) return;
    startRun({ mode: 'lesson', unit: uid, lesson: cid, title: (u.concepts.indexOf(c) + 1) + '. ' + c.es, qs, back: 'map' }); }
  // ---- 2: fejezet-szörny
  function monsterSvg(seed, w) { const cols = ['#7D3C98', '#22603C', '#B85A12', '#1F4E79', '#C0392B', '#1A7F8E', '#8A5A2B', '#D4AC0D', '#E86A7A', '#5DADE2']; const c = cols[(+seed || 0) % cols.length];
    return '<svg viewBox="0 0 120 110" width="' + w + '" height="' + Math.round(w * 110 / 120) + '" aria-hidden="true"><path d="M18 100 q-8 -60 42 -78 q50 18 42 78 q-10 -10 -21 0 q-10 -10 -21 0 q-10 -10 -21 0 q-11 -10 -21 0z" fill="' + c + '" stroke="#1E2A38" stroke-width="3"/><path d="M34 30 l-8 -20 l18 12 M86 30 l8 -20 l-18 12" fill="' + c + '" stroke="#1E2A38" stroke-width="3"/><circle cx="46" cy="52" r="11" fill="#fff" stroke="#1E2A38" stroke-width="3"/><circle cx="76" cy="52" r="11" fill="#fff" stroke="#1E2A38" stroke-width="3"/><circle cx="48" cy="54" r="5" fill="#1E2A38"/><circle cx="74" cy="54" r="5" fill="#1E2A38"/><path d="M44 76 q16 12 32 0" stroke="#1E2A38" stroke-width="4" fill="#fff"/><path d="M50 78 l4 6 l4 -6 M62 78 l4 6 l4 -6" fill="#fff" stroke="#1E2A38" stroke-width="2"/></svg>'; }
  function startBoss(uid) { const u = H.D.units.find(x => x.id === uid); if (!u) return; const hp = Math.max(6, Math.min(30, Math.round(QN() * 0.6))); const qs = mixQs([uid], hp + 6); if (!qs.length) return;
    startRun({ mode: 'boss', unit: uid, title: hu('t_boss') + ' · ' + u.num + '. ' + u.es, qs, boss: { hp, max: hp, hearts: 5, num: u.num, hit: 0 }, back: 'map', instr: 'i_boss' }); }
  function bossHtml(R) { const b = R.boss; return '<div class="fx-boss"><div class="fx-mon' + (b.hit ? ' hit' : '') + '">' + monsterSvg(b.num, 110) + '</div><div class="fx-bars"><div class="fx-hp"><i style="width:' + Math.round(b.hp / b.max * 100) + '%"></i><span>' + b.hp + ' / ' + b.max + '</span></div><div class="fx-hearts">' + [0, 1, 2, 3, 4].map(i => '<span class="' + (i < b.hearts ? 'on' : '') + '">♥</span>').join('') + '</div></div></div>'; }
  // ---- 4: villámkör
  function startBlitz() { const units = activeUnits(); const base = mixQs(units, 120); if (!base.length) return; let k = 0;
    startRun({ mode: 'blitz', fast: true, title: hu('t_blitz'), qs: [], gen: () => base[(k++) % base.length], limit: 9999, endless: true, secs: 60, back: 'home', instr: 'i_blitz' }); }
  // ---- 9: párbaj apával
  function startDuel() { const units = activeUnits(); const n = Math.max(10, QN() - QN() % 2); const qs = mixQs(units, n); if (!qs.length) return;
    startRun({ mode: 'duel', title: hu('t_duel'), qs, duel: { score: [0, 0], names: ['Martin', L3('Apa', 'Dad', 'Papá').hu], secs: 7 }, back: 'home', instr: 'i_duel' }); }
  let duelIv = null;
  function duelTick() { clearInterval(duelIv); const R = ST.run; if (!R || !R.duel || R.done || R.i % 2 !== 1 || R.ans !== null) return; R.dEnd = Date.now() + R.duel.secs * 1000;
    duelIv = setInterval(() => { const R2 = ST.run; if (R2 !== R || R.ans !== null || R.done || ST.view !== 'run') { clearInterval(duelIv); return; } const left = Math.max(0, (R.dEnd - Date.now()) / 1000); const t = el && el.querySelector('#fx-dt'); if (t) { t.textContent = Math.ceil(left) + ' mp'; t.style.setProperty('--p', (left / R.duel.secs * 100) + '%'); } if (left <= 0) { clearInterval(duelIv); R.timeout = true; answerRun('-timeout-'); } }, 200); }
  function duelHtml(R) { const t = R.i % 2; return '<div class="fx-duel"><div class="pl' + (t === 0 ? ' on' : '') + '"><b>' + esc(R.duel.names[0]) + '</b><span>' + R.duel.score[0] + '</span></div><div class="vs">VS</div><div class="pl dad' + (t === 1 ? ' on' : '') + '"><b>' + esc(R.duel.names[1]) + '</b><span>' + R.duel.score[1] + '</span></div></div><div class="fx-turn">' + esc(hu(t === 0 ? 'duel_turn_m' : 'duel_turn_d')) + (t === 1 && R.ans === null ? ' <span class="fx-dt" id="fx-dt">' + R.duel.secs + ' mp</span>' : '') + '</div>'; }
  // ---- 6a: űrhajó (matek: szorzás; többi tantárgy: szó)
  function focusTables() { const ev = nextEvent(); const m = ev && /tabla|tables|×/i.test((ev.title || '') + (ev.title_hu || '')) ? ((ev.title || '') + ' ' + (ev.title_hu || '')).match(/\b(10|[0-9])\b/g) : null; const t = m ? Array.from(new Set(m.map(Number))) : []; return t.length ? t : [2, 3, 4, 5, 6, 7, 8, 9]; }
  function factQ() { const ts = focusTables(); const b = ts[Math.floor(Math.random() * ts.length)], a = Math.floor(Math.random() * 11); const r = a * b; const near = shuffle(Array.from(new Set([r + b, r - b, r + 1, r - 1, r + 2, r + 10, (a + 1) * (b + 1)].filter(v => v >= 0 && v !== r)))).slice(0, 3);
    return { prompt: a + ' × ' + b, say: [{ l: C.lang, k: 'x:none', t: numWord(a) + (C.lang === 'es' ? ' por ' : ' times ') + numWord(b) }], ans: String(r), opts: shuffle([String(r)].concat(near.map(String))), a, b }; }
  const NW = { es: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'], en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'] };
  function numWord(n) { return (NW[C.lang] || NW.en)[n] || String(n); }
  function wordQ(icons) { let p = poolFor(activeUnits(), !!icons); if (p.length < 4) p = icons ? pool().filter(w => w.icon) : pool(); if (p.length < 4) p = pool(); const w = p[Math.floor(Math.random() * p.length)]; const others = shuffle(p.filter(x => x.id !== w.id && x.es !== w.es && x.hu !== w.hu && !(icons && x.icon === w.icon))).slice(0, 3);
    return { w, prompt: w.hu, say: [{ l: 'hu', k: w.id, t: w.hu }], ans: w.id, opts: shuffle([w].concat(others)).map(o => o.id), words: [w].concat(others) }; }
  function startSpace() { ST.sp = { i: 0, n: QN(), score: 0, combo: 0, q: C.subj === 'mat' ? factQ() : wordQ(false), k: 0 }; ST.view = 'space'; render({ top: true }); spSay(); }
  function spSay() { const s = ST.sp; if (s && s.q && C.subj !== 'mat') say(s.q.say); }
  function spLabel(s, v) { if (C.subj === 'mat') return v; const w = s.q.words.find(x => x.id === v); return w ? w.es : v; }
  function vSpace() { const s = ST.sp; if (!s) return ''; if (s.done) return doneHtml(hu('t_space'), s.score, s.n, 'space');
    const lanes = s.q.opts.map((v, i) => '<button type="button" class="fx-met" data-a="spshot" data-v="' + esc(v) + '"' + (String(v) === String(s.q.ans) ? ' data-ok="1"' : '') + ' style="left:' + (4 + i * 24) + '%;animation-duration:' + (8 + Math.random() * 3).toFixed(1) + 's;animation-delay:' + (Math.random() * 1.2).toFixed(2) + 's"><span>' + esc(spLabel(s, v)) + '</span></button>').join('');
    return topbar(hu('t_space')) + '<div class="px-row">' + instrBtn('i_space') + '<span class="px-prog">' + (s.i + 1) + ' / ' + s.n + '</span><span class="px-stat">' + ICO.star + '<b>' + s.score + '</b></span>' + comboBadge(s) + (C.subj !== 'mat' ? '<button type="button" class="pbtn o sm" data-a="spsay">' + ICO.spk + '<span>HU</span></button>' : '') + '</div>' +
      '<div class="fx-space" data-k="' + s.k + '"><div class="fx-target">' + esc(s.q.prompt) + '</div>' + lanes + '<div class="fx-ship">' + shipSvg() + '</div></div>'; }
  function shipSvg() { return '<svg viewBox="0 0 80 60" width="80" height="60" aria-hidden="true"><path d="M40 4 L54 40 L40 34 L26 40 Z" fill="#5DADE2" stroke="#1F4E79" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="22" r="6" fill="#fff" stroke="#1F4E79" stroke-width="2"/><path d="M26 40 L14 52 L30 46 M54 40 L66 52 L50 46" fill="#E86A7A" stroke="#8E2A1F" stroke-width="2"/><path d="M34 40 L40 56 L46 40" fill="#F7C948"/></svg>'; }
  function spNext(ok, node) { const s = ST.sp; if (!s || s.lock) return; s.lock = true; const st = comboHit(s, ok); if (ok) { s.score++; award(st); try { H.sfxGood(); } catch (e) { } if (node) node.classList.add('boom'); } else { try { H.sfxBad(); } catch (e) { } const t = el.querySelector('.fx-met[data-ok]'); if (t) t.classList.add('show'); }
    if (C.subj !== 'mat' && s.q.w) { record({ type: 'w', id: s.q.w.id, label: s.q.w.es, hu: s.q.w.hu, unit: s.q.w.unit }, ok); }
    setTimeout(() => { s.lock = false; s.i++; if (s.i >= s.n) { s.done = true; markActive(); award(3); if (s.score / s.n >= .8) celebrate(); } else { s.q = C.subj === 'mat' ? factQ() : wordQ(false); s.k++; } render(); if (!s.done) spSay(); }, ok ? 650 : 1300); }
  // ---- 6b: szorzótábla-bingó (matek)
  function startBingo() { const ts = focusTables(); const facts = []; const seen = {}; let guard = 0;
    while (facts.length < 16 && guard++ < 500) { const b = ts[Math.floor(Math.random() * ts.length)], a = Math.floor(Math.random() * 11); const v = a * b; if (seen[v]) continue; seen[v] = 1; facts.push({ a, b, v, hit: false }); }
    ST.bg = { cells: shuffle(facts), called: null, n: 0, ok: 0, done: false }; ST.view = 'bingo'; bgCall(); render({ top: true }); bgSay(); }
  function bgCall() { const g = ST.bg; const rest = g.cells.filter(c => !c.hit); if (!rest.length) { g.done = true; return; } g.called = rest[Math.floor(Math.random() * rest.length)]; g.n++; }
  function bgText(c) { return numWord(c.a) + (C.lang === 'es' ? ' por ' : ' times ') + numWord(c.b); }
  function bgSay() { const g = ST.bg; if (g && g.called && !g.done) say([{ l: C.lang, k: 'x:none', t: bgText(g.called) }]); }
  function bgLine(cells) { const L = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], [0, 5, 10, 15], [3, 6, 9, 12]]; return L.find(l => l.every(i => cells[i].hit)); }
  function vBingo() { const g = ST.bg; if (!g) return ''; const line = bgLine(g.cells) || [];
    return topbar(hu('t_bingo')) + '<div class="px-row">' + instrBtn('i_bingo') + '<button type="button" class="pbtn o sm" data-a="bgsay">' + ICO.spk + '<span>' + esc(hu('b_again_listen')) + '</span></button><span class="px-stat">' + ICO.star + '<b>' + g.ok + '</b></span></div>' +
      (g.done ? '<div class="px-card center"><h2 class="fx-bingo">' + esc(hu('bingo')) + '</h2><button type="button" class="pbtn g xl" data-a="bingo">' + esc(hu('b_again')) + '</button></div>' : '<div class="fx-call">' + esc(bgText(g.called)) + '</div>') +
      '<div class="fx-bgrid">' + g.cells.map((c, i) => '<button type="button" class="fx-bc' + (c.hit ? ' hit' : '') + (line.indexOf(i) >= 0 ? ' line' : '') + '" data-a="bgpick" data-i="' + i + '"' + (c.hit || g.done ? ' disabled' : '') + '>' + c.v + '</button>').join('') + '</div>'; }
  // ---- 7: buborékpukkasztó
  function startBubble() { ST.bb = { i: 0, n: QN(), score: 0, combo: 0, q: wordQ(true), k: 0 }; ST.view = 'bubble'; render({ top: true }); bbSay(); }
  function bbSay() { const b = ST.bb; if (b && b.q) say([{ l: C.lang, k: b.q.w.id, t: b.q.w.es }]); }
  function vBubble() { const b = ST.bb; if (!b) return ''; if (b.done) return doneHtml(hu('t_bubble'), b.score, b.n, 'bubble');
    const bs = b.q.words.slice().sort(() => Math.random() - .5).map((w, i) => '<button type="button" class="fx-bub" data-a="bbpick" data-id="' + w.id + '" style="animation-delay:' + (i * .35).toFixed(2) + 's">' + (w.icon ? '<span class="ic">' + w.icon + '</span>' : '') + '<span class="tx">' + esc(w.hu.replace(/\s*\([^)]*\)/g, '')) + '</span></button>').join('');
    return topbar(hu('t_bubble')) + '<div class="px-row">' + instrBtn('i_bubble') + '<span class="px-prog">' + (b.i + 1) + ' / ' + b.n + '</span><span class="px-stat">' + ICO.star + '<b>' + b.score + '</b></span>' + comboBadge(b) + '</div>' +
      '<div class="px-row center"><button type="button" class="pbtn b xl" data-a="bbsay">' + ICO.spk + '<span>' + esc(hu('b_again_listen')) + '</span></button></div><div class="fx-bubs" data-k="' + b.k + '">' + bs + '</div>'; }
  function bbPick(id, node) { const b = ST.bb; if (!b || b.lock) return; const ok = id === b.q.w.id;
    if (!ok) { b.combo = 0; try { H.sfxBad(); } catch (e) { } if (node) { node.classList.add('no'); setTimeout(() => node.classList.remove('no'), 500); } record({ type: 'w', id: b.q.w.id, label: b.q.w.es, hu: b.q.w.hu, unit: b.q.w.unit }, false); b.missed = true; return; }
    b.lock = true; const st = comboHit(b, !b.missed); b.score++; award(st || 1); record({ type: 'w', id: b.q.w.id, label: b.q.w.es, hu: b.q.w.hu, unit: b.q.w.unit }, !b.missed); try { H.sfxGood(); } catch (e) { } if (node) node.classList.add('pop');
    setTimeout(() => { b.lock = false; b.missed = false; b.i++; if (b.i >= b.n) { b.done = true; markActive(); award(3); if (b.score / b.n >= .8) celebrate(); } else { b.q = wordQ(true); b.k++; } render(); if (!b.done) bbSay(); }, 700); }
  // ---- 8: szóépítő (betűkből; SOHA nem betűztetünk hangosan)
  function buildPool() { const ok = w => { const e = w.es.replace(/\s*\([^)]*\)/g, '').replace(/^(el|la|los|las|un|una|the|a|an|to)\s+/i, '').trim(); return /^[a-záéíóúñü]{3,9}$/i.test(e); }; let p = poolFor(activeUnits()).filter(ok); if (p.length < 4) p = pool().filter(ok); return p; }
  function bdWord(w) { return w.es.replace(/\s*\([^)]*\)/g, '').replace(/^(el|la|los|las|un|una|the|a|an|to)\s+/i, '').trim().toLowerCase(); }
  function bdNew() { const p = buildPool(); if (!p.length) return null; const w = p[Math.floor(Math.random() * p.length)]; const t = bdWord(w); return { w, t, tiles: shuffle(t.split('').map((c, i) => ({ c, i, used: false }))), pos: 0, err: 0 }; }
  function startBuild() { const q = bdNew(); if (!q) return; ST.bd = { i: 0, n: QN(), score: 0, combo: 0, q }; ST.view = 'build'; render({ top: true }); bdSay(); }
  function bdSay() { const b = ST.bd; if (b && b.q) say([{ l: 'hu', k: b.q.w.id, t: b.q.w.hu }, { l: C.lang, k: b.q.w.id, t: b.q.w.es }]); }
  function vBuild() { const b = ST.bd; if (!b) return ''; if (b.done) return doneHtml(hu('t_builder'), b.score, b.n, 'build'); const q = b.q;
    return topbar(hu('t_builder')) + '<div class="px-row">' + instrBtn('i_builder') + '<span class="px-prog">' + (b.i + 1) + ' / ' + b.n + '</span><span class="px-stat">' + ICO.star + '<b>' + b.score + '</b></span>' + comboBadge(b) + '</div>' +
      '<div class="px-card center">' + (q.w.icon ? '<div class="px-ico">' + q.w.icon + '</div>' : '') + '<div class="px-bigq">' + esc(q.w.hu) + '</div><div class="px-row center"><button type="button" class="pbtn o" data-a="bdsay">' + ICO.spk + '<span>' + esc(hu('b_again_listen')) + '</span></button><button type="button" class="pbtn l sm" data-a="bdhint"><span>' + esc(L3('Segíts!', 'Help!', '¡Ayuda!').hu) + '</span></button></div>' +
      '<div class="fx-slots">' + q.t.split('').map((c, i) => '<span class="' + (i < q.pos ? 'on' : '') + '">' + (i < q.pos ? esc(c) : '') + '</span>').join('') + '</div>' +
      '<div class="fx-tiles">' + q.tiles.map((x, i) => '<button type="button" class="fx-tile' + (x.used ? ' used' : '') + '" data-a="bdtile" data-i="' + i + '"' + (x.used ? ' disabled' : '') + '>' + esc(x.c) + '</button>').join('') + '</div></div>'; }
  function bdTile(i, node) { const b = ST.bd; const q = b.q; const x = q.tiles[i]; if (!x || x.used || b.lock) return;
    if (x.c === q.t[q.pos]) { x.used = true; q.pos++; if (q.pos >= q.t.length) { b.lock = true; const ok = q.err === 0; const st = comboHit(b, ok); b.score++; award(st || 1); record({ type: 'w', id: q.w.id, label: q.w.es, hu: q.w.hu, unit: q.w.unit }, ok); try { H.sfxGood(); } catch (e) { } render(); say([{ l: C.lang, k: q.w.id, t: q.w.es }]);
        setTimeout(() => { b.lock = false; b.i++; if (b.i >= b.n) { b.done = true; markActive(); award(3); if (b.score / b.n >= .8) celebrate(); } else b.q = bdNew(); render(); if (!b.done) bdSay(); }, 1300); } else render(); }
    else { q.err++; b.combo = 0; try { H.sfxBad(); } catch (e) { } if (node) { node.classList.add('no'); setTimeout(() => node.classList.remove('no'), 450); } } }
  function bdHint() { const b = ST.bd, q = b.q; const x = q.tiles.find(t => !t.used && t.c === q.t[q.pos]); if (x) { q.err++; const i = q.tiles.indexOf(x); const n = el.querySelector('.fx-tile[data-i="' + i + '"]'); if (n) { n.classList.add('hint'); setTimeout(() => n.classList.remove('hint'), 900); } } }
  function doneHtml(title, score, n, again) { return topbar(title) + '<div class="px-card center">' + kitty(score / n >= .6 ? 'happy' : 'idle', 130, score / n >= .8 ? 'k-dance' : '') + '<h2>' + esc(hu('run_done')) + '</h2><p class="px-big">' + score + ' / ' + n + '</p></div><div class="px-row center"><button type="button" class="pbtn g" data-a="' + again + '">' + esc(hu('b_again')) + '</button><button type="button" class="pbtn l" data-a="home">' + esc(hu('b_home')) + '</button></div>'; }
  // ---- 10: heti kihívás valódi jutalommal
  function weekKey(d) { d = d || new Date(); const m = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const wd = (m.getDay() + 6) % 7; m.setDate(m.getDate() - wd); return ymd(m); }
  function weekly() { let w = null; try { w = JSON.parse(root.localStorage.getItem('martin_weekly') || 'null'); } catch (e) { } return w || P.weekly || { goal: 5, reward: '' }; }
  function setWeekly(w) { P.weekly = w; Store.save(); try { root.localStorage.setItem('martin_weekly', JSON.stringify(w)); } catch (e) { } }
  function weekDays() { const wk = weekKey(); const act = activeDays(); const out = []; for (let i = 0; i < 7; i++) { const d = addDays(wk, i); out.push({ d, on: !!act[d] }); } return out; }
  function weeklyHtml() { const w = weekly(); const ds = weekDays(); const n = ds.filter(x => x.on).length; const done = n >= w.goal; const names = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V']; const t = today();
    if (done) { P.wkCel = P.wkCel || {}; const k = weekKey(); if (!P.wkCel[k]) { P.wkCel[k] = 1; Store.save(); setTimeout(() => { celebrate(true); sayHu('weekly_done'); }, 600); } }
    return '<div class="px-card fx-week' + (done ? ' done' : '') + '"><div class="px-row"><b class="fx-wt">' + esc(hu('t_weekly')) + '</b><span class="px-sub">' + n + ' / ' + w.goal + ' ' + esc(L3('nap', 'days', 'días').hu) + '</span></div><div class="fx-wdays">' + ds.map((x, i) => '<span class="' + (x.on ? 'on' : '') + (x.d === t ? ' today' : '') + '"><i>' + names[i] + '</i>' + (x.on ? '★' : '') + '</span>').join('') + '</div>' +
      '<div class="fx-wbar"><i style="width:' + Math.min(100, Math.round(n / w.goal * 100)) + '%"></i></div>' + (w.reward ? '<p class="fx-wr">' + (done ? '🎉 ' + esc(hu('weekly_done')) + ' ' : esc(L3('Jutalom: ', '', '').hu)) + '<b>' + esc(w.reward) + '</b></p>' : '<p class="px-note">' + esc(L3('A jutalmat a Szülő nézetben lehet beállítani.', '', '').hu) + '</p>') + '</div>'; }
  function weeklyParentHtml() { const w = weekly(); return '<div class="px-card"><h3>Heti kihívás (valódi jutalom)</h3><p class="px-note">Hány napot gyakoroljon a héten (hétfő–vasárnap), és mi a jutalom? A Kezdőlapon Martin látja, hol tart; ha megvan, konfetti és ünneplés jön.</p><div class="px-chips">' + [3, 4, 5, 6, 7].map(g => '<button type="button" class="chip' + (w.goal === g ? ' on' : '') + '" data-a="wkgoal" data-n="' + g + '">' + g + ' nap</button>').join('') + '</div><div class="px-row"><input id="fx-wreward" class="px-input" type="text" value="' + esc(w.reward || '') + '" placeholder="pl. mozi, közös társasjáték" aria-label="Jutalom"><button type="button" class="pbtn g" data-a="wksave"><span>Mentés</span></button></div>' +
      '<label class="px-row"><input type="checkbox" data-a="mapall"' + (P.mapAll ? ' checked' : '') + '> <span>Kalandtérkép: minden állomás legyen nyitva</span></label></div>'; }
  // ---- 11: cicaszoba
  const ROOM = [
    { id: 'rug', vb: '120 280 360 80', p: 5, hu: 'Szőnyeg', svg: '<ellipse cx="300" cy="320" rx="170" ry="28" fill="#E86A7A"/><ellipse cx="300" cy="320" rx="140" ry="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="10 8"/>' },
    { id: 'window', vb: '60 40 140 120', p: 6, hu: 'Ablak', svg: '<rect x="70" y="50" width="120" height="100" rx="8" fill="#BFE3F7" stroke="#8A5A2B" stroke-width="8"/><path d="M130 50 v100 M70 100 h120" stroke="#8A5A2B" stroke-width="6"/><circle cx="165" cy="75" r="12" fill="#F7C948"/>' },
    { id: 'plant', vb: '465 190 110 150', p: 8, hu: 'Virágcserép', svg: '<path d="M500 300 h40 l-6 36 h-28z" fill="#B85A12"/><path d="M520 300 q-30 -40 -10 -80 M520 300 q10 -50 30 -70 M520 300 q-5 -30 -30 -40" stroke="#22603C" stroke-width="6" fill="none"/><circle cx="510" cy="220" r="10" fill="#E86A7A"/><circle cx="550" cy="230" r="9" fill="#F7C948"/>' },
    { id: 'ball', vb: '390 292 60 60', p: 8, hu: 'Fonalgombolyag', svg: '<circle cx="420" cy="322" r="18" fill="#7D3C98"/><path d="M405 315 q15 -10 30 4 M404 326 q16 -8 32 6 M438 318 q-10 30 -40 30" stroke="#C39BD3" stroke-width="3" fill="none"/>' },
    { id: 'picture', vb: '385 48 140 105', p: 10, hu: 'Kép a falon', svg: '<rect x="400" y="60" width="110" height="80" rx="6" fill="#FFF1E4" stroke="#B8860B" stroke-width="7"/><path d="M410 130 l30 -36 l24 26 l14 -14 l24 24z" fill="#6BBF59"/><circle cx="488" cy="82" r="9" fill="#F7C948"/>' },
    { id: 'lamp', vb: '205 160 110 180', p: 12, hu: 'Lámpa', svg: '<path d="M240 330 h40 M260 330 v-120" stroke="#1E2A38" stroke-width="6"/><path d="M228 212 l12 -40 h40 l12 40z" fill="#F7C948" stroke="#B8860B" stroke-width="4"/><circle cx="260" cy="220" r="40" fill="#F7C948" opacity=".18"/>' },
    { id: 'bed', vb: '70 280 160 65', p: 15, hu: 'Cicaágy', svg: '<ellipse cx="150" cy="318" rx="70" ry="22" fill="#5DADE2" stroke="#1F4E79" stroke-width="5"/><ellipse cx="150" cy="310" rx="52" ry="12" fill="#FFF1E4"/>' },
    { id: 'shelf', vb: '205 25 160 60', p: 15, hu: 'Könyvespolc', svg: '<rect x="215" y="70" width="140" height="10" fill="#8A5A2B"/><rect x="225" y="40" width="14" height="30" fill="#E86A7A"/><rect x="242" y="35" width="12" height="35" fill="#5DADE2"/><rect x="257" y="44" width="16" height="26" fill="#6BBF59"/><rect x="276" y="38" width="10" height="32" fill="#F7C948"/><path d="M300 70 l20 -26 l20 26z" fill="#7D3C98"/>' },
    { id: 'fish', vb: '445 240 110 100', p: 20, hu: 'Akvárium', svg: '<rect x="455" y="250" width="90" height="56" rx="10" fill="#BFE3F7" stroke="#1F4E79" stroke-width="4"/><path d="M480 278 q10 -10 20 0 q-10 10 -20 0z M500 278 l8 -6 v12z" fill="#F2891F"/><circle cx="520" cy="266" r="3" fill="#fff"/><circle cx="526" cy="258" r="2" fill="#fff"/><rect x="465" y="306" width="70" height="30" fill="#8A5A2B"/>' },
    { id: 'tower', vb: '0 180 90 165', p: 25, hu: 'Kaparófa', svg: '<rect x="30" y="200" width="24" height="136" fill="#E6C79C" stroke="#8A5A2B" stroke-width="3"/><rect x="10" y="190" width="64" height="14" rx="5" fill="#B85A12"/><rect x="10" y="260" width="64" height="12" rx="5" fill="#B85A12"/><rect x="0" y="330" width="84" height="10" rx="4" fill="#8A5A2B"/>' },
    { id: 'garland', vb: '10 10 580 60', p: 30, hu: 'Zászlófüzér', svg: '<path d="M20 20 q290 60 560 0" stroke="#1E2A38" stroke-width="2" fill="none"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => { const x = 45 + i * 54; const y = 20 + Math.sin(i / 9 * Math.PI) * 30; return '<path d="M' + x + ' ' + y + ' l14 0 l-7 18z" fill="' + ['#E86A7A', '#F7C948', '#6BBF59', '#5DADE2', '#7D3C98'][i % 5] + '"/>'; }).join('') },
    { id: 'crown', vb: '320 288 100 48', p: 40, hu: 'Trónpárna', svg: '<rect x="330" y="300" width="80" height="26" rx="12" fill="#C0392B" stroke="#7B241C" stroke-width="3"/><circle cx="335" cy="326" r="5" fill="#F7C948"/><circle cx="405" cy="326" r="5" fill="#F7C948"/>' }];
  function vRoom() { const own = P.room || []; const bal = P.stars - P.spent;
    const scene = '<svg viewBox="0 0 600 360" class="fx-room" role="img" aria-label="Cicaszoba"><rect width="600" height="270" fill="#FFF4D6"/><rect y="270" width="600" height="90" fill="#E6C79C"/><path d="M0 270 h600" stroke="#B8860B" stroke-width="4"/>' + ROOM.filter(r => own.indexOf(r.id) >= 0).map(r => r.svg).join('') + '</svg>';
    return topbar(hu('t_room')) + '<div class="px-row">' + instrBtn('i_room') + '<span class="px-stat big">' + ICO.star + '<b>' + bal + '</b></span></div><div class="fx-roomwrap">' + scene + '<div class="fx-roomcat">' + kitty(ST.mood === 'happy' ? 'happy' : 'idle', 110, ST.mood === 'happy' ? 'k-dance' : '') + '</div></div>' +
      '<div class="px-tiles">' + ROOM.map(r => { const has = own.indexOf(r.id) >= 0; return '<div class="px-acc' + (has ? ' on' : '') + '"><div class="px-accimg"><svg viewBox="' + r.vb + '" aria-hidden="true">' + r.svg + '</svg></div><b>' + esc(r.hu) + '</b>' + (has ? '<span class="px-sub">✔</span>' : '<button type="button" class="pbtn o sm" data-a="roombuy" data-id="' + r.id + '"' + (bal < r.p ? ' disabled' : '') + '>' + ICO.star + ' ' + r.p + '</button>') + '</div>'; }).join('') + '</div>'; }
  // ---- csempe-ikonok az új játékokhoz
  const FUNICO = { map: '<path d="M8 14 l16 -6 l16 6 l16 -6 v42 l-16 6 l-16 -6 l-16 6z" fill="#FFF1E4" stroke="#B85A12" stroke-width="3"/><path d="M14 40 q10 -14 18 -4 t20 -12" stroke="#E86A7A" stroke-width="3" stroke-dasharray="4 4" fill="none"/><circle cx="50" cy="22" r="4" fill="#E86A7A"/>',
    blitz: '<path d="M36 4 L14 36 h16 l-6 24 l26 -36 h-16z" fill="#F7C948" stroke="#B8860B" stroke-width="3" stroke-linejoin="round"/>',
    duel: '<circle cx="20" cy="22" r="9" fill="#5DADE2"/><path d="M6 52 q0 -18 14 -18 q14 0 14 18z" fill="#5DADE2"/><circle cx="44" cy="20" r="10" fill="#9AA7B4"/><path d="M30 52 q0 -20 14 -20 q14 0 14 20z" fill="#9AA7B4"/><text x="32" y="16" font-size="12" font-weight="900" text-anchor="middle" fill="#C0392B">VS</text>',
    space: '<path d="M32 6 L44 40 L32 34 L20 40 Z" fill="#5DADE2" stroke="#1F4E79" stroke-width="3"/><circle cx="32" cy="22" r="5" fill="#fff"/><path d="M26 40 l6 14 l6 -14" fill="#F7C948"/><circle cx="12" cy="12" r="5" fill="#8A5A2B"/><circle cx="54" cy="16" r="4" fill="#8A5A2B"/>',
    bingo: '<rect x="8" y="8" width="48" height="48" rx="6" fill="#fff" stroke="#7D3C98" stroke-width="3"/><path d="M24 8 v48 M40 8 v48 M8 24 h48 M8 40 h48" stroke="#7D3C98" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#E86A7A"/><circle cx="32" cy="32" r="5" fill="#E86A7A"/><circle cx="48" cy="48" r="5" fill="#E86A7A"/>',
    bubble: '<circle cx="24" cy="36" r="16" fill="#BFE3F7" stroke="#5DADE2" stroke-width="3"/><circle cx="44" cy="18" r="11" fill="#BFE3F7" stroke="#5DADE2" stroke-width="3"/><circle cx="18" cy="30" r="4" fill="#fff"/><circle cx="40" cy="14" r="3" fill="#fff"/>',
    build: '<rect x="6" y="22" width="16" height="20" rx="3" fill="#F7C948" stroke="#B8860B" stroke-width="2"/><rect x="24" y="22" width="16" height="20" rx="3" fill="#6BBF59" stroke="#22603C" stroke-width="2"/><rect x="42" y="22" width="16" height="20" rx="3" fill="#E86A7A" stroke="#8E2A1F" stroke-width="2"/><text x="14" y="37" font-size="12" font-weight="900" text-anchor="middle">A</text><text x="32" y="37" font-size="12" font-weight="900" text-anchor="middle">B</text><text x="50" y="37" font-size="12" font-weight="900" text-anchor="middle">C</text>',
    room: '<path d="M8 30 L32 10 L56 30 v26 H8z" fill="#FFF1E4" stroke="#B85A12" stroke-width="3"/><rect x="26" y="38" width="12" height="18" fill="#B85A12"/><circle cx="20" cy="34" r="4" fill="#F7C948"/>' };
  // ---- extra CSS
  function injectFunCss() { if (document.getElementById('fx-css')) return; const s = document.createElement('style'); s.id = 'fx-css'; s.textContent = FUNCSS; document.head.appendChild(s); }
  const FUNCSS = `
.px-tile.T9{border-color:#1A7F8E}.px-tile.T10{border-color:#F7C948}.px-tile.T11{border-color:#9AA7B4}.px-tile.T12{border-color:#1F4E79}.px-tile.T13{border-color:#7D3C98}.px-tile.T14{border-color:#5DADE2}.px-tile.T15{border-color:#6BBF59}.px-tile.T16{border-color:#E86A7A}
.fx-conf{position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden}.fx-conf i{position:absolute;top:-20px;width:10px;height:16px;border-radius:2px;animation:fxfall linear forwards}
@keyframes fxfall{to{transform:translateY(110vh) rotate(720deg);opacity:.9}}
.fx-toast{position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:99998;background:#fff;border:4px solid #F2891F;color:#B85A12;font:900 26px 'Baloo 2','Segoe UI Black',sans-serif;padding:10px 22px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.18);animation:fxpop 1.9s ease forwards;pointer-events:none;white-space:nowrap}
.fx-toast.c5{border-color:#7D3C98;color:#7D3C98}.fx-toast.gold{border-color:#B8860B;color:#8A6D0B;background:#FFF7D6}
@keyframes fxpop{0%{opacity:0;transform:translateX(-50%) scale(.5)}15%{opacity:1;transform:translateX(-50%) scale(1.12)}25%{transform:translateX(-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-30px)}}
.fx-combo{display:inline-flex;align-items:center;font-weight:900;color:#fff;background:#F2891F;border-radius:999px;padding:4px 12px;font-size:16px}.fx-combo.hot{background:#C0392B;animation:fxpulse .6s ease-in-out infinite alternate}
@keyframes fxpulse{to{transform:scale(1.1)}}
.kitty.k-jump svg{animation:kjump .35s ease-in-out infinite alternate}.kitty.k-spin svg{animation:fxspin .9s ease-in-out 1}.kitty.k-wiggle svg{animation:fxwig .25s ease-in-out 4 alternate}.kitty.k-flip svg{animation:fxflip .8s ease-in-out 1}.kitty.k-dance svg{animation:fxdance .5s ease-in-out infinite alternate}
@keyframes fxspin{to{transform:rotate(360deg)}}@keyframes fxwig{0%{transform:rotate(-12deg)}100%{transform:rotate(12deg)}}@keyframes fxflip{50%{transform:translateY(-30px) scaleX(-1)}}@keyframes fxdance{0%{transform:translateY(0) rotate(-10deg) scale(1)}100%{transform:translateY(-18px) rotate(10deg) scale(1.08)}}
.fx-island{background:#fff;border:3px solid #BFE3F7;border-radius:26px;padding:14px;display:flex;flex-direction:column;gap:10px;background-image:radial-gradient(circle at 10% 10%,#EAF7FF 0,#fff 60%)}.fx-island.ev{border-color:#F2891F}
.fx-isl-h{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline}.fx-isl-h b{font:800 22px 'Baloo 2','Segoe UI Black',sans-serif;color:#1F4E79}.fx-isl-h span{color:#22603C;font-weight:700}.fx-isl-h .fx-st{margin-left:auto;color:#7A4A12;font-weight:900;display:inline-flex;gap:4px;align-items:center}
.fx-path{display:flex;flex-wrap:wrap;gap:10px;align-items:stretch}
.fx-stn{position:relative;flex:1 1 120px;max-width:180px;min-height:112px;border:3px solid #6BBF59;background:#F3FBF0;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px;font:inherit;cursor:pointer}
.fx-stn .dot{display:flex;align-items:center;justify-content:center;min-width:44px;height:44px;border-radius:999px;background:#6BBF59;color:#fff;font-weight:900;font-size:20px}
.fx-stn .nm{font-weight:800;font-size:14px;text-align:center;color:#1E2A38;line-height:1.15}.fx-stn .sts i{font-style:normal;color:#D5DBE1;font-size:20px}.fx-stn .sts i.on{color:#F2B705}.fx-stn small{font-weight:800;color:#4A5562}
.fx-stn.lock{border-color:#D5DBE1;background:#F4F6F8;cursor:not-allowed;opacity:.75}.fx-stn.lock .dot{background:#C9D3DD}
.fx-stn.cur{border-color:#F2891F;box-shadow:0 0 0 4px #FFE2C2}.fx-cat{position:absolute;top:-30px;right:-6px;pointer-events:none}
.fx-stn.boss{border-color:#7D3C98;background:#F6EEFA}.fx-stn.boss .dot{background:none;height:auto}
.fx-boss{display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:#F6EEFA;border:3px solid #7D3C98;border-radius:22px;padding:10px 14px}.fx-mon{animation:fxbob 1.2s ease-in-out infinite alternate}.fx-mon.hit{animation:fxhit .45s ease 1}
@keyframes fxbob{to{transform:translateY(-6px)}}@keyframes fxhit{20%{transform:translateX(-10px) rotate(-8deg);filter:brightness(1.8)}60%{transform:translateX(8px) rotate(6deg)}}
.fx-bars{flex:1 1 200px;display:flex;flex-direction:column;gap:8px}.fx-hp{position:relative;height:24px;border-radius:999px;background:#E5D3EC;overflow:hidden}.fx-hp i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,#C0392B,#E86A7A);transition:width .4s}.fx-hp span{position:relative;display:block;text-align:center;font-weight:900;color:#fff;line-height:24px;text-shadow:0 1px 2px rgba(0,0,0,.4)}
.fx-hearts span{font-size:26px;color:#D5DBE1;margin-right:2px}.fx-hearts span.on{color:#E86A7A}
.fx-duel{display:flex;align-items:center;gap:10px;justify-content:center}.fx-duel .pl{flex:1 1 0;max-width:220px;border:3px solid #C9D3DD;border-radius:18px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;background:#fff}.fx-duel .pl b{font-size:20px}.fx-duel .pl span{font:900 30px 'Baloo 2',sans-serif;color:#1F4E79}.fx-duel .pl.on{border-color:#F2891F;background:#FFF1E4}.fx-duel .vs{font:900 22px 'Baloo 2',sans-serif;color:#C0392B}
.fx-turn{text-align:center;font:900 24px 'Baloo 2',sans-serif;color:#B85A12}.fx-dt{display:inline-block;margin-left:8px;padding:2px 12px;border-radius:999px;color:#fff;background:linear-gradient(90deg,#C0392B var(--p,100%),#9AA7B4 var(--p,100%))}
.fx-space{position:relative;height:440px;border-radius:24px;overflow:hidden;background:radial-gradient(circle at 20% 20%,#2C3E70,#0E1630 70%);border:3px solid #1F4E79}
.fx-space::before{content:'';position:absolute;inset:0;background-image:radial-gradient(2px 2px at 20px 30px,#fff,transparent),radial-gradient(2px 2px at 120px 80px,#fff,transparent),radial-gradient(1px 1px at 220px 150px,#fff,transparent),radial-gradient(2px 2px at 320px 40px,#fff,transparent),radial-gradient(1px 1px at 60px 200px,#fff,transparent);background-size:360px 240px;opacity:.7}
.fx-target{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:3;background:#fff;color:#1F4E79;border-radius:999px;padding:6px 22px;font:900 30px 'Baloo 2',sans-serif;white-space:nowrap;max-width:94%;overflow:hidden;text-overflow:ellipsis}
.fx-met{position:absolute;top:-80px;width:22%;min-height:64px;border:none;border-radius:999px 999px 999px 999px;background:radial-gradient(circle at 35% 35%,#C49A6C,#7A5230);color:#fff;font:900 22px 'Nunito',sans-serif;cursor:pointer;animation-name:fxdrop;animation-timing-function:linear;animation-fill-mode:forwards;box-shadow:0 0 0 3px rgba(255,255,255,.25);padding:6px 4px;z-index:2}
.fx-met span{display:block;text-shadow:0 2px 3px rgba(0,0,0,.5);word-break:break-word;line-height:1.1}
@keyframes fxdrop{from{top:-80px}to{top:380px}}.fx-met.boom{animation:fxboom .5s ease forwards!important;background:radial-gradient(circle,#FFF7D6,#F7C948 40%,#F2891F 70%)}.fx-met.show{background:#6BBF59;animation-play-state:paused}
@keyframes fxboom{to{transform:scale(1.8);opacity:0}}
.fx-ship{position:absolute;left:50%;bottom:6px;transform:translateX(-50%);z-index:1}
.fx-call{text-align:center;font:900 34px 'Baloo 2',sans-serif;color:#7D3C98;background:#fff;border:3px solid #7D3C98;border-radius:22px;padding:10px}
.fx-bgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:520px;margin:0 auto;width:100%}.fx-bc{aspect-ratio:1;border:3px solid #C9D3DD;border-radius:16px;background:#fff;font:900 30px 'Baloo 2',sans-serif;color:#1E2A38;cursor:pointer}.fx-bc.hit{background:#E86A7A;color:#fff;border-color:#8E2A1F}.fx-bc.line{background:#F7C948;color:#7A4A12;border-color:#B8860B;animation:fxpulse .5s ease-in-out infinite alternate}.fx-bc.no{animation:fxshake .4s}
.fx-bingo{font-size:54px!important;color:#7D3C98!important;animation:fxpulse .5s ease-in-out infinite alternate}
@keyframes fxshake{20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
.fx-bubs{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;padding:10px 0 20px}.fx-bub{width:150px;height:150px;border-radius:50%;border:3px solid #5DADE2;background:radial-gradient(circle at 30% 28%,#fff 0,#EAF7FF 30%,#BFE3F7 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;font:inherit;animation:fxbub 2.4s ease-in-out infinite alternate;padding:10px}
.fx-bub .ic svg{width:64px;height:64px}.fx-bub .tx{font-weight:800;font-size:15px;color:#1F4E79;line-height:1.1;text-align:center}.fx-bub.no{animation:fxshake .45s}.fx-bub.pop{animation:fxboom .5s ease forwards}
@keyframes fxbub{to{transform:translateY(-14px)}}
.fx-slots{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}.fx-slots span{width:46px;height:56px;border-bottom:5px solid #1F4E79;font:900 34px 'Baloo 2',sans-serif;color:#22603C;display:flex;align-items:flex-end;justify-content:center}.fx-slots span.on{animation:fxpop2 .3s}
@keyframes fxpop2{from{transform:scale(1.5)}}
.fx-tiles{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.fx-tile{width:58px;height:62px;border-radius:14px;border:3px solid #B8860B;background:#F7C948;font:900 30px 'Baloo 2',sans-serif;color:#7A4A12;cursor:pointer;box-shadow:0 4px 0 #B8860B}.fx-tile.used{visibility:hidden}.fx-tile.no{animation:fxshake .4s;background:#F5B7B1}.fx-tile.hint{animation:fxpulse .3s ease-in-out 3 alternate;background:#ABEBC6}
.fx-week{border-color:#6BBF59}.fx-week.done{border-color:#F2B705;background:#FFFBEA}.fx-wt{font:800 22px 'Baloo 2',sans-serif;color:#22603C}.fx-wdays{display:flex;gap:6px}.fx-wdays span{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:52px;border-radius:12px;background:#F4F6F8;border:2px solid #E1E6EB;font-weight:900;color:#F2B705;font-size:20px}.fx-wdays span i{font-style:normal;font-size:13px;color:#4A5562}.fx-wdays span.on{background:#EAF7E6;border-color:#6BBF59}.fx-wdays span.today{box-shadow:0 0 0 3px #F2891F}
.fx-wbar{height:14px;border-radius:999px;background:#E1E6EB;overflow:hidden}.fx-wbar i{display:block;height:100%;background:linear-gradient(90deg,#6BBF59,#F2B705)}.fx-wr{margin:0;font-size:18px}
.fx-roomwrap{position:relative;max-width:720px;margin:0 auto;width:100%}.fx-room{width:100%;height:auto;border-radius:22px;border:3px solid #F2D9B8;display:block}.fx-roomcat{position:absolute;left:44%;bottom:6%;width:18%}.fx-roomcat .kitty{width:100%!important;height:auto!important}
.fx-flash{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);font:900 90px sans-serif;pointer-events:none;z-index:9999;animation:fxflash .6s ease forwards}.fx-flash.ok{color:#22A15A}.fx-flash.bad{color:#C0392B}@keyframes fxflash{from{opacity:1;transform:translate(-50%,-50%) scale(.6)}to{opacity:0;transform:translate(-50%,-50%) scale(1.4)}}
.stk.gold{border-color:#B8860B!important;background:linear-gradient(135deg,#FFF7D6,#F7C948)!important;box-shadow:0 0 0 3px #F7C948}
@media (max-width:520px){.fx-space{height:380px}@keyframes fxdrop{from{top:-80px}to{top:320px}}.fx-met{font-size:17px}.fx-bub{width:130px;height:130px}.fx-tile{width:48px;height:54px;font-size:26px}.fx-slots span{width:36px;font-size:28px}.fx-bc{font-size:24px}}
@media (prefers-reduced-motion:reduce){.fx-conf,.fx-mon,.fx-bub,.kitty.k-dance svg,.kitty.k-jump svg{animation:none!important}.fx-met{animation-duration:20s!important}}
`;

  // ================= start =================
  Plus.init = function (cfg) { C = cfg; X = cfg.data; X.i18n = X.i18n || {}; };
  Plus.mount = function (node, host) {
    H = host; if (el === node && P) { render(); return; } el = node; _pool = null;
    if (!P) { P = Object.assign(defP(), Store.readLocal() || {}); Store.mode = Store.readLocal() ? 'ez az eszköz (localStorage)' : 'csak memória'; Store.connect(); }
    if (!el._px) { el._px = 1;
      el.addEventListener('click', e => { if (ST.suppressClick) return; const b = e.target.closest('[data-a]'); if (!b || !el.contains(b)) return; try { act(b.dataset.a, b.dataset, b); } catch (er) { if (root.console) console.error(er); } });
      try { if (!root.pxMqKey) { root.pxMqKey = 1; document.addEventListener('keydown', mqKey); } } catch (e) { }
      el.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'px-input') { e.preventDefault(); act('check', {}, e.target); } });
      el.addEventListener('pointerdown', onPointerDown); el.addEventListener('pointermove', onPointerMove, { passive: false }); el.addEventListener('pointerup', onPointerUp); el.addEventListener('pointercancel', onPointerUp);
      el.addEventListener('input', e => { if (e.target.id === 'px-input' && ST.run) ST.run.typed = e.target.value; });
      el.addEventListener('animationend', e => { const m = e.target; if (ST.view === 'space' && m.classList && m.classList.contains('fx-met') && m.dataset.ok && e.animationName === 'fxdrop' && ST.sp && !ST.sp.lock) spNext(false, null); }); }
    try { stickerPool().forEach(w => { if (boxOf(w.id) >= 3) { P.stk = P.stk || {}; if (!P.stk[w.id]) P.stk[w.id] = today(); } }); } catch (e) { }
    if (!startChecked) { startChecked = true; try { const g = new URLSearchParams(root.location.search).get('go'); if (g) { ST.fromHub = true; if (g === 'mission') ST.view = 'start'; else if (g === 'race') ST.view = 'start'; } } catch (e) { } }
    injectCss(); injectFunCss(); xEnsure(); render();
  };
  let startChecked = false;
  try { root.addEventListener('pagehide', () => { if (P) Store.writeLocal(); }); root.addEventListener('visibilitychange', () => { if (P && document.visibilityState === 'hidden') Store.writeLocal(); }); } catch (e) { }
  Plus.unmount = function () { stopAll(); clearInterval(timerIv); };
  Plus.state = () => ({ ST, P }); Plus.S = S;
  function injectCss() { if (document.getElementById('px-css')) return; const s = document.createElement('style'); s.id = 'px-css'; s.textContent = C.css || ''; document.head.appendChild(s); }
  root.Plus = Plus;
})(typeof window !== 'undefined' ? window : globalThis);
