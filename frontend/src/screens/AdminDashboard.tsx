import {
  Activity, BarChart3, Bell, CheckCircle2, CreditCard,
  DollarSign, FileText, LogOut, Menu, Search,
  Settings, Shield, UserPlus, Users, XCircle, X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Platform, RefreshControl, SafeAreaView,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from "react-native";
import { adminService } from "../services/adminService";
import { authStorage } from "../services/authStorage";

// Always use 393 so cards render at phone size regardless of browser window width
const PHONE_W = 393;

export default function AdminDashboard({ navigation }: any) {
  const [pendingList,   setPendingList]   = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [selectedUser,  setSelectedUser]  = useState<any>(null);
  const [rejectReason,  setRejectReason]  = useState("");
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  // Inline modals — Alert.alert is unreliable on web
  const [toast,         setToast]         = useState<{ type: "success"|"error"; msg: string } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut,        setLoggingOut]         = useState(false);

  const showToast = (type: "success"|"error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPending = async () => {
    try {
      const data = await adminService.getPendingKyc();
      setPendingList(data || []);
    } catch (e: any) {
      showToast("error", e.message || "Failed to load pending KYC list");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const adminToken = await authStorage.getAdminToken();
      if (!adminToken) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }
      fetchPending();
    };
    init();
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchPending(); };

  const approve = async (mobile: string) => {
    setIsSubmitting(true);
    try {
      await adminService.approveKyc(mobile);
      showToast("success", "KYC Approved successfully");
      fetchPending();
    } catch {
      showToast("error", "Approval failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reject = async (mobile: string) => {
    if (!rejectReason.trim()) {
      showToast("error", "Please enter a rejection reason.");
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.rejectKyc(mobile, rejectReason);
      showToast("success", "KYC Rejected");
      setRejectReason("");
      setSelectedUser(null);
      fetchPending();
    } catch {
      showToast("error", "Rejection failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const doLogout = async () => {
    setLoggingOut(true);
    await authStorage.clearAll();
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.href = "/";
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const filteredList = pendingList.filter(item =>
    !searchQuery ||
    (item.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.mobile || "").includes(searchQuery)
  );

  const stats = [
    { label: "Total Customers", value: "24,589", change: "+12%", icon: Users,      color: "#3B82F6", bg: "#EFF6FF" },
    { label: "Active Accounts", value: "18,234", change: "+8%",  icon: CreditCard, color: "#10B981", bg: "#ECFDF5" },
    { label: "Total Deposits",  value: "₹125.6Cr", change: "+15%", icon: DollarSign, color: "#8B5CF6", bg: "#F5F3FF" },
    { label: "Pending KYCs",   value: pendingList.length.toString(), change: "Live", icon: FileText, color: "#F59E0B", bg: "#FFFBEB" },
  ];

  const quickActions = [
    { icon: UserPlus, label: "Add User" },
    { icon: Shield,   label: "Security" },
    { icon: BarChart3,label: "Reports"  },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ── Toast notification ───────────────────────────────────────────── */}
      {toast && (
        <View style={[styles.toast, toast.type === "success" ? styles.toastSuccess : styles.toastError]}>
          <Text style={styles.toastText}>{toast.msg}</Text>
        </View>
      )}

      {/* ── Logout confirm ───────────────────────────────────────────────── */}
      {showLogoutConfirm && (
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <View style={styles.dialogIcon}><LogOut size={26} color="#EF4444" /></View>
            <Text style={styles.dialogTitle}>Logout</Text>
            <Text style={styles.dialogMsg}>Are you sure you want to logout?</Text>
            <View style={styles.dialogBtns}>
              <TouchableOpacity style={styles.dialogCancelBtn} onPress={() => setShowLogoutConfirm(false)} disabled={loggingOut}>
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dialogConfirmBtn, loggingOut && { opacity: 0.6 }]} onPress={doLogout} disabled={loggingOut}>
                {loggingOut
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={styles.dialogConfirmText}>Logout</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <View style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.iconBtn}><Menu size={22} color="#FFF" /></TouchableOpacity>
              <View style={styles.headerTitles}>
                <Text style={styles.welcomeText}>Welcome,</Text>
                <Text style={styles.panelTitle}>Admin Panel</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconBtn}>
                <Bell size={18} color="#FFF" />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowLogoutConfirm(true)}>
                <LogOut size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchWrapper}>
            <Search size={18} color="#64748B" style={styles.searchIcon} />
            <TextInput
              placeholder="Search pending applications..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.body}>

          {/* ── Stats Grid — 2×2, fixed width ────────────────────────────── */}
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIconContainer, { backgroundColor: stat.bg }]}>
                    <stat.icon size={18} color={stat.color} />
                  </View>
                  <Text style={[styles.changeText, { color: stat.change.startsWith("+") ? "#10B981" : "#F59E0B" }]}>
                    {stat.change}
                  </Text>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Quick Actions ─────────────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.label} style={styles.actionItem}>
                <View style={styles.actionIconBox}>
                  <action.icon size={18} color="#0EA5E9" />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Pending KYC ───────────────────────────────────────────────── */}
          <View style={styles.activitiesHeader}>
            <Text style={styles.sectionTitle}>Pending Verifications</Text>
            <TouchableOpacity style={styles.viewAllBtn} onPress={onRefresh}>
              <Text style={styles.viewAllText}>Refresh</Text>
              <Activity size={14} color="#0EA5E9" />
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesCard}>
            {loading ? (
              <ActivityIndicator size="small" color="#0EA5E9" style={{ margin: 20 }} />
            ) : filteredList.length === 0 ? (
              <View style={styles.emptyBox}>
                <FileText size={28} color="#CBD5E1" />
                <Text style={styles.emptyText}>
                  {searchQuery ? "No results found" : "No pending applications"}
                </Text>
              </View>
            ) : (
              filteredList.map((item, index) => (
                <View
                  key={item.mobile}
                  style={[styles.activityRow, index === filteredList.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={[styles.statusIcon, styles.statusBg_pending]}>
                    <FileText size={16} color="#D97706" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle} numberOfLines={1}>{item.fullName}</Text>
                    <Text style={styles.activityUser}>{item.mobile}</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      onPress={() => approve(item.mobile)}
                      disabled={isSubmitting}
                      style={styles.actionCircleBtn}
                    >
                      <CheckCircle2 size={22} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setSelectedUser(item)}
                      style={styles.actionCircleBtn}
                    >
                      <XCircle size={22} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* ── Rejection inline panel ────────────────────────────────────── */}
          {selectedUser && (
            <View style={styles.rejectContainer}>
              <View style={styles.rejectHeader}>
                <Text style={styles.rejectTitle}>Reject: {selectedUser.fullName}</Text>
                <TouchableOpacity onPress={() => setSelectedUser(null)}>
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder="Reason for rejection..."
                style={styles.modalInput}
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={3}
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedUser(null)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, isSubmitting && { opacity: 0.6 }]}
                  onPress={() => reject(selectedUser.mobile)}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? <ActivityIndicator color="#FFF" size="small" />
                    : <Text style={styles.confirmText}>Confirm Rejection</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── System Health ─────────────────────────────────────────────── */}
          <View style={styles.healthCard}>
            <View style={styles.healthContent}>
              <View style={styles.healthIconBox}>
                <Activity size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.healthMainText}>System Health: Excellent</Text>
                <Text style={styles.healthSubText}>All services operational</Text>
              </View>
              <View style={styles.healthStats}>
                <Text style={styles.uptimeValue}>99.9%</Text>
                <Text style={styles.uptimeLabel}>Uptime</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Card width = half of phone width minus padding
const CARD_W = (PHONE_W - 52) / 2;
const ACTION_W = (PHONE_W - 60) / 4;

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  // Toast
  toast: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 9999,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  toastSuccess: { backgroundColor: "#DCFCE7" },
  toastError:   { backgroundColor: "#FEE2E2" },
  toastText:    { fontWeight: "700", fontSize: 13, color: "#1E293B", textAlign: "center" },

  // Logout dialog
  overlay: {
    position: "absolute", inset: 0, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999,
    justifyContent: "center", alignItems: "center",
  },
  dialog: {
    backgroundColor: "#FFF", borderRadius: 24, padding: 24,
    width: "85%", maxWidth: 320, alignItems: "center",
  },
  dialogIcon:        { width: 52, height: 52, borderRadius: 16, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center", marginBottom: 14 },
  dialogTitle:       { fontSize: 18, fontWeight: "900", color: "#1E293B", marginBottom: 6 },
  dialogMsg:         { fontSize: 13, color: "#64748B", textAlign: "center", marginBottom: 20 },
  dialogBtns:        { flexDirection: "row", gap: 10, width: "100%" },
  dialogCancelBtn:   { flex: 1, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center", backgroundColor: "#F1F5F9" },
  dialogCancelText:  { fontWeight: "700", color: "#64748B" },
  dialogConfirmBtn:  { flex: 1, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center", backgroundColor: "#EF4444" },
  dialogConfirmText: { fontWeight: "800", color: "#FFF" },

  // Header
  headerGradient: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "web" ? 20 : 50,
    paddingBottom: 22,
  },
  headerTop:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerLeft:   { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitles: { marginLeft: 6 },
  welcomeText:  { color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "600" },
  panelTitle:   { color: "#FFF", fontSize: 16, fontWeight: "900" },
  headerRight:  { flexDirection: "row", gap: 8 },
  iconBtn:      { padding: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.18)", position: "relative" },
  notifDot:     { position: "absolute", top: 9, right: 9, width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: "#0EA5E9" },
  searchWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 14, paddingHorizontal: 12, height: 46 },
  searchIcon:    { marginRight: 8 },
  searchInput:   { flex: 1, color: "#1E293B", fontSize: 13 },

  // Body
  body:      { paddingHorizontal: 16, paddingBottom: 30 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 14, gap: 10 },
  statCard: {
    width: CARD_W,
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5,
  },
  statHeader:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  statIconContainer: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  changeText:        { fontSize: 10, fontWeight: "700" },
  statValue:         { fontSize: 18, fontWeight: "900", color: "#1E293B" },
  statLabel:         { fontSize: 10, color: "#64748B", marginTop: 3 },

  sectionTitle:  { fontSize: 14, fontWeight: "800", color: "#1E293B", marginTop: 18, marginBottom: 10 },
  actionsGrid:   { flexDirection: "row", justifyContent: "space-between" },
  actionItem:    { width: ACTION_W, alignItems: "center" },
  actionIconBox: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, marginBottom: 6 },
  actionLabel:   { fontSize: 9, fontWeight: "700", color: "#1E293B", textAlign: "center" },

  activitiesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  viewAllBtn:       { flexDirection: "row", alignItems: "center", gap: 4 },
  viewAllText:      { fontSize: 12, color: "#0EA5E9", fontWeight: "700" },

  activitiesCard: { backgroundColor: "#FFF", borderRadius: 18, overflow: "hidden", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, marginTop: 2 },
  activityRow:    { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  statusIcon:     { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  statusBg_pending: { backgroundColor: "#FEF3C7" },
  activityInfo:   { flex: 1, marginLeft: 10 },
  activityTitle:  { fontSize: 13, fontWeight: "700", color: "#1E293B" },
  activityUser:   { fontSize: 11, color: "#64748B", marginTop: 1 },
  rowActions:     { flexDirection: "row", gap: 8 },
  actionCircleBtn:{ padding: 4 },

  emptyBox:  { padding: 30, alignItems: "center", gap: 10 },
  emptyText: { color: "#94A3B8", fontWeight: "600", fontSize: 13 },

  rejectContainer: { marginTop: 14, backgroundColor: "#FFF", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#FEE2E2" },
  rejectHeader:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  rejectTitle:     { fontWeight: "800", color: "#EF4444", fontSize: 13 },
  modalInput:      { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 12, minHeight: 70, textAlignVertical: "top", fontSize: 13 },
  cancelBtn:       { flex: 1, padding: 12, alignItems: "center" },
  cancelText:      { color: "#64748B", fontWeight: "700", fontSize: 13 },
  confirmBtn:      { flex: 2, backgroundColor: "#EF4444", padding: 12, borderRadius: 12, alignItems: "center" },
  confirmText:     { color: "#FFF", fontWeight: "800", fontSize: 13 },

  healthCard:     { marginTop: 16, borderRadius: 18, overflow: "hidden" },
  healthContent:  { backgroundColor: "#10B981", padding: 16, flexDirection: "row", alignItems: "center" },
  healthIconBox:  { width: 40, height: 40, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  healthMainText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  healthSubText:  { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  healthStats:    { alignItems: "flex-end" },
  uptimeValue:    { color: "#FFF", fontSize: 18, fontWeight: "900" },
  uptimeLabel:    { color: "rgba(255,255,255,0.7)", fontSize: 10 },
});
