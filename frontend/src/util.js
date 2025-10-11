import Cookies from 'js-cookie';

export const api_host = process.env.REACT_APP_API_HOST;

// This variable acts as a "lock" to prevent multiple refresh requests
// from being sent at the same time if multiple API calls fail at once.
let refreshTokenPromise = null;

const handleTokenRefresh = async () => {
  const refreshToken = Cookies.get('refreshToken');

  if (!refreshToken) {
    // If there's no refresh token, we can't do anything.
    // The user must log in again.
    console.error("No refresh token available. User needs to re-authenticate.");
    // Optional: Redirect to login page
    // window.location.href = '/auth';
    return Promise.reject('No refresh token');
  }

  try {
    const response = await fetch(`${api_host}/auth/refresh`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({refreshToken}),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token.');
    }

    const newTokens = await response.json();

    // Update cookies with the new tokens
    const fifteenMinutes = 1 / 96;
    Cookies.set('accessToken', newTokens.accessToken, {expires: fifteenMinutes, secure: true, sameSite: 'strict'});
    // The new refresh token from the sliding session
    Cookies.set('refreshToken', newTokens.refreshToken, {expires: 365, secure: true, sameSite: 'strict'});

    return newTokens.accessToken;

  } catch (error) {
    // If refreshing fails, the session is truly invalid.
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    console.error("Refresh failed. User needs to re-authenticate.", error);
    // Optional: Redirect to login page
    // window.location.href = '/auth';
    return Promise.reject(error);
  }
};

export default async function api(path, options = {}) {
  // 1. Get the current access token and add it to the request headers.
  const accessToken = Cookies.get('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // 2. Make the initial API request.
  let response = await fetch(api_host + path, {...options, headers});

  // 3. If the response is a 401, the access token has likely expired.
  if (response.status === 401) {
    try {
      // Check if a refresh is already in progress. If not, start one.
      if (!refreshTokenPromise) {
        refreshTokenPromise = handleTokenRefresh();
      }

      // Wait for the new access token.
      const newAccessToken = await refreshTokenPromise;

      // Reset the lock so future 401s can trigger a new refresh.
      refreshTokenPromise = null;

      // 4. Retry the original request with the new token.
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(api_host + path, {...options, headers});

    } catch (error) {
      // This will catch errors from handleTokenRefresh (e.g., invalid refresh token).
      // We return a rejected promise so the calling code's .catch() block will trigger.
      return Promise.reject(error);
    }
  }

  return response;
}