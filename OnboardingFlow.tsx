import { useState, useEffect } from "react";
import { 
  Box, Typography, TextField, Button, Stack, 
  IconButton, alpha, LinearProgress 
} from "@mui/material";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, 
  Zap, Star, User, Phone 
} from "lucide-react";

interface OnboardingFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

type Step = "personal" | "otp" | "enhanced";

export function OnboardingFlow({ onComplete, onBack }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>("personal");
  const [formData, setFormData] = useState({ firstName: "", phone: "", otp: "" });
  
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // --- NEW SANITIZED HANDLERS ---
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Blocks everything except letters and spaces
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setFormData({ ...formData, firstName: val });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Blocks everything except numbers
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 10) { // Standard 10-digit cap
      setFormData({ ...formData, phone: val });
    }
  };

  const handleResend = () => {
    if (canResend) {
      setTimer(60);
      setCanResend(false);
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 6) {
      setFormData({ ...formData, otp: val });
    }
  };

  const handleNext = () => {
    if (step === "personal") setStep("otp");
    else if (step === "otp" && formData.otp.length === 6) setStep("enhanced");
    else if (step === "enhanced") onComplete();
  };

  const renderContent = () => {
    switch (step) {
      case "personal":
        return (
          <Box sx={{ p: 3, flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>Personal Details</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>Start your journey with a secure account.</Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth label="Full Name" placeholder="Enter your name"
                value={formData.firstName}
                onChange={handleNameChange} // Validation applied
                InputProps={{
                  startAdornment: <User size={20} style={{ marginRight: 12, color: '#4F5B76' }} />,
                  sx: { borderRadius: 0, bgcolor: '#F6F9FC' }
                }}
              />
              <TextField
                fullWidth label="Phone Number" placeholder="10-digit mobile number"
                type="tel" // Opens numeric keypad on mobile
                value={formData.phone}
                onChange={handlePhoneChange} // Validation applied
                InputProps={{
                  startAdornment: <Phone size={20} style={{ marginRight: 12, color: '#4F5B76' }} />,
                  sx: { borderRadius: 0, bgcolor: '#F6F9FC' }
                }}
              />
            </Stack>
          </Box>
        );

      case "otp":
        return (
          <Box sx={{ p: 3, flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>Verification</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>Enter the 6-digit code sent to {formData.phone}</Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                placeholder="000000"
                variant="outlined"
                value={formData.otp}
                onChange={handleOTPChange}
                autoFocus
                inputProps={{ 
                  maxLength: 6,
                  style: { textAlign: 'center', fontSize: '32px', letterSpacing: '12px', fontWeight: '900', color: '#0061FF' } 
                }}
                InputProps={{ sx: { borderRadius: 0, bgcolor: '#F6F9FC' } }}
              />
              <Box>
                {canResend ? (
                  <Typography 
                    onClick={handleResend}
                    variant="body2" 
                    sx={{ color: 'secondary.main', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Resend Code
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                    Resend code in <span style={{ color: '#0A2540' }}>{timer}s</span>
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>
        );

      case "enhanced":
        return (
          <Box sx={{ p: 3, flexGrow: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ width: 64, height: 64, bgcolor: alpha('#0061FF', 0.1), color: 'secondary.main', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <CheckCircle2 size={40} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>Verification Success!</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Account upgraded to <b>Secure Pro</b>.</Typography>
            </Box>
            <Stack spacing={2}>
              <EnhancedFeatureCard icon={<ShieldCheck size={20} />} title="Zero Liability" desc="Bank-grade protection." />
              <EnhancedFeatureCard icon={<Zap size={20} />} title="Flash Transfers" desc="Instant 24/7 settlements." />
              <EnhancedFeatureCard icon={<Star size={20} />} title="Smart Vaults" desc="AI-powered savings." />
            </Stack>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #0A2540 0%, #1A4F8B 100%)', pt: 4, pb: 4, px: 2 }}>
        <IconButton onClick={step === "otp" ? () => setStep("personal") : onBack} sx={{ color: 'white', mb: 1 }}>
          <ArrowLeft size={22} />
        </IconButton>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, px: 1 }}>
           {step === "enhanced" ? "Success" : "Security Check"}
        </Typography>
      </Box>

      <LinearProgress 
        variant="determinate" 
        value={step === "personal" ? 33 : step === "otp" ? 66 : 100} 
        sx={{ height: 6, bgcolor: alpha('#0061FF', 0.1), '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' } }}
      />

      <Box sx={{ flexGrow: 1 }}>{renderContent()}</Box>

      <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          fullWidth variant="contained" size="large" onClick={handleNext}
          disabled={
            (step === "personal" && (formData.firstName.length < 3 || formData.phone.length < 10)) ||
            (step === "otp" && formData.otp.length !== 6)
          }
          sx={{ py: 2, borderRadius: 0, bgcolor: 'secondary.main', fontWeight: 800 }}
        >
          {step === "personal" ? "Get Code" : step === "otp" ? "Verify Now" : "Create Account Now"}
        </Button>
      </Box>
    </Box>
  );
}

function EnhancedFeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <Box sx={{ p: 2, display: 'flex', gap: 2, border: '1px solid', borderColor: alpha('#0A2540', 0.08), bgcolor: '#FBFDFF' }}>
      <Box sx={{ color: 'secondary.main', mt: 0.5 }}>{icon}</Box>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>{title}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{desc}</Typography>
      </Box>
    </Box>
  );
}