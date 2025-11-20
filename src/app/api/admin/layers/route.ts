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
  try {
    const body = await req.json()
    const { id, name, kind, groupId, order = 0, defaultVisible = false, config } = body ?? {}
    
    if (!id || !name || !kind || !groupId) {
      return NextResponse.json({ error: "id, name, kind, groupId are required" }, { status: 400 })
    }

    // Check if ID already exists
    const existing = await db.select().from(layers).where(eq(layers.id, id)).limit(1)
    if (existing.length > 0) {
      return NextResponse.json({ error: `Layer with id '${id}' already exists` }, { status: 409 })
    }

    const v = validateLayerConfig(kind, config)
    if (!v.ok) {
      return NextResponse.json({ error: v.error }, { status: 400 })
    }

    await db.insert(layers).values({ 
      id, 
      name, 
      kind, 
      groupId, 
      order, 
      defaultVisible, 
      config: config as LayerConfig 
    })
    
    const [row] = await db.select().from(layers).where(eq(layers.id, id)).limit(1)
    return NextResponse.json(row, { status: 201 })
  } catch (error: any) {
    console.error("Error creating layer:", error)
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    await db.delete(layers).where(eq(layers.id, id))
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Error deleting layer:", error)
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, name, groupId, config, defaultVisible, order } = body ?? {}

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

    // Optional: Add validation for config if kind is also provided in PUT request
    // For now, assuming config is valid or not changing kind.
    // If kind is also updated, validateLayerConfig would need to be called.

    await db.update(layers)
      .set({ 
        name, 
        groupId, 
        config: config as LayerConfig, // Ensure type safety for config
        defaultVisible, 
        order 
      })
      .where(eq(layers.id, id))

    const [row] = await db.select().from(layers).where(eq(layers.id, id)).limit(1)
    return NextResponse.json(row)
  } catch (error: any) {
    console.error("Error updating layer:", error)
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 })
  }
}
