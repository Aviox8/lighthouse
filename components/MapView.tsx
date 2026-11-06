"use client";

import { useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Asset } from "@/lib/types";

const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const MARKER_ICON = L.divIcon({
  className: "lighthouse-marker",
  html: "<span></span>",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -9],
});

const MARKER_ICON_ACTIVE = L.divIcon({
  className: "lighthouse-marker lighthouse-marker--active",
  html: "<span></span>",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
});

function FitBoundsOnMount({
  bounds,
  results,
}: {
  bounds: [number, number, number, number] | null;
  results: Asset[];
}) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds([
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ]);
    } else if (results.length > 0) {
      const FeatureGroup = L.featureGroup as unknown as new (
        markers: L.Marker[],
      ) => L.FeatureGroup;
      const group = new FeatureGroup(
        results.map((r) => L.marker([r.lat, r.lon])),
      );
      map.fitBounds(group.getBounds().pad(0.15));
    }
  }, [map, bounds, results.length]);
  return null;
}

interface MapViewProps {
  results: Asset[];
  bounds: [number, number, number, number] | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  filterOperator: string | null;
  filterType: string | null;
  loading: boolean;
}

export default function MapView({
  results,
  bounds,
  selectedId,
  onSelect,
  filterOperator,
  filterType,
  loading,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);

  const filtered = results.filter((r) => {
    if (filterType && r.type !== filterType) return false;
    if (filterOperator && r.operator !== filterOperator) return false;
    return true;
  });

  const highlightSelected = useCallback(() => {
    if (!mapRef.current || !selectedId) return;
    const asset = filtered.find((r) => r.id === selectedId);
    if (!asset) return;
    mapRef.current.flyTo([asset.lat, asset.lon], 14);
  }, [mapRef, selectedId, filtered]);

  useEffect(() => {
    if (selectedId) {
      highlightSelected();
    }
  }, [selectedId, highlightSelected]);

  if (loading) {
    return (
      <div className="map-loading">
        Rendering map…
      </div>
    );
  }

  return (
    <div className="map-container">
      <MapContainer
        ref={(el) => { if (el) mapRef.current = el as unknown as L.Map; }}
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={false}
        className="map-inner"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={OSM_TILE_URL}
        />
        <FitBoundsOnMount bounds={bounds} results={filtered} />
        {filtered.map((asset) => (
          <Marker
            key={asset.id}
            position={[asset.lat, asset.lon]}
            icon={asset.id === selectedId ? MARKER_ICON_ACTIVE : MARKER_ICON}
            eventHandlers={{
              click: () => onSelect(asset.id),
            }}
          >
            <Popup className="map-popup dark-popup">
              <div className="popup-inner">
                <div className="popup-title">{asset.name}</div>
                <span className="popup-type">{asset.type}</span>
                {asset.operator && (
                  <div className="popup-operator">{asset.operator}</div>
                )}
                <div className="popup-coords">
                  {asset.lat.toFixed(4)}
                  <span className="separator">,&nbsp;</span>
                  {asset.lon.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
