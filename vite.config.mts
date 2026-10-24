// Configuración de Vite: `npm run dev` sirve el juego con recarga al guardar y `npm run build` monta la web en dist/.
// El montaje lo hace el plugin de herramientas/vite/curiolandia.mts; base './' porque GitHub Pages lo sirve en
// /curiolandia-new/. public/ (Three.js, fuentes, iconos, manifiesto) se copia tal cual.
import { defineConfig } from 'vitest/config';
import { curiolandia } from './herramientas/vite/curiolandia.mts';

export default defineConfig({
  base: './',
  plugins: [curiolandia()],
  build: { outDir: 'dist', emptyOutDir: true },
  test: { include: ['tests/unidad/**/*.test.ts'] },
});
