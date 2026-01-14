import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Camera,
  Check,
  ChevronRight,
  Clock,
  FileText,
  Smartphone,
  Upload,
  User
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

export default function Register({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Logic to calculate the 18+ threshold
  const today = new Date();
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  const [formData, setFormData] = useState({
    fullName: '', mobile: '',
    gender: '', dob: '', 
    flatNo: '', building: '', area: '',
    pincode: '', city: '', state: '',
    aadhaarFront: null as any, 
    aadhaarBack: null as any, 
    panCard: null as any, 
    selfie: null as any
  });

  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web') window.alert(`${title}: ${msg}`);
    else Alert.alert(title, msg);
  };

  // --- Automatic City Tracker ---
  const fetchAddressData = async (pin: string) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();
      if (data[0].Status === "Success") {
        const details = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: details.District,
          state: details.State
        }));
      } else {
        setFormData(prev => ({ ...prev, city: '', state: '' }));
      }
    } catch (error) {
      console.error("Pincode fetch error:", error);
    }
  };

  useEffect(() => {
    if (formData.pincode.length === 6) {
      fetchAddressData(formData.pincode);
    }
  }, [formData.pincode]);

  const handleDocumentPick = async (field: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
      });
      if (!result.canceled) {
        setFormData({ ...formData, [field]: result.assets[0] });
      }
    } catch (err) {
      showAlert("Error", "Failed to access files.");
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.fullName.trim()) return showAlert("Required", "Please enter your Full Name.");
      if (formData.mobile.length < 10) return showAlert("Required", "Please enter a valid 10-digit mobile number.");
      if (!formData.dob) return showAlert("Required", "Please select your Date of Birth.");
      if (!formData.gender) return showAlert("Required", "Please select your Gender.");
    } else if (step === 2) {
      if (!formData.flatNo || !formData.area || !formData.pincode) return showAlert("Required", "Please complete all address fields.");
      if (formData.pincode.length < 6) return showAlert("Error", "Pincode must be 6 digits.");
    } else if (step === 3) {
      if (!formData.aadhaarFront || !formData.aadhaarBack || !formData.panCard) {
        return showAlert("Missing Documents", "Please upload all required ID documents.");
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 4) setStep(step + 1);
      else {
        setIsLoading(true);
        setTimeout(() => { setIsLoading(false); setIsPending(true); }, 2000);
      }
    }
  };

  // --- UNIVERSAL DATE HANDLER ---
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    
    const date = selectedDate || (event.target ? new Date(event.target.value) : null);
    
    if (date) {
      // Final security check for age
      if (date > eighteenYearsAgo) {
        showAlert("Eligibility Error", "You must be at least 18 years old to register.");
        return;
      }
      setFormData({ ...formData, dob: date.toISOString().split('T')[0] });
    }
  };

  if (isPending) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: '#F0F9FF' }] as ViewStyle[]}>
        <View style={styles.pendingContainer}>
          <View style={styles.pendingIconBox}><Clock size={40} color="#0EA5E9" /></View>
          <Text style={styles.pendingTitle}>Nexus Verification</Text>
          <Text style={styles.pendingDesc}>
            Your application for <Text style={{fontWeight: 'bold', color: '#001F3F'}}>NexusBank Premium</Text> is being processed. 
            We will notify you once your KYC is verified.
          </Text>
        </View>
        <TouchableOpacity style={styles.finalBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.submitBtnText}>RETURN TO LOGIN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#001F3F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NEXUS REGISTRATION</Text>
          <View style={styles.progressBar}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.progressSegment, step >= i && styles.progressActive]} />
            ))}
          </View>
        </View>

        <View style={styles.formContainer}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {step === 1 && (
              <View style={styles.stepView}>
                <Text style={styles.stepTitle}>PERSONAL DETAILS</Text>
                <CustomInput 
                  label="FULL NAME (AS PER PAN) *" 
                  icon={User} 
                  value={formData.fullName} 
                  onChangeText={(t: string) => setFormData({...formData, fullName: t.replace(/[^a-zA-Z\s]/g, '')})} 
                  placeholder="John Doe"
                />
                <CustomInput 
                  label="MOBILE NUMBER *" 
                  icon={Smartphone} 
                  keyboardType="number-pad" 
                  maxLength={10} 
                  value={formData.mobile} 
                  onChangeText={(t: string) => setFormData({...formData, mobile: t.replace(/[^0-9]/g, '')})} 
                  placeholder="0000000000"
                />
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.inputLabel}>GENDER <Text style={{color: 'red'}}>*</Text></Text>
                    <TouchableOpacity style={styles.pickerSubstitute} onPress={() => setShowGenderModal(true)}>
                       <Text style={[styles.pickerText, !formData.gender && {color: '#94A3B8'}]}>{formData.gender || 'Select'}</Text>
                       <ChevronRight size={16} color="#0EA5E9" />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>DATE OF BIRTH <Text style={{color: 'red'}}>*</Text></Text>
                    
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={handleDateChange}
                        // Web maximum limit set to 18 years ago
                        max={eighteenYearsAgo.toISOString().split('T')[0]}
                        style={{
                          height: '56px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '16px',
                          border: '1.5px solid #F1F5F9',
                          padding: '0 16px',
                          color: '#001F3F',
                          fontSize: '14px',
                          fontWeight: '600',
                          outline: 'none',
                          width: '100%'
                        }}
                      />
                    ) : (
                      <TouchableOpacity style={styles.pickerSubstitute} onPress={() => { Keyboard.dismiss(); setShowDatePicker(true); }}>
                           <Text style={[styles.pickerText, !formData.dob && {color: '#94A3B8'}]}>{formData.dob || 'YYYY-MM-DD'}</Text>
                           <CalendarIcon size={16} color="#0EA5E9" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {Platform.OS !== 'web' && showDatePicker && (
                  <DateTimePicker
                    value={formData.dob ? new Date(formData.dob) : eighteenYearsAgo}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    // Mobile maximum limit set to 18 years ago
                    maximumDate={eighteenYearsAgo}
                    onChange={handleDateChange}
                  />
                )}
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepView}>
                <Text style={styles.stepTitle}>RESIDENTIAL ADDRESS</Text>
                <CustomInput label="FLAT / HOUSE NO *" value={formData.flatNo} onChangeText={(t: string) => setFormData({...formData, flatNo: t})} />
                <CustomInput label="AREA / LOCALITY *" value={formData.area} onChangeText={(t: string) => setFormData({...formData, area: t})} />
                <View style={styles.row}>
                  <CustomInput 
                    label="PINCODE *" 
                    maxLength={6} 
                    keyboardType="number-pad" 
                    value={formData.pincode} 
                    onChangeText={(t: string) => setFormData({...formData, pincode: t.replace(/[^0-9]/g, '')})} 
                    containerStyle={{ flex: 1, marginRight: 10 }} 
                  />
                  <View style={styles.autoField}>
                     <Text style={styles.inputLabel}>CITY / STATE</Text>
                     <Text style={styles.autoValue}>{formData.city ? `${formData.city}, ${formData.state}` : 'Waiting for Pincode...'}</Text>
                  </View>
                </View>
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepView}>
                <Text style={styles.stepTitle}>DOCUMENT UPLOAD</Text>
                <UploadItem label="Aadhaar Card (Front) *" file={formData.aadhaarFront} onPress={() => handleDocumentPick('aadhaarFront')} />
                <UploadItem label="Aadhaar Card (Back) *" file={formData.aadhaarBack} onPress={() => handleDocumentPick('aadhaarBack')} />
                <UploadItem label="PAN Card *" file={formData.panCard} onPress={() => handleDocumentPick('panCard')} />
              </View>
            )}

            {step === 4 && (
              <View style={styles.stepView}>
                <Text style={styles.stepTitle}>IDENTITY VERIFICATION</Text>
                <TouchableOpacity style={styles.selfieCircle} onPress={() => handleDocumentPick('selfie')}>
                   {formData.selfie ? <Check size={40} color="#10B981" /> : <Camera size={40} color="#0EA5E9" />}
                </TouchableOpacity>
                <Text style={styles.infoText}>Please upload a clear selfie for face recognition. *</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleNext} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>{step === 4 ? 'COMPLETE APPLICATION' : 'CONTINUE'}</Text>}
          </TouchableOpacity>
        </View>

        <Modal visible={showGenderModal} transparent animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowGenderModal(false)}>
            <View style={styles.selectionCard}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              {['Male', 'Female', 'Other'].map((item) => (
                <TouchableOpacity key={item} style={styles.selectionItem} onPress={() => { setFormData({...formData, gender: item}); setShowGenderModal(false); }}>
                  <Text style={styles.selectionText}>{item}</Text>
                  {formData.gender === item && <Check size={18} color="#0EA5E9" />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const CustomInput = ({ label, icon: Icon, containerStyle, ...props }: any) => (
  <View style={[styles.inputWrapper, containerStyle]}>
    <Text style={styles.inputLabel}>
      {label.includes('*') ? (
        <>
          {label.replace('*', '')}
          <Text style={{color: 'red'}}>*</Text>
        </>
      ) : label}
    </Text>
    <View style={styles.inputBox}>
      {Icon && <Icon size={18} color="#0EA5E9" style={styles.innerIcon} />}
      <TextInput style={styles.textInput} placeholderTextColor="#94A3B8" {...props} />
    </View>
  </View>
);

const UploadItem = ({ label, file, onPress }: any) => (
  <TouchableOpacity style={[styles.uploadCard, file && styles.uploadCardDone]} onPress={onPress}>
    <View style={styles.uploadLeft}>
      <View style={styles.fileIcon}><FileText size={18} color={file ? "#10B981" : "#0EA5E9"} /></View>
      <View>
        <Text style={styles.uploadLabel}>
          {label.includes('*') ? (
            <>
              {label.replace('*', '')}
              <Text style={{color: 'red'}}>*</Text>
            </>
          ) : label}
        </Text>
        {file && <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>}
      </View>
    </View>
    {file ? <Check size={20} color="#10B981" /> : <Upload size={18} color="#001F3F" />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F9FF' },
  mainContainer: { flex: 1 },
  header: { padding: 25, paddingTop: 40, backgroundColor: '#F0F9FF' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#001F3F', fontSize: 20, fontWeight: '900', marginTop: 10, letterSpacing: 1 },
  progressBar: { flexDirection: 'row', gap: 6, marginTop: 20 },
  progressSegment: { flex: 1, height: 6, borderRadius: 10, backgroundColor: '#E2E8F0' },
  progressActive: { backgroundColor: '#0EA5E9' },
  formContainer: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, marginTop: 10, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10 },
  scrollContent: { padding: 30, paddingBottom: 50 },
  stepView: { gap: 20 },
  stepTitle: { fontSize: 18, fontWeight: '900', color: '#001F3F', marginBottom: 5 },
  inputWrapper: { gap: 8 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  inputBox: { height: 56, backgroundColor: '#F8FAFC', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#F1F5F9' },
  innerIcon: { marginRight: 12 },
  textInput: { flex: 1, color: '#001F3F', fontWeight: '600', fontSize: 15 },
  row: { flexDirection: 'row' },
  autoField: { flex: 1, justifyContent: 'center', marginLeft: 10 },
  autoValue: { color: '#0EA5E9', fontWeight: '800', fontSize: 13, marginTop: 5 },
  pickerSubstitute: { height: 56, backgroundColor: '#F8FAFC', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#F1F5F9' },
  pickerText: { color: '#001F3F', fontWeight: '600', fontSize: 14 },
  uploadCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#F8FAFC', borderRadius: 18, borderWidth: 1, borderColor: '#F1F5F9' },
  uploadCardDone: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  uploadLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  fileIcon: { width: 40, height: 40, backgroundColor: '#FFF', borderRadius: 10, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  uploadLabel: { fontSize: 14, fontWeight: '700', color: '#001F3F' },
  fileName: { fontSize: 10, color: '#64748B', width: 150 },
  selfieCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#F0F9FF', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#0EA5E9' },
  infoText: { textAlign: 'center', color: '#64748B', fontSize: 12, fontWeight: '600', paddingHorizontal: 30 },
  footer: { padding: 25, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  submitBtn: { height: 60, backgroundColor: '#001F3F', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  finalBtn: { height: 60, backgroundColor: '#001F3F', borderRadius: 20, justifyContent: 'center', alignItems: 'center', margin: 30 },
  submitBtnText: { color: '#FFF', fontWeight: '800', letterSpacing: 1 },
  pendingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  pendingIconBox: { width: 100, height: 100, backgroundColor: '#E0F2FE', borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  pendingTitle: { color: '#001F3F', fontSize: 24, fontWeight: '900', marginBottom: 15 },
  pendingDesc: { color: '#64748B', textAlign: 'center', fontSize: 15, lineHeight: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,31,63,0.5)', justifyContent: 'flex-end' },
  selectionCard: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#001F3F', marginBottom: 20 },
  selectionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  selectionText: { fontSize: 16, fontWeight: '700', color: '#334155' }
});