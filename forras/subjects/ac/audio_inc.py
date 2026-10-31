import sys, os, json, wave, re, subprocess, numpy as np, importlib.util
subj=sys.argv[1]; folder=f'/home/claude/subjects/{subj}'
spec=importlib.util.spec_from_file_location('content', folder+'/content.py'); C=importlib.util.module_from_spec(spec); spec.loader.exec_module(C)
from piper import PiperVoice
L=C.SUBJECT['lang']
VOICES={'es':'es_ES-davefx-medium','en':'en_GB-alba-medium','hu':'hu_HU-anna-medium'}
V={k:PiperVoice.load(f'/home/claude/vid/voices/{VOICES[k]}.onnx') for k in (L,'hu')}
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
SR=22050; os.makedirs(folder+'/out',exist_ok=True)
lang=sys.argv[2]
OLD='/tmp/claude-0/ac_out_bak'
osp=json.load(open(OLD+'/sprite.json'))[lang]
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{OLD}/{subj}_{lang}.mp4','-ac','1','-ar','22050','-f','s16le','/tmp/claude-0/old_%s.raw'%lang],check=True)
old=np.fromfile('/tmp/claude-0/old_%s.raw'%lang,np.int16)
def reuse(key):
    if key not in osp: return None
    if re.match(r'^[sd]:a[23]_',key): return None
    s,d=osp[key]; return old[int(round(s*SR)):int(round((s+d)*SR))]
v=V[lang]; parts=[]; pos=0.0; m={}; gap=np.zeros(int(SR*0.35),np.int16); nre=nnew=0
for key,txt in items[lang]:
    a=reuse(key)
    if a is not None: nre+=1
    else:
        nnew+=1; tmp=f'/tmp/claude-0/_p_ac_{lang}.wav'
        for _try in range(8):
            try:
                with wave.open(tmp,'wb') as w: v.synthesize_wav(txt,w)
                with wave.open(tmp) as w:
                    sr=w.getframerate(); a=np.frombuffer(w.readframes(w.getnframes()),np.int16)
                if len(a)>0: break
            except Exception as ex:
                print('retry',key,ex,flush=True)
        if sr!=SR: a=np.interp(np.linspace(0,len(a),int(len(a)*SR/sr),endpoint=False),np.arange(len(a)),a).astype(np.int16)
    m[key]=[round(pos,3), round(len(a)/SR,3)]; parts+=[a,gap]; pos+=(len(a)+len(gap))/SR
buf=np.concatenate(parts); wavp=f'/tmp/claude-0/ac_{lang}.wav'
with wave.open(wavp,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(buf.tobytes())
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',wavp,'-ac','1','-ar','22050','-c:a','aac','-b:a','40k','-movflags','+faststart',f'{folder}/out/{subj}_{lang}.mp4'],check=True)
os.remove(wavp); json.dump(m,open(f'{folder}/out/sprite_{lang}.json','w'),ensure_ascii=False)
print(lang, round(pos), 's', len(m), 'reused',nre,'new',nnew, flush=True)
