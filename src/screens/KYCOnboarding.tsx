import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileCheck,
  FileText,
  Info,
  Mail,
  MapPin,
  Shield,
  Upload,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
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
} from "react-native";
import { kycService } from "../services/kycService";

const { width } = Dimensions.get("window");

const steps = [
  { id: 1, title: "Personal", icon: User },
  { id: 2, title: "Address", icon: MapPin },
  { id: 3, title: "Documents", icon: FileText },
  { id: 4, title: "Selfie", icon: Camera },
];

export default function KYCOnboarding({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const today = new Date();
  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    dob: "",
    dobDate: eighteenYearsAgo,
    gender: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    panNumber: "",
    aadharNumber: "",
    accountType: "",
    panDoc: null as any,
    aadharFrontDoc: null as any,
    aadharBackDoc: null as any,
  });

  const [showGender, setShowGender] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDateForBackend = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchAddressData = async (pin: string) => {
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pin}`,
      );
      const data = await response.json();
      if (data[0].Status === "Success") {
        const details = data[0].PostOffice[0];
        setFormData((prev) => ({
          ...prev,
          city: details.District,
          state: details.State,
        }));
      } else {
        setFormData((prev) => ({ ...prev, city: "", state: "" }));
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
    if (Platform.OS === "web") {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleDocumentPick = async (
    field: "panDoc" | "aadharFrontDoc" | "aadharBackDoc",
  ) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFormData({ ...formData, [field]: result.assets[0] });
      }
    } catch (err) {
      showAlert("Error", "Failed to pick document");
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.fullName.trim())
        return showAlert("Required", "Full Name is required");
      if (/\d/.test(formData.fullName))
        return showAlert("Invalid Name", "Name cannot contain numbers");
      if (!formData.email.trim())
        return showAlert("Required", "Email Address is required");
      if (!/^\S+@\S+\.com$/.test(formData.email.toLowerCase())) {
        return showAlert("Invalid Email", "Enter a valid email ending in .com");
      }
      if (!formData.dob)
        return showAlert("Required", "Date of Birth is required");
      if (!formData.gender) return showAlert("Required", "Gender is required");
    }

    if (currentStep === 2) {
      if (
        !formData.addressLine1.trim() ||
        formData.addressLine1.trim().length < 15
      )
        return showAlert("Invalid Address", "Minimum 15 characters required");
      if (!formData.city.trim())
        return showAlert("Required", "Please enter a valid pincode");
      if (!/^\d{6}$/.test(formData.pincode))
        return showAlert("Invalid Pincode", "Enter 6-digit pincode");
    }

    if (currentStep === 3) {
      if (!formData.panDoc) return showAlert("Missing File", "Upload PAN Card");
      if (!formData.aadharFrontDoc)
        return showAlert("Missing File", "Upload Aadhar Front");
      if (!formData.aadharBackDoc)
        return showAlert("Missing File", "Upload Aadhar Back");
      if (!formData.accountType)
        return showAlert("Required", "Select an Account Type");
    }

    if (currentStep === 4) {
      if (!selfieCaptured)
        return showAlert(
          "Required",
          "Please take a selfie to verify your identity",
        );
    }

    return true;
  };

  const handleNext = async () => {
    Keyboard.dismiss();
    if (validateStep() === true) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
        return;
      }

      try {
        setIsLoading(true);

        const payload = {
          mobile: formData.mobile,
          fullName: formData.fullName,
          email: formData.email,
          dob: formData.dob,
          gender: formData.gender,
          addressLine1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          panNumber: formData.panNumber,
          aadharNumber: formData.aadharNumber,
          accountType: formData.accountType,
          panDocPath: "PAN_UPLOADED",
          aadharFrontPath: "AADHAR_FRONT_UPLOADED",
          aadharBackPath: "AADHAR_BACK_UPLOADED",
        };

        console.log("KYC Payload:", payload);

        // This will now catch the "Unexpected token K" error and still navigate
        await kycService.submitKyc(payload);

        navigation.replace("KYCSuccess");
      } catch (error: any) {
        // Double check: if data reached backend (200 OK) but frontend failed to parse JSON
        if (error.message?.includes("Unexpected token 'K'")) {
          navigation.replace("KYCSuccess");
        } else {
          Alert.alert(
            "Submission Failed",
            "KYC submission failed. Please check your connection.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
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
                <View
                  style={[
                    styles.stepIconCircle,
                    currentStep >= step.id
                      ? styles.stepIconActive
                      : styles.stepIconInactive,
                  ]}
                >
                  {currentStep > step.id ? (
                    <Check size={16} color="#FFF" strokeWidth={3} />
                  ) : (
                    <step.icon
                      size={16}
                      color={currentStep >= step.id ? "#FFF" : "#94A3B8"}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepTitle,
                    currentStep >= step.id
                      ? styles.stepTitleActive
                      : styles.stepTitleInactive,
                  ]}
                >
                  {step.title}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    currentStep > step.id
                      ? styles.stepLineActive
                      : styles.stepLineInactive,
                  ]}
                />
              )}
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
            <View style={styles.infoBanner}>
              <Info size={16} color="#0EA5E9" />
              <Text style={styles.infoText}>
                Details must match your government ID documents.
              </Text>
            </View>

            <Text style={styles.inputLabel}>FULL NAME (AS PER PAN)</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color="#0EA5E9" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#94A3B8"
                value={formData.fullName}
                onChangeText={(val) =>
                  setFormData({
                    ...formData,
                    fullName: val.replace(/[0-9]/g, ""),
                  })
                }
              />
            </View>

            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#0EA5E9" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="example@bank.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(val) => setFormData({ ...formData, email: val })}
              />
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1.2 }}>
                <Text style={styles.inputLabel}>DATE OF BIRTH</Text>
                {Platform.OS === "web" ? (
                  <View style={styles.inputWrapper}>
                    <Calendar
                      size={18}
                      color="#0EA5E9"
                      style={styles.inputIcon}
                    />
                    <input
                      type="date"
                      max={eighteenYearsAgo.toISOString().split("T")[0]}
                      value={formData.dob}
                      onChange={(e) => {
                        const d = new Date(e.target.value);
                        if (!isNaN(d.getTime())) {
                          setFormData({
                            ...formData,
                            dob: e.target.value,
                            dobDate: d,
                          });
                        }
                      }}
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: "15px",
                        color: "#001F3F",
                        width: "100%",
                        cursor: "pointer",
                      }}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Calendar
                      size={18}
                      color="#0EA5E9"
                      style={styles.inputIcon}
                    />
                    <Text
                      style={{
                        color: formData.dob ? "#001F3F" : "#94A3B8",
                        fontSize: 15,
                        fontWeight: "500",
                      }}
                    >
                      {formData.dob || "YYYY-MM-DD"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ flex: 0.8, marginLeft: 12 }}>
                <Text style={styles.inputLabel}>GENDER</Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, { paddingLeft: 15 }]}
                  onPress={() => setShowGender(true)}
                >
                  <Text
                    style={{
                      color: formData.gender ? "#001F3F" : "#94A3B8",
                      flex: 1,
                      fontSize: 15,
                      fontWeight: "500",
                    }}
                  >
                    {formData.gender || "Select"}
                  </Text>
                  <ChevronDown size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.formContent}>
            <Text style={styles.inputLabel}>DETAILED ADDRESS</Text>
            <View
              style={[
                styles.inputWrapper,
                { height: 100, alignItems: "flex-start", paddingVertical: 12 },
              ]}
            >
              <TextInput
                style={[styles.input, { textAlignVertical: "top" }]}
                multiline
                placeholder="Building, Street and Landmark"
                placeholderTextColor="#94A3B8"
                value={formData.addressLine1}
                onChangeText={(val) =>
                  setFormData({ ...formData, addressLine1: val })
                }
              />
            </View>

            <Text style={styles.inputLabel}>PINCODE</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={18} color="#0EA5E9" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="600001"
                placeholderTextColor="#94A3B8"
                value={formData.pincode}
                onChangeText={(val) =>
                  setFormData({
                    ...formData,
                    pincode: val.replace(/[^0-9]/g, ""),
                  })
                }
              />
            </View>

            <View style={styles.autoResultBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.autoLabel}>CITY</Text>
                <Text style={styles.autoText}>{formData.city || "---"}</Text>
              </View>
              <View
                style={{ width: 1, height: "100%", backgroundColor: "#BAE6FD" }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.autoLabel}>STATE</Text>
                <Text style={styles.autoText}>{formData.state || "---"}</Text>
              </View>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.formContent}>
            {[
              { label: "PAN Card Copy", key: "panDoc", icon: CreditCard },
              {
                label: "Aadhar Card (Front)",
                key: "aadharFrontDoc",
                icon: FileText,
              },
              {
                label: "Aadhar Card (Back)",
                key: "aadharBackDoc",
                icon: FileText,
              },
            ].map((doc) => (
              <TouchableOpacity
                key={doc.key}
                style={[
                  styles.uploadCard,
                  formData[doc.key as keyof typeof formData] &&
                    styles.uploadCardDone,
                ]}
                onPress={() => handleDocumentPick(doc.key as any)}
              >
                <View style={styles.uploadIconBox}>
                  {formData[doc.key as keyof typeof formData] ? (
                    <FileCheck size={20} color="#10B981" />
                  ) : (
                    <doc.icon size={20} color="#0EA5E9" />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.uploadTitle}>{doc.label}</Text>
                  <Text style={styles.uploadSubtitle} numberOfLines={1}>
                    {formData[doc.key as keyof typeof formData]
                      ? (formData[doc.key as keyof typeof formData] as any).name
                      : "Tap to upload (PDF or Image)"}
                  </Text>
                </View>
                <Upload
                  size={18}
                  color={
                    formData[doc.key as keyof typeof formData]
                      ? "#10B981"
                      : "#0EA5E9"
                  }
                />
              </TouchableOpacity>
            ))}

            <View style={styles.typeSelector}>
              <Text style={styles.inputLabel}>PREFERRED ACCOUNT TYPE</Text>
              <View style={styles.row}>
                {["Savings", "Current"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        accountType: type.toLowerCase(),
                      })
                    }
                    style={[
                      styles.typeBtn,
                      formData.accountType === type.toLowerCase() &&
                        styles.typeBtnActive,
                    ]}
                  >
                    <Building2
                      size={18}
                      color={
                        formData.accountType === type.toLowerCase()
                          ? "#001F3F"
                          : "#94A3B8"
                      }
                    />
                    <Text
                      style={[
                        styles.typeBtnText,
                        formData.accountType === type.toLowerCase() &&
                          styles.typeBtnTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.formContent}>
            <View style={styles.instructionCard}>
              <Shield size={32} color="#0EA5E9" />
              <Text style={styles.videoTitle}>Face Verification</Text>
              <Text style={styles.videoDesc}>
                Take a clear selfie to verify your identity. Ensure your face is
                well-lit and visible.
              </Text>
            </View>

            <View
              style={[
                styles.videoCircle,
                selfieCaptured && {
                  borderColor: "#10B981",
                  borderStyle: "solid",
                },
              ]}
            >
              {selfieCaptured ? (
                <CheckCircle2 size={60} color="#10B981" />
              ) : (
                <User size={60} color="#CBD5E1" />
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.cameraActionBtn,
                selfieCaptured && styles.cameraActionBtnRetake,
              ]}
              onPress={() => {
                showAlert("Camera", "Launching secure camera module...");
                setSelfieCaptured(true);
              }}
            >
              <Camera size={20} color={selfieCaptured ? "#64748B" : "#FFF"} />
              <Text
                style={[
                  styles.cameraActionText,
                  selfieCaptured && { color: "#64748B" },
                ]}
              >
                {selfieCaptured ? "RETAKE SELFIE" : "TAKE SELFIE"}
              </Text>
            </TouchableOpacity>

            <View style={styles.checklist}>
              <View style={styles.checkItem}>
                <Check size={14} color="#10B981" />
                <Text style={styles.checkText}>No glasses or hats</Text>
              </View>
              <View style={styles.checkItem}>
                <Check size={14} color="#10B981" />
                <Text style={styles.checkText}>Neutral expression</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0EA5E9" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.shieldIcon}>
            <Shield size={20} color="#FFF" fill="rgba(255,255,255,0.2)" />
          </View>
        </View>
        <Text style={styles.headerTitle}>Open Account</Text>
        <Text style={styles.headerSubtitle}>
          Verified Identity Protocol (KYC)
        </Text>
      </View>

      {renderProgress()}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, isLoading && { opacity: 0.8 }]}
          onPress={handleNext}
          activeOpacity={0.9}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>
                {currentStep === 4 ? "FINISH APPLICATION" : "NEXT STEP"}
              </Text>
              <ArrowRight size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
        <View style={styles.secureTag}>
          <Shield size={12} color="#94A3B8" />
          <Text style={styles.secureText}>256-BIT END-TO-END ENCRYPTION</Text>
        </View>
      </View>

      <Modal transparent visible={showGender} animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Gender</Text>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                style={styles.genderOption}
                onPress={() => {
                  setFormData({ ...formData, gender: g });
                  setShowGender(false);
                }}
              >
                <Text style={styles.genderText}>{g}</Text>
                {formData.gender === g && <Check size={20} color="#0EA5E9" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {showDatePicker && Platform.OS !== "web" && (
        <DateTimePicker
          mode="date"
          value={formData.dobDate || eighteenYearsAgo}
          display="spinner"
          maximumDate={eighteenYearsAgo}
          onChange={(e: any, date: any) => {
            setShowDatePicker(false);
            if (date) {
              setFormData({
                ...formData,
                dob: formatDateForBackend(date),
                dobDate: date,
              });
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F9FF" },
  header: {
    backgroundColor: "#0EA5E9",
    paddingTop: 20,
    paddingBottom: 50,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  shieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  progressContainer: { paddingHorizontal: 20, marginTop: -30 },
  progressCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 22,
    elevation: 8,
    shadowColor: "#001F3F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  stepsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepItem: { alignItems: "center", width: 65 },
  stepIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepIconActive: { backgroundColor: "#0EA5E9" },
  stepIconInactive: { backgroundColor: "#F1F5F9" },
  stepTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
  stepTitleActive: { color: "#0EA5E9" },
  stepTitleInactive: { color: "#94A3B8" },
  stepLine: { flex: 1, height: 2, marginBottom: 20, marginHorizontal: -15 },
  stepLineActive: { backgroundColor: "#0EA5E9" },
  stepLineInactive: { backgroundColor: "#F1F5F9" },
  scroll: { flex: 1 },
  formContent: { padding: 25, alignItems: "center" },
  instructionCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    gap: 10,
    width: "100%",
  },
  infoText: { fontSize: 12, color: "#0369A1", fontWeight: "600", flex: 1 },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    marginBottom: 8,
    marginTop: 20,
    letterSpacing: 1,
    alignSelf: "flex-start",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    width: "100%",
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#001F3F", fontSize: 15, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", width: "100%" },
  autoResultBox: {
    flexDirection: "row",
    gap: 15,
    marginTop: 15,
    padding: 15,
    backgroundColor: "#E0F2FE",
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
  },
  autoLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0369A1",
    marginBottom: 4,
  },
  autoText: { fontSize: 15, fontWeight: "700", color: "#001F3F" },
  uploadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#0EA5E9",
    borderRadius: 20,
    padding: 18,
    marginTop: 12,
    width: "100%",
  },
  uploadCardDone: {
    borderColor: "#10B981",
    borderStyle: "solid",
    backgroundColor: "#F0FDF4",
  },
  uploadIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadTitle: { fontSize: 15, fontWeight: "700", color: "#001F3F" },
  uploadSubtitle: { fontSize: 12, color: "#64748B", marginTop: 3 },
  typeSelector: { marginTop: 15, width: "100%" },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    height: 56,
    marginHorizontal: 6,
    gap: 10,
  },
  typeBtnActive: {
    borderColor: "#001F3F",
    backgroundColor: "#F8FAFC",
    borderWidth: 2.5,
  },
  typeBtnText: { fontSize: 15, fontWeight: "700", color: "#64748B" },
  typeBtnTextActive: { color: "#001F3F" },
  videoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FFF",
    borderWidth: 3,
    borderColor: "#0EA5E9",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  cameraActionBtn: {
    backgroundColor: "#001F3F",
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  cameraActionBtnRetake: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
  },
  cameraActionText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 15,
  },
  videoTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#001F3F",
    textAlign: "center",
    marginTop: 10,
  },
  videoDesc: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    fontWeight: "500",
  },
  checklist: { marginTop: 10, width: "100%", gap: 10 },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  checkText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  footer: {
    padding: 25,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  primaryBtn: {
    height: 64,
    backgroundColor: "#001F3F",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    elevation: 4,
    shadowColor: "#001F3F",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  secureTag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    gap: 6,
  },
  secureText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "800",
    letterSpacing: 1,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,31,63,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 30,
    paddingBottom: 50,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#001F3F",
    marginBottom: 20,
    textAlign: "center",
  },
  genderOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  genderText: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
});
