"use client";
import React, { useEffect, useState, createContext } from "react";
import MapCaller from "~/app/_components/map-caller";
import Search from "~/app/_components/search";
import type { Feature } from "geojson";

export const GeoJSONContext = createContext<Feature | null>(null);

export const ClientWrapper = () => {
  const [geoJSONString, setGeoJSONString] = useState("");
  const [geoJSONData, setGeoJSONData] = useState<Feature | null>(
    null,
  );

  useEffect(() => {
    try {
      if (geoJSONString)
        setGeoJSONData(JSON.parse(geoJSONString) as Feature);
    } catch {
      console.error("JSON parse error");
    }
  }, [geoJSONString]);

  return (
    <GeoJSONContext.Provider value={geoJSONData}>
      <MapCaller />
      <Search setData={setGeoJSONString} />
    </GeoJSONContext.Provider>
  );
};
