"use client";

import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import "leaflet/dist/leaflet.css";
import MapillaryPreview from "./mapillary-preview";
import type { Asset } from "@/lib/types";

/* ---------------------------------------------------------------
   Tile layers. Streets = OpenStreetMap standard tiles, the
   default. Satellite = Esri World Imagery (free with attribution).
   Terrain = OpenTopoMap (CC-BY-SA). All keyless public endpoints.
   --------------------------------------------------------------- */
const TILE_LAYERS = {
  street: {
    label: "Streets",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      '&copy; Esri &mdash; Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
  terrain: {
    label: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 17,
    subdomains: "abc",
  },
} as const;

type TileLayerKey = keyof typeof TILE_LAYERS;

/* ---------------------------------------------------------------
   Asset-type marker glyphs. Sharp monochrome badges — visible on
   bright streets, dark imagery and satellite alike.
   --------------------------------------------------------------- */
const GLYPHS: Record<string, string> = {
  energy: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>',
  telecom:
    '<path d="M12 10 8 21M12 10l4 11M12 10V4M8.5 7.4a5 5 0 0 1 7 0M5.6 4.6a9 9 0 0 1 12.8 0M7 21h10"/>',
  data: '<rect x="3" y="4" width="18" height="7"/><rect x="3" y="14" width="18" height="6"/><path d="M7 7.5h.01M7 17h.01"/>',
  anchor: '<circle cx="12" cy="5" r="3"/><path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/>',
  plane: '<path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
  train: '<rect x="6" y="3" width="12" height="13"/><path d="M6 10h12M9.5 21h5M9 16l-1.5 5M15 16l1.5 5"/>',
  cross: '<path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5z"/>',
  factory: '<path d="M4 21V10l6 4v-4l6 4V5h4v16z"/><path d="M4 21h16"/>',
  water: '<path d="M12 3s6 6.8 6 11a6 6 0 0 1-12 0c0-4.2 6-11 6-11z"/>',
  shield: '<path d="M12 3l7 3v6c0 4.6-3 7.8-7 9-4-1.2-7-4.4-7-9V6z"/>',
  pin: '<path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/>',
};

function assetGlyph(type: string): keyof typeof GLYPHS {
  const t = type.toLowerCase();
  if (/(dam|reservoir|water|treatment)/.test(t)) return "water";
  if (/(data_center|data_centre|server|hosting)/.test(t)) return "data";
  if (/(cell_tower|communication|antenna|mast|telecom|broadcast|tower)/.test(t)) return "telecom";
  if (/(port|harbour|harbor|dock|marina|ferry)/.test(t)) return "anchor";
  if (/(airport|helipad|aerodrome|airfield)/.test(t)) return "plane";
  if (/(train|rail|metro|tram|transit|halt|station)/.test(t)) return "train";
  if (/(hospital|clinic|pharmacy|health)/.test(t)) return "cross";
  if (/(factory|industrial|refinery|manufacture)/.test(t)) return "factory";
  if (/(military|airbase|arm)/.test(t)) return "shield";
  if (/(wind|solar|hydro|thermal|nuclear|geothermal|power|substation|generator|battery|converter|switch|voltage|turbine)/.test(t)) {
    return "energy";
  }
  return "pin";
}

const iconCache = new Map<string, L.DivIcon>();

function markerIcon(type: string, active: boolean): L.DivIcon {
  const glyph = assetGlyph(type);
  const key = `${glyph}:${active ? "active" : "base"}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const size = active ? 28 : 22;
  const icon = L.divIcon({
    className: active
      ? "lighthouse-marker lighthouse-marker--active"
      : "lighthouse-marker",
    html: `<span class="lighthouse-marker__badge"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${GLYPHS[glyph]}</svg></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 2],
  });
  iconCache.set(key, icon);
  return icon;
}

/* bounds from the API / calculateBoundingBox are [south, north, west, east].
   Leaflet needs [[south, west], [north, east]]. */
function toLeafletBounds(bounds: [number, number, number, number]): L.LatLngBoundsExpression {
  return [
    [bounds[0], bounds[2]],
    [bounds[1], bounds[3]],
  ];
}

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
      map.fitBounds(toLeafletBounds(bounds), { padding: [24, 24] });
    } else if (results.length > 0) {
      const FeatureGroup = L.featureGroup as unknown as new (
        markers: L.Marker[],
      ) => L.FeatureGroup;
      const group = new FeatureGroup(
        results.map((r) => L.marker([r.lat, r.lon])),
      );
      map.fitBounds(group.getBounds().pad(0.15));
    }
  }, [map, bounds, results]);
  return null;
}

function RadiusCircle({
  bounds,
  radiusKm,
}: {
  bounds: [number, number, number, number] | null;
  radiusKm: number | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!bounds || !radiusKm) return;
    const center: [number, number] = [
      (bounds[0] + bounds[1]) / 2,
      (bounds[2] + bounds[3]) / 2,
    ];
    // Double ring: a black outer stroke keeps the circle readable on light
    // water and land; the dashed white inner reads on dark satellite imagery.
    const outer = L.circle(center, {
      radius: radiusKm * 1000,
      color: "#000000",
      weight: 4,
      opacity: 0.7,
      fill: false,
      interactive: false,
    });
    const inner = L.circle(center, {
      radius: radiusKm * 1000,
      color: "#ffffff",
      weight: 1.5,
      opacity: 0.95,
      fillColor: "#ffffff",
      fillOpacity: 0.05,
      dashArray: "5 7",
      interactive: false,
    });
    outer.addTo(map);
    inner.addTo(map);
    return () => {
      map.removeLayer(outer);
      map.removeLayer(inner);
    };
  }, [map, bounds, radiusKm]);
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
  /** Present only for `near:` searches — draws the radius circle. */
  radiusKm?: number | null;
}

export default function MapView({
  results,
  bounds,
  selectedId,
  onSelect,
  filterOperator,
  filterType,
  loading,
  radiusKm = null,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [tileLayer, setTileLayer] = useState<TileLayerKey>("street");

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (filterType && r.type !== filterType) return false;
      if (filterOperator && r.operator !== filterOperator) return false;
      return true;
    });
  }, [results, filterOperator, filterType]);

  const highlightSelected = useCallback(() => {
    if (!mapRef.current || !selectedId) return;
    const asset = filtered.find((r) => r.id === selectedId);
    if (!asset) return;
    // Pad for the popup's height so it never clips the top of the map: with a
    // street-level image the popup is ~420px tall plus the tip, and the layer
    // switch occupies the top-right ~44px. The popup is painted inside the
    // map's own stacking context, so it can never win against the sibling
    // layer switch (z-index 1000) — the only correct fix is to push the
    // selection low enough that the popup clears it. flyTo has no padding
    // options, so express the clearance as fitBounds top padding.
    const height = mapRef.current.getSize().y;
    const topPadding = Math.max(0, Math.min(360, 1000 - height));
    mapRef.current.flyToBounds(L.latLng(asset.lat, asset.lon).toBounds(1), {
      paddingTopLeft: [0, topPadding],
      paddingBottomRight: [0, 16],
      maxZoom: 14,
    });
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

  const activeLayer = TILE_LAYERS[tileLayer];

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
          key={tileLayer}
          attribution={activeLayer.attribution}
          url={activeLayer.url}
          maxZoom={activeLayer.maxZoom}
          {...("subdomains" in activeLayer ? { subdomains: activeLayer.subdomains } : {})}
        />
        <FitBoundsOnMount bounds={bounds} results={filtered} />
        <RadiusCircle bounds={bounds} radiusKm={radiusKm} />
        {filtered.map((asset) => (
          <Marker
            key={asset.id}
            position={[asset.lat, asset.lon]}
            icon={markerIcon(asset.type, asset.id === selectedId)}
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
                <MapillaryPreview
                  lat={asset.lat}
                  lon={asset.lon}
                  name={asset.name}
                />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="map-layer-switch">
        <ToggleButtonGroup
          aria-label="Map tile layer"
          disallowEmptySelection
          onSelectionChange={(keys) => {
            const next = Array.from(keys)[0];
            if (next === "street" || next === "satellite" || next === "terrain") {
              setTileLayer(next);
            }
          }}
          selectedKeys={[tileLayer]}
          selectionMode="single"
          size="sm"
        >
          <ToggleButton id="street">Streets</ToggleButton>
          <ToggleButton id="satellite">Satellite</ToggleButton>
          <ToggleButton id="terrain">Terrain</ToggleButton>
        </ToggleButtonGroup>
      </div>
    </div>
  );
}
