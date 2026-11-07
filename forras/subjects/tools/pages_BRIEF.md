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


# Könyvoldalak – 2. kör: MAGYARÁZAT, képek, játék

(Ugyanabban a menetben is elvégezhető: az 1. kör sémájához ezek a mezők is kellenek.) Robert (az apa) azt kérte: a könyvoldalakon ne csak feladatok legyenek, hanem az oldal MINDEN tartalmát magyarázzuk el, idegen nyelven ÉS magyar fordítással, játékosan, képekkel.

## Feladat
Olvasd be a bemeneti JSON-t, nézd meg újra MINDEN oldalképet (Read tool; nagyíts, ha kell), és minden oldalhoz add hozzá a `learn` mezőt, a szavakhoz pedig a `pic` mezőt. A meglévő mezőket (title, words w/hu, tasks…) NE változtasd meg (kivéve nyilvánvaló hibát – azt írd meg a jelentésben). A kimenetet a megadott kimeneti fájlba írd (ugyanaz a szerkezet, kiegészítve).

```json
"learn": {
  "intro": {"es": "¡Hoy aprendemos a leer números de cuatro cifras!", "hu": "Ma megtanuljuk kiolvasni a négyjegyű számokat!"},
  "sentences": [
    {"es": "Un número de cuatro cifras tiene unidades de millar, centenas, decenas y unidades.", "hu": "A négyjegyű számnak vannak ezresei, százasai, tízesei és egyesei.", "pic": "🔢", "vis": {"type": "digits", "n": "2785"}},
    {"es": "Diez centenas forman una unidad de millar.", "hu": "Tíz százas egy ezrest ad ki.", "vis": {"type": "blocks", "um": 1, "c": 0, "d": 0, "u": 0}}
  ],
  "remember": [{"es": "1 UM = 10 C = 100 D = 1000 U", "hu": "1 ezres = 10 százas = 100 tízes = 1000 egyes"}],
  "dialogue": [
    {"who": "Gatito", "es": "Martín, ¿cuántas cifras tiene el 2785?", "hu": "Martin, hány számjegye van a 2785-nek?"},
    {"who": "Martín", "es": "¡Tiene cuatro cifras!", "hu": "Négy számjegye van!"}
  ],
  "tf": [
    {"es": "El número 3108 tiene tres cifras.", "hu": "A 3108-nak három számjegye van.", "answer": false, "why_es": "Tiene cuatro cifras: 3, 1, 0 y 8.", "why_hu": "Négy számjegye van: 3, 1, 0 és 8."}
  ]
}
```

- `sentences` (6–20 oldalanként): az oldal TELJES tananyaga rövid, egyszerű mondatokban (≤ 20 szó), sorrendben: a cím/bevezető, minden elméleti doboz, szabály, definíció, a kidolgozott példák LÉPÉSENKÉNT, a „Recuerda/Fíjate” dobozok, az olvasmány/kép tartalma mondatonként elmesélve (nem szó szerinti másolás), a feladatok mögötti tudás. A cél: Martin a mondatok meghallgatásával mindent megértsen, ami az oldalon van. Pontos, természetes spanyol (a könyv szóhasználatával), gyereknyelvű pontos magyar fordítás.
- `pic`: EGY Unicode emoji, ami a mondatot/szót szemlélteti (pl. 🏛️ ayuntamiento, 🚦 semáforo, 🧺 cesta, 🍎 manzana, 🔢 számok). Csak ha tényleg illik; ne erőltesd. A szavaknál (`words[i].pic`) is, ahol van illő emoji.
- `vis` (csak matekhoz, ahol segít; opcionális): `{"type":"digits","n":"2785"}` helyiérték-táblázat · `{"type":"blocks","um":1,"c":3,"d":2,"u":4}` számolókockák (ezres lap, százas, tízes rúd, egyes kocka; mindegyik 0–9) · `{"type":"groups","n":3,"size":4}` n csoport, mindegyikben size db (szorzás = ismételt összeadás) · `{"type":"numline","min":900,"max":1200,"step":50,"marks":[920,1040]}` számegyenes (max 25 lépés) · `{"type":"roundline","lo":2700,"n":2745,"hi":2800}` kerekítés két kerek szám között. A vis adatai legyenek pontosak (Pythonnal ellenőrizd).
- `remember` (1–4): a legfontosabb szabályok, „Jegyezd meg!” dobozba.
- `dialogue` (4–8 sor): vidám, rövid párbeszéd az oldal tananyagáról. Szereplők: "Gatito" (a cica kabala), "Martín", és ha az oldalon van, a könyv kitalált szereplője (pl. Nadia, Lucía). A cica kérdez, Martín válaszol, néha téved és a cica kijavítja.
- `tf` (4–8): igaz/hamis állítások az oldal tananyagából (vegyesen igaz és hamis), indoklással (es + hu). A számolást ellenőrizd.
- Ne kerüljön bele valós személy-, település- vagy iskolanév.

A végén Pythonnal ellenőrizd: minden oldalnak van learn-je, sentences ≥ 6, tf ≥ 4, dialogue ≥ 4, a vis-ek érvényesek (blocks 0–9, numline ≤ 25 lépés, groups n·size ≤ 100), a JSON betölthető, a meglévő tasks/words szövegek nem változtak (hasonlítsd össze a bemenettel). A jelentésben írd meg: oldalak, mondatok, tf, dialógus-sorok, emojis szavak száma, és amit javítottál.

## A FELADATOK JAVÍTÁSA (Robert: „a feladatok rész nem jó, mert nem lehet tudni, miről szól a lap; képek sincsenek benne; rögtönözz a feladatokkal is jobban”)
Az oldal eredeti képe meg fog jelenni a feladatok mellett (a feladat kivágott részével), ezért add meg a helyeket:
- Oldalszinten: `"img": "<képfájl neve kiterjesztés nélkül>"` és `"page_box": [x0, y0, x1, y1]` – az oldal helye a képen, 0–1 közötti arányokban (bal-felső, jobb-alsó). Egyoldalas képnél [0,0,1,1]; kétoldalas fotónál a bal vagy jobb oldal tényleges helye (a fotón a gerinc nem pontosan középen van – nézd meg!).
- Feladatonként: `"box": [x0, y0, x1, y1]` – a feladat (utasítás + rajz + üres helyek) helye UGYANAZON a képen, arányokban, kicsit bővebben, hogy semmi ne lógjon le. Ellenőrizd: vágd ki PIL-lel és nézd meg a Read toollal legalább minden második feladatnál.
- Feladatonként: `"context": {"es": "...", "hu": "..."}` – 1–3 mondat: mit látunk a feladat képén (szereplők, tárgyak, számok, táblázat), és mire kell figyelni. Ebből érti meg Martin, miről szól a feladat. + `"pic"`: 1–3 illő emoji egy stringben (pl. "🧸🧸🧸").
- Feladatonként: `"help": {"es": "...", "hu": "..."}` – egy rövid tipp/első lépés (pl. „Számold meg, hány maci van egy dobozban, aztán szorozd meg a dobozok számával.”).
- Az itemek (alpontok) is kapjanak `pic`-et (emoji), és matekban, ahol a kérdés egy képre épül, `vis`-t (groups / blocks / digits / numline / roundline), hogy Martin LÁSSA, amit számolnia kell (pl. 4 doboz × 3 maci → {"type":"groups","n":4,"size":3}).
- Rögtönözz: ha egy feladat így nehezen érthető vagy túl egyhangú, írd át az itemeket érthetőbbre és játékosabbra (rövidebb kérdés, a kép leírása a kérdésben, choice helyett num ahol jobb, stb.), de a könyv feladatának tartalma és a helyes válasz maradjon. A `text`/`text_hu` (eredeti utasítás) maradjon.
- A mentés előtti ellenőrzésnél a box-ok legyenek érvényesek (0 ≤ x0 < x1 ≤ 1, a page_box-on belül).
