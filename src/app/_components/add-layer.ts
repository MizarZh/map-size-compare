import type { Feature } from "geojson";
import { type Map } from "leaflet";
import type { Layer } from "leaflet";
import trueSize from "./true-size-layer";

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  const outline = color;
  return [color, outline];
};

const addLayer = (
  data: Feature,
  name: string,
  map: Map,
  tooltipText?: string,
) => {
  const boundaryColor = getRandomColor();
  // Use type assertion to tell TypeScript that trueSize returns a Layer
  const layer = trueSize(data, {
    iconAnchor: [35, 35],
    fill: true,
    fillColor: boundaryColor[0],
    fillOpacity: 0.15,
    color: "black", //boundaryColor[1] is meant to be a
    weight: 3, //darker version of the same random
    opacity: 1, //color but black just looks nicer.
    stroke: true,
    tooltipText: tooltipText ?? name, // Use nullish coalescing operator instead of logical or
  }) as Layer;

  // Add the layer to the map
  layer.addTo(map);
};
export default addLayer;
