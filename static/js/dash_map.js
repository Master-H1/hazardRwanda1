document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([-1.9403, 29.8739], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let geojsonLayer;

    fetch("{% static 'data/hazards.geojson' %}")  // adjust your app name
      .then(response => response.json())
      .then(data => {
          geojsonLayer = L.geoJSON(data, {
              style: { color: "red", weight: 1, fillOpacity: 0.5 },
              onEachFeature: (feature, layer) => {
                  const p = feature.properties;
                  layer.bindPopup(`
                      <b>${p.District || 'Unknown District'}</b><br>
                      Province: ${p.Province || 'Unknown'}<br>
                      Type: ${p.Disaster_1 || 'Unknown'}<br>
                      Deaths: ${p['Total Deat'] || 0}<br>
                      Affected: ${p['Total Affe'] || 0}<br>
                      Date: ${p.Date || 'N/A'}
                  `);
              }
          }).addTo(map);

          buildFilters(data);
      });

    // Populate filters dynamically
    function buildFilters(data) {
        const provinces = new Set();
        const districts = new Set();
        const subtypes = new Set();
        const years = new Set();

        data.features.forEach(f => {
            const p = f.properties;
            if (p.Province) provinces.add(p.Province);
            if (p.District) districts.add(p.District);
            if (p.Disaster_1) subtypes.add(p.Disaster_1);
            if (p.Date) years.add(new Date(p.Date).getFullYear());
        });

        fillSelect("province-filter", provinces);
        fillSelect("district-filter", districts);
        fillSelect("subtype-filter", subtypes);
        fillSelect("year-filter", years);

        ["province-filter","district-filter","subtype-filter","year-filter"].forEach(id => {
            document.getElementById(id).addEventListener("change", () => applyFilters(data));
        });
    }

    function fillSelect(id, values) {
        const select = document.getElementById(id);
        select.innerHTML += Array.from(values).sort().map(v => `<option value="${v}">${v}</option>`).join('');
    }

    // Filtering logic
    function applyFilters(data) {
        if (geojsonLayer) map.removeLayer(geojsonLayer);

        const province = document.getElementById('province-filter').value;
        const district = document.getElementById('district-filter').value;
        const subtype = document.getElementById('subtype-filter').value;
        const year = document.getElementById('year-filter').value;

        geojsonLayer = L.geoJSON(data, {
            filter: feature => {
                const p = feature.properties;
                const y = p.Date ? new Date(p.Date).getFullYear().toString() : "";
                return (
                    (province === "all" || p.Province === province) &&
                    (district === "all" || p.District === district) &&
                    (subtype === "all" || p.Disaster_1 === subtype) &&
                    (year === "all" || y === year)
                );
            },
            style: { color: "red", weight: 1, fillOpacity: 0.5 },
            onEachFeature: (feature, layer) => {
                const p = feature.properties;
                layer.bindPopup(`
                    <b>${p.District || 'Unknown District'}</b><br>
                    Province: ${p.Province || 'Unknown'}<br>
                    Type: ${p.Disaster_1 || 'Unknown'}<br>
                    Deaths: ${p['Total Deat'] || 0}<br>
                    Affected: ${p['Total Affe'] || 0}<br>
                    Date: ${p.Date || 'N/A'}
                `);
            }
        }).addTo(map);
    }
});

