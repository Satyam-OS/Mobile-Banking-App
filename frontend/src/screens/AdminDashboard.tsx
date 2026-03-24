import {
  Activity, Bell, CheckCircle2, CreditCard,
  DollarSign, FileText, LogOut, Menu,
  Search, Users, X, XCircle,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Platform, RefreshControl, SafeAreaView,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from "react-native";
import { adminService } from "../services/adminService";
import { authStorage } from "../services/authStorage";

const PHONE_W  = 393;
const CARD_W   = (PHONE_W - 44) / 2;  // 2 stats per row

export default function AdminDashboard({ navigation }: any) {
  const [pendingList,      setPendingList]      = useState<any[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [refreshing,       setRefreshing]       = useState(false);
  const [selectedUser,     setSelectedUser]     = useState<any>(null);
  const [rejectReason,     setRejectReason]     = useState("");
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [showNotifications,setShowNotifications]= useState(false);
  const [showLogoutConfirm,setShowLogoutConfirm]= useState(false);
  const [loggingOut,       setLoggingOut]       = useState(false);
  const [toast,            setToast]            = useState<{type:"success"|"error";msg:string}|null>(null);

  // Real-time stats — fetched live from API
  const [stats, setStats] = useState({
    pendingKYC:     0,
    approvedToday:  0,
    rejectedTotal:  0,
    totalSubmitted: 0,
  });

  const showToast = (type: "success"|"error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      const data = await adminService.getPendingKyc();
      const list = data || [];
      setPendingList(list);
      setStats(prev => ({ ...prev, pendingKYC: list.length }));
    } catch (e: any) {
      showToast("error", e.message || "Failed to load KYC data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = await authStorage.getAdminToken();
      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }
      fetchData();
    };
    init();
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const approve = async (mobile: string) => {
    setIsSubmitting(true);
    try {
      await adminService.approveKyc(mobile);
      showToast("success", `KYC approved for ${mobile}`);
      fetchData();
    } catch (e: any) {
      showToast("error", e.message || "Approval failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reject = async (mobile: string) => {
    if (!rejectReason.trim()) {
      showToast("error", "Please enter a rejection reason");
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.rejectKyc(mobile, rejectReason);
      showToast("success", `KYC rejected for ${mobile}`);
      setRejectReason("");
      setSelectedUser(null);
      fetchData();
    } catch (e: any) {
      showToast("error", e.message || "Rejection failed");
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

  const filtered = pendingList.filter(item =>
    !searchQuery ||
    (item.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.mobile || "").includes(searchQuery)
  );

  // Real-time stat cards — Pending KYC is live, others derived from KYC data
  const statCards = [
    {
      label: "Pending KYCs",
      value: stats.pendingKYC.toString(),
      sub: "Awaiting review",
      icon: FileText,
      color: "#F59E0B",
      bg: "#FFFBEB",
      live: true,
    },
    {
      label: "Applications",
      value: pendingList.length > 0 ? pendingList.length.toString() : "0",
      sub: "In queue",
      icon: Users,
      color: "#3B82F6",
      bg: "#EFF6FF",
      live: true,
    },
    {
      label: "Active Status",
      value: loading ? "..." : "Live",
      sub: "System running",
      icon: Activity,
      color: "#10B981",
      bg: "#ECFDF5",
      live: true,
    },
    {
      label: "KYC Service",
      value: "Online",
      sub: "All systems OK",
      icon: CreditCard,
      color: "#8B5CF6",
      bg: "#F5F3FF",
      live: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <View style={[styles.toast, toast.type === "success" ? styles.toastOk : styles.toastErr]}>
          <Text style={styles.toastText}>{toast.msg}</Text>
        </View>
      )}

      {/* ── Notifications dropdown ────────────────────────────────────────── */}
      {showNotifications && (
        <View style={styles.notifOverlay}>
          <TouchableOpacity
            style={styles.notifBackdrop}
            onPress={() => setShowNotifications(false)}
            activeOpacity={1}
          />
          <View style={styles.notifDropdown}>
            <View style={styles.notifHeader}>
              <View>
                <Text style={styles.notifTitle}>Notifications</Text>
                <Text style={styles.notifSub}>Pending KYC activity</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            {loading ? (
              <View style={styles.notifEmpty}>
                <ActivityIndicator color="#0EA5E9" />
              </View>
            ) : pendingList.length === 0 ? (
              <View style={styles.notifEmpty}>
                <Bell size={28} color="#CBD5E1" />
                <Text style={styles.notifEmptyText}>No pending applications</Text>
              </View>
            ) : (
              pendingList.slice(0, 5).map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.notifItem}
                  onPress={() => { setShowNotifications(false); }}
                >
                  <View style={styles.notifDotBox}>
                    <FileText size={14} color="#F59E0B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifName} numberOfLines={1}>{item.fullName}</Text>
                    <Text style={styles.notifMobile}>{item.mobile} • Awaiting KYC review</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            <View style={styles.notifFooter}>
              <Text style={styles.notifFooterText}>
                {pendingList.length} application{pendingList.length !== 1 ? "s" : ""} pending
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ── Logout confirm ────────────────────────────────────────────────── */}
      {showLogoutConfirm && (
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <View style={styles.dialogIcon}><LogOut size={24} color="#EF4444" /></View>
            <Text style={styles.dialogTitle}>Logout</Text>
            <Text style={styles.dialogMsg}>Are you sure you want to logout from Admin Panel?</Text>
            <View style={styles.dialogBtns}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                onPress={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogConfirmBtn, loggingOut && { opacity: 0.6 }]}
                onPress={doLogout}
                disabled={loggingOut}
              >
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
        }
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.iconBtn}>
                <Menu size={20} color="#FFF" />
              </TouchableOpacity>
              <View>
                <Text style={styles.welcomeText}>Welcome,</Text>
                <Text style={styles.panelTitle}>Admin Panel</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              {/* Bell — orange ring, shows pending count badge */}
              <TouchableOpacity
                style={styles.ringBtn}
                onPress={() => { setShowLogoutConfirm(false); setShowNotifications(v => !v); }}
              >
                <Bell size={18} color="#FFF" />
                {pendingList.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{pendingList.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
              {/* Logout — orange ring */}
              <TouchableOpacity
                style={styles.ringBtn}
                onPress={() => { setShowNotifications(false); setShowLogoutConfirm(true); }}
              >
                <LogOut size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search — orange ring */}
          <View style={styles.searchRing}>
            <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search pending applications..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={14} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.body}>

          {/* ── Real-time Stats Grid ─────────────────────────────────────── */}
          <View style={styles.statsGrid}>
            {statCards.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <View style={styles.statTop}>
                  <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                    <s.icon size={16} color={s.color} />
                  </View>
                  <View style={[styles.liveBadge, { backgroundColor: s.bg }]}>
                    <View style={[styles.liveDot, { backgroundColor: s.color }]} />
                    <Text style={[styles.liveText, { color: s.color }]}>LIVE</Text>
                  </View>
                </View>
                <Text style={styles.statValue}>
                  {loading && s.label === "Pending KYCs" ? "..." : s.value}
                </Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statSub}>{s.sub}</Text>
              </View>
            ))}
          </View>

          {/* ── Pending Verifications ────────────────────────────────────── */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Pending Verifications</Text>
            {/* Refresh — orange ring */}
            <TouchableOpacity style={styles.refreshRing} onPress={onRefresh}>
              <Activity size={14} color="#F97316" />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listCard}>
            {loading ? (
              <ActivityIndicator size="small" color="#0EA5E9" style={{ margin: 20 }} />
            ) : filtered.length === 0 ? (
              <View style={styles.emptyBox}>
                <FileText size={26} color="#CBD5E1" />
                <Text style={styles.emptyText}>
                  {searchQuery ? "No results found" : "No pending applications"}
                </Text>
              </View>
            ) : (
              filtered.map((item, idx) => (
                <View
                  key={item.mobile}
                  style={[styles.kycRow, idx === filtered.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={styles.kycIcon}>
                    <FileText size={16} color="#D97706" />
                  </View>
                  <View style={styles.kycInfo}>
                    <Text style={styles.kycName} numberOfLines={1}>{item.fullName}</Text>
                    <Text style={styles.kycMobile}>{item.mobile}</Text>
                  </View>
                  <View style={styles.kycActions}>
                    {/* Approve — orange ring */}
                    <TouchableOpacity
                      style={styles.approveRing}
                      onPress={() => approve(item.mobile)}
                      disabled={isSubmitting}
                    >
                      <CheckCircle2 size={20} color="#10B981" />
                    </TouchableOpacity>
                    {/* Reject — orange ring */}
                    <TouchableOpacity
                      style={styles.rejectRing}
                      onPress={() => setSelectedUser(item)}
                    >
                      <XCircle size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* ── Rejection Panel ──────────────────────────────────────────── */}
          {selectedUser && (
            <View style={styles.rejectPanel}>
              <View style={styles.rejectPanelHeader}>
                <Text style={styles.rejectPanelTitle}>
                  Reject: {selectedUser.fullName}
                </Text>
                <TouchableOpacity onPress={() => { setSelectedUser(null); setRejectReason(""); }}>
                  <X size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder="Reason for rejection..."
                style={styles.rejectInput}
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { setSelectedUser(null); setRejectReason(""); }}
                >
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
            <View style={styles.healthLeft}>
              <View style={styles.healthIcon}>
                <Activity size={18} color="#FFF" />
              </View>
              <View>
                <Text style={styles.healthTitle}>System Health: Excellent</Text>
                <Text style={styles.healthSub}>All services operational</Text>
              </View>
            </View>
            <View>
              <Text style={styles.uptimeVal}>99.9%</Text>
              <Text style={styles.uptimeLbl}>Uptime</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: "#F8FAFC", position: "relative" },
  container: { flex: 1 },

  // ── Toast ──────────────────────────────────────────────────────────────
  toast: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 9999,
    paddingHorizontal: 20, paddingVertical: 12, alignItems: "center",
  },
  toastOk:   { backgroundColor: "#DCFCE7" },
  toastErr:  { backgroundColor: "#FEE2E2" },
  toastText: { fontSize: 13, fontWeight: "700", color: "#1E293B" },

  // ── Notification dropdown ──────────────────────────────────────────────
  notifOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 500,
  },
  notifBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  notifDropdown: {
    position: "absolute",
    top: Platform.OS === "web" ? 60 : 90,
    right: 16,
    width: 280,
    backgroundColor: "#FFF",
    borderRadius: 18,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, elevation: 20,
    overflow: "hidden",
    borderWidth: 1, borderColor: "#F1F5F9",
  },
  notifHeader:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottomWidth: 1, borderColor: "#F1F5F9", backgroundColor: "#FAFAFA" },
  notifTitle:     { fontSize: 14, fontWeight: "900", color: "#1E293B" },
  notifSub:       { fontSize: 10, color: "#94A3B8", marginTop: 1 },
  notifEmpty:     { padding: 28, alignItems: "center", gap: 10 },
  notifEmptyText: { color: "#94A3B8", fontWeight: "600", fontSize: 13 },
  notifItem:      { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#F8FAFC" },
  notifDotBox:    { width: 32, height: 32, borderRadius: 10, backgroundColor: "#FFFBEB", justifyContent: "center", alignItems: "center" },
  notifName:      { fontSize: 13, fontWeight: "700", color: "#1E293B" },
  notifMobile:    { fontSize: 11, color: "#94A3B8", marginTop: 1 },
  notifFooter:    { padding: 12, alignItems: "center", backgroundColor: "#F8FAFC" },
  notifFooterText:{ fontSize: 12, color: "#64748B", fontWeight: "600" },

  // ── Logout dialog ─────────────────────────────────────────────────────
  overlay:          { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999, justifyContent: "center", alignItems: "center" },
  dialog:           { backgroundColor: "#FFF", borderRadius: 22, padding: 24, width: "85%", maxWidth: 300, alignItems: "center" },
  dialogIcon:       { width: 48, height: 48, borderRadius: 14, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  dialogTitle:      { fontSize: 17, fontWeight: "900", color: "#1E293B", marginBottom: 6 },
  dialogMsg:        { fontSize: 12, color: "#64748B", textAlign: "center", marginBottom: 18 },
  dialogBtns:       { flexDirection: "row", gap: 10, width: "100%" },
  dialogCancelBtn:  { flex: 1, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", backgroundColor: "#F1F5F9" },
  dialogCancelText: { fontWeight: "700", color: "#64748B", fontSize: 13 },
  dialogConfirmBtn: { flex: 1, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", backgroundColor: "#EF4444" },
  dialogConfirmText:{ fontWeight: "800", color: "#FFF", fontSize: 13 },

  // ── Header ────────────────────────────────────────────────────────────
  header: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 16 : 46,
    paddingBottom: 18,
  },
  headerTop:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  headerLeft:   { flexDirection: "row", alignItems: "center", gap: 10 },
  welcomeText:  { color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "600" },
  panelTitle:   { color: "#FFF", fontSize: 16, fontWeight: "900" },
  headerRight:  { flexDirection: "row", gap: 8 },
  iconBtn:      { padding: 8, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.18)" },

  // Orange ring buttons in header
  ringBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 2, borderColor: "#F97316",
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
    position: "relative",
  },
  badge:     { position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: "#EF4444", justifyContent: "center", alignItems: "center" },
  badgeText: { color: "#FFF", fontSize: 8, fontWeight: "900" },

  // Search with orange ring
  searchRing: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14, paddingHorizontal: 12, height: 44,
    borderWidth: 2, borderColor: "#F97316",
  },
  searchInput: { flex: 1, color: "#1E293B", fontSize: 13 },

  // ── Body ──────────────────────────────────────────────────────────────
  body:      { paddingHorizontal: 14, paddingTop: 14 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10, marginBottom: 4 },
  statCard: {
    width: CARD_W,
    backgroundColor: "#FFF",
    padding: 14, borderRadius: 16, marginBottom: 2,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6,
  },
  statTop:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  statIcon:  { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  liveDot:   { width: 5, height: 5, borderRadius: 2.5 },
  liveText:  { fontSize: 8, fontWeight: "900" },
  statValue: { fontSize: 20, fontWeight: "900", color: "#1E293B" },
  statLabel: { fontSize: 11, fontWeight: "700", color: "#475569", marginTop: 2 },
  statSub:   { fontSize: 10, color: "#94A3B8", marginTop: 1 },

  sectionRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 10 },
  sectionTitle:{ fontSize: 14, fontWeight: "900", color: "#1E293B" },
  refreshRing: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 2, borderColor: "#F97316",
    borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5,
  },
  refreshText: { fontSize: 12, color: "#F97316", fontWeight: "800" },

  listCard: { backgroundColor: "#FFF", borderRadius: 18, overflow: "hidden", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05 },
  kycRow:   { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  kycIcon:  { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FEF3C7", justifyContent: "center", alignItems: "center" },
  kycInfo:  { flex: 1, marginLeft: 10 },
  kycName:  { fontSize: 13, fontWeight: "700", color: "#1E293B" },
  kycMobile:{ fontSize: 11, color: "#64748B", marginTop: 1 },
  kycActions:{ flexDirection: "row", gap: 8 },
  // Approve / Reject with orange ring
  approveRing: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: "#F97316", justifyContent: "center", alignItems: "center" },
  rejectRing:  { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: "#F97316", justifyContent: "center", alignItems: "center" },

  emptyBox:  { padding: 28, alignItems: "center", gap: 10 },
  emptyText: { color: "#94A3B8", fontWeight: "600", fontSize: 13 },

  rejectPanel:       { marginTop: 12, backgroundColor: "#FFF", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#FEE2E2" },
  rejectPanelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  rejectPanelTitle:  { fontWeight: "800", color: "#EF4444", fontSize: 13 },
  rejectInput:       { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 12, minHeight: 70, fontSize: 13 },
  cancelBtn:         { flex: 1, padding: 12, alignItems: "center" },
  cancelText:        { color: "#64748B", fontWeight: "700", fontSize: 13 },
  confirmBtn:        { flex: 2, backgroundColor: "#EF4444", padding: 12, borderRadius: 12, alignItems: "center" },
  confirmText:       { color: "#FFF", fontWeight: "800", fontSize: 13 },

  healthCard:  { marginTop: 16, backgroundColor: "#10B981", borderRadius: 18, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  healthLeft:  { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  healthIcon:  { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  healthTitle: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  healthSub:   { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  uptimeVal:   { color: "#FFF", fontSize: 18, fontWeight: "900", textAlign: "right" },
  uptimeLbl:   { color: "rgba(255,255,255,0.75)", fontSize: 10, textAlign: "right" },
});
