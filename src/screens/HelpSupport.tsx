import {
    ArrowLeft,
    Ban,
    ChevronRight,
    CreditCard,
    FileText,
    Mail,
    MessageCircle,
    Phone,
    Search,
    ShieldQuestion,
} from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HelpSupport({ navigation }: any) {
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
        <Text style={styles.headerTitle}>HELP & SUPPORT</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Bar Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Search size={20} color="#94A3B8" />
            <TextInput
              placeholder="How can we help you?"
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Quick Help Tiles */}
        <View style={styles.tileRow}>
          <TouchableOpacity style={styles.helpTile}>
            <View style={[styles.tileIcon, { backgroundColor: "#FEE2E2" }]}>
              <Ban size={22} color="#EF4444" />
            </View>
            <Text style={styles.tileLabel}>Block Card</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpTile}>
            <View style={[styles.tileIcon, { backgroundColor: "#E0F2FE" }]}>
              <ShieldQuestion size={22} color="#0EA5E9" />
            </View>
            <Text style={styles.tileLabel}>Dispute</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpTile}>
            <View style={[styles.tileIcon, { backgroundColor: "#DCFCE7" }]}>
              <CreditCard size={22} color="#10B981" />
            </View>
            <Text style={styles.tileLabel}>Card Issues</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TOP FREQUENT QUESTIONS</Text>
          <FAQItem title="How do I change my transaction limit?" />
          <FAQItem title="How to reset my transaction PIN?" />
          <FAQItem title="When will I get my refund?" />
          <FAQItem title="How to update my KYC details?" />
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GET IN TOUCH</Text>
          <ContactCard
            icon={Phone}
            title="Call Support"
            detail="Available 24/7"
          />
          <ContactCard
            icon={Mail}
            title="Email Us"
            detail="support@nexusbank.com"
          />
          <ContactCard
            icon={FileText}
            title="Submit a Ticket"
            detail="Track status in real-time"
          />
        </View>

        {/* Chat Support Button */}
        <TouchableOpacity style={styles.chatBtn}>
          <MessageCircle size={22} color="#FFF" />
          <Text style={styles.chatBtnText}>START LIVE CHAT</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Components
const FAQItem = ({ title }: { title: string }) => (
  <TouchableOpacity style={styles.faqCard}>
    <Text style={styles.faqTitle}>{title}</Text>
    <ChevronRight size={18} color="#CBD5E1" />
  </TouchableOpacity>
);

const ContactCard = ({ icon: Icon, title, detail }: any) => (
  <TouchableOpacity style={styles.contactCard}>
    <View style={styles.contactIconBox}>
      <Icon size={20} color="#0EA5E9" />
    </View>
    <View style={styles.contactText}>
      <Text style={styles.contactTitle}>{title}</Text>
      <Text style={styles.contactDetail}>{detail}</Text>
    </View>
    <ChevronRight size={18} color="#CBD5E1" />
  </TouchableOpacity>
);

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
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },

  searchSection: { padding: 20 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#001F3F",
  },

  tileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  helpTile: {
    width: "31%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  tileIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  tileLabel: { fontSize: 10, fontWeight: "800", color: "#001F3F" },

  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748B",
    marginBottom: 15,
    letterSpacing: 1.5,
  },

  faqCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  faqTitle: { fontSize: 13, fontWeight: "700", color: "#001F3F" },

  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  contactIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  contactText: { flex: 1 },
  contactTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#001F3F",
    marginBottom: 2,
  },
  contactDetail: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },

  chatBtn: {
    margin: 20,
    backgroundColor: "#0EA5E9",
    height: 60,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  chatBtnText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 14,
    marginLeft: 10,
    letterSpacing: 1,
  },
});
