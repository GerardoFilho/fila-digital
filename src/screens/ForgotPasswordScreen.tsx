import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";

const schema = yup
  .object({
    email: yup.string().email("E-mail inválido").required("E-mail obrigatório"),
  })
  .required();

export default function ForgotPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const navigation = useNavigation<any>();

  async function onSubmit(data: any) {
    Alert.alert(
      "Redefinição enviada",
      `Se esse e-mail existir, enviamos as instruções para: ${data.email}`
    );
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Esqueci minha senha</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Digite seu e-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
          />
        )}
      />

      <Button title="Enviar Redefinição" onPress={handleSubmit(onSubmit)} />

      {/* Botão de Voltar */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>Voltar para o Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#111827",
  },
  backButton: {
    marginTop: 16,
    color: "#4F46E5",
    textAlign: "center",
    fontSize: 14,
  },
});
