/*
 * escenas/ambiente.ts: pone, al entrar en cada escena, los sonidos de ambiente y la música propia del sitio (idea 43 de
 * docs/IDEAS-MEJORA.md, en la PR de todas las ideas pendientes, v0.2.181): pájaros en el mapa, la granja y el zoo; olas
 * y la música del mar en la playa y el acuario; pájaros, viento y la música del bosque en el bosque. Qué suena en cada
 * sitio lo dice dominio/ambiente.ts; cómo suena, nucleo/sonido.ts (ponAmbiente, ponMusica).
 * No exporta nada: al cargarse se apunta en AL_ENTRAR (nucleo/escenas.ts).
 */
import { AL_ENTRAR } from '../nucleo/escenas.ts';
import { ponAmbiente, ponMusica } from '../nucleo/sonido.ts';
import { ambienteDe, musicaDe } from '../dominio/ambiente.ts';

// al entrar en una escena: sus sonidos de ambiente y, si el sitio tiene música propia, esa en vez de la de la escena
AL_ENTRAR.push((nombre) => {
  ponAmbiente(ambienteDe(nombre));
  const m = musicaDe(nombre);
  if (m) ponMusica(m);
});
