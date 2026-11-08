// adultos/comun.ts: lo que usan varias páginas de la zona de adultos (fase A1 de docs/PLAN-MENU-ADULTOS.md).

// esc(texto): escapa &, <, > y comillas para meter texto sin peligro dentro del HTML del panel.
export const esc = (s: unknown) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }) as Record<string, string>)[c],
  );

// buscador(el): devuelve q(selector), que busca un elemento dentro de el (una página del panel). Se da por hecho que
// existe: cada página solo busca lo que ella misma pinta.
export const buscador = (el: HTMLElement) => (s: string) => el.querySelector<HTMLInputElement>(s)!;

// radios(el, nombre, alCambiar): conecta los radios name=nombre de el; al elegir uno llama a alCambiar con su valor.
export function radios(el: HTMLElement, nombre: string, alCambiar: (valor: string) => void) {
  el.querySelectorAll<HTMLInputElement>(`[name=${nombre}]`).forEach((r) => (r.onchange = () => alCambiar(r.value)));
}
