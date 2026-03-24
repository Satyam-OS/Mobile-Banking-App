import { Shield } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated, Easing, Platform, StatusBar,
  StyleSheet, Text, View,
} from "react-native";
import { authService } from "../services/authService";

export default function SplashScreen({ navigation }: any) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: false }),
      Animated.timing(scaleAnim, {
        toValue: 1, duration: 800,
        easing: Easing.out(Easing.back(1.2)), useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(async () => {
      try {
        // New user (no token) → Login
        // Existing logged-in user (has token) → Dashboard
        const isLoggedIn = await authService.isLoggedIn();
        if (isLoggedIn) {
          navigation.replace("Dashboard");
        } else {
          navigation.replace("Login");
        }
      } catch {
        navigation.replace("Login");
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F9FF" />
      <Animated.View
        style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.iconBox}>
          <Shield size={70} color="#0EA5E9" strokeWidth={1.5} />
        </View>
        <Text style={styles.brandName}>NEXUS</Text>
        <Text style={styles.tagline}>Secure Digital Banking</Text>
      </Animated.View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>POWERED BY NEXUS SYSTEMS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#F0F9FF", justifyContent: "center", alignItems: "center" },
  logoContainer:{ alignItems: "center" },
  iconBox: {
    width: 120, height: 120, backgroundColor: "#FFF", borderRadius: 35,
    justifyContent: "center", alignItems: "center", elevation: 12,
    shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15, shadowRadius: 20, marginBottom: 20,
  },
  brandName:  { fontSize: 34, fontWeight: "900", color: "#0F172A", letterSpacing: 8 },
  tagline:    { fontSize: 14, color: "#64748B", fontWeight: "600", marginTop: 10, letterSpacing: 2, textTransform: "uppercase" },
  footer:     { position: "absolute", bottom: 60 },
  footerText: { fontSize: 11, color: "#94A3B8", fontWeight: "700", letterSpacing: 2 },
});
