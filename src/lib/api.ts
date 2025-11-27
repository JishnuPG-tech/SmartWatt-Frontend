import axios from 'axios';

// The address of your Python Backend
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Define Types (So React knows what data to expect)
export interface BillResult {
    total: number;
    monthly: number;
    slab: string;
}

export interface AppliancePrediction {
    status: string;
    prediction: number;
}

// --- API FUNCTIONS ---

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
    const response = await api.post<BillResult>('/calculate-bill', { kwh });
    return response.data;
};

// 3. Predict Appliance Usage (The AI Call)
export const predictAppliance = async (
    name: string,
    details: Record<string, any>,
    totalBill: number
) => {
    const response = await api.post<AppliancePrediction>('/predict-appliance', {
        appliance_name: name,
        details: details,
        total_bill: totalBill
    });
    return response.data;
};