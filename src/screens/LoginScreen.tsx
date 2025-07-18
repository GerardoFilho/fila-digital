import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import Button from "../components/Button";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { TextInput } from "react-native-gesture-handler";

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<any>();
  const { control, handleSubmit } = useForm();

  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  async function onSubmit(data: any) {
    try {
      setLoading(true);
      await login(data.email);
    } catch (err) {
      setErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={["#fff", "#fff", "#fff", "#1125e0"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          style={styles.image}
          contentFit="contain"
          transition={2000}
          source={require("../../assets/filaDigitalAzul.png")}
        />
        <Text style={styles.title}>BEM-VINDO!</Text>
        <Text style={styles.subtitle}>
          Insira seus dados para utilizar o sistema de senhas
        </Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#3a50d4"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Usuário"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#3a50d4"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#999"
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
            </View>
          )}
        />

        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Link href="/dashboard">
            <Text style={styles.buttonText} onPress={handleSubmit(onSubmit)}>
              ENTRAR
            </Text>
          </Link>
        </TouchableOpacity>

        <View style={styles.linkWrapper}>
          <Text style={styles.linkQuestion}>Quer obter uma senha? </Text>

          <TouchableOpacity onPress={() => navigation.navigate("Cadastro")}>
            <Text style={styles.linkText}>Cadastre-se aqui</Text>
          </TouchableOpacity>
        </View>
        {/* Modal de erro */}
        <Modal visible={errorModal} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Erro no login</Text>
              <Text style={styles.modalText}>Usuário ou senha inválidos.</Text>
              <Button
                title="Tentar novamente"
                onPress={() => setErrorModal(false)}
              />
            </View>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     justifyContent: "center",
//     backgroundColor: "#F9FAFB",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 24,
//     textAlign: "center",
//     color: "#111827",
//   },
//   linkText: {
//     marginTop: 16,
//     color: "#4F46E5",
//     textAlign: "center",
//     fontSize: 14,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#FFF",
//     padding: 32,
//     borderRadius: 16,
//     alignItems: "center",
//     width: "80%",
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 12,
//     color: "#DC2626",
//   },
//   modalText: {
//     fontSize: 16,
//     color: "#374151",
//     marginBottom: 24,
//     textAlign: "center",
//   },
// });

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    // Centraliza tudo na tela
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#3a50d4",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#3a50d4",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#3a50d4",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#333",
  },
  image: {
    width: 250,
    height: 150,
    marginTop: 10,
  },
  forgotContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: "#3a50d4",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#3a50d4",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  linkWrapper: {
    flexDirection: "row",
    marginBottom: 6,
  },
  linkQuestion: {
    color: "rgb(58, 80, 212)",
    fontSize: 14,
  },
  linkText: {
    color: "rgb(58, 80, 212)",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#DC2626",
  },
  modalText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 24,
    textAlign: "center",
  },
});
