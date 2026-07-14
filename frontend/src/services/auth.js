import apiClient from './api.js';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../config/api.js';
import { authLogger } from '../utils/logger.js';

/**
 * Authentication service
 * Handles all auth-related API calls and token management
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const { name, email, password, targetPercentile, examDate } = userData;

    if (!name || !email || !password) {
      authLogger.warn('Missing required registration fields');
      throw new Error('Name, email, and password are required');
    }

    if (password.length < 6) {
      authLogger.warn('Password too short');
      throw new Error('Password must be at least 6 characters');
    }

    authLogger.debug('Registering user:', { name, email });
    try {
      const response = await apiClient.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        targetPercentile: Number(targetPercentile) || 99,
        examDate: examDate || null,
      });

      if (response.token && response.user) {
        this.setToken(response.token);
        this.setUser(response.user);
        authLogger.success(`User registered: ${response.user.name}`);
      }

      return response;
    } catch (err) {
      // If the backend is unreachable, fall back to a local demo user
      const isNetworkError = err && (err.status === 'NETWORK_ERROR' || err.status === 'TIMEOUT' || /Network error|timeout/i.test(err.message || ''));
      if (isNetworkError) {
        authLogger.warn('Backend unreachable — creating local demo user');
        const timestamp = Date.now();
        const demoUser = {
          id: `local-${timestamp}`,
          name: name.trim(),
          email: email.trim(),
          targetPercentile: Number(targetPercentile) || 99,
          examDate: examDate || null,
        };
        const demoToken = `local-token-${timestamp}`;
        this.setToken(demoToken);
        this.setUser(demoUser);
        return { token: demoToken, user: demoUser, demo: true };
      }

      throw err;
    }
  }

  /**
   * Login a user
   */
  async login(email, password) {
    if (!email || !password) {
      authLogger.warn('Missing email or password');
      throw new Error('Email and password are required');
    }

    authLogger.debug('Attempting login for:', email);
    try {
      const response = await apiClient.post('/auth/login', {
        email: email.trim(),
        password,
      });

      if (response.token && response.user) {
        this.setToken(response.token);
        this.setUser(response.user);
        authLogger.success(`User logged in: ${response.user.name}`);
      }

      return response;
    } catch (err) {
      const isNetworkError = err && (err.status === 'NETWORK_ERROR' || err.status === 'TIMEOUT' || /Network error|timeout/i.test(err.message || ''));
      if (isNetworkError) {
        // Create or reuse a local demo user for offline/demo mode
        authLogger.warn('Backend unreachable — using local demo login');
        const timestamp = Date.now();
        const demoUser = {
          id: `local-${timestamp}`,
          name: email.split('@')[0] || 'Demo User',
          email: email.trim(),
        };
        const demoToken = `local-token-${timestamp}`;
        this.setToken(demoToken);
        this.setUser(demoUser);
        return { token: demoToken, user: demoUser, demo: true };
      }

      throw err;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    if (response.user) {
      this.setUser(response.user);
    }
    return response;
  }

  /**
   * Update user profile
   */
  async updateProfile(userData) {
    const response = await apiClient.patch('/auth/profile', userData);
    if (response.user) {
      this.setUser(response.user);
    }
    return response;
  }

  /**
   * Logout user
   */
  logout() {
    authLogger.info('User logging out');
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  /**
   * Set auth token in localStorage
   */
  setToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  /**
   * Get auth token from localStorage
   */
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Set user data in localStorage
   */
  setUser(user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user data from localStorage
   */
  getUser() {
    const user = localStorage.getItem(AUTH_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken() && !!this.getUser();
  }

  /**
   * Clear all auth data
   */
  clearAuth() {
    this.logout();
  }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;
