// App.tsx
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/contexts/AuthContext";
import { QueueProvider } from "./src/contexts/QueueContext";
import AppRoutes from "./src/routes/AppRoutes";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <QueueProvider>
          <StatusBar style="auto" />
          <AppRoutes />
        </QueueProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
