# Pruebas de regresión

Pruebas automáticas con Playwright (Chromium sin ventana) que juegan Curiolandia 3D como un niño al que se le señala dónde tocar: siguen la ayuda de cada pantalla (`scene.hint()`). Lo que encuentran se apunta en `docs/HALLAZGOS-PRUEBAS.md`.

Todas reciben como primer argumento la carpeta de la web montada: `dist` después de `npm run build`. Cada prueba escribe su resultado en `tests/regresion/salida/<prueba>.json` (y capturas `.png` de lo que falla). Esa carpeta no se sube al repositorio.

| Prueba | Qué hace | Cuánto tarda |
|---|---|---|
| `camino.js <web> [3,4,5] [min]` | Partida nueva de punta a punta para cada edad con el ratón de verdad: portada, edad, nombre (a los 5 años se salta), cuento (a los 3 se escucha, a los 4 y 5 se salta), mapa, asamblea, casitas, juegos y cofre. Comprueba que se terminan temas, que hay monedas y cofres, que nada se atasca 90 s y que al recargar el progreso sigue. | unos minutos por edad |
| `juegos.js <web> [trabajador] [nº] [seg] [filtro]` | Juega todos los juegos de todos los temas hasta que terminan. Se puede repartir: `juegos.js . 0 2` y `juegos.js . 1 2` en paralelo. | 20-40 min |
| `limites.js <web> [filtro]` | Casos límite y caminos alternativos: partidas guardadas rotas o viejas, almacenamiento bloqueado o lleno, copias de seguridad raras, nombres raros, toques muy rápidos, salir a mitad, zona de adultos, borrar todo, modo libre, cambiar de edad, pantallas raras, sin WebGL, sin voz, sin MP3, límite de tiempo, fechas especiales, medianoche, hemisferio sur, tienda, partida terminada. | 15-30 min |
| `audio.js <web> [es\|ar] [''\|fer\|nav] [min]` | Juega con una voz del navegador simulada que tarda lo que tardaría y mide cada frase: si se cortó sola, si no sonó nada, si sonaron dos voces a la vez. Aquí no hay MP3 (`voz/`): el juego usa siempre la voz del navegador, sea cual sea el segundo argumento. | los minutos que se le digan |
| `informe-b.js <web>` | Los fallos B1-B7 del informe de pruebas jugadas a mano (ver HALLAZGOS-PRUEBAS): repetir «Conocer», fallos de Memoria, mapa tras cambiar libre/edad, gorro del cofre, botón de saltar el cuento, cartel DÍA/NOCHE, copia con `temas: null`. | 2 min |
| `voces.js <web>` | Elección de la voz del navegador (v1.589) con voces de mentira: la automática es la más natural del país, la lista de la zona de adultos (orden y ★), la guía de voces, y que la elegida se guarde, siga tras recargar y vuelva la automática si desaparece. | 20 s |
| `casa.js <web>` | Habitaciones de la casa de Tito y premios nuevos (v1.590): se abren con las casitas, Tito anuncia la nueva, partidas antiguas con todo en el salón, cada compra a su habitación, llevar cosas arrastrándolas al botón de otra habitación, candado por habitación y páginas en la tienda, y que todo se dibuje dentro de la pantalla. | 40 s |
| `audio-espera.js <web> [trabajador] [nº] [filtro]` | Entra en cada juego y no toca nada 14 s, luego falla dos veces: busca frases que se cortan solas (por ejemplo, la ayuda automática que repite la consigna mientras Tito aún habla). | 20 s por juego |
| `ampliada.js <web> [filtro]` | B8–B14, recompensas interrumpidas, armario, arrastres reales, validación de copias, reinicio, 36 combinaciones de ajustes y control de regar manteniendo el arrastre. | unos minutos |
| `guardado-viejo.js <web>` | Clave de guardado propia y copia única de la partida de curiolandia-3d: se copia, la propia manda, no vuelve tras «Borrar todo», la Voz de Fer pasa a voz del navegador y una partida vieja rota no impide jugar. Termina con 1 si algo falla. | 30 s |
| `fps.js <web>` | Fotogramas por segundo del mapa, una casita, el cuento y un juego, para [docs/LINEA-BASE.md](../../docs/LINEA-BASE.md). Medir sin otras pruebas en marcha. | 25 s |
| `cobertura.js <web> [filtro]` | Dos pestañas, salidas alternativas del repaso, reloj a 10 FPS, premios diario/cumpleaños, vales desactivados, canje, Escape y arranque cacheado sin conexión. Guarda resultados después de cada caso. | unos minutos |

`lib.js` tiene lo común (servidor, abrir el juego con una fecha y hora fijas, tocar siguiendo la ayuda, registro de hallazgos) y `espia.js` el espía del audio.

Ejemplo, después de `npm run build`:

```sh
node tests/regresion/camino.js dist 3,4,5 8
node tests/regresion/juegos.js dist 0 1 90
node tests/regresion/limites.js dist
node tests/regresion/audio.js dist es nav 6
node tests/regresion/audio-espera.js dist 0 1
```

Las pruebas terminan con 0 aunque encuentren algo (apuntan hallazgos). Para saber si han pasado, `comprobar.js` lee sus
resultados y termina con 1 si hay hallazgos: `node tests/regresion/comprobar.js informe-b voces`. Es lo que hace
`npm run test:pr`, que pasa GitHub Actions en cada PR (informe-b, voces, casa, guardado-viejo y una octava parte de
los juegos, `juegos.js dist 0 8 90`).

Necesitan Playwright con Chromium: `npm ci && npx playwright install chromium` (la versión está fijada en `package.json`). En un ordenador lento o con varias pruebas a la vez, el juego va a pocos fotogramas por segundo y algunos juegos pueden no terminar en el tiempo dado: repite esos con más segundos y un solo trabajador antes de darlos por fallidos.

Para Chrome o Edge instalados, ver [AMPLIADA.md](AMPLIADA.md) y usar `lanzar.js`. Ejemplo: `node tests/regresion/lanzar.js cobertura.js .` con `PLAYWRIGHT_CHANNEL=chrome`.

`cobertura.js` admite filtros separados por coma, por ejemplo `pwa,vale,cumple`. Devuelve 0 si todo pasa, 1 si detecta fallos y 2 si algún caso no pudo ejecutarse. Los fallos de un guion no se registran automáticamente como bugs del juego.

La existencia de una prueba no demuestra cobertura completa. Consultar el [mapa de cobertura funcional](../../docs/COBERTURA-PRUEBAS.md), que distingue pruebas ejecutadas, cobertura parcial y huecos pendientes.

