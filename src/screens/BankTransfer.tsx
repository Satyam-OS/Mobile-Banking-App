import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    Landmark,
    ShieldCheck,
    XCircle,
} from "lucide-react-native";
import React, { useState } from "react";
import {
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

type TransferStep = "details" | "pin" | "success" | "failed";

export default function BankTransfer({ navigation }: any) {
  const [step, setStep] = useState<TransferStep>("details");
  const [accountNo, setAccountNo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateDetails = () => {
    let newErrors: { [key: string]: string } = {};
    if (!accountNo) newErrors.accountNo = "Account number is required";
    else if (accountNo.length !== 10) newErrors.accountNo = "Must be 10 digits";

    if (!amount) newErrors.amount = "Amount is required";
    else if (parseFloat(amount) <= 0) newErrors.amount = "Invalid amount";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === "details") {
      if (validateDetails()) setStep("pin");
    } else if (step === "pin") {
      if (pin.length === 4) {
        const transferAmount = parseFloat(amount);
        setStep(transferAmount > 1000 ? "failed" : "success");
      } else {
        setErrors({ pin: "4-digit PIN required" });
      }
    }
  };

  const handleBack = () => {
    if (step === "pin") {
      setStep("details");
      setErrors({});
    } else if (step === "success" || step === "failed") {
      navigation.goBack();
    } else {
      navigation.goBack();
    }
  };

  // --- Render Success Screen ---
  if (step === "success") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
        <View style={styles.statusContent}>
          <CheckCircle2 size={80} color="#22C55E" />
          <Text style={styles.statusTitle}>Transfer Successful</Text>
          <View style={styles.receiptCard}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount</Text>
              <Text style={styles.receiptValue}>
                ₹{parseFloat(amount).toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>To Account</Text>
              <Text style={styles.receiptValue}>
                XXXXXX{accountNo.slice(-4)}
              </Text>
            </View>
            {note ? (
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Note</Text>
                <Text style={styles.receiptValue}>{note}</Text>
              </View>
            ) : null}
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Status</Text>
              <Text style={[styles.receiptValue, { color: "#22C55E" }]}>
                Completed
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.mainBtn, { width: "100%" }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.mainBtnText}>BACK TO HOME</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- Render Failed Screen ---
  if (step === "failed") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
        <View style={styles.statusContent}>
          <XCircle size={80} color="#EF4444" />
          <Text style={styles.statusTitle}>Transfer Failed</Text>
          <Text style={styles.statusSubText}>
            Maximum limit for this transaction is ₹1,000. Your entry of ₹
            {parseFloat(amount).toLocaleString("en-IN")} was declined.
          </Text>
          <TouchableOpacity
            style={[
              styles.mainBtn,
              { width: "100%", backgroundColor: "#EF4444" },
            ]}
            onPress={() => setStep("details")}
          >
            <Text style={styles.mainBtnText}>TRY AGAIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: 20 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: "#64748B", fontWeight: "700" }}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ArrowLeft size={24} color="#002D72" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Transfer</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          <View style={styles.card}>
            {step === "details" ? (
              <View>
                <View style={styles.iconCircle}>
                  <Landmark size={32} color="#0EA5E9" />
                </View>
                <Text style={styles.stepTitle}>Transfer Details</Text>

                <Text style={styles.label}>
                  RECIPIENT ACCOUNT NUMBER{" "}
                  <Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.accountNo && styles.inputError]}
                  placeholder="Enter 10-digit account number"
                  keyboardType="numeric"
                  maxLength={10}
                  value={accountNo}
                  onChangeText={(val) => {
                    setAccountNo(val);
                    setErrors({ ...errors, accountNo: "" });
                  }}
                />
                {errors.accountNo && (
                  <Text style={styles.errorText}>{errors.accountNo}</Text>
                )}

                <Text style={styles.label}>
                  AMOUNT <Text style={{ color: "red" }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.amountWrapper,
                    errors.amount && styles.inputError,
                  ]}
                >
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={(val) => {
                      setAmount(val);
                      setErrors({ ...errors, amount: "" });
                    }}
                  />
                </View>
                {errors.amount && (
                  <Text style={styles.errorText}>{errors.amount}</Text>
                )}

                <Text style={styles.label}>ADD A NOTE (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What is this for?"
                  value={note}
                  onChangeText={setNote}
                />
              </View>
            ) : (
              <View>
                <View style={styles.iconCircle}>
                  <ShieldCheck size={32} color="#0EA5E9" />
                </View>
                <Text style={styles.stepTitle}>Security Verification</Text>
                <Text style={styles.stepSub}>
                  Enter 4-digit PIN for ₹
                  {parseFloat(amount).toLocaleString("en-IN")}
                </Text>

                <View
                  style={[styles.pinContainer, errors.pin && styles.inputError]}
                >
                  <TextInput
                    style={styles.pinInput}
                    placeholder="• • • •"
                    keyboardType="numeric"
                    secureTextEntry={!showPin}
                    maxLength={4}
                    value={pin}
                    onChangeText={(val) => {
                      setPin(val);
                      setErrors({ ...errors, pin: "" });
                    }}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => setShowPin(!showPin)}
                    style={styles.eyeBtn}
                  >
                    {showPin ? (
                      <EyeOff size={24} color="#94A3B8" />
                    ) : (
                      <Eye size={24} color="#94A3B8" />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.pin && (
                  <Text style={styles.errorText}>{errors.pin}</Text>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.mainBtn} onPress={handleNext}>
              <Text style={styles.mainBtnText}>
                {step === "details" ? "CONTINUE" : "CONFIRM TRANSFER"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E0F2FE" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#002D72",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: "#FFF" },
  content: { flex: 1, padding: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 30,
    padding: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 15,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 5,
  },
  stepSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 25,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    marginBottom: 8,
    marginTop: 15,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
    padding: 15,
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "600",
  },
  inputError: { borderColor: "#EF4444" },
  errorText: {
    color: "#EF4444",
    fontSize: 11,
    marginTop: 5,
    fontWeight: "700",
  },
  amountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
    paddingHorizontal: 15,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0EA5E9",
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    height: 55,
    fontSize: 24,
    fontWeight: "900",
    color: "#002D72",
  },
  pinContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pinInput: {
    flex: 1,
    textAlign: "center",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 10,
    padding: 15,
    color: "#002D72",
  },
  eyeBtn: { paddingRight: 15 },
  mainBtn: {
    backgroundColor: "#0EA5E9",
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  mainBtnText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },
  // Status Screen Styles
  statusContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  statusTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1E293B",
    marginTop: 20,
    marginBottom: 10,
  },
  statusSubText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  receiptCard: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  receiptLabel: {
    color: "#94A3B8",
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
  },
  receiptValue: { color: "#1E293B", fontWeight: "800", fontSize: 14 },
});
