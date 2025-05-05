"use client";
import React, { useEffect, useRef, useContext } from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { type Map } from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { GeoJSONContext } from "./client-wrapper";
import addLayer from "~/app/_components/add-layer";
import "~/app/_components/true-size-layer";

const DefaultIcon = L.icon({
  // @ts-expect-error idk why pass StaticImageData to string works
  iconUrl: icon,
  // @ts-expect-error idk why pass StaticImageData to string works
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = () => {
  const position: [number, number] = [0, 0];
  const map = useRef<Map>(null);
  const data = useContext(GeoJSONContext);

  useEffect(() => {
    if (data && map.current) addLayer(data, "test", map.current);
  }, [data]);

  return (
    <MapContainer
      center={position}
      zoom={3}
      className="z-0 h-screen w-screen"
      zoomControl={false}
      ref={map}
    >
      <ZoomControl position={"topright"} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
};

export default MapComponent;
