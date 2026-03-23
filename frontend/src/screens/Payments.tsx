import {
  ArrowLeft, Building2, Car, ChevronRight, Clock, CreditCard,
  Droplets, GraduationCap, Info, QrCode, Receipt, Search,
  Send, Smartphone, Wifi, Zap,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions, Platform, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";

const { width } = Dimensions.get("window");

// Reusable COMING SOON badge
const ComingSoonBadge = () => (
  <View style={csBadge.wrap}>
    <Text style={csBadge.text}>SOON</Text>
  </View>
);
const csBadge = StyleSheet.create({
  wrap: {
    position: "absolute", bottom: -5, alignSelf: "center",
    backgroundColor: "#FBBF24", borderRadius: 4,
    paddingHorizontal: 3, paddingVertical: 1, zIndex: 10,
  },
  text: { fontSize: 7, fontWeight: "900", color: "#78350F", letterSpacing: 0.3 },
});

export default function Payments({ navigation }: any) {
  const [searchQuery,    setSearchQuery]    = useState("");
  const [showComingSoon, setShowComingSoon] = useState(false);

  const billCategories = [
    { icon: Smartphone,    label: "Mobile",    active: false },
    { icon: Zap,           label: "Electric",  active: false },
    { icon: Droplets,      label: "Water",     active: false },
    { icon: Wifi,          label: "Broadband", active: false },
    { icon: CreditCard,    label: "Card",      active: false },
    { icon: Car,           label: "FASTag",    active: false },
    { icon: GraduationCap, label: "Education", active: false },
    { icon: Building2,     label: "Rent",      active: false },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#002D72" />


      {/* Coming Soon popup */}
      {showComingSoon && (
        <View style={cs.overlay}>
          <View style={cs.dialog}>
            <View style={cs.iconBox}><Clock size={28} color="#D97706" /></View>
            <Text style={cs.title}>Coming Soon</Text>
            <Text style={cs.msg}>This feature is still under development and will be live soon.</Text>
            <TouchableOpacity style={cs.btn} onPress={() => setShowComingSoon(false)}>
              <Text style={cs.btnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payments</Text>
          </View>
          <View style={styles.searchWrapper}>
            <Search size={20} color="#BAE6FD" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search billers, services..."
              placeholderTextColor="#BAE6FD"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Fix 5: Only Send Money works notice */}
        <View style={styles.noticeBanner}>
          <Info size={16} color="#0369A1" />
          <Text style={styles.noticeText}>
            Only <Text style={{ fontWeight: "900" }}>Send Money</Text> is live. All other features are in development.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionCardWrapper}>
          <View style={styles.actionCard}>
            {/* Send Money — ACTIVE */}
            <TouchableOpacity style={[styles.actionBtn, styles.skyBtn]} onPress={() => navigation.navigate("Transfer")}>
              <View style={styles.actionIconCircle}>
                <Send size={20} color="#FFF" />
              </View>
              <Text style={styles.actionBtnText}>Send Money</Text>
            </TouchableOpacity>

            {/* Scan & Pay — COMING SOON */}
            <TouchableOpacity style={[styles.actionBtn, styles.navyBtn, { opacity: 0.5 }]} onPress={() => setShowComingSoon(true)}>
              <View style={{ position: "relative" }}>
                <View style={[styles.actionIconCircle, { backgroundColor: "#002D72" }]}>
                  <QrCode size={20} color="#FFF" />
                </View>
                <ComingSoonBadge />
              </View>
              <Text style={styles.actionBtnText}>Scan & Pay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bill Categories — all COMING SOON */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECHARGE & PAY BILLS</Text>
          <View style={styles.grid}>
            {billCategories.map((cat, i) => (
              <TouchableOpacity key={i} style={[styles.gridItem, { opacity: 0.5 }]} onPress={() => setShowComingSoon(true)}>
                <View style={{ position: "relative" }}>
                  <View style={styles.gridIconBox}>
                    <cat.icon size={24} color="#94A3B8" />
                  </View>
                  <ComingSoonBadge />
                </View>
                <Text style={[styles.gridLabel, { color: "#94A3B8" }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Bills — placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPCOMING BILLS</Text>
          <View style={[styles.billCard, { opacity: 0.45 }]}>
            <View style={styles.billIconBox}>
              <Receipt size={22} color="#002D72" />
            </View>
            <View style={styles.billDetails}>
              <Text style={styles.billName}>Bill payments coming soon</Text>
              <Text style={styles.billDate}>This feature is under development</Text>
            </View>
          </View>
        </View>

        {/* Recent Billers — placeholder */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT BILLERS</Text>
          </View>
          <View style={[styles.recentCard, { opacity: 0.45 }]}>
            <View style={styles.recentIconBox}>
              <Smartphone size={22} color="#94A3B8" />
            </View>
            <View style={styles.billDetails}>
              <Text style={styles.billName}>No recent billers</Text>
              <Text style={styles.billDate}>Your bill history will appear here</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#002D72" },
  container: { flex: 1, backgroundColor: "#E0F2FE" },
  header: {
    backgroundColor: "#002D72",
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 40, paddingHorizontal: 20,
  },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  backBtn: { marginRight: 15 },
  headerTitle: { color: "#FFF", fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  searchWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18, paddingHorizontal: 15, height: 56,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: "#FFF", fontSize: 16, fontWeight: "500" },
  actionCardWrapper: { paddingHorizontal: 20, marginTop: -25 },
  actionCard: {
    backgroundColor: "#FFF", borderRadius: 28, padding: 20,
    flexDirection: "row", gap: 16,
    elevation: 10, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 15,
  },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, height: 56, borderRadius: 18,
  },
  skyBtn:  { backgroundColor: "#0EA5E9" },
  navyBtn: { backgroundColor: "#1E293B" },
  actionIconCircle: {
    width: 34, height: 34, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  actionBtnText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionTitle: { fontSize: 11, fontWeight: "900", color: "#64748B", letterSpacing: 1.5, marginBottom: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { alignItems: "center", width: (width - 64) / 4 },
  gridIconBox: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: "#FFF", justifyContent: "center", alignItems: "center",
    marginBottom: 8, elevation: 2,
  },
  gridLabel: { fontSize: 11, fontWeight: "700", color: "#475569", textAlign: "center" },
  billCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF", padding: 16, borderRadius: 20, marginBottom: 12,
  },
  urgentCard: { borderWidth: 1, borderColor: "#FECACA" },
  billIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: "#F0F9FF",
    justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  urgentIconBox: { backgroundColor: "#FEF2F2" },
  billDetails: { flex: 1 },
  billName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  billDate: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  billAction: { alignItems: "flex-end", gap: 6 },
  billAmount: { fontSize: 15, fontWeight: "800", color: "#1E293B" },
  payBtn: { backgroundColor: "#0EA5E9", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  payBtnText: { color: "#FFF", fontSize: 11, fontWeight: "900" },
  recentCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF", padding: 16, borderRadius: 20, marginBottom: 12,
  },
  recentIconBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "#F8FAFC",
    justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  recentRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewAllText: { fontSize: 12, color: "#0EA5E9", fontWeight: "bold" },
  noticeBanner: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#E0F2FE", margin: 20, marginBottom: 0, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#BAE6FD" },
  noticeText: { flex: 1, fontSize: 13, color: "#0369A1", fontWeight: "600", lineHeight: 18 },
});

const cs = StyleSheet.create({
  overlay:  { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 999, justifyContent: "center", alignItems: "center" },
  dialog:   { backgroundColor: "#FFF", borderRadius: 28, padding: 28, width: "85%", maxWidth: 320, alignItems: "center" },
  iconBox:  { width: 56, height: 56, borderRadius: 18, backgroundColor: "#FEF3C7", justifyContent: "center", alignItems: "center", marginBottom: 14 },
  title:    { fontSize: 18, fontWeight: "900", color: "#1E293B", marginBottom: 8 },
  msg:      { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20, marginBottom: 22 },
  btn:      { height: 48, paddingHorizontal: 36, borderRadius: 14, justifyContent: "center", alignItems: "center", backgroundColor: "#0EA5E9" },
  btnText:  { color: "#FFF", fontWeight: "800", fontSize: 14 },
});
