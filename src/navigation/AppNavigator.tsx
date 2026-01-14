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
import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      // CHANGE 1: Set this to "Splash" so it is the first screen seen [cite: 2026-01-13]
      initialRouteName="Splash" 
      screenOptions={{ headerShown: false }}
    >
      
      {/* CHANGE 2: Ensure the name is "Splash" to match your navigation.replace('Splash') logic */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      
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