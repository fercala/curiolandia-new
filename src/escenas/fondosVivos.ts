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
 * Desde la v0.2.186 (mejoras 44 a 52), también: floresHierba (flores que se mecen en el cole y el patio), estanqueZoo
 * (brillos y ondas en el estanque del zoo), bancoPeces (un banco de pececitos en el acuario), reflejosVentanas (la luz
 * que cruza las ventanas de la ciudad de día), cangrejoPlaya, cometaPlanetario, veletaGranja, ardillaBosque y vaporPan
 * (el vapor del pan recién hecho del mercado).
 * Desde la v0.2.187 (mejoras 61 a 73): cometaCole, pompasPatio, patitosZoo, medusas, tortugaMarina, humoVolcan,
 * palomasCiudad, erizoBosque, abejaMercado, sateliteCupula, estrellasMarPlaya, espantapajaros y las mariquitas de
 * floresHierba.
 * Exporta: ventanasCiudad, orillaPlaya, rayosBosque, banderinesMercado, molinoGranja, nebulosas, motasSol, floresHierba,
 * estanqueZoo, bancoPeces, reflejosVentanas, cangrejoPlaya, cometaPlanetario, veletaGranja, ardillaBosque, vaporPan,
 * cometaCole, pompasPatio, patitosZoo, medusas, tortugaMarina, humoVolcan, palomasCiudad, erizoBosque, abejaMercado,
 * sateliteCupula, estrellasMarPlaya y espantapajaros.
 */
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements -- es código de dibujo en el lienzo de
   1600x900: posiciones, tamaños, colores y tiempos. */
import { ctx, H, T, W } from '../nucleo/pantalla.ts';
import { PI } from '../nucleo/utilidades.ts';
import { K } from '../dibujos/todos.ts';
import { pic } from '../nucleo/imagenes.ts';
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

// COLORES_FLOR: los colores de los pétalos de las flores de la hierba, por turnos.
const COLORES_FLOR = ['#FF8A7A', '#FFD66B', '#B9A6F0', '#FFFFFF', '#7FD3F0'];

// floresHierba(sitios): una flor en cada sitio (x, y de la base del tallo): el tallo verde, cinco pétalos de color y el
// centro amarillo; se mecen con el viento, cada una a destiempo. Desde la mejora 73, con mariquitas que pasean.
export function floresHierba(sitios: readonly (readonly [number, number])[]): void {
  ctx.save();
  sitios.forEach(([x, y], i) => {
    const m = Math.sin(T * 1.6 + i * 1.1) * 0.18;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(m);
    ctx.strokeStyle = '#5DA34E';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -34);
    ctx.stroke();
    ctx.fillStyle = COLORES_FLOR[i % COLORES_FLOR.length]!;
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 8, -34 + Math.sin(a) * 8, 6.5, 0, PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#FFC93C';
    ctx.beginPath();
    ctx.arc(0, -34, 5, 0, PI * 2);
    ctx.fill();
    // desde la mejora gráfica 73, en una de cada tres flores pasea una mariquita alrededor de los pétalos
    if (i % 3 === 0) {
      const a = T * 0.8 + i;
      ctx.translate(Math.cos(a) * 10, -34 + Math.sin(a) * 10);
      ctx.fillStyle = '#E2574C';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, PI * 2);
      ctx.fill();
      ctx.fillStyle = K;
      ctx.beginPath();
      ctx.arc(-1.5, -1, 1.2, 0, PI * 2);
      ctx.arc(1.8, 1.2, 1.2, 0, PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
  ctx.restore();
}

// estanqueZoo(): el agua del estanque del zoo (la elipse de abajo a la izquierda, centro 70, 820): dos ondas que se
// abren y se desvanecen y unos destellos que se encienden y se apagan.
export function estanqueZoo(): void {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(70, 820, 147, 57, 0, 0, PI * 2);
  ctx.clip();
  [0, 0.5].forEach((f) => {
    const k = (T * 0.4 + f) % 1;
    ctx.strokeStyle = `rgba(255,255,255,${(0.7 * (1 - k)).toFixed(3)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(90, 815, 20 + k * 90, 8 + k * 34, 0, 0, PI * 2);
    ctx.stroke();
  });
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 5; i++) {
    const k = Math.sin(T * 1.7 + i * 2.4);
    if (k < 0.5) continue;
    ctx.globalAlpha = (k - 0.5) * 2;
    ctx.beginPath();
    ctx.ellipse(10 + i * 34, 795 + (i % 2) * 30, 9, 2.5, 0, 0, PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// bancoPeces(): un banco de diez pececitos amarillos que nadan juntos por el agua del acuario, de un lado a otro, por
// encima de la arena, ondulando como si fueran uno solo.
export function bancoPeces(): void {
  const vuelta = (T * 70) % (W + 600),
    x0 = vuelta - 300,
    y0 = 300 + Math.sin(T * 0.5) * 30;
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const x = x0 - (i % 4) * 34 - Math.floor(i / 4) * 18,
      y = y0 + (Math.floor(i / 4) - 1) * 26 + Math.sin(T * 2 + i) * 6;
    ctx.fillStyle = '#FFC93C';
    ctx.beginPath();
    ctx.ellipse(x, y, 13, 7, 0, 0, PI * 2);
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x - 22, y - 7 + Math.sin(T * 10 + i) * 2);
    ctx.lineTo(x - 22, y + 7 + Math.sin(T * 10 + i) * 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = K;
    ctx.beginPath();
    ctx.arc(x + 6, y - 1, 1.8, 0, PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// reflejosVentanas(): de día, una franja de luz blanca que cruza en diagonal las ventanas de cada edificio de la ciudad
// cada pocos segundos (cada edificio a destiempo), como el sol que se refleja en los cristales.
export function reflejosVentanas(): void {
  ctx.save();
  EDIFICIOS.forEach(([x, w, h], b) => {
    const k = ((T * 0.25 + b * 0.33) % 1) * 1.6 - 0.3,
      vw = (w - 44) / 3 - 16;
    ctx.save();
    ctx.beginPath();
    [0, 1].forEach((fila) =>
      [0, 1, 2].forEach((col) => ctx.rect(x + 22 + col * ((w - 44) / 3), 470 - h + 40 + fila * 80, vw, 50)),
    );
    ctx.clip();
    const fx = x + k * w,
      top = 470 - h + 40;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.moveTo(fx, top);
    ctx.lineTo(fx + 40, top);
    ctx.lineTo(fx - 60, top + 140);
    ctx.lineTo(fx - 100, top + 140);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

// cangrejoPlaya(): un cangrejo que pasea de lado por la arena de la playa, de un lado a otro, dando saltitos con las
// patas (va y vuelve entre x = 280 y x = 1250, abajo, lejos de la sombrilla).
export function cangrejoPlaya(): void {
  const x = 765 + Math.sin(T * 0.25) * 485,
    y = 860 - Math.abs(Math.sin(T * 8)) * 4;
  pic('cangrejo', x, y, 64);
}

// cometaPlanetario(): una vez cada 20 segundos, un cometa con su cola brillante que cruza despacio la cúpula del
// planetario de izquierda a derecha, en 10 s.
export function cometaPlanetario(): void {
  const t = (T + 5) % 20;
  if (t > 10) return;
  const k = t / 10,
    x = -100 + k * (W + 200),
    y = 80 + k * 140,
    g = ctx.createLinearGradient(x, y, x - 220, y - 50);
  g.addColorStop(0, 'rgba(190,230,255,0.8)');
  g.addColorStop(1, 'rgba(190,230,255,0)');
  ctx.save();
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y - 9);
  ctx.lineTo(x - 220, y - 62);
  ctx.lineTo(x - 220, y - 38);
  ctx.lineTo(x, y + 9);
  ctx.closePath();
  ctx.fill();
  halo(x, y, 30, '220,240,255', 0.8);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, PI * 2);
  ctx.fill();
  ctx.restore();
}

// veletaGranja(): la veleta de la granja, en su palo junto a la valla de la izquierda: la flecha con el gallo encima,
// que gira despacio con el viento (se ve de frente y de lado, se estrecha al girar).
export function veletaGranja(): void {
  const x = 180,
    y = 170,
    g = Math.cos(T * 0.6);
  ctx.save();
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, 262);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.translate(x, y);
  ctx.scale(g * 1.4, 1.4);
  ctx.fillStyle = '#4A4E66';
  ctx.beginPath();
  ctx.moveTo(-40, 0);
  ctx.lineTo(30, 0);
  ctx.lineTo(30, -6);
  ctx.lineTo(44, 2);
  ctx.lineTo(30, 10);
  ctx.lineTo(30, 4);
  ctx.lineTo(-40, 4);
  ctx.closePath();
  ctx.fill();
  // el gallo: el cuerpo, la cola y la cresta roja
  ctx.beginPath();
  ctx.ellipse(0, -16, 16, 12, 0, 0, PI * 2);
  ctx.moveTo(-12, -20);
  ctx.quadraticCurveTo(-30, -44, -14, -40);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12, -28, 7, 0, PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E2574C';
  ctx.beginPath();
  ctx.arc(13, -37, 4, 0, PI * 2);
  ctx.fill();
  ctx.restore();
}

// ardillaBosque(): una vez cada 12 segundos, una ardilla se asoma junto al tronco del árbol naranja del bosque (lejos del guía): sale,
// se queda un momento mirando y vuelve a esconderse.
export function ardillaBosque(): void {
  const t = T % 12;
  if (t > 5) return;
  const k = Math.min(1, t / 0.6, (5 - t) / 0.6);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, 470);
  ctx.clip();
  pic('ardilla', 445, 470 - k * 52 + Math.sin(T * 6) * 2, 72);
  ctx.restore();
}

// vaporPan(): el vapor del pan recién hecho del puesto de la panadería del mercado: tres hilillos grises claros que suben
// ondulando desde los panes y se deshacen arriba.
export function vaporPan(): void {
  ctx.save();
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  [700, 800, 900].forEach((x, i) => {
    const k = (T * 0.5 + i * 0.33) % 1;
    ctx.strokeStyle = `rgba(190,190,205,${(0.7 * Math.sin(k * PI)).toFixed(3)})`;
    ctx.beginPath();
    for (let j = 0; j <= 8; j++) {
      const yy = 280 - k * 30 - j * 11,
        xx = x + Math.sin(j * 0.9 + T * 2 + i) * 9;
      if (j) ctx.lineTo(xx, yy);
      else ctx.moveTo(xx, yy);
    }
    ctx.stroke();
  });
  ctx.restore();
}

// cometaCole(): una cometa roja y amarilla que vuela en el cielo del cole, a la izquierda, dando bandazos con el viento,
// con su cuerda que baja hacia la hierba.
export function cometaCole(): void {
  const x = 330 + Math.sin(T * 0.7) * 30,
    y = 150 + Math.sin(T * 1.1) * 18;
  ctx.save();
  ctx.strokeStyle = 'rgba(74,52,40,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 40);
  ctx.quadraticCurveTo(x - 40, y + 200, 220, 470);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(T * 1.3) * 0.2);
  pic('cometa', 0, 0, 90);
  ctx.restore();
}

// pompasPatio(): diez pompas de jabón que suben despacio por el patio meciéndose, con su brillo de colores y un reflejo
// blanco; cada una sale de abajo a su ritmo y se desvanece arriba.
export function pompasPatio(): void {
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const k = (T * (0.05 + (i % 3) * 0.015) + i * 0.1) % 1,
      x = 120 + ((i * 157) % (W - 240)) + Math.sin(T * 1.2 + i) * 30,
      y = H - k * (H - 120),
      r = 14 + (i % 4) * 5;
    ctx.globalAlpha = Math.min(1, k * 6, (1 - k) * 4) * 0.8;
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.1)');
    g.addColorStop(0.8, 'rgba(180,220,255,0.25)');
    g.addColorStop(1, 'rgba(255,170,230,0.6)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(x - r * 0.4, y - r * 0.4, r * 0.18, 0, PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// patitosZoo(): dos patitos amarillos que nadan en el estanque del zoo (abajo a la izquierda), de un lado a otro,
// meciéndose en el agua.
export function patitosZoo(): void {
  ctx.save();
  [0, 1].forEach((i) => {
    const d = Math.cos(T * 0.3 + i * 2),
      x = 70 + Math.sin(T * 0.3 + i * 2) * 80,
      y = 815 + i * 18 + Math.sin(T * 2 + i) * 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(d > 0 ? 1 : -1, 1);
    ctx.fillStyle = '#FFD84A';
    ctx.strokeStyle = K;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 9, 0, 0, PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(11, -11, 7, 0, PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FF8A3C';
    ctx.beginPath();
    ctx.moveTo(17, -12);
    ctx.lineTo(24, -10);
    ctx.lineTo(17, -8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = K;
    ctx.beginPath();
    ctx.arc(13, -13, 1.5, 0, PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

// MEDUSAS: las medusas del acuario: dónde están (x, y), su tamaño y su color («r,g,b»).
const MEDUSAS: readonly (readonly [number, number, number, string])[] = [
  [470, 200, 1, '255,170,220'],
  [1230, 260, 0.8, '190,170,255'],
];

// medusas(): las medusas del acuario, que laten (la campana se encoge y se estira) y suben y bajan despacio, con los
// tentáculos ondulando debajo.
export function medusas(): void {
  ctx.save();
  MEDUSAS.forEach(([x0, y0, s, c], i) => {
    const late = 1 + Math.sin(T * 2.5 + i) * 0.12,
      y = y0 + Math.sin(T * 0.6 + i * 2) * 30;
    ctx.save();
    ctx.translate(x0, y);
    ctx.scale(s, s);
    ctx.strokeStyle = `rgba(${c},0.8)`;
    ctx.lineWidth = 3;
    for (let t = 0; t < 4; t++) {
      ctx.beginPath();
      ctx.moveTo(-15 + t * 10, 0);
      for (let j = 1; j <= 5; j++) ctx.lineTo(-15 + t * 10 + Math.sin(T * 3 + j + t) * 5, j * 11);
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(${c},0.75)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 28 * late, 22 / late, 0, PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(-8, -10, 6, 4, -0.4, 0, PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

// tortugaMarina(): una vez cada 25 segundos, una tortuga marina verde que cruza nadando el acuario de derecha a
// izquierda en 15 s, moviendo las aletas.
export function tortugaMarina(): void {
  const t = (T + 8) % 25;
  if (t > 15) return;
  const x = W + 80 - (t / 15) * (W + 160),
    y = 140 + Math.sin(T * 0.8) * 15,
    a = Math.sin(T * 3) * 0.5;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#7CC86E';
  ctx.strokeStyle = K;
  ctx.lineWidth = 3;
  [-1, 1].forEach((sd) => {
    ctx.save();
    ctx.translate(-8, sd * 16);
    ctx.rotate(sd * (0.6 + a));
    ctx.beginPath();
    ctx.ellipse(-14, 0, 18, 6, 0, 0, PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
  ctx.beginPath();
  ctx.arc(-34, 0, 10, 0, PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#4F9A5A';
  ctx.beginPath();
  ctx.ellipse(0, 0, 30, 22, 0, 0, PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = K;
  ctx.beginPath();
  ctx.arc(-38, -3, 2, 0, PI * 2);
  ctx.fill();
  ctx.restore();
}

// humoVolcan(): el humito que sale del volcán del cuadro del museo (el cuadro de la izquierda, centro 380, 145): tres
// bolitas grises que suben, crecen y se desvanecen, sin salirse del marco.
export function humoVolcan(): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(296, 76, 168, 138);
  ctx.clip();
  for (let i = 0; i < 3; i++) {
    const k = (T * 0.35 + i / 3) % 1;
    ctx.globalAlpha = 0.7 * (1 - k);
    ctx.fillStyle = '#9AA3AD';
    ctx.beginPath();
    ctx.arc(380 + Math.sin(T + i) * 6 + k * 14, 112 - k * 34, 6 + k * 10, 0, PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// paloma(x, y, d, pica): una paloma gris de lado en (x, y), mirando a la derecha (d = 1) o a la izquierda (d = -1);
// con pica, agacha la cabeza a picotear.
function paloma(x: number, y: number, d: number, pica: boolean): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(d, 1);
  ctx.fillStyle = '#A8AEBC';
  ctx.strokeStyle = K;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 10, 0, 0, PI * 2);
  ctx.fill();
  ctx.stroke();
  const hy = pica ? 4 : -12;
  ctx.beginPath();
  ctx.arc(14, hy, 7, 0, PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFA94D';
  ctx.beginPath();
  ctx.moveTo(20, hy);
  ctx.lineTo(26, hy + 2);
  ctx.lineTo(20, hy + 3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#E2574C';
  ctx.beginPath();
  ctx.moveTo(-3, 9);
  ctx.lineTo(-3, 15);
  ctx.moveTo(4, 9);
  ctx.lineTo(4, 15);
  ctx.stroke();
  ctx.restore();
}

// palomasCiudad(): dos palomas que pasean por la acera de la ciudad, de un lado a otro, y de vez en cuando se paran a
// picotear el suelo.
export function palomasCiudad(): void {
  [0, 1].forEach((i) => {
    const f = T * 0.15 + i * 1.7,
      x = 760 + i * 220 + Math.sin(f) * 140,
      d = Math.cos(f) > 0 ? 1 : -1;
    paloma(x, 505, d, Math.sin(T * 2.3 + i * 2) > 0.6);
  });
}

// erizoBosque(): un erizo que pasea despacio por el suelo del bosque, abajo a la derecha, de un lado a otro.
export function erizoBosque(): void {
  const f = T * 0.12,
    x = 1150 + Math.sin(f) * 200,
    d = Math.cos(f) > 0 ? -1 : 1;
  ctx.save();
  ctx.translate(x, 868 - Math.abs(Math.sin(T * 6)) * 2);
  ctx.scale(d, 1);
  pic('erizo', 0, 0, 70);
  ctx.restore();
}

// abejaMercado(): una abeja que revolotea en ochos sobre la fruta de la frutería, con las alas que zumban.
export function abejaMercado(): void {
  const x = 290 + Math.sin(T * 0.9) * 150,
    y = 270 + Math.sin(T * 1.8) * 30;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  const a = Math.abs(Math.sin(T * 30));
  ctx.beginPath();
  ctx.ellipse(-3, -9, 6, 8 * a + 2, -0.3, 0, PI * 2);
  ctx.ellipse(4, -9, 6, 8 * a + 2, 0.3, 0, PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFC93C';
  ctx.strokeStyle = K;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 8, 0, 0, PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = K;
  ctx.fillRect(-3, -7, 3, 14);
  ctx.fillRect(4, -6, 2.5, 12);
  ctx.restore();
}

// sateliteCupula(): una vez cada 30 segundos, un satélite con sus dos paneles azules que cruza despacio la parte de
// abajo de la cúpula del planetario, de derecha a izquierda, girando un poco y con una lucecita que parpadea.
export function sateliteCupula(): void {
  const t = (T + 12) % 30;
  if (t > 18) return;
  const x = W + 80 - (t / 18) * (W + 160),
    y = 560 + Math.sin(T * 0.5) * 12;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(T * 0.4) * 0.3);
  ctx.strokeStyle = '#C9D1DB';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-40, 0);
  ctx.lineTo(40, 0);
  ctx.stroke();
  ctx.fillStyle = '#5B8DEF';
  ctx.fillRect(-62, -10, 26, 20);
  ctx.fillRect(36, -10, 26, 20);
  ctx.fillStyle = '#E8ECF2';
  ctx.fillRect(-12, -12, 24, 24);
  if (Math.sin(T * 6) > 0) halo(0, -16, 10, '255,90,90', 0.9);
  ctx.restore();
}

// ESTRELLAS_MAR: dónde están las estrellas de mar en la arena de la playa (x, y, tamaño).
const ESTRELLAS_MAR: readonly (readonly [number, number, number])[] = [
  [330, 820, 52],
  [1180, 880, 44],
  [620, 880, 38],
];

// estrellasMarPlaya(): las estrellas de mar en la arena de la playa, cada una con un destello que titila a destiempo.
export function estrellasMarPlaya(): void {
  ESTRELLAS_MAR.forEach(([x, y, s], i) => {
    pic('estrellaMar', x, y, s);
    const k = Math.sin(T * 1.6 + i * 2.2);
    if (k > 0.7) halo(x + s * 0.25, y - s * 0.25, 16, '255,255,255', (k - 0.7) * 3);
  });
}

// espantapajaros(): el espantapájaros de la granja, a la izquierda del prado: el palo, la camisa de cuadros, la cabeza
// de saco con su sombrero de paja y los brazos que se mueven con el viento.
export function espantapajaros(): void {
  const x = 70,
    y = 400,
    b = Math.sin(T * 1.4) * 0.25;
  ctx.save();
  ctx.strokeStyle = '#8A5A3C';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 110);
  ctx.stroke();
  ctx.translate(x, y - 80);
  [-1, 1].forEach((sd) => {
    ctx.save();
    ctx.rotate(sd * b);
    ctx.strokeStyle = '#5B8DEF';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(sd * 42, -6);
    ctx.stroke();
    ctx.restore();
  });
  ctx.fillStyle = '#5B8DEF';
  ctx.strokeStyle = K;
  ctx.lineWidth = 3;
  ctx.fillRect(-14, -8, 28, 40);
  ctx.strokeRect(-14, -8, 28, 40);
  ctx.fillStyle = '#E8D3A0';
  ctx.beginPath();
  ctx.arc(0, -22, 14, 0, PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#E8C25A';
  ctx.beginPath();
  ctx.ellipse(0, -34, 24, 5, 0, 0, PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillRect(-10, -46, 20, 12);
  ctx.strokeRect(-10, -46, 20, 12);
  ctx.fillStyle = K;
  ctx.beginPath();
  ctx.arc(-5, -23, 2, 0, PI * 2);
  ctx.arc(5, -23, 2, 0, PI * 2);
  ctx.fill();
  ctx.restore();
}
