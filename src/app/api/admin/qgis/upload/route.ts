import { NextResponse } from "next/server"
import { db } from "~/server/db"
import { layers, layerGroups } from "~/server/db/schema"
import { sql } from "drizzle-orm"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const layerName = formData.get("name") as string
    const groupId = formData.get("groupId") as string

    if (!file || !layerName || !groupId) {
      return NextResponse.json({ error: "File, name, and groupId are required" }, { status: 400 })
    }

    const text = await file.text()
    let geojson;
    try {
      geojson = JSON.parse(text)
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON file" }, { status: 400 })
    }

    if (!geojson.features || !Array.isArray(geojson.features) || geojson.features.length === 0) {
      return NextResponse.json({ error: "Invalid GeoJSON: No features found" }, { status: 400 })
    }

    // 1. Analyze ALL features to determine table schema (superset of properties)
    const allProperties = new Map<string, string>()
    
    // Determine input SRID from GeoJSON CRS
    let inputSrid = 4326
    if (geojson.crs && geojson.crs.properties && geojson.crs.properties.name) {
      const crsName = geojson.crs.properties.name
      const match = crsName.match(/EPSG[:]+(\d+)/i)
      if (match && match[1]) {
        inputSrid = parseInt(match[1], 10)
      }
    }
    console.log(`Detected SRID: ${inputSrid}`)

    // We'll also check for mixed geometry types, though we'll default to generic GEOMETRY
    // to be safe.
    
    for (const feature of geojson.features) {
      const props = feature.properties || {}
      for (const [key, value] of Object.entries(props)) {
        const sanitizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, "_")
        
        // Simple type inference: if we see a string, it stays string. 
        // If we see a number, it's numeric unless we already saw it as string.
        // If we see boolean, it's boolean unless we already saw it as string/number.
        // Default/Fallback is TEXT.
        
        const currentType = allProperties.get(sanitizedKey)
        let newType = "TEXT"
        
        if (typeof value === "number") newType = "NUMERIC"
        else if (typeof value === "boolean") newType = "BOOLEAN"
        else newType = "TEXT"

        if (!currentType) {
          allProperties.set(sanitizedKey, newType)
        } else if (currentType !== newType) {
          // Conflict: upgrade to TEXT to be safe
          allProperties.set(sanitizedKey, "TEXT")
        }
      }
    }

    // Sanitize table name (slugify)
    const tableName = layerName.toLowerCase().replace(/[^a-z0-9_]/g, "_")
    const tableId = `qgis_${tableName}_${Date.now()}` // Unique ID

    // 2. Create Table SQL
    const columnsSql: string[] = []
    allProperties.forEach((type, key) => {
      columnsSql.push(`"${key}" ${type}`)
    })

    // Use generic GEOMETRY type to allow mixed geometries (Point, MultiPolygon, etc.)
    // SRID 4326 is standard for GeoJSON
    
    // Determine a safe Primary Key name to avoid collision with user properties
    let pkName = "id"
    if (allProperties.has("id")) pkName = "ogc_fid"
    if (allProperties.has("ogc_fid")) pkName = "gid"
    
    const createTableQuery = `
      CREATE TABLE public."${tableId}" (
        ${pkName} SERIAL PRIMARY KEY,
        ${columnsSql.join(",\n")}${columnsSql.length > 0 ? "," : ""}
        geom geometry(Geometry, 4326)
      );
    `

    // Execute Create Table
    await db.execute(sql.raw(createTableQuery))

    // 3. Insert Data
    // We construct INSERT statements dynamically for each feature, 
    // ensuring we handle missing properties (NULL) and escape strings.
    
    for (const feature of geojson.features) {
      const props = feature.properties || {}
      const geom = feature.geometry
      
      const colNames: string[] = []
      const colValues: string[] = []

      allProperties.forEach((_, key) => {
        // We need to find the original key in props that matches this sanitized key
        // This is O(N) per property, but robust. 
        // Optimization: create a map of sanitized -> original keys for each feature? 
        // For now, simple iteration.
        
        // Actually, we can just iterate the props of the feature and match sanitized keys.
        // But we need to insert ALL columns defined in the table, or at least the ones present.
        // It's safer to insert only present ones and let DB handle NULLs, 
        // BUT we need to match the sanitized column names.
        
        // Let's iterate the TABLE columns (allProperties) and find value in feature.
        // We need a reverse mapping or just loose matching.
        // To be safe, let's look for the value in props where key.toLowerCase()... matches.
        
        const originalKey = Object.keys(props).find(k => k.toLowerCase().replace(/[^a-z0-9_]/g, "_") === key)
        const value = originalKey ? props[originalKey] : null

        if (value !== undefined && value !== null) {
          colNames.push(`"${key}"`)
          if (typeof value === "string") {
             colValues.push(`'${value.replace(/'/g, "''")}'`)
          } else {
             colValues.push(String(value))
          }
        }
      })

      // Construct geometry expression based on input SRID
      // If input is not 4326, we transform it.
      const geomExpr = inputSrid === 4326 
        ? `ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), 4326)`
        : `ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), ${inputSrid}), 4326)`

      if (colNames.length > 0) {
        const insertQuery = `
          INSERT INTO public."${tableId}" (${colNames.join(",")}, geom)
          VALUES (${colValues.join(",")}, ${geomExpr});
        `
        await db.execute(sql.raw(insertQuery))
      } else {
        // Case with no properties, just geometry
        const insertQuery = `
          INSERT INTO public."${tableId}" (geom)
          VALUES (${geomExpr});
        `
        await db.execute(sql.raw(insertQuery))
      }
    }

    // 4. Register Layer
    await db.insert(layers).values({
      id: tableId,
      name: layerName,
      kind: "vector",
      groupId: groupId,
      order: 0,
      defaultVisible: true,
      config: {
        type: "vector",
        schema: "public",
        table: tableId,
        geomColumn: "geom",
        srid: 4326,
        popupProps: Array.from(allProperties.keys())
      }
    })

    return NextResponse.json({ success: true, layerId: tableId }, { status: 201 })

  } catch (error: any) {
    console.error("Error processing QGIS upload:", error)
    // Return a JSON response even for 500 errors so the frontend can parse it
    return NextResponse.json(
      { 
        error: error.message || "Internal Server Error",
        details: error.stack 
      }, 
      { status: 500 }
    )
  }
}
