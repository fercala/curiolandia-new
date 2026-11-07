// Comprueba las habitaciones de la casa de Tito y los premios nuevos de la tienda (v1.590): que las habitaciones se abran
// con las casitas terminadas, que Tito anuncie la nueva y vaya a ella, que una partida antigua (cosas sin habitación) siga
// teniéndolo todo en el salón, que lo comprado vaya a su habitación, que se pueda llevar una cosa a otra habitación
// arrastrándola hasta su botón, que la tienda no deje comprar lo de una habitación cerrada y que pase de página.
// Desde la fase C2 de docs/PLAN-CASA.md, también que Tito ande hasta lo que se toca y juegue con ello (C8), que ande
// al tocar el suelo (C9) y que las 49 reacciones se dibujen sin errores (C10); desde la C3, el cielo de noche del
// telescopio (C11) y la vuelta al mundo del globo terráqueo (C12); desde la C4, los instrumentos (C13), la pizarra
// (C14) y la tele (C15); desde la C5, la merienda y la sopa (C16), el baño (C17), buenas noches (C18) y el huerto
// (C19); desde la C6, cuidar a las mascotas: ir a su escena y ponerles nombre (C20), crecer con los días cuidados
// (C21) y nacer bebé al comprarla (C22); desde la C7, las combinaciones (C23), el álbum «Sorpresas de la casa» (C24) y
// las mascotas mayores en el mapa y en la zona de adultos (C25); desde la fase M0 de docs/PLAN-CASA-MEJORA.md, la casa
// en 3D de prueba (C26); desde la M2, la casa ordenada: al entrar cada cosa va a un sitio y lo que no cabe al baúl
// (C27), lo comprado va al baúl y se coloca con un toque (C28), arrastrar del baúl a un sitio, al baúl y llevar un
// mueble con algo encima (C29) y «¡Ordena, Tito!» (C30). Desde la M2, lo comprado en la tienda va al baúl (C6).
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
  await caso('C10', 'Las reacciones de los 49 objetos se dibujan sin errores', async (p) => {
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
    await p.waitForTimeout(800);
    const ids = await p.evaluate(() => SHOP.filter((it) => !it.slot && it.cat !== 'vales').map((it) => it.id));
    for (const id of ids) {
      await p.evaluate((id) => {
        const sc = __cl.scene,
          o = S.home[id];
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
        sc.down(o.x, o.y - 60);
        sc.up(o.x, o.y - 60);
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
        sc.down(o.x, o.y - 60);
        sc.up(o.x, o.y - 60);
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
      sc.down(o.x, o.y - 40);
      sc.up(o.x, o.y - 40);
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
        sc.down(1490, 470);
        const j = ENTRADAS_ALBUM.indexOf('mesa+silla') - POR_PAGINA;
        sc.down(230 + (j % 8) * 163, 230 + Math.floor(j / 8) * 160);
        return [sc.pag, ENTRADAS_ALBUM.length, window.__said.join(' | ')];
      });
      if (r[0] !== 1 || r[1] !== 63) return 'páginas: ' + JSON.stringify(r);
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
          baul: baulItems().length,
          nuevos: baulNuevos().length,
          dice: (window.__said || []).join(' | '),
        };
      });
      if (r.sinSitio.length || r.repetidos.length) return 'sitios: ' + JSON.stringify(r);
      if (r.salon < 10 || r.salon > 20 || r.salon + r.baul !== 55) return 'reparto: ' + JSON.stringify(r);
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

  R.guardar();
  await b.close();
  srv.close();
  process.exit(0);
})();
