/* =====================================================================
 * escenas/escenas2d.ts (antes scenes.js): LAS ESCENAS 2D DEL JUEGO Y LA ASAMBLEA
 * ---------------------------------------------------------------------
 * Para qué sirve:
 *   Define el objeto global SCENES con las pantallas por las que pasa el
 *   niño: portada (title), edad, ¿quién juega? (quien), cuento de
 *   introducción (intro), juego (juego), asamblea, álbum y "a dormir"
 *   (el mapa, las zonas y la casita de un tema están en escenas/zonas.ts).
 *   Además junta todos los temas en TEMAS / TEMA y da las funciones de
 *   progreso tst() y gDone().
 *
 * Qué es una escena:
 *   Un objeto SCENES.nombre = { music, enter, update, draw, down, move,
 *   up, hint, prompt, dwell, ... }. Todos los métodos son opcionales salvo
 *   draw. Quien los llama (el núcleo, src/nucleo/, y aplicacion/adultos.ts):
 *     - go(nombre, o)  (nucleo/escenas.ts) cambia de escena: borra temporizadores
 *       later(), partículas y la voz, pone la música scene.music y llama a
 *       scene.enter(o). "o" lleva los datos del viaje ({t, g, hello, fin...}).
 *     - El bucle de aplicacion/adultos.ts llama cada cuadro a scene.update(dt) y
 *       scene.draw(), y a scene.dwell(id) cuando el ratón se queda quieto
 *       ~1 s sobre una zona registrada con hv(id, ...).
 *     - Los punteros llaman a scene.down/move/up(x, y) en coordenadas
 *       lógicas de 1600x900.
 *     - drawHelp() (nucleo/interfaz.ts) pide scene.hint() -> {x, y, r} para el brillo
 *       y la manita de ayuda cuando el niño no toca nada, y entonces llama
 *       una vez a scene.prompt() para repetir la consigna en voz alta.
 *
 * Desde la fase 2j es un módulo: src/modulos.ts lo carga el último (usa los
 * temas) y el puente deja lo que exporta en globalThis para las pruebas (escenas/zonas.ts, escenas/tienda.ts,
 * escenas/repaso.ts, aplicacion/adultos.ts y los módulos de mundo3d/ lo importan).
 *
 * Ya nadie reescribe lo de este archivo: el mapa, el jardín (y las demás
 * zonas), la casita, suggestTema y stationPos se definen una sola vez en
 * escenas/zonas.ts desde la fase 4d (antes había aquí una versión 1 que
 * zonas.ts reescribía), y finishGame es una sola función desde la fase 4b,
 * con el caso de uso aplicacion/terminarJuego.ts. La asamblea, con su paso
 * de cumpleaños y las monedas del día, y GNAME, con todos los tipos de
 * juego, están enteros aquí desde la fase 4e (antes escenas/zonas.ts los
 * completaba). La capa 3D (mundo3d/) pone su propia versión de title (y de
 * map, casita, cofre y las zonas, de zonas.ts), hecha a partir de esta (desde
 * las fases 4i y 4j; antes las envolvía).
 *
 * Lo que exporta y usan otros archivos:
 *   SCENES, TEMAS, TEMA, CATALOGO, tst, gDone, drawLogo, drawLogoSmall, pill,
 *   VIVO.deferredInstall, standalone, asamHoy,
 *   drawCasita, GNAME, gIcon, drawStation, finishGame, ultimoJuego (desde la fase 4i),
 *   EMO_AGE/EMO_SAY/EMO_TIP (EMO y drawFace, desde la fase 4o en juegos/caras.ts, y tree, en nucleo/dibujo.ts), WX/WX_AGE/WX_ROPA,
 *   SEASON_NEXT, dayIdx, isBday, ALBUM_KEYS (SCENES está en nucleo/escenas.ts:
 *   aquí se le añaden las escenas).
 * Importa:
 *   el núcleo, src/nucleo/ (S, save, go, later, say, SFX, T, ctx, text, card, circ, hv,
 *   hR, hC, burst, sparkles, giveSticker, AGE, today, rec, kid, praise,
 *   pick, rnd, VIVO.idle, tx, V, pic, drawTito, TITO, inTito, drawHome, atHome...),
 *   temas/ (T3/T4/T5, C3/C4/C5, CAN, RUT, TRZ, FIESTAS, ING, makeGame, dayNight, bunting),
 *   juegos/ (NUM, TUNES, playTune: la canción del cumpleaños), src/dibujos/ (PICS, K),
 *   esCumple de dominio/progreso.ts (isBday), repeticion de dominio/dificultad.ts (VIVO.REP) y el caso de uso
 *   terminarJuego de aplicacion/terminarJuego.ts (finishGame) y, desde la fase 4m, premioDelCumple y terminarAsamblea de
 *   aplicacion/premiosDelDia.ts; del núcleo, también REP_ON y las monedas
 *   (giveCoins, creditCoins, drawCoinHUD, alEmpezarJuego). Desde la fase 4p, openNameDlg y openResetDlg de
 *   aplicacion/dialogos.ts (antes de aplicacion/adultos.ts, que se carga después: eran globales tardías).
 * Partes de S que toca: S.age, S.name, S.first (askedName, wk),
 *   S.intro, S.temas[id] ({g:{índice: veces}, done}),
 *   S.stk (figuritas), S.asam[fecha] (asamblea del día), S.bdayDone (cumpleaños
 *   ya celebrado; lee S.bday), S.stats (rec) y, al
 *   terminar un juego (finishGame), S.gs, S.rep y las monedas.
 * ===================================================================== */
import type { JuegoTema, Libre, Tema } from '../juegos/tipos.ts';
import { K, PICS } from '../dibujos/todos.ts';
import { AGE, DF, DIAC, DIASL, ESTACIONES, FLC, LF, MESES, PI, REP_ON, S, SCENES, SFX, T, TITO, V, VIVO, W_, alEmpezarJuego, atHome, back, burst, cap, card, circ, clamp, cloud, creditCoins, ctx, dist, drawCoinHUD, drawHome, drawRounds, drawSticker, drawTito, easeOut, ell, estacionDe, fillStroke, flower, giveCoins, giveSticker, go, hC, hR, hv, inR, inTito, initAudio, kid, later, pic, picG, pick, pickVoice, praise, rec, rnd, save, say, sayQ, shuffle, sky, sparkles, star, text, titoKind, today, tree, tx, whenQuiet, ymd } from '../nucleo/indice.ts';
import { C3, C4, C5, CAN, FIESTAS, ING, RUT, T3, T4, T5, TRZ, bunting, dayNight, floor, makeGame } from '../temas/indice.ts';
import { repeticion } from '../dominio/dificultad.ts';
// ahora(): la fecha y la hora (puerto de aplicacion/puertos.ts, desde la fase 3g; antes new Date()).
import { ahora } from '../aplicacion/puertos.ts';
import { openNameDlg, openResetDlg } from '../aplicacion/dialogos.ts';
// terminarJuego: lo que cambia en la partida al terminar un juego (caso de uso, desde la fase 4b); lo usa finishGame.
import { terminarJuego } from '../aplicacion/terminarJuego.ts';
import { premioDelCumple, terminarAsamblea } from '../aplicacion/premiosDelDia.ts';
import type { CatalogoDeTemas } from '../aplicacion/repasoDelDia.ts';
import { NUM, TUNES, drawFace, playTune } from '../juegos/indice.ts';
import { esCumple } from '../dominio/progreso.ts';
/* ================= ESCENAS ================= */
// SCENES: todas las escenas del juego, por nombre (el objeto está en src/nucleo/escenas.ts; aquí y en los demás
// archivos se le añaden escenas). go('nombre', o) cambia a SCENES.nombre.
// Cada escena: {music: clave de música o null, enter(o), update(dt), draw(), down(x,y), move(x,y), up(x,y),
// hint() -> {x,y,r} o null, prompt() (repite la consigna), dwell(id) (dice el nombre de lo que hay bajo el ratón)}.
// TEMAS: lista de todos los temas en orden. TEMA: el mismo tema buscado por su id (TEMA['3A-T1']).
// Formato de un tema: el tipo Tema de juegos/tipos.ts, con un comentario por campo. Cada tema trae su zone (fase 5a).
export const TEMAS: Tema[]=[...T3,C3,...T4,C4,...T5,C5,CAN,RUT,TRZ,...FIESTAS,...ING], TEMA: Record<string, Tema>={};TEMAS.forEach(t=>TEMA[t.id]=t);
// CATALOGO: TEMAS y TEMA juntos, como los piden los casos de uso del repaso (aplicacion/repasoDelDia.ts, desde la fase 4c).
export const CATALOGO: CatalogoDeTemas={lista:TEMAS,tema:(id: string)=>TEMA[id]};
// tst(id): progreso guardado del tema con ese id, o uno vacío si aún no se ha jugado.
// Formato: S.temas[id] = {g: {índiceJuego: veces que se ha terminado}, done: 1 si ya se terminaron todos}. No escribe en S.
export const tst=(id: string): Libre=>S.temas[id]||{g:{},done:0};
// gDone(t): cuántos juegos distintos del tema t se han terminado al menos una vez.
export const gDone=(t: Tema)=>t.games.filter((_g,j)=>tst(t.id).g[j]).length;
// LOGO: el texto del logotipo; LOGOC: un color por letra.
export const LOGO='Curiolandia', LOGOC=['#FF8A7A','#FFA94D','#FFC93C','#7CC86E','#3FC1B0','#7FD3F0','#5B8DEF','#9B8AD9','#F58BB4','#FF8A7A','#FFA94D'];
// drawLogo(x, y, s): dibuja el logotipo grande de la portada centrado en (x, y), con letras de tamaño s
// que suben, bajan y se balancean con el tiempo T. Solo dibuja.
export function drawLogo(x: number,y: number,s: number){
  ctx.font=`700 ${s}px ${DF}`; const ws=[...LOGO].map(c=>ctx.measureText(c).width), tw=ws.reduce((a,b)=>a+b,0);
  let cx=x-tw/2; [...LOGO].forEach((c,i)=>{const yy=y+Math.sin(T*3+i*.7)*s*.05; ctx.save();ctx.translate(cx+ws[i]/2,yy);ctx.rotate(Math.sin(T*2+i)*.05);
    text(c,0,0,s,LOGOC[i],{st:s*.08});ctx.restore();cx+=ws[i]});
}
// pill(x, y, w, h, t, f, c, sz): botón redondeado ("píldora") centrado en (x, y) de w x h con el texto t.
// f = color de fondo, c = color del texto, sz = tamaño de letra. Crece un poco al pasar el ratón (hv). Solo dibuja;
// el toque se comprueba aparte en down().
export function pill(x: number,y: number,w: number,h: number,t: string,f='#fff',c=K,sz=32){const s=hv('pill'+x+y,hR(x,y,w,h));ctx.save();ctx.translate(x,y);ctx.scale(s,s);card(-w/2,-h/2,w,h,f,5,h/2);text(t,0,sz*.36,sz,c,{w:600});ctx.restore()}
// deferredInstall: el aviso del navegador para instalar el juego como app (PWA). Se guarda al llegar el
// evento 'beforeinstallprompt' para enseñarlo luego desde el botón "Instalar el juego" de la portada o la zona de adultos.
Object.assign(VIVO,{deferredInstall:null});
addEventListener('beforeinstallprompt',e=>{e.preventDefault();VIVO.deferredInstall=e});
// standalone(): true si el juego ya se está ejecutando instalado (pantalla completa o app), y entonces no se muestran los botones de instalar ni de pantalla completa.
export const standalone=()=>matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||(navigator as Navigator & { standalone?: boolean }).standalone;

/* ---------- PORTADA ---------- */
// PORTADA. Primera escena. Desde aquí se va a 'edad' (si aún no hay edad), 'intro' (si no se ha visto el cuento)
// o al mapa. También tiene los botones de pantalla completa, instalar, "¿Quién juega?" y "Empezar de nuevo".
// (mundo3d/portada3d.ts pone una portada 3D hecha a partir de esta; hasta la fase 4i la envolvía.)
SCENES.title={music:null,
// enter(): crea 14 signos de interrogación de colores (this.q) que flotan hacia arriba por el fondo.
  enter(){this.q=Array.from({length:14},(_,i)=>({x:rnd(100,1500),y:rnd(120,820),v:rnd(10,30),ph:rnd(0,6),c:LOGOC[i%LOGOC.length]}))},
// update(dt): sube los interrogantes; el que sale por arriba vuelve a aparecer por abajo.
  update(dt){for(const f of this.q){f.y-=f.v*dt;if(f.y<-80)f.y=980}},
// draw(): fondo, interrogantes, logotipo, subtítulo, Tito, el botón verde de jugar (que late) y, si ya hay
// partida (S.age), los botones "Juega: nombre" y "Empezar de nuevo". Arriba, pantalla completa e instalar si se puede.
  draw(){
    sky('#FFF6E6','#FCE3C0');
    for(const f of this.q){ctx.globalAlpha=.3;text('?',f.x+Math.sin(T+f.ph)*20,f.y,90,f.c);ctx.globalAlpha=1}
    drawLogo(800,230,150);
    text(V(['Tito y las preguntas escondidas','Tito y las preguntas escondidas']),800,310,46,K,{w:600});
    drawTito(470,420,380,{bubble:false});
    const p=hv('play',hC(1080,560,120))*(1+Math.sin(T*4)*.05); ctx.save();ctx.translate(1080,560);ctx.scale(p,p);circ(0,0,110,'#7CC86E',8);ctx.beginPath();ctx.moveTo(-30,-48);ctx.lineTo(54,0);ctx.lineTo(-30,48);ctx.closePath();fillStroke('#fff',6);ctx.restore();
    if(S.age){pill(205,830,330,80,S.name?'Juega: '+S.name:'¿Quién juega?');pill(1395,830,330,80,'Empezar de nuevo','#fff','#C0473C')}
    if(document.fullscreenEnabled&&!standalone()){const s=hv('fs',hR(1515,85,90,90));ctx.save();ctx.translate(1515,85);ctx.scale(s,s);card(-45,-45,90,90,'#fff',6,28);ctx.lineWidth=7;ctx.strokeStyle=K;ctx.lineCap='round';ctx.beginPath();for(const[a,b,c,d]of[[-25,-10,-25,-25],[-25,-25,-10,-25],[25,-25,10,-25],[25,-25,25,-10],[-25,10,-25,25],[-25,25,-10,25],[25,25,10,25],[25,25,25,10]]){ctx.moveTo(a,b);ctx.lineTo(c,d)}ctx.stroke();ctx.restore()}
    if(VIVO.deferredInstall&&!standalone())pill(185,85,300,74,'Instalar el juego','#FFE08A',K,30);
  },
// down(x, y): el primer toque desbloquea el audio (initAudio). Según dónde toque: pantalla completa, instalar,
// cambiar nombre (openNameDlg), empezar de nuevo (openResetDlg) o, en cualquier otro sitio, empezar a jugar.
  down(x,y){
    initAudio();
    if(inR(x,y,1515,85,100,100)&&document.fullscreenEnabled&&!standalone()){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch(e){}return}
    if(VIVO.deferredInstall&&!standalone()&&inR(x,y,185,85,300,80)){VIVO.deferredInstall.prompt();VIVO.deferredInstall.userChoice.finally(()=>{VIVO.deferredInstall=null});return}
    if(S.age&&y>780&&x<380){SFX.tap();openNameDlg(()=>{});return}
    if(S.age&&y>780&&x>1220){SFX.tap();openResetDlg();return}
    SFX.pop(); pickVoice();
// Orden de la primera vez: edad -> (¿quién juega?) -> cuento de intro -> mapa.
    if(!S.age)go('edad'); else if(!S.intro)go('intro'); else go('map',{hello:true});
  }
};

/* ---------- EDAD ---------- */
// EDAD. Un adulto elige 3, 4 o 5 años (globos). Guarda S.age y pasa a 'quien' (si no hay nombre ni se ha
// saltado antes) o a 'intro'/mapa. La edad decide qué zona se abre sola y qué pasos tiene la asamblea.
SCENES.edad={music:'title',
// enter(): Tito pide que un adulto toque la edad.
  enter(){say('¡Hola! Para empezar, un grande tiene que tocar la edad de quien va a jugar.')},
// draw(): título y tres globos (3, 4, 5 años) que se mecen; cada globo crece al pasar el ratón.
  draw(){
    sky('#FFF6E6','#FCE3C0');
    text('¿Cuántos años tiene quien va a jugar?',800,170,56,K,{w:600});
    text(tx('(Lo elige un adulto. Se puede cambiar después.)'),800,230,30,'#7A6252',{w:500});
    [3,4,5].forEach((n,i)=>{const x=480+i*320,y=520,b=Math.sin(T*2+i)*8,s=hv('age'+n,hC(x,y,140));
      ctx.beginPath();ctx.moveTo(x,y+130+b);ctx.quadraticCurveTo(x+20,y+200,x-10,y+260);ctx.lineWidth=4;ctx.strokeStyle=K;ctx.stroke();
      ctx.save();ctx.translate(x,y+b);ctx.scale(s,s);ell(0,0,120,140,['#FF8A7A','#7CC86E','#5B8DEF'][i],7);text(String(n),0,30,140,'#fff',{f:LF,st:10});text('años',0,84,36,'#fff',{w:600});ctx.restore()});
  },
// down(x, y): si toca un globo, guarda S.age, reinicia la dificultad adaptativa (ADAPT=0) y sigue con
// 'quien' o con 'intro'/'map'.
  down(x,y){[3,4,5].forEach((n,i)=>{if(dist(x,y,480+i*320,520)<150){S.age=n;VIVO.ADAPT=0;save();SFX.good();if(!S.name&&!S.first.askedName)go('quien');else go(S.intro?'map':'intro',{hello:true})}})}
};
/* ---------- ¿QUIÉN JUEGA? ---------- */
// ¿QUIÉN JUEGA? Pide el nombre del niño (lo escribe un adulto en el diálogo openNameDlg). Se puede saltar.
SCENES.quien={music:'title',
// enter(): Tito se presenta y pide el nombre.
  enter(){later(300,()=>sayQ('¡Hola! Yo soy Tito. ¿Cómo te llamás? Pedile a un grande que escriba tu nombre.'))},
// prompt(): repite la consigna (la llama drawHelp cuando el niño no hace nada).
  prompt(){say('Pedile a un grande que escriba tu nombre.')},
// hint(): la ayuda señala el botón "Escribir el nombre".
  hint(){return{x:800,y:640,r:150}},
// done(v): se llama al cerrar el diálogo del nombre (v = nombre escrito, o '' si se salta). Si hay nombre,
// lo celebra diciéndolo; después va a 'intro' o al mapa.
  done(v?: string){if(v){SFX.tada();burst(800,400,50);say(`¡Hola, ${v}! ¡Qué lindo nombre!`,()=>later(400,()=>go(S.intro?'map':'intro',{hello:true})))}else go(S.intro?'map':'intro',{hello:true})},
// down(x, y): botón "Escribir el nombre" -> abre el diálogo; "Saltar" -> marca S.first.askedName para no
// volver a preguntar y sigue; en otro sitio, solo chispas.
  down(x,y){
    if(Math.abs(x-800)<230&&Math.abs(y-640)<75){SFX.pop();openNameDlg((v?: string)=>this.done(v));return}
    if(Math.abs(x-800)<140&&Math.abs(y-790)<40){SFX.tap();S.first.askedName=1;save();this.done('');return}
    SFX.tap();sparkles(x,y,3)},
// draw(): título, Tito, botón verde para escribir el nombre y "Saltar".
  draw(){sky('#FFF6E6','#FCE3C0');text(tx('¿Cómo te llamás?'),800,170,72,K,{w:600});
    drawTito(640,250,320,{bubble:false});
    pill(800,640,460,150,'Escribir el nombre','#7CC86E','#fff',48);
    text('Saltar',800,800,34,'#7A6252')}
};

/* ---------- INTRO (cuento) ---------- */
// INTRO: el cuento del principio, en 4 frases (this.ph = frase actual). Al acabar, o al tocar el botón de saltar,
// marca S.intro = true para no repetirlo y va al mapa.
SCENES.intro={music:'title',
// enter(): empieza por la primera frase. this.qs = interrogantes que salen volando de la mochila.
  enter(){this.ph=0;this.t=0;this.qs=[];this.next()},
// next(): dice la frase this.ph y, cuando termina de hablar (callback de say) y pasan 0,7 s, pasa a la siguiente.
// En la frase 1 lanza los 16 interrogantes. Cuando ya no quedan frases guarda S.intro y va al mapa.
  next(){
    // la presentación cambia con el personaje de Tito (zona de adultos); la del caracol es la de siempre
    const lines=[(({erizo:'¡Hola! Yo soy Tito, el erizo curioso. En mi mochila guardo un montón de preguntas.',tortuga:'¡Hola! Yo soy Tito, la tortuga curiosa. En mi mochila guardo un montón de preguntas.',conejo:'¡Hola! Yo soy Tito, el conejo curioso. En mi mochila guardo un montón de preguntas.'} as Record<string, string>))[titoKind()]||'¡Hola! Yo soy Tito, el caracol curioso. En mi mochila guardo un montón de preguntas.','Pero hoy la mochila se abrió... ¡y las preguntas se escaparon por todo el pueblo!','¿Qué día es hoy? ¿De qué color es el cielo? ¿Qué come la vaca?','¿Me ayudás a encontrar las respuestas'+kid()+'? ¡Vamos a Curiolandia!'];
    if(this.ph>=lines.length){S.intro=true;save();go('map',{hello:true});return}
    this.t=0; if(this.ph===1){SFX.whoosh();for(let i=0;i<16;i++)this.qs.push({a:rnd(-2.6,-.4),v:rnd(200,520),c:pick(LOGOC),r:rnd(-1,1),t0:T+i*.06})}
    say(lines[this.ph],()=>later(700,()=>{this.ph++;this.next()}));
  },
// update(dt): cuenta el tiempo de la frase actual (para que Tito tiemble en la frase 1).
  update(dt){this.t+=dt},
// draw(): prado, nubes y flores, Tito, los interrogantes que vuelan en abanico desde la mochila (cada uno sale
// t0 segundos después y frena con easeOut), los dibujos sol/vaca/nube en la frase 2 y el botón de saltar.
  draw(){
    sky('#BFEAF7','#FFF6E6');ctx.fillStyle='#9FDC8F';ctx.beginPath();ctx.ellipse(800,980,1100,260,0,0,PI*2);ctx.fill();
    cloud(200,160,1);cloud(1200,120,1.2);
    for(const [x,c] of [[300,'#FF6B5E'],[1300,'#F58BB4'],[1450,'#FFC93C'],[150,'#9B8AD9']] as [number, string][]){ctx.fillStyle='#7CC86E';ctx.fillRect(x-4,760,8,40);circ(x,750,22,c,4)}
    drawTito(560,390,440,{sq:this.ph===1?Math.sin(this.t*20)*.03:0});
    for(const q of this.qs){const k=Math.max(0,T-q.t0);if(k<=0)continue;const d=Math.min(1,k/1.6);const x=720+Math.cos(q.a)*q.v*easeOut(d)*1.6,y=560+Math.sin(q.a)*q.v*easeOut(d)+Math.sin(T*3+q.r*5)*10;
      ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(T*2+q.r)*.3);text('?',0,0,90,q.c,{st:7});ctx.restore()}
    if(this.ph===2){([['sol',1180,300],['vaca',1380,420],['nube',1180,520]] as [string, number, number][]).forEach(([k,x,y],i)=>pic(k,x,y+Math.sin(T*2+i)*8,150))}
    const s=hv('skip',hR(1500,820,120,100));ctx.save();ctx.translate(1500,820);ctx.scale(s,s);card(-60,-50,120,100,'#fff',6,34);ctx.beginPath();ctx.moveTo(-22,-25);ctx.lineTo(20,0);ctx.lineTo(-22,25);ctx.closePath();fillStroke(K,0);ctx.restore();
  },
// down(x, y): el botón de saltar (abajo a la derecha) termina el cuento.
  down(x,y){if(x>1420&&y>750){S.intro=true;save();go('map',{hello:true})}}
};

/* ---------- PIEZAS DEL MAPA, DE LAS ZONAS Y DE LA CASITA ---------- */
// Las escenas del mapa (map), de las zonas (jardin, bosque...) y de la casita (casita) están desde la fase 4d en
// escenas/zonas.ts, definidas una sola vez, con suggestTema y stationPos: antes había aquí una versión 1 (el mapa con
// MZ, el jardín con JPOS y BANDC, la casita en filas) que zonas.ts reescribía y que ya no se usaba. Aquí quedan las
// piezas que usan ellas y otras escenas: asamHoy, drawLogoSmall, drawCasita, GNAME, gIcon y drawStation.
// asamHoy(): true si hoy ya se ha hecho la asamblea (S.asam[fecha de hoy].done).
export const asamHoy=()=>S.asam[today()]&&S.asam[today()].done;
// drawLogoSmall(x, y, s): versión pequeña y más quieta del logotipo (cabecera del mapa). Solo dibuja.
export function drawLogoSmall(x: number,y: number,s: number){ctx.font=`700 ${s}px ${DF}`;const ws=[...LOGO].map(c=>ctx.measureText(c).width),tw=ws.reduce((a,b)=>a+b,0);let cx=x-tw/2;[...LOGO].forEach((c,i)=>{text(c,cx+ws[i]/2,y+Math.sin(T*3+i*.7)*2,s,LOGOC[i],{st:s*.08});cx+=ws[i]})}

// drawCasita(t, x, y, o): dibuja la casita del tema t en (x, y). o.s = escala, o.glow = halo amarillo (la recomendada).
// Las casitas normales llevan tejado del color t.c y el dibujo t.icon; el Rincón de los Conceptos (t.concepts) es un
// cuadro con formas. Debajo, un punto por juego (amarillo = terminado) y, si el tema está terminado, estrella y flores.
// Solo dibuja. La usan las zonas (escenas/zonas.ts) y la capa 3D (mundo3d/) para las etiquetas.
export function drawCasita(t: Tema,x: number,y: number,o: Libre={}){
  const st=tst(t.id),done=st.done,n=gDone(t),s=o.s||1;
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  if(o.glow){const p=(Math.sin(T*4)+1)/2;ctx.globalAlpha=.35+.35*p;circ(0,10,128+p*8,null,12,'#FFC93C');ctx.globalAlpha=1}
  if(t.concepts){card(-110,-70,220,150,'#9B8AD9',7,20);card(-96,-56,192,122,'#EDE7FF',5,14);circ(-50,0,30,'#FF8A7A',5);card(-6,-30,56,56,'#5BB8E6',5,6);star(70,-6,30,'#FFC93C',4);ctx.beginPath();ctx.moveTo(-50,50);ctx.lineTo(-20,30);ctx.lineTo(10,50);ctx.closePath();fillStroke('#7CC86E',4)}
  else{card(-88,-40,176,120,'#FFF6E6',7,10);ctx.beginPath();ctx.moveTo(-108,-36);ctx.lineTo(0,-118);ctx.lineTo(108,-36);ctx.closePath();fillStroke(t.c,7);
    card(-62,-26,92,82,'#fff',5,14);pic(t.icon,-16,16,84);card(44,6,34,74,'#C98A4B',5,8)}
  for(let j=0;j<t.games.length;j++)circ(-((t.games.length-1)*13)+j*26,98,9,j<n?'#FFC93C':'#EADFCF',3);
  if(done){star(90,-96,30,'#FFC93C',4);flower(-100,70,14,FLC[1],2.5);flower(100,70,14,FLC[3],2.5)}
  ctx.restore();
}
/* ---------- ESTACIONES DE LA CASITA ---------- */
// GNAME: nombre que dice Tito para cada tipo de juego (g.t), cuando el juego no trae su propio g.name.
// Desde la fase 4d están aquí todos (antes escenas/zonas.ts añadía los de los temas extra, las fiestas y los cuentos).
export const GNAME: Record<string, string>={conocer:'Conocer',busca:'¿Dónde está?',memoria:'Memoria',sonido:'¿Quién hace este sonido?',cuerpo:'Mi cuerpo',toca:'Tocá la parte del cuerpo',puzzle:'Rompecabezas',pinta:'Pintar',clasifica:'Las canastas',
  burbujas:'Burbujas de colores',cae:'¡Atrapalas!',viste:'Vestir al nene',ordena:'Ordenar',mifamilia:'Armá tu familia',arma:'Hacer un muñeco de nieve',macedonia:'Ensalada de frutas',cuenta:'Contar',corral:'Dentro y fuera del corral',
  guarda:'Dentro y fuera',riega:'Regar las flores',excava:'Cavar en la arena',
  cuento:'El cuento',cancion:'La canción',trazo:'Trazos',secuencia:'¿Qué va primero?',series:'¿Qué viene después?',velas:'Soplar las velitas',decora:'Decorar'};
// gIcon(g, t): dibujo de la estación del juego g del tema t: g.icon si lo trae; si no 'lupa' (conocer), 'busca',
// 'memo' (memoria) o el icono del tema.
const gIcon=(g: JuegoTema,t: Tema): string=>g.icon||(g.t==='conocer'?'lupa':g.t==='busca'?'busca':g.t==='memoria'?'memo':t.icon);
// drawStation(t, j, x, y, o): dibuja la estación del juego j del tema t en (x, y): círculo blanco (amarillo si es el
// primero y no está hecho), el dibujo del juego (lupa, búsqueda, cartas de memoria o el icono) y, si está terminado,
// una estrella con "×N" veces. o.s = escala. Solo dibuja.
export function drawStation(t: Tema,j: number,x: number,y: number,o: Libre={}){
  const g=t.games[j],done=tst(t.id).g[j],ic=gIcon(g,t),s=o.s||1;
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);ell(0,130,120,24,'rgba(74,52,40,.15)',0);
  circ(0,0,128,j===0&&!done?'#FFF3B0':'#fff',8);
  if(ic==='lupa'){circ(-14,-14,52,'#DDF3FB',9);ctx.beginPath();ctx.moveTo(24,24);ctx.lineTo(62,62);ctx.lineWidth=20;ctx.strokeStyle=K;ctx.lineCap='round';ctx.stroke();pic(t.words&&t.words[0]&&t.words[0].k||t.icon,-14,-14,74)}
  else if(ic==='busca'){const k=t.words&&t.words[1]&&t.words[1].k||t.icon;pic(k,0,0,150);text('?',70,-50,70,'#5B8DEF',{st:6})}
  else if(ic==='memo'){ctx.save();ctx.rotate(-.15);card(-78,-58,80,104,'#FFA94D',6,14);ctx.restore();ctx.save();ctx.rotate(.12);card(-6,-56,84,108,'#fff',6,14);pic(t.icon,36,-2,70);ctx.restore()}
  else pic(ic,0,0,170);
  if(done){star(92,-92,32,'#FFC93C',4);if(done>1){text('×'+done,92,-40,26,K)}}
  ctx.restore();
}
/* ---------- JUEGO ---------- */
// finishGame(t, gi): se llama cuando el niño acaba el juego gi del tema t (desde SCENES.juego). Desde la fase 4b es
// una sola función, sin envolturas: lo que cambia en S lo decide el caso de uso terminarJuego
// (aplicacion/terminarJuego.ts): suma 1 a S.temas[t.id].g[gi] (veces jugado) y, si con esto ya están todos los juegos,
// pone done = 1 (el tema da una flor a Tito); apunta hoy en S.gs['tema#juego'].d y, si el juego venía del repaso de
// hoy (REP_ON), lo marca hecho en S.rep.done. Aquí se ponen esos campos en S, se guarda y se celebra: la primera vez
// que acaba ese juego regala una figurita (S.stk) de una palabra del tema que aún no tenga, dice una felicitación
// (cuando Tito acaba la que esté diciendo), da las monedas (3 la primera vez y 2 si se repite; antes lo hacía
// escenas/tienda.ts) y vuelve a go('casita', {t, fin}); fin = true solo la PRIMERA vez que se completan todos los juegos
// del tema (entonces la casita manda al cofre).
export function finishGame(t: Tema,gi: number): void{
  const r=terminarJuego(S,t,gi,{hoy:today(),delRepaso:REP_ON});Object.assign(S,r.partida);
  save();SFX.tada();burst(800,380,90);
// Figurita: una palabra del tema con dibujo que aún no esté en el álbum; si no queda ninguna, el icono del juego
// (si es un dibujo real: los nombres cortos como 'lupa'/'memo' no lo son) o el del tema.
  if(r.primera){const pool=(t.words||[]).map((w: Libre)=>w.k).filter((k: string)=>k&&PICS[k]&&!S.stk[k]);giveSticker(pool.length?pick(pool):(gIcon(t.games[gi],t).length>4&&PICS[gIcon(t.games[gi],t)]?gIcon(t.games[gi],t):t.icon))}
  sayQ(pick(['¡Lo lograste! ¡Ganaste una estrella!','¡Muy bien'+kid()+'! ¡Una estrella más!','¡Bravo! ¡Terminaste el juego!']),()=>later(600,()=>go('casita',{t:t.id,fin:r.fin})));// espera a que acabe la última felicitación del juego
  giveCoins(r.monedas,800,420);
}
// JUEGO: escena "contenedor". makeGame (juegos/) crea el juego concreto a partir de su descripción
// (t.games[g], con g.t = tipo) y esta escena le pasa update/draw/down/move/up/hint/prompt. Se entra con
// go('juego', {t: id del tema, g: número de juego}). Cuando el juego llama a su callback de fin, se ejecuta finishGame.
// enter apunta el último juego (ultimoJuego, para la casita 3D; hasta la fase 4i, mundo3d/casita3d.ts envolvía enter
// para hacerlo). Las monedas del juego (las de cada acierto, que da
// onRight, y el marcador) están aquí desde la fase 4b; antes las añadía escenas/tienda.ts envolviendo enter y draw.
// ultimoJuego: el último juego que se abrió ({t: id del tema, g: número de juego}), o null. Lo apunta enter de la escena
// juego; lo lee la casita 3D (mundo3d/casita3d.ts) para que, al volver, Tito aparezca junto a ese puesto. Desde la
// fase 4i (antes, mundo3d/casita3d.ts envolvía este enter para apuntarlo).
export let ultimoJuego: {t: string, g: number}|null=null;
SCENES.juego={music:'game',
// enter(o): pone a cero las monedas de acierto del juego (alEmpezarJuego; como mucho 5 por juego). REP = veces que ya se
// ha terminado este juego (máx. 2): sube el "Nivel" y la dificultad al repetir.
// Crea el juego con makeGame(desc, tema, alAcabar); this.fin evita terminar dos veces. Apunta ultimoJuego.
  enter(o){ultimoJuego={t:o.t,g:o.g};alEmpezarJuego();this.t=TEMA[o.t];this.gi=o.g;VIVO.REP=repeticion(tst(o.t).g[o.g]);this.fin=false;this.g=makeGame(this.t.games[o.g],this.t,()=>{if(this.fin)return;this.fin=true;VIVO.drag=null;finishGame(this.t,o.g)});this.g.enter&&this.g.enter()},
// update(dt): pasa el tiempo al juego.
  update(dt){this.g.update&&this.g.update(dt)},
// draw(): dibuja el juego, la casa, las estrellas de rondas (g.done de g.total), el cartel "Nivel N" al repetir, Tito y,
// encima de todo, el marcador de monedas (drawCoinHUD).
  draw(){this.g.draw();drawHome();if(this.g.total)drawRounds(Math.min(this.g.done,this.g.total),this.g.total);if(VIVO.REP>0){card(1400,140,160,56,'#9B8AD9',5,28);text('Nivel '+(VIVO.REP+1),1480,180,30,'#fff')}drawTito(TITO.x,TITO.y,TITO.w);drawCoinHUD()},
// down(x, y): casa -> vuelve a la casita sin terminar; si ya terminó, solo chispas; Tito -> repite la consigna del juego;
// si no, se lo pasa al juego.
  down(x,y){if(atHome(x,y)){SFX.tap();go('casita',{t:this.t.id});return}if(this.fin){sparkles(x,y,4);return}if(inTito(x,y)){this.g.prompt&&this.g.prompt();return}this.g.down&&this.g.down(x,y)},
// move(x, y) / up(x, y): arrastres; se pasan al juego mientras no haya terminado.
  move(x,y){if(!this.fin)this.g.move&&this.g.move(x,y)},/* up(x, y): soltar, se pasa al juego. */up(x,y){if(!this.fin)this.g.up&&this.g.up(x,y)},
// hint(): la ayuda la decide el juego (nada si ya terminó).
  hint(){return this.fin?null:this.g.hint&&this.g.hint()},/* prompt(): la consigna la dice el juego. */prompt(){this.g.prompt&&this.g.prompt()}
};

/* ================= LA ASAMBLEA ================= */
// EMO (las emociones) y drawFace (su carita) están desde la fase 4o en juegos/caras.ts.
// EMO_AGE: qué emociones salen según la edad. EMO_SAY: lo que dice Tito al elegir cada una. EMO_TIP: consejo extra (5 años).
const EMO_AGE: Record<number, string[]>={3:['alegria','tristeza','enojo'],4:['alegria','tristeza','enojo','miedo','sorpresa'],5:['alegria','tristeza','enojo','miedo','sorpresa','calma','verguenza']};
const EMO_SAY: Record<string, string>={alegria:'¡Qué bueno! Hoy sentís alegría. ¡Yo también estoy feliz de verte!',tristeza:'Hoy sentís tristeza. Está bien estar triste a veces. Un abrazo ayuda mucho.',enojo:'Hoy sentís enojo. Cuando me enojo, respiro como un globo: inflo, inflo... y suelto despacito.',
  miedo:'Hoy sentís miedo. Si tenés miedo, buscá a un grande que te cuide.',sorpresa:'¡Hoy sentís sorpresa! ¡Qué emocionante!',calma:'Hoy sentís calma. ¡Qué lindo sentirse así!',verguenza:'Hoy sentís vergüenza. Nos pasa a todos. Respirá hondo y sonreí.'};
const EMO_TIP: Record<string, string>={tristeza:' Podés contarle a alguien lo que te pasa.',enojo:' Y después contá lo que te enojó con palabras.',miedo:' Hablar de lo que da miedo lo hace más chiquito.'};
// WX: tipos de tiempo. {clave: {k: dibujo, s: frase de Tito}}. WX_AGE: cuáles salen según la edad.
// WX_ROPA: prendas correctas para cada tiempo (paso 'ropa' de 4 años).
export const WX: Record<string, { k: string; s: string }>={sol:{k:'sol',s:'¡Hoy hace sol!'},nublado:{k:'nublado',s:'¡Hoy está nublado!'},lluvia:{k:'lluvia',s:'¡Hoy llueve!'},viento:{k:'viento',s:'¡Hoy hay viento!'},nieve:{k:'nieve',s:'¡Hoy nieva!'},tormenta:{k:'tormenta',s:'¡Hoy hay tormenta!'},niebla:{k:'niebla',s:'¡Hoy hay niebla!'}};
const WX_AGE: Record<number, string[]>={3:['sol','nublado','lluvia'],4:['sol','nublado','lluvia','viento','nieve'],5:['sol','nublado','lluvia','viento','nieve','tormenta','niebla']};
const WX_ROPA: Record<string, string[]>={sol:['gorra','gafas'],nublado:['abrigo'],lluvia:['paraguas','botasAgua'],viento:['bufanda','abrigo'],nieve:['gorro','guantes'],tormenta:['paraguas','botasAgua'],niebla:['abrigo','bufanda']};
// SEASON_NEXT: qué estación viene después de cada una (paso 'siguiente' de 5 años).
const SEASON_NEXT: Record<string, string>={primavera:'verano',verano:'otoño',otoño:'invierno',invierno:'primavera'};
// dayIdx(d): día de la semana con el lunes = 0 y el domingo = 6 (Date.getDay empieza en domingo).
export const dayIdx=(d: Date)=>(d.getDay()+6)%7; // lunes=0
// isBday(d): true si d (hoy por defecto) es el cumpleaños guardado en S.bday ({m: mes 0-11, d: día}). Desde la fase 4e
// está aquí, con la asamblea (antes en escenas/zonas.ts); la usa también la capa 3D (mundo3d/interaccion.ts y mundo3d/zonas3d.ts: la nube del confeti).
export const isBday=(d=ahora())=>esCumple(S.bday,d.getMonth(),d.getDate());

// LA ASAMBLEA: rutina diaria de la plaza. Es una máquina de estados: this.steps es la lista de pasos según la edad
// y this.si el paso actual (this.s = su nombre). Para cada paso X hay un método in_X() que lo prepara (opciones y
// pregunta); down() comprueba la respuesta y, si es buena, llama a next() para pasar al siguiente.
// Lo que se responde se guarda en this.rec y al final en S.asam[fecha de hoy] = {done, age, tiempo, emo, dia}.
// El día del cumpleaños (isBday) hay además un paso 'cumple': soplar tantas velas como años, una vez (S.bdayDone).
// Desde la fase 4e todo está aquí (antes escenas/zonas.ts añadía el cumpleaños y las monedas del día envolviendo
// enter, draw, down, hint, prompt e in_fin).
SCENES.asamblea={music:'plaza',
// enter(): fecha de hoy (this.d), día de la semana (this.ti), lo ya guardado hoy (this.rec) y la lista de pasos:
// 3 años: hola, día/noche, día, tiempo, emoción. 4 años: + ropa y estación. 5 años: + mañana, mes, estación siguiente.
// Si hoy es su cumpleaños y aún no se ha celebrado, mete el paso 'cumple' justo después de 'hola'.
  enter(){const a=AGE();this.d=ahora();this.ti=dayIdx(this.d);this.rec=S.asam[today()]||{};
    this.steps=['hola',a<=3?'dianoche':null,'dia',a>=5?'manana':null,a>=5?'mes':null,'tiempo',a===4?'ropa':null,a>=4?'estacion':null,a>=5?'siguiente':null,'emocion','fin'].filter(Boolean);
    this.si=-1;this.next();if(isBday()&&S.bdayDone!==today())this.steps.splice(1,0,'cumple')},
// next(): pasa al siguiente paso: reinicia errores, opciones y selección y llama a in_<paso>() si existe.
// busy = true bloquea los toques mientras Tito habla.
  next(){this.si++;this.s=this.steps[this.si];this.t0=T;this.errs=0;this.busy=false;this.opts=[];this.sel=null;this.bounce=-1;this.extra=null;const f=this['in_'+this.s];f&&f.call(this)},
// ask(fn): pregunta del paso (fn dice la frase) a los 0,3 s y cuando Tito calle; no se dice si mientras tanto el niño ya
// respondió (this.sel) o se pasó a otro paso. Así una respuesta rápida no queda cortada por su propia pregunta.
  ask(fn: () => void){const si=this.si;later(300,()=>whenQuiet(()=>{if(this.si===si&&this.sel===null)fn()}))},
  // opciones genéricas: {x,y,s,draw(x,y,s),v,ok}
// setOpts(list, y, s): coloca en fila, centradas, las opciones de un paso. Cada opción: {draw(x,y,s): la dibuja,
// v: valor, ok: si es correcta}; se le añaden x, y, s (tamaño) e "in" (momento en que aparece, para la animación).
  setOpts(list: Libre[],y=520,s=230){const n=list.length,gap=s+24;this.opts=list.map((o: Libre,i: number)=>Object.assign({x:800-(n-1)*gap/2+i*gap,y,s,in:T+i*.08},o))},
// in_hola(): paso 1, pasar lista: tocar la foto propia.
  in_hola(){this.ask(()=>say(`¡Buen día${kid()}! Empieza la asamblea. ¿Estás acá? ¡Tocá tu foto!`))},
// in_cumple(): crea una vela por año (this.vs, máximo 7), toca la canción y pide soplarlas.
  in_cumple(){const n=clamp(S.age||AGE(),1,7);this.vs=Array.from({length:n},(_,j)=>({x:800-(n-1)*55+j*110,y:340,on:1}));this.vc=0;
    later(300,()=>{playTune(TUNES.cumple);say('¡Hoy es un día muy especial... ¡es tu cumpleaños! ¡Feliz cumpleaños'+kid()+'! Soplá las velitas: tocá cada una.')})},
// in_dianoche(): (3 años) ¿es de día o de noche? Correcto según la hora real (de 7 a 20 h es de día).
  in_dianoche(){const h=this.d.getHours(),day=h>=7&&h<20;this.setOpts([{draw:(x: number,y: number,s: number)=>dayNight(1).draw(x,y,s),ok:day,v:'dia'},{draw:(x: number,y: number,s: number)=>dayNight(0).draw(x,y,s),ok:!day,v:'noche'}],500,300);this.ask(()=>say('¿Ahora es de día o de noche?'))},
// in_dia(): el tren de los días (this.wag, un vagón por día). 3 años: Tito canta los días (sing) y hace saltar el
// vagón de hoy. 4-5 años: dice qué día fue ayer y el niño busca hoy.
  in_dia(){const a=AGE();this.wag=DIASL.map((_d,i)=>({x:330+i*168,y:520,i}));
    if(a<=3){this.busy=true;later(300,()=>sayQ('Cantemos los días de la semana.',()=>this.sing(()=>{this.bounce=this.ti;say('Hoy es '+DIASL[this.ti]+'. ¡Tocá el vagón de hoy, el que salta!',()=>{this.busy=false})})))}
    else{const y=DIASL[(this.ti+6)%7];this.ask(()=>say('Ayer fue '+y+'. ¿Qué día es hoy? Tocá el vagón.'))}},
// in_manana(): (5 años) el tren con "HOY" marcado; hay que tocar mañana.
  in_manana(){this.wag=DIASL.map((_d,i)=>({x:330+i*168,y:520,i}));this.mark=this.ti;this.ask(()=>say('Hoy es '+DIASL[this.ti]+'. ¿Y mañana qué día será? Tocá el vagón de mañana.'))},
// in_mes(): (5 años) calendario del mes (this.cal: {n, x, y} por día, empezando en lunes); hay que tocar el número de hoy.
  in_mes(){const d=this.d,first=new Date(d.getFullYear(),d.getMonth(),1),n=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(),o=dayIdx(first);
    this.cal=[];for(let i=1;i<=n;i++){const p=o+i-1;this.cal.push({n:i,x:520+(p%7)*110,y:300+Math.floor(p/7)*92})}
    this.ask(()=>say('Estamos en '+MESES[d.getMonth()]+'. Hoy es '+d.getDate()+'. Tocá el número '+d.getDate()+' en el calendario.'))},
// in_tiempo(): ¿qué tiempo hace? Todas las opciones valen (ok: true): se apunta lo que diga el niño.
  in_tiempo(){this.setOpts(WX_AGE[AGE()].map(w=>({draw:(x: number,y: number,s: number)=>pic(WX[w].k,x,y,s*.85),v:w,ok:true})),520,AGE()>=5?170:AGE()===4?200:250);this.ask(()=>say('¿Qué tiempo hace hoy? Mirá por la ventana de tu casa y tocá el dibujo.'))},
// in_ropa(): (4 años) una prenda buena para el tiempo elegido y dos que no van, mezcladas.
  in_ropa(){const w=this.rec.tiempo||'sol',good=pick(WX_ROPA[w]),bad=shuffle(['gafas','gorra','guantes','gorro','paraguas','remera','bufanda'].filter(k=>!WX_ROPA[w].includes(k))).slice(0,2);
    this.setOpts(shuffle([good,...bad]).map(k=>({draw:(x: number,y: number,s: number)=>pic(k,x,y,s*.8),v:k,ok:k===good})),540,250);this.ask(()=>say('Con este tiempo, ¿qué nos ponemos para salir?'))},
// in_estacion(): (4-5 años) cuatro árboles; correcto el de la estación actual (estacionDe, según el hemisferio).
  in_estacion(){const e=estacionDe(this.d);this.setOpts(ESTACIONES.map(s=>({draw:(x: number,y: number,sz: number)=>tree(x,y+sz*.25,sz/280,s),v:s,ok:s===e})),520,250);this.ask(()=>say('¿En qué estación estamos? Tocá el árbol.'))},
// in_siguiente(): (5 años) ¿qué estación viene después? (SEASON_NEXT).
  in_siguiente(){const e=estacionDe(this.d),n=SEASON_NEXT[e];this.setOpts(ESTACIONES.map(s=>({draw:(x: number,y: number,sz: number)=>tree(x,y+sz*.25,sz/280,s),v:s,ok:s===n})),520,250);this.ask(()=>say('Ahora es '+e+'. ¿Qué estación viene después?'))},
// in_emocion(): ¿cómo te sientes? Caritas según la edad; todas valen.
  in_emocion(){this.setOpts(EMO_AGE[AGE()].map(m=>({draw:(x: number,y: number,s: number)=>drawFace(x,y,s*.42,m),v:m,ok:true})),520,AGE()>=5?175:AGE()===4?220:260);this.ask(()=>say(tx('¿Cómo te sentís hoy? Tocá la carita.')))},
// in_fin(): cierra la asamblea: guarda S.asam[hoy] con done y edad, borra las más antiguas (se quedan 120 días) y,
// si es la 3.ª asamblea de la semana (desde el lunes, wk), regala una figurita una sola vez por semana (S.first.wk).
// Después vuelve al mapa. La primera asamblea terminada de cada día regala además 5 monedas (MONEDAS.asamblea). Lo que cambia
// en la partida lo decide el caso de uso terminarAsamblea (aplicacion/premiosDelDia.ts); aquí, la pantalla.
  in_fin(){const wk=(()=>{const d=new Date(this.d);d.setDate(d.getDate()-dayIdx(d));return ymd(d)})();
    // lo que cambia en la partida lo decide el caso de uso terminarAsamblea (aplicacion/premiosDelDia.ts)
    const fin=terminarAsamblea(S,today(),wk,this.rec,AGE());this.rec=fin.hoy;Object.assign(S,fin.partida);save();
    SFX.tada();burst(800,400,80);
    let line='¡Terminamos la asamblea'+kid()+'! ¡Ahora a jugar!';
    if(fin.figurita){giveSticker('estrella');line='¡Tres asambleas esta semana! ¡Ganaste una figurita! Ahora, ¡a jugar!'}
    say(line,()=>later(800,()=>go('map')));if(fin.monedas)later(400,()=>giveCoins(fin.monedas,800,420))},
// sing(cb): canta los siete días uno a uno (this.singI = el que suena, para que su vagón salte) y al acabar llama a cb.
// st() dice un día y, cuando termina, programa el siguiente.
  sing(cb: () => void){let i=0;const st=()=>{if(i>=7){this.singI=-1;cb&&cb();return}this.singI=i;SFX.count(i);say(DIASL[i],()=>{i++;later(80,st)},{rate:1})};st()},
// prompt(): repite la pregunta del paso actual.
  prompt(){if(this.s==='cumple'){say('Tocá las velitas para soplarlas.');return}const f=({hola:'¡Tocá tu foto!',dianoche:'¿Ahora es de día o de noche?',dia:AGE()<=3?'Tocá el vagón que salta.':'Ayer fue '+DIASL[(this.ti+6)%7]+'. ¿Qué día es hoy?',manana:'¿Qué día será mañana?',mes:'Tocá el número '+this.d.getDate()+'.',tiempo:'¿Qué tiempo hace hoy?',ropa:'¿Qué nos ponemos?',estacion:'¿En qué estación estamos?',siguiente:'¿Qué estación viene después?',emocion:tx('¿Cómo te sentís hoy?')} as Record<string, string>)[this.s];if(f)say(f)},
// hint(): dónde señalar la ayuda en cada paso. En 'dia'/'manana' con 4-5 años no ayuda enseguida (solo tras un error o
// mucho rato quieto). En 'tiempo' y 'emocion' no hay respuesta correcta, así que no se señala nada. En 'cumple',
// la siguiente vela encendida.
  hint(){if(this.s==='cumple'){const v=this.vs&&this.vs.find((v: Libre)=>v.on);return v&&!this.busy?{x:v.x,y:v.y-30,r:60}:null}
    if(this.busy)return null;const s=this.s;
    if(s==='hola')return{x:800,y:500,r:180};
    if(s==='dia'||s==='manana'){if(AGE()>=4&&this.errs<1)return VIVO.idle>14?{x:this.wag[s==='dia'?this.ti:(this.ti+1)%7].x,y:520,r:90}:null;return{x:this.wag[s==='dia'?this.ti:(this.ti+1)%7].x,y:520,r:90}}
    if(s==='mes'){const c=this.cal[this.d.getDate()-1];return{x:c.x,y:c.y,r:55}}
    const o=this.opts.find((o: Libre)=>o.ok);return o&&!['tiempo','emocion'].includes(s)?{x:o.x,y:o.y,r:o.s*.6}:null},
// update(): nada que actualizar cada cuadro.
  update(){},
// draw(): la clase (ventana con el cielo según la hora y el tiempo apuntado, cartel ASAMBLEA) y lo propio del paso:
// foto de "presente", tren de los días, calendario, u opciones genéricas (this.opts) con animación de entrada (back) y
// temblor al fallar (o.shake). Abajo, puntos de progreso de los pasos. Encima de todo, lo del cumpleaños (drawCumple).
  draw(){
    sky('#FFF3D6','#FCE3C0');floor(760,'#E9C99A');
    // ventana con el tiempo real no se conoce: se ve el cielo según la hora
    const h=this.d.getHours(),night=h<7||h>=20,wx=this.rec.tiempo;card(1240,40,300,210,night?'#2E3F7A':'#BFEAF7',8,16);if(wx&&!night)pic(WX[wx].k,1390,145,170);else if(wx&&night){pic('luna',1320,110,80);pic(WX[wx].k,1440,160,120)}else if(night){pic('luna',1330,120,90);star(1460,90,10,'#FFE08A',0)}else{ctx.globalAlpha=.6;cloud(1280,120,.5);cloud(1420,190,.4);ctx.globalAlpha=1}ctx.beginPath();ctx.moveTo(1390,40);ctx.lineTo(1390,250);ctx.moveTo(1240,145);ctx.lineTo(1540,145);ctx.lineWidth=6;ctx.strokeStyle=K;ctx.stroke();
    card(330,40,560,110,'#fff',6,55);text('ASAMBLEA',610,118,62,K,{f:LF});
    const s=this.s;
    if(s==='hola'){const hs=hv('hola',hR(800,500,320,360));ctx.save();ctx.translate(800,500);ctx.scale(hs*(this.sel?1+.05*Math.sin(T*8):1),hs);card(-160,-180,320,360,'#fff',7,40);pic('nene',0,-30,250);text((S.name||'¡Yo!').toUpperCase(),0,140,S.name&&S.name.length>8?40:54,K,{f:LF});ctx.restore();
      if(this.sel){star(960,330,40,'#FFC93C',5);text('¡PRESENTE!',800,760,60,'#7CC86E',{f:LF,st:6,sc:'#fff'});if(AGE()>=5){pic('gorra',800,290,150)}}}
    if(s==='dia'||s==='manana'){
      // tren de los días
      ctx.beginPath();ctx.moveTo(220,640);ctx.lineTo(1520,640);ctx.lineWidth=10;ctx.strokeStyle=K;ctx.stroke();
      card(150,430,150,180,'#FF6B5E',7,20);card(180,370,60,70,'#5B5F6B',6,8);circ(190,620,26,'#5B5F6B',6);circ(260,620,26,'#5B5F6B',6);
      for(const w of this.wag){const we=w.i>=5,b=(this.bounce===w.i?Math.abs(Math.sin(T*6))*30:0)+(this.singI===w.i?16:0),hs=hv('w'+w.i,hR(w.x,w.y,150,170));
        ctx.save();ctx.translate(w.x,w.y-b);ctx.scale(hs,hs);card(-72,-80,144,150,DIAC[w.i],7,18);if(we){star(0,-46,18,'#fff',3)}
        const nm=DIASL[w.i].toUpperCase();text(nm,0,22,nm.length>7?22:26,K,{f:LF});if(s==='manana'&&w.i===this.ti){card(-50,-130,100,40,'#fff',4,20);text('HOY',0,-100,26,K,{f:LF})}
        ctx.restore();circ(w.x-40,620,20,'#5B5F6B',5);circ(w.x+40,620,20,'#5B5F6B',5)}
      if(this.sel!=null&&this.sel!==false){text(s==='dia'?'HOY: '+DIASL[this.ti].toUpperCase():'MAÑANA: '+DIASL[(this.ti+1)%7].toUpperCase(),800,760,54,K,{f:LF})}}
    if(s==='mes'){card(440,170,800,600,'#fff',7,30);text(MESES[this.d.getMonth()].toUpperCase(),840,240,48,K,{f:LF});
      ['L','M','M','J','V','S','D'].forEach((l,i)=>text(l,520+i*110,290-30,28,'#7A6252',{f:LF}));
      for(const c of this.cal){const hs=hv('c'+c.n,hR(c.x,c.y,96,80)),today_=c.n===this.d.getDate()&&this.sel;ctx.save();ctx.translate(c.x,c.y);ctx.scale(hs,hs);card(-48,-38,96,76,today_?'#FFC93C':(this.errs>=2&&Math.abs(c.n-this.d.getDate())<4?'#FFF3B0':'#FFF6E6'),4,14);text(String(c.n),0,13,36,K,{f:LF});ctx.restore()}}
    for(const o of this.opts){const ap=clamp((T-o.in)*3,0,1),hs=this.sel===o?1.12:hv(o,hR(o.x,o.y,o.s,o.s)),sx=o.shake>0?Math.sin((T-o.shake)*40)*12*Math.max(0,1-(T-o.shake)*2.5):0;
      ctx.save();ctx.translate(o.x+sx,o.y);ctx.scale((ap<1?back(ap):1)*hs,(ap<1?back(ap):1)*hs);card(-o.s/2,-o.s/2,o.s,o.s,this.sel===o?'#FFF3B0':'#fff',this.sel===o?10:7,36,this.sel===o?'#FFC93C':K);o.draw(0,0,o.s);ctx.restore()}
    if(this.s==='tiempo'&&this.sel&&AGE()>=5)this.drawWxCal();
    // pasos
    this.steps.forEach((_st: string,i: number)=>circ(800-(this.steps.length-1)*18+i*36,850,10,i<this.si?'#7CC86E':i===this.si?'#FFC93C':'#EADFCF',3));
    drawHome();drawTito(TITO.x,TITO.y,TITO.w);
    this.drawCumple();
  },
// drawCumple(): en el paso 'cumple', la tarta con las velas (la llama de las encendidas se mueve) y, al soplarlas
// todas, «¡FELIZ CUMPLE!»; en el paso 'mes', una tarta en el día del cumpleaños (S.bday) si es de este mes.
  drawCumple(){
    if(this.s==='cumple'){bunting(170,12);card(460,430,680,260,'#F58BB4',8,40);card(500,370,600,90,'#FFF6E6',7,30);for(let i=0;i<8;i++)circ(520+i*80,460,22,'#FF5A5A',4);card(400,670,800,40,'#E4D3B8',6,20);
      for(const v of this.vs){card(v.x-14,v.y-10,28,80,DIAC[(v.x/110|0)%7],5,8);if(v.on){const f=1+Math.sin(T*14+v.x)*.12;ctx.save();ctx.translate(v.x,v.y-30);ctx.scale(f,1/f);ctx.beginPath();ctx.moveTo(0,-34);ctx.quadraticCurveTo(22,0,0,14);ctx.quadraticCurveTo(-22,0,0,-34);fillStroke('#FFC93C',4);ctx.restore()}}
      if(this.sel){text('¡FELIZ CUMPLE!',800,790,64,'#F58BB4',{f:LF,st:8,sc:'#fff'})}}
    if(this.s==='mes'&&S.bday&&S.bday.m===this.d.getMonth()&&this.cal){const c=this.cal[S.bday.d-1];if(c){pic('tarta',c.x+30,c.y-30,62)}}},
// drawWxCal(): (5 años, tras elegir el tiempo) calendario del mes con el dibujo del tiempo apuntado cada día en S.asam.
  drawWxCal(){const d=this.d,n=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();card(300,180,1000,200,'#fff',6,24);text(tx('Calendario del tiempo de ')+MESES[d.getMonth()],800,220,28,K);
    for(let i=1;i<=n;i++){const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`,r=S.asam[k]||(k===today()?this.rec:null),x=330+((i-1)%16)*60,y=270+Math.floor((i-1)/16)*80;
      card(x-26,y-26,52,52,'#FFF6E6',3,10);if(r&&r.tiempo)pic(WX[r.tiempo].k,x,y,46);else text(String(i),x,y+8,20,'#B8A890')}},
// wrongDay(i, target): el niño tocó el vagón del día i en lugar de target: suma error, dice qué día era el tocado
// con una pista y hace saltar el vagón correcto.
  wrongDay(i: number,target: number){const nm=DIASL[i];this.errs++;SFX.bad();say('Ese es el '+nm+'. '+(this.s==='dia'?(AGE()<=3?'Hoy es '+DIASL[this.ti]+', el que salta.':'Ayer fue '+DIASL[(this.ti+6)%7]+'. Hoy es el que viene después.'):'Mañana es el que viene después de hoy.'));if(this.errs>=1)this.bounce=target},
// soplaVela(x, y): (paso 'cumple') tocar una vela la apaga y cuenta en voz alta; con todas apagadas guarda
// S.bdayDone, da la figurita de la tarta y 10 monedas (MONEDAS.cumple; caso de uso premioDelCumple, de
// aplicacion/premiosDelDia.ts) y pasa al siguiente paso.
  soplaVela(x: number,y: number){if(this.busy)return;const v=this.vs.find((v: Libre)=>v.on&&Math.abs(x-v.x)<55&&y<v.y+80&&y>v.y-110);if(!v){SFX.tap();return}
    v.on=0;this.vc++;SFX.whoosh();SFX.count(this.vc);say(cap(NUM[this.vc]||String(this.vc)));
    // la pegatina y las monedas se guardan junto con S.bdayDone; la celebración solo las enseña (salir no las pierde)
    if(this.vs.every((v: Libre)=>!v.on)){this.busy=true;this.sel=true;const pc=premioDelCumple(S,today());Object.assign(S,pc.partida);creditCoins(pc.monedas);save();later(700,()=>{SFX.tada();burst(800,400,90);burst(400,300,40);burst(1200,300,40);playTune(TUNES.cumple);giveSticker('tarta',true);
      say('¡Que los cumplas feliz! Tito te regala diez monedas.',()=>{giveCoins(pc.monedas,800,400,'cofre',true);later(1200,()=>this.next())})})}},
// down(x, y): comprueba la respuesta del paso actual. Acierto: celebra, apunta la estadística con rec() (acierto a la
// primera si errs == 0), guarda en this.rec y llama a next() cuando Tito termina de hablar. Fallo: sacude la opción,
// suma error y da una pista. El paso 'tiempo' guarda ya en S.asam[hoy]. En 'cumple', soplar (soplaVela).
  down(x,y){
    if(this.s==='cumple'&&!atHome(x,y)&&!inTito(x,y)){this.soplaVela(x,y);return}
    if(atHome(x,y)){SFX.tap();go('map');return}
    if(inTito(x,y)){this.prompt!();return}
    if(this.busy)return;const s=this.s;
    if(s==='hola'){if(inR(x,y,800,500,330,370)){this.busy=true;this.sel=true;SFX.tada();burst(800,500,50);say(AGE()>=5?'¡Presente! Y hoy sos el encargado de la asamblea. ¡Te ganaste la gorra!':'¡Presente! ¡Qué bueno que estás acá!',()=>later(500,()=>this.next()))}return}
    if(s==='dia'||s==='manana'){const w=this.wag.find((w: Libre)=>inR(x,y,w.x,w.y,150,170));if(!w){SFX.tap();return}const target=s==='dia'?this.ti:(this.ti+1)%7;
      if(w.i===target){this.busy=true;this.sel=w.i;this.bounce=w.i;SFX.good();burst(w.x,w.y,40);rec(s==='dia'?'dia-hoy':'dia-manana',this.errs===0);this.rec.dia=DIASL[this.ti];
        const we=this.ti>=5;say(praise()+(s==='dia'?' Hoy es '+DIASL[this.ti]+'. '+(we?'¡Es fin de semana, no hay escuela!':'Es día de escuela.'):' Mañana será '+DIASL[target]+'.'),()=>later(500,()=>this.next()))}
      else this.wrongDay(w.i,target);return}
    if(s==='mes'){const c=this.cal.find((c: Libre)=>inR(x,y,c.x,c.y,100,84));if(!c){SFX.tap();return}
      if(c.n===this.d.getDate()){this.busy=true;this.sel=true;SFX.good();burst(c.x,c.y,30);rec('calendario',this.errs===0);say(praise()+' Hoy es '+DIASL[this.ti]+' '+c.n+' de '+MESES[this.d.getMonth()]+'.',()=>later(500,()=>this.next()))}
      else{this.errs++;SFX.bad();say('Ese es el '+c.n+'. Buscá el '+this.d.getDate()+'.')}return}
    const o=this.opts.find((o: Libre)=>inR(x,y,o.x,o.y,o.s+10,o.s+10));if(!o){SFX.tap();sparkles(x,y,3);return}
// El tiempo se guarda en S al momento para que el calendario del tiempo (drawWxCal) lo muestre ya.
    if(s==='tiempo'){this.busy=true;this.sel=o;this.rec.tiempo=o.v;S.asam[today()]=Object.assign(S.asam[today()]||{},this.rec);save();SFX.good();burst(o.x,o.y,30);say(WX[o.v].s+' Lo anotamos en el calendario del tiempo.',()=>later(AGE()>=5?1500:500,()=>this.next()));return}
    if(s==='emocion'){this.busy=true;this.sel=o;this.rec.emo=o.v;SFX.good();sparkles(o.x,o.y,10);say(EMO_SAY[o.v]+(AGE()>=5&&EMO_TIP[o.v]?EMO_TIP[o.v]:''),()=>later(500,()=>this.next()));return}
    if(o.ok){this.busy=true;this.sel=o;SFX.good();burst(o.x,o.y,30);rec('asamblea-'+s,this.errs===0);
      const ok=({dianoche:o.v==='dia'?'¡Sí! Ahora es de día.':'¡Sí! Ahora es de noche.',ropa:'¡Sí! Nos ponemos '+W_(o.v)+'.',estacion:'¡Sí! Estamos en '+o.v+'.'+(({otoño:' Las hojas se caen.',invierno:' Hace frío.',primavera:' Salen las flores.',verano:' Hace calor.'} as Record<string, string>)[o.v]),siguiente:'¡Sí! Después viene '+(o.v==='otoño'?'el otoño':o.v==='invierno'?'el invierno':o.v==='verano'?'el verano':'la primavera')+'.'} as Record<string, string>)[s];
      say(praise()+' '+ok,()=>later(500,()=>this.next()))}
// Tras dos fallos se pone idle = 7 para que la ayuda (brillo) aparezca enseguida.
    else{o.shake=T;this.errs++;SFX.bad();
      const bad=({dianoche:'Mirá por la ventana. '+(o.v==='dia'?'Ahora no hay sol.':'Ahora hay luz.'),ropa:cap(W_(o.v))+' no va con este tiempo.',estacion:'Ese es el árbol '+(o.v==='otoño'?'del otoño':o.v==='invierno'?'del invierno':o.v==='verano'?'del verano':'de la primavera')+'. Probá con otro.',siguiente:'Mmm, después de '+estacionDe(this.d)+' no viene '+o.v+'.'} as Record<string, string>)[s];
      say(bad||'Probá otra vez.');if(this.errs>=2)VIVO.idle=7}
  }
};

/* ---------- ÁLBUM ---------- */
// ALBUM_KEYS: todas las figuritas posibles del álbum, en orden: las palabras con dibujo y el icono de cada tema, más
// 'estrella' (premio de asambleas). Se calcula una vez al cargar.
const ALBUM_KEYS=(()=>{const s=new Set<string>();for(const t of TEMAS){if(t.words)t.words.forEach((w: Libre)=>w.k&&PICS[w.k]&&s.add(w.k));s.add(t.icon)}s.add('estrella');return [...s].filter(k=>PICS[k])})();
// ÁLBUM DE FIGURITAS: 18 por página (per); las que se tienen (S.stk) en color, las demás en sombra.
SCENES.album={music:'book',
// enter(): primera página; Tito dice cuántas figuritas hay.
  enter(){this.pg=0;const n=Object.keys(S.stk).length;later(300,()=>sayQ(n?V(['Este es tu álbum. Tenés ','Este es tu álbum. Tienes '])+n+(n===1?V([' figurita.',' pegatina.']):V([' figuritas.',' pegatinas.'])):V(['Todavía no tenés figuritas. ¡Las ganás terminando juegos!','Todavía no tienes pegatinas. ¡Las ganas terminando juegos!'])))},
// per: figuritas por página (6 x 3).
  per:18,
// draw(): la página actual, número de página y flechas de anterior/siguiente.
  draw(){sky('#EDE7FF','#FFF6E6');card(240,40,1300,800,'#FFFBF2',8,40);text(V(['Mi álbum de figuritas','Mi álbum de pegatinas']),890,110,52,K,{w:600});
    const ks=ALBUM_KEYS.slice(this.pg*this.per,(this.pg+1)*this.per);
    ks.forEach((k,i)=>{const x=390+(i%6)*200,y=250+Math.floor(i/6)*200,has=S.stk[k];const hs=has?hv('a'+k,hC(x,y,80)):1;ctx.save();ctx.translate(x,y);ctx.scale(hs,hs);if(has)drawSticker(k,0,0,160,Math.sin(i)*.08);else{circ(0,0,80,'#F1E9DC',4,'#E4D3B8');ctx.globalAlpha=.18;picG(k,0,0,130);ctx.globalAlpha=1}ctx.restore()});
    const pages=Math.ceil(ALBUM_KEYS.length/this.per);text((this.pg+1)+' / '+pages,890,820,30,'#7A6252');
    if(this.pg>0){const s=hv('prev',hC(170,450,60));ctx.save();ctx.translate(170,450);ctx.scale(s,s);circ(0,0,56,'#fff',6);ctx.beginPath();ctx.moveTo(14,-24);ctx.lineTo(-18,0);ctx.lineTo(14,24);ctx.lineWidth=10;ctx.strokeStyle=K;ctx.lineCap='round';ctx.stroke();ctx.restore()}
    if(this.pg<pages-1){const s=hv('next',hC(1530,450,60));ctx.save();ctx.translate(1530,450);ctx.scale(s,s);circ(0,0,56,'#fff',6);ctx.beginPath();ctx.moveTo(-14,-24);ctx.lineTo(18,0);ctx.lineTo(-14,24);ctx.lineWidth=10;ctx.strokeStyle=K;ctx.lineCap='round';ctx.stroke();ctx.restore()}
    drawHome();drawTito(TITO.x,TITO.y,TITO.w)},
// down(x, y): casa -> mapa; flechas cambian de página; tocar una figurita dice su nombre (o que aún no se tiene).
  down(x,y){if(atHome(x,y)){SFX.tap();go('map');return}const pages=Math.ceil(ALBUM_KEYS.length/this.per);
    if(dist(x,y,170,450)<70&&this.pg>0){this.pg--;SFX.whoosh();return}if(dist(x,y,1530,450)<70&&this.pg<pages-1){this.pg++;SFX.whoosh();return}
    const ks=ALBUM_KEYS.slice(this.pg*this.per,(this.pg+1)*this.per);ks.forEach((k,i)=>{const px=390+(i%6)*200,py=250+Math.floor(i/6)*200;if(dist(x,y,px,py)<85){if(S.stk[k]){SFX.pop();sparkles(px,py,6);say(cap(W_(k))+'.')}else{SFX.tap();say('Esta todavía no la tenés.')}}})}
};

/* ---------- A DORMIR (límite de tiempo) ---------- */
// A DORMIR: se muestra cuando se acaba el tiempo de juego fijado por el adulto (S.limit, ver aplicacion/adultos.ts).
// Tito duerme bajo la luna. No tiene down(): no se puede seguir jugando desde aquí.
SCENES.dormir={music:null,
// enter(): Tito se despide.
  enter(){later(300,()=>sayQ(`¡Qué lindo jugamos${kid()}! Ahora Tito se va a descansar. ¡Hasta mañana!`))},
// draw(): cielo de noche con estrellas que parpadean, luna, Tito dormido y "z" que suben.
  draw(){sky('#2E3F7A','#5B6FB0');for(let i=0;i<30;i++){ctx.globalAlpha=.5+.5*Math.sin(T*2+i);star((i*197)%1600,(i*131)%560,6+i%3*3,'#FFE08A',0)}ctx.globalAlpha=1;
    pic('luna',1300,180,200);drawTito(600,430,400,{sleep:true,bubble:false});
    for(let i=0;i<3;i++){const k=(T*.5+i/3)%1;ctx.globalAlpha=1-k;text('z',1000+k*80,420-k*160,30+k*40,'#fff');ctx.globalAlpha=1}
    text('Es hora de descansar',800,820,48,'#fff')}
};
