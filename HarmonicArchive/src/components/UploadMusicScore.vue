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
            @change="handleFileSelect('music', $event)"
            accept=".pdf, .jpg, .jpeg, .png, .gif"
          />
          <div class="text-center" @click="triggerFileInput('music')">
            <p class="drag-drop-text">
              {{ selectedMusicFile ? selectedMusicFile.name : "Drag and Drop or..." }}
            </p>
            <button class="choose-file-btn">Choose file</button>
          </div>
        </div>
      </div>

      <!-- Video File Drag and Drop -->
      <div class="drag-drop-area small" @dragover.prevent @drop.prevent="handleDrop('video')">
        <div class="overlay">
          <input
            ref="videoFileInput"
            id="videoFileInput"
            accept=".mp4, .avi, .mov, .wmv"
            type="file"
            class="hidden"
            @change="handleFileSelect('video', $event)"
          />
          <div class="text-center" @click="triggerFileInput('video')">
            <p class="drag-drop-text">
              {{ selectedVideoFile ? selectedVideoFile.name : "Drag and Drop Video File or..." }}
            </p>
            <button class="choose-file-btn">Choose Video File</button>
          </div>
          
          <div v-if="videoUploadStatus !== 'idle'" class="video-upload-status">
            <div class="status-message">
              {{ 
                videoUploadStatus === 'preparing' ? 'Preparing...' :
                videoUploadStatus === 'uploading' ? 'Uploading...' :
                videoUploadStatus === 'completed' ? 'Upload complete!' :
                videoUploadStatus === 'error' ? 'Upload failed' : ''
              }}
            </div>
            
            <div v-if="videoUploadStatus === 'uploading'" class="progress-container">
              <div class="progress-bar">
                <div class="progress" :style="{ width: videoUploadProgress + '%' }"></div>
              </div>
              <div class="progress-text">{{ videoUploadProgress }}%</div>
              
              <div v-if="videoChunkProgress.length > 1" class="chunk-progress">
                <div 
                  v-for="(progress, index) in videoChunkProgress" 
                  :key="index" 
                  class="chunk-progress-bar"
                  :style="{ width: (100 / videoChunkProgress.length) + '%', height: '4px', background: progress === 100 ? '#4CAF50' : progress > 0 ? '#2196F3' : '#e0e0e0' }"
                  :title="`Chunk ${index + 1}: ${progress}%`"
                ></div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- Right Section: Form Area -->
    <div class="form-area">
      <h2 class="form-title">Upload a new score</h2>
      <p class="form-subtitle">Contribute to the community</p>
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
      },
      selectedMusicFile: null,
      selectedVideoFile: null,
      uploadProgress: 0,
      videoUploadProgress: 0,
      videoChunkProgress: [],
      videoUploadStatus: 'idle',
      videoFileId: null,
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
      } else if (type === "video") {
        this.$refs.videoFileInput.click();
      }
    },

    async handleFileSelect(type, event) {
      const file = event.target.files[0];
      if (file) {
        if (type === "music") {
          this.selectedMusicFile = file;
        } else if (type === "video") {
          this.selectedVideoFile = file;
          this.videoUploadStatus = 'preparing';
          await this.prepareVideoUpload(file);
        }
      }
    },

    async prepareVideoUpload(file) {
      try {
        // Start the upload session
        const response = await api.uploadVideo.start({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });
        
        this.videoFileId = response.data.fileId;
        this.videoChunkProgress = Array(Math.ceil(file.size / response.data.chunkSize)).fill(0);
        this.videoUploadStatus = 'uploading';
        
        // Upload chunks
        await this.uploadVideoChunks(file, response.data.chunkSize);
        
        // Complete the upload
        const completeResponse = await api.uploadVideo.complete(
          this.videoFileId,
          file.name,
          file.type
        );
        
        this.videoUploadStatus = 'completed';
        this.selectedVideoFile.serverFileName = completeResponse.data.fileName;
      } catch (error) {
        console.error('Video upload error:', error);
        this.videoUploadStatus = 'error';
      }
    },
    
    async uploadVideoChunks(file, chunkSize) {
      const totalChunks = Math.ceil(file.size / chunkSize);
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunk = file.slice(start, end);
        
        try {
          await api.uploadVideo.chunk(
            this.videoFileId,
            chunk,
            i,
            (progressEvent) => {
              const chunkProgress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              
              // Update progress for this chunk
              this.videoChunkProgress[i] = chunkProgress;
              this.videoChunkProgress = [...this.videoChunkProgress];
              
              // Calculate overall progress
              const totalProgress = this.videoChunkProgress.reduce(
                (sum, progress) => sum + progress, 0
              ) / totalChunks;
              
              this.videoUploadProgress = Math.round(totalProgress);
            }
          );
        } catch (error) {
          console.error(`Error uploading chunk ${i}:`, error);
          throw error;
        }
      }
    },

    resetForm() {
      this.formData = {
        title: "",
        composer: "",
        year: "",
        key: "",
        genres: "",
        instruments: "",
      };
      this.selectedMusicFile = null;
      this.selectedVideoFile = null;
      this.uploadProgress = 0;
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
        titleRegex.test(this.formData.genres) &&
        titleRegex.test(this.formData.instruments) &&
        this.selectedMusicFile // Ensure a file is selected
      );
    },
    async submitForm() {
      if (!this.formDataValid()) {
        console.log("Form data is invalid. Submission aborted.");
        alert("Please fill in all fields correctly and select a file.");
        return;
      }

      const formData = new FormData();
      formData.append("title", this.formData.title);
      formData.append("composer", this.formData.composer);
      formData.append("year", this.formData.year);
      formData.append("key", this.formData.key);
      formData.append("genres", this.formData.genres);
      formData.append("instruments", this.formData.instruments);
      formData.append("musicFile", this.selectedMusicFile);

      // Add video file if uploaded
      if (this.selectedVideoFile?.serverFileName) {
        formData.append("videoFile", this.selectedVideoFile.serverFileName);
      }

      try {
        const response = await api.uploadMusicSheet(formData, (progressEvent) => {
          if (progressEvent.total) {
            this.uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          }
        });

        console.log("Upload successful:", response.data);
        this.resetForm();
        this.goBack();
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    },

    async uploadVideoChunks(file, chunkSize) {
      const totalChunks = Math.ceil(file.size / chunkSize);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunk = file.slice(start, end);

        try {
          await api.uploadVideoChunk({
            chunk,
            uploadId: this.videoFileId,
            chunkIndex: i,
            totalChunks,
            fileName: file.name,
          });
          const chunkProgress = 100;

          // Update progress for this chunk
          this.videoChunkProgress[i] = chunkProgress;
          this.videoChunkProgress = [...this.videoChunkProgress];

          // Calculate overall progress
          const totalProgress = this.videoChunkProgress.reduce(
            (sum, progress) => sum + progress,
            0
          ) / totalChunks;

          this.videoUploadProgress = Math.round(totalProgress);
        } catch (error) {
          console.error(`Error uploading chunk ${i}:`, error);
          throw error;
        }
      }
    }
  },
};
</script>

<style src="../assets/upload.css"></style>