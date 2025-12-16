import axios from 'axios';
import { ApplianceUsageDetails, BillResult, AppliancePrediction } from './types';

// The address of your Python Backend
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
console.log("🔌 API BASE URL:", API_URL);

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- API FUNCTIONS (THE MESSENGERS) ---
// This file is the bridge between the "Beautiful Frontend" and the "Smart Backend".
// The frontend asks questions, and this file carries them to Python to get answers.
// It also has safety helmets (Try/Catch) to prevent crashes if the bridge is down.

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

// 2. Calculate Bill
export const calculateBill = async (kwh: number) => {
    try {
        const response = await api.post<BillResult>('/calculate-bill', { kwh });
        return response.data;
    } catch (err) {
        console.error("Bill Calc Failed:", err);
        return { total: 0, monthly: 0, slab: 'Error' }; // Safe Default
    }
};

// 3. Predict Appliance Usage (The AI Call)
export const predictAppliance = async (
    name: string,
    details: ApplianceUsageDetails,
    totalBill: number
) => {
    try {
        const response = await api.post<AppliancePrediction>('/predict-appliance', {
            appliance_name: name,
            details: details,
            total_bill: totalBill
        });
        return response.data;
    } catch (err) {
        console.error(`Prediction Failed for ${name}:`, err);
        return { status: 'error', prediction: 0 }; // Safe Default
    }
};

// 4. Simulate Savings (AI Optimization)
export const simulateSavings = async (
    details: ApplianceUsageDetails,
    totalBill: number
) => {
    try {
        const response = await api.post('/simulate-savings', {
            details: details,
            total_bill: totalBill
        });
        return response.data;
    } catch (err) {
        console.error("Optimization Failed:", err);
        return { status: 'error', insights: [] };
    }
};

// 5. Batch Predict (The "Bus" Strategy)
// Sending 10 separate cars (requests) is slow and causes traffic.
// Instead, we put all 10 requests on one bus (Batch Request). 
// One trip, all answers. Much faster!
const predictionCache = new Map<string, Record<string, AppliancePrediction>>();

export const predictAllAppliances = async (
    requests: Array<{ appliance_name: string; details: ApplianceUsageDetails; total_bill: number }>
) => {
    try {
        // GENERATE CACHE KEY (The "Memory" Trick)
        // If you ask the exact same question twice, why calculate it again?
        // We remember the answer. If the inputs haven't changed, we give you the saved answer instantly.
        // This makes the UI feel "Instant".
        const cacheKey = JSON.stringify(requests);

        if (predictionCache.has(cacheKey)) {
            // console.log("Using Cached Prediction ⚡");
            return predictionCache.get(cacheKey)!;
        }

        const response = await api.post<Record<string, AppliancePrediction>>('/predict-all', {
            requests: requests
        });

        // Save to cache for next time
        predictionCache.set(cacheKey, response.data);
        return response.data;
    } catch (err) {
        console.error("Batch Prediction Failed:", err);
        return {}; // Return empty object to prevent crash
    }
};