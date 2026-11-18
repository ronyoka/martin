import json,sys,re
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from xml.sax.saxutils import escape as E_
F='/usr/share/fonts/truetype/dejavu/'
for n,f in [('D','DejaVuSans.ttf'),('DB','DejaVuSans-Bold.ttf'),('DI','DejaVuSans-Oblique.ttf')]: pdfmetrics.registerFont(TTFont(n,F+f))
H1=ParagraphStyle('h1',fontName='DB',fontSize=17,leading=21,textColor=colors.HexColor('#1F4FA0'),spaceAfter=6)
H2=ParagraphStyle('h2',fontName='DB',fontSize=13,leading=16,textColor=colors.HexColor('#1F4FA0'),spaceBefore=10,spaceAfter=4)
H3=ParagraphStyle('h3',fontName='DB',fontSize=11,leading=14,textColor=colors.HexColor('#2E7D32'),spaceBefore=6,spaceAfter=2)
P=ParagraphStyle('p',fontName='D',fontSize=9.5,leading=12.5)
I=ParagraphStyle('i',fontName='DI',fontSize=9.5,leading=12.5,textColor=colors.HexColor('#444444'))
R=ParagraphStyle('r',fontName='DB',fontSize=9.5,leading=12.5,textColor=colors.HexColor('#C0392B'))
EMO=re.compile('[\U0001F000-\U0001FAFF☀-➿️‍⬀-⯿]+')
def e(t): return E_(EMO.sub('',str(t or ''))).strip()
cfg=json.load(open(sys.argv[1]))
pages=[p for p in json.load(open(cfg['pages']))['pages'] if p['unit']==cfg['unit']]
BK={'tb':'Tankönyv','cu':'Munkafüzet','sb':'Saberes básicos'}
s=[Paragraph(e(cfg['title']),H1),Paragraph(cfg['head'],P),Paragraph('A feladat (Esemtia)',H2),Paragraph(e(cfg['orig']),P),Paragraph(e(cfg['orig_hu']),I)]
s.append(Paragraph('A fejezet magyarul – áttekintés',H2))
for x in cfg['overview']: s.append(Paragraph(e(x),P))
s.append(Paragraph('Legfontosabb szabályok („Jegyezd meg!”)',H2))
seen=set()
for p in pages:
    for r in (p.get('learn') or {}).get('remember',[]):
        if r['es'] in seen: continue
        seen.add(r['es']); s.append(Paragraph(f"<b>{e(r['es'])}</b>",P)); s.append(Paragraph(e(r['hu']),I))
# glossary
W={}
for p in pages:
    for w in p.get('words',[]): W.setdefault(e(w['w']).lower(),(e(w['w']),e(w['hu'])))
s.append(Paragraph(f'Szószedet ({len(W)} szó, spanyol – magyar)',H2))
rows=[[Paragraph(a,P),Paragraph(b,I)] for k,(a,b) in sorted(W.items())]
t=Table(rows,colWidths=[235,235]); t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),0.3,colors.grey),('BACKGROUND',(0,0),(0,-1),colors.HexColor('#FFF8E1'))])); s.append(t)
s.append(PageBreak()); s.append(Paragraph('Oldalanként: tananyag és minden feladat megoldással (a szülőnek)',H2))
s.append(Paragraph('A hosszú olvasmányokat nem másoltuk be – az oldalszám alapján a könyvben olvashatók, itt mondatonkénti magyar összefoglaló van.',I))
for p in pages:
    s.append(Paragraph(f"{BK.get(p['book'],p['book'])} {p['page']}. oldal – {e(p['title'])} / {e(p['title_hu'])}",H3))
    s.append(Paragraph(e(p.get('summary_hu')),I))
    for x in (p.get('learn') or {}).get('sentences',[])[:12]:
        s.append(Paragraph(f"{e(x['es'])} <font color='#555555'><i>— {e(x['hu'])}</i></font>",P))
    for tk in p['tasks']:
        s.append(Paragraph(f"<b>{e(tk['n'])}. {e(tk['text'])}</b> <font color='#555555'><i>— {e(tk['text_hu'])}</i></font>",P))
        for it in tk['items']:
            a=it.get('answer')
            if it['kind']=='choice' and isinstance(a,int) and it.get('options'):
                o=it['options'][a]; a=o.get('t',''); 
                if o.get('hu') and o.get('hu')!=o.get('t'): a+=' ('+o['hu']+')'
            ah=it.get('answer_hu')
            ans=e(a)+(f" – {e(ah)}" if ah and ah!=a else '')
            s.append(Paragraph(f"&nbsp;&nbsp;• {e(it['q'])} <font color='#555555'><i>({e(it.get('q_hu'))})</i></font> → <font color='#C0392B'><b>{ans}</b></font>",P))
s.append(Paragraph('Most te jössz! – igaz vagy hamis? (megoldás a végén)',H2))
tfs=[]
for p in pages:
    for x in (p.get('learn') or {}).get('tf',[])[:1]: tfs.append(x)
for i,x in enumerate(tfs,1): s.append(Paragraph(f"{i}. {e(x['es'])} <font color='#555555'><i>({e(x['hu'])})</i></font>",P))
s.append(Spacer(1,6)); s.append(Paragraph('Megoldás: '+' · '.join(f"{i}. {'igaz' if x['answer'] else 'hamis'}" for i,x in enumerate(tfs,1)),I))
s.append(Paragraph(cfg['foot'],I))
SimpleDocTemplate(cfg['out'],pagesize=A4,leftMargin=36,rightMargin=36,topMargin=32,bottomMargin=32).build(s)
print('ok',len(pages),'oldal',len(W),'szó')
