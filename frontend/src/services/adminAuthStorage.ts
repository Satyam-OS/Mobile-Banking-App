import AsyncStorage from "@react-native-async-storage/async-storage";

const ADMIN_TOKEN_KEY = "ADMIN_TOKEN";

export const adminAuthStorage = {
  saveToken: async (token: string) => {
    await AsyncStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  getToken: async () => {
    return await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
  },
  removeToken: async () => {
    await AsyncStorage.removeItem(ADMIN_TOKEN_KEY);
  },
};
