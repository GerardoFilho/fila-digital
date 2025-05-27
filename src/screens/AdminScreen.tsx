import {
  View,
  Text,
  StyleSheet,
  Alert,
  Animated,
  FlatList,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { useQueue } from "../contexts/QueueContext";
import { useAuth } from "../contexts/AuthContext";

export default function AdminScreen() {
  const { currentPassword, nextPassword, resetQueue, queue } = useQueue();
  const { user, logout } = useAuth();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [displayedPassword, setDisplayedPassword] = useState(currentPassword);

  useEffect(() => {
    if (currentPassword !== displayedPassword) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDisplayedPassword(currentPassword);
      });
    }
  }, [currentPassword]);

  function handleNextPassword() {
    if (queue.length <= 1) {
      Alert.alert("Fila vazia", "Não há mais senhas na fila!");
      return;
    }
    nextPassword();
  }

  function handleResetQueue() {
    Alert.alert("Resetar Fila", "Tem certeza que deseja resetar toda a fila?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Resetar", onPress: resetQueue, style: "destructive" },
    ]);
  }

  return (
    <View style={styles.container}>
      {user?.email && (
        <Text style={styles.welcomeText}>Bem-vindo(a), {user?.name}</Text>
      )}
      <Text style={styles.title}>Painel do Admin</Text>

      <Animated.View style={[styles.passwordBox, { opacity: fadeAnim }]}>
        <Text style={styles.passwordText}>{displayedPassword ?? "---"}</Text>
      </Animated.View>

      <Button title="Chamar Próxima Senha" onPress={handleNextPassword} />
      <Button title="Resetar Fila" onPress={handleResetQueue} />
      <Button title="Sair" onPress={logout} />

      <View style={styles.queueContainer}>
        <Text style={styles.queueTitle}>Fila de Espera:</Text>

        <FlatList
          data={queue.slice(1)}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Text style={styles.queueItem}>
              {index + 1}º - Senha {item.password} | {item.email}
            </Text>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyQueue}>Nenhuma senha na fila.</Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
    textAlign: "center",
  },
  passwordBox: {
    backgroundColor: "#10B981",
    paddingVertical: 32,
    paddingHorizontal: 48,
    borderRadius: 16,
    alignSelf: "center",
    marginBottom: 32,
  },
  passwordText: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  queueContainer: {
    marginTop: 32,
    marginBottom: 32,
  },
  queueTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#374151",
  },
  queueItem: {
    fontSize: 16,
    marginVertical: 4,
    color: "#374151",
  },
  emptyQueue: {
    fontSize: 16,
    textAlign: "center",
    color: "#9CA3AF",
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 12,
    color: "#374151",
  },
});
