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
