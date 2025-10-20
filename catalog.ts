import { db } from "~/server/db"
import { layerGroups, layers } from "~/server/db/schema"

async function main() {
  // Grupos
  await db
    .insert(layerGroups)
    .values([
      { id: "company", name: "Company", parentId: null, order: 0 },
      {
        id: "orgnacionales",
        name: "Organismos Nacionales",
        parentId: "company",
        order: 0,
      },
      { id: "indec", name: "INDEC", parentId: "orgnacionales", order: 0 },
    ])
    .onConflictDoNothing()

  // Capa vector desde PostGIS: carto_censal.pais8622 (geom SRID 4326)
  await db
    .insert(layers)
    .values([
      {
        id: "radios-censales",
        name: "Radios Censales",
        kind: "vector",
        groupId: "indec",
        order: 0,
        defaultVisible: false,
        config: {
          type: "vector",
          schema: "carto_censal",
          table: "pais8622",
          geomColumn: "geom",
          srid: 4326,
          popupProps: ["cod_indec", "jur", "dpto"],
        },
      },
    ])
    .onConflictDoNothing()
}

main().then(
  () => {
    console.log("Seed OK")
    process.exit(0)
  },
  (e) => {
    console.error(e)
    process.exit(1)
  },
)