import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
} from "lucide-react-native";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function KYCSuccess({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0EA5E9" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.whiteCircle}>
            <ShieldCheck size={50} color="#0EA5E9" strokeWidth={2.5} />
          </View>

          <Text style={styles.successTitle}>Application Received</Text>
          <Text style={styles.successSubtitle}>
            Reference ID: <Text style={styles.idHighlight}>NEX-8829-KYC</Text>
          </Text>
        </View>

        {/* Status Tracker */}
        <View style={styles.detailsWrapper}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Next Steps</Text>

            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineIconActive}>
                  <CheckCircle2 size={18} color="#10B981" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Documents Submitted</Text>
                  <Text style={styles.timelineDesc}>
                    We have received your Aadhar and PAN details securely.
                  </Text>
                </View>
              </View>

              <View style={styles.timelineLine} />

              <View style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <Clock size={18} color="#0EA5E9" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Institutional Review</Text>
                  <Text style={styles.timelineDesc}>
                    Our compliance team is verifying your information (24–48h).
                  </Text>
                </View>
              </View>

              <View style={styles.timelineLineInactive} />

              <View style={styles.timelineItem}>
                <View style={styles.timelineIconInactive}>
                  <Mail size={18} color="#94A3B8" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitleInactive}>
                    Account Activation
                  </Text>
                  <Text style={styles.timelineDesc}>
                    Welcome kit and login credentials will be sent to your
                    email.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.helpBox}>
            <Text style={styles.helpText}>
              Need help? Contact our priority desk at{" "}
              <Text style={styles.supportLink}>support@nexus.com</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Main CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.9}
          onPress={() => navigation.replace("Login")}
        >
          <Text style={styles.primaryBtnText}>RETURN TO LOGIN</Text>
          <ArrowRight size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F9FF",
  },
  container: {
    flex: 1,
  },
  successHeader: {
    backgroundColor: "#0EA5E9",
    paddingTop: 60,
    paddingBottom: 80,
    alignItems: "center",
    paddingHorizontal: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  whiteCircle: {
    width: 100,
    height: 100,
    backgroundColor: "#FFF",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#001F3F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 12,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFF",
    marginTop: 24,
    letterSpacing: -0.5,
  },
  successSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  idHighlight: {
    color: "#FFF",
    fontWeight: "900",
  },
  detailsWrapper: {
    paddingHorizontal: 25,
    marginTop: -40,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 28,
    borderRadius: 30,
    shadowColor: "#001F3F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#001F3F",
    marginBottom: 25,
    letterSpacing: 0.5,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 15,
  },
  timelineIconActive: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  timelineIconInactive: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 25,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#001F3F",
  },
  timelineTitleInactive: {
    fontSize: 15,
    fontWeight: "700",
    color: "#94A3B8",
  },
  timelineDesc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 18,
    fontWeight: "500",
  },
  timelineLine: {
    width: 2,
    height: 25,
    backgroundColor: "#10B981",
    marginLeft: 17,
    marginTop: -25,
    marginBottom: 0,
  },
  timelineLineInactive: {
    width: 2,
    height: 25,
    backgroundColor: "#E2E8F0",
    marginLeft: 17,
    marginTop: -25,
    marginBottom: 0,
  },
  helpBox: {
    marginTop: 25,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  helpText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 18,
  },
  supportLink: {
    color: "#0EA5E9",
    fontWeight: "800",
  },
  footer: {
    padding: 25,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  primaryBtn: {
    height: 64,
    backgroundColor: "#001F3F",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#001F3F",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
