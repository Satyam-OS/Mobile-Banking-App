import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_TOKEN = "USER_TOKEN";
const ADMIN_TOKEN = "ADMIN_TOKEN";

export const authStorage = {
  saveUserToken: async (token: string) =>
    AsyncStorage.setItem(USER_TOKEN, token),

  saveAdminToken: async (token: string) =>
    AsyncStorage.setItem(ADMIN_TOKEN, token),

  getUserToken: async () => AsyncStorage.getItem(USER_TOKEN),

  getAdminToken: async () => AsyncStorage.getItem(ADMIN_TOKEN),

  clearAll: async () => {
    await AsyncStorage.multiRemove([USER_TOKEN, ADMIN_TOKEN]);
  },
};
