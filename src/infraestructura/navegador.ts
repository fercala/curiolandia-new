/*
 * infraestructura/navegador.ts: los adaptadores del navegador para los puertos de aplicacion/puertos.ts (fase 3g de
 * docs/PLAN-MIGRACION.md). Son los únicos sitios del juego que usan new Date() y Math.random(): todo lo demás pide la
 * hora y el azar con ahora() y azar(). Las pruebas de Playwright que cambian la fecha (tests/regresion/lib.js y
 * limites.js cambian window.Date) siguen valiendo: el reloj del navegador lee Date cada vez que se le pregunta.
 * Exporta: relojDelNavegador y azarDelNavegador.
 * Importa los tipos de aplicacion/puertos.ts.
 */
import type { Azar, Reloj } from '../aplicacion/puertos.ts';

// relojDelNavegador: la fecha y la hora del aparato (hora local).
export const relojDelNavegador: Reloj = { ahora: () => new Date() };

// azarDelNavegador: el azar del navegador (Math.random).
export const azarDelNavegador: Azar = { numero: () => Math.random() };
