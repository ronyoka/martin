# usage: mkwordmp3.py <subj> <outdir>  -> egy MP3 fejezetenként: csak a szavak (idegen nyelv – magyar – idegen nyelv), Piper hangokkal
import sys, os, re, wave, subprocess, numpy as np, importlib.util
subj, outdir = sys.argv[1], sys.argv[2]; folder = f'/home/claude/subjects/{subj}'
spec = importlib.util.spec_from_file_location('content', folder + '/content.py'); C = importlib.util.module_from_spec(spec); spec.loader.exec_module(C)
from piper import PiperVoice
L = C.SUBJECT['lang']; VOICES = {'es': 'es_ES-davefx-medium', 'en': 'en_GB-alba-medium', 'hu': 'hu_HU-anna-medium'}
V = {k: PiperVoice.load(f'/home/claude/vid/voices/{VOICES[k]}.onnx') for k in (L, 'hu')}
SR = 22050; os.makedirs(outdir, exist_ok=True)
def tts(lang, text):
    tmp = f'/tmp/claude-0/_w_ac_x.wav'
    with wave.open(tmp, 'wb') as w: V[lang].synthesize_wav(text, w)
    with wave.open(tmp) as w: sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), np.int16)
    if sr != SR: a = np.interp(np.linspace(0, len(a), int(len(a) * SR / sr), endpoint=False), np.arange(len(a)), a).astype(np.int16)
    return a
def sil(sec): return np.zeros(int(SR * sec), np.int16)
def clean(t): return re.sub(r'\s+', ' ', t.replace('(', ', ').replace(')', '').replace('/', ', ').replace('…', ' ').replace(';', ',')).strip()
LANGNAME = {'en': 'angol', 'es': 'spanyol'}[L]
for u in C.UNITS:
    words = [(e, h) for e, h, p, un in C.GLOSSARY if un == u['id']]
    if not words: continue
    parts = [tts('hu', f"{u['num']}. fejezet: {clean(u['hu'])}. {len(words)} szó. Először {LANGNAME}ul, utána magyarul, majd még egyszer {LANGNAME}ul. Ismételd hangosan!"), sil(1.0)]
    parts += [tts(L, clean(u['es'])), sil(0.8)]
    for e, h in words:
        parts += [tts(L, clean(e)), sil(0.9), tts('hu', clean(h)), sil(0.7), tts(L, clean(e)), sil(1.4)]
    parts += [sil(0.5), tts('hu', 'Vége. Ügyes vagy, Martin!'), sil(0.6)]
    buf = np.concatenate(parts); wavp = f'{outdir}/_tmp.wav'
    with wave.open(wavp, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(buf.tobytes())
    name = f"{u['num']:02d} {re.sub(r'[^A-Za-z0-9 ÁÉÍÓÚÑÜáéíóúñü]', '', u['es']).strip()} - szavak ({LANGNAME}-magyar).mp3"
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wavp, '-codec:a', 'libmp3lame', '-b:a', '96k', '-metadata', f"title={u['num']}. {u['es']} – szavak", '-metadata', f"album={C.SUBJECT['title']} – szavak", '-metadata', 'artist=Martin felkészítő', f'{outdir}/{name}'], check=True)
    os.remove(wavp); print(name, round(len(buf) / SR), 's', len(words), 'szó', flush=True)
print('DONE')
