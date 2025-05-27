import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import QueueScreen from "../screens/QueueScreen";
import AdminScreen from "../screens/AdminScreen";

const Stack = createStackNavigator();

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS, // <--- animação de slide estilo iOS
        }}
      >
        {user ? (
          user.role === "admin" ? (
            <Stack.Screen name="Admin" component={AdminScreen} />
          ) : (
            <Stack.Screen name="Fila" component={QueueScreen} />
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={RegisterScreen} />
            <Stack.Screen
              name="EsqueciSenha"
              component={ForgotPasswordScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
