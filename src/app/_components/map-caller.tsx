"use client";

import dynamic from "next/dynamic";

const LazyMap = dynamic(() => import("~/app/_components/map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const MapCaller = () => {
  return <LazyMap />;
};

export default MapCaller;
