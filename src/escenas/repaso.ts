// ARCHIVO: escenas/repaso.ts (antes repaso.js) — el repaso diario con Tito (botón de la lupa en el mapa).
// Para qué sirve: apunta qué habilidades practica cada juego y cómo le va al niño en cada juego,
// y con eso prepara cada día una lista de 3 juegos para repasar (escena SCENES.repaso).
// Desde la fase 2m es un módulo: escenas/indice.ts lo carga el último, después de tienda.ts.
// Define: repToday y la escena SCENES.repaso. Añade a S los campos kg, gs y rep (valores por defecto).
// Exporta: nada. Desde la fase 4c no envuelve nada: lo que se apunta de cada acierto o fallo lo hace rec
//   (nucleo/interfaz.ts), la lupa del mapa, el paso por el repaso del botón verde (goSeguir) y la vuelta al repaso
//   desde la casita están en escenas/zonas.ts (repDue, repAllDone), y go (nucleo/escenas.ts) olvida el repaso al salir
//   de él; todo con el caso de uso aplicacion/repasoDelDia.ts, que usa las reglas de dominio/repaso.ts. REP_ON (true
//   mientras se juega un juego del repaso; lo leen las pruebas) está desde la fase 4b en el núcleo (nucleo/escenas.ts):
//   aquí se pone con ponRepOn. La fecha del juego y el repaso hecho los apunta, al terminar, el caso de uso
//   aplicacion/terminarJuego.ts.
// Importa: el núcleo, src/nucleo/ (S, DEF, save, say, today, later, SFX, dibujo, ponRepOn y las monedas: giveCoins,
//   creditCoins, drawCoinHUD, inCoinHUD), escenas/escenas2d.ts (TEMA, CATALOGO, drawStation, GNAME), escenas/zonas.ts
//   (goSeguir, repAllDone, drawRoad, lockOver, unlockFx, arrowAt), temas/ (floor), MONEDAS de dominio/monedas.ts y
//   repasoCaducado y nuevoRepaso de aplicacion/repasoDelDia.ts.
// Formato del estado guardado:
//   S.kg = { habilidad: ['temaId#juego', ...] }  últimos 6 juegos (el más reciente primero) donde salió esa habilidad.
//   S.gs = { 'temaId#juego': {ok, err, d} }      aciertos, fallos y último día jugado ('AAAA-MM-DD' de today()).
//   S.rep = {d, list, done, weak, paid, seen}    el repaso del día d: list = 3 ids 'temaId#juego',
//           done = {id:1} los ya hechos, weak = cuántos salieron por "cuesta", paid = premio ya dado,
//           seen = el botón verde ya pasó hoy por el repaso.
import type { Libre, Repaso } from '../nucleo/tipos.ts';
import { K } from '../dibujos/todos.ts';
import { DEF, DF, LF, S, SCENES, SFX, T, TITO, V, atHome, burst, card, circ, creditCoins, ctx, dist, drawCoinHUD, drawHome, drawTito, fillStroke, giveCoins, giveSticker, go, hC, hv, inCoinHUD, inTito, kid, later, pic, ponRepOn, save, say, sayQ, sky, sparkles, text, today } from '../nucleo/indice.ts';
import { floor } from '../temas/indice.ts';
import { CATALOGO, GNAME, TEMA, drawStation } from './escenas2d.ts';
import { arrowAt, drawRoad, goSeguir, lockOver, repAllDone, unlockFx } from './zonas.ts';
import { MONEDAS } from '../dominio/monedas.ts';
import { nuevoRepaso, repasoCaducado } from '../aplicacion/repasoDelDia.ts';

/* ================= REPASO INTELIGENTE ================= */
// Cada habilidad recuerda en qué juegos aparece (S.kg) y cada juego cómo le fue (S.gs).
// Todos los días Tito arma un repaso de 3 juegos: primero lo que cuesta, después lo que hace más tiempo que no se juega.
// Valores por defecto de los campos nuevos y arreglo de partidas antiguas que no los tienen.
Object.assign(DEF,{kg:{},gs:{},rep:null});
{const s: Libre=S;for(const k of['kg','gs'])if(!s[k]||typeof s[k]!=='object')s[k]={}}
// Lo que se apunta de cada acierto o fallo (S.stats, S.kg, S.gs) lo hace rec (nucleo/interfaz.ts) con el caso de uso
// aplicacion/repasoDelDia.ts (apuntarResultado), y lo de terminar un juego (la fecha en S.gs y el juego del repaso
// hecho), finishGame con el caso de uso aplicacion/terminarJuego.ts. REP_ON (true mientras se juega un juego lanzado
// desde el repaso) está en el núcleo (nucleo/escenas.ts): aquí se pone con ponRepOn. La lupa del mapa, goSeguir y la
// vuelta al repaso desde la casita están en escenas/zonas.ts (repDue, repAllDone). Desde la fase 4c este archivo ya no
// envuelve nada.
// repToday(): el repaso de hoy (S.rep). Si hay que prepararlo otra vez (es de otro día, no tenía juegos «que cuestan»
// pero ahora los hay y aún no se ha hecho ninguno, o estaba vacío y ya hay juegos: repasoCaducado), lo prepara
// (nuevoRepaso: hasta 3 que cuestan; si faltan, los más antiguos de temas distintos; si aún faltan, cualquier antiguo),
// lo pone en S.rep y guarda.
function repToday(): Repaso{if(repasoCaducado(S,CATALOGO,today())){S.rep=nuevoRepaso(S,CATALOGO,today());save()}return S.rep!}

// Escena del repaso: hasta 3 estaciones numeradas en un caminito; se abren en orden.
// Al terminar todas, premio (pegatina de la lupa y 5 monedas) y flecha verde para seguir el camino.
SCENES.repaso={music:'casita',
  // Al entrar. o.seguir: viene del botón verde (se apunta seen); o.back: vuelve de un juego del repaso
  // (anima la apertura del siguiente). Si está todo hecho y sin cobrar, da el premio.
  enter(o){const R=repToday();this.L=R.list;this.unl=null;ponRepOn(false);if(o.seguir){R.seen=1;save()}
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
  // o una estación (si está abierta lanza el juego con ponRepOn(true)).
  down(x,y){if(atHome(x,y)){SFX.tap();go('map');return}if(inTito(x,y)){this.prompt!(true);return}if(inCoinHUD(x,y)){SFX.pop();go('tienda');return}
    const nx=this.next();if(nx<0&&this.L.length&&dist(x,y,1300,800)<80){SFX.pop();goSeguir();return}
    for(let j=0;j<this.L.length;j++){const [gx,gy]=this.pos(j);if(dist(x,y,gx,gy)<140){
      if(!this.open(j)){SFX.boing();say('Este todavía está cerrado. Primero terminá el número '+((nx<0?j-1:nx)+1)+'.');return}
      const [tid,g]=this.L[j].split('#');SFX.pop();this.prevNx=nx;ponRepOn(true);go('juego',{t:tid,g:+g});return}}
    SFX.tap();sparkles(x,y)}
};
