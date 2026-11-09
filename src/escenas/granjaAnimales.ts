/*
 * escenas/granjaAnimales.ts: los animales de la granja como recortables (base B2 de docs/IDEAS-MEJORA.md, fase P7): de
 * lado y enteros, con su sombra y un saltito al andar. La vaca, el caballo y el cerdo, cuyos dibujos son solo la cabeza,
 * se dibujan con un cuerpo (dibujaCuerpo: cuerpo, patas y cola, y la cabeza delante); la oveja, la gallina, el pollito y
 * el pato ya son enteros. Por el plano de una excursión pasean los animales que dice su lista (Excursion.animales,
 * contenido/excursiones.ts): andan hasta un sitio del prado, se paran un rato y siguen; al tocarlos dan un salto y
 * hacen su sonido (SOUNDS y ONO). Las estaciones de la granja (escenas/granjaTalleres.ts) usan dibujaCuerpo.
 * Exporta: dibujaCuerpo, ANIMALES_GRANJA (cómo es cada uno), PASEO (los que pasean, para las pruebas) y empezarPaseo,
 * moverPaseo, dibujaPaseo y tocarPaseo (los usa SCENES.excursion de escenas/excursion.ts).
 * Importa: el núcleo (dibujo, voz, sonido) y el azar de los puertos.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, colores y velocidades en la pantalla de 1600x900,
   como en el resto de las escenas. */
import { ONO, T, ctx, dist, pic, playSound, say } from '../nucleo/indice.ts';
import { azar } from '../aplicacion/puertos.ts';

// dibujaCuerpo(x, y, w, h, color, cabeza, s): un animal de la granja de lado, entero: el cuerpo (centro x, y; ancho w y
// alto h) con sus patas y su cola, y delante, arriba a la izquierda, el dibujo de su cabeza (cabeza, de tamaño s). La
// vaca (cuerpo blanco) lleva además sus manchas negras. Las patas y el trazo crecen con el cuerpo.
export function dibujaCuerpo(
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  cabeza: string,
  s: number,
): void {
  const pata = w * 0.095;
  ctx.save();
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = Math.max(3, w * 0.016);
  ctx.fillStyle = color;
  [-0.36, -0.2, 0.22, 0.38].forEach((d) => {
    ctx.fillRect(x + d * w - pata / 2, y, pata, h * 0.95);
    ctx.strokeRect(x + d * w - pata / 2, y, pata, h * 0.95);
  });
  ctx.beginPath();
  ctx.moveTo(x + w * 0.48, y - h * 0.2);
  ctx.quadraticCurveTo(x + w * 0.62, y, x + w * 0.56, y + h * 0.45);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (cabeza === 'vaca')
    [
      [-0.15, -0.1, 0.12],
      [0.2, 0.15, 0.1],
      [0.05, -0.25, 0.07],
    ].forEach(([dx = 0, dy = 0, r = 0]) => {
      ctx.fillStyle = '#2E2A2A';
      ctx.beginPath();
      ctx.ellipse(x + dx * w, y + dy * h, r * w, r * w * 0.7, 0.3, 0, Math.PI * 2);
      ctx.fill();
    });
  ctx.restore();
  pic(cabeza, x - w * 0.55, y - h * 0.55, s);
}

/** Cómo es un animal recortable: su dibujo (y sonido), su tamaño (s: el del dibujo; con cuerpo, el de la cabeza), el
 * cuerpo si su dibujo es solo la cabeza, y lo deprisa que anda (puntos por segundo). Todos miran a la izquierda. */
interface AnimalGranja {
  readonly k: string;
  readonly s: number;
  readonly cuerpo?: { readonly w: number; readonly h: number; readonly color: string };
  readonly v: number;
}
// ANIMALES_GRANJA: los animales recortables, por su clave.
export const ANIMALES_GRANJA: Readonly<Record<string, AnimalGranja>> = {
  vaca: { k: 'vaca', s: 120, cuerpo: { w: 190, h: 85, color: '#FFFFFF' }, v: 45 },
  caballo: { k: 'caballo', s: 165, cuerpo: { w: 210, h: 95, color: '#B9773E' }, v: 70 },
  cerdo: { k: 'cerdo', s: 100, cuerpo: { w: 140, h: 70, color: '#F6B5C8' }, v: 55 },
  oveja: { k: 'oveja', s: 150, v: 45 },
  gallina: { k: 'gallina', s: 110, v: 80 },
  pollito: { k: 'pollito', s: 70, v: 90 },
  pato: { k: 'pato', s: 105, v: 60 },
};
// PRADO: por dónde pasean los animales en el plano (los pies; las estaciones quedan por encima).
const PRADO = { x0: 160, x1: 1440, y0: 440, y1: 830 };

/** Un animal que pasea: cómo es, dónde tiene los pies, adónde va, hacia dónde mira (-1 izquierda, 1 derecha), su
 * paso (para que no salten todos a la vez), cuándo lo han tocado y hasta cuándo se queda parado. */
interface Paseante {
  readonly a: AnimalGranja;
  x: number;
  y: number;
  tx: number;
  ty: number;
  dir: number;
  readonly fase: number;
  salto: number;
  hasta: number;
}
// PASEO: los animales que pasean ahora, de qué excursión son y cuándo se movieron por última vez.
export const PASEO = { animales: [] as Paseante[], de: '', ultimo: 0 };

// sitioAlAzar(): un punto del prado al azar.
const sitioAlAzar = () => ({
  x: PRADO.x0 + azar() * (PRADO.x1 - PRADO.x0),
  y: PRADO.y0 + azar() * (PRADO.y1 - PRADO.y0),
});

// empezarPaseo(id, claves): saca a pasear los animales de la lista claves (los que tienen recortable) por el prado de
// la excursión id, cada uno en un sitio al azar. Si ya paseaban los de esa excursión, siguen donde estaban.
export function empezarPaseo(id: string, claves: readonly string[]): void {
  PASEO.ultimo = T;
  if (PASEO.de === id && PASEO.animales.length) return;
  PASEO.de = id;
  PASEO.animales = claves
    .map((k) => ANIMALES_GRANJA[k])
    .filter((a): a is AnimalGranja => !!a)
    .map((a) => {
      const p = sitioAlAzar(),
        t = sitioAlAzar();
      return { a, x: p.x, y: p.y, tx: t.x, ty: t.y, dir: -1, fase: azar() * 6, salto: -9, hasta: 0 };
    });
}

// moverPaseo(): cada animal anda hacia su sitio (mirando hacia donde va); al llegar, se queda parado de 1 a 4 segundos
// y elige otro sitio del prado.
export function moverPaseo(): void {
  const dt = Math.min(0.05, Math.max(0, T - PASEO.ultimo));
  PASEO.ultimo = T;
  PASEO.animales.forEach((p) => {
    if (T < p.hasta) return;
    const d = dist(p.x, p.y, p.tx, p.ty);
    if (d < 4) {
      const t = sitioAlAzar();
      Object.assign(p, { tx: t.x, ty: t.y, hasta: T + 1 + azar() * 3 });
      return;
    }
    const paso = Math.min(d, p.a.v * dt);
    Object.assign(p, {
      dir: Math.abs(p.tx - p.x) > 2 ? Math.sign(p.tx - p.x) : p.dir,
      x: p.x + ((p.tx - p.x) / d) * paso,
      y: p.y + ((p.ty - p.y) / d) * paso,
    });
  });
}

// altoDe(a): lo alto que es el animal a sobre sus pies (para el salto, el toque y la sombra).
const altoDe = (a: AnimalGranja): number => (a.cuerpo ? a.cuerpo.h * 1.5 + a.s * 0.5 : a.s);
// anchoDe(a): lo ancho que es el animal a.
const anchoDe = (a: AnimalGranja): number => (a.cuerpo ? a.cuerpo.w * 1.2 : a.s);

// dibujaPaseante(p): el animal p con su sombra en los pies; si anda, da saltitos; si lo han tocado, un salto grande.
// Mira hacia donde va (los dibujos miran a la izquierda; a la derecha, se da la vuelta).
function dibujaPaseante(p: Paseante): void {
  const anda = T >= p.hasta && dist(p.x, p.y, p.tx, p.ty) >= 4,
    ts = T - p.salto,
    salto = ts < 0.6 ? Math.sin((ts / 0.6) * Math.PI) * 70 : 0,
    bote = anda ? Math.abs(Math.sin(T * 9 + p.fase)) * 8 : 0,
    w = anchoDe(p.a);
  ctx.save();
  ctx.fillStyle = 'rgba(60,90,40,0.25)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, w * 0.45 * (1 - salto / 200), 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(p.x, p.y - bote - salto);
  ctx.scale(-p.dir, 1);
  const c = p.a.cuerpo;
  if (c) dibujaCuerpo(0, -c.h * 0.95, c.w, c.h, c.color, p.a.k, p.a.s);
  else pic(p.a.k, 0, -p.a.s / 2, p.a.s);
  ctx.restore();
}

// dibujaPaseo(): los animales que pasean, de atrás (más arriba) a delante.
export function dibujaPaseo(): void {
  [...PASEO.animales].sort((a, b) => a.y - b.y).forEach(dibujaPaseante);
}

// tocarPaseo(x, y): si en (x, y) hay un animal (el de más delante), salta y hace su sonido y su onomatopeya. Devuelve
// si había alguno.
export function tocarPaseo(x: number, y: number): boolean {
  const p = [...PASEO.animales]
    .sort((a, b) => b.y - a.y)
    .find((z) => Math.abs(x - z.x) < anchoDe(z.a) / 2 && y < z.y + 20 && y > z.y - altoDe(z.a));
  if (!p) return false;
  p.salto = T;
  playSound(p.a.k);
  say(ONO[p.a.k] ?? '');
  return true;
}
