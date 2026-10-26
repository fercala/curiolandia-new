/* ================= CURIOLANDIA 3D: el mundo en tres dimensiones ================= */
// La portada, el mapa (la isla), las zonas, las casitas de tema y el cofre se dibujan con Three.js en #gl.
// Los juegos, la asamblea, la tienda, el álbum y la casa por dentro siguen en el lienzo 2D (#cv), que va encima.
// Para no reescribir la lógica de siempre, en cada cuadro se proyectan las posiciones 3D a coordenadas 1600x900
// (MZ2, ZPOS, stationPos, TITO, HOUSE_AT) y los enter/down/hint originales trabajan sobre esas posiciones.
/* ============================================================================
 * mundo3d/mundo3d.ts (antes world3d.js) — LA CAPA 3D DE CURIOLANDIA: la entrada, que la monta
 * ----------------------------------------------------------------------------
 * Qué hace:
 *   Dibuja con Three.js (r128) en el <canvas id="gl"> la portada, el mapa (la isla), las cinco zonas
 *   (jardín, bosque, montaña, fiestas, inglés), las casitas de tema por fuera y el cofre. El lienzo 2D
 *   (#cv) va encima y es transparente en las escenas 3D: en él se pintan los carteles, botones y HUD.
 *
 * Cómo engancha con la lógica 2D (la idea clave del archivo):
 *   - La lógica original (escenas/escenas2d.ts, escenas/zonas.ts) trabaja en una pantalla lógica de 1600x900 y guarda las
 *     posiciones de lo que se puede tocar en globales: MZ2 (zonas del mapa: x, y, r), ZPOS[zona][tema]
 *     (casitas de cada zona), stationPos(t,j) (puestos de una casita), TITO (rectángulo de Tito) y
 *     HOUSE_AT (casa de Tito y su mascota).
 *   - En cada cuadro, el método sync()/draw() de cada escena 3D proyecta los objetos 3D a 1600x900 con
 *     proj/projO/projR y escribe el resultado en esas globales. Así los enter/down/hint/draw originales
 *     siguen funcionando sin saber que hay 3D (dibujan el cartel encima del objeto 3D, etc.).
 *   - Las escenas 3D (SCENES.title, map, las zonas, casita, cofre) se ponen en sus módulos (montarMapa3D...). Desde la
 *     fase 4i, la portada, el cofre y la casita 3D son otra escena hecha a partir de la 2D, que no se toca
 *     (SCENES.cofre={...cofre2D,three:true,enter,draw,down}): llaman a los métodos 2D por su nombre. El mapa y las zonas
 *     aún se "envuelven" con Object.assign(S0,{three:true, enter, draw, down...}): guardan el método original (enter0,
 *     down0) y lo llaman desde el nuevo. scene.three=true le dice al bucle de dibujo (aplicacion/adultos.ts) que llame a R3frame.
 *   - down(x,y): primero pickAt(x,y) lanza un rayo (raycast) desde la cámara por el punto tocado y
 *     devuelve el userData del objeto con userData.id (zona, casita, 'tito'...). Si no hay nada, se
 *     prueban los objetos animados (flyTap, wobTap), el cielo (skyTap), el mar o el suelo (walkGround).
 *     Si se tocó un lugar, walkTo() hace que Tito camine hasta allí y al llegar se llama a la lógica 2D
 *     original con call0() (que aparta TITO y HOUSE_AT para que no "roben" el toque).
 *   - R3frame(dt): lo llama el bucle principal (aplicacion/adultos.ts) en cada cuadro si la escena es 3D. Ejecuta las
 *     funciones de W3.upd (animaciones), mueve la cámara (camTick) y dibuja la escena con R.render.
 *
 * El mundo activo: W3 (en las funciones se le llama `w`). Lo crea newWorld() y lo activa setWorld():
 *   w.sc    escena de Three.js;            w.cam   cámara en perspectiva;     w.fov  ángulo de visión base
 *   w.pick  objetos que pickAt puede tocar; w.upd  lista de funciones f(dt) que se llaman en cada cuadro
 *   w.kind  'title' | 'map' | 'zone' | 'casita' | 'cofre';  w.sun luz del sol (con sombras)
 *   w.tito  el modelo 3D de Tito;           w.trees objetos animables al tocarlos (los rellena wobInit)
 *   w.spots / w.cas  grupos 3D de las zonas del mapa / de las casitas de una zona
 *   Otros campos se crean sobre la marcha (w.myS, w.myC, w.rainbow, w.starT...): son el estado de los
 *   juegos del cielo de cada escena y desaparecen al cambiar de mundo (disposeWorld libera la GPU).
 *
 * Objetos animados: cada objeto que reacciona al tocarlo lleva una marca en userData (tree, bush, frog,
 *   bfly...). wobInit los mete en w.trees; al tocarlo, wobTap pone userData.wob=T (el momento del toque)
 *   y su animación usa e=T-wob (segundos desde el toque; 9 si nunca se tocó). userData.dur dice cuánto
 *   dura la reacción. La lista de marcas está en WOBK (mundo3d/interaccion.ts).
 *
 * Ayudantes de geometría (desde la fase 4g en mundo3d/materiales.ts): M (material "toon" con 3 tonos), OLm + olGeo
 *   (contorno marrón de dibujo animado), mk (crea una pieza con su contorno), grp (grupo), Box/Sph/Cyl/Cone/prism/
 *   rbox/starGeo (formas), mg (une piezas en una sola geometría), gcache (geometrías compartidas),
 *   canvasTex/picTex/pillTex (texturas dibujadas con las funciones 2D de siempre), spr/plane (sprites y
 *   planos con textura).
 * El motor (desde la fase 4g en mundo3d/motor.ts): el dibujante R, el mundo activo W3 (newWorld, setWorld,
 *   disposeWorld), la cámara (camRig, camTick), la calidad (PRK, FPS), la proyección (proj, projO, projR) y el
 *   toque (RC, pickAt). montarMotor() lo crea todo al montar la capa 3D.
 *
 * Los módulos de la capa 3D (desde la fase 4h, cada parte en el suyo; antes, todo en este archivo):
 *   motor.ts (el motor) y materiales.ts (las piezas), arriba; decorado.ts (flores, árboles, flechas, mariposas...),
 *   cielo.ts (skyNow, el cielo tocable y la voz del paisaje, say3), objetos.ts (los animales y cosas tocables de las
 *   zonas, cann3 explica su patrón común), personajes.ts (Tito, Pipo y la casa de Tito), interaccion.ts (caminar,
 *   tocar objetos con wobTap y el puente con la lógica 2D: titoRect, call0) y una por cada escena 3D: mapa3d.ts,
 *   zonas3d.ts, casita3d.ts, cofre3d.ts y portada3d.ts. Ninguno crea nada de Three.js al cargarse: cada escena se
 *   convierte en 3D con su función montar* (montarMapa3D...) y este archivo las llama en orden.
 * Desde la fase 2o es un módulo: src/modulos.ts lo carga el último (después de aplicacion/adultos.ts) y el puente deja
 *   R3frame en globalThis. Los tipos (el mundo, las opciones de las piezas...) están en mundo3d/tipos.ts, y THREE, que
 *   llega como global desde three.min.js, en mundo3d/three.d.ts.
 * Exporta: R3frame (lo llama frame(), en aplicacion/adultos.ts). Al montarse, la capa 3D deja window.__w3 (pruebas y
 *   zona de adultos: retito, PRK...; lo pone montarInteraccion) y cambia funciones de otros con su pon*: go (ponGo, en
 *   mundo3d/interaccion.ts) y goSeguir (ponGoSeguir, en mundo3d/mapa3d.ts), y pone la disposición de la vista 3D
 *   (ponDisposicion, de escenas/disposicion.ts, en mundo3d/casita3d.ts: desde la fase 4i, en vez de cambiar stationPos).
 * Importa: de mundo3d/motor.ts montarMotor y lo que usa R3frame (R, W3, camTick, fpsTick), scene (src/nucleo/) y las
 *   funciones montar* de cada módulo.
 * Todo va dentro de una función que se llama sola: si montarMotor() dice que no hay Three.js o WebGL, se sale y el
 *   juego sigue en 2D; si no, crea R3frame, llama a montarInteraccion, montarMapa3D, montarZonas3D, montarCasita3D,
 *   montarCofre3D y montarPortada3D (en el mismo orden en que antes estaban aquí sus envolturas) y pone __w3.ok.
 * ========================================================================== */
import { R, W3, camTick, fpsTick, montarMotor } from './motor.ts';
import { scene } from '../nucleo/indice.ts';
import { montarInteraccion } from './interaccion.ts';
import { montarMapa3D } from './mapa3d.ts';
import { montarZonas3D } from './zonas3d.ts';
import { montarCasita3D } from './casita3d.ts';
import { montarCofre3D } from './cofre3d.ts';
import { montarPortada3D } from './portada3d.ts';

// R3frame(dt): dibuja un cuadro del mundo 3D. Vale null hasta que se crea al montar la capa 3D (si no hay WebGL se queda
// en null).
export let R3frame: ((dt: number) => void) | null = null;
// Función que se ejecuta al momento y monta la capa 3D si hay Three.js y WebGL.
(function(){
if(!montarMotor())return;
// R3frame(dt): el dibujo 3D de cada cuadro (lo llama el bucle de aplicacion/adultos.ts antes de dibujar lo 2D encima). Solo si hay mundo y la escena
// es 3D (scene.three): ejecuta las funciones de W3.upd (con try/catch para que un fallo en un objeto no pare el juego), mueve la cámara y dibuja
R3frame=function(dt){if(!W3||!scene||!scene.three)return;fpsTick();
  for(const f of W3.upd)try{f(dt)}catch(e){console.error(e)}camTick(W3,dt);R.render(W3.sc,W3.cam)};
// cada escena 3D se monta en su módulo (y antes, el cambio de go() y window.__w3)
montarInteraccion();montarMapa3D();montarZonas3D();montarCasita3D();montarCofre3D();montarPortada3D();
// marca de que la capa 3D se ha cargado entera (ningún otro archivo la lee; sirve para comprobarlo desde la consola)
window.__w3.ok=true;
})();
