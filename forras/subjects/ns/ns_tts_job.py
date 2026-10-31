import sys, os, json, wave, re, subprocess, numpy as np, importlib.util
subj=sys.argv[1]; LANGSEL=sys.argv[2]; BR=sys.argv[3]; folder=f'/home/claude/subjects/{subj}'
spec=importlib.util.spec_from_file_location('content', folder+'/content.py'); C=importlib.util.module_from_spec(spec); spec.loader.exec_module(C)
from piper import PiperVoice
L=C.SUBJECT['lang']
VOICES={'es':'es_ES-davefx-medium','en':'en_GB-alba-medium','hu':'hu_HU-anna-medium'}
V={LANGSEL:PiperVoice.load(f'/home/claude/vid/voices/{VOICES[LANGSEL]}.onnx')}
def clean(t):
    t=t.replace('(',', ').replace(')','').replace(';',',').replace('→',', ').replace('…',' ').replace('/',' per ' if False else ', ').replace('×',' por ').replace('−',' menos ').replace(':',' entre ' if L=='es' else ':')
    t=t.replace('≥','').replace('≤','')
    return re.sub(r'\s+',' ',t).strip()
def clean_hu(t):
    t=t.replace('(',', ').replace(')','').replace(';',',').replace('→',', ').replace('…',' ').replace('×',' szor ').replace('−',' mínusz ').replace(' : ',' osztva ').replace('/',' per ')
    return re.sub(r'\s+',' ',t).strip()
items={L:[], 'hu':[]}
for u in C.UNITS:
    for c in u['concepts']:
        items[L].append(('c:'+c['id'], clean(c['es']+'. '+c['es_text'])))
        items['hu'].append(('c:'+c['id'], clean_hu(c['hu']+'. '+c['hu_text'])))
        items[L].append(('t:'+c['id'], clean(c['es']))); items['hu'].append(('t:'+c['id'], clean_hu(c['hu'])))
        for i,(ea,eh) in enumerate(c['examples']):
            items[L].append((f"e:{c['id']}:{i}", clean(ea))); items['hu'].append((f"e:{c['id']}:{i}", clean_hu(eh)))
        for i,(ea,eh) in enumerate(c.get('sentences',[])):
            items[L].append((f"s:{c['id']}:{i}", clean(ea))); items['hu'].append((f"s:{c['id']}:{i}", clean_hu(eh)))
        for i,(sp,ea,eh) in enumerate(c.get('dialogue',[])):
            items[L].append((f"d:{c['id']}:{i}", clean(ea))); items['hu'].append((f"d:{c['id']}:{i}", clean_hu(eh)))
    items[L].append(('u:'+u['id'], clean(u['es']+'. '+u['intro_es'])))
    items['hu'].append(('u:'+u['id'], clean_hu(u['hu']+'. '+u['intro_hu'])))
    items[L].append(('ut:'+u['id'], clean(u['es']))); items['hu'].append(('ut:'+u['id'], clean_hu(u['hu'])))
for w,hu in sorted(getattr(C,'WORDS',{}).items()):
    hw=re.sub(r'\s*\([^)]*\)','',hu).strip(' ;,') or re.sub(r'[()]','',hu)
    items[L].append(('w:'+w, w.replace('-',' '))); items['hu'].append(('w:'+w, clean_hu(hw)))
for i,(es,hu,p,un) in enumerate(C.GLOSSARY):
    items[L].append((f'g:{i}', clean(re.sub(r'\s*\([^)]*\)','',es)))); items['hu'].append((f'g:{i}', clean_hu(hu)))
for i,q in enumerate(C.QUIZ):
    items[L].append((f'q:{i}', clean(q[1]))); items['hu'].append((f'q:{i}', clean_hu(q[2])))
items['hu']+= [('fb:ok',C.FEEDBACK['ok_hu']),('fb:bad',C.FEEDBACK['bad_hu']),('fb:end',C.FEEDBACK['end_hu'])]
items[L]+= [('fb:ok',C.FEEDBACK['ok_es']),('fb:bad',C.FEEDBACK['bad_es'])]

SR=22050; folder=folder; os.makedirs(folder+'/out',exist_ok=True)
cache=f'/tmp/claude-0/ns_cache/{LANGSEL}'; os.makedirs(cache,exist_ok=True)
lang=LANGSEL; v=V[lang]; parts=[]; pos=0.0; m={}; gap=np.zeros(int(SR*0.35),np.int16)
tmp=f'/tmp/claude-0/ns_cache/_p_{lang}.wav'
for n,(key,txt) in enumerate(items[lang]):
    cp=f'{cache}/{n}.npy'
    if os.path.exists(cp) and open(cache+'/'+str(n)+'.txt').read()==txt: a=np.load(cp)
    else:
        with wave.open(tmp,'wb') as w: v.synthesize_wav(txt,w)
        with wave.open(tmp) as w:
            sr=w.getframerate(); a=np.frombuffer(w.readframes(w.getnframes()),np.int16)
        if sr!=SR: a=np.interp(np.linspace(0,len(a),int(len(a)*SR/sr),endpoint=False),np.arange(len(a)),a).astype(np.int16)
        np.save(cp,a); open(cache+'/'+str(n)+'.txt','w').write(txt)
    m[key]=[round(pos,3), round(len(a)/SR,3)]; parts+=[a,gap]; pos+=(len(a)+len(gap))/SR
    if n%200==0: print(lang,n,len(items[lang]),flush=True)
buf=np.concatenate(parts); wavp=f'{cache}/full.wav'
with wave.open(wavp,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(buf.tobytes())
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',wavp,'-ac','1','-ar','22050','-c:a','aac','-b:a',BR,'-movflags','+faststart',f'{folder}/out/{subj}_{lang}.mp4'],check=True)
json.dump(m,open(f'{folder}/out/sprite_{lang}.json','w'),ensure_ascii=False); print(lang,round(pos),'s',len(m),'DONE',flush=True)
