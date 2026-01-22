import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronRight,
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
  X, // Added X icon
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Modal, // Added Modal
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

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
    value: "156",
    change: "-5%",
    icon: FileText,
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
];

const initialActivities = [
  {
    id: "1",
    type: "kyc",
    title: "New KYC Application",
    user: "Rahul Sharma",
    time: "2 min ago",
    status: "pending",
  },
  {
    id: "2",
    type: "transaction",
    title: "Large Transaction Alert",
    user: "₹5,00,000 transfer",
    time: "15 min ago",
    status: "flagged",
  },
  {
    id: "3",
    type: "account",
    title: "Account Opened",
    user: "Priya Patel",
    time: "1 hour ago",
    status: "completed",
  },
  {
    id: "4",
    type: "support",
    title: "Support Ticket",
    user: "Ticket #4521",
    time: "2 hours ago",
    status: "open",
  },
];

const quickActions = [
  { icon: UserPlus, label: "Add User" },
  { icon: Shield, label: "Security" },
  { icon: BarChart3, label: "Reports" },
  { icon: Settings, label: "Settings" },
];

export default function AdminDashboard({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState(initialActivities);
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  const handleUpdateStatus = (status: string) => {
    if (selectedActivity) {
      setActivities((prev) =>
        prev.map((act) =>
          act.id === selectedActivity.id ? { ...act, status } : act,
        ),
      );
      setIsReviewing(false);
      setSelectedActivity(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F9FF" }}>
      <ScrollView
        style={styles.container}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar barStyle="light-content" />

        <View style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.iconBtn}>
                <Menu size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.headerTitles}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.panelTitle}>Admin Panel</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconBtn}>
                <Bell size={20} color="#FFF" />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.replace("Login")}
              >
                <LogOut size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchWrapper}>
            <Search size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              placeholder="Search users, transactions..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.body}>
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
                          : "#EF4444",
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

          <View style={styles.activitiesHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color="#0EA5E9" />
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesCard}>
            {activities.map((activity, index) => (
              <View
                key={index}
                style={[
                  styles.activityRow,
                  index === activities.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                {/* @ts-ignore */}
                <View
                  style={[
                    styles.statusIcon,
                    styles[`statusBg_${activity.status}`],
                  ]}
                >
                  {activity.status === "pending" && (
                    <FileText size={18} color="#D97706" />
                  )}
                  {activity.status === "flagged" && (
                    <AlertTriangle size={18} color="#DC2626" />
                  )}
                  {activity.status === "completed" && (
                    <Users size={18} color="#16A34A" />
                  )}
                  {activity.status === "open" && (
                    <Activity size={18} color="#2563EB" />
                  )}
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityUser}>{activity.user}</Text>
                  {activity.status === "pending" && (
                    <TouchableOpacity
                      style={styles.reviewBtnSmall}
                      onPress={() => {
                        setSelectedActivity(activity);
                        setIsReviewing(true);
                      }}
                    >
                      <Text style={styles.reviewBtnTextSmall}>REVIEW</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.activityRight}>
                  {/* @ts-ignore */}
                  <View
                    style={[
                      styles.statusTag,
                      styles[`tagBg_${activity.status}`],
                    ]}
                  >
                    {/* @ts-ignore */}
                    <Text
                      style={[
                        styles.statusTagText,
                        styles[`tagText_${activity.status}`],
                      ]}
                    >
                      {activity.status}
                    </Text>
                  </View>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.healthCard}>
            <View style={styles.healthContent}>
              <View style={styles.healthIconBox}>
                <Activity size={24} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.healthMainText}>
                  System Health: Excellent
                </Text>
                <Text style={styles.healthSubText}>
                  All services operational
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Approve/Reject Review Modal */}
      <Modal animationType="slide" transparent={true} visible={isReviewing}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Action Required</Text>
              <TouchableOpacity onPress={() => setIsReviewing(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Reviewing: {selectedActivity?.user}
            </Text>
            <Text style={styles.modalInfo}>
              Choose an action for this {selectedActivity?.type} request.
            </Text>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => handleUpdateStatus("flagged")}
              >
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleUpdateStatus("completed")}
              >
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F9FF" },
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
    backgroundColor: "rgba(255,255,255,0.2)",
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
    marginBottom: 8,
    elevation: 2,
  },
  actionLabel: { fontSize: 10, fontWeight: "700", color: "#1E293B" },
  activitiesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  viewAllBtn: { flexDirection: "row", alignItems: "center" },
  viewAllText: {
    fontSize: 13,
    color: "#0EA5E9",
    fontWeight: "700",
    marginRight: 4,
  },
  activitiesCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 2,
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
  activityRight: { alignItems: "flex-end" },
  statusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusTagText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "lowercase",
  },
  activityTime: { fontSize: 10, color: "#94A3B8", marginTop: 4 },
  statusBg_pending: { backgroundColor: "#FEF3C7" },
  statusBg_flagged: { backgroundColor: "#FEE2E2" },
  statusBg_completed: { backgroundColor: "#DCFCE7" },
  statusBg_open: { backgroundColor: "#DBEAFE" },
  tagBg_pending: { backgroundColor: "#FEF3C7" },
  tagBg_flagged: { backgroundColor: "#FEE2E2" },
  tagBg_completed: { backgroundColor: "#DCFCE7" },
  tagBg_open: { backgroundColor: "#DBEAFE" },
  tagText_pending: { color: "#B45309" },
  tagText_flagged: { color: "#B91C1C" },
  tagText_completed: { color: "#15803D" },
  tagText_open: { color: "#1E40AF" },
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
  reviewBtnSmall: {
    marginTop: 5,
    backgroundColor: "#E0F2FE",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  reviewBtnTextSmall: { fontSize: 10, fontWeight: "800", color: "#0EA5E9" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 20, fontWeight: "900", color: "#1E293B" },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0EA5E9",
    marginBottom: 5,
  },
  modalInfo: { fontSize: 14, color: "#64748B", marginBottom: 30 },
  modalFooter: { flexDirection: "row", gap: 15 },
  rejectBtn: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
  },
  rejectBtnText: { color: "#DC2626", fontWeight: "800" },
  approveBtn: {
    flex: 1,
    backgroundColor: "#0EA5E9",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
  },
  approveBtnText: { color: "#FFF", fontWeight: "800" },
});
