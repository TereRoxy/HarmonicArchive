import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.100.6:5000/api',
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
  return `http://192.168.100.6:5000/${path}`;
};

export default {
  // Music Sheets CRUD operations
  getMusicSheets(params = {}) {
    return api.get('/MusicSheets', { params });
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
  setupWebSocket(onMessage) {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const baseUrl = '192.168.100.6:5000';

    const connectWebSocket = () => {
        const ws = new WebSocket(`ws://${baseUrl}/ws`);

        ws.onopen = () => {
            console.log('WebSocket connected');
            reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                onMessage(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            if (reconnectAttempts < maxReconnectAttempts) {
                const delay = 1000 * Math.min(reconnectAttempts + 1, 5); // Exponential backoff up to 5s
                reconnectAttempts++;
                console.log(`Attempting reconnect (${reconnectAttempts}/${maxReconnectAttempts}) in ${delay / 1000}s`);
                setTimeout(connectWebSocket, delay);
            } else {
                console.error('Max reconnect attempts reached. WebSocket connection failed.');
            }
        };

        return ws;
      };

      return connectWebSocket(); // Call the function to establish the initial connection
  }
};