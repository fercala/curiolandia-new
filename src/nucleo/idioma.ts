// idioma.ts: los nombres de los dibujos (LEX, W_, Wn, art, dela, ala), con su artículo, para que Tito los diga.
// Todo el texto del juego está escrito en castellano de España: hasta la fase 5f se escribía en rioplatense y tx() lo
// adaptaba al decirlo (docs/PLAN-MIGRACION.md). contenido/lex.ts añade más nombres a LEX.

/* ---------- nombres de los dibujos ---------- */
// LEX: nombre con artículo de cada dibujo. Formato {claveDelDibujo: 'el nombre'}.
// contenido/lex.ts añade muchos más. Para un dibujo nuevo, añade aquí o en contenido/lex.ts su clave con su nombre.
export const LEX: Record<string,string>={gato:'el gato',pato:'el pato',sol:'el sol',luna:'la luna',mesa:'la mesa',fresa:'la fresa',casa:'la casa',bota:'la bota',pelota:'la pelota',mono:'el mono',pan:'el pan',manzana:'la manzana',
 mariposa:'la mariposa',leon:'el león',abeja:'la abeja',avion:'el avión',arbol:'el árbol',elefante:'el elefante',estrella:'la estrella',oso:'el oso',ojo:'los ojos',oveja:'la oveja',uva:'las uvas',pez:'el pez',
 corazon:'el corazón',caracol:'el caracol',lapiz:'el lápiz',tortuga:'la tortuga',tomate:'el tomate',nube:'la nube',nariz:'la nariz',nido:'el nido',dinosaurio:'el dinosaurio',foca:'la foca',flor:'la flor',
 perro:'el perro',auto:'el coche',vaca:'la vaca',cama:'la cama',silla:'la silla',zapato:'el zapato',banana:'el plátano',helado:'el helado',pera:'la pera',leche:'la leche',globo:'el globo',barco:'el barco',
 tren:'el tren',rana:'la rana',mano:'la mano',pie:'el pie',sandia:'la sandía',cohete:'el cohete',regalo:'el regalo',papa:'papá',pino:'el pino',moto:'la moto',pala:'la pala',
 hoja:'la hoja',hojaNaranja:'la hoja naranja',hojaRoja:'la hoja roja',hojaMarron:'la hoja marrón',mochila:'la mochila',pinturas:'las pinturas',cuento:'el cuento',tobogan:'el tobogán',boca:'la boca',
 oreja:'la oreja',cara:'la cara',gota:'la gota de agua',ballena:'la ballena',castana:'la castaña',seta:'la seta',paraguas:'el paraguas',botasAgua:'las botas de lluvia',lluvia:'la lluvia',nublado:'las nubes',
 nieve:'la nieve',tormenta:'la tormenta',viento:'el viento',niebla:'la niebla',arcoiris:'el arcoíris',ardilla:'la ardilla',abrigo:'el abrigo',gorro:'el gorro',bufanda:'la bufanda',guantes:'los guantes',
 copo:'el copo de nieve',muneco:'el muñeco de nieve',remera:'la camiseta',gafas:'las gafas de sol',gorra:'la gorra',naranja:'la naranja',zumo:'el zumo',banera:'la bañera',nevera:'la nevera',sofa:'el sillón',
 inodoro:'el inodoro',tele:'la tele',cepillo:'el cepillo de dientes',olla:'la olla',cerdo:'el cerdo',gallina:'la gallina',caballo:'el caballo',pollito:'el pollito',mariquita:'la mariquita',pajaro:'el pájaro',
 regadera:'la regadera',autobus:'el autobús',bici:'la bici',cubo:'el cubo',toalla:'la toalla',crema:'la crema para el sol',castillo:'el castillo de arena',concha:'la concha',galleta:'la galleta',
 plato:'el plato',bol:'el bol',macedonia:'la ensalada de frutas',maceta:'la maceta',estrellaMar:'la estrella de mar',mama:'mamá',hermano:'el hermano',hermana:'la hermana',bebe:'el bebé',
 abuelo:'el abuelo',abuela:'la abuela',maestra:'la maestra',nene:'el niño'};
// Los que eran LEX2 hasta la fase 5f (el nombre de España cambiaba el artículo o la palabra entera): ganan a los de arriba.
Object.assign(LEX,{sofa:'el sofá',cubo:'el cubo',macedonia:'la macedonia',crema:'la crema solar',mariquita:'la mariquita',
 maestra:'la profe',botasAgua:'las botas de agua',tele:'la tele',seta:'la seta',sandia:'la sandía'});
// Para nombrar dibujos (k = clave del dibujo): W_ con artículo ('el gato'), de LEX; sin nombre en LEX, la clave.
export const W_=(k: string): string=>LEX[k]||k;              // con artículo
// Wn(k): nombre sin artículo ('gato').
export const Wn=(k: string): string=>W_(k).replace(/^(el|la|los|las) /,'');           // sin artículo
// art(k): solo el artículo ('el', 'la', 'los', 'las' o '').
const art=(k: string): string=>{const m=W_(k).match(/^(el|la|los|las) /);return m?m[1]:''};
// dela(k): 'del gato', 'de la luna' (contrae de + el).
export const dela=(k: string): string=>{const a=art(k);return a==='el'?'del '+Wn(k):(a?'de '+W_(k):'de '+W_(k))};
// ala(k): 'al gato', 'a la luna' (contrae a + el).
export const ala=(k: string): string=>{const a=art(k);return a==='el'?'al '+Wn(k):'a '+W_(k)};
