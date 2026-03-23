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

// Use fixed phone width so grid always shows 4 columns regardless of browser width
const PHONE_WIDTH = 393;
const { width: _w } = Dimensions.get("window");
const width = Math.min(_w, PHONE_WIDTH);

export default function Payments({ navigation }: any) {
  const [searchQuery,    setSearchQuery]    = useState("");
  const [showComingSoon, setShowComingSoon] = useState(false);

  const billCategories = [
    { icon: Smartphone,    label: "Mobile"    },
    { icon: Zap,           label: "Electric"  },
    { icon: Droplets,      label: "Water"     },
    { icon: Wifi,          label: "Broadband" },
    { icon: CreditCard,    label: "Card"      },
    { icon: Car,           label: "FASTag"    },
    { icon: GraduationCap, label: "Education" },
    { icon: Building2,     label: "Rent"      },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#002D72" />

      {/* Coming Soon popup */}
      {showComingSoon && (
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <View style={styles.dialogIconBox}>
              <Clock size={28} color="#D97706" />
            </View>
            <Text style={styles.dialogTitle}>Coming Soon</Text>
            <Text style={styles.dialogMsg}>
              This feature is still under development and will be live soon. Stay tuned!
            </Text>
            <TouchableOpacity style={styles.dialogBtn} onPress={() => setShowComingSoon(false)}>
              <Text style={styles.dialogBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>

        {/* Header */}
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

        {/* Only Send Money is live — notice banner */}
        <View style={styles.noticeBanner}>
          <Info size={15} color="#0369A1" />
          <Text style={styles.noticeText}>
            Only <Text style={{ fontWeight: "900", color: "#0369A1" }}>Send Money</Text> is live. All other features are previews and coming soon.
          </Text>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionCardWrapper}>
          <View style={styles.actionCard}>
            {/* ACTIVE */}
            <TouchableOpacity style={[styles.actionBtn, styles.skyBtn]} onPress={() => navigation.navigate("Transfer")}>
              <View style={styles.actionIconCircle}>
                <Send size={20} color="#FFF" />
              </View>
              <Text style={styles.actionBtnText}>Send Money</Text>
            </TouchableOpacity>

            {/* INACTIVE — normal appearance, opens coming soon */}
            <TouchableOpacity style={[styles.actionBtn, styles.navyBtn]} onPress={() => setShowComingSoon(true)}>
              <View style={[styles.actionIconCircle, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
                <QrCode size={20} color="#FFF" />
              </View>
              <Text style={styles.actionBtnText}>Scan & Pay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bill Categories — normal icon appearance, tap → coming soon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECHARGE & PAY BILLS</Text>
          <View style={styles.grid}>
            {billCategories.map((cat, i) => (
              <TouchableOpacity
                key={i}
                style={styles.gridItem}
                onPress={() => setShowComingSoon(true)}
              >
                <View style={styles.gridIconBox}>
                  <cat.icon size={24} color="#0EA5E9" />
                </View>
                <Text style={styles.gridLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Bills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPCOMING BILLS</Text>
          <TouchableOpacity style={styles.billCard} onPress={() => setShowComingSoon(true)}>
            <View style={styles.billIconBox}>
              <Receipt size={22} color="#002D72" />
            </View>
            <View style={styles.billDetails}>
              <Text style={styles.billName}>Bill payments coming soon</Text>
              <Text style={styles.billDate}>This feature is under development</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Billers */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT BILLERS</Text>
          </View>
          <TouchableOpacity style={styles.recentCard} onPress={() => setShowComingSoon(true)}>
            <View style={styles.recentIconBox}>
              <Smartphone size={22} color="#0EA5E9" />
            </View>
            <View style={styles.billDetails}>
              <Text style={styles.billName}>No recent billers yet</Text>
              <Text style={styles.billDate}>Your bill history will appear here</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: "#002D72" },
  container: { flex: 1, backgroundColor: "#E0F2FE" },

  // Coming soon modal
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999,
    justifyContent: "center", alignItems: "center",
  },
  dialog: {
    backgroundColor: "#FFF", borderRadius: 28, padding: 28,
    width: "85%", maxWidth: 340, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 20,
  },
  dialogIconBox: {
    width: 60, height: 60, borderRadius: 20, backgroundColor: "#FEF3C7",
    justifyContent: "center", alignItems: "center", marginBottom: 16,
  },
  dialogTitle: { fontSize: 20, fontWeight: "900", color: "#1E293B", marginBottom: 8 },
  dialogMsg:   { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  dialogBtn: {
    height: 50, paddingHorizontal: 48, borderRadius: 16,
    backgroundColor: "#0EA5E9", justifyContent: "center", alignItems: "center",
  },
  dialogBtnText: { color: "#FFF", fontWeight: "800", fontSize: 15 },

  // Header
  header: {
    backgroundColor: "#002D72",
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 24, paddingHorizontal: 20,
  },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backBtn:   { marginRight: 15 },
  headerTitle: { color: "#FFF", fontSize: 22, fontWeight: "900" },
  searchWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18, paddingHorizontal: 15, height: 52,
  },
  searchIcon:  { marginRight: 10 },
  searchInput: { flex: 1, color: "#FFF", fontSize: 15, fontWeight: "500" },

  // Notice banner — sits between header and quick actions, no overlap
  noticeBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#DBEAFE", marginHorizontal: 20, marginTop: 16, marginBottom: 0,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: "#BFDBFE",
  },
  noticeText: { flex: 1, fontSize: 13, color: "#1E40AF", lineHeight: 18 },

  // Quick action buttons
  actionCardWrapper: { paddingHorizontal: 20, marginTop: 12 },
  actionCard: {
    backgroundColor: "#FFF", borderRadius: 24, padding: 16,
    flexDirection: "row", gap: 12,
    elevation: 4, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12,
  },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10, height: 54, borderRadius: 16,
  },
  skyBtn:  { backgroundColor: "#0EA5E9" },
  navyBtn: { backgroundColor: "#1E3A5F" },
  actionIconCircle: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  actionBtnText: { color: "#FFF", fontWeight: "800", fontSize: 14 },

  // Grid
  section:     { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 11, fontWeight: "900", color: "#64748B", letterSpacing: 1.5, marginBottom: 14 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridItem: { alignItems: "center", width: "23%", marginHorizontal: "1%" },
  gridIconBox: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: "#FFF", justifyContent: "center", alignItems: "center",
    marginBottom: 6, elevation: 2, shadowColor: "#0EA5E9", shadowOpacity: 0.06, shadowRadius: 6,
  },
  gridLabel: { fontSize: 11, fontWeight: "600", color: "#475569", textAlign: "center" },

  // Bill/recent cards
  billCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF", padding: 16, borderRadius: 18, marginBottom: 10,
  },
  billIconBox: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: "#F0F9FF",
    justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  billDetails: { flex: 1 },
  billName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  billDate: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  recentCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF", padding: 16, borderRadius: 18, marginBottom: 10,
  },
  recentIconBox: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: "#F0F9FF",
    justifyContent: "center", alignItems: "center", marginRight: 14,
  },
});
