import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  IconButton, 
  Container, 
  alpha 
} from "@mui/material";
import { 
  ArrowLeftRight, 
  PieChart, 
  Shield, 
  TrendingUp, 
  Smartphone, 
  ArrowLeft,
  UserPlus
} from "lucide-react";

interface GuestModeScreenProps {
  onOpenAccount: () => void;
  onBack: () => void;
}

const features = [
  {
    icon: ArrowLeftRight,
    title: "Instant Transfers",
    description: "Send and receive money instantly with zero fees across all accounts.",
  },
  {
    icon: PieChart,
    title: "Financial Insights",
    description: "Track spending, set budgets, and reach your financial goals with AI.",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "256-bit encryption and biometric authentication keep you safe.",
  },
  {
    icon: TrendingUp,
    title: "Investment Options",
    description: "Grow your wealth with smart, automated investment portfolios.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "A complete, high-performance banking experience on your phone.",
  },
];

export function GuestModeScreen({ onOpenAccount, onBack }: GuestModeScreenProps) {
  return (
    <Box sx={{ 
      bgcolor: '#F6F9FC', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden' // Prevents double scrollbars
    }}>
      
      {/* HEADER - Fixed at top */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #0A2540 0%, #1A4F8B 100%)', 
        pt: 5, 
        pb: 8, 
        px: 3, 
        zIndex: 10,
        borderRadius: 0 
      }}>
        <IconButton 
          onClick={onBack} 
          sx={{ 
            position: 'absolute', 
            left: 16, 
            top: 16, 
            color: 'white',
            borderRadius: 0,
          }}
        >
          <ArrowLeft size={22} />
        </IconButton>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            Explore Features
          </Typography>
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.7), maxWidth: '80%', mx: 'auto' }}>
            Discover the next generation of digital banking.
          </Typography>
        </Box>
      </Box>

      {/* SCROLLABLE CONTENT AREA */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        px: 3,
        mt: -4, // Creates the professional overlap effect
        pb: 12, // Enough space so the last card isn't hidden by the bottom button
        zIndex: 5,
        // Standard hide scrollbar logic
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' }
      }}>
        <Stack spacing={2.5}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Box
                key={index}
                sx={{
                  bgcolor: 'background.paper',
                  p: 3,
                  display: 'flex',
                  gap: 3,
                  borderRadius: 0, 
                  border: '1px solid',
                  borderColor: alpha('#0A2540', 0.06),
                  boxShadow: '0 8px 25px rgba(10, 37, 64, 0.05)',
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'secondary.main', 
                    color: 'white',
                    borderRadius: 0, 
                    flexShrink: 0
                  }}
                >
                  <Icon size={26} strokeWidth={2} />
                </Box>

                <Box sx={{ py: 0.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5, fontSize: '1rem' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* STICKY BOTTOM BUTTON - Fixed at very bottom */}
      <Box sx={{ 
        p: 3, 
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: alpha('#0A2540', 0.05),
        zIndex: 20
      }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={onOpenAccount}
          startIcon={<UserPlus size={22} />}
          sx={{ 
            py: 2, 
            borderRadius: 0, 
            bgcolor: 'secondary.main', 
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 8px 24px rgba(0, 97, 255, 0.2)',
            '&:hover': { bgcolor: '#0052D9' }
          }}
        >
          Open Your Account
        </Button>
      </Box>
    </Box>
  );
}