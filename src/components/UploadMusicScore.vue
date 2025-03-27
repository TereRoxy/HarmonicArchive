<template>
  <div class="container">
    <!-- Left Section: Drag and Drop or Choose File -->
    <div class="upload-area">
      <div class="drag-drop-area" @dragover.prevent @drop.prevent="handleDrop">
        <div class="overlay">
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            @change="handleFileSelect"
          />
          <div class="text-center" @click="triggerFileInput">
            <p class="drag-drop-text">
              {{ selectedFile ? selectedFile.name : "Drag and Drop or..." }}
            </p>
            <button class="choose-file-btn">Choose file</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Section: Form Area -->
    <div class="form-area">
      <h2 class="form-title">Upload a new score</h2>
      <p class="form-subtitle">Contribute to the community</p>
      <form @submit.prevent="handleSubmit">
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
            <label for="genre" class="form-label">Genre</label>
            <input
              type="text"
              id="genre"
              v-model="formData.genre"
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
import { state } from "../sharedstate";

export default {
  data() {
    return {
      formData: {
        title: "",
        composer: "",
        year: "",
        key: "",
        genre: "",
        instruments: "",
      },
      selectedFile: null,
    };
  },
  methods: {
    handleDrop(event) {
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.selectedFile = files[0];
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
      }
    },
    resetForm() {
      this.formData = {
        title: "",
        composer: "",
        year: "",
        key: "",
        genre: "",
        instruments: "",
      };
      this.selectedFile = null;
    },
    goBack() {
      this.$router.go(-1);
    },
    formDataValid() {
      // Check if all form fields are filled
      const titleRegex = /^[a-zA-Z0-9\s\-_,.]+$/;
      const yearRegex = /^\d{4}$/;
      const keyRegex = /^[a-zA-Z0-9\s\-#]+$/;
      return (
        titleRegex.test(this.formData.title) &&
        titleRegex.test(this.formData.composer) &&
        yearRegex.test(this.formData.year) &&
        keyRegex.test(this.formData.key) &&
        titleRegex.test(this.formData.genre) &&
        titleRegex.test(this.formData.instruments)
      );
    },
    handleSubmit() {
      if (!this.formDataValid()) {
        alert("Please fill in all fields with valid characters");
        return;
      }
      if (!this.selectedFile) {
        alert("Please select a file to upload");
        return;
      }

      // Add to the shared state
      state.musicSheets.push({
        id: state.musicSheets.length + 1,
        title: this.formData.title,
        composer: this.formData.composer,
        year: this.formData.year,
        key: this.formData.key,
        genres: this.formData.genre.split(",").map((genre) => genre.trim()),
        instruments: this.formData.instruments
          .split(",")
          .map((instrument) => instrument.trim()),
        file: URL.createObjectURL(this.selectedFile), // Convert to URL
      });

      console.log(state.musicSheets);

      alert("File uploaded successfully!");
      this.goBack();
    },
  },
};
</script>

<style src="../assets/upload.css"></style>
