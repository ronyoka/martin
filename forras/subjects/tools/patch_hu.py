import sys
p=sys.argv[1]
s=open(p,encoding='utf-8').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(a[:70],s.count(a)); s=s.replace(a,b)
rep("""  function sayTask(t, both) { const mk = l => t.say[l].map(k => ({ l, k, t: '', gap: 30 })); say(both === false ? mk('es') : mk('es').concat(mk('hu'))); }""",
"""  function sayTask(t, both) { const mk = l => t.say[l].map(k => ({ l, k, t: '', gap: 30 })); say(both === false || P.huOff ? mk('es') : mk('es').concat(mk('hu'))); }
  // ---- magyar kapcsoló + idegen nyelvű válasz kimondása (Robert, 2026-11-20)
  function huF(items) { if (!P.huOff || !items) return items; const f = items.filter(x => x.l !== 'hu'); return f.length ? f : items; }
  function biQ(k) { const s = S(k); return P.huOff && s.l ? '<span class="lg">' + esc(s.l) + '</span>' : bi(k); }
  function numSay(v) { const t = String(v == null ? '' : v).trim(); if (!/^\\d{1,4}$/.test(t)) return null; const n = +t; if (C.lang === 'es' && MG && MG.numKeys) return MG.numKeys(n, 'es').map(k => ({ l: 'es', k, t: '', gap: 20 })); return [{ l: C.lang, k: 'n:' + n, t: String(n) }]; }
  function ansItems(q) { try {
    const fo = a => (a || []).filter(x => x && x.l !== 'hu');
    if (q.kind === 'choice' && q.options) { const o = q.options.find(x => String(x.v) === String(q.answer)); if (o) { const ns = numSay(o.label); if (ns) return ns; const s = fo(optSay(o)); if (s.length) return s; } }
    if (q.mq && q.mq.kind === 'choice') { const o = (q.mq.options || []).find(x => String(x.v) === String(q.mq.answer)); if (o) { const ns = numSay(o.label); if (ns) return ns; const s = fo(optSay(o)); if (s.length) return s; } }
    if (q.kind === 'num' || q.kind === 'line' || q.kind === 'col' || (q.mq && q.mq.kind === 'num')) { const ns = numSay(q.answer); if (ns) return ns; }
    if (q.kind === 'type') { const a = fo(q.audio).slice(0, 1); if (a.length) return a; }
    const r = fo(q.reveal); if (r.length) return r;
    if (q.rec && q.rec.type === 'w') return [{ l: C.lang, k: q.rec.id, t: q.rec.label }];
  } catch (e) { } return []; }""")
rep("""say([sx('i_fix')].concat(q.audio)); return; } if (q.kind === 'flash') { say(q.items.slice(0, 1)); return; } if (q.task) { sayTask(q.task); return; } if (q.audio) say(q.audio); }""",
"""say([sx('i_fix')].concat(huF(q.audio))); return; } if (q.kind === 'flash') { say(q.items.slice(0, 1)); return; } if (q.task) { sayTask(q.task); return; } if (q.audio) say(huF(q.audio)); }""")
rep("""      case 'qsay': { const q = curQ(); if (q.task) sayTask(q.task); else if (q.items) say(q.items); else if (q.audio) say(q.audio); break; }""",
"""      case 'qsay': { const q = curQ(); if (q.task) sayTask(q.task); else if (q.items) say(q.items); else if (q.audio) say(huF(q.audio)); break; }
      case 'hutog': { P.huOff = !P.huOff; Store.save(); render(); break; }""")
rep("""    if (ok && R.auto) { R.autoT = setTimeout(() => { if (ST.view === 'run' && ST.run === R && R.i === i0 && !R.done) nextRun(); }, 850); return; }
    setTimeout(() => { if (ST.view === 'run' && ST.run === R && R.i === i0) { const it = [sx(fb)]; if (!ok && q.reveal) it.push.apply(it, q.reveal); if (ok && q.kind === 'type') it.push(q.audio[0]); say(it); } }, ok ? 900 : 1200);""",
"""    const fa = R.duel ? [] : ansItems(q); const same = () => ST.view === 'run' && ST.run === R && R.i === i0 && !R.done;
    if (ok && R.auto) { if (fa.length) { R.autoT = setTimeout(() => { if (same()) say(fa, () => { if (same()) R.autoT = setTimeout(() => { if (same()) nextRun(); }, 250); }); }, 500); } else R.autoT = setTimeout(() => { if (same()) nextRun(); }, 850); return; }
    setTimeout(() => { if (same()) { const it = [sx(fb)]; if (!ok && q.reveal) it.push.apply(it, huF(q.reveal)); if (ok && q.kind === 'type') it.push(q.audio[0]); fa.forEach(a => { if (!it.some(x => x.l === a.l && x.k === a.k)) it.push(a); }); say(it); } }, ok ? 900 : 1200);""")
rep("""(R.instr && R.mode !== 'test' ? instrBtn(R.instr) : '') + '</div>';
    const showFb""","""(R.instr && R.mode !== 'test' ? instrBtn(R.instr) : '') + '<button type="button" class="pbtn ' + (P.huOff ? 'l' : 'g') + ' sm px-hutog" data-a="hutog" aria-pressed="' + (P.huOff ? 'false' : 'true') + '" title="Magyar felolvasás és magyar szövegek be/ki"><span>Magyarul: ' + (P.huOff ? 'KI' : 'BE') + '</span></button></div>';
    const showFb""")
rep("""    if (q.prompt) h += '<div class="px-prompt">' + bi(q.prompt) + '</div>';""","""    if (q.prompt) h += '<div class="px-prompt">' + biQ(q.prompt) + '</div>';""")
rep("""if (q.small) h += '<div class="px-smallq">' + esc(q.small) + '</div>';""","""if (q.small && !P.huOff) h += '<div class="px-smallq">' + esc(q.small) + '</div>';""")
rep("""(o.es ? '<small>' + esc(o.es) + ' · ' + esc(o.hu) + '</small>' : o.sm ? '<small>' + esc(o.sm) + '</small>' : '')""","""(o.es ? '<small>' + esc(o.es) + (P.huOff ? '' : ' · ' + esc(o.hu)) + '</small>' : o.sm && !(P.huOff && looksHu(o.sm)) ? '<small>' + esc(o.sm) + '</small>' : '')""")
rep("""<div><b>' + esc(c.es) + '</b><small>' + esc(c.hu) + '</small></div></div>'""","""<div><b>' + esc(c.es) + '</b>' + (P.huOff ? '' : '<small>' + esc(c.hu) + '</small>') + '</div></div>'""")
rep("""<div><b>' + esc(c.help.es) + '</b><small>' + esc(c.help.hu) + '</small></div></div>'""","""<div><b>' + esc(c.help.es) + '</b>' + (P.huOff ? '' : '<small>' + esc(c.help.hu) + '</small>') + '</div></div>'""")
open(p,'w',encoding='utf-8').write(s); print('patched',p)
