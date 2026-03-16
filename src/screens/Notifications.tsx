import {
    ArrowLeft,
    CircleAlert,
    MessageSquare,
    Percent,
    ShieldCheck,
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

export default function Notifications({ navigation }: any) {
  // State for toggles
  const [settings, setSettings] = useState({
    transactions: true,
    security: true,
    promotions: false,
    news: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
        <Text style={styles.headerTitle}>NOTIFICATIONS</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Urgent Alerts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CRITICAL ALERTS</Text>
          <NotificationItem
            icon={ShieldCheck}
            title="Transaction Alerts"
            description="Real-time push notifications for all debits and credits."
            value={settings.transactions}
            onToggle={() => toggleSetting("transactions")}
            iconColor="#0EA5E9"
          />
          <NotificationItem
            icon={CircleAlert}
            title="Security Warnings"
            description="Alerts for new logins or password changes."
            value={settings.security}
            onToggle={() => toggleSetting("security")}
            iconColor="#F59E0B"
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OFFERS & UPDATES</Text>
          <NotificationItem
            icon={Percent}
            title="Promotional Offers"
            description="Exclusive rewards, cashback, and loan offers."
            value={settings.promotions}
            onToggle={() => toggleSetting("promotions")}
            iconColor="#10B981"
          />
          <NotificationItem
            icon={MessageSquare}
            title="App News"
            description="Stay updated with new features and maintenance."
            value={settings.news}
            onToggle={() => toggleSetting("news")}
            iconColor="#6366F1"
          />
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            Note: Essential system notifications regarding account status and
            legal updates cannot be turned off.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Toggle Item Component
const NotificationItem = ({
  icon: Icon,
  title,
  description,
  value,
  onToggle,
  iconColor,
}: any) => (
  <View style={styles.itemCard}>
    <View style={[styles.iconBox, { backgroundColor: `${iconColor}15` }]}>
      <Icon size={22} color={iconColor} strokeWidth={2} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemDescription}>{description}</Text>
    </View>
    <Switch
      trackColor={{ false: "#CBD5E1", true: "#BAE6FD" }}
      thumbColor={value ? "#0EA5E9" : "#F1F5F9"}
      ios_backgroundColor="#CBD5E1"
      onValueChange={onToggle}
      value={value}
    />
  </View>
);

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
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748B",
    marginBottom: 15,
    marginLeft: 5,
    letterSpacing: 1.5,
  },

  // Item Card
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    elevation: 2,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#001F3F",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
    fontWeight: "500",
  },

  // Footer
  footerInfo: {
    padding: 30,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 18,
  },
});
