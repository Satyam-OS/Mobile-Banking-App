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
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// API CONFIGURATION - Ready for your production URL
// const API_BASE_URL = 'https://your-api-domain.com/api'; 

export default function Login({ navigation }: any) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // FORM STATE - Ready for JSON body
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

  // API READY: Submit Function
  const handleSubmit = async () => {
    // 1. Frontend Validation
    if (formData.mobile.length !== 10) {
      Alert.alert("Invalid Entry", "Please enter a valid 10-digit mobile number.");
      return;
    }
    if (formData.password.length < 4) {
      Alert.alert("Invalid Entry", "Password must be at least 4 characters.");
      return;
    }

    setIsLoading(true);

    // 2. BACKEND API INTEGRATION
    try {
      /* // REAL API IMPLEMENTATION:
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({
          mobile: formData.mobile,
          password: formData.password,
          rememberMe: rememberMe
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Invalid credentials");
      }

      // API READY: Store the Token for authenticated requests
      // await AsyncStorage.setItem('userToken', result.token);
      // await AsyncStorage.setItem('userRole', result.role);
      
      navigation.replace(result.role === 'admin' ? 'AdminDashboard' : 'Dashboard');
      */

      // SIMULATION LOGIC (Simulating backend latency)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let targetScreen = 'Dashboard';
      
      // Role-based navigation based on mobile patterns
     
      if (formData.mobile.includes("999")) {
        //  AdminDashboard for now as requested
        targetScreen = 'AdminDashboard'; 
     
     
        // } else if (formData.mobile.includes("888")) {
      //   // Skipping EmployeeDashboard for now as requested
      //   targetScreen = 'Dashboard';
      }

      navigation.replace(targetScreen);

    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
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
                <Smartphone size={20} color="#0EA5E9" style={styles.inputIcon} />
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
                <Lock size={20} color="#0EA5E9" style={styles.inputIcon} />
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
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
                <Text style={styles.checkboxLabel}>Remember Me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && { backgroundColor: '#1E293B' }]} 
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
                <Fingerprint size={28} color="#001F3F" />
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
                  <ArrowRight size={14} color="#0EA5E9" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.encryptionBadge}>
              <ShieldCheck size={14} color="#0EA5E9" />
              <Text style={styles.encryptionText}>END-TO-END ENCRYPTED</Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F9FF' },
  brandingSection: {
    height: 220,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#FFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 15,
  },
  logoInner: {
    width: 55,
    height: 55,
    backgroundColor: '#001F3F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { color: '#BAE6FD', fontSize: 22, fontWeight: '900' },
  brandName: { color: '#001F3F', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  brandBadge: {
    marginTop: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  brandSub: { color: '#0EA5E9', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  
  formContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 28,
    paddingTop: 35,
    paddingBottom: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  headerTextGroup: { marginBottom: 30 },
  welcomeTitle: { fontSize: 28, fontWeight: '900', color: '#001F3F' },
  welcomeSub: { fontSize: 15, color: '#64748B', marginTop: 4, fontWeight: '500' },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 60,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#001F3F', fontWeight: '600' },
  
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxArea: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E1', marginRight: 10 },
  checkboxChecked: { backgroundColor: '#0EA5E9', borderColor: '#0EA5E9' },
  checkboxLabel: { fontSize: 14, color: '#475569', fontWeight: '600' },
  forgotText: { fontSize: 14, color: '#0EA5E9', fontWeight: '700' },
  
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 35 },
  loginButton: {
    flex: 1,
    backgroundColor: '#001F3F',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  loginButtonText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  bioButton: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  footerLinks: { alignItems: 'center', gap: 15 },
  registerText: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  boldBlue: { color: '#0EA5E9', fontWeight: '800' },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  guestTextLabel: { color: '#64748B', fontWeight: '600' },
  exploreBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  exploreText: { color: '#001F3F', fontWeight: '800', fontSize: 12 },
  
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 40,
    opacity: 0.6
  },
  encryptionText: { fontSize: 10, color: '#64748B', fontWeight: '800', letterSpacing: 1 },
});