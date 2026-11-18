import sys,json,re; sys.path.insert(0,'/home/claude/vid')
from mkvid2 import *
cfg=json.load(open(sys.argv[1])); V=json.load(open(sys.argv[2]))
EMO=re.compile('[\U0001F000-\U0001FAFF☀-➿️‍⬀-⯿]+')
def c(t): return EMO.sub('',str(t)).strip()
pages=[p for p in json.load(open(cfg['pages']))['pages'] if p['unit']==cfg['unit']]
S=[]
S.append(dict(steps=[dict(items=[dict(y=170,sz=48,b=True,text=V['t1'],c=BLUE),dict(y=260,sz=32,text=V['t2'])],say=[('hu',V['hello'])]),
 dict(items=[dict(y=370,sz=34,text=V['date'],c=RED)],say=[('hu',V['date_say'])]),
 dict(items=[dict(y=460,sz=26,text=V['book'],c=ORANGE)],say=[('hu',V['book_say'])],pause=0.8)]))
S.append(dict(head='A feladat',steps=[dict(items=[dict(y=150,sz=34,text=c(cfg['orig']))],say=[('es',V['orig_say'])]),dict(items=[dict(y=320,sz=32,text=c(cfg['orig_hu']),c=BLUE)],say=[('hu',V['orig_hu_say'])],pause=0.8)]))
for les in V['lessons']:
    st=[dict(items=[dict(y=100,sz=44,b=True,text=les['es'],c=GREEN),dict(y=160,sz=30,text=les['hu'])],say=[('es',les['es']+'.'),('hu',les['hu']+'.')])]
    y=240
    for es,hu in les['pairs']:
        st.append(dict(items=[dict(y=y,sz=28,text=es),dict(y=y+42,sz=24,text=hu,c=GREY)],say=[('es',es),('hu',hu)],pause=0.3)); y+=100
    S.append(dict(head=les.get('head','A tananyag'),steps=st))
tfs=[]
for p in pages:
    for x in (p.get('learn') or {}).get('tf',[])[:1]: tfs.append(x)
import random; random.seed(3); tfs=random.sample(tfs,min(8,len(tfs)))
S.append(dict(steps=[dict(items=[dict(y=250,sz=56,b=True,text='Most te jössz!',c=BLUE),dict(y=350,sz=32,text='Igaz vagy hamis? Gondolkodj, aztán jön a megoldás.')],say=[('hu','Most te jössz! Mondok egy állítást. Döntsd el, igaz vagy hamis!')],pause=1)]))
for i,x in enumerate(tfs,1):
    S.append(dict(head=f'Igaz vagy hamis? {i}/{len(tfs)}',steps=[dict(items=[dict(y=150,sz=34,b=True,text=c(x['es'])),dict(y=280,sz=28,text=c(x['hu']),c=GREY)],say=[('es',c(x['es'])),('hu',c(x['hu']))],pause=5),
     dict(items=[dict(y=420,sz=56,b=True,text='IGAZ' if x['answer'] else 'HAMIS',c=GREEN if x['answer'] else RED),dict(y=510,sz=24,text=c(x.get('why_hu','')),c=GREY)],say=[('hu',('Igaz. ' if x['answer'] else 'Hamis. ')+c(x.get('why_hu','')))],pause=0.8)]))
S.append(dict(steps=[dict(items=[dict(y=230,sz=56,b=True,text='Ügyes vagy, Martin!',c=GREEN)],say=[('hu','Ügyes vagy, Martin!')]),dict(items=[dict(y=340,sz=30,text=V['end'],c=RED)],say=[('hu',V['end_say'])],pause=1.5)]))
print(round(build(S,cfg['out'].replace('.pdf','.mp4'))),'s')
