/**
 * Resilient API Client with automatic JWT Bearer injection
 * and transparent token refresh interceptor.
 */

let accessToken = null;
let refreshPromise = null;
let onAuthFailureCallback = null;
let onTokenRefreshedCallback = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const setAuthCallbacks = ({ onAuthFailure, onTokenRefreshed }) => {
  onAuthFailureCallback = onAuthFailure;
  onTokenRefreshedCallback = onTokenRefreshed;
};

/**
 * Execute silent refresh against /auth/refresh using the HttpOnly cookie.
 * Deduplicates concurrent refresh calls via a shared Promise.
 */
export const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Refresh token invalid or expired');
      }

      const data = await res.json();
      setAccessToken(data.access_token);
      if (onTokenRefreshedCallback) {
        onTokenRefreshedCallback(data.user, data.access_token);
      }
      return data;
    } catch (err) {
      setAccessToken(null);
      if (onAuthFailureCallback) {
        onAuthFailureCallback();
      }
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Core authenticated fetch function with single-retry on 401.
 */
export const apiFetch = async (url, options = {}, isRetry = false) => {
  const headers = new Headers(options.headers || {});
  
  // Set JSON content-type if not already specified
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Bearer access token if present in memory
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include' // Always pass cookies for refresh token & session handling
  };

  const response = await fetch(url, fetchOptions);

  // If unauthorized and this isn't an auth endpoint itself or an already-retried request
  const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
  if (response.status === 401 && !isAuthEndpoint && !isRetry) {
    try {
      // Attempt silent refresh
      const refreshData = await refreshAccessToken();
      if (refreshData && refreshData.access_token) {
        // Retry the original request once with the new access token
        const retryHeaders = new Headers(options.headers || {});
        if (!retryHeaders.has('Content-Type') && options.body && typeof options.body === 'string') {
          retryHeaders.set('Content-Type', 'application/json');
        }
        retryHeaders.set('Authorization', `Bearer ${refreshData.access_token}`);
        
        return await fetch(url, {
          ...options,
          headers: retryHeaders,
          credentials: 'include'
        });
      }
    } catch (_refreshErr) {
      // Refresh failed, return original 401
      return response;
    }
  }

  return response;
};

export const apiClient = {
  get: (url, options = {}) => apiFetch(url, { ...options, method: 'GET' }),
  post: (url, body, options = {}) =>
    apiFetch(url, {
      ...options,
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body)
    }),
  patch: (url, body, options = {}) =>
    apiFetch(url, {
      ...options,
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body)
    }),
  delete: (url, options = {}) => apiFetch(url, { ...options, method: 'DELETE' })
};
