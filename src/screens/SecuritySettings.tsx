import {
  ArrowLeft,
  ChevronRight,
  Fingerprint,
  History,
  KeyRound,
  ShieldCheck,
  SmartphoneNfc,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SecuritySettings({ navigation }: any) {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

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
        <Text style={styles.headerTitle}>SECURITY SETTINGS</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Security Health Banner */}
        <View style={styles.healthBanner}>
          <View style={styles.healthInfo}>
            <ShieldCheck size={28} color="#10B981" />
            <View style={styles.healthTextContainer}>
              <Text style={styles.healthStatus}>Account Secured</Text>
              <Text style={styles.healthSub}>
                Last checked: Today, 10:45 AM
              </Text>
            </View>
          </View>
        </View>

        {/* Access Control Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCESS CONTROL</Text>

          <View style={styles.itemCard}>
            <View style={styles.iconBox}>
              <Fingerprint size={22} color="#0EA5E9" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Biometric Login</Text>
              <Text style={styles.itemDescription}>
                Use FaceID or Fingerprint
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#CBD5E1", true: "#BAE6FD" }}
              thumbColor={isBiometricEnabled ? "#0EA5E9" : "#F1F5F9"}
              onValueChange={() => setIsBiometricEnabled(!isBiometricEnabled)}
              value={isBiometricEnabled}
            />
          </View>

          <TouchableOpacity style={styles.itemCard}>
            <View style={styles.iconBox}>
              <KeyRound size={22} color="#0EA5E9" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Change Login Password</Text>
              <Text style={styles.itemDescription}>
                Last changed 3 months ago
              </Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Advanced Protection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ADVANCED PROTECTION</Text>

          <View style={styles.itemCard}>
            <View style={styles.iconBox}>
              <SmartphoneNfc size={22} color="#0EA5E9" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Two-Factor Auth (2FA)</Text>
              <Text style={styles.itemDescription}>
                Extra layer of security
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#CBD5E1", true: "#BAE6FD" }}
              thumbColor={isTwoFactorEnabled ? "#0EA5E9" : "#F1F5F9"}
              onValueChange={() => setIsTwoFactorEnabled(!isTwoFactorEnabled)}
              value={isTwoFactorEnabled}
            />
          </View>

          <TouchableOpacity style={styles.itemCard}>
            <View style={styles.iconBox}>
              <History size={22} color="#0EA5E9" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Login Activity</Text>
              <Text style={styles.itemDescription}>Review recent sign-ins</Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deactivateBtn}>
          <Text style={styles.deactivateText}>
            Temporarily Deactivate Account
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  healthBanner: {
    margin: 20,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    elevation: 2,
  },
  healthInfo: { flexDirection: "row", alignItems: "center" },
  healthTextContainer: { marginLeft: 15 },
  healthStatus: { fontSize: 16, fontWeight: "800", color: "#001F3F" },
  healthSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  section: { marginTop: 10, paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748B",
    marginBottom: 15,
    marginLeft: 5,
    letterSpacing: 1.5,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  itemTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#001F3F",
    marginBottom: 2,
  },
  itemDescription: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
  deactivateBtn: {
    marginTop: 30,
    marginBottom: 40,
    alignItems: "center",
  },
  deactivateText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
