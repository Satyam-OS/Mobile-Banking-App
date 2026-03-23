import {
  AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff,
  Lock, ShieldCheck, Smartphone, XCircle,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../services/authService";

// Four steps:
//  phone    → enter mobile, request OTP
//  otp      → enter OTP (6 digits)
//  otpOk    → OTP verified successfully — brief success screen
//  password → set new password
type Step = "phone" | "otp" | "otpOk" | "password";

const SetPassword = ({ navigation }: any) => {
  const [step,         setStep]         = useState<Step>("phone");
  const [isLoading,    setIsLoading]    = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [statusMsg,    setStatusMsg]    = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [mobile,          setMobile]          = useState("");
  const [otp,             setOtp]             = useState(["", "", "", "", "", ""]);
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendTimer,     setResendTimer]     = useState(0);

  const otpRefs  = useRef<(TextInput | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const isMinLength   = newPassword.length >= 5;
  const hasUppercase  = /[A-Z]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";
  const otpValue      = otp.join("");

  const handleMobileChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 10) setMobile(cleaned);
  };

  // ── Step 1: Request OTP ────────────────────────────────────────────────
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
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message === "NETWORK_ERROR" ? "Network Error: Unable to reach servers." : err.message || "Failed to send OTP.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP immediately ─────────────────────────────────────
  const handleVerifyOtp = async () => {
    setStatusMsg(null);
    if (otpValue.length !== 6) {
      setStatusMsg({ type: "error", text: "Please enter the complete 6-digit OTP." });
      return;
    }
    setIsLoading(true);
    try {
      // Call verifyOtp directly — backend checks validity, expiry, and marks as used
      await authService.verifyOtp(mobile, otpValue);
      // OTP is valid → show success screen briefly then go to password
      setStep("otpOk");
      setTimeout(() => setStep("password"), 2000);
    } catch (err: any) {
      // OTP wrong, expired, or already used
      const msg = err.message === "NETWORK_ERROR"
        ? "Network Error: Unable to reach servers."
        : err.message || "Invalid or expired OTP. Please try again.";
      setStatusMsg({ type: "error", text: msg });
      // Clear OTP boxes so user can re-enter
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const digit   = text.replace(/[^0-9]/g, "").slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      await authService.generateOtp(mobile);
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
      setStatusMsg({ type: "success", text: "New OTP sent successfully." });
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch {
      setStatusMsg({ type: "error", text: "Failed to resend OTP. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 4: Submit new password ────────────────────────────────────────
  const handleSetPassword = async () => {
    setStatusMsg(null);
    if (!isMinLength || !hasUppercase) {
      setStatusMsg({ type: "error", text: "Password must meet all security criteria." });
      return;
    }
    if (!passwordsMatch) {
      setStatusMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    setIsLoading(true);
    try {
      // OTP was already verified in step 2 — the backend verifyOtp marked it used.
      // For resetPassword, backend checks OTP again (or uses verified session).
      // We pass the same OTP value since the backend validates it on reset too.
      await authService.resetPassword(mobile, otpValue, newPassword, confirmPassword);
      setStatusMsg({ type: "success", text: "Password updated. Redirecting to login..." });
      setTimeout(() => {
        setIsLoading(false);
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      setStatusMsg({
        type: "error",
        text: err.message === "NETWORK_ERROR"
          ? "Network Error: Unable to reach servers."
          : err.message || "Failed to reset password.",
      });
    }
  };

  const handleBack = () => {
    setStatusMsg(null);
    if (step === "phone")    navigation.goBack();
    else if (step === "otp") setStep("phone");
    else if (step === "password") setStep("otp");
  };

  // ── Progress dots ───────────────────────────────────────────────────────
  const stepIndex = { phone: 0, otp: 1, otpOk: 2, password: 2 }[step];

  const ValidationItem = ({ label, met }: { label: string; met: boolean }) => (
    <View style={styles.validationRow}>
      {met ? <CheckCircle2 size={14} color="#10B981" /> : <XCircle size={14} color="#CBD5E1" />}
      <Text style={[styles.validationText, met && styles.validationTextMet]}>{label}</Text>
    </View>
  );

  const StatusBanner = () => statusMsg ? (
    <View style={[styles.statusBanner, statusMsg.type === "error" ? styles.errorBanner : styles.successBanner]}>
      {statusMsg.type === "error" ? <AlertCircle size={18} color="#EF4444" /> : <CheckCircle2 size={18} color="#10B981" />}
      <Text style={[styles.statusText, statusMsg.type === "error" ? styles.errorText : styles.successText]}>{statusMsg.text}</Text>
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.brandingSection}>
            {step !== "otpOk" && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <ArrowLeft color="#FFF" size={24} />
              </TouchableOpacity>
            )}
            <View style={styles.logoContainer}>
              <View style={styles.logoInner}>
                <Lock size={32} color="#001F3F" strokeWidth={2.5} />
              </View>
            </View>
            <Text style={styles.brandName}>Security</Text>
            <Text style={styles.brandSub}>RESET ACCESS CREDENTIALS</Text>
            <View style={styles.progressRow}>
              {[0, 1, 2].map(i => (
                <View key={i} style={[
                  styles.progressDot,
                  i < stepIndex  && styles.progressDotDone,
                  i === stepIndex && styles.progressDotActive,
                ]} />
              ))}
            </View>
          </View>

          <View style={styles.formContainer}>
            <StatusBanner />

            {/* ── STEP 1: Phone ── */}
            {step === "phone" && (
              <>
                <View style={styles.headerGroup}>
                  <Text style={styles.title}>Forgot Password?</Text>
                  <Text style={styles.subtitle}>Enter your registered mobile number to receive an OTP.</Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>REGISTERED MOBILE</Text>
                  <View style={styles.inputWrapper}>
                    <Smartphone size={20} color="#001F3F" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input} keyboardType="number-pad" maxLength={10}
                      placeholder="10-digit mobile number" placeholderTextColor="#94A3B8"
                      value={mobile} onChangeText={handleMobileChange}
                    />
                  </View>
                </View>
                <TouchableOpacity style={[styles.submitBtn, isLoading && { opacity: 0.7 }]} onPress={handleRequestOtp} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>SEND OTP</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 2: OTP Entry ── */}
            {step === "otp" && (
              <>
                <View style={styles.headerGroup}>
                  <Text style={styles.title}>Enter OTP</Text>
                  <Text style={styles.subtitle}>
                    A 6-digit OTP was sent for{"\n"}
                    <Text style={{ color: "#0EA5E9", fontWeight: "800" }}>+91 {mobile}</Text>
                  </Text>
                </View>
                <View style={styles.otpRow}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i} ref={r => (otpRefs.current[i] = r)}
                      style={[styles.otpBox, digit !== "" && styles.otpBoxFilled]}
                      value={digit} onChangeText={t => handleOtpChange(t, i)}
                      onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                      keyboardType="number-pad" maxLength={1} textAlign="center"
                      autoFocus={i === 0}
                    />
                  ))}
                </View>
                <TouchableOpacity style={[styles.resendBtn, resendTimer > 0 && { opacity: 0.5 }]} onPress={handleResendOtp} disabled={resendTimer > 0 || isLoading}>
                  <Text style={styles.resendText}>{resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Didn't receive? Resend OTP"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, (isLoading || otpValue.length !== 6) && { opacity: 0.6 }]}
                  onPress={handleVerifyOtp}
                  disabled={isLoading || otpValue.length !== 6}
                >
                  {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>VERIFY OTP</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP OTP SUCCESS ── */}
            {step === "otpOk" && (
              <View style={styles.otpSuccessContainer}>
                <View style={styles.otpSuccessIconBox}>
                  <CheckCircle2 size={64} color="#10B981" />
                </View>
                <Text style={styles.otpSuccessTitle}>OTP Verified!</Text>
                <Text style={styles.otpSuccessSubtitle}>
                  Your identity has been confirmed.{"\n"}Setting up your new password...
                </Text>
                <ActivityIndicator color="#0EA5E9" style={{ marginTop: 20 }} />
              </View>
            )}

            {/* ── STEP 4: New Password ── */}
            {step === "password" && (
              <>
                <View style={styles.headerGroup}>
                  <Text style={styles.title}>Set New Password</Text>
                  <Text style={styles.subtitle}>Choose a strong password for your account.</Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NEW PASSWORD</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="#0EA5E9" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input} secureTextEntry={!showPassword}
                      placeholder="••••••••" placeholderTextColor="#CBD5E1"
                      value={newPassword} onChangeText={setNewPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.validationContainer}>
                    <ValidationItem label="Minimum 5 characters" met={isMinLength} />
                    <ValidationItem label="One uppercase letter (A-Z)" met={hasUppercase} />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CONFIRM PASSWORD</Text>
                  <View style={[styles.inputWrapper, passwordsMatch && { borderColor: "#10B981" }]}>
                    <ShieldCheck size={20} color="#0EA5E9" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input} secureTextEntry
                      placeholder="••••••••" placeholderTextColor="#CBD5E1"
                      value={confirmPassword} onChangeText={setConfirmPassword}
                    />
                  </View>
                </View>
                <TouchableOpacity style={[styles.submitBtn, isLoading && { opacity: 0.7 }]} onPress={handleSetPassword} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>UPDATE PASSWORD</Text>}
                </TouchableOpacity>
              </>
            )}

            <View style={styles.footer}>
              <ShieldCheck size={14} color="#94A3B8" />
              <Text style={styles.footerText}>AES-256 BIT ENCRYPTION ENABLED</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SetPassword;

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#001F3F" },
  brandingSection:{ height: 210, backgroundColor: "#001F3F", justifyContent: "center", alignItems: "center" },
  backButton:     { position: "absolute", top: 20, left: 20, padding: 10, zIndex: 10 },
  logoContainer:  { width: 70, height: 70, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 22, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  logoInner:      { width: 50, height: 50, backgroundColor: "#FFF", borderRadius: 15, justifyContent: "center", alignItems: "center" },
  brandName:      { color: "#FFF", fontSize: 22, fontWeight: "900" },
  brandSub:       { color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: "800", letterSpacing: 1.5, marginTop: 2 },
  progressRow:    { flexDirection: "row", gap: 8, marginTop: 16 },
  progressDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.3)" },
  progressDotActive: { backgroundColor: "#FFF", width: 24 },
  progressDotDone:   { backgroundColor: "#10B981", width: 8 },
  formContainer:  { flex: 1, backgroundColor: "#F0F9FF", borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 25, paddingTop: 35, paddingBottom: 30, marginTop: -10 },
  statusBanner:   { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, marginBottom: 20, gap: 12, borderWidth: 1 },
  successBanner:  { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  errorBanner:    { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  statusText:     { fontSize: 13, fontWeight: "700", flex: 1 },
  successText:    { color: "#166534" },
  errorText:      { color: "#991B1B" },
  headerGroup:    { marginBottom: 24 },
  title:          { fontSize: 24, fontWeight: "900", color: "#001F3F" },
  subtitle:       { fontSize: 13, color: "#64748B", marginTop: 4, fontWeight: "500", lineHeight: 20 },
  inputGroup:     { marginBottom: 18 },
  label:          { fontSize: 10, fontWeight: "800", color: "#64748B", marginBottom: 8, letterSpacing: 1 },
  inputWrapper:   { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 16, paddingHorizontal: 16, height: 56 },
  inputIcon:      { marginRight: 12 },
  input:          { flex: 1, fontSize: 15, color: "#001F3F", fontWeight: "600" },
  validationContainer: { marginTop: 10, paddingLeft: 4, gap: 5 },
  validationRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  validationText: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
  validationTextMet: { color: "#10B981" },
  // OTP boxes
  otpRow:         { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 20 },
  otpBox:         { width: 46, height: 56, borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0", backgroundColor: "#FFF", fontSize: 20, fontWeight: "900", color: "#001F3F" },
  otpBoxFilled:   { borderColor: "#0EA5E9", backgroundColor: "#F0F9FF" },
  resendBtn:      { alignSelf: "center", marginBottom: 24 },
  resendText:     { fontSize: 13, color: "#0EA5E9", fontWeight: "700" },
  // OTP success screen
  otpSuccessContainer: { flex: 1, alignItems: "center", paddingTop: 40 },
  otpSuccessIconBox:   { width: 110, height: 110, borderRadius: 55, backgroundColor: "#F0FDF4", justifyContent: "center", alignItems: "center", marginBottom: 24, borderWidth: 2, borderColor: "#BBF7D0" },
  otpSuccessTitle:     { fontSize: 26, fontWeight: "900", color: "#001F3F", marginBottom: 12 },
  otpSuccessSubtitle:  { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 22 },
  // Submit button
  submitBtn:      { backgroundColor: "#0EA5E9", height: 58, borderRadius: 18, justifyContent: "center", alignItems: "center", marginTop: 20, elevation: 6, shadowColor: "#0EA5E9", shadowOpacity: 0.3, shadowRadius: 8 },
  submitBtnText:  { color: "#FFF", fontSize: 14, fontWeight: "800", letterSpacing: 1 },
  footer:         { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 40 },
  footerText:     { fontSize: 10, color: "#94A3B8", fontWeight: "800", letterSpacing: 1.2 },
});
