// Dibujos y efectos de las compras interactivas de Tito, dentro de la casa 2D.
// Se dibujan con el origen en el pie del objeto y leen su estado sin cambiar la partida.
/* eslint-disable ts-patterns/no-magic-numbers, ts-patterns/no-loop-statements -- posiciones y ritmos de dibujo */
import { K } from '../dibujos/todos.ts';
import { PI, T, circ, ctx, pic } from '../nucleo/indice.ts';

// Dibujo principal cuando un estado cambia el objeto entero. El catálogo sigue mostrando el dibujo original.
const DIBUJOS: Readonly<Record<string, readonly string[]>> = {
  brote: ['semilla', 'brote', 'plantaFlor'],
  cajaSorpresa: ['cajaSorpresaCerrada', 'cajaSorpresa'],
  grifo: ['grifoCerrado', 'grifo'],
  manguera: ['mangueraCerrada', 'manguera'],
  sarten: ['sartenVacia', 'sarten'],
  vaso: ['vasoVacio', 'vaso'],
};

// dibujoDeEstado(id, estado): clave del dibujo principal para la posición actual del objeto.
export function dibujoDeEstado(id: string, estado: number): string {
  return Object.hasOwn(DIBUJOS, id) ? (DIBUJOS[id][estado] ?? id) : id;
}

// chorro(x, y, alcance, alto, radio): dibuja gotas sobre un arco de agua de izquierda a derecha.
function chorro(x: number, y: number, alcance: number, alto: number, radio: number) {
  for (let i = 0; i < 5; i++) {
    const f = (T * 1.7 + i / 5) % 1;
    circ(x + alcance * f, y - alto * 4 * f * (1 - f) + radio * f, radio, '#7FD3F0', 1);
  }
}

// aspas(x, y, r, colores): aspas que giran en torno a su eje, para un molinillo o una rueda.
function aspas(x: number, y: number, r: number, colores: readonly string[]) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(T * 9);
  for (const color of colores) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r, -r * 0.45);
    ctx.quadraticCurveTo(r * 1.1, r * 0.2, r * 0.63, r * 0.3);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.rotate((2 * PI) / colores.length);
  }
  circ(0, 0, r * 0.17, '#FFF3BA', 2);
  ctx.restore();
}

// Cada efecto se coloca en la misma escala que el dibujo (marco de 124 px, centro en y = -52).
const EFECTOS: Readonly<Record<string, (estado: number) => void>> = {
  semaforo: (estado) => {
    const orden = [0, 2, 1];
    const colores = ['#FF5A5A', '#FFC93C', '#7CC86E'];
    [-38, -12, 14].forEach((y, i) => {
      const activo = i === orden[estado];
      circ(0, y - 52, 10, activo ? colores[i] : '#373B45', 3);
      if (activo) circ(-3, y - 55, 3, '#FFF6DC', 0);
    });
  },
  grifo: (estado) => {
    if (estado) chorro(30, -34, 8, 0, 4);
  },
  manguera: (estado) => {
    if (estado) chorro(40, -48, 32, 48, 3);
  },
  aspersor: (estado) => {
    if (!estado) return;
    chorro(-20, -73, -47, 32, 3);
    chorro(20, -73, 47, 32, 3);
  },
  bici: (estado) => {
    if (!estado) return;
    for (const x of [-32, 34]) aspas(x, -32, 19, ['#5BB8E6', '#7CC86E', '#FFC93C']);
  },
  molinillo: (estado) => {
    if (!estado) return;
    circ(0, -72, 46, '#E8FAF4', 0);
    aspas(0, -72, 43, ['#FF6B5E', '#FFC93C', '#5BB8E6']);
  },
  helicoptero: (estado) => {
    if (!estado) return;
    ctx.beginPath();
    ctx.ellipse(0, -92, 57, 8, 0, 0, 2 * PI);
    ctx.fillStyle = 'rgba(91,141,239,.45)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-52, -92 - Math.sin(T * 22) * 6);
    ctx.lineTo(52, -92 + Math.sin(T * 22) * 6);
    ctx.strokeStyle = K;
    ctx.lineWidth = 4;
    ctx.stroke();
  },
  lancha: (estado) => {
    if (!estado) return;
    for (let i = 0; i < 4; i++) {
      const x = -48 + ((T * 30 + i * 25) % 96);
      circ(x, -9 + Math.sin(T * 6 + i) * 5, 4, '#BFEAF7', 0);
    }
  },
  globoAire: (estado) => {
    if (!estado) return;
    const x = Math.sin(T * 2) * 8;
    circ(-40 + x, -19, 12, '#BFEAF7', 0);
    circ(-54 + x, -15, 9, '#BFEAF7', 0);
    circ(45 - x, -22, 11, '#FFFFFF', 0);
    circ(56 - x, -17, 8, '#FFFFFF', 0);
  },
  cepillo: (estado) => {
    if (!estado) return;
    for (let i = 0; i < 5; i++) {
      const y = -78 - ((T * 16 + i * 7) % 22);
      circ(22 + i * 5, y, 5 + (i % 2), '#E8FAFF', 2, '#7FD3F0');
    }
  },
  cajaMusica: (estado) => {
    if (!estado) return;
    const notas = estado === 1 ? [0, 1, 2] : [2, 0, 1];
    notas.forEach((n, i) => pic('notas', (i - 1) * 25, -101 - n * 8, 24));
  },
};

// efectosDeCompra(id, estado, tamano): superpone el estado activo a un artículo comprado.
export function efectosDeCompra(id: string, estado: number, tamano: number) {
  if (!Object.hasOwn(EFECTOS, id)) return;
  ctx.save();
  ctx.scale(tamano / 124, tamano / 124);
  EFECTOS[id](estado);
  ctx.restore();
}
