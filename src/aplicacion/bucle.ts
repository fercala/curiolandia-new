/* ================= BUCLE DEL JUEGO Y ENTRADA ================= */
/*
 * aplicacion/bucle.ts: el bucle de cada cuadro y la entrada. Hasta la v0.2.50 estaba en aplicacion/adultos.ts (antes
 * adult.js), junto a la zona de adultos; se separó sin cambiar ni el código ni el orden de los pasos.
 *  1) La ENTRADA: eventos del dedo, el ratón y el teclado del lienzo #cv y del documento, que llaman a
 *     scene.down/move/up, el candado de adultos (VIVO.lockDown) y el aviso de girar el móvil. Se conectan al cargarse.
 *  2) El BUCLE: frame(now), que se ejecuta en cada cuadro (temporizadores, tiempo de juego, música, 3D, dibujo de la
 *     escena, ayudas, partículas...). Lo pone en marcha aplicacion/arranque.ts.
 * src/modulos.ts lo carga después de aplicacion/adultos.ts, y el puente deja frame en globalThis para las pruebas.
 * Define: portraitOk, panelAdultos, panelNombre, panelBorrar, toLogical, dlgOpen, upH, isPortrait, lastF y hoverTick.
 * Exporta: frame.
 * Importa: el núcleo, src/nucleo/ (S, VIVO, T, scene, go, save, el lienzo y su escala, el sonido, la ayuda, las
 * partículas, el candado...), ahora() de aplicacion/puertos.ts (la hora de S.ses), R3frame de mundo3d/mundo3d.ts (el
 * dibujo 3D de cada cuadro) y openAdult de aplicacion/adultos.ts (el candado abre la zona de adultos).
 */
import { AC, DPR, H, HOME, OX, OY, S, SC, SFX, T, VIVO, W, card, ctx, cv, dist, drawCoinFx, drawHelp, drawLock, drawParts, drawToast, go, initAudio, musicTick, ponT, save, scene, sceneName, sceneTok, text, today } from '../nucleo/indice.ts';
// ahora(): la fecha y la hora (puerto de aplicacion/puertos.ts, desde la fase 3g; antes new Date()).
import { ahora } from './puertos.ts';
// R3frame: el dibujo de cada cuadro de la capa 3D (null sin WebGL). Desde la fase 4p se importa: la capa 3D se carga
// antes que la aplicación (antes era al revés y R3frame se usaba como global tardía).
import { R3frame } from '../mundo3d/mundo3d.ts';
// openAdult: abre la zona de adultos cuando el candado lleva 3 s pulsado.
import { openAdult } from './adultos.ts';

// portraitOk: en un móvil en vertical se pide girarlo; con un toque se puede seguir igualmente (y ya no se vuelve a pedir).
let portraitOk=false;
// toLogical(evento): pasa la posición del dedo/ratón en la ventana a coordenadas lógicas de 1600x900 (quita márgenes y escala).
function toLogical(e: MouseEvent){return[(e.clientX-OX)/SC,(e.clientY-OY)/SC]}
// Los tres paneles HTML (adultos, nombre y empezar de nuevo) están fijos en src/head.html, antes del <script>, y nunca se
// quitan ni se cambian por otros: se buscan una sola vez al cargar (desde la v0.2.52; antes, con getElementById en cada
// cuadro y en cada tecla). Solo se lee su .hidden, que sigue al día porque es el mismo elemento.
const panelAdultos=document.getElementById('adult')!,panelNombre=document.getElementById('nameDlg')!,panelBorrar=document.getElementById('resetDlg')!;
// dlgOpen(): ¿hay abierto algún panel HTML (adultos, nombre o borrar)? Entonces el teclado y el "pasar por encima" no actúan.
const dlgOpen=()=>!panelAdultos.hidden||!panelNombre.hidden||!panelBorrar.hidden;
// Tocar (dedo o ratón): activa el audio, reinicia el contador de inactividad y, por orden: aviso de móvil en vertical,
// candado de adultos (esquina de abajo a la derecha, empieza a contar), y si no hay transición, scene.down(x,y).
cv.addEventListener('pointerdown',e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}initAudio();VIVO.idle=0;VIVO.hintSaid=false;
  const [x,y]=toLogical(e);VIVO.MX=x;VIVO.MY=y;VIVO.mouseOn=e.pointerType==='mouse';
  if(isPortrait()&&!portraitOk){portraitOk=true;return}
  if(dist(x,y,1546,852)<50&&sceneName!=='title'){VIVO.lockDown=true;VIVO.lockHold=0;return}// solo el candado dibujado (drawLock): antes, un rectángulo más grande tapaba el centro del botón de saltar el cuento
  if(VIVO.fade>.6||!scene)return;
  try{scene.down&&scene.down(x,y)}catch(err){console.error(err)}});
// Mover: actualiza MX/MY y llama a scene.move(x,y) (arrastrar). Con ratón, moverse cuenta como "algo de actividad".
cv.addEventListener('pointermove',e=>{const [x,y]=toLogical(e);VIVO.MX=x;VIVO.MY=y;VIVO.mouseOn=e.pointerType==='mouse';if(e.pointerType==='mouse')VIVO.idle=Math.min(VIVO.idle,4);if(scene&&scene.move)try{scene.move(x,y)}catch(err){console.error(err)}});
// El ratón sale del lienzo: ya no hay nada "debajo".
cv.addEventListener('pointerleave',()=>{VIVO.mouseOn=false});
// upH(evento): soltar (o cancelar): suelta el candado y llama a scene.up(x,y).
const upH=(e: PointerEvent)=>{VIVO.lockDown=false;if(!scene)return;const [x,y]=toLogical(e);if(e.pointerType!=='mouse')VIVO.mouseOn=false;try{scene.up&&scene.up(x,y)}catch(err){console.error(err)}};
cv.addEventListener('pointerup',upH);cv.addEventListener('pointercancel',upH);
// Sin menú contextual (pulsación larga o clic derecho).
cv.addEventListener('contextmenu',e=>e.preventDefault());
// Tecla Escape = tocar el botón de volver (casita) de la escena.
addEventListener('keydown',e=>{if(dlgOpen())return;if(e.key==='Escape'&&sceneName!=='title'){const d=scene!.down;if(d)try{d.call(scene!,HOME.x,HOME.y)}catch(err){}}});
// Si la pestaña se oculta, se calla la voz y se suspende el audio; al volver, se reanuda.
document.addEventListener('visibilitychange',()=>{if(document.hidden){try{speechSynthesis.cancel()}catch(e){}if(AC)AC.suspend().catch(()=>{})}else if(AC)AC.resume().catch(()=>{})});
// isPortrait(): ¿pantalla táctil en vertical (más alta que ancha)?
const isPortrait=()=>innerHeight>innerWidth*1.15&&matchMedia('(pointer:coarse)').matches;
// lastF: momento del cuadro anterior (para calcular dt).
let lastF=performance.now();
// hoverTick(dt): gestiona el "pasar por encima" con ratón: suena SFX.hov al entrar en un elemento nuevo (hovNow) y, si el
// ratón se queda 1,1 s quieto encima y Tito no habla, llama a scene.dwell(id) una vez (suele decir el nombre).
function hoverTick(dt: number){
  if(!VIVO.mouseOn||VIVO.drag||dlgOpen()){VIVO.hovPrev=null;VIVO.hovT=0;return}
  if(VIVO.hovNow!==VIVO.hovPrev){if(VIVO.hovNow!=null&&VIVO.fade<.3)try{SFX.hov()}catch(e){}VIVO.hovPrev=VIVO.hovNow;VIVO.hovT=0;VIVO.dwellDone=false;return}
  if(VIVO.hovNow!=null){VIVO.hovT+=dt;if(VIVO.hovT>1.1&&!VIVO.dwellDone&&!VIVO.talking&&scene!.dwell&&typeof VIVO.hovNow==='string'){VIVO.dwellDone=true;try{scene!.dwell(VIVO.hovNow)}catch(e){console.error(e)}}}
}
/* frame(now): EL BUCLE DEL JUEGO. Se ejecuta en cada cuadro de pantalla (requestAnimationFrame; lo arranca aplicacion/arranque.ts).
   Pasos: 1) calcula rdt (tiempo real, máx. 1 s) y dt (máx. 0,05 s para que una pausa no dé un salto) y avanza T, idle (solo mientras Tito calla) y el velo fade;
   2) ejecuta los temporizadores de later() que vencen (solo si siguen en su escena); 3) candado: 3 s reales pulsado abre la
   zona de adultos; 4) cuenta el tiempo jugado (S.days cada 15 s, límite S.limit -> escena 'dormir');
   5) música y scene.update(dt); 6) fondo: si la escena es 3D (scene.three), mundo3d/mundo3d.ts la pinta con R3frame(dt);
   7) dibuja la escena 2D encima, ayudas, partículas, aviso de pegatina y monedas, y el candado, recortado a 1600x900;
   8) velo de transición; 9) rellena las bandas laterales en pantallas alargadas; 10) aviso de girar el móvil.
   Cada paso va en try/catch: un fallo de una escena se ve en la consola pero no para el juego. */
export function frame(now: number){
  const rdt=Math.min(1,Math.max(0,(now-lastF)/1000)),dt=Math.min(.05,rdt);lastF=now;ponT(T+dt);if(!VIVO.talking)VIVO.idle+=dt;VIVO.fade=Math.max(0,VIVO.fade-dt*3);
// Temporizadores de later(): solo se ejecutan si siguen en la escena en la que se crearon (t.tok===sceneTok).
  for(const t of VIVO.timers){t.t-=dt;if(t.t<=0&&!t.done){t.done=1;if(t.tok===sceneTok)try{t.fn()}catch(e){console.error(e)}}}VIVO.timers=VIVO.timers.filter(t=>!t.done);
  if(VIVO.lockDown){VIVO.lockHold+=Math.min(.25,(now-VIVO.lockPrev)/1000);if(VIVO.lockHold>=3)openAdult()}VIVO.lockPrev=now;// en tiempo real, no de juego (dt tiene tope)
// Tiempo de juego (no cuenta con el panel abierto, en la portada ni durmiendo). Cada 15 s se apunta en S.days (en
// minutos) y se guardan solo los últimos 30 días. Cuenta con rdt, el tiempo real (tope 1 s, para que volver de otra app
// no sume la pausa), no con dt: en un móvil lento (10 cuadros por segundo) dt con tope contaba la mitad del tiempo.
  if(panelAdultos.hidden&&sceneName!=='title'&&sceneName!=='dormir'){VIVO.sessionT+=rdt;VIVO.minuteAcc+=rdt;
    if(VIVO.minuteAcc>=15){const d=today();S.days[d]=(S.days[d]||0)+VIVO.minuteAcc/60;VIVO.minuteAcc=0;
      const ks=Object.keys(S.days).sort();while(ks.length>30)delete S.days[ks.shift()!];S.ses={t:Math.round(VIVO.sessionT),at:ahora().getTime()};save()}
    if(S.limit&&VIVO.sessionT>=S.limit*60)go('dormir')}
  try{musicTick();scene!.update&&scene!.update(dt)}catch(e){console.error(e)}
// Fondo: en las escenas 3D, el lienzo 2D se deja transparente y R3frame dibuja el mundo en el lienzo #gl de debajo.
  ctx.setTransform(DPR,0,0,DPR,0,0);if(scene&&scene.three&&typeof R3frame==='function'){ctx.clearRect(0,0,cv.width,cv.height);try{R3frame(dt)}catch(e){console.error(e)}}else{ctx.fillStyle='#2E2420';ctx.fillRect(0,0,cv.width,cv.height)}
// A partir de aquí se dibuja en coordenadas lógicas (1600x900), escaladas y centradas, y recortadas a ese rectángulo.
  ctx.setTransform(DPR*SC,0,0,DPR*SC,DPR*OX,DPR*OY);ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
// hovNow se vacía y lo vuelven a rellenar las llamadas a hv() mientras se dibuja la escena.
  VIVO.hovNow=null;
  try{scene!.draw();drawHelp();drawParts(dt);drawToast();drawCoinFx()}catch(e){console.error(e)}if(sceneName!=='title')drawLock();
  hoverTick(dt);
// Velo de transición entre escenas (de color papel, se desvanece en un tercio de segundo).
  if(VIVO.fade>0){ctx.fillStyle=`rgba(255,246,230,${VIVO.fade})`;ctx.fillRect(0,0,W,H)}
  ctx.restore();
  // pantallas 2D en móviles alargados: las bandas de los lados (antes marrón oscuro) continúan el borde de la escena, como si siguiera
  if(!(scene&&scene.three)&&(OX>2||OY>2)){try{ctx.save();ctx.setTransform(1,0,0,1,0,0);const x0=Math.round(OX*DPR),y0=Math.round(OY*DPR),gw=Math.round(W*SC*DPR),gh=Math.round(H*SC*DPR),rw=cv.width-x0-gw,rh=cv.height-y0-gh;
    if(x0>0){ctx.drawImage(cv,x0+2,y0,1,gh,0,y0,x0,gh);if(rw>0)ctx.drawImage(cv,x0+gw-3,y0,1,gh,x0+gw,y0,rw,gh)}
    if(y0>0){ctx.drawImage(cv,0,y0+2,cv.width,1,0,0,cv.width,y0);if(rh>0)ctx.drawImage(cv,0,y0+gh-3,cv.width,1,0,y0+gh,cv.width,rh)}
    ctx.fillStyle='rgba(46,36,32,.08)';if(x0>0){ctx.fillRect(0,0,x0,cv.height);ctx.fillRect(x0+gw,0,rw,cv.height)}if(y0>0){ctx.fillRect(0,0,cv.width,y0);ctx.fillRect(0,y0+gh,cv.width,rh)}
    ctx.restore()}catch(e){}}
  // fuera del recorte de la franja del juego: el velo oscuro tapa toda la pantalla (antes solo la franja del juego y en vertical se veía el 3D arriba y abajo)
  if(isPortrait()&&!portraitOk){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='rgba(46,36,32,.88)';ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();ctx.save();ctx.translate(800,400);ctx.rotate(Math.sin(T*2)*.8-.8);card(-90,-160,180,320,'#fff',10,30);ctx.restore();text('Gira el móvil',800,700,90,'#fff');text('(toca para seguir igual)',800,790,44,'#FCEBD0')}
  requestAnimationFrame(frame);
}