import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft, Copy, Gift, Share2, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, SafeAreaView, ScrollView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";

/**
 * Generates a deterministic 4-character alphanumeric referral code from a user identifier.
 * Same input always produces the same code — no backend needed.
 * Format: 2 letters + 2 digits (e.g. "KX47")
 */
function generateReferralCode(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O to avoid confusion
  const digits  = "0123456789";
  const c1 = letters[(abs)        % letters.length];
  const c2 = letters[(abs >> 4)   % letters.length];
  const d1 = digits [(abs >> 8)   % digits.length];
  const d2 = digits [(abs >> 12)  % digits.length];
  return `${c1}${c2}${d1}${d2}`;
}

export default function ReferEarn({ navigation }: any) {
  const [referralCode, setReferralCode] = useState("");
  const [userName, setUserName]         = useState("");
  const [loading, setLoading]           = useState(true);
  const [copied, setCopied]             = useState(false);

  useEffect(() => {
    (async () => {
      const mobile     = await AsyncStorage.getItem("user_mobile") || "";
      const name       = await AsyncStorage.getItem("user_name")   || "User";
      const cachedRaw  = await AsyncStorage.getItem("user_data");
      const cached     = cachedRaw ? JSON.parse(cachedRaw) : null;
      // Use customerId if available for a more stable seed, else mobile
      const seed = cached?.customerId || mobile;
      setReferralCode(generateReferralCode(seed));
      setUserName(name);
      setLoading(false);
    })();
  }, []);

  const handleCopy = () => {
    // Clipboard API — works on web; on native use expo-clipboard if available
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referralCode);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert("Copied!", `Referral code ${referralCode} copied to clipboard.`);
  };

  const handleShare = () => {
    Alert.alert(
      "Share Your Code",
      `Share your referral code ${referralCode} with friends!\nThey get ₹250 on signup, you earn ₹500 when they complete their first transaction.`
    );
  };

  const steps = [
    { icon: Share2, title: "Share your code",    desc: "Send your unique code to friends & family" },
    { icon: Users,  title: "Friend signs up",     desc: "They register using your referral code" },
    { icon: Gift,   title: "Both of you earn",    desc: "You get ₹500, they get ₹250 — instantly" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#002D72" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.giftIconBox}>
            <Gift size={40} color="#FBBF24" />
          </View>
          <Text style={styles.heroTitle}>Invite friends,{"\n"}earn ₹500 each!</Text>
          <Text style={styles.heroSub}>
            Share your unique code. When a friend joins NexusBank and completes
            their first transfer, you both get rewarded.
          </Text>
        </View>

        {/* Referral Code Card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>YOUR UNIQUE REFERRAL CODE</Text>
          {loading ? (
            <ActivityIndicator color="#0EA5E9" style={{ marginVertical: 16 }} />
          ) : (
            <View style={styles.codeRow}>
              {referralCode.split("").map((char, i) => (
                <View key={i} style={styles.codeBox}>
                  <Text style={styles.codeChar}>{char}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.codeHint}>
            Unique to {userName} · Expires never
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.copyBtn]}
              onPress={handleCopy}
            >
              <Copy size={18} color={copied ? "#10B981" : "#0EA5E9"} />
              <Text style={[styles.actionBtnText, copied && { color: "#10B981" }]}>
                {copied ? "Copied!" : "Copy Code"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.shareBtn]}
              onPress={handleShare}
            >
              <Share2 size={18} color="#FFF" />
              <Text style={[styles.actionBtnText, { color: "#FFF" }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reward summary */}
        <View style={styles.rewardRow}>
          <View style={styles.rewardChip}>
            <Text style={styles.rewardAmount}>₹500</Text>
            <Text style={styles.rewardLabel}>You earn</Text>
          </View>
          <View style={styles.rewardDivider} />
          <View style={styles.rewardChip}>
            <Text style={styles.rewardAmount}>₹500</Text>
            <Text style={styles.rewardLabel}>Friend earns</Text>
          </View>
        </View>

        {/* How it works */}
        <Text style={styles.sectionTitle}>HOW IT WORKS</Text>
        {steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <View style={styles.stepIconBox}>
              <step.icon size={20} color="#0EA5E9" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}

        {/* T&C */}
        <Text style={styles.tnc}>
          *Reward credited within 24 hours of friend's first successful transfer.
          Maximum 20 referrals per user. NexusBank reserves the right to modify
          or cancel the referral program at any time.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#002D72" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    backgroundColor: "#002D72",
  },
  backBtn: { padding: 4 },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "900" },

  scroll: {
    backgroundColor: "#F0F9FF",
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 20, paddingTop: 28, paddingBottom: 60,
  },

  heroCard: {
    backgroundColor: "#002D72", borderRadius: 28, padding: 28,
    alignItems: "center", marginBottom: 20,
  },
  giftIconBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(251,191,36,0.15)",
    justifyContent: "center", alignItems: "center", marginBottom: 16,
  },
  heroTitle: {
    color: "#FFF", fontSize: 26, fontWeight: "900",
    textAlign: "center", lineHeight: 34, marginBottom: 10,
  },
  heroSub: {
    color: "rgba(255,255,255,0.65)", fontSize: 14,
    textAlign: "center", lineHeight: 22,
  },

  codeCard: {
    backgroundColor: "#FFF", borderRadius: 28, padding: 24,
    alignItems: "center", marginBottom: 16,
    elevation: 4, shadowColor: "#0EA5E9", shadowOpacity: 0.1, shadowRadius: 12,
  },
  codeLabel: {
    fontSize: 10, fontWeight: "900", color: "#94A3B8",
    letterSpacing: 1.5, marginBottom: 16,
  },
  codeRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  codeBox: {
    width: 58, height: 66, borderRadius: 16,
    backgroundColor: "#F0F9FF", borderWidth: 2, borderColor: "#BAE6FD",
    justifyContent: "center", alignItems: "center",
  },
  codeChar: { fontSize: 28, fontWeight: "900", color: "#002D72" },
  codeHint: { fontSize: 12, color: "#94A3B8", fontWeight: "600", marginBottom: 20 },

  actionRow: { flexDirection: "row", gap: 12, width: "100%" },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 50, borderRadius: 16,
  },
  copyBtn: { backgroundColor: "#F0F9FF", borderWidth: 1.5, borderColor: "#BAE6FD" },
  shareBtn: { backgroundColor: "#0EA5E9" },
  actionBtnText: { fontSize: 14, fontWeight: "800", color: "#0EA5E9" },

  rewardRow: {
    flexDirection: "row", backgroundColor: "#FFF", borderRadius: 24,
    padding: 20, marginBottom: 28, alignItems: "center",
  },
  rewardChip: { flex: 1, alignItems: "center" },
  rewardAmount: { fontSize: 26, fontWeight: "900", color: "#002D72" },
  rewardLabel: { fontSize: 12, color: "#94A3B8", fontWeight: "700", marginTop: 4 },
  rewardDivider: { width: 1, height: 40, backgroundColor: "#E2E8F0" },

  sectionTitle: {
    fontSize: 11, fontWeight: "900", color: "#94A3B8",
    letterSpacing: 1.5, marginBottom: 16,
  },
  stepRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF", borderRadius: 20, padding: 16,
    marginBottom: 12, gap: 14,
  },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#002D72", justifyContent: "center", alignItems: "center",
  },
  stepNumText: { color: "#FFF", fontSize: 13, fontWeight: "900" },
  stepIconBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "#F0F9FF", justifyContent: "center", alignItems: "center",
  },
  stepTitle: { fontSize: 14, fontWeight: "800", color: "#1E293B" },
  stepDesc: { fontSize: 12, color: "#94A3B8", marginTop: 2 },

  tnc: {
    fontSize: 11, color: "#94A3B8", lineHeight: 18,
    textAlign: "center", paddingHorizontal: 10, marginTop: 8,
  },
});
