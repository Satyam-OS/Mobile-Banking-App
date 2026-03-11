/**
 * Admin Service — via API Gateway
 *
 * GET  /auth/admin/kyc/pending
 * POST /auth/admin/kyc/approve/{mobile}
 * POST /auth/admin/kyc/reject/{mobile}
 * GET  /auth/admin/dashboard
 */
import { apiClient } from "./api";
import { authStorage } from "./authStorage";

export const adminService = {
  getPendingKyc: async () => {
    const token = await authStorage.getAdminToken();
    if (!token) throw new Error("Admin not logged in");
    return apiClient("/auth/admin/kyc/pending", { method: "GET" });
  },
  approveKyc: async (mobile: string) =>
    apiClient(`/auth/admin/kyc/approve/${mobile}`, { method: "POST" }),
  rejectKyc: async (mobile: string, reason?: string) => {
    const qs = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    return apiClient(`/auth/admin/kyc/reject/${mobile}${qs}`, { method: "POST" });
  },
  getDashboard: async () => apiClient("/auth/admin/dashboard", { method: "GET" }),
};
