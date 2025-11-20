import { NextResponse } from "next/server"
import { db } from "~/server/db"
import { layerGroups } from "~/server/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const rows = await db.select().from(layerGroups)
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { id, name, parentId = null, order = 0 } = body ?? {}
  if (!id || !name) return NextResponse.json({ error: "id and name are required" }, { status: 400 })

  await db.insert(layerGroups).values({ id, name, parentId, order }).onConflictDoNothing()
  const [row] = await db.select().from(layerGroups).where(eq(layerGroups.id, id)).limit(1)
  return NextResponse.json(row, { status: 201 })
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, name, parentId, order } = body ?? {}
    
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

    await db.update(layerGroups)
      .set({ name, parentId, order })
      .where(eq(layerGroups.id, id))

    const [row] = await db.select().from(layerGroups).where(eq(layerGroups.id, id)).limit(1)
    return NextResponse.json(row)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

    await db.delete(layerGroups).where(eq(layerGroups.id, id))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
