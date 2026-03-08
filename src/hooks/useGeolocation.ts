"use client";

import { useEffect, useState } from "react";

type GeolocationState = {
  coords: { latitude: number; longitude: number } | null;
  error: string | null;
  loading: boolean;
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(() => {
    if (typeof navigator !== "undefined" && !("geolocation" in navigator)) {
      return {
        coords: null,
        error: "Geolocation is not supported on this device",
        loading: false,
      };
    }

    return {
      coords: null,
      error: null,
      loading: true,
    };
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setState({
          coords: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState({
          coords: null,
          error: error.message,
          loading: false,
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 10_000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
}
