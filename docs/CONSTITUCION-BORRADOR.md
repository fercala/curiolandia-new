# Constitución de Curiolandia (borrador para spec-kit)

Versión 0.1, 24 de octubre de 2026. Borrador: se pulirá con Fernando antes de instalar spec-kit y pasará entonces al
archivo de constitución que usa spec-kit. Sale de las reglas que ya sigue el proyecto en `curiolandia-3d`.

Cada especificación y cada plan de spec-kit comprueban estos principios.

## Principios

1. **El niño primero.** Juego para 3 a 5 años: sin cajas sorpresa, sin perder rachas, sin presión por tiempo; el límite de juego diario se respeta siempre.
2. **Dominio limpio.** Las dependencias apuntan hacia el dominio. El dominio es TypeScript puro: no usa navegador, lienzo, Three.js, audio ni red. Todo lo externo entra por un puerto.
3. **Las partidas guardadas son sagradas.** El estado tiene versión y migraciones; ningún cambio puede dejar inservible una partida existente, y hay pruebas con partidas viejas y rotas.
4. **Cada frase cuenta.** Las frases viven en un catálogo con identificador, en castellano de España, y se apuntan en el catálogo general (para traducir). Se escriben pensando en cómo suenan con la voz del navegador y se prueban escuchándolas.
5. **Pruebas antes de publicar.** Las reglas del dominio se escriben con su prueba (Vitest). Antes de cada versión pasan las pruebas de regresión: los 253 juegos, el camino por edades, los límites, el audio.
6. **Documentación obligatoria.** Comentario de cabecera en cada función, guías de `docs/` al día y entrada en `docs/CAMBIOS.md`. Un cambio sin documentar no se publica.
7. **Privacidad de menores.** Datos en el dispositivo por defecto; la nube solo con consentimiento de la familia, datos mínimos y borrado fácil. Sin anuncios ni rastreadores.
8. **Sin conexión y en móviles modestos.** Es una PWA que funciona sin internet, con un presupuesto de tamaño y de fotogramas, y vuelve a 2D si no hay WebGL.
9. **Simplicidad.** TypeScript estricto; ninguna dependencia nueva sin justificarla en el plan.

## Gobierno

La constitución solo cambia con un PR que Fernando aprueba. Cada cambio sube su versión y explica el motivo.
