/*
 * icons.js: herramienta aparte, NO forma parte del juego (no está en ARCHIVOS de herramientas/vite/curiolandia.mts). Es un script de Node que genera
 * los iconos de la web (icon-192.png, icon-512.png, icon-maskable-512.png y apple-touch-icon.png) en public/,
 * dibujando a Tito (TITO_SVG de src/dibujos/pics-new.ts) sobre fondo amarillo con un navegador Chromium sin ventana
 * (Playwright). Uso, desde la raíz del repo: node src/icons.js. Hace falta solo si cambia el dibujo de Tito.
 */
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
// pics: el módulo de Tito y lo que importa, juntos con rolldown (el de Vite) en un script que deja sus exportaciones en
// la variable global D. Así la página tiene D.TITO_SVG.
const {build}=await import('rolldown');
const pics=(await build({input:__dirname+'/dibujos/pics-new.ts',write:false,output:{format:'iife',name:'D'}})).output[0].code;
// Página auxiliar con un lienzo y la función mk(tamaño, margen, fondo), que pinta el fondo, dibuja a Tito centrado
// (dejando el margen pad a cada lado) y devuelve la imagen PNG como data URL. (Va dentro de una plantilla de texto,
// por eso no lleva comentarios dentro.) El fillStyle del final no se usa.
await p.setContent(`<canvas id=c></canvas><script>${pics}
function mk(sz,pad,bg){const c=document.getElementById('c');c.width=c.height=sz;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,sz,sz);
 return new Promise(r=>{const i=new Image();i.onload=()=>{const w=sz*(1-pad*2),h=w*200/240;x.drawImage(i,(sz-w)/2,(sz-h)/2+sz*.03,w,h);
  x.fillStyle='#4A3428';r(c.toDataURL('image/png'))};
 i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" width="960" height="800">'+D.TITO_SVG+'</svg>')})}
</script>`);
// Cada icono: [nombre, tamaño en px, margen (el maskable lleva más porque Android lo recorta en círculo), color de fondo].
for(const [n,sz,pad,bg] of [['icon-192',192,.08,'#FFE08A'],['icon-512',512,.08,'#FFE08A'],['icon-maskable-512',512,.2,'#FFE08A'],['apple-touch-icon',180,.1,'#FFE08A']]){
 const d=await p.evaluate(([a,b,c])=>mk(a,b,c),[sz,pad,bg]);fs.writeFileSync(__dirname+'/../public/'+n+'.png',Buffer.from(d.split(',')[1],'base64'))}
await b.close();console.log('icons ok')})();
