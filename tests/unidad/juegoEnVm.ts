// juegoEnVm.ts: ejecuta el juego entero (los módulos montados, codigoModulos de herramientas/vite/curiolandia.mts) en
// un navegador de mentira dentro de node:vm, para las pruebas que miran lo que los módulos dejan en globalThis (el
// puente de src/modulos.ts): montaje.test.ts y contenido.test.ts. Sin lienzo de verdad el juego no dibuja ni va a la
// portada (las fuentes que pide el arranque no llegan nunca), pero carga todo: dibujos, núcleo, temas, escenas...
import { createContext, runInContext } from 'node:vm';

/** Opciones de ejecutaModulos: lo guardado en localStorage (por clave) y qué hacer con cada fuente que pide el juego. */
export interface OpcionesVm {
  readonly guardado?: Readonly<Record<string, string>>;
  readonly alPedirFuente?: (fuente: string) => void;
}

// ejecutaModulos(modulos, o): ejecuta el código de los módulos con lo justo para que el núcleo arranque (lienzo,
// localStorage, Image, fuentes...) y devuelve su globalThis. Sin nada guardado, el juego empieza una partida nueva.
export function ejecutaModulos(modulos: string, o: OpcionesVm = {}): Record<string, unknown> {
  const guardado = o.guardado ?? {};
  // aplicacion/adultos.ts conecta al cargarse los botones de los paneles y los eventos del lienzo y del documento.
  const lienzo = { width: 0, height: 0, style: {}, getContext: () => ({}), toDataURL: () => '', addEventListener: () => undefined };
  const global: Record<string, unknown> = {
    document: {
      getElementById: () => lienzo, createElement: () => lienzo, addEventListener: () => undefined,
      fonts: { load: (f: string) => { o.alPedirFuente?.(f); return new Promise(() => undefined); } },
    },
    setTimeout: () => 0,
    localStorage: { getItem: (k: string) => guardado[k] ?? null, setItem: () => undefined },
    location: { protocol: 'file:' },
    Image: class { src = ''; complete = false; },
    addEventListener: () => undefined,
    innerWidth: 1600,
    innerHeight: 900,
    performance,
    console,
  };
  global['window'] = global;
  createContext(global);
  runInContext(modulos, global);
  return global;
}
