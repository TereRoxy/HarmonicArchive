<template>
  <div class="music-grid">
    <div
      v-for="(musicSheet, index) in musicSheets"
      :key="musicSheet.id"
      class="music-item"
      @click="$emit('openItem', musicSheet)"
    >
      <div class="item-info">
        <h3>{{ musicSheet.title.name }}</h3>
        <p><strong>Composer:</strong> {{ musicSheet.composer.name }}</p>
        <p v-if="musicSheet.musicSheetGenres.length > 0">
          <strong>Genres:</strong> 
          {{ musicSheet.musicSheetGenres.map(g => g.genre?.name).join(", ") }}
        </p>
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
</template>

<script>
export default {
  props: {
    musicSheets: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    getYearColor(year) {
      const mean = 1985;
      const stdDev = 20;
      if (year >= mean - stdDev && year <= mean + stdDev) {
        return "yellow";
      } else if (year > mean + stdDev) {
        return "green";
      } else {
        return "red";
      }
    },
  },
};
</script>
  <style scoped>
  /* Add any specific styles for MusicGrid.vue here */
  </style>