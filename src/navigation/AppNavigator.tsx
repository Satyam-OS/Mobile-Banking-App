import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminDashboard from '../screens/AdminDashboard';
import GuestExplore from '../screens/GuestExplore';
import GuestOtp from '../screens/GuestOtp';
import Index from '../screens/Index';
import KYCOnboarding from '../screens/KYCOnboarding';
import KYCSuccess from '../screens/KYCSuccess';
import Login from '../screens/Login';
import OTPSuccess from '../screens/OTPSuccess';
import Register from '../screens/Register';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Dashboard" component={Index} />
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
