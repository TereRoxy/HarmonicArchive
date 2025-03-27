<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
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
import { state } from "../sharedstate"; // Import the shared state

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default {
  components: {
    Bar,
  },
  computed: {
    chartData() {
      const decadeCounts = {};

      // Use state.musicSheets directly
      state.musicSheets.forEach((sheet) => {
        const decade = Math.floor(sheet.year / 10) * 10;
        if (decadeCounts[decade]) {
          decadeCounts[decade]++;
        } else {
          decadeCounts[decade] = 1;
        }
      });

      const labels = Object.keys(decadeCounts)
        .sort((a, b) => a - b)
        .map((decade) => `${decade}s`);
      const data = labels.map((label) => decadeCounts[parseInt(label)]);

      return {
        labels,
        datasets: [
          {
            label: "Music Sheets",
            backgroundColor: "#532b88",
            data,
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Decade",
            },
          },
          y: {
            title: {
              display: true,
              text: "Number of Music Sheets",
            },
            beginAtZero: true,
          },
        },
      };
    },
  },
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  color: white;
  background-color: #c8b1e4;
  margin: 15px;
  padding: 5px;
}
</style>
