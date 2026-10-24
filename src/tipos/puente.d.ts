// Lo que los módulos dejan en globalThis para el código global (el «puente» de src/modulos.ts), con el tipo que tiene
// en su módulo. Al pasar a módulo cada archivo que lo usa, lo importará en vez de leerlo de aquí.
declare const K: typeof import('../dibujos/pics-base.ts').K;
declare const PICS: typeof import('../dibujos/pics-base.ts').PICS;
declare const LUPI_SVG: typeof import('../dibujos/pics-base.ts').LUPI_SVG;
declare const GLASSES_SVG: typeof import('../dibujos/pics-base.ts').GLASSES_SVG;
declare const HAND_SVG: typeof import('../dibujos/pics-base.ts').HAND_SVG;
declare const TITO_SVG: typeof import('../dibujos/pics-new.ts').TITO_SVG;
declare const ERIZO_SVG: typeof import('../dibujos/pics-new.ts').ERIZO_SVG;
declare const TORTUGA_SVG: typeof import('../dibujos/pics-new.ts').TORTUGA_SVG;
declare const CONEJO_SVG: typeof import('../dibujos/pics-new.ts').CONEJO_SVG;
