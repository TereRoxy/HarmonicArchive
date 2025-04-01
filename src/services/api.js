import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5173/api', // Match your backend port
});

export default {
  // Get all entities
  getSheets() {
    return api.get('/sheets');
  },

  // Add a new entity
  addSheet(sheet) {
    return api.post('/sheets', sheet);
  },

  // Edit an existing entity
  editSheet(sheetId, updatedData) {
    return api.patch(`/sheets/${sheetId}`, updatedData);
  },

  // Remove an entity
  deleteSheet(sheetId) {
    return api.delete(`/sheets/${sheetId}`);
  },

  // Get filtered entities
  getFilteredSheets(filterParams) {
    return api.get('/sheets', { params: filterParams });
  },

  // Get sorted entities
  getSortedSheets(sortBy, order = 'asc') {
    return api.get('/sheets', { params: { _sort: sortBy, _order: order } });
  },
};