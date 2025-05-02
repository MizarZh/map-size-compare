"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import OlMap from "ol/Map";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import View from "ol/View";
import { defaults as defaultControls } from "ol/control/defaults";
import GeoJSON from "ol/format/GeoJSON";
import Translate from "ol/interaction/Translate";
import type Geometry from "ol/geom/Geometry";
import type Feature from "ol/Feature";
import { transform } from "ol/proj";
import { Point, Polygon } from "ol/geom";
import "~/styles/ol.css";
import type { GeoJsonObject, FeatureCollection } from "geojson";

interface OpenLayersProps {
  center: number[];
  zoom: number;
}

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
            [12.6, 56.7],
            [16.7, 56.6],
            [16.6, 55.5],
          ],
        ],
      },
    },
  ],
};

const OlMapComponent: React.FC<OpenLayersProps> = ({ center, zoom }) => {
  const [map, setMap] = useState<OlMap>();
  const mapRef = useRef<HTMLDivElement>(null);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mapRef.current || mounted.current) return;
    const centerWebMercator = transform(center, "EPSG:4326", "EPSG:3857");
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(geojsonData, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      }),
    });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    const props = {
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      controls: defaultControls(),
      view: new View({
        center: centerWebMercator,
        zoom: zoom,
      }),
      target: mapRef.current,
    };
    const dragInteraction = new Translate({
      layers: [vectorLayer],
    });
    dragInteraction.on("translating", (event) => {
      event.features.forEach((feature) => {
        const geometry = feature.getGeometry();
        if (geometry instanceof Point) {
          const draggedCoordinate = geometry.getCoordinates();

          console.log("Point dragged to:", draggedCoordinate);
          // Handle point-specific logic here
        } else if (geometry instanceof Polygon) {
          const draggedCoordinates = geometry.getCoordinates();

          console.log("Polygon dragged to:", draggedCoordinates);
          // Handle polygon-specific logic here, e.g., updating state with the new vertices
        } else {
          console.log("Feature with unsupported geometry type dragged.");
        }
      });
    });

    const olMap = new OlMap(props);
    olMap.addInteraction(dragInteraction);
    setMap(olMap);
    mounted.current = true;
    return () => {
      olMap.dispose();
    };
  }, [center, zoom]);

  return <div ref={mapRef} id="map" className="h-screen w-screen"></div>;
};

export default OlMapComponent;
