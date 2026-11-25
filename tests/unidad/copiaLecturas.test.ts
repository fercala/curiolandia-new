// Recuperación de copias: las lecturas fuera de orden y las confirmaciones antiguas no deben sustituir la elección actual.
// Se usa el decodificador JSON real y un panel mínimo, con archivos sintéticos cuyo final decide cada prueba.
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

vi.mock('../../src/nucleo/indice.ts', () => ({
  KEY: 'partida-prueba',
  S: { temas: {}, name: 'Partida actual', coins: 91 },
  fmtHtml: (texto: string, valores: Record<string, unknown>) =>
    Object.entries(valores).reduce((t, [k, v]) => t.replaceAll('{' + k + '}', String(v)), texto),
  save: vi.fn(),
  today: () => '2026-11-25',
  trHtml: vi.fn(),
}));
vi.mock('../../src/aplicacion/puertos.ts', () => ({ escribirGuardado: vi.fn(() => true) }));

import { bkWire } from '../../src/aplicacion/adultos/copiaSeguridad.ts';
import { escribirGuardado } from '../../src/aplicacion/puertos.ts';

// pendiente(): lectura de archivo que se puede terminar o rechazar después de otra selección.
function pendiente() {
  let resolver!: (texto: string) => void;
  let rechazar!: (error: Error) => void;
  const promesa = new Promise<string>((res, rej) => {
    resolver = res;
    rechazar = rej;
  });
  return { promesa, resolver, rechazar };
}

// panel(): campos de la copia de seguridad y eventos reales de bkWire, sin navegador ni partida personal.
function panel() {
  const campos = new Map<string, { value: string; innerHTML: string; files: File[] }>();
  for (const id of ['msg', 'txt', 'code', 'copy', 'dl', 'load', 'choose', 'file', 'ok'])
    campos.set('#a-bk-' + id, { value: '', innerHTML: '', files: [] });
  const q = (s: string) => campos.get(s)! as unknown as HTMLInputElement;
  bkWire(q);
  return {
    q,
    mensaje: () => q('#a-bk-msg').innerHTML,
    leer(archivo: File) {
      campos.get('#a-bk-file')!.files = [archivo];
      return Promise.resolve(
        q('#a-bk-file').onchange!.call(q('#a-bk-file'), { target: q('#a-bk-file') } as unknown as Event),
      );
    },
  };
}

// copia(nombre): JSON válido con un nombre reconocible en el resumen.
const copia = (name: string) => JSON.stringify({ name, temas: {}, coins: 37 });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('location', { reload: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());

test('una lectura anterior que acaba tarde no reemplaza el resumen de la última elección', async () => {
  const p = panel(),
    lenta = pendiente();
  const primera = new File([], 'primera.json');
  vi.spyOn(primera, 'text').mockReturnValue(lenta.promesa);
  const lectura = p.leer(primera);
  await p.leer(new File([copia('Última elección')], 'ultima.json'));
  expect(p.mensaje()).toContain('Última elección');
  lenta.resolver(copia('Elección antigua'));
  await lectura;
  expect(p.mensaje()).toContain('Última elección');
  expect(p.mensaje()).not.toContain('Elección antigua');
  expect(escribirGuardado).not.toHaveBeenCalled();
});

test('el error de una lectura anterior no borra el resumen de la última elección', async () => {
  const p = panel(),
    lenta = pendiente();
  const primera = new File([], 'primera.json');
  vi.spyOn(primera, 'text').mockReturnValue(lenta.promesa);
  const lectura = p.leer(primera);
  await p.leer(new File([copia('Última elección')], 'ultima.json'));
  lenta.rechazar(new Error('Fallo de la selección anterior'));
  await lectura;
  expect(p.mensaje()).toContain('Última elección');
  expect(p.mensaje()).not.toContain('No se pudo leer');
  expect(escribirGuardado).not.toHaveBeenCalled();
});

test('empezar otra lectura invalida una confirmación anterior sin escribir la partida', async () => {
  const p = panel();
  await p.leer(new File([copia('Elección antigua')], 'antigua.json'));
  const confirmarAnterior = p.q('#a-bk-ok').onclick!;
  const lenta = pendiente(),
    siguiente = new File([], 'siguiente.json');
  vi.spyOn(siguiente, 'text').mockReturnValue(lenta.promesa);
  const lectura = p.leer(siguiente);
  confirmarAnterior.call(p.q('#a-bk-ok'), {} as PointerEvent);
  expect(escribirGuardado).not.toHaveBeenCalled();
  expect(location.reload).not.toHaveBeenCalled();
  expect(p.mensaje()).not.toContain('Elección antigua');
  lenta.resolver(copia('Última elección'));
  await lectura;
});

test('recuperar un código posterior deja sin efecto la lectura de archivo pendiente', async () => {
  const p = panel(),
    lenta = pendiente(),
    archivo = new File([], 'pendiente.json');
  vi.spyOn(archivo, 'text').mockReturnValue(lenta.promesa);
  const lectura = p.leer(archivo);
  p.q('#a-bk-txt').value = copia('Código posterior');
  await p.q('#a-bk-load').onclick!.call(p.q('#a-bk-load'), {} as PointerEvent);
  lenta.resolver(copia('Archivo antiguo'));
  await lectura;
  expect(p.mensaje()).toContain('Código posterior');
  expect(p.mensaje()).not.toContain('Archivo antiguo');
  expect(escribirGuardado).not.toHaveBeenCalled();
});

test('un código inválido retira la confirmación anterior y permite volver a intentarlo', async () => {
  const p = panel();
  await p.leer(new File([copia('Copia anterior')], 'anterior.json'));
  const confirmarAnterior = p.q('#a-bk-ok').onclick!;
  p.q('#a-bk-txt').value = '{"temas":null}';
  await p.q('#a-bk-load').onclick!.call(p.q('#a-bk-load'), {} as PointerEvent);
  expect(p.mensaje()).toContain('Eso no parece una copia de Curiolandia');
  expect(p.mensaje()).not.toContain('a-bk-ok');
  confirmarAnterior.call(p.q('#a-bk-ok'), {} as PointerEvent);
  expect(escribirGuardado).not.toHaveBeenCalled();
  p.q('#a-bk-txt').value = copia('Código corregido');
  await p.q('#a-bk-load').onclick!.call(p.q('#a-bk-load'), {} as PointerEvent);
  expect(p.mensaje()).toContain('Código corregido');
  expect(p.mensaje()).toContain('a-bk-ok');
  expect(escribirGuardado).not.toHaveBeenCalled();
});
