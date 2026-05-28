import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, type User } from "../services/authService";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setAuth: (token: string, user: User) => void;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  tryRefreshSession: () => Promise<boolean>;
  isAuthenticated: () => boolean;
}

const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    if (!payload.exp) return true;
    return payload.exp * 1000 <= Date.now() + 30_000;
  } catch {
    return true;
  }
};

let refreshPromise: Promise<boolean> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setAuth: (token, user) => {
        localStorage.setItem("token", token); // ← thêm lại để axios đọc được
        set({ token, user });
      },

      logout: async () => {
        localStorage.removeItem("token");
        await authService.logout();
        set({ token: null, user: null });
      },

      tryRefreshSession: async () => {
        if (refreshPromise) return refreshPromise;

        set({ isLoading: true });
        refreshPromise = (async () => {
          try {
            const { token, user } = await authService.refresh();
            localStorage.setItem("token", token);
            set({ token, user });
            return true;
          } catch {
            localStorage.removeItem("token");
            set({ token: null, user: null });
            return false;
          } finally {
            set({ isLoading: false });
            refreshPromise = null;
          }
        })();

        return refreshPromise;
      },

      fetchProfile: async () => {
        const token = get().token;
        if (!token) return;
        set({ isLoading: true });
        try {
          const { user } = await authService.getProfile();
          set({ user });
        } catch {
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },

      isAuthenticated: () => !!get().token && !isTokenExpired(get().token),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
