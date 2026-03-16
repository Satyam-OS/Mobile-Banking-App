/**
 * NEXUS BANK — API CLIENT
 * Single gateway: https://banking-app-1ap8.onrender.com
 * All services route through this gateway.
 */

import { authStorage } from "./authStorage";

export const BASE_URL = "https://banking-app-1ap8.onrender.com";

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = true,
): Promise<any> => {
  const url = `${BASE_URL}${endpoint}`;

  const isAdmin = endpoint.includes("/admin/");
  const token = requiresAuth
    ? isAdmin
      ? await authStorage.getAdminToken()
      : await authStorage.getUserToken()
    : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Debug logging
  const bodyPreview = options.body
    ? (() => {
        try {
          return JSON.parse(options.body as string);
        } catch {
          return options.body;
        }
      })()
    : undefined;
  console.log(
    `[API] ${options.method || "GET"} ${endpoint}`,
    bodyPreview ?? "",
  );

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...((options.headers as Record<string, string>) ?? {}),
      },
    });

    console.log(`[API] ← ${response.status} ${endpoint}`);

    if (response.status === 401 || response.status === 403) {
      await authStorage.clearAll();
      throw new Error("UNAUTHORIZED");
    }
    if (response.status === 404) return null;
    if (response.status >= 500) {
      let detail = "SERVER_ERROR";
      try {
        const t = await response.text();
        const j = JSON.parse(t);
        detail = j.message || j.error || "SERVER_ERROR";
        console.error(`[API] 500 detail (${endpoint}):`, t.slice(0, 400));
      } catch {
        console.error(`[API] 500 on ${endpoint}`);
      }
      throw new Error(detail);
    }

    const text = await response.text();
    if (!text) return {};
    try {
      const json = JSON.parse(text);
      if (!response.ok && (json.message || json.error))
        throw new Error(json.message || json.error);
      return json;
    } catch (parseErr: any) {
      if (parseErr.message && !parseErr.message.includes("JSON"))
        throw parseErr;
      if (!response.ok) throw new Error(text || "Request failed");
      return { message: text, status: "SUCCESS" };
    }
  } catch (err: any) {
    if (
      err.name === "TypeError" ||
      err.message?.includes("Failed to fetch") ||
      err.message?.includes("Network request failed")
    ) {
      throw new Error("NETWORK_ERROR");
    }
    throw err;
  }
};
