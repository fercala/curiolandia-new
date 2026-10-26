/*
 * aplicacion/dialogos.ts: los diálogos del nombre (openNameDlg) y de empezar de nuevo (openResetDlg, doReset), con sus
 * botones (#nameDlg y #resetDlg de head.html). Fase 4p de docs/PLAN-MIGRACION.md: hasta entonces estaban en
 * aplicacion/adultos.ts, que se carga después de las escenas, y la portada y «¿quién juega?» (escenas/escenas2d.ts) los
 * usaban como globales tardías (src/tardias.d.ts). Ahora solo dependen del núcleo, así que se cargan antes que las
 * escenas y se importan. La zona de adultos (aplicacion/adultos.ts) usa doReset para «Borrar todo el progreso».
 * Al cargarse, conecta los botones de los dos diálogos.
 * Exporta: openNameDlg, openResetDlg y doReset. Importa: del núcleo, src/nucleo/, S, DEF, VIVO, save, go y ponS.
 */
import { DEF, S, VIVO, go, ponS, save } from '../nucleo/indice.ts';

// nameAfter: qué hacer cuando se cierra el diálogo del nombre (recibe el nombre escrito, o '' si se canceló).
let nameAfter: ((nombre: string)=>void)|null=null;
// openNameDlg(after): abre el diálogo #nameDlg (head.html) para escribir el nombre; after(nombre) se llama al cerrarlo.
export function openNameDlg(after?: (nombre: string)=>void){nameAfter=after||null;const d=document.getElementById('nameDlg')!,i=(document.getElementById('nm-in') as HTMLInputElement);d.hidden=false;i.value=S.name||'';setTimeout(()=>i.focus(),50)}
// "Listo": guarda el nombre (si no está vacío), marca que ya se preguntó (S.first.askedName) y sigue con nameAfter.
document.getElementById('nm-ok')!.onclick=()=>{const v=(document.getElementById('nm-in') as HTMLInputElement).value.trim().slice(0,20);document.getElementById('nameDlg')!.hidden=true;S.first.askedName=1;if(v)S.name=v;save();const a=nameAfter;nameAfter=null;if(a)a(v)};
// "Cancelar": cierra sin nombre, pero también marca que ya se preguntó para no volver a preguntar.
document.getElementById('nm-x')!.onclick=()=>{document.getElementById('nameDlg')!.hidden=true;if(nameAfter){S.first.askedName=1;save();const a=nameAfter;nameAfter=null;a('')}};
// Intro en el campo del nombre = pulsar "Listo".
(document.getElementById('nm-in') as HTMLInputElement).onkeydown=e=>{if(e.key==='Enter')document.getElementById('nm-ok')!.click()};
// openResetDlg(): abre el diálogo #resetDlg para empezar de nuevo.
export function openResetDlg(){document.getElementById('resetDlg')!.hidden=false}
// doReset(): borra el progreso: S vuelve a DEF, conservando solo los ajustes de keep (idioma, voz, hemisferio, volumen,
// límite, vales y cumpleaños), guarda y vuelve a la portada. Ver la nota de posibles fallos en doc/notes/core.md.
export function doReset(){const keep={variant:S.variant,voz:S.voz,vozNav:S.vozNav,hemi:S.hemi,vol:S.vol,limit:S.limit,vales:S.vales,bday:S.bday};ponS(Object.assign(JSON.parse(JSON.stringify(DEF)),keep));VIVO.ADAPT=0;save();go('title')}
// Botones del diálogo de empezar de nuevo.
document.getElementById('rs-yes')!.onclick=()=>{document.getElementById('resetDlg')!.hidden=true;doReset()};
document.getElementById('rs-no')!.onclick=()=>{document.getElementById('resetDlg')!.hidden=true};
