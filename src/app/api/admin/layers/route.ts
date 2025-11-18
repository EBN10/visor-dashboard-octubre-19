import { NextResponse } from "next/server"
import { db } from "~/server/db"
import { layers, type LayerConfig } from "~/server/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const rows = await db.select().from(layers)
  return NextResponse.json(rows)
}

function validateLayerConfig(kind: "vector"|"wms"|"xyz", config: any): { ok: boolean; error?: string } {
  if (!config || typeof config !== "object") return { ok: false, error: "config must be an object" }
  if (kind === "vector") {
    const required = ["type", "schema", "table", "geomColumn"]
    for (const k of required) if (!config[k]) return { ok: false, error: `missing ${k} in vector config` }
    if (config.type !== "vector") return { ok: false, error: "vector config.type must be 'vector'" }
  }
  if (kind === "wms") {
    const required = ["type", "url", "layers"]
    for (const k of required) if (!config[k]) return { ok: false, error: `missing ${k} in wms config` }
    if (config.type !== "wms") return { ok: false, error: "wms config.type must be 'wms'" }
  }
  if (kind === "xyz") {
    const required = ["type", "url"]
    for (const k of required) if (!config[k]) return { ok: false, error: `missing ${k} in xyz config` }
    if (config.type !== "xyz") return { ok: false, error: "xyz config.type must be 'xyz'" }
  }
  return { ok: true }
}

export async function POST(req: Request) {
  const body = await req.json()
  const { id, name, kind, groupId, order = 0, defaultVisible = false, config } = body ?? {}
  if (!id || !name || !kind || !groupId) return NextResponse.json({ error: "id,name,kind,groupId are required" }, { status: 400 })
  const v = validateLayerConfig(kind, config)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  await db.insert(layers).values({ id, name, kind, groupId, order, defaultVisible, config: config as LayerConfig }).onConflictDoNothing()
  const [row] = await db.select().from(layers).where(eq(layers.id, id)).limit(1)
  return NextResponse.json(row, { status: 201 })
}
