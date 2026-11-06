# usage: mkpages.py <subj>  -> <subj>/pages.json (a pages_src/*.json részekből; lecke-hozzárendelés a content.py oldalszámaiból, csak a tankönyvnél)
import sys, os, re, json, glob, importlib.util
subj = sys.argv[1]; folder = f'/home/claude/subjects/{subj}'
BOOKS = {'mat': [('tb', 'Matemáticas 3', 'Tankönyv'), ('cu', 'Cuaderno de actividades', 'Munkafüzet')],
         'cs': [('tb', 'Ciencias Sociales 3', 'Tankönyv')],
         'lengua': [('tb', 'Lengua 3', 'Tankönyv'), ('cu', 'Cuaderno', 'Munkafüzet'), ('sb', 'Saberes básicos', 'Saberes básicos')],
         'en': [('pb', "Pupil's Book", "Pupil's Book (tankönyv)"), ('ab', 'Activity Book', 'Activity Book (munkafüzet)'), ('hb', 'Home Booklet', 'Home Booklet')],
         'ns': [], 'ac': []}[subj]
spec = importlib.util.spec_from_file_location('content', folder + '/content.py'); C = importlib.util.module_from_spec(spec)
try: spec.loader.exec_module(C)
except SystemExit: pass
def rng(s):
    m = re.findall(r'\d+', s or ''); return (int(m[0]), int(m[-1])) if m else None
lesson_of = {}
for u in C.UNITS:
    for c in u['concepts']:
        r = rng(c.get('pages'))
        if r:
            for pg in range(r[0], r[1] + 1): lesson_of.setdefault((u['id'], pg), c['id'])
pages = []
for f in sorted(glob.glob(folder + '/pages_src/*.json')): pages += json.load(open(f))['pages']
ids = set(); bad = []
for p in pages:
    if p['book'] == 'tb': p['lesson'] = lesson_of.get((p['unit'], p['page']), '')
    for t in p['tasks']:
        for it in t['items']:
            for k in (it['id'],):
                if k in ids: bad.append(k)
                ids.add(k)
            if it['kind'] == 'num' and len(str(it['answer'])) > 5: bad.append('long:' + it['id'])
def blank(o):  # aláhúzás-sorok (kitöltendő hely) -> „…” (a sablonok „__” jelölőivel ne ütközzön)
    if isinstance(o, str): return re.sub(r'_{2,}', '…', o)
    if isinstance(o, list): return [blank(x) for x in o]
    if isinstance(o, dict): return {k: blank(v) for k, v in o.items()}
    return o
pages = blank(pages)
pages.sort(key=lambda p: ([b[0] for b in BOOKS].index(p['book']), p['page']))
json.dump({'books': [dict(id=a, title=b, title_hu=c) for a, b, c in BOOKS], 'pages': pages}, open(folder + '/pages.json', 'w'), ensure_ascii=False, indent=0)
print(subj, len(pages), 'oldal;', sum(len(t['items']) for p in pages for t in p['tasks']), 'item; lecke-link:', sum(1 for p in pages if p.get('lesson')), '; hibák:', bad[:10])
