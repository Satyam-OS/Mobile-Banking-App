const BASE_URL = "https://unhastened-monopolistically-shirlee.ngrok-free.dev";

export const sendOtp = async (phone: string) => {
  const res = await fetch(`${BASE_URL}/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });

  if (!res.ok) throw new Error("OTP send failed");
  return res.json();
};

export const verifyOtp = async (phone: string, otp: string) => {
  const res = await fetch(`${BASE_URL}/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });

  if (!res.ok) throw new Error("OTP verify failed");
  return res.json();
};
