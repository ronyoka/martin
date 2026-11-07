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
    if (it.kind === 'choice') { q.options = (it.options || []).map((o, i) => ({ v: i, label: o.t, sm: o.hu && o.hu !== o.t ? o.hu : '' })); q.answer = String(it.answer); const o = (it.options || [])[it.answer]; if (o) q.explain = o.t + (o.hu && o.hu !== o.t ? ' – ' + o.hu : '') + (it.answer_hu && it.answer_hu !== o.hu ? ' · ' + it.answer_hu : ''); }
    if (it.kind === 'type') q.explain = (it.answer_hu || '');
    return q;
  }
  function pgQs(p, tid) { const qs = []; p.tasks.forEach(t => { if (tid && t.id !== tid) return; let first = true; t.items.forEach(it => { if (!pgCheckable(it)) return; qs.push(pgQ(p, t, it, first)); first = false; }); }); return qs; }
  function tfQ(p, x, i) { return { kind: 'choice', part: 'page', unit: p.unit, page: String(p.page), rec: { type: 'pgf', id: p.id + ':' + i, label: x.es, hu: x.hu, unit: p.unit }, prompt: 'pg_tf_q', big: x.es, small: x.hu,
    ctx: { pic: '', n: '?', es: hu('pg_tf'), hu: S('pg_tf').l }, audio: pgSay(p.id, 'f', i, x.es, x.hu), answer: x.answer ? '1' : '0', options: [{ v: 1, label: hu('pg_true'), sm: S('pg_true').l }, { v: 0, label: hu('pg_false'), sm: S('pg_false').l }],
    explain: (x.why_es || '') + (x.why_hu ? ' – ' + x.why_hu : ''), reveal: pgSay(p.id, 'y', i, x.why_es || '', x.why_hu || '') }; }
  function pgWordQ(p, w, i, mode, all) { const others = shuffle(all.filter(o => o.w !== w.w)).slice(0, 3); const opts = shuffle([w].concat(others));
    const E = (X.pages && X.pages.emo) || {}; const ic = x => x.pic ? em(x.pic, 44) : null;
    if (mode === 'hear') return { kind: 'choice', part: 'page', unit: p.unit, page: String(p.page), rec: { type: 'pgw', id: p.id + ':' + i, label: w.w, hu: w.hu, unit: p.unit }, prompt: 'q_hear', audio: [{ l: C.lang, k: 'p:w:' + p.id + ':' + i, t: w.w }], hearOnly: true, answer: w.w,
      options: opts.map(o => ({ v: o.w, label: o.w, icon: ic(o), sm: o.hu })), explain: w.w + ' – ' + w.hu };
    return { kind: 'choice', part: 'page', unit: p.unit, page: String(p.page), rec: { type: 'pgw', id: p.id + ':' + i, label: w.w, hu: w.hu, unit: p.unit }, prompt: 'q_meaning', big: w.w, ctx: { pic: w.pic || '', n: '★', es: '', hu: '' }, audio: [{ l: C.lang, k: 'p:w:' + p.id + ':' + i, t: w.w }], answer: w.w,
      options: opts.map(o => ({ v: o.w, label: o.hu, icon: ic(o) })), explain: w.w + ' – ' + w.hu }; }
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
  function pgFinish(R) { const n = R.res.length || 1; const pc = Math.round(R.score / n * 100); if (R.mode === 'page' && !R.tid) { P.pg = P.pg || {}; const old = P.pg[R.pid] || 0; const s0 = starsOf(old), s1 = starsOf(pc); if (pc > old) P.pg[R.pid] = pc; R.lessonPct = pc; R.newStars = Math.max(0, s1 - s0); markActive(); if (s1 >= 2) celebrate(s1 === 3); return R.newStars * 2 + 2; } R.lessonPct = pc; markActive(); if (pc >= 80) celebrate(pc >= 95); return pc >= 80 ? 2 : pc >= 50 ? 1 : 0; }
  function ctxHtml(q) { if (!q.ctx) return ''; const c = q.ctx; const R = ST.run;
    return (c.es ? '<div class="px-ctx"><span class="px-pgn">' + esc(c.n) + '</span><div><b>' + esc(c.es) + '</b><small>' + esc(c.hu) + '</small></div></div>' : '') + (c.crop || '') +
      (c.pic || c.vis ? '<div class="px-ctxpic">' + (c.pic ? em(c.pic, 56) : '') + (c.vis ? visMore(c.vis) : '') + '</div>' : '') +
      (c.help ? (R && R.showHelp ? '<div class="pghelp">' + em('💡', 24) + '<div><b>' + esc(c.help.es) + '</b><small>' + esc(c.help.hu) + '</small></div></div>' : '<button type="button" class="chip" data-a="pgrunhelp">' + em('💡', 20) + ' ' + esc(hu('pg_help')) + '</button>') : ''); }
  const PGCSS = '.px-pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin:10px 0}.px-pg{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;background:#fff;border:2px solid #F2C98F;border-radius:16px;padding:10px;cursor:pointer;font:inherit;color:#3A2A12;min-height:110px}.px-pg .top{display:flex;width:100%;justify-content:space-between;align-items:center}.px-pg b{font-size:22px;color:#B85A12}.px-pg .t{font-weight:800;font-size:14px;line-height:1.2}.px-pg small{color:#6B5A44;font-size:12.5px;line-height:1.2}.px-pg .m{margin-top:auto;font-size:11.5px;color:#22603C}.px-pg .m em{color:#B8860B;font-style:normal;font-weight:800}.px-pg.done{border-color:#6BBF59;background:#F1FAEE}.px-pg:hover{transform:translateY(-2px);box-shadow:0 4px 10px rgba(0,0,0,.08)}' +
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
