import DateTimePicker from "@react-native-community/datetimepicker";
import { CameraView, useCameraPermissions } from "expo-camera"; // Updated
import * as DocumentPicker from "expo-document-picker";
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
  Info,
  Mail,
  MapPin,
  RotateCcw,
  Shield,
  Upload,
  User,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
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
  const [cameraVisible, setCameraVisible] = useState(false); // Modal state
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();

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
    selfieUri: null as string | null,
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

  const handleTakeSelfie = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        showAlert("Permission Denied", "Camera access is required for KYC.");
        return;
      }
    }
    setCameraVisible(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });
      setFormData({ ...formData, selfieUri: photo.uri });
      setCameraVisible(false);
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
      if (!formData.selfieUri)
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
          selfiePath: "SELFIE_UPLOADED",
        };

        await kycService.submitKyc(payload);
        navigation.replace("KYCSuccess");
      } catch (error: any) {
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

            <Text style={styles.inputLabel}>
              FULL NAME (AS PER PAN) <Text style={styles.requiredStar}>*</Text>
            </Text>
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

            <Text style={styles.inputLabel}>
              EMAIL ADDRESS <Text style={styles.requiredStar}>*</Text>
            </Text>
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
                <Text style={styles.inputLabel}>
                  DATE OF BIRTH <Text style={styles.requiredStar}>*</Text>
                </Text>
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
                      style={
                        {
                          flex: 1,
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontSize: "15px",
                          color: "#001F3F",
                          width: "100%",
                          cursor: "pointer",
                        } as any
                      }
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
                <Text style={styles.inputLabel}>
                  GENDER <Text style={styles.requiredStar}>*</Text>
                </Text>
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
            <Text style={styles.inputLabel}>
              DETAILED ADDRESS <Text style={styles.requiredStar}>*</Text>
            </Text>
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

            <Text style={styles.inputLabel}>
              PINCODE <Text style={styles.requiredStar}>*</Text>
            </Text>
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
                  <Text style={styles.uploadTitle}>
                    {doc.label} <Text style={styles.requiredStar}>*</Text>
                  </Text>
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
              <Text style={styles.inputLabel}>
                PREFERRED ACCOUNT TYPE{" "}
                <Text style={styles.requiredStar}>*</Text>
              </Text>
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
              <Text style={styles.videoTitle}>
                Face Verification <Text style={styles.requiredStar}>*</Text>
              </Text>
              <Text style={styles.videoDesc}>
                Take a clear selfie to verify your identity. Ensure your face is
                well-lit and visible.
              </Text>
            </View>

            <View
              style={[
                styles.videoCircle,
                formData.selfieUri && {
                  borderColor: "#10B981",
                  borderStyle: "solid",
                },
              ]}
            >
              {formData.selfieUri ? (
                <Image
                  source={{ uri: formData.selfieUri }}
                  style={{ width: "100%", height: "100%", borderRadius: 80 }}
                />
              ) : (
                <User size={60} color="#CBD5E1" />
              )}
            </View>

            <View style={styles.cameraBtnContainer}>
              <TouchableOpacity
                style={[
                  styles.cameraActionBtn,
                  formData.selfieUri && styles.cameraActionBtnRetake,
                ]}
                onPress={handleTakeSelfie}
              >
                {formData.selfieUri ? (
                  <RotateCcw size={20} color="#64748B" />
                ) : (
                  <Camera size={20} color="#FFF" />
                )}
                <Text
                  style={[
                    styles.cameraActionText,
                    formData.selfieUri && { color: "#64748B" },
                  ]}
                >
                  {formData.selfieUri ? "RETAKE SELFIE" : "TAKE LIVE SELFIE"}
                </Text>
              </TouchableOpacity>
            </View>

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

            <Modal visible={cameraVisible} animationType="fade">
              <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
                <CameraView style={{ flex: 1 }} facing="front" ref={cameraRef}>
                  <View style={styles.cameraMask} />

                  <View style={{ flexDirection: "row", height: 350 }}>
                    <View style={styles.cameraMask} />
                    <View style={styles.cameraOval} />
                    <View style={styles.cameraMask} />
                  </View>

                  <View
                    style={[
                      styles.cameraMask,
                      { flex: 2, alignItems: "center" },
                    ]}
                  >
                    <Text style={styles.cameraGuideText}>
                      Center your face in the oval
                    </Text>
                    <TouchableOpacity
                      onPress={capturePhoto}
                      style={styles.shutterBtn}
                    >
                      <View style={styles.shutterInner} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setCameraVisible(false)}
                      style={{ marginTop: 30 }}
                    >
                      <Text style={{ color: "#FFF", fontSize: 16 }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </CameraView>
              </SafeAreaView>
            </Modal>
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

      {showGender && (
        <View style={styles.modalBg}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowGender(false)} activeOpacity={1} />
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
      )}

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
  safeArea: { flex: 1, backgroundColor: "#F8FAFC", position: "relative" },
  header: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  shieldIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 4,
  },
  progressContainer: { marginTop: -25, paddingHorizontal: 20 },
  progressCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  stepsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepItem: { alignItems: "center", width: 60 },
  stepIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepIconActive: { backgroundColor: "#0EA5E9" },
  stepIconInactive: { backgroundColor: "#F1F5F9" },
  stepTitle: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  stepTitleActive: { color: "#0EA5E9" },
  stepTitleInactive: { color: "#94A3B8" },
  stepLine: { flex: 1, height: 2, marginBottom: 20, marginHorizontal: -10 },
  stepLineActive: { backgroundColor: "#0EA5E9" },
  stepLineInactive: { backgroundColor: "#F1F5F9" },
  scroll: { flex: 1, paddingHorizontal: 20 },
  formContent: { paddingTop: 24, paddingBottom: 40 },
  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  infoText: {
    color: "#0369A1",
    fontSize: 12,
    marginLeft: 10,
    flex: 1,
    fontWeight: "500",
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    marginBottom: 8,
    letterSpacing: 1,
  },
  requiredStar: { color: "#EF4444" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    height: 54,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    color: "#001F3F",
    fontSize: 15,
    fontWeight: "600",
    height: "100%",
  },
  row: { flexDirection: "row", alignItems: "center" },
  autoResultBox: {
    flexDirection: "row",
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    marginTop: 10,
  },
  autoLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0EA5E9",
    marginBottom: 4,
  },
  autoText: { color: "#0369A1", fontSize: 15, fontWeight: "700" },
  uploadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  uploadCardDone: { borderColor: "#10B981", backgroundColor: "#F0FDF4" },
  uploadIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadTitle: { fontSize: 14, fontWeight: "700", color: "#001F3F" },
  uploadSubtitle: { fontSize: 12, color: "#64748B", marginTop: 2 },
  typeSelector: { marginTop: 10 },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginHorizontal: 5,
  },
  typeBtnActive: { borderColor: "#0EA5E9", backgroundColor: "#F0F9FF" },
  typeBtnText: { marginLeft: 8, fontWeight: "700", color: "#94A3B8" },
  typeBtnTextActive: { color: "#0EA5E9" },
  instructionCard: {
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    marginBottom: 30,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#001F3F",
    marginTop: 12,
    marginBottom: 8,
  },
  videoDesc: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  videoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#F8FAFC",
    borderWidth: 3,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  cameraActionBtn: {
    flexDirection: "row",
    backgroundColor: "#0EA5E9",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    alignSelf: "center",
  },
  cameraActionBtnRetake: { backgroundColor: "#F1F5F9" },
  cameraActionText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 14,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  checklist: { marginTop: 30, alignItems: "center" },
  checkItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  checkText: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 8,
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  primaryBtn: {
    backgroundColor: "#0EA5E9",
    height: 58,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    marginRight: 10,
  },
  secureTag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  secureText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  modalBg: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,31,63,0.4)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#001F3F",
    marginBottom: 20,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  genderText: { fontSize: 16, fontWeight: "600", color: "#001F3F" },

  // OVAL CAMERA STYLES
  cameraMask: { flex: 1, backgroundColor: "rgb(255, 255, 255)" },
  cameraOval: {
    width: 250,
    height: 350,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: "#FFF",
    backgroundColor: "transparent",
  },
  cameraGuideText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
  },
  shutterBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  shutterInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#0EA5E9",
  },
  cameraBtnContainer: { alignSelf: "center" },
});
