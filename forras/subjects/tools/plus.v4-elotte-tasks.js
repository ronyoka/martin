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
  function segOf(lang, key) { if (key.indexOf('x:') === 0 || key.indexOf('n:') === 0) return X.xsprite[lang] && X.xsprite[lang][key]; return H.D.sprite[lang] && H.D.sprite[lang][key]; }
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
  function playOne(it, done) { const k = it.k; if (k.indexOf('x:') === 0 || k.indexOf('n:') === 0) xplay(it.l, k, it.t, done); else H.speak(it.l, k, it.t, done); }
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
  function extraKind() { return C.subj === 'en' ? 'spelling' : C.subj === 'mat' ? 'gen' : C.subj === 'lengua' ? 'dictado' : null; }
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
    return list.map(l => ({ title: l.title, hu: l.title_hu, kind: l.kind, url: l.folder ? 'https://drive.google.com/drive/folders/' + l.folder : 'https://drive.google.com/file/d/' + l.drive + '/view' })); }
  Plus.linksFor = (unit) => { const L = (X.links && X.links.items) || []; return L.filter(l => (l.units || []).indexOf(unit) >= 0 || l.global).map(l => ({ title: l.title, hu: l.title_hu, kind: l.kind, url: l.folder ? 'https://drive.google.com/drive/folders/' + l.folder : 'https://drive.google.com/file/d/' + l.drive + '/view' })); };
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
  function gradeCard(id, ok) { const cur = boxOf(id); const b = ok ? Math.min(5, cur + 1) : 1; P.box[id] = { b, due: addDays(today(), INTERVAL[b]) }; Store.save(); }
  // ================= kérdés-építők =================
  function wordItems(w) { return [{ l: C.lang, k: w.id, t: w.es }, { l: 'hu', k: w.id, t: w.hu }]; }
  function vocabQ(w, mode, ppool) {
    const others = shuffle(ppool.filter(x => x.id !== w.id && x.hu !== w.hu && x.es !== w.es && !(x.icon && x.icon === w.icon))).slice(0, 2);
    const opts = shuffle([w].concat(others)); const rec = { type: 'w', id: w.id, label: w.es, hu: w.hu, unit: w.unit };
    if (mode === 'hear') return { kind: 'choice', part: 'vocab', unit: w.unit, page: w.page, rec, prompt: 'q_hear', audio: [{ l: C.lang, k: w.id, t: w.es }], hearOnly: true, answer: w.id,
      options: opts.map(o => ({ v: o.id, label: o.es, icon: o.icon, sub: '' })), explain: w.es + ' = ' + w.hu, reveal: wordItems(w) };
    if (mode === 'tr') return { kind: 'choice', part: 'vocab', unit: w.unit, page: w.page, rec, prompt: 'q_find', big: w.hu, audio: [{ l: 'hu', k: w.id, t: w.hu }], answer: w.id,
      options: opts.map(o => ({ v: o.id, label: o.es, icon: o.icon })), explain: w.es + ' = ' + w.hu, reveal: wordItems(w) };
    return { kind: 'choice', part: 'vocab', unit: w.unit, page: w.page, rec, prompt: 'q_meaning', big: w.es, audio: [{ l: C.lang, k: w.id, t: w.es }], answer: w.id,
      options: opts.map(o => ({ v: o.id, label: o.hu })), explain: w.es + ' = ' + w.hu, reveal: wordItems(w) };
  }
  function quizQ(q) { return { kind: 'choice', part: 'quiz', unit: q.unit, page: q.page, rec: { type: 'q', id: 'q' + q.i, label: q.q_es, hu: q.q_hu, unit: q.unit }, prompt: null, big: q.q_es, small: q.q_hu,
    audio: [{ l: C.lang, k: 'q:' + q.i, t: q.q_es }, { l: 'hu', k: 'q:' + q.i, t: q.q_hu }], answer: q.answer, options: q.options.map((o, i) => ({ v: i, label: o })), explain: q.explain, quizPage: q.page }; }
  function spellQ(w, unit) { return { kind: 'type', part: 'spell', unit: unit || 'u2', page: '', rec: { type: 'sp', id: w.w, label: w.w, hu: w.hu, unit: unit || '' }, prompt: 'q_write', big: w.hu, audio: [{ l: C.lang, k: 'x:sp:' + w.w, t: w.w }, { l: 'hu', k: 'x:sph:' + w.w, t: w.hu }], answer: w.w, explain: w.w, w }; }
  function genQ(topic, level) { const t = MG.make(topic, level); const q = { kind: t.kind === 'line' ? 'line' : t.kind === 'num' ? 'num' : 'choice', part: 'math', unit: topic === 'mult' || topic === 'add' || topic === 'factor' ? 'u2' : 'u1', page: '', task: t, topic,
    rec: { type: 'g:' + topic, id: t.text.es, label: t.text.es, hu: t.text.hu, unit: topic === 'mult' || topic === 'add' || topic === 'factor' ? 'u2' : 'u1' },
    prompt: null, big: t.text.es, small: t.text.hu, audio: null, answer: t.answer, explain: t.explain, options: t.options ? t.options.map(o => ({ v: o.v, label: o.label, es: o.es, hu: o.hu })) : null }; return q; }
  function topicsForUnits(units) { const t = []; if (units.indexOf('u2') >= 0) t.push('mult', 'add', 'factor'); if (units.indexOf('u1') >= 0) t.push('place', 'compare', 'line', 'round'); return t.length ? t : MG.TOPICS; }
  function level(topic) { return (P.gen[topic] && P.gen[topic].lvl) || 1; }
  function genAdapt(topic, ok) { const g = P.gen[topic] || (P.gen[topic] = { lvl: 1, run: 0, bad: 0, n: 0, ok: 0 }); g.n++; if (ok) { g.ok++; g.run++; g.bad = 0; if (g.run >= 3 && g.lvl < 5) { g.lvl++; g.run = 0; ST.levelUp = topic; } } else { g.bad++; g.run = 0; if (g.bad >= 2 && g.lvl > 1) { g.lvl--; g.bad = 0; } } }
  function pickTopic(units) { const ts = topicsForUnits(units); if (ST.topic && ST.topic !== 'mix' && ts.indexOf(ST.topic) >= 0) return ST.topic; const w = ts.map(t => { const g = P.gen[t]; return (g && g.n > 3) ? 1 + (1 - g.ok / g.n) * 3 : 2; }); let r = Math.random() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < ts.length; i++) { r -= w[i]; if (r <= 0) return ts[i]; } return ts[0]; }
  // ================= futtató (Run): gyakorlás / küldetés / próbadolgozat =================
  function startRun(cfg) { // cfg: {mode, title, qs|gen, back}
    stopAll(); ST.run = Object.assign({ i: 0, ans: null, num: '', typed: '', score: 0, res: [], tries: 0, ok: null, start: Date.now(), flipped: false }, cfg); ST.view = 'run';
    if (cfg.mode === 'test') { const total = cfg.secs; ST.run.end = Date.now() + total * 1000; startTimer(); }
    render({ top: true }); autoAudio();
  }
  function curQ() { const R = ST.run; if (R.gen && !R.qs[R.i]) R.qs[R.i] = R.gen(); return R.qs[R.i]; }
  function autoAudio() { const q = ST.run && curQ(); if (!q) return; if (q.kind === 'flash') { say(q.items); return; } if (q.task) { sayTask(q.task); return; } if (q.audio) say(q.audio); }
  function startTimer() { clearInterval(timerIv); timerIv = setInterval(() => { const R = ST.run; if (!R || R.mode !== 'test' || ST.view !== 'run') { clearInterval(timerIv); return; } const left = Math.max(0, Math.round((R.end - Date.now()) / 1000)); const t = el && el.querySelector('#px-timer'); if (t) t.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'); if (left <= 0) { clearInterval(timerIv); finishRun(true); } }, 500); }
  function answerRun(resp, extra) {
    const R = ST.run, q = curQ(); if (R.ans !== null && R.mode !== 'test') return; touch();
    let ok;
    if (q.kind === 'type') ok = norm(String(resp)) === norm(q.answer) || (q.alts || []).some(a => norm(a) === norm(String(resp))); else ok = String(resp) === String(q.answer);
    if (q.kind === 'type' && !ok && R.tries < 1 && R.mode !== 'test') { R.tries++; R.ok = 'retry'; sayHu('fb_retry'); try { H.sfxBad(); } catch (e) { } ST.mood = 'sad'; render(); return; }
    R.ans = resp; R.ok = ok; R.score += ok ? 1 : 0; R.res.push({ q, ok, resp });
    record(q.rec, ok); if (q.topic) genAdapt(q.topic, ok);
    if (R.mode === 'test') { nextRun(); return; }
    ST.mood = ok ? 'happy' : 'sad'; try { ok ? H.sfxGood() : H.sfxBad(); } catch (e) { }
    if (ok) award(1);
    render(); const fb = ok ? pickPraise() : 'fb_bad';
    setTimeout(() => { if (ST.view === 'run' && ST.run === R) { const it = [sx(fb)]; if (!ok && q.reveal) it.push.apply(it, q.reveal); if (ok && q.kind === 'type') it.push(q.audio[0]); say(it); } }, ok ? 900 : 1200);
  }
  function pickPraise() { return ['fb_ok1', 'fb_ok2', 'fb_ok3', 'fb_ok4'][Math.floor(Math.random() * 4)]; }
  function nextRun() {
    const R = ST.run; ST.mood = 'idle'; ST.levelUp = null;
    const more = R.gen ? (R.i + 1 < (R.limit || 9999)) : (R.i + 1 < R.qs.length);
    if (!more) { finishRun(false); return; }
    R.i++; R.ans = null; R.ok = null; R.num = ''; R.typed = ''; R.tries = 0; R.flipped = false; render({ top: true }); autoAudio();
  }
  function finishRun(timeUp) {
    const R = ST.run; clearInterval(timerIv); stopAll(); R.done = true; R.timeUp = !!timeUp; const total = R.res.length || 1; const pct = R.score / (R.mode === 'test' ? R.qs.length : total);
    ST.mood = pct >= .6 ? 'happy' : 'idle'; let bonus = 0;
    if (R.mode === 'mission') { bonus = 5; P.mission[today()] = true; markActive(); }
    if (R.mode === 'test') { bonus = Math.round(pct * 10); const parts = {}; R.qs.forEach((q, i) => { const r = R.res[i]; const p = parts[q.part] || (parts[q.part] = { n: 0, ok: 0 }); p.n++; if (r && r.ok) p.ok++; });
      P.tests.push({ ts: Date.now(), unit: R.unit, score: R.score, total: R.qs.length, secs: Math.round((Date.now() - R.start) / 1000), parts }); P.tests = P.tests.slice(-30); markActive(); }
    if (bonus) award(bonus); R.bonus = bonus; Store.save();
    try { pct >= .6 ? H.sfxGood() : null; } catch (e) { }
    render({ top: true }); setTimeout(() => { if (ST.view === 'run') sayHu(R.mode === 'test' ? (pct >= .8 ? 'fb_end_great' : pct >= .5 ? 'fb_end_good' : 'fb_end_try') : 'fb_end'); }, 800);
  }
  // ================= nézetek =================
  function kitty(mood, size, cls) { mood = mood || 'idle'; let s = C.kitty[mood] || ''; const acc = Object.keys(P.worn).map(slot => X.acc.find(a => a.id === P.worn[slot])).filter(Boolean).map(a => a.svg).join('');
    if (acc) s = s.replace(/<\/svg>\s*$/, acc + '</svg>'); return '<div class="kitty kitty-' + mood + ' ' + (cls || '') + '" style="width:' + size + 'px;height:' + size + 'px">' + s + '</div>'; }
  function topbar(title) {
    return '<div class="px-top"><button type="button" class="pbtn l sm" data-a="home" aria-label="Kezdőlap">' + ICO.home + '<span>' + esc(hu('b_home')) + '</span></button>' +
      '<div class="px-title">' + esc(title || '') + '</div><div class="px-stat">' + ICO.star + '<b>' + P.stars + '</b>' + ICO.flame + '<b>' + P.streak.n + '</b></div></div>';
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
  function vHome() {
    const ev = nextEvent(); ST.curEvent = ev; const done = !!P.mission[today()];
    const tiles = [['cards', 't_cards', 'T1'], ['games', 't_games', 'T2'], ];
    if (extraKind()) tiles.push([extraKind() === 'spelling' ? 'spelling' : extraKind() === 'gen' ? 'gen' : 'dictado', extraKind() === 'spelling' ? 't_spelling' : extraKind() === 'gen' ? 't_gen' : 't_dictado', 'T3']);
    if (Plus.speechOK()) tiles.push(['speak', 't_speak', 'T4']); tiles.push(['testmenu', 't_test', 'T5'], ['shop', 't_shop', 'T6'], ['parent', 't_parent', 'T7']);
    return '<div class="px-hero">' + kitty(ST.mood, 120, 'hero') + '<div><h1>' + esc(hu('hello')) + '</h1><div class="px-stat big">' + ICO.star + '<b>' + P.stars + '</b>' + ICO.flame + '<b>' + P.streak.n + '</b><span class="px-sub">' + esc(hu('streak_days')) + '</span></div></div>' +
      '<button type="button" class="pbtn o" data-a="instr" data-k="home_intro">' + ICO.spk + '<span>' + esc(hu('b_listen')) + '</span></button></div>' +
      '<h3 class="px-h">' + esc(hu('today_mission')) + '</h3>' + eventCard(ev) +
      '<button type="button" class="pbtn g xl" data-a="mission">' + (done ? ICO.ok : ICO.next) + '<span>' + esc(hu(done ? 'b_mission_again' : 'b_mission')) + '</span><small>' + esc(hu(ev ? 'mission_sub' : 'mission_sub_review')) + '</small></button>' +
      '<div class="px-tiles">' + tiles.map(t => '<button type="button" class="px-tile ' + t[2] + '" data-a="go" data-v="' + t[0] + '"><span class="ic">' + tileIcon(t[0]) + '</span><span>' + esc(hu(t[1])) + '</span><small>' + esc(S(t[1]).l) + '</small></button>').join('') + '</div>';
  }
  function tileIcon(k) { const m = { cards: '<rect x="10" y="22" width="40" height="30" rx="5" fill="#fff" stroke="#B85A12" stroke-width="3"/><rect x="22" y="12" width="40" height="30" rx="5" fill="#FFF1E4" stroke="#B85A12" stroke-width="3"/>', games: '<rect x="10" y="22" width="44" height="26" rx="13" fill="#6BBF59" stroke="#22603C" stroke-width="3"/><path d="M22 35 h12 M28 29 v12" stroke="#fff" stroke-width="4"/><circle cx="42" cy="32" r="3" fill="#fff"/><circle cx="48" cy="38" r="3" fill="#fff"/>', dictado: '<path d="M14 48 l6 -22 l24 10 z" fill="#F7C948" stroke="#B8860B" stroke-width="3"/><path d="M20 26 L50 12" stroke="#B85A12" stroke-width="5"/><path d="M40 52 h20" stroke="#B85A12" stroke-width="3"/>', spelling: '<path d="M14 48 l6 -22 l24 10 z" fill="#F7C948" stroke="#B8860B" stroke-width="3"/><path d="M20 26 L50 12" stroke="#B85A12" stroke-width="5"/>', gen: '<text x="32" y="46" font-size="40" font-weight="900" text-anchor="middle" fill="#B85A12">×</text>', speak: '<rect x="25" y="8" width="14" height="28" rx="7" fill="#E86A7A" stroke="#8E2A1F" stroke-width="3"/><path d="M16 30 a16 16 0 0 0 32 0 M32 46 v10" stroke="#8E2A1F" stroke-width="3" fill="none"/>', testmenu: '<rect x="14" y="8" width="36" height="46" rx="4" fill="#fff" stroke="#1F4E79" stroke-width="3"/><path d="M20 20 h24 M20 30 h24 M20 40 h14" stroke="#1F4E79" stroke-width="3"/>', shop: '<path d="M32 10 l6 14 15 2 -11 10 3 15 -13 -8 -13 8 3 -15 -11 -10 15 -2z" fill="#F7C948" stroke="#B8860B" stroke-width="3"/>', parent: '<circle cx="32" cy="22" r="10" fill="#9AA7B4"/><path d="M12 54 q0 -20 20 -20 q20 0 20 20z" fill="#9AA7B4"/>' }; return '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">' + (m[k] || '') + '</svg>'; }
  // ---- szókártyák
  function vCards() {
    const units = activeUnits(); const p = poolFor(units); const cnt = [0, 0, 0, 0, 0, 0]; p.forEach(w => cnt[boxOf(w.id)]++);
    const due = p.filter(w => dueNow(w.id)).length;
    let h = topbar(hu('t_cards')) + '<div class="px-row">' + instrBtn('i_cards') + '</div>' + unitChips() +
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
      '<button type="button" class="pbtn o" data-a="cardsay" data-w="' + w.id + '" data-l="hu">' + ICO.spk + '<span>HU</span></button></div></div>' +
      (!R.flip ? '<button type="button" class="pbtn b xl" data-a="cardflip"><span>' + esc(hu('b_flip')) + '</span></button>' :
        '<div class="px-row center"><button type="button" class="pbtn g xl" data-a="cardgrade" data-ok="1">' + ICO.ok + '<span>' + esc(hu('b_knew')) + '</span></button><button type="button" class="pbtn r xl" data-a="cardgrade" data-ok="0">' + ICO.no + '<span>' + esc(hu('b_notyet')) + '</span></button></div>');
  }
  // ---- játékok menü
  function vGames() { return topbar(hu('t_games')) + '<div class="px-row">' + instrBtn('i_games') + '</div>' + unitChips() +
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
    const units = activeUnits(); let p = poolFor(units); if (p.length < 4) p = pool(); const hasIcon = poolFor(units, true).length >= 6; if (hasIcon) p = poolFor(units, true); const ws = (hasIcon ? dedupIcons(p) : pickN(p, 8)).slice(0, Math.min(8, p.length));
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
    return topbar(hu('t_spelling')) + '<div class="px-row">' + instrBtn('i_spelling') + '</div>' +
      '<div class="px-chips">' + ws.slice().reverse().map(w => '<button type="button" class="chip' + (w.id === sel ? ' on' : '') + '" data-a="week" data-id="' + esc(w.id) + '">' + esc(w.title_hu) + (w.test_date ? ' · ' + w.test_date.slice(5).replace('-', '.') + '.' : '') + '</button>').join('') + '</div>' +
      (function () { const w = ws.find(x => x.id === sel); return w ? '<div class="px-card"><div class="px-words">' + w.words.map(x => '<button type="button" class="wchip2" data-a="saywk" data-w="' + esc(x.w) + '">' + esc(x.w) + '<small>' + esc(x.hu) + '</small></button>').join('') + '</div></div>' : ''; })() +
      '<button type="button" class="pbtn g xl" data-a="startspell">' + ICO.next + '<span>' + esc(hu('b_start')) + '</span></button>';
  }
  function startSpelling(weekId, mode) {
    const ws = weeks(); const w = ws.find(x => x.id === (weekId || ST.week)) || weekFor(nextEvent()); if (!w) return;
    ST.week = w.id; const list = shuffle(w.words); startRun({ mode: 'practice', title: hu('t_spelling'), qs: list.map(x => spellQ(x, w.unit)), back: 'spelling', instr: 'i_spell_run' });
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
    return topbar(hu('t_dictado')) + '<div class="px-row">' + instrBtn('i_dictado') + '</div>' +
      '<div class="px-chips">' + us.map(u => '<button type="button" class="chip' + (u === sel ? ' on' : '') + '" data-a="dunit" data-u="' + u + '">' + esc(unitTitle(u).length > 22 ? unitTitle(u).slice(0, 20) + '…' : unitTitle(u)) + '</button>').join('') + '</div>' +
      '<div class="px-card"><div class="px-words">' + ws.slice(0, 40).map(x => '<button type="button" class="wchip2" data-a="saydw" data-u="' + sel + '" data-w="' + esc(norm(x.w)) + '">' + esc(x.w) + '<small>' + esc(x.hu) + '</small></button>').join('') + '</div></div>' +
      '<button type="button" class="pbtn g xl" data-a="startdict">' + ICO.next + '<span>' + esc(hu('b_start')) + '</span><small>' + ws.length + '</small></button>';
  }
  function startDictado(unit) { const u = unit || ST.dunit || dictUnits()[0]; const ws = pickN(dictWords(u), 10); if (!ws.length) return; ST.dunit = u; startRun({ mode: 'practice', title: hu('t_dictado'), qs: ws.map(x => dictQ(x, u)), back: 'dictado', instr: 'i_dictado_run' }); }
  // ---- matek-generátor
  function vGen() {
    const ts = MG.TOPICS; const sel = ST.topic || 'mix';
    return topbar(hu('t_gen')) + '<div class="px-row">' + instrBtn('i_gen') + '</div>' +
      '<div class="px-chips"><button type="button" class="chip' + (sel === 'mix' ? ' on' : '') + '" data-a="topic" data-t="mix">' + esc(hu('c_mix')) + '</button>' + ts.map(t => '<button type="button" class="chip' + (sel === t ? ' on' : '') + '" data-a="topic" data-t="' + t + '">' + esc(MG.TOPIC_NAME[t][0]) + ' · ' + esc(MG.TOPIC_NAME[t][1]) + ' <i>' + '★'.repeat(level(t)) + '</i></button>').join('') + '</div>' +
      '<button type="button" class="pbtn g xl" data-a="startgen">' + ICO.next + '<span>' + esc(hu('b_start')) + '</span></button>';
  }
  function startGen() { const units = ST.genUnits || unitsList(); startRun({ mode: 'practice', title: hu('t_gen'), gen: () => { const t = ST.topic && ST.topic !== 'mix' ? ST.topic : pickTopic(unitsList()); return genQ(t, level(t)); }, qs: [], limit: 9999, endless: true, back: 'gen', instr: 'i_gen_run' }); }
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
    return topbar(hu('t_test')) + '<div class="px-row">' + instrBtn('i_test') + '</div><div class="px-chips">' + H.D.units.map(u => '<button type="button" class="chip big" data-a="starttest" data-u="' + u.id + '">' + u.num + '. ' + esc(u.es) + '<small>' + esc(u.hu) + '</small></button>').join('') + '</div>' +
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
  function startTest(unit) { const qs = buildTest(unit); if (!qs.length) return; startRun({ mode: 'test', title: hu('t_test') + ' · ' + unitTitle(unit), unit, qs, secs: Math.max(300, qs.length * 60), back: 'testmenu', instr: 'i_test_run' }); }
  // ---- futtató nézet
  function vRun() {
    const R = ST.run; if (!R) return ''; if (R.done) return vRunDone();
    const q = curQ(); const n = R.qs.length; const prog = R.endless ? (R.i + 1) + '.' : (R.i + 1) + ' / ' + n;
    let h = topbar(R.title) + '<div class="px-row"><span class="px-prog">' + esc(prog) + '</span>' + (R.mode === 'test' ? '<span class="px-timer" id="px-timer">' + (function () { const left = Math.max(0, Math.round((R.end - Date.now()) / 1000)); return Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'); })() + '</span>' : '') +
      (q.audio || q.task || q.items ? '<button type="button" class="pbtn o sm" data-a="qsay">' + ICO.spk + '<span>' + esc(hu('b_again_listen')) + '</span></button>' : '') + (R.instr && R.mode !== 'test' ? instrBtn(R.instr) : '') + '</div>';
    const showFb = R.ans !== null && R.mode !== 'test'; const answered = showFb;
    h += '<div class="px-q">' + (R.mode !== 'test' || true ? '<div class="px-kit">' + kitty(showFb ? (R.ok ? 'happy' : 'sad') : (R.ok === 'retry' ? 'sad' : 'idle'), 96) + '</div>' : '') + '<div class="px-qb">';
    if (q.prompt) h += '<div class="px-prompt">' + bi(q.prompt) + '</div>';
    if (q.big) h += '<div class="px-bigq' + (q.part === 'math' ? ' math' : '') + '">' + esc(q.big) + '</div>'; if (q.small) h += '<div class="px-smallq">' + esc(q.small) + '</div>';
    if (q.task && q.task.vis) h += visHtml(q.task.vis, q.task);
    h += '</div></div>';
    if (q.kind === 'choice') h += '<div class="px-opts n' + q.options.length + '">' + q.options.map((o, i) => { let cls = 'opt big'; if (answered) { if (String(o.v) === String(q.answer)) cls += ' correct'; else if (String(o.v) === String(R.ans)) cls += ' wrong'; else cls += ' dim'; }
      return '<button type="button" class="' + cls + '" data-a="pick" data-i="' + i + '">' + (o.icon ? '<span class="oi">' + o.icon + '</span>' : '') + '<span>' + esc(o.label) + '</span>' + (o.es ? '<small>' + esc(o.es) + ' · ' + esc(o.hu) + '</small>' : '') + '</button>'; }).join('') + '</div>';
    else if (q.kind === 'type') h += '<div class="px-type"><input id="px-input" class="px-input" type="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" value="' + esc(R.typed) + '" ' + (answered ? 'disabled' : '') + ' placeholder="' + esc(hu('type_here')) + '" aria-label="' + esc(hu('type_here')) + '"><button type="button" class="pbtn g" data-a="check"' + (answered ? ' disabled' : '') + '>' + ICO.ok + '<span>' + esc(hu('b_check')) + '</span></button></div>' + (C.lang === 'es' && !answered ? '<div class="px-chars">' + ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü'].map(c => '<button type="button" class="chip" data-a="ch" data-c="' + c + '">' + c + '</button>').join('') + '</div>' : '') + (R.ok === 'retry' ? '<div class="px-fb bad">' + esc(hu('fb_retry')) + '</div>' : '');
    else if (q.kind === 'num') h += numpadHtml(R, answered);
    else if (q.kind === 'line') h += lineHtml(R, q, answered);
    if (showFb) {
      const lowOk = String(R.ans == null ? '' : R.ans).trim().toLowerCase(); const accent = q.accent && R.ok && q.kind === 'type' && lowOk !== q.answer.toLowerCase() && !(q.alts || []).some(a => a.toLowerCase() === lowOk);
      const hint = ((!R.ok && q.kind === 'type') || accent) ? (accent ? '<span class="px-exp">' + esc(hu('accent_note')) + '</span> ' : '') + '<b class="px-answer">' + esc(q.answer) + '</b>' : '';
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
  function vFlashRun() { const R = ST.run, q = curQ(); const w = q.w; return topbar(R.title) + '<div class="px-prog">' + (R.i + 1) + ' / ' + R.qs.length + '</div><div class="px-flash' + (R.flipped ? ' flip' : '') + '">' + (w.icon ? '<div class="px-ico">' + w.icon + '</div>' : '') + '<div class="px-fw">' + esc(w.es) + '</div>' + (R.flipped ? '<div class="px-fh">' + esc(w.hu) + '</div>' : '') + '<div class="px-row center"><button type="button" class="pbtn o" data-a="cardsay" data-w="' + w.id + '" data-l="' + C.lang + '">' + ICO.spk + '<span>' + esc(C.lang.toUpperCase()) + '</span></button><button type="button" class="pbtn o" data-a="cardsay" data-w="' + w.id + '" data-l="hu">' + ICO.spk + '<span>HU</span></button></div></div>' +
    (!R.flipped ? '<button type="button" class="pbtn b xl" data-a="flipm"><span>' + esc(hu('b_flip')) + '</span></button>' : '<div class="px-row center"><button type="button" class="pbtn g xl" data-a="gradem" data-ok="1">' + ICO.ok + '<span>' + esc(hu('b_knew')) + '</span></button><button type="button" class="pbtn r xl" data-a="gradem" data-ok="0">' + ICO.no + '<span>' + esc(hu('b_notyet')) + '</span></button></div>'); }
  function vRunDone() {
    const R = ST.run; const n = R.mode === 'test' ? R.qs.length : R.res.length; const pct = n ? R.score / n : 0;
    let h = topbar(R.title) + '<div class="px-card center">' + kitty(pct >= .6 ? 'happy' : 'idle', 130) + '<h2>' + esc(hu(R.mode === 'test' ? 'test_done' : 'run_done')) + '</h2><p class="px-big">' + R.score + ' / ' + n + '</p>' + (R.bonus ? '<p class="px-note">+' + R.bonus + ' ' + ICO.star + '</p>' : '') + (R.timeUp ? '<p class="px-note">' + esc(hu('time_up')) + '</p>' : '') + '</div>';
    if (R.mode === 'test') h += evalHtml(R);
    h += '<div class="px-row center"><button type="button" class="pbtn g" data-a="rerun">' + esc(hu('b_again')) + '</button><button type="button" class="pbtn l" data-a="home">' + esc(hu('b_home')) + '</button></div>';
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
    return topbar('Szülő · Padres · Parent') + '<div class="px-card"><h3>Gyakorlás az elmúlt 14 napban</h3><div class="px-bars">' + bars + '</div><p class="px-note">Összesen: <b>' + Math.ceil(tot.sec / 60) + ' perc</b> · <b>' + tot.items + '</b> feladat, ebből <b>' + tot.ok + '</b> jó (' + (tot.items ? Math.round(tot.ok / tot.items * 100) : 0) + '%) · napi sorozat: <b>' + P.streak.n + '</b> (rekord: ' + P.streak.best + ') · csillagok: <b>' + P.stars + '</b></p></div>' +
      '<div class="px-card"><h3>Leggyakrabban hibázott szavak / feladatok</h3>' + (miss.length ? '<table class="px-tab"><tr><th>Tétel</th><th>Jelentés / megoldás</th><th>Hiba</th><th>Lecke</th></tr>' + miss.map(m => '<tr><td><b>' + esc(m.label) + '</b><br><small>' + esc(missType(m.type)) + '</small></td><td>' + esc(m.hu) + '</td><td><b>' + m.n + '×</b></td><td>' + esc(m.unit ? unitTitle(m.unit) : '') + '</td></tr>').join('') + '</table>' : '<p>Még nincs hibás tétel.</p>') + '</div>' +
      (gens.length ? '<div class="px-card"><h3>Matek-generátor szintek</h3><table class="px-tab"><tr><th>Téma</th><th>Szint</th><th>Jó / összes</th></tr>' + gens.map(x => '<tr><td>' + esc(MG.TOPIC_NAME[x.t][1]) + '</td><td>' + '★'.repeat(x.g.lvl) + '</td><td>' + x.g.ok + ' / ' + x.g.n + '</td></tr>').join('') + '</table></div>' : '') +
      '<div class="px-card"><h3>Utolsó próbadolgozatok</h3>' + (P.tests.length ? '<table class="px-tab"><tr><th>Dátum</th><th>Fejezet</th><th>Eredmény</th><th>Idő</th><th>Részletek</th></tr>' + P.tests.slice(-6).reverse().map(t => '<tr><td>' + new Date(t.ts).toLocaleDateString('hu-HU') + '</td><td>' + esc(unitTitle(t.unit)) + '</td><td><b>' + t.score + ' / ' + t.total + '</b></td><td>' + Math.floor(t.secs / 60) + ':' + String(t.secs % 60).padStart(2, '0') + '</td><td>' + Object.keys(t.parts || {}).map(k => esc(hu('part_' + k)) + ' ' + t.parts[k].ok + '/' + t.parts[k].n).join(', ') + '</td></tr>').join('') + '</table>' : '<p>Még nem volt próbadolgozat.</p>') + '</div>' +
      '<p class="px-note">Mentés helye: <b>' + esc(Store.mode) + '</b>. Ha Martin több eszközön gyakorol, az adatok nincsenek összefésülve (a legutóbb mentett példány győz).</p>';
  }
  function missType(t) { return { w: 'szó', sp: 'spelling', dc: 'dictado', q: 'kvíz', pr: 'kiejtés' }[t] || (t.indexOf('g:') === 0 ? 'matek: ' + (MG.TOPIC_NAME[t.slice(2)] || ['', ''])[1] : t); }
  // ================= render + események =================
  function html() {
    switch (ST.view) {
      case 'home': return vHome(); case 'cards': return vCards(); case 'cardrun': return vCardRun(); case 'games': return vGames(); case 'memory': return vMemory(); case 'drag': return vDrag();
      case 'spelling': return vSpelling(); case 'dictado': return vDictado(); case 'gen': return vGen(); case 'speak': return vSpeak(); case 'testmenu': return vTestMenu(); case 'run': return vRun(); case 'shop': return vShop(); case 'parent': return vParent();
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
  function go(v, extra) { stopAll(); clearInterval(timerIv); ST.view = v; ST.mood = 'idle'; Object.assign(ST, extra || {}); render({ top: true }); const ins = { cards: 'i_cards', games: 'i_games', spelling: 'i_spelling', dictado: 'i_dictado', gen: 'i_gen', speak: 'i_speak', testmenu: 'i_test', shop: 'i_shop', home: null }[v]; if (v === 'speak') nextSpeak(); else if (ins) sayK(ins); }
  function act(a, d, node) {
    touch();
    switch (a) {
      case 'home': go('home'); break;
      case 'go': go(d.v); break;
      case 'instr': sayK(d.k); break;
      case 'sayev': { const ev = events().find(e => e.id === d.id) || ST.curEvent; if (ev) { sayCountdown(ev); } break; }
      case 'gounit': stopAll(); H.goUnit(d.u); break;
      case 'openc': stopAll(); H.openConcept(d.u, d.c); break;
      case 'unit': P.unit = d.u; Store.save(); render(); break;
      case 'mission': startMission(); break;
      case 'startcards': ST.cards = { q: pickCards(activeUnits(), 10), i: 0, flip: false, ok: 0 }; ST.view = 'cardrun'; render({ top: true }); if (ST.cards.q[0]) say(wordItems(ST.cards.q[0])); break;
      case 'cardflip': { const R = ST.cards; R.flip = true; render(); const w = R.q[R.i]; say([{ l: 'hu', k: w.id, t: w.hu }]); break; }
      case 'cardgrade': { const R = ST.cards; const w = R.q[R.i]; const ok = d.ok === '1'; gradeCard(w.id, ok); record({ type: 'w', id: w.id, label: w.es, hu: w.hu, unit: w.unit }, ok); if (ok) { R.ok++; award(1); } R.i++; R.flip = false; ST.mood = ok ? 'happy' : 'idle'; if (R.i >= R.q.length) { award(2); markActive(); } render({ top: true }); if (R.q[R.i]) say(wordItems(R.q[R.i])); else sayHu('fb_end'); break; }
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
      case 'saydw': { const x = dictWords(d.u).find(y => norm(y.w) === d.w); if (x) say([{ l: C.lang, k: x.k, t: x.w }, { l: 'hu', k: x.kh, t: x.hu }]); break; }
      case 'ch': { const inp = el.querySelector('#px-input'); if (inp && !inp.disabled) { inp.value += d.c; inp.focus({ preventScroll: true }); if (ST.run) ST.run.typed = inp.value; } break; }
      case 'sayreview': sayK('review_sub'); break;
      case 'topic': ST.topic = d.t; render(); break;
      case 'startgen': startGen(); break;
      case 'mic': doMic(); break;
      case 'speaknext': nextSpeak(); break;
      case 'starttest': startTest(d.u); break;
      case 'pick': { const q = curQ(); answerRun(q.options[+d.i].v); break; }
      case 'check': { const inp = el.querySelector('#px-input'); const v = inp ? inp.value.trim() : ''; if (!v) return; ST.run.typed = v; answerRun(v); break; }
      case 'np': { const R = ST.run; const k = d.k; if (R.ans !== null && R.mode !== 'test') return; if (k === '⌫') R.num = R.num.slice(0, -1); else if (k === '✓') { if (R.num) answerRun(R.num); return; } else if (R.num.length < 5) R.num += k; render(); break; }
      case 'linego': { const R = ST.run; answerRun(R.lineV == null ? ST.run.qs[R.i].task.p.min : R.lineV); break; }
      case 'next': nextRun(); break;
      case 'finish': finishRun(false); break;
      case 'qsay': { const q = curQ(); if (q.task) sayTask(q.task); else if (q.items) say(q.items); else if (q.audio) say(q.audio); break; }
      case 'rerun': { const R = ST.run; if (R.mission) startMission(); else if (R.mode === 'test') startTest(R.unit); else go(R.back || 'home'); break; }
      case 'flipm': { ST.run.flipped = true; render(); const w = curQ().w; say([{ l: 'hu', k: w.id, t: w.hu }]); break; }
      case 'gradem': { const R = ST.run, q = curQ(); const ok = d.ok === '1'; gradeCard(q.w.id, ok); record({ type: 'w', id: q.w.id, label: q.w.es, hu: q.w.hu, unit: q.w.unit }, ok); R.score += ok ? 1 : 0; R.res.push({ q, ok }); if (ok) award(1); nextRun(); break; }
      case 'buy': { const a2 = X.acc.find(x => x.id === d.id); if (a2 && P.stars - P.spent >= a2.price && P.owned.indexOf(a2.id) < 0) { P.spent += a2.price; P.owned.push(a2.id); P.worn[a2.slot] = a2.id; Store.save(); ST.mood = 'happy'; try { H.sfxGood(); } catch (e) { } render(); sayHu('fb_new_acc'); } break; }
      case 'wear': { const a2 = X.acc.find(x => x.id === d.id); if (P.worn[a2.slot] === a2.id) delete P.worn[a2.slot]; else P.worn[a2.slot] = a2.id; Store.save(); render(); break; }
    }
  }
  // ---- küldetés
  function startMission() {
    const ev = nextEvent() || { units: fallbackUnits(), type: 'test' }; const units = ev.units && ev.units.length ? ev.units : fallbackUnits(); const p = poolFor(units), qs = [];
    pickCards(units, 4).forEach(w => qs.push({ kind: 'flash', part: 'vocab', w, items: wordItems(w), unit: w.unit, page: w.page, rec: { type: 'w', id: w.id, label: w.es, hu: w.hu, unit: w.unit } }));
    if (C.subj === 'en') { const wk = weekFor(ev); if (wk && (ev.type === 'spelling' || !ev.type)) pickN(wk.words, 3).forEach(x => qs.push(spellQ(x, wk.unit))); else pickN(p, 3).forEach(w => qs.push(vocabQ(w, 'hear', p))); }
    else if (C.subj === 'lengua') { const dw = units.flatMap(u => dictWords(u).map(x => ({ x, u }))); pickN(dw, 3).forEach(o => qs.push(dictQ(o.x, o.u))); }
    else if (C.subj === 'mat') { const ts = topicsForUnits(units); for (let i = 0; i < 3; i++) { const t = ts[i % ts.length]; qs.push(genQ(t, level(t))); } }
    else { pickN(p, 3).forEach((w, i) => qs.push(vocabQ(w, ['hear', 'tr', 'see'][i % 3], p))); }
    const quiz = H.D.quiz.filter(q => units.indexOf(q.unit) >= 0); pickN(quiz, 3).forEach(q => qs.push(quizQ(q)));
    startRun({ mode: 'mission', mission: true, title: hu('t_mission'), qs, back: 'home' });
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
  // ================= start =================
  Plus.init = function (cfg) { C = cfg; X = cfg.data; X.i18n = X.i18n || {}; };
  Plus.mount = function (node, host) {
    H = host; if (el === node && P) { render(); return; } el = node; _pool = null;
    if (!P) { P = Object.assign(defP(), Store.readLocal() || {}); Store.mode = Store.readLocal() ? 'ez az eszköz (localStorage)' : 'csak memória'; Store.connect(); }
    if (!el._px) { el._px = 1;
      el.addEventListener('click', e => { if (ST.suppressClick) return; const b = e.target.closest('[data-a]'); if (!b || !el.contains(b)) return; try { act(b.dataset.a, b.dataset, b); } catch (er) { if (root.console) console.error(er); } });
      el.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'px-input') { e.preventDefault(); act('check', {}, e.target); } });
      el.addEventListener('pointerdown', onPointerDown); el.addEventListener('pointermove', onPointerMove, { passive: false }); el.addEventListener('pointerup', onPointerUp); el.addEventListener('pointercancel', onPointerUp);
      el.addEventListener('input', e => { if (e.target.id === 'px-input' && ST.run) ST.run.typed = e.target.value; }); }
    injectCss(); xEnsure(); render();
  };
  Plus.unmount = function () { stopAll(); clearInterval(timerIv); };
  Plus.state = () => ({ ST, P }); Plus.S = S;
  function injectCss() { if (document.getElementById('px-css')) return; const s = document.createElement('style'); s.id = 'px-css'; s.textContent = C.css || ''; document.head.appendChild(s); }
  root.Plus = Plus;
})(typeof window !== 'undefined' ? window : globalThis);
