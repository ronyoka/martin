# usage: mkpgaudio.py <subj>  -> out/pg_<unit>_<lang>.mp4 + out/pg_sprite.json  (könyvoldalak hangja, fejezetenként külön sprite; klip-cache: /home/claude/pgcache)
import sys, os, re, json, wave, subprocess, hashlib, numpy as np
subj = sys.argv[1]; folder = f'/home/claude/subjects/{subj}'
from num2words import num2words
from piper import PiperVoice
L = {'en': 'en', 'mat': 'es', 'lengua': 'es', 'cs': 'es', 'ns': 'en', 'ac': 'en'}[subj]
VOICES = {'es': 'es_ES-davefx-medium', 'en': 'en_GB-alba-medium', 'hu': 'hu_HU-anna-medium'}
V = {}
def voice(l):
    if l not in V: V[l] = PiperVoice.load(f'/home/claude/vid/voices/{VOICES[l]}.onnx')
    return V[l]
OPS = {'es': {'×': ' por ', '·': ' por ', '+': ' más ', '−': ' menos ', '=': ' es igual a ', '>': ' es mayor que ', '<': ' es menor que ', ':': ' entre '},
       'hu': {'×': ' szorozva ', '·': ' szorozva ', '+': ' meg ', '−': ' mínusz ', '=': ' egyenlő ', '>': ' nagyobb, mint ', '<': ' kisebb, mint ', ':': ' osztva '},
       'en': {'×': ' times ', '·': ' times ', '+': ' plus ', '−': ' minus ', '=': ' equals ', '>': ' is greater than ', '<': ' is less than '}}
EMO = re.compile('[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F\u200D\u2B00-\u2BFF]+')
def speak_text(t, l):
    t = EMO.sub(' ', str(t or ''))
    t = re.sub(r'(\d)\s(\d{3})\b', r'\1\2', t)                     # 3 450 -> 3450
    t = re.sub(r'(?<=\d)\s*-\s*(?=\d)', ' − ', t)                   # 5-3 -> 5 − 3 (csak számok között)
    if re.search(r'[=+×−<>]', t):
        t = re.sub(r'=\s*[?_…]+\s*$', '', t)                       # 7 × 3 = ?  ->  7 × 3
        t = re.sub(r'(?<![¿\w])[?_…]+(?![\w])', {'es': ' cuánto ', 'hu': ' mennyi ', 'en': ' what '}[l], t)
    t = t.replace('_', ' ')
    if l == 'es': t = re.sub(r'(\d+)\s*(UM|C|D|U)\b', lambda m: m.group(1) + ' ' + {'UM': 'unidades de millar', 'C': 'centenas', 'D': 'decenas', 'U': 'unidades'}[m.group(2)], t)
    for k, v in OPS[l].items():
        if k == ':': t = re.sub(r'(?<=\d)\s*:\s*(?=\d)', v, t)
        else: t = t.replace(k, v)
    t = re.sub(r'\b\d{1,7}\b', lambda m: num2words(int(m.group()), lang=l), t)
    t = re.sub(r'\s+', ' ', t).strip(' ,;')
    return t or '...'
P = json.load(open(folder + '/pages.json'))
items = {}  # page id -> lang -> [(key, text)]
def add(pid, l, k, t):
    if not (str(t or '')).strip(): return
    items.setdefault(pid, {L: [], 'hu': []})[l].append((k, speak_text(t, l)))
for p in P['pages']:
    i0 = p['id']; add(i0, L, 'p:t:' + i0, p['title']); add(i0, 'hu', 'p:th:' + i0, p['title_hu'])
    if p.get('summary_hu'): add(i0, 'hu', 'p:sum:' + i0, p['summary_hu'])
    for i, w in enumerate(p.get('words', [])): add(i0, L, f"p:w:{i0}:{i}", w['w']); add(i0, 'hu', f"p:wh:{i0}:{i}", re.sub(r'\([^)]*\)', '', w['hu']).replace('/', ','))
    lr = p.get('learn') or {}
    if lr.get('intro'): add(i0, L, 'p:i:' + i0, lr['intro']['es']); add(i0, 'hu', 'p:ih:' + i0, lr['intro']['hu'])
    for nm, k in (('sentences', 's'), ('remember', 'r'), ('dialogue', 'd')):
        for i, x in enumerate(lr.get(nm, [])): add(i0, L, f"p:{k}:{i0}:{i}", x['es']); add(i0, 'hu', f"p:{k}h:{i0}:{i}", x['hu'])
    for i, x in enumerate(lr.get('tf', [])):
        add(i0, L, f"p:f:{i0}:{i}", x['es']); add(i0, 'hu', f"p:fh:{i0}:{i}", x['hu'])
        add(i0, L, f"p:y:{i0}:{i}", x.get('why_es', '')); add(i0, 'hu', f"p:yh:{i0}:{i}", x.get('why_hu', ''))
    for t in p['tasks']:
        add(i0, L, 'p:k:' + t['id'], t['text']); add(i0, 'hu', 'p:kh:' + t['id'], t['text_hu'])
        if t.get('context'): add(i0, L, 'p:c:' + t['id'], t['context']['es']); add(i0, 'hu', 'p:ch:' + t['id'], t['context']['hu'])
        if t.get('help'): add(i0, L, 'p:h:' + t['id'], t['help']['es']); add(i0, 'hu', 'p:hh:' + t['id'], t['help']['hu'])
        for it in t['items']:
            add(i0, L, 'p:q:' + it['id'], it['q']); add(i0, 'hu', 'p:qh:' + it['id'], it.get('q_hu') or it['q'])
SR = 22050; CACHE = '/home/claude/pgcache'; os.makedirs(CACHE, exist_ok=True)
def clip(l, txt):
    h = hashlib.md5((l + '|' + txt).encode()).hexdigest(); f = f'{CACHE}/{h}.npy'
    if os.path.exists(f): return np.load(f)
    tmp = f'/tmp/_pg_{subj}_{l}_{os.getpid()}.wav'
    with wave.open(tmp, 'wb') as w: voice(l).synthesize_wav(txt, w)
    with wave.open(tmp) as w: sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), np.int16)
    if sr != SR: a = np.interp(np.linspace(0, len(a), int(len(a) * SR / sr), endpoint=False), np.arange(len(a)), a).astype(np.int16)
    np.save(f, a); return a
sprite = {L: {}, 'hu': {}}; audio = {}; pchunk = {}
MAXSEC = 48 * 60  # egy darab legfeljebb ~48 perc (AAC 24k ≈ 9 MB)
def dur(l, txt): return len(clip(l, txt)) / SR + 0.25
pages_order = [p['id'] for p in P['pages']]; units = {p['id']: p['unit'] for p in P['pages']}
chunks = []; cur = []; cs = 0.0; cu = None
for pid in pages_order:
    if pid not in items: continue
    d = max(sum(dur(l, t) for k, t in items[pid][l]) for l in (L, 'hu'))
    if cur and (cs + d > MAXSEC or units[pid] != cu): chunks.append(cur); cur = []; cs = 0.0
    cur.append(pid); cs += d; cu = units[pid]
if cur: chunks.append(cur)
for ci, grp in enumerate(chunks):
    cid = f"{units[grp[0]]}_{ci + 1}"; audio[cid] = {}
    for pid in grp: pchunk[pid] = cid
    for l in (L, 'hu'):
        parts = []; pos = 0.0; gap = np.zeros(int(SR * 0.25), np.int16); seen = {}
        for pid in grp:
            for k, txt in items[pid][l]:
                if txt in seen: sprite[l][k] = [seen[txt][0], seen[txt][1], cid]; continue
                a = clip(l, txt); d = round(len(a) / SR, 3); sprite[l][k] = [round(pos, 3), d, cid]; seen[txt] = (round(pos, 3), d)
                parts += [a, gap]; pos += (len(a) + len(gap)) / SR
        wavp = f'{folder}/out/pg_{cid}_{l}.wav'; mp4 = f'pg_{cid}_{l}.mp4'
        with wave.open(wavp, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.concatenate(parts).tobytes())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wavp, '-ac', '1', '-ar', '22050', '-c:a', 'aac', '-b:a', '24k', '-movflags', '+faststart', f'{folder}/out/{mp4}'], check=True)
        os.remove(wavp); audio[cid][l] = mp4; print(subj, cid, l, len(grp), 'oldal', round(pos / 60, 1), 'perc', os.path.getsize(f'{folder}/out/{mp4}') // 1024, 'KB', flush=True)
json.dump({'sprite': sprite, 'audio': audio, 'pchunk': pchunk}, open(folder + '/out/pg_sprite.json', 'w'), ensure_ascii=False, separators=(',', ':')); print('DONE', subj)
