# usage: swapbundle.py <bundle.js> <index.html>...  – az önálló oldalba ágyazott plus-bundle cseréje
import sys
new = open(sys.argv[1], encoding='utf-8').read().replace('</script', '<\\/script')
END = "root.Plus = Plus;\n})(typeof window !== 'undefined' ? window : globalThis);"
for f in sys.argv[2:]:
    s = open(f, encoding='utf-8').read()
    a = s.index('/* Matek feladatgenerátor'); b = s.index(END, a) + len(END)
    s = s[:a] + new.strip() + s[b:]
    assert s.count('function optSay(') == 1
    open(f, 'w', encoding='utf-8').write(s); print('ok', f)
