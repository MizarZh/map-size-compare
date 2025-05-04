"use client";
import React, { useEffect, useRef } from "react";
import type { FeatureCollection } from "geojson";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  ZoomControl,
} from "react-leaflet";
import "~/app/_components/true-size-layer";
import addLayer from "~/app/_components/add-layer";
import "leaflet/dist/leaflet.css";
import L, { type Map } from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  // @ts-expect-error idk why pass StaticImageData to string works
  iconUrl: icon,
  // @ts-expect-error idk why pass StaticImageData to string works
  shadowUrl: iconShadow,
});

// const addLayer = (data) => {

// };

L.Marker.prototype.options.icon = DefaultIcon;

const geojsonData: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "My Polygon",
        color: "blue",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [12.5, 55.6],
            [12.6, 55.7],
            [12.7, 55.6],
            [12.6, 55.5],
            [12.5, 55.6],
          ],
        ],
      },
    },
  ],
};

interface MapComponentProps {
  data: FeatureCollection | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ data }) => {
  const position: [number, number] = [0, 0];
  const map = useRef<Map>(null);

  useEffect(() => {
    console.log(data);
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
