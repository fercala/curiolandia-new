// adultos/progreso.ts: página «Progreso» de la zona de adultos (fase A1 de docs/PLAN-MENU-ADULTOS.md). Solo enseña, no
// cambia S: los temas de cada zona, «Cómo le va» (habilidades), letras de la isla, inglés, asambleas, la casa de Tito y
// los minutos por día. Antes eran secciones sueltas de aplicacion/adultos.ts. Desde la fase A3, más compacta: un índice
// arriba para saltar a cada parte, cada zona en una fila plegable con su resumen (resumenZona) y «Cómo le va» con lo que
// cuesta primero y solo las 10 primeras habilidades a la vista (ordenHabilidades, etiquetaHabilidad; dominio/zonaAdultos.ts).
// Usa las reglas del progreso por letra (dominio/letras.ts) y de la casa (dominio/casa.ts), palabrasDe
// (escenas/diccionario.ts) para el inglés y los temas de temas/indice.ts.
import type { Tema } from '../../juegos/tipos.ts';
import { DIASL, S, SCENES, fmtHtml, hecho, tr } from '../../nucleo/indice.ts';
import {
  C3,
  C4,
  C5,
  CAN,
  FIESTAS,
  ING,
  ING_PARQUE,
  ING_PUEBLO,
  RUT,
  T3,
  T4,
  T5,
  TL3,
  TL4,
  TL5,
  TRZ,
  LETRAS_ISLA,
  casitaDeLetra,
} from '../../temas/indice.ts';
import { aciertosLetra, datosLetra, estadoLetra, type EstadoLetra } from '../../dominio/letras.ts';
import { MASCOTAS, TOTAL_SORPRESAS, cuantasSorpresas, etapaFlor, etapaMascota, fichaDe } from '../../dominio/casa.ts';
import { TEMA, dayIdx, gDone, tst } from '../../escenas/escenas2d.ts';
import { palabrasDe } from '../../escenas/diccionario.ts';
import {
  ZONA_ADULTOS,
  etiquetaHabilidad,
  ordenHabilidades,
  resumenZona,
  type EtiquetaHabilidad,
} from '../../dominio/zonaAdultos.ts';
import { esc } from './comun.ts';
import type { PaginaAdultos } from './tipos.ts';

// SKILL: nombre legible de cada habilidad de S.stats para la tabla "Cómo le va" ({clave: 'texto'}). Si una clave
// no está, se muestra la clave con espacios. Al crear un juego con una habilidad nueva, añade aquí su nombre.
// Las de inglés son 'ingles-' más el conjunto de palabras del tema (t.en); desde la fase I7 de docs/PLAN-INGLES.md
// están todas las de la isla.
const SKILL: Record<string, string> = {
  'ingles-hello': 'Inglés: saludos',
  'ingles-colors': 'Inglés: colores',
  'ingles-numbers': 'Inglés: números',
  'ingles-numeros': 'Inglés: contar',
  'ingles-animals': 'Inglés: animales',
  ingles: 'Inglés',
  'ingles-family': 'Inglés: la familia',
  'ingles-body': 'Inglés: el cuerpo',
  'ingles-toys': 'Inglés: los juguetes',
  'ingles-fruit': 'Inglés: la fruta',
  'ingles-shapes': 'Inglés: las formas',
  'ingles-beach': 'Inglés: la playa',
  'ingles-clothes': 'Inglés: la ropa',
  'ingles-food': 'Inglés: la comida',
  'ingles-house': 'Inglés: la casa',
  'ingles-weather': 'Inglés: el tiempo',
  'ingles-transport': 'Inglés: los transportes',
  'ingles-farm': 'Inglés: la granja',
  'ingles-actions': 'Inglés: lo que hacemos',
  'ingles-opposites': 'Inglés: los contrarios',
  'ingles-feelings': 'Inglés: cómo me siento',
  'ingles-park': 'Inglés: el parque',
  'ingles-days': 'Inglés: los días',
  'ingles-seasons': 'Inglés: las estaciones',
  'ingles-where': 'Inglés: dónde está',
  'ingles-likes': 'Inglés: me gusta',
  'ingles-whatis': 'Inglés: ¿qué es?',
  'ingles-colourThings': 'Inglés: cosas de colores',
  'ingles-numbers20': 'Inglés: contar hasta 20',
  'ingles-jobs': 'Inglés: los oficios',
  'ingles-shop': 'Inglés: la tienda',
  'ingles-story': 'Inglés: los cuentos',
  'ingles-town': 'Inglés: el pueblo',
  busca: 'Reconocer palabras (¿Dónde está?)',
  sonidos: 'Sonidos de animales y transportes',
  memoria: 'Memoria',
  cuerpo: 'Partes del cuerpo',
  contar: 'Contar',
  colores: 'Colores',
  puzzle: 'Rompecabezas',
  excava: 'Cavar en la arena',
  riega: 'Regar',
  'dentro-fuera': 'Dentro / fuera',
  vestir: 'Ropa según el tiempo',
  transportes: 'Transportes por tierra, aire y agua',
  tamanos: 'Grande / mediano / pequeño',
  otono: 'Otoño',
  frutas: 'Seguir un pedido (frutas)',
  'frio-calor': 'Frío / calor',
  formas: 'Formas',
  familia: 'Familia',
  casa: 'Las partes de la casa',
  armar: 'Armar por partes',
  'arriba-abajo': 'Arriba / abajo',
  arrastra: 'Clasificar arrastrando',
  atrapa: 'Atrapar lo que se pide',
  'dia-hoy': 'Asamblea: qué día es hoy',
  'dia-manana': 'Asamblea: qué día es mañana',
  calendario: 'Asamblea: el número del día',
  'asamblea-dianoche': 'Asamblea: día o noche',
  'asamblea-ropa': 'Asamblea: ropa según el tiempo',
  'asamblea-estacion': 'Asamblea: estación del año',
  'asamblea-siguiente': 'Asamblea: qué estación viene',
  ahorro: 'Ahorrar agua y luz',
  apaga: 'Apagar lo que no se usa',
  arcoiris: 'Colores del arcoíris',
  cancion: 'Canciones',
  ciclos: 'Ciclos de vida',
  ciudad: 'La calle y la ciudad',
  'comer-sano': 'Comer sano',
  comidas: 'Comidas',
  'cuerpo-dentro': 'El cuerpo por dentro',
  'derecha-izquierda': 'Derecha / izquierda',
  'dia-noche': 'Día / noche',
  'dias-finde': 'Días de cole y fin de semana',
  'dias-orden': 'Ordenar los días de la semana',
  dinos: 'Dinosaurios',
  'domestico-salvaje': 'Animales domésticos y salvajes',
  emociones: 'Emociones',
  estaciones: 'Estaciones del año',
  fiesta: 'Días especiales',
  'fiestas-orden': 'Fiestas del año',
  frota: 'Frotar y limpiar',
  'fruta-verdura': 'Frutas y verduras',
  habitats: 'Dónde vive cada animal',
  lupa: 'Buscar con la lupa',
  maleta: 'Preparar la maleta',
  'meses-orden': 'Los meses del año',
  nacimiento: 'Huevo o panza',
  oficios: 'Oficios',
  'origen-alimentos': 'De dónde vienen los alimentos',
  partes: 'Tocar las partes',
  'partes-planta': 'Partes de la planta',
  pedidos: 'Seguir pedidos',
  reciclar: 'Reciclar',
  rutinas: 'Rutinas y hábitos',
  secuencia: 'Ordenar lo que pasa primero y después',
  semaforo: 'El semáforo',
  'seres-vivos': 'Seres vivos y cosas',
  trazos: 'Trazos (antes de escribir)',
  une: 'Unir parejas',
  cuentos: 'Entender cuentos',
  letras: 'Letras (reconocerlas)',
  palmas: 'Palmas (partir en sílabas)',
  silabas: 'Sílabas',
  palabras: 'Leer palabras',
  frases: 'Leer frases',
};
// WX_E y EMO_E: emoji del tiempo y de la emoción que se eligieron en cada asamblea (calendario de asambleas).
const WX_E: Record<string, string> = {
    sol: '☀️',
    nublado: '☁️',
    lluvia: '🌧️',
    viento: '💨',
    nieve: '❄️',
    tormenta: '⛈️',
    niebla: '🌫️',
  },
  EMO_E: Record<string, string> = {
    alegria: '😀',
    tristeza: '😢',
    enojo: '😠',
    miedo: '😨',
    sorpresa: '😮',
    calma: '😌',
    verguenza: '😳',
  };

// ETIQUETA_H: el texto y la clase de color de cada etiqueta de «Cómo le va» (las reglas, en dominio/zonaAdultos.ts).
const ETIQUETA_H: Record<EtiquetaHabilidad, [string, string]> = {
  empieza: ['Recién empieza', ''],
  sabe: ['Lo sabe', 'pAprendida'],
  camino: ['En camino', 'pEncamino'],
  cuesta: ['Le cuesta', 'pLecuesta'],
};
// PARTES: las secciones de la página, con su id y su nombre en el índice de arriba (fase A3).
const PARTES: readonly [string, string][] = [
  ['p-zonas', 'Temas'],
  ['p-habilidades', 'Cómo le va'],
  ['p-letras', 'Letras'],
  ['p-ingles', 'Inglés'],
  ['p-asambleas', 'Asambleas'],
  ['p-casa', 'Casa de Tito'],
  ['p-minutos', 'Minutos'],
];

export const PROGRESO: PaginaAdultos = {
  id: 'progreso',
  titulo: 'Progreso',
  corto: 'Progreso',
  icono: '📊',
  // html(): el índice y cada parte, calculada a partir de S y de las reglas del dominio, en su sección: zonas (tm),
  // Cómo le va (sk y skMas), Letras, Inglés, Asambleas (cal), Casa de Tito y Minutos de juego (days).
  html() {
    // tmOf(listaDeTemas): HTML con una tarjeta por tema: nombre, juegos hechos/total, barra de progreso y si está completo.
    const tmOf = (L: Tema[]) =>
      L.map((t) => {
        const n = gDone(t),
          N = t.games.length;
        return `<div class="tm ${tst(t.id).done ? 'done' : ''}"><b>${esc(t.n)}</b>${fmtHtml('{n}/{total} juegos', { n, total: N })}${tst(t.id).done ? ' ' + hecho(tr('· completo 🌼')) : ''}<div class="bar"><i style="width:${Math.round((n / N) * 100)}%"></i></div></div>`;
      }).join('');
    // tm: una fila plegable por zona (details): al cerrarla se ve su nombre, temas terminados, juegos hechos y una barra;
    // al abrirla, la tarjeta de cada tema.
    const tm = (
      [
        ['Jardín de 3 años', [...T3, C3]],
        ['Bosque de 4 años', [...T4, C4]],
        ['Montaña de 5 años', [...T5, C5]],
        ['Canciones, rutinas y trazos', [CAN, RUT, TRZ]],
        ['Días especiales', FIESTAS],
        ['Isla del Inglés: Playa Hello', ING],
        ['Isla del Inglés: Parque de Londres', ING_PARQUE],
        ['Isla del Inglés: Pueblo de los Cuentos', ING_PUEBLO],
        ['Isla de las Letras: Playa de los Sonidos', TL3],
        ['Isla de las Letras: Bosque de las Letras', TL4],
        ['Isla de las Letras: Pueblo de las Palabras', TL5],
      ] as [string, Tema[]][]
    )
      .map(([h, L]) => {
        const r = resumenZona(
          L.map((t) => ({ hechos: gDone(t), juegos: t.games.length, terminado: !!tst(t.id).done })),
        );
        return `<details class="zona"><summary><b>${h}</b><span>${fmtHtml('{a}/{b} temas · {c}/{d} juegos', { a: r.terminados, b: r.temas, c: r.hechos, d: r.juegos })}</span><div class="bar"><i style="width:${r.juegos ? Math.round((r.hechos / r.juegos) * 100) : 0}%"></i></div></summary><div class="temas">${tmOf(L)}</div></details>`;
      })
      .join('');
    // fila(k): la fila de una habilidad: nombre (SKILL), porcentaje de aciertos, intentos y su etiqueta.
    const fila = (k: string) => {
      const st = S.stats[k],
        n = st.ok + st.err,
        [lbl, cls] = ETIQUETA_H[etiquetaHabilidad(st)];
      return `<tr><td>${esc(SKILL[k] || k.replace(/-/g, ' '))}</td><td>${Math.round((st.ok / n) * 100)}%</td><td>${n}</td><td><span class="pill ${cls}">${lbl}</span></td></tr>`;
    };
    // sk: las primeras habilidades (primero lo que cuesta y después lo más practicado); skMas: las demás, plegadas.
    const orden = ordenHabilidades(S.stats),
      cabeza = '<thead><tr><th>Habilidad</th><th>Aciertos</th><th>Intentos</th><th></th></tr></thead>',
      sk = orden.slice(0, ZONA_ADULTOS.habilidadesVisibles).map(fila).join(''),
      resto = orden.slice(ZONA_ADULTOS.habilidadesVisibles),
      skMas = resto.length
        ? `<details><summary>${fmtHtml('Ver todas ({n})', { n: orden.length })}</summary><table>${cabeza}<tbody>${resto.map(fila).join('')}</tbody></table></details>`
        : '';
    // ESTADO_L: el texto y la clase de la etiqueta de cada estado de una letra (dominio/letras.ts, fase L7).
    const ESTADO_L: Record<EstadoLetra, [string, string]> = {
      sinEmpezar: ['Sin empezar', ''],
      enCamino: ['En camino', 'pEncamino'],
      aprendida: ['Aprendida', 'pAprendida'],
      cuesta: ['Le cuesta', 'pLecuesta'],
    };
    // letras: una fila por letra de la isla (fase L7): juegos de su casita hechos, porcentaje de aciertos y su estado.
    const letras = LETRAS_ISLA.map((L) => {
      const id = casitaDeLetra(L),
        d = datosLetra(id, TEMA[id]?.games.length ?? 0, tst(id).g, S.gs ?? {}),
        p = aciertosLetra(d),
        [lbl, cls] = ESTADO_L[estadoLetra(d)];
      return `<tr><td><b>${esc(L.l)}</b> (${esc(L.amigoDice)})</td><td>${d.hechos}/${d.total}</td><td>${p === null ? '—' : p + '%'}</td><td><span class="pill ${cls}">${lbl}</span></td></tr>`;
    }).join('');
    // ingles: una fila por zona de la Isla del Inglés (fase I7 de docs/PLAN-INGLES.md): casitas terminadas y palabras que
    // ya están en su diccionario (palabrasDe, escenas/diccionario.ts). vozEn: si este navegador tiene voz inglesa.
    const ingles = (
      [
        ['Playa Hello (3 años)', ING],
        ['Parque de Londres (4 años)', ING_PARQUE],
        ['Pueblo de los Cuentos (5 años)', ING_PUEBLO],
      ] as [string, Tema[]][]
    )
      .map(
        ([z, L]) =>
          `<tr><td>${z}</td><td>${L.filter((t) => tst(t.id).done).length}/${L.length}</td><td>${palabrasDe(L).length}</td></tr>`,
      )
      .join('');
    const vozEn = 'speechSynthesis' in window && speechSynthesis.getVoices().some((v) => /^en/i.test(v.lang));
    // casa: la casa de Tito (fase C7 de docs/PLAN-CASA.md): una fila por mascota comprada (nombre, etapa y días cuidados,
    // con fichaDe y etapaMascota de dominio/casa.ts), y aparte las sorpresas descubiertas y los días regados del huerto.
    const ESPECIE_A: Record<string, string> = {
        casitaPerro: 'Perrito',
        gato: 'Gatito',
        pajaro: 'Pajarito',
        conejo: 'Conejito',
        hamster: 'Hámster',
        pecera: 'Peces',
      },
      ETAPA_A = ['Bebé', 'Joven', 'Mayor'];
    const casa = MASCOTAS.filter((id) => S.owned?.[id])
      .map((id) => {
        const f = fichaDe(S.mascotas || {}, id);
        return `<tr><td>${ESPECIE_A[id]}</td><td>${f.nombre ? esc(f.nombre) : '—'}</td><td>${ETAPA_A[etapaMascota(f.dias)]}</td><td>${f.dias}</td></tr>`;
      })
      .join('');
    const huertoDias = (S.huerto && S.huerto.dias) || 0;
    // cal: las últimas 14 asambleas (tiempo y emoción elegidos).
    const cal =
      Object.keys(S.asam)
        .sort()
        .slice(-14)
        .map((d) => {
          const a = S.asam[d],
            dt = new Date(d + 'T12:00');
          return `<span><small>${DIASL[dayIdx(dt)].slice(0, 3)} ${dt.getDate()}/${dt.getMonth() + 1}</small><b>${a.tiempo ? WX_E[a.tiempo] : '·'} ${a.emo ? EMO_E[a.emo] : ''}</b></span>`;
        })
        .join('') || '<span>Todavía no hay asambleas.</span>';
    // days: minutos jugados en los últimos 7 días con datos.
    const days =
      Object.keys(S.days)
        .sort()
        .slice(-7)
        .map(
          (d) =>
            `<span class="day"><b>${Math.round(S.days[d])}</b> min<br><small>${d.slice(5).split('-').reverse().join('/')}</small></span>`,
        )
        .join('') || '<span>Todavía no hay datos.</span>';
    return `
  <nav class="indice" aria-label="Partes del progreso">${PARTES.map(([id, n]) => `<button type="button" data-sec="${id}">${n}</button>`).join('')}</nav>
  <section id="p-zonas"><h3>Temas por zona</h3><p class="note">Toca una zona para ver sus temas.</p>${tm}</section>
  <section id="p-habilidades"><h3>Cómo le va</h3><p class="note">Con esto Tito prepara cada día un <b>repaso</b> de 3 juegos: primero los de lo que le cuesta y, si no hay, los que jugó hace más tiempo. El botón verde del mapa pasa una vez por día por el repaso cuando hay algo que cuesta; también se abre con la lupa de arriba del mapa.</p>${sk ? `<table>${cabeza}<tbody>${sk}</tbody></table>${skMas}` : '<p class="note">Todavía no hay datos.</p>'}</section>
  <section id="p-letras"><h3>Letras</h3><p class="note">Cómo va cada letra de la Isla de las Letras: los juegos hechos de su casita y los aciertos en ellos. Una letra está <b>aprendida</b> con su casita terminada y el 80 % de aciertos o más. Las que cuestan entran en el repaso de cada día.</p><table><thead><tr><th>Letra</th><th>Juegos</th><th>Aciertos</th><th></th></tr></thead><tbody>${letras}</tbody></table></section>
  <section id="p-ingles"><h3>Inglés</h3><p class="note">Cómo va la Isla del Inglés: las casitas terminadas de cada zona y las palabras que ya están en «Mi diccionario de inglés» (en el álbum, el botón de Polly). Los juegos de inglés que cuestan entran en el repaso de cada día. ${vozEn ? 'Polly dice las palabras con la voz inglesa de este dispositivo.' : '<b>Este dispositivo no tiene voz inglesa</b>: Polly dirá las palabras con acento castellano. Se puede instalar una voz inglesa en los ajustes de voz del sistema.'}</p><table><thead><tr><th>Zona</th><th>Casitas</th><th>Palabras</th></tr></thead><tbody>${ingles}</tbody></table></section>
  <section id="p-asambleas"><h3>Asambleas</h3><p class="note">El tiempo que eligió y cómo se sentía cada día.</p><div class="cal">${cal}</div></section>
  <section id="p-casa"><h3>Casa de Tito</h3><p class="note">Lo que ha descubierto jugando en la casa de Tito: <b>${fmtHtml('{n} de {total} sorpresas', { n: cuantasSorpresas(S.sorpresas || {}), total: TOTAL_SORPRESAS })}</b> del álbum «Sorpresas de la casa».</p><details><summary>Más información</summary><p class="note">${fmtHtml(huertoDias === 1 ? 'La flor del huerto lleva {n} día regado (etapa {etapa} de 4).' : 'La flor del huerto lleva {n} días regados (etapa {etapa} de 4).', { n: huertoDias, etapa: etapaFlor(huertoDias) })} Las mascotas crecen con los días en que se cuidan (dos cuidados distintos cuentan un día; joven con 3 días y mayor con 8), nunca enferman ni se ponen tristes, y no se ganan monedas por jugar en la casa.</p></details>${casa ? `<table><thead><tr><th>Mascota</th><th>Nombre</th><th>Etapa</th><th>Días cuidados</th></tr></thead><tbody>${casa}</tbody></table>` : '<p class="note">Todavía no tiene mascotas.</p>'}${SCENES.casa3dPrueba ? '<p class="note">Prueba de la casa en 3D (fase M0 de la mejora de la casa): el salón con sus cosas, Tito que anda y los FPS arriba a la derecha, para ver si va bien en este aparato.</p><div class="row"><button data-go="casa3dPrueba">Casa de Tito en 3D (prueba)</button></div>' : ''}</section>
  <section id="p-minutos"><h3>Minutos de juego</h3><p class="note">Los minutos jugados en los últimos 7 días con datos.</p><div class="days">${days}</div></section>`;
  },
  // conectar(el): no hay nada que guardar; los botones del índice llevan a su parte (scrollIntoView, sin animación si se
  // pidió reducir el movimiento). El botón de la casa 3D de prueba (data-go) lo conecta el panel.
  conectar(el) {
    const suave = typeof matchMedia === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.querySelectorAll<HTMLButtonElement>('[data-sec]').forEach(
      (b) =>
        (b.onclick = () =>
          el
            .querySelector('#' + b.dataset.sec)
            ?.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' })),
    );
  },
};
