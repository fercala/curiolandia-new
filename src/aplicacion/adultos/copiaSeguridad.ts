// adultos/copiaSeguridad.ts: la COPIA DE SEGURIDAD (antes en aplicacion/adultos.ts; desde la fase A1 de
// docs/PLAN-MENU-ADULTOS.md en su módulo): bkEncode/bkDecode convierten S en un código de texto o un archivo JSON y al
// revés, y bkWire conecta los botones de la página «Copia y aparato». Usa esPartida (dominio/partida.ts) y
// escribirGuardado (aplicacion/puertos.ts).
import type { Libre } from '../../nucleo/tipos.ts';
import { KEY, S, today } from '../../nucleo/indice.ts';
import { esPartida } from '../../dominio/partida.ts';
import { escribirGuardado } from '../puertos.ts';
import { esc } from './comun.ts';

// bk64(bytes): bytes a base64 (por trozos de 32 KB, porque fromCharCode con muchos argumentos revienta).
const bk64 = (u: Uint8Array) => {
  let s = '';
  for (let i = 0; i < u.length; i += 0x8000)
    s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000) as unknown as number[]);
  return btoa(s);
};
// bkUn64(texto): base64 a bytes.
const bkUn64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
// bkEncode(): convierte S en un código de copia: 'CURIO1.' + base64 del JSON comprimido con gzip, o 'CURIO0.' + base64 del
// JSON sin comprimir si el navegador no tiene CompressionStream.
export async function bkEncode() {
  const j = JSON.stringify(S);
  if (typeof CompressionStream === 'function') {
    try {
      const st = new Blob([j]).stream().pipeThrough(new CompressionStream('gzip'));
      return 'CURIO1.' + bk64(new Uint8Array(await new Response(st).arrayBuffer()));
    } catch (e) {}
  }
  return 'CURIO0.' + bk64(new TextEncoder().encode(j));
}
// bkDecode(código): al revés que bkEncode. Acepta también el JSON tal cual (archivo descargado). Comprueba que parece una
// partida (esPartida, de dominio/partida.ts: un objeto, ni null ni una lista, y con temas, que también lo es) y devuelve
// el objeto; si no, lanza Error('formato') o Error('navegador'). La versión no se mira aquí: load() la pone al día.
export async function bkDecode(code: string): Promise<Libre> {
  code = String(code || '').trim();
  let j: string;
  if (code.startsWith('{')) j = code;
  else {
    code = code.replace(/\s+/g, '');
    const m = code.match(/^CURIO([01])\.([A-Za-z0-9+/=]+)$/);
    if (!m) throw new Error('formato');
    const u = bkUn64(m[2]);
    if (m[1] === '1') {
      if (typeof DecompressionStream !== 'function') throw new Error('navegador');
      j = await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
    } else j = new TextDecoder().decode(u);
  }
  const d: unknown = JSON.parse(j);
  if (!esPartida(d) || !esPartida(d['temas'])) throw new Error('formato');
  return d;
}
// bkWire(q): conecta los botones de la sección "Copia de seguridad": ver código, copiarlo, descargar archivo .json,
// recuperar desde código o archivo. Al recuperar, enseña un resumen y, si se confirma, escribe la copia directamente en
// el guardado (escribirGuardado; en el navegador, localStorage) y recarga la página (load() de nucleo/guardado.ts la pone al día y la mezcla con DEF como cualquier
// partida guardada).
export function bkWire(q: (s: string) => HTMLInputElement) {
  const msg = (h: string) => {
      q('#a-bk-msg').innerHTML = h;
    },
    ta = q('#a-bk-txt');
  q('#a-bk-code').onclick = async () => {
    ta.value = await bkEncode();
    ta.select();
    msg('Este código tiene todo el progreso. Copialo y guardalo, por ejemplo mandándotelo por mensaje.');
  };
  q('#a-bk-copy').onclick = async () => {
    if (!ta.value.startsWith('CURIO')) ta.value = await bkEncode();
    ta.select();
    let ok = false;
    try {
      await navigator.clipboard.writeText(ta.value);
      ok = true;
    } catch (e) {
      try {
        ok = document.execCommand('copy');
      } catch (e2) {}
    }
    msg(ok ? '✅ Código copiado.' : 'Seleccioná el código de arriba y copialo a mano.');
  };
  q('#a-bk-dl').onclick = () => {
    const b = new Blob([JSON.stringify(S)], { type: 'application/json' }),
      a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'curiolandia-copia-' + today() + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1500);
    msg('Si no se descargó nada, usá el código de copia.');
  };
  // ask(texto): intenta leer una copia y pide confirmación antes de reemplazar el progreso. Todo lo que viene de la copia
  // y se enseña va escapado (esc) o pasado a número: una copia editada no puede meter HTML en el panel.
  const ask = async (src: string) => {
    let d: Libre;
    try {
      d = await bkDecode(src);
    } catch (e) {
      msg(
        (e as Error).message === 'navegador'
          ? 'Este navegador no puede abrir ese código. Prueba con el archivo de copia.'
          : '❌ Eso no parece una copia de Curiolandia. Revisá que el código esté completo.',
      );
      return;
    }
    const nT = Object.values<Libre>(d.temas || {}).filter((t) => t && t.done).length,
      nG = Object.values<Libre>(d.temas || {}).reduce((a: number, t) => a + Object.keys((t && t.g) || {}).length, 0);
    msg(
      `Copia encontrada${d.name ? ' de <b>' + esc(d.name) + '</b>' : ''}: ${nT} temas terminados, ${nG} juegos jugados y ${Math.max(0, Math.floor(+d.coins) || 0)} monedas. <b>Reemplaza el progreso actual de este dispositivo.</b> <button id="a-bk-ok" class="danger">Sí, recuperar esta copia</button>`,
    );
    q('#a-bk-ok').onclick = () => {
      if (!escribirGuardado(KEY, JSON.stringify(d))) {
        msg('❌ No se pudo guardar en este navegador.');
        return;
      }
      location.reload();
    };
  };
  q('#a-bk-load').onclick = () => ask(ta.value);
  q('#a-bk-file').onchange = (e) => {
    const f = (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files![0];
    if (!f) return;
    f.text().then((t) => ask(t));
  };
}
