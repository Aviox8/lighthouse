"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  mapillaryImageUrl,
  mapillaryPlaceUrl,
  type MapillaryLookup,
} from "@/lib/mapillary";

interface MapillaryPreviewProps {
  lat: number;
  lon: number;
  name: string;
}

interface ReadyState {
  status: "ready";
  payload: MapillaryLookup;
}

type PreviewState = { status: "loading" } | ReadyState | { status: "error" };

function formatDistance(meters: number): string {
  if (meters >= 1_000) return `${(meters / 1_000).toFixed(1)} km away`;
  return `${Math.max(1, Math.round(meters))} m away`;
}

function formatDate(isoDate: string | null): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Inline Mapillary preview for a marker popup. Fetching starts when the popup
 * opens (React-Leaflet mounts popup children on open), so a result set with
 * hundreds of markers does not trigger hundreds of API calls.
 */
export default function MapillaryPreview({
  lat,
  lon,
  name,
}: MapillaryPreviewProps) {
  const [state, setState] = useState<PreviewState>({ status: "loading" });
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/mapillary?lat=${lat}&lon=${lon}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<MapillaryLookup>;
      })
      .then((payload) => {
        setState({ status: "ready", payload });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ status: "error" });
      });

    return () => controller.abort();
  }, [lat, lon]);

  const fallbackUrl =
    state.status === "ready"
      ? state.payload.fallbackUrl
      : mapillaryPlaceUrl(lat, lon);

  const image =
    state.status === "ready" && !imageFailed ? state.payload.image : null;

  const linkLabel = image ? "Open in Mapillary" : "View on Mapillary";

  return (
    <div className="popup-streetview-preview">
      {state.status === "loading" && (
        <div className="popup-streetview-loading" role="status">
          <span className="popup-streetview-skeleton" aria-hidden="true" />
          <span>Searching nearby imagery…</span>
        </div>
      )}

      {image && (
        <figure className="popup-streetview-figure">
          <a
            className="popup-streetview-media"
            href={mapillaryImageUrl(image.id)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open Mapillary image near ${name}`}
          >
            {/* Mapillary thumbnails are signed, short-lived URLs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.thumbUrl ?? image.previewUrl ?? ""}
              alt={`Street-level view near ${name}`}
              width={320}
              height={200}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
            {image.isPano && (
              <span className="popup-streetview-pano">360°</span>
            )}
          </a>
          <figcaption className="popup-streetview-caption">
            <span>
              {[formatDate(image.capturedAt), formatDistance(image.distanceMeters)]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <a
              href="https://www.mapillary.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Imagery © Mapillary
            </a>
          </figcaption>
        </figure>
      )}

      {state.status === "ready" &&
        !image &&
        state.payload.status === "empty" && (
          <p className="popup-streetview-note">
            No street-level imagery within 500 m.
          </p>
        )}

      {state.status === "ready" &&
        !image &&
        state.payload.status === "unavailable" && (
          <p className="popup-streetview-note">
            Mapillary preview unavailable. Open the location directly.
          </p>
        )}

      {(state.status === "error" ||
        (state.status === "ready" && imageFailed)) && (
        <p className="popup-streetview-note">
          Street-level preview unavailable. Open the location directly.
        </p>
      )}

      <a
        className="popup-streetview-link"
        href={fallbackUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {linkLabel}
        <ArrowUpRight aria-hidden="true" size={11} strokeWidth={2} />
      </a>
    </div>
  );
}
