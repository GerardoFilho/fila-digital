import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FilaItem = {
  password: string;
  email: string;
};

interface QueueContextData {
  queue: FilaItem[];
  currentPassword: string | null;
  addPassword: (email: string) => void;
  nextPassword: () => void;
  resetQueue: () => void;
}

const STORAGE_KEY = "@fila:queue";

const QueueContext = createContext({} as QueueContextData);

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<FilaItem[]>([]);

  const currentPassword = queue.length > 0 ? queue[0].password : null;

  // Carrega a fila salva ao iniciar
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setQueue(JSON.parse(stored));
      }
    })();
  }, []);

  // Salva a fila sempre que mudar
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }, [queue]);

  function addPassword(email: string) {
    // Evita duplicação: se o email já existe na fila, não adiciona de novo
    const alreadyInQueue = queue.find((item) => item.email === email);
    if (alreadyInQueue) return;

    const nextNumber =
      queue.length > 0 ? parseInt(queue[queue.length - 1].password) + 1 : 1;
    const newPassword = String(nextNumber).padStart(3, "0");

    const newItem: FilaItem = { password: newPassword, email };
    setQueue((prev) => [...prev, newItem]);
  }

  function nextPassword() {
    setQueue((prev) => prev.slice(1));
  }

  function resetQueue() {
    setQueue([]);
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
}

export function useQueue() {
  return useContext(QueueContext);
}
