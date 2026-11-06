# Könyvoldalak feldolgozása – közös leírás

Cél: Martin (8 éves, magyar anyanyelvű, 3. osztály egy spanyol iskolában, még NEM tud spanyolul) interaktív tanulóoldalába oldalankénti bontás kerül: minden könyvoldal szavai és MINDEN feladata, hogy oldalanként meg tudja oldani őket. Eddig csak fejezet-összefoglalók voltak, sok feladat kimaradt – ezért a cél a TELJESSÉG: az oldal minden számozott feladata és minden alpontja kerüljön bele.

## Bemenet
Oldalképek PNG-ben (a te részedhez megadott mappában). Nézd meg MINDEN képet a Read toollal (szükség esetén vágj ki/nagyíts PIL-lel egy részt egy saját scratch-mappába, pl. /home/claude/pg/tmp_<rész>/). Segítségnek: `tesseract <kép> - -l spa` (a szöveg kiolvasásához; a képet mindig nézd meg, az OCR hibás lehet).

## Kimenet
Egyetlen JSON fájl (a megadott útvonalon), UTF-8, ez a séma:

```json
{"pages":[
 {"id":"tb14","book":"tb","page":14,"unit":"u1",
  "title":"Números de 4 cifras","title_hu":"Négyjegyű számok",
  "summary_hu":"1–3 mondat magyarul: miről szól az oldal, mit kell megérteni.",
  "words":[{"w":"unidad de millar","hu":"ezres"}],
  "tasks":[
   {"id":"tb14_1","n":"1","text":"Escribe cómo se lee cada número.","text_hu":"Írd le, hogyan kell kiolvasni a számokat.",
    "items":[
     {"id":"tb14_1a","q":"3450","q_hu":"3450","kind":"type","answer":"tres mil cuatrocientos cincuenta","alts":[],"answer_hu":"háromezer-négyszázötven"},
     {"id":"tb14_1b","q":"2 UM + 3 C + 4 U = ?","q_hu":"2 ezres + 3 százas + 4 egyes = ?","kind":"num","answer":"2304"},
     {"id":"tb14_1c","q":"¿Qué número es mayor: 4510 o 4360?","q_hu":"Melyik a nagyobb: 4510 vagy 4360?","kind":"choice","options":[{"t":"4510","hu":"4510"},{"t":"4360","hu":"4360"}],"answer":0},
     {"id":"tb14_1d","q":"Dibuja 1324 con bloques.","q_hu":"Rajzold le az 1324-et kockákkal.","kind":"open","answer":"1 placa de mil, 3 de cien, 2 barras de diez, 4 cubos","answer_hu":"1 ezres lap, 3 százas, 2 tízes rúd, 4 kis kocka"}
    ]}
  ]}
]}
```

Szabályok:
- `id`: `<book><nyomtatott oldalszám>`, feladat: `<oldal-id>_<feladatszám>`, alpont: `<feladat-id><a|b|c…>` (ha nincs betű, sorszám: _1_1, _1_2). Minden id egyedi.
- `page` = a NYOMTATOTT oldalszám (ami a lapon áll). `unit` = "u1", "u2" … (a fejezet száma).
- `title` az oldal címe eredetiben (spanyolul), `title_hu` magyarul. Ha nincs cím, adj rövid leíró címet.
- `words`: az oldal fontos/új szavai és kifejezései (5–15), spanyolul (névelővel, ha főnév: „el ayuntamiento”) + magyar jelentés. Gyerekbarát, pontos fordítás.
- `tasks`: az oldal MINDEN számozott feladata (a „Practicamos”, „¿Qué hemos aprendido?”, „Reto”, „Cálculo mental”, „Problemas” stb. is), sorrendben. `text` = a feladat eredeti utasítása szó szerint (rövid), `text_hu` = pontos magyar fordítás, gyereknyelven.
- `items`: a feladat minden alpontja külön elem. A `q` legyen ÖNMAGÁBAN ÉRTHETŐ kép nélkül is (a kép nem jelenik meg): ha a feladat egy képre/táblázatra épül, írd bele röviden az adatot („En la imagen hay 3 cajas con 4 pelotas cada una. ¿Cuántas pelotas hay?”), és ugyanígy magyarul a `q_hu`-ban.
- `kind`:
  - `num`: a válasz egyetlen szám → `answer` csak számjegyek (pl. "2304", tizedes nincs, ezres elválasztó nélkül).
  - `type`: rövid szöveges válasz (1–5 szó) → `answer` + `alts` (elfogadható változatok, pl. ékezet nélküli nem kell, azt a program kezeli; szinonimák igen).
  - `choice`: 2–4 lehetőség (`options` {t,hu}), `answer` = a helyes indexe. Használd: >, <, = összehasonlításnál (options: ">", "<", "="), igaz/hamis-nál („Verdadero”/„Falso” – „Igaz”/„Hamis”), „karikázd be”, „válaszd ki”, összekötésnél (minden bal oldali elem egy külön choice item a jobb oldali lehetőségekkel).
  - `open`: rajzolás, színezés, hosszabb magyarázat, saját vélemény, szóbeli kérdés, csoportmunka → `answer` = minta-megoldás eredetiben, `answer_hu` magyarul (a szülőnek).
  Ahol lehet, NE `open` legyen, hanem `num`/`type`/`choice`, hogy Martin a gépen ellenőrizni tudja.
- `answer_hu`: a válasz magyarul (ha a válasz szám, elhagyható).
- MINDEN számolást Pythonnal ellenőrizz (írj egy kis ellenőrző scriptet a kimenet `num` itemjeire, ahol a `q` egy kifejezés).
- Hosszú olvasmányt NE másolj be szó szerint: a `summary_hu` foglalja össze, a feladatok pedig a kérdések.
- Személyes adat, valós település- vagy iskolanév ne kerüljön bele (a könyv kitalált szereplői, pl. Nadia, Lucía, rendben vannak).
- Ha egy oldal csak kép / fejezetnyitó: akkor is legyen bejegyzés (cím, summary_hu, words, és a nyitóoldal kérdései `open` vagy `choice` itemként).

A végén: futtass egy ellenőrzést Pythonban (json betölthető, minden id egyedi, choice answer index érvényes, num answer csak számjegy), és a válaszodban írd meg röviden: hány oldal, hány feladat, hány item (kind szerint), és ha valamit nem tudtál elolvasni.
