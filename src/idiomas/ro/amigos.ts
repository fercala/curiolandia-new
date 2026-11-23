/*
 * idiomas/ro/amigos.ts: los textos en rumano de los amigos de Tito en el mapa (fase P31 de docs/IDEAS-MEJORA.md:
 * dominio/amigos.ts). Borrador de Claude para que lo revise una persona que hable rumano (docs/PLAN-IDIOMAS.md, ID9).
 * Va del texto en castellano, tal como está en el código, a su traducción; textos.ts junta esta tabla con las demás.
 * Lo que Polly dice en inglés se queda en inglés.
 * Exporta: AMIGOS_RO. No importa nada.
 */

/** Los textos de los amigos de Tito, del castellano al rumano. */
export const AMIGOS_RO: Readonly<Record<string, string>> = {
  '¡Hola, Tito! Soy Lupi. ¡Qué día tan bonito para pasear!': 'Salut, Tito! Sunt Lupi. Ce zi frumoasă de plimbare!',
  '¡Hola, Tito! Soy Polly. ¡Hello, hello!': 'Salut, Tito! Sunt Polly. Hello, hello!',
  '¡Tito, he perdido mi pelota! ¿Me ayudas a buscarla?': 'Tito, mi-am pierdut mingea! Mă ajuți s-o caut?',
  '¡Mi pelota! ¡Muchas gracias, Tito! Eres un buen amigo.': 'Mingea mea! Mulțumesc mult, Tito! Ești un prieten bun.',
  '¡Tito, he perdido mi bufanda! ¿Me ayudas a buscarla?': 'Tito, mi-am pierdut fularul! Mă ajuți să-l caut?',
  '¡Mi bufanda! ¡Muchas gracias, Tito! Ya no tendré frío.':
    'Fularul meu! Mulțumesc mult, Tito! Acum n-o să-mi mai fie frig.',
  '¡Tito, he perdido mis gafas! ¿Me ayudas a buscarlas?': 'Tito, mi-am pierdut ochelarii! Mă ajuți să-i caut?',
  '¡Mis gafas! ¡Muchas gracias, Tito! Ahora lo veo todo.': 'Ochelarii mei! Mulțumesc mult, Tito! Acum văd tot.',
  '¡Tito, he perdido mi gorro! ¿Me ayudas a buscarlo?': 'Tito, mi-am pierdut căciula! Mă ajuți s-o caut?',
  '¡Mi gorro! ¡Muchas gracias, Tito! ¡Thank you!': 'Căciula mea! Mulțumesc mult, Tito! Thank you!',
  'Creo que se me cayó cerca del jardín.': 'Cred că mi-a căzut lângă grădină.',
  'Creo que se me cayó cerca del bosque.': 'Cred că mi-a căzut lângă pădure.',
  'Creo que se me cayó cerca de la montaña.': 'Cred că mi-a căzut lângă munte.',
  'Creo que se me cayó cerca de la plaza.': 'Cred că mi-a căzut lângă piață.',
  'Creo que se me cayó cerca del muelle.': 'Cred că mi-a căzut lângă debarcader.',
  'Creo que se me cayó cerca del cole.': 'Cred că mi-a căzut lângă școală.',
  'Creo que se me cayó cerca de la casa de las fiestas.': 'Cred că mi-a căzut lângă casa sărbătorilor.',
  'Creo que se me cayó cerca del globo.': 'Cred că mi-a căzut lângă balon.',
};
