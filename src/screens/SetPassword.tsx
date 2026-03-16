import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  KeyRound,
  Lock,
  ShieldCheck,
  Smartphone,
  XCircle
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

const SetPassword = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    mobile: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const isMinLength = formData.newPassword.length >= 5;
  const hasUppercase = /[A-Z]/.test(formData.newPassword);
  const passwordsMatch =
    formData.newPassword === formData.confirmPassword &&
    formData.confirmPassword !== "";

  const handleMobileChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 10) setFormData({ ...formData, mobile: cleaned });
  };

  const handleNext = () => {
    setStatusMessage(null);
    if (step === 1 && formData.mobile.length !== 10) {
      setStatusMessage({
        type: "error",
        text: "Security Alert: Please enter a valid 10-digit mobile number.",
      });
      return;
    }
    if (step === 3) {
      if (!isMinLength || !hasUppercase) {
        setStatusMessage({
          type: "error",
          text: "Validation Failed: Password must meet all security criteria.",
        });
        return;
      }
      if (!passwordsMatch) {
        setStatusMessage({
          type: "error",
          text: "Mismatch: The passwords provided do not match.",
        });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSetPassword = async () => {
    setIsLoading(true);
    try {
      await authService.resetPassword(
        formData.mobile,
        formData.newPassword,
        formData.confirmPassword,
      );
      setStatusMessage({
        type: "success",
        text: "Credentials updated. Redirecting to secure login...",
      });
      setTimeout(() => {
        setIsLoading(false);
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }, 2500);
    } catch (error: any) {
      setIsLoading(false);
      setStatusMessage({
        type: "error",
        text: error.message || "Authorization failed.",
      });
    }
  };

  const ValidationItem = ({ label, met }: { label: string; met: boolean }) => (
    <View style={styles.validationRow}>
      {met ? (
        <CheckCircle2 size={14} color="#10B981" />
      ) : (
        <XCircle size={14} color="#CBD5E1" />
      )}
      <Text style={[styles.validationText, met && styles.validationTextMet]}>
        {label}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandingSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                step > 1 ? setStep(step - 1) : navigation.goBack()
              }
            >
              <ArrowLeft color="#FFF" size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logoInner}>
                {step === 1 ? (
                  <Smartphone size={32} color="#001F3F" />
                ) : step === 2 ? (
                  <KeyRound size={32} color="#001F3F" />
                ) : (
                  <Lock size={32} color="#001F3F" />
                )}
              </View>
            </View>
            <Text style={styles.brandName}>Step {step} of 3</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.welcomeTitle}>
                {step === 1
                  ? "Set Password"
                  : step === 2
                    ? "Verify OTP"
                    : "New Password"}
              </Text>
            </View>

            {statusMessage && (
              <View
                style={[
                  styles.statusBanner,
                  statusMessage.type === "error"
                    ? styles.errorBanner
                    : styles.successBanner,
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
                    statusMessage.type === "error"
                      ? styles.errorText
                      : styles.successText,
                  ]}
                >
                  {statusMessage.text}
                </Text>
              </View>
            )}

            {step === 1 && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  REGISTERED MOBILE <Text style={{ color: "#EF4444" }}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Smartphone
                    size={20}
                    color="#001F3F"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="10-digit number"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={formData.mobile}
                    onChangeText={handleMobileChange}
                  />
                </View>
              </View>
            )}

            {step === 2 && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  VERIFICATION CODE <Text style={{ color: "#EF4444" }}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <KeyRound
                    size={20}
                    color="#001F3F"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit OTP"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={formData.otp}
                    onChangeText={(v) => setFormData({ ...formData, otp: v })}
                  />
                </View>
              </View>
            )}

            {step === 3 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    NEW PASSWORD <Text style={{ color: "#EF4444" }}>*</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="#0EA5E9" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      secureTextEntry={!showPassword}
                      value={formData.newPassword}
                      onChangeText={(t) =>
                        setFormData({ ...formData, newPassword: t })
                      }
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Eye size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                  <ValidationItem
                    label="Minimum 5 characters"
                    met={isMinLength}
                  />
                  <ValidationItem
                    label="One uppercase letter (A-Z)"
                    met={hasUppercase}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    CONFIRM PASSWORD <Text style={{ color: "#EF4444" }}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      passwordsMatch && { borderColor: "#10B981" },
                    ]}
                  >
                    <ShieldCheck
                      size={20}
                      color="#0EA5E9"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      secureTextEntry
                      value={formData.confirmPassword}
                      onChangeText={(t) =>
                        setFormData({ ...formData, confirmPassword: t })
                      }
                    />
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={step < 3 ? handleNext : handleSetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {step === 3 ? "UPDATE CREDENTIALS" : "CONTINUE"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#001F3F" },
  brandingSection: {
    height: 180,
    backgroundColor: "#001F3F",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  logoContainer: {
    width: 70,
    height: 70,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  logoInner: {
    width: 50,
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  brandName: { color: "#FFF", fontSize: 22, fontWeight: "900" },
  formContainer: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 35,
    paddingBottom: 30,
    marginTop: -10,
  },
  headerTextGroup: { marginBottom: 20 },
  welcomeTitle: { fontSize: 24, fontWeight: "900", color: "#001F3F" },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
  },
  successBanner: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  errorBanner: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  statusText: { fontSize: 13, fontWeight: "700", flex: 1 },
  successText: { color: "#166534" },
  errorText: { color: "#991B1B" },
  inputGroup: { marginBottom: 18 },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: "#001F3F", fontWeight: "600" },
  validationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  validationText: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
  validationTextMet: { color: "#10B981" },
  submitButton: {
    backgroundColor: "#0EA5E9",
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 6,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
});

export default SetPassword;
