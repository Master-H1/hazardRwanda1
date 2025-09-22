document.addEventListener('DOMContentLoaded', function () {
  // Initialize Leaflet map
  const map = L.map('map').setView([-1.9403, 29.8739], 8); // Centered on Rwanda

  // Add a base map layer (e.g., OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // --- Sample GeoJSON data for Rwanda Provinces and Hazard Data ---
  // In a real application, you would fetch this from a server.
  const rwandaProvinces = {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { name: 'Kigali', flood: 'High', landslide: 'Low', drought: 'Low' }, geometry: { type: 'Point', coordinates: [30.0588, -1.9441] } },
      { type: 'Feature', properties: { name: 'Southern', flood: 'Moderate', landslide: 'High', drought: 'Moderate' }, geometry: { type: 'Point', coordinates: [29.74, -2.48] } },
      { type: 'Feature', properties: { name: 'Western', flood: 'High', landslide: 'High', drought: 'Low' }, geometry: { type: 'Point', coordinates: [29.35, -2.05] } },
      { type: 'Feature', properties: { name: 'Northern', flood: 'Moderate', landslide: 'High', drought: 'Low' }, geometry: { type: 'Point', coordinates: [29.8, -1.6] } },
      { type: 'Feature', properties: { name: 'Eastern', flood: 'Low', landslide: 'Low', drought: 'High' }, geometry: { type: 'Point', coordinates: [30.6, -1.8] } },
    ],
  };

  // --- Layer Groups for Hazards ---
  const hazardLayers = {
    flood: L.layerGroup(),
    landslide: L.layerGroup(),
    drought: L.layerGroup(),
  };

  // --- Function to get color based on risk level ---
  const getColor = (level) => {
    switch (level) {
      case 'High':
        return 'var(--danger-color)';
      case 'Moderate':
        return 'var(--warning-color)';
      case 'Low':
        return 'var(--success-color)';
      default:
        return '#ccc';
    }
  };

  // --- Populate Layers ---
  rwandaProvinces.features.forEach((province) => {
    const { name, flood, landslide, drought } = province.properties;
    const coords = province.geometry.coordinates.reverse(); // Leaflet uses [lat, lng]

    // Add to flood layer
    if (flood !== 'Low') {
      L.circle(coords, {
        color: getColor(flood),
        fillColor: getColor(flood),
        fillOpacity: 0.5,
        radius: 15000, // Radius in meters
      })
        .bindPopup(`<b>${name}</b><br>Flood Risk: ${flood}`)
        .addTo(hazardLayers.flood);
    }
    // Add to landslide layer
    if (landslide !== 'Low') {
      L.circle(coords, {
        color: getColor(landslide),
        fillColor: getColor(landslide),
        fillOpacity: 0.5,
        radius: 12000,
      })
        .bindPopup(`<b>${name}</b><br>Landslide Risk: ${landslide}`)
        .addTo(hazardLayers.landslide);
    }
    // Add to drought layer
    if (drought !== 'Low') {
      L.circle(coords, {
        color: getColor(drought),
        fillColor: getColor(drought),
        fillOpacity: 0.5,
        radius: 18000,
      })
        .bindPopup(`<b>${name}</b><br>Drought Risk: ${drought}`)
        .addTo(hazardLayers.drought);
    }
  });

  // Add layers to map by default
  Object.values(hazardLayers).forEach((layer) => layer.addTo(map));

  // --- Event Listeners for Controls ---
  // Hazard Toggles
  document.querySelectorAll('.map-toggle-btn').forEach((button) => {
    button.addEventListener('click', function () {
      this.classList.toggle('active');
      const layerName = this.dataset.layer;
      if (this.classList.contains('active')) {
        map.addLayer(hazardLayers[layerName]);
      } else {
        map.removeLayer(hazardLayers[layerName]);
      }
    });
  });

  // Province Filter Dropdown
  const provinceFilter = document.getElementById('province-filter');
  provinceFilter.addEventListener('change', function () {
    const selectedProvince = this.value;
    if (selectedProvince === 'all') {
      map.setView([-1.9403, 29.8739], 8); // Reset view
    } else {
      const provinceFeature = rwandaProvinces.features.find((p) => p.properties.name === selectedProvince);
      if (provinceFeature) {
        const coords = provinceFeature.geometry.coordinates; // Note: already reversed
        map.setView(coords, 10); // Zoom into the province
      }
    }
  });

  // Invalidate map size in case it was rendered while hidden
  setTimeout(() => {
    map.invalidateSize();
  }, 400);
});
