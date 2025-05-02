// import MapCaller from "./_components/map-caller";
import { api, HydrateClient } from "~/trpc/server";
// import { api } from "~/trpc/react";
import OlMapComponent from "~/app/_components/olmap";
import type Feature from "ol/Feature";

export default async function Home() {
  // const [geoJSONData] = api.geoJSON.getGeoJSON.useSuspenseQuery({
  //   country: "Denmark",
  // });
  const geoJSONString = await api.geoJSON.getGeoJSON();
  // console.log(geoJSONString);
  let geoJSONData = null;
  if (geoJSONString === undefined) {
    console.warn("No geoJSON data available");
  } else {
    if (geoJSONString.geojson === null) {
      console.warn("geoJSON contains no content");
    } else geoJSONData = JSON.parse(geoJSONString.geojson) as Feature;
  }
  return (
    <HydrateClient>
      <OlMapComponent center={[12.5, 55.6]} zoom={6} data={geoJSONData} />
    </HydrateClient>
  );
}
