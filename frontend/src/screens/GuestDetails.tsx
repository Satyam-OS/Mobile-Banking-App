import { ArrowRight } from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { authService } from "../services/authService";

export default function GuestDetails({ navigation }: any) {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (loading) return;
    if (mobile.length !== 10) {
      Alert.alert("Invalid Number", "Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);
      await authService.generateOtp(mobile);
      navigation.navigate("GuestOtp", { mobile });
    } catch (e: any) {
      const msg = e.message || "";
      if (msg === "SERVER_ERROR") {
        Alert.alert("Service Unavailable", "OTP service is temporarily unavailable. Please try again later.");
      } else if (msg === "NETWORK_ERROR") {
        Alert.alert("No Connection", "Please check your internet and try again.");
      } else {
        Alert.alert("Error", msg || "Failed to send OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ padding: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: "900" }}>Guest Access</Text>

          <TextInput
            placeholder="Enter mobile number"
            keyboardType="number-pad"
            maxLength={10}
            value={mobile}
            onChangeText={(t) => setMobile(t.replace(/[^0-9]/g, ""))}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={sendOtp}
            disabled={loading}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>Send OTP</Text>
            <ArrowRight size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: 30,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  btn: {
    marginTop: 40,
    height: 56,
    backgroundColor: "#002D72",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
