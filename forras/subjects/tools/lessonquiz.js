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
