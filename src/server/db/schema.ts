// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

// import { sql } from "drizzle-orm";
// import { index, sqliteTableCreator } from "drizzle-orm/sqlite-core";
import { pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  // (name) => `map-size-compare_${name}`,
  (name) => `${name}`,
);

export const geoJSON = createTable("countries", (d) => ({
  id: d.text().primaryKey().notNull(),
  name: d.text().notNull(),
  iso3: d.text().notNull(),
  iso2: d.text().notNull(),
  geojson: d.text().notNull(),
}));
