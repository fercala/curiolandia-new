/*
 * idiomas/ro/linterna.ts: los textos en rumano de la linterna de noche (fase P29 de docs/IDEAS-MEJORA.md:
 * escenas/linterna.ts y dominio/linterna.ts). Borrador de Claude para que lo revise una persona que hable rumano
 * (docs/PLAN-IDIOMAS.md, ID9). Va del texto en castellano, tal como está en el código, a su traducción; textos.ts junta
 * esta tabla con las demás.
 * Exporta: LINTERNA_RO. No importa nada.
 */

/** Los textos de la linterna de noche, del castellano al rumano. */
export const LINTERNA_RO: Readonly<Record<string, string>> = {
  '¡Nos vamos de acampada! Ya es de noche. Mueve la linterna para buscar a los animales de la noche.':
    'Mergem în camping! S-a făcut noapte. Mișcă lanterna ca să cauți animalele nopții.',
  'Mueve la linterna por el bosque para buscar a los animales de la noche.':
    'Mișcă lanterna prin pădure ca să cauți animalele nopții.',
  '¡Has encontrado a todos los animales de la noche! ¡Qué buena vista tienes!':
    'Ai găsit toate animalele nopții! Ce bine vezi!',
  '¡Una estrella fugaz! Cierra los ojos y pide un deseo.': 'O stea căzătoare! Închide ochii și pune-ți o dorință.',
  '¡Un búho! Ve muy bien en la oscuridad y caza de noche.':
    'O bufniță! Vede foarte bine în întuneric și vânează noaptea.',
  '¡Un murciélago! Duerme de día cabeza abajo y vuela de noche.':
    'Un liliac! Doarme ziua cu capul în jos și zboară noaptea.',
  '¡Un erizo! Sale de noche a buscar bichitos para comer.': 'Un arici! Iese noaptea să caute gâze de mâncat.',
  '¡Una rana! Por la noche canta: ¡cro, cro!': 'O broscuță! Noaptea cântă: oac, oac!',
  '¡Un lobo! Aúlla a la luna: ¡auuuu!': 'Un lup! Urlă la lună: auuuu!',
  '¡Una polilla! Es como una mariposa, pero vuela de noche y le gusta la luz.':
    'O molie! Seamănă cu un fluture, dar zboară noaptea și îi place lumina.',
};
