<template>
  <div class="sidebar">
    <!-- Profile Section -->
    <div class="profile-section">
       <!-- Sidebar Toggle Button (Visible on Mobile) -->
      <button class="sidebar-toggle" @click="isSidebarOpen = !isSidebarOpen">
        ☰
      </button>
      <img src="../assets/images/profile.png" alt="Profile" class="profile-img" />
      <div class="profile-info">
        <router-link to="/my-account" class="my-account-btn">My Account</router-link>
        <p class="username-display">{{ username }}</p>
      </div>
      <button class="logout-btn" @click="handleLogout">Logout</button>
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
            <p v-if="isLoadingGenres">Loading genres...</p>
            <p v-else-if="genres.length === 0">No genres found</p>
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
            <p v-if="isLoadingInstruments">Loading instruments...</p>
            <p v-else-if="instruments.length === 0">No instruments found</p>
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
import { getCurrentUser, getCurrentUserTags, logout } from "../services/api";

export default {
  components: { MusicSheetsChart },
  props: {
    genres: {
      type: Array,
      required: true,
    },
    instruments: {
      type: Array,
      required: true,
    },
    selectedGenres: {
      type: Array,
      required: true,
    },
    selectedInstruments: {
      type: Array,
      required: true,
    },

    isLoadingGenres: {
      type: Boolean,
      required: true,
    },
    isLoadingInstruments: {
      type: Boolean,
      required: true,
    },

    musicSheets: {
      type: Array,
      default: () => [], // Provide empty array as default
    },
    workerActive: Boolean,
  },
  data() {
    return {
      username: "Loading...",
      isGenreOpen: false,
      isInstrumentsOpen: false,
    };
  },

  async mounted() {
    try {
      const user = await getCurrentUser(); // Fetch the current user
      this.username = user.username || "Guest"; // Set the username or default to "Guest"
    } catch (error) {
      console.error("Error fetching user data:", error);
      this.username = "Guest"; // Fallback to "Guest" in case of error
    }
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
/* Profile Section Styles */
.profile-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}

.profile-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-grow: 1;
}

.my-account-btn {
  background-color: transparent;
  color: #f4effa;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 5px;
  cursor: pointer;
}

.my-account-btn:hover {
  text-decoration: underline;
}

.username-display {
  color: #ffffff;
  font-size: 14px;
  margin: 0;
}

.logout-btn {
  background-color: #532b88;
  color: #f4effa;
  border: none;
  border-radius: 5px 10px 5px 10px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
}

.logout-btn:hover {
  background-color: #6a3dbb;
}

.sidebar {
  flex: 0 0 250px;
  background-color: #9b72cf;
  padding: 20px;
  color: white;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out;
}

.sidebar-collapsed {
  transform: translateX(-100%);
}

.sidebar-toggle {
  display: none;
  background-color: #532b88;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1000;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 999;
    transform: translateX(-100%);
  }

  .sidebar-collapsed {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: block;
  }
}

</style>