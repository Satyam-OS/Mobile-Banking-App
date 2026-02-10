import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./api";
import { authStorage } from "./authStorage";

export const authService = {
  generateOtp: async (mobile: string) =>
    apiClient("/otp/generate", {
      method: "POST",
      body: JSON.stringify({ mobile }),
    }),

  verifyOtp: async (mobile: string, otp: string) => {
    const data = await apiClient("/otp/verify", {
      method: "POST",
      body: JSON.stringify({ mobile, otp }),
    });

    if (data?.token) {
      await authStorage.saveUserToken(data.token);
    }

    // Save user name for dynamic greeting - supporting multiple potential API response structures
    const nameToSave =
      data?.user?.firstName ||
      data?.firstName ||
      data?.name ||
      data?.user?.name;
    if (nameToSave) {
      await AsyncStorage.setItem("user_name", nameToSave);
    }

    return data;
  },

  login: async (credentials: any) => {
    const data = await apiClient("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (!data?.token || !data?.role) {
      throw new Error("Invalid login response");
    }

    // Save user name for dynamic greeting - supporting multiple potential API response structures
    const nameToSave =
      data?.user?.firstName ||
      data?.firstName ||
      data?.name ||
      data?.user?.name;
    if (nameToSave) {
      await AsyncStorage.setItem("user_name", nameToSave);
    }

    if (data.role === "ADMIN") {
      await authStorage.saveAdminToken(data.token);
    } else {
      await authStorage.saveUserToken(data.token);
    }

    return data;
  },

  logout: async () => {
    await authStorage.clearAll();
    await AsyncStorage.removeItem("user_name");
  },
};
