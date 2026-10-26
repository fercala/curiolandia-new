/*
 * infraestructura/conectar.ts: conecta los adaptadores del navegador (infraestructura/navegador.ts) a los puertos de
 * aplicacion/puertos.ts al cargarse (fases 3g y 3h de docs/PLAN-MIGRACION.md). src/modulos.ts lo importa el primero, así
 * que el reloj, el azar y el guardado ya están conectados cuando se evalúa cualquier otro módulo (nucleo/guardado.ts,
 * por ejemplo, lee la partida al cargarse, y nucleo/interfaz.ts mira la hora). No exporta nada.
 * Importa ponPuertos de aplicacion/puertos.ts y los adaptadores de infraestructura/navegador.ts.
 */
import { ponPuertos } from '../aplicacion/puertos.ts';
import { azarDelNavegador, guardadoDelNavegador, relojDelNavegador } from './navegador.ts';

ponPuertos({ reloj: relojDelNavegador, azar: azarDelNavegador, guardado: guardadoDelNavegador });
