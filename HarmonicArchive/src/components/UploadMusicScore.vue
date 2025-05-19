<template>
  <div class="container">
    <!-- Left Section: Drag and Drop or Choose File -->
    <div class="upload-area">
      <div class="drag-drop-area small" @dragover.prevent @drop.prevent="handleDrop('music')">
        <div class="overlay">
          <input
            ref="musicFileInput"
            id="musicFileInput"
            type="file"
            class="hidden"
            @change="handleFileSelect"
            accept=".pdf"
          />
          <div class="text-center" @click="triggerFileInput('music')">
            <p class="drag-drop-text">
              {{ selectedMusicFile ? selectedMusicFile.name : "Drag and Drop or..." }}
            </p>
            <button class="choose-file-btn">Choose file</button>
          </div>
            <div v-if="uploadProgress > 0" class="progress-bar">
          <div class="progress" :style="{ width: uploadProgress + '%' }"></div>
      </div>
        </div>
      </div>

    </div>

    <!-- Right Section: Form Area -->
    <div class="form-area">
      <h2 class="form-title">Upload a new score</h2>
      <p class="form-subtitle">Grow your Harmonic Archive</p>
      <form @submit.prevent="submitForm">
        <div class="form-fields">
          <div class="form-group">
            <label for="title" class="form-label">Title</label>
            <input
              type="text"
              id="title"
              v-model="formData.title"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="composer" class="form-label">Composer</label>
            <input
              type="text"
              id="composer"
              v-model="formData.composer"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="year" class="form-label">Year</label>
            <input
              type="text"
              id="year"
              v-model="formData.year"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="key" class="form-label">Key</label>
            <input
              type="text"
              id="key"
              v-model="formData.key"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="genres" class="form-label">Genre(s)</label>
            <input
              type="text"
              id="genres"
              v-model="formData.genres"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="instruments" class="form-label">Instruments</label>
            <input
              type="text"
              id="instruments"
              v-model="formData.instruments"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="goBack">
            Cancel
          </button>
          <button type="submit" class="upload-btn">Upload</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from "../services/api"; // Import the API
import axios from "axios";
import { uploadMusicFile } from "../services/api"; // Ensure this matches the path to your api.js file

export default {
  data() {
    return {
      formData: {
        title: "",
        composer: "",
        year: "",
        key: "",
        genres: "",
        instruments: "",
        musicFileUrl: "",
      },
      selectedMusicFile: null,
      uploadProgress: 0,
    };
  },
  methods: {
    handleDrop(type, event) {
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        if (type === "music") {
          this.selectedMusicFile = files[0];
        } else if (type === "video") {
          this.selectedVideoFile = files[0];
        }
      }
    },
    triggerFileInput(type) {
      if (type === "music") {
        this.$refs.musicFileInput.click();
      }
    },

    handleFileSelect(event) {
      if (!event || !event.target || !event.target.files) {
        console.error("Invalid event object:", event);
        return;
      }

      const file = event.target.files[0];
      if (file) {
        this.selectedMusicFile = file;
        this.uploadFile(file); // Automatically upload the file
      }
    },

    async uploadFile(file) {
      const formData = new FormData();
      formData.append("musicFile", file);

      try {
        const response = await uploadMusicFile(formData, (progressEvent) => {
          if (progressEvent.total) {
            this.uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          }
        });

        if (!response || !response.filePath) {
          throw new Error("Invalid response from server");
        }

        console.log("File uploaded successfully:", response.filePath);
        this.formData.musicFileUrl = response.filePath; // Save the file path
        console.log("File path saved in formData:", this.formData.musicFileUrl);
      } catch (error) {
        console.error("Error uploading file:", error.message);
        alert("File upload failed. Please try again.");
      }
    },

    resetForm() {
      this.formData = {
        title: "",
        composer: "",
        year: 0,
        key: "",
        genres: [],
        instruments: [],
        musicFilePath: "",
      };
      this.selectedMusicFile = null;
      this.uploadProgress = 0;
    },
    goBack() {
      this.$router.go(-1);
    },
    formDataValid() {
      const titleRegex = /^[a-zA-Z0-9\s\-_,.]+$/;
      const yearRegex = /^\d{4}$/;
      const keyRegex = /^[a-zA-Z0-9\s\-#]+$/;
      return (
        titleRegex.test(this.formData.title) &&
        titleRegex.test(this.formData.composer) &&
        yearRegex.test(this.formData.year) &&
        keyRegex.test(this.formData.key) &&
        titleRegex.test(this.formData.genres) &&
        titleRegex.test(this.formData.instruments) &&
        this.formData.musicFileUrl // Ensure the file path is set
      );
    },
    async submitForm() {
      if (!this.formDataValid()) {
        console.log("Form data is invalid. Submission aborted.");
        alert("Please fill in all fields correctly.");
        return;
      }

        // Convert genres and instruments strings to arrays
      this.formData.genres = this.formData.genres.split(",").map(item => item.trim());
      this.formData.instruments = this.formData.instruments.split(",").map(item => item.trim());

      const currentUser = await api.getCurrentUser();
      const userId = currentUser.userId;
      this.formData.userId = userId; // Add userId to formData 

      try {
        const response = await api.uploadMetadata(this.formData);
        console.log("Metadata uploaded successfully:", response.data);
        this.resetForm();
        this.goBack();
      } catch (error) {
        console.error("Error uploading metadata:", error);
        alert("Metadata upload failed. Please try again.");
      }
    },
  },
};
</script>

<style src="../assets/upload.css"></style>