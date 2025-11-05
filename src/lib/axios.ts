import axios from "axios";
import { type AxiosRequestHeaders } from "axios";

export const api = axios.create({
    baseURL: "/api",
    headers: { Accept: "application/json" },
});

// ===== Token provider asíncrono =====
type TokenProvider = () => Promise<string | null>;
let tokenProvider: TokenProvider | null = null;

export function setTokenProvider(fn: TokenProvider) {
    tokenProvider = fn;
}

// ===== Request interceptor: refresca antes de cada request =====
api.interceptors.request.use(async (config) => {
    if (!tokenProvider) return config;

    const token = await tokenProvider();
    if (!token) return config;

    const headers =
        config.headers;

    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers as AxiosRequestHeaders;

    return config;
});

// ===== Response interceptor: reintenta 1 vez si 401 =====
let isRefreshing = false;

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (!original || original.__isRetry) throw error;

        if (error.response?.status === 401 && tokenProvider) {
            try {
                // evita tormenta de refresh
                if (!isRefreshing) {
                    isRefreshing = true;
                    await tokenProvider(); // fuerza refresh
                    isRefreshing = false;
                }
                original.__isRetry = true;
                return api.request(original);
            } catch {
                isRefreshing = false;
            }
        }
        throw error;
    }
);
