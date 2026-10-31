import sys, os, json, wave, re, subprocess, numpy as np, importlib.util
subj=sys.argv[1]; folder=f'/home/claude/subjects/{subj}'
spec=importlib.util.spec_from_file_location('content', folder+'/content.py'); C=importlib.util.module_from_spec(spec); spec.loader.exec_module(C)
from piper import PiperVoice
L=C.SUBJECT['lang']
VOICES={'es':'es_ES-davefx-medium','en':'en_GB-alba-medium','hu':'hu_HU-anna-medium'}
V={}
def getv(k):
    if k not in V: V[k]=PiperVoice.load(f'/home/claude/vid/voices/{VOICES[k]}.onnx')
    return V[k]
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

CODE="""items={L:[], 'hu':[]}
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
    hw=re.sub(r'\\s*\\([^)]*\\)','',hu).strip(' ;,') or re.sub(r'[()]','',hu)
    items[L].append(('w:'+w, w.replace('-',' '))); items['hu'].append(('w:'+w, clean_hu(hw)))
for i,(es,hu,p,un) in enumerate(C.GLOSSARY):
    items[L].append((f'g:{i}', clean(re.sub(r'\\s*\\([^)]*\\)','',es)))); items['hu'].append((f'g:{i}', clean_hu(hu)))
for i,q in enumerate(C.QUIZ):
    items[L].append((f'q:{i}', clean(q[1]))); items['hu'].append((f'q:{i}', clean_hu(q[2])))
items['hu']+= [('fb:ok',C.FEEDBACK['ok_hu']),('fb:bad',C.FEEDBACK['bad_hu']),('fb:end',C.FEEDBACK['end_hu'])]
items[L]+= [('fb:ok',C.FEEDBACK['ok_es']),('fb:bad',C.FEEDBACK['bad_es'])]
"""
S='/tmp/claude-0/-home-claude/c91e9d07-9d8a-5bfd-93df-7d661f144266/scratchpad/oldaudio/'
spec2=importlib.util.spec_from_file_location('content_old', folder+'/content.v3-elotte.py'); Cold=importlib.util.module_from_spec(spec2); spec2.loader.exec_module(Cold)
g={'C':Cold,'L':L,'clean':clean,'clean_hu':clean_hu,'re':re}
exec(CODE,g); olditems=g['items']
osprite=json.load(open(S+'sprite.old.json'))
OLD={}
for lang in (L,'hu'):
    raw=np.fromfile(S+f'old_{lang}.raw',np.int16); otxt=dict(olditems[lang])
    for key,txt in items[lang]:
        if key in osprite[lang] and otxt.get(key)==txt:
            st,du=osprite[lang][key]; OLD[(lang,key)]=raw[int(round(st*22050)):int(round((st+du)*22050))].copy()
    del raw
print('reusable',len(OLD),flush=True)
SR=22050; sprite={}; os.makedirs(folder+'/out',exist_ok=True)
import multiprocessing as mp
CACHE='/tmp/claude-0/-home-claude/c91e9d07-9d8a-5bfd-93df-7d661f144266/scratchpad/clipcache/'; os.makedirs(CACHE,exist_ok=True)
import hashlib
def cpath(lang,txt): return CACHE+lang+'_'+hashlib.md5(txt.encode()).hexdigest()+'.npy'
def synth(args):
    lang,i,txt=args
    if os.path.exists(cpath(lang,txt)): return (lang,i,None)
    v=getv(lang); tmp=f'/tmp/_p_{subj}_{os.getpid()}.wav'
    with wave.open(tmp,'wb') as w: v.synthesize_wav(txt,w)
    with wave.open(tmp) as w:
        sr=w.getframerate(); a=np.frombuffer(w.readframes(w.getnframes()),np.int16)
    if sr!=SR: a=np.interp(np.linspace(0,len(a),int(len(a)*SR/sr),endpoint=False),np.arange(len(a)),a).astype(np.int16)
    np.save(cpath(lang,txt)+'.tmp.npy',a); os.replace(cpath(lang,txt)+'.tmp.npy',cpath(lang,txt)); return (lang,i,None)
if __name__=='__main__':
    jobs=[(lang,i,txt) for lang in (L,'hu') for i,(key,txt) in enumerate(items[lang]) if (lang,key) not in OLD]
    res={(lang,i):OLD[(lang,key)] for lang in (L,'hu') for i,(key,txt) in enumerate(items[lang]) if (lang,key) in OLD}
    print('jobs',len(jobs),flush=True)
    from concurrent.futures import ProcessPoolExecutor
    from concurrent.futures.process import BrokenProcessPool
    todo=[j for j in jobs if not os.path.exists(cpath(j[0],j[2]))][::-1]
    while todo:
        try:
            with ProcessPoolExecutor(int(os.environ.get('NP','5'))) as ex:
                for n,_ in enumerate(ex.map(synth,todo,chunksize=4)):
                    if n%200==0: print(n,len(todo),flush=True)
        except BrokenProcessPool as e: print('broken pool, retry',flush=True)
        todo=[j for j in jobs if not os.path.exists(cpath(j[0],j[2]))][::-1]
        print('left',len(todo),flush=True)
    sys.exit(0)
    for lang in (L,'hu'):
        parts=[]; pos=0.0; m={}; gap=np.zeros(int(SR*0.28),np.int16)
        for i,(key,txt) in enumerate(items[lang]):
            a=res[(lang,i)]; m[key]=[round(pos,3), round(len(a)/SR,3)]; parts+=[a,gap]; pos+=(len(a)+len(gap))/SR
        buf=np.concatenate(parts); wavp=f'{folder}/out/{lang}.wav'
        with wave.open(wavp,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(buf.tobytes())
        out=f'{folder}/out/{subj}_{lang}.mp4'
        for br in (32,28,24,22,20,18,16):
            subprocess.run(['ffmpeg','-y','-loglevel','error','-i',wavp,'-ac','1','-ar','22050','-c:a','aac','-b:a',f'{br}k','-movflags','+faststart',out],check=True)
            sz=os.path.getsize(out); print(lang,br,'k',sz,flush=True)
            if sz<=19.6e6: break
        sprite[lang]=m; print(lang, round(pos), 's', len(m), flush=True)
    json.dump(sprite,open(folder+'/out/sprite.json','w'),ensure_ascii=False)
    print('DONE')
