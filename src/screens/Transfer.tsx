import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  QrCode,
  Smartphone,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { transactionService } from "../services/transactionService";

export default function Transfer({ navigation }: any) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await transactionService.getTransactionHistory();
        setTransactions(data || []);
      } catch (err) {
        setTransactions([
          {
            id: "1",
            name: "Rahul Sharma",
            amount: "500",
            date: "Today, 10:20 AM",
            type: "debit",
          },
          {
            id: "2",
            name: "Salary Credit",
            amount: "50,000",
            date: "Yesterday",
            type: "credit",
          },
          {
            id: "3",
            name: "Netflix India",
            amount: "699",
            date: "Mar 11",
            type: "debit",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SEND MONEY</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.quickActionsCard}>
            <ActionBtn
              icon={Building2}
              label="Bank"
              color="#0EA5E9"
              onPress={() => navigation.navigate("BankTransfer")}
            />
            <ActionBtn
              icon={Smartphone}
              label="UPI ID"
              color="#8B5CF6"
              style={{ opacity: 0.5 }}
            />
            <ActionBtn
              icon={QrCode}
              label="Scan QR"
              color="#10B981"
              style={{ opacity: 0.5 }}
            />
          </View>

          <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>

          {loading ? (
            <ActivityIndicator
              size="small"
              color="#0EA5E9"
              style={{ marginTop: 20 }}
            />
          ) : (
            transactions.map((tx) => (
              <View key={tx.id} style={styles.txItem}>
                <View
                  style={[
                    styles.txIcon,
                    {
                      backgroundColor:
                        tx.type === "credit" ? "#F0FDF4" : "#FFF1F2",
                    },
                  ]}
                >
                  {tx.type === "credit" ? (
                    <ArrowDownLeft size={20} color="#10B981" />
                  ) : (
                    <ArrowUpRight size={20} color="#E11D48" />
                  )}
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txName}>{tx.name}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    { color: tx.type === "credit" ? "#10B981" : "#1E293B" },
                  ]}
                >
                  {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const ActionBtn = ({ icon: Icon, label, color, style, onPress }: any) => (
  <TouchableOpacity style={[styles.actionItem, style]} onPress={onPress}>
    <View style={[styles.actionIcon, { backgroundColor: color + "15" }]}>
      <Icon size={24} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#002D72" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    height: 80,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  iconBtn: { padding: 5 },
  content: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -10,
  },
  scroll: { padding: 25, paddingBottom: 50 },
  quickActionsCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    paddingTop: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 30,
    justifyContent: "space-around",
  },
  actionItem: { alignItems: "center", gap: 8 },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: { fontSize: 11, fontWeight: "800", color: "#64748B" },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#94A3B8",
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    borderRadius: 16,
    marginBottom: 12,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  txInfo: { flex: 1, marginLeft: 15 },
  txName: { fontSize: 14, fontWeight: "800", color: "#1E293B" },
  txDate: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "900" },
});
