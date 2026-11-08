// adultos/tipos.ts: cómo es una página de la zona de adultos (fase A1 de docs/PLAN-MENU-ADULTOS.md).
// Cada categoría del menú (Resumen, Quién juega, Cómo se juega...) es un objeto PaginaAdultos de su módulo, y la tabla
// PAGINAS_ADULTOS (adultos/paginas.ts) las pone en orden. El panel (adultos/panel.ts) pinta todas al abrir la zona y
// enseña solo la elegida.

/** El identificador de cada página del menú (también lo que recibe openAdult(pagina) en las pruebas). */
export type IdPagina = 'resumen' | 'quienJuega' | 'comoSeJuega' | 'titoYSonido' | 'progreso' | 'premios' | 'copia';

/** Una página de la zona de adultos: su nombre en el menú y cómo se pinta y se conecta a S. */
export interface PaginaAdultos {
  /** Identificador (único) de la página. */
  readonly id: IdPagina;
  /** Título de la página y nombre en el menú lateral. */
  readonly titulo: string;
  /** Nombre corto, debajo del icono en el menú estrecho del móvil en horizontal. */
  readonly corto: string;
  /** Emoji del menú. */
  readonly icono: string;
  /** El HTML de la página (secciones <section><h3>…), hecho a partir de S cada vez que se pinta. */
  html(): string;
  /** Conecta los controles de la página (ya en el DOM, dentro de el) con S: cada cambio guarda con save(). */
  conectar(el: HTMLElement, acciones: AccionesPagina): void;
}

/** Lo que una página puede pedir al panel (adultos/panel.ts) desde sus controles. */
export interface AccionesPagina {
  /** Vuelve a pintar solo esta página (por ejemplo, tras marcar un vale como entregado). */
  rehacer(): void;
  /** Cierra la zona de adultos (closeAdult), antes de ir a una escena o de borrar todo. */
  cerrar(): void;
}
