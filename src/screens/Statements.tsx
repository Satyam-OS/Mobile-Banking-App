import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Download,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Data for Transactions
const transactions = [
  {
    id: "1",
    type: "debit",
    title: "Amazon India",
    date: "Today, 02:45 PM",
    amount: "- ₹1,299.00",
    category: "Shopping",
  },
  {
    id: "2",
    type: "credit",
    title: "Salary Credited",
    date: "Yesterday",
    amount: "+ ₹85,000.00",
    category: "Income",
  },
  {
    id: "3",
    type: "debit",
    title: "Zomato",
    date: "04 Mar 2026",
    amount: "- ₹450.00",
    category: "Food",
  },
  {
    id: "4",
    type: "debit",
    title: "Electric Bill",
    date: "01 Mar 2026",
    amount: "- ₹3,200.00",
    category: "Utilities",
  },
  {
    id: "5",
    type: "credit",
    title: "Refund - Myntra",
    date: "28 Feb 2026",
    amount: "+ ₹999.00",
    category: "Refund",
  },
];

export default function Statements({ navigation }: any) {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>STATEMENTS</Text>
        <TouchableOpacity style={styles.downloadBtn}>
          <Download size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Date Selector / Filter Row */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {["All", "Last 7 Days", "February", "January", "Custom"].map(
              (filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    activeFilter === filter && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === filter && styles.filterTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </ScrollView>
        </View>

        {/* Transaction List */}
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.transactionCard}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      item.type === "credit" ? "#DCFCE7" : "#FEE2E2",
                  },
                ]}
              >
                {item.type === "credit" ? (
                  <ArrowDownLeft size={20} color="#10B981" />
                ) : (
                  <ArrowUpRight size={20} color="#EF4444" />
                )}
              </View>
              <View style={styles.details}>
                <Text style={styles.transTitle}>{item.title}</Text>
                <Text style={styles.transSub}>
                  {item.date} • {item.category}
                </Text>
              </View>
              <Text
                style={[
                  styles.amount,
                  { color: item.type === "credit" ? "#10B981" : "#001F3F" },
                ]}
              >
                {item.amount}
              </Text>
            </View>
          )}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>RECENT TRANSACTIONS</Text>
              <TouchableOpacity style={styles.calendarBtn}>
                <Calendar size={16} color="#0EA5E9" />
                <Text style={styles.calendarText}>Range</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#001F3F" },
  container: { flex: 1, backgroundColor: "#F0F9FF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#001F3F",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  downloadBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  // Filters
  filterWrapper: { paddingVertical: 15 },
  filterScroll: { paddingHorizontal: 20 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: { backgroundColor: "#0EA5E9", borderColor: "#0EA5E9" },
  filterText: { fontSize: 12, fontWeight: "700", color: "#64748B" },
  filterTextActive: { color: "#FFF" },

  // List
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  listHeaderText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748B",
    letterSpacing: 1,
  },
  calendarBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  calendarText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0EA5E9",
    marginLeft: 5,
  },

  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  details: { flex: 1 },
  transTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#001F3F",
    marginBottom: 2,
  },
  transSub: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },
  amount: { fontSize: 14, fontWeight: "900" },
});
