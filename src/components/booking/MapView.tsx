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
          // Standard Google Maps light mode styling is default, so no custom styles needed
        });
        setMap(initialMap);
      }
    };
    initMap();
  }, [map]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#e5e7eb]">
      <div ref={mapRef} className="w-full h-full" />
      {(!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/70 backdrop-blur-sm">
          <p className="text-gray-500 font-semibold text-sm">Map Preview (Requires API Key)</p>
        </div>
      )}
    </div>
  );
}
