/**
 * API Helper Utilities
 * Smart base URL detection for production/development
 */

const stripTrailingSlashes = (url) => url.replace(/\/+$/, '');

const getConfiguredApiUrl = () => {
  const configuredUrl = process.env.REACT_APP_API_URL;
  if (!configuredUrl) return null;

  const normalizedUrl = stripTrailingSlashes(configuredUrl);
  return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;
};

/**
 * Get base URL for API/static resources
 * Supports HTTPS production and localhost development
 */
export const getBaseUrl = () => {
  // If explicitly set via env, use that
  const configuredApiUrl = getConfiguredApiUrl();
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/api$/, '');
  }
  
  // In browser context
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, port } = window.location;
    
    // Development: React dev server on port 3000
    if (port === '3000') {
      return 'http://localhost:5000';
    }
    
    // Production: same origin, preserve protocol (HTTP/HTTPS)
    // Use relative path or construct URL with current protocol
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:5000`;
    }
    
    // Production domain - use same origin (relative URLs work best)
    return '';
  }
  
  // Fallback
  return 'http://localhost:5000';
};

/**
 * Get API base URL (with /api suffix)
 */
export const getApiBaseUrl = () => {
  // If explicitly set via env, use that
  const configuredApiUrl = getConfiguredApiUrl();
  if (configuredApiUrl) {
    return configuredApiUrl;
  }
  
  // In browser context
  if (typeof window !== 'undefined' && window.location) {
    const { port } = window.location;
    
    // Development: React dev server on port 3000
    if (port === '3000') {
      return 'http://localhost:5000/api';
    }
    
    // Production: relative URL
    return '/api';
  }
  
  // Fallback
  return 'http://localhost:5000/api';
};

/**
 * Construct full URL for avatar/media resources
 * @param {string} path - Resource path (e.g., user.avatar)
 * @returns {string} Full URL
 */
export const getResourceUrl = (path) => {
  if (!path) return '';
  
  // If path is already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const baseUrl = getBaseUrl();
  
  // If baseUrl is empty (production same-origin), path should already be relative
  if (!baseUrl) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  
  // Construct full URL
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};
