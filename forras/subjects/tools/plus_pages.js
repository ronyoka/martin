  // ================= KÖNYVOLDALAK (Robert 2026-11-06: oldalanként minden szó és feladat) =================
  // adat: X.pages = {books:[{id,title,title_hu}], pages:[{id,book,page,unit,lesson,title,title_hu,summary_hu,words:[{w,hu}],tasks:[{id,n,text,text_hu,items:[{id,q,q_hu,kind,answer,alts,answer_hu,options}]}]}]}
  // hang: fejezetenként külön sprite (X.pages.audio[unit][lang] = url, X.pages.sprite[lang][kulcs] = [kezdet, hossz, unit]); kulcsok: p:t:/p:th:<pid> cím, p:w:/p:wh:<pid>:<i> szó, p:k:/p:kh:<tid> utasítás, p:q:/p:qh:<iid> alpont
  function pgData() { return (X.pages && X.pages.pages) || []; }
  function pgBooks() { const b = (X.pages && X.pages.books) || []; return b.filter(x => pgData().some(p => p.book === x.id)); }
  function pgFind(id) { return pgData().find(p => p.id === id); }
  function pgCheckable(it) { return it.kind === 'num' || it.kind === 'type' || it.kind === 'choice'; }
  function pgPct(pid) { return ((P.pg || {})[pid]) || 0; }
  function pgStars(pid) { const p = pgPct(pid); return p ? [0, 1, 2].map(i => i < starsOf(p) ? '★' : '☆').join('') : ''; }
  function pgUnits(book) { return unitsList().filter(u => pgData().some(p => p.book === book && p.unit === u)); }
  function pgQ(p, t, it, first) {
    const audio = []; if (first) audio.push({ l: C.lang, k: 'p:k:' + t.id, t: t.text, gap: 250 });
    audio.push({ l: C.lang, k: 'p:q:' + it.id, t: it.q }); if (first) audio.push({ l: 'hu', k: 'p:kh:' + t.id, t: t.text_hu, gap: 250 }); audio.push({ l: 'hu', k: 'p:qh:' + it.id, t: it.q_hu });
    const q = { kind: it.kind, part: 'page', unit: p.unit, page: String(p.page), rec: { type: 'pg', id: it.id, label: it.q, hu: it.q_hu, unit: p.unit }, prompt: null,
      ctx: { n: t.n, es: t.text, hu: t.text_hu, page: p.page, book: p.book }, big: it.q, small: it.q_hu !== it.q ? it.q_hu : '', audio, answer: String(it.answer), alts: it.alts || [],
      explain: it.answer_hu ? it.answer_hu : '', accent: C.lang === 'es' };
    if (it.kind === 'choice') { q.options = (it.options || []).map((o, i) => ({ v: i, label: o.t, sm: o.hu && o.hu !== o.t ? o.hu : '' })); q.answer = String(it.answer); const o = (it.options || [])[it.answer]; if (o) q.explain = o.t + (o.hu && o.hu !== o.t ? ' – ' + o.hu : '') + (it.answer_hu && it.answer_hu !== o.hu ? ' · ' + it.answer_hu : ''); }
    if (it.kind === 'type') q.explain = (it.answer_hu || '');
    return q;
  }
  function pgQs(p, tid) { const qs = []; p.tasks.forEach(t => { if (tid && t.id !== tid) return; let first = true; t.items.forEach(it => { if (!pgCheckable(it)) return; qs.push(pgQ(p, t, it, first)); first = false; }); }); return qs; }
  function startPage(pid, tid) { const p = pgFind(pid); if (!p) return; const qs = pgQs(p, tid); if (!qs.length) { toast(hu('pg_none')); return; } ST.pid = pid;
    startRun({ mode: 'page', title: bookName(p.book) + ' · ' + p.page + '. ' + hu('pg_page'), qs, back: 'page', pid, tid: tid || null, instr: 'i_page_run' }); }
  function bookName(id) { const b = pgBooks().find(x => x.id === id); return b ? b.title_hu : id; }
  function vPages() {
    const books = pgBooks(); if (!books.length) return topbar(hu('t_pages')) + '<div class="px-card">' + esc(hu('pg_empty')) + '</div>';
    const bk = ST.pgbook && books.some(b => b.id === ST.pgbook) ? ST.pgbook : books[0].id; ST.pgbook = bk;
    const us = pgUnits(bk); const au = activeUnits().filter(u => us.indexOf(u) >= 0); const un = ST.pgunit && us.indexOf(ST.pgunit) >= 0 ? ST.pgunit : (au[0] || us[0]); ST.pgunit = un;
    const ps = pgData().filter(p => p.book === bk && p.unit === un).sort((a, b) => a.page - b.page);
    return topbar(hu('t_pages')) + '<div class="px-row">' + instrBtn('i_pages') + '</div>' +
      '<div class="px-chips">' + books.map(b => '<button type="button" class="chip' + (b.id === bk ? ' on' : '') + '" data-a="pgbook" data-b="' + b.id + '">' + esc(b.title_hu) + '</button>').join('') + '</div>' +
      '<div class="px-chips">' + us.map(u => '<button type="button" class="chip' + (u === un ? ' on' : '') + '" data-a="pgunit" data-u="' + u + '">' + esc(unitTitle(u).length > 24 ? unitTitle(u).slice(0, 22) + '…' : unitTitle(u)) + '</button>').join('') + '</div>' +
      '<div class="px-pgrid">' + ps.map(p => { const n = p.tasks.reduce((s, t) => s + t.items.length, 0); const pc = pgPct(p.id);
        return '<button type="button" class="px-pg' + (pc >= 80 ? ' done' : '') + '" data-a="pgopen" data-p="' + p.id + '"><b>' + p.page + '.</b><span class="t">' + esc(p.title) + '</span><small>' + esc(p.title_hu) + '</small><span class="m">' + p.tasks.length + ' ' + esc(hu('pg_tasks')) + ' · ' + n + ' ' + esc(hu('pg_items')) + (pc ? ' · <em>' + pgStars(p.id) + ' ' + pc + '%</em>' : '') + '</span></button>'; }).join('') + '</div>';
  }
  function itemHtml(it, show) {
    const ans = it.kind === 'choice' ? ((it.options || [])[it.answer] || {}) : null;
    const a = it.kind === 'choice' ? (ans.t || '') + (ans.hu && ans.hu !== ans.t ? ' – ' + ans.hu : '') : String(it.answer || '');
    const opts = it.kind === 'choice' ? '<div class="px-pgopts">' + (it.options || []).map(o => '<span>' + esc(o.t) + (o.hu && o.hu !== o.t ? ' <small>' + esc(o.hu) + '</small>' : '') + '</span>').join('') + '</div>' : '';
    return '<li class="px-pgi k-' + it.kind + '"><div class="qq"><button type="button" class="pbtn o xs" data-a="pgsayi" data-i="' + esc(it.id) + '" aria-label="' + esc(hu('b_listen')) + '">' + ICO.spk + '</button><div><b>' + esc(it.q) + '</b>' + (it.q_hu && it.q_hu !== it.q ? '<small>' + esc(it.q_hu) + '</small>' : '') + opts + '</div></div>' +
      (show || it.kind === 'open' && ST.pgsol && ST.pgsol[it.id] ? '<div class="sol"><span>' + esc(hu('pg_solution')) + ':</span> <b>' + esc(a) + '</b>' + (it.answer_hu && it.answer_hu !== a ? '<small>' + esc(it.answer_hu) + '</small>' : '') + '</div>' :
        it.kind === 'open' ? '<button type="button" class="chip" data-a="pgsol" data-i="' + esc(it.id) + '">' + esc(hu('pg_show_sol')) + '</button>' : '') + '</li>';
  }
  function vPage() {
    const p = pgFind(ST.pid); if (!p) return vPages(); const same = pgData().filter(x => x.book === p.book).sort((a, b) => a.page - b.page); const ix = same.indexOf(p);
    const prev = same[ix - 1], next = same[ix + 1]; const show = !!ST.pgall; const nq = pgQs(p).length; const pc = pgPct(p.id);
    const lesson = p.lesson ? '<button type="button" class="pbtn l sm" data-a="openc" data-u="' + p.unit + '" data-c="' + p.lesson + '"><span>' + esc(hu('pg_lesson')) + '</span>' + ICO.next + '</button>' : '';
    let h = topbar(bookName(p.book) + ' · ' + p.page + '. ' + hu('pg_page')) +
      '<div class="px-row"><button type="button" class="pbtn l sm" data-a="go" data-v="pages"><span>← ' + esc(hu('t_pages')) + '</span></button>' + (prev ? '<button type="button" class="pbtn l sm" data-a="pgopen" data-p="' + prev.id + '"><span>← ' + prev.page + '.</span></button>' : '') + (next ? '<button type="button" class="pbtn l sm" data-a="pgopen" data-p="' + next.id + '"><span>' + next.page + '. →</span></button>' : '') + lesson + '</div>' +
      '<div class="px-card px-pghead"><div class="px-row"><button type="button" class="pbtn o" data-a="pgsayt" data-p="' + p.id + '">' + ICO.spk + '</button><div><h2 class="px-evt">' + esc(p.title) + '</h2><p class="px-evh">' + esc(p.title_hu) + '</p></div></div>' +
      (p.summary_hu ? '<p class="px-pgsum">' + esc(p.summary_hu) + '</p>' : '') + (pc ? '<p class="px-note">' + pgStars(p.id) + ' ' + pc + '%</p>' : '') + '</div>';
    if (p.words && p.words.length) h += '<h3 class="px-h">' + esc(hu('pg_words')) + '</h3><div class="px-words">' + p.words.map((w, i) => '<button type="button" class="wchip2" data-a="pgsayw" data-p="' + p.id + '" data-i="' + i + '">' + esc(w.w) + '<small>' + esc(w.hu) + '</small></button>').join('') + '</div>';
    if (nq) h += '<button type="button" class="pbtn g xl" data-a="pgstart" data-p="' + p.id + '">' + ICO.next + '<span>' + esc(hu('pg_solve_all')) + '</span><small>' + nq + '</small></button>';
    h += '<div class="px-row"><h3 class="px-h" style="margin:0">' + esc(hu('pg_tasks_h')) + '</h3><button type="button" class="chip' + (show ? ' on' : '') + '" data-a="pgall">' + esc(hu('pg_parent_sol')) + '</button></div>';
    p.tasks.forEach(t => { const nc = t.items.filter(pgCheckable).length;
      h += '<div class="px-card px-pgtask"><div class="px-row"><span class="px-pgn">' + esc(t.n) + '</span><button type="button" class="pbtn o sm" data-a="pgsayk" data-t="' + esc(t.id) + '">' + ICO.spk + '</button><div class="tt"><b>' + esc(t.text) + '</b><small>' + esc(t.text_hu) + '</small></div></div>' +
        '<ol class="px-pgis">' + t.items.map(it => itemHtml(it, show)).join('') + '</ol>' +
        (nc ? '<button type="button" class="pbtn g" data-a="pgstart" data-p="' + p.id + '" data-t="' + esc(t.id) + '">' + ICO.next + '<span>' + esc(hu('pg_solve_task')) + '</span><small>' + nc + '</small></button>' : '') + '</div>'; });
    return h;
  }
  function pgItem(iid) { for (const p of pgData()) for (const t of p.tasks) for (const it of t.items) if (it.id === iid) return { p, t, it }; return null; }
  function pgAct(a, d) {
    switch (a) {
      case 'pgbook': ST.pgbook = d.b; ST.pgunit = null; render(); return true;
      case 'pgunit': ST.pgunit = d.u; render(); return true;
      case 'pgopen': go('page', { pid: d.p, pgsol: {} }); return true;
      case 'pgall': ST.pgall = !ST.pgall; render(); return true;
      case 'pgsol': ST.pgsol = ST.pgsol || {}; ST.pgsol[d.i] = 1; render(); return true;
      case 'pgstart': startPage(d.p, d.t); return true;
      case 'pgsayt': { const p = pgFind(d.p); if (p) say([{ l: C.lang, k: 'p:t:' + p.id, t: p.title }, { l: 'hu', k: 'p:th:' + p.id, t: p.title_hu }]); return true; }
      case 'pgsayw': { const p = pgFind(d.p); const w = p && p.words[+d.i]; if (w) say([{ l: C.lang, k: 'p:w:' + p.id + ':' + d.i, t: w.w }, { l: 'hu', k: 'p:wh:' + p.id + ':' + d.i, t: w.hu }]); return true; }
      case 'pgsayk': { const o = pgData().flatMap(p => p.tasks).find(t => t.id === d.t); if (o) say([{ l: C.lang, k: 'p:k:' + o.id, t: o.text }, { l: 'hu', k: 'p:kh:' + o.id, t: o.text_hu }]); return true; }
      case 'pgsayi': { const o = pgItem(d.i); if (o) say([{ l: C.lang, k: 'p:q:' + o.it.id, t: o.it.q }, { l: 'hu', k: 'p:qh:' + o.it.id, t: o.it.q_hu }]); return true; }
    }
    return false;
  }
  function pgFinish(R) { const n = R.res.length || 1; const pc = Math.round(R.score / n * 100); if (!R.tid) { P.pg = P.pg || {}; const old = P.pg[R.pid] || 0; const s0 = starsOf(old), s1 = starsOf(pc); if (pc > old) P.pg[R.pid] = pc; R.lessonPct = pc; R.newStars = Math.max(0, s1 - s0); markActive(); if (s1 >= 2) celebrate(s1 === 3); return R.newStars * 2 + 2; } R.lessonPct = pc; markActive(); return pc >= 80 ? 1 : 0; }
  function ctxHtml(q) { if (!q.ctx) return ''; return '<div class="px-ctx"><span class="px-pgn">' + esc(q.ctx.n) + '</span><div><b>' + esc(q.ctx.es) + '</b><small>' + esc(q.ctx.hu) + '</small></div></div>'; }
  const PGCSS = '.px-pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:10px 0}.px-pg{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;background:#fff;border:2px solid #F2C98F;border-radius:14px;padding:10px;cursor:pointer;font:inherit;color:#3A2A12;min-height:96px}.px-pg b{font-size:22px;color:#B85A12}.px-pg .t{font-weight:800;font-size:14px;line-height:1.2}.px-pg small{color:#6B5A44;font-size:12.5px;line-height:1.2}.px-pg .m{margin-top:auto;font-size:11.5px;color:#22603C}.px-pg .m em{color:#B8860B;font-style:normal;font-weight:800}.px-pg.done{border-color:#6BBF59;background:#F1FAEE}' +
    '.px-pghead h2{margin:0}.px-pgsum{margin:8px 0 0;color:#4A3B26;line-height:1.4}.px-pgtask .tt{display:flex;flex-direction:column;flex:1;min-width:0}.px-pgtask .tt small,.px-ctx small{color:#6B5A44;font-size:14px}.px-pgn{display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:32px;padding:0 6px;border-radius:16px;background:#F2891F;color:#fff;font-weight:900;font-size:15px}' +
    '.px-pgis{list-style:none;margin:8px 0;padding:0;display:flex;flex-direction:column;gap:6px}.px-pgi{background:#FFF9EC;border-radius:10px;padding:6px 8px}.px-pgi .qq{display:flex;gap:8px;align-items:flex-start}.px-pgi .qq>div{display:flex;flex-direction:column;min-width:0;overflow-wrap:anywhere}.px-pgi small{color:#6B5A44}.px-pgi .sol{margin-top:4px;color:#8E2A1F;display:flex;flex-direction:column}.px-pgi .sol span{font-size:12px;color:#8E2A1F;font-weight:800}.px-pgopts{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px}.px-pgopts span{background:#fff;border:1px solid #E8D5B0;border-radius:8px;padding:1px 6px;font-size:13px}' +
    '.pbtn.xs{min-width:34px;min-height:34px;padding:4px}.pbtn.xs svg{width:18px;height:18px}.px-ctx{display:flex;gap:8px;align-items:flex-start;background:#FFF1E4;border-radius:12px;padding:8px 10px;margin:6px 0}.px-ctx>div{display:flex;flex-direction:column}.px-pg .t,.px-pg small{overflow-wrap:anywhere}';
  function pgCss() { try { if (document.getElementById('pg-css')) return; const s = document.createElement('style'); s.id = 'pg-css'; s.textContent = PGCSS; document.head.appendChild(s); } catch (e) { } }
  const pgbuf = {}, pgel = {};
  function pgSeg(lang, key) { const sp = X.pages && X.pages.sprite && X.pages.sprite[lang]; return sp ? sp[key] : null; }
  function pgUrl(unit, lang) { const a = X.pages && X.pages.audio && X.pages.audio[unit]; return a ? a[lang] : null; }
  function pgPreload(unit) { [C.lang, 'hu'].forEach(l => { const u = pgUrl(unit, l); const id = unit + ':' + l; if (!u) return;
    if (C.xMode === 'ctx') { try { xctx = (H.ctx && H.ctx()) || xctx || new (root.AudioContext || root.webkitAudioContext)(); } catch (e) { } if (xctx && !pgbuf[id] && !pgbuf['_p' + id]) { pgbuf['_p' + id] = 1; fetch(u).then(r => r.arrayBuffer()).then(ab => xctx.decodeAudioData(ab)).then(b => { pgbuf[id] = b; }).catch(() => { pgbuf['_p' + id] = 0; }); } }
    else if (!pgel[id]) { const a = new Audio(u); a.preload = 'auto'; pgel[id] = a; } }); }
  function pgPlay(lang, key, text, done) {
    const seg = pgSeg(lang, key); const id = seg ? seg[2] + ':' + lang : '';
    if (seg && C.xMode === 'ctx' && xctx && pgbuf[id]) { try { if (xctx.state === 'suspended') xctx.resume(); const s = xctx.createBufferSource(); s.buffer = pgbuf[id]; s.connect(xctx.destination); s.start(0, seg[0], seg[1] + 0.1); xsrc = s; s.onended = () => { if (xsrc === s) xsrc = null; done(); }; return; } catch (e) { } }
    if (seg && C.xMode === 'el') { if (!pgel[id]) pgPreload(seg[2]); const a = pgel[id]; if (a) { const stopAt = seg[0] + seg[1] + 0.1; xcur = a;
      const go2 = () => { try { a.currentTime = seg[0]; a.play().catch(() => { }); } catch (e) { } const tick = () => { if (xcur !== a) return; if (a.currentTime >= stopAt || (a.paused && a.currentTime > seg[0] + 0.3)) { a.pause(); xcur = null; done(); } else xtimer = setTimeout(tick, 50); }; xtimer = setTimeout(tick, 50); };
      if (a.readyState >= 1) go2(); else { a.addEventListener('loadedmetadata', go2, { once: true }); a.load(); } return; } }
    if (seg && C.xMode === 'ctx') pgPreload(seg[2]);
    if (root.speechSynthesis && text) { try { const u = new SpeechSynthesisUtterance(text); u.lang = lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-GB' : 'hu-HU'; u.onend = () => done(); u.onerror = () => done(); root.speechSynthesis.speak(u); return; } catch (e) { } }
    setTimeout(done, 300);
  }
