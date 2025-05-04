"use client";
import React, { useEffect, useState } from "react";
import MapCaller from "~/app/_components/map-caller";
import Search from "~/app/_components/search";
import type { GeoJsonObject, FeatureCollection } from "geojson";

const ClientWrapper = () => {
  const [geoJSONString, setGeoJSONString] = useState("");
  const [geoJSONData, setGeoJSONData] = useState<FeatureCollection | null>(
    null,
  );

  useEffect(() => {
    console.log("here", geoJSONString);
    // console.log("here", geoJSONString);
    try {
      setGeoJSONData(JSON.parse(geoJSONString) as FeatureCollection);
    } catch {
      console.error("JSON parse error");
    }
  }, [geoJSONString]);

  return (
    <>
      <MapCaller data={geoJSONData} />
      <Search setData={setGeoJSONString} />
    </>
  );
};

export default ClientWrapper;
