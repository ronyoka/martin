# usage: mkplus.py <subj>  -> out/plus_data.json (+ out/plus.bundle.js: mathgen.js + plus.js; out/plus.css.txt)
import sys, os, re, json, importlib.util, unicodedata
subj = sys.argv[1]; folder = f'/home/claude/subjects/{subj}'; T = '/home/claude/subjects/tools'; sys.path.insert(0, T)
import plus_i18n as I, icons_lib as IL, icons_map as IM
spec = importlib.util.spec_from_file_location('content', folder + '/content.py'); C = importlib.util.module_from_spec(spec); spec.loader.exec_module(C)
L = C.SUBJECT['lang']
def key(es):
    s = re.sub(r'\s*\([^)]*\)', '', es).split(' / ')[0].strip().lower()
    s = re.sub(r'^(el|la|los|las|un|una|the|a|an|to)\s+', '', s); return s
icons = {}
for i, (es, hu, p, un) in enumerate(C.GLOSSARY):
    k = key(es)
    svg = IM.icon_for(subj, k) if subj in IM.MAPS else (IL.ICONS if subj == 'en' else IL.M).get(k)
    if svg: icons[str(i)] = svg
ACC = [  # id, slot, ár, magyar név, svg (200x200 nézet, a cica fejéhez igazítva)
 ('flower', 'head', 5, 'Virág', '<circle cx="58" cy="44" r="9" fill="#E86A7A"/><circle cx="48" cy="52" r="9" fill="#E86A7A"/><circle cx="68" cy="52" r="9" fill="#E86A7A"/><circle cx="52" cy="64" r="9" fill="#E86A7A"/><circle cx="64" cy="64" r="9" fill="#E86A7A"/><circle cx="58" cy="55" r="7" fill="#F7C948"/>'),
 ('cap', 'head', 8, 'Sapka', '<path d="M54 58 q4 -36 46 -36 q42 0 46 36z" fill="#3B82C4" stroke="#1F4E79" stroke-width="3"/><path d="M128 54 h40 q-6 12 -40 8z" fill="#1F4E79"/><circle cx="100" cy="22" r="5" fill="#1F4E79"/>'),
 ('scarf', 'neck', 10, 'Sál', '<path d="M56 134 q44 24 88 0 l3 18 q-47 24 -94 0z" fill="#D9362B"/><path d="M118 148 l10 36 l18 -6 l-8 -34z" fill="#D9362B"/><path d="M62 142 q38 16 76 0" stroke="#fff" stroke-width="3" fill="none"/><path d="M124 168 l14 -4" stroke="#fff" stroke-width="3"/>'),
 ('glasses', 'face', 12, 'Szemüveg', '<circle cx="78" cy="94" r="17" fill="rgba(160,210,240,.35)" stroke="#333" stroke-width="4"/><circle cx="122" cy="94" r="17" fill="rgba(160,210,240,.35)" stroke="#333" stroke-width="4"/><path d="M95 94 h10 M61 90 l-12 -4 M139 90 l12 -4" stroke="#333" stroke-width="4"/>'),
 ('bow', 'neck', 12, 'Csokornyakkendő', '<path d="M100 148 l-26 -14 v28z M100 148 l26 -14 v28z" fill="#7D3C98" stroke="#4A235A" stroke-width="2"/><circle cx="100" cy="148" r="7" fill="#4A235A"/>'),
 ('party', 'head', 15, 'Parti-kalap', '<path d="M72 54 L100 2 L128 54z" fill="#7D3C98"/><path d="M80 40 h40 M88 26 h24" stroke="#F7C948" stroke-width="5"/><circle cx="100" cy="4" r="8" fill="#F7C948"/>'),
 ('medal', 'neck', 20, 'Érem', '<path d="M84 130 l16 26 l16 -26" stroke="#3B82C4" stroke-width="7" fill="none"/><circle cx="100" cy="166" r="14" fill="#F7C948" stroke="#B8860B" stroke-width="3"/><path d="M100 158 l3 6 6 1 -5 4 1 6 -5 -3 -5 3 1 -6 -5 -4 6 -1z" fill="#B8860B"/>'),
 ('sun', 'face', 20, 'Napszemüveg', '<path d="M60 84 h40 v14 q0 14 -20 14 q-20 0 -20 -14z M100 84 h40 v14 q0 14 -20 14 q-20 0 -20 -14z" fill="#222"/><path d="M98 88 h4" stroke="#222" stroke-width="5"/><path d="M68 88 l12 6" stroke="#fff" stroke-width="3" opacity=".5"/>'),
 ('tophat', 'head', 25, 'Cilinder', '<rect x="66" y="6" width="68" height="46" rx="4" fill="#222"/><rect x="48" y="48" width="104" height="10" rx="5" fill="#222"/><rect x="66" y="36" width="68" height="9" fill="#C0392B"/>'),
 ('rccar', 'ride', 30, 'Távirányítós autó', '<g transform="translate(118 150) scale(1.2)"><path d="M30 8 V2" stroke="#333" stroke-width="2"/><circle cx="30" cy="2" r="2" fill="#E86A7A"/><path d="M5 24 q2 -12 14 -12 h17 q8 0 12 8 l8 2 q4 1 4 6 v3 H5z" fill="#3B82C4" stroke="#1E2A38" stroke-width="2" stroke-linejoin="round"/><path d="M22 14 h12 l6 6 H20z" fill="#BFE3F7" stroke="#1E2A38" stroke-width="1.5"/><circle cx="17" cy="29" r="6" fill="#333"/><circle cx="48" cy="29" r="6" fill="#333"/></g>'),
 ('crown', 'head', 40, 'Korona', '<path d="M62 52 L66 14 L84 34 L100 8 L116 34 L134 14 L138 52z" fill="#F7C948" stroke="#B8860B" stroke-width="3"/><circle cx="100" cy="30" r="5" fill="#E86A7A"/><circle cx="76" cy="40" r="4" fill="#3B82C4"/><circle cx="124" cy="40" r="4" fill="#3B82C4"/>')]
acc = [dict(id=a[0], slot=a[1], price=a[2], hu=a[3], svg=a[4]) for a in ACC]
idx = {'hu': 0, 'en': 1, 'es': 2}
i18n = {}
for k, v in I.T.items():
    o = {'hu': v[0]}
    if v[1]: o['en'] = v[1]
    if v[2]: o['es'] = v[2]
    i18n[k] = o
xs = folder + '/out/x_sprite.json'
kt = open(T + '/Kitty.dc.html', encoding='utf-8').read(); ks = re.findall(r'<svg viewBox="0 0 200 200".*?</svg>', kt, re.S)
data = dict(kitty=dict(zip(('idle', 'happy', 'sad'), ks)), i18n=i18n, xsprite=json.load(open(xs)) if os.path.exists(xs) else {'hu': {}, L: {}}, icons=icons, acc=acc,
            schedule=json.load(open(folder + '/schedule.json')), links=json.load(open(folder + '/links.json')), spelling=json.load(open(folder + '/spelling.json')) if os.path.exists(folder + '/spelling.json') else {'weeks': []},
            dictado=json.load(open(folder + '/dictado.json')) if os.path.exists(folder + '/dictado.json') else {'lists': []},
            tasks=json.load(open(folder + '/tasks.json')) if os.path.exists(folder + '/tasks.json') else {'tasks': []},
            pages=json.load(open(folder + '/pages.json')) if os.path.exists(folder + '/pages.json') else {'books': [], 'pages': []})
# könyvoldalak hangja: out/pg_sprite.json; artifact-URL a pg_blobs.json-ból (fájlnév -> asset id), különben fájlnév (offline)
pgs = folder + '/out/pg_sprite.json'
if os.path.exists(pgs):
    g = json.load(open(pgs)); pb = json.load(open(folder + '/pg_blobs.json')) if os.path.exists(folder + '/pg_blobs.json') else {}
    data['pages']['sprite'] = g['sprite']; data['pages']['audio'] = {u: {l: ('/_blob/' + pb[f] if f in pb else f) for l, f in m.items()} for u, m in g['audio'].items()}
    data['pages']['pchunk'] = g.get('pchunk', {})
if data['pages'].get('pages'):
    # oldalképek: csak ha van asset-id (pg_blobs.json „img:<név>”); offline a mkstandalone teszi be (GitHubra nem)
    pb = json.load(open(folder + '/pg_blobs.json')) if os.path.exists(folder + '/pg_blobs.json') else {}
    data['pages']['imgs'] = {k[4:]: '/_blob/' + v for k, v in pb.items() if k.startswith('img:')}
    # emojik -> OpenMoji SVG (CC BY-SA 4.0)
    OM = '/home/claude/om/package/color/svg'
    def mini(svg):
        svg = re.sub(r'\s+id="[^"]*"', '', svg); svg = re.sub(r'>\s+<', '><', svg).strip(); svg = re.sub(r'(\d+\.\d)\d+', r'\1', svg)
        return svg.replace('<svg ', '<svg aria-hidden="true" ', 1)
    def graphemes(t):
        out = []; cur = ''
        for ch in t:
            o = ord(ch)
            if cur and (o in (0xFE0F, 0x200D, 0x20E3) or 0x1F3FB <= o <= 0x1F3FF or (cur.endswith('\u200d'))): cur += ch
            else:
                if cur: out.append(cur)
                cur = ch
        if cur: out.append(cur)
        return [g for g in out if ord(g[0]) > 0x2000]
    pics = set()
    def walk(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k == 'pic' and isinstance(v, str): pics.update(graphemes(v))
                else: walk(v)
        elif isinstance(o, list):
            for x in o: walk(x)
    walk(data['pages']['pages']); emo = {}; miss = []
    for g in pics:
        hx = '-'.join('%04X' % ord(c) for c in g); hx2 = '-'.join('%04X' % ord(c) for c in g if ord(c) != 0xFE0F)
        f = next((f'{OM}/{h}.svg' for h in (hx, hx2) if os.path.exists(f'{OM}/{h}.svg')), None)
        if f: emo[hx2] = mini(open(f).read())
        else: miss.append(g)
    data['pages']['emo'] = emo; print('emoji SVG:', len(emo), 'hiányzó:', ''.join(miss[:30]), sum(len(v) for v in emo.values()) // 1024, 'KB')
json.dump(data, open(folder + '/out/plus_data.json', 'w'), ensure_ascii=False, separators=(',', ':'))
open(folder + '/out/plus.bundle.js', 'w').write(open(T + '/mathgen.js').read() + '\n' + open(T + '/lessonquiz.js').read() + '\n' + open(T + '/plus.js').read())
open(folder + '/out/plus.css', 'w').write(open(T + '/plus.css').read())
print('plus_data', len(json.dumps(data)) // 1024, 'KB; ikonok:', len(icons), 'szó-kulcs-példák:', list(icons)[:5])
