import sys, os
sys.path.insert(0,'/home/claude/lengua')
import svgs as S
from svgs import svg, sun, cloud, tree, text, SKY, BLUE, ORANGE, GREEN, DGREEN, BROWN, DBROWN, YEL, GREY, DGREY, WHITE, RED, SAND, WATER, INK, PINK
S.OUT = '/home/claude/subjects/lengua/img'; os.makedirs(S.OUT, exist_ok=True)
import shutil
for f in os.listdir('/home/claude/lengua/img'): shutil.copy('/home/claude/lengua/img/'+f, S.OUT)
def pill(x,y,w,t,c,sz=18,tc=WHITE): return f'<rect x="{x}" y="{y}" width="{w}" height="40" rx="20" fill="{c}"/>{text(x+w/2,y+27,t,sz,tc)}'
def person(x,y,shirt=BLUE,s=1): return f'<g transform="translate({x} {y}) scale({s})"><circle cx="0" cy="-30" r="16" fill="{SAND}"/><rect x="-14" y="-14" width="28" height="44" rx="12" fill="{shirt}"/><circle cx="-5" cy="-33" r="2" fill="{INK}"/><circle cx="5" cy="-33" r="2" fill="{INK}"/><path d="M-5 -24 q5 4 10 0" stroke="{INK}" stroke-width="2" fill="none"/></g>'
def carrot(x,y,s=1): return f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0 l-12 -40 h24 z" fill="{ORANGE}"/><path d="M-10 -40 q10 -22 20 0 M0 -40 v-18" stroke="{GREEN}" stroke-width="5" stroke-linecap="round" fill="none"/></g>'
# U3
svg('u3_cover', f'''{sun()}{cloud(70,40)}{''.join(f'<rect x="{x}" y="120" width="60" height="50" fill="{DBROWN}"/>' for x in (30,100,170,240))}
{''.join(carrot(x,125,.7) for x in (45,75,115,145))}{''.join(f'<g transform="translate({x} 128)"><path d="M0 0 v-30" stroke="{DGREEN}" stroke-width="4"/><circle cx="0" cy="-34" r="10" fill="{RED}"/></g>' for x in (185,215,255,285))}''', ground=GREEN)
svg('jardin', f'''{sun()}<path d="M40 170 q0 -90 70 -100 q10 50 -20 100z" fill="{GREEN}"/><path d="M110 170 q-5 -70 40 -110 q40 40 30 110z" fill="{DGREEN}"/>{tree(230,130,1.1)}
<g transform="translate(70 150)"><rect x="-14" y="0" width="28" height="22" fill="{ORANGE}"/><path d="M0 0 v-26" stroke="{DGREEN}" stroke-width="4"/><circle cx="0" cy="-32" r="10" fill="{PINK}"/><circle cx="0" cy="-32" r="4" fill="{YEL}"/></g>
<rect x="150" y="30" width="110" height="36" rx="8" fill="{WHITE}" stroke="{BLUE}" stroke-width="3"/>{text(205,55,'JARDÍN',16,BLUE)}''', ground=SAND)
svg('experiencia', f'''{person(80,120,ORANGE,1.4)}<path d="M130 60 h140 a12 12 0 0 1 12 12 v50 a12 12 0 0 1 -12 12 h-100 l-16 14 v-14 h-24 a12 12 0 0 1 -12 -12 v-50 a12 12 0 0 1 12 -12z" fill="{WHITE}"/>
{text(206,88,'Ayer fui…',20,BLUE)}{text(206,118,'1 → 2 → 3',18,ORANGE)}''', bg='#FDEBD3')
svg('adjetivo', f'''<g transform="translate(90 120)"><path d="M0 40 v-50" stroke="{DGREEN}" stroke-width="5"/><path d="M0 -10 q-20 -8 -16 -28 q16 6 16 28z" fill="{GREEN}"/>{''.join(f'<circle cx="{cx}" cy="{cy}" r="16" fill="{RED}"/>' for cx,cy in ((-14,-26),(14,-26),(0,-44),(-9,-12),(9,-12)))}<circle cx="0" cy="-26" r="10" fill="#B8304A"/></g>
{text(90,195,'rosa',20,INK)}{pill(170,70,120,'roja',RED,22)}{pill(170,120,120,'grande',BLUE,22)}{text(230,185,'adjetivos',16,DGREY,'400')}''', bg='#FFF0DE')
svg('sinonimos', f'''{pill(30,60,110,'caminar',BLUE,20)}{text(160,88,'=',34,INK)}{pill(180,60,110,'andar',BLUE,20)}
{pill(30,130,110,'cumbre',DGREEN,20)}{text(160,158,'=',34,INK)}{pill(180,130,110,'cima',DGREEN,20)}''', bg='#E8F4FA')
svg('zanahoria', f'''{carrot(70,150,1.5)}{text(70,195,'zanahoria',17,INK)}<g transform="translate(200 110)"><circle cx="0" cy="0" r="30" fill="#7D3C98"/><circle cx="-10" cy="-8" r="6" fill="#A569BD"/><path d="M0 -30 v-14" stroke="{DGREEN}" stroke-width="4"/></g>{text(200,170,'ciruelo',17,INK)}
<text x="265" y="50" font-family="Verdana, Arial, sans-serif" font-size="28" font-weight="700" fill="{RED}">z</text><text x="285" y="50" font-family="Verdana, Arial, sans-serif" font-size="28" font-weight="700" fill="{BLUE}">c</text>''', bg='#FFF4D6')
svg('narracion', f'''{''.join(f'<rect x="{x}" y="60" width="80" height="100" rx="10" fill="{c}"/>' for x,c in ((25,BLUE),(120,ORANGE),(215,GREEN)))}
{text(65,115,'1',40,WHITE)}{text(160,115,'2',40,WHITE)}{text(255,115,'3',40,WHITE)}{text(65,185,'inicio',15,INK)}{text(160,185,'nudo',15,INK)}{text(255,185,'desenlace',15,INK)}''', bg='#F3F0FA')
svg('postal', f'''<rect x="30" y="40" width="260" height="150" rx="6" fill="{WHITE}" stroke="{GREY}" stroke-width="3"/><line x1="160" y1="50" x2="160" y2="180" stroke="{GREY}" stroke-width="2"/>
{''.join(f'<line x1="42" y1="{y}" x2="146" y2="{y}" stroke="{BLUE}" stroke-width="3" stroke-linecap="round"/>' for y in (70,86,102,118,134))}{text(60,165,'Tu abuelo',12,INK,'400','start')}
<rect x="240" y="50" width="38" height="30" fill="{YEL}" stroke="{ORANGE}" stroke-width="2"/>{''.join(f'<line x1="172" y1="{y}" x2="260" y2="{y}" stroke="{GREY}" stroke-width="3"/>' for y in (120,136,152))}''', bg='#DFF1FB')
# U4
svg('u4_cover', f'''<rect x="40" y="70" width="240" height="110" rx="12" fill="{BROWN}"/>{''.join(f'<line x1="{x}" y1="70" x2="{x}" y2="180" stroke="{DBROWN}" stroke-width="4"/>' for x in range(60,280,24))}
<g transform="translate(110 150)"><ellipse cx="0" cy="0" rx="26" ry="18" fill="{ORANGE}"/><circle cx="24" cy="-10" r="14" fill="{ORANGE}"/><path d="M14 -22 l4 -12 8 10 M30 -22 l6 -10 2 12" fill="{ORANGE}"/><circle cx="28" cy="-12" r="2" fill="{INK}"/></g>
<g transform="translate(210 150)"><ellipse cx="0" cy="0" rx="24" ry="18" fill="{GREY}"/><circle cx="-22" cy="-10" r="13" fill="{GREY}"/><path d="M-30 -22 l-2 -12 8 6 M-14 -22 l2 -12 -8 6" fill="{GREY}"/><circle cx="-26" cy="-12" r="2" fill="{INK}"/></g>''', ground=GREEN)
svg('dally', f'''{sun()}<g transform="translate(170 130)"><ellipse cx="0" cy="0" rx="60" ry="30" fill="{BROWN}"/><rect x="40" y="-40" width="26" height="50" rx="10" fill="{BROWN}" transform="rotate(20 53 -15)"/><ellipse cx="70" cy="-44" rx="22" ry="16" fill="{BROWN}"/><path d="M60 -58 l-2 -14 10 10 M78 -58 l4 -14 2 14" fill="{DBROWN}"/>{''.join(f'<rect x="{x}" y="22" width="11" height="36" rx="5" fill="{DBROWN}"/>' for x in (-44,-22,14,36))}<path d="M-60 -6 q-18 10 -12 36" stroke="{DBROWN}" stroke-width="6" fill="none"/></g>
<g transform="translate(150 78)"><ellipse cx="0" cy="0" rx="22" ry="12" fill="{WHITE}" stroke="{GREY}" stroke-width="2"/><circle cx="20" cy="-8" r="10" fill="{WHITE}" stroke="{GREY}" stroke-width="2"/><ellipse cx="26" cy="-14" rx="4" ry="7" fill="{DGREY}"/><circle cx="24" cy="-9" r="2" fill="{INK}"/></g>''', ground=GREEN)
svg('descripcion_animal', f'''<g transform="translate(110 120)"><ellipse cx="0" cy="10" rx="46" ry="30" fill="{GREY}"/><circle cx="36" cy="-16" r="26" fill="{GREY}"/><path d="M20 -38 l2 -18 14 12z M52 -38 l-2 -18 -14 12z" fill="{GREY}"/><circle cx="30" cy="-20" r="4" fill="{GREEN}"/><circle cx="46" cy="-20" r="4" fill="{GREEN}"/><path d="M34 -8 h8" stroke="{PINK}" stroke-width="4"/><path d="M-46 0 q-20 -30 0 -50" stroke="{GREY}" stroke-width="10" fill="none" stroke-linecap="round"/></g>
{text(240,70,'tamaño',16,BLUE)}{text(240,100,'pelaje',16,BLUE)}{text(240,130,'ojos',16,BLUE)}{text(240,160,'comportamiento',14,BLUE)}''', bg='#FFF0DE')
svg('pronombres', ''.join(pill(x,y,80,t,c,18) for x,y,t,c in ((20,30,'yo',BLUE),(120,30,'tú',RED),(220,30,'él · ella',GREEN),(20,90,'nosotros',BLUE),(120,90,'vosotros',RED),(220,90,'ellos',GREEN)))+f'{person(60,180,BLUE,.9)}{person(160,180,RED,.9)}{person(260,180,GREEN,.9)}', bg='#F3F0FA')
svg('antonimos', f'''<rect x="30" y="50" width="100" height="110" rx="10" fill="{WHITE}" stroke="{GREY}" stroke-width="3"/>{text(80,185,'limpio',16,INK)}
<rect x="190" y="50" width="100" height="110" rx="10" fill="{WHITE}" stroke="{GREY}" stroke-width="3"/>{''.join(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{BROWN}"/>' for cx,cy,r in ((215,80,8),(250,100,11),(270,70,6),(230,130,9),(265,140,7)))}{text(240,185,'sucio',16,INK)}{text(160,110,'≠',40,RED)}''', bg='#E8F4FA')
svg('hueso', f'''<g transform="translate(90 110) rotate(-25)"><rect x="-40" y="-9" width="80" height="18" rx="9" fill="{WHITE}" stroke="{GREY}" stroke-width="2"/>{''.join(f'<circle cx="{cx}" cy="{cy}" r="11" fill="{WHITE}" stroke="{GREY}" stroke-width="2"/>' for cx,cy in ((-40,-8),(-40,8),(40,-8),(40,8)))}</g>{text(90,180,'hueso',18,INK)}
<path d="M200 70 l30 -14 30 14 v60 l-30 14 -30 -14z" fill="#CFEAF7" stroke="{WHITE}" stroke-width="3"/><path d="M200 70 l30 14 30 -14 M230 84 v60" stroke="{WHITE}" stroke-width="3" fill="none"/>{text(230,180,'hielo',18,INK)}
<text x="150" y="40" font-family="Verdana, Arial, sans-serif" font-size="30" font-weight="700" fill="{RED}" text-anchor="middle">h</text>''', bg='#FFF4D6')
svg('cuento', f'''<path d="M40 60 q50 -16 100 0 v110 q-50 -16 -100 0z" fill="{WHITE}" stroke="{BLUE}" stroke-width="4"/><path d="M140 60 q50 -16 100 0 v110 q-50 -16 -100 0z" fill="{WHITE}" stroke="{BLUE}" stroke-width="4"/>
<path d="M95 80 l6 14 15 2 -11 10 3 15 -13 -7 -13 7 3 -15 -11 -10 15 -2z" fill="{YEL}"/>{''.join(f'<line x1="156" y1="{y}" x2="224" y2="{y}" stroke="{GREY}" stroke-width="3"/>' for y in (84,98,112,126,140))}
{text(260,40,'Érase una vez…',14,BLUE,'700','end')}''', bg='#EAF1FB')
svg('folleto', f'''<rect x="70" y="30" width="180" height="160" rx="8" fill="{WHITE}" stroke="{ORANGE}" stroke-width="4"/><rect x="70" y="30" width="180" height="40" rx="8" fill="{ORANGE}"/><rect x="70" y="60" width="180" height="10" fill="{ORANGE}"/>
{text(160,57,'CAMPAÑA',18,WHITE)}<rect x="85" y="80" width="60" height="45" rx="6" fill="{SKY}"/>{sun(125,92,8)}{''.join(f'<line x1="155" y1="{y}" x2="235" y2="{y}" stroke="{GREY}" stroke-width="3"/>' for y in (88,102,116))}
{text(160,150,'Día · Hora · Lugar',12,INK)}{text(160,178,'¡Regala sonrisas!',14,RED)}''', bg='#E9F7EF')
# U5
svg('u5_cover', f'''{sun()}{cloud(60,40)}<path d="M0 170 L80 70 L140 140 L200 50 L270 150 L320 100 V170Z" fill="{GREY}"/><path d="M188 68 L200 50 L212 68Z" fill="{WHITE}"/>
<path d="M120 170 l30 -46 30 46z" fill="{ORANGE}"/><path d="M150 124 v46" stroke="{DBROWN}" stroke-width="3"/>{tree(50,145,.8,DGREEN)}{tree(270,150,.7,DGREEN)}''', ground=GREEN)
svg('castor', f'''{sun()}<rect x="0" y="130" width="320" height="90" fill="{WATER}"/>{''.join(f'<path d="M{x} {y} q10 -6 20 0" stroke="{WHITE}" stroke-width="3" fill="none"/>' for x,y in ((20,160),(90,190),(230,165),(280,195)))}
<g transform="translate(150 120)"><ellipse cx="0" cy="0" rx="40" ry="28" fill="{BROWN}"/><circle cx="34" cy="-16" r="20" fill="{BROWN}"/><circle cx="26" cy="-30" r="6" fill="{DBROWN}"/><circle cx="46" cy="-30" r="6" fill="{DBROWN}"/><circle cx="38" cy="-18" r="3" fill="{INK}"/><rect x="40" y="-6" width="8" height="10" fill="{WHITE}"/><path d="M-40 6 q-30 0 -36 20 q20 6 40 -8z" fill="{DBROWN}"/></g>''')
svg('instrucciones', ''.join(f'<g transform="translate(40 {y})"><circle cx="0" cy="0" r="18" fill="{c}"/>{text(0,7,str(i),20,WHITE)}<rect x="30" y="-10" width="{w}" height="20" rx="10" fill="{GREY}"/></g>' for i,y,c,w in ((1,60,BLUE,200),(2,110,ORANGE,160),(3,160,GREEN,220))), bg='#F3F0FA')
svg('verbo', f'''{person(60,130,BLUE,1.1)}<g transform="translate(90 100)"><circle cx="0" cy="0" r="12" fill="{RED}"/></g>{text(60,190,'jugar',16,INK)}
{person(160,130,GREEN,1.1)}<rect x="176" y="92" width="14" height="22" rx="4" fill="{WATER}"/>{text(160,190,'beber',16,INK)}
{person(260,130,ORANGE,1.1)}<path d="M278 84 h30 a8 8 0 0 1 8 8 v16 a8 8 0 0 1 -8 8 h-20 l-10 8 v-8 a8 8 0 0 1 -8 -8 v-16 a8 8 0 0 1 8 -8z" fill="{WHITE}"/>{text(260,190,'decir',16,INK)}''', bg='#FFF4D6')
svg('tiempos', f'''<line x1="30" y1="120" x2="290" y2="120" stroke="{INK}" stroke-width="4"/><path d="M282 112 l10 8 -10 8" stroke="{INK}" stroke-width="4" fill="none"/>
{''.join(f'<circle cx="{x}" cy="120" r="10" fill="{c}"/>' for x,c in ((70,GREY),(160,GREEN),(250,ORANGE)))}{text(70,90,'ayer',16,GREY)}{text(160,90,'hoy',16,DGREEN)}{text(250,90,'mañana',16,ORANGE)}
{text(70,160,'pasado',14,INK)}{text(160,160,'presente',14,INK)}{text(250,160,'futuro',14,INK)}''', bg='#E8F4FA')
svg('prefijos', f'''{pill(20,60,70,'des-',RED,18)}{text(100,88,'+',26,INK)}{pill(115,60,180,'abrochar',BLUE,18)}{text(160,130,'↓',30,INK)}{pill(60,150,200,'desabrochar',DGREEN,18)}''', bg='#FFF0DE')
svg('agudas', f'''{''.join(f'<rect x="{x}" y="90" width="60" height="50" rx="8" fill="{c}"/>{text(x+30,122,t,20,WHITE)}' for x,t,c in ((50,'ca',GREY),(120,'ra',GREY),(190,'col',RED)))}{text(220,70,'¡fuerte!',14,RED)}{text(160,180,'aguda: última sílaba',15,INK)}''', bg='#F3F0FA')
svg('leyenda', f'''<rect width="320" height="220" rx="18" fill="#2C3E66"/>{''.join(f'<circle cx="{x}" cy="{y}" r="2" fill="{WHITE}"/>' for x,y in ((30,30),(90,20),(150,40),(210,25),(270,45),(60,70),(250,80)))}
<path d="M0 170 L60 90 L120 150 L180 60 L250 160 L320 110 V220 H0Z" fill="#4A5A8C"/><circle cx="270" cy="50" r="22" fill="{YEL}"/><rect x="0" y="170" width="320" height="50" fill="{WATER}"/>
<path d="M265 70 q4 10 0 18 M278 72 q4 10 0 18" stroke="{WATER}" stroke-width="4" stroke-linecap="round" fill="none"/>''', bg='#2C3E66')
svg('receta', f'''<rect x="40" y="30" width="240" height="160" rx="10" fill="{WHITE}" stroke="{ORANGE}" stroke-width="3"/>{text(160,58,'Receta',20,ORANGE)}
<text x="56" y="90" font-family="Verdana, Arial, sans-serif" font-size="13" font-weight="700" fill="{INK}">Ingredientes</text>{''.join(f'<line x1="56" y1="{y}" x2="150" y2="{y}" stroke="{GREY}" stroke-width="3"/>' for y in (102,114,126))}
<text x="176" y="90" font-family="Verdana, Arial, sans-serif" font-size="13" font-weight="700" fill="{INK}">Preparación</text>{''.join(f'<circle cx="182" cy="{y}" r="6" fill="{GREEN}"/><line x1="194" y1="{y}" x2="262" y2="{y}" stroke="{GREY}" stroke-width="3"/>' for y in (102,118,134,150))}
<g transform="translate(90 160)"><ellipse cx="0" cy="0" rx="28" ry="10" fill="{GREY}"/><rect x="-28" y="-14" width="56" height="14" fill="{DGREY}"/><rect x="28" y="-10" width="30" height="6" fill="{DGREY}"/></g>''', bg='#FDEBD3')
# U6
svg('u6_cover', f'''<rect x="30" y="40" width="260" height="10" fill="{DBROWN}"/>{''.join(f'<g transform="translate({x} 50)"><path d="M0 0 v18" stroke="{DGREY}" stroke-width="3"/><path d="M-26 20 l10 -8 h32 l10 8 v70 h-52z" fill="{c}"/><path d="M-6 12 q6 8 12 0" stroke="{WHITE}" stroke-width="3" fill="none"/></g>' for x,c in ((70,RED),(135,BLUE),(200,GREEN),(265,ORANGE)))}
{text(160,195,'segunda mano',16,INK)}''', bg='#FFF4D6')
svg('soldados', f'''{''.join(f'<g transform="translate({x} 130)"><rect x="-12" y="-20" width="24" height="50" rx="4" fill="{RED}"/><circle cx="0" cy="-34" r="14" fill="{SAND}"/><rect x="-14" y="-62" width="28" height="30" rx="6" fill="{INK}"/><rect x="-12" y="30" width="24" height="12" fill="{INK}"/><circle cx="0" cy="-5" r="3" fill="{YEL}"/><circle cx="0" cy="8" r="3" fill="{YEL}"/></g>' for x in (50,110,170,230))}
<g transform="translate(285 110)"><ellipse cx="0" cy="20" rx="18" ry="22" fill="{GREY}"/><path d="M-18 20 q0 -40 18 -40 q0 20 -8 40z" fill="{GREY}"/></g>''', ground=SAND)
svg('pelicula', f'''<rect x="50" y="50" width="220" height="130" rx="8" fill="{INK}"/><rect x="50" y="50" width="220" height="22" fill="{DGREY}"/><rect x="50" y="158" width="220" height="22" fill="{DGREY}"/>
{''.join(f'<rect x="{x}" y="55" width="14" height="12" fill="{WHITE}"/><rect x="{x}" y="163" width="14" height="12" fill="{WHITE}"/>' for x in range(58,268,26))}
<path d="M138 95 l50 20 -50 20z" fill="{YEL}"/>{text(160,205,'Título · personajes · historia',12,INK)}''', bg='#F3F0FA')
svg('adverbio', f'''<line x1="30" y1="150" x2="290" y2="150" stroke="{INK}" stroke-width="3"/>{person(70,140,BLUE,1)}{tree(250,130,.9)}
<path d="M100 120 q75 -60 130 -10" stroke="{ORANGE}" stroke-width="4" fill="none" stroke-dasharray="8 6"/>{text(165,60,'cerca · lejos',18,ORANGE)}{text(165,90,'ayer · hoy · mañana',16,BLUE)}''', bg='#E8F4FA')
svg('sufijos', f'''{pill(20,60,100,'carta',BLUE,18)}{text(130,88,'+',26,INK)}{pill(150,60,70,'-ero',RED,18)}{text(230,88,'=',26,INK)}
{person(270,120,BLUE,.9)}<rect x="252" y="100" width="36" height="24" rx="4" fill="{WHITE}" stroke="{GREY}" stroke-width="2"/>{pill(40,150,200,'cartero',DGREEN,20)}''', bg='#FFF0DE')
svg('llanas', f'''{''.join(f'<rect x="{x}" y="90" width="60" height="50" rx="8" fill="{c}"/>{text(x+30,122,t,20,WHITE)}' for x,t,c in ((50,'ca',GREY),(120,'mi',RED),(190,'no',GREY)))}{text(150,70,'¡fuerte!',14,RED)}{text(160,180,'llana: penúltima sílaba',15,INK)}''', bg='#F3F0FA')
svg('fabula', f'''{sun()}<g transform="translate(90 140)"><ellipse cx="0" cy="0" rx="36" ry="22" fill="{ORANGE}"/><circle cx="30" cy="-14" r="16" fill="{ORANGE}"/><path d="M22 -28 l0 -14 10 10 M40 -28 l2 -14 -10 10" fill="{ORANGE}"/><circle cx="34" cy="-16" r="2" fill="{INK}"/><path d="M-36 0 q-20 -16 -10 -34" stroke="{ORANGE}" stroke-width="10" fill="none" stroke-linecap="round"/></g>
<g transform="translate(230 110)"><ellipse cx="0" cy="20" rx="24" ry="18" fill="{WHITE}" stroke="{GREY}" stroke-width="2"/><path d="M0 4 q-6 -40 10 -50" stroke="{WHITE}" stroke-width="8" fill="none"/><circle cx="12" cy="-48" r="9" fill="{WHITE}" stroke="{GREY}" stroke-width="2"/><path d="M20 -48 l30 4 -30 4z" fill="{RED}"/><circle cx="14" cy="-50" r="2" fill="{INK}"/><rect x="-8" y="36" width="4" height="30" fill="{RED}"/><rect x="6" y="36" width="4" height="30" fill="{RED}"/></g>
<ellipse cx="160" cy="175" rx="34" ry="10" fill="{GREY}"/>''', ground=GREEN)
svg('carta', f'''<rect x="40" y="60" width="240" height="130" rx="8" fill="{WHITE}" stroke="{GREY}" stroke-width="3"/><path d="M40 60 l120 80 120 -80" stroke="{GREY}" stroke-width="3" fill="none"/>
<rect x="232" y="70" width="36" height="28" fill="{YEL}" stroke="{ORANGE}" stroke-width="2"/>{text(255,88,'€',14,ORANGE)}{''.join(f'<line x1="60" y1="{y}" x2="150" y2="{y}" stroke="{BLUE}" stroke-width="3"/>' for y in (150,164,178))}
{text(160,40,'Hola, Laura:',18,BLUE)}''', bg='#E9F7EF')
# U7
svg('u7_cover', f'''<rect width="320" height="220" rx="18" fill="#1B2A4A"/>{''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{WHITE}"/>' for x,y,r in ((30,30,2),(80,60,3),(140,25,2),(200,50,3),(260,30,2),(300,80,3),(50,110,2),(280,130,2),(120,90,2),(220,110,3)))}
<circle cx="250" cy="60" r="26" fill="{YEL}"/><circle cx="240" cy="52" r="6" fill="#E3C14A"/><circle cx="258" cy="70" r="4" fill="#E3C14A"/>
<g transform="translate(110 140)"><path d="M0 -60 q30 30 20 80 h-40 q-10 -50 20 -80z" fill="{WHITE}"/><circle cx="0" cy="-10" r="10" fill="{SKY}"/><path d="M-20 20 l-18 20 h18z M20 20 l18 20 h-18z" fill="{RED}"/><path d="M-10 22 q10 30 20 0z" fill="{ORANGE}"/></g>''', bg='#1B2A4A')
svg('galileo', f'''<rect width="320" height="220" rx="18" fill="#1B2A4A"/>{''.join(f'<circle cx="{x}" cy="{y}" r="2" fill="{WHITE}"/>' for x,y in ((30,30),(90,20),(150,40),(210,25),(270,45),(60,70),(250,80)))}
<circle cx="260" cy="60" r="22" fill="{YEL}"/><g transform="translate(120 150) rotate(-35)"><rect x="-10" y="-70" width="20" height="90" rx="4" fill="{BROWN}"/><rect x="-14" y="-80" width="28" height="14" rx="3" fill="{DBROWN}"/></g>
<path d="M118 150 l-30 50 M118 150 l30 50" stroke="{DBROWN}" stroke-width="5"/>{person(60,180,BLUE,1)}''', bg='#1B2A4A')
svg('entrevista', f'''{person(80,150,BLUE,1.3)}{person(240,150,ORANGE,1.3)}<rect x="96" y="112" width="8" height="30" fill="{DGREY}"/><circle cx="100" cy="108" r="8" fill="{INK}"/>
<path d="M110 40 h100 a10 10 0 0 1 10 10 v30 a10 10 0 0 1 -10 10 h-70 l-14 12 v-12 h-16 a10 10 0 0 1 -10 -10 v-30 a10 10 0 0 1 10 -10z" fill="{WHITE}"/>{text(160,70,'¿…?',24,BLUE)}''', bg='#FFF4D6')
svg('preposicion', f'''{pill(20,40,80,'a',BLUE,20)}{pill(110,40,80,'con',BLUE,20)}{pill(200,40,100,'de · en',BLUE,20)}
{pill(20,100,80,'y',GREEN,20)}{pill(110,100,80,'o',GREEN,20)}{pill(200,100,100,'pero',GREEN,20)}
{pill(20,160,80,'¡Oh!',RED,20)}{pill(110,160,80,'¡Ay!',RED,20)}{pill(200,160,100,'¡Uf!',RED,20)}''', bg='#F3F0FA')
svg('compuestas', f'''{pill(30,50,100,'abre',BLUE,18)}{text(145,78,'+',26,INK)}{pill(165,50,100,'latas',ORANGE,18)}{text(160,120,'↓',30,INK)}{pill(60,140,200,'abrelatas',DGREEN,20)}''', bg='#FFF0DE')
svg('esdrujulas', f'''{''.join(f'<rect x="{x}" y="90" width="55" height="50" rx="8" fill="{c}"/>{text(x+27,122,t,18,WHITE)}' for x,t,c in ((30,'sa',GREY),(95,'té',RED),(160,'li',GREY),(225,'te',GREY)))}{text(122,70,'¡fuerte!',14,RED)}{text(160,180,'esdrújula: antepenúltima',14,INK)}''', bg='#F3F0FA')
svg('teatro', f'''<rect x="20" y="30" width="280" height="160" fill="#7B1E3A"/><path d="M20 30 q70 40 0 160z" fill="#A52A4A"/><path d="M300 30 q-70 40 0 160z" fill="#A52A4A"/><rect x="60" y="150" width="200" height="40" fill="{DBROWN}"/>
{person(120,150,BLUE,1.1)}{person(200,150,ORANGE,1.1)}{sun(160,60,14)}''', bg='#1B2A4A')
svg('comic', f'''{''.join(f'<rect x="{x}" y="{y}" width="120" height="80" fill="{WHITE}" stroke="{INK}" stroke-width="3"/>' for x,y in ((35,30),(165,30),(35,120),(165,120)))}
<path d="M60 50 h50 a8 8 0 0 1 8 8 v16 a8 8 0 0 1 -8 8 h-30 l-8 8 v-8 h-12 a8 8 0 0 1 -8 -8 v-16 a8 8 0 0 1 8 -8z" fill="{SKY}" stroke="{INK}" stroke-width="2"/>{text(93,72,'¡Hola!',12,INK)}
<path d="M225 70 l-14 -10 6 -14 12 10 8 -14 6 16 16 -4 -8 14 12 10 -16 2 2 16 -12 -8 -10 12z" fill="{YEL}" stroke="{RED}" stroke-width="2"/>{text(225,76,'BOOM',11,RED)}
{person(80,195,GREEN,.7)}{person(230,195,BLUE,.7)}''', bg='#FDEBD3')
# U8
svg('u8_cover', f'''{sun()}<path d="M0 100 L60 40 L120 90 L180 30 L240 80 L320 50 V120 H0Z" fill="{GREY}"/><rect x="0" y="120" width="320" height="100" fill="{GREEN}"/><path d="M0 200 q80 -30 160 0 t160 0 V220 H0Z" fill="{WATER}"/>
<g transform="translate(160 120)"><circle cx="0" cy="0" r="30" fill="{WHITE}" stroke="{INK}" stroke-width="3"/><path d="M0 -24 l6 20 -6 -4 -6 4z" fill="{RED}"/><path d="M0 24 l6 -20 -6 4 -6 -4z" fill="{INK}"/>{text(0,-32,'N',12,INK)}{text(0,44,'S',12,INK)}</g>''', ground=GREEN)
svg('noticia', f'''{person(70,150,BLUE,1.3)}<rect x="86" y="112" width="8" height="30" fill="{DGREY}"/><circle cx="90" cy="108" r="8" fill="{INK}"/>
<rect x="130" y="40" width="160" height="110" rx="10" fill="{WHITE}"/>{text(210,68,'¿Qué?',16,BLUE)}{text(210,92,'¿Quién?',16,BLUE)}{text(210,116,'¿Cuándo?',16,BLUE)}{text(210,140,'¿Dónde?',16,BLUE)}''', bg='#FFF4D6')
svg('parrafo', f'''<rect x="60" y="30" width="200" height="160" rx="6" fill="{WHITE}" stroke="{GREY}" stroke-width="3"/>{''.join(f'<line x1="76" y1="{y}" x2="{x2}" y2="{y}" stroke="{BLUE}" stroke-width="4" stroke-linecap="round"/>' for y,x2 in ((50,240),(62,244),(74,200)))}
{''.join(f'<line x1="76" y1="{y}" x2="{x2}" y2="{y}" stroke="{ORANGE}" stroke-width="4" stroke-linecap="round"/>' for y,x2 in ((100,244),(112,238),(124,210)))}{''.join(f'<line x1="76" y1="{y}" x2="{x2}" y2="{y}" stroke="{GREEN}" stroke-width="4" stroke-linecap="round"/>' for y,x2 in ((150,240),(162,190)))}
{text(290,64,'1',14,BLUE)}{text(290,114,'2',14,ORANGE)}{text(290,158,'3',14,DGREEN)}''', bg='#F3F0FA')
svg('enunciados', f'''{pill(30,40,260,'Estamos en el parque.',BLUE,15)}{pill(30,95,260,'¿Estamos en el parque?',ORANGE,15)}{pill(30,150,260,'¡Estamos en el parque!',RED,15)}''', bg='#E8F4FA')
svg('familia_palabras', f'''<rect x="130" y="130" width="60" height="22" rx="4" fill="{BROWN}"/>{text(160,146,'pan',14,WHITE)}<rect x="158" y="80" width="4" height="50" fill="{DGREEN}"/><path d="M160 85 l-80 -30 M160 85 l80 -30 M160 85 v-40" stroke="{DGREEN}" stroke-width="4"/>
{pill(10,40,100,'panadera',GREEN,12)}{pill(110,6,100,'panecillo',GREEN,12)}{pill(212,40,104,'panadería',GREEN,12)}{text(160,190,'raíz: pan-',16,INK)}''', bg='#FFF0DE')
svg('punto', f'''{''.join(f'<rect x="{x}" y="60" width="70" height="70" rx="10" fill="{c}"/>' for x,c in ((30,BLUE),(125,ORANGE),(220,RED)))}{text(65,112,'.',60,WHITE)}{text(160,112,'A',44,WHITE)}{text(255,112,'…',40,WHITE)}
{text(65,165,'punto',14,INK)}{text(160,165,'mayúscula',14,INK)}{text(255,165,'suspensivos',13,INK)}''', bg='#F3F0FA')
svg('rima', f'''<path d="M60 50 q50 -16 100 0 v120 q-50 -16 -100 0z" fill="{WHITE}" stroke="{BLUE}" stroke-width="4"/>{''.join(f'<line x1="76" y1="{y}" x2="{x2}" y2="{y}" stroke="{GREY}" stroke-width="3"/>' for y,x2 in ((76,130),(96,120),(116,134),(136,124)))}
{''.join(f'<rect x="{x}" y="{y-6}" width="16" height="12" rx="3" fill="{c}"/>' for x,y,c in ((132,76,RED),(122,96,BLUE),(136,116,RED),(126,136,BLUE)))}
{text(240,80,'luz',22,RED)}{text(240,120,'cruz',22,RED)}{text(240,170,'rima -uz',14,INK)}''', bg='#EAF1FB')
svg('periodico', f'''<rect x="40" y="30" width="240" height="160" fill="{WHITE}" stroke="{GREY}" stroke-width="3"/><rect x="52" y="42" width="216" height="26" fill="{INK}"/>{text(160,60,'CIENCIA HOY',13,WHITE)}
<rect x="52" y="76" width="216" height="18" fill="{BLUE}"/>{text(160,89,'Aparece una isla nueva',11,WHITE)}<rect x="52" y="104" width="90" height="70" fill="{SKY}"/><path d="M60 170 q35 -40 75 0z" fill="{DGREY}"/>{sun(120,120,8)}
{''.join(f'<line x1="152" y1="{y}" x2="264" y2="{y}" stroke="{GREY}" stroke-width="3"/>' for y in (110,122,134,146,158,170))}''', bg='#F3F0FA')
# U9
svg('u9_cover', f'''{sun(60,40,18)}<rect x="90" y="90" width="140" height="80" fill="{GREY}"/>{''.join(f'<rect x="{x}" y="60" width="30" height="40" fill="{GREY}"/>' for x in (90,145,200))}{''.join(f'<rect x="{x}" y="50" width="10" height="12" fill="{GREY}"/>' for x in (90,110,145,165,200,220))}
<path d="M145 170 v-30 a15 15 0 0 1 30 0 v30z" fill="{DBROWN}"/><rect x="110" y="110" width="16" height="22" fill="{SKY}"/><rect x="194" y="110" width="16" height="22" fill="{SKY}"/><path d="M145 50 l15 -16 15 16z" fill="{RED}"/>''', ground=GREEN)
svg('opinion', f'''{person(80,150,BLUE,1.3)}{person(240,150,ORANGE,1.3)}<path d="M100 40 h60 a10 10 0 0 1 10 10 v30 a10 10 0 0 1 -10 10 h-30 l-12 10 v-10 h-18 a10 10 0 0 1 -10 -10 v-30 a10 10 0 0 1 10 -10z" fill="{WHITE}"/>{text(130,68,'Creo que…',13,BLUE)}
<path d="M180 70 h70 a10 10 0 0 1 10 10 v30 a10 10 0 0 1 -10 10 h-30 l-12 10 v-10 h-28 a10 10 0 0 1 -10 -10 v-30 a10 10 0 0 1 10 -10z" fill="{WHITE}"/>{text(220,98,'Pienso que…',12,ORANGE)}''', bg='#FFF4D6')
svg('sujeto', f'''{pill(20,80,110,'El castillo',BLUE,16)}{pill(140,80,160,'guardaba un tesoro',ORANGE,13)}{text(75,150,'sujeto',16,BLUE)}{text(220,150,'predicado',16,ORANGE)}
<rect x="60" y="20" width="40" height="40" fill="{GREY}"/>{''.join(f'<rect x="{x}" y="12" width="8" height="10" fill="{GREY}"/>' for x in (60,76,92))}''', bg='#F3F0FA')
svg('campo', f'''<ellipse cx="160" cy="120" rx="130" ry="80" fill="#FFF4D6" stroke="{ORANGE}" stroke-width="3"/>{text(160,60,'frutas',18,ORANGE)}
<circle cx="90" cy="120" r="22" fill="{ORANGE}"/><ellipse cx="150" cy="125" rx="24" ry="16" fill="{YEL}"/><circle cx="215" cy="120" r="22" fill="{RED}"/><path d="M215 98 v-10" stroke="{DGREEN}" stroke-width="3"/>
{text(90,165,'naranja',12,INK)}{text(150,165,'limón',12,INK)}{text(215,165,'manzana',12,INK)}''', bg='#E9F7EF')
svg('coma', f'''<rect x="30" y="50" width="260" height="110" rx="10" fill="{WHITE}" stroke="{GREY}" stroke-width="3"/>
<text x="50" y="90" font-family="Verdana, Arial, sans-serif" font-size="15" font-weight="700" fill="{INK}">herramientas<tspan fill="{RED}">:</tspan></text>
<text x="50" y="125" font-family="Verdana, Arial, sans-serif" font-size="15" font-weight="700" fill="{INK}">piedras<tspan fill="{BLUE}">,</tspan> palos<tspan fill="{BLUE}">,</tspan> hojas</text>
<text x="50" y="150" font-family="Verdana, Arial, sans-serif" font-size="15" font-weight="700" fill="{INK}"><tspan fill="{DGREEN}">y</tspan> huesos.</text>''', bg='#F3F0FA')
svg('estrofa', f'''<path d="M60 40 q50 -16 100 0 v140 q-50 -16 -100 0z" fill="{WHITE}" stroke="{BLUE}" stroke-width="4"/>{''.join(f'<line x1="76" y1="{y}" x2="{x2}" y2="{y}" stroke="{c}" stroke-width="3"/>' for y,x2,c in ((66,130,BLUE),(80,120,BLUE),(94,134,BLUE),(108,124,BLUE),(136,130,ORANGE),(150,120,ORANGE),(164,134,ORANGE),(178,124,ORANGE)))}
{text(240,90,'estrofa 1',16,BLUE)}{text(240,150,'estrofa 2',16,ORANGE)}''', bg='#EAF1FB')
svg('mural', f'''<rect x="30" y="30" width="260" height="160" rx="6" fill="{WHITE}" stroke="{ORANGE}" stroke-width="4"/>{text(160,60,'¿Cómo medimos el tiempo?',12,BLUE)}
<circle cx="90" cy="120" r="30" fill="{WHITE}" stroke="{INK}" stroke-width="3"/><path d="M90 120 v-20 M90 120 l14 10" stroke="{INK}" stroke-width="3"/>{''.join(f'<line x1="140" y1="{y}" x2="270" y2="{y}" stroke="{GREY}" stroke-width="3"/>' for y in (100,116,132,148))}
<rect x="150" y="160" width="40" height="20" fill="{YEL}"/><rect x="200" y="160" width="40" height="20" fill="{GREEN}"/>''', bg='#FDEBD3')
print(len(os.listdir(S.OUT)))
