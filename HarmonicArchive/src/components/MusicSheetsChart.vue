<template>
  <div class="chart-container">
    <div class="chart-selector">
      <label for="chart-type">Chart Type: </label>
      <select id="chart-type" v-model="chartType">
        <option value="bar">Bar (by Decade)</option>
        <option value="pie">Pie (by Genre)</option>
      </select>
    </div>
    <div v-if="isLoading" class="loading-state">
      Loading chart data...
    </div>
    <div v-else-if="error" class="error-state">
      Error loading chart data: {{ error }}
    </div>
    <div v-else-if="!musicSheets.length" class="empty-state">
      No music sheets available to display
    </div>
    <component
      v-else
      :is="chartComponent"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script>
import { Bar, Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  BarElement,
  PieController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../services/api";

ChartJS.register(
  BarElement,
  PieController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default {
  name: "MusicSheetsChart",
  components: {
    Bar,
    Pie,
  },
  props: {
    musicSheets: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      localMusicSheets: [...this.musicSheets],
      chartType: "bar",
      isLoading: false,
      error: null,
    };
  },
  watch: {
    musicSheets: {
      handler(newValue) {
        this.localMusicSheets = [...newValue];
      },
      deep: true,
    },
    chartType() {
      this.$forceUpdate();
    },
  },
  computed: {
    chartComponent() {
      return this.chartType === "bar" ? "Bar" : "Pie";
    },
    chartData() {
      if (!Array.isArray(this.localMusicSheets)) {
        return this.emptyChartData();
      }

      if (this.chartType === "bar") {
        const decadeCounts = {};
        this.localMusicSheets.forEach((sheet) => {
          if (!sheet.year || typeof sheet.year !== "number") return;
          const decade = Math.floor(sheet.year / 10) * 10;
          decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
        });

        const decades = Object.keys(decadeCounts).map(Number).sort((a, b) => a - b);
        const labels = decades.map((decade) => `${decade}s`);
        const data = decades.map((decade) => decadeCounts[decade]);

        return {
          labels,
          datasets: [
            {
              label: "Music Sheets by Decade",
              backgroundColor: "#532b88",
              data,
              borderColor: "#ffffff",
              borderWidth: 1,
              hoverBackgroundColor: "#7a4fb3",
            },
          ],
        };
      } else {
        const genreCounts = {};
        this.localMusicSheets.forEach((sheet) => {
          if (!sheet.genres || !Array.isArray(sheet.genres)) return;
          sheet.genres.forEach((genre) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        });

        const labels = Object.keys(genreCounts).sort();
        const data = labels.map((genre) => genreCounts[genre]);
        const backgroundColors = this.generateColors(labels.length);

        return {
          labels,
          datasets: [
            {
              label: "Music Sheets by Genre",
              data,
              backgroundColor: backgroundColors,
              borderColor: "#ffffff",
              borderWidth: 1,
              hoverBackgroundColor: backgroundColors.map((color) =>
                this.lightenColor(color, 20)
              ),
            },
          ],
        };
      }
    },
    chartOptions() {
      if (this.chartType === "bar") {
        return {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) =>
                  `${context.parsed.y} sheet${context.parsed.y !== 1 ? "s" : ""}`,
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Decade",
                color: "#ffffff",
                font: {
                  size: 12,
                },
              },
              ticks: {
                color: "#ffffff",
                font: {
                  size: 10,
                },
              },
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
            },
            y: {
              title: {
                display: true,
                text: "Number of Music Sheets",
                color: "#ffffff",
                font: {
                  size: 12,
                },
              },
              ticks: {
                color: "#ffffff",
                stepSize: 1,
                precision: 0,
                font: {
                  size: 10,
                },
              },
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
              beginAtZero: true,
            },
          },
        };
      } else {
        return {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "right",
              labels: {
                color: "#ffffff",
                font: {
                  size: 10,
                },
                boxWidth: 15,
                padding: 10,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) =>
                  `${context.label}: ${context.parsed} sheet${context.parsed !== 1 ? "s" : ""}`,
              },
            },
          },
        };
      }
    },
  },
  methods: {
    emptyChartData() {
      return {
        labels: [],
        datasets: [
          {
            label: this.chartType === "bar" ? "Music Sheets by Decade" : "Music Sheets by Genre",
            data: [],
            backgroundColor: "#532b88",
          },
        ],
      };
    },
    generateColors(count) {
      const colors = [
        "#532b88",
        "#7a4fb3",
        "#9b59b6",
        "#3498db",
        "#e74c3c",
        "#2ecc71",
        "#f1c40f",
        "#e67e22",
        "#1abc9c",
        "#34495e",
      ];
      return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
    },
    lightenColor(color, percent) {
      const num = parseInt(color.replace("#", ""), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = ((num >> 8) & 0x00ff) + amt;
      const B = (num & 0x0000ff) + amt;
      return `#${(
        0x1000000 +
        (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 0 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)}`;
    },
  },
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
  max-width: 300px;
  background-color: #2c3e50;
  border-radius: 8px;
  padding: 15px;
  margin: 10px auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-selector {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-selector label {
  color: #ffffff;
  font-size: 14px;
}

.chart-selector select {
  padding: 4px;
  border-radius: 4px;
  background-color: #34495e;
  color: #ffffff;
  border: 1px solid #ffffff;
  font-size: 12px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: white;
  font-size: 14px;
}

.error-state {
  color: #ff6b6b;
}

/* Chart.js tooltip styling */
:deep(.chartjs-tooltip) {
  background-color: rgba(0, 0, 0, 0.7) !important;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
}

:deep(.chartjs-tooltip-key) {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 4px;
}
</style>