<template>
  <div class="music-score-container" v-if="musicSheet">
    <div class="music-score-section">
      <!-- <div class="pdf-viewer" v-if="musicSheet.link">
        <pdf-viewer :source="musicSheet.link" />
      </div> > -->
      <!-- <iframe :src="musicSheet.link" frameborder="0" class="pdf-iframe"></iframe> -->
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
import api from "../services/api"; // Import the API

export default {
  components: {
    PdfViewer,
  },
  props: ['id'],
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
  watch: {
  id: {
    immediate: true,
    handler(newId) {
      if (newId) {
        this.fetchMusicSheet();
      }
    },
  },
},
  created() {
    this.fetchMusicSheet();
  },
  methods: {
    async fetchMusicSheet() {
      const id = this.$route.params.id;
      console.log("Fetching music sheet with id:", id); // Debugging
      try {
        const response = await api.getSheet(id); // Use the proper API method
        console.log("Music sheet fetched successfully:", response.data);
        this.musicSheet = response.data;
        console.log("PDF Source:", this.musicSheet.link);
      } catch (error) {
        console.error("Error fetching music sheet:", error);
      }
    },
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
    async saveChanges() {
      const updatedSheet = {
        ...this.musicSheet,
        title: this.editData.title,
        composer: this.editData.composer,
        year: Number(this.editData.year),
        key: this.editData.key,
        genres: this.editData.genre.split(",").map((g) => g.trim()),
      };

      console.log("Saving changes for music sheet:", updatedSheet);

      try {
        await api.editSheet(this.musicSheet.id, updatedSheet); // Update the sheet via API
        console.log("Music sheet updated successfully.");
        this.musicSheet = updatedSheet; // Update the local data
        this.isEditing = false;
        alert("Changes saved successfully!");
      } catch (error) {
        console.error("Error saving changes:", error);
      }
    },
    async deleteMusicSheet() {
      if (window.confirm("Are you sure you want to delete this music sheet?")) {
        try {
          await api.deleteSheet(this.musicSheet.id); // Delete the sheet via API
          console.log("Music sheet deleted successfully.");
          this.$router.push("/"); // Navigate back to the home page
        } catch (error) {
          console.error("Error deleting music sheet:", error);
        }
      }
    },
  },
};
</script>

<style src="../assets/music_score_view.css"></style>