# usage: checkwords.py <subj>  -> a párbeszédek szavai, amelyek hiányoznak a words.py WORDS szótárából
import sys, re, importlib.util
subj=sys.argv[1]; folder=f'/home/claude/subjects/{subj}'
spec=importlib.util.spec_from_file_location('content', folder+'/content.py'); C=importlib.util.module_from_spec(spec); spec.loader.exec_module(C)
words=set()
for u in C.UNITS:
    for c in u['concepts']:
        for sp,es,hu in c.get('dialogue',[]):
            for w in re.findall(r"[A-Za-zÁÉÍÓÚÑÜáéíóúñü][A-Za-zÁÉÍÓÚÑÜáéíóúñü'’-]*",es): words.add(w.lower().replace('’',"'"))
W=getattr(C,'WORDS',{}); missing=sorted(words-set(W)); unused=sorted(set(W)-words)
print('dialogue words',len(words),'missing',len(missing)); print(' '.join(missing)); print('unused',len(unused))
