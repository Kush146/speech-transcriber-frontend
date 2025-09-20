import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'     // local dev
    : 'https://speech-transcriber-backend.onrender.com'); // fallback

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: false,
});
