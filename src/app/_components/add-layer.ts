import type { FeatureCollection } from "geojson";
import { type Map } from "leaflet";
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

const addLayer = (data: FeatureCollection, name: string, map: Map) => {
  const boundaryColor = getRandomColor();
  trueSize(data, {
    markerDiv: `<h2>${name}</h2>`,
    iconAnchor: [35, 35],
    fill: true,
    fillColor: boundaryColor[0],
    fillOpacity: 0.15,
    color: "black", //boundaryColor[1] is meant to be a
    weight: 3, //darker version of the same random
    opacity: 1, //color but black just looks nicer.
    stroke: true,
  }).addTo(map);
};
export default addLayer;
