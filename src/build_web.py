"""Monta la web publicable en dist/ a partir de src/index.html (lo hace antes src/build.sh).

Uso (desde la raíz del repo):  sh src/build.sh && python3 src/build_web.py

Escribe en dist/:
  - index.html: el juego con las fuentes y Three.js locales (sin Google Fonts ni cdnjs), el manifiesto y el registro
    del service worker;
  - manifest.webmanifest y sw.js (caché sin conexión, con nombre VER);
  - todo lo de public/ (fuentes, iconos, three.min.js) y .nojekyll.
Sube VER en cada versión publicada: es el nombre de la caché del service worker y, sin cambiarlo, los móviles siguen
con la versión vieja. El prefijo 'curiolandia-new-' es propio de este juego: en fercala.github.io hay otros juegos
(curiolandia-3d usa 'curiolandia3d-') y el service worker solo borra cachés viejas con su prefijo.
Esta versión no lleva voces grabadas: no hay voz/ ni voz-fer/ que copiar.
"""
import os
import re
import shutil

VER = 'curiolandia-new-v0.1'
PREFIJO = 'curiolandia-new-'

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RAIZ, 'src')
PUBLIC = os.path.join(RAIZ, 'public')
DIST = os.path.join(RAIZ, 'dist')


# html_web(src): cambia el index.html de build.sh para la web: quita Google Fonts y pone las fuentes locales con
# @font-face, añade manifiesto, iconos y metadatos de la app, usa three.min.js local y registra el service worker.
def html_web(src):
    src = re.sub(r'<link rel="preconnect"[^>]*>\n?', '', src)
    src = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>',
                 '<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#7CC86E">'
                 '<link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="apple-touch-icon.png">'
                 '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
                 '<meta name="apple-mobile-web-app-title" content="Curiolandia">'
                 '<meta name="description" content="Curiolandia: un juego para aprender los temas de Educación Infantil'
                 ' (3, 4 y 5 años) con Tito el caracol, en un mundo en 3D.">'
                 '<style>@font-face{font-family:"Andika";font-weight:400 700;font-display:swap;'
                 'src:url(fonts/andika-700-latin.woff2) format("woff2")}@font-face{font-family:"Fredoka";'
                 'font-weight:300 700;font-display:swap;src:url(fonts/fredoka-latin.woff2) format("woff2")}</style>', src)
    src = src.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'three.min.js')
    return src.replace('</html>', '<script>if("serviceWorker" in navigator)addEventListener("load",()=>navigator'
                       '.serviceWorker.register("sw.js").catch(()=>{}))</script></html>')


MANIFIESTO = '''{"name":"Curiolandia","short_name":"Curiolandia","description":"Tito y las preguntas escondidas: los temas de Infantil para 3, 4 y 5 años","start_url":"./","scope":"./","display":"fullscreen","orientation":"landscape","background_color":"#FFF6E6","theme_color":"#7CC86E","lang":"es","icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]}'''

# Service worker: al instalarse guarda los archivos de F en la caché C; al activarse borra solo las cachés viejas de
# este juego (prefijo propio); al pedir algo de su ámbito responde desde la caché y, si no está, lo descarga y lo guarda.
# Sin conexión y sin caché devuelve index.html.
SW = '''const C='%s';const F=['./','index.html','three.min.js','manifest.webmanifest','fonts/andika-700-latin.woff2','fonts/fredoka-latin.woff2','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('%s')&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.registration.scope))return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res}).catch(()=>caches.match('index.html'))))});'''


# monta(): borra dist/ y la vuelve a llenar con la web completa.
def monta():
    shutil.rmtree(DIST, ignore_errors=True)
    shutil.copytree(PUBLIC, DIST)
    with open(os.path.join(SRC, 'index.html'), encoding='utf-8') as f:
        html = html_web(f.read())
    with open(os.path.join(DIST, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    with open(os.path.join(DIST, 'manifest.webmanifest'), 'w', encoding='utf-8') as f:
        f.write(MANIFIESTO)
    with open(os.path.join(DIST, 'sw.js'), 'w', encoding='utf-8') as f:
        f.write(SW % (VER, PREFIJO))
    open(os.path.join(DIST, '.nojekyll'), 'w').close()
    print('web ok', VER, '->', DIST)


if __name__ == '__main__':
    monta()
