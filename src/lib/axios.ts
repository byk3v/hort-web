import axios from "axios";

export const api = axios.create({
    baseURL: "/api",
    headers: { Accept: "application/json" },
});

// Globale Token-Verwaltung (wird vom AuthProvider gesetzt)
export let authToken: string | null = null;
export function setAuthToken(token: string | null) {
    authToken = token;
}

api.interceptors.request.use((config) => {
    if (authToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
});
