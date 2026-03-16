import React, { useState, useEffect } from "react";
import { 
  StyleSheet, Text, View, TouchableOpacity, Share, 
  SafeAreaView, Alert, StatusBar, Platform, Clipboard, Animated 
} from "react-native";
import { ArrowLeft, Copy, Gift, Share2, Users, ShieldCheck } from "lucide-react-native";

export default function ReferAndEarnScreen({ navigation }: any) {
  const [referralCode] = useState("START2026");
  const [showToast, setShowToast] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const onCopyCode = () => {
    Clipboard.setString(referralCode);
    
    // Trigger cross-platform toast notification
    setShowToast(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Hide after 2 seconds
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowToast(false));
    }, 2000);
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `Join me on this secure banking app! Use my referral code ${referralCode} to sign up and start earning rewards.`,
      });
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(error.message);
      } else {
        Alert.alert(error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#002D72" />
      
      {/* Toast Notification */}
      {showToast && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <Text style={styles.toastText}>Referral code copied!</Text>
        </Animated.View>
      )}

      {/* Header */}
      <SafeAreaView style={styles.headerArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refer & Earn</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Reward Card */}
        <View style={styles.rewardCard}>
          <Gift size={48} color="#FBBF24" />
          <Text style={styles.rewardTitle}>Refer & Earn ₹500</Text>
          <Text style={styles.rewardDesc}>Invite your friends and family to join our professional banking platform. Both you and your friend earn ₹500 after they complete their first transaction.</Text>
        </View>

        {/* Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR REFERRAL CODE</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <TouchableOpacity onPress={onCopyCode} style={styles.copyBtn}>
              <Copy size={20} color="#002D72" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
          {[
            { icon: Share2, title: "Share your link", desc: "Send your code to friends" },
            { icon: Users, title: "Friends sign up", desc: "They register using your code" },
            { icon: ShieldCheck, title: "Earn Rewards", desc: "Get ₹500 in your account" },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepIconBox}>
                <step.icon size={20} color="#002D72" />
              </View>
              <View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.mainShareBtn} onPress={onShare}>
          <Text style={styles.mainShareText}>SHARE WITH FRIENDS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#002D72" },
  headerArea: { backgroundColor: "#002D72" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20 },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "800" },
  content: { flex: 1, backgroundColor: "#E8F4FD", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20 },
  rewardCard: { backgroundColor: "#FFF", borderRadius: 24, padding: 25, alignItems: "center", elevation: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 20 },
  rewardTitle: { fontSize: 22, fontWeight: "900", color: "#002D72", marginTop: 15, marginBottom: 10 },
  rewardDesc: { textAlign: "center", color: "#64748B", fontSize: 14, lineHeight: 20 },
  section: { marginBottom: 25 },
  sectionLabel: { fontSize: 12, fontWeight: "900", color: "#64748B", marginBottom: 10, letterSpacing: 1 },
  codeContainer: { flexDirection: "row", backgroundColor: "#FFF", padding: 15, borderRadius: 16, alignItems: "center", justifyContent: "space-between", borderWidth: 2, borderColor: "#002D72", borderStyle: "dashed" },
  codeText: { fontSize: 20, fontWeight: "900", color: "#002D72", letterSpacing: 2 },
  copyBtn: { padding: 8, backgroundColor: "#F1F5F9", borderRadius: 8 },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 15, backgroundColor: "#FFF", padding: 12, borderRadius: 16 },
  stepIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#E8F4FD", justifyContent: "center", alignItems: "center", marginRight: 15 },
  stepTitle: { fontSize: 14, fontWeight: "800", color: "#1E293B" },
  stepDesc: { fontSize: 12, color: "#64748B" },
  mainShareBtn: { backgroundColor: "#002D72", paddingVertical: 18, borderRadius: 20, alignItems: "center", marginTop: 10 },
  mainShareText: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  toast: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 45, 114, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    zIndex: 999,
  },
  toastText: { color: '#FFF', fontWeight: '700', fontSize: 14 }
});