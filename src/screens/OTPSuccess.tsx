import { ShieldCheck, XCircle } from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function OTPSuccess({ route, navigation }: any) {
  const { status } = route.params;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'SUCCESS') {
        // 👉 After OTP success → go to KYC flow
        navigation.replace('KYCOnboarding');
      } else {
        // ❌ Wrong OTP → back to explore
        navigation.replace('GuestExplore');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.card}>
        {status === 'SUCCESS' ? (
          <>
            <ShieldCheck size={64} color="#16A34A" />
            <Text style={styles.title}>OTP Verified</Text>
            <Text style={styles.subtitle}>
              Verification successful.{'\n'}Redirecting to KYC…
            </Text>
          </>
        ) : (
          <>
            <XCircle size={64} color="#DC2626" />
            <Text style={styles.title}>Invalid OTP</Text>
            <Text style={styles.subtitle}>
              The code you entered is incorrect.{'\n'}Returning to explore.
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 20,
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    color: '#64748B',
    lineHeight: 22,
  },
});
