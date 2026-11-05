// Formato del código (Prettier): sangría de 2 espacios, comillas simples, punto y coma y líneas de hasta 120 letras,
// como ya se escribía a mano. `npm run formato` lo aplica y `npm run formato:comprobar` (GitHub Actions) falla si algún
// archivo no está formateado. Qué archivos: los de FORMATO en package.json; .prettierignore deja fuera el resto.
export default {
  printWidth: 120,
  singleQuote: true,
  // Las claves de los objetos se quedan como están escritas (con comillas o sin ellas): el catálogo de frases
  // (herramientas/dialogos/catalogo.mts) lee las claves entre comillas como textos.
  quoteProps: 'preserve',
};
