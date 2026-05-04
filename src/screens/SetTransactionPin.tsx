import {
  AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../services/authService";

type PinStep = "enter" | "confirm";

/**
 * PIN Input using a SINGLE hidden TextInput behind 4 visual boxes.
 *
 * This is the most reliable approach for PIN entry on both web and native:
 * - One real TextInput captures all keystrokes
 * - 4 visual boxes show filled/empty state
 * - Focus, backspace, and auto-advance all work naturally
 * - No fighting with React Native's focus management
 */
const PinInput = ({
  value,
  onChange,
  autoFocus = false,
}: {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) => {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
      style={pinStyles.container}
    >
      {/* Hidden real input — positioned behind boxes */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => {
          // Only digits, max 4
          const clean = t.replace(/[^0-9]/g, "").slice(0, 4);
          onChange(clean);
        }}
        keyboardType="number-pad"
        maxLength={4}
        style={pinStyles.hiddenInput}
        caretHidden
        autoFocus={autoFocus}
      />

      {/* Visual boxes */}
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            pinStyles.box,
            value.length === i && pinStyles.boxActive,   // cursor position
            value.length > i  && pinStyles.boxFilled,    // filled
          ]}
        >
          {value.length > i ? (
            <View style={pinStyles.dot} />
          ) : null}
        </View>
      ))}
    </TouchableOpacity>
  );
};

const pinStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    position: "relative",
  },
  hiddenInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
    zIndex: 10,
  },
  box: {
    width: 62, height: 70, borderRadius: 18,
    borderWidth: 2, borderColor: "#E2E8F0",
    backgroundColor: "#FFF",
    justifyContent: "center", alignItems: "center",
  },
  boxActive: {
    borderColor: "#0EA5E9",
    backgroundColor: "#F0F9FF",
  },
  boxFilled: {
    borderColor: "#0EA5E9",
    backgroundColor: "#F0F9FF",
  },
  dot: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: "#001F3F",
  },
});

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function SetTransactionPin({ navigation }: any) {
  const [step,         setStep]         = useState<PinStep>("enter");
  const [pin,         setPin]           = useState("");
  const [confirmPin,  setConfirmPin]    = useState("");
  const [isLoading,   setIsLoading]     = useState(false);
  const [statusMsg,   setStatusMsg]     = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (statusMsg) {
      const t = setTimeout(() => setStatusMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [statusMsg]);

  const handleContinue = () => {
    setStatusMsg(null);
    if (pin.length !== 4) {
      setStatusMsg({ type: "error", text: "Please enter a complete 4-digit PIN." });
      return;
    }
    setStep("confirm");
    setConfirmPin("");
  };

  const handleSetPin = async () => {
    setStatusMsg(null);
    if (confirmPin.length !== 4) {
      setStatusMsg({ type: "error", text: "Please enter the confirmation PIN." });
      return;
    }
    if (pin !== confirmPin) {
      setStatusMsg({ type: "error", text: "PINs do not match. Please try again." });
      setConfirmPin("");
      return;
    }
    setIsLoading(true);
    try {
      await authService.setTransactionPin(pin, confirmPin);
      setStatusMsg({ type: "success", text: "Transaction PIN set successfully." });
      setTimeout(() => navigation.goBack(), 2000);
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message === "NETWORK_ERROR"
          ? "Network Error: Unable to reach servers."
          : err.message || "Failed to set PIN. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentPin   = step === "enter" ? pin : confirmPin;
  const setCurrentPin = step === "enter" ? setPin : setConfirmPin;
  const canProceed   = currentPin.length === 4;

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
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.brandingSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => step === "confirm" ? (setStep("enter"), setConfirmPin("")) : navigation.goBack()}
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
            <View style={styles.progressRow}>
              <View style={[styles.progressDot, styles.progressDotActive, step === "confirm" && styles.progressDotDone]} />
              <View style={[styles.progressDot, step === "confirm" && styles.progressDotActive]} />
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Status banner */}
            {statusMsg && (
              <View style={[styles.statusBanner, statusMsg.type === "error" ? styles.errorBanner : styles.successBanner]}>
                {statusMsg.type === "error"
                  ? <AlertCircle size={18} color="#EF4444" />
                  : <CheckCircle2 size={18} color="#10B981" />}
                <Text style={[styles.statusText, statusMsg.type === "error" ? styles.errorText : styles.successText]}>
                  {statusMsg.text}
                </Text>
              </View>
            )}

            <View style={styles.headerTextGroup}>
              <Text style={styles.welcomeTitle}>
                {step === "enter" ? "Create PIN" : "Confirm PIN"}
              </Text>
              <Text style={styles.welcomeSub}>
                {step === "enter"
                  ? "Set a 4-digit transaction PIN. You'll need this for every money transfer."
                  : "Re-enter your 4-digit PIN to confirm."}
              </Text>
            </View>

            <View style={styles.pinSection}>
              <Text style={styles.pinLabel}>
                {step === "enter" ? "ENTER 4-DIGIT PIN" : "CONFIRM YOUR PIN"}
              </Text>

              {/* Single PinInput — key changes on step so it remounts and auto-focuses */}
              <PinInput
                key={step}
                value={currentPin}
                onChange={setCurrentPin}
                autoFocus
              />
            </View>

            {step === "enter" && (
              <View style={styles.securityNote}>
                <ShieldCheck size={14} color="#64748B" />
                <Text style={styles.securityNoteText}>
                  Your PIN is encrypted and never stored in plain text.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, !canProceed && { opacity: 0.45 }]}
              onPress={step === "enter" ? handleContinue : handleSetPin}
              disabled={!canProceed || isLoading}
            >
              {isLoading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.submitButtonText}>
                    {step === "enter" ? "CONTINUE" : "SET TRANSACTION PIN"}
                  </Text>
              }
            </TouchableOpacity>

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
  brandSub:  { color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: "800", letterSpacing: 1.5, marginTop: 2 },
  progressRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  progressDot:      { width: 8,  height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.3)" },
  progressDotActive: { backgroundColor: "#FFF", width: 24 },
  progressDotDone:   { backgroundColor: "#10B981", width: 8 },
  formContainer: {
    flex: 1, backgroundColor: "#F0F9FF",
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 25, paddingTop: 35, paddingBottom: 30, marginTop: -10,
  },
  statusBanner: {
    flexDirection: "row", alignItems: "center",
    padding: 14, borderRadius: 16, marginBottom: 20, gap: 12, borderWidth: 1,
  },
  successBanner: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  errorBanner:   { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  statusText: { fontSize: 13, fontWeight: "700", flex: 1 },
  successText: { color: "#166534" },
  errorText:   { color: "#991B1B" },
  headerTextGroup: { marginBottom: 36 },
  welcomeTitle: { fontSize: 24, fontWeight: "900", color: "#001F3F" },
  welcomeSub:   { fontSize: 13, color: "#64748B", marginTop: 4, fontWeight: "500", lineHeight: 20 },
  pinSection: { alignItems: "center", marginBottom: 28 },
  pinLabel: { fontSize: 10, fontWeight: "900", color: "#64748B", letterSpacing: 1.5, marginBottom: 24 },
  securityNote: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12, marginBottom: 28,
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
