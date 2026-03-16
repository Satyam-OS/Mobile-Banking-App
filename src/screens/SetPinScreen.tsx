import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Smartphone,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SetPinScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    otp: "",
    pin: "",
    confirmPin: "",
  });

  // Updated Alert Helper to match the requested style
  const showAlert = (message: string) => {
    const title = "Security Alert";
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleUpdate = (key: string, value: string) => {
    if (["phone", "otp", "pin", "confirmPin"].includes(key)) {
      if (!/^\d*$/.test(value)) return;
    }
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.phone || formData.phone.length !== 10)
        return showAlert("Please enter a valid 10-digit mobile number.");
      if (!formData.password)
        return showAlert("Password is required to proceed.");
    } else if (step === 2) {
      if (!formData.otp || formData.otp.length < 6)
        return showAlert("Please enter the valid 6-digit OTP.");
    } else if (step === 3) {
      if (!formData.pin || formData.pin.length < 4)
        return showAlert("Please set your 4-digit PIN.");
    } else if (step === 4) {
      if (!formData.confirmPin)
        return showAlert("Please confirm your 4-digit PIN.");
      if (formData.pin !== formData.confirmPin)
        return showAlert("PINs do not match.");
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowValue(false);
      setStep(step + 1);
    }, 800);
  };

  if (step === 5) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <CheckCircle2 size={80} color="#10B981" />
        <Text style={[styles.title, { marginTop: 20 }]}>
          PIN Set Successfully
        </Text>
        <Text style={styles.subText}>
          Your security PIN is now active for all transactions.
        </Text>
        <TouchableOpacity
          style={[styles.submitBtn, { width: "80%", marginTop: 30 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.submitText}>GO TO DASHBOARD</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color="#002D72" />
          </TouchableOpacity>
          <View>
            <Text style={styles.stepIndicator}>Step {step} of 4</Text>
            <Text style={styles.title}>
              {step === 1
                ? "Identity"
                : step === 2
                  ? "OTP Verification"
                  : "Security PIN"}
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.progressWrapper}>
              {[1, 2, 3, 4].map((s) => (
                <View
                  key={s}
                  style={[
                    styles.progressLine,
                    step >= s && styles.progressActive,
                  ]}
                />
              ))}
            </View>

            {step === 1 && (
              <View style={styles.fadeContainer}>
                <View style={styles.iconCircle}>
                  <ShieldCheck size={32} color="#002D72" />
                </View>
                <Text style={styles.sectionTitle}>Verify Credentials</Text>
                <Text style={styles.sectionSub}>
                  All fields marked with <Text style={{ color: "red" }}>*</Text>{" "}
                  are mandatory.
                </Text>

                <Text style={styles.label}>
                  Phone Number <Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="Enter 10 digit phone"
                  value={formData.phone}
                  onChangeText={(v) => handleUpdate("phone", v)}
                  maxLength={10}
                />

                <Text style={styles.label}>
                  Login Password <Text style={{ color: "red" }}>*</Text>
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      { flex: 1, borderWidth: 0, height: "100%" },
                    ]}
                    secureTextEntry={!showPassword}
                    placeholder="Enter password"
                    value={formData.password}
                    onChangeText={(v) => handleUpdate("password", v)}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#64748B" />
                    ) : (
                      <Eye size={20} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {(step === 2 || step === 3 || step === 4) && (
              <View style={styles.centerBox}>
                <View style={styles.iconCircle}>
                  {step === 2 ? (
                    <Smartphone size={32} color="#002D72" />
                  ) : (
                    <Lock size={32} color="#002D72" />
                  )}
                </View>
                <Text style={styles.sectionTitle}>
                  {step === 2
                    ? "Enter OTP"
                    : step === 3
                      ? "Create PIN"
                      : "Confirm PIN"}{" "}
                  <Text style={{ color: "red" }}>*</Text>
                </Text>
                <Text style={styles.sectionSub}>
                  {step === 2
                    ? `Verify the code sent to ${formData.phone}`
                    : "Enter a 4-digit numeric code"}
                </Text>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.centeredInput,
                      { flex: 1, borderWidth: 0, height: "100%" },
                    ]}
                    keyboardType="number-pad"
                    maxLength={step === 2 ? 6 : 4}
                    secureTextEntry={!showValue}
                    placeholder={step === 2 ? "000000" : "0000"}
                    value={
                      step === 2
                        ? formData.otp
                        : step === 3
                          ? formData.pin
                          : formData.confirmPin
                    }
                    onChangeText={(v) =>
                      handleUpdate(
                        step === 2 ? "otp" : step === 3 ? "pin" : "confirmPin",
                        v,
                      )
                    }
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowValue(!showValue)}
                  >
                    {showValue ? (
                      <EyeOff size={20} color="#64748B" />
                    ) : (
                      <Eye size={20} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleNextStep}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {step === 4 ? "FINISH SETUP" : "CONTINUE"}
                  </Text>
                  <ChevronRight size={20} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F4FD" },
  safeArea: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 20, gap: 15 },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  title: { fontSize: 22, fontWeight: "900", color: "#002D72" },
  body: { padding: 25, paddingBottom: 50 },
  progressWrapper: { flexDirection: "row", gap: 6, marginBottom: 40 },
  progressLine: {
    flex: 1,
    height: 5,
    borderRadius: 10,
    backgroundColor: "#CBD5E1",
  },
  progressActive: { backgroundColor: "#002D72" },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#002D72",
    textAlign: "center",
  },
  sectionSub: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 30,
    marginTop: 10,
    fontSize: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#002D72",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    height: 58,
    backgroundColor: "#FFF",
    paddingHorizontal: 18,
    borderRadius: 18,
    fontSize: 18,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    color: "#002D72",
    fontWeight: "600",
  },
  centeredInput: { textAlign: "center" },
  passwordContainer: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  eyeBtn: { paddingHorizontal: 15, height: "100%", justifyContent: "center" },
  submitBtn: {
    flexDirection: "row",
    backgroundColor: "#002D72",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    gap: 10,
  },
  submitText: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  fadeContainer: { width: "100%" },
  centerBox: { width: "100%" },
  subText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 10,
    paddingHorizontal: 40,
  },
});
