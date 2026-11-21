import json,copy
src=json.load(open('/home/claude/subjects/mat/pages_src/mat_cu_u3.json'))['pages']
ps=[p for p in src if p['book']=='cu' and p['page'] in (27,28)]
P='hw1124'
def rid(o):
    if isinstance(o,dict): return {k:(v.replace(v.split('_')[0],P,1) if k=='id' and isinstance(v,str) and v.startswith('cu') else rid(v)) for k,v in o.items()}
    if isinstance(o,list): return [rid(x) for x in o]
    return o
tasks=[]; words=[]; seen=set(); S=[]; R=[]; D=[]; TF=[]
for p in ps:
    for t in p['tasks']:
        t=copy.deepcopy(t); t.pop('box',None); t=rid(t); t['text']=f"(pág. {p['page']}) "+t['text']; t['text_hu']=f"({p['page']}. o.) "+t['text_hu']; tasks.append(t)
    for w in p['words']:
        if w['w'] not in seen: seen.add(w['w']); words.append(w)
    lr=p.get('learn',{}); S+=lr.get('sentences',[]); R+=lr.get('remember',[]); TF+=lr.get('tf',[])
    if not D: D=lr.get('dialogue',[])
extra=[("multiplicar","szorozni","✖️"),("el estante","polc",""),("la caja","doboz","📦"),("el juguete","játék","🧸"),("la cesta","kosár","🧺"),("la manzana","alma","🍎"),("averigua","derítsd ki",""),("calcula","számold ki","🧮"),("relaciona","kösd össze",""),("completa","egészítsd ki","")]
for a,b,c in extra:
    if a not in seen: words.append({"w":a,"hu":b,**({"pic":c} if c else {})})
ids=[it['id'] for t in tasks for it in t['items']]; assert len(ids)==len(set(ids)),ids
page={"id":P,"book":"hw","page":1124,"date":"2026-11-24","unit":"u3","title":"Deberes: cuadernillo págs. 27 y 28 – Propiedades de la multiplicación","title_hu":"Házi: munkafüzet 27–28. o. – A szorzás tulajdonságai",
"summary_hu":"Keddre (nov. 24.): a matek munkafüzet 27. és 28. oldala. Felcserélhetőség: a tényezők sorrendje nem számít (5 × 8 = 8 × 5). Csoportosíthatóság: három számnál a zárójel helye nem számít ((3 × 2) × 5 = 3 × (2 × 5)). Itt mind a 6 feladat gyakorolható.",
"words":words,"tasks":tasks,"learn":{"intro":{"es":"¡Hoy practicamos las propiedades de la multiplicación!","hu":"Ma a szorzás tulajdonságait gyakoroljuk!"},"sentences":S,"remember":R[:4],"dialogue":D,"tf":TF[:8]}}
json.dump({"pages":[page]},open('/home/claude/subjects/mat/pages_src/mat_hw.json','w'),ensure_ascii=False,indent=1)
print('mat hw', len(tasks),'feladat',len(ids),'item',len(words),'szó', len(S),'mondat')
