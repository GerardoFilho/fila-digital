import axios from "axios";
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { useScheduleTimer } from "../hooks/useScheduleTimer";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

interface UseWebSocketProps {
  senhaData: SenhaStatus | null;
  setSenhaData: (data: SenhaStatus) => void;
  processarAtualizacao: (data: any) => void;
}

interface SenhaStatus {
  id: number;
  codigo: string;
  numero: number;
  posicaoFila: number;
  estimativaEsperaMinutos: number;
  status: string;
}

interface SenhaAtual {
  codigo: string;
  numero: number;
  status: string;
}

interface PosicaoFila {
  codigo: string;
  numeroSenha: number;
  posicaoFila: number;
  estimativaEsperaMinutos: number;
}

interface WebSocketMessage {
  body: string;
}

interface AtualizacaoFila {
  senhaAtual: number;
  proximaSenha?: number;
  posicoesFila: PosicaoFila[];
  codigo?: string;
}

export default function QueueScreen() {
  const nome = localStorage.getItem("nomeUsuario");

  const { queue, currentPassword, addPassword, calledPasswords } = useQueue();
  const { user, senhaData, senhaAtivaExecute, estadoFila, carregarDados } =
    useAuth();

  const { scheduleInfo, tempoRestante, formatarTempo, isChamandoSenha } =
    useScheduleTimer();

  const [estimativaTempo, setEstimativaTempo] = useState<number | null>(null);
  const [minhaPosicao, setMinhaPosicao] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [senhaStatus, setSenhaStatus] = useState<SenhaStatus | null>(null);
  const [updateKey, setUpdateKey] = useState(0);

  const [senhaNormal, setSenhaNormal] = useState<SenhaAtual | null>(null);
  const [senhaPrioritaria] = useState<SenhaAtual | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [hasTriedAgain, setHasTriedAgain] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);

  const [senhaAtiva, setSenhaAtiva] = useState<any | null>(null);
  const [carregandoSenha, setCarregandoSenha] = useState(false);

  const [senhaRetirada, setSenhaRetirada] = useState<string | null>(null);

  const [showOverlay, setShowOverlay] = useState(false);
  const [senhaChamada, setSenhaChamada] = useState<string>("");

  const [clicks, setClicks] = useState(0);

  const handlePress = () => {
    setClicks((prev) => prev + 1);
  };

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("./../../assets/sounds/bell-notification.mp3")
      );
      await sound.playAsync();
    } catch (error) {
      console.warn("Erro ao tocar som:", error);
    }
  }
  useEffect(() => {
    console.log(senhaRetirada);
    console.log(senhaData);
    console.log(estadoFila);
    console.log(senhaChamada, "senhachamada");
  }, [senhaRetirada, senhaData?.codigo, senhaChamada, estadoFila]);

  const senha = senhaData?.codigo || senhaRetirada;
  const current = queue.find((item) => item.password === currentPassword);

  const lastTwo = estadoFila.historico.slice(-2);

  async function handleChooseType(type: "NORMAL" | "PRIORITARIO") {
    const usuarioId = localStorage.getItem("usuarioId");

    if (!usuarioId) {
      Alert.alert("Erro", "Usuário não identificado.");
      return;
    }

    // Já tem senha ativa?
    if (senhaRetirada || senhaData?.codigo) {
      Alert.alert(
        "Aguarde sua vez",
        `Você já retirou a senha ${
          senhaRetirada || senhaData?.codigo
        }. Aguarde ela ser chamada.`
      );
      setModalVisible(false);
      return;
    }

    const prioridade = type === "PRIORITARIO" ? "PRIORITARIO" : "NORMAL";

    try {
      const response = await fetch(
        "http://107.178.213.151:8080/api/senhas/retirar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prioridade, usuarioId }),
        }
      );

      if (response.ok) {
        if (user) {
          senhaAtivaExecute(usuarioId);
        } else {
          console.error("User is undefined, cannot execute senhaAtivaExecute.");
        }
        const novaSenha = await response.json();
        setSenhaRetirada(novaSenha.codigo); // Atualiza o estado local da senha
        Alert.alert("Senha gerada!", `Sua senha é: ${novaSenha.codigo}`);
      } else {
        Alert.alert("Erro", "Não foi possível retirar a senha.");
      }
    } catch (error) {
      console.error("Erro ao retirar senha:", error);
      Alert.alert("Erro", "Falha na comunicação com o servidor.");
    }

    setHasTriedAgain(false);
    setModalVisible(false);
  }

  const mostrarOverlayChamada = (senha: string) => {
    setSenhaChamada(senha);
    setShowOverlay(true);

    setTimeout(() => {
      setShowOverlay(false);
    }, 5000);
  };

  // useWebSocket({
  //   senhaData,
  //   setSenhaData: (data) => setSenhaStatus(data),
  //   processarAtualizacao: (dados) => {
  //     // Atualize os dados locais da senha
  //     console.log("Atualização da fila:", dados);
  //     if (dados?.id === senhaData?.id) {
  //       setSenhaStatus(dados);
  //     }
  //   },
  // });

  const processarAtualizacao = useCallback((mensagem: WebSocketMessage) => {
    try {
      console.log("Processando mensagem:", mensagem.body);
      const payload: AtualizacaoFila = JSON.parse(mensagem.body);
      console.log("Payload processado:", payload);

      if (!payload || !Array.isArray(payload.posicoesFila)) {
        console.error("Formato de mensagem inválido:", payload);
        return;
      }

      if (payload.senhaAtual) {
        console.log("senha atual", payload);
        mostrarOverlayChamada(payload.senhaAtual.toString());
      }

      setSenhaStatus((prev) => {
        if (!prev) {
          console.log("Nenhum dado de senha anterior disponível");
          return null;
        }

        const minhaSenhaAtualizada = payload.posicoesFila.find(
          (p: PosicaoFila) => p.codigo === prev.codigo
        );

        if (!minhaSenhaAtualizada) {
          console.log("Senha está em atendimento");
          setMinhaPosicao(null);
          setEstimativaTempo(null);
          setUpdateKey((u) => u + 1);
          return { ...prev, status: "EM_ATENDIMENTO" };
        }

        console.log("Atualizando posição:", minhaSenhaAtualizada.posicaoFila);
        setMinhaPosicao(minhaSenhaAtualizada.posicaoFila);
        setEstimativaTempo(minhaSenhaAtualizada.estimativaEsperaMinutos);
        setUpdateKey((u) => u + 1);

        return {
          ...prev,
          posicaoFila: minhaSenhaAtualizada.posicaoFila,
          estimativaEsperaMinutos: minhaSenhaAtualizada.estimativaEsperaMinutos,
        };
      });
    } catch (error) {
      console.error("Erro ao processar atualização:", error);
      console.error("Mensagem que causou o erro:", mensagem.body);
    }
  }, []);

  useEffect(() => {
    // const { senhaData: senhaDataFromState } = location.state || {};

    console.log(senhaData, "senhaDataFromState");

    if (senhaData?.id) {
      setSenhaStatus(senhaData);
      setMinhaPosicao(senhaData?.posicaoFila);
      setEstimativaTempo(senhaData?.estimativaEsperaMinutos);
      setLoading(false);
    } else {
      if (senhaData?.id !== undefined) {
        buscarStatusSenha(senhaData.id);
      }
    }

    console.log("Iniciando conexão WebSocket...");
    const socket = new SockJS("http://107.178.213.151:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Conectado ao WebSocket com sucesso");
        stompClient.subscribe("/topic/fila/atualizacao", (message) => {
          console.log("Mensagem recebida:", message.body);
          processarAtualizacao({ body: message.body });
        });
      },
      onDisconnect: () => {
        console.log("Desconectado do WebSocket");
      },
      onStompError: (frame) => {
        console.error("Erro no WebSocket:", frame);
        setTimeout(() => {
          console.log("Tentando reconectar...");
          stompClient.activate();
        }, 5000);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.activate();

    return () => {
      console.log("Desconectando WebSocket...");
      stompClient.deactivate();
    };
  }, [processarAtualizacao]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    carregarDados();
  }, []);

  // useEffect(() => {
  //   carregarHistorico();
  //   formatarTempo(tempoRestante);
  // }, [formatarTempo(tempoRestante)]);

  useEffect(() => {
    if (senha === senhaChamada) {
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
      pulseAnim.setValue(1);
    }
  }, [senhaChamada]);

  const buscarStatusSenha = async (senhaId: number) => {
    try {
      console.log("Buscando status da senha:", senhaId);
      const response = await axios.get(
        `http://107.178.213.151:8080/api/senhas/${senhaId}/status`
      );
      console.log("Resposta do status:", response.data);

      if (!response.data) {
        console.error("Dados da senha não encontrados");
        setLoading(false);
        return;
      }

      const data = response.data;
      setSenhaStatus(data);
      setMinhaPosicao(data.posicaoFila);
      setEstimativaTempo(data.estimativaEsperaMinutos);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar status da senha:", error);
      if (axios.isAxiosError(error)) {
        console.error("Detalhes do erro:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    senhaData?.id && buscarStatusSenha(Number(senhaData?.id) || 0);
  }, [senhaData]);
  useEffect(() => {
    if (showOverlay) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound();
    }
  }, [showOverlay]);

  if (showOverlay) {
    return (
      <View style={styles.centeredContainer} key={updateKey}>
        <Animated.View
          style={[styles.highlightCard, { transform: [{ scale: pulseAnim }] }]}
        >
          <Text style={styles.suaVezTitulo}>Sua vez! Vá para o guichê.</Text>
          <Text style={styles.password}>{senhaChamada}</Text>
          <Text style={styles.guiche}>Guichê 01</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {nome && <Text style={styles.welcomeText}>Bem-vindo(a), {nome}</Text>}

      <Text style={styles.sectionTitle}>SENHA ATUAL</Text>

      <Animated.View
        style={[
          styles.card,
          senha === senhaChamada && {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={handlePress}>
          <Text style={styles.tipo}>
            {current?.type === "prioritary" ? "Prioridade" : "Normal"}
          </Text>
          <Text style={styles.password}>
            {(senhaChamada ||
              estadoFila.historico[estadoFila.historico.length - 1]?.codigo) ??
              "---"}
          </Text>
        </TouchableWithoutFeedback>
        <Text style={styles.guiche}>Guichê 01</Text>
      </Animated.View>

      {/* Contador do Schedule */}
      {clicks >= 6 && scheduleInfo && scheduleInfo.chamadaAutomaticaAtiva && (
        <div className="schedule-counter">
          <h3>
            {isChamandoSenha
              ? "Chamando próxima senha..."
              : "Próxima chamada automática em:"}
          </h3>
          <div className="countdown-timer">
            <span
              className={`timer-value ${isChamandoSenha ? "chamando" : ""}`}
            >
              {isChamandoSenha ? "00:00" : formatarTempo(tempoRestante)}
            </span>
          </div>
          <p className="schedule-info">
            {scheduleInfo.senhasAguardando} senha(s) aguardando atendimento
          </p>
          {isChamandoSenha && (
            <p className="chamada-status">
              ⏳ Processando chamada automática...
            </p>
          )}
        </div>
      )}

      <View style={styles.row}>
        <View style={[styles.card, styles.lightCard, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>PREVISÃO DE CHAMADA</Text>
          <Text style={styles.timer}>
            {estimativaTempo || senhaData?.estimativaEsperaMinutos || "--"} min
          </Text>
        </View>

        <View style={[styles.card, styles.lightCard, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>MINHA SENHA</Text>
          <Text style={styles.timer}>
            {carregandoSenha ? "--" : senha ?? "--"}
          </Text>
          <Text style={styles.unidade}>
            {carregandoSenha
              ? "Carregando..."
              : senhaData?.codigo
              ? `Posição na fila: ${senhaData?.posicaoFila}`
              : "Nenhuma retirada"}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>ÚLTIMAS SENHAS</Text>
      <View style={styles.row}>
        {lastTwo.map((item, index) => (
          <View
            key={`${item.codigo}-${index}`}
            style={[styles.smallCard, styles.lightCard]}
          >
            <Text style={styles.tipo}>
              {item.codigo.includes("P") ? "PRIORIDADE" : "NORMAL"}
            </Text>
            <Text style={styles.timer}>{item.codigo}</Text>
            <Text style={styles.guiche}>Guichê 01</Text>
          </View>
        ))}
      </View>

      <View style={styles.button}>
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
              onPress={() => handleChooseType("NORMAL")}
            />
            <Button
              title="🚨 Senha Prioritária"
              onPress={() => handleChooseType("PRIORITARIO")}
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
    overflow: "scroll",
  },
  button: {
    marginTop: 32,
    width: "95%",
    maxWidth: 600,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 12,
    color: "#1F2937",
  },
  card: {
    backgroundColor: "#EFF6FF",
    width: "95%",
    maxWidth: 600,
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
    fontSize: 36,
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
    padding: 16,
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
  welcomeText: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 12,
    color: "#374151",
  },
});
