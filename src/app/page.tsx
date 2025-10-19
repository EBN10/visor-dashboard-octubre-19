// src/app/page.tsx

import { db } from "../server/db";
import { radiosCensales } from "../server/db/schema"; // Importa también la tabla
import { sql } from "drizzle-orm"; // Importa la función sql

export default async function HomePage() {
  // En lugar de un 'findFirst' genérico, construimos una consulta explícita
  const radiosConGeoJSON = await db
    .select({
      // Seleccionamos las columnas que nos interesan
      id: radiosCensales.id,
      codIndec: radiosCensales.codIndec,
      dpto: radiosCensales.dpto,
      // Y lo más importante: convertimos la geometría a un string GeoJSON
      geojson: sql<string>`ST_AsGeoJSON(${radiosCensales.geom})`.as('geojson'),
    })
    .from(radiosCensales) // Desde nuestra tabla
    .limit(1); // Y solo queremos el primer resultado

  // El resultado será un array, así que tomamos el primer elemento
  const primerRadio = radiosConGeoJSON[0];

  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>Prueba de Conexión Drizzle + PostGIS</h1>
      <p>
        Si ves datos aquí abajo, ¡significa que todo está funcionando!
      </p>
      <h2>Datos del primer radio censal (con GeoJSON):</h2>
      <pre
        style={{
          background: '#222',
          color: '#eee',
          padding: '1rem',
          borderRadius: '8px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {/*
          El campo 'geojson' es un string, así que lo parseamos 
          para que se vea bonito en el JSON de salida.
        */}
        {JSON.stringify(
          {
            ...primerRadio,
            geojson: primerRadio.geojson ? JSON.parse(primerRadio.geojson) : null,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}