// Navigation between pages
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", function () {
    const targetPage = this.getAttribute("data-page");

    // Update active navigation
    document.querySelectorAll(".nav-item").forEach((nav) => {
      nav.classList.remove("active");
    });
    this.classList.add("active");

    // Update page content
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.remove("active");
    });
    document.getElementById(targetPage).classList.add("active");

    // Update page title
    let title = this.querySelector("span").textContent;
    document.querySelector(".page-title").textContent =
      title +
      (title === "Reports" ? "" : " Overview") +
      (title === "Dashboard" ? "" : "");
  });
});

// Initialize charts for Hazard Monitoring Page
document.addEventListener("DOMContentLoaded", function () {
  // Precipitation chart
  const precipChart = echarts.init(
    document.getElementById("precipitation-chart")
  );
  precipChart.setOption({
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
      name: "mm",
    },
    series: [
      {
        name: "Precipitation",
        type: "bar",
        data: [12, 48, 6, 3, 26, 10, 5],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#0276aa" },
            { offset: 1, color: "#9ad4e3" },
          ]),
        },
      },
    ],
  });

  // Temperature chart
  const tempChart = echarts.init(document.getElementById("temperature-chart"));
  tempChart.setOption({
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["Actual", "Average"],
    },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
      name: "°C",
    },
    series: [
      {
        name: "Actual",
        type: "line",
        data: [26, 28, 30, 32, 31, 29, 27],
        symbolSize: 8,
        lineStyle: {
          width: 3,
        },
        itemStyle: {
          color: "#e63946",
        },
      },
      {
        name: "Average",
        type: "line",
        data: [22, 22, 23, 24, 23, 23, 22],
        symbolSize: 8,
        lineStyle: {
          width: 3,
          type: "dashed",
        },
        itemStyle: {
          color: "#0077b6",
        },
      },
    ],
  });

  // Water level chart
  const waterChart = echarts.init(document.getElementById("water-chart"));
  waterChart.setOption({
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: ["5:00", "7:00", "9:00", "11:00", "13:00", "15:00", "17:00"],
    },
    yAxis: {
      type: "value",
      name: "meters",
    },
    series: [
      {
        data: [2.2, 2.4, 2.6, 2.8, 3.0, 3.1, 3.2],
        type: "line",
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#0276aa" },
            { offset: 1, color: "#caf0f8" },
          ]),
        },
        lineStyle: {
          width: 3,
          color: "#0288d1",
        },
      },
    ],
  });

  // Soil moisture chart
  const soilChart = echarts.init(document.getElementById("soil-chart"));
  soilChart.setOption({
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E"],
    },
    yAxis: {
      type: "value",
      name: "%",
      max: 100,
    },
    series: [
      {
        type: "bar",
        data: [18, 35, 42, 12, 24],
        itemStyle: {
          color: function (params) {
            const colorList = [
              "#d94832",
              "#e76f51",
              "#f7b538",
              "#90a955",
              "#168aad",
            ];
            return colorList[params.dataIndex];
          },
        },
      },
    ],
  });

  // Handle window resize
  window.addEventListener("resize", function () {
    precipChart.resize();
    tempChart.resize();
    waterChart.resize();
    soilChart.resize();
  });
});
