"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import LocationMapFallback from "./LocationMapFallback";

export default function LocationMap({
  location,
  devices,
  alerts,
  coordinates,
}) {
  const [mapError, setMapError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setMapError(true);
    }
  }, []);

  // Server-side or no API key - show fallback
  if (!isClient || mapError || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <LocationMapFallback
        location={location}
        devices={devices}
        alerts={alerts}
      />
    );
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={coordinates}
        defaultZoom={12}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="facility-monitor-map"
        style={{ width: "100%", height: "100%" }}
        onError={() => setMapError(true)}
      >
        {devices.map((device) => {
          const hasAlert = alerts.some(
            (a) => a.device_id === device.id && a.status === "active",
          );
          // Offset devices slightly so they don't overlap
          const offset = device.id * 0.002;
          return (
            <Marker
              key={device.id}
              position={{
                lat: coordinates.lat + offset,
                lng: coordinates.lng + offset,
              }}
              title={device.name}
              icon={{
                path:
                  (typeof window !== "undefined" &&
                    window.google?.maps?.SymbolPath?.CIRCLE) ||
                  0,
                scale: 10,
                fillColor: hasAlert ? "#FF0000" : "#00FF00",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
              }}
            />
          );
        })}
      </Map>
    </APIProvider>
  );
}
