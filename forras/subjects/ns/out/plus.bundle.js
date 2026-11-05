/* Matek feladatgenerátor (spanyol + magyar szöveg és hangkulcsok). UMD: böngésző (window.MathGen) és node (tesztek).
   Minden feladat: {topic, level, kind:'choice'|'num'|'line', text:{es,hu}, say:{es:[kulcsok], hu:[kulcsok]}, options:[{v,label}], answer, explain, vis, p:{nyers paraméterek}}
   A helyes választ a make() számolja; a tests/test_mathgen.js független újraszámolással ellenőrzi. */
(function (root) {
  'use strict';
  const TOPICS = ['mult', 'add', 'factor', 'car', 'place', 'compare', 'line', 'round'];
  const TOPIC_NAME = {
    mult: ['La tabla de multiplicar', 'Szorzótábla'], add: ['Suma repetida', 'Ismételt összeadás'], factor: ['Factor y producto', 'Tényező és szorzat'], car: ['Problemas del coche teledirigido', 'Távirányítós autós feladatok'],
    place: ['UM · C · D · U', 'Helyiérték (UM · C · D · U)'], compare: ['Comparar números', 'Számok összehasonlítása'], line: ['La recta numérica', 'Számegyenes'], round: ['Aproximar', 'Kerekítés']
  };
  const rnd = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  function shuffle(rng, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
  // szám -> hangkulcsok (ezres + százas + 0..99 klipek); a klipeket a tools/mkxaudio.py generálja ugyanezzel a felbontással
  function numKeys(n, lang) {
    const out = []; if (n < 0 || n > 9999) throw new Error('szám tartomány: ' + n);
    const t = Math.floor(n / 1000), h = Math.floor((n % 1000) / 100), r = n % 100;
    if (t) out.push('n:t' + t);
    if (h) { if (lang === 'es' && h === 1 && r) out.push('n:hc'); else out.push('n:h' + h * 100); }
    if (r || (!t && !h)) out.push('n:' + r);
    return out;
  }
  const fmt = n => String(n);
  function uniqueChoices(rng, correct, cands, count) {
    const set = [correct];
    for (const c of shuffle(rng, cands)) { if (set.length >= count) break; if (c >= 0 && !set.includes(c)) set.push(c); }
    let k = 1; while (set.length < count) { const c = correct + k * (rng() < 0.5 ? 1 : -1); if (c >= 0 && !set.includes(c)) set.push(c); k++; if (k > 50) break; }
    return shuffle(rng, set).map(v => ({ v, label: fmt(v) }));
  }
  const T = {};
  // ---- szorzótábla ----
  T.mult = function (L, rng) {
    const tabs = L === 1 ? [1, 2, 5, 10] : L === 2 ? [1, 2, 3, 4, 5, 10] : L === 3 ? [2, 3, 4, 5, 6, 7, 8, 9, 10] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = pick(rng, tabs), b = rnd(rng, L <= 2 ? 1 : 0, 10); const p = a * b;
    const kind = L <= 2 ? 'choice' : 'num';
    const t = { topic: 'mult', level: L, kind, p: { a, b }, answer: p,
      text: { es: '¿Cuánto es ' + a + ' × ' + b + '?', hu: 'Mennyi ' + a + ' × ' + b + '?' },
      say: { es: ['x:m_cuanto_es'].concat(numKeys(a, 'es'), ['x:m_por'], numKeys(b, 'es')), hu: ['x:m_mennyi'].concat(numKeys(a, 'hu'), ['x:m_szor'], numKeys(b, 'hu')) },
      explain: a + ' × ' + b + ' = ' + p, vis: (a * b <= 60 && a <= 10 && b <= 10 && L <= 3) ? { type: 'groups', n: a, size: b } : null };
    if (kind === 'choice') t.options = uniqueChoices(rng, p, [p + a, p - a, p + b, p - b, p + 1, p - 1, p + 10, (a + 1) * b, (a - 1) * b, a + b], 4);
    return t;
  };
  // ---- ismételt összeadás ----
  T.add = function (L, rng) {
    const a = L === 1 ? rnd(rng, 2, 4) : L === 2 ? rnd(rng, 2, 6) : rnd(rng, 2, 10), b = L === 1 ? rnd(rng, 1, 5) : L === 2 ? rnd(rng, 2, 6) : rnd(rng, 2, 10);
    const p = a * b; const kind = L <= 3 ? 'choice' : 'num';
    const terms = []; for (let i = 0; i < a; i++) terms.push(b);
    const say = { es: [], hu: [] };
    ['es', 'hu'].forEach(l => { terms.forEach((x, i) => { if (i) say[l].push(l === 'es' ? 'x:m_mas' : 'x:m_plusz'); say[l].push.apply(say[l], numKeys(x, l)); }); say[l].push(l === 'es' ? 'x:m_en_total' : 'x:m_osszesen'); });
    const t = { topic: 'add', level: L, kind, p: { a, b }, answer: p,
      text: { es: terms.join(' + ') + ' = ?   (' + a + ' veces ' + b + ')', hu: terms.join(' + ') + ' = ?   (' + a + '-szor ' + b + ')' },
      say, explain: terms.join(' + ') + ' = ' + a + ' × ' + b + ' = ' + p, vis: p <= 60 ? { type: 'groups', n: a, size: b } : null };
    if (kind === 'choice') t.options = uniqueChoices(rng, p, [p + b, p - b, a + b, p + 1, p - 1, p + a, (a - 1) * b], 4);
    return t;
  };
  // ---- távirányítós autós szöveges feladatok (Martin kedvence) ----
  T.car = function (L, rng) {
    const kindT = rnd(rng, 0, 2); let a, b, es, hu, say;
    if (kindT === 0) { a = L <= 2 ? rnd(rng, 2, 5) : rnd(rng, 2, 10); b = L <= 2 ? pick(rng, [2, 5, 10]) : rnd(rng, 2, 10);
      es = 'El coche teledirigido de Martín da ' + a + ' vueltas. Cada vuelta mide ' + b + ' metros. ¿Cuántos metros recorre en total?';
      hu = 'Martin távirányítós autója ' + a + ' kört megy. Egy kör ' + b + ' méter. Hány métert megy összesen?';
      say = { es: ['x:m_car1'].concat(numKeys(a, 'es'), ['x:m_car2'], numKeys(b, 'es'), ['x:m_car3']), hu: ['x:m_car1'].concat(numKeys(a, 'hu'), ['x:m_car2'], numKeys(b, 'hu'), ['x:m_car3']) }; }
    else if (kindT === 1) { a = L <= 2 ? rnd(rng, 2, 5) : rnd(rng, 2, 10); b = 4;
      es = 'Martín tiene ' + a + ' coches teledirigidos. Cada coche tiene ' + b + ' ruedas. ¿Cuántas ruedas hay en total?';
      hu = 'Martinnak ' + a + ' távirányítós autója van. Minden autónak ' + b + ' kereke van. Hány kerék van összesen?';
      say = { es: ['x:m_car4'].concat(numKeys(a, 'es'), ['x:m_car5'], numKeys(b, 'es'), ['x:m_car6']), hu: ['x:m_car4'].concat(numKeys(a, 'hu'), ['x:m_car5'], numKeys(b, 'hu'), ['x:m_car6']) }; }
    else { a = L <= 2 ? rnd(rng, 2, 5) : rnd(rng, 2, 9); b = L <= 2 ? pick(rng, [2, 3, 5]) : rnd(rng, 2, 9);
      es = 'En la carrera hay ' + a + ' coches. Cada coche necesita ' + b + ' pilas. ¿Cuántas pilas hacen falta?';
      hu = 'A versenyen ' + a + ' autó indul. Minden autóba ' + b + ' elem kell. Hány elem kell összesen?';
      say = { es: ['x:m_car7'].concat(numKeys(a, 'es'), ['x:m_car8'], numKeys(b, 'es'), ['x:m_car9']), hu: ['x:m_car7'].concat(numKeys(a, 'hu'), ['x:m_car8'], numKeys(b, 'hu'), ['x:m_car9']) }; }
    const p = a * b; const kind = L <= 3 ? 'choice' : 'num';
    const t = { topic: 'car', level: L, kind, p: { a, b, k: kindT }, answer: p, text: { es, hu }, say, explain: a + ' × ' + b + ' = ' + p, vis: p <= 60 ? { type: 'groups', n: a, size: b } : null };
    if (kind === 'choice') t.options = uniqueChoices(rng, p, [p + b, p - b, a + b, p + a, p - a, (a + 1) * b], 4);
    return t;
  };
  // ---- tényező / szorzat ----
  T.factor = function (L, rng) {
    const a = rnd(rng, 2, L <= 2 ? 6 : 10); let b = rnd(rng, 2, L <= 2 ? 6 : 10); if (L <= 2 && b === a) b = a === 6 ? 5 : a + 1; const p = a * b;
    if (L <= 2) { // melyik a szorzat?
      const t = { topic: 'factor', level: L, kind: 'choice', p: { a, b, ask: 'product' }, answer: p,
        text: { es: a + ' × ' + b + ' = ' + p + '.  ¿Cuál es el producto?', hu: a + ' × ' + b + ' = ' + p + '.  Melyik a szorzat?' },
        say: { es: numKeys(a, 'es').concat(['x:m_por'], numKeys(b, 'es'), ['x:m_igual'], numKeys(p, 'es'), ['x:m_cual_producto']), hu: numKeys(a, 'hu').concat(['x:m_szor'], numKeys(b, 'hu'), ['x:m_egyenlo'], numKeys(p, 'hu'), ['x:m_melyik_szorzat']) },
        options: shuffle(rng, [a, b, p]).map(v => ({ v, label: fmt(v) })), explain: 'factor: ' + a + ', ' + b + '  ·  producto: ' + p };
      return t;
    }
    const kind = L === 3 ? 'choice' : 'num';
    const t = { topic: 'factor', level: L, kind, p: { a, b, ask: 'missing' }, answer: b,
      text: { es: a + ' × ?  =  ' + p + '.  ¿Qué número falta?', hu: a + ' × ?  =  ' + p + '.  Melyik szám hiányzik?' },
      say: { es: numKeys(a, 'es').concat(['x:m_por', 'x:m_cuanto', 'x:m_igual'], numKeys(p, 'es'), ['x:m_que_falta']), hu: numKeys(a, 'hu').concat(['x:m_szor', 'x:m_mennyi_q', 'x:m_egyenlo'], numKeys(p, 'hu'), ['x:m_melyik_hianyzik']) },
      explain: a + ' × ' + b + ' = ' + p };
    if (kind === 'choice') t.options = uniqueChoices(rng, b, [b + 1, b - 1, b + 2, p - a, a, b * 2], 4);
    return t;
  };
  // ---- helyiérték ----
  const PLACE = [['U', 'egyes', 'x:m_cuantas_U', 'x:m_hany_egyes'], ['D', 'tízes', 'x:m_cuantas_D', 'x:m_hany_tizes'], ['C', 'százas', 'x:m_cuantas_C', 'x:m_hany_szazas'], ['UM', 'ezres', 'x:m_cuantas_UM', 'x:m_hany_ezres']];
  const PLACE_ES = { U: 'unidades', D: 'decenas', C: 'centenas', UM: 'unidades de millar' };
  T.place = function (L, rng) {
    const digits = L === 1 ? 2 : L === 2 ? 3 : 4;
    let n; do { n = rnd(rng, Math.pow(10, digits - 1), Math.pow(10, digits) - 1); if (L === 4) { const s = String(n).split(''); s[rnd(rng, 1, 3)] = '0'; n = Number(s.join('')); } } while (n < Math.pow(10, digits - 1));
    const ds = String(n).padStart(4, '0').split('').map(Number); // UM C D U
    const val = { UM: ds[0], C: ds[1], D: ds[2], U: ds[3] };
    if (L === 5) { // melyik felbontás helyes?
      const dec = x => { const v = String(x).padStart(4, '0').split('').map(Number); return v[0] + ' UM + ' + v[1] + ' C + ' + v[2] + ' D + ' + v[3] + ' U'; };
      const wrongs = new Set(); let guard = 0;
      while (wrongs.size < 3 && guard++ < 200) { const s = String(n).split(''); const i = rnd(rng, 0, s.length - 2); const j = i + 1; if (s[i] === s[j]) continue; const tmp = s[i]; s[i] = s[j]; s[j] = tmp; const m = Number(s.join('')); if (m !== n && m >= 1000) wrongs.add(m); }
      if (wrongs.size < 3) return T.place(4, rng);
      const opts = shuffle(rng, [n].concat(Array.from(wrongs)));
      return { topic: 'place', level: L, kind: 'choice', p: { n, ask: 'decomp' }, answer: dec(n),
        text: { es: '¿Qué descomposición es ' + n + '?', hu: 'Melyik felbontás a(z) ' + n + '?' },
        say: { es: ['x:m_que_descomp'].concat(numKeys(n, 'es')), hu: ['x:m_melyik_felbontas'].concat(numKeys(n, 'hu')) },
        options: opts.map(m => ({ v: dec(m), label: dec(m) })), explain: n + ' = ' + dec(n) };
    }
    const avail = PLACE.slice(0, digits);
    const pl = pick(rng, avail);
    const ans = val[pl[0]];
    const t = { topic: 'place', level: L, kind: 'choice', p: { n, ask: pl[0] }, answer: ans,
      text: { es: '¿Cuántas ' + PLACE_ES[pl[0]] + ' (' + pl[0] + ') tiene ' + n + '?', hu: 'Hány ' + pl[1] + ' (' + pl[0] + ') van a(z) ' + n + ' számban?' },
      say: { es: [pl[2]].concat(numKeys(n, 'es')), hu: [pl[3]].concat(numKeys(n, 'hu')) },
      vis: { type: 'digits', n: String(n) }, explain: n + ' = ' + dec4(ds) };
    t.options = uniqueChoices(rng, ans, ds.concat([(ans + 1) % 10, (ans + 9) % 10]), 4);
    return t;
  };
  function dec4(ds) { const nm = ['UM', 'C', 'D', 'U']; const parts = []; ds.forEach((d, i) => { if (d || false) parts.push(d + ' ' + nm[i]); }); return parts.join(' + ') || '0'; }
  // ---- összehasonlítás ----
  T.compare = function (L, rng) {
    let a, b;
    if (L === 1) { a = rnd(rng, 10, 99); b = rnd(rng, 10, 99); }
    else if (L === 2) { a = rnd(rng, 100, 999); b = rnd(rng, 100, 999); }
    else if (L === 3) { a = rnd(rng, 1000, 9999); b = rnd(rng, 1000, 9999); }
    else if (L === 4) { const th = rnd(rng, 1, 9) * 1000; a = th + rnd(rng, 0, 999); b = th + rnd(rng, 0, 999); }
    else { const base = rnd(rng, 1000, 9990); a = base; b = rng() < 0.2 ? base : base + rnd(rng, -9, 9) * 10 + rnd(rng, -3, 3); if (b < 1000 || b > 9999) b = base + 10; }
    const ans = a > b ? '>' : a < b ? '<' : '=';
    return { topic: 'compare', level: L, kind: 'choice', p: { a, b }, answer: ans,
      text: { es: a + '  ?  ' + b + '   ¿Qué signo va?', hu: a + '  ?  ' + b + '   Melyik jel kell?' },
      say: { es: ['x:m_signo_entre'].concat(numKeys(a, 'es'), ['x:m_y'], numKeys(b, 'es')), hu: ['x:m_jel_kozott'].concat(numKeys(a, 'hu'), ['x:m_es'], numKeys(b, 'hu'), ['x:m_koze']) },
      options: [{ v: '>', label: '>', es: 'mayor que', hu: 'nagyobb' }, { v: '<', label: '<', es: 'menor que', hu: 'kisebb' }, { v: '=', label: '=', es: 'igual a', hu: 'egyenlő' }],
      explain: a + ' ' + ans + ' ' + b };
  };
  // ---- számegyenes ----
  T.line = function (L, rng) {
    const cfg = { 1: [0, 10, 1], 2: [0, 20, 2], 3: [0, 100, 10], 4: [0, 100, 5], 5: [0, 1000, 100] }[L];
    const [min, max, step] = cfg; const k = rnd(rng, 1, (max - min) / step - 1 || 1); const target = min + k * step;
    return { topic: 'line', level: L, kind: 'line', p: { min, max, step, target }, answer: target,
      text: { es: 'Mueve la bandera hasta el ' + target + '.', hu: 'Told a zászlót ide: ' + target + '.' },
      say: { es: ['x:m_mueve'].concat(numKeys(target, 'es')), hu: ['x:m_told'].concat(numKeys(target, 'hu')) },
      vis: { type: 'line', min, max, step }, explain: 'recta numérica: ' + target };
  };
  // ---- kerekítés ----
  const roundTo = (n, u) => Math.floor(n / u + 0.5) * u; // .5 felfelé (a tankönyv szabálya)
  T.round = function (L, rng) {
    let n, u;
    if (L === 1) { u = 10; do { n = rnd(rng, 11, 99); } while (n % 10 === 5); }
    else if (L === 2) { u = 10; n = rnd(rng, 11, 99); }
    else if (L === 3) { u = 10; n = rnd(rng, 101, 999); }
    else if (L === 4) { u = 100; do { n = rnd(rng, 101, 999); } while (n % 100 === 50); }
    else { u = pick(rng, [10, 100]); n = rnd(rng, 1001, 9989); }
    if (n % u === 0) n += 1;
    const ans = roundTo(n, u); const lo = Math.floor(n / u) * u, hi = lo + u;
    const kind = L >= 5 ? 'num' : 'choice';
    const nm = u === 10 ? ['decena', 'tízesre', 'x:m_redondea_D', 'x:m_kerekits_tizes'] : ['centena', 'százasra', 'x:m_redondea_C', 'x:m_kerekits_szazas'];
    const t = { topic: 'round', level: L, kind, p: { n, u }, answer: ans,
      text: { es: 'Redondea ' + n + ' a la ' + nm[0] + ' más cercana.', hu: 'Kerekítsd a(z) ' + n + ' számot a legközelebbi ' + nm[1] + '.' },
      say: { es: [nm[2]].concat(numKeys(n, 'es')), hu: [nm[3]].concat(numKeys(n, 'hu')) },
      vis: { type: 'roundline', lo, hi, n }, explain: n + ' → ' + ans + '  (entre ' + lo + ' y ' + hi + ')' };
    if (kind === 'choice') t.options = uniqueChoices(rng, ans, [lo, hi, lo - u, hi + u, ans + u / 10, ans - u / 10], 4);
    return t;
  };
  function make(topic, level, rng) {
    rng = rng || Math.random; level = Math.max(1, Math.min(5, level | 0 || 1));
    return T[topic](level, rng);
  }
  function check(task, resp) { return String(resp) === String(task.answer); }
  // független ellenőrzés (tesztekhez): a nyers paraméterekből újraszámolja a választ
  function recompute(t) {
    const p = t.p;
    switch (t.topic) {
      case 'mult': return p.a * p.b;
      case 'car': return p.a * p.b;
      case 'add': { let s = 0; for (let i = 0; i < p.a; i++) s += p.b; return s; }
      case 'factor': return p.ask === 'product' ? p.a * p.b : (function () { const prod = Number(/=\s*(\d+)\./.exec(t.text.es)[1]); for (let x = 0; x <= 10; x++) if (p.a * x === prod) return x; return NaN; })();
      case 'place': { if (p.ask === 'decomp') { const v = String(p.n).padStart(4, '0').split('').map(Number); return v[0] + ' UM + ' + v[1] + ' C + ' + v[2] + ' D + ' + v[3] + ' U'; } const idx = { UM: 0, C: 1, D: 2, U: 3 }[p.ask]; return Number(String(p.n).padStart(4, '0')[idx]); }
      case 'compare': return p.a > p.b ? '>' : p.a < p.b ? '<' : '=';
      case 'line': return p.target;
      case 'round': { const q = p.n / p.u; const fl = Math.floor(q); return (q - fl >= 0.5 ? fl + 1 : fl) * p.u; }
    }
  }
  const api = { TOPICS, TOPIC_NAME, make, check, recompute, numKeys, shuffle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MathGen = api;
})(typeof window !== 'undefined' ? window : globalThis);

/* Leckénkénti kvíz-generátor (Robert, 2026-11-05): minden lecke kvíze legalább 50 véletlenszerű kérdés
   a lecke szavaiból, mondataiból, párbeszédéből, példáiból, a fejezet szótárából és a fejezet kvízéből.
   Minden indításkor új sorrend, új rossz válaszok, új válaszsorrend. Közös: Main.template.html + mkstandalone.py. */
var LQ = (function () {
  var MIN = 50;
  var STOP = {}; 'las los una uno unos unas del con por que para sus mis tus les nos este esta eso esto the and are you his her its our was were has have had for with from this that these those they them who what one'.split(' ').forEach(function (w) { STOP[w] = 1; });
  var TXT = {
    es: { mean: function (w) { return '¿Qué significa «' + w + '»?'; }, say: function (h) { return '¿Cómo se dice «' + h + '» en español?'; }, hear: '¿Qué palabra oyes?', sent: '¿Qué frase es correcta?', who: function (l) { return '¿Quién dice: «' + l + '»?'; }, lang: 'spanyolul' },
    en: { mean: function (w) { return 'What does “' + w + '” mean?'; }, say: function (h) { return 'How do you say “' + h + '” in English?'; }, hear: 'Which word do you hear?', sent: 'Which sentence is right?', who: function (l) { return 'Who says: “' + l + '”?'; }, lang: 'angolul' }
  };
  function shuffle(a) { var b = a.slice(); for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = b[i]; b[i] = b[j]; b[j] = x; } return b; }
  function clean(h) { return (h || '').replace(/\s*\([^)]*\)/g, '').trim() || h; }
  function key(t) { return t.toLowerCase().replace(/’/g, "'"); }
  function tokens(s) { var out = []; (s || '').split(/\s+/).forEach(function (tok) { var m = tok.match(/^[^\p{L}]*(\p{L}[\p{L}'’-]*)/u); if (m) out.push(m[1]); }); return out; }
  function pageNums(p) { var m = String(p || '').match(/\d+/g); if (!m) return null; var a = +m[0], b = +(m[1] || m[0]); return [a, b]; }
  // választási lehetőségek: helyes + (n-1) különböző rossz a pool-ból
  function opts(correct, pools, n) {
    n = n || 4; var seen = {}; seen[correct.toLowerCase()] = 1; var wrong = [];
    for (var p = 0; p < pools.length && wrong.length < n - 1; p++) {
      var sh = shuffle(pools[p]);
      for (var i = 0; i < sh.length && wrong.length < n - 1; i++) { var v = sh[i]; if (!v) continue; var k = v.toLowerCase(); if (seen[k]) continue; seen[k] = 1; wrong.push(v); }
    }
    if (!wrong.length) return null;
    var all = shuffle([correct].concat(wrong)); return { options: all, answer: all.indexOf(correct) };
  }
  function lessonWords(D, c) {
    var W = D.words || {}; var seen = {}; var out = [];
    var texts = [c.es].concat((c.sentences || []).map(function (x) { return x.es; }), (c.dialogue || []).map(function (x) { return x.es; }), (c.examples || []).map(function (x) { return x.es; }));
    texts.forEach(function (s) { tokens(s).forEach(function (t) { var k = key(t); if (seen[k] || !W[k] || /^\d+$/.test(k) || k.length < 3 || STOP[k]) return; seen[k] = 1; out.push({ k: k, w: k, hu: W[k] }); }); });
    return out;
  }
  function lessonGloss(D, c, unitId) {
    var pr = pageNums(c.pages); var txt = [c.es, c.es_text].concat((c.sentences || []).map(function (x) { return x.es; }), (c.dialogue || []).map(function (x) { return x.es; })).join(' ').toLowerCase();
    return (D.glossary || []).filter(function (g) {
      if (g.unit !== unitId) return false;
      var gp = parseInt(g.page, 10); if (pr && gp >= pr[0] && gp <= pr[1]) return true;
      var t = clean(g.es).toLowerCase().replace(/^(el|la|los|las|un|una|the|a|an|to)\s+/, ''); return t.length > 2 && txt.indexOf(t) >= 0;
    });
  }
  // egy lecke kérdésbankja
  function forLesson(D, LANG, c, unit) {
    var T = TXT[LANG] || TXT.en; var page = c.pages; var Q = []; var seenQ = {};
    function add(q) { var id = q.q_es + '|' + q.q_hu + '|' + q.options[q.answer]; if (seenQ[id]) return; seenQ[id] = 1; q.page = q.page || page; q.lesson = c.id; Q.push(q); }
    var words = lessonWords(D, c);
    var unitWords = []; unit.concepts.forEach(function (k) { if (k.id !== c.id) unitWords = unitWords.concat(lessonWords(D, k)); });
    var allWordsW = Object.keys(D.words || {}); var allWordsHu = allWordsW.map(function (k) { return D.words[k]; });
    var gl = lessonGloss(D, c, unit.id); var unitGl = (D.glossary || []).filter(function (g) { return g.unit === unit.id; });
    var huPool = [words.map(function (x) { return x.hu; }), unitWords.map(function (x) { return x.hu; }), allWordsHu];
    var wPool = [words.map(function (x) { return x.w; }), unitWords.map(function (x) { return x.w; }), allWordsW];
    var sents = []; (c.sentences || []).forEach(function (x, i) { sents.push({ es: x.es, hu: x.hu, k: 's:' + c.id + ':' + i }); });
    (c.dialogue || []).forEach(function (x, i) { sents.push({ es: x.es, hu: x.hu, k: 'd:' + c.id + ':' + i, who: x.who }); });
    var unitSents = []; unit.concepts.forEach(function (k) { if (k.id === c.id) return; (k.sentences || []).concat(k.dialogue || []).forEach(function (x) { unitSents.push(x); }); });
    function addWord(x, kind, src) {
      var au = src === 'g' ? 'g:' + x.i : 'w:' + x.k; var w = src === 'g' ? x.es : x.w; var hu = x.hu;
      var hp = src === 'g' ? [gl.map(function (g) { return g.hu; }), unitGl.map(function (g) { return g.hu; })].concat(huPool) : huPool;
      var wp = src === 'g' ? [gl.map(function (g) { return g.es; }), unitGl.map(function (g) { return g.es; })].concat(wPool) : wPool;
      var o;
      if (kind === 'mean') { o = opts(hu, hp); if (o) add({ q_es: T.mean(w), q_hu: 'Mit jelent magyarul: ' + w + '?', options: o.options, answer: o.answer, explain: w + ' = ' + hu, sayEs: [au, w], sayHu: ['', 'Mit jelent magyarul?'] }); }
      if (kind === 'say') { o = opts(w, wp); if (o) add({ q_es: T.say(clean(hu)), q_hu: 'Hogy mondjuk ' + T.lang + ': ' + hu + '?', options: o.options, answer: o.answer, explain: hu + ' = ' + w, sayEs: ['', T.say(clean(hu))], sayHu: [au, clean(hu)] }); }
      if (kind === 'hear') { o = opts(w, wp); if (o) add({ q_es: T.hear, q_hu: 'Melyik szót hallod? Nyomd meg a hang gombot!', options: o.options, answer: o.answer, explain: w + ' = ' + hu, sayEs: [au, w], sayHu: ['', 'Melyik szót hallod?'], auto: [LANG === 'hu' ? 'hu' : LANG, au, w] }); }
      if (kind === 'tf') { var right = Math.random() < 0.5; var other = right ? hu : (opts(hu, hp, 2) || { options: [hu] }).options.filter(function (v) { return v !== hu; })[0]; if (!other) return; var lab = ['Igaz ✔', 'Hamis ✘'];
        add({ q_es: w + ' = ' + other, q_hu: 'Igaz vagy hamis? „' + w + '” jelentése: ' + other, options: lab, answer: (other === hu) ? 0 : 1, explain: w + ' = ' + hu, sayEs: [au, w], sayHu: ['', 'Igaz vagy hamis?'] }); }
    }
    words.forEach(function (x) { ['mean', 'say', 'hear', 'tf'].forEach(function (k) { addWord(x, k, 'w'); }); });
    gl.forEach(function (g) { ['mean', 'say'].forEach(function (k) { addWord(g, k, 'g'); }); });
    // mondatok és párbeszéd-sorok
    var sHu = [sents.map(function (x) { return x.hu; }), unitSents.map(function (x) { return x.hu; })];
    var sEs = [sents.map(function (x) { return x.es; }), unitSents.map(function (x) { return x.es; })];
    sents.forEach(function (s) {
      var o = opts(s.hu, sHu); if (o) add({ q_es: s.es, q_hu: 'Mit jelent ez a mondat?', options: o.options, answer: o.answer, explain: s.es + ' = ' + s.hu, sayEs: [s.k, s.es], sayHu: ['', 'Mit jelent ez a mondat?'] });
      o = opts(s.es, sEs); if (o) add({ q_es: T.sent, q_hu: 'Melyik mondat jelenti ezt: „' + s.hu + '”?', options: o.options, answer: o.answer, explain: s.hu + ' = ' + s.es, sayEs: ['', T.sent], sayHu: [s.k, s.hu] });
      // hiányzó szó
      var cand = tokens(s.es).filter(function (t) { var k = key(t); return (D.words || {})[k] && k.length > 2; });
      if (cand.length) { var t = cand[Math.floor(Math.random() * cand.length)]; var gap = s.es.replace(new RegExp('(^|[^\\p{L}])' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}])', 'u'), '$1[ … ]');
        if (gap !== s.es) { o = opts(t, [words.map(function (x) { return x.w; }), unitWords.map(function (x) { return x.w; }), allWordsW]); if (o) add({ q_es: gap, q_hu: 'Melyik szó hiányzik? (' + s.hu + ')', options: o.options, answer: o.answer, explain: s.es, sayEs: ['', gap.replace('[ … ]', '…')], sayHu: [s.k, s.hu] }); } }
    });
    var who = {}; (c.dialogue || []).forEach(function (x) { who[x.who] = 1; }); var whoL = Object.keys(who);
    if (whoL.length > 1) (c.dialogue || []).forEach(function (x, i) { var o = opts(x.who, [whoL]); if (o) add({ q_es: T.who(x.es), q_hu: 'Ki mondja ezt a párbeszédben? („' + x.hu + '”)', options: o.options, answer: o.answer, explain: x.who + ': ' + x.es, sayEs: ['d:' + c.id + ':' + i, x.es], sayHu: ['d:' + c.id + ':' + i, x.hu] }); });
    // példák
    var ex = c.examples || []; ex.forEach(function (e, i) { var o = opts(e.hu, [ex.map(function (x) { return x.hu; }), unitSents.map(function (x) { return x.hu; })]); if (o) add({ q_es: e.es, q_hu: 'Melyik illik hozzá?', options: o.options, answer: o.answer, explain: e.es + ' = ' + e.hu, sayEs: ['e:' + c.id + ':' + i, e.es], sayHu: ['', 'Melyik illik hozzá?'] }); });
    // a fejezet eredeti kvízkérdései, amelyek a lecke oldalaira esnek
    var pr = pageNums(page);
    (D.quiz || []).forEach(function (q) { if (q.unit !== unit.id) return; var p = parseInt(q.page, 10); if (!pr || !(p >= pr[0] && p <= pr[1])) return; var o = opts(q.options[q.answer], [q.options]); if (o) add({ q_es: q.q_es, q_hu: q.q_hu, options: o.options, answer: o.answer, explain: q.explain, page: q.page, sayEs: ['q:' + q.i, q.q_es], sayHu: ['q:' + q.i, q.q_hu] }); });
    // matek: szorzások a lecke szövegéből (pl. szorzótábla-leckék)
    var txt = [c.es_text].concat(ex.map(function (x) { return x.es; }), (c.sentences || []).map(function (x) { return x.es; })).join(' ');
    var tabs = {}; var re = /(\d+)\s*[×x]\s*(\d+)\s*=\s*(\d+)/g, m; while ((m = re.exec(txt))) { if (+m[1] * +m[2] === +m[3]) { if (+m[2] <= 10) tabs[m[2]] = 1; } }
    var tl = Object.keys(tabs).map(Number);
    if (tl.length) for (var a = 0; a <= 10; a++) tl.forEach(function (b) { var r = a * b; var near = [r + b, r - b, r + 1, r - 1, r + 2, (a + 1) * (b + 1), r + 10].filter(function (v) { return v >= 0 && v !== r; }).map(String); var o = opts(String(r), [near]); if (o) add({ q_es: a + ' × ' + b + ' = ?', q_hu: 'Mennyi ' + a + ' × ' + b + '?', options: o.options, answer: o.answer, explain: a + ' × ' + b + ' = ' + r, sayEs: ['', a + ' por ' + b], sayHu: ['', a + ' szorozva ' + b] }); });
    // ha még kevés: a fejezet többi leckéjének szavai
    if (Q.length < MIN) shuffle(unitWords).forEach(function (x) { if (Q.length < MIN) { addWord(x, 'mean', 'w'); addWord(x, 'say', 'w'); } });
    if (Q.length < MIN) shuffle(unitGl).forEach(function (g) { if (Q.length < MIN) { addWord(g, 'mean', 'g'); addWord(g, 'say', 'g'); } });
    return Q;
  }
  // scope: 'all' | <unit id> | 'c:<lesson id>'
  function build(D, LANG, scope) {
    var out = [];
    D.units.forEach(function (u) { u.concepts.forEach(function (c) { if (scope === 'all' || scope === u.id || scope === 'c:' + c.id) out = out.concat(forLesson(D, LANG, c, u)); }); });
    return shuffle(out);
  }
  return { build: build, forLesson: forLesson, MIN: MIN, shuffle: shuffle };
})();

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
      if (type === 'tk') { const t = tasksAll().find(x => x.id === id); if (t) return taskQ(t); }
      if (type === 'dc') { for (const u of unitsList()) { const x = dictWords(u).find(y => norm(y.w) === id); if (x) return dictQ(x, u); } }
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
  function extraKind() { return C.subj === 'en' ? 'spelling' : C.subj === 'mat' ? 'gen' : C.subj === 'lengua' ? 'dictado' : (['cs', 'ns', 'ac'].indexOf(C.subj) >= 0 && tasksAll().length) ? 'tasks' : null; }
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
  function gradeCard(id, ok) { const cur = boxOf(id); const b = ok ? Math.min(5, cur + 1) : 1; P.box[id] = { b, due: addDays(today(), INTERVAL[b]) };
    if (ok && b >= 3) { P.stk = P.stk || {}; if (!P.stk[id]) { P.stk[id] = today(); const w = pool().find(x => x.id === id); if (w && w.icon) setTimeout(() => stickerToast(w), 250); } }
    Store.save(); }
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
    const R = ST.run, q = curQ(); if (R.ans !== null && R.mode !== 'test') return; touch();
    let ok;
    if (q.kind === 'type') ok = norm(String(resp)) === norm(q.answer) || (q.alts || []).some(a => norm(a) === norm(String(resp))); else ok = String(resp) === String(q.answer);
    if (q.kind === 'type' && !ok && R.tries < 1 && R.mode !== 'test') { R.tries++; R.ok = 'retry'; sayHu('fb_retry'); try { H.sfxBad(); } catch (e) { } ST.mood = 'sad'; render(); return; }
    const dadTurn = R.duel && R.i % 2 === 1; clearInterval(duelIv);
    R.ans = resp; R.ok = ok; if (!R.duel) R.score += ok ? 1 : 0; R.res.push({ q, ok, resp });
    if (R.duel) { R.duel.score[R.i % 2] += ok ? 1 : 0; if (!dadTurn) R.score += ok ? 1 : 0; }
    if (R.boss) { if (ok) { R.boss.hp = Math.max(0, R.boss.hp - 1); R.boss.hit = 1; } else { R.boss.hearts = Math.max(0, R.boss.hearts - 1); R.boss.hit = 0; } }
    if (!dadTurn) record(q.rec, ok); if (q.topic) genAdapt(q.topic, ok); if (ok && q.rec && q.rec.type === 'tk') { P.tkok = P.tkok || {}; P.tkok[q.rec.id] = today(); }
    if (R.mode === 'test') { nextRun(); return; }
    const cst = dadTurn ? 0 : comboHit(R, ok);
    if (R.fast) { try { ok ? H.sfxGood() : H.sfxBad(); } catch (e) { } if (cst) award(cst); R.flashOk = ok; nextRun(); return; }
    ST.mood = ok ? 'happy' : 'sad'; try { ok ? H.sfxGood() : H.sfxBad(); } catch (e) { }
    if (cst) award(cst);
    render(); const fb = ok ? pickPraise() : 'fb_bad';
    setTimeout(() => { if (ST.view === 'run' && ST.run === R) { const it = [sx(fb)]; if (!ok && q.reveal) it.push.apply(it, q.reveal); if (ok && q.kind === 'type') it.push(q.audio[0]); say(it); } }, ok ? 900 : 1200);
  }
  function pickPraise() { return ['fb_ok1', 'fb_ok2', 'fb_ok3', 'fb_ok4'][Math.floor(Math.random() * 4)]; }
  function nextRun() {
    const R = ST.run; ST.mood = 'idle'; ST.levelUp = null;
    let more = R.gen ? (R.i + 1 < (R.limit || 9999)) : (R.i + 1 < R.qs.length);
    if (R.boss && (R.boss.hp <= 0 || R.boss.hearts <= 0)) more = false;
    if (!more) { finishRun(false); return; }
    R.i++; R.ans = null; R.ok = null; R.num = ''; R.typed = ''; R.tries = 0; R.flipped = false; if (R.boss) R.boss.hit = 0; ST.kanim = ''; render({ top: !R.fast }); if (!R.fast) autoAudio(); else { const q2 = curQ(); if (q2 && q2.hearOnly) autoAudio(); } duelTick();
  }
  function finishRun(timeUp) {
    const R = ST.run; clearInterval(timerIv); stopAll(); R.done = true; R.timeUp = !!timeUp; const total = R.res.length || 1; const pct = R.score / (R.mode === 'test' ? R.qs.length : total);
    ST.mood = pct >= .6 ? 'happy' : 'idle'; let bonus = 0;
    if (R.mode === 'mission') { bonus = 5; P.mission[today()] = true; markActive(); }
    if (R.mode === 'test') { bonus = Math.round(pct * 10); const parts = {}; R.qs.forEach((q, i) => { const r = R.res[i]; const p = parts[q.part] || (parts[q.part] = { n: 0, ok: 0 }); p.n++; if (r && r.ok) p.ok++; });
      P.tests.push({ ts: Date.now(), unit: R.unit, units: R.units || [R.unit], score: R.score, total: R.qs.length, secs: Math.round((Date.now() - R.start) / 1000), parts }); P.tests = P.tests.slice(-30); markActive();
      R.win = pct >= 0.75; if (R.win) { bonus += 5; const cert = { ts: Date.now(), subj: subjTitle(), units: (R.units || [R.unit]).map(unitTitle), pct: Math.round(pct * 100), score: R.score, total: R.qs.length }; P.certs = (P.certs || []).concat([cert]).slice(-20); R.cert = cert; } }
    if (R.mode === 'lesson') { const n = R.res.length || 1; const pc = Math.round(R.score / n * 100); P.lq = P.lq || {}; const old = P.lq[R.lesson] || 0; const s0 = starsOf(old), s1 = starsOf(pc); if (pc > old) P.lq[R.lesson] = pc; R.lessonPct = pc; R.newStars = Math.max(0, s1 - s0); bonus += R.newStars * 2; markActive(); if (s1 >= 2) celebrate(s1 === 3); }
    if (R.mode === 'boss') { R.win = R.boss.hp <= 0; markActive(); if (R.win) { bonus += 10; P.bossWin = P.bossWin || {}; P.bossWin[R.unit] = today(); celebrate(true); } }
    if (R.mode === 'blitz') { P.blitz = P.blitz || {}; R.record = R.score > (P.blitz.best || 0); if (R.record) { P.blitz.best = R.score; celebrate(true); } bonus += Math.min(10, Math.round(R.score / 3)); markActive(); }
    if (R.mode === 'duel') { const sc = R.duel.score; R.duelRes = sc[0] > sc[1] ? 'm' : sc[0] < sc[1] ? 'd' : 't'; if (R.duelRes !== 'd') celebrate(R.duelRes === 'm'); bonus += R.duelRes === 'm' ? 5 : 2; markActive(); }
    if (R.mode === 'mission' && pct >= .8) celebrate();
    if (R.mode === 'test' && R.win) celebrate(true);
    if (bonus) award(bonus); R.bonus = bonus; Store.save(); Store.writeLocal();
    try { pct >= .6 ? H.sfxGood() : null; } catch (e) { }
    render({ top: true }); setTimeout(() => { if (ST.view === 'run') sayHu(R.mode === 'test' ? (R.win ? 'fb_race_win' : 'fb_race_lose') : R.mode === 'boss' ? (R.win ? 'boss_win' : 'boss_lose') : R.mode === 'duel' ? ({ m: 'duel_m_win', d: 'duel_d_win', t: 'duel_tie' })[R.duelRes] : R.record ? 'blitz_record' : 'fb_end'); }, 800);
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
  function vHome() {
    const ev = nextEvent(); ST.curEvent = ev; const done = !!P.mission[today()];
    const tiles = [['map', 't_map', 'T9'], ['blitz', 't_blitz', 'T10'], ['cards', 't_cards', 'T1'], ['games', 't_games', 'T2'], ['duel', 't_duel', 'T11'], ['space', 't_space', 'T12']];
    if (C.subj === 'mat') tiles.push(['bingo', 't_bingo', 'T13']); tiles.push(['bubble', 't_bubble', 'T14'], ['build', 't_builder', 'T15'], ['room', 't_room', 'T16']);
    if (extraKind()) { const ek = extraKind(); tiles.push([ek, { spelling: 't_spelling', gen: 't_gen', dictado: 't_dictado', tasks: 't_tasks' }[ek], 'T3']); }
    if (Plus.speechOK()) tiles.push(['speak', 't_speak', 'T4']); tiles.push(['testmenu', 't_test', 'T5'], ['album', 't_album', 'T8'], ['shop', 't_shop', 'T6'], ['parent', 't_parent', 'T7']);
    const gs = globalStreak(); const tot = totalStars(); const soon = ev && ev._days >= 0 && ev._days <= 2;
    return '<div class="px-hero">' + kitty(ST.mood, 120, 'hero') + '<div><h1>' + esc(hu('hello')) + '</h1><div class="px-stat big">' + ICO.star + '<b>' + P.stars + '</b>' + ICO.flame + '<b>' + gs.n + '</b><span class="px-sub">' + esc(hu('streak_days')) + (gs.rest ? ' · ' + esc(hu('rest_day')) : '') + '</span></div>' + (tot !== P.stars ? '<div class="px-sub">' + ICO.star + ' <b>' + tot + '</b> ' + esc(hu('stars_total')) + '</div>' : '') + '</div>' +
      '<button type="button" class="pbtn o" data-a="instr" data-k="home_intro">' + ICO.spk + '<span>' + esc(hu('b_listen')) + '</span></button></div>' +
      rewardHtml() + weeklyHtml() + '<h3 class="px-h">' + esc(hu('today_mission')) + '</h3>' + eventCard(ev) + (ev ? readyHtml(ev) : '') +
      (soon ? '<div class="px-card px-final"><div class="px-final-cars">' + carSvg('#3B82C4', 70) + carSvg('#D9362B', 70) + '</div><h2>' + esc(hu('race_final')) + '</h2><p class="px-evh">' + esc(hu('race_sub')) + '</p><button type="button" class="pbtn b xl" data-a="race">' + ICO.next + '<span>' + esc(hu('b_race')) + '</span></button></div>' : '') +
      qnChips() + '<button type="button" class="pbtn g xl" data-a="mission">' + (done ? ICO.ok : ICO.next) + '<span>' + esc(hu(done ? 'b_mission_again' : 'b_mission')) + '</span><small>' + esc(hu(ev ? 'mission_sub' : 'mission_sub_review')) + '</small></button>' +
      '<div class="px-tiles">' + tiles.map(t => '<button type="button" class="px-tile ' + t[2] + '" data-a="' + (['blitz', 'duel', 'space', 'bingo', 'bubble', 'build'].indexOf(t[0]) >= 0 ? t[0] : 'go') + '" data-v="' + t[0] + '"><span class="ic">' + tileIcon(t[0]) + '</span><span>' + esc(hu(t[1])) + '</span><small>' + esc(S(t[1]).l) + '</small></button>').join('') + '</div>';
  }
  function tileIcon(k) { const m = { cards: '<rect x="10" y="22" width="40" height="30" rx="5" fill="#fff" stroke="#B85A12" stroke-width="3"/><rect x="22" y="12" width="40" height="30" rx="5" fill="#FFF1E4" stroke="#B85A12" stroke-width="3"/>', games: '<rect x="10" y="22" width="44" height="26" rx="13" fill="#6BBF59" stroke="#22603C" stroke-width="3"/><path d="M22 35 h12 M28 29 v12" stroke="#fff" stroke-width="4"/><circle cx="42" cy="32" r="3" fill="#fff"/><circle cx="48" cy="38" r="3" fill="#fff"/>', dictado: '<path d="M14 48 l6 -22 l24 10 z" fill="#F7C948" stroke="#B8860B" stroke-width="3"/><path d="M20 26 L50 12" stroke="#B85A12" stroke-width="5"/><path d="M40 52 h20" stroke="#B85A12" stroke-width="3"/>', tasks: '<rect x="12" y="10" width="40" height="46" rx="5" fill="#fff" stroke="#22603C" stroke-width="3"/><path d="M20 24 l5 5 9 -10 M20 42 l5 5 9 -10" stroke="#6BBF59" stroke-width="4" fill="none"/><path d="M38 26 h8 M38 44 h8" stroke="#22603C" stroke-width="3"/>', album: '<rect x="8" y="10" width="48" height="44" rx="6" fill="#FFF1E4" stroke="#7D3C98" stroke-width="3"/><circle cx="22" cy="26" r="7" fill="#F7C948"/><rect x="34" y="19" width="14" height="14" rx="3" fill="#6BBF59"/><path d="M16 44 h32" stroke="#7D3C98" stroke-width="3"/>', spelling: '<path d="M14 48 l6 -22 l24 10 z" fill="#F7C948" stroke="#B8860B" stroke-width="3"/><path d="M20 26 L50 12" stroke="#B85A12" stroke-width="5"/>', gen: '<text x="32" y="46" font-size="40" font-weight="900" text-anchor="middle" fill="#B85A12">×</text>', speak: '<rect x="25" y="8" width="14" height="28" rx="7" fill="#E86A7A" stroke="#8E2A1F" stroke-width="3"/><path d="M16 30 a16 16 0 0 0 32 0 M32 46 v10" stroke="#8E2A1F" stroke-width="3" fill="none"/>', testmenu: '<rect x="14" y="8" width="36" height="46" rx="4" fill="#fff" stroke="#1F4E79" stroke-width="3"/><path d="M20 20 h24 M20 30 h24 M20 40 h14" stroke="#1F4E79" stroke-width="3"/>', shop: '<path d="M32 10 l6 14 15 2 -11 10 3 15 -13 -8 -13 8 3 -15 -11 -10 15 -2z" fill="#F7C948" stroke="#B8860B" stroke-width="3"/>', parent: '<circle cx="32" cy="22" r="10" fill="#9AA7B4"/><path d="M12 54 q0 -20 20 -20 q20 0 20 20z" fill="#9AA7B4"/>' }; return '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">' + (m[k] || FUNICO[k] || '') + '</svg>'; }
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
    let h = topbar(R.title) + '<div class="px-row"><span class="px-prog">' + esc(prog) + '</span>' + comboBadge(R) + (R.end ? '<span class="px-timer" id="px-timer">' + (function () { const left = Math.max(0, Math.round((R.end - Date.now()) / 1000)); return Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'); })() + '</span>' : '') +
      (q.audio || q.task || q.items ? '<button type="button" class="pbtn o sm" data-a="qsay">' + ICO.spk + '<span>' + esc(hu('b_again_listen')) + '</span></button>' : '') + (R.instr && R.mode !== 'test' ? instrBtn(R.instr) : '') + '</div>';
    const showFb = R.ans !== null && R.mode !== 'test'; const answered = showFb;
    if (R.boss) h += bossHtml(R); if (R.duel) h += duelHtml(R); if (R.fast && R.flashOk != null) { h += '<div class="fx-flash ' + (R.flashOk ? 'ok' : 'bad') + '">' + (R.flashOk ? '✔' : '✘') + '</div>'; R.flashOk = null; }
    if (R.mode === 'test') { const n2 = R.qs.length || 1; const me = R.score / n2, riv = Math.min(1, R.res.length * 0.75 / n2);
      h += '<div class="px-race" aria-hidden="true"><div class="lane me"><span class="fin"></span><span class="car" style="left:calc(' + (me * 100) + '% - ' + Math.round(me * 56) + 'px)">' + carSvg('#3B82C4') + '</span></div><div class="lane"><span class="fin"></span><span class="car" style="left:calc(' + (riv * 100) + '% - ' + Math.round(riv * 56) + 'px)">' + carSvg('#D9362B') + '</span></div></div>'; }
    if (q.fix && R.mode !== 'test') h += '<div class="px-fix">' + esc(hu('fix_badge')) + '</div>';
    h += '<div class="px-q">' + (R.mode !== 'test' || true ? '<div class="px-kit">' + kitty(showFb ? (R.ok ? 'happy' : 'sad') : (R.ok === 'retry' ? 'sad' : 'idle'), 96, showFb && R.ok ? (ST.kanim || 'k-jump') : '') + '</div>' : '') + '<div class="px-qb">';
    if (q.prompt) h += '<div class="px-prompt">' + bi(q.prompt) + '</div>';
    if (q.big) h += '<div class="px-bigq' + (q.part === 'math' ? ' math' : '') + '">' + esc(q.big) + '</div>'; if (q.small) h += '<div class="px-smallq">' + esc(q.small) + '</div>';
    if (q.task && q.task.vis) h += visHtml(q.task.vis, q.task);
    h += '</div></div>';
    if (q.kind === 'choice') h += '<div class="px-opts n' + q.options.length + '">' + q.options.map((o, i) => { let cls = 'opt big'; if (answered) { if (String(o.v) === String(q.answer)) cls += ' correct'; else if (String(o.v) === String(R.ans)) cls += ' wrong'; else cls += ' dim'; }
      return '<button type="button" class="' + cls + '" data-a="pick" data-i="' + i + '">' + (o.icon ? '<span class="oi">' + o.icon + '</span>' : '') + '<span>' + esc(o.label) + '</span>' + (o.es ? '<small>' + esc(o.es) + ' · ' + esc(o.hu) + '</small>' : o.sm ? '<small>' + esc(o.sm) + '</small>' : '') + '</button>'; }).join('') + '</div>';
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
  function vFlashRun() { const R = ST.run, q = curQ(); const w = q.w; return topbar(R.title) + '<div class="px-prog">' + (R.i + 1) + ' / ' + R.qs.length + '</div><div class="px-flash' + (R.flipped ? ' flip' : '') + '">' + (w.icon ? '<div class="px-ico">' + w.icon + '</div>' : '') + '<div class="px-fw">' + esc(w.es) + '</div>' + (R.flipped ? '<div class="px-fh">' + esc(w.hu) + '</div>' : '') + '<div class="px-row center"><button type="button" class="pbtn o" data-a="cardsay" data-w="' + w.id + '" data-l="' + C.lang + '">' + ICO.spk + '<span>' + esc(C.lang.toUpperCase()) + '</span></button>' + (R.flipped ? '<button type="button" class="pbtn o" data-a="cardsay" data-w="' + w.id + '" data-l="hu">' + ICO.spk + '<span>HU</span></button>' : '') + '</div></div>' +
    (!R.flipped ? '<button type="button" class="pbtn b xl" data-a="flipm"><span>' + esc(hu('b_flip')) + '</span></button>' : '<div class="px-row center"><button type="button" class="pbtn g xl" data-a="gradem" data-ok="1">' + ICO.ok + '<span>' + esc(hu('b_knew')) + '</span></button><button type="button" class="pbtn r xl" data-a="gradem" data-ok="0">' + ICO.no + '<span>' + esc(hu('b_notyet')) + '</span></button></div>'); }
  function vRunDone() {
    const R = ST.run; const n = R.mode === 'test' ? R.qs.length : R.res.length; const pct = n ? R.score / n : 0;
    let h = topbar(R.title) + '<div class="px-card center">' + (R.mode === 'test' ? '<div class="px-final-cars">' + (R.win ? carSvg('#3B82C4', 90) + carSvg('#D9362B', 60) : carSvg('#D9362B', 90) + carSvg('#3B82C4', 60)) + '</div>' : '') + kitty(pct >= .6 ? 'happy' : 'idle', 130) + (R.mode === 'boss' ? '<div class="fx-mon' + (R.win ? ' hit' : '') + '" style="text-align:center">' + monsterSvg(R.boss.num, 120) + '</div>' : '') + '<h2>' + esc(hu(R.mode === 'test' ? (R.win ? 'race_win' : 'race_lose') : R.mode === 'boss' ? (R.win ? 'boss_win' : 'boss_lose') : R.mode === 'duel' ? ({ m: 'duel_m_win', d: 'duel_d_win', t: 'duel_tie' })[R.duelRes] : R.record ? 'blitz_record' : 'run_done')) + '</h2>' +
      (R.mode === 'duel' ? '<p class="px-big">' + esc(R.duel.names[0]) + ' ' + R.duel.score[0] + ' : ' + R.duel.score[1] + ' ' + esc(R.duel.names[1]) + '</p>' : R.mode === 'blitz' ? '<p class="px-big">' + R.score + ' ✔ · ' + esc(L3('rekord', 'record', 'récord').hu) + ': ' + ((P.blitz || {}).best || 0) + '</p>' : '<p class="px-big">' + R.score + ' / ' + n + '</p>') +
      (R.mode === 'lesson' ? '<p class="px-big" style="color:#F2B705">' + [0, 1, 2].map(i => i < starsOf(R.lessonPct) ? '★' : '☆').join('') + ' <small>' + R.lessonPct + '%</small></p>' : '') + (R.bestCombo >= 3 ? '<p class="px-note">' + esc(L3('Legjobb kombó', 'Best combo', 'Mejor combo').hu) + ': ' + R.bestCombo + '×</p>' : '') + (R.bonus ? '<p class="px-note">+' + R.bonus + ' ' + ICO.star + '</p>' : '') + (R.timeUp ? '<p class="px-note">' + esc(hu('time_up')) + '</p>' : '') + '</div>';
    if (R.mode === 'test') h += evalHtml(R);
    h += '<div class="px-row center">' + (R.cert ? '<button type="button" class="pbtn b" data-a="cert" data-i="' + ((P.certs || []).length - 1) + '">' + ICO.star + '<span>' + esc(hu('b_cert')) + '</span></button>' : '') + '<button type="button" class="pbtn g" data-a="rerun">' + esc(hu('b_again')) + '</button><button type="button" class="pbtn l" data-a="home">' + esc(hu('b_home')) + '</button>' +
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
      '<div class="px-card"><h3>Utolsó próbadolgozatok</h3>' + (P.tests.length ? '<table class="px-tab"><tr><th>Dátum</th><th>Fejezet</th><th>Eredmény</th><th>Idő</th><th>Részletek</th></tr>' + P.tests.slice(-6).reverse().map(t => '<tr><td>' + new Date(t.ts).toLocaleDateString('hu-HU') + '</td><td>' + esc(unitTitle(t.unit)) + '</td><td><b>' + t.score + ' / ' + t.total + '</b></td><td>' + Math.floor(t.secs / 60) + ':' + String(t.secs % 60).padStart(2, '0') + '</td><td>' + Object.keys(t.parts || {}).map(k => esc(hu('part_' + k)) + ' ' + t.parts[k].ok + '/' + t.parts[k].n).join(', ') + '</td></tr>').join('') + '</table>' : '<p>Még nem volt próbadolgozat.</p>') + '</div>' +
      '<p class="px-note">Mentés helye: <b>' + esc(Store.mode) + '</b>. Ha Martin több eszközön gyakorol, az adatok nincsenek összefésülve (a legutóbb mentett példány győz).</p>';
  }
  function missType(t) { return { w: 'szó', sp: 'spelling', dc: 'dictado', tk: 'tantárgyi feladat', q: 'kvíz', pr: 'kiejtés' }[t] || (t.indexOf('g:') === 0 ? 'matek: ' + (MG.TOPIC_NAME[t.slice(2)] || ['', ''])[1] : t); }
  // ================= render + események =================
  function html() {
    switch (ST.view) {
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
  function go(v, extra) { stopAll(); clearInterval(timerIv); ST.view = v; ST.mood = 'idle'; Object.assign(ST, extra || {}); render({ top: true }); const ins = { cards: 'i_cards', games: 'i_games', spelling: 'i_spelling', dictado: 'i_dictado', tasks: 'i_tasks', gen: 'i_gen', speak: 'i_speak', testmenu: 'i_test', shop: 'i_shop', album: 'i_album', map: 'i_map', room: 'i_room', home: null }[v]; if (v === 'speak') nextSpeak(); else if (ins) sayK(ins); }
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
      case 'check': { const inp = el.querySelector('#px-input'); const v = inp ? inp.value.trim() : ''; if (!v) return; ST.run.typed = v; answerRun(v); break; }
      case 'np': { const R = ST.run; const k = d.k; if (R.ans !== null && R.mode !== 'test') return; if (k === '⌫') R.num = R.num.slice(0, -1); else if (k === '✓') { if (R.num) answerRun(R.num); return; } else if (R.num.length < 5) R.num += k; render(); break; }
      case 'linego': { const R = ST.run; answerRun(R.lineV == null ? ST.run.qs[R.i].task.p.min : R.lineV); break; }
      case 'next': nextRun(); break;
      case 'finish': finishRun(false); break;
      case 'qsay': { const q = curQ(); if (q.task) sayTask(q.task); else if (q.items) say(q.items); else if (q.audio) say(q.audio); break; }
      case 'rerun': { const R = ST.run; if (R.mission) startMission(); else if (R.mode === 'test') startTest(R.unit); else if (R.mode === 'lesson') startLesson(R.unit, R.lesson); else if (R.mode === 'boss') startBoss(R.unit); else if (R.mode === 'blitz') startBlitz(); else if (R.mode === 'duel') startDuel(); else go(R.back || 'home'); break; }
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
