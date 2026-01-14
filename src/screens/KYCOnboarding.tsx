import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  CreditCard,
  FileCheck,
  FileText,
  Mail,
  MapPin,
  Shield,
  Upload,
  User
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
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
} from 'react-native';

const { width } = Dimensions.get('window');

const steps = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Address', icon: MapPin },
  { id: 3, title: 'Docs', icon: FileText },
  { id: 4, title: 'Video', icon: Camera },
];

export default function KYCOnboarding({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(1);
  const today = new Date();
  
  // Calculate the date 18 years ago from today to restrict the picker
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    dob: '',
    dobDate: eighteenYearsAgo, // Default to 18 years ago
    gender: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    panNumber: '',
    aadharNumber: '',
    accountType: '',
    panDoc: null as any,
    aadharFrontDoc: null as any,
    aadharBackDoc: null as any,
  });

  const [showGender, setShowGender] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleDocumentPick = async (field: 'panDoc' | 'aadharFrontDoc' | 'aadharBackDoc') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFormData({ ...formData, [field]: result.assets[0] });
      }
    } catch (err) {
      showAlert('Error', 'Failed to pick document');
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.fullName.trim()) return showAlert('Mandatory Field', 'Full Name is required');
      if (/\d/.test(formData.fullName)) return showAlert('Invalid Name', 'Name cannot contain numbers');
      
      if (!formData.email.trim()) return showAlert('Mandatory Field', 'Email Address is required');
      if (!/^\S+@\S+\.com$/.test(formData.email.toLowerCase())) {
        return showAlert('Invalid format', 'Enter a valid email ID ending in .com');
      }
      
      if (!formData.dob) return showAlert('Mandatory Field', 'Date of Birth is required');
      
      const birthDate = formData.dobDate;
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      
      if (age < 18) return showAlert('Age Restriction', 'You must be at least 18 years old to proceed.');
      if (!formData.gender) return showAlert('Mandatory Field', 'Gender selection is required');
    }

    if (currentStep === 2) {
      if (!formData.addressLine1.trim() || formData.addressLine1.trim().length < 15) 
        return showAlert('Invalid Address', 'Detailed address must be at least 15 characters long');
      if (!formData.city.trim()) return showAlert('Mandatory Field', 'City is required (enter valid pincode)');
      if (!/^\d{6}$/.test(formData.pincode)) return showAlert('Invalid pincode', 'Enter 6-digit pincode');
    }

    if (currentStep === 3) {
      if (!formData.panDoc) return showAlert('Missing Document', 'Please upload your PAN Card');
      if (!formData.aadharFrontDoc) return showAlert('Missing Document', 'Please upload Aadhar Front');
      if (!formData.aadharBackDoc) return showAlert('Missing Document', 'Please upload Aadhar Back');
      if (!formData.accountType) return showAlert('Mandatory Field', 'Please select an Account Type');
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep() === true) {
      if (currentStep < 4) setCurrentStep(currentStep + 1);
      else navigation.replace('KYCSuccess');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else navigation.goBack();
  };

  const renderProgress = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressCard}>
        <View style={styles.stepsWrapper}>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <View style={styles.stepItem}>
                <View style={[styles.stepIconCircle, currentStep >= step.id ? styles.stepIconActive : styles.stepIconInactive]}>
                  {currentStep > step.id ? <Check size={18} color="#FFF" strokeWidth={3} /> : <step.icon size={18} color={currentStep >= step.id ? '#FFF' : '#94A3B8'} />}
                </View>
                <Text style={[styles.stepTitle, currentStep >= step.id ? styles.stepTitleActive : styles.stepTitleInactive]}>{step.title}</Text>
              </View>
              {index < steps.length - 1 && <View style={[styles.stepLine, currentStep > step.id ? styles.stepLineActive : styles.stepLineInactive]} />}
            </React.Fragment>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.formContent}>
            <Text style={styles.inputLabel}>Full Name (as per PAN) <Text style={{color: 'red'}}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <User size={20} color="#0EA5E9" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Enter full name" 
                value={formData.fullName} 
                onChangeText={(val) => setFormData({ ...formData, fullName: val.replace(/[0-9]/g, '') })} 
              />
            </View>
            <Text style={styles.inputLabel}>Email Address <Text style={{color: 'red'}}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#0EA5E9" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="email@nexus.com" 
                keyboardType="email-address" 
                autoCapitalize="none" 
                value={formData.email} 
                onChangeText={(val) => setFormData({ ...formData, email: val })} 
              />
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>DOB <Text style={{color: 'red'}}>*</Text></Text>
                {Platform.OS === 'web' ? (
                  <View style={[styles.inputWrapper, { position: 'relative' }]}>
                    <Calendar size={18} color="#0EA5E9" style={[styles.inputIcon, { zIndex: 1 }]} />
                    <input
                      type="date"
                      max={eighteenYearsAgo.toISOString().split('T')[0]}
                      value={formData.dobDate.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const d = new Date(e.target.value);
                        if (!isNaN(d.getTime())) {
                          setFormData({ ...formData, dob: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`, dobDate: d });
                        }
                      }}
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '15px', color: '#0F172A', width: '100%', cursor: 'pointer' }}
                    />
                  </View>
                ) : (
                  <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowDatePicker(true)}>
                    <Calendar size={18} color="#0EA5E9" style={styles.inputIcon} />
                    <Text style={{ color: formData.dob ? '#0F172A' : '#94A3B8' }}>{formData.dob || 'DD/MM/YYYY'}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.inputLabel}>Gender <Text style={{color: 'red'}}>*</Text></Text>
                <TouchableOpacity style={[styles.inputWrapper, { paddingLeft: 15 }]} onPress={() => setShowGender(true)}>
                  <Text style={{ color: formData.gender ? '#0F172A' : '#94A3B8', flex: 1 }}>{formData.gender || 'Select'}</Text>
                  <ChevronDown size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.formContent}>
            <Text style={styles.inputLabel}>Detailed Address (Min 15 chars) <Text style={{color: 'red'}}>*</Text></Text>
            <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start' }]}>
              <TextInput style={[styles.input, { height: '100%', textAlignVertical: 'top', paddingTop: 12 }]} multiline placeholder="House / Street / Area" value={formData.addressLine1} onChangeText={(val) => setFormData({ ...formData, addressLine1: val })} />
            </View>
            <Text style={styles.inputLabel}>Pincode <Text style={{color: 'red'}}>*</Text></Text>
            <View style={styles.inputWrapper}><TextInput style={styles.input} keyboardType="number-pad" maxLength={6} placeholder="6-digit pincode" value={formData.pincode} onChangeText={(val) => setFormData({ ...formData, pincode: val.replace(/[^0-9]/g, '') })} /></View>
            
            <View style={styles.autoResultBox}>
                <View style={{flex: 1}}>
                    <Text style={styles.inputLabel}>City</Text>
                    <Text style={styles.autoText}>{formData.city || 'Enter Pincode...'}</Text>
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.inputLabel}>State</Text>
                    <Text style={styles.autoText}>{formData.state || 'Enter Pincode...'}</Text>
                </View>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.formContent}>
            {[
              { label: 'PAN Card', key: 'panDoc', icon: CreditCard },
              { label: 'Aadhar Front', key: 'aadharFrontDoc', icon: FileText },
              { label: 'Aadhar Back', key: 'aadharBackDoc', icon: FileText },
            ].map((doc) => (
              <TouchableOpacity key={doc.key} style={[styles.uploadCard, formData[doc.key as keyof typeof formData] && styles.uploadCardDone]} onPress={() => handleDocumentPick(doc.key as any)}>
                <View style={[styles.uploadIconBox, { backgroundColor: '#E0F2FE' }]}>
                  {formData[doc.key as keyof typeof formData] ? <FileCheck size={24} color="#10B981" /> : <doc.icon size={24} color="#0EA5E9" />}
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.uploadTitle}>{doc.label} <Text style={{color: 'red'}}>*</Text></Text>
                  <Text style={styles.uploadSubtitle} numberOfLines={1}>
                    {formData[doc.key as keyof typeof formData] ? (formData[doc.key as keyof typeof formData] as any).name : 'Click to upload image/PDF'}
                  </Text>
                </View>
                <Upload size={20} color={formData[doc.key as keyof typeof formData] ? "#10B981" : "#3B82F6"} />
              </TouchableOpacity>
            ))}

            <View style={styles.typeSelector}>
              <Text style={styles.inputLabel}>Account Type <Text style={{color: 'red'}}>*</Text></Text>
              <View style={styles.row}>
                {['Savings', 'Current'].map((type) => (
                  <TouchableOpacity key={type} onPress={() => setFormData({ ...formData, accountType: type.toLowerCase() })} style={[styles.typeBtn, formData.accountType === type.toLowerCase() && styles.typeBtnActive]}>
                    <Building2 size={20} color={formData.accountType === type.toLowerCase() ? '#002D72' : '#94A3B8'} />
                    <Text style={[styles.typeBtnText, formData.accountType === type.toLowerCase() && styles.typeBtnTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      case 4:
        return (
          <View style={[styles.formContent, { alignItems: 'center' }]}>
            <View style={styles.videoCircle}><Camera size={40} color="#0EA5E9" /></View>
            <Text style={styles.videoTitle}>Video KYC Verification</Text>
            <Text style={styles.videoDesc}>Complete a quick live video call to activate features instantly.</Text>
          </View>
        );
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0EA5E9" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}><ArrowLeft size={24} color="#FFF" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Open New Account</Text>
        <Text style={styles.headerSubtitle}>Complete KYC Verification</Text>
      </View>

      {renderProgress()}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>{currentStep === 4 ? 'Start Video KYC' : 'Continue'}</Text>
          <ArrowRight size={20} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.secureTag}><Shield size={14} color="#94A3B8" /><Text style={styles.secureText}>YOUR DATA IS SECURE & ENCRYPTED</Text></View>
      </View>

      <Modal transparent visible={showGender} animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            {['Male', 'Female', 'Other'].map((g) => (
              <TouchableOpacity key={g} style={styles.genderOption} onPress={() => { setFormData({ ...formData, gender: g }); setShowGender(false); }}>
                <Text style={{ fontWeight: '700', color: '#0F172A' }}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {showDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker 
          mode="date" 
          value={formData.dobDate || eighteenYearsAgo} 
          display="spinner" 
          maximumDate={eighteenYearsAgo} // Native restriction to only 18+
          onChange={(e: any, date: any) => {
            setShowDatePicker(false);
            if (date) {
              setFormData({ ...formData, dob: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`, dobDate: date });
            }
          }} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F9FF' },
  header: { backgroundColor: '#0EA5E9', paddingTop: 20, paddingBottom: 45, paddingHorizontal: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  backBtn: { marginBottom: 15 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  progressContainer: { paddingHorizontal: 20, marginTop: -25 },
  progressCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  stepsWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepItem: { alignItems: 'center', width: 60 },
  stepIconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  stepIconActive: { backgroundColor: '#0EA5E9' },
  stepIconInactive: { backgroundColor: '#F1F5F9' },
  stepTitle: { fontSize: 10, fontWeight: '700' },
  stepTitleActive: { color: '#0EA5E9' },
  stepTitleInactive: { color: '#94A3B8' },
  stepLine: { flex: 1, height: 2, marginBottom: 18, marginHorizontal: -10 },
  stepLineActive: { backgroundColor: '#0EA5E9' },
  stepLineInactive: { backgroundColor: '#F1F5F9' },
  scroll: { flex: 1 },
  formContent: { padding: 24 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8, marginTop: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#0F172A', fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center' },
  autoResultBox: { flexDirection: 'row', gap: 15, marginTop: 10, padding: 10, backgroundColor: '#E0F2FE', borderRadius: 12 },
  autoText: { fontSize: 14, fontWeight: '800', color: '#0EA5E9' },
  uploadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderStyle: 'dashed', borderColor: '#3B82F6', borderRadius: 16, padding: 16, marginTop: 12 },
  uploadCardDone: { borderColor: '#10B981', borderStyle: 'solid', backgroundColor: '#F0FDF4' },
  uploadIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  uploadTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  uploadSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  typeSelector: { marginTop: 20 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, height: 50, marginHorizontal: 5, gap: 8 },
  typeBtnActive: { borderColor: '#002D72', backgroundColor: '#F0F7FF', borderWidth: 2 },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  typeBtnTextActive: { color: '#002D72' },
  videoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  videoTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 20 },
  videoDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  primaryBtn: { height: 56, backgroundColor: '#002D72', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  secureTag: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15, gap: 6 },
  secureText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: 40 },
  genderOption: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
});