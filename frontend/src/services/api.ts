import { authStorage } from "./authStorage";

export const BASE_URL =
  "https://mobile-banking-app.onrender.com";

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const url = `${BASE_URL}${endpoint}`;

  // 1. Get the correct token
  const token = endpoint.startsWith("/admin")
    ? await authStorage.getAdminToken()
    : await authStorage.getUserToken();

  // 2. Setup Default Headers (including the Ngrok fix)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true", // Skips the Ngrok warning page
  };

  // 3. Add Authorization if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log("API Request:", { url, options, headers });

  // 4. Properly merge all headers
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers, // Our default headers + token
      ...options.headers, // Any specific headers passed from the service
    },
  });

  // Handle unauthorized/forbidden before trying to parse
  if (response.status === 401 || response.status === 403) {
    throw new Error(`Unauthorized or Forbidden: ${response.status}`);
  }

  const text = await response.text();

  // Handle non-JSON responses (like "KYC SUBMITTED") gracefully
  try {
    return text ? JSON.parse(text) : {};
  } catch (e) {
    // If the backend sent plain text, return it as an object
    return { message: text, status: "SUCCESS" };
  }
};
