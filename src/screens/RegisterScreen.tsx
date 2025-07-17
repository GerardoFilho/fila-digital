import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "../components/Button";
import Input from "../components/Input";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

const schema = yup
  .object({
    name: yup
      .string()
      .min(3, "Mínimo 3 caracteres")
      .required("Nome é obrigatório"),
    email: yup.string().email("E-mail inválido").required("E-mail obrigatório"),
    password: yup
      .string()
      .min(6, "Mínimo 6 caracteres")
      .required("Senha obrigatória"),
  })
  .required();

async function registerUser(nome: string) {
  try {
    const response = await fetch("http://107.178.213.151:8080/api/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao cadastrar");
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  async function onSubmit(data: any) {
    try {
      setLoading(true);
      await registerUser(data.name);
      setTimeout(() => {
        setLoading(false);
        setSuccessModal(true);
      }, 1000);
    } catch (error: any) {
      setLoading(false);
      alert(error.message || "Erro ao cadastrar");
    }
  }

  function closeModal() {
    setSuccessModal(false);
    navigation.goBack();
  }

  return (
    <LinearGradient
      colors={["#fff", "#fff", "#fff", "#1125e0"]}
      style={styles.container}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Cadastro</Text>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Nome"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Senha"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        <Button
          title="Cadastrar"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        />

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Voltar para o Login</Text>
        </TouchableOpacity>

        {/* Modal de Sucesso */}
        <Modal visible={successModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🎉 Cadastro Realizado!</Text>
              <Text style={styles.modalText}>Você já pode fazer login.</Text>
              <Button title="OK" onPress={closeModal} />
            </View>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#3a50d4",
  },
  backButton: {
    marginTop: 16,
    color: "#4F46E5",
    textAlign: "center",
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
  },
  modalText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 24,
    textAlign: "center",
  },
});
