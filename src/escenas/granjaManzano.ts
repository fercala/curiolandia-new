/*
 * escenas/granjaManzano.ts: el manzano de la granja escuela, que crece por días (base B4 de docs/IDEAS-MEJORA.md, fase
 * P8). La primera vez que se llega a la granja, Rosa planta una semilla junto al granero; cada día distinto que se
 * vuelve, el manzano cuenta un día (contarDia de dominio/crecer.ts, una sola vez al día) y crece por etapas (MANZANO
 * de dominio/excursiones.ts: semilla, brote, arbolito, árbol en flor y árbol con manzanas). Cuando crece, Rosa lo dice
 * al llegar. Al tocarlo, se mece y Tito dice cómo va; con manzanas, caen unas cuantas. Lo guardado, en S.crece.
 * Exporta: MANZANO_SITIO (dónde está, para las pruebas), etapaManzano, cuidarManzano, dibujaManzano y tocarManzano
 * (los usa SCENES.excursion de escenas/excursion.ts).
 * Importa: el núcleo (S, guardar, fecha, dibujo, voz, sonido), las reglas de dominio/crecer.ts y MANZANO de
 * dominio/excursiones.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños, colores y tiempos en la pantalla de 1600x900,
   como en el resto de las escenas. */
import { S, SFX, T, burst, circ, ctx, pic, save, say, sparkles, today } from '../nucleo/indice.ts';
import { contarDia, creceAl, crecimientoDe, etapaPorDias } from '../dominio/crecer.ts';
import { MANZANO } from '../dominio/excursiones.ts';

// MANZANO_SITIO: dónde está el manzano en el plano de la granja (el pie del tronco) y su radio para tocarlo.
export const MANZANO_SITIO = { x: 1480, y: 500, r: 110 };
// FRASES_CRECE: lo que dice Rosa al llegar el día en que el manzano pasa a cada etapa (de 1, brote, a 4, manzanas).
const FRASES_CRECE: readonly string[] = [
  '',
  '¡Mira el manzano! De la semilla ha salido un brote.',
  '¡El manzano ya es un arbolito! Sigue creciendo.',
  '¡El manzano está lleno de flores! Pronto saldrán manzanas.',
  '¡El manzano ya tiene manzanas! Tócalo para que caigan.',
];
// FRASES_TOCAR: lo que dice Tito al tocar el manzano en cada etapa (de 0, semilla, a 4, manzanas).
const FRASES_TOCAR: readonly string[] = [
  'Aquí hemos plantado la semilla del manzano. Cada día que vengas a la granja crecerá un poco.',
  'Es un brote de manzano. Vuelve otro día y estará más grande.',
  'Es un arbolito. Cada día que vienes, crece un poco más.',
  '¡Qué flores tan bonitas! De las flores saldrán las manzanas.',
  '¡Manzanas! Se las llevamos a los animales.',
];
// arbol: lo que pasa en pantalla: desde cuándo se mece (al tocarlo) y desde cuándo caen manzanas.
const arbol = { mece: -9, caen: -9 };

// etapaManzano(): la etapa del manzano ahora (0 semilla a 4 con manzanas), según S.crece.
export const etapaManzano = (): number => etapaPorDias(crecimientoDe(S.crece, MANZANO.id).dias, MANZANO.dias);

// cuidarManzano(excId): al llegar a la excursión excId, si es la granja, el manzano cuenta el día de hoy (una vez al
// día) y se guarda. Devuelve lo que dice Rosa: al plantarlo (la primera vez) o si ha crecido; si no, ''.
export function cuidarManzano(excId: string): string {
  if (excId !== MANZANO.exc) return '';
  const antes = crecimientoDe(S.crece, MANZANO.id),
    r = contarDia(antes, today());
  if (!r.cuenta) return '';
  S.crece = { ...S.crece, [MANZANO.id]: { ...r.crecimiento } };
  save();
  if (!antes.dias)
    return 'Hoy plantamos una semilla de manzano junto al granero. Cada día que vuelvas, crecerá un poco.';
  return creceAl(antes.dias, r.crecimiento.dias, MANZANO.dias)
    ? (FRASES_CRECE[etapaPorDias(r.crecimiento.dias, MANZANO.dias)] ?? '')
    : '';
}

// copa(x, y, r, color): una bola de hojas (o de flores) de la copa del árbol.
function copa(x: number, y: number, r: number, color: string): void {
  circ(x, y, r, color, 5);
}

// dibujaManzano(): el manzano según su etapa, que se mece un poco con el viento (y más al tocarlo): el montoncito de
// tierra con la semilla, el brote, el arbolito, el árbol en flor y el árbol con manzanas (y las que caen).
export function dibujaManzano(): void {
  const e = etapaManzano(),
    { x, y } = MANZANO_SITIO,
    golpe = Math.max(0, 1 - (T - arbol.mece) * 1.5),
    giro = Math.sin(T * 1.3) * 0.02 + Math.sin(T * 14) * 0.08 * golpe;
  ctx.save();
  ctx.fillStyle = '#8A5A3A';
  ctx.beginPath();
  ctx.ellipse(x, y, 70, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (!e) {
    circ(x, y - 10, 12, '#6B4A2E', 3);
    pic('semilla', x + 50, y - 30, 50);
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(giro);
  const alto = [0, 50, 130, 190, 200][e] ?? 200,
    grueso = [0, 8, 16, 26, 28][e] ?? 28;
  ctx.fillStyle = '#8C5A34';
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 5;
  ctx.fillRect(-grueso / 2, -alto, grueso, alto);
  ctx.strokeRect(-grueso / 2, -alto, grueso, alto);
  if (e === 1) {
    copa(-16, -alto, 16, '#7CC86E');
    copa(16, -alto - 6, 16, '#7CC86E');
  } else {
    const r = e === 2 ? 55 : 85;
    copa(-r * 0.7, -alto, r * 0.8, '#5FAE4E');
    copa(r * 0.7, -alto, r * 0.8, '#5FAE4E');
    copa(0, -alto - r * 0.55, r, '#6CBD5A');
    if (e === 3)
      Array.from({ length: 9 }, (_, i) => i).forEach((i) =>
        circ(Math.cos(i * 2.4) * r * 0.9, -alto - r * 0.3 + Math.sin(i * 2.4) * r * 0.6, 9, '#FFD3E2', 3),
      );
    if (e === 4)
      Array.from({ length: 7 }, (_, i) => i).forEach((i) =>
        circ(Math.cos(i * 2.6) * r * 0.85, -alto - r * 0.3 + Math.sin(i * 2.6) * r * 0.55, 15, '#E8554E', 4),
      );
  }
  ctx.restore();
  const tc = T - arbol.caen;
  if (e === 4 && tc < 1.2)
    [-60, 10, 70].forEach((dx, i) => {
      const k = Math.min(1, Math.max(0, tc - i * 0.15) / 0.6);
      pic('manzana', x + dx, y - 230 + k * 230, 55);
    });
}

// tocarManzano(x, y): si se ha tocado el manzano, se mece y Tito dice cómo va; con manzanas, caen tres. Devuelve si se
// ha tocado.
export function tocarManzano(x: number, y: number): boolean {
  const { x: mx, y: my, r } = MANZANO_SITIO;
  if (Math.abs(x - mx) > r || y > my + 30 || y < my - 330) return false;
  const e = etapaManzano();
  arbol.mece = T;
  SFX.pop();
  sparkles(mx, my - 150, 6);
  if (e === 4) {
    arbol.caen = T;
    SFX.good();
    burst(mx, my - 40, 14);
  }
  say(FRASES_TOCAR[e] ?? '');
  return true;
}
