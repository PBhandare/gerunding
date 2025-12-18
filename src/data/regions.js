export const regions = {
  indoEurasian: {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[
        // ---- WESTERN EDGE (Iranian plateau) ----
        [45, 38],  // NW Iran
        [60, 40],  // NE Iran
        [67, 37],  // Afghanistan north
        [75, 35],  // Pakistan / Kashmir

        // ---- INDIA → BAY OF BENGAL ----
        [88, 27],  // Northeast India
        [95, 25],  // Myanmar north

        // ---- MAINLAND SOUTHEAST ASIA ----
        [100, 21], // Thailand north
        [104, 18], // Laos
        [107, 16], // Vietnam
        [110, 10], // South Vietnam
        [106, 5],  // Cambodia → Gulf of Thailand

        // ---- MARITIME SE ASIA ----
        [102, 1],  // Malaysia
        [108, -5], // Indonesia (Sumatra → Java arc)
        [118, -1], // Borneo
        [125, 5],  // Philippines west
        [130, 10], // Philippines north

        // ---- TAIWAN → RYUKYUS → JAPAN ----
        [122, 23], // Taiwan
        [125, 27], // Okinawa / Ryukyu
        [141, 45], // Northern Japan (Hokkaido)

        // ---- BACK WEST ALONG 45°N ----
        [110, 45], // NE China (Manchuria)
        [85, 45],  // Central Asia Kazakhstan edge
        [60, 40],  // Back to Iran
        [45, 38]   // Close polygon
      ]]
    },
    properties: {
      name: "Indo-Iranian → Indo-Aryan → SE Asia → Japan World"
    }
  }
};
