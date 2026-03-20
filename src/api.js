import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically to every request
API.interceptors.request.use((config) => {
  try {
    const saved = localStorage.getItem('user');
    if (saved) {
      const { token } = JSON.parse(saved);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore malformed storage
  }
  return config;
});

export default API;
