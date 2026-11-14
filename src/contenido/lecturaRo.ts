/*
 * contenido/lecturaRo.ts: lo que se lee en el Pueblo de las Palabras de la Isla de las Letras en rumano (fase ID6c de
 * docs/PLAN-IDIOMAS.md): las palabras con dibujo de dos y de tres sílabas, partidas como se parten en rumano, y los
 * verbos de las frases que se mueven. Entre las palabras están los grupos que en rumano suenan de otra manera: ci (cină,
 * cizmă, arici), ge (minge), gi (girafă), che (rachetă, ureche) y ghi (ghindă); la fábrica de sílabas los enseña al
 * juntar c o g con e o i («ce» se lee «che»). Las sílabas pueden acabar en consonante (bar-că, co-pac) y no se repiten
 * dentro de una palabra, para que al ordenarlas no haya dos trozos iguales.
 * Borrador de Claude para que lo revise alguien que conozca cómo se enseña a leer en Rumanía (el abecedar, ID9).
 * Es CONTENIDO: solo datos, sin dibujo ni S. Pruebas: tests/unidad/contenido.test.ts (cada palabra se escribe como se
 * llama su dibujo en rumano, idiomas/ro/lex.ts y nombres.ts).
 * Exporta: PALABRAS_LEER_RO y VERBOS_RO. No importa nada.
 */

/** Una palabra con dibujo para leer: su clave de dibujo y sus sílabas. */
export interface PalabraLeer {
  readonly k: string;
  readonly syl: readonly string[];
}
// pl(k, s): la palabra del dibujo k con sus sílabas separadas por guiones ('ra-ță').
const pl = (k: string, s: string): PalabraLeer => ({ k, syl: s.split('-') });

// PALABRAS_LEER_RO: las palabras del pueblo en rumano, de dos (dos) y de tres sílabas (tres). Se escriben como su dibujo
// se llama en rumano, sin artículo (Wn).
export const PALABRAS_LEER_RO: { readonly dos: readonly PalabraLeer[]; readonly tres: readonly PalabraLeer[] } = {
  dos: [
    pl('pato', 'ra-ță'),
    pl('casa', 'ca-să'),
    pl('mesa', 'ma-să'),
    pl('luna', 'lu-nă'),
    pl('vaca', 'va-că'),
    pl('foca', 'fo-că'),
    pl('pera', 'pa-ră'),
    pl('mano', 'mâ-nă'),
    pl('lupa', 'lu-pă'),
    pl('tambor', 'to-bă'),
    pl('boca', 'gu-ră'),
    pl('nuez', 'nu-că'),
    pl('pluma', 'pa-nă'),
    pl('cena', 'ci-nă'),
    pl('bota', 'ciz-mă'),
    pl('pelota', 'min-ge'),
    pl('bellota', 'ghin-dă'),
    pl('barco', 'bar-că'),
    pl('arbol', 'co-pac'),
    pl('globo', 'ba-lon'),
    pl('robot', 'ro-bot'),
    pl('jabon', 'să-pun'),
  ],
  tres: [
    pl('gato', 'pi-si-că'),
    pl('cohete', 'ra-che-tă'),
    pl('banana', 'ba-na-nă'),
    pl('pala', 'lo-pa-tă'),
    pl('moneda', 'mo-ne-dă'),
    pl('jirafa', 'gi-ra-fă'),
    pl('pijama', 'pi-ja-ma'),
    pl('nieve', 'ză-pa-dă'),
    pl('erizo', 'a-ri-ci'),
    pl('oreja', 'u-re-che'),
    pl('maleta', 'va-li-ză'),
  ],
};

// VERBOS_RO: cómo se escribe en rumano cada acción de las frases que se mueven (ACCIONES de juegos/lectura.ts, que son
// también la clave de su dibujo): la frase es el animal con su artículo y el verbo («PISICA DOARME»).
export const VERBOS_RO: Readonly<Record<string, string>> = {
  salta: 'sare',
  duerme: 'doarme',
  nada: 'înoată',
  vuela: 'zboară',
  baila: 'dansează',
  corre: 'aleargă',
};
