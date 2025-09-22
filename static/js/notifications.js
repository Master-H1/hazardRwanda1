/* ---------------------------
   Sample data (dummy notifications)
   Replace this array with a fetch(...) to load real data (JSON).
   --------------------------- */
const sampleData = [
  {
    region: "Eastern",
    district: "Nyagatare",
    sector: "Sector B",
    cell: "Cell 4",
    disaster: "Landslide",
    risk: "Moderate",
    rec: "Prepare evacuation routes and shelters",
  },
  {
    region: "Western",
    district: "Nyamasheke",
    sector: "Sector A",
    cell: "Cell 1",
    disaster: "Strong Winds",
    risk: "Low",
    rec: "Prepare emergency supplies and lighting",
  },
  {
    region: "Northern",
    district: "Burera",
    sector: "Sector C",
    cell: "Cell 3",
    disaster: "Flood",
    risk: "Low",
    rec: "Avoid crossing flooded roads",
  },
  {
    region: "Eastern",
    district: "Kayonza",
    sector: "Sector A",
    cell: "Cell 3",
    disaster: "Strong Winds",
    risk: "Moderate",
    rec: "Avoid staying under weak trees",
  },
  {
    region: "Northern",
    district: "Musanze",
    sector: "Sector A",
    cell: "Cell 3",
    disaster: "Flood",
    risk: "Low",
    rec: "Move valuables to higher ground",
  },
  {
    region: "Southern",
    district: "Huye",
    sector: "Sector D",
    cell: "Cell 2",
    disaster: "Drought",
    risk: "High",
    rec: "Store and ration water; coordinate with authorities",
  },
  {
    region: "Kigali",
    district: "Gasabo",
    sector: "Sector B",
    cell: "Cell 1",
    disaster: "Landslide",
    risk: "High",
    rec: "Move families away from steep slopes; prepare shelters",
  },
  {
    region: "Western",
    district: "Rubavu",
    sector: "Sector C",
    cell: "Cell 4",
    disaster: "Flood",
    risk: "Moderate",
    rec: "Identify safe high-ground evacuation points",
  },
  {
    region: "Southern",
    district: "Nyanza",
    sector: "Sector A",
    cell: "Cell 2",
    disaster: "Strong Winds",
    risk: "Low",
    rec: "Secure loose roofing and outdoor items",
  },
  {
    region: "Eastern",
    district: "Rwamagana",
    sector: "Sector D",
    cell: "Cell 3",
    disaster: "Drought",
    risk: "Moderate",
    rec: "Protect crops with mulching and small-scale irrigation",
  },
  {
    region: "Northern",
    district: "Gicumbi",
    sector: "Sector B",
    cell: "Cell 4",
    disaster: "Landslide",
    risk: "Moderate",
    rec: "Clear drainage paths and monitor slope movement",
  },
  {
    region: "Eastern",
    district: "Nyagatare",
    sector: "Sector C",
    cell: "Cell 2",
    disaster: "Flood",
    risk: "High",
    rec: "Relocate families in floodplain zones; prepare safe water supply",
  },
  {
    region: "Kigali",
    district: "Kicukiro",
    sector: "Sector A",
    cell: "Cell 3",
    disaster: "Strong Winds",
    risk: "Moderate",
    rec: "Trim weak branches and avoid travel during gusts",
  },
  {
    region: "Western",
    district: "Rusizi",
    sector: "Sector D",
    cell: "Cell 1",
    disaster: "Drought",
    risk: "High",
    rec: "Organize community water trucking and rationing",
  },
  {
    region: "Southern",
    district: "Muhanga",
    sector: "Sector B",
    cell: "Cell 4",
    disaster: "Landslide",
    risk: "Low",
    rec: "Inform households and mark unsafe slopes",
  },
];

/* ---------------------------
   Basic state & utilities
   --------------------------- */
let state = {
  data: sampleData.slice(),
  sortKey: null,
  sortDir: 1, // 1 asc, -1 desc
  filters: { region: "", disaster: "", risk: "", q: "" },
};

const $tbody = document.querySelector("#notifTable tbody");
const $selRegion = document.getElementById("selRegion");
const $selDisaster = document.getElementById("selDisaster");
const $selRisk = document.getElementById("selRisk");
const $txtSearch = document.getElementById("txtSearch");
const $btnExport = document.getElementById("btnExport");

/* ---------------------------
   Populate filter dropdowns from data
   --------------------------- */
function populateFilters() {
  const regions = Array.from(new Set(state.data.map((d) => d.region))).sort();
  const disasters = Array.from(
    new Set(state.data.map((d) => d.disaster))
  ).sort();

  regions.forEach((r) => {
    const o = document.createElement("option");
    o.value = r;
    o.textContent = r;
    $selRegion.appendChild(o);
  });
  disasters.forEach((d) => {
    const o = document.createElement("option");
    o.value = d;
    o.textContent = d;
    $selDisaster.appendChild(o);
  });
}

/* ---------------------------
   Render table rows based on current filters & sort
   --------------------------- */
function render() {
  // filter
  const f = state.filters;
  let rows = state.data.filter((row) => {
    if (f.region && row.region !== f.region) return false;
    if (f.disaster && row.disaster !== f.disaster) return false;
    if (f.risk && row.risk !== f.risk) return false;
    if (f.q) {
      const q = f.q.toLowerCase();
      // search across multiple fields
      if (
        !(
          row.region +
          " " +
          row.district +
          " " +
          row.sector +
          " " +
          row.cell +
          " " +
          row.disaster +
          " " +
          row.rec
        )
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  // sort
  if (state.sortKey) {
    rows.sort((a, b) => {
      const va = (a[state.sortKey] || "").toString().toLowerCase();
      const vb = (b[state.sortKey] || "").toString().toLowerCase();
      if (va < vb) return -1 * state.sortDir;
      if (va > vb) return 1 * state.sortDir;
      return 0;
    });
  }

  // build rows
  $tbody.innerHTML = "";
  for (const r of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(r.region)}</td>
      <td>${escapeHtml(r.district)}</td>
      <td>${escapeHtml(r.sector)}</td>
      <td>${escapeHtml(r.cell)}</td>
      <td><span class="pill">${escapeHtml(r.disaster)}</span></td>
      <td>${riskLabel(r.risk)}</td>
      <td>${escapeHtml(r.rec)}</td>
    `;
    $tbody.appendChild(tr);
  }
}

/* ---------------------------
   Helpers
   --------------------------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m];
  });
}
function riskLabel(level) {
  const v = level || "";
  if (v.toLowerCase() === "high") return `<span class="risk-high">High</span>`;
  if (v.toLowerCase() === "moderate")
    return `<span class="risk-moderate">Moderate</span>`;
  return `<span class="risk-low">Low</span>`;
}

/* ---------------------------
   Sorting header click
   --------------------------- */
document.querySelectorAll("#notifTable thead th").forEach(th=>{
  th.addEventListener("click", ()=>{
    const key = th.dataset.key;
    if(!key) return;
    if(state.sortKey === key) state.sortDir *= -1;
    else { state.sortKey = key; state.sortDir = 1; }
    // header visuals
    document.querySelectorAll("#notifTable thead th").forEach(h=>h.classList.remove("sort-asc","sort-desc"));
    th.classList.add(state.sortDir === 1 ? "sort-asc" : "sort-desc");
    render();
  });
});

/* ---------------------------
   Filters & search events
   --------------------------- */
$selRegion.addEventListener("change", ()=>{ state.filters.region = $selRegion.value; render(); });
$selDisaster.addEventListener("change", ()=>{ state.filters.disaster = $selDisaster.value; render(); });
$selRisk.addEventListener("change", ()=>{ state.filters.risk = $selRisk.value; render(); });
$txtSearch.addEventListener("input", () => { state.filters.q = $txtSearch.value.trim(); render(); });

/* ---------------------------
   CSV Export of visible rows
   --------------------------- */
$btnExport.addEventListener("click", ()=>{
  // collect current visible rows from tbody
  const rows = Array.from($tbody.querySelectorAll("tr")).map(tr=>{
    return Array.from(tr.querySelectorAll("td")).map(td => td.textContent.trim());
  });
  if(rows.length === 0){ alert("No rows to export (adjust filters/search)."); return; }
  const header = ["Region","District","Sector","Cell","Disaster Type","Risk Level","Key Recommendation"];
  const csv = [header.join(",")].concat(rows.map(r => r.map(cell => `"${cell.replace(/"/g,'""')}"`).join(","))).join("\n");
  const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "notifications_export.csv"; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 1000);
});

/* ---------------------------
   Init
   --------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  populateFilters();
  render();
});
