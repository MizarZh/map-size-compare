export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Only POST allowed. Upload GeoJSON via POST.', { status: 405 });
    }

    try {
      const geoData = await request.json(); // Assumes the body is the full countries.geojson

      if (geoData.type !== 'FeatureCollection' || !Array.isArray(geoData.features)) {
        return new Response('Invalid GeoJSON format: Expected a FeatureCollection with features array.', { status: 400 });
      }

      const features = geoData.features;
      console.log(`Received ${features.length} features`);

      // Optional: Initialize the DB schema if not already created
      
      await initializeSchema(env.DB);

      // Insert countries into D1
      const insertStmt = env.DB.prepare(
        `INSERT OR REPLACE INTO countries (id, name, iso3, iso2, geojson) VALUES (?, ?, ?, ?, ?)`
      );

      const insertBatch = [];

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

        insertBatch.push(insertStmt.bind(safeId, name, iso3, iso2, geojsonStr));
      }

      await env.DB.batch(insertBatch);

      return new Response(`Inserted ${insertBatch.length} countries.`, { status: 200 });

    } catch (err) {
      console.error(err);
      return new Response(`Error: ${err.message}`, { status: 500 });
    }
  },
};

// Initialize schema if needed
async function initializeSchema(db) {
  const sql = `CREATE TABLE IF NOT EXISTS countries (id TEXT PRIMARY KEY,name TEXT NOT NULL,iso3 TEXT,iso2 TEXT,geojson TEXT NOT NULL);`;

  try {
    await db.exec(sql);
  } catch (e) {
    throw new Error("Schema creation failed: " + e.message);
  }
}