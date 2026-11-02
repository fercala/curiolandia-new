/*
 * contenido/ingles.ts: las palabras en inglés de la Isla del Inglés (fase I1 de docs/PLAN-INGLES.md). Son los conjuntos
 * de palabras nuevos de la isla (la familia, el cuerpo, los juguetes...), cada uno en la zona donde se aprende: la
 * Playa Hello (3 años), el Parque de Londres (4) y el Pueblo de los Cuentos (5). Las cuatro casitas que ya tenía el
 * Rincón del inglés (saludos, colores, números y animales) siguen con sus palabras en EN (temas/ingles.ts), porque
 * algunas se dibujan con una función (las manchas de color, los números, las caritas) y no con un dibujo de PICS.
 * Cada palabra trae cómo se dice en inglés (el inglés de Inglaterra, el que se enseña en los colegios de España), su
 * traducción al castellano de España, la edad desde la que sale y su dibujo (clave de PICS). Los animales de la granja
 * traen además lo que dicen en inglés («moo»).
 * Es CONTENIDO: solo datos, sin dibujo ni S. Pruebas: tests/unidad/ingles.test.ts (que existan los dibujos, que no se
 * repitan las palabras y que cada conjunto tenga palabras para los 3 años).
 * Exporta: el tipo PalabraIngles, PALABRAS_INGLES, ZONA_DE_CONJUNTO, conjuntosDeZona y palabrasDeEdad.
 * No importa nada.
 */
/* eslint-disable ts-patterns/no-magic-numbers -- las edades (3, 4 y 5) son los datos de cada palabra. */

/** Una palabra de la Isla del Inglés. */
export interface PalabraIngles {
  /** Cómo se dice en inglés, con la primera letra en mayúscula: 'Dog', 'Ice cream'. */
  readonly en: string;
  /** Su traducción al castellano de España: 'Perro'. */
  readonly es: string;
  /** Edad desde la que sale en los juegos (3, 4 o 5): a los 3 años, las más fáciles. */
  readonly a: number;
  /** Su dibujo: clave de PICS (dibujos/todos.ts). */
  readonly k: string;
  /** Solo los animales de la granja: lo que dicen en inglés ('Moo'). */
  readonly dice?: string;
}

// p(en, es, a, k): una palabra (para que las listas de abajo se lean en una línea por palabra).
const p = (en: string, es: string, a: number, k: string): PalabraIngles => ({ en, es, a, k });

// PALABRAS_INGLES: los conjuntos de palabras de la isla, por nombre (el nombre en inglés del tema). Cada conjunto tiene
// al menos cuatro palabras para los 3 años, para que sus juegos funcionen a cualquier edad (en modo libre, un niño de 3
// años puede entrar en una casita de 5).
export const PALABRAS_INGLES: Readonly<Record<string, readonly PalabraIngles[]>> = {
  // Playa Hello (3 años)
  family: [p('Mum', 'Mamá', 3, 'mama'), p('Dad', 'Papá', 3, 'papa'), p('Baby', 'Bebé', 3, 'bebe'), p('Brother', 'Hermano', 3, 'hermano'),
    p('Sister', 'Hermana', 4, 'hermana'), p('Grandma', 'Abuela', 4, 'abuela'), p('Grandpa', 'Abuelo', 5, 'abuelo')],
  body: [p('Hand', 'Mano', 3, 'mano'), p('Foot', 'Pie', 3, 'pie'), p('Eye', 'Ojo', 3, 'ojo'), p('Nose', 'Nariz', 3, 'nariz'),
    p('Mouth', 'Boca', 4, 'boca'), p('Ear', 'Oreja', 4, 'oreja'), p('Teeth', 'Dientes', 5, 'dientes')],
  toys: [p('Ball', 'Pelota', 3, 'pelota'), p('Doll', 'Muñeca', 3, 'muneca'), p('Teddy', 'Osito de peluche', 3, 'peluche'), p('Balloon', 'Globo', 3, 'globo'),
    p('Train', 'Tren', 4, 'trenJuguete'), p('Robot', 'Robot', 4, 'robot'), p('Kite', 'Cometa', 5, 'cometa'), p('Blocks', 'Bloques', 5, 'bloques')],
  fruit: [p('Apple', 'Manzana', 3, 'manzana'), p('Banana', 'Plátano', 3, 'banana'), p('Orange', 'Naranja', 3, 'naranja'), p('Strawberry', 'Fresa', 3, 'fresa'),
    p('Pear', 'Pera', 4, 'pera'), p('Grapes', 'Uvas', 4, 'uva'), p('Lemon', 'Limón', 5, 'limon'), p('Watermelon', 'Sandía', 5, 'sandia'), p('Pineapple', 'Piña', 5, 'pina')],
  // Parque de Londres (4 años)
  clothes: [p('Hat', 'Gorro', 3, 'gorro'), p('Shoe', 'Zapato', 3, 'zapato'), p('T-shirt', 'Camiseta', 3, 'remera'), p('Coat', 'Abrigo', 3, 'abrigo'),
    p('Scarf', 'Bufanda', 4, 'bufanda'), p('Gloves', 'Guantes', 4, 'guantes'), p('Boots', 'Botas', 4, 'bota'), p('Pyjamas', 'Pijama', 5, 'pijama'), p('Cap', 'Gorra', 5, 'gorra')],
  food: [p('Bread', 'Pan', 3, 'pan'), p('Milk', 'Leche', 3, 'leche'), p('Egg', 'Huevo', 3, 'huevo'), p('Ice cream', 'Helado', 3, 'helado'),
    p('Cake', 'Tarta', 4, 'tarta'), p('Cheese', 'Queso', 4, 'queso'), p('Biscuit', 'Galleta', 4, 'galleta'), p('Juice', 'Zumo', 5, 'zumo'), p('Chocolate', 'Chocolate', 5, 'chocolate')],
  house: [p('Bed', 'Cama', 3, 'cama'), p('Chair', 'Silla', 3, 'silla'), p('Table', 'Mesa', 3, 'mesa'), p('Sofa', 'Sofá', 3, 'sofa'),
    p('Lamp', 'Lámpara', 4, 'lampara'), p('Clock', 'Reloj', 4, 'reloj'), p('Bath', 'Bañera', 5, 'banera'), p('Fridge', 'Nevera', 5, 'nevera')],
  weather: [p('Sunny', 'Hace sol', 3, 'sol'), p('Rainy', 'Llueve', 3, 'lluvia'), p('Cloudy', 'Está nublado', 3, 'nublado'), p('Snowy', 'Nieva', 3, 'nieve'),
    p('Windy', 'Hace viento', 4, 'viento'), p('Rainbow', 'Arcoíris', 4, 'arcoiris'), p('Stormy', 'Hay tormenta', 5, 'tormenta')],
  transport: [p('Bus', 'Autobús', 3, 'autobus'), p('Car', 'Coche', 3, 'auto'), p('Plane', 'Avión', 3, 'avion'), p('Boat', 'Barco', 3, 'barco'),
    p('Bike', 'Bici', 4, 'bici'), p('Train', 'Tren', 4, 'tren'), p('Helicopter', 'Helicóptero', 5, 'helicoptero'), p('Rocket', 'Cohete', 5, 'cohete'), p('Tractor', 'Tractor', 5, 'tractor')],
  farm: [{ ...p('Cow', 'Vaca', 3, 'vaca'), dice: 'Moo' }, { ...p('Pig', 'Cerdo', 3, 'cerdo'), dice: 'Oink' }, { ...p('Duck', 'Pato', 3, 'pato'), dice: 'Quack' },
    { ...p('Sheep', 'Oveja', 3, 'oveja'), dice: 'Baa' }, { ...p('Dog', 'Perro', 4, 'perro'), dice: 'Woof' }, { ...p('Cat', 'Gato', 4, 'gato'), dice: 'Meow' },
    { ...p('Horse', 'Caballo', 5, 'caballo'), dice: 'Neigh' }, { ...p('Hen', 'Gallina', 5, 'gallina'), dice: 'Cluck' }],
  // Pueblo de los Cuentos (5 años)
  seasons: [p('Spring', 'Primavera', 3, 'plantaFlor'), p('Summer', 'Verano', 3, 'sol'), p('Autumn', 'Otoño', 3, 'hojaNaranja'), p('Winter', 'Invierno', 3, 'copo')],
  jobs: [p('Doctor', 'Médico', 3, 'medico'), p('Teacher', 'Maestra', 3, 'maestra'), p('Police officer', 'Policía', 3, 'policia'), p('Firefighter', 'Bombera', 3, 'bombera'),
    p('Cook', 'Cocinera', 4, 'cocinera'), p('Farmer', 'Granjera', 4, 'granjera'), p('Baker', 'Panadero', 4, 'panadero'), p('Astronaut', 'Astronauta', 5, 'astronauta'), p('Postman', 'Cartero', 5, 'cartero')],
  shop: [p('Apple', 'Manzana', 3, 'manzana'), p('Bread', 'Pan', 3, 'pan'), p('Milk', 'Leche', 3, 'leche'), p('Banana', 'Plátano', 3, 'banana'),
    p('Cheese', 'Queso', 4, 'queso'), p('Egg', 'Huevo', 4, 'huevo'), p('Carrot', 'Zanahoria', 4, 'zanahoria'), p('Tomato', 'Tomate', 5, 'tomate'), p('Fish', 'Pescado', 5, 'pescado')],
};

// ZONA_DE_CONJUNTO: en qué zona de la isla (ZONAS_INGLES de dominio/apertura.ts) se aprende cada conjunto.
export const ZONA_DE_CONJUNTO: Readonly<Record<string, string>> = {
  family: 'playaHello', body: 'playaHello', toys: 'playaHello', fruit: 'playaHello',
  clothes: 'parqueLondres', food: 'parqueLondres', house: 'parqueLondres', weather: 'parqueLondres', transport: 'parqueLondres', farm: 'parqueLondres',
  seasons: 'puebloCuentos', jobs: 'puebloCuentos', shop: 'puebloCuentos',
};

// conjuntosDeZona(z): los nombres de los conjuntos de la zona z, en el orden de PALABRAS_INGLES.
export function conjuntosDeZona(z: string): string[] {
  return Object.keys(PALABRAS_INGLES).filter((c) => ZONA_DE_CONJUNTO[c] === z);
}

// palabrasDeEdad(conjunto, edad): las palabras del conjunto que salen a esa edad (las de su edad y las de antes). Lista
// vacía si el conjunto no existe.
export function palabrasDeEdad(conjunto: string, edad: number): PalabraIngles[] {
  return (PALABRAS_INGLES[conjunto] ?? []).filter((w) => w.a <= edad);
}
