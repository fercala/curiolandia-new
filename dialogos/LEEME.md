# Diálogos de Tito

Este juego no lleva voces grabadas: todo lo dice la voz del navegador. Aun así se lleva la cuenta de cada frase, para
revisarlas y para poder traducir el juego algún día. Todo está en castellano de España (fases 5d a 5f de
[docs/PLAN-MIGRACION.md](../docs/PLAN-MIGRACION.md)).

| Archivo | Qué es |
|---|---|
| `todos.csv` | **Catálogo de todos los textos del juego**, sacado del código con `npm run dialogos` (`herramientas/dialogos/catalogo.mts`, desde la fase 5g). No se edita a mano. Columnas: `id` (las 12 primeras letras del md5 del texto), `texto`, `tipo` y `donde` (los archivos donde está, hasta tres). |
| `pendientes.txt` | **Diálogos nuevos o cambiados**, una frase por línea, con el texto exacto que dice Tito (sin el nombre del niño), para revisarlos. |

## Los tipos del catálogo

- `frase`: una frase entera tal como se escribe en el código ("¿Cómo te llamas?").
- `trozo`: parte de una frase que se compone al jugar ("Hoy es " + el día) o un texto corto que se ve (botones, carteles).
- `nombre`: el nombre con artículo de un dibujo (`LEX`: "el gato"), que se mete en las frases.
- `inglés`: lo que se dice en inglés en el Rincón del inglés (empieza por `@`).

Las frases que se componen (por ejemplo "¡Hay tres globos!") no salen enteras: salen sus trozos y sus nombres.
El catálogo deja fuera las claves de los dibujos (`'nene'`, `'hojaNaranja'`), los colores, las rutas y la zona de
adultos (HTML para los mayores).

## Regla: cada diálogo nuevo o cambiado se apunta

Cada vez que un cambio **añade una frase** o **cambia el texto de una que ya existía**:

1. Apunta el texto nuevo al final de `pendientes.txt`. Para copiar el texto exacto: en la consola del juego,
   `window.__fast=1; window.__said=[]`, juega esa parte y mira `__said`.
2. Rehaz el catálogo con `npm run dialogos`. La prueba `tests/unidad/dialogos.test.ts` falla si se te olvida.

El gancho de commit (`herramientas/git-hooks/pre-commit`) para el commit si cambia el texto de un `say()` y no tocas
`pendientes.txt`, o si tocas `pendientes.txt` y no `todos.csv`.
