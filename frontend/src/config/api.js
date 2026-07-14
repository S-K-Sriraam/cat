// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';

// Determine the API base URL based on environment
const getAPIBaseURL = () => {
  // In development, use the proxied /api endpoint
  if (isDevelopment) {
    return '/api';
  }
  
  // In production (local), use localhost backend
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getAPIBaseURL();
export const API_TIMEOUT = 30000; // 30 seconds

export const AUTH_TOKEN_KEY = 'cat_token';
export const AUTH_USER_KEY = 'cat_user';

export default {
  API_BASE_URL,
  API_TIMEOUT,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
};
