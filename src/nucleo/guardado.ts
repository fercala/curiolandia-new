// guardado.ts: el estado guardado S (la partida) y cómo se carga, se arregla y se guarda.
//   KEY, DEF, S, ponS(), sanoS(), sanoHondo(), save(), rec(), ponRec(), ymd(), today(), AGE().
// S cambia (ponS, al borrar todo): desde fuera de este módulo solo se lee y se cambian sus campos. rec cambia con ponRec.
// Al cargar el módulo se lee la partida (load) y se escucha el guardado de otras pestañas (evento storage).
import type { Estado, Volumenes } from './tipos.ts';

/*
 * ESTADO GUARDADO S
 * -----------------
 * S es un único objeto con TODO el progreso y los ajustes del niño. Se guarda entero, como JSON, en el localStorage
 * del navegador con la clave KEY ('curiolandia-new.v1') cada vez que se llama a save(). No hay guardado automático:
 * después de cambiar algo de S hay que llamar a save().
 *
 * Campos que crea DEF (aquí):
 *   age      3, 4 o 5 (0 = aún no elegida; AGE() devuelve entonces 3).
 *   name     nombre del niño ('' si no se dio). Tito lo dice en voz alta (kid(), praise()).
 *   variant  'ar' (rioplatense) o 'es' (castellano de España): cambia palabras con tx()/V() y la voz del navegador.
 *   hemi     'N' o 'S': hemisferio, para calcular la estación del año (estacionDe).
 *   vol      {voz, mus, fx}: volúmenes de 0 a 1 de la voz, la música y los efectos.
 *   limit    minutos de juego por sesión (0 = sin límite; 10, 15 o 20). Al llegar, Tito se va a dormir (escena 'dormir').
 *   temas    {idTema: {g: {númeroDeJuego: veces jugado}, done: 0/1}}: progreso de cada tema (escenas/escenas2d.ts).
 *   stats    {habilidad: {ok, err}}: aciertos y fallos por habilidad (rec()); se ven en la zona de adultos.
 *   days     {'AAAA-MM-DD': minutos}: tiempo jugado cada día (se guardan los últimos 30; lo apunta frame() en adult.js).
 *   asam     {'AAAA-MM-DD': {done, age, dia, tiempo, emo}}: la asamblea de cada día (escenas/escenas2d.ts).
 *   stk      {dibujo: cantidad}: pegatinas (figuritas) del álbum (giveSticker()).
 *   album    lista vacía que no usa ningún archivo (se conserva por compatibilidad).
 *   intro    true cuando ya se vio el cuento de bienvenida.
 *   first    marcas de "primera vez": fromLetri (datos traídos de Letrilandia), askedName (ya se preguntó el nombre).
 *   seenFl   cuántas flores del caparazón de Tito ya se celebraron (para avisar solo de las nuevas).
 *
 * Campos que añaden otros archivos al arrancar (si faltan en la partida, les ponen su valor por defecto):
 *   escenas/tienda.ts (DEF2): coins, coinsTot, gift, woke, home, tito {shell, scarf, hat, glasses, bow y kind}, owned,
 *                     vales, valesLog, bday, bdayDone, unlockAll, seenOpen, houseSeen, petSeen, cofres.
 *   repaso.js: kg {habilidad: [juegos donde sale]}, gs {'idTema#juego': {ok, err, d}} y rep (el repaso del día).
 *   Sueltos (pueden no existir): voz ('' o 'fer'), quiet3 (1 = Tito no comenta el paisaje 3D), last (último tema abierto).
 *
 * REGLA DE ORO: hay partidas guardadas en los móviles. Nunca cambies de forma incompatible un campo que ya existe
 * (ni su nombre, ni su tipo, ni lo que significan sus valores) ni la clave KEY. Para algo nuevo, añade un campo
 * nuevo y recuerda que en las partidas viejas NO estará: dale un valor por defecto (en DEF, en DEF2 de escenas/tienda.ts
 * o con "S.x||valor" al leerlo). Ojo: al cargar, Object.assign solo mezcla el primer nivel: dentro de un objeto
 * (salvo vol) no se añaden valores por defecto que falten.
 */
// KEY: clave de guardado de esta versión. KEY_VIEJA es la de curiolandia-3d, que se publica en el mismo dominio
// (fercala.github.io) y por eso comparte localStorage: su partida se copia una sola vez (ver load()) y nunca se escribe.
// KEY_COPIA marca que esa copia ya se hizo (solo si había partida vieja), para no volver a traerla nunca más.
export const KEY='curiolandia-new.v1',KEY_VIEJA='curiolandia.v1',KEY_COPIA='curiolandia-new.copiada';
// DEF: valores de una partida nueva (ver la explicación de arriba). doReset() (adult.js) también parte de aquí.
// variant '' (aún sin elegir) y hemi 'N' llevan su tipo de Estado para que S (copia de DEF) sea un Estado.
export const DEF={age:0,name:'',variant:'' as Estado['variant'],hemi:'N' as Estado['hemi'],vol:{voz:1,mus:.45,fx:.8},limit:0,temas:{},stats:{},days:{},asam:{},stk:{},album:[],intro:false,first:{},seenFl:0};
// S empieza siendo una copia de DEF (JSON.parse(JSON.stringify(...)) hace una copia profunda) y load() la completa.
export let S: Estado=JSON.parse(JSON.stringify(DEF)) as Estado;
// ponS(nuevo): cambia la partida entera por otra (borrar todo en adult.js). Es la única forma de cambiar S desde otro
// archivo; para cambiar un campo basta con S.campo = valor.
export function ponS(nuevo: Estado): void{S=nuevo}
// Una partida leída de localStorage (o de otra pestaña) antes de arreglarla: cualquier campo puede traer cualquier cosa.
type Crudo=Record<string,unknown>;
// sanoS(d, def): arregla en el sitio los campos de una partida guardada d que no tienen el tipo de su valor por defecto
// en def, para que una partida o copia rota no rompa el juego. Solo mira los campos que def tiene con un valor no null:
//   - null o undefined: se borra (queda el valor por defecto);
//   - def es objeto/lista y d no lo es (o uno es lista y el otro no): se borra;
//   - def es texto: un número se pasa a texto (nombre 123 → "123"); otra cosa se borra;
//   - def es número: un texto con número se pasa a número ("4" → 4); otra cosa se borra;
//   - def es sí/no: se deja como esté (las partidas viejas pueden tener 1/0).
// Dentro de temas quita las entradas que no son objetos ({"3A-T1": null}). Devuelve d.
export function sanoS<D extends object>(partida: D,defecto: object): D{const d=partida as Crudo,def=defecto as Readonly<Crudo>;
  for(const k in def){const v=d[k],dv=def[k];if(dv===null||!(k in d))continue;
    if(v==null){delete d[k];continue}
    if(typeof dv==='object'){if(typeof v!=='object'||Array.isArray(v)!==Array.isArray(dv))delete d[k]}
    else if(typeof dv==='string'){if(typeof v==='number')d[k]=String(v);else if(typeof v!=='string')delete d[k]}
    else if(typeof dv==='number'){if(typeof v==='string'&&v.trim()!==''&&isFinite(+v))d[k]=+v;else if(typeof v!=='number'||!isFinite(v))delete d[k]}}
  const te=d['temas'];if(te&&typeof te==='object'){const tt=te as Crudo;for(const t in tt){const x=tt[t];if(!x||typeof x!=='object')delete tt[t]}}
  return partida}
// sanoHondo(d): el segundo paso de sanoS, por dentro de los campos que son colecciones (una copia editada o rota puede
// traer {"home":{"robot":null}} y romper la casa al dibujarla). Arregla en el sitio y devuelve d:
//   - temas.X.g que no es un objeto → {} (el tema queda sin juegos hechos);
//   - stats.X y gs.X que no son objetos → se borran; sus ok/err que no son números → 0;
//   - home.X sin x/y numéricos → se borra (el objeto sigue comprado; placeHome le busca sitio);
//   - kg.X que no es una lista → se borra; cofreP que no es un objeto → se borra;
//   - vales y valesLog: se quitan las entradas que no son objetos con id; si vales queda vacía se borra (vuelven los de fábrica);
//   - rep sin list (lista) o done (objeto) → se borra (se vuelve a armar el repaso de hoy).
export function sanoHondo<D extends object>(partida: D): D{const d=partida as Crudo,ob=(v: unknown): v is Crudo=>!!v&&typeof v==='object'&&!Array.isArray(v),num=(v: unknown): boolean=>typeof v==='number'&&isFinite(v);
  const temas=d['temas'];if(ob(temas))for(const t in temas){const x=temas[t];if(ob(x)&&!ob(x['g']))x['g']={}}
  for(const k of['stats','gs']){const c=d[k];if(ob(c))for(const i in c){const e=c[i];if(!ob(e)){delete c[i];continue}for(const f of['ok','err'])if(!num(e[f]))e[f]=0}}
  const home=d['home'];if(ob(home))for(const i in home){const p=home[i];if(!ob(p)||!num(p['x'])||!num(p['y']))delete home[i]}
  const kg=d['kg'];if(ob(kg))for(const i in kg)if(!Array.isArray(kg[i]))delete kg[i];
  if('cofreP' in d&&!ob(d['cofreP']))delete d['cofreP'];
  const conId=(v: unknown): boolean=>ob(v)&&typeof v['id']==='string';
  const vales=d['vales'];if(Array.isArray(vales)){const f=vales.filter(conId);d['vales']=f;if(!f.length)delete d['vales']}
  const log=d['valesLog'];if(Array.isArray(log))d['valesLog']=log.filter(conId);
  const rep=d['rep'];if(rep!=null&&!(ob(rep)&&Array.isArray(rep['list'])&&ob(rep['done'])))delete d['rep'];
  return partida}
// conVol(d): la partida d (ya arreglada) lista para mezclar encima de S, con sus volúmenes completados con los de DEF.
const conVol=(d: Crudo): Partial<Estado>=>Object.assign({},d,{vol:Object.assign({},DEF.vol,(d['vol']||{}) as Partial<Volumenes>)});
// load(): se ejecuta una sola vez, al arrancar. Lee la partida guardada y la mezcla encima de DEF: lo que falte en una
// partida vieja queda con su valor por defecto; vol se mezcla aparte para no perder volúmenes nuevos. Antes, sanoS() quita
// los campos con un tipo imposible (null, un nombre que no es texto...), que también quedan con su valor por defecto, y
// sanoHondo() arregla lo que hay dentro de las colecciones (temas, home, vales...).
// Si no hay partida propia y nunca se copió, trae la de curiolandia-3d (KEY_VIEJA) una sola vez: la lee, apunta
// KEY_COPIA y la trata como una partida guardada más (el siguiente save() la escribe ya en KEY). La vieja no se toca.
// Una vieja rota (JSON mal escrito) se ignora sin marcar la copia: el juego empieza una partida nueva.
// Si tampoco hay esa, intenta traer nombre, edad, acento y volumen de Letrilandia (otro juego que guarda en
// 'letrilandia.v1' en el mismo dominio). Los try/catch evitan fallos si el navegador bloquea localStorage.
(function load(): void{
  let d: unknown=null; try{d=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(!d)try{if(!localStorage.getItem(KEY_COPIA)){d=JSON.parse(localStorage.getItem(KEY_VIEJA)||'null');if(d)localStorage.setItem(KEY_COPIA,'1')}}catch(e){d=null}
  if(d&&typeof d==='object'&&!Array.isArray(d)){const c=d as Crudo;sanoS(c,DEF);sanoHondo(c);if(c['vol'])sanoS(c['vol'] as Crudo,DEF.vol);S=Object.assign(S,conVol(c));return}
  // primera vez: si Letrilandia ya se jugó en este dispositivo, traemos nombre, edad, acento y volúmenes
  try{const l=JSON.parse(localStorage.getItem('letrilandia.v1')||'null') as {name?: string;age?: number;accent?: string;vol?: Partial<Volumenes>}|null;
    if(l){if(l.name)S.name=l.name;if(l.age)S.age=l.age;if(l.accent)S.variant=l.accent==='es'?'es':'ar';if(l.vol)S.vol=Object.assign({},DEF.vol,l.vol);S.first['fromLetri']=1}}catch(e){}
})();
// Por defecto (partida nueva), castellano de España: es el acento de las voces grabadas (voz/, voz-fer/); con
// rioplatense casi todas las frases irían con la voz del navegador. Las partidas que ya eligieron acento no cambian.
// El texto original está escrito en rioplatense y tx() lo pasa a España.
if(!S.variant)S.variant='es';
// Esta versión no lleva voces grabadas (ni voz/ ni voz-fer/): todo lo dice la voz del navegador. Una partida copiada
// de curiolandia-3d puede traer S.voz '' o 'fer'; se pasa a 'nav' para que vozLoad() no busque manifiestos.
S.voz='nav';
// save(): guarda S entero en localStorage. Llámala después de cada cambio de S. Si falla (modo privado, sin espacio)
// no pasa nada: el juego sigue, pero sin guardar.
export function save(): void{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
// Dos pestañas con el juego: cuando la otra guarda, el navegador avisa aquí (evento storage) y esta pestaña adopta
// esa partida (pasada por sanoS/sanoHondo, como al cargar). Así su próximo save() no pisa con datos viejos lo que se
// jugó en la otra (por ejemplo, cambiar el volumen aquí borraba una actividad terminada allí).
addEventListener('storage',e=>{if(e.key!==KEY||!e.newValue)return;let d: unknown;try{d=JSON.parse(e.newValue)}catch(er){return}
  if(!d||typeof d!=='object'||Array.isArray(d))return;const c=d as Crudo;sanoS(c,DEF);sanoHondo(c);Object.assign(S,conVol(c))});
// ymd(fecha): devuelve 'AAAA-MM-DD' (hora local). Es el formato de las claves de S.days, S.asam, S.gift...
export const ymd=(d: Date): string=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
// today(): la fecha de hoy como 'AAAA-MM-DD'.
export const today=(): string=>ymd(new Date());
// rec(habilidad, acierto): suma un acierto (ok verdadero) o un fallo en S.stats[habilidad] y guarda.
// repaso.js la envuelve para apuntar además el resultado por juego (S.gs, S.kg).
export let rec=(k: string,ok: unknown): void=>{const s=S.stats[k]||(S.stats[k]={ok:0,err:0});if(ok)s.ok++;else s.err++;save()};
// ponRec(f): cambia rec por otra función (repaso.js la envuelve para apuntar también los fallos de cada juego).
export function ponRec(f: typeof rec): void{rec=f}
// AGE(): edad elegida (3, 4 o 5); si aún no se eligió, 3.
export const AGE=(): number=>S.age||3;
