import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  // Use VITE_API_URL or default to the new isolated backend port 5001
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const session = useAuthStore.getState().session;
  
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  
  return config;
});

export default api;
