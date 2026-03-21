import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
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

type PinStep = "enter" | "confirm";

/**
 * SetTransactionPin Screen
 *
 * Allows authenticated users to set or update their 4-digit transaction PIN.
 * Accessible from Profile → Security Settings.
 *
 * Flow:
 *   1. User enters a 4-digit PIN
 *   2. User re-enters PIN to confirm
 *   3. Both are submitted to backend via POST /auth/user/set-pin
 */
export default function SetTransactionPin({ navigation }: any) {
  const [step, setStep] = useState<PinStep>("enter");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const enterRefs = useRef<(TextInput | null)[]>([]);
  const confirmRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (statusMessage) {
      const t = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [statusMessage]);

  useEffect(() => {
    // Auto-focus first box on mount
    setTimeout(() => enterRefs.current[0]?.focus(), 200);
  }, []);

  const handlePinChange = (
    text: string,
    index: number,
    arr: string[],
    setArr: (v: string[]) => void,
    refs: React.MutableRefObject<(TextInput | null)[]>
  ) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const updated = [...arr];
    updated[index] = digit;
    setArr(updated);
    if (digit && index < 3) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    key: string,
    index: number,
    arr: string[],
    setArr: (v: string[]) => void,
    refs: React.MutableRefObject<(TextInput | null)[]>
  ) => {
    if (key === "Backspace" && arr[index] === "" && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const pinValue = pin.join("");
  const confirmPinValue = confirmPin.join("");

  const handleContinue = () => {
    setStatusMessage(null);
    if (pinValue.length !== 4) {
      setStatusMessage({ type: "error", text: "Please enter a complete 4-digit PIN." });
      return;
    }
    setStep("confirm");
    setConfirmPin(["", "", "", ""]);
    setTimeout(() => confirmRefs.current[0]?.focus(), 300);
  };

  const handleSetPin = async () => {
    setStatusMessage(null);
    if (confirmPinValue.length !== 4) {
      setStatusMessage({ type: "error", text: "Please enter the confirmation PIN." });
      return;
    }
    if (pinValue !== confirmPinValue) {
      setStatusMessage({ type: "error", text: "PINs do not match. Please try again." });
      setConfirmPin(["", "", "", ""]);
      setTimeout(() => confirmRefs.current[0]?.focus(), 200);
      return;
    }

    setIsLoading(true);
    try {
      await authService.setTransactionPin(pinValue, confirmPinValue);
      setStatusMessage({ type: "success", text: "Transaction PIN set successfully." });
      setTimeout(() => navigation.goBack(), 2000);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message === "NETWORK_ERROR"
          ? "Network Error: Unable to reach servers."
          : err.message || "Failed to set PIN. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const PinBoxRow = ({
    arr,
    setArr,
    refs,
    autoFocus,
  }: {
    arr: string[];
    setArr: (v: string[]) => void;
    refs: React.MutableRefObject<(TextInput | null)[]>;
    autoFocus?: boolean;
  }) => (
    <View style={styles.pinRow}>
      {arr.map((digit, i) => (
        <TextInput
          key={i}
          ref={(r) => (refs.current[i] = r)}
          style={[styles.pinBox, digit !== "" && styles.pinBoxFilled]}
          value={digit ? "●" : ""}
          onChangeText={(t) => handlePinChange(t, i, arr, setArr, refs)}
          onKeyPress={({ nativeEvent }) =>
            handleKeyPress(nativeEvent.key, i, arr, setArr, refs)
          }
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          autoFocus={autoFocus && i === 0}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.brandingSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => (step === "confirm" ? setStep("enter") : navigation.goBack())}
            >
              <ArrowLeft color="#FFF" size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logoInner}>
                <ShieldCheck size={32} color="#001F3F" strokeWidth={2.5} />
              </View>
            </View>
            <Text style={styles.brandName}>Security</Text>
            <Text style={styles.brandSub}>TRANSACTION PIN SETUP</Text>

            {/* Step dots */}
            <View style={styles.progressRow}>
              <View style={[styles.progressDot, styles.progressDotActive, step === "confirm" && styles.progressDotDone]} />
              <View style={[styles.progressDot, step === "confirm" && styles.progressDotActive]} />
            </View>
          </View>

          <View style={styles.formContainer}>

            {/* Status banner */}
            {statusMessage && (
              <View style={[styles.statusBanner, statusMessage.type === "error" ? styles.errorBanner : styles.successBanner]}>
                {statusMessage.type === "error" ? (
                  <AlertCircle size={18} color="#EF4444" />
                ) : (
                  <CheckCircle2 size={18} color="#10B981" />
                )}
                <Text style={[styles.statusText, statusMessage.type === "error" ? styles.errorText : styles.successText]}>
                  {statusMessage.text}
                </Text>
              </View>
            )}

            {/* STEP 1: Enter PIN */}
            {step === "enter" && (
              <>
                <View style={styles.headerTextGroup}>
                  <Text style={styles.welcomeTitle}>Create PIN</Text>
                  <Text style={styles.welcomeSub}>
                    Set a 4-digit transaction PIN. You'll need this for every money transfer.
                  </Text>
                </View>

                <View style={styles.pinSection}>
                  <Text style={styles.pinLabel}>ENTER 4-DIGIT PIN</Text>
                  <PinBoxRow arr={pin} setArr={setPin} refs={enterRefs} autoFocus />
                </View>

                <View style={styles.securityNote}>
                  <ShieldCheck size={14} color="#64748B" />
                  <Text style={styles.securityNoteText}>
                    Your PIN is encrypted and never stored in plain text.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, pinValue.length !== 4 && { opacity: 0.5 }]}
                  onPress={handleContinue}
                  disabled={pinValue.length !== 4}
                >
                  <Text style={styles.submitButtonText}>CONTINUE</Text>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 2: Confirm PIN */}
            {step === "confirm" && (
              <>
                <View style={styles.headerTextGroup}>
                  <Text style={styles.welcomeTitle}>Confirm PIN</Text>
                  <Text style={styles.welcomeSub}>
                    Re-enter your 4-digit PIN to confirm.
                  </Text>
                </View>

                <View style={styles.pinSection}>
                  <Text style={styles.pinLabel}>CONFIRM YOUR PIN</Text>
                  <PinBoxRow arr={confirmPin} setArr={setConfirmPin} refs={confirmRefs} />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (isLoading || confirmPinValue.length !== 4) && { opacity: 0.6 },
                  ]}
                  onPress={handleSetPin}
                  disabled={isLoading || confirmPinValue.length !== 4}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>SET TRANSACTION PIN</Text>
                  )}
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
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#001F3F" },
  brandingSection: {
    height: 200, backgroundColor: "#001F3F",
    justifyContent: "center", alignItems: "center",
  },
  backButton: { position: "absolute", top: 20, left: 20, padding: 10, zIndex: 10 },
  logoContainer: {
    width: 70, height: 70, backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 22, justifyContent: "center", alignItems: "center", marginBottom: 8,
  },
  logoInner: {
    width: 50, height: 50, backgroundColor: "#FFF",
    borderRadius: 15, justifyContent: "center", alignItems: "center",
  },
  brandName: { color: "#FFF", fontSize: 22, fontWeight: "900" },
  brandSub: { color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: "800", letterSpacing: 1.5, marginTop: 2 },
  progressRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  progressDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressDotActive: { backgroundColor: "#FFF", width: 24 },
  progressDotDone: { backgroundColor: "#10B981", width: 8 },

  formContainer: {
    flex: 1, backgroundColor: "#F0F9FF",
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 25, paddingTop: 35, paddingBottom: 30,
    marginTop: -10,
  },
  statusBanner: {
    flexDirection: "row", alignItems: "center",
    padding: 14, borderRadius: 16, marginBottom: 20, gap: 12,
    borderWidth: 1,
  },
  successBanner: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  errorBanner: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  statusText: { fontSize: 13, fontWeight: "700", flex: 1 },
  successText: { color: "#166534" },
  errorText: { color: "#991B1B" },

  headerTextGroup: { marginBottom: 32 },
  welcomeTitle: { fontSize: 24, fontWeight: "900", color: "#001F3F" },
  welcomeSub: { fontSize: 13, color: "#64748B", marginTop: 4, fontWeight: "500", lineHeight: 20 },

  pinSection: { alignItems: "center", marginBottom: 28 },
  pinLabel: { fontSize: 10, fontWeight: "900", color: "#64748B", letterSpacing: 1.5, marginBottom: 20 },
  pinRow: { flexDirection: "row", gap: 16 },
  pinBox: {
    width: 62, height: 70,
    borderRadius: 18, borderWidth: 2, borderColor: "#E2E8F0",
    backgroundColor: "#FFF", fontSize: 28, fontWeight: "900", color: "#001F3F",
  },
  pinBoxFilled: { borderColor: "#0EA5E9", backgroundColor: "#F0F9FF" },

  securityNote: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12,
    marginBottom: 28,
  },
  securityNoteText: { flex: 1, fontSize: 12, color: "#64748B", fontWeight: "500" },

  submitButton: {
    backgroundColor: "#0EA5E9", height: 58, borderRadius: 18,
    justifyContent: "center", alignItems: "center",
    elevation: 6, shadowColor: "#0EA5E9", shadowOpacity: 0.3, shadowRadius: 8,
  },
  submitButtonText: { color: "#FFF", fontSize: 14, fontWeight: "800", letterSpacing: 1 },

  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 40 },
  footerText: { fontSize: 10, color: "#94A3B8", fontWeight: "800", letterSpacing: 1.2 },
});
