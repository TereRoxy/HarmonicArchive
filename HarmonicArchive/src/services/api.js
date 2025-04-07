import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.100.2:5000/api', // Changed to match server port
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getPdfUrl = (path) => {
  if (!path) {
    console.error('Invalid path provided to getPdfUrl:', path);
    return null;
  }
  return `http://192.168.100.2:5000${path}`;
};

export default {
  // Get all sheets with optional filtering
  getSheets(params = {}) {
    return api.get('/sheets', { params });
  },

  // Get single sheet
  getSheet(id) {
    return api.get(`/sheets/${id}`);
  },

  // Add a new sheet
  addSheet(sheet) {
    return api.post('/sheets', sheet);
  },

  // Edit an existing sheet
  editSheet(id, updatedData) {
    return api.patch(`/sheets/${id}`, updatedData);
  },

  // Remove a sheet
  deleteSheet(id) {
    return api.delete(`/sheets/${id}`);
  },

  // Get filtered sheets (same as getSheets with params)
  getFilteredSheets(filterParams) {
    return this.getSheets(filterParams);
  },

  getMusicSheets:(params) => {
    return api.get('/music-sheets', { params });
  },

  uploadWithProgress(formData, onUploadProgress) {
    return api.post("/sheets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
  },

  // Add these methods to your api.js
  uploadVideo: {
    start: (fileData) => api.post('/upload/video/start', fileData),
    chunk: (fileId, chunk, chunkIndex, totalChunks, onProgress) => {
      const formData = new FormData();
      formData.append('fileId', fileId);
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', totalChunks);
      formData.append('chunk', chunk);
      
      return api.post('/upload/video/chunk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress
      });
    },
    complete: (fileId, fileName) => 
      api.post('/upload/video/complete', { fileId, fileName })
  },

  // New methods for generation control
  toggleGeneration(active, interval = 5000) {
    return api.post('/generate', { active, interval });
  },
  
  getGenerationStatus() {
    return api.get('/generate/status');
  },
  // Auto-reconnect logic
  attemptReconnect(connection, onMessage, maxAttempts = 5, interval = 3000) {
    let attempts = 0;
    
    const reconnect = () => {
      if (attempts >= maxAttempts) {
        console.error('Max reconnection attempts reached');
        return;
      }

      attempts++;
      console.log(`Reconnecting attempt ${attempts}/${maxAttempts}...`);

      const newWs = new WebSocket('ws://192.168.100.6:5000');
      
      newWs.onopen = () => {
        console.log('Reconnected successfully');
        connection.ws = newWs;
        connection.readyState = WebSocket.OPEN;
        connection.onreconnect?.();
        clearInterval(reconnectInterval);
      };

      newWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          onMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    };

    const reconnectInterval = setInterval(reconnect, interval);
    connection.onreconnect = () => {
      clearInterval(reconnectInterval);
    };

    // Initial reconnect attempt
    reconnect();
  },
  
  // api.js - WebSocket enhancements
  setupWebSocket(onMessage) {

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const ws = new WebSocket('ws://192.168.100.6:5000');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts = 0; // Reset attempts on successful connection
    };
  
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      onMessage(message);
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        setTimeout(() => {
          setupWebSocket(onMessage); // Retry connection
        }, 1000 * reconnectAttempts);
      } else {
        console.error('Max reconnection attempts reached');
      }
    };
  
    return ws;
  },
};