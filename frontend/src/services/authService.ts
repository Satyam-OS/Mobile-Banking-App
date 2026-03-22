/**
 * Auth Service — via API Gateway
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./api";
import { authStorage } from "./authStorage";

export const authService = {
  login: async (credentials: { mobile: string; password: string }) => {
    const data = await apiClient("/auth/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }, false);

    if (!data?.token) throw new Error(data?.message || "Invalid credentials");

    const role = (data.role || "USER").toUpperCase();
    if (role === "ADMIN") {
      await authStorage.saveAdminToken(data.token);
    } else {
      await authStorage.saveUserToken(data.token);
    }

    const name =
      data?.firstName      ||
      data?.user?.firstName || data?.user?.name || data?.user?.fullName ||
      data?.name || data?.fullName ||
      data?.username;

    const displayName = (name && name.trim() !== "") ? name.trim() : credentials.mobile;

    await AsyncStorage.setItem("user_name",   displayName);
    await AsyncStorage.setItem("user_mobile", credentials.mobile);
    await AsyncStorage.setItem("user_data", JSON.stringify({
      name:       displayName,
      mobile:     credentials.mobile,
      role,
      customerId: data?.user?.id || data?.customerId || data?.id || "",
      email:      data?.email || data?.user?.email || "",
    }));

    return { ...data, role };
  },

  generateOtp: async (mobile: string) => {
    if (!mobile || mobile.length !== 10) throw new Error("Invalid mobile number");
    return apiClient("/auth/otp/generate", {
      method: "POST",
      body: JSON.stringify({ mobile }),
    }, false);
  },

  verifyOtp: async (mobile: string, otp: string) => {
    const data = await apiClient("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ mobile, otp }),
    }, false);
    if (data?.token) await authStorage.saveUserToken(data.token);
    const name = data?.user?.firstName || data?.user?.name || data?.firstName || data?.name;
    if (name) await AsyncStorage.setItem("user_name", name);
    return data;
  },

  resetPassword: async (mobile: string, otp: string, newPassword: string, confirmPassword: string) => {
    return apiClient("/auth/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ mobile, otp, newPassword, confirmPassword }),
    }, false);
  },

  getUserDashboard:  async () => apiClient("/auth/user/dashboard",  { method: "GET" }),
  getAdminDashboard: async () => apiClient("/auth/admin/dashboard", { method: "GET" }),

  setTransactionPin: async (pin: string, confirmPin: string) => {
    return apiClient("/auth/user/set-pin", {
      method: "POST",
      body: JSON.stringify({ pin, confirmPin }),
    });
  },

  verifyTransactionPin: async (pin: string) => {
    return apiClient("/auth/user/verify-pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
  },

  /**
   * Clears all stored tokens and user data.
   * Call this then use navigation.reset() to go back to Login.
   */
  logout: async () => {
    await authStorage.clearAll();
    await AsyncStorage.multiRemove([
      "user_name",
      "user_mobile",
      "user_data",
      "profile_cache",
    ]);
  },

  isLoggedIn:      async (): Promise<boolean> => !!(await authStorage.getUserToken()),
  isAdminLoggedIn: async (): Promise<boolean> => !!(await authStorage.getAdminToken()),

  getCachedUserData: async () => {
    try {
      const raw = await AsyncStorage.getItem("user_data");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
};
