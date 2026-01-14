import {
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  ShieldCheck,
  Smartphone
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Login = ({ navigation }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
  });

  const handleMobileChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setFormData({ ...formData, mobile: cleaned });
    }
  };

  const handleSubmit = async () => {
    if (formData.mobile.length !== 10) {
      Alert.alert("Invalid Entry", "Please enter a valid 10-digit mobile number.");
      return;
    }
    if (formData.password.length < 4) {
      Alert.alert("Invalid Entry", "Password must be at least 4 characters.");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let targetScreen = 'Dashboard';
      if (formData.mobile.includes("999")) {
        targetScreen = 'AdminDashboard'; 
      }

      navigation.replace(targetScreen);
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic Status Bar - Dark theme for navy background */}
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          bounces={false} 
          showsVerticalScrollIndicator={false}
        >
          
          <View style={styles.brandingSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoInner}>
                <Text style={styles.logoText}>NB</Text>
              </View>
            </View>
            <Text style={styles.brandName}>NexusBank</Text>
            <View style={styles.brandBadge}>
              <Text style={styles.brandSub}>PREMIUM DIGITAL BANKING</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.welcomeTitle}>Sign In</Text>
              <Text style={styles.welcomeSub}>Access your account securely</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <Smartphone size={20} color="#38BDF8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="00000 00000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  value={formData.mobile}
                  onChangeText={handleMobileChange}
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#38BDF8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.forgotRow}>
              <TouchableOpacity 
                style={styles.checkboxArea} 
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.checkboxLabel}>Remember Me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && { backgroundColor: '#334155' }]} 
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>LOGIN TO ACCOUNT</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.bioButton} 
                onPress={() => Alert.alert("Biometric", "Initializing scanner...")}
              >
                <Fingerprint size={28} color="#38BDF8" />
              </TouchableOpacity>
            </View>

            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>
                  Don't have an account? <Text style={styles.boldBlue}>Sign Up</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.guestButton}
                onPress={() => navigation.navigate('GuestExplore')}
              >
                <Text style={styles.guestTextLabel}>New user? </Text>
                <View style={styles.exploreBadge}>
                  <Text style={styles.exploreText}>EXPLORE AS GUEST</Text>
                  <ArrowRight size={14} color="#38BDF8" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.encryptionBadge}>
              <ShieldCheck size={14} color="#38BDF8" />
              <Text style={styles.encryptionText}>END-TO-END ENCRYPTED</Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001F3F' }, // Primary Navy Background
  brandingSection: {
    height: 220,
    backgroundColor: '#001F3F', // Matches Navy Header
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 85,
    height: 85,
    backgroundColor: '#FFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#38BDF8',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    marginBottom: 15,
  },
  logoInner: {
    width: 60,
    height: 60,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { color: '#38BDF8', fontSize: 24, fontWeight: '900' }, // Accent Blue
  brandName: { color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  brandBadge: {
    marginTop: 8,
    backgroundColor: '#0EA5E9', // Professional Blue Badge
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  brandSub: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  
  formContainer: {
    flex: 1,
    backgroundColor: '#F0F9FF', // Lighter Sky Blue Background
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
    elevation: 25,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  headerTextGroup: { marginBottom: 35 },
  welcomeTitle: { fontSize: 30, fontWeight: '900', color: '#001F3F' },
  welcomeSub: { fontSize: 16, color: '#64748B', marginTop: 4, fontWeight: '500' },
  
  inputGroup: { marginBottom: 22 },
  label: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 10, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 64,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#0F172A', fontWeight: '600' },
  
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  checkboxArea: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { 
    width: 22, 
    height: 22, 
    borderRadius: 7, 
    borderWidth: 2, 
    borderColor: '#CBD5E1', 
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: { backgroundColor: '#38BDF8', borderColor: '#38BDF8' },
  checkboxInner: { width: 10, height: 10, backgroundColor: '#FFF', borderRadius: 2 },
  checkboxLabel: { fontSize: 14, color: '#475569', fontWeight: '600' },
  forgotText: { fontSize: 14, color: '#38BDF8', fontWeight: '700' },
  
  buttonRow: { flexDirection: 'row', gap: 14, marginBottom: 40 },
  loginButton: {
    flex: 1,
    backgroundColor: '#001F3F', // Primary Navy Button
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  bioButton: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  footerLinks: { alignItems: 'center', gap: 18 },
  registerText: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  boldBlue: { color: '#38BDF8', fontWeight: '800' }, // Accent Blue Links
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 20,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guestTextLabel: { color: '#64748B', fontWeight: '600' },
  exploreBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exploreText: { color: '#001F3F', fontWeight: '800', fontSize: 13 },
  
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 45,
    opacity: 0.7
  },
  encryptionText: { fontSize: 11, color: '#94A3B8', fontWeight: '800', letterSpacing: 1 },
});

export default Login;