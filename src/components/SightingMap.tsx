"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect } from "react";
import Link from "next/link";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

import type { SightingSummary } from "@/types";

const markerIcon = L.icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iNTEiIHZpZXdCb3g9IjAgMCAzNiA1MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTggMEM4LjA2IDAgMCA4LjA2IDAgMThDMCAzMS41IDExLjY2IDQ0LjY1IDE2LjAyIDQ5LjE2QzE3LjA5IDUwLjI4IDE4LjkxIDUwLjI4IDE5Ljk4IDQ5LjE2QzI0LjM0IDQ0LjY1IDM2IDMxLjUgMzYgMThDMzYgOC4wNiAyNy45NCAwIDE4IDBaIiBmaWxsPSIjNEE3QzU5Ii8+PHBhdGggZD0iTTE4IDI2QzIyLjQxODMgMjYgMjYgMjIuNDE4MyAyNiAxOEMyNiAxMy41ODE3IDIyLjQxODMgMTAgMTggMTBDMTMuNTgxNyAxMCAxMCAxMy41ODE3IDEwIDE4QzEwIDIyLjQxODMgMTMuNTgxNyAyNiAxOCAyNloiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=",
  iconSize: [36, 51],
  iconAnchor: [18, 51],
});

function MapViewport({
  center,
}: {
  center: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

type SightingMapProps = {
  sightings: SightingSummary[];
  center?: [number, number];
  className?: string;
};

export function SightingMap({ sightings, center, className }: SightingMapProps) {
  const initialCenter =
    center ?? (sightings[0] ? [sightings[0].latitude, sightings[0].longitude] : [37.7749, -122.4194]);

  return (
    <div className={className ?? "overflow-hidden rounded-[32px]"}>
      <MapContainer center={initialCenter as [number, number]} zoom={12} className="h-full min-h-[300px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewport center={initialCenter as [number, number]} />

        <MarkerClusterGroup chunkedLoading>
          {sightings
            .filter((sighting) => sighting.locationType === "PINPOINT")
            .map((sighting) => (
              <Marker
                key={sighting.id}
                position={[sighting.latitude, sighting.longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="w-44 space-y-2">
                    {sighting.firstPhoto?.thumbnailData ?? sighting.firstPhoto?.imageData ? (
                      <img
                        src={sighting.firstPhoto?.thumbnailData ?? sighting.firstPhoto?.imageData ?? ""}
                        alt={sighting.birdName}
                        className="h-24 w-full rounded-xl object-cover"
                      />
                    ) : null}
                    <div>
                      <p className="font-semibold text-[color:var(--color-forest)]">{sighting.birdName}</p>
                      <p className="text-xs text-slate-500">by {sighting.author.displayName}</p>
                    </div>
                    <Link href={`/sighting/${sighting.id}`} className="text-sm font-semibold text-[color:var(--color-forest)]">
                      View details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>

        {sightings
          .filter((sighting) => sighting.locationType === "AREA" && sighting.radiusMeters)
          .map((sighting) => (
            <Circle
              key={sighting.id}
              center={[sighting.latitude, sighting.longitude]}
              radius={sighting.radiusMeters ?? 0}
              pathOptions={{
                color: "#4A7C59",
                fillColor: "#7CB28D",
                fillOpacity: 0.22,
              }}
            >
              <Popup>
                <div className="w-44 space-y-2">
                  {sighting.firstPhoto?.thumbnailData ?? sighting.firstPhoto?.imageData ? (
                    <img
                      src={sighting.firstPhoto?.thumbnailData ?? sighting.firstPhoto?.imageData ?? ""}
                      alt={sighting.birdName}
                      className="h-24 w-full rounded-xl object-cover"
                    />
                  ) : null}
                  <div>
                    <p className="font-semibold text-[color:var(--color-forest)]">{sighting.birdName}</p>
                    <p className="text-xs text-slate-500">Approximate area</p>
                  </div>
                  <Link href={`/sighting/${sighting.id}`} className="text-sm font-semibold text-[color:var(--color-forest)]">
                    View details
                  </Link>
                </div>
              </Popup>
            </Circle>
          ))}
      </MapContainer>
    </div>
  );
}
