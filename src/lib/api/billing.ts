import { api } from './client';
import { BillResult } from '../types';

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
