<template>
    <div class="sort-pagination-container">
      <div class="sort-label">
        <span>Sort by:</span>
      </div>
      <div class="sort-options">
        <button @click="$emit('setSort', 'title')">
          Name
          <span v-if="sortBy === 'title'">{{ sortOrder === "asc" ? "↑" : "↓" }}</span>
        </button>
        <button @click="$emit('setSort', 'composer')">
          Composer
          <span v-if="sortBy === 'composer'">{{ sortOrder === "asc" ? "↑" : "↓" }}</span>
        </button>
        <button @click="$emit('setSort', 'year')">
          Year
          <span v-if="sortBy === 'year'">{{ sortOrder === "asc" ? "↑" : "↓" }}</span>
        </button>
        
      </div>
  
      <div class="pagination">
        <button data-testid="prev-page" @click="$emit('goToPage', currentPage - 1)" :disabled="currentPage === 1">
          ← Previous
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          :class="{ active: currentPage === page }"
          :data-testid="`page-${page}-btn`"
          @click="$emit('goToPage', page)"
        >
          {{ page }}
        </button>
        <button data-testid="next-page" @click="$emit('goToPage', currentPage + 1)" :disabled="currentPage === totalPages">
          Next →
        </button>
  
        <div class="items-per-page">
          <select
            :value="itemsPerPage"
            @change="$emit('changeItemsPerPage', $event.target.value)"
          >
            <option value="6">6 per page</option>
            <option value="12">12 per page</option>
            <option value="24">24 per page</option>
            <option value="48">48 per page</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      sortBy: String,
      sortOrder: String,
      currentPage: Number,
      totalPages: {
        type: Number, 
        default: 1
      },
      itemsPerPage : {
        default: 6,
      },
    },
  };
  </script>
  
  <style scoped>
  .sort-label {
    font-weight: bold;
    margin-right: 10px; /* Add spacing between the label and the first button */
  }
  </style>