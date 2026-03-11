import {
  ArrowLeft,
  Building2,
  Car,
  ChevronRight,
  CreditCard,
  Droplets,
  GraduationCap,
  QrCode,
  Receipt,
  Search,
  Send,
  Smartphone,
  Wifi,
  Zap,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function Payments({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState("");

  const billCategories = [
    { icon: Smartphone, label: "Mobile", active: false },
    { icon: Zap, label: "Electric", active: false },
    { icon: Droplets, label: "Water", active: false },
    { icon: Wifi, label: "Broadband", active: false },
    { icon: CreditCard, label: "Card", active: false },
    { icon: Car, label: "FASTag", active: false },
    { icon: GraduationCap, label: "Education", active: false },
    { icon: Building2, label: "Rent", active: false },
  ];

  const upcomingBills = [
    {
      name: "Credit Card Bill",
      dueDate: "Dec 20",
      amount: 15000,
      urgent: true,
    },
    {
      name: "Electricity Bill",
      dueDate: "Dec 25",
      amount: 2300,
      urgent: false,
    },
  ];

  const recentBillers = [
    {
      name: "Jio Prepaid",
      number: "98765*****",
      amount: 239,
      icon: Smartphone,
    },
    { name: "Tata Power", number: "ACC12345", amount: 1450, icon: Zap },
    { name: "ACT Fibernet", number: "ACT98765", amount: 849, icon: Wifi },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#002D72" />

      <ScrollView
        style={styles.container}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section - FIXED: Removed Curve */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
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

        {/* Floating Quick Actions */}
        <View style={styles.actionCardWrapper}>
          <View style={styles.actionCard}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.skyBtn]}
              onPress={() => navigation.navigate("Transfer")}
            >
              <View style={styles.actionIconCircle}>
                <Send size={20} color="#FFF" />
              </View>
              <Text style={styles.actionBtnText}>Send Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.navyBtn, { opacity: 0.5 }]}
              disabled={true}
            >
              <View
                style={[
                  styles.actionIconCircle,
                  { backgroundColor: "#002D72" },
                ]}
              >
                <QrCode size={20} color="#FFF" />
              </View>
              <Text style={styles.actionBtnText}>Scan & Pay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECHARGE & PAY BILLS</Text>
          <View style={styles.grid}>
            {billCategories.map((cat, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.gridItem, !cat.active && { opacity: 0.5 }]}
                disabled={!cat.active}
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
          {upcomingBills.map((bill, i) => (
            <View
              key={i}
              style={[styles.billCard, bill.urgent && styles.urgentCard]}
            >
              <View
                style={[
                  styles.billIconBox,
                  bill.urgent && styles.urgentIconBox,
                ]}
              >
                <Receipt
                  size={22}
                  color={bill.urgent ? "#EF4444" : "#002D72"}
                />
              </View>
              <View style={styles.billDetails}>
                <Text style={styles.billName}>{bill.name}</Text>
                <Text style={styles.billDate}>Due: {bill.dueDate}</Text>
              </View>
              <View style={styles.billAction}>
                <Text style={styles.billAmount}>
                  ₹{bill.amount.toLocaleString()}
                </Text>
                <TouchableOpacity style={styles.payBtn}>
                  <Text style={styles.payBtnText}>PAY</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Billers */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT BILLERS</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentBillers.map((biller, i) => (
            <TouchableOpacity key={i} style={styles.recentCard}>
              <View style={styles.recentIconBox}>
                <biller.icon size={22} color="#0EA5E9" />
              </View>
              <View style={styles.billDetails}>
                <Text style={styles.billName}>{biller.name}</Text>
                <Text style={styles.billDate}>{biller.number}</Text>
              </View>
              <View style={styles.recentRight}>
                <Text style={styles.billAmount}>₹{biller.amount}</Text>
                <ChevronRight size={18} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#002D72" },
  container: { flex: 1, backgroundColor: "#E0F2FE" }, // Lighter sky blue theme

  // Header - FIXED: Removed Curves & Adjusted Padding
  header: {
    backgroundColor: "#002D72",
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  backBtn: { marginRight: 15 },
  headerTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    paddingHorizontal: 15,
    height: 56,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: "#FFF", fontSize: 16, fontWeight: "500" },

  // Floating Card
  actionCardWrapper: { paddingHorizontal: 20, marginTop: -28 },
  actionCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    elevation: 8,
    ...Platform.select({
      web: { boxShadow: "0px 8px 20px rgba(0,0,0,0.1)" },
    }),
  },
  actionBtn: {
    flex: 1,
    height: 60,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
  },
  skyBtn: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  navyBtn: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: { fontSize: 13, fontWeight: "800", color: "#002D72" },

  // Grid
  section: { paddingHorizontal: 20, marginTop: 30 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748B",
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  viewAllText: { fontSize: 12, color: "#0EA5E9", fontWeight: "800" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: { width: (width - 60) / 4, alignItems: "center", marginBottom: 20 },
  gridIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 1,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
    textAlign: "center",
  },

  // Bill Cards
  billCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  urgentCard: { backgroundColor: "#FFF1F2", borderColor: "#FFE4E6" },
  billIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  urgentIconBox: { backgroundColor: "#FFE4E6" },
  billDetails: { flex: 1, marginLeft: 15 },
  billName: { fontSize: 14, fontWeight: "800", color: "#002D72" },
  billDate: { fontSize: 11, color: "#94A3B8", marginTop: 2, fontWeight: "600" },
  billAction: { alignItems: "flex-end" },
  billAmount: { fontSize: 15, fontWeight: "900", color: "#002D72" },
  payBtn: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  payBtnText: { color: "#FFF", fontSize: 10, fontWeight: "900" },

  // Recent Billers
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 22,
    marginBottom: 10,
  },
  recentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  recentRight: { flexDirection: "row", alignItems: "center", gap: 8 },
});
