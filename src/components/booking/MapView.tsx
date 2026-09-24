"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface MapViewProps {
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
}

export function MapView({ pickupLat, pickupLng, dropoffLat, dropoffLng }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
      });

      const { Map } = await loader.importLibrary("maps") as google.maps.MapsLibrary;

      if (mapRef.current && !map) {
        const initialMap = new Map(mapRef.current, {
          center: { lat: 6.5244, lng: 3.3792 }, // Lagos default
          zoom: 12,
          disableDefaultUI: true,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }],
            },
          ]
        });
        setMap(initialMap);
      }
    };
    initMap();
  }, [map]);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden bg-slate-800">
      <div ref={mapRef} className="w-full h-full" />
      {(!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <p className="text-slate-400 text-sm">Map Preview (Requires API Key)</p>
        </div>
      )}
    </div>
  );
}
