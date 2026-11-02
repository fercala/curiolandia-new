/*
 * escenas/casaHuerto.ts: «Mi huerto» (fase C5 de docs/PLAN-CASA.md), la escena SCENES.casaHuerto. Se abre cuando Tito
 * acaba de regar la planta con flor de su casa (REACCIONES en dominio/casa.ts: escena 'huerto'). Una maceta grande al sol y la
 * regadera: al tocar la regadera cae agua y la flor se riega. Cuenta un riego al día (regar en dominio/casa.ts, con la
 * fecha de hoy) y la flor crece por etapas con los días regados (etapaFlor: semilla, brote, hojas, capullo y flor
 * abierta, FLOR_DIAS); con la flor abierta vienen mariposas. Lo regado se guarda en S.huerto. Si ya se regó hoy, Tito
 * lo dice («mañana más»). Sin fallos ni prisa. La casa (arriba a la izquierda) vuelve a la casa de Tito.
 * Exporta: HUERTO (la maceta y la regadera) y pone SCENES.casaHuerto.
 * Importa: el núcleo (dibujo, voz, sonido, toque, guardado) y las reglas del huerto de dominio/casa.ts.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- posiciones, tamaños y tiempos en la pantalla de 1600x900, como en el
   resto de las escenas. */
import { S, SCENES, SFX, T, atHome, burst, card, circ, ctx, dist, drawHome, drawTito, go, hC, hv, later, parts, pic, rnd, save, say, sayQ, today } from '../nucleo/indice.ts';
import { FLOR_DIAS, etapaFlor, huertoNuevo, regar } from '../dominio/casa.ts';

// HUERTO: la maceta (centro de la tierra x, y) y la regadera (x, y).
export const HUERTO = { maceta: { x: 760, y: 640 }, regadera: { x: 1250, y: 330 } };
// FRASE_ETAPA: lo que dice Tito al llegar la flor a cada etapa (de 1, brote, a 4, flor abierta).
const FRASE_ETAPA: readonly string[] = ['', '¡Mira, ha salido un brote!', '¡Ya tiene hojas!', '¡Tiene un capullo! Pronto se abrirá.', '¡La flor se ha abierto! ¡Qué bonita!'];

// dibujaPlanta(x, y, etapa): la planta de la maceta según la etapa (0 semilla, 1 brote, 2 hojas, 3 capullo, 4 flor).
function dibujaPlanta(x: number, y: number, etapa: number): void {
  const alto = [0, 60, 140, 220, 260][etapa] ?? 0, mece = Math.sin(T * 1.5) * 0.05;
  if (!etapa) { circ(x, y - 6, 12, '#8A5A3A', 3); return; }
  ctx.save(); ctx.translate(x, y); ctx.rotate(mece);
  ctx.strokeStyle = '#3E8A3A'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -alto); ctx.stroke();
  // Las hojas: una por lado desde el brote, y otro par más arriba desde las hojas.
  const hoja = (hy: number, lado: number): void => { ctx.save(); ctx.translate(0, hy); ctx.scale(lado, 1); ctx.beginPath(); ctx.ellipse(34, -10, 36, 16, -0.5, 0, Math.PI * 2); ctx.fillStyle = '#7CC86E'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#4A3428'; ctx.stroke(); ctx.restore(); };
  hoja(-alto * 0.35, 1); hoja(-alto * 0.35, -1);
  if (etapa >= 2) { hoja(-alto * 0.7, 1); hoja(-alto * 0.7, -1); }
  if (etapa === 3) { ctx.beginPath(); ctx.ellipse(0, -alto - 20, 24, 34, 0, 0, Math.PI * 2); ctx.fillStyle = '#F58BB4'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#4A3428'; ctx.stroke(); }
  ctx.restore();
  if (etapa === 4) pic('flor', x + Math.sin(mece) * alto, y - alto - 10, 200);
}

// MI HUERTO: estado: riega (hora T a la que empezó a caer el agua, o -1).
SCENES.casaHuerto = { music: null,
  // enter(): la maceta como esté (S.huerto) y Tito invita a regar.
  enter() { this.riega = -1; S.huerto = S.huerto || huertoNuevo(); later(400, () => sayQ(S.huerto!.dia === today() ? 'Hoy ya la hemos regado. ¡Mira qué bien está!' : '¿Regamos la flor? Toca la regadera.')); },
  // prompt(): qué hacer.
  prompt() { say(S.huerto!.dia === today() ? 'Hoy ya está regada. Vuelve mañana para que crezca.' : 'Toca la regadera para regar la flor.'); },
  // draw(): el cielo con sol, la ventana del jardín, la maceta con la planta, la regadera (inclinada y echando agua si
  // está regando), las mariposas con la flor abierta, cuántos días se ha regado (gotas), Tito y la casa.
  draw() {
    ctx.fillStyle = '#E8F7E0'; ctx.fillRect(0, 0, 1600, 900); ctx.fillStyle = '#CBE7B8'; ctx.fillRect(0, 740, 1600, 160);
    pic('sol', 220, 170, 170);
    const m = HUERTO.maceta, etapa = etapaFlor(S.huerto!.dias);
    dibujaPlanta(m.x, m.y, etapa);
    ctx.beginPath(); ctx.moveTo(m.x - 170, m.y - 10); ctx.lineTo(m.x + 170, m.y - 10); ctx.lineTo(m.x + 130, m.y + 190); ctx.lineTo(m.x - 130, m.y + 190); ctx.closePath();
    ctx.fillStyle = '#D9784A'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#4A3428'; ctx.stroke();
    card(m.x - 190, m.y - 40, 380, 50, '#E58A5C', 6, 14);
    if (etapa === 4) [0, 1].forEach((i) => pic('mariposa', m.x + Math.cos(T * 0.8 + i * 3) * 300, m.y - 360 + Math.sin(T * 1.6 + i) * 80, 90));
    const r = HUERTO.regadera, regando = this.riega >= 0 && T - this.riega < 2, s = regando ? 1 : hv('regadera', hC(r.x, r.y, 90));
    const rx = regando ? m.x + 230 : r.x, ry = regando ? m.y - 330 : r.y;
    // Al regar, la regadera se da la vuelta (el pitorro hacia la flor) y se inclina.
    ctx.save(); ctx.translate(rx, ry); ctx.rotate(regando ? -0.6 : 0); ctx.scale(regando ? -s : s, s); pic('regadera', 0, 0, 200); ctx.restore();
    if (regando && Math.floor(T * 30) % 3 === 0) parts.push({ x: rx - 110 + rnd(-10, 10), y: ry + 10, vx: rnd(-40, -10), vy: 160, life: 1, t: 0, c: '#7FD3F0', r: 9, rot: 0, k: 'd', g: 300 });
    FLOR_DIAS.forEach((n, i) => circ(1180 + i * 70, 820, 22, S.huerto!.dias >= n ? '#7FD3F0' : '#FFFFFF', 4));
    drawTito(20, 680, 200); drawHome();
  },
  // down(x, y): la casa vuelve a la casa de Tito; la regadera riega: si hoy no se había regado, cuenta el día (regar),
  // se guarda y, si la flor cambia de etapa, Tito lo celebra; si ya se regó hoy, Tito lo dice.
  down(x: number, y: number) {
    if (atHome(x, y)) { SFX.tap(); go('casaTito', { volver: 1 }); return; }
    if (dist(x, y, HUERTO.regadera.x, HUERTO.regadera.y) > 110 || (this.riega >= 0 && T - this.riega < 2)) return;
    SFX.drip(); this.riega = T;
    const antes = etapaFlor(S.huerto!.dias), r = regar(S.huerto!, today());
    if (!r.cuenta) { later(800, () => say('¡Ya está regada! Mañana más, que si no se ahoga.')); return; }
    S.huerto = r.huerto; save();
    const ahora = etapaFlor(r.huerto.dias);
    later(2000, () => {
      if (ahora > antes) { SFX.tada(); burst(HUERTO.maceta.x, HUERTO.maceta.y - 200, 30); say(FRASE_ETAPA[ahora]); }
      else say('¡Gracias! Con agua y sol, poco a poco crecerá.');
    });
  },
};
