<template>
  <div class="music-score-container" v-if="musicSheet">
    <div class="music-score-section">
      <div class="music-score-player">
        <PdfViewer
          :src="musicSheet.musicFileUrl"
          :width="600"
          :height="800"
          :show-download-button="false"
          :show-print-button="false"
        />
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
          <button class="action-button modify-button" @click="startEditing">
            {{ isEditing ? "Cancel" : "Modify" }}
          </button>
          <button class="action-button delete-button" @click="deleteMusicSheet">
            Delete
          </button>
          <button class="action-button download-button" @click="downloadFiles">Download</button>
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
  <div v-else-if="loading" class="loading-message">
    Loading music sheet...
  </div>
  <div v-else class="error-message">
    Music sheet not found
  </div>
</template>

<script>
import PdfViewer from "pdf-viewer-vue";
import api from "../services/api"; // Import the API

export default {
  components: {
    PdfViewer,
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  watch: {
    id: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchMusicSheet();
        }
      }
    }
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
  watch: {
    id(newId) {
      if (newId) {
        this.fetchMusicSheet();
      }
    }
},
  created() {
    this.fetchMusicSheet();
  },
  methods: {
    async fetchMusicSheet() {
      this.loading = true;
      try {
        const response = await api.getMusicSheet(this.id);
        this.musicSheet = this.transformMusicSheetData(response.data);
        this.loading = false;
      } catch (error) {
        console.error("Error fetching music sheet:", error);
        this.loading = false;
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
      try {
        const updatedData = {
          title: this.editData.title,
          composer: this.editData.composer,
          year: this.editData.year,
          key: this.editData.key,
          genres: this.editData.genre.split(",").map((g) => g.trim()), // Convert comma-separated genres to an array
          instruments: this.musicSheet.instruments, // Keep instruments unchanged for now
          musicFileUrl: this.musicSheet.musicFileUrl, // Ensure this is set
        };

        if (!updatedData.musicFileUrl) {
          throw new Error("Music file URL is required.");
        }

        await api.updateMusicSheet(this.musicSheet.id, updatedData);
        console.log("Music sheet updated successfully.");

        // Update the `musicSheet` object with the new values
        this.musicSheet = {
          ...this.musicSheet,
          ...updatedData,
        };

        this.isEditing = false; // Exit editing mode
      } catch (error) {
        console.error("Error saving changes:", error);
      }
    },
    async deleteMusicSheet() {
      if (window.confirm("Are you sure you want to delete this music sheet?")) {
        try {
          await api.deleteMusicSheet(this.musicSheet.id); // Delete the sheet via API
          console.log("Music sheet deleted successfully.");
          this.$router.push("/"); // Navigate back to the home page
        } catch (error) {
          console.error("Error deleting music sheet:", error);
        }
      }
    },
    transformMusicSheetData(data) {
      // Transform the API response to match your component's expected structure
      return {
        id: data.id,
        title: data.title?.name || data.title || '',
        composer: data.composer?.name || data.composer || '',
        year: data.year,
        key: data.key,
        genres: data.genres || data.musicSheetGenres?.map(g => g.genre?.name) || [],
        instruments: data.instruments || data.musicSheetInstruments || [],
        musicFileUrl: data.musicFileUrl || data.musicFilePath || data.musicFilePath?.filePath || '', // Adjust based on your API response
      };
    },

    async downloadFiles() {
      try {
        // Download the PDF file
        if (this.musicSheet.musicFileUrl) {
          await this.downloadFile(this.musicSheet.musicFileUrl, `${this.musicSheet.title}.pdf`);
        }

        alert("Files downloaded successfully!");
      } catch (error) {
        console.error("Error downloading files:", error);
        alert("An error occurred while downloading the files.");
      }
    },

    async downloadFile(url, filename) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${url}`);
        }

        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    },
  },
};
</script>

<style src="../assets/music_score_view.css"></style>