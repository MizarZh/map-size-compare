import MapCaller from "./_components/map-caller";
import { HydrateClient, api } from "~/trpc/server";
import Search from "~/app/_components/search";

// import { api } from "~/trpc/react";
// import OlMapComponent from "~/app/_components/olmap";
// import type Feature from "ol/Feature";

export default async function Home() {
  // const [geoJSONData] = api.geoJSON.getGeoJSON.useSuspenseQuery({
  //   country: "Denmark",
  // });
  // console.log(geoJSONString);
  // let geoJSONData = null;
  // if (geoJSONString === undefined) {
  //   console.warn("No geoJSON data available");
  // } else {
  //   if (geoJSONString.geojson === null) {
  //     console.warn("geoJSON contains no content");
  //   } else geoJSONData = JSON.parse(geoJSONString.geojson) as Feature;
  // }
  // api.geoJSON.getGeoJSON()
  return (
    <HydrateClient>
      <MapCaller />
      <Search />
      {/* <OlMapComponent center={[12.5, 55.6]} zoom={6} data={geoJSONData} /> */}
    </HydrateClient>
  );
}
