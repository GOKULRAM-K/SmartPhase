// src/utils/geo.ts
export const SAMPLE_FEEDERS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Feeder-A", id: "F-A" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.6, 8.3],
            [77.2, 8.3],
            [77.2, 8.8],
            [76.6, 8.8],
            [76.6, 8.3],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Feeder-B", id: "F-B" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.0, 9.6],
            [76.6, 9.6],
            [76.6, 10.1],
            [76.0, 10.1],
            [76.0, 9.6],
          ],
        ],
      },
    },
  ],
};
