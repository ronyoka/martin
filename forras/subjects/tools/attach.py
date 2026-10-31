# Közös betöltő: a tantárgy mappájában lévő dialogues.py (SENTENCES, DIALOGUES) és words.py (WORDS) hozzákapcsolása a content.py-hoz.
# Használat a content.py végén:  exec(open('/home/claude/subjects/tools/attach.py').read())
import os as _os, re as _re, importlib.util as _iu
def _load(_n):
    _p=_os.path.join(_os.path.dirname(_os.path.abspath(__file__)),_n+'.py')
    if not _os.path.exists(_p): return None
    _s=_iu.spec_from_file_location(_n,_p); _m=_iu.module_from_spec(_s); _s.loader.exec_module(_m); return _m
def _split(t): return [s.strip() for s in _re.split(r'(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑÖŐÜŰ¿¡„"(\d])',t.strip()) if s.strip()]
_D=_load('dialogues'); _W=_load('words')
WORDS=_W.WORDS if _W else {}
for _u in UNITS:
    for _c in _u['concepts']:
        _S=(_D.SENTENCES.get(_c['id']) if _D else None)
        if not _S:
            _a,_b=_split(_c['es_text']),_split(_c['hu_text'])
            _S=list(zip(_a,_b)) if _a and len(_a)==len(_b) else []
        _c['sentences']=_S
        _c['dialogue']=(_D.DIALOGUES.get(_c['id'],[]) if _D else [])
