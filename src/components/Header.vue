<template>
    <div class="header">
      <div class="header-content">
        <div class="archive-title">My Archive</div>
        <div class="search-container">
          <input
            v-model="localSearchQuery"
            @keyup.enter="handleSearch"
            placeholder="Search by Composer or Title"
            class="search-input"
          />
          <button @click="clearSearch" class="clear-search-btn">❌</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['searchQuery'],
    data() {
    return {
      localSearchQuery: this.searchQuery
    };
  },
  watch: {
    searchQuery(newVal) {
      this.localSearchQuery = newVal;
    }
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.localSearchQuery);
    },
    clearSearch() {
      this.localSearchQuery = "";
      this.$emit('clearSearch');
    }
  }
  };
  </script>
  
  <style scoped>
  /* Add any specific styles for Header.vue here */
  </style>