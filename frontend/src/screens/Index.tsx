import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowUpRight, Bell, Clock, ChevronRight, CreditCard, Eye, EyeOff, LogOut,
  FileText, Globe, X, Heart, Home, LayoutGrid, ScanLine,
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

const ComingSoonBadge = () => (
  <View style={csBadgeStyle.wrap}>
    <Text style={csBadgeStyle.text}>SOON</Text>
  </View>
);
const csBadgeStyle = StyleSheet.create({
  wrap: {
    position: "absolute", bottom: -4, alignSelf: "center",
    backgroundColor: "#FBBF24", borderRadius: 4,
    paddingHorizontal: 3, paddingVertical: 1, zIndex: 10,
  },
  text: { fontSize: 7, fontWeight: "900", color: "#78350F", letterSpacing: 0.3 },
});

export default function HomeScreen({ navigation }: any) {
  const [visibleBalances, setVisibleBalances] = useState<{ [key: string]: boolean }>({});
  const [isLoading,       setIsLoading]       = useState(true);
  const [refreshing,      setRefreshing]       = useState(false);
  const [userProfile,     setUserProfile]      = useState({ firstName: "", initials: "U" });
  const [accounts,        setAccounts]         = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  // Inline logout confirmation — avoids Alert.alert which doesn't work on web
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut,        setLoggingOut]         = useState(false);
  const [showNotifications, setShowNotifications]  = useState(false);
  const [showComingSoon,    setShowComingSoon]      = useState(false);

  const txIcons  = [CreditCard, Zap, Wallet, FileText, Smartphone];
  const txColors = ["#F472B6", "#FB923C", "#4ADE80", "#60A5FA", "#A78BFA"];

  const doLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
    } catch { /* ignore — clear storage regardless */ }

    // For web: window.location is the most reliable way to get a clean slate
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.href = "/";
      return;
    }

    // For native: reset navigation stack
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const loadData = useCallback(async () => {
    const storedName   = await AsyncStorage.getItem("user_name");
    const storedMobile = await AsyncStorage.getItem("user_mobile");
    const displayName  = storedName && storedName !== storedMobile ? storedName : (storedMobile || "User");
    setUserProfile({ firstName: displayName, initials: displayName.charAt(0).toUpperCase() });

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

      let accountsLoaded = false;
      if (accResult.status === "fulfilled" && accResult.value) {
        const raw = accResult.value;
        const list: any[] = Array.isArray(raw) ? raw
          : raw.accounts ? raw.accounts
          : raw.account  ? [raw.account]
          : (raw.balance !== undefined || raw.availableBalance !== undefined) ? [raw]
          : [];

        if (list.length > 0) {
          const COLORS = ["#002D72", "#1E293B", "#4338CA", "#0F172A"];
          const TAGS   = ["PRIMARY", "BUSINESS", "INVEST", "SAVINGS"];
          const mapped = list.map((acc: any, i: number) => {
            const bal = acc.balance ?? acc.availableBalance ?? acc.currentBalance ?? 0;
            const id  = acc.id || acc.accountId || acc.accountNumber || String(i + 1);
            return {
              id, color: COLORS[i % COLORS.length], tag: TAGS[i % TAGS.length],
              type:       (acc.accountType || acc.type || "SAVINGS ACCOUNT").toUpperCase(),
              name:       acc.accountName || acc.name || acc.holderName || "My Account",
              balance:    Number(bal).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
              rawBalance: Number(bal),
              accNo:      acc.accountNumber ? `**** ${String(acc.accountNumber).slice(-4)}` : "**** ****",
            };
          });
          setAccounts(mapped);
          const dv: { [k: string]: boolean } = {};
          mapped.forEach((a) => { dv[a.id] = true; });
          setVisibleBalances(dv);
          accountsLoaded = true;
        }
      }

      if (!accountsLoaded) {
        const fid = "1";
        setAccounts([{ id: fid, type: "SAVINGS ACCOUNT", name: "My Account", balance: "0.00", rawBalance: 0, accNo: storedMobile ? `**** ${storedMobile.slice(-4)}` : "**** ****", color: "#002D72", tag: "PRIMARY" }]);
        setVisibleBalances({ [fid]: true });
      }

      if (txResult.status === "fulfilled" && Array.isArray(txResult.value) && txResult.value.length > 0) {
        const recent = txResult.value.slice(0, 5).map((tx: any, i: number) => {
          const dir      = (tx as any).direction;
          const rawType  = (tx.type || tx.transactionType || "").toUpperCase();
          const isCredit = dir ? dir === "CREDIT" : (rawType === "CREDIT" || rawType === "DEPOSIT");
          return {
            title: tx.description || tx.merchant || (tx.toAccountNumber ? `Transfer to ${tx.toAccountNumber}` : "Transaction"),
            date:  (tx.date || tx.createdAt) ? new Date(tx.date || tx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
            amt:   isCredit ? `+ ₹${Number(tx.amount).toLocaleString("en-IN")}` : `- ₹${Number(tx.amount).toLocaleString("en-IN")}`,
            icon:  txIcons[i % txIcons.length],
            color: isCredit ? "#4ADE80" : txColors[i % txColors.length],
          };
        });
        setRecentTransactions(recent);
      } else {
        setRecentTransactions([]);
      }
    } catch (err: any) {
      if (err?.message === "UNAUTHORIZED") { await authService.logout(); navigation.replace("Login"); return; }
      const fid = "1";
      setAccounts([{ id: fid, type: "SAVINGS ACCOUNT", name: "My Account", balance: "0.00", rawBalance: 0, accNo: "**** ****", color: "#002D72", tag: "PRIMARY" }]);
      setVisibleBalances({ [fid]: true });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = useCallback(() => { setRefreshing(true); loadData(); }, [loadData]);
  const toggleBalance = (id: string) => setVisibleBalances((p) => ({ ...p, [id]: !p[id] }));

  const renderCard = (item: any) => {
    const isVisible = visibleBalances[item.id] !== false;
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
            <TouchableOpacity style={styles.cardCircleRing} onPress={() => navigation.navigate("Cards")}>
              <CreditCard size={16} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardCircleRing} onPress={() => navigation.navigate("Invest")}>
              <TrendingUp size={16} color="#FFF" />
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
        <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 14, fontSize: 14, fontWeight: "600" }}>Loading your account...</Text>
      </View>
    );
  }

  const quickActions = [
    { label: "Send Money", icon: ArrowUpRight, color: "#3B82F6", route: "Transfer", active: true },
    { label: "Scan & Pay", icon: ScanLine,    color: "#10B981", route: "",          active: false },
    { label: "Pay Bills",  icon: FileText,    color: "#F59E0B", route: "",          active: false },
    { label: "Recharge",   icon: Smartphone,  color: "#8B5CF6", route: "",          active: false },
    { label: "FASTag",     icon: Zap,         color: "#EF4444", route: "",          active: false },
    { label: "Invest",     icon: Globe,       color: "#06B6D4", route: "Invest",    active: true },
    { label: "Insurance",  icon: ShieldCheck, color: "#F43F5E", route: "",          active: false },
    { label: "Loans",      icon: LayoutGrid,  color: "#6366F1", route: "",          active: false },
  ];

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#002D72" />

      {/* ── Inline logout confirmation overlay ── */}
      {showLogoutConfirm && (
        <View style={styles.logoutOverlay}>
          <View style={styles.logoutDialog}>
            <View style={styles.logoutIconBox}>
              <LogOut size={28} color="#EF4444" />
            </View>
            <Text style={styles.logoutDialogTitle}>Logout</Text>
            <Text style={styles.logoutDialogMsg}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.logoutDialogBtns}>
              <TouchableOpacity
                style={styles.logoutCancelBtn}
                onPress={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
              >
                <Text style={styles.logoutCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.logoutConfirmBtn, loggingOut && { opacity: 0.6 }]}
                onPress={doLogout}
                disabled={loggingOut}
              >
                {loggingOut
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={styles.logoutConfirmText}>Logout</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Notification dropdown — white card, professional */}
      {showNotifications && (
        <View style={styles.notifOverlay}>
          <TouchableOpacity style={styles.notifBackdrop} onPress={() => setShowNotifications(false)} activeOpacity={1} />
          <View style={styles.notifDropdown}>
            {/* Header */}
            <View style={styles.notifHeader}>
              <View>
                <Text style={styles.notifTitle}>Notifications</Text>
                <Text style={styles.notifSubtitle}>Recent account activity</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Items */}
            {recentTransactions.length === 0 ? (
              <View style={styles.notifEmpty}>
                <Bell size={32} color="#CBD5E1" />
                <Text style={styles.notifEmptyText}>No recent activity</Text>
              </View>
            ) : (
              recentTransactions.map((tx, i) => {
                const isCredit = tx.amt?.includes("+");
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.notifItem}
                    onPress={() => { setShowNotifications(false); navigation.navigate("Transactions"); }}
                  >
                    <View style={[styles.notifIconBox, { backgroundColor: isCredit ? "#F0FDF4" : "#FEF2F2" }]}>
                      <tx.icon size={16} color={isCredit ? "#10B981" : "#F43F5E"} />
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={styles.notifItemTitle} numberOfLines={1}>{tx.title}</Text>
                      <Text style={styles.notifItemDate}>{tx.date}</Text>
                    </View>
                    <Text style={[styles.notifAmt, { color: isCredit ? "#10B981" : "#EF4444" }]}>
                      {tx.amt}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}

            {/* Footer */}
            <TouchableOpacity
              style={styles.notifFooter}
              onPress={() => { setShowNotifications(false); navigation.navigate("Transactions"); }}
            >
              <Text style={styles.notifFooterText}>View all transactions →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Coming Soon popup */}
      {showComingSoon && (
        <View style={styles.logoutOverlay}>
          <View style={styles.logoutDialog}>
            <View style={[styles.logoutIconBox, { backgroundColor: "#FEF3C7" }]}>
              <Clock size={28} color="#D97706" />
            </View>
            <Text style={styles.logoutDialogTitle}>Coming Soon</Text>
            <Text style={styles.logoutDialogMsg}>
              This feature is still under development and will be live soon. Stay tuned!
            </Text>
            <TouchableOpacity
              style={{ height: 50, paddingHorizontal: 48, borderRadius: 16, backgroundColor: "#0EA5E9", justifyContent: "center", alignItems: "center" }}
              onPress={() => setShowComingSoon(false)}
            >
              <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 15 }}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
              {/* Bell — orange ring, working */}
              <TouchableOpacity
                style={styles.headerRingBtn}
                onPress={() => { setShowLogoutConfirm(false); setShowComingSoon(false); setShowNotifications(v => !v); }}
              >
                <Bell size={20} color="#FFF" />
                {recentTransactions.length > 0 && (
                  <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{recentTransactions.length}</Text></View>
                )}
              </TouchableOpacity>
              {/* Logout — same ring style, consistent with UI */}
              <TouchableOpacity
                style={styles.headerRingBtn}
                onPress={() => setShowLogoutConfirm(true)}
              >
                <LogOut size={20} color="#FFF" />
              </TouchableOpacity>
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
          <View style={styles.cardScrollWrapper}>
            {IS_WIDE ? (
              <View style={{ alignItems: "center", paddingHorizontal: 20 }}>{accounts.map(renderCard)}</View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={CARD_WIDTH + 16} decelerationRate="fast" contentContainerStyle={{ paddingHorizontal: 20 }}>
                {accounts.map(renderCard)}
              </ScrollView>
            )}
          </View>

          <View style={styles.whiteCard}>
            {/* "Only circled buttons are working" banner at top centre of card */}
            <View style={styles.activeBanner}>
              <View style={styles.activeBannerDot} />
              <Text style={styles.activeBannerText}>ONLY CIRCLED BUTTONS ARE WORKING RIGHT NOW</Text>
              <View style={styles.activeBannerDot} />
            </View>

            <View style={styles.actionGrid}>
              {quickActions.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.actionBtn}
                  onPress={() => {
                    if (item.active && item.route) navigation.navigate(item.route);
                    else if (!item.active) setShowComingSoon(true);
                  }}
                >
                  {item.active ? (
                    /* Active — orange circular ring around the icon box */
                    <View style={styles.activeRing}>
                      <View style={[styles.actionIconBox, { backgroundColor: `${item.color}15` }]}>
                        <item.icon size={22} color={item.color} />
                      </View>
                    </View>
                  ) : (
                    /* Inactive — normal icon, full colour, no ring, no fading */
                    <View style={styles.inactiveWrap}>
                      <View style={[styles.actionIconBox, { backgroundColor: `${item.color}12` }]}>
                        <item.icon size={22} color={item.color} />
                      </View>
                    </View>
                  )}
                  <Text style={styles.actionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.promoBanner} onPress={() => navigation.navigate("ReferEarn")}>
            <View style={styles.promoContent}>
              <View style={styles.promoIcon}><Heart size={20} color="#FFF" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promoTitle}>Refer & Earn ₹500</Text>
                <Text style={styles.promoSub}>Invite friends and earn rewards</Text>
              </View>
              <View style={styles.joinRing}>
                <Text style={styles.joinText}>JOIN</Text>
                <ChevronRight size={14} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.activitySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
              <TouchableOpacity style={styles.viewAllRing} onPress={() => navigation.navigate("Transactions")}>
                <Text style={styles.viewAllText}>View All</Text>
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
                    <Text style={[styles.txAmt, { color: tx.amt.includes("+") ? "#10B981" : "#1E293B" }]}>{tx.amt}</Text>
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
          { label: "HOME",     icon: Home,       route: "Dashboard" },
          { label: "PAYMENTS", icon: Wallet,     route: "Payments"  },
          { label: "CARDS",    icon: CreditCard, route: "Cards"     },
          { label: "INVEST",   icon: Zap,        route: "Invest"    },
          { label: "MORE",     icon: LayoutGrid, route: "Profile"   },
        ].map((tab, i) => {
          const isCurrent = tab.route === "Dashboard";
          return (
            <TouchableOpacity key={i} style={styles.tabItem} onPress={() => navigation.navigate(tab.route)}>
              <View style={isCurrent ? styles.tabRingActive : styles.tabRing}>
                <tab.icon size={20} color={isCurrent ? "#F97316" : "#64748B"} />
              </View>
              <Text style={[styles.tabText, isCurrent && { color: "#F97316" }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
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
  logoutBtn: { backgroundColor: "rgba(239,68,68,0.2)" },

  // Inline logout confirmation overlay
  logoutOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)", zIndex: 999,
    justifyContent: "center", alignItems: "center",
  },
  logoutDialog: {
    backgroundColor: "#FFF", borderRadius: 28, padding: 28,
    width: "85%", maxWidth: 340, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 20, elevation: 20,
  },
  logoutIconBox: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: "#FEF2F2",
    justifyContent: "center", alignItems: "center", marginBottom: 16,
  },
  logoutDialogTitle: { fontSize: 20, fontWeight: "900", color: "#1E293B", marginBottom: 8 },
  logoutDialogMsg:   { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  logoutDialogBtns:  { flexDirection: "row", gap: 12, width: "100%" },
  logoutCancelBtn: {
    flex: 1, height: 50, borderRadius: 16, justifyContent: "center", alignItems: "center",
    backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0",
  },
  logoutCancelText: { fontSize: 15, fontWeight: "800", color: "#64748B" },
  logoutConfirmBtn: {
    flex: 1, height: 50, borderRadius: 16, justifyContent: "center", alignItems: "center",
    backgroundColor: "#EF4444",
  },
  logoutConfirmText: { fontSize: 15, fontWeight: "800", color: "#FFF" },

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
  bottomTab: { position: "absolute", bottom: 0, width: "100%", height: 80, backgroundColor: "#FFF", flexDirection: "row", justifyContent: "space-around", alignItems: "center", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 10, elevation: 25, zIndex: 10, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 20 },
  tabItem: { alignItems: "center", paddingHorizontal: 8 },
  tabText: { fontSize: 9, fontWeight: "900", color: "#94A3B8", marginTop: 4 },

  // ── Notification dropdown ──────────────────────────────────────────────
  notifBadge:     { position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: "#EF4444", justifyContent: "center", alignItems: "center" },
  notifBadgeText: { color: "#FFF", fontSize: 8, fontWeight: "900" },
  notifOverlay:   { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 },
  notifBackdrop:  { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  notifDropdown: {
    position: "absolute",
    top: Platform.OS === "web" ? 64 : 90,
    right: 16,
    width: 320,
    backgroundColor: "#FFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  notifHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: "#F1F5F9",
    backgroundColor: "#FAFAFA",
  },
  notifTitle:     { fontSize: 15, fontWeight: "900", color: "#1E293B" },
  notifSubtitle:  { fontSize: 11, color: "#94A3B8", fontWeight: "600", marginTop: 1 },
  notifEmpty:     { padding: 32, alignItems: "center", gap: 12 },
  notifEmptyText: { color: "#94A3B8", fontWeight: "600", fontSize: 14 },
  notifItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 18, paddingVertical: 13,
    borderBottomWidth: 1, borderColor: "#F8FAFC",
  },
  notifIconBox:    { width: 36, height: 36, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  notifContent:    { flex: 1 },
  notifItemTitle:  { fontSize: 13, fontWeight: "700", color: "#1E293B" },
  notifItemDate:   { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  notifAmt:        { fontSize: 14, fontWeight: "900" },
  notifFooter:     { paddingVertical: 13, alignItems: "center", backgroundColor: "#F8FAFC" },
  notifFooterText: { fontSize: 13, color: "#0EA5E9", fontWeight: "800" },

  // ── "Only circled buttons" banner ───────────────────────────────────────
  activeBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginBottom: 14,
  },
  activeBannerDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: "#F97316",
  },
  activeBannerText: {
    fontSize: 9, fontWeight: "900", color: "#F97316",
    letterSpacing: 1.2, textAlign: "center",
  },
  // ── Active icon orange ring / inactive wrapper ─────────────────────────
  activeRing:  { borderRadius: 32, borderWidth: 2, borderColor: "#F97316", padding: 3, marginBottom: 6 },
  inactiveWrap:{ marginBottom: 6 },

  // ── Header ring buttons (Bell + Logout) — consistent orange ring ─────────
  headerRingBtn: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 2, borderColor: "#F97316",
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center", alignItems: "center",
    position: "relative",
  },

  // ── Card action circles — orange ring ─────────────────────────────────
  cardCircleRing: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 2, borderColor: "#F97316",
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },

  // ── JOIN button ring ──────────────────────────────────────────────────
  joinRing: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 2, borderColor: "#F97316",
    borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: "rgba(249,115,22,0.15)",
  },

  // ── View All ring ─────────────────────────────────────────────────────
  viewAllRing: {
    borderWidth: 2, borderColor: "#F97316",
    borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  viewAllText: { fontSize: 12, color: "#F97316", fontWeight: "800" },

  // ── Bottom tab ring styles ─────────────────────────────────────────────
  tabRing: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 2, borderColor: "#F97316",
    justifyContent: "center", alignItems: "center",
    marginBottom: 2,
  },
  tabRingActive: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 2, borderColor: "#F97316",
    backgroundColor: "rgba(249,115,22,0.08)",
    justifyContent: "center", alignItems: "center",
    marginBottom: 2,
  },
});
