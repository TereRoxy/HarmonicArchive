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
import api from "../services/api"; // Import the API

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
  data() {
    return {
      musicSheets: [], // Local state for music sheets
    };
  },
  computed: {
    chartData() {
      const decadeCounts = {};

      // Process the music sheets data
      this.musicSheets.forEach((sheet) => {
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
  methods: {
    fetchMusicSheets() {

      console.log("Fetching music sheets for chart.");

      // Fetch music sheets from the API
      api.getSheets()
        .then((response) => {
          console.log("Music sheets fetched successfully for chart:", response.data);
          this.musicSheets = response.data;
        })
        .catch((error) => {
          console.error("Error fetching music sheets:", error);
        });
    },
  },
  created() {
    // Fetch data when the component is created
    this.fetchMusicSheets();
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