import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { useQueue } from "../contexts/QueueContext";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/Button";

export default function QueueScreen() {
  const { queue, currentPassword, addPassword } = useQueue();
  const { user, logout } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [hasTriedAgain, setHasTriedAgain] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);

  const myPassword = useMemo(() => {
    return queue.find((item) => item.email === user?.email)?.password ?? null;
  }, [queue, user?.email]);

  const current = queue.find((item) => item.password === currentPassword);
  const lastTwo = queue
    .filter((item) => item.password !== currentPassword)
    .slice(-2)
    .reverse();

  function handleChooseType(type: "normal" | "prioritary") {
    if (!user?.email) return;

    const currentNum = parseInt(currentPassword ?? "0");
    const mine = myPassword ? parseInt(myPassword.substring(1)) : null;

    if (mine !== null && currentNum < mine) {
      setModalVisible(false);
      return;
    }

    if (mine !== null && currentNum === mine) {
      if (hasTriedAgain) {
        Alert.alert(
          "Aguarde sua vez",
          `Você já retirou a senha ${myPassword}. Aguarde ela ser chamada.`
        );
      } else {
        setHasTriedAgain(true);
      }
      setModalVisible(false);
      return;
    }

    addPassword(user.email, type);
    setHasTriedAgain(false);
    setModalVisible(false);
  }

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentPassword === myPassword) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1); // reseta quando não é mais a vez
    }
  }, [currentPassword, myPassword]);

  useEffect(() => {
    if (currentPassword === myPassword && myPassword !== null) {
      setShowHighlight(true);
      const timeout = setTimeout(() => {
        setShowHighlight(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [currentPassword, myPassword]);

  if (showHighlight && currentPassword === myPassword && myPassword !== null) {
    return (
      <View style={styles.centeredContainer}>
        <Animated.View
          style={[styles.highlightCard, { transform: [{ scale: pulseAnim }] }]}
        >
          <Text style={styles.suaVezTitulo}>Sua vez! Vá para o guichê.</Text>
          <Text style={styles.password}>{myPassword}</Text>
          <Text style={styles.guiche}>Guichê 01</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>SENHA ATUAL</Text>
      <Animated.View
        style={[
          styles.card,
          currentPassword === myPassword && {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Text style={styles.tipo}>
          {current?.type === "prioritary" ? "Prioridade" : "Normal"}
        </Text>
        <Text style={styles.password}>{current?.password ?? "---"}</Text>
        <Text style={styles.guiche}>Guichê 01</Text>
      </Animated.View>

      <View style={[styles.card, styles.lightCard]}>
        <Text style={styles.sectionTitle}>PREVISÃO EM MINUTOS</Text>
        <Text style={styles.timer}>4</Text>
        <Text style={styles.unidade}>Unidade Gomes de Matos</Text>
      </View>

      <Text style={styles.sectionTitle}>ÚLTIMAS SENHAS</Text>
      <View style={styles.row}>
        {lastTwo
          .map((item) => (
            <View key={item.password} style={styles.smallCard}>
              <Text style={styles.tipo}>
                {item.type === "prioritary" ? "Prioridade" : "Normal"}
              </Text>
              <Text style={styles.password}>{item.password}</Text>
              <Text style={styles.guiche}>Guichê 01</Text>
            </View>
          ))
          .reverse()}
      </View>

      <View style={{ marginTop: 32, width: "100%" }}>
        <Button
          title="Pegar Nova Senha"
          onPress={() => setModalVisible(true)}
        />
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha o tipo de senha</Text>

            <Button
              title="➖ Senha Normal"
              onPress={() => handleChooseType("normal")}
            />
            <Button
              title="🚨 Senha Prioritária"
              onPress={() => handleChooseType("prioritary")}
            />

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
    color: "#1F2937",
  },
  card: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  lightCard: {
    backgroundColor: "#EFF6FF",
  },
  tipo: {
    fontSize: 18,
    color: "#1D4ED8",
    fontWeight: "600",
  },
  password: {
    fontSize: 56,
    color: "#1D4ED8",
    fontWeight: "bold",
  },
  guiche: {
    fontSize: 18,
    color: "#1D4ED8",
    marginTop: 4,
  },
  timer: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1D4ED8",
    marginBottom: 4,
  },
  unidade: {
    fontSize: 16,
    color: "#1D4ED8",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  smallCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#111827",
  },
  modalCancel: {
    marginTop: 12,
    color: "#DC2626",
    fontSize: 14,
  },
  suaVezTitulo: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1D4ED8",
    marginBottom: 12,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  highlightCard: {
    backgroundColor: "#FFFFFF",
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    width: "80%",
  },
});
