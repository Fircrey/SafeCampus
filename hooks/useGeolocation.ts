"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GeoStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "timeout";

interface GeolocationState {
  status: GeoStatus;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    status: "idle",
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
  });

  const requested = useRef(false);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        status: "unavailable",
        latitude: null,
        longitude: null,
        accuracy: null,
        error: "Tu navegador no soporta geolocalizacion.",
      });
      return;
    }

    setState((prev) => ({ ...prev, status: "requesting", error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "granted",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
        });
      },
      (err) => {
        let errorMsg: string;
        let status: GeoStatus;

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = "Permiso de ubicacion denegado. Puedes seleccionar la zona manualmente.";
            status = "denied";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = "No se pudo obtener tu ubicacion. Verifica que el GPS este activado.";
            status = "unavailable";
            break;
          case err.TIMEOUT:
            errorMsg = "La solicitud de ubicacion tardo demasiado. Intenta de nuevo.";
            status = "timeout";
            break;
          default:
            errorMsg = "Error desconocido al obtener la ubicacion.";
            status = "unavailable";
        }

        setState({
          status,
          latitude: null,
          longitude: null,
          accuracy: null,
          error: errorMsg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    if (!requested.current) {
      requested.current = true;
      request();
    }
  }, [request]);

  return {
    ...state,
    retry: request,
  };
}
