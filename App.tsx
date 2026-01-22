import { NavigationContainer } from "@react-navigation/native";
import { AppProvider } from "./src/context/AppContext"; // Import your new context
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
