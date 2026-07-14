import { API_BASE_URL, API_TIMEOUT, AUTH_TOKEN_KEY } from '../config/api.js';
import { apiLogger } from '../utils/logger.js';

/**
 * Enhanced fetch wrapper with error handling, timeouts, and logging
 */
class APIClient {
  constructor(baseURL = API_BASE_URL, timeout = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  /**
   * Make an API request with proper error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization token if available
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Log the request for debugging
    apiLogger.group(`${options.method || 'GET'} ${endpoint}`);
    apiLogger.debug('URL:', url);
    apiLogger.debug('Headers:', headers);
    if (options.body) {
      apiLogger.debug('Body:', JSON.parse(options.body));
    }
    apiLogger.groupEnd();

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        credentials: 'include',
      });

      clearTimeout(timeoutId);

      // Log the response for debugging
      apiLogger.debug(`Response Status: ${response.status} ${response.statusText}`);

      // Try to parse response body
      let data = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = { raw: text };
          }
        }
      }

      // Check if response is OK
      if (!response.ok) {
        const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
        apiLogger.error(errorMessage, data);
        throw new APIError(errorMessage, response.status, data);
      }

      apiLogger.success(`${options.method || 'GET'} ${endpoint}`, data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error.name === 'AbortError') {
        const message = `Request timeout after ${this.timeout}ms`;
        apiLogger.error(`Timeout on ${options.method || 'GET'} ${endpoint}`);
        throw new APIError(message, 'TIMEOUT', null);
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const message = `Network error: Cannot reach ${url}. Make sure the backend server is running.`;
        apiLogger.error(message);
        throw new APIError(message, 'NETWORK_ERROR', null);
      }

      // Re-throw if it's already an APIError
      if (error instanceof APIError) {
        throw error;
      }

      // Handle other errors
      apiLogger.error(`Unexpected error: ${error.message}`);
      throw new APIError(error.message || 'An unexpected error occurred', 'UNKNOWN_ERROR', null);
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, status = null, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Create and export a singleton instance
export const apiClient = new APIClient();

export { APIError, APIClient };
export default apiClient;
