/**
 * Account Service — via API Gateway
 *
 * GET  /account/account/me
 * GET  /account/account/balance
 * POST /account/account/deposit
 * PUT  /account/account/freeze/{id}
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./api";

export const accountService = {
  getAccountDetails: async () => apiClient("/account/account/me", { method: "GET" }),
  getBalance: async () => apiClient("/account/account/balance", { method: "GET" }),
  deposit: async (payload: { amount: number; accountId?: string }) =>
    apiClient("/account/account/deposit", { method: "POST", body: JSON.stringify(payload) }),
  freezeAccount: async (id: string) =>
    apiClient(`/account/account/freeze/${id}`, { method: "PUT" }),

  getProfile: async () => {
    try {
      const data = await apiClient("/account/account/me", { method: "GET" });
      if (data) return data;
    } catch { /* fall through to cache */ }
    const cached = await AsyncStorage.getItem("user_data");
    return cached ? JSON.parse(cached) : null;
  },
};
