// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, sqliteTableCreator } from "drizzle-orm/sqlite-core";
import type { FeatureCollection } from "geojson";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(
  (name) => `map-size-compare_${name}`,
);

export const geoJSON = createTable(
  "countries",
  (d) => ({
    // id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    id: d.text().primaryKey(),
    name: d.text({ length: 256 }),
    iso3: d.text(),
    iso2: d.text(),
    geojson: d.text("geojson", { mode: "json" }).$type<FeatureCollection>(),
  }),
  (t) => [index("name_idx").on(t.name)],
);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: d.text({ length: 256 }),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);
