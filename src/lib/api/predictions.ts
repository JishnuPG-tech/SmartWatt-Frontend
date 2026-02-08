import { api } from './client';
import { ApplianceUsageDetails, AppliancePrediction } from '../types';
import { transformApplianceData } from '../transformFields';

// 3. Predict Appliance Usage (The AI Call)
export const predictAppliance = async (
    name: string,
    details: ApplianceUsageDetails,
    totalBill: number
) => {
    try {
        // Transform UI field names/values to backend format
        const transformedDetails = transformApplianceData(name, details);
        
        const response = await api.post<AppliancePrediction>('/predict-appliance', {
            appliance_name: name,
            details: transformedDetails,
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
        // Transform details for each appliance in the simulation
        const transformedDetails: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(details)) {
            if (typeof value === 'object' && value !== null) {
                transformedDetails[key] = transformApplianceData(key, value as Record<string, unknown>);
            } else {
                transformedDetails[key] = value;
            }
        }
        
        const response = await api.post('/simulate-savings', {
            details: transformedDetails,
            total_bill: totalBill
        });
        return response.data;
    } catch (err) {
        console.error("Optimization Failed:", err);
        return { status: 'error', insights: [] };
    }
};

// 5. Batch Predict (The "Bus" Strategy)
const predictionCache = new Map<string, Record<string, AppliancePrediction>>();

export const predictAllAppliances = async (
    requests: Array<{ appliance_name: string; details: ApplianceUsageDetails; total_bill: number }>
) => {
    try {
        // Transform all request details
        const transformedRequests = requests.map(req => ({
            appliance_name: req.appliance_name,
            details: transformApplianceData(req.appliance_name, req.details),
            total_bill: req.total_bill
        }));
        
        const cacheKey = JSON.stringify(transformedRequests);

        if (predictionCache.has(cacheKey)) {
            return predictionCache.get(cacheKey)!;
        }

        const response = await api.post<Record<string, AppliancePrediction>>('/predict-all', {
            requests: transformedRequests
        });

        // Save to cache for next time
        predictionCache.set(cacheKey, response.data);
        return response.data;
    } catch (err) {
        console.error("Batch Prediction Failed:", err);
        return {}; // Return empty object to prevent crash
    }
};
