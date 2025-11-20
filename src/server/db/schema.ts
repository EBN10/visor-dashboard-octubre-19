import {
  pgSchema,
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

// ============================================================================
// 1. SCHEMAS
// ============================================================================
export const cartoCensalSchema = pgSchema('carto_censal');

// ============================================================================
// 2. ENUMS
// ============================================================================
export const layerKind = pgEnum("layer_kind", ["vector", "xyz", "wms"])

// ============================================================================
// 3. TYPES
// ============================================================================
export type VectorConfig = {
  type: "vector"
  schema: string
  table: string
  geomColumn: string
  srid: number
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

// ============================================================================
// 4. TABLES
// ============================================================================

// --- Carto Censal Tables ---
export const radiosCensales = cartoCensalSchema.table(
  'pais8622',
  {
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
    return {
      pk: primaryKey({ columns: [table.codIndec] }),
    };
  },
);

// --- Layer Management Tables ---

// Groups of layers (e.g. "Censo 2022", "Base Maps")
export const layerGroups = pgTable("layer_groups", {
  id: text("id").primaryKey(), // slug, e.g. "censo-2022"
  name: text("name").notNull(),
  parentId: text("parent_id").references((): AnyPgColumn => layerGroups.id),
  order: integer("order").notNull().default(0),
})

// Individual Layers
export const layers = pgTable("layers", {
  id: text("id").primaryKey(), // slug, e.g. "radios-censales"
  name: text("name").notNull(),
  kind: layerKind("kind").notNull(),
  groupId: text("group_id")
    .references(() => layerGroups.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull().default(0),
  defaultVisible: boolean("default_visible").notNull().default(false),
  config: jsonb("config").$type<LayerConfig>().notNull(),
})