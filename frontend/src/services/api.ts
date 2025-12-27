import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);

export const authAPI = {
    login: async (username: string, password: string) => {
        const response = await api.post("/api/auth/login", { username, password });
        return response.data;
    },
    register: async (username: string, email: string, password: string) => {
        const response = await api.post("/api/auth/register", { username, email, password });
        return response.data;
    },
};

export const profileAPI = {
    getProfile: async () => {
        const response = await api.get("/api/profile");
        return response.data;
    },
    updateProfile: async (username: string, profile_picture: string) => {
        const response = await api.put("/api/profile", { username, profile_picture });
        return response.data;
    },
};

export default api;
