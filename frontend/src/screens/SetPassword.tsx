import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../services/authService";

// Three steps:
//  1 → Enter phone number → request OTP
//  2 → Enter OTP
//  3 → Enter new password + confirm
type Step = "phone" | "otp" | "password";

const SetPassword = ({ navigation }: any) => {
  const [step, setStep] = useState<Step>("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP resend countdown (60s)
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // OTP input refs for auto-focus
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Auto-hide status message after 4 s
  useEffect(() => {
    if (statusMessage) {
      const t = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [statusMessage]);

  // Countdown for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [resendTimer]);

  // Password validation helpers
  const isMinLength = newPassword.length >= 5;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";
  const otpValue = otp.join("");

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleMobileChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 10) setMobile(cleaned);
  };

  /** Step 1 → request OTP */
  const handleRequestOtp = async () => {
    setStatusMessage(null);
    if (mobile.length !== 10) {
      setStatusMessage({ type: "error", text: "Please enter a valid 10-digit mobile number." });
      return;
    }
    setIsLoading(true);
    try {
      await authService.generateOtp(mobile);
      setResendTimer(60);
      setStep("otp");
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message === "NETWORK_ERROR"
          ? "Network Error: Unable to reach servers."
          : err.message || "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /** OTP digit input handler with auto-advance */
  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  /** Backspace goes back to previous OTP box */
  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  /** Step 2 → advance to password entry (OTP will be verified on final submit) */
  const handleOtpContinue = () => {
    if (otpValue.length !== 6) {
      setStatusMessage({ type: "error", text: "Please enter the complete 6-digit OTP." });
      return;
    }
    setStep("password");
  };

  /** Step 3 → submit everything to backend */
  const handleSetPassword = async () => {
    setStatusMessage(null);
    if (!isMinLength || !hasUppercase) {
      setStatusMessage({ type: "error", text: "Password must meet all security criteria." });
      return;
    }
    if (!passwordsMatch) {
      setStatusMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(mobile, otpValue, newPassword, confirmPassword);
      setStatusMessage({ type: "success", text: "Password updated. Redirecting to login..." });
      setTimeout(() => {
        setIsLoading(false);
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      setStatusMessage({
        type: "error",
        text: err.message === "NETWORK_ERROR"
          ? "Network Error: Unable to reach servers."
          : err.message || "Failed to reset password. OTP may have expired.",
      });
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      await authService.generateOtp(mobile);
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
      setStatusMessage({ type: "success", text: "New OTP sent successfully." });
    } catch {
      setStatusMessage({ type: "error", text: "Failed to resend OTP. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStatusMessage(null);
    if (step === "phone") navigation.goBack();
    else if (step === "otp") setStep("phone");
    else setStep("otp");
  };

  // ── Sub-components ─────────────────────────────────────────────────────────

  const StatusBanner = () =>
    statusMessage ? (
      <View
        style={[
          styles.statusBanner,
          statusMessage.type === "error" ? styles.errorBanner : styles.successBanner,
        ]}
      >
        {statusMessage.type === "error" ? (
          <AlertCircle size={18} color="#EF4444" />
        ) : (
          <CheckCircle2 size={18} color="#10B981" />
        )}
        <Text
          style={[
            styles.statusText,
            statusMessage.type === "error" ? styles.errorText : styles.successText,
          ]}
        >
          {statusMessage.text}
        </Text>
      </View>
    ) : null;

  const ValidationItem = ({ label, met }: { label: string; met: boolean }) => (
    <View style={styles.validationRow}>
      {met ? <CheckCircle2 size={14} color="#10B981" /> : <XCircle size={14} color="#CBD5E1" />}
      <Text style={[styles.validationText, met && styles.validationTextMet]}>{label}</Text>
    </View>
  );

  // Step progress indicator
  const steps: Step[] = ["phone", "otp", "password"];
  const currentStepIndex = steps.indexOf(step);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.brandingSection}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft color="#FFF" size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logoInner}>
                <Lock size={32} color="#001F3F" strokeWidth={2.5} />
              </View>
            </View>
            <Text style={styles.brandName}>Security</Text>
            <Text style={styles.brandSub}>RESET ACCESS CREDENTIALS</Text>

            {/* Step progress dots */}
            <View style={styles.progressRow}>
              {steps.map((s, i) => (
                <View
                  key={s}
                  style={[
                    styles.progressDot,
                    i <= currentStepIndex && styles.progressDotActive,
                    i < currentStepIndex && styles.progressDotDone,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.formContainer}>
            <StatusBanner />

            {/* ── STEP 1: Phone ── */}
            {step === "phone" && (
              <>
                <View style={styles.headerTextGroup}>
                  <Text style={styles.welcomeTitle}>Forgot Password?</Text>
                  <Text style={styles.welcomeSub}>Enter your registered mobile number to receive an OTP.</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>REGISTERED MOBILE</Text>
                  <View style={styles.inputWrapper}>
                    <Smartphone size={20} color="#001F3F" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="10-digit mobile number"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={mobile}
                      onChangeText={handleMobileChange}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                  onPress={handleRequestOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>SEND OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === "otp" && (
              <>
                <View style={styles.headerTextGroup}>
                  <Text style={styles.welcomeTitle}>Enter OTP</Text>
                  <Text style={styles.welcomeSub}>
                    A 6-digit OTP was sent for{"\n"}
                    <Text style={{ color: "#0EA5E9", fontWeight: "800" }}>+91 {mobile}</Text>
                  </Text>
                </View>

                {/* OTP Boxes */}
                <View style={styles.otpRow}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={(r) => (otpRefs.current[i] = r)}
                      style={[styles.otpBox, digit !== "" && styles.otpBoxFilled]}
                      value={digit}
                      onChangeText={(t) => handleOtpChange(t, i)}
                      onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      autoFocus={i === 0}
                    />
                  ))}
                </View>

                {/* Resend */}
                <TouchableOpacity
                  style={[styles.resendBtn, resendTimer > 0 && { opacity: 0.5 }]}
                  onPress={handleResendOtp}
                  disabled={resendTimer > 0 || isLoading}
                >
                  <Text style={styles.resendText}>
                    {resendTimer > 0
                      ? `Resend OTP in ${resendTimer}s`
                      : "Didn't receive? Resend OTP"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitButton, (isLoading || otpValue.length !== 6) && { opacity: 0.6 }]}
                  onPress={handleOtpContinue}
                  disabled={isLoading || otpValue.length !== 6}
                >
                  <Text style={styles.submitButtonText}>VERIFY OTP</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 3: New Password ── */}
            {step === "password" && (
              <>
                <View style={styles.headerTextGroup}>
                  <Text style={styles.welcomeTitle}>Set New Password</Text>
                  <Text style={styles.welcomeSub}>Choose a strong password for your account.</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NEW PASSWORD</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="#0EA5E9" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#CBD5E1"
                      secureTextEntry={!showPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff size={20} color="#94A3B8" />
                      ) : (
                        <Eye size={20} color="#94A3B8" />
                      )}
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
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#CBD5E1"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                  onPress={handleSetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>UPDATE PASSWORD</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Footer badge */}
            <View style={styles.footerLinks}>
              <View style={styles.encryptionBadge}>
                <ShieldCheck size={14} color="#94A3B8" />
                <Text style={styles.encryptionText}>AES-256 BIT ENCRYPTION ENABLED</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#001F3F" },
  brandingSection: {
    height: 210,
    backgroundColor: "#001F3F",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: { position: "absolute", top: 20, left: 20, padding: 10, zIndex: 10 },
  logoContainer: {
    width: 70, height: 70,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 22,
    justifyContent: "center", alignItems: "center",
    marginBottom: 8,
  },
  logoInner: {
    width: 50, height: 50,
    backgroundColor: "#FFF",
    borderRadius: 15,
    justifyContent: "center", alignItems: "center",
  },
  brandName: { color: "#FFF", fontSize: 22, fontWeight: "900" },
  brandSub: { color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: "800", letterSpacing: 1.5, marginTop: 2 },
  progressRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  progressDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressDotActive: { backgroundColor: "#FFF", width: 24 },
  progressDotDone: { backgroundColor: "#10B981", width: 8 },
  formContainer: {
    flex: 1, backgroundColor: "#F0F9FF",
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 25, paddingTop: 35, paddingBottom: 30,
    marginTop: -10,
  },
  headerTextGroup: { marginBottom: 24 },
  welcomeTitle: { fontSize: 24, fontWeight: "900", color: "#001F3F" },
  welcomeSub: { fontSize: 13, color: "#64748B", marginTop: 4, fontWeight: "500", lineHeight: 20 },
  statusBanner: {
    flexDirection: "row", alignItems: "center",
    padding: 14, borderRadius: 16, marginBottom: 20, gap: 12,
    borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  successBanner: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  errorBanner: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  statusText: { fontSize: 13, fontWeight: "700", flex: 1 },
  successText: { color: "#166534" },
  errorText: { color: "#991B1B" },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 10, fontWeight: "800", color: "#64748B", marginBottom: 8, letterSpacing: 1 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 16, paddingHorizontal: 16, height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: "#001F3F", fontWeight: "600" },
  validationContainer: { marginTop: 10, paddingLeft: 4, gap: 5 },
  validationRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  validationText: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
  validationTextMet: { color: "#10B981" },

  // OTP boxes
  otpRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 20 },
  otpBox: {
    width: 46, height: 56,
    borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0",
    backgroundColor: "#FFF", fontSize: 20, fontWeight: "900", color: "#001F3F",
  },
  otpBoxFilled: { borderColor: "#0EA5E9", backgroundColor: "#F0F9FF" },

  resendBtn: { alignSelf: "center", marginBottom: 24 },
  resendText: { fontSize: 13, color: "#0EA5E9", fontWeight: "700" },

  submitButton: {
    backgroundColor: "#0EA5E9", height: 58, borderRadius: 18,
    justifyContent: "center", alignItems: "center", marginTop: 20,
    elevation: 6, shadowColor: "#0EA5E9", shadowOpacity: 0.3, shadowRadius: 8,
  },
  submitButtonText: { color: "#FFF", fontSize: 14, fontWeight: "800", letterSpacing: 1 },
  footerLinks: { alignItems: "center", marginTop: 40 },
  encryptionBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  encryptionText: { fontSize: 10, color: "#94A3B8", fontWeight: "800", letterSpacing: 1.2 },
});

export default SetPassword;
