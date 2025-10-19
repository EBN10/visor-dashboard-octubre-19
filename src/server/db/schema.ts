import {
  pgSchema, // <--- Importa esto
  varchar,
  integer,
  doublePrecision,
  char,
  text,
  primaryKey,
  geometry,
} from 'drizzle-orm/pg-core';

// 1. Primero, definimos el esquema de PostgreSQL que vamos a usar
export const cartoCensalSchema = pgSchema('carto_censal');

// 2. Luego, creamos la tabla DENTRO de ese esquema
export const radiosCensales = cartoCensalSchema.table(
  'pais8622', // Nombre de la tabla (ya no necesita el esquema aquí)
  {
    // Las columnas se mantienen exactamente igual
    id: integer('id').notNull(),
    cpr: varchar('cpr', { length: 2 }),
    jur: text('jur'),
    cde: varchar('cde', { length: 3 }),
    dpto: text('dpto'),
    cfn: varchar('cfn', { length: 2 }),
    cro: varchar('cro', { length: 2 }),
    tro: char('tro', { length: 1 }),
    codIndec: varchar('cod_indec', { length: 9 }).notNull(),
    shapeArea: doublePrecision('shape_area'),
    shapeLen: doublePrecision('shape_len'),
    geom: geometry('geom', { type: 'MultiPolygon', srid: 4326 }).notNull(),
  },
  (table) => {
    // La clave primaria también se mantiene igual
    return {
      pk: primaryKey({ columns: [table.codIndec] }),
    };
  },
);