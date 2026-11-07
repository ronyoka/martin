/* Matek-kvíz (Robert 2026-11-07: „sokkal matek-specifikusabb… gyorsan lehessen haladni számokkal… lehessen passzolni”).
   Generátorok fejezetenként; minden feladat: {gid, unit, level, kind:'num'|'choice'|'multi'|'order'|'col', text:{es,hu}, audio:[{l,k,t}],
   answer (string), options:[{v,label,sm}], fields:[{es,hu,ans}], items:[label], col:{a,b,op}, vis, explain:{es,hu}}
   Hang: x:mq_<kulcs> (MQ.PH, a tools/mkxaudio.py veszi fel) + számok n:… (MathGen.numKeys). UMD: window.MQ / node. */
(function (root) {
  'use strict';
  const PH = {
    place_um: ['¿Cuántas unidades de millar hay en este número?', 'Hány ezres van ebben a számban?'],
    place_c: ['¿Cuántas centenas hay en este número?', 'Hány százas van ebben a számban?'],
    place_d: ['¿Cuántas decenas hay en este número?', 'Hány tízes van ebben a számban?'],
    place_u: ['¿Cuántas unidades hay en este número?', 'Hány egyes van ebben a számban?'],
    place_val: ['¿Cuánto vale la cifra marcada?', 'Mennyit ér a kiemelt számjegy?'],
    compose: ['¿Qué número es?', 'Melyik szám ez?'],
    hear: ['Escucha y escribe el número.', 'Hallgasd meg, és írd le számmal!'],
    compare: ['¿Qué signo va en medio?', 'Melyik jel kerül középre?'],
    order_asc: ['Ordena de menor a mayor.', 'Rakd sorba a legkisebbtől a legnagyobbig!'],
    order_desc: ['Ordena de mayor a menor.', 'Rakd sorba a legnagyobbtól a legkisebbig!'],
    neigh: ['Escribe el número anterior y el posterior.', 'Írd be, melyik szám van előtte és utána!'],
    round10: ['Redondea a la decena.', 'Kerekítsd tízesre!'], round100: ['Redondea a la centena.', 'Kerekítsd százasra!'], round1000: ['Redondea a la unidad de millar.', 'Kerekítsd ezresre!'],
    line: ['¿Qué número marca la flecha?', 'Melyik számot mutatja a nyíl?'],
    coladd: ['Suma en columna.', 'Add össze oszlopban!'], colsub: ['Resta en columna.', 'Vond ki oszlopban!'], colmul: ['Multiplica en columna.', 'Szorozd meg oszlopban!'],
    missing: ['¿Qué número falta?', 'Melyik szám hiányzik?'],
    word: ['Lee el problema y calcula.', 'Olvasd el a feladatot, és számold ki!'],
    cuanto: ['¿Cuánto es', 'Mennyi'], por: ['por', 'szorozva'],
    factor: ['¿Por cuánto hay que multiplicar?', 'Hánnyal kell szorozni?'],
    rep: ['¿Cuántas veces se suma el mismo número?', 'Hányszor adtuk össze ugyanazt a számot?'],
    groups: ['¿Cuántos hay en total?', 'Hány van összesen?'],
    seq: ['¿Qué número falta en la serie?', 'Melyik szám hiányzik a sorból?'],
    tf: ['¿Verdadero o falso?', 'Igaz vagy hamis?'],
    double: ['¿Cuál es el doble?', 'Mennyi a duplája?'], half: ['¿Cuál es la mitad?', 'Mennyi a fele?'],
    comm: ['Completa la igualdad.', 'Egészítsd ki az egyenlőséget!'],
    x10: ['Multiplica por diez.', 'Szorozd meg tízzel!'], x100: ['Multiplica por cien.', 'Szorozd meg százzal!'],
    ops: ['Primero la multiplicación, después la suma.', 'Először a szorzás, utána az összeadás!'], ops_par: ['Primero el paréntesis.', 'Először a zárójel!'],
    share: ['Repartimos en partes iguales. ¿Cuánto le toca a cada uno?', 'Egyenlően osztjuk szét. Mennyi jut egynek?'],
    div: ['¿Cuál es el resultado de la división?', 'Mennyi az osztás eredménye?'],
    rem: ['Divide. Escribe el cociente y el resto.', 'Oszd el! Írd be a hányadost és a maradékot!'],
    parity: ['¿Es par o impar?', 'Páros vagy páratlan?'],
    frac_pic: ['¿Qué fracción está coloreada?', 'Mekkora rész van kiszínezve?'],
    frac_name: ['¿Qué fracción es?', 'Melyik tört ez?'],
    part: ['Calcula la parte.', 'Számold ki a részt!'],
    conv: ['Cambia la unidad.', 'Váltsd át!'],
    clock: ['¿Qué hora es?', 'Hány óra van?'],
    money: ['¿Cuánto dinero hay en total?', 'Mennyi pénz van összesen?'],
    unit: ['¿Qué unidad usamos para medirlo?', 'Melyik mértékegységgel mérjük?'],
    lineobj: ['¿Es una recta, una semirrecta o un segmento?', 'Egyenes, félegyenes vagy szakasz?'],
    angle: ['¿Cómo es este ángulo?', 'Milyen ez a szög?'],
    grid: ['¿En qué casilla está?', 'Melyik mezőben van?'],
    sides: ['¿Cuántos lados tiene?', 'Hány oldala van?'],
    tri: ['¿Qué tipo de triángulo es?', 'Milyen háromszög ez?'],
    solid: ['¿Qué cuerpo geométrico es?', 'Melyik test ez?'],
    bars: ['Mira el gráfico y responde.', 'Nézd meg a diagramot, és válaszolj!'],
    prob: ['¿Es seguro, posible o imposible?', 'Biztos, lehetséges vagy lehetetlen?'],
    ui_intro: ['Elige el modo y los temas, y ¡a por ello!', 'Válassz módot és témát, aztán rajta! Ha nem tudod, nyomd meg a Passz gombot.'],
    ui_again: ['Las preguntas que has pasado, otra vez.', 'A passzolt kérdések jönnek még egyszer!'],
    ui_rocket: ['¡Diez seguidas! ¡Cohete!', 'Tíz jó egymás után! Rakéta!'],
    ui_villam: ['¡Un minuto! ¡Rápido!', 'Egy perc! Gyorsan, csak számok!'],
    ui_fix: ['Vamos a corregir los errores.', 'Javítsuk ki, ami eddig nem ment!'],
    ui_exam: ['Prueba del examen: preguntas variadas.', 'Dolgozat-próba: vegyes feladatok a dolgozat anyagából.'],
    ui_record: ['¡Nuevo récord!', 'Új rekord!']
  };
  const rnd = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const shuf = (r, a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const NK = (n, l) => (root.MathGen && root.MathGen.numKeys && n >= 0 && n <= 9999 && n === Math.floor(n)) ? root.MathGen.numKeys(n, l) : [];
  const nAud = (n, l) => NK(n, l).map(k => ({ l, k, t: String(n), gap: 20 }));
  function aud(key, nums) { const a = [{ l: 'es', k: 'x:mq_' + key, t: PH[key][0], gap: 150 }]; (nums || []).forEach(n => a.push.apply(a, nAud(n, 'es'))); a.push({ l: 'hu', k: 'x:mq_' + key, t: PH[key][1], gap: 100 }); (nums || []).forEach(n => a.push.apply(a, nAud(n, 'hu'))); return a; }
  const T = (key, es, hu) => ({ es: es || PH[key][0], hu: hu || PH[key][1] });
  function choices(r, correct, cands, n) { const s = [correct]; shuf(r, cands).forEach(c => { if (s.length < n && c >= 0 && s.indexOf(c) < 0) s.push(c); }); let k = 1; while (s.length < n && k < 60) { const c = correct + k * (k % 2 ? 1 : -1); if (c >= 0 && s.indexOf(c) < 0) s.push(c); k++; } return shuf(r, s).map(v => ({ v: String(v), label: String(v) })); }
  const tri = (labels) => labels.map(o => ({ v: o[0], label: o[1], sm: o[2] || '' }));
  const range = L => L === 1 ? [10, 99] : L === 2 ? [100, 999] : [1000, 9999];
  const G = {};
  const def = (gid, unit, es, hu, fn) => { G[gid] = { gid, unit, name: [es, hu], fn }; };
  const mk = (o) => Object.assign({ level: 1 }, o, { answer: String(o.answer) });
  // ================= 1. Números de 4 cifras =================
  def('place', 'u1', 'Valor posicional', 'Helyiérték', (L, r) => { const n = rnd(r, 1000, 9999); const pos = pick(r, L === 1 ? ['um', 'c', 'u'] : ['um', 'c', 'd', 'u']); const ds = String(n).split('').map(Number); const ans = { um: ds[0], c: ds[1], d: ds[2], u: ds[3] }[pos];
    if (L === 3 && r() < .5) { const i = rnd(r, 0, 3); const v = ds[i] * Math.pow(10, 3 - i); return mk({ kind: 'num', text: { es: '¿Cuánto vale la cifra ' + ds[i] + ' en ' + n + '?', hu: 'Mennyit ér a(z) ' + ds[i] + ' számjegy a(z) ' + n + ' számban?' }, audio: aud('place_val', [n]), answer: v, vis: { type: 'digits', n: String(n), hl: i }, explain: { es: ds[i] + ' × ' + Math.pow(10, 3 - i) + ' = ' + v, hu: 'A helyén ' + ['ezres', 'százas', 'tízes', 'egyes'][i] + ' áll.' } }); }
    return mk({ kind: 'num', text: { es: PH['place_' + pos][0].replace('este número', String(n)), hu: PH['place_' + pos][1].replace('ebben a számban', 'a(z) ' + n + ' számban') }, audio: aud('place_' + pos, [n]), answer: ans, vis: { type: 'digits', n: String(n) }, explain: { es: n + ' = ' + ds[0] + ' UM + ' + ds[1] + ' C + ' + ds[2] + ' D + ' + ds[3] + ' U', hu: '' } }); });
  def('compose', 'u1', 'Componer números', 'Számkirakás', (L, r) => { const um = rnd(r, 1, 9), c = rnd(r, 0, 9), d = rnd(r, 0, 9), u = rnd(r, 0, 9); const parts = [[um, 'UM'], [c, 'C'], [d, 'D'], [u, 'U']].filter(x => x[0] || L === 1); const n = um * 1000 + c * 100 + d * 10 + u;
    const sh = L === 3 ? shuf(r, parts) : parts; return mk({ kind: 'num', text: { es: sh.map(x => x[0] + ' ' + x[1]).join(' + ') + ' = ?', hu: sh.map(x => x[0] + ' ' + { UM: 'ezres', C: 'százas', D: 'tízes', U: 'egyes' }[x[1]]).join(' + ') + ' = ?' }, audio: aud('compose'), answer: n, vis: L < 3 ? { type: 'blocks', um, c, d, u } : null, explain: { es: um * 1000 + ' + ' + c * 100 + ' + ' + d * 10 + ' + ' + u + ' = ' + n, hu: '' } }); });
  def('hear', 'u1', 'Dictado de números', 'Szám hallás után', (L, r) => { const [a, b] = range(L); const n = rnd(r, Math.max(a, L === 3 ? 1000 : a), b);
    return mk({ kind: 'num', hear: true, text: T('hear'), audio: [{ l: 'hu', k: 'x:mq_hear', t: PH.hear[1], gap: 300 }].concat(nAud(n, 'es')), answer: n, explain: { es: String(n), hu: '' } }); });
  def('compare', 'u1', 'Comparar', 'Összehasonlítás', (L, r) => { const [a0, b0] = range(L); const a = rnd(r, a0, b0); let b = r() < .15 ? a : (L === 3 && r() < .6 ? Number(String(a).split('').map((d, i) => i === rnd(r, 1, 3) ? String((+d + rnd(r, 1, 8)) % 10) : d).join('')) : rnd(r, a0, b0)); const s = a > b ? '>' : a < b ? '<' : '=';
    return mk({ kind: 'choice', text: { es: a + '  ☐  ' + b, hu: PH.compare[1] }, audio: aud('compare', [a, b]), answer: s, options: tri([['<', '<', 'kisebb'], ['=', '=', 'egyenlő'], ['>', '>', 'nagyobb']]), explain: { es: a + ' ' + s + ' ' + b, hu: 'Balról jobbra hasonlítsd a számjegyeket.' } }); });
  def('order', 'u1', 'Ordenar', 'Sorba rendezés', (L, r) => { const [a0, b0] = range(L); const base = rnd(r, a0, b0 - 999 > a0 ? b0 - 999 : b0); const set = new Set(); while (set.size < 4) set.add(L === 3 ? Number(String(rnd(r, 1, 9)) + shuf(r, ['0', String(rnd(r, 1, 9)), String(rnd(r, 0, 9))]).join('')) : rnd(r, a0, b0)); const items = Array.from(set); const desc = r() < .3;
    const sorted = items.slice().sort((x, y) => desc ? y - x : x - y); return mk({ kind: 'order', text: T(desc ? 'order_desc' : 'order_asc'), audio: aud(desc ? 'order_desc' : 'order_asc'), items: items.map(String), answer: sorted.join('|'), explain: { es: sorted.join(desc ? ' > ' : ' < '), hu: '' } }); });
  def('neigh', 'u1', 'Anterior y posterior', 'Szomszédok', (L, r) => { const [a0, b0] = range(L); let n = rnd(r, a0 + 1, b0 - 1); if (L === 3 && r() < .5) n = rnd(r, 1, 9) * 1000 + pick(r, [0, 999, 100, 990]); n = Math.min(9998, Math.max(1, n));
    return mk({ kind: 'multi', text: { es: '? ← ' + n + ' → ?', hu: PH.neigh[1] }, audio: aud('neigh', [n]), fields: [{ es: 'anterior', hu: 'előtte', ans: String(n - 1) }, { es: 'posterior', hu: 'utána', ans: String(n + 1) }], answer: (n - 1) + '|' + (n + 1), explain: { es: (n - 1) + ' · ' + n + ' · ' + (n + 1), hu: '' } }); });
  def('round', 'u1', 'Aproximar', 'Kerekítés', (L, r) => { const to = L === 1 ? 10 : L === 2 ? pick(r, [10, 100]) : pick(r, [10, 100, 1000]); const n = to === 10 ? rnd(r, 11, L === 1 ? 99 : 999) : to === 100 ? rnd(r, 101, 9899) : rnd(r, 1001, 8999); const lo = Math.floor(n / to) * to, hi = lo + to; const ans = (n - lo) >= to / 2 ? hi : lo; const k = { 10: 'round10', 100: 'round100', 1000: 'round1000' }[to];
    return mk({ kind: 'num', text: { es: PH[k][0] + '  ' + n, hu: PH[k][1] + '  ' + n }, audio: aud(k, [n]), answer: ans, vis: { type: 'roundline', lo, n, hi }, explain: { es: n + ' ≈ ' + ans, hu: (n - lo) >= to / 2 ? 'Közelebb van a nagyobbhoz (vagy pont a közepén) → felfelé.' : 'Közelebb van a kisebbhez → lefelé.' } }); });
  def('line', 'u1', 'Recta numérica', 'Számegyenes', (L, r) => { const step = L === 1 ? pick(r, [1, 2, 5]) : L === 2 ? pick(r, [5, 10, 20]) : pick(r, [50, 100, 250]); const start = L === 1 ? rnd(r, 0, 5) * step : rnd(r, 1, L === 2 ? 40 : 30) * step; const max = start + step * 10; const v = start + rnd(r, 1, 9) * step;
    return mk({ kind: 'choice', text: T('line'), audio: aud('line'), answer: v, options: choices(r, v, [v + step, v - step, v + 2 * step, v + step / 2 | 0], 3), vis: { type: 'numline', min: start, max, step, marks: [v], hide: true }, explain: { es: 'Cada rayita = ' + step, hu: 'Minden osztás ' + step + '-et ér.' } }); });
  def('coladd', 'u1', 'Suma en columna', 'Írásbeli összeadás', (L, r) => { const [a0, b0] = L === 1 ? [10, 89] : L === 2 ? [100, 899] : [1000, 8999]; const a = rnd(r, a0, b0), b = rnd(r, a0 > 99 ? a0 : 10, Math.min(b0, 9999 - a)); return mk({ kind: 'col', text: T('coladd'), audio: aud('coladd'), col: { a, b, op: '+' }, answer: a + b, explain: { es: a + ' + ' + b + ' = ' + (a + b), hu: 'Jobbról kezdj: egyesek, tízesek, százasok… ha 10 vagy több, 1 megy tovább.' } }); });
  def('colsub', 'u1', 'Resta en columna', 'Írásbeli kivonás', (L, r) => { const [a0, b0] = L === 1 ? [20, 99] : L === 2 ? [200, 999] : [2000, 9999]; const a = rnd(r, a0, b0), b = rnd(r, Math.floor(a0 / 2), a - 1); return mk({ kind: 'col', text: T('colsub'), audio: aud('colsub'), col: { a, b, op: '−' }, answer: a - b, explain: { es: a + ' − ' + b + ' = ' + (a - b) + '   (' + (a - b) + ' + ' + b + ' = ' + a + ')', hu: 'Ellenőrzés: az eredmény + a kivonandó = a kisebbítendő.' } }); });
  def('missing', 'u1', 'Número que falta', 'Hiányzó szám', (L, r) => { const [a0, b0] = range(L); const a = rnd(r, a0, b0), c = rnd(r, a, Math.min(9999, a + b0)); const t = rnd(r, 0, 2);
    if (t === 0) return mk({ kind: 'num', text: { es: a + ' + ? = ' + c, hu: PH.missing[1] }, audio: aud('missing'), answer: c - a, explain: { es: c + ' − ' + a + ' = ' + (c - a), hu: 'Kivonással megtalálod.' } });
    if (t === 1) return mk({ kind: 'num', text: { es: '? − ' + a + ' = ' + (c - a), hu: PH.missing[1] }, audio: aud('missing'), answer: c, explain: { es: (c - a) + ' + ' + a + ' = ' + c, hu: 'Összeadással megtalálod.' } });
    return mk({ kind: 'num', text: { es: c + ' − ? = ' + a, hu: PH.missing[1] }, audio: aud('missing'), answer: c - a, explain: { es: c + ' − ' + a + ' = ' + (c - a), hu: '' } }); });
  def('word1', 'u1', 'Problemas de sumar y restar', 'Szöveges feladat (+ −)', (L, r) => { const [a0, b0] = L === 1 ? [10, 60] : L === 2 ? [100, 600] : [1000, 5000]; const a = rnd(r, a0, b0), b = rnd(r, Math.floor(a0 / 2), Math.floor(b0 / 2)); const t = rnd(r, 0, 3);
    const P = [[`Nadia tiene ${a + b} € y gasta ${b} €. ¿Cuánto le queda?`, `Nadiának ${a + b} €-ja van, és elkölt ${b} €-t. Mennyi marad?`, a],
      [`En el colegio hay ${a} niños y ${b} niñas. ¿Cuántos alumnos hay?`, `Az iskolában ${a} fiú és ${b} lány van. Hány tanuló van összesen?`, a + b],
      [`Martín lee ${a} páginas el lunes y ${b} el martes. ¿Cuántas páginas lee?`, `Martin hétfőn ${a} oldalt olvas, kedden ${b}-t. Hány oldalt olvas összesen?`, a + b],
      [`Un camión lleva ${a + b} kg. Descarga ${a} kg. ¿Cuántos kg quedan?`, `Egy teherautón ${a + b} kg van. Lepakolnak ${a} kg-ot. Hány kg marad?`, b]][t];
    return mk({ kind: 'num', text: { es: P[0], hu: P[1] }, audio: aud('word'), answer: P[2], explain: { es: '= ' + P[2], hu: t === 0 || t === 3 ? 'Kivonás: elvesszük.' : 'Összeadás: összesen.' } }); });
  // ================= 2. La multiplicación =================
  let FOCUS = null;
  const tabs = L => (FOCUS && FOCUS.length) ? FOCUS : L === 1 ? [1, 2, 5, 10] : L === 2 ? [3, 4, 6, 8, 9] : [2, 3, 4, 5, 6, 7, 8, 9, 0];
  def('table', 'u2', 'Tablas de multiplicar', 'Szorzótábla', (L, r) => { const a = pick(r, tabs(L)), b = rnd(r, 0, 10); return mk({ kind: 'num', fast: true, text: { es: a + ' × ' + b + ' = ?', hu: 'Mennyi ' + a + ' × ' + b + '?' }, audio: [{ l: 'es', k: 'x:mq_cuanto', t: PH.cuanto[0] }].concat(nAud(a, 'es'), [{ l: 'es', k: 'x:mq_por', t: 'por' }], nAud(b, 'es')), answer: a * b, explain: { es: a + ' × ' + b + ' = ' + a * b, hu: b ? b + '-szer ' + a + ': ' + Array(Math.min(b, 10)).fill(a).join(' + ') : 'Nullával szorozva mindig 0.' } }); });
  def('factor', 'u2', 'Factor que falta', 'Hiányzó tényező', (L, r) => { const a = pick(r, tabs(L).filter(x => x > 0)), b = rnd(r, 1, 10); const left = r() < .5; return mk({ kind: 'num', fast: true, text: { es: left ? '? × ' + a + ' = ' + a * b : a + ' × ? = ' + a * b, hu: PH.factor[1] }, audio: aud('factor'), answer: b, explain: { es: a + ' × ' + b + ' = ' + a * b, hu: 'Keresd a ' + a + '-es táblában a ' + a * b + '-t!' } }); });
  def('rep', 'u2', 'Suma repetida', 'Összeadásból szorzás', (L, r) => { const n = rnd(r, 2, L === 1 ? 4 : 6), s = rnd(r, 2, L === 1 ? 5 : 9); const askN = r() < .5; return mk({ kind: 'num', text: { es: Array(n).fill(s).join(' + ') + ' = ' + (askN ? '? × ' + s : n + ' × ' + s + ' = ?'), hu: askN ? PH.rep[1] : 'Mennyi összesen?' }, audio: aud(askN ? 'rep' : 'groups'), answer: askN ? n : n * s, vis: { type: 'groups', n, size: s }, explain: { es: n + ' × ' + s + ' = ' + n * s, hu: n + '-szor adtuk össze a ' + s + '-öt.' } }); });
  def('groups', 'u2', 'Grupos en la imagen', 'Csoportok a képen', (L, r) => { const n = rnd(r, 2, L === 1 ? 4 : 6), s = rnd(r, 2, L === 1 ? 5 : 8); const thing = pick(r, [['cajas', 'huevos', 'doboz', 'tojás'], ['bolsas', 'canicas', 'zacskó', 'golyó'], ['platos', 'galletas', 'tányér', 'keksz'], ['coches', 'ruedas', 'autó', 'kerék']]);
    return mk({ kind: 'num', text: { es: n + ' ' + thing[0] + ' con ' + s + ' ' + thing[1] + ' cada una. ¿Cuántos ' + thing[1] + ' hay?', hu: n + ' ' + thing[2] + ', mindegyikben ' + s + ' ' + thing[3] + '. Hány ' + thing[3] + ' van összesen?' }, audio: aud('groups'), answer: n * s, vis: { type: 'groups', n, size: s }, explain: { es: n + ' × ' + s + ' = ' + n * s, hu: '' } }); });
  def('seq', 'u2', 'Series', 'Ugrás a számegyenesen', (L, r) => { const s = pick(r, tabs(L).filter(x => x > 1)); const st = L === 3 ? rnd(r, 1, 5) * s : 0; const arr = []; for (let i = 1; i <= 6; i++) arr.push(st + i * s); const h = rnd(r, 2, 5); const ans = arr[h]; const show = arr.map((x, i) => i === h ? '?' : x);
    return mk({ kind: 'num', text: { es: show.join(', '), hu: PH.seq[1] }, audio: aud('seq'), answer: ans, explain: { es: '+' + s, hu: 'Mindig ' + s + '-et ugrik.' } }); });
  def('tf', 'u2', 'Verdadero o falso', 'Igaz vagy hamis', (L, r) => { const a = pick(r, tabs(L).filter(x => x > 0)), b = rnd(r, 1, 10); const ok = r() < .5; const shown = ok ? a * b : a * b + pick(r, [a, -a, 1, -1, 2, 10]).valueOf(); const v = shown === a * b;
    return mk({ kind: 'choice', fast: true, text: { es: a + ' × ' + b + ' = ' + shown, hu: PH.tf[1] }, audio: aud('tf'), answer: v ? 'T' : 'F', options: tri([['T', 'Igaz', 'Verdadero'], ['F', 'Hamis', 'Falso']]), explain: { es: a + ' × ' + b + ' = ' + a * b, hu: '' } }); });
  def('double', 'u2', 'Doble y mitad', 'Dupla és fél', (L, r) => { const dbl = r() < .5; const n = dbl ? rnd(r, 2, L === 1 ? 20 : L === 2 ? 50 : 500) : rnd(r, 1, L === 1 ? 10 : L === 2 ? 50 : 250) * 2;
    return mk({ kind: 'num', text: { es: (dbl ? 'El doble de ' : 'La mitad de ') + n, hu: (dbl ? 'Mennyi a duplája: ' : 'Mennyi a fele: ') + n }, audio: aud(dbl ? 'double' : 'half', [n]), answer: dbl ? n * 2 : n / 2, explain: { es: dbl ? n + ' × 2 = ' + n * 2 : n + ' : 2 = ' + n / 2, hu: '' } }); });
  def('word2', 'u2', 'Problemas de multiplicar', 'Szöveges szorzás', (L, r) => { const a = rnd(r, 2, L === 1 ? 5 : 9), b = pick(r, tabs(L).filter(x => x > 1)); const t = rnd(r, 0, 2);
    const P = [[`Martín tiene ${a} cajas. En cada caja hay ${b} coches. ¿Cuántos coches tiene?`, `Martinnak ${a} doboza van, mindegyikben ${b} autó. Hány autója van?`],
      [`Una semana tiene 7 días. ¿Cuántos días hay en ${a} semanas?`, `Egy hét 7 nap. Hány nap van ${a} hétben?`, 7],
      [`Cada entrada cuesta ${b} €. ¿Cuánto cuestan ${a} entradas?`, `Egy jegy ${b} €. Mennyibe kerül ${a} jegy?`]][t]; const bb = P[2] || b;
    return mk({ kind: 'num', text: { es: P[0], hu: P[1] }, audio: aud('word'), answer: a * bb, vis: a * bb <= 60 ? { type: 'groups', n: a, size: bb } : null, explain: { es: a + ' × ' + bb + ' = ' + a * bb, hu: '' } }); });
  // ================= 3. Propiedades / multiplicar por una cifra =================
  def('comm', 'u3', 'Propiedad conmutativa', 'Felcserélés', (L, r) => { const a = rnd(r, 2, 9), b = rnd(r, 2, 9); return mk({ kind: 'num', text: { es: a + ' × ' + b + ' = ' + b + ' × ?', hu: PH.comm[1] }, audio: aud('comm'), answer: a, explain: { es: a + ' × ' + b + ' = ' + b + ' × ' + a + ' = ' + a * b, hu: 'A tényezők felcserélhetők.' } }); });
  def('x10', 'u3', 'Por 10 y por 100', 'Szorzás 10-zel, 100-zal', (L, r) => { const by = L === 1 ? 10 : pick(r, [10, 100]); const n = by === 10 ? rnd(r, 2, L === 3 ? 999 : 99) : rnd(r, 2, L === 3 ? 99 : 30); return mk({ kind: 'num', fast: true, text: { es: n + ' × ' + by + ' = ?', hu: by === 10 ? PH.x10[1] : PH.x100[1] }, audio: aud(by === 10 ? 'x10' : 'x100', [n]), answer: n * by, explain: { es: n + ' → ' + n * by, hu: by === 10 ? 'Írj egy 0-t a végére!' : 'Írj két 0-t a végére!' } }); });
  def('colmul', 'u3', 'Multiplicar en columna', 'Írásbeli szorzás', (L, r) => { const a = L === 1 ? rnd(r, 11, 49) : L === 2 ? rnd(r, 12, 99) : rnd(r, 102, 999), b = rnd(r, 2, L === 1 ? 5 : 9); return mk({ kind: 'col', text: T('colmul'), audio: aud('colmul'), col: { a, b, op: '×' }, answer: a * b, explain: { es: a + ' × ' + b + ' = ' + a * b, hu: 'Jobbról: az egyeseket szorozd, ami 10 fölött van, vidd tovább.' } }); });
  def('ops', 'u3', 'Operaciones combinadas', 'Műveleti sorrend', (L, r) => { const a = rnd(r, 1, 20), b = rnd(r, 2, 9), c = rnd(r, 2, 9); const par = L > 1 && r() < .5;
    return mk({ kind: 'num', text: { es: par ? '(' + a + ' + ' + b + ') × ' + c + ' = ?' : a + ' + ' + b + ' × ' + c + ' = ?', hu: par ? PH.ops_par[1] : PH.ops[1] }, audio: aud(par ? 'ops_par' : 'ops'), answer: par ? (a + b) * c : a + b * c, explain: { es: par ? (a + b) + ' × ' + c + ' = ' + (a + b) * c : a + ' + ' + b * c + ' = ' + (a + b * c), hu: '' } }); });
  // ================= 4. La división =================
  def('share', 'u4', 'Repartir', 'Igazságos elosztás', (L, r) => { const k = rnd(r, 2, L === 1 ? 4 : 6), e = rnd(r, 2, L === 1 ? 5 : 9); const th = pick(r, [['manzanas', 'niños', 'alma', 'gyerek'], ['caramelos', 'amigos', 'cukor', 'barát'], ['cromos', 'hermanos', 'matrica', 'testvér']]);
    return mk({ kind: 'num', text: { es: k * e + ' ' + th[0] + ' para ' + k + ' ' + th[1] + '. ¿Cuántas para cada uno?', hu: k * e + ' ' + th[2] + ' ' + k + ' ' + th[3] + ' között. Mennyi jut egynek?' }, audio: aud('share'), answer: e, vis: { type: 'groups', n: k, size: e }, explain: { es: k * e + ' : ' + k + ' = ' + e, hu: 'Mert ' + k + ' × ' + e + ' = ' + k * e + '.' } }); });
  def('div', 'u4', 'División exacta', 'Osztás', (L, r) => { const d = rnd(r, 2, L === 1 ? 5 : 9), q = rnd(r, 1, 10); return mk({ kind: 'num', fast: true, text: { es: d * q + ' : ' + d + ' = ?', hu: PH.div[1] }, audio: aud('div'), answer: q, explain: { es: d * q + ' : ' + d + ' = ' + q + '   (' + d + ' × ' + q + ' = ' + d * q + ')', hu: 'Az osztás a szorzás fordítottja.' } }); });
  def('rem', 'u4', 'División con resto', 'Maradékos osztás', (L, r) => { const d = rnd(r, 2, L === 1 ? 5 : 9), q = rnd(r, 1, 9), m = rnd(r, 1, d - 1), n = d * q + m; return mk({ kind: 'multi', text: { es: n + ' : ' + d, hu: PH.rem[1] }, audio: aud('rem'), fields: [{ es: 'cociente', hu: 'hányados', ans: String(q) }, { es: 'resto', hu: 'maradék', ans: String(m) }], answer: q + '|' + m, explain: { es: d + ' × ' + q + ' = ' + d * q + ',  ' + n + ' − ' + d * q + ' = ' + m, hu: 'A maradék mindig kisebb, mint az osztó.' } }); });
  def('parity', 'u4', 'Par o impar', 'Páros vagy páratlan', (L, r) => { const n = rnd(r, 1, L === 1 ? 99 : 9999); return mk({ kind: 'choice', fast: true, text: { es: String(n), hu: PH.parity[1] }, audio: aud('parity', [n]), answer: n % 2 ? 'I' : 'P', options: tri([['P', 'páros', 'par'], ['I', 'páratlan', 'impar']]), explain: { es: 'La última cifra: ' + (n % 10), hu: 'Az utolsó számjegy dönt: 0, 2, 4, 6, 8 → páros.' } }); });
  // ================= 5. Las fracciones =================
  const FR = { 2: ['un medio', 'egy ketted (fél)'], 3: ['un tercio', 'egy harmad'], 4: ['un cuarto', 'egy negyed'], 5: ['un quinto', 'egy ötöd'], 6: ['un sexto', 'egy hatod'], 8: ['un octavo', 'egy nyolcad'], 10: ['un décimo', 'egy tized'] };
  def('fpic', 'u5', 'Fracción coloreada', 'Kép → tört', (L, r) => { const d = pick(r, L === 1 ? [2, 3, 4] : [3, 4, 5, 6, 8]), n = rnd(r, 1, d - 1); return mk({ kind: 'multi', text: T('frac_pic'), audio: aud('frac_pic'), vis: { type: 'frac', n, d, shape: pick(r, ['circle', 'rect']) }, fields: [{ es: 'numerador', hu: 'számláló', ans: String(n) }, { es: 'denominador', hu: 'nevező', ans: String(d) }], answer: n + '|' + d, explain: { es: n + '/' + d, hu: d + ' egyenlő részből ' + n + ' színes.' } }); });
  def('fname', 'u5', 'Leer fracciones', 'Tört kiolvasása', (L, r) => { const ds = Object.keys(FR).map(Number); const d = pick(r, ds); const opts = shuf(r, ds.filter(x => x !== d)).slice(0, 2).concat([d]);
    return mk({ kind: 'choice', text: { es: '«' + FR[d][0] + '»', hu: FR[d][1] + ' – ' + PH.frac_name[1] }, audio: aud('frac_name'), answer: '1/' + d, options: shuf(r, opts).map(x => ({ v: '1/' + x, label: '1/' + x })), explain: { es: FR[d][0] + ' = 1/' + d, hu: '' } }); });
  def('fcmp', 'u5', 'Comparar fracciones', 'Törtek összehasonlítása', (L, r) => { const d = pick(r, [3, 4, 5, 6, 8]); const a = rnd(r, 1, d - 1); let b = rnd(r, 1, d - 1); const s = a > b ? '>' : a < b ? '<' : '=';
    return mk({ kind: 'choice', text: { es: a + '/' + d + '  ☐  ' + b + '/' + d, hu: PH.compare[1] }, audio: aud('compare'), answer: s, options: tri([['<', '<', 'kisebb'], ['=', '=', 'egyenlő'], ['>', '>', 'nagyobb']]), vis: { type: 'frac2', a, b, d }, explain: { es: a + '/' + d + ' ' + s + ' ' + b + '/' + d, hu: 'Azonos nevezőnél a nagyobb számláló a nagyobb.' } }); });
  def('fpart', 'u5', 'Mitad, tercio, cuarto de un número', 'Egy szám fele, harmada…', (L, r) => { const d = pick(r, [2, 3, 4, 5]), q = rnd(r, 1, L === 1 ? 5 : 10), n = d * q;
    return mk({ kind: 'num', text: { es: ({ 2: 'La mitad', 3: 'La tercera parte', 4: 'La cuarta parte', 5: 'La quinta parte' })[d] + ' de ' + n, hu: n + ' ' + ({ 2: 'fele', 3: 'harmada', 4: 'negyede', 5: 'ötöde' })[d] + ' = ?' }, audio: aud('part', [n]), answer: q, vis: n <= 40 ? { type: 'groups', n: d, size: q } : null, explain: { es: n + ' : ' + d + ' = ' + q, hu: '' } }); });
  // ================= 6. La medida =================
  def('conv', 'u6', 'Cambio de unidades', 'Átváltás', (L, r) => { const c = pick(r, L === 1 ? [['m', 'cm', 100], ['€', 'céntimos', 100], ['h', 'min', 60]] : [['m', 'cm', 100], ['km', 'm', 1000], ['kg', 'g', 1000], ['l', 'ml', 1000], ['h', 'min', 60]]); const n = rnd(r, 1, L === 3 ? 9 : 5);
    return mk({ kind: 'num', text: { es: n + ' ' + c[0] + ' = ? ' + c[1], hu: PH.conv[1] + ' ' + n + ' ' + c[0] + ' = ? ' + c[1] }, audio: aud('conv'), answer: n * c[2], explain: { es: '1 ' + c[0] + ' = ' + c[2] + ' ' + c[1], hu: n + ' × ' + c[2] + ' = ' + n * c[2] } }); });
  def('clock', 'u6', 'Leer la hora', 'Óra leolvasása', (L, r) => { const h = rnd(r, 1, 12), m = L === 1 ? pick(r, [0, 30]) : L === 2 ? pick(r, [0, 15, 30, 45]) : rnd(r, 0, 11) * 5;
    return mk({ kind: 'multi', text: T('clock'), audio: aud('clock'), vis: { type: 'clock', h, m }, fields: [{ es: 'hora', hu: 'óra', ans: String(h) }, { es: 'minutos', hu: 'perc', ans: String(m) }], answer: h + '|' + m, explain: { es: h + ':' + String(m).padStart(2, '0'), hu: 'A kis mutató az óra, a nagy a perc (minden szám 5 perc).' } }); });
  def('money', 'u6', 'Contar dinero', 'Pénz számolása', (L, r) => { const coins = L === 1 ? [1, 2, 5, 10] : [5, 10, 20, 50, 100, 200]; const list = []; for (let i = 0; i < rnd(r, 3, L === 1 ? 4 : 6); i++) list.push(pick(r, coins)); const sum = list.reduce((a, b) => a + b, 0);
    return mk({ kind: 'num', text: { es: PH.money[0] + ' (en céntimos)', hu: PH.money[1] + ' (centben)' }, audio: aud('money'), answer: sum, vis: { type: 'coins', list }, explain: { es: list.join(' + ') + ' = ' + sum + ' c', hu: '1 € = 100 cent' } }); });
  def('unit', 'u6', 'Unidad adecuada', 'Mértékegység', (L, r) => { const it = pick(r, [['la altura de una puerta', 'egy ajtó magassága', 'm'], ['el peso de una sandía', 'egy görögdinnye súlya', 'kg'], ['el agua de una botella', 'egy palack víz', 'l'], ['el largo de un lápiz', 'egy ceruza hossza', 'cm'], ['el peso de una carta', 'egy levél súlya', 'g'], ['la distancia entre dos ciudades', 'két város távolsága', 'km']]);
    const all = ['m', 'kg', 'l', 'cm', 'g', 'km']; const opts = shuf(r, all.filter(x => x !== it[2])).slice(0, 2).concat([it[2]]); return mk({ kind: 'choice', text: { es: it[0], hu: it[1] + ' – ' + PH.unit[1] }, audio: aud('unit'), answer: it[2], options: shuf(r, opts).map(x => ({ v: x, label: x })), explain: { es: it[2], hu: '' } }); });
  // ================= 7. Elementos del plano =================
  def('lineobj', 'u7', 'Recta, semirrecta, segmento', 'Egyenes, félegyenes, szakasz', (L, r) => { const t = pick(r, ['recta', 'semirrecta', 'segmento']); return mk({ kind: 'choice', text: T('lineobj'), audio: aud('lineobj'), vis: { type: 'lineobj', t }, answer: t, options: tri([['recta', 'egyenes', 'recta'], ['semirrecta', 'félegyenes', 'semirrecta'], ['segmento', 'szakasz', 'segmento']]), explain: { es: t, hu: { recta: 'Két irányban végtelen.', semirrecta: 'Egy pontból indul, egy irányban végtelen.', segmento: 'Két végpontja van.' }[t] } }); });
  def('angle', 'u7', 'Tipos de ángulos', 'Szögek', (L, r) => { const t = pick(r, ['recto', 'agudo', 'obtuso']); const deg = t === 'recto' ? 90 : t === 'agudo' ? rnd(r, 25, 70) : rnd(r, 110, 160);
    return mk({ kind: 'choice', text: T('angle'), audio: aud('angle'), vis: { type: 'angle', deg }, answer: t, options: tri([['agudo', 'hegyesszög', 'agudo'], ['recto', 'derékszög', 'recto'], ['obtuso', 'tompaszög', 'obtuso']]), explain: { es: t, hu: { recto: 'Pont mint a füzetlap sarka.', agudo: 'Kisebb a derékszögnél.', obtuso: 'Nagyobb a derékszögnél.' }[t] } }); });
  def('grid', 'u7', 'Coordenadas', 'Hol van a négyzethálón?', (L, r) => { const cols = 'ABCD', c = rnd(r, 0, 3), w = rnd(r, 1, 4); const ans = cols[c] + w; const em = pick(r, ['⭐', '🍎', '🚗', '🐱']); const opts = new Set([ans]); while (opts.size < 3) opts.add(cols[rnd(r, 0, 3)] + rnd(r, 1, 4));
    return mk({ kind: 'choice', text: T('grid'), audio: aud('grid'), vis: { type: 'grid', c, w, em }, answer: ans, options: shuf(r, Array.from(opts)).map(x => ({ v: x, label: x })), explain: { es: ans, hu: 'Előbb az oszlop betűje, aztán a sor száma.' } }); });
  // ================= 8. Figuras y cuerpos =================
  def('sides', 'u8', 'Lados de los polígonos', 'Sokszögek oldalai', (L, r) => { const p = pick(r, [[3, 'triángulo', 'háromszög'], [4, 'cuadrilátero', 'négyszög'], [5, 'pentágono', 'ötszög'], [6, 'hexágono', 'hatszög'], [8, 'octógono', 'nyolcszög']]); return mk({ kind: 'num', fast: true, text: { es: '¿Cuántos lados tiene un ' + p[1] + '?', hu: 'Hány oldala van: ' + p[2] + '?' }, audio: aud('sides'), answer: p[0], vis: { type: 'poly', n: p[0] }, explain: { es: p[1] + ': ' + p[0] + ' lados', hu: '' } }); });
  def('tri', 'u8', 'Clases de triángulos', 'Háromszögek', (L, r) => { const t = pick(r, ['equilátero', 'isósceles', 'escaleno']); const a = rnd(r, 3, 9); const s = t === 'equilátero' ? [a, a, a] : t === 'isósceles' ? [a, a, a + rnd(r, 1, 3)] : [a, a + 1, a + 3];
    return mk({ kind: 'choice', text: { es: 'Lados: ' + s.join(' cm, ') + ' cm', hu: PH.tri[1] + ' Oldalai: ' + s.join(', ') + ' cm' }, audio: aud('tri'), answer: t, options: tri([['equilátero', 'egyenlő oldalú', 'equilátero'], ['isósceles', 'egyenlő szárú', 'isósceles'], ['escaleno', 'különböző oldalú', 'escaleno']]), explain: { es: t, hu: { 'equilátero': 'Mind a 3 oldal egyforma.', 'isósceles': '2 oldal egyforma.', 'escaleno': 'Mindhárom oldal különböző.' }[t] } }); });
  def('solid', 'u8', 'Cuerpos geométricos', 'Testek', (L, r) => { const t = pick(r, ['cubo', 'esfera', 'cilindro', 'cono', 'pirámide']); const all = ['cubo', 'esfera', 'cilindro', 'cono', 'pirámide']; const opts = shuf(r, all.filter(x => x !== t)).slice(0, 2).concat([t]); const HU = { cubo: 'kocka', esfera: 'gömb', cilindro: 'henger', cono: 'kúp', 'pirámide': 'gúla' };
    return mk({ kind: 'choice', text: T('solid'), audio: aud('solid'), vis: { type: 'solid', t }, answer: t, options: shuf(r, opts).map(x => ({ v: x, label: x, sm: HU[x] })), explain: { es: t, hu: HU[t] } }); });
  // ================= 9. Estadística y probabilidad =================
  def('bars', 'u9', 'Leer gráficos', 'Diagram leolvasása', (L, r) => { const cats = shuf(r, [['fútbol', 'foci'], ['baloncesto', 'kosárlabda'], ['natación', 'úszás'], ['tenis', 'tenisz']]).slice(0, L === 1 ? 3 : 4); const vals = cats.map(() => rnd(r, 1, L === 1 ? 6 : 10)); const i = rnd(r, 0, cats.length - 1); const askMax = L > 1 && r() < .4;
    if (askMax) { const mx = Math.max.apply(null, vals); const wi = vals.indexOf(mx); if (vals.filter(v => v === mx).length === 1) return mk({ kind: 'choice', text: { es: '¿Qué deporte prefieren más niños?', hu: 'Melyik sportot szeretik a legtöbben?' }, audio: aud('bars'), vis: { type: 'bars', cats: cats.map(c => c[0]), vals }, answer: cats[wi][0], options: cats.map(c => ({ v: c[0], label: c[0], sm: c[1] })), explain: { es: cats[wi][0] + ': ' + mx, hu: 'A legmagasabb oszlop.' } }); }
    return mk({ kind: 'num', text: { es: '¿Cuántos niños prefieren ' + cats[i][0] + '?', hu: 'Hány gyerek szereti: ' + cats[i][1] + '?' }, audio: aud('bars'), vis: { type: 'bars', cats: cats.map(c => c[0]), vals }, answer: vals[i], explain: { es: cats[i][0] + ': ' + vals[i], hu: '' } }); });
  def('prob', 'u9', 'Sucesos', 'Biztos, lehetséges, lehetetlen', (L, r) => { const e = pick(r, [['Sacar una bola roja de una bolsa con bolas rojas', 'Piros golyót húzni egy csak piros golyós zacskóból', 'seguro'], ['Sacar una bola azul de una bolsa con bolas rojas', 'Kék golyót húzni egy csak piros golyós zacskóból', 'imposible'], ['Sacar un 6 al tirar un dado', 'Hatost dobni egy dobókockával', 'posible'], ['Sacar un 7 al tirar un dado', 'Hetest dobni egy dobókockával', 'imposible'], ['Que mañana salga el sol por el este', 'Hogy holnap keleten kel fel a nap', 'seguro'], ['Sacar cara al lanzar una moneda', 'Fejet dobni egy pénzérmével', 'posible']]);
    return mk({ kind: 'choice', text: { es: e[0], hu: e[1] + ' – ' + PH.prob[1] }, audio: aud('prob'), answer: e[2], options: tri([['seguro', 'biztos', 'seguro'], ['posible', 'lehetséges', 'posible'], ['imposible', 'lehetetlen', 'imposible']]), explain: { es: e[2], hu: '' } }); });

  function rngFrom(seed) { if (seed == null) return Math.random; let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function make(gid, L, seed) { const g = G[gid]; if (!g) throw new Error('nincs ilyen: ' + gid); const t = g.fn(L || 1, rngFrom(seed)); t.gid = gid; t.unit = g.unit; t.level = L || 1; t.name = g.name; return t; }
  function byUnit(u) { return Object.keys(G).filter(k => G[k].unit === u); }
  const MQ = { PH, G, make, byUnit, setFocus: f => { FOCUS = f && f.length ? f.slice() : null; }, units: () => Array.from(new Set(Object.keys(G).map(k => G[k].unit))) };
  if (typeof module !== 'undefined' && module.exports) module.exports = MQ; else root.MQ = MQ;
})(typeof window !== 'undefined' ? window : globalThis);
