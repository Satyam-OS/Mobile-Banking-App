import { ArrowRight, ShieldCheck } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../services/authService";

export default function GuestOtp({ navigation, route }: any) {
  const { mobile } = route.params;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert(
        "Invalid OTP",
        "Please enter the 6-digit code sent to your phone.",
      );
      return;
    }

    try {
      setLoading(true);
      // Calls verify endpoint and saves JWT automatically
      await authService.verifyOtp(mobile, otp);

      navigation.replace("OTPSuccess", {
        status: "SUCCESS",
      });
    } catch (error: any) {
      console.error("Verification Error:", error.message);
      navigation.replace("OTPSuccess", {
        status: "FAILED",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F9FF" />
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Verify Identity</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit secure code to{"\n"}
            <Text style={styles.mobileHighlight}>+91 {mobile}</Text>
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Security Code</Text>
          <TextInput
            style={[styles.input, { letterSpacing: 8 }]} // ✅ Move it here
            placeholder="0 0 0 0 0 0"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, ""))}
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={verifyOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.btnText}>VERIFY AND PROCEED</Text>
              <ArrowRight size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendBtn}
          onPress={() => authService.generateOtp(mobile)}
        >
          <Text style={styles.resendText}>
            Didn't receive code? <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.securityBadge}>
          <ShieldCheck size={14} color="#64748B" />
          <Text style={styles.securityText}>SECURE VERIFICATION</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
  },
  headerSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#001F3F",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
    fontWeight: "500",
  },
  mobileHighlight: {
    color: "#001F3F",
    fontWeight: "700",
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 20,
    fontSize: 24,
    fontWeight: "700",
    color: "#001F3F",
    textAlign: "center",
    letterSpacing: 8, // Corrected: Moved inside the style object
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  btn: {
    height: 64,
    backgroundColor: "#001F3F",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: "#001F3F",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  btnDisabled: {
    opacity: 0.7,
    backgroundColor: "#334155",
  },
  btnText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1,
  },
  resendBtn: {
    marginTop: 25,
    alignItems: "center",
  },
  resendText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  resendLink: {
    color: "#38BDF8",
    fontWeight: "800",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 50,
    opacity: 0.6,
  },
  securityText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "800",
    letterSpacing: 1.5,
  },
});
