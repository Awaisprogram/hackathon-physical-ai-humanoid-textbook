import apiClient from './api';

interface User {
  id: string;
  name: string;
  email: string;
  softwareExperience?: string;
  hardwareExperience?: string;
  avatar?: string;
  initials: string;
  createdAt?: string;
  lastLoginAt?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  softwareExperience?: string;
  hardwareExperience?: string;
}

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  softwareExperience?: string;
  hardwareExperience?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

interface SessionResponse {
  authenticated: boolean;
  data?: {
    user: User;
    token?: string;
  };
  message?: string;
}

export const authAPI = {
  /**
   * Register a new user
   * @param {RegisterData} userData - User registration data
   */
  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || 'Registration failed',
          errors: error.response.data.errors
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          message: 'Network error. Please check your connection.'
        };
      } else {
        // Something else happened
        return {
          success: false,
          message: 'An unexpected error occurred during registration.'
        };
      }
    }
  },

  /**
   * Login user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {boolean} rememberMe - Whether to remember the user for 7 days
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
        rememberMe
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data.message || 'Login failed'
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          message: 'Network error. Please check your connection.'
        };
      } else {
        // Something else happened
        return {
          success: false,
          message: 'An unexpected error occurred during login.'
        };
      }
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Even if logout API fails, we still want to clear local state
        console.warn('Logout API call failed, but clearing local state anyway');
        return { success: true, message: 'Logged out locally' };
      } else {
        // Network error - still clear local state
        console.warn('Network error during logout, clearing local state');
        return { success: true, message: 'Logged out locally due to network error' };
      }
    }
  },

  /**
   * Check current session
   */
  async session(): Promise<SessionResponse> {
    try {
      const response = await apiClient.get('/auth/session');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        // Session expired or invalid
        return {
          authenticated: false,
          message: 'Session expired or invalid'
        };
      } else if (error.request) {
        // Network error
        return {
          authenticated: false,
          message: 'Network error while checking session'
        };
      } else {
        // Other error
        return {
          authenticated: false,
          message: 'Error checking session status'
        };
      }
    }
  },

  /**
   * Get current user profile
   */
  async getUser(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiClient.get('/auth/user');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Error fetching user data'
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error while fetching user data'
        };
      } else {
        return {
          success: false,
          message: 'An unexpected error occurred while fetching user data'
        };
      }
    }
  },

  /**
   * Update user profile
   * @param {UpdateProfileData} profileData - Updated profile data
   */
  async updateProfile(profileData: UpdateProfileData): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiClient.put('/auth/user', profileData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Error updating profile',
          errors: error.response.data.errors
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error while updating profile'
        };
      } else {
        return {
          success: false,
          message: 'An unexpected error occurred while updating profile'
        };
      }
    }
  },

  /**
   * Request password reset
   * @param {string} email - User's email
   */
  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Error requesting password reset'
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Network error while requesting password reset'
        };
      } else {
        return {
          success: false,
          message: 'An unexpected error occurred while requesting password reset'
        };
      }
    }
  }
};