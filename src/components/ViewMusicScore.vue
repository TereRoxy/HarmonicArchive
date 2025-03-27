<template>
  <div class="music-score-container" v-if="musicSheet">
    <div class="music-score-section">
      <div class="pdf-viewer" v-if="musicSheet.link">
        <pdf-viewer :source="musicSheet.link" />
      </div>
      <div class="music-score-details">
        <div class="music-score-header">
          <h1 class="music-score-title">
            {{ musicSheet.composer }} - {{ musicSheet.title }}
          </h1>
          <div class="music-score-tags">
            <div class="music-score-genres">
              <span
                v-for="(genre, index) in musicSheet.genres"
                :key="index"
                class="genre-tag"
              >
                {{ genre }}
              </span>
            </div>
            <span class="key-tag">{{ musicSheet.key }}</span>
          </div>
        </div>
        <div class="music-score-year">Year: {{ musicSheet.year }}</div>

        <div class="music-score-actions">
          <button class="action-button download-button">Download</button>
          <button class="action-button collection-button">
            Add to a collection
          </button>
          <button class="action-button modify-button" @click="startEditing">
            {{ isEditing ? "Cancel" : "Modify" }}
          </button>
          <button class="action-button delete-button" @click="deleteMusicSheet">
            Delete
          </button>
        </div>

        <div class="modify-form" v-if="isEditing">
          <form @submit.prevent="saveChanges">
            <div class="form-group">
              <label for="edit-title" class="form-label">Title</label>
              <input
                type="text"
                id="edit-title"
                v-model="editData.title"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="edit-composer" class="form-label">Composer</label>
              <input
                type="text"
                id="edit-composer"
                v-model="editData.composer"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="edit-year" class="form-label">Year</label>
              <input
                type="number"
                id="edit-year"
                v-model.number="editData.year"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="edit-key" class="form-label">Key</label>
              <input
                type="text"
                id="edit-key"
                v-model="editData.key"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="edit-genre" class="form-label"
                >Genre (comma separated)</label
              >
              <input
                type="text"
                id="edit-genre"
                v-model="editData.genre"
                class="form-input"
              />
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="cancelEdit">
                Cancel
              </button>
              <button type="submit" class="save-btn">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PdfViewer from "pdf-viewer-vue";
import { state } from "../sharedstate";

export default {
  components: {
    PdfViewer,
  },
  data() {
    return {
      musicSheet: null,
      isEditing: false,
      editData: {
        title: "",
        composer: "",
        year: null,
        key: "",
        genre: "",
      },
    };
  },
  created() {
    this.musicSheet = state.selectedMusicSheet;
  },
  methods: {
    startEditing() {
      this.isEditing = !this.isEditing;
      if (this.isEditing) {
        this.editData = {
          title: this.musicSheet.title,
          composer: this.musicSheet.composer,
          year: this.musicSheet.year,
          key: this.musicSheet.key,
          genre: this.musicSheet.genres.join(", "),
        };
      }
    },
    cancelEdit() {
      this.isEditing = false;
    },
    saveChanges() {
      const updatedSheet = {
        ...this.musicSheet,
        title: this.editData.title,
        composer: this.editData.composer,
        year: Number(this.editData.year),
        key: this.editData.key,
        genres: this.editData.genre.split(",").map((g) => g.trim()),
      };

      const index = state.musicSheets.findIndex(
        (sheet) => sheet.id === this.musicSheet.id
      );
      if (index !== -1) {
        state.musicSheets.splice(index, 1, updatedSheet);
        state.selectedMusicSheet = updatedSheet;
        this.musicSheet = updatedSheet;
      }

      this.isEditing = false;
      alert("Changes saved successfully!");
    },
    deleteMusicSheet() {
      if (window.confirm("Are you sure you want to delete this music sheet?")) {
        const index = state.musicSheets.findIndex(
          (sheet) => sheet.id === this.musicSheet.id
        );
        if (index !== -1) {
          state.musicSheets.splice(index, 1);
          state.selectedMusicSheet = null;
          this.$router.push("/");
        }
      }
    },
  },
};
</script>

<style src="../assets/music_score_view.css"></style>
