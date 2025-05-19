import axios from 'axios';
import { BASE_URL } from '../../config.js'; // Adjust the import path as necessary 

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials for CORS requests
});

// Login API
export const login = async (username, password) => {
  try {
    const response = await api.post("/Users/login", { username, password });
    const token = response.data.token; // Assuming the backend returns a token
    if (token) {
      localStorage.setItem("authToken", token); // Store the token in localStorage
    }
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

// Register API
export const register = async (userData) => {
  try {
    // Ensure the userData matches the expected structure of the User object
    const user = {
      username: userData.username, // Map to the backend's `Username` field
      password: userData.password, // Map to the backend's `Password` field
      email: userData.email,       // Map to the backend's `Email` field
      role: 'normal',
      musicSheets: [],
    };

    const response = await api.post("/Users", user); // Send the properly formatted object
    return response.data;
  } catch (error) {
    console.error("Register error:", error.response?.data || error.message);
    throw error;
  }
};

// Logout API
export const logout = async () => {
  try {
    const response = await api.post("/Users/logout");
    return response.data;
  } catch (error) {
    console.error("Logout error:", error.response?.data || error.message);
    throw error;
  }
};

export const uploadMusicFile = async (formData, onUploadProgress) => {
  try {
    const response = await api.post("/MusicSheets/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });

    if (!response || !response.data) {
      throw new Error("Invalid response from server");
    }

    return response.data; // Ensure this returns the expected data
  } catch (error) {
    console.error("Error uploading file:", error.response?.data || error.message);
    throw error;
  }
};

// Upload the metadata
export const uploadMetadata = async (metadata) => {
  try {
    // Ensure the metadata matches the expected structure of the backend
    const payload = {
      id: metadata.id || 0, // Default to 0 if not provided
      title: metadata.title,
      composer: metadata.composer,
      year: metadata.year || 0, // Default to 0 if not provided
      key: metadata.key || "unknown",
      genres: metadata.genres || [], // Default to an empty array if not provided
      instruments: metadata.instruments || [], // Default to an empty array if not provided
      musicFileUrl: metadata.musicFileUrl,
      userId: metadata.userId
    };

    const response = await api.post("/MusicSheets", payload);
    return response.data;
  } catch (error) {
    console.error("Error uploading metadata:", error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/Users/current");
    return response.data; // Ensure this contains `username`
  } catch (error) {
    console.error("Error fetching current user:", error.response?.data || error.message);
    throw error;
  }
};

export const updateUser = async (id, updatedData) => {
  try {
    console.log("Updating user with ID:", id, "and data:", updatedData);
    const response = await api.put(`/Users/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await api.delete(`/Users/${id}`);
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentUserTags = async () => {
  try {
    const response = await api.get("/MusicSheets/current/tags");
    return response.data;
  } catch (error) {
    console.error("Error fetching tags for current user:", error.response?.data || error.message);
    throw error;
  }
};

// services/api.js
export const getFileUrl = (path, fileType = 'music') => {
  if (!path) {
    console.error('Invalid path provided:', path);
    return null;
  }
  // Ensure path doesn't start with a slash to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}/${cleanPath}`;
};

export default {
  uploadMusicFile,
  uploadMetadata,
  login,
  register,
  logout,
  getCurrentUser,
  updateUser,
  deleteUser,
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
  // uploadMusicSheet(formData, onUploadProgress) {
  //   return api.post('/MusicSheets/upload', formData, {
  //     headers: { 'Content-Type': 'multipart/form-data' },
  //     onUploadProgress
  //   });
  // },

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