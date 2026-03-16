import React, { useState, useEffect } from "react";
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  SafeAreaView, StatusBar, Platform, ActivityIndicator, ScrollView
} from "react-native";
import { ArrowLeft, Smartphone, KeyRound, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, XCircle } from "lucide-react-native";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ phone: "", otp: "", password: "", confirmPassword: "" });
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleNext = () => {
    setStatusMessage(null);
    if (step === 1 && formData.phone.length !== 10) {
      setStatusMessage({ type: "error", text: "Security Alert: Please enter a valid 10-digit phone number." });
      return;
    }
    if (step === 2 && formData.otp.length < 6) {
      setStatusMessage({ type: "error", text: "Invalid Input: Please enter the valid 6-digit OTP." });
      return;
    }
    if (step === 3) {
      if (formData.password.length < 6) {
        setStatusMessage({ type: "error", text: "Weak Password: Password must be at least 6 characters." });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setStatusMessage({ type: "error", text: "Mismatch: The passwords provided do not match." });
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (step < 4) setStep(step + 1);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#002D72" />
          </TouchableOpacity>
          <Text style={styles.stepHeader}>Step {step < 4 ? step : 3} of 3</Text>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {step < 4 ? (
            <>
              <View style={styles.iconCircle}>
                {step === 1 ? <Smartphone size={32} color="#002D72" /> : step === 2 ? <KeyRound size={32} color="#002D72" /> : <Lock size={32} color="#002D72" />}
              </View>
              <Text style={styles.title}>{step === 1 ? "Reset Password" : step === 2 ? "Verify OTP" : "New Password"}</Text>
              
              {statusMessage && (
                <View style={[styles.statusBanner, statusMessage.type === "error" ? styles.errorBanner : styles.successBanner]}>
                  {statusMessage.type === "error" ? <AlertCircle size={18} color="#EF4444" /> : <CheckCircle2 size={18} color="#10B981" />}
                  <Text style={[styles.statusText, statusMessage.type === "error" ? styles.errorText : styles.successText]}>{statusMessage.text}</Text>
                </View>
              )}

              {step === 1 && (
                <>
                  <Text style={styles.label}>Phone Number <Text style={{color: '#EF4444'}}>*</Text></Text>
                  <TextInput style={styles.input} keyboardType="number-pad" placeholder="0000000000" value={formData.phone} onChangeText={(v) => setFormData({...formData, phone: v.replace(/[^0-9]/g, '')})} maxLength={10} />
                </>
              )}

              {step === 2 && (
                <>
                  <Text style={styles.label}>Verification Code <Text style={{color: '#EF4444'}}>*</Text></Text>
                  <TextInput style={[styles.input, {textAlign: 'center', letterSpacing: 8}]} keyboardType="number-pad" placeholder="000000" value={formData.otp} onChangeText={(v) => setFormData({...formData, otp: v})} maxLength={6} />
                </>
              )}

              {step === 3 && (
                <>
                  <Text style={styles.label}>New Password <Text style={{color: '#EF4444'}}>*</Text></Text>
                  <View style={styles.passContainer}>
                    <TextInput style={styles.textInput} secureTextEntry={!showPassword} placeholder="Enter new password" value={formData.password} onChangeText={(v) => setFormData({...formData, password: v})} />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                       {showPassword ? <EyeOff size={20} color="#64748B" /> : <Eye size={20} color="#64748B" />}
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.label}>Confirm Password <Text style={{color: '#EF4444'}}>*</Text></Text>
                  <TextInput style={styles.input} secureTextEntry={!showPassword} placeholder="Confirm your password" value={formData.confirmPassword} onChangeText={(v) => setFormData({...formData, confirmPassword: v})} />
                </>
              )}

              <TouchableOpacity style={styles.btn} onPress={handleNext} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>{step === 3 ? "RESET PASSWORD" : "CONTINUE"}</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successCard}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={48} color="#059669" />
              </View>
              <Text style={styles.title}>Password Updated!</Text>
              <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.btnText}>BACK TO LOGIN</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F4FD" },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 15 },
  backBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", elevation: 3 },
  stepHeader: { fontSize: 13, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  body: { padding: 20 },
  iconCircle: { width: 75, height: 75, borderRadius: 25, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 25, elevation: 4 },
  successCard: { marginTop: 40, alignItems: 'center', backgroundColor: '#FFF', padding: 40, borderRadius: 24, elevation: 2 },
  successIconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#D1FAE5", justifyContent: "center", alignItems: "center", marginBottom: 25 },
  title: { fontSize: 26, fontWeight: "900", color: "#002D72", textAlign: "center", marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "800", color: "#002D72", marginBottom: 10, marginLeft: 4 },
  input: { backgroundColor: "#FFF", height: 58, paddingHorizontal: 20, borderRadius: 18, fontSize: 16, borderWidth: 1.5, borderColor: "#E2E8F0", marginBottom: 20, color: "#002D72", fontWeight: '500' },
  passContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 20, height: 58 },
  textInput: { flex: 1, paddingHorizontal: 20, fontSize: 16, color: "#002D72" },
  eyeBtn: { paddingHorizontal: 15 },
  btn: { backgroundColor: "#002D72", height: 58, borderRadius: 18, justifyContent: "center", alignItems: "center", marginTop: 15, width: '100%' },
  btnText: { color: "#FFF", fontWeight: "900", fontSize: 16, letterSpacing: 0.5 },
  statusBanner: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, marginBottom: 20, gap: 12, borderWidth: 1 },
  successBanner: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  errorBanner: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  statusText: { fontSize: 13, fontWeight: "700", flex: 1 },
  successText: { color: "#166534" },
  errorText: { color: "#991B1B" }
});