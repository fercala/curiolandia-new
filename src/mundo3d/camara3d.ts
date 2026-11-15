/*
 * mundo3d/camara3d.ts: la cámara de fotos de Tito en el mapa 3D y en las zonas 3D (idea 20 de docs/IDEAS-MEJORA.md,
 * fase P15). fotoEnMundo(w, x, y) (la llaman el down del mapa, mundo3d/mapa3d.ts, y el de las zonas, mundo3d/zonas3d.ts,
 * cuando la cámara está encendida) busca, con el rayo del toque, el primer objeto tocable (los de w.trees y w.fly, los
 * que apunta wobInit) que tenga foto según sus marcas (fotoDeMarca, dominio/fotos.ts): lo hace temblar, Tito lo mira y
 * se hace su foto (hacerFotoDe, escenas/fotos.ts). Si no hay nada que fotografiar, devuelve false.
 * Exporta: fotoEnMundo.
 * Importa: el tipo Mundo, el rayo de mundo3d/motor.ts (pickAt, RC), la regla fotoDeMarca y hacerFotoDe.
 */
import * as THREE from 'three';
import type { Mundo } from './tipos.ts';
import { T } from '../nucleo/indice.ts';
import { RC, pickAt } from './motor.ts';
import { fotoDeMarca } from '../dominio/fotos.ts';
import { hacerFotoDe } from '../escenas/fotos.ts';

// fotoDeObjeto(o): la foto del objeto 3D o o de alguno de sus padres (el primero con una marca que tenga foto) y ese
// objeto, o undefined.
function fotoDeObjeto(o: THREE.Object3D | null): { id: string; obj: THREE.Object3D } | undefined {
  const f = o ? fotoDeMarca((m) => !!o.userData[m]) : undefined;
  if (!o) return undefined;
  return f ? { id: f.id, obj: o } : fotoDeObjeto(o.parent);
}

// fotoEnMundo(w, x, y): con la cámara encendida, un toque en (x, y) del mundo 3D w: si da en algo que tiene foto, el
// objeto tiembla (su animación de toque, userData.wob), Tito lo mira, se hace la foto y devuelve true; si no, false.
export function fotoEnMundo(w: Mundo, x: number, y: number): boolean {
  pickAt(x, y); // deja el rayo RC apuntando al toque
  const objetos = [...(w.trees ?? []), ...(w.fly ?? [])],
    hit = RC.intersectObjects(objetos, true)
      .map((h) => fotoDeObjeto(h.object))
      .find((f) => !!f);
  if (!hit) return false;
  hit.obj.userData.wob = T;
  if (w.tito) {
    const v = new THREE.Vector3();
    hit.obj.getWorldPosition(v);
    Object.assign(w.tito.userData, { lk: { p: v, t: T } });
  }
  hacerFotoDe(hit.id, x, y);
  return true;
}
