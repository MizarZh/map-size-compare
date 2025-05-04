import ClientWrapper from "~/app/_components/client-wrapper";
import { HydrateClient, api } from "~/trpc/server";
// import { create } from "zustand";

// import { api } from "~/trpc/react";
// import OlMapComponent from "~/app/_components/olmap";
// import type Feature from "ol/Feature";

export default function Home() {
  return (
    <HydrateClient>
      <ClientWrapper />
      {/* <OlMapComponent center={[12.5, 55.6]} zoom={6} data={geoJSONData} /> */}
    </HydrateClient>
  );
}
