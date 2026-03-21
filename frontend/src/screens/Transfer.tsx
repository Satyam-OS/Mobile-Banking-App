import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  FileText,
  Hash,
  ShieldCheck,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { accountService } from "../services/accountService";
import { authService } from "../services/authService";
import { transactionService } from "../services/transactionService";

type TransferStep = "form" | "pin" | "confirm" | "success";

export default function Transfer({ navigation }: any) {
  const [step, setStep] = useState<TransferStep>("form");

  // Form fields
  const [receiverAccount, setReceiverAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");

  // PIN input (4 digits)
  const [pin, setPin] = useState(["", "", "", ""]);
  const pinRefs = useRef<(TextInput | null)[]>([]);

  // State
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [error, setError] = useState("");

  const inputAmount = parseFloat(amount) || 0;
  const pinValue = pin.join("");

  // Form validation
  const isAccountValid = receiverAccount.trim().length >= 5;
  const isAmountValid = inputAmount > 0;
  const isFormComplete = isAccountValid && isAmountValid;

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const data = await accountService.getBalance();
        const bal = data?.balance ?? data?.availableBalance ?? 0;
        setUserBalance(Number(bal));
      } catch (err: any) {
        if (err.message === "UNAUTHORIZED") {
          await authService.logout();
          navigation.replace("Login");
        }
      } finally {
        setLoadingBalance(false);
      }
    };
    loadBalance();
  }, [navigation]);

  // ── PIN input handlers ───────────────────────────────────────────────────

  const handlePinChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const updated = [...pin];
    updated[index] = digit;
    setPin(updated);
    if (digit && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && pin[index] === "" && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  // ── Navigation ───────────────────────────────────────────────────────────

  const handleBack = () => {
    setError("");
    if (step === "form") navigation.goBack();
    else if (step === "pin") setStep("form");
    else if (step === "confirm") setStep("pin");
    else navigation.navigate("Transfer");
  };

  const handleContinueFromForm = () => {
    setError("");
    if (!isAccountValid) {
      setError("Please enter a valid receiver account number.");
      return;
    }
    if (!isAmountValid) {
      setError("Please enter a valid amount.");
      return;
    }
    if (inputAmount > userBalance) {
      setError("Insufficient balance for this transfer.");
      return;
    }
    setPin(["", "", "", ""]);
    setStep("pin");
    setTimeout(() => pinRefs.current[0]?.focus(), 300);
  };

  const handleContinueFromPin = () => {
    setError("");
    if (pinValue.length !== 4) {
      setError("Please enter your 4-digit transaction PIN.");
      return;
    }
    setStep("confirm");
  };

  const handleConfirmTransfer = async () => {
    setError("");
    setIsProcessing(true);
    try {
      await transactionService.transfer({
        toAccountNumber: receiverAccount.trim(),
        amount: inputAmount,
        note: remark.trim() || undefined,
        transactionPin: pinValue,
      });
      setUserBalance((prev) => prev - inputAmount);
      setStep("success");
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") {
        await authService.logout();
        navigation.replace("Login");
        return;
      }
      // PIN error returns 403 — surface it clearly
      const msg = err.message || "Transfer failed. Please try again.";
      if (msg.toLowerCase().includes("pin")) {
        setStep("pin");
        setPin(["", "", "", ""]);
        setError(msg);
        setTimeout(() => pinRefs.current[0]?.focus(), 300);
      } else {
        setError(msg);
        setStep("form");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewTransfer = () => {
    setReceiverAccount("");
    setAmount("");
    setRemark("");
    setPin(["", "", "", ""]);
    setError("");
    setStep("form");
  };

  // ── Shared components ────────────────────────────────────────────────────

  const ErrorBanner = () =>
    error ? (
      <View style={styles.errorBanner}>
        <AlertCircle size={16} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    ) : null;

  const stepTitles: Record<TransferStep, string> = {
    form: "SEND MONEY",
    pin: "ENTER PIN",
    confirm: "CONFIRM TRANSFER",
    success: "SUCCESS",
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{stepTitles[step]}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Balance chip */}
        {step !== "success" && (
          <View style={styles.balanceChip}>
            {loadingBalance ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.balanceText}>
                Balance: <Text style={{ fontWeight: "900" }}>₹{userBalance.toLocaleString("en-IN")}</Text>
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── STEP 1: FORM ── */}
          {step === "form" && (
            <>
              <ErrorBanner />

              {/* Receiver Account */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>RECEIVER ACCOUNT NUMBER</Text>
                <View style={styles.fieldWrapper}>
                  <Hash size={18} color="#0EA5E9" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Enter account number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    value={receiverAccount}
                    onChangeText={(t) => setReceiverAccount(t.replace(/[^0-9]/g, ""))}
                    autoFocus
                  />
                </View>
              </View>

              {/* Amount */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>AMOUNT (₹)</Text>
                <View style={styles.fieldWrapper}>
                  <DollarSign size={18} color="#0EA5E9" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
                {/* Quick amounts */}
                <View style={styles.quickAmountRow}>
                  {["500", "1000", "2000", "5000"].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={styles.amtPill}
                      onPress={() => setAmount(amt)}
                    >
                      <Text style={styles.amtPillText}>₹{amt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Remark */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>REMARK / NOTE (OPTIONAL)</Text>
                <View style={[styles.fieldWrapper, { height: 70, alignItems: "flex-start", paddingTop: 14 }]}>
                  <FileText size={18} color="#94A3B8" style={[styles.fieldIcon, { marginTop: 2 }]} />
                  <TextInput
                    style={[styles.fieldInput, { height: 50 }]}
                    placeholder="What's this for?"
                    placeholderTextColor="#94A3B8"
                    value={remark}
                    onChangeText={setRemark}
                    multiline
                  />
                </View>
              </View>
            </>
          )}

          {/* ── STEP 2: PIN ── */}
          {step === "pin" && (
            <>
              <ErrorBanner />

              {/* Transfer summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>SENDING TO</Text>
                <Text style={styles.summaryValue}>{receiverAccount}</Text>
                <View style={styles.summaryDivider} />
                <Text style={styles.summaryLabel}>AMOUNT</Text>
                <Text style={[styles.summaryValue, { color: "#0EA5E9", fontSize: 22 }]}>
                  ₹{inputAmount.toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.pinSection}>
                <View style={styles.pinHeaderRow}>
                  <ShieldCheck size={20} color="#0EA5E9" />
                  <Text style={styles.pinTitle}>ENTER TRANSACTION PIN</Text>
                </View>
                <Text style={styles.pinSubtitle}>Enter your 4-digit security PIN to authorise this transfer.</Text>

                <View style={styles.pinRow}>
                  {pin.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={(r) => (pinRefs.current[i] = r)}
                      style={[styles.pinBox, digit !== "" && styles.pinBoxFilled]}
                      value={digit ? "●" : ""}
                      onChangeText={(t) => handlePinChange(t, i)}
                      onKeyPress={({ nativeEvent }) => handlePinKeyPress(nativeEvent.key, i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      secureTextEntry={false}
                    />
                  ))}
                </View>
              </View>
            </>
          )}

          {/* ── STEP 3: CONFIRM ── */}
          {step === "confirm" && (
            <>
              <ErrorBanner />
              <View style={styles.confirmCard}>
                <Text style={styles.confirmLabel}>YOU ARE SENDING</Text>
                <Text style={styles.confirmAmount}>₹{inputAmount.toLocaleString("en-IN")}</Text>
                <View style={styles.divider} />
                <DetailRow label="To Account" value={receiverAccount} />
                <DetailRow label="Note" value={remark || "—"} />
                <DetailRow
                  label="Remaining Balance"
                  value={`₹${(userBalance - inputAmount).toLocaleString("en-IN")}`}
                />

                <View style={styles.pinConfirmBadge}>
                  <ShieldCheck size={14} color="#10B981" />
                  <Text style={styles.pinConfirmText}>PIN Verified ✓</Text>
                </View>
              </View>
            </>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <CheckCircle2 size={60} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Transfer Successful!</Text>
              <Text style={styles.successDesc}>
                ₹{inputAmount.toLocaleString("en-IN")} sent to account {receiverAccount}.
              </Text>
              <Text style={styles.successBalance}>
                New Balance: ₹{userBalance.toLocaleString("en-IN")}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Footer action buttons */}
      {step === "form" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.mainBtn, !isFormComplete && styles.disabledBtn]}
            onPress={handleContinueFromForm}
            disabled={!isFormComplete}
          >
            <Text style={styles.mainBtnText}>CONTINUE</Text>
            <ArrowRight size={18} color="#FFF" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>
      )}

      {step === "pin" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.mainBtn, pinValue.length !== 4 && styles.disabledBtn]}
            onPress={handleContinueFromPin}
            disabled={pinValue.length !== 4}
          >
            <Text style={styles.mainBtnText}>CONTINUE</Text>
            <ArrowRight size={18} color="#FFF" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>
      )}

      {step === "confirm" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.mainBtn, isProcessing && { opacity: 0.7 }]}
            onPress={handleConfirmTransfer}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.mainBtnText}>CONFIRM & SEND</Text>
                <ArrowRight size={18} color="#FFF" style={{ marginLeft: 10 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {step === "success" && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.mainBtn} onPress={() => navigation.navigate("Dashboard")}>
            <Text style={styles.mainBtnText}>BACK TO HOME</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleNewTransfer}>
            <Text style={styles.secondaryBtnText}>NEW TRANSFER</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#002D72" },
  header: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 30, backgroundColor: "#002D72" },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { color: "#FFF", fontSize: 14, fontWeight: "900", letterSpacing: 1 },
  iconBtn: { padding: 5 },
  balanceChip: {
    alignSelf: "center", marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20,
  },
  balanceText: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600" },

  content: {
    flex: 1, backgroundColor: "#FFF",
    borderTopLeftRadius: 35, borderTopRightRadius: 35,
    marginTop: -10, paddingTop: 10,
  },
  scroll: { padding: 25, paddingBottom: 120 },

  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#FEF2F2", borderRadius: 14, padding: 14,
    marginBottom: 20, borderWidth: 1, borderColor: "#FECACA",
  },
  errorText: { flex: 1, color: "#991B1B", fontWeight: "700", fontSize: 13 },

  // Form fields
  fieldGroup: { marginBottom: 22 },
  fieldLabel: { fontSize: 10, fontWeight: "900", color: "#94A3B8", marginBottom: 8, letterSpacing: 1 },
  fieldWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 16, paddingHorizontal: 16, height: 56,
  },
  fieldIcon: { marginRight: 12 },
  fieldInput: { flex: 1, fontSize: 15, color: "#001F3F", fontWeight: "600" },
  quickAmountRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  amtPill: {
    flex: 1, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0",
    alignItems: "center", backgroundColor: "#FFF",
  },
  amtPillText: { fontSize: 12, fontWeight: "800", color: "#64748B" },

  // Summary card (shown on PIN step)
  summaryCard: {
    backgroundColor: "#F0F9FF", borderRadius: 20,
    padding: 20, marginBottom: 28,
    borderWidth: 1, borderColor: "#BAE6FD",
  },
  summaryLabel: { fontSize: 10, fontWeight: "900", color: "#64748B", letterSpacing: 1 },
  summaryValue: { fontSize: 16, fontWeight: "900", color: "#001F3F", marginTop: 4, marginBottom: 12 },
  summaryDivider: { height: 1, backgroundColor: "#BAE6FD", marginBottom: 12 },

  // PIN entry
  pinSection: { alignItems: "center" },
  pinHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  pinTitle: { fontSize: 12, fontWeight: "900", color: "#001F3F", letterSpacing: 1 },
  pinSubtitle: { fontSize: 13, color: "#64748B", textAlign: "center", marginBottom: 28, paddingHorizontal: 20 },
  pinRow: { flexDirection: "row", gap: 16, marginBottom: 20 },
  pinBox: {
    width: 56, height: 64,
    borderRadius: 16, borderWidth: 2, borderColor: "#E2E8F0",
    backgroundColor: "#FFF", fontSize: 24, fontWeight: "900", color: "#001F3F",
  },
  pinBoxFilled: { borderColor: "#0EA5E9", backgroundColor: "#F0F9FF" },

  // Confirm card
  confirmCard: { backgroundColor: "#F8FAFC", borderRadius: 25, padding: 25 },
  confirmLabel: { textAlign: "center", fontSize: 11, fontWeight: "900", color: "#94A3B8", marginBottom: 10 },
  confirmAmount: { textAlign: "center", fontSize: 36, fontWeight: "900", color: "#002D72", marginBottom: 20 },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 20 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  detailLabel: { color: "#94A3B8", fontWeight: "700", fontSize: 13 },
  detailValue: { color: "#1E293B", fontWeight: "800", fontSize: 13, flex: 1, textAlign: "right", marginLeft: 10 },
  pinConfirmBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#F0FDF4", borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: "#BBF7D0", marginTop: 10,
    justifyContent: "center",
  },
  pinConfirmText: { fontSize: 12, fontWeight: "800", color: "#166534" },

  // Success
  successContainer: { alignItems: "center", paddingTop: 40 },
  successIconBox: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#F0FDF4",
    justifyContent: "center", alignItems: "center", marginBottom: 20,
  },
  successTitle: { fontSize: 22, fontWeight: "900", color: "#1E293B", marginBottom: 10 },
  successDesc: { fontSize: 14, color: "#64748B", textAlign: "center", paddingHorizontal: 20 },
  successBalance: { color: "#0EA5E9", fontSize: 13, fontWeight: "700", marginTop: 12 },

  // Footer buttons
  footer: { padding: 25, backgroundColor: "#FFF", gap: 12 },
  mainBtn: {
    height: 60, backgroundColor: "#0EA5E9", borderRadius: 20,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
  },
  mainBtnText: { color: "#FFF", fontWeight: "900", letterSpacing: 1 },
  disabledBtn: { backgroundColor: "#CBD5E1" },
  secondaryBtn: {
    height: 60, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  secondaryBtnText: { color: "#64748B", fontWeight: "900" },
});
