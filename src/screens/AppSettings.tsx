import {
    ArrowLeft,
    ChevronRight,
    Database,
    Info,
    Languages,
    Moon,
    Trash2,
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

export default function AppSettings({ navigation }: any) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDataSaver, setIsDataSaver] = useState(false);

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
        <Text style={styles.headerTitle}>APP SETTINGS</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Localization Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>

          <TouchableOpacity style={styles.itemCard}>
            <View style={styles.iconBox}>
              <Languages size={22} color="#0EA5E9" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Language</Text>
              <Text style={styles.itemDescription}>
                English (United States)
              </Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.itemCard}>
            <View style={styles.iconBox}>
              <Moon size={22} color="#0EA5E9" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Dark Mode</Text>
              <Text style={styles.itemDescription}>Adjust app appearance</Text>
            </View>
            <Switch
              trackColor={{ false: "#CBD5E1", true: "#BAE6FD" }}
              thumbColor={isDarkMode ? "#0EA5E9" : "#F1F5F9"}
              onValueChange={() => setIsDarkMode(!isDarkMode)}
              value={isDarkMode}
            />
          </View>
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA & STORAGE</Text>

          <View style={styles.itemCard}>
            <View style={styles.iconBox}>
              <Database size={22} color="#0EA5E9" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Data Saver</Text>
              <Text style={styles.itemDescription}>
                Reduce data usage on mobile
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#CBD5E1", true: "#BAE6FD" }}
              thumbColor={isDataSaver ? "#0EA5E9" : "#F1F5F9"}
              onValueChange={() => setIsDataSaver(!isDataSaver)}
              value={isDataSaver}
            />
          </View>

          <TouchableOpacity style={styles.itemCard}>
            <View style={styles.iconBox}>
              <Trash2 size={22} color="#EF4444" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Clear Cache</Text>
              <Text style={styles.itemDescription}>Free up 24.5 MB space</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* About App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <TouchableOpacity style={styles.itemCard}>
            <View style={styles.iconBox}>
              <Info size={22} color="#0EA5E9" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>App Version</Text>
              <Text style={styles.itemDescription}>v2.4.1 (Stable Build)</Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
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

  section: { marginTop: 25, paddingHorizontal: 20 },
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
});
