import { api, backendConfigError, getApiErrorMessage } from "./client";
import { BillResult } from "../types";

// 2. Calculate Bill
export const calculateBill = async (kwh: number) => {
  if (backendConfigError) {
    throw new Error(backendConfigError);
  }

  try {
    const response = await api.post<BillResult>("/calculate-bill", { kwh });
    return response.data;
  } catch (err) {
    console.error("Bill Calc Failed:", err);
    throw new Error(`Failed to calculate bill: ${getApiErrorMessage(err)}`);
  }
};
