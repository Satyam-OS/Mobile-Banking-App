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
  type: "credit" | "debit" | "CREDIT" | "DEBIT" | "TRANSFER" | "DEPOSIT" | "WITHDRAWAL";
  transactionType?: string;
  status?: string;
  referenceNumber?: string;
  date?: string;
  createdAt?: string;
}

export interface TransferPayload {
  toAccountNumber: string;
  amount: number;
  note?: string;
  /** 4-digit transaction PIN — verified by auth-service before transfer executes */
  transactionPin: string;
}

export const transactionService = {
  getTransactionHistory: async (): Promise<Transaction[]> => {
    const data = await apiClient("/transaction/transaction/history", { method: "GET" });
    if (!data) return [];

    if (Array.isArray(data.content)) return data.content;
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
      body: JSON.stringify({
        toAccountNumber: payload.toAccountNumber,
        amount: payload.amount,
        note: payload.note,
        transactionPin: payload.transactionPin,
      }),
    }),

  getBeneficiaries: async () => [],
};
