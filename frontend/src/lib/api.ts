import axios from 'axios';
import toast from 'react-hot-toast';

// Point this to your Python FastAPI backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Attach the JWT Token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: Refresh Flow & Error Handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized (Refresh token flow)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post(`${API_URL}/auth/refresh`, { token: refreshToken });
        
        localStorage.setItem('token', res.data.token);
        originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
        
        return api(originalRequest); // Retry original request with new token
      } catch (refreshError) {
        // Refresh failed, boot them out
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.reload();
        return Promise.reject(refreshError);
      }
    }

    // Fire Error Toast for 4xx/5xx errors
    if (error.response?.status >= 400) {
      toast.error(error.response?.data?.message || 'Network connection error. Try again.');
    }

    return Promise.reject(error);
  }
);
