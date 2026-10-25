// pantalla.ts: el lienzo, la pantalla lógica de 1600x900, VIVO y el reloj del juego T. Es el primer módulo del núcleo
// (src/nucleo/, lo que antes era core.js): lo que define lo usan todos los demás.
//   - W y H (pantalla lógica), LF y DF (fuentes), cv y ctx (el lienzo 2D), SC/OX/OY/DPR (escala y márgenes), resize().
//   - VIVO: estado de la partida en curso que no se guarda y que cambian varios archivos.
//   - T: segundos desde el arranque (para animar); lo avanza frame() en adult.js con ponT().
// ctx, SC, OX, OY, DPR y T cambian: desde fuera de este módulo solo se leen; ctx se cambia con ponCtx y T con ponT.
import type { Vivo } from './tipos.ts';

export const W=1600,H=900, LF='Andika, Fredoka, "Trebuchet MS", sans-serif', DF='Fredoka, "Baloo 2", system-ui, sans-serif';
// cv: el lienzo de la página (head.html); ctx: donde se dibuja ahora (casi siempre el de cv).
export const cv=document.getElementById('cv') as HTMLCanvasElement; export let ctx=cv.getContext('2d') as CanvasRenderingContext2D;
export let SC=1,OX=0,OY=0,DPR=1;
// VIVO: el estado de la partida en curso que no se guarda y que cambian varios archivos (puntero, voz, escena, candado,
// dificultad, tiempo de juego, avisos). Un objeto en vez de variables sueltas porque un módulo no puede reasignar una
// variable que importa, pero sí cambiar un campo (fase 2 de docs/PLAN-MIGRACION.md). Cada grupo de campos se rellena
// con Object.assign donde se explica (puntero.ts, voz.ts, escenas.ts, interfaz.ts, escenas/escenas2d.ts con deferredInstall y
// escenas/tienda.ts con coinBanner); el tipo con todos los campos es Vivo (tipos.ts). Empieza vacío y se completa al cargar.
export const VIVO={} as Vivo;
// ponCtx(g): cambia el lienzo en el que dibuja todo (ctx). world3d.js dibuja así en lienzos aparte (texturas, muestras
// de fondo) y luego deja el de antes. Es la única forma de cambiar ctx desde otro archivo.
export function ponCtx(g: CanvasRenderingContext2D): void{ctx=g}
// resize(): ajusta el lienzo al tamaño de la ventana. El juego siempre "piensa" en una pantalla de 1600x900 (W x H):
// SC es la escala para que quepa entera, OX/OY el margen (bandas) para centrarla y DPR la densidad de píxeles
// (como mucho 2, para no gastar de más en móviles). Se llama al cargar y cada vez que cambia el tamaño.
export function resize(): void{
  DPR=Math.min(window.devicePixelRatio||1,2);
  const w=innerWidth,h=innerHeight; cv.width=Math.round(w*DPR); cv.height=Math.round(h*DPR);
  cv.style.width=w+'px'; cv.style.height=h+'px';
  SC=Math.min(w/W,h/H); OX=(w-W*SC)/2; OY=(h-H*SC)/2;
}
addEventListener('resize',resize); resize();
// T: segundos de juego desde el arranque, para animar (lo avanza frame() en adult.js).
export let T=0;
// ponT(t): cambia el reloj de juego T (en segundos). Lo avanza frame() en adult.js en cada cuadro.
export function ponT(t: number): void{T=t}
