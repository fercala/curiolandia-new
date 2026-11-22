/*
 * idiomas/ro/tren.ts: los textos en rumano del tren de Curiolandia (fase P28 de docs/IDEAS-MEJORA.md:
 * mundo3d/tren3d.ts). Borrador de Claude para que lo revise una persona que hable rumano (docs/PLAN-IDIOMAS.md, ID9).
 * Va del texto en castellano, tal como está en el código, a su traducción; textos.ts junta esta tabla con las demás.
 * Las plantillas llevan sus huecos ({n}).
 * Exporta: TREN_RO. No importa nada.
 */

/** Los textos del viaje en tren, del castellano al rumano. */
export const TREN_RO: Readonly<Record<string, string>> = {
  '¡Viajeros, al tren! Vamos a dar la vuelta a Curiolandia. Cuenta los túneles por los que pasamos. Toca el tren para tocar la bocina.':
    'Călători, urcați în tren! Facem turul Curiolandiei. Numără tunelurile prin care trecem. Atinge trenul ca să claxonezi.',
  'Cuenta los túneles por los que pasamos. Toca el tren para tocar la bocina.':
    'Numără tunelurile prin care trecem. Atinge trenul ca să claxonezi.',
  '¡Ya hemos dado la vuelta a Curiolandia! ¿Cuántos túneles hemos pasado?':
    'Am făcut turul Curiolandiei! Prin câte tuneluri am trecut?',
  '¡Casi! Piensa otra vez: ¿cuántos túneles hemos pasado?': 'Aproape! Mai gândește-te: prin câte tuneluri am trecut?',
  '¡Parada del bosque! Sube Lupi.': 'Stația pădurii! Urcă Lupi.',
  '¡Parada de la montaña! Sube Polly.': 'Stația muntelui! Urcă Polly.',
  '¡Parada de la playa! Sube el pato.': 'Stația plajei! Urcă rățușca.',
  '¡Adiós, vaca!': 'La revedere, vacă!',
  '¡Adiós, oveja!': 'La revedere, oaie!',
  '¡Adiós, cerdito!': 'La revedere, purceluș!',
  '¡Adiós, caballo!': 'La revedere, cal!',
  '¡Adiós, gallina!': 'La revedere, găină!',
  '¡Muy bien! Hemos pasado {n} túneles.': 'Foarte bine! Am trecut prin {n} tuneluri.',
  '¿Cuántos túneles?': 'Câte tuneluri?',
};
