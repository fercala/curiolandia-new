// adultos/informe.ts: el informe semanal para la familia en el Resumen de la zona de adultos (idea 41 de
// docs/IDEAS-MEJORA.md, en la PR de todas las ideas pendientes, v0.2.180): los minutos y los días que ha jugado en los
// últimos siete días, qué ha hecho (lo apuntado en el diario de Tito, S.diario), lo que mejor se le da, lo que más le
// cuesta con una idea para reforzarlo en casa, y un botón para compartirlo con la profe (con el menú de compartir del
// móvil o, si no lo hay, copiado para pegarlo en un mensaje). Las reglas, en dominio/informe.ts.
// Exporta: informeHTML y conectarInforme (los usa adultos/resumen.ts).
// Importa: S, today, tr, fmt y hecho del núcleo, las reglas del informe, los nombres de las habilidades (SKILL,
// adultos/progreso.ts) y esc/buscador (adultos/comun.ts).
import { S, fmt, hecho, today, tr } from '../../nucleo/indice.ts';
import { informeSemana } from '../../dominio/informe.ts';
import type { ClaveDiario } from '../../dominio/diario.ts';
import { SKILL } from './progreso.ts';
import { buscador, esc } from './comun.ts';

// NOMBRES_INFORME: el nombre para la familia de cada cosa del diario.
const NOMBRES_INFORME: Readonly<Record<ClaveDiario, string>> = {
  casita: 'Juegos de las casitas',
  excursion: 'Excursiones',
  cuento: 'Cuentos con decisiones',
  programa: 'Programa a Tito',
  bloques: 'Construir con bloques',
  logica: 'Rincón de la lógica',
  ciencias: 'Taller de ciencias',
  arte: 'Estudio de arte',
  corral: 'Corral de la granja',
  juntos: 'Jugar juntos',
  encargo: 'Encargos de los vecinos',
  patio: 'Juegos del patio',
};

// nombreHabilidad(k): el nombre legible de una habilidad, ya traducido.
const nombreHabilidad = (k: string): string => tr(SKILL[k] || k.split('-').join(' '));

// lineasInforme(): el informe de la semana en frases enteras ya traducidas (las mismas para la pantalla y para
// compartir) y la lista de lo que ha hecho, con cuántas veces.
function lineasInforme(): { lineas: string[]; cosas: { nombre: string; veces: number }[] } {
  const inf = informeSemana(S.days, S.diario, S.stats, today()),
    lineas: string[] = [];
  if (!inf.dias) return { lineas: [tr('Esta semana todavía no ha jugado.')], cosas: [] };
  lineas.push(fmt('Minutos de juego en los últimos 7 días: {n}.', { n: inf.minutos }));
  lineas.push(fmt('Días que ha jugado: {n} de 7.', { n: inf.dias }));
  if (inf.sabe) lineas.push(fmt('Lo que mejor se le da: {h}.', { h: nombreHabilidad(inf.sabe) }));
  if (inf.cuesta)
    lineas.push(
      fmt(
        'Lo que más le cuesta: {h}. Para reforzarlo en casa, jugad juntos a lo mismo con cosas de casa, sin pantalla.',
        {
          h: nombreHabilidad(inf.cuesta),
        },
      ),
    );
  return { lineas, cosas: inf.cosas.map((c) => ({ nombre: tr(NOMBRES_INFORME[c.clave]), veces: c.veces })) };
}

// informeHTML(): la sección «La semana» del Resumen, con el botón para compartirla.
export function informeHTML(): string {
  const { lineas, cosas } = lineasInforme(),
    lista = cosas.length
      ? `<p class="note">Lo que ha hecho esta semana:</p>${hecho(`<div class="cifras">${cosas.map((c) => `<span>${esc(c.nombre)} <b>${c.veces}</b></span>`).join('')}</div>`)}`
      : '';
  return `<section><h3>La semana</h3>${lineas.map((l) => `<p>${hecho(esc(l))}</p>`).join('')}${lista}<div class="row"><button type="button" id="a-informe">Compartir con la profe</button></div><p class="note" id="a-informe-msg" aria-live="polite"></p></section>`;
}

// textoInforme(): el informe en texto, para compartirlo: el título con el nombre, las frases y lo que ha hecho.
function textoInforme(): string {
  const { lineas, cosas } = lineasInforme(),
    titulo = fmt('Informe semanal de {nombre} en Curiolandia', { nombre: S.name || tr('Sin nombre') });
  return [titulo, ...lineas, ...cosas.map((c) => `- ${c.nombre}: ${c.veces}`)].join('\n');
}

// conectarInforme(el): el botón «Compartir con la profe»: el menú de compartir del móvil (navigator.share) o, si no lo
// hay o falla, copia el texto y lo dice debajo.
export function conectarInforme(el: HTMLElement): void {
  const b = buscador(el)('#a-informe'),
    msg = buscador(el)('#a-informe-msg');
  if (!b) return;
  b.onclick = async () => {
    const texto = textoInforme();
    try {
      if (navigator.share) {
        await navigator.share({ text: texto });
        return;
      }
    } catch (e) {
      // sin compartir (o cancelado): se copia
    }
    try {
      await navigator.clipboard.writeText(texto);
      if (msg) msg.textContent = tr('Informe copiado: ya se puede pegar en un mensaje.');
    } catch (e) {
      if (msg) msg.textContent = tr('No se ha podido copiar el informe.');
    }
  };
}
