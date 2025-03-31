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
        :musicSheets="filteredItems"
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
import { state } from "../sharedstate";

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
      musicSheets: state.musicSheets,
    };
  },
  computed: {
    filteredItems() {
      // Filtering and sorting logic
      let items = this.musicSheets.filter((item) => {
        const matchesGenre = this.selectedGenres.length
          ? this.selectedGenres.some((genre) => item.genres.includes(genre))
          : true;
        const matchesInstrument = this.selectedInstruments.length
          ? this.selectedInstruments.some((instrument) =>
              item.instruments.includes(instrument)
            )
          : true;
        const matchesSearch = this.searchQuery
          ? item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            item.composer.toLowerCase().includes(this.searchQuery.toLowerCase())
          : true;
        return matchesGenre && matchesInstrument && matchesSearch;
      });

      if (this.sortBy) {
        items = items.sort((a, b) => {
          let result = 0;
          if (a[this.sortBy] < b[this.sortBy]) result = -1;
          else if (a[this.sortBy] > b[this.sortBy]) result = 1;
          return this.sortOrder === "asc" ? result : -result;
        });
      }

      return items.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );
    },
    totalPages() {
      return Math.ceil(this.musicSheets.length / this.itemsPerPage);
    },
  },
  methods: {
    searchItems() {
      this.currentPage = 1;
    },
    clearSearch() {
      this.searchQuery = "";
      this.selectedGenres = [];
      this.selectedInstruments = [];
      this.currentPage = 1;
    },
    toggleGenre(genre) {
      if (this.selectedGenres.includes(genre)) {
        this.selectedGenres = this.selectedGenres.filter((item) => item !== genre);
      } else {
        this.selectedGenres.push(genre);
      }
    },
    toggleInstrument(instrument) {
      if (this.selectedInstruments.includes(instrument)) {
        this.selectedInstruments = this.selectedInstruments.filter(
          (item) => item !== instrument
        );
      } else {
        this.selectedInstruments.push(instrument);
      }
    },
    clearFilters() {
      this.selectedGenres = [];
      this.selectedInstruments = [];
    },
    setSort(sortBy) {
      if (this.sortBy === sortBy) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortBy = sortBy;
        this.sortOrder = "asc";
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    changeItemsPerPage(itemsPerPage) {
      this.itemsPerPage = itemsPerPage;
      this.currentPage = 1;
    },
    toggleWorker() {
      if (this.workerActive) {
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        this.workerActive = false;
      } else {
        if (window.Worker) {
          this.worker = new Worker(
            new URL("../workers/generateMusicSheetsWorker.js", import.meta.url)
          );
          this.worker.postMessage({ interval: 2000 });
          this.worker.onmessage = (e) => {
            if (state.musicSheets) {
              state.musicSheets.push(e.data);
            }
          };
          this.workerActive = true;
        }
      }
    },
    openItem(item) {
      state.selectedMusicSheet = item;
      this.$router.push("/view");
    },
  },
};
</script>

<style src="../assets/dashboard.css"></style>