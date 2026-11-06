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
def speak_text(t, l):
    t = str(t or '')
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
items = {}  # unit -> lang -> [(key, text)]
def add(u, l, k, t):
    if not (t or '').strip(): return
    items.setdefault(u, {}).setdefault(l, []).append((k, speak_text(t, l)))
for p in P['pages']:
    u = p['unit']
    add(u, L, 'p:t:' + p['id'], p['title']); add(u, 'hu', 'p:th:' + p['id'], p['title_hu'])
    for i, w in enumerate(p.get('words', [])): add(u, L, f"p:w:{p['id']}:{i}", w['w']); add(u, 'hu', f"p:wh:{p['id']}:{i}", re.sub(r'\([^)]*\)', '', w['hu']).replace('/', ','))
    for t in p['tasks']:
        add(u, L, 'p:k:' + t['id'], t['text']); add(u, 'hu', 'p:kh:' + t['id'], t['text_hu'])
        for it in t['items']:
            add(u, L, 'p:q:' + it['id'], it['q']); add(u, 'hu', 'p:qh:' + it['id'], it.get('q_hu') or it['q'])
SR = 22050; CACHE = '/home/claude/pgcache'; os.makedirs(CACHE, exist_ok=True)
def clip(l, txt):
    h = hashlib.md5((l + '|' + txt).encode()).hexdigest(); f = f'{CACHE}/{h}.npy'
    if os.path.exists(f): return np.load(f)
    tmp = f'/tmp/_pg_{subj}_{l}.wav'
    with wave.open(tmp, 'wb') as w: voice(l).synthesize_wav(txt, w)
    with wave.open(tmp) as w: sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), np.int16)
    if sr != SR: a = np.interp(np.linspace(0, len(a), int(len(a) * SR / sr), endpoint=False), np.arange(len(a)), a).astype(np.int16)
    np.save(f, a); return a
sprite = {L: {}, 'hu': {}}; audio = {}
for u in sorted(items):
    audio[u] = {}
    for l, lst in items[u].items():
        parts = []; pos = 0.0; gap = np.zeros(int(SR * 0.25), np.int16); seen = {}
        for k, txt in lst:
            if txt in seen: sprite[l][k] = [seen[txt][0], seen[txt][1], u]; continue
            a = clip(l, txt); d = round(len(a) / SR, 3); sprite[l][k] = [round(pos, 3), d, u]; seen[txt] = (round(pos, 3), d)
            parts += [a, gap]; pos += (len(a) + len(gap)) / SR
        wavp = f'{folder}/out/pg_{u}_{l}.wav'; mp4 = f'pg_{u}_{l}.mp4'
        with wave.open(wavp, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.concatenate(parts).tobytes())
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wavp, '-ac', '1', '-ar', '22050', '-c:a', 'aac', '-b:a', '32k', '-movflags', '+faststart', f'{folder}/out/{mp4}'], check=True)
        os.remove(wavp); audio[u][l] = mp4; print(subj, u, l, round(pos / 60, 1), 'perc', len(lst), 'kulcs', os.path.getsize(f'{folder}/out/{mp4}') // 1024, 'KB', flush=True)
json.dump({'sprite': sprite, 'audio': audio}, open(folder + '/out/pg_sprite.json', 'w'), ensure_ascii=False, separators=(',', ':')); print('DONE', subj)
