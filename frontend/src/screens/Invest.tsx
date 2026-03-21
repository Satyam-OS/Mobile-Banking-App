import React from "react";
import {
  Dimensions, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { ArrowLeft, TrendingUp, TrendingDown, Info } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface ChipProps { label: string; active?: boolean; inUse?: boolean; }
const CategoryChip = ({ label, active, inUse = false }: ChipProps) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive, !inUse && { opacity: 0.4 }]}
    disabled={!inUse}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

interface InvestItemProps {
  name: string; ticker: string; price: string; change: string; up: boolean;
}
const InvestItem = ({ name, ticker, price, change, up }: InvestItemProps) => (
  <View style={[styles.menuItem, { opacity: 0.4 }]}>
    <View style={styles.menuIconBox}>
      <Text style={styles.tickerIconText}>{ticker[0]}</Text>
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuText}>{name}</Text>
      <Text style={styles.subText}>{ticker} • NSE</Text>
    </View>
    <View style={styles.priceContainer}>
      <Text style={styles.itemPrice}>{price}</Text>
      <View style={[styles.changeBadge, { backgroundColor: up ? "#DCFCE7" : "#FEE2E2" }]}>
        <Text style={[styles.changeText, { color: up ? "#15803D" : "#B91C1C" }]}>{change}</Text>
      </View>
    </View>
  </View>
);

const InvestDashboard = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.portfolioContent}>
          <Text style={styles.portfolioLabel}>Portfolio Balance</Text>
          <Text style={styles.portfolioValue}>₹0.00</Text>
          <View style={styles.changeChip}>
            <TrendingUp size={14} color="#FFF" />
            <Text style={styles.changeChipText}>Coming Soon</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Coming soon notice */}
        <View style={styles.comingSoonBanner}>
          <Info size={18} color="#0EA5E9" />
          <Text style={styles.comingSoonText}>
            Investment features are coming soon. The data below is for preview only.
          </Text>
        </View>

        {/* Category Chips — all disabled */}
        <View style={styles.chipsRow}>
          <CategoryChip label="Stocks"       active inUse={false} />
          <CategoryChip label="Mutual Funds" inUse={false} />
          <CategoryChip label="Crypto"       inUse={false} />
          <CategoryChip label="Bonds"        inUse={false} />
          <CategoryChip label="Gold"         inUse={false} />
        </View>

        {/* Preview data — clearly faded */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MARKET WATCH</Text>
            <TouchableOpacity style={{ opacity: 0.35 }} disabled>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <InvestItem name="Reliance Industries" ticker="RELIANCE" price="₹2,942.60" change="+1.45%" up />
          <InvestItem name="HDFC Bank"           ticker="HDFCBANK" price="₹1,432.20" change="-0.30%" up={false} />
          <InvestItem name="Infosys"             ticker="INFY"     price="₹1,567.80" change="+0.85%" up />
          <InvestItem name="TCS"                 ticker="TCS"      price="₹3,812.40" change="-0.62%" up={false} />
        </View>
      </ScrollView>

      {/* Greyed out CTA button */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.primaryBtn, { opacity: 0.35 }]} disabled>
          <TrendingUp size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryBtnText}>Discover New Assets</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InvestDashboard;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0EA5E9" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#0EA5E9", paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 32,
  },
  backBtn: { padding: 4 },
  portfolioContent: { alignItems: "center" },
  portfolioLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600" },
  portfolioValue: { color: "#FFF", fontSize: 36, fontWeight: "900", marginTop: 4 },
  changeChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 8,
  },
  changeChipText: { color: "#FFF", fontSize: 12, fontWeight: "800" },

  body: { flex: 1, backgroundColor: "#F8FAFC", borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -16 },

  comingSoonBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#E0F2FE", borderRadius: 16, margin: 20,
    padding: 14, borderWidth: 1, borderColor: "#BAE6FD",
  },
  comingSoonText: { flex: 1, fontSize: 13, color: "#0369A1", fontWeight: "600" },

  chipsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 20, flexWrap: "wrap" },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
    borderWidth: 1.5, borderColor: "#0EA5E9", backgroundColor: "#FFF",
  },
  chipActive: { backgroundColor: "#0EA5E9" },
  chipText: { fontSize: 13, fontWeight: "700", color: "#0EA5E9" },
  chipTextActive: { color: "#FFF" },

  section: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: "900", color: "#94A3B8", letterSpacing: 1.5 },
  seeAll: { fontSize: 13, color: "#0EA5E9", fontWeight: "700" },

  menuItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF", padding: 16, borderRadius: 20, marginBottom: 12,
  },
  menuIconBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "#F0F9FF", justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  tickerIconText: { fontSize: 18, fontWeight: "800", color: "#0EA5E9" },
  menuTextContainer: { flex: 1 },
  menuText: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  subText: { fontSize: 12, color: "#94A3B8", fontWeight: "600", marginTop: 2 },
  priceContainer: { alignItems: "flex-end" },
  itemPrice: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  changeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 4 },
  changeText: { fontSize: 11, fontWeight: "800" },

  footer: {
    position: "absolute", bottom: 0, width: "100%",
    padding: 24, paddingTop: 10,
    backgroundColor: "rgba(248, 250, 252, 0.95)",
  },
  primaryBtn: {
    backgroundColor: "#0EA5E9", height: 58, borderRadius: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
