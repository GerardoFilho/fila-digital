import { createContext, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextData {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role?: "admin" | "user"
  ) => Promise<void>;
  logout: () => Promise<void>;
}

interface User {
  email: string;
  name: string;
  role: "admin" | "user";
}

const AuthContext = createContext({} as AuthContextData);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);

  async function login(email: string, password: string) {
    const storedUsers = await AsyncStorage.getItem("users");
    const users = storedUsers ? JSON.parse(storedUsers) : [];

    const found = users.find(
      (u: User & { password: string }) =>
        u.email === email && u.password === password
    );

    if (found) {
      setUser({
        email: found.email,
        name: found.name,
        role: found.role,
      });
    } else {
      throw new Error("Invalid credentials");
    }
  }

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
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
