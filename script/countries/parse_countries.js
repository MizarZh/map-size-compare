import fs from 'fs';
import { createClient } from '@libsql/client';

const client = createClient({ url: "file:./db.sqlite" });

async function parseGeoJson(path) {
  const geojson = JSON.parse(fs.readFileSync(path, 'utf-8'));
  const features = geojson.features;

  // Initialize the DB schema if not already created
  await initializeSchema(client);

  // Insert countries into D1
  for (const feature of features) {
    const name = feature.properties?.name;
    if (!name) continue;

    const iso3 = feature.properties["ISO3166-1-Alpha-3"] || null;
    const iso2 = feature.properties["ISO3166-1-Alpha-2"] || null;

    const safeId = iso3 || iso2 || name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const geojsonStr = JSON.stringify({
      type: 'Feature',
      properties: feature.properties,
      geometry: feature.geometry,
    });

    try {
      await client.execute({
        sql: `INSERT OR REPLACE INTO countries (id, name, iso3, iso2, geojson) VALUES (:id, :name, :iso3, :iso2, :geojson)`,
        args: { id: safeId, name: name, iso3: iso3, iso2: iso2, geojson: geojsonStr },
      });
    } catch (e) {
      console.error("Insert failed: " + e.message);
    }
  }

  console.log(`Inserted ${features.length} countries.`);
}

// Initialize schema if needed
async function initializeSchema(client) {
  const sql = `CREATE TABLE IF NOT EXISTS countries (id TEXT PRIMARY KEY,name TEXT NOT NULL,iso3 TEXT,iso2 TEXT,geojson TEXT NOT NULL);`;

  try {
    await client.execute({ sql: sql });
    console.log("Schema created successfully");
  } catch (e) {
    throw new Error("Schema creation failed: " + e.message);
  }
}

await parseGeoJson('script/countries/countries.geojson');
