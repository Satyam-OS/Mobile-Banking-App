import { useState, useRef } from "react";
import { 
  Box, Typography, TextField, Button, Stack, 
  IconButton, Container, MenuItem, LinearProgress, Paper, Link, alpha 
} from "@mui/material";
import { 
  ArrowLeft, Upload, Camera, FileText, CheckCircle2, 
  ShieldCheck, HelpCircle, Clock 
} from "lucide-react";

interface KYCFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

export function KYCFlow({ onBack, onComplete }: KYCFlowProps) {
  const [step, setStep] = useState(0); 
  const [data, setData] = useState({
    fullName: "", dob: "", income: "", address: "",
    idFront: null as File | null, 
    idBack: null as File | null, 
    selfie: null as File | null
  });

  const isProfileValid = data.fullName.length > 2 && data.dob && data.income && data.address.length > 5;
  const isDocsValid = data.idFront && data.idBack && data.selfie;

  if (step === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#F6F9FC' }}>
        <Box sx={{ bgcolor: '#0A2540', p: 3, color: 'white' }}>
          <IconButton onClick={onBack} sx={{ color: 'white', ml: -1 }}><ArrowLeft /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Legal Profile</Typography>
        </Box>
        <LinearProgress variant="determinate" value={33} sx={{ height: 6 }} />
        <Container sx={{ py: 4, flexGrow: 1 }}>
          <Stack spacing={3}>
            <TextField label="Full Name" fullWidth value={data.fullName} onChange={(e) => setData({...data, fullName: e.target.value.replace(/[^a-zA-Z\s]/g, "")})} />
            <TextField label="Date of Birth" type="date" fullWidth InputLabelProps={{ shrink: true }} value={data.dob} onChange={(e) => setData({...data, dob: e.target.value})} />
            <TextField select label="Annual Income" fullWidth value={data.income} onChange={(e) => setData({...data, income: e.target.value})}>
               <MenuItem value="low">Below ₹5 Lakhs</MenuItem>
               <MenuItem value="mid">₹5 - ₹15 Lakhs</MenuItem>
               <MenuItem value="high">Above ₹15 Lakhs</MenuItem>
            </TextField>
            <TextField label="Residential Address" fullWidth multiline rows={3} value={data.address} onChange={(e) => setData({...data, address: e.target.value})} />
          </Stack>
        </Container>
        <Box sx={{ p: 3, bgcolor: 'white' }}>
          <Button fullWidth variant="contained" disabled={!isProfileValid} onClick={() => setStep(1)} sx={{ py: 2, bgcolor: '#0061FF' }}>Continue</Button>
        </Box>
      </Box>
    );
  }

  if (step === 1) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#F6F9FC' }}>
        <Box sx={{ bgcolor: '#0A2540', p: 3, color: 'white' }}>
          <IconButton onClick={() => setStep(0)} sx={{ color: 'white', ml: -1 }}><ArrowLeft /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Upload ID</Typography>
        </Box>
        <LinearProgress variant="determinate" value={66} sx={{ height: 6 }} />
        <Container sx={{ py: 4, flexGrow: 1 }}>
          <Stack spacing={2}>
              <DocTile title="ID Front" file={data.idFront} onSelect={(f: any) => setData({...data, idFront: f})} icon={<FileText />} />
              <DocTile title="ID Back" file={data.idBack} onSelect={(f: any) => setData({...data, idBack: f})} icon={<FileText />} />
              <DocTile title="Live Selfie" file={data.selfie} onSelect={(f: any) => setData({...data, selfie: f})} icon={<Camera />} capture="user" />
          </Stack>
        </Container>
        <Box sx={{ p: 3, bgcolor: 'white' }}>
          <Button fullWidth variant="contained" disabled={!isDocsValid} onClick={() => setStep(2)} sx={{ py: 2, bgcolor: '#0061FF' }}>Submit</Button>
        </Box>
      </Box>
    );
  }

  // --- RESTORED BANKING STYLE ---
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#F6F9FC' }}>
      <Box sx={{ bgcolor: '#0A2540', p: 3, color: 'white', textAlign: 'center' }}>
        <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.8, fontWeight: 700 }}></Typography>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>APPLICATION STATUS</Typography>
      </Box>
      
      <Container sx={{ py: 6, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Box sx={{ 
            width: 90, height: 90, borderRadius: '50%', bgcolor: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <ShieldCheck size={40} color="#0061FF" />
          </Box>
          <Box sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: '#0061FF', borderRadius: '50%', p: 0.5, border: '3px solid #F6F9FC' }}>
            <Clock size={16} color="white" />
          </Box>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 900, color: '#0A2540', mb: 1 }}>Account Under Audit</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 4 }}>
          Reference: <b>#{Math.floor(Math.random() * 900000)}</b>
        </Typography>

        <Paper sx={{ width: '100%', borderRadius: 0, border: '1px solid #e0e6ed', mb: 4, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderBottom: '1px solid #e0e6ed' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#4F5B76' }}>AUDIT LOG DETAILS</Typography>
          </Box>
          <Stack spacing={0}>
            <DetailRow label="Client Name" value={data.fullName || "User"} />
            <DetailRow label="Status" value="Verification Pending" isBlue />
            <DetailRow label="Est. Review" value="24 Hours" />
          </Stack>
        </Paper>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 'auto' }}>
          <HelpCircle size={16} color="#4F5B76" />
          <Typography variant="body2" color="text.secondary">
            Need help? <Link href="#" sx={{ color: '#0061FF', fontWeight: 700, textDecoration: 'none' }}>Contact Support</Link>
          </Typography>
        </Stack>

        <Button 
          fullWidth variant="contained" 
          onClick={onBack}
          sx={{ py: 2, bgcolor: '#0A2540', borderRadius: 0, fontWeight: 800, mt: 4 }}
        >
          Return to Login
        </Button>
      </Container>
    </Box>
  );
}

// Helper components
function DetailRow({ label, value, isBlue }: { label: string, value: string, isBlue?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'white', borderBottom: '1px solid #f1f5f9' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, color: isBlue ? '#0061FF' : '#1A1F36' }}>{value}</Typography>
    </Box>
  );
}

function DocTile({ title, file, onSelect, icon, capture }: any) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Box 
      onClick={() => ref.current?.click()} 
      sx={{ 
        p: 3, border: '1px solid #ddd', 
        display: 'flex', alignItems: 'center', cursor: 'pointer', bgcolor: 'white' 
      }}
    >
      <input type="file" ref={ref} style={{ display: 'none' }} accept="image/*" capture={capture} onChange={(e) => onSelect(e.target.files?.[0] || null)} />
      <Box sx={{ mr: 2, color: file ? '#0061FF' : '#aaa' }}>{icon}</Box>
      <Box sx={{ flexGrow: 1 }}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{title}</Typography></Box>
      {file ? <CheckCircle2 size={20} color="#0061FF" /> : <Upload size={18} color="#aaa" />}
    </Box>
  );
}