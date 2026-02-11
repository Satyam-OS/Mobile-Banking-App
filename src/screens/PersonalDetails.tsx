import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

interface InfoCardProps {
  label: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  isVerified?: boolean;
  isEditing: boolean;
  onChangeText?: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
}

// Optimized Reusable Component with Editing Support
const InfoCard = ({
  label,
  value,
  icon,
  isVerified,
  isEditing,
  onChangeText,
  keyboardType = "default",
  maxLength,
}: InfoCardProps) => (
  <View style={[styles.menuItem, isEditing && styles.menuItemEditing]}>
    <View style={styles.menuIconBox}>
      <MaterialCommunityIcons name={icon} size={22} color="#0EA5E9" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      {isEditing ? (
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
        <Text style={styles.infoValue}>{value || "Not Set"}</Text>
      )}
    </View>
    {!isEditing && isVerified && (
      <View style={styles.verifiedBadge}>
        <Feather name="check-circle" size={14} color="#10B981" />
        <Text style={styles.verifiedText}>Verified</Text>
      </View>
    )}
  </View>
);

const PersonalDetails = ({ navigation }: any) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const mockApiResponse: UserProfile = {
          id: "882910",
          firstName: "Hritik",
          lastName: "Pandit",
          email: "hritik@example.com",
          phone: "2345678901",
          address: "Kharadi, Pune, Maharashtra",
          nationality: "Indian",
          isEmailVerified: true,
          isPhoneVerified: false,
        };
        setUser(mockApiResponse);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handlePhoneChange = (txt: string) => {
    // Clean the string to only allow digits
    const cleaned = txt.replace(/[^0-9]/g, "");
    if (cleaned.length <= 10) {
      setUser((prev) => (prev ? { ...prev, phone: cleaned } : null));
    }
  };

  const handleUpdate = () => {
    if (user && user.phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Details</Text>
          <TouchableOpacity
            style={[styles.editBtn, isEditing && styles.editBtnActive]}
            onPress={() => (isEditing ? handleUpdate() : setIsEditing(true))}
          >
            <Feather
              name={isEditing ? "check" : "edit-3"}
              size={20}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName[0]}
              {user?.lastName[0]}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userID}>User ID: #{user?.id}</Text>
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
          icon="account-outline"
          isEditing={isEditing}
          onChangeText={(txt) =>
            setUser((prev) => (prev ? { ...prev, firstName: txt } : null))
          }
        />
        <InfoCard
          label="Last Name"
          value={user?.lastName || ""}
          icon="account-outline"
          isEditing={isEditing}
          onChangeText={(txt) =>
            setUser((prev) => (prev ? { ...prev, lastName: txt } : null))
          }
        />
        <InfoCard
          label="Email Address"
          value={user?.email || ""}
          icon="email-outline"
          isVerified={user?.isEmailVerified}
          isEditing={false}
        />
        <InfoCard
          label="Phone Number"
          value={user?.phone || ""}
          icon="phone-outline"
          isVerified={user?.isPhoneVerified}
          isEditing={isEditing}
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={handlePhoneChange}
        />

        <Text style={styles.sectionTitle}>Residential Address</Text>
        <InfoCard
          label="Home Address"
          value={user?.address || ""}
          icon="map-marker-outline"
          isEditing={isEditing}
          onChangeText={(txt) =>
            setUser((prev) => (prev ? { ...prev, address: txt } : null))
          }
        />
        <InfoCard
          label="Nationality"
          value={user?.nationality || ""}
          icon="flag-outline"
          isEditing={isEditing}
          onChangeText={(txt) =>
            setUser((prev) => (prev ? { ...prev, nationality: txt } : null))
          }
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 50,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 10,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  editBtn: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  editBtnActive: { backgroundColor: "#10B981" },
  profileSection: { alignItems: "center", marginTop: 10 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  avatarText: { color: "#FFF", fontSize: 30, fontWeight: "800" },
  userName: { color: "#FFF", fontSize: 24, fontWeight: "800", marginTop: 12 },
  userID: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600" },
  scrollContent: { flex: 1, marginTop: -25 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#94A3B8",
    letterSpacing: 1.5,
    marginLeft: 25,
    marginBottom: 15,
    marginTop: 35,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 22,
    marginHorizontal: 25,
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.08,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  menuItemEditing: {
    borderColor: "#0EA5E9",
    borderWidth: 1.5,
    backgroundColor: "#F0F9FF",
  },
  menuIconBox: {
    width: 48,
    height: 48,
    backgroundColor: "#F0F9FF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "700",
    marginBottom: 2,
  },
  infoValue: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  inputField: { fontSize: 16, fontWeight: "700", color: "#0EA5E9", padding: 0 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  verifiedText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: "#0EA5E9",
    marginHorizontal: 25,
    marginTop: 20,
    height: 55,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});

export default PersonalDetails;
