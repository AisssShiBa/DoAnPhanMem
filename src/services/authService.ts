import api from "../lib/axios";

/* =========================
   TYPES
========================= */

export interface User {
  id: number;
  full_name: string;
  email: string;
  provider: string;
  status: string;
  role: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SigninData {
  email: string;
  password: string;
}

/* =========================
   AUTH SERVICE
========================= */

export const authService = {
  /* =========================
     SIGNUP
  ========================= */

  signup: async (data: SignupData): Promise<{ message: string }> => {
    const res = await api.post("/auth/signup", data);

    return res.data;
  },

  /* =========================
     SIGNIN
  ========================= */

  signin: async (
    data: SigninData,
  ): Promise<{
    token: string;
    user: User;
    message: string;
  }> => {
    const res = await api.post("/auth/signin", data);

    return res.data;
  },

  /* =========================
     GET PROFILE
  ========================= */

  getProfile: async (): Promise<{
    user: User;
  }> => {
    const res = await api.get("/auth/profile");

    return res.data;
  },

  /* =========================
     VERIFY EMAIL
  ========================= */

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    // ✅ axios tự encode đúng cách
    const res = await api.get("/auth/verify-email", { params: { token } });
    return res.data;
  },

  /* =========================
     GOOGLE LOGIN
  ========================= */

  loginWithGoogle: () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

    window.location.href = `${apiUrl}/auth/google`;
  },

  /* =========================
     LOGOUT
  ========================= */

  logout: async () => {
    try {
      await api.post("/auth/logout");
      // eslint-disable-next-line no-empty
    } catch {}
    localStorage.removeItem("token");
  },
};
