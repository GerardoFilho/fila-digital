import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import Button from "../components/Button";
import { useQueue } from "../contexts/QueueContext";
import { useAuth } from "../contexts/AuthContext";

export default function QueueScreen() {
  const { currentPassword, addPassword, queue } = useQueue();
  const { user, logout } = useAuth();

  const [hasTriedAgain, setHasTriedAgain] = useState(false);

  const myPassword = useMemo(() => {
    const found = queue.find((item) => item.email === user?.email);
    return found?.password ?? null;
  }, [queue, user?.email]);

  function handleGetPassword() {
    if (!user?.email) return;

    const current = parseInt(currentPassword ?? "0");
    const mine = myPassword ? parseInt(myPassword) : null;

    if (mine !== null && current < mine) return;

    if (mine !== null && current === mine) {
      if (hasTriedAgain) {
        Alert.alert(
          "Aguarde sua vez",
          `Você já retirou a senha ${myPassword}. Aguarde ela ser chamada.`
        );
      } else {
        setHasTriedAgain(true);
      }
      return;
    }

    // Só vai passar aqui se: nunca pegou senha, ou já foi chamado
    addPassword(user.email);
    setHasTriedAgain(false);
  }

  function handleLogout() {
    logout(); // fila permanece intacta
  }

  return (
    <View style={styles.container}>
      {user?.email && (
        <Text style={styles.welcomeText}>Bem-vindo(a), {user?.name}</Text>
      )}
      <Text style={styles.title}>Senha Atual</Text>

      <View style={styles.passwordBox}>
        <Text style={styles.passwordText}>{currentPassword ?? "---"}</Text>
      </View>

      <Button title="Pegar Nova Senha" onPress={handleGetPassword} />

      {myPassword && (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Sua Senha:</Text>
          <Text style={styles.infoText}>{myPassword}</Text>
        </View>
      )}

      <Button title="Sair" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    color: "#374151",
    fontWeight: "bold",
  },
  passwordBox: {
    backgroundColor: "#4F46E5",
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 32,
  },
  passwordText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  infoBox: {
    backgroundColor: "#E0F2FE",
    padding: 16,
    borderRadius: 10,
    marginTop: 24,
    marginBottom: 12,
    alignItems: "center",
    width: "80%",
  },
  infoTitle: {
    fontSize: 16,
    color: "#0369A1",
    fontWeight: "600",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 32,
    color: "#0284C7",
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 12,
    color: "#374151",
  },
});
