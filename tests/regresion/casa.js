// Comprueba las habitaciones de la casa de Tito y los premios nuevos de la tienda (v1.590): que las habitaciones se abran
// con las casitas terminadas, que Tito anuncie la nueva y vaya a ella, que una partida antigua (cosas sin habitación) siga
// teniéndolo todo en el salón, que lo comprado vaya a su habitación, que se pueda llevar una cosa a otra habitación
// arrastrándola hasta su botón, que la tienda no deje comprar lo de una habitación cerrada y que pase de página.
// Desde la fase C2 de docs/PLAN-CASA.md, también que Tito ande hasta lo que se toca y juegue con ello (C8), que ande
// al tocar el suelo (C9) y que las reacciones se dibujen sin errores (C10); desde la C3, el cielo de noche del
// telescopio (C11) y la vuelta al mundo del globo terráqueo (C12); desde la C4, los instrumentos (C13), la pizarra
// (C14) y la tele (C15); desde la C5, la merienda y la sopa (C16), el baño (C17), buenas noches (C18) y el huerto
// (C19); desde la C6, cuidar a las mascotas: ir a su escena y ponerles nombre (C20), crecer con los días cuidados
// (C21) y nacer bebé al comprarla (C22); desde la C7, las combinaciones (C23), el álbum «Sorpresas de la casa» (C24) y
// las mascotas mayores en el mapa y en la zona de adultos (C25); desde la fase M0 de docs/PLAN-CASA-MEJORA.md, la casa
// en 3D de prueba (C26); desde la M2, la casa ordenada: al entrar cada cosa va a un sitio y lo que no cabe al baúl
// (C27), lo comprado va al baúl y se coloca con un toque (C28), arrastrar del baúl a un sitio, al baúl y llevar un
// mueble con algo encima (C29) y «¡Ordena, Tito!» (C30); desde la M3, los toques directos y los estados guardados, y
// que Tito solo va a jugar si se le toca antes (C31) y el botón de la escena tras dos toques (C32); desde la M3b, las
// formas de jugar de Tito (C33), arrastrar a Tito (C34), la pista de pareja, la sorpresa al dejar algo encima de su
// mueble y los 3 dibujos del cuadro (C35); desde la M6, «Un día con Tito»: la rutina de la hora con su bocadillo y su
// pegatina, una vez al día (C36), y la noche por la ventana y el reloj que dice la hora (C37). Desde la fase P14 de
// docs/IDEAS-MEJORA.md, los tesoros escondidos del mapa y la vitrina de la casa (C38), y desde la P15, la cámara de
// fotos en el mapa, una zona y la granja, y el álbum de fotos de la casa (C39), y desde la P16, la gran aventura de Tito:
// el botón del mapa, un capítulo entero, su trozo del mapa y el siguiente para mañana (C40), y desde la P16b, el último
// capítulo y el gran tesoro (C41). Desde la M3, C8 toca a Tito antes que al objeto, y desde la M3b, C11, C13 y
// C20 abren la escena con su botón. Desde la M2, lo comprado en la tienda va al baúl (C6).
// C42 comprueba una compra nueva y que «Guardar todo» recoge varias habitaciones tras confirmar.
// C43 compra el semáforo y comprueba los estados de las compras interactivas.
// Uso: node tests/regresion/casa.js <carpeta web>
const L = require('./lib');
const [raiz] = process.argv.slice(2);
const R = L.registro('casa');
// temas(n): S.temas con n casitas terminadas
const temas = (n) => {
  const o = {};
  for (let i = 1; i <= n; i++) o['3A-T' + i] = { done: 1, g: {} };
  return o;
};

(async () => {
  const srv = L.servir(raiz),
    b = await L.navegador();
  const nuevo = async (o = {}) => {
    const p = await L.abrir(b, srv.port, Object.assign({ hora: 11, fecha: '2026-10-21' }, o));
    await p.evaluate(() => {
      const S = __cl.S;
      S.variant = 'es';
      S.intro = true;
      S.age = 3;
      S.first.askedName = 1;
      window.__fast = 1;
      save();
    });
    return p;
  };
  const caso = async (id, titulo, fn, o) => {
    let p;
    try {
      p = await nuevo(o);
      const prob = await fn(p);
      if (prob) {
        R.apuntar(id, 'alta', titulo, { problema: prob, errores: p.errs.slice(0, 3) });
        await R.captura(p, id + '.png');
      } else if (p.errs.length) R.apuntar(id, 'alta', titulo + ' (errores de JavaScript)', p.errs.slice(0, 3));
      else R.bien(id, titulo);
    } catch (e) {
      R.apuntar(id, 'alta', titulo + ' (la prueba no pudo terminar)', String(e).split('\n')[0]);
    } finally {
      p && (await p.context().close());
    }
  };

  await caso('C1', 'Las habitaciones se abren con las casitas (1, 3, 5, 8, 11, 14)', async (p) => {
    const v = await p.evaluate(() => {
      const t = (n) => {
        const o = {};
        for (let i = 1; i <= n; i++) o['3A-T' + i] = { done: 1, g: {} };
        return o;
      };
      return [0, 1, 2, 3, 5, 8, 11, 14].map((n) => {
        __cl.S.temas = t(n);
        return roomsOpen().length;
      });
    });
    if (v.join() !== '1,2,2,3,4,5,6,7') return 'habitaciones abiertas: ' + v.join();
  });
  await caso('C2', 'Al abrirse una habitación, Tito la anuncia y la casa va a ella', async (p) => {
    await p.evaluate(
      (t) => {
        __cl.S.temas = JSON.parse(t);
        __cl.S.rooms = 1;
        window.__said = [];
        SCENES.casaTito.room = 'salon';
        __cl.go('casaTito', {});
      },
      JSON.stringify(temas(3)),
    );
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => [SCENES.casaTito.room, __cl.S.rooms, (window.__said || []).join(' | ')]);
    if (r[0] !== 'cocina' || r[1] !== 3) return 'habitación ' + r[0] + ', S.rooms ' + r[1];
    if (!/habitación nueva: la cocina/.test(r[2])) return 'Tito dice: ' + r[2];
    await p.evaluate(() => __cl.go('map', {}));
    await p.evaluate(() => {
      window.__said = [];
      __cl.go('casaTito', {});
    });
    await p.waitForTimeout(1200);
    if (/habitación nueva/.test(await p.evaluate(() => window.__said.join(' '))))
      return 'lo vuelve a anunciar en la visita siguiente';
  });
  await caso('C3', 'Una partida antigua (cosas sin habitación) sigue con todo en el salón', async (p) => {
    await p.evaluate(() => {
      const S = __cl.S;
      S.owned.piano = 1;
      S.owned.robot = 1;
      S.home = { piano: { x: 930, y: 720 }, robot: { x: 1180, y: 740 } };
      S.temas = {};
      for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
      save();
    });
    await p.reload();
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => [
      homeRoom('piano'),
      homeRoom('robot'),
      homeItems('salon').length,
      homeItems('juegos').length,
    ]);
    if (r.join() !== 'salon,salon,2,0') return 'habitaciones: ' + r.join();
  });
  await caso('C4', 'Lo comprado va a su habitación; un juguete, al cuarto de juegos si está abierto', async (p) => {
    const r = await p.evaluate(() => {
      const S = __cl.S;
      S.home = {};
      S.temas = {};
      for (let i = 1; i <= 8; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
      ['cama', 'nevera', 'robot', 'gato'].forEach((id) => {
        S.owned[id] = 1;
        placeHome(id);
      });
      return ['cama', 'nevera', 'robot', 'gato'].map(homeRoom).join();
    });
    if (r !== 'dormitorio,cocina,juegos,salon') return 'habitaciones: ' + r;
  });
  await caso('C5', 'Arrastrar una cosa hasta el botón de otra habitación la lleva allí', async (p) => {
    await p.evaluate(() => {
      const S = __cl.S;
      S.home = {};
      S.temas = {};
      for (let i = 1; i <= 3; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
      S.rooms = 3;
      S.owned.piano = 1;
      placeHome('piano');
      SCENES.casaTito.room = 'salon';
      __cl.go('casaTito', {});
    });
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      const sc = __cl.scene,
        o = S.home.piano,
        bt = roomBtns().find((b) => b.R.id === 'cocina'),
        bl = roomBtns().find((b) => b.R.id === 'bano');
      sc.down(o.x, o.y - 60);
      sc.move(o.x + 40, o.y - 100);
      sc.move(bt.x, bt.y);
      sc.up(bt.x, bt.y);
      const a = homeRoom('piano');
      // a una habitación cerrada no se puede: vuelve a su sitio
      sc.room = 'cocina';
      const q = S.home.piano,
        x0 = q.x,
        y0 = q.y;
      sc.down(q.x, q.y - 60);
      sc.move(q.x + 40, q.y - 100);
      sc.move(bl.x, bl.y);
      sc.up(bl.x, bl.y);
      return [a, homeRoom('piano'), S.home.piano.x === x0 && S.home.piano.y === y0];
    });
    if (r[0] !== 'cocina') return 'tras soltarlo en la cocina está en ' + r[0];
    if (r[1] !== 'cocina' || !r[2]) return 'soltarlo en una habitación cerrada lo mueve: ' + JSON.stringify(r);
  });
  await caso('C6', 'La tienda no deja comprar lo de una habitación cerrada y tiene páginas', async (p) => {
    await p.evaluate(() => {
      const S = __cl.S;
      S.coins = 500;
      S.temas = {};
      window.__said = [];
      __cl.go('tienda', {});
      const sc = __cl.scene;
      sc.cat = 'casa';
      sc.page = 0;
    });
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      const sc = __cl.scene,
        n = sc.pages();
      sc.down(1550, 570);
      const pg = sc.page;
      const g = sc.grid().find((g) => g.it.id === 'cama');
      sc.down(g.x, g.y);
      return [n, pg, !!sc.conf, window.__said.slice(-1)[0] || ''];
    });
    if (r[0] < 3) return 'la pestaña de la casa tiene ' + r[0] + ' páginas';
    if (r[1] !== 1) return 'la flecha no pasa de página';
    if (r[2] || !/es para el dormitorio/.test(r[3])) return 'la cama se puede comprar sin el dormitorio: ' + r[3];
    const q = await p.evaluate(() => {
      const S = __cl.S,
        sc = __cl.scene;
      S.temas = { '3A-T1': { done: 1, g: {} } };
      const g = sc.grid().find((g) => g.it.id === 'cama');
      sc.down(g.x, g.y);
      sc.confT = -9;
      sc.down(680, 690);
      return [S.owned.cama, homeRoom('cama')];
    });
    // desde la fase M2 de PLAN-CASA-MEJORA.md, lo comprado va al baúl (el niño elige dónde ponerlo)
    if (q.join() !== '1,baul') return 'con el dormitorio abierto, la cama: ' + q.join();
  });
  await caso('C7', 'Cada habitación se dibuja sin errores con todo comprado', async (p) => {
    await p.evaluate(() => {
      const S = __cl.S;
      S.temas = {};
      for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
      S.rooms = 7;
      for (const it of SHOP)
        if (!it.slot) {
          S.owned[it.id] = 1;
          placeHome(it.id);
        }
      __cl.go('casaTito', {});
    });
    await p.waitForTimeout(500);
    for (const r of ['salon', 'dormitorio', 'cocina', 'bano', 'juegos', 'jardin', 'torre']) {
      await p.evaluate((r) => {
        __cl.scene.room = r;
      }, r);
      await p.waitForTimeout(250);
    }
    const fuera = await p.evaluate(() =>
      homeItems()
        .filter((o) => o.x + o.s * 0.5 > 1610 || o.x - o.s * 0.5 < 0)
        .map((o) => o.id),
    );
    if (fuera.length) return 'se salen de la pantalla: ' + fuera.join();
  });

  await caso('C8', 'Al tocar el telescopio, Tito anda hasta él, juega y dice su frase', async (p) => {
    await p.evaluate(() => {
      const S = __cl.S;
      S.home = {};
      S.temas = {};
      for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
      S.rooms = 7;
      S.owned.telescopio = 1;
      placeHome('telescopio');
      SCENES.casaTito.room = 'torre';
      __cl.go('casaTito', {});
    });
    await p.waitForTimeout(1500);
    const r0 = await p.evaluate(() => {
      window.__said = [];
      const sc = __cl.scene,
        o = S.home.telescopio;
      // desde la fase M3 de PLAN-CASA-MEJORA.md, para que Tito vaya a jugar se le toca antes
      sc.tocaTito();
      sc.down(o.x, o.y - 60);
      sc.up(o.x, o.y - 60);
      return [!!sc.acc, sc.paseo.dur > 0];
    });
    if (r0[0] || !r0[1]) return 'al tocarlo, Tito no echa a andar o ya está jugando: ' + JSON.stringify(r0);
    await p.waitForTimeout(3000);
    const r = await p.evaluate(() => {
      const sc = __cl.scene;
      return [sc.acc && sc.acc.id, sc.acc && sc.acc.accion, (window.__said || []).join(' | ')];
    });
    if (r[0] !== 'telescopio' || r[1] !== 'mirar') return 'acción: ' + JSON.stringify(r);
    if (!/estrellas se ven por mi telescopio/.test(r[2])) return 'Tito dice: ' + r[2];
  });
  await caso('C9', 'Al tocar el suelo, Tito anda hasta allí', async (p) => {
    await p.evaluate(() => {
      SCENES.casaTito.room = 'salon';
      __cl.go('casaTito', {});
    });
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => {
      const sc = __cl.scene;
      sc.down(1200, 720);
      return [sc.paseo.x1, sc.paseo.y1];
    });
    if (r[0] !== 1200 || r[1] !== 720) return 'Tito va a ' + r.join();
  });
  await caso('C10', 'Las reacciones de los objetos se dibujan sin errores', async (p) => {
    await p.evaluate(() => {
      const S = __cl.S;
      S.temas = {};
      for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
      S.rooms = 7;
      __cl.go('casaTito', {});
    });
    await p.waitForTimeout(800);
    const ids = await p.evaluate(() => SHOP.filter((it) => !it.slot && it.cat !== 'vales').map((it) => it.id));
    for (const id of ids) {
      await p.evaluate((id) => {
        const sc = __cl.scene;
        S.home = {};
        S.owned[id] = 1;
        placeHome(id);
        const o = S.home[id];
        sc.room = homeRoom(id);
        sc.irA(id);
        sc.paseoTok++;
        sc.acc = { id, accion: sc.va.accion, t0: T, x: o.x, y: o.y, s: 160 };
      }, id);
      await p.waitForTimeout(300);
    }
    if (p.errs.length) return 'errores: ' + p.errs.slice(0, 3).join(' | ');
  });

  await caso(
    'C11',
    'El telescopio abre el cielo de noche: las constelaciones se encuentran y la casa vuelve a la torre',
    async (p) => {
      await p.evaluate(() => {
        const S = __cl.S;
        S.home = {};
        S.temas = {};
        for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
        S.rooms = 7;
        S.owned.telescopio = 1;
        S.owned.saturno = 1;
        placeHome('telescopio');
        placeHome('saturno');
        SCENES.casaTito.room = 'torre';
        __cl.go('casaTito', {});
      });
      await p.waitForTimeout(1500);
      await p.evaluate(() => {
        const sc = __cl.scene,
          o = S.home.telescopio;
        // desde la fase M3b de PLAN-CASA-MEJORA.md, la escena se abre con su botón (dos toques seguidos)
        sc.down(o.x, o.y - 60);
        sc.up(o.x, o.y - 60);
        sc.down(o.x, o.y - 60);
        sc.up(o.x, o.y - 60);
        const e = sc.botonEscena();
        sc.down(e.x, e.y);
      });
      await p.waitForTimeout(6500);
      if ((await p.evaluate(() => sceneName)) !== 'casaCielo')
        return 'tras jugar con el telescopio la escena es ' + (await p.evaluate(() => sceneName));
      if (!(await p.evaluate(() => S.sorpresas && S.sorpresas.telescopio)))
        return 'no apunta la sorpresa del telescopio';
      const r = await p.evaluate(() => {
        window.__said = [];
        const sc = __cl.scene;
        sc.fug = null;
        sc.prox = T + 100;
        sc.est.filter((e) => e.grupo === 0).forEach((e) => sc.down(e.x, e.y));
        return [sc.hechas.join(), (window.__said || []).join(' | ')];
      });
      if (r[0] !== '0' || !/Osa Mayor/.test(r[1])) return 'la Osa Mayor: ' + JSON.stringify(r);
      await p.waitForTimeout(800);
      await p.evaluate(() => {
        __cl.scene.prox = 0;
      });
      await p.waitForTimeout(400);
      const q = await p.evaluate(() => {
        const sc = __cl.scene;
        if (!sc.fug) return -1;
        const u = (T - sc.fug.t0) / 1.6;
        sc.down(sc.fug.x0 + u * 560, sc.fug.y0 + u * 260);
        return sc.fugaces;
      });
      if (q !== 1) return 'la estrella fugaz no se cuenta: ' + q;
      await p.evaluate(() => __cl.scene.down(80, 80));
      await p.waitForTimeout(600);
      const v = await p.evaluate(() => [sceneName, __cl.scene.room]);
      if (v.join() !== 'casaTito,torre') return 'la casa lleva a ' + v.join();
    },
  );
  await caso(
    'C12',
    'El globo abre la vuelta al mundo: la Tierra gira, enseña sitios y pregunta dónde está España',
    async (p) => {
      await p.evaluate(() => {
        window.__said = [];
        __cl.go('casaMundo', {});
      });
      await p.waitForTimeout(1200);
      for (let i = 0; i < 3; i++) {
        await p.evaluate(() => {
          const sc = __cl.scene;
          sc.down(560, 480);
        });
        await p.waitForTimeout(4500);
      }
      const r = await p.evaluate(() => [
        __cl.scene.vistos,
        __cl.scene.reto && __cl.scene.reto.length,
        window.__said.join(' | '),
      ]);
      if (r[0] !== 3 || r[1] !== 3) return 'sitios vistos y reto: ' + JSON.stringify(r);
      if (!/España! Aquí vivimos/.test(r[2])) return 'Tito dice: ' + r[2];
      const ok = await p.evaluate(() => {
        const sc = __cl.scene,
          i = sc.reto.indexOf('espana'),
          j = (i + 1) % 3;
        sc.down([1000, 1205, 1410][j], 470);
        const sigue = !!sc.reto;
        sc.down([1000, 1205, 1410][i], 470);
        return [sigue, sc.retoHecho];
      });
      if (ok.join() !== 'true,true') return 'el reto: ' + ok.join();
      if (p.errs.length) return 'errores: ' + p.errs.slice(0, 3).join(' | ');
    },
  );

  await caso(
    'C13',
    'El xilófono abre los instrumentos: las teclas suenan y el reto de repetir la canción funciona',
    async (p) => {
      await p.evaluate(() => {
        const S = __cl.S;
        S.home = {};
        S.temas = {};
        for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
        S.rooms = 7;
        ['piano', 'xilofono', 'tambor'].forEach((id) => {
          S.owned[id] = 1;
          placeHome(id);
        });
        SCENES.casaTito.room = 'juegos';
        __cl.go('casaTito', {});
      });
      await p.waitForTimeout(1500);
      await p.evaluate(() => {
        const sc = __cl.scene,
          o = S.home.xilofono;
        // desde la fase M3b de PLAN-CASA-MEJORA.md, la escena se abre con su botón (dos toques seguidos)
        sc.down(o.x, o.y - 60);
        sc.up(o.x, o.y - 60);
        sc.down(o.x, o.y - 60);
        sc.up(o.x, o.y - 60);
        const e = sc.botonEscena();
        sc.down(e.x, e.y);
      });
      await p.waitForTimeout(6500);
      const r = await p.evaluate(() => [sceneName, __cl.scene.inst, __cl.scene.tiene && __cl.scene.tiene.join()]);
      if (r.join('|') !== 'casaMusica|xilofono|piano,xilofono,tambor') return 'escena: ' + r.join('|');
      await p.evaluate(() => {
        const sc = __cl.scene;
        sc.down(1430, 120);
      });
      await p.waitForTimeout(4000);
      const q = await p.evaluate(() => {
        const sc = __cl.scene,
          seq = sc.seq.slice(),
          T = INSTRUMENTOS.xilofono;
        if (sc.oye) return 'aún escucha';
        seq.forEach((i) => sc.down(T[i].x, T[i].y));
        return [sc.seq, sc.largo];
      });
      if (JSON.stringify(q) !== '[null,4]') return 'reto: ' + JSON.stringify(q);
      await p.evaluate(() => __cl.scene.down(575 + 300, 120));
      const t = await p.evaluate(() => __cl.scene.inst);
      if (t !== 'tambor') return 'el botón del tambor pone ' + t;
    },
  );
  await caso('C14', 'La pizarra pinta con el dedo, cambia de tiza y borra', async (p) => {
    await p.evaluate(() => __cl.go('casaPizarra', {}));
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      const sc = __cl.scene;
      sc.down(450, 800);
      sc.down(600, 300);
      sc.move(700, 350);
      sc.move(800, 400);
      sc.up(800, 400);
      const a = [sc.trazos.length, sc.trazos[0].p.length, sc.trazos[0].c];
      sc.down(1380, 800);
      return [...a, sc.trazos.length];
    });
    if (JSON.stringify(r) !== '[1,3,"#FFE08A",0]') return 'pizarra: ' + JSON.stringify(r);
  });
  await caso('C15', 'La tele cambia de canal con el mando y se dibuja sin errores', async (p) => {
    await p.evaluate(() => __cl.go('casaTele', {}));
    await p.waitForTimeout(800);
    for (let i = 1; i < 4; i++) {
      await p.evaluate((i) => __cl.scene.down(1390, 250 + i * 140), i);
      await p.waitForTimeout(400);
    }
    const c = await p.evaluate(() => __cl.scene.canal);
    if (c !== 3) return 'canal ' + c;
    await p.evaluate(() => __cl.scene.down(80, 80));
    await p.waitForTimeout(500);
    if ((await p.evaluate(() => sceneName)) !== 'casaTito') return 'la casa no vuelve a la casa de Tito';
    if (p.errs.length) return 'errores: ' + p.errs.slice(0, 3).join(' | ');
  });

  await caso(
    'C16',
    'La merienda da a Tito la fruta que pide y la sopa se hace con tres verduras y removiendo',
    async (p) => {
      await p.evaluate(() => __cl.go('casaMerienda', {}));
      await p.waitForTimeout(800);
      const m = await p.evaluate(() => {
        const sc = __cl.scene,
          P = sc.pide,
          i = COCINA.frutas.indexOf(P.f),
          j = (i + 1) % 5,
          X = (k) => COCINA.balda.x0 + k * COCINA.balda.dx;
        sc.down(X(j), COCINA.balda.y);
        const malo = sc.plato.length;
        for (let k = 0; k < P.n; k++) sc.down(X(i), COCINA.balda.y);
        return [malo, sc.pide];
      });
      if (JSON.stringify(m) !== '[0,null]') return 'merienda: ' + JSON.stringify(m);
      await p.evaluate(() => __cl.go('casaSopa', {}));
      await p.waitForTimeout(600);
      const s = await p.evaluate(() => {
        const sc = __cl.scene,
          C = COCINA.cesta,
          o = COCINA.olla;
        [0, 1, 2, 3].forEach((k) => sc.down(C.x0 + k * C.dx, C.y));
        const n = sc.dentro.length;
        sc.down(o.x + 150, o.y - 60);
        for (let a = 0; a <= 80; a++) sc.move(o.x + Math.cos(a / 4) * 150, o.y - 60 + Math.sin(a / 4) * 80);
        sc.up();
        return [n, sc.lista];
      });
      if (s.join() !== '3,true') return 'sopa: ' + s.join();
    },
  );
  await caso('C17', 'El baño: las burbujas explotan, el jabón hace espuma y la toalla seca a Tito', async (p) => {
    await p.evaluate(() => {
      __cl.S.owned.toalla = 1;
      __cl.go('casaBano', {});
    });
    await p.waitForTimeout(600);
    const r = await p.evaluate(() => {
      const sc = __cl.scene;
      sc.burbujas = [{ x: 500, y: 400, r: 40, t0: T }];
      sc.down(500, 400);
      const ex = sc.explotadas;
      sc.burbujas = [];
      sc.down(BANO.jabon.x, BANO.jabon.y);
      sc.down(760, 370);
      sc.down(800, 330);
      const es = sc.espuma.length;
      sc.down(BANO.toalla.x, BANO.toalla.y);
      return [ex, es, sc.espuma.length, sc.seco];
    });
    if (r.join() !== '1,2,0,true') return 'baño: ' + r.join();
  });
  await caso('C18', 'Buenas noches: la lámpara apaga la luz, Tito se duerme y la ventana trae la mañana', async (p) => {
    await p.evaluate(() => {
      window.__said = [];
      __cl.go('casaNoches', {});
    });
    await p.waitForTimeout(600);
    const r = await p.evaluate(() => {
      const sc = __cl.scene;
      sc.down(NOCHES.lampara.x, NOCHES.lampara.y - 40);
      const n = sc.noche;
      sc.down(NOCHES.ventana.x, NOCHES.ventana.y);
      return [n, sc.noche];
    });
    if (r.join() !== 'true,false') return 'noche y día: ' + r.join();
    if (!/Buenos días/.test(await p.evaluate(() => window.__said.join(' | ')))) return 'Tito no da los buenos días';
  });
  await caso('C19', 'El huerto se riega una vez al día, se guarda y la flor crece', async (p) => {
    await p.evaluate(() => {
      __cl.S.huerto = { dias: 2, dia: '2026-10-20' };
      __cl.go('casaHuerto', {});
    });
    await p.waitForTimeout(600);
    await p.evaluate(() => __cl.scene.down(HUERTO.regadera.x, HUERTO.regadera.y));
    await p.waitForTimeout(2300);
    await p.evaluate(() => __cl.scene.down(HUERTO.regadera.x, HUERTO.regadera.y));
    await p.waitForTimeout(300);
    const r = await p.evaluate(() => [
      __cl.S.huerto.dias,
      __cl.S.huerto.dia,
      JSON.parse(localStorage.getItem(KEY)).huerto.dias,
    ]);
    if (r.join() !== '3,2026-10-21,3') return 'huerto: ' + r.join();
  });

  await caso('C20', 'Al tocar una mascota, Tito va a su lado, se abre su escena y se le pone nombre', async (p) => {
    await p.evaluate(() => {
      const S = __cl.S;
      S.home = {};
      S.temas = {};
      for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
      S.rooms = 7;
      S.mascotas = { gato: { nombre: '', dias: 0, dia: '', hechos: [] } };
      S.owned.gato = 1;
      placeHome('gato');
      SCENES.casaTito.room = homeRoom('gato');
      __cl.go('casaTito', {});
    });
    await p.waitForTimeout(1500);
    await p.evaluate(() => {
      const sc = __cl.scene,
        o = S.home.gato;
      // desde la fase M3b de PLAN-CASA-MEJORA.md, la escena se abre con su botón (dos toques seguidos)
      sc.down(o.x, o.y - 40);
      sc.up(o.x, o.y - 40);
      sc.down(o.x, o.y - 40);
      sc.up(o.x, o.y - 40);
      const e = sc.botonEscena();
      sc.down(e.x, e.y);
    });
    await p.waitForTimeout(7000);
    const r = await p.evaluate(() => [sceneName, __cl.scene.id, (__cl.scene.elige || []).join()]);
    if (r.join('|') !== 'casaMascota|gato|Misi,Nube,Bigotes') return 'escena: ' + r.join('|');
    await p.evaluate(() => __cl.scene.down(1120, 470));
    await p.waitForTimeout(300);
    const n = await p.evaluate(() => [
      __cl.S.mascotas.gato.nombre,
      JSON.parse(localStorage.getItem(KEY)).mascotas.gato.nombre,
      !!__cl.scene.elige,
    ]);
    if (n.join() !== 'Bigotes,Bigotes,false') return 'nombre: ' + n.join();
  });
  await caso('C21', 'Dos cuidados distintos cuentan el día y la mascota crece con fiesta', async (p) => {
    await p.evaluate(() => {
      window.__said = [];
      __cl.S.mascotas = { conejo: { nombre: 'Nieve', dias: 2, dia: '2026-10-20', hechos: ['comer', 'agua'] } };
      __cl.go('casaMascota', { inst: 'conejo' });
    });
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      const sc = __cl.scene,
        a = etapaDe('conejo');
      sc.cuida('comer');
      sc.cuida('comer');
      const b = __cl.S.mascotas.conejo.dias;
      sc.cuida('jugar');
      return [a, b, __cl.S.mascotas.conejo.dias, etapaDe('conejo')];
    });
    if (r.join() !== '0,2,3,1') return 'etapas y días: ' + r.join();
    await p.waitForTimeout(1800);
    const f = await p.evaluate(() => [T - __cl.scene.fiesta < 3, window.__said.join(' | ')]);
    if (!f[0] || !/Nieve ha crecido/.test(f[1])) return 'fiesta: ' + JSON.stringify(f);
    if ((await p.evaluate(() => JSON.parse(localStorage.getItem(KEY)).mascotas.conejo.dias)) !== 3)
      return 'no se guarda';
  });
  await caso('C22', 'Una mascota comprada en la tienda nace bebé y sin nombre', async (p) => {
    const r = await p.evaluate(() => {
      const S = __cl.S;
      S.coins = 100;
      delete S.owned.hamster;
      S.mascotas = {};
      __cl.go('tienda', {});
      SCENES.tienda.buy(SHOP.find((i) => i.id === 'hamster'));
      return [S.owned.hamster, JSON.stringify(S.mascotas.hamster), etapaDe('hamster')];
    });
    if (r.join('|') !== '1|{"nombre":"","dias":0,"dia":"","hechos":[]}|0') return 'compra: ' + r.join('|');
  });

  await caso('C23', 'Soltar el sofá encima de la tele da su sorpresa, que se apunta para el álbum', async (p) => {
    await p.evaluate(() => {
      const S = __cl.S;
      S.home = {};
      S.temas = {};
      for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
      S.rooms = 7;
      S.sorpresas = {};
      ['sofa', 'tele'].forEach((i) => {
        S.owned[i] = 1;
        placeHome(i);
      });
      SCENES.casaTito.room = 'salon';
      __cl.go('casaTito', {});
    });
    await p.waitForTimeout(1200);
    const r = await p.evaluate(() => {
      window.__said = [];
      const sc = __cl.scene,
        a = S.home.sofa,
        t = S.home.tele;
      sc.down(a.x, a.y - 40);
      sc.move(t.x, t.y - 40);
      sc.move(t.x + 5, t.y - 40);
      sc.up(t.x + 5, t.y - 40);
      return [Object.keys(__cl.S.sorpresas).join(), JSON.parse(localStorage.getItem(KEY)).sorpresas['sofa+tele']];
    });
    if (r.join('|') !== 'sofa+tele|1') return 'sorpresas: ' + r.join('|');
    await p.waitForTimeout(300);
    if (!/tele desde el sofá.*Sorpresa nueva/.test(await p.evaluate(() => window.__said.join(' | '))))
      return 'Tito no dice la sorpresa';
  });
  await caso(
    'C24',
    'El botón del libro abre el álbum de sorpresas: lo descubierto se ve, pasa de página y Tito lo recuerda',
    async (p) => {
      await p.evaluate(() => {
        const S = __cl.S;
        S.sorpresas = { telescopio: 1, 'mesa+silla': 1 };
        __cl.go('casaTito', {});
      });
      await p.waitForTimeout(800);
      await p.evaluate(() => __cl.scene.down(ALBUM_CASA_BOTON.x, ALBUM_CASA_BOTON.y));
      await p.waitForTimeout(500);
      if ((await p.evaluate(() => sceneName)) !== 'sorpresasCasa') return 'el botón no abre el álbum';
      const r = await p.evaluate(() => {
        window.__said = [];
        const sc = __cl.scene,
          i = ENTRADAS_ALBUM.indexOf('telescopio');
        sc.down(230 + (i % 8) * 163, 230 + Math.floor(i / 8) * 160);
        const entrada = ENTRADAS_ALBUM.indexOf('mesa+silla');
        const pagina = Math.floor(entrada / POR_PAGINA);
        for (let n = 0; n < pagina; n++) sc.down(1490, 470);
        const j = entrada % POR_PAGINA;
        sc.down(230 + (j % 8) * 163, 230 + Math.floor(j / 8) * 160);
        return [sc.pag === pagina && pagina > 0, ENTRADAS_ALBUM.length, window.__said.join(' | ')];
      });
      // 73 objetos con reacción y 27 combinaciones.
      if (!r[0] || r[1] !== 100) return 'páginas: ' + JSON.stringify(r);
      if (!/telescopio.*Me siento a la mesa/.test(r[2])) return 'Tito dice: ' + r[2];
    },
  );
  await caso(
    'C25',
    'Las mascotas mayores salen junto a la casa del mapa y la zona de adultos enseña la casa de Tito',
    async (p) => {
      const r = await p.evaluate(() => {
        const S = __cl.S;
        S.owned.gato = 1;
        S.owned.conejo = 1;
        S.mascotas = {
          gato: { nombre: 'Nube', dias: 9, dia: '', hechos: [] },
          conejo: { nombre: '', dias: 4, dia: '', hechos: [] },
        };
        return mascotasMayores().join();
      });
      if (r !== 'gato') return 'mascotas mayores: ' + r;
      await p.evaluate(() => __cl.go('map', {}));
      await p.waitForTimeout(2000);
      await p.evaluate(() => openAdult());
      await p.waitForTimeout(800);
      const t = await p.evaluate(() => {
        const h = [...document.querySelectorAll('h3')].find((e) => e.textContent === 'Casa de Tito');
        return h ? h.parentElement.textContent : '';
      });
      if (!/Nube/.test(t) || !/Mayor/.test(t) || !/sorpresas/.test(t)) return 'zona de adultos: ' + t.slice(0, 200);
    },
  );

  await caso(
    'C26',
    'La casa en 3D de prueba (fase M0 de PLAN-CASA-MEJORA.md): se abre desde la zona de adultos, Tito anda y juega',
    async (p) => {
      await p.evaluate(() => __cl.go('map', {}));
      await p.waitForTimeout(1500);
      await p.evaluate(() => openAdult());
      await p.waitForTimeout(600);
      const hay = await p.evaluate(() => {
        const b = document.querySelector('[data-go="casa3dPrueba"]');
        if (b) b.click();
        return !!b;
      });
      if (!hay) return 'la zona de adultos no tiene el botón de la casa 3D';
      await p.waitForTimeout(2000);
      const r = await p.evaluate(() => {
        const sc = SCENES.casa3dPrueba;
        return [sceneName, sc.three, sc.objetos.length, sc.muestra, __w3 && __w3.ok];
      });
      if (r[0] !== 'casa3dPrueba' || !r[1] || r[2] !== 8 || !r[3]) return 'escena: ' + JSON.stringify(r);
      // tocar el sofá de la muestra: se busca el punto de la pantalla donde se ve (con pickAt, como el dedo) y Tito va a
      // su lado y juega con él
      await p.evaluate(() => {
        const sc = SCENES.casa3dPrueba;
        window.__said = [];
        for (let y = 200; y < 860; y += 20)
          for (let x = 400; x < 1500; x += 20) {
            const u = __w3.pickAt(x, y);
            if (u && u.id === 'obj:sofa') return sc.down(x, y);
          }
      });
      await p.waitForTimeout(2500);
      const j = await p.evaluate(() => [SCENES.casa3dPrueba.jugado, (window.__said || []).join(' | ')]);
      if (j[0] !== 'sofa') return 'al tocar el sofá: ' + JSON.stringify(j);
      // el botón de volver lleva a la casa de verdad
      await p.evaluate(() => SCENES.casa3dPrueba.down(90, 90));
      await p.waitForTimeout(800);
      const vuelta = await p.evaluate(() => sceneName);
      if (vuelta !== 'casaTito') return 'al volver: ' + vuelta;
    },
  );

  // catDe: la categoría de la tienda de un objeto (para las pestañas del baúl, como en escenas/casa.ts)
  const casillas = () =>
    casillasBaul(baulItems(), __cl.scene.pest, __cl.scene.bpag, (id) => SHOP.find((i) => i.id === id).cat);
  await caso(
    'C27',
    'Al entrar, la casa se ordena: cada cosa en un sitio sin repetir y lo que no cabe, al baúl',
    async (p) => {
      await p.evaluate(() => {
        const S = __cl.S;
        S.temas = {};
        for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
        S.rooms = 7;
        S.home = {};
        // una casa de antes, desordenada: todo en el salón, en los huecos viejos y sin sitio (h)
        SHOP.filter((i) => !i.slot && i.cat !== 'vales').forEach((it, k) => {
          S.owned[it.id] = 1;
          S.home[it.id] = { x: 700 + ((k * 97) % 800), y: 560 + ((k * 53) % 240) };
        });
        S.casaVistos = null;
        window.__said = [];
        SCENES.casaTito.room = 'salon';
        __cl.go('casaTito', {});
      });
      await p.waitForTimeout(1500);
      const r = await p.evaluate(() => {
        const fuera = Object.keys(S.home).filter((id) => S.home[id].r !== 'baul'),
          hs = fuera.map((id) => S.home[id].h);
        return {
          sinSitio: fuera.filter((id) => !S.home[id].h),
          repetidos: hs.filter((h, i) => hs.indexOf(h) !== i),
          salon: homeItems('salon').length,
          total: SHOP.filter((it) => !it.slot).length,
          baul: baulItems().length,
          nuevos: baulNuevos().length,
          dice: (window.__said || []).join(' | '),
        };
      });
      if (r.sinSitio.length || r.repetidos.length) return 'sitios: ' + JSON.stringify(r);
      if (r.salon < 10 || r.salon > 20 || r.salon + r.baul !== r.total) return 'reparto: ' + JSON.stringify(r);
      if (r.nuevos) return 'lo que ya había sale como nuevo en el baúl: ' + r.nuevos;
      if (!/guardado en mi baúl/.test(r.dice)) return 'Tito dice: ' + r.dice;
    },
  );
  await caso(
    'C28',
    'Lo comprado va al baúl: se abre con ello brillando en su habitación y con un toque se coloca',
    async (p) => {
      const r = await p.evaluate(() => {
        const S = __cl.S;
        S.coins = 500;
        S.temas = {};
        for (let i = 1; i <= 5; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
        S.rooms = 4;
        S.home = {};
        S.casaVistos = {};
        __cl.go('tienda', {});
        const sc = __cl.scene;
        sc.cat = SHOP.find((i) => i.id === 'pato').cat;
        for (sc.page = 0; sc.page < 9 && !sc.grid().some((g) => g.it.id === 'pato'); sc.page++);
        const g = sc.grid().find((g) => g.it.id === 'pato');
        sc.down(g.x, g.y);
        sc.confT = -9;
        sc.down(680, 690);
        return [S.owned.pato, homeRoom('pato')];
      });
      if (r.join() !== '1,baul') return 'tras comprar el pato: ' + r.join();
      await p.evaluate(() => {
        window.__said = [];
        __cl.scene.down(1240, 70);
      });
      await p.waitForTimeout(1500);
      const q = await p.evaluate(() => [
        sceneName,
        __cl.scene.room,
        __cl.scene.baul,
        baulNuevos().join(),
        (window.__said || []).join(' | '),
      ]);
      if (q.slice(0, 4).join() !== 'casaTito,bano,true,pato') return 'en la casa: ' + JSON.stringify(q);
      if (!/Dónde lo ponemos/.test(q[4])) return 'Tito dice: ' + q[4];
      const c = await p.evaluate(`(${casillas})().find((c) => c.id === 'pato')`);
      if (!c) return 'el pato no está en la bandeja';
      const v = await p.evaluate((c) => {
        const sc = __cl.scene;
        sc.down(c.x, c.y);
        sc.up(c.x, c.y);
        return [S.home.pato.r, !!S.home.pato.h, baulNuevos().length];
      }, c);
      if (v.join() !== 'bano,true,0') return 'tras tocarlo en la bandeja: ' + v.join();
    },
  );
  await caso(
    'C29',
    'Arrastrar del baúl a un sitio, de la habitación al baúl, y un mueble guarda lo que lleva encima',
    async (p) => {
      await p.evaluate(() => {
        const S = __cl.S;
        S.temas = {};
        for (let i = 1; i <= 3; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
        S.rooms = 3;
        S.home = { robot: { x: 0, y: 0, r: 'baul' } };
        S.casaVistos = {};
        ['mesa', 'pato', 'robot'].forEach((id) => (S.owned[id] = 1));
        S.home.mesa = { x: 640, y: 650, r: 'salon', h: 'salon:grande1' };
        SCENES.casaTito.room = 'salon';
        __cl.go('casaTito', {});
      });
      await p.waitForTimeout(1200);
      const a = await p.evaluate(() => {
        const sc = __cl.scene;
        sc.colocar('pato', 'salon:mesa:1');
        sc.down(BAUL.x, BAUL.y);
        return [sc.baul, S.home.pato.h];
      });
      if (a.join() !== 'true,salon:mesa:1') return 'baúl abierto y pato en la mesa: ' + a.join();
      const c = await p.evaluate(`(${casillas})().find((c) => c.id === 'robot')`);
      const b1 = await p.evaluate((c) => {
        const sc = __cl.scene;
        sc.down(c.x, c.y);
        sc.move(c.x, c.y - 60);
        sc.move(1040, 735);
        const cerca = sc.drag.cerca;
        sc.up(1040, 735);
        return [cerca, S.home.robot.h];
      }, c);
      if (b1.join() !== 'salon:suelo3,salon:suelo3') return 'del baúl al suelo: ' + b1.join();
      const b2 = await p.evaluate(() => {
        const sc = __cl.scene,
          o = S.home.robot;
        sc.down(o.x, o.y - 80);
        sc.move(o.x + 40, o.y - 100);
        sc.move(BAUL.x, BAUL.y);
        sc.up(BAUL.x, BAUL.y);
        return S.home.robot.r;
      });
      if (b2 !== 'baul') return 'soltado en el baúl, el robot está en ' + b2;
      const b3 = await p.evaluate(() => {
        const sc = __cl.scene,
          o = S.home.mesa,
          bt = roomBtns().find((b) => b.R.id === 'cocina');
        sc.down(o.x + 60, o.y - 40);
        sc.move(o.x + 80, o.y - 100);
        sc.move(bt.x, bt.y);
        sc.up(bt.x, bt.y);
        const hs = Object.values(S.home)
          .map((p) => p.h)
          .filter(Boolean);
        return [S.home.mesa.r, S.home.pato.r, hs.length === new Set(hs).size];
      });
      if (b3.join() !== 'cocina,baul,true') return 'la mesa a la cocina: ' + b3.join();
    },
  );
  await caso(
    'C30',
    '«¡Ordena, Tito!» pregunta al primer toque y al segundo pone cada cosa en su habitación',
    async (p) => {
      await p.evaluate(() => {
        const S = __cl.S;
        S.temas = {};
        for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
        S.rooms = 7;
        S.home = {};
        S.casaVistos = {};
        ['cama', 'nevera'].forEach((id) => (S.owned[id] = 1));
        S.home.cama = { x: 640, y: 650, r: 'salon', h: 'salon:grande1' };
        S.home.nevera = { x: 1000, y: 650, r: 'salon', h: 'salon:grande2' };
        SCENES.casaTito.room = 'salon';
        __cl.go('casaTito', {});
      });
      await p.waitForTimeout(1200);
      const r = await p.evaluate(() => {
        window.__said = [];
        const sc = __cl.scene;
        sc.down(BAUL.x, BAUL.y);
        sc.down(ORDENA.x, ORDENA.y);
        const una = [homeRoom('cama'), homeRoom('nevera')].join();
        sc.down(ORDENA.x, ORDENA.y);
        return [una, homeRoom('cama'), homeRoom('nevera'), (window.__said || []).join(' | ')];
      });
      if (r[0] !== 'salon,salon') return 'al primer toque ya ordena: ' + r[0];
      if (r[1] !== 'dormitorio' || r[2] !== 'cocina') return 'tras ordenar: ' + JSON.stringify(r);
      if (!/Ordeno la casa/.test(r[3]) || !/Cada cosa en su habitación/.test(r[3])) return 'Tito dice: ' + r[3];
    },
  );

  await caso(
    'C31',
    'Un toque: el objeto responde y su estado se guarda; Tito solo juega si se le toca antes',
    async (p) => {
      await p.evaluate(() => {
        const S = __cl.S;
        S.temas = {};
        S.home = {};
        S.casaEst = {};
        ['lampara', 'tele', 'robot'].forEach((id) => {
          S.owned[id] = 1;
          placeHome(id);
        });
        SCENES.casaTito.room = 'salon';
        __cl.go('casaTito', {});
      });
      await p.waitForTimeout(2500);
      const r = await p.evaluate(() => {
        const sc = __cl.scene,
          toca = (id) => {
            const o = S.home[id];
            sc.down(o.x, o.y - 60);
            sc.up(o.x, o.y - 60);
          };
        toca('lampara');
        toca('tele');
        toca('tele');
        toca('robot');
        return [S.casaEst.lampara, S.casaEst.tele, !!sc.va, sc.toques.robot > 0];
      });
      if (r.join() !== '1,2,false,true') return 'tras los toques: ' + r.join();
      await p.reload();
      await p.waitForTimeout(1500);
      const g = await p.evaluate(() => [__cl.S.casaEst.lampara, __cl.S.casaEst.tele]);
      if (g.join() !== '1,2') return 'al recargar, los estados son ' + g.join();
      const t = await p.evaluate(() => {
        SCENES.casaTito.room = 'salon';
        __cl.go('casaTito', {});
      });
      await p.waitForTimeout(2500);
      const q = await p.evaluate(() => {
        const sc = __cl.scene,
          o = S.home.robot;
        sc.tocaTito();
        sc.down(o.x, o.y - 60);
        sc.up(o.x, o.y - 60);
        return sc.va && sc.va.id;
      });
      if (q !== 'robot') return 'tocando antes a Tito, va a ' + q + (t || '');
    },
  );
  await caso('C32', 'Dos toques seguidos a un objeto con escena sacan su botón, que lleva a la escena', async (p) => {
    await p.evaluate(() => {
      const S = __cl.S;
      S.temas = {};
      for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
      S.rooms = 7;
      S.home = {};
      S.owned.telescopio = 1;
      placeHome('telescopio');
      SCENES.casaTito.room = 'torre';
      __cl.go('casaTito', {});
    });
    await p.waitForTimeout(2500);
    const b = await p.evaluate(() => {
      const sc = __cl.scene,
        o = S.home.telescopio;
      sc.down(o.x, o.y - 80);
      sc.up(o.x, o.y - 80);
      const uno = !!sc.botonEscena();
      sc.down(o.x, o.y - 80);
      sc.up(o.x, o.y - 80);
      const e = sc.botonEscena();
      if (e) sc.down(e.x, e.y);
      return [uno, !!e, sc.va && sc.va.id];
    });
    if (b.join() !== 'false,true,telescopio') return 'botón de la escena: ' + b.join();
    await p.waitForTimeout(6500);
    const n = await p.evaluate(() => sceneName);
    if (n !== 'casaCielo') return 'tras el botón, la escena es ' + n;
  });

  // prepara(ids, room, est): partida con todas las habitaciones, solo las cosas ids colocadas y la casa en room.
  const prepara = (p, ids, room, est) =>
    p.evaluate(
      ([ids, room, est]) => {
        const S = __cl.S;
        S.temas = {};
        for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
        S.rooms = 7;
        S.home = {};
        S.sorpresas = {};
        S.casaEst = est || {};
        ids.forEach((id) => {
          S.owned[id] = 1;
          placeHome(id);
        });
        SCENES.casaTito.room = room;
        __cl.go('casaTito', {});
      },
      [ids, room, est],
    );
  await caso('C33', 'Tito juega cada vez de otra forma con el mismo objeto, y sin abrir su escena', async (p) => {
    await prepara(p, ['sofa', 'cama'], 'dormitorio');
    await p.waitForTimeout(2500);
    const vs = [];
    for (let i = 0; i < 4; i++) {
      await p.evaluate(() => {
        window.__said = [];
        __cl.scene.irA('cama');
      });
      await p.waitForTimeout(4200);
      vs.push(await p.evaluate(() => [__cl.scene.va.accion, (window.__said || []).join(' | '), sceneName]));
    }
    const acc = vs.map((v) => v[0]).join();
    if (acc !== 'tumbarse,saltar,tocar,tumbarse') return 'formas de jugar: ' + acc;
    if (!/Salto en la cama/.test(vs[1][1]) || !/Hago la cama/.test(vs[2][1])) return 'frases: ' + JSON.stringify(vs);
    if (vs.some((v) => v[2] !== 'casaTito')) return 'se abre una escena sin el botón: ' + JSON.stringify(vs);
  });
  await caso(
    'C34',
    'Arrastrar a Tito hasta un objeto hace que juegue con él; soltado en el aire, baja al suelo',
    async (p) => {
      await prepara(p, ['sofa', 'tele'], 'salon');
      await p.waitForTimeout(2500);
      const r = await p.evaluate(() => {
        const sc = __cl.scene,
          tx = sc.paseo.x1,
          ty = sc.paseo.y1,
          t = S.home.tele;
        sc.down(tx, ty - 160);
        sc.move(tx + 30, ty - 160);
        sc.move(t.x, t.y - 80);
        const sobre = sc.dragTito && sc.dragTito.sobre;
        sc.up(t.x, t.y - 80);
        return [sobre, sc.va && sc.va.id];
      });
      if (r.join() !== 'tele,tele') return 'soltado sobre la tele: ' + r.join();
      await p.waitForTimeout(4000);
      const q = await p.evaluate(() => {
        const sc = __cl.scene,
          tx = sc.paseo.x1,
          ty = sc.paseo.y1;
        sc.down(tx, ty - 160);
        sc.move(tx + 30, ty - 160);
        sc.move(700, 330);
        sc.up(700, 330);
        return [sc.paseo.y1 >= 600, sc.titoListo < 0];
      });
      if (q.join() !== 'true,true') return 'soltado en el aire: ' + q.join();
      const t = await p.evaluate(() => {
        const sc = __cl.scene,
          tx = sc.paseo.x1,
          ty = sc.paseo.y1;
        sc.down(tx, ty - 160);
        sc.up(tx, ty - 160);
        return T - sc.titoListo < 1;
      });
      if (!t) return 'un toque a Tito sin arrastrar no lo deja listo';
    },
  );
  await caso(
    'C35',
    'Arrastrando la tarta, la mesa guiña; dejarla encima da la sorpresa; el cuadro tiene 3 dibujos',
    async (p) => {
      await prepara(p, ['mesa', 'tarta'], 'cocina');
      await p.waitForTimeout(2500);
      const r = await p.evaluate(() => {
        window.__said = [];
        const sc = __cl.scene,
          o = S.home.tarta,
          m = S.home.mesa;
        sc.down(o.x, o.y - 30);
        sc.move(o.x + 30, o.y - 30);
        sc.move(m.x + 40, m.y - 150);
        const pareja = sc.pareja;
        sc.up(m.x + 40, m.y - 150);
        return [pareja, S.home.tarta.h.startsWith('cocina:mesa:'), !!S.sorpresas['tarta+mesa'], sc.pareja];
      });
      if (r.join() !== 'mesa,true,true,') return 'tarta y mesa: ' + r.join();
      await prepara(p, ['cuadro'], 'salon');
      await p.waitForTimeout(2500);
      const c = await p.evaluate(() => {
        const sc = __cl.scene,
          o = S.home.cuadro,
          e = [];
        for (let i = 0; i < 3; i++) {
          sc.down(o.x, o.y - 60);
          sc.up(o.x, o.y - 60);
          e.push(S.casaEst.cuadro);
        }
        return e.join();
      });
      if (c !== '1,2,0') return 'el cuadro pasa por ' + c;
      if (p.errs.length) return 'errores: ' + p.errs.slice(0, 3).join(' | ');
    },
  );

  await caso(
    'C36',
    'A las 8 Tito pide desayunar con un bocadillo; ir a la nevera hace la rutina una vez al día y da su pegatina',
    async (p) => {
      await prepara(p, ['nevera', 'mesa'], 'cocina');
      await p.waitForTimeout(2500);
      const r = await p.evaluate(() => {
        window.__said = [];
        const sc = __cl.scene,
          b = sc.bocadilloRutina();
        if (!b) return 'sin bocadillo';
        sc.down(b.x, b.y);
        sc.up(b.x, b.y);
        S.casaDia = { d: '', hechas: [] };
        S.stk.nevera = 0;
        sc.irA('nevera');
        return [b.rutina.id, window.__said.some((f) => f.includes('desayuno'))].join();
      });
      if (r !== 'desayuno,true') return 'el bocadillo: ' + r;
      await p.waitForTimeout(6000);
      const h = await p.evaluate(() => {
        const sc = __cl.scene;
        const hecha = [S.casaDia.hechas.join(), S.stk.nevera, !sc.bocadilloRutina()];
        sc.irA('mesa');
        return hecha;
      });
      if (h.join() !== 'desayuno,1,true') return 'tras la nevera: ' + h.join();
      await p.waitForTimeout(5000);
      const d = await p.evaluate(() => S.stk.nevera);
      if (d !== 1) return 'la rutina da la pegatina dos veces: ' + d;
      if (p.errs.length) return 'errores: ' + p.errs.slice(0, 3).join(' | ');
    },
    { hora: 8 },
  );
  await caso(
    'C37',
    'A las 22 se ve la noche por la ventana, Tito pide dormir y el reloj dice la hora',
    async (p) => {
      await prepara(p, ['reloj', 'cama'], 'dormitorio');
      await p.waitForTimeout(2500);
      const r = await p.evaluate(() => {
        window.__said = [];
        const sc = __cl.scene,
          b = sc.bocadilloRutina(),
          o = S.home.reloj;
        sc.toca('reloj');
        // color de la ventana del dormitorio (en 1210, 160, 280 x 210): el azul de la noche
        // (el lienzo 2D del juego: el de la capa 3D no tiene contexto 2D)
        const px = [...document.querySelectorAll('canvas')]
          .map((c) => [c, c.getContext('2d')])
          .filter(([c, k]) => k && c.width > 0)
          .map(([c, k]) => k.getImageData((1400 * c.width) / 1600, (330 * c.height) / 900, 1, 1).data)
          .find((d) => d[3] > 0);
        return [b && b.rutina.id, window.__said.join('|'), !!px && px[2] > px[0], !!o];
      });
      if (r[0] !== 'dormir') return 'la rutina de las 22: ' + r[0];
      if (!String(r[1]).includes('Son las diez')) return 'el reloj dice: ' + r[1];
      if (!r[2]) return 'la ventana no se ve de noche';
      if (p.errs.length) return 'errores: ' + p.errs.slice(0, 3).join(' | ');
    },
    { hora: 22 },
  );

  await caso(
    'C38',
    'Tesoros del mapa (P14): hay tres, tocar uno lo recoge (moneda y S.tesoros) y la vitrina de la casa lo enseña',
    async (p) => {
      await p.evaluate(() => __cl.go('map', {}));
      await p.waitForTimeout(2500);
      const hay = await p.evaluate(() => {
        const w = window.__w3 && window.__w3.W;
        if (!w || !window.__w3.ok) return 'sin 3D';
        return w.pick.filter((o) => o.userData.id === 'tesoro').map((o) => o.userData.rincon);
      });
      if (hay === 'sin 3D') return null; // sin WebGL el mapa es 2D y no tiene tesoros
      const pend = await p.evaluate(() => tesorosPendientes().map((e) => e.rincon));
      if (hay.length !== 3 || hay.join() !== pend.join()) return 'tesoros en el mapa: ' + hay + ' / ' + pend;
      const monedas = await p.evaluate(() => __cl.S.coins || 0);
      // toca el primer tesoro donde se ve en la pantalla: Tito va hasta él y lo recoge
      await p.evaluate(() => {
        window.__said = [];
        const g = __w3.W.pick.find((o) => o.userData.id === 'tesoro');
        const v = new __w3.THREE.Vector3();
        g.getWorldPosition(v);
        v.y += 0.8;
        const [x, y] = __w3.proj(v);
        __cl.scene.down(x, y);
      });
      let t = null;
      for (let i = 0; i < 20 && !(t && t.hoy.length); i++) {
        await p.waitForTimeout(500);
        t = await p.evaluate(() => registroHoy());
      }
      if (!t || t.hoy.length !== 1 || t.hoy[0] !== hay[0]) return 'tras tocar el tesoro: ' + JSON.stringify(t);
      await p.waitForTimeout(1500);
      const [despues, dicho] = await p.evaluate(() => [__cl.S.coins || 0, window.__said.join('|')]);
      if (despues - monedas !== 1) return `tesoro: monedas ${monedas} -> ${despues}`;
      if (!dicho.includes('vitrina')) return 'Tito no dice qué ha encontrado: ' + dicho;
      // la casa tiene el botón de la vitrina, que lleva a ella; allí el tesoro está y se puede tocar
      await p.evaluate(() => __cl.go('casaTito', {}));
      await p.waitForTimeout(1500);
      await p.evaluate(() => __cl.scene.down(VITRINA_BOTON.x, VITRINA_BOTON.y));
      await p.waitForTimeout(1200);
      if ((await p.evaluate(() => __cl.name)) !== 'vitrina')
        return 'el botón de la vitrina lleva a: ' + (await p.evaluate(() => __cl.name));
      const toque = await p.evaluate(() => {
        window.__said = [];
        const id = Object.keys(registroHoy().vitrina)[0],
          c = CASILLAS_VITRINA.find((x) => x.id === id),
          falta = CASILLAS_VITRINA.find((x) => x.id !== id);
        __cl.scene.down(c.x, c.y);
        __cl.scene.down(falta.x, falta.y);
        return window.__said.join('|');
      });
      if (!toque.includes('una vez') || !toque.includes('aún no')) return 'tocar en la vitrina dice: ' + toque;
      await p.evaluate(() => __cl.scene.down(90, 90));
      await p.waitForTimeout(1000);
      const fin = await p.evaluate(() => __cl.name);
      return fin === 'casaTito' ? null : 'la casa de la vitrina lleva a: ' + fin;
    },
  );

  await caso(
    'C39',
    'La cámara de fotos (P15): en el mapa, una zona y la granja hace fotos sin moverse de sitio; el álbum las enseña',
    async (p) => {
      await p.evaluate(() => __cl.go('map', {}));
      await p.waitForTimeout(2500);
      if (!(await p.evaluate(() => !!(window.__w3 && window.__w3.ok)))) return null; // sin WebGL, no hay cámara en el mapa
      // foto(fn): toca en la pantalla el primer objeto 3D que cumple fn (lo busca en w.trees)
      const tocar3d = (marca) =>
        p.evaluate((m) => {
          const o = __w3.W.trees.find((q) => q.userData[m]);
          if (!o) return 'no hay ' + m;
          const v = new __w3.THREE.Vector3();
          o.getWorldPosition(v);
          v.y += 0.4;
          const [x, y] = __w3.proj(v);
          __cl.scene.down(x, y);
          return '';
        }, marca);
      const monedas = await p.evaluate(() => {
        window.__said = [];
        __cl.scene.down(CAMARA_BOTON.x, CAMARA_BOTON.y);
        return __cl.S.coins || 0;
      });
      if (!(await p.evaluate(() => camaraActiva()))) return 'el botón no enciende la cámara';
      const e1 = await tocar3d('crab');
      if (e1) return e1;
      await p.waitForTimeout(1500);
      const r1 = await p.evaluate(() => [
        registroDeFotos().vistas,
        __cl.S.coins || 0,
        window.__said.join('|'),
        __cl.name,
        !!__w3.W.walk,
      ]);
      if (r1[0].cangrejo !== 1) return 'la foto del cangrejo: ' + JSON.stringify(r1[0]);
      if (r1[1] - monedas !== 1) return `foto nueva: monedas ${monedas} -> ${r1[1]}`;
      if (!r1[2].includes('Foto nueva') || !r1[2].includes('cangrejo')) return 'Tito dice: ' + r1[2];
      if (r1[3] !== 'map' || r1[4]) return 'con la cámara, Tito no va a ningún sitio';
      // la misma foto otra vez: se cuenta, sin monedas; un toque en el cielo: solo el clic
      await tocar3d('crab');
      await p.evaluate(() => __cl.scene.down(800, 30));
      await p.waitForTimeout(800);
      const r2 = await p.evaluate(() => [
        registroDeFotos().vistas.cangrejo,
        __cl.S.coins || 0,
        window.__said.join('|'),
      ]);
      if (r2[0] !== 2 || r2[1] !== r1[1]) return 'repetir la foto: ' + JSON.stringify(r2);
      if (!r2[2].includes('ya la tenías') || !r2[2].includes('no hay nada')) return 'Tito dice: ' + r2[2];
      // en una zona, la cámara se apaga al llegar y fotografía un árbol
      await p.evaluate(() => __cl.go('jardin', {}));
      await p.waitForTimeout(2500);
      if (await p.evaluate(() => camaraActiva())) return 'la cámara sigue encendida al cambiar de escena';
      await p.evaluate(() => __cl.scene.down(CAMARA_BOTON.x, CAMARA_BOTON.y));
      const e3 = await tocar3d('tree');
      if (e3) return 'en el jardín: ' + e3;
      await p.waitForTimeout(500);
      if (!(await p.evaluate(() => registroDeFotos().vistas.arbol))) return 'en el jardín no se hace la foto del árbol';
      // en la granja escuela, a un animal que pasea (si hay otro delante, la foto es la de ese: el de más delante)
      await p.evaluate(() => __cl.go('excursion', { exc: 'granja' }));
      await p.waitForTimeout(2000);
      const g = await p.evaluate(() => {
        __cl.scene.down(CAMARA_BOTON.x, CAMARA_BOTON.y);
        const a = PASEO.animales.find((q) => !q.cria);
        __cl.scene.down(a.x, a.y - 30);
        const granja = ['vaca', 'caballo', 'cerdo', 'oveja', 'gallina', 'pollito', 'pato'];
        return [Object.keys(registroDeFotos().vistas).filter((k) => granja.includes(k)), __cl.name];
      });
      if (g[0].length !== 1 || g[1] !== 'excursion') return 'en la granja: ' + JSON.stringify(g);
      // el álbum, desde la casa: la foto hecha dice su nombre y su palabra en inglés; una que falta, que aún no
      await p.evaluate(() => __cl.go('casaTito', {}));
      await p.waitForTimeout(1500);
      await p.evaluate(() => __cl.scene.down(ALBUM_FOTOS_BOTON.x, ALBUM_FOTOS_BOTON.y));
      await p.waitForTimeout(1200);
      if ((await p.evaluate(() => __cl.name)) !== 'albumFotos')
        return 'el botón del álbum lleva a: ' + (await p.evaluate(() => __cl.name));
      const t = await p.evaluate(() => {
        window.__said = [];
        __cl.scene.down(1460, 480); // a la página del mar
        const cs = CASILLAS_FOTOS('mar'),
          c = cs.find((q) => q.id === 'cangrejo'),
          falta = cs.find((q) => q.id === 'ballena');
        __cl.scene.down(c.x, c.y);
        __cl.scene.down(c.bx, c.by);
        __cl.scene.down(falta.x, falta.y);
        return [__cl.scene.pag, window.__said.join('|')];
      });
      if (t[0] !== 1) return 'la flecha no pasa de página: ' + t[0];
      if (!t[1].includes('2 veces') || !t[1].includes('crab') || !t[1].includes('aún no'))
        return 'tocar en el álbum dice: ' + t[1];
      await p.evaluate(() => __cl.scene.down(90, 90));
      await p.waitForTimeout(1000);
      const fin = await p.evaluate(() => __cl.name);
      return fin === 'casaTito' ? null : 'la casa del álbum lleva a: ' + fin;
    },
  );

  await caso(
    'C40',
    'La gran aventura (P16): el botón del mapa abre el mapa del tesoro; el capítulo 1 da su trozo y el 2 es para mañana',
    async (p) => {
      await p.evaluate(() => __cl.go('map', {}));
      await p.waitForTimeout(2500);
      if (!(await p.evaluate(() => !!(window.__w3 && window.__w3.ok)))) return null; // sin WebGL, el botón no está
      const monedas = await p.evaluate(() => {
        delete __cl.S.aventura;
        window.__said = [];
        __cl.scene.down(AVENTURA_BOTON.x, AVENTURA_BOTON.y);
        return __cl.S.coins || 0;
      });
      await p.waitForTimeout(1200);
      if ((await p.evaluate(() => __cl.name)) !== 'aventura')
        return 'el botón de la aventura lleva a: ' + (await p.evaluate(() => __cl.name));
      const e0 = await p.evaluate(() => [estadoDe(0), estadoDe(1), estadoDe(5)]);
      if (e0.join() !== 'abierto,cerrado,cerrado') return 'al empezar: ' + e0;
      await p.evaluate(() => __cl.scene.down(MEDALLAS[0].x, MEDALLAS[0].y));
      await p.waitForTimeout(1000);
      if ((await p.evaluate(() => [__cl.name, __cl.scene.fase].join())) !== 'aventuraCap,cuento')
        return 'la medalla 1 no abre el cuento';
      // el cuento y el reto, siguiendo la ayuda de cada uno
      await p.evaluate(() => {
        let u = 0;
        const f = () => {
          const sc = __cl.scene;
          if (__cl.name !== 'aventuraCap' || sc.fase === 'pieza') return;
          const h = sc.hint && sc.hint(),
            a = performance.now();
          if (h && a - u > 250) {
            u = a;
            sc.down(h.x, h.y);
          }
          requestAnimationFrame(f);
        };
        requestAnimationFrame(f);
      });
      let nombre = '';
      for (let i = 0; i < 240 && nombre !== 'aventura'; i++) {
        await p.waitForTimeout(500);
        nombre = await p.evaluate(() => __cl.name);
      }
      if (nombre !== 'aventura') return 'el capítulo no termina: ' + nombre;
      const r = await p.evaluate(() => [
        registroDeAventura().hechos,
        __cl.S.coins || 0,
        estadoDe(0),
        estadoDe(1),
        window.__said.join('|'),
      ]);
      if (r[0].join() !== 'botella') return 'lo guardado: ' + JSON.stringify(r[0]);
      if (r[1] - monedas !== 3) return `el trozo: monedas ${monedas} -> ${r[1]}`;
      if (r[2] !== 'hecho' || r[3] !== 'manana') return 'después: ' + r[2] + ', ' + r[3];
      if (!r[4].includes('primer trozo') || !r[4].includes('mañana')) return 'Tito dice: ' + r[4];
      // el 2 hoy no se abre; el 1 se repite sin monedas; la casita vuelve al mapa
      const t = await p.evaluate(() => {
        window.__said = [];
        __cl.scene.down(MEDALLAS[1].x, MEDALLAS[1].y);
        return [__cl.name, window.__said.join('|')];
      });
      if (t[0] !== 'aventura' || !t[1].includes('mañana')) return 'la medalla 2: ' + JSON.stringify(t);
      await p.evaluate(() => __cl.scene.down(90, 90));
      await p.waitForTimeout(1500);
      const fin = await p.evaluate(() => __cl.name);
      return fin === 'map' ? null : 'la casita de la aventura lleva a: ' + fin;
    },
  );

  await caso(
    'C41',
    'El gran tesoro (P16b): con el último capítulo, el mapa está completo y Tito se pone el sombrero de pirata',
    async (p) => {
      const antes = await p.evaluate(() => {
        __cl.S.aventura = { hechos: ['botella', 'bosque', 'polly', 'lupi', 'montana'], d: '2026-01-01' };
        delete __cl.S.owned.sombreroPirata;
        window.__said = [];
        __cl.go('aventura', {});
        return [estadoDe(5), completa()];
      });
      if (antes.join() !== 'abierto,false') return 'antes del último: ' + antes;
      await p.waitForTimeout(800);
      await p.evaluate(() => __cl.scene.down(MEDALLAS[5].x, MEDALLAS[5].y));
      await p.waitForTimeout(800);
      // el reto (excavar) se da por hecho: lo que se mira es lo que pasa después
      await p.evaluate(() => {
        __cl.scene.alReto();
        __cl.scene.alTerminar();
      });
      let nombre = '';
      for (let i = 0; i < 40 && nombre !== 'aventura'; i++) {
        await p.waitForTimeout(500);
        nombre = await p.evaluate(() => __cl.name);
      }
      if (nombre !== 'aventura') return 'el último capítulo no vuelve a la aventura: ' + nombre;
      await p.waitForTimeout(4000);
      const r = await p.evaluate(() => [completa(), !!__cl.S.owned.sombreroPirata, window.__said.join('|')]);
      if (!r[0]) return 'la temporada no está completa';
      if (!r[1]) return 'el gran tesoro no da el sombrero de pirata';
      if (!r[2].includes('está completo') || !r[2].includes('sombrero de pirata')) return 'Tito dice: ' + r[2];
      const t = await p.evaluate(() => {
        window.__said = [];
        __cl.scene.down(COFRE.x, COFRE.y);
        return window.__said.join('|');
      });
      return t.includes('gran tesoro') ? null : 'tocar el cofre dice: ' + t;
    },
  );

  await caso('C42', 'Compra desde el catálogo y recogida de toda la casa con confirmación', async (p) => {
    const articulo = await p.evaluate(() => {
      S.coins = 100;
      S.owned.mesa = S.owned.cactus = 1;
      S.home = {
        mesa: { x: 640, y: 650, r: 'salon', h: 'salon:grande1' },
        cactus: { x: 900, y: 775, r: 'jardin', h: 'jardin:suelo1' },
      };
      S.casaVistos = { mesa: 1, cactus: 1 };
      S.sorpresas = { mesa: 1 };
      S.unlockAll = true;
      __cl.go('tienda', {});
      const sc = __cl.scene;
      sc.cat = 'juguetes';
      for (sc.page = 0; sc.page < sc.pages(); sc.page++) {
        const casilla = sc.grid().find((g) => g.it.id === 'camion');
        if (casilla) return { x: casilla.x, y: casilla.y, precio: casilla.it.p };
      }
      return null;
    });
    if (!articulo) return 'no aparece el camión en Juguetes';
    await p.waitForFunction(() => VIVO.fade === 0);
    await L.clic(p, articulo.x, articulo.y);
    const elegido = await p.evaluate(() => __cl.scene.conf?.id);
    if (elegido !== 'camion') return 'confirmación de compra: ' + elegido;
    await p.waitForFunction(() => T - __cl.scene.confT >= 0.3);
    await L.clic(p, 680, 690);
    const compra = await p.evaluate(() => [S.coins, S.owned.camion, S.home.camion?.r, !!S.home.camion?.h]);
    if (compra.join() !== [100 - articulo.precio, 1, 'baul', false].join()) return 'compra: ' + compra;
    await L.clic(p, 1240, 70);
    await p.waitForFunction(() => sceneName === 'casaTito' && VIVO.fade === 0);
    const boton = await p.evaluate(() => GUARDA_TODO);
    await L.clic(p, boton.x, boton.y);
    const antes = await p.evaluate(() => [S.home.mesa.r, S.home.cactus.r]);
    if (antes.join() !== 'salon,jardin') return 'recogió sin confirmar: ' + antes;
    await L.clic(p, boton.x, boton.y);
    const tras = await p.evaluate(() => [
      homeItems().length,
      baulItems().sort().join(' '),
      baulNuevos().join(),
      S.sorpresas.mesa,
      S.coins,
    ]);
    if (tras.join() !== [0, 'cactus camion mesa', 'camion', 1, 100 - articulo.precio].join())
      return 'casa recogida: ' + tras;
    await p.reload();
    await p.waitForFunction(() => typeof window.__cl?.go === 'function');
    const recarga = await p.evaluate(() => {
      __cl.go('casaTito', {});
      return [homeItems().length, baulItems().length, S.owned.camion];
    });
    return recarga.join() === '0,3,1' ? null : 'tras recargar: ' + recarga;
  });

  await caso('C43', 'Las compras nuevas reaccionan y sus estados se recuerdan al recargar', async (p) => {
    const ids = [
      'sarten',
      'vaso',
      'grifo',
      'cepillo',
      'cajaMusica',
      'cajaSorpresa',
      'semaforo',
      'lancha',
      'bici',
      'helicoptero',
      'silbato',
      'globoAire',
      'manguera',
      'brote',
      'molinillo',
      'aspersor',
    ];
    const compra = await p.evaluate((ids) => {
      const faltan = ids.filter((id) => !SHOP.some((it) => it.id === id && it.p > 0) || !Object.hasOwn(PICS, id));
      if (faltan.length) return { error: 'faltan artículos o dibujos: ' + faltan.join() };
      S.coins = 100;
      S.unlockAll = true;
      for (let i = 1; i <= 14; i++) S.temas['3A-T' + i] = { done: 1, g: {} };
      S.rooms = 7;
      __cl.go('tienda', {});
      const tienda = __cl.scene;
      tienda.cat = 'juguetes';
      for (tienda.page = 0; tienda.page < tienda.pages(); tienda.page++) {
        const c = tienda.grid().find((g) => g.it.id === 'semaforo');
        if (c) return { x: c.x, y: c.y, precio: c.it.p };
      }
      return { error: 'no se encuentra el semáforo en Juguetes' };
    }, ids);
    if (compra.error) return compra.error;
    await p.waitForFunction(() => VIVO.fade === 0);
    await L.clic(p, compra.x, compra.y);
    if ((await p.evaluate(() => __cl.scene.conf?.id)) !== 'semaforo') return 'no se abrió su confirmación';
    await p.waitForFunction(() => T - __cl.scene.confT >= 0.3);
    await L.clic(p, 680, 690);
    const guardado = await p.evaluate(() => [S.coins, homeRoom('semaforo')]);
    if (guardado.join() !== [100 - compra.precio, 'baul'].join()) return 'compra: ' + guardado;
    await L.clic(p, 1240, 70);
    await p.waitForFunction(() => sceneName === 'casaTito' && VIVO.fade === 0);
    const c = await p.evaluate(`(${casillas})().find((c) => c.id === 'semaforo')`);
    if (!c) return 'no aparece en el baúl';
    await L.clic(p, c.x, c.y);
    const semaforo = await p.evaluate(() => {
      window.__said = [];
      const s = homeItems().find((o) => o.id === 'semaforo');
      return s && { x: s.x, y: s.y - s.s * 0.42 };
    });
    if (!semaforo) return 'no salió del baúl';
    const luces = [];
    for (let i = 0; i < 4; i++) {
      await L.clic(p, semaforo.x, semaforo.y);
      luces.push(await p.evaluate(() => S.casaEst.semaforo));
    }
    if (luces.join() !== '1,2,0,1') return 'secuencia del semáforo: ' + luces;
    const voces = await p.evaluate(() => window.__said.join('|'));
    if (!/Verde. Podemos pasar.*Amarillo. Esperamos.*Rojo. Nos paramos./.test(voces)) return 'voces: ' + voces;

    const activos = await p.evaluate((ids) => {
      const casa = __cl.scene;
      for (const id of ids.filter((id) => id !== 'semaforo')) {
        S.home = { semaforo: S.home.semaforo };
        S.owned[id] = 1;
        placeHome(id);
        casa.room = homeRoom(id);
        casa.toca(id);
        casa.draw();
      }
      return ids.filter((id) => id !== 'silbato' && S.casaEst[id] !== 1);
    }, ids);
    if (activos.length) return 'estados que no cambiaron: ' + activos.join();
    await p.reload();
    await p.waitForFunction(() => typeof window.__cl?.go === 'function');
    const quedan = await p.evaluate(() => [
      S.casaEst.semaforo,
      S.casaEst.brote,
      S.casaEst.aspersor,
      S.casaEst.cajaMusica,
    ]);
    return quedan.join() === '1,1,1,1' ? null : 'estados tras recargar: ' + quedan;
  });

  await caso('C44', 'Confirmar una compra antigua respeta el saldo y los cambios de la familia', async (p) => {
    const resultado = await p.evaluate(() => {
      window.__said = [];
      S.coins = 100;
      S.owned.hamster = 1;
      S.mascotas.hamster = { nombre: 'Nube', dias: 9, dia: '2026-10-21', hechos: [] };
      __cl.go('tienda', {});
      const tienda = __cl.scene;
      tienda.buy(SHOP.find((it) => it.id === 'hamster'));
      const mascota = [S.coins, S.mascotas.hamster.nombre, S.mascotas.hamster.dias];
      S.coins = 0;
      tienda.buy(SHOP.find((it) => it.id === 'piano'));
      const saldo = [S.coins, !!S.owned.piano];
      const vale = { id: 'prueba', txt: 'Ir al parque', on: 1, p: 10 };
      S.coins = 100;
      S.vales = [{ ...vale, p: 30 }];
      S.valesLog = [];
      tienda.buy({ id: 'vale:prueba', p: 10, vale });
      const editado = [S.coins, S.valesLog.length];
      S.vales = [vale];
      tienda.buy({ id: 'vale:prueba', p: 10, vale });
      return { mascota, saldo, editado, valida: [S.coins, S.valesLog.length], avisos: window.__said.join('|') };
    });
    if (resultado.mascota.join() !== '100,Nube,9')
      return 'se volvió a comprar la mascota: ' + JSON.stringify(resultado);
    if (resultado.saldo.join() !== '0,false') return 'compra sin saldo: ' + JSON.stringify(resultado);
    if (resultado.editado.join() !== '100,0') return 'vale editado: ' + JSON.stringify(resultado);
    if (
      !resultado.avisos.includes('Ya tienes este objeto.') ||
      !resultado.avisos.includes('Ahora no tienes monedas suficientes') ||
      !resultado.avisos.includes('Este vale ha cambiado.')
    )
      return 'faltan avisos: ' + resultado.avisos;
    return resultado.valida.join() === '90,1' ? null : 'vale vigente: ' + JSON.stringify(resultado);
  });

  await caso('C45', 'Excavar admite más de seis objetos y termina una sola vez', async (p) => {
    for (const n of [4, 6, 7, 12]) {
      const resultado = await p.evaluate((n) => {
        __cl.go('casaTito', {});
        window.__excavaFin = 0;
        const juego = Excava(
          {
            pool: Array(n).fill('moneda'),
            n,
            bg: () => {},
          },
          () => window.__excavaFin++,
        );
        juego.draw();
        const primero = juego.hint();
        for (let i = 0; i < 20; i++) juego.dig(primero.x, primero.y);
        if (juego.done !== 0) return 'repetir un agujero cuenta como descubrir';
        for (let i = 0; i < n; i++) {
          const h = juego.hint();
          if (!h || !Number.isFinite(h.x) || !Number.isFinite(h.y)) return 'falta una posición';
          for (let dx = -90; dx <= 90; dx += 30) for (let dy = -90; dy <= 90; dy += 30) juego.dig(h.x + dx, h.y + dy);
        }
        juego.draw();
        return juego.done === n && juego.hint() === null ? null : 'descubiertos ' + juego.done;
      }, n);
      if (resultado) return n + ' objetos: ' + resultado;
      await p.waitForFunction(() => window.__excavaFin === 1);
      await p.waitForTimeout(650);
      if ((await p.evaluate(() => window.__excavaFin)) !== 1) return 'se repite el final';
    }
  });

  R.guardar();
  await b.close();
  srv.close();
  process.exit(0);
})();
