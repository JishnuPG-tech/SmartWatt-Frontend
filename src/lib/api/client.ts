import axios from 'axios';

// The address of your Python Backend
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
console.log("🔌 API BASE URL:", API_URL);

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
