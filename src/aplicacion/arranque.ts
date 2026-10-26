/*
 * aplicacion/arranque.ts (antes boot.js): el arranque. src/modulos.ts llama a arrancar() al final, cuando ya están
 * cargados todos los módulos y el puente ha dejado lo suyo en globalThis.
 * Entrega los cofres que se quedaron sin abrir (cofrePend) y espera a que carguen las fuentes Andika y Fredoka (para
 * que los textos del lienzo no salgan con otra letra), pero como mucho 2,5 s (sin internet pueden no llegar nunca).
 * Después va a la portada (go('title')) y arranca el bucle de dibujo frame() de aplicacion/adultos.ts, que ya se repite
 * solo con requestAnimationFrame.
 * Desde la fase 2p es un módulo: era el último archivo global, así que ya no queda código global.
 * Exporta: arrancar. Importa: go (el núcleo, src/nucleo/), cofrePend (escenas/cofre.ts) y frame (aplicacion/adultos.ts).
 */
import { go } from '../nucleo/indice.ts';
import { cofrePend } from '../escenas/cofre.ts';
import { frame } from './adultos.ts';

// Lo que se espera como mucho a las fuentes, en milisegundos.
const ESPERA_FUENTES = 2500;

// arrancar(): pone el juego en marcha, una sola vez, al cargar la página. Primero entrega el premio de un cofre que se
// quedó sin abrir (se cerró o recargó la página); luego espera a las fuentes y va a la portada (ver empezar).
export function arrancar(): void {
  cofrePend();
  void empezar();
}

// empezar(): con las fuentes cargadas, o a los 2,5 s si no llegan (un fallo al cargarlas tampoco para el juego), va a
// la portada y pide el primer cuadro del bucle de dibujo. go se lee al llamarlo (hasta la fase 4k
// la capa 3D lo envolvía; ahora solo lo envuelven las pruebas).
async function empezar(): Promise<void> {
  const fuentes = Promise.all([document.fonts.load('700 100px Andika'), document.fonts.load('700 100px Fredoka')]);
  const espera = new Promise<void>((listo) => setTimeout(listo, ESPERA_FUENTES));
  await Promise.race([fuentes, espera]).catch(() => undefined);
  go('title');
  requestAnimationFrame(frame);
}
