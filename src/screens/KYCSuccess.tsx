import { ArrowRight, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function KYCSuccess({ navigation }: any) {
  // NOTE FOR API INTEGRATION:
  // You can fetch application details here and replace the static strings 
  // below with dynamic data like {apiData.estimatedTime} or {apiData.statusMessage}

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0EA5E9" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.whiteCircle}>
            <ShieldCheck size={50} color="#0EA5E9" strokeWidth={2.5} />
          </View>

          <Text style={styles.successTitle}>KYC Submitted</Text>

          <Text style={styles.successSubtitle}>
            Thanks! Your documents have been received.{'\n'}
            Our team is reviewing them.
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.detailsWrapper}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What happens next?</Text>

            <Text style={styles.infoText}>
              • Verification usually takes 24–48 hours.{'\n\n'}
              • If anything is missing, we’ll contact you.{'\n\n'}
              • Once approved, your account will be created and details will be sent to your email.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Main CTA */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryBtn}
          activeOpacity={0.8}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.primaryBtnText}>Back to Login</Text>
          <ArrowRight size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  container: { 
    flex: 1 
  },

  successHeader: {
    backgroundColor: '#0EA5E9', // Sky blue theme
    paddingTop: 60,
    paddingBottom: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  whiteCircle: {
    width: 90,
    height: 90,
    backgroundColor: '#FFF',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 10,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 20,
  },
  successSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 8,
  },

  detailsWrapper: { 
    paddingHorizontal: 20, 
    marginTop: -30 // Overlaps the header slightly for a modern look
  },
  card: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 22,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },

  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  primaryBtn: {
    height: 60,
    backgroundColor: '#002D72', // Professional dark blue
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryBtnText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});