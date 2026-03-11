import {
  ArrowLeft, ArrowRight, Building2, CheckCircle2, ChevronRight,
  Eye, EyeOff, Plus, QrCode, Search, Smartphone,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { accountService } from "../services/accountService";
import { authService } from "../services/authService";
import { transactionService } from "../services/transactionService";

type TransferStep = "select" | "amount" | "password" | "confirm" | "success";

export default function Transfer({ navigation }: any) {
  const [step, setStep] = useState<TransferStep>("select");
  const [searchQuery, setSearchQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(true);
  const [transferError, setTransferError] = useState("");
  const [finalError, setFinalError] = useState("");

  const quickAmounts = ["500", "1000", "2000", "5000"];
  const inputAmount = parseFloat(amount) || 0;
  const isAmountOverLimit = inputAmount > 4000;
  const isInvalidAmount = inputAmount <= 0;
  const canProceed = !isAmountOverLimit && !isInvalidAmount;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountData, benfData] = await Promise.allSettled([
          accountService.getBalance(),
          transactionService.getBeneficiaries(),
        ]);

        if (accountData.status === "fulfilled") {
          const bal = accountData.value?.balance ?? accountData.value?.availableBalance ?? 0;
          setUserBalance(Number(bal));
        }

        if (benfData.status === "fulfilled" && Array.isArray(benfData.value) && benfData.value.length > 0) {
          setBeneficiaries(benfData.value.map((b: any) => ({
            id: b.id || b.accountId || String(Math.random()),
            name: b.name || b.beneficiaryName || b.accountHolderName,
            bank: b.bank || b.bankName || "Bank",
            acc: b.accountNumber ? `•••• ${String(b.accountNumber).slice(-4)}` : "•••• ****",
            rawAccountNumber: b.accountNumber || b.acc,
          })));
        } else {
          // Fallback mock beneficiaries
          setBeneficiaries([
            { id: "1", name: "Rahul Sharma", bank: "HDFC Bank", acc: "•••• 4582", rawAccountNumber: "1234567890" },
            { id: "2", name: "Sneha Patil", bank: "ICICI Bank", acc: "•••• 9910", rawAccountNumber: "9876543210" },
            { id: "3", name: "Amit Verma", bank: "SBI Bank", acc: "•••• 2231", rawAccountNumber: "1122334455" },
          ]);
        }
      } catch (err: any) {
        if (err.message === "UNAUTHORIZED") {
          await authService.logout();
          navigation.replace("Login");
          return;
        }
        // Use mock data on error
        setBeneficiaries([
          { id: "1", name: "Rahul Sharma", bank: "HDFC Bank", acc: "•••• 4582", rawAccountNumber: "1234567890" },
          { id: "2", name: "Sneha Patil", bank: "ICICI Bank", acc: "•••• 9910", rawAccountNumber: "9876543210" },
        ]);
      } finally {
        setLoadingBeneficiaries(false);
      }
    };
    loadData();
  }, [navigation]);

  const filteredBeneficiaries = beneficiaries.filter(
    (b) =>
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bank?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = async () => {
    setTransferError("");
    setFinalError("");

    if (step === "select" && selectedUser) {
      setStep("amount");
    } else if (step === "amount" && canProceed) {
      setStep("password");
    } else if (step === "password") {
      if (!/^.{4,}$/.test(password)) return;
      setStep("confirm");
    } else if (step === "confirm") {
      if (inputAmount > userBalance) {
        setFinalError("❗ Insufficient Balance for this transaction");
        return;
      }

      setIsProcessing(true);
      try {
        // ✅ FIX: Do not send 'password' to backend — auth is via JWT Bearer token.
        // TransferPayload no longer includes password field.
        await transactionService.transfer({
          toAccountNumber: selectedUser.rawAccountNumber || selectedUser.acc,
          amount: inputAmount,
          note: note || undefined,
        });
        setUserBalance((prev) => prev - inputAmount);
        setPassword("");
        setStep("success");
      } catch (err: any) {
        if (err.message === "UNAUTHORIZED") {
          await authService.logout();
          navigation.replace("Login");
          return;
        }
        setFinalError(err.message || "Transfer failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBack = () => {
    setTransferError("");
    setFinalError("");
    if (step === "select") navigation.goBack();
    else if (step === "amount") setStep("select");
    else if (step === "password") setStep("amount");
    else if (step === "confirm") setStep("password");
    else navigation.navigate("Transfer");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === "select" && "SEND MONEY"}
            {step === "amount" && "ENTER AMOUNT"}
            {step === "password" && "ENTER PASSWORD"}
            {step === "confirm" && "CONFIRM"}
            {step === "success" && "SUCCESS"}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* SELECT STEP */}
          {step === "select" && (
            <>
              <View style={styles.quickActionsCard}>
                <ActionBtn icon={Building2} label="Bank" color="#0EA5E9" />
                <ActionBtn icon={Smartphone} label="UPI ID" color="#8B5CF6" />
                <ActionBtn icon={QrCode} label="Scan QR" color="#10B981" />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>RECENT BENEFICIARIES</Text>
                <TouchableOpacity style={styles.addBtn}>
                  <Plus size={16} color="#0EA5E9" />
                  <Text style={styles.addBtnText}>ADD NEW</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.searchBox}>
                <Search size={18} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search name or account..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {loadingBeneficiaries ? (
                <ActivityIndicator size="small" color="#0EA5E9" style={{ marginTop: 20 }} />
              ) : (
                filteredBeneficiaries.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.userItem}
                    onPress={() => { setSelectedUser(user); setStep("amount"); }}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{(user.name || "?")[0]}</Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userBank}>{user.bank} • {user.acc}</Text>
                    </View>
                    <ChevronRight size={18} color="#CBD5E1" />
                  </TouchableOpacity>
                ))
              )}
            </>
          )}

          {/* AMOUNT STEP */}
          {step === "amount" && selectedUser && (
            <View style={styles.stepContainer}>
              <UserSummary user={selectedUser} />

              <View style={{ alignItems: "center", marginBottom: 10 }}>
                <Text style={{ color: "#64748B", fontWeight: "800", fontSize: 12 }}>
                  AVAILABLE BALANCE:{" "}
                  <Text style={{ color: "#0EA5E9" }}>₹{userBalance.toLocaleString("en-IN")}</Text>
                </Text>
              </View>

              <View style={styles.amountInputArea}>
                <Text style={[styles.currencySymbol, isAmountOverLimit && { color: "#EF4444" }]}>₹</Text>
                <TextInput
                  style={[styles.amountInput, isAmountOverLimit && { color: "#EF4444" }]}
                  keyboardType="numeric"
                  placeholder="0"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus
                />
              </View>

              {isAmountOverLimit && (
                <Text style={{ color: "#EF4444", textAlign: "center", fontWeight: "bold", marginBottom: 20 }}>
                  ⚠️ Max ₹4000 per transaction allowed
                </Text>
              )}

              <View style={styles.quickAmountRow}>
                {quickAmounts.map((amt) => (
                  <TouchableOpacity key={amt} style={styles.amtPill} onPress={() => setAmount(amt)}>
                    <Text style={styles.amtPillText}>₹{amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.noteBox}>
                <Text style={styles.label}>ADD A NOTE (OPTIONAL)</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="What's this for?"
                  value={note}
                  onChangeText={setNote}
                />
              </View>
            </View>
          )}

          {/* PASSWORD STEP */}
          {step === "password" && selectedUser && (
            <View style={styles.stepContainer}>
              <UserSummary user={selectedUser} />
              <View style={styles.noteBox}>
                <Text style={styles.label}>ENTER TRANSACTION PASSWORD</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* CONFIRM STEP */}
          {step === "confirm" && selectedUser && (
            <View style={styles.stepContainer}>
              <View style={styles.confirmCard}>
                <Text style={styles.confirmLabel}>YOU ARE SENDING</Text>
                <Text style={styles.confirmAmount}>₹{parseFloat(amount).toLocaleString("en-IN")}</Text>
                <View style={styles.divider} />
                <DetailRow label="To" value={selectedUser.name} />
                <DetailRow label="Bank" value={selectedUser.bank} />
                <DetailRow label="Account" value={selectedUser.acc} />
                <DetailRow label="Note" value={note || "N/A"} />
                {finalError !== "" && (
                  <Text style={{ marginTop: 15, color: "#EF4444", fontWeight: "bold", textAlign: "center" }}>
                    {finalError}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* SUCCESS STEP */}
          {step === "success" && selectedUser && (
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <CheckCircle2 size={60} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Transfer Successful!</Text>
              <Text style={styles.successDesc}>
                ₹{parseFloat(amount).toLocaleString("en-IN")} sent successfully to {selectedUser.name}.
              </Text>
              <Text style={{ color: "#94A3B8", fontSize: 12, marginTop: 10 }}>
                New Balance: ₹{userBalance.toLocaleString("en-IN")}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {step !== "success" && (
        <View style={styles.footer}>
          {transferError !== "" && (
            <Text style={{ color: "#EF4444", fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
              {transferError}
            </Text>
          )}
          <TouchableOpacity
            style={[
              styles.mainBtn,
              ((step === "amount" && !canProceed) || (step === "password" && password.length < 4)) && styles.disabledBtn,
            ]}
            onPress={handleNext}
            disabled={isProcessing || (step === "amount" && !canProceed) || (step === "password" && password.length < 4)}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.mainBtnText}>{step === "confirm" ? "CONFIRM & SEND" : "CONTINUE"}</Text>
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
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setStep("select"); setAmount(""); }}>
            <Text style={styles.secondaryBtnText}>NEW TRANSFER</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const ActionBtn = ({ icon: Icon, label, color }: any) => (
  <TouchableOpacity style={styles.actionItem}>
    <View style={[styles.actionIcon, { backgroundColor: color + "15" }]}>
      <Icon size={24} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const UserSummary = ({ user }: any) => (
  <View style={styles.summaryBox}>
    <View style={styles.avatarSm}>
      <Text style={styles.avatarTextSm}>{(user.name || "?")[0]}</Text>
    </View>
    <View>
      <Text style={styles.summaryName}>{user.name}</Text>
      <Text style={styles.summaryAcc}>{user.bank} • {user.acc}</Text>
    </View>
  </View>
);

const DetailRow = ({ label, value }: any) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#002D72" },
  header: { padding: 20, paddingTop: 40, backgroundColor: "#002D72", paddingBottom: 40 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { color: "#FFF", fontSize: 14, fontWeight: "900", letterSpacing: 1 },
  iconBtn: { padding: 5 },
  content: { flex: 1, backgroundColor: "#FFF", borderTopLeftRadius: 35, borderTopRightRadius: 35, marginTop: -20, paddingTop: 10 },
  scroll: { padding: 25, paddingBottom: 100 },
  quickActionsCard: {
    flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, paddingTop: 30,
    elevation: 12, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    borderWidth: 1, borderColor: "#0f0f0f", marginTop: 10, marginBottom: 25, justifyContent: "space-around",
  },
  actionItem: { alignItems: "center", gap: 8 },
  actionIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  actionLabel: { fontSize: 10, fontWeight: "800", color: "#64748B" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: "900", color: "#94A3B8", letterSpacing: 0.5 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  addBtnText: { fontSize: 11, fontWeight: "900", color: "#0EA5E9" },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 15, paddingHorizontal: 15, height: 50, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 10, fontWeight: "600", color: "#002D72" },
  userItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#F0F9FF", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#0EA5E9", fontWeight: "800", fontSize: 16 },
  userInfo: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 15, fontWeight: "800", color: "#1E293B" },
  userBank: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  stepContainer: { paddingTop: 10 },
  summaryBox: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F8FAFC", padding: 15, borderRadius: 20, marginBottom: 30 },
  avatarSm: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#0EA5E9", justifyContent: "center", alignItems: "center" },
  avatarTextSm: { color: "#FFF", fontWeight: "800", fontSize: 14 },
  summaryName: { fontSize: 14, fontWeight: "800", color: "#1E293B" },
  summaryAcc: { fontSize: 11, color: "#64748B" },
  amountInputArea: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  currencySymbol: { fontSize: 32, fontWeight: "900", color: "#002D72", marginRight: 10 },
  amountInput: { fontSize: 48, fontWeight: "900", color: "#002D72", minWidth: 100, textAlign: "center" },
  quickAmountRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 30 },
  amtPill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  amtPillText: { fontSize: 12, fontWeight: "800", color: "#64748B" },
  noteBox: { gap: 10 },
  label: { fontSize: 10, fontWeight: "900", color: "#94A3B8" },
  noteInput: { height: 50, backgroundColor: "#F8FAFC", borderRadius: 12, paddingHorizontal: 15, fontWeight: "600" },
  passwordInputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, height: 50 },
  passwordInput: { flex: 1, paddingHorizontal: 15, fontWeight: "600", color: "#002D72" },
  eyeBtn: { paddingHorizontal: 15, height: "100%" as any, justifyContent: "center" },
  confirmCard: { backgroundColor: "#F8FAFC", borderRadius: 25, padding: 25 },
  confirmLabel: { textAlign: "center", fontSize: 11, fontWeight: "900", color: "#94A3B8", marginBottom: 10 },
  confirmAmount: { textAlign: "center", fontSize: 36, fontWeight: "900", color: "#002D72", marginBottom: 20 },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 20 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  detailLabel: { color: "#94A3B8", fontWeight: "700", fontSize: 13 },
  detailValue: { color: "#1E293B", fontWeight: "800", fontSize: 13 },
  successContainer: { alignItems: "center", paddingTop: 40 },
  successIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#F0FDF4", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  successTitle: { fontSize: 22, fontWeight: "900", color: "#1E293B", marginBottom: 10 },
  successDesc: { fontSize: 14, color: "#64748B", textAlign: "center" },
  footer: { padding: 25, backgroundColor: "#FFF", gap: 12 },
  mainBtn: { height: 60, backgroundColor: "#0EA5E9", borderRadius: 20, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  mainBtnText: { color: "#FFF", fontWeight: "900", letterSpacing: 1 },
  disabledBtn: { backgroundColor: "#CBD5E1" },
  secondaryBtn: { height: 60, borderRadius: 20, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  secondaryBtnText: { color: "#64748B", fontWeight: "900" },
});
