"use client";
import React, {
  useEffect,
  useRef,
  useContext,
  useState,
  useCallback,
} from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { type Map, type Layer } from "leaflet";
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
  const [_, setLayers] = useState<Layer[]>([]);

  // Handler for removing a layer
  const handleRemoveLayer = useCallback((layer: Layer) => {
    // Remove the layer from the map
    // layer.getTooltip()?.remove();
    layer.remove();

    // Update the layers state to remove this layer
    setLayers((prevLayers) => prevLayers.filter((l) => l !== layer));
  }, []);

  useEffect(() => {
    if (data && map.current) {
      const layerName = (data.properties?.name as string) ?? "Unnamed Layer";
      const layer = addLayer(data, layerName, map.current);

      // Add the new layer to our tracked layers
      if (layer) {
        map.current.on("contextmenu", (e) => {
          if (
            e.originalEvent?.target &&
            (e.originalEvent.target as unknown as HTMLElement).nodeName ==
              "path"
          ) {
            handleRemoveLayer(e.originalEvent.target as unknown as Layer);
          }
        });
        setLayers((prevLayers) => [...prevLayers, layer]);
      }
    }
  }, [data, handleRemoveLayer, map]);

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
