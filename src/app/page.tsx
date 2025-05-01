import Link from "next/link";
import dynamic from "next/dynamic";
// import { LatestPost } from "~/app/_components/post";
import MapCaller from "./_components/map-caller";
import { api, HydrateClient } from "~/trpc/server";

// const LazyMap = dynamic(() => import("~/app/_components/map"), {
//   ssr: false,
//   loading: () => <p>Loading...</p>,
// });

export default async function Home() {
  return (
    <HydrateClient>
      <MapCaller />
    </HydrateClient>
  );
}
