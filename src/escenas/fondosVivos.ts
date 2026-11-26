/*
 * escenas/fondosVivos.ts: los detalles que dan vida a los fondos de las excursiones y de la casa de Tito (mejoras
 * gráficas 26 a 32 de docs/MEJORAS-GRAFICAS.md, v0.2.185):
 *   - ventanasCiudad: la ciudad de noche, con las ventanas encendidas y dos farolas con su halo;
 *   - orillaPlaya: la espuma de las olas que sube y baja en la orilla y los destellos del sol en el mar;
 *   - rayosBosque: rayos de sol que bajan en diagonal entre los árboles del bosque;
 *   - banderinesMercado: una guirnalda de banderines de colores que se mecen encima del mercado;
 *   - molinoGranja: un molino de viento junto al granero, con las aspas girando;
 *   - nebulosas: nubes de colores que laten en la cúpula del planetario (y una estrella fugaz, de nucleo/cieloVivo.ts);
 *   - motasSol: motas doradas que flotan en el rayo de sol que entra por la ventana de la casa.
 * Las llaman los fondos de escenas/excursion.ts y la luz de la casa (luzHabitacion, escenas/casa.ts). Todo va con T y
 * fórmulas fijas, sin azar.
 * Exporta: ventanasCiudad, orillaPlaya, rayosBosque, banderinesMercado, molinoGranja, nebulosas y motasSol.
 */
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements -- es código de dibujo en el lienzo de
   1600x900: posiciones, tamaños, colores y tiempos. */
import { ctx, H, T, W } from '../nucleo/pantalla.ts';
import { PI } from '../nucleo/utilidades.ts';
import { K } from '../dibujos/todos.ts';
import { estrellaFugaz } from '../nucleo/cieloVivo.ts';

// halo(x, y, r, c, a): un brillo redondo y suave de color c («r,g,b») y opacidad a en (x, y), de radio r.
function halo(x: number, y: number, r: number, c: string, a: number): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${c},${a.toFixed(3)})`);
  g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// EDIFICIOS: los edificios de la ciudad (x, ancho y alto), los mismos que dibuja fondoCiudad.
const EDIFICIOS: readonly (readonly [number, number, number])[] = [
  [150, 380, 300],
  [640, 300, 240],
  [1050, 360, 280],
];

// ventanasCiudad(): de noche, las ventanas de los edificios de la ciudad encendidas (amarillas, con un resplandor; unas
// pocas se apagan y se encienden despacio) y dos farolas en la acera con su halo. Se dibuja después del velo de la hora.
export function ventanasCiudad(): void {
  ctx.save();
  EDIFICIOS.forEach(([x, w, h], b) => {
    const vw = (w - 44) / 3 - 16;
    [0, 1].forEach((fila) =>
      [0, 1, 2].forEach((col) => {
        const n = b * 6 + fila * 3 + col,
          on = Math.sin(T * 0.3 + n * 2.1) > -0.7,
          vx = x + 22 + col * ((w - 44) / 3),
          vy = 470 - h + 40 + fila * 80;
        if (!on) return;
        halo(vx + vw / 2, vy + 25, 70, '255,210,120', 0.35);
        ctx.fillStyle = '#FFE59A';
        ctx.fillRect(vx + 3, vy + 3, vw - 6, 44);
      }),
    );
  });
  [520, 980].forEach((x) => {
    ctx.fillStyle = '#4A4E66';
    ctx.fillRect(x - 5, 330, 10, 160);
    halo(x, 330, 120, '255,214,130', 0.55);
    ctx.fillStyle = '#FFF3B0';
    ctx.beginPath();
    ctx.arc(x, 330, 14, 0, PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

// orillaPlaya(): la espuma blanca de la orilla de la playa (sobre la curva de la arena, de y = 430 en los lados a 410 en
// el centro), que sube y baja como las olas, y 12 destellos del sol que se encienden y se apagan sobre el mar.
export function orillaPlaya(): void {
  ctx.save();
  const sube = Math.sin(T * 0.9) * 10;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let x = 0; x <= W; x += 20) {
    const base = 430 - 40 * (x / W) * (1 - x / W) * 2 + sube,
      y = base + Math.sin(x / 45 + T * 2) * 4;
    if (x) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 12; i++) {
    const k = Math.sin(T * (1.4 + (i % 4) * 0.3) + i * 2.3);
    if (k < 0.6) continue;
    const x = (i * 271 + 120) % W,
      y = 240 + ((i * 97) % 150),
      r = (k - 0.6) * 22;
    ctx.globalAlpha = (k - 0.6) * 2.5;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.3, 0, 0, PI * 2);
    ctx.ellipse(x, y, r * 0.3, r * 0.8, 0, 0, PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// rayosBosque(): cuatro rayos de sol que bajan en diagonal entre los árboles del bosque (de arriba a la derecha hacia
// abajo a la izquierda), que brillan más y menos despacio y se apagan hacia el suelo.
export function rayosBosque(): void {
  ctx.save();
  [300, 650, 1000, 1350].forEach((x, i) => {
    const a = 0.16 + 0.08 * Math.sin(T * 0.6 + i * 1.9),
      g = ctx.createLinearGradient(x, 0, x - 260, H);
    g.addColorStop(0, `rgba(255,236,170,${a.toFixed(3)})`);
    g.addColorStop(1, 'rgba(255,236,170,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 90, 0);
    ctx.lineTo(x - 170, H);
    ctx.lineTo(x - 330, H);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

// COLORES_BANDERIN: los colores de los banderines, por turnos.
const COLORES_BANDERIN = ['#FF6B5E', '#FFC93C', '#7CC86E', '#5BB8E6', '#B9A6F0'];

// banderinesMercado(): una guirnalda de 14 banderines de colores colgada de lado a lado encima del mercado (la cuerda
// cae un poco en el centro) que se mecen con el viento, cada uno a destiempo.
export function banderinesMercado(): void {
  ctx.save();
  const y = (x: number): number => 22 + 36 * Math.sin((x / W) * PI);
  ctx.strokeStyle = K;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 40) {
    if (x) ctx.lineTo(x, y(x));
    else ctx.moveTo(x, y(x));
  }
  ctx.stroke();
  for (let i = 0; i < 14; i++) {
    const x = ((i + 0.5) * W) / 14,
      yy = y(x),
      m = Math.sin(T * 2.2 + i * 0.8) * 0.18;
    ctx.save();
    ctx.translate(x, yy);
    ctx.rotate(m);
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(22, 0);
    ctx.lineTo(0, 44);
    ctx.closePath();
    ctx.fillStyle = COLORES_BANDERIN[i % COLORES_BANDERIN.length]!;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// molinoGranja(): el molino de viento de la granja, a la izquierda del granero: la torre de madera, el eje y cuatro aspas
// que giran despacio.
export function molinoGranja(): void {
  const x = 1190,
    y = 150;
  ctx.save();
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 5;
  ctx.fillStyle = '#E8D3AD';
  ctx.beginPath();
  ctx.moveTo(x - 30, 262);
  ctx.lineTo(x - 14, y);
  ctx.lineTo(x + 14, y);
  ctx.lineTo(x + 30, 262);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.translate(x, y);
  ctx.rotate(T * 0.8);
  for (let i = 0; i < 4; i++) {
    ctx.rotate(PI / 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-7, -82, 14, 70);
    ctx.strokeRect(-7, -82, 14, 70);
  }
  ctx.fillStyle = '#C0392B';
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// NEBULOSAS: las nubes de colores del planetario: dónde están, su radio y su color («r,g,b»).
const NEBULOSAS: readonly (readonly [number, number, number, string])[] = [
  [480, 380, 260, '180,120,230'],
  [1150, 200, 220, '240,120,170'],
  [900, 620, 240, '90,170,230'],
];

// nebulosas(): las nubes de colores de la cúpula del planetario, que laten despacio y se mueven un poco, y una estrella
// fugaz de vez en cuando (estrellaFugaz). Van encima de las estrellas y debajo de los planetas.
export function nebulosas(): void {
  ctx.save();
  NEBULOSAS.forEach(([x, y, r, c], i) => {
    halo(x + Math.sin(T * 0.2 + i) * 20, y + Math.cos(T * 0.15 + i) * 12, r, c, 0.2 + 0.08 * Math.sin(T * 0.5 + i * 2));
  });
  ctx.restore();
  estrellaFugaz(H * 0.6);
}

// motasSol(): las motas de polvo doradas que flotan, suben despacio y brillan dentro del rayo de sol de la casa (el que
// entra por la ventana, de arriba a la derecha hacia abajo a la izquierda; luzHabitacion, escenas/casa.ts).
export function motasSol(): void {
  ctx.save();
  ctx.fillStyle = '#FFF3B0';
  for (let i = 0; i < 16; i++) {
    const k = (T * (0.02 + (i % 4) * 0.006) + i * 0.137) % 1,
      y = 880 - k * 700,
      borde = 1210 - ((y - 150) / 730) * 450,
      x = borde + 30 + ((i * 61) % 220) + Math.sin(T * 0.7 + i) * 14;
    ctx.globalAlpha = (0.35 + 0.5 * Math.abs(Math.sin(T * 1.2 + i * 1.7))) * Math.min(1, k * 5, (1 - k) * 5);
    ctx.beginPath();
    ctx.arc(x, y, 2.5 + (i % 3), 0, PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
