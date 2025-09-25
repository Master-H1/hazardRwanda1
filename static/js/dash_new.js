let map = L.map('map', {
  center: [-1.9403, 29.8739],
  zoom: 8,
  maxBounds: [
    [-2.9, 28.8],
    [-1.0, 30.9],
  ],
  maxBoundsViscosity: 1.0,
});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let geoLayer;
let allClimateData = [];
let rwandaGeoJSON;
let mapVar = 'Rainfall'; // default variable for map
const PROVINCE_MAP = {}; // To map District -> Province
const PROVINCE_DISTRICTS_MAP = {}; // To map Province -> [Districts]

// Load climate data + districts
Promise.all([fetch('/static/data/climate.json').then((res) => res.json()), fetch('/static/data/rwanda_districts.geojson').then((res) => res.json())]).then(([data, geojson]) => {
  rwandaGeoJSON = geojson;
  // Create lookups for District -> Province and Province -> [Districts]
  rwandaGeoJSON.features.forEach((f) => {
    PROVINCE_MAP[f.properties.District] = f.properties.Province;
    if (!PROVINCE_DISTRICTS_MAP[f.properties.Province]) {
      PROVINCE_DISTRICTS_MAP[f.properties.Province] = [];
    }
    PROVINCE_DISTRICTS_MAP[f.properties.Province].push(f.properties.District);
  });

  // Normalize and enrich climate data
  allClimateData = data.map((d) => ({
    Year: d.year,
    Month: d.month,
    District: d.district,
    Province: PROVINCE_MAP[d.district] || null,
    Temperature: d.temperature,
    Rainfall: d.rainfall,
    SoilMoisture: d.soil_moisture,
  }));

  buildFilters();
  updateDashboard();
});

// Build filter dropdowns
function buildFilters() {
  const provinces = new Set(Object.values(PROVINCE_MAP));
  const districts = new Set(allClimateData.map((d) => d.District));
  const years = new Set(allClimateData.map((d) => d.Year));
  const months = new Set(allClimateData.map((d) => d.Month));

  fillSelect('province-filter', provinces);
  fillSelect('district-filter', districts);
  fillSelect('year-filter', years);
  fillSelect('month-filter', months);

  document.getElementById('province-filter').addEventListener('change', () => {
    updateDistrictFilter();
    updateDashboard();
  });
  ['district-filter', 'year-filter', 'month-filter'].forEach((id) => document.getElementById(id).addEventListener('change', updateDashboard));
}

function updateDistrictFilter() {
  const province = document.getElementById('province-filter').value;
  const districts = province === 'all' ? new Set(allClimateData.map((d) => d.District)) : PROVINCE_DISTRICTS_MAP[province] || [];
  const districtSelect = document.getElementById('district-filter');
  districtSelect.innerHTML = '<option value="all">All Districts</option>'; // Reset
  fillSelect('district-filter', districts, false); // Don't add the 'All' option again
}

function fillSelect(id, values) {
  const select = document.getElementById(id);
  [...values].sort().forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

function fillSelect(id, values, addAllOption = true) {
  const select = document.getElementById(id);
  if (addAllOption) select.innerHTML = '<option value="all">All ' + id.split('-')[0].charAt(0).toUpperCase() + id.split('-')[0].slice(1) + 's</option>';
  [...values].sort().forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

// Main dashboard update
function updateDashboard() {
  const province = document.getElementById('province-filter').value;
  const district = document.getElementById('district-filter').value;
  const year = document.getElementById('year-filter').value;
  const month = document.getElementById('month-filter').value;

  let filteredData = allClimateData.filter(
    (d) => (province === 'all' || d.Province === province) && (district === 'all' || d.District === district) && (year === 'all' || d.Year == year) && (month === 'all' || d.Month == month)
  );

  // Group by district and calculate averages
  const districtAggregates = {};
  rwandaGeoJSON.features.forEach((f) => {
    const districtName = f.properties.District;
    const districtData = filteredData.filter((d) => d.District === districtName);

    districtAggregates[districtName] = {
      Rainfall: avg(districtData, 'Rainfall', true),
      Temperature: avg(districtData, 'Temperature', true),
      SoilMoisture: avg(districtData, 'SoilMoisture', true),
      District: districtName,
    };
  });

  // Update KPI cards
  document.getElementById('kpi-rain').textContent = `${avg(filteredData, 'Rainfall')} mm`;
  document.getElementById('kpi-temp').textContent = `${avg(filteredData, 'Temperature')} °C`;
  document.getElementById('kpi-soil').textContent = `${avg(filteredData, 'SoilMoisture')} %`;

  // For chart and table, only show districts that are part of the filtered province
  let chartAndTableData = Object.values(districtAggregates).filter((d) => d[mapVar] !== '--');
  if (province !== 'all') {
    const districtsInProvince = PROVINCE_DISTRICTS_MAP[province] || [];
    chartAndTableData = chartAndTableData.filter((d) => districtsInProvince.includes(d.District));
  }

  // Update map
  if (geoLayer) map.removeLayer(geoLayer);
  geoLayer = L.geoJSON(rwandaGeoJSON, {
    style: (f) => styleFeature(f, districtAggregates),
    onEachFeature: (f, layer) => {
      const districtName = f.properties.District;
      const aggData = districtAggregates[districtName];
      let val = aggData && aggData[mapVar] !== '--' ? aggData[mapVar].toFixed(2) : 'N/A';
      if (val !== 'N/A') val += mapVar === 'Temperature' ? ' °C' : mapVar === 'SoilMoisture' ? ' %' : ' mm';
      layer.bindTooltip(`<b>${f.properties.District}</b><br>${mapVar}: ${val}`);
    },
  }).addTo(map);

  // Update chart + table
  updateChart(chartAndTableData);
  updateTable(chartAndTableData);
}

// Style features by selected variable
function styleFeature(feature, data) {
  const districtName = feature.properties.District;
  const val = data[districtName] ? data[districtName][mapVar] : 0;
  return {
    fillColor: getColor(val),
    weight: 1,
    color: 'white',
    fillOpacity: 0.7,
  };
}

const avg = (arr, k, returnNum = false) => {
  const val = arr.length ? arr.reduce((s, x) => s + x[k], 0) / arr.length : 0;
  if (returnNum) return val;
  return arr.length ? val.toFixed(2) : '--';
};

function getColorRainfall(v) {
  return v > 180 ? '#08306b' : v > 140 ? '#2171b5' : v > 100 ? '#4292c6' : v > 60 ? '#6baed6' : v > 20 ? '#9ecae1' : '#deebf7';
}

function getColorTemperature(v) {
  // Red color scale for temperature
  return v > 28 ? '#67000d' : v > 26 ? '#a50f15' : v > 24 ? '#cb181d' : v > 22 ? '#ef3b2c' : v > 20 ? '#fb6a4a' : '#fc9272';
}

function getColorSoilMoisture(v) {
  // Brown/Green color scale for soil moisture
  return v > 55 ? '#00441b' : v > 45 ? '#238b45' : v > 35 ? '#41ab5d' : v > 25 ? '#74c476' : v > 15 ? '#a1d99b' : '#c7e9c0';
}

function getColor(v) {
  if (v === '--' || v === 0 || v === null || isNaN(v)) return '#f0f0f0'; // Default color for no data
  switch (mapVar) {
    case 'Temperature':
      return getColorTemperature(v);
    case 'SoilMoisture':
      return getColorSoilMoisture(v);
    default:
      return getColorRainfall(v);
  }
}

// Chart.js bar chart
let chart;
function updateChart(data) {
  const sortedData = [...data].sort((a, b) => b[mapVar] - a[mapVar]);
  const labels = sortedData.map((d) => d.District);
  const values = sortedData.map((d) => d[mapVar]);
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: { labels, datasets: [{ label: mapVar, data: values }] },
    options: { responsive: true },
  });
}

// Table update
function updateTable(data) {
  const tbody = document.querySelector('#dataTable tbody');
  tbody.innerHTML = '';
  data
    .sort((a, b) => b[mapVar] - a[mapVar])
    .forEach((d) => {
      tbody.innerHTML += `<tr><td>${d.District}</td><td>${d[mapVar] === '--' ? '--' : d[mapVar].toFixed(2)}</td></tr>`;
    });
}

// Change map variable
function setMapVar(v) {
  mapVar = v;
  document.getElementById('map-variable').textContent = v;
  document.getElementById('metric-col').textContent = v;
  updateDashboard();
}
