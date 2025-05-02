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
import Feature from "ol/Feature"; // Import Feature
import { transform, fromLonLat, toLonLat, get as getProjection } from "ol/proj";
import { Point, Polygon } from "ol/geom";
import * as olExtent from "ol/extent"; // For calculating center/extent
import "~/styles/ol.css";
import type { FeatureCollection } from "geojson";

import { throttle } from "~/utils/utils";

interface OpenLayersProps {
  center: number[];
  zoom: number;
}

// Store original geographic coordinates separately for reference
// Ensure the polygon is closed (first and last point are the same)
const originalGeographicCoordinates = [
  [
    [5.0, 45.0],
    [7.0, 47.0],
    [10.0, 46.0],
    [9.0, 44.0],
    [6.0, 43.0],
    [5.0, 45.0],
  ],
  [
    [12.0, 48.0],
    [14.0, 50.0],
    [13.5, 49.0],
    [12.0, 48.0],
  ],
];

const geojsonData: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "My Polygon",
        color: "blue",
        // Store original coords on the feature for easier access
        // Use a deep copy to avoid accidental modification
        // originalCoords: JSON.parse(
        //   JSON.stringify(originalGeographicCoordinates),
        // ),
        originalCoords: originalGeographicCoordinates,
      },
      geometry: {
        type: "Polygon",
        coordinates: originalGeographicCoordinates,
      },
    },
  ],
};

const OlMapComponent: React.FC<OpenLayersProps> = ({ center, zoom }) => {
  const [map, setMap] = useState<OlMap>();
  const mapRef = useRef<HTMLDivElement>(null);
  // Store state related to the drag operation
  const dragState = useRef<{
    initialGeoCenter: number[] | null;
    originalGeoCoords: number[][][] | null;
    startProjPointerCoord: number[] | null; // Pointer coord where drag started (EPSG:3857)
    startProjFeatureCenter: number[] | null; // Feature center when drag started (EPSG:3857)
  }>({
    initialGeoCenter: null,
    originalGeoCoords: null,
    startProjPointerCoord: null,
    startProjFeatureCenter: null,
  }).current; // Use .current for direct access within useEffect/callbacks

  const mounted = useRef(false);

  useEffect(() => {
    if (!mapRef.current || mounted.current) return;

    const viewProjection = "EPSG:3857";
    const dataProjection = "EPSG:4326";

    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(geojsonData, {
        dataProjection: dataProjection,
        featureProjection: viewProjection,
      }),
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
        center: fromLonLat(center, viewProjection), // Project center to view projection
        zoom: zoom,
        projection: viewProjection,
      }),
      target: mapRef.current,
    });
    const dragInteraction = new Translate({
      features: vectorSource.getFeaturesCollection()!,
    });

    // --- Custom Translation Logic ---

    const translateStart = (event: TranslateEvent) => {
      const feature = event.features.getArray()[0];
      if (!feature) return;
      const geometry = feature.getGeometry();
      if (!(geometry instanceof Polygon)) return;

      // Store original geographic coordinates from feature property
      dragState.originalGeoCoords = feature.get(
        "originalCoords",
      ) as number[][][];
      if (!dragState.originalGeoCoords) {
        console.error(
          "Original geographic coordinates not found on feature properties!",
        );
        return;
      }

      // Calculate and store initial GEOGRAPHIC center (more robust)
      // Need to transform the *current* projected center back to geographic
      const currentProjExtent = geometry.getExtent();
      const currentProjCenter = olExtent.getCenter(currentProjExtent);
      dragState.initialGeoCenter = transform(
        currentProjCenter,
        viewProjection,
        dataProjection,
      );

      // Store starting projected coordinates (pointer and feature center)
      dragState.startProjPointerCoord = event.coordinate; // Pointer's map coord (EPSG:3857)
      dragState.startProjFeatureCenter = currentProjCenter; // Feature's center (EPSG:3857)

      console.log("Translate Start:", { ...dragState });
    };

    dragInteraction.on("translatestart", translateStart);

    const translateEventHandler = (event: TranslateEvent) => {
      // Ensure we have all necessary start data
      if (
        !dragState.originalGeoCoords ||
        !dragState.initialGeoCenter ||
        !dragState.startProjPointerCoord ||
        !dragState.startProjFeatureCenter
      ) {
        console.warn("Skipping translate: missing drag start data.");
        return;
      }

      if (!dragState.originalGeoCoords) {
        console.warn("Skipping translate: originalGeoCoords is undefined.");
        return;
      }

      const feature = event.features.getArray()[0];
      if (!feature) return;
      const geometry = feature.getGeometry();
      if (!(geometry instanceof Polygon)) return;

      // 1. Current pointer coordinate in view projection (EPSG:3857)
      const currentProjPointerCoord = event.coordinate;

      if (
        currentProjPointerCoord[0] === undefined ||
        currentProjPointerCoord[1] === undefined
      ) {
        console.warn(
          `Skipping translate: currentProjPointerCoord is undefined`,
        );
        return;
      }
      if (
        dragState.startProjPointerCoord[0] === undefined ||
        dragState.startProjPointerCoord[1] === undefined
      ) {
        console.warn(
          `Skipping translate: dragState.startProjPointerCoord is undefined`,
        );
        return;
      }
      // 2. Calculate the delta (how much the pointer moved) in projected coords
      const deltaX =
        currentProjPointerCoord[0] - dragState.startProjPointerCoord[0];
      const deltaY =
        currentProjPointerCoord[1] - dragState.startProjPointerCoord[1];
      if (
        dragState.startProjFeatureCenter[0] === undefined ||
        dragState.startProjFeatureCenter[1] === undefined
      ) {
        console.warn(
          `Skipping translate: dragState.startProjFeatureCenter is undefined`,
        );
        return;
      }
      // 3. Calculate the feature's new target *projected* center
      const newProjCenter = [
        dragState.startProjFeatureCenter[0] + deltaX,
        dragState.startProjFeatureCenter[1] + deltaY,
      ];

      // 4. Calculate the feature's new target *geographic* center
      const newGeoCenter = transform(
        newProjCenter,
        viewProjection,
        dataProjection,
      );

      if (!dragState.initialGeoCenter) {
        console.warn("Skipping translate: initialGeoCenter is undefined.");
        return;
      }

      // 5. Calculate new geographic coordinates for ALL vertices relative to the new geographic center
      const initialCenterLon = dragState.initialGeoCenter[0];
      if (initialCenterLon === undefined) {
        console.warn("Skipping translate: initialCenterLon is undefined.");
        return;
      }
      const initialCenterLat = dragState.initialGeoCenter[1];
      if (initialCenterLat === undefined) {
        console.warn("Skipping translate: initialCenterLat is undefined.");
        return;
      }
      const newCenterLon = newGeoCenter[0];
      if (newCenterLon === undefined) {
        console.warn("Skipping translate: newCenterLon is undefined.");
        return;
      }
      const newCenterLat = newGeoCenter[1];
      if (newCenterLat === undefined) {
        console.warn("Skipping translate: newCenterLat is undefined.");
        return;
      }

      const newGeographicCoords = dragState.originalGeoCoords.map((ring) =>
        ring.map((originalGeoCoord) => {
          if (
            originalGeoCoord[0] === undefined ||
            originalGeoCoord[1] === undefined
          ) {
            console.warn("Skipping translate: originalGeoCoord is undefined.");
            return;
          }
          // Calculate offset from original geographic center
          const lonOffset = originalGeoCoord[0] - initialCenterLon;
          const latOffset = originalGeoCoord[1] - initialCenterLat;
          // Apply offset to the new geographic center
          // Basic addition is an approximation, but often sufficient for visuals
          return [newCenterLon + lonOffset, newCenterLat + latOffset];
        }),
      );

      // 6. Transform these new geographic coordinates back to the view projection (EPSG:3857)
      const newProjectedCoords = newGeographicCoords.map((ring) =>
        ring.map((geoCoord) =>
          transform(geoCoord, dataProjection, viewProjection),
        ),
      );

      // 7. **Crucially: Manually update the feature's geometry.**
      // This overwrites whatever the Translate interaction might do internally.
      geometry.setCoordinates(newProjectedCoords);
    };

    // Throttle the expensive calculations
    dragInteraction.on("translating", throttle(translateEventHandler, 1)); // Adjust throttle (e.g., 30-100ms)

    dragInteraction.on("translateend", (event: TranslateEvent) => {
      console.log("Translate End");

      const feature = event.features.getArray()[0];
      if (feature) {
        const geometry = feature.getGeometry();
        if (geometry instanceof Polygon) {
          // Get the current projected coordinates
          const currentProjectedCoords = geometry.getCoordinates();

          // Transform the projected coordinates back to geographic coordinates
          const dataProjection = "EPSG:4326";
          const viewProjection = "EPSG:3857";

          if (!currentProjectedCoords) {
            console.warn(
              "Skipping translateend: currentProjectedCoords is undefined.",
            );
            return;
          }

          const newGeographicCoords = currentProjectedCoords.map((ring) =>
            ring.map((coord) =>
              transform(coord, viewProjection, dataProjection),
            ),
          );

          // Update the feature's originalCoords property with the new geographic coordinates
          feature.set("originalCoords", newGeographicCoords);
        }
      }

      // Reset drag state
      dragState.initialGeoCenter = null;
      dragState.originalGeoCoords = null;
      dragState.startProjPointerCoord = null;
      dragState.startProjFeatureCenter = null;
    });

    olMap.addInteraction(dragInteraction);
    setMap(olMap);
    mounted.current = true;

    return () => {
      // Clean up interaction listeners if necessary, although olMap.dispose() should handle it
      olMap.dispose();
    };
    // Watch for changes in center/zoom if the map needs to react to them after initial load
    // }, [center, zoom]);
  }, [center, zoom]); // Run only once on mount

  return <div ref={mapRef} id="map" className="h-screen w-screen"></div>;
};

export default OlMapComponent;
