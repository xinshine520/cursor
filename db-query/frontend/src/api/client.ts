import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any auth tokens or headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Unified error handling
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data as any;
      
      // Try to extract error message from different possible formats
      let errorMessage = 'An error occurred';
      let errorCode = 'UNKNOWN_ERROR';
      
      if (errorData?.error?.message) {
        // Standard error format: { error: { code: "...", message: "..." } }
        errorMessage = errorData.error.message;
        errorCode = errorData.error.code || 'UNKNOWN_ERROR';
      } else if (errorData?.message) {
        // Alternative format: { message: "..." }
        errorMessage = errorData.message;
      } else if (errorData?.detail) {
        // FastAPI validation error format: { detail: [...] }
        if (Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail.map((err: any) => {
            const field = err.loc ? err.loc.join('.') : 'unknown';
            return `${field}: ${err.msg || 'validation error'}`;
          });
          errorMessage = 'Validation error: ' + validationErrors.join('; ');
        } else if (typeof errorData.detail === 'object' && errorData.detail.error) {
          // Nested error format
          errorMessage = errorData.detail.error.message || errorData.detail.error;
        } else {
          errorMessage = String(errorData.detail);
        }
      } else if (typeof errorData === 'string') {
        // Plain string error
        errorMessage = errorData;
      } else if (error.message) {
        // Fallback to axios error message
        errorMessage = error.message;
      }
      
      // Create a standardized error object
      const standardizedError = new Error(errorMessage);
      (standardizedError as any).code = errorCode;
      (standardizedError as any).status = error.response.status;
      (standardizedError as any).data = error.response.data;
      
      return Promise.reject(standardizedError);
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error('Network error: No response from server'));
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);
