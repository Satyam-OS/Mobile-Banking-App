import { apiClient } from "./api";

import { authStorage } from "./authStorage";

export const adminService = {
  getPendingKyc: async () => {
    const token = await authStorage.getAdminToken();

    if (!token) throw new Error("Admin not logged in");

    return apiClient("/admin/kyc/pending", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  approveKyc: async (mobile: string) => {
    const token = await authStorage.getAdminToken();

    return apiClient(`/admin/kyc/approve/${mobile}`, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  rejectKyc: async (mobile: string, reason: string) => {
    const token = await authStorage.getAdminToken();

    return apiClient(
      `/admin/kyc/reject/${mobile}?reason=${encodeURIComponent(reason)}`,

      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },
};
