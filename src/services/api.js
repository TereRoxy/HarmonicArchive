import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Changed to match server port
  headers: {
    'Content-Type': 'application/json'
  }
});

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
  }
};