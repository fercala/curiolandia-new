/*
 * contenido/cuentosDecisiones.ts: los cuentos en los que el niño decide (idea 27 de docs/IDEAS-MEJORA.md, fase P33).
 * Solo datos. Cada cuento es un árbol de páginas que empieza en 'inicio': las que tienen opciones preguntan qué hace
 * Tito (cada opción con su dibujo, para los que aún no leen) y las demás son finales, todos buenos. «La bellota
 * perdida» es la primera historia (la de las actividades opcionales, v0.2.167), con sus mismas frases; desde la P33 se
 * suman «El regalo de Lupi» y «El barquito de papel», con cuatro finales cada uno. Los lee SCENES.cuentoDecisiones
 * (escenas/cuentoDecisiones.ts); las reglas, en dominio/cuentosDecisiones.ts.
 * Exporta: CUENTOS_DECISION.
 * Importa: el tipo CuentoDecision de dominio/cuentosDecisiones.ts.
 */
import type { CuentoDecision } from '../dominio/cuentosDecisiones.ts';

// CUENTOS_DECISION: los cuentos de la biblioteca, en el orden en que salen.
export const CUENTOS_DECISION: readonly CuentoDecision[] = [
  {
    id: 'bellota',
    titulo: 'La bellota perdida',
    portada: 'bellota',
    cielo: ['#D1F0FF', '#EDF6CE'],
    paginas: {
      inicio: {
        frase: 'Tito oye un ruido cerca del árbol. ¿Por dónde va?',
        dibujos: ['arbol'],
        opciones: [
          { texto: 'Por el camino', dibujo: 'caracol', va: 'camino' },
          { texto: 'Por el prado', dibujo: 'flor', va: 'prado' },
        ],
      },
      camino: {
        frase: 'Una ardilla busca su bellota. ¿Cómo la ayudas?',
        dibujos: ['ardilla'],
        opciones: [
          { texto: 'Buscar en el suelo', dibujo: 'hoja', va: 'escondida' },
          { texto: 'Mirar en el árbol', dibujo: 'arbol', va: 'desdeArbol' },
        ],
      },
      prado: {
        frase: 'Una ardilla mira una pila de hojas. ¿Cómo la ayudas?',
        dibujos: ['ardilla', 'hoja'],
        opciones: [
          { texto: 'Apartar las hojas', dibujo: 'hoja', va: 'escondida' },
          { texto: 'Mirar en el árbol', dibujo: 'arbol', va: 'desdeArbol' },
        ],
      },
      escondida: {
        frase: '¡La bellota estaba escondida! La ardilla le da las gracias a Tito.',
        dibujos: ['bellota', 'ardilla'],
      },
      desdeArbol: {
        frase: 'Desde el árbol ven la bellota. Tito y la ardilla la recogen juntos.',
        dibujos: ['arbol', 'bellota'],
      },
    },
  },
  {
    id: 'regalo',
    titulo: 'El regalo de Lupi',
    portada: 'regalo',
    cielo: ['#FFE3F1', '#FFF6D6'],
    paginas: {
      inicio: {
        frase: 'Hoy es el cumpleaños de Lupi. Tito quiere hacerle un regalo. ¿Qué le prepara?',
        dibujos: ['lupi', 'regalo'],
        opciones: [
          { texto: 'Una tarta', dibujo: 'tarta', va: 'tarta' },
          { texto: 'Una flor', dibujo: 'flor', va: 'flor' },
        ],
      },
      tarta: {
        frase: 'Tito hace una tarta muy rica. ¿Qué le pone encima?',
        dibujos: ['tarta'],
        opciones: [
          { texto: 'Unas velas', dibujo: 'vela', va: 'velas' },
          { texto: 'Unas fresas', dibujo: 'fresa', va: 'fresas' },
        ],
      },
      flor: {
        frase: 'Tito busca la flor más bonita del jardín. ¿Cómo se la da?',
        dibujos: ['flor'],
        opciones: [
          { texto: 'Con un lazo', dibujo: 'regalo', va: 'lazo' },
          { texto: 'Con un globo', dibujo: 'globo', va: 'globo' },
        ],
      },
      velas: {
        frase: 'Lupi sopla las velas y pide un deseo. ¡Todos cantan cumpleaños feliz!',
        dibujos: ['tarta', 'lupi'],
      },
      fresas: {
        frase: 'Lupi y Tito comparten la tarta de fresas. ¡Está riquísima!',
        dibujos: ['fresa', 'lupi'],
      },
      lazo: {
        frase: 'A Lupi le encanta la flor con su lazo. La pone en un vaso junto a la ventana.',
        dibujos: ['flor', 'lupi'],
      },
      globo: {
        frase: 'Lupi recibe la flor atada a un globo rojo. ¡Qué sorpresa tan bonita!',
        dibujos: ['globo', 'lupi'],
      },
    },
  },
  {
    id: 'barquito',
    titulo: 'El barquito de papel',
    portada: 'barco',
    cielo: ['#CDEBFF', '#E2F6E9'],
    paginas: {
      inicio: {
        frase: 'Ha llovido y Tito ha hecho un barquito de papel. ¿Dónde lo pone a navegar?',
        dibujos: ['barco', 'lluvia'],
        opciones: [
          { texto: 'En el estanque', dibujo: 'pato', va: 'estanque' },
          { texto: 'En el río', dibujo: 'pez', va: 'rio' },
        ],
      },
      estanque: {
        frase: 'El barquito navega por el estanque y se acerca un pato. ¿Qué hace Tito?',
        dibujos: ['barco', 'pato'],
        opciones: [
          { texto: 'Saludar al pato', dibujo: 'pato', va: 'pato' },
          { texto: 'Soplar fuerte', dibujo: 'nube', va: 'soplar' },
        ],
      },
      rio: {
        frase: 'El río lleva el barquito muy deprisa. ¡Allí hay una rana! ¿Qué hace Tito?',
        dibujos: ['barco', 'rana'],
        opciones: [
          { texto: 'Llamar a la rana', dibujo: 'rana', va: 'rana' },
          { texto: 'Correr por la orilla', dibujo: 'arbol', va: 'orilla' },
        ],
      },
      pato: {
        frase: 'El pato empuja el barquito con el pico y se lo trae a Tito. ¡Ya son amigos!',
        dibujos: ['pato', 'barco'],
      },
      soplar: {
        frase: 'Tito sopla y el barquito cruza todo el estanque. ¡Ha llegado al otro lado!',
        dibujos: ['barco', 'sol'],
      },
      rana: {
        frase: 'La rana salta al barquito y navegan juntos un rato. ¡Croac, croac!',
        dibujos: ['rana', 'barco'],
      },
      orilla: {
        frase: 'Tito corre por la orilla y recoge el barquito en una curva del río. ¡Lo ha salvado!',
        dibujos: ['barco', 'arbol'],
      },
    },
  },
];
