// voz.ts: Tito habla. say() es LA función de voz del juego.
//   say(), sayQ(), kid(), PRAISE, praise(), cap(); initAudio() (desbloquea voz y sonido en cada toque);
//   voz del navegador: VOICE, VOICE_EN, pickVoice() (con S.vozNav, vozCalidad, vocesES), vozProbar(), sayTTS();
//   voces grabadas: VOZ, vozLoad, vozFile, vozGet, vozPlay, vozSeq, vozStop (esta versión no lleva MP3: S.voz es 'nav');
//   VIVO.talking y VIVO.sayTok.
// VOICE, VOICE_EN y VOZ cambian (pickVoice, vozLoad): desde fuera de este módulo solo se leen (limites.js y audio.js miran VOZ).
// Al cargar el módulo elige voz, carga el manifiesto de voces (si toca) y envuelve speechSynthesis.cancel.
import { whenQuiet, sceneTok } from './escenas.ts';
import { S } from './guardado.ts';
import { tx } from './idioma.ts';
import { VIVO } from './pantalla.ts';
import { AC, initSonido, MUS } from './sonido.ts';
import { pick } from './utilidades.ts';

/** Opciones de say(): en (inglés, voz VOICE_EN, sin tx ni MP3), rate (velocidad) y pitch (tono). */
export interface OpcionesSay {
  en?: boolean | number;
  rate?: number;
  pitch?: number;
}
/** Un trozo del plan de vozFile: el nombre de un MP3 grabado o {t} con lo que dice la voz del navegador. */
export type TrozoVoz=string|{t: string};
/* ---------- voz ---------- */
// VOICE / VOICE_EN: voces del navegador elegidas para español e inglés. talking: true mientras Tito habla (mueve la boca).
// sayTok: número de la última frase; sirve para ignorar el final de frases que ya se cortaron.
export let VOICE: SpeechSynthesisVoice|null=null,VOICE_EN: SpeechSynthesisVoice|null=null;
Object.assign(VIVO,{talking:false,sayTok:0});
// SPK_OK: ya se "desbloqueó" la voz del navegador (en iOS hay que hablar una vez dentro de un toque).
let SPK_OK=false;
// initAudio(): se llama en cada toque (pointerdown en aplicacion/adultos.ts). Desbloquea la voz del navegador con una frase vacía
// y elige voz, crea y desbloquea el reproductor de voces grabadas (VOZ_EL) y, con initSonido() (sonido.ts), crea el
// AudioContext la primera vez (o lo reanuda si estaba parado) y aplica los volúmenes.
export function initAudio(): void{
  if('speechSynthesis' in window){try{if(!SPK_OK){SPK_OK=true;const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);pickVoice()}else if(speechSynthesis.paused)speechSynthesis.resume()}catch(e){}}
  // Reproductor de las voces grabadas: se crea aquí, dentro del primer toque, y suena un instante de silencio. Safari
  // (iPhone/iPad) solo deja reproducir más tarde (vozPlay, tras descargar el MP3) un <audio> que ya sonó en un toque.
  if(!VOZ_EL&&typeof Audio==='function'){try{const a=VOZ_EL=new Audio(),sil='data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';
    a.src=sil;const p=a.play();if(p)p.then(()=>{if(a.src===sil)a.pause()}).catch(()=>{})}catch(e){}}
  initSonido();
}
// vozCalidad(v): puntos de calidad de una voz del navegador según su nombre. Las «naturales» o en línea (Edge: «Online
// (Natural)») valen 4; las mejoradas de Apple («Premium», «Enhanced», «Mejorada») 3; las de Google y Siri 2; el resto 0.
export const vozCalidad=(v: SpeechSynthesisVoice): number=>/natural|online|neural/i.test(v.name)?4:/premium|enhanced|mejorad/i.test(v.name)?3:/google|siri/i.test(v.name)?2:0;
// vocesES(): las voces en español del navegador, de mejor a peor calidad (vozCalidad); a igual calidad, el orden del navegador.
export function vocesES(): SpeechSynthesisVoice[]{if(!('speechSynthesis' in window))return [];return speechSynthesis.getVoices().filter(v=>/^es/i.test(v.lang)).map((v,i)=>[v,i] as const).sort((a,b)=>vozCalidad(b[0])-vozCalidad(a[0])||a[1]-b[1]).map(a=>a[0])}
// pickVoice(): elige la voz del navegador. Si en la zona de adultos se eligió una (S.vozNav, su voiceURI o nombre) y está
// en este aparato, usa esa. Si no, la automática: primero por país (España, o Argentina/Uruguay en rioplatense) y,
// dentro del país, la de más calidad (vozCalidad). También elige la voz inglesa (británica en modo España).
export function pickVoice(): void{
  if(!('speechSynthesis' in window))return; const all=speechSynthesis.getVoices(),en=all.filter(v=>/^en/i.test(v.lang));
  if(en.length){const pe=S.variant==='es'?['en-GB','en-IE','en-US','en-AU']:['en-US','en-GB','en-CA','en-AU'],Le=(v: SpeechSynthesisVoice): string=>v.lang.replace('_','-').toLowerCase();VOICE_EN=null;
    for(const p of pe){const c=en.filter(v=>Le(v)===p.toLowerCase());if(c.length){VOICE_EN=c.find(v=>/google|natural|premium|enhanced/i.test(v.name))||c[0] as SpeechSynthesisVoice;break}}if(!VOICE_EN)VOICE_EN=en[0] as SpeechSynthesisVoice}
  const vs=vocesES(); if(!vs.length)return;
  if(typeof S.vozNav==='string'&&S.vozNav){const nav=S.vozNav,v=vs.find(v=>v.voiceURI===nav||v.name===nav);if(v){VOICE=v;return}}// la elegida (si no está en este aparato, la automática)
  const pref=S.variant==='es'?['es-ES','es-MX','es-US','es-419','es-AR']:['es-AR','es-UY','es-US','es-419','es-MX','es-CO','es-ES'];
  const L=(v: SpeechSynthesisVoice): string=>v.lang.replace('_','-');
  for(const p of pref){const c=vs.find(v=>L(v).toLowerCase()===p.toLowerCase()); if(c){VOICE=c;return}}// vs ya va de mejor a peor
  VOICE=vs[0] as SpeechSynthesisVoice;
}
// vozProbar(): dice un saludo con la voz del navegador elegida (VOICE), aunque S.voz sea la grabada, para comparar voces
// en la zona de adultos. Corta lo que estuviera sonando. Usa una frase que ya existe (no hay frase nueva).
export function vozProbar(): void{try{speechSynthesis.cancel()}catch(e){}const tok=++VIVO.sayTok;sayTTS(tx('¡Hola! Soy Tito. ¿Jugamos? Tocá la plaza.'),tok,()=>{})}
// Algunos navegadores cargan las voces tarde: se vuelve a elegir cuando avisan de que cambiaron.
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
/* ---------- voces grabadas: solo en la web (carpeta voz/ con manifest.json); si una frase no tiene audio, habla el navegador ---------- */
// vozN: junta espacios repetidos; vozK: clave de búsqueda en el manifest (sin punto final, en minúsculas). Así
// "¡Hola!  " y "¡hola!" encuentran el mismo audio.
const vozN=(t: string): string=>t.replace(/\s+/g,' ').trim(),vozK=(t: string): string=>vozN(t).replace(/[.\s]+$/,'').toLowerCase();
// S.voz: '' = la voz grabada de siempre (voz/), 'fer' = la voz de Fer (voz-fer/, mismos nombres de archivo); 'nav' = todo con la voz del navegador (no se usa ningún MP3)
// VOZ: {clave de frase: archivo mp3} leído del manifest (null si no hay); VOZ_DIR: carpeta actual; VOZ_EL: el único
// reproductor <audio>; VOZ_FIN: qué hacer al acabar la frase actual; VOZ_RATE: velocidad (0,9); VOZ_BL: audios ya descargados.
export let VOZ: Record<string,string>|null=null;let VOZ_DIR='voz/',VOZ_EL: HTMLAudioElement|null=null,VOZ_FIN: (()=>void)|null=null;const VOZ_RATE=.9,VOZ_BL: Record<string,Promise<string>>={};
// vozLoad(cb): carga voz/manifest.json o voz-fer/manifest.json (según S.voz) y llama a cb al acabar.
// Con S.voz 'nav' no carga nada: VOZ queda en null y say() habla siempre con la voz del navegador.
// El manifest tiene la forma {"f": {"Frase exacta.": "archivo.mp3", ...}}. Solo funciona servido por http(s), no con file://.
// Si mientras tanto se cambió de carpeta, la respuesta vieja se descarta.
export function vozLoad(cb?: ()=>void): void{const dir=S.voz==='fer'?'voz-fer/':'voz/';VOZ=null;VOZ_DIR=dir;
  if(S.voz==='nav'){VOZ_DIR='';if(cb)cb();return}// solo voz del navegador
  try{if(/^https?:/.test(location.protocol))fetch(dir+'manifest.json').then(r=>r.ok?r.json() as Promise<{f?: Record<string,string>}>:null).then(m=>{if(VOZ_DIR!==dir)return;if(m&&m.f){const v: Record<string,string>={};for(const k in m.f)v[vozK(k)]=m.f[k] as string;VOZ=v}if(cb)cb()}).catch(()=>{if(cb)cb()})}catch(e){}}
vozLoad();
// vozFile(texto): plan para decir la frase con lo grabado: lista de trozos en orden, cada uno el nombre de un mp3
// (texto) o {t: texto} para lo que no está grabado (lo dice la voz del navegador). null si no hay nada grabado.
// Quita antes ", nombre" del niño (las grabaciones no lo llevan; say() lo añade aparte).
// Si la frase entera no está grabada, la parte en oraciones y busca trozos grabados de izquierda a derecha, cada vez el
// trozo más largo posible: "¡Súper!" + "¡Sus plumas! Lo tienen calentito." o "¡Muy bien!" + "La pelota.". Así una
// felicitación al azar (praise) delante de una frase grabada sin ella también suena con MP3. Las oraciones sin grabar
// (por ejemplo con datos que cambian: "Tienes 12 monedas.") quedan como {t} y se mezclan con las grabadas.
export function vozFile(t: string): TrozoVoz[]|null{if(!VOZ)return null;const voz=VOZ;t=vozN(S.name?t.split(', '+S.name).join(''):t);const one=voz[vozK(t)];if(one)return [one];
  const ss=(t.match(/[^.!?…]+[.!?…]*/g)||[]).map(vozN).filter(s=>vozK(s));if(!ss.length)return null;const fs: TrozoVoz[]=[];
  for(let i=0;i<ss.length;){let j=ss.length,f: string|undefined;for(;j>i;j--){f=voz[vozK(ss.slice(i,j).join(' '))];if(f)break}// j: fin del trozo más largo grabado que empieza en i
    if(f){fs.push(f);i=j;continue}
    const s=ss[i] as string,pz=vozPieces(s);if(pz){fs.push(...pz);i++;continue}// oración con números: por piezas grabadas
    const l=fs[fs.length-1];if(l&&typeof l!=='string')l.t+=' '+s;else fs.push({t:s});i++}// sin grabar: a la voz del navegador
  return fs.some(f=>typeof f==='string')?fs:null}
// VOZ_CIEN: cómo se dicen las centenas (101-199 "ciento", 200 "doscientos"...). Cada una es una pieza grabada.
const VOZ_CIEN=['ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'];
// vozNum(n): claves de manifiesto para decir el número n con piezas grabadas: "0".."100" tal cual, y de 101 a 999 la
// centena más el resto ("cuatrocientos" + "53"). null si es más grande o si falta alguna pieza por grabar.
function vozNum(n: number): string[]|null{const voz=VOZ;if(!voz)return null;if(voz[String(n)])return [String(n)];if(n<101||n>999)return null;const c=VOZ_CIEN[Math.floor(n/100)-1] as string,r=n%100,k=r?[c,String(r)]:[c===VOZ_CIEN[0]?'cien':c];return k.every(x=>voz[x])?k:null}
// vozPieces(oración): solo para oraciones con números (fechas, monedas, estrellas...). Quita los signos (¡!¿?.,:), parte
// en palabras y las junta en piezas grabadas de izquierda a derecha, cada vez la más larga: "Hoy es jueves 22 de
// octubre." = "hoy es jueves" + "22" + "de octubre". Los números se dicen con vozNum. Devuelve la lista de mp3, o null
// si falta alguna pieza (entonces la oración la dice la voz del navegador).
function vozPieces(s: string): string[]|null{const voz=VOZ;if(!voz||!/\d/.test(s))return null;const w=s.replace(/[¡!¿?.,:;]/g,' ').toLowerCase().split(/\s+/).filter(Boolean),fs: string[]=[];
  for(let i=0;i<w.length;){if(/^\d+$/.test(w[i] as string)){const k=vozNum(+(w[i] as string));if(!k)return null;for(const x of k)fs.push(voz[x] as string);i++;continue}
    let j=w.length,f: string|undefined;for(;j>i;j--){if(w.slice(i,j).some(x=>/^\d+$/.test(x)))continue;f=voz[w.slice(i,j).join(' ')];if(f)break}// j: fin de la pieza más larga
    if(!f)return null;fs.push(f);i=j}
  return fs}
// como speechSynthesis.cancel(): cortar una frase también la da por terminada
// vozStop(): para el MP3 que suena y llama a su "fin" (así quien esperaba el final de la frase sigue).
export function vozStop(): void{const f=VOZ_FIN;VOZ_FIN=null;if(VOZ_EL){VOZ_EL.onended=VOZ_EL.onerror=null;try{VOZ_EL.pause()}catch(e){}}if(f)f()}
// Truco: se envuelve speechSynthesis.cancel() para que, al cortar la voz (por ejemplo en go()), también se corte el MP3.
if('speechSynthesis' in window){try{const c0=speechSynthesis.cancel.bind(speechSynthesis);speechSynthesis.cancel=()=>{vozStop();c0()}}catch(e){}}
// vozGet(archivo): promesa con la URL (blob) del mp3, descargándolo una sola vez (se guarda la promesa en VOZ_BL, así la
// precarga y la reproducción piden el mismo archivo una sola vez). Si falla, se borra para poder reintentar.
export function vozGet(f: string): Promise<string>{f=VOZ_DIR+f;const ya=VOZ_BL[f];return ya||(VOZ_BL[f]=fetch(f).then(r=>{if(!r.ok)throw new Error(f);return r.blob()}).then(b=>URL.createObjectURL(b)).catch((e: unknown)=>{delete VOZ_BL[f];throw e}))}
// vozPlay(archivos, tok, fin, fallo): reproduce los mp3 uno tras otro con el mismo <audio>. Los descarga todos a la vez
// (precarga) y los guarda como blob en VOZ_BL. Si entretanto empezó otra frase (tok!==sayTok), no suena.
// Al acabar el último llama a fin(); si algo falla llama a fallo() (say() usa entonces la voz del navegador).
export function vozPlay(fs: readonly string[],tok: number,fin: ()=>void,fail: ()=>void): void{
  const a=VOZ_EL||(VOZ_EL=new Audio()),get=vozGet;
  const step=(n: number): void=>{if(n>=fs.length){VOZ_FIN=null;fin();return}get(fs[n] as string).then(u=>{if(tok!==VIVO.sayTok)return;if(n===0)vozStop();a.src=u;a.playbackRate=VOZ_RATE;a.preservesPitch=true;a.volume=Math.min(1,S.vol.voz);VOZ_FIN=fin;
    a.onended=()=>step(n+1);a.onerror=()=>{VOZ_FIN=null;fail()};const p=a.play();if(p)p.catch(()=>{VOZ_FIN=null;fail()})}).catch(()=>{VOZ_FIN=null;fail()})};
  Promise.all(fs.map(get)).catch(()=>{});step(0);
}
// sayTTS(texto, tok, luego): dice un trozo con la voz del navegador y después llama a luego() (una sola vez; también si
// se corta). Si la frase ya no es la actual (tok!==sayTok), no habla. Lo usa vozSeq para el nombre del niño y para las oraciones sin grabar de una frase mezclada.
// Sin voz del navegador, o si no avisa del final a tiempo, sigue igualmente.
export function sayTTS(tt: string,tok: number,next: ()=>void): void{let go=false;const nx=(): void=>{if(go)return;go=true;next()};
  if(!('speechSynthesis' in window)||tok!==VIVO.sayTok){nx();return}
  try{const u=new SpeechSynthesisUtterance(tt);if(VOICE){u.voice=VOICE;u.lang=VOICE.lang}else u.lang=S.variant==='es'?'es-ES':'es-AR';
    u.rate=.9;u.pitch=1.1;u.volume=S.vol.voz;u.onend=nx;u.onerror=nx;speechSynthesis.speak(u)}catch(e){nx();return}
  setTimeout(nx,1500+tt.length*95)}
// vozSeq(plan, tok, fin, fallo): dice un plan de vozFile (mp3 y trozos {t}) en orden: los mp3 seguidos se juntan en un
// solo vozPlay y los {t} los dice sayTTS. Precarga todos los mp3 al empezar. Al acabar llama a fin(); si falla un mp3,
// a fallo() (say() dice entonces la frase entera con la voz del navegador).
export function vozSeq(plan: readonly TrozoVoz[],tok: number,fin: ()=>void,fail: ()=>void): void{plan.forEach(f=>{if(typeof f==='string')vozGet(f).catch(()=>{})});
  const step=(i: number): void=>{if(tok!==VIVO.sayTok||i>=plan.length){fin();return}// cortada por otra frase: también se da por terminada
    const p=plan[i];if(typeof p!=='string'&&p){sayTTS(p.t,tok,()=>step(i+1));return}
    let j=i;while(j<plan.length&&typeof plan[j]==='string')j++;// i..j-1: mp3 seguidos
    vozPlay(plan.slice(i,j) as string[],tok,()=>step(j),fail)};
  step(0)}
/* say(texto, cb, o): Tito dice una frase. Es LA función de voz del juego.
   - texto: se pasa por tx() (salvo en inglés, o.en). Con el texto final se busca un MP3 grabado (voz/manifest.json o
     voz-fer/); si lo hay suena el MP3 y, si no, habla la voz del navegador (speechSynthesis).
     Si solo una parte está grabada, se mezclan: lo grabado con MP3 y el resto (datos que cambian, como fechas o
     monedas) con la voz del navegador (vozFile/vozSeq). Si lleva el nombre del niño (", nombre"), el nombre lo dice
     antes la voz del navegador y luego suena lo grabado sin el nombre.
   - cb: se llama al terminar la frase, pero solo si no se ha cambiado de escena mientras tanto (sceneTok).
   - o: en (inglés, voz VOICE_EN, sin tx ni MP3), rate (velocidad), pitch (tono).
   Cada frase nueva corta la anterior (sayTok). Mientras habla, talking=true y la música baja. Hay temporizadores de
   seguridad por si el navegador nunca avisa del final. window.__fast es para las pruebas automáticas (no habla).
   REGLA: no cambies el texto de ninguna frase que ya exista: el MP3 se busca por el texto exacto y se perdería.
   Las frases nuevas se escriben en castellano de España y se apuntan para grabarlas. */
export function say(t: string,cb?: (()=>void)|null,o: OpcionesSay={}): void{
  if(!o.en)t=tx(t);
  const tok=++VIVO.sayTok, my=sceneTok; let done=false;
  VIVO.idle=0;// la ayuda cuenta desde que Tito calla (quien quiera la ayuda enseguida pone idle=12 después de say)
  const fin=(): void=>{if(done)return;done=true;if(tok===VIVO.sayTok)VIVO.talking=false;if(MUS&&AC)MUS.gain.setTargetAtTime(S.vol.mus*.22,AC.currentTime,.2);if(cb&&my===sceneTok)cb()};
// est: duración estimada de la frase en ms (para los temporizadores de seguridad).
  const est=900+t.length*85/(o.rate||1);
  if(window.__fast){if(window.__said)window.__said.push(t);VIVO.talking=true;setTimeout(fin,30);return}
// vf: plan de vozFile para la frase (mp3 grabados y trozos {t}), o null/false si no hay nada grabado o la voz está a 0.
  const vf=!o.en&&S.vol.voz>0&&vozFile(t);
// Sin MP3 y sin voz del navegador (o con volumen 0): se hace como que habla un rato para que el juego siga.
  if(!vf&&(!('speechSynthesis' in window)||S.vol.voz<=0)){VIVO.talking=true;setTimeout(fin,Math.min(est,2500));return}
  try{speechSynthesis.cancel()}catch(e){}
  if(MUS&&AC)MUS.gain.setTargetAtTime(S.vol.mus*.07,AC.currentTime,.1);
  VIVO.talking=true;
// speak(): habla con la voz del navegador, si esta sigue siendo la frase actual.
  const speak=(): void=>{ if(tok!==VIVO.sayTok||!('speechSynthesis' in window))return;
    const u=new SpeechSynthesisUtterance(t),vv=o.en?VOICE_EN:VOICE; if(vv){u.voice=vv;u.lang=vv.lang}else u.lang=o.en?(S.variant==='es'?'en-GB':'en-US'):S.variant==='es'?'es-ES':'es-AR';
    u.rate=o.rate||.9; u.pitch=o.pitch||1.1; u.volume=S.vol.voz; u.onend=fin; u.onerror=fin;
    speechSynthesis.speak(u);
  };
// Con MP3: si falla, se usa speak(). El temporizador final es de seguridad.
// Si la frase lleva el nombre del niño (", Lucía", de kid() o praise()), el MP3 grabado no lo tiene: Tito dice antes
// el nombre con la voz del navegador y después suena lo grabado ("Lucía. ¡Muy bien! ¡Una estrella más!").
  if(vf){if(S.name&&t.includes(', '+S.name))vf.unshift({t:S.name+'.'});
    vozSeq(vf,tok,fin,()=>{if(tok===VIVO.sayTok&&!done)speak()});setTimeout(fin,est/VOZ_RATE+4000+vf.filter(f=>typeof f!=='string').length*2500);return}
  setTimeout(speak,60);
  setTimeout(fin,est+1500);
}
// sayQ(texto, cb, o): como say(), pero espera a que Tito acabe la frase que esté diciendo (whenQuiet). Para las frases
// que el juego dice solo, programadas con later() (consignas, presentaciones): así no cortan una frase que dijo Tito al
// responder a un toque del niño en ese rato.
export function sayQ(t: string,cb?: (()=>void)|null,o?: OpcionesSay): void{whenQuiet(()=>say(t,cb,o))}
// kid(): ', nombre' si se sabe el nombre del niño (para añadirlo a una frase); si no, ''.
export const kid=(): string=>S.name?(', '+S.name):'';
// PRAISE: felicitaciones (tienen MP3: no cambies el texto).
export const PRAISE=['¡Muy bien!','¡Genial!','¡Bravo!','¡Excelente!','¡Eso es!','¡Qué bien!','¡Súper!','¡Lo encontraste!'];
// praise(): una felicitación al azar; la mitad de las veces le añade el nombre del niño.
export const praise=(): string=>{const p=pick(PRAISE);return S.name&&Math.random()<.5?p.slice(0,-1)+', '+S.name+'!':p};
// cap(texto): pone en mayúscula la primera letra.
export const cap=(s: string): string=>s?(s[0] as string).toUpperCase()+s.slice(1):s;
