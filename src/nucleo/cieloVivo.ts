/*
 * nucleo/cieloVivo.ts: lo que pasa en el cielo y en el suelo de las escenas 2D de fuera (mejoras gráficas 21 a 25 de
 * docs/MEJORAS-GRAFICAS.md, v0.2.185). Lo llama nucleo/paisaje.ts (cieloExterior y veloHora), así que sale en todas las
 * escenas que ya tienen el cielo de la hora (el cole, el patio y las excursiones de fuera):
 *   - rayosSol: rayos de luz suaves que bajan desde el sol y giran muy despacio (de día, al amanecer y por la tarde);
 *   - arcoiris: un arcoíris que aparece, se queda un rato y se desvanece, una vez cada dos minutos (de día);
 *   - globoAerostatico: un globo de rayas que cruza el cielo despacio, una vez cada minuto y medio (de día);
 *   - estrellaFugaz: de noche, una estrella fugaz con su estela cada pocos segundos;
 *   - sombrasNubes: de día, las sombras de las nubes que pasan despacio por el suelo.
 * Todo va con T (el reloj del juego) y fórmulas fijas, sin azar: así no cambia ninguna secuencia de azar de los juegos.
 * Exporta: rayosSol, arcoiris, globoAerostatico, estrellaFugaz y sombrasNubes.
 */
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements -- es código de dibujo en el lienzo de
   1600x900: posiciones, tamaños, colores y tiempos, y bucles que dibujan rayos y bandas. */
import { ctx, H, T, W } from './pantalla.ts';
import { PI } from './utilidades.ts';

// rayosSol(x, y, alto, calido): ocho rayos de luz que salen del sol en (x, y), giran muy despacio y se apagan hacia
// fuera; no bajan del horizonte (alto). Con calido (amanecer y tarde), son anaranjados.
export function rayosSol(x: number, y: number, alto: number, calido: boolean): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, alto);
  ctx.clip();
  const c = calido ? '255,190,110' : '255,240,170',
    g = ctx.createRadialGradient(x, y, 40, x, y, 520);
  g.addColorStop(0, `rgba(${c},0.32)`);
  g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g;
  for (let i = 0; i < 8; i++) {
    const a = T * 0.05 + (i / 8) * PI * 2,
      ancho = 0.07 + 0.03 * Math.sin(T * 0.7 + i);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a - ancho) * 520, y + Math.sin(a - ancho) * 520);
    ctx.lineTo(x + Math.cos(a + ancho) * 520, y + Math.sin(a + ancho) * 520);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ARCO: los colores del arcoíris, de fuera a dentro.
const ARCO = ['#FF6B5E', '#FFA94D', '#FFE45C', '#7CC86E', '#5BB8E6', '#9B8AD9'];

// arcoiris(alto): una vez cada 120 segundos (la primera, al minuto de jugar), un arcoíris a la izquierda del cielo que aparece en 3 s, se queda 14 s y
// se desvanece en otros 3; los pies quedan detrás de las colinas (en el horizonte, alto).
export function arcoiris(alto: number): void {
  const t = (T + 60) % 120;
  if (t > 20) return;
  const a = Math.min(1, t / 3, (20 - t) / 3) * 0.45;
  if (a <= 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, alto);
  ctx.clip();
  ctx.globalAlpha = a;
  ctx.lineWidth = 16;
  ARCO.forEach((c, i) => {
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.arc(420, alto + 40, 330 - i * 16, PI, PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}

// globoAerostatico(alto): una vez cada 90 segundos, un globo de rayas con su cesta que cruza el cielo de izquierda a
// derecha en 40 s, meciéndose, por encima del horizonte (alto).
export function globoAerostatico(alto: number): void {
  const t = (T + 30) % 90;
  if (t > 40) return;
  const x = -80 + (t / 40) * (W + 160),
    y = Math.max(70, Math.min(150, alto - 130)) + Math.sin(T * 0.8) * 10;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(T * 0.9) * 0.05);
  ctx.strokeStyle = '#4A3428';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-14, 26);
  ctx.lineTo(-8, 46);
  ctx.moveTo(14, 26);
  ctx.lineTo(8, 46);
  ctx.stroke();
  ctx.fillStyle = '#B5763F';
  ctx.fillRect(-10, 46, 20, 14);
  ['#FF6B5E', '#FFE45C', '#5BB8E6'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(0, 0, 30 - i * 10, 34, 0, 0, PI * 2);
    ctx.fill();
  });
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 34, 0, 0, PI * 2);
  ctx.stroke();
  ctx.restore();
}

// estrellaFugaz(alto): de noche, una estrella fugaz cada 7 segundos: cruza en 0,9 s en diagonal, hacia abajo a la
// izquierda, con una estela que se apaga; cada vez sale de un sitio distinto (fijo para cada vuelta).
export function estrellaFugaz(alto: number): void {
  const n = Math.floor(T / 7),
    t = T - n * 7;
  if (t > 0.9) return;
  const k = t / 0.9,
    x0 = 500 + ((n * 389) % 900),
    y0 = 30 + ((n * 157) % Math.max(40, alto * 0.4)),
    x = x0 - k * 360,
    y = y0 + k * 160,
    g = ctx.createLinearGradient(x, y, x + 140, y - 62);
  g.addColorStop(0, `rgba(255,250,220,${(1 - k).toFixed(3)})`);
  g.addColorStop(1, 'rgba(255,250,220,0)');
  ctx.save();
  ctx.strokeStyle = g;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 140, y - 62);
  ctx.stroke();
  ctx.fillStyle = `rgba(255,255,255,${(1 - k).toFixed(3)})`;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, PI * 2);
  ctx.fill();
  ctx.restore();
}

// sombrasNubes(alto): de día, tres sombras de nube (manchas alargadas, muy suaves) que pasan despacio de izquierda a
// derecha por el suelo, desde el horizonte (alto) hasta abajo.
export function sombrasNubes(alto: number): void {
  if (alto > H - 120) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, alto, W, H - alto);
  ctx.clip();
  for (let i = 0; i < 3; i++) {
    const x = ((T * (14 + i * 4) + i * 700) % (W + 800)) - 400,
      y = alto + 80 + ((i * 173) % Math.max(60, H - alto - 160)),
      g = ctx.createRadialGradient(x, y, 20, x, y, 260);
    g.addColorStop(0, 'rgba(40,60,90,0.12)');
    g.addColorStop(1, 'rgba(40,60,90,0)');
    ctx.fillStyle = g;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, 0.35);
    ctx.translate(-x, -y);
    ctx.fillRect(x - 260, y - 260, 520, 520);
    ctx.restore();
  }
  ctx.restore();
}
