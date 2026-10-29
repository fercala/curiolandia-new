/* ================= ZONA DE ADULTOS ================= */
/*
 * aplicacion/adultos.ts (antes adult.js): tres cosas distintas en un mismo archivo.
 *  1) La ZONA DE ADULTOS: un panel HTML (#adult, definido en head.html) que se abre manteniendo pulsado 3 s el candado
 *     de abajo a la derecha. Tiene ajustes (modo de juego, perfil, personaje de Tito, idioma y voz, volúmenes, límite de
 *     tiempo, vales), el progreso (temas, habilidades, asambleas, minutos por día), copia de seguridad, instalación y atajos.
 *     Funciones: openAdult(), closeAdult(), installHTML(), vozGuiaHTML() (cómo instalar voces mejores). Los diálogos del nombre
 *     (openNameDlg) y de borrar (openResetDlg, doReset) están desde la fase 4p en aplicacion/dialogos.ts.
 *  2) El BUCLE DEL JUEGO y la ENTRADA: eventos del dedo/ratón/teclado que llaman a scene.down/move/up, y frame(), que se
 *     ejecuta en cada cuadro (temporizadores, tiempo de juego, música, 3D, dibujo de la escena, ayudas, partículas...).
 *  3) La COPIA DE SEGURIDAD: bkEncode/bkDecode/bkWire convierten S en un código de texto o un archivo JSON y al revés.
 * Desde la fase 2n es un módulo: src/modulos.ts lo carga el último, después de las escenas y (desde la fase 4p) de la capa 3D, y el puente deja lo que
 * exporta en globalThis para las pruebas. aplicacion/arranque.ts importa frame.
 * Define: SKILL, esc, toLogical, dlgOpen, isPortrait, hoverTick, window.__cl (para pruebas automáticas) y bkWire.
 * Exporta: openAdult, closeAdult, frame, bkEncode y bkDecode, y vuelve a exportar openNameDlg, openResetDlg y doReset
 * (de aplicacion/dialogos.ts) para el puente.
 * Importa: el núcleo, src/nucleo/ (S, save, go, say, tx, V, SCENES, T, timers, parts, MX/MY, lockDown...), escenas/escenas2d.ts (tst, gDone,
 * TEMAS, TEMA, suggestTema, dayIdx, standalone, VIVO.deferredInstall), temas/ (también extras.ts e ingles.ts) (T3, C3, T4, C4, T5, C5,
 * CAN, RUT, TRZ, FIESTAS, ING), drawCoinFx (nucleo/monedas.ts), escenas/zonas.ts (zoneOpen) y esPartida de
 * dominio/partida.ts (la copia de seguridad), R3frame de mundo3d/mundo3d.ts (desde la fase 4p; la capa 3D se carga
 * antes) y doReset de aplicacion/dialogos.ts. Usa window.__w3 (tipos en nucleo/tipos.ts).
 * frame() la pone en marcha aplicacion/arranque.ts.
 */
import type { Tema } from '../juegos/tipos.ts';
import type { Estado, Libre, Tito, Vale, Volumenes } from '../nucleo/tipos.ts';
import { AC, DIASL, DPR, H, HOME, KEY, MESES, OX, OY, S, SC, SCENES, SFX, STARS, T, V, VIVO, VOICE, W, card, ctx, cv, dist, drawCoinFx, drawHelp, drawLock, drawParts, drawToast, go, initAudio, musicTick, pickVoice, ponT, save, say, scene, sceneArg, sceneName, sceneTok, setVol, text, today, tx, vocesES, vozCalidad, vozProbar } from '../nucleo/indice.ts';
import { C3, C4, C5, CAN, FIESTAS, ING, RUT, T3, T4, T5, TRZ } from '../temas/indice.ts';
import { TEMA, TEMAS, dayIdx, gDone, standalone, tst } from '../escenas/escenas2d.ts';
import { suggestTema, zoneOpen } from '../escenas/zonas.ts';
import { esPartida } from '../dominio/partida.ts';
// ahora() y escribirGuardado(): la fecha y la hora y el guardado (puertos de aplicacion/puertos.ts, desde las fases 3g
// y 3h; antes new Date() y localStorage).
import { ahora, escribirGuardado } from './puertos.ts';
import { doReset } from './dialogos.ts';
// R3frame: el dibujo de cada cuadro de la capa 3D (null sin WebGL). Desde la fase 4p se importa: la capa 3D se carga
// antes que este archivo (antes era al revés y R3frame se usaba como global tardía).
import { R3frame } from '../mundo3d/mundo3d.ts';
// Los diálogos del nombre y de empezar de nuevo están desde la fase 4p en aplicacion/dialogos.ts; se exportan también
// desde aquí para que el puente los siga dejando en globalThis (las pruebas llaman a doReset, openNameDlg...).
export { doReset, openNameDlg, openResetDlg } from './dialogos.ts';

// SKILL: nombre legible de cada habilidad de S.stats para la tabla "Cómo le va" ({clave: 'texto'}). Si una clave
// no está, se muestra la clave con espacios. Al crear un juego con una habilidad nueva, añade aquí su nombre.
const SKILL: Record<string,string>={'ingles-hello':'Inglés: saludos','ingles-colors':'Inglés: colores','ingles-numbers':'Inglés: números','ingles-numeros':'Inglés: contar','ingles-animals':'Inglés: animales',busca:'Reconocer palabras (¿Dónde está?)',sonidos:'Sonidos de animales y transportes',memoria:'Memoria',cuerpo:'Partes del cuerpo',contar:'Contar',colores:'Colores',puzzle:'Rompecabezas',excava:'Cavar en la arena',riega:'Regar',
  'dentro-fuera':'Dentro / fuera',vestir:'Ropa según el tiempo',transportes:'Transportes por tierra, aire y agua',tamanos:'Grande / mediano / pequeño',otono:'Otoño',frutas:'Seguir un pedido (frutas)','frio-calor':'Frío / calor',
  formas:'Formas',familia:'Familia',casa:'Las partes de la casa',armar:'Armar por partes','arriba-abajo':'Arriba / abajo',arrastra:'Clasificar arrastrando',atrapa:'Atrapar lo que se pide',
  'dia-hoy':'Asamblea: qué día es hoy','dia-manana':'Asamblea: qué día es mañana',calendario:'Asamblea: el número del día','asamblea-dianoche':'Asamblea: día o noche','asamblea-ropa':'Asamblea: ropa según el tiempo','asamblea-estacion':'Asamblea: estación del año','asamblea-siguiente':'Asamblea: qué estación viene',
  ahorro:'Ahorrar agua y luz',apaga:'Apagar lo que no se usa',arcoiris:'Colores del arcoíris',cancion:'Canciones',ciclos:'Ciclos de vida',ciudad:'La calle y la ciudad','comer-sano':'Comer sano',comidas:'Comidas','cuerpo-dentro':'El cuerpo por dentro','derecha-izquierda':'Derecha / izquierda','dia-noche':'Día / noche','dias-finde':'Días de cole y fin de semana','dias-orden':'Ordenar los días de la semana',dinos:'Dinosaurios','domestico-salvaje':'Animales domésticos y salvajes',emociones:'Emociones',estaciones:'Estaciones del año',fiesta:'Días especiales','fiestas-orden':'Fiestas del año',frota:'Frotar y limpiar','fruta-verdura':'Frutas y verduras',habitats:'Dónde vive cada animal',lupa:'Buscar con la lupa',maleta:'Preparar la maleta','meses-orden':'Los meses del año',nacimiento:'Huevo o panza',oficios:'Oficios','origen-alimentos':'De dónde vienen los alimentos',partes:'Tocar las partes','partes-planta':'Partes de la planta',pedidos:'Seguir pedidos',reciclar:'Reciclar',rutinas:'Rutinas y hábitos',secuencia:'Ordenar lo que pasa primero y después',semaforo:'El semáforo','seres-vivos':'Seres vivos y cosas',trazos:'Trazos (antes de escribir)',une:'Unir parejas',cuentos:'Entender cuentos'};
// WX_E y EMO_E: emoji del tiempo y de la emoción que se eligieron en cada asamblea (calendario de asambleas).
const WX_E: Record<string,string>={sol:'☀️',nublado:'☁️',lluvia:'🌧️',viento:'💨',nieve:'❄️',tormenta:'⛈️',niebla:'🌫️'},EMO_E: Record<string,string>={alegria:'😀',tristeza:'😢',enojo:'😠',miedo:'😨',sorpresa:'😮',calma:'😌',verguenza:'😳'};
// esc(texto): escapa &, <, > y comillas para meter texto sin peligro dentro del HTML del panel.
const esc=(s: unknown)=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as Record<string,string>)[c]);
// installHTML(): HTML de la sección "Instalar": si ya está instalado, lo dice; si el navegador ofreció instalar
// (deferredInstall, de escenas/escenas2d.ts), un botón; y siempre las instrucciones para iPhone, Android y ordenador.
function installHTML(){
  if(standalone())return '<p class="note">El juego ya está instalado en este dispositivo.</p>';
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  return (VIVO.deferredInstall?'<p><button id="a-install" style="background:#FFE08A">Instalar Curiolandia</button></p>':'')+
   `<ul><li><b>iPhone o iPad (Safari):</b> tocá el botón Compartir (el cuadrado con la flecha) y elegí «Agregar a inicio».</li>
   <li><b>Android (Chrome):</b> menú ⋮ → «Instalar aplicación» o «Agregar a la pantalla principal».</li>
   <li><b>Computadora (Chrome o Edge):</b> el ícono de instalar en la barra de direcciones.</li></ul>
   <p class="note">Una vez instalado, se abre a pantalla completa y funciona sin internet. ${ios?'En iPhone la voz depende de las voces en español instaladas en Ajustes → Accesibilidad → Contenido leído.':''}</p>`}
// vozGuiaHTML(): HTML de «Cómo conseguir voces más naturales»: los pasos para instalar o usar voces mejores en iPhone/iPad,
// Mac, Android y Windows. El aparato en el que se está jugando va primero y marcado. Una web no puede instalar voces:
// son las del sistema, así que solo se explica dónde se descargan y, después, se eligen en la lista de arriba.
function vozGuiaHTML(){
  const ua=navigator.userAgent,ios=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),
    yo=ios?'ios':/android/i.test(ua)?'and':/mac/i.test(ua)?'mac':/windows/i.test(ua)?'win':'';
  const P=[['ios','iPhone o iPad','Ajustes → Accesibilidad → Contenido leído → Voces → Español → España. Descarga una voz «mejorada» o «prémium» (por ejemplo Mónica o Jorge).'],
    ['mac','Mac','Ajustes del Sistema → Accesibilidad → Contenido leído → Voz del sistema → Gestionar voces → Español. Marca una voz mejorada o prémium y espera a que se descargue.'],
    ['and','Android','Ajustes → Sistema → Idiomas → Salida de texto a voz. Elige el motor de Google, toca su rueda ⚙ → Instalar datos de voz → Español (España) y elige la voz que más te guste. Si no aparece, instala «Servicios de voz de Google» desde Google Play.'],
    ['win','Windows','Lo más fácil es abrir el juego en Microsoft Edge: trae voces naturales sin instalar nada (por ejemplo «Elvira» o «Álvaro», de España), aunque necesitan internet. En Chrome aparece «Google español». Para más voces de Windows: Configuración → Hora e idioma → Voz → Agregar voces → Español (España).']];
  P.sort((a,b)=>(+(b[0]===yo))-(+(a[0]===yo)));
  return `<ul>${P.map(([k,n,t])=>`<li><b>${n}${k===yo?' (este aparato)':''}:</b> ${t}</li>`).join('')}</ul>
   <p class="note">Después de instalar una voz, cierra el navegador y vuelve a abrir el juego: la voz nueva aparece en la lista «Voz del navegador». Las marcadas con ★ son las más naturales.</p>`}
/* openAdult(): abre la zona de adultos. Para la voz, construye TODO el HTML del panel a partir de S (cada vez que se abre,
   así siempre está al día) y luego conecta cada control a S con onchange/oninput (cada cambio guarda al momento con save()).
   CÓMO AÑADIR UNA OPCIÓN NUEVA (por ejemplo, un ajuste de sí/no):
     1. Elige un campo nuevo de S (p. ej. S.miAjuste) y recuerda que en las partidas viejas no existe: léelo con un valor por
        defecto ((S.miAjuste||0)) o añádelo a DEF2 en escenas/tienda.ts. No cambies campos existentes.
     2. En el HTML de abajo, dentro de la <section> que toque, añade una fila igual que la de "Paisaje":
        <div class="row"><span>Título</span> + radios con name="a-mi" y checked según S.miAjuste.
     3. Después de "const q=...", conecta el control:
        el.querySelectorAll<HTMLInputElement>('[name=a-mi]').forEach(r=>r.onchange=()=>{S.miAjuste=...;save()});
     4. Usa S.miAjuste donde haga falta en el juego. Si debe sobrevivir a "Borrar todo el progreso", añádelo a keep en doReset().
     5. Los estilos (.row, .opt, .note...) están en head.html. Los textos del panel no se dicen con say(), se pueden cambiar. */
export function openAdult(){
  adultWas=S.age+'|'+!!S.unlockAll;// para saber al cerrar si cambiaron la edad o el modo libre (closeAdult)
  VIVO.lockDown=false;VIVO.lockHold=0;try{speechSynthesis.cancel()}catch(e){}
  const el=document.getElementById('adult')!;el.hidden=false;
// tmOf(listaDeTemas): HTML con una tarjeta por tema: nombre, juegos hechos/total, barra de progreso y si está completo.
  const tmOf=(L: Tema[])=>L.map(t=>{const n=gDone(t),N=t.games.length;return `<div class="tm ${tst(t.id).done?'done':''}"><b>${esc(V(t.n))}</b>${n}/${N} juegos${tst(t.id).done?' · completo 🌼':''}<div class="bar"><i style="width:${Math.round(n/N*100)}%"></i></div></div>`}).join('');
// tm: secciones de progreso por zona (cada una con sus temas).
  const tm=([['Jardín de 3 años',[...T3,C3]],['Bosque de 4 años',[...T4,C4]],['Montaña de 5 años',[...T5,C5]],['Canciones, rutinas y trazos',[CAN,RUT,TRZ]],['Días especiales',FIESTAS],['Rincón del inglés',ING]] as [string,Tema[]][]).map(([h,L])=>`<section><h3>${h}</h3><div class="temas">${tmOf(L)}</div></section>`).join('');
// vales: una fila por vale (casilla de activo, texto y precio en monedas) para editarlos.
  const vales=S.vales!.map((v,i)=>`<div class="row vale"><label class="opt"><input type="checkbox" data-von="${i}" ${v.on?'checked':''}></label><input data-vtxt="${i}" maxlength="60" value="${esc(v.txt)}" style="flex:1;min-width:180px"><label>🪙 <input type="number" data-vp="${i}" min="5" max="500" value="${v.p}" style="width:70px"></label></div>`).join('');
// pend: vales que el niño compró en la tienda y aún no se le dieron (con botón "Entregado").
  const pend=S.valesLog!.map((v,i)=>[v,i] as [Vale,number]).filter(([v])=>!v.given).map(([v,i])=>`<div class="row"><span>🎟️ ${esc(v.txt)} <small>(${v.d!.slice(5).split('-').reverse().join('/')})</small></span><button data-vgive="${i}">Entregado ✔</button></div>`).join('');
// sk: filas de la tabla de habilidades, de más a menos practicada, con su porcentaje de aciertos y una etiqueta.
  const sk=Object.keys(S.stats).filter(k=>S.stats[k].ok+S.stats[k].err>0).sort((a,b)=>(S.stats[b].ok+S.stats[b].err)-(S.stats[a].ok+S.stats[a].err)).map(k=>{const s=S.stats[k],n=s.ok+s.err,r=Math.round(s.ok/n*100);
    const lbl=n<5?'Recién empieza':r>=80?'Lo sabe':r>=60?'En camino':'Le cuesta',cls=lbl==='Lo sabe'?'pAprendida':lbl==='Le cuesta'?'pLecuesta':lbl==='En camino'?'pEncamino':'';
    return `<tr><td>${esc(SKILL[k]||k.replace(/-/g,' '))}</td><td>${r}%</td><td>${n}</td><td><span class="pill ${cls}">${lbl}</span></td></tr>`}).join('');
// cal: las últimas 14 asambleas (tiempo y emoción elegidos).
  const cal=Object.keys(S.asam).sort().slice(-14).map(d=>{const a=S.asam[d],dt=new Date(d+'T12:00');return `<span><small>${DIASL[dayIdx(dt)].slice(0,3)} ${dt.getDate()}/${dt.getMonth()+1}</small><b>${a.tiempo?WX_E[a.tiempo]:'·'} ${a.emo?EMO_E[a.emo]:''}</b></span>`}).join('')||'<span>Todavía no hay asambleas.</span>';
// days: minutos jugados en los últimos 7 días con datos.
  const days=Object.keys(S.days).sort().slice(-7).map(d=>`<span class="day"><b>${Math.round(S.days[d])}</b> min<br><small>${d.slice(5).split('-').reverse().join('/')}</small></span>`).join('')||'<span>Todavía no hay datos.</span>';
// vname: voz del navegador que se está usando (para el texto informativo).
  const vname=VOICE?`${VOICE.name} (${VOICE.lang})`:'no se encontró una voz en español en este dispositivo';
// vopts: la lista de voces en español de este aparato para elegir (la primera opción, «Automática», deja que elija pickVoice).
  const vopts='<option value="">Automática (la mejor que haya)</option>'+vocesES().map(v=>{const id=v.voiceURI||v.name;return `<option value="${esc(id)}" ${S.vozNav===id?'selected':''}>${esc(v.name)} (${esc(v.lang)})${vozCalidad(v)>=3?' ★':''}</option>`}).join('');
// sug: el próximo tema del camino (para la sección "Lo que sigue").
  const sug=suggestTema();
// El HTML del panel, sección a sección: Modo de juego, Perfil, Personaje de Tito, Idioma y voz, Tiempo de juego,
// progreso por zonas (tm), Monedas y premios, Lo que sigue, Asambleas, Cómo le va, Copia de seguridad, Instalar,
// Ir a (atajos) y Empezar de cero. Es una plantilla de texto: no se pueden poner comentarios dentro.
  el.querySelector('.body')!.innerHTML=`
  <section><h3>Modo de juego</h3>
   <div class="row">${[['camino','<b>Camino</b> (recomendado): todo se abre de a uno'],['libre','<b>Libre</b> (todo abierto)']].map(([k,l])=>`<label class="opt"><input type="radio" name="a-mode" value="${k}" ${(k==='libre')===!!S.unlockAll?'checked':''}> ${l}</label>`).join('')}</div>
   <p class="note"><b>Camino:</b> los temas son un camino y se abren de a uno; dentro de cada tema, los juegos también se abren en orden. El botón verde del mapa lleva siempre al que sigue y lo ya jugado se puede repetir. El Bosque de 4 años y la Montaña de 5 años se abren con la edad elegida o al juntar 6 flores en la zona anterior. Las canciones se abren al terminar 1 tema del camino; las rutinas y el Rincón del inglés, al terminar 2; los trazos, 3, y los días especiales, 4.</p>
   <p class="note"><b>Libre:</b> se puede elegir cualquier tema, cualquier juego y cualquier zona, también las de 4 y 5 años, sin importar la edad. Se puede cambiar en cualquier momento y no se pierde nada de lo jugado.</p></section>
  <section><h3>Perfil</h3>
   <label>Nombre de quien juega <input id="a-name" maxlength="20" value="${esc(S.name||'')}" placeholder="Opcional"></label>
   <div class="row"><span>Edad</span>${[3,4,5].map(n=>`<label class="opt"><input type="radio" name="a-age" value="${n}" ${S.age===n?'checked':''}> ${n} años</label>`).join('')}</div>
   <div class="row"><span>Cumpleaños</span><select id="a-bd">${['—',...Array.from({length:31},(_,i)=>i+1)].map((d,i)=>`<option value="${i}" ${S.bday&&S.bday.d===i?'selected':''}>${d}</option>`).join('')}</select><select id="a-bm">${['—',...MESES].map((m,i)=>`<option value="${i}" ${S.bday&&S.bday.m===i-1?'selected':''}>${m}</option>`).join('')}</select></div>
   <p class="note">El día del cumpleaños, la Asamblea lo celebra con una torta y velitas.</p></section>
  <section><h3>Personaje de Tito</h3>
   <div class="row">${[['caracol','🐌 Caracol'],['erizo','🦔 Erizo'],['tortuga','🐢 Tortuga'],['conejo','🐰 Conejo']].map(([k,l])=>`<label class="opt"><input type="radio" name="a-kind" value="${k}" ${((S.tito&&S.tito.kind)||'caracol')===k?'checked':''}> ${l}</label>`).join('')}</div>
   <p class="note">Tito sigue llamándose Tito. La ropa y los colores de la tienda le quedan igual (en el erizo el color va en las púas, en la tortuga en el caparazón y en el conejo en la mochila).</p></section>
  <section><h3>Idioma y voz</h3>
   <div class="row"><span>Estaciones</span>${[['N','Hemisferio norte (España)'],['S','Hemisferio sur (Argentina, Uruguay)']].map(([k,l])=>`<label class="opt"><input type="radio" name="a-hemi" value="${k}" ${S.hemi===k?'checked':''}> ${l}</label>`).join('')}</div>
   <div class="row"><span>Voz del navegador</span><select id="a-vnav" style="max-width:100%">${vopts}</select><button id="a-vprueba" type="button">▶ Probar</button></div>
   <details><summary>Cómo conseguir voces más naturales</summary>${vozGuiaHTML()}</details>
   <div class="row"><span>Paisaje</span>${[['','Tito cuenta y nombra lo que se toca'],['q','Sin comentarios en el paisaje']].map(([k,l])=>`<label class="opt"><input type="radio" name="a-q3" value="${k}" ${(S.quiet3?'q':'')===k?'checked':''}> ${l}</label>`).join('')}</div>
   <p class="note">Tito habla con la voz del navegador. Voz del navegador: ${esc(vname)}.</p>
   ${(['voz','mus','fx'] as (keyof Volumenes)[]).map(k=>`<label class="rng">${({voz:'Voz',mus:'Música',fx:'Efectos'})[k]} <input type="range" id="a-${k}" min="0" max="1" step="0.05" value="${S.vol[k]}"></label>`).join('')}</section>
  <section><h3>Tiempo de juego</h3>
   <div class="row">${[[0,'Sin límite'],[10,'10 min'],[15,'15 min'],[20,'20 min']].map(([k,l])=>`<label class="opt"><input type="radio" name="a-lim" value="${k}" ${S.limit===k?'checked':''}> ${l}</label>`).join('')}</div>
   <p class="note">Al llegar al límite, Tito se despide y se va a dormir. Para seguir, hay que abrir esta zona.</p>
   <div class="days">${days}</div></section>
  ${tm}
  <section><h3>Monedas y premios</h3>
   <p>Tiene <b>${S.coins}</b> monedas (ganó ${S.coinsTot} en total) y <b>${STARS()}</b> estrellas.</p>
   <p class="note">Gana 1 moneda por cada acierto a la primera (hasta 5 por juego), 3 al terminar un juego nuevo, 2 al repetirlo, 10 en el cofre del tesoro al completar un tema (que además trae un regalo sorpresa para Tito o su casa), 3 de regalo al entrar cada día y 5 al terminar la Asamblea. Con las monedas compra ropa y colores para Tito, cosas para su casa, juguetes y mascotas. Las cosas más especiales se abren con estrellas (una por cada juego terminado). La casa de Tito crece en el mapa al terminar 2, 5, 9 y 14 temas; por dentro tiene siete habitaciones que se abren al terminar 1, 3, 5, 8, 11 y 14 temas (dormitorio, cocina, baño, cuarto de juegos, jardín y torre de las estrellas), y las cosas se llevan de una a otra arrastrándolas hasta el botón de la habitación; y Pipo, su dinosaurio, nace y crece con las estrellas (4, 15, 35 y 70). Lleva abiertos <b>${S.cofres||0}</b> cofres. No hay compras con dinero real ni premios al azar.</p>
   <h4>Vales para canjear en la vida real</h4><p class="note">Los vales marcados aparecen en la tienda. Cuando compre uno, aparece abajo para que se lo den.</p>${vales}
   ${pend?`<h4>Vales por entregar</h4>${pend}`:''}</section>
  ${sug?`<section><h3>Lo que sigue</h3><p class="tip">Próximo tema del camino: <b>${esc(V(sug.n))}</b>. Para seguir fuera de la pantalla: ${esc(tx(sug.tip||'nombrar juntos las cosas del tema que encuentren en casa o en la calle.'))}</p></section>`:''}
  <section><h3>Asambleas</h3><p class="note">El tiempo que eligió y cómo se sentía cada día.</p><div class="cal">${cal}</div></section>
  <section><h3>Cómo le va</h3><p class="note">Con esto Tito arma cada día un <b>repaso</b> de 3 juegos: primero los de lo que le cuesta y, si no hay, los que jugó hace más tiempo. El botón verde del mapa pasa una vez por día por el repaso cuando hay algo que cuesta; también se abre con la lupa de arriba del mapa.</p>${sk?`<table><thead><tr><th>Habilidad</th><th>Aciertos</th><th>Intentos</th><th></th></tr></thead><tbody>${sk}</tbody></table>`:'<p class="note">Todavía no hay datos.</p>'}</section>
  <section><h3>Copia de seguridad</h3>
   <p class="note">Guarda todo el progreso (el camino, las monedas, la casa de Tito, las figuritas y los ajustes) para pasarlo a otro dispositivo o recuperarlo si se borran los datos del navegador. Conviene hacer una copia cada tanto.</p>
   <div class="row"><button id="a-bk-dl">⬇️ Descargar copia</button><button id="a-bk-code">🔑 Ver código de copia</button><label class="opt" style="cursor:pointer">📂 Cargar archivo de copia<input type="file" id="a-bk-file" accept=".json,.txt,application/json,text/plain" hidden></label></div>
   <textarea id="a-bk-txt" rows="3" style="width:100%;box-sizing:border-box;font:13px/1.3 monospace;border:2px solid var(--ink);border-radius:12px;padding:8px;background:#fff" placeholder="Acá aparece el código para copiar, o pegá acá un código para recuperar una copia."></textarea>
   <div class="row"><button id="a-bk-copy">📋 Copiar código</button><button id="a-bk-load">♻️ Recuperar con este código</button></div>
   <div id="a-bk-msg" class="note"></div></section>
  <section><h3>Instalar en el celular o la tablet</h3>${installHTML()}</section>
  <section><h3>Ir a</h3><div class="row"><button data-go="map">Mapa</button><button data-go="asamblea">Asamblea</button><button data-go="jardin">Jardín de 3 años</button><button data-go="bosque">Bosque de 4 años</button><button data-go="montana">Montaña de 5 años</button><button data-go="fiestas">Días especiales</button><button data-go="tienda">Tienda</button><button data-go="casaTito">Casa de Tito</button><button data-go="album">Álbum</button><button data-go="intro">Ver el cuento del inicio</button></div>
   <div class="row"><select id="a-tema">${TEMAS.map(t=>`<option value="${t.id}">${esc(V(t.n))}</option>`).join('')}</select><button id="a-gotema">Ir al tema</button></div></section>
  <section><h3>Empezar de cero</h3><button id="a-reset" class="danger">Borrar todo el progreso</button><span id="a-confirm" hidden> ¿Seguro? <button id="a-yes" class="danger">Sí, borrar</button> <button id="a-no">No</button></span></section>`;
// q(selector): busca un elemento dentro del panel. A partir de aquí se conecta cada control con S.
  const q=(s: string)=>el.querySelector<HTMLInputElement>(s)!;
// Botones de la copia de seguridad.
  bkWire(q);
// Nombre (máx. 20 letras) y edad. Al cambiar la edad se reinicia la dificultad adaptativa.
  q('#a-name').oninput=e=>{S.name=(e.target as HTMLInputElement).value.trim().slice(0,20);save()};
  el.querySelectorAll<HTMLInputElement>('[name=a-age]').forEach(r=>r.onchange=()=>{S.age=+r.value;VIVO.ADAPT=0;save()});
// Personaje de Tito: se guarda en S.tito.kind y se pide a la capa 3D que rehaga a Tito (__w3.retito).
  el.querySelectorAll<HTMLInputElement>('[name=a-kind]').forEach(r=>r.onchange=()=>{S.tito=S.tito||{};S.tito.kind=r.value as Tito['kind'];save();try{if(window.__w3&&window.__w3.retito)window.__w3.retito()}catch(e){console.error(e)}});
// Voz del navegador: S.vozNav guarda la elegida ('' = automática); se aplica con pickVoice y se oye un saludo de prueba.
  q('#a-vnav').onchange=e=>{S.vozNav=(e.target as HTMLInputElement).value;save();pickVoice();vozProbar()};
  q('#a-vprueba').onclick=()=>{pickVoice();vozProbar()};
// Paisaje: S.quiet3=1 hace callar los comentarios de Tito en el mundo 3D (say3 en mundo3d/cielo.ts).
  el.querySelectorAll<HTMLInputElement>('[name=a-q3]').forEach(r=>r.onchange=()=>{S.quiet3=r.value==='q'?1:0;save()});
// Hemisferio, límite de tiempo y volúmenes (los volúmenes se aplican al momento con setVol).
  el.querySelectorAll<HTMLInputElement>('[name=a-hemi]').forEach(r=>r.onchange=()=>{S.hemi=r.value as Estado['hemi'];save()});
  el.querySelectorAll<HTMLInputElement>('[name=a-lim]').forEach(r=>r.onchange=()=>{S.limit=+r.value;save()});
  (['voz','mus','fx'] as (keyof Volumenes)[]).forEach(k=>q('#a-'+k).oninput=e=>{S.vol[k]=+(e.target as HTMLInputElement).value;save();setVol()});
// Atajos "Ir a": cierran el panel y van a la escena (o al tema elegido en la lista).
  el.querySelectorAll<HTMLInputElement>('[data-go]').forEach(b=>b.onclick=()=>{closeAdult();go(b.dataset.go!,{hello:true})});
  q('#a-gotema').onclick=()=>{const id=q('#a-tema').value;closeAdult();go('casita',{t:id,hello:true})};
// Botón de instalar: lanza el aviso de instalación guardado por el navegador y vuelve a pintar el panel.
  const ib=q('#a-install');if(ib)ib.onclick=()=>{if(!VIVO.deferredInstall)return;VIVO.deferredInstall.prompt();VIVO.deferredInstall.userChoice.finally(()=>{VIVO.deferredInstall=null;openAdult()})};
// bdc(): guarda el cumpleaños (día y mes; mes de 0 a 11) o null si falta alguno, y permite volver a celebrarlo hoy.
  const bdc=()=>{const d=+q('#a-bd').value,m=+q('#a-bm').value;S.bday=d&&m?{d,m:m-1}:null;S.bdayDone='';save()};q('#a-bd').onchange=bdc;q('#a-bm').onchange=bdc;
// Vales: activar/desactivar, cambiar el texto (no vacío) y el precio (de 1 a 500). "Entregado" lo quita de pendientes.
  el.querySelectorAll<HTMLInputElement>('[data-von]').forEach(c=>c.onchange=()=>{S.vales![+c.dataset.von!].on=c.checked?1:0;save()});
  el.querySelectorAll<HTMLInputElement>('[data-vtxt]').forEach(c=>c.oninput=()=>{const t=c.value.trim();if(t){S.vales![+c.dataset.vtxt!].txt=t;save()}});
  el.querySelectorAll<HTMLInputElement>('[data-vp]').forEach(c=>c.onchange=()=>{const n=Math.round(+c.value);if(n>=1){S.vales![+c.dataset.vp!].p=Math.min(500,n);save()}});
  el.querySelectorAll<HTMLInputElement>('[data-vgive]').forEach(b=>b.onclick=()=>{S.valesLog![+b.dataset.vgive!].given=1;save();openAdult()});
// Modo de juego: libre (S.unlockAll) o camino. Se olvida lo que ya se avisó como recién abierto (S.seenOpen) y, al
// volver al camino, las zonas que quedan cerradas vuelven a "dormir" (S.woke) para celebrar otra vez su apertura.
  el.querySelectorAll<HTMLInputElement>('[name=a-mode]').forEach(r=>r.onchange=()=>{S.unlockAll=r.value==='libre';S.seenOpen={};if(!S.unlockAll)for(const z of['bosque','montana'])if(!zoneOpen(z))delete S.woke![z];save()});
// Borrar todo: pide confirmación en el propio panel antes de llamar a doReset().
  q('#a-reset').onclick=()=>{q('#a-confirm').hidden=false};q('#a-no').onclick=()=>{q('#a-confirm').hidden=true};
  q('#a-yes').onclick=()=>{closeAdult();doReset()};
}
// adultWas: edad y modo libre al abrir el panel. closeAdult(): cierra el panel y pone a cero el tiempo de la sesión (también el guardado en S.ses); si Tito estaba dormido (límite de tiempo), vuelve al mapa; si cambió la edad o el modo libre, vuelve a abrir la escena 3D actual (B3 del informe de pruebas jugadas).
let adultWas='';
export function closeAdult(){document.getElementById('adult')!.hidden=true;VIVO.sessionT=0;S.ses=null;save();if(sceneName==='dormir'){go('map',{hello:true});return}
  // Si cambió la edad o el modo libre, el mapa, el camino o la casita se vuelven a abrir para que candados y colores
  // cuadren con lo que se puede jugar. El cofre no (cuenta y premia al entrar) y las demás escenas no muestran candados.
  if(adultWas!==S.age+'|'+!!S.unlockAll&&scene&&scene.three&&!['cofre','title'].includes(sceneName))go(sceneName,Object.assign({},sceneArg,{hello:false,from:null,fin:false}))}
// Botón "Volver al juego".
document.getElementById('a-close')!.onclick=()=>closeAdult();

/* ---------- nombre y reinicio: desde la fase 4p, en aplicacion/dialogos.ts ---------- */

/* ================= BUCLE E INPUT ================= */
// portraitOk: en un móvil en vertical se pide girarlo; con un toque se puede seguir igualmente (y ya no se vuelve a pedir).
let portraitOk=false;
// toLogical(evento): pasa la posición del dedo/ratón en la ventana a coordenadas lógicas de 1600x900 (quita márgenes y escala).
function toLogical(e: MouseEvent){return[(e.clientX-OX)/SC,(e.clientY-OY)/SC]}
// dlgOpen(): ¿hay abierto algún panel HTML (adultos, nombre o borrar)? Entonces el teclado y el "pasar por encima" no actúan.
const dlgOpen=()=>!document.getElementById('adult')!.hidden||!document.getElementById('nameDlg')!.hidden||!document.getElementById('resetDlg')!.hidden;
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
  if(document.getElementById('adult')!.hidden&&sceneName!=='title'&&sceneName!=='dormir'){VIVO.sessionT+=rdt;VIVO.minuteAcc+=rdt;
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
  if(isPortrait()&&!portraitOk){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='rgba(46,36,32,.88)';ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();ctx.save();ctx.translate(800,400);ctx.rotate(Math.sin(T*2)*.8-.8);card(-90,-160,180,320,'#fff',10,30);ctx.restore();text(V('Gira el móvil'),800,700,90,'#fff');text(V('(toca para seguir igual)'),800,790,44,'#FCEBD0')}
  requestAnimationFrame(frame);
}
// window.__cl: puerta para las pruebas automáticas (y para depurar desde la consola): ir a escenas, leer S y la escena,
// simular toques (tap), arrastres (drag) y ratón encima (hover), y abrir/cerrar la zona de adultos.
window.__cl={go:(n: string,o?: Libre)=>go(n,o),get S(){return S},get scene(){return scene},get name(){return sceneName},SCENES,TEMA,TEMAS,
  tap(x: number,y: number){scene!.down&&scene!.down(x,y);scene!.up&&scene!.up(x,y)},drag(a: number,b: number,c: number,d: number){scene!.down!(a,b);scene!.move&&scene!.move(c,d);scene!.up&&scene!.up(c,d)},
  hover(x: number,y: number){VIVO.MX=x;VIVO.MY=y;VIVO.mouseOn=true},T:()=>T,say,openAdult,closeAdult};

/* ---------- copia de seguridad del progreso ---------- */
// bk64(bytes): bytes a base64 (por trozos de 32 KB, porque fromCharCode con muchos argumentos revienta).
const bk64=(u: Uint8Array)=>{let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000) as unknown as number[]);return btoa(s)};
// bkUn64(texto): base64 a bytes.
const bkUn64=(s: string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
// bkEncode(): convierte S en un código de copia: 'CURIO1.' + base64 del JSON comprimido con gzip, o 'CURIO0.' + base64 del
// JSON sin comprimir si el navegador no tiene CompressionStream.
export async function bkEncode(){const j=JSON.stringify(S);
  if(typeof CompressionStream==='function'){try{const st=new Blob([j]).stream().pipeThrough(new CompressionStream('gzip'));return 'CURIO1.'+bk64(new Uint8Array(await new Response(st).arrayBuffer()))}catch(e){}}
  return 'CURIO0.'+bk64(new TextEncoder().encode(j))}
// bkDecode(código): al revés que bkEncode. Acepta también el JSON tal cual (archivo descargado). Comprueba que parece una
// partida (esPartida, de dominio/partida.ts: un objeto, ni null ni una lista, y con temas, que también lo es) y devuelve
// el objeto; si no, lanza Error('formato') o Error('navegador'). La versión no se mira aquí: load() la pone al día.
export async function bkDecode(code: string): Promise<Libre>{code=String(code||'').trim();let j: string;
  if(code.startsWith('{'))j=code;
  else{code=code.replace(/\s+/g,'');const m=code.match(/^CURIO([01])\.([A-Za-z0-9+/=]+)$/);if(!m)throw new Error('formato');const u=bkUn64(m[2]);
    if(m[1]==='1'){if(typeof DecompressionStream!=='function')throw new Error('navegador');j=await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}
    else j=new TextDecoder().decode(u)}
  const d: unknown=JSON.parse(j);if(!esPartida(d)||!esPartida(d['temas']))throw new Error('formato');return d}
// bkWire(q): conecta los botones de la sección "Copia de seguridad": ver código, copiarlo, descargar archivo .json,
// recuperar desde código o archivo. Al recuperar, enseña un resumen y, si se confirma, escribe la copia directamente en
// el guardado (escribirGuardado; en el navegador, localStorage) y recarga la página (load() de nucleo/guardado.ts la pone al día y la mezcla con DEF como cualquier
// partida guardada).
function bkWire(q: (s: string)=>HTMLInputElement){const msg=(h: string)=>{q('#a-bk-msg').innerHTML=h},ta=q('#a-bk-txt');
  q('#a-bk-code').onclick=async()=>{ta.value=await bkEncode();ta.select();msg('Este código tiene todo el progreso. Copialo y guardalo, por ejemplo mandándotelo por mensaje.')};
  q('#a-bk-copy').onclick=async()=>{if(!ta.value.startsWith('CURIO'))ta.value=await bkEncode();ta.select();let ok=false;try{await navigator.clipboard.writeText(ta.value);ok=true}catch(e){try{ok=document.execCommand('copy')}catch(e2){}}
    msg(ok?'✅ Código copiado.':'Seleccioná el código de arriba y copialo a mano.')};
  q('#a-bk-dl').onclick=()=>{const b=new Blob([JSON.stringify(S)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='curiolandia-copia-'+today()+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
    msg('Si no se descargó nada, usá el código de copia.')};
// ask(texto): intenta leer una copia y pide confirmación antes de reemplazar el progreso. Todo lo que viene de la copia
// y se enseña va escapado (esc) o pasado a número: una copia editada no puede meter HTML en el panel.
  const ask=async(src: string)=>{let d: Libre;try{d=await bkDecode(src)}catch(e){msg((e as Error).message==='navegador'?'Este navegador no puede abrir ese código. Probá con el archivo de copia.':'❌ Eso no parece una copia de Curiolandia. Revisá que el código esté completo.');return}
    const nT=Object.values<Libre>(d.temas||{}).filter(t=>t&&t.done).length,nG=Object.values<Libre>(d.temas||{}).reduce((a: number,t)=>a+Object.keys((t&&t.g)||{}).length,0);
    msg(`Copia encontrada${d.name?' de <b>'+esc(d.name)+'</b>':''}: ${nT} temas terminados, ${nG} juegos jugados y ${Math.max(0,Math.floor(+d.coins)||0)} monedas. <b>Reemplaza el progreso actual de este dispositivo.</b> <button id="a-bk-ok" class="danger">Sí, recuperar esta copia</button>`);
    q('#a-bk-ok').onclick=()=>{if(!escribirGuardado(KEY,JSON.stringify(d))){msg('❌ No se pudo guardar en este navegador.');return}location.reload()}};
  q('#a-bk-load').onclick=()=>ask(ta.value);
  q('#a-bk-file').onchange=e=>{const f=(e.target as HTMLInputElement).files&&(e.target as HTMLInputElement).files![0];if(!f)return;f.text().then(t=>ask(t))}}
