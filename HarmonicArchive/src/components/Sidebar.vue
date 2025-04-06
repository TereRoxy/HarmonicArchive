<template>
    <div class="sidebar">
      <!-- Profile Section -->
      <div class="profile-section">
        <img src="../assets/images/profile.png" alt="Profile" class="profile-img" />
        <div class="profile-text">
          <p>My Account</p>
          <div class="username-display"><p>username</p></div>
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
    </div>
  </template>
  
  <script>
  import MusicSheetsChart from "./MusicSheetsChart.vue";
  
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
    },
    data() {
      return {
        isGenreOpen: false,
        isInstrumentsOpen: false,
      };
    },
  };
  </script>
  
  <style scoped>
  /* Add any specific styles for Sidebar.vue here */
  </style>