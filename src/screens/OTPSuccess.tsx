import { ShieldCheck, XCircle } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function OTPSuccess({ route, navigation }: any) {
  const { status } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Smooth entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    //   const timer = setTimeout(() => {
    //     if (status === "SUCCESS") {
    //       navigation.replace("KYCOnboarding");
    //     } else {
    //       navigation.replace("GuestExplore");
    //     }
    //   }, 3000); // Reduced to 3s for faster UX

    //   return () => clearTimeout(timer);
    // }, []);
    const timer = setTimeout(() => {
      // TEMPORARY: Force navigation to skip the OTP/Login flow
      // Replace "KYCOnboarding" with "Dashboard" if that is where you need to be
      navigation.replace("KYCOnboarding");
    }, 1000); // Reduced to 1s so you don't have to wait during development

    return () => clearTimeout(timer);
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F9FF" />

      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: status === "SUCCESS" ? "#ECFDF5" : "#FEF2F2" },
          ]}
        >
          {status === "SUCCESS" ? (
            <ShieldCheck size={48} color="#10B981" />
          ) : (
            <XCircle size={48} color="#EF4444" />
          )}
        </View>

        <Text style={styles.title}>
          {status === "SUCCESS"
            ? "Verification Complete"
            : "Verification Failed"}
        </Text>

        <Text style={styles.subtitle}>
          {status === "SUCCESS"
            ? "Your identity has been confirmed securely.\nPreparing your KYC application..."
            : "The OTP entered was invalid or expired.\nPlease try again."}
        </Text>

        <View style={styles.loaderContainer}>
          <Text style={styles.redirectText}>
            {status === "SUCCESS" ? "Redirecting to KYC" : "Returning to Entry"}
          </Text>
          <View style={styles.dotContainer}>
            <View style={styles.dot} />
            <View style={[styles.dot, { opacity: 0.6 }]} />
            <View style={[styles.dot, { opacity: 0.3 }]} />
          </View>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>NEXUS INSTITUTIONAL BANKING</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF", // Lighter sky blue theme
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFF",
    width: "100%",
    paddingVertical: 50,
    paddingHorizontal: 30,
    borderRadius: 32,
    alignItems: "center",
    shadowColor: "#001F3F",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#001F3F", // Navy
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    textAlign: "center",
    color: "#64748B",
    lineHeight: 22,
    fontWeight: "500",
  },
  loaderContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  redirectText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0EA5E9", // Professional Blue
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  dotContainer: {
    flexDirection: "row",
    gap: 4,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0EA5E9",
  },
  footer: {
    position: "absolute",
    bottom: 40,
  },
  footerText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 2,
  },
});
