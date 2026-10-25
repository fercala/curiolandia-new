// ARCHIVO: escenas/repaso.ts (antes repaso.js) — el repaso diario con Tito (botón de la lupa en el mapa).
// Para qué sirve: apunta qué habilidades practica cada juego y cómo le va al niño en cada juego,
// y con eso prepara cada día una lista de 3 juegos para repasar (escena SCENES.repaso).
// Desde la fase 2m es un módulo: escenas/indice.ts lo carga el último, después de tienda.ts, y el puente deja lo que
//   exporta en globalThis para las pruebas.
// Define: DATOS, repWeak, repOld, repBuild, repToday, repAllDone, repDue, REPBTN y la escena SCENES.repaso.
//   Añade a S los campos kg, gs y rep. Las reglas (qué juegos cuestan, cuáles son los más antiguos, cómo se elige el
//   repaso, cuándo toca) están desde la fase 3d en dominio/repaso.ts; aquí se les pasan los datos de S (DATOS).
// Exporta: REP_ON (true mientras se juega un juego del repaso; lo leen las pruebas).
// Envuelve (cambia el comportamiento de) funciones de otros archivos: rec y go (src/nucleo/), finishGame
//   (escenas/escenas2d.ts), SCENES.casita.enter y goSeguir (escenas/zonas.ts) y los métodos draw/down/dwell de SCENES.map
//   (escenas/zonas.ts).
// Importa: el núcleo, src/nucleo/ (S, DEF, save, say, rec, today, later, SFX, dibujo), escenas/escenas2d.ts (TEMA, TEMAS,
//   tst, finishGame, drawStation, GNAME, asamHoy), escenas/zonas.ts (goSeguir, drawRoad, lockOver, unlockFx, arrowAt),
//   escenas/tienda.ts (STARS, giveCoins, creditCoins, drawCoinHUD, inCoinHUD), temas/ (floor), MONEDAS de
//   dominio/monedas.ts y las reglas de dominio/repaso.ts.
// Formato del estado guardado:
//   S.kg = { habilidad: ['temaId#juego', ...] }  últimos 6 juegos (el más reciente primero) donde salió esa habilidad.
//   S.gs = { 'temaId#juego': {ok, err, d} }      aciertos, fallos y último día jugado ('AAAA-MM-DD' de today()).
//   S.rep = {d, list, done, weak, paid, seen}    el repaso del día d: list = 3 ids 'temaId#juego',
//           done = {id:1} los ya hechos, weak = cuántos salieron por "cuesta", paid = premio ya dado,
//           seen = el botón verde ya pasó hoy por el repaso.
import type { Escena, Libre, Repaso } from '../nucleo/tipos.ts';
import { K } from '../dibujos/todos.ts';
import { DEF, DF, LF, S, SCENES, SFX, T, TITO, V, atHome, burst, card, circ, ctx, dist, drawHome, drawTito, fillStroke, giveSticker, go, hC, hv, inTito, kid, later, pic, ponGo, ponRec, rec, save, say, sayQ, scene, sceneName, sky, sparkles, text, today } from '../nucleo/indice.ts';
import { floor } from '../temas/indice.ts';
import { GNAME, TEMA, TEMAS, asamHoy, drawStation, finishGame, ponFinishGame, tst } from './escenas2d.ts';
import { arrowAt, drawRoad, goSeguir, lockOver, ponGoSeguir, unlockFx } from './zonas.ts';
import { STARS, creditCoins, drawCoinHUD, giveCoins, inCoinHUD } from './tienda.ts';
import { MONEDAS } from '../dominio/monedas.ts';
import type { DatosRepaso } from '../dominio/repaso.ts';
import { caducado, conJuegoReciente, elegirRepaso, masAntiguos, queCuestan, terminado, toca } from '../dominio/repaso.ts';

/* ================= REPASO INTELIGENTE ================= */
// Cada habilidad recuerda en qué juegos aparece (S.kg) y cada juego cómo le fue (S.gs).
// Todos los días Tito arma un repaso de 3 juegos: primero lo que cuesta, después lo que hace más tiempo que no se juega.
// Valores por defecto de los campos nuevos y arreglo de partidas antiguas que no los tienen.
Object.assign(DEF,{kg:{},gs:{},rep:null});
{const s: Libre=S;for(const k of['kg','gs'])if(!s[k]||typeof s[k]!=='object')s[k]={}}
// Envuelve rec(habilidad, acierto) de nucleo/guardado.ts: además de las estadísticas normales, si estamos en un juego
// apunta en S.kg que esa habilidad sale en este juego (sin repetir, máximo 6) y suma el acierto/fallo en S.gs.
{const r0=rec;ponRec(function(k: string,ok: unknown){r0(k,ok);if(sceneName==='juego'&&scene!.t&&scene!.gi!=null){const id=scene!.t.id+'#'+scene!.gi;
  S.kg![k]=conJuegoReciente(S.kg![k]||[],id);
  const g=S.gs![id]||(S.gs![id]={ok:0,err:0,d:''});ok?g.ok++:g.err++;save()}})}
// true mientras se juega un juego lanzado desde el repaso (para volver al repaso al terminar).
export let REP_ON=false;
// Envuelve finishGame(tema, nº de juego): guarda la fecha en que se jugó (S.gs[id].d) y,
// si el juego venía del repaso de hoy, lo marca como hecho. Después llama al finishGame original.
{const f0=finishGame;ponFinishGame(function(t,gi){const id=t.id+'#'+gi,g=S.gs![id]||(S.gs![id]={ok:0,err:0,d:''});g.d=today();if(REP_ON&&S.rep&&S.rep.list.includes(id))S.rep.done[id]=1;save();f0(t,gi)})}
// DATOS: lo que miran las reglas del repaso (dominio/repaso.ts), leído de S en el momento de cada pregunta.
const DATOS: DatosRepaso={get stats(){return S.stats},get kg(){return S.kg!},get gs(){return S.gs!},get temas(){return TEMAS},tema:(id: string)=>TEMA[id],jugados:(id: string)=>tst(id).g};
// repWeak(): los juegos «que cuestan», sin repetir (queCuestan): primero el más reciente de cada habilidad con 4+
// intentos y menos del 70 % de aciertos (de peor a mejor); después, los juegos con 3+ intentos y menos del 70 %.
const repWeak=(): string[]=>queCuestan(DATOS);
// repOld(): todos los juegos repasables, del que hace más tiempo que no se juega al más reciente (masAntiguos).
const repOld=(): string[]=>masAntiguos(DATOS);
// Prepara el repaso de hoy (3 juegos como máximo) y lo guarda en S.rep: hasta 3 juegos que cuestan; si faltan, los
// más antiguos de temas distintos; si aún faltan, cualquier antiguo (elegirRepaso).
function repBuild(){const {list,weak}=elegirRepaso(repWeak(),repOld());S.rep={d:today(),list,done:{},weak,paid:0,seen:0};save()}
// Devuelve el repaso de hoy (S.rep). Lo vuelve a preparar si es de otro día, si no tenía juegos "que cuestan" pero
// ahora los hay (y aún no se ha hecho ninguno), o si estaba vacío y ya hay juegos (caducado).
function repToday(): Repaso{if(caducado(S.rep,today(),DATOS))repBuild();return S.rep!}
// ¿Están hechos todos los juegos del repaso de hoy? (terminado)
const repAllDone=()=>terminado(S.rep,today());
// ¿Toca repasar? Con 6+ estrellas, si hoy no se ha terminado y hay algo que cuesta (sale el "!" rojo; toca).
const repDue=()=>toca(STARS(),S.rep,today(),DATOS);

// Escena del repaso: hasta 3 estaciones numeradas en un caminito; se abren en orden.
// Al terminar todas, premio (pegatina de la lupa y 5 monedas) y flecha verde para seguir el camino.
SCENES.repaso={music:'casita',
  // Al entrar. o.seguir: viene del botón verde (se apunta seen); o.back: vuelve de un juego del repaso
  // (anima la apertura del siguiente). Si está todo hecho y sin cobrar, da el premio.
  enter(o){const R=repToday();this.L=R.list;this.unl=null;REP_ON=false;if(o.seguir){R.seen=1;save()}
    // el premio (pegatina y 5 monedas) se guarda a la vez que R.paid; la celebración solo lo enseña (salir no lo pierde)
    if(repAllDone()&&!R.paid){R.paid=1;S.stk.lupa=(S.stk.lupa||0)+1;creditCoins(MONEDAS.repaso);save();later(500,()=>{SFX.tada();burst(800,350,90);giveSticker('lupa',true);say('¡Terminaste el repaso de hoy'+kid()+'! Tito te regala cinco monedas.',()=>{giveCoins(5,800,420,undefined,true);later(900,()=>sayQ('Tocá la flecha verde para seguir el camino.'))})});return}
    const nx=this.next();
    if(o.back&&nx>=0&&nx!==this.prevNx){this.unl={j:nx,t:T+.8};later(800,()=>{SFX.sparkle();const [x,y]=this.pos(nx);burst(x,y,30)});later(300,()=>sayQ('¡Muy bien! Ahora el número '+(nx+1)+'.'));return}
    later(300,()=>this.prompt!(!o.back))},
  // Posición en pantalla [x,y] de la estación j (centradas en fila).
  pos(j: number){const n=this.L.length;return[860-(n-1)*180+j*360,500]},
  // La estación j está abierta si es la primera, si la anterior está hecha o si ella misma ya está hecha.
  open(j: number){return S.unlockAll||j===0||!!S.rep!.done[this.L[j-1]]||!!S.rep!.done[this.L[j]]},
  // Índice de la siguiente estación por hacer (abierta y sin hacer), o -1 si no queda ninguna.
  next(){return this.L.findIndex((id: string,j: number)=>!S.rep!.done[id]&&this.open(j))},
  // Tito explica qué hacer; con long=true añade la explicación de por qué se repasa.
  prompt(long){const R=S.rep!;if(!this.L.length){say('Todavía no hay nada para repasar. ¡Primero jugá algunos juegos del camino!');return}
    const nx=this.next();if(nx<0){say('¡Ya hiciste el repaso de hoy! Mañana Tito prepara otro. Tocá la flecha verde para seguir el camino.');return}
    say((long?(R.weak?'¡Hora de repasar! Tito eligió juegos que todavía cuestan un poquito. ¡Practicando salen cada vez mejor! ':'¡Hora de repasar! Tito eligió juegos que jugaste hace tiempo. '):'')+(nx===0?'Empezá por el primero.':'Tocá el número '+(nx+1)+'.'))},
  // Pista (círculo que parpadea): la siguiente estación o, si se ha terminado, la flecha verde.
  hint(){const nx=this.next();if(nx<0)return this.L.length?{x:1300,y:800,r:80}:null;const [x,y]=this.pos(nx);return{x,y,r:140}},
  // Al dejar el dedo encima de la estación "r:j": dice el nombre del juego y del tema.
  dwell(id){const j=+id.slice(2),e=this.L[j];if(!e)return;const [tid,g]=e.split('#'),t=TEMA[tid],gm=t.games[+g];say(V(gm.name||GNAME[gm.t]||t.n)+'. '+V(t.n)+'.')},
  // Dibuja el repaso: título, camino, estaciones con número, candado o check, y la flecha verde al final.
  draw(){sky('#EAF4FF','#FFF6E6');floor(760,'#E6DCC8');
    card(170,34,600,112,'#fff',6,56);pic('lupa',250,90,90);text('Repaso con Tito',490,112,52,K,{w:600});
    const pts=this.L.map((_id: string,j: number)=>this.pos(j)),nx=this.next();if(pts.length>1)drawRoad(pts,nx<0?pts.length-1:nx,150);
    this.L.forEach((id: string,j: number)=>{const [tid,g]=id.split('#'),t=TEMA[tid],[x,y]=pts[j],lk=!this.open(j),dn=!!S.rep!.done[id];
      drawStation(t,+g,x,y,{s:lk?1:hv('r:'+j,hC(x,y,130))});
      const nm=V(t.n);ctx.font=`600 28px ${DF}`;const fs=Math.min(28,28*230/Math.max(1,ctx.measureText(nm).width)),tw=Math.min(230,ctx.measureText(nm).width);
      card(x-tw/2-48,y+156,tw+96,58,'#fff',5,29);pic(t.icon,x-tw/2-14,y+185,42);text(nm,x+20,y+185+fs*.36,fs,K,{w:600});
      const un=this.unl&&this.unl.j===j&&unlockFx(x,y,124,this.unl.t);if(!un&&lk)lockOver(x,y,124);
      circ(x-96,y-96,30,lk?'#EADFCF':dn?'#7CC86E':'#5B8DEF',5);text(String(j+1),x-96,y-84,34,'#fff',{f:LF});
      if(dn){circ(x+96,y+96,30,'#7CC86E',5);ctx.beginPath();ctx.moveTo(x+82,y+96);ctx.lineTo(x+93,y+108);ctx.lineTo(x+111,y+84);ctx.lineWidth=7;ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.stroke()}
      if(j===nx&&!(this.unl&&this.unl.j===j&&T<this.unl.t+.4))arrowAt(x,y-170)});
    if(nx<0&&this.L.length){const p=(Math.sin(T*4)+1)/2,s=hv('rp:seguir',hC(1300,800,74));ctx.save();ctx.translate(1300,800);ctx.scale(s*(1+p*.05),s*(1+p*.05));ctx.globalAlpha=.35+.3*p;circ(0,0,84,null,10,'#FFC93C');ctx.globalAlpha=1;circ(0,0,72,'#7CC86E',7);ctx.beginPath();ctx.moveTo(-20,-32);ctx.lineTo(34,0);ctx.lineTo(-20,32);ctx.closePath();fillStroke('#fff',5);ctx.restore()}
    drawHome();drawCoinHUD();drawTito(TITO.x,TITO.y,TITO.w)},
  // Toques: casa (mapa), Tito (explica), monedas (tienda), flecha verde (seguir el camino)
  // o una estación (si está abierta lanza el juego con REP_ON=true).
  down(x,y){if(atHome(x,y)){SFX.tap();go('map');return}if(inTito(x,y)){this.prompt!(true);return}if(inCoinHUD(x,y)){SFX.pop();go('tienda');return}
    const nx=this.next();if(nx<0&&this.L.length&&dist(x,y,1300,800)<80){SFX.pop();goSeguir();return}
    for(let j=0;j<this.L.length;j++){const [gx,gy]=this.pos(j);if(dist(x,y,gx,gy)<140){
      if(!this.open(j)){SFX.boing();say('Este todavía está cerrado. Primero terminá el número '+((nx<0?j-1:nx)+1)+'.');return}
      const [tid,g]=this.L[j].split('#');SFX.pop();this.prevNx=nx;REP_ON=true;go('juego',{t:tid,g:+g});return}}
    SFX.tap();sparkles(x,y)}
};
// al volver de un juego del repaso (o al tocar la casita desde el juego) se vuelve al repaso
{const e0=SCENES.casita.enter;SCENES.casita.enter=function(this: Escena,o: Libre){if(REP_ON&&!o.fin){REP_ON=false;go('repaso',{back:1});return}REP_ON=false;return e0!.call(this,o)}}
// Si desde un juego del repaso se va a otro sitio que no sea la vuelta normal (un atajo de la zona de adultos al mapa,
// a una zona o a otro tema con hello), se olvida el repaso: si no, la siguiente casita que se abriera saltaría al repaso.
{const g0=go;ponGo(function(n,o={}){if(REP_ON&&(n!=='juego'&&n!=='casita'||o.hello))REP_ON=false;return g0(n,o)})}
// el botón verde pasa una vez por día por el repaso, si hay algo que cuesta
{const g0=goSeguir;ponGoSeguir(function(){if(asamHoy()&&repDue()&&!(S.rep&&S.rep.d===today()&&S.rep.seen)){go('repaso',{seguir:1});return}g0()})}
// botón del repaso en el mapa, arriba
const REPBTN={x:1215,y:66};
// Envuelve draw/down/dwell del mapa para dibujar el botón del repaso, abrirlo al tocarlo y decir su nombre.
{const M=SCENES.map,d0=M.draw,dn0=M.down,dw0=M.dwell;
  // Dibuja el mapa original y encima el botón de la lupa: "!" rojo si toca repasar, punto verde si ya se hizo hoy.
  M.draw=function(){d0.call(this);const s=hv('repaso',hC(REPBTN.x,REPBTN.y,50)),due=repDue();ctx.save();ctx.translate(REPBTN.x,REPBTN.y);ctx.scale(s,s);circ(0,0,46,'#fff',6);pic('lupa',0,0,64);
    if(due){const p=1+.12*Math.sin(T*5);circ(32,-32,16*p,'#FF6B5E',4);text('!',32,-22,22,'#fff',{f:LF})}else if(repAllDone()){circ(32,-32,16,'#7CC86E',4)}ctx.restore()};
  // Si se toca la lupa abre el repaso; si no, el comportamiento normal del mapa.
  M.down=function(this: Escena,x: number,y: number){if(dist(x,y,REPBTN.x,REPBTN.y)<52){SFX.pop();go('repaso',{hello:true});return}return dn0!.call(this,x,y)};
  // Dedo encima de la lupa: dice "El repaso con Tito."; si no, lo normal.
  M.dwell=function(id){if(id==='repaso'){say('El repaso con Tito.');return}return dw0&&dw0.call(this,id)}}
