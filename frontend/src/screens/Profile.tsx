import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft,
  Bell,
  Camera,
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../services/authService";
import { accountService } from "../services/accountService";

interface ProfileData {
  name: string;
  customerId: string;
  phone: string;
  email: string;
  accountNumber: string;
  balance: number | null;
  accountType: string;
  hasPinSet: boolean;
}

const INITIAL_PROFILE: ProfileData = {
  name: "",
  customerId: "",
  phone: "",
  email: "",
  accountNumber: "",
  balance: null,
  accountType: "",
  hasPinSet: false,
};

export default function Profile({ navigation }: any) {
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Load from local cache first for instant display
      const cached = await getCachedProfile();
      if (cached) setProfile(cached);

      // Fetch from both auth-service (user details) and account-service (account info) in parallel
      const [userRes, accountRes] = await Promise.allSettled([
        authService.getUserDashboard(),
        accountService.getAccountDetails(),
      ]);

      const user = userRes.status === "fulfilled" ? userRes.value : null;
      const account = accountRes.status === "fulfilled" ? accountRes.value : null;

      const updated: ProfileData = {
        name: user?.firstName || cached?.name || "",
        customerId: user?.customerId ? `NX-${user.customerId}` : cached?.customerId || "",
        phone: user?.mobile || cached?.phone || "",
        email: user?.email || cached?.email || "",
        accountNumber: account?.accountNumber || cached?.accountNumber || "",
        balance: account?.balance !== undefined ? Number(account.balance) : cached?.balance ?? null,
        accountType: account?.status ? formatAccountType(account.status) : cached?.accountType || "",
        hasPinSet: user?.hasPinSet ?? cached?.hasPinSet ?? false,
      };

      setProfile(updated);
      await cacheProfile(updated);
    } catch (err) {
      console.log("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCachedProfile = async (): Promise<ProfileData | null> => {
    try {
      const raw = await AsyncStorage.getItem("profile_cache");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const cacheProfile = async (data: ProfileData) => {
    try {
      await AsyncStorage.setItem("profile_cache", JSON.stringify(data));
    } catch { /* ignore */ }
  };

  const formatAccountType = (status: string) => {
    if (status === "ACTIVE") return "Savings Account";
    if (status === "FROZEN") return "Frozen Account";
    return status;
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          await AsyncStorage.removeItem("profile_cache");
          navigation.replace("Login");
        },
      },
    ]);
  };

  const menuItems = [
    { icon: User, label: "Personal Details", route: "PersonalDetails", inUse: true },
    {
      icon: ShieldCheck,
      label: "Security Settings",
      route: "SetTransactionPin",
      inUse: true,
      badge: !profile.hasPinSet ? "SET PIN" : undefined,
    },
    { icon: CreditCard, label: "Linked Accounts", route: "", inUse: false },
    { icon: Bell, label: "Notifications", route: "", inUse: false },
    { icon: FileText, label: "Statements", route: "", inUse: false },
    { icon: HelpCircle, label: "Help & Support", route: "", inUse: false },
    { icon: Settings, label: "App Settings", route: "", inUse: false },
  ];

  const handleNavigation = (route: string) => {
    if (route && navigation.navigate) {
      navigation.navigate(route);
    }
  };

  // ── Skeleton loader ──────────────────────────────────────────────────────
  const Skeleton = ({ width, height, style }: any) => (
    <View
      style={[
        { width, height, backgroundColor: "#E2E8F0", borderRadius: 8 },
        style,
      ]}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
              <ArrowLeft size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ACCOUNT PROFILE</Text>
            <View style={styles.circleBtn} />
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCardWrapper}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarInner}>
                {loading ? (
                  <Skeleton width={40} height={40} style={{ borderRadius: 8 }} />
                ) : (
                  <Text style={styles.initialsText}>{getInitials(profile.name)}</Text>
                )}
              </View>
              <TouchableOpacity style={styles.cameraBtn}>
                <Camera size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <>
                <Skeleton width={140} height={22} style={{ marginBottom: 8 }} />
                <Skeleton width={90} height={18} style={{ borderRadius: 10 }} />
              </>
            ) : (
              <>
                <Text style={styles.userName}>{profile.name || "—"}</Text>
                {profile.customerId ? (
                  <View style={styles.idBadge}>
                    <Text style={styles.idText}>ID: {profile.customerId}</Text>
                  </View>
                ) : null}
              </>
            )}

            {/* Contact row */}
            <View style={styles.contactRow}>
              <View style={styles.contactItem}>
                <Smartphone size={14} color="#0EA5E9" />
                <Text style={styles.contactLabel}>MOBILE</Text>
                {loading ? (
                  <Skeleton width={80} height={14} style={{ marginTop: 4 }} />
                ) : (
                  <Text style={styles.contactValue}>{profile.phone || "—"}</Text>
                )}
              </View>
              <View style={[styles.contactItem, { borderLeftWidth: 1, borderColor: "#F1F5F9" }]}>
                <Mail size={14} color="#0EA5E9" />
                <Text style={styles.contactLabel}>EMAIL</Text>
                {loading ? (
                  <Skeleton width={100} height={14} style={{ marginTop: 4 }} />
                ) : (
                  <Text style={styles.contactValue} numberOfLines={1}>
                    {profile.email || "—"}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Account Details Card */}
        <View style={styles.accountCardWrapper}>
          <View style={styles.accountCard}>
            <Text style={styles.accountCardTitle}>ACCOUNT DETAILS</Text>

            <View style={styles.accountRow}>
              <View style={styles.accountField}>
                <Text style={styles.accountFieldLabel}>ACCOUNT NUMBER</Text>
                {loading ? (
                  <Skeleton width={120} height={18} style={{ marginTop: 4 }} />
                ) : (
                  <Text style={styles.accountFieldValue}>
                    {profile.accountNumber || "—"}
                  </Text>
                )}
              </View>
              <View style={styles.accountField}>
                <Text style={styles.accountFieldLabel}>ACCOUNT TYPE</Text>
                {loading ? (
                  <Skeleton width={90} height={18} style={{ marginTop: 4 }} />
                ) : (
                  <Text style={styles.accountFieldValue}>{profile.accountType || "—"}</Text>
                )}
              </View>
            </View>

            <View style={styles.balanceBlock}>
              <Text style={styles.accountFieldLabel}>AVAILABLE BALANCE</Text>
              {loading ? (
                <Skeleton width={160} height={28} style={{ marginTop: 6 }} />
              ) : (
                <Text style={styles.balanceAmount}>
                  {profile.balance !== null
                    ? `₹${Number(profile.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "—"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>SETTINGS & SECURITY</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, !item.inUse && { opacity: 0.35 }]}
              onPress={() => handleNavigation(item.route)}
              disabled={!item.inUse}
            >
              <View style={styles.menuIconBox}>
                <item.icon size={20} color="#0EA5E9" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.badge && (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>{item.badge}</Text>
                </View>
              )}
              <ChevronRight size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={styles.logoutWrapper}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" style={{ marginRight: 10 }} />
            <Text style={styles.logoutText}>LOGOUT SECURELY</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>NexusBank v2.4.0 • Encrypted Connection</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#001F3F" },
  container: { flex: 1, backgroundColor: "#F0F9FF" },
  header: {
    backgroundColor: "#001F3F",
    paddingTop: 20, paddingBottom: 80, paddingHorizontal: 20,
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  circleBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { color: "#FFF", fontSize: 12, fontWeight: "900", letterSpacing: 2 },

  profileCardWrapper: { paddingHorizontal: 20, marginTop: -60 },
  profileCard: {
    backgroundColor: "#FFF", borderRadius: 35, padding: 25, alignItems: "center",
    elevation: 15, shadowColor: "#001F3F", shadowOpacity: 0.1, shadowRadius: 20,
  },
  avatarContainer: { marginBottom: 15 },
  avatarInner: {
    width: 96, height: 96, borderRadius: 32, backgroundColor: "#F0F9FF",
    justifyContent: "center", alignItems: "center",
    borderWidth: 4, borderColor: "#FFF", elevation: 5,
  },
  initialsText: { fontSize: 32, fontWeight: "900", color: "#001F3F" },
  cameraBtn: {
    position: "absolute", bottom: -5, right: -5,
    width: 36, height: 36, borderRadius: 14,
    backgroundColor: "#0EA5E9",
    justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: "#FFF",
  },
  userName: { fontSize: 20, fontWeight: "900", color: "#001F3F" },
  idBadge: {
    marginTop: 6, backgroundColor: "#E0F2FE",
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10,
  },
  idText: { fontSize: 10, fontWeight: "900", color: "#0EA5E9", letterSpacing: 1 },
  contactRow: {
    flexDirection: "row", marginTop: 25, paddingTop: 20,
    borderTopWidth: 1, borderColor: "#F1F5F9",
  },
  contactItem: { flex: 1, alignItems: "center", paddingHorizontal: 10 },
  contactLabel: { fontSize: 9, fontWeight: "900", color: "#94A3B8", marginTop: 4, letterSpacing: 1 },
  contactValue: { fontSize: 11, fontWeight: "700", color: "#001F3F", marginTop: 2 },

  // Account card (new — replaces hardcoded portfolio card)
  accountCardWrapper: { paddingHorizontal: 20, marginTop: 20 },
  accountCard: {
    backgroundColor: "#002D72", borderRadius: 25, padding: 22,
    elevation: 4,
  },
  accountCardTitle: {
    fontSize: 10, fontWeight: "900", color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.5, marginBottom: 16,
  },
  accountRow: { flexDirection: "row", marginBottom: 16 },
  accountField: { flex: 1 },
  accountFieldLabel: {
    fontSize: 9, fontWeight: "900", color: "rgba(255,255,255,0.5)", letterSpacing: 1,
  },
  accountFieldValue: { fontSize: 14, fontWeight: "800", color: "#FFF", marginTop: 4 },
  balanceBlock: {
    paddingTop: 16, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  balanceAmount: { fontSize: 26, fontWeight: "900", color: "#38BDF8", marginTop: 6 },

  // Menu
  menuSection: { paddingHorizontal: 20, marginTop: 30 },
  sectionHeader: {
    fontSize: 11, fontWeight: "900", color: "#64748B",
    letterSpacing: 2, marginBottom: 15, marginLeft: 5,
  },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF", padding: 14, borderRadius: 18, marginBottom: 10,
    borderWidth: 1, borderColor: "#F1F5F9",
  },
  menuIconBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "#F0F9FF",
    justifyContent: "center", alignItems: "center", marginRight: 15,
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: "700", color: "#001F3F" },
  menuBadge: {
    backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, marginRight: 8,
  },
  menuBadgeText: { fontSize: 9, fontWeight: "900", color: "#D97706" },

  logoutWrapper: { paddingHorizontal: 20, marginTop: 20, marginBottom: 40 },
  logoutBtn: {
    height: 60, backgroundColor: "#FEF2F2", borderRadius: 20,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
  },
  logoutText: { color: "#EF4444", fontWeight: "900", fontSize: 14, letterSpacing: 1 },
  versionText: {
    textAlign: "center", color: "#94A3B8", fontSize: 10,
    fontWeight: "700", marginTop: 20, letterSpacing: 1,
  },
});
