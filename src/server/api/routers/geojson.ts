import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { geoJSON } from "~/server/db/schema";
import { like, eq } from "drizzle-orm";

export const geoJSONRouter = createTRPCRouter({
  getGeoJSON: publicProcedure
    .input(z.object({ country: z.string() }))
    .query(async ({ input, ctx }) => {
      const res = await ctx.db.query.geoJSON.findMany({
        where: like(geoJSON.name, `%${input.country}%`),
        columns: {
          geojson: true,
        },
      });
      return res ?? [];
    }),
  getAllCountryData: publicProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.query.geoJSON.findMany({
      columns: {
        geojson: false,
      },
    });
    return res ?? [];
  }),
  getCountryData: publicProcedure
    .input(z.object({ country: z.string() }))
    .query(async ({ input, ctx }) => {
      const res = await ctx.db.query.geoJSON.findMany({
        where: like(geoJSON.name, `%${input.country}%`),
        columns: {
          geojson: false,
        },
      });
      return res ?? [];
    }),
  getGeoJSONfromName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input, ctx }) => {
      const res = await ctx.db.query.geoJSON.findFirst({
        where: eq(geoJSON.name, input.name),
      });
      return res ?? [];
    }),
});
