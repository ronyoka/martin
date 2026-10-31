import sys, json
subj, data_blob, out = sys.argv[1], sys.argv[2], sys.argv[3]
cfg={'lengua':dict(TITLE='Lengua 3 – Martin felkészítője', SUBTITLE='Lengua Castellana y Literatura 3 (Edelvives) · spanyol – magyar · 1–9. fejezet', BOOK='Lengua 3 (Edelvives)', LANG='es', LANGNAME='spanyolul', LANGLABEL='Español', LANGCODE='ES', LISTEN='Escuchar en español', VOCAB='Vocabulario', EXAMPLES='Ejemplos', UNITWORD='UNIDAD', LANGVOICE='spanyol: davefx'),
     'mat':dict(TITLE='Matemáticas 3 – Martin felkészítője', SUBTITLE='Matemáticas 3 (Edelvives) · spanyol – magyar · 1–9. fejezet', BOOK='Matemáticas 3 (Edelvives)', LANG='es', LANGNAME='spanyolul', LANGLABEL='Español', LANGCODE='ES', LISTEN='Escuchar en español', VOCAB='Vocabulario', EXAMPLES='Ejemplos', UNITWORD='UNIDAD', LANGVOICE='spanyol: davefx'),
     'cs':dict(TITLE='Ciencias Sociales 3 – Martin felkészítője', SUBTITLE='Ciencias Sociales 3 (Edelvives) · spanyol – magyar · 1–6. fejezet', BOOK='Ciencias Sociales 3 (Edelvives)', LANG='es', LANGNAME='spanyolul', LANGLABEL='Español', LANGCODE='ES', LISTEN='Escuchar en español', VOCAB='Vocabulario', EXAMPLES='Ejemplos', UNITWORD='UNIDAD', LANGVOICE='spanyol: davefx'),
     'ns':dict(TITLE='Natural Science 3 – Martin felkészítője', SUBTITLE='Natural Science 3 (Santillana) · angol – magyar · 1–6. fejezet', BOOK='Natural Science 3 (Santillana)', LANG='en', LANGNAME='angolul', LANGLABEL='English', LANGCODE='EN', LISTEN='Listen in English', VOCAB='Vocabulary', EXAMPLES='Examples', UNITWORD='UNIT', LANGVOICE='angol: alba'),
     'ac':dict(TITLE='Arts and Crafts 3 – Martin felkészítője', SUBTITLE='Arts and Crafts 3 (Santillana) · angol – magyar · órai szavak + 1–3. fejezet', BOOK='Arts and Crafts 3 (Santillana)', LANG='en', LANGNAME='angolul', LANGLABEL='English', LANGCODE='EN', LISTEN='Listen in English', VOCAB='Vocabulary', EXAMPLES='Examples', UNITWORD='UNIT', LANGVOICE='angol: alba'),
     'en':dict(TITLE="English 3 – Kid's Box – Martin felkészítője", SUBTITLE="Kid's Box New Generation 3 (Cambridge) · angol – magyar · Hello + 1–8. fejezet", BOOK="Kid's Box 3 (Cambridge)", LANG='en', LANGNAME='angolul', LANGLABEL='English', LANGCODE='EN', LISTEN='Listen in English', VOCAB='Vocabulary', EXAMPLES='Examples', UNITWORD='UNIT', LANGVOICE='angol: alba')}[subj]
cfg['DATA_URL']='/_blob/'+data_blob
import os
pb=f'/home/claude/subjects/{subj}/plus_blobs.json'
if os.path.exists(pb):
    b=json.load(open(pb)); cfg.update(PLUS_URL='/_blob/'+b['plus_data'],PLUSJS_URL='/_blob/'+b['plus_js'],PLUSCSS_URL='/_blob/'+b['plus_css'],XLANG_URL='/_blob/'+b['x_lang'],XHU_URL='/_blob/'+b['x_hu'],SUBJ=subj)
s=open('/home/claude/subjects/tools/Main.template.html').read()
for k,v in cfg.items(): s=s.replace('__'+k+'__',v)
assert '__' not in s.replace('__import__',''), [l for l in s.split('\n') if '__' in l][:3]
open(out,'w').write(s); print('written',out)
