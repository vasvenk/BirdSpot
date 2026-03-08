"use client";

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

type Coordinates = {
  latitude: number;
  longitude: number;
};

const markerIcon = L.icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iNTEiIHZpZXdCb3g9IjAgMCAzNiA1MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTggMEM4LjA2IDAgMCA4LjA2IDAgMThDMCAzMS41IDExLjY2IDQ0LjY1IDE2LjAyIDQ5LjE2QzE3LjA5IDUwLjI4IDE4LjkxIDUwLjI4IDE5Ljk4IDQ5LjE2QzI0LjM0IDQ0LjY1IDM2IDMxLjUgMzYgMThDMzYgOC4wNiAyNy45NCAwIDE4IDBaIiBmaWxsPSIjNEE3QzU5Ii8+PHBhdGggZD0iTTE4IDI2QzIyLjQxODMgMjYgMjYgMjIuNDE4MyAyNiAxOEMyNiAxMy41ODE3IDIyLjQxODMgMTAgMTggMTBDMTMuNTgxNyAxMCAxMCAxMy41ODE3IDEwIDE4QzEwIDIyLjQxODMgMTMuNTgxNyAyNiAxOCAyNloiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=",
  iconSize: [36, 51],
  iconAnchor: [18, 51],
});

function PickerEvents({
  onSelect,
}: {
  onSelect: (coords: Coordinates) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: Coordinates | null;
  onChange: (coords: Coordinates) => void;
}) {
  const center = value ? [value.latitude, value.longitude] : [37.7749, -122.4194];

  return (
    <div className="overflow-hidden rounded-[28px] border border-[color:var(--color-moss)]/20">
      <MapContainer
        center={center as [number, number]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-72 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PickerEvents onSelect={onChange} />
        {value ? (
          <Marker position={[value.latitude, value.longitude]} icon={markerIcon} />
        ) : null}
      </MapContainer>
    </div>
  );
}
