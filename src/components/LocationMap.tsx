import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix default marker icons (Webpack/Vite strips the asset URLs)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ─── Nominatim geocoding (fallback when no coordinates are provided) ──────────

interface GeoResult {
  lat: number;
  lon: number;
}

async function geocode(query: string): Promise<GeoResult | null> {
  try {
    const params = new URLSearchParams({
      q: `${query}, Argentina`,
      format: "json",
      limit: "1",
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { "Accept-Language": "es" } }
    );
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface LocationMapProps {
  address: string;
  /** [longitude, latitude], GeoJSON order — pass when available to skip geocoding */
  coordinates?: [number, number];
}

export default function LocationMap({ address, coordinates }: LocationMapProps) {
  const [coords, setCoords] = useState<GeoResult | null>(
    coordinates ? { lat: coordinates[1], lon: coordinates[0] } : null
  );
  const [status, setStatus] = useState<"loading" | "ok" | "error">(coordinates ? "ok" : "loading");

  useEffect(() => {
    if (coordinates) {
      setCoords({ lat: coordinates[1], lon: coordinates[0] });
      setStatus("ok");
      return;
    }
    setStatus("loading");
    geocode(address).then((result) => {
      if (result) {
        setCoords(result);
        setStatus("ok");
      } else {
        setStatus("error");
      }
    });
  }, [address, coordinates?.[0], coordinates?.[1]]);

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700 flex items-center gap-2">
        <span>📍</span> Ubicación del Centro de Internación
      </h3>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Address bar */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-500">Dirección:</span>
          <span className="text-[11px] font-bold text-slate-800">{address}</span>
        </div>

        {/* Map area */}
        <div className="h-64 relative">
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
              <span className="text-xs text-slate-400 animate-pulse">Localizando en el mapa...</span>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-2">
              <span className="text-slate-300 text-3xl">🗺️</span>
              <span className="text-xs text-slate-400">No se pudo geolocalizar "{address}"</span>
            </div>
          )}

          {status === "ok" && coords && (
            <MapContainer
              center={[coords.lat, coords.lon]}
              zoom={15}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[coords.lat, coords.lon]}>
                <Popup>
                  <span className="text-xs font-semibold">{address}</span>
                </Popup>
              </Marker>
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
