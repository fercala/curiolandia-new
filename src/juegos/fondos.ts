// juegos/fondos.ts: BG, los fondos de los temas por nombre (fase 4o de docs/PLAN-MIGRACION.md). Cada fondo es una
// función sin parámetros que pinta la pantalla entera. Aquí BG empieza vacío: los fondos los añaden al cargarse los
// temas (temas/temas.ts, temas4.ts y extras.ts, con Object.assign(BG,{...})). Está aquí, en juegos/, porque el cuento
// (Story, en juegos/comps2.ts) pinta sus páginas por el nombre del fondo (bg:'aula' en contenido/cuentos.ts) y los
// componentes se cargan antes que los temas; hasta la fase 4o BG era de temas/temas.ts y el cuento la usaba como
// global tardía (src/tardias.d.ts).
// Exporta: BG. No importa nada.

/** Fondos de los temas: BG.aula(), BG.conceptos()... pintan el fondo entero. */
export const BG: Record<string, () => void>={};
