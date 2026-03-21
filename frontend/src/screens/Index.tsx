import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowUpRight, Bell, ChevronRight, CreditCard, Eye, EyeOff,
  FileText, Globe, Heart, Home, LayoutGrid, ScanLine, Search,
  ShieldCheck, Smartphone, TrendingUp, Wallet, Zap,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Dimensions, Platform, RefreshControl,
  ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { accountService } from "../services/accountService";
import { authService } from "../services/authService";
import { transactionService } from "../services/transactionService";

const { width: windowWidth } = Dimensions.get("window");
const IS_WIDE = windowWidth > 500;
const CARD_WIDTH = IS_WIDE ? Math.min(windowWidth * 0.88, 420) : windowWidth * 0.85;

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning 🌅";
  if (h < 17) return "Good Afternoon ☀️";
  return "Good Evening 🌙";
};

export default function HomeScreen({ navigation }: any) {
  // FIX: Default balances to VISIBLE (true) so balance shows on load without tapping the eye
  const [visibleBalances, setVisibleBalances] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState({ firstName: "", initials: "U" });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const txIcons = [CreditCard, Zap, Wallet, FileText, Smartphone];
  const txColors = ["#F472B6", "#FB923C", "#4ADE80", "#60A5FA", "#A78BFA"];

  const loadData = useCallback(async () => {
    // Step 1: Load stored name immediately for instant display
    const storedName = await AsyncStorage.getItem("user_name");
    const storedMobile = await AsyncStorage.getItem("user_mobile");
    const displayName = storedName && storedName !== storedMobile ? storedName : (storedMobile || "User");
    setUserProfile({
      firstName: displayName,
      initials: displayName.charAt(0).toUpperCase(),
    });

    // Step 2: Fetch real data from all services in parallel
    try {
      const [accResult, txResult, dashResult] = await Promise.allSettled([
        accountService.getAccountDetails(),
        transactionService.getTransactionHistory(),
        authService.getUserDashboard(),
      ]);

      if (dashResult.status === "fulfilled" && dashResult.value) {
        const dash = dashResult.value;
        const name = dash.firstName || dash.name || dash.mobile;
        if (name && name.trim() !== "" && name !== storedMobile) {
          setUserProfile({ firstName: name, initials: name.charAt(0).toUpperCase() });
          await AsyncStorage.setItem("user_name", name);
        }
      }

      // Process account data
      let accountsLoaded = false;
      if (accResult.status === "fulfilled" && accResult.value) {
        const raw = accResult.value;

        const list: any[] = Array.isArray(raw)
          ? raw
          : raw.accounts
          ? raw.accounts
          : raw.account
          ? [raw.account]
          : raw.balance !== undefined || raw.availableBalance !== undefined
          ? [raw]
          : [];

        if (list.length > 0) {
          const COLORS = ["#002D72", "#1E293B", "#4338CA", "#0F172A"];
          const TAGS = ["PRIMARY", "BUSINESS", "INVEST", "SAVINGS"];
          const mapped = list.map((acc: any, i: number) => {
            const bal = acc.balance ?? acc.availableBalance ?? acc.currentBalance ?? 0;
            const id = acc.id || acc.accountId || acc.accountNumber || String(i + 1);
            return {
              id,
              type: (acc.accountType || acc.type || "SAVINGS ACCOUNT").toUpperCase(),
              name: acc.accountName || acc.name || acc.holderName || "My Account",
              balance: Number(bal).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
              rawBalance: Number(bal),
              accNo: acc.accountNumber
                ? `**** ${String(acc.accountNumber).slice(-4)}`
                : "**** ****",
              color: COLORS[i % COLORS.length],
              tag: TAGS[i % TAGS.length],
            };
          });
          setAccounts(mapped);
          // FIX: Mark all loaded accounts as visible by default
          const defaultVisible: { [key: string]: boolean } = {};
          mapped.forEach((a) => { defaultVisible[a.id] = true; });
          setVisibleBalances(defaultVisible);
          accountsLoaded = true;
        }
      }

      if (!accountsLoaded) {
        const mobile = storedMobile || "";
        const fallbackId = "1";
        setAccounts([{
          id: fallbackId,
          type: "SAVINGS ACCOUNT",
          name: "My Account",
          balance: "0.00",
          rawBalance: 0,
          accNo: mobile ? `**** ${mobile.slice(-4)}` : "**** ****",
          color: "#002D72",
          tag: "PRIMARY",
        }]);
        // FIX: Also default the fallback card to visible
        setVisibleBalances({ [fallbackId]: true });
      }

      // Process transactions
      if (txResult.status === "fulfilled" && Array.isArray(txResult.value) && txResult.value.length > 0) {
        const recent = txResult.value.slice(0, 5).map((tx: any, i: number) => {
          const rawType = (tx.type || tx.transactionType || "").toUpperCase();
          const isCredit = rawType === "CREDIT" || rawType === "DEPOSIT";
          return {
            title: tx.description || tx.merchant || tx.narration ||
                   (tx.toAccountNumber ? `Transfer to ${tx.toAccountNumber}` : "Transaction"),
            date: (tx.date || tx.createdAt)
              ? new Date(tx.date || tx.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                })
              : "",
            amt: isCredit
              ? `+ ₹${Number(tx.amount).toLocaleString("en-IN")}`
              : `- ₹${Number(tx.amount).toLocaleString("en-IN")}`,
            icon: txIcons[i % txIcons.length],
            color: isCredit ? "#4ADE80" : txColors[i % txColors.length],
            type: rawType,
          };
        });
        setRecentTransactions(recent);
      } else {
        setRecentTransactions([]);
      }

    } catch (err: any) {
      if (err?.message === "UNAUTHORIZED") {
        await authService.logout();
        navigation.replace("Login");
        return;
      }
      const mobile = storedMobile || "";
      const fallbackId = "1";
      setAccounts([{
        id: fallbackId, type: "SAVINGS ACCOUNT", name: "My Account",
        balance: "0.00", rawBalance: 0,
        accNo: mobile ? `**** ${mobile.slice(-4)}` : "**** ****",
        color: "#002D72", tag: "PRIMARY",
      }]);
      setVisibleBalances({ [fallbackId]: true });
      setRecentTransactions([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const toggleBalance = (id: string) =>
    setVisibleBalances((p) => ({ ...p, [id]: !p[id] }));

  const renderCard = (item: any) => {
    const isVisible = visibleBalances[item.id] !== false; // default true
    return (
      <View key={item.id} style={[styles.premiumCard, { backgroundColor: item.color, width: CARD_WIDTH }, !IS_WIDE && { marginRight: 16 }]}>
        <View style={styles.cardGlow} />
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.accountTypeRow}>
              <Text style={styles.cardTagText}>{item.type}</Text>
              <View style={styles.miniTag}><Text style={styles.miniTagText}>{item.tag}</Text></View>
            </View>
            <Text style={styles.cardNameText}>{item.name}</Text>
          </View>
          <Text style={styles.visaText}>VISA</Text>
        </View>
        <View style={styles.cardMidSection}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
            <View style={styles.goldChip} />
            <Text style={styles.cardAccNumber}>{item.accNo}</Text>
          </View>
        </View>
        <View style={styles.balanceSection}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <View style={styles.balanceAmountRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Text style={styles.mainBalance}>{isVisible ? item.balance : "••••••••"}</Text>
              <TouchableOpacity onPress={() => toggleBalance(item.id)} style={styles.eyeBtn}>
                {isVisible ? <Eye size={18} color="#FFF" /> : <EyeOff size={18} color="#FFF" />}
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.cardActionCircle}><CreditCard size={18} color="#FFF" /></TouchableOpacity>
            <TouchableOpacity style={styles.cardActionCircle} onPress={() => navigation.navigate("Invest")}>
              <TrendingUp size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.outerContainer, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 14, fontSize: 14, fontWeight: "600" }}>
          Loading your account...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#002D72" />

      {/* Header */}
      <View style={styles.brandingSection}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userProfile.initials}</Text>
              </View>
              <View>
                <Text style={styles.greetingText}>{getGreeting()}</Text>
                <Text style={styles.userName}>{userProfile.firstName}</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconCircle}><Search size={20} color="#FFF" /></TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle}><Bell size={20} color="#FFF" /></TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <View style={styles.formContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002D72" />}
        >
          {/* Account Cards */}
          <View style={styles.cardScrollWrapper}>
            {IS_WIDE ? (
              <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
                {accounts.map(renderCard)}
              </View>
            ) : (
              <ScrollView
                horizontal showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 16} decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {accounts.map(renderCard)}
              </ScrollView>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.whiteCard}>
            <View style={styles.actionGrid}>
              {[
                { label: "Send Money", icon: ArrowUpRight, color: "#3B82F6", route: "Transfer", active: true },
                { label: "Scan & Pay", icon: ScanLine, color: "#10B981", route: "", active: false },
                { label: "Pay Bills", icon: FileText, color: "#F59E0B", route: "", active: false },
                { label: "Recharge", icon: Smartphone, color: "#8B5CF6", route: "", active: false },
                { label: "FASTag", icon: Zap, color: "#EF4444", route: "", active: false },
                { label: "Invest", icon: Globe, color: "#06B6D4", route: "Invest", active: true },
                { label: "Insurance", icon: ShieldCheck, color: "#F43F5E", route: "", active: false },
                { label: "Loans", icon: LayoutGrid, color: "#6366F1", route: "", active: false },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  disabled={!item.active}
                  style={[styles.actionBtn, !item.active && { opacity: 0.4 }]}
                  onPress={() => item.route && navigation.navigate(item.route)}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: item.active ? `${item.color}18` : "#F1F5F9" }]}>
                    <item.icon size={22} color={item.active ? item.color : "#94A3B8"} />
                  </View>
                  <Text style={[styles.actionText, !item.active && { color: "#94A3B8" }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Promo Banner */}
          <TouchableOpacity style={styles.promoBanner}>
            <View style={styles.promoContent}>
              <View style={styles.promoIcon}><Heart size={20} color="#FFF" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promoTitle}>Refer & Earn ₹500</Text>
                <Text style={styles.promoSub}>Invite friends and earn rewards</Text>
              </View>
              <View style={styles.joinBtn}>
                <Text style={styles.joinText}>JOIN</Text>
                <ChevronRight size={14} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Recent Activity */}
          <View style={styles.activitySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Transactions")}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentTransactions.length === 0 ? (
              <View style={styles.emptyTx}>
                <Wallet size={32} color="#CBD5E1" />
                <Text style={styles.emptyTxText}>No recent transactions</Text>
              </View>
            ) : (
              recentTransactions.map((tx, i) => (
                <View key={i} style={styles.txRow}>
                  <View style={[styles.txIconBg, { backgroundColor: `${tx.color}18` }]}>
                    <tx.icon size={18} color={tx.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.txTitle}>{tx.title}</Text>
                    {tx.date ? <Text style={styles.txDate}>{tx.date}</Text> : null}
                  </View>
                  {tx.amt ? (
                    <Text style={[styles.txAmt, { color: tx.amt.includes("+") ? "#10B981" : "#1E293B" }]}>
                      {tx.amt}
                    </Text>
                  ) : null}
                </View>
              ))
            )}
          </View>

          <View style={styles.footerInfo}>
            <ShieldCheck size={14} color="#94A3B8" />
            <Text style={styles.footerText}>AES-256 ENCRYPTED & SECURE</Text>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Tab */}
      <View style={styles.bottomTab}>
        {[
          { label: "HOME", icon: Home, route: "Dashboard", active: true },
          { label: "PAYMENTS", icon: Wallet, route: "Payments", active: false },
          { label: "CARDS", icon: CreditCard, route: "Cards", active: false },
          { label: "INVEST", icon: Zap, route: "Invest", active: false },
          { label: "MORE", icon: LayoutGrid, route: "Profile", active: false },
        ].map((tab, i) => (
          <TouchableOpacity
            key={i}
            style={styles.tabItem}
            onPress={() => navigation.navigate(tab.route)}
          >
            <tab.icon size={22} color={tab.active ? "#002D72" : "#94A3B8"} />
            <Text style={[styles.tabText, tab.active && { color: "#002D72" }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#002D72" },
  brandingSection: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: Platform.OS === "web" ? 20 : 0, backgroundColor: "#002D72" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: "#FBBF24", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#002D72", fontWeight: "900", fontSize: 18 },
  userName: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  greetingText: { fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: "600" },
  headerIcons: { flexDirection: "row", gap: 8 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  formContainer: { flex: 1, backgroundColor: "#E8F4FD" },
  scrollContent: { paddingBottom: 110, paddingTop: 20 },
  cardScrollWrapper: { paddingVertical: 10 },
  premiumCard: { height: 210, borderRadius: 32, padding: 22, justifyContent: "space-between", overflow: "hidden", elevation: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 15 },
  cardGlow: { position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.07)" },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  accountTypeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  cardTagText: { color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: "800" },
  cardNameText: { color: "#FFF", fontSize: 17, fontWeight: "800" },
  visaText: { color: "#FFF", fontSize: 22, fontWeight: "900", fontStyle: "italic", letterSpacing: 1 },
  miniTag: { backgroundColor: "#FBBF24", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  miniTagText: { fontSize: 9, fontWeight: "900", color: "#002D72" },
  cardMidSection: { marginVertical: 8 },
  goldChip: { width: 42, height: 30, backgroundColor: "#FCD34D", borderRadius: 6 },
  cardAccNumber: { color: "#FFF", fontSize: 17, fontWeight: "600", letterSpacing: 2, opacity: 0.85 },
  balanceSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  balanceLabel: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "700", marginBottom: 4 },
  balanceAmountRow: { flexDirection: "row", alignItems: "center" },
  currencySymbol: { color: "#FFF", fontSize: 20, fontWeight: "700", marginRight: 3 },
  mainBalance: { color: "#FFF", fontSize: 26, fontWeight: "900" },
  eyeBtn: { marginLeft: 10, opacity: 0.75 },
  cardActionCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.12)", justifyContent: "center", alignItems: "center" },
  whiteCard: { backgroundColor: "#FFF", marginHorizontal: 20, borderRadius: 28, padding: 18, elevation: 2, marginTop: 8 },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  actionBtn: { alignItems: "center", width: "24%", marginVertical: 12 },
  actionIconBox: { width: 54, height: 54, borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  actionText: { fontSize: 11, fontWeight: "700", color: "#475569", textAlign: "center" },
  promoBanner: { backgroundColor: "#002D72", margin: 20, borderRadius: 24, padding: 18 },
  promoContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  promoIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  promoTitle: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  promoSub: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  joinBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  joinText: { color: "#FFF", fontSize: 11, fontWeight: "900", marginRight: 4 },
  activitySection: { paddingHorizontal: 20, paddingBottom: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, alignItems: "center" },
  sectionLabel: { fontSize: 13, fontWeight: "900", color: "#002D72", letterSpacing: 0.5 },
  viewAll: { fontSize: 13, color: "#3B82F6", fontWeight: "800" },
  emptyTx: { backgroundColor: "#FFF", borderRadius: 20, padding: 30, alignItems: "center", gap: 10 },
  emptyTxText: { color: "#94A3B8", fontWeight: "600", fontSize: 14 },
  txRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", padding: 15, borderRadius: 20, marginBottom: 12 },
  txIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  txTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  txDate: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  txAmt: { fontSize: 15, fontWeight: "800" },
  footerInfo: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginVertical: 15 },
  footerText: { fontSize: 10, color: "#94A3B8", fontWeight: "800", letterSpacing: 1 },
  bottomTab: {
    position: "absolute", bottom: 0, width: "100%", height: 80,
    backgroundColor: "#FFF", flexDirection: "row", justifyContent: "space-around",
    alignItems: "center", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingBottom: 10, elevation: 25, zIndex: 10,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 20,
  },
  tabItem: { alignItems: "center", paddingHorizontal: 8 },
  tabText: { fontSize: 9, fontWeight: "900", color: "#94A3B8", marginTop: 4 },
});
