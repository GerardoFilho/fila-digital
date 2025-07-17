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
  password: string;
  email: string;
  type: PasswordType;
}

interface QueueContextData {
  queue: FilaItem[];
  currentPassword: string | null;
  addPassword: (email: string, type: PasswordType) => void;
  nextPassword: () => void;
  resetQueue: () => void;
  visibleQueue: (email: string, isAdmin: boolean) => FilaItem[];
  calledPasswords: FilaItem[]; // novo
}

const QueueContext = createContext({} as QueueContextData);

export const QueueProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<FilaItem[]>([]);
  const [calledPasswords, setCalledPasswords] = useState<FilaItem[]>([]);
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

  function visibleQueue(email: string, isAdmin: boolean): FilaItem[] {
    if (isAdmin) return queue;

    if (!currentPassword) return [];

    const currentValue = parseInt(currentPassword.slice(1));
    const currentPrefix = currentPassword[0];

    return queue.filter((item) => {
      const itemValue = parseInt(item.password.slice(1));
      return (
        item.email === email &&
        item.type === "normal" &&
        item.password[0] === currentPrefix &&
        itemValue <= currentValue
      );
    });
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

    const [called, ...remainingQueue] = queue;
    setQueue(remainingQueue);
    setCurrentPassword(remainingQueue[0]?.password ?? null);
    setCalledPasswords((prev) => [...prev, called]);
    persistQueue(remainingQueue);
  }

  function resetQueue() {
    setQueue([]);
    setCurrentPassword(null);
    setCalledPasswords([]);
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
        visibleQueue,
        calledPasswords,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => useContext(QueueContext);
