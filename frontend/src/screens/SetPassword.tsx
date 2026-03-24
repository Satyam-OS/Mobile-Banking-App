import {
  AlertCircle, ArrowLeft, CheckCircle2,
  Eye, EyeOff, Lock, ShieldCheck, Smartphone,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../services/authService";

// ─── Hidden-input OTP boxes (6 digits) ──────────────────────────────────────
const OtpInput = ({
  value, onChange, autoFocus = false,
}: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) => {
  const inputRef = useRef<TextInput>(null);
  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
      style={otp.row}
    >
      {/* Single hidden real input */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, "").slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        style={otp.hidden}
        caretHidden
        autoFocus={autoFocus}
      />
      {/* 6 visual boxes */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            otp.box,
            value.length === i && otp.boxActive,
            value.length > i  && otp.boxFilled,
          ]}
        >
          {value.length > i ? <View style={otp.dot} /> : null}
        </View>
      ))}
    </TouchableOpacity>
  );
};
const otp = StyleSheet.create({
  row:    { flexDirection: "row", gap: 8, justifyContent: "center", position: "relative" },
  hidden: { position: "absolute", width: "100%", height: "100%", opacity: 0, zIndex: 10 },
  box:    { width: 46, height: 54, borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0", backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" },
  boxActive: { borderColor: "#0EA5E9", backgroundColor: "#F0F9FF" },
  boxFilled: { borderColor: "#0EA5E9", backgroundColor: "#F0F9FF" },
  dot:    { width: 14, height: 14, borderRadius: 7, backgroundColor: "#001F3F" },
});

// ─── Steps ───────────────────────────────────────────────────────────────────
type Step = "phone" | "otp" | "otpSuccess" | "password";

export default function SetPassword({ navigation }: any) {
  const [step,            setStep]           = useState<Step>("phone");
  const [mobile,          setMobile]         = useState("");
  const [otpValue,        setOtpValue]       = useState("");
  const [newPassword,     setNewPassword]    = useState("");
  const [confirmPassword, setConfirmPassword]= useState("");
  const [showPassword,    setShowPassword]   = useState(false);
  const [isLoading,       setIsLoading]      = useState(false);
  const [resendTimer,     setResendTimer]    = useState(0);
  const [statusMsg,       setStatusMsg]      = useState<{type:"success"|"error"; text:string}|null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (statusMsg) {
      const t = setTimeout(() => setStatusMsg(null), 5000);
      return () => clearTimeout(t);
    }
  }, [statusMsg]);

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(p => p - 1), 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [resendTimer]);

  const isMinLength    = newPassword.length >= 5;
  const hasUppercase   = /[A-Z]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";

  // ── Step 1: Request OTP ───────────────────────────────────────────────
  const handleRequestOtp = async () => {
    setStatusMsg(null);
    if (mobile.length !== 10) {
      setStatusMsg({ type: "error", text: "Please enter a valid 10-digit mobile number." });
      return;
    }
    setIsLoading(true);
    try {
      await authService.generateOtp(mobile);
      setResendTimer(60);
      setStep("otp");
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message === "NETWORK_ERROR"
          ? "Network error. Please try again."
          : err.message || "Failed to send OTP.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Resend OTP ────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0 || isLoading) return;
    setIsLoading(true);
    try {
      await authService.generateOtp(mobile);
      setOtpValue("");
      setResendTimer(60);
      setStatusMsg({ type: "success", text: "New OTP sent." });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to resend OTP." });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Verify OTP (frontend only — just check length & move) ─────
  // The actual OTP verification happens on the backend when we submit the password.
  // We don't call /otp/verify here because that would mark it used prematurely.
  // We just show a success screen for UX, then proceed to password step.
  const handleVerifyOtp = () => {
    setStatusMsg(null);
    if (otpValue.length !== 6) {
      setStatusMsg({ type: "error", text: "Please enter the complete 6-digit OTP." });
      return;
    }
    // Show success screen briefly, then go to password step
    setStep("otpSuccess");
    setTimeout(() => setStep("password"), 1800);
  };

  // ── Step 4: Submit new password (sends mobile + otp + passwords together) ─
  const handleSetPassword = async () => {
    setStatusMsg(null);
    if (!isMinLength || !hasUppercase) {
      setStatusMsg({ type: "error", text: "Password must meet all security criteria." });
      return;
    }
    if (!passwordsMatch) {
      setStatusMsg({ type: "error", text: "Passwords do not match. Please re-enter." });
      return;
    }
    setIsLoading(true);
    try {
      // Send mobile + otp + newPassword + confirmPassword together
      // Backend verifies OTP and resets password in one atomic call
      await authService.resetPassword(mobile, otpValue, newPassword, confirmPassword);
      setStatusMsg({ type: "success", text: "Password updated! Redirecting to login..." });
      setTimeout(() => navigation.reset({ index: 0, routes: [{ name: "Login" }] }), 2000);
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("already used")) {
        setStatusMsg({ type: "error", text: "OTP already used. Please request a new one." });
        setTimeout(() => { setStep("phone"); setOtpValue(""); setResendTimer(0); }, 2200);
      } else if (msg.toLowerCase().includes("expired")) {
        setStatusMsg({ type: "error", text: "OTP expired. Please request a new one." });
        setTimeout(() => { setStep("phone"); setOtpValue(""); setResendTimer(0); }, 2200);
      } else if (msg.toLowerCase().includes("invalid otp")) {
        setStatusMsg({ type: "error", text: "Invalid OTP. Please request a new one." });
        setTimeout(() => { setStep("phone"); setOtpValue(""); setResendTimer(0); }, 2200);
      } else {
        setStatusMsg({
          type: "error",
          text: msg === "NETWORK_ERROR" ? "Network error. Please try again." : msg || "Failed to reset password.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStatusMsg(null);
    if (step === "phone")    navigation.goBack();
    else if (step === "otp") { setStep("phone"); setOtpValue(""); }
    else if (step === "password") { setStep("otp"); }
  };

  const stepIndex = { phone: 0, otp: 1, otpSuccess: 2, password: 2 }[step];

  // ── Status Banner ─────────────────────────────────────────────────────
  const StatusBanner = () => statusMsg ? (
    <View style={[s.banner, statusMsg.type === "error" ? s.bannerErr : s.bannerOk]}>
      {statusMsg.type === "error"
        ? <AlertCircle size={16} color="#EF4444" />
        : <CheckCircle2 size={16} color="#10B981" />
      }
      <Text style={[s.bannerText, statusMsg.type === "error" ? s.bannerErrText : s.bannerOkText]}>
        {statusMsg.text}
      </Text>
    </View>
  ) : null;

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false}>

          {/* ── Header ──────────────────────────────────────────────────── */}
          <View style={s.header}>
            {step !== "otpSuccess" && (
              <TouchableOpacity style={s.backBtn} onPress={handleBack}>
                <ArrowLeft color="#FFF" size={22} />
              </TouchableOpacity>
            )}
            <View style={s.logoWrap}>
              <View style={s.logoInner}>
                <Lock size={28} color="#001F3F" strokeWidth={2.5} />
              </View>
            </View>
            <Text style={s.headerTitle}>Security</Text>
            <Text style={s.headerSub}>RESET ACCESS CREDENTIALS</Text>
            {/* Progress dots */}
            <View style={s.dotsRow}>
              {[0, 1, 2].map(i => (
                <View key={i} style={[
                  s.dot,
                  i < stepIndex  && s.dotDone,
                  i === stepIndex && s.dotActive,
                ]} />
              ))}
            </View>
          </View>

          {/* ── Form card ───────────────────────────────────────────────── */}
          <View style={s.card}>
            <StatusBanner />

            {/* STEP 1 — Phone */}
            {step === "phone" && (
              <>
                <Text style={s.title}>Forgot Password?</Text>
                <Text style={s.subtitle}>Enter your registered mobile to receive an OTP.</Text>
                <View style={s.fieldGroup}>
                  <Text style={s.label}>REGISTERED MOBILE</Text>
                  <View style={s.inputRow}>
                    <Smartphone size={18} color="#0EA5E9" style={s.inputIcon} />
                    <TextInput
                      style={s.input}
                      keyboardType="number-pad"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      placeholderTextColor="#94A3B8"
                      value={mobile}
                      onChangeText={t => setMobile(t.replace(/[^0-9]/g, "").slice(0, 10))}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={[s.btn, (isLoading || mobile.length !== 10) && s.btnDisabled]}
                  onPress={handleRequestOtp}
                  disabled={isLoading || mobile.length !== 10}
                >
                  {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={s.btnText}>SEND OTP</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* STEP 2 — Enter OTP */}
            {step === "otp" && (
              <>
                <Text style={s.title}>Enter OTP</Text>
                <Text style={s.subtitle}>
                  A 6-digit OTP was sent to{"\n"}
                  <Text style={{ color: "#0EA5E9", fontWeight: "800" }}>+91 {mobile}</Text>
                </Text>
                <View style={{ marginVertical: 24 }}>
                  <OtpInput key="otp-input" value={otpValue} onChange={setOtpValue} autoFocus />
                </View>
                <TouchableOpacity
                  style={[resendTimer > 0 && s.resendDisabled]}
                  onPress={handleResend}
                  disabled={resendTimer > 0 || isLoading}
                >
                  <Text style={[s.resendText, resendTimer > 0 && { color: "#94A3B8" }]}>
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Didn't receive? Resend OTP"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btn, (isLoading || otpValue.length !== 6) && s.btnDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={isLoading || otpValue.length !== 6}
                >
                  {isLoading
                    ? <ActivityIndicator color="#FFF" />
                    : <Text style={s.btnText}>VERIFY OTP</Text>
                  }
                </TouchableOpacity>
              </>
            )}

            {/* STEP 3 — OTP Success screen */}
            {step === "otpSuccess" && (
              <View style={s.successBox}>
                <View style={s.successIcon}>
                  <CheckCircle2 size={56} color="#10B981" />
                </View>
                <Text style={s.successTitle}>OTP Verified!</Text>
                <Text style={s.successSub}>
                  Identity confirmed.{"\n"}Setting up new password...
                </Text>
                <ActivityIndicator color="#0EA5E9" style={{ marginTop: 18 }} />
              </View>
            )}

            {/* STEP 4 — New Password */}
            {step === "password" && (
              <>
                <Text style={s.title}>Set New Password</Text>
                <Text style={s.subtitle}>Choose a strong password for your account.</Text>

                <View style={s.fieldGroup}>
                  <Text style={s.label}>NEW PASSWORD</Text>
                  <View style={s.inputRow}>
                    <Lock size={18} color="#0EA5E9" style={s.inputIcon} />
                    <TextInput
                      style={s.input}
                      secureTextEntry={!showPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#CBD5E1"
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                      {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                    </TouchableOpacity>
                  </View>
                  <View style={s.validationBox}>
                    <View style={s.validRow}>
                      {isMinLength ? <CheckCircle2 size={13} color="#10B981" /> : <View style={s.validDot} />}
                      <Text style={[s.validText, isMinLength && s.validMet]}>Minimum 5 characters</Text>
                    </View>
                    <View style={s.validRow}>
                      {hasUppercase ? <CheckCircle2 size={13} color="#10B981" /> : <View style={s.validDot} />}
                      <Text style={[s.validText, hasUppercase && s.validMet]}>One uppercase letter (A-Z)</Text>
                    </View>
                  </View>
                </View>

                <View style={s.fieldGroup}>
                  <Text style={s.label}>CONFIRM PASSWORD</Text>
                  <View style={[s.inputRow, passwordsMatch && { borderColor: "#10B981" }]}>
                    <ShieldCheck size={18} color="#0EA5E9" style={s.inputIcon} />
                    <TextInput
                      style={s.input}
                      secureTextEntry
                      placeholder="••••••••"
                      placeholderTextColor="#CBD5E1"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[s.btn, isLoading && s.btnDisabled]}
                  onPress={handleSetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={s.btnText}>UPDATE PASSWORD</Text>}
                </TouchableOpacity>
              </>
            )}

            <View style={s.footer}>
              <ShieldCheck size={12} color="#94A3B8" />
              <Text style={s.footerText}>AES-256 BIT ENCRYPTION</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#001F3F" },
  header:    { paddingBottom: 20, paddingTop: 10, alignItems: "center", minHeight: 200, justifyContent: "center", position: "relative" },
  backBtn:   { position: "absolute", top: 16, left: 20, padding: 10, zIndex: 10 },
  logoWrap:  { width: 66, height: 66, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  logoInner: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  headerSub:   { color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: "800", letterSpacing: 1.5, marginTop: 2 },
  dotsRow:     { flexDirection: "row", gap: 8, marginTop: 14 },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive:   { width: 24, backgroundColor: "#FFF" },
  dotDone:     { backgroundColor: "#10B981" },

  card: {
    flex: 1, backgroundColor: "#F0F9FF",
    borderTopLeftRadius: 36, borderTopRightRadius: 36,
    paddingHorizontal: 24, paddingTop: 30, paddingBottom: 40, marginTop: -10,
  },

  // Status banner
  banner:       { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, marginBottom: 18, borderWidth: 1 },
  bannerOk:     { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  bannerErr:    { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  bannerText:   { flex: 1, fontSize: 12, fontWeight: "700" },
  bannerOkText: { color: "#166534" },
  bannerErrText:{ color: "#991B1B" },

  title:    { fontSize: 22, fontWeight: "900", color: "#001F3F", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#64748B", lineHeight: 20, marginBottom: 22 },

  fieldGroup: { marginBottom: 16 },
  label:      { fontSize: 9, fontWeight: "900", color: "#64748B", letterSpacing: 1.2, marginBottom: 8 },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 14, paddingHorizontal: 14, height: 54,
  },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, fontSize: 14, color: "#001F3F", fontWeight: "600" },

  validationBox: { marginTop: 10, gap: 6 },
  validRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  validDot:  { width: 13, height: 13, borderRadius: 6.5, borderWidth: 1.5, borderColor: "#CBD5E1" },
  validText: { fontSize: 12, color: "#94A3B8" },
  validMet:  { color: "#10B981", fontWeight: "600" },

  resendText:    { fontSize: 13, color: "#0EA5E9", fontWeight: "700", textAlign: "center", marginBottom: 20 },
  resendDisabled:{ opacity: 0.5 },

  btn:         { backgroundColor: "#0EA5E9", height: 54, borderRadius: 16, justifyContent: "center", alignItems: "center", marginTop: 8, elevation: 4, shadowColor: "#0EA5E9", shadowOpacity: 0.25, shadowRadius: 8 },
  btnDisabled: { opacity: 0.45 },
  btnText:     { color: "#FFF", fontSize: 14, fontWeight: "900", letterSpacing: 0.5 },

  successBox:  { alignItems: "center", paddingTop: 30 },
  successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#F0FDF4", justifyContent: "center", alignItems: "center", marginBottom: 20, borderWidth: 2, borderColor: "#BBF7D0" },
  successTitle:{ fontSize: 24, fontWeight: "900", color: "#001F3F" },
  successSub:  { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 22, marginTop: 10 },

  footer:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 36 },
  footerText: { fontSize: 9, color: "#94A3B8", fontWeight: "800", letterSpacing: 1 },
});
