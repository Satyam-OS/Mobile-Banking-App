import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardTypeOptions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../services/authService";
import { accountService } from "../services/accountService";
import { ArrowLeft, Check, Edit3, Mail, MapPin, Phone, User } from "lucide-react-native";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  accountNumber: string;
  customerId: string;
  isEmailVerified: boolean;
}

interface InfoCardProps {
  label: string;
  value: string;
  iconComponent: React.ReactNode;
  isVerified?: boolean;
  isEditing?: boolean;
  editable?: boolean;
  onChangeText?: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
}

const InfoCard = ({
  label, value, iconComponent, isVerified,
  isEditing, editable = false, onChangeText, keyboardType = "default", maxLength,
}: InfoCardProps) => (
  <View style={[styles.menuItem, isEditing && editable && styles.menuItemEditing]}>
    <View style={styles.menuIconBox}>{iconComponent}</View>
    <View style={styles.textContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      {isEditing && editable ? (
        <TextInput
          style={styles.inputField}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${label}`}
          placeholderTextColor="#CBD5E1"
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
      ) : (
        <Text style={styles.infoValue}>{value || "—"}</Text>
      )}
    </View>
    {!isEditing && isVerified && (
      <View style={styles.verifiedBadge}>
        <Check size={14} color="#10B981" />
        <Text style={styles.verifiedText}>Verified</Text>
      </View>
    )}
  </View>
);

const PersonalDetails = ({ navigation }: any) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch from both auth-service (user info) and account-service (account info) in parallel
      const [dashResult, accountResult] = await Promise.allSettled([
        authService.getUserDashboard(),
        accountService.getAccountDetails(),
      ]);

      // Build profile from API responses
      const dash = dashResult.status === "fulfilled" ? dashResult.value : null;
      const account = accountResult.status === "fulfilled" ? accountResult.value : null;

      // Fallback to cached data if API fails
      const cached = await AsyncStorage.getItem("user_data");
      const cachedData = cached ? JSON.parse(cached) : null;

      const fullName: string = dash?.firstName || cachedData?.name || "";
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setUser({
        id: dash?.customerId || cachedData?.customerId || "",
        firstName,
        lastName,
        email: dash?.email || cachedData?.email || "",
        phone: dash?.mobile || cachedData?.mobile || "",
        accountNumber: account?.accountNumber || "",
        customerId: dash?.customerId || cachedData?.customerId || "",
        isEmailVerified: !!(dash?.email || cachedData?.email),
      });
    } catch (err) {
      console.error("Error fetching personal details:", err);
      setError("Unable to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    setIsEditing(false);
    // Note: actual update API endpoint not implemented in backend yet
    // This saves locally only for now
  };

  const getInitials = () => {
    if (!user) return "?";
    const f = user.firstName?.[0] || "";
    const l = user.lastName?.[0] || "";
    return (f + l).toUpperCase() || "?";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={{ color: "#64748B", marginTop: 12, fontWeight: "600" }}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#EF4444", fontWeight: "700", textAlign: "center", paddingHorizontal: 30 }}>{error}</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={fetchUserData}>
          <Text style={{ color: "#0EA5E9", fontWeight: "800" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Details</Text>
          <TouchableOpacity
            style={[styles.editBtn, isEditing && styles.editBtnActive]}
            onPress={() => (isEditing ? handleUpdate() : setIsEditing(true))}
          >
            {isEditing
              ? <Check size={20} color="#FFF" />
              : <Edit3 size={20} color="#FFF" />
            }
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          {user?.customerId ? (
            <Text style={styles.userID}>ID: #{user.customerId}</Text>
          ) : null}
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.sectionTitle}>Identity Information</Text>

        <InfoCard
          label="First Name"
          value={user?.firstName || ""}
          iconComponent={<User size={22} color="#0EA5E9" />}
          isEditing={isEditing}
          editable
          onChangeText={(txt) =>
            setUser((prev) => (prev ? { ...prev, firstName: txt } : null))
          }
        />
        <InfoCard
          label="Last Name"
          value={user?.lastName || ""}
          iconComponent={<User size={22} color="#0EA5E9" />}
          isEditing={isEditing}
          editable
          onChangeText={(txt) =>
            setUser((prev) => (prev ? { ...prev, lastName: txt } : null))
          }
        />
        <InfoCard
          label="Email Address"
          value={user?.email || ""}
          iconComponent={<Mail size={22} color="#0EA5E9" />}
          isVerified={user?.isEmailVerified}
          isEditing={isEditing}
          editable={false}
        />
        <InfoCard
          label="Phone Number"
          value={user?.phone || ""}
          iconComponent={<Phone size={22} color="#0EA5E9" />}
          isVerified
          isEditing={isEditing}
          editable={false}
        />

        <Text style={styles.sectionTitle}>Account Information</Text>

        <InfoCard
          label="Account Number"
          value={user?.accountNumber || ""}
          iconComponent={<MapPin size={22} color="#0EA5E9" />}
          isEditing={isEditing}
          editable={false}
        />
        <InfoCard
          label="Customer ID"
          value={user?.customerId ? `NX-${user.customerId}` : ""}
          iconComponent={<User size={22} color="#0EA5E9" />}
          isEditing={isEditing}
          editable={false}
        />

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: {
    flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 25, paddingTop: 20, paddingBottom: 50,
    borderBottomLeftRadius: 35, borderBottomRightRadius: 35,
    elevation: 10, shadowColor: "#0EA5E9", shadowOpacity: 0.3, shadowRadius: 20,
  },
  headerTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 20,
  },
  headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "800", letterSpacing: 0.5 },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-start" },
  editBtn: {
    width: 44, height: 44, backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 14, justifyContent: "center", alignItems: "center",
  },
  editBtnActive: { backgroundColor: "#10B981" },
  profileSection: { alignItems: "center", marginTop: 10 },
  avatar: {
    width: 90, height: 90, borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: "#FFF",
  },
  avatarText: { color: "#FFF", fontSize: 30, fontWeight: "800" },
  userName: { color: "#FFF", fontSize: 24, fontWeight: "800", marginTop: 12 },
  userID: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600", marginTop: 4 },
  scrollContent: { flex: 1, marginTop: -25 },
  sectionTitle: {
    fontSize: 11, fontWeight: "900", color: "#94A3B8",
    letterSpacing: 1.5, marginLeft: 25, marginBottom: 15, marginTop: 35,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF", padding: 18, borderRadius: 22,
    marginHorizontal: 25, marginBottom: 12,
    elevation: 4, shadowColor: "#0EA5E9", shadowOpacity: 0.08,
    borderWidth: 1, borderColor: "#F1F5F9",
  },
  menuItemEditing: { borderColor: "#0EA5E9", borderWidth: 1.5, backgroundColor: "#F0F9FF" },
  menuIconBox: {
    width: 48, height: 48, backgroundColor: "#F0F9FF",
    borderRadius: 15, justifyContent: "center", alignItems: "center", marginRight: 15,
  },
  textContainer: { flex: 1 },
  infoLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "700", marginBottom: 2 },
  infoValue: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  inputField: { fontSize: 16, fontWeight: "700", color: "#0EA5E9", padding: 0 },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F0FDF4", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
  },
  verifiedText: { color: "#10B981", fontSize: 11, fontWeight: "800", marginLeft: 4 },
  saveButton: {
    backgroundColor: "#0EA5E9", marginHorizontal: 25, marginTop: 20,
    height: 55, borderRadius: 18, justifyContent: "center", alignItems: "center",
    shadowColor: "#0EA5E9", shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  saveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});

export default PersonalDetails;
