import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "../services/api";
import type { User } from "../types/auth";

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: async (username: string, password: string) => {
                const response = await authAPI.login(username, password);
                set({
                    user: response.user,
                    token: response.token,
                    isAuthenticated: true,
                });
                localStorage.setItem("token", response.token);
            },
            register: async (username: string, email: string, password: string) => {
                const response = await authAPI.register(username, email, password);
                set({
                    user: response.user,
                    token: response.token,
                    isAuthenticated: true,
                });
                localStorage.setItem("token", response.token);
            },
            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem("token");
            },
        }),
        {
            name: "auth-storage",
        },
    ),
);
