# usage: addicons.py <subj>  -> out/plus_data.json "icons" kiegészítése OpenMoji képekkel (<subj>/omicons.json: {glossary index: HEXCODE})
# OpenMoji – the open-source emoji and icon project. License: CC BY-SA 4.0 (https://openmoji.org)
import sys, json, re, os
subj = sys.argv[1]; F = f'/home/claude/subjects/{subj}'; T = '/home/claude/subjects/tools/openmoji'
def mini(svg):
    svg = re.sub(r'\s+id="[^"]*"', '', svg); svg = re.sub(r'>\s+<', '><', svg).strip()
    svg = re.sub(r'(\d+\.\d)\d+', r'\1', svg)
    return svg.replace('<svg ', '<svg aria-hidden="true" ', 1)
m = json.load(open(F + '/omicons.json')); p = F + '/out/plus_data.json'; d = json.load(open(p)); n = 0
for k, hx in m.items():
    if k in d['icons']: continue
    f = f'{T}/{hx}.svg'
    if not os.path.exists(f): print('hiányzik', hx); continue
    d['icons'][k] = mini(open(f).read()); n += 1
json.dump(d, open(p, 'w'), ensure_ascii=False, separators=(',', ':'))
print(subj, '+', n, 'OpenMoji ikon; összesen', len(d['icons']), '; plus_data', os.path.getsize(p) // 1024, 'KB')
