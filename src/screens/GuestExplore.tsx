import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Phone,
  Sparkles,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const BASE_URL = 'https://unhastened-monopolistically-shirlee.ngrok-free.dev';

export default function GuestExplore({ navigation }: any) {
  const [showModal, setShowModal] = useState(false);
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (mobile.length !== 10) {
      Alert.alert('Invalid Number', 'Enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile }),
      });

      if (!res.ok) throw new Error();

      setShowModal(false);

      // ✅ CORRECT NAVIGATION
      navigation.navigate('GuestOtp', { mobile });

    } catch {
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <ArrowLeft size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInText}>SIGN IN</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tagLine}>
              <Sparkles size={12} color="#7DD3FC" />
              <Text style={styles.tagLineText}>NEXUS INSTITUTIONAL BANKING</Text>
            </View>

            <Text style={styles.title}>
              Modern Wealth{'\n'}
              <Text style={{ color: '#38BDF8' }}>Management</Text>
            </Text>

            <Text style={styles.description}>
              Secure your financial future with our digital ecosystem.
            </Text>
          </View>

          {/* CTA */}
          <View style={styles.content}>
            <View style={styles.ctaCard}>
              <View style={styles.ctaIconBox}>
                <Building2 size={24} color="#001F3F" />
              </View>
              <View style={styles.ctaInfo}>
                <Text style={styles.ctaTitle}>Open Premium Account</Text>
                <Text style={styles.ctaSubtitle}>ZERO BALANCE • INSTANT KYC</Text>
              </View>
              <TouchableOpacity
                style={styles.ctaArrowBtn}
                onPress={() => setShowModal(true)}
              >
                <ArrowRight size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.fixedFooter}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.primaryBtnText}>CREATE FREE ACCOUNT</Text>
          </TouchableOpacity>
        </View>

        {/* OTP MODAL */}
        <Modal transparent animationType="slide" visible={showModal}>
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <Phone size={28} color="#001F3F" />
              <Text style={styles.modalTitle}>Enter Mobile Number</Text>

              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                keyboardType="number-pad"
                maxLength={10}
                value={mobile}
                onChangeText={(t) => setMobile(t.replace(/[^0-9]/g, ''))}
              />

              <TouchableOpacity
                style={styles.modalBtn}
                onPress={sendOtp}
                disabled={loading}
              >
                <Text style={styles.modalBtnText}>
                  {loading ? 'SENDING...' : 'SEND OTP'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#001F3F' },
  container: { flex: 1, backgroundColor: '#F0F9FF' },

  header: { backgroundColor: '#001F3F', padding: 24, paddingBottom: 60 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between' },
  signInText: { color: '#38BDF8', fontWeight: '900' },

  tagLine: { flexDirection: 'row', gap: 6, marginVertical: 10 },
  tagLineText: { color: '#7DD3FC', fontSize: 10, fontWeight: '900' },

  title: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  description: { color: '#CBD5E1', marginTop: 10 },

  content: { padding: 20 },
  ctaCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaIconBox: { backgroundColor: '#E0F2FE', padding: 12, borderRadius: 12 },
  ctaInfo: { flex: 1, marginLeft: 16 },
  ctaTitle: { fontWeight: '900' },
  ctaSubtitle: { fontSize: 10, color: '#64748B' },
  ctaArrowBtn: { backgroundColor: '#001F3F', padding: 14, borderRadius: 20 },

  fixedFooter: { padding: 20, backgroundColor: '#FFF' },
  primaryBtn: {
    backgroundColor: '#001F3F',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFF', fontWeight: '900' },

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#FFF',
    margin: 24,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 16, fontWeight: '900', marginVertical: 12 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  modalBtn: {
    backgroundColor: '#001F3F',
    padding: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnText: { color: '#FFF', fontWeight: '900' },
  modalCancel: { marginTop: 12, color: '#64748B' },
});
