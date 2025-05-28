// src/AppDrawer.tsx
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "./src/contexts/AuthContext";
import AdminScreen from "./src/screens/AdminScreen";
import QueueScreen from "./src/screens/QueueScreen";

const Drawer = createDrawerNavigator();

function CustomDrawerContent({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.drawer}>
      <Text style={styles.title}>👤 Perfil</Text>
      <Text style={styles.info}>Nome: {user?.name}</Text>
      <Text style={styles.info}>Email: {user?.email}</Text>
      <Text style={styles.info}>Tipo: {user?.role}</Text>

      <View style={styles.divider} />
      <Button title="Sair" color="#DC2626" onPress={logout} />
    </View>
  );
}

export default function AppDrawer() {
  const { user } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#4F46E5" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {user?.role === "admin" ? (
        <Drawer.Screen name="Painel Admin" component={AdminScreen} />
      ) : (
        <Drawer.Screen name="Fila Digital" component={QueueScreen} />
      )}
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 24,
  },
});
