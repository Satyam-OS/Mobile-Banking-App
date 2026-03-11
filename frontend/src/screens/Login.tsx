import {
  ArrowRight, Eye, EyeOff, Fingerprint, Info, Lock, ShieldCheck, Smartphone,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../services/authService";

const Login = ({ navigation }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ mobile: "", password: "" });
  const [formData, setFormData] = useState({ mobile: "", password: "" });
  const [apiError, setApiError] = useState("");

  const handleMobileChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 10) {
      setFormData({ ...formData, mobile: cleaned });
      if (errors.mobile) setErrors({ ...errors, mobile: "" });
      if (apiError) setApiError("");
    }
  };

  const handlePasswordChange = (text: string) => {
    setFormData({ ...formData, password: text });
    if (errors.password) setErrors({ ...errors, password: "" });
    if (apiError) setApiError("");
  };

  const handleSubmit = async () => {
    let mobileError = "";
    let passwordError = "";

    if (!formData.mobile) mobileError = "Mobile number is required";
    else if (formData.mobile.length !== 10) mobileError = "Enter a valid 10-digit number";
    if (!formData.password) passwordError = "Password is required";

    if (mobileError || passwordError) {
      setErrors({ mobile: mobileError, password: passwordError });
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const response = await authService.login({
        mobile: formData.mobile,
        password: formData.password,
      });

      const role = (response.role || "USER").toUpperCase();
      if (role === "ADMIN") {
        navigation.replace("AdminDashboard");
      } else {
        navigation.replace("Dashboard");
      }
    } catch (e: any) {
      const msg = e.message || "";
      if (msg === "NETWORK_ERROR") {
        setApiError("Network error. The server may be waking up — please try again in a moment.");
      } else if (msg === "SERVER_ERROR") {
        setApiError("Server error. Please try again.");
      } else if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("incorrect") || msg.toLowerCase().includes("wrong")) {
        setErrors({ mobile: "", password: "Incorrect mobile or password" });
      } else if (msg === "Invalid credentials" || msg === "Invalid login response") {
        setErrors({ mobile: "", password: "Incorrect mobile or password" });
      } else {
        setErrors({ mobile: "", password: msg || "Login failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false}>

          {/* Branding */}
          <View style={styles.brandingSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoInner}>
                <ShieldCheck size={32} color="#001F3F" strokeWidth={2.5} />
              </View>
            </View>
            <Text style={styles.brandName}>Nexus Bank</Text>
            <View style={styles.brandBadge}>
              <Text style={styles.brandSub}>INSTITUTIONAL GRADE SECURITY</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.welcomeTitle}>Secure Login</Text>
              <Text style={styles.welcomeSub}>Enter your credentials to access the portal</Text>
            </View>

            {/* API Error Banner */}
            {apiError ? (
              <View style={styles.apiBanner}>
                <Text style={styles.apiBannerText}>⚠️ {apiError}</Text>
              </View>
            ) : null}

            {/* Mobile */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, !!errors.mobile && { color: "#EF4444" }]}>
                  REGISTERED MOBILE NUMBER{errors.mobile ? " *" : ""}
                </Text>
                {errors.mobile ? <Text style={styles.errorTextInline}>{errors.mobile}</Text> : null}
              </View>
              <View style={[styles.inputWrapper, !!errors.mobile && { borderColor: "#EF4444" }]}>
                <Smartphone size={20} color={errors.mobile ? "#EF4444" : "#001F3F"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  value={formData.mobile}
                  onChangeText={handleMobileChange}
                  maxLength={10}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, !!errors.password && { color: "#EF4444" }]}>
                  ACCOUNT PASSWORD{errors.password ? " *" : ""}
                </Text>
                {errors.password ? <Text style={styles.errorTextInline}>{errors.password}</Text> : null}
              </View>
              <View style={[styles.inputWrapper, !!errors.password && { borderColor: "#EF4444" }]}>
                <Lock size={20} color={errors.password ? "#EF4444" : "#0EA5E9"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={handlePasswordChange}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember + Forgot */}
            <View style={styles.forgotRow}>
              <TouchableOpacity style={styles.checkboxArea} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.checkboxLabel}>Remember Device</Text>
              </TouchableOpacity>
              <View style={styles.rightActionGroup}>
                <TouchableOpacity onPress={() => navigation.navigate("SetPassword")}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.setPasswordBtn} onPress={() => navigation.navigate("SetPassword")}>
                  <Text style={styles.setPasswordText}>Set Password</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.loginButton, isLoading && { backgroundColor: "#1E293B" }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>AUTHORIZE LOGIN</Text>
                    <ArrowRight size={18} color="#FFF" />
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.bioButton} onPress={() => Alert.alert("Biometric", "Initializing secure scanner...")}>
                <Fingerprint size={28} color="#0EA5E9" />
              </TouchableOpacity>
            </View>

            {/* Footer links */}
            <View style={styles.footerLinks}>
              <TouchableOpacity style={styles.guestButton} onPress={() => navigation.navigate("GuestExplore")}>
                <Info size={16} color="#64748B" />
                <Text style={styles.guestTextLabel}>New to Nexus? </Text>
                <Text style={styles.exploreText}>EXPLORE BENEFITS</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.registerBtn}>
                <Text style={styles.registerText}>
                  Don't have an account? <Text style={styles.boldBlue}>Apply Now</Text>
                </Text>
              </TouchableOpacity>
            </View>

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
  brandingSection: { height: 240, backgroundColor: "#001F3F", justifyContent: "center", alignItems: "center" },
  logoContainer: { width: 90, height: 90, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 30, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", marginBottom: 15 },
  logoInner: { width: 65, height: 65, backgroundColor: "#FFF", borderRadius: 22, justifyContent: "center", alignItems: "center", elevation: 5 },
  brandName: { color: "#FFF", fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  brandBadge: { marginTop: 10, backgroundColor: "rgba(0,0,0,0.15)", paddingHorizontal: 15, paddingVertical: 6, borderRadius: 12 },
  brandSub: { color: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  formContainer: { flex: 1, backgroundColor: "#F0F9FF", borderTopLeftRadius: 45, borderTopRightRadius: 45, paddingHorizontal: 30, paddingTop: 45, paddingBottom: 30, marginTop: -20 },
  headerTextGroup: { marginBottom: 30 },
  welcomeTitle: { fontSize: 28, fontWeight: "900", color: "#001F3F", letterSpacing: -0.5 },
  welcomeSub: { fontSize: 15, color: "#64748B", marginTop: 6, fontWeight: "500" },
  apiBanner: { backgroundColor: "#FEF9C3", borderWidth: 1, borderColor: "#FDE047", borderRadius: 16, padding: 14, marginBottom: 20 },
  apiBannerText: { color: "#854D0E", fontWeight: "700", fontSize: 13 },
  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  label: { fontSize: 11, fontWeight: "800", color: "#64748B", letterSpacing: 1 },
  errorTextInline: { fontSize: 11, color: "#EF4444", fontWeight: "700" },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 20, paddingHorizontal: 18, height: 62 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: "#001F3F", fontWeight: "600" },
  eyeBtn: { padding: 5 },
  forgotRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 35, paddingHorizontal: 5 },
  checkboxArea: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 22, height: 22, borderRadius: 8, borderWidth: 2, borderColor: "#CBD5E1", marginRight: 10, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  checkboxChecked: { backgroundColor: "#0EA5E9", borderColor: "#0EA5E9" },
  checkboxInner: { width: 10, height: 10, backgroundColor: "#FFF", borderRadius: 2 },
  checkboxLabel: { fontSize: 14, color: "#475569", fontWeight: "600" },
  rightActionGroup: { alignItems: "flex-end" },
  forgotText: { fontSize: 14, color: "#0EA5E9", fontWeight: "800" },
  setPasswordBtn: { marginTop: 5 },
  setPasswordText: { fontSize: 14, color: "#0EA5E9", fontWeight: "700" },
  buttonRow: { flexDirection: "row", gap: 12, marginBottom: 40 },
  loginButton: { flex: 1, backgroundColor: "#001F3F", height: 64, borderRadius: 22, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, elevation: 8 },
  loginButtonText: { color: "#FFF", fontSize: 15, fontWeight: "800", letterSpacing: 1 },
  bioButton: { width: 64, height: 64, borderRadius: 22, backgroundColor: "#FFF", borderWidth: 1.5, borderColor: "#E2E8F0", justifyContent: "center", alignItems: "center" },
  footerLinks: { alignItems: "center", gap: 20 },
  guestButton: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(14,165,233,0.08)", paddingVertical: 14, paddingHorizontal: 25, borderRadius: 18, gap: 8, borderWidth: 1, borderColor: "rgba(14,165,233,0.1)" },
  guestTextLabel: { color: "#64748B", fontWeight: "600", fontSize: 14 },
  exploreText: { color: "#0EA5E9", fontWeight: "800", fontSize: 14 },
  registerBtn: { marginTop: 5 },
  registerText: { fontSize: 15, color: "#64748B", fontWeight: "500" },
  boldBlue: { color: "#0EA5E9", fontWeight: "800" },
  encryptionBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 50 },
  encryptionText: { fontSize: 10, color: "#94A3B8", fontWeight: "800", letterSpacing: 1.2 },
});

export default Login;
