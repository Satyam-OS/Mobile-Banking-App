import {
    ArrowDownLeft,
    ArrowLeft,
    ArrowUpRight,
    CheckCircle2,
    Delete,
    Eye,
    EyeOff,
    History,
    Lock,
    ShieldAlert,
    ShieldCheck,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";

export default function BalanceSecurity({ navigation }: any) {
  const [pin, setPin] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const CORRECT_PIN = "1234";

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === CORRECT_PIN) {
        setIsVerified(true);
        setError(false);
      } else {
        handleError();
      }
    }
  }, [pin]);

  const handleError = () => {
    setError(true);
    Vibration.vibrate(500);
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setPin("");
      setError(false);
    }, 800);
  };

  const handlePress = (num: string) => {
    if (pin.length < 4 && !error) {
      setPin((prev) => prev + num);
    }
  };

  if (isVerified) {
    return (
      <SafeAreaView style={styles.verifiedContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0F9FF" />

        <View style={styles.verifiedHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtnCircle}
          >
            <ArrowLeft size={22} color="#002D72" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SECURE BALANCE</Text>
          <View style={styles.secureIndicator}>
            <ShieldCheck size={16} color="#10B981" />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Current Available Balance</Text>
              <Text style={styles.balanceMainText}>₹8,000.00</Text>
              <View style={styles.updateBadge}>
                <CheckCircle2 size={14} color="#0EA5E9" />
                <Text style={styles.updateText}>Verified by SecureBank</Text>
              </View>
            </View>

            <View style={styles.historySection}>
              <View style={styles.historyHeader}>
                <History size={20} color="#002D72" />
                <Text style={styles.historyTitle}>Recent Activity</Text>
              </View>
              <TransactionRow
                title="Transfer to Rahul"
                date="Today, 12:45"
                amt="- ₹2,000"
                type="out"
              />
              <TransactionRow
                title="Zomato Order"
                date="Yesterday"
                amt="- ₹450"
                type="out"
              />
              <TransactionRow
                title="Salary Credit"
                date="26 Feb 2026"
                amt="+ ₹75,000"
                type="in"
              />
              <TransactionRow
                title="Amazon Shopping"
                date="25 Feb 2026"
                amt="- ₹2,499"
                type="out"
              />
              <TransactionRow
                title="Electricity Bill"
                date="24 Feb 2026"
                amt="- ₹1,200"
                type="out"
              />
            </View>
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.doneBtnText}>RETURN TO DASHBOARD</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#002D72" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtnHeader}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.pinInfo}>
        <View style={[styles.lockCircle, error && styles.lockCircleError]}>
          <Lock size={32} color={error ? "#F43F5E" : "#0EA5E9"} />
        </View>
        <Text style={styles.title}>Secure Access</Text>
        <Text style={styles.subtitle}>
          Enter 4-digit PIN to unlock balance info
        </Text>

        <View style={styles.pinDisplayWrapper}>
          <Animated.View
            style={[
              styles.dotsRow,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.dotContainer]}>
                {pin.length > i ? (
                  showPin ? (
                    <Text style={styles.visiblePinText}>{pin[i]}</Text>
                  ) : (
                    <View style={styles.dotFilled} />
                  )
                ) : (
                  <View style={[styles.dotEmpty, error && styles.dotError]} />
                )}
              </View>
            ))}
          </Animated.View>
          <TouchableOpacity
            onPress={() => setShowPin(!showPin)}
            style={styles.eyeBtn}
          >
            {showPin ? (
              <EyeOff size={22} color="#0EA5E9" />
            ) : (
              <Eye size={22} color="#0EA5E9" />
            )}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <ShieldAlert size={16} color="#F43F5E" />
            <Text style={styles.errorText}>Incorrect PIN. Try again.</Text>
          </View>
        )}
      </View>

      <View style={styles.keypadWrapper}>
        <View style={styles.keypad}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map(
            (val, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.key,
                  val === "" && { backgroundColor: "transparent" },
                ]}
                onPress={() =>
                  val === "del"
                    ? setPin((p) => p.slice(0, -1))
                    : val !== "" && handlePress(val)
                }
                disabled={val === "" || (error && pin.length === 0)}
              >
                {val === "del" ? (
                  <Delete size={28} color="#FFF" />
                ) : (
                  <Text style={styles.keyText}>{val}</Text>
                )}
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Forgot Security PIN?</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const TransactionRow = ({ title, date, amt, type }: any) => (
  <View style={styles.txRow}>
    <View
      style={[
        styles.txIcon,
        { backgroundColor: type === "in" ? "#F0FDF4" : "#FFF1F2" },
      ]}
    >
      {type === "in" ? (
        <ArrowDownLeft size={22} color="#10B981" />
      ) : (
        <ArrowUpRight size={22} color="#F43F5E" />
      )}
    </View>
    <View style={{ flex: 1, marginLeft: 15 }}>
      <Text style={styles.txTitle}>{title}</Text>
      <Text style={styles.txDate}>{date}</Text>
    </View>
    <Text
      style={[styles.txAmt, { color: type === "in" ? "#10B981" : "#1E293B" }]}
    >
      {amt}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#002D72",
    justifyContent: "space-between", // Pushes header/info up and forgot btn down
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 60,
  },
  backBtnHeader: { width: 40, height: 40, justifyContent: "center" },
  pinInfo: { alignItems: "center", paddingBottom: 20 },
  lockCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  lockCircleError: { backgroundColor: "rgba(244, 63, 94, 0.2)" },
  title: { fontSize: 24, fontWeight: "800", color: "#FFF", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 30 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244, 63, 94, 0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 20,
    gap: 8,
  },
  errorText: { color: "#F43F5E", fontSize: 13, fontWeight: "700" },
  pinDisplayWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  dotsRow: { flexDirection: "row", gap: 15 },
  dotContainer: {
    width: 30,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dotEmpty: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#0EA5E9",
  },
  dotFilled: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0EA5E9",
  },
  dotError: { borderColor: "#F43F5E" },
  visiblePinText: { color: "#FFF", fontSize: 24, fontWeight: "700" },
  eyeBtn: { position: "absolute", right: 50, padding: 10 },
  keypadWrapper: { flex: 2, justifyContent: "center" }, // More space for keypad
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  key: {
    width: "28%",
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  keyText: { color: "#FFF", fontSize: 28, fontWeight: "600" },
  forgotBtn: { alignSelf: "center", paddingVertical: 15 },
  forgotText: { color: "#0EA5E9", fontWeight: "700", fontSize: 14 },

  verifiedContainer: { flex: 1, backgroundColor: "#F0F9FF" },
  verifiedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 70,
  },
  backBtnCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#002D72",
    letterSpacing: 1,
  },
  secureIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  balanceCard: {
    backgroundColor: "#FFF",
    padding: 25,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 5,
  },
  balanceMainText: { fontSize: 42, fontWeight: "800", color: "#002D72" },
  updateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  updateText: { fontSize: 11, fontWeight: "700", color: "#10B981" },
  historySection: { marginTop: 25 },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  historyTitle: { fontSize: 17, fontWeight: "800", color: "#002D72" },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    elevation: 1,
  },
  txIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  txTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  txDate: { fontSize: 11, color: "#94A3B8" },
  txAmt: { fontSize: 16, fontWeight: "800" },
  doneBtn: {
    backgroundColor: "#002D72",
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  doneBtnText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1,
  },
});
