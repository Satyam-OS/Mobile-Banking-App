import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Heart,
  Home,
  LayoutGrid,
  ScanLine,
  Search,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: windowWidth } = Dimensions.get("window");

// Responsive Logic
const IS_WIDE = windowWidth > 900;
const MOBILE_CARD_WIDTH = windowWidth * 0.85;
const WEB_CARD_WIDTH = 320;

const HomeScreen = ({ navigation }: any) => {
  // FIXED: Track balance visibility per card ID
  const [visibleBalances, setVisibleBalances] = useState<{
    [key: string]: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  const [userProfile, setUserProfile] = useState({
    firstName: "User",
    initials: "U",
  });

  const [accounts, setAccounts] = useState([
    {
      id: "1",
      type: "SAVINGS ACCOUNT",
      name: "Savings Account",
      balance: "₹2,85,750.50",
      accNo: "**** 3456",
      color: "#002D72",
      tag: "PRIMARY",
    },
    {
      id: "2",
      type: "CURRENT ACCOUNT",
      name: "Business Account",
      balance: "₹12,40,000.00",
      accNo: "**** 7654",
      color: "#1E293B",
      tag: "BUSINESS",
    },
    {
      id: "3",
      type: "FD ACCOUNT",
      name: "Fixed Deposit",
      balance: "₹5,00,000.00",
      accNo: "**** 1234",
      color: "#4338CA",
      tag: "INVEST",
    },
  ]);

  const [recentTransactions, setRecentTransactions] = useState([
    {
      title: "Amazon Shopping",
      date: "14 Dec 2024",
      amt: "- ₹2,499.00",
      icon: CreditCard,
      color: "#F472B6",
    },
    {
      title: "Swiggy Food Order",
      date: "14 Dec 2024",
      amt: "- ₹850.00",
      icon: Zap,
      color: "#FB923C",
    },
    {
      title: "Salary Credit",
      date: "12 Dec 2024",
      amt: "+ ₹75,000.00",
      icon: Wallet,
      color: "#4ADE80",
    },
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedName = await AsyncStorage.getItem("user_name");
        if (storedName) {
          setUserProfile({
            firstName: storedName,
            initials: storedName.charAt(0).toUpperCase(),
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Toggle helper for specific card
  const toggleBalance = (id: string) => {
    setVisibleBalances((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderCard = (item: any) => {
    const isVisible = !!visibleBalances[item.id];

    return (
      <View
        key={item.id}
        style={[
          styles.premiumCard,
          {
            backgroundColor: item.color,
            width: IS_WIDE ? WEB_CARD_WIDTH : MOBILE_CARD_WIDTH,
          },
          !IS_WIDE && { marginRight: 15 },
        ]}
      >
        <View style={styles.cardOverlayCircle} />

        <View style={styles.cardTopRow}>
          <View style={styles.cardHeaderInfo}>
            <View style={styles.accountTypeRow}>
              <Text style={styles.cardTagText}>{item.type}</Text>
              <View style={styles.miniTag}>
                <Text style={styles.miniTagText}>{item.tag}</Text>
              </View>
            </View>
            <Text style={styles.cardNameText}>{item.name}</Text>
          </View>
          <Text style={styles.visaText}>VISA</Text>
        </View>

        <View style={styles.cardMidSection}>
          <View style={styles.chipAndNumber}>
            <View style={styles.goldChip} />
            <Text style={styles.cardAccNumber}>
              •••• •••• •••• {item.accNo.split(" ").pop()}
            </Text>
          </View>
        </View>

        <View style={styles.balanceSection}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <View style={styles.balanceAmountRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Text style={styles.mainBalance}>
                {isVisible ? item.balance.replace("₹", "") : "••••••••"}
              </Text>
              <TouchableOpacity
                onPress={() => toggleBalance(item.id)}
                style={styles.eyeBtn}
              >
                {isVisible ? (
                  <Eye size={18} color="#FFF" />
                ) : (
                  <EyeOff size={18} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardActionContainer}>
            <TouchableOpacity style={styles.cardActionCircle}>
              <CreditCard size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardActionCircle}
              onPress={() => navigation.navigate("Invest")}
            >
              <TrendingUp size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.outerContainer, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#002D72" />

      <View style={styles.brandingSection}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userProfile.initials}</Text>
              </View>
              <View>
                <Text style={styles.greetingText}>Good Afternoon 👋</Text>
                <Text style={styles.userName}>{userProfile.firstName}</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconCircle}>
                <Search size={20} color="#002D72" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle}>
                <Bell size={20} color="#002D72" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.formContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.cardScrollWrapper}>
            {IS_WIDE ? (
              <View style={styles.webCardCentering}>
                {accounts.map((item) => renderCard(item))}
              </View>
            ) : (
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                snapToInterval={MOBILE_CARD_WIDTH + 15}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {accounts.map((item) => renderCard(item))}
              </ScrollView>
            )}
          </View>

          <View style={styles.whiteCard}>
            <View style={styles.actionGrid}>
              {[
                {
                  label: "Send Money",
                  icon: ArrowUpRight,
                  color: "#3B82F6",
                  route: "Transfer",
                  active: true,
                },
                {
                  label: "Scan & Pay",
                  icon: ScanLine,
                  color: "#10B981",
                  route: "",
                  active: false,
                },
                {
                  label: "Pay Bills",
                  icon: FileText,
                  color: "#F59E0B",
                  route: "",
                  active: false,
                },
                {
                  label: "Mobile Recharge",
                  icon: Smartphone,
                  color: "#8B5CF6",
                  route: "",
                  active: false,
                },
                {
                  label: "FASTag",
                  icon: Zap,
                  color: "#EF4444",
                  route: "",
                  active: false,
                },
                {
                  label: "Investments",
                  icon: Globe,
                  color: "#06B6D4",
                  route: "Invest",
                  active: true,
                },
                {
                  label: "Insurance",
                  icon: ShieldCheck,
                  color: "#F43F5E",
                  route: "",
                  active: false,
                },
                {
                  label: "Loans",
                  icon: LayoutGrid,
                  color: "#6366F1",
                  route: "",
                  active: false,
                },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  disabled={!item.active}
                  style={[
                    styles.actionBtn,
                    !item.active && { opacity: 0.5 }, // Faded state for inactive buttons
                  ]}
                  onPress={() => item.route && navigation.navigate(item.route)}
                >
                  <View
                    style={[
                      styles.actionIconBox,
                      {
                        backgroundColor: item.active
                          ? `${item.color}15`
                          : "#F1F5F9",
                      },
                    ]}
                  >
                    <item.icon
                      size={22}
                      color={item.active ? item.color : "#94A3B8"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.actionText,
                      !item.active && { color: "#94A3B8" },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.promoBanner}>
            <View style={styles.promoContent}>
              <View style={styles.promoIcon}>
                <Heart size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promoTitle}>Refer & Earn ₹500</Text>
                <Text style={styles.promoSub}>
                  Invite friends and earn rewards
                </Text>
              </View>
              <View style={styles.joinBtn}>
                <Text style={styles.joinText}>JOIN</Text>
                <ChevronRight size={14} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.activitySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Transactions")}
              >
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {recentTransactions.map((tx, i) => (
              <View key={i} style={styles.txRow}>
                <View
                  style={[
                    styles.txIconBg,
                    { backgroundColor: `${tx.color}15` },
                  ]}
                >
                  <tx.icon size={18} color={tx.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text
                  style={[
                    styles.txAmt,
                    { color: tx.amt.includes("+") ? "#10B981" : "#1E293B" },
                  ]}
                >
                  {tx.amt}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.footerInfo}>
            <ShieldCheck size={14} color="#94A3B8" />
            <Text style={styles.footerText}>ENCRYPTED & SECURE</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Home size={22} color="#002D72" />
          <Text style={[styles.tabText, { color: "#002D72" }]}>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Payments")}
        >
          <Wallet size={22} color="#94A3B8" />
          <Text style={styles.tabText}>PAYMENTS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Cards")}
        >
          <CreditCard size={22} color="#94A3B8" />
          <Text style={styles.tabText}>CARDS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Invest")}
        >
          <Zap size={22} color="#94A3B8" />
          <Text style={styles.tabText}>INVEST</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <LayoutGrid size={22} color="#94A3B8" />
          <Text style={styles.tabText}>MORE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#002D72" },
  brandingSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: Platform.OS === "web" ? 20 : 0,
    backgroundColor: "#002D72",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#FBBF24",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#002D72", fontWeight: "900" },
  userName: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  greetingText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  headerIcons: { flexDirection: "row", gap: 8 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#E0F2FE", // Lighter sky blue theme
    zIndex: 1,
  },
  scrollContent: { paddingBottom: 110, paddingTop: 20 },
  cardScrollWrapper: { paddingVertical: 10 },
  webCardCentering: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    paddingHorizontal: 20,
  },
  premiumCard: {
    height: 210,
    borderRadius: 32,
    padding: 22,
    justifyContent: "space-between",
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" },
      default: { elevation: 10 },
    }),
  },
  cardOverlayCircle: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderInfo: { flex: 1 },
  accountTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  cardTagText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "800",
  },
  cardNameText: { color: "#FFF", fontSize: 18, fontWeight: "800" },
  visaText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 1,
  },
  miniTag: {
    backgroundColor: "#FBBF24",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniTagText: { fontSize: 9, fontWeight: "900", color: "#002D72" },
  cardMidSection: { marginVertical: 10 },
  chipAndNumber: { flexDirection: "row", alignItems: "center", gap: 15 },
  goldChip: {
    width: 42,
    height: 32,
    backgroundColor: "#FCD34D",
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(0,0,0,0.1)",
  },
  cardAccNumber: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
    opacity: 0.9,
  },
  balanceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  balanceAmountRow: { flexDirection: "row", alignItems: "center" },
  currencySymbol: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
    marginRight: 4,
  },
  mainBalance: { color: "#FFF", fontSize: 28, fontWeight: "900" },
  eyeBtn: { marginLeft: 12, opacity: 0.7 },
  cardActionContainer: { flexDirection: "row", gap: 10 },
  cardActionCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  whiteCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 18,
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: "0px 4px 10px rgba(0,0,0,0.05)" },
    }),
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionBtn: { alignItems: "center", width: "24%", marginVertical: 12 },
  actionIconBox: {
    width: 54,
    height: 54,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    textAlign: "center",
  },
  promoBanner: {
    backgroundColor: "#002D72",
    margin: 20,
    borderRadius: 24,
    padding: 18,
  },
  promoContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  promoIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  promoTitle: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  promoSub: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  joinText: { color: "#FFF", fontSize: 11, fontWeight: "900", marginRight: 4 },
  activitySection: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#002D72",
    letterSpacing: 0.5,
  },
  viewAll: { fontSize: 13, color: "#3B82F6", fontWeight: "800" },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
  },
  txIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  txTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  txDate: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  txAmt: { fontSize: 15, fontWeight: "800" },
  footerInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginVertical: 15,
  },
  footerText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "800",
    letterSpacing: 1,
  },
  bottomTab: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 85,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 15,
    elevation: 25,
    zIndex: 10,
  },
  tabItem: { alignItems: "center" },
  tabText: { fontSize: 10, fontWeight: "900", color: "#94A3B8", marginTop: 5 },
});

export default HomeScreen;
