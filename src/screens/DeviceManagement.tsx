import {
    ArrowLeft,
    Clock,
    LogOut,
    MapPin,
    Monitor,
    ShieldCheck,
    Smartphone,
} from "lucide-react-native";
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock Data for Active Sessions
const activeDevices = [
  {
    id: "1",
    name: "Samsung Galaxy S24 Ultra",
    type: "mobile",
    location: "Pune, India",
    time: "Active Now",
    isCurrent: true,
  },
  {
    id: "2",
    name: 'MacBook Pro 16"',
    type: "desktop",
    location: "Mumbai, India",
    time: "Logged in: 04 Mar, 10:20 AM",
    isCurrent: false,
  },
  {
    id: "3",
    name: "iPhone 15 Pro",
    type: "mobile",
    location: "Delhi, India",
    time: "Logged in: 01 Mar, 08:45 PM",
    isCurrent: false,
  },
];

export default function DeviceManagement({ navigation }: any) {
  const handleLogoutDevice = (deviceName: string) => {
    Alert.alert(
      "Logout Device",
      `Are you sure you want to log out from ${deviceName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive" },
      ],
    );
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
        <Text style={styles.headerTitle}>DEVICE MANAGEMENT</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Security Summary */}
        <View style={styles.infoBanner}>
          <ShieldCheck size={20} color="#0EA5E9" />
          <Text style={styles.infoText}>
            You are currently logged in on {activeDevices.length} devices.
            Secure your account by logging out of unrecognized sessions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIVE SESSIONS</Text>

          {activeDevices.map((device) => (
            <View
              key={device.id}
              style={[
                styles.deviceCard,
                device.isCurrent && styles.currentDeviceCard,
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: device.isCurrent ? "#0EA5E9" : "#F0F9FF",
                    },
                  ]}
                >
                  {device.type === "mobile" ? (
                    <Smartphone
                      size={22}
                      color={device.isCurrent ? "#FFF" : "#0EA5E9"}
                    />
                  ) : (
                    <Monitor
                      size={22}
                      color={device.isCurrent ? "#FFF" : "#0EA5E9"}
                    />
                  )}
                </View>
                <View style={styles.deviceInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    {device.isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>THIS DEVICE</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.metaRow}>
                    <MapPin size={12} color="#94A3B8" />
                    <Text style={styles.metaText}>{device.location}</Text>
                    <View style={styles.dot} />
                    <Clock size={12} color="#94A3B8" />
                    <Text
                      style={[
                        styles.metaText,
                        device.isCurrent && {
                          color: "#10B981",
                          fontWeight: "800",
                        },
                      ]}
                    >
                      {device.time}
                    </Text>
                  </View>
                </View>
              </View>

              {!device.isCurrent && (
                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={() => handleLogoutDevice(device.name)}
                >
                  <LogOut size={16} color="#EF4444" />
                  <Text style={styles.logoutBtnText}>LOGOUT SESSION</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Global Action */}
        <TouchableOpacity style={styles.globalLogoutBtn}>
          <Text style={styles.globalLogoutText}>
            LOGOUT FROM ALL OTHER DEVICES
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
  },

  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#E0F2FE",
    margin: 20,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 12,
    color: "#0369A1",
    fontWeight: "600",
    lineHeight: 18,
  },

  section: { paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748B",
    marginBottom: 15,
    letterSpacing: 1.5,
  },

  deviceCard: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    elevation: 2,
  },
  currentDeviceCard: { borderColor: "#0EA5E9", borderWidth: 1.5 },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  deviceInfo: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deviceName: { fontSize: 15, fontWeight: "800", color: "#001F3F" },
  currentBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentBadgeText: { color: "#166534", fontSize: 9, fontWeight: "900" },

  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  metaText: {
    fontSize: 11,
    color: "#94A3B8",
    marginLeft: 4,
    fontWeight: "600",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  logoutBtnText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
  },

  globalLogoutBtn: {
    margin: 20,
    height: 55,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
  },
  globalLogoutText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
