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
import Translate, { type TranslateEvent } from "ol/interaction/Translate";
import type Geometry from "ol/geom/Geometry";
import type Feature from "ol/Feature";
import { transform, fromLonLat } from "ol/proj";
import { Point, Polygon, MultiPolygon } from "ol/geom";
import * as olExtent from "ol/extent";
import "~/styles/ol.css";
import type { FeatureCollection } from "geojson";
import { throttle } from "~/utils/utils";

interface OpenLayersProps {
  center: number[];
  zoom: number;
  data: Feature | null;
}

const OlMapComponent: React.FC<OpenLayersProps> = ({ center, zoom, data }) => {
  const [map, setMap] = useState<OlMap>();
  const mapRef = useRef<HTMLDivElement>(null);

  const dragState = useRef<{
    initialGeoCenter: number[] | null;
    originalGeoCoords: number[][][][] | null;
    startProjPointerCoord: number[] | null;
    startProjFeatureCenter: number[] | null;
  }>({
    initialGeoCenter: null,
    originalGeoCoords: null,
    startProjPointerCoord: null,
    startProjFeatureCenter: null,
  }).current;

  const mounted = useRef(false);

  useEffect(() => {
    // console.log(data?.getGeometry())
    if (!mapRef.current || mounted.current) return;
    if (data === null) return;
    const parsedGeoJSONData = new GeoJSON().readFeatures(data);
    console.log(parsedGeoJSONData);

    const viewProjection = "EPSG:3857";
    const dataProjection = "EPSG:4326";

    const vectorSource = new VectorSource({
      features: parsedGeoJSONData,
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: {
        "stroke-color": "blue",
        "stroke-width": 2,
        "fill-color": "rgba(0, 0, 255, 0.1)",
      },
    });

    const olMap = new OlMap({
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      controls: defaultControls(),
      view: new View({
        center: fromLonLat(center, viewProjection),
        zoom,
        projection: viewProjection,
      }),
      target: mapRef.current,
    });

    const dragInteraction = new Translate({
      features: vectorSource.getFeaturesCollection()!,
    });

    const translateStart = (event: TranslateEvent) => {
      const feature = event.features.getArray()[0];
      if (!feature) return;
      const geometry = feature.getGeometry();

      if (!(geometry instanceof MultiPolygon)) {
        return;
      }

      dragState.originalGeoCoords = feature.get(
        "originalCoords",
      ) as number[][][][];
      if (!dragState.originalGeoCoords) {
        console.error("Original coordinates not found!");
        return;
      }

      const currentProjExtent = geometry.getExtent();
      const currentProjCenter = olExtent.getCenter(currentProjExtent);
      dragState.initialGeoCenter = transform(
        currentProjCenter,
        viewProjection,
        dataProjection,
      );

      dragState.startProjPointerCoord = event.coordinate;
      dragState.startProjFeatureCenter = currentProjCenter;
    };

    dragInteraction.on("translatestart", translateStart);

    const translateEventHandler = (event: TranslateEvent) => {
      if (
        !dragState.originalGeoCoords ||
        !dragState.initialGeoCenter ||
        !dragState.startProjPointerCoord ||
        !dragState.startProjFeatureCenter
      ) {
        return;
      }

      const feature = event.features.getArray()[0];
      if (!feature) return;
      const geometry = feature.getGeometry();
      if (!(geometry instanceof MultiPolygon)) return;

      const currentProjPointerCoord = event.coordinate;
      const deltaX =
        currentProjPointerCoord[0] - dragState.startProjPointerCoord[0];
      const deltaY =
        currentProjPointerCoord[1] - dragState.startProjPointerCoord[1];

      const newProjCenter = [
        dragState.startProjFeatureCenter[0] + deltaX,
        dragState.startProjFeatureCenter[1] + deltaY,
      ];

      const newGeoCenter = transform(
        newProjCenter,
        viewProjection,
        dataProjection,
      );

      const [initialLon, initialLat] = dragState.initialGeoCenter;
      const [newLon, newLat] = newGeoCenter;

      const newGeographicCoords = dragState.originalGeoCoords.map((polygon) =>
        polygon.map((ring) =>
          ring.map((coord) => {
            const lonOffset = coord[0] - initialLon;
            const latOffset = coord[1] - initialLat;
            return [newLon + lonOffset, newLat + latOffset];
          }),
        ),
      );

      const newProjectedCoords = newGeographicCoords.map((polygon) =>
        polygon.map((ring) =>
          ring.map((coord) => transform(coord, dataProjection, viewProjection)),
        ),
      );

      geometry.setCoordinates(newProjectedCoords);
    };

    dragInteraction.on("translating", throttle(translateEventHandler, 1));

    dragInteraction.on("translateend", (event: TranslateEvent) => {
      const feature = event.features.getArray()[0];
      if (feature) {
        const geometry = feature.getGeometry();
        if (geometry instanceof MultiPolygon) {
          const currentCoords = geometry.getCoordinates();
          const newGeographicCoords = currentCoords.map((polygon) =>
            polygon.map((ring) =>
              ring.map((coord) =>
                transform(coord, viewProjection, dataProjection),
              ),
            ),
          );
          feature.set("originalCoords", newGeographicCoords);
        }
      }

      dragState.initialGeoCenter = null;
      dragState.originalGeoCoords = null;
      dragState.startProjPointerCoord = null;
      dragState.startProjFeatureCenter = null;
    });

    olMap.addInteraction(dragInteraction);
    setMap(olMap);
    mounted.current = true;

    return () => olMap.dispose();
  }, [center, zoom, data]);

  return <div ref={mapRef} id="map" className="h-screen w-screen"></div>;
};

export default OlMapComponent;
