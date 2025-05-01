import MapCaller from "./_components/map-caller";
import { api, HydrateClient } from "~/trpc/server";
import OlMapComponent from "~/app/_components/openlayers";

// const LazyMap = dynamic(() => import("~/app/_components/map"), {
//   ssr: false,
//   loading: () => <p>Loading...</p>,
// });

export default async function Home() {
  return (
    <HydrateClient>
      {/* <MapCaller /> */}
      <OlMapComponent center={[12.5, 55.6]} zoom={12} />
    </HydrateClient>
  );
}
