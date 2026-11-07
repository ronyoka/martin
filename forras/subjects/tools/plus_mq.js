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
