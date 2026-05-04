import { createNativeStackNavigator } from "@react-navigation/native-stack";
// update
import AdminDashboard from "../screens/AdminDashboard";
import BalanceSecurity from "../screens/BalanceSecurity";
import BankTransfer from "../screens/BankTransfer";
import Cards from "../screens/Cards";
import ForgotPasswordScreen from "../screens/ForgotPassword";
import GuestExplore from "../screens/GuestExplore";
import GuestOtp from "../screens/GuestOtp";
import Index from "../screens/Index";
import InvestDashboard from "../screens/Invest";
import KYCOnboarding from "../screens/KYCOnboarding";
import KYCSuccess from "../screens/KYCSuccess";
import Login from "../screens/Login";
import OTPSuccess from "../screens/OTPSuccess";
import Payments from "../screens/Payments";
import PersonalDetails from "../screens/PersonalDetails";
import Profile from "../screens/Profile";
import ReferAndEarnScreen from "../screens/ReferAndEarn";
import Register from "../screens/Register";
import SetPassword from "../screens/SetPassword";
import SetPinScreen from "../screens/SetPinScreen";
import SplashScreen from "../screens/SplashScreen";
import Transactions from "../screens/Transactions";
import Transfer from "../screens/Transfer";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SetPassword" component={SetPassword} />
      <Stack.Screen name="Dashboard" component={Index} />
      <Stack.Screen name="ReferAndEarn" component={ReferAndEarnScreen} />
      <Stack.Screen name="SetPin" component={SetPinScreen} />
      <Stack.Screen name="BalanceSecurity" component={BalanceSecurity} />
      <Stack.Screen name="Cards" component={Cards} />
      <Stack.Screen name="Payments" component={Payments} />
      <Stack.Screen name="Transfer" component={Transfer} />
      <Stack.Screen name="BankTransfer" component={BankTransfer} />
      <Stack.Screen name="Transactions" component={Transactions} />
      <Stack.Screen name="Invest" component={InvestDashboard} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="GuestExplore" component={GuestExplore} />
      <Stack.Screen name="GuestOtp" component={GuestOtp} />
      <Stack.Screen name="OTPSuccess" component={OTPSuccess} />
      <Stack.Screen name="KYCOnboarding" component={KYCOnboarding} />
      <Stack.Screen name="KYCSuccess" component={KYCSuccess} />
    </Stack.Navigator>
  );
}
