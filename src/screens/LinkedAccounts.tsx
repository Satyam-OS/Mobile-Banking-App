import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    Plus,
    Trash2,
    Wallet,
} from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Data for Linked Accounts
const linkedAccounts = [
  {
    id: "1",
    bankName: "State Bank of India",
    accountType: "Savings Account",
    maskedNumber: "•••• •••• 2231",
    status: "Verified",
    icon: Building2,
  },
  {
    id: "2",
    bankName: "HDFC Bank",
    accountType: "Current Account",
    maskedNumber: "•••• •••• 8492",
    status: "Verified",
    icon: Building2,
  },
  {
    id: "3",
    bankName: "Paytm Wallet",
    accountType: "Digital Wallet",
    maskedNumber: "+91 7070707070",
    status: "Verified",
    icon: Wallet,
  },
];

export default function LinkedAccounts({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navy Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LINKED ACCOUNTS</Text>
        <View style={{ width: 44 }} /> {/* Spacer to center the title */}
      </View>

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionDescription}>
            Manage your connected bank accounts and wallets for seamless
            transfers and payments.
          </Text>

          {/* Linked Accounts List */}
          {linkedAccounts.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                  <account.icon size={22} color="#0EA5E9" strokeWidth={2} />
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.bankName}>{account.bankName}</Text>
                  <Text style={styles.accountNumber}>
                    {account.maskedNumber}
                  </Text>
                  <View style={styles.statusRow}>
                    <CheckCircle2 size={12} color="#10B981" />
                    <Text style={styles.statusText}>{account.status}</Text>
                  </View>
                </View>
              </View>

              {/* Delete/Unlink Button */}
              <TouchableOpacity style={styles.unlinkBtn}>
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Floating Action Button for adding a new account */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addAccountBtn}>
            <Plus size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.addAccountText}>LINK NEW ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#001F3F" },
  container: { flex: 1, backgroundColor: "#F0F9FF" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#001F3F",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
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

  // Content
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for the floating button
  },
  sectionDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: "500",
  },

  // Cards
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  accountDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#001F3F",
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
    letterSpacing: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "700",
    marginLeft: 4,
  },
  unlinkBtn: {
    padding: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
  },

  // Footer Button
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(240, 249, 255, 0.9)", // slightly transparent to blend
  },
  addAccountBtn: {
    backgroundColor: "#0EA5E9",
    flexDirection: "row",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  addAccountText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
});
