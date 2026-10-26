/*
 * infraestructura/conectar.ts: conecta los adaptadores del navegador (infraestructura/navegador.ts) a los puertos de
 * aplicacion/puertos.ts al cargarse (fase 3g de docs/PLAN-MIGRACION.md). src/modulos.ts lo importa el primero, así
 * que el reloj y el azar ya están conectados cuando se evalúa cualquier otro módulo (nucleo/interfaz.ts, por ejemplo,
 * mira la hora al cargarse). No exporta nada.
 * Importa ponPuertos de aplicacion/puertos.ts y los adaptadores de infraestructura/navegador.ts.
 */
import { ponPuertos } from '../aplicacion/puertos.ts';
import { azarDelNavegador, relojDelNavegador } from './navegador.ts';

ponPuertos({ reloj: relojDelNavegador, azar: azarDelNavegador });
