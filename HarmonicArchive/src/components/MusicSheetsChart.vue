<template>
  <div class="chart-container">
    <div v-if="isLoading" class="loading-state">
      Loading chart data...
    </div>
    <div v-else-if="error" class="error-state">
      Error loading chart data: {{ error }}
    </div>
    <div v-else-if="!musicSheets.length" class="empty-state">
      No music sheets available to display
    </div>
    <Bar v-else :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../services/api";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default {
  name: 'MusicSheetsChart',
  components: {
    Bar,
  },
  data() {
    return {
      localMusicSheets: [...this.musicSheets],
      error: false,
      isLoading: false,
    };
  },
  props: {
    musicSheets: {
      type: Array,
      required: true,
    }
  },
  watch: {
    // Watch for changes in the prop and update the local copy
    musicSheets: {
      handler(newValue) {
        this.localMusicSheets = [...newValue];
      },
      deep: true,
    },
  },
  computed: {
    chartData() {
      if (!Array.isArray(this.localMusicSheets)) {
        return this.emptyChartData();
      }

      const decadeCounts = {};
      this.localMusicSheets.forEach((sheet) => {
        if (!sheet.year || typeof sheet.year !== 'number') return;
        const decade = Math.floor(sheet.year / 10) * 10;
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
      });

      const decades = Object.keys(decadeCounts).map(Number).sort((a, b) => a - b);
      const labels = decades.map(decade => `${decade}s`);
      const data = decades.map(decade => decadeCounts[decade]);

      return {
        labels,
        datasets: [
          {
            label: "Music Sheets",
            backgroundColor: "#532b88",
            data,
            borderColor: '#ffffff',
            borderWidth: 1,
            hoverBackgroundColor: '#7a4fb3',
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} sheet${context.parsed.y !== 1 ? 's' : ''}`
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Decade",
              color: '#ffffff'
            },
            ticks: {
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: "Number of Music Sheets",
              color: '#ffffff'
            },
            ticks: {
              color: '#ffffff',
              stepSize: 1,
              precision: 0
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            beginAtZero: true,
          },
        },
      };
    },
  },
  methods: {
    emptyChartData() {
      return {
        labels: [],
        datasets: [{
          label: "Music Sheets",
          data: [],
          backgroundColor: "#532b88"
        }]
      };
    }
  },
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 250px;
  max-width: 300px;
  background-color: #2c3e50;
  border-radius: 8px;
  padding: 20px;
  margin: 15px auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: white;
  font-size: 16px;
}

.error-state {
  color: #ff6b6b;
}

/* Chart.js tooltip styling */
:deep(.chartjs-tooltip) {
  background-color: rgba(0, 0, 0, 0.7) !important;
  border-radius: 4px;
  padding: 8px 12px;
}

:deep(.chartjs-tooltip-key) {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
}
</style>