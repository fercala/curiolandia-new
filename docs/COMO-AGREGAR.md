# Cómo añadir funcionalidades

Esta guía explica el **proceso de trabajo** (sección 1) y trae **recetas paso a paso** para los cambios más habituales (secciones 2 a 13). Antes de empezar, lee [ARQUITECTURA.md](ARQUITECTURA.md).

Índice:
1. [El proceso de trabajo](#1-el-proceso-de-trabajo)
2. [Reglas que no se pueden saltar](#2-reglas-que-no-se-pueden-saltar)
3. [Un objeto 3D nuevo que se pueda tocar](#3-un-objeto-3d-nuevo-que-se-pueda-tocar)
4. [Un tema nuevo](#4-un-tema-nuevo)
5. [Un juego nuevo dentro de un tema](#5-un-juego-nuevo-dentro-de-un-tema)
6. [Un tipo de juego nuevo (componente)](#6-un-tipo-de-juego-nuevo-componente)
7. [Un cuento](#7-un-cuento)
8. [Un dibujo](#8-un-dibujo)
9. [Un artículo de la tienda o un regalo del cofre](#9-un-artículo-de-la-tienda-o-un-regalo-del-cofre)
10. [Canciones, rutinas, trazos, fiestas e inglés](#10-canciones-rutinas-trazos-fiestas-e-inglés)
11. [Una escena o una zona nueva](#11-una-escena-o-una-zona-nueva)
12. [Una opción en la zona de adultos](#12-una-opción-en-la-zona-de-adultos)
13. [Una letra de la Isla de las Letras](#13-una-letra-de-la-isla-de-las-letras)

---

## 1. El proceso de trabajo

### Lo que necesitas
- `git`, `sh`, Python 3, Node.js y un navegador.
- Para las pruebas automáticas: `npm ci && npx playwright install chromium` (Playwright está fijado en `package.json`).

### Paso a paso

1. **Trae lo último**: `git pull`.
2. **Crea una rama** para tu cambio: `git checkout -b mi-cambio`. (El dueño del proyecto decide si se fusiona a `main`.)
3. **Edita solo `src/`** (y `public/` para fuentes o iconos). La web montada (`dist/`) no se edita ni se sube: se genera.
4. **Monta el juego** desde la raíz del repo: `npm run build` (deja la web completa en `dist/`). Mientras trabajas, `npm run dev` sirve el juego y recarga al guardar.
5. **Prueba a mano**: `npm run preview` (o `cd dist && python3 -m http.server 8000`) y abre http://localhost:8000. Juega lo que has cambiado. Abre la consola del navegador (F12) y comprueba que no hay errores en rojo.
   - Trucos de consola: `__cl.S.age=5; __cl.S.unlockAll=true; __cl.go('map')` (todo abierto); `__cl.go('casita',{t:'3A-T1'})` (ir a un tema); `window.__fast=1; window.__said=[]` (la voz no espera y `__said` guarda lo que dice Tito: útil para copiar frases exactas).
   - Para probar de noche sin esperar: en la consola, `Date.prototype.getHours=()=>22; __cl.go('map')`.
6. **Prueba automática**: `npm run test:humo` (debe terminar con `TODO BIEN`; capturas en `tests/capturas/`) y `npm run test:pr`, lo mismo que pasa GitHub Actions en cada PR (unos minutos; las pruebas de una en una, nunca a la vez).
7. **Prueba en un móvil** si has tocado algo visual o de rendimiento (el 3D es lo más pesado).
8. **Frases nuevas o cambiadas**: apúntalas en `dialogos/pendientes.txt` y rehaz `dialogos/todos.csv` con `npm run dialogos` (ver [dialogos/LEEME.md](../dialogos/LEEME.md)).
9. **Documenta el cambio** siguiendo [POLITICA-DOCUMENTACION.md](POLITICA-DOCUMENTACION.md): comentarios en el código, documentos de `docs/` que toque y entrada en [CAMBIOS.md](CAMBIOS.md). Comprueba con `npm run test:comentarios` (GitHub Actions lo pasa también en cada PR).
10. **Para publicar**:
   1. Sube `version` en `package.json` (`0.N.0` → `0.N+1.0`): es el nombre de la caché del service worker. **Sin esto los móviles se quedan con la versión anterior.**
   2. Pon la versión en la entrada de [CAMBIOS.md](CAMBIOS.md).
   3. Abre un PR. Al fusionarlo en `main`, GitHub Actions monta, pasa las pruebas y publica `dist/` en GitHub Pages.
11. **Si te equivocas** al publicar: `git revert` del commit en `main`, sube `version` y fusiona otra vez.

### Cómo orientarte en el código
- Todo el código está comentado: cada archivo tiene una cabecera que explica qué hace y cada función tiene un comentario encima.
- Las líneas son muy largas (el código está escrito de forma compacta). Usa la búsqueda del editor o `grep -rn "nombreFuncion" src/` para encontrar las cosas.
- Si algo "no hace caso" a tu cambio en el mapa, una zona, la casita, el cofre o la portada, probablemente lo has cambiado solo en la escena 2D y el juego usa la 3D (`mundo3d/`), o al revés: desde la fase 4k ya nada se envuelve, pero esas escenas tienen dos implementaciones (ver "Capas" en ARQUITECTURA.md). Busca el nombre en todos los archivos.
- No se puede reasignar lo que se importa de otro módulo (`x = ...`): usa `VIVO.x` o su función `pon*` (ARQUITECTURA.md, «Leer sí, reasignar no»). Si hace falta una nueva, añade el campo a `VIVO` y al tipo `Vivo`, o una función `pon*` junto a la variable. `npm run tipos` lo marca como error.
- Hay código antiguo que ya no se usa (sobre todo en `escenas/escenas2d.ts`: el mapa, el jardín y la casita v1). Está marcado en los comentarios.

## 2. Reglas que no se pueden saltar

1. **Cada diálogo nuevo o cambiado**, en castellano de España y apuntado en `dialogos/pendientes.txt`, con `dialogos/todos.csv` rehecho por `npm run dialogos` (aquí no hay MP3: los textos se pueden mejorar). → [dialogos/LEEME.md](../dialogos/LEEME.md)
2. **No rompas las partidas guardadas**: no cambies el formato de `S`, ni `id` de temas, artículos o dibujos guardados; campos nuevos con valor por defecto; y si un formato tiene que cambiar, con una migración (`dominio/partida.ts`). → [ESTADO-GUARDADO.md](ESTADO-GUARDADO.md)
3. **Los juegos de un tema se guardan por posición**: no quites ni reordenes juegos publicados; los nuevos, al final (cuidado con el cuento: ver receta 5).
4. **Sube `version` en `package.json`** cada vez que publiques.
5. **Sin dependencias nuevas** en el juego hasta la fase 1 de la migración (`npm` solo trae Playwright para las pruebas).
6. **Piensa en niños de 3 a 5 años**: zonas de toque grandes, nada de leer (todo se dice en voz), refuerzo positivo, nada de castigos ni prisas.
7. **Usa `later()`**, no `setTimeout`, dentro de las escenas y los juegos. Una frase que el juego dice solo, sin que el niño toque (una consigna con `later()`), va con `sayQ()`: espera a que Tito acabe lo que esté diciendo. Si es una pregunta, comprueba antes que el niño no la haya respondido ya. Tras un segundo fallo, pon `idle=12` **después** del `say()`.
8. **Un premio se guarda antes de celebrarlo**: si marcas algo como cobrado (`S.gift`, `R.paid`...), suma las monedas y la pegatina en ese mismo momento (`creditCoins(n)` y `S.stk[k]++`, luego `save()`; cuántas monedas da cada cosa está en `MONEDAS`, en `dominio/monedas.ts`), y deja para la animación `giveCoins(n, x, y, icono, true)` y `giveSticker(k, true)`, que ya no suman. `later()` se anula al cambiar de escena: lo que va dentro se puede perder.
9. **La hora, el azar y lo guardado, de sus puertos**: `ahora()` en vez de `new Date()` o `Date.now()`, `azar()` (o `rnd`, `ri`, `pick`, `shuffle`) en vez de `Math.random()`, y `save()` (o, para otra clave, `leerGuardado` y `escribirGuardado`) en vez de `localStorage`. Están en `aplicacion/puertos.ts` (desde las fases 3g y 3h); una prueba comprueba que no se usan los del navegador fuera de `src/infraestructura/`.
10. **Documenta cada cambio**: sin comentarios ni documentación al día no se publica. → [POLITICA-DOCUMENTACION.md](POLITICA-DOCUMENTACION.md)

---

## 3. Un objeto 3D nuevo que se pueda tocar

Ejemplo: un caracolito en el Jardín que da un saltito al tocarlo. Todo va en la capa 3D, `src/mundo3d/` (con tipos: el mundo es `Mundo`, de `mundo3d/tipos.ts`): el modelo en `objetos.ts`, dónde se pone en `zonas3d.ts` (o `mapa3d.ts`, `casita3d.ts`, `cofre3d.ts`), cómo se toca en `interaccion.ts` y su nombre en `cielo.ts`.

1. **Crear el modelo.** En `mundo3d/objetos.ts`, junto a los demás constructores de objetos (`frog3`, `can3`, `kite3`...), copia uno parecido y adáptalo (con `export`, para que lo usen los otros módulos):
   ```js
   // Caracolito del jardín: al tocarlo da un saltito (dur 0,8 s)
   export function snail3(w,x,z,s){const g=grp(w.sc,[x,0,z],s);g.userData.snail=1;g.userData.dur=.8;
     mk(Sph(.4,14,10),'#F2B85A',{p:[0,.4,0],to:g,ol:.03});  // mk(geometría, color, {p: posición, s: escala, r: giro, to: padre, ol: grosor del contorno})
     hitS(g,.8,.4);                                         // bola de toque invisible, más grande que el dibujo (dedos pequeños)
     w.upd.push(()=>{const k=g.userData.wob,e=k==null?9:T-k,q=Math.min(e/.8,1);  // e = segundos desde el toque
       g.position.y=e<.8?Math.sin(q*PI)*.5:0});
     return g}
   ```
   Usa `grp`, `mk`, `Sph/Cyl/Box/Cone`, y `gcache` para piezas que se repiten. Colores de la paleta (`FLC`, `DIAC`).
2. **Colocarlo.** En `zoneDecor(w,z)` (`mundo3d/zonas3d.ts`, que lo importa de `objetos.ts`), dentro del `if(z==='jardin'){...}`, añade `snail3(w,-4,6.5,1.1)`. Coordenadas del suelo: x de -16 a 16, z de -8 a 9 (z positiva = hacia delante). En el mapa se coloca en `buildMap`, en la casita en `buildCasita` y en el cofre en `buildCofre`. Si solo sale de día: `if(!skyNow().night)`. Si Tito no debe pisarlo: `(w.avoid=w.avoid||[]).push([x,z,radio])`.
3. **Hacerlo tocable.** Añade `||o.userData.snail` a `WOBK` (`mundo3d/interaccion.ts`). Si se mueve o está delante de las casitas, añádelo también a la lista de `flyTap`.
4. **Que use su propia animación.** Añade `||u.snail` a la lista larga de `wobInit` (la que acaba en `...||u.sat){if(e>(u.dur||1.6))u.wob=null;continue}`). Si no, además se balanceará como un árbol.
5. **Su reacción.** En `wobTap`, añade una rama antes del `else` final, con un comentario:
   ```js
   // caracolito (jardín): brillitos y un sonido agudo
   else if(u.snail){dropParts(x,y-20,4,['#FFF3B0','#FFFFFF'],'d');tone(660,.12,'sine',.08,1.4)}
   ```
   Herramientas: `parts.push(...)`, `dropParts`, `noteParts`, `sparkles`, `tone`, `noise`, `chainWob(w,'frog',.6,0,1)` (hace reaccionar a otro objeto), `allTap(w,t,'grupo',x,y,N)` (cuenta en voz alta los objetos distintos tocados), `SCENES[sceneName].hop=T` (Tito salta).
6. **Que Tito lo nombre** (opcional). Añade una fila a `NAMES3` (`mundo3d/cielo.ts`): `['snail','El caracol.','CARACOL',1]` (1 = de noche duerme y no se nombra) y la palabra a `SYL3`: `CARACOL:'CA RA COL'`. **Gana la primera clave de `NAMES3` que tenga el objeto**: ponla antes de cualquier otra marca que también lleve. La frase debe existir grabada o apuntarse para grabar.
7. **Probar** de día y de noche, en el móvil también.

## 4. Un tema nuevo

1. **Dibujos y nombres**: comprueba que existen en `PICS` todas las claves (icono, palabras). Si falta alguno, ver receta 8. Los nombres hablados van en `LEX` (`trompeta:'la trompeta'`).
2. **Añade el tema al final** de `T3` (temas/temas.ts), `T4` (temas/temas4.ts) o `T5` (temas/temas5.ts):
   ```js
   {id:'4A-T13',zone:'bosque',n:'Los instrumentos',icon:'guitarra',c:'#9B8AD9',trim:3,bg:BG.fiesta,
    words:[{k:'guitarra',say:'La guitarra. Tiene seis cuerdas.'},{k:'tambor'},{k:'piano'}],
    intro:'Estos son los instrumentos. Toca cada uno para conocerlo.',
    games:[{t:'conocer'},{t:'busca'},{t:'memoria'}]}
   ```
   - `id` único y **definitivo** (es la clave del progreso guardado).
   - `bg`: un fondo de `BG` (temas/temas.ts y temas/temas4.ts tienen la lista). Para uno nuevo, añádelo en el `Object.assign(BG,{...})` de temas/temas4.ts.
   - `zone`: la zona de su lista (`'jardin'` en `T3`, `'bosque'` en `T4`, `'montana'` en `T5`). Es obligatoria desde la fase 5a.
   - `season` (opcional): `'otoño'`, `'invierno'`... Es informativo: el código no lo lee.
   - Los temas son módulos TypeScript (formato: `Tema`, `JuegoTema` y `Palabra` en `src/juegos/tipos.ts`, con un comentario por campo; desde la fase 5a son tipos cerrados, así que un campo mal escrito o que falta lo avisa `npm run tipos`). Si el juego usa un componente o una ayuda que el archivo aún no importa, añádelo a su `import` (`npm run tipos` lo avisa); si exportas algo nuevo, el puente lo deja también en `globalThis` (la prueba `globales` avisa si otro módulo ya exporta ese nombre).
3. **Límites**: cada camino tiene sitio para **12 casitas** (`zonePos()` en escenas/zonas.ts) y cada casita para **unos 8 juegos** (`st3Pos()` en mundo3d/casita3d.ts), contando el cuento. Para más hay que ampliar esas funciones.
4. **No metas un tema en medio del camino** de una zona publicada: cambiaría qué casitas están abiertas para los niños que ya juegan.
5. Se abre solo cuando se termina el anterior: no hay que registrarlo en ningún otro sitio (escenas/escenas2d.ts lo añade a `TEMAS` y escenas/zonas.ts al camino).
6. Apunta todas las frases nuevas para grabar.
7. `npm run test:unidad` comprueba el contenido (`tests/unidad/contenido.test.ts`): que el id no se repita, que la zona sea la de su lista, que existan todos los dibujos y el fondo y que cada juego se pueda crear. Si falla, el mensaje dice qué tema y qué campo.

## 5. Un juego nuevo dentro de un tema

En la lista `games` del tema:

- **Genérico** (usa las `words` del tema): `{t:'conocer'}`, `{t:'busca'}`, `{t:'memoria'}`.
- **Con configuración propia**: elige un componente y pásale su configuración:
  ```js
  {t:'sonido', icon:'leon', name:'¿Quién hace este sonido?',
   make:(d,t)=>Sonido({items:['leon','vaca','perro'], bg:t.bg}, d)}
  ```
  `d` es la función que avisa de que el juego ha terminado: pásala siempre como segundo argumento. `t` (el campo) debe ser único dentro del tema.

**Cuidado con el progreso guardado:** se guarda por posición. Añade el juego **al final**. Pero si el tema tiene cuento en `CUENTOS`, `temas/extras.ts` añade el cuento al final automáticamente, y tu juego nuevo le quitaría su posición. En ese caso escribe el cuento a mano como último juego actual y pon el tuyo detrás:
```js
games:[ ...los que había..., {t:'cuento',icon:'libro',name:'El cuento'}, {t:'tuJuego', ...} ]
```

### Componentes disponibles

| Componente | Qué hace | Configuración principal |
|---|---|---|
| `ChoiceGame` | "Toca el correcto" entre tarjetas (base de muchos) | `rounds, gen(i)→{words, ok, ask, okSay, badSay}, key, bg` |
| `Busca` | ¿Dónde está...? | `items, ask(k), okSay, rounds` |
| `Sonido` | ¿Quién hace este sonido? | `items` (con sonido en `SOUNDS`) |
| `Conocer` | Tarjetas que se abren en grande con voz | `items, intro` |
| `Cuerpo` | Tocar partes del cuerpo | `mode:'free'/'ask', only, fine` |
| `Arrastra` | Arrastrar a zonas: clasificar, vestir, guardar, por pasos | `gen(i)→{ask, zones, items, tray, steps, free}, rounds, why, placeSay` |
| `Atrapa` | Burbujas que suben; tocar las que valen | `targets:[{ask, is(k)}], pool, per` |
| `Memoria` | Parejas de cartas | `pool, pairs, intro` |
| `Cuenta` | Contar y elegir el número | `pool, max, rounds` |
| `Puzzle` | Rompecabezas | `list` |
| `Excava` | Frotar la arena para descubrir (máx. 6) | `pool, n, cover, under` |
| `Riega` | Regar macetas | `n, colors` |
| `Pinta` | Elegir el color y pintar | `items:[[clave, color]]` |
| `Secuencia` | Ordenar viñetas | `panels` o `sets, ask, okAll, first` |
| `Une` | Unir parejas con una línea | `pairs:[[a,b]], n, rounds` |
| `Series` | ¿Qué viene después? | `pool` (4 o más) |
| `Lens` | Lupa o linterna para encontrar cosas | `items:[{k,x,y,s}], base, ask(k)` |
| `TocaPartes` | Tocar partes de un dibujo grande | `parts:[{id,n,x,y,r,say}], draw(hl)` |
| `Apaga` | Apagar luces, grifos y teles | `spots:[{t,x,y}]` |
| `Frota` | Frotar para limpiar manchas | `spots:[[x,y,r]], base, tool` |
| `Llena` | Meter N cosas en un recipiente | `pool, zone, ask(n), min, max` (min < max) |
| `Velas` | Soplar velas contando | `n` |
| `Gira`, `Semaforo`, `Cruce` | Día/noche, semáforo, derecha/izquierda | `rounds` |
| `Tracer` | Seguir un trazo con el dedo | `paths:[{pts, say, who, end}]` |
| `Song` | Canción y tocar en orden | `lines, tune, mode` |
| `Story` | Cuento ilustrado y preguntas | un `CUENTOS[id]` |

La explicación detallada de cada uno está en el comentario de cabecera de su función en `src/juegos/comps.ts` y `src/juegos/comps2.ts`. La mejor forma de aprender es copiar un juego parecido de otro tema.

Dificultad automática: `AGE()` (edad), `nOpts()` (número de opciones), `nRounds()` (número de rondas) y `VIVO.REP` (veces que ya se ha jugado) se ajustan solos según la edad y los aciertos. Las reglas (cuántas opciones y rondas, cuándo sube o baja la dificultad) están en `dominio/dificultad.ts`.

## 6. Un tipo de juego nuevo (componente)

1. En `src/juegos/comps2.ts` crea una función exportada con esta forma (la interfaz completa está explicada en la cabecera de `juegos/comps.ts`; los tipos `Config`, `AlTerminar` y `Juego`, en `juegos/tipos.ts`). Importa del núcleo lo que uses; los temas que la usen la importan de `juegos/indice.ts`:
   ```ts
   // MiTipo: <qué hace>. cfg: {bg, key, rounds, ...}. Llama a onDone() una vez al terminar.
   export function MiTipo(cfg: Config, onDone: AlTerminar): Juego{
     const R = cfg.rounds || nRounds();
     return {
       total: R, done: 0, i: 0, errs: 0, busy: false, fin: false,
       enter(){ this.load() },                       // empieza
       load(){ this.errs = 0; say('Consigna en castellano de España.') },
       prompt(){ say('Consigna en castellano de España.') },   // repite la consigna
       hint(){ return {x: 800, y: 450, r: 120} },     // dónde brilla la ayuda (o null)
       draw(){ cfg.bg(); /* pinta todo en 1600x900 */ },
       down(x, y){
         if (this.busy) return;
         if (/* acierto */ true) {
           SFX.good(); rec(cfg.key || 'mitipo', this.errs === 0); onRight(this.errs === 0);
           this.done++; scene!.starPop = T; this.busy = true;
           say(praise(), () => later(400, () => { this.busy = false; this.i++;
             if (this.i >= R) { if (!this.fin) { this.fin = true; onDone() } } else this.load() }));
         } else {
           SFX.bad(); this.errs++; if (this.errs === 1) rec(cfg.key || 'mitipo', false);
           if (this.errs >= 2) onWrongTwice();
         }
       },
     };
   }
   ```
2. Reglas: `done` debe llegar a `total`; `onDone()` una sola vez; usa `later` y no `setTimeout`; para arrastrar usa `VIVO.drag` (ver `Arrastra`).
3. Si no se debe usar en el repaso diario (no tiene aciertos y fallos), añade su `t` a `NOREP` en dominio/repaso.ts.
4. Úsalo en un tema con `make:(d,t)=>MiTipo({...}, d)` y ponle nombre en `GNAME` (escenas/zonas.ts) o con `name`.

## 7. Un cuento

1. Añade una entrada en `CUENTOS` (`src/contenido/cuentos.ts`, con el tipo `Cuento` de `contenido/tipos.ts`) con la clave del `id` del tema:
   ```js
   '4A-T13':{title:'La orquesta de Tito',
     pages:[
       {bg:'fiesta',items:[['nene',560,540,330],['guitarra',920,600,220]],say:'Pablo encontró una guitarra.'},
       {bg:'fiesta',items:[['nene',560,540,330],['tambor',920,620,200]],say:'Después tocó el tambor: ¡pum, pum!'}],
     qs:[{q:'¿Qué encontró Pablo?',ok:'guitarra',opts:['guitarra','pelota'],okSay:'¡La guitarra!'}]},
   ```
   `bg` es un nombre de `BG`; `items` son `[dibujo, x, y, tamaño]` en la pantalla de 1600x900 (con un quinto valor `true`, el dibujo mira al otro lado); `ok` y `opts` son dibujos.
2. Se añade solo como último juego del tema (solo en `T3`, `T4`, `T5`).
3. **Frases que hay que grabar** (el componente `Story` las junta así):
   - primera página: `'Escucha el cuento: ' + título + '. ' + say` (una sola frase);
   - resto de páginas: el `say`;
   - primera pregunta: `'Ahora te pregunto. ' + q`; las demás: `q`;
   - al fallar: `'Mmm, no. Piensa en el cuento. ' + q`.

## 8. Un dibujo

1. Añádelo dentro del `Object.assign(PICS,{...})` del módulo que corresponda, en `src/dibujos/` (`pics-mine.ts` para iconos generales; `pics-a` lugares, oficios y vehículos; `pics-b` 4 años; `pics-c` 5 años; `pics-d` reciclaje, fiestas y cuentos; `pics-e` tienda):
   ```js
   trompeta:`<path d="M-50 0 L20 -14 L20 14 Z" fill="#FFC93C" ${sw()}/><circle cx="-50" cy="0" r="8" fill="#FFC93C" ${sw(4)}/>`,
   ```
   Es el interior de un SVG con el centro en (0,0) y todo dentro de -56..56. `${sw()}` pone el contorno marrón del juego.
   Son módulos TypeScript estrictos: una función de ayuda nueva lleva el tipo de sus parámetros (`(x: number, c: string) =>`)
   y `npm run tipos` tiene que pasar.
2. Comprueba que el nombre no existe ya: `grep -n "trompeta:" src/dibujos/*.ts` (si existe, gana el del módulo que va después en los `import` de `src/modulos.ts`).
3. Añade su nombre hablado a `LEX` en `src/contenido/lex.ts`: `trompeta:'la trompeta'`.
4. Úsalo por su nombre: `pic('trompeta', x, y, tamaño)` o en `words`, `items`...

## 9. Un artículo de la tienda o un regalo del cofre

1. **Dibujo** (receta 8) y **nombre** en `LEX`.
2. **Catálogo**: añade `['trompeta',15,2]` (id, precio en monedas, nivel 1-3) a la lista de su categoría dentro de `SHOP` (escenas/tienda.ts). La tienda enseña 10 por página (2 filas de 5) y pone flechas si hay más. Para una cosa de una habitación de la casa, usa la lista de v1.590 (`[id, precio, nivel, habitación, categoría, nombre]`): con `room` sale con candado mientras esa habitación está cerrada; con `pref` va a esa habitación si está abierta y, si no, al salón.
3. **Si va en la casa de Tito**: su tamaño en `HSIZE` (si va colgado, también en `WALLITEMS`) y, si quieres, qué hace al tocarlo en la tabla de `homeAction`.
4. **Si es ropa**: sombrero con su posición en `HATPOS`. Un tipo de ropa nuevo (por ejemplo zapatos) exige tocar `isWorn`, `wear`, `drawTitoWear` y leer `S.tito.zapatos || ''` (partidas viejas).
5. **Colores** del caparazón o la bufanda: añade el color a `SHELLC`/`SCARFC` y una fila a su lista en `SHOP`.
6. **Regalo del cofre**: añade su id a `GIFTS` (dominio/progreso.ts) en la posición que quieras. Se regalan en orden, saltando los que el niño ya tiene.
7. No cambies ids existentes (están en `S.owned` y `S.home`).
8. **Una habitación nueva**: añádela al final de `ROOMS` (escenas/tienda.ts) con `id`, `n`, `need` (casitas), `ic` y `cer`, y su fondo en `roomBg`. Caben 7 botones entre el título y la tienda; si añades más, hay que juntarlos en `roomBtns`. Sus frases («El …», «Ya está en …», «¡Mi casa creció! …») van a `dialogos/pendientes.txt`.

## 10. Canciones, rutinas, trazos, fiestas e inglés

Todo está en `temas/extras.ts` y `temas/ingles.ts`. Resumen (detalle en los comentarios de cada archivo):

- **Canción**: melodía en `TUNES` (juegos/comps2.ts) → letra en `SONGS` (temas/extras.ts) → juego `{t:'cancion', song:'nombre', icon, name}` en `CAN.games`.
- **Rutina**: viñetas en `RP` con `panel(...)` → juego con `Secuencia` en `RUT.games`.
- **Trazo**: nivel nuevo al final de `TRZ_L()` y subir el número de niveles en `TRZ` (con su icono y nombre).
- **Fiesta**: objeto nuevo al final de `FIESTAS` con `zone:'fiestas'`. Si debe abrirse sola en su época, añade el mes en `fiestaDelMes()` (dominio/apertura.ts).
- **Tema de inglés**: palabras en `EN` (`{en, es, k, a}`; `a` = edad mínima) → tema en `ING` con `en:'conjunto'` y `games:[ENG.conocer, ENG.escucha, ENG.globos]`. Las palabras en inglés las dice la voz inglesa del navegador.
- Comprueba en mundo3d/zonas3d.ts que la zona 3D tiene hueco para otra casita.

## 11. Una escena o una zona nueva

**Escena nueva** (por ejemplo `huerto`):
```js
SCENES.huerto={music:'jardin',
  enter(o){ this.x=0; if(o.hello)later(400,()=>this.prompt()) },
  prompt(){ say('Frase nueva en castellano de España.') },
  hint(){ return {x:800,y:450,r:120} },
  draw(){ sky('#E9F7FC','#F4FBEA'); /* ... */ drawHome(); drawTito(TITO.x,TITO.y,TITO.w) },
  down(x,y){ if(atHome(x,y)){SFX.tap();go('map');return} if(inTito(x,y)){this.prompt();return} /* ... */ SFX.tap();sparkles(x,y) }
};
```
Se entra con `go('huerto', {hello:true})`. Guarda el estado en `this` y prepáralo en `enter`.

**Zona nueva con camino**: `ZONES` en escenas/zonas.ts; `ZAGE`, `MAINZ`, `NEED` y las reglas (`temaAbierto`, `sitioAbierto`, `sitioNecesita`, `siguienteTema`) en dominio/apertura.ts, con su caso en tests/unidad/apertura.test.ts; el mensaje del candado en `lockMsg` (escenas/zonas.ts), lugar en `MZ2`, temas en `TEMAS` (escenas/escenas2d.ts); su estilo en `ZSTYLE` y su decoración en `zoneDecor` (mundo3d/zonas3d.ts), y su lugar en el mapa 3D en `MAPPOS` y `SPOT3` (mundo3d/mapa3d.ts). Es un cambio grande: lee antes los comentarios de cabecera de escenas/zonas.ts y de mundo3d/zonas3d.ts.

## 12. Una opción en la zona de adultos

En `openAdult()` (aplicacion/adultos.ts), cuya cabecera lo explica con detalle:
1. Campo nuevo en `S` con valor por defecto (en `DEF2` de escenas/tienda.ts, o leyendo `S.miAjuste || 0`).
2. Una fila en el HTML del panel, como la de "Paisaje":
   ```js
   `<div class="row"><span>Mi ajuste</span>${[[0,'No'],[1,'Sí']].map(([k,l])=>`<label class="opt"><input type="radio" name="a-mi" value="${k}" ${(S.miAjuste||0)==k?'checked':''}> ${l}</label>`).join('')}</div>`
   ```
3. Conectarla después de crear el panel: `el.querySelectorAll('[name=a-mi]').forEach(r=>r.onchange=()=>{S.miAjuste=+r.value;save()})`.
4. Si debe sobrevivir a "Borrar todo el progreso", añádelo a `keep` en `doReset()`.
5. Los textos del panel son HTML y no pasan por `say()`: se pueden cambiar sin problema.

## 13. Una letra de la Isla de las Letras

La isla se está haciendo por fases ([PLAN-LECTURA.md](PLAN-LECTURA.md)); desde la L1 las letras son datos, en
`LETRAS` (`contenido/letras.ts`, cuya cabecera explica cada campo):

1. **Al final** de `LETRAS` (los temas de la isla se crean a partir de la lista: no cambies el orden ni la letra de una
   entrada publicada), con su `zona` de `ZONA_DE_LETRA`.
2. `amigo` y `palabras` son claves de `PICS` que empiezan por la letra; si falta un dibujo, receta 8, y su nombre en
   `LEX`. `amigoDice` es cómo se dice el amigo, sin artículo.
3. `trazos`: cada trazo es una lista de puntos en una caja de 1 x 1 (x a la derecha, y hacia abajo), en el orden y la
   dirección en que se escribe. Para las curvas, `arco(cx, cy, rx, ry, a0, a1)`. Míralos pintados antes de publicar.
4. `nombre` es una frase nueva: apúntala en `dialogos/pendientes.txt` y rehaz el catálogo con `npm run dialogos`.
5. `npm run test:unidad` (`tests/unidad/letras.test.ts`) comprueba que no se repita, que existan los dibujos, que las
   palabras empiecen por la letra y que los trazos quepan en la caja.
