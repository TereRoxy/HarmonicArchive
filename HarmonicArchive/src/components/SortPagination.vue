<template>
  <div class="sort-pagination-container">
    <div class="sort-label">
      <span>Sort by:</span>
    </div>
    <div class="sort-options">
      <button @click="$emit('setSort', 'title')">
        Name
        <span v-if="sortBy === 'title'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
      </button>
      <button @click="$emit('setSort', 'composer')">
        Composer
        <span v-if="sortBy === 'composer'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
      </button>
      <button @click="$emit('setSort', 'year')">
        Year
        <span v-if="sortBy === 'year'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
      </button>
    </div>

    <div class="pagination">
      <button
        data-testid="prev-page"
        @click="$emit('goToPage', currentPage - 1)"
        :disabled="currentPage === 1"
      >
        ← Previous
      </button>

      <!-- First page -->
      <button
        @click="$emit('goToPage', 1)"
        :class="{ active: currentPage === 1 }"
        data-testid="page-1-btn"
      >
        1
      </button>

      <!-- Ellipsis before sliding window -->
      <span v-if="pagesToShow[0] > 2">...</span>

      <!-- Sliding window pages -->
      <button
        v-for="page in pagesToShow"
        :key="page"
        :class="{ active: currentPage === page }"
        :data-testid="`page-${page}-btn`"
        @click="$emit('goToPage', page)"
      >
        {{ page }}
      </button>

      <!-- Ellipsis after sliding window -->
      <span v-if="pagesToShow[pagesToShow.length - 1] < totalPages - 1">...</span>

      <!-- Last page -->
      <button
        v-if="totalPages > 1"
        @click="$emit('goToPage', totalPages)"
        :class="{ active: currentPage === totalPages }"
        :data-testid="`page-${totalPages}-btn`"
      >
        {{ totalPages }}
      </button>

      <button
        data-testid="next-page"
        @click="$emit('goToPage', currentPage + 1)"
        :disabled="currentPage === totalPages"
      >
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
      default: 1,
    },
    itemsPerPage: {
      default: 6,
    },
  },
  computed: {
    pagesToShow() {
      if (this.totalPages <= 1) {
        return [];
      }

      const windowSize = 3; // Show 3 pages in the sliding window
      const halfWindow = Math.floor(windowSize / 2);
      let start = Math.max(2, this.currentPage - halfWindow);
      let end = Math.min(this.totalPages - 1, this.currentPage + halfWindow);

      // Adjust window near start or end
      if (this.currentPage <= halfWindow + 1) {
        end = Math.min(this.totalPages - 1, windowSize + 1);
      } else if (this.currentPage + halfWindow >= this.totalPages) {
        start = Math.max(2, this.totalPages - windowSize);
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
};
</script>

<style scoped>
.sort-pagination-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}

.sort-label {
  font-weight: bold;
}

.sort-options {
  display: flex;
}

.sort-options button {
  background-color: #532b88;
  color: #ffffff;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
}

.sort-options button:hover {
  background-color: #6a3dbb;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.pagination button {
  color: #34495e;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
}

.pagination button:hover:not(:disabled) {
  background-color: #c8b1e4;
}

.pagination button:disabled {
  color: #34495e;
  cursor: not-allowed;
}

.pagination button.active {
  background-color: #532b88;
  font-weight: bold;
  border: 1px solid #f4effa;
}

.pagination span {
  color: #ffffff;
  margin: 0 5px;
}

.items-per-page select {
  background-color: #c8b1e4;
  color: #34495e;
  border: none;
  padding: 6px;
  cursor: pointer;
}

.items-per-page select:focus {
  outline: none;
  background-color: #c8b1e4;
}

/* Responsive */
@media (max-width: 768px) {
  .sort-pagination-container {
    flex-direction: column;
    align-items: flex-start;
  }
  .sort-options {
    flex-wrap: wrap;
  }
  .pagination {
    justify-content: center;
  }
}
</style>