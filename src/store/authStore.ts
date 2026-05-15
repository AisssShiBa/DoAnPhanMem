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
  logout: () => void;
  fetchProfile: () => Promise<void>;
  isAuthenticated: () => boolean;
}

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

      isAuthenticated: () => !!get().token,
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
