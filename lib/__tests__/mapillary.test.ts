import { describe, expect, it } from "vitest";
import {
  haversineMeters,
  mapillaryBbox,
  mapillaryImageUrl,
  mapillaryPlaceUrl,
  selectNearestImage,
} from "@/lib/mapillary";

describe("mapillaryBbox", () => {
  it("returns west, south, east, north in that order and contains the point", () => {
    const [west, south, east, north] = mapillaryBbox(52.52, 13.405);
    expect(west).toBeLessThan(13.405);
    expect(east).toBeGreaterThan(13.405);
    expect(south).toBeLessThan(52.52);
    expect(north).toBeGreaterThan(52.52);
  });

  it("stays under Mapillary's 0.01 square-degree bbox limit", () => {
    for (const lat of [0, 45, 60, 78, 89.9]) {
      const [west, south, east, north] = mapillaryBbox(lat, 10);
      expect((east - west) * (north - south)).toBeLessThan(0.01);
    }
  });

  it("clamps to valid longitude and latitude", () => {
    const [west, south, east, north] = mapillaryBbox(89.9999, 179.9999);
    expect(west).toBeGreaterThanOrEqual(-180);
    expect(east).toBeLessThanOrEqual(180);
    expect(south).toBeGreaterThanOrEqual(-90);
    expect(north).toBeLessThanOrEqual(90);
  });
});

describe("haversineMeters", () => {
  it("matches the length of one degree of latitude", () => {
    const distance = haversineMeters(52, 13, 53, 13);
    expect(distance).toBeGreaterThan(111_000);
    expect(distance).toBeLessThan(111_500);
  });

  it("is zero for identical points", () => {
    expect(haversineMeters(52.52, 13.405, 52.52, 13.405)).toBe(0);
  });
});

describe("selectNearestImage", () => {
  it("chooses the closest usable image and annotates its distance", () => {
    const image = selectNearestImage(
      [
        {
          id: "far",
          geometry: { type: "Point", coordinates: [13.42, 52.53] },
          thumb_1024_url: "https://example.test/far.jpg",
        },
        {
          id: "near",
          geometry: { type: "Point", coordinates: [13.4054, 52.5204] },
          thumb_256_url: "https://example.test/near-256.jpg",
          thumb_1024_url: "https://example.test/near.jpg",
          captured_at: 1_620_000_000_000,
          compass_angle: 180,
          is_pano: true,
        },
      ],
      52.52,
      13.405,
    );

    expect(image?.id).toBe("near");
    expect(image?.distanceMeters).toBeGreaterThan(0);
    expect(image?.distanceMeters).toBeLessThan(100);
    expect(image?.capturedAt).toBe("2021-05-03T00:00:00.000Z");
    expect(image?.isPano).toBe(true);
  });

  it("ignores images beyond the maximum distance", () => {
    const image = selectNearestImage(
      [
        {
          id: "far",
          geometry: { type: "Point", coordinates: [13.42, 52.53] },
          thumb_1024_url: "https://example.test/far.jpg",
        },
      ],
      52.52,
      13.405,
    );
    expect(image).toBeNull();
  });

  it("rejects entries without an id, geometry, or thumbnail", () => {
    const image = selectNearestImage(
      [
        { id: "no-geometry", thumb_1024_url: "https://example.test/a.jpg" },
        {
          id: "no-thumb",
          geometry: { type: "Point", coordinates: [13.4054, 52.5204] },
        },
        {
          geometry: { type: "Point", coordinates: [13.4054, 52.5204] },
          thumb_1024_url: "https://example.test/b.jpg",
        },
        null,
        "not an object",
      ],
      52.52,
      13.405,
    );
    expect(image).toBeNull();
  });

  it("falls back to computed_geometry when geometry is missing", () => {
    const image = selectNearestImage(
      [
        {
          id: "computed",
          computed_geometry: { type: "Point", coordinates: [13.4054, 52.5204] },
          thumb_1024_url: "https://example.test/a.jpg",
        },
      ],
      52.52,
      13.405,
    );
    expect(image?.id).toBe("computed");
  });

  it("keeps going when captured_at is invalid", () => {
    const image = selectNearestImage(
      [
        {
          id: "bad-date",
          geometry: { type: "Point", coordinates: [13.4054, 52.5204] },
          thumb_1024_url: "https://example.test/a.jpg",
          captured_at: "not-a-date",
        },
      ],
      52.52,
      13.405,
    );
    expect(image?.id).toBe("bad-date");
    expect(image?.capturedAt).toBeNull();
  });
});

describe("mapillary links", () => {
  it("builds the pKey deep link", () => {
    expect(mapillaryImageUrl("123 456")).toBe(
      "https://www.mapillary.com/app/?pKey=123%20456",
    );
  });

  it("builds the coordinate deep link", () => {
    expect(mapillaryPlaceUrl(52.52, 13.405)).toBe(
      "https://www.mapillary.com/app/?lat=52.52&lng=13.405&z=17",
    );
  });
});
