// Fichas del último tema en la zona de adultos: dibuja e imprime en el navegador sin guardar datos. Desde la v0.2.180
// (idea 40 de docs/IDEAS-MEJORA.md), además de colorear y contar, la de trazos (líneas de preescritura y el nombre en
// letras de puntos) y la de recortar y pegar (los dibujos del tema y sus sombras).
import { PICS } from '../../dibujos/todos.ts';
import { TEMAS } from '../../escenas/escenas2d.ts';
import { AGE, S, tr } from '../../nucleo/indice.ts';
import { esc } from './comun.ts';

export const FICHAS_HTML = `<section><h3>Fichas para imprimir</h3>
<p class="note">Usan los dibujos del último tema abierto.</p>
<button type="button" data-ficha="color">Ficha para colorear</button>
<button type="button" data-ficha="contar">Ficha para contar</button>
<button type="button" data-ficha="trazos">Ficha de trazos</button>
<button type="button" data-ficha="recortar">Ficha para recortar y pegar</button></section>`;

// dibujoFicha(id): convierte un dibujo del catálogo en un contorno negro con fondo blanco.
function dibujoFicha(id: string): string {
  const dibujo = PICS[id] ?? PICS['hoja'];
  const contorno = dibujo
    .replace(/fill="(?!none)[^"]+"/g, 'fill="white"')
    .replace(/stroke="(?!none)[^"]+"/g, 'stroke="black"');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-62 -62 124 124">${contorno}</svg>`;
}

// sombraFicha(id): el dibujo como sombra gris (para pegar encima el recortado): cambia cada color de relleno y de
// trazo, por ejemplo fill="#E33" -> fill="#BBBBBB" (fill="none" se queda).
function sombraFicha(id: string): string {
  const dibujo = (PICS[id] ?? PICS['hoja'])
    .replace(/fill="(?!none)[^"]+"/g, 'fill="#BBBBBB"')
    .replace(/stroke="(?!none)[^"]+"/g, 'stroke="#BBBBBB"');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-62 -62 124 124">${dibujo}</svg>`;
}
// TRAZOS: las líneas de preescritura de la ficha de trazos (olas, picos, bucles y escalones), como caminos de SVG.
const TRAZOS = [
  `M10 40 Q35 5 60 40 T110 40 T160 40 T210 40 T260 40 T310 40`,
  `M10 60 L45 15 L80 60 L115 15 L150 60 L185 15 L220 60 L255 15 L290 60`,
  `M20 40 C20 0 70 0 60 40 C50 80 110 80 100 40 C90 0 150 0 140 40 C130 80 190 80 180 40 C170 0 230 0 220 40 C210 80 270 80 260 40 C250 0 310 0 300 40`,
  `M10 60 L10 20 L60 20 L60 60 L110 60 L110 20 L160 20 L160 60 L210 60 L210 20 L260 20 L260 60`,
];
// cuerpoFicha(tipo, tema, icono): la consigna y el contenido de la hoja de cada tipo.
function cuerpoFicha(tipo: string, dibujos: string[], icono: string): { consigna: string; html: string; css: string } {
  const cantidad = AGE();
  if (tipo === 'contar')
    return {
      consigna: tr('Cuenta los dibujos y rodea el número.'),
      html: `<div>${dibujoFicha(icono).repeat(cantidad)}</div><p class="opciones">${cantidad - 1} ${cantidad} ${cantidad + 1}</p>`,
      css: `svg{width:24mm}`,
    };
  if (tipo === 'trazos') {
    const nombre = (S.name || tr('Tito')).slice(0, 10);
    return {
      consigna: tr('Repasa las líneas de puntos con el lápiz, sin levantarlo.'),
      html:
        TRAZOS.map(
          (d) =>
            `<svg viewBox="0 0 320 80" class="linea"><path d="${d}" fill="none" stroke="#888" stroke-width="4" stroke-dasharray="3 9" stroke-linecap="round"/></svg>`,
        ).join('') +
        `<svg viewBox="0 0 320 100" class="linea"><text x="160" y="80" text-anchor="middle" font-size="80" font-family="sans-serif" fill="none" stroke="#888" stroke-width="2.5" stroke-dasharray="2 6">${esc(nombre)}</text></svg>`,
      css: `svg.linea{width:170mm;display:block;margin:6mm auto}`,
    };
  }
  if (tipo === 'recortar') {
    const tres = dibujos.slice(0, 3);
    return {
      consigna: tr('Recorta los dibujos por la línea de puntos y pégalos encima de su sombra.'),
      html: `<div class="fila">${tres.map((k) => `<span class="sombra">${sombraFicha(k)}</span>`).join('')}</div>
<div class="fila corte">${tres.map((k) => `<span class="recorte">${dibujoFicha(k)}</span>`).join('')}</div>`,
      css: 'svg{width:40mm}.fila{display:flex;justify-content:space-around;margin:10mm 0}.recorte{border:2px dashed #555;padding:4mm}.corte{margin-top:25mm}',
    };
  }
  return {
    consigna: tr('Colorea el dibujo del tema.'),
    html: `<div>${dibujoFicha(icono)}</div>`,
    css: `svg{width:125mm}`,
  };
}

// TITULOS_FICHA: el título de cada tipo de ficha.
const TITULOS_FICHA: Readonly<Record<string, string>> = {
  color: 'Ficha para colorear',
  contar: 'Ficha para contar',
  trazos: 'Ficha de trazos',
  recortar: 'Ficha para recortar y pegar',
};

// imprimirFicha(tipo): prepara únicamente la hoja elegida (colorear, contar, trazos o recortar) y abre la impresión del
// navegador.
function imprimirFicha(tipo: string): void {
  const tema = TEMAS.find((t) => t.id === S.last);
  const icono = tema?.icon ?? 'hoja';
  const dibujos = [...(tema?.words ?? []).map((w) => w.k ?? ''), icono, 'hoja', 'flor', 'sol'].filter(
    (k, i, todos) => !!k && !!PICS[k] && todos.indexOf(k) === i,
  );
  const titulo = tr(TITULOS_FICHA[tipo] ?? TITULOS_FICHA['color']!);
  const c = cuerpoFicha(tipo, dibujos, icono);
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
<style>@page{margin:18mm}body{font:20px sans-serif;text-align:center}.opciones{font-size:36px;word-spacing:30px}${c.css}</style>
<h1>${esc(titulo)}</h1><h2>${esc(tema ? tr(tema.n) : '')}</h2><p>${esc(c.consigna)}</p>
${c.html}</html>`;
  document.body.append(marco);
}

// conectarFichas(el): conecta los botones de fichas de la página de progreso.
export function conectarFichas(el: HTMLElement): void {
  el.querySelectorAll<HTMLButtonElement>('[data-ficha]').forEach((boton) => {
    boton.onclick = () => imprimirFicha(boton.dataset.ficha || 'color');
  });
}
