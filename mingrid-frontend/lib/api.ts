import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor for Error Formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (Array.isArray(error.response?.data?.message)
        ? error.response?.data?.message[0]
        : 'An unexpected error occurred');

    return Promise.reject(new Error(Array.isArray(message) ? message[0] : message));
  }
);
