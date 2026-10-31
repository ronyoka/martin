// node tests/test_mathgen.js  -> a generátor válaszait független számolással ellenőrzi
const G = require('../mathgen.js'); let bad = 0, n = 0;
function seeded(s) { return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
const rng = seeded(12345);
const fail = (t, m) => { bad++; if (bad < 20) console.log('HIBA', t.topic, t.level, m, JSON.stringify(t).slice(0, 300)); };
for (const topic of G.TOPICS) for (let L = 1; L <= 5; L++) for (let i = 0; i < 4000; i++) {
  const t = G.make(topic, L, rng); n++;
  const exp = G.recompute(t);
  if (String(exp) !== String(t.answer)) fail(t, 'válasz != újraszámolt ' + exp);
  if (t.kind === 'choice') {
    const vs = t.options.map(o => String(o.v)); if (new Set(vs).size !== vs.length) fail(t, 'duplikált opció');
    if (!vs.includes(String(t.answer))) fail(t, 'a helyes válasz nincs az opciók között');
    if (vs.filter(v => v === String(t.answer)).length !== 1) fail(t, 'nem egyetlen helyes');
    if (topic !== 'compare' && topic !== 'place' || (topic === 'place' && t.p.ask !== 'decomp')) { if (t.options.some(o => !(Number(o.v) >= 0))) fail(t, 'negatív opció'); }
  }
  if (!t.say.es.length || !t.say.hu.length || !t.text.es || !t.text.hu) fail(t, 'hiányzó szöveg/hang');
  // kerekítés: a válasz tényleg a legközelebbi (döntetlen: felfelé)
  if (topic === 'round') { const { n: x, u } = t.p; const lo = Math.floor(x / u) * u, hi = lo + u; const best = (x - lo) < (hi - x) ? lo : hi; if (x - lo !== hi - x && best !== t.answer) fail(t, 'kerekítés'); }
  if (topic === 'line') { const { min, max, step, target } = t.p; if (target <= min || target >= max || (target - min) % step) fail(t, 'számegyenes cél'); }
  if (topic === 'place' && t.p.ask !== 'decomp') { const s = String(t.p.n); if (s.length !== (L === 1 ? 2 : L === 2 ? 3 : 4)) fail(t, 'jegyszám'); }
  if (topic === 'mult' && t.explain.indexOf('= ' + t.answer) < 0) fail(t, 'magyarázat');
}
// szám-hangkulcsok: mindig 1-3 klip, tartomány 0..9999
for (let k = 0; k <= 9999; k++) { for (const l of ['es', 'hu']) { const ks = G.numKeys(k, l); if (!ks.length || ks.length > 3) { bad++; console.log('numKeys', k, l, ks); } } }
console.log(n + ' feladat ellenőrizve, hiba: ' + bad); process.exit(bad ? 1 : 0);
