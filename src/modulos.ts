// Entrada del juego: src/modulos.ts y todo lo que importa son el juego entero. El plugin de Vite
// (herramientas/vite/curiolandia.mts) lo junta con rolldown en un único <script>. Desde la fase 2p de
// docs/PLAN-MIGRACION.md ya no queda código global: todos los archivos de antes (core.js, scenes.js, world3d.js...) son
// módulos TypeScript.
// Los import se evalúan en el orden en que están escritos. Lo primero, desde la fase 3g, es conectar el reloj y el azar
// del navegador a sus puertos (infraestructura/conectar.ts y aplicacion/puertos.ts): así cualquier módulo puede pedir
// la hora (ahora()) o un número al azar (azar()) desde que se carga. Después, los dibujos (dibujos/todos.ts, que los
// carga en su orden), luego el núcleo (nucleo/indice.ts, lo que antes era core.js) y después el contenido que lo amplía
// (contenido/lex.ts, antes lex.js: no exporta nada, solo añade palabras y sonidos al núcleo). Por último, los
// componentes de juego (juegos/indice.ts, antes comps.js y comps2.js) y los temas que los usan (temas/indice.ts,
// antes temas.js, temas4.js y temas5.js). Luego los cuentos (contenido/cuentos.ts, antes cuentos.js: solo datos) y, al
// final, las escenas (escenas/indice.ts: escenas2d.ts, zonas.ts, tienda.ts y repaso.ts, antes scenes.js, zonas.js,
// tienda.js y repaso.js), que usan los temas. Después, la capa 3D (mundo3d/mundo3d.ts, antes world3d.js, que monta los
// demás módulos de mundo3d/): pone sus versiones 3D de la portada, el mapa, las zonas, la casita y el cofre. Y luego la
// aplicación: la zona de adultos (aplicacion/adultos.ts, antes adult.js) y, desde la v0.2.51 en su propio módulo, la
// entrada y el bucle de dibujo (aplicacion/bucle.ts, que importa openAdult de adultos.ts), que usan todo lo anterior (el
// bucle dibuja la capa 3D con R3frame; hasta la fase 4p la capa 3D iba después). Con todo cargado y el puente puesto,
// arrancar() (aplicacion/arranque.ts, antes boot.js) pone el juego en marcha.
import './infraestructura/conectar.ts';
import * as puertos from './aplicacion/puertos.ts';
import * as dibujos from './dibujos/todos.ts';
import * as nucleo from './nucleo/indice.ts';
import './contenido/lex.ts';
import * as juegos from './juegos/indice.ts';
import * as temas from './temas/indice.ts';
import * as cuentos from './contenido/cuentos.ts';
import * as escenas from './escenas/indice.ts';
import * as mundo3d from './mundo3d/mundo3d.ts';
import * as aplicacion from './aplicacion/adultos.ts';
import * as bucle from './aplicacion/bucle.ts';
import { arrancar } from './aplicacion/arranque.ts';

// puente(m): deja cada cosa que exporta el módulo m en globalThis con su mismo nombre. Lo leen por su nombre suelto
// las pruebas (window.__cl y lo que miran con page.evaluate, ver docs/CONTRATO-PRUEBAS.md). Hasta la fase 4q también
// lo usaban los módulos que necesitaban algo de uno que se carga después (src/tardias.d.ts, ya borrado): ahora cada
// módulo importa lo que usa.
// Es una propiedad con get que lee siempre el valor actual del módulo: así S, ctx, T, scene, go... están al día aunque
// el módulo los cambie (con ponS, ponCtx, ponT, go, ponGo...). El set da error: desde fuera no se puede reasignar lo
// de un módulo (para eso están las funciones pon*). Y como no es configurable, dos módulos que exportaran el mismo
// nombre darían error al cargar en vez de taparse uno a otro (tests/unidad/globales.test.ts lo comprueba antes).
function puente(m: Readonly<Record<string, unknown>>): void {
  for (const nombre of Object.keys(m)) {
    Object.defineProperty(globalThis, nombre, {
      get: () => m[nombre],
      set: () => {
        throw new TypeError(`${nombre} es de un módulo: no se puede reasignar desde fuera (usa su función pon*)`);
      },
      enumerable: true,
      configurable: false,
    });
  }
}
puente(puertos);
puente(dibujos);
puente(nucleo);
puente(juegos);
puente(temas);
puente(cuentos);
puente(escenas);
puente(aplicacion);
puente(bucle);
puente(mundo3d);
// Con todo cargado y el puente puesto, el juego se pone en marcha (aplicacion/arranque.ts).
arrancar();
