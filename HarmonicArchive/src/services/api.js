import axios from 'axios';
import { BASE_URL } from '../../config.js'; // Adjust the import path as necessary 

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper function to get file URLs
export const getFileUrl = (path, fileType = 'music') => {
  if (!path) {
    console.error('Invalid path provided:', path);
    return null;
  }
  return `${BASE_URL}/${path}`;
};

export default {
  // Music Sheets CRUD operations
  getMusicSheets(params = {}) {
    const queryParams = { ...params};
  
    return api.get('/MusicSheets', { params: queryParams });
  },

  getMusicSheet(id) {
    return api.get(`/MusicSheets/${id}`);
  },

  createMusicSheet(sheetData) {
    return api.post('/MusicSheets', sheetData);
  },

  updateMusicSheet(id, updatedData) {
    return api.patch(`/MusicSheets/${id}`, updatedData);
  },

  deleteMusicSheet(id) {
    return api.delete(`/MusicSheets/${id}`);
  },

  // File upload operations
  uploadMusicSheet(formData, onUploadProgress) {
    return api.post('/MusicSheets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
  },

  uploadVideoChunk(chunkData) {
    const { chunk, uploadId, chunkIndex, totalChunks, fileName } = chunkData;
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', chunkIndex);
    formData.append('totalChunks', totalChunks);
    formData.append('fileName', fileName);

    return api.post('/MusicSheets/upload-resumable', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Worker control
  toggleWorker(isRunning) {
    return api.post('/MusicSheets/toggle-worker', null, {
      params: { isRunning }
    });
  },

  // WebSocket setup
  // api.js
  setupWebSocket(onMessage) {
    const ws = new WebSocket(`${BASE_URL.replace('http', 'ws')}/api/MusicSheets/ws`);
  
    ws.onopen = () => console.log('WebSocket connected');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data); // Directly pass the music sheet data
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  
    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = () => console.log('WebSocket disconnected');
  
    return ws;
  }
};