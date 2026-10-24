// sonido.ts: efectos, sonidos de animales y vehículos, y música. Todo se genera con Web Audio (no hay archivos de efectos).
//   AC, FX, MUS, initSonido(), setVol(), tone(), noise(), syn(), SFX, SOUNDS, ONO, playSound(), MUSIC, musKey,
//   ponMusica(), musicTick().
// La voz (say, voces grabadas) está en voz.ts; initAudio() (voz.ts) desbloquea la voz y llama a initSonido().
import { S } from './guardado.ts';

/** Opciones de syn() (ver su comentario). */
export interface OpcionesSyn {
  f: number;
  fm?: number;
  f2?: number;
  d?: number;
  type?: OscillatorType;
  v?: number;
  vib?: number;
  vibA?: number;
  lp?: number;
  bp?: number;
  q?: number;
  delay?: number;
  att?: number;
}
/** Una música de fondo: escala s (semitonos sobre la nota base), nota base b (MIDI) y segundos entre notas sp. */
export interface Musica {
  s: readonly number[];
  b: number;
  sp: number;
}
/* ---------- audio ---------- */
/* SONIDO. Todo se genera con Web Audio (no hay archivos de efectos). AC es el AudioContext; FX y MUS son dos
   "buses" de volumen (efectos y música) conectados a los altavoces; setVol() les pone el volumen de S.vol.
   Los navegadores no dejan sonar nada hasta que se toca la pantalla: por eso initAudio() se llama en cada toque. */
export let AC: AudioContext|null=null,FX: GainNode|null=null,MUS: GainNode|null=null;
// initSonido(): la parte de initAudio() (voz.ts) que toca a Web Audio: crea el AudioContext y los buses FX y MUS la
// primera vez (o lo reanuda si estaba parado) y aplica los volúmenes. Si el navegador no tiene Web Audio, AC queda en null.
export function initSonido(): void{
  if(AC){if(AC.state!=='running')void AC.resume();return}
  try{const Ctor=window.AudioContext||(window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext;AC=new Ctor();FX=AC.createGain();MUS=AC.createGain();FX.connect(AC.destination);MUS.connect(AC.destination);setVol()}catch(e){AC=null}
}
// setVol(): aplica S.vol.fx y S.vol.mus a los buses FX y MUS (con un factor para que no suenen demasiado fuerte).
export function setVol(): void{if(!AC||!FX||!MUS)return;FX.gain.value=S.vol.fx*.6;MUS.gain.value=S.vol.mus*.22}
// tone(frecuencia Hz, duración s, tipo, volumen, slide, retraso s, bus): un pitido sencillo.
// tipo de onda: 'sine' (suave), 'triangle', 'square' (más electrónico) o 'sawtooth' (áspero). slide: si no es 0, la
// frecuencia acaba en f*slide (2 sube una octava, .5 la baja). El volumen sube en 12 ms y luego se apaga poco a poco.
// bus: por defecto FX (efectos); la música usa MUS. Si el audio aún no está creado, no hace nada.
export function tone(f: number,d=.15,type: OscillatorType='sine',v=.5,slide=0,delay=0,bus?: AudioNode|null): void{
  if(!AC)return; const t=AC.currentTime+delay, o=AC.createOscillator(), g=AC.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t); if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+.012); g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g); g.connect((bus||FX) as AudioNode); o.start(t); o.stop(t+d+.05);
}
// noise(duración, volumen, frecuencia, retraso, q): ruido blanco pasado por un filtro de banda centrado en frecuencia
// (q alto = filtro más estrecho, sonido más "afinado"). Sirve para golpes, soplidos, chapoteos, pasos... Se apaga poco a poco.
export function noise(d=.2,v=.3,f=1200,delay=0,q=1): void{
  if(!AC)return; const t=AC.currentTime+delay, n=Math.floor(AC.sampleRate*d), b=AC.createBuffer(1,n,AC.sampleRate), da=b.getChannelData(0);
  for(let i=0;i<n;i++)da[i]=Math.random()*2-1; const s=AC.createBufferSource(); s.buffer=b;
  const fl=AC.createBiquadFilter(); fl.type='bandpass'; fl.frequency.value=f; fl.Q.value=q; const g=AC.createGain();
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); s.connect(fl); fl.connect(g); g.connect(FX as GainNode); s.start(t);
}
// voz sintetizada para animales y vehículos: o={f,f2,d,type,v,vib,vibA,lp,delay,att}
// syn(o): un sonido con forma, para imitar animales y vehículos. Campos de o: f frecuencia inicial; fm frecuencia al 40%;
// f2 frecuencia final; d duración; type onda; v volumen; vib/vibA velocidad y amplitud del vibrato; lp filtro paso bajo (Hz);
// bp filtro de banda; q anchura del filtro; delay retraso; att tiempo de subida del volumen.
export function syn(o: OpcionesSyn): void{
  if(!AC)return; const t=AC.currentTime+(o.delay||0),d=o.d||.4,os=AC.createOscillator(),g=AC.createGain();
  os.type=o.type||'sawtooth'; os.frequency.setValueAtTime(o.f,t); if(o.fm)os.frequency.linearRampToValueAtTime(o.fm,t+d*.4); if(o.f2)os.frequency.linearRampToValueAtTime(o.f2,t+d);
  let last: AudioNode=os;
  if(o.vib){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=o.vib;lg.gain.value=o.vibA||10;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+d+.05)}
  if(o.lp){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;f.Q.value=o.q||1;last.connect(f);last=f}
  if(o.bp){const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=o.bp;f.Q.value=o.q||2;last.connect(f);last=f}
  const v=o.v||.4,a=o.att||.03; g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+Math.max(a,d-.12));g.gain.linearRampToValueAtTime(0,t+d);
  last.connect(g);g.connect(FX as GainNode);os.start(t);os.stop(t+d+.05);
}
// SFX: efectos cortos de la interfaz. Uso: SFX.good(). tap toque; hov ratón encima; pop; good acierto; bad fallo; whoosh;
// tada premio; sparkle brillo; munch comer; boing; drip gota; dig cavar; snap encajar; grow crecer; splash agua;
// count(n) nota que sube con cada número al contar.
export const SFX={
  tap:()=>tone(660,.08,'triangle',.25),
  hov:()=>tone(1100,.05,'sine',.06,1.3),
  pop:()=>{tone(900,.09,'sine',.5,.4);noise(.06,.2,3000)},
  good:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.22,'triangle',.35,0,i*.08)),
  bad:()=>{tone(300,.25,'sine',.3,.6);tone(240,.3,'triangle',.18,.7,.08)},
  whoosh:()=>noise(.5,.25,900),
  tada:()=>[523,659,784,1046,1318].forEach((f,i)=>{tone(f,.4,'triangle',.3,0,i*.1);tone(f*2,.3,'sine',.1,0,i*.1+.05)}),
  sparkle:()=>{for(let i=0;i<6;i++)tone(1200+i*220,.12,'sine',.15,0,i*.05)},
  munch:()=>{for(let i=0;i<4;i++)noise(.07,.35,500+i*150,i*.12)},
  boing:()=>tone(220,.35,'sine',.4,2.2),
  drip:()=>{tone(1400,.08,'sine',.25,.5);tone(900,.1,'sine',.15,.6,.08)},
  dig:()=>noise(.12,.25,500+Math.random()*400,0,.7),
  snap:()=>{tone(500,.06,'square',.12,1.5);tone(800,.08,'triangle',.25,0,.05)},
  grow:()=>[392,494,587,784].forEach((f,i)=>tone(f,.18,'sine',.2,1.02,i*.07)),
  splash:()=>{noise(.3,.3,1500,0,.5);tone(700,.15,'sine',.15,.5)},
  count:(n: number)=>tone(440*Math.pow(2,(n*2)/12),.18,'triangle',.3)
};
// SOUNDS: sonido de cada animal o vehículo, con la misma clave que su dibujo; suena con playSound(clave). contenido/lex.ts añade más.
// Para uno nuevo: añade clave:()=>{syn({...})} aquí o en contenido/lex.ts, y su onomatopeya en ONO.
export const SOUNDS: Record<string,()=>void>={
  vaca:()=>{syn({f:150,fm:165,f2:118,d:1.1,lp:520,v:.55,vib:4,vibA:3,att:.12})},
  oveja:()=>{syn({f:420,f2:380,d:.8,lp:1700,vib:11,vibA:30,v:.4,att:.06})},
  cerdo:()=>{for(let i=0;i<3;i++){syn({f:95,f2:80,d:.16,lp:420,v:.6,delay:i*.2,type:'sawtooth'});noise(.15,.25,350,i*.2,2)}},
  gallina:()=>{[0,.16,.32].forEach(dl=>syn({f:620,f2:480,d:.11,type:'square',bp:900,q:3,v:.3,delay:dl}));syn({f:760,fm:1100,f2:700,d:.35,type:'square',bp:1000,q:3,v:.3,delay:.5})},
  caballo:()=>{syn({f:950,f2:420,d:1.1,vib:13,vibA:90,lp:2600,v:.3,att:.05})},
  pato:()=>{[0,.25].forEach(dl=>syn({f:330,f2:290,d:.18,type:'sawtooth',bp:1100,q:4,v:.5,delay:dl}))},
  perro:()=>{[0,.3].forEach(dl=>{noise(.12,.5,600,dl,1.5);syn({f:260,f2:150,d:.14,type:'sawtooth',lp:900,v:.4,delay:dl})})},
  gato:()=>{syn({f:520,fm:820,f2:470,d:.75,type:'triangle',vib:6,vibA:12,v:.35,att:.08})},
  pollito:()=>{[0,.18,.36].forEach(dl=>syn({f:2300,f2:2900,d:.1,type:'sine',v:.25,delay:dl}))},
  pajaro:()=>{[0,.12,.24,.5,.62].forEach((dl,i)=>syn({f:2600+i*120,f2:3400,d:.08,type:'sine',v:.2,delay:dl}))},
  abeja:()=>{syn({f:220,f2:240,d:1,type:'sawtooth',vib:30,vibA:8,lp:900,v:.25})},
  auto:()=>{[0,.26].forEach(dl=>{syn({f:440,d:.18,type:'square',lp:1800,v:.22,delay:dl});syn({f:554,d:.18,type:'square',lp:1800,v:.18,delay:dl})})},
  autobus:()=>{syn({f:220,d:.6,type:'square',lp:900,v:.25});syn({f:277,d:.6,type:'square',lp:900,v:.2})},
  tren:()=>{[0,.22,.44,.66].forEach(dl=>noise(.16,.35,1600,dl,.8));syn({f:880,d:.7,type:'triangle',v:.2,delay:.95});syn({f:1100,d:.7,type:'triangle',v:.16,delay:.95})},
// avion: ruido largo cuyo filtro sube de 300 a 2400 Hz (como un avión que se acerca y pasa).
  avion:()=>{if(!AC)return;const t=AC.currentTime,n=AC.sampleRate*1.6,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(2400,t+1.5);const g=AC.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.4,t+.8);g.gain.linearRampToValueAtTime(0,t+1.6);s.connect(f);f.connect(g);g.connect(FX as GainNode);s.start(t)},
  barco:()=>{syn({f:98,d:1.2,type:'sawtooth',lp:500,v:.45,att:.1});syn({f:147,d:1.2,type:'sawtooth',lp:500,v:.25,att:.1})},
  bici:()=>{[0,.3].forEach(dl=>{tone(2100,.6,'sine',.25,0,dl);tone(2620,.5,'sine',.12,0,dl)})},
  moto:()=>{syn({f:70,fm:150,f2:110,d:1.1,type:'sawtooth',lp:700,vib:28,vibA:12,v:.4})},
  rana:()=>{[0,.3].forEach(dl=>syn({f:180,f2:140,d:.2,type:'square',bp:600,q:3,v:.35,delay:dl}))},
  leon:()=>{syn({f:110,fm:160,f2:70,d:1.1,type:'sawtooth',lp:600,vib:20,vibA:15,v:.5,att:.1});noise(1,.2,400,0,.6)},
  elefante:()=>{syn({f:600,fm:900,f2:500,d:.9,type:'sawtooth',lp:2000,vib:8,vibA:30,v:.3})},
  mono:()=>{[0,.15,.3,.45].forEach((dl,i)=>syn({f:500+i*80,f2:900,d:.12,type:'square',bp:1200,q:2,v:.2,delay:dl}))}
};
// onomatopeyas que dice la voz
// ONO: {clave: onomatopeya} que dice la voz después del sonido (tienen MP3 grabado: no cambies el texto).
export const ONO: Record<string,string>={vaca:'¡Muuu!',oveja:'¡Beee!',cerdo:'¡Oinc, oinc!',gallina:'¡Clo, clo, clo!',caballo:'¡Iiiiii!',pato:'¡Cuac, cuac!',perro:'¡Guau, guau!',gato:'¡Miau!',pollito:'¡Pío, pío!',pajaro:'¡Pío, pío, pío!',
 abeja:'¡Bzzz!',auto:'¡Bip, bip!',autobus:'¡Mooc, mooc!',tren:'¡Chu, chu!',avion:'¡Fiuuum!',barco:'¡Buuuu!',bici:'¡Rin, rin!',moto:'¡Brum, brum!',rana:'¡Croac!',leon:'¡Grrr!',elefante:'¡Prrrr!',mono:'¡U, u, a, a!'};
// playSound(clave): hace el sonido SOUNDS[clave] si existe (los errores de audio se ignoran).
export function playSound(k: string): void{const f=SOUNDS[k];if(f)try{f()}catch(e){}}

/* música suave generativa */
// MUSIC: música de fondo; cada escena elige una con su campo music. s = escala (semitonos sobre la nota base),
// b = nota base (número MIDI: 60 es el do central), sp = segundos entre notas.
export const MUSIC: Record<string,Musica>={
  title:{s:[0,2,4,7,9],b:64,sp:.5},map:{s:[0,2,4,7,9],b:60,sp:.5},plaza:{s:[0,4,5,7,9],b:62,sp:.46},jardin:{s:[0,2,4,7,9],b:65,sp:.44},
  casita:{s:[0,2,4,5,7,9],b:62,sp:.48},game:{s:[0,2,4,5,7,9],b:60,sp:.48},book:{s:[0,3,5,7,10],b:57,sp:.6}
};
// musKey: música que suena (null = ninguna); musNext: momento (en el reloj de audio) de la siguiente nota; musStep: número de nota.
export let musKey: string|null=null;let musNext=0,musStep=0;
// ponMusica(k): pone la música k de MUSIC (null = ninguna). La llama go() (escenas.ts) con la de cada escena.
export function ponMusica(k: string|null): void{musKey=k}
// musicTick(): se llama en cada cuadro desde frame(). Programa con 0,3 s de antelación las notas que tocan (así el ritmo no
// depende de los cuadros por segundo): una melodía de 16 pasos que recorre la escala y, cada 8 pasos, una nota grave larga.
// Algunas notas se saltan al azar para que no suene siempre igual.
export function musicTick(): void{
  if(!AC||!musKey||S.vol.mus<=0)return; const m=MUSIC[musKey]; if(!m)return;
  while(musNext<AC.currentTime+.3){
    if(musNext<AC.currentTime)musNext=AC.currentTime+.05;
    const d=musNext-AC.currentTime, st=musStep%16;
// nota de la escala para este paso: cada 16 pasos cambia el punto de partida y en el paso 4 de cada 8 sube una octava.
    const deg=(m.s[(st*3+((musStep/16|0)%4)*2)%m.s.length] as number)+(st%8===4?12:0);
    if(st%2===0||Math.random()<.35) tone(440*Math.pow(2,(m.b+deg-69)/12),m.sp*1.6,'triangle',.25,0,d,MUS);
    if(st%8===0) tone(440*Math.pow(2,(m.b-12+(m.s[(musStep/8|0)%3] as number)-69)/12),m.sp*6,'sine',.3,0,d,MUS);
    musNext+=m.sp; musStep++;
  }
}
