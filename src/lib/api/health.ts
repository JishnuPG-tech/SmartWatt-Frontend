import { api } from './client';

// 1. Check if Python is awake
export const checkBackendHealth = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error("Backend Offline:", error);
        return null;
    }
};
