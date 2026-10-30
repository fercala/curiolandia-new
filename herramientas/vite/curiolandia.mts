// Plugin de Vite que monta Curiolandia en una sola página: src/head.html y un <script> con el juego (src/modulos.ts y
// todo lo que importa, juntos con rolldown, Three.js incluido: el paquete three, desde la fase 6a). Cambia las fuentes
// de Google por las copias locales de public/ y, al montar para publicar, añade el service worker (sw.js, con la caché curiolandia-new-v<versión de
// package.json>).
// Hasta la fase 2p de la migración la página llevaba además un <script> con los .js de src/ que aún eran globales,
// pegados en un orden fijo (ARCHIVOS, el de src/build.sh); ahora todo el juego son módulos.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'rolldown';
import type { Plugin, ResolvedConfig } from 'vite';

// Prefijo de las cachés del service worker. Es propio de este juego: en fercala.github.io hay otros (curiolandia-3d
// usa 'curiolandia3d-') y el service worker solo borra las cachés viejas que empiezan por él.
export const PREFIJO_CACHE = 'curiolandia-new-';

// Cabecera de la página: lo que build.sh ponía delante de head.html.
const CABECERA = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" ' +
  'content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">';

// Lo que sustituye a la hoja de Google Fonts: manifiesto, iconos y datos de la app, y las fuentes locales.
const META_WEB = '<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#7CC86E">' +
  '<link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="apple-touch-icon.png">' +
  '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">' +
  '<meta name="apple-mobile-web-app-title" content="Curiolandia">' +
  '<meta name="description" content="Curiolandia: un juego para aprender los temas de Educación Infantil' +
  ' (3, 4 y 5 años) con Tito el caracol, en un mundo en 3D.">' +
  '<style>@font-face{font-family:"Andika";font-weight:400 700;font-display:swap;' +
  'src:url(fonts/andika-700-latin.woff2) format("woff2")}@font-face{font-family:"Fredoka";' +
  'font-weight:300 700;font-display:swap;src:url(fonts/fredoka-latin.woff2) format("woff2")}</style>';

// En el servidor de desarrollo, el cliente de Vite (recarga la página al guardar). La página se pone después de que
// Vite procese index.html, así que hay que añadirlo a mano.
const CLIENTE_VITE = '<script type="module" src="/@vite/client"></script>';

const REGISTRO_SW = '<script>if("serviceWorker" in navigator)addEventListener("load",()=>navigator' +
  '.serviceWorker.register("sw.js").catch(()=>{}))</script>';

// Los <link rel="preconnect"> a Google Fonts, uno por línea en head.html.
// Quita '<link rel="preconnect" href="https://fonts.googleapis.com">\n'; deja '<link rel="manifest" href="m">'.
// https://regex101.com/?flavor=javascript&regex=%3Clink%20rel%3D%22preconnect%22%5B%5E%3E%5D*%3E%5Cn%3F&flags=g&testString=%3Clink%20rel%3D%22preconnect%22%20href%3D%22https%3A%2F%2Ffonts.googleapis.com%22%3E%0A%3Clink%20rel%3D%22manifest%22%20href%3D%22m%22%3E
const PRECONNECT = /<link rel="preconnect"[^>]*>\n?/g;

// La hoja de estilos de Google Fonts de head.html.
// Casa con '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Andika">'; no con '<link rel="stylesheet" href="x.css">'.
// https://regex101.com/?flavor=javascript&regex=%3Clink%20rel%3D%22stylesheet%22%20href%3D%22https%3A%2F%2Ffonts%5C.googleapis%5C.com%5B%5E%3E%5D*%3E&flags=g&testString=%3Clink%20rel%3D%22stylesheet%22%20href%3D%22https%3A%2F%2Ffonts.googleapis.com%2Fcss2%3Ffamily%3DAndika%22%3E%0A%3Clink%20rel%3D%22stylesheet%22%20href%3D%22x.css%22%3E
const GOOGLE_FONTS = /<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/g;

export interface OpcionesPagina {
  // Carpeta con head.html y src/modulos.ts.
  readonly src: string;
  // true al montar para publicar: añade el registro del service worker. false en el servidor de desarrollo: sin
  // service worker (para que la caché no sirva una versión vieja mientras se trabaja) y con el cliente de Vite.
  readonly conServiceWorker: boolean;
}

// Entrada de los módulos, dentro de src/.
export const ENTRADA_MODULOS = 'modulos.ts';

// codigoModulos(src): src/modulos.ts y todo lo que importa, juntos en una función que se ejecuta al cargar (formato
// iife: un <script> normal, que corre en cuanto el navegador lo lee, como el código global de antes; un <script
// type="module"> esperaría a que se leyera toda la página). Quita los tipos de TypeScript y los comentarios; no
// minimiza. Falla si el código lleva «</script», que cerraría la etiqueta.
export async function codigoModulos(src: string): Promise<string> {
  const salida = await build({ input: join(src, ENTRADA_MODULOS), write: false, output: { format: 'iife' } });
  const trozos = salida.output.filter((o) => o.type === 'chunk');
  const [trozo] = trozos;
  if (trozos.length !== 1 || !trozo) throw new Error(`${ENTRADA_MODULOS} debería dar un solo trozo y da ${trozos.length}`);
  if (/<\/script/i.test(trozo.code)) throw new Error(`${ENTRADA_MODULOS}: el código lleva «</script»`);
  return trozo.code;
}

// paginaJuego(o): la página completa del juego: cabecera, head.html y el <script> con los módulos.
export async function paginaJuego(o: OpcionesPagina): Promise<string> {
  const cabeza = readFileSync(join(o.src, 'head.html'), 'utf8')
    .replace(PRECONNECT, '')
    .replace(GOOGLE_FONTS, META_WEB);
  const registro = o.conServiceWorker ? REGISTRO_SW : '';
  const cliente = o.conServiceWorker ? '' : CLIENTE_VITE;
  const modulos = await codigoModulos(o.src);
  return `${CABECERA}${cliente}\n${cabeza}<script>\n${modulos}</script>\n${registro}</html>\n`;
}

// serviceWorker(cache): el sw.js. Al instalarse guarda los archivos básicos en la caché; al activarse borra solo las
// cachés viejas de este juego (PREFIJO_CACHE); al pedir algo de su ámbito responde desde la caché y, si no está, lo
// descarga y lo guarda. Sin conexión y sin caché devuelve index.html.
export function serviceWorker(cache: string): string {
  return `const C='${cache}';const F=['./','index.html','manifest.webmanifest','fonts/andika-700-latin.woff2','fonts/fredoka-latin.woff2','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('${PREFIJO_CACHE}')&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.registration.scope))return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res}).catch(()=>caches.match('index.html'))))});`;
}

// nombreCache(raiz): 'curiolandia-new-v' + la versión de package.json. Subir la versión cambia la caché y hace que
// los móviles descarguen la nueva.
export function nombreCache(raiz: string): string {
  const paquete: unknown = JSON.parse(readFileSync(join(raiz, 'package.json'), 'utf8'));
  const version = typeof paquete === 'object' && paquete !== null && 'version' in paquete ? paquete.version : undefined;
  if (typeof version !== 'string' || !version) throw new Error('package.json no tiene "version"');
  return `${PREFIJO_CACHE}v${version}`;
}

// curiolandia(): el plugin. Sustituye index.html (que en la raíz es solo un aviso) por la página del juego, recarga
// el navegador cuando cambia algo de src/ en el servidor de desarrollo y, al montar, escribe sw.js y .nojekyll.
export function curiolandia(): Plugin {
  const estado: { config?: ResolvedConfig } = {};
  const src = (): string => join(estado.config?.root ?? process.cwd(), 'src');
  return {
    name: 'curiolandia',
    configResolved(config) {
      estado.config = config;
    },
    // 'post': la página se pone después de que Vite procese index.html, así Vite no toca el CSS ni los <script>
    // (los minimizaría y cambiaría, por ejemplo, color-scheme) y la página sale igual que con build.sh.
    transformIndexHtml: {
      order: 'post',
      handler: async () => paginaJuego({ src: src(), conServiceWorker: estado.config?.command === 'build' }),
    },
    configureServer(server) {
      server.watcher.add(src());
      server.watcher.on('change', (ruta) => {
        if (ruta.startsWith(src())) server.ws.send({ type: 'full-reload' });
      });
    },
    generateBundle() {
      const raiz = estado.config?.root ?? process.cwd();
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: serviceWorker(nombreCache(raiz)) });
      this.emitFile({ type: 'asset', fileName: '.nojekyll', source: '' });
    },
  };
}
