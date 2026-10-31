# Párbeszédek a Ciencias Sociales 3 fogalomkártyáihoz (spanyol–magyar). 1. fejezet: La localidad (2026-10-27).
SENTENCES = {}

# --- V3 segédek: S("es | hu\n...") és D("Beszélő | es | hu\n...") ---
def S(t): return [tuple(x.strip() for x in l.split(" | ")) for l in t.strip().split("\n") if l.strip()]
def D(t): return [tuple(x.strip() for x in l.split(" | ")) for l in t.strip().split("\n") if l.strip()]

DIALOGUES = {
 "c1_convivencia": [
  ("Profe","Martín, ¿qué es una localidad?","Martin, mi az a település?"),
  ("Martín","Es el lugar donde viven las personas, como un pueblo o una ciudad.","Az a hely, ahol az emberek élnek, például egy falu vagy egy város."),
  ("Profe","¿Con quién convivimos en nuestra localidad?","Kikkel élünk együtt a településünkön?"),
  ("Martín","Con nuestra familia, los vecinos y las vecinas.","A családunkkal, a szomszédokkal."),
  ("Profe","¿Qué necesitamos para vivir juntos en paz?","Mi kell ahhoz, hogy békében éljünk együtt?"),
  ("Martín","Leyes, normas y valores. Las leyes las hace el Gobierno y hay que cumplirlas.","Törvények, szabályok és értékek. A törvényeket a kormány hozza, és be kell tartani őket."),
  ("Profe","¿Y las normas?","És a szabályok?"),
  ("Martín","Son las reglas de un lugar, como las normas del colegio.","Egy hely szabályai, mint az iskola szabályai."),
  ("Profe","Dime tres valores importantes.","Mondj három fontos értéket."),
  ("Martín","El respeto, la tolerancia y la solidaridad. La cultura de la paz rechaza la violencia.","A tisztelet, a tolerancia és a szolidaritás. A béke kultúrája elutasítja az erőszakot."),
 ],
 "c1_ayuntamiento": [
  ("Lola","Papá, ¿quién gobierna nuestra localidad?","Apa, ki irányítja a településünket?"),
  ("Papá","El Ayuntamiento. Es el gobierno local.","A városháza, az önkormányzat. Ez a helyi kormányzat."),
  ("Lola","¿Quién trabaja en el Ayuntamiento?","Ki dolgozik a városházán?"),
  ("Papá","El alcalde o la alcaldesa, los concejales y las concejalas, y los trabajadores municipales.","A polgármester, a képviselők és az önkormányzati dolgozók."),
  ("Lola","¿Y qué hace el Ayuntamiento?","És mit csinál az önkormányzat?"),
  ("Papá","Organiza los servicios públicos: la limpieza de las calles, la recogida de basuras, el agua, el alumbrado y los parques.","Megszervezi a közszolgáltatásokat: az utcák takarítását, a szemétszállítást, a vizet, a közvilágítást és a parkokat."),
  ("Lola","¿También la policía local y los bomberos?","A helyi rendőrséget és a tűzoltókat is?"),
  ("Papá","Sí, y las bibliotecas y los polideportivos. Para pagar todo esto, los vecinos pagamos impuestos.","Igen, és a könyvtárakat meg a sportcsarnokokat is. Hogy ezt kifizessük, mi, lakosok adót fizetünk."),
  ("Lola","El municipio es el territorio que gobierna un Ayuntamiento, ¿verdad?","A municipio az a terület, amelyet egy önkormányzat irányít, igaz?"),
 ],
 "c1_patrimonio": [
  ("Guía","Bienvenidos al museo. Esto es patrimonio cultural.","Üdvözlök mindenkit a múzeumban. Ez kulturális örökség."),
  ("Martín","¿Qué es el patrimonio?","Mi az örökség?"),
  ("Guía","Todo lo que hemos heredado del pasado y es importante conservar.","Mindaz, amit a múltból örököltünk, és fontos megőrizni."),
  ("Martín","¿Un castillo es patrimonio?","Egy vár is örökség?"),
  ("Guía","Sí, es patrimonio cultural material, como una iglesia o un cuadro.","Igen, tárgyi kulturális örökség, mint egy templom vagy egy festmény."),
  ("Martín","¿Y las fiestas de mi pueblo?","És a falum ünnepei?"),
  ("Guía","Son patrimonio inmaterial: fiestas, canciones, costumbres y conocimientos.","Azok szellemi örökség: ünnepek, dalok, szokások és tudás."),
  ("Martín","¿Y un bosque o un río?","És egy erdő vagy egy folyó?"),
  ("Guía","Eso es patrimonio natural. Recordad: en el museo no se tocan las obras.","Az természeti örökség. Ne feledjétek: a múzeumban nem nyúlunk a műtárgyakhoz."),
 ],
 "c1_vial": [
  ("Mamá","Martín, vamos a cruzar la calle. ¿Qué hacemos primero?","Martin, átmegyünk az úton. Mit csinálunk először?"),
  ("Martín","Cruzamos por el paso de peatones, con el semáforo en verde.","A zebrán megyünk át, zöld lámpánál."),
  ("Mamá","¿Y hacia dónde miras?","És merre nézel?"),
  ("Martín","Primero a la izquierda, luego a la derecha y de nuevo a la izquierda.","Először balra, aztán jobbra, és újra balra."),
  ("Mamá","Muy bien. ¿Qué señal es esa, roja y redonda?","Nagyon jó. Az milyen tábla, a piros kerek?"),
  ("Martín","Es una señal de prohibición. Las azules son de obligación y las triangulares de peligro.","Az tiltó tábla. A kékek utasítást adnak, a háromszögűek veszélyt jeleznek."),
  ("Mamá","Esta tarde vas en bici. ¿Qué llevas?","Ma délután biciklizel. Mit viszel?"),
  ("Martín","El casco y las protecciones. ¡La seguridad vial es importante!","A sisakot és a védőfelszerelést. A közlekedésbiztonság fontos!"),
 ],
 "c1_plano": [
  ("Turista","Perdona, ¿dónde está la biblioteca?","Elnézést, hol van a könyvtár?"),
  ("Martín","Mira este plano. Es un dibujo de la localidad vista desde arriba.","Nézze ezt a térképvázlatot. A település rajza felülről nézve."),
  ("Turista","Veo letras y números: A1, B2, C3.","Betűket és számokat látok: A1, B2, C3."),
  ("Martín","Es la cuadrícula. Sirve para localizar un punto. La biblioteca está en C3.","Ez a rács. Egy pont megtalálására való. A könyvtár a C3-ban van."),
  ("Turista","¿Cómo llego?","Hogyan jutok oda?"),
  ("Martín","Toma la calle de la izquierda, sigue recto y gira a la derecha en el parque.","Menjen a bal oldali utcán, haladjon egyenesen, és a parknál forduljon jobbra."),
  ("Turista","¡Muchas gracias! El plano es muy útil para orientarse.","Köszönöm szépen! A térképvázlat nagyon hasznos a tájékozódáshoz."),
 ],
}


# ===== 2. fejezet: La Tierra y los mapas (V3, 2026-10-30) =====
SENTENCES.update({
"c2_globo": S("""
La Tierra es redonda, como una bola. | A Föld kerek, mint egy labda.
El globo terráqueo es un modelo de la Tierra. | A földgömb a Föld modellje.
En el globo vemos los continentes y los océanos. | A földgömbön látjuk a kontinenseket és az óceánokat.
El planisferio es un mapa de toda la Tierra en plano. | A világtérkép az egész Föld térképe síkban.
El ecuador es una línea imaginaria que divide la Tierra en dos mitades. | Az egyenlítő egy képzeletbeli vonal, amely két félre osztja a Földet.
Las dos mitades son el hemisferio norte y el hemisferio sur. | A két fél az északi és a déli félteke.
La Tierra gira alrededor del eje de rotación. | A Föld a forgástengelye körül forog.
Los extremos del eje son los polos. | A tengely két vége a két pólus.
"""),
"c2_orientacion": S("""
Orientarse es saber dónde estamos y hacia dónde vamos. | Tájékozódni annyit jelent, hogy tudjuk, hol vagyunk és merre megyünk.
Los puntos cardinales son norte, sur, este y oeste. | Az égtájak: észak, dél, kelet és nyugat.
Se escriben con letras mayúsculas: N, S, E, O. | Nagybetűvel írjuk őket: N, S, E, O.
En los mapas, los puntos cardinales están en la rosa de los vientos. | A térképeken az égtájak a szélrózsán vannak.
El Sol sale por el este y se oculta por el oeste. | A Nap keleten kel és nyugaton nyugszik.
Con el brazo derecho hacia el este, el norte está delante de ti. | Ha a jobb karod kelet felé mutat, észak előtted van.
La brújula tiene una aguja que señala el norte. | Az iránytűnek van egy tűje, amely északra mutat.
El GPS usa satélites para decirnos dónde estamos. | A GPS műholdakat használ, hogy megmondja, hol vagyunk.
"""),
"c2_mapas": S("""
Un mapa es un dibujo de la Tierra o de una parte de ella. | A térkép a Föld vagy egy részének rajza.
El mapa dibuja las cosas más pequeñas que en la realidad. | A térkép a dolgokat kisebbre rajzolja, mint a valóságban.
Todo mapa tiene un título, una leyenda, una rosa de los vientos y una escala. | Minden térképnek van címe, jelmagyarázata, szélrózsája és méretaránya.
La leyenda explica los símbolos del mapa. | A jelmagyarázat elmagyarázza a térkép jeleit.
Los mapas físicos muestran montañas, ríos y mares. | A domborzati térképek hegyeket, folyókat és tengereket mutatnak.
Los mapas políticos muestran los países o las comunidades autónomas. | A politikai térképek az országokat vagy az autonóm közösségeket mutatják.
Los mapas temáticos hablan de un solo tema, como el clima. | A tematikus térképek egyetlen témáról szólnak, például az éghajlatról.
"""),
"c2_espana": S("""
España está en la península Ibérica. | Spanyolország az Ibériai-félszigeten van.
También tiene las islas Baleares y las islas Canarias. | Hozzá tartoznak a Baleár-szigetek és a Kanári-szigetek is.
Las islas Baleares están en el mar Mediterráneo. | A Baleár-szigetek a Földközi-tengeren vannak.
Las islas Canarias están en el océano Atlántico. | A Kanári-szigetek az Atlanti-óceánon vannak.
Ceuta y Melilla son dos ciudades españolas en el norte de África. | Ceuta és Melilla két spanyol város Afrika északi részén.
Al norte está el mar Cantábrico y al oeste el océano Atlántico. | Északon van a Kantábriai-tenger, nyugaton az Atlanti-óceán.
Al este y al sur está el mar Mediterráneo. | Keleten és délen van a Földközi-tenger.
España tiene fronteras con Portugal, Francia, Andorra y Gibraltar. | Spanyolország határos Portugáliával, Franciaországgal, Andorrával és Gibraltárral.
Los Pirineos separan España de Francia. | A Pireneusok választják el Spanyolországot Franciaországtól.
El relieve de España es muy montañoso. | Spanyolország domborzata nagyon hegyes.
"""),
"c2_coordenadas": S("""
Las coordenadas sirven para encontrar un punto en la Tierra. | A koordináták arra valók, hogy megtaláljunk egy pontot a Földön.
Los paralelos y los meridianos son líneas imaginarias. | A szélességi és hosszúsági körök képzeletbeli vonalak.
Los paralelos son círculos paralelos al ecuador. | A szélességi körök az egyenlítővel párhuzamos körök.
La latitud es la distancia al ecuador. | A szélesség az egyenlítőtől mért távolság.
La latitud puede ser norte o sur. | A szélesség lehet északi vagy déli.
La longitud es la distancia al meridiano de Greenwich. | A hosszúság a greenwichi kezdő délkörtől mért távolság.
La longitud puede ser este u oeste. | A hosszúság lehet keleti vagy nyugati.
Las coordenadas se miden en grados. | A koordinátákat fokokban mérjük.
"""),
})

DIALOGUES.update({
"c2_globo": D("""
Profe | Martín, mira el globo terráqueo. ¿Cómo es la Tierra? | Martin, nézd a földgömböt. Milyen a Föld?
Martín | La Tierra es redonda, como una bola. | A Föld kerek, mint egy labda.
Profe | ¿Qué vemos en el globo? | Mit látunk a földgömbön?
Martín | Vemos los continentes y los océanos. | A kontinenseket és az óceánokat látjuk.
Profe | ¿Y qué es el planisferio? | És mi a világtérkép?
Martín | Es un mapa de toda la Tierra dibujado en plano. | Az egész Föld térképe, síkban lerajzolva.
Profe | ¿Qué es el ecuador? | Mi az egyenlítő?
Martín | Es una línea imaginaria que divide la Tierra en dos mitades. | Egy képzeletbeli vonal, amely két félre osztja a Földet.
Profe | ¿Cómo se llaman las dos mitades? | Hogy hívják a két felet?
Martín | El hemisferio norte y el hemisferio sur. | Északi félteke és déli félteke.
Profe | Muy bien. ¿Y los polos? | Nagyon jó. És a pólusok?
Martín | Son los extremos del eje de rotación. La Tierra gira alrededor del eje. | Ők a forgástengely végei. A Föld a tengely körül forog.
"""),
"c2_orientacion": D("""
Lola | Papá, estamos perdidos. ¿Cómo nos orientamos? | Apa, eltévedtünk. Hogyan tájékozódjunk?
Papá | Con los puntos cardinales: norte, sur, este y oeste. | Az égtájakkal: észak, dél, kelet és nyugat.
Lola | ¿Dónde sale el Sol? | Hol kel fel a Nap?
Papá | El Sol sale por el este y se oculta por el oeste. | A Nap keleten kel fel és nyugaton nyugszik.
Lola | Entonces extiendo los brazos. El brazo derecho señala el este. | Akkor kitárom a karomat. A jobb karom keletre mutat.
Papá | Muy bien. Delante de ti está el norte y detrás el sur. | Nagyon jó. Előtted van észak, mögötted dél.
Lola | ¿Y en un mapa? | És egy térképen?
Papá | En el mapa está la rosa de los vientos. | A térképen ott van a szélrózsa.
Lola | Yo tengo una brújula. Su aguja señala el norte. | Nekem van egy iránytűm. A tűje északra mutat.
Papá | También podemos usar el GPS, que funciona con satélites. | Használhatjuk a GPS-t is, ami műholdakkal működik.
"""),
"c2_mapas": D("""
Profe | Hoy trabajamos con mapas. ¿Qué es un mapa? | Ma térképekkel dolgozunk. Mi az a térkép?
Martín | Es un dibujo de la Tierra, más pequeño que la realidad. | A Föld rajza, kisebb, mint a valóság.
Profe | ¿Qué tiene todo mapa? | Mi van minden térképen?
Martín | Tiene título, leyenda, rosa de los vientos y escala. | Van címe, jelmagyarázata, szélrózsája és méretaránya.
Profe | ¿Para qué sirve la leyenda? | Mire való a jelmagyarázat?
Martín | Explica los símbolos del mapa. | Elmagyarázza a térkép jeleit.
Profe | ¿Qué muestra un mapa físico? | Mit mutat egy domborzati térkép?
Martín | Muestra montañas, ríos y mares. | Hegyeket, folyókat és tengereket mutat.
Profe | ¿Y un mapa político? | És egy politikai térkép?
Martín | Muestra los países o las comunidades autónomas. | Az országokat vagy az autonóm közösségeket mutatja.
Profe | ¿Hay más tipos? | Vannak más fajták is?
Martín | Sí, los mapas temáticos: hablan del clima o de la población. | Igen, a tematikus térképek: az éghajlatról vagy a népességről szólnak.
"""),
"c2_espana": D("""
Mamá | Martín, vamos a mirar el mapa de España. ¿Dónde estamos? | Martin, nézzük meg Spanyolország térképét. Hol vagyunk?
Martín | En la península Ibérica. | Az Ibériai-félszigeten.
Mamá | ¿Qué islas tiene España? | Milyen szigetei vannak Spanyolországnak?
Martín | Las islas Baleares en el Mediterráneo y las Canarias en el Atlántico. | A Baleár-szigetek a Földközi-tengeren és a Kanári-szigetek az Atlanti-óceánon.
Mamá | ¿Y en África? | És Afrikában?
Martín | Ceuta y Melilla, dos ciudades españolas. | Ceuta és Melilla, két spanyol város.
Mamá | ¿Qué mar está al norte? | Melyik tenger van északon?
Martín | El mar Cantábrico. Al este y al sur está el Mediterráneo. | A Kantábriai-tenger. Keleten és délen a Földközi-tenger van.
Mamá | ¿Con qué países hace frontera? | Mely országokkal határos?
Martín | Con Portugal, Francia y Andorra. Los Pirineos separan España de Francia. | Portugáliával, Franciaországgal és Andorrával. A Pireneusok választják el Franciaországtól.
Mamá | ¿Cómo es el relieve? | Milyen a domborzat?
Martín | Es muy montañoso. Hay una Meseta Central y muchas cordilleras. | Nagyon hegyes. Van egy központi fennsík és sok hegylánc.
"""),
"c2_coordenadas": D("""
Profe | Martín, ¿cómo encontramos un punto en la Tierra? | Martin, hogyan találunk meg egy pontot a Földön?
Martín | Con las coordenadas geográficas. | A földrajzi koordinátákkal.
Profe | ¿Qué líneas imaginarias usamos? | Milyen képzeletbeli vonalakat használunk?
Martín | Los paralelos y los meridianos. | A szélességi és a hosszúsági köröket.
Profe | ¿Qué es la latitud? | Mi a szélesség?
Martín | Es la distancia al ecuador. Puede ser norte o sur. | Az egyenlítőtől mért távolság. Lehet északi vagy déli.
Profe | ¿Y la longitud? | És a hosszúság?
Martín | Es la distancia al meridiano de Greenwich. Puede ser este u oeste. | A greenwichi kezdő délkörtől mért távolság. Lehet keleti vagy nyugati.
Profe | ¿En qué se miden? | Miben mérjük őket?
Martín | En grados. | Fokokban.
Profe | Muy bien. Por ejemplo, cuarenta grados de latitud norte. | Nagyon jó. Például negyven fok északi szélesség.
"""),
})


# ===== 3. fejezet: Los paisajes naturales (V3, 2026-10-30) =====
SENTENCES.update({
"c3_tiempo": S("""
El tiempo atmosférico es cómo está el aire en un lugar y en un momento. | Az időjárás az, milyen a levegő egy helyen, egy adott pillanatban.
Hoy hace sol y mañana llueve. | Ma süt a nap, holnap esik.
El clima es el tiempo que hace casi siempre en un lugar durante muchos años. | Az éghajlat az az időjárás, ami egy helyen sok éven át szokásos.
Los elementos del clima son la temperatura, las precipitaciones, el viento y la humedad. | Az éghajlat elemei a hőmérséklet, a csapadék, a szél és a páratartalom.
La lluvia, la nieve y el granizo son precipitaciones. | Az eső, a hó és a jégeső csapadék.
El clima depende de la latitud, de la altitud y de la cercanía al mar. | Az éghajlat függ a szélességtől, a magasságtól és a tenger közelségétől.
La meteorología estudia la atmósfera. | A meteorológia a légkört tanulmányozza.
En los mapas del tiempo hay símbolos: sol, nubes, lluvia, tormenta y nieve. | Az időjárás-térképeken jelek vannak: nap, felhők, eső, vihar és hó.
"""),
"c3_climas": S("""
En la Tierra hay tres zonas climáticas: cálida, templada y fría. | A Földön három éghajlati öv van: meleg, mérsékelt és hideg.
Los climas cálidos están cerca del ecuador. | A meleg éghajlatok az egyenlítő közelében vannak.
El clima ecuatorial es muy lluvioso y tiene selva. | Az egyenlítői éghajlat nagyon esős, és dzsungel van ott.
El clima tropical tiene una estación seca y otra lluviosa, con sabana. | A trópusi éghajlatnak van egy száraz és egy esős évszaka, szavannával.
En el clima desértico llueve muy poco. | A sivatagi éghajlaton nagyon kevés eső esik.
El clima oceánico tiene temperaturas suaves y muchas lluvias. | Az óceáni éghajlaton enyhe a hőmérséklet, és sok eső esik.
El clima mediterráneo tiene veranos calurosos y lluvias irregulares. | A mediterrán éghajlaton forró a nyár, és rendszertelen az eső.
El clima continental tiene inviernos fríos y veranos calurosos. | A kontinentális éghajlaton hideg a tél és forró a nyár.
El clima de montaña tiene inviernos largos y fríos. | A hegyvidéki éghajlaton hosszú és hideg a tél.
En el clima polar hace mucho frío todo el año. | A sarkvidéki éghajlaton egész évben nagyon hideg van.
"""),
"c3_relieve": S("""
España está formada por la península Ibérica, dos archipiélagos y dos ciudades autónomas. | Spanyolország az Ibériai-félszigetből, két szigetcsoportból és két autonóm városból áll.
En el centro de la Península está la Meseta Central. | A félsziget közepén van a Meseta Central, a központi fennsík.
La Meseta es una llanura alta. | A Meseta magas síkság.
El Sistema Central divide la Meseta en dos partes. | A Sistema Central két részre osztja a fennsíkot.
Alrededor de la Meseta hay montañas, como Sierra Morena. | A fennsík körül hegyek vannak, például a Sierra Morena.
Los Pirineos están al norte y las cordilleras Béticas están al sur. | A Pireneusok északon vannak, a Béticas-hegység délen.
El Mulhacén es el pico más alto de la Península. | A Mulhacén a félsziget legmagasabb csúcsa.
El Teide, en las islas Canarias, es el pico más alto de España. | A Teide a Kanári-szigeteken Spanyolország legmagasabb csúcsa.
"""),
"c3_rios": S("""
Un río nace en la montaña y desemboca en el mar. | A folyó a hegyekben ered, és a tengerbe ömlik.
Una vertiente es el territorio donde los ríos desembocan en el mismo mar. | A vízgyűjtő az a terület, ahol a folyók ugyanabba a tengerbe ömlenek.
En España hay tres vertientes: cantábrica, atlántica y mediterránea. | Spanyolországban három vízgyűjtő van: kantábriai, atlanti és mediterrán.
Los ríos de la vertiente cantábrica son cortos y caudalosos. | A kantábriai vízgyűjtő folyói rövidek és bővizűek.
El Duero, el Tajo y el Guadalquivir desembocan en el océano Atlántico. | A Duero, a Tajo és a Guadalquivir az Atlanti-óceánba ömlik.
Los ríos de la vertiente atlántica son largos y caudalosos. | Az atlanti vízgyűjtő folyói hosszúak és bővizűek.
Los ríos mediterráneos son cortos y en verano casi no llevan agua. | A mediterrán folyók rövidek, és nyáron alig van bennük víz.
El Ebro es el río más largo y caudaloso de España. | Az Ebro Spanyolország leghosszabb és legbővizűbb folyója.
Los lagos de España son pequeños, como la laguna de Sanabria. | Spanyolország tavai kicsik, például a Sanabria-tó.
"""),
"c3_climasesp": S("""
En España hay cinco climas. | Spanyolországban öt éghajlat van.
El clima oceánico está en el norte: Galicia, Asturias, Cantabria y el País Vasco. | Az óceáni éghajlat északon van: Galiciában, Asturiasban, Cantabriában és Baszkföldön.
Allí las temperaturas son suaves y llueve mucho. | Ott enyhe a hőmérséklet, és sok eső esik.
En el clima oceánico crecen robles, hayas y castaños. | Az óceáni éghajlaton tölgyek, bükkök és gesztenyék nőnek.
El clima mediterráneo tiene veranos calurosos y lluvias irregulares. | A mediterrán éghajlaton forró a nyár, és rendszertelen az eső.
En el clima mediterráneo hay encinas y pinos. | A mediterrán éghajlaton magyaltölgyek és fenyők vannak.
El clima de montaña está en los Pirineos y en Sierra Nevada. | A hegyvidéki éghajlat a Pireneusokban és a Sierra Nevadában van.
En la montaña, la vegetación cambia con la altura. | A hegyekben a növényzet a magassággal változik.
El clima subtropical solo está en las islas Canarias. | A szubtrópusi éghajlat csak a Kanári-szigeteken van.
En Canarias hay palmeras y el drago, un árbol muy especial. | A Kanári-szigeteken pálmák és a sárkányfa nő, ami nagyon különleges fa.
"""),
"c3_climograma": S("""
Un climograma es un gráfico del clima de un lugar. | A klímadiagram egy hely éghajlatának grafikonja.
Muestra la temperatura y las precipitaciones de cada mes. | Megmutatja az egyes hónapok hőmérsékletét és csapadékát.
Las precipitaciones se dibujan con barras azules. | A csapadékot kék oszlopokkal rajzoljuk.
La temperatura se dibuja con puntos rojos. | A hőmérsékletet piros pontokkal rajzoljuk.
Después unimos los puntos con una línea. | Utána a pontokat egy vonallal összekötjük.
Para hacer un climograma necesitamos los datos de cada mes. | A klímadiagramhoz minden hónap adataira szükségünk van.
Con los climogramas podemos comparar los climas de dos lugares. | A klímadiagramokkal összehasonlíthatjuk két hely éghajlatát.
"""),
})

DIALOGUES.update({
"c3_tiempo": D("""
Lola | Papá, hoy hace sol. Mañana, ¿también hará sol? | Apa, ma süt a nap. Holnap is süt majd?
Papá | No lo sé. Mira el mapa del tiempo. | Nem tudom. Nézd az időjárás-térképet.
Lola | Veo una nube y gotas de lluvia. Mañana llueve. | Egy felhőt és esőcseppeket látok. Holnap esik.
Papá | El tiempo atmosférico cambia cada día. | Az időjárás minden nap változik.
Lola | ¿Y el clima? | És az éghajlat?
Papá | El clima es el tiempo que hace casi siempre en un lugar durante muchos años. | Az éghajlat az az időjárás, ami egy helyen sok éven át szokásos.
Lola | ¿Qué elementos tiene el clima? | Milyen elemei vannak az éghajlatnak?
Papá | La temperatura, las precipitaciones, el viento y la humedad. | A hőmérséklet, a csapadék, a szél és a páratartalom.
Lola | La lluvia y la nieve son precipitaciones, ¿verdad? | Az eső és a hó csapadék, igaz?
Papá | Sí. Y quien estudia la atmósfera se llama meteorólogo. | Igen. És aki a légkört tanulmányozza, azt meteorológusnak hívják.
"""),
"c3_climas": D("""
Profe | Martín, ¿cuántas zonas climáticas hay en la Tierra? | Martin, hány éghajlati öv van a Földön?
Martín | Hay tres: la cálida, la templada y la fría. | Három van: a meleg, a mérsékelt és a hideg.
Profe | ¿Dónde están los climas cálidos? | Hol vannak a meleg éghajlatok?
Martín | Cerca del ecuador. Por ejemplo, el clima ecuatorial tiene selva. | Az egyenlítő közelében. Például az egyenlítői éghajlaton dzsungel van.
Profe | ¿Y el clima desértico? | És a sivatagi éghajlat?
Martín | Allí llueve muy poco. | Ott nagyon kevés eső esik.
Profe | ¿Qué climas templados conoces? | Milyen mérsékelt éghajlatokat ismersz?
Martín | El oceánico, el mediterráneo y el continental. | Az óceánit, a mediterránt és a kontinentálisat.
Profe | ¿Cómo es el clima mediterráneo? | Milyen a mediterrán éghajlat?
Martín | Tiene veranos calurosos y lluvias irregulares. | Forró a nyár, és rendszertelen az eső.
Profe | ¿Y los climas fríos? | És a hideg éghajlatok?
Martín | El de montaña y el polar. En el polar hace mucho frío todo el año. | A hegyvidéki és a sarkvidéki. A sarkvidékin egész évben nagyon hideg van.
"""),
"c3_relieve": D("""
Guía | Bienvenidos al mirador. Desde aquí vemos el relieve de España. | Üdvözlöm önöket a kilátóban. Innen látjuk Spanyolország domborzatát.
Martín | ¿Qué hay en el centro de la Península? | Mi van a félsziget közepén?
Guía | La Meseta Central, una llanura alta. | A Meseta Central, egy magas síkság.
Martín | ¿Qué montaña divide la Meseta? | Melyik hegy osztja ketté a fennsíkot?
Guía | El Sistema Central la divide en dos partes. | A Sistema Central két részre osztja.
Martín | ¿Y qué montañas hay al norte? | És milyen hegyek vannak északon?
Guía | Los Pirineos y la cordillera Cantábrica. | A Pireneusok és a Kantábriai-hegység.
Martín | ¿Y al sur? | És délen?
Guía | Las cordilleras Béticas. Allí está el Mulhacén, el pico más alto de la Península. | A Béticas-hegység. Ott van a Mulhacén, a félsziget legmagasabb csúcsa.
Martín | ¿Cuántos metros tiene? | Hány méter magas?
Guía | Tres mil cuatrocientos ochenta y dos. El Teide, en Canarias, es todavía más alto. | Háromezer-négyszáznyolcvankettő. A Teide a Kanári-szigeteken még magasabb.
"""),
"c3_rios": D("""
Profe | Martín, ¿qué es una vertiente? | Martin, mi az a vízgyűjtő?
Martín | Es el territorio donde los ríos desembocan en el mismo mar. | Az a terület, ahol a folyók ugyanabba a tengerbe ömlenek.
Profe | ¿Cuántas vertientes hay en España? | Hány vízgyűjtő van Spanyolországban?
Martín | Tres: la cantábrica, la atlántica y la mediterránea. | Három: a kantábriai, az atlanti és a mediterrán.
Profe | ¿Cómo son los ríos de la vertiente cantábrica? | Milyenek a kantábriai vízgyűjtő folyói?
Martín | Son cortos y caudalosos, como el Nalón. | Rövidek és bővizűek, mint a Nalón.
Profe | Dime ríos de la vertiente atlántica. | Mondj folyókat az atlanti vízgyűjtőről.
Martín | El Duero, el Tajo, el Guadiana y el Guadalquivir. | A Duero, a Tajo, a Guadiana és a Guadalquivir.
Profe | ¿Y los ríos mediterráneos? | És a mediterrán folyók?
Martín | Son cortos y en verano llevan poca agua. El Ebro es el más largo. | Rövidek, és nyáron kevés vizet visznek. Az Ebro a leghosszabb.
Profe | ¿Hay lagos grandes en España? | Vannak nagy tavak Spanyolországban?
Martín | No, los lagos son pequeños, como la laguna de Sanabria. | Nem, a tavak kicsik, például a Sanabria-tó.
"""),
"c3_climasesp": D("""
Mamá | Martín, ¿cuántos climas hay en España? | Martin, hány éghajlat van Spanyolországban?
Martín | Hay cinco. | Öt van.
Mamá | ¿Dónde está el clima oceánico? | Hol van az óceáni éghajlat?
Martín | En el norte, en Galicia y Asturias. Llueve mucho y hay robles y castaños. | Északon, Galiciában és Asturiasban. Sok eső esik, és vannak tölgyek meg gesztenyék.
Mamá | Nosotros vivimos con clima mediterráneo. ¿Cómo es? | Mi mediterrán éghajlaton élünk. Milyen az?
Martín | Los veranos son calurosos y las lluvias son irregulares. | A nyarak forrók, és az eső rendszertelen.
Mamá | ¿Qué árboles hay? | Milyen fák vannak?
Martín | Encinas y pinos. | Magyaltölgyek és fenyők.
Mamá | ¿Y en las montañas? | És a hegyekben?
Martín | Hace frío en invierno y la vegetación cambia con la altura. | Télen hideg van, és a növényzet a magassággal változik.
Mamá | ¿Qué clima tienen las islas Canarias? | Milyen éghajlata van a Kanári-szigeteknek?
Martín | Subtropical. Hace buen tiempo todo el año y hay palmeras y dragos. | Szubtrópusi. Egész évben jó idő van, és pálmák meg sárkányfák vannak.
"""),
"c3_climograma": D("""
Profe | Hoy dibujamos un climograma. ¿Qué es? | Ma klímadiagramot rajzolunk. Mi az?
Martín | Es un gráfico que muestra el clima de un lugar. | Egy grafikon, amely megmutatja egy hely éghajlatát.
Profe | ¿Qué datos necesitamos? | Milyen adatokra van szükségünk?
Martín | La temperatura y las precipitaciones de cada mes. | Minden hónap hőmérsékletére és csapadékára.
Profe | ¿Cómo dibujamos las precipitaciones? | Hogyan rajzoljuk a csapadékot?
Martín | Con barras azules. | Kék oszlopokkal.
Profe | ¿Y la temperatura? | És a hőmérsékletet?
Martín | Con puntos rojos. Después unimos los puntos con una línea. | Piros pontokkal. Utána a pontokat egy vonallal összekötjük.
Profe | ¿Para qué sirve un climograma? | Mire jó a klímadiagram?
Martín | Para comparar los climas de dos lugares. | Hogy összehasonlítsuk két hely éghajlatát.
"""),
})


# ===== 4. fejezet: Los paisajes humanizados y el medio ambiente (V3, 2026-10-30) =====
SENTENCES.update({
"c4_paisajes": S("""
Los paisajes naturales casi no han cambiado por las personas. | A természeti tájakat az emberek alig változtatták meg.
En un paisaje natural viven muchos animales y plantas. | Egy természeti tájon sok állat és növény él.
Los paisajes agrarios tienen campos de cultivo y pastos para el ganado. | A mezőgazdasági tájakon szántóföldek és legelők vannak az állatoknak.
Los agricultores cultivan los campos y los ganaderos cuidan los animales. | A gazdák művelik a földeket, az állattartók pedig gondozzák az állatokat.
Los paisajes urbanos tienen ciudades, fábricas y carreteras. | A városi tájakon városok, gyárak és utak vannak.
En las ciudades gran parte del suelo está asfaltado. | A városokban a talaj nagy része le van aszfaltozva.
Las personas no viven igual por todo el planeta. | Az emberek nem egyformán élnek a bolygó minden részén.
En los desiertos y en los polos vive muy poca gente. | A sivatagokban és a sarkokon nagyon kevés ember él.
"""),
"c4_problemas": S("""
Los recursos naturales no son infinitos. | A természeti erőforrások nem végtelenek.
El agua limpia, los bosques y los minerales son recursos naturales. | A tiszta víz, az erdők és az ásványok természeti erőforrások.
La contaminación ensucia el aire, el agua y la tierra. | A szennyezés beszennyezi a levegőt, a vizet és a talajt.
La deforestación es cortar muchos árboles de un bosque. | Az erdőirtás az, amikor egy erdő sok fáját kivágják.
Muchos animales y plantas desaparecen: se pierde la biodiversidad. | Sok állat és növény eltűnik: elvész a biológiai sokféleség.
La erosión se lleva la tierra fértil. | Az erózió elviszi a termékeny talajt.
Cada día hay más basura, sobre todo plásticos. | Minden nap több a szemét, főleg a műanyag.
Podemos reducir, reutilizar y reciclar. | Csökkenthetünk, újra felhasználhatunk és újrahasznosíthatunk.
"""),
"c4_protegidos": S("""
Un espacio natural protegido es un lugar con mucho valor natural. | A védett természeti terület nagy természeti értékű hely.
Las leyes protegen su paisaje, sus plantas y sus animales. | A törvények védik a tájat, a növényeket és az állatokat.
Los parques nacionales son los más importantes. | A nemzeti parkok a legfontosabbak.
Doñana, Picos de Europa y el Teide son parques nacionales. | A Doñana, a Picos de Europa és a Teide nemzeti park.
También hay parques naturales y reservas. | Vannak natúrparkok és rezervátumok is.
En un espacio protegido no tiramos basura. | Egy védett területen nem szemetelünk.
No hacemos fuego y no arrancamos las plantas. | Nem rakunk tüzet, és nem tépünk le növényeket.
No molestamos a los animales y caminamos por los senderos. | Nem zavarjuk az állatokat, és az ösvényeken járunk.
"""),
"c4_sostenible": S("""
Un estilo de vida sostenible cuida la naturaleza. | A fenntartható életmód vigyáz a természetre.
Así las personas del futuro también pueden disfrutarla. | Így a jövő emberei is élvezhetik.
Consumimos solo lo necesario. | Csak annyit fogyasztunk, amennyi szükséges.
Comemos alimentos de temporada, como sandía en verano y naranjas en invierno. | Idényételeket eszünk, például nyáron görögdinnyét, télen narancsot.
Compramos productos locales y naturales. | Helyi és természetes termékeket vásárolunk.
Ahorramos agua y energía. | Vizet és energiát takarékoskodunk.
Usamos el transporte público o la bicicleta. | Tömegközlekedést vagy biciklit használunk.
Separamos la basura en los contenedores de colores. | A szemetet színes kukákba válogatjuk.
El contenedor amarillo es para envases, el azul para papel y el verde para vidrio. | A sárga kuka a csomagolásnak, a kék a papírnak, a zöld az üvegnek való.
El contenedor marrón es para los restos de comida. | A barna kuka az ételmaradékoknak való.
"""),
"c4_fotografia": S("""
Interpretar una fotografía es descubrir detalles que no vemos a primera vista. | Egy fénykép értelmezése azt jelenti, hogy részleteket fedezünk fel, amelyeket első pillantásra nem látunk.
Primero observamos si el paisaje es natural, agrario o urbano. | Először megfigyeljük, hogy a táj természeti, mezőgazdasági vagy városi.
Después describimos el relieve, el agua y la vegetación. | Utána leírjuk a domborzatot, a vizet és a növényzetet.
Luego buscamos los elementos humanos: casas, carreteras, cultivos y fábricas. | Aztán megkeressük az emberi elemeket: házakat, utakat, szántókat és gyárakat.
Nos preguntamos qué cambios ha hecho el ser humano. | Megkérdezzük magunktól, milyen változásokat okozott az ember.
Miramos si hay mucha gente o poca. | Megnézzük, sok vagy kevés ember él ott.
Por último, valoramos si las acciones son buenas o malas para la naturaleza. | Végül értékeljük, hogy a tettek jók vagy rosszak a természetnek.
"""),
})

DIALOGUES.update({
"c4_paisajes": D("""
Profe | Martín, mira esta fotografía. ¿Qué paisaje es? | Martin, nézd ezt a fényképet. Milyen táj ez?
Martín | Es un paisaje agrario. Veo campos de cultivo. | Mezőgazdasági táj. Szántóföldeket látok.
Profe | ¿Quién trabaja allí? | Ki dolgozik ott?
Martín | Los agricultores cultivan la tierra y los ganaderos cuidan los animales. | A gazdák művelik a földet, az állattartók gondozzák az állatokat.
Profe | ¿Y esta otra foto? | És ez a másik kép?
Martín | Es un paisaje urbano. Hay edificios, carreteras y fábricas. | Városi táj. Vannak épületek, utak és gyárak.
Profe | ¿Cómo es el suelo? | Milyen a talaj?
Martín | Gran parte del suelo está asfaltado. | A talaj nagy része le van aszfaltozva.
Profe | ¿Y un paisaje natural? | És egy természeti táj?
Martín | Las personas casi no lo han cambiado. Viven muchos animales y plantas. | Az emberek alig változtatták meg. Sok állat és növény él benne.
Profe | ¿Vive mucha gente en el desierto? | Sok ember él a sivatagban?
Martín | No, en los desiertos y en los polos vive muy poca gente. | Nem, a sivatagokban és a sarkokon nagyon kevés ember él.
"""),
"c4_problemas": D("""
Lola | Papá, hoy en el colegio hablamos del medio ambiente. | Apa, ma az iskolában a környezetről beszéltünk.
Papá | ¿Qué son los recursos naturales? | Mik a természeti erőforrások?
Lola | El agua limpia, los bosques y los minerales. No son infinitos. | A tiszta víz, az erdők és az ásványok. Nem végtelenek.
Papá | ¿Qué problemas hay? | Milyen problémák vannak?
Lola | La contaminación del aire, del agua y de la tierra. | A levegő, a víz és a talaj szennyezése.
Papá | ¿Y qué es la deforestación? | És mi az erdőirtás?
Lola | Es cortar muchos árboles de un bosque. | Az, amikor egy erdő sok fáját kivágják.
Papá | ¿Qué pasa con los animales? | Mi történik az állatokkal?
Lola | Muchos desaparecen. Se pierde la biodiversidad. | Sokan eltűnnek. Elvész a biológiai sokféleség.
Papá | ¿Qué podemos hacer nosotros? | Mit tehetünk mi?
Lola | Reducir, reutilizar y reciclar. Y no tirar plásticos a la naturaleza. | Csökkenteni, újra felhasználni és újrahasznosítani. És nem dobálni műanyagot a természetbe.
"""),
"c4_protegidos": D("""
Guía | Bienvenidos al parque nacional. Es un espacio natural protegido. | Üdvözlöm önöket a nemzeti parkban. Ez védett természeti terület.
Martín | ¿Por qué lo protegen? | Miért védik?
Guía | Tiene mucho valor natural: paisajes, plantas y animales. | Nagy természeti értéke van: tájak, növények és állatok.
Martín | ¿Cuáles son parques nacionales de España? | Melyek Spanyolország nemzeti parkjai?
Guía | Doñana, Picos de Europa y el Teide son algunos. | A Doñana, a Picos de Europa és a Teide néhány közülük.
Martín | ¿Qué normas hay aquí? | Milyen szabályok vannak itt?
Guía | No tiramos basura y no hacemos fuego. | Nem szemetelünk, és nem rakunk tüzet.
Martín | ¿Podemos coger flores? | Szedhetünk virágot?
Guía | No, no arrancamos las plantas. Tampoco molestamos a los animales. | Nem, nem tépünk le növényeket. Az állatokat sem zavarjuk.
Martín | ¿Por dónde caminamos? | Merre sétálunk?
Guía | Por los senderos. Gracias por cuidar la naturaleza. | Az ösvényeken. Köszönöm, hogy vigyáztok a természetre.
"""),
"c4_sostenible": D("""
Mamá | Martín, vamos a separar la basura. ¿Qué va en el contenedor amarillo? | Martin, válogassuk szét a szemetet. Mi megy a sárga kukába?
Martín | Los envases de plástico. | A műanyag csomagolások.
Mamá | ¿Y en el azul? | És a kékbe?
Martín | El papel y el cartón. | A papír és a karton.
Mamá | ¿En el verde? | A zöldbe?
Martín | Las botellas y los frascos de vidrio. | Az üvegek és a befőttesüvegek.
Mamá | ¿Y los restos de comida? | És az ételmaradékok?
Martín | Van al contenedor marrón. | A barna kukába kerülnek.
Mamá | Hoy compramos sandía. ¿Por qué? | Ma görögdinnyét vásárolunk. Miért?
Martín | Porque es una fruta de temporada: en verano es mejor. | Mert idényfrukt: nyáron a legjobb.
Mamá | Muy bien. ¿Cómo ahorramos agua y energía? | Nagyon jó. Hogyan takarékoskodunk vízzel és energiával?
Martín | Cerramos el grifo y apagamos la luz. Y vamos en bici al colegio. | Elzárjuk a csapot és lekapcsoljuk a villanyt. És biciklivel megyünk iskolába.
"""),
"c4_fotografia": D("""
Profe | Hoy interpretamos una fotografía de un paisaje. ¿Qué hacemos primero? | Ma egy tájfényképet értelmezünk. Mit csinálunk először?
Martín | Observamos si el paisaje es natural, agrario o urbano. | Megfigyeljük, hogy a táj természeti, mezőgazdasági vagy városi.
Profe | Esta foto tiene montañas, un río y un pueblo. ¿Qué describimos después? | Ezen a fényképen hegyek, egy folyó és egy falu van. Mit írunk le utána?
Martín | El relieve, el agua y la vegetación. | A domborzatot, a vizet és a növényzetet.
Profe | ¿Qué buscamos luego? | Mit keresünk aztán?
Martín | Los elementos humanos: casas, carreteras y cultivos. | Az emberi elemeket: házakat, utakat és szántókat.
Profe | ¿Qué nos preguntamos? | Mit kérdezünk magunktól?
Martín | Qué cambios ha hecho el ser humano. | Milyen változásokat okozott az ember.
Profe | ¿Hay mucha gente en la foto? | Sok ember van a fényképen?
Martín | No, hay pocas casas. | Nem, kevés a ház.
Profe | ¿Y al final? | És a végén?
Martín | Valoramos si las acciones son buenas o malas para la naturaleza. | Értékeljük, hogy a tettek jók vagy rosszak a természetnek.
"""),
})


# ===== 5. fejezet: El paso del tiempo (V3, 2026-10-30) =====
SENTENCES.update({
"c5_unidades": S("""
El tiempo pasa y no se para nunca. | Az idő múlik, és soha nem áll meg.
Medimos el tiempo con unidades de tiempo. | Az időt időegységekkel mérjük.
Las unidades más conocidas son el día, la semana, el mes y el año. | A legismertebb időegységek a nap, a hét, a hónap és az év.
Un siglo son cien años. | Egy évszázad száz év.
Un lustro son cinco años y una década son diez años. | Egy lustrum öt év, egy évtized tíz év.
Un milenio son mil años. | Egy évezred ezer év.
El pasado es lo que ya ocurrió. | A múlt az, ami már megtörtént.
El presente es lo que ocurre ahora. | A jelen az, ami most történik.
El futuro es lo que ocurrirá. | A jövő az, ami majd megtörténik.
"""),
"c5_romanos": S("""
Los siglos se escriben con números romanos. | Az évszázadokat római számokkal írjuk.
I es 1, V es 5 y X es 10. | Az I az 1, a V az 5, az X a 10.
L es 50, C es 100, D es 500 y M es 1000. | Az L az 50, a C a 100, a D az 500, az M az 1000.
Si una letra pequeña está a la derecha, sumamos: VI es 6. | Ha egy kisebb jel a jobb oldalon áll, összeadunk: a VI az 6.
Si una letra pequeña está a la izquierda, restamos: IV es 4. | Ha egy kisebb jel a bal oldalon áll, kivonunk: az IV az 4.
IX es 9 y XL es 40. | Az IX az 9, az XL pedig 40.
Podemos repetir I, X, C y M hasta tres veces: III es 3. | Az I, X, C és M jelet legfeljebb háromszor ismételhetjük: a III az 3.
Ahora estamos en el siglo XXI. | Most a huszonegyedik században élünk.
"""),
"c5_fuentes": S("""
La Historia estudia lo que ocurrió en el pasado. | A történelem azt tanulmányozza, ami a múltban történt.
Los historiadores y las historiadoras estudian la Historia. | A történészek tanulmányozzák a történelmet.
Para conocer el pasado usan fuentes históricas. | A múlt megismeréséhez történelmi forrásokat használnak.
Las fuentes escritas son libros, cartas y periódicos. | Az írott források könyvek, levelek és újságok.
Las fuentes gráficas son pinturas, fotografías y mapas. | A képi források festmények, fényképek és térképek.
Las fuentes materiales son objetos, monedas, herramientas y edificios. | A tárgyi források tárgyak, érmék, szerszámok és épületek.
Las fuentes orales son lo que cuentan las personas, por ejemplo los abuelos. | A szóbeli források azok, amiket az emberek mesélnek, például a nagyszülők.
Así sabemos cómo vivían, qué comían y cómo se vestían. | Így tudjuk meg, hogyan éltek, mit ettek és hogyan öltöztek.
"""),
"c5_linea": S("""
La línea del tiempo ordena los acontecimientos del más antiguo al más reciente. | Az idővonal az eseményeket a legrégebbitől a legújabbig sorba rendezi.
También se llama eje cronológico. | Kronológiai tengelynek is hívják.
El año 1 es el nacimiento de Cristo. | Az 1. év Krisztus születése.
Los años anteriores son antes de Cristo, a. C. | A korábbi évek Krisztus előttiek, Kr. e.
Los años a. C. se cuentan hacia atrás. | A Kr. e. éveket visszafelé számoljuk.
El año 500 a. C. es más antiguo que el año 100 a. C. | A Kr. e. 500. év régebbi, mint a Kr. e. 100. év.
Los años posteriores son después de Cristo, d. C. | A későbbi évek Krisztus utániak, Kr. u.
Para hacer un eje cronológico dibujamos una línea y la dividimos en partes iguales. | Idővonal készítéséhez rajzolunk egy vonalat, és egyenlő részekre osztjuk.
Después colocamos los acontecimientos en orden. | Aztán sorrendben elhelyezzük az eseményeket.
"""),
"c5_edades": S("""
La Historia se divide en cuatro edades y la Prehistoria. | A történelmet négy korra és az őskorra osztjuk.
La Prehistoria es la etapa más antigua y más larga. | Az őskor a legrégebbi és leghosszabb időszak.
La Prehistoria termina con la invención de la escritura. | Az őskor az írás feltalálásával ér véget.
La Edad Antigua llega hasta la caída del Imperio romano, en el año 476. | Az ókor a Római Birodalom bukásáig, 476-ig tart.
La Edad Media llega hasta el descubrimiento de América, en 1492. | A középkor Amerika felfedezéséig, 1492-ig tart.
La Edad Media es la época de los castillos. | A középkor a várak kora.
La Edad Moderna va de 1492 a la Revolución francesa, en 1789. | Az újkor 1492-től a francia forradalomig, 1789-ig tart.
La Edad Contemporánea empezó en 1789 y llega hasta hoy. | A jelenkor 1789-ben kezdődött, és máig tart.
"""),
})

DIALOGUES.update({
"c5_unidades": D("""
Profe | Martín, ¿cómo medimos el tiempo? | Martin, hogyan mérjük az időt?
Martín | Con unidades de tiempo: el día, la semana, el mes y el año. | Időegységekkel: nap, hét, hónap és év.
Profe | ¿Cuántos años tiene un siglo? | Hány év egy évszázad?
Martín | Un siglo tiene cien años. | Egy évszázad száz év.
Profe | ¿Y una década? | És egy évtized?
Martín | Una década son diez años y un lustro son cinco años. | Egy évtized tíz év, egy lustrum öt év.
Profe | ¿Y un milenio? | És egy évezred?
Martín | Mil años. | Ezer év.
Profe | ¿Qué es el pasado? | Mi a múlt?
Martín | Lo que ya ocurrió, como la comida de ayer. | Ami már megtörtént, például a tegnapi ebéd.
Profe | ¿Y el presente? | És a jelen?
Martín | Lo que ocurre ahora. El futuro es lo que ocurrirá mañana. | Ami most történik. A jövő az, ami holnap fog történni.
"""),
"c5_romanos": D("""
Lola | Papá, el libro dice «siglo XXI». ¿Qué significa? | Apa, a könyv azt írja: „XXI. század”. Mit jelent?
Papá | Son números romanos. X es 10 y I es 1. | Római számok. Az X a 10, az I az 1.
Lola | Entonces XXI es 21. | Akkor a XXI az 21.
Papá | Exacto. Sumamos: 10 más 10 más 1. | Pontosan. Összeadjuk: tíz meg tíz meg egy.
Lola | ¿Y IV? | És az IV?
Papá | La I está a la izquierda de la V, así que restamos. IV es 4. | Az I a V bal oldalán áll, tehát kivonunk. Az IV az 4.
Lola | ¿Cuánto vale la V? | Mennyi a V?
Papá | La V vale 5. Y la L vale 50, la C vale 100. | A V értéke 5. Az L értéke 50, a C értéke 100.
Lola | ¿Puedo escribir IIII para el 4? | Írhatok IIII-et a 4-hez?
Papá | No. Solo podemos repetir una letra hasta tres veces, como III. | Nem. Egy jelet csak háromszor ismételhetünk, mint a III-nál.
"""),
"c5_fuentes": D("""
Guía | Bienvenidos al museo de Historia. | Üdvözlöm önöket a történelmi múzeumban.
Martín | ¿Quién estudia la Historia? | Ki tanulmányozza a történelmet?
Guía | Los historiadores y las historiadoras. | A történészek.
Martín | ¿Cómo conocen el pasado? | Hogyan ismerik meg a múltat?
Guía | Con fuentes históricas. Aquí hay una carta antigua. Es una fuente escrita. | Történelmi forrásokkal. Itt van egy régi levél. Ez írott forrás.
Martín | Y este cuadro, ¿qué fuente es? | És ez a festmény, milyen forrás?
Guía | Es una fuente gráfica, como las fotografías y los mapas. | Képi forrás, mint a fényképek és a térképek.
Martín | Y estas monedas y herramientas? | És ezek az érmék és szerszámok?
Guía | Son fuentes materiales. | Tárgyi források.
Martín | Mi abuelo me cuenta cosas de cuando era niño. | A nagyapám mesél nekem arról, amikor kisfiú volt.
Guía | Eso es una fuente oral. Así sabemos cómo vivían las personas. | Ez szóbeli forrás. Így tudjuk meg, hogyan éltek az emberek.
"""),
"c5_linea": D("""
Profe | Hoy hacemos una línea del tiempo. ¿Para qué sirve? | Ma idővonalat készítünk. Mire jó?
Martín | Sirve para ordenar los acontecimientos del más antiguo al más reciente. | Arra jó, hogy az eseményeket a legrégebbitől a legújabbig sorba rendezzük.
Profe | ¿Qué es el año 1? | Mi az 1. év?
Martín | El nacimiento de Cristo. | Krisztus születése.
Profe | ¿Cómo se llaman los años anteriores? | Hogy hívják a korábbi éveket?
Martín | Antes de Cristo, a. C. Se cuentan hacia atrás. | Krisztus előtt, Kr. e. Visszafelé számoljuk őket.
Profe | ¿Qué año es más antiguo, el 500 a. C. o el 100 a. C.? | Melyik év régebbi, a Kr. e. 500. vagy a Kr. e. 100.?
Martín | El 500 a. C. es más antiguo. | A Kr. e. 500. a régebbi.
Profe | ¿Y los años posteriores? | És a későbbi évek?
Martín | Son después de Cristo, d. C. Nosotros vivimos en el año 2026 d. C. | Krisztus utániak, Kr. u. Mi a Kr. u. 2026. évben élünk.
Profe | ¿Cómo hacemos el eje? | Hogyan készítjük el a tengelyt?
Martín | Dibujamos una línea, la dividimos en partes iguales y ponemos los acontecimientos. | Rajzolunk egy vonalat, egyenlő részekre osztjuk, és ráhelyezzük az eseményeket.
"""),
"c5_edades": D("""
Mamá | Martín, ¿cuántas edades tiene la Historia? | Martin, hány kora van a történelemnek?
Martín | Cuatro edades y antes está la Prehistoria. | Négy kor, és előtte van az őskor.
Mamá | ¿Cómo es la Prehistoria? | Milyen az őskor?
Martín | Es la etapa más antigua y más larga. Termina con la escritura. | A legrégebbi és leghosszabb időszak. Az írással ér véget.
Mamá | ¿Y la Edad Antigua? | És az ókor?
Martín | Llega hasta la caída del Imperio romano, en el año 476. | A Római Birodalom bukásáig tart, 476-ig.
Mamá | ¿Qué época es la de los castillos? | Melyik a várak kora?
Martín | La Edad Media. Termina con el descubrimiento de América, en 1492. | A középkor. Amerika felfedezésével ér véget, 1492-ben.
Mamá | ¿Y la Edad Moderna? | És az újkor?
Martín | Va de 1492 a la Revolución francesa, en 1789. | 1492-től a francia forradalomig, 1789-ig tart.
Mamá | ¿En qué edad vivimos nosotros? | Melyik korban élünk mi?
Martín | En la Edad Contemporánea. Empezó en 1789 y llega hasta hoy. | A jelenkorban. 1789-ben kezdődött, és máig tart.
"""),
})


# ===== 6. fejezet: La Prehistoria (V3, 2026-10-30) =====
SENTENCES.update({
"c6_paleolitico": S("""
El Paleolítico es el período más antiguo y más largo de la Prehistoria. | A paleolitikum az őskor legrégebbi és leghosszabb időszaka.
Empezó hace más de dos millones de años. | Több mint kétmillió éve kezdődött.
Los seres humanos eran nómadas: se movían buscando comida. | Az emberek nomádok voltak: élelmet keresve vándoroltak.
Eran cazadores y recolectores. | Vadászok és gyűjtögetők voltak.
Cazaban animales, pescaban y recogían frutos. | Állatokra vadásztak, halásztak és gyümölcsöt szedtek.
Vivían en cuevas y en cabañas. | Barlangokban és kunyhókban laktak.
Hacían herramientas de piedra, de hueso y de madera. | Kőből, csontból és fából készítettek szerszámokat.
Descubrieron el fuego. | Felfedezték a tüzet.
El fuego daba luz y calor y servía para cocinar y protegerse. | A tűz fényt és meleget adott, és főzésre meg védekezésre szolgált.
"""),
"c6_neolitico": S("""
El Neolítico es la segunda etapa de la Prehistoria. | A neolitikum az őskor második szakasza.
Hacia el año 8000 a. C. hubo un gran cambio. | Kr. e. 8000 körül nagy változás történt.
Los seres humanos descubrieron la agricultura y la ganadería. | Az emberek felfedezték a földművelést és az állattenyésztést.
Cultivaban cereales y criaban ovejas y cabras. | Gabonát termesztettek, és juhokat meg kecskéket tartottak.
Se hicieron sedentarios: vivían siempre en el mismo lugar. | Letelepedtek: mindig ugyanazon a helyen éltek.
Vivían en poblados cerca de los campos. | Falvakban éltek a földek közelében.
Inventaron la cerámica para guardar alimentos. | Feltalálták a kerámiát az élelem tárolására.
Inventaron el telar para hacer tejidos. | Feltalálták a szövőszéket a szövetek készítésére.
Hacían herramientas de piedra pulida, como el hacha. | Csiszolt kőből készítettek szerszámokat, például fejszét.
"""),
"c6_metales": S("""
La Edad de los Metales es la última etapa de la Prehistoria. | A fémkor az őskor utolsó szakasza.
Las personas aprendieron a trabajar los metales. | Az emberek megtanulták megmunkálni a fémeket.
Con los metales hacían herramientas, armas y adornos. | A fémekből szerszámokat, fegyvereket és díszeket készítettek.
Primero fue la Edad del Cobre. | Először a rézkor jött.
Después vino la Edad del Bronce. El bronce es una mezcla de cobre y estaño. | Utána a bronzkor jött. A bronz réz és ón keveréke.
Al final fue la Edad del Hierro. El hierro es más duro. | A végén a vaskor volt. A vas keményebb.
Inventaron la rueda, el arado y la vela de los barcos. | Feltalálták a kereket, az ekét és a hajók vitorláját.
Aparecieron los primeros jefes y las primeras ciudades con murallas. | Megjelentek az első vezetők és az első fallal körülvett városok.
"""),
"c6_arte": S("""
El arte prehistórico son las primeras obras de arte. | Az őskori művészet az első műalkotásokból áll.
Las pinturas rupestres están en las paredes y los techos de las cuevas. | A barlangfestmények a barlangok falain és mennyezetén vannak.
En el Paleolítico pintaban animales: ciervos, caballos y bisontes. | A paleolitikumban állatokat festettek: szarvasokat, lovakat és bölényeket.
Estas pinturas son muy realistas y tienen muchos colores. | Ezek a festmények nagyon élethűek, és sok színűek.
La cueva de Altamira es muy famosa. | Az Altamira-barlang nagyon híres.
En el Neolítico las figuras son sencillas. | A neolitikumban az alakok egyszerűek.
En esas pinturas aparecen personas cazando o bailando. | Ezeken a festményeken vadászó vagy táncoló emberek láthatók.
En la Edad de los Metales construyeron los megalitos. | A fémkorban megalitokat építettek.
Los dólmenes, los menhires y el crómlech son megalitos. | A dolmenek, a menhirek és a kőkör megalitok.
Stonehenge, en Inglaterra, es un crómlech. | A Stonehenge Angliában egy kőkör.
"""),
"c6_ciencias": S("""
Los historiadores leen documentos antiguos. | A történészek régi dokumentumokat olvasnak.
La Arqueología busca objetos bajo la tierra. | A régészet tárgyakat keres a föld alatt.
Un arqueólogo encuentra herramientas, collares y mosaicos. | A régész szerszámokat, nyakláncokat és mozaikokat talál.
Los arqueólogos excavan en los yacimientos. | A régészek a lelőhelyeken ásnak.
Atapuerca es un yacimiento muy importante. | Az Atapuerca nagyon fontos lelőhely.
En Atapuerca hay fósiles de los primeros seres humanos de la Península. | Atapuercában a félsziget első embereinek kövületei vannak.
La Paleontología estudia los fósiles. | Az őslénytan a kövületeket tanulmányozza.
Hay fósiles de dinosaurios, de plantas y de animales prehistóricos. | Vannak dinoszauruszok, növények és őskori állatok kövületei.
Así sabemos cómo era la vida hace millones de años. | Így tudjuk, milyen volt az élet millió évekkel ezelőtt.
"""),
})

DIALOGUES.update({
"c6_paleolitico": D("""
Profe | Martín, ¿qué es el Paleolítico? | Martin, mi a paleolitikum?
Martín | Es el período más antiguo y más largo de la Prehistoria. | Az őskor legrégebbi és leghosszabb időszaka.
Profe | ¿Cuándo empezó? | Mikor kezdődött?
Martín | Hace más de dos millones de años. | Több mint kétmillió éve.
Profe | ¿Cómo vivían las personas? | Hogyan éltek az emberek?
Martín | Eran nómadas. Se movían buscando comida. | Nomádok voltak. Élelmet keresve vándoroltak.
Profe | ¿Qué hacían para comer? | Mit csináltak, hogy együnk?
Martín | Eran cazadores y recolectores: cazaban, pescaban y recogían frutos. | Vadászok és gyűjtögetők voltak: vadásztak, halásztak és gyümölcsöt szedtek.
Profe | ¿Dónde vivían? | Hol laktak?
Martín | En cuevas y en cabañas. | Barlangokban és kunyhókban.
Profe | ¿Qué descubrieron? | Mit fedeztek fel?
Martín | El fuego. Daba luz y calor y protegía de los animales. | A tüzet. Fényt és meleget adott, és védett az állatoktól.
"""),
"c6_neolitico": D("""
Lola | Papá, ¿qué cambió en el Neolítico? | Apa, mi változott a neolitikumban?
Papá | Las personas descubrieron la agricultura y la ganadería. | Az emberek felfedezték a földművelést és az állattenyésztést.
Lola | ¿Qué cultivaban? | Mit termesztettek?
Papá | Cereales. Y criaban ovejas y cabras. | Gabonát. És juhokat meg kecskéket tartottak.
Lola | Entonces ya no eran nómadas. | Akkor már nem voltak nomádok.
Papá | Correcto. Se hicieron sedentarios y vivían en poblados. | Helyes. Letelepedtek, és falvakban éltek.
Lola | ¿Por qué vivían cerca de los campos? | Miért laktak a földek közelében?
Papá | Porque tenían que cuidar los cultivos y los animales. | Mert gondozniuk kellett a termést és az állatokat.
Lola | ¿Qué inventaron? | Mit találtak fel?
Papá | La cerámica para guardar alimentos y el telar para hacer tejidos. | A kerámiát az élelem tárolására és a szövőszéket a szövetek készítésére.
Lola | ¿Y las herramientas? | És a szerszámok?
Papá | De piedra pulida, como el hacha. | Csiszolt kőből voltak, például a fejsze.
"""),
"c6_metales": D("""
Profe | Martín, ¿cuál es la última etapa de la Prehistoria? | Martin, melyik az őskor utolsó szakasza?
Martín | La Edad de los Metales. | A fémkor.
Profe | ¿Qué aprendieron las personas? | Mit tanultak meg az emberek?
Martín | A trabajar los metales. | Megmunkálni a fémeket.
Profe | ¿Qué hacían con ellos? | Mit csináltak velük?
Martín | Herramientas, armas y adornos. | Szerszámokat, fegyvereket és díszeket.
Profe | ¿Qué períodos tiene? | Milyen időszakai vannak?
Martín | Primero el Cobre, después el Bronce y al final el Hierro. | Először a réz, utána a bronz, a végén a vas.
Profe | ¿Qué es el bronce? | Mi a bronz?
Martín | Una mezcla de cobre y estaño. El hierro es más duro. | Réz és ón keveréke. A vas keményebb.
Profe | ¿Qué inventaron? | Mit találtak fel?
Martín | La rueda, el arado y la vela de los barcos. | A kereket, az ekét és a hajók vitorláját.
"""),
"c6_arte": D("""
Guía | Bienvenidos a la cueva de Altamira. Aquí hay pinturas rupestres. | Üdvözlöm önöket az Altamira-barlangban. Itt barlangfestmények vannak.
Martín | ¿Qué animales pintaban? | Milyen állatokat festettek?
Guía | Ciervos, caballos y bisontes. | Szarvasokat, lovakat és bölényeket.
Martín | Son muy bonitos. ¡Tienen muchos colores! | Nagyon szépek. Sok színük van!
Guía | Sí, son realistas. Los artistas usaban los bultos de la roca. | Igen, élethűek. A művészek kihasználták a szikla dudorait.
Martín | ¿Y en el Neolítico? | És a neolitikumban?
Guía | Las figuras son más sencillas. Aparecen personas cazando o bailando. | Az alakok egyszerűbbek. Vadászó vagy táncoló emberek láthatók.
Martín | ¿Qué construyeron en la Edad de los Metales? | Mit építettek a fémkorban?
Guía | Los megalitos: dólmenes, menhires y crómlech. | A megalitokat: dolmeneket, menhireket és kőköröket.
Martín | ¿Dónde está Stonehenge? | Hol van a Stonehenge?
Guía | En Inglaterra. Es un crómlech muy famoso. | Angliában. Egy nagyon híres kőkör.
"""),
"c6_ciencias": D("""
Profe | Martín, ¿qué hace un historiador? | Martin, mit csinál egy történész?
Martín | Lee documentos antiguos. | Régi dokumentumokat olvas.
Profe | ¿Y un arqueólogo? | És egy régész?
Martín | Busca objetos bajo la tierra, como herramientas y collares. | Tárgyakat keres a föld alatt, például szerszámokat és nyakláncokat.
Profe | ¿Dónde excavan los arqueólogos? | Hol ásnak a régészek?
Martín | En los yacimientos. | A lelőhelyeken.
Profe | ¿Qué yacimiento español es muy importante? | Melyik spanyol lelőhely nagyon fontos?
Martín | Atapuerca. Tiene fósiles de los primeros seres humanos de la Península. | Az Atapuerca. A félsziget első embereinek kövületei vannak ott.
Profe | ¿Qué estudia la Paleontología? | Mit tanulmányoz az őslénytan?
Martín | Los fósiles de dinosaurios, plantas y animales prehistóricos. | A dinoszauruszok, növények és őskori állatok kövületeit.
Profe | ¿Para qué sirve? | Mire jó?
Martín | Para saber cómo era la vida hace millones de años. | Hogy megtudjuk, milyen volt az élet millió évekkel ezelőtt.
"""),
})
