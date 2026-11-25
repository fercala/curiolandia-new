/*
 * nucleo/paisaje.ts: el cielo y el paisaje de fondo de las escenas 2D de fuera (el cole, el patio y las excursiones),
 * desde las mejoras gráficas 1 y 2 de docs/MEJORAS-GRAFICAS.md (v0.2.183):
 *   - el cielo cambia con la hora como el del mapa 3D (dominio/luz.ts): el amanecer rosado, la tarde naranja y la noche
 *     azul oscuro con estrellas y la luna; de día, el sol y unas nubes que pasan despacio;
 *   - colinas al fondo en dos capas, más claras cuanto más lejos (se funden con el cielo), que se mueven un poco con el
 *     dedo o el ratón (paralaje): así el fondo tiene profundidad y no es un cielo y un suelo lisos;
 *   - veloHora(): el velo de la hora encima del suelo y del paisaje (antes de dibujar los botones, Tito y lo que se toca,
 *     que se siguen viendo con sus colores de siempre).
 * Exporta: momentoAhora, cieloExterior, veloHora y el tipo OpcionesCielo.
 */
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements -- es código de dibujo en el lienzo de
   1600x900: posiciones, tamaños, colores y tiempos, y bucles que dibujan estrellas, nubes y colinas. */
import { ctx, H, T, VIVO, W } from './pantalla.ts';
import { PI } from './utilidades.ts';
import { cloud } from './dibujo.ts';
import { ahora } from '../aplicacion/puertos.ts';
import { VELO_LUZ, cieloDe, mezcla, momentoLuz, type MomentoLuz } from '../dominio/luz.ts';

/** Opciones de cieloExterior(): colinas al fondo (por defecto no), nubes (sí) y el sol o la luna (sí). */
export interface OpcionesCielo {
  colinas?: boolean;
  nubes?: boolean;
  astro?: boolean;
}

// momentoAhora(): el momento de luz de ahora (el amanecer, el día, la tarde o la noche), con la hora del reloj del juego.
export const momentoAhora = (): MomentoLuz => momentoLuz(ahora().getHours());

// pxSuave: el paralaje de ahora (de -1 a 1), que sigue al puntero poco a poco para que el fondo no dé saltos.
let pxSuave = 0;
// paralaje(): actualiza y devuelve el paralaje: -1 con el puntero a la izquierda, 1 a la derecha y 0 en el centro.
function paralaje(): number {
  const objetivo = ((VIVO.MX ?? W / 2) - W / 2) / (W / 2);
  pxSuave += (Math.max(-1, Math.min(1, objetivo)) - pxSuave) * 0.04;
  return pxSuave;
}

// estrellas(alto): de noche, 46 estrellas que titilan, repartidas siempre en los mismos sitios por encima de alto.
function estrellas(alto: number): void {
  ctx.fillStyle = '#FFF6D0';
  for (let i = 0; i < 46; i++) {
    const x = (i * 337 + 61) % W,
      y = 20 + ((i * 173) % Math.max(60, alto - 60)),
      r = 1.6 + (i % 3) * 0.9;
    ctx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(T * 1.3 + i * 1.7));
    ctx.beginPath();
    ctx.arc(x, y, r, 0, PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ASTRO: cómo es el sol o la luna de cada momento: a qué altura va (según el alto del cielo), su radio, su color y el de
// su halo (en «r,g,b»). Al amanecer y por la tarde, el sol va bajito y es más naranja.
const ASTRO: Readonly<Record<MomentoLuz, { y: (alto: number) => number; r: number; color: string; halo: string }>> = {
  amanecer: { y: (alto) => alto - 70, r: 46, color: '#FFB45E', halo: '255,170,90' },
  dia: { y: (alto) => Math.min(100, alto * 0.38), r: 46, color: '#FFD66B', halo: '255,230,120' },
  tarde: { y: (alto) => alto - 70, r: 46, color: '#FFB45E', halo: '255,170,90' },
  noche: { y: (alto) => Math.min(110, alto * 0.4), r: 38, color: '#FFF3B8', halo: '255,246,200' },
};
// astro(m, alto): el sol (de día, alto; al amanecer y por la tarde, bajito y más cálido) o la luna en cuarto creciente
// (de noche), a la derecha del cielo, con un halo suave.
function astro(m: MomentoLuz, alto: number): void {
  const A = ASTRO[m],
    x = 1300,
    y = Math.max(60, Math.min(A.y(alto), alto - 70)),
    halo = ctx.createRadialGradient(x, y, A.r * 0.6, x, y, A.r * 2.6);
  halo.addColorStop(0, `rgba(${A.halo},.45)`);
  halo.addColorStop(1, `rgba(${A.halo},0)`);
  ctx.fillStyle = halo;
  ctx.fillRect(x - A.r * 3, y - A.r * 3, A.r * 6, A.r * 6);
  ctx.beginPath();
  ctx.arc(x, y, A.r, 0, PI * 2);
  ctx.fillStyle = A.color;
  ctx.fill();
  if (m === 'noche') {
    // el cuarto creciente: un círculo del color del cielo tapa un trozo de la luna
    const [arriba] = cieloDe('noche', '#BFE3FF', '#E6F5FF');
    ctx.beginPath();
    ctx.arc(x + A.r * 0.45, y - A.r * 0.2, A.r * 0.85, 0, PI * 2);
    ctx.fillStyle = arriba;
    ctx.fill();
  }
}

// colina(base, alto, fase, color, dx): una fila de colinas suaves (suma de dos ondas) que se apoya en la línea base;
// dx la mueve a los lados (paralaje). Baja 40 px por debajo de la base para que no quede ninguna raya.
function colina(base: number, alto: number, fase: number, color: string, dx: number): void {
  ctx.beginPath();
  ctx.moveTo(-60, base + 40);
  for (let x = -60; x <= W + 60; x += 20) {
    const y = base - alto * (0.55 + 0.3 * Math.sin((x + fase) / 210) + 0.15 * Math.sin((x + fase * 2) / 97));
    ctx.lineTo(x + dx, y);
  }
  ctx.lineTo(W + 60, base + 40);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

// cieloExterior(arriba, abajo, horizonte, o): el cielo de una escena de fuera con sus colores (arriba y abajo) hasta la
// línea del horizonte, cambiado según la hora (cieloDe); de noche, las estrellas; el sol o la luna (o.astro, sí por
// defecto); unas nubes que pasan despacio (o.nubes, sí por defecto; de noche no hay) y, con o.colinas, dos
// filas de colinas al fondo que se funden con el cielo y se mueven un poco con el puntero (la de delante, el doble).
export function cieloExterior(arriba: string, abajo: string, horizonte: number, o: OpcionesCielo = {}): void {
  const m = momentoAhora(),
    [a, b] = cieloDe(m, arriba, abajo),
    alto = Math.min(H, horizonte),
    g = ctx.createLinearGradient(0, 0, 0, alto);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, alto);
  if (m === 'noche') estrellas(alto);
  if (o.astro !== false) astro(m, alto);
  if (o.nubes !== false && m !== 'noche') {
    ctx.save();
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < 3; i++) {
      const x = ((T * (10 + i * 4) + i * 640) % (W + 400)) - 250,
        y = Math.min(70 + i * 55, alto - 90);
      if (y > 30) cloud(x, y, 0.7 + (i % 2) * 0.25, '#FFFFFF');
    }
    ctx.restore();
  }
  if (o.colinas) {
    const p = paralaje(),
      verde = m === 'noche' ? '#5E7A8C' : '#9BD47F';
    colina(alto, 120, 0, mezcla(verde, b, 0.6), -p * 14);
    colina(alto, 70, 380, mezcla(verde, b, 0.32), -p * 30);
  }
}

// veloHora(): el velo del momento de luz (VELO_LUZ) sobre toda la escena: se llama al final del fondo, antes de los
// botones, Tito y lo que se toca. De día no hace nada.
export function veloHora(): void {
  const v = VELO_LUZ[momentoAhora()];
  if (!v.alfa) return;
  ctx.save();
  ctx.globalAlpha = v.alfa;
  ctx.fillStyle = v.color;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
