import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleSheet,
} from "react-native";

interface InputProps extends TextInputProps {
  error?: string;
}

export default function Input({ error, ...rest }: InputProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <TextInput style={[styles.input, error && styles.inputError]} {...rest} />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  inputError: {
    borderColor: "#EF4444", // vermelho de erro
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
});
