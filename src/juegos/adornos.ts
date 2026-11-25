// juegos/adornos.ts: lo que flota por el fondo de «conocer» y «busca» según el estilo del tema, y cómo entran sus
// tarjetas (idea 46 de docs/IDEAS-MEJORA.md, en la PR de todas las ideas pendientes, v0.2.181). El estilo de cada tema
// lo dice dominio/variedad.ts (estiloDe).
// Exporta: dibujaAdorno y entradaTarjeta. Importa: el dibujo del núcleo.
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos del dibujo en la pantalla de 1600x900. */
import { T, circ, ctx, star } from '../nucleo/indice.ts';
import type { Adorno, Entrada } from '../dominio/variedad.ts';

// PIEZAS_ADORNO: cuántas cosas flotan.
const PIEZAS_ADORNO = 9;

// unaPieza(adorno, i): pinta la pieza i del adorno en (0, 0), ya movida a su sitio.
function unaPieza(adorno: Adorno, i: number): void {
  if (adorno === 'burbujas') circ(0, 0, 14 + (i % 3) * 8, 'rgba(255,255,255,0.35)', 3, 'rgba(255,255,255,0.8)');
  else if (adorno === 'hojas') {
    ctx.rotate(Math.sin(T * 2 + i) * 0.8);
    ctx.fillStyle = ['#F4A340', '#E7663A', '#C9A227'][i % 3]!;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (adorno === 'estrellas') star(0, 0, 14 + (i % 3) * 5, 'rgba(255,233,120,0.75)', 0);
  else if (adorno === 'corazones') corazon(14 + (i % 3) * 5);
  else nota();
}

// corazon(r): un corazón rosa de tamaño r en (0, 0).
function corazon(r: number): void {
  ctx.fillStyle = 'rgba(245,110,150,0.6)';
  ctx.beginPath();
  ctx.moveTo(0, r);
  ctx.bezierCurveTo(-r * 2, -r * 0.4, -r * 0.6, -r * 1.6, 0, -r * 0.5);
  ctx.bezierCurveTo(r * 0.6, -r * 1.6, r * 2, -r * 0.4, 0, r);
  ctx.fill();
}
// nota(): una nota musical morada (la bolita y el palo) en (0, 0).
function nota(): void {
  ctx.fillStyle = 'rgba(120,100,200,0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 8, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(8, -34, 4, 34);
}

// dibujaAdorno(adorno): las piezas del adorno flotando despacio por el fondo (las burbujas, las estrellas y las notas
// suben; las hojas y los corazones bajan), siempre las mismas para que no distraigan.
export function dibujaAdorno(adorno: Adorno): void {
  const sube = adorno === 'burbujas' || adorno === 'estrellas' || adorno === 'notas';
  ctx.save();
  for (let i = 0; i < PIEZAS_ADORNO; i++) {
    const x = 90 + ((i * 337) % 1420) + Math.sin(T * 0.8 + i) * 25,
      recorrido = (T * (18 + (i % 4) * 6) + i * 120) % 1000,
      y = sube ? 950 - recorrido : recorrido - 50;
    ctx.save();
    ctx.translate(x, y);
    unaPieza(adorno, i);
    ctx.restore();
  }
  ctx.restore();
}

// entradaTarjeta(entrada, ap, i): mueve el dibujo (ya en el centro de la tarjeta) según cómo entra: ap va de 0 (empieza)
// a 1 (ya está); i es el número de la tarjeta (las del lado entran por la izquierda o la derecha). Devuelve la escala.
export function entradaTarjeta(entrada: Entrada, ap: number, i: number): number {
  const e = 1 - Math.pow(1 - ap, 3);
  if (entrada === 'caida') ctx.translate(0, (e - 1) * 500);
  else if (entrada === 'giro') ctx.rotate((1 - e) * Math.PI * 2);
  else if (entrada === 'lado') ctx.translate((e - 1) * (i % 2 ? -900 : 900), 0);
  if (entrada === 'rebote') return ap < 1 ? rebote(ap) : 1;
  return e;
}
// rebote(k): la escala con un pequeño pasarse y volver (como back() del núcleo).
const rebote = (k: number): number => {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
};
