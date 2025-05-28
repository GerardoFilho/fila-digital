import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PasswordType = "normal" | "prioritary";

interface FilaItem {
  password: string; // N001 ou P001
  email: string;
  type: PasswordType;
}

interface QueueContextData {
  queue: FilaItem[];
  currentPassword: string | null;
  addPassword: (email: string, type: PasswordType) => void;
  nextPassword: () => void;
  resetQueue: () => void;
}

const QueueContext = createContext({} as QueueContextData);

export const QueueProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<FilaItem[]>([]);
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    const stored = await AsyncStorage.getItem("@fila:queue");
    if (stored) {
      const parsed = JSON.parse(stored);
      setQueue(parsed);
      if (parsed.length > 0) setCurrentPassword(parsed[0].password);
    }
  }

  async function persistQueue(updatedQueue: FilaItem[]) {
    await AsyncStorage.setItem("@fila:queue", JSON.stringify(updatedQueue));
  }

  function generateNextNumber(type: PasswordType): string {
    const filtered = queue.filter((item) => item.type === type);
    const last =
      filtered.length > 0 ? filtered[filtered.length - 1].password : null;

    const next = last ? parseInt(last.slice(1)) + 1 : 1;

    const prefix = type === "normal" ? "N" : "P";
    return prefix + String(next).padStart(3, "0");
  }

  function addPassword(email: string, type: PasswordType) {
    // Verifica se já existe senha ativa para esse e-mail
    const exists = queue.find((item) => item.email === email);
    if (exists) return;

    const password = generateNextNumber(type);
    const newItem: FilaItem = { password, email, type };

    const updatedQueue = [...queue, newItem];
    setQueue(updatedQueue);
    persistQueue(updatedQueue);

    if (!currentPassword) setCurrentPassword(password);
  }

  function nextPassword() {
    if (queue.length <= 1) return;

    const remainingQueue = queue.slice(1);
    setQueue(remainingQueue);
    setCurrentPassword(remainingQueue[0]?.password ?? null);
    persistQueue(remainingQueue);
  }

  function resetQueue() {
    setQueue([]);
    setCurrentPassword(null);
    AsyncStorage.removeItem("@fila:queue");
  }

  return (
    <QueueContext.Provider
      value={{
        queue,
        currentPassword,
        addPassword,
        nextPassword,
        resetQueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => useContext(QueueContext);
