# Nexus Bank - Mobile Banking App

## Overview
A fully functional mobile banking application built with React Native (Expo), connected to a live backend API gateway.

**API Gateway**: `https://banking-app-1ap8.onrender.com`

---

## Architecture

```
src/
├── screens/          # All app screens (Login, Dashboard, Transfer, etc.)
├── services/
│   ├── api.ts              # Base API client with JWT auth headers
│   ├── authService.ts      # Login, register, logout, OTP
│   ├── authStorage.ts      # JWT token persistence (AsyncStorage)
│   ├── accountService.ts   # Account details, balance, profile
│   ├── transactionService.ts  # History, transfer, beneficiaries
│   ├── adminService.ts     # Admin KYC operations
│   └── kycService.ts       # KYC submission
├── navigation/
│   └── AppNavigator.tsx    # Stack navigator with all routes
└── context/
    └── AppContext.tsx       # Global state (KYC requests)
```

---

## API Endpoints Used

| Feature              | Method | Endpoint                          |
|----------------------|--------|-----------------------------------|
| Login                | POST   | `/auth/login`                     |
| Reset Password       | POST   | `/auth/reset-password`            |
| Account Details      | GET    | `/account/details`                |
| Account Balance      | GET    | `/account/balance`                |
| User Profile         | GET    | `/account/profile`                |
| Transaction History  | GET    | `/transaction/history`            |
| Transfer Money       | POST   | `/transaction/transfer`           |
| Beneficiaries        | GET    | `/transaction/beneficiaries`      |
| Submit KYC           | POST   | `/kyc/submit`                     |
| KYC Status           | GET    | `/kyc/status`                     |
| Admin: Pending KYC   | GET    | `/admin/kyc/pending`              |
| Admin: Approve KYC   | POST   | `/admin/kyc/approve/:mobile`      |
| Admin: Reject KYC    | POST   | `/admin/kyc/reject/:mobile`       |

---

## Authentication Flow

1. User enters credentials on **Login** screen
2. POST to `/auth/login` returns `{ token, role }`
3. Token stored in **AsyncStorage** via `authStorage`
4. All API calls automatically attach `Authorization: Bearer <token>`
5. On 401/403 responses → auto logout + redirect to Login
6. **SplashScreen** checks token on app start → auto-login if valid

---

## Running the App

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`

### Install & Run

```bash
# Install dependencies
npm install

# Run on web (mobile-optimized view)
npm run web

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Web (Recommended for Browser Testing)
```bash
npm run web
# Opens at http://localhost:8081
# App is centered in mobile container on desktop
```

---

## Key Features Implemented

### ✅ Authentication
- Login with mobile + password
- JWT token stored securely in AsyncStorage
- Auto-login via token persistence on app refresh
- Protected routes (redirects to Login if not authenticated)
- Logout with confirmation dialog

### ✅ Dashboard
- Real account balance from API
- Pull-to-refresh functionality
- Dynamic greeting based on time of day
- Recent transactions from API
- Error state with retry
- Loading state

### ✅ Transactions
- Full transaction history from API
- Search & filter (All / Money In / Money Out)
- Summary cards (total credit / debit)
- Pull-to-refresh

### ✅ Transfer
- Beneficiary list from API (with mock fallback)
- Multi-step transfer flow: Select → Amount → Password → Confirm → Success
- Real-time balance display
- API call on final confirmation
- Proper error handling

### ✅ Profile
- Real user data from API
- Logout with confirmation

### ✅ Registration
- Multi-step KYC flow
- Submits to `/kyc/submit` on completion
- Error handling & validation

---

## Error Handling

| Error Type      | Behavior                                    |
|-----------------|---------------------------------------------|
| UNAUTHORIZED    | Auto-logout + redirect to Login             |
| NETWORK_ERROR   | User-friendly message shown                 |
| SERVER_ERROR    | Error message shown                         |
| API errors      | Error message from API response displayed   |

---

## Security

- JWT tokens stored in AsyncStorage (React Native secure storage layer)
- Token attached to all API requests via Authorization header
- Automatic token clearing on logout or 401/403 response
- Protected navigation: Splash checks auth state before routing
