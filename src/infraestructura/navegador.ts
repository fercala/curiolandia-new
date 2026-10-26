/*
 * infraestructura/navegador.ts: los adaptadores del navegador para los puertos de aplicacion/puertos.ts (fases 3g y 3h
 * de docs/PLAN-MIGRACION.md). Son los únicos sitios del juego que usan new Date(), Math.random() y localStorage: todo
 * lo demás pide la hora, el azar y lo guardado con ahora(), azar(), leerGuardado() y escribirGuardado(). Las pruebas de
 * Playwright que cambian la fecha (tests/regresion/lib.js y limites.js cambian window.Date) siguen valiendo: el reloj
 * del navegador lee Date cada vez que se le pregunta.
 * Exporta: relojDelNavegador, azarDelNavegador y guardadoDelNavegador.
 * Importa los tipos de aplicacion/puertos.ts.
 */
import type { Azar, Guardado, Reloj } from '../aplicacion/puertos.ts';

// relojDelNavegador: la fecha y la hora del aparato (hora local).
export const relojDelNavegador: Reloj = { ahora: () => new Date() };

// azarDelNavegador: el azar del navegador (Math.random).
export const azarDelNavegador: Azar = { numero: () => Math.random() };

// guardadoDelNavegador: localStorage del navegador, sin dar nunca error (los try/catch cubren el modo privado, la falta
// de espacio y el almacenamiento bloqueado, que puede fallar hasta al nombrar localStorage). Lo que guarda otra pestaña
// llega con el evento storage (sin clave cuando se borra todo: eso no se avisa).
export const guardadoDelNavegador: Guardado = {
  leer: (clave) => {
    try {
      return localStorage.getItem(clave);
    } catch {
      return null;
    }
  },
  escribir: (clave, texto) => {
    try {
      localStorage.setItem(clave, texto);
      return true;
    } catch {
      return false;
    }
  },
  alCambiarFuera: (fn) => {
    addEventListener('storage', (e) => {
      if (e.key !== null) fn(e.key, e.newValue);
    });
  },
};
