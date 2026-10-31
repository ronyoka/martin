import os
OUT='/home/claude/lengua/img'; os.makedirs(OUT,exist_ok=True)
SKY='#CFEAF7'; BLUE='#1F4E79'; ORANGE='#F29B4B'; GREEN='#6BBF59'; DGREEN='#3E8E41'; BROWN='#A0673A'; DBROWN='#6E4424'
YEL='#F7C948'; GREY='#9AA5B1'; DGREY='#5B6670'; WHITE='#FFFFFF'; RED='#E05A4F'; SAND='#F3D9A4'; WATER='#5DADE2'; INK='#2B2B2B'; PINK='#F4A6A6'
def svg(name, body, bg=SKY, ground=None):
    g = f'<rect x="0" y="170" width="320" height="50" fill="{ground}"/>' if ground else ''
    s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" width="320" height="220"><rect width="320" height="220" rx="18" fill="{bg}"/>{g}{body}</svg>'
    open(f'{OUT}/{name}.svg','w').write(s)
def sun(x=270,y=40,r=18): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{YEL}"/>'
def cloud(x,y,s=1): return f'<g transform="translate({x} {y}) scale({s})"><ellipse cx="0" cy="0" rx="26" ry="14" fill="{WHITE}"/><ellipse cx="22" cy="-6" rx="20" ry="14" fill="{WHITE}"/><ellipse cx="-20" cy="-4" rx="16" ry="11" fill="{WHITE}"/></g>'
def tree(x,y,s=1,c=GREEN): return f'<g transform="translate({x} {y}) scale({s})"><rect x="-6" y="0" width="12" height="34" fill="{BROWN}"/><circle cx="0" cy="-8" r="26" fill="{c}"/></g>'
def text(x,y,t,size=18,fill=INK,w='700',anchor='middle'): return f'<text x="{x}" y="{y}" font-family="Verdana, Arial, sans-serif" font-size="{size}" font-weight="{w}" fill="{fill}" text-anchor="{anchor}">{t}</text>'

# --- Unit 1 cover: city map with pin
svg('u1_cover', f'''{sun()}{cloud(70,40)}
<rect x="30" y="80" width="40" height="90" fill="{ORANGE}"/><rect x="75" y="60" width="45" height="110" fill="{BLUE}"/><rect x="125" y="95" width="35" height="75" fill="{RED}"/>
<rect x="165" y="70" width="40" height="100" fill="{GREY}"/><path d="M215 170 V110 l25 -20 25 20 v60z" fill="{SAND}"/><rect x="232" y="140" width="16" height="30" fill="{BROWN}"/>
{''.join(f'<rect x="{x}" y="{y}" width="8" height="10" fill="{WHITE}" opacity=".85"/>' for x in (38,52,84,100,172,188) for y in (90,110,130))}
<rect x="0" y="170" width="320" height="50" fill="{GREEN}"/><path d="M0 195 H320" stroke="{WHITE}" stroke-width="8" stroke-dasharray="20 14"/>
<path d="M285 120 c-14 0 -24 10 -24 24 c0 18 24 40 24 40 s24 -22 24 -40 c0 -14 -10 -24 -24 -24z" fill="{RED}"/><circle cx="285" cy="144" r="9" fill="{WHITE}"/>''')
# --- houses
svg('casa_rascacielos', f'''{cloud(60,40)}{sun()}
<rect x="40" y="70" width="60" height="100" fill="{BLUE}"/><rect x="110" y="30" width="70" height="140" fill="{GREY}"/><rect x="190" y="90" width="55" height="80" fill="{ORANGE}"/><rect x="252" y="110" width="40" height="60" fill="{RED}"/>
{''.join(f'<rect x="{x}" y="{y}" width="10" height="12" fill="{YEL}"/>' for x in (50,70,120,140,160,200,222) for y in range(100,165,22))}
{''.join(f'<rect x="{x}" y="{y}" width="10" height="12" fill="{YEL}"/>' for x in (120,140,160) for y in (40,62,84))}''', ground=GREEN)
svg('casa_madera', f'''{cloud(250,40)}{tree(50,140,1,DGREEN)}{tree(285,145,.8,DGREEN)}
<rect x="100" y="100" width="130" height="70" fill="{BROWN}"/>{''.join(f'<line x1="100" y1="{y}" x2="230" y2="{y}" stroke="{DBROWN}" stroke-width="2"/>' for y in range(110,170,12))}
<path d="M88 104 L165 50 L242 104 Z" fill="{GREEN}"/><path d="M88 104 L165 50 L242 104" stroke="{DGREEN}" stroke-width="6" fill="none"/>
<rect x="150" y="130" width="28" height="40" fill="{DBROWN}"/><rect x="112" y="118" width="24" height="20" fill="{SKY}" stroke="{WHITE}" stroke-width="3"/><rect x="194" y="118" width="24" height="20" fill="{SKY}" stroke="{WHITE}" stroke-width="3"/>''', ground=GREEN)
svg('casa_piedra', f'''{sun()}<path d="M0 170 L70 60 L130 130 L190 40 L270 150 L320 110 V170Z" fill="{GREY}"/><path d="M175 62 L190 40 L206 64 Z" fill="{WHITE}"/><path d="M58 80 L70 60 L82 80Z" fill="{WHITE}"/>
<rect x="95" y="105" width="130" height="65" fill="{SAND}"/>{''.join(f'<rect x="{x}" y="{y}" width="24" height="12" rx="3" fill="none" stroke="{DGREY}" stroke-width="2"/>' for x in range(98,220,26) for y in range(110,165,15))}
<rect x="88" y="96" width="144" height="10" fill="{DGREY}"/><rect x="150" y="135" width="24" height="35" fill="{DBROWN}"/><rect x="104" y="82" width="14" height="14" fill="{RED}"/><rect x="200" y="84" width="10" height="12" fill="{ORANGE}"/>''', ground=SAND)
svg('casa_choza', f'''{sun(60,45,22)}<rect x="0" y="170" width="320" height="50" fill="{SAND}"/>
<rect x="70" y="110" width="80" height="60" fill="{BROWN}"/><path d="M58 114 L110 60 L162 114Z" fill="{YEL}"/>{''.join(f'<line x1="110" y1="62" x2="{x}" y2="114" stroke="{ORANGE}" stroke-width="2"/>' for x in range(64,160,10))}
<path d="M98 170 v-26 a12 12 0 0 1 24 0 v26z" fill="{DBROWN}"/>
<rect x="190" y="122" width="64" height="48" fill="{BROWN}"/><path d="M180 126 L222 84 L264 126Z" fill="{YEL}"/>{''.join(f'<line x1="222" y1="86" x2="{x}" y2="126" stroke="{ORANGE}" stroke-width="2"/>' for x in range(186,262,10))}
<g transform="translate(285 150)"><rect x="-3" y="-10" width="6" height="30" fill="{BROWN}"/><path d="M0 -10 l-22 8 M0 -10 l22 8 M0 -10 l-14 -14 M0 -10 l14 -14" stroke="{GREEN}" stroke-width="6" stroke-linecap="round"/></g>''', bg='#FCE5C4')
svg('casa_cueva', f'''{sun()}<path d="M0 170 V100 C40 60 100 50 160 70 C220 50 280 60 320 95 V170Z" fill="{SAND}"/><path d="M0 170 V120 C60 100 120 100 160 110 C220 98 280 100 320 120 V170Z" fill="#E6C48A"/>
<path d="M60 170 v-30 a20 20 0 0 1 40 0 v30z" fill="{DBROWN}"/><path d="M190 170 v-28 a18 18 0 0 1 36 0 v28z" fill="{DBROWN}"/>
<path d="M128 112 a12 12 0 0 1 24 0 v14 h-24z" fill="{SKY}" stroke="{WHITE}" stroke-width="3"/><path d="M248 108 a10 10 0 0 1 20 0 v12 h-20z" fill="{SKY}" stroke="{WHITE}" stroke-width="3"/>''', ground='#E6C48A')
svg('casa_palafito', f'''{sun()}{cloud(60,40)}<rect x="0" y="150" width="320" height="70" fill="{WATER}"/>{''.join(f'<path d="M{x} {y} q10 -6 20 0" stroke="{WHITE}" stroke-width="3" fill="none"/>' for x,y in ((20,175),(80,195),(240,180),(280,200),(150,205)))}
{''.join(f'<rect x="{x}" y="118" width="8" height="70" fill="{DBROWN}"/>' for x in (95,135,175,215))}
<rect x="85" y="114" width="150" height="10" fill="{BROWN}"/><rect x="100" y="78" width="120" height="38" fill="{BROWN}"/><path d="M88 82 L160 40 L232 82Z" fill="{YEL}"/>
<rect x="150" y="90" width="20" height="26" fill="{DBROWN}"/><rect x="112" y="88" width="20" height="16" fill="{SKY}"/><rect x="188" y="88" width="20" height="16" fill="{SKY}"/>''')
svg('casa_arbol', f'''{cloud(260,40)}<rect x="146" y="70" width="28" height="100" fill="{BROWN}"/><circle cx="160" cy="70" r="70" fill="{GREEN}"/><circle cx="110" cy="85" r="35" fill="{DGREEN}"/><circle cx="215" cy="80" r="38" fill="{DGREEN}"/>
<rect x="115" y="90" width="90" height="12" fill="{DBROWN}"/><rect x="125" y="58" width="70" height="34" fill="{SAND}"/><path d="M118 62 L160 30 L202 62Z" fill="{RED}"/><rect x="150" y="68" width="18" height="24" fill="{BROWN}"/>
<line x1="200" y1="102" x2="200" y2="170" stroke="{DBROWN}" stroke-width="3"/><line x1="214" y1="102" x2="214" y2="170" stroke="{DBROWN}" stroke-width="3"/>{''.join(f'<line x1="200" y1="{y}" x2="214" y2="{y}" stroke="{DBROWN}" stroke-width="3"/>' for y in range(112,170,12))}''', ground=GREEN)
svg('casa_iglu', f'''<rect width="320" height="220" rx="18" fill="#DCEFFB"/>{''.join(f'<circle cx="{x}" cy="{y}" r="3" fill="{WHITE}"/>' for x,y in ((30,30),(80,60),(140,25),(200,50),(260,30),(300,70),(50,100),(280,110)))}
<rect x="0" y="160" width="320" height="60" fill="{WHITE}"/><path d="M80 165 a80 80 0 0 1 160 0z" fill="{WHITE}" stroke="#A9CCE3" stroke-width="3"/>
{''.join(f'<path d="M{80+i*3} {165-26*k} " />' for i in range(1) for k in range(1))}
<path d="M95 140 H225 M110 115 H210 M130 95 H190" stroke="#A9CCE3" stroke-width="3"/><path d="M130 165 v-18 a14 14 0 0 1 28 0 v18" fill="#7FB3D5"/>
<path d="M120 165 v-22 a24 24 0 0 1 48 0 v22" fill="none" stroke="#A9CCE3" stroke-width="3"/>''', bg='#DCEFFB')
# --- greeting
svg('saludo', f'''<circle cx="100" cy="110" r="44" fill="{SAND}"/><circle cx="86" cy="104" r="5" fill="{INK}"/><circle cx="114" cy="104" r="5" fill="{INK}"/><path d="M84 122 q16 16 32 0" stroke="{INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M58 92 q42 -50 84 0" fill="{BROWN}"/><rect x="62" y="154" width="76" height="50" rx="20" fill="{ORANGE}"/>
<g transform="translate(172 150) rotate(-15)"><rect x="-10" y="-46" width="20" height="50" rx="10" fill="{SAND}"/><rect x="-16" y="-70" width="32" height="34" rx="12" fill="{SAND}"/></g>
<path d="M182 40 h110 a14 14 0 0 1 14 14 v40 a14 14 0 0 1 -14 14 h-80 l-18 16 v-16 h-12 a14 14 0 0 1 -14 -14 v-40 a14 14 0 0 1 14 -14z" fill="{WHITE}"/>{text(237,84,'¡Hola!',26,BLUE)}''', bg='#FDEBD3')
# --- noun: sheep and flock
def sheep(x,y,s=1): return f'<g transform="translate({x} {y}) scale({s})"><ellipse cx="0" cy="0" rx="26" ry="18" fill="{WHITE}" stroke="#D5D8DC" stroke-width="2"/><circle cx="-14" cy="-12" r="10" fill="{WHITE}"/><circle cx="8" cy="-14" r="11" fill="{WHITE}"/><ellipse cx="28" cy="-4" rx="10" ry="9" fill="{DGREY}"/><circle cx="31" cy="-6" r="2" fill="{WHITE}"/><rect x="-16" y="14" width="5" height="14" fill="{DGREY}"/><rect x="10" y="14" width="5" height="14" fill="{DGREY}"/></g>'
svg('nombre', f'''{sun()}{sheep(70,120,1.3)}{text(70,200,'oveja',16)}
<rect x="140" y="40" width="2" height="150" fill="{WHITE}"/>{sheep(190,100,.8)}{sheep(250,95,.8)}{sheep(215,135,.8)}{sheep(275,135,.8)}{text(235,200,'rebaño',16)}''', bg='#D8F0D0')
svg('abc', ''.join(f'<g transform="translate({x} {y})"><rect width="64" height="64" rx="10" fill="{c}"/>{text(32,44,l,34,WHITE)}</g>' for x,y,l,c in ((30,40,'A',RED),(100,40,'B',BLUE),(170,40,'C',GREEN),(240,40,'D',ORANGE),(65,120,'…',GREY),(135,120,'Ñ',DGREEN),(205,120,'Z',BROWN))), bg='#FFF4D6')
svg('polisemia', f'''<rect x="40" y="120" width="60" height="50" fill="{ORANGE}"/><rect x="34" y="112" width="72" height="12" fill="{BROWN}"/>
<path d="M70 112 v-50" stroke="{DGREEN}" stroke-width="8"/><path d="M70 90 q-24 -10 -22 -30 q20 6 22 30z M70 76 q24 -12 22 -34 q-20 8 -22 34z" fill="{GREEN}"/>
{text(70,200,'planta',16)}{text(70,214,'növény',12,DGREY,'400')}
<rect x="190" y="30" width="90" height="140" fill="{GREY}"/>{''.join(f'<rect x="200" y="{y}" width="70" height="26" fill="{YEL if y==96 else WHITE}" opacity="{1 if y==96 else .7}"/>' for y in (40,68,96,124))}
{text(235,200,'planta',16)}{text(235,214,'emelet',12,DGREY,'400')}''', bg='#E8F4FA')
svg('perro', f'''<ellipse cx="150" cy="140" rx="70" ry="34" fill="{BROWN}"/><circle cx="215" cy="100" r="34" fill="{BROWN}"/><ellipse cx="238" cy="78" rx="12" ry="24" fill="{DBROWN}" transform="rotate(25 238 78)"/><ellipse cx="196" cy="78" rx="12" ry="24" fill="{DBROWN}" transform="rotate(-25 196 78)"/>
<circle cx="226" cy="98" r="4" fill="{INK}"/><circle cx="246" cy="112" r="6" fill="{INK}"/><path d="M226 124 q10 8 20 0" stroke="{INK}" stroke-width="3" fill="none"/>
<rect x="100" y="160" width="14" height="30" rx="6" fill="{BROWN}"/><rect x="180" y="160" width="14" height="30" rx="6" fill="{BROWN}"/><path d="M82 130 q-30 -20 -20 -46" stroke="{BROWN}" stroke-width="10" fill="none" stroke-linecap="round"/>
<text x="60" y="44" font-family="Verdana, Arial, sans-serif" font-size="32" font-weight="700" fill="#1F4E79">pe<tspan fill="#E05A4F">rr</tspan>o</text>''', bg='#FFF0DE')
svg('textos', f'''<path d="M30 60 q60 -20 120 0 v110 q-60 -20 -120 0z" fill="{WHITE}" stroke="{BLUE}" stroke-width="4"/><path d="M150 60 q60 -20 120 0 v110 q-60 -20 -120 0z" fill="{WHITE}" stroke="{BLUE}" stroke-width="4"/>
{''.join(f'<line x1="46" y1="{y}" x2="134" y2="{y}" stroke="{GREY}" stroke-width="4" stroke-linecap="round"/>' for y in (80,96,112,128,144))}
{''.join(f'<line x1="170" y1="{y}" x2="{x}" y2="{y}" stroke="{ORANGE}" stroke-width="4" stroke-linecap="round"/>' for y,x in ((80,220),(96,240),(112,210),(128,232),(144,214)))}
{text(90,200,'prosa',16)}{text(210,200,'verso',16)}''', bg='#EAF1FB')
svg('aviso', f'''<rect x="30" y="30" width="150" height="130" rx="8" fill="{BROWN}"/><rect x="40" y="40" width="130" height="110" fill="{WHITE}"/>{text(105,70,'AVISO',22,RED)}
{''.join(f'<line x1="54" y1="{y}" x2="156" y2="{y}" stroke="{GREY}" stroke-width="4" stroke-linecap="round"/>' for y in (90,104,118))}<line x1="110" y1="136" x2="156" y2="136" stroke="{BLUE}" stroke-width="3"/>
<rect x="60" y="160" width="10" height="40" fill="{DBROWN}"/><rect x="140" y="160" width="10" height="40" fill="{DBROWN}"/>
<g transform="rotate(6 250 110)"><rect x="200" y="60" width="96" height="96" fill="{YEL}"/>{text(214,86,'Santi:',14,INK,'700','start')}{''.join(f'<line x1="214" y1="{y}" x2="282" y2="{y}" stroke="{ORANGE}" stroke-width="3"/>' for y in (102,116,130))}{text(282,148,'Mamá',12,INK,'400','end')}</g>''', bg='#E9F7EF')
# --- Unit 2
svg('u2_cover', f'''<rect x="40" y="24" width="240" height="172" rx="8" fill="{BROWN}"/><rect x="54" y="38" width="212" height="144" fill="{SKY}"/>
<path d="M54 140 L110 80 L150 120 L200 66 L266 136 V182 H54Z" fill="{GREEN}"/><path d="M188 80 L200 66 L212 80Z" fill="{WHITE}"/>{sun(230,62,14)}{cloud(100,60,.7)}
<path d="M54 160 q60 -14 110 4 t102 -6 V182 H54Z" fill="{WATER}"/><rect x="157" y="38" width="6" height="144" fill="{BROWN}"/><rect x="54" y="106" width="212" height="6" fill="{BROWN}"/>''', bg='#FDEBD3')
svg('presentacion', f'''<rect x="40" y="40" width="240" height="140" rx="16" fill="{WHITE}" stroke="{BLUE}" stroke-width="4"/><rect x="40" y="40" width="240" height="44" rx="16" fill="{BLUE}"/><rect x="40" y="66" width="240" height="18" fill="{BLUE}"/>
{text(160,72,'HOLA, SOY',22,WHITE)}{text(160,140,'Martín',36,BLUE)}<rect x="146" y="20" width="28" height="30" rx="6" fill="{GREY}"/>''', bg='#FFF4D6')
svg('gota', f'''{sun(280,36,16)}<rect x="0" y="170" width="320" height="50" fill="{WATER}"/><path d="M110 170 L170 80 L230 170Z" fill="{GREY}"/><path d="M158 98 L170 80 L182 98Z" fill="{WHITE}"/>
{cloud(220,50,1.1)}{''.join(f'<line x1="{x}" y1="70" x2="{x-6}" y2="92" stroke="{WATER}" stroke-width="3" stroke-linecap="round"/>' for x in (205,220,235,250))}
<path d="M230 120 q20 30 -10 50" stroke="{WATER}" stroke-width="6" fill="none"/>
<path d="M60 70 c0 0 -26 34 -26 52 a26 26 0 0 0 52 0 c0 -18 -26 -52 -26 -52z" fill="{WATER}"/><circle cx="51" cy="118" r="4" fill="{INK}"/><circle cx="69" cy="118" r="4" fill="{INK}"/><path d="M52 132 q8 7 16 0" stroke="{INK}" stroke-width="3" fill="none"/>
<path d="M95 150 q30 -60 100 -80" stroke="{BLUE}" stroke-width="3" fill="none" stroke-dasharray="6 6"/><path d="M190 64 l10 6 -10 6" stroke="{BLUE}" stroke-width="3" fill="none"/>''', bg='#DFF1FB')
svg('articulos', ''.join(f'<g transform="translate({x} {y})"><rect width="124" height="44" rx="22" fill="{c}"/>{text(62,30,t,20,WHITE)}</g>' for x,y,t,c in ((28,30,'el',BLUE),(168,30,'la',RED),(28,90,'los',BLUE),(168,90,'las',RED),(28,150,'un·unos',ORANGE),(168,150,'una·unas',DGREEN))), bg='#F3F0FA')
svg('demostrativos', f'''<rect x="0" y="160" width="320" height="60" fill="{GREEN}"/>
<g transform="translate(40 120)"><circle cx="0" cy="-24" r="14" fill="{SAND}"/><rect x="-12" y="-10" width="24" height="40" rx="10" fill="{BLUE}"/></g>
<path d="M58 110 h20" stroke="{INK}" stroke-width="3"/>{tree(100,130,1.1)}{tree(180,130,.8)}{tree(260,128,.55)}
{text(100,205,'este',16)}{text(180,205,'ese',16)}{text(260,205,'aquel',16)}{text(100,30,'aquí',14,DGREY,'400')}{text(180,30,'ahí',14,DGREY,'400')}{text(260,30,'allí',14,DGREY,'400')}''', bg=SKY)
svg('tazas', f'''<g transform="translate(70 120)"><rect x="-18" y="-20" width="36" height="34" rx="6" fill="{RED}"/><path d="M18 -12 q14 0 14 10 t-14 10" stroke="{RED}" stroke-width="5" fill="none"/></g>{text(70,190,'tacita',18)}
<g transform="translate(200 110)"><rect x="-60" y="-56" width="110" height="96" rx="14" fill="{BLUE}"/><path d="M50 -36 q36 0 36 28 t-36 28" stroke="{BLUE}" stroke-width="10" fill="none"/><path d="M-30 -70 q8 -10 0 -20 M0 -70 q8 -10 0 -20" stroke="{GREY}" stroke-width="4" fill="none"/></g>{text(200,190,'tazón',18)}''', bg='#FFF4D6')
svg('koala', f'''<circle cx="110" cy="110" r="56" fill="{GREY}"/><circle cx="58" cy="70" r="28" fill="{GREY}"/><circle cx="162" cy="70" r="28" fill="{GREY}"/><circle cx="58" cy="70" r="16" fill="{PINK}"/><circle cx="162" cy="70" r="16" fill="{PINK}"/>
<circle cx="90" cy="104" r="7" fill="{INK}"/><circle cx="130" cy="104" r="7" fill="{INK}"/><ellipse cx="110" cy="126" rx="14" ry="18" fill="{INK}"/>
{text(250,70,'ca · co · cu',18,BLUE)}{text(250,110,'que · qui',18,RED)}{text(250,150,'koala',18,DGREEN)}''', bg='#EAF1FB')
svg('recursos', f'''{sun(70,60,30)}<circle cx="60" cy="56" r="3" fill="{INK}"/><circle cx="80" cy="56" r="3" fill="{INK}"/><path d="M60 68 q10 8 20 0" stroke="{INK}" stroke-width="3" fill="none"/>
<rect x="200" y="100" width="20" height="70" fill="{BROWN}"/><path d="M130 110 q80 -100 160 0z" fill="{GREEN}"/>
<g transform="translate(250 150)"><ellipse cx="0" cy="0" rx="12" ry="14" fill="{ORANGE}"/><circle cx="2" cy="-16" r="8" fill="{ORANGE}"/><path d="M-10 6 q-22 -6 -14 -30 q10 4 6 20" fill="{ORANGE}"/></g>
{''.join(f'<line x1="{x}" y1="{y}" x2="{x-4}" y2="{y+12}" stroke="{WATER}" stroke-width="3" stroke-linecap="round"/>' for x,y in ((140,40),(160,30),(250,30),(280,45),(300,60)))}''', ground=GREEN)
svg('burro', f'''<ellipse cx="150" cy="130" rx="70" ry="36" fill="{GREY}"/><rect x="200" y="70" width="30" height="60" rx="12" fill="{GREY}" transform="rotate(20 215 100)"/><ellipse cx="240" cy="70" rx="26" ry="20" fill="{GREY}"/>
<ellipse cx="232" cy="30" rx="7" ry="24" fill="{GREY}" transform="rotate(-10 232 30)"/><ellipse cx="250" cy="32" rx="7" ry="24" fill="{GREY}" transform="rotate(12 250 32)"/><ellipse cx="258" cy="76" rx="10" ry="8" fill="{DGREY}"/><circle cx="236" cy="64" r="3.5" fill="{INK}"/>
{''.join(f'<rect x="{x}" y="156" width="12" height="40" rx="5" fill="{DGREY}"/>' for x in (100,125,175,195))}<path d="M82 120 q-20 10 -16 40" stroke="{DGREY}" stroke-width="5" fill="none"/><circle cx="66" cy="162" r="6" fill="{INK}"/>''', ground='#D8F0D0')
print(sorted(os.listdir(OUT)))
