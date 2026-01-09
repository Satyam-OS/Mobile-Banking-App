import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Camera,
  Check,
  ChevronRight,
  Clock,
  FileText,
  Smartphone,
  User,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Register({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', email: '', mobile: '',
    gender: '', dob: '', income: '',
    flatNo: '', building: '', area: '',
    pincode: '', city: '', state: '',
    aadhaarFront: null, aadhaarBack: null, panCard: null, selfie: null
  });

  const validateAge = (selectedDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - selectedDate.getFullYear();
    const m = today.getMonth() - selectedDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) age--;
    return age >= 18;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Correctly extract date for both Web and Native
    const date = selectedDate || (event.target ? new Date(event.target.value) : null);
    
    setShowDatePicker(Platform.OS === 'ios');

    if (date && !isNaN(date.getTime())) {
      if (!validateAge(date)) {
        Alert.alert("Age Restriction", "You must be at least 18 years old to register.");
        return;
      }
      const formattedDate = date.toISOString().split('T')[0];
      setFormData({ ...formData, dob: formattedDate });
    }
  };

  const addressLength = (formData.flatNo + formData.building + formData.area).length;

  const submitRegistration = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsPending(true);
    }, 2000);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.mobile || !formData.dob || !formData.gender) {
        Alert.alert("Missing Info", "Please fill all personal details.");
        return;
      }
    }
    if (step === 2 && addressLength < 15) {
      Alert.alert("Address Too Short", "Please provide a more detailed address (Min 15 characters).");
      return;
    }
    if (step < 4) setStep(step + 1);
    else submitRegistration();
  };

  if (isPending) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: '#F0F9FF' }]}>
        <View style={styles.pendingContainer}>
          <View style={styles.pendingIconBox}><Clock size={40} color="#0EA5E9" /></View>
          <Text style={styles.pendingTitle}>KYC Pending</Text>
          <Text style={styles.pendingDesc}>
            Your application has been submitted successfully.{"\n\n"}
            <Text style={{ fontWeight: '800', color: '#001F3F' }}>Our team will reach out to you for further process and document verification.</Text>
          </Text>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.submitBtnText}>GOT IT</Text>
          </TouchableOpacity>
        </View>
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
          <Text style={styles.headerTitle}>CREATE ACCOUNT</Text>
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
                <Text style={styles.stepTitle}>PERSONAL INFO</Text>
                <CustomInput label="FULL NAME (AS PER AADHAAR)" icon={User} value={formData.fullName} onChangeText={(t: string) => setFormData({...formData, fullName: t})} />
                <CustomInput label="MOBILE" icon={Smartphone} keyboardType="numeric" maxLength={10} value={formData.mobile} onChangeText={(t: string) => setFormData({...formData, mobile: t})} />
                
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.inputLabel}>GENDER</Text>
                    <TouchableOpacity style={styles.pickerSubstitute} onPress={() => setShowGenderModal(true)}>
                       <Text style={[styles.pickerText, !formData.gender && {color: '#94A3B8'}]}>{formData.gender || 'Select'}</Text>
                       <ChevronRight size={16} color="#0EA5E9" />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>DOB (YYYY-MM-DD)</Text>
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={handleDateChange}
                        max={new Date().toISOString().split("T")[0]}
                        style={{
                          height: '56px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '16px',
                          border: '1.5px solid #F1F5F9',
                          paddingLeft: '16px',
                          paddingRight: '16px',
                          color: '#001F3F',
                          fontSize: '15px',
                          fontWeight: '600',
                          width: '100%',
                          outline: 'none',
                          boxSizing: 'border-box',
                        } as any}
                      />
                    ) : (
                      <TouchableOpacity style={styles.pickerSubstitute} onPress={() => setShowDatePicker(true)}>
                         <Text style={[styles.pickerText, !formData.dob && {color: '#94A3B8'}]}>{formData.dob || 'Select Date'}</Text>
                         <CalendarIcon size={16} color="#0EA5E9" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {showDatePicker && Platform.OS !== 'web' && (
                  <DateTimePicker
                    value={formData.dob ? new Date(formData.dob) : new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
                <Text style={styles.helperText}></Text>
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepView}>
                <Text style={styles.stepTitle}>ADDRESS</Text>
                <CustomInput label="FLAT / HOUSE NO" value={formData.flatNo} onChangeText={(t: string) => setFormData({...formData, flatNo: t})} />
                <CustomInput label="BUILDING NAME" value={formData.building} onChangeText={(t: string) => setFormData({...formData, building: t})} />
                <CustomInput label="AREA / LOCALITY" value={formData.area} onChangeText={(t: string) => setFormData({...formData, area: t})} />
                <View style={styles.row}>
                  <CustomInput label="PINCODE" maxLength={6} keyboardType="numeric" value={formData.pincode} onChangeText={(t: string) => setFormData({...formData, pincode: t})} containerStyle={{ flex: 1, marginRight: 10 }} />
                  <View style={styles.autoField}>
                     <Text style={styles.inputLabel}>CITY</Text>
                     <Text style={styles.autoValue}>{formData.city || '---'}</Text>
                  </View>
                </View>
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepView}>
                <Text style={styles.stepTitle}>ID VERIFICATION</Text>
                <UploadItem label="Aadhaar Front" />
                <UploadItem label="Aadhaar Back" />
                <UploadItem label="PAN Card" />
              </View>
            )}

            {step === 4 && (
              <View style={styles.stepView}>
                <Text style={styles.stepTitle}>SELFIE</Text>
                <View style={styles.selfieCircle}><Camera size={40} color="#0EA5E9" /></View>
                <Text style={styles.infoText}>Position your face clearly inside the frame.</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleNext} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>{step === 4 ? 'SUBMIT APPLICATION' : 'CONTINUE'}</Text>}
          </TouchableOpacity>
        </View>

        <Modal visible={showGenderModal} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowGenderModal(false)}>
            <View style={styles.selectionCard}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              {['Male', 'Female', 'Other'].map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={styles.selectionItem} 
                  onPress={() => { setFormData({...formData, gender: item}); setShowGenderModal(false); }}
                >
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
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputBox}>
      {Icon && <Icon size={18} color="#0EA5E9" style={styles.innerIcon} />}
      <TextInput style={styles.textInput} placeholderTextColor="#94A3B8" {...props} />
    </View>
  </View>
);

const UploadItem = ({ label }: any) => (
  <TouchableOpacity style={styles.uploadCard}>
    <View style={styles.uploadLeft}>
      <View style={styles.fileIcon}><FileText size={18} color="#0EA5E9" /></View>
      <Text style={styles.uploadLabel}>{label}</Text>
    </View>
    <View style={styles.cameraCircle}><Camera size={16} color="#FFF" /></View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F9FF' },
  mainContainer: { flex: 1 },
  header: { padding: 25, paddingTop: 40, backgroundColor: '#F0F9FF' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#001F3F', fontSize: 20, fontWeight: '900', marginTop: 10 },
  progressBar: { flexDirection: 'row', gap: 6, marginTop: 20 },
  progressSegment: { flex: 1, height: 5, borderRadius: 10, backgroundColor: '#E2E8F0' },
  progressActive: { backgroundColor: '#0EA5E9' },
  formContainer: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, marginTop: 10, elevation: 5 },
  scrollContent: { padding: 30, paddingBottom: 50 },
  stepView: { gap: 20 },
  stepTitle: { fontSize: 18, fontWeight: '900', color: '#001F3F', marginBottom: 5 },
  inputWrapper: { gap: 8 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  inputBox: { height: 56, backgroundColor: '#F8FAFC', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#F1F5F9' },
  innerIcon: { marginRight: 12 },
  textInput: { flex: 1, color: '#001F3F', fontWeight: '600', fontSize: 15 },
  row: { flexDirection: 'row' },
  autoField: { flex: 1, justifyContent: 'center' },
  autoValue: { color: '#001F3F', fontWeight: '800', fontSize: 15 },
  pickerSubstitute: { height: 56, backgroundColor: '#F8FAFC', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#F1F5F9' },
  pickerText: { color: '#001F3F', fontWeight: '600', fontSize: 15 },
  helperText: { fontSize: 10, color: '#0EA5E9', fontWeight: '700', marginTop: -10 },
  uploadCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#F0F9FF', borderRadius: 18, borderWidth: 1, borderColor: '#E0F2FE' },
  uploadLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fileIcon: { width: 38, height: 38, backgroundColor: '#FFF', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  uploadLabel: { fontSize: 14, fontWeight: '700', color: '#001F3F' },
  cameraCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#001F3F', justifyContent: 'center', alignItems: 'center' },
  selfieCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#F0F9FF', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#0EA5E9' },
  infoText: { textAlign: 'center', color: '#64748B', fontSize: 12, fontWeight: '600', paddingHorizontal: 30 },
  footer: { padding: 25, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  submitBtn: { height: 60, backgroundColor: '#001F3F', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  submitBtnText: { color: '#FFF', fontWeight: '800', letterSpacing: 1 },
  pendingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  pendingIconBox: { width: 90, height: 90, backgroundColor: '#E0F2FE', borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  pendingTitle: { color: '#001F3F', fontSize: 26, fontWeight: '900', marginBottom: 15 },
  pendingDesc: { color: '#64748B', textAlign: 'center', fontSize: 15, lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,31,63,0.4)', justifyContent: 'flex-end' },
  selectionCard: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#001F3F', marginBottom: 20 },
  selectionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  selectionText: { fontSize: 16, fontWeight: '700', color: '#334155' }
});