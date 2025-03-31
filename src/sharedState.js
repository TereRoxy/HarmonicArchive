// sharedState.js
import { reactive } from "vue";

export const state = reactive({
  musicSheets: [
  ],
  selectedMusicSheet: null, // Store the currently selected music sheet
});
