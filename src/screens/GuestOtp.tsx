import { ArrowRight } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const API_BASE_URL = 'https://unhastened-monopolistically-shirlee.ngrok-free.dev';

export default function GuestOtp({ navigation, route }: any) {
  const { mobile } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
  if (otp.length !== 6) return;

  try {
    const res = await fetch(`${API_BASE_URL}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: mobile, otp }),
    });

    if (!res.ok) throw new Error();

    // ✅ DO NOT go back to GuestExplore
    navigation.replace('OTPSuccess', {
      status: 'SUCCESS',
    });

  } catch {
    navigation.replace('OTPSuccess', {
      status: 'FAILED',
    });
  }
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={{ padding: 24 }}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>OTP sent to +91 {mobile}</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter 6-digit OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={verifyOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.btnText}>Verify</Text>
              <ArrowRight size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#002D72',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 30,
    color: '#64748B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    marginBottom: 30,
  },
  btn: {
    height: 56,
    backgroundColor: '#002D72',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  btnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
  },
});
