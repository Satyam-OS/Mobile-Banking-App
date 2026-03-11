import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// 1. Refined CategoryChip
interface ChipProps {
  icon: any;
  label: string;
  active?: boolean;
  inUse?: boolean; // Added inUse prop
}

const CategoryChip = ({ icon, label, active, inUse = true }: ChipProps) => (
  <TouchableOpacity
    style={[
      styles.chip,
      active && styles.chipActive,
      !inUse && { opacity: 0.35 }, // Faded state
    ]}
    disabled={!inUse} // Disable interaction if not in use
  >
    <MaterialCommunityIcons
      name={icon}
      size={18}
      color={active ? "#FFF" : "#0EA5E9"}
    />
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// 2. High-Fidelity Investment Item
interface InvestProps {
  name: string;
  ticker: string;
  price: string;
  change: string;
  up: boolean;
  inUse?: boolean; // Added inUse prop
}

const InvestItem = ({
  name,
  ticker,
  price,
  change,
  up,
  inUse = true,
}: InvestProps) => (
  <TouchableOpacity
    style={[
      styles.menuItem,
      !inUse && { opacity: 0.35 }, // Faded state
    ]}
    disabled={!inUse} // Disable interaction if not in use
  >
    <View style={styles.menuIconBox}>
      <Text style={styles.tickerIconText}>{ticker[0]}</Text>
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuText}>{name}</Text>
      <Text style={styles.subText}>{ticker} • NSE</Text>
    </View>
    <View style={styles.priceContainer}>
      <Text style={styles.itemPrice}>{price}</Text>
      <View
        style={[
          styles.changeBadge,
          { backgroundColor: up ? "#DCFCE7" : "#FEE2E2" },
        ]}
      >
        <Text
          style={[styles.changeText, { color: up ? "#15803D" : "#B91C1C" }]}
        >
          {change}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const InvestDashboard = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* FIXED HEADER & PORTFOLIO */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
          >
            <Feather name="chevron-left" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Investments</Text>
          <TouchableOpacity style={styles.searchBtn}>
            <Feather name="search" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.portfolioContainer}>
          <Text style={styles.portfolioLabel}>Portfolio Balance</Text>
          <Text style={styles.portfolioValue}>₹8,24,850.42</Text>
          <View style={styles.statsRow}>
            <View style={styles.trendPill}>
              <Feather name="trending-up" size={14} color="#FFF" />
              <Text style={styles.statsText}>+5.2%</Text>
            </View>
            <Text style={styles.statsSubText}>vs last month</Text>
          </View>
        </View>
      </View>

      {/* FIXED ASSET CLASSES (DOES NOT SCROLL VERTICALLY) */}
      <View style={styles.fixedAssetsContainer}>
        <Text style={styles.sectionLabel}>Asset Classes</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={{ paddingLeft: 24, paddingRight: 24 }}
        >
          <CategoryChip icon="trending-up" label="Stocks" active inUse={true} />
          <CategoryChip icon="chart-line" label="Mutual Funds" inUse={false} />
          <CategoryChip icon="bitcoin" label="Crypto" inUse={false} />
          <CategoryChip icon="bank" label="Bonds" inUse={false} />
          <CategoryChip icon="gold" label="Gold" inUse={false} />
        </ScrollView>
      </View>

      {/* SCROLLABLE MARKET WATCH ONLY */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Market Watch</Text>
          <TouchableOpacity style={{ opacity: 0.35 }} disabled>
            <Text style={styles.viewAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <InvestItem
          name="Reliance Industries"
          ticker="RELIANCE"
          price="₹2,942.60"
          change="+1.45%"
          up={false}
          inUse={false}
        />
        <InvestItem
          name="HDFC Bank"
          ticker="HDFCBANK"
          price="₹1,432.20"
          change="-0.30%"
          up={false}
          inUse={false}
        />
        <InvestItem
          name="Tata Motors"
          ticker="TATAMOTORS"
          price="₹920.45"
          change="+4.12%"
          up={false}
          inUse={false}
        />
        <InvestItem
          name="Infosys Ltd"
          ticker="INFY"
          price="₹1,505.15"
          change="+0.85%"
          up={false}
          inUse={false}
        />
        <InvestItem
          name="Zomato Ltd"
          ticker="ZOMATO"
          price="₹174.42"
          change="-1.12%"
          up={false}
          inUse={false}
        />
        <InvestItem
          name="ICICI Bank"
          ticker="ICICIBANK"
          price="₹1,080.30"
          change="+2.15%"
          up={false}
          inUse={false}
        />
        <InvestItem
          name="Axis Bank"
          ticker="AXISBANK"
          price="₹1,050.00"
          change="+0.45%"
          up={false}
          inUse={false}
        />
        <InvestItem
          name="Wipro"
          ticker="WIPRO"
          price="₹480.20"
          change="-0.90%"
          up={false}
          inUse={false}
        />
      </ScrollView>

      {/* FLOATING FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.9}>
          <Text style={styles.primaryBtnText}>Discover New Assets</Text>
          <Feather name="arrow-right" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 40,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  backBtn: { width: 40, height: 40, justifyContent: "center", marginLeft: -10 },
  searchBtn: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  portfolioContainer: { marginTop: 5 },
  portfolioLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  portfolioValue: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "800",
    marginVertical: 4,
  },
  statsRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  trendPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statsText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  statsSubText: {
    color: "#BAE6FD",
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "500",
  },

  fixedAssetsContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  content: { flex: 1 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1.5,
    marginHorizontal: 24,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 24,
    marginTop: 10,
  },
  viewAll: {
    color: "#0EA5E9",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 16,
  },
  chipScroll: { marginBottom: 10 },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  chipText: {
    marginLeft: 8,
    fontWeight: "700",
    color: "#64748B",
    fontSize: 13,
  },
  chipTextActive: { color: "#FFF" },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  menuIconBox: {
    width: 46,
    height: 46,
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  tickerIconText: { fontSize: 18, fontWeight: "800", color: "#0EA5E9" },
  menuTextContainer: { flex: 1 },
  menuText: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  subText: { fontSize: 12, color: "#94A3B8", fontWeight: "600", marginTop: 2 },
  priceContainer: { alignItems: "flex-end" },
  itemPrice: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  changeText: { fontSize: 11, fontWeight: "800" },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 24,
    paddingTop: 10,
    backgroundColor: "rgba(248, 250, 252, 0.95)",
  },
  primaryBtn: {
    backgroundColor: "#0EA5E9",
    height: 58,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    marginRight: 12,
  },
});

export default InvestDashboard;
