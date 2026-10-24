// Tipos del estado guardado S para el código global (`npm run tipos:js`). Están en src/nucleo/tipos.ts, que manda
// (y docs/ESTADO-GUARDADO.md): aquí solo se les da nombre global para usarlos en JSDoc (`/** @type {Estado} */`).
// `import()` en un tipo no convierte este archivo en módulo: sus nombres siguen siendo globales.

type FechaDia = import('../nucleo/tipos.ts').FechaDia;
type Cuenta = import('../nucleo/tipos.ts').Cuenta;
type ProgresoTema = import('../nucleo/tipos.ts').ProgresoTema;
type Volumenes = import('../nucleo/tipos.ts').Volumenes;
type Tito = import('../nucleo/tipos.ts').Tito;
type Vale = import('../nucleo/tipos.ts').Vale;
type Repaso = import('../nucleo/tipos.ts').Repaso;
type Estado = import('../nucleo/tipos.ts').Estado;
