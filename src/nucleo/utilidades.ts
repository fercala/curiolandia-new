// utilidades.ts: azar, números, curvas de animación y colores. No dependen de nada del juego; el azar sale del puerto
// azar() (aplicacion/puertos.ts).
//   rnd, ri, pick, shuffle, clamp, lerp, dist, inR, easeOut, back, PI, hex2, col.
// azar(): el azar del juego (puerto de aplicacion/puertos.ts, desde la fase 3g; antes Math.random()).
import { azar } from '../aplicacion/puertos.ts';

// Azar: rnd(a,b) número decimal entre a y b; ri(a,b) entero entre a y b (los dos incluidos); pick(lista) un elemento al azar.
export const rnd=(a: number,b: number): number=>a+azar()*(b-a), ri=(a: number,b: number): number=>Math.floor(rnd(a,b+1)), pick=<X>(a: readonly X[]): X=>a[Math.floor(azar()*a.length)];
// shuffle(lista): devuelve una COPIA desordenada (algoritmo de Fisher-Yates); no toca la lista original.
export const shuffle=<X>(a: readonly X[]): X[]=>{const r=a.slice();for(let i=r.length-1;i>0;i--){const j=Math.floor(azar()*(i+1));[r[i],r[j]]=[r[j],r[i]]}return r};
// clamp(v,a,b) limita v entre a y b; lerp(a,b,t) mezcla lineal (t=0 da a, t=1 da b); dist(x1,y1,x2,y2) distancia entre dos puntos.
export const clamp=(v: number,a: number,b: number): number=>Math.max(a,Math.min(b,v)), lerp=(a: number,b: number,t: number): number=>a+(b-a)*t, dist=(a: number,b: number,c: number,d: number): number=>Math.hypot(a-c,b-d);
// inR(x, y, cx, cy, w, h): true si el punto (x, y) cae dentro del rectángulo de w x h centrado en (cx, cy). Desde la
// fase 4a está aquí (antes en escenas/escenas2d.ts), para que lo importen los módulos que se cargan antes.
export const inR=(x: number,y: number,cx: number,cy: number,w: number,h: number): boolean=>Math.abs(x-cx)<w/2&&Math.abs(y-cy)<h/2;
// Curvas de animación para t de 0 a 1: easeOut frena al final; back se pasa un poco de 1 y vuelve (efecto de rebote al aparecer).
export const easeOut=(t: number): number=>1-Math.pow(1-t,3), back=(t: number): number=>{const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
export const PI=Math.PI;
// hex2('#RRGGBB'): devuelve [r,g,b] con números de 0 a 255.
export function hex2(c: string): [number,number,number]{c=c.replace('#','');return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]}
// _cc: caché de los colores ya calculados por col() (para no recalcularlos en cada cuadro).
const _cc: Record<string,string>={};
// col(color, s): devuelve el color apagado hacia su gris ('rgb(...)'); s=1 lo deja igual y s=0 lo deja gris del todo.
export function col(c: string,s: number): string{ // mezcla un color hacia su gris (s=1 color pleno, 0 gris)
  if(s>=.999)return c; const k=c+'|'+s.toFixed(2); const ya=_cc[k]; if(ya)return ya;
  const [r,g,b]=hex2(c), l=r*.3+g*.59+b*.11, m=(v: number): number=>Math.round(clamp(l*.85+40+(v-(l*.85+40))*s,0,255));
  return _cc[k]=`rgb(${m(r)},${m(g)},${m(b)})`;
}
