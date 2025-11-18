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
