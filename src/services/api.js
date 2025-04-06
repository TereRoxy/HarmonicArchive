import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Changed to match server port
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getPdfUrl = (path) => {
  if (!path) {
    console.error('Invalid path provided to getPdfUrl:', path);
    return null;
  }
  return `http://localhost:5000${path}`;
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

  // New methods for generation control
  toggleGeneration(active, interval = 5000) {
    return api.post('/generate', { active, interval });
  },
  
  getGenerationStatus() {
    return api.get('/generate/status');
  },
  
  // WebSocket setup
  setupWebSocket(onMessage) {
    const ws = new WebSocket('ws://localhost:5000');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
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
    };
    
    return {
      send: (data) => ws.send(JSON.stringify(data)),
      close: () => ws.close(),
    };
  }

};