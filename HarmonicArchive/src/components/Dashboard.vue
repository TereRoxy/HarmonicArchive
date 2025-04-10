<template>
  <div class="app-container">
    <!-- Sidebar Component -->
    <Sidebar
      :genres="genres"
      :instruments="instruments"
      :selectedGenres="selectedGenres"
      :selectedInstruments="selectedInstruments"
      :musicSheets="musicSheets"
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
      itemsPerPage: Number.MAX_SAFE_INTEGER, // Default to all items
      worker: null,
      workerActive: false,
      genres: ["Rock", "Pop", "Classical"],
      instruments: ["Guitar", "Piano", "Drums"],
      musicSheets: [], // Replace state.musicSheets with local data
      totalItems: 0, // Total number of items for pagination
      connectionStatus: 'disconnected', // Connection status for WebSocket
      reconnectAttempts: 0,
      maxReconnectAttempts: 5, // Maximum number of reconnection attempts
      lastWebSocketError: null, // Store the last WebSocket message
      isManualDisconnect: false, // Flag to indicate manual disconnection
    };
  },
  computed: {
    totalPages() {
      if (this.itemsPerPage === 'all') {
        return 1; // If all items are displayed, only one page
      }
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
  },
  methods: {
    fetchMusicSheets() {
    const params = {
      _page: this.currentPage,
      _limit: this.itemsPerPage,
      _sort: this.sortBy,
      _order: this.sortOrder,
    };

    // Add search query if exists
    if (this.searchQuery) {
      params.q = this.searchQuery;
    }

    // Add genre filter if any selected
    if (this.selectedGenres.length) {
      params.genres = this.selectedGenres.join(',');
    }

    // Add instrument filter if any selected
    if (this.selectedInstruments.length) {
      params.instruments = this.selectedInstruments.join(',');
    }

    console.log("Fetching with params:", params); // Debug log

    api.getMusicSheets(params)
      .then(response => {
        this.musicSheets = response.data.data;
        this.totalItems = response.data.total;
      })
      .catch(error => {
        console.error("Error fetching music sheets:", error);
      });
  },

    getMusicSheets(params = {}) {
      api.getMusicSheets(params)
        .then(response => {
          this.musicSheets = response.data.data || response.data; // Handle both response formats
          this.totalItems = response.data.total || response.data.length || 0;
        })
        .catch(error => {
          console.error("Error fetching music sheets:", error);
          this.musicSheets = [];
          this.totalItems = 0;
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
      this.currentPage = 1; // Reset to first page when filtering
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
      this.currentPage = 1; // Reset to first page when filtering
      this.fetchMusicSheets();
    },
    clearFilters() {
      this.selectedGenres = [];
      this.selectedInstruments = [];
      this.searchQuery = "";
      this.currentPage = 1; // Reset to first page when clearing filters
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
      const pageNum = Number(page);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= this.totalPages) {
        this.currentPage = pageNum;
        this.fetchMusicSheets({
          _page: this.currentPage,
          _limit: this.itemsPerPage,
          _sort: this.sortBy,
          _order: this.sortOrder,
          genres: this.selectedGenres.join(","),
          instruments: this.selectedInstruments.join(","),
          q: this.searchQuery
        });
      }
    },
    changeItemsPerPage(itemsPerPage) {
      this.itemsPerPage = itemsPerPage === 'all' ? Number.MAX_SAFE_INTEGER : parseInt(itemsPerPage);
      this.currentPage = 1;
      this.fetchMusicSheets();
    },
    toggleWorker() {
      if (this.workerActive) {
        // Stop generator
        this.isManualDisconnect = true;
        if (this.wsConnection) {
          this.wsConnection.send(JSON.stringify({
            type: 'TOGGLE_GENERATION',
            active: false
          }));
          this.wsConnection.close();
        }
        this.workerActive = false;
        this.connectionStatus = 'disconnected';
      } else {
        // Start generator
        this.isManualDisconnect = false;
        this.connectionStatus = 'connecting';
        this.setupWebSocket();
      }
    },

    setupWebSocket() {
      this.wsConnection = api.setupWebSocket((message) => {
        if (message.type === 'NEW_SHEET') {
          //this.musicSheets.unshift(message.data);
          //this.totalItems += 1;
          console.log("New sheet received:", message.data);
          console.log("Total items:", this.totalItems);
        } else if (message.type === 'STATUS_UPDATE') {
          this.handleStatusUpdate(message);
        }
      });

      this.wsConnection.onopen = () => {
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
        this.wsConnection.send(JSON.stringify({
          type: 'TOGGLE_GENERATION',
          active: true,
          interval: 100
        }));
        this.workerActive = true;
      };

      this.wsConnection.onreconnect = () => {
        if (!this.isManualDisconnect) {
          this.connectionStatus = 'connected';
          this.wsConnection.send({
            type: 'TOGGLE_GENERATION',
            active: true,
            interval: 2000
          });
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatus = 'error';
      };

      this.wsConnection.onclose = () => {
        this.connectionStatus = 'disconnected';
        if (!this.isManualDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            this.setupWebSocket();
          }, 1000 * this.reconnectAttempts);
        }
      };

    },

    handleStatusUpdate(message) {
      if (message.status === 'reconnecting') {
        this.connectionStatus = 'reconnecting';
        this.reconnectAttempts = message.attempt;
      }
      // Handle other status updates if needed
    },

    isWebSocketOpen() {
      return this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN;
    },

    openItem(item) {
      if (item && item.id) {
        this.$router.push({ name: "ViewSheet", params: { id: item.id } });
      } else {
        console.error("Invalid item passed to openItem:", item);
      }
    },
    handleScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const bottomPosition = document.documentElement.offsetHeight - 100; // 100px from the bottom

    if (scrollPosition >= bottomPosition && !this.isLoadingMore && this.musicSheets.length < this.totalItems) {
      this.isLoadingMore = true;
      this.currentPage++;
      this.fetchMoreMusicSheets();
    }
  },

  fetchMoreMusicSheets() {
    const params = {
      _page: this.currentPage,
      _limit: this.itemsPerPage,
      _sort: this.sortBy,
      _order: this.sortOrder,
    };

    if (this.searchQuery) {
      params.q = this.searchQuery;
    }
    if (this.selectedGenres.length) {
      params.genres = this.selectedGenres.join(",");
    }
    if (this.selectedInstruments.length) {
      params.instruments = this.selectedInstruments.join(",");
    }

    api.getMusicSheets(params)
      .then(response => {
        this.musicSheets = [...this.musicSheets, ...response.data.data];
        this.totalItems = response.data.total;
        this.isLoadingMore = false;
      })
      .catch(error => {
        console.error("Error fetching more music sheets:", error);
        this.isLoadingMore = false;
      });
  },
  },
  created() {
    this.fetchMusicSheets(); // Fetch data when the component is created

    window.addEventListener("scroll", this.handleScroll)

      // Check initial generation status
    api.getGenerationStatus().then(response => {
      this.workerActive = response.data.isGenerating;
    });
    
    // Initialize WebSocket connection
    this.wsConnection = api.setupWebSocket((message) => {
      if (message.type === 'NEW_SHEET') {
        this.musicSheets.unshift(message.data);
        this.totalItems += 1;
      }
    });
  },
  beforeUnmount() {
    this.isManualDisconnect = true; // Set flag to indicate manual disconnection
    if (this.wsConnection) {
      this.wsConnection.close();
    }
  }
};
</script>

<style src="../assets/dashboard.css"></style>