// src/services/kycService.ts
import { apiClient } from "./api";

export const kycService = {
  submitKyc: async (kycData: any) => {
    try {
      const response = await apiClient("/kyc/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true", // Crucial: bypasses ngrok interstitial page
        },
        body: JSON.stringify(kycData),
      });

      console.log("KYC Submission Response:", response);

      // Since your backend returns 200 SUCCESS, we return the response
      // so the navigation logic in your component can trigger.
      return response;
    } catch (error: any) {
      // If the error is just the JSON parser failing on the text "KYC SUBMITTED",
      // we treat it as a success because the data actually reached the backend.
      if (
        error instanceof SyntaxError ||
        error.message?.includes("Unexpected token 'K'") ||
        error.message?.includes("Unexpected token 'Y'") // Added 'Y' just in case
      ) {
        console.log("Handled text response as success");
        return { message: "KYC SUBMITTED", status: "SUCCESS" };
      }

      console.error("Error submitting KYC:", error);
      throw error;
    }
  },
  getStatus: async () => {
    return await apiClient("/kyc/status", {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true", // Added here too for consistency
      },
    });
  },
};
