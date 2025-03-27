<template>
  <div class="app-container">
    <!-- Left Sidebar Menu -->
    <div class="sidebar">
      <div class="profile-section">
        <img
          src="../assets/images/profile.png"
          alt="Profile"
          class="profile-img"
        />
        <div class="profile-text">
          <p>My Account</p>
          <div class="username-display"><p>username</p></div>
        </div>
      </div>

      <!-- Filters Section with Collapsible Dropdowns -->
      <div class="filter-section">
        <div class="filter-title">
          <span class="filter-icon">
            <img
              src="../assets/images/funnel-icon.png"
              width="25px"
              height="25px"
            />
          </span>
          Filter
        </div>

        <!-- Genre Filter -->
        <div class="filter-dropdown">
          <div class="filter-header" @click="toggleFilter('genre')">
            <span>Genre</span>
            <span :class="isGenreOpen ? 'arrow-up' : 'arrow-down'">▼</span>
          </div>
          <transition name="slide-fade">
            <div v-if="isGenreOpen" class="filter-chips">
              <div
                v-for="(genre, index) in genres"
                :key="index"
                class="chip"
                @click="toggleGenre(genre)"
              >
                <span>{{ genre }}</span>
                <button
                  v-if="selectedGenres.includes(genre)"
                  class="remove-chip"
                  @click.stop="removeGenre(genre)"
                >
                  ×
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- Instruments Filter -->
        <div class="filter-dropdown">
          <div class="filter-header" @click="toggleFilter('instruments')">
            <span>Instruments</span>
            <span :class="isInstrumentsOpen ? 'arrow-up' : 'arrow-down'"
              >▼</span
            >
          </div>
          <transition name="slide-fade">
            <div v-if="isInstrumentsOpen" class="filter-chips">
              <div
                v-for="(instrument, index) in instruments"
                :key="index"
                class="chip"
                @click="toggleInstrument(instrument)"
              >
                <span>{{ instrument }}</span>
                <button
                  v-if="selectedInstruments.includes(instrument)"
                  class="remove-chip"
                  @click.stop="removeInstrument(instrument)"
                >
                  ×
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Chart View -->
      <div class="chart-container">
        <MusicSheetsChart :musicSheets="musicSheets" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header with search and title -->
      <div class="header">
        <div class="header-content">
          <div class="archive-title">My Archive</div>
          <div class="search-container">
            <input
              v-model="searchQuery"
              @input="searchItems"
              type="text"
              placeholder="Search by Composer or Title"
              class="search-input"
            />
            <button @click="clearSearch" class="clear-search-btn">❌</button>
          </div>
        </div>
      </div>

      <!-- Sort and Pagination Container -->
      <div class="sort-pagination-container">
        <!-- Sort Options -->
        <div class="sort-options">
          <button @click="setSort('title')">
            Sort by Name
            <span v-if="sortBy === 'title'">{{
              sortOrder === "asc" ? "↑" : "↓"
            }}</span>
          </button>
          <button @click="setSort('composer')">
            Sort by Composer
            <span v-if="sortBy === 'composer'">{{
              sortOrder === "asc" ? "↑" : "↓"
            }}</span>
          </button>
          <button @click="setSort('year')">
            Sort by Year
            <span v-if="sortBy === 'year'">{{
              sortOrder === "asc" ? "↑" : "↓"
            }}</span>
          </button>

          <!-- Worker Control Button -->
          <button @click="toggleWorker" class="worker-btn">
            {{ workerActive ? "Stop Generator" : "Start Generator" }}
          </button>
        </div>

        <!-- Pagination Controls -->
        <div class="pagination">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            ← Previous
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            :class="{ active: currentPage === page }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            Next →
          </button>

          <!-- Items per page dropdown -->
          <div class="items-per-page">
            <select v-model="itemsPerPage" @change="currentPage = 1">
              <option value="6">6 per page</option>
              <option value="12">12 per page</option>
              <option value="24">24 per page</option>
              <option value="48">48 per page</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Grid of items -->
      <div class="music-grid">
        <div
          v-for="(musicSheet, index) in filteredItems"
          :key="musicSheet.id"
          class="music-item"
          @click="openItem(musicSheet)"
        >
          <div class="item-info">
            <h3>{{ musicSheet.title }}</h3>
            <p><strong>Composer:</strong> {{ musicSheet.composer }}</p>
            <p><strong>Genres:</strong> {{ musicSheet.genres.join(", ") }}</p>

            <p>
              <span
                class="year-dot"
                :style="{ backgroundColor: getYearColor(musicSheet.year) }"
              ></span>
              <strong>Year:</strong> {{ musicSheet.year }}
            </p>
          </div>
        </div>
      </div>

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
import { computed } from "vue";
import emitter from "../eventBus";
import Upload from "../views/Upload.vue";
import router from "../router";
import ViewMusicScore from "./ViewMusicScore.vue";
import { state } from "../sharedstate";
import MusicSheetsChart from "./MusicSheetsChart.vue";

export default {
  components: {
    ViewMusicScore,
    MusicSheetsChart,
  },
  data() {
    return {
      // Filter State
      selectedGenres: [],
      selectedInstruments: [],
      searchQuery: "",
      isGenreOpen: false,
      isInstrumentsOpen: false,

      sortBy: "title", // Default sort by title
      sortOrder: "asc",
      sortOptions: [
        { text: "Title", value: "title" },
        { text: "Composer", value: "composer" },
        { text: "Year", value: "year" },
      ],

      // Pagination
      currentPage: 1,
      itemsPerPage: 6,

      // Worker control
      worker: null,
      workerActive: false,

      // Filter Options
      genres: ["Rock", "Pop", "Classical"],
      instruments: ["Guitar", "Piano", "Drums"],

      musicSheets: state.musicSheets,
    };
  },
  computed: {
    filteredItems() {
      let items = state.musicSheets.filter((item) => {
        // Filter by genres, instruments, and search query
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
          if (a[this.sortBy] < b[this.sortBy]) {
            result = -1;
          } else if (a[this.sortBy] > b[this.sortBy]) {
            result = 1;
          }
          return this.sortOrder === "asc" ? result : -result;
        });
      }

      return items.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );
    },

    totalPages() {
      return Math.ceil(state.musicSheets.length / this.itemsPerPage);
    },
  },
  methods: {
    searchItems() {
      this.currentPage = 1; // Reset to first page on search
    },

    getYearColor(year) {
      const mean = 1985;
      const stdDev = 20;
      if (year >= mean - stdDev && year <= mean + stdDev) {
        return "yellow"; // Within 1 standard deviation
      } else if (year > mean + stdDev) {
        return "green"; // More recent
      } else {
        return "red"; // Older
      }
    },

    clearSearch() {
      this.searchQuery = "";
      this.selectedGenres = [];
      this.selectedInstruments = [];
      this.isGenreOpen = false;
      this.isInstrumentsOpen = false;
      this.currentPage = 1; // Reset to first page
    },

    toggleFilter(filter) {
      if (filter === "genre") {
        this.isGenreOpen = !this.isGenreOpen;
      } else if (filter === "instruments") {
        this.isInstrumentsOpen = !this.isInstrumentsOpen;
      }
    },

    toggleGenre(genre) {
      if (this.selectedGenres.includes(genre)) {
        this.selectedGenres = this.selectedGenres.filter(
          (item) => item !== genre
        );
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

    removeGenre(genre) {
      this.selectedGenres = this.selectedGenres.filter(
        (item) => item !== genre
      );
    },

    removeInstrument(instrument) {
      this.selectedInstruments = this.selectedInstruments.filter(
        (item) => item !== instrument
      );
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    openItem(item) {
      //emit event to open item
      // Set the selected music sheet in the shared state
      state.selectedMusicSheet = item;
      // Navigate to the ViewMusicScore route
      this.$router.push("/view");
      console.log("Opening item:", item);
      this.$router.push("/view");
    },

    setSort(sortBy) {
      if (this.sortBy === sortBy) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortBy = sortBy;
        this.sortOrder = "asc";
      }
    },

    toggleWorker() {
      if (this.workerActive) {
        // Stop the worker
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        this.workerActive = false;
      } else {
        // Start the worker
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
  },
  mounted() {
    // Initialize worker if needed
    // this.toggleWorker();
  },
  beforeUnmount() {
    // Clean up worker when component is destroyed
    if (this.worker) {
      this.worker.terminate();
    }
  },
};
</script>

<style src="../assets/dashboard.css"></style>
