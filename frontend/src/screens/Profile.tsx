import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft,
  Bell,
  Camera,
  ChevronRight,
  CreditCard,
  Edit2,
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
  Dimensions,
  Image,
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

const { width } = Dimensions.get("window");

export default function Profile({ navigation }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "User",
    customerId: "NX-XXXXXX",
    phone: "",
    email: "",
    avatar: null,
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Load from cache first for instant display
        const storedName = await AsyncStorage.getItem("user_name");
        const storedMobile = await AsyncStorage.getItem("user_mobile");
        const cachedRaw = await AsyncStorage.getItem("user_data");
        const cached = cachedRaw ? JSON.parse(cachedRaw) : null;

        setUserData({
          name: storedName || cached?.name || "User",
          customerId: cached?.customerId ? `NX-${cached.customerId}` : "NX-XXXXXX",
          phone: storedMobile || cached?.mobile || "",
          email: cached?.email || "",
          avatar: null,
        });

        // Try to get full profile from API
        const profileData = await accountService.getProfile();
        if (profileData) {
          const name = profileData.firstName || profileData.name || profileData.fullName || storedName || "User";
          const mobile = profileData.mobile || profileData.phone || storedMobile || "";
          const email = profileData.email || "";
          const customerId = profileData.customerId || profileData.accountId || cached?.customerId || "";
          setUserData({ name, customerId: customerId ? `NX-${customerId}` : "NX-XXXXXX", phone: mobile, email, avatar: null });
          if (name) await AsyncStorage.setItem("user_name", name);
        }
      } catch (err) {
        console.log("Profile fetch error:", err);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          navigation.replace("Login");
        },
      },
    ]);
  };

  // UPDATED: Added 'inUse' logic based on whether a route exists
  const menuItems = [
    {
      icon: User,
      label: "Personal Details",
      route: "PersonalDetails",
      inUse: true,
    },
    { icon: CreditCard, label: "Linked Accounts", route: "", inUse: false },
    { icon: Bell, label: "Notifications", route: "", inUse: false },
    { icon: ShieldCheck, label: "Security Settings", route: "", inUse: false },
    { icon: Smartphone, label: "Device Management", route: "", inUse: false },
    { icon: FileText, label: "Statements", route: "", inUse: false },
    { icon: HelpCircle, label: "Help & Support", route: "", inUse: false },
    { icon: Settings, label: "App Settings", route: "", inUse: false },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Helper to handle navigation safely
  const handleNavigation = (route: string) => {
    if (route && navigation.navigate) {
      navigation.navigate(route);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.container}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Navy Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={22} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>ACCOUNT PROFILE</Text>

            {/* UPDATED: Added opacity to fade the pencil button since it's not in use */}
            <TouchableOpacity
              style={[styles.circleBtn, { opacity: 0.35 }]}
              onPress={() => setIsEditing(!isEditing)}
              disabled={true}
            >
              <Edit2 size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info Card Overlay */}
        <View style={styles.profileCardWrapper}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarInner}>
                {userData.avatar ? (
                  <Image
                    source={{ uri: userData.avatar }}
                    style={styles.avatarImg}
                  />
                ) : (
                  <Text style={styles.initialsText}>
                    {getInitials(userData.name)}
                  </Text>
                )}
              </View>
              <TouchableOpacity style={styles.cameraBtn}>
                <Camera size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{userData.name}</Text>
            <View style={styles.idBadge}>
              <Text style={styles.idText}>ID: {userData.customerId}</Text>
            </View>

            {/* Quick Contact Info */}
            <View style={styles.contactRow}>
              <View style={styles.contactItem}>
                <Smartphone size={14} color="#0EA5E9" />
                <Text style={styles.contactLabel}>MOBILE</Text>
                <Text style={styles.contactValue}>{userData.phone || "Not available"}</Text>
              </View>
              <View
                style={[
                  styles.contactItem,
                  { borderLeftWidth: 1, borderColor: "#F1F5F9" },
                ]}
              >
                <Mail size={14} color="#0EA5E9" />
                <Text style={styles.contactLabel}>EMAIL</Text>
                <Text style={styles.contactValue} numberOfLines={1}>
                  {userData.email || "Not available"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Portfolio Summary Card (Lighter Sky Blue Theme) */}
        <View style={styles.portfolioWrapper}>
          <TouchableOpacity
            style={styles.portfolioCard}
            onPress={() => handleNavigation("Invest")} // Link to your Invest screen
          >
            <View style={styles.portfolioSide}>
              <Text style={styles.portfolioLabel}>Total VALUE</Text>
              <Text style={styles.portfolioAmount}>$124,500.00</Text>
            </View>
            <View style={styles.divider} />
            <View style={[styles.portfolioSide, { alignItems: "flex-end" }]}>
              <Text style={styles.portfolioLabel}>ACTIVE ASSETS</Text>
              <Text style={styles.portfolioAmount}>04</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Menu Section */}
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
              <ChevronRight size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Action */}
        <View style={styles.logoutWrapper}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#EF4444" style={{ marginRight: 10 }} />
            <Text style={styles.logoutText}>LOGOUT SECURELY</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>
            NexusBank v2.4.0 • Encrypted Connection
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#001F3F" },
  container: { flex: 1, backgroundColor: "#F0F9FF" },

  // Header
  header: {
    backgroundColor: "#001F3F",
    paddingTop: 20,
    paddingBottom: 80,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },

  // Profile Card
  profileCardWrapper: { paddingHorizontal: 20, marginTop: -60 },
  profileCard: {
    backgroundColor: "#FFF",
    borderRadius: 35,
    padding: 25,
    alignItems: "center",
    elevation: 15,
    shadowColor: "#001F3F",
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  avatarContainer: { marginBottom: 15 },
  avatarInner: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFF",
    elevation: 5,
  },
  avatarImg: { width: "100%", height: "100%", borderRadius: 28 },
  initialsText: { fontSize: 32, fontWeight: "900", color: "#001F3F" },
  cameraBtn: {
    position: "absolute",
    bottom: -5,
    right: -5,
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: "#0EA5E9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  userName: { fontSize: 20, fontWeight: "900", color: "#001F3F" },
  idBadge: {
    marginTop: 6,
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  idText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#0EA5E9",
    letterSpacing: 1,
  },
  contactRow: {
    flexDirection: "row",
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
  },
  contactItem: { flex: 1, alignItems: "center", paddingHorizontal: 10 },
  contactLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#94A3B8",
    marginTop: 4,
    letterSpacing: 1,
  },
  contactValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#001F3F",
    marginTop: 2,
  },

  // Portfolio Card
  portfolioWrapper: { paddingHorizontal: 20, marginTop: 20 },
  portfolioCard: {
    backgroundColor: "#0EA5E9",
    borderRadius: 25,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },
  portfolioSide: { flex: 1 },
  portfolioLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1,
  },
  portfolioAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFF",
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 15,
  },

  // Menu
  menuSection: { paddingHorizontal: 20, marginTop: 30 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748B",
    letterSpacing: 2,
    marginBottom: 15,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: "700", color: "#001F3F" },

  // Logout
  logoutWrapper: { paddingHorizontal: 20, marginTop: 20, marginBottom: 40 },
  logoutBtn: {
    height: 60,
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
  },
  versionText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 20,
    letterSpacing: 1,
  },
});
