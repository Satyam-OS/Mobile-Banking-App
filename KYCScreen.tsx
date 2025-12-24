import { useState, useRef } from "react";
import { 
  Box, Typography, Button, Stack, 
  IconButton, alpha, Container 
} from "@mui/material";
import { 
  Upload, Camera, FileText, CheckCircle2, 
  Clock, ArrowLeft, ShieldCheck, Headphones 
} from "lucide-react";

interface KYCScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export function KYCScreen({ onComplete, onBack }: KYCScreenProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Changed state to store actual File objects for API readiness
  const [documents, setDocuments] = useState<{
    idFront: File | null;
    idBack: File | null;
    selfie: File | null;
  }>({
    idFront: null,
    idBack: null,
    selfie: null,
  });

  const handleFileSelect = (docType: keyof typeof documents, file: File | null) => {
    if (file) {
      setDocuments((prev) => ({ ...prev, [docType]: file }));
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const allUploaded = documents.idFront && documents.idBack && documents.selfie;

  if (isSubmitted) {
    return (
      <Box sx={{ bgcolor: '#F6F9FC', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ background: '#0A2540', py: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: alpha('#fff', 0.6), fontWeight: 700, letterSpacing: 1.5 }}>
            APPLICATION STATUS: UNDER REVIEW
          </Typography>
        </Box>

        <Container sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ 
              width: 90, height: 90, bgcolor: alpha('#0061FF', 0.08), 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              mx: 'auto', mb: 4, position: 'relative'
            }}>
              <Clock size={44} color="#0061FF" />
              <Box sx={{ 
                position: 'absolute', top: -5, right: -5, 
                bgcolor: 'secondary.main', p: 0.5, border: '3px solid #F6F9FC' 
              }}>
                <ShieldCheck size={16} color="white" />
              </Box>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 2 }}>
              Verification in Progress
            </Typography>
            
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.7 }}>
              Your documents have been successfully received. Our compliance team is manually reviewing your details to ensure bank-level security. 
              <br/><br/>
              This process typically takes <b>12-24 hours</b>. You will receive a push notification once your account is activated.
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: 'white', border: '1px solid', borderColor: 'divider', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Headphones size={20} color="#4F5B76" />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>Need it faster?</Typography>
                  <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, cursor: 'pointer' }}>Contact Priority Support</Typography>
                </Box>
              </Box>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={onBack}
                sx={{ py: 1.8, borderRadius: 0, fontWeight: 800, borderColor: 'primary.main', color: 'primary.main' }}
              >
                Return to Login
              </Button>
            </Stack>
          </Box>
        </Container>

        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Reference ID: #KYC-882-9421
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F6F9FC', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #0A2540 0%, #1A4F8B 100%)', pt: 4, pb: 4, px: 2 }}>
        <IconButton onClick={onBack} sx={{ color: 'white', mb: 1 }}><ArrowLeft /></IconButton>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, px: 1 }}>Submit Documents</Typography>
      </Box>

      <Container sx={{ py: 4, flexGrow: 1, overflowY: 'auto' }}>
        <Stack spacing={2}>
          <UploadCard 
            title="Aadhaar Front" 
            file={documents.idFront} 
            onFileSelect={(file) => handleFileSelect('idFront', file)} 
            icon={<FileText />}
            accept="image/*,.pdf"
          />
          <UploadCard 
            title="Aadhaar Back" 
            file={documents.idBack} 
            onFileSelect={(file) => handleFileSelect('idBack', file)} 
            icon={<FileText />}
            accept="image/*,.pdf"
          />
          <UploadCard 
            title="Live Selfie" 
            file={documents.selfie} 
            onFileSelect={(File) => handleFileSelect('selfie', File)} 
            icon={<Camera />}
            accept="image/*"
            capture="user"
          />
        </Stack>
      </Container>

      <Box sx={{ p: 3, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="contained"
          disabled={!allUploaded}
          onClick={handleSubmit}
          sx={{ py: 2, borderRadius: 0, bgcolor: 'secondary.main', fontWeight: 800 }}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
}

function UploadCard({ title, file, onFileSelect, icon, accept, capture }: any) {
  // Using a ref to trigger the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Box 
      onClick={() => fileInputRef.current?.click()}
      sx={{ 
        p: 3, display: 'flex', gap: 2, alignItems: 'center', cursor: 'pointer',
        border: '1px solid', borderColor: file ? 'secondary.main' : 'divider',
        bgcolor: 'white', transition: '0.2s',
        '&:hover': { bgcolor: alpha('#0061FF', 0.02) }
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
        accept={accept}
        capture={capture}
        style={{ display: 'none' }}
      />
      
      <Box sx={{ color: file ? 'secondary.main' : 'text.disabled' }}>{icon}</Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>{title}</Typography>
        {file && (
          <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, display: 'block' }}>
            {file.name}
          </Typography>
        )}
      </Box>
      {file ? <CheckCircle2 size={20} color="#0061FF" /> : <Upload size={18} color="#4F5B76" />}
    </Box>
  );
}