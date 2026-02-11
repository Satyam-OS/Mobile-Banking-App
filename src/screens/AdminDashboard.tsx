import {
  Activity,
  BarChart3,
  Bell,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { adminService } from "../services/adminService";
import { authStorage } from "../services/authStorage";

const { width } = Dimensions.get("window");

export default function AdminDashboard({ navigation }: any) {
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPending = async () => {
    try {
      const data = await adminService.getPendingKyc();
      setPendingList(data || []);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to load pending KYC list");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const adminToken = await authStorage.getAdminToken();
      if (!adminToken) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
        return;
      }
      fetchPending();
    };
    init();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPending();
  };

  const approve = async (mobile: string) => {
    setIsSubmitting(true);
    try {
      await adminService.approveKyc(mobile);
      Alert.alert("Success", "KYC Approved");
      fetchPending();
    } catch {
      Alert.alert("Error", "Approval failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reject = async (mobile: string) => {
    if (!rejectReason.trim()) {
      Alert.alert("Required", "Enter rejection reason");
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.rejectKyc(mobile, rejectReason);
      Alert.alert("Success", "KYC Rejected");
      setRejectReason("");
      setSelectedUser(null);
      fetchPending();
    } catch {
      Alert.alert("Error", "Rejection failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await authStorage.clearAll();

    navigation.replace("Login"); // ✅ best for auth logout
  };

  const stats = [
    {
      label: "Total Customers",
      value: "24,589",
      change: "+12%",
      icon: Users,
      color: "#3B82F6",
      bg: "#EFF6FF",
    },
    {
      label: "Active Accounts",
      value: "18,234",
      change: "+8%",
      icon: CreditCard,
      color: "#10B981",
      bg: "#ECFDF5",
    },
    {
      label: "Total Deposits",
      value: "₹125.6Cr",
      change: "+15%",
      icon: DollarSign,
      color: "#8B5CF6",
      bg: "#F5F3FF",
    },
    {
      label: "Pending KYCs",
      value: pendingList.length.toString(),
      change: "Live",
      icon: FileText,
      color: "#F59E0B",
      bg: "#FFFBEB",
    },
  ];

  const quickActions = [
    { icon: UserPlus, label: "Add User" },
    { icon: Shield, label: "Security" },
    { icon: BarChart3, label: "Reports" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <ScrollView
      style={styles.container}
      stickyHeaderIndices={[0]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FFF"
        />
      }
    >
      {/* Header & Search Area */}
      <View style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.iconBtn}>
              <Menu size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.panelTitle}>Admin Panel</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Bell size={20} color="#FFF" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
              <LogOut size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchWrapper}>
          <Search size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            placeholder="Search pending applications..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.body}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={styles.statHeader}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: stat.bg },
                  ]}
                >
                  <stat.icon size={20} color={stat.color} />
                </View>
                <Text
                  style={[
                    styles.changeText,
                    {
                      color: stat.change.startsWith("+")
                        ? "#10B981"
                        : "#F59E0B",
                    },
                  ]}
                >
                  {stat.change}
                </Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.label} style={styles.actionItem}>
              <View style={styles.actionIconBox}>
                <action.icon size={20} color="#0EA5E9" />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dynamic Pending KYC Section */}
        <View style={styles.activitiesHeader}>
          <Text style={styles.sectionTitle}>Pending Verifications</Text>
          <TouchableOpacity style={styles.viewAllBtn} onPress={onRefresh}>
            <Text style={styles.viewAllText}>Refresh</Text>
            <Activity size={16} color="#0EA5E9" />
          </TouchableOpacity>
        </View>

        <View style={styles.activitiesCard}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#0EA5E9"
              style={{ margin: 20 }}
            />
          ) : pendingList.length === 0 ? (
            <Text style={styles.emptyText}>No applications found</Text>
          ) : (
            pendingList.map((item, index) => (
              <View
                key={item.mobile}
                style={[
                  styles.activityRow,
                  index === pendingList.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={[styles.statusIcon, styles.statusBg_pending]}>
                  <FileText size={18} color="#D97706" />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{item.fullName}</Text>
                  <Text style={styles.activityUser}>{item.mobile}</Text>
                </View>

                <View style={styles.rowActions}>
                  <TouchableOpacity
                    onPress={() => approve(item.mobile)}
                    disabled={isSubmitting}
                    style={styles.actionCircleBtn}
                  >
                    <CheckCircle2 size={24} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedUser(item)}
                    style={styles.actionCircleBtn}
                  >
                    <XCircle size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Rejection Modal/Inline Area */}
        {selectedUser && (
          <View style={styles.rejectContainer}>
            <Text style={styles.rejectTitle}>
              Reject: {selectedUser.fullName}
            </Text>
            <TextInput
              placeholder="Reason for rejection..."
              style={styles.modalInput}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSelectedUser(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => reject(selectedUser.mobile)}
              >
                <Text style={styles.confirmText}>Confirm Rejection</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* System Health */}
        <View style={styles.healthCard}>
          <View style={styles.healthContent}>
            <View style={styles.healthIconBox}>
              <Activity size={24} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.healthMainText}>
                System Health: Excellent
              </Text>
              <Text style={styles.healthSubText}>All services operational</Text>
            </View>
            <View style={styles.healthStats}>
              <Text style={styles.uptimeValue}>99.9%</Text>
              <Text style={styles.uptimeLabel}>Uptime</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  headerGradient: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 25,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitles: { marginLeft: 8 },
  welcomeText: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  panelTitle: { color: "#FFF", fontSize: 18, fontWeight: "800" },
  headerRight: { flexDirection: "row", gap: 10 },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  notifDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#0EA5E9",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: "#1E293B", fontSize: 14 },
  body: { paddingHorizontal: 20, paddingBottom: 30 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 15,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  changeText: { fontSize: 11, fontWeight: "700" },
  statValue: { fontSize: 20, fontWeight: "900", color: "#1E293B" },
  statLabel: { fontSize: 11, color: "#64748B", marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 20,
    marginBottom: 12,
  },
  actionsGrid: { flexDirection: "row", justifyContent: "space-between" },
  actionItem: { width: (width - 60) / 4, alignItems: "center" },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    marginBottom: 8,
  },
  actionLabel: { fontSize: 10, fontWeight: "700", color: "#1E293B" },
  activitiesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  viewAllBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewAllText: { fontSize: 13, color: "#0EA5E9", fontWeight: "700" },
  activitiesCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activityInfo: { flex: 1, marginLeft: 12 },
  activityTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  activityUser: { fontSize: 12, color: "#64748B", marginTop: 2 },
  rowActions: { flexDirection: "row", gap: 12 },
  actionCircleBtn: { padding: 4 },
  statusBg_pending: { backgroundColor: "#FEF3C7" },
  rejectContainer: {
    marginTop: 20,
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  rejectTitle: { fontWeight: "800", marginBottom: 10, color: "#EF4444" },
  modalInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 15,
    minHeight: 60,
  },
  cancelBtn: { flex: 1, padding: 12, alignItems: "center" },
  cancelText: { color: "#64748B", fontWeight: "700" },
  confirmBtn: {
    flex: 2,
    backgroundColor: "#EF4444",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmText: { color: "#FFF", fontWeight: "800" },
  emptyText: {
    textAlign: "center",
    padding: 30,
    color: "#94A3B8",
    fontWeight: "600",
  },
  healthCard: { marginTop: 20, borderRadius: 20, overflow: "hidden" },
  healthContent: {
    backgroundColor: "#10B981",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  healthIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  healthMainText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  healthSubText: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  healthStats: { alignItems: "flex-end" },
  uptimeValue: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  uptimeLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10 },
});
