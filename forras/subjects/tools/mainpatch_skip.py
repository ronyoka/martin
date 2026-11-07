# usage: mainpatch_skip.py <Main.dc.html|Main.template.html>...  – ⏭ Passz a Main kvízébe (+ mat: Matek-kvíz gomb a Kvíz fülön). Idempotens.
import sys, re
SKIP = '<sc-if value="{{canSkip}}" hint-placeholder-val="{{ false }}"><button class="chip" onClick="{{skipQ}}" style="align-self: flex-start">⏭ Passz · Paso</button></sc-if>'
MQB = '<sc-if value="{{isMat}}" hint-placeholder-val="{{ false }}"><button class="open-btn" onClick="{{goMq}}" style="align-self: flex-start; background: #3B82C4">🔢 Új Matek-kvíz: számokkal, minden témára, passzolható →</button></sc-if>'
for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read(); o = s
    if '{{skipQ}}' not in s:
        out = []; pos = 0
        for m in re.finditer(r'\{\{nextLabel\}\}</button>\s*</sc-if>', s):
            out.append(s[pos:m.end()]); out.append('\n' + SKIP); pos = m.end()
        out.append(s[pos:]); s = ''.join(out)
        assert s.count('{{skipQ}}') >= 1, f
    if '{{goMq}}' not in s:
        a = '<sc-if value="{{isQuiz}}" hint-placeholder-val="{{ false }}">\n  <section style="display: flex; flex-direction: column; gap: 14px">'
        assert a in s, f; s = s.replace(a, a + '\n    ' + MQB, 1)
    if 'skipQ()' not in s:
        s = s.replace("        const answered = st.picked !== null; base.answered = answered;", "        const answered = st.picked !== null; base.answered = answered; base.canSkip = !answered; base.skipQ = () => this.skipQ();", 1)
        s = s.replace("      const order = st.qlist || []; base.total = order.length;", "      const order = st.qlist || []; base.total = order.filter(q => !q._again).length;", 1)
        s = s.replace("        const r = order.length ? st.score / order.length : 0;", "        const r = base.total ? st.score / base.total : 0;", 1)
        s = s.replace("'Semmi baj! Nézd meg a leckéket, és próbáld újra.';", "'Semmi baj! Nézd meg a leckéket, és próbáld újra.'; if (st.skipped) base.endText += ' (Passzolva: ' + st.skipped + ')';", 1)
        s = s.replace("qlist: list, order: list, qi: 0, picked: null, score: 0, done: false, mood: 'idle' });", "qlist: list, order: list, qi: 0, picked: null, score: 0, done: false, mood: 'idle', skipped: 0 });", 1)
        s = s.replace("  next() {\n", """  skipQ() {
    const st = this.state; if (st.picked !== null || st.done) return; this.stopVoice(); clearTimeout(this.fbT);
    const q = st.qlist[st.qi]; const list = st.qlist.slice(); if (!q._again) list.push(Object.assign({}, q, { _again: true }));
    if (st.qi + 1 >= list.length) { this.setState({ qlist: list, order: list, skipped: (st.skipped || 0) + 1, done: true, mood: 'happy', picked: null }); }
    else { this.setState({ qlist: list, order: list, skipped: (st.skipped || 0) + 1, qi: st.qi + 1, picked: null, mood: 'idle' }); this.autoSay(list[st.qi + 1]); }
  }
  next() {
""", 1)
        s = s.replace("isQuiz: false, hasOpen: false,", "isQuiz: false, hasOpen: false, isMat: !!(window.Plus && window.Plus.open) && /subj: 'mat'/.test(String(this.mountPlus)), goMq: () => { try { window.Plus.open('mq'); } catch (e) {} this.setView('plus'); try { window.scrollTo(0, 0); } catch (e) {} },", 1)
        for k in ('skipQ() {', 'base.canSkip', '_again).length', 'skipped: 0 }', 'goMq: () =>'): assert k in s, (f, k)
    if s != o: open(f, 'w', encoding='utf-8').write(s); print('patched', f)
    else: print('unchanged', f)
