import axios from 'axios';

const token = localStorage.getItem('token'); // or use a context for auth

const instance = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// Attach token if exists
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => Promise.reject(error));

export default instance;
