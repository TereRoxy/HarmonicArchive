<template>
    <div class="sidebar">
      <!-- Profile Section -->
      <div class="profile-section">
        <img src="../assets/images/profile.png" alt="Profile" class="profile-img" />
        <div class="profile-text">
          <p>My Account</p>
          <div class="username-display"><p>username</p></div>
        
          <button class="logout-btn" @click="handleLogout">Logout</button>
        
        </div>
      </div>
  
      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-title">
          <span class="filter-icon">
            <img src="../assets/images/funnel-icon.png" width="25px" height="25px" />
          </span>
          Filter
        </div>
  
        <!-- Genre Filter -->
        <div class="filter-dropdown">
          <div class="filter-header" @click="isGenreOpen = !isGenreOpen">
            <span>Genre</span>
            <span :class="isGenreOpen ? 'arrow-up' : 'arrow-down'">▼</span>
          </div>
          <transition name="slide-fade">
            <div v-if="isGenreOpen" class="filter-chips">
              <div
                v-for="(genre, index) in genres"
                :key="index"
                class="chip"
                @click="$emit('toggleGenre', genre)"
              >
                <span>{{ genre }}</span>
                <button
                  v-if="selectedGenres.includes(genre)"
                  class="remove-chip"
                  @click.stop="$emit('removeGenre', genre)"
                >
                  ×
                </button>
              </div>
            </div>
          </transition>
        </div>
  
        <!-- Instruments Filter -->
        <div class="filter-dropdown">
          <div class="filter-header" @click="isInstrumentsOpen = !isInstrumentsOpen">
            <span>Instruments</span>
            <span :class="isInstrumentsOpen ? 'arrow-up' : 'arrow-down'">▼</span>
          </div>
          <transition name="slide-fade">
            <div v-if="isInstrumentsOpen" class="filter-chips">
              <div
                v-for="(instrument, index) in instruments"
                :key="index"
                class="chip"
                @click="$emit('toggleInstrument', instrument)"
              >
                <span>{{ instrument }}</span>
                <button
                  v-if="selectedInstruments.includes(instrument)"
                  class="remove-chip"
                  @click.stop="$emit('removeInstrument', instrument)"
                >
                  ×
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
  
      <!-- Chart Container -->
      <div class="chart-container">
        <MusicSheetsChart :musicSheets="musicSheets" />
      </div>

        <!-- <button @click="$emit('toggleWorker')" class="worker-btn">
          {{ workerActive ? "Stop Generator" : "Start Generator" }}
        </button> -->

    </div>
  </template>
  
  <script>
  import MusicSheetsChart from "./MusicSheetsChart.vue";
  import { logout } from "../services/api";

  export default {
    components: { MusicSheetsChart },
    props: {
      genres: Array,
      instruments: Array,
      selectedGenres: Array,
      selectedInstruments: Array,
      musicSheets: {
        type: Array,
        default: () => [] // Provide empty array as default
      },
      workerActive: Boolean,
    },
    data() {
      return {
        isGenreOpen: false,
        isInstrumentsOpen: false,
      };
    },

    methods: {
      async handleLogout() {
        try {
          await logout(); // Call the logout API
          localStorage.removeItem("authToken"); // Remove the token from localStorage
          this.$router.push("/"); // Redirect to the login page
        } catch (error) {
          console.error("Logout error:", error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add any specific styles for Sidebar.vue here */
  .profile-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}

.logout-btn {
  background-color: #532b88;
  color: #f4effa;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
}

.logout-btn:hover {
  background-color: #6a3dbb;
}
  
  </style>