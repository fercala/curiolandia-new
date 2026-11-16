// Fichas del último tema en la zona de adultos: dibuja e imprime en el navegador sin guardar datos.
import { PICS } from '../../dibujos/todos.ts';
import { TEMAS } from '../../escenas/escenas2d.ts';
import { AGE, S, tr } from '../../nucleo/indice.ts';
import { esc } from './comun.ts';

export const FICHAS_HTML = `<section><h3>Fichas para imprimir</h3>
<p class="note">Usan los dibujos del último tema abierto.</p>
<button type="button" data-ficha="color">Ficha para colorear</button>
<button type="button" data-ficha="contar">Ficha para contar</button></section>`;

// dibujoFicha(id): convierte un dibujo del catálogo en un contorno negro con fondo blanco.
function dibujoFicha(id: string): string {
  const dibujo = PICS[id] ?? PICS['hoja'];
  const contorno = dibujo
    .replace(/fill="(?!none)[^"]+"/g, 'fill="white"')
    .replace(/stroke="(?!none)[^"]+"/g, 'stroke="black"');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-62 -62 124 124">${contorno}</svg>`;
}

// imprimirFicha(contar): prepara únicamente la hoja elegida y abre la impresión del navegador.
function imprimirFicha(contar: boolean): void {
  const tema = TEMAS.find((t) => t.id === S.last);
  const icono = tema?.icon ?? 'hoja';
  const cantidad = AGE();
  const dibujo = dibujoFicha(icono);
  const titulo = tr(contar ? 'Ficha para contar' : 'Ficha para colorear');
  const consigna = tr(contar ? 'Cuenta los dibujos y rodea el número.' : 'Colorea el dibujo del tema.');
  document.querySelector('iframe[data-impresion-ficha]')?.remove();
  const marco = document.createElement('iframe');
  marco.dataset.impresionFicha = '';
  marco.title = titulo;
  marco.style.cssText = 'position:fixed;width:1px;height:1px;left:-10000px;border:0';
  marco.onload = () => {
    const visita = marco.contentWindow;
    if (!visita) return;
    visita.addEventListener('afterprint', () => marco.remove(), { once: true });
    visita.print();
  };
  marco.srcdoc = `<!DOCTYPE html><html><meta charset="utf-8"><title>${esc(titulo)}</title>
<style>@page{margin:18mm}body{font:20px sans-serif;text-align:center}svg{width:${contar ? '24mm' : '125mm'}}.opciones{font-size:36px;word-spacing:30px}</style>
<h1>${esc(titulo)}</h1><h2>${esc(tema ? tr(tema.n) : '')}</h2><p>${esc(consigna)}</p>
<div>${dibujo.repeat(contar ? cantidad : 1)}</div>
${contar ? `<p class="opciones">${cantidad - 1} ${cantidad} ${cantidad + 1}</p>` : ''}</html>`;
  document.body.append(marco);
}

// conectarFichas(el): conecta solo los dos botones de fichas de la página de progreso.
export function conectarFichas(el: HTMLElement): void {
  el.querySelectorAll<HTMLButtonElement>('[data-ficha]').forEach((boton) => {
    boton.onclick = () => imprimirFicha(boton.dataset.ficha === 'contar');
  });
}
