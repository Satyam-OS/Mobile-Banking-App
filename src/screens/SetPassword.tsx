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

const SetPassword = ({ navigation }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    mobile: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Auto-hide notification after 4 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Validation Logic
  const isMinLength = formData.newPassword.length >= 5;
  const hasUppercase = /[A-Z]/.test(formData.newPassword);
  const passwordsMatch =
    formData.newPassword === formData.confirmPassword &&
    formData.confirmPassword !== "";

  const handleMobileChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 10) {
      setFormData({ ...formData, mobile: cleaned });
    }
  };

  const handleSetPassword = async () => {
    setStatusMessage(null);

    if (formData.mobile.length !== 10) {
      setStatusMessage({
        type: "error",
        text: "Security Alert: Please enter a valid 10-digit mobile number.",
      });
      return;
    }
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

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://mobile-banking-app.onrender.com/auth/reset-password",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({
            mobile: formData.mobile,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
          }),
        },
      );

      // Read as text first to avoid crash if backend sends non-JSON
      const responseText = await response.text();
      let result: any = {};
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = { message: responseText };
      }

      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: "Credentials updated. Redirecting to secure login...",
        });
        setTimeout(() => {
          setIsLoading(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        }, 2500);
      } else {
        setIsLoading(false);
        setStatusMessage({
          type: "error",
          text:
            result.message ||
            "Authorization failed: Invalid mobile or session expired.",
        });
      }
    } catch (error) {
      setIsLoading(false);
      setStatusMessage({
        type: "error",
        text: "Network Error: Unable to reach secure servers.",
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
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft color="#FFF" size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logoInner}>
                <Lock size={32} color="#001F3F" strokeWidth={2.5} />
              </View>
            </View>
            <Text style={styles.brandName}>Security </Text>
            <Text style={styles.brandSub}>UPDATE ACCESS CREDENTIALS</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.welcomeTitle}>Set Password</Text>
              <Text style={styles.welcomeSub}>Update your credentials</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>REGISTERED MOBILE</Text>
              <View style={styles.inputWrapper}>
                <Smartphone
                  size={20}
                  color="#001F3F"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={formData.mobile}
                  onChangeText={handleMobileChange}
                />
              </View>
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
                  value={formData.newPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, newPassword: text })
                  }
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#94A3B8" />
                  ) : (
                    <Eye size={20} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.validationContainer}>
                <ValidationItem
                  label="Minimum 5 characters"
                  met={isMinLength}
                />
                <ValidationItem
                  label="One uppercase letter (A-Z)"
                  met={hasUppercase}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
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
                  placeholderTextColor="#CBD5E1"
                  secureTextEntry
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, confirmPassword: text })
                  }
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
                <Text style={styles.submitButtonText}>UPDATE CREDENTIALS</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerLinks}>
              <View style={styles.encryptionBadge}>
                <ShieldCheck size={14} color="#94A3B8" />
                <Text style={styles.encryptionText}>
                  AES-256 BIT ENCRYPTION ENABLED
                </Text>
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
  brandSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 2,
  },
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
  welcomeSub: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
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
  validationContainer: { marginTop: 10, paddingLeft: 4, gap: 5 },
  validationRow: { flexDirection: "row", alignItems: "center", gap: 8 },
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
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  footerLinks: { alignItems: "center", marginTop: 40 },
  encryptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  encryptionText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "800",
    letterSpacing: 1.2,
  },
});

export default SetPassword;
