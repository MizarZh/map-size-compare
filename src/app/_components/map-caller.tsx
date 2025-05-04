"use client";

import dynamic from "next/dynamic";
import type { FeatureCollection } from "geojson";

const LazyMap = dynamic(() => import("~/app/_components/map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

interface MapCallerProps {
  data: FeatureCollection | null;
}

const MapCaller: React.FC<MapCallerProps> = ({ data }) => {
  return <LazyMap data={data} />;
};

export default MapCaller;
