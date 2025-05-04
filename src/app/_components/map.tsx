"use client";
import React from "react";
import type { GeoJsonObject, FeatureCollection } from "geojson";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  ZoomControl,
} from "react-leaflet";
import "./true-size-layer";
import "leaflet/dist/leaflet.css";
import L, { Map } from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  // @ts-expect-error idk why pass StaticImageData to string works
  iconUrl: icon,
  // @ts-expect-error idk why pass StaticImageData to string works
  shadowUrl: iconShadow,
});

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

interface TrueSizeLayerProps {
  data: FeatureCollection;
  color: string;
  weight: number;
  opacity: number;
}

interface MapComponentProps {
  data: FeatureCollection | null;
}

// const TrueSizeLayer: React.FC<TrueSizeLayerProps> = ({ data, color, weight, opacity, ref }) => {

// };

const MapComponent: React.FC<MapComponentProps> = ({ data }) => {
  const position: [number, number] = [55.6, 12.5];

  return (
    <MapContainer
      center={position}
      zoom={13}
      className="z-0 h-screen w-screen"
      zoomControl={false}
    >
      <ZoomControl position={"topright"} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data && <GeoJSON data={data} />}
    </MapContainer>
  );
};

export default MapComponent;
