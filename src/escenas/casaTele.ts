/*
 * escenas/casaTele.ts: «Mi tele» (fase C4 de docs/PLAN-CASA.md), la escena SCENES.casaTele. Se abre cuando Tito acaba
 * de encender la tele de su casa (REACCIONES en dominio/casa.ts: escena 'tele'). La tele tiene cuatro canales, cada
 * uno con sus dibujos animados y su música (TUNES de juegos/, que vuelve a sonar al acabar): globos de colores, peces en
 * el mar, Tito que baila y Pipo que salta. Se cambia de canal con los botones del mando, a la derecha; al tocar la
 * pantalla salen brillos. La casa (arriba a la izquierda) vuelve a la casa de Tito.
 * Exporta: TELE (la pantalla y el mando) y CANALES, y pone SCENES.casaTele.
 * Importa: el núcleo (dibujo, voz, sonido, toque) y TUNES y playTune de juegos/.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import { PI, SCENES, SFX, T, atHome, card, circ, ctx, dist, drawHome, drawTito, go, hC, hv, later, pic, say, sayQ, sparkles } from '../nucleo/indice.ts';
import { TUNES, playTune } from '../juegos/indice.ts';

// TELE: la pantalla (x, y de arriba a la izquierda, ancho w, alto h) y los botones del mando (x, desde y0 cada dy).
export const TELE = { x: 260, y: 140, w: 920, h: 580, mando: { x: 1390, y0: 250, dy: 140 } };

/** Un canal: su nombre (lo dice Tito), su melodía (TUNES), su color de fondo, su dibujo en el mando y sus dibujos animados. */
interface Canal { readonly n: string; readonly tune: string; readonly fondo: string; readonly ic: string; readonly anima: (t: number) => void }

// cx, cy: el centro de la pantalla.
const cx = TELE.x + TELE.w / 2, cy = TELE.y + TELE.h / 2;
const GLOBOS = ['#FF6B5E', '#FFD66B', '#7CC86E', '#5BB8E6', '#9B8AD9', '#F58BB4'];

// CANALES: los cuatro canales. anima(t) dibuja sus dibujos animados en la pantalla a la hora t.
export const CANALES: readonly Canal[] = [
  { n: 'La canción de los colores', tune: 'colores', fondo: '#BFEAF7', ic: 'globo',
    anima: (t) => GLOBOS.forEach((c, i) => { const y = TELE.y + TELE.h + 80 - ((t * 90 + i * 110) % (TELE.h + 200)), x = TELE.x + 90 + i * 150 + Math.sin(t * 2 + i) * 20; ctx.lineWidth = 3; ctx.strokeStyle = '#5A4630'; ctx.beginPath(); ctx.moveTo(x, y + 60); ctx.lineTo(x, y + 140); ctx.stroke(); ctx.beginPath(); ctx.ellipse(x, y, 48, 60, 0, 0, PI * 2); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#3A281E'; ctx.stroke(); }) },
  { n: 'Los peces del mar', tune: 'meses', fondo: '#5BB8E6', ic: 'pez',
    anima: (t) => { [0, 1, 2, 3].forEach((i) => { const x = TELE.x + ((t * (80 + i * 30) + i * 260) % (TELE.w + 200)) - 100, y = TELE.y + 120 + i * 120 + Math.sin(t * 2 + i) * 20; pic('pez', x, y, 110 - i * 10); }); [0, 1, 2, 3, 4].forEach((i) => circ(TELE.x + 100 + i * 180, TELE.y + TELE.h - ((t * 60 + i * 97) % TELE.h), 10, 'rgba(255,255,255,.6)', 0)); } },
  { n: 'Tito baila', tune: 'dias', fondo: '#FFE08A', ic: 'caracol',
    anima: (t) => { ctx.save(); ctx.translate(cx, cy + 140); ctx.rotate(Math.sin(t * 6) * 0.2); drawTito(-150, -250 - Math.abs(Math.sin(t * 6)) * 50, 300); ctx.restore(); } },
  { n: 'Pipo salta', tune: 'estaciones', fondo: '#C8F0B0', ic: 'dinosaurio',
    anima: (t) => { const j = Math.abs(Math.sin(t * 4)) * 160; ctx.fillStyle = '#7CC86E'; ctx.fillRect(TELE.x, TELE.y + TELE.h - 90, TELE.w, 90); pic('dinosaurio', cx + Math.sin(t) * 250, TELE.y + TELE.h - 200 - j, 260); } },
];

// drawTele(canal): el mueble y la tele con su pantalla: el fondo del canal y sus dibujos animados (recortados a la
// pantalla) y un brillo de cristal.
function drawTele(canal: Canal): void {
  card(TELE.x - 60, TELE.y - 50, TELE.w + 120, TELE.h + 100, '#5A4630', 6, 40);
  ctx.save(); ctx.beginPath(); ctx.rect(TELE.x, TELE.y, TELE.w, TELE.h); ctx.clip();
  ctx.fillStyle = canal.fondo; ctx.fillRect(TELE.x, TELE.y, TELE.w, TELE.h); canal.anima(T); ctx.restore();
  ctx.globalAlpha = 0.12; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(TELE.x, TELE.y); ctx.lineTo(TELE.x + 300, TELE.y); ctx.lineTo(TELE.x, TELE.y + 300); ctx.fill(); ctx.globalAlpha = 1;
  card(TELE.x + TELE.w / 2 - 160, TELE.y + TELE.h + 50, 320, 60, '#3A281E', 5, 12);
}

// MI TELE: estado: canal (el que se ve) y tok (cuenta los cambios de canal: la música vieja deja de repetirse).
SCENES.casaTele = { music: null,
  // enter(): empieza en el primer canal.
  enter() { this.canal = 0; this.tok = 0; this.pon!(0); later(500, () => sayQ('¡Mi tele! Con el mando de la derecha cambias de canal.')); },
  // pon(i): pone el canal i: Tito dice su nombre y su música suena una y otra vez mientras siga ese canal.
  pon(i: number) {
    this.canal = i; const tok = ++this.tok, c = CANALES[i];
    const repite = (): void => { if (tok !== this.tok) return; const d = playTune(TUNES[c.tune], 140, 0.22) || 4; later(d * 1000 + 600, repite); };
    later(300, repite);
  },
  // prompt(): qué hacer.
  prompt() { say('Toca los botones del mando para cambiar de canal.'); },
  // draw(): la pared, la tele con el canal, el mando con un botón por canal (el que se ve, en amarillo), Tito y la casa.
  draw() {
    ctx.fillStyle = '#F9E7D2'; ctx.fillRect(0, 0, 1600, 900); ctx.fillStyle = '#E2C9A6'; ctx.fillRect(0, 780, 1600, 120);
    drawTele(CANALES[this.canal]);
    const m = TELE.mando; card(m.x - 90, m.y0 - 110, 180, CANALES.length * m.dy + 80, '#4A4A5A', 6, 50);
    CANALES.forEach((c, i) => { const y = m.y0 + i * m.dy, on = i === this.canal, s = on ? 1 : hv('c' + i, hC(m.x, y, 58)); ctx.save(); ctx.translate(m.x, y); ctx.scale(s, s); circ(0, 0, 58, on ? '#FFE08A' : '#fff', on ? 7 : 5, on ? '#D9962A' : '#3A281E'); pic(c.ic, 0, 0, 80); ctx.restore(); });
    drawTito(20, 690, 200); drawHome();
  },
  // down(x, y): la casa vuelve a la casa de Tito (y la música para); un botón del mando pone su canal; la pantalla echa brillos.
  down(x: number, y: number) {
    if (atHome(x, y)) { SFX.tap(); this.tok++; go('casaTito', { volver: 1 }); return; }
    const i = CANALES.findIndex((_c, j) => dist(x, y, TELE.mando.x, TELE.mando.y0 + j * TELE.mando.dy) < 60);
    if (i >= 0) { if (i !== this.canal) { SFX.pop(); this.pon!(i); say(CANALES[i].n + '.'); } return; }
    if (x > TELE.x && x < TELE.x + TELE.w && y > TELE.y && y < TELE.y + TELE.h) { SFX.sparkle(); sparkles(x, y, 8); }
  },
};
