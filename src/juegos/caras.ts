// juegos/caras.ts: las caritas de las emociones (fase 4o de docs/PLAN-MIGRACION.md): EMO (color y nombre de cada
// emoción) y drawFace, que dibuja la carita. Las usan la asamblea (escenas/escenas2d.ts: «¿cómo te sentís hoy?»), los
// componentes de juego (juegos/comps.ts y comps2.ts: canciones y cuentos) y los temas de las emociones (temas/temas4.ts
// y temas/ingles.ts). Hasta la fase 4o estaban en escenas/escenas2d.ts, que se carga después de todos ellos, y los
// demás las usaban como globales tardías (src/tardias.d.ts).
// Exporta: EMO y drawFace. Importa: del núcleo, src/nucleo/, ctx, PI y el dibujo básico (circ, ell,
// fillStroke), y K de los dibujos.
import { K } from '../dibujos/todos.ts';
import { PI, circ, ctx, ell, fillStroke } from '../nucleo/indice.ts';

// EMO: emociones de la asamblea. {clave: {c: color de la carita, n: nombre}}.
export const EMO: Record<string, { c: string; n: string }>={alegria:{c:'#FFD66B',n:'alegría'},tristeza:{c:'#7FB0FF',n:'tristeza'},enojo:{c:'#FF6B5E',n:'enfado'},miedo:{c:'#9B8AD9',n:'miedo'},sorpresa:{c:'#FFA94D',n:'sorpresa'},calma:{c:'#7CC86E',n:'calma'},verguenza:{c:'#F58BB4',n:'vergüenza'}};
// drawFace(x, y, r, m): dibuja la carita de la emoción m (clave de EMO) de radio r en (x, y). Solo dibuja.
export function drawFace(x: number,y: number,r: number,m: string){const e=EMO[m];ctx.save();ctx.translate(x,y);circ(0,0,r,e.c,6);const ey=-r*.12,ex=r*.34,L=r*.07;ctx.lineCap='round';ctx.lineWidth=L;ctx.strokeStyle=K;
// eyes(rr): dos ojos de radio rr con brillo blanco.
  const eyes=(rr: number)=>{circ(-ex,ey,rr,K,0);circ(ex,ey,rr,K,0);circ(-ex+rr*.35,ey-rr*.35,rr*.35,'#fff',0);circ(ex+rr*.35,ey-rr*.35,rr*.35,'#fff',0)};
// mouth(a, b, c): boca curva; a y c = altura de las comisuras, b = altura del centro (en fracciones de r).
  const mouth=(a: number,b: number,c: number)=>{ctx.beginPath();ctx.moveTo(-r*.32,r*a);ctx.quadraticCurveTo(0,r*b,r*.32,r*c);ctx.stroke()};
  if(m==='alegria'){eyes(r*.1);ctx.beginPath();ctx.moveTo(-r*.4,r*.2);ctx.quadraticCurveTo(0,r*.75,r*.4,r*.2);ctx.closePath();fillStroke('#C0473C',L)}
  if(m==='tristeza'){eyes(r*.09);mouth(.48,.2,.48);ell(-ex-r*.06,ey+r*.22,r*.06,r*.1,'#5BB8E6',0)}
  if(m==='enojo'){eyes(r*.09);ctx.beginPath();ctx.moveTo(-ex-r*.18,ey-r*.26);ctx.lineTo(-ex+r*.14,ey-r*.12);ctx.moveTo(ex+r*.18,ey-r*.26);ctx.lineTo(ex-r*.14,ey-r*.12);ctx.stroke();mouth(.5,.28,.5)}
  if(m==='miedo'){circ(-ex,ey,r*.16,'#fff',L*.6);circ(ex,ey,r*.16,'#fff',L*.6);circ(-ex,ey,r*.07,K,0);circ(ex,ey,r*.07,K,0);ctx.beginPath();ctx.moveTo(-r*.3,r*.42);for(let i=1;i<=6;i++)ctx.lineTo(-r*.3+i*r*.1,r*.42+(i%2?-1:1)*r*.06);ctx.stroke()}
  if(m==='sorpresa'){eyes(r*.11);ctx.beginPath();ctx.arc(-ex,ey-r*.24,r*.14,PI*1.15,PI*1.85);ctx.stroke();ctx.beginPath();ctx.arc(ex,ey-r*.24,r*.14,PI*1.15,PI*1.85);ctx.stroke();ell(0,r*.4,r*.13,r*.17,'#C0473C',L)}
  if(m==='calma'){for(const s of[-1,1]){ctx.beginPath();ctx.arc(s*ex,ey,r*.1,PI*.1,PI*.9);ctx.stroke()}mouth(.3,.5,.3)}
  if(m==='verguenza'){eyes(r*.08);circ(-r*.5,r*.18,r*.13,'#FF5A8A',0);circ(r*.5,r*.18,r*.13,'#FF5A8A',0);ctx.beginPath();ctx.moveTo(-r*.16,r*.42);ctx.quadraticCurveTo(0,r*.5,r*.16,r*.42);ctx.stroke()}
  ctx.restore()}
