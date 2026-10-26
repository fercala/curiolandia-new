// idioma.ts: rioplatense y castellano de España, y los nombres de los dibujos.
//   - TU, _tuRe, tx(), V(): el texto del juego se escribe en rioplatense y tx() lo pasa a España si S.variant==='es'.
//   - LEX, LEX2, W_, Wn, art, dela, ala: el nombre con artículo de cada dibujo, para que Tito lo diga.
// contenido/lex.ts añade más pares a _tuRe y más nombres a LEX y LEX2.
import { S } from './guardado.ts';

/* ---------- variante del español: el texto se escribe en rioplatense y se adapta ---------- */
// TU: lista de pares [rioplatense, España]. Los textos del juego se escriben en rioplatense y tx() los pasa a
// castellano de España cuando S.variant==='es'. El ORDEN importa: primero las expresiones largas ('las bananas')
// y luego las cortas ('banana'), para no cambiar media expresión. contenido/lex.ts añade más pares al final.
// Para añadir una palabra: ['palabra rioplatense','palabra de España'], en minúsculas.
const TU: readonly (readonly [string,string])[]=[['las bananas','los plátanos'],['la banana','el plátano'],['una banana','un plátano'],['banana','plátano'],['bananas','plátanos'],
 ['los anteojos de sol','las gafas de sol'],['unos anteojos de sol','unas gafas de sol'],['anteojos de sol','gafas de sol'],['los anteojos','las gafas'],['anteojos','gafas'],
 ['los autos','los coches'],['el auto','el coche'],['un auto','un coche'],['autos','coches'],['auto','coche'],['el colectivo','el autobús'],['colectivo','autobús'],
 ['la heladera','la nevera'],['heladera','nevera'],['la pileta','la piscina'],['pileta','piscina'],['la campera','la chaqueta'],['campera','chaqueta'],
 ['el chancho','el cerdo'],['los chanchos','los cerdos'],['chancho','cerdo'],['las frutillas','las fresas'],['la frutilla','la fresa'],['frutillas','fresas'],['frutilla','fresa'],
 ['la remera','la camiseta'],['remera','camiseta'],['el jugo','el zumo'],['jugo','zumo'],['la papa','la patata'],['canilla','grifo'],['figuritas','pegatinas'],['figurita','pegatina'],
 ['el jardín de infantes','el cole'],['a la escuela','al cole'],['de la escuela','del cole'],['la escuela','el cole'],
 ['un grande','un mayor'],['acá','aquí'],['allá','allí'],['lindos','bonitos'],['lindas','bonitas'],['lindo','bonito'],['linda','bonita'],
 ['chiquitos','pequeñitos'],['chiquitas','pequeñitas'],['chiquito','pequeñito'],['chiquita','pequeñita'],['nenes','niños'],['nenas','niñas'],['nene','niño'],['nena','niña'],
 ['tocá','toca'],['tocás','tocas'],['mirá','mira'],['buscá','busca'],['arrastrá','arrastra'],['arrastrás','arrastras'],['llevá','lleva'],['poné','pon'],['ponés','pones'],['ponele','ponle'],
 ['elegí','elige'],['elegís','eliges'],['vení','ven'],['escuchá','escucha'],['atrapá','atrapa'],['pintá','pinta'],['guardá','guarda'],['contá','cuenta'],['contalas','cuéntalas'],['contalos','cuéntalos'],
 ['ordená','ordena'],['regá','riega'],['regalas','riégalas'],['encontrá','encuentra'],['ayudá','ayuda'],['ayudás','ayudas'],['armá','arma'],['vestí','viste'],['vestilo','vístelo'],['vestila','vístela'],
 ['descubrí','descubre'],['cavá','cava'],['juntá','junta'],['probá','prueba'],['decí','di'],['decime','dime'],['contame','cuéntame'],['sabés','sabes'],['querés','quieres'],['podés','puedes'],['tenés','tienes'],
 ['sos','eres'],['llamás','llamas'],['jugás','juegas'],['fijate','fíjate'],['esperá','espera'],['sentís','sientes'],['hacés','haces'],['hacé','haz'],['ponete','ponte'],['sacá','saca'],['soplá','sopla'],
 ['tomá','toma'],['respirá','respira'],['pedile','pídele'],['abrazá','abraza'],['seguí','sigue'],['volvé','vuelve'],['acordate','acuérdate'],['dale','vale'],['vos','tú'],['pasá','pasa'],['agarrá','coge'],
 ['empezá','empieza'],['terminá','termina'],['llená','llena'],['tirá','tira'],['salís','sales'],['estás','estás'],['cuidás','cuidas'],['regás','riegas'],['tapá','tapa'],['frotá','frota'],['limpiá','limpia'],['sacudí','sacude'],['sonreí','sonríe'],['dejá','deja'],['tocalo','tócalo'],['tocala','tócala'],['llevala','llévala'],['llevalas','llévalas'],['llevalo','llévalo'],['llevalos','llévalos'],['atrapalas','atrápalas'],['atrapalos','atrápalos'],['buscalo','búscalo'],['buscala','búscala'],['girá','gira'],['contá','cuenta'],['llamás','llamas'],
 ['comprás','compras'],['comprá','compra'],['ganás','ganas'],['mostráselo','enséñaselo'],['mostrale','enséñale'],['acomodá','coloca'],['tocalas','tócalas'],['tocalos','tócalos'],['tocala','tócala'],['juntás','juntas'],['canjeás','canjeas'],['el moño','el lazo'],['moño','lazo'],['el trencito','el trenecito'],['trencito','trenecito'],['cantá','canta'],['cantás','cantas'],['seguilo','síguelo'],['seguila','síguela'],['dibujá','dibuja'],['unila','únela'],['uní','une'],['soplale','sóplale'],['decorá','decora'],['disfrazá','disfraza'],['lavá','lava'],['secá','seca'],['cepillá','cepilla'],['enjuagá','enjuaga'],['mojá','moja'],['tenías','tenías'],['andá','ve'],['subí','sube'],['bajá','baja'],['apagá','apaga'],['prendé','enciende'],['cerrá','cierra'],['abrí','abre'],['pensá','piensa'],['adiviná','adivina'],['escondé','esconde'],['pegá','pega'],['mové','mueve'],['movés','mueves'],['ordenás','ordenas'],['inflá','infla'],['probalas','pruébalas'],['probalos','pruébalos'],['ordenalas','ordénalas'],['ordenalos','ordénalos'],['una carpa','una tienda de campaña'],['la frazada','la manta'],['frazada','manta'],['terminás','terminas'],['reventá','revienta'],['repetilo','repítelo'],['jugá','juega'],['repetí','repite'],['abrilo','ábrelo']];
// _tuRe: TU convertida en expresiones regulares que solo cambian palabras enteras (\p{L} = cualquier letra, también con tilde), sin distinguir mayúsculas.
export const _tuRe: [RegExp,string][]=TU.map(([a,b])=>[new RegExp('(^|[^\\p{L}])('+a+')(?=[^\\p{L}]|$)','giu'),b]);
// tx(texto): adapta un texto rioplatense a castellano de España si S.variant==='es'; si no, lo devuelve igual.
// Respeta la mayúscula inicial de cada palabra cambiada. say() la aplica siempre (salvo en inglés). OJO: el MP3
// grabado se busca con el texto YA adaptado, así que cambiar un par de TU puede dejar frases sin audio.
export function tx(s: string): string{
  if(S.variant!=='es'||!s)return s;
  for(const [re,b] of _tuRe)s=s.replace(re,(_m: string,p: string,w: string)=>p+(w[0]!==w[0].toLowerCase()?b[0].toUpperCase()+b.slice(1):b));
  return s;
}
// Una frase que cambia demasiado entre variantes: [rioplatense, España]. Los temas y las escenas escriben las parejas
// como listas sueltas (string[]), así que V acepta cualquier lista y usa sus dos primeros elementos.
export type Par=readonly string[];
// V(x): si x es una lista [rioplatense, España], elige según S.variant; si es un texto, le pasa tx().
// Se usa cuando la frase cambia demasiado entre variantes para que baste con tx().
export const V=(x: string|Par): string=>Array.isArray(x)?(S.variant==='es'?x[1]:x[0]) as string:tx(x as string);

/* ---------- nombres de los dibujos (rioplatense; tx() los pasa a España) ---------- */
// LEX: nombre con artículo de cada dibujo, en rioplatense (tx() lo pasa a España). Formato {claveDelDibujo: 'el nombre'}.
// contenido/lex.ts añade muchos más. Para un dibujo nuevo, añade aquí o en contenido/lex.ts su clave con su nombre.
export const LEX: Record<string,string>={gato:'el gato',pato:'el pato',sol:'el sol',luna:'la luna',mesa:'la mesa',fresa:'la frutilla',casa:'la casa',bota:'la bota',pelota:'la pelota',mono:'el mono',pan:'el pan',manzana:'la manzana',
 mariposa:'la mariposa',leon:'el león',abeja:'la abeja',avion:'el avión',arbol:'el árbol',elefante:'el elefante',estrella:'la estrella',oso:'el oso',ojo:'los ojos',oveja:'la oveja',uva:'las uvas',pez:'el pez',
 corazon:'el corazón',caracol:'el caracol',lapiz:'el lápiz',tortuga:'la tortuga',tomate:'el tomate',nube:'la nube',nariz:'la nariz',nido:'el nido',dinosaurio:'el dinosaurio',foca:'la foca',flor:'la flor',
 perro:'el perro',auto:'el auto',vaca:'la vaca',cama:'la cama',silla:'la silla',zapato:'el zapato',banana:'la banana',helado:'el helado',pera:'la pera',leche:'la leche',globo:'el globo',barco:'el barco',
 tren:'el tren',rana:'la rana',mano:'la mano',pie:'el pie',sandia:'la sandía',cohete:'el cohete',regalo:'el regalo',papa:'papá',pino:'el pino',moto:'la moto',pala:'la pala',
 hoja:'la hoja',hojaNaranja:'la hoja naranja',hojaRoja:'la hoja roja',hojaMarron:'la hoja marrón',mochila:'la mochila',pinturas:'las pinturas',cuento:'el cuento',tobogan:'el tobogán',boca:'la boca',
 oreja:'la oreja',cara:'la cara',gota:'la gota de agua',ballena:'la ballena',castana:'la castaña',seta:'la seta',paraguas:'el paraguas',botasAgua:'las botas de lluvia',lluvia:'la lluvia',nublado:'las nubes',
 nieve:'la nieve',tormenta:'la tormenta',viento:'el viento',niebla:'la niebla',arcoiris:'el arcoíris',ardilla:'la ardilla',abrigo:'el abrigo',gorro:'el gorro',bufanda:'la bufanda',guantes:'los guantes',
 copo:'el copo de nieve',muneco:'el muñeco de nieve',remera:'la remera',gafas:'los anteojos de sol',gorra:'la gorra',naranja:'la naranja',zumo:'el jugo',banera:'la bañera',nevera:'la heladera',sofa:'el sillón',
 inodoro:'el inodoro',tele:'la tele',cepillo:'el cepillo de dientes',olla:'la olla',cerdo:'el chancho',gallina:'la gallina',caballo:'el caballo',pollito:'el pollito',mariquita:'la mariquita',pajaro:'el pájaro',
 regadera:'la regadera',autobus:'el colectivo',bici:'la bici',cubo:'el balde',toalla:'la toalla',crema:'la crema para el sol',castillo:'el castillo de arena',concha:'la concha',galleta:'la galleta',
 plato:'el plato',bol:'el bol',macedonia:'la ensalada de frutas',maceta:'la maceta',estrellaMar:'la estrella de mar',mama:'mamá',hermano:'el hermano',hermana:'la hermana',bebe:'el bebé',
 abuelo:'el abuelo',abuela:'la abuela',maestra:'la maestra',nene:'el nene'};
// palabras que cambian mucho entre variantes: [rioplatense, España]
export const LEX2: Record<string,Par>={sofa:['el sillón','el sofá'],cubo:['el balde','el cubo'],macedonia:['la ensalada de frutas','la macedonia'],crema:['la crema para el sol','la crema solar'],mariquita:['la vaquita de San Antonio','la mariquita'],
 maestra:['la seño','la profe'],botasAgua:['las botas de lluvia','las botas de agua'],tele:['la tele','la tele'],seta:['el hongo','la seta'],sandia:['la sandía','la sandía']};
// Para nombrar dibujos (k = clave del dibujo): W_ con artículo ('el gato'), usando LEX2 si la palabra cambia mucho y si no LEX + tx().
export const W_=(k: string): string=>{const d=LEX2[k];return d?V(d):tx(LEX[k]||k)};              // con artículo
// Wn(k): nombre sin artículo ('gato').
export const Wn=(k: string): string=>W_(k).replace(/^(el|la|los|las) /,'');           // sin artículo
// art(k): solo el artículo ('el', 'la', 'los', 'las' o '').
const art=(k: string): string=>{const m=W_(k).match(/^(el|la|los|las) /);return m?m[1]:''};
// dela(k): 'del gato', 'de la luna' (contrae de + el).
export const dela=(k: string): string=>{const a=art(k);return a==='el'?'del '+Wn(k):(a?'de '+W_(k):'de '+W_(k))};
// ala(k): 'al gato', 'a la luna' (contrae a + el).
export const ala=(k: string): string=>{const a=art(k);return a==='el'?'al '+Wn(k):'a '+W_(k)};
