import sys, os, json, wave, re, subprocess, numpy as np, importlib.util
subj=sys.argv[1]; folder=f'/home/claude/subjects/{subj}'
spec=importlib.util.spec_from_file_location('content', folder+'/content.py'); C=importlib.util.module_from_spec(spec); spec.loader.exec_module(C)
from piper import PiperVoice
L=C.SUBJECT['lang']
VOICES={'es':'es_ES-davefx-medium','en':'en_GB-alba-medium','hu':'hu_HU-anna-medium'}
LANG=sys.argv[2]; BR=sys.argv[3]
V={LANG:PiperVoice.load(f'/home/claude/vid/voices/{VOICES[LANG]}.onnx')}
UN_ES={'km':'kilómetros','hm':'hectómetros','dam':'decámetros','m':'metros','dm':'decímetros','cm':'centímetros','mm':'milímetros','kg':'kilogramos','hg':'hectogramos','dag':'decagramos','g':'gramos','dg':'decigramos','cg':'centigramos','mg':'miligramos','kl':'kilolitros','hl':'hectolitros','dal':'decalitros','l':'litros','dl':'decilitros','cl':'centilitros','ml':'mililitros','cts.':'céntimos','cts':'céntimos'}
UN_HU={'km':'kilométer','hm':'hektométer','dam':'dekaméter','m':'méter','dm':'deciméter','cm':'centiméter','mm':'milliméter','kg':'kilogramm','hg':'hektogramm','dag':'dekagramm','g':'gramm','dg':'decigramm','cg':'centigramm','mg':'milligramm','kl':'kiloliter','hl':'hektoliter','dal':'dekaliter','l':'liter','dl':'deciliter','cl':'centiliter','ml':'milliliter','cts.':'cent','cts':'cent'}
FR_ES={2:'medio',3:'tercio',4:'cuarto',5:'quinto',6:'sexto',7:'séptimo',8:'octavo',9:'noveno',10:'décimo'}
FR_HU={2:'ketted',3:'harmad',4:'negyed',5:'ötöd',6:'hatod',7:'heted',8:'nyolcad',9:'kilenced',10:'tized'}
def _units(t,U):
    pat=r'(\d)\s*(' + '|'.join(sorted((re.escape(k) for k in U),key=len,reverse=True)) + r')(?![A-Za-zÁ-ú])'
    def r(m):
        w=U[m.group(2)]
        if U is UN_ES and re.search(r'(?<![\d.,])1$',t[:m.start()+1]): w=w[:-1]
        return m.group(1)+' '+w
    return re.sub(pat,r,t)
def _frac(t,F,es):
    def f(m):
        n,d=int(m.group(1)),int(m.group(2))
        if d not in F: return m.group(0)
        w=F[d]
        if es: return ('un ' if n==1 else str(n)+' ')+(w if n==1 else w+'s')
        return str(n)+' '+w
    return re.sub(r'(?<![\d/])(\d{1,2})/(\d{1,2})(?![\d/])',f,t)
def nclean(t):
    t=_frac(t,FR_ES,True); t=_units(t,UN_ES)
    t=re.sub(r'(?<![\d.,])1\s*€','1 euro',t); t=t.replace('€',' euros').replace(' = ',' es igual a ').replace(' + ',' más ').replace(' > ',' es mayor que ').replace(' < ',' es menor que ')
    t=t.replace('(',', ').replace(')','').replace(';',',').replace('→',', ').replace('…',' ').replace('/',', ').replace('×',' por ').replace('−',' menos ').replace(':',' entre ' if L=='es' else ':')
    t=t.replace('≥','').replace('≤','')
    return re.sub(r'\s+',' ',t).strip()
def nclean_hu(t):
    t=_frac(t,FR_HU,False); t=_units(t,UN_HU)
    t=t.replace('€',' euró').replace(' = ',' egyenlő ').replace(' + ',' plusz ').replace(' > ',' nagyobb, mint ').replace(' < ',' kisebb, mint ')
    t=t.replace('(',', ').replace(')','').replace(';',',').replace('→',', ').replace('…',' ').replace('×',' szor ').replace('−',' mínusz ').replace(' : ',' osztva ').replace('/',' per ')
    return re.sub(r'\s+',' ',t).strip()

def oclean(t):
    t=t.replace('(',', ').replace(')','').replace(';',',').replace('→',', ').replace('…',' ').replace('/',' per ' if False else ', ').replace('×',' por ').replace('−',' menos ').replace(':',' entre ' if L=='es' else ':')
    t=t.replace('≥','').replace('≤','')
    return re.sub(r'\s+',' ',t).strip()
def oclean_hu(t):
    t=t.replace('(',', ').replace(')','').replace(';',',').replace('→',', ').replace('…',' ').replace('×',' szor ').replace('−',' mínusz ').replace(' : ',' osztva ').replace('/',' per ')
    return re.sub(r'\s+',' ',t).strip()

def build(clean,clean_hu):
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
    return items

NEW=build(nclean,nclean_hu); OLD=build(oclean,oclean_hu)
SR=22050; OD='/tmp/claude-0/mat_old'; cache=f'/home/claude/subjects/mat/cache/{LANG}'; os.makedirs(cache,exist_ok=True)
osp=json.load(open(OD+'/sprite.json'))[LANG]
raw=f'/tmp/claude-0/mat_old_{LANG}.raw'
if not os.path.exists(raw): subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{OD}/mat_{LANG}.mp4','-ac','1','-ar','22050','-f','s16le',raw],check=True)
old=np.fromfile(raw,np.int16)
import hashlib
v=V[LANG]; parts=[]; pos=0.0; m={}; gap=np.zeros(int(SR*0.35),np.int16); nre=nnew=0
oldtxt=dict(OLD[LANG])
for key,txt in NEW[LANG]:
    a=None
    if key in osp and oldtxt.get(key)==txt and not re.match(r'^[sd]:u[3-9]_',key):
        s,d=osp[key]; a=old[int(round(s*SR)):int(round((s+d)*SR))]; nre+=1
    else:
        cf=cache+'/'+hashlib.md5((key+'|'+txt).encode()).hexdigest()+'.npy'
        if os.path.exists(cf): a=np.load(cf)
        else:
            tmp=f'/tmp/_p_mat_{LANG}_inc.wav'
            for _t in range(6):
                with wave.open(tmp,'wb') as w: v.synthesize_wav(txt,w)
                with wave.open(tmp) as w: sr=w.getframerate(); a=np.frombuffer(w.readframes(w.getnframes()),np.int16)
                if len(a)>0: break
            if sr!=SR: a=np.interp(np.linspace(0,len(a),int(len(a)*SR/sr),endpoint=False),np.arange(len(a)),a).astype(np.int16)
            np.save(cf,a)
        nnew+=1
        if nnew%50==0: print(LANG,'new',nnew,flush=True)
    m[key]=[round(pos,3), round(len(a)/SR,3)]; parts+=[a,gap]; pos+=(len(a)+len(gap))/SR
buf=np.concatenate(parts); wavp=f'/tmp/_mat_{LANG}_inc.wav'
with wave.open(wavp,'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(buf.tobytes())
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',wavp,'-ac','1','-ar','22050','-c:a','aac','-b:a',BR,'-movflags','+faststart',f'/home/claude/subjects/mat/out/mat_{LANG}.mp4'],check=True)
os.remove(wavp); json.dump(m,open(f'/home/claude/subjects/mat/out/sprite_{LANG}.json','w'),ensure_ascii=False)
print('DONE',LANG,round(pos),'s',len(m),'reused',nre,'new',nnew,flush=True)
