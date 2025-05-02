import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { geoJSON } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const geoJSONRouter = createTRPCRouter({
  getGeoJSON: publicProcedure
    // .input(z.object({ country: z.string() }))
    // .query(async ({ input, ctx }) => {
    .query(async ({ ctx }) => {
      return ctx.db.query.geoJSON.findFirst({
        where: eq(geoJSON.name, "Algeria"),
        // where: eq(geoJSON.name, input.country),
        columns: {
          geojson: true,
        },
      });
    }),
});