# usage: mkxaudio.py <subj>  -> out/x_<lang>.mp4 + out/x_sprite.json  (az új szövegek: utasítások, dicséretek, számok, spelling-szavak, események)
import sys, os, re, json, wave, subprocess, numpy as np
subj = sys.argv[1]; folder = f'/home/claude/subjects/{subj}'; sys.path.insert(0, '/home/claude/subjects/tools')
from num2words import num2words
from piper import PiperVoice
import plus_i18n as I
L = {'en': 'en', 'mat': 'es', 'lengua': 'es', 'cs': 'es', 'ns': 'en', 'ac': 'en'}[subj]
VOICES = {'es': 'es_ES-davefx-medium', 'en': 'en_GB-alba-medium', 'hu': 'hu_HU-anna-medium'}
V = {k: PiperVoice.load(f'/home/claude/vid/voices/{VOICES[k]}.onnx') for k in (L, 'hu')}
sched = json.load(open(folder + '/schedule.json')); spell = json.load(open(folder + '/spelling.json')) if os.path.exists(folder + '/spelling.json') else {'weeks': []}
items = {L: [], 'hu': []}
idx = {'hu': 0, 'en': 1, 'es': 2}
for k, v in I.T.items():
    for lang in ('hu', L):
        t = v[idx[lang]].strip()
        if t: items[lang].append(('x:' + k, t))
# számok
def nw(n, lang): return num2words(n, lang=lang)
for lang in ('hu', L):
    for n in range(100): items[lang].append((f'n:{n}', nw(n, lang)))
    for h in range(1, 10): items[lang].append((f'n:h{h*100}', nw(h * 100, lang)))
    for t in range(1, 10): items[lang].append((f'n:t{t}', nw(t * 1000, lang)))
items['es' if L == 'es' else L].append(('n:hc', 'ciento')) if L == 'es' else None
# események (csak a szöveges címek)
evs = list(sched.get('events', []))
for r in sched.get('recurring', []): evs.append(dict(r, id=r['id']))
for e in evs:
    items[L].append((f"x:ev:{e['id']}:t", re.sub(r'\s*[–—-]\s*', ', ', e['title'])))
    items['hu'].append((f"x:ev:{e['id']}:h", e['title_hu'].replace('–', ',').replace('(', ', ').replace(')', '')))
# dictado (lengua)
dic = json.load(open(folder + '/dictado.json')) if os.path.exists(folder + '/dictado.json') else {'lists': []}
for l in dic.get('lists', []):
    for x in l['words']:
        if ('x:sp:' + x['w']) in [k for k, _ in items[L]]: continue
        items[L].append(('x:sp:' + x['w'], x['w'])); items['hu'].append(('x:sph:' + x['w'], x['hu'].replace('/', ',')))
# spelling
seen = set()
for w in spell.get('weeks', []):
    for x in w['words']:
        if x['w'] in seen: continue
        seen.add(x['w']); items[L].append(('x:sp:' + x['w'], x['w'])); items['hu'].append(('x:sph:' + x['w'], x['hu']))
SR = 22050; sprite = {}
for lang in (L, 'hu'):
    v = V[lang]; parts = []; pos = 0.0; m = {}; gap = np.zeros(int(SR * 0.25), np.int16)
    for key, txt in items[lang]:
        if key in m: continue
        tmp = f'/tmp/_x_{subj}.wav'
        with wave.open(tmp, 'wb') as w: v.synthesize_wav(txt, w)
        with wave.open(tmp) as w: sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), np.int16)
        if sr != SR: a = np.interp(np.linspace(0, len(a), int(len(a) * SR / sr), endpoint=False), np.arange(len(a)), a).astype(np.int16)
        m[key] = [round(pos, 3), round(len(a) / SR, 3)]; parts += [a, gap]; pos += (len(a) + len(gap)) / SR
    wavp = f'{folder}/out/x_{lang}.wav'
    with wave.open(wavp, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.concatenate(parts).tobytes())
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wavp, '-ac', '1', '-ar', '22050', '-c:a', 'aac', '-b:a', '32k', '-movflags', '+faststart', f'{folder}/out/x_{lang}.mp4'], check=True)
    os.remove(wavp); sprite[lang] = m; print(lang, round(pos), 's', len(m), flush=True)
json.dump(sprite, open(folder + '/out/x_sprite.json', 'w'), ensure_ascii=False); print('DONE')
