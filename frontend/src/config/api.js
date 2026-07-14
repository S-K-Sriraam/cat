// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';

// Determine the API base URL based on environment
const getAPIBaseURL = () => {
  // Check if running on GitHub Pages
  if (window.location.hostname.endsWith('github.io')) {
    return 'https://cat-prep-tracker.onrender.com/api';
  }
  
  // In development, use the proxied /api endpoint
  if (isDevelopment) {
    return '/api';
  }
  
  // In production, use relative API path
  return '/api';
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
