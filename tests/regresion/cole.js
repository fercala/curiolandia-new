// Comprueba el cole y su patio (fase P1 de docs/IDEAS-MEJORA.md) con el ratón de verdad: desde el mapa (3D) se llega al
// cole tocando su sitio (Tito anda hasta él y entra); del cole al patio; lo que está en obras (las clases) no lleva a ninguna parte y Tito lo dice;
// del patio a «¡Estatuas!», que se juega sola hasta el final (Tito baila, para la música, estatua... en todas las rondas)
// y da 3 monedas y apunta la actividad en S.cole; la casa vuelve de cada escena a la de antes (estatuas -> patio ->
// cole -> mapa); y «Tito dice» (fase P2) se juega solo hasta el final y lo apunta, y su plan con 5 años tiene sus 3
// trampas bien puestas; el yoga (fase P3) se hace solo hasta el final y lo apunta, y a los 20 minutos el mapa abre la
// pausa activa, que vuelve sola al mapa; al irse a dormir, Tito deja un reto en casa que la familia marca en la zona de
// adultos y Tito celebra con una pegatina (fase P4); y sin juegos de moverse, el patio cierra y no hay pausa activa.
// Uso: node tests/regresion/cole.js <carpeta web>
const L = require('./lib');
const [raiz] = process.argv.slice(2);
const R = L.registro('cole');
(async () => {
  const srv = L.servir(raiz),
    b = await L.navegador();
  const p = await L.abrir(b, srv.port, { rapido: true });
  await p.evaluate(() => {
    const S = __cl.S;
    S.intro = true;
    S.age = 3;
    S.first.askedName = 1;
    save();
  });
  const escena = () => p.evaluate(() => __cl.name);
  // caso(id, titulo, fn): ejecuta fn; fn devuelve un texto si algo falla.
  const caso = async (id, titulo, fn) => {
    try {
      const prob = await fn();
      if (prob) {
        R.apuntar(id, 'alta', titulo, { problema: prob, errores: p.errs.slice(0, 3) });
        await R.captura(p, id + '.png');
      } else R.bien(id, titulo);
    } catch (e) {
      R.apuntar(id, 'alta', titulo + ' (la prueba no pudo terminar)', String(e).split('\n')[0]);
    }
  };
  try {
    await caso('P1', 'el sitio del cole del mapa lleva al cole', async () => {
      await p.evaluate(() => __cl.go('map', {}));
      await p.waitForTimeout(2500);
      const z = await p.evaluate(() => mzOf('cole'));
      await L.clic(p, z.x, z.y);
      // en 3D, Tito anda primero hasta el sitio y luego se entra
      let e = 'map';
      for (let i = 0; i < 20 && e === 'map'; i++) {
        await p.waitForTimeout(500);
        e = await escena();
      }
      return e === 'cole' ? null : 'escena ' + e;
    });
    await caso('P2', 'las clases están en obras y el patio lleva al patio', async () => {
      if ((await escena()) !== 'cole') await p.evaluate(() => __cl.go('cole', {}));
      await p.waitForTimeout(1200);
      const [clases, patio] = await p.evaluate(() => [COLE_SITIOS[1], COLE_SITIOS[0]]);
      await L.clic(p, clases.x, clases.y);
      await p.waitForTimeout(600);
      if ((await escena()) !== 'cole') return 'las clases en obras han cambiado de escena';
      await L.clic(p, patio.x, patio.y);
      await p.waitForTimeout(1200);
      const e = await escena();
      return e === 'patio' ? null : 'escena ' + e;
    });
    await caso('P3', '«¡Estatuas!» se juega hasta el final, da 3 monedas y apunta la actividad', async () => {
      if ((await escena()) !== 'patio') await p.evaluate(() => __cl.go('patio', {}));
      await p.waitForTimeout(1200);
      const antes = await p.evaluate(() => __cl.S.coins || 0);
      const bt = await p.evaluate(() => BOTONES_PATIO.find((x) => x.a.id === 'estatuas'));
      await L.clic(p, bt.x + bt.w / 2, bt.y + bt.h / 2);
      await p.waitForTimeout(800);
      if ((await escena()) !== 'estatuas') return 'no se ha abierto el juego';
      // 4 rondas (3 años) de hasta 7 s de baile y 2,5 s de estatua, más lo que se tarda en hablar: menos de 90 s
      let cole = null;
      for (let i = 0; i < 120 && !cole; i++) {
        await p.waitForTimeout(1000);
        cole = await p.evaluate(() => __cl.S.cole || null);
      }
      if (!cole) return 'el juego no ha terminado en 2 minutos';
      await p.waitForTimeout(2500);
      const despues = await p.evaluate(() => __cl.S.coins || 0);
      if (despues - antes !== 3) return `monedas ${antes} -> ${despues}`;
      if (!(cole.veces && cole.veces.estatuas === 1 && cole.hechas.includes('estatuas')))
        return 'S.cole ' + JSON.stringify(cole);
      return null;
    });
    await caso('P4', 'la casa vuelve: estatuas -> patio -> cole -> mapa', async () => {
      const visto = [];
      for (let i = 0; i < 3; i++) {
        await L.clic(p, 85, 82); // el botón de la casa (HOME)
        await p.waitForTimeout(1200);
        visto.push(await escena());
      }
      return visto.join(',') === 'patio,cole,map' ? null : visto.join(' -> ');
    });
    await caso('P5', '«Tito dice» se juega hasta el final, apunta la actividad y la casa vuelve al patio', async () => {
      await p.evaluate(() => __cl.go('patio', {}));
      await p.waitForTimeout(1200);
      const bt = await p.evaluate(() => BOTONES_PATIO.find((x) => x.a.id === 'titoDice'));
      await L.clic(p, bt.x + bt.w / 2, bt.y + bt.h / 2);
      await p.waitForTimeout(800);
      if ((await escena()) !== 'titoDice') return 'no se ha abierto el juego';
      // 6 órdenes (3 años) de unos 4 s más lo que se tarda en hablar: menos de 2 minutos
      let veces = 0;
      for (let i = 0; i < 150 && !veces; i++) {
        await p.waitForTimeout(1000);
        veces = await p.evaluate(() => (__cl.S.cole && __cl.S.cole.veces.titoDice) || 0);
      }
      if (veces !== 1) return 'el juego no ha terminado en 150 s';
      await p.waitForTimeout(1500);
      await L.clic(p, 85, 82);
      await p.waitForTimeout(1200);
      const e = await escena();
      return e === 'patio' ? null : 'la casa lleva a ' + e;
    });
    await caso(
      'P6',
      'con 5 años, «Tito dice» tiene 8 órdenes y 3 trampas, nunca al principio ni seguidas',
      async () => {
        const planes = await p.evaluate(() =>
          Array.from({ length: 20 }, () => planDeOrdenes(5, Math.random).map((x) => x.trampa)),
        );
        const malo = planes.find(
          (t) => t.length !== 8 || t.filter(Boolean).length !== 3 || t[0] || t[1] || t.some((x, i) => x && t[i - 1]),
        );
        return malo ? 'plan ' + JSON.stringify(malo) : null;
      },
    );
    await caso('P7', 'el yoga del patio se hace hasta el final y lo apunta en S.cole', async () => {
      await p.evaluate(() => __cl.go('patio', {}));
      await p.waitForTimeout(1200);
      const bt = await p.evaluate(() => BOTONES_PATIO.find((x) => x.a.id === 'yoga'));
      await L.clic(p, bt.x + bt.w / 2, bt.y + bt.h / 2);
      await p.waitForTimeout(800);
      if ((await escena()) !== 'yoga') return 'no se ha abierto el yoga';
      // 3 posturas y 2 respiraciones (3 años) de 2 respiros de 6 s, más lo que se tarda en hablar: menos de 3 minutos
      let veces = 0;
      for (let i = 0; i < 180 && !veces; i++) {
        await p.waitForTimeout(1000);
        veces = await p.evaluate(() => (__cl.S.cole && __cl.S.cole.veces.yoga) || 0);
      }
      return veces === 1 ? null : 'el yoga no ha terminado en 3 minutos';
    });
    await caso('P8', 'a los 20 minutos, el mapa abre la pausa activa, que vuelve sola al mapa', async () => {
      await p.evaluate(() => {
        VIVO.sessionT = 20 * 60 + 5;
        VIVO.restAsked = true;
        VIVO.pausaHecha = false;
        __cl.go('map', {});
      });
      let e = 'map';
      for (let i = 0; i < 30 && e !== 'yoga'; i++) {
        await p.waitForTimeout(500);
        e = await escena();
      }
      if (e !== 'yoga') return 'no se ha abierto la pausa activa (escena ' + e + ')';
      for (let i = 0; i < 120 && e === 'yoga'; i++) {
        await p.waitForTimeout(1000);
        e = await escena();
      }
      return e === 'map' ? null : 'tras la pausa, escena ' + e;
    });
    await caso(
      'P9',
      'al irse a dormir, Tito deja un reto; la familia lo marca y Tito lo celebra con una pegatina',
      async () => {
        await p.evaluate(() => {
          delete __cl.S.retos;
          __cl.go('dormir', {});
        });
        await p.waitForTimeout(2500);
        const r = await p.evaluate(() => __cl.S.retos || null);
        if (!r || !r.id) return 'no se ha propuesto ningún reto';
        await p.evaluate(() => openAdult('resumen'));
        await p.waitForTimeout(500);
        const boton = p.locator('#a-reto-hecho');
        if (!(await boton.count())) return 'no está el botón «¡Lo ha hecho!» en el Resumen';
        await boton.click();
        await p.waitForTimeout(300);
        const hecho = await p.evaluate(() => __cl.S.retos.hecho && __cl.S.retos.n === 1);
        if (!hecho) return 'el reto no ha quedado hecho: ' + JSON.stringify(await p.evaluate(() => __cl.S.retos));
        const antes = await p.evaluate(() => (__cl.S.stk && __cl.S.stk.casa) || 0);
        await p.evaluate(() => {
          closeAdult();
          __cl.go('map', {});
        });
        let despues = antes;
        for (let i = 0; i < 30 && despues === antes; i++) {
          await p.waitForTimeout(500);
          despues = await p.evaluate(() => (__cl.S.stk && __cl.S.stk.casa) || 0);
        }
        if (despues !== antes + 1) return `pegatinas de la casa ${antes} -> ${despues}`;
        return (await p.evaluate(() => __cl.S.retos.celebrado)) ? null : 'el reto no ha quedado celebrado';
      },
    );
    await caso(
      'P10',
      'si la familia quita los juegos de moverse, el patio sale cerrado y no hay pausa activa',
      async () => {
        await p.evaluate(() => {
          __cl.S.sinMoverse = true;
          __cl.go('cole', {});
        });
        await p.waitForTimeout(1200);
        const patio = await p.evaluate(() => COLE_SITIOS[0]);
        await L.clic(p, patio.x, patio.y);
        await p.waitForTimeout(800);
        if ((await escena()) !== 'cole') return 'el patio cerrado ha abierto ' + (await escena());
        await p.evaluate(() => {
          VIVO.sessionT = 20 * 60 + 5;
          VIVO.restAsked = true;
          VIVO.pausaHecha = false;
          __cl.go('map', {});
        });
        await p.waitForTimeout(8000);
        const e = await escena();
        await p.evaluate(() => {
          delete __cl.S.sinMoverse;
          save();
        });
        return e === 'map' ? null : 'con los juegos quitados, el mapa ha abierto ' + e;
      },
    );
    await caso(
      'P11',
      'el autobús lleva a la granja escuela; se da de comer y se recogen huevos (la visita sigue)',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 3;
          delete __cl.S.exc;
          __cl.go('cole', {});
        });
        await p.waitForTimeout(1200);
        const bus = await p.evaluate(() => COLE_SITIOS[2]);
        await L.clic(p, bus.x, bus.y);
        await p.waitForTimeout(1000);
        if ((await escena()) !== 'autobus') return 'el autobús no ha abierto su escena: ' + (await escena());
        const d = await p.evaluate(() => DESTINOS.find((x) => x.e.id === 'granja'));
        await L.clic(p, d.x + d.w / 2, d.y + d.h / 2);
        let e = 'autobus';
        for (let i = 0; i < 20 && e === 'autobus'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'excursion') return 'el viaje no ha llegado a la granja: ' + e;
        await p.waitForTimeout(1500);
        const antes = await p.evaluate(() => __cl.S.coins || 0);
        // dar de comer: cada comida, a su animal
        const est = await p.evaluate(() => DESTINOS[0].e.estaciones[0]);
        await L.clic(p, est.x, est.y);
        await p.waitForTimeout(1200);
        if ((await escena()) !== 'granjaComer') return 'no se ha abierto «dar de comer»';
        const parejas = await p.evaluate(() =>
          ESTADO_GRANJA.comer.comidas.map((f) => {
            const a = ESTADO_GRANJA.comer.animales.find((x) => x.c.animal === f.c.animal);
            return [f.x0, f.y0, a.x, a.y + 110];
          }),
        );
        for (const [x1, y1, x2, y2] of parejas) {
          await L.arrastrar(p, x1, y1, x2, y2);
          await p.waitForTimeout(700);
        }
        for (let i = 0; i < 20 && (await escena()) === 'granjaComer'; i++) await p.waitForTimeout(500);
        if ((await escena()) !== 'excursion') return 'tras dar de comer, escena ' + (await escena());
        // recoger huevos: se tocan los montones con huevo
        const est2 = await p.evaluate(() => DESTINOS[0].e.estaciones[1]);
        await p.waitForTimeout(1500);
        await L.clic(p, est2.x, est2.y);
        await p.waitForTimeout(1200);
        if ((await escena()) !== 'granjaHuevos') return 'no se ha abierto «recoger huevos»';
        const montones = await p.evaluate(() =>
          ESTADO_GRANJA.huevos.montones.filter((m) => m.huevo).map((m) => [m.x, m.y - 30]),
        );
        for (const [x, y] of montones) {
          await L.clic(p, x, y);
          await p.waitForTimeout(600);
        }
        for (let i = 0; i < 20 && (await escena()) === 'granjaHuevos'; i++) await p.waitForTimeout(500);
        if ((await escena()) !== 'excursion') return 'tras los huevos, escena ' + (await escena());
        const v = await p.evaluate(() => __cl.S.exc && __cl.S.exc.granja);
        return v && v.vistas.length === 2 && !v.veces && (await p.evaluate(() => __cl.S.coins || 0)) === antes
          ? null
          : 'tras dos estaciones: ' + JSON.stringify(v);
      },
    );
    await caso(
      'P12',
      'en la granja se hace queso, se cepilla al caballo, se cosecha el huerto y se pasea en tractor; la foto da 5 monedas',
      async () => {
        const antes = await p.evaluate(() => __cl.S.coins || 0);
        // pant(x, y): de la pantalla del juego (1600x900) a la de la página, para el ratón de verdad.
        const pant = (x, y) => p.evaluate(([x, y]) => [OX + x * SC, OY + y * SC], [x, y]);
        // abrirEstacion(i, nombre): toca la estación i del plano y comprueba que se abre su escena.
        const abrirEstacion = async (i, nombre) => {
          await p.waitForTimeout(1500);
          const est = await p.evaluate((i) => DESTINOS[0].e.estaciones[i], i);
          await L.clic(p, est.x, est.y);
          await p.waitForTimeout(1200);
          return (await escena()) === nombre ? null : 'no se ha abierto ' + nombre + ': ' + (await escena());
        };
        // alPlano(nombre): espera a que la estación termine y se vuelva al plano.
        const alPlano = async (nombre) => {
          for (let i = 0; i < 30 && (await escena()) === nombre; i++) await p.waitForTimeout(500);
          return (await escena()) === 'excursion' ? null : 'tras ' + nombre + ', escena ' + (await escena());
        };
        let mal = await abrirEstacion(2, 'granjaQueso');
        if (mal) return mal;
        const Q = await p.evaluate(() => QUESO);
        for (let i = 0; i < 5; i++) {
          await L.clic(p, Q.ubre.x, Q.ubre.y + 20);
          await p.waitForTimeout(300);
        }
        await p.waitForTimeout(800);
        if ((await p.evaluate(() => ESTADO_TALLERES.queso.paso)) !== 1) return 'ordeñar no pasa a remover';
        const pasos = Array.from({ length: 4 * 24 + 1 }, (_, i) => (i / 24) * Math.PI * 2);
        const [cx, cy] = [Q.olla.x, Q.olla.y - 80];
        const [a0, b0] = await pant(cx + 120, cy);
        await p.mouse.move(a0, b0);
        await p.mouse.down();
        for (const a of pasos) {
          const [x, y] = await pant(cx + Math.cos(a) * 120, cy + Math.sin(a) * 60);
          await p.mouse.move(x, y);
        }
        await p.mouse.up();
        await p.waitForTimeout(800);
        if ((await p.evaluate(() => ESTADO_TALLERES.queso.paso)) !== 2) return 'remover no pasa al molde';
        for (let i = 0; i < 4; i++) {
          await L.clic(p, Q.molde.x, Q.molde.y - 200);
          await p.waitForTimeout(300);
        }
        mal = await alPlano('granjaQueso');
        if (mal) return mal;
        // cepillar: se frota cada mancha yendo y viniendo
        mal = await abrirEstacion(3, 'granjaCepillar');
        if (mal) return mal;
        const manchas = await p.evaluate(() => ESTADO_TALLERES.cepillo.manchas.map((m) => [m.x, m.y]));
        for (const [x, y] of manchas) {
          const [a, b] = await pant(x - 40, y);
          const [c] = await pant(x + 40, y);
          await p.mouse.move(a, b);
          await p.mouse.down();
          for (let k = 0; k < 4; k++) {
            await p.mouse.move(c, b, { steps: 6 });
            await p.mouse.move(a, b, { steps: 6 });
          }
          await p.mouse.up();
        }
        mal = await alPlano('granjaCepillar');
        if (mal) return mal;
        // el huerto: sembrar, regar y, cuando crecen, recoger
        mal = await abrirEstacion(4, 'granjaHuerto');
        if (mal) return mal;
        const hoyos = await p.evaluate(() => ESTADO_TALLERES.huerto.hoyos.map((h) => [h.x, h.y - 30]));
        for (let fase = 0; fase < 3; fase++) {
          for (const [x, y] of hoyos) {
            await L.clic(p, x, y);
            await p.waitForTimeout(400);
          }
          for (let i = 0; i < 30 && fase === 1 && (await p.evaluate(() => ESTADO_TALLERES.huerto.fase)) !== 3; i++)
            await p.waitForTimeout(500);
        }
        mal = await alPlano('granjaHuerto');
        if (mal) return mal;
        // el tractor: se toca cada bala y se espera a que la suba
        mal = await abrirEstacion(5, 'granjaTractor');
        if (mal) return mal;
        const balas = await p.evaluate(() => ESTADO_TALLERES.tractor.balas.map((b) => [b.x, b.y]));
        for (const [x, y] of balas) {
          await L.clic(p, x, y);
          for (let i = 0; i < 20 && (await p.evaluate(() => !!ESTADO_TALLERES.tractor.va)); i++)
            await p.waitForTimeout(300);
        }
        mal = await alPlano('granjaTractor');
        if (mal) return mal;
        let veces = 0;
        for (let i = 0; i < 20 && !veces; i++) {
          await p.waitForTimeout(500);
          veces = await p.evaluate(() => (__cl.S.exc && __cl.S.exc.granja && __cl.S.exc.granja.veces) || 0);
        }
        if (veces !== 1) return 'la visita no ha terminado: ' + JSON.stringify(await p.evaluate(() => __cl.S.exc));
        await p.waitForTimeout(2500);
        const despues = await p.evaluate(() => __cl.S.coins || 0);
        return despues - antes === 5 ? null : `monedas ${antes} -> ${despues}`;
      },
    );
    await caso(
      'P13',
      'por la granja pasean animales que saltan al tocarlos; la foto da la pegatina y queda en el álbum del autobús',
      async () => {
        if (!(await p.evaluate(() => (__cl.S.stk.vaca || 0) >= 1))) return 'la primera visita no ha dado la pegatina';
        await p.evaluate(() => __cl.go('excursion', { exc: 'granja' }));
        await p.waitForTimeout(1500);
        const a0 = await p.evaluate(() => PASEO.animales.map((a) => [a.x, a.y]));
        if (a0.length !== 7) return 'animales paseando: ' + a0.length;
        await p.waitForTimeout(3000);
        const a1 = await p.evaluate(() => PASEO.animales.map((a) => [a.x, a.y]));
        if (!a1.some(([x, y], i) => x !== a0[i][0] || y !== a0[i][1])) return 'los animales no se mueven';
        // se para a un animal lejos de las estaciones y del guía, y se toca
        await p.evaluate(() => Object.assign(PASEO.animales[3], { x: 800, y: 820, tx: 800, ty: 820, hasta: 1e9 }));
        await L.clic(p, 800, 780);
        await p.waitForTimeout(200);
        const salto = await p.evaluate(() => T - PASEO.animales[3].salto);
        if (!(salto >= 0 && salto < 1)) return 'el animal tocado no salta';
        await p.evaluate(() => __cl.go('autobus', {}));
        await p.waitForTimeout(1500);
        const b = await p.evaluate(() => ALBUM_EXC_BOTON);
        await L.clic(p, b.x, b.y);
        await p.waitForTimeout(800);
        if ((await escena()) !== 'albumExcursiones') return 'el botón del álbum no abre el álbum: ' + (await escena());
        const m = await p.evaluate(() => MARCOS_ALBUM.find((z) => z.e.id === 'granja'));
        await L.clic(p, m.x + m.w / 2, m.y + m.h / 2);
        await p.waitForTimeout(500);
        await L.clic(p, 80, 80);
        await p.waitForTimeout(800);
        return (await escena()) === 'autobus' ? null : 'la casa del álbum no vuelve al autobús: ' + (await escena());
      },
    );
    if (p.errs.length) R.apuntar('P0', 'alta', 'errores de JavaScript', p.errs.slice(0, 3));
    else R.bien('P0', 'sin errores de JavaScript');
  } finally {
    R.guardar();
    await b.close();
    srv.close();
  }
})();
