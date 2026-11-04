# usage: mkhub.py <kimeneti index.html>  -> a GitHub/offline nyitóoldal: közös napi terv (Mai futam), csillagok, sorozat, matricák, jutalmak, közelgő dolgozatok
# Az adatokat a tantárgyi oldalak localStorage-ából olvassa (plus_<subj>, ugyanazon az eredeten), a menetrendet a <subj>/schedule.json-okból ágyazza be.
import sys, json, os
B = '/home/claude/subjects'
SUBJ = [  # subj, mappa, név, magyar, szín, ikon-path, meta
 ('mat', 'matematicas', 'Matemáticas 3', 'Matematika', '#2E7D5B', '<path d="M8 12h10M13 7v10M23 12h10M8 29h10M23 25l9 9M32 25l-9 9" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>', '9 fejezet · spanyol–magyar'),
 ('lengua', 'lengua', 'Lengua 3', 'Spanyol nyelv', '#C0392B', '<path d="M6 9h12q2 0 2 3v20q0-2-2-2H6z M34 9H22q-2 0-2 3v20q0-2 2-2h12z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>', '9 fejezet + diktálás · spanyol–magyar'),
 ('en', 'english', "English 3 – Kid's Box", 'Angol', '#6C3FB4', '<path d="M6 8h22a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H16l-7 6v-6H6z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><text x="17" y="21" fill="#fff" font-size="11" font-weight="900" text-anchor="middle" font-family="Arial">ABC</text>', 'Hello + 8 unit + spelling · angol–magyar'),
 ('cs', 'sociales', 'Ciencias Sociales 3', 'Társadalomismeret', '#B9770E', '<circle cx="20" cy="20" r="13" fill="none" stroke="#fff" stroke-width="3"/><path d="M7 20h26M20 7q-8 13 0 26M20 7q8 13 0 26" fill="none" stroke="#fff" stroke-width="2.5"/>', '6 fejezet · spanyol–magyar'),
 ('ns', 'natural', 'Natural Science 3', 'Természetismeret', '#1E8449', '<path d="M20 34V18M20 22q-10 0-12-12 10 0 12 12zM20 18q8 0 11-10-9 0-11 10z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>', '6 unit · angol–magyar'),
 ('ac', 'arts', 'Arts and Crafts 3', 'Rajz és kézművesség', '#D35480', '<path d="M20 6a14 14 0 1 0 0 28c3 0 3-3 1-5s0-5 3-5h4a6 6 0 0 0 6-6C34 11 28 6 20 6z" fill="none" stroke="#fff" stroke-width="3"/><circle cx="13" cy="17" r="2.5" fill="#fff"/><circle cx="20" cy="12" r="2.5" fill="#fff"/><circle cx="27" cy="15" r="2.5" fill="#fff"/>', '4 fejezet · angol–magyar'),
]
data = {}
for s, d, n, h, c, ic, m in SUBJ:
    sc = json.load(open(f'{B}/{s}/schedule.json'))
    data[s] = dict(dir=d, name=n, hu=h, color=c, events=[{k: e.get(k) for k in ('id', 'date', 'type', 'title_hu', 'units')} for e in sc.get('events', [])],
                   recurring=[{k: r.get(k) for k in ('id', 'weekday', 'type', 'title_hu', 'after', 'units')} for r in sc.get('recurring', [])])
cards = ''.join(f'''<a class="card" href="{d}/" style="--c:{c}" data-s="{s}"><div class="ico"><svg viewBox="0 0 40 40" aria-hidden="true">{ic}</svg></div><div class="name">{n}</div><div class="hu">{h}</div><div class="meta">{m}</div><div class="cstat" data-cs="{s}"></div><span class="go">Megnyitás →</span></a>''' for s, d, n, h, c, ic, m in SUBJ)
CAR = lambda col, w: f'<svg viewBox="0 0 64 36" width="{w}" height="{round(w*36/64)}" aria-hidden="true"><path d="M30 8 V2" stroke="#333" stroke-width="2"/><circle cx="30" cy="2" r="2" fill="#E86A7A"/><path d="M5 24 q2 -12 14 -12 h17 q8 0 12 8 l8 2 q4 1 4 6 v3 H5z" fill="{col}" stroke="#1E2A38" stroke-width="2" stroke-linejoin="round"/><path d="M22 14 h12 l6 6 H20z" fill="#BFE3F7" stroke="#1E2A38" stroke-width="1.5"/><circle cx="17" cy="29" r="6" fill="#333"/><circle cx="17" cy="29" r="2.5" fill="#ccc"/><circle cx="48" cy="29" r="6" fill="#333"/><circle cx="48" cy="29" r="2.5" fill="#ccc"/></svg>'
html = r'''<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Martin tanulós oldalai</title>
<style>
:root{--bg:#FFFBF3;--ink:#1E2A38;--navy:#1F4E79;--muted:#5B6B7C;--card:#FFFFFF;--line:#EADFCB;--soft:#F4EBDD}
@media (prefers-color-scheme:dark){:root{--bg:#141A22;--ink:#EEF2F6;--navy:#9CC3EA;--muted:#A6B3C2;--card:#1D2531;--line:#2C3747;--soft:#26303D}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:'Segoe UI','Nunito',system-ui,sans-serif}
header{max-width:1040px;margin:0 auto;padding:28px 16px 4px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
h1{font-family:'Segoe UI Black','Arial Black',sans-serif;font-size:clamp(26px,5vw,40px);margin:0;line-height:1.05;color:var(--navy)}
h2{font-size:24px;margin:0;color:var(--navy)}
.sub{color:var(--muted);margin:6px 0 0;font-size:17px}
.cat{flex:none;width:76px;height:76px}
main{max-width:1040px;margin:0 auto;padding:12px 16px 40px;display:flex;flex-direction:column;gap:18px}
.stats{display:flex;gap:12px;flex-wrap:wrap}
.stat{background:var(--card);border:2px solid var(--line);border-radius:18px;padding:10px 16px;display:flex;align-items:center;gap:10px;font-size:15px;color:var(--muted)}
.stat b{font-size:28px;color:var(--ink);font-family:'Segoe UI Black','Arial Black',sans-serif}
.panel{background:var(--card);border:3px solid var(--line);border-radius:24px;padding:18px;display:flex;flex-direction:column;gap:12px}
.plan{border-color:#3B82C4}
.track{position:relative;height:64px;background:repeating-linear-gradient(90deg,#DDE3E8 0 22px,#C9D1D8 22px 44px);border-radius:16px;border:2px solid #9AA7B4;margin:4px 0}
.track .flag{position:absolute;top:6px;width:4px;height:50px;background:#1E2A38}.track .flag i{position:absolute;left:4px;top:0;width:22px;height:16px;background:var(--fc,#E86A7A);border-radius:0 4px 4px 0}
.track .flag.done i{background:#6BBF59}
.track .fin{position:absolute;right:0;top:0;bottom:0;width:14px;background:repeating-linear-gradient(0deg,#222 0 7px,#fff 7px 14px);border-radius:0 14px 14px 0}
.track .car{position:absolute;bottom:4px;transition:left .8s ease-out}
.items{display:flex;flex-direction:column;gap:10px}
.item{display:flex;align-items:center;gap:12px;flex-wrap:wrap;border:2px solid var(--line);border-radius:18px;padding:10px 12px;background:var(--bg)}
.item .dot{width:44px;height:44px;border-radius:14px;background:var(--c);display:grid;place-items:center;flex:none}.item .dot svg{width:28px;height:28px}
.item .txt{flex:1 1 220px;min-width:0}.item .txt b{font-size:18px}.item .txt div{color:var(--muted);font-size:15px}
.meter{position:relative;height:12px;background:var(--soft);border-radius:999px;overflow:hidden;margin-top:6px;max-width:320px}.meter i{display:block;height:100%;border-radius:999px}
.btn{display:inline-flex;align-items:center;gap:8px;border:none;border-radius:999px;padding:12px 20px;font:inherit;font-weight:800;font-size:17px;cursor:pointer;text-decoration:none;min-height:48px}
.btn.go{background:#2E7D5B;color:#fff}.btn.done{background:#E3F4E8;color:#1D5233}.btn.l{background:var(--soft);color:var(--ink)}.btn.b{background:#1F4E79;color:#fff}
.btn:focus-visible{outline:3px solid #F2A65A;outline-offset:2px}
.allok{background:#E3F4E8;color:#1D5233;border-radius:16px;padding:12px 16px;font-weight:800;font-size:18px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px}
a.card,div.card{display:flex;flex-direction:column;gap:10px;text-decoration:none;color:inherit;background:var(--card);border:2px solid var(--line);border-radius:22px;padding:18px;position:relative;overflow:hidden;transition:transform .15s,box-shadow .15s}
a.card:hover,a.card:focus-visible{transform:translateY(-4px);box-shadow:0 10px 24px rgba(0,0,0,.12);outline:none;border-color:var(--c)}
.card::before{content:"";position:absolute;inset:0 0 auto 0;height:8px;background:var(--c)}
.ico{width:64px;height:64px;border-radius:18px;background:var(--c);display:grid;place-items:center}.ico svg{width:40px;height:40px}
.name{font-weight:900;font-size:21px;line-height:1.15}.hu{color:var(--muted);font-size:15px;margin-top:-6px}.meta,.cstat{font-size:14px;color:var(--muted)}
.card .go{margin-top:auto;align-self:flex-start;background:var(--c);color:#fff;font-weight:800;border-radius:999px;padding:8px 16px;font-size:15px}
.off{opacity:.55}.off .go{background:#8A96A3}
.tests{display:flex;flex-direction:column;gap:8px}.tests .t{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.tests .t .d{font-weight:800;min-width:90px}
.reward{border-color:#F7C948}
.par{border-style:dashed}
.par input{font:inherit;font-size:16px;padding:8px 10px;border-radius:10px;border:2px solid var(--line);background:var(--bg);color:var(--ink);min-width:0}
.par table{border-collapse:collapse;width:100%}.par td,.par th{border-bottom:1px solid var(--line);padding:6px;text-align:left}
.cele{position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.35);z-index:50}.cele.on{display:grid}
.cele div{background:var(--card);border:5px solid #F7C948;border-radius:28px;padding:24px 30px;text-align:center;max-width:90vw}
footer{max-width:1040px;margin:0 auto;padding:0 16px 32px;color:var(--muted);font-size:14px}
@media (prefers-reduced-motion:reduce){.track .car{transition:none}a.card{transition:none}}
</style>
</head>
<body>
<header>
<svg class="cat" viewBox="0 0 100 100" aria-hidden="true"><path d="M20 38 L26 10 L42 28 Z M80 38 L74 10 L58 28 Z" fill="#F4A340"/><circle cx="50" cy="56" r="34" fill="#F4A340"/><circle cx="38" cy="52" r="5" fill="#1E2A38"/><circle cx="62" cy="52" r="5" fill="#1E2A38"/><path d="M44 66 Q50 72 56 66" stroke="#1E2A38" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M50 60 l-4 -3 h8 z" fill="#E0566B"/></svg>
<div><h1>Szia Martin! Indul a mai futam!</h1><p class="sub">Teljesítsd a mai köröket, és a kék autód beér a célba.</p></div>
</header>
<main>
<div class="stats" id="stats"></div>
<section class="panel plan" aria-labelledby="planh"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h2 id="planh">Mai futam</h2><button class="btn l" id="readplan" type="button">Felolvasom</button></div>
<div class="track" id="track"></div><div class="items" id="items"></div><div id="allok"></div></section>
<section class="panel reward" id="reward" hidden></section>
<section class="panel" aria-labelledby="testh"><h2 id="testh">Közelgő dolgozatok</h2><div class="tests" id="tests"></div></section>
<div class="grid">__CARDS__
<div class="card off" style="--c:#7F8C8D" aria-disabled="true"><div class="ico"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M15 29V9l16-3v20" fill="none" stroke="#fff" stroke-width="3"/><circle cx="11" cy="29" r="4.5" fill="#fff"/><circle cx="27" cy="26" r="4.5" fill="#fff"/></svg></div><div class="name">Música y Danza 3</div><div class="hu">Ének-zene és tánc</div><div class="meta">Még nincs kész – hiányzik a könyv.</div><span class="go">Hamarosan</span></div>
</div>
<section class="panel par" id="par"><h2>Szülőknek</h2><div id="parbody"><p>Itt állíthatod be a valódi jutalmakat (pl. 50 csillag = közös társasjáték). A belépéshez oldd meg: <b id="pq"></b></p><div style="display:flex;gap:8px;flex-wrap:wrap"><input id="pa" inputmode="numeric" aria-label="Válasz"><button class="btn b" id="pgo" type="button">Belépés</button></div></div></section>
</main>
<div class="cele" id="cele" role="dialog" aria-live="polite"><div><div>__CARBIG__</div><h2>Célba értél!</h2><p style="font-size:19px">Mind a mai kört teljesítetted. Jutalom: <b>+10 csillag</b>!</p><button class="btn go" id="celeok" type="button">Szuper!</button></div></div>
<footer>Az adatok ezen az eszközön, a böngészőben tárolódnak. A szókártyák képei részben az OpenMoji projektből származnak (openmoji.org, CC BY-SA 4.0).</footer>
<script>
(function(){
const D=__DATA__;const SJ=Object.keys(D);const CAR=(c,w)=>'__CARTPL__'.replace('#COL#',c).replace('#W#',w).replace('#H#',Math.round(w*36/64));
const pad=n=>String(n).padStart(2,'0');const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());const pY=s=>{const a=s.split('-');return new Date(+a[0],a[1]-1,+a[2]);};
const today=()=>ymd(new Date());const addDays=(s,n)=>{const d=pY(s);d.setDate(d.getDate()+n);return ymd(d);};const dd=(a,b)=>Math.round((pY(b)-pY(a))/864e5);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const P={};SJ.forEach(s=>{P[s]=LS.get('plus_'+s,null)||{};});const hub=Object.assign({bonus:{},rewards:[],redeemed:[]},LS.get('martin_hub',{}));
function events(s){const sc=D[s];const t=today();const out=(sc.events||[]).map(e=>Object.assign({},e));(sc.recurring||[]).forEach(r=>{let d=addDays(r.after||t,1),n=0;while(n<6&&d<=addDays(t,60)){const g=pY(d).getDay()||7;if(g===r.weekday&&!out.some(e=>e.date===d)){out.push({id:r.id+'-'+d,date:d,type:r.type,title_hu:r.title_hu,units:r.units||[]});n++;}d=addDays(d,1);}});out.forEach(e=>e._d=dd(t,e.date));return out.filter(e=>e._d>=0).sort((a,b)=>a._d-b._d);}
function lastActive(s){const p=P[s];const ks=Object.keys(p.days||{}).filter(d=>(p.days[d].items||0)>0).concat(Object.keys(p.mission||{}));return ks.sort().pop()||'';}
function ready(s,e){const r=P[s].readyNext;return r&&e&&r.id===e.id?r.pct:null;}
function cd(n){return n===0?'ma':n===1?'holnap':n+' nap múlva';}
function totalStars(){let n=0;SJ.forEach(s=>n+=P[s].stars||0);Object.values(hub.bonus||{}).forEach(v=>n+=v||0);return n;}
function bal(){return totalStars()-(hub.redeemed||[]).reduce((a,r)=>a+(r.cost||0),0);}
function streak(){const a={};SJ.forEach(s=>{const p=P[s];Object.keys(p.days||{}).forEach(d=>{if((p.days[d].items||0)>0)a[d]=1;});Object.keys(p.mission||{}).forEach(d=>a[d]=1);});let d=today();if(!a[d])d=addDays(d,-1);let n=0,lf=null,used=false;for(let i=0;i<400;i++){if(a[d])n++;else if(n>0&&(lf===null||dd(d,lf)>=7)&&a[addDays(d,-1)]){lf=d;used=used||dd(d,today())<=7;}else break;d=addDays(d,-1);}return{n,rest:used};}
function stickers(){let n=0;SJ.forEach(s=>n+=Object.keys(P[s].stk||{}).length);return n;}
// ---- napi terv: a közeli dolgozatok előre, aztán a rég gyakorolt tantárgyak; 2–3 kör
function plan(){const t=today();const key='plan_'+t;const saved=LS.get('martin_plan',{});if(saved.day===t&&saved.items)return saved.items;
 const c=SJ.map(s=>{const e=events(s)[0];return{s,e,last:lastActive(s)};});let items=c.filter(x=>x.e&&x.e._d<=7&&!(ready(x.s,x.e)>=90)).sort((a,b)=>a.e._d-b.e._d).slice(0,3);
 if(items.length<2){c.filter(x=>items.indexOf(x)<0).sort((a,b)=>(a.last||'')<(b.last||'')?-1:1).slice(0,2-items.length).forEach(x=>items.push(x));}
 const out=items.map(x=>({s:x.s,why:x.e&&x.e._d<=7?x.e.title_hu+' – '+cd(x.e._d):'Ismétlés – rég gyakoroltad',eid:x.e&&x.e._d<=7?x.e.id:null}));LS.set('martin_plan',{day:t,items:out});return out;}
function done(s){return !!(P[s].mission&&P[s].mission[today()]);}
function render(){const t=today();const it=plan();const nd=it.filter(x=>done(x.s)).length;const st=streak();
 document.getElementById('stats').innerHTML='<div class="stat"><svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 6.9 7.5.7-5.7 5 1.8 7.4L12 18l-6.6 4 1.8-7.4-5.7-5 7.5-.7z" fill="#F7C948" stroke="#B8860B" stroke-width="1.5" stroke-linejoin="round"/></svg><b>'+totalStars()+'</b> csillag</div><div class="stat"><svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 3-7 1 1 1 2 2 3 1-2 1-5 1-8z" fill="#F2891F" stroke="#B85A12" stroke-width="1.5" stroke-linejoin="round"/></svg><b>'+st.n+'</b> napos sorozat'+(st.rest?' · pihenőnap':'')+'</div><div class="stat"><svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="#E9DDF3" stroke="#7D3C98" stroke-width="1.8"/><circle cx="9.5" cy="10" r="3" fill="#F7C948"/><path d="M6 18l4-4 3 3 2-2 3 3" stroke="#7D3C98" stroke-width="1.8" fill="none"/></svg><b>'+stickers()+'</b> matrica</div>';
 const tr=document.getElementById('track');tr.innerHTML=it.map((x,i)=>'<span class="flag'+(done(x.s)?' done':'')+'" style="left:'+((i+1)/(it.length+1)*100)+'%;--fc:'+D[x.s].color+'"><i></i></span>').join('')+'<span class="fin"></span><span class="car" style="left:calc('+(nd/it.length*100)+'% - '+Math.round(nd/it.length*64)+'px)">'+CAR('#3B82C4',64)+'</span>';
 document.getElementById('items').innerHTML=it.map((x,i)=>{const d=D[x.s];const ev=x.eid?events(x.s).find(e=>e.id===x.eid):null;const r=ready(x.s,ev);const ok=done(x.s);
  return '<div class="item" style="--c:'+d.color+'"><div class="dot"><b style="color:#fff;font-size:20px">'+(i+1)+'</b></div><div class="txt"><b>'+esc(d.name)+'</b> <span style="color:var(--muted)">· '+esc(d.hu)+'</span><div>'+esc(x.why)+'</div>'+(r!=null?'<div class="meter" title="Felkészültség '+r+'%"><i style="width:'+r+'%;background:'+(r<40?'#E86A7A':r<80?'#F2A65A':'#6BBF59')+'"></i></div><div>Felkészültség: '+r+'%</div>':'')+'</div>'+(ok?'<span class="btn done">✓ Kész</span>':'<a class="btn go" href="'+d.dir+'/?go=mission">Indulás →</a>')+'</div>';}).join('');
 const all=nd===it.length&&it.length>0;document.getElementById('allok').innerHTML=all?'<div class="allok">Célba értél! Ma minden kör kész. +10 csillag!</div>':'';
 if(all&&!hub.bonus[t]){hub.bonus[t]=10;LS.set('martin_hub',hub);document.getElementById('cele').classList.add('on');}
 // jutalom
 const rw=(hub.rewards||[]).filter(r=>r.name&&r.cost>0);const R=document.getElementById('reward');if(rw.length){const b=bal();const rd=rw.filter(r=>r.cost<=b);const nx=rw.filter(r=>r.cost>b).sort((a,c)=>a.cost-c.cost)[0];
  R.hidden=false;R.innerHTML='<h2>Jutalmak</h2>'+(rd.length?'<p style="font-size:19px;margin:0"><b>Megvan!</b> Szólj apának: '+rd.map(r=>esc(r.name)).join(', ')+'</p>':'')+(nx?'<div><b>Következő: '+esc(nx.name)+'</b> – '+Math.max(0,b)+' / '+nx.cost+' ★</div><div class="meter" style="max-width:none;height:18px"><i style="width:'+Math.min(100,Math.max(0,b)/nx.cost*100)+'%;background:#F7C948"></i></div><div style="color:var(--muted)">Még '+(nx.cost-Math.max(0,b))+' csillag kell.</div>':'');}else R.hidden=true;
 // közelgő dolgozatok
 const all2=[];SJ.forEach(s=>events(s).filter(e=>e._d<=21).forEach(e=>all2.push({s,e})));all2.sort((a,b)=>a.e._d-b.e._d);
 document.getElementById('tests').innerHTML=all2.length?all2.slice(0,8).map(o=>{const r=ready(o.s,o.e);return '<div class="t"><span class="d">'+o.e.date.slice(5).replace('-','.')+' · '+cd(o.e._d)+'</span><a href="'+D[o.s].dir+'/" style="color:'+D[o.s].color+';font-weight:800">'+esc(D[o.s].name)+'</a><span>'+esc(o.e.title_hu)+'</span>'+(r!=null?'<span style="color:var(--muted)">· felkészültség '+r+'%</span>':'')+'</div>';}).join(''):'<p>Nincs közelgő dolgozat.</p>';
 document.querySelectorAll('[data-cs]').forEach(n=>{const s=n.dataset.cs;const p=P[s];n.textContent=(p.stars?'★ '+p.stars+' csillag':'')+(done(s)?' · ma kész ✓':'');});
}
document.getElementById('celeok').onclick=()=>document.getElementById('cele').classList.remove('on');
document.getElementById('readplan').onclick=()=>{try{const it=plan();const txt='Szia Martin! Ma '+it.length+' kör vár rád. '+it.map((x,i)=>(i+1)+'. '+D[x.s].hu+': '+x.why+'.').join(' ');const u=new SpeechSynthesisUtterance(txt);u.lang='hu-HU';speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}};
// ---- szülői rész
const a1=3+Math.floor(Math.random()*7),a2=4+Math.floor(Math.random()*6);document.getElementById('pq').textContent=a1+' × '+a2+' = ?';
function parUI(){const b=document.getElementById('parbody');const rw=hub.rewards||[];
 b.innerHTML='<p>Csillagok összesen: <b>'+totalStars()+'</b> · beváltva: <b>'+(hub.redeemed||[]).reduce((a,r)=>a+(r.cost||0),0)+'</b> · egyenleg: <b>'+bal()+'</b></p>'+
 '<table><tr><th>Jutalom</th><th>Csillag</th><th></th></tr>'+rw.map((r,i)=>'<tr><td>'+esc(r.name)+'</td><td>'+r.cost+'</td><td><button class="btn l" data-red="'+i+'" type="button"'+(bal()<r.cost?' disabled':'')+'>Beváltva</button> <button class="btn l" data-del="'+i+'" type="button">Törlés</button></td></tr>').join('')+'</table>'+
 '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><input id="rn" placeholder="pl. közös társasjáték" aria-label="Jutalom neve"><input id="rc" inputmode="numeric" placeholder="csillag, pl. 50" aria-label="Ára csillagban" style="width:140px"><button class="btn b" id="radd" type="button">Hozzáadás</button></div>'+
 ((hub.redeemed||[]).length?'<p style="color:var(--muted)">Beváltott: '+hub.redeemed.slice(-8).map(r=>esc(r.name)+' ('+r.date+')').join(', ')+'</p>':'')+
 '<p style="color:var(--muted)">Tipp: az első jutalom legyen közel (kb. 2–3 nap gyakorlás = 40–60 csillag), utána nagyobbak.</p>';
 b.querySelector('#radd').onclick=()=>{const n=b.querySelector('#rn').value.trim(),c=parseInt(b.querySelector('#rc').value,10);if(!n||!(c>0))return;hub.rewards=(hub.rewards||[]).concat([{name:n,cost:c}]);LS.set('martin_hub',hub);parUI();render();};
 b.querySelectorAll('[data-del]').forEach(x=>x.onclick=()=>{hub.rewards.splice(+x.dataset.del,1);LS.set('martin_hub',hub);parUI();render();});
 b.querySelectorAll('[data-red]').forEach(x=>x.onclick=()=>{const r=hub.rewards[+x.dataset.red];hub.redeemed=(hub.redeemed||[]).concat([{name:r.name,cost:r.cost,date:today()}]);LS.set('martin_hub',hub);parUI();render();});}
document.getElementById('pgo').onclick=()=>{if(parseInt(document.getElementById('pa').value,10)===a1*a2)parUI();else document.getElementById('pa').value='';};
render();window.addEventListener('focus',()=>{SJ.forEach(s=>{P[s]=LS.get('plus_'+s,null)||{};});Object.assign(hub,LS.get('martin_hub',{}));render();});
})();
</script>
</body>
</html>
'''
cartpl = CAR('#COL#', 64).replace('width="64" height="36"', 'width="#W#" height="#H#"').replace("'", "\\'")
html = html.replace('__CARDS__', cards).replace('__DATA__', json.dumps(data, ensure_ascii=False)).replace('__CARTPL__', cartpl).replace('__CARBIG__', CAR('#3B82C4', 120))
open(sys.argv[1], 'w', encoding='utf-8').write(html); print('hub ok', len(html))
