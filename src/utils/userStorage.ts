import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@fila:user-passwords';

export async function saveUserPassword(email: string, password: string) {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const data = stored ? JSON.parse(stored) : {};
  data[email] = password;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function getUserPassword(email: string): Promise<string | null> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const data = stored ? JSON.parse(stored) : {};
  return data[email] ?? null;
}

export async function clearUserPassword(email: string) {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const data = stored ? JSON.parse(stored) : {};
  delete data[email];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
