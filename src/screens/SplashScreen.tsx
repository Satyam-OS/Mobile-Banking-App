import { Shield } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Professional entrance animation for the logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      })
    ]).start();

    // After 3 seconds, navigate to the Login page
    const timer = setTimeout(() => {
      navigation.replace('Login'); 
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Maintains the lighter sky blue theme */}
      <StatusBar barStyle="dark-content" backgroundColor="#F0F9FF" />
      
      <Animated.View style={[
        styles.logoContainer, 
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}>
        {/* Your Banking Logo */}
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
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF', // Lighter Sky Blue
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconBox: {
    width: 120,
    height: 120,
    backgroundColor: '#FFF',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    marginBottom: 20,
  },
  brandName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 8,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 2,
  },
  
});