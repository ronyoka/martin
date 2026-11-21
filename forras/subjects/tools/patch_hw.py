import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
def rep(a,b):
    global s
    assert s.count(a)==1,(a[:80],s.count(a)); s=s.replace(a,b)
rep("""  function bookName(id) {""","""  function pgLab(p) { return p.book === 'hw' ? String(p.date || '').slice(5).replace('-', '. ') + '.' : p.page + '.'; }
  function bookName(id) {""")
rep("""(prev ? '<button type="button" class="pbtn l sm" data-a="pgopen" data-p="' + prev.id + '"><span>← ' + prev.page + '.</span></button>' : '') + (next ? '<button type="button" class="pbtn l sm" data-a="pgopen" data-p="' + next.id + '"><span>' + next.page + '. →</span></button>' : '')""",
"""(prev ? '<button type="button" class="pbtn l sm" data-a="pgopen" data-p="' + prev.id + '"><span>← ' + esc(pgLab(prev)) + '</span></button>' : '') + (next ? '<button type="button" class="pbtn l sm" data-a="pgopen" data-p="' + next.id + '"><span>' + esc(pgLab(next)) + ' →</span></button>' : '')""")
rep("""topbar(bookName(p.book) + ' · ' + p.page + '. ' + hu('pg_page'))""","""topbar(bookName(p.book) + ' · ' + (p.book === 'hw' ? pgLab(p) : p.page + '. ' + hu('pg_page')))""")
rep("""'"><span class="top"><b>' + p.page + '.</b>""","""'"><span class="top"><b>' + esc(pgLab(p)) + '</b>""")
rep("""      (u0 ? '<button type="button" class="pbtn l" data-a="gounit" data-u="' + u0 + '"><span>' + esc(hu('b_goto')) + '</span>' + ICO.next + '</button>' : '') + '</div>' +
      (links.length""","""      (u0 ? '<button type="button" class="pbtn l" data-a="gounit" data-u="' + u0 + '"><span>' + esc(hu('b_goto')) + '</span>' + ICO.next + '</button>' : '') +
      (ev.hw && pgFind(ev.hw) ? '<button type="button" class="pbtn g" data-a="pgopen" data-p="' + esc(ev.hw) + '">' + em('✏️', 24) + '<span>Házi gyakorló: kérdések + szószedet</span></button>' : '') + '</div>' +
      (links.length""")
rep("title: bookName(p.book) + ' · ' + p.page + '. ' + hu('pg_page'), qs, back: 'page'","title: bookName(p.book) + ' · ' + (p.book === 'hw' ? pgLab(p) : p.page + '. ' + hu('pg_page')), qs, back: 'page'")
rep("title: p.page + '. ' + hu('pg_page') + ' · ' + hu(","title: (p.book === 'hw' ? bookName(p.book) + ' ' + pgLab(p) : p.page + '. ' + hu('pg_page')) + ' · ' + hu(")
open(p,'w',encoding='utf-8').write(s); print('patched')
