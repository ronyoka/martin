// minden generált feladat hangkulcsa létezik-e az x_sprite-ban; az i18n kulcsok, a spelling-szavak hangja
const fs = require('fs'); const G = require('../mathgen.js'); const subj = process.argv[2]; const L = subj === 'en' ? 'en' : 'es';
const X = JSON.parse(fs.readFileSync('/home/claude/subjects/' + subj + '/out/plus_data.json')); let miss = new Set();
if (subj === 'mat') for (const t of G.TOPICS) for (let lv = 1; lv <= 5; lv++) for (let i = 0; i < 1500; i++) { const k = G.make(t, lv); for (const l of ['es', 'hu']) for (const key of k.say[l]) if (!X.xsprite[l][key]) miss.add(l + ' ' + key); }
const src = fs.readFileSync('/home/claude/subjects/tools/plus.js', 'utf8'); const keys = new Set(); for (const m of src.matchAll(/(?:hu|S|bi|sayK|sayHu|sx)\('([a-z0-9_]+)'/g)) keys.add(m[1]); for (const m of src.matchAll(/'((?:i|fb|q|g|t|b|ev|part|mic|c)_[a-z_0-9]+)'/g)) keys.add(m[1]);
for (const k of keys) { if (!X.i18n[k]) miss.add('i18n ' + k); else { if (!X.xsprite.hu['x:' + k] && X.i18n[k].hu) miss.add('hu-audio ' + k); } }
for (const w of X.spelling.weeks) for (const x of w.words) { if (!X.xsprite[L]['x:sp:' + x.w]) miss.add('sp ' + x.w); if (!X.xsprite.hu['x:sph:' + x.w]) miss.add('sph ' + x.w); }
for (const e of X.schedule.events) { if (!X.xsprite[L]['x:ev:' + e.id + ':t'] || !X.xsprite.hu['x:ev:' + e.id + ':h']) miss.add('ev ' + e.id); }
for (const r of X.schedule.recurring) { if (!X.xsprite[L]['x:ev:' + r.id + ':t']) miss.add('rev ' + r.id); }
console.log(subj, 'hiányzó hangkulcsok:', miss.size, [...miss].slice(0, 20));
