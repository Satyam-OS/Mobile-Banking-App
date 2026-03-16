/**
 * Transaction Service — via API Gateway
 *
 * POST /transaction/transaction/transfer
 * GET  /transaction/transaction/history
 * GET  /transaction/transaction/{id}
 */
import { apiClient } from "./api";

export interface Transaction {
  id: string;
  description?: string;
  merchant?: string;
  narration?: string;
  fromAccountNumber?: string;
  toAccountNumber?: string;
  amount: number;
  // ✅ FIX: Backend returns uppercase CREDIT/DEBIT/TRANSFER from enum .name()
  // Frontend must normalise before comparing — see Transactions.tsx fix
  type: "credit" | "debit" | "CREDIT" | "DEBIT" | "TRANSFER" | "DEPOSIT" | "WITHDRAWAL";
  transactionType?: string;
  status?: string;
  referenceNumber?: string;
  date?: string;
  createdAt?: string;
}

// ✅ FIX: Removed 'password' field — backend TransferRequest has no password field.
// Authentication is via JWT Bearer token only. The password field was silently
// dropped by Jackson but caused confusion. Keep it for UX in Transfer.tsx but
// do NOT send it to the backend.
export interface TransferPayload {
  toAccountNumber: string;
  amount: number;
  note?: string;
}

export const transactionService = {
  getTransactionHistory: async (): Promise<Transaction[]> => {
    const data = await apiClient("/transaction/transaction/history", { method: "GET" });
    if (!data) return [];

    // ✅ FIX: Backend returns Spring Page<T> object with a 'content' array.
    // Previously the frontend only checked for plain arrays, so it always got [].
    if (Array.isArray(data.content)) return data.content;

    // Fallbacks for other shapes
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.transactions)) return data.transactions;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.history)) return data.history;
    return [];
  },

  getTransaction: async (id: string) =>
    apiClient(`/transaction/transaction/${id}`, { method: "GET" }),

  transfer: async (payload: TransferPayload) =>
    apiClient("/transaction/transaction/transfer", {
      method: "POST",
      // ✅ FIX: Sends 'note' which maps to backend 'description' via @JsonAlias
      body: JSON.stringify({
        toAccountNumber: payload.toAccountNumber,
        amount: payload.amount,
        note: payload.note,
        // password intentionally NOT sent — backend ignores it and JWT is the auth
      }),
    }),

  getBeneficiaries: async () => [],
};
