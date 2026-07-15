// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';
const RENDER_API_BASE_URL = 'https://cat-prep-tracker-mo52.onrender.com/api';

// Determine the API base URL based on environment
const getAPIBaseURL = () => {
  // In development, use the proxied /api endpoint
  if (isDevelopment) {
    return '/api';
  }

  // In production/GitHub Pages, call the deployed Render backend.
  return RENDER_API_BASE_URL;
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
