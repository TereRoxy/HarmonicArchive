<template>
    <div class="header">
      <div class="header-content">
        <div class="archive-title">My Archive</div>
        <div class="search-container">
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            type="text"
            placeholder="Search by Composer or Title"
            class="search-input"
          />
          <button @click="$emit('clearSearch')" class="clear-search-btn">❌</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      searchQuery: String,
    },
  };
  </script>
  
  <style scoped>
  /* Add any specific styles for Header.vue here */
  </style>