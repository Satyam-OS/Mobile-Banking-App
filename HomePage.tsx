import { useState } from "react";
import { 
  Box, 
  Typography, 
  IconButton, 
  Avatar, 
  Grid, 
  Button, 
  Paper, 
  Container,
  Stack,
  alpha
} from "@mui/material";
import {
  Eye,
  EyeOff,
  Send,
  ArrowDownToLine,
  Smartphone,
  MoreHorizontal,
  Bell
} from "lucide-react";
import { AccountCard } from "./AccountCard";
import { TransactionItem } from "./TransactionItem";

const recentTransactions = [
  { id: "1", type: "debit" as const, category: "shopping", merchant: "Amazon Purchase", amount: 89.99, date: "Today, 2:30 PM", status: "completed" as const },
  { id: "2", type: "debit" as const, category: "food", merchant: "Starbucks Coffee", amount: 12.5, date: "Today, 10:15 AM", status: "completed" as const },
  { id: "3", type: "credit" as const, category: "transfer", merchant: "Salary Deposit", amount: 3500, date: "Yesterday", status: "completed" as const },
  { id: "4", type: "debit" as const, category: "utilities", merchant: "Electric Bill", amount: 124.3, date: "Dec 22", status: "pending" as const },
];

const quickActions = [
  { icon: Send, label: "Send", color: "#E3F2FD", iconColor: "#0A2540" },
  { icon: ArrowDownToLine, label: "Request", color: "#E8F5E9", iconColor: "#2E7D32" },
  { icon: Smartphone, label: "Top Up", color: "#FFF3E0", iconColor: "#EF6C00" },
  { icon: MoreHorizontal, label: "More", color: "#F3E5F5", iconColor: "#7B1FA2" },
];

export function HomePage() {
  const [balanceVisible, setBalanceVisible] = useState(true);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* PREMIUM HEADER AREA */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        pt: 4, 
        pb: 9, 
        px: 3, 
        borderRadius: '0 0 32px 32px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(10, 37, 64, 0.2)'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.7, fontWeight: 500 }}>Good Morning,</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>John Doe</Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <IconButton sx={{ color: 'white', bgcolor: alpha('#fff', 0.1), '&:hover': { bgcolor: alpha('#fff', 0.2) } }}>
              <Bell size={20} />
            </IconButton>
            <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 700, border: '2px solid rgba(255,255,255,0.2)' }}>JD</Avatar>
          </Stack>
        </Stack>

        {/* GLASSMORPHISM BALANCE CARD */}
        <Box sx={{ 
          p: 3, 
          borderRadius: 4, 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)', 
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, letterSpacing: 0.5 }}>TOTAL BALANCE</Typography>
            <IconButton 
              size="small" 
              onClick={() => setBalanceVisible(!balanceVisible)}
              sx={{ color: 'white' }}
            >
              {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
            </IconButton>
          </Stack>
          <Typography variant="h3" sx={{ mt: 1, fontWeight: 700, letterSpacing: '-0.03em' }}>
            {balanceVisible ? "$12,458.50" : "••••••"}
          </Typography>
        </Box>
      </Box>

      {/* OVERLAYING CONTENT */}
      <Container sx={{ mt: -4 }}>
        {/* QUICK ACTIONS GRID */}
        <Grid container spacing={2.5} sx={{ mb: 5 }}>
          {quickActions.map((action) => (
            <Grid item xs={3} key={action.label}>
              <Stack alignItems="center" spacing={1}>
                <Paper elevation={0} sx={{ 
                  width: '100%', 
                  aspectRatio: '1/1', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: 4,
                  bgcolor: action.color,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:active': { transform: 'scale(0.92)' },
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                }}>
                  <action.icon color={action.iconColor} size={24} strokeWidth={2.5} />
                </Paper>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {action.label}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>

        {/* ACCOUNTS LISTING */}
        <Box sx={{ mb: 5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>My Accounts</Typography>
            <Button size="small" variant="text" sx={{ fontWeight: 700, color: 'secondary.main' }}>View All</Button>
          </Stack>
          <AccountCard
            type="Checking Account"
            accountNumber="4532990812345678"
            balance={8245.3}
            gradient="linear-gradient(135deg, #0A2540 0%, #1A4F8B 100%)"
          />
        </Box>

        {/* RECENT ACTIVITY LIST */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>Recent Activity</Typography>
            <Button size="small" variant="text" sx={{ fontWeight: 700, color: 'secondary.main' }}>See All</Button>
          </Stack>
          <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
              {recentTransactions.map((t) => (
                <TransactionItem key={t.id} transaction={t} />
              ))}
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}