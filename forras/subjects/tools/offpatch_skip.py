# usage: offpatch_skip.py <subj> <in index.html> <out index.html> – meglévő önálló oldal: bundle csere + ⏭ Passz a Kvízbe (a mkstandalone.py v7 javításaival azonos szöveg)
import sys
subj, src, dst = sys.argv[1:4]; s = open(src, encoding='utf-8').read()
new = open('/home/claude/subjects/mat/out/plus.bundle.js', encoding='utf-8').read().replace('</script', '<\\/script')
END = "root.Plus = Plus;\n})(typeof window !== 'undefined' ? window : globalThis);"
a = s.index('/* Matek feladatgenerátor'); b = s.index(END, a) + len(END); s = s[:a] + new.strip() + s[b:]
def rep(x, y):
    global s
    if y in s: return
    assert x in s, x[:70]; s = s.replace(x, y, 1)
rep("function quizPanel() {\n  const order = st.order || []; let right = '', line = '';\n    if (st.done) { const r = order.length ? st.score / order.length : 0;",
"function skipQ() { if (st.picked !== null || st.done) return; stopVoice(); const q = st.order[st.qi]; if (!q._again) st.order = st.order.concat([Object.assign({}, q, { _again: true })]); st.skipped = (st.skipped || 0) + 1; if (st.qi + 1 >= st.order.length) { st.done = true; st.mood = 'happy'; st.picked = null; } else { st.qi++; st.picked = null; st.mood = 'idle'; autoSay(st.order[st.qi]); } render(); }\nfunction quizPanel() {\n  const order = st.order || []; const tot = order.filter(q => !q._again).length; let right = '', line = '';\n    if (st.done) { const r = tot ? st.score / tot : 0;")
rep("${st.score} / ${order.length} jó válasz</p>", "${st.score} / ${tot} jó válasz${st.skipped ? ' · passz: ' + st.skipped : ''}</p>")
rep("style=\"align-self:flex-start\">${st.qi + 1 >= order.length ? 'Eredmény' : 'Következő kérdés →'}</button>` : '') + `</div>`;",
    "style=\"align-self:flex-start\">${st.qi + 1 >= order.length ? 'Eredmény' : 'Következő kérdés →'}</button>` : `<button class=\"chip\" ${h(skipQ)} style=\"align-self:flex-start\">⏭ Passz · Paso</button>`) + `</div>`;")
rep("st.picked = null; st.score = 0; st.done = false; st.mood = 'idle'; stopVoice(); render(); autoSay(st.order[0]); }", "st.picked = null; st.score = 0; st.done = false; st.skipped = 0; st.mood = 'idle'; stopVoice(); render(); autoSay(st.order[0]); }")
assert s.count('function runSkip(') == 1 and 'function skipQ()' in s
open(dst, 'w', encoding='utf-8').write(s); print('ok', subj, len(s))
