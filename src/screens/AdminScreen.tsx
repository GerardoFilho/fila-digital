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
import { useAuth } from "../contexts/AuthContext";
import { AtendimentoService } from "../services/AtendimentoService";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";

export default function AdminScreen() {
  const { user, logout, estadoFila, carregarDados } = useAuth();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [displayedPassword, setDisplayedPassword] = useState("---");

  const historicoFila = [...estadoFila.historico].sort((a, b) => {
    return a.horario.localeCompare(b.horario);
  });

  useEffect(() => {
    if (estadoFila) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDisplayedPassword(estadoFila.senhaNormal?.codigo || "---");
      });
    }
  }, [estadoFila]);

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("./../../assets/sounds/bell-notification.mp3")
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await sound.playAsync();
    } catch (error) {
      console.warn("Erro ao tocar som:", error);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const handleNextPassword = async (tipo: string) => {
    try {
      await AtendimentoService.chamarProximaSenha(tipo);
      await carregarDados();
      playSound();
    } catch (error) {
      console.error("Erro ao chamar senha:", error);
    }
  };

  const handleDesistencia = async (tipo: string) => {
    try {
      if (estadoFila.senhaNormal) {
        await AtendimentoService.registrarDesistencia(
          estadoFila.senhaNormal?.codigo
        );
        await carregarDados();
      }
    } catch (error) {
      console.error("Erro ao registrar desistência:", error);
    }
  };

  const handleAtendido = async (tipo: string) => {
    try {
      if (estadoFila.senhaNormal) {
        await AtendimentoService.registrarAtendimento(
          estadoFila.senhaNormal?.codigo
        );
        await carregarDados();
      }
    } catch (error) {
      console.error("Erro ao registrar atendimento:", error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      {user?.nome && (
        <Text style={styles.welcomeText}>Bem-vindo(a), {user?.nome}</Text>
      )}
      <Text style={styles.title}>Painel do Admin</Text>

      <Animated.View style={[styles.passwordBox, { opacity: fadeAnim }]}>
        <Text style={styles.passwordText}>
          {historicoFila[historicoFila.length - 1]?.codigo ?? "---"}
        </Text>
      </Animated.View>

      {estadoFila.error && <h1>{estadoFila.error}</h1>}

      <Button
        title="Chamar Próxima Senha"
        onPress={() => handleNextPassword("NORMAL")}
      />
      <Button title="Desistencia" onPress={() => handleDesistencia("NORMAL")} />
      <Button title="Atendido" onPress={() => handleAtendido("NORMAL")} />
      <Button title="Sair" onPress={logout} />

      <View style={styles.queueContainer}>
        <Text style={styles.queueTitle}>Últimas senhas chamadas:</Text>

        <FlatList
          data={historicoFila.slice(-6)}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Text style={styles.queueItem}>
              Senha {item.codigo} | Horário: {item.horario}
            </Text>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyQueue}>Nenhuma chamada recente.</Text>
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
