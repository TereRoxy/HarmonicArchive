<template>
  <div class="app-container">
    <!-- Sidebar Component -->
    <Sidebar
      :genres="genres"
      :instruments="instruments"
      :selectedGenres="selectedGenres"
      :selectedInstruments="selectedInstruments"
      @toggleGenre="toggleGenre"
      @toggleInstrument="toggleInstrument"
      @clearFilters="clearFilters"
    />

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header Component -->
      <Header
        v-model:searchQuery="searchQuery"
        @search="searchItems"
        @clearSearch="clearSearch"
      />

      <!-- Sort and Pagination Component -->
      <SortPagination
        :sortBy="sortBy"
        :sortOrder="sortOrder"
        :currentPage="currentPage"
        :totalPages="totalPages"
        :itemsPerPage="itemsPerPage"
        @setSort="setSort"
        @goToPage="goToPage"
        @changeItemsPerPage="changeItemsPerPage"
        @toggleWorker="toggleWorker"
        :workerActive="workerActive"
      />

      <!-- Music Grid Component -->
      <MusicGrid
        :musicSheets="musicSheets"
        @openItem="openItem"
      />

      <!-- Upload Button -->
      <router-link to="/upload">
        <button class="upload-btn-dashboard" @click="prepareNewScore">
          + Upload
        </button>
      </router-link>
    </div>
  </div>
</template>

<script>
import Sidebar from "./Sidebar.vue";
import Header from "./Header.vue";
import SortPagination from "./SortPagination.vue";
import MusicGrid from "./MusicGrid.vue";
import api from "../services/api";

export default {
  components: {
    Sidebar,
    Header,
    SortPagination,
    MusicGrid,
  },
  data() {
    return {
      selectedGenres: [],
      selectedInstruments: [],
      searchQuery: "",
      sortBy: "title",
      sortOrder: "asc",
      currentPage: 1,
      itemsPerPage: 6,
      worker: null,
      workerActive: false,
      genres: ["Rock", "Pop", "Classical"],
      instruments: ["Guitar", "Piano", "Drums"],
      musicSheets: [], // Replace state.musicSheets with local data
      totalItems: 0, // Total number of items for pagination
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
  },
  methods: {
    fetchMusicSheets() {
      // Fetch music sheets with filters, sorting, and pagination
      const params = {
        _page: this.currentPage,
        _limit: this.itemsPerPage,
        _sort: this.sortBy,
        _order: this.sortOrder,
        genres: this.selectedGenres.join(","),
        instruments: this.selectedInstruments.join(","),
        q: this.searchQuery,
      };

      console.log("Fetching music sheets with params:", params);

      api.getFilteredSheets(params)
        .then(response => {
          console.log("Music sheets fetched successfully:", response.data);
          this.musicSheets = response.data;
          this.totalItems = parseInt(response.headers["x-total-count"], 10) || 0;
        })
        .catch(error => {
          console.error("Error fetching music sheets:", error);
        });
    },
    searchItems(query) {
      this.searchQuery = query;
      this.currentPage = 1;
      this.fetchMusicSheets();
    },
    clearSearch() {
      this.searchQuery = "";
      this.selectedGenres = [];
      this.selectedInstruments = [];
      this.currentPage = 1;
      this.fetchMusicSheets();
    },
    toggleGenre(genre) {
      if (this.selectedGenres.includes(genre)) {
        this.selectedGenres = this.selectedGenres.filter((item) => item !== genre);
      } else {
        this.selectedGenres.push(genre);
      }
      this.fetchMusicSheets();
    },
    toggleInstrument(instrument) {
      if (this.selectedInstruments.includes(instrument)) {
        this.selectedInstruments = this.selectedInstruments.filter(
          (item) => item !== instrument
        );
      } else {
        this.selectedInstruments.push(instrument);
      }
      this.fetchMusicSheets();
    },
    clearFilters() {
      this.selectedGenres = [];
      this.selectedInstruments = [];
      this.fetchMusicSheets();
    },
    setSort(sortBy) {
      if (this.sortBy === sortBy) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortBy = sortBy;
        this.sortOrder = "asc";
      }
      this.fetchMusicSheets();
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchMusicSheets();
      }
    },
    changeItemsPerPage(itemsPerPage) {
      this.itemsPerPage = itemsPerPage;
      this.currentPage = 1;
      this.fetchMusicSheets();
    },
    toggleWorker() {
      if (this.workerActive) {
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
          console.log("Worker terminated.");
        }
        this.workerActive = false;
      } else {
        if (window.Worker) {
          console.log("Creating worker...");
          this.worker = new Worker(
            new URL("../workers/generateMusicSheets.worker.js", import.meta.url),
            { type: "module" }
          );

          this.worker.onerror = (e) => {
            console.error("Worker error:", e);
          };

          this.worker.postMessage({ interval: 200,  apiUrl: "http://localhost:5000", });
          this.worker.onmessage = (e) => {
            console.log("Received from worker:", e.data);
            this.fetchMusicSheets(); // Refresh the list after receiving new data
          };
          this.workerActive = true;
        }
        else {
          console.error("Web Workers are not supported in this browser.");
        }
      }
    },
    openItem(item) {
      if (item && item.id) {
        this.$router.push({ name: "ViewSheet", params: { id: item.id } });
      } else {
        console.error("Invalid item passed to openItem:", item);
      }
    }
  },
  created() {
    this.fetchMusicSheets(); // Fetch data when the component is created
  },
  beforeUnmount() {
    if (this.worker) {
      this.worker.terminate();
    }
  }
};
</script>

<style src="../assets/dashboard.css"></style>