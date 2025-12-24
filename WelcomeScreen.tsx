import { useState } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Stack, 
  InputAdornment, 
  IconButton,
  alpha 
} from "@mui/material";
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onExplore: () => void;
  onLogin: () => void;
}

export function WelcomeScreen({ onExplore, onLogin }: WelcomeScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Box sx={{ 
      px: 4, 
      py: 6, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      textAlign: 'center',
      height: '100%',
      bgcolor: 'background.paper',
      // Subtle background texture or gradient could go here
    }}>
      {/* BRANDING - Styled like the SB logo in your reference */}
      <Box sx={{ 
        width: 64, 
        height: 64, 
        background: 'linear-gradient(135deg, #0A2540 0%, #1A4F8B 100%)', 
        borderRadius: 0, 
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(10, 37, 64, 0.15)'
      }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 900 }}>SB</Typography>
      </Box>
      
      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
        SecureBank
      </Typography>
      
      <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        Simple and smart banking
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 5, fontWeight: 500 }}>
        at your fingertips.
      </Typography>

      {/* LOGIN SECTION */}
      <Stack spacing={2.5} sx={{ width: '100%', mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Username or Email"
          value={username}
          variant="outlined"
          onChange={(e) => setUsername(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <User size={18} color="#4F5B76" strokeWidth={2.5} />
              </InputAdornment>
            ),
            sx: { 
              borderRadius: 0, 
              bgcolor: alpha('#F6F9FC', 0.8),
              '& fieldset': { borderColor: alpha('#4F5B76', 0.2) }
            }
          }}
        />
        
        <Box sx={{ width: '100%' }}>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={18} color="#4F5B76" strokeWidth={2.5} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 0, 
                bgcolor: alpha('#F6F9FC', 0.8),
                '& fieldset': { borderColor: alpha('#4F5B76', 0.2) }
              }
            }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'secondary.main', 
              fontWeight: 700, 
              cursor: 'pointer', 
              display: 'block',
              textAlign: 'right',
              mt: 1,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Forgot Password?
          </Typography>
        </Box>

        <Button 
          variant="contained" 
          fullWidth 
          size="large"
          onClick={onLogin}
          sx={{ 
            py: 2, 
            borderRadius: 0, 
            fontSize: '1rem',
            fontWeight: 800,
            bgcolor: 'secondary.main', // Sapphire Blue from screenshot
            '&:hover': { bgcolor: '#0052D9' },
            boxShadow: '0 4px 12px rgba(0, 97, 255, 0.2)' 
          }}
        >
          Sign In
        </Button>
      </Stack>

      {/* NEW USER SECTION */}
      <Box sx={{ width: '100%', mt: 'auto', pt: 4 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontWeight: 600 }}>
          New User?
        </Typography>
        <Button 
          variant="outlined" 
          fullWidth 
          size="large"
          onClick={onExplore}
          endIcon={<ArrowRight size={18} />}
          sx={{ 
            py: 1.8, 
            borderRadius: 0, 
            borderWidth: 2,
            borderColor: alpha('#0A2540', 0.1),
            color: 'primary.main',
            fontWeight: 700,
            '&:hover': { borderWidth: 2, bgcolor: alpha('#F6F9FC', 1), borderColor: 'primary.main' }
          }}
        >
          Explore Features
        </Button>
      </Box>

      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 4, opacity: 0.6, fontWeight: 500 }}>
        Terms & Privacy Policy
      </Typography>
    </Box>
  );
}