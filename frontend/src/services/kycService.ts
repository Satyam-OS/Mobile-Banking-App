/**
 * KYC Service — via API Gateway
 *
 * POST /auth/kyc/submit
 */
import { apiClient } from "./api";

export const kycService = {
  submitKyc: async (kycData: any) => {
    try {
      const response = await apiClient("/auth/kyc/submit", {
        method: "POST",
        body: JSON.stringify(kycData),
      });
      return response ?? { message: "KYC SUBMITTED", status: "SUCCESS" };
    } catch (error: any) {
      if (error instanceof SyntaxError || error.message?.includes("Unexpected token")) {
        return { message: "KYC SUBMITTED", status: "SUCCESS" };
      }
      throw error;
    }
  },
  getStatus: async () => null,
};
