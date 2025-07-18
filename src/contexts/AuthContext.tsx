import { createContext, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AtendimentoService } from "../services/AtendimentoService";

interface AuthContextData {
  user: User | null;
  senhaData: SenhaData | null;
  estadoFila: EstadoFila;
  login: (email: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role?: "admin" | "user"
  ) => Promise<void>;
  logout: () => Promise<void>;
  senhaAtivaExecute: (data: string) => Promise<void>;
  carregarDados: () => Promise<void>;
}

interface SenhaData {
  id: number;
  codigo: string;
  numero: number;
  posicaoFila: number;
  estimativaEsperaMinutos: number;
  status: string;
  prioridade: string;
  inicioAtendimento?: string;
  fimAtendimento?: string;
}

interface SenhaAtual {
  codigo: string;
  numero: number;
  status: string;
}

interface HistoricoSenha {
  codigo: string;
  status: string;
  horario: string;
}

interface InfoFila {
  senhasAguardandoNormal: number;
  senhasAguardandoPrioritario: number;
}

interface EstadoFila {
  loading: boolean;
  senhaNormal: SenhaAtual | null;
  senhaPrioritaria: SenhaAtual | null;
  infoFila: InfoFila | null;
  historico: HistoricoSenha[];
  error: string | null;
}

interface User {
  id: string;
  nome: string;
  role: "admin" | "user";
}

const AuthContext = createContext({} as AuthContextData);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [senhaData, setSenhaData] = useState<SenhaData | null>(null);

  const [estadoFila, setEstadoFila] = useState<EstadoFila>({
    loading: true,
    senhaNormal: null,
    senhaPrioritaria: null,
    infoFila: null,
    historico: [],
    error: null,
  });

  async function senhaAtivaExecute(id: string) {
    console.log("Executando senhaAtivaExecute com ID:", id);
    const senhaResponse = await fetch(
      `http://107.178.213.151:8080/api/senhas/ativa?usuarioId=${id}`
    );

    if (senhaResponse.status === 200) {
      const senhaData = await senhaResponse.json();
      console.log(senhaData);
      setSenhaData(senhaData);
    }
  }
  async function login(email: string) {
    console.log("Iniciando login com email:", email);
    const response = await fetch(
      `http://107.178.213.151:8080/api/usuarios?nome=${encodeURIComponent(
        email
      )}`
    );

    if (!response.ok) {
      console.log("RESPONSE ERRO", response);

      throw new Error("Usuário não encontrado");
    }

    const data = await response.json();
    setUser(data);
    await AsyncStorage.setItem("usuarioId", `${data.id}`);
    await AsyncStorage.setItem("nomeUsuario", data.nome);

    // Verifica se já possui senha ativa
    senhaAtivaExecute(data.id);
    return data;
  }

  const carregarDados = async () => {
    try {
      // Atualiza o estado para indicar que está carregando
      setEstadoFila((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      // Carrega os dados simultaneamente
      const [senhaNormalData, infoFilaData, historicoData] = await Promise.all([
        AtendimentoService.getSenhaAtual(),
        AtendimentoService.getInfoFila(),
        AtendimentoService.getHistoricoSenhas(),
      ]);

      // Atualiza o estado com os dados carregados
      setEstadoFila((prev) => ({
        ...prev,
        loading: false,
        senhaNormal: senhaNormalData,
        infoFila: infoFilaData,
        historico: historicoData,
      }));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);

      // Caso ocorra um erro, atualiza o estado com a mensagem de erro
      setEstadoFila((prev) => ({
        ...prev,
        loading: false,
        error: "Erro ao carregar dados. Tente novamente mais tarde.",
      }));
    }
  };

  async function register(
    email: string,
    password: string,
    name: string,
    role: "admin" | "user" = "user"
  ) {
    const storedUsers = await AsyncStorage.getItem("users");
    const users = storedUsers ? JSON.parse(storedUsers) : [];

    // Evita cadastro duplicado
    const exists = users.find((u: { email: string }) => u.email === email);
    if (exists) {
      throw new Error("E-mail já cadastrado");
    }

    users.push({ email, password, name, role });
    await AsyncStorage.setItem("users", JSON.stringify(users));
  }

  async function logout() {
    setUser(null);
    setSenhaData(null);

    setEstadoFila({
      loading: true,
      senhaNormal: null,
      senhaPrioritaria: null,
      infoFila: null,
      historico: [],
      error: null,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        estadoFila,
        login,
        senhaData,
        register,
        logout,
        senhaAtivaExecute,
        carregarDados,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
