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
 *   - desde las mejoras 41 y 42 (v0.2.186), avion (un avión con su estela) y bandada (pájaros en V).
 *   - desde las mejoras 74 y 75 (v0.2.187), constelacion (la Osa Mayor de noche) y rafaga (un remolino de hojas).
 * Exporta: rayosSol, arcoiris, globoAerostatico, estrellaFugaz, sombrasNubes, avion, bandada, constelacion y rafaga.
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

// avion(alto): de día, una vez cada 75 segundos, un avioncito blanco que cruza alto el cielo de derecha a izquierda en
// 25 s, dejando una estela blanca que se deshace detrás.
export function avion(alto: number): void {
  const t = (T + 50) % 75;
  if (t > 25) return;
  const x = W + 60 - (t / 25) * (W + 400),
    y = Math.max(40, Math.min(70, alto - 200)),
    g = ctx.createLinearGradient(x, y, x + 320, y);
  g.addColorStop(0, 'rgba(255,255,255,0.8)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.save();
  ctx.strokeStyle = g;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 18, y);
  ctx.lineTo(x + 340, y + 6);
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#8A97A8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y, 20, 5, 0, 0, PI * 2);
  ctx.moveTo(x - 2, y);
  ctx.lineTo(x + 8, y - 12);
  ctx.lineTo(x + 12, y);
  ctx.moveTo(x + 14, y);
  ctx.lineTo(x + 20, y - 9);
  ctx.lineTo(x + 22, y);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// bandada(alto): de día, una vez cada 60 segundos, una bandada de siete pájaros en forma de V que cruza el cielo de
// izquierda a derecha en 30 s, aleteando cada uno a su ritmo, por encima del horizonte (alto).
export function bandada(alto: number): void {
  const t = (T + 15) % 60;
  if (t > 30) return;
  const x0 = -200 + (t / 30) * (W + 400),
    y0 = Math.max(60, Math.min(120, alto - 160)) + Math.sin(T * 0.5) * 8;
  ctx.save();
  ctx.strokeStyle = '#4A3428';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const fila = Math.ceil(i / 2),
      lado = i % 2 ? -1 : 1,
      x = x0 - fila * 34,
      y = y0 + lado * fila * 20,
      ala = Math.sin(T * 8 + i * 1.3) * 6;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - ala);
    ctx.quadraticCurveTo(x - 4, y - 4, x, y);
    ctx.quadraticCurveTo(x + 4, y - 4, x + 10, y - ala);
    ctx.stroke();
  }
  ctx.restore();
}

// OSA_MAYOR: las siete estrellas de la Osa Mayor (el carro), en el cielo de la izquierda (x, y desde arriba).
const OSA_MAYOR: readonly (readonly [number, number])[] = [
  [180, 150],
  [250, 140],
  [310, 160],
  [370, 175],
  [390, 230],
  [470, 240],
  [480, 180],
];

// constelacion(alto): de noche, la Osa Mayor: siete estrellas más grandes que titilan, unidas por líneas finas que
// brillan más y menos despacio (si el cielo es muy bajito, no se dibuja).
export function constelacion(alto: number): void {
  if (alto < 300) return;
  ctx.save();
  ctx.strokeStyle = `rgba(255,246,208,${(0.25 + 0.12 * Math.sin(T * 0.6)).toFixed(3)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  OSA_MAYOR.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.lineTo(OSA_MAYOR[3]![0], OSA_MAYOR[3]![1]);
  ctx.stroke();
  ctx.fillStyle = '#FFF6D0';
  OSA_MAYOR.forEach(([x, y], i) => {
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(T * 2 + i);
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

// COLORES_RAFAGA: los colores de las hojas que levanta el viento.
const COLORES_RAFAGA = ['#7CC86E', '#A6DB86', '#FFA94D', '#E2574C'];

// rafaga(horizonte): una vez cada 40 segundos, una ráfaga de viento: doce hojas que cruzan la pantalla de izquierda a
// derecha en 4 s, dando vueltas en remolino, por debajo del horizonte; y unas rayitas blancas de viento.
export function rafaga(horizonte: number): void {
  const t = (T + 20) % 40;
  if (t > 4) return;
  const k = t / 4;
  ctx.save();
  ctx.strokeStyle = `rgba(255,255,255,${(0.6 * Math.sin(k * PI)).toFixed(3)})`;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  [0, 1, 2].forEach((j) => {
    const x = -200 + k * (W + 400) - j * 120,
      y = horizonte + 60 + j * 70;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 60, y - 14, x + 130, y);
    ctx.stroke();
  });
  for (let i = 0; i < 12; i++) {
    const a = T * 5 + i,
      x = -100 + k * (W + 300) - (i % 6) * 50 + Math.cos(a) * 40,
      y = horizonte + 80 + Math.floor(i / 6) * 90 + Math.sin(a) * 40;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillStyle = COLORES_RAFAGA[i % COLORES_RAFAGA.length]!;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 5, 0, 0, PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
