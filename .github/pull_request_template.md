## Qué cambia
<!-- Para el niño o la familia, y por dentro. Si es una fase de la migración, cuál. -->

## Cómo lo he probado
- [ ] `npm run build` y `npm run test:humo` terminan con TODO BIEN
- [ ] `npm run tipos` y `npm run test:unidad`
- [ ] `npm run formato:comprobar` y `npm run lint` sin avisos (docs/FORMATO-Y-LINTER.md)
- [ ] `npm run test:pr` (lo pasa también GitHub Actions)
- [ ] Lo he jugado en el navegador sin errores en la consola

## Documentación (docs/POLITICA-DOCUMENTACION.md)
- [ ] `npm run test:comentarios` termina con TODO BIEN
- [ ] Cada función nueva o cambiada tiene su comentario de cabecera, y es correcto
- [ ] La lógica complicada lleva comentarios dentro
- [ ] He actualizado los documentos de `docs/` que tocan y `docs/CONTRATO-PRUEBAS.md` si cambia lo que leen las pruebas
- [ ] He apuntado los diálogos nuevos o cambiados en `dialogos/pendientes.txt` y `dialogos/todos.csv`
- [ ] Lo nuevo es multiidioma: cada texto nuevo tiene su rumano en `src/idiomas/ro/` y la escena nueva está en `tests/regresion/idiomas.js`
- [ ] Partidas guardadas: nada incompatible con `S` (docs/ESTADO-GUARDADO.md)
- [ ] Si se publica: he subido `version` en `package.json` y he añadido la entrada en `docs/CAMBIOS.md`
