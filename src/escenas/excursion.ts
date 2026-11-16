/*
 * escenas/excursion.ts: el motor de excursiones en pantalla (base B1 de docs/IDEAS-MEJORA.md, fase P5): el autobús del
 * cole (SCENES.autobus: se elige adónde ir y se viaja) y la escena genérica de una excursión (SCENES.excursion, con
 * {exc: id}): el plano del sitio con sus estaciones, el guía (en la granja, la granjera Rosa; desde la P17, en el zoo, el
 * cuidador Nico; desde la P18, en el acuario, la buceadora Marina; desde la P19, en el museo de los dinosaurios, el
 * paleontólogo Pablo; desde la P20, en la ciudad, la bombera Lucía) y Tito; al tocar una
 * estación jugable se va a su escena, y al volver (volverDeEstacion, {hecha: id}) se apunta. Cuando se han hecho todas
 * las estaciones que ya se pueden jugar, la foto de grupo: un flash, «¡Patata!» y la foto de recuerdo, y monedas la
 * primera vez de cada día. Las reglas, en dominio/excursiones.ts; los datos, en contenido/excursiones.ts; lo guardado, en
 * S.exc. Desde la fase P4, si la familia ha quitado los juegos de moverse, no cambia nada aquí (las excursiones no son de
 * moverse).
 * Exporta: fondoGranja (el fondo de la granja, que usan también sus estaciones), desde la P17 fondoZoo, fondoDe (el fondo
 * de cada excursión; desde la P18, también el del acuario, fondoAcuario, y desde la P19 el del museo, fondoMuseo, y desde la P20 el de la ciudad, fondoCiudad, y desde la P21 el del bosque, fondoBosque) y GRUPO_FOTO (los animales de la foto de grupo), DESTINOS (dónde está cada cartel del
 * autobús), ALBUM_EXC_BOTON (desde la P7, el botón del álbum de excursiones), sitioEstacion (lo mismo para las estaciones), volverDeEstacion y, desde la fase ID2f de docs/PLAN-IDIOMAS.md, nombreExcursion; pone SCENES.autobus y SCENES.excursion.
 * Importa: el núcleo (dibujo, voz, sonido, toque, Tito, monedas), las reglas de dominio/excursiones.ts y los datos de
 * contenido/excursiones.ts; desde la P7, los animales que pasean de escenas/granjaAnimales.ts, y desde la P8, el
 * manzano que crece por días de escenas/granjaManzano.ts, y desde la P9, las crías de escenas/granjaCrias.ts; desde la ID2f, el tipo Nombre de dominio/idiomas.ts; desde la P15, la cámara de fotos (escenas/fotos.ts y fotoDeMarca de dominio/fotos.ts).
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import type { OpcionesEscena } from '../nucleo/tipos.ts';
import {
  H,
  S,
  SCENES,
  SFX,
  T,
  VIVO,
  W,
  atHome,
  burst,
  card,
  circ,
  creditCoins,
  ctx,
  dist,
  drawCoinHUD,
  drawHome,
  drawTito,
  giveCoins,
  giveSticker,
  go,
  hC,
  hv,
  inCoinHUD,
  kid,
  later,
  noise,
  pic,
  save,
  say,
  sayQ,
  sceneName,
  sparkles,
  text,
  today,
  tone,
  fmt,
  nombreEn,
  tr,
} from '../nucleo/indice.ts';
import {
  type Estacion,
  type Excursion,
  estacionesJugables,
  siguienteEstacion,
  terminarEstacion,
  terminarVisita,
  visitaCompleta,
  visitaDe,
} from '../dominio/excursiones.ts';
import type { Nombre } from '../dominio/idiomas.ts';
import { EXCURSIONES, excursionPorId } from '../contenido/excursiones.ts';
import { animalEn, dibujaPaseo, empezarPaseo, moverPaseo, ponerCrias, tocarPaseo } from './granjaAnimales.ts';
import { camaraActiva, disparoVacio, dibujaCamara, hacerFotoDe, tocarBotonCamara } from './fotos.ts';
import { fotoDeMarca } from '../dominio/fotos.ts';
import { cuidarManzano, dibujaManzano, tocarManzano } from './granjaManzano.ts';
import { avisoCria, criasEnPaseo, dibujaBotonesCrias, tocarBotonesCrias } from './granjaCrias.ts';

/* ---------- lo común ---------- */

// cielo(a, b): el cielo con un degradado de arriba (a) abajo (b), hasta la línea del horizonte.
function cielo(a: string, b: string, alto: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, alto);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, alto);
}

// nombreExcursion(e): las formas (nombreEn) del nombre de la excursión e en el idioma del juego. El nombre se escribe
// con mayúscula ('La granja escuela') y la tabla de nombres lo guarda en minúscula, como los demás ('la granja escuela').
// Desde la fase ID2f de docs/PLAN-IDIOMAS.md; lo usa también el álbum de excursiones.
export const nombreExcursion = (e: Excursion): Nombre => nombreEn(e.nombre.charAt(0).toLowerCase() + e.nombre.slice(1));

// fondoGranja(): la granja: el cielo, el prado, el granero rojo con su tejado, la valla y el camino de tierra. Lo usan la
// excursión de la granja y sus estaciones.
export function fondoGranja(): void {
  cielo('#BFE3FF', '#E6F5FF', 300);
  ctx.fillStyle = '#A6DB86';
  ctx.fillRect(0, 280, W, H - 280);
  ctx.save();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#4A3B2A';
  // el granero, al fondo a la derecha
  ctx.fillStyle = '#D9534F';
  ctx.fillRect(1290, 130, 230, 170);
  ctx.strokeRect(1290, 130, 230, 170);
  ctx.beginPath();
  ctx.moveTo(1270, 140);
  ctx.lineTo(1405, 50);
  ctx.lineTo(1540, 140);
  ctx.closePath();
  ctx.fillStyle = '#8C3B2E';
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFF4E0';
  ctx.fillRect(1365, 200, 80, 100);
  ctx.strokeRect(1365, 200, 80, 100);
  // la valla, a lo largo del horizonte
  ctx.strokeStyle = '#B08A5A';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 262);
  ctx.lineTo(1270, 262);
  ctx.moveTo(0, 292);
  ctx.lineTo(1270, 292);
  ctx.stroke();
  Array.from({ length: 22 }, (_, i) => i * 60 + 20).forEach((x) => {
    ctx.fillStyle = '#C9A06A';
    ctx.fillRect(x - 7, 240, 14, 70);
  });
  ctx.restore();
}

// acacia(x, y): un árbol de la sabana: el tronco torcido y la copa ancha y plana (centro de la copa en x, y).
function acacia(x: number, y: number): void {
  ctx.save();
  ctx.strokeStyle = '#4A3B2A';
  ctx.lineWidth = 6;
  ctx.fillStyle = '#9C6B3F';
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 110);
  ctx.lineTo(x - 4, y + 10);
  ctx.lineTo(x + 10, y + 10);
  ctx.lineTo(x + 12, y + 110);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#7DB55A';
  ctx.beginPath();
  ctx.ellipse(x, y, 120, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// fondoZoo(): el zoo (desde la fase P17): el cielo, las rocas del fondo, la valla de bambú, las acacias, el estanque y,
// en el centro, el arco de la entrada con la cara del león. Lo usan la excursión del zoo y sus recintos (escenas/zoo.ts).
export function fondoZoo(): void {
  cielo('#BFE3FF', '#FFF1D6', 300);
  ctx.save();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#4A3B2A';
  // las rocas, al fondo a la izquierda
  ctx.fillStyle = '#D9B98A';
  ctx.beginPath();
  ctx.moveTo(0, 290);
  ctx.lineTo(150, 140);
  ctx.lineTo(280, 220);
  ctx.lineTo(400, 120);
  ctx.lineTo(560, 290);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#C7DC8A';
  ctx.fillRect(0, 280, W, H - 280);
  // el estanque, abajo a la izquierda
  ctx.fillStyle = '#8FD0F0';
  ctx.beginPath();
  ctx.ellipse(70, 820, 150, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // la valla de bambú, a lo largo del horizonte
  ctx.strokeStyle = '#8A7A3A';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 262);
  ctx.lineTo(1270, 262);
  ctx.stroke();
  Array.from({ length: 32 }, (_, i) => i * 40 + 10).forEach((x) => {
    ctx.fillStyle = '#D6C25E';
    ctx.fillRect(x - 6, 236, 12, 70);
    ctx.strokeRect(x - 6, 236, 12, 70);
  });
  ctx.restore();
  acacia(1000, 200);
  acacia(1240, 225);
  // el arco de la entrada, en el centro: dos columnas, el arco y la cara del león arriba
  ctx.save();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#4A3B2A';
  ctx.fillStyle = '#E8B84A';
  [540, 720].forEach((x) => {
    ctx.fillRect(x, 120, 50, 180);
    ctx.strokeRect(x, 120, 50, 180);
  });
  ctx.fillStyle = '#7CC86E';
  ctx.beginPath();
  ctx.moveTo(520, 140);
  ctx.quadraticCurveTo(655, 20, 790, 140);
  ctx.lineTo(790, 165);
  ctx.quadraticCurveTo(655, 55, 520, 165);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  pic('leon', 655, 85, 90);
}

// fondoAcuario(): el acuario (desde la fase P18): el túnel de cristal debajo del agua: el agua azul que se oscurece hacia
// arriba, los rayos de luz, los arcos del túnel, la arena con algas que se mecen, burbujas que suben y peces que pasan
// nadando por detrás (se mueven con T).
export function fondoAcuario(): void {
  cielo('#1F5F9E', '#5FB6E0', H);
  ctx.save();
  // los rayos de luz, desde arriba
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  [200, 650, 1100].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 160, 0);
    ctx.lineTo(x + 360, H);
    ctx.lineTo(x + 120, H);
    ctx.closePath();
    ctx.fill();
  });
  // los peces que pasan, en dos filas, unos hacia cada lado
  [
    ['pez', 150, 60, 1],
    ['pez', 250, 45, -1],
    ['delfin', 120, 90, 1],
    ['pez', 330, 50, -1],
  ].forEach(([k, y, v, d], i) => {
    const vel = (v as number) * (d as number),
      x = ((((T * vel + i * 420) % 1900) + 1900) % 1900) - 150;
    ctx.save();
    ctx.translate(x, (y as number) + Math.sin(T * 1.5 + i) * 10);
    ctx.scale(-(d as number), 1);
    pic(k as string, 0, 0, k === 'delfin' ? 130 : 80, 0.85);
    ctx.restore();
  });
  // la arena y las algas
  ctx.fillStyle = '#F2DDA4';
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.quadraticCurveTo(400, 430, 800, 470);
  ctx.quadraticCurveTo(1200, 510, W, 460);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4FA35A';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  [80, 210, 1450, 1540].forEach((x, i) => {
    ctx.beginPath();
    ctx.moveTo(x, 520);
    ctx.quadraticCurveTo(x + Math.sin(T * 1.2 + i) * 30, 420, x + Math.sin(T * 1.2 + i + 1) * 20, 330);
    ctx.stroke();
  });
  // los arcos del túnel de cristal
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 14;
  [0.7, 0.85, 1].forEach((k) => {
    ctx.beginPath();
    ctx.ellipse(W / 2, H + 40, (W / 2) * k + 120, (H - 40) * k, 0, Math.PI, 0);
    ctx.stroke();
  });
  // las burbujas que suben
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    const y = H - ((T * 60 + i * 97) % H),
      x = 100 + i * 150 + Math.sin(T * 2 + i) * 12;
    ctx.beginPath();
    ctx.arc(x, y, 6 + (i % 3) * 4, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}

// esqueleto(x, y, s): el esqueleto de un dinosaurio de cuello largo, de huesos blancos, en (x, y) (los pies) y de tamaño
// s: la columna en curva, las costillas, las patas, el cuello y la cabeza. Para el gran salón del museo.
function esqueleto(x: number, y: number, s: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // el contorno oscuro y, encima, el hueso claro
  [
    ['#7A6A52', 9],
    ['#FFF8E8', 5],
  ].forEach(([c, w]) => {
    ctx.strokeStyle = c as string;
    ctx.lineWidth = w as number;
    ctx.beginPath();
    // la columna: de la cola, por el lomo, al cuello y la cabeza
    ctx.moveTo(-150, -20);
    ctx.quadraticCurveTo(-60, -70, 20, -60);
    ctx.quadraticCurveTo(70, -60, 90, -120);
    ctx.quadraticCurveTo(100, -160, 130, -165);
    // las patas
    ctx.moveTo(-40, -62);
    ctx.lineTo(-45, 0);
    ctx.moveTo(-20, -64);
    ctx.lineTo(-10, 0);
    ctx.moveTo(30, -60);
    ctx.lineTo(25, 0);
    ctx.moveTo(50, -64);
    ctx.lineTo(60, 0);
    ctx.stroke();
    // las costillas
    [-30, -10, 10, 30].forEach((cx) => {
      ctx.beginPath();
      ctx.moveTo(cx, -63);
      ctx.quadraticCurveTo(cx - 10, -40, cx, -28);
      ctx.stroke();
    });
    // la cabeza
    ctx.beginPath();
    ctx.ellipse(140, -165, 16, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}

// fondoMuseo(): el museo de los dinosaurios (desde la fase P19): el gran salón, con la pared y sus columnas, los cuadros
// de los dinosaurios, el gran esqueleto en su tarima (a la izquierda), el pterodáctilo colgado del techo que se balancea (con T) y el
// suelo de baldosas.
export function fondoMuseo(): void {
  cielo('#F3E3C3', '#E8CFA0', 470);
  ctx.save();
  // el suelo de baldosas
  ctx.fillStyle = '#D9C3A0';
  ctx.fillRect(0, 470, W, H - 470);
  ctx.strokeStyle = 'rgba(122,106,82,0.35)';
  ctx.lineWidth = 3;
  [560, 680, 820].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  });
  Array.from({ length: 9 }, (_, i) => i).forEach((i) => {
    ctx.beginPath();
    ctx.moveTo(W / 2 + (i - 4) * 140, 470);
    ctx.lineTo(W / 2 + (i - 4) * 360, H);
    ctx.stroke();
  });
  // las columnas
  [70, 1530].forEach((x) => {
    ctx.fillStyle = '#FFF3DC';
    ctx.fillRect(x - 40, 60, 80, 410);
    ctx.fillStyle = '#E8D3AD';
    ctx.fillRect(x - 52, 40, 104, 30);
    ctx.fillRect(x - 52, 450, 104, 24);
  });
  // los cuadros
  [
    ['volcan', 380],
    ['triceratops', 1220],
  ].forEach(([k, x]) => {
    card((x as number) - 90, 70, 180, 150, '#FFFFFF', 6, 10);
    pic(k as string, x as number, 145, 120);
  });
  // la tarima y el gran esqueleto
  ctx.fillStyle = '#B88A55';
  ctx.beginPath();
  ctx.ellipse(330, 440, 230, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  esqueleto(310, 435, 125);
  // el pterodáctilo colgado del techo, en medio
  const bal = Math.sin(T * 1.2) * 0.12;
  ctx.save();
  ctx.translate(W / 2, 0);
  ctx.rotate(bal);
  ctx.strokeStyle = '#7A6A52';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 70);
  ctx.stroke();
  pic('pterodactilo', 0, 120, 120);
  ctx.restore();
}

// edificio(x, w, h, c, tejado): un edificio de la calle de la ciudad: la fachada de color c, ancho w y alto h sobre la
// acera (y = 470), con su tejado o cornisa y dos filas de ventanas.
function edificio(x: number, w: number, h: number, c: string, tejado: string): void {
  card(x, 470 - h, w, h, c, 5, 6);
  card(x - 10, 470 - h - 24, w + 20, 30, tejado, 5, 6);
  [0, 1].forEach((fila) =>
    [0, 1, 2].forEach((col) =>
      card(x + 22 + col * ((w - 44) / 3), 470 - h + 40 + fila * 80, (w - 44) / 3 - 16, 50, '#BFEAF7', 4, 4),
    ),
  );
}

// fondoCiudad(): la ciudad (desde la fase P20): el cielo, los edificios de la calle (el parque de bomberos rojo con su
// gran puerta, la panadería con su toldo de rayas y el centro de salud con su cruz), la acera, la carretera con el paso
// de cebra y el semáforo, y un coche que pasa (con T).
export function fondoCiudad(): void {
  cielo('#8FD3F5', '#DDF3FF', 470);
  ctx.save();
  // los edificios: el parque de bomberos, la panadería y el centro de salud
  edificio(150, 380, 300, '#E2574C', '#B8423A');
  card(230, 330, 220, 140, '#F4EBD0', 5, 10);
  [0, 1, 2].forEach((i) => card(240 + i * 70, 340, 60, 120, '#C9C1B4', 3, 4));
  edificio(640, 300, 240, '#FFE3B3', '#C98A4B');
  ['#FF6B5E', '#FFFFFF', '#FF6B5E', '#FFFFFF', '#FF6B5E'].forEach((c, i) => card(630 + i * 64, 300, 64, 40, c, 3, 0));
  pic('pan', 790, 420, 80);
  edificio(1050, 360, 280, '#FFFFFF', '#5BB8E6');
  card(1205, 210, 50, 120, '#5FC77A', 0, 4);
  card(1170, 245, 120, 50, '#5FC77A', 0, 4);
  // la acera y la carretera con el paso de cebra
  ctx.fillStyle = '#D9D2C6';
  ctx.fillRect(0, 470, W, 60);
  ctx.fillStyle = '#7A7A7A';
  ctx.fillRect(0, 530, W, H - 530);
  ctx.fillStyle = '#FFFFFF';
  Array.from({ length: 6 }, (_, i) => i).forEach((i) => ctx.fillRect(560 + i * 85, 560, 50, H - 580));
  ctx.restore();
  pic('semaforo', 1470, 380, 200);
  // el coche que pasa por la carretera, de izquierda a derecha
  pic('camion', ((T * 120) % 2000) - 200, 860, 150, 0.9);
}

// HOJAS_CAEN: las hojas que caen en el bosque de otoño: dibujo, columna (x), fase y velocidad.
const HOJAS_CAEN: readonly (readonly [string, number, number, number])[] = [
  ['hojaRoja', 180, 0, 70],
  ['hojaNaranja', 520, 0.3, 55],
  ['hojaMarron', 860, 0.6, 65],
  ['hojaRoja', 1120, 0.15, 60],
  ['hojaNaranja', 1420, 0.45, 75],
];

// arbolOtono(x, y, s, c): un árbol de otoño en (x, y) (la base del tronco), de tamaño s y copa de color c.
function arbolOtono(x: number, y: number, s: number, c: string): void {
  ctx.fillStyle = '#7A4E2E';
  ctx.fillRect(x - s * 0.08, y - s * 0.7, s * 0.16, s * 0.7);
  [
    [0, -0.85, 0.38],
    [-0.25, -0.68, 0.28],
    [0.25, -0.68, 0.28],
  ].forEach(([dx, dy, r]) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x + dx! * s, y + dy! * s, r! * s, 0, Math.PI * 2);
    ctx.fill();
  });
}

// fondoBosque(): el bosque de otoño (desde la fase P21): el cielo, los árboles rojos, naranjas y amarillos, el suelo
// lleno de hojas, el sendero, unas setas y las hojas que caen (con T).
export function fondoBosque(): void {
  cielo('#BFE3F2', '#F6E7C8', 470);
  ctx.save();
  // los árboles del fondo, más pequeños, y los de delante
  [
    [120, 470, 300, '#E2574C'],
    [400, 470, 260, '#FFA94D'],
    [700, 470, 300, '#FFC93C'],
    [1000, 470, 270, '#E08A4A'],
    [1290, 470, 310, '#E2574C'],
    [1520, 470, 260, '#FFA94D'],
  ].forEach(([x, y, t, c]) => arbolOtono(x as number, y as number, t as number, c as string));
  // el suelo y el sendero
  ctx.fillStyle = '#C9A15E';
  ctx.fillRect(0, 470, W, H - 470);
  ctx.fillStyle = '#E8D3A0';
  ctx.beginPath();
  ctx.moveTo(700, 470);
  ctx.quadraticCurveTo(500, 650, 640, H);
  ctx.lineTo(960, H);
  ctx.quadraticCurveTo(820, 650, 900, 470);
  ctx.closePath();
  ctx.fill();
  // hojitas en el suelo
  Array.from({ length: 24 }, (_, i) => i).forEach((i) => {
    ctx.fillStyle = ['#E2574C', '#FFA94D', '#C98A4B'][i % 3]!;
    ctx.beginPath();
    ctx.ellipse((i * 197) % W, 500 + ((i * 131) % 380), 14, 7, i, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
  pic('seta', 110, 820, 90);
  pic('seta', 1500, 840, 80);
  // las hojas que caen, meciéndose
  HOJAS_CAEN.forEach(([k, x, f, v]) => {
    const y = ((T * v + f * 900) % 1000) - 60;
    pic(k, x + Math.sin(T * 1.5 + f * 9) * 40, y, 50);
  });
}

// fondoDe(e): el fondo de la excursión e: el del zoo, el del acuario, el del museo, el de la ciudad, el del bosque o el
// de la granja (desde la fase P17; el álbum también lo usa).
export function fondoDe(e: Excursion): void {
  if (e.id === 'zoo') fondoZoo();
  else if (e.id === 'acuario') fondoAcuario();
  else if (e.id === 'museo') fondoMuseo();
  else if (e.id === 'ciudad') fondoCiudad();
  else if (e.id === 'bosque') fondoBosque();
  else fondoGranja();
}

// GRUPO_FOTO: los animales de la foto de grupo de cada excursión (dibujo, posición desde el centro de la foto y tamaño;
// desde la fase P17). La foto grande (dibujaFoto) y la pequeña del álbum de excursiones los usan.
export const GRUPO_FOTO: Readonly<Record<string, readonly (readonly [string, number, number, number])[]>> = {
  granja: [
    ['vaca', -220, 60, 200],
    ['cerdo', 230, 90, 150],
    ['gallina', 150, 20, 110],
  ],
  acuario: [
    ['delfin', -240, 30, 200],
    ['pulpo', 240, 90, 150],
    ['estrellaMar', 140, 110, 90],
  ],
  bosque: [
    ['ardilla', -240, 40, 180],
    ['buho', 240, 50, 150],
    ['conejo', 130, 100, 110],
  ],
  ciudad: [
    ['camionBomberos', -230, 40, 230],
    ['medico', 230, 60, 170],
    ['panadero', 120, 90, 120],
  ],
  museo: [
    ['diplodoco', -240, 20, 230],
    ['tiranosaurio', 240, 70, 170],
    ['triceratops', 130, 110, 110],
  ],
  zoo: [
    ['jirafa', -240, 20, 240],
    ['elefante', 240, 80, 160],
    ['pinguino', 140, 70, 110],
  ],
};

// caminoGranja(): el camino de tierra que une las estaciones del plano de la granja.
function caminoGranja(e: Excursion): void {
  ctx.save();
  ctx.strokeStyle = '#E8D3A8';
  ctx.lineWidth = 60;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  e.estaciones.forEach((s, i) => (i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)));
  ctx.stroke();
  ctx.restore();
}

/* ---------- el autobús ---------- */

/** Un cartel de destino del autobús: la excursión y dónde está. */
interface Destino {
  readonly e: Excursion;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}
// DESTINOS: los carteles del autobús, uno por excursión, en fila y centrados (desde la P19 caben cinco: los carteles se
// estrechan para que quepan todos con 40 de margen).
export const DESTINOS: readonly Destino[] = EXCURSIONES.map((e, i, todas) => {
  const sep = 50,
    w = Math.min(300, (W - 80 - (todas.length - 1) * sep) / todas.length),
    ancho = todas.length * w + (todas.length - 1) * sep;
  return { e, x: (W - ancho) / 2 + i * (w + sep), y: 230, w, h: 330 };
});
// enDestino(d, x, y): ¿se ha tocado el cartel d?
const enDestino = (d: Destino, x: number, y: number): boolean => x > d.x && x < d.x + d.w && y > d.y && y < d.y + d.h;

// ALBUM_EXC_BOTON: el botón del álbum de excursiones en el autobús (desde la P7; centro y radio).
export const ALBUM_EXC_BOTON = { x: 250, y: 110, r: 62 };

// dibujaBotonAlbum(): el botón del álbum de excursiones: un círculo blanco con un libro y «Álbum» debajo.
function dibujaBotonAlbum(): void {
  const b = ALBUM_EXC_BOTON,
    k = hv('bus:album', hC(b.x, b.y, b.r));
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.scale(k, k);
  circ(0, 0, b.r, '#fff', 6);
  pic('libro', 0, 0, 90);
  card(-58, b.r - 6, 116, 40, '#FFD66B', 4, 20);
  text('Álbum', 0, b.r + 22, 26);
  ctx.restore();
}

/** El estado del autobús: eligiendo destino o viajando (hacia la excursión id, desde T = t0). */
const bus = { fase: 'elige' as 'elige' | 'viaje', destino: '', t0: 0 };

// dibujaCarretera(v): el paisaje del viaje: el cielo, las colinas, la carretera con sus rayas y árboles que pasan (v:
// cuánto se ha avanzado).
function dibujaCarretera(v: number): void {
  cielo('#9ED6FF', '#E3F4FF', 520);
  ctx.fillStyle = '#9BD47A';
  ctx.beginPath();
  ctx.ellipse(400, 560, 600, 160, 0, Math.PI, 0);
  ctx.ellipse(1250, 560, 650, 200, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#A6DB86';
  ctx.fillRect(0, 520, W, 120);
  ctx.fillStyle = '#6B6B6B';
  ctx.fillRect(0, 640, W, 200);
  ctx.fillStyle = '#A6DB86';
  ctx.fillRect(0, 840, W, H - 840);
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    const x = ((((i * 200 - v * 3) % 2000) + 2000) % 2000) - 200;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, 735, 110, 14);
  });
  Array.from({ length: 7 }, (_, i) => i).forEach((i) => {
    const x = ((((i * 300 - v * 1.6) % 2100) + 2100) % 2100) - 250;
    pic('arbol', x, 520, 170);
  });
}

SCENES['autobus'] = {
  music: 'map',
  // enter(): el autobús espera con los carteles de las excursiones; Tito pregunta adónde vamos.
  enter() {
    Object.assign(bus, { fase: 'elige', destino: '', t0: T });
    later(400, () => this.prompt!());
  },
  // prompt(): la consigna, mientras se elige.
  prompt() {
    if (bus.fase === 'elige')
      say(fmt('¡Sube al autobús{nino}! ¿Adónde nos vamos de excursión? Toca un cartel.', { nino: kid() }));
  },
  // hint(): la primera excursión que ya se puede hacer.
  hint() {
    const d = DESTINOS.find((x) => estacionesJugables(x.e).length);
    return bus.fase === 'elige' && d ? { x: d.x + d.w / 2, y: d.y + d.h / 2, r: 120 } : null;
  },
  // dwell(id): dice el nombre de la excursión (o del álbum) bajo el ratón.
  dwell(id: string) {
    if (id === 'bus:album') say('El álbum de excursiones.');
    const d = DESTINOS.find((x) => 'bus:' + x.e.id === id);
    if (d) say(d.e.nombre + '.');
  },
  // update(): en el viaje, el motor suena de vez en cuando; a los 5 segundos se llega.
  update() {
    if (bus.fase !== 'viaje') return;
    VIVO.idle = 0;
    if (T - bus.t0 > 5.5 && sceneName === 'autobus') go('excursion', { exc: bus.destino, hello: true });
  },
  // draw(): eligiendo, los carteles (los que aún no tienen estaciones, en gris con «¡Muy pronto!») sobre la carretera y
  // el autobús parado; viajando, el autobús va dando botes por la carretera con el paisaje pasando.
  draw() {
    const viaje = bus.fase === 'viaje',
      t = T - bus.t0;
    dibujaCarretera(viaje ? t * 120 : 0);
    pic('autobus', viaje ? 800 : 1340, 690 + (viaje ? Math.sin(t * 18) * 5 : 0), viaje ? 420 : 300);
    if (!viaje)
      DESTINOS.forEach((d) => {
        const lista = estacionesJugables(d.e).length > 0,
          s = hv('bus:' + d.e.id, hC(d.x + d.w / 2, d.y + d.h / 2, d.w / 2));
        ctx.save();
        ctx.translate(d.x + d.w / 2, d.y + d.h / 2);
        ctx.scale(s, s);
        ctx.translate(-d.x - d.w / 2, -d.y - d.h / 2);
        card(d.x, d.y, d.w, d.h, lista ? '#fff' : '#EEE8DE', 6, 30);
        pic(d.e.icono, d.x + d.w / 2, d.y + 140, 190, lista ? 1 : 0.45);
        // los textos se encogen si no caben en su tarjeta (desde la fase ID3 de docs/PLAN-IDIOMAS.md)
        text(d.e.nombre, d.x + d.w / 2, d.y + d.h - 40, 30, lista ? '#4A3B2A' : '#9A9086', { max: d.w - 30 });
        if (!lista) {
          card(d.x + d.w / 2 - 100, d.y - 26, 200, 50, '#FFD66B', 5, 25);
          text('¡Muy pronto!', d.x + d.w / 2, d.y + 9, 28, undefined, { max: 180 });
        }
        ctx.restore();
      });
    else text('¡Nos vamos de excursión!', W / 2, 160, 56, '#4A3B2A');
    if (!viaje) dibujaBotonAlbum();
    drawHome();
    drawCoinHUD();
    if (!viaje) drawTito(60, 640, 200);
  },
  // down(x, y): casa -> el cole; monedas -> tienda; el álbum -> el álbum de excursiones; un cartel con estaciones -> ¡al
  // viaje!; uno sin -> «muy pronto».
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('cole');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (bus.fase !== 'elige') return;
    if (dist(x, y, ALBUM_EXC_BOTON.x, ALBUM_EXC_BOTON.y) < ALBUM_EXC_BOTON.r) {
      SFX.pop();
      go('albumExcursiones');
      return;
    }
    const d = DESTINOS.find((z) => enDestino(z, x, y));
    if (!d) {
      SFX.tap();
      sparkles(x, y);
      return;
    }
    if (!estacionesJugables(d.e).length) {
      SFX.boing();
      say(fmt('¡{Excursion} está en obras! Muy pronto podremos ir.', { excursion: nombreExcursion(d.e).art }));
      return;
    }
    SFX.pop();
    Object.assign(bus, { fase: 'viaje', destino: d.e.id, t0: T });
    tone(180, 0.5, 'sawtooth', 0.15);
    say(fmt('¡Nos vamos {excursion}! ¡Brum, brum!', { excursion: nombreExcursion(d.e).a }));
  },
};

/* ---------- la excursión ---------- */

/** El estado de la excursión en pantalla: cuál, si se está haciendo la foto de grupo (desde T = foto) o ya está. */
const exc = { id: 'granja', foto: -1, hecha: false };

// excursionActual(): la excursión que se está viendo (si el id no existe, la granja).
const excursionActual = (): Excursion => excursionPorId(exc.id) ?? EXCURSIONES[0]!;

// visitaActual(): lo guardado de la excursión que se está viendo (S.exc).
const visitaActual = () => visitaDe(S.exc, exc.id);

// guardarVisita(v): pone en S.exc lo guardado de la excursión que se está viendo y guarda.
function guardarVisita(v: ReturnType<typeof visitaDe>): void {
  S.exc = { ...S.exc, [exc.id]: { ...v, vistas: [...v.vistas] } };
  save();
}

// sitioEstacion(s): el círculo de la estación s en el plano (centro y radio).
export const sitioEstacion = (s: Estacion) => ({ x: s.x, y: s.y, r: 95 });

// volverDeEstacion(excId, estId): una estación ha terminado: vuelve al plano de la excursión, que la apunta como hecha.
export function volverDeEstacion(excId: string, estId: string): void {
  go('excursion', { exc: excId, hecha: estId });
}

// GUIA: dónde está el guía (la granjera) en el plano (centro y tamaño del dibujo).
const GUIA = { x: 800, y: 430, s: 230 };

// dibujaEstacion(s, v): el sitio de la estación s: un círculo blanco con su dibujo; si ya se ha hecho en esta visita,
// con un visto verde; si aún no se puede jugar, en gris con «¡Muy pronto!».
function dibujaEstacion(s: Estacion, hecha: boolean): void {
  const lista = !!s.escena,
    z = sitioEstacion(s),
    k = hv('exc:' + s.id, hC(z.x, z.y, z.r));
  ctx.save();
  ctx.translate(z.x, z.y);
  ctx.scale(k, k);
  circ(0, 0, z.r, lista ? '#fff' : '#EEE8DE', 6);
  pic(s.icono, 0, 0, 130, lista ? 1 : 0.4);
  if (hecha) {
    circ(62, -62, 30, '#7CC86E', 5);
    text('✓', 62, -50, 36, '#fff');
  }
  if (!lista) {
    card(-90, -z.r - 40, 180, 44, '#FFD66B', 5, 22);
    text('¡Muy pronto!', 0, -z.r - 9, 24, undefined, { max: 164 });
  }
  ctx.restore();
}

// dibujaFoto(): la foto de grupo: el flash al hacerla y, después, la foto de recuerdo (Tito, el guía y los animales de
// GRUPO_FOTO, con el fondo de la excursión) en un marco blanco un poco torcido.
function dibujaFoto(): void {
  const t = T - exc.foto;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2, 450);
  ctx.rotate(-0.04);
  card(-380, -300, 760, 600, '#fff', 6, 12);
  ctx.save();
  ctx.beginPath();
  ctx.rect(-340, -260, 680, 440);
  ctx.clip();
  ctx.translate(-W / 2, -450);
  fondoDe(excursionActual());
  ctx.restore();
  (GRUPO_FOTO[exc.id] ?? GRUPO_FOTO['granja']!).forEach(([k, x, y, t]) => pic(k, x, y, t));
  pic(excursionActual().guia, 30, -20, 260);
  drawTito(-200, -40, 180);
  text('¡Patata!', 0, 250, 48, '#4A3B2A');
  ctx.restore();
  if (t < 0.5) {
    ctx.fillStyle = `rgba(255,255,255,${1 - t * 2})`;
    ctx.fillRect(0, 0, W, H);
  }
}

// hacerFoto(): la visita está completa: la foto de grupo (flash y sonido de cámara), se apunta (terminarVisita), las
// monedas la primera vez de cada día y la despedida del guía. Desde la P7, la foto va al álbum de excursiones
// (SCENES.albumExcursiones) y la primera visita da la pegatina de la excursión (su dibujo, e.icono).
function hacerFoto(): void {
  const e = excursionActual(),
    r = terminarVisita(visitaActual(), today());
  exc.foto = T;
  guardarVisita(r.visita);
  if (r.monedas) {
    creditCoins(r.monedas);
    save();
  }
  noise(0.08, 0.5, 4000);
  SFX.tada();
  burst(W / 2, 400, 60);
  if (r.monedas) later(1200, () => giveCoins(r.monedas, W / 2, 450, undefined, true));
  const primera = r.visita.veces === 1;
  if (primera) {
    S.stk[e.icono] = (S.stk[e.icono] || 0) + 1;
    save();
  }
  say(
    fmt(
      '¡Una foto de grupo! ¡Patata! Ha sido una excursión estupenda. {guia} nos espera otro día en {excursion}. La foto se queda en el álbum de excursiones. Toca la casa para volver al cole.',
      { guia: e.nombreGuia, excursion: nombreExcursion(e).art },
    ),
    () => {
      if (primera && sceneName === 'excursion') giveSticker(e.icono, true);
    },
  );
}

// bienvenida(e): lo que dice el guía de la excursión e la primera vez que se va: la granjera Rosa en la granja y, desde
// la fase P17, el cuidador Nico en el zoo, y desde la P18, la buceadora Marina en el acuario, y desde la P19, el
// paleontólogo Pablo en el museo de los dinosaurios, y desde la P20, la bombera Lucía en la ciudad, y desde la P21, el
// guardabosques Hugo en el bosque de otoño.
function bienvenida(e: Excursion): string {
  if (e.id === 'bosque')
    return fmt(
      '¡Hola{nino}! Soy {guia}, el guardabosques. ¡Bienvenido al bosque de otoño! Vamos a ver los árboles, las hojas y los animales del bosque.',
      { nino: kid(), guia: e.nombreGuia },
    );
  if (e.id === 'ciudad')
    return fmt(
      '¡Hola{nino}! Soy {guia}, la bombera. ¡Bienvenido a la ciudad! Vamos a ver el parque de bomberos, la panadería y el centro de salud.',
      { nino: kid(), guia: e.nombreGuia },
    );
  if (e.id === 'museo')
    return fmt(
      '¡Hola{nino}! Soy {guia}, el paleontólogo del museo. ¡Bienvenido al museo de los dinosaurios! Los paleontólogos buscamos huesos de dinosaurio.',
      { nino: kid(), guia: e.nombreGuia },
    );
  if (e.id === 'acuario')
    return fmt(
      '¡Hola{nino}! Soy {guia}, la buceadora del acuario. ¡Bienvenido al acuario! Vamos a pasear por un túnel debajo del agua.',
      { nino: kid(), guia: e.nombreGuia },
    );
  if (e.id === 'zoo')
    return fmt(
      '¡Hola{nino}! Soy {guia}, el cuidador del zoo. ¡Bienvenido al zoo! Hoy vamos a visitar a los animales salvajes.',
      { nino: kid(), guia: e.nombreGuia },
    );
  return fmt(
    '¡Hola{nino}! Soy {guia}, la granjera. ¡Bienvenido a la granja escuela! Hoy vas a ayudarme a cuidar a los animales.',
    { nino: kid(), guia: e.nombreGuia },
  );
}

SCENES['excursion'] = {
  music: 'jardin',
  // enter(o): la excursión o.exc. Si se vuelve de una estación (o.hecha), se apunta; si con eso la visita está completa,
  // la foto de grupo. Si no, el guía saluda (la primera vez, presentándose, S.first['exc:' + id]) o dice qué toca; desde
  // la P8, en la granja el manzano cuenta el día y, si se planta o crece, el guía lo dice antes; desde la P9, las crías
  // salen a pasear con su madre y, si a una le toca nacer, el guía avisa.
  enter(o: OpcionesEscena) {
    Object.assign(exc, { id: o.exc || exc.id, foto: -1, hecha: false });
    const e = excursionActual();
    empezarPaseo(e.id, e.animales ?? []);
    if (e.id === 'granja') ponerCrias(criasEnPaseo());
    // el manzano de la granja cuenta el día (una vez al día); si se planta o crece, Rosa lo dice antes de lo que toca, y
    // si a una cría le toca nacer, también (desde la P9)
    const avisos = [cuidarManzano(e.id), e.id === 'granja' ? avisoCria() : ''].filter((t) => t).join(' '),
      luego = (): void => (avisos ? sayQ(avisos, () => this.prompt!()) : this.prompt!());
    if (o.hecha) {
      const v = terminarEstacion(visitaActual(), o.hecha);
      guardarVisita(v);
      if (visitaCompleta(e, v)) {
        later(600, () => hacerFoto());
        return;
      }
    }
    const clave = 'exc:' + e.id,
      primera = !S.first[clave];
    if (primera) {
      S.first[clave] = 1;
      save();
      later(500, () => sayQ(bienvenida(e), luego));
    } else later(500, luego);
  },
  // prompt(): lo que toca: la siguiente estación por hacer (o, tras la foto, volver).
  prompt() {
    if (exc.foto >= 0) {
      say('Toca la casa para volver al cole.');
      return;
    }
    const s = siguienteEstacion(excursionActual(), visitaActual());
    if (s) say(fmt('¡Vamos a {estacion}! Toca su dibujo.', { estacion: tr(s.nombre).toLowerCase() }));
  },
  // hint(): la siguiente estación por hacer; tras la foto, nada.
  hint() {
    const s = exc.foto < 0 ? siguienteEstacion(excursionActual(), visitaActual()) : undefined;
    return s ? sitioEstacion(s) : null;
  },
  // dwell(id): dice el nombre de la estación bajo el ratón.
  dwell(id: string) {
    const s = excursionActual().estaciones.find((x) => 'exc:' + x.id === id);
    if (s) say(s.nombre + '.');
  },
  // update(): los animales pasean por el prado (desde la P7).
  update() {
    moverPaseo();
  },
  // draw(): la granja, el camino, el manzano (en la granja), los animales que pasean, la estrella de la cría y el botón
  // de las familias, las estaciones, el guía y Tito; tras la visita completa, la
  // foto de grupo; si no, la cámara de fotos (desde la P15).
  draw() {
    const e = excursionActual(),
      v = visitaActual();
    fondoDe(e);
    caminoGranja(e);
    if (e.id === 'granja') dibujaManzano();
    dibujaPaseo();
    if (e.id === 'granja' && exc.foto < 0) dibujaBotonesCrias();
    e.estaciones.forEach((s) => dibujaEstacion(s, v.vistas.includes(s.id)));
    pic(e.guia, GUIA.x, GUIA.y + Math.sin(T * 2) * 4, GUIA.s);
    drawTito(560, 380, 170);
    if (exc.foto >= 0) dibujaFoto();
    drawHome();
    drawCoinHUD();
    if (exc.foto < 0) dibujaCamara(); // desde la fase P15, la cámara de fotos (para los animales que pasean)
  },
  // down(x, y): casa -> el cole; monedas -> tienda; una estación jugable -> su escena; una «muy pronto» -> el guía lo
  // dice; la cámara (desde la P15: su botón la enciende y, encendida, un toque a un animal le hace una foto); la
  // estrella de la cría o el botón de las familias (desde la P9) -> su escena; el guía -> repite lo que toca; el manzano (en la granja) -> se mece y Tito dice cómo va; un animal que pasea
  // -> salta y hace su sonido.
  down(x: number, y: number) {
    if (atHome(x, y)) {
      SFX.whoosh();
      go('cole');
      return;
    }
    if (inCoinHUD(x, y)) {
      SFX.pop();
      go('tienda');
      return;
    }
    if (exc.foto >= 0) return;
    // desde la fase P15, el botón de la cámara; con ella encendida, un toque a un animal que pasea le hace una foto (y
    // no se va a ninguna estación)
    if (tocarBotonCamara(x, y)) return;
    if (camaraActiva()) {
      const f = fotoDeMarca((m) => m === animalEn(x, y));
      if (f) hacerFotoDe(f.id, x, y);
      else disparoVacio(x, y);
      return;
    }
    const s = excursionActual().estaciones.find((z) => dist(x, y, z.x, z.y) < sitioEstacion(z).r);
    if (s) {
      if (!s.escena) {
        SFX.boing();
        say(fmt('{estacion}: ¡muy pronto podremos hacerlo!', { estacion: tr(s.nombre) }));
        return;
      }
      SFX.pop();
      go(s.escena, { exc: exc.id, hello: true });
      return;
    }
    if (excursionActual().id === 'granja' && tocarBotonesCrias(x, y)) return;
    if (dist(x, y, GUIA.x, GUIA.y) < GUIA.s / 2) {
      this.prompt!();
      return;
    }
    if (excursionActual().id === 'granja' && tocarManzano(x, y)) return;
    if (tocarPaseo(x, y)) return;
    SFX.tap();
    sparkles(x, y);
  },
};
