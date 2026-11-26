/*
 * nucleo/paisaje.ts: el cielo y el paisaje de fondo de las escenas 2D de fuera (el cole, el patio y las excursiones),
 * desde las mejoras gráficas 1 y 2 de docs/MEJORAS-GRAFICAS.md (v0.2.183):
 *   - el cielo cambia con la hora como el del mapa 3D (dominio/luz.ts): el amanecer rosado, la tarde naranja y la noche
 *     azul oscuro con estrellas y la luna; de día, el sol y unas nubes que pasan despacio;
 *   - colinas al fondo en dos capas, más claras cuanto más lejos (se funden con el cielo), que se mueven un poco con el
 *     dedo o el ratón (paralaje): así el fondo tiene profundidad y no es un cielo y un suelo lisos;
 *   - veloHora(): el velo de la hora encima del suelo y del paisaje (antes de dibujar los botones, Tito y lo que se toca,
 *     que se siguen viendo con sus colores de siempre).
 *   - desde las mejoras gráficas 14 y 15, lo que cae del cielo según la estación (hojas, nieve o pétalos) y la vida del
 *     fondo: pájaros y mariposas de día y luciérnagas de noche.
 *   - desde las mejoras gráficas 21 a 25, lo que pasa en el cielo y en el suelo (nucleo/cieloVivo.ts): los rayos del
 *     sol, el arcoíris, el globo aerostático, las estrellas fugaces y las sombras de las nubes.
 *   - desde las mejoras 41 a 43, el avión con su estela, la bandada de pájaros y las nubes del color de la hora.
 *   - desde las mejoras 74 y 75, la Osa Mayor de noche y las ráfagas de viento con su remolino de hojas.
 * Exporta: momentoAhora, cieloExterior, veloHora y el tipo OpcionesCielo.
 */
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements -- es código de dibujo en el lienzo de
   1600x900: posiciones, tamaños, colores y tiempos, y bucles que dibujan estrellas, nubes y colinas. */
import { ctx, H, T, VIVO, W } from './pantalla.ts';
import { PI } from './utilidades.ts';
import { cloud } from './dibujo.ts';
import {
  arcoiris,
  avion,
  bandada,
  constelacion,
  estrellaFugaz,
  globoAerostatico,
  rafaga,
  rayosSol,
  sombrasNubes,
} from './cieloVivo.ts';
import { ahora } from '../aplicacion/puertos.ts';
import { VELO_LUZ, cieloDe, loQueCae, mezcla, momentoLuz, type MomentoLuz } from '../dominio/luz.ts';

/** Opciones de cieloExterior(): colinas al fondo (por defecto no), nubes (sí) y el sol o la luna (sí). */
export interface OpcionesCielo {
  colinas?: boolean;
  nubes?: boolean;
  astro?: boolean;
}

// momentoAhora(): el momento de luz de ahora (el amanecer, el día, la tarde o la noche), con la hora del reloj del juego.
export const momentoAhora = (): MomentoLuz => momentoLuz(ahora().getHours());

// horizonte: la línea del horizonte de la última escena que ha pintado su cielo (para los pájaros, las mariposas y las
// luciérnagas de vidaExterior).
let horizonte = 470;
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

// COLOR_NUBE: el color de las nubes de cada momento (mejora gráfica 43): rosadas al amanecer, anaranjadas por la tarde
// y blancas de día (de noche no hay nubes).
const COLOR_NUBE: Readonly<Record<MomentoLuz, string>> = {
  amanecer: '#FFE1EA',
  dia: '#FFFFFF',
  tarde: '#FFE0C4',
  noche: '#FFFFFF',
};

// cieloExterior(arriba, abajo, linea, o): el cielo de una escena de fuera con sus colores (arriba y abajo) hasta la
// línea del horizonte (linea, que se guarda en horizonte), cambiado según la hora (cieloDe); de noche, las estrellas; el sol o la luna (o.astro, sí por
// defecto); unas nubes que pasan despacio (o.nubes, sí por defecto; de noche no hay) y, con o.colinas, dos
// filas de colinas al fondo que se funden con el cielo y se mueven un poco con el puntero (la de delante, el doble).
// Desde las mejoras 21 a 25, también los rayos del sol, el arcoíris y el globo (de día) o la estrella fugaz (de noche);
// desde las 41 a 43, el avión, la bandada de pájaros y las nubes del color del momento (COLOR_NUBE); desde la 74, la
// Osa Mayor de noche.
export function cieloExterior(arriba: string, abajo: string, linea: number, o: OpcionesCielo = {}): void {
  horizonte = linea;
  const m = momentoAhora(),
    [a, b] = cieloDe(m, arriba, abajo),
    alto = Math.min(H, linea),
    g = ctx.createLinearGradient(0, 0, 0, alto);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, alto);
  if (m === 'noche') {
    estrellas(alto);
    constelacion(alto);
    estrellaFugaz(alto);
  } else {
    arcoiris(alto);
    if (o.astro !== false) rayosSol(1300, Math.max(60, Math.min(ASTRO[m].y(alto), alto - 70)), alto, m !== 'dia');
  }
  if (o.astro !== false) astro(m, alto);
  if (m !== 'noche') {
    globoAerostatico(alto);
    avion(alto);
    bandada(alto);
  }
  if (o.nubes !== false && m !== 'noche') {
    ctx.save();
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < 3; i++) {
      const x = ((T * (10 + i * 4) + i * 640) % (W + 400)) - 250,
        y = Math.min(70 + i * 55, alto - 90);
      if (y > 30) cloud(x, y, 0.7 + (i % 2) * 0.25, COLOR_NUBE[m]);
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
// botones, Tito y lo que se toca (de día no pone velo). Desde las mejoras gráficas 14 y 15, después dibuja lo que cae
// del cielo según la estación y la vida del fondo (vidaExterior), que se ven también de noche; y, de día, las sombras
// de las nubes por el suelo (mejora 21, sombrasNubes); y, desde la mejora 75, las ráfagas de viento (rafaga).
export function veloHora(): void {
  const m = momentoAhora(),
    v = VELO_LUZ[m];
  if (v.alfa) {
    ctx.save();
    ctx.globalAlpha = v.alfa;
    ctx.fillStyle = v.color;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (m !== 'noche') sombrasNubes(horizonte);
  estacion();
  rafaga(horizonte);
  vidaExterior(m);
}

// estacion(): lo que cae del cielo según el mes (loQueCae, dominio/luz.ts): 16 hojas naranjas y rojas que giran, copos
// de nieve o pétalos rosas, que bajan meciéndose por toda la pantalla, siempre igual (sin azar).
function estacion(): void {
  const q = loQueCae(ahora().getMonth());
  if (!q) return;
  ctx.save();
  for (let i = 0; i < 16; i++) {
    const v = 28 + (i % 5) * 9,
      y = ((T * v + i * 157) % (H + 80)) - 40,
      x = ((i * 233 + 40) % W) + Math.sin(T * 0.9 + i * 1.7) * 40;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(T * (0.8 + (i % 3) * 0.4) + i);
    if (q === 'nieve') {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 4 + (i % 3) * 2, 0, PI * 2);
      ctx.fill();
    } else {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = q === 'hojas' ? ['#E2574C', '#FFA94D', '#C98A4B'][i % 3]! : ['#F9B8D0', '#FFD0E0'][i % 2]!;
      ctx.beginPath();
      ctx.ellipse(0, 0, q === 'hojas' ? 10 : 7, q === 'hojas' ? 5 : 4, 0, 0, PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

// vidaExterior(m): la vida del fondo (mejora gráfica 15): de día, dos pájaros que cruzan el cielo aleteando por encima
// del horizonte y dos mariposas que revolotean por la hierba; de noche, luciérnagas que flotan y parpadean.
function vidaExterior(m: MomentoLuz): void {
  ctx.save();
  if (m === 'noche') {
    for (let i = 0; i < 12; i++) {
      const x = ((i * 271 + 90) % W) + Math.sin(T * 0.6 + i) * 30,
        y = horizonte + 60 + ((i * 113) % Math.max(60, H - horizonte - 160)) + Math.cos(T * 0.8 + i * 2) * 14,
        a = 0.35 + 0.65 * Math.abs(Math.sin(T * 2 + i * 1.3)),
        g = ctx.createRadialGradient(x, y, 0, x, y, 14);
      g.addColorStop(0, `rgba(255,240,120,${a.toFixed(3)})`);
      g.addColorStop(1, 'rgba(255,240,120,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 14, y - 14, 28, 28);
    }
  } else {
    ctx.strokeStyle = '#4A3428';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 2; i++) {
      const x = ((T * (60 + i * 25) + i * 900) % (W + 300)) - 150,
        y = Math.max(50, Math.min(140, horizonte - 120)) + i * 40 + Math.sin(T + i) * 10,
        ala = Math.sin(T * 9 + i * 2) * 8;
      ctx.beginPath();
      ctx.moveTo(x - 14, y - ala);
      ctx.quadraticCurveTo(x - 6, y - 6, x, y);
      ctx.quadraticCurveTo(x + 6, y - 6, x + 14, y - ala);
      ctx.stroke();
    }
    for (let i = 0; i < 2; i++) {
      const x = 300 + i * 900 + Math.sin(T * 0.5 + i * 3) * 220,
        y = Math.min(H - 140, horizonte + 90 + i * 60) + Math.sin(T * 1.7 + i) * 30,
        ab = Math.abs(Math.sin(T * 12 + i));
      ctx.fillStyle = i ? '#9B8AD9' : '#FFA94D';
      [-1, 1].forEach((sd) => {
        ctx.beginPath();
        ctx.ellipse(x + sd * 7 * ab, y, 8 * ab + 1, 10, sd * 0.4, 0, PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#4A3428';
      ctx.fillRect(x - 1.5, y - 7, 3, 14);
    }
  }
  ctx.restore();
}
