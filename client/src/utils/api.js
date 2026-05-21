import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Token store — persisted to localStorage to survive page refreshes
const TOKEN_KEY = "ss_access_token";
let _accessToken = localStorage.getItem(TOKEN_KEY) || null;

export function setAccessToken(token) {
  _accessToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAccessToken() {
  return _accessToken;
}

export function clearAccessToken() {
  _accessToken = null;
  localStorage.removeItem(TOKEN_KEY);
}

// Attach token as Authorization header on every request
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers["Authorization"] = `Bearer ${_accessToken}`;
  }
  return config;
});

let refreshSubscribers = [];
function onRefreshed() {
  refreshSubscribers.forEach(({ resolve, original }) => resolve(api(original)));
  refreshSubscribers = [];
}
let refreshing = false;

/**
 * Setup 401 interceptor with refresh + retry. Pass refreshToken thunk and clearAuth action
 * to avoid circular dependency (api <- authSlice <- api).
 */
export function setupApiInterceptors(store, { refreshToken, clearAuth }) {
  api.interceptors.response.use(
    (res) => res,
    async (err) => {
      const original = err.config;
      if (!original || err.response?.status !== 401) return Promise.reject(err);
      const isAuthRoute = /\/auth\/(login|register|refresh)/.test(original.url || "");
      if (isAuthRoute || original._retry) {
        store.dispatch(clearAuth());
        return Promise.reject(err);
      }
      if (refreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push({ resolve, original });
        });
      }
      original._retry = true;
      refreshing = true;
      try {
        await store.dispatch(refreshToken()).unwrap();
        onRefreshed();
        return api(original);
      } catch (e) {
        store.dispatch(clearAuth());
        refreshSubscribers.forEach(({ resolve }) => resolve(Promise.reject(err)));
        refreshSubscribers = [];
        return Promise.reject(err);
      } finally {
        refreshing = false;
      }
    }
  );
}
