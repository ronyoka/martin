# usage: build.py <subj> <blobs.json> <audio_es_blob> <audio_hu_blob>  -> writes out/<subj>_data.json
import sys, json, re, unicodedata, importlib.util
subj=sys.argv[1]; folder=f'/home/claude/subjects/{subj}'
spec=importlib.util.spec_from_file_location('content', folder+'/content.py'); C=importlib.util.module_from_spec(spec); spec.loader.exec_module(C)
blobs=json.load(open(sys.argv[2])); L=C.SUBJECT['lang']
B=lambda k:'/_blob/'+blobs[k]
sprite=json.load(open(folder+'/out/sprite.json'))
def strip(s):
    s=s.replace('ñ','n~').replace('Ñ','N~'); s=''.join(c for c in unicodedata.normalize('NFD',s) if unicodedata.category(c)!='Mn'); return s.lower()
units=[]
for u in C.UNITS:
    cs=[dict(id=c['id'],es=c['es'],hu=c['hu'],pages=c['pages'],kind=c['kind'],img=B(c['img']),es_text=c['es_text'],hu_text=c['hu_text'],
             examples=[dict(es=a,hu=b) for a,b in c['examples']],gallery=[dict(img=B(i),es=a,hu=b) for i,a,b in c.get('gallery',[])],
             sentences=[dict(es=a,hu=b) for a,b in c.get('sentences',[])],dialogue=[dict(who=w,es=a,hu=b) for w,a,b in c.get('dialogue',[])]) for c in u['concepts']]
    units.append(dict(id=u['id'],num=u['num'],es=u['es'],hu=u['hu'],pages=u['pages'],img=B(u['img']),intro_es=u['intro_es'],intro_hu=u['intro_hu'],review=u['review'],concepts=cs))
gl=[]
for i,(es,hu,p,un) in enumerate(C.GLOSSARY):
    base=re.sub(r'^(el|la|los|las|un|una|the|a|an|to)\s+','',es); k=strip(base); letter=base[0].upper()
    letter={'Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U'}.get(letter,letter)
    if not letter.isalpha(): letter='#'
    gl.append(dict(i=i,es=es,hu=hu,page=p,unit=un,key=k,letter=letter))
gl.sort(key=lambda g:(g['letter'],g['key']))
quiz=[dict(i=i,unit=q[0],q_es=q[1],q_hu=q[2],options=q[3],answer=q[4],explain=q[5],page=q[6]) for i,q in enumerate(C.QUIZ)]
data=dict(subject=C.SUBJECT,lang=L,words=getattr(C,'WORDS',{}),audio={L:'/_blob/'+sys.argv[3],'hu':'/_blob/'+sys.argv[4]},sprite=sprite,units=units,glossary=gl,quiz=quiz,feedback=C.FEEDBACK)
json.dump(data,open(folder+f'/out/{subj}_data.json','w'),ensure_ascii=False); print(len(gl),len(quiz))
