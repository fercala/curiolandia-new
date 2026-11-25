// Comprueba el cole y su patio (fase P1 de docs/IDEAS-MEJORA.md) con el ratón de verdad: desde el mapa (3D) se llega al
// cole tocando su sitio (Tito anda hasta él y entra); del cole al patio y a las clases (desde la P27; antes estaban en obras), cuya casa vuelve al cole;
// del patio a «¡Estatuas!», que se juega sola hasta el final (Tito baila, para la música, estatua... en todas las rondas)
// y da 3 monedas y apunta la actividad en S.cole; la casa vuelve de cada escena a la de antes (estatuas -> patio ->
// cole -> mapa); y «Tito dice» (fase P2) se juega solo hasta el final y lo apunta, y su plan con 5 años tiene sus 3
// trampas bien puestas; el yoga (fase P3) se hace solo hasta el final y lo apunta, y a los 20 minutos el mapa abre la
// pausa activa, que vuelve sola al mapa; al irse a dormir, Tito deja un reto en casa que la familia marca en la zona de
// adultos y Tito celebra con una pegatina (fase P4); y sin juegos de moverse, el patio cierra y no hay pausa activa.
// Y las carreras del patio en 3D (fase P10): con 5 años, siguiendo la ayuda, se salta todo, se va por el lado bueno del
// cruce, se cogen los números del 1 al 5, Tito gana, da 3 monedas y lo apunta; «otra vez» empieza otra y la casa vuelve.
// Y el día del deporte (fase P11): con 4 años, siguiendo la ayuda, las cinco pruebas seguidas dan cinco oros, el
// medallero, la copa de la semana (S.deporte) y 3 monedas; «otra vez» empieza otra jornada y la casa vuelve al patio.
// Y los juegos cortos del patio (fase P12a): desde su menú, la rayuela y los columpios se juegan solos hasta el final
// siguiendo la ayuda, dan 3 monedas cada uno y se apuntan. Y lo mismo con los penaltis y las pompas (fase P12b), con la
// cometa y el pañuelo (fase P12c) y con las sillas musicales, sin eliminar a nadie (fase P12d). Y el escondite (fase
// P13a): con 5 años, Tito cuenta y encuentra a los cuatro amigos con las pistas (un sitio vacío no vale) y Lupi lo
// encuentra a él en la casita, y los botones del patio van en dos filas. Y el circuito (fase P13b): con 4 años, tres
// vueltas de tres obstáculos que el niño toca en el orden de la profe (uno que no va no cuenta) y Tito recorre. Y el zoo
// (fase P17): el autobús lleva al zoo, sus cinco recintos se juegan siguiendo la ayuda hasta el dato curioso de Nico, la
// foto de grupo da 5 monedas y la pegatina del león, y con la cámara se le hace una foto a la jirafa que pasea (o al animal que la tape).
// Y el acuario (fase P18): sus cinco salas se juegan siguiendo la ayuda hasta el dato curioso de Marina, y la foto de
// grupo da 5 monedas y la pegatina del delfín. Y el tiempo de verdad (fase P26, P33): los charcos con lluvia, hasta el
// arcoíris, y el muñeco de nieve y la guerra de bolas con nieve. Y las clases del cole con el rincón de las
// construcciones (fase P27, P34): copiar la torre, la casa del animal, contar y construir libre, que se lleva al jardín.
// El tren de Curiolandia (fase P28, P35): de la estación del mapa a la vuelta entera con sus túneles, paradas y animales.
// La linterna de noche (fase P29, P36): de la tienda de campaña del mapa a buscar con la luz a los animales de la noche.
// Y los amigos de Tito (fase P31, P37): Lupi y Polly pasean por el mapa y uno pide ayuda para encontrar lo que ha perdido.
// Y «Programa a Tito» (fase P32, P38): en el rincón de la lógica, la tarjeta que falla sale roja y los tres tableros dan 2 monedas.
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
      // en 3D, Tito anda primero hasta el sitio y luego se entra. Sin tarjeta gráfica (GitHub Actions dibuja el 3D con la
      // CPU) el mapa va a pocos cuadros por segundo y se tarda: aquí, unos 5 s; en Actions, a veces más de 10. Se esperan
      // hasta 30 s (con la CPU frenada 3 o 4 veces, unos 11 s; con el código de antes de la fase P9, igual).
      let e = 'map';
      for (let i = 0; i < 60 && e === 'map'; i++) {
        await p.waitForTimeout(500);
        e = await escena();
      }
      return e === 'cole' ? null : 'escena ' + e;
    });
    await caso(
      'P2',
      'las clases llevan a las clases (desde la P27), su casa vuelve al cole y el patio lleva al patio',
      async () => {
        if ((await escena()) !== 'cole') await p.evaluate(() => __cl.go('cole', {}));
        await p.waitForTimeout(1200);
        const [clases, patio] = await p.evaluate(() => [COLE_SITIOS[1], COLE_SITIOS[0]]);
        await L.clic(p, clases.x, clases.y);
        await p.waitForTimeout(1200);
        if ((await escena()) !== 'clases') return 'las clases no llevan a las clases: ' + (await escena());
        await L.clic(p, 80, 80);
        await p.waitForTimeout(1200);
        if ((await escena()) !== 'cole') return 'la casa de las clases no vuelve al cole';
        await L.clic(p, patio.x, patio.y);
        await p.waitForTimeout(1200);
        const e = await escena();
        return e === 'patio' ? null : 'escena ' + e;
      },
    );
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
        // se deja la pausa activa como ya hecha: si no, al volver los juegos de moverse saltaría en el mapa de otro caso
        await p.evaluate(() => {
          delete __cl.S.sinMoverse;
          VIVO.pausaHecha = true;
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
    await caso(
      'P14',
      'el manzano de la granja cuenta un día por visita y, con 7 días, tiene manzanas que caen al tocarlo',
      async () => {
        const dias = () => p.evaluate(() => (__cl.S.crece && __cl.S.crece['granja:manzano']) || null);
        const hoy = await dias();
        if (!hoy || hoy.dias !== 1) return 'tras la primera visita, el manzano: ' + JSON.stringify(hoy);
        // otra vez hoy: no suma
        await p.evaluate(() => __cl.go('excursion', { exc: 'granja' }));
        await p.waitForTimeout(1000);
        if ((await dias()).dias !== 1) return 'el mismo día ha contado dos veces';
        // como si hubiera venido 6 días antes: hoy cuenta el 7.º y salen manzanas
        await p.evaluate(() => {
          __cl.S.crece['granja:manzano'] = { dias: 6, dia: '2000-01-01' };
          __cl.go('excursion', { exc: 'granja' });
        });
        await p.waitForTimeout(1500);
        if ((await dias()).dias !== 7) return 'otro día no ha contado: ' + JSON.stringify(await dias());
        if ((await p.evaluate(() => etapaManzano())) !== 4) return 'con 7 días no tiene manzanas';
        await p.evaluate(() =>
          PASEO.animales.forEach((a) => Object.assign(a, { x: 300, y: 820, tx: 300, ty: 820, hasta: 1e9 })),
        );
        const m = await p.evaluate(() => MANZANO_SITIO);
        await L.clic(p, m.x, m.y - 150);
        await p.waitForTimeout(300);
        return (await escena()) === 'excursion' ? null : 'tocar el manzano ha cambiado de escena';
      },
    );
    await caso(
      'P15',
      'en la granja nacen crías (se destapan y se les pone nombre), pasean con su madre y se juega a cada cría con su mamá',
      async () => {
        // nacer(nombre): toca la estrella, destapa la cría con tres toques y elige el primer nombre
        const nacer = async () => {
          await p.evaluate(() => __cl.go('excursion', { exc: 'granja' }));
          await p.waitForTimeout(1500);
          const e = await p.evaluate(() => CRIA_ESTRELLA);
          await L.clic(p, e.x, e.y);
          await p.waitForTimeout(1200);
          if ((await escena()) !== 'granjaNace') return 'la estrella no abre el nacimiento: ' + (await escena());
          const n = await p.evaluate(() => ESTADO_CRIAS.NIDO);
          for (let i = 0; i < 3; i++) {
            await L.clic(p, n.x, n.y - 60);
            await p.waitForTimeout(300);
          }
          await p.waitForTimeout(800);
          const t = await p.evaluate(() => ESTADO_CRIAS.tarjeta(0));
          await L.clic(p, t.x + t.w / 2, t.y + t.h / 2);
          for (let i = 0; i < 30 && (await escena()) === 'granjaNace'; i++) await p.waitForTimeout(500);
          return (await escena()) === 'excursion' ? null : 'tras el nombre, escena ' + (await escena());
        };
        let mal = await nacer();
        if (mal) return mal;
        mal = await nacer();
        if (mal) return mal;
        const crias = await p.evaluate(() => __cl.S.crias);
        if (!crias || !crias.pollito || crias.pollito.nombre !== 'Pío' || !crias.cordero)
          return 'crías guardadas: ' + JSON.stringify(crias);
        await p.waitForTimeout(1500);
        const enPaseo = await p.evaluate(() => PASEO.animales.filter((a) => a.cria).map((a) => a.cria));
        if (enPaseo.length !== 2) return 'crías paseando: ' + JSON.stringify(enPaseo);
        const b = await p.evaluate(() => FAMILIAS_BOTON);
        await L.clic(p, b.x, b.y);
        await p.waitForTimeout(1200);
        if ((await escena()) !== 'granjaFamilias') return 'el botón de las familias no abre su juego';
        const parejas = await p.evaluate(() =>
          ESTADO_CRIAS.familias.crias.map((f) => {
            const m = ESTADO_CRIAS.familias.madres.find((z) => z.c.id === f.c.id);
            return [f.x0, f.y0 - 50, m.x, m.y - 120];
          }),
        );
        for (const [x1, y1, x2, y2] of parejas) {
          await L.arrastrar(p, x1, y1, x2, y2);
          await p.waitForTimeout(700);
        }
        for (let i = 0; i < 20 && (await escena()) === 'granjaFamilias'; i++) await p.waitForTimeout(500);
        return (await escena()) === 'excursion' ? null : 'las familias no terminan: ' + (await escena());
      },
    );
    await caso(
      'P16',
      'con 5 años, las carreras del patio se corren hasta la meta saltando, por el cruce y con los números; podio y monedas',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 5;
          save();
          __cl.go('patio', {});
        });
        await p.waitForTimeout(1200);
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        const bt = await p.evaluate(() => BOTONES_PATIO.find((x) => x.a.id === 'carreras'));
        await L.clic(p, bt.x + bt.w / 2, bt.y + bt.h / 2);
        await p.waitForTimeout(1500);
        if ((await escena()) !== 'carreras') return 'el botón de las carreras no abre la carrera: ' + (await escena());
        // un niño que hace caso a la ayuda: en cada cuadro, si la escena pide un toque (saltar o el lado del cruce), lo da
        await p.evaluate(() => {
          const f = () => {
            if (__cl.name !== 'carreras') return;
            const sc = __cl.scene,
              h = sc.hint && sc.hint();
            if (h && sc.c.fase !== 'fin') sc.down(h.x, h.y);
            requestAnimationFrame(f);
          };
          requestAnimationFrame(f);
        });
        // unos 20 s de carrera; sin tarjeta gráfica (GitHub Actions) el 3D va a pocos cuadros y se tarda más
        let c = null;
        for (let i = 0; i < 360 && !(c && c.fase === 'fin'); i++) {
          await p.waitForTimeout(500);
          c = await p.evaluate(() => {
            const e = __cl.scene && __cl.scene.c;
            return (
              e && {
                fase: e.fase,
                orden: e.orden,
                numeros: e.numeros,
                tropiezos: e.tropiezos,
                lado: e.lado,
                bueno: e.plan.cruce && e.plan.cruce.bueno,
              }
            );
          });
        }
        if (!c || c.fase !== 'fin') return 'la carrera no ha terminado: ' + JSON.stringify(c);
        if (c.lado !== c.bueno) return 'en el cruce no ha ido por el lado de las estrellas: ' + JSON.stringify(c);
        if (c.numeros.join() !== '1,2,3,4,5') return 'números cogidos: ' + c.numeros.join();
        if (c.tropiezos || c.orden[0] !== 'tito') return 'saltando todo, Tito no gana: ' + JSON.stringify(c);
        await p.waitForTimeout(2500);
        const [despues, cole] = await p.evaluate(() => [__cl.S.coins || 0, __cl.S.cole]);
        if (despues - monedas !== 3) return `monedas ${monedas} -> ${despues}`;
        if (!cole || !cole.veces || cole.veces.carreras !== 1) return 'S.cole: ' + JSON.stringify(cole);
        await p.evaluate(() => __cl.scene.down(1000, 700));
        await p.waitForTimeout(800);
        const otra = await p.evaluate(() => __cl.scene.c.fase);
        if (otra !== 'salida' && otra !== 'corre') return 'el botón de otra vez no empieza otra carrera: ' + otra;
        await L.clic(p, 90, 90);
        await p.waitForTimeout(800);
        return (await escena()) === 'patio' ? null : 'la casa no vuelve al patio: ' + (await escena());
      },
    );
    await caso(
      'P17',
      'con 4 años, el día del deporte: las cinco pruebas seguidas, sus medallas, el medallero, la copa y las monedas',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 4;
          delete __cl.S.deporte;
          save();
          __cl.go('patio', {});
        });
        await p.waitForTimeout(1200);
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        const bt = await p.evaluate(() => BOTONES_PATIO.find((x) => x.a.id === 'deporte'));
        if (!bt) return 'no hay botón del día del deporte en el patio';
        await L.clic(p, bt.x + bt.w / 2, bt.y + bt.h / 2);
        await p.waitForTimeout(1500);
        if ((await escena()) !== 'deporte') return 'el botón no abre el día del deporte: ' + (await escena());
        // un niño que hace caso a la ayuda en todas las pruebas (con un respiro entre toques), hasta el medallero
        await p.evaluate(() => {
          let ultimo = 0;
          const f = () => {
            if (JORNADA.fin) return;
            const sc = __cl.scene,
              h = sc && sc.hint && sc.hint(),
              ahora = performance.now();
            if (h && !(sc.c && sc.c.fase === 'fin') && ahora - ultimo > 150) {
              ultimo = ahora;
              sc.down(h.x, h.y);
            }
            requestAnimationFrame(f);
          };
          requestAnimationFrame(f);
        });
        // unos dos minutos de jornada; sin tarjeta gráfica (GitHub Actions) la carrera en 3D tarda más
        let j = null;
        for (let i = 0; i < 1200 && !(j && j.fin); i++) {
          await p.waitForTimeout(500);
          j = await p.evaluate(() => ({ medallas: JORNADA.medallas, fin: JORNADA.fin, escena: __cl.name }));
        }
        if (!j || !j.fin) return 'la jornada no termina: ' + JSON.stringify(j);
        const ids = Object.keys(j.medallas).sort().join();
        if (ids !== 'carrera,equilibrio,punteria,relevos,salto') return 'pruebas con medalla: ' + ids;
        if (Object.values(j.medallas).some((m) => m !== 'oro'))
          return 'haciendo caso a la ayuda no son todas de oro: ' + JSON.stringify(j.medallas);
        if (j.escena !== 'deporte') return 'el medallero no está en la jornada: ' + j.escena;
        await p.waitForTimeout(2500);
        const [despues, cole, dep] = await p.evaluate(() => [__cl.S.coins || 0, __cl.S.cole, __cl.S.deporte]);
        if (despues - monedas !== 3) return `monedas ${monedas} -> ${despues}`;
        if (!cole || !cole.veces || cole.veces.deporte !== 1) return 'S.cole: ' + JSON.stringify(cole);
        if (!dep || dep.copas !== 1 || !dep.semana) return 'S.deporte: ' + JSON.stringify(dep);
        await p.evaluate(() => __cl.scene.down(1000, 700));
        await p.waitForTimeout(800);
        const nueva = await p.evaluate(() => [JORNADA.fin, Object.keys(JORNADA.medallas).length]);
        if (nueva[0] || nueva[1]) return 'el botón de otra vez no empieza otra jornada: ' + JSON.stringify(nueva);
        await L.clic(p, 90, 90);
        await p.waitForTimeout(800);
        return (await escena()) === 'patio' ? null : 'la casa no vuelve al patio: ' + (await escena());
      },
    );
    await caso(
      'P18',
      'con 4 años, los juegos cortos del patio: la rayuela y los columpios se juegan hasta el final, con sus monedas',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 4;
          save();
          __cl.go('patio', {});
        });
        await p.waitForTimeout(1200);
        const bt = await p.evaluate(() => BOTONES_PATIO.find((x) => x.a.id === 'juegosCortos'));
        if (!bt) return 'no hay botón de juegos cortos en el patio';
        await L.clic(p, bt.x + bt.w / 2, bt.y + bt.h / 2);
        await p.waitForTimeout(1500);
        if ((await escena()) !== 'juegosCortos') return 'el botón no abre los juegos cortos: ' + (await escena());
        for (const id of ['rayuela', 'columpios']) {
          const monedas = await p.evaluate(() => __cl.S.coins || 0);
          const t = await p.evaluate((i) => TARJETAS_CORTOS.find((x) => x.j.id === i), id);
          await L.clic(p, t.x + t.w / 2, t.y + t.h / 2);
          await p.waitForTimeout(1500);
          if ((await escena()) !== id) return `la tarjeta de ${id} lleva a: ` + (await escena());
          // un niño que hace caso a la ayuda (con un respiro entre toques), hasta el final
          await p.evaluate((i) => {
            let ultimo = 0;
            const f = () => {
              if (__cl.name !== i) return;
              const sc = __cl.scene,
                st = i === 'rayuela' ? RAYUELA_ST : COLUMPIO_ST,
                h = sc.hint && sc.hint(),
                ahora = performance.now();
              if (st.fase === 'fin') return;
              if (h && ahora - ultimo > 200) {
                ultimo = ahora;
                sc.down(h.x, h.y);
              }
              requestAnimationFrame(f);
            };
            requestAnimationFrame(f);
          }, id);
          let st = null;
          for (let i = 0; i < 240 && !(st && st.fase === 'fin'); i++) {
            await p.waitForTimeout(500);
            st = await p.evaluate((i) => {
              const s = i === 'rayuela' ? RAYUELA_ST : COLUMPIO_ST;
              return { fase: s.fase, ronda: s.ronda, hechos: s.hechos };
            }, id);
          }
          if (!st || st.fase !== 'fin') return `${id} no termina: ` + JSON.stringify(st);
          if (id === 'rayuela' && st.ronda !== 3) return 'la rayuela acaba sin sus tres rondas: ' + JSON.stringify(st);
          if (id === 'columpios' && st.hechos !== 6)
            return 'con 4 años, el columpio sube con 6 empujones: ' + st.hechos;
          await p.waitForTimeout(2500);
          const [despues, cole] = await p.evaluate(() => [__cl.S.coins || 0, __cl.S.cole]);
          if (despues - monedas !== 3) return `${id}: monedas ${monedas} -> ${despues}`;
          if (!cole || !cole.veces || cole.veces[id] !== 1) return `${id}: S.cole ` + JSON.stringify(cole);
          await p.evaluate(() => __cl.scene.down(1000, 700));
          await p.waitForTimeout(800);
          const otra = await p.evaluate((i) => (i === 'rayuela' ? RAYUELA_ST : COLUMPIO_ST).fase, id);
          if (otra === 'fin') return `el botón de otra vez no vuelve a empezar ${id}`;
          await L.clic(p, 90, 90);
          await p.waitForTimeout(1000);
          if ((await escena()) !== 'juegosCortos') return `la casa de ${id} no vuelve a los juegos cortos`;
        }
        await L.clic(p, 90, 90);
        await p.waitForTimeout(800);
        return (await escena()) === 'patio'
          ? null
          : 'la casa de los juegos cortos no vuelve al patio: ' + (await escena());
      },
    );
    await caso('P19', 'con 4 años, los penaltis y las pompas se juegan hasta el final, con sus monedas', async () => {
      await p.evaluate(() => {
        __cl.S.age = 4;
        save();
        __cl.go('patio', {});
      });
      await p.waitForTimeout(1200);
      const bt = await p.evaluate(() => BOTONES_PATIO.find((x) => x.a.id === 'juegosCortos'));
      if (!bt) return 'no hay botón de juegos cortos en el patio';
      await L.clic(p, bt.x + bt.w / 2, bt.y + bt.h / 2);
      await p.waitForTimeout(1500);
      if ((await escena()) !== 'juegosCortos') return 'el botón no abre los juegos cortos: ' + (await escena());
      for (const id of ['penaltis', 'pompas']) {
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        const t = await p.evaluate((i) => TARJETAS_CORTOS.find((x) => x.j.id === i), id);
        await L.clic(p, t.x + t.w / 2, t.y + t.h / 2);
        await p.waitForTimeout(1500);
        if ((await escena()) !== id) return `la tarjeta de ${id} lleva a: ` + (await escena());
        // un niño que hace caso a la ayuda (con un respiro entre toques), hasta el final
        await p.evaluate((i) => {
          let ultimo = 0;
          const f = () => {
            if (__cl.name !== i) return;
            const sc = __cl.scene,
              st = i === 'penaltis' ? PENALTIS_ST : POMPAS_ST,
              h = sc.hint && sc.hint(),
              ahora = performance.now();
            if (st.fase === 'fin') return;
            if (h && ahora - ultimo > 200) {
              ultimo = ahora;
              sc.down(h.x, h.y);
            }
            requestAnimationFrame(f);
          };
          requestAnimationFrame(f);
        }, id);
        let st = null;
        for (let i = 0; i < 240 && !(st && st.fase === 'fin'); i++) {
          await p.waitForTimeout(500);
          st = await p.evaluate((i) => {
            const s = i === 'penaltis' ? PENALTIS_ST : POMPAS_ST;
            return { fase: s.fase, ronda: s.ronda, tiros: s.tiros };
          }, id);
        }
        if (!st || st.fase !== 'fin') return `${id} no termina: ` + JSON.stringify(st);
        if (id === 'rayuela' && st.ronda !== 3) return 'la rayuela acaba sin sus tres rondas: ' + JSON.stringify(st);
        if (id === 'columpios' && st.hechos !== 6) return 'con 4 años, el columpio sube con 6 empujones: ' + st.hechos;
        await p.waitForTimeout(2500);
        const [despues, cole] = await p.evaluate(() => [__cl.S.coins || 0, __cl.S.cole]);
        if (despues - monedas !== 3) return `${id}: monedas ${monedas} -> ${despues}`;
        if (!cole || !cole.veces || cole.veces[id] !== 1) return `${id}: S.cole ` + JSON.stringify(cole);
        await p.evaluate(() => __cl.scene.down(1000, 700));
        await p.waitForTimeout(800);
        const otra = await p.evaluate((i) => (i === 'penaltis' ? PENALTIS_ST : POMPAS_ST).fase, id);
        if (otra === 'fin') return `el botón de otra vez no vuelve a empezar ${id}`;
        await L.clic(p, 90, 90);
        await p.waitForTimeout(1000);
        if ((await escena()) !== 'juegosCortos') return `la casa de ${id} no vuelve a los juegos cortos`;
      }
      await L.clic(p, 90, 90);
      await p.waitForTimeout(800);
      return (await escena()) === 'patio'
        ? null
        : 'la casa de los juegos cortos no vuelve al patio: ' + (await escena());
    });
    await caso('P20', 'con 4 años, la cometa y el pañuelo se juegan hasta el final, con sus monedas', async () => {
      await p.evaluate(() => {
        __cl.S.age = 4;
        save();
        __cl.go('patio', {});
      });
      await p.waitForTimeout(1200);
      const bt = await p.evaluate(() => BOTONES_PATIO.find((x) => x.a.id === 'juegosCortos'));
      if (!bt) return 'no hay botón de juegos cortos en el patio';
      await L.clic(p, bt.x + bt.w / 2, bt.y + bt.h / 2);
      await p.waitForTimeout(1500);
      if ((await escena()) !== 'juegosCortos') return 'el botón no abre los juegos cortos: ' + (await escena());
      for (const id of ['cometa', 'panuelo']) {
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        const t = await p.evaluate((i) => TARJETAS_CORTOS.find((x) => x.j.id === i), id);
        await L.clic(p, t.x + t.w / 2, t.y + t.h / 2);
        await p.waitForTimeout(1500);
        if ((await escena()) !== id) return `la tarjeta de ${id} lleva a: ` + (await escena());
        // un niño que hace caso a la ayuda (con un respiro entre toques), hasta el final
        await p.evaluate((i) => {
          let ultimo = 0;
          const f = () => {
            if (__cl.name !== i) return;
            const sc = __cl.scene,
              st = i === 'cometa' ? COMETA_ST : PANUELO_ST,
              h = sc.hint && sc.hint(),
              ahora = performance.now();
            if (st.fase === 'fin') return;
            if (h && ahora - ultimo > 200) {
              ultimo = ahora;
              sc.down(h.x, h.y);
            }
            requestAnimationFrame(f);
          };
          requestAnimationFrame(f);
        }, id);
        let st = null;
        for (let i = 0; i < 240 && !(st && st.fase === 'fin'); i++) {
          await p.waitForTimeout(500);
          st = await p.evaluate((i) => {
            const s = i === 'cometa' ? COMETA_ST : PANUELO_ST;
            return { fase: s.fase, ronda: s.ronda, cogidas: s.cogidas, puntos: s.puntos };
          }, id);
        }
        if (!st || st.fase !== 'fin') return `${id} no termina: ` + JSON.stringify(st);
        if (id === 'cometa' && st.cogidas !== 5) return 'con 4 años, la cometa coge 5 estrellas: ' + JSON.stringify(st);
        if (id === 'panuelo' && st.puntos !== 4) return 'el pañuelo acaba sin sus cuatro puntos: ' + JSON.stringify(st);
        await p.waitForTimeout(2500);
        const [despues, cole] = await p.evaluate(() => [__cl.S.coins || 0, __cl.S.cole]);
        if (despues - monedas !== 3) return `${id}: monedas ${monedas} -> ${despues}`;
        if (!cole || !cole.veces || cole.veces[id] !== 1) return `${id}: S.cole ` + JSON.stringify(cole);
        await p.evaluate(() => __cl.scene.down(1000, 700));
        await p.waitForTimeout(800);
        const otra = await p.evaluate((i) => (i === 'cometa' ? COMETA_ST : PANUELO_ST).fase, id);
        if (otra === 'fin') return `el botón de otra vez no vuelve a empezar ${id}`;
        await L.clic(p, 90, 90);
        await p.waitForTimeout(1000);
        if ((await escena()) !== 'juegosCortos') return `la casa de ${id} no vuelve a los juegos cortos`;
      }
      await L.clic(p, 90, 90);
      await p.waitForTimeout(800);
      return (await escena()) === 'patio'
        ? null
        : 'la casa de los juegos cortos no vuelve al patio: ' + (await escena());
    });
    await caso(
      'P21',
      'con 4 años, las sillas musicales se juegan hasta el final, sin eliminar a nadie, con sus monedas',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 4;
          save();
          __cl.go('patio', {});
        });
        await p.waitForTimeout(1200);
        const bt = await p.evaluate(() => BOTONES_PATIO.find((x) => x.a.id === 'juegosCortos'));
        if (!bt) return 'no hay botón de juegos cortos en el patio';
        await L.clic(p, bt.x + bt.w / 2, bt.y + bt.h / 2);
        await p.waitForTimeout(1500);
        if ((await escena()) !== 'juegosCortos') return 'el botón no abre los juegos cortos: ' + (await escena());
        for (const id of ['sillas']) {
          const monedas = await p.evaluate(() => __cl.S.coins || 0);
          const t = await p.evaluate((i) => TARJETAS_CORTOS.find((x) => x.j.id === i), id);
          await L.clic(p, t.x + t.w / 2, t.y + t.h / 2);
          await p.waitForTimeout(1500);
          if ((await escena()) !== id) return `la tarjeta de ${id} lleva a: ` + (await escena());
          // un niño que hace caso a la ayuda (con un respiro entre toques), hasta el final
          await p.evaluate((i) => {
            let ultimo = 0;
            const f = () => {
              if (__cl.name !== i) return;
              const sc = __cl.scene,
                st = SILLAS_ST,
                h = sc.hint && sc.hint(),
                ahora = performance.now();
              if (st.fase === 'fin') return;
              if (h && ahora - ultimo > 200) {
                ultimo = ahora;
                sc.down(h.x, h.y);
              }
              requestAnimationFrame(f);
            };
            requestAnimationFrame(f);
          }, id);
          let st = null;
          for (let i = 0; i < 240 && !(st && st.fase === 'fin'); i++) {
            await p.waitForTimeout(500);
            st = await p.evaluate(() => {
              const s = SILLAS_ST;
              return { fase: s.fase, ronda: s.ronda, amigos: s.amigos, sillas: s.rondas.map((r) => r.sillas) };
            }, id);
          }
          if (!st || st.fase !== 'fin') return `${id} no termina: ` + JSON.stringify(st);
          if (st.ronda !== 4 || st.amigos !== 5 || st.sillas.join() !== '5,4,3,2')
            return 'con 4 años, las sillas: cuatro rondas de 5 a 2 sillas con 5 amigos: ' + JSON.stringify(st);
          await p.waitForTimeout(2500);
          const [despues, cole] = await p.evaluate(() => [__cl.S.coins || 0, __cl.S.cole]);
          if (despues - monedas !== 3) return `${id}: monedas ${monedas} -> ${despues}`;
          if (!cole || !cole.veces || cole.veces[id] !== 1) return `${id}: S.cole ` + JSON.stringify(cole);
          await p.evaluate(() => __cl.scene.down(1000, 700));
          await p.waitForTimeout(800);
          const otra = await p.evaluate(() => SILLAS_ST.fase);
          if (otra === 'fin') return `el botón de otra vez no vuelve a empezar ${id}`;
          await L.clic(p, 90, 90);
          await p.waitForTimeout(1000);
          if ((await escena()) !== 'juegosCortos') return `la casa de ${id} no vuelve a los juegos cortos`;
        }
        await L.clic(p, 90, 90);
        await p.waitForTimeout(800);
        return (await escena()) === 'patio'
          ? null
          : 'la casa de los juegos cortos no vuelve al patio: ' + (await escena());
      },
    );
    await caso(
      'P22',
      'con 5 años, el escondite: Tito cuenta, encuentra a los cuatro amigos con las pistas y Lupi lo encuentra a él',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 5;
          save();
          __cl.go('patio', {});
        });
        await p.waitForTimeout(1200);
        const bt = await p.evaluate(() => BOTONES_PATIO.find((x) => x.a.id === 'escondite'));
        if (!bt) return 'no hay botón del escondite en el patio';
        const circuito = await p.evaluate(() => BOTONES_PATIO.find((x) => x.a.id === 'circuito'));
        if (!circuito || circuito.y <= bt.y - 10) return 'con ocho actividades, los botones van en dos filas';
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        await L.clic(p, bt.x + bt.w / 2, bt.y + bt.h / 2);
        await p.waitForTimeout(1500);
        if ((await escena()) !== 'escondite') return 'el botón del escondite lleva a: ' + (await escena());
        // con 5 años no asoman: un sitio vacío no vale, y Tito no pasa al siguiente
        await p.evaluate(() => {
          let ultimo = 0,
            fallado = false;
          const f = () => {
            if (__cl.name !== 'escondite') return;
            const sc = __cl.scene,
              st = ESCONDITE_ST,
              h = sc.hint && sc.hint(),
              ahora = performance.now();
            if (st.fase === 'fin') return;
            if (h && ahora - ultimo > 200) {
              ultimo = ahora;
              if (st.fase === 'busca' && st.i === 0 && !fallado) {
                fallado = true;
                const otro = SITIOS.find((q) => q.id !== st.plan[0].sitio);
                sc.down(otro.x, otro.y);
                window.__fallo = ESCONDITE_ST.i;
              } else sc.down(h.x, h.y);
            }
            requestAnimationFrame(f);
          };
          requestAnimationFrame(f);
        });
        let st = null;
        for (let i = 0; i < 240 && !(st && st.fase === 'fin'); i++) {
          await p.waitForTimeout(500);
          st = await p.evaluate(() => ({
            fase: ESCONDITE_ST.fase,
            i: ESCONDITE_ST.i,
            plan: ESCONDITE_ST.plan.length,
            ruta: ESCONDITE_ST.ruta,
            tito: ESCONDITE_ST.sitioTito,
            fallo: window.__fallo,
          }));
        }
        if (!st || st.fase !== 'fin') return 'el escondite no termina: ' + JSON.stringify(st);
        if (st.fallo !== 0) return 'un sitio vacío no debe contar como encontrado: ' + JSON.stringify(st);
        if (st.plan !== 4 || st.i !== 4) return 'con 5 años se esconden cuatro amigos: ' + JSON.stringify(st);
        if (st.tito !== 'casita' || st.ruta.length !== 3 || st.ruta[2] !== 'casita')
          return 'Lupi mira en dos sitios y encuentra a Tito en el suyo: ' + JSON.stringify(st);
        await p.waitForTimeout(2500);
        const [despues, cole] = await p.evaluate(() => [__cl.S.coins || 0, __cl.S.cole]);
        if (despues - monedas !== 3) return `escondite: monedas ${monedas} -> ${despues}`;
        if (!cole || !cole.veces || cole.veces.escondite !== 1) return 'escondite: S.cole ' + JSON.stringify(cole);
        await p.evaluate(() => __cl.scene.down(1000, 700));
        await p.waitForTimeout(800);
        if ((await p.evaluate(() => ESCONDITE_ST.fase)) === 'fin') return 'el botón de otra vez no vuelve a empezar';
        await L.clic(p, 90, 90);
        await p.waitForTimeout(1000);
        return (await escena()) === 'patio' ? null : 'la casa del escondite no vuelve al patio: ' + (await escena());
      },
    );
    await caso(
      'P23',
      'con 4 años, el circuito: la profe dice el orden, el niño programa a Tito y Tito recorre las tres vueltas',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 4;
          save();
          __cl.go('patio', {});
        });
        await p.waitForTimeout(1200);
        const bt = await p.evaluate(() => BOTONES_PATIO.find((x) => x.a.id === 'circuito'));
        if (!bt) return 'no hay botón del circuito en el patio';
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        await L.clic(p, bt.x + bt.w / 2, bt.y + bt.h / 2);
        await p.waitForTimeout(1500);
        if ((await escena()) !== 'circuito') return 'el botón del circuito lleva a: ' + (await escena());
        // el primer toque de la primera vuelta es a un obstáculo que no va: no cuenta y la profe repite el orden
        await p.evaluate(() => {
          let ultimo = 0,
            fallado = false;
          const f = () => {
            if (__cl.name !== 'circuito') return;
            const sc = __cl.scene,
              st = CIRCUITO_ST,
              h = sc.hint && sc.hint(),
              ahora = performance.now();
            if (st.fase === 'fin') return;
            if (h && ahora - ultimo > 200) {
              ultimo = ahora;
              if (st.fase === 'programa' && st.v === 0 && !fallado) {
                fallado = true;
                const otro = PUESTOS.find((q) => q.id !== st.plan[0][0]);
                sc.down(otro.x, otro.y);
                window.__falloCircuito = [CIRCUITO_ST.prog.length, CIRCUITO_ST.fase];
              } else sc.down(h.x, h.y);
            }
            requestAnimationFrame(f);
          };
          requestAnimationFrame(f);
        });
        let st = null;
        for (let i = 0; i < 300 && !(st && st.fase === 'fin'); i++) {
          await p.waitForTimeout(500);
          st = await p.evaluate(() => ({
            fase: CIRCUITO_ST.fase,
            v: CIRCUITO_ST.v,
            largos: CIRCUITO_ST.plan.map((x) => x.length),
            prog: CIRCUITO_ST.prog,
            fallo: window.__falloCircuito,
          }));
        }
        if (!st || st.fase !== 'fin') return 'el circuito no termina: ' + JSON.stringify(st);
        if (!st.fallo || st.fallo[0] !== 0 || st.fallo[1] !== 'orden')
          return 'un obstáculo que no va no cuenta y la profe repite el orden: ' + JSON.stringify(st);
        if (st.v !== 3 || st.largos.join() !== '3,3,3')
          return 'con 4 años son tres vueltas de tres obstáculos: ' + JSON.stringify(st);
        await p.waitForTimeout(2500);
        const [despues, cole] = await p.evaluate(() => [__cl.S.coins || 0, __cl.S.cole]);
        if (despues - monedas !== 3) return `circuito: monedas ${monedas} -> ${despues}`;
        if (!cole || !cole.veces || cole.veces.circuito !== 1) return 'circuito: S.cole ' + JSON.stringify(cole);
        await p.evaluate(() => __cl.scene.down(1000, 700));
        await p.waitForTimeout(800);
        if ((await p.evaluate(() => CIRCUITO_ST.fase)) === 'fin') return 'el botón de otra vez no vuelve a empezar';
        await L.clic(p, 90, 90);
        await p.waitForTimeout(1000);
        return (await escena()) === 'patio' ? null : 'la casa del circuito no vuelve al patio: ' + (await escena());
      },
    );
    await caso(
      'P24',
      'el autobús lleva al zoo; los cinco recintos se juegan siguiendo la ayuda, con su dato curioso; la foto de grupo y el safari fotográfico',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 3;
          if (__cl.S.exc) delete __cl.S.exc.zoo;
          delete __cl.S.fotos;
          save();
          __cl.go('autobus', {});
        });
        await p.waitForTimeout(1200);
        const d = await p.evaluate(() => DESTINOS.find((x) => x.e.id === 'zoo'));
        await L.clic(p, d.x + d.w / 2, d.y + d.h / 2);
        let e = 'autobus';
        for (let i = 0; i < 20 && e === 'autobus'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'excursion') return 'el viaje no ha llegado al zoo: ' + e;
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        const recintos = await p.evaluate(() =>
          DESTINOS.find((x) => x.e.id === 'zoo').e.estaciones.map((s) => [s.x, s.y, s.escena]),
        );
        for (const [x, y, nombre] of recintos) {
          await p.waitForTimeout(1500);
          await L.clic(p, x, y);
          await p.waitForTimeout(1200);
          if ((await escena()) !== nombre) return 'no se ha abierto ' + nombre + ': ' + (await escena());
          // se juega siguiendo la ayuda, como conducir, pero mirando justo antes de cada toque que se sigue en el juego del
          // recinto: si el juego acaba mientras Tito habla, un toque más caería en el plano y abriría otro recinto
          const jugando = () => p.evaluate((n) => __cl.name === n && ZOO.fase === 'juego', nombre);
          const t0 = Date.now();
          while (Date.now() - t0 < 120000 && (await jugando())) {
            const t1 = Date.now();
            while (Date.now() - t1 < 12000 && (await p.evaluate(() => VIVO.talking))) await p.waitForTimeout(150);
            await p.waitForTimeout(400);
            if (await jugando()) await L.paso(p, 0);
            await p.waitForTimeout(250);
          }
          if (!(await p.evaluate(() => ZOO.fase === 'dato'))) return nombre + ' no llega al dato curioso';
          for (let i = 0; i < 40 && (await escena()) === nombre; i++) await p.waitForTimeout(500);
          if ((await escena()) !== 'excursion') return 'tras ' + nombre + ', escena ' + (await escena());
        }
        await p.waitForTimeout(3000);
        const [v, despues, stk] = await p.evaluate(() => [__cl.S.exc.zoo, __cl.S.coins || 0, __cl.S.stk.leon]);
        // al terminar la visita, sus estaciones se vacían para la próxima (terminarVisita)
        if (!v || v.veces !== 1 || !v.foto) return 'la visita al zoo: ' + JSON.stringify(v);
        if (despues - monedas < 5) return `la foto de grupo da 5 monedas: ${monedas} -> ${despues}`;
        if (!stk) return 'la primera visita da la pegatina del león';
        // el safari fotográfico: con la cámara encendida, un toque a un animal que pasea le hace su foto
        await p.evaluate(() => __cl.go('excursion', { exc: 'zoo' }));
        await p.waitForTimeout(1500);
        const foto = await p.evaluate(() => {
          __cl.scene.down(CAMARA_BOTON.x, CAMARA_BOTON.y);
          const a = PASEO.animales.find((q) => q.a.k === 'jirafa'),
            k = animalEn(a.x, a.y - 40);
          __cl.scene.down(a.x, a.y - 40);
          return [k, __cl.S.fotos && __cl.S.fotos.vistas];
        });
        // si otro animal tapa a la jirafa, la foto es la suya
        return foto[0] && foto[1] && foto[1][foto[0]] === 1
          ? null
          : 'la foto del animal no está en el álbum: ' + JSON.stringify(foto);
      },
    );
    await caso(
      'P25',
      'el autobús lleva al acuario; las cinco salas se juegan siguiendo la ayuda, con su dato curioso, y la foto de grupo',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 3;
          if (__cl.S.exc) delete __cl.S.exc.acuario;
          save();
          __cl.go('autobus', {});
        });
        await p.waitForTimeout(1200);
        const d = await p.evaluate(() => DESTINOS.find((x) => x.e.id === 'acuario'));
        await L.clic(p, d.x + d.w / 2, d.y + d.h / 2);
        let e = 'autobus';
        for (let i = 0; i < 20 && e === 'autobus'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'excursion') return 'el viaje no ha llegado al acuario: ' + e;
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        const salas = await p.evaluate(() =>
          DESTINOS.find((x) => x.e.id === 'acuario').e.estaciones.map((s) => [s.x, s.y, s.escena]),
        );
        for (const [x, y, nombre] of salas) {
          await p.waitForTimeout(1500);
          await L.clic(p, x, y);
          await p.waitForTimeout(1200);
          if ((await escena()) !== nombre) return 'no se ha abierto ' + nombre + ': ' + (await escena());
          // como en el zoo (P24): se sigue la ayuda solo mientras se juega en la sala
          const jugando = () => p.evaluate((n) => __cl.name === n && ZOO.fase === 'juego', nombre);
          const t0 = Date.now();
          while (Date.now() - t0 < 150000 && (await jugando())) {
            const t1 = Date.now();
            while (Date.now() - t1 < 12000 && (await p.evaluate(() => VIVO.talking))) await p.waitForTimeout(150);
            await p.waitForTimeout(400);
            if (await jugando()) await L.paso(p, 0);
            await p.waitForTimeout(250);
          }
          if (!(await p.evaluate(() => ZOO.fase === 'dato'))) return nombre + ' no llega al dato curioso';
          for (let i = 0; i < 40 && (await escena()) === nombre; i++) await p.waitForTimeout(500);
          if ((await escena()) !== 'excursion') return 'tras ' + nombre + ', escena ' + (await escena());
        }
        await p.waitForTimeout(3000);
        const [v, despues, stk] = await p.evaluate(() => [__cl.S.exc.acuario, __cl.S.coins || 0, __cl.S.stk.delfin]);
        if (!v || v.veces !== 1 || !v.foto) return 'la visita al acuario: ' + JSON.stringify(v);
        if (despues - monedas < 5) return `la foto de grupo da 5 monedas: ${monedas} -> ${despues}`;
        return stk ? null : 'la primera visita da la pegatina del delfín';
      },
    );
    await caso(
      'P26',
      'con 4 años, el autobús lleva al museo de los dinosaurios; las cinco salas (excavar, el puzle, medir con los pasos de Tito, qué comían y el nido) se juegan siguiendo la ayuda, y la foto de grupo',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 4;
          if (__cl.S.exc) delete __cl.S.exc.museo;
          save();
          __cl.go('autobus', {});
        });
        await p.waitForTimeout(1200);
        const d = await p.evaluate(() => DESTINOS.find((x) => x.e.id === 'museo'));
        // con cinco excursiones, los carteles caben en la pantalla
        if (d.x + d.w > 1600) return 'el cartel del museo se sale: ' + JSON.stringify(d);
        await L.clic(p, d.x + d.w / 2, d.y + d.h / 2);
        let e = 'autobus';
        for (let i = 0; i < 20 && e === 'autobus'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'excursion') return 'el viaje no ha llegado al museo: ' + e;
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        const salas = await p.evaluate(() =>
          DESTINOS.find((x) => x.e.id === 'museo').e.estaciones.map((s) => [s.x, s.y, s.escena]),
        );
        for (const [x, y, nombre] of salas) {
          await p.waitForTimeout(1500);
          await L.clic(p, x, y);
          await p.waitForTimeout(1200);
          if ((await escena()) !== nombre) return 'no se ha abierto ' + nombre + ': ' + (await escena());
          // como en el zoo (P24): se sigue la ayuda solo mientras se juega en la sala
          const jugando = () => p.evaluate((n) => __cl.name === n && ZOO.fase === 'juego', nombre);
          const t0 = Date.now();
          while (Date.now() - t0 < 150000 && (await jugando())) {
            const t1 = Date.now();
            while (Date.now() - t1 < 12000 && (await p.evaluate(() => VIVO.talking))) await p.waitForTimeout(150);
            await p.waitForTimeout(400);
            if (await jugando()) await L.paso(p, 0);
            await p.waitForTimeout(250);
          }
          if (!(await p.evaluate(() => ZOO.fase === 'dato'))) return nombre + ' no llega al dato curioso';
          for (let i = 0; i < 40 && (await escena()) === nombre; i++) await p.waitForTimeout(500);
          if ((await escena()) !== 'excursion') return 'tras ' + nombre + ', escena ' + (await escena());
        }
        await p.waitForTimeout(3000);
        const [v, despues, stk] = await p.evaluate(() => [
          __cl.S.exc.museo,
          __cl.S.coins || 0,
          __cl.S.stk.tiranosaurio,
        ]);
        if (!v || v.veces !== 1 || !v.foto) return 'la visita al museo: ' + JSON.stringify(v);
        if (despues - monedas < 5) return `la foto de grupo da 5 monedas: ${monedas} -> ${despues}`;
        return stk ? null : 'la primera visita da la pegatina del tiranosaurio';
      },
    );
    await caso(
      'P27',
      'con 5 años, el autobús lleva a la ciudad; las cinco paradas (vestirse de bombero, apagar el fuego, la panadería, el centro de salud y cruzar la calle) se juegan siguiendo la ayuda, y la foto de grupo',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 5;
          if (__cl.S.exc) delete __cl.S.exc.ciudad;
          save();
          __cl.go('autobus', {});
        });
        await p.waitForTimeout(1200);
        const d = await p.evaluate(() => DESTINOS.find((x) => x.e.id === 'ciudad'));
        // con seis excursiones, los carteles caben en la pantalla
        if (d.x + d.w > 1600) return 'el cartel de la ciudad se sale: ' + JSON.stringify(d);
        await L.clic(p, d.x + d.w / 2, d.y + d.h / 2);
        let e = 'autobus';
        for (let i = 0; i < 20 && e === 'autobus'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'excursion') return 'el viaje no ha llegado a la ciudad: ' + e;
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        const paradas = await p.evaluate(() =>
          DESTINOS.find((x) => x.e.id === 'ciudad').e.estaciones.map((s) => [s.x, s.y, s.escena]),
        );
        for (const [x, y, nombre] of paradas) {
          await p.waitForTimeout(1500);
          await L.clic(p, x, y);
          await p.waitForTimeout(1200);
          if ((await escena()) !== nombre) return 'no se ha abierto ' + nombre + ': ' + (await escena());
          // como en el zoo (P24): se sigue la ayuda solo mientras se juega en la sala
          const jugando = () => p.evaluate((n) => __cl.name === n && ZOO.fase === 'juego', nombre);
          const t0 = Date.now();
          while (Date.now() - t0 < 150000 && (await jugando())) {
            const t1 = Date.now();
            while (Date.now() - t1 < 12000 && (await p.evaluate(() => VIVO.talking))) await p.waitForTimeout(150);
            await p.waitForTimeout(400);
            if (await jugando()) await L.paso(p, 0);
            await p.waitForTimeout(250);
          }
          if (!(await p.evaluate(() => ZOO.fase === 'dato'))) return nombre + ' no llega al dato curioso';
          for (let i = 0; i < 40 && (await escena()) === nombre; i++) await p.waitForTimeout(500);
          if ((await escena()) !== 'excursion') return 'tras ' + nombre + ', escena ' + (await escena());
        }
        await p.waitForTimeout(3000);
        const [v, despues, stk] = await p.evaluate(() => [
          __cl.S.exc.ciudad,
          __cl.S.coins || 0,
          __cl.S.stk.camionBomberos,
        ]);
        if (!v || v.veces !== 1 || !v.foto) return 'la visita a la ciudad: ' + JSON.stringify(v);
        if (despues - monedas < 5) return `la foto de grupo da 5 monedas: ${monedas} -> ${despues}`;
        return stk ? null : 'la primera visita da la pegatina del camión de bomberos';
      },
    );
    await caso(
      'P28',
      'con 4 años, el autobús lleva al bosque de otoño; las cinco paradas (las hojas, las huellas del conejo, los sonidos, la despensa de la ardilla y el mural) se juegan siguiendo la ayuda, y la foto de grupo',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 4;
          if (__cl.S.exc) delete __cl.S.exc.bosque;
          save();
          __cl.go('autobus', {});
        });
        await p.waitForTimeout(1200);
        const d = await p.evaluate(() => DESTINOS.find((x) => x.e.id === 'bosque'));
        // el bosque, el último cartel, también cabe en la pantalla
        if (d.x + d.w > 1600) return 'el cartel del bosque se sale: ' + JSON.stringify(d);
        await L.clic(p, d.x + d.w / 2, d.y + d.h / 2);
        let e = 'autobus';
        for (let i = 0; i < 20 && e === 'autobus'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'excursion') return 'el viaje no ha llegado al bosque: ' + e;
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        const paradas = await p.evaluate(() =>
          DESTINOS.find((x) => x.e.id === 'bosque').e.estaciones.map((s) => [s.x, s.y, s.escena]),
        );
        for (const [x, y, nombre] of paradas) {
          await p.waitForTimeout(1500);
          await L.clic(p, x, y);
          await p.waitForTimeout(1200);
          if ((await escena()) !== nombre) return 'no se ha abierto ' + nombre + ': ' + (await escena());
          // como en el zoo (P24): se sigue la ayuda solo mientras se juega en la sala
          const jugando = () => p.evaluate((n) => __cl.name === n && ZOO.fase === 'juego', nombre);
          const t0 = Date.now();
          while (Date.now() - t0 < 150000 && (await jugando())) {
            const t1 = Date.now();
            while (Date.now() - t1 < 12000 && (await p.evaluate(() => VIVO.talking))) await p.waitForTimeout(150);
            await p.waitForTimeout(400);
            if (await jugando()) await L.paso(p, 0);
            await p.waitForTimeout(250);
          }
          if (!(await p.evaluate(() => ZOO.fase === 'dato'))) return nombre + ' no llega al dato curioso';
          for (let i = 0; i < 40 && (await escena()) === nombre; i++) await p.waitForTimeout(500);
          if ((await escena()) !== 'excursion') return 'tras ' + nombre + ', escena ' + (await escena());
        }
        await p.waitForTimeout(3000);
        const [v, despues, stk] = await p.evaluate(() => [__cl.S.exc.bosque, __cl.S.coins || 0, __cl.S.stk.ardilla]);
        if (!v || v.veces !== 1 || !v.foto) return 'la visita al bosque: ' + JSON.stringify(v);
        if (despues - monedas < 5) return `la foto de grupo da 5 monedas: ${monedas} -> ${despues}`;
        return stk ? null : 'la primera visita da la pegatina de la ardilla';
      },
    );
    await caso(
      'P29',
      'con 5 años, el autobús lleva al mercado; las cinco paradas (la lista de la compra, la báscula, el pan, la pescadería y la vuelta en la caja) se juegan siguiendo la ayuda, y la foto de grupo',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 5;
          if (__cl.S.exc) delete __cl.S.exc.mercado;
          save();
          __cl.go('autobus', {});
        });
        await p.waitForTimeout(1200);
        const d = await p.evaluate(() => DESTINOS.find((x) => x.e.id === 'mercado'));
        // con siete excursiones, el último cartel también cabe en la pantalla
        if (d.x + d.w > 1600) return 'el cartel del mercado se sale: ' + JSON.stringify(d);
        await L.clic(p, d.x + d.w / 2, d.y + d.h / 2);
        let e = 'autobus';
        for (let i = 0; i < 20 && e === 'autobus'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'excursion') return 'el viaje no ha llegado al mercado: ' + e;
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        const paradas = await p.evaluate(() =>
          DESTINOS.find((x) => x.e.id === 'mercado').e.estaciones.map((s) => [s.x, s.y, s.escena]),
        );
        for (const [x, y, nombre] of paradas) {
          await p.waitForTimeout(1500);
          await L.clic(p, x, y);
          await p.waitForTimeout(1200);
          if ((await escena()) !== nombre) return 'no se ha abierto ' + nombre + ': ' + (await escena());
          // como en el zoo (P24): se sigue la ayuda solo mientras se juega en la sala
          const jugando = () => p.evaluate((n) => __cl.name === n && ZOO.fase === 'juego', nombre);
          const t0 = Date.now();
          while (Date.now() - t0 < 150000 && (await jugando())) {
            const t1 = Date.now();
            while (Date.now() - t1 < 12000 && (await p.evaluate(() => VIVO.talking))) await p.waitForTimeout(150);
            await p.waitForTimeout(400);
            if (await jugando()) await L.paso(p, 0);
            await p.waitForTimeout(250);
          }
          if (!(await p.evaluate(() => ZOO.fase === 'dato'))) return nombre + ' no llega al dato curioso';
          for (let i = 0; i < 40 && (await escena()) === nombre; i++) await p.waitForTimeout(500);
          if ((await escena()) !== 'excursion') return 'tras ' + nombre + ', escena ' + (await escena());
        }
        await p.waitForTimeout(3000);
        const [v, despues, stk] = await p.evaluate(() => [__cl.S.exc.mercado, __cl.S.coins || 0, __cl.S.stk.sandia]);
        if (!v || v.veces !== 1 || !v.foto) return 'la visita al mercado: ' + JSON.stringify(v);
        if (despues - monedas < 5) return `la foto de grupo da 5 monedas: ${monedas} -> ${despues}`;
        return stk ? null : 'la primera visita da la pegatina de la sandía';
      },
    );
    await caso(
      'P30',
      'con 3 años, el autobús lleva al planetario; las cinco paradas (la cuenta atrás, los planetas, el día y la noche, pisar la Luna y volver a casa) se juegan siguiendo la ayuda, y la foto de grupo',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 3;
          if (__cl.S.exc) delete __cl.S.exc.planetario;
          save();
          __cl.go('autobus', {});
        });
        await p.waitForTimeout(1200);
        const d = await p.evaluate(() => DESTINOS.find((x) => x.e.id === 'planetario'));
        // con ocho excursiones, el último cartel también cabe en la pantalla
        if (d.x + d.w > 1600) return 'el cartel del planetario se sale: ' + JSON.stringify(d);
        await L.clic(p, d.x + d.w / 2, d.y + d.h / 2);
        let e = 'autobus';
        for (let i = 0; i < 20 && e === 'autobus'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'excursion') return 'el viaje no ha llegado al planetario: ' + e;
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        const paradas = await p.evaluate(() =>
          DESTINOS.find((x) => x.e.id === 'planetario').e.estaciones.map((s) => [s.x, s.y, s.escena]),
        );
        for (const [x, y, nombre] of paradas) {
          await p.waitForTimeout(1500);
          await L.clic(p, x, y);
          await p.waitForTimeout(1200);
          if ((await escena()) !== nombre) return 'no se ha abierto ' + nombre + ': ' + (await escena());
          // como en el zoo (P24): se sigue la ayuda solo mientras se juega en la sala
          const jugando = () => p.evaluate((n) => __cl.name === n && ZOO.fase === 'juego', nombre);
          const t0 = Date.now();
          while (Date.now() - t0 < 150000 && (await jugando())) {
            const t1 = Date.now();
            while (Date.now() - t1 < 12000 && (await p.evaluate(() => VIVO.talking))) await p.waitForTimeout(150);
            await p.waitForTimeout(400);
            if (await jugando()) await L.paso(p, 0);
            await p.waitForTimeout(250);
          }
          if (!(await p.evaluate(() => ZOO.fase === 'dato'))) return nombre + ' no llega al dato curioso';
          for (let i = 0; i < 40 && (await escena()) === nombre; i++) await p.waitForTimeout(500);
          if ((await escena()) !== 'excursion') return 'tras ' + nombre + ', escena ' + (await escena());
        }
        await p.waitForTimeout(3000);
        const [v, despues, stk] = await p.evaluate(() => [__cl.S.exc.planetario, __cl.S.coins || 0, __cl.S.stk.cohete]);
        if (!v || v.veces !== 1 || !v.foto) return 'la visita al planetario: ' + JSON.stringify(v);
        if (despues - monedas < 5) return `la foto de grupo da 5 monedas: ${monedas} -> ${despues}`;
        return stk ? null : 'la primera visita da la pegatina del cohete';
      },
    );
    // P31 (fase P24): la playa con 5 años, con nueve excursiones en dos filas de carteles y de marcos
    await caso(
      'P31',
      'con 5 años, el autobús (en dos filas, sin que los carteles se salgan ni se monten) lleva a la playa; las cinco paradas (la crema, el castillo, las conchas, la basura y el mar) se juegan siguiendo la ayuda, la foto de grupo, y el álbum en dos filas',
      async () => {
        await p.evaluate(() => {
          __cl.S.age = 5;
          if (__cl.S.exc) delete __cl.S.exc.playa;
          save();
          __cl.go('autobus', {});
        });
        await p.waitForTimeout(1200);
        // los nueve carteles caben en la pantalla, sin montarse unos con otros
        const mal = await p.evaluate(() => {
          const fuera = DESTINOS.filter((d) => d.x < 0 || d.y < 0 || d.x + d.w > 1600 || d.y + d.h > 900);
          const juntos = DESTINOS.filter((a, i) =>
            DESTINOS.some((b, j) => j > i && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h),
          );
          return [DESTINOS.length, fuera.map((d) => d.e.id), juntos.map((d) => d.e.id)];
        });
        if (mal[0] < 9 || mal[1].length || mal[2].length) return 'los carteles del autobús: ' + JSON.stringify(mal);
        const d = await p.evaluate(() => DESTINOS.find((x) => x.e.id === 'playa'));
        await L.clic(p, d.x + d.w / 2, d.y + d.h / 2);
        let e = 'autobus';
        for (let i = 0; i < 20 && e === 'autobus'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'excursion') return 'el viaje no ha llegado a la playa: ' + e;
        const monedas = await p.evaluate(() => __cl.S.coins || 0);
        const paradas = await p.evaluate(() =>
          DESTINOS.find((x) => x.e.id === 'playa').e.estaciones.map((s) => [s.x, s.y, s.escena]),
        );
        for (const [x, y, nombre] of paradas) {
          await p.waitForTimeout(1500);
          await L.clic(p, x, y);
          await p.waitForTimeout(1200);
          if ((await escena()) !== nombre) return 'no se ha abierto ' + nombre + ': ' + (await escena());
          // como en el zoo (P24): se sigue la ayuda solo mientras se juega en la parada
          const jugando = () => p.evaluate((n) => __cl.name === n && ZOO.fase === 'juego', nombre);
          const t0 = Date.now();
          while (Date.now() - t0 < 150000 && (await jugando())) {
            const t1 = Date.now();
            while (Date.now() - t1 < 12000 && (await p.evaluate(() => VIVO.talking))) await p.waitForTimeout(150);
            await p.waitForTimeout(400);
            if (await jugando()) await L.paso(p, 0);
            await p.waitForTimeout(250);
          }
          if (!(await p.evaluate(() => ZOO.fase === 'dato'))) return nombre + ' no llega al dato curioso';
          for (let i = 0; i < 40 && (await escena()) === nombre; i++) await p.waitForTimeout(500);
          if ((await escena()) !== 'excursion') return 'tras ' + nombre + ', escena ' + (await escena());
        }
        await p.waitForTimeout(3000);
        const [v, despues, stk] = await p.evaluate(() => [__cl.S.exc.playa, __cl.S.coins || 0, __cl.S.stk.castillo]);
        if (!v || v.veces !== 1 || !v.foto) return 'la visita a la playa: ' + JSON.stringify(v);
        if (despues - monedas < 5) return `la foto de grupo da 5 monedas: ${monedas} -> ${despues}`;
        if (!stk) return 'la primera visita da la pegatina del castillo';
        // el álbum de excursiones, en dos filas: los nueve marcos caben y no se montan
        const album = await p.evaluate(() => {
          const M = MARCOS_ALBUM;
          return [
            M.length,
            M.filter((m) => m.x < 0 || m.y < 0 || m.x + m.w > 1600 || m.y + m.h > 900).map((m) => m.e.id),
            M.filter((a, i) =>
              M.some((b, j) => j > i && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h),
            ).map((m) => m.e.id),
          ];
        });
        return album[0] >= 9 && !album[1].length && !album[2].length ? null : 'el álbum: ' + JSON.stringify(album);
      },
    );
    // P32 (fase P25; desde la P30, en 3D): los viajes en vehículo: del muelle del mapa, en barco a la Isla de las Letras; y la vuelta en globo
    await caso(
      'P32',
      'el muelle del mapa lleva de viaje en barco, en 3D (se toca la bocina), a la Isla de las Letras, y en el viaje de vuelta en globo se saluda a un pájaro y se llega al mapa',
      async () => {
        await p.evaluate(() => __cl.go('map', {}));
        await p.waitForTimeout(2500);
        const z = await p.evaluate(() => mzOf('muelle'));
        await L.clic(p, z.x, z.y);
        // como en P1: en 3D, Tito anda primero hasta el muelle
        let e = 'map';
        for (let i = 0; i < 60 && e === 'map'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'viaje') return 'el muelle no lleva al viaje: ' + e;
        if ((await p.evaluate(() => [VIAJE.veh, VIAJE.a].join())) !== 'barco,isla')
          return 'el viaje del muelle: ' + (await p.evaluate(() => JSON.stringify([VIAJE.veh, VIAJE.a])));
        await p.waitForTimeout(800);
        // desde la P30, con WebGL el viaje es en 3D, con el barco donde estaba el de 2D
        const v = await p.evaluate(() => vehiculoEnPantalla());
        if (!v) return 'el viaje en barco no es en 3D';
        if (Math.hypot(v.x - 640, v.y - 520) > 150) return 'el barco 3D no está donde se toca: ' + JSON.stringify(v);
        await L.clic(p, 640, 520);
        if ((await p.evaluate(() => VIAJE.toques)) < 1) return 'tocar el barco no toca la bocina';
        for (let i = 0; i < 40 && e === 'viaje'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'isla') return 'el barco no llega a la Isla de las Letras: ' + e;
        await p.evaluate(() => __cl.go('viaje', { a: 'map', veh: 'globo' }));
        // se espera a que pase el primer pájaro por la pantalla y se le toca
        let s = null;
        for (let i = 0; i < 30 && !s; i++) {
          await p.waitForTimeout(200);
          s = await p.evaluate(() => {
            const q = VIAJE.pasan[0],
              o = sitioPasajero(q);
            return o.x > 300 && o.x < 1300 ? o : null;
          });
        }
        if (!s) return 'no pasa ningún pájaro';
        await L.clic(p, s.x, s.y);
        if ((await p.evaluate(() => VIAJE.pasan.filter((q) => q.salto > 0).length)) < 1) return 'el pájaro no salta';
        e = 'viaje';
        for (let i = 0; i < 40 && e === 'viaje'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        return e === 'map' ? null : 'el globo no vuelve al mapa: ' + e;
      },
    );
    // P33 (fase P26): el tiempo de verdad: con lluvia en la asamblea, el mapa tiene charcos; Tito va y salta en todos,
    // sale el arcoíris, da 2 monedas y vuelve al mapa; con nieve, el mapa tiene el montón de nieve, el muñeco se hace
    // por partes en orden (una parte que no toca no vale) y la guerra de bolas se gana acertando a los amigos
    await caso(
      'P33',
      'con lluvia, el mapa tiene charcos y Tito salta en todos hasta el arcoíris (2 monedas); con nieve, el montón de nieve, el muñeco por partes en orden y la guerra de bolas',
      async () => {
        await p.evaluate(() => {
          __cl.S.asam[today()] = { tiempo: 'lluvia' };
          __cl.go('map', {});
        });
        await p.waitForTimeout(2500);
        const c = await p.evaluate(() => juegoTiempoEnPantalla());
        if (!c) return 'con lluvia no hay charcos en el mapa';
        await L.clic(p, c.x, c.y);
        // como en P1: en 3D, Tito anda primero hasta los charcos
        let e = 'map';
        for (let i = 0; i < 60 && e === 'map'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'charcos') return 'los charcos no llevan al juego: ' + e;
        await p.waitForTimeout(800);
        const monedas = await p.evaluate(() => __cl.S.coins),
          n = await p.evaluate(() => CHARCOS.charcos.length);
        for (let i = 0; i < n; i++) {
          const s = await p.evaluate((j) => sitioCharco(j), i);
          await L.clic(p, s.x, s.y);
          await p.waitForTimeout(1500);
        }
        if ((await p.evaluate(() => CHARCOS.charcos.filter((o) => o.saltado).length)) !== n)
          return 'Tito no ha saltado en todos los charcos';
        await p.waitForTimeout(1200);
        if (!(await p.evaluate(() => CHARCOS.arcoiris))) return 'no sale el arcoíris';
        await p.waitForTimeout(1500);
        if ((await p.evaluate(() => __cl.S.coins)) !== monedas + 2) return 'los charcos no dan 2 monedas';
        for (let i = 0; i < 30 && e === 'charcos'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'map') return 'los charcos no vuelven al mapa: ' + e;
        await p.evaluate(() => {
          __cl.S.asam[today()] = { tiempo: 'nieve' };
          __cl.go('map', {});
        });
        await p.waitForTimeout(2500);
        if (!(await p.evaluate(() => juegoTiempoEnPantalla()))) return 'con nieve no hay montón de nieve en el mapa';
        await p.evaluate(() => __cl.go('muneco'));
        await p.waitForTimeout(1500);
        // una parte que no toca no se pone
        const mal = await p.evaluate(() => sitioParte(MUNECO.bandeja.findIndex((id) => id !== MUNECO.partes[0].id)));
        await L.clic(p, mal.x, mal.y);
        if ((await p.evaluate(() => MUNECO.puestas)) !== 0) return 'se ha puesto una parte que no tocaba';
        const k = await p.evaluate(() => MUNECO.partes.length);
        for (let i = 0; i < k; i++) {
          const s = await p.evaluate(() => sitioParte(MUNECO.bandeja.indexOf(MUNECO.partes[MUNECO.puestas].id)));
          await L.clic(p, s.x, s.y);
          await p.waitForTimeout(800);
        }
        for (let i = 0; i < 20 && (await p.evaluate(() => MUNECO.fase)) !== 'bolas'; i++) await p.waitForTimeout(500);
        if ((await p.evaluate(() => MUNECO.fase)) !== 'bolas') return 'el muñeco no se termina';
        for (let i = 0; i < 80 && (await p.evaluate(() => MUNECO.fase)) === 'bolas'; i++) {
          const a = await p.evaluate(() => MUNECO.asoma && !MUNECO.bola && sitioMonton(MUNECO.asoma.m));
          if (a) await L.clic(p, a.x, a.y);
          await p.waitForTimeout(500);
        }
        await p.evaluate(() => delete __cl.S.asam[today()]);
        const fin = await p.evaluate(() => [MUNECO.fase, MUNECO.aciertos, MUNECO.hacen]);
        return fin[0] === 'fin' && fin[1] === fin[2] ? null : 'la guerra de bolas no se gana: ' + JSON.stringify(fin);
      },
    );
    await caso(
      'P34',
      'en las clases, el rincón de las construcciones: copiar la torre, la casa, contar y libre dan 2 monedas cada uno; lo que no toca no se pone y lo libre se lleva al jardín de Tito',
      async () => {
        await p.evaluate(() => __cl.go('cole', {}));
        await p.waitForTimeout(800);
        const cl = await p.evaluate(() => COLE_SITIOS.find((s) => s.id === 'clases'));
        await L.clic(p, cl.x, cl.y);
        await p.waitForTimeout(1500);
        if ((await escena()) !== 'clases') return 'las clases no se abren desde el cole: ' + (await escena());
        const r = await p.evaluate(() => RINCONES_CLASE[0]);
        await L.clic(p, r.x, r.y);
        await p.waitForTimeout(2500);
        if ((await escena()) !== 'bloques') return 'el rincón de las construcciones no lleva a los bloques';
        const tocar = async (f) => {
          const c = await p.evaluate((x) => casillaForma(x), f);
          await L.clic(p, c.x, c.y);
          await p.waitForTimeout(700);
        };
        // alMenu(): espera a que se acabe el juego y vuelva el menú
        const alMenu = async () => {
          for (let i = 0; i < 40 && (await p.evaluate(() => BLOQ.fase)) !== 'menu'; i++) await p.waitForTimeout(500);
        };
        // hecho(): espera un poco a que el juego se dé por terminado (Tito lo celebra medio segundo después)
        const hecho = async () => {
          for (let i = 0; i < 10 && (await p.evaluate(() => BLOQ.fase)) !== 'hecho'; i++) await p.waitForTimeout(300);
          return (await p.evaluate(() => BLOQ.fase)) === 'hecho';
        };
        const juego = async (j) => {
          const b = await p.evaluate((x) => botonJuego(x), j);
          await L.clic(p, b.x, b.y);
          await p.waitForTimeout(1200);
          return p.evaluate(() => [BLOQ.fase, BLOQ.juego]);
        };
        const monedas = await p.evaluate(() => __cl.S.coins);
        // copiar: una forma que no toca no se pone
        if ((await juego('copiar')).join() !== 'juego,copiar') return 'no empieza «copia la torre»';
        await tocar(await p.evaluate(() => ['cubo', 'cilindro', 'arco'].find((f) => f !== BLOQ.modelo[0])));
        if ((await p.evaluate(() => BLOQ.torres[1].length)) !== 0)
          return 'al copiar se ha puesto un bloque que no toca';
        const n = await p.evaluate(() => BLOQ.modelo.length);
        for (let i = 0; i < n; i++) await tocar(await p.evaluate(() => BLOQ.modelo[BLOQ.torres[1].length]));
        if (!(await hecho())) return 'la torre copiada no se termina';
        // El premio usa later(1000), tiempo de juego: con pocos FPS puede tardar más de 1,5 s reales.
        // El menú se programa después de pagarlo; esperamos ese final y conservamos el saldo exacto exigido.
        await alMenu();
        if ((await p.evaluate(() => __cl.S.coins)) !== monedas + 2) return 'copiar la torre no da 2 monedas';
        // la casa: el arco no vale para las paredes, el tejado no va antes de las paredes
        if ((await juego('casa')).join() !== 'juego,casa') return 'no empieza «una casa»';
        await tocar('arco');
        await tocar('tejado');
        if ((await p.evaluate(() => BLOQ.torres.flat().length)) !== 0)
          return 'en la casa se ha puesto el arco o el tejado antes de tiempo';
        const alto = await p.evaluate(() => BLOQ.casa.alto);
        for (let i = 0; i < alto * 2; i++) await tocar(i % 2 ? 'cilindro' : 'cubo');
        await tocar('tejado');
        if (!(await hecho())) return 'la casa no se termina: ' + (await p.evaluate(() => JSON.stringify(BLOQ.torres)));
        await alMenu();
        // contar: un número que no es no vale; dos rondas
        if ((await juego('contar')).join() !== 'juego,contar') return 'no empieza «¿cuántos hay?»';
        const malo = await p.evaluate(() =>
          opcionNumero(BLOQ.contar.opciones.findIndex((o) => o !== BLOQ.contar.respuesta)),
        );
        await L.clic(p, malo.x, malo.y);
        await p.waitForTimeout(600);
        if ((await p.evaluate(() => BLOQ.ronda)) !== 0) return 'contar: un número que no es cuenta como acierto';
        for (let i = 0; i < 2; i++) {
          const o = await p.evaluate(() => opcionNumero(BLOQ.contar.opciones.indexOf(BLOQ.contar.respuesta)));
          await L.clic(p, o.x, o.y);
          await p.waitForTimeout(2500);
        }
        if (!(await hecho())) return 'contar no se termina';
        await alMenu();
        // libre: en un cono no se sostiene nada; lo construido se lleva al jardín
        if ((await juego('libre')).join() !== 'juego,libre') return 'no empieza el juego libre';
        const pila = await p.evaluate(() => sitioPila(0));
        await L.clic(p, pila.x, pila.y);
        await p.waitForTimeout(500);
        for (const f of ['cubo', 'arco', 'cono', 'cubo']) await tocar(f);
        const t = await p.evaluate(() => JSON.stringify(BLOQ.torres[0]));
        if (t !== '["cubo","arco","cono"]') return 'en el juego libre, encima del cono se ha sostenido algo: ' + t;
        await p.waitForTimeout(1500);
        await L.clic(
          p,
          await p.evaluate(() => BOTON_JARDIN.x + BOTON_JARDIN.w / 2),
          await p.evaluate(() => BOTON_JARDIN.y + BOTON_JARDIN.h / 2),
        );
        await p.waitForTimeout(1500);
        const j = await p.evaluate(() => JSON.stringify(__cl.S.bloques && __cl.S.bloques.jardin));
        if (j !== '[["cubo","arco","cono"],[],[]]') return 'lo construido no se lleva al jardín: ' + j;
        await alMenu();
        if ((await p.evaluate(() => __cl.S.coins)) !== monedas + 8) return 'los cuatro juegos no dan 8 monedas';
        return null;
      },
    );
    await caso(
      'P35',
      'la estación del mapa lleva al tren: la bocina, decir adiós a un animal, las tres paradas, los túneles a oscuras y, al llegar, el número bueno da 2 monedas',
      async () => {
        await p.evaluate(() => __cl.go('map', {}));
        await p.waitForTimeout(2500);
        const est = await p.evaluate(() => estacionEnPantalla());
        if (!est) return 'no hay estación en el mapa';
        await L.clic(p, est.x, est.y);
        let e = 'map';
        for (let i = 0; i < 60 && e === 'map'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'tren') return 'la estación no lleva al tren: ' + e;
        const monedas = await p.evaluate(() => __cl.S.coins);
        await p.waitForTimeout(800);
        const l = await p.evaluate(() => locoEnPantalla());
        await L.clic(p, l.x, l.y);
        if ((await p.evaluate(() => TREN_ST.bocina)) < 0) return 'tocar el tren no toca la bocina';
        let oscuro = false,
          adios = false;
        for (let i = 0; i < 300 && (await p.evaluate(() => TREN_ST.fase)) !== 'pregunta'; i++) {
          const st = await p.evaluate(() => ({ t: TREN_ST.tunel, u: TREN_ST.u }));
          if (st.t >= 0) oscuro = true;
          if (!adios && st.u > 0.27 && st.u < 0.31) {
            const a = await p.evaluate(() => animalEnPantalla(0));
            if (a && a.x > 0 && a.x < 1600 && a.y > 120 && a.y < 880) {
              await L.clic(p, a.x, a.y);
              adios = true;
            }
          }
          await p.waitForTimeout(300);
        }
        if ((await p.evaluate(() => TREN_ST.fase)) !== 'pregunta') return 'el tren no termina la vuelta';
        if (!oscuro) return 'en los túneles no se pone oscuro';
        if (!adios) return 'no se ha podido decir adiós al primer animal';
        const suben = await p.evaluate(() => JSON.stringify(TREN_ST.suben));
        if (suben !== '["lupi","polly","pato"]') return 'no suben los tres pasajeros: ' + suben;
        const mal = await p.evaluate(() =>
          numeroTren(TREN_ST.plan.opciones.findIndex((n) => n !== TREN_ST.plan.tuneles.length)),
        );
        await L.clic(p, mal.x, mal.y);
        await p.waitForTimeout(500);
        if ((await p.evaluate(() => TREN_ST.fase)) !== 'pregunta') return 'un número que no es termina el viaje';
        const ok = await p.evaluate(() => numeroTren(TREN_ST.plan.opciones.indexOf(TREN_ST.plan.tuneles.length)));
        await L.clic(p, ok.x, ok.y);
        await p.waitForTimeout(2000);
        if ((await p.evaluate(() => __cl.S.coins)) !== monedas + 2) return 'el número bueno no da 2 monedas';
        for (let i = 0; i < 20 && e === 'tren'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        return e === 'map' ? null : 'el tren no vuelve al mapa: ' + e;
      },
    );
    await caso(
      'P36',
      'la tienda de campaña del mapa lleva a la linterna de noche: la estrella fugaz, alumbrar a un animal con la luz, tocar los demás y, con todos, 2 monedas y vuelta al mapa',
      async () => {
        await p.evaluate(() => __cl.go('map', {}));
        await p.waitForTimeout(2500);
        const t = await p.evaluate(() => acampadaEnPantalla());
        if (!t) return 'no hay tienda de campaña en el mapa';
        await L.clic(p, t.x, t.y);
        let e = 'map';
        for (let i = 0; i < 60 && e === 'map'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        if (e !== 'linterna') return 'la tienda no lleva a la linterna: ' + e;
        const monedas = await p.evaluate(() => __cl.S.coins);
        let f = null;
        for (let i = 0; i < 40 && !f; i++) {
          await p.waitForTimeout(250);
          f = await p.evaluate(() => fugazEnPantalla());
        }
        if (!f) return 'no pasa ninguna estrella fugaz';
        await p.waitForTimeout(300);
        f = await p.evaluate(() => fugazEnPantalla());
        if (f) await L.clic(p, f.x - 30, f.y + 4);
        if ((await p.evaluate(() => LINTERNA_ST.fugazTocada)) < 0) return 'tocar la estrella fugaz no hace nada';
        const n = await p.evaluate(() => LINTERNA_ST.plan.animales.length);
        if (n < 3 || n > 5) return 'no hay entre 3 y 5 animales: ' + n;
        const a0 = await p.evaluate(() => sitioAnimalNoche(0));
        const [ax, ay] = await p.evaluate(([x, y]) => [OX + x * SC, OY + y * SC], [a0.x, a0.y]);
        await p.mouse.move(ax + 200, ay);
        await p.mouse.move(ax, ay, { steps: 8 });
        await p.waitForTimeout(1200);
        if (!(await p.evaluate(() => LINTERNA_ST.encontrados[0]))) return 'alumbrar a un animal no lo encuentra';
        for (let i = 1; i < n; i++) {
          const s = await p.evaluate((j) => sitioAnimalNoche(j), i);
          await L.clic(p, s.x, s.y);
          await p.waitForTimeout(300);
        }
        for (let i = 0; i < 40 && (await p.evaluate(() => LINTERNA_ST.fase)) !== 'fin'; i++)
          await p.waitForTimeout(500);
        if ((await p.evaluate(() => LINTERNA_ST.fase)) !== 'fin') return 'con todos encontrados no se termina';
        await p.waitForTimeout(1800);
        if ((await p.evaluate(() => __cl.S.coins)) !== monedas + 2) return 'encontrarlos a todos no da 2 monedas';
        for (let i = 0; i < 20 && e === 'linterna'; i++) {
          await p.waitForTimeout(500);
          e = await escena();
        }
        return e === 'map' ? null : 'la linterna no vuelve al mapa: ' + e;
      },
    );
    await caso(
      'P37',
      'en el mapa pasean Lupi y Polly; el amigo del encargo de hoy pide ayuda, lo perdido aparece en el mapa y, al recogerlo, se lo devuelve (2 monedas, una vez al día)',
      async () => {
        await p.evaluate(() => {
          delete __cl.S.amigos;
          __cl.go('map', {});
        });
        await p.waitForTimeout(2500);
        if (!(await p.evaluate(() => amigoEnPantalla('lupi') && amigoEnPantalla('polly'))))
          return 'no pasean los amigos';
        const e = await p.evaluate(() => encargoHoy());
        if ((await p.evaluate(() => faseHoy())) !== 'sinPedir') return 'el encargo no empieza sin pedir';
        if (await p.evaluate(() => perdidoEnPantalla())) return 'lo perdido está en el mapa antes de pedirlo';
        // el amigo anda y algo puede taparlo (una mariposa, un árbol): se espera a que Tito no esté andando y se toca un
        // punto cerca del amigo donde el toque le da a él (pickAt); si no, se vuelve a mirar dónde está y se toca otra vez
        const diag = [];
        for (let intento = 0; intento < 4 && (await p.evaluate(() => faseHoy())) !== 'buscando'; intento++) {
          for (let i = 0; i < 20 && (await p.evaluate(() => !!(__w3.W && __w3.W.walk))); i++)
            await p.waitForTimeout(300);
          const a = await p.evaluate((id) => {
            const c = amigoEnPantalla(id);
            if (!c) return null;
            const puntos = [0, -20, 20, -40, 40].flatMap((dy) => [0, -20, 20].map((dx) => [c.x + dx, c.y + dy]));
            const bueno = puntos.find(([x, y]) => {
              const u = __w3.pickAt(x, y);
              return u && u.id === 'amigo' && u.amigo === id;
            });
            const u = __w3.pickAt(c.x, c.y);
            return { x: bueno ? bueno[0] : c.x, y: bueno ? bueno[1] : c.y, bueno: !!bueno, toca: u ? u.id : null };
          }, e.amigo);
          diag.push(JSON.stringify(a));
          if (a) await L.clic(p, a.x, a.y);
          for (let i = 0; i < 30 && (await p.evaluate(() => faseHoy())) !== 'buscando'; i++)
            await p.waitForTimeout(500);
        }
        if ((await p.evaluate(() => faseHoy())) !== 'buscando')
          return (
            'tocar al amigo no pide ayuda: ' +
            diag.join(' ') +
            ' ' +
            (await p.evaluate(() => JSON.stringify([__cl.name, VIVO.talking, !!(__w3.W && __w3.W.walk)])))
          );
        const q = await p.evaluate(() => perdidoEnPantalla());
        if (!q) return 'lo perdido no aparece en el mapa';
        const monedas = await p.evaluate(() => __cl.S.coins);
        await L.clic(p, q.x, q.y);
        for (let i = 0; i < 60 && (await p.evaluate(() => faseHoy())) !== 'hecho'; i++) await p.waitForTimeout(500);
        if ((await p.evaluate(() => faseHoy())) !== 'hecho') return 'recoger lo perdido no se lo devuelve';
        if ((await p.evaluate(() => __cl.S.coins)) !== monedas + 2) return 'devolverlo no da 2 monedas';
        if (await p.evaluate(() => devolverPerdido(800, 450))) return 'se puede devolver dos veces el mismo día';
        return null;
      },
    );
    await caso(
      'P38',
      'en las clases, «Programa a Tito»: con 5 años, un programa que saca a Tito del tablero marca la tarjeta roja, que se quita tocándola; los tres tableros resueltos dan 2 monedas',
      async () => {
        const edad = await p.evaluate(() => __cl.S.age);
        await p.evaluate(() => {
          __cl.S.age = 5;
          __cl.go('clases', {});
        });
        await p.waitForTimeout(1200);
        const r = await p.evaluate(() => RINCONES_CLASE.find((x) => x.id === 'logica'));
        await L.clic(p, r.x, r.y);
        await p.waitForTimeout(2500);
        if ((await escena()) !== 'programa') return 'el rincón de la lógica no lleva a «Programa a Tito»';
        const tarjeta = async (o) => {
          const c = await p.evaluate((x) => botonOrden(x), o);
          await L.clic(p, c.x, c.y);
          await p.waitForTimeout(300);
        };
        const vamos = async () => {
          await p.evaluate(() => (VIVO.pausaHecha = true));
          await L.clic(p, BOTON_VAMOS_X, BOTON_VAMOS_Y);
          for (let i = 0; i < 40 && (await p.evaluate(() => PROG.fase)) === 'corre'; i++) await p.waitForTimeout(300);
        };
        const v = await p.evaluate(() => BOTON_VAMOS);
        const BOTON_VAMOS_X = v.x + v.w / 2,
          BOTON_VAMOS_Y = v.y + v.h / 2;
        // un programa que se sale: la tarjeta que falla se pone roja y, al tocarla, se quita
        await tarjeta('iz');
        await tarjeta('av');
        await vamos();
        const f = await p.evaluate(() => [PROG.fase, PROG.fallo, PROG.programa.length]);
        if (f.join() !== 'editar,1,2') return 'salirse del tablero no marca la tarjeta roja: ' + f.join();
        const c = await p.evaluate(() => casillaPrograma(PROG.fallo));
        await L.clic(p, c.x, c.y);
        await p.waitForTimeout(400);
        if ((await p.evaluate(() => PROG.programa.join())) !== 'iz') return 'tocar la tarjeta roja no la quita';
        const b = await p.evaluate(() => BOTON_BORRAR);
        await L.clic(p, b.x + b.w / 2, b.y + b.h / 2);
        await p.waitForTimeout(400);
        if (await p.evaluate(() => PROG.programa.length)) return '«Borrar» no vacía el programa';
        const monedas = await p.evaluate(() => __cl.S.coins);
        for (let n = 0; n < 3; n++) {
          if ((await p.evaluate(() => PROG.nivel)) !== n) return 'no se pasa al tablero ' + (n + 1);
          for (const o of await p.evaluate(() => solucionPrograma())) await tarjeta(o);
          await vamos();
          if ((await p.evaluate(() => PROG.fase)) !== 'bien')
            return 'la solución no lleva a la fresa en el tablero ' + (n + 1);
          for (let i = 0; i < 40 && (await p.evaluate(() => PROG.fase)) !== 'editar'; i++) await p.waitForTimeout(400);
        }
        if ((await p.evaluate(() => __cl.S.coins)) !== monedas + 2) return 'los tres tableros no dan 2 monedas';
        if ((await p.evaluate(() => PROG.nivel)) !== 0) return 'tras los tres tableros no se vuelve a empezar';
        await p.evaluate((e) => (__cl.S.age = e), edad);
        return null;
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
