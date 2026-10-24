# Diálogos de Tito

Este juego no lleva voces grabadas: todo lo dice la voz del navegador. Aun así se apunta cada frase, para revisarlas y
para poder traducir el juego algún día.

| Archivo | Qué es |
|---|---|
| `todos.csv` | **Catálogo de todos los diálogos** tal como estaba en `curiolandia-3d` el 24 de octubre de 2026 (commit `dd5fc61`, v1.592). Columnas: `id` (md5 de 12 letras del texto), `texto`, `estado`, `fer`, `tipo`, `donde`, `mp3`. Las columnas de grabación (`estado`, `fer`, `mp3`) ya no se usan aquí; se dejan para poder comparar con el juego viejo. |
| `pendientes.txt` | **Diálogos nuevos o cambiados desde la importación**, una frase por línea, con el texto exacto que dice Tito (castellano de España, sin el nombre del niño). |

## Regla: cada diálogo nuevo o cambiado se apunta

Cada vez que un cambio **añade una frase** o **cambia el texto de una que ya existía**:

1. Apunta el texto nuevo al final de `pendientes.txt`. Para copiar el texto exacto: en la consola del juego,
   `window.__fast=1; window.__said=[]`, juega esa parte y mira `__said`.
2. Añade su fila al final de `todos.csv`: `id` = las 12 primeras letras del md5 del texto
   (`python3 -c "import hashlib,sys;print(hashlib.md5(sys.argv[1].encode()).hexdigest()[:12])" "texto"`), `texto`,
   `estado` = `nueva` y el resto vacío (o `donde` si se sabe).

En la fase 5 de la migración (contenido como datos) este catálogo pasa a un catálogo de frases con identificador
dentro del código (`say(F.bienvenida)`), del que saldrá `todos.csv` solo. Entonces se decide si `pendientes.txt` sigue.
