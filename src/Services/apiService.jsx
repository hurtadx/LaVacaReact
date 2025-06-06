/**
 * API Service Layer - Centralized HTTP Client
 * Replaces direct Supabase calls with clean API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lavacaapi.onrender.com';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.refreshToken = null;
  }

  /**
   * Set authentication tokens
   * @param {string} accessToken - JWT access token
   * @param {string} refreshToken - JWT refresh token
   */
  setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    
    // Store in localStorage for persistence
    if (accessToken) {
      localStorage.setItem('lavaca_access_token', accessToken);
    } else {
      localStorage.removeItem('lavaca_access_token');
    }
    
    if (refreshToken) {
      localStorage.setItem('lavaca_refresh_token', refreshToken);
    } else {
      localStorage.removeItem('lavaca_refresh_token');
    }
  }

  /**
   * Get stored tokens from localStorage
   */
  getStoredTokens() {
    const accessToken = localStorage.getItem('lavaca_access_token');
    const refreshToken = localStorage.getItem('lavaca_refresh_token');
    
    if (accessToken) {
      this.token = accessToken;
    }
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    
    return { accessToken, refreshToken };
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('lavaca_access_token');
    localStorage.removeItem('lavaca_refresh_token');
  }

  /**
   * Get headers for authenticated requests
   */
  getHeaders(isFormData = false) {
    const headers = {};
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  /**
   * Handle API response and errors
   */
  async handleResponse(response) {
    if (response.status === 401) {
      // El token expiró, voy a intentar renovarlo
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        this.clearAuth();
        // Redirijo al login o emito un evento de error de auth
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
        throw new Error('Session expired. Please login again.');
      }
      
      // Reintentar la petición original tendría que manejarlo quien llame
      throw new Error('Token expired, retry needed');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  }
  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access_token, data.refresh_token || this.refreshToken);
          if (import.meta.env.DEV) {
          console.log('Token refreshed successfully');
        }
        return true;
      }

      if (import.meta.env.DEV) {
        console.warn('⚠️ Token refresh failed:', response.status);
      }
      return false;
    } catch (error) {
      console.error('❌ Token refresh error:', error.message);
      return false;
    }
  }
  /**
   * Make authenticated API request with retry logic
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.isFormData),
        ...options.headers
      }
    };

    // Log detallado de la petición
    this.logRequestDetails(options.method || 'GET', endpoint, options.body, config.headers);    try {
      const response = await fetch(url, config);
        // Log response only in debug mode
      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === 'true') {
        console.group(`API Response: ${response.status}`);
        console.log("URL:", url);
        console.log("Status:", response.status, response.statusText);
        console.log("Response Headers:", Object.fromEntries(response.headers.entries()));
        console.groupEnd();
      }
      
      return await this.handleResponse(response);
    } catch (error) {
      // Always log errors but make them more concise
      console.error(`❌ API Error [${options.method || 'GET'} ${endpoint}]:`, error.message);
      
      if (error.message === 'Token expired, retry needed' && !options._isRetry) {
        // Retry the request once after token refresh
        return this.request(endpoint, { ...options, _isRetry: true });
      }
      throw error;
    }
  }

  // Métodos HTTP que uso en el servicio
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    return this.request(url.pathname + url.search, {
      method: 'GET'
    });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  /**
   * Subir archivos (form data)
   */
  async upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  }
  /**
   * Debug logging para peticiones HTTP
   */  logRequestDetails(method, endpoint, data, headers) {
    // Only log in development mode to reduce production noise
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === 'true') {
      console.group(`API Request: ${method} ${endpoint}`);
      console.log("URL:", `${this.baseURL}${endpoint}`);
      console.log("Method:", method);
      console.log("Headers:", headers);
      if (data) {
        console.log("Body:", typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
      }
      console.log("Timestamp:", new Date().toISOString());
      console.groupEnd();
    }
  }
}

// Creo una instancia singleton
const apiService = new ApiService();

// Inicializo los tokens guardados al arrancar
apiService.getStoredTokens();

export default apiService;

/**
 * Helper function to handle API responses in a consistent way
 * @param {Function} apiCall - API call function
 * @returns {Promise<{data: any, error: string|null}>}
 */
export async function handleApiCall(apiCall) {
  try {
    const result = await apiCall();
    return { data: result, error: null };
  } catch (error) {
    // Only log in development mode, and make it concise
    if (import.meta.env.DEV) {
      console.error('🔥 API Call Failed:', error.message);
    }
    return { data: null, error: error.message };
  }
}

/**
 * Format API error response to match existing service format
 * @param {Error} error - Error object
 * @returns {object} Formatted error response
 */
export function formatApiError(error) {
  return {
    success: false,
    data: null,
    error: error.message
  };
}

/**
 * Format API success response to match existing service format
 * @param {any} data - Response data
 * @returns {object} Formatted success response
 */
export function formatApiSuccess(data) {
  return {
    success: true,
    data,
    error: null
  };
}
