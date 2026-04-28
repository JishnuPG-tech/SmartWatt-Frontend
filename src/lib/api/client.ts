import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const backendConfigError = API_URL
  ? null
  : "Backend URL is missing. Set NEXT_PUBLIC_BACKEND_URL before building the app.";

if (backendConfigError) {
  console.error(backendConfigError);
}

console.log("🔌 API BASE URL:", API_URL);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data as
      | { detail?: string; message?: string }
      | string
      | undefined;
    const detail =
      typeof responseData === "string"
        ? responseData
        : responseData?.detail || responseData?.message;

    if (status && detail) return `HTTP ${status}: ${detail}`;
    if (status) return `HTTP ${status}`;
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return "Unknown network error";
};
