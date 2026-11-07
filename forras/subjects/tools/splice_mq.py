# plus_mq.js beillesztése a plus.js-be (a KÖNYVOLDALAK blokk elé) + horgok. Idempotens: a meglévő blokkot cseréli.
import re
p = '/home/claude/subjects/tools/plus.js'; s = open(p).read(); blk = open('/home/claude/subjects/tools/plus_mq.js').read()
A = '  // ================= MATEK-KVÍZ'; B = '  // ================= /MATEK-KVÍZ =================\n'
if A in s: i = s.index(A); j = s.index(B) + len(B); s = s[:i] + blk + s[j:]
else: m = '  // ================= KÖNYVOLDALAK'; s = s.replace(m, blk + m, 1)
def rep(old, new, cnt=1):
    global s
    if new in s: return
    assert s.count(old) >= 1, old[:80]
    s = s.replace(old, new, cnt)
rep("    pgCss();\n    switch (ST.view) {", "    pgCss(); mqCss();\n    switch (ST.view) {\n      case 'mq': return vMq();")
rep("touch(); if (pgAct(a, d)) return;", "touch(); if (pgAct(a, d)) return; if (mqAct(a, d)) return;")
rep("case 'np': { const R = ST.run; const k = d.k;", "case 'np': { if (mqNp(d.k)) break; const R = ST.run; const k = d.k;")
rep("const R = ST.run, q = curQ(); if (R.ans !== null && R.mode !== 'test') return; touch();\n    let ok;",
    "const R = ST.run, q = curQ(); if (R.ans !== null && R.mode !== 'test') return; touch(); resp = mqNorm(q, resp); clearTimeout(R.autoT);\n    if (q.orig) { const r0 = R.res.find(r => r.skip && r.q === q.orig && !r.resolved); if (r0) r0.resolved = true; }\n    let ok;")
rep("if (q.topic) genAdapt(q.topic, ok);", "if (q.topic) genAdapt(q.topic, ok); mqTrack(q, ok);")
rep("    const cst = dadTurn ? 0 : comboHit(R, ok);\n", "    const cst = dadTurn ? 0 : comboHit(R, ok); if (ok && !dadTurn) goodFx(R);\n")
rep("if (R.fast) { try { ok ? H.sfxGood() : H.sfxBad(); } catch (e) { } if (cst) award(cst);", "if (R.fast) { try { ok ? H.sfxGood() : H.sfxBad(); } catch (e) { } if (cst) award(cst); if (!ok && q.mq) toast('✘ ' + (q.big || '').replace('?', mqAnsLabel(q)).slice(0, 60));")
rep("    render(); const fb = ok ? pickPraise() : 'fb_bad';\n    setTimeout(() => { if (ST.view === 'run' && ST.run === R) {",
    "    render(); const fb = ok ? pickPraise() : 'fb_bad'; const i0 = R.i;\n    if (ok && R.auto) { R.autoT = setTimeout(() => { if (ST.view === 'run' && ST.run === R && R.i === i0 && !R.done) nextRun(); }, 850); return; }\n    setTimeout(() => { if (ST.view === 'run' && ST.run === R && R.i === i0) {")
rep("    if (!more) { finishRun(false); return; }\n    R.i++; R.ans = null; R.ok = null; R.num = ''; R.typed = ''; R.tries = 0;",
    "    if (!more && runRequeue(R)) more = true;\n    if (!more) { finishRun(false); return; }\n    R.i++; R.ans = null; R.ok = null; R.num = ''; R.typed = ''; R.tries = 0; R.mv = null; R.mf = null; R.ord = null; clearTimeout(R.autoT);")
rep("R.timeUp = !!timeUp; const total = R.res.length || 1;", "R.timeUp = !!timeUp; const total = nAns(R) || 1;")
rep("if (R.mode === 'lesson') { const n = R.res.length || 1;", "if (R.mode === 'lesson') { const n = nAns(R) || 1;")
rep("    if (R.mode === 'page' || R.mode === 'pgame') bonus += pgFinish(R);\n", "    if (R.mode === 'page' || R.mode === 'pgame') bonus += pgFinish(R);\n    if (R.mode === 'mq') bonus += mqFinish(R);\n")
rep("function pgFinish(R) { const n = R.res.length || 1;", "function pgFinish(R) { const n = nAns(R) || 1;")
rep("const R = ST.run; const n = R.mode === 'test' ? R.qs.length : R.res.length; const pct = n ? R.score / n : 0;", "const R = ST.run; const n = R.mode === 'test' ? R.qs.length : nAns(R); const pct = n ? R.score / n : 0;")
rep("    if (R.mode === 'test') h += evalHtml(R);\n", "    h += tallyHtml(R);\n    if (R.mode === 'test') h += evalHtml(R);\n")
rep("case 'rerun': { const R = ST.run; if (R.mission)", "case 'rerun': { const R = ST.run; if (R.mode === 'mq') { startMq(R.mqmode); if (ST.run && ST.run.sw) mqSwStart(); } else if (R.mission)")
# vRun: stopper, okfx, mq vis/input, passz, rossz válasz
rep("'</span>' : '') +\n      (q.audio || q.task || q.items ?", "'</span>' : '') + (R.sw ? '<span class=\"px-timer\" id=\"px-sw\">⏱ ' + mqFmt((Date.now() - R.start) / 1000) + '</span>' : '') +\n      (q.audio || q.task || q.items ?")
rep("h += '<div class=\"px-q\">' + (R.mode", "h += '<div class=\"px-q' + (showFb ? (R.ok ? ' okfx' : ' badfx') : '') + '\">' + (q.again ? '<div class=\"px-fix\">↻ ' + esc(mt('again')) + '</div>' : '') + (R.mode")
rep("    if (q.task && q.task.vis) h += visHtml(q.task.vis, q.task);\n", "    if (q.task && q.task.vis) h += visHtml(q.task.vis, q.task);\n    if (q.mq && q.mq.vis) h += mqVis(q.mq.vis, q);\n")
rep("    else if (q.kind === 'line') h += lineHtml(R, q, answered);\n", "    else if (q.kind === 'line') h += lineHtml(R, q, answered);\n    else if (q.mq) h += mqInput(R, q, answered);\n    if (!showFb && q.kind !== 'flash' && !R.duel) h += skipBtn(R);\n")
rep("const hint = ((!R.ok && q.kind === 'type') || accent) ?", "const hint = (q.mq && !R.ok) ? '<b class=\"px-answer\">' + esc(mqAnsLabel(q)) + '</b>' : ((!R.ok && q.kind === 'type') || accent) ?")
# home csempe, extraKind, ikon
rep("const tiles = pgData().length ? [['pages', 't_pages', 'T5']] : [];", "const tiles = mqOn() ? [['mq', 't_mq', 'T10']] : []; if (pgData().length) tiles.push(['pages', 't_pages', 'T5']);")
rep("C.subj === 'mat' ? 'gen' :", "C.subj === 'mat' ? (root.MQ ? null : 'gen') :")
rep("const m = { pages: '", "const m = { mq: '<rect x=\"8\" y=\"8\" width=\"48\" height=\"48\" rx=\"12\" fill=\"#3B82C4\" stroke=\"#1F4E79\" stroke-width=\"3\"/><text x=\"32\" y=\"30\" font-size=\"20\" font-weight=\"900\" text-anchor=\"middle\" fill=\"#fff\">7×8</text><text x=\"32\" y=\"50\" font-size=\"18\" font-weight=\"900\" text-anchor=\"middle\" fill=\"#F7C948\">=56</text>', pages: '")
# miss / szülő / küldetés
rep("      if (type === 'g') {", "      if (type === 'mq' && root.MQ) { const pr = id.split(':'); return mqMake(pr[0], +pr[1], +pr[2]); }\n      if (type === 'g') {")
rep("function missType(t) { return { w: 'szó',", "function missType(t) { if (t === 'mq') return 'matek-kvíz'; return { w: 'szó',")
rep("'<div class=\"px-card\"><h3>Utolsó próbadolgozatok</h3>'", "mqParent() + '<div class=\"px-card\"><h3>Utolsó próbadolgozatok</h3>'")
rep("    else if (C.subj === 'mat') { const ts = topicsForUnits(units);", "    else if (C.subj === 'mat' && root.MQ) { mqFocus(); const gs = shuffle(units.flatMap(u => root.MQ.byUnit(u))); for (let i = 0; i < 5 && gs.length; i++) { const q = mqMake(gs[i % gs.length], mqS().lvl || 1); if (q) qs.push(q); } }\n    else if (C.subj === 'mat') { const ts = topicsForUnits(units);")
rep("el.addEventListener('keydown', e => {", "try { if (!root.pxMqKey) { root.pxMqKey = 1; document.addEventListener('keydown', mqKey); } } catch (e) { }\n      el.addEventListener('keydown', e => {")
open(p, 'w').write(s); print('ok', len(s))
