document.addEventListener('DOMContentLoaded', function () {
  const map = L.map('map', {
    center: [-1.9403, 29.8739], // Rwanda center
    zoom: 8,
    maxBounds: [
      [-2.9, 28.8], // Southwest corner (lat, lng)
      [-1.0, 30.9]  // Northeast corner (lat, lng)
    ],
    maxBoundsViscosity: 1.0 // fully restricts movement outside bounds
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Ensure map fits nicely inside the bounds
  map.fitBounds([
    [-2.9, 28.8], 
    [-1.0, 30.9]
  ]);

  let geojsonLayer;
  let allFeatures;

  // Fetch GeoJSON
  fetch('/static/data/hazards.geojson')
    .then((res) => res.json())
    .then((data) => {
      allFeatures = data.features;
      buildFilters(allFeatures);
      applyFilters();

      document.getElementById('province-filter').addEventListener('change', applyFilters);
      document.getElementById('subtype-filter').addEventListener('change', applyFilters);
      document.getElementById('year-filter').addEventListener('change', applyFilters);
    })
    .catch((err) => {
      console.error('Error loading GeoJSON:', err);
      document.getElementById('map').innerHTML = '<p style="text-align:center; padding:20px;">Could not load map data.</p>';
    });

  // Apply filters + draw map
  function applyFilters() {
    if (geojsonLayer) {
      map.removeLayer(geojsonLayer);
    }

    const selectedProvince = document.getElementById('province-filter').value;
    const selectedType = document.getElementById('subtype-filter').value;
    const selectedYear = document.getElementById('year-filter').value;

    const filtered = allFeatures.filter((f) => {
      const p = f.properties;
      const year = p.Date ? new Date(p.Date).getFullYear().toString() : null;
      return (selectedProvince === 'all' || p.Province === selectedProvince) &&
             (selectedType === 'all' || p.Disaster_1 === selectedType) &&
             (selectedYear === 'all' || year === selectedYear);
    });

    updateKPIs(filtered);

    geojsonLayer = L.geoJSON(
      { type: 'FeatureCollection', features: filtered },
      {
        style: styleByCases,
        onEachFeature: (feature, layer) => {
          const p = feature.properties;
          layer.bindTooltip(
            `<b>${p.District || 'N/A'}</b><br>
             Disaster: ${p.Disaster_1 || 'N/A'}<br>
             Deaths: ${p['Total Deat'] || 0}<br>
             Affected: ${p['Total Affe'] || 0}`
          );
        },
      }
    ).addTo(map);
  }

  // Style provinces by number of affected cases
  function styleByCases(feature) {
    const affected = feature.properties['Total Affe'] || 0;
    return {
      fillColor: getColor(affected),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  }

  // Color scale: low → high
  function getColor(x) {
    return x > 5000 ? '#800026' :
           x > 2000 ? '#BD0026' :
           x > 1000 ? '#E31A1C' :
           x > 500  ? '#FC4E2A' :
           x > 100  ? '#FD8D3C' :
           x > 50   ? '#FEB24C' :
           x > 10   ? '#FED976' :
                      '#FFEDA0';
  }

  // Build dropdown filters
  function buildFilters(features) {
    const provinces = new Set();
    const types = new Set();
    const years = new Set();

    features.forEach((f) => {
      const p = f.properties;
      if (p.Province) provinces.add(p.Province);
      if (p.Disaster_1) types.add(p.Disaster_1);
      if (p.Date) years.add(new Date(p.Date).getFullYear());
    });

    fillSelect('province-filter', provinces);
    fillSelect('subtype-filter', types);
    fillSelect('year-filter', years);
  }

  function fillSelect(id, values) {
    const select = document.getElementById(id);
    const sorted = Array.from(values).sort();
    sorted.forEach((v) => {
      const option = document.createElement('option');
      option.value = v;
      option.textContent = v;
      select.appendChild(option);
    });
  }

  // Update KPI counters
  function updateKPIs(features) {
    const flood = features.filter((f) => f.properties.Disaster_1?.toLowerCase().includes('flood')).length;
    const drought = features.filter((f) => f.properties.Disaster_1?.toLowerCase().includes('drought')).length;
    const landslide = features.filter((f) => f.properties.Disaster_1?.toLowerCase().includes('landslide')).length;

    document.getElementById('kpi-flood-value').textContent = flood;
    document.getElementById('kpi-drought-value').textContent = drought;
    document.getElementById('kpi-landslide-value').textContent = landslide;
    document.getElementById('kpi-total-value').textContent = features.length;
  }
});

