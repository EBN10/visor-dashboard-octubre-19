import {
  pgSchema, // <--- Importa esto
  varchar,
  integer,
  doublePrecision,
  char,
  text,
  primaryKey,
  geometry,
  pgTable,
  boolean,
  jsonb,
  pgEnum,
  type AnyPgColumn,
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

export const layerKind = pgEnum("layer_kind", ["vector", "xyz", "wms"])

export type VectorConfig = {
  type: "vector"
  schema: string
  table: string
  geomColumn: string
  srid: number
  // opcionalmente propiedades a mostrar, estilo, etc.
  popupProps?: string[]
}

export type WmsConfig = {
  type: "wms"
  url: string
  layers: string
  version?: string
  format?: string
  transparent?: boolean
}

export type XyzConfig = {
  type: "xyz"
  url: string
  attribution?: string
}

export type LayerConfig = VectorConfig | WmsConfig | XyzConfig

export const layerGroups = pgTable("layer_groups", {
  id: text("id").primaryKey(), // slug, p.ej. "company", "indec"
  name: text("name").notNull(),
  parentId: text("parent_id").references((): AnyPgColumn => layerGroups.id),
  order: integer("order").notNull().default(0),
})

export const layers = pgTable("layers", {
  id: text("id").primaryKey(), // slug, p.ej. "radios-censales"
  name: text("name").notNull(),
  kind: layerKind("kind").notNull(),
  groupId: text("group_id")
    .references(() => layerGroups.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull().default(0),
  defaultVisible: boolean("default_visible").notNull().default(false),
  config: jsonb("config").$type<LayerConfig>().notNull(),
})