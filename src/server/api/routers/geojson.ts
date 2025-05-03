import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { geoJSON } from "~/server/db/schema";
import { sql } from "drizzle-orm";

export const geoJSONRouter = createTRPCRouter({
  getGeoJSON: publicProcedure
    .input(z.object({ country: z.string() }))
    .query(async ({ input, ctx }) => {
      const res = await ctx.db.query.geoJSON.findMany({
        where: sql`lower(${geoJSON.name}) = lower(${input.country})`,
        columns: {
          geojson: true,
        },
      });
      return res ?? [];
    }),
});
