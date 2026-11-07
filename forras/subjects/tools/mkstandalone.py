# usage: mkstandalone.py <subj> <outdir>  -> <outdir>/index.html (+ copies the audio .mp4 files beside it)
# Önálló, offline is futó HTML a Drive-ra; ugyanaz a tartalom, mint a Claude Design oldalon.
import sys, os, json, base64, shutil, re, importlib.util
subj, outdir = sys.argv[1], sys.argv[2]
folder = f'/home/claude/subjects/{subj}'
sys.path.insert(0, '/home/claude/subjects/tools')
CFG = {
 'lengua': dict(TITLE='Lengua 3 – Martin felkészítője', SUBTITLE='Lengua Castellana y Literatura 3 (Edelvives) · spanyol – magyar · 1–9. fejezet', BOOK='Lengua 3 (Edelvives)', LANG='es', LANGNAME='spanyolul', LANGLABEL='Español', LANGCODE='ES', LISTEN='Escuchar en español', VOCAB='Vocabulario', EXAMPLES='Ejemplos', UNITWORD='UNIDAD', LANGVOICE='spanyol: davefx'),
 'mat': dict(TITLE='Matemáticas 3 – Martin felkészítője', SUBTITLE='Matemáticas 3 (Edelvives) · spanyol – magyar · 1–9. fejezet', BOOK='Matemáticas 3 (Edelvives)', LANG='es', LANGNAME='spanyolul', LANGLABEL='Español', LANGCODE='ES', LISTEN='Escuchar en español', VOCAB='Vocabulario', EXAMPLES='Ejemplos', UNITWORD='UNIDAD', LANGVOICE='spanyol: davefx'),
 'cs': dict(TITLE='Ciencias Sociales 3 – Martin felkészítője', SUBTITLE='Ciencias Sociales 3 (Edelvives) · spanyol – magyar · 1–6. fejezet', BOOK='Ciencias Sociales 3 (Edelvives)', LANG='es', LANGNAME='spanyolul', LANGLABEL='Español', LANGCODE='ES', LISTEN='Escuchar en español', VOCAB='Vocabulario', EXAMPLES='Ejemplos', UNITWORD='UNIDAD', LANGVOICE='spanyol: davefx'),
 'ns': dict(TITLE='Natural Science 3 – Martin felkészítője', SUBTITLE='Natural Science 3 (Santillana) · angol – magyar · 1–6. fejezet', BOOK='Natural Science 3 (Santillana)', LANG='en', LANGNAME='angolul', LANGLABEL='English', LANGCODE='EN', LISTEN='Listen in English', VOCAB='Vocabulary', EXAMPLES='Examples', UNITWORD='UNIT', LANGVOICE='angol: alba'),
 'ac': dict(TITLE='Arts and Crafts 3 – Martin felkészítője', SUBTITLE='Arts and Crafts 3 (Santillana) · angol – magyar · órai szavak + 1–3. fejezet', BOOK='Arts and Crafts 3 (Santillana)', LANG='en', LANGNAME='angolul', LANGLABEL='English', LANGCODE='EN', LISTEN='Listen in English', VOCAB='Vocabulary', EXAMPLES='Examples', UNITWORD='UNIT', LANGVOICE='angol: alba'),
 'en': dict(TITLE="English 3 – Kid's Box – Martin felkészítője", SUBTITLE="Kid's Box New Generation 3 (Cambridge) · angol – magyar · Hello + 1–8. fejezet", BOOK="Kid's Box 3 (Cambridge)", LANG='en', LANGNAME='angolul', LANGLABEL='English', LANGCODE='EN', LISTEN='Listen in English', VOCAB='Vocabulary', EXAMPLES='Examples', UNITWORD='UNIT', LANGVOICE='angol: alba'),
}[subj]
L = CFG['LANG']
data = json.load(open(f'{folder}/out/{subj}_data.json'))
blobs = json.load(open(f'{folder}/blobs.json'))
inv = {'/_blob/' + v: k for k, v in blobs.items()}
imgdirs = [f'{folder}/img', '/home/claude/lengua/img']
def datauri(url):
    name = inv.get(url)
    if not name: return url
    for d in imgdirs:
        p = f'{d}/{name}.svg'
        if os.path.exists(p):
            s = open(p, encoding='utf-8').read()
            return 'data:image/svg+xml;base64,' + base64.b64encode(s.encode('utf-8')).decode()
    return url
for u in data['units']:
    u['img'] = datauri(u['img'])
    for c in u['concepts']:
        c['img'] = datauri(c['img'])
        for g in c['gallery']: g['img'] = datauri(g['img'])
os.makedirs(outdir, exist_ok=True)
data['audio'] = {}
for lang in (L, 'hu'):
    src = f'{folder}/out/{subj}_{lang}.mp4'
    if os.path.exists(src):
        shutil.copy(src, f'{outdir}/{subj}_{lang}.mp4'); data['audio'][lang] = f'{subj}_{lang}.mp4'
PLUS = json.load(open(f'{folder}/out/plus_data.json'))
if PLUS.get('pages', {}).get('audio'):  # könyvoldalak hangja: offline a fájl a mappában (<subj>_pg_<unit>_<lang>.mp4)
    for u, m in PLUS['pages']['audio'].items():
        for l in list(m):
            src = f'{folder}/out/pg_{u}_{l}.mp4'; dst = f'{subj}_pg_{u}_{l}.mp4'
            if os.path.exists(src): shutil.copy(src, f'{outdir}/{dst}')
            m[l] = dst
if 'pages' in PLUS:  # könyvlap-képek: csak a privát (Drive) másolatba – PGIMG=1; a nyilvános GitHub-másolatba NEM
    PLUS['pages']['imgs'] = {}
    if os.environ.get('PGIMG') == '1':
        os.makedirs(f'{outdir}/pgimg', exist_ok=True)
        for p in PLUS['pages'].get('pages', []):
            src = f"{folder}/pgimg/{p.get('img', '')}.jpg"
            if p.get('img') and os.path.exists(src):
                shutil.copy(src, f"{outdir}/pgimg/{p['img']}.jpg"); PLUS['pages']['imgs'][p['img']] = f"pgimg/{p['img']}.jpg"
PLUSJS = open(f'{folder}/out/plus.bundle.js', encoding='utf-8').read()
PLUSCSS = open(f'{folder}/out/plus.css', encoding='utf-8').read()
XAUDIO = {}
for lang in (L, 'hu'):
    src = f'{folder}/out/x_{lang}.mp4'
    if os.path.exists(src):
        shutil.copy(src, f'{outdir}/{subj}_x_{lang}.mp4'); XAUDIO[lang] = f'{subj}_x_{lang}.mp4'
kitty = open('/home/claude/subjects/tools/Kitty.dc.html', encoding='utf-8').read()
svgs = re.findall(r'<svg viewBox="0 0 200 200".*?</svg>', kitty, re.S)
KITTY = dict(zip(('idle', 'happy', 'sad'), svgs))
css = re.search(r'<style>(.*?)</style>', open('/home/claude/subjects/tools/Main.template.html', encoding='utf-8').read(), re.S).group(1)
css = css.replace("font-family:'Nunito',system-ui,sans-serif", "font-family:'Segoe UI','Nunito',system-ui,sans-serif").replace("font-family:'Baloo 2','Nunito',sans-serif", "font-family:'Segoe UI Black','Arial Black','Baloo 2',sans-serif")
SPK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"></path><path d="M16 9a4 4 0 0 1 0 6"></path><path d="M18.5 6.5a8 8 0 0 1 0 11"></path></svg>'
html = r'''<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>__CSS__
__PLUSCSS__
.kitty{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.kitty svg{width:100%;height:100%}
input[type=search]{font-size:18px;padding:12px 14px;border-radius:12px;border:2px solid #C9D3DD;font-family:inherit;min-height:48px;box-sizing:border-box;width:100%}
.letter{display:inline-flex;width:40px;height:40px;align-items:center;justify-content:center;border-radius:10px;background:#EAF1FB;font-weight:800;text-decoration:none;color:#1F4E79}
.lhead{background:#1F4E79;color:#fff;font-weight:800;font-size:22px;padding:4px 14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
.wb{background:none;border:none;padding:0 2px;margin:0;font:inherit;color:inherit;text-align:left;cursor:pointer;border-bottom:2px dotted #B85A12;border-radius:4px;line-height:1.3}.wb:hover{background:#FFF1E4}
body{background:#FFF4D6}
.tab{border:3px solid #6BBF59;background:#FFFFFF;color:#22603C;border-radius:999px;font-weight:900}.tab.on{background:#6BBF59;color:#FFFFFF}
.card{border:3px solid #F2D9B8;border-radius:22px;box-shadow:none}
.mini{border-width:3px;border-radius:999px;font-weight:900}.say{border-width:3px;border-radius:999px;font-weight:900}.open-btn{background:#B85A12;border-radius:999px;font-weight:900}
.ltab{min-height:84px;flex:1 1 120px;padding:10px 8px;border-radius:20px;border:3px solid #F2A65A;background:#FFFFFF;font-weight:900;font-size:17px;color:#7A4A12;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;font-family:inherit}
.ltab.on{background:#F2A65A;color:#FFFFFF;border-color:#B85A12}.ltab svg{width:30px;height:30px}
.sent{background:#FFFFFF;border:3px solid #F2D9B8;border-radius:22px;padding:14px 16px;display:flex;flex-direction:column;gap:6px}
.sent .en{font-size:22px;font-weight:900}.sent .huT{font-size:19px;font-weight:800;color:#22603C}
.bub{max-width:88%;border-radius:22px;padding:12px 16px;display:flex;flex-direction:column;gap:6px}
.bubL{background:#FFFFFF;border:3px solid #CFEAF7;border-top-left-radius:6px;align-self:flex-start}
.bubR{background:#E3F4E8;border:3px solid #A9DFBF;border-top-right-radius:6px;align-self:flex-end}
.sent .en{flex:1 1 100%;font-size:19px;font-weight:800}.sent .huT{flex:1 1 auto;font-size:17px;font-weight:700;color:#22603C}.sent .btns{display:flex;gap:6px;margin-left:auto}
.dlg{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-bottom:2px solid #EFE6D6}.dlg:last-child{border-bottom:none}
.ava{flex:0 0 44px;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:17px;color:#fff}
.who{font-size:13px;font-weight:800;color:#4A5562;margin-bottom:2px}
.wchip{background:#FFF7EC;border:2px solid #F2D9B8;border-radius:12px;padding:2px 9px;margin:2px 3px 2px 0;font:inherit;font-size:21px;font-weight:900;cursor:pointer;min-height:40px;color:#2B2B2B}.wchip:hover,.wchip.on{background:#F7C948;border-color:#B85A12}
.wnone{background:none;border:none;padding:0;font:inherit;font-size:21px;font-weight:900;color:#2B2B2B}
.wpop{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:6px 0 2px;padding:8px 12px;background:#FFF1E4;border:2px solid #F2A65A;border-radius:14px;font-size:18px}
.wrap{max-width:1120px;margin:0 auto;padding:20px 16px 48px;box-sizing:border-box;display:flex;flex-direction:column;gap:20px}
</style>
</head>
<body>
<div class="wrap">
<header style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
  <div id="headKitty" style="width:96px;height:96px;flex:0 0 96px"></div>
  <div style="display:flex;flex-direction:column;gap:4px;flex:1 1 320px;min-width:0">
    <h1 style="font-size:38px;color:#1F4E79">__TITLE__</h1>
    <p style="margin:0;font-size:16px;color:#4A5562">__SUBTITLE__</p>
  </div>
</header>
<nav id="tabs" aria-label="Fejezetek" style="display:flex;gap:10px;flex-wrap:wrap"></nav>
<main id="main"></main>
<div id="overlay"></div>
<footer style="font-size:13px;color:#4A5562">Az oldalszámok a __BOOK__ tankönyv nyomtatott oldalszámai (SB = Saberes básicos füzet). Hangok: Piper (__LANGVOICE__, magyar: anna). A szókártyák képei részben az OpenMoji projektből származnak (openmoji.org, CC BY-SA 4.0). Kattints bármelyik szóra vagy mondatra: kimondja, utána a másik nyelven a jelentését is. Offline másolat – az online változat: __ARTIFACT__</footer>
</div>
<script>
__PLUSJS__
</script>
<script>
__LQJS__
</script>
<script>
const D = __DATA__;
const LANG = '__LANG__';
const KITTY = __KITTY__;
const SPK = '__SPK__';
const T = {LANGNAME:'__LANGNAME__', LANGLABEL:'__LANGLABEL__', LANGCODE:'__LANGCODE__', LISTEN:'__LISTEN__', VOCAB:'__VOCAB__', EXAMPLES:'__EXAMPLES__', UNITWORD:'__UNITWORD__'};
const PD = __PLUSDATA__;
const st = { view: 'plus', open: null, q: '', dictUnit: 'all', quizUnit: 'all', qsize: 0, qpool: 0, order: null, qi: 0, picked: null, score: 0, done: false, mood: 'idle', speaking: null, ltab: 'explain', wordOpen: null };
const esc = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// ---- hang: <audio> elemek + sprite ----
const AUD = {}; let cur = null, curTimer = null;
Object.keys(D.audio).forEach(l => { const a = new Audio(D.audio[l]); a.preload = 'auto'; AUD[l] = a; });
let ctx = null;
function ensureCtx() { try { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) {} return ctx; }
function stopVoice() { if (cur) { try { cur.pause(); } catch (e) {} cur = null; } clearTimeout(curTimer); if (window.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} } st.speaking = null; }
function speak(lang, key, text, then) {
  const seg = D.sprite[lang] && D.sprite[lang][key]; const id = lang + ':' + key;
  stopVoice(); const a = AUD[lang];
  if (a && seg) {
    st.speaking = id; render();
    const stopAt = seg[0] + seg[1] + 0.12;
    const go = () => { a.currentTime = seg[0]; a.play().catch(() => {});
      const tick = () => { if (cur !== a) return; if (a.currentTime >= stopAt || a.paused && a.currentTime > seg[0] + 0.3) { a.pause(); cur = null; if (st.speaking === id) { st.speaking = null; if (then) then(); else render(); } } else curTimer = setTimeout(tick, 60); };
      curTimer = setTimeout(tick, 60); };
    cur = a;
    if (a.readyState >= 1) go(); else { a.addEventListener('loadedmetadata', go, { once: true }); a.load(); }
  } else if (window.speechSynthesis && text) {
    const u = new SpeechSynthesisUtterance(text); u.lang = lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-GB' : 'hu-HU';
    u.onend = () => { if (st.speaking === id) { st.speaking = null; if (then) then(); else render(); } };
    st.speaking = id; render(); speechSynthesis.speak(u);
  }
}
function playSeq(items) { stopVoice(); const go = i => { if (i >= items.length) { render(); return; } const it = items[i]; speak(it[0], it[1], it[2], () => go(i + 1)); }; go(0); }
function wkey(w) { return w.toLowerCase().replace(/’/g, "'"); }
function wordChips(text, lineId) { // minden szó külön gomb: kattintva kimondja angolul, majd magyarul, és mutatja a jelentést
  return text.split(/(\s+)/).map(tok => { if (!tok.trim()) return ' '; const m = tok.match(/^([^\p{L}]*)(\p{L}[\p{L}'’-]*)(.*)$/u); if (!m) return esc(tok);
    const k = wkey(m[2]); const hu = D.words[k]; if (!hu) return esc(m[1]) + `<span class="wnone">${esc(m[2])}</span>` + esc(m[3]);
    const on = st.wordOpen && st.wordOpen.line === lineId && st.wordOpen.w === k; const huSay = hu.replace(/\s*\([^)]*\)/g, '').trim() || hu;
    return esc(m[1]) + `<button class="wchip${on ? ' on' : ''}" ${h(() => { st.wordOpen = { line: lineId, w: k, word: m[2], hu: hu }; speakPair(LANG, 'w:' + k, m[2], huSay); render(); })} aria-label="${esc(m[2] + ' – ' + hu)}">${esc(m[2])}</button>` + esc(m[3]); }).join('');
}
function wordPop(lineId) { const w = st.wordOpen; if (!w || w.line !== lineId) return ''; const huSay = w.hu.replace(/\s*\([^)]*\)/g, '').trim() || w.hu;
  return `<div class="wpop"><strong style="font-size:19px">${esc(w.word)}</strong><span>=</span><span style="color:#22603C;font-weight:700">${esc(w.hu)}</span><span style="display:flex;gap:6px;margin-left:auto">${sayBtn(LANG, 'w:' + w.w, w.word, 'mini', T.LANGCODE, 'Szó ' + T.LANGNAME + ': ' + w.word)}${sayBtn('hu', 'w:' + w.w, huSay, 'mini', 'HU', 'Jelentés magyarul: ' + w.hu)}<button class="chip" ${h(() => { st.wordOpen = null; render(); })} aria-label="Bezárás">✕</button></span></div>`; }
const AVACOL = {}; const PAL = ['#1F4E79', '#B85A12', '#22603C', '#7D3C98', '#C0392B', '#1A7F8E', '#8A5A2B', '#D4AC0D'];
function avaCol(name) { if (!AVACOL[name]) AVACOL[name] = PAL[Object.keys(AVACOL).length % PAL.length]; return AVACOL[name]; }
function speakPair(lang, key, a, b) { const other = lang === 'hu' ? LANG : 'hu'; speak(lang, key, a, () => speak(other, key, b)); }
function tone(f, t0, dur, type, vol, f2) { const c = ctx; const o = c.createOscillator(); const g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05); }
function sfxGood() { const c = ensureCtx(); if (!c) return; const t = c.currentTime + 0.02; [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.09, 0.16, 'triangle', 0.25)); for (let i = 0; i < 5; i++) tone(880 + (i % 2) * 220, t + 0.45 + i * 0.08, 0.07, 'sine', 0.18, 1250); tone(700, t + 0.9, 0.35, 'triangle', 0.2, 1100); }
function sfxBad() { const c = ensureCtx(); if (!c) return; const t = c.currentTime + 0.02; tone(620, t, 0.42, 'sawtooth', 0.09, 330); tone(520, t + 0.45, 0.55, 'sawtooth', 0.09, 260); tone(900, t + 1.05, 0.5, 'triangle', 0.12, 420); }
function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = b[i]; b[i] = b[j]; b[j] = x; } return b; }
const allConcepts = () => D.units.flatMap(u => u.concepts);
const H = {};
let hid = 0; function h(fn) { const k = 'h' + (hid++); H[k] = fn; return `onclick="H.${k}()"`; }
function sayBtn(lang, key, text, base, label, aria) {
  const playing = st.speaking === lang + ':' + key;
  const cls = base + (lang === 'hu' ? ' hu' : '') + (playing ? ' playing' : '');
  return `<button class="${cls}" ${h(() => speak(lang, key, text))} aria-label="${esc(aria)}">${base === 'mini' ? SPK.replace(/20/g, '18') : SPK}${label}</button>`;
}
function seqBtn(items, label) { const playing = items.some(it => st.speaking === it[0] + ':' + it[1]); return `<button class="say${playing ? ' playing' : ''}" ${h(() => playing ? (stopVoice(), render()) : playSeq(items))}>${SPK}${playing ? 'Állj ■' : label}</button>`; }
function kitty(mood) { return `<div class="kitty kitty-${mood}">${KITTY[mood]}</div>`; }
let fbT = null;
let autoT = null;
function autoSay(q) { clearTimeout(autoT); if (q && q.auto) autoT = setTimeout(() => speak(q.auto[0], q.auto[1], q.auto[2]), 500); }
function startQuiz(unit, size) { const all = LQ.build(D, LANG, unit); if (size === undefined) size = unit.indexOf('c:') === 0 ? 0 : 50; st.quizUnit = unit; st.qsize = size; st.qpool = all.length; st.order = size ? all.slice(0, size) : all; st.qi = 0; st.picked = null; st.score = 0; st.done = false; st.skipped = 0; st.mood = 'idle'; stopVoice(); render(); autoSay(st.order[0]); }
function quizChipsHtml(lessonOnly) {
  const sc = st.quizUnit; const scU = sc.indexOf('c:') === 0 ? (D.units.find(u => u.concepts.some(c => 'c:' + c.id === sc)) || {}).id : sc;
  const size = [[10, '10'], [20, '20'], [50, '50'], [0, 'Mind (' + st.qpool + ')']].filter(x => x[0] === 0 || x[0] < st.qpool).map(x => `<button class="chip${st.qsize === x[0] ? ' on' : ''}" ${h(() => startQuiz(sc, x[0]))}>${esc(x[1])}</button>`).join('');
  const sizeRow = `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span style="font-weight:800">${lessonOnly ? 'A lecke kvíze – hány kérdés?' : 'Hány kérdés?'}</span>${size}</div>`;
  if (lessonOnly) return sizeRow;
  const uu = D.units.find(u => u.id === scU);
  const les = uu ? `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span style="font-weight:800">Melyik leckéből?</span>` + [[uu.id, 'Az egész fejezet']].concat(uu.concepts.map(c => ['c:' + c.id, c.es])).map(x => `<button class="chip${sc === x[0] ? ' on' : ''}" ${h(() => startQuiz(x[0]))}>${esc(x[1])}</button>`).join('') + '</div>' : '';
  return les + sizeRow;
}
function setView(v) { stopVoice(); st.view = v; st.open = null; if (v === 'quiz' && !st.order) startQuiz(st.quizUnit); else render(); }
function pick(i) { if (st.picked !== null || st.done) return; const q = st.order[st.qi]; const ok = i === q.answer; st.picked = i; st.score += ok ? 1 : 0; st.mood = ok ? 'happy' : 'sad'; if (ok) sfxGood(); else sfxBad(); clearTimeout(fbT); fbT = setTimeout(() => speak('hu', ok ? 'fb:ok' : 'fb:bad'), ok ? 1300 : 1600); render(); }
function next() { stopVoice(); clearTimeout(fbT); if (st.qi + 1 >= st.order.length) { st.done = true; st.mood = 'happy'; st.picked = null; sfxGood(); fbT = setTimeout(() => speak('hu', 'fb:end'), 1300); } else { st.qi++; st.picked = null; st.mood = 'idle'; } render(); if (!st.done) autoSay(st.order[st.qi]); }
function openC(id) { stopVoice(); st.open = id; st.wordOpen = null; st.ltab = 'explain'; render(); }
function move(step) { const all = allConcepts(); const i = all.findIndex(c => c.id === st.open); const n = all[(i + step + all.length) % all.length]; const t = st.ltab; openC(n.id); if (t !== 'quiz') { st.ltab = t; render(); } }
function skipQ() { if (st.picked !== null || st.done) return; stopVoice(); const q = st.order[st.qi]; if (!q._again) st.order = st.order.concat([Object.assign({}, q, { _again: true })]); st.skipped = (st.skipped || 0) + 1; if (st.qi + 1 >= st.order.length) { st.done = true; st.mood = 'happy'; st.picked = null; } else { st.qi++; st.picked = null; st.mood = 'idle'; autoSay(st.order[st.qi]); } render(); }
function quizPanel() {
  const order = st.order || []; const tot = order.filter(q => !q._again).length; let right = '', line = '';
    if (st.done) { const r = tot ? st.score / tot : 0; line = '¡Muy bien, Martín!';
      right = `<div class="card" style="padding:24px;gap:12px;align-items:flex-start"><h2 style="font-size:34px;color:#1F4E79">Vége! · ¡Fin!</h2><p style="margin:0;font-size:22px;font-weight:800">${st.score} / ${tot} jó válasz${st.skipped ? ' · passz: ' + st.skipped : ''}</p><p style="margin:0;font-size:18px">${r >= 0.9 ? 'Szuper! Szinte mindent tudsz. ¡Excelente!' : r >= 0.6 ? 'Ügyes vagy! Nézd át még egyszer a hibás leckéket.' : 'Semmi baj! Nézd meg a leckéket, és próbáld újra.'}</p><button class="open-btn" ${h(() => startQuiz(st.quizUnit))}>Újra játszom</button></div>`;
    } else if (order.length) {
      const q = order[st.qi]; const answered = st.picked !== null; const ok = answered && st.picked === q.answer;
      line = !answered ? 'Gondolkodj, Martin!' : ok ? 'Hihihi! Talált!' : 'Buuu… nem talált.';
      const opts = q.options.map((o, i) => { let cls = 'opt'; if (answered) { if (i === q.answer) cls += ' correct'; else if (i === st.picked) cls += ' wrong'; else cls += ' dim'; } return `<button class="${cls}" ${h(() => pick(i))}>${esc(o)}</button>`; }).join('');
      right = `<div class="card" style="padding:20px;gap:12px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center"><span style="font-weight:800;color:#4A5562">${st.qi + 1}. kérdés / ${order.length}</span><span class="page">könyv ${esc(q.page)}. old.</span></div>
        <h2 style="font-size:30px"><button class="wb" ${h(() => speak(LANG, q.sayEs[0] || 'lq', q.sayEs[1]))}>${esc(q.q_es)}</button></h2><p style="margin:0;font-size:19px;font-weight:700;color:#22603C"><button class="wb" ${h(() => speak('hu', q.sayHu[0] || 'lq', q.sayHu[1]))}>${esc(q.q_hu)}</button></p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">${sayBtn(LANG, q.sayEs[0] || 'lq', q.sayEs[1], 'say', T.LANGLABEL, 'Kérdés ' + T.LANGNAME)}${sayBtn('hu', q.sayHu[0] || 'lq', q.sayHu[1], 'say', 'Magyarul', 'Kérdés magyarul')}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">${opts}</div>` +
        (answered ? `<div style="border-radius:16px;padding:14px 16px;background:#F4F7FB;display:flex;flex-direction:column;gap:6px"><p style="margin:0;font-weight:800;font-size:20px;color:${ok ? '#1D5233' : '#8E2A1F'}">${ok ? 'Ügyes! ¡Muy bien!' : 'Hoppá! A jó válasz: ' + esc(q.options[q.answer])}</p><p style="margin:0;font-size:17px">${esc(q.explain)}</p><p style="margin:0;font-size:14px;color:#4A5562">Nézd meg a könyvben: ${esc(q.page)}. oldal</p></div><button class="open-btn" ${h(next)} style="align-self:flex-start">${st.qi + 1 >= order.length ? 'Eredmény' : 'Következő kérdés →'}</button>` : `<button class="chip" ${h(skipQ)} style="align-self:flex-start">⏭ Passz · Paso</button>`) + `</div>`;
    }
  return { right: right, line: line, order: order };
}
let lastPane = null;
let plusOn = false;
function render() { if (st.view === 'plus' && plusOn) return; renderAll(); }
function renderAll() {
  const wasPlus = plusOn; plusOn = false; if (wasPlus && window.Plus && window.Plus.unmount && st.view !== 'plus') window.Plus.unmount();
  const ovOld = document.querySelector('#overlay .overlay'); const ovTop = ovOld ? ovOld.scrollTop : 0; const winY = window.scrollY;
  for (const k in H) delete H[k]; hid = 0;
  document.getElementById('headKitty').innerHTML = kitty(st.mood);
  const tabDefs = [['plus', 'Mai küldetés']].concat(D.units.map(u => [u.id, u.num + '. ' + u.es])).concat([['dict', 'Szótár A–Z'], ['quiz', 'Kvíz']]);
  document.getElementById('tabs').innerHTML = tabDefs.map(t => `<button class="tab${st.view === t[0] ? ' on' : ''}" ${h(() => setView(t[0]))}>${esc(t[1])}</button>`).join('');
  let m = '';
  const u = D.units.find(x => x.id === st.view);
  if (u) {
    m += `<section style="display:flex;flex-direction:column;gap:20px"><div class="card" style="flex-direction:row;flex-wrap:wrap">
      <img src="${u.img}" alt="${esc(u.es)}" style="flex:1 1 300px;max-width:420px;width:100%;aspect-ratio:320/220;object-fit:cover">
      <div style="flex:999 1 320px;min-width:0;padding:22px;display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span style="font-weight:800;color:#B85A12;font-size:15px;letter-spacing:.04em">${T.UNITWORD} ${u.num} · ${u.num}. FEJEZET</span><span class="page">könyv ${esc(u.pages)}. old.</span></div>
        <h2 style="font-size:40px;color:#1E2A38"><button class="wb" ${h(() => speakPair(LANG, 'ut:' + u.id, u.es, u.hu))}>${esc(u.es)}</button></h2><p style="margin:0;font-size:20px;font-weight:700;color:#22603C"><button class="wb" ${h(() => speakPair('hu', 'ut:' + u.id, u.hu, u.es))}>${esc(u.hu)}</button></p><div style="display:flex;gap:6px;flex-wrap:wrap">${sayBtn(LANG, 'ut:' + u.id, u.es, 'mini', T.LANGCODE, 'Fejezetcím ' + T.LANGNAME)}${sayBtn('hu', 'ut:' + u.id, u.hu, 'mini', 'HU', 'Fejezetcím magyarul')}</div>
        <p style="margin:0;font-size:17px;line-height:1.5">${esc(u.intro_es)}</p><p style="margin:0;font-size:17px;line-height:1.5;color:#22603C">${esc(u.intro_hu)}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">${sayBtn(LANG, 'u:' + u.id, u.intro_es, 'say', T.LANGLABEL, 'Felolvasás ' + T.LANGNAME)}${sayBtn('hu', 'u:' + u.id, u.intro_hu, 'say', 'Magyarul', 'Felolvasás magyarul')}</div>
        <p style="margin:0;font-size:14px;color:#4A5562"><strong>Ismétlés a könyvben:</strong> ${esc(u.review)}</p>${unitLinks(u.id)}</div></div>
      <h3 style="font-size:26px;color:#1F4E79">Leckék és fogalmak</h3><div class="grid">` +
      u.concepts.map(c => `<article class="card"><img src="${c.img}" alt="${esc(c.es)}"><div style="padding:14px 16px 16px;display:flex;flex-direction:column;gap:6px;flex:1">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span style="font-size:13px;font-weight:800;color:#4A5562">${esc(c.kind)}</span><span class="page">${esc(c.pages)}. old.</span></div>
        <h3 style="font-size:22px;color:#1E2A38"><button class="wb" ${h(() => speakPair(LANG, 't:' + c.id, c.es, c.hu))}>${esc(c.es)}</button></h3><p style="margin:0;font-weight:700;color:#22603C"><button class="wb" ${h(() => speakPair('hu', 't:' + c.id, c.hu, c.es))}>${esc(c.hu)}</button></p><div style="display:flex;gap:6px;flex-wrap:wrap">${sayBtn(LANG, 't:' + c.id, c.es, 'mini', T.LANGCODE, 'Cím ' + T.LANGNAME)}${sayBtn('hu', 't:' + c.id, c.hu, 'mini', 'HU', 'Cím magyarul')}</div><div style="flex:1"></div>
        <button class="open-btn" ${h(() => openC(c.id))}>Megnézem</button></div></article>`).join('') + `</div></section>`;
  }
  if (st.view === 'dict') {
    const q = norm(st.q).trim();
    const list = D.glossary.filter(g => (st.dictUnit === 'all' || g.unit === st.dictUnit) && (!q || norm(g.es + ' ' + g.hu).indexOf(q) >= 0));
    const groups = []; let last = null; list.forEach(g => { if (!last || last.letter !== g.letter) { last = { letter: g.letter, items: [] }; groups.push(last); } last.items.push(g); });
    const chips = [['all', 'Mind']].concat(D.units.map(x => [x.id, x.num + '. fejezet'])).map(x => `<button class="chip${st.dictUnit === x[0] ? ' on' : ''}" ${h(() => { st.dictUnit = x[0]; render(); })}>${esc(x[1])}</button>`).join('');
    m += `<section style="display:flex;flex-direction:column;gap:14px"><div class="card" style="padding:18px;gap:12px">
      <h2 style="font-size:30px;color:#1F4E79">Szótár A–Z · ${T.VOCAB}</h2><label for="kereses" style="font-weight:800">Keresés ${T.LANGNAME} vagy magyarul</label>
      <input id="kereses" type="search" value="${esc(st.q)}" oninput="st.q=this.value;renderDict()" placeholder="pl. casa vagy ház">
      <div style="display:flex;gap:8px;flex-wrap:wrap">${chips}</div>
      <nav aria-label="Betűk" style="display:flex;gap:6px;flex-wrap:wrap">${groups.map(g => `<a class="letter" href="#L-${g.letter}">${g.letter}</a>`).join('')}</nav>
      <p style="margin:0;color:#4A5562;font-size:14px">${list.length} szó · ábécérendben (a névelőt – el, la, los, las – nem számítjuk)</p></div>
      <div class="card" id="dictList">${dictRows(groups)}${list.length ? '' : '<p style="margin:0;padding:20px;font-weight:700">Nincs találat. Próbálj másik szót!</p>'}</div></section>`;
  }
  if (st.view === 'quiz') {
    const scU0 = st.quizUnit.indexOf('c:') === 0 ? (D.units.find(u => u.concepts.some(c => 'c:' + c.id === st.quizUnit)) || {}).id : st.quizUnit; const chips = [['all', 'Mind']].concat(D.units.map(x => [x.id, x.num + '. fejezet'])).map(x => `<button class="chip${scU0 === x[0] ? ' on' : ''}" ${h(() => startQuiz(x[0]))}>${esc(x[1])}</button>`).join('');
    const qp = quizPanel(); const right = qp.right, line = qp.line, order = qp.order;
    m += `<section style="display:flex;flex-direction:column;gap:14px">` + ('__SUBJ__' === 'mat' && window.MQ ? `<button class="open-btn" ${h(() => { try { window.Plus.open('mq'); } catch (e) { } setView('plus'); })} style="align-self:flex-start;background:#3B82C4">🔢 Új Matek-kvíz: számokkal, minden témára, passzolható →</button>` : '') + `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span style="font-weight:800">Melyik fejezetből?</span>${chips}</div>${quizChipsHtml(false)}
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start"><div class="card" style="flex:1 1 220px;max-width:300px;padding:16px;align-items:center;gap:8px"><div style="width:200px;height:200px">${kitty(st.mood)}</div><p style="margin:0;font-size:22px;font-weight:800;color:#1F4E79;text-align:center">${line}</p><p style="margin:0;font-weight:800;font-size:18px">Pont: ${st.score} / ${order.length}</p></div>
      <div style="flex:999 1 420px;min-width:0;display:flex;flex-direction:column;gap:14px">${right}</div></div></section>`;
  }
  if (st.view === 'plus') m = '<div id="plusmount"></div>';
  document.getElementById('main').innerHTML = m;
  if (st.view === 'plus') { plusOn = true; window.Plus.mount(document.getElementById('plusmount'), PH); }
  let ov = '';
  if (st.open) {
    const c = allConcepts().find(x => x.id === st.open);
    if (c) {
      const gal = c.gallery && c.gallery.length; const unit = D.units.find(x => x.concepts.some(k => k.id === c.id)); const t = st.ltab;
      const ICON = { explain: 'M4 6h16M4 12h16M4 18h10', dialogue: 'M4 5h16v10H9l-5 4V5z', examples: 'M5 12l4 4L19 6', words: 'M4 4h12l4 4v12H4zM8 12h8M8 16h8', used: 'M4 19V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2zM8 7h6M8 11h6', quiz: 'M9 9a3 3 0 1 1 3 3v2M12 18h.01' };
      const tabs = [['explain', 'Magyarázat'], ['dialogue', 'Párbeszéd'], ['examples', 'Példák'], ['used', 'Szavak a leckéből'], ['words', 'Fejezet szótára'], ['quiz', 'Kvíz']].map(x => `<button class="ltab${t === x[0] ? ' on' : ''}" ${h(() => { stopVoice(); st.ltab = x[0]; st.wordOpen = null; if (x[0] === 'quiz' && (st.quizUnit !== 'c:' + c.id || !st.order)) startQuiz('c:' + c.id); else render(); })}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON[x[0]]}"></path></svg>${x[1]}</button>`).join('');
      let body = '';
      if (t === 'explain') {
        if (c.sentences && c.sentences.length) body = `<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><h3 style="font-size:26px;color:#1F4E79;flex:1 1 200px">Magyarázat mondatonként</h3>${seqBtn(c.sentences.flatMap((x, i) => [[LANG, 's:' + c.id + ':' + i, x.es], ['hu', 's:' + c.id + ':' + i, x.hu]]), 'Mind: ' + T.LANGNAME + ', majd magyarul')}</div>` +
          (gal ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px">${c.gallery.map(g => `<figure style="margin:0;border-radius:14px;overflow:hidden;border:3px solid #F2D9B8;background:#fff"><img src="${g.img}" alt="${esc(g.es)}" style="display:block;width:100%;aspect-ratio:320/220;object-fit:cover"><figcaption style="padding:6px 10px 8px;font-size:14px"><strong>${esc(g.es)}</strong><br><span style="color:#22603C">${esc(g.hu)}</span></figcaption></figure>`).join('')}</div>` : '') +
          `<div style="display:flex;flex-direction:column;gap:10px">${c.sentences.map((x, i) => { const k = 's:' + c.id + ':' + i; return `<div class="sent"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div class="en" style="flex:1 1 260px"><button class="wb" ${h(() => speakPair(LANG, k, x.es, x.hu))}>${esc(x.es)}</button></div>${sayBtn(LANG, k, x.es, 'mini', T.LANGCODE, 'Mondat ' + T.LANGNAME + ': ' + x.es)}</div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div class="huT" style="flex:1 1 260px"><button class="wb" ${h(() => speakPair('hu', k, x.hu, x.es))}>${esc(x.hu)}</button></div>${sayBtn('hu', k, x.hu, 'mini', 'HU', 'Mondat magyarul: ' + x.hu)}</div></div>`; }).join('')}</div>`;
        else body = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px"><div style="background:#EAF1FB;border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;gap:10px"><span style="font-weight:800;color:#1F4E79">${T.LANGLABEL}</span><p style="margin:0;font-size:18px;line-height:1.55">${esc(c.es_text)}</p>${sayBtn(LANG, 'c:' + c.id, c.es_text, 'say', T.LISTEN, 'Felolvasás ' + T.LANGNAME)}</div><div style="background:#E3F4E8;border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;gap:10px"><span style="font-weight:800;color:#22603C">Magyarul</span><p style="margin:0;font-size:18px;line-height:1.55">${esc(c.hu_text)}</p>${sayBtn('hu', 'c:' + c.id, c.hu_text, 'say', 'Meghallgatom magyarul', 'Felolvasás magyarul')}</div></div>`;
      }
      if (t === 'dialogue') {
        const cols = {}; const dl = c.dialogue || [];
        body = dl.length ? `<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><h3 style="font-size:26px;color:#1F4E79;flex:1 1 200px">Párbeszéd · Dialogue</h3>${seqBtn(dl.flatMap((x, i) => [[LANG, 'd:' + c.id + ':' + i, x.es], ['hu', 'd:' + c.id + ':' + i, x.hu]]), 'Lejátszás (' + T.LANGCODE + ' → HU)')}${seqBtn(dl.map((x, i) => [LANG, 'd:' + c.id + ':' + i, x.es]), 'Csak ' + T.LANGNAME)}</div>
          <p style="margin:-6px 0 0;font-size:15px;color:#4A5562">Kattints egy szóra: kimondja ${T.LANGNAME}, majd magyarul, és mutatja a jelentését. A magyar mondatra kattintva az egész sort mondja mindkét nyelven.</p>
          <div style="display:flex;flex-direction:column;gap:10px;background:#CFEAF7;border-radius:26px;padding:16px">${dl.map((x, i) => { const k = 'd:' + c.id + ':' + i; const lid = c.id + ':' + i; if (!(x.who in cols)) cols[x.who] = Object.keys(cols).length; const side = cols[x.who] % 2 ? 'bubR' : 'bubL';
            return `<div class="bub ${side}"><div style="font-size:13px;font-weight:900;color:${avaCol(x.who)}">${esc(x.who)}</div><div style="line-height:1.9">${wordChips(x.es, lid)}</div>${wordPop(lid)}<div style="display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center"><button class="wb" style="color:#22603C;font-weight:800;font-size:18px" ${h(() => speakPair('hu', k, x.hu, x.es))}>${esc(x.hu)}</button><span style="display:flex;gap:6px;margin-left:auto">${sayBtn(LANG, k, x.es, 'mini', T.LANGCODE, 'Mondat ' + T.LANGNAME + ': ' + x.es)}${sayBtn('hu', k, x.hu, 'mini', 'HU', 'Mondat magyarul: ' + x.hu)}</span></div></div>`; }).join('')}</div>` : '<p style="margin:0;font-weight:700">Ehhez a leckéhez még nincs párbeszéd.</p>';
      }
      if (t === 'examples') body = `<h3 style="font-size:26px;color:#1F4E79">Példák · ${T.EXAMPLES}</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px">${c.examples.map((e, i) => { const k = 'e:' + c.id + ':' + i; return `<div class="sent"><div class="en" style="font-size:21px"><button class="wb" ${h(() => speakPair(LANG, k, e.es, e.hu))}>${esc(e.es)}</button></div><div class="huT" style="font-size:18px"><button class="wb" ${h(() => speakPair('hu', k, e.hu, e.es))}>${esc(e.hu)}</button></div><div style="display:flex;gap:6px">${sayBtn(LANG, k, e.es, 'mini', T.LANGCODE, 'Példa ' + T.LANGNAME + ': ' + e.es)}${sayBtn('hu', k, e.hu, 'mini', 'HU', 'Példa magyarul: ' + e.hu)}</div></div>`; }).join('')}</div>`;
      if (t === 'used') { const seen = {}; const used = [];
        const src = [].concat((c.sentences || []).map(x => x.es), (c.dialogue || []).map(x => x.es), (c.examples || []).map(x => x.es), [c.es]);
        src.forEach(txt => String(txt || '').split(/\s+/).forEach(tok => { const m = tok.match(/(\p{L}[\p{L}'’-]*)/u); if (!m) return; const k = wkey(m[1]).replace(/^[-'’]+|[-'’]+$/g, ''); if (D.words[k] && !seen[k]) { seen[k] = 1; used.push(k); } }));
        used.sort((a, b) => a.localeCompare(b, LANG));
        body = `<h3 style="font-size:26px;color:#1F4E79">Szavak a leckéből · ${used.length} szó</h3><p style="margin:-6px 0 0;font-size:15px;color:#4A5562">A magyarázatban, a párbeszédben és a példákban használt szavak ábécérendben. Kattints a szóra: kimondja ${T.LANGNAME}, majd magyarul.</p>` +
          (used.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px">${used.map(k => { const hu = D.words[k]; const huSay = hu.replace(/\s*\([^)]*\)/g, '').trim() || hu; return `<div class="sent" style="flex-direction:row;align-items:center;gap:8px"><div style="flex:1 1 100px;min-width:0"><div class="en" style="font-size:20px"><button class="wb" ${h(() => speakPair(LANG, 'w:' + k, k, huSay))}>${esc(k)}</button></div><div class="huT" style="font-size:16px"><button class="wb" ${h(() => speakPair('hu', 'w:' + k, huSay, k))}>${esc(hu)}</button></div></div>${sayBtn(LANG, 'w:' + k, k, 'mini', T.LANGCODE, 'Szó ' + T.LANGNAME + ': ' + k)}${sayBtn('hu', 'w:' + k, huSay, 'mini', 'HU', 'Jelentés magyarul: ' + hu)}</div>`; }).join('')}</div>` : '<p style="margin:0;font-weight:700">Ehhez a leckéhez még nincs szólista – a fejezet szótárát a „Fejezet szótára” fülön találod.</p>');
      }
      if (t === 'words') { const gl = D.glossary.filter(g => g.unit === unit.id);
        body = `<h3 style="font-size:26px;color:#1F4E79">Fejezet szótára · ${unit.num}. fejezet · ${gl.length} szó</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px">${gl.map(g => `<div class="sent" style="flex-direction:row;align-items:center;gap:10px"><div style="flex:1 1 120px;min-width:0"><div class="en" style="font-size:21px"><button class="wb" ${h(() => speakPair(LANG, 'g:' + g.i, g.es, g.hu))}>${esc(g.es)}</button></div><div class="huT" style="font-size:17px"><button class="wb" ${h(() => speakPair('hu', 'g:' + g.i, g.hu, g.es))}>${esc(g.hu)}</button></div></div>${sayBtn(LANG, 'g:' + g.i, g.es, 'mini', T.LANGCODE, 'Szó ' + T.LANGNAME + ': ' + g.es)}${sayBtn('hu', 'g:' + g.i, g.hu, 'mini', 'HU', 'Szó magyarul: ' + g.hu)}</div>`).join('')}</div>`; }
      if (t === 'quiz') { const qp = quizPanel(); body = quizChipsHtml(true) + `<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start"><div class="card" style="flex:0 1 200px;padding:12px;align-items:center;gap:6px"><div style="width:150px;height:150px">${kitty(st.mood)}</div><p style="margin:0;font-size:20px;font-weight:900;color:#1F4E79;text-align:center">${qp.line}</p><p style="margin:0;font-weight:800">Pont: ${st.score} / ${qp.order.length}</p></div><div style="flex:999 1 360px;min-width:0;display:flex;flex-direction:column;gap:14px">${qp.right}</div></div>`; }
      ov = `<div class="overlay" role="dialog" aria-modal="true" aria-label="${esc(c.es)}"><div class="card" style="width:100%;max-width:900px;margin:auto 0;gap:0;background:#FFF4D6">
        <div style="display:flex;gap:14px;padding:16px 18px;flex-wrap:wrap;align-items:center;background:#FFFFFF;border-bottom:3px solid #F2D9B8"><img src="${c.img}" alt="${esc(c.es)}" style="width:150px;aspect-ratio:320/220;object-fit:cover;border-radius:14px;border:3px solid #F2D9B8">
          <div style="flex:1 1 280px;min-width:0"><span style="font-size:14px;font-weight:800;color:#4A5562">${esc(c.kind)} · <span class="page">könyv ${esc(c.pages)}. old.</span></span><h2 style="font-size:34px;color:#B85A12"><button class="wb" ${h(() => speakPair(LANG, 't:' + c.id, c.es, c.hu))}>${esc(c.es)}</button></h2><p style="margin:2px 0 0;font-size:22px;font-weight:800;color:#22603C"><button class="wb" ${h(() => speakPair('hu', 't:' + c.id, c.hu, c.es))}>${esc(c.hu)}</button> ${sayBtn(LANG, 't:' + c.id, c.es, 'mini', T.LANGCODE, 'Cím ' + T.LANGNAME)} ${sayBtn('hu', 't:' + c.id, c.hu, 'mini', 'HU', 'Cím magyarul')}</p></div>
          <button class="chip" ${h(() => { stopVoice(); st.open = null; render(); })} aria-label="Bezárás">Bezár ✕</button></div>
        <div style="padding:16px 18px;display:flex;flex-direction:column;gap:16px"><div role="tablist" style="display:flex;gap:10px;flex-wrap:wrap">${tabs}</div>${body}
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:space-between"><button class="chip" ${h(() => move(-1))}>← Előző lecke</button><button class="chip" ${h(() => move(1))}>Következő lecke →</button></div></div></div></div>`;
    }
  }
  document.getElementById('overlay').innerHTML = ov;
  document.body.style.overflow = st.open ? 'hidden' : '';
  const pane = st.open ? st.open + '|' + st.ltab : null; const ovNew = document.querySelector('#overlay .overlay');
  if (ovNew) ovNew.scrollTop = (pane === lastPane) ? ovTop : 0; // ugyanazon a lapon kattintva nem ugrik fel
  lastPane = pane; window.scrollTo(0, winY);
}
function dictRows(groups) {
  return groups.map(g => `<div id="L-${g.letter}" class="lhead">${g.letter}</div>` + g.items.map(w => `<div class="row"><div style="flex:1 1 200px;min-width:0"><div><button class="wb" style="font-weight:800;font-size:19px" ${h(() => speakPair(LANG, 'g:' + w.i, w.es, w.hu))}>${esc(w.es)}</button></div><div><button class="wb" style="color:#22603C;font-weight:700" ${h(() => speakPair('hu', 'g:' + w.i, w.hu, w.es))}>${esc(w.hu)}</button></div></div><span class="page">${w.page === 'feladatok' ? 'feladatokban' : esc(w.page) + '. old.'}</span>${sayBtn(LANG, 'g:' + w.i, w.es, 'mini', T.LANGCODE, 'Kiejtés ' + T.LANGNAME + ': ' + w.es)}${sayBtn('hu', 'g:' + w.i, w.hu, 'mini', 'HU', 'Kiejtés magyarul: ' + w.hu)}</div>`).join('')).join('');
}
function renderDict() { // keresés közben csak a lista frissül, hogy a beviteli mező ne veszítse el a fókuszt
  const q = norm(st.q).trim();
  const list = D.glossary.filter(g => (st.dictUnit === 'all' || g.unit === st.dictUnit) && (!q || norm(g.es + ' ' + g.hu).indexOf(q) >= 0));
  const groups = []; let last = null; list.forEach(g => { if (!last || last.letter !== g.letter) { last = { letter: g.letter, items: [] }; groups.push(last); } last.items.push(g); });
  const el = document.getElementById('dictList'); if (el) el.innerHTML = dictRows(groups) + (list.length ? '' : '<p style="margin:0;padding:20px;font-weight:700">Nincs találat. Próbálj másik szót!</p>');
}
function unitLinks(uid) { const ls = window.Plus.linksFor(uid); if (!ls.length) return ''; return '<div class="unit-links"><strong>Felkészítők, megoldott lapok · Materiales:</strong>' + ls.map(l => `<a class="px-link" target="_blank" rel="noopener" href="${esc(l.url)}">${esc(l.hu)}</a>`).join('') + '</div>'; }
const PH = { D, speak: (l, k, t, then) => speak(l, k, t, then), stop: () => stopVoice(), goUnit: u => { st.view = u; st.open = null; renderAll(); window.scrollTo(0, 0); }, openConcept: (u, c) => { st.view = u; st.open = c; st.wordOpen = null; st.ltab = 'explain'; renderAll(); }, sfxGood: () => sfxGood(), sfxBad: () => sfxBad(), ctx: () => null };
window.Plus.init({ subj: '__SUBJ__', lang: LANG, data: PD, xAudio: __XAUDIO__, xMode: 'el', kitty: KITTY, css: '' });
renderAll();
</script>
</body>
</html>'''
ART = {'lengua': 'https://claude.ai/artifact/1tJPrUjBo5DXqLrYogDZuZ', 'mat': 'https://claude.ai/artifact/68g68ADA96YRsRUhLaZxZX', 'cs': 'https://claude.ai/artifact/9reMXnCfG475XKG5ifExp1', 'ns': 'https://claude.ai/artifact/MyZ3rHSonfUrspu9dTCw31', 'ac': 'https://claude.ai/artifact/Uj5fLaZBPZ71p765Kd8ukQ', 'en': 'https://claude.ai/artifact/BvC94WtSPnGc64pvzygwNd'}[subj]
LQJS = open('/home/claude/subjects/tools/lessonquiz.js', encoding='utf-8').read()
out = html.replace('__LQJS__', LQJS.replace('</script', '<\\/script')).replace('__PLUSJS__', PLUSJS.replace('</script', '<\\/script')).replace('__PLUSCSS__', PLUSCSS).replace('__PLUSDATA__', json.dumps(PLUS, ensure_ascii=False).replace('</', '<\\/')).replace('__XAUDIO__', json.dumps(XAUDIO)).replace('__SUBJ__', subj).replace('__CSS__', css).replace('__DATA__', json.dumps(data, ensure_ascii=False).replace('</', '<\\/')).replace('__KITTY__', json.dumps(KITTY).replace('</', '<\\/')).replace('__SPK__', SPK).replace('__ARTIFACT__', ART)
for k, v in CFG.items(): out = out.replace('__' + k + '__', v)
assert '__' not in re.sub(r'data:image[^"]*', '', out).replace('__proto__', ''), [m.start() for m in re.finditer('__', out)][:3]
open(f'{outdir}/index.html', 'w', encoding='utf-8').write(out)
print('written', outdir, len(out) // 1024, 'KB')
